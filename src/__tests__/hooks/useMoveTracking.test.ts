import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMoveTracking } from "../../hooks/useMoveTracking";
import type { Piece } from "../../types";

/**
 * Tests for useMoveTracking hook
 *
 * Covers:
 * - Initial state
 * - Piece snapshots (turn start, bonus move, correction)
 * - Moved pieces tracking
 * - Drop position tracking
 * - Move validation results
 * - Reset operations
 */

describe("useMoveTracking", () => {
  const mockPieces: Piece[] = [
    {
      id: "p1-worker1",
      name: "Worker",
      imageUrl: "worker.png",
      locationId: "seat1",
      position: { top: 10, left: 10 },
      rotation: 0,
    },
    {
      id: "p1-supervisor1",
      name: "Supervisor",
      imageUrl: "supervisor.png",
      locationId: "seat2",
      position: { top: 20, left: 20 },
      rotation: 0,
    },
  ];

  describe("Initial State", () => {
    it("should initialize pieces at turn start as empty", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.piecesAtTurnStart).toEqual([]);
    });

    it("should initialize pieces before bonus move as empty", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.piecesBeforeBonusMove).toEqual([]);
    });

    it("should initialize pieces at correction start as empty", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.piecesAtCorrectionStart).toEqual([]);
    });

    it("should initialize moved pieces as empty set", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.movedPiecesThisTurn.size).toBe(0);
    });

    it("should initialize last dropped position as null", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.lastDroppedPosition).toBeNull();
    });

    it("should initialize last dropped piece ID as null", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.lastDroppedPieceId).toBeNull();
    });

    it("should initialize move check result display as hidden", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.showMoveCheckResult).toBe(false);
    });

    it("should initialize move check result as null", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.moveCheckResult).toBeNull();
    });
  });

  describe("Piece Snapshots", () => {
    it("should snapshot pieces for turn start", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.snapshotPiecesForTurn(mockPieces);
      });

      expect(result.current.piecesAtTurnStart).toHaveLength(2);
      expect(result.current.piecesAtTurnStart[0].id).toBe("p1-worker1");
    });

    it("should create deep copies for turn start snapshot", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.snapshotPiecesForTurn(mockPieces);
      });

      // Verify it's a copy, not the same reference
      expect(result.current.piecesAtTurnStart).not.toBe(mockPieces);
      expect(result.current.piecesAtTurnStart[0]).not.toBe(mockPieces[0]);
    });

    it("should snapshot pieces for bonus move", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.snapshotPiecesForBonusMove(mockPieces);
      });

      expect(result.current.piecesBeforeBonusMove).toHaveLength(2);
    });

    it("should snapshot pieces for correction", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.snapshotPiecesForCorrection(mockPieces);
      });

      expect(result.current.piecesAtCorrectionStart).toHaveLength(2);
    });
  });

  describe("Moved Pieces Tracking", () => {
    it("should mark a piece as moved", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.markPieceMoved("p1-worker1");
      });

      expect(result.current.movedPiecesThisTurn.has("p1-worker1")).toBe(true);
    });

    it("should track multiple moved pieces", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.markPieceMoved("p1-worker1");
        result.current.markPieceMoved("p1-supervisor1");
      });

      expect(result.current.movedPiecesThisTurn.size).toBe(2);
    });

    it("should check if piece has moved", () => {
      const { result } = renderHook(() => useMoveTracking());

      expect(result.current.hasPieceMoved("p1-worker1")).toBe(false);

      act(() => {
        result.current.markPieceMoved("p1-worker1");
      });

      expect(result.current.hasPieceMoved("p1-worker1")).toBe(true);
      expect(result.current.hasPieceMoved("p1-supervisor1")).toBe(false);
    });

    it("should clear moved pieces tracking", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.markPieceMoved("p1-worker1");
        result.current.markPieceMoved("p1-supervisor1");
      });

      act(() => {
        result.current.clearMovedPieces();
      });

      expect(result.current.movedPiecesThisTurn.size).toBe(0);
    });
  });

  describe("Drop Position Tracking", () => {
    it("should record drop position and piece ID", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.recordDropPosition({ top: 50, left: 60 }, "p1-worker1");
      });

      expect(result.current.lastDroppedPosition).toEqual({ top: 50, left: 60 });
      expect(result.current.lastDroppedPieceId).toBe("p1-worker1");
    });

    it("should clear drop position", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.recordDropPosition({ top: 50, left: 60 }, "p1-worker1");
      });

      act(() => {
        result.current.clearDropPosition();
      });

      expect(result.current.lastDroppedPosition).toBeNull();
      expect(result.current.lastDroppedPieceId).toBeNull();
    });

    it("should allow null values for drop position", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.recordDropPosition(null, null);
      });

      expect(result.current.lastDroppedPosition).toBeNull();
      expect(result.current.lastDroppedPieceId).toBeNull();
    });
  });

  describe("Move Validation Results", () => {
    const mockResult = {
      isMet: true,
      requiredMoves: [],
      performedMoves: [],
      missingMoves: [],
      hasExtraMoves: false,
      extraMoves: [],
    };

    it("should display move check result", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.displayMoveCheckResult(mockResult);
      });

      expect(result.current.showMoveCheckResult).toBe(true);
      expect(result.current.moveCheckResult).toEqual(mockResult);
    });

    it("should hide move check result", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.displayMoveCheckResult(mockResult);
      });

      act(() => {
        result.current.hideMoveCheckResult();
      });

      expect(result.current.showMoveCheckResult).toBe(false);
      // Result data is preserved when just hiding
      expect(result.current.moveCheckResult).toEqual(mockResult);
    });

    it("should clear move check result", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.displayMoveCheckResult(mockResult);
      });

      act(() => {
        result.current.clearMoveCheckResult();
      });

      expect(result.current.showMoveCheckResult).toBe(false);
      expect(result.current.moveCheckResult).toBeNull();
    });
  });

  describe("Reset Operations", () => {
    it("should reset for new turn", () => {
      const { result } = renderHook(() => useMoveTracking());

      // Set up some state
      act(() => {
        result.current.markPieceMoved("p1-worker1");
        result.current.recordDropPosition({ top: 50, left: 60 }, "p1-worker1");
      });

      // Reset for new turn
      act(() => {
        result.current.resetForNewTurn(mockPieces);
      });

      expect(result.current.piecesAtTurnStart).toHaveLength(2);
      expect(result.current.movedPiecesThisTurn.size).toBe(0);
      expect(result.current.lastDroppedPosition).toBeNull();
    });

    it("should reset all tracking", () => {
      const { result } = renderHook(() => useMoveTracking());

      // Set up state
      act(() => {
        result.current.snapshotPiecesForTurn(mockPieces);
        result.current.snapshotPiecesForBonusMove(mockPieces);
        result.current.snapshotPiecesForCorrection(mockPieces);
        result.current.markPieceMoved("p1-worker1");
        result.current.recordDropPosition({ top: 50, left: 60 }, "p1-worker1");
      });

      // Reset all
      act(() => {
        result.current.resetAllTracking();
      });

      expect(result.current.piecesAtTurnStart).toEqual([]);
      expect(result.current.piecesBeforeBonusMove).toEqual([]);
      expect(result.current.piecesAtCorrectionStart).toEqual([]);
      expect(result.current.movedPiecesThisTurn.size).toBe(0);
      expect(result.current.lastDroppedPosition).toBeNull();
      expect(result.current.moveCheckResult).toBeNull();
    });
  });

  describe("Direct Setters", () => {
    it("should allow direct setPiecesAtTurnStart", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.setPiecesAtTurnStart(mockPieces);
      });

      expect(result.current.piecesAtTurnStart).toEqual(mockPieces);
    });

    it("should allow direct setMovedPiecesThisTurn", () => {
      const { result } = renderHook(() => useMoveTracking());

      act(() => {
        result.current.setMovedPiecesThisTurn(new Set(["p1-worker1"]));
      });

      expect(result.current.movedPiecesThisTurn.has("p1-worker1")).toBe(true);
    });
  });
});
