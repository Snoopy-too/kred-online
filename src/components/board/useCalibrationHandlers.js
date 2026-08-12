import { useState, useEffect } from 'react';
import { DEFAULT_PERSPECTIVE_OFFSETS } from './perspectiveUtils.js';
import {
  fetchCalibrationFromDb,
  saveCalibrationToDb,
  deleteCalibrationFromDb
} from '../../lib/calibrationRepository.js';

// Helper to determine if we are in local development / local testing environment
const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  );
};

// Helper to determine if Supabase database sync is enabled and credentials are configured
const isDbSyncEnabled = () => {
  if (isLocalEnvironment()) return false;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    url !== 'https://your-supabase-project.supabase.co'
  );
};

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

  // Sync prop mode changes
  useEffect(() => {
    if (propCalibrationMode !== undefined) {
      setCalibrationMode(propCalibrationMode);
    }
  }, [propCalibrationMode]);

  // Keep window global in sync for test scripts
  useEffect(() => {
    window.calibrationMode = calibrationMode;
    window.setCalibrationMode = setCalibrationMode;
  }, [calibrationMode]);

  // Consolidated Initial Load: Load local storage first, then fetch/sync from database (if online)
  useEffect(() => {
    let active = true;

    // 1. Sync load from local storage
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setCalibratedPositions(parsed);
      }
      const savedOffsets = localStorage.getItem(offsetStorageKey);
      if (savedOffsets) {
        const parsed = JSON.parse(savedOffsets);
        if (parsed && typeof parsed === 'object') setPerspectiveOffsets(parsed);
      }
    } catch (err) {
      console.warn('Failed to load local calibration cache:', err);
    }

    // 2. Async fetch from Supabase (Only if online and DB is enabled/configured)
    async function syncFromDb() {
      if (!isDbSyncEnabled()) {
        console.log(`ℹ️ Bypassing database calibration for ${numPlayers}P (Local or missing/placeholder credentials).`);
        return;
      }

      const dbData = await fetchCalibrationFromDb(numPlayers);
      if (!active || !dbData) return;

      if (dbData.hotspots && Object.keys(dbData.hotspots).length > 0) {
        setCalibratedPositions(dbData.hotspots);
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(dbData.hotspots));
        } catch (e) {}
      }
      if (dbData.perspective_offsets && Object.keys(dbData.perspective_offsets).length > 0) {
        setPerspectiveOffsets(dbData.perspective_offsets);
        try {
          localStorage.setItem(offsetStorageKey, JSON.stringify(dbData.perspective_offsets));
        } catch (e) {}
      }
    }

    syncFromDb();

    return () => {
      active = false;
    };
  }, [numPlayers]);

  // Auto-save local draft on position changes (local cache persistence)
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
      localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
      localStorage.setItem(offsetStorageKey, JSON.stringify(perspectiveOffsets));

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isDbSyncEnabled()) {
        // Persist to Supabase Database only if enabled and configured
        await saveCalibrationToDb(numPlayers, calibratedPositions, perspectiveOffsets);
        setDraftSavedMsg(`💾 Saved to DB & Local Drafts at ${nowStr}!`);
      } else {
        setDraftSavedMsg(`💾 Saved to Local Drafts (DB bypassed) at ${nowStr}!`);
      }
      setTimeout(() => setDraftSavedMsg(''), 3500);
    } catch (err) {
      console.error('Failed to sync calibration:', err);
      setDraftSavedMsg('❌ Save error');
      setTimeout(() => setDraftSavedMsg(''), 3000);
    }
  };

  const handleResetDraft = async () => {
    try {
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(offsetStorageKey);

      if (isDbSyncEnabled()) {
        // Remove row from Supabase Database for production
        await deleteCalibrationFromDb(numPlayers);
      }
    } catch (err) {
      console.error('Failed to clear database calibration:', err);
    }
    setCalibratedPositions({});
    setPerspectiveOffsets({});
    setSelectedCalibrateKeys([]);
    setDraftSavedMsg(
      isDbSyncEnabled()
        ? '🗑️ Calibration Reset to Master Defaults (DB cleared)!'
        : '🗑️ Calibration Reset to Master Defaults locally!'
    );
    setTimeout(() => setDraftSavedMsg(''), 3000);
  };

  const handleCopyCoordinates = () => {
    const exportPayload = {
      hotspots: activeHotspots,
      perspectiveOffsets: perspectiveOffsets
    };
    navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  const handleImportJson = async (jsonString) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON object');

      const importedHotspots = (parsed.hotspots && typeof parsed.hotspots === 'object') ? parsed.hotspots : parsed;
      const importedOffsets = (parsed.perspectiveOffsets && typeof parsed.perspectiveOffsets === 'object') ? parsed.perspectiveOffsets : null;

      const nextHotspots = (importedHotspots && Object.keys(importedHotspots).length > 0) ? importedHotspots : {};
      const nextOffsets = (importedOffsets && Object.keys(importedOffsets).length > 0) ? importedOffsets : {};

      if (Object.keys(nextHotspots).length > 0) {
        setCalibratedPositions(nextHotspots);
        localStorage.setItem(localStorageKey, JSON.stringify(nextHotspots));
      }
      if (Object.keys(nextOffsets).length > 0) {
        setPerspectiveOffsets(nextOffsets);
        localStorage.setItem(offsetStorageKey, JSON.stringify(nextOffsets));
      }

      if (isDbSyncEnabled()) {
        // Sync imported coordinates to database
        await saveCalibrationToDb(numPlayers, nextHotspots, nextOffsets);
        setDraftSavedMsg('📥 Calibration Imported & Saved to DB!');
      } else {
        setDraftSavedMsg('📥 Calibration Imported & Saved locally!');
      }
      setTimeout(() => setDraftSavedMsg(''), 3500);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      setDraftSavedMsg('❌ Import Error');
      setTimeout(() => setDraftSavedMsg(''), 3500);
      return false;
    }
  };

  // Sync selected spot angle/scale into input boxes
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
      const nextCal = { ...prev };
      let lastRot = null;
      targetKeys.forEach(locKey => {
        const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prev[locKey] || {}) };
        let currentRot = current.rot;
        if (currentRot === undefined && current.transform) {
          const match = current.transform.match(/rotate\(([-?\d.]+)deg\)/);
          if (match) currentRot = parseFloat(match[1]);
        }
        currentRot = currentRot || 0;
        const newRot = Math.round(((currentRot + deltaAngle) % 360 + 360) % 360);
        lastRot = newRot;
        const scale = current.scale !== undefined ? current.scale : 1.0;
        nextCal[locKey] = {
          ...current,
          rot: newRot,
          scale,
          transform: `translate(-50%, -50%) rotate(${newRot}deg) scale(${scale})`
        };
      });
      if (lastRot !== null) setAngleInput(String(lastRot));
      return nextCal;
    });
  };

  const handleSetExactAngle = (angleVal) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    const parsed = parseFloat(angleVal);
    if (isNaN(parsed)) return;
    const angleNum = Math.round(((parsed % 360) + 360) % 360);
    setCalibratedPositions(prev => {
      const nextCal = { ...prev };
      selectedCalibrateKeys.forEach(locKey => {
        const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prev[locKey] || {}) };
        const scale = current.scale !== undefined ? current.scale : 1.0;
        nextCal[locKey] = {
          ...current,
          rot: angleNum,
          scale,
          transform: `translate(-50%, -50%) rotate(${angleNum}deg) scale(${scale})`
        };
      });
      return nextCal;
    });
  };

  const handleScaleSelectedSpots = (deltaScale) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    setCalibratedPositions(prev => {
      const nextCal = { ...prev };
      let lastScale = null;
      selectedCalibrateKeys.forEach(locKey => {
        const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prev[locKey] || {}) };
        let currentScale = current.scale !== undefined ? current.scale : 1.0;
        let newScale = parseFloat((currentScale + deltaScale).toFixed(2));
        if (newScale < 0.3) newScale = 0.3;
        if (newScale > 3.0) newScale = 3.0;
        let rot = current.rot !== undefined ? current.rot : 0;
        lastScale = Math.round(newScale * 100);
        nextCal[locKey] = {
          ...current,
          rot,
          scale: newScale,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${newScale})`
        };
      });
      if (lastScale !== null) setScaleInput(String(lastScale));
      return nextCal;
    });
  };

  const handleSetExactScale = (scaleVal) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    const parsed = parseFloat(scaleVal);
    if (isNaN(parsed)) return;
    let scaleNum = parseFloat((parsed / 100).toFixed(2));
    if (scaleNum < 0.3) scaleNum = 0.3;
    if (scaleNum > 3.0) scaleNum = 3.0;

    setCalibratedPositions(prev => {
      const nextCal = { ...prev };
      selectedCalibrateKeys.forEach(locKey => {
        const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prev[locKey] || {}) };
        let rot = current.rot !== undefined ? current.rot : 0;
        nextCal[locKey] = {
          ...current,
          rot,
          scale: scaleNum,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scaleNum})`
        };
      });
      return nextCal;
    });
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

    const handleWindowMouseUp = () => {
      setDragState(null);
    };

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
      const nextP = { x: current.x + dx, y: current.y + dy };
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
    const containerEl = document.querySelector('.board-image-overlay-container');
    const width = (containerEl && containerEl.offsetWidth) || 1000;
    const height = (containerEl && containerEl.offsetHeight) || 1000;

    const percentDx = (dxPx / width) * 100;
    const percentDy = (dyPx / height) * 100;

    setCalibratedPositions(prev => {
      const nextCal = { ...prev };
      selectedCalibrateKeys.forEach(k => {
        const current = { ...((activeHotspots && activeHotspots[k]) || {}), ...(prev[k] || {}) };
        const startLeft = parseFloat(current.left || '50');
        const startTop = parseFloat(current.top || '50');
        nextCal[k] = {
          ...current,
          left: `${(startLeft + percentDx).toFixed(2)}%`,
          top: `${(startTop + percentDy).toFixed(2)}%`
        };
      });
      return nextCal;
    });
  };

  const handleRotateSelectedSpotsAroundCenter = (deltaAngle) => {
    if (!selectedCalibrateKeys || selectedCalibrateKeys.length === 0) return;
    const rad = (deltaAngle * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    setCalibratedPositions(prev => {
      const nextCal = { ...prev };
      selectedCalibrateKeys.forEach(k => {
        const current = { ...((activeHotspots && activeHotspots[k]) || {}), ...(prev[k] || {}) };
        const leftVal = parseFloat(current.left || '50') - 50;
        const topVal = parseFloat(current.top || '50') - 50;
        const nextLeft = leftVal * cosR - topVal * sinR + 50;
        const nextTop = leftVal * sinR + topVal * cosR + 50;

        let currentRot = current.rot;
        if (currentRot === undefined && current.transform) {
          const match = current.transform.match(/rotate\(([-?\d.]+)deg\)/);
          if (match) currentRot = parseFloat(match[1]);
        }
        currentRot = currentRot || 0;
        const newRot = Math.round(((currentRot + deltaAngle) % 360 + 360) % 360);
        const scale = current.scale !== undefined ? current.scale : 1.0;

        nextCal[k] = {
          ...current,
          left: `${nextLeft.toFixed(2)}%`,
          top: `${nextTop.toFixed(2)}%`,
          rot: newRot,
          scale,
          transform: `translate(-50%, -50%) rotate(${newRot}deg) scale(${scale})`
        };
      });
      return nextCal;
    });
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
