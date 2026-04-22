import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 450,
        ignored: ["**/node_modules/**", "**/.git/**"]
      };
    }
    return config;
  }
};

export default nextConfig;
