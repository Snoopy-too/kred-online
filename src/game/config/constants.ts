/**
 * Game Constants
 * Basic game configuration values
 */

/**
 * Available player count options
 */
export const PLAYER_OPTIONS = [3, 4, 5] as const;

/**
 * Total number of tiles in the game
 */
export const TOTAL_TILES = 24;

/**
 * Board background image URLs by player count
 */
export const BOARD_IMAGE_URLS: { [key: number]: string } = {
  3: './images/3player_board.jpg',
  4: './images/4player_board.jpg',
  5: './images/5player_board.jpg',
};

/**
 * Player perspective rotation angles by player count and player ID
 * Used for rotating the board view for each player
 */
export const PLAYER_PERSPECTIVE_ROTATIONS: {
  [playerCount: number]: { [playerId: number]: number };
} = {
  3: { 1: -120, 2: 120, 3: 0 },
  4: { 1: -135, 2: 135, 3: 45, 4: -45 },
  // Recalculated based on the geometric center of each player's actual seat coordinates
  5: { 1: -71, 2: -140, 3: 145, 4: 75, 5: 0 },
};
