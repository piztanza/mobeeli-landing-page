# CONSTRAINTS

Design-system rules that are load-bearing — each one is here because breaking it
already cost a round. `CLAUDE.md` holds the operational rules (database, deploy,
brand copy); this file holds the ones you would only discover by measuring.

Every entry states the measurement or the failure, not just the rule, so a future
change can overturn it deliberately rather than by accident.

## Colour and contrast

- White text on `--mb-primary` (#2f7df6) is **3.90:1** and FAILS WCAG AA. Filled
  buttons use `--mb-primary-cta` (`--mb-deep-blue`, **5.70:1**). Do not revert.
  `--mb-primary` remains correct for borders, glows, ribbon fills and text on
  dark, where the ratio is not a text-contrast question.
  Pinned by `tests/cta-contrast.test.ts`.
- `--mb-muted` (#636e7e) on `--mb-tint` (#e4edfd) is **4.39:1** and FAILS AA. On
  tinted panels use `#556074` (**5.38:1**). `--mb-muted` passes on white.
- Text over translucency must be measured against the **composited** backdrop,
  not the band's base colour. `.mb-plat-hub` shipped at 3.7:1 because ribbons
  pass under the glass core in `screen` blend and a specular sweep crosses it; a
  `text-shadow` aids legibility but does not change a contrast ratio. Use a
  scrim, as `.mb-uni-head` and `.mb-uni-drag` do over the bright map.

## CSS

- **Never hand-write `-webkit-backdrop-filter`.** lightningcss collapses the pair
  and emits only the `-webkit-` form, which Chromium ignores — the blur then
  silently never renders. Declare the standard property alone and let the build
  prefix it. This is why the R13 glass never applied for two rounds.
- **Sibling-combinator rules are order-dependent and invisible to text-reading
  tests.** The dark-seam rule (`+ .mb-`) stopped matching when R20 inserted a
  band between the two it joined, and the guarding test kept passing because it
  reads the stylesheet text rather than the render. Any change that inserts or
  reorders bands must re-check every `+ .mb-` selector.
- Glass has exactly one recipe: `.mb-glass`. R16 §6 consolidated four of them
  into it. Do not add a fifth under a new name.

## Assets and images

- State `next/image` intrinsic dimensions **from the file**, not from the display
  size — they set the aspect ratio, so a wrong pair silently distorts the art.
  R20 shipped four wrong pairs; the Mobeeli mark painted 30% wide on every phone.
- The file chips (`/assets/icons/{xls2,pdf2,jpg2}.png`) keep `unoptimized`. A
  dropped optimizer response once left the PDF chip blank on the live site
  (CHG-piztanza-18).
- Fonts are self-hosted (Plus Jakarta Sans, `public/fonts`). Never add a CDN font
  call.

## Modules

- **Never let two modules in one directory differ only by case.** This repo is
  developed on a case-insensitive filesystem: `platformFlow.ts` alongside
  `PlatformFlow.tsx` made `import "./PlatformFlow"` resolve to the `.ts`, so the
  component's default export came back `undefined` and every page test failed.
  The geometry module is named `platformFlowGeometry.ts` for this reason.

## Measurement

- A breakpoint is a measurement, not a guess. The platform-flow cutover is
  **1023.98px** because below roughly 1024 the node boxes (percentages of a
  scaling viewBox) shrink past the labels (`clamp()` with 13px/11px floors).
