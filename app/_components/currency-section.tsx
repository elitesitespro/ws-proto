"use client";

import { useState } from "react";
import {
  CurrencyCarousel,
  type CurrencyItem,
} from "@/components/ui/currency-carousel";

const currencies: readonly CurrencyItem[] = [
  { name: "Nigerian naira", code: "NGN", type: "Fiat currencies", color: "#343035", artwork: { kind: "flag", src: "/images/currencies/ng.svg" } },
  { name: "US dollar", code: "USD", type: "Fiat currencies", color: "#30383b", artwork: { kind: "flag", src: "/images/currencies/us.svg" } },
  { name: "Euro", code: "EUR", type: "Fiat currencies", color: "#393330", artwork: { kind: "flag", src: "/images/currencies/eu.svg" } },
  {
    name: "CFA franc",
    code: "XOF",
    type: "Fiat currencies",
    color: "#313832",
    artwork: { kind: "flag-group", countries: ["bj", "bf", "ci", "gw", "ml", "ne", "sn", "tg"] },
  },
  { name: "Bitcoin", code: "BTC", type: "Crypto", color: "#3b302c", artwork: { kind: "token", src: "/images/currencies/btc.svg" } },
  { name: "Ether", code: "ETH", type: "Crypto", color: "#302f3d", artwork: { kind: "token", src: "/images/currencies/eth.svg" } },
  { name: "USD Coin", code: "USDC", type: "Stablecoins", color: "#2d3940", artwork: { kind: "token", src: "/images/currencies/usdc.svg" } },
  { name: "Tether", code: "USDT", type: "Stablecoins", color: "#2e3c36", artwork: { kind: "token", src: "/images/currencies/usdt.svg" } },
];

export function CurrencySection() {
  const [centerType, setCenterType] = useState(currencies[0].type);

  return (
    <section
      id="currencies"
      aria-labelledby="currencies-heading"
      className="overflow-hidden bg-[#070405] py-16 text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 text-center md:px-6">
        <h2
          id="currencies-heading"
          className="mx-auto max-w-4xl text-xl leading-[44px] font-medium tracking-tight md:text-3xl md:leading-[56px] md:tracking-tighter"
        >
          Transact across currencies
        </h2>
        <p className="mt-2">
          <span className="inline-flex h-5 items-center justify-center rounded-full border border-white/40 px-2 text-base leading-none font-medium tracking-tight md:h-6 md:text-lg">
            {centerType}
          </span>
        </p>
      </div>

      <div className="mt-8">
        <CurrencyCarousel
          currencies={currencies}
          onCenterTypeChange={setCenterType}
        />
      </div>
    </section>
  );
}
