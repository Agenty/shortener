import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { Home } from '../theme/home';
import { SiteData } from '../models/siteData';
import { Pricing } from '../theme/pricing';
import { About, Privacy, Terms } from '../theme/about';
import { Contact } from '../theme/contact';
import { contactEmail } from '../services/emailer.service';
import { Inquiry } from '../models/inquiry';
import { getSite } from '../services/discourse.service';
import { Error404 } from '../theme/error';
import { LifetimeDeal } from '../theme/lifetime-deal';
import { ReportaUrl } from '../theme/report';
import { Unsubscribe } from '../theme/unsubscribe';
import { unsubscribe } from '../services/auth.service';
import {
  getComparison,
  getCompetitor,
  getCompetitors,
} from '../services/spreadsheet.service';
import { AlternativeDetail, AlternativeList } from '../theme/alternative';
import mime from 'mime';
import { BioPages } from '../theme/products/bio-page';
import { ShortLinks } from '../theme/products/short-links';
import { QrCodes } from '../theme/products/qr-code';

const website = new Hono<{ Bindings: Bindings }>();

website.get('/', async (ctx) => {
  const { cf } = ctx.req.raw;
  const data = [
    {
      key: 'github',
      url: 'https://github.com/dayschedule/idm',
      short_url: `https://idm.in/github`,
      params: {
        utm_campaign: 'website',
      },
      created_at: new Date(),
    },
  ];

  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title: 'URL Shortener - Short Link Generator and Analytics',
      description:
        'Open-source short link generator to shorten long url with custom expiration, branded links, click tracking, analytics and API',
      canonical: '/',
      country: cf.country,
    },
    links: data,
    article: {
      categories: topics.slice(0, 3),
    },
    script: '/url-shortener.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  return ctx.html(Home(props));
});

website.get('/bio-pages-builder', async (ctx) => {
  const { cf } = ctx.req.raw;
  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title: 'Create your personalized bio page in 30 seconds',
      description:
        'Bio pages builder to create professional bio pages in minutes with social links, custom background, logo, unlimited links and analytics.',
      canonical: '/bio-pages-builder',
      country: cf.country,
    },
    article: {
      categories: topics.slice(0, 3),
    },
  };
  return ctx.html(BioPages(props));
});

website.get('/short-links-builder', async (ctx) => {
  const { cf } = ctx.req.raw;
  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title:
        'Short link builder with advanced click tracking and performance metrics',
      description:
        'Generate custom short links with advanced click tracking, detailed analytics, and geo-targeting to redirect the users based on their location.',
      canonical: '/short-links-builder',
      country: cf.country,
    },
    article: {
      categories: topics.slice(0, 3),
    },
  };
  return ctx.html(ShortLinks(props));
});

website.get('/qr-code-builder', async (ctx) => {
  const { cf } = ctx.req.raw;
  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title: 'All-in-one QR Code Generater for businesses',
      description:
        'Generate customizable dynamic QR codes with real-time scan tracking features to find number of scans, insights and reports.',
      canonical: '/qr-code-builder',
      country: cf.country,
    },
    article: {
      categories: topics.slice(0, 3),
    },
  };
  return ctx.html(QrCodes(props));
});

website.get('/pricing', async (ctx) => {
  const { cf } = ctx.req.raw;
  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title: 'Pricing',
      description:
        'Shorten your links for free or choose a plan for advanced features and API access, the pricing starts from $7 per month.',
      canonical: '/pricing',
      country: cf.country,
    },
    article: {
      categories: topics.slice(0, 3),
    },
  };
  return ctx.html(Pricing(props));
});

website.get('/about', async (ctx) => {
  const { cf } = ctx.req.raw;
  const topics = await getSite(ctx.env);
  const props: SiteData = {
    meta: {
      title: 'About us',
      description:
        'IDM (Inter Digital Marketing) - a centralized platform for URL shortening and centralized analytics. Learn how IDM streamline marketing strategies for enhanced performance and productivity for marketing teams.',
      canonical: '/about',
      country: cf.country,
    },
    article: {
      categories: topics.slice(0, 3),
    },
  };
  return ctx.html(About(props));
});

website.get('/alternatives', async (ctx) => {
  const competitors = await getCompetitors(ctx.env);
  const props: SiteData = {
    meta: {
      title: `Top ${
        competitors.length
      } URL shortening softwares in ${new Date().getFullYear()}`,
      description: `Find the best URL shortener software with our list of the top ${competitors.length} tools. Compare pricing, features, and user reviews to choose the perfect software to shorten your links.`,
      canonical: `/alternatives`,
    },
  };
  return ctx.html(AlternativeList(props, competitors));
});

