import { describe, it, expect } from "vitest";
import {
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
} from "../../game/bureaucracy";
import type { Player, Piece, BureaucracyMenuItem } from "../../types";
import type { PromotionLocationType } from "../../types/bureaucracy";
import type { Tile } from "../../types/tile";

// Helper to create test player
function createPlayer(
  id: number,
  bureaucracyTiles: Tile[] = []
): Player {
  return {
    id,
    hand: [],
    keptTiles: [],
    bureaucracyTiles,
    credibility: 10,
  };
}

// Helper to create test piece
function createPiece(
  id: string,
  name: string,
  locationId: string | null
): Piece {
  return {
    id,
    name,
    imageUrl: `/images/${name.toLowerCase()}.png`,
    position: { top: 0, left: 0 },
    rotation: 0,
    locationId,
  };
}

describe("calculatePlayerKredcoin", () => {
  it("should return 0 for player with no bureaucracy tiles", () => {
    const player = createPlayer(1, []);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(0);
  });

  it("should calculate kredcoin for player with one tile", () => {
    // Tile 1 is worth 1 Kredcoin
    const player = createPlayer(1, [{ id: 1, url: "" }]);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(1);
  });

  it("should calculate kredcoin for player with multiple tiles", () => {
    // Tiles 1 (1), 2 (2), 3 (0) = 3 total
    const player = createPlayer(1, [{ id: 1, url: "" }, { id: 2, url: "" }, { id: 3, url: "" }]);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(3);
  });

  it("should handle tiles with higher kredcoin values", () => {
    // Tile 24 is worth 9 Kredcoin
    const player = createPlayer(1, [{ id: 24, url: "" }]);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(9);
  });

  it("should handle mix of different value tiles", () => {
    // 1 (1) + 10 (2) + 24 (9) = 12
    const player = createPlayer(1, [{ id: 1, url: "" }, { id: 10, url: "" }, { id: 24, url: "" }]);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(12);
  });

  it("should handle unknown tiles as 0 value", () => {
    const player = createPlayer(1, [{ id: 999, url: "" }]);
    const kredcoin = calculatePlayerKredcoin(player);
    expect(kredcoin).toBe(0);
  });
});

describe("getBureaucracyTurnOrder", () => {
  it("should order players by kredcoin descending", () => {
    const players = [
      createPlayer(1, [{ id: 1, url: "" }]), // 1 kredcoin
      createPlayer(2, [{ id: 10, url: "" }]), // 2 kredcoin
      createPlayer(3, [{ id: 24, url: "" }]), // 9 kredcoin
    ];
    const turnOrder = getBureaucracyTurnOrder(players);
    expect(turnOrder).toEqual([3, 2, 1]);
  });

  it("should handle players with same kredcoin (tie-break by ID ascending)", () => {
    const players = [
      createPlayer(1, [{ id: 1, url: "" }]), // 1 kredcoin
      createPlayer(2, [{ id: 2, url: "" }]), // 2 kredcoin
      createPlayer(3, [{ id: 1, url: "" }]), // 1 kredcoin
    ];
    const turnOrder = getBureaucracyTurnOrder(players);
    expect(turnOrder).toEqual([2, 1, 3]); // 2 has 2kr, then 1 and 3 tied at 1kr (order by ID)
  });

  it("should handle mix of tied and different kredcoin values", () => {
    const players = [
      createPlayer(1, [{ id: 10, url: "" }]), // 2 kredcoin
      createPlayer(2, [{ id: 1, url: "" }]), // 1 kredcoin
      createPlayer(3, [{ id: 10, url: "" }]), // 2 kredcoin
      createPlayer(4, [{ id: 24, url: "" }]), // 9 kredcoin
    ];
    const turnOrder = getBureaucracyTurnOrder(players);
    expect(turnOrder).toEqual([4, 1, 3, 2]); // 4(9), 1(2), 3(2), 2(1)
  });

  it("should handle all players with 0 kredcoin", () => {
    const players = [
      createPlayer(1, []),
      createPlayer(2, []),
      createPlayer(3, []),
    ];
    const turnOrder = getBureaucracyTurnOrder(players);
    expect(turnOrder).toEqual([1, 2, 3]); // Tie-break by ID
  });

  it("should handle single player", () => {
    const players = [createPlayer(1, [{ id: 1, url: "" }])];
    const turnOrder = getBureaucracyTurnOrder(players);
    expect(turnOrder).toEqual([1]);
  });
});

