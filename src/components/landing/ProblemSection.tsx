"use client";

import Image from "next/image";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * R28 (CD handoff 2026-07-29): the problem band rebuilt as three explicit
 * depth planes — z0 ghost "217" numeral, z1 the exploded-car evidence card on
 * a blueprint dot grid, z2 the dark Senen-market quote card overlapping the
 * image's right edge plus a stat chip overhanging its bottom-left corner.
 *
 * Engineering principle from the brief (a real bug in their prototyping):
 * the image/quote overlap is GRID-TRACK SHARING, not absolute positioning —
 * image spans cols 1–9, quote spans 8–13 of one explicit 12-col row, so the
 * row sizes to the tallest child and the planes cannot collide at any
 * content length. Only the chip and the ghost numeral are absolute
 * (decorative; both hidden ≤979px). The chip is a SIBLING of the
 * overflow-hidden card — inside it, the -20px overhang gets clipped.
 *
 * FOUNDER 2026-07-30: /why-mobeeli and the "numbers behind this" link are
 * GONE — numbers and figures live in the pitch deck, never on the site.
 */
export default function ProblemSection() {
  const t = useT();

  return (
    <section id="problem" className="mb-prob">
      <div className="mb-prob-container">
        <div className="mb-prob-wrap">
          <div className="mb-prob-ghost" aria-hidden>
            217
          </div>

          <div className="mb-prob-head">
            <div data-rev="0">
              <div className="mb-prob-eyebrow">{t("prob_kicker")}</div>
              <h2 className="mb-prob-h2">{t("prob_h2")}</h2>
            </div>
            <div className="mb-prob-copy" data-rev="1">
              <p className="mb-prob-lede">{t("prob_lede")}</p>
              {/* FOUNDER 2026-07-30: "The numbers behind this" link REMOVED
                  with the whole /why-mobeeli page — figures belong to the
                  pitch deck, not the site. prob_link stays defined, dormant. */}
            </div>
          </div>

          <div className="mb-prob-media" data-rev="2">
            <div className="mb-prob-imgwrap">
              <div className="mb-prob-imgcard">
                {/* Founder 2026-07-29 15:32: the richer landscape teardown
                    replaces CD's near-square render (2816×1536 source,
                    re-encoded to 2000×1091 JPEG, 281KB — the white ground is
                    flattened and multiply-blended away in CSS so the
                    blueprint dot grid reads through it). */}
                <Image
                  className="mb-prob-img"
                  src="/assets/exploded-car.jpg"
                  alt={t("prob_img_alt")}
                  width={2000}
                  height={1091}
                />
                <span className="mb-prob-badge">
                  <i className="mb-prob-badge-dot" aria-hidden />
                  {t("prob_badge")}
                </span>
              </div>
              <div className="mb-prob-chip">
                <span className="mb-prob-chip-fig">
                  {t("prob_chip_n")}
                  <em>{t("prob_chip_of")}</em>
                </span>
                <span className="mb-prob-chip-div" aria-hidden />
                <span className="mb-prob-chip-cap">{t("prob_chip_cap")}</span>
              </div>
            </div>

            {/* FOUNDER 2026-07-29: the Senen testimony left this card — a
                seller-grievance story inside a buyer-pain band, adversarial
                toward unnamed platforms, and unverifiable to a reader. The
                callout is now Mobeeli-voice MECHANISM, keeping the one thing
                the testimony carried that nothing else on the page says:
                Indonesia's parts trade runs on COD, so a wrong part comes
                back refused and unpaid. An <aside>, not a <figure> — it is
                no longer a quotation, and the 44px mark is now the 2× that
                anchors "ships twice" (decorative, like the ghost 217). */}
            <aside className="mb-prob-quote">
              <div className="mb-prob-qmark" aria-hidden>
                2×
              </div>
              <p className="mb-prob-qmain">{t("prob_call_h")}</p>
              <div className="mb-prob-qen">{t("prob_call_p")}</div>
              <div className="mb-prob-qby">{t("prob_call_tag")}</div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
