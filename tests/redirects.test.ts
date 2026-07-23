import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

// Redirect entries as produced by next.config.ts `redirects()` (F-010).
type RedirectEntry = {
  source: string;
  destination: string;
  permanent: boolean;
};

async function resolveRedirects(): Promise<RedirectEntry[]> {
  expect(typeof nextConfig.redirects).toBe("function");
  return (await nextConfig.redirects!()) as RedirectEntry[];
}

describe("path-normalizing safety redirects (F-010)", () => {
  it("redirects /company to / temporarily (307, not permanent)", async () => {
    const redirects = await resolveRedirects();
    const root = redirects.find((r) => r.source === "/company");
    expect(root).toBeDefined();
    expect(root!.destination).toBe("/");
    // permanent: false → Next.js issues a 307 Temporary Redirect.
    expect(root!.permanent).toBe(false);
  });

  it("preserves sub-paths: /company/:path* → /:path* temporarily (307)", async () => {
    const redirects = await resolveRedirects();
    const nested = redirects.find((r) => r.source === "/company/:path*");
    expect(nested).toBeDefined();
    expect(nested!.destination).toBe("/:path*");
    expect(nested!.permanent).toBe(false);
  });

  it("redirects /early-adaptors to /early-adopters permanently (308, rename 2026-07-23)", async () => {
    const redirects = await resolveRedirects();
    const rename = redirects.find((r) => r.source === "/early-adaptors");
    expect(rename).toBeDefined();
    expect(rename!.destination).toBe("/early-adopters");
    // permanent: true → 308, so old links and search results carry over.
    expect(rename!.permanent).toBe(true);
  });

  it("declares exactly the three known redirects and no basePath", async () => {
    const redirects = await resolveRedirects();
    expect(redirects).toHaveLength(3);
    // F-010 explicitly forbids a basePath — the site stays rooted at /.
    expect(nextConfig.basePath).toBeUndefined();
  });
});
