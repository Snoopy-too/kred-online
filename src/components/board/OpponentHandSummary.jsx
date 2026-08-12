import React from 'react';

export function OpponentHandSummary({ G, playerID, numPlayers, getPlayerLabel }) {
  if (!G || !G.players) return null;

  const opponentIds = Object.keys(G.players)
    .filter(pId => String(pId) !== String(playerID))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return (
    <div className="opponent-hand-sidebar-card">
      <div className="hand-card-header" style={{ marginBottom: '8px' }}>
        <h3>Opponent Hands</h3>
      </div>

      <div className="opponent-rows-container">
        {opponentIds.map(opId => {
          const hand = G.players[opId]?.hand || [];
          const count = hand.length;
          const label = getPlayerLabel ? getPlayerLabel(opId) : `Player ${parseInt(opId, 10) + 1}`;

          return (
            <div key={opId} className="opponent-hand-row">
              <span className="opponent-hand-label">{label}</span>
              <div className="mini-tiles-flex">
                {count > 0 ? (
                  Array.from({ length: count }).map((_, idx) => (
                    <div
                      key={idx}
                      className="mini-white-hand-tile"
                      title={`${label}: Tile ${idx + 1}`}
                    />
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
  );
}
