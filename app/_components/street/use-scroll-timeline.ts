import { useSyncExternalStore } from "react";

const never = () => () => {};
const supported = () =>
  CSS.supports("animation-timeline", "view()") && CSS.supports("animation-range", "exit 0% exit 100%");

/**
 * Whether the browser runs animations on a view of the page as it scrolls
 * (scroll-driven animations, with their ranges): then the street's drive and
 * the wallet's opening are keyframes it keeps in step with the scroll itself,
 * however fast the page is flung or busy the page is. False on the server and
 * where there are none (they follow the scroll by script there).
 */
export function useScrollTimeline() {
  return useSyncExternalStore(never, supported, () => false);
}
