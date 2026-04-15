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
