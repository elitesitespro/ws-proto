import { MegaMenuStatement } from "./mega-menu-statement";

export function MarketsSection() {
  return (
    <section id="markets" aria-labelledby="markets-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="markets-heading"
        label="Markets"
        heading="Explore specialized WorldStreet market experiences available to eligible users."
        actions={[
          "Monitor market prices",
          "Manage orders",
          "Explore crypto markets",
          "View market information",
          "Explore active events",
        ]}
        timelineSide="left"
      />
    </section>
  );
}
