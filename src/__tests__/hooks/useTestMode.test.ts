import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTestMode } from "../../hooks/useTestMode";

/**
 * Tests for useTestMode hook
 *
 * Covers:
 * - Initial state
 * - Game log operations
 * - UI expansion toggles
 * - Credibility rotation adjustments
 */

describe("useTestMode", () => {
  describe("Initial State", () => {
    it("should initialize game log as empty array", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.gameLog).toEqual([]);
    });

    it("should initialize game log as expanded", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isGameLogExpanded).toBe(true);
    });

    it("should initialize credibility adjuster as collapsed", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isCredibilityAdjusterExpanded).toBe(false);
    });

    it("should initialize credibility rules as collapsed", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isCredibilityRulesExpanded).toBe(false);
    });

    it("should initialize piece tracker as collapsed", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isPieceTrackerExpanded).toBe(false);
    });

    it("should initialize credibility adjustments as empty object", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.credibilityRotationAdjustments).toEqual({});
    });
  });

  describe("Game Log Operations", () => {
    it("should add a single log message", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.addGameLog("Player 1 moved piece");
      });

      expect(result.current.gameLog).toEqual(["Player 1 moved piece"]);
    });

    it("should add multiple log messages in sequence", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.addGameLog("First action");
      });
      act(() => {
        result.current.addGameLog("Second action");
      });

      expect(result.current.gameLog).toEqual(["First action", "Second action"]);
    });

    it("should add multiple logs at once", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.addGameLogs(["Action 1", "Action 2", "Action 3"]);
      });

      expect(result.current.gameLog).toEqual([
        "Action 1",
        "Action 2",
        "Action 3",
      ]);
    });

    it("should append when adding multiple logs to existing", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.addGameLog("Existing");
      });
      act(() => {
        result.current.addGameLogs(["New 1", "New 2"]);
      });

      expect(result.current.gameLog).toEqual(["Existing", "New 1", "New 2"]);
    });

    it("should clear the game log", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.addGameLogs(["Log 1", "Log 2"]);
      });

      act(() => {
        result.current.clearGameLog();
      });

      expect(result.current.gameLog).toEqual([]);
    });

    it("should allow direct setGameLog", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setGameLog(["Custom log 1", "Custom log 2"]);
      });

      expect(result.current.gameLog).toEqual(["Custom log 1", "Custom log 2"]);
    });
  });

  describe("UI Expansion Toggles", () => {
    it("should toggle game log expansion", () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isGameLogExpanded).toBe(true);

      act(() => {
        result.current.toggleGameLog();
      });

      expect(result.current.isGameLogExpanded).toBe(false);
    });

    it("should toggle credibility adjuster expansion", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.toggleCredibilityAdjuster();
      });

      expect(result.current.isCredibilityAdjusterExpanded).toBe(true);

      act(() => {
        result.current.toggleCredibilityAdjuster();
      });

      expect(result.current.isCredibilityAdjusterExpanded).toBe(false);
    });

    it("should toggle credibility rules expansion", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.toggleCredibilityRules();
      });

      expect(result.current.isCredibilityRulesExpanded).toBe(true);
    });

    it("should toggle piece tracker expansion", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.togglePieceTracker();
      });

      expect(result.current.isPieceTrackerExpanded).toBe(true);
    });

    it("should allow direct setIsGameLogExpanded", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setIsGameLogExpanded(false);
      });

      expect(result.current.isGameLogExpanded).toBe(false);
    });
  });

  describe("Credibility Rotation Adjustments", () => {
    it("should update credibility adjustment for a player", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.updateCredibilityAdjustment(1, 15);
      });

      expect(result.current.credibilityRotationAdjustments).toEqual({ 1: 15 });
    });

    it("should update credibility adjustments for multiple players", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.updateCredibilityAdjustment(1, 15);
      });
      act(() => {
        result.current.updateCredibilityAdjustment(2, -10);
      });
      act(() => {
        result.current.updateCredibilityAdjustment(3, 5);
      });

      expect(result.current.credibilityRotationAdjustments).toEqual({
        1: 15,
        2: -10,
        3: 5,
      });
    });

    it("should overwrite existing adjustment for same player", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.updateCredibilityAdjustment(1, 10);
      });
      act(() => {
        result.current.updateCredibilityAdjustment(1, 20);
      });

      expect(result.current.credibilityRotationAdjustments).toEqual({ 1: 20 });
    });

    it("should clear all credibility adjustments", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.updateCredibilityAdjustment(1, 10);
        result.current.updateCredibilityAdjustment(2, 20);
      });

      act(() => {
        result.current.clearCredibilityAdjustments();
      });

      expect(result.current.credibilityRotationAdjustments).toEqual({});
    });

    it("should allow direct setCredibilityRotationAdjustments", () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setCredibilityRotationAdjustments({ 1: 5, 2: -5 });
      });

      expect(result.current.credibilityRotationAdjustments).toEqual({
        1: 5,
        2: -5,
      });
    });
  });
});
