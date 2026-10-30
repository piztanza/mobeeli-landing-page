import { describe, expect, it } from "vitest";

import { DEMO_PARTS, DEMO_VEHICLES } from "@/components/solutions/fitmentDemo";
import {
  ENGINE_ROWS,
  checkValues,
  listingLine,
  padRows,
  partLine,
  vehicleTireLine,
} from "@/components/solutions/fitmentFormat";
import { checkPart } from "@/components/solutions/fitmentSolver";
import { langs } from "@/lib/i18n";

/**
 * The explainer's view strings — PURE, so every car × part state the figure can
 * reach is covered here, not just the default one the server renders. (There is
 * no DOM test environment in this repo; this is where interaction coverage
 * lives.)
 */

const car = (id: string) => DEMO_VEHICLES.find((v) => v.id === id)!;
const part = (id: string) => DEMO_PARTS.find((p) => p.id === id)!;

describe("every reachable state prints a value on both sides of every check", () => {
  const combos = DEMO_VEHICLES.flatMap((v) => DEMO_PARTS.map((p) => [v, p] as const));

  it("covers all twelve car × part pairs", () => {
    expect(combos.length).toBe(12);
  });

  it.each(combos.map(([v, p]) => [`${v.id} × ${p.id}`, v, p] as const))(
    "%s",
    (_, vehicle, item) => {
      for (const lang of langs) {
        for (const check of checkPart(vehicle.fitment, item.spec).checks) {
          const [partValue, carValue] = checkValues(check, item, vehicle.fitment, lang);
          expect(partValue.trim(), `${lang} ${check.id} part`).not.toBe("");
          expect(carValue.trim(), `${lang} ${check.id} car`).not.toBe("");
        }
      }
    },
  );
});

describe("the strings the figure shows", () => {
  it("prints the default state — the Atto 3 against the 18-inch wheel", () => {
    const atto = car("atto3");
    const wheel = part("w18");
    const values = checkPart(atto.fitment, wheel.spec).checks.map((c) =>
      checkValues(c, wheel, atto.fitment, "en"),
    );
    expect(values).toEqual([
      ["5 × 114.3", "5 × 114.3"],
      ["67.1 mm", "≥ 60.1 mm"],
      ["ET 40", "ET 38–42"],
      ["18″ × 7J", "17–18″ · 6.5–7J"],
    ]);
  });

  it("writes the Indonesian decimal comma", () => {
    const atto = car("atto3");
    const wheel = part("w18");
    const bore = checkPart(atto.fitment, wheel.spec).checks.find((c) => c.id === "bore")!;
    expect(checkValues(bore, wheel, atto.fitment, "id")).toEqual(["67,1 mm", "≥ 60,1 mm"]);
  });

  it("states a tire's diameter as its signed deviation against the ±3% window", () => {
    const seal = car("seal");
    const tire = part("t19");
    const od = checkPart(seal.fitment, tire.spec).checks.find((c) => c.id === "diameter")!;
    expect(checkValues(od, tire, seal.fitment, "en")).toEqual(["+6.8%", "±3%"]);
  });

  it("gives the bolt circle as the reason the 5 × 114.3 wheel cannot go on the Seal", () => {
    const seal = car("seal");
    const wheel = part("w18");
    const why = checkPart(seal.fitment, wheel.spec).checks.find((c) => c.state === "fail")!;
    expect(why.id).toBe("pcd");
    expect(checkValues(why, wheel, seal.fitment, "en")[0]).toBe("5 × 114.3");
  });

  it("keeps the listing line shorter than the catalogue line", () => {
    expect(partLine(part("w18"), "en")).toBe("18″ × 7J · ET 40 · 5 × 114.3");
    expect(listingLine(part("w18"), "en")).toBe("18″ × 7J · ET 40");
    expect(listingLine(part("t18"), "en")).toBe("235/50 R18");
  });

  it("prints the OE tire without a load index when none is on record", () => {
    expect(vehicleTireLine(car("ioniq5").fitment)).toBe("235/55 R19");
  });
});

describe("the engine table keeps its height", () => {
  it("pads a two-check tire to the four rows a wheel takes", () => {
    const checks = checkPart(car("atto3").fitment, part("t18").spec).checks;
    const rows = padRows(checks);
    expect(ENGINE_ROWS).toBe(4);
    expect(rows.length).toBe(4);
    expect(rows.filter((r) => r === null).length).toBe(2);
  });

  it("never pads past the wheel's four checks", () => {
    const checks = checkPart(car("atto3").fitment, part("w18").spec).checks;
    expect(padRows(checks)).toEqual(checks);
  });
});
