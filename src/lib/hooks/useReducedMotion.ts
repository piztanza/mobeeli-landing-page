"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// Server snapshot: assume motion is allowed; the client corrects on hydration.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Centralized prefers-reduced-motion hook — ALL animated components
 * (rotator, wizard, 3D scenes, scroll reveal) must gate motion on this.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
