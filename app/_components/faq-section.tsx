"use client";

import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { cn } from "cn";
import { FaqAccordion, type FaqItem } from "@/components/faq/faq-accordion";
import { revealHeading, revealItem, revealMutedItem, revealTitle } from "@/components/faq/faq-reveal-motion";
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
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-6xl px-3 py-6 md:px-6 md:py-8"
      >
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-2 text-center"
          variants={revealHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
        >
          <Image
            src="/assets/images/luminous-molten-gold-question-mark.png"
            alt=""
            width={96}
            height={144}
            sizes="(min-width: 768px) 96px, 80px"
            className="h-15 w-10 object-contain md:h-18 md:w-12"
            loading="eager"
          />
          <div className="w-full overflow-hidden">
            <motion.h1
              id="faq-heading"
              variants={revealTitle}
              className="text-xl leading-[44px] font-semibold tracking-tight md:text-2xl md:leading-[52px] md:tracking-tighter"
            >
              Frequently asked questions
            </motion.h1>
          </div>
          <div className="w-full max-w-md overflow-hidden">
            <motion.p
              variants={revealMutedItem}
              className="text-sm leading-[24px]"
            >
              Everything you need to know about WorldStreet. Find answers to the most
              common questions below.
            </motion.p>
          </div>
        </motion.div>

        <div className="mx-auto mt-5 w-full max-w-xl">
          <FaqAccordion items={faqItems} defaultOpenItem="separate-accounts" />
        </div>

        <motion.div
          className="mt-4 flex justify-center"
          variants={revealItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
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
        </motion.div>
      </section>
    </MotionConfig>
  );
}
