import React from 'react';
import { getTileImageUrl } from '../../utils/assets.js';

export function HandsPanel({
  G,
  myPlayer,
  playerID,
  currentPhase = 'campaign',
  selectedTileId,
  onSelectTile,
  disabled = false,
  getPlayerLabel,
  isSolo = false,
  botIds = []
}) {
  const hand = (myPlayer && myPlayer.hand) || [];
  const botSet = new Set(botIds.map(String));

  if (currentPhase === 'bureaucracy') {
    const turnOrder = Array.isArray(G?.bureaucracyTurnOrder) && G.bureaucracyTurnOrder.length > 0
      ? G.bureaucracyTurnOrder.map(String)
      : Object.keys(G?.players || {}).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const turnIndex = G?.bureaucracyTurnIndex ?? 0;

    return (
      <div className="player-hand-sidebar-card">
        <div className="hand-card-header" style={{ marginBottom: '8px' }}>
          <h3>Bureaucracy Funding</h3>
        </div>
        <div className="opponent-rows-container">
          {turnOrder.map((pId, idx) => {
            const p = G?.players?.[pId] || {};
            const isMe = String(pId) === String(playerID);
            const isBot = !isMe && (isSolo || botSet.has(String(pId)));
            const label = getPlayerLabel ? getPlayerLabel(pId) : `Player ${parseInt(pId, 10) + 1}`;
            const initialFunding = p.bureaucracyInitialFunding ?? p.funding ?? 0;
            const remainingFunding = p.funding ?? 0;
            const isDone = idx < turnIndex;
            const isActing = idx === turnIndex;

            return (
              <div
                key={pId}
                className="opponent-hand-row"
                style={{
                  opacity: isDone ? 0.72 : 1,
                  borderColor: isActing ? 'rgba(245, 158, 11, 0.55)' : undefined
                }}
                title={remainingFunding !== initialFunding ? `Started with K${initialFunding} (K${remainingFunding} left)` : `Funding: K${initialFunding}`}
              >
                <span className="opponent-hand-label">
                  {label}
                  {isMe && <span style={{ color: 'var(--accent-gold)', fontSize: '10px', fontWeight: 700 }}>(You)</span>}
                  {isBot && <span className="ai-bot-badge">AI</span>}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '12px' }}>
                    K{initialFunding}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      background: isDone
                        ? 'rgba(34, 197, 94, 0.16)'
                        : isActing
                        ? 'rgba(245, 158, 11, 0.18)'
                        : 'rgba(148, 163, 184, 0.12)',
                      color: isDone ? '#4ade80' : isActing ? '#fbbf24' : 'var(--text-muted)',
                      border: `1px solid ${isDone ? 'rgba(34, 197, 94, 0.4)' : isActing ? 'rgba(245, 158, 11, 0.45)' : 'rgba(148, 163, 184, 0.2)'}`
                    }}
                  >
                    {isDone ? '✓ Done' : isActing ? 'Acting' : 'Waiting'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
