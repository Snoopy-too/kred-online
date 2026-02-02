import { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { useMultiplayerActions } from './hooks/useMultiplayerActions';
import App from '../App';

function MultiplayerGame() {
  const { socket, roomId, playerId, playerIndex } = useSocket();
  const multiplayerActions = useMultiplayerActions();
  const [multiplayerData, setMultiplayerData] = useState<{
    roomId: string;
    playerId: string;
    playerIndex: number;
    playerCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('multiplayerSession');
    console.log('[MULTIPLAYER] Stored session:', stored);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.roomId && data.playerId !== undefined && data.playerIndex !== undefined && data.playerCount) {
          setMultiplayerData(data);
          // SocketContext handles rejoining automatically - don't duplicate here
        } else {
          console.error('[MULTIPLAYER] Invalid session data:', data);
          setError('Invalid multiplayer session. Please return to lobby.');
        }
      } catch (e) {
        console.error('[MULTIPLAYER] Failed to parse session:', e);
        setError('Failed to load multiplayer session. Please return to lobby.');
      }
    } else {
      setError('No multiplayer session found. Please return to lobby.');
    }
  }, [socket]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem'
      }}>
        <h2>{error}</h2>
        <button
          onClick={() => window.location.href = '/lobby'}
          style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            fontSize: '1.2em',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  if (!multiplayerData) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        Loading multiplayer data...
      </div>
    );
  }

  return (
    <App
      socket={socket}
      roomId={multiplayerData.roomId}
      playerId={multiplayerData.playerId}
      playerIndex={multiplayerData.playerIndex}
      playerCount={multiplayerData.playerCount}
      multiplayerActions={multiplayerActions}
    />
  );
}

export function AppWithMultiplayer() {
  // Always multiplayer mode
  return (
    <SocketProvider>
      <MultiplayerGame />
    </SocketProvider>
  );
}
