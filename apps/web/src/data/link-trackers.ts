import type { LucideIcon } from 'lucide-react';
import {
  AtSign,
  Briefcase,
  Camera,
  Clapperboard,
  MessageCircle,
  Pin,
  ThumbsUp,
  TvMinimalPlay,
} from 'lucide-react';
import type { Faq } from './tools';

export type Placement = {
  /** Where the link goes, e.g. "Bio" */
  place: string;
  /** Whether people can tap the link there */
  clickable: string;
  /** Suggested back-half, e.g. "ig-bio" */
  key: string;
  /** `utm_content` value for the placement */
  content: string;
};

/** A guide-style landing page about tracking clicks on links shared on one platform */
export type LinkTracker = {
  slug: string;
  platform: string;
  /** Domain of the platform, used for the favicon */
  domain: string;
  icon: LucideIcon;
  title: string;
  description: string;
  headline: string;
  subhead: string;
  /** A whitelisted URL that works in the public form */
  example: { url: string; key: string };
  /** Slug of the matching link shortener tool, if there is one */
  shortener?: string;
  /** What the platform's own analytics give you */
  shows: string[];
  /** What they leave out */
  misses: string[];
  placements: Placement[];
  utm: { source: string; medium: string; campaign: string };
  /** How clicks from this platform look in the referrer and browser reports */
  referrer: string[];
  tips: Array<{ title: string; body: string }>;
  faqs: Faq[];
};

const ownSiteFaq = (platform: string): Faq => ({
  q: `Can I track ${platform} clicks to my own website?`,
  a: `Yes. Short links work for any page on a domain you have verified in your account. Add your domain under Domains and verify it with an email code or Google Search Console, which takes a couple of minutes. Popular sites such as YouTube, Amazon, Spotify and Google Forms are whitelisted and work without verification.`,
});

const historyFaq: Faq = {
  q: 'How long is click data kept?',
  a: 'Analytics history depends on the plan: 7 days on Free, 30 days on Starter, 60 days on Pro and 90 days on Business. The link itself keeps working on every plan until you delete, disable or expire it.',
};

