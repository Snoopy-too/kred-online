/**
 * Five Player Board Layout
 * Drop locations for pieces on a 5-player board
 */

import { DropLocation } from '../../types';

/**
 * All valid drop locations for a 5-player game
 * Includes player seats, rostrums, offices, and community spaces
 */
export const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: 'p1_seat1', position: { left: 30.71, top: 44.26 } },
  { id: 'p1_seat2', position: { left: 29.76, top: 47.66 } },
  { id: 'p1_seat3', position: { left: 29.88, top: 51.70 } },
  { id: 'p1_seat4', position: { left: 31.58, top: 54.68 } },
  { id: 'p1_seat5', position: { left: 33.62, top: 57.97 } },
  { id: 'p1_seat6', position: { left: 36.56, top: 60.42 } },
  // Player 2 Seats
  { id: 'p2_seat1', position: { left: 45.27, top: 30.23 } },
  { id: 'p2_seat2', position: { left: 41.55, top: 31.08 } },
  { id: 'p2_seat3', position: { left: 38.25, top: 32.36 } },
  { id: 'p2_seat4', position: { left: 34.86, top: 34.37 } },
  { id: 'p2_seat5', position: { left: 33.15, top: 37.88 } },
  { id: 'p2_seat6', position: { left: 30.78, top: 41.07 } },
  // Player 3 Seats
  { id: 'p3_seat1', position: { left: 64.34, top: 39.26 } },
  { id: 'p3_seat2', position: { left: 62.30, top: 36.18 } },
  { id: 'p3_seat3', position: { left: 59.19, top: 32.78 } },
  { id: 'p3_seat4', position: { left: 56.18, top: 31.51 } },
  { id: 'p3_seat5', position: { left: 52.71, top: 29.91 } },
  { id: 'p3_seat6', position: { left: 49.04, top: 29.59 } },
  // Player 4 Seats
  { id: 'p4_seat1', position: { left: 60.68, top: 59.25 } },
  { id: 'p4_seat2', position: { left: 62.98, top: 56.48 } },
  { id: 'p4_seat3', position: { left: 65.04, top: 53.40 } },
  { id: 'p4_seat4', position: { left: 66.16, top: 50.11 } },
  { id: 'p4_seat5', position: { left: 66.16, top: 46.07 } },
  { id: 'p4_seat6', position: { left: 65.36, top: 42.56 } },
  // Player 5 Seats
  { id: 'p5_seat1', position: { left: 39.51, top: 62.65 } },
  { id: 'p5_seat2', position: { left: 43.03, top: 63.71 } },
  { id: 'p5_seat3', position: { left: 46.77, top: 64.88 } },
  { id: 'p5_seat4', position: { left: 50.74, top: 64.99 } },
  { id: 'p5_seat5', position: { left: 54.82, top: 63.39 } },
  { id: 'p5_seat6', position: { left: 58.11, top: 61.59 } },
  // Rostrums
  { id: 'p1_rostrum1', position: { left: 24.89, top: 45.32 } },
  { id: 'p1_rostrum2', position: { left: 31.85, top: 62.83 } },
  { id: 'p2_rostrum1', position: { left: 42.56, top: 26.12 } },
  { id: 'p2_rostrum2', position: { left: 27.08, top: 37.39 } },
  { id: 'p3_rostrum1', position: { left: 67.86, top: 35.44 } },
  { id: 'p3_rostrum2', position: { left: 51.37, top: 25.22 } },
  { id: 'p4_rostrum1', position: { left: 65.36, top: 61.27 } },
  { id: 'p4_rostrum2', position: { left: 70.77, top: 43.30 } },
  { id: 'p5_rostrum1', position: { left: 39.17, top: 67.54 } },
  { id: 'p5_rostrum2', position: { left: 58.79, top: 66.69 } },
  // Offices
  { id: 'p1_office', position: { left: 15.70, top: 44.75 } },
  { id: 'p2_office', position: { left: 39.45, top: 17.10 } },
  { id: 'p3_office', position: { left: 75.18, top: 29.31 } },
  { id: 'p4_office', position: { left: 72.89, top: 65.24 } },
  { id: 'p5_office', position: { left: 36.22, top: 74.70 } },
  // Community (40 spaces based on testing)
  { id: 'community1', position: { left: 37.34, top: 41.21 } },
  { id: 'community2', position: { left: 40.36, top: 46.88 } },
  { id: 'community3', position: { left: 56.20, top: 37.40 } },
  { id: 'community4', position: { left: 40.68, top: 40.92 } },
  { id: 'community5', position: { left: 39.01, top: 38.28 } },
  { id: 'community6', position: { left: 39.11, top: 43.36 } },
  { id: 'community7', position: { left: 51.30, top: 40.53 } },
  { id: 'community8', position: { left: 55.36, top: 40.63 } },
  { id: 'community9', position: { left: 44.22, top: 40.92 } },
  { id: 'community10', position: { left: 55.26, top: 56.64 } },
  { id: 'community11', position: { left: 56.30, top: 46.29 } },
  { id: 'community12', position: { left: 57.24, top: 43.75 } },
  { id: 'community13', position: { left: 35.89, top: 44.82 } },
  { id: 'community14', position: { left: 60.05, top: 45.51 } },
  { id: 'community15', position: { left: 40.89, top: 56.64 } },
  { id: 'community16', position: { left: 42.50, top: 36.90 } },
  { id: 'community17', position: { left: 46.00, top: 36.90 } },
  { id: 'community18', position: { left: 49.50, top: 36.90 } },
  { id: 'community19', position: { left: 53.00, top: 36.90 } },
  { id: 'community20', position: { left: 47.80, top: 40.90 } },
  { id: 'community21', position: { left: 42.50, top: 44.90 } },
  { id: 'community22', position: { left: 46.00, top: 44.90 } },
  { id: 'community23', position: { left: 49.50, top: 44.90 } },
  { id: 'community24', position: { left: 53.00, top: 44.90 } },
  { id: 'community25', position: { left: 42.50, top: 48.90 } },
  { id: 'community26', position: { left: 46.00, top: 48.90 } },
  { id: 'community27', position: { left: 49.50, top: 48.90 } },
  { id: 'community28', position: { left: 53.00, top: 48.90 } },
  { id: 'community29', position: { left: 42.50, top: 52.90 } },
  { id: 'community30', position: { left: 46.00, top: 52.90 } },
  { id: 'community31', position: { left: 49.50, top: 52.90 } },
  { id: 'community32', position: { left: 53.00, top: 52.90 } },
  { id: 'community33', position: { left: 44.30, top: 56.90 } },
  { id: 'community34', position: { left: 47.80, top: 56.90 } },
  { id: 'community35', position: { left: 51.30, top: 56.90 } },
  { id: 'community36', position: { left: 37.90, top: 46.70 } },
  { id: 'community37', position: { left: 37.80, top: 50.30 } },
  { id: 'community38', position: { left: 57.40, top: 53.40 } },
  { id: 'community39', position: { left: 57.80, top: 49.40 } },
  { id: 'community40', position: { left: 37.90, top: 54.10 } },
];
