/**
 * Board Layout Configuration
 *
 * Purpose: Defines all valid drop locations, tile spaces, bank spaces, and credibility
 *          locations for different player counts (3, 4, 5 players)
 * Dependencies: Types from src/types
 *
 * @module config/board
 */

import type { DropLocation, TileReceivingSpace, BankSpace } from "../types";

// These are the ONLY valid drop locations for pieces.
const THREE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: "p1_seat1", position: { left: 48.25, top: 29.91 } },
  { id: "p1_seat2", position: { left: 43.87, top: 32.62 } },
  { id: "p1_seat3", position: { left: 39.96, top: 35.65 } },
  { id: "p1_seat4", position: { left: 38.17, top: 39.19 } },
  { id: "p1_seat5", position: { left: 37.3, top: 43.94 } },
  { id: "p1_seat6", position: { left: 37.73, top: 48.54 } },
  // Player 3 Seats
  { id: "p3_seat1", position: { left: 40.17, top: 53.08 } },
  { id: "p3_seat2", position: { left: 44.01, top: 56.13 } },
  { id: "p3_seat3", position: { left: 48.46, top: 58.4 } },
  { id: "p3_seat4", position: { left: 52.92, top: 58.18 } },
  { id: "p3_seat5", position: { left: 57.71, top: 56.27 } },
  { id: "p3_seat6", position: { left: 60.96, top: 53.51 } },
  // Player 2 Seats
  { id: "p2_seat1", position: { left: 63.98, top: 48.83 } },
  { id: "p2_seat2", position: { left: 64.61, top: 44.16 } },
  { id: "p2_seat3", position: { left: 63.76, top: 39.48 } },
  { id: "p2_seat4", position: { left: 61.83, top: 35.25 } },
  { id: "p2_seat5", position: { left: 57.39, top: 32.89 } },
  { id: "p2_seat6", position: { left: 53.51, top: 30.86 } },
  // Rostrums
  { id: "p1_rostrum1", position: { left: 46.64, top: 22.25 } },
  { id: "p1_rostrum2", position: { left: 29.84, top: 51.31 } },
  { id: "p3_rostrum1", position: { left: 35.89, top: 59.51 } },
  { id: "p3_rostrum2", position: { left: 66.07, top: 58.91 } },
  { id: "p2_rostrum1", position: { left: 72.2, top: 52.48 } },
  { id: "p2_rostrum2", position: { left: 54.82, top: 22.39 } },
  // Offices
  { id: "p1_office", position: { left: 31.95, top: 25.01 } },
  { id: "p2_office", position: { left: 76.22, top: 36.38 } },
  { id: "p3_office", position: { left: 44.03, top: 68.87 } },
  // Community (18 spaces with proper spacing - no overlap with seats)
  // Middle row (top: 46.0-47.8%)
  { id: "community1", position: { left: 53.5, top: 47.8 } },
  { id: "community2", position: { left: 43.7, top: 47.7 } },
  { id: "community3", position: { left: 57.0, top: 46.0 } },
  // Top row (top: 38.0%)
  { id: "community4", position: { left: 45.2, top: 38.0 } },
  { id: "community5", position: { left: 48.7, top: 38.0 } },
  { id: "community6", position: { left: 52.2, top: 38.0 } },
  { id: "community7", position: { left: 55.7, top: 38.0 } },
  // Second row (top: 42.0%)
  { id: "community8", position: { left: 45.2, top: 42.0 } },
  { id: "community9", position: { left: 48.7, top: 42.0 } },
  { id: "community10", position: { left: 52.2, top: 42.0 } },
  { id: "community11", position: { left: 55.7, top: 42.0 } },
  { id: "community12", position: { left: 50.4, top: 46.0 } },
  // Bottom row (top: 50.0%)
  { id: "community13", position: { left: 46.9, top: 50.0 } },
  { id: "community14", position: { left: 50.4, top: 50.0 } },
  { id: "community15", position: { left: 53.9, top: 50.0 } },
  // Additional locations
  { id: "community16", position: { left: 43.78, top: 44.51 } },
  { id: "community17", position: { left: 42.53, top: 42.85 } },
  { id: "community18", position: { left: 56.7, top: 49.51 } },
];

