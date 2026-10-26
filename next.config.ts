import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing page grew out of the /globe-preview spike and is "/" now;
  // links to the spike still land on it
  async redirects() {
    return [{ source: "/globe-preview", destination: "/", permanent: false }];
  },
};

export default nextConfig;
