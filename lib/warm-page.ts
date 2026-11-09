import { WARM_VIEWS, warmPlatformViews } from "@/app/_components/platform-view";

/**
 * The rest of the page, made ready while the hero's loader is still up
 * (hero-loader.tsx), so that scrolling down it never waits on a download:
 *
 * - every platform's demo on the dial: its own chunk (script and styles), and
 *   its pictures, by putting it on once out of sight (platform-view.tsx);
 * - every picture already on the page that's waiting to load as it comes
 *   near (the street's billboards, the wallet, Vivid, the way in), fetched
 *   now and decoded, so it paints the moment it's scrolled to;
 * - the polar night under the dial, which the dial only asks for as it
 *   comes near (data-near, platform-timeline-section.tsx).
 *
 * `progress` is told the share that's in, 0 to 1, as each lands. A picture
 * that fails counts as in: it's not worth holding the page for.
 */
export function warmPage(progress: (share: number) => void): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  let landed = 0;
  let total = WARM_VIEWS;
  const land = () => progress(Math.min(++landed / total, 1));

  const dial = document.querySelector<HTMLElement>('[aria-labelledby="platform-timeline-heading"]');
  if (dial) dial.dataset.near = "";

  for (const img of Array.from(document.images)) {
    if (img.complete && img.naturalWidth > 0) continue;
    if (img.loading === "lazy") img.loading = "eager";
    jobs.push(img.decode().catch(() => {}).finally(land));
  }
  total += jobs.length;
  jobs.push(warmPlatformViews(land).catch(() => {}));
  return Promise.all(jobs).then(() => {});
}
