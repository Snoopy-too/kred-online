// Hook for synchronizing game state with server
import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { GameState, Player, Piece } from '@kred/shared';

interface UseGameSyncProps {
  setGameState: (state: GameState) => void;
  setPlayers: (players: Player[]) => void;
  setPieces: (pieces: Piece[]) => void;
  setCurrentPlayerIndex: (index: number) => void;
  onPhaseChange?: (newPhase: GameState, currentPlayer: number) => void;
  onPlayerJoined?: (playerId: string, playerIndex: number, playerName: string) => void;
  onPlayerDisconnected?: (playerId: string, playerIndex: number) => void;
  onError?: (error: { code: string; message: string }) => void;
}

/**
 * Hook to synchronize local game state with server state
 */
export function useGameSync(props: UseGameSyncProps) {
  const {
    setGameState,
    setPlayers,
    setPieces,
    setCurrentPlayerIndex,
    onPhaseChange,
    onPlayerJoined,
    onPlayerDisconnected,
    onError,
  } = props;

  const { socket, connected } = useSocket();

  // Listen for state updates from server
  useEffect(() => {
    if (!socket || !connected) return;

    // Full state update
    socket.on('kred:stateUpdate', (data: any) => {
      console.log('Received kred:stateUpdate event with data:', data);
      const { gameState } = data;

      if (gameState.gameState) {
        setGameState(gameState.gameState);
      }

      if (gameState.players) {
        setPlayers(gameState.players);
      }

      if (gameState.pieces) {
        setPieces(gameState.pieces);
      }

      if (gameState.currentPlayerIndex !== undefined) {
        setCurrentPlayerIndex(gameState.currentPlayerIndex);
      }
    });

    // Phase change notification
    socket.on('game:phaseChange', (data: any) => {
      console.log('Phase changed:', data);
      setGameState(data.newPhase);
      setCurrentPlayerIndex(data.currentPlayer);

      if (onPhaseChange) {
        onPhaseChange(data.newPhase, data.currentPlayer);
      }
    });

    // Player joined
    socket.on('player:joined', (data: any) => {
      console.log('Player joined:', data);

      if (onPlayerJoined) {
        onPlayerJoined(data.playerId, data.playerIndex, data.playerName);
      }
    });

    // Player disconnected
    socket.on('player:disconnected', (data: any) => {
      console.log('Player disconnected:', data);

      if (onPlayerDisconnected) {
        onPlayerDisconnected(data.playerId, data.playerIndex);
      }
    });

    // Error handling
    socket.on('error:invalidMove', (data: any) => {
      console.error('Invalid move:', data);

      if (onError) {
        onError(data);
      }
    });

    socket.on('error:notYourTurn', (data: any) => {
      console.error('Not your turn:', data);

      if (onError) {
        onError(data);
      }
    });

    socket.on('error:invalidAction', (data: any) => {
      console.error('Invalid action:', data);

      if (onError) {
        onError(data);
      }
    });

    // Cleanup listeners
    return () => {
      socket.off('kred:stateUpdate');
      socket.off('game:phaseChange');
      socket.off('player:joined');
      socket.off('player:disconnected');
      socket.off('error:invalidMove');
      socket.off('error:notYourTurn');
      socket.off('error:invalidAction');
    };
  }, [
    socket,
    connected,
    setGameState,
    setPlayers,
    setPieces,
    setCurrentPlayerIndex,
    onPhaseChange,
    onPlayerJoined,
    onPlayerDisconnected,
    onError,
  ]);

  // Helper methods for emitting events to server
  const emitAction = useCallback(
    (eventName: string, data?: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!socket || !connected) {
          reject(new Error('Not connected to server'));
          return;
        }

        socket.emit(eventName, data, (response: any) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Action failed'));
          }
        });
      });
    },
    [socket, connected]
  );

  return {
    emitAction,
    connected,
  };
}
