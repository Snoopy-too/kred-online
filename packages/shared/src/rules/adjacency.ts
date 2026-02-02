/**
 * Adjacency Rules - Seat and player positioning logic
 *
 * Purpose: Handles adjacency checks for seats and player order navigation
 * Dependencies: Types (Piece)
 * Usage: Used for move validation (INFLUENCE, ORGANIZE) and seating rules
 *
 * @module rules/adjacency
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces
  Piece,
} from "../types";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Gets the next player in clockwise order around the table
 *
 * Seating order varies by player count:
 * - 3-player: 1→3→2→1 (special clockwise order)
 * - 4-player: 1→2→3→4→1 (sequential)
 * - 5-player: 1→2→3→4→5→1 (sequential)
 *
 * @param playerId - Current player ID (1-5)
 * @param playerCount - Total number of players (3, 4, or 5)
 * @returns Next player ID in clockwise order
 *
 * @example
 * ```typescript
 * getNextPlayerClockwise(1, 3); // Returns: 3
 * getNextPlayerClockwise(1, 4); // Returns: 2
 * ```
 */
export function getNextPlayerClockwise(
  playerId: number,
  playerCount: number
): number {
  if (playerCount === 3) {
    // Special case for 3 players: 1→3→2→1
    return playerId === 1 ? 3 : playerId === 3 ? 2 : 1;
  } else {
    // For 4 and 5 players: sequential
    return (playerId % playerCount) + 1;
  }
}

/**
 * Gets the previous player in clockwise order (counter-clockwise)
 *
 * Reverse seating order varies by player count:
 * - 3-player: 1←3←2←1 (or 1→2→3→1 backward)
 * - 4-player: 1←2←3←4←1
 * - 5-player: 1←2←3←4←5←1
 *
 * @param playerId - Current player ID (1-5)
 * @param playerCount - Total number of players (3, 4, or 5)
 * @returns Previous player ID in clockwise order
 *
 * @example
 * ```typescript
 * getPrevPlayerClockwise(1, 3); // Returns: 2
 * getPrevPlayerClockwise(1, 4); // Returns: 4
 * ```
 */
export function getPrevPlayerClockwise(
  playerId: number,
  playerCount: number
): number {
  if (playerCount === 3) {
    // Special case for 3 players: 1←3←2 means prev of 1 is 2, prev of 3 is 1, prev of 2 is 3
    return playerId === 1 ? 2 : playerId === 2 ? 3 : 1;
  } else {
    // For 4 and 5 players: sequential
    return playerId === 1 ? playerCount : playerId - 1;
  }
}

/**
 * Determines if two seats are adjacent in the seating arrangement
 *
 * Adjacency rules:
 * - Same player: consecutive seat numbers (1-2, 2-3, ..., 5-6)
 * - Cross-player: last seat of one player to first seat of next player
 *   (e.g., p1_seat6 adjacent to p3_seat1 in 3-player game)
 *
 * @param seatId1 - First seat ID (e.g., 'p1_seat1')
 * @param seatId2 - Second seat ID (e.g., 'p2_seat6')
 * @param playerCount - Total number of players (3, 4, or 5)
 * @returns true if seats are adjacent, false otherwise
 *
 * @example
 * ```typescript
 * areSeatsAdjacent("p1_seat1", "p1_seat2", 3); // Returns: true
 * areSeatsAdjacent("p1_seat6", "p3_seat1", 3); // Returns: true (wraps)
 * areSeatsAdjacent("p1_seat1", "p1_seat3", 3); // Returns: false
 * ```
 */
export function areSeatsAdjacent(
  seatId1: string,
  seatId2: string,
  playerCount: number
): boolean {
  // Extract player ID and seat number from location IDs
  const match1 = seatId1.match(/p(\d+)_seat(\d)/);
  const match2 = seatId2.match(/p(\d+)_seat(\d)/);

  if (!match1 || !match2) return false;

  const player1 = parseInt(match1[1]);
  const seat1 = parseInt(match1[2]);
  const player2 = parseInt(match2[1]);
  const seat2 = parseInt(match2[2]);

  // Same player - seats must be consecutive
  if (player1 === player2) {
    return Math.abs(seat1 - seat2) === 1;
  }

  // Different players - check if they're at the boundary (wrapping around the table)
  const nextPlayer = getNextPlayerClockwise(player1, playerCount);
  const prevPlayer = getPrevPlayerClockwise(player1, playerCount);

  // Forward wrap: Player X seat6 is adjacent to next player's seat1
  if (player2 === nextPlayer && seat1 === 6 && seat2 === 1) {
    return true;
  }

  // Forward wrap (reversed): Player X seat1 is adjacent to next player's seat6
  if (player2 === nextPlayer && seat1 === 1 && seat2 === 6) {
    return true;
  }

  // Backward wrap: Player X seat1 is adjacent to previous player's seat6
  if (player2 === prevPlayer && seat1 === 1 && seat2 === 6) {
    return true;
  }

  // Backward wrap (reversed): Player X seat6 is adjacent to previous player's seat1
  if (player2 === prevPlayer && seat1 === 6 && seat2 === 1) {
    return true;
  }

  return false;
}

