import { EntertainmentScene } from "./walkthroughs/entertainment-scenes";
import { MegaMenuStatement } from "./mega-menu-statement";

export function EntertainmentSection() {
  return (
    <section
      id="entertainment"
      aria-labelledby="entertainment-heading"
      className="bg-[#070405] text-white"
    >
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
        scenes={[0, 1, 2, 3, 4].map((step) => (
          <EntertainmentScene key={step} step={step} />
        ))}
        timelineSide="left"
        connectToNext
      />
    </section>
  );
}
