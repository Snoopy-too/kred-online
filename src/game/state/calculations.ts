/**
 * State Calculations
 * Functions for calculating game state values and creating snapshots
 */

import { Player, Piece, BoardTile, PlayedTileState } from '../types';
import { TILE_KREDCOIN_VALUES } from '../config';

/**
 * Creates a deep copy snapshot of current game state.
 * Used for tracking game history and enabling undo/challenge resolution.
 *
 * @param pieces Current pieces on the board
 * @param boardTiles Current tiles on the board
 * @returns A snapshot of the game state
 */
export function createGameStateSnapshot(
  pieces: Piece[],
  boardTiles: BoardTile[]
): PlayedTileState['gameStateSnapshot'] {
  return {
    pieces: pieces.map((p) => ({ ...p })),
    boardTiles: boardTiles.map((t) => ({ ...t })),
  };
}

/**
 * Calculates a player's total Kredcoin based on their bureaucracy tiles.
 * Each tile has a Kredcoin value that contributes to the player's purchasing power.
 *
 * @param player The player whose Kredcoin to calculate
 * @returns Total Kredcoin value
 */
export function calculatePlayerKredcoin(player: Player): number {
  return player.bureaucracyTiles.reduce((total, tile) => {
    return total + (TILE_KREDCOIN_VALUES[tile.id] || 0);
  }, 0);
}

/**
 * Determines the turn order for Bureaucracy phase based on Kredcoin amounts.
 * Players with more Kredcoin go first. Ties broken by player ID (ascending).
 *
 * @param players All players in the game
 * @returns Array of player IDs sorted by Kredcoin (descending)
 */
export function getBureaucracyTurnOrder(players: Player[]): number[] {
  const playerKredcoin = players.map((p) => ({
    id: p.id,
    kredcoin: calculatePlayerKredcoin(p),
  }));

  // Sort by kredcoin descending, then by player id ascending (for tie-breaking)
  playerKredcoin.sort((a, b) => {
    if (b.kredcoin !== a.kredcoin) {
      return b.kredcoin - a.kredcoin;
    }
    return a.id - b.id;
  });

  return playerKredcoin.map((p) => p.id);
}

/**
 * Determines the order of players for challenging, starting clockwise from the tile player.
 * The tile player and receiving player cannot challenge (they're involved in the play).
 *
 * @param tilePlayerId The player who played the tile
 * @param playerCount Total number of players
 * @param receivingPlayerId Optional - the player receiving the tile
 * @returns Array of player IDs in challenge order (clockwise from tile player)
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
    // Skip the tile player (giver) and the receiving player
    if (playerId !== tilePlayerId && playerId !== receivingPlayerId) {
      challengeOrder.push(playerId);
    }
  }

  return challengeOrder;
}
