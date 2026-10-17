import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { seo } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/terms')({
  head: () =>
    seo({
      title: 'Terms of use',
      description:
        'The terms you agree to when you use the Shortener.dev website, software, services or API, including fair use of short links.',
      path: '/terms',
    }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use" updated="October 17, 2026">
      <p>
        By accessing the Shortener.dev website, software, services or API (the “Service”), you agree
        to the terms of use below. Shortener.dev is operated by Agenty Analytics Pvt. Ltd.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may change these terms at any time. The latest version is always available from the
        “Terms of use” link at the bottom of every page.
      </p>

      <h2>Software use and licensing</h2>
      <p>
        The Service is protected by copyright. Unauthorized reproduction, redistribution, reselling,
        distribution of our data, or scraping of the Service is prohibited.
      </p>

      <h2>Accounts and security</h2>
      <p>
        You must provide accurate information when you register and keep your password and API keys
        confidential. You are responsible for activity on your account and must report any security
        breach promptly.
      </p>

      <h2 id="fair-use">Fair use</h2>
      <p>
        You are responsible for the short links you create and the content they point to. The
        Service must not be used for:
      </p>
      <ul>
        <li>Phishing, scams, malware or other deceptive or harmful websites</li>
        <li>Pornography or adult content</li>
        <li>Betting or gambling</li>
        <li>Content that infringes copyright or other rights</li>
        <li>Spam, or hiding the destination of a link to bypass filters</li>
      </ul>
      <p>
        We may disable links, and suspend or terminate accounts, that we believe at our sole
        discretion break these terms. To report abuse, use the{' '}
        <Link to="/report">report a link</Link> page.
      </p>

      <h2>Fees, payments and refunds</h2>
      <p>
        Some features require a paid <Link to="/pricing">plan</Link>. Prices exclude local taxes,
        which you are responsible for. Payments are processed by Stripe; we do not store card
        details. No refunds are given once a billing period has started or a lifetime deal has been
        purchased, but you can cancel a subscription at any time so it does not renew.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep short links redirecting at all times but do not guarantee uninterrupted
        service. Links created without an account may expire and be deleted after 24 hours.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Agenty Analytics Pvt. Ltd. and its licensors own all rights in the Service. These terms do
        not grant you any ownership rights or a license to use the Shortener.dev name or logo.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