export const linkTrackers: LinkTracker[] = [
  {
    slug: 'instagram-link-tracker',
    platform: 'Instagram',
    domain: 'instagram.com',
    icon: Camera,
    shortener: 'instagram-link-shortener',
    title: 'Instagram link tracker: track bio, Story and DM link clicks',
    description:
      'Track clicks on the links in your Instagram bio, Stories, DMs and ads. One short link per placement shows which one sends visitors, by day, country and device.',
    headline: 'Instagram link tracker',
    subhead:
      'Instagram tells you how many people tapped a link, not which one worked or what they did next. Give every bio link, Story sticker and DM its own short link and you will know.',
    example: { url: 'https://www.youtube.com/@cloudflare', key: 'ig-bio' },
    shows: [
      'Taps on the links in your bio, under profile activity in Insights (professional accounts only)',
      'Link sticker taps on each Story, for as long as Story insights are available',
      'Clicks on ads, in Meta Ads Manager',
    ],
    misses: [
      'Which of the up to five bio links got the tap',
      'Clicks on links you sent in DMs, or that creators shared for you',
      'The country, city and device of the people who tapped',
      'Visits after the tap, because Instagram opens links in its in-app browser, which often hides the referrer',
    ],
    placements: [
      { place: 'Bio links (up to 5)', clickable: 'Yes', key: 'ig-bio', content: 'bio' },
      { place: 'Story link sticker', clickable: 'Yes', key: 'ig-story-1112', content: 'story' },
      { place: 'Story Highlight', clickable: 'Yes, through the saved Story', key: 'ig-highlight', content: 'highlight' },
      { place: 'Direct messages', clickable: 'Yes', key: 'ig-dm', content: 'dm' },
      { place: 'Post and Reel captions', clickable: 'No, people have to type it', key: 'ig-reel', content: 'caption' },
      { place: 'Creator or partner posts', clickable: 'Bio and Stories', key: 'ig-anna', content: 'creator-anna' },
    ],
    utm: { source: 'instagram', medium: 'social', campaign: 'autumn_sale' },
    referrer: [
      'Instagram opens links in its own in-app browser. Our browser report recognizes it, so taps from Instagram usually show up as Instagram under Browsers, even when the referrer is missing.',
      'The referrer itself is often empty or `l.instagram.com`, the redirect Meta puts in front of outbound links. Clicks with no referrer are filed under Direct, which is why the back-half of each link matters more than the referrer report on Instagram.',
    ],
    tips: [
      {
        title: 'Name the Story by date',
        body: 'A back-half like ig-story-1112 tells you months later which Story it came from. Reusing one Story link for every Story mixes them all together.',
      },
      {
        title: 'Captions need a typeable link',
        body: 'Caption links are plain text. Keep the back-half short and lowercase, such as srt1.link/fall, so people can type it into a browser.',
      },
      {
        title: 'One link per creator',
        body: 'Give each creator in a campaign a link of their own, such as ig-anna and ig-raj, and compare clicks instead of asking for screenshots of their insights.',
      },
    ],
    faqs: [
      {
        q: 'Can I see who clicked my Instagram link?',
        a: 'Not by name. Neither Instagram nor a link tracker can tell you which account tapped a link. A short link shows each click with its time, country, city, browser, operating system and device, which is enough to compare placements and campaigns.',
      },
      {
        q: 'How do I see link clicks on Instagram?',
        a: 'Professional accounts can see bio link taps under profile activity in Insights and link sticker taps in Story insights. For a count per link, per Story or per creator, use a separate short link in each place and read the clicks in Analytics.',
      },
      {
        q: 'Why does Instagram traffic show as Direct in Google Analytics?',
        a: 'The in-app browser often does not send a referrer, so the visit has no source. Add UTM parameters with the UTM Builder, such as utm_source=instagram and utm_medium=social, and Google Analytics files the visit correctly.',
      },
      {
        q: 'Can I put a clickable link in an Instagram caption?',
        a: 'No. Links in post and Reel captions are not clickable. Put the link in your bio or a Story, or write a short link people can type, such as srt1.link/fall.',
      },
      ownSiteFaq('Instagram'),
    ],
  },
  {
    slug: 'tiktok-link-tracker',
    platform: 'TikTok',
    domain: 'tiktok.com',
    icon: Clapperboard,
    shortener: 'tiktok-link-shortener',
    title: 'TikTok link tracker: track bio link clicks per video',
    description:
      'Track clicks on your TikTok bio link and see which video sent them. Swap short links per video, add UTM parameters and read clicks by day, country and device.',
    headline: 'TikTok link tracker',
    subhead:
      'TikTok gives you one link in your bio and no way to see which video made people tap it. A short link per video, or per week, fills that gap.',
    example: { url: 'https://open.spotify.com/artist/2FKWNmZWDBZR4dE5KX4plR', key: 'tt-bio' },
    shows: [
      'Video views, likes, shares and profile views in TikTok Studio',
      'Clicks on ads and Spark Ads, in TikTok Ads Manager',
    ],
    misses: [
      'Taps on your bio link, unless your account type shows them',
      'Which video got people to visit your profile and tap the link',
      'Clicks on links you share in comments or captions, since those are not clickable',
      'Where the visitors were and which device they used',
    ],
    placements: [
      { place: 'Bio link', clickable: 'Yes, once your account can add one', key: 'tt-bio', content: 'bio' },
      { place: 'Video caption', clickable: 'No, people have to type it', key: 'tt-recipe', content: 'caption' },
      { place: 'Comment reply', clickable: 'No', key: 'tt-faq', content: 'comment' },
      { place: 'Said or shown in the video', clickable: 'No', key: 'tt-0412', content: 'video' },
      { place: 'Creator collaboration', clickable: 'Their bio link', key: 'tt-sam', content: 'creator-sam' },
    ],
    utm: { source: 'tiktok', medium: 'social', campaign: 'spring_drop' },
    referrer: [
      'TikTok opens links in its in-app browser, and our browser report usually names it TikTok. That is the most reliable sign a click came from the app.',
      'TikTok often sends no referrer at all, so most clicks show as Direct in the referrer report. Rely on the back-half of each link and on UTM parameters instead.',
    ],
    tips: [
      {
        title: 'Rotate the bio link by video',
        body: 'When you post a video that asks people to tap your bio, create a new link such as tt-0412 and put it in your bio. Clicks over the next few days belong mostly to that video.',
      },
      {
        title: 'Show the link on screen',
        body: 'Put a short, typeable link like srt1.link/recipe as text in the video. Viewers who type it are counted, and you know exactly which video they saw.',
      },
      {
        title: 'Check the time of clicks',
        body: 'Click spikes in the hours after you post line up with the video that caused them. Use the daily chart in Analytics, or export the clicks from Reports for exact times.',
      },
    ],
    faqs: [
      {
        q: 'How do I track clicks on my TikTok bio link?',
        a: 'Put a short link in your bio instead of the full URL. Every tap is counted with its time, country, city, browser and device, and you can compare the counts with the videos you posted that week.',
      },
      {
        q: 'How do I know which TikTok video sent the clicks?',
        a: 'TikTok has one bio link, so use a different short link for each video you promote and change the bio when you post. You can also show a short link in the video itself, which tells you exactly which video a visitor watched.',
      },
      {
        q: 'Can I put a link in a TikTok caption or comment?',
        a: 'You can type one, but it is not clickable. Use a short back-half that is easy to type, such as srt1.link/recipe, so people can enter it in a browser.',
      },
      ownSiteFaq('TikTok'),
      historyFaq,
    ],
  },
  {
    slug: 'linkedin-link-tracker',
    platform: 'LinkedIn',
    domain: 'linkedin.com',
    icon: Briefcase,
    shortener: 'linkedin-link-shortener',
    title: 'LinkedIn link tracker: track post, comment and profile link clicks',
    description:
      'Track clicks on links in LinkedIn posts, comments, articles, your profile and employee shares. One short link per placement shows which one brings visitors.',
    headline: 'LinkedIn link tracker',
    subhead:
      'LinkedIn shows impressions and reactions, but not what happened after someone clicked your link. Short links count the clicks per post, comment and colleague who shared it.',
    example: { url: 'https://docs.google.com/forms/d/e/1FAIpQL/viewform', key: 'li-webinar' },
    shows: [
      'Impressions, reactions, comments and reposts on each post',
      'Clicks on company page posts and ads, in page analytics and Campaign Manager',
      'Profile views and search appearances',
    ],
    misses: [
      'Clicks on a link in the first comment, or in a reply',
      'Clicks from employees who share the same link from their own profiles',
      'Clicks on the website links in your profile, Featured section and newsletter',
      'The country, city and device of the people who clicked',
    ],
    placements: [
      { place: 'Post text', clickable: 'Yes', key: 'li-post-webinar', content: 'post' },
      { place: 'First comment', clickable: 'Yes', key: 'li-comment-webinar', content: 'comment' },
      { place: 'Profile website or Featured', clickable: 'Yes', key: 'li-profile', content: 'profile' },
      { place: 'Article or newsletter', clickable: 'Yes', key: 'li-newsletter-11', content: 'newsletter' },
      { place: 'Employee shares', clickable: 'Yes', key: 'li-priya', content: 'employee-priya' },
      { place: 'Direct messages', clickable: 'Yes', key: 'li-dm', content: 'dm' },
    ],
    utm: { source: 'linkedin', medium: 'social', campaign: 'q4_webinar' },
    referrer: [
      'Clicks from the LinkedIn website usually arrive with `linkedin.com` as the referrer, so they show up under Referers. Clicks from the mobile app open in its in-app browser, which our browser report recognizes as LinkedIn.',
      'LinkedIn may also wrap links in its own `lnkd.in` redirect. Your short link still counts the click, because the visitor passes through it on the way to your page.',
    ],
    tips: [
      {
        title: 'Test post versus comment',
        body: 'Run the same offer once with the link in the post and once with the link in the first comment, each with its own short link. Compare clicks, not reach.',
      },
      {
        title: 'A link per employee',
        body: 'When colleagues share a launch, give each one a link like li-priya. You can thank the people whose posts actually send traffic.',
      },
      {
        title: 'Keep job links alive',
        body: 'Point a job link at the opening, and when it closes, send the same short link to your careers page instead of a 404.',
      },
    ],
    faqs: [
      {
        q: 'How do I track link clicks on a LinkedIn post?',
        a: 'Shorten the URL before you post it and use a separate short link for each post. Analytics shows clicks per link over time, with the referrer, country, city, browser and device of each click.',
      },
      {
        q: 'Should I put the link in the post or the first comment?',
        a: 'Many people put links in the first comment because they believe posts with external links get less reach. Test it on your own audience: one short link in the post, another in the comment, and compare the clicks after a week.',
      },
      {
        q: 'Can I see which employee shares drive traffic?',
        a: 'Yes. Give every employee their own short link to the same page, such as li-priya and li-tom, and add utm_content with their name. Each link has its own click count.',
      },
      ownSiteFaq('LinkedIn'),
      historyFaq,
    ],
  },
  {
    slug: 'youtube-link-tracker',
    platform: 'YouTube',
    domain: 'youtube.com',
    icon: TvMinimalPlay,
    shortener: 'youtube-link-shortener',
    title: 'YouTube link tracker: track description and comment link clicks',
    description:
      'Track clicks on the links in YouTube video descriptions, pinned comments, channel links and community posts. See which video sends visitors to your site.',
    headline: 'YouTube link tracker',
    subhead:
      'YouTube Studio counts views and watch time, not clicks on the links under your videos. A short link per video tells you which ones send people to your site or store.',
    example: { url: 'https://www.amazon.com/Apple-iPhone-Fully-Unlocked-5-8/dp/B075QN8NDH/', key: 'yt-review' },
    shows: [
      'Views, watch time, traffic sources and audience in YouTube Studio',
      'Clicks on end screen elements and cards',
      'Clicks on ads, in Google Ads',
    ],
    misses: [
      'Clicks on links in video descriptions',
      'Clicks on links in pinned comments and community posts',
      'Clicks on the links in your channel header and About section',
      'Which video a visitor came from when you use the same URL under every video',
    ],
    placements: [
      { place: 'Video description', clickable: 'Yes', key: 'yt-review-desc', content: 'description' },
      { place: 'Pinned comment', clickable: 'Yes', key: 'yt-review-pin', content: 'pinned-comment' },
      { place: 'Channel links', clickable: 'Yes', key: 'yt-channel', content: 'channel' },
      { place: 'Community post', clickable: 'Yes', key: 'yt-post-sale', content: 'community' },
      { place: 'Shorts description', clickable: 'No, people have to type it', key: 'yt-short', content: 'shorts' },
      { place: 'Said or shown in the video', clickable: 'No', key: 'yt-deal', content: 'video' },
    ],
    utm: { source: 'youtube', medium: 'video', campaign: 'iphone_review' },
    referrer: [
      'Links in video descriptions pass through YouTube\'s own redirect, so clicks usually show `youtube.com` as the referrer in the Referers report.',
      'Clicks from the YouTube app on phones can arrive without a referrer and show as Direct. A separate short link per video keeps them apart either way.',
    ],
    tips: [
      {
        title: 'One link per video',
        body: 'Reusing the same affiliate or store link in every description hides which video sells. Create yt-review, yt-unboxing and so on, all pointing to the same page.',
      },
      {
        title: 'Update old descriptions',
        body: 'When a product page moves, change where the short link points through the API. Every old video keeps working without editing hundreds of descriptions.',
      },
      {
        title: 'Say it out loud',
        body: 'Mention a short link like srt1.link/deal in the video. People who type it are counted, and it works on Shorts where links are not clickable.',
      },
    ],
    faqs: [
      {
        q: 'Can I see clicks on links in my YouTube description?',
        a: 'Not in YouTube Studio. Put a short link in the description instead of the full URL, and every click is counted with its time, country, city, referrer and device.',
      },
      {
        q: 'Do short links work in YouTube descriptions?',
        a: 'Yes. YouTube makes them clickable like any other link. Whitelisted destinations such as Amazon work right away, and links to your own site work once you verify the domain.',
      },
      {
        q: 'Can I track links in YouTube Shorts?',
        a: 'Links in Shorts descriptions are not clickable. Show or say a short link in the Short, or point viewers to a link in your channel or a related video, each with its own short link.',
      },
      ownSiteFaq('YouTube'),
      historyFaq,
    ],
  },
  {
    slug: 'facebook-link-tracker',
    platform: 'Facebook',
    domain: 'facebook.com',
    icon: ThumbsUp,
    title: 'Facebook link tracker: track post, group and Messenger link clicks',
    description:
      'Track clicks on links you share in Facebook posts, groups, comments and Messenger. See which post or group sends visitors, with country and device.',
    headline: 'Facebook link tracker',
    subhead:
      'Page insights count link clicks on your own posts. Groups, comments, Messenger and other people\'s shares are a blind spot. Short links cover all of them.',
    example: { url: 'https://www.youtube.com/@cloudflare', key: 'fb-page' },
    shows: [
      'Link clicks on posts from your Page, in Meta Business Suite',
      'Clicks on ads, in Meta Ads Manager',
    ],
    misses: [
      'Clicks on links you post in groups you don\'t manage',
      'Clicks on links in comments and Messenger chats',
      'Clicks on links on a personal profile',
      'Clicks from people who reshare your post',
    ],
    placements: [
      { place: 'Page post', clickable: 'Yes', key: 'fb-post-sale', content: 'page-post' },
      { place: 'Group post', clickable: 'Yes', key: 'fb-group-runners', content: 'group-runners' },
      { place: 'Comment', clickable: 'Yes', key: 'fb-comment', content: 'comment' },
      { place: 'Messenger', clickable: 'Yes', key: 'fb-dm', content: 'messenger' },
      { place: 'Page intro or website field', clickable: 'Yes', key: 'fb-page', content: 'page-info' },
      { place: 'Event description', clickable: 'Yes', key: 'fb-event', content: 'event' },
    ],
    utm: { source: 'facebook', medium: 'social', campaign: 'summer_sale' },
    referrer: [
      'Facebook sends outbound clicks through its link shim, so the referrer is often `l.facebook.com`, `lm.facebook.com` or `m.facebook.com`. In the app, links open in the Facebook in-app browser, which our browser report names Facebook.',
      'Facebook fetches your link to build the preview card. That request comes from a crawler, not a person, so it is not counted as a click.',
    ],
    tips: [
      {
        title: 'One link per group',
        body: 'If you share the same post in five groups, create five links such as fb-group-runners. You will see which communities care and which ignore you.',
      },
      {
        title: 'Fix the preview card',
        body: 'If the destination has no Open Graph image, set a title, description and image with Social Preview so the post doesn\'t show a blank card.',
      },
      {
        title: 'Don\'t shorten ad URLs',
        body: 'Ads Manager counts ad clicks and adds its own parameters. Put the tagged URL straight into the ad and keep short links for organic posts.',
      },
    ],
    faqs: [
      {
        q: 'How do I track clicks on a link I share in a Facebook group?',
        a: 'Group insights only go to group admins, and they don\'t break clicks down by link. Create a short link for each group you post in and read the clicks per link in Analytics.',
      },
      {
        q: 'Does the Facebook link preview count as a click?',
        a: 'No. Facebook\'s crawler fetches the link to build the preview, and requests from known crawlers and bots are not counted in click analytics.',
      },
      {
        q: 'Will a short link show a preview image on Facebook?',
        a: 'Yes. The short link serves the destination\'s Open Graph title, description and image to Facebook, or the custom ones you set with Social Preview.',
      },
      ownSiteFaq('Facebook'),
      historyFaq,
    ],
  },
  {
    slug: 'x-twitter-link-tracker',
    platform: 'X (Twitter)',
    domain: 'x.com',
    icon: AtSign,
    title: 'X (Twitter) link tracker: track clicks on post and bio links',
    description:
      'Track clicks on links you share on X (Twitter) in posts, replies, your bio and DMs. See which post sent visitors and where they came from.',
    headline: 'X (Twitter) link tracker',
    subhead:
      'X wraps every link in t.co and shows engagement on your own posts. Short links add the clicks from replies, DMs, reposts and threads, per link.',
    example: { url: 'https://github.com/Agenty', key: 'x-bio' },
    shows: [
      'Impressions and engagement on your posts, in post analytics',
      'Clicks on promoted posts, in X Ads',
    ],
    misses: [
      'A clean count of clicks per link when the same URL appears in several posts',
      'Clicks on links in DMs and in other people\'s posts',
      'Clicks on your bio and website links',
      'The country, city and device of the people who clicked',
    ],
    placements: [
      { place: 'Post', clickable: 'Yes', key: 'x-launch', content: 'post' },
      { place: 'Reply in a thread', clickable: 'Yes', key: 'x-thread-end', content: 'thread' },
      { place: 'Bio and website field', clickable: 'Yes', key: 'x-bio', content: 'bio' },
      { place: 'Direct messages', clickable: 'Yes', key: 'x-dm', content: 'dm' },
      { place: 'Pinned post', clickable: 'Yes', key: 'x-pinned', content: 'pinned' },
    ],
    utm: { source: 'twitter', medium: 'social', campaign: 'product_launch' },
    referrer: [
      'X sends every link through `t.co`, so clicks from x.com usually show `t.co` as the referrer. That one entry in the Referers report covers posts, replies and DMs alike.',
      'Clicks from the X app open in its in-app browser, which our browser report names Twitter.',
    ],
    tips: [
      {
        title: 'Thread link at the end',
        body: 'Compare a link in the first post with one in the last reply of a thread. Separate short links show which spot your readers click.',
      },
      {
        title: 'Same source name everywhere',
        body: 'Pick twitter or x for utm_source and keep it. Mixing both splits the same channel into two rows in Google Analytics.',
      },
      {
        title: 'Check the card before posting',
        body: 'Paste the URL in the social share preview tool to see the card X will show, and fix the title or image with Social Preview.',
      },
    ],
    faqs: [
      {
        q: 'Why do my clicks show t.co as the referrer?',
        a: 'X wraps every link in its own t.co shortener and sends visitors through it. Clicks from x.com therefore show t.co as the referrer. A separate short link per post still tells you which post they came from.',
      },
      {
        q: 'Can I use a short link inside t.co?',
        a: 'Yes. X wraps your short link in t.co like any other URL. The visitor goes through t.co, then your short link, then your page, and the click is counted on your short link.',
      },
      {
        q: 'Should utm_source be twitter or x?',
        a: 'Either works, as long as every link uses the same one. Google Analytics groups both into its Organic Social channel, but it lists them as separate sources.',
      },
      ownSiteFaq('X'),
      historyFaq,
    ],
  },
  {
    slug: 'pinterest-link-tracker',
    platform: 'Pinterest',
    domain: 'pinterest.com',
    icon: Pin,
    title: 'Pinterest link tracker: track Pin clicks per board and design',
    description:
      'Track clicks on Pinterest Pins, boards and your profile link. Compare Pin designs and boards by the visitors they send, with country and device.',
    headline: 'Pinterest link tracker',
    subhead:
      'Pinterest counts outbound clicks per Pin. When several Pins point to the same page, short links tell you which design and which board did the work.',
    example: { url: 'https://www.amazon.com/Apple-iPhone-Fully-Unlocked-5-8/dp/B075QN8NDH/', key: 'pin-gift-guide' },
    shows: [
      'Impressions, saves and outbound clicks per Pin, in Pinterest Analytics (business accounts)',
      'Clicks on ads, in Pinterest Ads Manager',
    ],
    misses: [
      'Outbound clicks per page when many Pins link to it',
      'Clicks from repins by other people, beyond the totals',
      'The country, city and device of each visitor',
      'Clicks on the same page from your other channels, side by side',
    ],
    placements: [
      { place: 'Pin destination link', clickable: 'Yes', key: 'pin-recipe-v1', content: 'pin-v1' },
      { place: 'Second design of the same Pin', clickable: 'Yes', key: 'pin-recipe-v2', content: 'pin-v2' },
      { place: 'Profile website', clickable: 'Yes', key: 'pin-profile', content: 'profile' },
      { place: 'Pin description', clickable: 'No, people have to type it', key: 'pin-desc', content: 'description' },
    ],
    utm: { source: 'pinterest', medium: 'social', campaign: 'holiday_recipes' },
    referrer: [
      'Clicks from the Pinterest website usually have `pinterest.com` or a country version such as `pinterest.co.uk` as the referrer.',
      'Clicks from the app often arrive without a referrer and show as Direct, so the back-half of each Pin\'s link is the reliable way to tell them apart.',
    ],
    tips: [
      {
        title: 'Test Pin designs',
        body: 'Make two or three images for the same page, each with its own short link. After a few weeks, keep pinning the design with the most clicks.',
      },
      {
        title: 'Pins last for months',
        body: 'Pins keep sending traffic long after you post them. If the page moves, point the short link at the new URL and the Pin keeps working.',
      },
      {
        title: 'Affiliate links',
        body: 'Pinterest allows affiliate links on Pins. A short link with your tag in the destination is easier to manage and lets you count clicks per Pin.',
      },
    ],
    faqs: [
      {
        q: 'Can I use a short link as a Pin destination?',
        a: 'Yes. Pinterest follows the short link to your page. Pinterest may review or limit links it considers spammy, so point short links only at pages you would pin directly.',
      },
      {
        q: 'Which Pin design gets more clicks?',
        a: 'Give each design its own short link to the same page and compare the clicks in Analytics. Pinterest\'s own outbound clicks per Pin are a good second check.',
      },
      ownSiteFaq('Pinterest'),
      historyFaq,
    ],
  },
  {
    slug: 'whatsapp-link-tracker',
    platform: 'WhatsApp',
    domain: 'whatsapp.com',
    icon: MessageCircle,
    title: 'WhatsApp link tracker: track clicks in chats, groups and Status',
    description:
      'Track clicks on links you send in WhatsApp chats, groups, broadcast lists, Channels and Status. One short link per group shows who engages.',
    headline: 'WhatsApp link tracker',
    subhead:
      'WhatsApp shows when a message was read, not whether anyone opened the link in it. Short links count the clicks per group, broadcast and Status update.',
    example: { url: 'https://docs.google.com/forms/d/e/1FAIpQL/viewform', key: 'wa-rsvp' },
    shows: [
      'Read receipts on messages, when people have them turned on',
      'Views on your Status updates',
      'Message metrics in WhatsApp Business, for the messages you send from it',
    ],
    misses: [
      'Whether anyone tapped a link in a chat, group or Status',
      'Which group or broadcast list sent the clicks',
      'Clicks from messages forwarded to people you don\'t know',
      'The country, city and device of the people who clicked',
    ],
    placements: [
      { place: 'One-to-one chat', clickable: 'Yes', key: 'wa-chat', content: 'chat' },
      { place: 'Group message', clickable: 'Yes', key: 'wa-group-parents', content: 'group-parents' },
      { place: 'Broadcast list', clickable: 'Yes', key: 'wa-broadcast-11', content: 'broadcast' },
      { place: 'Status update', clickable: 'Yes', key: 'wa-status', content: 'status' },
      { place: 'Channel update', clickable: 'Yes', key: 'wa-channel', content: 'channel' },
      { place: 'Business profile website', clickable: 'Yes', key: 'wa-profile', content: 'profile' },
    ],
    utm: { source: 'whatsapp', medium: 'messaging', campaign: 'diwali_offer' },
    referrer: [
      'WhatsApp doesn\'t send a referrer, so every click shows as Direct. That is expected, and it is why the back-half and UTM parameters carry all the information here.',
      'When you paste a link, WhatsApp fetches it to build the preview. That request is not counted as a click.',
    ],
    tips: [
      {
        title: 'One link per group',
        body: 'Post the same offer in three groups with three links. The click counts tell you which group is worth your time.',
      },
      {
        title: 'Forwards are counted too',
        body: 'When a message is forwarded, the link travels with it. Clicks from forwards land on the same short link, so a link that keeps getting clicks days later is being shared.',
      },
      {
        title: 'Start a chat with a link',
        body: 'Use the WhatsApp link generator to build a wa.me link with a prefilled message, then shorten it to count how many people start a chat.',
      },
    ],
    faqs: [
      {
        q: 'Can I see who clicked a link I sent on WhatsApp?',
        a: 'Not by name. A short link shows each click with its time, country, city, browser, operating system and device. In a one-to-one chat, that is usually enough to tell whether the person opened it.',
      },
      {
        q: 'Why do WhatsApp clicks show as Direct?',
        a: 'WhatsApp doesn\'t pass a referrer when it opens a link. Use a separate short link per chat or group and add utm_source=whatsapp, so both the click count and Google Analytics know where the visit came from.',
      },
      {
        q: 'Does the WhatsApp link preview count as a click?',
        a: 'No. WhatsApp fetches the link to show the preview, and requests from crawlers and bots are left out of click analytics.',
      },
      ownSiteFaq('WhatsApp'),
      historyFaq,
    ],
  },
];

export const getLinkTracker = (slug: string) => linkTrackers.find((tracker) => tracker.slug === slug);

/** Tracker for a shortener tool slug, for cross-links between the two */
export const trackerForShortener = (slug: string) =>
  linkTrackers.find((tracker) => tracker.shortener === slug);
