import { useState, useEffect } from 'react';
import { DEFAULT_PERSPECTIVE_OFFSETS } from './perspectiveUtils.js';
import {
  loadLocalCalibrationCache,
  syncCalibrationFromDb,
  persistDraft,
  resetDraft,
  importCalibrationJson
} from './calibrationStorageUtils.js';
import {
  calculateRotatedSpots,
  calculateExactAngleSpots,
  calculateScaledSpots,
  calculateExactScaleSpots,
  calculateNudgedSpotsPixels,
  calculateRotatedSpotsAroundCenter
} from './calibrationTransformUtils.js';

export function useCalibrationHandlers(numPlayers, propCalibrationMode, activeHotspots) {
  const [calibrationMode, setCalibrationMode] = useState(window.KRED_CALIBRATION_MODE || propCalibrationMode || false);
  const [showSpotLabels, setShowSpotLabels] = useState(true);
  const [calibratedPositions, setCalibratedPositions] = useState({});
  const [selectedCalibrateKeys, setSelectedCalibrateKeys] = useState([]);
  const [angleInput, setAngleInput] = useState('');
  const [scaleInput, setScaleInput] = useState('');
  const [perspectiveOffsets, setPerspectiveOffsets] = useState({});
  const [dragState, setDragState] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState('');

  const localStorageKey = `kred_calibration_draft_${numPlayers}P`;
  const offsetStorageKey = `kred_perspective_offsets_${numPlayers}P`;

  useEffect(() => {
    if (propCalibrationMode !== undefined) {
      setCalibrationMode(propCalibrationMode);
    }
  }, [propCalibrationMode]);

  useEffect(() => {
    window.calibrationMode = calibrationMode;
    window.setCalibrationMode = setCalibrationMode;
  }, [calibrationMode]);

  // Consolidated Initial Load: Load local storage first, then fetch/sync from database (if online)
  useEffect(() => {
    let active = true;

    const { hotspots, offsets } = loadLocalCalibrationCache(localStorageKey, offsetStorageKey);
    if (hotspots) setCalibratedPositions(hotspots);
    if (offsets) setPerspectiveOffsets(offsets);

    async function syncDb() {
      const dbData = await syncCalibrationFromDb(numPlayers, localStorageKey, offsetStorageKey);
      if (!active || !dbData) return;
      if (dbData.hotspots && Object.keys(dbData.hotspots).length > 0) {
        setCalibratedPositions(dbData.hotspots);
      }
      if (dbData.perspective_offsets && Object.keys(dbData.perspective_offsets).length > 0) {
        setPerspectiveOffsets(dbData.perspective_offsets);
      }
    }

    syncDb();
    return () => { active = false; };
  }, [numPlayers]);

  useEffect(() => {
    if (Object.keys(calibratedPositions).length > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
      } catch (err) {
        console.warn('Failed to save calibration draft to localStorage:', err);
      }
    }
  }, [calibratedPositions, numPlayers]);

  const handleSaveDraft = async () => {
    try {
      const msg = await persistDraft(numPlayers, calibratedPositions, perspectiveOffsets, localStorageKey, offsetStorageKey);
      setDraftSavedMsg(msg);
      setTimeout(() => setDraftSavedMsg(''), 3500);
    } catch (err) {
      console.error('Failed to sync calibration:', err);
      setDraftSavedMsg('❌ Save error');
      setTimeout(() => setDraftSavedMsg(''), 3000);
    }
  };

  const handleResetDraft = async () => {
    try {
      const msg = await resetDraft(numPlayers, localStorageKey, offsetStorageKey);
      setDraftSavedMsg(msg);
    } catch (err) {
      console.error('Failed to clear database calibration:', err);
    }
    setCalibratedPositions({});
    setPerspectiveOffsets({});
    setSelectedCalibrateKeys([]);
    setTimeout(() => setDraftSavedMsg(''), 3000);
  };

  const handleCopyCoordinates = () => {
    const exportPayload = { hotspots: activeHotspots, perspectiveOffsets };
    navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  const handleImportJson = async (jsonString) => {
    try {
      const { nextHotspots, nextOffsets, dbSynced } = await importCalibrationJson(jsonString, numPlayers, localStorageKey, offsetStorageKey);
      if (Object.keys(nextHotspots).length > 0) setCalibratedPositions(nextHotspots);
      if (Object.keys(nextOffsets).length > 0) setPerspectiveOffsets(nextOffsets);
      setDraftSavedMsg(dbSynced ? '📥 Calibration Imported & Saved to DB!' : '📥 Calibration Imported & Saved locally!');
      setTimeout(() => setDraftSavedMsg(''), 3500);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      setDraftSavedMsg('❌ Import Error');
      setTimeout(() => setDraftSavedMsg(''), 3500);
      return false;
    }
  };

  useEffect(() => {
    if (selectedCalibrateKeys && selectedCalibrateKeys.length > 0) {
      const key = selectedCalibrateKeys[0];
      const base = (activeHotspots && activeHotspots[key]) || {};
      const cal = calibratedPositions[key] || {};
      const spot = { ...base, ...cal };
      let rotVal = spot.rot;
      if (rotVal === undefined && spot.transform) {
        const match = spot.transform.match(/rotate\(([-?\d.]+)deg\)/);
        if (match) rotVal = parseFloat(match[1]);
      }
      const rotNum = rotVal !== undefined ? Math.round(((rotVal % 360) + 360) % 360) : 0;
      const scaleNum = spot.scale !== undefined ? Math.round(spot.scale * 100) : 100;
      setAngleInput(String(rotNum));
      setScaleInput(String(scaleNum));
    } else {
      setAngleInput('');
      setScaleInput('');
    }
  }, [selectedCalibrateKeys]);

  const handleRotateSelectedSpots = (deltaAngle, customKeys = null) => {
    const targetKeys = customKeys || selectedCalibrateKeys;
    if (!targetKeys || targetKeys.length === 0) return;
    setCalibratedPositions(prev => {
      const { nextCal, lastRot } = calculateRotatedSpots(prev, activeHotspots, targetKeys, deltaAngle);
      if (lastRot !== null) setAngleInput(String(lastRot));
      return nextCal;
    });
  };

  const handleSetExactAngle = (angleVal) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => calculateExactAngleSpots(prev, activeHotspots, selectedCalibrateKeys, angleVal));
  };

  const handleScaleSelectedSpots = (deltaScale) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => {
      const { nextCal, lastScale } = calculateScaledSpots(prev, activeHotspots, selectedCalibrateKeys, deltaScale);
      if (lastScale !== null) setScaleInput(String(lastScale));
      return nextCal;
    });
  };

  const handleSetExactScale = (scaleVal) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => calculateExactScaleSpots(prev, activeHotspots, selectedCalibrateKeys, scaleVal));
  };

  const handleBoardMouseDown = (e, locKey, leftStr, topStr, perspectiveRotation = 0, zoomLevel = 1) => {
    if (!calibrationMode) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    let targetKeys = [];

    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      targetKeys = selectedCalibrateKeys.includes(locKey)
        ? selectedCalibrateKeys.filter(k => k !== locKey)
        : [...selectedCalibrateKeys, locKey];
      setSelectedCalibrateKeys(targetKeys);
    } else {
      setSelectedCalibrateKeys([locKey]);
      targetKeys = [locKey];
    }

    const startPositions = {};
    targetKeys.forEach(k => {
      const base = (activeHotspots && activeHotspots[k]) || {};
      const cal = calibratedPositions[k] || {};
      const currentSpot = { ...base, ...cal };
      const startLeft = (k === locKey && leftStr) ? leftStr : (currentSpot.left || '50');
      const startTop = (k === locKey && topStr) ? topStr : (currentSpot.top || '50');

      startPositions[k] = {
        initialSpot: currentSpot,
        leftVal: parseFloat(startLeft),
        topVal: parseFloat(startTop)
      };
    });

    setDragState({
      keys: targetKeys,
      startX,
      startY,
      startPositions,
      perspectiveRotation,
      zoomLevel
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleWindowMouseMove = (e) => {
      const containerEl = document.querySelector('.board-image-overlay-container');
      const width = (containerEl && containerEl.offsetWidth) || 1000;
      const height = (containerEl && containerEl.offsetHeight) || 1000;

      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      const rotRad = ((dragState.perspectiveRotation || 0) * Math.PI) / 180;
      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);

      const zoom = dragState.zoomLevel || 1;
      const localDx = (dx * cosR + dy * sinR) / zoom;
      const localDy = (-dx * sinR + dy * cosR) / zoom;

      const percentDx = (localDx / width) * 100;
      const percentDy = (localDy / height) * 100;

      setCalibratedPositions(prev => {
        const nextCal = { ...prev };
        dragState.keys.forEach(k => {
          const start = dragState.startPositions[k];
          if (start) {
            const initial = start.initialSpot || activeHotspots[k] || {};
            nextCal[k] = {
              ...initial,
              ...(prev[k] || {}),
              left: `${(start.leftVal + percentDx).toFixed(2)}%`,
              top: `${(start.topVal + percentDy).toFixed(2)}%`
            };
          }
        });
        return nextCal;
      });
    };

    const handleWindowMouseUp = () => { setDragState(null); };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [dragState, activeHotspots]);

  const handleBoardMouseMove = () => {};
  const handleBoardMouseUp = () => {};

  const handleNudgePerspective = (playerID, dx, dy) => {
    const p = parseInt(playerID, 10) || 0;
    const def = DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[p] || { x: 0, y: 0 };
    setPerspectiveOffsets(prev => {
      const current = prev[p] || def;
      const nextP = { ...current, x: current.x + dx, y: current.y + dy };
      const updated = { ...prev, [p]: nextP };
      try {
        localStorage.setItem(`kred_perspective_offsets_${numPlayers}P`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleRotatePerspective = (playerID, dr) => {
    const p = parseInt(playerID, 10) || 0;
    const def = DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[p] || { x: 0, y: 0 };
    setPerspectiveOffsets(prev => {
      const current = prev[p] || def;
      const currentR = current.r !== undefined ? current.r : 0;
      const nextP = { ...current, r: currentR + dr };
      const updated = { ...prev, [p]: nextP };
      try {
        localStorage.setItem(`kred_perspective_offsets_${numPlayers}P`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetPerspectiveOffset = (playerID) => {
    const p = parseInt(playerID, 10) || 0;
    const def = DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[p] || { x: 0, y: 0 };
    setPerspectiveOffsets(prev => {
      const updated = { ...prev, [p]: def };
      try {
        localStorage.setItem(`kred_perspective_offsets_${numPlayers}P`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleNudgeSelectedSpotsPixels = (dxPx, dyPx) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => calculateNudgedSpotsPixels(prev, activeHotspots, selectedCalibrateKeys, dxPx, dyPx));
  };

  const handleRotateSelectedSpotsAroundCenter = (deltaAngle) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => calculateRotatedSpotsAroundCenter(prev, activeHotspots, selectedCalibrateKeys, deltaAngle));
  };

  return {
    calibrationMode,
    setCalibrationMode,
    showSpotLabels,
    setShowSpotLabels,
    calibratedPositions,
    setCalibratedPositions,
    selectedCalibrateKeys,
    setSelectedCalibrateKeys,
    angleInput,
    setAngleInput,
    scaleInput,
    setScaleInput,
    perspectiveOffsets,
    setPerspectiveOffsets,
    handleNudgePerspective,
    handleRotatePerspective,
    handleResetPerspectiveOffset,
    copiedJson,
    draftSavedMsg,
    handleSaveDraft,
    handleResetDraft,
    handleCopyCoordinates,
    handleImportJson,
    handleRotateSelectedSpots,
    handleSetExactAngle,
    handleScaleSelectedSpots,
    handleSetExactScale,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp,
    handleNudgeSelectedSpotsPixels,
    handleRotateSelectedSpotsAroundCenter
  };
}
