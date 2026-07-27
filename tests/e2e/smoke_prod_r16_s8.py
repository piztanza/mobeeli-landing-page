"""Post-deploy smoke test of R16 s8 against LIVE production."""
from playwright.sync_api import sync_playwright
import json, sys

BASE = "https://mobeeli-landing-page.vercel.app"
R = []
def ck(n, c, d=""):
    R.append((n, bool(c), str(d)[:140])); print(("PASS" if c else "FAIL"), "|", n, "" if c else f" -> {str(d)[:140]}")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(viewport={"width": 1280, "height": 900}).new_page()
    errs, cons = [], []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: cons.append(m.text) if m.type == "error" else None)
    resp = pg.goto(BASE, wait_until="domcontentloaded", timeout=90000)
    ck("prod: / returns 200", resp.status == 200, resp.status)
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    pg.wait_for_timeout(1200)

    counts = pg.evaluate("""() => ({
      grid: document.querySelectorAll('.mb-cat-car-grid').length,
      dots: document.querySelectorAll('.mb-cat-scan-dot').length,
      leaders: document.querySelectorAll('.mb-cat-scan-leader').length,
      vals: document.querySelectorAll('.mb-cat-scan-val').length,
      lock: document.querySelectorAll('.mb-cat-scan-lock').length,
      hidden: !!document.querySelector('.mb-cat-scan-readout[aria-hidden="true"]'),
      text: [...document.querySelectorAll('.mb-cat-scan-val,.mb-cat-scan-lock-t')].map(e => e.textContent) })""")
    ck("prod: readout rendered (grid/3 dots/3 leaders/3 values/lock)",
       counts["grid"] == 1 and counts["dots"] == 3 and counts["leaders"] == 3
       and counts["vals"] == 3 and counts["lock"] == 1, counts)
    ck("prod: readout is aria-hidden", counts["hidden"])
    ck("prod: the four ruled strings are live", len(counts["text"]) == 4, counts["text"])

    # Bug A -- the band must be dead at rest.
    rest = pg.evaluate("""() => [...document.querySelectorAll(
        '.mb-cat-scan-line,.mb-cat-scan-dot,.mb-cat-scan-leader,.mb-cat-scan-val,.mb-cat-scan-lock')]
        .map(e => ({a: getComputedStyle(e).animationName, o: +getComputedStyle(e).opacity}))""")
    ck("prod/Bug A: every readout element idle + invisible at rest",
       len(rest) == 11 and all(x["a"] == "none" and x["o"] == 0 for x in rest),
       [x for x in rest if x["a"] != "none" or x["o"] != 0][:3])

    # The choreography, with the ruled stagger, on the real deployed CSS.
    pg.locator("#how-it-works select").nth(2).select_option(index=1)
    pg.wait_for_timeout(350)
    chor = pg.evaluate("""() => {
      const g = cls => [...document.querySelectorAll('.' + cls)].map(e => {
        const c = getComputedStyle(e); return [c.animationName, c.animationDuration, c.animationDelay]; });
      const l = getComputedStyle(document.querySelector('.mb-cat-scan-lock'));
      const ln = getComputedStyle(document.querySelector('.mb-cat-scan-line'));
      return { dot: g('mb-cat-scan-dot'), leader: g('mb-cat-scan-leader'), val: g('mb-cat-scan-val'),
               lock: [l.animationName, l.animationDuration, l.animationDelay],
               line: [ln.animationName, ln.animationDuration],
               scanning: !!document.querySelector('.mb-cat-car-wrapper.is-scanning') }; }""")
    ck("prod: scan engaged", chor["scanning"])
    ck("prod: line 1.8s = SCAN_DURATION_MS", chor["line"] == ["mb-cat-scan", "1.8s"], chor["line"])
    ck("prod: dot stagger 0.5/0.8/1.02 @0.3s",
       chor["dot"] == [["mb-cat-scan-dot", "0.3s", d] for d in ("0.5s", "0.8s", "1.02s")], chor["dot"])
    ck("prod: leader stagger 0.5/0.8/1.02 @0.45s",
       chor["leader"] == [["mb-cat-scan-leader", "0.45s", d] for d in ("0.5s", "0.8s", "1.02s")], chor["leader"])
    ck("prod: value stagger 0.55/0.85/1.07 @0.5s",
       chor["val"] == [["mb-cat-scan-val", "0.5s", d] for d in ("0.55s", "0.85s", "1.07s")], chor["val"])
    ck("prod: lock 0.5s @1.3s", chor["lock"] == ["mb-cat-scan-lock", "0.5s", "1.3s"], chor["lock"])

    pg.wait_for_timeout(1250)
    vals = pg.evaluate("""() => [...document.querySelectorAll('.mb-cat-scan-val')].map(e => +getComputedStyle(e).opacity)""")
    ck("prod: all three measurements land inside the pass", all(o > 0.99 for o in vals), vals)

    pg.wait_for_timeout(900)
    ck("prod: scan ends and the frame goes idle",
       pg.evaluate("""() => { const f = document.querySelector('.mb-cat-car-wrapper');
         return !f.classList.contains('is-scanning') && document.getAnimations()
           .filter(a => a.playState === 'running' && a.effect && a.effect.target && f.contains(a.effect.target)).length === 0; }"""))
    ck("prod: garage persisted, verified badges shown",
       pg.locator(".mb-cat-verified").count() == 4, pg.locator(".mb-cat-verified").count())

    spill = pg.evaluate("""() => { const f = document.querySelector('.mb-cat-car-wrapper').getBoundingClientRect();
      return [...document.querySelectorAll('.mb-cat-scan-val,.mb-cat-scan-lock,.mb-cat-scan-dot,.mb-cat-scan-leader')]
        .map(e => { const r = e.getBoundingClientRect();
          return {t:(e.textContent||'').trim().slice(0,14), l:Math.round(r.left-f.left), r:Math.round(r.right-f.right)}; })
        .filter(o => o.l < 0 || o.r > 0); }""")
    ck("prod: no callout overflows the frame", spill == [], spill)

    ck("prod: no page errors", len(errs) == 0, errs[:2])
    ck("prod: no console errors", len(cons) == 0, cons[:2])
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    b.close()

# Reduced motion on the live site.
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(reduced_motion="reduce", viewport={"width": 1280, "height": 900}).new_page()
    pg.goto(BASE, wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    pg.wait_for_timeout(900)
    ro = pg.evaluate("""() => [...document.querySelectorAll(
        '.mb-cat-scan-dot,.mb-cat-scan-leader,.mb-cat-scan-val,.mb-cat-scan-lock')]
        .map(e => ({a: getComputedStyle(e).animationName, o: +getComputedStyle(e).opacity}))""")
    ck("prod/Bug B: reduced motion shows the FINISHED reading",
       len(ro) == 10 and all(x["o"] > 0.99 and x["a"] == "none" for x in ro),
       [x for x in ro if x["o"] <= 0.99 or x["a"] != "none"][:3])
    ck("prod/Bug B: nothing anywhere is animating under reduced motion",
       pg.evaluate("() => document.getAnimations().filter(a => a.playState==='running').length") == 0)
    b.close()

passed = sum(1 for _, ok, _ in R if ok)
print("\n===SUMMARY===")
print(json.dumps({"passed": passed, "total": len(R), "failed": [n for n, ok, _ in R if not ok]}, indent=1))
sys.exit(0 if passed == len(R) else 1)
