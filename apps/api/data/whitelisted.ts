/**
 * Popular domains allowed for every account without ownership verification,
 * checked in memory to avoid a database lookup. Each entry also covers its
 * subdomains (`youtube.com` => `m.youtube.com`), so don't add domains hosting
 * user content on subdomains (e.g. `google.com` => `sites.google.com`, `blogspot.com`)
 * or other link shorteners. Rare ones can be whitelisted by admin in the database
 */
export const WHITELISTED_DOMAINS = new Set([
  // Social
  'facebook.com',
  'instagram.com',
  'threads.net',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'pinterest.com',
  'reddit.com',
  'tiktok.com',
  'snapchat.com',
  'quora.com',
  'tumblr.com',

  // Video & music
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'twitch.tv',
  'spotify.com',
  'soundcloud.com',

  // Messaging & community
  'whatsapp.com',
  'wa.me',
  'telegram.org',
  't.me',
  'discord.com',
  'discord.gg',

  // Google first-party apps
  'docs.google.com',
  'drive.google.com',
  'maps.google.com',
  'play.google.com',
  'meet.google.com',
  'calendar.google.com',

  // Apple, Microsoft & Amazon
  'apple.com',
  'microsoft.com',
  'amazon.com',

  // Developer & knowledge
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'chatgpt.com',

  // Meetings & events
  'zoom.us',
  'calendly.com',
  'eventbrite.com',
  'meetup.com',
]);
