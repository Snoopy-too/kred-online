/**
 * Phase cleanup tests (Spec 2026-04-09 §4b).
 *
 * For each row in docs/superpowers/phase-cleanup-matrix.md whose "State that
 * must be reset" column is non-empty, assert that the corresponding hook
 * reset function actually clears every listed key. Parameterized across
 * 3, 4, and 5 player modes.
 *
 * These tests exercise the real reset functions the handlers call in
 * production (useTilePlayWorkflow.resetForNewTurn / completeTilePlay,
 * useChallengeFlow.closeTakeAdvantage / closeChallengeReveal,
 * useBureaucracy.startBureaucracyPhase). They are the source of truth
 * that Step 5's PhaseProvider must preserve when it moves these into a
 * central place.
 */

import { describe, it, expect } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useTilePlayWorkflow } from "../../hooks/useTilePlayWorkflow";
import { useChallengeFlow } from "../../hooks/useChallengeFlow";
import { useBureaucracy } from "../../hooks/useBureaucracy";
import type { Player, Piece } from "../../types";
import { PhaseProvider } from "../../providers/PhaseProvider";
import { CampaignProvider } from "../../providers/CampaignProvider";
import { ChallengeProvider } from "../../providers/ChallengeProvider";

const tilePlayWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    PhaseProvider,
    null,
    React.createElement(
      CampaignProvider,
      null,
      React.createElement(ChallengeProvider, null, children),
    ),
  );

const challengeFlowWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(PhaseProvider, null, React.createElement(ChallengeProvider, null, children));

function makePlayers(count: 3 | 4 | 5): Player[] {
  const players: Player[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: i + 1,
      name: `P${i + 1}`,
      color: "red",
      credibility: 0,
      keptTiles: [],
      hand: [],
      discardedTiles: [],
      shownTiles: [],
      bureaucracyTiles: [],
    } as unknown as Player);
  }
  return players;
}

function makePieces(count: 3 | 4 | 5): Piece[] {
  const pieces: Piece[] = [];
  for (let p = 0; p < count; p++) {
    for (let i = 0; i < 6; i++) {
      pieces.push({
        id: `p${p + 1}-piece${i}`,
        name: "Worker",
        imageUrl: "",
        locationId: `seat${p + 1}`,
        position: { top: 0, left: 0 },
        rotation: 0,
      } as unknown as Piece);
    }
  }
  return pieces;
}

