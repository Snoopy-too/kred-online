/**
 * Win Condition Checking
 *
 * This module handles all win condition logic for the Kred game.
 *
 * Win Condition Requirements:
 * - Office: Must contain a Pawn (exactly 1)
 * - Rostrum 1: Must contain a Heel
 * - Rostrum 2: Must contain a Heel
 * - All 6 Seats: Must be occupied (can be any piece type: Mark, Heel, or Pawn)
 *
 * Total: 9 pieces in specific positions
 */

import type { Player, Piece } from '../types';

/**
 * Checks if a player has achieved the win condition
 *
 * Win Condition Requirements:
 * 1. Office: Must contain a Pawn (exactly 1)
 * 2. Rostrum 1: Must contain a Heel
 * 3. Rostrum 2: Must contain a Heel
 * 4. All 6 Seats: Must be occupied (can be any piece type: Mark, Heel, or Pawn)
 *
 * Total: 9 pieces in specific positions (1 Pawn in office + 2 Heels in rostrums + 6 pieces in seats)
 *
 * @param playerId - The player ID to check (1-5)
 * @param pieces - Current state of all pieces on the board
 * @returns true if player has won, false otherwise
 */
export function checkPlayerWinCondition(playerId: number, pieces: Piece[]): boolean {
  // Check Office: must have a Pawn
  const officeLocation = `p${playerId}_office`;
  const officePiece = pieces.find(p => p.locationId === officeLocation);
  if (!officePiece || officePiece.name !== 'Pawn') {
    return false;
  }

  // Check Rostrums: both must have Heels
  const rostrum1Location = `p${playerId}_rostrum1`;
  const rostrum2Location = `p${playerId}_rostrum2`;
  const rostrum1Piece = pieces.find(p => p.locationId === rostrum1Location);
  const rostrum2Piece = pieces.find(p => p.locationId === rostrum2Location);

  if (!rostrum1Piece || rostrum1Piece.name !== 'Heel') {
    return false;
  }
  if (!rostrum2Piece || rostrum2Piece.name !== 'Heel') {
    return false;
  }

  // Check all 6 seats: all must be occupied
  for (let i = 1; i <= 6; i++) {
    const seatLocation = `p${playerId}_seat${i}`;
    const seatPiece = pieces.find(p => p.locationId === seatLocation);
    if (!seatPiece) {
      return false;
    }
  }

  return true;
}

/**
 * Checks for win condition - used in both Campaign and Bureaucracy phases
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
