/** @jsxImportSource hono/jsx */
import type { Child, FC } from 'hono/jsx';
import { html } from 'hono/html';

/** Seconds the visitor sees the redirect page before the browser navigates */
export const REDIRECT_DELAY = 2;

const HOME_URL = 'https://shortener.dev';
const PROMO_URL = `${HOME_URL}/?utm_source=short_link&utm_medium=redirect_page`;

/* Same neutral tokens as apps/web/src/styles.css so the page reads as part of the website */
const css = `
  :root {
    --background: oklch(1 0 0); --foreground: oklch(0.145 0 0); --card: oklch(1 0 0);
    --primary: oklch(0.205 0 0); --primary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.97 0 0); --muted-foreground: oklch(0.556 0 0);
    --border: oklch(0.922 0 0); --ring: oklch(0.708 0 0); --destructive: oklch(0.577 0.245 27.325);
    --surface: oklch(0.975 0.003 260); --brand: oklch(0.55 0.2 262); --brand-2: oklch(0.55 0.22 292);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --background: oklch(0.145 0 0); --foreground: oklch(0.985 0 0); --card: oklch(0.205 0 0);
      --primary: oklch(0.922 0 0); --primary-foreground: oklch(0.205 0 0);
      --muted: oklch(0.269 0 0); --muted-foreground: oklch(0.708 0 0);
      --border: oklch(1 0 0 / 10%); --ring: oklch(0.556 0 0); --destructive: oklch(0.704 0.191 22.216);
      --surface: oklch(0.175 0 0); --brand: oklch(0.7 0.15 262); --brand-2: oklch(0.7 0.16 292);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; padding: 32px 16px;
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; color: var(--foreground);
    background:
      radial-gradient(60% 50% at 0% 0%, color-mix(in oklch, var(--brand) 10%, transparent), transparent),
      radial-gradient(50% 50% at 100% 100%, color-mix(in oklch, var(--brand-2) 10%, transparent), transparent),
      var(--surface);
  }
  .logo { display: flex; align-items: center; gap: 8px; color: var(--foreground); text-decoration: none; }
  .logo svg.mark { width: 32px; height: 32px; }
  .logo svg.wordmark { height: 17.6px; width: auto; }
  .card { width: 100%; max-width: 440px; padding: 36px 28px; text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 1px 2px oklch(0 0 0 / 4%), 0 12px 32px -12px oklch(0 0 0 / 12%); }
  h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; text-wrap: balance; }
  p { margin: 0 0 12px; font-size: 15px; color: var(--muted-foreground); line-height: 1.55; }
  a { color: var(--foreground); text-underline-offset: 3px; }
  .url { display: block; margin: 20px 0 16px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--muted); color: var(--foreground); word-break: break-all; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; font-size: 13px; text-decoration: none; }
  .url:hover { border-color: var(--ring); }
  .spinner { width: 28px; height: 28px; margin: 0 auto 20px; border: 2.5px solid var(--border); border-top-color: var(--foreground); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2.4s; } }
  form { display: flex; gap: 8px; margin-top: 20px; }
  input { flex: 1; min-width: 0; height: 40px; font: inherit; font-size: 14px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--foreground); }
  input:focus { outline: none; border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent); }
  .button { display: inline-flex; align-items: center; justify-content: center; height: 40px; font: inherit; font-size: 14px; font-weight: 500; padding: 0 18px; border-radius: 8px; border: 0; background: var(--primary); color: var(--primary-foreground); text-decoration: none; cursor: pointer; transition: opacity 0.15s; }
  .button:hover { opacity: 0.9; }
  .error { color: var(--destructive); }
  .footer { margin: 0; font-size: 13px; color: var(--muted-foreground); }
  .footer a { color: inherit; }
`;

