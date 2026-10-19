import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { useTheme } from 'next-themes';
import { OPENAPI_URL } from '@/lib/site';

/** Scalar API reference for the Shortener.dev OpenAPI spec. Browser only, load it lazily */
export function ScalarWrapper() {
  const { resolvedTheme } = useTheme();

  return (
    <ApiReferenceReact
      configuration={{
        sources: [
          {
            title: 'Shortener.dev API',
            slug: 'shortener-api',
            url: OPENAPI_URL,
            default: true,
            agent: { disabled: true },
          },
        ],
        withDefaultFonts: false,
        // Hide Scalar's own tooling and upsells, keep the reference and "Test Request"
        showDeveloperTools: 'never',
        mcp: { disabled: true },
        hideDarkModeToggle: true,
        forceDarkModeState: resolvedTheme === 'dark' ? 'dark' : 'light',
        customCss: `.scalar-app { --scalar-font: 'Inter', ui-sans-serif, system-ui, sans-serif; --scalar-font-code: 'JetBrains Mono', ui-monospace, monospace; }`,
      }}
    />
  );
}
