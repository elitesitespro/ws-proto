"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the visitor has asked for less motion. motion's own hook reads the
 * setting on the very first render, which the server can't, so for anyone
 * who has it on, a page hydrated with it doesn't match its HTML and React
 * throws the tree away and renders it again. This one answers as the server
 * did (false) while the page hydrates, then the real answer straight after,
 * and follows the setting if it changes.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
