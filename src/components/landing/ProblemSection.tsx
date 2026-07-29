"use client";

import Image from "next/image";
import Link from "next/link";

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
 * The 3 pain-stat tiles stayed on /why-mobeeli (redesign phase 3); the
 * "numbers behind this" link points there.
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
              <Link href="/why-mobeeli" className="mb-prob-link">
                {t("prob_link")}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="mb-prob-media" data-rev="2">
            <div className="mb-prob-imgwrap">
              <div className="mb-prob-imgcard">
                <Image
                  className="mb-prob-img"
                  src="/assets/exploded-car.png"
                  alt={t("prob_img_alt")}
                  width={1085}
                  height={1132}
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

            <figure className="mb-prob-quote">
              <div className="mb-prob-qmark" aria-hidden>
                {"“"}
              </div>
              <blockquote className="mb-prob-qmain">{t("quote_main")}</blockquote>
              <div className="mb-prob-qen">{t("quote_en")}</div>
              <figcaption className="mb-prob-qby">{t("quote_by")}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
