/**
 * Board Layouts - Central Export
 * Drop locations for all player count configurations
 */

import { DropLocation } from '../../types';
import { THREE_PLAYER_DROP_LOCATIONS } from './three-player';
import { FOUR_PLAYER_DROP_LOCATIONS } from './four-player';
import { FIVE_PLAYER_DROP_LOCATIONS } from './five-player';

/**
 * All drop locations organized by player count
 */
export const DROP_LOCATIONS_BY_PLAYER_COUNT: {
  [playerCount: number]: DropLocation[];
} = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};

// Re-export individual layouts
export { THREE_PLAYER_DROP_LOCATIONS } from './three-player';
export { FOUR_PLAYER_DROP_LOCATIONS } from './four-player';
export { FIVE_PLAYER_DROP_LOCATIONS } from './five-player';
