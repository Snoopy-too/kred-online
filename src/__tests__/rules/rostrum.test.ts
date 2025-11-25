/**
 * Tests for rostrum rules and validation
 */

import { describe, it, expect } from "vitest";
import type { Piece } from "../../types";
import {
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  countPiecesInPlayerRostrums,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement,
} from "../../../game";

describe("getPlayerRostrumRules", () => {
  it("returns rostrum rules for valid player IDs", () => {
    const p1Rules = getPlayerRostrumRules(1);
    expect(p1Rules).toBeDefined();
    expect(p1Rules?.rostrums).toHaveLength(2);
  });

  it("returns null for invalid player IDs", () => {
    expect(getPlayerRostrumRules(99)).toBeNull();
  });
});

describe("getRostrumSupportRule", () => {
  it("returns support rule for valid rostrum ID", () => {
    const rule = getRostrumSupportRule("p1_rostrum1");
    expect(rule).toBeDefined();
    expect(rule?.rostrum).toBe("p1_rostrum1");
    expect(rule?.supportingSeats).toHaveLength(3);
  });

  it("returns null for invalid rostrum ID", () => {
    expect(getRostrumSupportRule("invalid")).toBeNull();
    expect(getRostrumSupportRule("p1_seat1")).toBeNull();
  });
});

describe("countPiecesInSeats", () => {
  it("counts pieces in specified seats", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p1_seat2", position: { top: 0, left: 0 } } as Piece,
      { id: "p3", locationId: "p2_seat1", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(countPiecesInSeats(["p1_seat1", "p1_seat2"], pieces)).toBe(2);
    expect(countPiecesInSeats(["p1_seat1"], pieces)).toBe(1);
    expect(countPiecesInSeats(["p1_seat3"], pieces)).toBe(0);
  });

  it("returns 0 for empty seat list", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
    ];
    expect(countPiecesInSeats([], pieces)).toBe(0);
  });
});

describe("areSupportingSeatsFullForRostrum", () => {
  it("returns true when all 3 supporting seats are full", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p1_seat2", position: { top: 0, left: 0 } } as Piece,
      { id: "p3", locationId: "p1_seat3", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(areSupportingSeatsFullForRostrum("p1_rostrum1", pieces)).toBe(true);
  });

  it("returns false when supporting seats are not full", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p1_seat2", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(areSupportingSeatsFullForRostrum("p1_rostrum1", pieces)).toBe(false);
  });

  it("returns false for invalid rostrum ID", () => {
    expect(areSupportingSeatsFullForRostrum("invalid", [])).toBe(false);
  });
});

describe("countPiecesInPlayerRostrums", () => {
  it("counts pieces in both player rostrums", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_rostrum1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p1_rostrum2", position: { top: 0, left: 0 } } as Piece,
      { id: "p3", locationId: "p2_rostrum1", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(countPiecesInPlayerRostrums(1, pieces)).toBe(2);
    expect(countPiecesInPlayerRostrums(2, pieces)).toBe(1);
    expect(countPiecesInPlayerRostrums(3, pieces)).toBe(0);
  });

  it("returns 0 for player with no pieces in rostrums", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
    ];
    expect(countPiecesInPlayerRostrums(1, pieces)).toBe(0);
  });
});

describe("areBothRostrumsFilledForPlayer", () => {
  it("returns true when both rostrums have at least one piece", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_rostrum1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p1_rostrum2", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(areBothRostrumsFilledForPlayer(1, pieces)).toBe(true);
  });

  it("returns false when only one rostrum is filled", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p1_rostrum1", position: { top: 0, left: 0 } } as Piece,
    ];

    expect(areBothRostrumsFilledForPlayer(1, pieces)).toBe(false);
  });

  it("returns false when no rostrums are filled", () => {
    expect(areBothRostrumsFilledForPlayer(1, [])).toBe(false);
  });

  it("returns false for invalid player ID", () => {
    expect(areBothRostrumsFilledForPlayer(99, [])).toBe(false);
  });
});

