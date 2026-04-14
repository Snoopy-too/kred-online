// Dev-only performance observability layer
// Gate all perf code behind PERF_ENABLED; must be literal for Vite tree-shaking
export const PERF_ENABLED = import.meta.env.DEV;

// ============================================================================
// Types
// ============================================================================

export interface SeriesSample {
  value: number;
  timestamp: number;
}

export interface Series {
  name: string;
  samples: SeriesSample[];
  tags?: Record<string, string>;
}

export interface Counter {
  name: string;
  count: number;
}

export type PerfMetricListener = (metric: {
  name: string;
  type: "series" | "counter";
}) => void;

// ============================================================================
// Exports (uncomment as modules come online)
// ============================================================================

export { PerfStore } from "./PerfStore";
export { recordMetric, incrementCounter, useRenderCount, usePerfSeries, usePerfCounter } from "./hooks";
// export { PerfOverlay } from "./PerfOverlay";
