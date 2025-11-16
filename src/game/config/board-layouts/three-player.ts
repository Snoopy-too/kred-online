/**
 * Three Player Board Layout
 * Drop locations for pieces on a 3-player board
 */

import { DropLocation } from '../../types';

/**
 * All valid drop locations for a 3-player game
 * Includes player seats, rostrums, offices, and community spaces
 */
export const THREE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: 'p1_seat1', position: { left: 48.25, top: 29.91 } },
  { id: 'p1_seat2', position: { left: 43.87, top: 32.62 } },
  { id: 'p1_seat3', position: { left: 39.96, top: 35.65 } },
  { id: 'p1_seat4', position: { left: 38.17, top: 39.19 } },
  { id: 'p1_seat5', position: { left: 37.30, top: 43.94 } },
  { id: 'p1_seat6', position: { left: 37.73, top: 48.54 } },
  // Player 3 Seats
  { id: 'p3_seat1', position: { left: 40.17, top: 53.08 } },
  { id: 'p3_seat2', position: { left: 44.01, top: 56.13 } },
  { id: 'p3_seat3', position: { left: 48.46, top: 58.40 } },
  { id: 'p3_seat4', position: { left: 52.92, top: 58.18 } },
  { id: 'p3_seat5', position: { left: 57.71, top: 56.27 } },
  { id: 'p3_seat6', position: { left: 60.96, top: 53.51 } },
  // Player 2 Seats
  { id: 'p2_seat1', position: { left: 63.98, top: 48.83 } },
  { id: 'p2_seat2', position: { left: 64.61, top: 44.16 } },
  { id: 'p2_seat3', position: { left: 63.76, top: 39.48 } },
  { id: 'p2_seat4', position: { left: 61.83, top: 35.25 } },
  { id: 'p2_seat5', position: { left: 57.39, top: 32.89 } },
  { id: 'p2_seat6', position: { left: 53.51, top: 30.86 } },
  // Rostrums
  { id: 'p1_rostrum1', position: { left: 46.64, top: 22.25 } },
  { id: 'p1_rostrum2', position: { left: 29.84, top: 51.31 } },
  { id: 'p3_rostrum1', position: { left: 35.89, top: 59.51 } },
  { id: 'p3_rostrum2', position: { left: 66.07, top: 58.91 } },
  { id: 'p2_rostrum1', position: { left: 72.20, top: 52.48 } },
  { id: 'p2_rostrum2', position: { left: 54.82, top: 22.39 } },
  // Offices
  { id: 'p1_office', position: { left: 31.95, top: 25.01 } },
  { id: 'p2_office', position: { left: 76.22, top: 36.38 } },
  { id: 'p3_office', position: { left: 44.03, top: 68.87 } },
  // Community (18 spaces with proper spacing - no overlap with seats)
  // Middle row (top: 46.0-47.8%)
  { id: 'community1', position: { left: 53.50, top: 47.80 } },
  { id: 'community2', position: { left: 43.70, top: 47.70 } },
  { id: 'community3', position: { left: 57.00, top: 46.00 } },
  // Top row (top: 38.0%)
  { id: 'community4', position: { left: 45.20, top: 38.00 } },
  { id: 'community5', position: { left: 48.70, top: 38.00 } },
  { id: 'community6', position: { left: 52.20, top: 38.00 } },
  { id: 'community7', position: { left: 55.70, top: 38.00 } },
  // Second row (top: 42.0%)
  { id: 'community8', position: { left: 45.20, top: 42.00 } },
  { id: 'community9', position: { left: 48.70, top: 42.00 } },
  { id: 'community10', position: { left: 52.20, top: 42.00 } },
  { id: 'community11', position: { left: 55.70, top: 42.00 } },
  { id: 'community12', position: { left: 50.40, top: 46.00 } },
  // Bottom row (top: 50.0%)
  { id: 'community13', position: { left: 46.90, top: 50.00 } },
  { id: 'community14', position: { left: 50.40, top: 50.00 } },
  { id: 'community15', position: { left: 53.90, top: 50.00 } },
  // Additional locations
  { id: 'community16', position: { left: 43.78, top: 44.51 } },
  { id: 'community17', position: { left: 42.53, top: 42.85 } },
  { id: 'community18', position: { left: 56.70, top: 49.51 } },
];
