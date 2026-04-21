/**
 * Perf module — dev-only observability layer.
 *
 * Public API for the rest of the codebase. All writer functions are no-ops
 * when PERF_ENABLED is false, and Vite tree-shakes them out of production
 * builds because PERF_ENABLED is a literal-evaluable constant.
 *
 * Reader functions (hooks) also short-circuit when disabled.
 *
 * IMPORTANT — circular-import safety:
 *   Shared constants and types live in ./constants.ts.
 *   ./hooks.ts and ./PerfStore.ts import from ./constants (NOT from here).
 *   This file only re-exports outward so callers have a single entry point.
 */

// Re-export constants and types from the leaf module (no circular path).
export {
  PERF_ENABLED,
  MAX_SERIES_SAMPLES,
  type MetricKind,
  type MetricSample,
  type MetricSeries,
} from "./constants";

// Re-exports — populated as we build out the module
export { PerfStore, perfStore } from "./PerfStore";
export {
  recordMetric,
  incrementCounter,
  setGauge,
  readGauge,
  useRenderCount,
  usePerfSeries,
  usePerfCounter,
} from "./hooks";
export { PerfOverlay } from "./PerfOverlay";

export const PERF_METRICS = {
  "sync.full.sent": { kind: "counter" },
  "sync.delta.sent": { kind: "counter" },
  "sync.delta.patchKeys": { kind: "histogram", cap: 128 },
  "sync.requestFull.sent": { kind: "counter" },
  "sync.requestFull.served": { kind: "counter" },
  "sync.apply.fullBytes": { kind: "histogram", cap: 128 },
  "sync.apply.deltaBytes": { kind: "histogram", cap: 128 },
  "actions.burstYieldMs": { kind: "histogram", cap: 128 }
} as const;