const FOUR_PLAYER_DROP_LOCATIONS: DropLocation[] = [
      { id: "p1_seat1", position: { left: 36.87, top: 39.26 } },
      { id: "p1_seat2", position: { left: 35.30, top: 43.16 } },
      { id: "p1_seat3", position: { left: 34.33, top: 47.17 } },
      { id: "p1_seat4", position: { left: 34.03, top: 51.17 } },
      { id: "p1_seat5", position: { left: 35.21, top: 54.98 } },
      { id: "p1_seat6", position: { left: 36.96, top: 59.48 } },
      { id: "p2_seat1", position: { left: 60.01, top: 36.43 } },
      { id: "p2_seat2", position: { left: 56.01, top: 34.67 } },
      { id: "p2_seat3", position: { left: 52.00, top: 33.50 } },
      { id: "p2_seat4", position: { left: 48.10, top: 33.40 } },
      { id: "p2_seat5", position: { left: 44.19, top: 34.57 } },
      { id: "p2_seat6", position: { left: 40.28, top: 36.82 } },
      { id: "p3_seat1", position: { left: 62.94, top: 59.18 } },
      { id: "p3_seat2", position: { left: 64.79, top: 55.18 } },
      { id: "p3_seat3", position: { left: 65.87, top: 51.07 } },
      { id: "p3_seat4", position: { left: 65.87, top: 47.07 } },
      { id: "p3_seat5", position: { left: 64.50, top: 42.97 } },
      { id: "p3_seat6", position: { left: 62.84, top: 39.26 } },
      { id: "p4_seat1", position: { left: 39.69, top: 62.51 } },
      { id: "p4_seat2", position: { left: 44.09, top: 64.27 } },
      { id: "p4_seat3", position: { left: 48.19, top: 65.64 } },
      { id: "p4_seat4", position: { left: 52.20, top: 65.44 } },
      { id: "p4_seat5", position: { left: 56.01, top: 64.27 } },
      { id: "p4_seat6", position: { left: 59.81, top: 62.42 } },
      { id: "p1_rostrum1", position: { left: 31.40, top: 34.77 } },
      { id: "p1_rostrum2", position: { left: 31.79, top: 63.87 } },
      { id: "p2_rostrum1", position: { left: 64.31, top: 31.15 } },
      { id: "p2_rostrum2", position: { left: 35.89, top: 31.05 } },
      { id: "p3_rostrum1", position: { left: 68.41, top: 63.57 } },
      { id: "p3_rostrum2", position: { left: 68.60, top: 34.57 } },
      { id: "p4_rostrum1", position: { left: 35.79, top: 67.68 } },
      { id: "p4_rostrum2", position: { left: 64.31, top: 67.19 } },
      { id: "p1_office", position: { left: 23.39, top: 58.20 } },
      { id: "p2_office", position: { left: 40.97, top: 22.36 } },
      { id: "p3_office", position: { left: 76.71, top: 40.04 } },
      { id: "p4_office", position: { left: 59.23, top: 75.98 } },
    ];

