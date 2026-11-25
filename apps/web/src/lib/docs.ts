import GithubSlugger from 'github-slugger';

export type DocHeading = { depth: 2 | 3; text: string; id: string };

export type Doc = {
  slug: string;
  title: string;
  /** Shorter sidebar label, defaults to the title */
  nav: string;
  description: string;
  section: string;
  order: number;
  /** Markdown body without the frontmatter */
  body: string;
  headings: DocHeading[];
};

/** Sidebar sections, in display order */
export const DOC_SECTIONS = ['Get started', 'Short links', 'Link options', 'Domains', 'Analytics', 'Team and API'];

/** Docs are markdown files in `apps/web/docs`, bundled as raw strings at build time */
const files = import.meta.glob('../../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Minimal `key: value` frontmatter, enough for title, description, section and order */
function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {} as Record<string, string>, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    data[line.slice(0, index).trim()] = line
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }
  return { data, body: raw.slice(match[0].length) };
}

/** h2 and h3 headings with the same ids rehype-slug gives them */
function extractHeadings(body: string): DocHeading[] {
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];
  let inCode = false;
  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith('```')) inCode = !inCode;
    if (inCode) continue;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!match) continue;
    // Strip inline markdown so the TOC shows the rendered text
    const text = match[2].replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const id = slugger.slug(text);
    const depth = match[1].length;
    if (depth === 2 || depth === 3) headings.push({ depth, text, id });
  }
  return headings;
}

export const docs: Doc[] = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    return {
      slug,
      title: data.title ?? slug,
      nav: data.nav ?? data.title ?? slug,
      description: data.description ?? '',
      section: data.section ?? 'Get started',
      order: Number(data.order ?? 99),
      body,
      headings: extractHeadings(body),
    };
  })
  .sort(
    (a, b) =>
      DOC_SECTIONS.indexOf(a.section) - DOC_SECTIONS.indexOf(b.section) || a.order - b.order
  );

/** `index.md` is the docs home at `/docs` */
export const docPath = (slug: string) => (slug === 'index' ? '/docs' : `/docs/${slug}`);

export const getDoc = (slug: string) => docs.find((doc) => doc.slug === slug);

export const docsNav = DOC_SECTIONS.map((section) => ({
  section,
  items: docs
    .filter((doc) => doc.section === section)
    .map((doc) => ({ label: doc.nav, to: docPath(doc.slug) })),
}))
  .map((group) =>
    group.section === 'Team and API'
      ? { ...group, items: [...group.items, { label: 'API reference', to: '/docs/api' }] }
      : group
  )
  .filter((group) => group.items.length);

/** Previous and next pages in sidebar order */
export function getPager(slug: string) {
  const index = docs.findIndex((doc) => doc.slug === slug);
  return { prev: docs[index - 1], next: docs[index + 1] };
}
