"""E2E for R25 + R25-CORRECTIONS on the merged how-it-works band.

Walks Claude Design's R25-CORRECTIONS.md §5.2 checklist as real browser
assertions, then sweeps for discrepancies against `mobeeli-landing-r25.html`.

Runs against a server on BASE (default the local dev server). The scan check is
the slow one on purpose: "callouts land on the line as it passes" is the whole
point of the choreography and is what correction 3 restores.
"""

from playwright.sync_api import sync_playwright
import sys, os

BASE = os.environ.get("BASE", "http://localhost:4400")
R = []


def ck(name, cond, detail=""):
    ok = bool(cond)
    R.append((name, ok, str(detail)[:180]))
    print(("PASS" if ok else "FAIL"), "|", name, "" if ok else f"  -> {str(detail)[:180]}")


with sync_playwright() as p:
    br = p.chromium.launch(headless=True)

    # ---------- desktop ----------
    ctx = br.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(f"console:{m.text}") if m.type == "error" else None)
    pg.goto(BASE, wait_until="networkidle")
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.reload(wait_until="networkidle")

    # --- correction 1: the grid ---
    box = lambda sel: pg.locator(sel).first.bounding_box()
    picker, sku, win = box(".mb-cat-ymm"), box(".mb-cat-sku"), box(".mb-cat-window")
    ck("C1 window is the WIDE column, not the 360px one", win["width"] > picker["width"],
       f"window={win['width']:.0f} picker={picker['width']:.0f}")
    ck("C1 SKU card sits UNDER the picker, same column",
       sku["y"] > picker["y"] and abs(sku["x"] - picker["x"]) < 3,
       f"picker=({picker['x']:.0f},{picker['y']:.0f}) sku=({sku['x']:.0f},{sku['y']:.0f})")
    ck("C1 window spans both rows",
       win["y"] <= sku["y"] + 1 and win["y"] + win["height"] >= sku["y"] + sku["height"] - 1,
       f"win y={win['y']:.0f}..{win['y']+win['height']:.0f} sku ends {sku['y']+sku['height']:.0f}")

    # --- correction 2: the head collision ---
    ck("C2 head uses .mb-ucat-head", pg.locator("#how-it-works .mb-ucat-head").count() == 1)
    ck("C2 AiCatalogCard's colliding class is absent from this band",
       pg.locator("#how-it-works .mb-cat-head").count() == 0)
    ck("C2 head is a block, not a flex row",
       pg.eval_on_selector(".mb-ucat-head", "e => getComputedStyle(e).display") == "block")
    stacked = pg.eval_on_selector(
        ".mb-ucat-head",
        """e => { const k=e.querySelector('.mb-kicker').getBoundingClientRect(),
                       h=e.querySelector('h2').getBoundingClientRect(),
                       p=e.querySelector('.mb-ucat-head-p').getBoundingClientRect();
                 return k.bottom <= h.top+1 && h.bottom <= p.top+1; }""")
    ck("C2 kicker / H2 / lede stack on three lines", stacked)

    # --- correction 4 + the missed 5.6 plate treatment ---
    plate = pg.eval_on_selector(".mb-cat-card-img-wrap",
        "e => { const c=getComputedStyle(e); return {a:c.aspectRatio,bg:c.backgroundColor}; }")
    img = pg.eval_on_selector(".mb-cat-card-img",
        "e => { const c=getComputedStyle(e); return {b:c.mixBlendMode,o:c.opacity}; }")
    ck("C4 plate is 3:2", plate["a"].replace(" ", "") == "3/2", plate["a"])
    ck("C4 plate is DARK (screen blend needs it)", plate["bg"] == "rgb(5, 8, 13)", plate["bg"])
    ck("C4 part image screen-blends", img["b"] == "screen", img["b"])
    cols = pg.eval_on_selector(".mb-cat-grid", "e => getComputedStyle(e).gridTemplateColumns")
    ck("5.6 card grid is auto-fit (>1 column at 1280)", len(cols.split()) > 1, cols)

    # --- the mockup's detail ---
    ck("mockup: picker is titled 'Select your vehicle', not 'Filter Active'",
       "select your vehicle" in pg.locator(".mb-ymm-label").first.inner_text().lower(),
       pg.locator(".mb-ymm-label").first.inner_text())
    for sel, label in [
        (".mb-ymm-levels", "5 levels"), (".mb-ymm-engine-code", "engine chip"),
        (".mb-cat-sku-title", "single-SKU claim"), (".mb-cat-window-search", "query bar"),
        (".mb-cat-count-sim", "(Simulation) tag"), (".mb-plat-steps", "process steps"),
    ]:
        ck(f"mockup: {label} present", pg.locator(sel).count() >= 1)
    ck("mockup: four Genuine badges", pg.locator(".mb-cat-genuine").count() == 4,
       pg.locator(".mb-cat-genuine").count())
    unfit = pg.locator(".mb-ucat-card.is-unfit")
    ck("mockup: one card deliberately does NOT fit", unfit.count() == 1)
    ck("mockup: its name is struck through",
       pg.eval_on_selector(".mb-ucat-card.is-unfit .mb-cat-card-name",
                           "e => getComputedStyle(e).textDecorationLine") == "line-through")

    # --- honesty: counts must stay labelled ---
    count_txt = pg.locator(".mb-cat-count").inner_text()
    ck("honesty: illustrative counts carry the Simulation label",
       "Simulation" in count_txt or "Simulasi" in count_txt, count_txt)
    ck("honesty: no price on the band", "Rp " not in pg.locator("#how-it-works").inner_text())

    # --- correction 3: the scan, run for real ---
    pg.select_option(".mb-ymm-picker select >> nth=0", "2023")
    # WAIT for the scanning state rather than sampling at a fixed offset: the
    # overlay fades in over 220ms inside an 1800ms scan, and a single sample at
    # ~320ms races both ends. Sampling made this check pass one run and fail the
    # next with nothing changed.
    pg.wait_for_function(
        """() => { const b=document.querySelector('.mb-cat-window-body');
                   const g=document.querySelector('.mb-cat-grid');
                   return b && b.classList.contains('is-scanning')
                          && parseFloat(getComputedStyle(g).opacity) < 1; }""",
        timeout=1500,
    )
    car = pg.locator(".mb-cat-car-wrapper").first
    cb, wb = car.bounding_box(), pg.locator(".mb-cat-window-body").first.bounding_box()
    ck("C3 scan frame is its natural 280x140",
       abs(cb["width"] - 280) < 2 and abs(cb["height"] - 140) < 2,
       f"{cb['width']:.0f}x{cb['height']:.0f}")
    ck("C3 scan frame is CENTRED, not pinned top-left",
       abs((cb["x"] - wb["x"]) - ((wb["x"] + wb["width"]) - (cb["x"] + cb["width"]))) < 3
       and abs((cb["y"] - wb["y"]) - ((wb["y"] + wb["height"]) - (cb["y"] + cb["height"]))) < 3,
       f"l={cb['x']-wb['x']:.0f} r={(wb['x']+wb['width'])-(cb['x']+cb['width']):.0f}")
    ck("C3 cards dim behind the scan",
       float(pg.eval_on_selector(".mb-cat-grid", "e => getComputedStyle(e).opacity")) < 1)
    ck("C3 scan line is animating",
       pg.eval_on_selector(".mb-cat-scan-line", "e => getComputedStyle(e).animationName")
       == "mb-cat-scan")
    pg.wait_for_function(
        """() => { const b=document.querySelector('.mb-cat-window-body');
                   const g=document.querySelector('.mb-cat-grid');
                   return b && !b.classList.contains('is-scanning')
                          && parseFloat(getComputedStyle(g).opacity) === 1; }""",
        timeout=4000,
    )
    ck("C3 scan clears and the result stands",
       float(pg.eval_on_selector(".mb-cat-grid", "e => getComputedStyle(e).opacity")) == 1.0)
    ck("C3 garage persisted", bool(pg.evaluate("localStorage.getItem('mobeeli_garage')")))

    ck("desktop: no horizontal scroll",
       pg.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
    ck("desktop: no page/console errors", not errs, errs[:2])

    # ---------- reduced motion ----------
    rm = br.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    rp = rm.new_page()
    rp.goto(BASE, wait_until="networkidle")
    ck("reduced-motion: flow packets hidden",
       rp.eval_on_selector(".mb-plat-packet", "e => getComputedStyle(e).display") == "none")
    ck("reduced-motion: hero chip dot does not pulse",
       rp.eval_on_selector(".mb-hero-chip .mb-dot",
                           "e => getComputedStyle(e).animationName") == "none")
    rm.close()

    # ---------- mobile ----------
    mc = br.new_context(viewport={"width": 390, "height": 844})
    mp = mc.new_page()
    merrs = []
    mp.on("pageerror", lambda e: merrs.append(str(e)))
    mp.goto(BASE, wait_until="networkidle")
    mp.evaluate("localStorage.removeItem('mobeeli_garage')")
    mp.reload(wait_until="networkidle")
    mb = lambda sel: mp.locator(sel).first.bounding_box()
    mpk, msk, mwn = mb(".mb-cat-ymm"), mb(".mb-cat-sku"), mb(".mb-cat-window")
    ck("C1 mobile order is picker -> SKU -> window",
       mpk["y"] < msk["y"] < mwn["y"],
       f"picker={mpk['y']:.0f} sku={msk['y']:.0f} window={mwn['y']:.0f}")
    ck("C1 mobile: all three full width",
       abs(mpk["width"] - msk["width"]) < 3 and abs(msk["width"] - mwn["width"]) < 3)
    ck("mobile: flow falls back to the stack",
       mp.eval_on_selector(".mb-plat-stack", "e => getComputedStyle(e).display") != "none"
       and mp.eval_on_selector(".mb-plat-figure", "e => getComputedStyle(e).display") == "none")
    ck("mobile: both stack arrows animate in distinguishable colours",
       mp.evaluate("""() => { const a=[...document.querySelectorAll('.mb-plat-arrow')];
         const c=a.map(e=>getComputedStyle(e,'::after').backgroundColor);
         const n=a.map(e=>getComputedStyle(e,'::after').animationName);
         return a.length===2 && c[0]!==c[1] && n.every(x=>x!=='none'); }"""))
    ck("mobile: no horizontal scroll",
       mp.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
    ck("mobile: no page errors", not merrs, merrs[:2])

    # ---------- Indonesian ----------
    # At 390px the desktop bar is hidden and the language toggle only exists
    # inside the hamburger sheet, so it has to be opened first — clicking the
    # nth(1) toggle blind times out on an invisible element.
    mp.click(".mb-nav-burger")
    mp.wait_for_timeout(250)
    mp.locator("#mb-nav-sheet .mb-lang-btn", has_text="ID").first.click()
    mp.wait_for_timeout(250)
    mp.keyboard.press("Escape")
    mp.wait_for_timeout(200)
    # Case-folded: inner_text() returns RENDERED text and .mb-kicker is
    # text-transform: uppercase, so the kicker reads "CARA KERJA" on screen even
    # though copy.ts holds "Cara kerja".
    band_id = mp.locator("#how-it-works").inner_text().lower()
    ck("ID: band renders Indonesian",
       "cara kerja" in band_id and "satu listing terverifikasi" in band_id,
       band_id[:80])
    ck("ID: counts still labelled",
       "Simulasi" in mp.locator(".mb-cat-count").inner_text(),
       mp.locator(".mb-cat-count").inner_text())
    ck("ID: no node label overflows its box",
       mp.evaluate("""() => [...document.querySelectorAll('.mb-plat-scard')]
            .every(c => c.scrollHeight <= c.clientHeight + 1)"""))

    br.close()

bad = [r for r in R if not r[1]]
print(f"\n{len(R) - len(bad)}/{len(R)} passed")
if bad:
    print("\nFAILURES:")
    for n, _, d in bad:
        print(f"  - {n}  {d}")
sys.exit(1 if bad else 0)
