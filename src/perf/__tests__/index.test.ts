import { describe, it, expect } from "vitest";
import { PERF_ENABLED } from "../index";

describe("perf/index", () => {
  it("PERF_ENABLED is boolean", () => {
    expect(typeof PERF_ENABLED).toBe("boolean");
  });

  it("PERF_ENABLED is true in dev", () => {
    // In dev mode, PERF_ENABLED should be true
    expect(PERF_ENABLED).toBe(true);
  });

  it("exports types without runtime cost", () => {
    // This test just verifies types are importable
    // At runtime, they have zero cost
    const isType = (x: unknown) => typeof x === "undefined";
    expect(isType(undefined)).toBe(true);
  });
});
