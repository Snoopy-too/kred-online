import React from 'react';
import { getAssetUrl } from '../../utils/assets.js';

export function BoardHeaderControls({
  currentPhase,
  ctx,
  playerID,
  getPlayerLabel,
  isOnline,
  setShowSaveLoadModal
}) {
  return (
    <header className="kred-header">
      <div className="logo-brand">
        <img src={getAssetUrl('images/logo.png')} alt="KRED" className="logo-img" />
        <div className="brand-text">
          <span className="subtitle">Deception & Strategy</span>
        </div>
      </div>

      <div className="header-controls">
        <div className="status-badge phase-badge">Phase: <strong>{currentPhase.toUpperCase()}</strong></div>
        <div className="status-badge turn-badge">Current Turn: <strong>{getPlayerLabel(ctx.currentPlayer)}</strong></div>
        {!isOnline && (
          <div className="status-badge perspective-badge">Viewing As: <strong>{getPlayerLabel(playerID)}</strong></div>
        )}
        {!isOnline && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', background: '#26201b', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }}
            onClick={() => setShowSaveLoadModal(true)}
            title="Save & Load local testing game state snapshots"
          >
            💾 Save/Load State
          </button>
        )}
      </div>
    </header>
  );
}
