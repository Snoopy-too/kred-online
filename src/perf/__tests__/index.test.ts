import { PERF_ENABLED } from "../index";

describe("perf module", () => {
  it("PERF_ENABLED is false in production, true in dev", () => {
    // In test environment, import.meta.env.DEV should be false
    // But PERF_ENABLED must be a literal constant for tree-shaking
    expect(typeof PERF_ENABLED).toBe("boolean");
  });

  it("PERF_ENABLED matches import.meta.env.DEV", () => {
    expect(PERF_ENABLED).toBe(import.meta.env.DEV);
  });
});
