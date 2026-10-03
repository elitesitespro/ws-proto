import { MegaMenuStatement } from "./mega-menu-statement";

export function ConnectSection() {
  return (
    <section id="connect" aria-labelledby="connect-heading" className="bg-[#070405] text-white">
      <MegaMenuStatement
        headingId="connect-heading"
        title="Connect"
        description="Stay close to the people, communities and conversations that matter."
      />
    </section>
  );
}
