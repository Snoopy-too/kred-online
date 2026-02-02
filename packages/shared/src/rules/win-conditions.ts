/**
 * Win Conditions - Game victory checking
 *
 * Purpose: Determines if players have achieved winning conditions
 * Dependencies: Types module for Player and Piece interfaces
 * Usage: Called at end of Campaign and Bureaucracy phases
 *
 * Win Condition Requirements:
 * - Pawn in Office
 * - Heel in both Rostrums
 * - All 6 seats filled with pieces
 *
 * @module rules/win-conditions
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Player types - player data structures
  Player,

  // Piece types - game pieces
  Piece,
} from "../types";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Checks if a specific player has achieved the win condition
 *
 * Win requirements:
 * 1. Office must have a Pawn
 * 2. Both rostrums must have Heels
 * 3. All 6 seats must be occupied (by any piece type)
 *
 * @param playerId - ID of the player to check
 * @param pieces - Current state of all game pieces
 * @returns true if player has won, false otherwise
 *
 * @example
 * ```typescript
 * const hasWon = checkPlayerWinCondition(1, gameState.pieces);
 * if (hasWon) {
 *   console.log("Player 1 wins!");
 * }
 * ```
 */
export function checkPlayerWinCondition(
  playerId: number,
  pieces: Piece[]
): boolean {
  // Check Office: must have a Pawn
  const officeLocation = `p${playerId}_office`;
  const officePiece = pieces.find((p) => p.locationId === officeLocation);
  if (!officePiece || officePiece.name !== "Pawn") {
    return false;
  }

  // Check Rostrums: both must have Heels
  const rostrum1Location = `p${playerId}_rostrum1`;
  const rostrum2Location = `p${playerId}_rostrum2`;
  const rostrum1Piece = pieces.find((p) => p.locationId === rostrum1Location);
  const rostrum2Piece = pieces.find((p) => p.locationId === rostrum2Location);

  if (!rostrum1Piece || rostrum1Piece.name !== "Heel") {
    return false;
  }
  if (!rostrum2Piece || rostrum2Piece.name !== "Heel") {
    return false;
  }

  // Check all 6 seats: all must be occupied
  for (let i = 1; i <= 6; i++) {
    const seatLocation = `p${playerId}_seat${i}`;
    const seatPiece = pieces.find((p) => p.locationId === seatLocation);
    if (!seatPiece) {
      return false;
    }
  }

  return true;
}

/**
 * Checks for win condition across all players - used in both Campaign and Bureaucracy phases
 *
 * When Called:
 * - Campaign Phase: When receiver starts their turn (after tile play workflow completes)
 * - Bureaucracy Phase: After all players complete their Bureaucracy turns
 *
 * Win Detection:
 * - Single winner: Returns array with one player ID [playerId]
 * - Draw (multiple winners): Returns array with multiple player IDs [id1, id2, ...]
 * - No winner: Returns empty array []
 *
 * @param players - All players in the game
 * @param pieces - Current state of all pieces on the board
 * @returns Array of winning player IDs (empty if no winner)
 *
 * @example
 * ```typescript
 * const winners = checkBureaucracyWinCondition(gameState.players, gameState.pieces);
 * if (winners.length === 1) {
 *   console.log(`Player ${winners[0]} wins!`);
 * } else if (winners.length > 1) {
 *   console.log(`Draw between players: ${winners.join(", ")}`);
 * } else {
 *   console.log("No winner yet");
 * }
 * ```
 */
export function checkBureaucracyWinCondition(
  players: Player[],
  pieces: Piece[]
): number[] {
  const winners: number[] = [];

  for (const player of players) {
    if (checkPlayerWinCondition(player.id, pieces)) {
      winners.push(player.id);
    }
  }

  return winners;
}
