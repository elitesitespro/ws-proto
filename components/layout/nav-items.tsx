import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "cn";
import { Chip } from "@/ds/components/chip";
import { Icon } from "@/components/icon";
import { hueAttrs } from "@/app/_components/platform-showcase-content";
import { chapterHref, isChapterPage, type NavChapter, type NavPlatform } from "./nav-links";

/** The header's focus ring, as on its other links. */
export const NAV_FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** A group's small heading, on the glass. */
export function NavGroupLabel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="px-1 pb-1 text-xs font-medium text-[var(--cx-glass-text-2)]">
      {children}
    </p>
  );
}

/**
 * A chapter of the landing. On "/" a plain hash link, so Lenis glides there;
 * from any other page a client-side trip home, to the same section.
 */
export function ChapterLink({
  chapter,
  pathname,
  onNavigate,
  className,
  children,
}: {
  chapter: NavChapter;
  pathname: string | null;
  onNavigate: () => void;
  className: string;
  children: ReactNode;
}) {
  const href = chapterHref(chapter, pathname);
  return isChapterPage(pathname) ? (
    <a href={href} onClick={onNavigate} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} onClick={onNavigate} className={className}>
      {children}
    </Link>
  );
}

/**
 * One platform: its glyph in its own colour, its name and what you do there.
 * Live ones open their own site in a new tab, as on the live nav, so a visit
 * never loses your place here. One that isn't out yet is a plain row, tagged.
 */
export function NavPlatformItem({
  platform,
  onNavigate,
  compact = false,
}: {
  platform: NavPlatform;
  onNavigate: () => void;
  /** The phone menu's two narrow columns: a smaller tile, and the line wraps. */
  compact?: boolean;
}) {
  const { name, line, icon, href, hue } = platform;
  const tint = hue ? hueAttrs(hue) : undefined;
  const row = cn(
    "flex items-center gap-1 rounded-md p-1",
    href && cn("transition-colors hover:bg-white/10", NAV_FOCUS)
  );
  const body = (
    <>
      <span
        aria-hidden="true"
        {...tint}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-icon",
          compact ? "size-4" : "size-5",
          // No colour of its own: a quiet glyph rather than borrowing gold
          tint ? "bg-(--hue-soft) text-(--hue)" : "bg-white/5 text-[var(--cx-glass-text-2)]"
        )}
      >
        <Icon name={icon} size={20} tone="current" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "flex flex-wrap items-center gap-x-1 font-medium",
            compact ? "text-xs" : "text-sm",
            !href && "text-[var(--cx-glass-text-2)]"
          )}
        >
          {name}
          {!href && <Chip>Coming soon</Chip>}
        </span>
        <span className={cn("text-xs text-[var(--cx-glass-text-2)]", !compact && "truncate")}>
          {line}
        </span>
      </span>
    </>
  );

  if (!href) return <div className={row}>{body}</div>;
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onNavigate} className={row}>
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
