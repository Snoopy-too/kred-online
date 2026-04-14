import { describe, it, expect, beforeEach } from "vitest";
import { PerfStore } from "../PerfStore";

describe("PerfStore", () => {
  let store: PerfStore;

  beforeEach(() => {
    store = new PerfStore();
  });

  describe("series", () => {
    it("records samples in order", () => {
      store.recordSample("metric.a", 10);
      store.recordSample("metric.a", 20);
      store.recordSample("metric.a", 30);

      const series = store.getSeries("metric.a");
      expect(series).toBeDefined();
      expect(series!.samples.length).toBe(3);
      expect(series!.samples[0].value).toBe(10);
      expect(series!.samples[2].value).toBe(30);
    });

    it("caps series at MAX_SERIES_SAMPLES (256)", () => {
      for (let i = 0; i < 300; i++) {
        store.recordSample("metric.a", i);
      }

      const series = store.getSeries("metric.a");
      expect(series!.samples.length).toBeLessThanOrEqual(256);
      // Most recent samples should be kept
      expect(series!.samples[series!.samples.length - 1].value).toBe(299);
    });

    it("returns undefined for unknown series", () => {
      expect(store.getSeries("unknown")).toBeUndefined();
    });

    it("lists all series names", () => {
      store.recordSample("metric.a", 1);
      store.recordSample("metric.b", 2);
      store.recordSample("metric.c", 3);

      const names = store.listSeriesNames();
      expect(names).toContain("metric.a");
      expect(names).toContain("metric.b");
      expect(names).toContain("metric.c");
    });
  });

  describe("counters", () => {
    it("increments counters monotonically", () => {
      store.incrementCounter("count.a");
      store.incrementCounter("count.a");
      store.incrementCounter("count.a", 5);

      expect(store.getCounter("count.a")).toBe(7);
    });

    it("defaults increment to 1", () => {
      store.incrementCounter("count.b");
      expect(store.getCounter("count.b")).toBe(1);
    });

    it("returns 0 for unknown counter", () => {
      expect(store.getCounter("unknown")).toBe(0);
    });

    it("lists all counter names", () => {
      store.incrementCounter("count.a");
      store.incrementCounter("count.b");
      store.incrementCounter("count.c");

      const names = store.listCounterNames();
      expect(names).toContain("count.a");
      expect(names).toContain("count.b");
      expect(names).toContain("count.c");
    });
  });

  describe("pub/sub", () => {
    it("notifies subscribers on new series sample", () => {
      const called: string[] = [];
      const unsub = store.subscribe((metric) => {
        called.push(metric.name);
      });

      store.recordSample("metric.a", 1);
      expect(called).toContain("metric.a");

      unsub();
      store.recordSample("metric.a", 2);
      expect(called.length).toBe(1); // No new call after unsubscribe
    });

    it("notifies subscribers on counter increment", () => {
      const called: string[] = [];
      const unsub = store.subscribe((metric) => {
        called.push(`${metric.name}:${metric.type}`);
      });

      store.incrementCounter("count.a");
      expect(called).toContain("count.a:counter");

      unsub();
      store.incrementCounter("count.a");
      expect(called.length).toBe(1);
    });

    it("supports multiple subscribers", () => {
      const calls1: string[] = [];
      const calls2: string[] = [];

      const unsub1 = store.subscribe(() => {
        calls1.push("fired");
      });
      const unsub2 = store.subscribe(() => {
        calls2.push("fired");
      });

      store.recordSample("metric.a", 1);
      expect(calls1.length).toBe(1);
      expect(calls2.length).toBe(1);

      unsub1();
      store.recordSample("metric.b", 1);
      expect(calls1.length).toBe(1);
      expect(calls2.length).toBe(2);
    });
  });

  describe("dump", () => {
    it("exports all metrics and counters", () => {
      store.recordSample("metric.a", 10);
      store.recordSample("metric.a", 20);
      store.incrementCounter("count.x", 3);

      const dump = store.dump();
      expect(dump.series.length).toBe(1);
      expect(dump.series[0].name).toBe("metric.a");
      expect(dump.series[0].samples.length).toBe(2);

      expect(dump.counters.length).toBe(1);
      expect(dump.counters[0].name).toBe("count.x");
      expect(dump.counters[0].count).toBe(3);
    });

    it("dump returns empty arrays for empty store", () => {
      const dump = store.dump();
      expect(dump.series).toEqual([]);
      expect(dump.counters).toEqual([]);
    });
  });

  describe("timestamps", () => {
    it("records timestamps with samples", () => {
      const before = Date.now();
      store.recordSample("metric.a", 42);
      const after = Date.now();

      const series = store.getSeries("metric.a");
      expect(series!.samples[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(series!.samples[0].timestamp).toBeLessThanOrEqual(after);
    });
  });
});
