/**
 * Vitest stub for next/font/google — the real module needs the Next.js
 * compiler (it throws "Inter is not a function" under raw vitest). Tests only
 * ever need the returned CSS-variable handle, so a static shape suffices.
 */
export function Inter() {
  return { variable: "--font-inter", className: "font-inter", style: { fontFamily: "Inter" } };
}
export function Space_Grotesk() {
  return {
    variable: "--font-space-grotesk",
    className: "font-space-grotesk",
    style: { fontFamily: "Space Grotesk" },
  };
}
