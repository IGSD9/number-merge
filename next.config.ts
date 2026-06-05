import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
};

function withOptionalPWA(config: NextConfig): NextConfig {
  if (process.env.NODE_ENV !== "production") {
    return config;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWAInit = require("next-pwa");
  const withPWA = withPWAInit({
    dest: "public",
    disable: false,
    register: true,
    skipWaiting: true,
  });

  return withPWA(config);
}

export default withOptionalPWA(nextConfig);
