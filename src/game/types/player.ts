/**
 * Player-related type definitions
 * Defines player state, tiles, and game phases
 */

/**
 * Represents a game tile
 */
export interface Tile {
  id: number;
  url: string;
}

/**
 * Represents a player in the game
 */
export interface Player {
  id: number;
  hand: Tile[];
  keptTiles: Tile[];
  bureaucracyTiles: Tile[];
  credibility: number;
}

/**
 * Game state phases
 */
export type GameState =
  | 'PLAYER_SELECTION'
  | 'DRAFTING'
  | 'CAMPAIGN'
  | 'TILE_PLAYED'
  | 'PENDING_ACCEPTANCE'
  | 'PENDING_CHALLENGE'
  | 'CORRECTION_REQUIRED'
  | 'BUREAUCRACY';
