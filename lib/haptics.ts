/**
 * A tick under the finger, like a dial clicking into place: the shortest
 * buzz, on phones that have one (Android; an iPhone ignores it). Only on a
 * touchscreen, once the visitor has touched the page (the browser refuses
 * it before that), and never with reduced motion.
 */
export function tick() {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!navigator.userActivation?.hasBeenActive) return;
  if (!matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(8);
}
