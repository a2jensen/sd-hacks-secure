import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@eyepop.ai/eyepop"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
