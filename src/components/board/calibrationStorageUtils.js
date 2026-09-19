import {
  fetchCalibrationFromDb,
  saveCalibrationToDb,
  deleteCalibrationFromDb
} from '../../lib/calibrationRepository.js';

// Helper to determine if we are in local development / local testing environment
export const isLocalEnvironment = () => {
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

export const isDbSyncEnabled = () => false;

export const loadLocalCalibrationCache = (localStorageKey, offsetStorageKey) => {
  let hotspots = null;
  let offsets = null;
  try {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') hotspots = parsed;
    }
    const savedOffsets = localStorage.getItem(offsetStorageKey);
    if (savedOffsets) {
      const parsed = JSON.parse(savedOffsets);
      if (parsed && typeof parsed === 'object') offsets = parsed;
    }
  } catch (err) {
    console.warn('Failed to load local calibration cache:', err);
  }
  return { hotspots, offsets };
};

export const syncCalibrationFromDb = async () => {
  // Remote database sync bypassed: private server is updated via git webhook
  return null;
};

export const persistDraft = async (numPlayers, calibratedPositions, perspectiveOffsets, localStorageKey, offsetStorageKey) => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
    localStorage.setItem(offsetStorageKey, JSON.stringify(perspectiveOffsets));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `💾 Saved to Local Draft at ${nowStr}!`;
};

export const resetDraft = async (numPlayers, localStorageKey, offsetStorageKey) => {
  localStorage.removeItem(localStorageKey);
  localStorage.removeItem(offsetStorageKey);

  if (isDbSyncEnabled(numPlayers)) {
    await deleteCalibrationFromDb(numPlayers);
  }
  return isDbSyncEnabled(numPlayers)
    ? '🗑️ Calibration Reset to Master Defaults (DB cleared)!'
    : '🗑️ Calibration Reset to Master Defaults locally!';
};

export const importCalibrationJson = async (jsonString, numPlayers, localStorageKey, offsetStorageKey) => {
  const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON object');

  const importedHotspots = (parsed.hotspots && typeof parsed.hotspots === 'object') ? parsed.hotspots : parsed;
  const importedOffsets = (parsed.perspectiveOffsets && typeof parsed.perspectiveOffsets === 'object') ? parsed.perspectiveOffsets : null;

  const nextHotspots = (importedHotspots && Object.keys(importedHotspots).length > 0) ? importedHotspots : {};
  const nextOffsets = (importedOffsets && Object.keys(importedOffsets).length > 0) ? importedOffsets : {};

  if (Object.keys(nextHotspots).length > 0) {
    localStorage.setItem(localStorageKey, JSON.stringify(nextHotspots));
  }
  if (Object.keys(nextOffsets).length > 0) {
    localStorage.setItem(offsetStorageKey, JSON.stringify(nextOffsets));
  }

  if (isDbSyncEnabled(numPlayers)) {
    await saveCalibrationToDb(numPlayers, nextHotspots, nextOffsets);
  }
  return { nextHotspots, nextOffsets, dbSynced: isDbSyncEnabled(numPlayers) };
};
