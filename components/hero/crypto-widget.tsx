"use client";

import { useContext, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";
import { WidgetCard as Card } from "./widget-card";
import { WidgetMotionContext } from "./widget-motion-context";

// Demo quotes share a fixed previous-day close so prices and changes agree.
const quotes = [
  { bitcoin: 67240, ethereum: 3520, solana: 174 },
  { bitcoin: 67385, ethereum: 3532, solana: 175 },
  { bitcoin: 67112, ethereum: 3510, solana: 173 },
  { bitcoin: 67496, ethereum: 3541, solana: 176 },
  { bitcoin: 67308, ethereum: 3526, solana: 175 },
  { bitcoin: 67084, ethereum: 3505, solana: 174 },
] as const;

const previousClose = { bitcoin: 67240 / 1.028, ethereum: 3520 / 1.014, solana: 174 / .994 };
const priceFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function quoteFor(asset: keyof typeof previousClose, prices: typeof quotes[number]) {
  const change = (prices[asset] / previousClose[asset] - 1) * 100;
  const positive = change >= 0;
  return {
    price: priceFormat.format(prices[asset]),
    change: `${positive ? "+" : "−"}${Math.abs(change).toFixed(1)}%`,
    color: positive ? "#95D8B8" : "#FFA5B6",
    positive,
  };
}

const assets = {
  bitcoin: {
    background: "#3D301E",
    color: "#F0BF72",
    path: "M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z",
  },
  ethereum: {
    background: "#293044",
    color: "#B4C1E5",
    path: "M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z",
  },
  solana: {
    background: "#342B46",
    color: "#C9B6EC",
    path: "m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z",
  },
};

function AssetIcon({ asset }: { asset: keyof typeof assets }) {
  const { background, color, path } = assets[asset];
  return (
    <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: background }}>
      <svg viewBox="0 0 24 24" className="size-[20px]" aria-hidden="true">
        <path d={path} fill={color} />
      </svg>
    </span>
  );
}

/** Simulated market movement for the landing page. */
export function CryptoWidget() {
  const playing = useContext(WidgetMotionContext);
  const reducedMotion = useReducedMotion();
  const [quoteTick, setQuoteTick] = useState(0);
  const quoteIndex = quoteTick % quotes.length;

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) setQuoteTick((tick) => tick + 1);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [playing, reducedMotion]);

  const prices = quotes[quoteIndex];
  const previousPrices = quotes[(quoteIndex + quotes.length - 1) % quotes.length];
  const priceMotion = (asset: keyof typeof assets) => quoteTick === 0
    ? undefined
    : prices[asset] >= previousPrices[asset] ? "price-up" : "price-down";
  const bitcoin = quoteFor("bitcoin", prices);
  const ChangeIcon = bitcoin.positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card role="group" aria-label="Sample crypto prices over 24 hours" className="w-full gap-2! rounded-[24px]! p-2! text-xs text-white">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <AssetIcon asset="bitcoin" />
          <span className="flex-1 font-semibold">Bitcoin</span>
          <span className="text-white/60">24h</span>
        </div>
        <div className="flex items-center gap-1">
          <span key={quoteTick} data-widget-motion={priceMotion("bitcoin")} className="text-lg leading-4 font-semibold tracking-tight text-white tabular-nums">{bitcoin.price}</span>
          <span className="flex h-4 items-center gap-1 rounded-full px-1 font-medium tabular-nums" style={{ backgroundColor: bitcoin.positive ? "#203B31" : "#3E242D", color: bitcoin.color }}>
            <ChangeIcon data-widget-motion="pulse" size={20} weight="bold" aria-hidden="true" />
            {bitcoin.change}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
        {([
          { asset: "ethereum", name: "Ethereum", ...quoteFor("ethereum", prices) },
          { asset: "solana", name: "Solana", ...quoteFor("solana", prices) },
        ] as const).map(({ asset, name, price, change, color }) => (
          <div key={asset} className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <AssetIcon asset={asset} />
              <span className="font-medium text-white/70">{name}</span>
            </div>
            <div className="leading-3 tabular-nums">
              <p key={quoteTick} data-widget-motion={priceMotion(asset)} className="font-medium">{price}</p>
              <p style={{ color }}>{change}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
