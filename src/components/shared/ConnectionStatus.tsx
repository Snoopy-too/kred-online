/**
 * Connection Status Component
 * Displays multiplayer connection status and player info
 */

import React from 'react';
import type { Player } from '../../types';

interface ConnectionStatusProps {
  isConnected: boolean;
  roomId?: string;
  playerIndex?: number;
  players: Player[];
  currentPlayerIndex: number;
}

export function ConnectionStatus({
  isConnected,
  roomId,
  playerIndex,
  players,
  currentPlayerIndex,
}: ConnectionStatusProps) {
  if (!roomId) return null;

  const currentPlayer = players[playerIndex ?? 0];
  const activePlayer = players[currentPlayerIndex];

  return (
    <div
      style={{
        background: isConnected
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? '#4ade80' : '#ef4444',
            boxShadow: isConnected ? '0 0 10px #4ade80' : '0 0 10px #ef4444',
          }}
        />
        <span style={{ fontWeight: 'bold' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        <div>Room: {roomId}</div>
        <div>You: {currentPlayer?.name || `Player ${(playerIndex ?? 0) + 1}`}</div>
        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          Current Turn: {activePlayer?.name || `Player ${currentPlayerIndex + 1}`}
        </div>
      </div>

      <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
        Players: {players.filter(p => p).length}/{players.length}
      </div>
    </div>
  );
}

export default ConnectionStatus;
