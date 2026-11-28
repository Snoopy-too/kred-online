import React from 'react';
import { formatSupportSpot } from '../../domain/supportRule.js';

export function SupportDropCard({ G, playerID, getPlayerLabel }) {
  const ps = G?.pendingSupport;
  if (!ps) return null;

  const isOwnerMe = String(ps.ownerId) === String(playerID);
  const fromLabel = formatSupportSpot(ps.from);
  const isOffice = ps.from.endsWith('_office');
  const ownerName = getPlayerLabel ? getPlayerLabel(ps.ownerId) : `Player ${parseInt(ps.ownerId, 10) + 1}`;

  return (
    <div className="turn-builder-card campaign-action-panel">
      <div className="turn-card-header">
        <h3 style={{ color: '#f59e0b' }}>Unsupported Piece</h3>
      </div>

      {isOwnerMe ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.45 }}>
            Your piece in <strong>{fromLabel}</strong> has no piece in{' '}
            {isOffice ? 'either rostrum' : 'any supporting seat'} to support it. Click {G.expertMode ? 'an open' : 'a highlighted'} {isOffice ? 'rostrum' : 'seat'} on the board.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
          Waiting for {ownerName} to move an unsupported piece...
        </div>
      )}
    </div>
  );
}
