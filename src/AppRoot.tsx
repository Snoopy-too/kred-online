// Multiplayer-enabled App wrapper
import { useEffect, useState } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { useGameSync } from './hooks/useGameSync';
import { useMultiplayerActions } from './hooks/useMultiplayerActions';
import App from './App';
import ConnectionStatus from './components/shared/ConnectionStatus';
import type { GameState, Player, Piece } from '@kred/shared';

/**
 * Wrapper component that enables multiplayer mode
 */
function MultiplayerApp() {
  const [gameState, setGameState] = useState<GameState>('PLAYER_SELECTION');
  const [players, setPlayers] = useState<Player[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const { connected, roomId, playerId, playerIndex } = useSocket();

  // Handle phase changes
  const handlePhaseChange = (newPhase: GameState, currentPlayer: number) => {
    console.log(`[MULTIPLAYER] Phase changed to ${newPhase}, current player: ${currentPlayer}`);
  };

  // Handle player joined
  const handlePlayerJoined = (playerId: string, playerIndex: number, playerName: string) => {
    console.log(`[MULTIPLAYER] ${playerName} joined as player ${playerIndex}`);
  };

  // Handle player disconnected
  const handlePlayerDisconnected = (playerId: string, playerIndex: number) => {
    console.log(`[MULTIPLAYER] Player ${playerIndex} disconnected`);
  };

  // Handle errors
  const handleError = (error: { code: string; message: string }) => {
    console.error('[MULTIPLAYER] Error:', error);
    alert(`Game error: ${error.message}`);
  };

  // Sync with server
  useGameSync({
    setGameState,
    setPlayers,
    setPieces,
    setCurrentPlayerIndex,
    onPhaseChange: handlePhaseChange,
    onPlayerJoined: handlePlayerJoined,
    onPlayerDisconnected: handlePlayerDisconnected,
    onError: handleError,
  });

  // Get multiplayer actions
  const multiplayerActions = useMultiplayerActions();

  // Pass multiplayer props to App
  return (
    <>
      <ConnectionStatus
        isConnected={connected}
        roomId={roomId || undefined}
        playerIndex={playerIndex ?? undefined}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
      />
      <App
        // Multiplayer connection info
        socket={undefined}
        roomId={roomId || undefined}
        playerId={playerId || undefined}
        playerIndex={playerIndex ?? undefined}

        // Multiplayer actions (replaces direct socket.emit calls)
        multiplayerActions={multiplayerActions}

        // Initial state from server
        initialGameState={gameState}
        initialPlayers={players}
        initialPieces={pieces}
        initialCurrentPlayerIndex={currentPlayerIndex}
      />
    </>
  );
}

/**
 * Root component that conditionally enables multiplayer
 */
export default function AppRoot() {
  const [multiplayerMode, setMultiplayerMode] = useState(false);

  // Check sessionStorage for multiplayer session
  useEffect(() => {
    const sessionData = sessionStorage.getItem('multiplayerSession');
    
    if (sessionData) {
      console.log('[APPROOT] Multiplayer session detected');
      setMultiplayerMode(true);
    } else {
      console.log('[APPROOT] No multiplayer session - using single-player mode');
      setMultiplayerMode(false);
    }
  }, []);

  // If multiplayer mode, wrap with SocketProvider
  if (multiplayerMode) {
    return (
      <SocketProvider>
        <MultiplayerApp />
      </SocketProvider>
    );
  }

  // Otherwise, use original single-player App
  return <App />;
}
