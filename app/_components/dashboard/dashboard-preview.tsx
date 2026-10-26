"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type Variants,
} from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Icon, type IconName } from "@/components/icon";
import { VividGlobe } from "../vivid/vivid-globe";
import { dockLift } from "../vivid/vivid-handoff";
import { Flag, KashDrawing, Timer, WorldStreetMark } from "./dashboard-art";
import styles from "./dashboard-preview.module.css";

// A working copy of the new WorldStreet dashboard's home (worldstreet-hub,
// app/(hub)): Ada's money, the banners, the sections and Vivid. The data is
// made up; the wallet works. Money lands in it as you watch, and its
// buttons move it about.

type Currency = "USD" | "NGN" | "KES" | "GBP";

const WALLETS: Record<Currency, { name: string; symbol: string; perDollar: number; step: number }> = {
  USD: { name: "Dollar wallet", symbol: "$", perDollar: 1, step: 100 },
  NGN: { name: "Naira wallet", symbol: "₦", perDollar: 1550, step: 50000 },
  KES: { name: "Shilling wallet", symbol: "KSh ", perDollar: 129, step: 5000 },
  GBP: { name: "Pound wallet", symbol: "£", perDollar: 0.79, step: 50 },
};
const CURRENCIES = Object.keys(WALLETS) as Currency[];
const START: Record<Currency, number> = { USD: 1250.4, NGN: 620000, KES: 64500, GBP: 437.8 };

const SIDEBAR: { group: string; items: { label: string; icon: IconName | "orb" }[] }[] = [
  {
    group: "Trade",
    items: [
      { label: "Forex", icon: "bars" },
      { label: "Crypto", icon: "trending-up" },
      { label: "Prediction", icon: "target" },
    ],
  },
  { group: "Learn", items: [{ label: "Academy", icon: "graduation" }] },
  {
    group: "Enjoy",
    items: [
      { label: "WorldSpace", icon: "chat" },
      { label: "Vision", icon: "monitor" },
      { label: "Xtream", icon: "broadcast" },
      { label: "Arcade", icon: "play" },
      { label: "Shop", icon: "card" },
    ],
  },
  {
    group: "Connect",
    items: [
      { label: "Community", icon: "users" },
      { label: "Vivid AI", icon: "orb" },
    ],
  },
];

const NAV: { label: string; icon: IconName }[] = [
  { label: "Home", icon: "home" },
  { label: "Explore", icon: "grid" },
  { label: "Transactions", icon: "list" },
  { label: "Notifications", icon: "bell" },
];

const TILES: { label: string; line: string; icon: IconName; hue?: string }[] = [
  { label: "For you", line: "Every platform, one place", icon: "sparkle" },
  { label: "Trade", line: "Forex, crypto and predictions", icon: "trending-up", hue: "trade" },
  { label: "Learn", line: "Courses and Vivid AI", icon: "graduation", hue: "learn" },
  { label: "Watch", line: "Live shows and films", icon: "broadcast", hue: "watch" },
  { label: "Play", line: "Games and predictions", icon: "gamepad", hue: "play" },
  { label: "Community", line: "WorldSpace and your chats", icon: "users", hue: "community" },
  { label: "Shop", line: "Buy and sell across Nigeria", icon: "card", hue: "shop" },
];

const BANNERS = [
  { id: "kash", title: "WorldStreet Kash", line: "Our own coin, in your wallet." },
  { id: "countdown", title: "Countdown Marketplace", line: "Deals on a timer.", tag: "Coming soon" },
  { id: "xtream", title: "Xtream", line: "Go live. Get backed. Get paid." },
] as const;

// What lands in the wallet while you watch, and when (ms after it's in view)
const ARRIVALS: { at: number; title: string; from: string; amount: number; icon: IconName; hue?: string }[] = [
  { at: 2600, title: "Creator earnings", from: "Xtream", amount: 180, icon: "broadcast", hue: "watch" },
  { at: 4600, title: "Project payment", from: "Worldwork", amount: 250, icon: "briefcase" },
  { at: 6600, title: "Prediction payout", from: "Prediction", amount: 34.48, icon: "target", hue: "trade" },
];

// What the dock asks, in turn: the hub's own for Home (components/home/vivid.tsx)
const QUESTIONS = ["What can I do with WorldStreet?", "How do I add money?", "What is Forex?", "Where should I start?"];
// The one it's asking when Vivid takes the question up (the Vivid section answers it)
const HANDED_OVER = 1;

