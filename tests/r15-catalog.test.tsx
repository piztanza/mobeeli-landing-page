import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LandingPage from "@/app/page";

describe("R15 Catalog Port Contract", () => {
  const filePath = path.resolve(__dirname, "../src/components/landing/FitmentSection.tsx");
  const cssPath = path.resolve(__dirname, "../src/components/landing/landing.css");
  
  const content = fs.readFileSync(filePath, "utf-8");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("1. Uses the blue car asset and has NO green hexes", () => {
    // Asset check
    expect(content).toContain("catalog-car-poster.jpg");

    // Green ban check on both FitmentSection and its CSS
    const combined = (content + cssContent).toLowerCase();
    expect(combined).not.toContain("#10b981");
    expect(combined).not.toContain("#34d399");
    expect(combined).not.toContain("#818cf8");
  });

  it("2. Contains the correct catalog part cards and YMM picker", () => {
    // Filter Active panel exists
    expect(content).toContain("Filter Active");

    // All 4 parts are listed
    expect(content).toContain("spark-plug.jpg");
    expect(content).toContain("clutch.jpg");
    expect(content).toContain("shock.jpg");
    expect(content).toContain("brake-pad.jpg");
  });

  it("3. Does not import FitmentWheel or three.js", () => {
    expect(content).not.toContain("FitmentWheel");
    expect(content).not.toContain("@react-three/fiber");
  });

  it("4. Correctly renders the EN locale without the Indonesian word '(Simulasi)'", () => {
    const html = renderToStaticMarkup(<LandingPage lang="en" />);
    // Since we are rendering the EN locale, it should use "(Simulation)" and NOT "(Simulasi)"
    expect(html).toContain("(Simulation)");
    expect(html).not.toContain("(Simulasi)");
  });
});