/** Inline copies of LogoMark and Wordmark from apps/web/src/components/logo.tsx */
const WORDMARK_LETTERS =
  'M8.7 7.9C7.8 6.4 6.4 6 5.2 6C3.4 6 2.1 7 2.1 8.6C2.1 11.9 8.9 10.2 8.9 13.3C8.9 15 7.4 16 5.4 16C3.9 16 2.5 15.4 1.7 14.1M13 1.2V16M13 16V10.5A4.5 4.5 0 0 1 22 10.5V16M25.9 11A5 5 0 1 0 35.9 11A5 5 0 1 0 25.9 11ZM39.8 6V16M39.8 16V11A5 5 0 0 1 44.8 6H45.8M50.4 2.6V12.8A3.2 3.2 0 0 0 53.6 16H54.6M48.2 6H54.4M57.5 11H67.5A5 5 0 1 0 66.04 14.54M71.4 6V16M71.4 16V10.5A4.5 4.5 0 0 1 80.4 10.5V16M84.3 11H94.3A5 5 0 1 0 92.84 14.54M98.2 6V16M98.2 16V11A5 5 0 0 1 103.2 6H104.2M120.8 11A5 5 0 1 0 110.8 11A5 5 0 1 0 120.8 11ZM120.8 1.2V16M124.7 11H134.7A5 5 0 1 0 133.24 14.54M138.6 6L143.4 16L148.2 6';

const Logo: FC = () => (
  <a class="logo" href={HOME_URL} aria-label="shortener.dev">
    <svg class="mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="var(--foreground)" />
      <path
        transform="translate(-3.5 -3) scale(0.94)"
        d="M43 20.5C39.5 15 25 14 21.5 21.5C18.5 28.5 28 30.5 32 31.5C37.5 33 46 35.5 42.5 43C39 50.5 24 50 20 43.5"
        fill="none"
        stroke="var(--background)"
        stroke-width="7.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M37 35V54.5L42 50L45.4 57.4L49.4 55.6L46 48.4H52.8Z"
        fill="var(--background)"
        stroke="var(--foreground)"
        stroke-width="3.2"
        stroke-linejoin="round"
        paint-order="stroke"
      />
    </svg>
    <svg class="wordmark" viewBox="0 0 149.7 17.4" aria-hidden="true">
      <path
        d={WORDMARK_LETTERS}
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="107.2" cy="14.6" r="1.75" fill="currentColor" opacity="0.45" />
    </svg>
  </a>
);

const Layout: FC<{ title: string; head?: Child; children?: Child }> = ({
  title,
  head,
  children,
}) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex" />
      <title>{title}</title>
      {head}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </head>
    <body>
      <Logo />
      <main class="card">{children}</main>
      <p class="footer">
        Powered by <a href={HOME_URL}>shortener.dev</a>
      </p>
    </body>
  </html>
);

const RedirectPage: FC<{ url: string }> = ({ url }) => (
  <Layout
    title="Redirecting..."
    head={<meta http-equiv="refresh" content={`${REDIRECT_DELAY};url=${url}`} />}
  >
    <div class="spinner" />
    <h1>You are being redirected</h1>
    <p>Taking you to the destination in {REDIRECT_DELAY} seconds</p>
    <a class="url" href={url} rel="noreferrer">
      {url}
    </a>
    <p>
      Not redirected?{' '}
      <a href={url} rel="noreferrer">
        Click here
      </a>
    </p>
  </Layout>
);

const PasswordPage: FC<{ invalid: boolean }> = ({ invalid }) => (
  <Layout title="Password protected link">
    <h1>This link is password protected</h1>
    <p>Enter the password to continue to the destination.</p>
    {invalid && <p class="error">Incorrect password, try again.</p>}
    <form method="post">
      <input type="password" name="password" placeholder="Password" required autofocus />
      <button class="button" type="submit">
        Continue
      </button>
    </form>
  </Layout>
);

const UnavailablePage: FC<{ reason: 'expired' | 'not-found' }> = ({ reason }) => (
  <Layout title={reason === 'expired' ? 'Link expired' : 'Link not found'}>
    <h1>{reason === 'expired' ? 'This link has expired' : 'This link is not available'}</h1>
    <p>
      This short link was created using <a href={HOME_URL}>shortener.dev</a> and{' '}
      {reason === 'expired' ? 'has now expired' : 'has been deleted or disabled'}.
    </p>
    <p>
      Create your own branded short links with click analytics, UTM tracking, geo-targeting and
      password protection. Free to start.
    </p>
    <a class="button" href={PROMO_URL}>
      Create a short link
    </a>
  </Layout>
);

const doc = (page: Child) => html`<!doctype html>${page}`;

export const redirectPage = (url: string) => doc(<RedirectPage url={url} />);

export const passwordPage = (invalid: boolean) => doc(<PasswordPage invalid={invalid} />);

export const unavailablePage = (reason: 'expired' | 'not-found') =>
  doc(<UnavailablePage reason={reason} />);
