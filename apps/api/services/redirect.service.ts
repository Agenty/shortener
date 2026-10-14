import { Context } from 'hono';
import { Bindings } from '../types/bindings';
import { setAnalytics } from './analytics.service';
import dayjs from 'dayjs';
import UAParser from 'ua-parser-js';
import { isValidUrl } from '../helper/utility';
import { getCachedLink } from './links.service';
import { LinkType, LinkStatus } from '../models/baselink';
import mime from 'mime';
import { Password } from '../theme/password';
import { bioPage } from '../theme/bio';
import { getCookie } from 'hono/cookie';

const whiteList = ['idm.in', 'idm.li'];

export const redirectHandler = async (
  ctx: Context<{
    Bindings: Bindings;
  }>,
  path: string
) => {
  const key = path.split('/').pop();
  const erroUri = 'https://idm.in/error?reason=404';
  if (!key || key.length > 512) {
    return ctx.redirect(erroUri, 302);
  }

  // Static examples
  if (key == 'github') {
    return ctx.redirect('https://github.com/dayschedule/idm', 302);
  }

  const authCookie = getCookie(ctx, 'auth_token');
  const cacheTtl = authCookie ? 0 : 300;
  const link = await getCachedLink(ctx.env, key, cacheTtl);
  if (!link) {
    return ctx.redirect(erroUri, 302);
  }

  const { cf, headers } = ctx.req.raw;
  const parser = new UAParser(headers.get('user-agent'));
  const parseResult = parser.getResult();
  const referer = headers.get('referer');
  const ip = headers.get('CF-Connecting-IP');

  if (link.type == LinkType.link) {
    if (!link.url) {
      return ctx.redirect(erroUri, 302);
    }

    const uri = new URL(link.url);
    if (
      link.status == LinkStatus.blocked &&
      !whiteList.includes(uri.hostname)
    ) {
      return ctx.redirect('https://idm.in/error?reason=blocked', 302);
    }

    if (link.expire_at && dayjs(link.expire_at).isBefore(dayjs())) {
      return ctx.redirect('https://idm.in/error?reason=expired', 302);
    }

    const pw = ctx.req.query('pw');
    if (link.password && link.password.length && link.password != pw) {
      ctx.html(Password(pw ? 'Please enter a valid password' : ''));
    }

    let url = link.url;

    // Check iOS and Android
    if (parseResult && parseResult.os) {
      if (parseResult.os.name == 'iOS' && isValidUrl(link.ios)) {
        url = link.ios;
      }

      if (parseResult.os.name == 'Android' && isValidUrl(link.android)) {
        url = link.android;
      }
    }

    // Check country
    if (link.geo && link.geo.length >= 1) {
      const region = link.geo.find(
        (x) => x.country && x.country.toUpperCase() == cf.country?.toUpperCase()
      );
      if (region && isValidUrl(region.url)) {
        url = region.url;
      }
    }

    // Set worker analytics
    setAnalytics(ctx.env, link, parseResult, cf, referer, ip);

    // Append utm parameters
    const redirectUrl = appendParamsToURL(url, link.params);
    return ctx.redirect(redirectUrl, 302);
  } else if (link.type == LinkType.qr) {
    const { file, url } = link.data;
    // Set analytics
    setAnalytics(ctx.env, link, parseResult, cf, referer, ip);

    // pdf
    if (file) {
      const object = await ctx.env.BUCKET.get(file);
      if (!object) {
        return ctx.redirect(erroUri, 302);
      } else {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        const mimeType = mime.getType(file);
        return ctx.body(object.body, {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': 'inline',
          },
        });
      }
    } else if (url && isValidUrl(url)) {
      return ctx.redirect(url, 302);
    }
  } else if (link.type == LinkType.page) {
    setAnalytics(ctx.env, link, parseResult, cf, referer, ip);
    return ctx.html(bioPage(link));
  } else {
    if (path.includes('/v1')) {
      return ctx.json({ error: 'No route found' }, 404);
    } else {
      return ctx.redirect(erroUri, 302);
    }
  }
};

const appendParamsToURL = (url: string, params: any) => {
  if (!params) return url;
  const urlObj = new URL(url);
  for (const key in params) {
    urlObj.searchParams.append(key, params[key]);
  }
  return urlObj.toString();
};
