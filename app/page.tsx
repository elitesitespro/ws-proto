import { HeroSection } from "./_components/hero-section";
import { ExploreCtaSection } from "./_components/explore-cta-section";
import { FaqSection } from "./_components/faq-section";
import { PlatformTimelineSection } from "./_components/platform-timeline-section";

export default function Home() {
  return (
    <main className="min-h-svh">
      <HeroSection />
      <EcosystemIntroSection />
      <PlatformTimelineSection />
      <ExploreCtaSection />
      <FaqSection />
    </main>
  );
}