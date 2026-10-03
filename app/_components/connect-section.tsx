import { MegaMenuStatement } from "./mega-menu-statement";

export function ConnectSection() {
  return (
    <section id="connect" aria-labelledby="connect-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="connect-heading"
        label="Connect"
        heading="Stay close to the people, communities and conversations that matter."
        actions={[
          "Create posts",
          "Join communities",
          "Make one-to-one calls",
          "Start video meetings",
          "Share your screen",
        ]}
        timelineSide="right"
        connectToNext
      />
    </section>
  );
}
