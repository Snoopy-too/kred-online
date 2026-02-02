/**
 * Complex validation logic for tile play and move validation.
 *
 * This module contains higher-level validation functions that orchestrate
 * the validation of moves and tile requirements. These functions use the
 * specific move validators from the rules/move-validation module.
 *
 * Official Manual Reference: https://flyingdutchmen.online/KRED/manual
 * - Tile play constraints (page 6, "During Tile Play")
 * - Move requirements and validation (page 7-8)
 * - Impossible move exceptions (page 8, "Rejection")
 */

import { DefinedMoveType } from "../types/move";
import type { TrackedMove, Piece, Player } from "../types";
import { getTileRequirements } from "./tile-validation";
import {
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
} from "../rules/move-validation";

/**
 * Validates the collection of moves performed during a tile play.
 *
 * Rules (Official Manual, page 6):
 * - Maximum 2 moves per tile play
 * - Cannot perform 2 actions of the same category (O or M)
 *
 * @param movesPerformed Array of moves performed during tile play
 * @returns Validation result with error message if invalid
 */
export function validateMovesForTilePlay(movesPerformed: TrackedMove[]): {
  isValid: boolean;
  error?: string;
} {
  console.log("=== validateMovesForTilePlay ===");
  console.log("Total moves:", movesPerformed.length);
  console.log(
    "Moves:",
    movesPerformed.map((m) => ({ moveType: m.moveType, category: m.category }))
  );

  if (movesPerformed.length > 2) {
    console.log("VALIDATION FAILED: More than 2 moves");
    return { isValid: false, error: "Maximum 2 moves allowed per tile play" };
  }

  const oMoveCount = movesPerformed.filter((m) => m.category === "O").length;
  const mMoveCount = movesPerformed.filter((m) => m.category === "M").length;

  console.log("O-moves count:", oMoveCount);
  console.log("M-moves count:", mMoveCount);

  if (oMoveCount > 1) {
    console.log("VALIDATION FAILED: More than 1 O-move");
    return {
      isValid: false,
      error: "You may NOT perform 2 actions of the same category",
    };
  }

  if (mMoveCount > 1) {
    console.log("VALIDATION FAILED: More than 1 M-move");
    return {
      isValid: false,
      error: "You may NOT perform 2 actions of the same category",
    };
  }

  console.log("VALIDATION PASSED");
  return { isValid: true };
}

/**
 * Checks if all required moves for a tile have been performed.
 *
 * Official Manual (page 7-8):
 * - Each tile specifies required move types
 * - All requirements must be met (unless impossible, see exception validator)
 * - Tile 00 (BLANK) has no requirements
 *
 * @param tileId The tile ID (e.g., "03", "07")
 * @param movesPerformed Array of moves performed
 * @returns Object indicating if requirements are met and which moves are missing
 */
export function validateTileRequirements(
  tileId: string,
  movesPerformed: TrackedMove[]
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);

  // Handle tiles with no requirements (null or empty array)
  if (!requirements || requirements.requiredMoves.length === 0) {
    return {
      isMet: true,
      requiredMoves: [],
      performedMoves: movesPerformed.map((m) => m.moveType),
      missingMoves: [],
    };
  }

  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  const missingMoves = requirements.requiredMoves.filter(
    (required) => !performedMoveTypes.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves: requirements.requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves: missingMoves,
  };
}

/**
 * Validates tile requirements considering impossible moves.
 *
 * Official Manual (page 8, "Rejection"):
 * "If the board state makes a required move impossible to execute,
 * that requirement is automatically considered fulfilled."
 *
 * Impossible move scenarios:
 * - WITHDRAW: Player's domain is completely empty (no pieces in seats/rostrums/office)
 * - ASSIST: All opponent seats are full (no vacant seats to assist into)
 *
 * @param tileId The tile ID
 * @param movesPerformed Moves performed during tile play
 * @param tilePlayerId ID of player who played the tile
 * @param piecesAtTurnStart Board state at start of turn (before any moves)
 * @param currentPieces Current board state (after moves)
 * @param allPlayers All players in the game
 * @param playerCount Total number of players
 * @returns Validation result with impossible moves identified
 */
