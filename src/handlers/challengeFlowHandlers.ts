/**
 * Challenge Flow Handlers (Legacy)
 *
 * This module contains legacy handlers for the challenge/bystander flow during campaign.
 * These handlers work with the older tileTransaction-based flow.
 *
 * Handlers included:
 * - handleBystanderDecision: Process bystander challenge/pass decision
 * - handleContinueAfterChallenge: Continue after challenge reveal modal
 * - handleReceiverDecision: Process receiver accept/reject decision (legacy)
 *
 * Note: The newer workflow handlers (handleReceiverAcceptanceDecision, handleChallengerDecision)
 * remain in App.tsx due to their extensive dependencies on calculateMoves and other functions.
 */

import React from "react";
import type { Player, GameState, Tile, BoardTile } from "../types";

// ============================================================================
// DEPENDENCY INTERFACE
// ============================================================================

export interface TileTransaction {
  tile: Tile;
  placerId: number;
  receiverId: number;
  boardTileId: string;
}

export interface ChallengeFlowDependencies {
  // Current state values
  players: Player[];
  playerCount: number;
  tileTransaction: TileTransaction | null;
  bystanders: Player[];
  bystanderIndex: number;

  // State setters
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setBoardTiles: React.Dispatch<React.SetStateAction<BoardTile[]>>;
  setGameState: (state: GameState) => void;
  setChallengedTile: React.Dispatch<React.SetStateAction<Tile | null>>;
  setShowChallengeRevealModal: (show: boolean) => void;
  setBystanderIndex: (index: number) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setBystanders: React.Dispatch<React.SetStateAction<Player[]>>;
  setIsPrivatelyViewing: React.Dispatch<React.SetStateAction<boolean>>;

  // Helper functions
  advanceTurnNormally: (startingPlayerId?: number) => void;
}

// ============================================================================
// HANDLER FACTORY
// ============================================================================

export function createChallengeFlowHandlers(deps: ChallengeFlowDependencies) {
  const {
    // Current state values
    players,
    playerCount,
    tileTransaction,
    bystanders,
    bystanderIndex,

    // State setters
    setPlayers,
    setBoardTiles,
    setGameState,
    setChallengedTile,
    setShowChallengeRevealModal,
    setBystanderIndex,
    setCurrentPlayerIndex,
    setBystanders,
    setIsPrivatelyViewing,

    // Helper functions
    advanceTurnNormally,
  } = deps;

  /**
   * Resolve a tile transaction after challenge phase is complete.
   * Adds the tile to the receiver's bureaucracy tiles and advances the turn.
   */
  const resolveTransaction = (wasChallenged: boolean): void => {
    if (!tileTransaction) return;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === tileTransaction.receiverId) {
          return {
            ...p,
            bureaucracyTiles: [...p.bureaucracyTiles, tileTransaction.tile],
          };
        }
        return p;
      })
    );
    setBoardTiles((prev) =>
      prev.filter((bt) => bt.id !== tileTransaction.boardTileId)
    );
    advanceTurnNormally(tileTransaction.placerId);
  };

  /**
   * Handle bystander's decision to challenge or pass.
   * If challenge: show challenge reveal modal
   * If pass: move to next bystander or resolve transaction
   */
  const handleBystanderDecision = (decision: "challenge" | "pass"): void => {
    if (decision === "challenge") {
      if (tileTransaction) {
        setChallengedTile(tileTransaction.tile);
        setShowChallengeRevealModal(true);
      }
    } else {
      // 'pass'
      const nextBystanderIndex = bystanderIndex + 1;
      if (nextBystanderIndex >= bystanders.length) {
        resolveTransaction(false);
      } else {
        setBystanderIndex(nextBystanderIndex);
        const nextBystander = bystanders[nextBystanderIndex];
        const nextBystanderPlayerIndex = players.findIndex(
          (p) => p.id === nextBystander.id
        );
        setCurrentPlayerIndex(nextBystanderPlayerIndex);
      }
    }
  };

  /**
   * Continue after challenge reveal modal is closed.
   * Resolves the transaction with wasChallenged = true.
   */
  const handleContinueAfterChallenge = (): void => {
    setShowChallengeRevealModal(false);
    resolveTransaction(true);
    setChallengedTile(null);
  };

  /**
   * Handle receiver's decision to accept or reject a tile (legacy flow).
   * If reject: return tile to placer and advance turn
   * If accept: move to bystander challenge phase
   */
  const handleReceiverDecision = (decision: "accept" | "reject"): void => {
    if (!tileTransaction) return;
    setIsPrivatelyViewing(false);

    if (decision === "reject") {
      const placer = players.find((p) => p.id === tileTransaction.placerId);
      if (placer) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === placer.id
              ? { ...p, keptTiles: [...p.keptTiles, tileTransaction.tile] }
              : p
          )
        );
      }
      setBoardTiles((prev) =>
        prev.filter((bt) => bt.id !== tileTransaction.boardTileId)
      );
      advanceTurnNormally(tileTransaction.placerId);
    } else {
      // 'accept'
      setGameState("PENDING_CHALLENGE");

      const bystanderPlayers = players.filter(
        (p) =>
          p.id !== tileTransaction.placerId &&
          p.id !== tileTransaction.receiverId
      );
      const placerIndex = players.findIndex(
        (p) => p.id === tileTransaction.placerId
      );

      const sortedBystanders = bystanderPlayers.sort((a, b) => {
        const indexA = players.findIndex((p) => p.id === a.id);
        const indexB = players.findIndex((p) => p.id === b.id);
        const relativeA = (indexA - placerIndex + playerCount) % playerCount;
        const relativeB = (indexB - placerIndex + playerCount) % playerCount;
        return relativeA - relativeB;
      });

      setBystanders(sortedBystanders);
      setBystanderIndex(0);

      if (sortedBystanders.length > 0) {
        const firstBystanderIndex = players.findIndex(
          (p) => p.id === sortedBystanders[0].id
        );
        setCurrentPlayerIndex(firstBystanderIndex);
      } else {
        resolveTransaction(false);
      }
    }
  };

  return {
    handleBystanderDecision,
    handleContinueAfterChallenge,
    handleReceiverDecision,
    resolveTransaction,
  };
}
