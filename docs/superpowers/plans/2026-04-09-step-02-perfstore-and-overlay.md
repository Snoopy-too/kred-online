# Step 2 — PerfStore + Dev Overlay

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained, dev-only observability layer that captures sync packet metrics, apply latency, action queue stats, and provider render counts. Surface them in a dismissable corner overlay. Zero cost when disabled. **No behavioral changes** to anything else.

**Architecture:** Single in-memory pub/sub `PerfStore` keyed by metric name with capped per-series ring buffers. A `usePerfMetric` hook for writers, a `usePerfSeries` hook for readers. A `<PerfOverlay />` React component renders the live data. Everything is gated behind a single `PERF_ENABLED` const that defaults to `import.meta.env.DEV`. In production builds the writer calls become no-ops that tree-shake away.

**Tech Stack:** React 19, TypeScript, Vite (`import.meta.env.DEV`), Tailwind v4 (already wired in `vite.config.ts`).

---

## Context for fresh agent

**Read these first** (in this order, ~3 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — full design spec. Section 1 is what you're implementing.
2. `src/KredApp.tsx` — top-level component. The overlay needs to mount here so it lives outside any potentially-crashing screen.
3. `src/components/GameStateSynchronizer.tsx` — you'll add metric calls here in Task 7 (NOT in this step, but read it now so you understand what is being measured).
4. `vite.config.ts` — confirms Tailwind + React plugin setup. No need to change anything in this step.
5. `package.json` scripts — `npm run dev` runs Vite dev server (where `import.meta.env.DEV === true`); `npm run build` produces a production build.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- Tailwind classes for styling (already used throughout `src/components`).
- New code goes under `src/perf/` — a new top-level subdirectory specifically for this layer.
- File-size budget: 500 lines per file.

**Critical constraints from spec:**
- **Zero cost when disabled.** Single `PERF_ENABLED` const at the top of `src/perf/index.ts`. Every writer (`recordMetric`, `incrementCounter`, `useRenderCount`) returns immediately if the const is false. The const must be a literal evaluation of `import.meta.env.DEV` so Vite's tree-shaker can eliminate the code in production builds.
- **No external library.** Self-contained. Do NOT add Sentry/LogRocket/Zustand/etc. ~150 lines total target.
- **No persistence.** In-memory only. Reload wipes the store.
- **No behavioral changes.** Pure read-side. If you accidentally cause a re-render storm or break sync timing, the problem is with this step itself, not what is being measured.
- **Dev-only overlay.** Gated behind `?perf=1` URL flag OR `Ctrl+Shift+P` keybinding. Default off, even in dev.

**What this step does NOT do** (avoid scope creep):
- ❌ Do not add metric calls inside `GameStateSynchronizer.tsx` or any provider yet. That happens in Steps 3, 5, 6, 7 as those features land. **The exception is Task 7 below**, which adds a single representative metric call to prove the wiring works end-to-end.
- ❌ Do not add network panel timings, Supabase channel state changes, memory usage panels, or any feature beyond what is in spec §1.
- ❌ Do not add console.log spam or browser DevTools panel — the overlay is the only surface.

---

## File Structure

| File | Responsibility | Size budget |
|---|---|---|
| `src/perf/index.ts` | Public API barrel + `PERF_ENABLED` constant + types. | ≤ 80 lines |
| `src/perf/PerfStore.ts` | Pub/sub store with ring buffers per metric series. | ≤ 200 lines |
| `src/perf/hooks.ts` | `useRenderCount`, `usePerfSeries`, `usePerfCounter`. | ≤ 120 lines |
| `src/perf/PerfOverlay.tsx` | The dev-only React overlay component. | ≤ 250 lines |
| `src/perf/__tests__/PerfStore.test.ts` | Unit tests for the store. | ≤ 200 lines |
| `src/perf/__tests__/hooks.test.tsx` | Unit tests for the hooks. | ≤ 150 lines |

Total new code: ~1000 lines across 6 files.

---

## Tasks

### Task 1: Define types and the `PERF_ENABLED` gate

**Files:**
- Create: `src/perf/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/perf/__tests__/index.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PERF_ENABLED, MAX_SERIES_SAMPLES } from "../index";

describe("perf module exports", () => {
  it("exposes PERF_ENABLED as a boolean", () => {
    expect(typeof PERF_ENABLED).toBe("boolean");
  });

  it("exposes MAX_SERIES_SAMPLES as a positive number", () => {
    expect(typeof MAX_SERIES_SAMPLES).toBe("number");
    expect(MAX_SERIES_SAMPLES).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/perf/__tests__/index.test.ts
```

Expected: FAIL — `Cannot find module '../index'`.

- [ ] **Step 3: Create the file**

Create `src/perf/index.ts`:

```ts
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
export {
  recordMetric,
  incrementCounter,
  useRenderCount,
  usePerfSeries,
  usePerfCounter,
} from "./hooks";
export { PerfOverlay } from "./PerfOverlay";
```

This will fail to compile because the re-exports don't exist yet — that's fine, the next tasks create them. To make this task's test pass without those re-exports, comment them out temporarily:

```ts
// Re-exports — populated as we build out the module
// export { PerfStore, perfStore } from "./PerfStore";
// export {
//   recordMetric,
//   incrementCounter,
//   useRenderCount,
//   usePerfSeries,
//   usePerfCounter,
// } from "./hooks";
// export { PerfOverlay } from "./PerfOverlay";
```

The next tasks will uncomment them as the modules come online.

- [ ] **Step 4: Run and confirm pass**

```bash
npx vitest run src/perf/__tests__/index.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/perf/index.ts src/perf/__tests__/index.test.ts
git commit -m "perf: add module entry with PERF_ENABLED gate"
```

---

### Task 2: Implement PerfStore (ring buffer + pub/sub)

**Files:**
- Create: `src/perf/PerfStore.ts`
- Create: `src/perf/__tests__/PerfStore.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/perf/__tests__/PerfStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { PerfStore } from "../PerfStore";
import { MAX_SERIES_SAMPLES } from "../index";

describe("PerfStore", () => {
  let store: PerfStore;

  beforeEach(() => {
    store = new PerfStore();
  });

  it("records a sample and exposes it via getSeries", () => {
    store.record("packet.bytes", 1024);
    const series = store.getSeries("packet.bytes");
    expect(series.samples).toHaveLength(1);
    expect(series.samples[0].v).toBe(1024);
    expect(series.samples[0].t).toBeGreaterThan(0);
  });

  it("rotates samples beyond MAX_SERIES_SAMPLES (FIFO)", () => {
    for (let i = 0; i < MAX_SERIES_SAMPLES + 50; i++) {
      store.record("packet.bytes", i);
    }
    const series = store.getSeries("packet.bytes");
    expect(series.samples).toHaveLength(MAX_SERIES_SAMPLES);
    expect(series.samples[0].v).toBe(50);
    expect(series.samples[MAX_SERIES_SAMPLES - 1].v).toBe(MAX_SERIES_SAMPLES + 49);
  });

  it("notifies subscribers when a sample is recorded", () => {
    const calls: string[] = [];
    const unsub = store.subscribe("packet.bytes", () => calls.push("yo"));
    store.record("packet.bytes", 1);
    store.record("packet.bytes", 2);
    expect(calls).toHaveLength(2);
    unsub();
    store.record("packet.bytes", 3);
    expect(calls).toHaveLength(2);
  });

  it("supports counters via increment", () => {
    store.increment("actions.processed");
    store.increment("actions.processed");
    store.increment("actions.processed", 3);
    expect(store.getCounter("actions.processed")).toBe(5);
  });

  it("returns 0 for unknown counter (no throw)", () => {
    expect(store.getCounter("nope")).toBe(0);
  });

  it("returns empty series for unknown name (no throw)", () => {
    const s = store.getSeries("nope");
    expect(s.samples).toEqual([]);
    expect(s.name).toBe("nope");
  });

  it("listSeriesNames returns all known series", () => {
    store.record("a", 1);
    store.record("b", 2);
    store.increment("c");
    const names = store.listSeriesNames();
    expect(names).toContain("a");
    expect(names).toContain("b");
    // Counters are listed separately
    expect(names).not.toContain("c");
    expect(store.listCounterNames()).toContain("c");
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/perf/__tests__/PerfStore.test.ts
```

Expected: FAIL — `Cannot find module '../PerfStore'`.

- [ ] **Step 3: Implement PerfStore**

Create `src/perf/PerfStore.ts`:

```ts
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
    return {
      name,
      kind: "histogram",
      samples: this.series.get(name) ?? [],
    };
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
```

- [ ] **Step 4: Uncomment the re-export**

Edit `src/perf/index.ts` and uncomment the PerfStore line:

```ts
export { PerfStore, perfStore } from "./PerfStore";
```

- [ ] **Step 5: Run and confirm pass**

```bash
npx vitest run src/perf/__tests__/
```

Expected: all PerfStore tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/perf/PerfStore.ts src/perf/index.ts src/perf/__tests__/PerfStore.test.ts
git commit -m "perf: implement PerfStore with ring buffers and pub/sub"
```

---

### Task 3: Add the writer hooks (recordMetric, incrementCounter, useRenderCount)

**Files:**
- Create: `src/perf/hooks.ts`
- Create: `src/perf/__tests__/hooks.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/perf/__tests__/hooks.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  recordMetric,
  incrementCounter,
  useRenderCount,
  usePerfSeries,
  usePerfCounter,
} from "../hooks";
import { perfStore } from "../PerfStore";