const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats (pushed 2% outward from center for better spacing)
  { id: "p1_seat1", position: { left: 29.48, top: 44.06 } },
  { id: "p1_seat2", position: { left: 29.4, top: 47.67 } },
  { id: "p1_seat3", position: { left: 29.52, top: 51.79 } },
  { id: "p1_seat4", position: { left: 31.25, top: 54.83 } },
  { id: "p1_seat5", position: { left: 33.33, top: 58.19 } },
  { id: "p1_seat6", position: { left: 36.33, top: 60.69 } },
  // Player 2 Seats
  { id: "p2_seat1", position: { left: 45.22, top: 29.89 } },
  { id: "p2_seat2", position: { left: 41.42, top: 30.76 } },
  { id: "p2_seat3", position: { left: 38.06, top: 32.07 } },
  { id: "p2_seat4", position: { left: 34.6, top: 34.12 } },
  { id: "p2_seat5", position: { left: 32.85, top: 37.7 } },
  { id: "p2_seat6", position: { left: 29.56, top: 40.64 } },
  // Player 3 Seats
  { id: "p3_seat1", position: { left: 64.67, top: 39.1 } },
  { id: "p3_seat2", position: { left: 62.59, top: 35.96 } },
  { id: "p3_seat3", position: { left: 59.41, top: 32.49 } },
  { id: "p3_seat4", position: { left: 56.34, top: 31.2 } },
  { id: "p3_seat5", position: { left: 52.8, top: 29.57 } },
  { id: "p3_seat6", position: { left: 49.06, top: 29.24 } },
  // Player 4 Seats
  { id: "p4_seat1", position: { left: 60.93, top: 59.49 } },
  { id: "p4_seat2", position: { left: 63.28, top: 56.67 } },
  { id: "p4_seat3", position: { left: 65.38, top: 53.53 } },
  { id: "p4_seat4", position: { left: 66.52, top: 50.17 } },
  { id: "p4_seat5", position: { left: 66.52, top: 46.05 } },
  { id: "p4_seat6", position: { left: 65.71, top: 42.47 } },
  // Player 5 Seats
  { id: "p5_seat1", position: { left: 39.34, top: 62.96 } },
  { id: "p5_seat2", position: { left: 42.93, top: 64.04 } },
  { id: "p5_seat3", position: { left: 46.75, top: 65.24 } },
  { id: "p5_seat4", position: { left: 50.8, top: 65.35 } },
  { id: "p5_seat5", position: { left: 54.96, top: 63.72 } },
  { id: "p5_seat6", position: { left: 58.31, top: 61.88 } },
  // Rostrums
  { id: "p1_rostrum1", position: { left: 24.89, top: 45.32 } },
  { id: "p1_rostrum2", position: { left: 31.85, top: 62.83 } },
  { id: "p2_rostrum1", position: { left: 42.56, top: 26.12 } },
  { id: "p2_rostrum2", position: { left: 27.08, top: 37.39 } },
  { id: "p3_rostrum1", position: { left: 67.86, top: 35.44 } },
  { id: "p3_rostrum2", position: { left: 51.37, top: 25.22 } },
  { id: "p4_rostrum1", position: { left: 65.36, top: 61.27 } },
  { id: "p4_rostrum2", position: { left: 70.77, top: 43.3 } },
  { id: "p5_rostrum1", position: { left: 39.17, top: 67.54 } },
  { id: "p5_rostrum2", position: { left: 58.79, top: 66.69 } },
  // Offices
  { id: "p1_office", position: { left: 15.7, top: 44.75 } },
  { id: "p2_office", position: { left: 39.45, top: 17.1 } },
  { id: "p3_office", position: { left: 75.18, top: 29.31 } },
  { id: "p4_office", position: { left: 72.89, top: 65.24 } },
  { id: "p5_office", position: { left: 36.22, top: 74.7 } },
  // Community (40 spaces in organized grid - shifted southwest for better centering)
  // Row 1 (top: 39.40)
  { id: "community1", position: { left: 36.5, top: 39.4 } },
  { id: "community2", position: { left: 40.0, top: 39.4 } },
  { id: "community3", position: { left: 43.5, top: 39.4 } },
  { id: "community4", position: { left: 47.0, top: 39.4 } },
  { id: "community5", position: { left: 50.5, top: 39.4 } },
  { id: "community6", position: { left: 54.0, top: 39.4 } },
  { id: "community7", position: { left: 57.5, top: 39.4 } },
  // Row 2 (top: 43.40)
  { id: "community8", position: { left: 38.25, top: 43.4 } },
  { id: "community9", position: { left: 41.75, top: 43.4 } },
  { id: "community10", position: { left: 45.25, top: 43.4 } },
  { id: "community11", position: { left: 48.75, top: 43.4 } },
  { id: "community12", position: { left: 52.25, top: 43.4 } },
  { id: "community13", position: { left: 55.75, top: 43.4 } },
  // Row 3 (top: 47.40)
  { id: "community14", position: { left: 36.5, top: 47.4 } },
  { id: "community15", position: { left: 40.0, top: 47.4 } },
  { id: "community16", position: { left: 43.5, top: 47.4 } },
  { id: "community17", position: { left: 47.0, top: 47.4 } },
  { id: "community18", position: { left: 50.5, top: 47.4 } },
  { id: "community19", position: { left: 54.0, top: 47.4 } },
  { id: "community20", position: { left: 57.5, top: 47.4 } },
  // Row 4 (top: 51.40)
  { id: "community21", position: { left: 38.25, top: 51.4 } },
  { id: "community22", position: { left: 41.75, top: 51.4 } },
  { id: "community23", position: { left: 45.25, top: 51.4 } },
  { id: "community24", position: { left: 48.75, top: 51.4 } },
  { id: "community25", position: { left: 52.25, top: 51.4 } },
  { id: "community26", position: { left: 55.75, top: 51.4 } },
  // Row 5 (top: 55.40)
  { id: "community27", position: { left: 36.5, top: 55.4 } },
  { id: "community28", position: { left: 40.0, top: 55.4 } },
  { id: "community29", position: { left: 43.5, top: 55.4 } },
  { id: "community30", position: { left: 47.0, top: 55.4 } },
  { id: "community31", position: { left: 50.5, top: 55.4 } },
  { id: "community32", position: { left: 54.0, top: 55.4 } },
  { id: "community33", position: { left: 57.5, top: 55.4 } },
  // Row 6 (top: 59.40)
  { id: "community34", position: { left: 38.25, top: 59.4 } },
  { id: "community35", position: { left: 41.75, top: 59.4 } },
  { id: "community36", position: { left: 45.25, top: 59.4 } },
  { id: "community37", position: { left: 48.75, top: 59.4 } },
  { id: "community38", position: { left: 52.25, top: 59.4 } },
  { id: "community39", position: { left: 55.75, top: 59.4 } },
  // Extra space (centered at bottom)
  { id: "community40", position: { left: 47.0, top: 62.9 } },
];

