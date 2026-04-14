import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { PerfStore } from "../PerfStore";

// Import the functions after setting up the store
import {
  recordMetric,
  incrementCounter,
  useRenderCount,
  usePerfSeries,
  usePerfCounter,
} from "../hooks";

describe("perf/hooks", () => {
  let store: PerfStore;

  beforeEach(() => {
    // Create fresh store for each test
    store = new PerfStore();
    // Inject store globally for hooks to find
    (globalThis as any).__kred_perf_store = store;
  });

  afterEach(() => {
    // Clean up
    if (store) {
      store.clear();
    }
    delete (globalThis as any).__kred_perf_store;
  });

  describe("recordMetric", () => {
    it("records samples", () => {
      recordMetric("metric.test", 42);
      const series = store.getSeries("metric.test");
      expect(series).toBeDefined();
      expect(series!.samples[0].value).toBe(42);
    });

    it("accepts tags", () => {
      recordMetric("metric.test", 100, { tag: "value" });
      expect(store.getSeries("metric.test")).toBeDefined();
    });
  });

  describe("incrementCounter", () => {
    it("increments counter", () => {
      incrementCounter("count.test");
      expect(store.getCounter("count.test")).toBe(1);
    });

    it("increments by specified amount", () => {
      incrementCounter("count.test", 5);
      expect(store.getCounter("count.test")).toBe(5);
    });

    it("defaults to increment by 1", () => {
      incrementCounter("count.test");
      incrementCounter("count.test");
      expect(store.getCounter("count.test")).toBe(2);
    });
  });

  describe("useRenderCount", () => {
    it("increments render counter on each render", () => {
      const { rerender } = renderHook(() => useRenderCount("comp.test"));

      expect(store.getCounter("render.comp.test")).toBe(1);

      rerender();
      expect(store.getCounter("render.comp.test")).toBe(2);

      rerender();
      expect(store.getCounter("render.comp.test")).toBe(3);
    });
  });

  describe("usePerfSeries", () => {
    it("returns empty array initially", () => {
      const { result } = renderHook(() => usePerfSeries("metric.unknown"));
      expect(result.current).toEqual([]);
    });

    it("returns series samples when available", () => {
      act(() => {
        recordMetric("metric.test", 10);
        recordMetric("metric.test", 20);
        recordMetric("metric.test", 30);
      });

      const { result } = renderHook(() => usePerfSeries("metric.test"));
      expect(result.current.length).toBe(3);
      expect(result.current[0].value).toBe(10);
      expect(result.current[2].value).toBe(30);
    });
  });

  describe("usePerfCounter", () => {
    it("returns 0 initially", () => {
      const { result } = renderHook(() => usePerfCounter("count.unknown"));
      expect(result.current).toBe(0);
    });

    it("returns counter value when available", () => {
      act(() => {
        incrementCounter("count.test", 5);
      });

      const { result } = renderHook(() => usePerfCounter("count.test"));
      expect(result.current).toBe(5);
    });
  });
});
