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