export const DROP_LOCATIONS_BY_PLAYER_COUNT: {
  [playerCount: number]: DropLocation[];
} = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};

// Tile receiving spaces - where tiles are placed when played
const THREE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 15.3, top: 44.76 }, rotation: 168.0 },
  { ownerId: 2, position: { left: 75.42, top: 15.71 }, rotation: 288.0 },
  { ownerId: 3, position: { left: 68.51, top: 75.24 }, rotation: 48.0 },
];

const FOUR_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
      { ownerId: 1, position: { left: 24.17, top: 68.64 }, rotation: 126 },
      { ownerId: 2, position: { left: 31.51, top: 24.18 }, rotation: 218 },
      { ownerId: 3, position: { left: 76.01, top: 31.34 }, rotation: 307 },
      { ownerId: 4, position: { left: 68.54, top: 75.89 }, rotation: 37.5 },
    ];

const FIVE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 14.64, top: 72.07 }, rotation: 93.0 },
  { ownerId: 2, position: { left: 11.93, top: 25.49 }, rotation: 165.0 },
  { ownerId: 3, position: { left: 58.59, top: 8.5 }, rotation: 237.0 },
  { ownerId: 4, position: { left: 89.53, top: 44.43 }, rotation: 309.0 },
  { ownerId: 5, position: { left: 63.07, top: 83.98 }, rotation: 21.0 },
];

