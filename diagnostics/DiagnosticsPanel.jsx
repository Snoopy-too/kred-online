import React, { useState, useEffect } from 'react';
import { AdminModal } from '../src/components/board/AdminModal.jsx';

export function DiagnosticsPanel({ gameLogger, isOpen, onClose }) {
  const [logPayload, setLogPayload] = useState(() => (gameLogger ? gameLogger.getLogPayload() : { events: [] }));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!gameLogger) return;
    setLogPayload(gameLogger.getLogPayload());
    return gameLogger.subscribe((updated) => setLogPayload(updated));
  }, [gameLogger]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(logPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Diagnostics Log (${logPayload.events?.length || 0} Events)`}
      headerActions={
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: '4px 10px', fontSize: '12px' }}
          onClick={handleCopyJson}
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      }
    >
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Match: <strong>{logPayload.matchID}</strong> ({logPayload.numPlayers}P)
        </div>

        {(logPayload.events || []).length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No events recorded yet.</p>
        ) : (
          [...logPayload.events].reverse().map((evt) => (
            <div
              key={evt.seq}
              style={{
                background: 'rgba(38, 31, 26, 0.85)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>#{evt.seq}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{evt.actionType}</span>
                {evt.playerID !== undefined && (
                  <span style={{ color: '#f87171', fontWeight: 700 }}>P{evt.playerID}</span>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '11px' }}>
                  {evt.phase} · Turn {evt.turn} · {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {evt.details && Object.keys(evt.details).length > 0 && (
                <pre style={{
                  margin: '6px 0 0',
                  padding: '8px',
                  background: '#120e0c',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#d6c3af',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(evt.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </AdminModal>
  );
}
