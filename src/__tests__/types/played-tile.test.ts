/**
 * Played Tile Types Tests
 *
 * Tests for played tile state type definitions
 */

import { describe, it, expect } from "vitest";
import type { PlayedTileState } from "../../types/played-tile";
import type { Piece } from "../../types/piece";
import type { BoardTile } from "../../types/tile";
import type { TrackedMove } from "../../types/move";

describe("Played Tile Types", () => {
  describe("PlayedTileState", () => {
    it("should create a valid played tile state with no moves", () => {
      const playedTile: PlayedTileState = {
        tileId: "tile_15",
        playerId: 1,
        receivingPlayerId: 2,
        playedAt: Date.now(),
        movesPerformed: [],
        gameStateSnapshot: {
          pieces: [],
          boardTiles: [],
        },
      };

      expect(playedTile.tileId).toBe("tile_15");
      expect(playedTile.playerId).toBe(1);
      expect(playedTile.receivingPlayerId).toBe(2);
      expect(playedTile.playedAt).toBeGreaterThan(0);
      expect(playedTile.movesPerformed).toEqual([]);
      expect(playedTile.gameStateSnapshot.pieces).toEqual([]);
      expect(playedTile.gameStateSnapshot.boardTiles).toEqual([]);
    });

    it("should track moves performed during tile play", () => {
      const move: TrackedMove = {
        pieceId: "piece_123",
        moveType: "ADVANCE",
        fromLocationId: "community_1",
        toLocationId: "seat_p2_1",
        timestamp: Date.now(),
      };

      const playedTile: PlayedTileState = {
        tileId: "tile_20",
        playerId: 2,
        receivingPlayerId: 3,
        playedAt: Date.now(),
        movesPerformed: [move],
        gameStateSnapshot: {
          pieces: [],
          boardTiles: [],
        },
      };

      expect(playedTile.movesPerformed).toHaveLength(1);
      expect(playedTile.movesPerformed[0].pieceId).toBe("piece_123");
      expect(playedTile.movesPerformed[0].moveType).toBe("ADVANCE");
    });

    it("should capture game state snapshot with pieces", () => {
      const pieces: Piece[] = [
        {
          id: "piece_1",
          type: "MARK",
          playerId: 1,
          position: { left: 10, top: 20 },
          locationId: "seat_p1_1",
        },
        {
          id: "piece_2",
          type: "HEEL",
          playerId: 2,
          position: { left: 30, top: 40 },
          locationId: "rostrum_p2_1",
        },
      ];

      const playedTile: PlayedTileState = {
        tileId: "tile_10",
        playerId: 1,
        receivingPlayerId: 2,
        playedAt: Date.now(),
        movesPerformed: [],
        gameStateSnapshot: {
          pieces: pieces,
          boardTiles: [],
        },
      };

      expect(playedTile.gameStateSnapshot.pieces).toHaveLength(2);
      expect(playedTile.gameStateSnapshot.pieces[0].id).toBe("piece_1");
      expect(playedTile.gameStateSnapshot.pieces[1].type).toBe("HEEL");
    });

    it("should capture game state snapshot with board tiles", () => {
      const boardTiles: BoardTile[] = [
        {
          id: "board_tile_1",
          tileId: "tile_05",
          playerId: 1,
          position: { left: 50, top: 50 },
          locationId: "p1_tile_space_1",
        },
      ];

      const playedTile: PlayedTileState = {
        tileId: "tile_12",
        playerId: 3,
        receivingPlayerId: 1,
        playedAt: Date.now(),
        movesPerformed: [],
        gameStateSnapshot: {
          pieces: [],
          boardTiles: boardTiles,
        },
      };

      expect(playedTile.gameStateSnapshot.boardTiles).toHaveLength(1);
      expect(playedTile.gameStateSnapshot.boardTiles[0].tileId).toBe("tile_05");
    });

    it("should track multiple moves in sequence", () => {
      const moves: TrackedMove[] = [
        {
          pieceId: "piece_1",
          moveType: "ADVANCE",
          fromLocationId: "community_1",
          toLocationId: "seat_p1_1",
          timestamp: Date.now(),
        },
        {
          pieceId: "piece_2",
          moveType: "ORGANIZE",
          fromLocationId: "seat_p1_1",
          toLocationId: "rostrum_p1_1",
          timestamp: Date.now() + 100,
        },
      ];

      const playedTile: PlayedTileState = {
        tileId: "tile_25",
        playerId: 1,
        receivingPlayerId: 2,
        playedAt: Date.now(),
        movesPerformed: moves,
        gameStateSnapshot: {
          pieces: [],
          boardTiles: [],
        },
      };

      expect(playedTile.movesPerformed).toHaveLength(2);
      expect(playedTile.movesPerformed[0].moveType).toBe("ADVANCE");
      expect(playedTile.movesPerformed[1].moveType).toBe("ORGANIZE");
    });

    it("should distinguish between player who played and receiving player", () => {
      const playedTile: PlayedTileState = {
        tileId: "tile_08",
        playerId: 3,
        receivingPlayerId: 1,
        playedAt: Date.now(),
        movesPerformed: [],
        gameStateSnapshot: {
          pieces: [],
          boardTiles: [],
        },
      };

      expect(playedTile.playerId).toBe(3);
      expect(playedTile.receivingPlayerId).toBe(1);
      expect(playedTile.playerId).not.toBe(playedTile.receivingPlayerId);
    });

    it("should use timestamp to track when tile was played", () => {
      const before = Date.now();
      const playedTile: PlayedTileState = {
        tileId: "tile_30",
        playerId: 2,
        receivingPlayerId: 4,
        playedAt: Date.now(),
        movesPerformed: [],
        gameStateSnapshot: {
          pieces: [],
          boardTiles: [],
        },
      };
      const after = Date.now();

      expect(playedTile.playedAt).toBeGreaterThanOrEqual(before);
      expect(playedTile.playedAt).toBeLessThanOrEqual(after);
    });
  });
});