export const TILE_SPACES_BY_PLAYER_COUNT: {
  [key: number]: TileReceivingSpace[];
} = {
  3: THREE_PLAYER_TILE_SPACES,
  4: FOUR_PLAYER_TILE_SPACES,
  5: FIVE_PLAYER_TILE_SPACES,
};

// Bank spaces for storing received tiles
const THREE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 42.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 37.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 32.61, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 28.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 21.61, top: 22.54 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 27.04 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 31.54 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 36.04 }, rotation: 90.0 },
  // Player 2
  { ownerId: 2, position: { left: 79.7, top: 50.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 82.2, top: 46.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 84.2, top: 42.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 87.2, top: 38.98 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 84.12, top: 30.24 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 80.12, top: 27.74 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 76.12, top: 25.24 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 72.62, top: 23.24 }, rotation: 211.0 },
  // Player 3
  { ownerId: 3, position: { left: 30.7, top: 65.75 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 33.2, top: 70.25 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 35.2, top: 74.25 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 37.2, top: 77.75 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 46.07, top: 80.82 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 50.07, top: 77.82 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 54.04, top: 75.88 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 58.04, top: 73.38 }, rotation: 330.0 },
];

const FOUR_PLAYER_BANK_SPACES: BankSpace[] = [
    { ownerId: 1, position: { left: 22.00, top: 33.32 }, rotation: 110 },
    { ownerId: 1, position: { left: 20.50, top: 37.37 }, rotation: 110 },
    { ownerId: 1, position: { left: 18.96, top: 41.43 }, rotation: 110 },
    { ownerId: 1, position: { left: 17.50, top: 45.30 }, rotation: 110 },
    { ownerId: 1, position: { left: 16.00, top: 49.32 }, rotation: 110 },
    { ownerId: 1, position: { left: 14.60, top: 52.80 }, rotation: 110 },
    { ownerId: 2, position: { left: 66.70, top: 22.20 }, rotation: 202 },
    { ownerId: 2, position: { left: 62.28, top: 20.38 }, rotation: 202 },
    { ownerId: 2, position: { left: 58.28, top: 18.98 }, rotation: 202 },
    { ownerId: 2, position: { left: 54.58, top: 17.48 }, rotation: 202 },
    { ownerId: 2, position: { left: 50.78, top: 15.98 }, rotation: 202 },
    { ownerId: 2, position: { left: 46.98, top: 14.58 }, rotation: 202 },
    { ownerId: 3, position: { left: 78.09, top: 65.76 }, rotation: 291 },
    { ownerId: 3, position: { left: 79.66, top: 61.83 }, rotation: 291 },
    { ownerId: 3, position: { left: 80.97, top: 58.19 }, rotation: 291 },
    { ownerId: 3, position: { left: 82.51, top: 54.47 }, rotation: 291 },
    { ownerId: 3, position: { left: 83.95, top: 50.84 }, rotation: 291 },
    { ownerId: 3, position: { left: 85.41, top: 46.87 }, rotation: 291 },
    { ownerId: 4, position: { left: 34.00, top: 78.07 }, rotation: 21.8 },
    { ownerId: 4, position: { left: 38.24, top: 79.57 }, rotation: 21.8 },
    { ownerId: 4, position: { left: 41.83, top: 80.91 }, rotation: 21.8 },
    { ownerId: 4, position: { left: 46.07, top: 82.72 }, rotation: 21.8 },
    { ownerId: 4, position: { left: 49.04, top: 83.93 }, rotation: 21.8 },
    { ownerId: 4, position: { left: 53.10, top: 85.46 }, rotation: 21.8 },
  ];

