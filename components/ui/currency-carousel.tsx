"use client";

import { useEffect, useRef, useState } from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { gentleGlideCubicEase } from "@/lib/motion-presets";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export type CurrencyItem = {
  name: string;
  code: string;
  type: string;
  color: string;
  artwork:
    | { kind: "flag" | "token"; src: string }
    | { kind: "flag-group"; countries: readonly string[] };
};

type CurrencyCarouselProps = {
  currencies: readonly CurrencyItem[];
  onCenterTypeChange: (type: string) => void;
};

const cardTransitionEase = `cubic-bezier(${gentleGlideCubicEase.join(", ")})`;

export function CurrencyCarousel({
  currencies,
  onCenterTypeChange,
}: CurrencyCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [autoScroll] = useState(() =>
    AutoScroll({
      speed: 1.2,
      startDelay: 800,
      playOnInit: false,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  );

  useEffect(() => {
    if (!api || !rootRef.current) return;

    const root = rootRef.current;
    const slides = api.slideNodes();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let isVisible = false;

    const updateCenter = () => {
      frame = 0;
      const bounds = root.getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      let nearestDistance = Infinity;
      let nearestType: string | undefined;

      for (const slide of slides) {
        const card = slide.querySelector<HTMLElement>("[data-currency-type]");
        if (!card) continue;

        const rect = card.getBoundingClientRect();
        if (rect.right < bounds.left || rect.left > bounds.right) continue;

        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestType = card.dataset.currencyType;
        }
      }

      if (nearestType) onCenterTypeChange(nearestType);
    };

    const scheduleCenterUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateCenter);
    };

    const syncPlayback = () => {
      if (isVisible && !reducedMotion.matches) {
        autoScroll.play();
      } else {
        autoScroll.stop();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayback();
        if (isVisible) scheduleCenterUpdate();
      },
      { rootMargin: "100px" },
    );

    observer.observe(root);
    reducedMotion.addEventListener("change", syncPlayback);
    window.addEventListener("resize", scheduleCenterUpdate);
    api.on("scroll", scheduleCenterUpdate);
    api.on("reInit", scheduleCenterUpdate);
    scheduleCenterUpdate();

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      window.removeEventListener("resize", scheduleCenterUpdate);
      api.off("scroll", scheduleCenterUpdate);
      api.off("reInit", scheduleCenterUpdate);
      autoScroll.stop();
      cancelAnimationFrame(frame);
    };
  }, [api, autoScroll, onCenterTypeChange]);

  return (
    <div ref={rootRef}>
      <Carousel
        aria-label="Currencies across WorldStreet"
        opts={{ align: "center", loop: true, dragFree: true }}
        plugins={[autoScroll]}
        setApi={setApi}
      >
        <CarouselContent className="-ml-1! py-3">
          {Array.from({ length: 3 }, (_, repeat) =>
            currencies.map((currency) => (
              <CarouselItem
                key={`${repeat}-${currency.code}`}
                aria-hidden={repeat > 0}
                className="group/currency basis-20! px-1!"
              >
                <Card
                  data-currency-type={currency.type}
                  className="relative isolate aspect-square w-full items-center justify-end gap-0! overflow-hidden rounded-full! border-0! p-2! ring-0! transition-[translate,box-shadow] duration-[600ms] hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none"
                  style={{ backgroundColor: currency.color, transitionTimingFunction: cardTransitionEase }}
                >
                  {currency.artwork.kind === "flag-group" ? (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-4">
                      {currency.artwork.countries.map((country) => (
                        <div key={country} className="relative overflow-hidden">
                          <Image
                            src={`/images/currencies/${country}.svg`}
                            alt=""
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Image
                      src={currency.artwork.src}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  )}
                  <span
                    className="relative z-10 inline-flex h-4 w-8 translate-y-1 items-center justify-center rounded-full border border-white/30 bg-black/55 text-[14px] leading-none font-medium text-white opacity-0 backdrop-blur-sm transition-[opacity,translate] duration-[600ms] group-hover/card:translate-y-0 group-hover/card:opacity-100 motion-reduce:transition-none"
                    style={{ transitionTimingFunction: cardTransitionEase }}
                  >
                    {currency.code}
                  </span>
                </Card>
                <p
                  className="mt-2 translate-y-1 text-center text-[14px] leading-[24px] font-medium text-white opacity-0 transition-[opacity,translate] duration-[600ms] group-hover/currency:translate-y-0 group-hover/currency:opacity-100 motion-reduce:transition-none"
                  style={{ transitionTimingFunction: cardTransitionEase }}
                >
                  {currency.name}
                </p>
              </CarouselItem>
            )),
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
