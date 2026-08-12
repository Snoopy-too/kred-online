import React, { useState, useEffect } from 'react';

export function StateSaveLoadModal({ G, ctx, moves, isOpen, onClose, onResetTransientState }) {
  const [snapshotName, setSnapshotName] = useState('');
  const [savedSnapshots, setSavedSnapshots] = useState([]);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const QUICK_SAVE_KEY = 'kred_quick_save';
  const SNAPSHOTS_KEY = 'kred_saved_snapshots';

  // Load existing snapshots list on mount
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(SNAPSHOTS_KEY);
      if (stored) {
        setSavedSnapshots(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load snapshots list:', err);
    }
  }, [isOpen]);

  if (!isOpen || !G) return null;

  const createSnapshotObj = (name = '') => {
    return {
      id: Date.now().toString(),
      name: name || `Save ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString(),
      numPlayers: G.numPlayers || ctx?.numPlayers || 3,
      phase: ctx?.phase || 'campaign',
      currentPlayer: ctx?.currentPlayer || '0',
      turn: ctx?.turn || 1,
      G: JSON.parse(JSON.stringify(G))
    };
  };

  const handleQuickSave = () => {
    try {
      const snap = createSnapshotObj('Quick Save');
      localStorage.setItem(QUICK_SAVE_KEY, JSON.stringify(snap));
      setStatusMsg('✓ Quick Save created successfully!');
    } catch (err) {
      setStatusMsg('❌ Quick Save failed: ' + err.message);
    }
  };

  const handleQuickLoad = () => {
    try {
      const stored = localStorage.getItem(QUICK_SAVE_KEY);
      if (!stored) {
        setStatusMsg('⚠️ No Quick Save found in LocalStorage.');
        return;
      }
      const parsed = JSON.parse(stored);
      if (onResetTransientState) onResetTransientState();
      moves.loadSaveState(parsed);
      setStatusMsg('✓ Quick Save loaded!');
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setStatusMsg('❌ Failed to load Quick Save: ' + err.message);
    }
  };

  const handleSaveNamedSnapshot = () => {
    if (!snapshotName.trim()) {
      setStatusMsg('⚠️ Please enter a name for the snapshot.');
      return;
    }
    try {
      const snap = createSnapshotObj(snapshotName.trim());
      const updated = [snap, ...savedSnapshots];
      setSavedSnapshots(updated);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      setSnapshotName('');
      setStatusMsg(`✓ Snapshot "${snap.name}" saved!`);
    } catch (err) {
      setStatusMsg('❌ Failed to save snapshot: ' + err.message);
    }
  };

  const handleLoadSnapshot = (snap) => {
    try {
      if (onResetTransientState) onResetTransientState();
      moves.loadSaveState(snap);
      setStatusMsg(`✓ Loaded snapshot "${snap.name}"!`);
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setStatusMsg('❌ Failed to load snapshot: ' + err.message);
    }
  };

  const handleDeleteSnapshot = (id) => {
    try {
      const updated = savedSnapshots.filter(s => s.id !== id);
      setSavedSnapshots(updated);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      setStatusMsg('✓ Snapshot deleted.');
    } catch (err) {
      setStatusMsg('❌ Failed to delete: ' + err.message);
    }
  };

  const handleCopyJson = () => {
    try {
      const snap = createSnapshotObj('Exported State');
      const jsonStr = JSON.stringify(snap, null, 2);
      navigator.clipboard.writeText(jsonStr);
      setStatusMsg('📋 Full Game State JSON copied to clipboard!');
    } catch (err) {
      setStatusMsg('❌ Copy failed: ' + err.message);
    }
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      setStatusMsg('⚠️ Paste JSON text into the area first.');
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (onResetTransientState) onResetTransientState();
      moves.loadSaveState(parsed);
      setStatusMsg('✓ Game State imported & loaded!');
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setStatusMsg('❌ Invalid JSON string: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={backdropStyle}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>💾 Save & Load Game State</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {statusMsg && (
          <div style={statusBannerStyle}>
            {statusMsg}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button className="btn btn-primary" onClick={handleQuickSave} style={{ flex: 1 }}>
            💾 Quick Save State
          </button>
          <button className="btn btn-warning" onClick={handleQuickLoad} style={{ flex: 1 }}>
            📂 Quick Load State
          </button>
        </div>

        {/* Save Named Snapshot */}
        <div style={{ marginBottom: '16px', background: '#26201b', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            Save Current State as Snapshot
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. Scenario 1 - Whistleblow Seat 3"
              value={snapshotName}
              onChange={e => setSnapshotName(e.target.value)}
              style={inputStyle}
            />
            <button className="btn btn-success" onClick={handleSaveNamedSnapshot} style={{ whiteSpace: 'nowrap' }}>
              Save Snapshot
            </button>
          </div>
        </div>

        {/* Saved Snapshots List */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            Saved Snapshots ({savedSnapshots.length})
          </h4>
          {savedSnapshots.length === 0 ? (
            <p className="status-muted" style={{ fontStyle: 'italic', fontSize: '12px' }}>
              No saved snapshots yet. Create one above to easily test scenarios!
            </p>
          ) : (
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {savedSnapshots.map(snap => (
                <div key={snap.id} style={snapshotCardStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent-gold)' }}>{snap.name}</div>
                    <div style={{ fontSize: '10px', color: '#a8a29e' }}>
                      {snap.formattedTime} • {snap.numPlayers}P • Phase: {snap.phase}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-success" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => handleLoadSnapshot(snap)}>
                      ▶ Load
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-red)' }} onClick={() => handleDeleteSnapshot(snap.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export & Import JSON */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleCopyJson} style={{ flex: 1, fontSize: '12px' }}>
              📋 Copy JSON to Clipboard
            </button>
            <button className="btn btn-secondary" onClick={() => setShowImportBox(!showImportBox)} style={{ flex: 1, fontSize: '12px' }}>
              📥 {showImportBox ? 'Hide Import Box' : 'Import Raw JSON'}
            </button>
          </div>

          {showImportBox && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <textarea
                placeholder="Paste game state JSON string here..."
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                rows={4}
                style={textareaStyle}
              />
              <button className="btn btn-primary" onClick={handleImportJson} style={{ fontSize: '12px' }}>
                Load JSON State Into Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000
};

const modalStyle = {
  background: 'linear-gradient(135deg, rgba(30, 24, 20, 0.98), rgba(45, 30, 24, 0.98))',
  border: '1.5px solid var(--accent-gold, #c89b3c)',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '480px',
  padding: '18px 20px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(200, 155, 60, 0.2)',
  color: '#ffffff'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-main, #fff)',
  fontSize: '16px',
  cursor: 'pointer'
};

const statusBannerStyle = {
  background: '#26201b',
  border: '1px solid var(--accent-gold)',
  color: 'var(--accent-gold)',
  fontSize: '12px',
  padding: '6px 10px',
  borderRadius: '6px',
  marginBottom: '12px'
};

const inputStyle = {
  flex: 1,
  background: '#1c1917',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: '#fff',
  padding: '6px 10px',
  fontSize: '12px'
};

const textareaStyle = {
  width: '100%',
  background: '#1c1917',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: '#fff',
  padding: '8px',
  fontSize: '11px',
  fontFamily: 'monospace',
  boxSizing: 'border-box'
};

const snapshotCardStyle = {
  background: '#26201b',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '8px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};