const FIVE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 7.86, top: 51.17 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 10.86, top: 54.17 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 12.86, top: 56.67 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 15.86, top: 59.67 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 18.86, top: 62.67 }, rotation: 49.0 },
  // Player 2
  { ownerId: 2, position: { left: 31.05, top: 12.46 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 29.05, top: 16.46 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 27.03, top: 19.24 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 24.97, top: 22.75 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 22.97, top: 25.75 }, rotation: 119.0 },
  // Player 3
  { ownerId: 3, position: { left: 77.86, top: 21.19 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 73.59, top: 20.51 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 69.64, top: 19.93 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 65.68, top: 18.85 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 61.84, top: 18.05 }, rotation: 193.0 },
  // Player 4
  { ownerId: 4, position: { left: 82.82, top: 65.82 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 82.34, top: 62.01 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 82.11, top: 58.21 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 81.61, top: 54.79 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 81.32, top: 51.07 }, rotation: 265.0 },
  // Player 5
  { ownerId: 5, position: { left: 39.82, top: 84.18 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 43.2, top: 82.71 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 47.14, top: 81.15 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 50.47, top: 79.99 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 54.43, top: 78.31 }, rotation: 335.0 },
];

export const BANK_SPACES_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
  3: THREE_PLAYER_BANK_SPACES,
  4: FOUR_PLAYER_BANK_SPACES,
  5: FIVE_PLAYER_BANK_SPACES,
};

// Credibility locations - one per player to display credibility currency
const THREE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  // Player 1: 21.18/15.35, rotation: -35.0°
  { ownerId: 1, position: { left: 21.18, top: 15.35 }, rotation: -35.0 },
  // Player 2: 90.30/33.16, rotation: 75.0°
  { ownerId: 2, position: { left: 90.3, top: 33.16 }, rotation: 75.0 },
  // Player 3: 40.45/83.68, rotation: 200.0°
  { ownerId: 3, position: { left: 40.45, top: 83.68 }, rotation: 200.0 },
];

const FOUR_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
    { ownerId: 1, position: { left: 8.15, top: 39.33 }, rotation: -67.2 },
    { ownerId: 2, position: { left: 60.00, top: 8.25 }, rotation: 21.2 },
    { ownerId: 3, position: { left: 91.72, top: 60.00 }, rotation: 118.5 },
    { ownerId: 4, position: { left: 39.83, top: 91.64 }, rotation: 200 },
  ];

const FIVE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  // Player 1: 8.11/63.80, rotation: 224.0°
  { ownerId: 1, position: { left: 8.11, top: 63.8 }, rotation: 224.0 },
  // Player 2: 18.06/16.34, rotation: -45.0°
  { ownerId: 2, position: { left: 18.06, top: 16.34 }, rotation: -45.0 },
  // Player 3: 69.62/11.07, rotation: 15.0°
  { ownerId: 3, position: { left: 69.62, top: 11.07 }, rotation: 15.0 },
  // Player 4: 91.28/55.40, rotation: 74.0°
  { ownerId: 4, position: { left: 91.28, top: 55.4 }, rotation: 74.0 },
  // Player 5: 52.95/88.41, rotation: 164.0°
  { ownerId: 5, position: { left: 52.95, top: 88.41 }, rotation: 164.0 },
];

export const CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT: {
  [key: number]: BankSpace[];
} = {
  3: THREE_PLAYER_CREDIBILITY_LOCATIONS,
  4: FOUR_PLAYER_CREDIBILITY_LOCATIONS,
  5: FIVE_PLAYER_CREDIBILITY_LOCATIONS,
};

// Player perspective rotations - camera rotation angles for each player's view
export const PLAYER_PERSPECTIVE_ROTATIONS: {
  [playerCount: number]: { [playerId: number]: number };
} = {
  3: { 1: -120, 2: 120, 3: 0 },
  4: { 1: -135, 2: 135, 3: 45, 4: -45 },
  // Recalculated based on the geometric center of each player's actual seat coordinates.
  5: { 1: -71, 2: -140, 3: 145, 4: 75, 5: 0 },
};
