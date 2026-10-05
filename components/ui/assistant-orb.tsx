export function AssistantOrb() {
  return (
    <div
      aria-hidden="true"
      className="relative isolate size-20 shrink-0 overflow-hidden rounded-full border border-white/45 shadow-[0_24px_80px_rgba(75,158,255,0.25),inset_0_0_32px_rgba(255,255,255,0.55)] lg:size-28"
      style={{
        background:
          "radial-gradient(circle at 32% 72%, rgba(255, 150, 190, 0.95), transparent 32%), radial-gradient(circle at 75% 76%, rgba(24, 221, 244, 0.95), transparent 38%), radial-gradient(circle at 70% 30%, rgba(53, 74, 252, 0.95), transparent 44%), conic-gradient(from 145deg, #66e6f2, #8680ff, #d6b8ff, #5287ff, #66e6f2)",
      }}
    >
      <span className="absolute inset-1 rounded-full border border-white/40 shadow-[inset_0_0_24px_rgba(255,255,255,0.45)]" />
      <span className="absolute inset-3 rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.48),transparent_35%,rgba(7,21,68,0.45)_82%)]" />
      <span className="absolute -top-3 left-3 h-11 w-8 -rotate-45 rounded-full bg-white/35 blur-xl" />
      <span className="absolute right-2 bottom-2 size-8 rounded-full bg-cyan-300/35 blur-2xl" />
    </div>
  );
}
