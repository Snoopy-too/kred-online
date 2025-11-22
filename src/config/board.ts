// Board layout configuration
import { DropLocation } from '../../game';

// These are the ONLY valid drop locations for pieces.
const THREE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
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

const FOUR_PLAYER_DROP_LOCATIONS: DropLocation[] = [
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

const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
    // Player 1 Seats (pushed 2% outward from center for better spacing)
    { id: 'p1_seat1', position: { left: 29.48, top: 44.06 } },
    { id: 'p1_seat2', position: { left: 29.40, top: 47.67 } },
    { id: 'p1_seat3', position: { left: 29.52, top: 51.79 } },
    { id: 'p1_seat4', position: { left: 31.25, top: 54.83 } },
    { id: 'p1_seat5', position: { left: 33.33, top: 58.19 } },
    { id: 'p1_seat6', position: { left: 36.33, top: 60.69 } },
    // Player 2 Seats
    { id: 'p2_seat1', position: { left: 45.22, top: 29.89 } },
    { id: 'p2_seat2', position: { left: 41.42, top: 30.76 } },
    { id: 'p2_seat3', position: { left: 38.06, top: 32.07 } },
    { id: 'p2_seat4', position: { left: 34.60, top: 34.12 } },
    { id: 'p2_seat5', position: { left: 32.85, top: 37.70 } },
    { id: 'p2_seat6', position: { left: 29.56, top: 40.64 } },
    // Player 3 Seats
    { id: 'p3_seat1', position: { left: 64.67, top: 39.10 } },
    { id: 'p3_seat2', position: { left: 62.59, top: 35.96 } },
    { id: 'p3_seat3', position: { left: 59.41, top: 32.49 } },
    { id: 'p3_seat4', position: { left: 56.34, top: 31.20 } },
    { id: 'p3_seat5', position: { left: 52.80, top: 29.57 } },
    { id: 'p3_seat6', position: { left: 49.06, top: 29.24 } },
    // Player 4 Seats
    { id: 'p4_seat1', position: { left: 60.93, top: 59.49 } },
    { id: 'p4_seat2', position: { left: 63.28, top: 56.67 } },
    { id: 'p4_seat3', position: { left: 65.38, top: 53.53 } },
    { id: 'p4_seat4', position: { left: 66.52, top: 50.17 } },
    { id: 'p4_seat5', position: { left: 66.52, top: 46.05 } },
    { id: 'p4_seat6', position: { left: 65.71, top: 42.47 } },
    // Player 5 Seats
    { id: 'p5_seat1', position: { left: 39.34, top: 62.96 } },
    { id: 'p5_seat2', position: { left: 42.93, top: 64.04 } },
    { id: 'p5_seat3', position: { left: 46.75, top: 65.24 } },
    { id: 'p5_seat4', position: { left: 50.80, top: 65.35 } },
    { id: 'p5_seat5', position: { left: 54.96, top: 63.72 } },
    { id: 'p5_seat6', position: { left: 58.31, top: 61.88 } },
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
    // Community (40 spaces in organized grid - shifted southwest for better centering)
    // Row 1 (top: 39.40)
    { id: 'community1', position: { left: 36.50, top: 39.40 } },
    { id: 'community2', position: { left: 40.00, top: 39.40 } },
    { id: 'community3', position: { left: 43.50, top: 39.40 } },
    { id: 'community4', position: { left: 47.00, top: 39.40 } },
    { id: 'community5', position: { left: 50.50, top: 39.40 } },
    { id: 'community6', position: { left: 54.00, top: 39.40 } },
    { id: 'community7', position: { left: 57.50, top: 39.40 } },
    // Row 2 (top: 43.40)
    { id: 'community8', position: { left: 38.25, top: 43.40 } },
    { id: 'community9', position: { left: 41.75, top: 43.40 } },
    { id: 'community10', position: { left: 45.25, top: 43.40 } },
    { id: 'community11', position: { left: 48.75, top: 43.40 } },
    { id: 'community12', position: { left: 52.25, top: 43.40 } },
    { id: 'community13', position: { left: 55.75, top: 43.40 } },
    // Row 3 (top: 47.40)
    { id: 'community14', position: { left: 36.50, top: 47.40 } },
    { id: 'community15', position: { left: 40.00, top: 47.40 } },
    { id: 'community16', position: { left: 43.50, top: 47.40 } },
    { id: 'community17', position: { left: 47.00, top: 47.40 } },
    { id: 'community18', position: { left: 50.50, top: 47.40 } },
    { id: 'community19', position: { left: 54.00, top: 47.40 } },
    { id: 'community20', position: { left: 57.50, top: 47.40 } },
    // Row 4 (top: 51.40)
    { id: 'community21', position: { left: 38.25, top: 51.40 } },
    { id: 'community22', position: { left: 41.75, top: 51.40 } },
    { id: 'community23', position: { left: 45.25, top: 51.40 } },
    { id: 'community24', position: { left: 48.75, top: 51.40 } },
    { id: 'community25', position: { left: 52.25, top: 51.40 } },
    { id: 'community26', position: { left: 55.75, top: 51.40 } },
    // Row 5 (top: 55.40)
    { id: 'community27', position: { left: 36.50, top: 55.40 } },
    { id: 'community28', position: { left: 40.00, top: 55.40 } },
    { id: 'community29', position: { left: 43.50, top: 55.40 } },
    { id: 'community30', position: { left: 47.00, top: 55.40 } },
    { id: 'community31', position: { left: 50.50, top: 55.40 } },
    { id: 'community32', position: { left: 54.00, top: 55.40 } },
    { id: 'community33', position: { left: 57.50, top: 55.40 } },
    // Row 6 (top: 59.40)
    { id: 'community34', position: { left: 38.25, top: 59.40 } },
    { id: 'community35', position: { left: 41.75, top: 59.40 } },
    { id: 'community36', position: { left: 45.25, top: 59.40 } },
    { id: 'community37', position: { left: 48.75, top: 59.40 } },
    { id: 'community38', position: { left: 52.25, top: 59.40 } },
    { id: 'community39', position: { left: 55.75, top: 59.40 } },
    // Extra space (centered at bottom)
    { id: 'community40', position: { left: 47.00, top: 62.90 } },
];

export const DROP_LOCATIONS_BY_PLAYER_COUNT: { [playerCount: number]: DropLocation[] } = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};
