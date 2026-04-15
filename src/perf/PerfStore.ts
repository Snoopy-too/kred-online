import { MAX_SERIES_SAMPLES, type MetricSample, type MetricSeries } from "./index";

type Subscriber = () => void;

/**
 * In-memory pub/sub store for performance metrics.
 *
 * - Series: timestamped numeric samples, capped to MAX_SERIES_SAMPLES (FIFO).
 * - Counters: monotonically increasing integers.
 *
 * Lifetime: process-lifetime (a.k.a. tab-lifetime). No persistence.
 * Thread safety: single-threaded JS, no locks needed.
 */
export class PerfStore {
  private series = new Map<string, MetricSample[]>();
  private counters = new Map<string, number>();
  private subscribers = new Map<string, Set<Subscriber>>();
  private seriesCache = new Map<string, MetricSeries>();

  /** Append a numeric sample to a series. */
  record(name: string, v: number, tags?: Record<string, string | number>): void {
    let samples = this.series.get(name);
    if (!samples) {
      samples = [];
      this.series.set(name, samples);
    }
    samples.push({ t: Date.now(), v, tags });
    if (samples.length > MAX_SERIES_SAMPLES) {
      samples.splice(0, samples.length - MAX_SERIES_SAMPLES);
    }
    this.notify(name);
  }

  /** Increment a counter. */
  increment(name: string, by = 1): void {
    const current = this.counters.get(name) ?? 0;
    this.counters.set(name, current + by);
    this.notify(name);
  }

  /** Read a series. Returns an empty series for unknown names. */
  getSeries(name: string): MetricSeries {
    const samples = this.series.get(name) ?? [];
    const cached = this.seriesCache.get(name);
    // Return cached if samples array reference hasn't changed
    if (cached && cached.samples === samples) {
      return cached;
    }
    const result = {
      name,
      kind: "histogram" as const,
      samples,
    };
    this.seriesCache.set(name, result);
    return result;
  }

  /** Read a counter. Returns 0 for unknown names. */
  getCounter(name: string): number {
    return this.counters.get(name) ?? 0;
  }

  /** All series names currently in the store. */
  listSeriesNames(): string[] {
    return Array.from(this.series.keys()).sort();
  }

  /** All counter names currently in the store. */
  listCounterNames(): string[] {
    return Array.from(this.counters.keys()).sort();
  }

  /** Subscribe to changes on a single metric. Returns an unsubscribe fn. */
  subscribe(name: string, cb: Subscriber): () => void {
    let set = this.subscribers.get(name);
    if (!set) {
      set = new Set();
      this.subscribers.set(name, set);
    }
    set.add(cb);
    return () => {
      set!.delete(cb);
    };
  }

  /** Reset everything — useful in tests. */
  clear(): void {
    this.series.clear();
    this.counters.clear();
    this.seriesCache.clear();
    // Notify everyone so listeners can refresh
    for (const set of this.subscribers.values()) for (const cb of set) cb();
  }

  /** Snapshot for `window.__kred_perf.dump()`. */
  dump(): { series: Record<string, MetricSample[]>; counters: Record<string, number> } {
    const series: Record<string, MetricSample[]> = {};
    for (const [k, v] of this.series) series[k] = [...v];
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters) counters[k] = v;
    return { series, counters };
  }

  private notify(name: string): void {
    const set = this.subscribers.get(name);
    if (!set) return;
    for (const cb of set) cb();
  }
}

/** Module-level singleton. Almost everyone uses this directly. */
export const perfStore = new PerfStore();
