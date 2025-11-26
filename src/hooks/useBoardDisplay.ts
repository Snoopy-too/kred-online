import { useState } from "react";

/**
 * Custom hook for managing board display settings and visual aids.
 *
 * Provides state for:
 * - Board rotation enabling/disabling
 * - Grid overlay visibility
 * - Dummy tile drag preview
 *
 * This hook is standalone and has no dependencies on other game state.
 *
 * @returns Board display state and controls
 */
export function useBoardDisplay() {
  // Board rotation control
  const [boardRotationEnabled, setBoardRotationEnabled] = useState(true);

  // Grid overlay for alignment
  const [showGridOverlay, setShowGridOverlay] = useState(false);

  // Dummy tile for drag preview
  const [dummyTile, setDummyTile] = useState<{
    position: { top: number; left: number };
    rotation: number;
  } | null>(null);

  /**
   * Toggle board rotation on/off.
   */
  const toggleBoardRotation = () => {
    setBoardRotationEnabled((prev) => !prev);
  };

  /**
   * Toggle grid overlay visibility.
   */
  const toggleGridOverlay = () => {
    setShowGridOverlay((prev) => !prev);
  };

  /**
   * Set the dummy tile preview for drag operations.
   * @param position - The position of the dummy tile
   * @param rotation - The rotation angle of the dummy tile
   */
  const setDummyTilePreview = (
    position: { top: number; left: number } | null,
    rotation: number = 0
  ) => {
    if (position === null) {
      setDummyTile(null);
    } else {
      setDummyTile({ position, rotation });
    }
  };

  /**
   * Clear the dummy tile preview.
   */
  const clearDummyTile = () => {
    setDummyTile(null);
  };

  return {
    // State
    boardRotationEnabled,
    showGridOverlay,
    dummyTile,

    // Actions
    toggleBoardRotation,
    toggleGridOverlay,
    setDummyTilePreview,
    clearDummyTile,

    // Direct setters (for backward compatibility)
    setBoardRotationEnabled,
    setShowGridOverlay,
    setDummyTile,
  };
}
