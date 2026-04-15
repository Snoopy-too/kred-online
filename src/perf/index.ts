/**
 * Perf module — dev-only observability layer.
 *
 * Public API for the rest of the codebase. All writer functions are no-ops
 * when PERF_ENABLED is false, and Vite tree-shakes them out of production
 * builds because PERF_ENABLED is a literal-evaluable constant.
 *
 * Reader functions (hooks) also short-circuit when disabled.
 */

// Single source of truth for the on/off gate.
// Vite replaces import.meta.env.DEV with `true` in dev and `false` in prod
// at build time, so this becomes a literal `true` or `false` and the tree
// shaker can eliminate the disabled branch.
export const PERF_ENABLED: boolean = import.meta.env.DEV;

// How many samples to keep per metric series (ring buffer cap).
export const MAX_SERIES_SAMPLES = 200;

// ----- Public types -----

export type MetricKind = "gauge" | "counter" | "histogram";

export interface MetricSample {
  /** Wall-clock time the sample was recorded (ms). */
  t: number;
  /** Numeric value, or `undefined` for counter increments. */
  v: number;
  /** Free-form tags for filtering — e.g. { channel: 'broadcast' }. */
  tags?: Record<string, string | number>;
}

export interface MetricSeries {
  name: string;
  kind: MetricKind;
  samples: MetricSample[];
}

// Re-exports — populated as we build out the module
export { PerfStore, perfStore } from "./PerfStore";
// export {
//   recordMetric,
//   incrementCounter,
//   useRenderCount,
//   usePerfSeries,
//   usePerfCounter,
// } from "./hooks";
// export { PerfOverlay } from "./PerfOverlay";
