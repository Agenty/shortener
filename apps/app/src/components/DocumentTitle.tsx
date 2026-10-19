import { useEffect } from "react";
import { useMatches } from "react-router";
import { formatTitle } from "@/lib/titles";

/**
 * Mount once at the app root. Updates document.title on every route change
 * from the deepest matched route's `handle.title` (set in App.tsx).
 */
export function DocumentTitle() {
  const matches = useMatches();
  const title = matches
    .map((m) => (m.handle as { title?: string } | undefined)?.title)
    .filter(Boolean)
    .pop();

  useEffect(() => {
    document.title = formatTitle(title);
  }, [title]);

  return null;
}
