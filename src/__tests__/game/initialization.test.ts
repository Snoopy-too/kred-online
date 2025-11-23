/**
 * Tests for game initialization functions
 * Tests player creation, piece setup for drafting, and campaign piece initialization
 */

import { describe, it, expect } from "vitest";
import {
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
} from "../../game";

describe("initializePlayers", () => {
  it("creates correct number of players for 3-player game", () => {
    const players = initializePlayers(3);
    expect(players).toHaveLength(3);
    expect(players[0].id).toBe(1);
    expect(players[1].id).toBe(2);
    expect(players[2].id).toBe(3);
  });

  it("creates correct number of players for 4-player game", () => {
    const players = initializePlayers(4);
    expect(players).toHaveLength(4);
  });

  it("creates correct number of players for 5-player game", () => {
    const players = initializePlayers(5);
    expect(players).toHaveLength(5);
  });

  it("initializes each player with empty hand arrays and default credibility", () => {
    const players = initializePlayers(3);
    players.forEach((player) => {
      expect(player.hand).toBeDefined();
      expect(Array.isArray(player.hand)).toBe(true);
      expect(player.keptTiles).toEqual([]);
      expect(player.bureaucracyTiles).toEqual([]);
      expect(player.credibility).toBe(3);
    });
  });

  it("deals all 24 tiles for 3-player game", () => {
    const players = initializePlayers(3);
    const totalTiles = players.reduce(
      (sum, player) => sum + player.hand.length,
      0
    );
    expect(totalTiles).toBe(24); // All tiles dealt
  });

  it("deals all 24 tiles for 4-player game", () => {
    const players = initializePlayers(4);
    const totalTiles = players.reduce(
      (sum, player) => sum + player.hand.length,
      0
    );
    expect(totalTiles).toBe(24);
  });

  it("deals all 25 tiles for 5-player game (includes blank tile)", () => {
    const players = initializePlayers(5);
    const totalTiles = players.reduce(
      (sum, player) => sum + player.hand.length,
      0
    );
    expect(totalTiles).toBe(25); // 24 regular tiles + 1 blank tile
  });

  it("distributes tiles as evenly as possible among players", () => {
    const players = initializePlayers(3);
    const handSizes = players.map((p) => p.hand.length);
    const max = Math.max(...handSizes);
    const min = Math.min(...handSizes);
    expect(max - min).toBeLessThanOrEqual(1); // Difference should be at most 1
  });

  it("assigns unique tile IDs to each tile", () => {
    const players = initializePlayers(3);
    const allTileIds = players.flatMap((p) => p.hand.map((t) => t.id));
    const uniqueIds = new Set(allTileIds);
    expect(uniqueIds.size).toBe(allTileIds.length); // All IDs should be unique
  });

  it("shuffles tiles (randomization test)", () => {
    const players1 = initializePlayers(3);
    const players2 = initializePlayers(3);

    // Get first player's hand from each initialization
    const hand1 = players1[0].hand.map((t) => t.id);
    const hand2 = players2[0].hand.map((t) => t.id);

    // They should be different (with very high probability)
    // If this fails occasionally due to random chance, that's expected
    const areIdentical = JSON.stringify(hand1) === JSON.stringify(hand2);
    // With 24 tiles, the probability of identical shuffle is 1/24! which is astronomically small
    expect(areIdentical).toBe(false);
  });
});

