import { describe, expect, it } from "vitest";
import { applyDelta, buildPacket, shouldSendFull } from "../../sync/packet";

describe("buildPacket", () => {
  it("returns full when prev is null", () => {
    const p = buildPacket({
      prev: null, next: { a: 1, b: 2 },
      prevVersion: 0, nextVersion: 1, ts: 100, forceFull: false,
    });
    expect(p.kind).toBe("full");
    if (p.kind === "full") expect(p.state).toEqual({ a: 1, b: 2 });
  });

  it("returns full when forceFull", () => {
    const p = buildPacket({
      prev: { a: 1 }, next: { a: 2 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: true,
    });
    expect(p.kind).toBe("full");
  });

  it("returns delta with only changed keys", () => {
    const p = buildPacket({
      prev: { a: 1, b: 2, c: 3 },
      next: { a: 1, b: 9, c: 3 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    expect(p.kind).toBe("delta");
    if (p.kind === "delta") {
      expect(p.patch).toEqual({ b: 9 });
      expect(p.baseV).toBe(5);
    }
  });

  it("includes removed keys as undefined", () => {
    const p = buildPacket({
      prev: { a: 1, b: 2 },
      next: { a: 1 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p.kind !== "delta") throw new Error("expected delta");
    expect(p.patch).toEqual({ b: undefined });
  });

  it("uses reference equality, not deep equality", () => {
    const arr = [1, 2, 3];
    const p1 = buildPacket({
      prev: { arr }, next: { arr }, // same ref
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p1.kind !== "delta") throw new Error("expected delta");
    expect(p1.patch).toEqual({});

    const p2 = buildPacket({
      prev: { arr }, next: { arr: [1, 2, 3] }, // different ref, same content
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p2.kind !== "delta") throw new Error("expected delta");
    expect(p2.patch).toHaveProperty("arr");
  });
});

describe("applyDelta", () => {
  it("merges patch over base", () => {
    const result = applyDelta({ a: 1, b: 2 }, { b: 9, c: 3 });
    expect(result).toEqual({ a: 1, b: 9, c: 3 });
  });

  it("deletes keys where patch value is undefined", () => {
    const result = applyDelta({ a: 1, b: 2 }, { b: undefined });
    expect(result).toEqual({ a: 1 });
    expect("b" in result).toBe(false);
  });

  it("returns a new object (does not mutate base)", () => {
    const base = { a: 1 };
    const result = applyDelta(base, { a: 2 });
    expect(base).toEqual({ a: 1 });
    expect(result).toEqual({ a: 2 });
    expect(result).not.toBe(base);
  });
});

describe("shouldSendFull", () => {
  it("first push is always full", () => {
    expect(shouldSendFull(0, 20, false, false)).toBe(true);
  });
  it("rejoin forces full", () => {
    expect(shouldSendFull(5, 20, false, true)).toBe(true);
  });
  it("phase change forces full", () => {
    expect(shouldSendFull(5, 20, true, false)).toBe(true);
  });
  it("every Nth push is full", () => {
    expect(shouldSendFull(20, 20, false, false)).toBe(true);
    expect(shouldSendFull(19, 20, false, false)).toBe(false);
    expect(shouldSendFull(21, 20, false, false)).toBe(false);
    expect(shouldSendFull(40, 20, false, false)).toBe(true);
  });
});