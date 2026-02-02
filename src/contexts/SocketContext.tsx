import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface MultiplayerSession {
  roomId: string;
  playerId: string;
  playerIndex: number;
  playerCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  roomId: string | null;
  playerId: string | null;
  playerIndex: number | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  roomId: null,
  playerId: null,
  playerIndex: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasRejoined = useRef(false);

  useEffect(() => {
    // Read multiplayer session from sessionStorage
    const sessionData = sessionStorage.getItem('multiplayerSession');
    
    if (!sessionData) {
      console.warn('[SOCKET] No multiplayer session found - redirecting to lobby');
      window.location.href = '/lobby';
      return;
    }

    const session: MultiplayerSession = JSON.parse(sessionData);
    console.log('[SOCKET] Multiplayer session loaded:', session);

    setRoomId(session.roomId);
    setPlayerId(session.playerId);
    setPlayerIndex(session.playerIndex);

    // Create socket with playerId authentication
    const socket = io({
      auth: {
        playerId: session.playerId
      }
    });

    socketRef.current = socket;

    // Connection event handlers
    // Listen for game started broadcast (sent to all players simultaneously)
    socket.on('kred:game:started', (data: any) => {
      if (data.initialGameState) {
        window.dispatchEvent(new CustomEvent('kred:initialState', { 
          detail: { gameState: data.initialGameState } 
        }));
      }
    });

    socket.on('connect', () => {
      setConnected(true);

      // Auto-rejoin rooms on connection
      if (!hasRejoined.current) {
        socket.emit('room:rejoin', {
          roomId: session.roomId,
          playerId: session.playerId
        });
        hasRejoined.current = true;

        // Request current game state (for players joining mid-game or after refresh)
        socket.emit('kred:request:state', { roomId: session.roomId }, (response: any) => {
          if (response.success && response.initialGameState) {
            window.dispatchEvent(new CustomEvent('kred:initialState', { 
              detail: { gameState: response.initialGameState } 
            }));
          }
        });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      hasRejoined.current = false;
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('[SOCKET] Cleaning up socket connection');
      socket.off('kred:game:started');
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        roomId,
        playerId,
        playerIndex,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  return useContext(SocketContext);
}
