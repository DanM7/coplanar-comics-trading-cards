import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Project lives under C:\dev\DanM7\... while C:\dev\package-lock.json also exists.
  outputFileTracingRoot: path.join(process.cwd()),
  // Keep large static assets out of the Netlify server handler bundle.
  outputFileTracingExcludes: {
    "*": [
      "./public/assets/cards/**/*",
      "./assets/cards/**/*",
      "./assets/raw_front/**/*",
      "./assets/raw_back/**/*",
      "./data/team_rankings.json",
    ],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
