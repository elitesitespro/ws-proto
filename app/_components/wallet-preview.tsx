"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/icon";
import s from "./wallet-preview.module.css";
// Each service's glyph wears its platform hue (app/hues.css). WorkWorld has
// no hue id, so its softened sage is set in the module.
const hues: Record<string, string> = {
  lime: "workworld",
  peach: "shop",
  purple: "xtreme",
};
const transactions: {
  name: string;
  service: string;
  date: string;
  amount: string;
  type: string;
  icon: IconName;
  color: string;
}[] = [
  {
    name: "Project payment",
    service: "WorkWorld",
    date: "Today, 10:42",
    amount: "+$250.00",
    type: "Received",
    icon: "briefcase",
    color: "lime",
  },
  {
    name: "Studio headphones",
    service: "WorldStreet shop",
    date: "Today, 09:18",
    amount: "−$129.00",
    type: "Paid",
    icon: "headphones",
    color: "peach",
  },
  {
    name: "Balance transfer",
    service: "Xtream",
    date: "Yesterday, 18:06",
    amount: "−$50.00",
    type: "Moved",
    icon: "radio",
    color: "purple",
  },
  {
    name: "Creator earnings",
    service: "Xtream",
    date: "Yesterday, 14:30",
    amount: "+$180.00",
    type: "Received",
    icon: "radio",
    color: "purple",
  },
];
export function WalletPreview() {
  const [filter, setFilter] = useState("All activity");
  const [panel, setPanel] = useState<"Pay" | "Receive" | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const detail = transactions.find((t) => t.name === selected);
  return (
    <div className={s.screen} aria-label="Universal wallet product preview">
      <header className={s.topbar}>
        <span className={s.brand}>
          <Icon name="wallet" size={20} /> WorldStreet <span> / Wallet</span>
        </span>
        <span className={s.preview}>Product preview</span>
        <span className={s.avatar}>JD</span>
      </header>
      <div className={s.workspace}>
        <aside className={s.sidebar}>
          <div>
            <span className={s.caption}>Your workspace</span>
            <p className={s.active}>
              <Icon name="wallet" size={20} /> Overview
            </p>
            <a href="#wallet-activity">
              <Icon name="arrows-left-right" size={20} tone="current" /> Activity
            </a>
          </div>
          <div className={s.profile}>
            <span className={s.avatar}>JD</span>
            <span>
              Jamie Davis<small>Personal account</small>
            </span>
          </div>
        </aside>
        <div className={s.main}>
          <div className={s.title}>
            <div>
              <span className={s.caption}>Universal wallet</span>
              <h3>Your money, together.</h3>
            </div>
            <span className={s.connected}>
              <i /> Account connected
            </span>
          </div>
          <div className={s.overview}>
            <Card className={s.balance}>
              {panel ? (
                <div className={s.panel}>
                  <div className={s.panelHeading}>
                    <strong>
                      {panel === "Pay" ? "Review payment" : "Receive a payment"}
                    </strong>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Close wallet action"
                      onClick={() => setPanel(null)}
                    >
                      <Icon name="close" size={20} tone="current" />
                    </Button>
                  </div>
                  {panel === "Pay" ? (
                    <>
                      <span>WorldStreet shop · Studio headphones</span>
                      <strong className={s.amount}>$129.00</strong>
                      <span>
                        {confirmed
                          ? "Demo payment confirmed. No money moved."
                          : "Paid from your available wallet balance."}
                      </span>
                      <Button
                        size="sm"
                        className={s.primary}
                        onClick={() => setConfirmed(true)}
                        disabled={confirmed}
                      >
                        {confirmed ? (
                          <>
                            <Icon name="check" size={20} tone="current" />{" "}
                            Confirmed
                          </>
                        ) : (
                          "Confirm demo payment"
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <span>Your wallet handle</span>
                      <strong className={s.handle}>@jamie.worldstreet</strong>
                      <span>
                        Share your handle to receive supported payments.
                      </span>
                      <Button
                        size="sm"
                        className={s.primary}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              "@jamie.worldstreet",
                            );
                            setCopied(true);
                          } catch {
                            setCopied(false);
                          }
                        }}
                      >
                        <Icon name="copy" size={20} tone="current" />{" "}
                        {copied ? "Handle copied" : "Copy handle"}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className={s.balanceLabel}>
                    <span>Available balance</span>
                    <span className={s.currency}>USD</span>
                  </div>
                  <strong className={s.amount}>
                    $1,450<span>.00</span>
                  </strong>
                  <p>Ready for what’s next.</p>
                  <div className={s.actions}>
                    <Button
                      size="sm"
                      onClick={() => {
                        setConfirmed(false);
                        setPanel("Pay");
                      }}
                    >
                      <Icon name="arrow-up-right" size={20} tone="current" /> Pay
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCopied(false);
                        setPanel("Receive");
                      }}
                    >
                      <Icon name="arrow-down-left" size={20} tone="current" />{" "}
                      Receive
                    </Button>
                  </div>
                </>
              )}
            </Card>
            <div className={s.summary}>
              <span className={s.caption}>This month</span>
              <div>
                <span className={s.flowIcon} data-direction="in">
                  <Icon name="arrow-down-left" size={20} tone="current" />
                </span>
                <span>
                  Money in<strong>$2,480.00</strong>
                </span>
              </div>
              <div>
                <span className={s.flowIcon} data-direction="out">
                  <Icon name="arrow-up-right" size={20} tone="current" />
                </span>
                <span>
                  Money out<strong>$1,030.00</strong>
                </span>
              </div>
              <p>Across your connected services</p>
            </div>
          </div>
          <section
            id="wallet-activity"
            className={s.activity}
            aria-label="Recent wallet activity"
          >
            <div className={s.activityHeading}>
              <h4>Recent activity</h4>
              <span>Sample transactions</span>
            </div>
            {detail ? (
              <div className={s.detail}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                >
                  <Icon name="arrow-left" size={20} tone="current" /> All
                  activity
                </Button>
                <div className={s.detailBody}>
                  <span
                    className={s.serviceIcon}
                    data-color={detail.color}
                    data-hue={hues[detail.color]}
                  >
                    <Icon name={detail.icon} size={24} tone="current" />
                  </span>
                  <h4>{detail.name}</h4>
                  <strong data-incoming={detail.type === "Received"}>
                    {detail.amount}
                  </strong>
                  <p>
                    {detail.service} · {detail.date}
                  </p>
                  <span>
                    <Icon name="check" size={20} tone="current" /> Completed
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={s.filters}
                  role="group"
                  aria-label="Filter wallet activity"
                >
                  {["All activity", "Received", "Paid", "Moved"].map(
                    (label) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="sm"
                        aria-pressed={filter === label}
                        onClick={() => setFilter(label)}
                      >
                        {label}
                      </Button>
                    ),
                  )}
                </div>
                <div className={s.tableHeading} aria-hidden="true">
                  <span>Transaction</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Amount</span>
                </div>
                <div className={s.rows}>
                  {transactions
                    .filter(
                      (t) => filter === "All activity" || t.type === filter,
                    )
                    .map((t) => (
                      <button
                        key={t.name}
                        className={s.row}
                        onClick={() => setSelected(t.name)}
                        aria-label={`View ${t.name}, ${t.amount}`}
                      >
                        <span className={s.transaction}>
                          <span
                            className={s.serviceIcon}
                            data-color={t.color}
                            data-hue={hues[t.color]}
                          >
                            <Icon name={t.icon} size={20} tone="current" />
                          </span>
                          <span>
                            {t.name}
                            <small>{t.service}</small>
                          </span>
                        </span>
                        <span className={s.date}>{t.date}</span>
                        <span className={s.status}>
                          <Icon name="check" size={20} tone="current" />{" "}
                          Completed
                        </span>
                        <strong data-incoming={t.type === "Received"}>
                          {t.amount}
                        </strong>
                      </button>
                    ))}
                </div>
              </>
            )}
          </section>
          <footer className={s.footer}>
            <Icon name="wallet" size={20} tone="current" />
            <span>One wallet across supported WorldStreet services.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