describe("getBureaucracyMenu", () => {
  it("should return 3-4 player menu for 3 players", () => {
    const menu = getBureaucracyMenu(3);
    expect(Array.isArray(menu)).toBe(true);
    expect(menu.length).toBeGreaterThan(0);
  });

  it("should return 3-4 player menu for 4 players", () => {
    const menu = getBureaucracyMenu(4);
    expect(Array.isArray(menu)).toBe(true);
    expect(menu.length).toBeGreaterThan(0);
  });

  it("should return 5 player menu for 5 players", () => {
    const menu = getBureaucracyMenu(5);
    expect(Array.isArray(menu)).toBe(true);
    expect(menu.length).toBeGreaterThan(0);
  });

  it("should return different menus for 3-4 vs 5 players", () => {
    const menu34 = getBureaucracyMenu(3);
    const menu5 = getBureaucracyMenu(5);
    expect(menu34).not.toEqual(menu5);
  });
});

describe("getAvailablePurchases", () => {
  const mockMenu: BureaucracyMenuItem[] = [
    {
      id: "item1",
      description: "Cheap Item",
      price: 1,
      type: "PROMOTION",
      promotionLocation: "SEAT",
    },
    {
      id: "item2",
      description: "Medium Item",
      price: 3,
      type: "PROMOTION",
      promotionLocation: "ROSTRUM",
    },
    {
      id: "item3",
      description: "Expensive Item",
      price: 5,
      type: "PROMOTION",
      promotionLocation: "OFFICE",
    },
  ];

  it("should return all items when kredcoin covers all prices", () => {
    const available = getAvailablePurchases(mockMenu, 10);
    expect(available.length).toBe(3);
  });

  it("should filter out items player cannot afford", () => {
    const available = getAvailablePurchases(mockMenu, 3);
    expect(available.length).toBe(2);
    expect(available[0].price).toBe(1);
    expect(available[1].price).toBe(3);
  });

  it("should return only exact price matches and below", () => {
    const available = getAvailablePurchases(mockMenu, 1);
    expect(available.length).toBe(1);
    expect(available[0].price).toBe(1);
  });

  it("should return empty array when kredcoin is 0", () => {
    const available = getAvailablePurchases(mockMenu, 0);
    expect(available.length).toBe(0);
  });

  it("should return empty array when no items are affordable", () => {
    const available = getAvailablePurchases(
      [{ id: "item", description: "Item", price: 10, type: "PROMOTION", promotionLocation: "SEAT" }],
      5
    );
    expect(available.length).toBe(0);
  });
});

describe("validatePromotion", () => {
  it("should validate promotion from seat (Mark -> Heel)", () => {
    const beforePieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      createPiece("heel1", "Heel", "community_1"),
    ];
    const afterPieces = [
      createPiece("mark1", "Mark", "community_1"),
      createPiece("heel1", "Heel", "p1_seat1"),
    ];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "SEAT",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(true);
  });

  it("should validate promotion from rostrum (Mark -> Heel)", () => {
    const beforePieces = [
      createPiece("mark1", "Mark", "p1_rostrum1"),
      createPiece("heel1", "Heel", "community_1"),
    ];
    const afterPieces = [
      createPiece("mark1", "Mark", "community_1"),
      createPiece("heel1", "Heel", "p1_rostrum1"),
    ];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "ROSTRUM",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(true);
  });

  it("should validate promotion from office (Heel -> Pawn)", () => {
    const beforePieces = [
      createPiece("heel1", "Heel", "p1_office"),
      createPiece("pawn1", "Pawn", "community_1"),
    ];
    const afterPieces = [
      createPiece("heel1", "Heel", "community_1"),
      createPiece("pawn1", "Pawn", "p1_office"),
    ];

    const result = validatePromotion(
      afterPieces,
      "heel1",
      "OFFICE",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(true);
  });

  it("should reject promotion if piece not found before", () => {
    const result = validatePromotion([], "missing", "SEAT", 1, []);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("Original piece not found");
  });

  it("should reject promotion if piece not found after", () => {
    const beforePieces = [createPiece("mark1", "Mark", "p1_seat1")];
    const result = validatePromotion([], "mark1", "SEAT", 1, beforePieces);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("Piece not found after");
  });

  it("should reject promotion from wrong player domain", () => {
    const beforePieces = [
      createPiece("mark1", "Mark", "p2_seat1"),
      createPiece("heel1", "Heel", "community_1"),
    ];
    const afterPieces = [
      createPiece("mark1", "Mark", "community_1"),
      createPiece("heel1", "Heel", "p2_seat1"),
    ];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "SEAT",
      1, // Player 1 trying to promote from player 2's domain
      beforePieces
    );

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("Player 1's domain");
  });

  it("should reject promotion from wrong location type (seat expected, rostrum provided)", () => {
    const beforePieces = [
      createPiece("mark1", "Mark", "p1_rostrum1"),
      createPiece("heel1", "Heel", "community_1"),
    ];
    const afterPieces = [
      createPiece("mark1", "Mark", "community_1"),
      createPiece("heel1", "Heel", "p1_rostrum1"),
    ];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "SEAT", // Expected SEAT but piece was in ROSTRUM
      1,
      beforePieces
    );

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("must be in a Seat");
  });

  it("should reject promotion of Pawn (cannot promote further)", () => {
    const beforePieces = [
      createPiece("pawn1", "Pawn", "p1_office"),
      createPiece("mark1", "Mark", "community_1"),
    ];
    const afterPieces = [
      createPiece("pawn1", "Pawn", "community_1"),
      createPiece("mark1", "Mark", "p1_office"),
    ];

    const result = validatePromotion(
      afterPieces,
      "pawn1",
      "OFFICE",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("Only Marks and Heels");
  });

  it("should reject if promoted piece not in community after", () => {
    const beforePieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      createPiece("heel1", "Heel", "community_1"),
    ];
    const afterPieces = [
      createPiece("mark1", "Mark", "p1_seat2"), // Still in domain
      createPiece("heel1", "Heel", "p1_seat1"),
    ];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "SEAT",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("must move to community");
  });

  it("should reject if no replacement piece in original location", () => {
    const beforePieces = [createPiece("mark1", "Mark", "p1_seat1")];
    const afterPieces = [createPiece("mark1", "Mark", "community_1")];

    const result = validatePromotion(
      afterPieces,
      "mark1",
      "SEAT",
      1,
      beforePieces
    );

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("must now occupy");
  });
});

