import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { seo } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: 'Privacy policy',
      description:
        'What personal information Shortener.dev collects, how we use and protect it, the processors we work with and your choices.',
      path: '/privacy',
    }),
  component: Privacy,
});

const processors = [
  ['Cloudflare', 'Hosting, CDN, database and file storage', 'Global'],
  ['Stripe', 'Payment processing', 'Global'],
  ['Google', 'Sign in with Google, reCAPTCHA, Safe Browsing checks', 'Global'],
  ['GitHub', 'Sign in with GitHub', 'United States'],
  ['VirusTotal', 'Checking link destinations for malware', 'Global'],
];

function Privacy() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="October 17, 2026">
      <p>
        Shortener.dev (“we”, “us”) respects your privacy. This policy explains what personal
        information we collect, what we do with it, and your choices. Shortener.dev is a product of
        Agenty Analytics Pvt. Ltd., 48, 1st Floor, Omaxe Galleria, Sector 14, Bahadurgarh, Haryana,
        India (company registration no. U72900HR2018PTC072172).
      </p>
      <p>
        By using Shortener.dev you agree to the <Link to="/terms">Terms of use</Link> and confirm you
        have read this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong>: your name, email address and company name. For paid
          plans, our payment processor shares limited card details with us, such as the last four
          digits, country and expiry date.
        </li>
        <li>
          <strong>Content you create</strong>: short links, their destinations and settings, and
          messages you send to support.
        </li>
        <li>
          <strong>Click data</strong>: when someone opens a short link we record the time, country,
          city, referrer, browser, operating system and device, to provide analytics to the link
          owner.
        </li>
        <li>
          <strong>Usage data</strong>: IP address, browser and device information, and how you use
          the Service, to keep it secure and improve it.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <p>
        We use personal information only to provide, secure and improve the Service, to bill you,
        and to tell you about important product and API changes. We never sell personal information.
      </p>

      <h2>How we protect it</h2>
      <p>
        We keep records secure, encrypt passwords and tokens, and run the Service behind Cloudflare’s
        network and web application firewall.
      </p>

      <h2>Processors</h2>
      <p>We share data only with service providers that help us run the Service:</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {processors.map(([name, purpose, location]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{purpose}</td>
              <td>{location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Data retention</h2>
      <p>
        We keep your information while your account is active and as long as needed for legal
        obligations, then delete it. Click analytics are available for the history your plan
        includes. Links created without an account expire after 24 hours.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and prevent fraud, and store your theme
        preference in your browser. You can manage cookies in your browser settings.
      </p>

      <h2>Sign in with Google</h2>
      <p>
        Shortener.dev’s use and transfer of information received from Google APIs adheres to the{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>Legal compliance</h2>
      <p>
        We may share information when we believe it is necessary to comply with the law or a legal
        request, or to investigate abuse of the Service.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update your profile in the app, unsubscribe from emails using the link in any email,
        and ask us to delete your account and data.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests about your data: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
