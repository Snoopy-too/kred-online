import { get3PHotspots } from './hotspots/hotspots3P.js';
import { get4PHotspots, get5PHotspots } from './hotspots/hotspots4P5P.js';

export const computeHotspots = (numPlayers) => {
  if (numPlayers === 4) {
    return get4PHotspots();
  } else if (numPlayers === 5) {
    return get5PHotspots();
  }
  // Default to 3-player layout
  return get3PHotspots();
};
