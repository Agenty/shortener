import { shortenerTools } from './tools';

export const productNav = [
  {
    label: 'Short links',
    to: '/short-links-builder',
    description: 'Custom back-halves, UTM, expiration, passwords and targeting',
  },
  {
    label: 'Lifetime deal',
    to: '/lifetime-deal',
    description: 'Pay once for 500 links a month',
  },
  {
    label: 'Comparisons',
    to: '/alternatives',
    description: 'How we compare with Bitly, Rebrandly, Dub and others',
  },
];

export const toolNav = [
  ...shortenerTools.slice(0, 4).map((tool) => ({ label: tool.title, to: `/tools/${tool.slug}` })),
  { label: 'WhatsApp link generator', to: '/tools/whatsapp-link-generator' },
  { label: 'Social share preview', to: '/tools/social-share-preview' },
  { label: 'All free tools', to: '/tools' },
];
