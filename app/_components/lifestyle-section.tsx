import { LifestyleScene } from "./walkthroughs/lifestyle-scenes";
import { MegaMenuStatement } from "./mega-menu-statement";

export function LifestyleSection() {
  return (
    <section
      id="lifestyle"
      aria-labelledby="lifestyle-heading"
      className="bg-[#070405] text-white"
    >
      <MegaMenuStatement
        headingId="lifestyle-heading"
        label="Lifestyle"
        heading="Shop, work, learn and take care of the things that matter beyond your feed."
        actions={[
          "Browse products",
          "Purchase items",
          "Find opportunities",
          "Join courses",
          "Build wellness routines",
        ]}
        scenes={[0, 1, 2, 3, 4].map((step) => (
          <LifestyleScene key={step} step={step} />
        ))}
        timelineSide="right"
        connectToNext
      />
    </section>
  );
}
