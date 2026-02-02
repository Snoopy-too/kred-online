/**
 * Multiplayer Synchronization Hook
 * 
 * Syncs game state across all players via socket.io
 * Uses new server architecture with game:* events
 */

import { useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Player, Piece, BoardTile, GameState, PlayedTileState } from '../types';

export interface MultiplayerSyncProps {
  socket?: Socket;
  roomId?: string;
  playerId?: string;
  playerIndex?: number;

  // Current game state
  gameState: GameState;
  players: Player[];
  pieces: Piece[];
  boardTiles: BoardTile[];
  currentPlayerIndex: number;

  // State setters
  setGameState: (state: GameState) => void;
  setPlayers: (players: Player[]) => void;
  setPieces: (pieces: Piece[]) => void;
  setBoardTiles: (tiles: BoardTile[]) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setPlayerIndex?: (index: number) => void;
  setPlayerCount?: (count: number) => void;
  setPlayedTile?: (tile: PlayedTileState | null) => void;
}

export function useMultiplayerSync(props: MultiplayerSyncProps) {
  const {
    socket,
    roomId,
    playerId,
    playerIndex,
    gameState,
    players,
    pieces,
    boardTiles,
    currentPlayerIndex,
    setGameState,
    setPlayers,
    setPieces,
    setBoardTiles,
    setCurrentPlayerIndex,
    setPlayerCount,
    setPlayedTile
  } = props;
  // Log when hook is called
  console.log('[MULTIPLAYER SYNC] Hook called with socket:', !!socket, 'roomId:', roomId);

  // Debug: Log initial props
  console.log('[MULTIPLAYER SYNC] Initial props:', {
    roomId, playerId, playerIndex, gameState, players, pieces, boardTiles, currentPlayerIndex
  });

  const isMultiplayer = !!(socket && roomId);
  const isMyTurn = currentPlayerIndex === playerIndex;

  // Note: State broadcasting is now handled by server
  // Client should emit specific action events, not broadcast full state
  const broadcastState = useCallback((update: Partial<{
    gameState: GameState;
    players: Player[];
    pieces: Piece[];
    boardTiles: BoardTile[];
    currentPlayerIndex: number;
  }>) => {
    if (!socket || !roomId) return;

    console.warn('[MULTIPLAYER] broadcastState is deprecated - use specific action methods instead');
    // This function is kept for backward compatibility but should not be used
    // Use multiplayerActions from useMultiplayerActions hook instead
  }, [socket, roomId]);

  // Listen for state updates from server
  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (data: { gameState: any }) => {
      const update = data.gameState;
      
      if (update.players) {
        console.log('[MULTIPLAYER] State update - Player hands:', update.players.map((p, i) => ({
          p: i,
          hand: p.hand?.length ?? 0,
          kept: p.keptTiles?.length ?? 0
        })));
        setPlayers(update.players);
      }
      
      if (update.currentPlayerIndex !== undefined) {
        setCurrentPlayerIndex(update.currentPlayerIndex);
      }
      
      if (update.playerCount !== undefined && setPlayerCount) {
        setPlayerCount(update.playerCount);
      }
      
      if (update.phase !== undefined) {
        console.log('[MULTIPLAYER] Phase transition:', gameState, '→', update.phase);
        setGameState(update.phase);
      } else if (update.gameState !== undefined) {
        console.log('[MULTIPLAYER] Phase transition:', gameState, '→', update.gameState);
        setGameState(update.gameState);
      }
      
      if (update.pieces !== undefined) {
        setPieces(update.pieces);
      }
      if (update.boardTiles !== undefined) {
        setBoardTiles(update.boardTiles);
      }
      if (update.playerIndex !== undefined && typeof setPlayerIndex === 'function') {
        setPlayerIndex(update.playerIndex);
      }
      if (update.playedTile !== undefined && typeof setPlayedTile === 'function') {
        console.log('[MULTIPLAYER] Syncing playedTile:', update.playedTile);
        setPlayedTile(update.playedTile);
      }
    };

    const handlePhaseChange = (data: { newPhase: GameState; currentPlayer: number }) => {
      console.log('[MULTIPLAYER] Phase changed:', data);
      setGameState(data.newPhase);
      setCurrentPlayerIndex(data.currentPlayer);
    };

    const handlePlayerJoined = (data: { playerId: string; playerIndex: number; playerName: string }) => {
      console.log('[MULTIPLAYER] Player joined:', data);
      // State will be updated via game:stateUpdate
    };

    const handlePlayerDisconnected = (data: { playerId: string; playerIndex: number }) => {
      console.log('[MULTIPLAYER] Player disconnected:', data);
      // Could show notification to user
    };

    const handlePlayerReconnected = (data: { playerId: string; playerIndex: number }) => {
      console.log('[MULTIPLAYER] Player reconnected:', data);
      // Could show notification to user
    };

    const handleError = (data: { code: string; message: string }) => {
      console.error('[MULTIPLAYER] Error from server:', data);
      alert(`Game error: ${data.message}`);
    };

    // Register event listeners
    socket.on('kred:stateUpdate', handleStateUpdate);

    // Also listen for initial state via custom window event
    const handleInitialState = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleStateUpdate(customEvent.detail);
    };
    window.addEventListener('kred:initialState', handleInitialState);

    return () => {
      socket.off('kred:stateUpdate', handleStateUpdate);
      window.removeEventListener('kred:initialState', handleInitialState);
    };
  }, [socket, setGameState, setPlayers, setPieces, setBoardTiles, setCurrentPlayerIndex]);

  return {
    isMultiplayer,
    isMyTurn,
    broadcastState // Deprecated - kept for compatibility
  };
}
