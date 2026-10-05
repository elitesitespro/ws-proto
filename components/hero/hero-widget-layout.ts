export type SlotPlacement = {
  x: string | number;
  y: string | number;
  width?: string | number;
  maxWidth?: string | number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
};

export type FloatingSlotConfig = {
  id: string;
  desktop: SlotPlacement;
  large?: SlotPlacement;
  tablet?: SlotPlacement;
  mobile?: SlotPlacement;
  parallax?: number;
  className?: string;
};

// Each breakpoint has its own placement. Omit a breakpoint to hide that slot.
export const heroWidgetLayout = [
  {
    id: "slot-01",
    desktop: { x: "5%", y: "6%", width: 340, rotation: 9, zIndex: 3 },
    large: { x: 8, y: 80, width: 280, rotation: 5, zIndex: 3 },
    tablet: { x: "2%", y: "2%", width: 280, rotation: 5, zIndex: 3 },
    parallax: 0.06,
  },
  {
    id: "slot-02",
    desktop: { x: "32%", y: "15%", width: 96, rotation: 2, zIndex: 1 },
    parallax: -0.04,
  },
  {
    id: "slot-03",
    desktop: { x: "44%", y: "2%", width: 316, rotation: -2, zIndex: 2 },
    large: { x: "calc(100% - 312px)", y: 616, width: 296, rotation: 3, zIndex: 2 },
    parallax: 0.08,
  },
  {
    id: "slot-04",
    desktop: { x: "70%", y: "7%", width: 296, rotation: -11, zIndex: 3 },
    large: { x: "calc(100% - 312px)", y: 128, width: 296, rotation: -6, zIndex: 3 },
    tablet: { x: "calc(100% - 312px)", y: "20%", width: 296, rotation: -6, zIndex: 3 },
    mobile: { x: -48, y: 96, width: 296, rotation: -4, zIndex: 3 },
    parallax: 0.12,
  },
  {
    id: "slot-05",
    desktop: { x: "4%", y: "43%", width: 280, rotation: 2, zIndex: 2 },
    large: { x: -64, y: 352, width: 280, rotation: 2, zIndex: 2 },
    parallax: -0.05,
  },
  {
    id: "slot-06",
    desktop: { x: "calc(100% - 348px)", y: "46%", width: 340, rotation: -2, zIndex: 1 },
    large: { x: "calc(100% - 208px)", y: 352, width: 320, rotation: -2, zIndex: 1 },
    mobile: { x: "calc(100% - 280px)", y: 176, width: 320, rotation: 2, zIndex: 2 },
    parallax: 0.05,
  },
  {
    id: "slot-07",
    desktop: { x: "4%", y: "72%", width: 400, rotation: -6, zIndex: 3 },
    parallax: 0.1,
  },
  {
    id: "slot-08",
    desktop: { x: "40%", y: "84%", width: 264, rotation: 1, zIndex: 1 },
    large: { x: 16, y: 672, width: 264, rotation: -3, zIndex: 2 },
    mobile: { x: -40, y: "calc(100% - 176px)", width: 264, rotation: -3, zIndex: 2 },
    parallax: -0.04,
  },
  {
    id: "slot-09",
    desktop: { x: "calc(100% - 360px)", y: "18%", width: 352, rotation: 2, zIndex: 2 },
    parallax: 0.04,
  },
  {
    id: "slot-10",
    desktop: { x: "calc(100% - 496px)", y: "75%", width: 480, rotation: 0, zIndex: 3 },
    parallax: 0.14,
  },
] satisfies readonly FloatingSlotConfig[];
