import { useEffect, useState } from "react";
import { PERF_ENABLED, SeriesSample } from "./index";
import { PerfStore } from "./PerfStore";

// Singleton store, lazily initialized
let store: PerfStore | null = null;

function getStore(): PerfStore {
  // Allow test override
  const global = globalThis as any;
  if (global.__kred_perf_store) {
    return global.__kred_perf_store;
  }

  if (!store) {
    store = new PerfStore();
    // Expose for dev inspection
    global.__kred_perf_store = store;
  }
  return store;
}

/**
 * Record a metric sample (series data point).
 * No-op if PERF_ENABLED is false.
 */
export function recordMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  // Allow recordings in tests even if PERF_ENABLED is false
  // (tests can inject a store via __kred_perf_store)
  if (!PERF_ENABLED && !(globalThis as any).__kred_perf_store) return;
  getStore().recordSample(name, value, tags);
}

/**
 * Increment a counter by the specified amount (default 1).
 * No-op if PERF_ENABLED is false.
 */
export function incrementCounter(name: string, by: number = 1): void {
  // Allow increments in tests even if PERF_ENABLED is false
  // (tests can inject a store via __kred_perf_store)
  if (!PERF_ENABLED && !(globalThis as any).__kred_perf_store) return;
  getStore().incrementCounter(name, by);
}

/**
 * Hook: track render count for a component.
 * Increments render.<name> counter on each render.
 */
export function useRenderCount(name: string): void {
  useEffect(() => {
    incrementCounter(`render.${name}`);
  });
}

/**
 * Hook: subscribe to a series metric and re-render on updates.
 * Returns empty array if metric doesn't exist.
 */
export function usePerfSeries(name: string): SeriesSample[] {
  const [samples, setSamples] = useState<SeriesSample[]>(() => {
    if (!PERF_ENABLED) return [];
    const series = getStore().getSeries(name);
    return series?.samples ?? [];
  });

  useEffect(() => {
    if (!PERF_ENABLED) return;

    const store = getStore();
    const initial = store.getSeries(name);
    setSamples(initial?.samples ?? []);

    const unsubscribe = store.subscribe((metric) => {
      if (metric.name === name && metric.type === "series") {
        const updated = store.getSeries(name);
        setSamples(updated?.samples ?? []);
      }
    });

    return unsubscribe;
  }, [name]);

  return samples;
}

/**
 * Hook: subscribe to a counter metric and re-render on updates.
 * Returns 0 if counter doesn't exist.
 */
export function usePerfCounter(name: string): number {
  const [count, setCount] = useState<number>(() => {
    if (!PERF_ENABLED) return 0;
    return getStore().getCounter(name);
  });

  useEffect(() => {
    if (!PERF_ENABLED) return;

    const store = getStore();
    setCount(store.getCounter(name));

    const unsubscribe = store.subscribe((metric) => {
      if (metric.name === name && metric.type === "counter") {
        setCount(store.getCounter(name));
      }
    });

    return unsubscribe;
  }, [name]);

  return count;
}
