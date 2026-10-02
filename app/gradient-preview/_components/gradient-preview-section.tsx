import { GrainyGradient, YELLOW_GRADIENT_SEED } from "@/components/ui/grainy-gradient";

const previews = [
  { variant: "arctic", seed: 7, name: "Arctic", description: "Cool light over deep blue." },
  { variant: "purple", seed: 19, name: "Purple", description: "Soft violet fading into night." },
  { variant: "emerald", seed: 29, name: "Emerald", description: "Green light with a dark finish." },
  { variant: "warm", seed: 43, name: "Warm", description: "Muted coral above deep plum." },
  { variant: "yellow", seed: YELLOW_GRADIENT_SEED, name: "Yellow", description: "Golden light fading into dark amber." },
  {
    variant: "arctic",
    seed: 83,
    name: "Arctic alternate",
    description: "The same colors with a new shape.",
  },
] as const;

export function GradientPreviewSection() {
  return (
    <section aria-labelledby="gradient-preview-heading" className="mx-auto max-w-6xl px-3 py-6 md:px-6 md:py-8">
      <div className="max-w-2xl">
        <h1
          id="gradient-preview-heading"
          className="text-xl leading-[40px] font-semibold tracking-tight"
        >
          Grainy gradient preview
        </h1>
        <p className="mt-1 text-sm leading-[24px] opacity-70">
          One background component with five color variations.
        </p>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {previews.map((preview) => (
          <GrainyGradient
            key={`${preview.variant}-${preview.seed}`}
            variant={preview.variant}
            seed={preview.seed}
            className="flex h-32 flex-col justify-end p-3"
          >
            <h2 className="text-base leading-[24px] font-semibold tracking-tight">
              {preview.name}
            </h2>
            <p className="mt-1 text-sm leading-[24px] opacity-80">
              {preview.description}
            </p>
          </GrainyGradient>
        ))}
      </div>
    </section>
  );
}
