/**
 * Move Validation Module - Specific move type validators
 *
 * PURPOSE: Validates individual move types (ADVANCE, WITHDRAW, REMOVE, etc.) based on
 * current board state and game rules.
 *
 * USAGE CONTEXT:
 * These validators are used during gameplay to determine if a specific move is legal.
 * They're also used when checking if tile requirements were "impossible" to execute
 * (which forgives dishonest plays per the official rules).
 *
 * @module rules/move-validation
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
import type { TrackedMove, Piece } from "../types";

// ============================================================================
// FUNCTION IMPORTS - Rules and utilities
// ============================================================================
import { areSeatsAdjacent, canMoveFromCommunity } from "./adjacency";

// ============================================================================
// MOVE VALIDATORS
// ============================================================================

/**
 * Validates whether an ADVANCE move is legal
 *
 * ADVANCE options (from official manual):
 * a. Community to vacant seat (if allowed by canMoveFromCommunity)
 * b. Seat to rostrum (when all 3 supporting seats are occupied)
 * c. Rostrum to office (when both rostrums are occupied)
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @returns True if the move is legal
 */
export function validateAdvanceMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Option A: Community to seat
  if (
    fromLocationId?.includes("community") &&
    toLocationId?.includes(`p${playerId}_seat`)
  ) {
    // Check if target seat is vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;

    // Check community movement restrictions
    const movingPiece = pieces.find((p) => p.id === move.pieceId);
    if (!movingPiece) return false;

    return canMoveFromCommunity(movingPiece, pieces);
  }

  // Option B: Seats 1-3 to rostrum1 (if all seats 1-3 occupied)
  if (toLocationId === `p${playerId}_rostrum1`) {
    const seat1 = `p${playerId}_seat1`;
    const seat2 = `p${playerId}_seat2`;
    const seat3 = `p${playerId}_seat3`;

    const allOccupied = [seat1, seat2, seat3].every((seatId) =>
      pieces.some((p) => p.locationId === seatId)
    );

    const validSource = [seat1, seat2, seat3].includes(fromLocationId || "");
    return allOccupied && validSource;
  }

  // Option C: Seats 4-6 to rostrum2 (if all seats 4-6 occupied)
  if (toLocationId === `p${playerId}_rostrum2`) {
    const seat4 = `p${playerId}_seat4`;
    const seat5 = `p${playerId}_seat5`;
    const seat6 = `p${playerId}_seat6`;

    const allOccupied = [seat4, seat5, seat6].every((seatId) =>
      pieces.some((p) => p.locationId === seatId)
    );

    const validSource = [seat4, seat5, seat6].includes(fromLocationId || "");
    return allOccupied && validSource;
  }

  // Option D: Rostrum1 to office (if both rostrums occupied)
  if (
    toLocationId === `p${playerId}_office` &&
    fromLocationId === `p${playerId}_rostrum1`
  ) {
    const rostrum2Occupied = pieces.some(
      (p) => p.locationId === `p${playerId}_rostrum2`
    );
    return rostrum2Occupied;
  }

  return false;
}

/**
 * Validates whether a WITHDRAW move is legal
 *
 * WITHDRAW options (from official manual):
 * a. Seat to community
 * b. Rostrum to vacant seat (rostrum1 → seats 1-3, rostrum2 → seats 3-5)
 * c. Office to vacant rostrum
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @returns True if the move is legal
 */
