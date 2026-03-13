import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3bk8pkqsprcvh.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "bandai-hobby.net",
      },
    ],
  },
};

export default nextConfig;
