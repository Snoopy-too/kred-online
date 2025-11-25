/**
 * Move Type Utilities
 *
 * Handles move type determination and validation for purchased bureaucracy moves.
 * These utilities help identify what kind of move is being performed based on
 * source and destination locations, and validate that purchased moves in the
 * bureaucracy phase were executed correctly.
 */

import type { TrackedMove, Piece, BureaucracyMoveType } from "../types";
import { DefinedMoveType } from "../types";
import { validateSingleMove } from "./validation";

/**
 * Determines the move type based on from/to locations
 *
 * Analyzes the source and destination location IDs to identify which type of
 * move is being performed. This is used to categorize moves and validate them
 * against game rules.
 *
 * @param fromLocationId - Source location ID (e.g., "community1", "p1_seat1")
 * @param toLocationId - Destination location ID
 * @param playerId - ID of the player performing the move
 * @returns The determined move type, or null if pattern doesn't match any move
 */
export function determineMoveType(
  fromLocationId: string | undefined,
  toLocationId: string | undefined,
  playerId: number
): DefinedMoveType | null {
  if (!fromLocationId || !toLocationId) return null;

  // REMOVE: opponent's seat -> community
  if (
    fromLocationId.includes("_seat") &&
    !fromLocationId.includes(`p${playerId}_`) &&
    toLocationId.includes("community")
  ) {
    return DefinedMoveType.REMOVE;
  }

  // INFLUENCE: opponent's rostrum -> own rostrum
  if (
    fromLocationId.includes("_rostrum") &&
    !fromLocationId.includes(`p${playerId}_`) &&
    toLocationId.includes(`p${playerId}_rostrum`)
  ) {
    return DefinedMoveType.INFLUENCE;
  }

  // ASSIST: community -> opponent's seat
  if (
    fromLocationId.includes("community") &&
    toLocationId.includes("_seat") &&
    !toLocationId.includes(`p${playerId}_`)
  ) {
    return DefinedMoveType.ASSIST;
  }

  // ADVANCE has multiple options:
  // A: community -> own seat
  // B: own seat -> own rostrum
  // C: own rostrum1 -> own office
  if (
    (fromLocationId.includes("community") &&
      toLocationId.includes(`p${playerId}_seat`)) ||
    (fromLocationId.includes(`p${playerId}_seat`) &&
      toLocationId.includes(`p${playerId}_rostrum`)) ||
    (fromLocationId === `p${playerId}_rostrum1` &&
      toLocationId === `p${playerId}_office`)
  ) {
    return DefinedMoveType.ADVANCE;
  }

  // WITHDRAW: rostrum -> seat (own)
  if (
    fromLocationId.includes(`p${playerId}_rostrum`) &&
    toLocationId.includes(`p${playerId}_seat`)
  ) {
    return DefinedMoveType.WITHDRAW;
  }

  // ORGANIZE: rostrum -> adjacent rostrum (own), or seat -> adjacent seat (own)
  if (
    (fromLocationId.includes(`p${playerId}_rostrum`) &&
      toLocationId.includes(`p${playerId}_rostrum`)) ||
    (fromLocationId.includes(`p${playerId}_seat`) &&
      toLocationId.includes(`p${playerId}_seat`))
  ) {
    return DefinedMoveType.ORGANIZE;
  }

  return null;
}

/**
 * Validates that purchased moves were performed correctly
 *
 * In the bureaucracy phase, players purchase specific move types (ADVANCE, WITHDRAW, etc.)
 * and must execute at least one move of that type. This function verifies that:
 * 1. At least one move was made
 * 2. At least one move matches the purchased type
 * 3. All moves of the purchased type are valid according to game rules
 *
 * @param moveType - The type of move that was purchased
 * @param trackedMoves - Array of moves that were performed
 * @param playerId - ID of the player who made the purchase
 * @param pieces - Current state of all pieces on the board
 * @param playerCount - Number of players in the game
 * @returns Object with isValid flag and reason string
 */
export function validatePurchasedMove(
  moveType: BureaucracyMoveType,
  trackedMoves: TrackedMove[],
  playerId: number,
  pieces: Piece[],
  playerCount: number
): { isValid: boolean; reason: string } {
  if (trackedMoves.length === 0) {
    return { isValid: false, reason: "No moves were performed" };
  }

  // Map bureaucracy move types to defined move types
  let expectedMoveType: DefinedMoveType;
  switch (moveType) {
    case "ADVANCE":
      expectedMoveType = DefinedMoveType.ADVANCE;
      break;
    case "WITHDRAW":
      expectedMoveType = DefinedMoveType.WITHDRAW;
      break;
    case "ORGANIZE":
      expectedMoveType = DefinedMoveType.ORGANIZE;
      break;
    case "ASSIST":
      expectedMoveType = DefinedMoveType.ASSIST;
      break;
    case "REMOVE":
      expectedMoveType = DefinedMoveType.REMOVE;
      break;
    case "INFLUENCE":
      expectedMoveType = DefinedMoveType.INFLUENCE;
      break;
    default:
      return { isValid: false, reason: "Unknown move type" };
  }

  // Check if at least one move matches the expected type
  const hasMatchingMove = trackedMoves.some(
    (move) => move.moveType === expectedMoveType
  );

  if (!hasMatchingMove) {
    return {
      isValid: false,
      reason: `Expected a ${moveType} move, but none was found`,
    };
  }

  // Validate each move using the same logic as Campaign mode
  for (const move of trackedMoves) {
    if (move.moveType === expectedMoveType) {
      const validation = validateSingleMove(
        move,
        playerId,
        pieces,
        playerCount
      );
      if (!validation.isValid) {
        return { isValid: false, reason: validation.reason };
      }
    }
  }

  return { isValid: true, reason: "Valid move" };
}
