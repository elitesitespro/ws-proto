"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/icon";
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
            className="group/faq-item cx-lit relative isolate overflow-hidden rounded-card bg-card p-3 transition-colors duration-200 ease-out data-open:text-foreground not-last:border-b-0"
          >
            <GrainyGradient
              variant="yellow"
              seed={YELLOW_GRADIENT_SEED + index * 37}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-data-open/faq-item:opacity-100 motion-reduce:transition-none"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(12,10,9,0.6)_0%,rgba(12,10,9,0.4)_100%)] opacity-0 transition-opacity duration-200 ease-out group-data-open/faq-item:opacity-100 motion-reduce:transition-none"
            />
            <AccordionTrigger className="relative z-10 min-h-6 items-center gap-2 border-0 py-0 text-base leading-[28px] font-normal tracking-tight hover:no-underline focus-visible:border-0 focus-visible:ring-2 [&>[data-slot=accordion-trigger-icon]]:hidden">
              <span className="min-w-0 flex-1">{item.question}</span>
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-foreground"
              >
                <Icon
                  name="plus"
                  size={20}
                  tone="current"
                  className="transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45"
                />
              </span>
            </AccordionTrigger>
            <AccordionContent className="relative z-10 pt-2 pb-0 text-sm leading-[24px] opacity-70">
              <p>{item.answer}</p>
            </AccordionContent>
            <span className="cx-lit-2" aria-hidden="true" />
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
}
