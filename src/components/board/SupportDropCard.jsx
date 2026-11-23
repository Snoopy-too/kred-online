import React from 'react';
import { formatSupportSpot } from '../../domain/supportRule.js';

export function SupportDropCard({ G, playerID, moves, getPlayerLabel }) {
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
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.45 }}>
            Your piece in <strong>{fromLabel}</strong> has no piece in{' '}
            {isOffice ? 'either rostrum' : 'any supporting seat'} to support it.
            Click a highlighted {isOffice ? 'rostrum' : 'seat'} on the board or choose below:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(ps.validDestinations || []).map((loc) => (
              <button
                key={loc}
                type="button"
                className="btn btn-warning"
                style={{ flex: 1, minWidth: '88px', padding: '7px 10px', fontSize: '12px' }}
                onClick={() => moves?.resolveSupportDrop?.(loc)}
              >
                {formatSupportSpot(loc)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
          Waiting for {ownerName} to move an unsupported piece...
        </div>
      )}
    </div>
  );
}
