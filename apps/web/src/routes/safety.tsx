import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { seo } from '@/lib/seo';
import { GITHUB_URL, SHORT_HOST, SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/safety')({
  head: () =>
    seo({
      title: 'Link safety',
      description:
        'How Shortener.dev keeps phishing, malware and scam links off its short links: verified domains, blocklists, Google Safe Browsing, Cloudflare URL Scanner and human review of reports.',
      path: '/safety',
    }),
  component: Safety,
});

const BLOCKLIST_URL = `${GITHUB_URL}/blob/main/apps/api/data/blocked.ts`;

function Safety() {
  return (
    <LegalPage
      eyebrow="Trust & safety"
      title="How we keep short links safe"
      updated="November 16, 2026"
    >
      <p>
        A short link hides where it goes, which makes it useful to people who want to trick others.
        This page explains how Shortener.dev keeps phishing, malware and scam links off{' '}
        <code>{SHORT_HOST}</code>, what happens when we find one, and what to do if you find one or
        think we made a mistake.
      </p>

      <h2>Every destination is a domain someone owns</h2>
      <p>
        Most URL shorteners will shorten any address. Shortener.dev doesn’t. A short link can only
        point to:
      </p>
      <ul>
        <li>
          A domain the account has verified, with an email code sent to an address on that domain or
          through Google Search Console. Verification covers its subdomains.
        </li>
        <li>
          A popular site on our whitelist, such as YouTube, LinkedIn, Amazon or the app stores, where
          anyone can post content.
        </li>
      </ul>
      <p>
        This means nobody can create a <code>{SHORT_HOST}</code> link to a look-alike of your bank’s
        website unless they control that domain. See{' '}
        <Link to="/docs/$slug" params={{ slug: 'verify-domain' }}>
          Verify a domain
        </Link>{' '}
        for how it works.
      </p>

      <h2>When we check a link</h2>
      <p>
        A link is checked when it’s created and again every time it’s edited. The check covers every
        place the link can send someone:
      </p>
      <ul>
        <li>The main destination</li>
        <li>The iPhone and Android app destinations, if set</li>
        <li>Every geo targeting destination</li>
      </ul>
      <p>
        Links are checked again while they’re in use. When a link is clicked and its last check is
        more than 3 days old, it’s checked again in the background, so a site that turns bad after
        the link was created is still caught.
      </p>

      <h2>What we check for</h2>
      <p>Before a link is created, it’s refused at once when a destination:</p>
      <ul>
        <li>Isn’t a full <code>http://</code> or <code>https://</code> URL</li>
        <li>Uses an IP address or a local name such as <code>localhost</code> instead of a domain</li>
        <li>Points directly to a <code>.bat</code> or <code>.dat</code> file</li>
        <li>Is on a domain that isn’t verified or whitelisted</li>
        <li>
          Is another link shortener, such as <code>bit.ly</code> or <code>tinyurl.com</code>. Chained
          short links hide the real destination.
        </li>
        <li>
          Is on free hosting, a serverless preview or a tunnel, such as <code>*.vercel.app</code>,{' '}
          <code>*.workers.dev</code> or <code>ngrok</code>, which are often used for throwaway
          phishing pages
        </li>
        <li>
          Uses a top-level domain heavily abused for phishing or that looks like a file name, such as{' '}
          <code>.zip</code> and <code>.mov</code>, or an adult content top-level domain
        </li>
        <li>Is on a domain we’ve blocked after an earlier finding or report</li>
      </ul>
      <p>
        The list of blocked domains and top-level domains is{' '}
        <a href={BLOCKLIST_URL} target="_blank" rel="noopener noreferrer">
          public on GitHub
        </a>
        , like the rest of our code.
      </p>
      <p>Once a link is created or edited, every destination is also checked with:</p>
      <ul>
        <li>
          <strong>Google Safe Browsing</strong>, for malware, phishing and deceptive sites, unwanted
          software and potentially harmful apps. Usually within seconds.
        </li>
        <li>
          <strong>Cloudflare URL Scanner</strong>, which visits the homepage of each new destination
          domain in a real browser and reports whether it’s malicious. A domain is scanned at most
          once every 30 days.
        </li>
      </ul>

      <h2>If a link is refused or blocked</h2>
      <p>
        When a destination breaks one of our rules, nothing is created. When you edit a link, the
        change is refused and the link keeps its previous destination. You see a message that says
        why, and{' '}
        <Link to="/docs/$slug" params={{ slug: 'cant-shorten-url' }}>
          Why can’t I shorten this URL?
        </Link>{' '}
        explains each one. Through the API, the request fails with an error that names the domain.
      </p>
      <p>When Safe Browsing or URL Scanner finds a dangerous destination:</p>
      <ul>
        <li>
          The link stops redirecting within a minute. Visitors see a page that says the link was
          blocked, never the destination.
        </li>
        <li>
          The destination’s domain is added to our blocklist, and every other link to it, in any
          account, is blocked as well. Popular whitelisted sites aren’t blocked as a whole, only the
          dangerous link.
        </li>
        <li>
          The accounts that own those links are suspended. They can’t sign in, use API keys, create
          links or delete their data until we review them.
        </li>
        <li>The account owner and admins are emailed with the links and the reason.</li>
      </ul>

      <h2>Before a visitor reaches the destination</h2>
      <p>
        A <code>{SHORT_HOST}</code> link doesn’t jump straight to its destination. It first shows a
        page with the destination’s domain for 2 seconds, so a visitor can close the tab if it isn’t
        what they expected. See{' '}
        <Link to="/docs/$slug" params={{ slug: 'check-short-link-destination' }}>
          How to check where a short link goes
        </Link>{' '}
        to see the full URL without opening it.
      </p>

      <h2>Accounts and signups</h2>
      <p>
        Every short link belongs to an account. There are no anonymous links. Disposable email
        addresses are rejected, signups and password resets are checked with Cloudflare Turnstile and
        limited per IP address, and the API is rate limited so links can’t be created in bulk for
        spam. Using Shortener.dev for phishing, scams, malware, adult content, gambling or spam breaks
        our <Link to="/terms" hash="fair-use">terms of use</Link>.
      </p>

      <h2>Report a dangerous link</h2>
      <p>
        Anyone can report a phishing, malware or scam link, with or without an account, on the{' '}
        <Link to="/report">report a link</Link> page or by emailing{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. All you need is the short link and a
        sentence about what’s wrong. Every report is read by a person, and clear cases such as
        phishing are blocked first and investigated afterwards.
      </p>

      <h2>If you think we got it wrong</h2>
      <p>
        If a safe link was refused, a link was blocked by mistake or your account was suspended,
        email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use the{' '}
        <Link to="/contact">contact</Link> page. Include the short link or destination and why you
        believe it’s safe. Blocked links can’t be switched back on from the dashboard. We review
        each request by hand, reply, and restore the account and its links if they’re safe.
      </p>

      <h2>No check catches everything</h2>
      <p>
        Automated checks can miss phishing and malware sites that are brand new or not yet known. If
        you see a <code>{SHORT_HOST}</code> link that looks suspicious, please{' '}
        <Link to="/report">report it</Link>.
      </p>
    </LegalPage>
  );
}
