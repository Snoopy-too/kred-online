/**
 * Board Configuration
 * Defines tile receiving spaces, bank spaces, and credibility display locations
 */

import { TileReceivingSpace, BankSpace } from '../types';

// --- Tile Receiving Spaces ---

const THREE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 15.30, top: 44.76 }, rotation: 168.0 },
  { ownerId: 2, position: { left: 75.42, top: 15.71 }, rotation: 288.0 },
  { ownerId: 3, position: { left: 68.51, top: 75.24 }, rotation: 48.0 },
];

const FOUR_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 10.57, top: 52.44 }, rotation: 157.0 },
  { ownerId: 2, position: { left: 48.91, top: 13.18 }, rotation: 247.0 },
  { ownerId: 3, position: { left: 89.11, top: 48.14 }, rotation: 337.0 },
  { ownerId: 4, position: { left: 52.34, top: 88.09 }, rotation: 67.0 },
];

const FIVE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 14.64, top: 72.07 }, rotation: 93.0 },
  { ownerId: 2, position: { left: 11.93, top: 25.49 }, rotation: 165.0 },
  { ownerId: 3, position: { left: 58.59, top: 8.50 }, rotation: 237.0 },
  { ownerId: 4, position: { left: 89.53, top: 44.43 }, rotation: 309.0 },
  { ownerId: 5, position: { left: 63.07, top: 83.98 }, rotation: 21.0 },
];

export const TILE_SPACES_BY_PLAYER_COUNT: { [key: number]: TileReceivingSpace[] } = {
  3: THREE_PLAYER_TILE_SPACES,
  4: FOUR_PLAYER_TILE_SPACES,
  5: FIVE_PLAYER_TILE_SPACES,
};

// --- Bank Spaces for Storing Received Tiles ---

const THREE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 42.11, top: 16.04 }, rotation: 181.00 },
  { ownerId: 1, position: { left: 37.11, top: 16.04 }, rotation: 181.00 },
  { ownerId: 1, position: { left: 32.61, top: 16.04 }, rotation: 181.00 },
  { ownerId: 1, position: { left: 28.11, top: 16.04 }, rotation: 181.00 },
  { ownerId: 1, position: { left: 21.61, top: 22.54 }, rotation: 90.00 },
  { ownerId: 1, position: { left: 21.61, top: 27.04 }, rotation: 90.00 },
  { ownerId: 1, position: { left: 21.61, top: 31.54 }, rotation: 90.00 },
  { ownerId: 1, position: { left: 21.61, top: 36.04 }, rotation: 90.00 },
  // Player 2
  { ownerId: 2, position: { left: 79.70, top: 50.48 }, rotation: 300.00 },
  { ownerId: 2, position: { left: 82.20, top: 46.48 }, rotation: 300.00 },
  { ownerId: 2, position: { left: 84.20, top: 42.48 }, rotation: 300.00 },
  { ownerId: 2, position: { left: 87.20, top: 38.98 }, rotation: 300.00 },
  { ownerId: 2, position: { left: 84.12, top: 30.24 }, rotation: 211.00 },
  { ownerId: 2, position: { left: 80.12, top: 27.74 }, rotation: 211.00 },
  { ownerId: 2, position: { left: 76.12, top: 25.24 }, rotation: 211.00 },
  { ownerId: 2, position: { left: 72.62, top: 23.24 }, rotation: 211.00 },
  // Player 3
  { ownerId: 3, position: { left: 30.70, top: 65.75 }, rotation: 60.00 },
  { ownerId: 3, position: { left: 33.20, top: 70.25 }, rotation: 60.00 },
  { ownerId: 3, position: { left: 35.20, top: 74.25 }, rotation: 60.00 },
  { ownerId: 3, position: { left: 37.20, top: 77.75 }, rotation: 60.00 },
  { ownerId: 3, position: { left: 46.07, top: 80.82 }, rotation: 330.00 },
  { ownerId: 3, position: { left: 50.07, top: 77.82 }, rotation: 330.00 },
  { ownerId: 3, position: { left: 54.04, top: 75.88 }, rotation: 330.00 },
  { ownerId: 3, position: { left: 58.04, top: 73.38 }, rotation: 330.00 },
];

const FOUR_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 31.76, top: 21.38 }, rotation: 141.00 },
  { ownerId: 1, position: { left: 27.93, top: 24.30 }, rotation: 141.00 },
  { ownerId: 1, position: { left: 24.22, top: 27.45 }, rotation: 141.00 },
  { ownerId: 1, position: { left: 20.72, top: 29.95 }, rotation: 141.00 },
  { ownerId: 1, position: { left: 17.22, top: 32.45 }, rotation: 141.00 },
  { ownerId: 1, position: { left: 13.72, top: 35.45 }, rotation: 141.00 },
  // Player 2
  { ownerId: 2, position: { left: 81.72, top: 33.79 }, rotation: 231.00 },
  { ownerId: 2, position: { left: 78.18, top: 30.18 }, rotation: 231.00 },
  { ownerId: 2, position: { left: 75.68, top: 26.68 }, rotation: 231.00 },
  { ownerId: 2, position: { left: 72.68, top: 23.68 }, rotation: 231.00 },
  { ownerId: 2, position: { left: 69.68, top: 20.18 }, rotation: 231.00 },
  { ownerId: 2, position: { left: 67.18, top: 16.68 }, rotation: 231.00 },
  // Player 3
  { ownerId: 3, position: { left: 68.39, top: 80.76 }, rotation: 321.00 },
  { ownerId: 3, position: { left: 72.26, top: 77.63 }, rotation: 321.00 },
  { ownerId: 3, position: { left: 76.07, top: 74.79 }, rotation: 321.00 },
  { ownerId: 3, position: { left: 79.01, top: 72.17 }, rotation: 321.00 },
  { ownerId: 3, position: { left: 82.95, top: 69.64 }, rotation: 321.00 },
  { ownerId: 3, position: { left: 86.51, top: 66.77 }, rotation: 321.00 },
  // Player 4
  { ownerId: 4, position: { left: 18.80, top: 67.97 }, rotation: 52.00 },
  { ownerId: 4, position: { left: 21.64, top: 71.57 }, rotation: 51.00 },
  { ownerId: 4, position: { left: 24.53, top: 75.11 }, rotation: 51.00 },
  { ownerId: 4, position: { left: 27.47, top: 78.52 }, rotation: 51.00 },
  { ownerId: 4, position: { left: 30.24, top: 81.93 }, rotation: 51.00 },
  { ownerId: 4, position: { left: 33.20, top: 85.06 }, rotation: 51.00 },
];

