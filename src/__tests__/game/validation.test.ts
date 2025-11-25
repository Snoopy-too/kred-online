import { describe, it, expect } from "vitest";
import {
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateSingleMove,
} from "../../game/validation";
import { DefinedMoveType } from "../../types/move";
import type { TrackedMove, Piece, Player } from "../../types";

// Helper to create test moves
function createMove(
  moveType: DefinedMoveType,
  category: "O" | "M",
  pieceId: string = "p1",
  fromLocationId: string = "p1_seat1",
  toLocationId: string = "p1_seat2"
): TrackedMove {
  return {
    pieceId,
    fromLocationId,
    toLocationId,
    moveType,
    category,
    fromPosition: { top: 0, left: 0 },
    toPosition: { top: 100, left: 100 },
    timestamp: Date.now(),
  };
}

// Helper to create test pieces
function createPiece(
  id: string,
  name: string,
  locationId: string | null
): Piece {
  return {
    id,
    name,
    imageUrl: `/images/${name.toLowerCase()}.png`,
    position: { top: 0, left: 0 },
    rotation: 0,
    locationId,
  };
}

// Helper to create test player
function createPlayer(id: number, bureaucracyTiles: any[] = []): Player {
  return {
    id,
    hand: [],
    keptTiles: [],
    bureaucracyTiles,
    credibility: 10,
  };
}

