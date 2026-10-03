import { MegaMenuStatement } from "./mega-menu-statement";

export function MarketsSection() {
  return (
    <section id="markets" aria-labelledby="markets-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="markets-heading"
        title="Markets"
        description="Explore specialized WorldStreet market experiences available to eligible users."
      />
    </section>
  );
}
