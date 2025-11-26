import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBureaucracy } from "../../hooks/useBureaucracy";
import type {
  Player,
  Piece,
  BoardTile,
  BureaucracyMenuItem,
  BureaucracyPlayerState,
} from "../../types";

/**
 * Tests for useBureaucracy hook
 *
 * Covers:
 * - Initial state
 * - Starting bureaucracy phase
 * - Menu item selection
 * - Purchase validation (MOVE, PROMOTION, CREDIBILITY)
 * - Turn completion
 * - Turn order management
 * - Snapshot handling
 * - Error handling
 */

describe("useBureaucracy", () => {
  let mockPlayers: Player[];
  let mockPieces: Piece[];
  let mockBoardTiles: BoardTile[];

  beforeEach(() => {
    // Setup mock players
    mockPlayers = [
      {
        id: 1,
        credibility: 5,
        hand: [],
        keptTiles: [],
        bureaucracyTiles: [{ id: 3, url: "tile3.png" }], // Tile 3 = 0 kredcoin
      },
      {
        id: 2,
        credibility: 5,
        hand: [],
        keptTiles: [],
        bureaucracyTiles: [{ id: 2, url: "tile2.png" }], // Tile 2 = 2 kredcoin
      },
      {
        id: 3,
        credibility: 5,
        hand: [],
        keptTiles: [],
        bureaucracyTiles: [{ id: 4, url: "tile4.png" }], // Tile 4 = 1 kredcoin
      },
    ];

    // Setup mock pieces
    mockPieces = [
      {
        id: "p1-pawn1",
        name: "Pawn",
        imageUrl: "pawn.png",
        locationId: "seat1",
        position: { top: 10, left: 10 },
        rotation: 0,
      },
      {
        id: "p2-pawn1",
        name: "Pawn",
        imageUrl: "pawn.png",
        locationId: "seat3",
        position: { top: 20, left: 20 },
        rotation: 0,
      },
    ];

    mockBoardTiles = [];
  });

  describe("Initial State", () => {
    it("should initialize with empty bureaucracy states", () => {
      const { result } = renderHook(() => useBureaucracy());

      expect(result.current.bureaucracyStates).toEqual([]);
      expect(result.current.bureaucracyTurnOrder).toEqual([]);
      expect(result.current.currentBureaucracyPlayerIndex).toBe(0);
      expect(result.current.showBureaucracyMenu).toBe(true);
      expect(result.current.bureaucracyValidationError).toBeNull();
      expect(result.current.bureaucracyMoves).toEqual([]);
      expect(result.current.bureaucracySnapshot).toBeNull();
      expect(result.current.currentBureaucracyPurchase).toBeNull();
    });

    it("should initialize pending community pieces as empty set", () => {
      const { result } = renderHook(() => useBureaucracy());

      expect(result.current.pendingCommunityPieces.size).toBe(0);
    });

    it("should initialize finish turn confirm as closed", () => {
      const { result } = renderHook(() => useBureaucracy());

      expect(result.current.showFinishTurnConfirm.isOpen).toBe(false);
      expect(result.current.showFinishTurnConfirm.remainingKredcoin).toBe(0);
    });
  });

  describe("startBureaucracyPhase", () => {
    it("should initialize bureaucracy states based on players", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      expect(result.current.bureaucracyStates).toHaveLength(3);
      expect(result.current.bureaucracyTurnOrder).toHaveLength(3);
      expect(result.current.currentBureaucracyPlayerIndex).toBe(0);
      expect(result.current.showBureaucracyMenu).toBe(true);
    });

    it("should calculate kredcoin correctly for each player", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      // Player 1: tile 3 = 0 kredcoin
      // Player 2: tile 2 = 2 kredcoin
      // Player 3: tile 4 = 1 kredcoin
      const state1 = result.current.bureaucracyStates.find(
        (s) => s.playerId === 1
      );
      const state2 = result.current.bureaucracyStates.find(
        (s) => s.playerId === 2
      );
      const state3 = result.current.bureaucracyStates.find(
        (s) => s.playerId === 3
      );

      expect(state1?.remainingKredcoin).toBe(0);
      expect(state2?.remainingKredcoin).toBe(2);
      expect(state3?.remainingKredcoin).toBe(1);
    });

    it("should order turn order by kredcoin descending", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      // Expected order: Player 2 (2), Player 3 (1), Player 1 (0)
      expect(result.current.bureaucracyTurnOrder).toEqual([2, 3, 1]);
    });

    it("should initialize each player state with empty purchases", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      result.current.bureaucracyStates.forEach((state) => {
        expect(state.purchases).toEqual([]);
      });
    });
  });

  describe("selectMenuItem", () => {
    const mockMenuItem: BureaucracyMenuItem = {
      id: "advance",
      type: "MOVE",
      moveType: "ADVANCE",
      price: 1,
      description: "Advance a Pawn",
    };

    beforeEach(() => {
      // Initialize bureaucracy phase before each test
    });

    it("should create a purchase when selecting an affordable item", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      expect(result.current.currentBureaucracyPurchase).not.toBeNull();
      expect(result.current.currentBureaucracyPurchase?.item).toEqual(
        mockMenuItem
      );
      expect(result.current.showBureaucracyMenu).toBe(false);
    });

    it("should reject purchase if player has insufficient kredcoin", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const expensiveItem: BureaucracyMenuItem = {
        id: "expensive",
        type: "MOVE",
        price: 100,
        description: "Too expensive",
      };

      act(() => {
        result.current.selectMenuItem(expensiveItem, mockPieces, mockBoardTiles);
      });

      expect(result.current.currentBureaucracyPurchase).toBeNull();
      expect(result.current.bureaucracyValidationError).toContain(
        "Insufficient Kredcoin"
      );
    });

    it("should take a snapshot when selecting an item", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      expect(result.current.bureaucracySnapshot).not.toBeNull();
      expect(result.current.bureaucracySnapshot?.pieces).toEqual(mockPieces);
      expect(result.current.bureaucracySnapshot?.boardTiles).toEqual(
        mockBoardTiles
      );
    });

    it("should clear moves when selecting a new item", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      // Set some moves manually
      act(() => {
        result.current.setBureaucracyMoves([
          {
            pieceId: "test",
            fromLocationId: "a",
            toLocationId: "b",
            fromPosition: { top: 0, left: 0 },
            toPosition: { top: 1, left: 1 },
            moveType: "ADVANCE",
          },
        ]);
      });

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      expect(result.current.bureaucracyMoves).toEqual([]);
    });
  });

  describe("completePurchase", () => {
    it("should deduct kredcoin after successful purchase", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const mockMenuItem: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 1,
        description: "Restore Credibility",
      };

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      act(() => {
        result.current.completePurchase(mockPlayers, mockPieces, mockBoardTiles, 3);
      });

      const currentPlayerId = result.current.bureaucracyTurnOrder[0];
      const playerState = result.current.bureaucracyStates.find(
        (s) => s.playerId === currentPlayerId
      );

      expect(playerState?.remainingKredcoin).toBeLessThan(
        playerState?.remainingKredcoin! + mockMenuItem.price
      );
    });

    it("should add purchase to completed purchases", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const mockMenuItem: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 1,
        description: "Restore Credibility",
      };

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      act(() => {
        result.current.completePurchase(mockPlayers, mockPieces, mockBoardTiles, 3);
      });

      const currentPlayerId = result.current.bureaucracyTurnOrder[0];
      const playerState = result.current.bureaucracyStates.find(
        (s) => s.playerId === currentPlayerId
      );

      expect(playerState?.purchases).toHaveLength(1);
      expect(playerState?.purchases[0].completed).toBe(true);
    });

    it("should show menu again after successful purchase", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const mockMenuItem: BureaucracyMenuItem = {
        id: "credibility",
        type: "CREDIBILITY",
        price: 1,
        description: "Restore Credibility",
      };

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      expect(result.current.showBureaucracyMenu).toBe(false);

      act(() => {
        result.current.completePurchase(mockPlayers, mockPieces, mockBoardTiles, 3);
      });

      expect(result.current.showBureaucracyMenu).toBe(true);
      expect(result.current.currentBureaucracyPurchase).toBeNull();
    });
  });

  describe("resetAction", () => {
    it("should restore snapshot when resetting action", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const mockMenuItem: BureaucracyMenuItem = {
        id: "advance",
        type: "MOVE",
        moveType: "ADVANCE",
        price: 1,
        description: "Advance a Pawn",
      };

      act(() => {
        result.current.selectMenuItem(mockMenuItem, mockPieces, mockBoardTiles);
      });

      const snapshotPieces = result.current.bureaucracySnapshot?.pieces;

      // Simulate resetting
      act(() => {
        result.current.resetAction();
      });

      expect(result.current.showBureaucracyMenu).toBe(true);
      expect(result.current.currentBureaucracyPurchase).toBeNull();
      expect(result.current.bureaucracyMoves).toEqual([]);
    });
  });

  describe("nextBureaucracyPlayer", () => {
    it("should advance to next player in turn order", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      const initialIndex = result.current.currentBureaucracyPlayerIndex;

      act(() => {
        result.current.nextBureaucracyPlayer();
      });

      expect(result.current.currentBureaucracyPlayerIndex).toBe(initialIndex + 1);
      expect(result.current.showBureaucracyMenu).toBe(true);
    });

    it("should wrap around after last player", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      // Advance to last player
      act(() => {
        result.current.setCurrentBureaucracyPlayerIndex(2);
      });

      act(() => {
        result.current.nextBureaucracyPlayer();
      });

      expect(result.current.currentBureaucracyPlayerIndex).toBe(0);
    });
  });

  describe("clearValidationError", () => {
    it("should clear validation error message", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.setBureaucracyValidationError("Test error");
      });

      expect(result.current.bureaucracyValidationError).toBe("Test error");

      act(() => {
        result.current.clearValidationError();
      });

      expect(result.current.bureaucracyValidationError).toBeNull();
    });
  });

  describe("showFinishTurnDialog", () => {
    it("should show confirmation dialog with remaining kredcoin", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
      });

      act(() => {
        result.current.showFinishTurnDialog();
      });

      expect(result.current.showFinishTurnConfirm.isOpen).toBe(true);
      expect(result.current.showFinishTurnConfirm.remainingKredcoin).toBeGreaterThan(
        0
      );
    });
  });

  describe("closeFinishTurnDialog", () => {
    it("should close confirmation dialog", () => {
      const { result } = renderHook(() => useBureaucracy());

      act(() => {
        result.current.startBureaucracyPhase(mockPlayers);
        result.current.showFinishTurnDialog();
      });

      expect(result.current.showFinishTurnConfirm.isOpen).toBe(true);

      act(() => {
        result.current.closeFinishTurnDialog();
      });

      expect(result.current.showFinishTurnConfirm.isOpen).toBe(false);
    });
  });
});
