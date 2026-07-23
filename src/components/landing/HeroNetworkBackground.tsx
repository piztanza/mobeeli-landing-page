"use client";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const ACTIVE_PATHS = [
  { d: "M 600 100 C 600 300 200 400 100 700", dur: "5s", delay: "0s", color: "#2f7df6" },
  { d: "M 600 100 C 600 350 400 500 350 750", dur: "4s", delay: "1s", color: "#1b5fd9" },
  { d: "M 600 100 C 700 300 900 400 1100 650", dur: "6s", delay: "0.5s", color: "#2f7df6" },
  { d: "M 600 100 C 500 250 150 200 50 350", dur: "4.5s", delay: "2s", color: "#5b9bf7" },
  { d: "M 600 100 C 800 250 1050 250 1150 400", dur: "5.5s", delay: "1.5s", color: "#1b5fd9" },
  { d: "M 600 100 C 650 300 750 450 850 750", dur: "5s", delay: "2.5s", color: "#2f7df6" },
];

const ANALOG_DEAD_PATHS = [
  "M 600 100 L 400 250 L 300 400 L 100 700",
  "M 600 100 L 800 200 L 950 450 L 1100 650",
  "M 400 250 L 500 450 L 350 750",
  "M 800 200 L 650 450 L 850 750",
];

/**
 * HeroBackground SVG Bezier Network — Ported from platform repo (Authorized Port #1)
 * Recolored to Mobeeli blue system (#2f7df6, #1b5fd9, #5b9bf7), zero framer-motion dependencies.
 */
export default function HeroNetworkBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="mb-network-bg" aria-hidden="true">
      <div className="mb-network-mask">
        <svg
          className="mb-network-svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
        >
          <defs>
            <filter id="mbGlowBlue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faded Legacy Supply Paths */}
          {ANALOG_DEAD_PATHS.map((d, idx) => (
            <path
              key={`dead-${idx}`}
              d={d}
              stroke="#ffffff"
              strokeOpacity="0.04"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Active Direct Routing Bezier Paths */}
          {ACTIVE_PATHS.map((path, idx) => (
            <g key={`active-${idx}`}>
              <path
                d={path.d}
                stroke={path.color}
                strokeOpacity="0.18"
                strokeWidth="1.5"
              />
              <path
                d={path.d}
                stroke={path.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="80 400"
                filter="url(#mbGlowBlue)"
                className={reduced ? "mb-packet-static" : "mb-packet-anim"}
                style={{
                  animationDuration: path.dur,
                  animationDelay: path.delay,
                }}
              />
            </g>
          ))}

          {/* Central Hub Core */}
          <circle cx="600" cy="100" r="32" fill="none" stroke="#2f7df6" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="600" cy="100" r="48" fill="none" stroke="#1b5fd9" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="600" cy="100" r="8" fill="#5b9bf7" />
        </svg>
      </div>
    </div>
  );
}
