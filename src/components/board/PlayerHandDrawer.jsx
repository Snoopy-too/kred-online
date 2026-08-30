import React from 'react';
import { getTileImageUrl } from '../../utils/assets.js';

export function PlayerHandDrawer({ myPlayer, selectedTileId, onSelectTile, disabled = false }) {
  const hand = (myPlayer && myPlayer.hand) || [];

  return (
    <div className="player-hand-sidebar-card">
      <div className="hand-card-header">
        <h3>Your Hand</h3>
      </div>

      <div className="hand-tiles-grid">
        {hand.length > 0 ? (
          hand.map((tileId, idx) => {
            const isSelected = selectedTileId === tileId;
            return (
              <div
                key={`${tileId}-${idx}`}
                className={`sidebar-hand-tile ${isSelected ? 'tile-selected' : ''} ${disabled ? 'tile-disabled' : ''}`}
                onClick={() => {
                  if (!disabled && onSelectTile) {
                    onSelectTile(tileId);
                  }
                }}
                title={tileId === 'BLANK' ? 'Click to play Blank Tile' : tileId === 'HIDDEN' ? 'Opponent Tile' : `Click to play Tile ${tileId}`}
              >
                {tileId === 'HIDDEN' ? (
                  <img src={getTileImageUrl(null)} alt="Opponent Tile" className="hand-tile-img" />
                ) : (
                  <img src={getTileImageUrl(tileId)} alt={tileId === 'BLANK' ? '' : `Tile ${tileId}`} className="hand-tile-img" />
                )}
                {isSelected && (
                  <div className="tile-selected-badge-under">
                    <span>Tile Selected</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="status-muted">No tiles remaining in hand.</p>
        )}
      </div>
    </div>
  );
}

