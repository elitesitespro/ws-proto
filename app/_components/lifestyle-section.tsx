import { MegaMenuStatement } from "./mega-menu-statement";

export function LifestyleSection() {
  return (
    <section id="lifestyle" aria-labelledby="lifestyle-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="lifestyle-heading"
        title="Lifestyle"
        description="Shop, work, learn and take care of the things that matter beyond your feed."
      />
    </section>
  );
}
