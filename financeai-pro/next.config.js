const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 3600,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\./,
      handler: "CacheFirst",
      options: {
        cacheName: "font-cache",
        expiration: {
          maxAgeSeconds: 31536000,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsHmrCache: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@langchain/core", "@langchain/google-genai"],
};

module.exports = withPWA(nextConfig);
