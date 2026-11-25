export function generateCommunityHotspots(count, cx = 49, cy = 49) {
  const comm = {};
  const rings = [
    { radius: 4.5, capacity: 6 },
    { radius: 10, capacity: 12 },
    { radius: 15.5, capacity: 18 }
  ];

  let currentSpot = 1;
  for (const ring of rings) {
    if (currentSpot > count) break;
    const numInRing = Math.min(ring.capacity, count - currentSpot + 1);
    for (let i = 0; i < numInRing; i++) {
      const angleDeg = (i / numInRing) * 360 - 90;
      const rad = (angleDeg * Math.PI) / 180;
      const left = (cx + ring.radius * Math.cos(rad)).toFixed(2);
      const top = (cy + ring.radius * Math.sin(rad)).toFixed(2);

      comm[`community_${currentSpot}`] = {
        left: `${left}%`,
        top: `${top}%`,
        rot: 0,
        scale: 1,
        transform: "translate(-50%, -50%) rotate(0deg) scale(1)"
      };
      currentSpot++;
    }
  }
  return comm;
}

export function getCommunityAreaDiameterPct(activeHotspots) {
  const ct = activeHotspots?.community_target || { left: '50%', top: '50%' };
  const cx = parseFloat(ct.left) || 50;
  const cy = parseFloat(ct.top) || 50;
  let maxCommR = 0;
  let minSeatR = Infinity;

  for (const [k, v] of Object.entries(activeHotspots || {})) {
    const x = parseFloat(v.left);
    const y = parseFloat(v.top);
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    const d = Math.hypot(x - cx, y - cy);
    if (/^community_\d+$/.test(k)) maxCommR = Math.max(maxCommR, d);
    else if (/_seat\d+$/.test(k)) minSeatR = Math.min(minSeatR, d);
  }

  const padR = maxCommR > 0 ? maxCommR + 2.5 : 12;
  const cappedR = minSeatR < Infinity ? Math.min(padR, minSeatR - 3) : padR;
  return Math.max(18, cappedR * 2);
}

export function findNearestEmptyCommunitySpot(dropX, dropY, activeHotspots, boardState) {
  let bestKey = null;
  let bestDist = Infinity;

  for (const [k, v] of Object.entries(activeHotspots || {})) {
    if (!/^community_\d+$/.test(k)) continue;
    if (boardState && boardState[k] != null) continue;
    const x = parseFloat(v.left);
    const y = parseFloat(v.top);
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    const d = Math.hypot(x - dropX, y - dropY);
    if (d < bestDist) {
      bestDist = d;
      bestKey = k;
    }
  }
  return bestKey;
}
