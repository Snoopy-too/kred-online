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

export const loadLocalCalibrationCache = () => ({ hotspots: null, offsets: null });

export const syncCalibrationFromDb = async () => null;

export const persistDraft = async () => {
  return 'Use Copy JSON to export calibration coordinates.';
};

export const resetDraft = async (numPlayers, localStorageKey, offsetStorageKey) => {
  try {
    localStorage.removeItem(localStorageKey);
    localStorage.removeItem(offsetStorageKey);
  } catch {}
  return '🗑️ Calibration Reset to Master Defaults!';
};

export const importCalibrationJson = async (jsonString) => {
  const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON object');

  const importedHotspots = (parsed.hotspots && typeof parsed.hotspots === 'object') ? parsed.hotspots : parsed;
  const importedOffsets = (parsed.perspectiveOffsets && typeof parsed.perspectiveOffsets === 'object') ? parsed.perspectiveOffsets : null;

  const nextHotspots = (importedHotspots && Object.keys(importedHotspots).length > 0) ? importedHotspots : {};
  const nextOffsets = (importedOffsets && Object.keys(importedOffsets).length > 0) ? importedOffsets : {};

  return { nextHotspots, nextOffsets, dbSynced: false };
};
