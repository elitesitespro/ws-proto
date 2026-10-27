"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches. Like ./use-reduced-motion, it answers as
 * the server did (false) while the page hydrates, so the HTML matches, then
 * the real answer straight after, and follows it as it changes.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
