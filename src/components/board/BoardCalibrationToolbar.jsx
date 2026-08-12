import React, { useState } from 'react';

export function BoardCalibrationToolbar({
  calibrationMode,
  selectedCalibrateKeys,
  setSelectedCalibrateKeys,
  activeHotspots,
  setCalibratedPositions,
  numPlayers,
  tilesPerPlayer,
  playerID = 0,
  perspectiveOffsets = {},
  handleNudgePerspective,
  handleResetPerspectiveOffset,
  handleSaveDraft,
  handleResetDraft,
  handleCopyCoordinates,
  handleImportJson,
  handleRotateSelectedSpots,
  handleSetExactAngle,
  handleScaleSelectedSpots,
  handleSetExactScale,
  angleInput,
  setAngleInput,
  scaleInput,
  setScaleInput,
  draftSavedMsg,
  copiedJson,
  showSpotLabels,
  setShowSpotLabels
}) {
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState('');

  if (!calibrationMode) return null;

  const selectPlayerBank = (playerIdx) => {
    const bankKeys = Array.from({ length: tilesPerPlayer }).map((_, i) => `p${playerIdx + 1}_bank${i + 1}`);
    setSelectedCalibrateKeys(bankKeys);
  };

  const selectAllDropTiles = () => {
    const dropKeys = Array.from({ length: numPlayers }).map((_, i) => `p${i + 1}_dropTile`);
    setSelectedCalibrateKeys(dropKeys);
  };

  const selectAllCredTokens = () => {
    const credKeys = Array.from({ length: numPlayers }).map((_, i) => `p${i + 1}_cred`);
    setSelectedCalibrateKeys(credKeys);
  };

  const getShortLabel = (locKey) => {
    if (locKey.startsWith('community_')) {
      return `COM${locKey.replace('community_', '')}`;
    }
    const labelParts = locKey.split('_');
    const pMatch = labelParts[0].match(/^p(\d+)$/i);
    const pNum = pMatch ? pMatch[1] : labelParts[0];
    const typePart = labelParts[1];
    let typeLabel = typePart;
    if (typePart === 'office') typeLabel = 'OF';
    else if (typePart === 'rostrum1') typeLabel = 'R1';
    else if (typePart === 'rostrum2') typeLabel = 'R2';
    else if (typePart.startsWith('seat')) typeLabel = typePart.replace('seat', 'S');
    else if (typePart.startsWith('bank')) typeLabel = typePart.replace('bank', 'BA');
    else if (typePart === 'dropTile') typeLabel = 'DR';
    else if (typePart === 'cred') typeLabel = 'CR';
    return `P${pNum} ${typeLabel}`;
  };

  const activeSpot = selectedCalibrateKeys.length > 0 ? (activeHotspots[selectedCalibrateKeys[0]] || {}) : {};
  const activeAngle = activeSpot.rot !== undefined ? activeSpot.rot : 0;
  const activeScalePercent = activeSpot.scale !== undefined ? Math.round(activeSpot.scale * 100) : 100;
  const activeWidthPx = (20 * (activeScalePercent / 100)).toFixed(1);
  const activeHeightPx = (40 * (activeScalePercent / 100)).toFixed(1);

  return (
    <div className="calibration-floating-bar" style={{ opacity: 0.95 }}>
      <div className="cal-header">
        <span className="cal-title">⚙ Hotspot Calibrator ({numPlayers}P)</span>
        <div className="cal-top-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => setShowSpotLabels && setShowSpotLabels(prev => !prev)}>
            {showSpotLabels ? '🏷 Hide Labels' : '🏷 Show Labels'}
          </button>
          <button className="btn btn-sm btn-success" onClick={handleSaveDraft}>💾 Save Draft</button>
          <button className="btn btn-sm btn-danger" onClick={handleResetDraft}>🗑 Reset</button>
          <button className="btn btn-sm btn-secondary" onClick={handleCopyCoordinates}>
            {copiedJson ? '✓ Copied!' : '📋 Copy All JSON'}
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => setShowImportBox(prev => !prev)}>
            {showImportBox ? '✖ Close Import' : '📥 Import JSON'}
          </button>
        </div>
      </div>

      {showImportBox && (
        <div style={{ padding: '10px', background: '#14100e', borderRadius: '6px', margin: '8px 0', border: '1px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '6px', fontWeight: 'bold' }}>
            📥 Import Calibration JSON:
          </div>
          <textarea
            rows={5}
            style={{
              width: '100%',
              background: '#090706',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              padding: '6px',
              boxSizing: 'border-box'
            }}
            placeholder='Paste exported JSON here (e.g. {"hotspots": {...}, "perspectiveOffsets": {...}})'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                if (handleImportJson && handleImportJson(importText)) {
                  setImportText('');
                  setShowImportBox(false);
                }
              }}
            >
              Apply JSON Import
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowImportBox(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {draftSavedMsg && <div className="cal-alert">{draftSavedMsg}</div>}

      <div className="cal-quick-selects">
        <span className="cal-label">Quick Select:</span>
        <div className="cal-badge-group">
          {Array.from({ length: numPlayers }).map((_, pIdx) => (
            <button key={pIdx} className="badge-btn" onClick={() => selectPlayerBank(pIdx)}>
              P{pIdx + 1} Bank
            </button>
          ))}
          <button className="badge-btn" onClick={selectAllDropTiles}>
            All Drop Tiles
          </button>
          <button className="badge-btn" onClick={selectAllCredTokens}>
            All Cred Tokens
          </button>
          {selectedCalibrateKeys.length > 0 && (
            <button className="badge-btn btn-clear" onClick={() => setSelectedCalibrateKeys([])}>
              Clear ({selectedCalibrateKeys.length})
            </button>
          )}
        </div>
      </div>

      <div className="cal-controls-row" style={{ background: '#1c1613' }}>
        <div className="cal-group" style={{ flexWrap: 'wrap', gap: '6px' }}>
          <span className="cal-label" style={{ color: 'var(--accent-gold)' }}>
            📍 View Nudge (P{parseInt(playerID || 0, 10) + 1}):
          </span>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, -5)}>
            ↑ Up (-5%)
          </button>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, -1)}>
            ↑ Up (-1%)
          </button>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, 1)}>
            ↓ Down (+1%)
          </button>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, 5)}>
            ↓ Down (+5%)
          </button>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, -1, 0)}>
            ← Left (-1%)
          </button>
          <button className="btn btn-xs" onClick={() => handleNudgePerspective && handleNudgePerspective(playerID, 1, 0)}>
            → Right (+1%)
          </button>
          <button className="btn btn-xs btn-clear" onClick={() => handleResetPerspectiveOffset && handleResetPerspectiveOffset(playerID)}>
            Reset View
          </button>
          <span className="cal-metrics" style={{ color: 'var(--accent-gold)' }}>
            Offset: X={perspectiveOffsets[playerID]?.x ?? (playerID == 0 ? 9 : playerID == 1 ? -9 : 0)}%, Y={perspectiveOffsets[playerID]?.y ?? (playerID == 0 ? -6 : playerID == 1 ? -6 : 0)}%
          </span>
        </div>
      </div>

      {selectedCalibrateKeys.length > 0 && (
        <div className="cal-controls-row">
          <div className="cal-selected-info">
            Selected ({selectedCalibrateKeys.length}):{' '}
            <strong>
              {selectedCalibrateKeys.map(k => getShortLabel(k)).join(', ')}
            </strong>
          </div>

          <div className="cal-group">
            <span className="cal-label">Rot ({activeAngle}°):</span>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(-45)}>-45°</button>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(-5)}>-5°</button>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(-1)}>-1°</button>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(1)}>+1°</button>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(5)}>+5°</button>
            <button className="btn btn-xs" onClick={() => handleRotateSelectedSpots(45)}>+45°</button>
            <input
              type="number"
              placeholder="deg"
              className="cal-input"
              value={angleInput}
              onChange={(e) => {
                setAngleInput(e.target.value);
                handleSetExactAngle(e.target.value);
              }}
            />
          </div>

          <div className="cal-group">
            <span className="cal-label">Scale ({activeScalePercent}%):</span>
            <button className="btn btn-xs" onClick={() => handleScaleSelectedSpots(-0.25)}>-25%</button>
            <button className="btn btn-xs" onClick={() => handleScaleSelectedSpots(-0.05)}>-5%</button>
            <button className="btn btn-xs" onClick={() => handleScaleSelectedSpots(0.05)}>+5%</button>
            <button className="btn btn-xs" onClick={() => handleScaleSelectedSpots(0.25)}>+25%</button>
            <input
              type="number"
              placeholder="%"
              className="cal-input"
              value={scaleInput}
              onChange={(e) => {
                setScaleInput(e.target.value);
                handleSetExactScale(e.target.value);
              }}
            />
          </div>

          <div className="cal-metrics">
            Size: {activeWidthPx}px × {activeHeightPx}px
          </div>
        </div>
      )}
    </div>
  );
}
