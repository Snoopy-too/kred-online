/**
 * Tests for movement validation rules
 */

import { describe, it, expect } from "vitest";
import type { Piece } from "../../types";
import { validatePieceMovement, validateMoveType } from "../../../game";

describe("validatePieceMovement", () => {
  describe("community locations", () => {
    it("allows moves to community locations", () => {
      const result = validatePieceMovement(
        "piece1",
        "p1_seat1",
        "community",
        1,
        []
      );
      expect(result.isAllowed).toBe(true);
      expect(result.reason).toBe("Community spaces are always accessible");
    });
  });

  describe("rostrum movements", () => {
    it("allows move to own rostrum when supporting seats are full", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
        { id: "p2", locationId: "p1_seat2", position: { top: 0, left: 0 } } as Piece,
        { id: "p3", locationId: "p1_seat3", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "community",
        "p1_rostrum1",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toBe("All supporting seats are full");
    });

    it("blocks move to own rostrum when supporting seats not full", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p1_seat1", position: { top: 0, left: 0 } } as Piece,
        { id: "p2", locationId: "p1_seat2", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "community",
        "p1_rostrum1",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain("only 2/3 supporting seats are full");
    });

    it("blocks move to opponent rostrum", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p2_seat1", position: { top: 0, left: 0 } } as Piece,
        { id: "p2", locationId: "p2_seat2", position: { top: 0, left: 0 } } as Piece,
        { id: "p3", locationId: "p2_seat3", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "community",
        "p2_rostrum1",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toBe("Cannot move a piece to opponent's rostrum");
    });
  });

  describe("office movements", () => {
    it("allows move to own office when both rostrums are filled", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p1_rostrum1", position: { top: 0, left: 0 } } as Piece,
        { id: "p2", locationId: "p1_rostrum2", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "p1_rostrum1",
        "p1_office",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toBe("Both rostrums are filled");
    });

    it("blocks move to own office when rostrums not both filled", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p1_rostrum1", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "p1_rostrum1",
        "p1_office",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toBe(
        "Cannot move to office - not both rostrums are filled yet"
      );
    });

    it("blocks move to opponent office", () => {
      const pieces: Piece[] = [
        { id: "p1", locationId: "p2_rostrum1", position: { top: 0, left: 0 } } as Piece,
        { id: "p2", locationId: "p2_rostrum2", position: { top: 0, left: 0 } } as Piece,
      ];

      const result = validatePieceMovement(
        "piece1",
        "community",
        "p2_office",
        1,
        pieces
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toBe("Cannot move a piece to opponent's office");
    });
  });

  describe("hierarchy movement restrictions", () => {
    it("blocks opponent hierarchy movements (seat to rostrum)", () => {
      const result = validatePieceMovement(
        "piece1",
        "p2_seat1",
        "p2_rostrum1",
        1,
        []
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain(
        "Cannot move opponent's piece between hierarchy levels"
      );
    });

    it("blocks own lateral rostrum movements", () => {
      const result = validatePieceMovement(
        "piece1",
        "p1_rostrum1",
        "p1_rostrum2",
        1,
        []
      );

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain(
        "Cannot move piece between your own rostrums"
      );
    });
  });
});

describe("validateMoveType", () => {
  const mockPiece: Piece = {
    id: "test",
    locationId: "community",
    position: { top: 0, left: 0 },
  } as Piece;

  describe("ADVANCE moves", () => {
    it("returns ADVANCE for community to own seat", () => {
      expect(
        validateMoveType("community", "p1_seat1", 1, mockPiece, [], 3)
      ).toBe("ADVANCE");
    });

    it("returns ADVANCE for community to own rostrum", () => {
      expect(
        validateMoveType("community", "p1_rostrum1", 1, mockPiece, [], 3)
      ).toBe("ADVANCE");
    });

    it("returns ADVANCE for seat to rostrum", () => {
      expect(
        validateMoveType("p1_seat1", "p1_rostrum1", 1, mockPiece, [], 3)
      ).toBe("ADVANCE");
    });

    it("returns ADVANCE for rostrum to office", () => {
      expect(
        validateMoveType("p1_rostrum1", "p1_office", 1, mockPiece, [], 3)
      ).toBe("ADVANCE");
    });
  });

  describe("ASSIST moves", () => {
    it("returns ASSIST for community to opponent seat", () => {
      expect(
        validateMoveType("community", "p2_seat1", 1, mockPiece, [], 3)
      ).toBe("ASSIST");
    });

    it("returns ASSIST for community to opponent rostrum", () => {
      expect(
        validateMoveType("community", "p2_rostrum1", 1, mockPiece, [], 3)
      ).toBe("ASSIST");
    });
  });

  describe("WITHDRAW moves", () => {
    it("returns WITHDRAW for seat to community", () => {
      expect(
        validateMoveType("p1_seat1", "community", 1, mockPiece, [], 3)
      ).toBe("WITHDRAW");
    });

    it("returns WITHDRAW for rostrum to seat", () => {
      expect(
        validateMoveType("p1_rostrum1", "p1_seat1", 1, mockPiece, [], 3)
      ).toBe("WITHDRAW");
    });

    it("returns WITHDRAW for rostrum to community", () => {
      expect(
        validateMoveType("p1_rostrum1", "community", 1, mockPiece, [], 3)
      ).toBe("WITHDRAW");
    });

    it("returns WITHDRAW for office to rostrum", () => {
      expect(
        validateMoveType("p1_office", "p1_rostrum1", 1, mockPiece, [], 3)
      ).toBe("WITHDRAW");
    });

    it("returns WITHDRAW for office to community", () => {
      expect(
        validateMoveType("p1_office", "community", 1, mockPiece, [], 3)
      ).toBe("WITHDRAW");
    });
  });

  describe("ORGANIZE moves", () => {
    it("returns ORGANIZE for adjacent own seats", () => {
      expect(
        validateMoveType("p1_seat1", "p1_seat2", 1, mockPiece, [], 3)
      ).toBe("ORGANIZE");
    });

    it("returns ORGANIZE for own rostrum to own rostrum", () => {
      expect(
        validateMoveType("p1_rostrum1", "p1_rostrum2", 1, mockPiece, [], 3)
      ).toBe("ORGANIZE");
    });
  });

  describe("INFLUENCE moves", () => {
    it("returns INFLUENCE for adjacent opponent seats", () => {
      expect(
        validateMoveType("p2_seat1", "p2_seat2", 1, mockPiece, [], 3)
      ).toBe("INFLUENCE");
    });

    it("returns INFLUENCE for opponent rostrum to opponent rostrum", () => {
      expect(
        validateMoveType("p2_rostrum1", "p2_rostrum2", 1, mockPiece, [], 3)
      ).toBe("INFLUENCE");
    });
  });

  describe("UNKNOWN/invalid moves", () => {
    it("returns UNKNOWN for non-adjacent seat moves", () => {
      expect(
        validateMoveType("p1_seat1", "p1_seat3", 1, mockPiece, [], 3)
      ).toBe("UNKNOWN");
    });

    it("returns UNKNOWN for undefined locations", () => {
      expect(
        validateMoveType(undefined, "p1_seat1", 1, mockPiece, [], 3)
      ).toBe("UNKNOWN");
      expect(
        validateMoveType("p1_seat1", undefined, 1, mockPiece, [], 3)
      ).toBe("UNKNOWN");
    });
  });
});
