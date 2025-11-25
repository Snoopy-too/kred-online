/**
 * Tests for game state snapshot functions
 *
 * These tests verify:
 * - Game state snapshot creation for undo functionality
 * - Challenge order calculation for different player counts
 */

import { describe, it, expect } from "vitest";
import type { Piece, BoardTile } from "../../types";
import {
  createGameStateSnapshot,
  getChallengeOrder,
} from "../../../game";

describe("createGameStateSnapshot", () => {
  it("creates a deep copy of pieces array", () => {
    const pieces: Piece[] = [
      {
        id: "p1_mark1",
        type: "mark",
        playerId: 1,
        locationId: "p1_seat1",
        position: { left: 10, top: 20 },
        rotation: 0,
        imageUrl: "/images/pieces/mark_p1.png",
      },
      {
        id: "p2_heel1",
        type: "heel",
        playerId: 2,
        locationId: "community1",
        position: { left: 30, top: 40 },
        rotation: 90,
        imageUrl: "/images/pieces/heel_p2.png",
      },
    ];

    const boardTiles: BoardTile[] = [];
    const snapshot = createGameStateSnapshot(pieces, boardTiles);

    // Verify it's a copy, not the same reference
    expect(snapshot.pieces).not.toBe(pieces);
    expect(snapshot.pieces[0]).not.toBe(pieces[0]);
    expect(snapshot.pieces[1]).not.toBe(pieces[1]);

    // Verify the data is the same
    expect(snapshot.pieces).toEqual(pieces);
  });

  it("creates a deep copy of boardTiles array", () => {
    const pieces: Piece[] = [];
    const boardTiles: BoardTile[] = [
      {
        tile: "01",
        playerId: 1,
        targetPlayerId: 2,
        locationId: "p2_tile_space1",
        position: { left: 50, top: 60 },
      },
    ];

    const snapshot = createGameStateSnapshot(pieces, boardTiles);

    // Verify it's a copy, not the same reference
    expect(snapshot.boardTiles).not.toBe(boardTiles);
    expect(snapshot.boardTiles[0]).not.toBe(boardTiles[0]);

    // Verify the data is the same
    expect(snapshot.boardTiles).toEqual(boardTiles);
  });

  it("handles empty arrays", () => {
    const pieces: Piece[] = [];
    const boardTiles: BoardTile[] = [];

    const snapshot = createGameStateSnapshot(pieces, boardTiles);

    expect(snapshot.pieces).toEqual([]);
    expect(snapshot.boardTiles).toEqual([]);
  });

  it("creates independent copies of top-level properties", () => {
    const pieces: Piece[] = [
      {
        id: "p1_mark1",
        type: "mark",
        playerId: 1,
        locationId: "p1_seat1",
        position: { left: 10, top: 20 },
        rotation: 0,
        imageUrl: "/images/pieces/mark_p1.png",
      },
    ];
    const boardTiles: BoardTile[] = [];

    const snapshot = createGameStateSnapshot(pieces, boardTiles);

    // Modify the snapshot's top-level properties
    snapshot.pieces[0].locationId = "p1_seat2";
    snapshot.pieces[0].rotation = 180;

    // Original top-level properties should be unchanged
    expect(pieces[0].locationId).toBe("p1_seat1");
    expect(pieces[0].rotation).toBe(0);
  });
});

describe("getChallengeOrder", () => {
  describe("3-player games", () => {
    it("returns correct challenge order when player 1 plays tile", () => {
      const order = getChallengeOrder(1, 3);
      expect(order).toEqual([2, 3]);
    });

    it("returns correct challenge order when player 2 plays tile", () => {
      const order = getChallengeOrder(2, 3);
      expect(order).toEqual([3, 1]);
    });

    it("returns correct challenge order when player 3 plays tile", () => {
      const order = getChallengeOrder(3, 3);
      expect(order).toEqual([1, 2]);
    });

    it("excludes receiving player from challenge order", () => {
      const order = getChallengeOrder(1, 3, 2);
      expect(order).toEqual([3]);
      expect(order).not.toContain(1); // tile player
      expect(order).not.toContain(2); // receiving player
    });
  });

  describe("4-player games", () => {
    it("returns correct challenge order when player 1 plays tile", () => {
      const order = getChallengeOrder(1, 4);
      expect(order).toEqual([2, 3, 4]);
    });

    it("returns correct challenge order when player 2 plays tile", () => {
      const order = getChallengeOrder(2, 4);
      expect(order).toEqual([3, 4, 1]);
    });

    it("returns correct challenge order when player 3 plays tile", () => {
      const order = getChallengeOrder(3, 4);
      expect(order).toEqual([4, 1, 2]);
    });

    it("returns correct challenge order when player 4 plays tile", () => {
      const order = getChallengeOrder(4, 4);
      expect(order).toEqual([1, 2, 3]);
    });

    it("excludes receiving player from challenge order", () => {
      const order = getChallengeOrder(1, 4, 3);
      expect(order).toEqual([2, 4]);
      expect(order).not.toContain(1); // tile player
      expect(order).not.toContain(3); // receiving player
    });
  });

  describe("5-player games", () => {
    it("returns correct challenge order when player 1 plays tile", () => {
      const order = getChallengeOrder(1, 5);
      expect(order).toEqual([2, 3, 4, 5]);
    });

    it("returns correct challenge order when player 2 plays tile", () => {
      const order = getChallengeOrder(2, 5);
      expect(order).toEqual([3, 4, 5, 1]);
    });

    it("returns correct challenge order when player 3 plays tile", () => {
      const order = getChallengeOrder(3, 5);
      expect(order).toEqual([4, 5, 1, 2]);
    });

    it("returns correct challenge order when player 4 plays tile", () => {
      const order = getChallengeOrder(4, 5);
      expect(order).toEqual([5, 1, 2, 3]);
    });

    it("returns correct challenge order when player 5 plays tile", () => {
      const order = getChallengeOrder(5, 5);
      expect(order).toEqual([1, 2, 3, 4]);
    });

    it("excludes receiving player from challenge order", () => {
      const order = getChallengeOrder(1, 5, 4);
      expect(order).toEqual([2, 3, 5]);
      expect(order).not.toContain(1); // tile player
      expect(order).not.toContain(4); // receiving player
    });
  });

  describe("edge cases", () => {
    it("excludes both tile player and receiving player", () => {
      // In a 5-player game where player 1 plays for player 2
      const order = getChallengeOrder(1, 5, 2);
      expect(order).toEqual([3, 4, 5]);
      expect(order.length).toBe(3); // 5 total - 2 excluded = 3 challengers
    });

    it("returns all other players when no receiving player specified", () => {
      const order = getChallengeOrder(1, 5);
      expect(order.length).toBe(4); // 5 total - 1 tile player = 4 challengers
    });
  });
});
