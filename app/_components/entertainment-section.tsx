import { MegaMenuStatement } from "./mega-menu-statement";

export function EntertainmentSection() {
  return (
    <section id="entertainment" aria-labelledby="entertainment-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="entertainment-heading"
        title="Entertainment"
        description="Watch something live, discover something new or create something of your own."
      />
    </section>
  );
}
