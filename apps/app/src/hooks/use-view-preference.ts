import { useState, useCallback } from "react";
import { useIsMobile } from "./use-mobile";

type ViewMode = "list" | "grid";

export function useViewPreference(key: string = "links-view") {
  const isMobile = useIsMobile();

  const [view, setViewState] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(key);
    if (stored === "list" || stored === "grid") return stored;
    return isMobile ? "list" : "grid";
  });

  const setView = useCallback(
    (mode: ViewMode) => {
      setViewState(mode);
      localStorage.setItem(key, mode);
    },
    [key],
  );

  return [view, setView] as const;
}
