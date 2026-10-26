import type { Metadata } from "next";
import { JoinCta } from "./_components/cta/join-cta";
import { GlobePreviewSection } from "./_components/globe-hero/globe-preview-section";
import { PlatformTimelineSection } from "./_components/platform-timeline-section";
import { StreetToWallet } from "./_components/street/street-to-wallet";
import { VividSection } from "./_components/vivid/vivid-section";

export const metadata: Metadata = {
  title: "WorldStreet",
  description: "Connect, create, discover and earn. All in one connected world.",
};

// The landing page: the night globe, the dial of platforms, the street to
// the wallet, Vivid, and the way in
export default function Home() {
  return (
    <main className="min-h-svh">
      <GlobePreviewSection />
      <PlatformTimelineSection
        intro="Discover WorldStreet"
        introLine="Thirteen platforms, one account. Scroll to turn the dial."
      />
      <StreetToWallet />
      <VividSection />
      <JoinCta />
    </main>
  );
}
