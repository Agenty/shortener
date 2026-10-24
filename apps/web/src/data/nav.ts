import { fmt, type Messages } from '@/i18n';
import { shortenerTools } from './tools';

export const productNav = (t: Messages) => [
  {
    label: t.nav.shortLinks,
    to: '/short-links-builder',
    description: t.nav.shortLinksDescription,
  },
  {
    label: t.nav.lifetimeDeal,
    to: '/lifetime-deal',
    description: fmt(t.nav.lifetimeDealDescription, { links: t.lifetime.links }),
  },
  {
    label: t.nav.comparisons,
    to: '/alternatives',
    description: t.nav.comparisonsDescription,
  },
];

// Tool pages are English only, so their names stay in English
export const toolNav = (t: Messages) => [
  ...shortenerTools.slice(0, 4).map((tool) => ({ label: tool.title, to: `/tools/${tool.slug}` })),
  { label: 'QR code generator', to: '/tools/qr-code-generator' },
  { label: t.nav.whatsapp, to: '/tools/whatsapp-link-generator' },
  { label: t.nav.socialPreview, to: '/tools/social-share-preview' },
  { label: t.nav.allTools, to: '/tools' },
];