export function validateWithdrawMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  if (!fromLocationId || !toLocationId) return false;

  // Option A: Seat to community
  if (
    fromLocationId?.includes(`p${playerId}_seat`) &&
    toLocationId?.includes("community")
  ) {
    return true;
  }

  // Option B: Rostrum to specific seats
  if (fromLocationId === `p${playerId}_rostrum1`) {
    // rostrum1 can go to seats 1, 2, or 3
    const validSeats = [
      `p${playerId}_seat1`,
      `p${playerId}_seat2`,
      `p${playerId}_seat3`,
    ];
    if (validSeats.includes(toLocationId)) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  if (fromLocationId === `p${playerId}_rostrum2`) {
    // rostrum2 can go to seats 3, 4, or 5
    const validSeats = [
      `p${playerId}_seat3`,
      `p${playerId}_seat4`,
      `p${playerId}_seat5`,
    ];
    if (validSeats.includes(toLocationId)) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  // Option C: Office to vacant rostrum
  if (fromLocationId === `p${playerId}_office`) {
    if (
      toLocationId === `p${playerId}_rostrum1` ||
      toLocationId === `p${playerId}_rostrum2`
    ) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  return false;
}

/**
 * Validates whether a REMOVE move is legal
 *
 * REMOVE rules (from official manual):
 * - Take opponent's Mark or Heel from their seat to community
 * - Cannot remove from Rostrums or Offices
 * - Cannot remove Pawns
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @param playerCount - Number of players in the game
 * @returns True if the move is legal
 */
export function validateRemoveMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Must move to community
  if (!toLocationId?.includes("community")) return false;

  // Check if from an opponent's seat (not player's own seat)
  if (!fromLocationId?.includes("_seat")) return false;

  // Extract player ID from location (e.g., 'p2_seat1' -> 2)
  const seatPlayerMatch = fromLocationId?.match(/p(\d+)_seat/);
  if (!seatPlayerMatch) return false;

  const seatPlayerId = parseInt(seatPlayerMatch[1]);
  if (
    seatPlayerId === playerId ||
    seatPlayerId < 1 ||
    seatPlayerId > playerCount
  ) {
    return false;
  }

  // Check that the piece being moved is a Mark or Heel
  const movingPiece = pieces.find((p) => p.id === move.pieceId);
  if (!movingPiece) return false;

  const pieceName = movingPiece.name.toLowerCase();
  return pieceName === "mark" || pieceName === "heel";
}

/**
 * Validates whether an INFLUENCE move is legal
 *
 * INFLUENCE rules (from official manual):
 * - Move opponent's Mark or Heel to adjacent seat
 * - Move opponent's piece from rostrum to adjacent rostrum
 * - Cannot influence Pawns
 * - Cannot influence own pieces
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @param playerCount - Number of players in the game
 * @returns True if the move is legal
 */
export function validateInfluenceMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  if (!fromLocationId || !toLocationId) return false;

  // Case 1: Seat to adjacent seat
  if (fromLocationId.includes("_seat") && toLocationId.includes("_seat")) {
    // Must be opponent's piece
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_seat/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false; // Can't INFLUENCE own pieces

    // Seats must be adjacent
    return areSeatsAdjacent(fromLocationId, toLocationId, playerCount);
  }

  // Case 2: Rostrum to adjacent rostrum
  if (
    fromLocationId.includes("_rostrum") &&
    toLocationId.includes("_rostrum")
  ) {
    // Must be opponent's piece
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_rostrum/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false; // Can't INFLUENCE own pieces

    // Extract rostrum numbers from the location IDs
    const fromRostMatch = fromLocationId.match(/p\d+_rostrum(\d)/);
    const toRostMatch = toLocationId.match(/p\d+_rostrum(\d)/);

    if (!fromRostMatch || !toRostMatch) return false;

    const fromRost = parseInt(fromRostMatch[1]);
    const toRost = parseInt(toRostMatch[1]);

    // Rostrums must be adjacent (1 is adjacent to 2, and 2 to 1)
    return Math.abs(fromRost - toRost) === 1;
  }

  return false;
}

/**
 * Validates whether an ASSIST move is legal
 *
 * ASSIST rules (from official manual):
 * - Add Mark from community to opponent's vacant seat
 * - If no Marks available, can add Heel instead
 * - Cannot assist own seats
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @param playerCount - Number of players in the game
 * @returns True if the move is legal
 */
export function validateAssistMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Must be from community to opponent's seat
  if (!fromLocationId?.includes("community")) return false;
  if (!toLocationId?.includes("_seat")) return false;

  // Extract player ID from target seat (e.g., 'p2_seat1' -> 2)
  const seatPlayerMatch = toLocationId?.match(/p(\d+)_seat/);
  if (!seatPlayerMatch) return false;

  const targetPlayerId = parseInt(seatPlayerMatch[1]);

  // Must be opponent's seat and seat must be vacant
  if (targetPlayerId === playerId) return false;
  if (targetPlayerId < 1 || targetPlayerId > playerCount) return false;

  const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
  if (targetOccupied) return false;

  // Check community movement restrictions
  const movingPiece = pieces.find((p) => p.id === move.pieceId);
  if (!movingPiece) return false;

  return canMoveFromCommunity(movingPiece, pieces);
}

/**
 * Validates whether an ORGANIZE move is legal
 *
 * ORGANIZE rules (from official manual):
 * - Move own piece to adjacent seat (can cross player boundaries)
 * - Move own piece from rostrum to adjacent rostrum (cannot cross boundaries)
 * - Target must be vacant
 *
 * @param move - The move to validate
 * @param playerId - The player making the move
 * @param pieces - Current pieces on the board
 * @returns True if the move is legal
 */
export function validateOrganizeMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Case 1: Seat to adjacent seat (can cross player boundaries)
  if (fromLocationId?.includes("_seat") && toLocationId?.includes("_seat")) {
    // Must be from player's own seat
    if (!fromLocationId?.includes(`p${playerId}_seat`)) return false;
    // Target seat must be vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    return !targetOccupied;
  }

  // Case 2: Rostrum to adjacent rostrum (can cross player boundaries)
  if (
    fromLocationId?.includes("_rostrum") &&
    toLocationId?.includes("_rostrum")
  ) {
    // Must be from player's own rostrum
    if (!fromLocationId?.includes(`p${playerId}_rostrum`)) return false;
    // Target rostrum must be vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    return !targetOccupied;
  }

  return false;
}
