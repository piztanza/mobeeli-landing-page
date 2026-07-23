"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

import {
  BLOOM_DUR_MS,
  BLOOM_STAGGER_MS,
  createLoopScheduler,
  ENTER_OFFSETS,
  FADE_DUR_MS,
  FADE_STAGGER_MS,
  GLIDE_EASE,
  NAME_CHIP_DELAY_MS,
  ORBIT_GLIDE_DUR_MS,
  ORBIT_GLIDE_STAGGER_MS,
  ORBIT_SPIN_DUR_MS,
  orbitPos,
  orbitRadii,
  POP_DUR_MS,
  POP_EASE,
  buildTimeline,
  transformOf,
  type OrbitGeometry,
} from "./catalogLoop";

// Part sprites in stage positions (slots 0–5).
const SPRITES: readonly {
  name: CopyKey;
  src: string;
  pos: string;
  enter: readonly [number, number, number];
}[] = [
  { name: "scn1", src: "/assets/parts/pad.png", pos: "mb-sprite--pad", enter: ENTER_OFFSETS[0] },
  { name: "scn2", src: "/assets/parts/filter.png", pos: "mb-sprite--filter", enter: ENTER_OFFSETS[1] },
  { name: "scn3", src: "/assets/parts/plug.png", pos: "mb-sprite--plug", enter: ENTER_OFFSETS[2] },
  { name: "scn4", src: "/assets/parts/disc.png", pos: "mb-sprite--disc", enter: ENTER_OFFSETS[3] },
  { name: "scn5", src: "/assets/parts/shock.png", pos: "mb-sprite--shock", enter: ENTER_OFFSETS[4] },
  { name: "scn6", src: "/assets/parts/air.png", pos: "mb-sprite--air", enter: ENTER_OFFSETS[5] },
];

const FILE_CHIPS = [
  { src: "/assets/icons/xls2.png", alt: "Excel file" },
  { src: "/assets/icons/pdf2.png", alt: "PDF file" },
  { src: "/assets/icons/jpg2.png", alt: "Photo file" },
] as const;

/** Design's transition helper: one transform+opacity transition per step. */
function step(
  el: HTMLElement,
  transform: string,
  opacity: string,
  durMs: number,
  delayMs = 0,
  ease: string = GLIDE_EASE,
) {
  el.style.transition = `transform ${durMs}ms ${ease} ${delayMs}ms, opacity ${Math.min(durMs, 600)}ms ease ${delayMs}ms`;
  el.style.transform = transform;
  el.style.opacity = opacity;
}

/**
 * AI catalog showcase (F-005) — dark rounded card running the design's
 * phased ~15s loop: sprites pop in one-by-one with name chips, glide onto a
 * shrinking orbit with self-spin (rAF), bloom back to the grid, snap
 * assemble behind the centered pill, fade down, restart. The loop only runs
 * while the stage is in view; reduced motion (or the `static` prop) renders
 * the assembled state at rest. All copy goes through the live i18n maps so
 * the language toggle updates chips, pill, and AI status mid-loop.
 */
