import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsHmrCache: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@langchain/core", "@langchain/google-genai"],
};

export default nextConfig;
