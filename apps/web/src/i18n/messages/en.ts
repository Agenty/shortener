/**
 * English source strings. Every other language implements the same shape, so
 * TypeScript reports a missing or extra key. `{name}` is replaced at render
 * time, see `fmt` and `rich` in `@/i18n`.
 */
const en = {
  common: {
    skipToContent: 'Skip to content',
    startFree: 'Start free',
    signIn: 'Sign in',
    menu: 'Menu',
    openMenu: 'Open menu',
    product: 'Product',
    freeTools: 'Free tools',
    pricing: 'Pricing',
    api: 'API',
    docs: 'Docs',
    contact: 'Contact',
    home: 'Shortener.dev home',
    language: 'Language',
    faq: 'FAQ',
    faqTitle: 'Frequently asked questions',
    freeNote: 'Free for 50 links with click analytics, no card required.',
    included: 'Included',
    notIncluded: 'Not included',
  },
  githubStar: {
    title: 'Support open source',
    body: 'Shortener.dev is open source. A star on GitHub helps more people find it.',
    cta: 'Star on GitHub',
    dismiss: 'Dismiss',
  },
  nav: {
    shortLinks: 'Short links',
    shortLinksDescription: 'Custom back-halves, UTM, expiration, passwords and targeting',
    lifetimeDeal: 'Lifetime deal',
    lifetimeDealDescription: 'Pay once for {links}',
    extension: 'Browser extension',
    extensionDescription: 'Shorten the page you are on from Chrome or Firefox',
    comparisons: 'Comparisons',
    comparisonsDescription: 'How we compare with Bitly, Rebrandly, Dub and others',
    whatsapp: 'WhatsApp link generator',
    socialPreview: 'Social share preview',
    allTools: 'All free tools',
  },
  theme: {
    label: 'Color theme',
    light: 'Light',
    system: 'System',
    dark: 'Dark',
  },
  footer: {
    tagline: 'Short links with click analytics, for marketing teams and developers.',
    compare: 'Compare',
    company: 'Company',
    enterprise: 'Enterprise',
    apiReference: 'API reference',
    alternative: '{name} alternative',
    allComparisons: 'All comparisons',
    about: 'About',
    report: 'Report a link',
    terms: 'Terms of use',
    privacy: 'Privacy policy',
    rights: '© {year} {company} All rights reserved.',
    madeFor: 'Made for marketers and developers.',
    ctaTitle: 'Your next link, shorter and tracked.',
  },
  notFound: {
    title: 'Page not found.',
    accent: 'The link may be old or mistyped.',
    description: 'Check the address, or start again from the home page.',
    home: 'Go to home',
    support: 'Contact support',
  },
  linkBuilder: {
    label: 'URL to shorten',
    placeholder: 'Paste a long URL, e.g. https://example.com/blog/my-post',
    submit: 'Shorten',
    offHost: 'This isn’t a {host} link, but you can shorten it anyway.',
    example: 'Example',
    copy: 'Copy {url}',
    remove: 'Remove from this list',
    signedIn: 'Signed in. Links are saved to your account.',
    signedInAs: 'Signed in as {email}. Links are saved to your account.',
    openDashboard: 'Open dashboard',
    signOut: 'Sign out',
    signInFree: 'Sign in free',
    signInPitch: 'to shorten links, pick the back-half and see click analytics.',
    invalidUrl: 'Enter a valid URL, starting with https://',
    rateLimited: 'Too many links in a minute. Wait a moment and try again.',
    failed: 'Could not shorten this link.',
    sessionExpired: 'Your session has expired. Sign in again to save this link to your account.',
    loginTitle: 'Sign in to save your link',
    loginDescription: 'Sign in to shorten it. The link and its clicks are saved to your account.',
  },
  login: {
    title: 'Sign in or create an account',
    description: 'Continue with Google, or get a one-time code by email.',
    google: 'Continue with Google',
    or: 'or',
    email: 'Email',
    continueEmail: 'Continue with email',
    sending: 'Sending...',
    otpTitle: 'Enter verification code',
    otpDescription: 'We sent a 6-digit code to {email}',
    otpLabel: 'Verification code',
    verify: 'Verify & continue',
    verifying: 'Verifying...',
    back: 'Use a different email',
    invalidEmail: 'Enter a valid email address',
    invalidCode: 'Enter the 6-digit code',
    sendFailed: 'Could not send the code',
    verifyFailed: 'Invalid code',
    tooMany: 'Too many attempts. Wait a minute and try again.',
    captchaRequired: 'Please complete the security check',
  },
  mailForm: {
    send: 'Send email',
    note: 'Opens your email app with this message to {email}.',
    name: 'Name',
    email: 'Email',
    workEmail: 'Work email',
    company: 'Company',
    message: 'Message',
  },
  plans: {
    mostPopular: 'Most popular',
    perMonth: '/month',
    forever: 'forever',
    customPricing: 'Custom pricing',
    free: {
      tagline: 'Try it on a few links',
      links: '50 links',
      analytics: '7 days of click analytics',
      features: [
        'Link expiration and passwords',
        'UTM builder',
        'Social preview cards',
        'Device and geo targeting',
      ],
      cta: 'Start free',
    },
    starter: {
      tagline: 'For solo marketers and creators',
      links: '500 links a month',
      analytics: '30 days of click analytics',
      features: [
        '2 whitelisted domains',
        '3 projects',
        '2 team members',
        'Click reports',
        'API access',
      ],
      cta: 'Choose Starter',
    },
    pro: {
      tagline: 'For marketing teams',
      links: '2,000 links a month',
      analytics: '60 days of click analytics',
      features: ['10 whitelisted domains', '5 projects', '5 team members', 'Everything in Starter'],
      cta: 'Choose Pro',
    },
    business: {
      tagline: 'For agencies and brands',
      links: '15,000 links a month',
      analytics: '90 days of click analytics',
      features: ['25 whitelisted domains', '10 projects', '10 team members', 'Everything in Pro'],
      cta: 'Choose Business',
    },
    enterprise: {
      tagline: 'For organizations with security, compliance and procurement requirements.',
      features: [
        'Unlimited links',
        'Unlimited team members',
        'Compliance audit support',
        'Up to 3 years of click analytics',
        'Whitelisted domains and projects to fit your brands',
        'Contract, invoicing and DPA',
        'Dedicated support',
      ],
      cta: 'Talk to us',
    },
    faqs: [
      {
        q: 'Is there a free plan?',
        a: 'Yes. The free plan includes 50 short links with 7 days of click analytics, no card required. Upgrade when you need more links, more whitelisted domains or API access.',
      },
      {
        q: 'How are links counted on paid plans?',
        a: 'Paid plans count the short links you create in the last 30 days. Clicks are unlimited on every plan, and existing links keep redirecting.',
      },
      {
        q: 'Can I cancel at any time?',
        a: 'Yes. Cancel from the billing page and your plan stays active until the end of the current billing period. It will not renew after that.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'Payments are processed by Stripe. All major credit and debit cards are accepted, including Visa, Mastercard and American Express.',
      },
      {
        q: 'Do you offer a lifetime deal?',
        a: 'Yes, for the first 200 customers. A one-time payment of $99 gives you the Pro plan features with 2,000 links a month, without a monthly subscription.',
      },
      {
        q: 'What does the Enterprise plan include?',
        a: 'Unlimited links and team members, up to 3 years of click analytics, help with your compliance and security audits, a contract with invoicing and a DPA, and dedicated support. Contact us for a quote.',
      },
      {
        q: 'Can I shorten links to my own website?',
        a: 'Yes. Verify your domain to add it to your whitelist, then shorten links to any page on it or its subdomains. Each plan includes a number of whitelisted domains, and popular sites like YouTube, LinkedIn and Amazon are allowed on every plan.',
      },
    ],
  },
  lifetime: {
    links: '2,000 links a month',
    claimed: '{claimed} of {spots} claimed',
    left: 'Only {left} left',
    progress: 'Lifetime deal spots claimed',
    offerEyebrow: 'Lifetime deal · First {spots} customers only',
    offerTitle: 'Get Pro for life. Pay ${price} once.',
    offerBody: 'Every Pro feature with {links}. No subscription, ever.',
    claim: 'Claim lifetime deal',
    seeIncluded: 'See what’s included',
  },
  home: {
    metaTitle: 'Shortener.dev - URL shortener with click analytics',
    metaDescription:
      'Free URL shortener to create short links on your own domain, with click analytics, UTM builder, expiration, passwords, device and geo targeting, and an API.',
    heroLine1: 'Shorten any link',
    heroLine2: 'Share it anywhere',
    heroLine3: 'See every click',
    heroDescription:
      'Short links on your own domain with click analytics, UTM parameters, expiration, passwords, and device and geo targeting.',
    seePricing: 'See pricing',
    yourTeam: 'Your team',
    tryIt: 'Try it',
    dashboardAlt: 'Shortener.dev dashboard listing short links',
    shortenTitle: 'Shorten a link',
    shortenSubtitle: 'Sign in free with Google or your email.',
    steps: ['Paste a long link', 'Share the short one', 'Read the clicks'],
    builderEyebrow: 'Short links',
    builderTitle: 'Every option, on every link',
    builderDescription:
      'Pick the back-half, add UTM parameters, write the social preview, set a password or an expiry date. All link options are on every plan, including free.',
    builderPoints: [
      'Your own back-half and domain',
      'UTM builder and social preview card',
      'Expiration, password, device and geo rules',
    ],
    builderLabel: 'Short link builder',
    builderAlt:
      'Short link builder with expiration, UTM, social preview, password and targeting options',
    analyticsEyebrow: 'Analytics',
    analyticsTitle: 'Know who clicked, and from where',
    analyticsDescription:
      'Every click is counted with its country, city, referrer, browser, operating system and device, so you can see which post, email or poster is working.',
    analyticsPoints: [
      'Clicks by day, country and city',
      'Referrer, browser, OS and device',
      'Raw click reports on paid plans',
    ],
    targetingEyebrow: 'Targeting',
    targetingTitle: 'One link, the right destination',
    targetingDescription:
      'Send iPhone users to the App Store, Android users to Google Play and visitors from each country to their own page, all from the same short link.',
    targetingPoints: [
      'iOS and Android app links',
      'Per-country destinations',
      'Change the destination any time',
    ],
    apiEyebrow: 'Developers',
    apiTitle: 'Shorten from your code',
    apiDescription:
      'A REST API for everything in the dashboard: links, domains, projects, analytics and click reports. Create an API key and send one request.',
    apiPoints: [
      'Create, update and delete links',
      'Read analytics and click reports',
      'OpenAPI spec for any language',
    ],
    openApi: 'OpenAPI spec',
    extrasEyebrow: 'And more',
    extrasTitle: 'Built for teams that share a lot of links',
    extras: {
      domains: {
        title: 'Domains whitelist',
        body: 'Verify your own domains once, then shorten links to any page on them.',
      },
      projects: { title: 'Projects', body: 'Group links by campaign, client or brand.' },
      team: { title: 'Team members', body: 'Invite colleagues to create and manage links together.' },
      expiration: { title: 'Expiration', body: 'Links stop working after the date you set.' },
      safe: { title: 'Safe by default', body: 'Destinations are checked before a link goes live.' },
      fast: { title: 'Fast redirects', body: 'Served from Cloudflare’s network, close to every visitor.' },
    },
    pricingTitle: 'Start free. Upgrade when it works.',
    pricingDescription: 'Clicks are unlimited on every plan. Pay for the links you create.',
    payOnce: 'Prefer to pay once?',
    lifetimeLink: 'Lifetime deal for ${price}',
    toolsTitle: 'Link shorteners for the apps you use',
    faqs: [
      {
        q: 'What is a URL shortener?',
        a: 'A URL shortener turns a long web address into a short link, like srt1.link/spring, that redirects to the original page. Short links are easier to share and let you count the clicks.',
      },
      {
        q: 'Is Shortener.dev free?',
        a: 'Yes. The free plan includes 50 short links with click analytics, and you can sign in and shorten a link right from the form on this page. Paid plans start at $9 a month.',
      },
      {
        q: 'Can I change where a short link points after I share it?',
        a: 'Yes. Edit the destination at any time from the dashboard or the API, and the same short link sends visitors to the new page.',
      },
      {
        q: 'Can I shorten links to my own website?',
        a: 'Yes. Verify your domain once and it joins your whitelist, so you can shorten links to any page on it.',
      },
      {
        q: 'What does the click analytics include?',
        a: 'Clicks over time with country, city, referrer, browser, operating system and device, plus raw click reports on paid plans.',
      },
      {
        q: 'How do you stop abuse?',
        a: 'Destinations are checked against blocklists and safe browsing services before a link is created, and anyone can report a suspicious short link.',
      },
    ],
  },
  pricing: {
    metaTitle: 'Pricing',
    metaDescription:
      'Shorten links for free, or choose a plan from $9 a month for more whitelisted domains, team members, click reports and API access. Enterprise adds unlimited links and compliance support.',
    eyebrow: 'Pricing',
    title: 'Pay for links,',
    accent: 'not for clicks.',
    description:
      'Start free with 50 links. Paid plans add whitelisted domains, team members, click reports and the API. Every plan has unlimited clicks.',
    compare: 'Compare plans',
    feature: 'Feature',
    rows: {
      shortLinks: 'Short links',
      clicks: 'Clicks',
      history: 'Analytics history',
      domains: 'Domains whitelist',
      projects: 'Projects',
      team: 'Team members',
      reports: 'Click reports',
      api: 'API access',
      utm: 'UTM builder and social preview',
      expiration: 'Expiration and passwords',
      targeting: 'Device and geo targeting',
      compliance: 'Compliance audit support',
      contract: 'Contract, invoicing and DPA',
      support: 'Dedicated support',
    },
    unlimited: 'Unlimited',
    custom: 'Custom',
    perMonth: '{n}/mo',
    days: '{n} days',
    years: 'Up to {n} years',
    note: 'Prices in USD, excluding local taxes. Paid plans count links created in the last 30 days.',
  },
  shortLinks: {
    metaTitle: 'Short link builder with click tracking',
    metaDescription:
      'Create custom short links with UTM parameters, social preview, expiration, password protection, iOS and Android deep links, geo targeting and click analytics.',
    eyebrow: 'Short links',
    title: 'Short links',
    accent: 'with everything attached.',
    description:
      'One form for the back-half, UTM parameters, social preview, expiration, password, and device and geo rules, with click analytics on every link.',
    optionsEyebrow: 'Options',
    optionsTitle: 'Eight options, one short link',
    features: {
      backHalf: { title: 'Custom back-half', body: 'srt1.link/spring-sale instead of a random code.' },
      utm: {
        title: 'UTM builder',
        body: 'Add utm_source, utm_medium and utm_campaign without editing the URL.',
      },
      social: {
        title: 'Social preview',
        body: 'Set the title, description and image shown when the link is shared.',
      },
      password: {
        title: 'Password protection',
        body: 'Visitors enter a password before they are redirected.',
      },
      expiration: {
        title: 'Expiration',
        body: 'The link stops redirecting after the date and time you choose.',
      },
      apps: { title: 'iOS and Android', body: 'Send phone visitors to your app in the right store.' },
      geo: { title: 'Geo targeting', body: 'A different destination for each country.' },
      analytics: {
        title: 'Click analytics',
        body: 'Country, city, referrer, browser, OS and device for every click.',
      },
    },
    targetingEyebrow: 'Targeting',
    targetingTitle: 'Route each visitor to the right page',
    targetingDescription:
      'Rules run at the edge before the redirect, so there is no extra page load for the visitor.',
    tryNow: 'Try it now',
    faqs: [
      {
        q: 'What is a short link builder?',
        a: 'A tool to create short links with options beyond the destination URL, like a custom back-half, UTM parameters, a social preview, expiration, password and targeting rules.',
      },
      {
        q: 'Are these options on the free plan?',
        a: 'Yes. Every link option is available on every plan. Paid plans add more links, whitelisted domains, team members, click reports and the API.',
      },
      {
        q: 'Can I edit a link after creating it?',
        a: 'Yes. Change the destination, options or rules at any time; the short link stays the same.',
      },
    ],
  },
  lifetimeDeal: {
    metaTitle: 'Lifetime deal: URL shortener',
    metaDescription:
      'Pay ${price} once for a URL shortener with {links}, 10 whitelisted domains, click analytics, UTM builder, social preview, passwords and device and geo targeting.',
    eyebrow: 'Lifetime deal',
    title: 'Pay once.',
    accent: 'Shorten every month.',
    description:
      'Get the Pro plan for a one-time ${price}: {links} with click analytics, 10 whitelisted domains and the API. No subscription. First {spots} customers only.',
    oneTimePrice: 'One-time price',
    buy: 'Buy lifetime deal',
    rows: {
      links: 'Links',
      analytics: 'Click analytics',
      analyticsValue: '60 days of history',
      domains: 'Domains whitelist',
      domainsValue: '10 domains',
      team: 'Team members',
      projects: 'Projects',
      reports: 'Click reports',
      api: 'API access',
      utm: 'UTM builder and social preview',
      expiration: 'Expiration and password protection',
      targeting: 'iOS, Android and geo targeting',
    },
    faqs: [
      {
        q: 'What does the lifetime deal include?',
        a: 'The features of the Pro plan, with {links}, for a one-time payment of ${price} instead of a monthly subscription.',
      },
      {
        q: 'How many lifetime deals are available?',
        a: 'Only {spots}. Once they are claimed, the lifetime deal closes and Pro is available as a monthly plan only.',
      },
      {
        q: 'Is there a limit on the number of links?',
        a: 'Yes, you can create up to {links}. Clicks are unlimited.',
      },
      {
        q: 'Can I upgrade later?',
        a: 'Yes. If you outgrow the lifetime plan, you can move to the monthly Business plan or talk to us about Enterprise at any time.',
      },
      {
        q: 'Is this deal on AppSumo or other marketplaces?',
        a: 'No. The lifetime deal is only sold on this website.',
      },
      {
        q: 'Is there a refund?',
        a: 'Lifetime purchases are not refundable, so try the free plan first to make sure the product fits your needs.',
      },
    ],
  },
  enterprise: {
    metaTitle: 'Enterprise',
    metaDescription:
      'Shortener.dev for enterprises: unlimited links, a contract with invoicing and a DPA, dedicated support, and a commercial license for self-hosting without AGPLv3 obligations.',
    eyebrow: 'Enterprise',
    title: 'Short links at scale.',
    accent: 'On your terms.',
    description:
      'For organizations with security, compliance and procurement requirements, on our hosted service or on your own Cloudflare account.',
    volume: 'Links per month (approx.)',
    volumePlaceholder: 'e.g. 100,000',
    need: 'What do you need?',
    needPlaceholder: 'Hosted plan, commercial license, self-hosting support, SSO, a DPA…',
    licenseTitle: 'Open source, with a commercial license',
    licenseBody1:
      'The full source of Shortener.dev is on {github} under the AGPLv3. You can self-host it, including commercially, as long as you publish the source of any modified version you run as a network service.',
    licenseBody2:
      'If your organization can’t meet those terms, or needs features, support or guarantees that the open-source edition doesn’t include, a commercial license from {company} covers it.',
    licenseListTitle: 'A commercial license lets you',
    licenseList: [
      'Run a modified version without publishing your changes',
      'Embed Shortener.dev in a proprietary product',
      'Get enterprise features built by the core team',
      'Have a support agreement and SLA for your deployment',
    ],
  },
  about: {
    metaTitle: 'About us',
    metaDescription:
      'Shortener.dev is a URL shortener with click analytics for marketing teams and developers, built by Agenty Analytics.',
    eyebrow: 'About',
    title: 'Short links,',
    accent: 'and what happens after the click.',
    description:
      'Shortener.dev helps marketing teams and developers create short links, route each visitor to the right page, and see where their clicks come from.',
    body1:
      'Shortener.dev is a link shortener and analytics tool for marketing teams. Redirects are served from a global edge network so they are fast everywhere, with a clean dashboard and a documented API.',
    body2:
      'Every link option, from UTM parameters to geo targeting, is on every plan. You pay for the number of links you create, never for clicks.',
    body3: 'Shortener.dev is built by {company}, the team behind Agenty, in India.',
    valuesTitle: 'What we care about',
    values: [
      'Fast redirects, served close to every visitor',
      'Simple pricing, with unlimited clicks',
      'Safe links, with abuse taken seriously',
      'An API for everything in the dashboard',
    ],
    team: 'Team',
    founder: 'Founder',
    questions: 'Questions? {contact} or see the code on {github}.',
    contactUs: 'Contact us',
  },
  contact: {
    metaTitle: 'Contact us',
    metaDescription:
      'Contact the Shortener.dev team with questions about short links, analytics, plans, enterprise pricing or the API.',
    eyebrow: 'Contact',
    title: 'Talk to us.',
    accent: 'A person replies.',
    description:
      'Questions about plans, enterprise pricing, migrating from another shortener or the API? Send a message and we’ll get back to you.',
    report: 'Report a malicious or phishing link',
  },
};

type Widen<T> = T extends string
  ? string
  : T extends ReadonlyArray<infer U>
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;

export default en as Messages;