describe("initializePieces", () => {
  it("creates correct number of pieces for 3-player game", () => {
    const pieces = initializePieces(3);
    // 3 players * 3 seats (1, 3, 5) = 9 marks
    expect(pieces).toHaveLength(9);
  });

  it("creates correct number of pieces for 4-player game", () => {
    const pieces = initializePieces(4);
    // 4 players * 3 seats (1, 3, 5) = 12 marks
    expect(pieces).toHaveLength(12);
  });

  it("creates correct number of pieces for 5-player game", () => {
    const pieces = initializePieces(5);
    // 5 players * 3 seats (1, 3, 5) = 15 marks
    expect(pieces).toHaveLength(15);
  });

  it("places marks at seats 1, 3, 5 for each player", () => {
    const pieces = initializePieces(3);
    const locationIds = pieces.map((p) => p.locationId);

    // Should have marks for player 1, 2, 3 at seats 1, 3, 5
    expect(locationIds).toContain("p1_seat1");
    expect(locationIds).toContain("p1_seat3");
    expect(locationIds).toContain("p1_seat5");
    expect(locationIds).toContain("p2_seat1");
    expect(locationIds).toContain("p2_seat3");
    expect(locationIds).toContain("p2_seat5");
    expect(locationIds).toContain("p3_seat1");
    expect(locationIds).toContain("p3_seat3");
    expect(locationIds).toContain("p3_seat5");
  });

  it("assigns unique piece IDs", () => {
    const pieces = initializePieces(3);
    const ids = pieces.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("sets piece name to 'Mark'", () => {
    const pieces = initializePieces(3);
    pieces.forEach((piece) => {
      expect(piece.name).toBe("Mark");
    });
  });

  it("assigns positions to all pieces", () => {
    const pieces = initializePieces(3);
    pieces.forEach((piece) => {
      expect(piece.position).toBeDefined();
      expect(piece.position.left).toBeDefined();
      expect(piece.position.top).toBeDefined();
      expect(typeof piece.position.left).toBe("number");
      expect(typeof piece.position.top).toBe("number");
    });
  });

  it("assigns rotation to all pieces", () => {
    const pieces = initializePieces(3);
    pieces.forEach((piece) => {
      expect(piece.rotation).toBeDefined();
      expect(typeof piece.rotation).toBe("number");
    });
  });

  it("returns empty array for invalid player count", () => {
    const pieces = initializePieces(99);
    expect(pieces).toEqual([]);
  });
});

describe("initializeCampaignPieces", () => {
  it("creates correct total number of pieces for 3-player game", () => {
    const pieces = initializeCampaignPieces(3);
    // 3 players: 12 marks + 9 heels + 3 pawns = 24 pieces
    expect(pieces).toHaveLength(24);
  });

  it("creates correct total number of pieces for 4-player game", () => {
    const pieces = initializeCampaignPieces(4);
    // 4 players: 14 marks + 13 heels + 4 pawns = 31 pieces
    expect(pieces).toHaveLength(31);
  });

  it("creates correct total number of pieces for 5-player game", () => {
    const pieces = initializeCampaignPieces(5);
    // 5 players: 18 marks + 17 heels + 5 pawns = 40 pieces
    expect(pieces).toHaveLength(40);
  });

  it("creates correct number of each piece type for 3-player game", () => {
    const pieces = initializeCampaignPieces(3);
    const marks = pieces.filter((p) => p.name === "Mark");
    const heels = pieces.filter((p) => p.name === "Heel");
    const pawns = pieces.filter((p) => p.name === "Pawn");

    expect(marks).toHaveLength(12);
    expect(heels).toHaveLength(9);
    expect(pawns).toHaveLength(3);
  });

  it("creates correct number of each piece type for 4-player game", () => {
    const pieces = initializeCampaignPieces(4);
    const marks = pieces.filter((p) => p.name === "Mark");
    const heels = pieces.filter((p) => p.name === "Heel");
    const pawns = pieces.filter((p) => p.name === "Pawn");

    expect(marks).toHaveLength(14);
    expect(heels).toHaveLength(13);
    expect(pawns).toHaveLength(4);
  });

  it("creates correct number of each piece type for 5-player game", () => {
    const pieces = initializeCampaignPieces(5);
    const marks = pieces.filter((p) => p.name === "Mark");
    const heels = pieces.filter((p) => p.name === "Heel");
    const pawns = pieces.filter((p) => p.name === "Pawn");

    expect(marks).toHaveLength(18);
    expect(heels).toHaveLength(17);
    expect(pawns).toHaveLength(5);
  });

  it("assigns unique piece IDs to all pieces", () => {
    const pieces = initializeCampaignPieces(3);
    const ids = pieces.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("assigns display names to all pieces", () => {
    const pieces = initializeCampaignPieces(3);
    pieces.forEach((piece) => {
      expect(piece.displayName).toBeDefined();
      expect(typeof piece.displayName).toBe("string");
      expect(piece.displayName.length).toBeGreaterThan(0);
    });
  });

  it("assigns positions to all pieces", () => {
    const pieces = initializeCampaignPieces(3);
    pieces.forEach((piece) => {
      expect(piece.position).toBeDefined();
      expect(piece.position.left).toBeDefined();
      expect(piece.position.top).toBeDefined();
    });
  });

  it("assigns rotation to all pieces", () => {
    const pieces = initializeCampaignPieces(3);
    pieces.forEach((piece) => {
      expect(piece.rotation).toBeDefined();
      expect(typeof piece.rotation).toBe("number");
    });
  });

  it("places marks at correct seats for 4-player game", () => {
    const pieces = initializeCampaignPieces(4);
    const marks = pieces.filter((p) => p.name === "Mark");
    const locationIds = marks.map((m) => m.locationId);

    // 4-player: marks at seats 2, 4, 6 for each player
    expect(locationIds.filter((id) => id?.includes("seat2"))).toHaveLength(4);
    expect(locationIds.filter((id) => id?.includes("seat4"))).toHaveLength(4);
    expect(locationIds.filter((id) => id?.includes("seat6"))).toHaveLength(4);
  });

  it("places marks at correct seats for 5-player game", () => {
    const pieces = initializeCampaignPieces(5);
    const marks = pieces.filter((p) => p.name === "Mark");
    const locationIds = marks.map((m) => m.locationId);

    // 5-player: marks at seats 1, 3, 5 for each player
    expect(locationIds.filter((id) => id?.includes("seat1"))).toHaveLength(5);
    expect(locationIds.filter((id) => id?.includes("seat3"))).toHaveLength(5);
    expect(locationIds.filter((id) => id?.includes("seat5"))).toHaveLength(5);
  });

  it("places heels and pawns in community locations for 3-player game", () => {
    const pieces = initializeCampaignPieces(3);
    const heels = pieces.filter((p) => p.name === "Heel");
    const pawns = pieces.filter((p) => p.name === "Pawn");

    // All heels and pawns should be in community locations (starting with "community")
    heels.forEach((heel) => {
      expect(heel.locationId).toMatch(/^community/);
    });

    pawns.forEach((pawn) => {
      expect(pawn.locationId).toMatch(/^community/);
    });
  });

  it("returns empty array for invalid player count", () => {
    const pieces = initializeCampaignPieces(99);
    expect(pieces).toEqual([]);
  });

  it("assigns imageUrl to all pieces", () => {
    const pieces = initializeCampaignPieces(3);
    pieces.forEach((piece) => {
      expect(piece.imageUrl).toBeDefined();
      expect(typeof piece.imageUrl).toBe("string");
      expect(piece.imageUrl.length).toBeGreaterThan(0);
    });
  });
});
