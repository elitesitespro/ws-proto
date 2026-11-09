import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos through next/image come as AVIF where the browser takes it (about
  // a quarter smaller than WebP on this page's art), WebP otherwise
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The landing page grew out of the /globe-preview spike and is "/" now;
  // links to the spike still land on it
  async redirects() {
    return [{ source: "/globe-preview", destination: "/", permanent: false }];
  },
};

export default nextConfig;
