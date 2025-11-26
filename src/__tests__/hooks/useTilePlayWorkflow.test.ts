import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTilePlayWorkflow } from "../../hooks/useTilePlayWorkflow";
import type { Piece, BoardTile, TrackedMove } from "../../types";
import { DefinedMoveType } from "../../types";

/**
 * Tests for useTilePlayWorkflow hook
 *
 * Covers:
 * - Initial state
 * - Tile play lifecycle
 * - Move recording
 * - Tile reveal
 * - Tile transactions
 * - Receiver acceptance
 * - Challenge order
 * - Reset operations
 */

describe("useTilePlayWorkflow", () => {
  const mockPieces: Piece[] = [
    {
      id: "p1-worker1",
      name: "Worker",
      imageUrl: "worker.png",
      locationId: "seat1",
      position: { top: 10, left: 10 },
      rotation: 0,
    },
  ];

  const mockBoardTiles: BoardTile[] = [];

  const mockPlayedTile = {
    tileId: "tile-3",
    playerId: 1,
    receivingPlayerId: 2,
    movesPerformed: [],
    originalPieces: mockPieces,
    originalBoardTiles: mockBoardTiles,
  };

  describe("Initial State", () => {
    it("should initialize played tile as null", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.playedTile).toBeNull();
    });

    it("should initialize moves this turn as empty", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.movesThisTurn).toEqual([]);
    });

    it("should initialize has played tile as false", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.hasPlayedTileThisTurn).toBe(false);
    });

    it("should initialize revealed tile ID as null", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.revealedTileId).toBeNull();
    });

    it("should initialize tile transaction as null", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.tileTransaction).toBeNull();
    });

    it("should initialize receiver acceptance as null", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.receiverAcceptance).toBeNull();
    });

    it("should initialize challenge order as empty", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.challengeOrder).toEqual([]);
    });

    it("should initialize current challenger index as 0", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.currentChallengerIndex).toBe(0);
    });

    it("should initialize tile rejected as false", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      expect(result.current.tileRejected).toBe(false);
    });
  });

  describe("Tile Play Lifecycle", () => {
    it("should start tile play", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.startTilePlay(mockPlayedTile);
      });

      expect(result.current.playedTile).toEqual(mockPlayedTile);
      expect(result.current.hasPlayedTileThisTurn).toBe(true);
    });

    it("should complete tile play", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.startTilePlay(mockPlayedTile);
      });

      act(() => {
        result.current.completeTilePlay();
      });

      expect(result.current.playedTile).toBeNull();
      expect(result.current.tileTransaction).toBeNull();
      expect(result.current.tileRejected).toBe(false);
    });
  });

  describe("Move Recording", () => {
    const mockMove: TrackedMove = {
      pieceId: "p1-worker1",
      fromLocationId: "seat1",
      toLocationId: "seat2",
      moveType: DefinedMoveType.ADVANCE,
      category: "M",
      fromPosition: { top: 10, left: 10 },
      toPosition: { top: 20, left: 20 },
      timestamp: Date.now(),
    };

    it("should record a single move", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.recordMove(mockMove);
      });

      expect(result.current.movesThisTurn).toHaveLength(1);
      expect(result.current.movesThisTurn[0]).toEqual(mockMove);
    });

    it("should record multiple moves in sequence", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.recordMove(mockMove);
        result.current.recordMove({ ...mockMove, pieceId: "p1-worker2" });
      });

      expect(result.current.movesThisTurn).toHaveLength(2);
    });

    it("should record multiple moves at once", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.recordMoves([
          mockMove,
          { ...mockMove, pieceId: "p1-worker2" },
          { ...mockMove, pieceId: "p1-supervisor1" },
        ]);
      });

      expect(result.current.movesThisTurn).toHaveLength(3);
    });

    it("should clear recorded moves", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.recordMove(mockMove);
      });

      act(() => {
        result.current.clearMoves();
      });

      expect(result.current.movesThisTurn).toEqual([]);
    });
  });

  describe("Tile Reveal", () => {
    it("should reveal a tile", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.revealTile("tile-5");
      });

      expect(result.current.revealedTileId).toBe("tile-5");
    });

    it("should hide revealed tile", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.revealTile("tile-5");
      });

      act(() => {
        result.current.hideRevealedTile();
      });

      expect(result.current.revealedTileId).toBeNull();
    });
  });

  describe("Tile Transaction", () => {
    const mockTransaction = {
      placerId: 1,
      receiverId: 2,
      boardTileId: "bt-1",
      tile: { id: 3, url: "./images/3.svg" },
    };

    it("should initiate tile transaction", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.initiateTileTransaction(mockTransaction);
      });

      expect(result.current.tileTransaction).toEqual(mockTransaction);
    });

    it("should clear tile transaction", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.initiateTileTransaction(mockTransaction);
      });

      act(() => {
        result.current.clearTileTransaction();
      });

      expect(result.current.tileTransaction).toBeNull();
    });
  });

  describe("Receiver Acceptance", () => {
    it("should set receiver acceptance to true", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setReceiverDecision(true);
      });

      expect(result.current.receiverAcceptance).toBe(true);
    });

    it("should set receiver acceptance to false", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setReceiverDecision(false);
      });

      expect(result.current.receiverAcceptance).toBe(false);
    });
  });

  describe("Challenge Order", () => {
    it("should set challenge order", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setTileChallengeOrder([3, 1, 2]);
      });

      expect(result.current.challengeOrder).toEqual([3, 1, 2]);
    });

    it("should advance to next challenger", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setTileChallengeOrder([3, 1, 2]);
      });

      act(() => {
        result.current.nextChallenger();
      });

      expect(result.current.currentChallengerIndex).toBe(1);
    });

    it("should check if there are more challengers", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setTileChallengeOrder([3, 1]);
      });

      expect(result.current.hasMoreChallengers()).toBe(true);

      act(() => {
        result.current.nextChallenger();
      });

      expect(result.current.hasMoreChallengers()).toBe(false);
    });

    it("should get current challenger ID", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setTileChallengeOrder([3, 1, 2]);
      });

      expect(result.current.getCurrentChallengerId()).toBe(3);

      act(() => {
        result.current.nextChallenger();
      });

      expect(result.current.getCurrentChallengerId()).toBe(1);
    });
  });

  describe("Tile Rejection", () => {
    it("should mark tile as rejected", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.markTileRejected();
      });

      expect(result.current.tileRejected).toBe(true);
    });

    it("should clear tile rejection", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.markTileRejected();
      });

      act(() => {
        result.current.clearTileRejection();
      });

      expect(result.current.tileRejected).toBe(false);
    });
  });

  describe("Reset Operations", () => {
    it("should reset for new turn", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      // Set up some state
      act(() => {
        result.current.startTilePlay(mockPlayedTile);
        result.current.revealTile("tile-5");
        result.current.setTileChallengeOrder([3, 1, 2]);
        result.current.markTileRejected();
      });

      // Reset
      act(() => {
        result.current.resetForNewTurn();
      });

      expect(result.current.playedTile).toBeNull();
      expect(result.current.movesThisTurn).toEqual([]);
      expect(result.current.hasPlayedTileThisTurn).toBe(false);
      expect(result.current.revealedTileId).toBeNull();
      expect(result.current.tileTransaction).toBeNull();
      expect(result.current.receiverAcceptance).toBeNull();
      expect(result.current.challengeOrder).toEqual([]);
      expect(result.current.currentChallengerIndex).toBe(0);
      expect(result.current.tileRejected).toBe(false);
    });
  });

  describe("Direct Setters", () => {
    it("should allow direct setPlayedTile", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setPlayedTile(mockPlayedTile);
      });

      expect(result.current.playedTile).toEqual(mockPlayedTile);
    });

    it("should allow direct setHasPlayedTileThisTurn", () => {
      const { result } = renderHook(() => useTilePlayWorkflow());

      act(() => {
        result.current.setHasPlayedTileThisTurn(true);
      });

      expect(result.current.hasPlayedTileThisTurn).toBe(true);
    });
  });
});
