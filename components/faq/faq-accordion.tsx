"use client";

import { PlusIcon } from "lucide-react";
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
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="rounded-xl bg-muted/50 p-3 ring-1 ring-border/50 not-last:border-b-0"
        >
          <AccordionTrigger className="min-h-6 items-center gap-2 border-0 py-0 text-base leading-[28px] font-normal tracking-tight hover:no-underline focus-visible:border-0 focus-visible:ring-2 [&>[data-slot=accordion-trigger-icon]]:hidden">
            <span className="min-w-0 flex-1">{item.question}</span>
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
            >
              <PlusIcon className="size-(--icon-size-min) transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45" />
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 text-sm leading-[24px] opacity-70">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
