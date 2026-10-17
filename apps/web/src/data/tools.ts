import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Briefcase,
  Camera,
  Clapperboard,
  FolderOpen,
  MessageCircle,
  Music,
  Share2,
  ShoppingCart,
  TvMinimalPlay,
} from 'lucide-react';

export type Faq = { q: string; a: string };

/** A platform-specific landing page that wraps the shared LinkBuilder */
export type ShortenerTool = {
  slug: string;
  platform: string;
  /** Domain of the platform, used for the favicon and URL validation hint */
  domain: string;
  icon: LucideIcon;
  title: string;
  description: string;
  headline: string;
  subhead: string;
  placeholder: string;
  example: { url: string; key: string };
  uses: Array<{ title: string; body: string }>;
  faqs: Faq[];
};

const commonFaqs = (platform: string): Faq[] => [
  {
    q: `Is the ${platform} link shortener free?`,
    a: `Yes. Paste a ${platform} URL in the form above to get a short link for free. Links created without an account expire after 24 hours, so sign up for a free account to keep them and see click analytics.`,
  },
  {
    q: 'Can I choose my own short link?',
    a: 'Yes, with a free account you can set a custom back-half such as shortener.dev/my-offer, add UTM parameters, an expiration date or a password. Links from the public form get a random back-half.',
  },
  {
    q: 'How do I see how many people clicked my link?',
    a: 'Sign in, open Analytics and choose the link. You will see clicks over time with the country, city, referrer, browser, operating system and device of each visit.',
  },
];

