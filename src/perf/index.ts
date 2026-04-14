// Dev-only observability layer for Kred multiplayer performance analysis
// All calls are tree-shaken away in production (PERF_ENABLED = false)

export const PERF_ENABLED = import.meta.env.DEV;

// ============================================================================
// Type Definitions
// ============================================================================

/** Single time-series data point */
export interface MetricSample {
  value: number;
  timestamp: number;
  tags?: Record<string, string | number>;
}

/** Time series metric: ring buffer of samples + metadata */
export interface TimeSeries {
  name: string;
  samples: MetricSample[];
  average: number;
  lastValue: number;
}

/** Counter metric: monotonic integer */
export interface Counter {
  name: string;
  value: number;
}

/** Subscription callback for metric updates */
export type MetricSubscriber = (series: TimeSeries | Counter) => void;

/** Perf store interface for pub/sub + metrics */
export interface IPerfStore {
  recordMetric(name: string, value: number, tags?: Record<string, string | number>): void;
  incrementCounter(name: string, by?: number): void;
  getSeries(name: string): TimeSeries | null;
  getCounter(name: string): Counter | null;
  listSeriesNames(): string[];
  listCounterNames(): string[];
  subscribe(callback: MetricSubscriber): () => void;
  dump(): { series: Record<string, TimeSeries>; counters: Record<string, Counter> };
  clear(): void;
}

// ============================================================================
// Re-exports (uncommented as modules come online)
// ============================================================================

// export { PerfStore } from "./PerfStore";
// export { recordMetric, incrementCounter, useRenderCount, usePerfSeries, usePerfCounter } from "./hooks";
// export { PerfOverlay } from "./PerfOverlay";
