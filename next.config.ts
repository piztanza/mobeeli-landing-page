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
    ];
  },
};

export default nextConfig;