describe("areRostrumsAdjacent", () => {
  describe("3-player games", () => {
    it("identifies adjacent rostrums correctly", () => {
      // p1_rostrum2 ↔ p3_rostrum1 (adjacent in 3-player)
      expect(areRostrumsAdjacent("p1_rostrum2", "p3_rostrum1", 3)).toBe(true);
      expect(areRostrumsAdjacent("p3_rostrum1", "p1_rostrum2", 3)).toBe(true);

      // p3_rostrum2 ↔ p2_rostrum1 (adjacent in 3-player)
      expect(areRostrumsAdjacent("p3_rostrum2", "p2_rostrum1", 3)).toBe(true);

      // p2_rostrum2 ↔ p1_rostrum1 (adjacent in 3-player)
      expect(areRostrumsAdjacent("p2_rostrum2", "p1_rostrum1", 3)).toBe(true);
    });

    it("returns false for non-adjacent rostrums", () => {
      expect(areRostrumsAdjacent("p1_rostrum1", "p1_rostrum2", 3)).toBe(false);
      expect(areRostrumsAdjacent("p1_rostrum1", "p2_rostrum1", 3)).toBe(false);
    });
  });

  describe("4-player games", () => {
    it("identifies adjacent rostrums correctly", () => {
      expect(areRostrumsAdjacent("p1_rostrum2", "p4_rostrum1", 4)).toBe(true);
      expect(areRostrumsAdjacent("p4_rostrum2", "p3_rostrum1", 4)).toBe(true);
      expect(areRostrumsAdjacent("p3_rostrum2", "p2_rostrum1", 4)).toBe(true);
      expect(areRostrumsAdjacent("p2_rostrum2", "p1_rostrum1", 4)).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("returns false for invalid player count", () => {
      expect(areRostrumsAdjacent("p1_rostrum1", "p2_rostrum1", 99)).toBe(false);
    });
  });
});

describe("getAdjacentRostrum", () => {
  describe("3-player games", () => {
    it("returns the adjacent rostrum", () => {
      expect(getAdjacentRostrum("p1_rostrum2", 3)).toBe("p3_rostrum1");
      expect(getAdjacentRostrum("p3_rostrum1", 3)).toBe("p1_rostrum2");
      expect(getAdjacentRostrum("p2_rostrum2", 3)).toBe("p1_rostrum1");
    });

    it("returns null for rostrums with no adjacency", () => {
      expect(getAdjacentRostrum("p1_rostrum1", 3)).toBe("p2_rostrum2");
    });
  });

  describe("4-player games", () => {
    it("returns the adjacent rostrum", () => {
      expect(getAdjacentRostrum("p1_rostrum2", 4)).toBe("p4_rostrum1");
      expect(getAdjacentRostrum("p4_rostrum1", 4)).toBe("p1_rostrum2");
      expect(getAdjacentRostrum("p4_rostrum2", 4)).toBe("p3_rostrum1");
      expect(getAdjacentRostrum("p3_rostrum2", 4)).toBe("p2_rostrum1");
    });
  });

  it("returns null for invalid player count", () => {
    expect(getAdjacentRostrum("p1_rostrum1", 99)).toBeNull();
  });
});

describe("validateAdjacentRostrumMovement", () => {
  it("allows movement between adjacent rostrums when conditions are met", () => {
    const pieces: Piece[] = [
      // Fill supporting seats for p3_rostrum1
      { id: "p1", locationId: "p3_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p3_seat2", position: { top: 0, left: 0 } } as Piece,
      { id: "p3", locationId: "p3_seat3", position: { top: 0, left: 0 } } as Piece,
    ];

    const result = validateAdjacentRostrumMovement(
      "p1_rostrum2",
      "p3_rostrum1",
      1, // Player 1 owns p1_rostrum2
      3,
      pieces
    );

    expect(result.isAllowed).toBe(true);
    expect(result.reason).toBe("Adjacent rostrum movement is valid");
  });

  it("blocks movement to non-adjacent rostrums", () => {
    const result = validateAdjacentRostrumMovement(
      "p1_rostrum1",
      "p1_rostrum2",
      1,
      3,
      []
    );

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain("not adjacent");
  });

  it("blocks movement when opponent tries to move piece from your rostrum", () => {
    const pieces: Piece[] = [
      { id: "p1", locationId: "p3_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p3_seat2", position: { top: 0, left: 0 } } as Piece,
      { id: "p3", locationId: "p3_seat3", position: { top: 0, left: 0 } } as Piece,
    ];

    const result = validateAdjacentRostrumMovement(
      "p1_rostrum2",
      "p3_rostrum1",
      2, // Player 2 trying to move from Player 1's rostrum
      3,
      pieces
    );

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain("Cannot move opponent's piece");
  });

  it("blocks movement when target rostrum supporting seats are not full", () => {
    const pieces: Piece[] = [
      // Only 2 of 3 supporting seats filled
      { id: "p1", locationId: "p3_seat1", position: { top: 0, left: 0 } } as Piece,
      { id: "p2", locationId: "p3_seat2", position: { top: 0, left: 0 } } as Piece,
    ];

    const result = validateAdjacentRostrumMovement(
      "p1_rostrum2",
      "p3_rostrum1",
      1,
      3,
      pieces
    );

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain("only 2/3 supporting seats are full");
  });
});
