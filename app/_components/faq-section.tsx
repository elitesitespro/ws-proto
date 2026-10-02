import { ArrowRightIcon } from "lucide-react";
import { cn } from "cn";
import { FaqAccordion, type FaqItem } from "@/components/faq/faq-accordion";
import { buttonVariants } from "@/components/ui/button";

const faqItems: FaqItem[] = [
  {
    id: "separate-accounts",
    question: "Do I need a separate account for every platform?",
    answer:
      "No. One WorldStreet account gives you access to participating experiences across the ecosystem.",
  },
  {
    id: "trading-platform",
    question: "Is WorldStreet a trading platform?",
    answer:
      "No. Forex, Crypto and Prediction are specialized experiences within a much broader ecosystem.",
  },
  {
    id: "worldstreet-wallet",
    question: "What is the WorldStreet Wallet?",
    answer:
      "The WorldStreet Wallet supports eligible payments, earnings and transactions across participating WorldStreet experiences.",
  },
  {
    id: "platform-connections",
    question: "How do WorldStreet platforms work together?",
    answer:
      "Your WorldStreet identity connects participating experiences, making it easier to move between content, communities, services, shopping, work and other activities.",
  },
  {
    id: "platform-choice",
    question: "Can I choose which platforms I use?",
    answer:
      "Yes. You can use the WorldStreet experiences that are relevant to you without using every platform.",
  },
  {
    id: "feature-availability",
    question: "Is every feature available to everyone?",
    answer:
      "No. Some experiences may depend on location, age, verification, device or regulatory requirements.",
  },
];

export function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-6xl px-3 py-6 md:px-6 md:py-8"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 text-center">
        <h1
          id="faq-heading"
          className="text-xl leading-[44px] font-semibold tracking-tight md:text-2xl md:leading-[52px] md:tracking-tighter"
        >
          Frequently asked questions
        </h1>
        <p className="max-w-md text-sm leading-[24px] opacity-70">
          Everything you need to know about WorldStreet. Find answers to the most
          common questions below.
        </p>
      </div>

      <div className="mx-auto mt-5 w-full max-w-xl">
        <FaqAccordion items={faqItems} defaultOpenItem="separate-accounts" />
      </div>

      <div className="mt-4 flex justify-center">
        <a
          href="https://worldstreet.app/en/support"
          className={cn(
            buttonVariants({ variant: "link" }),
            "h-6 px-2 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          Visit the Help Center
          <ArrowRightIcon aria-hidden="true" className="size-(--icon-size-min)" />
        </a>
      </div>
    </section>
  );
}
