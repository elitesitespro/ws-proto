import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { IconDefs } from "@/ds/components/icon";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import "./globals.css";

// The WorldStreet design system's type: Manrope carries everything (variable,
// so every weight is there); Noto Sans only fills the ₦ glyph Manrope lacks.
// Both are self-hosted (app/fonts, from Google Fonts): fetched at build time,
// a failed download quietly left the whole site in the Arial stand-in.
const manrope = localFont({
  src: "./fonts/Manrope-latin.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-manrope",
});
// Just ₦ and ₵, so it's only fetched where a price is shown in them
const noto = localFont({
  src: "./fonts/NotoSans-currency.woff2",
  weight: "400 500",
  style: "normal",
  display: "swap",
  variable: "--font-noto",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+20A6, U+20B5" }],
});

export const metadata: Metadata = {
  title: "Workspace",
  description: "A starting point for the workspace.",
};

export const viewport: Viewport = {
  themeColor: "#0C0A09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Design system: data-theme sits alongside .dark (next-themes sets both);
    // data-brand re-colours the kit as WorldStreet and cx-root sets its base type.
    <html
      lang="en"
      data-theme="dark"
      className={`${manrope.variable} ${noto.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body data-brand="worldstreet" className="cx-root min-h-full">
        {/* Icon gradients, defined once inside the brand so they take its golds */}
        <IconDefs />
        <IconDefs brand="worldstreet" />
        <ThemeProvider
          attribute={["class", "data-theme"]}
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScroll />
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