const FIVE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 7.86, top: 51.17 }, rotation: 49.00 },
  { ownerId: 1, position: { left: 10.86, top: 54.17 }, rotation: 49.00 },
  { ownerId: 1, position: { left: 12.86, top: 56.67 }, rotation: 49.00 },
  { ownerId: 1, position: { left: 15.86, top: 59.67 }, rotation: 49.00 },
  { ownerId: 1, position: { left: 18.86, top: 62.67 }, rotation: 49.00 },
  // Player 2
  { ownerId: 2, position: { left: 31.05, top: 12.46 }, rotation: 119.00 },
  { ownerId: 2, position: { left: 29.05, top: 16.46 }, rotation: 119.00 },
  { ownerId: 2, position: { left: 27.03, top: 19.24 }, rotation: 119.00 },
  { ownerId: 2, position: { left: 24.97, top: 22.75 }, rotation: 119.00 },
  { ownerId: 2, position: { left: 22.97, top: 25.75 }, rotation: 119.00 },
  // Player 3
  { ownerId: 3, position: { left: 77.86, top: 21.19 }, rotation: 193.00 },
  { ownerId: 3, position: { left: 73.59, top: 20.51 }, rotation: 193.00 },
  { ownerId: 3, position: { left: 69.64, top: 19.93 }, rotation: 193.00 },
  { ownerId: 3, position: { left: 65.68, top: 18.85 }, rotation: 193.00 },
  { ownerId: 3, position: { left: 61.84, top: 18.05 }, rotation: 193.00 },
  // Player 4
  { ownerId: 4, position: { left: 82.82, top: 65.82 }, rotation: 265.00 },
  { ownerId: 4, position: { left: 82.34, top: 62.01 }, rotation: 265.00 },
  { ownerId: 4, position: { left: 82.11, top: 58.21 }, rotation: 265.00 },
  { ownerId: 4, position: { left: 81.61, top: 54.79 }, rotation: 265.00 },
  { ownerId: 4, position: { left: 81.32, top: 51.07 }, rotation: 265.00 },
  // Player 5
  { ownerId: 5, position: { left: 39.82, top: 84.18 }, rotation: 335.00 },
  { ownerId: 5, position: { left: 43.20, top: 82.71 }, rotation: 335.00 },
  { ownerId: 5, position: { left: 47.14, top: 81.15 }, rotation: 335.00 },
  { ownerId: 5, position: { left: 50.47, top: 79.99 }, rotation: 335.00 },
  { ownerId: 5, position: { left: 54.43, top: 78.31 }, rotation: 335.00 },
];

export const BANK_SPACES_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
  3: THREE_PLAYER_BANK_SPACES,
  4: FOUR_PLAYER_BANK_SPACES,
  5: FIVE_PLAYER_BANK_SPACES,
};

// --- Credibility Display Locations ---

const THREE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  { ownerId: 1, position: { left: 21.18, top: 15.35 }, rotation: -35.00 },
  { ownerId: 2, position: { left: 90.30, top: 33.16 }, rotation: 75.00 },
  { ownerId: 3, position: { left: 40.45, top: 83.68 }, rotation: 200.00 },
];

const FOUR_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  { ownerId: 1, position: { left: 15.97, top: 20.64 }, rotation: -34.00 },
  { ownerId: 2, position: { left: 82.95, top: 18.65 }, rotation: 51.00 },
  { ownerId: 3, position: { left: 84.62, top: 82.16 }, rotation: 136.00 },
  { ownerId: 4, position: { left: 17.53, top: 83.04 }, rotation: -129.00 },
];

const FIVE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  { ownerId: 1, position: { left: 8.11, top: 63.80 }, rotation: 224.00 },
  { ownerId: 2, position: { left: 18.06, top: 16.34 }, rotation: -45.00 },
  { ownerId: 3, position: { left: 69.62, top: 11.07 }, rotation: 15.00 },
  { ownerId: 4, position: { left: 91.28, top: 55.40 }, rotation: 74.00 },
  { ownerId: 5, position: { left: 52.95, top: 88.41 }, rotation: 164.00 },
];

export const CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
  3: THREE_PLAYER_CREDIBILITY_LOCATIONS,
  4: FOUR_PLAYER_CREDIBILITY_LOCATIONS,
  5: FIVE_PLAYER_CREDIBILITY_LOCATIONS,
};
