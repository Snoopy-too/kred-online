/**
 * Perf module — shared constants.
 *
 * This file must NOT import from any other file in the perf/ directory.
 * It exists solely to break the circular-import chain:
 *   index.ts → hooks.ts → index.ts  (was TDZ in production builds)
 *   index.ts → PerfStore.ts → index.ts  (same)
 *
 * Both hooks.ts and PerfStore.ts import from HERE; index.ts re-exports
 * from here for backward-compat with the rest of the codebase.
 */

/**
 * Single source of truth for the on/off gate.
 * Vite replaces import.meta.env.DEV with `true` in dev and `false` in prod
 * at build time, so this becomes a literal and the tree-shaker can eliminate
 * the disabled branch.
 */
export const PERF_ENABLED: boolean = import.meta.env.DEV;

/** How many samples to keep per metric series (ring buffer cap). */
export const MAX_SERIES_SAMPLES = 200;

// ----- Public types (duplicated here so hooks.ts / PerfStore.ts don't need index) -----

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
