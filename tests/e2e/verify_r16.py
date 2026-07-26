"""R16 batch-1 visual verification: type system, band-2 hierarchy, glass, scan gating."""
from playwright.sync_api import sync_playwright
import json, sys

BASE = "http://localhost:4400"
R = []
def ck(n, c, d=""):
    R.append((n, bool(c), str(d)[:120])); print(("PASS" if c else "FAIL"), "|", n, "" if c else f" -> {str(d)[:120]}")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(viewport={"width": 1280, "height": 900}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE, wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_selector("#how-it-works", timeout=60000, state="attached")
    pg.wait_for_timeout(1500)

    # --- type system: one family everywhere ---
    fams = pg.evaluate("""() => {
      const out = {};
      for (const sel of ['body','h1','.mb-h2','.mb-ucat-h2','.mb-hero-h1']) {
        const el = document.querySelector(sel);
        if (el) out[sel] = getComputedStyle(el).fontFamily;
      }
      return out;
    }""")
    for sel, fam in fams.items():
        ck(f"type: {sel} uses Plus Jakarta Sans", "Plus Jakarta Sans" in fam, fam)
        ck(f"type: {sel} has no Inter/Space Grotesk", "Space Grotesk" not in fam and "Inter" not in fam, fam)

    # --- no webfont other than PJS was requested ---
    fontreqs = pg.evaluate("""() => performance.getEntriesByType('resource')
        .map(r => r.name).filter(n => /\\.(woff2?|ttf)(\\?|$)/i.test(n))""")
    ck("perf: only PJS font files load", all("pjs" in f.lower() for f in fontreqs), fontreqs)

    # --- band 2 hierarchy: H2 now at real scale, not 28px ---
    h2 = pg.evaluate("""() => {
      const a = document.querySelector('.mb-ucat-h2');
      const b = document.querySelector('#problem .mb-h2, .mb-h2');
      return { band2: a && parseFloat(getComputedStyle(a).fontSize),
               band2w: a && getComputedStyle(a).fontWeight,
               other: b && parseFloat(getComputedStyle(b).fontSize) };
    }""")
    ck("hierarchy: band-2 H2 well above the old 28px", h2["band2"] and h2["band2"] > 40, h2)
    ck("hierarchy: band-2 H2 is 800 weight", h2["band2w"] == "800", h2["band2w"])

    # --- glass primitive applied and computing ---
    glass = pg.evaluate("""() => {
      const card = document.querySelector('.mb-ucat-card.mb-glass');
      const pick = document.querySelector('.mb-cat-ymm.mb-glass');
      const cs = e => e ? { bf: getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter,
                            bs: getComputedStyle(e).boxShadow.slice(0,60) } : null;
      return { card: cs(card), picker: cs(pick), cards: document.querySelectorAll('.mb-ucat-card.mb-glass').length };
    }""")
    ck("glass: all 4 part cards carry .mb-glass", glass["cards"] == 4, glass["cards"])
    ck("glass: card computes a backdrop blur", glass["card"] and "blur(22px)" in (glass["card"]["bf"] or ""), glass["card"])
    ck("glass: picker computes a backdrop blur", glass["picker"] and "blur(22px)" in (glass["picker"]["bf"] or ""), glass["picker"])

    # --- Bug A: scan line must be idle at rest ---
    rest = pg.evaluate("""() => {
      const l = document.querySelector('.mb-cat-scan-line');
      if (!l) return null;
      const cs = getComputedStyle(l);
      return { anim: cs.animationName, opacity: cs.opacity,
               scanning: !!document.querySelector('.mb-cat-car-wrapper.is-scanning') };
    }""")
    ck("Bug A: no scan animation at rest", rest and rest["anim"] in ("none", ""), rest)
    ck("Bug A: scan line invisible at rest", rest and float(rest["opacity"]) == 0, rest)

    # --- Bug A: it DOES run during a scan ---
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.reload(wait_until="domcontentloaded"); pg.wait_for_selector("#how-it-works select", timeout=30000); pg.wait_for_timeout(600)
    pg.locator("#how-it-works select").nth(2).select_option(index=1)
    pg.wait_for_timeout(400)
    during = pg.evaluate("""() => {
      const w = document.querySelector('.mb-cat-car-wrapper');
      const l = document.querySelector('.mb-cat-scan-line');
      return { scanning: w && w.className.includes('is-scanning'),
               anim: l && getComputedStyle(l).animationName,
               dur: l && getComputedStyle(l).animationDuration };
    }""")
    ck("Bug A: sweep runs during an actual scan", during["scanning"] and during["anim"] == "mb-cat-scan", during)
    ck("Bug A: sweep duration matches the 1800ms timeout", during["dur"] == "1.8s", during["dur"])
    pg.wait_for_timeout(2200)
    ck("Bug A: sweep stops after the scan", not pg.evaluate("!!document.querySelector('.mb-cat-car-wrapper.is-scanning')"))
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")

    # --- stat tiles gone ---
    ck("2b: no stat tiles rendered", pg.locator(".mb-cat-stat").count() == 0)

    ck("no uncaught page errors", len(errs) == 0, errs[:2])
    b.close()

# --- Bug B: reduced motion ---
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(reduced_motion="reduce", viewport={"width": 1280, "height": 900}).new_page()
    pg.goto(BASE, wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_selector("#how-it-works select", timeout=60000); pg.wait_for_timeout(600)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.locator("#how-it-works select").nth(2).select_option(index=1)
    pg.wait_for_timeout(400)
    rm = pg.evaluate("""() => {
      const l = document.querySelector('.mb-cat-scan-line');
      const cs = getComputedStyle(l);
      return { anim: cs.animationName, opacity: cs.opacity,
               scanning: !!document.querySelector('.mb-cat-car-wrapper.is-scanning') };
    }""")
    ck("Bug B: reduced-motion suppresses the sweep mid-scan", rm["scanning"] and rm["anim"] == "none", rm)
    running = pg.evaluate("() => document.getAnimations().filter(a => a.playState==='running').length")
    ck("Bug B: no animations running under reduced motion", running == 0, f"{running} running")
    b.close()

passed = sum(1 for _, ok, _ in R if ok)
print("\n===SUMMARY===")
print(json.dumps({"passed": passed, "total": len(R), "failed": [n for n, ok, _ in R if not ok]}, indent=1))
sys.exit(0 if passed == len(R) else 1)
