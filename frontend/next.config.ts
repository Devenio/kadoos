import type { NextConfig } from "next";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${api.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
