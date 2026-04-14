import { Series, SeriesSample, Counter, PerfMetricListener } from "./index";

const MAX_SERIES_SAMPLES = 256;

interface StoredSeries {
  samples: SeriesSample[];
}

interface StoredCounter {
  count: number;
}

/**
 * In-memory pub/sub store for performance metrics.
 * Ring buffers cap series at MAX_SERIES_SAMPLES.
 * Monotonic counters track discrete counts.
 */
export class PerfStore {
  private series: Map<string, StoredSeries> = new Map();
  private counters: Map<string, StoredCounter> = new Map();
  private listeners: Set<PerfMetricListener> = new Set();

  /**
   * Record a sample for a series metric.
   * Oldest samples are dropped when cap is reached.
   */
  recordSample(name: string, value: number, tags?: Record<string, string>) {
    if (!this.series.has(name)) {
      this.series.set(name, { samples: [] });
    }

    const stored = this.series.get(name)!;
    stored.samples.push({
      value,
      timestamp: Date.now(),
    });

    // Trim to MAX_SERIES_SAMPLES, keeping newest
    if (stored.samples.length > MAX_SERIES_SAMPLES) {
      stored.samples = stored.samples.slice(-MAX_SERIES_SAMPLES);
    }

    this.notify({ name, type: "series" });
  }

  /**
   * Increment a counter by the specified amount (default 1).
   */
  incrementCounter(name: string, by: number = 1) {
    if (!this.counters.has(name)) {
      this.counters.set(name, { count: 0 });
    }

    const stored = this.counters.get(name)!;
    stored.count += by;

    this.notify({ name, type: "counter" });
  }

  /**
   * Get a series by name, or undefined if not found.
   */
  getSeries(name: string): Series | undefined {
    const stored = this.series.get(name);
    if (!stored) return undefined;
    return {
      name,
      samples: stored.samples,
    };
  }

  /**
   * Get a counter value, or 0 if not found.
   */
  getCounter(name: string): number {
    return this.counters.get(name)?.count ?? 0;
  }

  /**
   * List all series names.
   */
  listSeriesNames(): string[] {
    return Array.from(this.series.keys());
  }

  /**
   * List all counter names.
   */
  listCounterNames(): string[] {
    return Array.from(this.counters.keys());
  }

  /**
   * Subscribe to all metric changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: PerfMetricListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Export all metrics for inspection or persistence.
   */
  dump() {
    const series: Series[] = Array.from(this.series.entries()).map(
      ([name, stored]) => ({
        name,
        samples: stored.samples,
      })
    );

    const counters: Counter[] = Array.from(this.counters.entries()).map(
      ([name, stored]) => ({
        name,
        count: stored.count,
      })
    );

    return { series, counters };
  }

  /**
   * Clear all metrics and counters.
   */
  clear() {
    this.series.clear();
    this.counters.clear();
  }

  // Private notification dispatch
  private notify(metric: { name: string; type: "series" | "counter" }) {
    for (const listener of this.listeners) {
      listener(metric);
    }
  }
}
