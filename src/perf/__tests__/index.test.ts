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
