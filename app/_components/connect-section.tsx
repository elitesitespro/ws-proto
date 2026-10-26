import { ConnectProductScene } from "./connect-product-scene";
import { MegaMenuStatement } from "./mega-menu-statement";

export function ConnectSection() {
  return (
    <section
      id="connect"
      aria-labelledby="connect-heading"
      className="bg-background text-foreground"
    >
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
        scenes={[0, 1, 2, 3, 4].map((step) => (
          <ConnectProductScene key={step} step={step} />
        ))}
        timelineSide="right"
        connectToNext
        entrance
      />
    </section>
  );
}
