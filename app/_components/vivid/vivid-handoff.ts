import { motionValue } from "motion/react";

// The dashboard's Ask Vivid globe hands over to the Vivid section's: how far
// it has lifted off (0: still in the dock; above 0, the section's globe has
// it). The section sets it as you scroll; the dock hides its own globe while
// it's away. The dock's globe carries data-vivid-dock, for the section to
// find where it lifts off from.
export const dockLift = motionValue(0);

// Then Vivid's intro hands its globe down to the ask pill at the foot of the
// screen: how far it has come down (0: the intro still has it, or the page
// hasn't got there; 1: it's landed, and the pill is Vivid from then on). The
// intro sets it as you scroll, so it goes back up if you scroll back. The
// pill lays out an empty fixed marker, data-vivid-pill-anchor, at the centre
// of the circle it opens from (PILL_H across), visible or not, for the intro
// to land its globe on.
export const pillDock = motionValue(0);
/** The pill's height, and so the circle it's born as (px). */
export const PILL_H = 58;
