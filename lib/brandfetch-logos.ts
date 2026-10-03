import type { LogoMarqueeItem } from "@/components/ui/logo-marquee";

const brands = [
  { name: "Spotify", domain: "spotify.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Figma", domain: "figma.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "Slack", domain: "slack.com" },
  { name: "Adobe", domain: "adobe.com" },
] as const;

type BrandfetchLogo = {
  type?: string;
  theme?: string;
  formats?: { src?: string; format?: string }[];
};

type BrandfetchBrand = {
  logos?: BrandfetchLogo[];
};

function logoSource(logos: BrandfetchLogo[] = []) {
  const whiteMarks = ["symbol", "logo"].flatMap((type) =>
    logos.filter((logo) => logo.type === type && logo.theme === "light")
  );

  for (const logo of whiteMarks) {
    const format = logo.formats?.find((item) => item.format === "svg");
    if (!format?.src) continue;

    try {
      const url = new URL(format.src);
      if (url.protocol === "https:" && url.hostname.endsWith(".brandfetch.io")) {
        return url.toString();
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function getLogo(
  brand: (typeof brands)[number],
  apiKey: string
): Promise<LogoMarqueeItem | null> {
  try {
    const response = await fetch(
      `https://api.brandfetch.io/v2/brands/domain/${brand.domain}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as BrandfetchBrand;
    const src = logoSource(data.logos);
    return src ? { name: brand.name, src } : null;
  } catch {
    return null;
  }
}

export async function getBrandfetchLogos(): Promise<LogoMarqueeItem[]> {
  const apiKey = process.env.BRANDFETCH_API_KEY;
  if (!apiKey) return [];

  const logos = await Promise.all(brands.map((brand) => getLogo(brand, apiKey)));
  return logos.filter((logo): logo is LogoMarqueeItem => logo !== null);
}
