import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { SiteData } from '../models/siteData';
import { SocialPreview } from '../theme/tools/social-preview';
import { WhatsappLink } from '../theme/tools/whatsapp-link-generator';
import { LinkShortenerTool, Tool } from '../theme/tools/shortener';
import { SpotifyLinkShortener } from '../theme/tools/spotify-link-shortener';

const tools = new Hono<{ Bindings: Bindings }>();

tools.get('/social-share-preview', async (ctx) => {
  const props: SiteData = {
    meta: {
      title: 'Social share preview generator',
      description:
        'Social share preview generator to test how your link will appear on social media apps like Twitter, Facebook, LinkedIn, and Instagram',
      canonical: '/tools/social-share-preview',
    },
    script: '/social-share-preview.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  return ctx.html(
    SocialPreview(props, {
      title: 'Create short link with idm.in',
      description:
        'idm.in is a free short link generator to create short trackable links, QR code integration and analytics for all your online campaigns',
      image: 'https://idm.in/static/img/url-shortener-api.png',
      domain: 'idm.in',
    })
  );
});

tools.get('/whatsapp-link-generator', async (ctx) => {
  const props: SiteData = {
    meta: {
      title: 'Whatsapp link generator',
      description:
        'Generate a trackable WhatsApp link to share online or embed on your website chatbox. Track clicks for engagement analytics using the short whatsapp link.',
      canonical: '/tools/whatsapp-link-generator',
    },
    script: '/whatsapp-link-generator.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  return ctx.html(WhatsappLink(props));
});

tools.get('/chatgpt-link-shortener', async (ctx) => {
  const data = [
    {
      key: 'dall-e',
      url: 'https://chat.openai.com/g/g-2fkFE8rbu-dall-e',
      short_url: `https://idm.in/dall-e`,
    },
  ];
  const props: SiteData = {
    meta: {
      title: 'ChatGPT link shortener',
      description:
        'Custom ChatGPT link shortener to track plugin clicks, referral and locations for all your GPT visitors using the free URL shortening service.',
      canonical: '/tools/chatgpt-link-shortener',
    },
    links: data,
    script: '/url-shortener.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  const tool: Tool = {
    name: 'ChatGPT link shortener',
    description:
      'Custom ChatGPT link shortener to track plugin clicks, referral and locations for all your GPT visitors using the free URL shortening service.',
  };
  return ctx.html(LinkShortenerTool(props, tool));
});

tools.get('/amazon-link-shortener', async (ctx) => {
  const data = [
    {
      key: 'iphone',
      url: 'https://www.amazon.com/Apple-iPhone-Fully-Unlocked-5-8/dp/B075QN8NDH/',
      short_url: `https://idm.in/iphone`,
    },
  ];
  const props: SiteData = {
    meta: {
      title: 'Amazon link shortener',
      description:
        'Amazon link shortener to shorten the product URLs and enable tracking. Start monitoring the clicks from your website or blog to maximize affiliate earnings and performance improvement.',
      canonical: '/tools/amazon-link-shortener',
    },
    links: data,
    script: '/url-shortener.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  const tool: Tool = {
    name: 'Amazon link shortener',
    description:
      'Amazon url shortener to shorten the product URLs and enable tracking. Start monitoring the clicks from your website or blog to maximize affiliate earnings and analyze performance metrics.',
  };
  return ctx.html(LinkShortenerTool(props, tool));
});

tools.get('/spotify-link-shortener', async (ctx) => {
  const data = [
    {
      key: 'diljit',
      url: 'https://open.spotify.com/artist/2FKWNmZWDBZR4dE5KX4plR',
      short_url: `https://idm.in/diljit`,
    },
  ];
  const props: SiteData = {
    meta: {
      title: 'Spotify link shortener',
      description:
        'Spotify link shortener to share music and podcasts with short, trackable URLs. Using the built-in tracking features, users can monitor clicks, locations, and audience engagement for their Spotify content',
      canonical: '/tools/spotify-link-shortener',
    },
    links: data,
    script: '/url-shortener.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  const tool: Tool = {
    name: 'Spotify link shortener',
    description:
      'Spotify link shortener to share music and podcasts with short, trackable URLs. Using the built-in tracking features, users can monitor clicks, locations, and audience engagement for their Spotify content.',
  };
  return ctx.html(SpotifyLinkShortener(props, tool));
});

tools.get('/linkedin-link-shortener', async (ctx) => {
  const data = [
    {
      key: 'vr',
      url: 'https://www.linkedin.com/in/vikashrathee/',
      short_url: `https://idm.in/vr`,
    },
  ];
  const props: SiteData = {
    meta: {
      title: 'LinkedIn link shortener',
      description:
        'LinkedIn url shortener to create short profile links, articles, and updates. With built-in analytics, users can track clicks, profile views, and referral to improve their networking efforts.',
      canonical: '/tools/linkedin-link-shortener',
    },
    links: data,
    script: '/url-shortener.js',
    prod: ctx.env.ENVIRONMENT == 'production',
  };
  const tool: Tool = {
    name: 'LinkedIn link shortener',
    description:
      'LinkedIn url shortener to create short profile links, articles, and updates. With built-in analytics, users can track clicks, profile views, and referral to improve their networking efforts.',
  };
  return ctx.html(LinkShortenerTool(props, tool));
});

export { tools };
