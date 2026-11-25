import { useEffect } from "react";
import { useMatches } from "react-router";
import { useI18n, type Messages } from "@/i18n";
import { formatTitle } from "@/lib/titles";

export type TitleKey = keyof Messages["titles"];

/**
 * Mount once at the app root. Updates document.title on every route change
 * from the deepest matched route's `handle.title` (set in App.tsx).
 */
export function DocumentTitle() {
  const { t } = useI18n();
  const matches = useMatches();
  const key = matches
    .map((m) => (m.handle as { title?: TitleKey } | undefined)?.title)
    .filter(Boolean)
    .pop();
  const title = key ? t.titles[key] : undefined;

  useEffect(() => {
    document.title = title ? formatTitle(title) : t.meta.title;
  }, [title, t]);

  return null;
}
