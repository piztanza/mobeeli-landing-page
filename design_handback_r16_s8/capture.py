"""Capture the R16 s8 visual set from LIVE production for the design handback.

Screenshots are slower than the 1800ms pass, so racing a real scan captures
noise. Instead: apply .is-scanning directly (React never re-renders, so the
class sticks), then pause every animation inside the frame and set its
currentTime -- which includes the delay, so one value reproduces the exact
frame at time T.

Frame crops are captured at 2x (detail evidence); band context at 1x. JPEG
throughout -- the vehicle plate is photographic, so PNG costs 10x for nothing.
"""
from playwright.sync_api import sync_playwright
import os, sys

BASE = "https://mobeeli-landing-page.vercel.app"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

PIN = """(t) => {
  const w = document.querySelector('.mb-cat-car-wrapper');
  w.classList.add('is-scanning');
  const a = document.getAnimations().filter(x => x.effect && x.effect.target && w.contains(x.effect.target));
  a.forEach(x => { x.pause(); x.currentTime = t; });
  return a.length;
}"""


def page(p, width, dsf=2, reduced=False, lang_id=False):
    b = p.chromium.launch(headless=True)
    pg = b.new_context(viewport={"width": width, "height": 950},
                       reduced_motion="reduce" if reduced else "no-preference",
                       device_scale_factor=dsf).new_page()
    pg.goto(BASE, wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    pg.evaluate("localStorage.removeItem('mobeeli_garage')")
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_selector("#how-it-works select", timeout=60000)
    if lang_id:
        pg.locator(".mb-lang-btn", has_text="ID").first.click()
        pg.wait_for_timeout(600)
    pg.wait_for_timeout(1100)
    return b, pg


def shot(loc, name, q=90):
    loc.screenshot(path=os.path.join(OUT, name), type="jpeg", quality=q)
    print("wrote", name)


with sync_playwright() as p:
    # --- desktop 1280: the whole pass, frame-level at 2x ---
    b, pg = page(p, 1280)
    frame = pg.locator(".mb-cat-car-wrapper")
    shot(frame, "02-frame-at-rest.jpg")
    for at in (300, 620, 900, 1150, 1400, 1750):
        pg.evaluate(PIN, at)
        shot(frame, f"03-frame-{at:04d}ms.jpg")
    b.close()

    # --- band context at 1x ---
    b, pg = page(p, 1280, dsf=1)
    band = pg.locator("#how-it-works")
    shot(band, "01-band-at-rest-1280.jpg", q=82)
    pg.evaluate(PIN, 1400)
    shot(band, "04-band-scanning-1280.jpg", q=82)
    b.close()

    # --- reduced motion: the finished reading, held at rest ---
    b, pg = page(p, 1280, reduced=True)
    shot(pg.locator(".mb-cat-car-wrapper"), "05-frame-reduced-motion.jpg")
    b.close()

    # --- Bahasa: the bore callout must carry the comma decimal ---
    b, pg = page(p, 1280, lang_id=True)
    pg.evaluate(PIN, 1400)
    shot(pg.locator(".mb-cat-car-wrapper"), "06-frame-1400ms-bahasa.jpg")
    b.close()

    # --- mobile 375: the frame goes full-width, anchors are percentages ---
    b, pg = page(p, 375)
    pg.evaluate(PIN, 1400)
    shot(pg.locator(".mb-cat-car-wrapper"), "07-frame-1400ms-375.jpg")
    b.close()
    b, pg = page(p, 375, dsf=1)
    pg.evaluate(PIN, 1400)
    shot(pg.locator("#how-it-works"), "08-band-scanning-375.jpg", q=82)
    b.close()
