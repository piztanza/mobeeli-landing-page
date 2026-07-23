/**
 * Vitest stub for geist/font/sans — the real module ships pre-built font
 * assets that the Next compiler wires up; under raw vitest it needs only the
 * CSS-variable handle the layout consumes.
 */
export const GeistSans = {
  variable: "--font-geist-sans",
  className: "font-geist-sans",
  style: { fontFamily: "Geist" },
};
