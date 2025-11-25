/**
 * Tests for adjacency and seating order functions
 */

import { describe, it, expect } from "vitest";
import type { Piece } from "../../types";
import { areSeatsAdjacent, getAdjacentSeats } from "../../../game";

describe("areSeatsAdjacent", () => {
  describe("same player seats", () => {
    it("returns true for consecutive seats on same player", () => {
      expect(areSeatsAdjacent("p1_seat1", "p1_seat2", 3)).toBe(true);
      expect(areSeatsAdjacent("p1_seat2", "p1_seat3", 3)).toBe(true);
      expect(areSeatsAdjacent("p2_seat4", "p2_seat5", 4)).toBe(true);
    });

    it("returns false for non-consecutive seats on same player", () => {
      expect(areSeatsAdjacent("p1_seat1", "p1_seat3", 3)).toBe(false);
      expect(areSeatsAdjacent("p1_seat2", "p1_seat5", 3)).toBe(false);
    });
  });

  describe("cross-player wrapping - 3 players", () => {
    it("wraps from p1 seat6 to p3 seat1", () => {
      expect(areSeatsAdjacent("p1_seat6", "p3_seat1", 3)).toBe(true);
      expect(areSeatsAdjacent("p3_seat1", "p1_seat6", 3)).toBe(true);
    });

    it("wraps from p3 seat6 to p2 seat1", () => {
      expect(areSeatsAdjacent("p3_seat6", "p2_seat1", 3)).toBe(true);
    });

    it("wraps from p2 seat6 to p1 seat1", () => {
      expect(areSeatsAdjacent("p2_seat6", "p1_seat1", 3)).toBe(true);
    });
  });

  describe("cross-player wrapping - 4 players", () => {
    it("wraps sequentially for 4 players", () => {
      expect(areSeatsAdjacent("p1_seat6", "p2_seat1", 4)).toBe(true);
      expect(areSeatsAdjacent("p2_seat6", "p3_seat1", 4)).toBe(true);
      expect(areSeatsAdjacent("p3_seat6", "p4_seat1", 4)).toBe(true);
      expect(areSeatsAdjacent("p4_seat6", "p1_seat1", 4)).toBe(true);
    });
  });

  describe("cross-player wrapping - 5 players", () => {
    it("wraps sequentially for 5 players", () => {
      expect(areSeatsAdjacent("p1_seat6", "p2_seat1", 5)).toBe(true);
      expect(areSeatsAdjacent("p5_seat6", "p1_seat1", 5)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("returns false for invalid location IDs", () => {
      expect(areSeatsAdjacent("invalid", "p1_seat1", 3)).toBe(false);
      expect(areSeatsAdjacent("p1_seat1", "invalid", 3)).toBe(false);
    });

    it("returns false for non-adjacent cross-player seats", () => {
      expect(areSeatsAdjacent("p1_seat1", "p2_seat1", 3)).toBe(false);
      expect(areSeatsAdjacent("p1_seat3", "p3_seat2", 3)).toBe(false);
    });
  });
});

describe("getAdjacentSeats", () => {
  describe("3-player games", () => {
    it("returns both neighbors for middle seats", () => {
      const adjacent = getAdjacentSeats("p1_seat3", 3);
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContain("p1_seat2");
      expect(adjacent).toContain("p1_seat4");
    });

    it("wraps from seat 1 to previous player's seat 6", () => {
      const adjacent = getAdjacentSeats("p1_seat1", 3);
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContain("p2_seat6"); // prev player (3-player: 1←2)
      expect(adjacent).toContain("p1_seat2");
    });

    it("wraps from seat 6 to next player's seat 1", () => {
      const adjacent = getAdjacentSeats("p1_seat6", 3);
      expect(adjacent).toHaveLength(2);
      expect(adjacent).toContain("p1_seat5");
      expect(adjacent).toContain("p3_seat1"); // next player (3-player: 1→3)
    });

    it("handles player 3 wrapping correctly", () => {
      const adjacent = getAdjacentSeats("p3_seat6", 3);
      expect(adjacent).toContain("p2_seat1"); // next player (3→2)
    });
  });

  describe("4-player games", () => {
    it("wraps sequentially for 4 players", () => {
      const adj1 = getAdjacentSeats("p1_seat6", 4);
      expect(adj1).toContain("p2_seat1");

      const adj2 = getAdjacentSeats("p4_seat6", 4);
      expect(adj2).toContain("p1_seat1");
    });
  });

  describe("5-player games", () => {
    it("wraps sequentially for 5 players", () => {
      const adj = getAdjacentSeats("p5_seat6", 5);
      expect(adj).toContain("p1_seat1");
    });
  });

  describe("edge cases", () => {
    it("returns empty array for invalid location ID", () => {
      expect(getAdjacentSeats("invalid", 3)).toEqual([]);
      expect(getAdjacentSeats("p1_rostrum1", 3)).toEqual([]);
    });
  });
});
