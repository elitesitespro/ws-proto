import { PlatformIconGroup } from "@/components/ui/platform-icon-group"

export function EcosystemIntroSection() {
  return (
    <section
      aria-labelledby="ecosystem-intro-heading"
      className="bg-[#070405] text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:py-14">
        <h1
          id="ecosystem-intro-heading"
          className="text-xl leading-[44px] font-medium tracking-tight md:text-3xl md:leading-[56px] md:tracking-tighter xl:text-4xl xl:leading-[68px]"
        >
          WorldStreet isn&apos;t one platform trying to do everything. It&apos;s a
          network of purpose-built{" "}
          <span className="inline-flex items-center whitespace-nowrap align-baseline">
            platforms
            <PlatformIconGroup className="ml-1" />
          </span>{" "}
          designed to work together.
        </h1>
      </div>
    </section>
  );
}
