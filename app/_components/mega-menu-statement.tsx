import { PlatformIconGroup } from "@/components/ui/platform-icon-group";
import { CategoryActionTimeline } from "./category-action-timeline";

type MegaMenuStatementProps = {
  headingId: string;
  label: string;
  heading: string;
  actions: readonly string[];
  timelineSide: "left" | "right";
  connectToNext?: boolean;
};

export function MegaMenuStatement({
  headingId,
  label,
  heading,
  actions,
  timelineSide,
  connectToNext = false,
}: MegaMenuStatementProps) {
  const timelineOnLeft = timelineSide === "left";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <div className="relative grid lg:grid-cols-4">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[4px] -translate-x-1/2 bg-white/25 lg:hidden"
        />

        <div
          className={`col-span-1 py-10 pl-4 lg:col-span-3 lg:py-12 ${
            timelineOnLeft ? "lg:order-2 lg:pl-4" : "lg:pl-0 lg:pr-4"
          }`}
        >
          <div className="flex items-center gap-1">
            <PlatformIconGroup />
            <p className="text-xs font-medium leading-[24px] text-white/75">
              {label}
            </p>
          </div>
          <h2
            id={headingId}
            className="mt-2 max-w-4xl text-lg leading-[36px] font-medium tracking-tight sm:text-xl sm:leading-[44px] md:text-3xl md:leading-[56px] md:tracking-tighter"
          >
            {heading}
          </h2>

          <div
            aria-hidden="true"
            className="mt-6 h-40 w-full rounded-3xl bg-[#252022] md:h-56 lg:mt-8 lg:h-64"
          />
        </div>

        <CategoryActionTimeline actions={actions} side={timelineSide} />
      </div>

      {connectToNext && (
        <div aria-hidden="true" className="relative h-10">
          <div className="absolute inset-y-0 left-0 w-[4px] -translate-x-1/2 bg-white/25 lg:hidden" />
          <div
            className={`absolute top-0 hidden h-1/2 w-[4px] -translate-x-1/2 bg-white/25 lg:block ${
              timelineOnLeft ? "left-1/4" : "left-3/4"
            }`}
          />
          <div className="absolute top-1/2 right-1/4 left-1/4 hidden h-[4px] -translate-y-1/2 bg-white/25 lg:block" />
          <div
            className={`absolute bottom-0 hidden h-1/2 w-[4px] -translate-x-1/2 bg-white/25 lg:block ${
              timelineOnLeft ? "left-3/4" : "left-1/4"
            }`}
          />
        </div>
      )}
    </div>
  );
}
