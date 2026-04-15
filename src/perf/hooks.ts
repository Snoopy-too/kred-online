import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PERF_ENABLED } from "./index";
import { perfStore } from "./PerfStore";

/**
 * Record a numeric sample. No-op when PERF_ENABLED is false.
 *
 * IMPORTANT: keep this function tiny and side-effect-free in the disabled
 * branch — Vite tree-shakes it away when PERF_ENABLED is the literal `false`.
 */
export function recordMetric(
  name: string,
  v: number,
  tags?: Record<string, string | number>
): void {
  if (!PERF_ENABLED) return;
  perfStore.record(name, v, tags);
}

/** Increment a counter. No-op when PERF_ENABLED is false. */
export function incrementCounter(name: string, by = 1): void {
  if (!PERF_ENABLED) return;
  perfStore.increment(name, by);
}

/**
 * Increment `render.<name>` once per render.
 * Use only on top-level components/providers — leaf usage creates noise.
 */
export function useRenderCount(name: string): void {
  const ref = useRef<string>(name);
  ref.current = name;
  // Run on every render — intentional. Cheap.
  if (PERF_ENABLED) {
    perfStore.increment(`render.${name}`);
  }
}

/**
 * Subscribe to a metric series and re-render when it changes.
 * Returns the current series snapshot.
 */
export function usePerfSeries(name: string) {
  const cacheRef = useRef<any>(null);

  const subscribe = useCallback((cb: () => void) => perfStore.subscribe(name, cb), [name]);
  const getSnapshot = useCallback(() => {
    const series = perfStore.getSeries(name);
    // Return same object reference if contents haven't changed
    if (cacheRef.current && cacheRef.current.samples === series.samples) {
      return cacheRef.current;
    }
    cacheRef.current = series;
    return series;
  }, [name]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribe to a counter and re-render when it changes.
 * Returns the current count.
 */
export function usePerfCounter(name: string): number {
  const subscribe = useCallback((cb: () => void) => perfStore.subscribe(name, cb), [name]);
  const getSnapshot = useCallback(() => perfStore.getCounter(name), [name]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
