/**
 * Bureaucracy Types Tests
 *
 * Tests for bureaucracy phase type definitions
 */

import { describe, it, expect } from "vitest";
import type {
  BureaucracyItemType,
  BureaucracyMoveType,
  PromotionLocationType,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
} from "../../types/bureaucracy";

describe("Bureaucracy Types", () => {
  describe("BureaucracyItemType", () => {
    it("should accept valid item types", () => {
      const validTypes: BureaucracyItemType[] = ["MOVE", "PROMOTION", "CREDIBILITY"];
      expect(validTypes).toHaveLength(3);
    });
  });

  describe("BureaucracyMoveType", () => {
    it("should accept all valid move types", () => {
      const validMoves: BureaucracyMoveType[] = [
        "ADVANCE",
        "WITHDRAW",
        "ORGANIZE",
        "ASSIST",
        "REMOVE",
        "INFLUENCE",
      ];
      expect(validMoves).toHaveLength(6);
    });
  });

  describe("PromotionLocationType", () => {
    it("should accept all valid promotion location types", () => {
      const validLocations: PromotionLocationType[] = ["OFFICE", "ROSTRUM", "SEAT"];
      expect(validLocations).toHaveLength(3);
    });
  });

  describe("BureaucracyMenuItem", () => {
    it("should create a valid move menu item", () => {
      const item: BureaucracyMenuItem = {
        id: "advance",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 1,
        description: "Advance a Pawn",
      };

      expect(item.id).toBe("advance");
      expect(item.type).toBe("MOVE");
      expect(item.moveType).toBe("ADVANCE");
      expect(item.price).toBe(1);
      expect(item.description).toBe("Advance a Pawn");
    });

    it("should create a valid promotion menu item", () => {
      const item: BureaucracyMenuItem = {
        id: "promote_office",
        type: "PROMOTION",
        promotionLocation: "OFFICE",
        price: 2,
        description: "Promote to Office",
      };

      expect(item.id).toBe("promote_office");
      expect(item.type).toBe("PROMOTION");
      expect(item.promotionLocation).toBe("OFFICE");
      expect(item.price).toBe(2);
      expect(item.description).toBe("Promote to Office");
    });

    it("should create a valid credibility menu item", () => {
      const item: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 3,
        description: "Gain Credibility",
      };

      expect(item.id).toBe("credibility");
      expect(item.type).toBe("CREDIBILITY");
      expect(item.price).toBe(3);
      expect(item.description).toBe("Gain Credibility");
    });

    it("should allow optional moveType for non-move items", () => {
      const item: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 3,
        description: "Gain Credibility",
      };

      expect(item.moveType).toBeUndefined();
      expect(item.promotionLocation).toBeUndefined();
    });
  });

  describe("BureaucracyPurchase", () => {
    it("should create a valid purchase with all fields", () => {
      const item: BureaucracyMenuItem = {
        id: "advance",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 1,
        description: "Advance a Pawn",
      };

      const purchase: BureaucracyPurchase = {
        playerId: 1,
        item: item,
        pieceId: "piece_123",
        fromLocationId: "community_1",
        toLocationId: "seat_p1_1",
        timestamp: Date.now(),
        completed: false,
      };

      expect(purchase.playerId).toBe(1);
      expect(purchase.item).toEqual(item);
      expect(purchase.pieceId).toBe("piece_123");
      expect(purchase.fromLocationId).toBe("community_1");
      expect(purchase.toLocationId).toBe("seat_p1_1");
      expect(purchase.timestamp).toBeGreaterThan(0);
      expect(purchase.completed).toBe(false);
    });

    it("should allow optional location fields", () => {
      const item: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 3,
        description: "Gain Credibility",
      };

      const purchase: BureaucracyPurchase = {
        playerId: 2,
        item: item,
        timestamp: Date.now(),
        completed: true,
      };

      expect(purchase.pieceId).toBeUndefined();
      expect(purchase.fromLocationId).toBeUndefined();
      expect(purchase.toLocationId).toBeUndefined();
      expect(purchase.completed).toBe(true);
    });
  });

  describe("BureaucracyPlayerState", () => {
    it("should create a valid player state", () => {
      const playerState: BureaucracyPlayerState = {
        playerId: 1,
        initialKredcoin: 10,
        remainingKredcoin: 7,
        turnComplete: false,
        purchases: [],
      };

      expect(playerState.playerId).toBe(1);
      expect(playerState.initialKredcoin).toBe(10);
      expect(playerState.remainingKredcoin).toBe(7);
      expect(playerState.turnComplete).toBe(false);
      expect(playerState.purchases).toEqual([]);
    });

    it("should track multiple purchases", () => {
      const item1: BureaucracyMenuItem = {
        id: "advance",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 1,
        description: "Advance a Pawn",
      };

      const purchase1: BureaucracyPurchase = {
        playerId: 1,
        item: item1,
        pieceId: "piece_123",
        fromLocationId: "community_1",
        toLocationId: "seat_p1_1",
        timestamp: Date.now(),
        completed: true,
      };

      const item2: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 3,
        description: "Gain Credibility",
      };

      const purchase2: BureaucracyPurchase = {
        playerId: 1,
        item: item2,
        timestamp: Date.now() + 1000,
        completed: true,
      };

      const playerState: BureaucracyPlayerState = {
        playerId: 1,
        initialKredcoin: 10,
        remainingKredcoin: 6,
        turnComplete: true,
        purchases: [purchase1, purchase2],
      };

      expect(playerState.purchases).toHaveLength(2);
      expect(playerState.remainingKredcoin).toBe(6); // 10 - 1 - 3 = 6
      expect(playerState.turnComplete).toBe(true);
    });

    it("should allow empty purchases array", () => {
      const playerState: BureaucracyPlayerState = {
        playerId: 2,
        initialKredcoin: 5,
        remainingKredcoin: 5,
        turnComplete: false,
        purchases: [],
      };

      expect(playerState.purchases).toEqual([]);
      expect(playerState.remainingKredcoin).toBe(playerState.initialKredcoin);
    });
  });
});
