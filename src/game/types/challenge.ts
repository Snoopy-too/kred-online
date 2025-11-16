/**
 * Challenge-related type definitions
 * Defines types for the challenge system and tile play state
 */

import { Piece, BoardTile } from './board';
import { TrackedMove } from './moves';

/**
 * Represents a tile that has been played but not yet fully resolved
 */
export interface PlayedTileState {
  tileId: string;
  playerId: number; // Player who played the tile
  receivingPlayerId: number; // Player who received the tile
  playedAt: number; // Timestamp when played
  movesPerformed: TrackedMove[]; // Moves made by the player during play
  gameStateSnapshot: {
    pieces: Piece[];
    boardTiles: BoardTile[];
  };
}

/**
 * Challenge information and status
 */
export interface ChallengeState {
  status: 'PENDING' | 'CHALLENGED' | 'RESOLVED';
  challengedByPlayerId?: number;
  acceptedByReceivingPlayer: boolean;
}