/**
 * Gets all adjacent seats to a given seat
 *
 * Used for validating INFLUENCE and ORGANIZE moves which require
 * pieces to be in adjacent seats.
 *
 * @param seatId - The seat ID (e.g., 'p1_seat3')
 * @param playerCount - Total number of players (3, 4, or 5)
 * @returns Array of adjacent seat IDs (usually 2 seats)
 *
 * @example
 * ```typescript
 * getAdjacentSeats("p1_seat3", 3); // Returns: ["p1_seat2", "p1_seat4"]
 * getAdjacentSeats("p1_seat6", 3); // Returns: ["p1_seat5", "p3_seat1"]
 * ```
 */
export function getAdjacentSeats(
  seatId: string,
  playerCount: number
): string[] {
  const match = seatId.match(/p(\d+)_seat(\d)/);
  if (!match) return [];

  const player = parseInt(match[1]);
  const seat = parseInt(match[2]);
  const adjacent: string[] = [];

  // Same player, lower seat number
  if (seat > 1) {
    adjacent.push(`p${player}_seat${seat - 1}`);
  } else if (seat === 1) {
    // Wrap to previous player's seat 6
    const prevPlayer = getPrevPlayerClockwise(player, playerCount);
    adjacent.push(`p${prevPlayer}_seat6`);
  }

  // Same player, higher seat number
  if (seat < 6) {
    adjacent.push(`p${player}_seat${seat + 1}`);
  } else if (seat === 6) {
    // Wrap to next player's seat 1
    const nextPlayer = getNextPlayerClockwise(player, playerCount);
    adjacent.push(`p${nextPlayer}_seat1`);
  }

  return adjacent;
}

/**
 * Checks if a piece can be moved from community based on occupancy rules
 *
 * Community hierarchy rules:
 * - Marks can always be moved from community
 * - If Marks occupy community: Heels and Pawns cannot be moved
 * - If Heels occupy community (no Marks): Pawns cannot be moved
 * - Pending pieces (temporarily in community) are ignored
 *
 * @param piece - The piece attempting to move from community
 * @param pieces - All current pieces on the board
 * @param pendingCommunityPieceIds - Optional set of piece IDs to ignore (pending moves)
 * @returns true if piece can be moved from community, false otherwise
 *
 * @example
 * ```typescript
 * const canMove = canMoveFromCommunity(markPiece, allPieces);
 * if (canMove) {
 *   // Allow move from community
 * }
 * ```
 */
export function canMoveFromCommunity(
  piece: Piece,
  pieces: Piece[],
  pendingCommunityPieceIds?: Set<string>
): boolean {
  const pieceName = piece.name.toLowerCase();

  // Marks can always be moved from community
  if (pieceName === "mark") return true;

  // Check if any Marks exist in community (excluding pending pieces)
  const marksInCommunity = pieces.some(
    (p) =>
      p.locationId?.includes("community") &&
      p.name.toLowerCase() === "mark" &&
      (!pendingCommunityPieceIds || !pendingCommunityPieceIds.has(p.id))
  );

  // If Marks in community, Heels and Pawns cannot move
  if (marksInCommunity) return false;

  // If moving a Pawn, check if Heels are in community (excluding pending pieces)
  if (pieceName === "pawn") {
    const heelsInCommunity = pieces.some(
      (p) =>
        p.locationId?.includes("community") &&
        p.name.toLowerCase() === "heel" &&
        (!pendingCommunityPieceIds || !pendingCommunityPieceIds.has(p.id))
    );
    // Pawns can only move if no Heels in community
    return !heelsInCommunity;
  }

  // Heels can move if no Marks in community (already checked above)
  return true;
}
