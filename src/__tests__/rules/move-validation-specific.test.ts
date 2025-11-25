/**
 * Tests for specific move type validation functions
 *
 * These validators check if individual move types (ADVANCE, WITHDRAW, REMOVE, etc.)
 * are legal given the current board state. They are used to validate moves during
 * gameplay and to determine if impossible board states forgive tile requirements.
 */

import { describe, it, expect } from "vitest";
import { DefinedMoveType } from "../../types";
import type { TrackedMove, Piece } from "../../types";
import {
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
} from "../../rules/move-validation";

// Helper to create a basic tracked move
function createMove(
  fromLocationId: string | null,
  toLocationId: string,
  pieceId: string,
  moveType: DefinedMoveType
): TrackedMove {
  return {
    pieceId,
    fromLocationId: fromLocationId || undefined,
    toLocationId,
    moveType,
    category: "M",
    fromPosition: { top: 0, left: 0 },
    toPosition: { top: 0, left: 0 },
    timestamp: Date.now(),
  };
}

// Helper to create a piece
function createPiece(
  id: string,
  locationId: string,
  name: string = "Mark"
): Piece {
  return {
    id,
    name,
    locationId,
    position: { left: 0, top: 0 },
    imageUrl: "/test.svg",
    rotation: 0,
  };
}