export default function AiCatalogCard({ static: staticMode = false }: { static?: boolean }) {
  const t = useT();
  const reduced = useReducedMotion();
  const animate = !reduced && !staticMode;

  // Assembled is the at-rest truth: SSR, no-JS, reduced motion, and the
  // assemble phase of the live loop all show the "catalog assembled ✓" chip.
  const [assembled, setAssembled] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const spriteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    const pill = pillRef.current;
    const sprites = spriteRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!stage || !pill || sprites.length === 0) return;
    const names = sprites.map((_, i) => nameRefs.current[i] ?? null);
    const count = sprites.length;

    const still = () => {
      for (const [i, sprite] of sprites.entries()) {
        sprite.style.transition = "none";
        sprite.style.transform = "translate(0,0) rotate(0deg)";
        sprite.style.opacity = "1";
        if (names[i]) names[i].style.opacity = "0";
      }
      pill.style.transition = "none";
      pill.style.opacity = "1";
      setAssembled(true);
    };

    if (!animate) {
      still();
      return;
    }

    const timeline = buildTimeline(count);
    const scheduler = createLoopScheduler();
    let running = false;
    let raf = 0;

    const hideAll = () => {
      for (const [i, sprite] of sprites.entries()) {
        sprite.style.transition = "none";
        sprite.style.transform = transformOf(SPRITES[i].enter, 0.55);
        sprite.style.opacity = "0";
        if (names[i]) names[i].style.opacity = "0";
      }
    };

    const cycle = () => {
      setAssembled(false);
      pill.style.transition = "opacity .35s ease";
      pill.style.opacity = "0";
      hideAll();

      // pop-in, one sprite at a time, name chip trailing each
      for (const [i, sprite] of sprites.entries()) {
        scheduler.at(timeline.popStart(i), () => {
          step(sprite, transformOf(SPRITES[i].enter, 1), "1", POP_DUR_MS, 0, POP_EASE);
          const name = names[i];
          if (name) scheduler.at(NAME_CHIP_DELAY_MS, () => (name.style.opacity = "1"));
        });
      }
      scheduler.at(timeline.namesFadeAt, () => {
        for (const name of names) if (name) name.style.opacity = "0";
      });

      // orbit: glide onto the circle, then rAF shrink + self-spin
      let geo: OrbitGeometry | null = null;
      const geoOf = (): OrbitGeometry => ({
        cx: stage.clientWidth / 2,
        cy: stage.clientHeight / 2,
        ...orbitRadii(stage.clientWidth, stage.clientHeight),
        hx: sprites.map((sprite) => sprite.offsetLeft + sprite.offsetWidth / 2),
        hy: sprites.map((sprite) => sprite.offsetTop + sprite.offsetHeight / 2),
      });
      scheduler.at(timeline.orbitGlideAt, () => {
        geo = geoOf();
        for (const [i, sprite] of sprites.entries()) {
          const o = orbitPos(i, count, 0, geo);
          step(
            sprite,
            `translate(${o.x}px,${o.y}px) rotate(0deg)`,
            "1",
            ORBIT_GLIDE_DUR_MS,
            i * ORBIT_GLIDE_STAGGER_MS,
          );
        }
      });
      scheduler.at(timeline.orbitSpinAt, () => {
        const g = geo ?? geoOf();
        const t0 = performance.now();
        const frame = () => {
          const prog = Math.min(1, (performance.now() - t0) / ORBIT_SPIN_DUR_MS);
          for (const [i, sprite] of sprites.entries()) {
            const o = orbitPos(i, count, prog, g);
            sprite.style.transition = "none";
            sprite.style.transform = `translate(${o.x}px,${o.y}px) rotate(${o.spin}deg)`;
          }
          if (prog < 1 && running) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      });

      // bloom back to the grid, then assemble: pill in + AI chip flip
      scheduler.at(timeline.bloomAt, () => {
        for (const [i, sprite] of sprites.entries()) {
          step(sprite, "translate(0,0) rotate(360deg)", "1", BLOOM_DUR_MS, i * BLOOM_STAGGER_MS);
        }
      });
      scheduler.at(timeline.assembleAt, () => {
        pill.style.transition = "opacity .5s ease";
        pill.style.opacity = "1";
        setAssembled(true);
      });

      // fade down and restart
      scheduler.at(timeline.fadeAt, () => {
        for (const [i, sprite] of sprites.entries()) {
          step(sprite, transformOf(SPRITES[i].enter, 0.9), "0", FADE_DUR_MS, i * FADE_STAGGER_MS);
        }
        pill.style.transition = "opacity .35s ease";
        pill.style.opacity = "0";
      });
      scheduler.at(timeline.restartAt, cycle);
    };

    const stop = () => {
      running = false;
      scheduler.clear();
      cancelAnimationFrame(raf);
    };

    hideAll();
    pill.style.transition = "none";
    pill.style.opacity = "0";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !running) {
            running = true;
            cycle();
          } else if (!entry.isIntersecting && running) {
            stop();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      stop();
    };
  }, [animate]);

  return (
    <section className="mb-cat-section">
      <div data-rev="0" className="mb-cat-card">
        <div className="mb-cat-head">
          <div className="mb-file-chips">
            {/* unoptimized: these are 1–2 KB PNGs, so the optimizer saves
                nothing — and serving them verbatim removes the failure mode
                where a dropped optimizer response left the PDF chip blank on
                the live site (CHG-piztanza-18). */}
            {FILE_CHIPS.map((chip) => (
              <div key={chip.src} className="mb-file-chip">
                <Image src={chip.src} alt={chip.alt} width={76} height={96} unoptimized />
              </div>
            ))}
          </div>
          <div className="mb-ai-chip">
            <span className="mb-dot mb-pulse mb-pulse--ai" aria-hidden />
            <span className="mb-ai-chip-text">{t(assembled ? "cat_ai_done" : "cat_ai_read")}</span>
          </div>
        </div>
        <div ref={stageRef} className="mb-cat-stage" aria-hidden>
          {SPRITES.map((sprite, i) => (
            <div
              key={sprite.name}
              ref={(el) => {
                spriteRefs.current[i] = el;
              }}
              className={`mb-sprite ${sprite.pos}`}
            >
              <Image src={sprite.src} alt={t(sprite.name)} width={680} height={680} />
              <span
                ref={(el) => {
                  nameRefs.current[i] = el;
                }}
                className="mb-sprite-name"
              >
                {t(sprite.name)}
              </span>
            </div>
          ))}
          <div ref={pillRef} className="mb-cat-pill">
            {t("cat_pill")}
          </div>
        </div>
        <div className="mb-cat-copy">
          <h2 data-rev="1" className="mb-cat-h2">
            {t("cat_h2")}
          </h2>
          <p data-rev="2" className="mb-cat-p">
            {t("cat_p")}
          </p>
        </div>
      </div>
    </section>
  );
}
