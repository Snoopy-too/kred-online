import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBonusMoves } from "../../hooks/useBonusMoves";

/**
 * Tests for useBonusMoves hook
 *
 * Covers:
 * - Initial state
 * - Bonus move initiation and completion
 * - Skip and cancel operations
 * - Perfect tile modal
 * - State queries
 */

describe("useBonusMoves", () => {
  describe("Initial State", () => {
    it("should initialize bonus move modal as hidden", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.showBonusMoveModal).toBe(false);
    });

    it("should initialize bonus move player ID as null", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.bonusMovePlayerId).toBeNull();
    });

    it("should initialize bonus move completed as false", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.bonusMoveWasCompleted).toBe(false);
    });

    it("should initialize perfect tile modal as hidden", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.showPerfectTileModal).toBe(false);
    });
  });

  describe("Bonus Move Lifecycle", () => {
    it("should initiate bonus move for a player", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.initiateBonusMove(2);
      });

      expect(result.current.showBonusMoveModal).toBe(true);
      expect(result.current.bonusMovePlayerId).toBe(2);
      expect(result.current.bonusMoveWasCompleted).toBe(false);
    });

    it("should complete bonus move", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.initiateBonusMove(1);
      });

      act(() => {
        result.current.completeBonusMove();
      });

      expect(result.current.showBonusMoveModal).toBe(false);
      expect(result.current.bonusMoveWasCompleted).toBe(true);
    });

    it("should skip bonus move without completing", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.initiateBonusMove(1);
      });

      act(() => {
        result.current.skipBonusMove();
      });

      expect(result.current.showBonusMoveModal).toBe(false);
      expect(result.current.bonusMoveWasCompleted).toBe(false);
    });

    it("should cancel bonus move and reset player", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.initiateBonusMove(3);
      });

      act(() => {
        result.current.cancelBonusMove();
      });

      expect(result.current.showBonusMoveModal).toBe(false);
      expect(result.current.bonusMovePlayerId).toBeNull();
      expect(result.current.bonusMoveWasCompleted).toBe(false);
    });
  });

  describe("Perfect Tile Modal", () => {
    it("should show perfect tile reward modal", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.showPerfectTileReward();
      });

      expect(result.current.showPerfectTileModal).toBe(true);
    });

    it("should hide perfect tile reward modal", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.showPerfectTileReward();
      });

      act(() => {
        result.current.hidePerfectTileReward();
      });

      expect(result.current.showPerfectTileModal).toBe(false);
    });
  });

  describe("State Queries", () => {
    it("should report bonus move as active when modal is shown", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.isBonusMoveActive()).toBe(false);

      act(() => {
        result.current.initiateBonusMove(1);
      });

      expect(result.current.isBonusMoveActive()).toBe(true);
    });

    it("should report bonus move completion status", () => {
      const { result } = renderHook(() => useBonusMoves());

      expect(result.current.wasBonusMoveCompleted()).toBe(false);

      act(() => {
        result.current.initiateBonusMove(1);
        result.current.completeBonusMove();
      });

      expect(result.current.wasBonusMoveCompleted()).toBe(true);
    });
  });

  describe("Reset", () => {
    it("should reset all bonus move state", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.initiateBonusMove(2);
        result.current.completeBonusMove();
        result.current.showPerfectTileReward();
      });

      act(() => {
        result.current.resetBonusMoveState();
      });

      expect(result.current.showBonusMoveModal).toBe(false);
      expect(result.current.bonusMovePlayerId).toBeNull();
      expect(result.current.bonusMoveWasCompleted).toBe(false);
      expect(result.current.showPerfectTileModal).toBe(false);
    });
  });

  describe("Direct Setters", () => {
    it("should allow direct setShowBonusMoveModal", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.setShowBonusMoveModal(true);
      });

      expect(result.current.showBonusMoveModal).toBe(true);
    });

    it("should allow direct setBonusMovePlayerId", () => {
      const { result } = renderHook(() => useBonusMoves());

      act(() => {
        result.current.setBonusMovePlayerId(5);
      });

      expect(result.current.bonusMovePlayerId).toBe(5);
    });
  });
});
