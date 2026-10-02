"use client";

import { PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { GrainyGradient, YELLOW_GRADIENT_SEED } from "@/components/ui/grainy-gradient";
import { revealAccordionItem } from "@/components/faq/faq-reveal-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  defaultOpenItem?: string;
};

export function FaqAccordion({ items, defaultOpenItem }: FaqAccordionProps) {
  return (
    <Accordion multiple={false} defaultValue={defaultOpenItem ? [defaultOpenItem] : []} className="gap-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          custom={index}
          variants={revealAccordionItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AccordionItem
            value={item.id}
            className="group/faq-item relative isolate overflow-hidden rounded-xl bg-muted/50 p-3 ring-1 ring-border/50 transition-colors duration-200 ease-out data-open:text-white not-last:border-b-0"
          >
            <GrainyGradient
              variant="yellow"
              seed={YELLOW_GRADIENT_SEED + index * 37}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-data-open/faq-item:opacity-100 motion-reduce:transition-none"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,#0009_0%,#0006_100%)] opacity-0 transition-opacity duration-200 ease-out group-data-open/faq-item:opacity-100 motion-reduce:transition-none"
            />
            <AccordionTrigger className="relative z-10 min-h-6 items-center gap-2 border-0 py-0 text-base leading-[28px] font-normal tracking-tight hover:no-underline focus-visible:border-0 focus-visible:ring-2 [&>[data-slot=accordion-trigger-icon]]:hidden">
              <span className="min-w-0 flex-1">{item.question}</span>
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
              >
                <PlusIcon className="size-(--icon-size-min) transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45" />
              </span>
            </AccordionTrigger>
            <AccordionContent className="relative z-10 pt-2 pb-0 text-sm leading-[24px] opacity-70">
              <p>{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
}
