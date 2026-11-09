import Image from "next/image";

/**
 * WorldSpace's logo: the astronaut's helmet, the W on its cyan visor (Owen,
 * 9 Nov 2026: "this is basically the logo for worldspace"). Wherever the
 * landing marks WorldSpace (its app icon, components/ui/platform-icon.tsx,
 * its own panel), it's this, never a stock glyph or the old cloud.
 */
export function WorldSpaceLogo({ size, className }: { size: number; className?: string }) {
  return <Image src="/assets/worldspace/helmet.webp" alt="" width={size} height={size} className={className} />;
}
