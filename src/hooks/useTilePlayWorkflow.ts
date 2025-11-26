import { useState } from "react";
import type { TrackedMove, Piece, BoardTile, Tile } from "../types";

/**
 * Played tile state interface.
 */
interface PlayedTileState {
  tileId: string;
  playerId: number;
  receivingPlayerId: number;
  movesPerformed: TrackedMove[];
  originalPieces: Piece[];
  originalBoardTiles: BoardTile[];
}

/**
 * Tile transaction interface (during acceptance/challenge).
 */
interface TileTransaction {
  placerId: number;
  receiverId: number;
  boardTileId: string;
  tile: Tile;
}

/**
 * Custom hook for managing tile play workflow.
 *
 * Provides state for the tile placement and acceptance workflow including:
 * - Played tile tracking (who played, to whom, what moves)
 * - Moves performed this turn
 * - Tile reveal state
 * - Tile transaction (during acceptance/challenge phase)
 * - Receiver acceptance/rejection
 * - Challenge order and current challenger
 * - Tile rejection flag
 *
 * Dependencies: Typically used with useGameState for player data
 *
 * @returns Tile play workflow state and management functions
 */
export function useTilePlayWorkflow() {
  // Main played tile state
  const [playedTile, setPlayedTile] = useState<PlayedTileState | null>(null);

  // Move tracking for this turn
  const [movesThisTurn, setMovesThisTurn] = useState<TrackedMove[]>([]);

  // Tile play flags
  const [hasPlayedTileThisTurn, setHasPlayedTileThisTurn] = useState(false);
  const [revealedTileId, setRevealedTileId] = useState<string | null>(null);

  // Tile transaction during acceptance
  const [tileTransaction, setTileTransaction] =
    useState<TileTransaction | null>(null);

  // Receiver acceptance state
  const [receiverAcceptance, setReceiverAcceptance] = useState<boolean | null>(
    null
  );

  // Challenge flow
  const [challengeOrder, setChallengeOrder] = useState<number[]>([]);
  const [currentChallengerIndex, setCurrentChallengerIndex] = useState(0);

  // Rejection flag
  const [tileRejected, setTileRejected] = useState(false);

  /**
   * Start a tile play action.
   * @param tile - The played tile data
   */
  const startTilePlay = (tile: PlayedTileState) => {
    setPlayedTile(tile);
    setHasPlayedTileThisTurn(true);
  };

  /**
   * Record a move performed during tile play.
   * @param move - The move to record
   */
  const recordMove = (move: TrackedMove) => {
    setMovesThisTurn((prev) => [...prev, move]);
  };

  /**
   * Record multiple moves at once.
   * @param moves - The moves to record
   */
  const recordMoves = (moves: TrackedMove[]) => {
    setMovesThisTurn((prev) => [...prev, ...moves]);
  };

  /**
   * Clear all recorded moves for this turn.
   */
  const clearMoves = () => {
    setMovesThisTurn([]);
  };

  /**
   * Reveal a tile to players.
   * @param tileId - The ID of the tile to reveal
   */
  const revealTile = (tileId: string) => {
    setRevealedTileId(tileId);
  };

  /**
   * Hide the revealed tile.
   */
  const hideRevealedTile = () => {
    setRevealedTileId(null);
  };

  /**
   * Initialize a tile transaction (acceptance/challenge phase).
   * @param transaction - The tile transaction data
   */
  const initiateTileTransaction = (transaction: TileTransaction) => {
    setTileTransaction(transaction);
  };

  /**
   * Clear the tile transaction.
   */
  const clearTileTransaction = () => {
    setTileTransaction(null);
  };

  /**
   * Set the receiver's acceptance/rejection decision.
   * @param accepted - True if accepted, false if rejected, null if undecided
   */
  const setReceiverDecision = (accepted: boolean | null) => {
    setReceiverAcceptance(accepted);
  };

  /**
   * Set the challenge order for the tile.
   * @param order - Array of player IDs in challenge order
   */
  const setTileChallengeOrder = (order: number[]) => {
    setChallengeOrder(order);
    setCurrentChallengerIndex(0);
  };

  /**
   * Move to the next challenger in the challenge order.
   */
  const nextChallenger = () => {
    setCurrentChallengerIndex((prev) => prev + 1);
  };

  /**
   * Check if there are more challengers.
   * @returns True if there are more challengers
   */
  const hasMoreChallengers = (): boolean => {
    return currentChallengerIndex < challengeOrder.length - 1;
  };

  /**
   * Get the current challenger ID.
   * @returns The current challenger's player ID or null
   */
  const getCurrentChallengerId = (): number | null => {
    if (currentChallengerIndex < challengeOrder.length) {
      return challengeOrder[currentChallengerIndex];
    }
    return null;
  };

  /**
   * Mark the tile as rejected.
   */
  const markTileRejected = () => {
    setTileRejected(true);
  };

  /**
   * Clear the tile rejection flag.
   */
  const clearTileRejection = () => {
    setTileRejected(false);
  };

  /**
   * Complete the tile play workflow and reset state.
   */
  const completeTilePlay = () => {
    setPlayedTile(null);
    setMovesThisTurn([]);
    setHasPlayedTileThisTurn(false);
    setRevealedTileId(null);
    setTileTransaction(null);
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
  };

  /**
   * Reset tile play state for a new turn.
   */
  const resetForNewTurn = () => {
    setPlayedTile(null);
    setMovesThisTurn([]);
    setHasPlayedTileThisTurn(false);
    setRevealedTileId(null);
    setTileTransaction(null);
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
  };

  return {
    // State
    playedTile,
    movesThisTurn,
    hasPlayedTileThisTurn,
    revealedTileId,
    tileTransaction,
    receiverAcceptance,
    challengeOrder,
    currentChallengerIndex,
    tileRejected,

    // Actions
    startTilePlay,
    recordMove,
    recordMoves,
    clearMoves,
    revealTile,
    hideRevealedTile,
    initiateTileTransaction,
    clearTileTransaction,
    setReceiverDecision,
    setTileChallengeOrder,
    nextChallenger,
    hasMoreChallengers,
    getCurrentChallengerId,
    markTileRejected,
    clearTileRejection,
    completeTilePlay,
    resetForNewTurn,

    // Direct setters (for backward compatibility)
    setPlayedTile,
    setMovesThisTurn,
    setHasPlayedTileThisTurn,
    setRevealedTileId,
    setTileTransaction,
    setReceiverAcceptance,
    setChallengeOrder,
    setCurrentChallengerIndex,
    setTileRejected,
  };
}

// Export types
export type { PlayedTileState, TileTransaction };