export function validateTileRequirementsWithImpossibleMoveExceptions(
  tileId: string,
  movesPerformed: TrackedMove[],
  tilePlayerId: number,
  piecesAtTurnStart: Piece[],
  currentPieces: Piece[],
  allPlayers: Player[],
  playerCount: number
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
  impossibleMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);

  // Handle tiles with no requirements (null or empty array)
  if (!requirements || requirements.requiredMoves.length === 0) {
    return {
      isMet: true,
      requiredMoves: [],
      performedMoves: movesPerformed.map((m) => m.moveType),
      missingMoves: [],
      impossibleMoves: [],
    };
  }

  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  // Check which moves are actually impossible
  const impossibleMoves: DefinedMoveType[] = [];

  // Check for WITHDRAW impossibility: domain empty at turn start
  if (requirements.requiredMoves.includes(DefinedMoveType.WITHDRAW)) {
    const domainWasEmptyAtTurnStart = piecesAtTurnStart.every((p) => {
      if (!p.locationId) return true;
      const locationPrefix = `p${tilePlayerId}_`;
      return !p.locationId.startsWith(locationPrefix);
    });

    if (
      domainWasEmptyAtTurnStart &&
      !performedMoveTypes.includes(DefinedMoveType.WITHDRAW)
    ) {
      impossibleMoves.push(DefinedMoveType.WITHDRAW);
    }
  }

  // Check for ASSIST impossibility: all opponent seats are full
  if (requirements.requiredMoves.includes(DefinedMoveType.ASSIST)) {
    let allOpponentSeatsAreFull = true;

    // Check each opponent's seats
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== tilePlayerId) {
        // Count vacant seats for this opponent
        const opponentSeats = currentPieces.filter(
          (p) =>
            p.locationId && p.locationId.includes(`p${otherPlayer.id}_seat`)
        );
        const maxSeats = 6; // Assuming 6 seats per player

        if (opponentSeats.length < maxSeats) {
          allOpponentSeatsAreFull = false;
          break;
        }
      }
    }

    if (
      allOpponentSeatsAreFull &&
      !performedMoveTypes.includes(DefinedMoveType.ASSIST)
    ) {
      impossibleMoves.push(DefinedMoveType.ASSIST);
    }
  }

  // Calculate missing moves, excluding impossible ones
  const missingMoves = requirements.requiredMoves.filter(
    (required) =>
      !performedMoveTypes.includes(required) &&
      !impossibleMoves.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves: requirements.requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves: missingMoves,
    impossibleMoves: impossibleMoves,
  };
}

/**
 * Validates a single move based on its type and game state.
 *
 * This is a dispatcher function that routes to the appropriate
 * specific move validator based on the move type.
 *
 * @param move The move to validate
 * @param playerId ID of player performing the move
 * @param pieces Current board state
 * @param playerCount Total number of players
 * @returns Validation result with reason
 */
export function validateSingleMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): {
  isValid: boolean;
  reason: string;
} {
  switch (move.moveType) {
    case DefinedMoveType.ADVANCE:
      return {
        isValid: validateAdvanceMove(move, playerId, pieces),
        reason:
          "This ADVANCE move is not available until support seats/rostrums are full",
      };

    case DefinedMoveType.WITHDRAW:
      return {
        isValid: validateWithdrawMove(move, playerId, pieces),
        reason: "WITHDRAW move validation",
      };

    case DefinedMoveType.REMOVE:
      return {
        isValid: validateRemoveMove(move, playerId, pieces, playerCount),
        reason: "REMOVE move validation",
      };

    case DefinedMoveType.INFLUENCE:
      return {
        isValid: validateInfluenceMove(move, playerId, pieces, playerCount),
        reason: "INFLUENCE move validation",
      };

    case DefinedMoveType.ASSIST:
      return {
        isValid: validateAssistMove(move, playerId, pieces, playerCount),
        reason: "ASSIST move validation",
      };

    case DefinedMoveType.ORGANIZE:
      return {
        isValid: validateOrganizeMove(move, playerId, pieces),
        reason: "ORGANIZE move validation",
      };

    default:
      return {
        isValid: false,
        reason: "Unknown move type",
      };
  }
}
