/** @jsxImportSource hono/jsx */
import type { Child, FC } from 'hono/jsx';
import { html } from 'hono/html';

/** Seconds the visitor sees the redirect page before the browser navigates */
export const REDIRECT_DELAY = 3;

const HOME_URL = 'https://shortener.dev';
const PROMO_URL = `${HOME_URL}/?utm_source=short_link&utm_medium=redirect_page`;

const css = `
  :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --muted: #475569; --border: #e2e8f0; --accent: #2563eb; --accent-text: #ffffff; --error: #dc2626; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --muted: #94a3b8; --border: #334155; --accent: #3b82f6; --error: #f87171; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 32px 16px; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }
  .card { width: 100%; max-width: 480px; padding: 32px 24px; text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: 12px; }
  h1 { margin: 0 0 12px; font-size: 22px; }
  p { margin: 0 0 12px; color: var(--muted); line-height: 1.5; }
  a { color: var(--accent); }
  .url { display: block; margin: 16px 0; padding: 10px 12px; border-radius: 8px; background: var(--bg); word-break: break-all; font-size: 14px; }
  .spinner { width: 28px; height: 28px; margin: 0 auto 16px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  form { display: flex; gap: 8px; margin-top: 16px; }
  input { flex: 1; min-width: 0; font: inherit; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); }
  .button { display: inline-block; font: inherit; font-weight: 600; padding: 10px 16px; border-radius: 8px; border: 0; background: var(--accent); color: var(--accent-text); text-decoration: none; cursor: pointer; }
  .error { color: var(--error); }
  .footer { font-size: 13px; color: var(--muted); }
  .footer a { color: inherit; }
`;

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
