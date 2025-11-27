/**
 * Tile Play Handlers
 *
 * This module contains handlers for tile placement and viewing during the campaign phase.
 * Uses the factory pattern for dependency injection.
 *
 * Handlers included:
 * - handlePlaceTile: Place a tile to a receiving space
 * - handleRevealTile: Reveal a tile to players
 * - handleTogglePrivateView: Toggle private viewing mode
 * - handlePlacerViewTile: Allow placer to view their played tile
 *
 * Note: More complex handlers like handleReceiverAcceptanceDecision and calculateMoves
 * remain in App.tsx due to their extensive dependencies on other handlers and state.
 */

import React from "react";
import type {
  Piece,
  Player,
  BoardTile,
  TileReceivingSpace,
  GameState,
} from "../types";
import { PlayedTileState } from "../hooks/useTilePlayWorkflow";
import { ALERTS } from "../../constants";

// ============================================================================
// DEPENDENCY INTERFACE
// ============================================================================

export interface TilePlayDependencies {
  // Current state values
  players: Player[];
  playerCount: number;
  currentPlayerIndex: number;
  hasPlayedTileThisTurn: boolean;
  piecesAtTurnStart: Piece[];
  boardTiles: BoardTile[];
  bankSpacesByPlayerCount: Record<number, Array<{ ownerId: number }>>;

  // State setters
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setBoardTiles: React.Dispatch<React.SetStateAction<BoardTile[]>>;
  setPlayedTile: React.Dispatch<React.SetStateAction<PlayedTileState | null>>;
  setGameState: (state: GameState) => void;
  setMovesThisTurn: React.Dispatch<React.SetStateAction<any[]>>;
  setHasPlayedTileThisTurn: (value: boolean) => void;
  setMovedPiecesThisTurn: React.Dispatch<React.SetStateAction<Set<string>>>;
  setPendingCommunityPieces: React.Dispatch<React.SetStateAction<Set<string>>>;
  setBonusMoveWasCompleted: (value: boolean) => void;
  setPiecesAtCorrectionStart: React.Dispatch<React.SetStateAction<Piece[]>>;
  setPiecesBeforeBonusMove: React.Dispatch<React.SetStateAction<Piece[]>>;
  setRevealedTileId: (id: string | null) => void;
  setIsPrivatelyViewing: React.Dispatch<React.SetStateAction<boolean>>;
  setPlacerViewingTileId: React.Dispatch<React.SetStateAction<string | null>>;

  // Utility functions
  showAlert: (title: string, message: string, type: string) => void;
}

// ============================================================================
// HANDLER FACTORY
// ============================================================================