describe("performPromotion", () => {
  it("should promote Mark to Heel", () => {
    const pieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      createPiece("heel1", "Heel", "community_1"),
    ];

    const result = performPromotion(pieces, "mark1");

    expect(result.success).toBe(true);
    const mark = result.pieces.find((p) => p.id === "mark1");
    const heel = result.pieces.find((p) => p.id === "heel1");
    expect(mark?.locationId).toBe("community_1");
    expect(heel?.locationId).toBe("p1_seat1");
  });

  it("should promote Heel to Pawn", () => {
    const pieces = [
      createPiece("heel1", "Heel", "p1_rostrum1"),
      createPiece("pawn1", "Pawn", "community_2"),
    ];

    const result = performPromotion(pieces, "heel1");

    expect(result.success).toBe(true);
    const heel = result.pieces.find((p) => p.id === "heel1");
    const pawn = result.pieces.find((p) => p.id === "pawn1");
    expect(heel?.locationId).toBe("community_2");
    expect(pawn?.locationId).toBe("p1_rostrum1");
  });

  it("should fail if piece not found", () => {
    const pieces = [createPiece("mark1", "Mark", "p1_seat1")];
    const result = performPromotion(pieces, "missing");

    expect(result.success).toBe(false);
    expect(result.reason).toContain("Piece not found");
  });

  it("should fail if trying to promote Pawn", () => {
    const pieces = [createPiece("pawn1", "Pawn", "p1_office")];
    const result = performPromotion(pieces, "pawn1");

    expect(result.success).toBe(false);
    expect(result.reason).toContain("cannot be promoted further");
  });

  it("should fail if no Heel available for Mark promotion", () => {
    const pieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      // No Heel in community
    ];
    const result = performPromotion(pieces, "mark1");

    expect(result.success).toBe(false);
    expect(result.reason).toContain("No Heel available");
  });

  it("should fail if no Pawn available for Heel promotion", () => {
    const pieces = [
      createPiece("heel1", "Heel", "p1_rostrum1"),
      // No Pawn in community
    ];
    const result = performPromotion(pieces, "heel1");

    expect(result.success).toBe(false);
    expect(result.reason).toContain("No Pawn available");
  });

  it("should swap positions correctly", () => {
    const pieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      createPiece("heel1", "Heel", "community_1"),
    ];

    const markBefore = pieces.find((p) => p.id === "mark1");
    const heelBefore = pieces.find((p) => p.id === "heel1");

    const result = performPromotion(pieces, "mark1");

    const markAfter = result.pieces.find((p) => p.id === "mark1");
    const heelAfter = result.pieces.find((p) => p.id === "heel1");

    // Positions should be swapped
    expect(markAfter?.position).toEqual(heelBefore?.position);
    expect(heelAfter?.position).toEqual(markBefore?.position);
  });

  it("should preserve other pieces unchanged", () => {
    const pieces = [
      createPiece("mark1", "Mark", "p1_seat1"),
      createPiece("heel1", "Heel", "community_1"),
      createPiece("pawn1", "Pawn", "p1_seat2"),
      createPiece("mark2", "Mark", "community_2"),
    ];

    const result = performPromotion(pieces, "mark1");

    const pawn = result.pieces.find((p) => p.id === "pawn1");
    const mark2 = result.pieces.find((p) => p.id === "mark2");

    expect(pawn?.locationId).toBe("p1_seat2");
    expect(mark2?.locationId).toBe("community_2");
  });
});
