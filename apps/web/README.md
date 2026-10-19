# shortener-web

Marketing website for [shortener.dev](https://shortener.dev): TanStack Start (SSR) on Cloudflare Workers, Tailwind and shadcn (Base UI) with the same theme tokens as `apps/app`.

```bash
npm run dev          # http://localhost:3000, runs in workerd via @cloudflare/vite-plugin
npm run build        # dist/client (assets) + dist/server (worker)
npm run deploy       # build, then wrangler deploy
npm run check-types
```

## Layout

- `src/routes/` file routes. Every route sets `head()` through `seo()` in `src/lib/seo.ts` (title, description, canonical, Open Graph, Twitter card, JSON-LD).
- `src/routes/sitemap[.]xml.ts` serves `/sitemap.xml`; `public/robots.txt` points to it.
- `src/components/link-builder.tsx` is the public short link form, shared by the home page and every `/tools/*-link-shortener` page.
- `src/data/` holds page content: `tools.ts` (one entry per `/tools/$slug` page), `alternatives.ts` (`/alternatives/$slug`), `plans.ts` (mirrors `apps/api/models/plan.ts`).
- `public/images/` holds light and dark dashboard screenshots, swapped with the theme by `ThemedScreenshot`.

## Adding a link shortener tool page

Add an entry to `shortenerTools` in `src/data/tools.ts`. The page, nav, footer and sitemap pick it up.

## API

In dev the site calls `http://localhost:8787/v1`, in production `https://api.shortener.dev/v1` (`src/lib/site.ts`):

- `POST /public/links` from the link builder (anonymous 24-hour links)
- `GET /public/meta` from the social share preview tool
- `POST /public/unsubscribe` from `/unsubscribe`
