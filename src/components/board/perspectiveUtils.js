/**
 * Calculates the board container CSS rotation (in degrees) required to orient 
 * the target playerID's domain at the bottom of the screen ("in front of them").
 * 
 * @param {number} numPlayers - 3, 4, or 5
 * @param {string|number} playerID - 0-indexed player ID string or number
 * @returns {number} rotation angle in degrees
 */
export function getPerspectiveRotation(numPlayers, playerID) {
  if (playerID === null || playerID === undefined || playerID === '') return 0;
  const pStr = String(playerID);

  if (numPlayers === 3) {
    const map = { '0': 240, '1': 120, '2': 0 };
    return map[pStr] ?? 0;
  }

  if (numPlayers === 4) {
    const map = { '0': 180, '1': 90, '2': 0, '3': 270 };
    return map[pStr] ?? 0;
  }

  if (numPlayers === 5) {
    const map = { '0': 198, '1': 270, '2': 342, '3': 54, '4': 126 };
    return map[pStr] ?? 0;
  }

  return 0;
}

export const DEFAULT_PERSPECTIVE_OFFSETS = {
  3: {
    0: { x: 15, y: -12 },
    1: { x: 1, y: -1 },
    2: { x: 17, y: 5 }
  },
  4: {
    0: { x: 0, y: 0 },
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
    3: { x: 0, y: 0 }
  },
  5: {
    0: { x: 0, y: 0 },
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
    3: { x: 0, y: 0 },
    4: { x: 0, y: 0 }
  }
};

export function getPerspectiveTransform(numPlayers, playerID, customOffsets = {}, zoomLevel = 1) {
  const rot = getPerspectiveRotation(numPlayers, playerID);
  const pStr = playerID !== null && playerID !== undefined && playerID !== '' ? String(playerID) : '0';
  const pNum = parseInt(pStr, 10);
  
  const def = DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[pNum] || { x: 0, y: 0 };
  const custom = customOffsets[pNum] || def;
  let rawX = custom.x !== undefined ? custom.x : def.x;
  let rawY = custom.y !== undefined ? custom.y : def.y;
  let customRot = custom.r !== undefined ? custom.r : 0;

  // Sanitize legacy pixel values from older localStorage drafts (e.g. > 45 or < -45)
  if (typeof rawX === 'number' && (rawX > 45 || rawX < -45)) {
    rawX = def.x;
  }
  if (typeof rawY === 'number' && (rawY > 45 || rawY < -45)) {
    rawY = def.y;
  }

  const unitX = typeof rawX === 'string' ? rawX : `${rawX}%`;
  const unitY = typeof rawY === 'string' ? rawY : `${rawY}%`;

  const finalRot = rot + customRot;

  return `translate(${unitX}, ${unitY}) rotate(${finalRot}deg) scale(${zoomLevel})`;
}
