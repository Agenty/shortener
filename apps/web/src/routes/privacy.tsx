import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { seo } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: 'Privacy policy',
      description:
        'What personal information Shortener.dev and its browser extension collect, how we use, store, share and protect it, and your choices.',
      path: '/privacy',
    }),
  component: Privacy,
});

const processors = [
  ['Cloudflare', 'Hosting, CDN, database, file storage and Turnstile bot protection', 'Global'],
  ['Stripe', 'Payment processing', 'Global'],
  ['Google', 'Sign in with Google, Safe Browsing checks', 'Global'],
  ['GitHub', 'Sign in with GitHub', 'United States'],
  ['VirusTotal', 'Checking link destinations for malware', 'Global'],
];

function Privacy() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="October 30, 2026">
      <p>
        Shortener.dev (“we”, “us”) respects your privacy. This policy explains what personal
        information we collect through the Shortener.dev website, web app, API and the Shortener.dev
        browser extension (together, the “Service”), how we use, store and share it, and your
        choices. Shortener.dev is a product of Agenty Analytics Pvt. Ltd., 48, 1st Floor, Omaxe
        Galleria, Sector 14, Bahadurgarh, Haryana, India (company registration no.
        U72900HR2018PTC072172).
      </p>
      <p>
        By using Shortener.dev you agree to the <Link to="/terms">Terms of use</Link> and confirm you
        have read this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong>: your name, email address, company name and password
          (stored only as a hash), or your basic profile from Google or GitHub if you sign in with
          them. For paid plans, our payment processor shares limited card details with us, such as
          the last four digits, country and expiry date. We never receive or store full card numbers.
        </li>
        <li>
          <strong>Content you create</strong>: short links, their destination URLs, titles and
          settings, custom domains, API keys, and messages you send to support.
        </li>
        <li>
          <strong>Click data</strong>: when someone opens a short link we record the time, country,
          city, referrer, browser, operating system and device, to provide analytics to the link
          owner. We use the visitor’s IP address to look up the location and do not show it to the
          link owner.
        </li>
        <li>
          <strong>Usage data</strong>: IP address, browser and device information, and how you use
          the Service, to keep it secure and improve it.
        </li>
      </ul>

      <h2>Browser extension</h2>
      <p>The Shortener.dev extension for Chrome and Firefox handles the following data:</p>
      <ul>
        <li>
          <strong>Web address of the current tab</strong>: only for the tab you open the extension
          on, or the link or page you right click and choose “Shorten”. The address is shown in the
          extension and sent to our API only when you choose to shorten it. The extension does not
          read page content, does not track your browsing history and does not run on the pages you
          visit.
        </li>
        <li>
          <strong>Sign in token</strong>: after you sign in, a token for your account is kept in the
          browser’s extension storage so you stay signed in. Signing out removes it.
        </li>
        <li>
          <strong>Preferences</strong>: your light or dark theme, and the last link picked from the
          right click menu, are kept in the browser’s extension storage on your device.
        </li>
        <li>
          <strong>Your links and analytics</strong>: the extension loads your short links, domains
          and click analytics from our API to show them to you.
        </li>
      </ul>
      <p>
        When the extension is installed or removed, it opens a page on shortener.dev with the
        browser name and extension version so we can show setup help and collect optional feedback.
        The extension contains no ads, analytics or third party tracking code.
      </p>

      <h2>How we use your information</h2>
      <p>We use personal information only to:</p>
      <ul>
        <li>provide the Service, including creating short links and showing you click analytics;</li>
        <li>sign you in and keep your account secure;</li>
        <li>detect spam, phishing, malware and other abuse of short links;</li>
        <li>process payments and send invoices;</li>
        <li>answer support requests;</li>
        <li>tell you about important account, product and API changes;</li>
        <li>understand how the Service is used so we can fix problems and improve it.</li>
      </ul>
      <p>
        We do not sell personal information, use it for advertising, or use it to determine
        creditworthiness or for lending. We do not allow people to read your data except with your
        consent, for security or abuse investigations, to comply with the law, or when the data is
        aggregated and anonymized for internal operations.
      </p>

      <h2>How we store and protect it</h2>
      <p>
        Your data is stored in Cloudflare’s data centers. All data is encrypted in transit with HTTPS
        and at rest. Passwords are stored only as hashes, and the Service runs
        behind Cloudflare’s network and web application firewall. Access to production data is
        limited to staff who need it to run the Service.
      </p>

      <h2>How we share it</h2>
      <p>
        We share data only with the service providers below, and only as needed for them to perform
        their function for us. Link destinations are sent to Google Safe Browsing and VirusTotal to
        check them for malware and phishing.
      </p>
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
      <p>
        Short links are public by design: anyone with a short link can open it and reach its
        destination. We may also share information when we believe it is necessary to comply with
        the law or a legal request, to investigate abuse of the Service, or as part of a merger or
        acquisition, in which case this policy continues to apply.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your information while your account is active. Click analytics are available for the
        history your plan includes. When you delete your account, we delete your account information,
        links and analytics within 30 days, except records we must keep for legal, tax or fraud
        prevention reasons. Data kept only in the browser extension is removed when you sign out or
        uninstall the extension.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and prevent fraud, and store your theme
        preference in your browser. We do not use advertising cookies. You can manage cookies in your
        browser settings.
      </p>

      <h2>Sign in with Google</h2>
      <p>
        When you sign in with Google we receive your name and email address, and use them only to create and sign in to your account. Shortener.dev’s use and transfer of
        information received from Google APIs adheres to the{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can view and update your profile in the app, delete individual links at any time,
        unsubscribe from emails using the link in any email, and uninstall the browser extension at
        any time. You can delete your account and its data from the account settings in the app, or ask
        us by email for a copy of your data, to correct it, or to delete it. We respond within 30
        days.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not directed to children under 16, and we do not knowingly collect their
        personal information.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We will post any changes on this page and update the date above. For significant changes we
        will also email account owners.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests about your data: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
