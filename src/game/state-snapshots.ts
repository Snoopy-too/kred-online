/**
 * Game State Snapshots - State management utilities
 *
 * Purpose: Provides functions for creating game state snapshots and managing
 *          challenge order during tile play
 * Dependencies: Types module for Piece, BoardTile, and PlayedTileState
 * Usage: Used for undo functionality and challenge system
 *
 * @module game/state-snapshots
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces (marks, heels, pawns)
  Piece,

  // Tile types - board tiles
  BoardTile,

  // Played tile types - tile play tracking
  PlayedTileState,
} from "../types";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Creates a snapshot of the current game state for undo functionality
 *
 * @param pieces - Current array of game pieces
 * @param boardTiles - Current array of tiles on the board
 * @returns Snapshot object with copies of pieces and boardTiles
 *
 * @example
 * ```typescript
 * const snapshot = createGameStateSnapshot(gameState.pieces, gameState.boardTiles);
 * // Later, restore from snapshot
 * gameState.pieces = snapshot.pieces;
 * gameState.boardTiles = snapshot.boardTiles;
 * ```
 */
export function createGameStateSnapshot(
  pieces: Piece[],
  boardTiles: BoardTile[]
): PlayedTileState["gameStateSnapshot"] {
  return {
    pieces: pieces.map((p) => ({ ...p })),
    boardTiles: boardTiles.map((t) => ({ ...t })),
  };
}

/**
 * Determines the order of players for challenging, starting clockwise from the tile player
 *
 * Players can challenge tile plays in a specific order. The tile player and receiving player
 * cannot challenge (they're involved in the play).
 *
 * @param tilePlayerId - The player who played the tile
 * @param playerCount - Total number of players (3, 4, or 5)
 * @param receivingPlayerId - Optional ID of the player receiving the tile play
 * @returns Array of player IDs in challenge order (clockwise from tile player)
 *
 * @example
 * ```typescript
 * // 4-player game: Player 2 plays tile for Player 3
 * const order = getChallengeOrder(2, 4, 3);
 * // Returns: [4, 1] - only players 4 and 1 can challenge
 * ```
 */
export function getChallengeOrder(
  tilePlayerId: number,
  playerCount: number,
  receivingPlayerId?: number
): number[] {
  const challengeOrder: number[] = [];

  // Start from the next player clockwise from the tile player
  for (let i = 1; i < playerCount; i++) {
    const playerId = ((tilePlayerId - 1 + i) % playerCount) + 1;
    // Skip the tile player (giver) and the receiving player (only players not involved can challenge)
    if (playerId !== tilePlayerId && playerId !== receivingPlayerId) {
      challengeOrder.push(playerId);
    }
  }

  return challengeOrder;
}