export function createTilePlayHandlers(deps: TilePlayDependencies) {
  const {
    // Current state values
    players,
    playerCount,
    currentPlayerIndex,
    hasPlayedTileThisTurn,
    piecesAtTurnStart,
    boardTiles,
    bankSpacesByPlayerCount,

    // State setters
    setPlayers,
    setBoardTiles,
    setPlayedTile,
    setGameState,
    setMovesThisTurn,
    setHasPlayedTileThisTurn,
    setMovedPiecesThisTurn,
    setPendingCommunityPieces,
    setBonusMoveWasCompleted,
    setPiecesAtCorrectionStart,
    setPiecesBeforeBonusMove,
    setRevealedTileId,
    setIsPrivatelyViewing,
    setPlacerViewingTileId,

    // Utility functions
    showAlert,
  } = deps;

  /**
   * Place a tile to a receiving space on the board.
   * Validates placement rules and initializes the tile play workflow.
   */
  const handlePlaceTile = (
    tileId: number,
    targetSpace: TileReceivingSpace
  ): void => {
    if (hasPlayedTileThisTurn) return;
    const currentPlayer = players[currentPlayerIndex];
    const tileToPlace = currentPlayer.keptTiles.find((t) => t.id === tileId);

    if (
      !tileToPlace ||
      boardTiles.some((bt) => bt.ownerId === targetSpace.ownerId)
    )
      return;

    if (currentPlayer.id === targetSpace.ownerId) {
      const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);
      const allOthersAreOutOfTiles = otherPlayers.every(
        (p) => p.keptTiles.length === 0
      );
      if (!allOthersAreOutOfTiles) {
        showAlert(
          ALERTS.CANNOT_PLAY_FOR_YOURSELF.title,
          ALERTS.CANNOT_PLAY_FOR_YOURSELF.message,
          "warning"
        );
        return;
      }
    }

    // Check if target player's bank is full
    const allBankSpaces = bankSpacesByPlayerCount[playerCount] || [];
    const tilesPerPlayer = allBankSpaces.length / playerCount;
    const targetPlayer = players.find((p) => p.id === targetSpace.ownerId);

    if (
      targetPlayer &&
      targetPlayer.bureaucracyTiles.length >= tilesPerPlayer
    ) {
      showAlert(
        "Bank Full",
        `Player ${targetSpace.ownerId}'s bank is full. You cannot play a tile to them. Choose a different player.`,
        "warning"
      );
      return;
    }

    // Campaign phase tile rules
    const totalTilesPlayed = players.reduce(
      (sum, p) => sum + p.bureaucracyTiles.length,
      0
    );
    const totalTiles = allBankSpaces.length; // 24 for 3/4p, 25 for 5p
    const isLastTile = totalTilesPlayed === totalTiles - 1;

    if (isLastTile) {
      // Final tile: Can ONLY be played to the player with one remaining bank space
      if (
        !targetPlayer ||
        targetPlayer.bureaucracyTiles.length !== tilesPerPlayer - 1
      ) {
        const eligiblePlayer = players.find(
          (p) => p.bureaucracyTiles.length === tilesPerPlayer - 1
        );
        showAlert(
          "Invalid Final Tile Placement",
          eligiblePlayer
            ? `This is the final tile of the campaign phase. It can only be played to Player ${eligiblePlayer.id}, who has one remaining bank space.`
            : "This is the final tile of the campaign phase, but no player has exactly one remaining bank space.",
          "warning"
        );
        return;
      }
    } else {
      // Non-final tiles: MUST be played to a player who has at least 1 tile in their hand
      if (!targetPlayer || targetPlayer.keptTiles.length === 0) {
        showAlert(
          "Invalid Tile Placement",
          `You must play to a player who has at least 1 tile in their hand. Player ${targetSpace.ownerId} has no tiles left.`,
          "warning"
        );
        return;
      }
    }

    // Initialize the tile play state
    const tileIdStr = tileId.toString().padStart(2, "0");
    const boardTileId = `boardtile_${Date.now()}`;

    // Create a BoardTile to display in the receiving space (face-down/white back)
    const newBoardTile: BoardTile = {
      id: boardTileId,
      tile: tileToPlace,
      position: targetSpace.position,
      rotation: targetSpace.rotation,
      placerId: currentPlayer.id,
      ownerId: targetSpace.ownerId,
    };

    setPlayedTile({
      tileId: tileIdStr,
      playerId: currentPlayer.id,
      receivingPlayerId: targetSpace.ownerId,
      movesPerformed: [],
      originalPieces: piecesAtTurnStart.map((p) => ({ ...p })),
      originalBoardTiles: boardTiles.map((t) => ({ ...t })),
    });

    // Add the board tile to display in the receiving space
    setBoardTiles((prev) => [...prev, newBoardTile]);

    // Remove tile from player's hand (will be added back if rejected)
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayer.id
          ? { ...p, keptTiles: p.keptTiles.filter((t) => t.id !== tileId) }
          : p
      )
    );

    // Set game state to allow moves (tile not yet visible to others)
    setGameState("TILE_PLAYED");
    setMovesThisTurn([]);
    setHasPlayedTileThisTurn(true);

    // Clear piece movement tracking for this tile play
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    // Clear any stale correction/bonus move state from previous tile plays
    setBonusMoveWasCompleted(false);
    setPiecesAtCorrectionStart([]);
    setPiecesBeforeBonusMove([]);
  };

  /**
   * Reveal a tile to players by setting the revealed tile ID.
   */
  const handleRevealTile = (tileId: string | null): void => {
    setRevealedTileId(tileId);
  };

  /**
   * Toggle private viewing mode for the current player.
   */
  const handleTogglePrivateView = (): void => {
    setIsPrivatelyViewing((prev) => !prev);
  };

  /**
   * Allow the placer to view their played tile.
   * Toggles off if the same tile ID is passed again.
   */
  const handlePlacerViewTile = (tileId: string): void => {
    setPlacerViewingTileId((prevId) => (prevId === tileId ? null : tileId));
  };

  return {
    handlePlaceTile,
    handleRevealTile,
    handleTogglePrivateView,
    handlePlacerViewTile,
  };
}
