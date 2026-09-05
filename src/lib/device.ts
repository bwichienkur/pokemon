"use client";

/**
 * Client-only media query helper. It intentionally returns `false` during SSR
 * so callers can render a stable first pass and enhance after hydration.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Avoid spending GPU budget on reflections and high DPR canvases when a device
 * is touch-first, has a coarse pointer, or reports constrained resources.
 */
export function shouldSimplify3D(): boolean {
  if (typeof window === "undefined") return true;

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = "deviceMemory" in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number" &&
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;
  const fewCores = typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;

  return coarsePointer || lowMemory || fewCores;
}
