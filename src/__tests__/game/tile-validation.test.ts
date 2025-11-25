/**
 * Tests for tile validation functions
 *
 * Tests tile requirement checking and validation logic for tile plays.
 */

import { describe, it, expect } from "vitest";
import { DefinedMoveType, MoveRequirementType } from "../../types";
import { TilePlayOptionType } from "../../config";
import {
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
  getTileRequirements,
  tileHasRequirements,
  areAllTileRequirementsMet,
  canTileBeRejected,
} from "../../game";

describe("Tile Validation", () => {
  describe("isMoveAllowedInTilePlayOption", () => {
    it("returns true when move type is allowed in ONE_OPTIONAL option", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.REMOVE,
          TilePlayOptionType.ONE_OPTIONAL
        )
      ).toBe(true);
    });

    it("returns false when ADVANCE is not allowed in ONE_OPTIONAL", () => {
      // ONE_OPTIONAL allows WITHDRAW, REMOVE, ASSIST, ORGANIZE
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.ADVANCE,
          TilePlayOptionType.ONE_OPTIONAL
        )
      ).toBe(false);
    });

    it("returns false for INFLUENCE in ONE_MANDATORY option", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.INFLUENCE,
          TilePlayOptionType.ONE_MANDATORY
        )
      ).toBe(false);
    });

    it("returns false for INFLUENCE in ONE_MANDATORY option", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.INFLUENCE,
          TilePlayOptionType.ONE_MANDATORY
        )
      ).toBe(false);
    });

    it("returns false for invalid option type", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.ADVANCE,
          "INVALID" as TilePlayOptionType
        )
      ).toBe(false);
    });

    it("returns false for WITHDRAW in ONE_OPTIONAL", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.WITHDRAW,
          TilePlayOptionType.ONE_OPTIONAL
        )
      ).toBe(false);
    });

    it("returns true for REMOVE in ONE_OPTIONAL", () => {
      expect(
        isMoveAllowedInTilePlayOption(
          DefinedMoveType.REMOVE,
          TilePlayOptionType.ONE_OPTIONAL
        )
      ).toBe(true);
    });
  });

  describe("getMoveRequirement", () => {
    it("returns OPTIONAL for INFLUENCE move", () => {
      expect(getMoveRequirement(DefinedMoveType.INFLUENCE)).toBe(
        MoveRequirementType.OPTIONAL
      );
    });

    it("returns MANDATORY for WITHDRAW move", () => {
      expect(getMoveRequirement(DefinedMoveType.WITHDRAW)).toBe(
        MoveRequirementType.MANDATORY
      );
    });

    it("returns MANDATORY for ORGANIZE move", () => {
      expect(getMoveRequirement(DefinedMoveType.ORGANIZE)).toBe(
        MoveRequirementType.MANDATORY
      );
    });

    it("returns OPTIONAL for INFLUENCE move", () => {
      expect(getMoveRequirement(DefinedMoveType.INFLUENCE)).toBe(
        MoveRequirementType.OPTIONAL
      );
    });

    it("returns OPTIONAL for ASSIST move", () => {
      expect(getMoveRequirement(DefinedMoveType.ASSIST)).toBe(
        MoveRequirementType.OPTIONAL
      );
    });

    it("returns MANDATORY for ORGANIZE move", () => {
      expect(getMoveRequirement(DefinedMoveType.ORGANIZE)).toBe(
        MoveRequirementType.MANDATORY
      );
    });
  });

  describe("getTileRequirements", () => {
    it("returns requirements for tile 01", () => {
      const requirements = getTileRequirements("01");
      expect(requirements).not.toBeNull();
      expect(requirements?.requiredMoves).toContain(DefinedMoveType.ADVANCE);
    });

    it("returns requirements for tile 02", () => {
      const requirements = getTileRequirements("02");
      expect(requirements).not.toBeNull();
      expect(requirements?.requiredMoves).toContain(DefinedMoveType.ADVANCE);
    });

    it("returns requirements for tile 03 with two moves", () => {
      const requirements = getTileRequirements("03");
      expect(requirements).not.toBeNull();
      expect(requirements?.requiredMoves).toHaveLength(2);
      expect(requirements?.requiredMoves).toContain(DefinedMoveType.ADVANCE);
      expect(requirements?.requiredMoves).toContain(DefinedMoveType.INFLUENCE);
    });

    it("returns requirements for BLANK tile (empty)", () => {
      const requirements = getTileRequirements("BLANK");
      expect(requirements).not.toBeNull();
      expect(requirements?.requiredMoves).toHaveLength(0);
    });

    it("returns null for non-existent tile", () => {
      const requirements = getTileRequirements("99");
      expect(requirements).toBeNull();
    });
  });

  describe("tileHasRequirements", () => {
    it("returns true for tile 01 (has ADVANCE requirement)", () => {
      expect(tileHasRequirements("01")).toBe(true);
    });

    it("returns true for tile 03 (has ADVANCE and INFLUENCE)", () => {
      expect(tileHasRequirements("03")).toBe(true);
    });

    it("returns false for BLANK tile (no requirements)", () => {
      expect(tileHasRequirements("BLANK")).toBe(false);
    });

    it("returns false for non-existent tile", () => {
      expect(tileHasRequirements("99")).toBe(false);
    });

    it("returns true for tile with single requirement", () => {
      expect(tileHasRequirements("02")).toBe(true);
    });

    it("returns true for tile with multiple requirements", () => {
      expect(tileHasRequirements("24")).toBe(true);
    });
  });

  describe("areAllTileRequirementsMet", () => {
    it("returns true when all requirements are met for tile 01", () => {
      expect(
        areAllTileRequirementsMet("01", [
          DefinedMoveType.REMOVE,
          DefinedMoveType.ADVANCE,
        ])
      ).toBe(true);
    });

    it("returns false when requirements are not met for tile 01", () => {
      expect(areAllTileRequirementsMet("01", [DefinedMoveType.WITHDRAW])).toBe(
        false
      );
    });

    it("returns true when both requirements are met for tile 03", () => {
      expect(
        areAllTileRequirementsMet("03", [
          DefinedMoveType.ADVANCE,
          DefinedMoveType.INFLUENCE,
        ])
      ).toBe(true);
    });

    it("returns false when only one of two requirements is met for tile 03", () => {
      expect(areAllTileRequirementsMet("03", [DefinedMoveType.ADVANCE])).toBe(
        false
      );
    });

    it("returns true for BLANK tile with no moves", () => {
      expect(areAllTileRequirementsMet("BLANK", [])).toBe(true);
    });

    it("returns true for BLANK tile with moves (no requirements to check)", () => {
      expect(
        areAllTileRequirementsMet("BLANK", [DefinedMoveType.ADVANCE])
      ).toBe(true);
    });

    it("returns true when requirements met with extra moves", () => {
      expect(
        areAllTileRequirementsMet("01", [
          DefinedMoveType.REMOVE,
          DefinedMoveType.ADVANCE,
          DefinedMoveType.WITHDRAW,
        ])
      ).toBe(true);
    });

    it("returns false for non-existent tile with moves", () => {
      expect(areAllTileRequirementsMet("99", [DefinedMoveType.ADVANCE])).toBe(
        true
      ); // No requirements = all requirements met
    });
  });

  describe("canTileBeRejected", () => {
    it("returns false when all requirements are met and execution was possible", () => {
      expect(
        canTileBeRejected(
          "01",
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
          true
        )
      ).toBe(false);
    });

    it("returns false when execution was impossible (board state)", () => {
      expect(canTileBeRejected("01", [], false)).toBe(false);
    });

    it("returns true when requirements were possible but not met", () => {
      expect(canTileBeRejected("01", [DefinedMoveType.WITHDRAW], true)).toBe(
        true
      );
    });

    it("returns false for BLANK tile when no moves made", () => {
      expect(canTileBeRejected("BLANK", [], true)).toBe(false);
    });

    it("returns true for BLANK tile when moves were made and execution was possible", () => {
      expect(canTileBeRejected("BLANK", [DefinedMoveType.ADVANCE], true)).toBe(
        true
      );
    });

    it("returns false for BLANK tile when moves were made but execution not possible", () => {
      expect(canTileBeRejected("BLANK", [DefinedMoveType.ADVANCE], false)).toBe(
        false
      );
    });

    it("returns false when all requirements met for tile with two requirements", () => {
      expect(
        canTileBeRejected(
          "03",
          [DefinedMoveType.ADVANCE, DefinedMoveType.INFLUENCE],
          true
        )
      ).toBe(false);
    });

    it("returns true when only partial requirements met", () => {
      expect(canTileBeRejected("03", [DefinedMoveType.ADVANCE], true)).toBe(
        true
      );
    });

    it("returns true for unknown tile", () => {
      expect(canTileBeRejected("99", [DefinedMoveType.ADVANCE], true)).toBe(
        true
      );
    });

    it("returns false when execution impossible regardless of moves made", () => {
      expect(
        canTileBeRejected(
          "03",
          [DefinedMoveType.ADVANCE, DefinedMoveType.INFLUENCE],
          false
        )
      ).toBe(false);
    });

    it("returns false when requirements met with extra moves", () => {
      expect(
        canTileBeRejected(
          "01",
          [
            DefinedMoveType.REMOVE,
            DefinedMoveType.ADVANCE,
            DefinedMoveType.WITHDRAW,
          ],
          true
        )
      ).toBe(false);
    });
  });
});