describe("perf hooks", () => {
  beforeEach(() => {
    perfStore.clear();
  });

  it("recordMetric writes to the singleton store", () => {
    recordMetric("packet.bytes", 512);
    expect(perfStore.getSeries("packet.bytes").samples).toHaveLength(1);
    expect(perfStore.getSeries("packet.bytes").samples[0].v).toBe(512);
  });

  it("incrementCounter writes to the singleton store", () => {
    incrementCounter("actions.processed");
    incrementCounter("actions.processed", 4);
    expect(perfStore.getCounter("actions.processed")).toBe(5);
  });

  it("useRenderCount increments a counter named 'render.<name>' on each render", () => {
    const { rerender } = renderHook(({ name }) => useRenderCount(name), {
      initialProps: { name: "MyComponent" },
    });
    rerender({ name: "MyComponent" });
    rerender({ name: "MyComponent" });
    expect(perfStore.getCounter("render.MyComponent")).toBe(3);
  });

  it("usePerfSeries returns the latest samples and re-renders on update", () => {
    perfStore.record("foo", 1);
    perfStore.record("foo", 2);
    const { result } = renderHook(() => usePerfSeries("foo"));
    expect(result.current.samples.map((s) => s.v)).toEqual([1, 2]);
  });

  it("usePerfCounter returns the latest count", () => {
    perfStore.increment("bar", 3);
    const { result } = renderHook(() => usePerfCounter("bar"));
    expect(result.current).toBe(3);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/perf/__tests__/hooks.test.tsx
```

Expected: FAIL — `Cannot find module '../hooks'`.

- [ ] **Step 3: Implement hooks**

Create `src/perf/hooks.ts`:

```ts
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const getSnapshot = () => perfStore.getSeries(name);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribe to a counter and re-render when it changes.
 * Returns the current count.
 */
export function usePerfCounter(name: string): number {
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const getSnapshot = () => perfStore.getCounter(name);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

- [ ] **Step 4: Uncomment the re-exports in index.ts**

Edit `src/perf/index.ts` and uncomment the hooks line:

```ts
export {
  recordMetric,
  incrementCounter,
  useRenderCount,
  usePerfSeries,
  usePerfCounter,
} from "./hooks";
```

(Leave the PerfOverlay export commented out — Task 4 enables it.)

- [ ] **Step 5: Run and confirm pass**

```bash
npx vitest run src/perf/__tests__/hooks.test.tsx
```

Expected: all hook tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/perf/hooks.ts src/perf/index.ts src/perf/__tests__/hooks.test.tsx
git commit -m "perf: add writer + reader hooks for metrics"
```

---

### Task 4: Build the dev-only PerfOverlay component

**Files:**
- Create: `src/perf/PerfOverlay.tsx`

- [ ] **Step 1: Implement the overlay**

This is a UI component — write-and-eyeball is more honest than TDD here. Create `src/perf/PerfOverlay.tsx`:

```tsx
import { useEffect, useState, useSyncExternalStore } from "react";
import { PERF_ENABLED } from "./index";
import { perfStore } from "./PerfStore";

/**
 * Dev-only perf overlay.
 *
 * Activation: ?perf=1 in the URL OR Ctrl+Shift+P keybinding.
 * Renders nothing when PERF_ENABLED is false (production).
 *
 * The overlay auto-discovers all series + counters in the store and
 * renders them in a small fixed-position panel. No configuration needed.
 */
export function PerfOverlay() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("perf");
  });

  // Ctrl+Shift+P toggle
  useEffect(() => {
    if (!PERF_ENABLED) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Expose dump() globally for ad-hoc debugging
  useEffect(() => {
    if (!PERF_ENABLED) return;
    (window as any).__kred_perf = {
      dump: () => perfStore.dump(),
      clear: () => perfStore.clear(),
      store: perfStore,
    };
    return () => {
      delete (window as any).__kred_perf;
    };
  }, []);

  // Subscribe to ANY change in the store so we re-render when new series appear
  const tick = useSyncExternalStore(
    (cb) => {
      // Subscribe to a sentinel name; also poll on interval as a cheap fallback
      // for the case where new series are added.
      const id = setInterval(cb, 500);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => 0
  );
  void tick;

  if (!PERF_ENABLED || !open) return null;

  const seriesNames = perfStore.listSeriesNames();
  const counterNames = perfStore.listCounterNames();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#9fef9f",
        font: "11px/1.3 ui-monospace, Menlo, monospace",
        padding: "8px 10px",
        borderRadius: 6,
        maxWidth: 360,
        maxHeight: "60vh",
        overflowY: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
      data-testid="perf-overlay"
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <strong style={{ color: "#fff" }}>perf</strong>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#9fef9f",
            cursor: "pointer",
            fontSize: 10,
            padding: "0 6px",
          }}
        >
          ×
        </button>
      </div>

      {counterNames.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ color: "#888", marginBottom: 2 }}>counters</div>
          {counterNames.map((name) => (
            <CounterRow key={name} name={name} />
          ))}
        </div>
      )}

      {seriesNames.length > 0 && (
        <div>
          <div style={{ color: "#888", marginBottom: 2 }}>series (last sample)</div>
          {seriesNames.map((name) => (
            <SeriesRow key={name} name={name} />
          ))}
        </div>
      )}

      {counterNames.length === 0 && seriesNames.length === 0 && (
        <div style={{ color: "#666" }}>no metrics yet</div>
      )}
    </div>
  );
}

