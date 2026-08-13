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

// Helper to determine if Supabase database sync is enabled and credentials are configured
export const isDbSyncEnabled = () => {
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

export const syncCalibrationFromDb = async (numPlayers, localStorageKey, offsetStorageKey) => {
  if (!isDbSyncEnabled()) {
    console.log(`ℹ️ Bypassing database calibration for ${numPlayers}P (Local or missing/placeholder credentials).`);
    return null;
  }

  const dbData = await fetchCalibrationFromDb(numPlayers);
  if (!dbData) return null;

  if (dbData.hotspots && Object.keys(dbData.hotspots).length > 0) {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(dbData.hotspots));
    } catch (e) {}
  }
  if (dbData.perspective_offsets && Object.keys(dbData.perspective_offsets).length > 0) {
    try {
      localStorage.setItem(offsetStorageKey, JSON.stringify(dbData.perspective_offsets));
    } catch (e) {}
  }
  return dbData;
};

export const persistDraft = async (numPlayers, calibratedPositions, perspectiveOffsets, localStorageKey, offsetStorageKey) => {
  localStorage.setItem(localStorageKey, JSON.stringify(calibratedPositions));
  localStorage.setItem(offsetStorageKey, JSON.stringify(perspectiveOffsets));

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isDbSyncEnabled()) {
    await saveCalibrationToDb(numPlayers, calibratedPositions, perspectiveOffsets);
    return `💾 Saved to DB & Local Drafts at ${nowStr}!`;
  }
  return `💾 Saved to Local Drafts (DB bypassed) at ${nowStr}!`;
};

export const resetDraft = async (numPlayers, localStorageKey, offsetStorageKey) => {
  localStorage.removeItem(localStorageKey);
  localStorage.removeItem(offsetStorageKey);

  if (isDbSyncEnabled()) {
    await deleteCalibrationFromDb(numPlayers);
  }
  return isDbSyncEnabled()
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

  if (isDbSyncEnabled()) {
    await saveCalibrationToDb(numPlayers, nextHotspots, nextOffsets);
  }
  return { nextHotspots, nextOffsets, dbSynced: isDbSyncEnabled() };
};
