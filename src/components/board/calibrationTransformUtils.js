// Pure spot transformation calculation utilities for calibration mode

export const calculateRotatedSpots = (prevCal, activeHotspots, targetKeys, deltaAngle) => {
  const nextCal = { ...prevCal };
  let lastRot = null;
  targetKeys.forEach(locKey => {
    const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prevCal[locKey] || {}) };
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
  return { nextCal, lastRot };
};

export const calculateExactAngleSpots = (prevCal, activeHotspots, targetKeys, angleVal) => {
  const parsed = parseFloat(angleVal);
  if (isNaN(parsed)) return prevCal;
  const angleNum = Math.round(((parsed % 360) + 360) % 360);
  const nextCal = { ...prevCal };
  targetKeys.forEach(locKey => {
    const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prevCal[locKey] || {}) };
    const scale = current.scale !== undefined ? current.scale : 1.0;
    nextCal[locKey] = {
      ...current,
      rot: angleNum,
      scale,
      transform: `translate(-50%, -50%) rotate(${angleNum}deg) scale(${scale})`
    };
  });
  return nextCal;
};

export const calculateScaledSpots = (prevCal, activeHotspots, targetKeys, deltaScale) => {
  const nextCal = { ...prevCal };
  let lastScale = null;
  targetKeys.forEach(locKey => {
    const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prevCal[locKey] || {}) };
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
  return { nextCal, lastScale };
};

export const calculateExactScaleSpots = (prevCal, activeHotspots, targetKeys, scaleVal) => {
  const parsed = parseFloat(scaleVal);
  if (isNaN(parsed)) return prevCal;
  let scaleNum = parseFloat((parsed / 100).toFixed(2));
  if (scaleNum < 0.3) scaleNum = 0.3;
  if (scaleNum > 3.0) scaleNum = 3.0;

  const nextCal = { ...prevCal };
  targetKeys.forEach(locKey => {
    const current = { ...((activeHotspots && activeHotspots[locKey]) || {}), ...(prevCal[locKey] || {}) };
    let rot = current.rot !== undefined ? current.rot : 0;
    nextCal[locKey] = {
      ...current,
      rot,
      scale: scaleNum,
      transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scaleNum})`
    };
  });
  return nextCal;
};

export const calculateNudgedSpotsPixels = (prevCal, activeHotspots, targetKeys, dxPx, dyPx) => {
  const containerEl = document.querySelector('.board-image-overlay-container');
  const width = (containerEl && containerEl.offsetWidth) || 1000;
  const height = (containerEl && containerEl.offsetHeight) || 1000;

  const percentDx = (dxPx / width) * 100;
  const percentDy = (dyPx / height) * 100;

  const nextCal = { ...prevCal };
  targetKeys.forEach(k => {
    const current = { ...((activeHotspots && activeHotspots[k]) || {}), ...(prevCal[k] || {}) };
    const startLeft = parseFloat(current.left || '50');
    const startTop = parseFloat(current.top || '50');
    nextCal[k] = {
      ...current,
      left: `${(startLeft + percentDx).toFixed(2)}%`,
      top: `${(startTop + percentDy).toFixed(2)}%`
    };
  });
  return nextCal;
};

export const calculateRotatedSpotsAroundCenter = (prevCal, activeHotspots, targetKeys, deltaAngle) => {
  const rad = (deltaAngle * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  const nextCal = { ...prevCal };
  targetKeys.forEach(k => {
    const current = { ...((activeHotspots && activeHotspots[k]) || {}), ...(prevCal[k] || {}) };
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
};
