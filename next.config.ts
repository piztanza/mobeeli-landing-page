import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The private pitch deck lives under private/ (never public/) and is read
  // from disk by /api/deck-file (F-016); trace-include it so the file ships
  // with the serverless bundle on Vercel.
  outputFileTracingIncludes: {
    "/api/deck-file": ["./private/deck/**"],
  },
};

export default nextConfig;
