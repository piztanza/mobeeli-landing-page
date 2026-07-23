import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The private pitch deck lives under private/ (never public/) and is read
  // from disk by /api/deck-file (F-016); trace-include it so the file ships
  // with the serverless bundle on Vercel.
  outputFileTracingIncludes: {
    "/api/deck-file": ["./private/deck/**"],
  },
  // Path-normalizing safety redirect (F-010): path-preserved domain redirects
  // from bare mobeeli.com may land on /company/<path> on the subdomain; send
  // them to the real routes with a temporary (307) redirect so they never 404.
  async redirects() {
    return [
      {
        source: "/company",
        destination: "/",
        permanent: false,
      },
      {
        source: "/company/:path*",
        destination: "/:path*",
        permanent: false,
      },
      // Early Adaptors -> Early Adopters rename (founder decision 2026-07-23):
      // permanent (308) so old links and search results carry over.
      {
        source: "/early-adaptors",
        destination: "/early-adopters",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
