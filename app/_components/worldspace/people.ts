// The people in the previews, all illustrative (public/assets/people). The
// first seven are cropped from the app's own portraits (shared with WorldCall)
// and live in WorldSpace; the rest were generated for the page, so the street
// and Xtream each have faces of their own rather than the same few again.
export const PEOPLE = {
  mei: "Mei",
  amara: "Amara",
  tunde: "Tunde",
  elena: "Elena",
  ravi: "Ravi",
  ngozi: "Ngozi",
  adaeze: "Adaeze",
  // The street's Connect Ave: London, Lagos, Toronto, Nairobi, Mumbai, Johannesburg
  tolu: "Tolu",
  chidi: "Chidi",
  kwame: "Kwame",
  wanjiru: "Wanjiru",
  arjun: "Arjun",
  thandi: "Thandi",
  // Xtream's crowd
  daniel: "Daniel",
  emeka: "Emeka",
  kofi: "Kofi",
  amaka: "Amaka",
  zainab: "Zainab",
  segun: "Segun",
  lin: "Lin",
} as const;

export type PersonId = keyof typeof PEOPLE;

export const face = (id: PersonId) => `/assets/people/${id}.webp`;
