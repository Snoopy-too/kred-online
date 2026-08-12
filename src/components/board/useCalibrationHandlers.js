import { useState, useEffect } from 'react';
import { DEFAULT_PERSPECTIVE_OFFSETS } from './perspectiveUtils.js';

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
    try {
      const savedOffsets = localStorage.getItem(offsetStorageKey);
      if (savedOffsets) {
        const parsed = JSON.parse(savedOffsets);
        if (parsed && typeof parsed === 'object') setPerspectiveOffsets(parsed);
      }
    } catch (err) {
      console.warn('Failed to load perspective offsets draft:', err);
    }
  }, [numPlayers]);

  useEffect(() => {
    if (propCalibrationMode !== undefined) {
      setCalibrationMode(propCalibrationMode);
    }
  }, [propCalibrationMode]);

  useEffect(() => {
    window.calibrationMode = calibrationMode;
    window.setCalibrationMode = setCalibrationMode;
  }, [calibrationMode]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setCalibratedPositions(parsed);
      }
    } catch (err) {
      console.warn('Failed to load calibration draft:', err);
    }
  }, [numPlayers]);

  useEffect(() => {
    if (Object.keys(calibratedPositions).length > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
      } catch (err) {
        console.warn('Failed to save calibration draft:', err);
      }
    }
  }, [calibratedPositions, numPlayers]);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
      localStorage.setItem(offsetStorageKey, JSON.stringify(perspectiveOffsets));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDraftSavedMsg(`💾 Draft & View Offsets Saved at ${nowStr}!`);
      setTimeout(() => setDraftSavedMsg(''), 3500);
    } catch (err) {
      setDraftSavedMsg('❌ Save error');
      setTimeout(() => setDraftSavedMsg(''), 3000);
    }
  };

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(offsetStorageKey);
    } catch (e) {}
    setCalibratedPositions({});
    setPerspectiveOffsets({});
    setSelectedCalibrateKeys([]);
    setDraftSavedMsg('🗑️ Calibration Reset to Master Defaults!');
    setTimeout(() => setDraftSavedMsg(''), 3000);
  };

  const handleCopyCoordinates = () => {
    const exportPayload = {
      hotspots: activeHotspots,
      perspectiveOffsets: perspectiveOffsets
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
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
      const nextCal = { ...prev };
      let lastRot = null;
      targetKeys.forEach(locKey => {
        const base = (activeHotspots && activeHotspots[locKey]) || {};
        const cal = prev[locKey] || {};
        const current = { ...base, ...cal };

        let currentRot = current.rot;
        if (currentRot === undefined && current.transform) {
          const match = current.transform.match(/rotate\(([-?\d.]+)deg\)/);
          if (match) currentRot = parseFloat(match[1]);
        }
        if (currentRot === undefined) currentRot = 0;

        let currentScale = current.scale !== undefined ? current.scale : 1.0;
        const newRot = Math.round(((currentRot + deltaAngle) % 360 + 360) % 360);
        lastRot = newRot;
        nextCal[locKey] = {
          ...current,
          rot: newRot,
          scale: currentScale,
          transform: `translate(-50%, -50%) rotate(${newRot}deg) scale(${currentScale})`
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
        const base = (activeHotspots && activeHotspots[locKey]) || {};
        const cal = prev[locKey] || {};
        const current = { ...base, ...cal };
        let currentScale = current.scale !== undefined ? current.scale : 1.0;
        nextCal[locKey] = {
          ...current,
          rot: angleNum,
          scale: currentScale,
          transform: `translate(-50%, -50%) rotate(${angleNum}deg) scale(${currentScale})`
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
        const base = (activeHotspots && activeHotspots[locKey]) || {};
        const cal = prev[locKey] || {};
        const current = { ...base, ...cal };

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
        const base = (activeHotspots && activeHotspots[locKey]) || {};
        const cal = prev[locKey] || {};
        const current = { ...base, ...cal };
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
      if (selectedCalibrateKeys.includes(locKey)) {
        const nextKeys = selectedCalibrateKeys.filter(k => k !== locKey);
        setSelectedCalibrateKeys(nextKeys);
        targetKeys = nextKeys;
      } else {
        const nextKeys = [...selectedCalibrateKeys, locKey];
        setSelectedCalibrateKeys(nextKeys);
        targetKeys = nextKeys;
      }
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
      const nextP = {
        x: current.x + dx,
        y: current.y + dy
      };
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
    handleRotateSelectedSpots,
    handleSetExactAngle,
    handleScaleSelectedSpots,
    handleSetExactScale,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp
  };
}
