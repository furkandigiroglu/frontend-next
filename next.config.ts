import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trigger rebuild
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ehankki.fi",
      },
      {
        protocol: "http",
        hostname: "185.96.163.183",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
