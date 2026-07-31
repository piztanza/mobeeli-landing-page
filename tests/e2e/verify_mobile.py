"""E2E for the mobile hyper-pass (2026-07-30).

Covers the widths verify_r25's 390x844 block does NOT: 360x800 (small
Android) and 768x1024 (tablet), plus the 900-wide /join probe for the
880-1039 hamburger zone. Touch contexts (has_touch + is_mobile) so
@media (pointer: coarse) is live — the 44px floor is invisible to a
default desktop context.

Runs against a server on BASE (default local port 4400).
"""

from playwright.sync_api import sync_playwright
import sys, os

BASE = os.environ.get("BASE", "http://localhost:4400")
R = []


def ck(name, cond, detail=""):
    ok = bool(cond)
    R.append((name, ok, str(detail)[:180]))
    print(("PASS" if ok else "FAIL"), "|", name, "" if ok else f"  -> {str(detail)[:180]}")


FREEZE = (
    "*{transition:none!important;animation-duration:1ms!important}"
    " [data-rev]{opacity:1!important;transform:none!important}"
)

with sync_playwright() as p:
    br = p.chromium.launch(headless=True)

    for W, H, label in [(360, 800, "360"), (768, 1024, "768")]:
        ctx = br.new_context(viewport={"width": W, "height": H}, has_touch=True, is_mobile=True)
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(BASE, wait_until="networkidle")
        pg.add_style_tag(content=FREEZE)
        pg.wait_for_timeout(600)

        ck(f"{label}: no horizontal overflow",
           pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0)

        # Anchor landing: the 84px offset is retired — targets land flush (<=2px).
        top = pg.evaluate("""async () => {
          location.hash = '#problem';
          await new Promise(r => setTimeout(r, 800));
          return Math.abs(document.getElementById('problem').getBoundingClientRect().top);
        }""")
        ck(f"{label}: #problem lands flush (<=2px, was 84px low)", top <= 2, f"top={top}")

        # Touch floor: coarse pointer is live in this context.
        ck(f"{label}: context reports pointer:coarse",
           pg.evaluate("matchMedia('(pointer: coarse)').matches"))
        sel = pg.locator(".mb-ymm-select").first.bounding_box()
        ck(f"{label}: picker select >=44px tall", sel and sel["height"] >= 44,
           f"h={sel and sel['height']}")
        vin = pg.locator(".mb-vin-btn").first.bounding_box()
        ck(f"{label}: VIN button >=44px tall", vin and vin["height"] >= 44,
           f"h={vin and vin['height']}")
        ck(f"{label}: picker inputs are no-zoom (16px)",
           pg.eval_on_selector(".mb-ymm-select", "e => getComputedStyle(e).fontSize") == "16px")

        # Nav sheet: hamburger opens the sheet; sheet closes on link tap.
        burger = pg.locator(".mb-nav-burger")
        if burger.count() and burger.first.is_visible():
            burger.first.click()
            pg.wait_for_timeout(400)
            sheet = pg.locator(".mb-nav-sheet")
            ck(f"{label}: burger opens the nav sheet", sheet.first.is_visible())
            svh = pg.eval_on_selector(
                ".mb-nav-sheet", "e => getComputedStyle(e).maxHeight")
            ck(f"{label}: sheet max-height resolves (svh pair applied)",
               svh not in ("none", ""), svh)
            pg.keyboard.press("Escape")
            pg.wait_for_timeout(300)
        else:
            ck(f"{label}: burger visible at this width", False, "no .mb-nav-burger")

        ck(f"{label}: no page errors", not errs, "; ".join(errs[:3]))
        ctx.close()

    # ---------- /join skip link vs the ONE sticky bar on the site ----------
    # Regression guard (2026-07-31): the mobile pass retired the global 84px
    # #main-content offset because the LANDING nav is position:absolute — but
    # /join wraps <Nav /> in .mb-join-mobilenav { position: sticky } below
    # 880px, so the skip target landed 67px behind that bar. Only viewports
    # able to scroll main to the top expose it, which is why 390x844 alone
    # missed it: these are the ones that actually reproduced.
    for W, H in [(320, 568), (740, 360), (844, 390), (879, 500)]:
        ctx = br.new_context(viewport={"width": W, "height": H})
        pg = ctx.new_page()
        pg.goto(BASE + "/join", wait_until="networkidle")
        pg.wait_for_timeout(700)
        pg.keyboard.press("Tab")     # skip link is the first focusable
        pg.wait_for_timeout(200)
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(800)
        d = pg.evaluate("""() => {
          const bar = document.querySelector('.mb-join-mobilenav');
          const main = document.getElementById('main-content');
          const cs = bar ? getComputedStyle(bar) : null;
          const br = bar ? bar.getBoundingClientRect() : null;
          const shown = !!(br && br.height > 0 && cs.display !== 'none');
          return {covered: shown ? Math.round(br.bottom - main.getBoundingClientRect().top) : 0,
                  focused: document.activeElement === main};
        }""")
        ck(f"join@{W}x{H}: skip target clears the sticky bar",
           d["covered"] <= 0, f"covered={d['covered']}px")
        ck(f"join@{W}x{H}: skip link moves focus to <main>", d["focused"])
        ctx.close()

    # ---------- /join at 900 wide: the 880-1039 hamburger zone ----------
    ctx = br.new_context(viewport={"width": 900, "height": 800})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/join", wait_until="networkidle")
    pg.add_style_tag(content=FREEZE)
    pg.wait_for_timeout(600)
    ck("join@900: no horizontal overflow",
       pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") == 0)
    # Step 1 is the type chooser — .mb-jw-input only exists from step 2 on.
    ck("join@900: wizard renders", pg.locator(".mb-jw-step").count() >= 1)
    ck("join@900: no page errors", not errs, "; ".join(errs[:3]))
    ctx.close()

    br.close()

failed = [n for n, ok, _ in R if not ok]
print(f"\n{len(R) - len(failed)}/{len(R)} passed")
if failed:
    sys.exit(1)
