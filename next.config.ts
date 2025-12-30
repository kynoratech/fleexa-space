import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ["transbank-sdk"],
  },
};

export default config;
