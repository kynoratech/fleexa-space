import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  serverExternalPackages: ["transbank-sdk"],
};

export default config;
