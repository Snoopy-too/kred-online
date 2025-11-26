import { useState } from "react";

/**
 * Alert modal configuration interface.
 */
interface AlertModal {
  isOpen: boolean;
  title: string;
  message: string;
  type: "error" | "warning" | "info";
}

/**
 * Custom hook for managing alert modals and UI messages.
 *
 * Provides state for:
 * - Generic alert modals (error, warning, info)
 * - Challenge result messages
 * - Tile withdrawal flags
 * - Tile viewing modals (placer and receiver)
 *
 * This hook is standalone and has no dependencies on other game state.
 *
 * @returns Alert state and display functions
 */
export function useAlerts() {
  // Generic alert modal
  const [alertModal, setAlertModal] = useState<AlertModal>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Challenge-specific messages
  const [challengeResultMessage, setChallengeResultMessage] = useState<
    string | null
  >(null);
  const [tilePlayerMustWithdraw, setTilePlayerMustWithdraw] = useState(false);

  // Tile viewing states (for private tile reveal)
  const [placerViewingTileId, setPlacerViewingTileId] = useState<string | null>(
    null
  );
  const [giveReceiverViewingTileId, setGiveReceiverViewingTileId] = useState<
    string | null
  >(null);

  /**
   * Show an alert modal with the specified content.
   * @param title - The alert title
   * @param message - The alert message
   * @param type - The alert type (error, warning, info)
   */
  const showAlert = (
    title: string,
    message: string,
    type: "error" | "warning" | "info" = "info"
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  /**
   * Close the alert modal.
   */
  const closeAlert = () => {
    setAlertModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  /**
   * Show a challenge result message.
   * @param message - The challenge result message
   */
  const showChallengeResult = (message: string) => {
    setChallengeResultMessage(message);
  };

  /**
   * Clear the challenge result message.
   */
  const clearChallengeResult = () => {
    setChallengeResultMessage(null);
  };

  /**
   * Set the tile withdrawal flag.
   * @param mustWithdraw - Whether the tile player must withdraw
   */
  const setWithdrawalRequired = (mustWithdraw: boolean) => {
    setTilePlayerMustWithdraw(mustWithdraw);
  };

  /**
   * Clear all viewing tile states.
   */
  const clearViewingTiles = () => {
    setPlacerViewingTileId(null);
    setGiveReceiverViewingTileId(null);
  };

  return {
    // State
    alertModal,
    challengeResultMessage,
    tilePlayerMustWithdraw,
    placerViewingTileId,
    giveReceiverViewingTileId,

    // Actions
    showAlert,
    closeAlert,
    showChallengeResult,
    clearChallengeResult,
    setWithdrawalRequired,
    clearViewingTiles,

    // Direct setters (for backward compatibility)
    setAlertModal,
    setChallengeResultMessage,
    setTilePlayerMustWithdraw,
    setPlacerViewingTileId,
    setGiveReceiverViewingTileId,
  };
}
