import React, { useState } from 'react';

export function GameLogPanel({
  G,
  getPlayerLabel,
  defaultOpen = false,
  selectedHistoryId = null,
  onSelectHistoryEntry = null
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const label = (id) => (getPlayerLabel ? getPlayerLabel(id) : `Player ${parseInt(id, 10) + 1}`);
  const formatText = (text) => String(text || '').replace(/Player (\d+)/g, (_, id) => label(id));

  const history = Array.isArray(G?.history) ? G.history : [];
  const entries = [...history].reverse();
  const visibleEntries = isOpen ? entries : entries.slice(0, 1);

  const entryStyle = (tone) => {
    if (tone === 'alert') return { color: '#ef4444', fontWeight: 700 };
    if (tone === 'warn') return { color: '#facc15', fontWeight: 700 };
    if (tone === 'accept' || tone === 'win') return { color: '#4ade80', fontWeight: 700 };
    if (tone === 'phase') return { color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' };
    if (tone === 'play') return { color: '#ffffff', fontWeight: 700 };
    return { color: '#e2d6ca', fontWeight: 400 };
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '0.4px'
          }}
        >
          <span>📜 Game Log ({entries.length})</span>
          <span>{isOpen ? '▾ Hide' : '▸ Expand'}</span>
        </button>
        {selectedHistoryId !== null && onSelectHistoryEntry && (
          <button
            type="button"
            onClick={() => onSelectHistoryEntry(null)}
            style={{
              padding: '2px 7px',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '999px',
              border: '1px solid rgba(245, 158, 11, 0.6)',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Back to Live
          </button>
        )}
      </div>

      <div style={{
        maxHeight: isOpen ? '220px' : 'none',
        overflowY: isOpen ? 'auto' : 'visible',
        padding: '6px 12px 9px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '12px'
      }}>
        {visibleEntries.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>Waiting for first action...</span>
        ) : (
          visibleEntries.map((entry, idx) => {
            const canPeek = Boolean((entry.snap || entry.tiles) && onSelectHistoryEntry);
            const isSelected = selectedHistoryId !== null && entry.id === selectedHistoryId;
            return (
              <div
                key={entry.id ?? idx}
                onClick={canPeek ? () => onSelectHistoryEntry(isSelected ? null : entry) : undefined}
                title={canPeek ? (isSelected ? 'Click to return to live board' : 'Click to peek at board state') : undefined}
                style={{
                  lineHeight: 1.35,
                  padding: canPeek ? '2px 5px' : 0,
                  margin: canPeek ? '0 -5px' : 0,
                  borderRadius: '4px',
                  cursor: canPeek ? 'pointer' : 'default',
                  background: isSelected ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                  outline: isSelected ? '1px solid rgba(245, 158, 11, 0.55)' : 'none',
                  ...entryStyle(entry.tone)
                }}
              >
                <span>{formatText(entry.text)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
