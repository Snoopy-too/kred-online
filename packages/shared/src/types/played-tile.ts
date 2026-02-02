/**
 * Played Tile Types
 *
 * Purpose: Type definitions for tiles that have been played but not yet fully resolved
 * Dependencies: move.ts (TrackedMove), piece.ts (Piece), tile.ts (BoardTile)
 * Usage: Used during campaign phase to track tile plays and associated moves
 *
 * @module types/played-tile
 */

import type { TrackedMove } from "./move";
import type { Piece } from "./piece";
import type { BoardTile } from "./tile";

/**
 * PlayedTileState - Represents a tile that has been played but not yet fully resolved
 *
 * Structure:
 * - tileId: Unique identifier of the tile being played
 * - playerId: Player who played this tile
 * - receivingPlayerId: Player who is receiving this tile play
 * - playedAt: Timestamp when the tile was played
 * - movesPerformed: Array of moves made by the player during this tile play
 * - gameStateSnapshot: Snapshot of game state (pieces and board tiles) at time of play
 *
 * Purpose:
 * This type captures the full context of a tile play, allowing for:
 * - Move validation and tracking
 * - Challenge system (other players can challenge the moves)
 * - Undo/reset functionality (restore from snapshot)
 * - Game state history
 *
 * @example
 * ```typescript
 * const playedTile: PlayedTileState = {
 *   tileId: "tile_15",
 *   playerId: 1,
 *   receivingPlayerId: 2,
 *   playedAt: Date.now(),
 *   movesPerformed: [
 *     {
 *       pieceId: "piece_123",
 *       moveType: "ADVANCE",
 *       fromLocationId: "community_1",
 *       toLocationId: "seat_p2_1",
 *       timestamp: Date.now()
 *     }
 *   ],
 *   gameStateSnapshot: {
 *     pieces: [...],
 *     boardTiles: [...]
 *   }
 * };
 * ```
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