describe("Specific Move Type Validation", () => {
  describe("validateAdvanceMove", () => {
    it("validates community to vacant seat", () => {
      const move = createMove(
        "community1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [createPiece("piece1", "community1", "Mark")];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(true);
    });

    it("rejects community to occupied seat", () => {
      const move = createMove(
        "community1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "community1", "Mark"),
        createPiece("piece2", "p1_seat1", "Mark"),
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(false);
    });

    it("validates seat to rostrum1 when all seats 1-3 occupied", () => {
      const move = createMove(
        "p1_seat1",
        "p1_rostrum1",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_seat1", "Mark"),
        createPiece("piece2", "p1_seat2", "Mark"),
        createPiece("piece3", "p1_seat3", "Mark"),
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(true);
    });

    it("rejects seat to rostrum1 when not all seats 1-3 occupied", () => {
      const move = createMove(
        "p1_seat1",
        "p1_rostrum1",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_seat1", "Mark"),
        createPiece("piece2", "p1_seat2", "Mark"),
        // seat3 empty
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(false);
    });

    it("validates seat to rostrum2 when all seats 4-6 occupied", () => {
      const move = createMove(
        "p1_seat4",
        "p1_rostrum2",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_seat4", "Mark"),
        createPiece("piece2", "p1_seat5", "Mark"),
        createPiece("piece3", "p1_seat6", "Mark"),
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(true);
    });

    it("validates rostrum1 to office when both rostrums occupied", () => {
      const move = createMove(
        "p1_rostrum1",
        "p1_office",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_rostrum1", "Heel"),
        createPiece("piece2", "p1_rostrum2", "Heel"),
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(true);
    });

    it("rejects rostrum to office when only one rostrum occupied", () => {
      const move = createMove(
        "p1_rostrum1",
        "p1_office",
        "piece1",
        DefinedMoveType.ADVANCE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_rostrum1", "Heel"),
        // rostrum2 empty
      ];

      expect(validateAdvanceMove(move, 1, pieces)).toBe(false);
    });
  });

  describe("validateWithdrawMove", () => {
    it("validates seat to community", () => {
      const move = createMove(
        "p1_seat1",
        "community1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(true);
    });

    it("validates rostrum1 to vacant seat 1", () => {
      const move = createMove(
        "p1_rostrum1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_rostrum1", "Heel")];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(true);
    });

    it("rejects rostrum1 to occupied seat", () => {
      const move = createMove(
        "p1_rostrum1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_rostrum1", "Heel"),
        createPiece("piece2", "p1_seat1", "Mark"),
      ];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(false);
    });

    it("validates rostrum2 to vacant seat 4", () => {
      const move = createMove(
        "p1_rostrum2",
        "p1_seat4",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_rostrum2", "Heel")];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(true);
    });

    it("validates office to vacant rostrum", () => {
      const move = createMove(
        "p1_office",
        "p1_rostrum1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_office", "Pawn")];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(true);
    });

    it("rejects office to occupied rostrum", () => {
      const move = createMove(
        "p1_office",
        "p1_rostrum1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_office", "Pawn"),
        createPiece("piece2", "p1_rostrum1", "Heel"),
      ];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(false);
    });

    it("rejects move with missing from or to location", () => {
      const move = createMove(
        null,
        "community1",
        "piece1",
        DefinedMoveType.WITHDRAW
      );
      const pieces: Piece[] = [];

      expect(validateWithdrawMove(move, 1, pieces)).toBe(false);
    });
  });

  describe("validateRemoveMove", () => {
    it("validates removing Mark from opponent seat to community", () => {
      const move = createMove(
        "p2_seat1",
        "community1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Mark")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(true);
    });

    it("validates removing Heel from opponent seat to community", () => {
      const move = createMove(
        "p2_seat1",
        "community1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Heel")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(true);
    });

    it("rejects removing from own seat", () => {
      const move = createMove(
        "p1_seat1",
        "community1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects removing Pawn", () => {
      const move = createMove(
        "p2_seat1",
        "community1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Pawn")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects removing to non-community location", () => {
      const move = createMove(
        "p2_seat1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Mark")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects removing from non-seat location", () => {
      const move = createMove(
        "p2_rostrum1",
        "community1",
        "piece1",
        DefinedMoveType.REMOVE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_rostrum1", "Heel")];

      expect(validateRemoveMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe("validateInfluenceMove", () => {
    it("validates moving opponent piece to adjacent seat", () => {
      const move = createMove(
        "p2_seat1",
        "p2_seat2",
        "piece1",
        DefinedMoveType.INFLUENCE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Mark")];

      expect(validateInfluenceMove(move, 1, pieces, 3)).toBe(true);
    });

    it("rejects influencing own piece", () => {
      const move = createMove(
        "p1_seat1",
        "p1_seat2",
        "piece1",
        DefinedMoveType.INFLUENCE
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateInfluenceMove(move, 1, pieces, 3)).toBe(false);
    });

    it("validates moving opponent piece from rostrum to adjacent rostrum", () => {
      const move = createMove(
        "p2_rostrum1",
        "p2_rostrum2",
        "piece1",
        DefinedMoveType.INFLUENCE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_rostrum1", "Heel")];

      expect(validateInfluenceMove(move, 1, pieces, 3)).toBe(true);
    });

    it("rejects influencing piece from rostrum1 to non-adjacent rostrum", () => {
      const move = createMove(
        "p2_rostrum1",
        "p3_rostrum1",
        "piece1",
        DefinedMoveType.INFLUENCE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_rostrum1", "Heel")];

      expect(validateInfluenceMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects move with missing from or to location", () => {
      const move = createMove(
        null,
        "p2_seat2",
        "piece1",
        DefinedMoveType.INFLUENCE
      );
      const pieces: Piece[] = [];

      expect(validateInfluenceMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe("validateAssistMove", () => {
    it("validates adding piece from community to opponent vacant seat", () => {
      const move = createMove(
        "community1",
        "p2_seat1",
        "piece1",
        DefinedMoveType.ASSIST
      );
      const pieces: Piece[] = [createPiece("piece1", "community1", "Mark")];

      expect(validateAssistMove(move, 1, pieces, 3)).toBe(true);
    });

    it("rejects assisting to own seat", () => {
      const move = createMove(
        "community1",
        "p1_seat1",
        "piece1",
        DefinedMoveType.ASSIST
      );
      const pieces: Piece[] = [createPiece("piece1", "community1", "Mark")];

      expect(validateAssistMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects assisting to occupied seat", () => {
      const move = createMove(
        "community1",
        "p2_seat1",
        "piece1",
        DefinedMoveType.ASSIST
      );
      const pieces: Piece[] = [
        createPiece("piece1", "community1", "Mark"),
        createPiece("piece2", "p2_seat1", "Mark"),
      ];

      expect(validateAssistMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects assisting from non-community location", () => {
      const move = createMove(
        "p1_seat1",
        "p2_seat1",
        "piece1",
        DefinedMoveType.ASSIST
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateAssistMove(move, 1, pieces, 3)).toBe(false);
    });

    it("rejects assisting to invalid player seat", () => {
      const move = createMove(
        "community1",
        "p5_seat1",
        "piece1",
        DefinedMoveType.ASSIST
      );
      const pieces: Piece[] = [createPiece("piece1", "community1", "Mark")];

      expect(validateAssistMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe("validateOrganizeMove", () => {
    it("validates moving own piece to adjacent seat", () => {
      const move = createMove(
        "p1_seat1",
        "p1_seat2",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(true);
    });

    it("validates moving own piece to adjacent opponent seat", () => {
      const move = createMove(
        "p1_seat1",
        "p2_seat1",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_seat1", "Mark")];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(true);
    });

    it("rejects organizing opponent piece", () => {
      const move = createMove(
        "p2_seat1",
        "p2_seat2",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_seat1", "Mark")];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(false);
    });

    it("rejects organizing to occupied seat", () => {
      const move = createMove(
        "p1_seat1",
        "p1_seat2",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [
        createPiece("piece1", "p1_seat1", "Mark"),
        createPiece("piece2", "p1_seat2", "Mark"),
      ];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(false);
    });

    it("validates moving own piece from rostrum to adjacent rostrum", () => {
      const move = createMove(
        "p1_rostrum1",
        "p1_rostrum2",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [createPiece("piece1", "p1_rostrum1", "Heel")];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(true);
    });

    it("rejects organizing from opponent rostrum", () => {
      const move = createMove(
        "p2_rostrum1",
        "p2_rostrum2",
        "piece1",
        DefinedMoveType.ORGANIZE
      );
      const pieces: Piece[] = [createPiece("piece1", "p2_rostrum1", "Heel")];

      expect(validateOrganizeMove(move, 1, pieces)).toBe(false);
    });
  });
});
