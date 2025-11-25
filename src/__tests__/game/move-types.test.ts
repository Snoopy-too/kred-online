import { describe, it, expect } from "vitest";
import {
  determineMoveType,
  validatePurchasedMove,
} from "../../game/move-types";
import type { TrackedMove, Piece, BureaucracyMoveType } from "../../types";
import { DefinedMoveType } from "../../types";

// ============================================================================
// determineMoveType Tests
// ============================================================================

describe("determineMoveType", () => {
  const playerId = 1;

  describe("REMOVE moves", () => {
    it("should identify REMOVE: opponent seat → community", () => {
      const result = determineMoveType("p2_seat1", "community1", playerId);
      expect(result).toBe(DefinedMoveType.REMOVE);
    });

    it("should not identify REMOVE for own seat → community", () => {
      const result = determineMoveType("p1_seat1", "community1", playerId);
      expect(result).not.toBe(DefinedMoveType.REMOVE);
    });
  });

  describe("INFLUENCE moves", () => {
    it("should identify INFLUENCE: opponent rostrum → own rostrum", () => {
      const result = determineMoveType("p2_rostrum1", "p1_rostrum1", playerId);
      expect(result).toBe(DefinedMoveType.INFLUENCE);
    });

    it("should not identify INFLUENCE for own rostrum → own rostrum", () => {
      const result = determineMoveType("p1_rostrum1", "p1_rostrum2", playerId);
      expect(result).not.toBe(DefinedMoveType.INFLUENCE);
    });
  });

  describe("ASSIST moves", () => {
    it("should identify ASSIST: community → opponent seat", () => {
      const result = determineMoveType("community1", "p2_seat1", playerId);
      expect(result).toBe(DefinedMoveType.ASSIST);
    });

    it("should not identify ASSIST for community → own seat", () => {
      const result = determineMoveType("community1", "p1_seat1", playerId);
      expect(result).not.toBe(DefinedMoveType.ASSIST);
    });
  });

  describe("ADVANCE moves", () => {
    it("should identify ADVANCE: community → own seat", () => {
      const result = determineMoveType("community1", "p1_seat1", playerId);
      expect(result).toBe(DefinedMoveType.ADVANCE);
    });

    it("should identify ADVANCE: own seat → own rostrum", () => {
      const result = determineMoveType("p1_seat1", "p1_rostrum1", playerId);
      expect(result).toBe(DefinedMoveType.ADVANCE);
    });

    it("should identify ADVANCE: own rostrum1 → own office", () => {
      const result = determineMoveType("p1_rostrum1", "p1_office", playerId);
      expect(result).toBe(DefinedMoveType.ADVANCE);
    });

    it("should not identify ADVANCE from rostrum2 → office", () => {
      const result = determineMoveType("p1_rostrum2", "p1_office", playerId);
      expect(result).not.toBe(DefinedMoveType.ADVANCE);
    });
  });

  describe("WITHDRAW moves", () => {
    it("should identify WITHDRAW: own rostrum → own seat", () => {
      const result = determineMoveType("p1_rostrum1", "p1_seat1", playerId);
      expect(result).toBe(DefinedMoveType.WITHDRAW);
    });

    it("should not identify WITHDRAW for opponent rostrum → own seat", () => {
      const result = determineMoveType("p2_rostrum1", "p1_seat1", playerId);
      expect(result).not.toBe(DefinedMoveType.WITHDRAW);
    });
  });

  describe("ORGANIZE moves", () => {
    it("should identify ORGANIZE: own rostrum → own rostrum", () => {
      const result = determineMoveType("p1_rostrum1", "p1_rostrum2", playerId);
      expect(result).toBe(DefinedMoveType.ORGANIZE);
    });

    it("should identify ORGANIZE: own seat → own seat", () => {
      const result = determineMoveType("p1_seat1", "p1_seat2", playerId);
      expect(result).toBe(DefinedMoveType.ORGANIZE);
    });
  });

  describe("Edge cases", () => {
    it("should return null for undefined fromLocationId", () => {
      const result = determineMoveType(undefined, "p1_seat1", playerId);
      expect(result).toBeNull();
    });

    it("should return null for undefined toLocationId", () => {
      const result = determineMoveType("p1_seat1", undefined, playerId);
      expect(result).toBeNull();
    });

    it("should return null for unrecognized move pattern", () => {
      const result = determineMoveType("p1_office", "p2_office", playerId);
      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// validatePurchasedMove Tests
// ============================================================================

describe("validatePurchasedMove", () => {
  const playerId = 1;
  const playerCount = 3;

  // Helper to create a basic piece
  function createPiece(
    id: string,
    locationId: string,
    name: string = "Mark"
  ): Piece {
    return {
      id,
      name,
      locationId,
      position: { left: 50, top: 50 },
      rotation: 0,
      imageUrl: "",
    };
  }

  // Helper to create a tracked move
  function createTrackedMove(
    pieceId: string,
    fromLocationId: string,
    toLocationId: string,
    moveType: DefinedMoveType,
    category: "M" | "O" = "M"
  ): TrackedMove {
    return {
      pieceId,
      fromLocationId,
      toLocationId,
      moveType,
      category,
      fromPosition: { left: 50, top: 50 },
      toPosition: { left: 50, top: 50 },
      timestamp: Date.now(),
    };
  }

  describe("Basic validation", () => {
    it("should fail when no moves performed", () => {
      const result = validatePurchasedMove(
        "ADVANCE",
        [],
        playerId,
        [],
        playerCount
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("No moves were performed");
    });

    it("should fail for unknown move type", () => {
      const moves: TrackedMove[] = [
        createTrackedMove(
          "p1",
          "community1",
          "p1_seat1",
          DefinedMoveType.ADVANCE,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "INVALID" as BureaucracyMoveType,
        moves,
        playerId,
        [],
        playerCount
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Unknown move type");
    });
  });

  describe("ADVANCE move validation", () => {
    it("should validate ADVANCE move: community → own seat", () => {
      // Setup: Mark in a seat (allows community moves), heel in community can move to vacant seat
      const pieces: Piece[] = [
        createPiece("mark1", "p1_seat1"), // Mark in seat (enables community movement)
        createPiece("heel1", "community1"), // Heel in community (ready to move)
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "heel1",
          "community1",
          "p1_seat2",
          DefinedMoveType.ADVANCE,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "ADVANCE",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });

    it("should fail when expected ADVANCE move not found", () => {
      const moves: TrackedMove[] = [
        createTrackedMove(
          "p1",
          "p1_seat1",
          "p1_seat2",
          DefinedMoveType.ORGANIZE,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "ADVANCE",
        moves,
        playerId,
        [],
        playerCount
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Expected a ADVANCE move, but none was found");
    });
  });

  describe("WITHDRAW move validation", () => {
    it("should validate WITHDRAW move: own rostrum → own seat", () => {
      // Rostrum1 can withdraw to vacant seats 1, 2, or 3
      const pieces: Piece[] = [
        createPiece("piece_rostrum", "p1_rostrum1"), // Piece in rostrum
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "piece_rostrum",
          "p1_rostrum1",
          "p1_seat1", // Seat 1 is vacant
          DefinedMoveType.WITHDRAW,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "WITHDRAW",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("ORGANIZE move validation", () => {
    it("should validate ORGANIZE move: own seat → adjacent seat", () => {
      // For seat-to-seat ORGANIZE, target must be vacant and seats must be adjacent
      const pieces: Piece[] = [
        createPiece("piece1", "p1_seat1"), // Piece in seat 1
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "piece1",
          "p1_seat1",
          "p1_seat2", // Seat 2 is vacant and adjacent to seat 1
          DefinedMoveType.ORGANIZE,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "ORGANIZE",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("ASSIST move validation", () => {
    it("should validate ASSIST move: community → opponent seat", () => {
      // ASSIST requires: mark in seat (enables community movement), vacant opponent seat
      const pieces: Piece[] = [
        createPiece("mark1", "p1_seat1"), // Mark in player 1's seat (enables community movement)
        createPiece("heel1", "community1"), // Heel in community
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "heel1",
          "community1",
          "p2_seat1", // Move to player 2's seat (opponent)
          DefinedMoveType.ASSIST,
          "O"
        ),
      ];
      const result = validatePurchasedMove(
        "ASSIST",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("REMOVE move validation", () => {
    it("should validate REMOVE move: opponent seat → community", () => {
      const pieces: Piece[] = [
        createPiece("p1", "community1"),
        createPiece("p2", "p2_seat1"),
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "p2",
          "p2_seat1",
          "community1",
          DefinedMoveType.REMOVE,
          "O"
        ),
      ];
      const result = validatePurchasedMove(
        "REMOVE",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("INFLUENCE move validation", () => {
    it("should validate INFLUENCE move: opponent rostrum → own rostrum", () => {
      // INFLUENCE requires moving from adjacent opponent rostrum to vacant own rostrum
      // For 3-player game: p2_rostrum1 is adjacent to p1_rostrum2
      const pieces: Piece[] = [
        createPiece("opp_piece", "p2_rostrum1"), // Piece in opponent (p2) rostrum1
      ];
      const moves: TrackedMove[] = [
        createTrackedMove(
          "opp_piece",
          "p2_rostrum1", // From opponent rostrum1
          "p1_rostrum2", // To own rostrum2 (adjacent and vacant)
          DefinedMoveType.INFLUENCE,
          "M"
        ),
      ];
      const result = validatePurchasedMove(
        "INFLUENCE",
        moves,
        playerId,
        pieces,
        playerCount
      );
      expect(result.isValid).toBe(true);
    });
  });
});
