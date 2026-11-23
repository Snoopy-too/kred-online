import React from 'react';
import { getTileImageUrl } from '../../utils/assets.js';

export function HandsPanel({
  G,
  myPlayer,
  playerID,
  selectedTileId,
  onSelectTile,
  disabled = false,
  getPlayerLabel,
  isSolo = false,
  botIds = []
}) {
  const hand = (myPlayer && myPlayer.hand) || [];
  const botSet = new Set(botIds.map(String));
  const opponentIds = Object.keys(G?.players || {})
    .filter((pId) => String(pId) !== String(playerID))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

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
                <img
                  src={getTileImageUrl(tileId === 'HIDDEN' ? null : tileId)}
                  alt={tileId === 'BLANK' ? '' : tileId === 'HIDDEN' ? 'Opponent Tile' : `Tile ${tileId}`}
                  className="hand-tile-img"
                />
                {isSelected && (
                  <div className="tile-selected-badge-under">
                    <span>Tile Selected</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="status-muted" style={{ gridColumn: '1 / -1', whiteSpace: 'nowrap', margin: 0 }}>No tiles in hand.</p>
        )}
      </div>

      {opponentIds.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div className="hand-card-header" style={{ marginBottom: '8px' }}>
            <h3>{isSolo ? 'AI Opponents' : 'Opponents'}</h3>
          </div>
          <div className="opponent-rows-container">
            {opponentIds.map((opId) => {
              const opHand = G.players[opId]?.hand || [];
              const count = opHand.length;
              const label = getPlayerLabel ? getPlayerLabel(opId) : `Player ${parseInt(opId, 10) + 1}`;
              const isBot = isSolo || botSet.has(String(opId));

              return (
                <div key={opId} className="opponent-hand-row">
                  <span className="opponent-hand-label">
                    {label}
                    {isBot && <span className="ai-bot-badge">AI</span>}
                  </span>
                  <div className="mini-tiles-flex">
                    {count > 0 ? (
                      Array.from({ length: count }).map((_, idx) => (
                        <div
                          key={idx}
                          className="mini-white-hand-tile"
                          title={`${label}: Tile ${idx + 1}`}
                        >
                          <img src={getTileImageUrl(null)} alt="Face-Down Tile" />
                        </div>
                      ))
                    ) : (
                      <span className="no-tiles-badge">0 tiles</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