function CounterRow({ name }: { name: string }) {
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const value = useSyncExternalStore(
    subscribe,
    () => perfStore.getCounter(name),
    () => 0
  );
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{name}</span>
      <span>{value}</span>
    </div>
  );
}

function SeriesRow({ name }: { name: string }) {
  const subscribe = (cb: () => void) => perfStore.subscribe(name, cb);
  const series = useSyncExternalStore(
    subscribe,
    () => perfStore.getSeries(name),
    () => ({ name, kind: "histogram" as const, samples: [] })
  );
  const last = series.samples[series.samples.length - 1];
  const avg =
    series.samples.length > 0
      ? series.samples.reduce((a, s) => a + s.v, 0) / series.samples.length
      : 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{name}</span>
      <span>
        {last ? last.v.toFixed(0) : "—"}{" "}
        <span style={{ color: "#666" }}>(avg {avg.toFixed(0)} n={series.samples.length})</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Uncomment the export in index.ts**

Edit `src/perf/index.ts` and uncomment the PerfOverlay line:

```ts
export { PerfOverlay } from "./PerfOverlay";
```

- [ ] **Step 3: Run all perf tests to make sure we didn't break anything**

```bash
npx vitest run src/perf/__tests__/
```

Expected: all PASS (the overlay itself has no test in this task).

- [ ] **Step 4: Commit**

```bash
git add src/perf/PerfOverlay.tsx src/perf/index.ts
git commit -m "perf: add dev-only PerfOverlay component"
```

---

### Task 5: Mount the overlay in KredApp

**Files:**
- Modify: `src/KredApp.tsx`

- [ ] **Step 1: Read the file**

```bash
# Use Read tool, not cat
```

Read `src/KredApp.tsx` end-to-end (only ~92 lines).

- [ ] **Step 2: Add the import**

Add to the import section at the top of `src/KredApp.tsx`:

```ts
import { PerfOverlay } from "./perf";
```

- [ ] **Step 3: Mount the overlay**

Find the JSX returned from `KredApp`. Add `<PerfOverlay />` as a sibling of the existing top-level content (NOT as a child of any conditional that depends on lobby state — the overlay must be mountable from the very first render, before any game state exists).

Example pattern (adapt to actual file):

```tsx
return (
  <>
    {/* existing children */}
    <PerfOverlay />
  </>
);
```

If `KredApp` already returns a fragment or root element, add `<PerfOverlay />` as the last child inside it. If it returns a single component without a fragment, wrap it in a fragment.

- [ ] **Step 4: Verify dev server still starts and the overlay shows up**

```bash
npm run dev
```

Open http://localhost:5173/?perf=1 in a browser. Confirm a small black panel appears in the bottom-right with "no metrics yet".

Press `Ctrl+Shift+P` to toggle it. Confirm it disappears and reappears.

(Stop the dev server with Ctrl+C when done.)

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npm test -- --run
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/KredApp.tsx
git commit -m "perf: mount PerfOverlay in KredApp"
```

---

### Task 6: Sanity check — verify production builds tree-shake the perf code

**Files:**
- None modified

- [ ] **Step 1: Build for production**

```bash
npm run build
```

Expected: builds without errors. Look at the build output for total bundle size.

- [ ] **Step 2: Verify perf code is gone from the production bundle**

Find the JS chunk that would contain App code (typically the largest in `dist/assets/index-*.js`). Use Grep:

```
Use Grep tool with:
  pattern: "PerfOverlay"
  path: "dist/assets/"
```

Expected: no matches (or only stripped/minified residue without the actual component logic). If you see the full overlay code, the tree shaking is broken — `PERF_ENABLED` is not being evaluated as a literal. Check that `import.meta.env.DEV` is not wrapped in any conditional or computed. If it IS wrapped, fix it before continuing.

- [ ] **Step 3: Note your findings inline (no commit needed)**

Just confirm in the task description: "Production bundle does/does not contain perf code." If it does, stop and fix; if it doesn't, you're done with this task.

---

### Task 7: Wire one representative metric in GameStateSynchronizer to prove end-to-end works

**Background:** This is the only production-code touch in this step. We add a single `recordMetric` call to confirm the wiring works end-to-end. The remaining metric calls happen in Steps 3, 5, 6, 7 as those features ship.

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Read the relevant section**

Read `src/components/GameStateSynchronizer.tsx` lines 88-118 (the `pushState` function).

- [ ] **Step 2: Add the metric**

At the top of `src/components/GameStateSynchronizer.tsx`, add:

```ts
import { recordMetric } from "../perf";
```

Inside `pushState`, immediately after the line that sets `packet.lastUpdated = Date.now();`, add:

```ts
recordMetric("packet.bytes", JSON.stringify(packet).length);
recordMetric("packet.version", packet.stateVersion);
```

That's it. Do NOT add any other metrics in this step. Other metric calls land alongside the features they measure in Steps 3, 5, 6, 7.

- [ ] **Step 3: Verify the build still works**

```bash
npm run build
```

Expected: builds without errors.

- [ ] **Step 4: Verify the metric wiring works in dev**

```bash
npm run dev
```

In a browser, navigate to http://localhost:5173/?perf=1, create a lobby as host, and confirm `packet.bytes` and `packet.version` appear in the overlay after the host pushes state at least once.

Stop the dev server when verified.

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "perf: instrument host pushState with packet bytes + version metrics"
```

---

## Definition of done

- [ ] `src/perf/index.ts`, `PerfStore.ts`, `hooks.ts`, `PerfOverlay.tsx` all exist
- [ ] `npm run dev` + `?perf=1` shows the overlay
- [ ] `Ctrl+Shift+P` toggles the overlay
- [ ] `window.__kred_perf.dump()` returns a JSON snapshot in dev
- [ ] `npm run build` produces a production bundle that does NOT contain `PerfOverlay` source
- [ ] After playing a host-side action in dev, `packet.bytes` and `packet.version` show in the overlay
- [ ] All existing tests still pass
- [ ] No production code outside `src/components/GameStateSynchronizer.tsx` and `src/KredApp.tsx` was modified

## Handoff notes for next step (Step 3 — Sync layer fixes)

- The perf module is now ready to instrument anything. Step 3 will add `packet.deltaCount`, `packet.pushReason`, `apply.latency` (with `channel` tag), `actions.queue.depth`, `actions.processedSet.size`, and `actions.latency` calls in the same style as Task 7.
- If the bundle-size check in Task 6 failed and you had to work around it, document the workaround in `HANDOFF_NOTES.md` next to this plan.
- Do not touch the perf module's public API in later steps without re-running Task 6.
