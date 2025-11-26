import { useState } from "react";

/**
 * Custom hook for managing bonus move mechanics.
 *
 * Provides state for:
 * - Bonus move modal visibility
 * - Which player gets the bonus move
 * - Whether the bonus move was completed
 * - Perfect tile modal (bonus for perfect play)
 *
 * Dependencies: Typically used with useGameState and useMoveTracking
 *
 * @returns Bonus move state and management functions
 */
export function useBonusMoves() {
  // Bonus move modal and player
  const [showBonusMoveModal, setShowBonusMoveModal] = useState(false);
  const [bonusMovePlayerId, setBonusMovePlayerId] = useState<number | null>(
    null
  );

  // Bonus move completion flag
  const [bonusMoveWasCompleted, setBonusMoveWasCompleted] = useState(false);

  // Perfect tile modal (special bonus)
  const [showPerfectTileModal, setShowPerfectTileModal] = useState(false);

  /**
   * Initiate a bonus move for a player.
   * @param playerId - The player who gets the bonus move
   */
  const initiateBonusMove = (playerId: number) => {
    setBonusMovePlayerId(playerId);
    setShowBonusMoveModal(true);
    setBonusMoveWasCompleted(false);
  };

  /**
   * Complete the bonus move.
   */
  const completeBonusMove = () => {
    setBonusMoveWasCompleted(true);
    setShowBonusMoveModal(false);
  };

  /**
   * Skip the bonus move without completing it.
   */
  const skipBonusMove = () => {
    setBonusMoveWasCompleted(false);
    setShowBonusMoveModal(false);
  };

  /**
   * Cancel the bonus move and reset state.
   */
  const cancelBonusMove = () => {
    setShowBonusMoveModal(false);
    setBonusMovePlayerId(null);
    setBonusMoveWasCompleted(false);
  };

  /**
   * Show the perfect tile modal (special achievement).
   */
  const showPerfectTileReward = () => {
    setShowPerfectTileModal(true);
  };

  /**
   * Hide the perfect tile modal.
   */
  const hidePerfectTileReward = () => {
    setShowPerfectTileModal(false);
  };

  /**
   * Check if a bonus move is currently active.
   * @returns True if bonus move modal is visible
   */
  const isBonusMoveActive = (): boolean => {
    return showBonusMoveModal;
  };

  /**
   * Check if the bonus move was completed.
   * @returns True if bonus move was completed
   */
  const wasBonusMoveCompleted = (): boolean => {
    return bonusMoveWasCompleted;
  };

  /**
   * Reset all bonus move state.
   */
  const resetBonusMoveState = () => {
    setShowBonusMoveModal(false);
    setBonusMovePlayerId(null);
    setBonusMoveWasCompleted(false);
    setShowPerfectTileModal(false);
  };

  return {
    // State
    showBonusMoveModal,
    bonusMovePlayerId,
    bonusMoveWasCompleted,
    showPerfectTileModal,

    // Actions
    initiateBonusMove,
    completeBonusMove,
    skipBonusMove,
    cancelBonusMove,
    showPerfectTileReward,
    hidePerfectTileReward,
    isBonusMoveActive,
    wasBonusMoveCompleted,
    resetBonusMoveState,

    // Direct setters (for backward compatibility)
    setShowBonusMoveModal,
    setBonusMovePlayerId,
    setBonusMoveWasCompleted,
    setShowPerfectTileModal,
  };
}
