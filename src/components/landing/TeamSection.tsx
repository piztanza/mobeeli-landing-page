"use client";

import Image from "next/image";

import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * R29 "Ledger stack" (CD handoff 2026-07-29, founder-picked option 2a):
 * three alternating photo/text rows over ghost numerals, monochrome
 * portraits that colour on hover, role kickers composed as
 * "CEO & Founder · sets the vision", and the stamped traction line as a
 * closing quote strip. Replaces the 3-card grid; the old .mb-team-* CSS
 * stays until confirmed unused elsewhere.
 *
 * objPos values are the brief's §2 — tuned so the three faces sit at
 * matched height across the plates. Re-check if any photo is re-cropped.
 */
const FOUNDERS: readonly {
  name: CopyKey;
  role: CopyKey;
  own: CopyKey;
  bio: CopyKey;
  headshot: string;
  objPos: string;
  /** null = FOUNDER RULING 2026-07-29 (R29 §0.4): the CEO's badge renders
   * INERT — his LinkedIn profile is currently broken, and a dead href="#"
   * violates the R6 audit. A <span aria-hidden> with the same hover fill,
   * by explicit founder direction, consciously overriding R6's dead-link
   * rule. TODO: swap in the real <a> when his profile is fixed. */
  linkedin: string | null;
}[] = [
  {
    name: "team_n1",
    role: "team_r1",
    own: "team_own1",
    bio: "team_c1",
    headshot: "/assets/team/matheau.jpg",
    objPos: "50% 26%",
    linkedin: null,
  },
  {
    name: "team_n2",
    role: "team_r2",
    own: "team_own2",
    bio: "team_c2",
    headshot: "/assets/team/salman.jpg",
    objPos: "50% 24%",
    linkedin: "https://www.linkedin.com/in/msalmanalhafizh/",
  },
  {
    name: "team_n3",
    role: "team_r3",
    own: "team_own3",
    bio: "team_c3",
    headshot: "/assets/team/ferdinansyah.jpg",
    objPos: "50% 18%",
    linkedin: "https://www.linkedin.com/in/ferdinansyah-h-864134157/",
  },
];

export default function TeamSection() {
  const t = useT();
  return (
    <section id="team" className="mb-team2">
      <div className="mb-team2-container">
        <div className="mb-team2-head">
          <div data-rev="0">
            <div className="mb-team2-kicker">{t("team_kicker")}</div>
            <h2 className="mb-team2-h2">{t("team_h2")}</h2>
          </div>
          <p className="mb-team2-lede" data-rev="1">
            {t("team_lede")}
          </p>
        </div>

        <div className="mb-team2-rows">
          {FOUNDERS.map((f, i) => (
            <article
              key={f.name}
              className={`mb-team2-row${i === 1 ? " mb-team2-row--flip" : ""}`}
              data-rev={i}
            >
              <div className="mb-team2-plate">
                <Image
                  src={f.headshot}
                  alt={`${t(f.name)} — ${t(f.role)}`}
                  fill
                  sizes="(max-width: 980px) 100vw, 440px"
                  style={{ objectPosition: f.objPos }}
                />
              </div>
              <div className="mb-team2-body">
                <span className="mb-team2-ghost" aria-hidden>
                  {`0${i + 1}`}
                </span>
                <div className="mb-team2-kickrow">
                  <span className="mb-team2-role">
                    {t(f.role)} · {t(f.own)}
                  </span>
                  {f.linkedin ? (
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener"
                      aria-label={`LinkedIn — ${t(f.name)}`}
                      className="mb-team2-li"
                    >
                      in
                    </a>
                  ) : (
                    <span className="mb-team2-li" aria-hidden="true">
                      in
                    </span>
                  )}
                </div>
                <h3 className="mb-team2-name">{t(f.name)}</h3>
                <p className="mb-team2-bio">{t(f.bio)}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mb-team2-quote" data-rev="3">
          <p className="mb-team2-quote-t">{t("team_quote")}</p>
          <span className="mb-team2-quote-by">{t("team_quote_by")}</span>
        </div>
      </div>
    </section>
  );
}
