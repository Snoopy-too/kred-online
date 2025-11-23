/**
 * Positioning Utilities Tests
 *
 * Tests for position calculation and rotation utilities
 */

import { describe, it, expect } from "vitest";
import {
  BOARD_CENTERS,
  isPositionInCommunityCircle,
  calculatePieceRotation,
} from "../../utils/positioning";

describe("Positioning Utilities", () => {
  describe("BOARD_CENTERS", () => {
    it("should have board centers for 3, 4, and 5 players", () => {
      expect(BOARD_CENTERS).toBeDefined();
      expect(BOARD_CENTERS[3]).toBeDefined();
      expect(BOARD_CENTERS[4]).toBeDefined();
      expect(BOARD_CENTERS[5]).toBeDefined();
    });

    it("should have correct coordinates for 3-player board", () => {
      expect(BOARD_CENTERS[3]).toEqual({ left: 50.44, top: 44.01 });
    });

    it("should have correct coordinates for 4-player board", () => {
      expect(BOARD_CENTERS[4]).toEqual({ left: 49.94, top: 51.56 });
    });

    it("should have correct coordinates for 5-player board", () => {
      expect(BOARD_CENTERS[5]).toEqual({ left: 47.97, top: 47.07 });
    });
  });

  describe("isPositionInCommunityCircle", () => {
    it("should return true for center position", () => {
      const position = { left: 50, top: 50 };
      expect(isPositionInCommunityCircle(position)).toBe(true);
    });

    it("should return true for position within 15% radius", () => {
      const position = { left: 55, top: 50 }; // 5 units from center
      expect(isPositionInCommunityCircle(position)).toBe(true);
    });

    it("should return true for position at edge of circle", () => {
      const position = { left: 65, top: 50 }; // 15 units from center
      expect(isPositionInCommunityCircle(position)).toBe(true);
    });

    it("should return false for position outside circle", () => {
      const position = { left: 70, top: 50 }; // 20 units from center
      expect(isPositionInCommunityCircle(position)).toBe(false);
    });

    it("should return false for far corner position", () => {
      const position = { left: 10, top: 10 };
      expect(isPositionInCommunityCircle(position)).toBe(false);
    });

    it("should handle diagonal positions correctly", () => {
      // Position at 45 degrees, distance = sqrt(10^2 + 10^2) ≈ 14.14
      const position = { left: 60, top: 60 };
      expect(isPositionInCommunityCircle(position)).toBe(true);
    });
  });

  describe("calculatePieceRotation", () => {
    describe("special locations (no rotation)", () => {
      it("should return 0 for community locations", () => {
        const position = { left: 50, top: 40 };
        const rotation = calculatePieceRotation(position, 3, "community_1");
        expect(rotation).toBe(0);
      });

      it("should return 0 for free_placement location", () => {
        const position = { left: 50, top: 40 };
        const rotation = calculatePieceRotation(
          position,
          3,
          "free_placement"
        );
        expect(rotation).toBe(0);
      });

      it("should return 0 for office locations", () => {
        const position = { left: 50, top: 40 };
        const rotation = calculatePieceRotation(position, 3, "p1_office");
        expect(rotation).toBe(0);
      });
    });

    describe("rotation calculations for non-special locations", () => {
      it("should calculate rotation for position above center (3 players)", () => {
        const position = { left: 50.44, top: 30 }; // Directly above board center
        const rotation = calculatePieceRotation(position, 3);
        // Position is directly above, angle should be -90 degrees + 90 offset = 0
        expect(rotation).toBeCloseTo(0, 1);
      });

      it("should calculate rotation for position below center (3 players)", () => {
        const position = { left: 50.44, top: 60 }; // Directly below board center
        const rotation = calculatePieceRotation(position, 3);
        // Position is directly below, angle should be 90 degrees + 90 offset = 180
        expect(rotation).toBeCloseTo(180, 1);
      });

      it("should calculate rotation for position to the right (3 players)", () => {
        const position = { left: 70, top: 44.01 }; // Directly right of board center
        const rotation = calculatePieceRotation(position, 3);
        // Position is to the right, angle should be 0 degrees + 90 offset = 90
        expect(rotation).toBeCloseTo(90, 1);
      });

      it("should calculate rotation for position to the left (3 players)", () => {
        const position = { left: 30, top: 44.01 }; // Directly left of board center
        const rotation = calculatePieceRotation(position, 3);
        // Position is to the left, angle should be 180 degrees + 90 offset = 270 (or -90)
        expect(Math.abs(rotation - 270) < 1 || Math.abs(rotation + 90) < 1).toBe(true);
      });

      it("should use correct board center for 4 players", () => {
        const position = { left: 49.94, top: 40 }; // Above 4-player center
        const rotation = calculatePieceRotation(position, 4);
        expect(rotation).toBeCloseTo(0, 1);
      });

      it("should use correct board center for 5 players", () => {
        const position = { left: 47.97, top: 35 }; // Above 5-player center
        const rotation = calculatePieceRotation(position, 5);
        expect(rotation).toBeCloseTo(0, 1);
      });

      it("should use default center for unknown player count", () => {
        const position = { left: 50, top: 30 }; // Above default center
        const rotation = calculatePieceRotation(position, 7); // Invalid player count
        expect(rotation).toBeCloseTo(0, 1);
      });
    });

    describe("rotation for diagonal positions", () => {
      it("should calculate rotation for top-right diagonal", () => {
        const position = { left: 60, top: 30 };
        const rotation = calculatePieceRotation(position, 3);
        // Should be between 0 and 90 degrees
        expect(rotation).toBeGreaterThan(0);
        expect(rotation).toBeLessThan(90);
      });

      it("should calculate rotation for bottom-left diagonal", () => {
        const position = { left: 40, top: 55 };
        const rotation = calculatePieceRotation(position, 3);
        // Should be between 180 and 270 degrees (or negative equivalent)
        expect(rotation).toBeGreaterThan(180);
        expect(rotation).toBeLessThan(270);
      });
    });

    describe("without locationId parameter", () => {
      it("should calculate rotation when locationId is not provided", () => {
        const position = { left: 50.44, top: 30 };
        const rotation = calculatePieceRotation(position, 3);
        expect(rotation).toBeCloseTo(0, 1);
      });

      it("should calculate rotation when locationId is undefined", () => {
        const position = { left: 50.44, top: 60 };
        const rotation = calculatePieceRotation(position, 3, undefined);
        expect(rotation).toBeCloseTo(180, 1);
      });
    });
  });
});
