import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChallengeFlow } from "../../hooks/useChallengeFlow";
import type { Player, Tile, Piece } from "../../types";

/**
 * Tests for useChallengeFlow hook
 *
 * Covers:
 * - Initial state
 * - Challenge reveal process
 * - Bystander navigation
 * - Take Advantage initiation
 * - Tile selection for advantage
 * - Advantage kredcoin tracking
 * - Purchase menu
 * - Reset operations
 */

describe("useChallengeFlow", () => {
  const mockPlayers: Player[] = [
    { id: 1, credibility: 5, hand: [], keptTiles: [], bureaucracyTiles: [] },
    { id: 2, credibility: 4, hand: [], keptTiles: [], bureaucracyTiles: [] },
    { id: 3, credibility: 3, hand: [], keptTiles: [], bureaucracyTiles: [] },
  ];

  const mockTile: Tile = { id: 5, url: "./images/5.svg" };

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

  describe("Initial State", () => {
    it("should initialize bystanders as empty", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.bystanders).toEqual([]);
    });

    it("should initialize bystander index as 0", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.bystanderIndex).toBe(0);
    });

    it("should initialize private viewing as false", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.isPrivatelyViewing).toBe(false);
    });

    it("should initialize challenge reveal modal as hidden", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.showChallengeRevealModal).toBe(false);
    });

    it("should initialize challenged tile as null", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.challengedTile).toBeNull();
    });

    it("should initialize take advantage modal as hidden", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.showTakeAdvantageModal).toBe(false);
    });

    it("should initialize take advantage challenger ID as null", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.takeAdvantageChallengerId).toBeNull();
    });

    it("should initialize selected tiles for advantage as empty", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.selectedTilesForAdvantage).toEqual([]);
    });

    it("should initialize total kredcoin for advantage as 0", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.totalKredcoinForAdvantage).toBe(0);
    });

    it("should initialize advantage validation error as null", () => {
      const { result } = renderHook(() => useChallengeFlow());

      expect(result.current.takeAdvantageValidationError).toBeNull();
    });
  });

  describe("Challenge Reveal Process", () => {
    it("should initiate challenge reveal", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
      });

      expect(result.current.bystanders).toHaveLength(2);
      expect(result.current.bystanderIndex).toBe(0);
      expect(result.current.challengedTile).toEqual(mockTile);
      expect(result.current.showChallengeRevealModal).toBe(true);
      expect(result.current.isPrivatelyViewing).toBe(false);
    });

    it("should navigate to next bystander", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
      });

      act(() => {
        result.current.nextBystander();
      });

      expect(result.current.bystanderIndex).toBe(1);
    });

    it("should check if there are more bystanders", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
      });

      expect(result.current.hasMoreBystanders()).toBe(true);

      act(() => {
        result.current.nextBystander();
      });

      expect(result.current.hasMoreBystanders()).toBe(false);
    });

    it("should get current bystander", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
      });

      expect(result.current.getCurrentBystander()).toEqual(mockPlayers[1]);

      act(() => {
        result.current.nextBystander();
      });

      expect(result.current.getCurrentBystander()).toEqual(mockPlayers[2]);
    });

    it("should set private viewing state", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.setPrivateViewing(true);
      });

      expect(result.current.isPrivatelyViewing).toBe(true);
    });

    it("should close challenge reveal and reset state", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
      });

      act(() => {
        result.current.closeChallengeReveal();
      });

      expect(result.current.showChallengeRevealModal).toBe(false);
      expect(result.current.bystanders).toEqual([]);
      expect(result.current.bystanderIndex).toBe(0);
      expect(result.current.challengedTile).toBeNull();
    });
  });

  describe("Take Advantage", () => {
    it("should initiate take advantage", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateTakeAdvantage(2, 4);
      });

      expect(result.current.showTakeAdvantageModal).toBe(true);
      expect(result.current.takeAdvantageChallengerId).toBe(2);
      expect(result.current.takeAdvantageChallengerCredibility).toBe(4);
      expect(result.current.selectedTilesForAdvantage).toEqual([]);
      expect(result.current.totalKredcoinForAdvantage).toBe(0);
    });

    it("should close take advantage and reset state", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.initiateTakeAdvantage(2, 4);
      });

      act(() => {
        result.current.closeTakeAdvantage();
      });

      expect(result.current.showTakeAdvantageModal).toBe(false);
      expect(result.current.takeAdvantageChallengerId).toBeNull();
      expect(result.current.takeAdvantageChallengerCredibility).toBe(0);
    });
  });

  describe("Tile Selection for Advantage", () => {
    it("should show tile selection", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.showTileSelection();
      });

      expect(result.current.showTakeAdvantageTileSelection).toBe(true);
    });

    it("should hide tile selection", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.showTileSelection();
      });

      act(() => {
        result.current.hideTileSelection();
      });

      expect(result.current.showTakeAdvantageTileSelection).toBe(false);
    });

    it("should add tile to advantage selection", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.addTileToAdvantage(mockTile);
      });

      expect(result.current.selectedTilesForAdvantage).toHaveLength(1);
      expect(result.current.selectedTilesForAdvantage[0]).toEqual(mockTile);
    });

    it("should add multiple tiles to advantage selection", () => {
      const { result } = renderHook(() => useChallengeFlow());
      const tile2: Tile = { id: 6, url: "./images/6.svg" };

      act(() => {
        result.current.addTileToAdvantage(mockTile);
        result.current.addTileToAdvantage(tile2);
      });

      expect(result.current.selectedTilesForAdvantage).toHaveLength(2);
    });

    it("should remove tile from advantage selection", () => {
      const { result } = renderHook(() => useChallengeFlow());
      const tile2: Tile = { id: 6, url: "./images/6.svg" };

      act(() => {
        result.current.addTileToAdvantage(mockTile);
        result.current.addTileToAdvantage(tile2);
      });

      act(() => {
        result.current.removeTileFromAdvantage(5);
      });

      expect(result.current.selectedTilesForAdvantage).toHaveLength(1);
      expect(result.current.selectedTilesForAdvantage[0].id).toBe(6);
    });
  });

  describe("Kredcoin Tracking", () => {
    it("should update advantage kredcoin total", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.updateAdvantageKredcoin(5);
      });

      expect(result.current.totalKredcoinForAdvantage).toBe(5);
    });
  });

  describe("Purchase Menu", () => {
    it("should show purchase menu", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.showPurchaseMenu();
      });

      expect(result.current.showTakeAdvantageMenu).toBe(true);
    });

    it("should hide purchase menu", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.showPurchaseMenu();
      });

      act(() => {
        result.current.hidePurchaseMenu();
      });

      expect(result.current.showTakeAdvantageMenu).toBe(false);
    });

    it("should set advantage purchase", () => {
      const { result } = renderHook(() => useChallengeFlow());
      const mockPurchase = {
        playerId: 2,
        item: { type: "MOVE", name: "Move", price: 1 },
        timestamp: Date.now(),
        completed: false,
      };

      act(() => {
        result.current.setAdvantagePurchase(mockPurchase as any);
      });

      expect(result.current.takeAdvantagePurchase).toEqual(mockPurchase);
    });

    it("should snapshot advantage pieces", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.snapshotAdvantagesPieces(mockPieces);
      });

      expect(result.current.takeAdvantagePiecesSnapshot).toEqual(mockPieces);
    });

    it("should set advantage error", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.setAdvantageError("Insufficient kredcoin");
      });

      expect(result.current.takeAdvantageValidationError).toBe(
        "Insufficient kredcoin"
      );
    });
  });

  describe("Reset Operations", () => {
    it("should reset all challenge flow state", () => {
      const { result } = renderHook(() => useChallengeFlow());

      // Set up various state
      act(() => {
        result.current.initiateChallengeReveal(mockPlayers.slice(1), mockTile);
        result.current.initiateTakeAdvantage(2, 4);
        result.current.addTileToAdvantage(mockTile);
        result.current.updateAdvantageKredcoin(5);
        result.current.setAdvantageError("Error");
      });

      // Reset
      act(() => {
        result.current.resetChallengeFlow();
      });

      expect(result.current.bystanders).toEqual([]);
      expect(result.current.bystanderIndex).toBe(0);
      expect(result.current.isPrivatelyViewing).toBe(false);
      expect(result.current.showChallengeRevealModal).toBe(false);
      expect(result.current.challengedTile).toBeNull();
      expect(result.current.showTakeAdvantageModal).toBe(false);
      expect(result.current.takeAdvantageChallengerId).toBeNull();
      expect(result.current.selectedTilesForAdvantage).toEqual([]);
      expect(result.current.totalKredcoinForAdvantage).toBe(0);
      expect(result.current.takeAdvantageValidationError).toBeNull();
    });
  });

  describe("Direct Setters", () => {
    it("should allow direct setBystanders", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.setBystanders(mockPlayers);
      });

      expect(result.current.bystanders).toEqual(mockPlayers);
    });

    it("should allow direct setChallengedTile", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.setChallengedTile(mockTile);
      });

      expect(result.current.challengedTile).toEqual(mockTile);
    });

    it("should allow direct setSelectedTilesForAdvantage", () => {
      const { result } = renderHook(() => useChallengeFlow());

      act(() => {
        result.current.setSelectedTilesForAdvantage([mockTile]);
      });

      expect(result.current.selectedTilesForAdvantage).toEqual([mockTile]);
    });
  });
});
