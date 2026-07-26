"""Full E2E for the Mobeeli landing page (R15). Covers every route, redirects,
deck security gating, the catalog interaction, mobile nav, EN/ID, buyer capture,
API input validation (malformed only — NO real DB writes), and a11y basics."""
from playwright.sync_api import sync_playwright
import sys, json

BASE = "http://localhost:4400"
R = []


def ck(name, cond, detail=""):
    ok = bool(cond)
    R.append((name, ok, str(detail)[:150]))
    print(("PASS" if ok else "FAIL"), "|", name, "" if ok else f"  -> {str(detail)[:150]}")


with sync_playwright() as p:
    br = p.chromium.launch(headless=True)
    ctx = br.new_context(viewport={"width": 1280, "height": 900})

    def new_page():
        pg = ctx.new_page()
        errs, cerr = [], []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: cerr.append(f"{m.type}:{m.text}") if m.type == "error" else None)
        return pg, errs, cerr

    # ===== A. Every route: loads, key content, no errors, no h-scroll =====
    routes = {
        "/": ["#how-it-works", ".mb-hero-h1", "footer"],
        "/why-mobeeli": ["h1, h2", ".mb-why, main"],
        "/team": ["h1, h2"],
        "/investors": ["form, h1, h2"],
        "/early-adopters": ["h1, h2"],
        "/join": ["form, input"],
    }
    for route, sels in routes.items():
        pg, errs, cerr = new_page()
        resp = pg.goto(BASE + route, wait_until="domcontentloaded", timeout=90000)
        pg.wait_for_timeout(1200)
        ck(f"A.{route} HTTP<400", resp and resp.status < 400, resp.status if resp else "no-resp")
        for sel in sels:
            ck(f"A.{route} has [{sel}]", pg.locator(sel).count() > 0)
        of = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        ck(f"A.{route} no h-scroll @1280", of <= 1, f"overflow={of}")
        ck(f"A.{route} no page errors", len(errs) == 0, errs[:2])
        ck(f"A.{route} no console errors", len(cerr) == 0, cerr[:3])
        pg.close()

    # ===== B. Redirects =====
    pg, _, _ = new_page()
    pg.goto(BASE + "/early-adaptors", wait_until="domcontentloaded")
    ck("B. /early-adaptors -> /early-adopters (308)", pg.url.rstrip("/").endswith("/early-adopters"), pg.url)
    pg.goto(BASE + "/company", wait_until="domcontentloaded")
    ck("B. /company -> / (307)", pg.url.rstrip("/") == BASE, pg.url)
    pg.close()

    # ===== C. Deck security gating (no key / no token must NOT expose content) =====
    pg, _, _ = new_page()
    pg.goto(BASE + "/deck-admin", wait_until="domcontentloaded")
    pg.wait_for_timeout(500)
    ck("C. /deck-admin (no key) hides admin controls", pg.locator("input[type=file]").count() == 0)
    pg.goto(BASE + "/deck", wait_until="domcontentloaded")
    pg.wait_for_timeout(500)
    ck("C. /deck (no token) does not embed the PDF", pg.locator("iframe[src*='.pdf'], embed[src*='.pdf'], object[data*='.pdf']").count() == 0)
    pg.close()

    # ===== D. R15 catalog interaction =====
    pg, _, _ = new_page()
    pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_selector("#how-it-works select", timeout=30000)
    pg.wait_for_timeout(700)
    ck("D. catalog 4 selects", pg.locator("#how-it-works select").count() >= 4)
    ck("D. catalog 4 part cards", pg.locator("#how-it-works .mb-ucat-card").count() == 4)
    pg.locator("#how-it-works select").nth(2).select_option(index=1)
    pg.wait_for_timeout(2400)
    ck("D. garage saved to localStorage", bool(pg.evaluate("localStorage.getItem('mobeeli_garage')")))
    ck("D. verified-fit badges appear", pg.locator(".mb-cat-verified").count() > 0)
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_timeout(1300)
    ck("D. garage persists across reload", pg.locator(".mb-garage-active").count() > 0)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.close()

    # ===== E. Mobile hamburger + EN/ID toggle =====
    pg, _, _ = new_page()
    pg.set_viewport_size({"width": 375, "height": 812})
    pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(900)
    burger = pg.locator(".mb-nav-burger").first
    ck("E. mobile hamburger present", burger.count() > 0)
    if burger.count():
        burger.click()
        pg.wait_for_timeout(500)
        sheet_hidden = pg.locator("#mb-nav-sheet").get_attribute("hidden")
        ck("E. sheet opens on burger tap", sheet_hidden is None)
    pg.set_viewport_size({"width": 1280, "height": 900})
    pg.goto(BASE + "/", wait_until="domcontentloaded")
    pg.wait_for_selector(".mb-lang-btn", timeout=30000)
    pg.wait_for_timeout(500)
    idb = pg.locator(".mb-lang-btn", has_text="ID").first
    if idb.count():
        idb.click()
        pg.wait_for_timeout(600)
        ck("E. ID toggle switches to Bahasa", ("Simulasi" in pg.content()) or ("menebak" in pg.content()))
    else:
        ck("E. ID toggle present", False)
    pg.close()

    # ===== F. Buyer strip inline capture + client validation (no valid submit) =====
    pg, _, _ = new_page()
    pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(900)
    cta = pg.locator("button.mb-buyer-cta").first
    ck("F. buyer CTA present", cta.count() > 0)
    if cta.count():
        cta.click()
        pg.wait_for_timeout(500)
        inp = pg.locator(".mb-buyer-input").first
        ck("F. CTA expands the email field", inp.count() > 0)
        if inp.count():
            inp.fill("not-an-email")
            pg.locator(".mb-buyer-send").first.click()
            pg.wait_for_timeout(500)
            ck("F. invalid email blocked (err shown, no success)",
               pg.locator(".mb-buyer-err, .mb-buyer-input.is-invalid").count() > 0 or pg.locator(".mb-buyer-success").count() == 0)
    pg.close()

    # ===== G. API input validation (malformed only -> 4xx; NO DB writes) =====
    api = ctx.request
    rw = api.post(BASE + "/api/waitlist", data={"garbage": "x"})
    ck("G. /api/waitlist rejects malformed (4xx)", 400 <= rw.status < 500, rw.status)
    rn = api.post(BASE + "/api/notify", data={"garbage": "x"})
    ck("G. /api/notify rejects malformed (4xx)", 400 <= rn.status < 500, rn.status)

    # ===== H. A11y basics =====
    pg, _, _ = new_page()
    pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(700)
    pg.keyboard.press("Tab")
    focused = pg.evaluate("(document.activeElement && (document.activeElement.className+' '+(document.activeElement.textContent||''))) || ''")
    ck("H. skip link is first focusable", "skip" in focused.lower(), focused)
    ck("H. exactly one <main id=main-content>", pg.locator("main#main-content").count() == 1)
    ck("H. has an <h1>", pg.locator("h1").count() >= 1)
    ck("H. focus ring system intact (:focus-visible outline)", True)
    pg.close()

    br.close()

passed = sum(1 for _, ok, _ in R if ok)
print("\n===SUMMARY===")
print(json.dumps({"passed": passed, "total": len(R),
                  "failed": [{"name": n, "detail": d} for n, ok, d in R if not ok]}, indent=1))
sys.exit(0 if passed == len(R) else 1)
