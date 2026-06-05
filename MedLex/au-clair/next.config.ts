import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  devIndicators: false,
  basePath,
  trailingSlash: true,
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
};

export default nextConfig;
