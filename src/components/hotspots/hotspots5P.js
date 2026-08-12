import { generateCommunityHotspots } from './geometryUtils.js';

export function get5PHotspots() {
  const hotspots = {};
  const cx = 48, cy = 48;
  const angles = { p1: 342, p2: 270, p3: 198, p4: 126, p5: 54 };
  const rSeat = 17, rRostrum = 23, rOffice = 32;

  Object.entries(angles).forEach(([pKey, baseAngle]) => {
    const getPt = (r, degOffset) => {
      const rad = (baseAngle + degOffset) * Math.PI / 180;
      return {
        left: `${(cx + r * Math.sin(rad)).toFixed(2)}%`,
        top: `${(cy - r * Math.cos(rad)).toFixed(2)}%`
      };
    };

    hotspots[`${pKey}_office`] = getPt(rOffice, 0);
    hotspots[`${pKey}_rostrum1`] = getPt(rRostrum, -20);
    hotspots[`${pKey}_rostrum2`] = getPt(rRostrum, 20);

    const seatOffsets = [-36, -21.6, -7.2, 7.2, 21.6, 36];
    seatOffsets.forEach((off, i) => {
      hotspots[`${pKey}_seat${i + 1}`] = getPt(rSeat, off);
    });

    for (let b = 1; b <= 5; b++) {
      const bankOffset = -10 + (b - 1) * 5;
      hotspots[`${pKey}_bank${b}`] = getPt(rOffice + 5, bankOffset);
    }

    const dt = getPt(rOffice + 10, 0);
    dt.transform = `translate(-50%, -50%) rotate(${baseAngle}deg)`;
    hotspots[`${pKey}_dropTile`] = dt;

    const cred = getPt(rOffice + 8, -25);
    cred.rot = 0;
    cred.scale = 1.5;
    cred.transform = `translate(-50%, -50%) rotate(0deg) scale(1.5)`;
    hotspots[`${pKey}_cred`] = cred;
  });

  Object.assign(hotspots, generateCommunityHotspots(30, 48, 48));
  hotspots["community_target"] = { "left": "48.00%", "top": "48.00%", "rot": 0, "scale": 1, "transform": "translate(-50%, -50%) rotate(0deg) scale(1)" };
  return hotspots;
}
