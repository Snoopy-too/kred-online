/**
 * Multiplayer Synchronization Hook
 * 
 * Syncs game state across all players via socket.io
 * Uses new server architecture with game:* events
 */

import { useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { Player, Piece, BoardTile, GameState, PlayedTileState } from '../types';
import { TILE_SPACES_BY_PLAYER_COUNT, BANK_SPACES_BY_PLAYER_COUNT } from '../config';

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
  setBoardTiles: (tiles: BoardTile[] | ((prev: BoardTile[]) => BoardTile[])) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setPlayerIndex?: (index: number) => void;
  setPlayerCount?: (count: number) => void;
  setPlayedTile?: (tile: PlayedTileState | null) => void;
  setBystanders?: (bystanders: Player[]) => void;
  setBystanderIndex?: (index: number) => void;
  // Campaign state setters
  setHasPlayedTileThisTurn?: (val: boolean) => void;
  setMovedPiecesThisTurn?: (val: Set<string>) => void;
  setTileTransaction?: (val: any) => void;
  setMoverPlayerIndex?: (val: number | null) => void;
  setCampaignRole?: (val: string | null) => void;
  setPiecesAtTurnStart?: (val: Piece[]) => void;
  // Take Advantage (challenger reward) sync
  setShowTakeAdvantageModal?: (val: boolean) => void;
  setTakeAdvantageChallengerId?: (val: number | null) => void;
  setTakeAdvantageChallengerCredibility?: (val: number) => void;
  // Banked tiles sync
  setBankedTiles?: (val: any[] | ((prev: any[]) => any[])) => void;
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
    setPlayedTile,
    setBystanders,
    setBystanderIndex,
    setHasPlayedTileThisTurn,
    setMovedPiecesThisTurn,
    setTileTransaction,
    setMoverPlayerIndex,
    setCampaignRole,
    setPiecesAtTurnStart,
    setShowTakeAdvantageModal,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    setBankedTiles,
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
        console.log('[MULTIPLAYER] State update - Player hands:', update.players.map((p: any, i: number) => ({
          p: i,
          hand: p.hand?.length ?? 0,
          kept: p.keptTiles?.length ?? 0
        })));
        setPlayers(update.players);
        
        // Rebuild banked tiles from players' bureaucracyTiles
        if (typeof setBankedTiles === 'function') {
          const pc = update.playerCount || update.players.length;
          const allBankSpaces = BANK_SPACES_BY_PLAYER_COUNT[pc] || [];
          const banked: any[] = [];
          
          for (const player of update.players) {
            if (!player.bureaucracyTiles || player.bureaucracyTiles.length === 0) continue;
            const playerSpaces = allBankSpaces.filter((s: any) => s.ownerId === player.id);
            
            player.bureaucracyTiles.forEach((tile: any, idx: number) => {
              if (idx < playerSpaces.length) {
                const space = playerSpaces[idx];
                banked.push({
                  id: `bank_${player.id}_${idx}`,
                  tile: tile,
                  position: space.position,
                  rotation: space.rotation,
                  placerId: 0, // Unknown in multiplayer context
                  ownerId: player.id,
                  faceUp: false, // Default face-down (accepted tiles)
                });
              }
            });
          }
          
          setBankedTiles(banked);
          console.log('[MULTIPLAYER] Rebuilt banked tiles:', banked.length);
        }
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
        
        // Derive boardTile from playedTile for visual display
        if (update.playedTile && update.playedTile.tile && update.playedTile.receivingPlayerId) {
          const playerCount = update.playerCount || update.players?.length || 0;
          const tileSpaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
          const targetSpace = tileSpaces.find(s => s.ownerId === update.playedTile.receivingPlayerId);
          if (targetSpace) {
            const boardTileId = `mp_boardtile_${update.playedTile.tileId}`;
            const newBoardTile: BoardTile = {
              id: boardTileId,
              tile: update.playedTile.tile,
              position: targetSpace.position,
              rotation: targetSpace.rotation,
              placerId: update.playedTile.playerId,
              ownerId: update.playedTile.receivingPlayerId,
            };
            // Replace any existing mp_boardtile entries, then add this one
            setBoardTiles((prev: BoardTile[]) => [
              ...prev.filter((bt: BoardTile) => !bt.id.startsWith('mp_boardtile_')),
              newBoardTile,
            ]);
            console.log('[MULTIPLAYER] Created boardTile for played tile:', boardTileId);
          }
        } else if (update.playedTile === null) {
          // Tile finalized — remove the visual board tile
          setBoardTiles((prev: BoardTile[]) => prev.filter((bt: BoardTile) => !bt.id.startsWith('mp_boardtile_')));
          console.log('[MULTIPLAYER] Removed boardTile (tile finalized)');
        }
      }
      if (update.bystanders !== undefined && typeof setBystanders === 'function') {
        console.log('[MULTIPLAYER] Syncing bystanders:', update.bystanders.length);
        setBystanders(update.bystanders);
      }
      if (update.bystanderIndex !== undefined && typeof setBystanderIndex === 'function') {
        console.log('[MULTIPLAYER] Syncing bystanderIndex:', update.bystanderIndex);
        setBystanderIndex(update.bystanderIndex);
      }
      // Campaign state sync
      if (update.hasPlayedTileThisTurn !== undefined && typeof setHasPlayedTileThisTurn === 'function') {
        setHasPlayedTileThisTurn(update.hasPlayedTileThisTurn);
      }
      if (update.movedPiecesThisTurn !== undefined && typeof setMovedPiecesThisTurn === 'function') {
        setMovedPiecesThisTurn(new Set(update.movedPiecesThisTurn));
      }
      if (update.tileTransaction !== undefined && typeof setTileTransaction === 'function') {
        setTileTransaction(update.tileTransaction);
      }
      if (update.moverPlayerIndex !== undefined && typeof setMoverPlayerIndex === 'function') {
        setMoverPlayerIndex(update.moverPlayerIndex);
      }
      if (update.campaignRole !== undefined && typeof setCampaignRole === 'function') {
        setCampaignRole(update.campaignRole);
      }
      // Challenger reward modal sync
      if (update.pendingChallengerReward && update.challengerId !== undefined) {
        // Find the challenger player to get their credibility
        const challengerPlayer = update.players?.find((p: any) => p.id === update.challengerId);
        if (typeof setTakeAdvantageChallengerId === 'function') {
          setTakeAdvantageChallengerId(update.challengerId);
        }
        if (typeof setTakeAdvantageChallengerCredibility === 'function') {
          setTakeAdvantageChallengerCredibility(challengerPlayer?.credibility ?? 0);
        }
        if (typeof setShowTakeAdvantageModal === 'function') {
          setShowTakeAdvantageModal(true);
        }
        console.log('[MULTIPLAYER] Challenger reward pending for player', update.challengerId);
      } else if (update.pendingChallengerReward === false) {
        // Reward was processed, clean up modal
        if (typeof setShowTakeAdvantageModal === 'function') {
          setShowTakeAdvantageModal(false);
        }
        if (typeof setTakeAdvantageChallengerId === 'function') {
          setTakeAdvantageChallengerId(null);
        }
        if (typeof setTakeAdvantageChallengerCredibility === 'function') {
          setTakeAdvantageChallengerCredibility(0);
        }
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

    // Campaign phase decision handlers
    const handleReceiverDecision = (data: { accepted: boolean }) => {
      console.log('[MULTIPLAYER] Receiver decision:', data.accepted ? 'ACCEPT' : 'REJECT');
      // State will be updated via game:stateUpdate
    };

    const handleChallengerDecision = (data: { challenge: boolean }) => {
      console.log('[MULTIPLAYER] Challenger decision:', data.challenge ? 'CHALLENGE' : 'PASS');
      // State will be updated via game:stateUpdate
    };

    const handleBonusMoveComplete = () => {
      console.log('[MULTIPLAYER] Bonus move completed');
      // State will be updated via game:stateUpdate
    };

    const handleCorrectionComplete = () => {
      console.log('[MULTIPLAYER] Correction completed');
      // State will be updated via game:stateUpdate
    };

    // Register event listeners
    socket.on('kred:stateUpdate', handleStateUpdate);
    socket.on('kred:campaign:receiverDecision', handleReceiverDecision);
    socket.on('kred:campaign:challengerDecision', handleChallengerDecision);
    socket.on('kred:campaign:bonusMoveComplete', handleBonusMoveComplete);
    socket.on('kred:campaign:correctionComplete', handleCorrectionComplete);

    // Also listen for initial state via custom window event
    const handleInitialState = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleStateUpdate(customEvent.detail);
    };
    window.addEventListener('kred:initialState', handleInitialState);

    return () => {
      socket.off('kred:stateUpdate', handleStateUpdate);
      socket.off('kred:campaign:receiverDecision', handleReceiverDecision);
      socket.off('kred:campaign:challengerDecision', handleChallengerDecision);
      socket.off('kred:campaign:bonusMoveComplete', handleBonusMoveComplete);
      socket.off('kred:campaign:correctionComplete', handleCorrectionComplete);
      window.removeEventListener('kred:initialState', handleInitialState);
    };
  }, [socket, setGameState, setPlayers, setPieces, setBoardTiles, setCurrentPlayerIndex]);

  return {
    isMultiplayer,
    isMyTurn,
    broadcastState // Deprecated - kept for compatibility
  };
}
