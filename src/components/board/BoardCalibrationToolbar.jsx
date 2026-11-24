import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_PERSPECTIVE_OFFSETS } from './perspectiveUtils.js';

function NudgePad({ onUp, onDown, onLeft, onRight, stepLabel }) {
  const btnStyle = { width: '28px', height: '24px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '2px', alignItems: 'center', justifyItems: 'center' }}>
      <span />
      <button type="button" className="btn btn-xs" style={btnStyle} onClick={onUp} title={`Up (${stepLabel})`}>↑</button>
      <span />
      <button type="button" className="btn btn-xs" style={btnStyle} onClick={onLeft} title={`Left (${stepLabel})`}>←</button>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-gold)', userSelect: 'none' }}>{stepLabel}</span>
      <button type="button" className="btn btn-xs" style={btnStyle} onClick={onRight} title={`Right (${stepLabel})`}>→</button>
      <span />
      <button type="button" className="btn btn-xs" style={btnStyle} onClick={onDown} title={`Down (${stepLabel})`}>↓</button>
      <span />
    </div>
  );
}

export function BoardCalibrationToolbar({
  calibrationMode,
  onClose = null,
  selectedCalibrateKeys,
  setSelectedCalibrateKeys,
  activeHotspots,
  setCalibratedPositions,
  numPlayers,
  tilesPerPlayer,
  playerID = 0,
  perspectiveOffsets = {},
  handleNudgePerspective,
  handleRotatePerspective,
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
  setShowSpotLabels,
  showTileFaces,
  setShowTileFaces,
  handleNudgeSelectedSpotsPixels,
  handleRotateSelectedSpotsAroundCenter
}) {
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState('');
  const [viewStep, setViewStep] = useState(1);
  const [spotStep, setSpotStep] = useState(1);
  const [pos, setPos] = useState(null);
  const barRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { offsetX, offsetY, width, height } = dragRef.current;
      const x = Math.max(8, Math.min(window.innerWidth - Math.min(width, window.innerWidth - 16) - 8, e.clientX - offsetX));
      const y = Math.max(8, Math.min(window.innerHeight - Math.min(height, 60) - 8, e.clientY - offsetY));
      setPos({ x, y });
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!calibrationMode) return null;

  const handleHeaderPointerDown = (e) => {
    if (e.target.closest('button, input, textarea, a')) return;
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };
  };

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

  const selectAllElements = () => {
    if (activeHotspots) {
      setSelectedCalibrateKeys(Object.keys(activeHotspots));
    }
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
    <div
      ref={barRef}
      className="calibration-floating-bar"
      style={{
        opacity: 0.95,
        ...(pos ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto' } : {})
      }}
    >
      <div
        className="cal-header"
        onPointerDown={handleHeaderPointerDown}
        style={{ cursor: 'grab', userSelect: 'none' }}
        title="Drag to move"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
          <span className="cal-title">⋮⋮ ⚙ Hotspot Calibrator ({numPlayers}P)</span>
          {onClose && (
            <button
              type="button"
              className="btn btn-xs btn-danger"
              onClick={onClose}
              title="Close Calibrator"
              aria-label="Close Calibrator"
            >
              ✕
            </button>
          )}
        </div>
        <div className="cal-top-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => setShowSpotLabels && setShowSpotLabels(prev => !prev)}>
            {showSpotLabels ? '🏷 Hide Labels' : '🏷 Show Labels'}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowTileFaces && setShowTileFaces(prev => !prev)}
            title="Toggle Tile Art Preview vs Schematic Top/Bottom indicators"
          >
            {showTileFaces ? '🎴 Tile Art: ON' : '📐 Tile Art: OFF'}
          </button>
          <button className="btn btn-sm btn-success" onClick={handleSaveDraft} title="Save draft in browser so you can adjust and copy all JSON">💾 Save Draft</button>
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
          <button className="badge-btn" onClick={selectAllElements}>
            Select All Elements
          </button>
          {selectedCalibrateKeys.length > 0 && (
            <button className="badge-btn btn-clear" onClick={() => setSelectedCalibrateKeys([])}>
              Clear ({selectedCalibrateKeys.length})
            </button>
          )}
        </div>
      </div>

      <div className="cal-controls-row" style={{ background: '#1c1613' }}>
        <div className="cal-group" style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="cal-label" style={{ color: 'var(--accent-gold)' }}>
              🗺 Board View (P{parseInt(playerID || 0, 10) + 1})
            </span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step:</span>
              {[1, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-xs ${viewStep === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewStep(s)}
                >
                  {s}% / {s}°
                </button>
              ))}
            </div>
          </div>

          <NudgePad
            stepLabel={`${viewStep}%`}
            onUp={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, -viewStep)}
            onDown={() => handleNudgePerspective && handleNudgePerspective(playerID, 0, viewStep)}
            onLeft={() => handleNudgePerspective && handleNudgePerspective(playerID, -viewStep, 0)}
            onRight={() => handleNudgePerspective && handleNudgePerspective(playerID, viewStep, 0)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" className="btn btn-xs" onClick={() => handleRotatePerspective && handleRotatePerspective(playerID, -viewStep)} title={`Rotate Left (-${viewStep}°)`}>
              ↺ -{viewStep}°
            </button>
            <button type="button" className="btn btn-xs" onClick={() => handleRotatePerspective && handleRotatePerspective(playerID, viewStep)} title={`Rotate Right (+${viewStep}°)`}>
              ↻ +{viewStep}°
            </button>
            <button type="button" className="btn btn-xs btn-clear" onClick={() => handleResetPerspectiveOffset && handleResetPerspectiveOffset(playerID)}>
              Reset View
            </button>
          </div>

          {(() => {
            const pIdx = parseInt(playerID || 0, 10);
            const defOffset = DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[pIdx] || { x: 0, y: 0 };
            const activeOff = perspectiveOffsets[pIdx] || defOffset;
            const rotOff = activeOff.r !== undefined ? activeOff.r : 0;
            return (
              <span className="cal-metrics" style={{ color: 'var(--accent-gold)' }}>
                X={activeOff.x}%, Y={activeOff.y}%, Rot={rotOff}°
              </span>
            );
          })()}
        </div>
      </div>

      {selectedCalibrateKeys.length > 0 && (
        <div className="cal-controls-row">
          <div className="cal-selected-info">
            Selected ({selectedCalibrateKeys.length}):{' '}
            <strong>
              {selectedCalibrateKeys.length > 6
                ? `${selectedCalibrateKeys.slice(0, 6).map(k => getShortLabel(k)).join(', ')}... (+${selectedCalibrateKeys.length - 6} more)`
                : selectedCalibrateKeys.map(k => getShortLabel(k)).join(', ')}
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
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleRotateSelectedSpots(180)}
              title="Flip selected tile(s) 180°"
              style={{ fontWeight: 'bold' }}
            >
              🔄 Flip 180°
            </button>
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

      {selectedCalibrateKeys.length > 0 && (
        <div className="cal-controls-row" style={{ background: '#13191c', marginTop: '6px' }}>
          <div className="cal-group" style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="cal-label" style={{ color: 'var(--accent-gold)' }}>
                🎯 Move Selected Spot(s)
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Step:</span>
                {[1, 5, 10].map((px) => (
                  <button
                    key={px}
                    type="button"
                    className={`btn btn-xs ${spotStep === px ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSpotStep(px)}
                  >
                    {px}px
                  </button>
                ))}
              </div>
            </div>

            <NudgePad
              stepLabel={`${spotStep}px`}
              onUp={() => handleNudgeSelectedSpotsPixels && handleNudgeSelectedSpotsPixels(0, -spotStep)}
              onDown={() => handleNudgeSelectedSpotsPixels && handleNudgeSelectedSpotsPixels(0, spotStep)}
              onLeft={() => handleNudgeSelectedSpotsPixels && handleNudgeSelectedSpotsPixels(-spotStep, 0)}
              onRight={() => handleNudgeSelectedSpotsPixels && handleNudgeSelectedSpotsPixels(spotStep, 0)}
            />

            {selectedCalibrateKeys.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                <span className="cal-label" style={{ color: 'var(--accent-gold)' }}>Group Rotate:</span>
                <button type="button" className="btn btn-xs" onClick={() => handleRotateSelectedSpotsAroundCenter && handleRotateSelectedSpotsAroundCenter(-5)}>↺ -5°</button>
                <button type="button" className="btn btn-xs" onClick={() => handleRotateSelectedSpotsAroundCenter && handleRotateSelectedSpotsAroundCenter(-1)}>↺ -1°</button>
                <button type="button" className="btn btn-xs" onClick={() => handleRotateSelectedSpotsAroundCenter && handleRotateSelectedSpotsAroundCenter(1)}>↻ +1°</button>
                <button type="button" className="btn btn-xs" onClick={() => handleRotateSelectedSpotsAroundCenter && handleRotateSelectedSpotsAroundCenter(5)}>↻ +5°</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
