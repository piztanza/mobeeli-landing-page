/**
 * The one aurora intensity every mount uses (R16, design decision 2).
 *
 * The bands used to differ — hero 0.4, fitment 0.3, catalog 0.28. With the
 * catalog demo unmounted, the two survivors sat 8% apart in adjacent dark
 * bands, which reads as an accident rather than a decision.
 *
 * WHY THIS IS ITS OWN MODULE and not an export of `AmbientAurora.tsx`:
 * every consumer loads that component via `dynamic(..., { ssr: false })` so the
 * three.js island stays out of the main bundle. A static `import { … } from
 * "./AmbientAurora"` just to read a number would pull the component module —
 * including several KB of GLSL shader source — straight back into the initial
 * chunk. A standalone constant costs nothing.
 *
 * Pass this rather than a literal; a contract test asserts no numeric literal is
 * ever handed to `intensity`.
 */
export const AURORA_INTENSITY = 0.35;
