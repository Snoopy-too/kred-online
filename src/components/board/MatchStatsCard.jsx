import React from 'react';

export function MatchStatsCard({ G, getPlayerLabel }) {
  const playerIds = Object.keys(G?.players || {}).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const statsByPlayer = G?.matchStats || {};

  const maxBureaucracies = playerIds.reduce((max, id) => {
    const arr = statsByPlayer[id]?.bureaucracyFunding || [];
    return Math.max(max, arr.length);
  }, 0);

  const rows = [
    { label: 'Whistles Blown', getValue: (s) => s.whistlesBlown || 0 },
    { label: 'Challenges Made', getValue: (s) => s.challengesMade || 0 },
    { label: 'Tiles Played to Self', getValue: (s) => s.tilesPlayedToSelf || 0 },
    ...(maxBureaucracies > 0
      ? Array.from({ length: maxBureaucracies }).map((_, idx) => ({
          label: `Bureaucracy ${idx + 1} Funding`,
          getValue: (s) => {
            const val = s.bureaucracyFunding?.[idx];
            return val !== undefined ? `K${val}` : '—';
          }
        }))
      : [{ label: 'Bureaucracy Funding', getValue: () => '—' }])
  ];

  const cellStyle = {
    padding: '6px 6px',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '12px',
    textAlign: 'center'
  };

  return (
    <div className="turn-builder-card">
      <div className="turn-card-header">
        <h3>Match Stats</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Stat</th>
              {playerIds.map((id) => {
                const isWinner = String(G?.winner) === String(id);
                return (
                  <th
                    key={id}
                    style={{
                      ...cellStyle,
                      color: isWinner ? 'var(--accent-gold)' : 'var(--text-main)',
                      fontWeight: 700
                    }}
                  >
                    {getPlayerLabel ? getPlayerLabel(id) : `P${parseInt(id, 10) + 1}`}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={{ ...cellStyle, textAlign: 'left', color: 'var(--text-muted)' }}>
                  {row.label}
                </td>
                {playerIds.map((id) => {
                  const s = statsByPlayer[id] || {};
                  const isWinner = String(G?.winner) === String(id);
                  return (
                    <td
                      key={id}
                      style={{
                        ...cellStyle,
                        fontWeight: 600,
                        color: isWinner ? 'var(--accent-gold)' : 'var(--text-main)'
                      }}
                    >
                      {row.getValue(s)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
