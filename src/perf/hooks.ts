import { useCallback, useSyncExternalStore } from "react";
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

// Sparse gauge map — used for scalar state-of-the-world values like
// subscriptions.openCount. Distinct from PerfStore series/counters because
// gauges don't need history or pub/sub for the overlay.
const gauges: Record<string, number> = Object.create(null);

export function setGauge(
  name: string,
  updater: number | ((current: number) => number)
): void {
  const current = gauges[name] ?? 0;
  gauges[name] = typeof updater === "function" ? updater(current) : updater;
}

export function readGauge(name: string): number {
  return gauges[name] ?? 0;
}

/**
 * Increment `render.<name>` once per render.
 * Use only on top-level components/providers — leaf usage creates noise.
 */
export function useRenderCount(name: string): void {
  if (PERF_ENABLED) {
    perfStore.increment(`render.${name}`);
  }
}

/**
 * Subscribe to a metric series and re-render when it changes.
 * Returns the current series snapshot.
 */
export function usePerfSeries(name: string) {
  const subscribe = useCallback(
    (cb: () => void) => perfStore.subscribe(name, cb),
    [name]
  );
  const getSnapshot = useCallback(
    () => perfStore.getSeries(name),
    [name]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribe to a counter and re-render when it changes.
 * Returns the current count.
 */
export function usePerfCounter(name: string): number {
  const subscribe = useCallback(
    (cb: () => void) => perfStore.subscribe(name, cb),
    [name]
  );
  const getSnapshot = useCallback(
    () => perfStore.getCounter(name),
    [name]
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
