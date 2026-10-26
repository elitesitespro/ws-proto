// WorldStreet intelligence, as the hub's Vivid orb wears it: a glass sphere
// holding the gold family (gold-pale, gold-hi, gold, gold-lo, gold-deep).
export function AssistantOrb() {
  return (
    <div
      aria-hidden="true"
      className="relative isolate size-20 shrink-0 overflow-hidden rounded-full border border-white/45 shadow-[0_24px_80px_rgba(234,179,8,0.28),inset_0_0_32px_rgba(255,255,255,0.5)] lg:size-28"
      style={{
        background:
          "radial-gradient(circle at 32% 72%, rgba(253, 230, 138, 0.95), transparent 32%), radial-gradient(circle at 75% 76%, rgba(250, 204, 21, 0.9), transparent 38%), radial-gradient(circle at 70% 30%, rgba(161, 98, 7, 0.9), transparent 44%), conic-gradient(from 145deg, #FDE68A, #EAB308, #A16207, #CA8A04, #FACC15, #FDE68A)",
      }}
    >
      <span className="absolute inset-1 rounded-full border border-white/40 shadow-[inset_0_0_24px_rgba(255,255,255,0.45)]" />
      <span className="absolute inset-3 rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.48),transparent_35%,rgba(66,42,10,0.45)_82%)]" />
      <span className="absolute -top-3 left-3 h-11 w-8 -rotate-45 rounded-full bg-white/35 blur-xl" />
      <span className="absolute right-2 bottom-2 size-8 rounded-full bg-amber-200/35 blur-2xl" />
    </div>
  );
}
