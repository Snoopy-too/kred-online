import React, { useState, useEffect } from 'react';
import './diagnostics.css';

export function DiagnosticsPanel({ gameLogger, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'saved'
  const [logPayload, setLogPayload] = useState(() => gameLogger ? gameLogger.getLogPayload() : { events: [] });
  const [savedFiles, setSavedFiles] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  // Subscribe to live game logger updates
  useEffect(() => {
    if (!gameLogger) return;
    setLogPayload(gameLogger.getLogPayload());
    const unsubscribe = gameLogger.subscribe((updated) => {
      setLogPayload(updated);
    });
    return () => unsubscribe();
  }, [gameLogger]);

  // Fetch list of saved log files in diagnostics/
  const fetchSavedFiles = async () => {
    try {
      const res = await fetch('/api/diagnostics/list');
      const data = await res.json();
      if (data.files) {
        setSavedFiles(data.files);
      }
    } catch (err) {
      console.error('[DiagnosticsPanel] Error fetching saved logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedFiles();
    }
  }, [activeTab]);

  const handleSaveCurrentLog = async () => {
    if (!gameLogger) return;
    setStatusMsg('Saving JSON log to diagnostics/...');
    const result = await gameLogger.saveToFile();
    if (result.success) {
      setStatusMsg(`Saved successfully to ${result.filename}!`);
      fetchSavedFiles();
    } else {
      setStatusMsg(`Save failed: ${result.error || 'Unknown error'}`);
    }
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSelectSavedFile = async (filename) => {
    try {
      const res = await fetch(`/api/diagnostics/read?file=${encodeURIComponent(filename)}`);
      const data = await res.json();
      setSelectedLog(data);
      setStepIndex(0);
    } catch (err) {
      console.error('[DiagnosticsPanel] Error reading file:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="diag-panel-overlay">
      <div className="diag-header">
        <h3 className="diag-title">🔍 Game Diagnostics & Sequence Logger</h3>
        <button className="diag-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="diag-tabs">
        <button
          className={`diag-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          ⚡ Live Session ({logPayload.events?.length || 0} Events)
        </button>
        <button
          className={`diag-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          📁 Saved Logs ({savedFiles.length})
        </button>
      </div>

      <div className="diag-content">
        {statusMsg && (
          <div style={{ background: '#2b6cb0', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', color: '#fff', fontSize: '12px' }}>
            {statusMsg}
          </div>
        )}

        {activeTab === 'live' && (
          <div>
            <div className="diag-toolbar">
              <button className="diag-btn diag-btn-primary" onClick={handleSaveCurrentLog}>
                💾 Save Log to diagnostics/ JSON
              </button>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '11px', color: '#a0aec0' }}>
              Match ID: <strong>{logPayload.matchID}</strong> | Players: <strong>{logPayload.numPlayers}P</strong>
            </div>

            <div className="diag-event-list">
              {logPayload.events && logPayload.events.map((evt) => (
                <div key={evt.seq} className="diag-event-card">
                  <div>
                    <span className="diag-event-seq">#{evt.seq}</span>
                    <span className="diag-event-type">{evt.actionType}</span>
                    {evt.playerID !== undefined && (
                      <span style={{ color: '#e53e3e', marginLeft: '8px', fontWeight: 'bold' }}>
                        P{evt.playerID}
                      </span>
                    )}
                  </div>
                  <div className="diag-event-meta">
                    Phase: {evt.phase} | Turn: {evt.turn} | {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                  {evt.details && Object.keys(evt.details).length > 0 && (
                    <pre className="diag-json-box" style={{ marginTop: '6px' }}>
                      {JSON.stringify(evt.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {!selectedLog ? (
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-gold)' }}>Stored JSON Log Files</h4>
                {savedFiles.length === 0 ? (
                  <p style={{ color: '#a0aec0' }}>No saved log files found in diagnostics/ directory yet.</p>
                ) : (
                  savedFiles.map((f) => (
                    <div
                      key={f.filename}
                      className="diag-log-list-item"
                      onClick={() => handleSelectSavedFile(f.filename)}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#63b3ed' }}>{f.filename}</div>
                        <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                          {new Date(f.createdAt).toLocaleString()} ({(f.size / 1024).toFixed(1)} KB)
                        </div>
                      </div>
                      <button className="diag-btn">Inspect →</button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div>
                <button
                  className="diag-btn"
                  style={{ marginBottom: '12px' }}
                  onClick={() => setSelectedLog(null)}
                >
                  ← Back to Log List
                </button>

                <h4 style={{ margin: '0 0 6px 0', color: 'var(--accent-gold)' }}>
                  Sequence Reviewer ({selectedLog.events?.length || 0} Total Events)
                </h4>
                <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '12px' }}>
                  Match: {selectedLog.matchID} | Start: {new Date(selectedLog.startTime).toLocaleString()}
                </div>

                {selectedLog.events && selectedLog.events.length > 0 && (
                  <div>
                    <div className="diag-toolbar">
                      <button
                        className="diag-btn"
                        disabled={stepIndex === 0}
                        onClick={() => setStepIndex(s => Math.max(0, s - 1))}
                      >
                        ◀ Prev Event
                      </button>
                      <span style={{ fontWeight: 'bold', color: '#d4af37' }}>
                        Step {stepIndex + 1} / {selectedLog.events.length}
                      </span>
                      <button
                        className="diag-btn"
                        disabled={stepIndex === selectedLog.events.length - 1}
                        onClick={() => setStepIndex(s => Math.min(selectedLog.events.length - 1, s + 1))}
                      >
                        Next Event ▶
                      </button>
                    </div>

                    {(() => {
                      const curEvt = selectedLog.events[stepIndex];
                      if (!curEvt) return null;
                      return (
                        <div className="diag-event-card" style={{ borderColor: 'var(--accent-gold)' }}>
                          <div>
                            <span className="diag-event-seq">#{curEvt.seq}</span>
                            <span className="diag-event-type">{curEvt.actionType}</span>
                            {curEvt.playerID !== undefined && (
                              <span style={{ color: '#e53e3e', marginLeft: '8px', fontWeight: 'bold' }}>
                                Player {curEvt.playerID}
                              </span>
                            )}
                          </div>
                          <div className="diag-event-meta">
                            Phase: {curEvt.phase} | Turn: {curEvt.turn} | {new Date(curEvt.timestamp).toLocaleTimeString()}
                          </div>
                          <h5 style={{ margin: '8px 0 4px 0', color: '#e2e8f0' }}>Action Details:</h5>
                          <pre className="diag-json-box">
                            {JSON.stringify(curEvt.details, null, 2)}
                          </pre>
                          {curEvt.boardState && (
                            <>
                              <h5 style={{ margin: '8px 0 4px 0', color: '#e2e8f0' }}>Board Snapshot:</h5>
                              <pre className="diag-json-box">
                                {JSON.stringify(curEvt.boardState, null, 2)}
                              </pre>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