export const shortenerTools: ShortenerTool[] = [
  {
    slug: 'chatgpt-link-shortener',
    platform: 'ChatGPT',
    domain: 'chatgpt.com',
    icon: Bot,
    title: 'ChatGPT link shortener',
    description:
      'Shorten ChatGPT conversation and custom GPT links into short, trackable URLs. See how many people opened your GPT, from which country and referrer.',
    headline: 'ChatGPT link shortener',
    subhead:
      'Turn long chatgpt.com share and custom GPT links into short links you can put in a bio, a slide or a newsletter, and see who opened them.',
    placeholder: 'https://chatgpt.com/g/g-xxxx-your-gpt',
    example: { url: 'https://chatgpt.com/g/g-2fkFE8rbu-dall-e', key: 'dall-e' },
    uses: [
      {
        title: 'Share a custom GPT',
        body: 'GPT URLs carry a random ID. A short link like shortener.dev/tax-helper is easier to say on a call and to remember.',
      },
      {
        title: 'Track GPT visitors',
        body: 'See the clicks on your GPT link by day, country, referrer and device, which ChatGPT does not show to GPT builders.',
      },
      {
        title: 'Share a conversation',
        body: 'Shorten a shared chat link before you post it in Slack, a support ticket or an email.',
      },
    ],
    faqs: commonFaqs('ChatGPT'),
  },
  {
    slug: 'amazon-link-shortener',
    platform: 'Amazon',
    domain: 'amazon.com',
    icon: ShoppingCart,
    title: 'Amazon link shortener',
    description:
      'Amazon link shortener to shorten product and affiliate URLs and track clicks from your website, videos and social posts.',
    headline: 'Amazon link shortener',
    subhead:
      'Shorten Amazon product and affiliate links, keep your tag in the destination, and see which post, video or page sends the clicks.',
    placeholder: 'https://www.amazon.com/dp/B0XXXXXXX?tag=yourtag-20',
    example: {
      url: 'https://www.amazon.com/Apple-iPhone-Fully-Unlocked-5-8/dp/B075QN8NDH/',
      key: 'iphone',
    },
    uses: [
      {
        title: 'Clean affiliate links',
        body: 'Amazon URLs are long and full of tracking parameters. A short link reads better in a video description or a tweet.',
      },
      {
        title: 'Find what sells',
        body: 'Compare clicks across the links in your reviews and gift guides to see which products your audience wants.',
      },
      {
        title: 'Send shoppers to their store',
        body: 'Use geo targeting to send visitors from the UK to amazon.co.uk and from Germany to amazon.de with the same short link.',
      },
    ],
    faqs: [
      {
        q: 'Will my Amazon affiliate tag still work?',
        a: 'Yes. The short link redirects to the full URL you entered, including the tag parameter, so Amazon attributes the purchase to you.',
      },
      ...commonFaqs('Amazon'),
    ],
  },
  {
    slug: 'spotify-link-shortener',
    platform: 'Spotify',
    domain: 'spotify.com',
    icon: Music,
    title: 'Spotify link shortener',
    description:
      'Spotify link shortener to share songs, albums, playlists and podcasts with short, trackable links. See clicks, countries and referrers for your music.',
    headline: 'Spotify link shortener',
    subhead:
      'Share songs, albums, playlists and podcast episodes with a short link, and see where your listeners come from.',
    placeholder: 'https://open.spotify.com/artist/...',
    example: { url: 'https://open.spotify.com/artist/2FKWNmZWDBZR4dE5KX4plR', key: 'diljit' },
    uses: [
      {
        title: 'Promote a release',
        body: 'Put one short link in your bio, posters and stories, and point it to the new single on release day.',
      },
      {
        title: 'See where fans are',
        body: 'Click analytics by country and city help you plan tours, ads and playlist pitches.',
      },
      {
        title: 'Open the app on phones',
        body: 'Add an iOS or Android destination so listeners on mobile land in the Spotify app instead of the browser.',
      },
    ],
    faqs: commonFaqs('Spotify'),
  },
  {
    slug: 'linkedin-link-shortener',
    platform: 'LinkedIn',
    domain: 'linkedin.com',
    icon: Briefcase,
    title: 'LinkedIn link shortener',
    description:
      'LinkedIn URL shortener for profiles, posts, articles and job listings. Track clicks and referrers to see what your network engages with.',
    headline: 'LinkedIn link shortener',
    subhead:
      'Short links for your profile, posts, articles and job openings, with click tracking to see what your network opens.',
    placeholder: 'https://www.linkedin.com/in/your-name/',
    example: { url: 'https://www.linkedin.com/in/vikashrathee/', key: 'vr' },
    uses: [
      {
        title: 'Profile on a business card',
        body: 'A short link fits on a card, a slide or an email signature, and you can change where it points later.',
      },
      {
        title: 'Job posts',
        body: 'Share one link to an opening across job boards and see which board sends candidates.',
      },
      {
        title: 'Articles and newsletters',
        body: 'Track clicks on the LinkedIn articles you share outside LinkedIn.',
      },
    ],
    faqs: commonFaqs('LinkedIn'),
  },
  {
    slug: 'youtube-link-shortener',
    platform: 'YouTube',
    domain: 'youtube.com',
    icon: TvMinimalPlay,
    title: 'YouTube link shortener',
    description:
      'YouTube link shortener for videos, Shorts, channels and playlists. Share short links and track clicks by country, referrer and device.',
    headline: 'YouTube link shortener',
    subhead:
      'Short links for videos, Shorts, channels and playlists, so you know which post or email brought the viewers.',
    placeholder: 'https://www.youtube.com/watch?v=...',
    example: { url: 'https://www.youtube.com/@cloudflare', key: 'cf-videos' },
    uses: [
      {
        title: 'Video in a newsletter',
        body: 'See how many subscribers clicked through to your latest video from each issue.',
      },
      {
        title: 'Channel link for offline',
        body: 'Print a short link to your channel on packaging, slides or merch.',
      },
      {
        title: 'Open in the app',
        body: 'Mobile visitors can be sent to the YouTube app with iOS and Android targeting.',
      },
    ],
    faqs: commonFaqs('YouTube'),
  },
  {
    slug: 'instagram-link-shortener',
    platform: 'Instagram',
    domain: 'instagram.com',
    icon: Camera,
    title: 'Instagram link shortener',
    description:
      'Shorten Instagram profile, post and reel links and track the clicks. Share your Instagram from other channels and see what brings followers.',
    headline: 'Instagram link shortener',
    subhead:
      'Short links to your profile, posts and reels, for the places Instagram does not reach: email, print, other networks.',
    placeholder: 'https://www.instagram.com/your-profile/',
    example: { url: 'https://www.instagram.com/cloudflare/', key: 'insta' },
    uses: [
      {
        title: 'Grow from other channels',
        body: 'Share your profile in emails, on YouTube or on print, and see which one brings visitors.',
      },
      {
        title: 'Share a reel',
        body: 'A short link to a reel looks better in a message than a long URL with tracking parameters.',
      },
      {
        title: 'Campaign tracking',
        body: 'Add UTM parameters so your web analytics can tell Instagram traffic apart.',
      },
    ],
    faqs: commonFaqs('Instagram'),
  },
  {
    slug: 'tiktok-link-shortener',
    platform: 'TikTok',
    domain: 'tiktok.com',
    icon: Clapperboard,
    title: 'TikTok link shortener',
    description:
      'TikTok link shortener for videos and profiles. Create short, trackable links and see the clicks by country, referrer and device.',
    headline: 'TikTok link shortener',
    subhead:
      'Shorten TikTok videos and profiles and share them anywhere, with clicks tracked by country and device.',
    placeholder: 'https://www.tiktok.com/@your-profile',
    example: { url: 'https://www.tiktok.com/@tiktok', key: 'tt' },
    uses: [
      {
        title: 'Cross-post a video',
        body: 'Share a TikTok on other networks and in messages with a short, readable link.',
      },
      {
        title: 'Measure collaborations',
        body: 'Give each creator their own short link and compare the clicks they drive.',
      },
      {
        title: 'App on mobile',
        body: 'Send phone visitors straight to the TikTok app with device targeting.',
      },
    ],
    faqs: commonFaqs('TikTok'),
  },
  {
    slug: 'google-drive-link-shortener',
    platform: 'Google Drive',
    domain: 'drive.google.com',
    icon: FolderOpen,
    title: 'Google Drive link shortener',
    description:
      'Shorten Google Drive, Docs, Sheets and Forms links. Share a short URL that is easy to type and see how many people opened your file.',
    headline: 'Google Drive link shortener',
    subhead:
      'Short links for Drive files, Docs, Sheets, Slides and Forms that are easy to type, with a count of who opened them.',
    placeholder: 'https://docs.google.com/document/d/...',
    example: { url: 'https://docs.google.com/forms/d/e/1FAIpQL/viewform', key: 'signup-form' },
    uses: [
      {
        title: 'Forms on posters',
        body: 'A short link to a Google Form is easy to type from a poster or a slide.',
      },
      {
        title: 'Expiring file access',
        body: 'Set an expiration date so the short link stops working after the deadline.',
      },
      {
        title: 'Password on the link',
        body: 'Add a password to the short link for one more step before people reach the file.',
      },
    ],
    faqs: commonFaqs('Google Drive'),
  },
];

/** Standalone tools with their own pages */
export const otherTools = [
  {
    slug: 'whatsapp-link-generator',
    to: '/tools/whatsapp-link-generator' as const,
    domain: 'whatsapp.com',
    title: 'WhatsApp link generator',
    description: 'Create a wa.me link with a prefilled message and shorten it.',
    icon: MessageCircle,
  },
  {
    slug: 'social-share-preview',
    to: '/tools/social-share-preview' as const,
    domain: undefined,
    title: 'Social share preview',
    description: 'See how a link looks when shared on X, Facebook and LinkedIn.',
    icon: Share2,
  },
];

export const getTool = (slug: string) => shortenerTools.find((tool) => tool.slug === slug);
