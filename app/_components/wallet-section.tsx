import { WalletPreview } from "./wallet-preview";

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

        <div className="mt-8">
          <WalletPreview />
        </div>
      </div>
    </section>
  );
}
