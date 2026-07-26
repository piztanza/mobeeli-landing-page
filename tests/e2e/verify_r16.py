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

    # --- R16 s8: the choreography really runs, with the ruled stagger ---
    SPEC = {"mb-cat-scan-dot": ("0.3s", ["0.5s", "0.8s", "1.02s"]),
            "mb-cat-scan-leader": ("0.45s", ["0.5s", "0.8s", "1.02s"]),
            "mb-cat-scan-val": ("0.5s", ["0.55s", "0.85s", "1.07s"])}
    chor = pg.evaluate("""() => {
      const out = {};
      for (const cls of ['mb-cat-scan-dot','mb-cat-scan-leader','mb-cat-scan-val']) {
        out[cls] = [...document.querySelectorAll('.' + cls)].map(el => {
          const cs = getComputedStyle(el);
          return { name: cs.animationName, dur: cs.animationDuration, delay: cs.animationDelay,
                   ease: cs.animationTimingFunction };
        });
      }
      const lock = document.querySelector('.mb-cat-scan-lock');
      const lcs = lock && getComputedStyle(lock);
      out.lock = lcs && { name: lcs.animationName, dur: lcs.animationDuration, delay: lcs.animationDelay };
      return out;
    }""")
    for cls, (dur, delays) in SPEC.items():
        got = chor[cls]
        ck(f"s8: three {cls.split('-')[-1]}s animate during the scan",
           len(got) == 3 and all(g["name"] == cls for g in got), got)
        ck(f"s8: {cls.split('-')[-1]} duration {dur}", all(g["dur"] == dur for g in got), [g["dur"] for g in got])
        ck(f"s8: {cls.split('-')[-1]} stagger {delays}", [g["delay"] for g in got] == delays, [g["delay"] for g in got])
        ck(f"s8: {cls.split('-')[-1]} on the ruled easing",
           all("0.2, 0.7, 0.2, 1" in g["ease"] for g in got), [g["ease"] for g in got])
    ck("s8: lock animates at 1.3s for 0.5s",
       chor["lock"] and chor["lock"]["name"] == "mb-cat-scan-lock"
       and chor["lock"]["dur"] == "0.5s" and chor["lock"]["delay"] == "1.3s", chor["lock"])
    ck("s8: measurement grid is present", pg.locator(".mb-cat-car-grid").count() == 1)

    # By ~1.6s the three measurements have landed (the last finishes at 1570ms)
    # and the lock is still arriving -- it completes on exactly 1800ms, the end
    # of the pass, so it is deliberately NOT expected to be full here.
    pg.wait_for_timeout(1200)
    landed = pg.evaluate("""() => ({
      vals: [...document.querySelectorAll('.mb-cat-scan-val')].map(e => +getComputedStyle(e).opacity),
      lock: +getComputedStyle(document.querySelector('.mb-cat-scan-lock')).opacity })""")
    ck("s8: all three measurements have landed by 1.6s",
       len(landed["vals"]) == 3 and all(o > 0.99 for o in landed["vals"]), landed["vals"])
    ck("s8: the lock is still arriving at 1.6s, landing on 1800ms",
       0 < landed["lock"] < 1, landed["lock"])

    pg.wait_for_timeout(1000)
    ck("Bug A: sweep stops after the scan", not pg.evaluate("!!document.querySelector('.mb-cat-car-wrapper.is-scanning')"))
    at_rest = pg.evaluate("""() => [...document.querySelectorAll(
        '.mb-cat-scan-line,.mb-cat-scan-dot,.mb-cat-scan-leader,.mb-cat-scan-val,.mb-cat-scan-lock')]
        .map(e => ({ a: getComputedStyle(e).animationName, o: +getComputedStyle(e).opacity }))""")
    ck("Bug A: every readout element is idle and invisible at rest",
       all(x["a"] == "none" and x["o"] == 0 for x in at_rest),
       [x for x in at_rest if x["a"] != "none" or x["o"] != 0][:3])
    # Scoped to the frame: the page legitimately animates elsewhere (the hero
    # rotator, the aurora). The contract is that THIS band is dead at rest.
    still = pg.evaluate("""() => {
      const f = document.querySelector('.mb-cat-car-wrapper');
      return document.getAnimations()
        .filter(a => a.playState === 'running' && a.effect && a.effect.target && f.contains(a.effect.target))
        .map(a => a.animationName || (a.effect.target.className + ''));
    }""")
    ck("Bug A: nothing in the fitment frame is animating once the scan ends", still == [], still)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")

    # --- s8 geometry: no callout may escape the 280px frame (it is overflow:hidden,
    #     so an overflowing label is silently CLIPPED rather than visibly broken) ---
    def spill(page):
        return page.evaluate("""() => {
          const f = document.querySelector('.mb-cat-car-wrapper').getBoundingClientRect();
          return [...document.querySelectorAll('.mb-cat-scan-val,.mb-cat-scan-lock,.mb-cat-scan-dot,.mb-cat-scan-leader')]
            .map(e => { const r = e.getBoundingClientRect();
                        return { t: (e.textContent||'').trim().slice(0,14) || e.className,
                                 l: Math.round(r.left-f.left), r: Math.round(r.right-f.right),
                                 tp: Math.round(r.top-f.top), b: Math.round(r.bottom-f.bottom) }; })
            .filter(o => o.l < 0 || o.r > 0 || o.tp < 0 || o.b > 0);
        }""")
    ck("s8: no callout overflows the frame at 1280", spill(pg) == [], spill(pg))
    pg.set_viewport_size({"width": 375, "height": 800}); pg.wait_for_timeout(300)
    ck("s8: no callout overflows the full-width frame at 375", spill(pg) == [], spill(pg))
    pg.set_viewport_size({"width": 1280, "height": 900}); pg.wait_for_timeout(200)

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

    # s8: reduced motion must show the FINISHED reading, not hide it. This is the
    # assertion that catches the specificity trap -- a media query adds no
    # specificity, so cancelling `.mb-cat-car-wrapper.is-scanning X` needs the
    # same two-class selector or the stagger keeps running here.
    readout = pg.evaluate("""() => [...document.querySelectorAll(
        '.mb-cat-scan-dot,.mb-cat-scan-leader,.mb-cat-scan-val,.mb-cat-scan-lock')]
        .map(e => ({ a: getComputedStyle(e).animationName, o: +getComputedStyle(e).opacity }))""")
    ck("s8/Bug B: the reading is shown, not hidden, under reduced motion",
       len(readout) == 10 and all(x["o"] > 0.99 for x in readout),
       [x for x in readout if x["o"] <= 0.99][:3])
    ck("s8/Bug B: every readout animation is cancelled, not merely delayed",
       all(x["a"] == "none" for x in readout), [x for x in readout if x["a"] != "none"][:3])
    ck("s8/Bug B: value labels keep their centring transform",
       pg.evaluate("""() => [...document.querySelectorAll('.mb-cat-scan-val')]
           .every(e => getComputedStyle(e).transform !== 'none')"""))
    b.close()

passed = sum(1 for _, ok, _ in R if ok)
print("\n===SUMMARY===")
print(json.dumps({"passed": passed, "total": len(R), "failed": [n for n, ok, _ in R if not ok]}, indent=1))
sys.exit(0 if passed == len(R) else 1)
