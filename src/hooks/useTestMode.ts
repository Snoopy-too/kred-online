import { useState } from "react";

/**
 * Custom hook for managing test mode state and functionality.
 *
 * Provides state for test mode features including:
 * - Game log with expandable UI
 * - Credibility adjuster tool
 * - Credibility rules display
 * - Piece tracker
 *
 * This hook is standalone and has no dependencies on other game state.
 *
 * @returns Test mode state and actions
 */
export function useTestMode() {
  // Game log state
  const [gameLog, setGameLog] = useState<string[]>([]);

  // UI expansion states for test mode modules
  const [isGameLogExpanded, setIsGameLogExpanded] = useState(true);
  const [isCredibilityAdjusterExpanded, setIsCredibilityAdjusterExpanded] =
    useState(false);
  const [isCredibilityRulesExpanded, setIsCredibilityRulesExpanded] =
    useState(false);
  const [isPieceTrackerExpanded, setIsPieceTrackerExpanded] = useState(false);

  // Credibility rotation adjustments for testing
  const [credibilityRotationAdjustments, setCredibilityRotationAdjustments] =
    useState<{ [playerId: number]: number }>({});

  /**
   * Add a message to the game log.
   * @param message - The log message to add
   */
  const addGameLog = (message: string) => {
    setGameLog((prev) => [...prev, message]);
  };

  /**
   * Add multiple messages to the game log at once.
   * @param messages - Array of messages to add
   */
  const addGameLogs = (messages: string[]) => {
    setGameLog((prev) => [...prev, ...messages]);
  };

  /**
   * Clear the game log.
   */
  const clearGameLog = () => {
    setGameLog([]);
  };

  /**
   * Toggle the game log expanded state.
   */
  const toggleGameLog = () => {
    setIsGameLogExpanded((prev) => !prev);
  };

  /**
   * Toggle the credibility adjuster expanded state.
   */
  const toggleCredibilityAdjuster = () => {
    setIsCredibilityAdjusterExpanded((prev) => !prev);
  };

  /**
   * Toggle the credibility rules expanded state.
   */
  const toggleCredibilityRules = () => {
    setIsCredibilityRulesExpanded((prev) => !prev);
  };

  /**
   * Toggle the piece tracker expanded state.
   */
  const togglePieceTracker = () => {
    setIsPieceTrackerExpanded((prev) => !prev);
  };

  /**
   * Update credibility rotation adjustment for a specific player.
   * @param playerId - The player ID
   * @param adjustment - The credibility adjustment value
   */
  const updateCredibilityAdjustment = (
    playerId: number,
    adjustment: number
  ) => {
    setCredibilityRotationAdjustments((prev) => ({
      ...prev,
      [playerId]: adjustment,
    }));
  };

  /**
   * Clear all credibility rotation adjustments.
   */
  const clearCredibilityAdjustments = () => {
    setCredibilityRotationAdjustments({});
  };

  return {
    // State
    gameLog,
    isGameLogExpanded,
    isCredibilityAdjusterExpanded,
    isCredibilityRulesExpanded,
    isPieceTrackerExpanded,
    credibilityRotationAdjustments,

    // Actions
    addGameLog,
    addGameLogs,
    clearGameLog,
    toggleGameLog,
    toggleCredibilityAdjuster,
    toggleCredibilityRules,
    togglePieceTracker,
    updateCredibilityAdjustment,
    clearCredibilityAdjustments,

    // Direct setters (for backward compatibility)
    setGameLog,
    setIsGameLogExpanded,
    setIsCredibilityAdjusterExpanded,
    setIsCredibilityRulesExpanded,
    setIsPieceTrackerExpanded,
    setCredibilityRotationAdjustments,
  };
}
