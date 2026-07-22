"use client";

import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

const STATS: readonly { value: CopyKey; label: CopyKey; accent?: boolean }[] = [
  { value: "pf1_v", label: "pf1_l" },
  { value: "pf2_v", label: "pf2_l", accent: true },
  { value: "pf3_v", label: "pf3_l" },
  { value: "pf4_v", label: "pf4_l" },
];

/** Proof bar — 4 stats under the hero. */
export default function ProofBar() {
  const t = useT();
  return (
    <section className="mb-proof">
      <div className="mb-proof-inner">
        <div className="mb-proof-grid">
          {STATS.map((stat, i) => (
            <div key={stat.value} data-rev={i} className="mb-proof-cell">
              <div className={`mb-proof-v${stat.accent ? " is-accent" : ""}`}>{t(stat.value)}</div>
              <div className="mb-proof-l">{t(stat.label)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
