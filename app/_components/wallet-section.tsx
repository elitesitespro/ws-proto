import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const walletFunctions = [
  {
    title: "Pay",
    description: "Complete supported transactions across WorldStreet.",
  },
  {
    title: "Receive",
    description: "Receive eligible earnings, transfers or payments.",
  },
  {
    title: "Track",
    description: "See supported transaction activity in one place.",
  },
  {
    title: "Move",
    description: "Use eligible balances across participating WorldStreet services.",
  },
] as const;

function WalletFunctionCard({
  title,
  description,
}: (typeof walletFunctions)[number]) {
  return (
    <Card className="gap-0! overflow-visible! rounded-none! bg-transparent! py-0! ring-0!">
      <div
        aria-hidden="true"
        className="aspect-[4/5] w-full rounded-2xl bg-[#292629]"
      />
      <CardHeader className="gap-1 px-0! pt-2">
        <CardTitle
          role="heading"
          aria-level={3}
          className="text-sm leading-[24px] font-medium tracking-tight text-white"
        >
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-[24px] text-white/65!">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function WalletSection() {
  return (
    <section
      id="wallet"
      aria-labelledby="wallet-heading"
      className="bg-[#070405] py-16 text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="max-w-4xl">
          <p className="inline-flex min-h-4 items-center rounded-full bg-white/10 px-2 text-[14px] leading-[24px] font-medium text-white/80">
            Universal wallet
          </p>
          <h2
            id="wallet-heading"
            className="mt-3 max-w-4xl text-xl leading-[44px] font-medium tracking-tight md:text-3xl md:leading-[56px] md:tracking-tighter"
          >
            One wallet for supported payments, earnings and transactions.
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {walletFunctions.map((item) => (
            <WalletFunctionCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
