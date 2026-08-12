import React from 'react';
import { TILES } from '../../domain/types.js';

export function PlayerStatusHeader({ G, ctx, playerID, numPlayers, isMyTurn, getPlayerLabel: propGetPlayerLabel }) {
  const getPlayerLabel = propGetPlayerLabel || ((pIdx) => `Player ${parseInt(pIdx, 10) + 1}`);

  return (
    <div className="player-status-header">
      <div className="current-turn-indicator">
        {isMyTurn ? (
          <span className="badge badge-success">IT'S YOUR TURN!</span>
        ) : (
          <span className="badge badge-secondary">
            Waiting for {getPlayerLabel(ctx.currentPlayer)}...
          </span>
        )}
        <span className="phase-tag">Phase: {ctx.phase || 'draft'}</span>
      </div>

      <div className="players-overview-grid">
        {Array.from({ length: numPlayers }).map((_, pIdx) => {
          const pId = String(pIdx);
          const pData = G.players[pId] || {};
          const isCurrent = String(ctx.currentPlayer) === pId;
          const isYou = String(playerID) === pId;
          const notches = pData.credibilityNotchesLost || 0;

          return (
            <div
              key={pId}
              className={`player-summary-card ${isCurrent ? 'active-player' : ''} ${isYou ? 'you-card' : ''}`}
            >
              <div className="player-card-header">
                <strong>{getPlayerLabel(pId)}</strong> {isYou && '(You)'}
              </div>
                <div className="credibility-meter">
                <span className="label">Credibility:</span>
                <div className="notches-row">
                  {[0, 1, 2].map((idx) => (
                    <span
                      key={idx}
                      className={`notch ${idx < notches ? 'lost' : 'active'}`}
                      title={idx < notches ? 'Notch Lost' : 'Notch Retained'}
                    />
                  ))}
                </div>
              </div>
              <div className="bank-tiles-summary">
                <span className="label">Bank:</span> {pData.bank ? pData.bank.length : 0} tiles
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
