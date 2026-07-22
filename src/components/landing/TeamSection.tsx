"use client";

import Image from "next/image";

import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

// Real headshots slot into the 1:1 card area (F-013, CHG-piztanza-10); founders
// without a supplied photo keep the design's gradient placeholder.
const FOUNDERS: readonly {
  name: CopyKey;
  role: CopyKey;
  bio: CopyKey;
  photo: string;
  headshot?: string;
  linkedin?: string;
}[] = [
  { name: "team_n1", role: "team_r1", bio: "team_c1", photo: "mb-team-photo--a" },
  {
    name: "team_n2",
    role: "team_r2",
    bio: "team_c2",
    photo: "mb-team-photo--b",
    headshot: "/assets/team/salman.jpg",
    linkedin: "https://www.linkedin.com/in/msalmanalhafizh/",
  },
  {
    name: "team_n3",
    role: "team_r3",
    bio: "team_c3",
    photo: "mb-team-photo--c",
    headshot: "/assets/team/ferdinansyah.jpg",
    linkedin: "https://www.linkedin.com/in/ferdinansyah-h-864134157/",
  },
];

/** Team — 3 founder cards. */
export default function TeamSection() {
  const t = useT();
  return (
    <section id="team" className="mb-section mb-team">
      <div className="mb-section-inner">
        <div data-rev="0" className="mb-kicker">
          {t("team_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2">
          {t("team_h2")}
        </h2>
        <div className="mb-team-grid">
          {FOUNDERS.map((founder, i) => (
            <div key={founder.name} data-rev={i} className="mb-team-card">
              <div
                className={`mb-team-photo ${founder.photo}`}
                {...(founder.headshot ? {} : { "aria-hidden": true })}
              >
                {founder.headshot && (
                  <Image
                    src={founder.headshot}
                    alt={t(founder.name)}
                    fill
                    sizes="(max-width: 700px) 100vw, 420px"
                  />
                )}
              </div>
              <div className="mb-team-body">
                <div className="mb-team-namerow">
                  <div className="mb-team-name">{t(founder.name)}</div>
                  <a
                    href={founder.linkedin ?? "#"}
                    {...(founder.linkedin ? { target: "_blank", rel: "noopener" } : {})}
                    aria-label={`LinkedIn — ${t(founder.name)}`}
                    className="mb-team-li"
                  >
                    in
                  </a>
                </div>
                <div className="mb-team-role">{t(founder.role)}</div>
                <p className="mb-team-bio">{t(founder.bio)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