describe("validateMovesForTilePlay", () => {
  it("should allow 0 moves", () => {
    const result = validateMovesForTilePlay([]);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should allow 1 O-move", () => {
    const moves = [createMove(DefinedMoveType.ADVANCE, "O")];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(true);
  });

  it("should allow 1 M-move", () => {
    const moves = [createMove(DefinedMoveType.REMOVE, "M")];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(true);
  });

  it("should allow 1 O-move and 1 M-move", () => {
    const moves = [
      createMove(DefinedMoveType.ADVANCE, "O"),
      createMove(DefinedMoveType.REMOVE, "M"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(true);
  });

  it("should allow 2 moves of different categories", () => {
    const moves = [
      createMove(DefinedMoveType.WITHDRAW, "O"),
      createMove(DefinedMoveType.INFLUENCE, "M"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(true);
  });

  it("should reject 2 O-moves", () => {
    const moves = [
      createMove(DefinedMoveType.ADVANCE, "O"),
      createMove(DefinedMoveType.WITHDRAW, "O"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("same category");
  });

  it("should reject 2 M-moves", () => {
    const moves = [
      createMove(DefinedMoveType.REMOVE, "M"),
      createMove(DefinedMoveType.INFLUENCE, "M"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("same category");
  });

  it("should reject more than 2 moves", () => {
    const moves = [
      createMove(DefinedMoveType.ADVANCE, "O"),
      createMove(DefinedMoveType.REMOVE, "M"),
      createMove(DefinedMoveType.ORGANIZE, "O"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Maximum 2 moves");
  });

  it("should reject 3 moves even if categories are valid", () => {
    const moves = [
      createMove(DefinedMoveType.ADVANCE, "O"),
      createMove(DefinedMoveType.REMOVE, "M"),
      createMove(DefinedMoveType.ASSIST, "M"),
    ];
    const result = validateMovesForTilePlay(moves);
    expect(result.isValid).toBe(false);
  });
});

describe("validateTileRequirements", () => {
  it("should validate tile with no requirements (BLANK)", () => {
    const result = validateTileRequirements("00", []);
    expect(result.isMet).toBe(true);
    expect(result.requiredMoves).toEqual([]);
    expect(result.missingMoves).toEqual([]);
  });

  it("should validate tile 03 (INFLUENCE + ADVANCE required)", () => {
    const moves = [
      createMove(DefinedMoveType.INFLUENCE, "O"),
      createMove(DefinedMoveType.ADVANCE, "M"),
    ];
    const result = validateTileRequirements("03", moves);
    expect(result.isMet).toBe(true);
    expect(result.requiredMoves).toContain(DefinedMoveType.INFLUENCE);
    expect(result.requiredMoves).toContain(DefinedMoveType.ADVANCE);
    expect(result.missingMoves).toEqual([]);
  });

  it("should detect missing requirements for tile 03", () => {
    const result = validateTileRequirements("03", []);
    expect(result.isMet).toBe(false);
    expect(result.requiredMoves).toContain(DefinedMoveType.INFLUENCE);
    expect(result.requiredMoves).toContain(DefinedMoveType.ADVANCE);
    expect(result.missingMoves).toContain(DefinedMoveType.INFLUENCE);
    expect(result.missingMoves).toContain(DefinedMoveType.ADVANCE);
  });

  it("should validate tile 07 (ASSIST + ADVANCE required)", () => {
    const moves = [
      createMove(DefinedMoveType.ASSIST, "O"),
      createMove(DefinedMoveType.ADVANCE, "M"),
    ];
    const result = validateTileRequirements("07", moves);
    expect(result.isMet).toBe(true);
    expect(result.missingMoves).toEqual([]);
  });

  it("should detect missing ASSIST requirement for tile 07", () => {
    const moves = [createMove(DefinedMoveType.ADVANCE, "M")];
    const result = validateTileRequirements("07", moves);
    expect(result.isMet).toBe(false);
    expect(result.missingMoves).toContain(DefinedMoveType.ASSIST);
  });

  it("should validate tile with 2 requirements both met", () => {
    // Tile 03 requires INFLUENCE + ADVANCE
    const moves = [
      createMove(DefinedMoveType.INFLUENCE, "O"),
      createMove(DefinedMoveType.ADVANCE, "M"),
    ];
    const result = validateTileRequirements("03", moves);
    expect(result.isMet).toBe(true);
    expect(result.missingMoves).toEqual([]);
  });

  it("should detect partially met requirements (1 of 2)", () => {
    const moves = [createMove(DefinedMoveType.ADVANCE, "M")];
    const result = validateTileRequirements("03", moves);
    expect(result.isMet).toBe(false);
    expect(result.performedMoves).toEqual([DefinedMoveType.ADVANCE]);
    expect(result.missingMoves).toContain(DefinedMoveType.INFLUENCE);
  });

  it("should handle wrong move type performed", () => {
    const moves = [createMove(DefinedMoveType.REMOVE, "M")];
    const result = validateTileRequirements("05", moves);
    expect(result.isMet).toBe(false);
    expect(result.performedMoves).toEqual([DefinedMoveType.REMOVE]);
    expect(result.missingMoves).toContain(DefinedMoveType.ADVANCE);
  });
});

describe("validateTileRequirementsWithImpossibleMoveExceptions", () => {
  it("should validate normally when moves are possible and performed", () => {
    const pieces = [
      createPiece("p1", "Mark", "p1_seat1"),
      createPiece("p2", "Heel", "p2_seat2"),
    ];
    const players = [createPlayer(1), createPlayer(2)];

    const moves = [createMove(DefinedMoveType.ADVANCE, "M")];
    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "05", // Tile 05 requires only ADVANCE
      moves,
      1,
      pieces,
      pieces,
      players,
      2
    );

    expect(result.isMet).toBe(true);
    expect(result.impossibleMoves).toEqual([]);
  });

  it("should mark WITHDRAW as impossible when domain is empty at turn start", () => {
    const piecesAtStart = [
      createPiece("p1_mark1", "Mark", "community_1"),
      createPiece("p1_heel1", "Heel", "community_2"),
    ];
    const currentPieces = [...piecesAtStart];
    const players = [createPlayer(1), createPlayer(2)];

    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "21", // Tile 21 requires only WITHDRAW
      [],
      1,
      piecesAtStart,
      currentPieces,
      players,
      2
    );

    expect(result.isMet).toBe(true); // Should pass because WITHDRAW is impossible
    expect(result.impossibleMoves).toContain(DefinedMoveType.WITHDRAW);
    expect(result.missingMoves).toEqual([]);
  });

  it("should NOT mark WITHDRAW as impossible when domain has pieces", () => {
    const piecesAtStart = [
      createPiece("p1_mark1", "Mark", "p1_seat1"),
      createPiece("p1_heel1", "Heel", "community_1"),
    ];
    const currentPieces = [...piecesAtStart];
    const players = [createPlayer(1), createPlayer(2)];

    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "21", // Tile 21 requires only WITHDRAW
      [],
      1,
      piecesAtStart,
      currentPieces,
      players,
      2
    );

    expect(result.isMet).toBe(false); // Should fail because WITHDRAW is possible but not performed
    expect(result.impossibleMoves).toEqual([]);
    expect(result.missingMoves).toEqual([DefinedMoveType.WITHDRAW]);
  });

  it("should mark ASSIST as impossible when all opponent seats are full", () => {
    // Create scenario where all of player 2's seats are full (6 seats)
    const currentPieces = [
      createPiece("p2_m1", "Mark", "p2_seat1"),
      createPiece("p2_m2", "Mark", "p2_seat2"),
      createPiece("p2_m3", "Mark", "p2_seat3"),
      createPiece("p2_h1", "Heel", "p2_seat4"),
      createPiece("p2_h2", "Heel", "p2_seat5"),
      createPiece("p2_h3", "Heel", "p2_seat6"),
    ];
    const players = [createPlayer(1), createPlayer(2)];

    // Perform ADVANCE but not ASSIST
    const moves = [createMove(DefinedMoveType.ADVANCE, "M")];
    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "07", // Tile 07 requires ASSIST + ADVANCE
      moves,
      1,
      currentPieces,
      currentPieces,
      players,
      2
    );

    expect(result.isMet).toBe(true); // Should pass because ASSIST is impossible
    expect(result.impossibleMoves).toContain(DefinedMoveType.ASSIST);
  });

  it("should NOT mark ASSIST as impossible when opponent has vacant seats", () => {
    const currentPieces = [
      createPiece("p2_m1", "Mark", "p2_seat1"),
      createPiece("p2_m2", "Mark", "p2_seat2"),
      // Only 2 of 6 seats occupied
    ];
    const players = [createPlayer(1), createPlayer(2)];

    const moves = [createMove(DefinedMoveType.ADVANCE, "M")];
    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "07", // Tile 07 requires ASSIST + ADVANCE
      moves,
      1,
      currentPieces,
      currentPieces,
      players,
      2
    );

    expect(result.isMet).toBe(false); // Should fail because ASSIST is possible
    expect(result.impossibleMoves).toEqual([]);
    expect(result.missingMoves).toContain(DefinedMoveType.ASSIST);
  });

  it("should handle multiple impossible moves", () => {
    // Domain empty (WITHDRAW impossible) AND all opponent seats full (ASSIST impossible)
    const piecesAtStart = [
      createPiece("p1_m1", "Mark", "community_1"),
      createPiece("p2_m1", "Mark", "p2_seat1"),
      createPiece("p2_m2", "Mark", "p2_seat2"),
      createPiece("p2_m3", "Mark", "p2_seat3"),
      createPiece("p2_h1", "Heel", "p2_seat4"),
      createPiece("p2_h2", "Heel", "p2_seat5"),
      createPiece("p2_h3", "Heel", "p2_seat6"),
    ];
    const players = [createPlayer(1), createPlayer(2)];

    // Hypothetical tile requiring both WITHDRAW and ASSIST
    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "23", // Tile 23 requires WITHDRAW + ASSIST
      [],
      1,
      piecesAtStart,
      piecesAtStart,
      players,
      2
    );

    expect(result.isMet).toBe(true);
    expect(result.impossibleMoves).toContain(DefinedMoveType.WITHDRAW);
    expect(result.impossibleMoves).toContain(DefinedMoveType.ASSIST);
    expect(result.missingMoves).toEqual([]);
  });

  it("should not excuse missing moves if they were possible", () => {
    const pieces = [
      createPiece("p1_m1", "Mark", "p1_seat1"),
      createPiece("p2_m1", "Mark", "p2_seat1"),
    ];
    const players = [createPlayer(1), createPlayer(2)];

    const result = validateTileRequirementsWithImpossibleMoveExceptions(
      "21", // Tile 21 requires WITHDRAW
      [],
      1,
      pieces,
      pieces,
      players,
      2
    );

    expect(result.isMet).toBe(false);
    expect(result.impossibleMoves).toEqual([]);
    expect(result.missingMoves).toEqual([DefinedMoveType.WITHDRAW]);
  });
});

describe("validateSingleMove", () => {
  const pieces = [
    createPiece("p1_m1", "Mark", "p1_seat1"),
    createPiece("p1_m2", "Mark", "p1_seat2"),
    createPiece("p1_m3", "Mark", "p1_seat3"),
  ];

  it("should validate ADVANCE move", () => {
    const move = createMove(
      DefinedMoveType.ADVANCE,
      "O",
      "p1_m1",
      "p1_seat1",
      "p1_rostrum1"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
    expect(typeof result.isValid).toBe("boolean");
  });

  it("should validate WITHDRAW move", () => {
    const move = createMove(
      DefinedMoveType.WITHDRAW,
      "O",
      "p1_m1",
      "p1_seat1",
      "community_1"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
  });

  it("should validate REMOVE move", () => {
    const move = createMove(
      DefinedMoveType.REMOVE,
      "M",
      "p2_m1",
      "p2_seat1",
      "community_1"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
  });

  it("should validate INFLUENCE move", () => {
    const move = createMove(
      DefinedMoveType.INFLUENCE,
      "M",
      "p2_m1",
      "p2_seat1",
      "p2_seat2"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
  });

  it("should validate ASSIST move", () => {
    const move = createMove(
      DefinedMoveType.ASSIST,
      "M",
      "p1_h1",
      "community_1",
      "p2_seat1"
    );
    const result = validateSingleMove(move, 1, [], 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
  });

  it("should validate ORGANIZE move", () => {
    const move = createMove(
      DefinedMoveType.ORGANIZE,
      "O",
      "p1_m1",
      "p1_seat1",
      "p1_seat2"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result).toHaveProperty("isValid");
    expect(result).toHaveProperty("reason");
  });

  it("should return false for unknown move type", () => {
    const move = createMove(
      "UNKNOWN" as any,
      "O",
      "p1_m1",
      "p1_seat1",
      "p1_seat2"
    );
    const result = validateSingleMove(move, 1, pieces, 3);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("Unknown");
  });

  it("should include reason string for each move type", () => {
    const advanceMove = createMove(
      DefinedMoveType.ADVANCE,
      "O",
      "p1_m1",
      "p1_seat1",
      "p1_rostrum1"
    );
    const result = validateSingleMove(advanceMove, 1, pieces, 3);

    expect(typeof result.reason).toBe("string");
    expect(result.reason.length).toBeGreaterThan(0);
  });
});