const money = (value: number, currency: Currency) =>
  `${WALLETS[currency].symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const thousands = (dollars: number) => `$${(dollars / 1000).toFixed(1)}K`;

const greet = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};
const subscribeNever = () => () => {};
// Tells one passing message from the next
let tickets = 0;
const nextTicket = () => ++tickets;

// The home's parts come up in turn as it comes into view
const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * `live`: whether it may come alive yet (money landing) once it's in view.
 * `vividHref`: where Ask Vivid goes on this page.
 */
export function DashboardPreview({
  live = true,
  vividHref = "#intelligence",
}: { live?: boolean; vividHref?: string } = {}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { once: true, amount: 0.3 });
  const seen = inView && live;
  const reduce = useReducedMotion();
  const greeting = useSyncExternalStore(subscribeNever, greet, () => "Good afternoon");

  const [balances, setBalances] = useState(START);
  const [crypto, setCrypto] = useState(13700);
  const [active, setActive] = useState<Currency>("USD");
  const [hidden, setHidden] = useState(false);
  const [arrived, setArrived] = useState(0);
  const [bump, setBump] = useState<{ id: number; text: string; up: boolean } | null>(null);
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);
  const [tile, setTile] = useState(0);

  const fiat = CURRENCIES.reduce((sum, c) => sum + balances[c] / WALLETS[c].perDollar, 0);

  // The balance rolls to whatever the wallet holds: up from nothing as it
  // comes into view (even before it's live, so it never reads nothing), then
  // with every change
  const shown = useMotionValue(0);
  const whole = useTransform(shown, (v) => Math.floor(Math.round(v * 100) / 100).toLocaleString("en-US"));
  const cents = useTransform(shown, (v) => `.${String(Math.round(v * 100) % 100).padStart(2, "0")}`);
  const target = balances[active];
  useEffect(() => {
    if (!inView) return;
    const controls = animate(shown, target, { duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, target, shown, reduce]);

  const flash = (text: string, up: boolean) => {
    const id = nextTicket();
    setBump({ id, text, up });
    window.setTimeout(() => setBump((b) => (b?.id === id ? null : b)), 1800);
  };
  const say = (text: string) => {
    const id = nextTicket();
    setNote({ id, text });
    window.setTimeout(() => setNote((n) => (n?.id === id ? null : n)), 2600);
  };
  const change = (currency: Currency, by: number) => setBalances((b) => ({ ...b, [currency]: b[currency] + by }));

  // Earnings land in the dollar wallet, one after another
  const land = useEffectEvent((index: number) => {
    const arrival = ARRIVALS[index];
    setArrived((n) => Math.max(n, index + 1));
    change("USD", arrival.amount);
    if (active === "USD") flash(`+${money(arrival.amount, "USD")}`, true);
  });
  useEffect(() => {
    if (!seen) return;
    const timers = ARRIVALS.map((arrival, index) => window.setTimeout(() => land(index), reduce ? 0 : arrival.at));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [seen, reduce]);

  const act = (kind: "add" | "send" | "convert" | "move") => {
    const wallet = WALLETS[active];
    const fifty = 50 * wallet.perDollar;
    if (kind === "add") {
      change(active, wallet.step);
      flash(`+${money(wallet.step, active)}`, true);
      say(`Added ${money(wallet.step, active)} to your ${wallet.name.toLowerCase()}`);
      return;
    }
    const out = kind === "send" ? wallet.step / 4 : fifty;
    if (balances[active] < out) {
      say("This wallet’s running low. Add money first.");
      return;
    }
    change(active, -out);
    if (kind === "convert") {
      // It lands in the next wallet, the one on screen after: what came in shows
      const to = CURRENCIES[(CURRENCIES.indexOf(active) + 1) % CURRENCIES.length];
      const got = 50 * WALLETS[to].perDollar;
      change(to, got);
      setActive(to);
      flash(`+${money(got, to)}`, true);
      say(`Converted ${money(out, active)} to ${money(got, to)}`);
      return;
    }
    flash(`−${money(out, active)}`, false);
    if (kind === "send") say(`Sent ${money(out, active)} to Tunde`);
    if (kind === "move") {
      setCrypto((c) => c + 50);
      say(`Moved ${money(out, active)} to Crypto`);
    }
  };

  const cards = [
    { label: "Fiat", icon: "wallet" as IconName, value: thousands(fiat), line: "4 wallets", on: true },
    { label: "Crypto", icon: "coins" as IconName, value: thousands(crypto), line: "Main + trading" },
    { label: "Forex", icon: "bars" as IconName, value: "Connect", line: "Not linked yet" },
    { label: "WorldStreet Kash", icon: "dollar-circle" as IconName, value: "Buy", line: "Our own coin" },
  ];
  const step = (i: number) => ({ custom: i, variants: reduce ? undefined : rise });

  return (
    <div className={styles.stage} data-note={note ? "" : undefined}>
      <div
        ref={frameRef}
        className={styles.window}
        role="group"
        aria-label="A preview of the WorldStreet dashboard"
      >
        <div className={styles.titlebar} aria-hidden="true">
          <i />
          <i />
          <i />
          <span className={styles.title}>WorldStreet dashboard</span>
          {/* On a phone, its status bar either side of the island */}
          <b className={styles.clock}>9:41</b>
          <span className={styles.island} />
          <span className={styles.status}>
            <svg viewBox="0 0 17 11" width="17" height="11" fill="currentColor">
              <rect x="0" y="7" width="3" height="4" rx="1" />
              <rect x="4.5" y="5" width="3" height="6" rx="1" />
              <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
              <rect x="13.5" y="0" width="3" height="11" rx="1" />
            </svg>
            <svg viewBox="0 0 26 12" width="26" height="12" fill="currentColor">
              <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
              <rect x="2" y="2" width="16" height="8" rx="2" />
              <path d="M24 4.2v3.6a2 2 0 0 0 0-3.6Z" opacity="0.4" />
            </svg>
          </span>
        </div>
        <motion.div
          className={styles.app}
          initial={reduce ? false : "hidden"}
          animate={inView ? "shown" : "hidden"}
        >
          <aside className={styles.sidebar} aria-hidden="true">
            <div className={styles.logo}>
              <WorldStreetMark className={styles.logoMark} />
              <span>
                <b>WorldStreet</b>
                <small>Dashboard</small>
              </span>
              <Icon name="sidebar" size={20} tone="current" className={styles.dim} />
            </div>
            {SIDEBAR.map(({ group, items }) => (
              <div key={group} className={styles.group}>
                <p>
                  {group}
                  <Icon name="chevron-up" size={20} tone="current" />
                </p>
                {items.map((item) => (
                  <span key={item.label} className={styles.navItem}>
                    {item.icon === "orb" ? (
                      <VividGlobe size={20} still />
                    ) : (
                      <Icon name={item.icon} size={20} tone="current" />
                    )}
                    {item.label}
                  </span>
                ))}
              </div>
            ))}
            <div className={styles.group}>
              <p>
                Account
                <Icon name="chevron-down" size={20} tone="current" />
              </p>
            </div>
            <div className={styles.invite}>
              <b>Invite friends</b>
              <small>Share WorldStreet and earn rewards.</small>
              <Icon name="chevron-right" size={20} tone="current" />
            </div>
            <div className={styles.me}>
              <span className={styles.avatar}>AO</span>
              <span>
                <b>Ada Okafor</b>
                <small>ada@demo.worldstreet.example</small>
              </span>
              <Icon name="logout" size={20} tone="current" className={styles.dim} />
            </div>
          </aside>

          <div className={styles.main}>
            <div className={styles.topbar} aria-hidden="true">
              <span className={styles.navPills}>
                {NAV.map((item, i) => (
                  <span key={item.label} className={styles.pill} data-on={i === 0 || undefined}>
                    <Icon name={item.icon} size={20} tone="current" />
                    <span>{item.label}</span>
                    {item.label === "Notifications" && arrived > 0 && <i className={styles.ping} />}
                  </span>
                ))}
              </span>
              <span className={styles.avatar}>AO</span>
            </div>

            <motion.section className={styles.money} {...step(0)} aria-label="Ada’s money">
              <div className={styles.moneyHead}>
                <h3>
                  {greeting}, <span>Ada</span>
                </h3>
                <button
                  type="button"
                  className={styles.eye}
                  aria-pressed={hidden}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  onClick={() => setHidden((h) => !h)}
                >
                  <Icon name={hidden ? "eye-off" : "eye"} size={20} tone="current" />
                </button>
              </div>

              <ul className={styles.cards}>
                {cards.map((card, i) => (
                  <motion.li key={card.label} className={styles.card} data-on={card.on || undefined} {...step(i + 1)}>
                    <span className={styles.cardLabel}>
                      <Icon name={card.icon} size={20} />
                      {card.label}
                    </span>
                    <b>{hidden && card.value.startsWith("$") ? "••••" : card.value}</b>
                    <small>{card.line}</small>
                  </motion.li>
                ))}
              </ul>

              <div className={styles.wallet}>
                <div className={styles.walletLeft}>
                  <p className={styles.walletName}>
                    {WALLETS[active].name} · {active}
                  </p>
                  <div className={styles.amountRow}>
                    {hidden ? (
                      <span className={`cx-amount-display ${styles.amount}`}>••••••</span>
                    ) : (
                      <span className={`cx-amount-display ${styles.amount}`} aria-label={money(target, active)}>
                        <span className="cur" aria-hidden="true">
                          {WALLETS[active].symbol.trim()}
                        </span>
                        <motion.span aria-hidden="true">{whole}</motion.span>
                        <motion.span className="cents" aria-hidden="true">
                          {cents}
                        </motion.span>
                      </span>
                    )}
                    {/* The one going out leaves the row as it goes, so the next
                        takes its place instead of wrapping in beside it */}
                    <AnimatePresence mode="popLayout">
                      {bump && (
                        <motion.span
                          key={bump.id}
                          className={styles.bump}
                          data-up={bump.up || undefined}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35 }}
                        >
                          {bump.text}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={styles.chips} role="group" aria-label="Wallets">
                    {CURRENCIES.map((currency) => (
                      <button
                        key={currency}
                        type="button"
                        className={styles.chip}
                        aria-pressed={active === currency}
                        onClick={() => {
                          // A change shown for one wallet doesn't follow you to the next
                          setActive(currency);
                          setBump(null);
                        }}
                      >
                        <Flag currency={currency} />
                        {currency}
                      </button>
                    ))}
                    <span className={`${styles.chip} ${styles.addWallet}`} aria-hidden="true">
                      <Icon name="plus" size={20} />
                      Add wallet
                    </span>
                  </div>
                </div>
                <div className={`cx-actions ${styles.actions}`} role="group" aria-label="Move money">
                  {(
                    [
                      ["add", "plus", "Add money"],
                      ["send", "send", "Send"],
                      ["convert", "swap", "Convert"],
                      ["move", "arrow-right", "Move"],
                    ] as const
                  ).map(([kind, icon, label]) => (
                    <button
                      key={kind}
                      type="button"
                      className={`cx-action ${kind === "add" ? "cx-action--primary" : ""} ${styles.action}`}
                      onClick={() => act(kind)}
                    >
                      <span>
                        <Icon name={icon} tone="current" size={20} />
                      </span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {note && (
                  <motion.p
                    key={note.id}
                    className={styles.note}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon name="check-circle" size={20} tone="current" />
                    {note.text}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="sr-only" aria-live="polite">
                {note?.text}
              </p>
            </motion.section>

            <motion.div {...step(5)}>
              <Promos run={seen && !reduce} />
            </motion.div>

            <motion.ul className={styles.tiles} {...step(6)} aria-label="Sections">
              {TILES.map((t, i) => (
                <li key={t.label}>
                  <button
                    type="button"
                    className={styles.tile}
                    data-hue={t.hue}
                    aria-pressed={tile === i}
                    onClick={() => setTile(i)}
                  >
                    <span className={styles.tileIcon}>
                      <Icon name={t.icon} size={20} className={t.hue ? "text-[var(--hue)]" : undefined} />
                    </span>
                    <b>{t.label}</b>
                    <small>{t.line}</small>
                  </button>
                </li>
              ))}
            </motion.ul>

            <motion.div {...step(7)}>
              <VividDock run={seen && !reduce} href={vividHref} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* What's landed in the wallet, off the dashboard's edge */}
      <ol className={styles.arrivals} aria-label="Money in">
        {ARRIVALS.map((arrival, i) => (
          <motion.li
            key={arrival.title}
            className={styles.arrival}
            data-hue={arrival.hue}
            data-in={arrived > i || undefined}
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: 24 }}
            animate={arrived > i ? { opacity: 1, scale: 1, y: 0 } : undefined}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            aria-hidden={arrived > i ? undefined : true}
          >
            <span className={styles.arrivalIcon}>
              <Icon name={arrival.icon} size={20} className={arrival.hue ? "text-[var(--hue)]" : undefined} />
            </span>
            <span>
              <b>{arrival.title}</b>
              <small>From {arrival.from}</small>
            </span>
            <em>+{money(arrival.amount, "USD")}</em>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** What's happening: the banners, sliding along on their own until paused. */
function Promos({ run }: { run: boolean }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!run || paused) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 4200);
    return () => window.clearInterval(timer);
  }, [run, paused]);
  const go = (by: number) => setSlide((s) => (s + by + BANNERS.length) % BANNERS.length);

  return (
    <div className={styles.promos} role="region" aria-roledescription="carousel" aria-label="What’s happening">
      <div className={styles.track} style={{ transform: `translateX(calc(${slide} * (-1 * (var(--banner) + var(--gap)))))` }}>
        {BANNERS.map((banner, i) => (
          <div
            key={banner.id}
            className={styles.banner}
            data-look={banner.id}
            aria-hidden={i !== slide || undefined}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${BANNERS.length}`}
          >
            <span className={styles.bannerArt} aria-hidden="true">
              {banner.id === "kash" && (
                <>
                  <svg className={styles.clouds} viewBox="0 0 300 90" preserveAspectRatio="xMaxYMin slice">
                    <g>
                      <circle cx="40" cy="6" r="34" />
                      <circle cx="92" cy="18" r="30" />
                      <circle cx="140" cy="2" r="36" />
                      <circle cx="196" cy="20" r="32" />
                      <circle cx="248" cy="4" r="38" />
                      <circle cx="296" cy="22" r="30" />
                    </g>
                  </svg>
                  <KashDrawing />
                </>
              )}
              {banner.id !== "kash" && (
                <>
                  <svg className={styles.rings} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="50" />
                    <circle cx="50" cy="50" r="40" />
                    <circle cx="50" cy="50" r="30" />
                    <circle cx="50" cy="50" r="20" />
                  </svg>
                  <span className={styles.frame} data-frame={banner.id === "countdown" ? "circle" : "card"}>
                    <Image
                      src={banner.id === "countdown" ? "/assets/dashboard/countdown-pedestals.webp" : "/assets/dashboard/xstream.webp"}
                      alt=""
                      fill
                      sizes="240px"
                      className={styles.photo}
                    />
                  </span>
                  {banner.id === "countdown" && <Timer className={styles.timer} />}
                </>
              )}
            </span>
            <span className={styles.bannerWords}>
              <b>{banner.title}</b>
              <i aria-hidden="true" />
              <span>{banner.line}</span>
            </span>
            {"tag" in banner && <span className={styles.bannerTag}>{banner.tag}</span>}
          </div>
        ))}
      </div>
      <div className={styles.promoBar}>
        <span className={styles.dots} aria-hidden="true">
          {BANNERS.map((banner, i) => (
            <i key={banner.id} data-on={i === slide || undefined} />
          ))}
        </span>
        <span className={styles.promoButtons}>
          <button type="button" aria-label="Previous banner" onClick={() => go(-1)}>
            <Icon name="chevron-left" size={20} tone="current" />
          </button>
          <button
            type="button"
            aria-label={paused ? "Play banners" : "Pause banners"}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            <Icon name={paused ? "play" : "pause"} size={20} tone="current" />
          </button>
          <button type="button" aria-label="Next banner" onClick={() => go(1)}>
            <Icon name="chevron-right" size={20} tone="current" />
          </button>
        </span>
      </div>
    </div>
  );
}

