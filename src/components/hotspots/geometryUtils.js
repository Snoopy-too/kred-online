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
