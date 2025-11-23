/**
 * Tests for win condition checking functions
 *
 * These tests verify:
 * - Individual player win condition checking
 * - Multiple winners / draw detection
 * - Campaign and Bureaucracy phase win conditions
 */

import { describe, it, expect } from "vitest";
import type { Player, Piece } from "../../types";
import {
  checkPlayerWinCondition,
  checkBureaucracyWinCondition,
} from "../../../game";

describe("checkPlayerWinCondition", () => {
  const createValidWinningSetup = (playerId: number): Piece[] => [
    // Office: must have a Pawn
    {
      id: `p${playerId}_pawn_office`,
      type: "pawn",
      name: "Pawn",
      playerId,
      locationId: `p${playerId}_office`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/pawn_p${playerId}.png`,
    },
    // Rostrum 1: must have a Heel
    {
      id: `p${playerId}_heel1`,
      type: "heel",
      name: "Heel",
      playerId,
      locationId: `p${playerId}_rostrum1`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/heel_p${playerId}.png`,
    },
    // Rostrum 2: must have a Heel
    {
      id: `p${playerId}_heel2`,
      type: "heel",
      name: "Heel",
      playerId,
      locationId: `p${playerId}_rostrum2`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/heel_p${playerId}.png`,
    },
    // All 6 seats must be occupied
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `p${playerId}_mark${i + 1}`,
      type: "mark" as const,
      name: "Mark" as const,
      playerId,
      locationId: `p${playerId}_seat${i + 1}`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/mark_p${playerId}.png`,
    })),
  ];

  describe("winning conditions", () => {
    it("returns true when player has pawn in office, heels in both rostrums, and all 6 seats filled", () => {
      const pieces = createValidWinningSetup(1);
      expect(checkPlayerWinCondition(1, pieces)).toBe(true);
    });

    it("works for different player IDs", () => {
      expect(checkPlayerWinCondition(1, createValidWinningSetup(1))).toBe(true);
      expect(checkPlayerWinCondition(2, createValidWinningSetup(2))).toBe(true);
      expect(checkPlayerWinCondition(3, createValidWinningSetup(3))).toBe(true);
    });
  });

  describe("failing conditions - office", () => {
    it("returns false when office is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_office"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when office has a Mark instead of Pawn", () => {
      const pieces = createValidWinningSetup(1);
      const officePiece = pieces.find((p) => p.locationId === "p1_office")!;
      officePiece.name = "Mark";
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when office has a Heel instead of Pawn", () => {
      const pieces = createValidWinningSetup(1);
      const officePiece = pieces.find((p) => p.locationId === "p1_office")!;
      officePiece.name = "Heel";
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });
  });

  describe("failing conditions - rostrums", () => {
    it("returns false when rostrum1 is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_rostrum1"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when rostrum2 is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_rostrum2"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when rostrum1 has a Mark instead of Heel", () => {
      const pieces = createValidWinningSetup(1);
      const rostrum1Piece = pieces.find((p) => p.locationId === "p1_rostrum1")!;
      rostrum1Piece.name = "Mark";
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when rostrum2 has a Pawn instead of Heel", () => {
      const pieces = createValidWinningSetup(1);
      const rostrum2Piece = pieces.find((p) => p.locationId === "p1_rostrum2")!;
      rostrum2Piece.name = "Pawn";
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when both rostrums are empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => !p.locationId.includes("rostrum")
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });
  });

  describe("failing conditions - seats", () => {
    it("returns false when seat1 is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_seat1"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when seat3 is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_seat3"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when seat6 is empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_seat6"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when only 5 seats are filled", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => p.locationId !== "p1_seat4"
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });

    it("returns false when all seats are empty", () => {
      const pieces = createValidWinningSetup(1).filter(
        (p) => !p.locationId.includes("seat")
      );
      expect(checkPlayerWinCondition(1, pieces)).toBe(false);
    });
  });
});

describe("checkBureaucracyWinCondition", () => {
  const createPlayers = (count: number): Player[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      credibility: 5,
      hand: [],
      bureaucracyTiles: [],
      hasWon: false,
    }));

  const createValidWinningSetup = (playerId: number): Piece[] => [
    {
      id: `p${playerId}_pawn_office`,
      type: "pawn",
      name: "Pawn",
      playerId,
      locationId: `p${playerId}_office`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/pawn_p${playerId}.png`,
    },
    {
      id: `p${playerId}_heel1`,
      type: "heel",
      name: "Heel",
      playerId,
      locationId: `p${playerId}_rostrum1`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/heel_p${playerId}.png`,
    },
    {
      id: `p${playerId}_heel2`,
      type: "heel",
      name: "Heel",
      playerId,
      locationId: `p${playerId}_rostrum2`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/heel_p${playerId}.png`,
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `p${playerId}_mark${i + 1}`,
      type: "mark" as const,
      name: "Mark" as const,
      playerId,
      locationId: `p${playerId}_seat${i + 1}`,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: `/images/pieces/mark_p${playerId}.png`,
    })),
  ];

  it("returns empty array when no player has won", () => {
    const players = createPlayers(3);
    const pieces: Piece[] = [];

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([]);
  });

  it("returns single player ID when one player has won", () => {
    const players = createPlayers(3);
    const pieces = createValidWinningSetup(2);

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([2]);
  });

  it("returns multiple player IDs when there's a draw", () => {
    const players = createPlayers(3);
    const pieces = [
      ...createValidWinningSetup(1),
      ...createValidWinningSetup(3),
    ];

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([1, 3]);
  });

  it("works with different player counts", () => {
    const players = createPlayers(5);
    const pieces = [
      ...createValidWinningSetup(2),
      ...createValidWinningSetup(4),
    ];

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([2, 4]);
  });

  it("returns all players in a 3-way draw", () => {
    const players = createPlayers(3);
    const pieces = [
      ...createValidWinningSetup(1),
      ...createValidWinningSetup(2),
      ...createValidWinningSetup(3),
    ];

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([1, 2, 3]);
  });

  it("correctly identifies partial wins", () => {
    const players = createPlayers(4);
    const pieces = [
      ...createValidWinningSetup(1),
      ...createValidWinningSetup(3).filter(
        (p) => p.locationId !== "p3_seat6"
      ), // Player 3 missing one seat
    ];

    const winners = checkBureaucracyWinCondition(players, pieces);

    expect(winners).toEqual([1]); // Only player 1 wins
  });
});
