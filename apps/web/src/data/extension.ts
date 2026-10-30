/**
 * Tally form IDs for the pages the extension opens on install and uninstall,
 * the part after `tally.so/r/`. Leave empty to hide the form. Both forms can
 * have `browser` and `version` hidden fields, filled from the page URL.
 */
export const extensionForms = {
  installed: '',
  uninstalled: '',
};

export const extensionFaqs = [
  {
    q: 'Is the Shortener.dev extension free?',
    a: 'Yes. The extension is free, and so is the account you sign in with: 50 short links, 1 domain and 7 days of click analytics. Paid plans raise those limits.',
  },
  {
    q: 'Which browsers does it work in?',
    a: 'Chrome 116 or newer and Firefox 128 or newer. Edge, Brave, Opera and Vivaldi install it from the Chrome Web Store.',
  },
  {
    q: 'Does the extension read my browsing history?',
    a: 'No. It reads the address of a tab only when you open the panel on it or right click a link. It has no content scripts and nothing is sent until you click Shorten link.',
  },
  {
    q: 'Why does it say "Domain not verified"?',
    a: 'Short links can only point to domains on the global whitelist (YouTube, GitHub, LinkedIn and other popular sites) or domains you have verified. Verify your website once from the Domains tab and you can link to any page on it.',
  },
  {
    q: 'Can I add UTM parameters or a password from the extension?',
    a: 'Not yet. The panel covers shortening, links, analytics and domains. Open the link in app.shortener.dev to add UTM tags, expiration, a password or targeting.',
  },
  {
    q: 'Is the extension open source?',
    a: 'Yes. It lives in apps/extension of the Shortener.dev repository on GitHub, under the AGPL-3.0 license.',
  },
];
