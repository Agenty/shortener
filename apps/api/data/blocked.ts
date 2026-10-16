/**
 * Top-level domains short links can never point to: adult content, and TLDs
 * heavily abused for phishing or that look like file names (`invoice.zip`)
 */
export const BLOCKED_TLDS = new Set([
  // Adult
  'xxx',
  'porn',
  'adult',
  'sex',
  'sexy',

  // Phishing & abuse
  'zip',
  'mov',
  'sbs',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
]);

/**
 * Domains commonly used to host phishing pages (free hosting, tunnels,
 * dynamic DNS, IPFS gateways) and other link shorteners (link chaining hides
 * the real destination). Each entry also covers its subdomains. Others can be
 * blocked by admin in the database
 */
export const BLOCKED_DOMAINS = new Set([
  // Free hosting & serverless previews
  'workers.dev',
  'pages.dev',
  'r2.dev',
  'vercel.app',
  'netlify.app',
  'firebaseapp.com',
  'web.app',
  'glitch.me',
  'repl.co',
  'replit.dev',
  'bubbleapps.io',
  '000webhostapp.com',

  // Tunnels & dynamic DNS
  'ngrok.io',
  'ngrok-free.app',
  'trycloudflare.com',
  'duckdns.org',
  'ddns.net',
  'serveo.net',

  // IPFS gateways
  'ipfs.io',
  'dweb.link',
  'w3s.link',

  // Link shorteners
  'idm.in',
  'ko.gl',
  'bitly.ws',
  'bit.ly',
  'tinyurl.com',
  'is.gd',
  't.ly',
  'cutt.ly',
  'rebrand.ly',
  'ow.ly',
  'shorturl.at',
  'rb.gy',
  'tiny.cc',
  's.id',
]);
