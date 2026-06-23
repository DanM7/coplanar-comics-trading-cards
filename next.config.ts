import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Project lives under C:\dev\DanM7\... while C:\dev\package-lock.json also exists.
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
