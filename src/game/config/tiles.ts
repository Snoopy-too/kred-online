/**
 * Tile Configuration
 * Defines tile images and Kredcoin values
 */

import { TOTAL_TILES } from './constants';

/**
 * Tile image URLs (tiles 01-24)
 */
export const TILE_IMAGE_URLS = Array.from({ length: TOTAL_TILES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `./images/${num}.svg`;
});

/**
 * Kredcoin value for each tile
 */
export const TILE_KREDCOIN_VALUES: { [key: number]: number } = {
  1: 1,
  2: 2,
  3: 0,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
  8: 5,
  9: 1,
  10: 2,
  11: 4,
  12: 5,
  13: 5,
  14: 6,
  15: 3,
  16: 4,
  17: 3,
  18: 4,
  19: 6,
  20: 7,
  21: 8,
  22: 7,
  23: 8,
  24: 9,
  // Blank tile (if needed) = 0
};
