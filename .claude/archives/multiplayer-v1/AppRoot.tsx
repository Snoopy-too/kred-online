// Multiplayer-enabled App wrapper
import { useEffect, useState, useRef } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { useMultiplayerActions } from './hooks/useMultiplayerActions';
import App from './App';
import type { GameState, Player, Piece } from '@kred/shared';

/**
 * Wrapper component that enables multiplayer mode
 */
function MultiplayerApp() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasReceivedState = useRef(false);

  const { socket, connected, roomId, playerId, playerIndex } = useSocket();

  // Listen for initial state from server
  useEffect(() => {
    const handleInitialState = (event: CustomEvent) => {
      // Only process the FIRST state update to avoid race conditions
      if (hasReceivedState.current) {
        console.log('[APPROOT] Ignoring duplicate state update - already have state');
        return;
      }
      
      const { gameState: initialGameState } = event.detail;
      
      if (!initialGameState) {
        console.error('[APPROOT] No gameState in event detail');
        return;
      }
      
      if (!initialGameState.players) {
        console.error('[APPROOT] No players array in gameState');
        return;
      }
      
      if (initialGameState.players.length === 0) {
        console.error('[APPROOT] Players array is empty');
        return;
      }
      
      // Valid state received - set the flag FIRST to prevent any race conditions
      hasReceivedState.current = true;
      console.log('[APPROOT] Setting hasReceivedState flag to true');
      
      // Server sends 'phase' not 'gameState'
      setGameState(initialGameState.phase || 'DRAFTING');
      setPlayers(initialGameState.players);
      setPieces(initialGameState.pieces || []);
      setCurrentPlayerIndex(initialGameState.currentPlayerIndex || 0);
      
      console.log('[APPROOT] State set successfully:', {
        phase: initialGameState.phase,
        playersCount: initialGameState.players.length,
        piecesCount: initialGameState.pieces?.length || 0,
        currentPlayerIndex: initialGameState.currentPlayerIndex
      });
      
      // Debug: Show what each player has
      initialGameState.players.forEach((player: any, idx: number) => {
        console.log(`[APPROOT] Player ${idx} (${player.name}):`, {
          handCount: player.hand?.length || 0,
          handIds: player.hand?.map((t: any) => t.id).join(', ') || 'empty',
          keptCount: player.keptTiles?.length || 0
        });
      });
      
      setIsLoading(false);
    };

    window.addEventListener('kred:initialState', handleInitialState as EventListener);

    const timeout = setTimeout(() => {
      if (isLoading) {
        setGameState('DRAFTING');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('kred:initialState', handleInitialState as EventListener);
      clearTimeout(timeout);
    };
  }, [isLoading]);

  // Note: Socket sync is handled by useMultiplayerSync in App.tsx
  // No need for duplicate listeners here

  // Get multiplayer actions
  const multiplayerActions = useMultiplayerActions();

  // Show loading screen while waiting for initial state
  if (isLoading || !gameState) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5em'
      }}>
        {connected ? 'Loading game state...' : 'Connecting to server...'}
      </div>
    );
  }

  // Pass multiplayer props to App
  return (
    <App
      // Multiplayer connection info
      socket={socket}
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
