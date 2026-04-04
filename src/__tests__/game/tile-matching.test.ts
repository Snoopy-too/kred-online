import { describe, it, expect } from "vitest";
import { getMatchingTileIds, isLegalMoveSet } from "../../game/tile-matching";
import { DefinedMoveType } from "../../types/move";
import type { TrackedMove } from "../../types/move";
import type { Tile } from "../../types/tile";

describe("getMatchingTileIds", () => {
  // Tile 01: REMOVE + ADVANCE
  // Tile 05: ADVANCE + ORGANIZE
  // Tile 15: REMOVE only
  const hand: Tile[] = [
    { id: 1, url: "" },  // Tile "01": REMOVE + ADVANCE
    { id: 5, url: "" },  // Tile "05": ADVANCE + ORGANIZE
    { id: 15, url: "" }, // Tile "15": REMOVE only
  ];

  const makeMove = (moveType: DefinedMoveType, category: "M" | "O", pieceId = "m1"): TrackedMove => ({
    pieceId,
    moveType,
    category,
    fromPosition: { top: 0, left: 0 },
    toPosition: { top: 0, left: 0 },
    fromLocationId: "community1",
    toLocationId: "p1_seat1",
    timestamp: Date.now(),
  });

  it("should match tile 01 when REMOVE and ADVANCE were performed", () => {
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.REMOVE, "O"),
      makeMove(DefinedMoveType.ADVANCE, "M", "m2"),
    ];
    const result = getMatchingTileIds(moves, hand);
    expect(result).toContain("01");
    expect(result).not.toContain("05");
    expect(result).not.toContain("15");
  });

  it("should match tile 15 when only REMOVE was performed", () => {
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.REMOVE, "O"),
    ];
    const result = getMatchingTileIds(moves, hand);
    expect(result).toContain("15");
    expect(result).not.toContain("01");
    expect(result).not.toContain("05");
  });

  it("should match BLANK tile for any moves", () => {
    const handWithBlank: Tile[] = [
      { id: 0, url: "" }, // BLANK tile
      { id: 1, url: "" },
    ];
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.REMOVE, "O"),
    ];
    const result = getMatchingTileIds(moves, handWithBlank);
    expect(result).toContain("BLANK");
  });

  it("should match nothing when no moves were made and hand has only requirement tiles", () => {
    const moves: TrackedMove[] = [];
    const result = getMatchingTileIds(moves, hand);
    expect(result).toHaveLength(0);
  });

  it("should return empty array when hand is empty", () => {
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.ADVANCE, "M"),
    ];
    const result = getMatchingTileIds(moves, []);
    expect(result).toHaveLength(0);
  });
});

describe("isLegalMoveSet", () => {
  const makeMove = (moveType: DefinedMoveType, category: "M" | "O", pieceId = "m1"): TrackedMove => ({
    pieceId,
    moveType,
    category,
    fromPosition: { top: 0, left: 0 },
    toPosition: { top: 0, left: 0 },
    fromLocationId: "community1",
    toLocationId: "p1_seat1",
    timestamp: Date.now(),
  });

  it("should return true for REMOVE + ADVANCE (matches tiles 01, 02)", () => {
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.REMOVE, "O"),
      makeMove(DefinedMoveType.ADVANCE, "M", "m2"),
    ];
    expect(isLegalMoveSet(moves)).toBe(true);
  });

  it("should return false for REMOVE + REMOVE (no tile has this combo)", () => {
    const moves: TrackedMove[] = [
      makeMove(DefinedMoveType.REMOVE, "O"),
      makeMove(DefinedMoveType.REMOVE, "O", "m2"),
    ];
    expect(isLegalMoveSet(moves)).toBe(false);
  });

  it("should return true for zero moves", () => {
    expect(isLegalMoveSet([])).toBe(true);
  });
});