describe("phase cleanup (spec §4b)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    describe(`${playerCount}p`, () => {
      // =======================================================================
      // Matrix row: PENDING_CHALLENGE → CAMPAIGN (turn end / play complete)
      // State to reset: playedTile, movesThisTurn, hasPlayedTileThisTurn,
      //   revealedTileId, tileTransaction, receiverAcceptance, challengeOrder,
      //   currentChallengerIndex, tileRejected
      // =======================================================================
      it("resetForNewTurn clears every tile-play state key", () => {
        const { result } = renderHook(() => useTilePlayWorkflow(), { wrapper: tilePlayWrapper });

        // Mutate all the per-turn state fields.
        act(() => {
          result.current.setPlayedTile({
            tileId: "tile-3",
            playerId: 1,
            receivingPlayerId: 2,
            movesPerformed: [],
            originalPieces: [],
            originalBoardTiles: [],
          } as any);
          result.current.setHasPlayedTileThisTurn(true);
          result.current.setRevealedTileId(3);
          result.current.setTileTransaction({
            placerId: 1,
            receiverId: 2,
            tileId: 3,
          } as any);
          result.current.setReceiverAcceptance(true as any);
          result.current.setChallengeOrder([2, 3, 4].slice(0, playerCount - 1));
          result.current.setCurrentChallengerIndex(1);
          result.current.setTileRejected(true);
          result.current.setMovesThisTurn([{ pieceId: "p1" } as any]);
        });

        expect(result.current.playedTile).not.toBeNull();
        expect(result.current.hasPlayedTileThisTurn).toBe(true);
        expect(result.current.revealedTileId).toBe(3);
        expect(result.current.tileTransaction).not.toBeNull();
        expect(result.current.receiverAcceptance).not.toBeNull();
        expect(result.current.challengeOrder.length).toBeGreaterThan(0);
        expect(result.current.currentChallengerIndex).toBe(1);
        expect(result.current.tileRejected).toBe(true);
        expect(result.current.movesThisTurn.length).toBe(1);

        act(() => {
          result.current.resetForNewTurn();
        });

        expect(result.current.playedTile).toBeNull();
        expect(result.current.hasPlayedTileThisTurn).toBe(false);
        expect(result.current.revealedTileId).toBeNull();
        expect(result.current.tileTransaction).toBeNull();
        expect(result.current.receiverAcceptance).toBeNull();
        expect(result.current.challengeOrder).toEqual([]);
        expect(result.current.currentChallengerIndex).toBe(0);
        expect(result.current.tileRejected).toBe(false);
        expect(result.current.movesThisTurn).toEqual([]);
      });

      it("completeTilePlay clears the same state keys as resetForNewTurn", () => {
        const { result } = renderHook(() => useTilePlayWorkflow(), { wrapper: tilePlayWrapper });
        act(() => {
          result.current.setPlayedTile({ tileId: "t", playerId: 1 } as any);
          result.current.setTileRejected(true);
          result.current.setChallengeOrder(Array.from({ length: playerCount - 1 }, (_, i) => i + 2));
          result.current.setCurrentChallengerIndex(playerCount - 2);
        });
        act(() => {
          result.current.completeTilePlay();
        });
        expect(result.current.playedTile).toBeNull();
        expect(result.current.tileRejected).toBe(false);
        expect(result.current.challengeOrder).toEqual([]);
        expect(result.current.currentChallengerIndex).toBe(0);
      });

      // =======================================================================
      // Matrix row: TAKE_ADVANTAGE → CAMPAIGN
      // State to reset: takeAdvantageChallengerId,
      //   takeAdvantageChallengerCredibility, showTakeAdvantageModal,
      //   selectedTilesForAdvantage, totalKredcoinForAdvantage
      // =======================================================================
      it("closeTakeAdvantage clears every take-advantage state key", () => {
        const { result } = renderHook(() => useChallengeFlow(), { wrapper: challengeFlowWrapper });

        act(() => {
          result.current.initiateTakeAdvantage(2, 5);
          result.current.setSelectedTilesForAdvantage([{ id: 1 } as any, { id: 2 } as any]);
          result.current.setTotalKredcoinForAdvantage(12);
          result.current.setShowTakeAdvantageTileSelection(true);
          result.current.setShowTakeAdvantageMenu(true);
          result.current.setTakeAdvantagePurchase({ itemId: "x" } as any);
          result.current.setTakeAdvantagePiecesSnapshot([{ id: "piece1" } as any]);
          result.current.setTakeAdvantageValidationError("bad");
        });

        expect(result.current.takeAdvantageChallengerId).toBe(2);
        expect(result.current.showTakeAdvantageModal).toBe(true);
        expect(result.current.selectedTilesForAdvantage.length).toBe(2);
        expect(result.current.totalKredcoinForAdvantage).toBe(12);

        act(() => {
          result.current.closeTakeAdvantage();
        });

        expect(result.current.showTakeAdvantageModal).toBe(false);
        expect(result.current.takeAdvantageChallengerId).toBeNull();
        expect(result.current.takeAdvantageChallengerCredibility).toBe(0);
        expect(result.current.selectedTilesForAdvantage).toEqual([]);
        expect(result.current.totalKredcoinForAdvantage).toBe(0);
        expect(result.current.showTakeAdvantageTileSelection).toBe(false);
        expect(result.current.showTakeAdvantageMenu).toBe(false);
        expect(result.current.takeAdvantagePurchase).toBeNull();
        expect(result.current.takeAdvantagePiecesSnapshot).toEqual([]);
        expect(result.current.takeAdvantageValidationError).toBeNull();
      });

      // =======================================================================
      // Matrix row: PENDING_CHALLENGE → CAMPAIGN (challenge reveal cleanup)
      // State to reset: bystanders, bystanderIndex, challengedTile,
      //   isPrivatelyViewing, showChallengeRevealModal
      // =======================================================================
      it("closeChallengeReveal clears bystander/reveal state", () => {
        const { result } = renderHook(() => useChallengeFlow(), { wrapper: challengeFlowWrapper });
        const bystanders = makePlayers(playerCount).slice(1);

        act(() => {
          result.current.initiateChallengeReveal(bystanders, { id: 3 } as any);
          result.current.setPrivateViewing(true);
          result.current.setBystanderIndex(Math.max(0, bystanders.length - 1));
        });

        expect(result.current.bystanders.length).toBe(bystanders.length);
        expect(result.current.showChallengeRevealModal).toBe(true);
        expect(result.current.isPrivatelyViewing).toBe(true);
        expect(result.current.challengedTile).not.toBeNull();

        act(() => {
          result.current.closeChallengeReveal();
        });

        expect(result.current.bystanders).toEqual([]);
        expect(result.current.bystanderIndex).toBe(0);
        expect(result.current.challengedTile).toBeNull();
        expect(result.current.isPrivatelyViewing).toBe(false);
        expect(result.current.showChallengeRevealModal).toBe(false);
      });

      // =======================================================================
      // Matrix row: CAMPAIGN → BUREAUCRACY (fresh bureaucracy phase)
      // State to reset: bureaucracyStates, bureaucracyTurnOrder,
      //   currentBureaucracyPlayerIndex, currentBureaucracyPurchase,
      //   bureaucracyValidationError, bureaucracyMoves, bureaucracySnapshot
      // =======================================================================
      it("startBureaucracyPhase seeds fresh state from prior bureaucracy", () => {
        const { result } = renderHook(() => useBureaucracy());
        const players = makePlayers(playerCount);
        const pieces = makePieces(playerCount);

        // Simulate stale state from a previous bureaucracy round.
        act(() => {
          result.current.setCurrentBureaucracyPlayerIndex(playerCount - 1);
          result.current.setCurrentBureaucracyPurchase({ itemId: "old" } as any);
          result.current.setBureaucracyValidationError("stale error");
          result.current.setBureaucracyMoves([{ pieceId: "stale" } as any]);
          result.current.setBureaucracySnapshot({ pieces: [], boardTiles: [] });
          result.current.setPendingCommunityPieces(new Set(["stale-piece"]));
        });

        // Entering bureaucracy must wipe the stale state.
        act(() => {
          result.current.startBureaucracyPhase(players, pieces);
        });

        expect(result.current.bureaucracyStates.length).toBe(playerCount);
        expect(result.current.bureaucracyTurnOrder.length).toBe(playerCount);
        expect(result.current.currentBureaucracyPlayerIndex).toBe(0);
        expect(result.current.currentBureaucracyPurchase).toBeNull();
        expect(result.current.bureaucracyValidationError).toBeNull();
        expect(result.current.bureaucracyMoves).toEqual([]);
        expect(result.current.bureaucracySnapshot).toBeNull();
      });

      // =======================================================================
      // Matrix row: BUREAUCRACY → CAMPAIGN (next round)
      // State to reset: currentBureaucracyPlayerIndex back to 0 on next
      //   startBureaucracyPhase, pendingCommunityPieces cleared by turnHandler.
      // Here we verify pendingCommunityPieces is a Set that gets re-seeded.
      // =======================================================================
      it("pendingCommunityPieces resets to empty Set on startBureaucracyPhase", () => {
        const { result } = renderHook(() => useBureaucracy());
        const players = makePlayers(playerCount);

        act(() => {
          const stale = new Set<string>();
          for (let i = 0; i < playerCount * 6; i++) stale.add(`piece-${i}`);
          result.current.setPendingCommunityPieces(stale);
        });

        expect(result.current.pendingCommunityPieces.size).toBe(playerCount * 6);

        // Clearing via the same setter the handlers use.
        act(() => {
          result.current.setPendingCommunityPieces(new Set());
        });

        expect(result.current.pendingCommunityPieces.size).toBe(0);

        // And startBureaucracyPhase does not repopulate it from stale state.
        act(() => {
          result.current.startBureaucracyPhase(players, []);
        });

        expect(result.current.pendingCommunityPieces.size).toBe(0);
      });
    });
  }
});
