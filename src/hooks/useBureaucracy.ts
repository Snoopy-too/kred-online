import { useState } from "react";
import type {
  Player,
  Piece,
  BoardTile,
  TrackedMove,
  BureaucracyPlayerState,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../types";
import {
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
} from "../game/bureaucracy";
import { createGameStateSnapshot } from "../game/state-snapshots";

/**
 * Custom hook for managing bureaucracy phase state and logic.
 *
 * Provides state for:
 * - Bureaucracy player states (kredcoin, purchases)
 * - Turn order and current player tracking
 * - Menu visibility and purchase management
 * - Move validation and tracking
 * - Snapshot handling for undo/reset
 * - Error handling and validation
 *
 * Dependencies: Uses game/bureaucracy and game/state-snapshots functions
 *
 * @returns Bureaucracy phase state and management functions
 */
export function useBureaucracy() {
  // Core bureaucracy state
  const [bureaucracyStates, setBureaucracyStates] = useState<
    BureaucracyPlayerState[]
  >([]);
  const [bureaucracyTurnOrder, setBureaucracyTurnOrder] = useState<number[]>(
    []
  );
  const [currentBureaucracyPlayerIndex, setCurrentBureaucracyPlayerIndex] =
    useState(0);

  // Purchase state
  const [currentBureaucracyPurchase, setCurrentBureaucracyPurchase] =
    useState<BureaucracyPurchase | null>(null);
  const [showBureaucracyMenu, setShowBureaucracyMenu] = useState(true);

  // Validation and error state
  const [bureaucracyValidationError, setBureaucracyValidationError] = useState<
    string | null
  >(null);

  // Move tracking
  const [bureaucracyMoves, setBureaucracyMoves] = useState<TrackedMove[]>([]);

  // Snapshot for undo/reset
  const [bureaucracySnapshot, setBureaucracySnapshot] = useState<{
    pieces: Piece[];
    boardTiles: BoardTile[];
  } | null>(null);

  // Move check result modal
  const [showBureaucracyMoveCheckResult, setShowBureaucracyMoveCheckResult] =
    useState(false);
  const [bureaucracyMoveCheckResult, setBureaucracyMoveCheckResult] = useState<{
    isValid: boolean;
    reason: string;
  } | null>(null);

  // Pending community pieces (for challenge resolution)
  const [pendingCommunityPieces, setPendingCommunityPieces] = useState<
    Set<string>
  >(new Set());

  // Finish turn confirmation dialog
  const [showFinishTurnConfirm, setShowFinishTurnConfirm] = useState<{
    isOpen: boolean;
    remainingKredcoin: number;
  }>({
    isOpen: false,
    remainingKredcoin: 0,
  });

  // Phase transition state
  const [showBureaucracyTransition, setShowBureaucracyTransition] =
    useState(false);

  /**
   * Initialize bureaucracy phase for all players.
   * Calculates kredcoin and determines turn order.
   *
   * @param players - Array of all players
   */
  const startBureaucracyPhase = (players: Player[]) => {
    const turnOrder = getBureaucracyTurnOrder(players);

    const initialStates: BureaucracyPlayerState[] = players.map((player) => {
      const kredcoin = calculatePlayerKredcoin(player);
      return {
        playerId: player.id,
        initialKredcoin: kredcoin,
        remainingKredcoin: kredcoin,
        turnComplete: false,
        purchases: [],
      };
    });

    setBureaucracyStates(initialStates);
    setBureaucracyTurnOrder(turnOrder);
    setCurrentBureaucracyPlayerIndex(0);
    setShowBureaucracyMenu(true);
    setCurrentBureaucracyPurchase(null);
    setBureaucracyValidationError(null);
    setBureaucracyMoves([]);
    setBureaucracySnapshot(null);
  };

  /**
   * Get the current player's bureaucracy state.
   *
   * @returns Current player's state or undefined
   */
  const getCurrentBureaucracyPlayerState = ():
    | BureaucracyPlayerState
    | undefined => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    return bureaucracyStates.find((s) => s.playerId === currentPlayerId);
  };

  /**
   * Select a menu item for purchase.
   * Validates affordability and creates a purchase record.
   *
   * @param item - The selected menu item
   * @param pieces - Current pieces state
   * @param boardTiles - Current board tiles state
   */
  const selectMenuItem = (
    item: BureaucracyMenuItem,
    pieces: Piece[],
    boardTiles: BoardTile[]
  ) => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(
      (s) => s.playerId === currentPlayerId
    );

    if (!playerState || playerState.remainingKredcoin < item.price) {
      setBureaucracyValidationError("Insufficient Kredcoin for this purchase");
      return;
    }

    // Create the purchase
    const purchase: BureaucracyPurchase = {
      playerId: currentPlayerId,
      item,
      timestamp: Date.now(),
      completed: false,
    };

    setCurrentBureaucracyPurchase(purchase);
    setShowBureaucracyMenu(false);
    setBureaucracyMoves([]);

    // Take snapshot of game state before action
    setBureaucracySnapshot(createGameStateSnapshot(pieces, boardTiles));
  };

  /**
   * Complete the current purchase.
   * Deducts kredcoin and adds to completed purchases.
   *
   * @param players - Current players state
   * @param pieces - Current pieces state
   * @param boardTiles - Current board tiles state
   * @param playerCount - Number of players
   * @returns Updated players array
   */
  const completePurchase = (
    players: Player[],
    pieces: Piece[],
    boardTiles: BoardTile[],
    playerCount: number
  ): Player[] => {
    if (!currentBureaucracyPurchase) return players;

    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(
      (s) => s.playerId === currentPlayerId
    );
    if (!playerState) return players;

    // Update bureaucracy states
    const updatedStates = bureaucracyStates.map((s) => {
      if (s.playerId === currentPlayerId) {
        return {
          ...s,
          remainingKredcoin:
            s.remainingKredcoin - currentBureaucracyPurchase.item.price,
          purchases: [
            ...s.purchases,
            { ...currentBureaucracyPurchase, completed: true },
          ],
        };
      }
      return s;
    });

    setBureaucracyStates(updatedStates);
    setCurrentBureaucracyPurchase(null);
    setShowBureaucracyMenu(true);
    setBureaucracyMoves([]);

    // Deduct tiles from bureaucracyTiles
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayerId) {
        const tileCount = currentBureaucracyPurchase.item.price;
        const remainingTiles = [...p.bureaucracyTiles];
        remainingTiles.splice(0, tileCount); // Remove used tiles

        return {
          ...p,
          bureaucracyTiles: remainingTiles,
        };
      }
      return p;
    });

    return updatedPlayers;
  };

  /**
   * Reset the current action and restore snapshot.
   */
  const resetAction = () => {
    setShowBureaucracyMenu(true);
    setCurrentBureaucracyPurchase(null);
    setBureaucracyMoves([]);
    setBureaucracyValidationError(null);
  };

  /**
   * Advance to the next player in turn order.
   */
  const nextBureaucracyPlayer = () => {
    setCurrentBureaucracyPlayerIndex((prev) =>
      prev + 1 < bureaucracyTurnOrder.length ? prev + 1 : 0
    );
    setShowBureaucracyMenu(true);
    setCurrentBureaucracyPurchase(null);
    setBureaucracyMoves([]);
    setBureaucracyValidationError(null);
  };

  /**
   * Clear validation error message.
   */
  const clearValidationError = () => {
    setBureaucracyValidationError(null);
  };

  /**
   * Show finish turn confirmation dialog.
   */
  const showFinishTurnDialog = () => {
    const playerState = getCurrentBureaucracyPlayerState();
    setShowFinishTurnConfirm({
      isOpen: true,
      remainingKredcoin: playerState?.remainingKredcoin || 0,
    });
  };

  /**
   * Close finish turn confirmation dialog.
   */
  const closeFinishTurnDialog = () => {
    setShowFinishTurnConfirm({
      isOpen: false,
      remainingKredcoin: 0,
    });
  };

  /**
   * Check if all players have completed their turns.
   *
   * @returns True if all turns are complete
   */
  const areAllTurnsComplete = (): boolean => {
    return bureaucracyStates.every((state) => state.remainingKredcoin === 0);
  };

  /**
   * Get player state by player ID.
   *
   * @param playerId - The player ID
   * @returns Player's bureaucracy state or undefined
   */
  const getPlayerState = (
    playerId: number
  ): BureaucracyPlayerState | undefined => {
    return bureaucracyStates.find((s) => s.playerId === playerId);
  };

  /**
   * Show the bureaucracy transition modal.
   */
  const showTransition = () => {
    setShowBureaucracyTransition(true);
  };

  /**
   * Hide the bureaucracy transition modal.
   */
  const hideTransition = () => {
    setShowBureaucracyTransition(false);
  };

  /**
   * Show move check result modal.
   *
   * @param isValid - Whether moves are valid
   * @param reason - Validation reason/message
   */
  const showMoveCheckResult = (isValid: boolean, reason: string) => {
    setBureaucracyMoveCheckResult({ isValid, reason });
    setShowBureaucracyMoveCheckResult(true);
  };

  /**
   * Close move check result modal.
   */
  const closeMoveCheckResult = () => {
    setShowBureaucracyMoveCheckResult(false);
    setBureaucracyMoveCheckResult(null);
  };

  return {
    // State
    bureaucracyStates,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    currentBureaucracyPurchase,
    showBureaucracyMenu,
    bureaucracyValidationError,
    bureaucracyMoves,
    bureaucracySnapshot,
    showBureaucracyMoveCheckResult,
    bureaucracyMoveCheckResult,
    pendingCommunityPieces,
    showFinishTurnConfirm,
    showBureaucracyTransition,

    // Setters (for external use if needed)
    setBureaucracyStates,
    setBureaucracyTurnOrder,
    setCurrentBureaucracyPlayerIndex,
    setCurrentBureaucracyPurchase,
    setShowBureaucracyMenu,
    setBureaucracyValidationError,
    setBureaucracyMoves,
    setBureaucracySnapshot,
    setShowBureaucracyMoveCheckResult,
    setBureaucracyMoveCheckResult,
    setPendingCommunityPieces,
    setShowFinishTurnConfirm,
    setShowBureaucracyTransition,

    // Functions
    startBureaucracyPhase,
    getCurrentBureaucracyPlayerState,
    selectMenuItem,
    completePurchase,
    resetAction,
    nextBureaucracyPlayer,
    clearValidationError,
    showFinishTurnDialog,
    closeFinishTurnDialog,
    areAllTurnsComplete,
    getPlayerState,
    showTransition,
    hideTransition,
    showMoveCheckResult,
    closeMoveCheckResult,
  };
}
