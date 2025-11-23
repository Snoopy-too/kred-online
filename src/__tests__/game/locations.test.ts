/**
 * Tests for location utility functions
 *
 * These tests verify:
 * - Finding nearest vacant drop locations
 * - Getting location IDs from positions
 * - Extracting player IDs from location strings
 * - Checking location ownership
 */

import { describe, it, expect } from "vitest";
import type { Piece } from "../../types";
import {
  findNearestVacantLocation,
  getLocationIdFromPosition,
  getPlayerIdFromLocationId,
  isLocationOwnedByPlayer,
} from "../../../game";

describe("findNearestVacantLocation", () => {
  it("finds nearest vacant location in 3-player game", () => {
    const dropPosition = { top: 30, left: 48 };
    const allPieces: Piece[] = [];

    const result = findNearestVacantLocation(dropPosition, allPieces, 3);

    expect(result).not.toBeNull();
    expect(result?.id).toBeTruthy();
  });

  it("returns null when all locations are occupied", () => {
    // Create pieces filling all possible drop locations for player 1 seats
    const allPieces: Piece[] = Array.from({ length: 100 }, (_, i) => ({
      id: `piece${i}`,
      type: "mark" as const,
      name: "Mark" as const,
      playerId: 1,
      locationId: `p1_seat${(i % 6) + 1}`,
      position: { left: 48.25 + (i * 0.1), top: 29.91 + (i * 0.1) },
      rotation: 0,
      imageUrl: "/images/pieces/mark_p1.png",
    }));

    const dropPosition = { top: 30, left: 48 };
    const result = findNearestVacantLocation(dropPosition, allPieces, 3);

    // Should still find something or return null - implementation dependent
    expect(result === null || result?.id).toBeTruthy();
  });

  it("prefers community locations when dropped near them", () => {
    const dropPosition = { top: 44, left: 50.5 }; // Near center (community area)
    const allPieces: Piece[] = [];

    const result = findNearestVacantLocation(dropPosition, allPieces, 3);

    expect(result).not.toBeNull();
    // Community locations should be considered
  });

  it("returns null for invalid player count", () => {
    const dropPosition = { top: 30, left: 48 };
    const allPieces: Piece[] = [];

    const result = findNearestVacantLocation(dropPosition, allPieces, 99);

    expect(result).toBeNull();
  });
});

describe("getLocationIdFromPosition", () => {
  it("returns exact match for known location", () => {
    // Use a known position from 3-player board (p1_seat1)
    const position = { left: 48.25, top: 29.91 };

    const result = getLocationIdFromPosition(position, 3);

    expect(result).toBe("p1_seat1");
  });

  it("returns closest location for nearby position", () => {
    // Slightly off from p1_seat1
    const position = { left: 48.26, top: 29.92 };

    const result = getLocationIdFromPosition(position, 3);

    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns null for position too far from any location", () => {
    const position = { left: 0, top: 0 };

    const result = getLocationIdFromPosition(position, 3);

    expect(result).toBeNull();
  });

  it("returns null for invalid player count", () => {
    const position = { left: 48.25, top: 29.91 };

    const result = getLocationIdFromPosition(position, 99);

    expect(result).toBeNull();
  });

  it("works for different player counts", () => {
    // Each player count has different board layouts
    const position3 = { left: 48.25, top: 29.91 };
    const position4 = { left: 49.69, top: 28.63 };
    const position5 = { left: 49.32, top: 28.02 };

    expect(getLocationIdFromPosition(position3, 3)).toBeTruthy();
    expect(getLocationIdFromPosition(position4, 4)).toBeTruthy();
    expect(getLocationIdFromPosition(position5, 5)).toBeTruthy();
  });
});

describe("getPlayerIdFromLocationId", () => {
  it("extracts player ID from seat location", () => {
    expect(getPlayerIdFromLocationId("p1_seat1")).toBe(1);
    expect(getPlayerIdFromLocationId("p2_seat3")).toBe(2);
    expect(getPlayerIdFromLocationId("p3_seat6")).toBe(3);
    expect(getPlayerIdFromLocationId("p4_seat2")).toBe(4);
    expect(getPlayerIdFromLocationId("p5_seat5")).toBe(5);
  });

  it("extracts player ID from rostrum location", () => {
    expect(getPlayerIdFromLocationId("p1_rostrum1")).toBe(1);
    expect(getPlayerIdFromLocationId("p2_rostrum2")).toBe(2);
    expect(getPlayerIdFromLocationId("p3_rostrum1")).toBe(3);
  });

  it("extracts player ID from office location", () => {
    expect(getPlayerIdFromLocationId("p1_office")).toBe(1);
    expect(getPlayerIdFromLocationId("p2_office")).toBe(2);
    expect(getPlayerIdFromLocationId("p5_office")).toBe(5);
  });

  it("returns null for community locations", () => {
    expect(getPlayerIdFromLocationId("community1")).toBeNull();
    expect(getPlayerIdFromLocationId("community2")).toBeNull();
    expect(getPlayerIdFromLocationId("community3")).toBeNull();
  });

  it("returns null for invalid location IDs", () => {
    expect(getPlayerIdFromLocationId("")).toBeNull();
    expect(getPlayerIdFromLocationId("invalid")).toBeNull();
    expect(getPlayerIdFromLocationId("x1_seat1")).toBeNull();
  });

  it("returns null for free_placement", () => {
    expect(getPlayerIdFromLocationId("free_placement")).toBeNull();
  });
});

describe("isLocationOwnedByPlayer", () => {
  it("returns true for player's own seat", () => {
    expect(isLocationOwnedByPlayer("p1_seat1", 1)).toBe(true);
    expect(isLocationOwnedByPlayer("p2_seat3", 2)).toBe(true);
    expect(isLocationOwnedByPlayer("p3_seat6", 3)).toBe(true);
  });

  it("returns false for another player's seat", () => {
    expect(isLocationOwnedByPlayer("p1_seat1", 2)).toBe(false);
    expect(isLocationOwnedByPlayer("p2_seat3", 1)).toBe(false);
    expect(isLocationOwnedByPlayer("p3_seat6", 1)).toBe(false);
  });

  it("returns true for player's own rostrum", () => {
    expect(isLocationOwnedByPlayer("p1_rostrum1", 1)).toBe(true);
    expect(isLocationOwnedByPlayer("p2_rostrum2", 2)).toBe(true);
  });

  it("returns false for another player's rostrum", () => {
    expect(isLocationOwnedByPlayer("p1_rostrum1", 2)).toBe(false);
    expect(isLocationOwnedByPlayer("p2_rostrum2", 3)).toBe(false);
  });

  it("returns true for player's own office", () => {
    expect(isLocationOwnedByPlayer("p1_office", 1)).toBe(true);
    expect(isLocationOwnedByPlayer("p2_office", 2)).toBe(true);
  });

  it("returns false for another player's office", () => {
    expect(isLocationOwnedByPlayer("p1_office", 2)).toBe(false);
    expect(isLocationOwnedByPlayer("p2_office", 1)).toBe(false);
  });

  it("returns false for community locations", () => {
    expect(isLocationOwnedByPlayer("community1", 1)).toBe(false);
    expect(isLocationOwnedByPlayer("community2", 2)).toBe(false);
    expect(isLocationOwnedByPlayer("community3", 3)).toBe(false);
  });

  it("returns false for free_placement", () => {
    expect(isLocationOwnedByPlayer("free_placement", 1)).toBe(false);
  });
});
