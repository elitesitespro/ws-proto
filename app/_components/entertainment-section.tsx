import { MegaMenuStatement } from "./mega-menu-statement";

export function EntertainmentSection() {
  return (
    <section id="entertainment" aria-labelledby="entertainment-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="entertainment-heading"
        label="Entertainment"
        heading="Watch something live, discover something new or create something of your own."
        actions={[
          "Watch live broadcasts",
          "Host streams",
          "Watch films and series",
          "Create short films",
          "Play mini-games",
        ]}
        timelineSide="left"
        connectToNext
      />
    </section>
  );
}
