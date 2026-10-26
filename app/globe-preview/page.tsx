import type { Metadata } from "next";
import { JoinCta } from "../_components/cta/join-cta";
// import { FaqSection } from "../_components/faq-section";
import { PlatformTimelineSection } from "../_components/platform-timeline-section";
import { StreetToWallet } from "../_components/street/street-to-wallet";
import { VividSection } from "../_components/vivid/vivid-section";
import { GlobePreviewSection } from "./_components/globe-preview-section";

// Throwaway spike: the landing page with the night globe as its hero, to see
// the hero scroll into the rest of the page before the real one is rebuilt.
export const metadata: Metadata = { title: "Globe preview" };

export default function GlobePreviewPage() {
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
      {/* <FaqSection /> */}
    </main>
  );
}
