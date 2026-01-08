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
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://185.96.163.183:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
