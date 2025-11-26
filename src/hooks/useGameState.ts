import { useState } from "react";
import type { GameState, Player, Piece, BoardTile, Tile } from "../types";

/**
 * Custom hook for managing core game state.
 *
 * This is the foundation hook that manages the primary game state including:
 * - Game phase (PLAYER_SELECTION, DRAFTING, CAMPAIGN, BUREAUCRACY)
 * - Players and their properties
 * - Game pieces (workers, supervisors, managers)
 * - Board tiles (placed tiles)
 * - Banked tiles (unused tiles)
 * - Current player and turn tracking
 * - Test mode flag
 *
 * This hook is used as a dependency by many other game hooks.
 *
 * @returns Core game state and management functions
 */
export function useGameState() {
  // Primary game state
  const [gameState, setGameState] = useState<GameState>("PLAYER_SELECTION");

  // Player data
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Game pieces
  const [pieces, setPieces] = useState<Piece[]>([]);

  // Board tiles
  const [boardTiles, setBoardTiles] = useState<BoardTile[]>([]);
  const [bankedTiles, setBankedTiles] = useState<
    (BoardTile & { faceUp: boolean })[]
  >([]);

  // Draft phase state
  const [draftRound, setDraftRound] = useState(1);

  // Test mode flag
  const [isTestMode, setIsTestMode] = useState(false);

  /**
   * Get the current active player.
   * @returns The current player or undefined if no players exist
   */
  const getCurrentPlayer = (): Player | undefined => {
    return players[currentPlayerIndex];
  };

  /**
   * Get a player by their ID.
   * @param playerId - The ID of the player to find
   * @returns The player or undefined if not found
   */
  const getPlayerById = (playerId: number): Player | undefined => {
    return players.find((p) => p.id === playerId);
  };

  /**
   * Update a specific player's data.
   * @param playerId - The ID of the player to update
   * @param updates - Partial player data to merge
   */
  const updatePlayer = (playerId: number, updates: Partial<Player>) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player
      )
    );
  };

  /**
   * Update multiple players at once.
   * @param updates - Array of player updates with id and partial data
   */
  const updatePlayers = (
    updates: Array<{ id: number; data: Partial<Player> }>
  ) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        const update = updates.find((u) => u.id === player.id);
        return update ? { ...player, ...update.data } : player;
      })
    );
  };

  /**
   * Move to the next player in turn order.
   * Wraps around to player 0 after the last player.
   */
  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  /**
   * Set the current player by index.
   * @param index - The player index
   */
  const setCurrentPlayer = (index: number) => {
    if (index >= 0 && index < players.length) {
      setCurrentPlayerIndex(index);
    }
  };

  /**
   * Update a specific piece's data.
   * @param pieceId - The ID of the piece to update
   * @param updates - Partial piece data to merge
   */
  const updatePiece = (pieceId: string, updates: Partial<Piece>) => {
    setPieces((prevPieces) =>
      prevPieces.map((piece) =>
        piece.id === pieceId ? { ...piece, ...updates } : piece
      )
    );
  };

  /**
   * Update multiple pieces at once.
   * @param updates - Array of piece updates with id and partial data
   */
  const updatePieces = (
    updates: Array<{ id: string; data: Partial<Piece> }>
  ) => {
    setPieces((prevPieces) =>
      prevPieces.map((piece) => {
        const update = updates.find((u) => u.id === piece.id);
        return update ? { ...piece, ...update.data } : piece;
      })
    );
  };

  /**
   * Get pieces owned by a specific player.
   * @param playerId - The player ID
   * @returns Array of pieces owned by the player
   */
  const getPlayerPieces = (playerId: number): Piece[] => {
    return pieces.filter((piece) => piece.playerId === playerId);
  };

  /**
   * Get pieces of a specific type for a player.
   * @param playerId - The player ID
   * @param type - The piece type (worker, supervisor, manager)
   * @returns Array of matching pieces
   */
  const getPlayerPiecesByType = (playerId: number, type: string): Piece[] => {
    return pieces.filter(
      (piece) => piece.playerId === playerId && piece.type === type
    );
  };

  /**
   * Add a tile to the board.
   * @param tile - The board tile to add
   */
  const addBoardTile = (tile: BoardTile) => {
    setBoardTiles((prev) => [...prev, tile]);
  };

  /**
   * Remove a tile from the board.
   * @param tileId - The ID of the tile to remove
   */
  const removeBoardTile = (tileId: string) => {
    setBoardTiles((prev) => prev.filter((t) => t.id !== tileId));
  };

  /**
   * Update a board tile.
   * @param tileId - The ID of the tile to update
   * @param updates - Partial tile data to merge
   */
  const updateBoardTile = (tileId: string, updates: Partial<BoardTile>) => {
    setBoardTiles((prev) =>
      prev.map((tile) => (tile.id === tileId ? { ...tile, ...updates } : tile))
    );
  };

  /**
   * Add a tile to the bank.
   * @param tile - The board tile to bank
   * @param faceUp - Whether the tile is face up
   */
  const addBankedTile = (tile: BoardTile, faceUp: boolean = false) => {
    setBankedTiles((prev) => [...prev, { ...tile, faceUp }]);
  };

  /**
   * Advance to the next draft round.
   */
  const nextDraftRound = () => {
    setDraftRound((prev) => prev + 1);
  };

  /**
   * Reset the game to initial state.
   */
  const resetGame = () => {
    setGameState("PLAYER_SELECTION");
    setPlayers([]);
    setPlayerCount(0);
    setPieces([]);
    setBoardTiles([]);
    setBankedTiles([]);
    setCurrentPlayerIndex(0);
    setDraftRound(1);
    setIsTestMode(false);
  };

  /**
   * Transition to a new game phase.
   * @param newState - The new game state
   */
  const transitionToPhase = (newState: GameState) => {
    setGameState(newState);
  };

  return {
    // Core state
    gameState,
    players,
    playerCount,
    currentPlayerIndex,
    pieces,
    boardTiles,
    bankedTiles,
    draftRound,
    isTestMode,

    // Computed values
    getCurrentPlayer,
    getPlayerById,
    getPlayerPieces,
    getPlayerPiecesByType,

    // Player actions
    updatePlayer,
    updatePlayers,
    nextPlayer,
    setCurrentPlayer,

    // Piece actions
    updatePiece,
    updatePieces,

    // Board tile actions
    addBoardTile,
    removeBoardTile,
    updateBoardTile,
    addBankedTile,

    // Game flow actions
    nextDraftRound,
    resetGame,
    transitionToPhase,

    // Direct setters (for backward compatibility)
    setGameState,
    setPlayers,
    setPlayerCount,
    setCurrentPlayerIndex,
    setPieces,
    setBoardTiles,
    setBankedTiles,
    setDraftRound,
    setIsTestMode,
  };
}
