/**
 * Four Player Board Layout
 * Drop locations for pieces on a 4-player board
 */

import { DropLocation } from '../../types';

/**
 * All valid drop locations for a 4-player game
 * Includes player seats, rostrums, offices, and community spaces
 */
export const FOUR_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: 'p1_seat1', position: { left: 42.83, top: 34.48 } },
  { id: 'p1_seat2', position: { left: 38.61, top: 37.35 } },
  { id: 'p1_seat3', position: { left: 34.17, top: 40.50 } },
  { id: 'p1_seat4', position: { left: 32.71, top: 44.47 } },
  { id: 'p1_seat5', position: { left: 31.02, top: 48.79 } },
  { id: 'p1_seat6', position: { left: 31.35, top: 53.40 } },
  // Player 2 Seats
  { id: 'p2_seat1', position: { left: 67.62, top: 43.57 } },
  { id: 'p2_seat2', position: { left: 65.14, top: 40.54 } },
  { id: 'p2_seat3', position: { left: 61.43, top: 37.35 } },
  { id: 'p2_seat4', position: { left: 57.09, top: 35.33 } },
  { id: 'p2_seat5', position: { left: 52.92, top: 33.52 } },
  { id: 'p2_seat6', position: { left: 47.56, top: 33.52 } },
  // Player 3 Seats
  { id: 'p3_seat1', position: { left: 57.95, top: 67.50 } },
  { id: 'p3_seat2', position: { left: 61.73, top: 64.99 } },
  { id: 'p3_seat3', position: { left: 65.40, top: 61.70 } },
  { id: 'p3_seat4', position: { left: 67.52, top: 58.18 } },
  { id: 'p3_seat5', position: { left: 68.34, top: 53.61 } },
  { id: 'p3_seat6', position: { left: 68.88, top: 48.94 } },
  // Player 4 Seats
  { id: 'p4_seat1', position: { left: 32.20, top: 57.97 } },
  { id: 'p4_seat2', position: { left: 35.09, top: 62.22 } },
  { id: 'p4_seat3', position: { left: 39.21, top: 64.77 } },
  { id: 'p4_seat4', position: { left: 43.03, top: 67.22 } },
  { id: 'p4_seat5', position: { left: 46.92, top: 68.21 } },
  { id: 'p4_seat6', position: { left: 52.66, top: 69.13 } },
  // Rostrums
  { id: 'p1_rostrum1', position: { left: 40.31, top: 27.68 } },
  { id: 'p1_rostrum2', position: { left: 23.87, top: 55.00 } },
  { id: 'p2_rostrum1', position: { left: 74.82, top: 42.08 } },
  { id: 'p2_rostrum2', position: { left: 46.43, top: 26.51 } },
  { id: 'p3_rostrum1', position: { left: 60.03, top: 74.66 } },
  { id: 'p3_rostrum2', position: { left: 76.36, top: 47.34 } },
  { id: 'p4_rostrum1', position: { left: 25.18, top: 59.71 } },
  { id: 'p4_rostrum2', position: { left: 54.14, top: 75.72 } },
  // Offices
  { id: 'p1_office', position: { left: 18.18, top: 44.34 } },
  { id: 'p2_office', position: { left: 55.99, top: 19.63 } },
  { id: 'p3_office', position: { left: 82.55, top: 55.08 } },
  { id: 'p4_office', position: { left: 44.43, top: 79.79 } },
  // Community (27 spaces in a grid)
  { id: 'community1', position: { left: 44.70, top: 41.60 } },
  { id: 'community2', position: { left: 48.20, top: 41.60 } },
  { id: 'community3', position: { left: 51.70, top: 41.60 } },
  { id: 'community4', position: { left: 55.20, top: 41.60 } },
  { id: 'community5', position: { left: 44.70, top: 45.60 } },
  { id: 'community6', position: { left: 48.20, top: 45.60 } },
  { id: 'community7', position: { left: 51.70, top: 45.60 } },
  { id: 'community8', position: { left: 55.20, top: 45.60 } },
  { id: 'community9', position: { left: 44.70, top: 49.60 } },
  { id: 'community10', position: { left: 48.20, top: 49.60 } },
  { id: 'community11', position: { left: 51.70, top: 49.60 } },
  { id: 'community12', position: { left: 55.20, top: 49.60 } },
  { id: 'community13', position: { left: 44.70, top: 53.60 } },
  { id: 'community14', position: { left: 48.20, top: 53.60 } },
  { id: 'community15', position: { left: 51.70, top: 53.60 } },
  { id: 'community16', position: { left: 55.20, top: 53.60 } },
  { id: 'community17', position: { left: 44.70, top: 57.60 } },
  { id: 'community18', position: { left: 48.20, top: 57.60 } },
  { id: 'community19', position: { left: 51.70, top: 57.60 } },
  { id: 'community20', position: { left: 55.20, top: 57.60 } },
  { id: 'community21', position: { left: 59.10, top: 45.25 } },
  { id: 'community22', position: { left: 59.10, top: 49.84 } },
  { id: 'community23', position: { left: 59.10, top: 54.43 } },
  { id: 'community24', position: { left: 59.10, top: 58.14 } },
  { id: 'community25', position: { left: 40.14, top: 46.03 } },
  { id: 'community26', position: { left: 40.14, top: 50.62 } },
  { id: 'community27', position: { left: 40.14, top: 54.13 } },
];
