import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getTitleForPath } from "@/lib/titles";

/**
 * Mount once at the app root. Updates document.title on every route change
 * based on the map defined in src/lib/titles.ts.
 */
export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleForPath(pathname);
  }, [pathname]);

  return null;
}
