import { ConnectSection } from "./_components/connect-section";
import { EcosystemIntroSection } from "./_components/ecosystem-intro-section";
import { EntertainmentSection } from "./_components/entertainment-section";
import { ExploreCtaSection } from "./_components/explore-cta-section";
import { EcosystemIntroSection } from "./_components/ecosystem-intro-section";
import { FaqSection } from "./_components/faq-section";
import { HeroSection } from "./_components/hero-section";
import { LifestyleSection } from "./_components/lifestyle-section";
import { MarketsSection } from "./_components/markets-section";
import { PlatformTimelineSection } from "./_components/platform-timeline-section";

export default function Home() {
  return (
    <main className="min-h-svh">
      <HeroSection />
      <EcosystemIntroSection />
      <PlatformTimelineSection />
      <ConnectSection />
      <EntertainmentSection />
      <LifestyleSection />
      <MarketsSection />
      <ExploreCtaSection />
      <FaqSection />
    </main>
  );
}
