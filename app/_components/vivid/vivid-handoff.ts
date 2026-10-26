import { motionValue } from "motion/react";

// The dashboard's Ask Vivid globe hands over to the Vivid section's: how far
// it has lifted off (0: still in the dock; above 0, the section's globe has
// it). The section sets it as you scroll; the dock hides its own globe while
// it's away. The dock's globe carries data-vivid-dock, for the section to
// find where it lifts off from.
export const dockLift = motionValue(0);