/** Ask Vivid, at the foot of Home, typing what people ask it. */
/**
 * Ask Vivid, at the foot of Home, as the hub has it: its globe, and the
 * questions people ask it, one after another. When the Vivid section takes
 * its globe up (../vivid/vivid-handoff), the globe leaves the dock and the
 * question waits on the one Vivid goes on to answer.
 */
function VividDock({ run, href }: { run: boolean; href: string }) {
  const [question, setQuestion] = useState(0);
  const [lifted, setLifted] = useState(false);
  useMotionValueEvent(dockLift, "change", (v) => setLifted(v > 0.0005));
  const globeOpacity = useTransform(dockLift, (v) => (v > 0.0005 ? 0 : 1));
  useEffect(() => {
    if (!run || lifted) return;
    const timer = window.setInterval(() => setQuestion((q) => (q + 1) % QUESTIONS.length), 3500);
    return () => window.clearInterval(timer);
  }, [run, lifted]);
  const asking = lifted ? HANDED_OVER : question;

  return (
    <a href={href} className={`${styles.vivid} cx-beam cx-beam--slow`}>
      <motion.span data-vivid-dock className={styles.dockGlobe} style={{ opacity: globeOpacity }}>
        <VividGlobe size={40} />
      </motion.span>
      <span className={styles.vividWords}>
        <small>Not sure where to start? Ask Vivid AI</small>
        <span className={styles.asking}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={asking}
              className={styles.question}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              “{QUESTIONS[asking]}”
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span className={styles.vividCta}>
        Ask Vivid
        <Icon name="arrow-right" size={20} tone="current" />
      </span>
    </a>
  );
}
