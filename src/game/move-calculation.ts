/**
 * Move Calculation Utilities
 *
 * Pure functions for calculating and comparing piece movements between game states.
 * These functions are used to determine what moves a player has made by comparing
 * the original piece positions to the current positions.
 */

import type { Piece, TrackedMove } from "../types";
import { DefinedMoveType } from "../types";

/**
 * Helper functions for location type detection
 */
const isCommunity = (loc?: string): boolean =>
  loc?.includes("community") ?? false;
const isSeat = (loc?: string): boolean => loc?.includes("_seat") ?? false;
const isRostrum = (loc?: string): boolean => loc?.includes("_rostrum") ?? false;
const isOffice = (loc?: string): boolean => loc?.includes("_office") ?? false;

/**
 * Extract player ID from a location string
 * @param loc - Location ID like "p1_seat1" or "p2_rostrum"
 * @returns Player ID number or null if not found
 */
const getPlayerFromLocation = (loc?: string): number | null => {
  const match = loc?.match(/p(\d+)_/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Determine if a move from one location to another should be counted as a game move
 */
function shouldCountMove(initialLocId?: string, finalLocId?: string): boolean {
  // Rule 1: Community → Seat/Rostrum/Office = COUNT
  if (
    isCommunity(initialLocId) &&
    (isSeat(finalLocId) || isRostrum(finalLocId) || isOffice(finalLocId))
  ) {
    return true;
  }
  // Rule 2: Seat → Community = COUNT
  if (isSeat(initialLocId) && isCommunity(finalLocId)) {
    return true;
  }
  // Rule 3: Seat → Seat = COUNT
  if (isSeat(initialLocId) && isSeat(finalLocId)) {
    return true;
  }
  // Rule 4: Seat → Rostrum = COUNT
  if (isSeat(initialLocId) && isRostrum(finalLocId)) {
    return true;
  }
  // Rule 5: Rostrum → Seat/Office = COUNT
  if (isRostrum(initialLocId) && (isSeat(finalLocId) || isOffice(finalLocId))) {
    return true;
  }
  // Rule 6: Office → Rostrum = COUNT
  if (isOffice(initialLocId) && isRostrum(finalLocId)) {
    return true;
  }
  // Rule 7: Rostrum → Community = COUNT (WITHDRAW)
  if (isRostrum(initialLocId) && isCommunity(finalLocId)) {
    return true;
  }
  // Rule 8: Rostrum → Rostrum = COUNT (ORGANIZE)
  if (isRostrum(initialLocId) && isRostrum(finalLocId)) {
    return true;
  }
  // Rule 9: Office → Community = COUNT
  if (isOffice(initialLocId) && isCommunity(finalLocId)) {
    return true;
  }

  return false;
}

/**
 * Determine the move type based on location transition
 * Returns DefinedMoveType enum value, or null for unknown moves
 */
function determineMoveTypeFromLocations(
  initialLocId: string | undefined,
  finalLocId: string | undefined,
  tilePlayerId: number,
  currentPieces: Piece[],
  pieceId: string,
  areSeatsAdjacentFn: (
    from: string,
    to: string,
    playerCount: number
  ) => boolean,
  playerCount: number
): DefinedMoveType | null {
  if (isCommunity(initialLocId) && isSeat(finalLocId)) {
    const ownerPlayer = getPlayerFromLocation(finalLocId);
    return ownerPlayer === tilePlayerId
      ? DefinedMoveType.ADVANCE
      : DefinedMoveType.ASSIST;
  }

  if (isSeat(initialLocId) && isRostrum(finalLocId)) {
    return DefinedMoveType.ADVANCE;
  }

  if (isRostrum(initialLocId) && isOffice(finalLocId)) {
    return DefinedMoveType.ADVANCE;
  }

  if (isRostrum(initialLocId) && isSeat(finalLocId)) {
    return DefinedMoveType.WITHDRAW;
  }

  if (isOffice(initialLocId) && isRostrum(finalLocId)) {
    return DefinedMoveType.WITHDRAW;
  }

  if (isSeat(initialLocId) && isCommunity(finalLocId)) {
    const fromPlayer = getPlayerFromLocation(initialLocId);
    if (fromPlayer === tilePlayerId) {
      return DefinedMoveType.WITHDRAW;
    }
    // Check if the piece is a Mark or Heel (REMOVE only for these pieces)
    const movingPiece = currentPieces.find((p) => p.id === pieceId);
    if (movingPiece) {
      const pieceName = movingPiece.name.toLowerCase();
      return pieceName === "mark" || pieceName === "heel"
        ? DefinedMoveType.REMOVE
        : null;
    }
    return null;
  }

  if (isSeat(initialLocId) && isSeat(finalLocId)) {
    const fromPlayer = getPlayerFromLocation(initialLocId);
    if (
      initialLocId &&
      finalLocId &&
      areSeatsAdjacentFn(initialLocId, finalLocId, playerCount)
    ) {
      return fromPlayer === tilePlayerId
        ? DefinedMoveType.ORGANIZE
        : DefinedMoveType.INFLUENCE;
    }
    return null;
  }

  if (isRostrum(initialLocId) && isRostrum(finalLocId)) {
    const fromPlayer = getPlayerFromLocation(initialLocId);
    return fromPlayer === tilePlayerId
      ? DefinedMoveType.ORGANIZE
      : DefinedMoveType.INFLUENCE;
  }

  return null;
}

/**
 * Determine the category (M or O) for a move type
 */
function getMoveCategory(moveType: DefinedMoveType): "M" | "O" {
  if (
    moveType === DefinedMoveType.REMOVE ||
    moveType === DefinedMoveType.INFLUENCE ||
    moveType === DefinedMoveType.ASSIST
  ) {
    return "O";
  }
  return "M";
}

/**
 * Calculate moves by comparing original pieces to current pieces
 *
 * This is the main function for determining what moves a player has made
 * during their turn. It compares the piece positions from the start of
 * the tile play to the current positions.
 *
 * @param originalPieces - Pieces at the start of the tile play
 * @param currentPieces - Current piece positions
 * @param tilePlayerId - ID of the player who played the tile
 * @param playerCount - Total number of players in the game
 * @param areSeatsAdjacentFn - Function to check if two seats are adjacent
 * @returns Array of tracked moves
 */
export function calculateMoves(
  originalPieces: Piece[],
  currentPieces: Piece[],
  tilePlayerId: number,
  playerCount: number,
  areSeatsAdjacentFn: (from: string, to: string, playerCount: number) => boolean
): TrackedMove[] {
  const calculatedMoves: TrackedMove[] = [];

  for (const currentPiece of currentPieces) {
    const initialPiece = originalPieces.find((p) => p.id === currentPiece.id);
    if (!initialPiece) {
      continue;
    }

    const initialLocId = initialPiece.locationId;
    const finalLocId = currentPiece.locationId;

    // Skip if piece didn't move
    if (initialLocId === finalLocId) continue;

    // Check if this move should be counted
    if (!shouldCountMove(initialLocId, finalLocId)) continue;

    // Determine move type
    const moveType = determineMoveTypeFromLocations(
      initialLocId,
      finalLocId,
      tilePlayerId,
      currentPieces,
      currentPiece.id,
      areSeatsAdjacentFn,
      playerCount
    );

    // Skip moves we can't categorize (shouldn't happen in normal gameplay)
    if (moveType === null) {
      continue;
    }

    // Determine category
    const category = getMoveCategory(moveType);

    // Create tracked move
    calculatedMoves.push({
      moveType,
      category,
      pieceId: currentPiece.id,
      fromPosition: initialPiece.position,
      fromLocationId: initialLocId,
      toPosition: currentPiece.position,
      toLocationId: finalLocId,
      timestamp: Date.now(),
    });
  }

  return calculatedMoves;
}