website.get('/alternatives/:id', async (ctx) => {
  const slug = ctx.req.param('id');
  const competitor = await getCompetitor(ctx.env, slug);
  if (!competitor) {
    const props: SiteData = {
      meta: {
        title: 'Error',
        description: '404 - No page found',
        canonical: '/error',
      },
    };
    return ctx.html(Error404(props, 'No page found'), 404);
  }
  const comparison = await getComparison(ctx.env, competitor.name);
  const props: SiteData = {
    meta: {
      title: `${competitor.name} Alternative`,
      description: `Idm.in is a best alternative for ${competitor.name} at $7 per month with link analytics, click tracking and QR codes. Compare ${competitor.name} features and prices...`,
      canonical: competitor.path,
    },
  };
  return ctx.html(AlternativeDetail(props, competitor, comparison));
});

website.get('/terms', async (ctx) => {
  const { cf } = ctx.req.raw;
  const props: SiteData = {
    meta: {
      title: 'Terms of service',
      description:
        'By accessing the IDM website, software, services, or API you agree to comply with the terms of use outlined below.',
      canonical: '/terms',
      country: cf.country,
    },
  };
  return ctx.html(Terms(props));
});

website.get('/privacy', async (ctx) => {
  const { cf } = ctx.req.raw;
  const props: SiteData = {
    meta: {
      title: 'Privacy Policy',
      description:
        'By accessing the IDM website, software, services, or API you agree to our privacy policy outlined below.',
      canonical: '/privacy',
      country: cf.country,
    },
  };
  return ctx.html(Privacy(props));
});

website.get('/lifetime-deal', async (ctx) => {
  const { cf } = ctx.req.raw;
  const props: SiteData = {
    meta: {
      title: 'Lifetime Deal: URL shortener software',
      description:
        'Get lifetime deal for URL shortener software with advanced features like custom expiration, UTM builder, social preview, password protection, QR code, device and geo-targeting.',
      canonical: '/lifetime-deal',
      country: cf.country,
    },
  };
  return ctx.html(LifetimeDeal(props));
});

website.get('/contact', async (ctx) => {
  const { cf } = ctx.req.raw;
  const props: SiteData = {
    meta: {
      title: 'Contact us',
      description:
        'Contact the IDM team to ask questions and general support about the product and our URL shortern software for custom links',
      canonical: '/contact',
      country: cf.country,
    },
    script: '/contact.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  return ctx.html(Contact(props));
});

website.post('/contact', async (ctx) => {
  const json: Inquiry = await ctx.req.json();
  const ip = ctx.req.header('CF-Connecting-IP');
  await contactEmail(ctx, json);
  return ctx.json({ message: 'Ticket submitted successfully' }, 200);
});

website.get('/report', async (ctx) => {
  const props: SiteData = {
    meta: {
      title: 'Report a URL',
      description:
        'If you believe a short link is being used for phishing, or malicious purposes, please report it to us by filling out the form below.',
      canonical: '/report',
    },
    script: '/report.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  return ctx.html(ReportaUrl(props));
});

website.get('/error', async (ctx) => {
  const reason = ctx.req.query('reason');
  const props: SiteData = {
    meta: {
      title: 'Error',
      description: '404 - No page found',
      canonical: '/error',
    },
  };
  return ctx.html(Error404(props, reason));
});

website.get('/unsubscribe', async (ctx) => {
  const email = ctx.req.query('email');
  const uuid = ctx.req.query('uuid');
  const props: SiteData = {
    meta: {
      title: 'Unsubscribe',
      description: 'Email unsubscribed, we are sorry to see you go!',
      canonical: '/unsubscribe',
    },
  };
  ctx.executionCtx.waitUntil(unsubscribe(ctx.env, email, uuid));
  return ctx.html(Unsubscribe(props));
});

website.get('/img/*', async (ctx) => {
  const { routePath, path } = ctx.req;
  const filePath = path.replace(routePath.replace('*', ''), '');
  const object = await ctx.env.BUCKET.get(filePath);
  if (!object) {
    return ctx.json(
      {},
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=14400, s-maxage=86400',
        },
      }
    );
  } else {
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    const mimeType = mime.getType(filePath);
    return ctx.body(object.body, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=14400, s-maxage=86400',
      },
    });
  }
});

export { website };
