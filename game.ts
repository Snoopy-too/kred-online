

// --- Type Definitions ---

export interface Tile {
  id: number;
  url: string;
}

export interface Player {
  id: number;
  hand: Tile[];
  keptTiles: Tile[];
  bureaucracyTiles: Tile[];
}

export type GameState = 'PLAYER_SELECTION' | 'DRAFTING' | 'CAMPAIGN' | 'TILE_PLAYED' | 'PENDING_ACCEPTANCE' | 'PENDING_CHALLENGE' | 'CORRECTION_REQUIRED';

// --- Game Piece Definitions ---

export interface GamePieceInfo {
  name: string;
  imageUrl: string;
}

// Represents a piece instance on the game board
export interface Piece {
  id:string;
  name: string;
  imageUrl: string;
  position: { top: number; left: number }; // in percentage
  rotation: number;
  locationId?: string; // ID of the drop location where this piece is placed
}

// Represents a tile instance on the game board
export interface BoardTile {
  id: string;
  tile: Tile;
  position: { top: number; left: number };
  rotation: number;
  placerId: number;
  ownerId: number; // Who owns the slot.
}

export interface DropLocation {
  id: string;
  position: { left: number; top: number };
}

export interface TileReceivingSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}

// Move tracking for undo/replay functionality
export interface TrackedMove {
  moveType: DefinedMoveType;
  category: 'M' | 'O'; // M = My domain, O = Opponent domain
  pieceId: string;
  fromPosition: { top: number; left: number };
  fromLocationId?: string;
  toPosition: { top: number; left: number };
  toLocationId?: string;
  timestamp: number;
}

// Represents a tile that has been played but not yet fully resolved
export interface PlayedTileState {
  tileId: string;
  playerId: number; // Player who played the tile
  receivingPlayerId: number; // Player who received the tile
  playedAt: number; // Timestamp when played
  movesPerformed: TrackedMove[]; // Moves made by the player during play
  gameStateSnapshot: {
    pieces: Piece[];
    boardTiles: BoardTile[];
  };
}

// Challenge information
export interface ChallengeState {
  status: 'PENDING' | 'CHALLENGED' | 'RESOLVED';
  challengedByPlayerId?: number;
  acceptedByReceivingPlayer: boolean;
}

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
  // Community (11 spaces with proper spacing - no overlap with seats)
  // Top row (top: 42.0%)
  { id: 'community1', position: { left: 45.20, top: 42.00 } },
  { id: 'community2', position: { left: 48.70, top: 42.00 } },
  { id: 'community3', position: { left: 52.20, top: 42.00 } },
  { id: 'community4', position: { left: 55.70, top: 42.00 } },
  // Middle row (top: 46.0-47.8%)
  { id: 'community5', position: { left: 43.70, top: 47.70 } },
  { id: 'community6', position: { left: 50.40, top: 46.00 } },
  { id: 'community7', position: { left: 53.50, top: 47.80 } },
  { id: 'community8', position: { left: 57.00, top: 46.00 } },
  // Bottom row (top: 50.0%)
  { id: 'community9', position: { left: 46.90, top: 50.00 } },
  { id: 'community10', position: { left: 50.40, top: 50.00 } },
  { id: 'community11', position: { left: 53.90, top: 50.00 } },
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
    // Community (spread out to avoid overlap)
    { id: 'community1', position: { left: 41.46, top: 43.27 } },
    { id: 'community2', position: { left: 41.31, top: 53.91 } },
    { id: 'community3', position: { left: 41.05, top: 47.10 } },
    { id: 'community4', position: { left: 61.21, top: 50.63 } },
    { id: 'community5', position: { left: 58.34, top: 55.42 } },
    { id: 'community6', position: { left: 58.74, top: 46.55 } },
];

const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
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

export const DROP_LOCATIONS_BY_PLAYER_COUNT: { [playerCount: number]: DropLocation[] } = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};

/**
 * GAME RULE: Seat-to-Rostrum Support Mapping
 *
 * Each player has 2 rostrums. The 6 seats for each player are divided into two groups of 3.
 * A player may only move a piece from their seats into a rostrum if ALL 3 supporting seats are full.
 * If all 3 supporting seats for a rostrum become vacant, any piece at that rostrum must be moved
 * to one of the supporting seats.
 *
 * Support structure (same for all player counts: 3, 4, 5 players):
 * - Seats 1-3 support Rostrum 1
 * - Seats 4-6 support Rostrum 2
 */
export interface RostrumSupport {
  rostrum: string; // e.g., 'p1_rostrum1'
  supportingSeats: string[]; // e.g., ['p1_seat1', 'p1_seat2', 'p1_seat3']
}

export interface PlayerRostrum {
  playerId: number;
  rostrums: RostrumSupport[];
  office: string; // e.g., 'p1_office'
}

/**
 * Comprehensive mapping of rostrums to their supporting seats for all player counts.
 * The structure is the same regardless of player count (3, 4, or 5 players).
 */
export const ROSTRUM_SUPPORT_RULES: { [playerId: number]: PlayerRostrum } = {
  1: {
    playerId: 1,
    rostrums: [
      { rostrum: 'p1_rostrum1', supportingSeats: ['p1_seat1', 'p1_seat2', 'p1_seat3'] },
      { rostrum: 'p1_rostrum2', supportingSeats: ['p1_seat4', 'p1_seat5', 'p1_seat6'] },
    ],
    office: 'p1_office',
  },
  2: {
    playerId: 2,
    rostrums: [
      { rostrum: 'p2_rostrum1', supportingSeats: ['p2_seat1', 'p2_seat2', 'p2_seat3'] },
      { rostrum: 'p2_rostrum2', supportingSeats: ['p2_seat4', 'p2_seat5', 'p2_seat6'] },
    ],
    office: 'p2_office',
  },
  3: {
    playerId: 3,
    rostrums: [
      { rostrum: 'p3_rostrum1', supportingSeats: ['p3_seat1', 'p3_seat2', 'p3_seat3'] },
      { rostrum: 'p3_rostrum2', supportingSeats: ['p3_seat4', 'p3_seat5', 'p3_seat6'] },
    ],
    office: 'p3_office',
  },
  4: {
    playerId: 4,
    rostrums: [
      { rostrum: 'p4_rostrum1', supportingSeats: ['p4_seat1', 'p4_seat2', 'p4_seat3'] },
      { rostrum: 'p4_rostrum2', supportingSeats: ['p4_seat4', 'p4_seat5', 'p4_seat6'] },
    ],
    office: 'p4_office',
  },
  5: {
    playerId: 5,
    rostrums: [
      { rostrum: 'p5_rostrum1', supportingSeats: ['p5_seat1', 'p5_seat2', 'p5_seat3'] },
      { rostrum: 'p5_rostrum2', supportingSeats: ['p5_seat4', 'p5_seat5', 'p5_seat6'] },
    ],
    office: 'p5_office',
  },
};

/**
 * ADJACENCY RULES - Rostrum-to-Rostrum Movement
 *
 * Certain rostrums are adjacent and allow direct piece movement between them.
 * Adjacency is bidirectional (can move in both directions).
 *
 * 3-Player Mode:
 *   - p1_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 *
 * 4-Player Mode:
 *   - p1_rostrum2 <-> p4_rostrum1
 *   - p4_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 *
 * 5-Player Mode:
 *   - p1_rostrum2 <-> p5_rostrum1
 *   - p5_rostrum2 <-> p4_rostrum1
 *   - p4_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 */
export interface RostrumAdjacency {
  rostrum1: string;
  rostrum2: string;
}

export const ROSTRUM_ADJACENCY_BY_PLAYER_COUNT: { [playerCount: number]: RostrumAdjacency[] } = {
  3: [
    { rostrum1: 'p1_rostrum2', rostrum2: 'p3_rostrum1' },
    { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
    { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
  ],
  4: [
    { rostrum1: 'p1_rostrum2', rostrum2: 'p4_rostrum1' },
    { rostrum1: 'p4_rostrum2', rostrum2: 'p3_rostrum1' },
    { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
    { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
  ],
  5: [
    { rostrum1: 'p1_rostrum2', rostrum2: 'p5_rostrum1' },
    { rostrum1: 'p5_rostrum2', rostrum2: 'p4_rostrum1' },
    { rostrum1: 'p4_rostrum2', rostrum2: 'p3_rostrum1' },
    { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
    { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
  ],
};

/**
 * BASE GAME RULES - Piece Movement Restrictions
 *
 * 1. ROSTRUM OCCUPATION:
 *    - A piece can only be moved to a rostrum if ALL 3 supporting seats are full
 *    - If all 3 supporting seats become vacant, the piece must be moved to a supporting seat
 *
 * 2. OFFICE OCCUPATION:
 *    - A piece can only be moved to a player's office if BOTH of that player's rostrums are filled
 *    - Once in an office, a piece can only be moved by that office's owner
 *
 * 3. PROTECTED MOVEMENT:
 *    - Opponents CANNOT move a piece from a player's seats into that player's rostrums
 *    - Opponents CANNOT move a piece from a player's rostrums or offices (pieces in these are protected)
 *    - Only the owner of a piece can move it from their own rostrums or offices
 *
 * 4. ADJACENCY MOVEMENT:
 *    - Pieces can be moved directly between adjacent rostrums
 *    - Movement must still respect the supporting seat requirements of the destination rostrum
 *    - Only the owner can initiate moves from their own rostrums
 *
 * 5. COMMUNITY SPACES:
 *    - Any player can move any piece to community spaces (unless otherwise blocked by other rules)
 */

/**
 * DEFINED MOVES - Action Types Available to Players
 *
 * These moves are triggered by playing tiles and define the specific actions a player can take.
 * Each move has specific restrictions based on whose turn it is and game state.
 *
 * Legend:
 *   (M) = Mandatory Action - Must be performed (with limited choices in some cases)
 *   (O) = Optional Action - Can choose to perform or not
 *
 * =====================================================================
 * (O) REMOVE - Take a piece from opponent's domain, return to community
 * =====================================================================
 * Description: Remove a Mark or Heel from a seat in an opponent's domain and return it to the community.
 *
 * Restrictions:
 *   - Can only target opponent's seats (not rostrums or offices)
 *   - Piece is returned to community spaces
 *   - Only the seat must be vacant for placement
 *
 * =====================================================================
 * (M) ADVANCE - Player's choice of ONE of three options
 * =====================================================================
 * Description: Move a piece in the player's own domain, with three possible routes:
 *
 * Option A: Take a piece from community → add to open seat in own domain
 *   - Seat must be vacant
 *   - Piece comes from community spaces
 *
 * Option B: Take a piece from own seat → place in supporting Rostrum
 *   - All 3 supporting seats must be full
 *   - Piece moves from seat to its supporting rostrum
 *
 * Option C: Take a piece from own Rostrum → place in own Office
 *   - Both rostrums must be filled
 *   - Piece moves from rostrum to office
 *   - Only owner can perform this
 *
 * =====================================================================
 * (O) INFLUENCE - Move opponent's piece to adjacent location
 * =====================================================================
 * Description: Move another player's piece along the adjacency chain:
 *
 * Option A: From seat to adjacent seat
 *   - Adjacent seats can be in any player's domain
 *   - Destination seat must be vacant
 *
 * Option B: From opponent's Rostrum to adjacent Rostrum
 *   - Destination rostrum must be owned by opponent (per adjacency rules)
 *   - All supporting seats of destination must be full
 *   - Piece ownership doesn't change
 *
 * =====================================================================
 * (O) ASSIST - Add piece from community to opponent's vacant seat
 * =====================================================================
 * Description: Help an opponent by placing a piece from community into their vacant seat.
 *
 * Restrictions:
 *   - Target seat must be vacant
 *   - Target seat must be in opponent's domain
 *   - Piece comes from community
 *
 * =====================================================================
 * (M) WITHDRAW - Must move piece OUT of domain (or skip if domain is empty)
 * =====================================================================
 * Description: Mandatory action to move a piece out, moving pieces DOWN the hierarchy:
 *
 * One of three options (UNLESS player has 0 pieces in their domain):
 *
 * Option A: From own Office → to vacant Rostrum in own domain
 *   - Only owner can initiate
 *   - Destination rostrum must be vacant
 *
 * Option B: From own Rostrum → to vacant Seat in own domain
 *   - Only owner can initiate
 *   - Destination seat must be vacant
 *   - Does NOT require supporting seats to be full (moving down is always allowed)
 *
 * Option C: From own Seat → to Community
 *   - Only owner can initiate
 *   - Seat can be any in the domain
 *   - Returns piece to community spaces
 *
 * =====================================================================
 * (M) ORGANIZE - Must move piece to adjacent location
 * =====================================================================
 * Description: Mandatory action to move a piece to an adjacent location:
 *
 * Option A: From own Seat → to adjacent Seat
 *   - Adjacent seat can be in any player's domain
 *   - Destination seat must be vacant
 *
 * Option B: From own Rostrum → to adjacent Rostrum
 *   - Adjacent rostrum is in an opponent's domain
 *   - All supporting seats of destination must be full
 */
export enum DefinedMoveType {
  REMOVE = 'REMOVE',
  ADVANCE = 'ADVANCE',
  INFLUENCE = 'INFLUENCE',
  ASSIST = 'ASSIST',
  WITHDRAW = 'WITHDRAW',
  ORGANIZE = 'ORGANIZE',
}

export enum MoveRequirementType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
}

export interface DefinedMove {
  type: DefinedMoveType;
  category: 'M' | 'O'; // 'M' = My domain, 'O' = Opponent domain
  requirement: MoveRequirementType;
  description: string;
  options: string[];
  canTargetOwnDomain: boolean;
  canTargetOpponentDomain: boolean;
  affectsCommunity: boolean;
}

/**
 * Complete definition of all Defined Moves available in the game.
 * These moves are triggered by playing tiles during the game.
 */
/**
 * DEFINED MOVES
 *
 * (M) moves affect pieces originating in the player's own domain
 * (O) moves affect pieces originating in an opponent's domain
 */
export const DEFINED_MOVES: { [key in DefinedMoveType]: DefinedMove } = {
  [DefinedMoveType.REMOVE]: {
    type: DefinedMoveType.REMOVE,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description: '(O) Remove – Take a Mark or a Heel from a seat in an opponent\'s domain and return it to the community.',
    options: [
      'a. Take a Mark or Heel from an opponent\'s seat',
      'b. Return the piece to the community',
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: true,
  },
  [DefinedMoveType.ADVANCE]: {
    type: DefinedMoveType.ADVANCE,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description: '(M) Advance – Player\'s choice of ONE of the following',
    options: [
      'a. Take a piece from the community and add it to an open seat in their domain',
      'b. Take a piece from a seat in their domain and place it into the open Rostrum that that seat supports',
      'c. Take a piece from a Rostrum in their domain and place it into the office in their domain',
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.INFLUENCE]: {
    type: DefinedMoveType.INFLUENCE,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description: '(O) Influence – A player may move another player\'s piece from a seat to an adjacent seat (even if that seat is in another player\'s domain), OR from an opponent\'s rostrum to an adjacent rostrum in another player\'s domain.',
    options: [
      'a. Move another player\'s piece from a seat to an adjacent seat',
      'b. Move another player\'s piece from a rostrum to an adjacent rostrum in another player\'s domain',
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: false,
  },
  [DefinedMoveType.ASSIST]: {
    type: DefinedMoveType.ASSIST,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description: '(O) Assist – A player may add a piece from the community to an opponent\'s vacant seat.',
    options: [
      'a. Take a piece from the community and add it to an opponent\'s vacant seat',
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: true,
  },
  [DefinedMoveType.WITHDRAW]: {
    type: DefinedMoveType.WITHDRAW,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description: '(M) Withdraw – A player MUST do one of the following UNLESS they have 0 pieces in their domain',
    options: [
      'a. Move a piece from an office to a vacant rostrum in their domain',
      'b. Move a piece from a rostrum in their domain to a vacant seat in their domain',
      'c. Move a piece from a seat in their domain to the community',
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.ORGANIZE]: {
    type: DefinedMoveType.ORGANIZE,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description: '(M) Organize – A player must do one of the following',
    options: [
      'a. Move a piece from a seat in their domain to an adjacent seat, even if it ends up in an opponent\'s domain',
      'b. Move a piece from a rostrum in their domain to an adjacent rostrum in an opponent\'s domain',
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: true,
    affectsCommunity: false,
  },
};

/**
 * TILE PLAY OPTIONS - What a Player Can Do When Challenged
 *
 * When a player plays a tile to another player, the receiving player initially has ONE of
 * these four options available to them, pending any rejection challenges.
 *
 * The receiving player selects ONE option from below:
 *
 * a. NO MOVE - Do nothing. The tile play is complete.
 *
 * b. ONE "O" MOVE - Execute one Optional move (REMOVE, INFLUENCE, or ASSIST).
 *    Examples: Remove opponent's piece, move opponent's piece via adjacency, or assist opponent.
 *
 * c. ONE "M" MOVE - Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE).
 *    Examples: Move piece up the hierarchy, move piece down, or move to adjacent location.
 *
 * d. ONE "O" MOVE AND ONE "M" MOVE - Execute one Optional move AND one Mandatory move.
 *    Examples: Remove + Organize, Influence + Advance, Assist + Withdraw, etc.
 *
 * Note: After executing their chosen option(s), the receiving player is then eligible to
 * reject or challenge the tile play (mechanisms to be implemented later).
 */
export enum TilePlayOptionType {
  NO_MOVE = 'NO_MOVE',
  ONE_OPTIONAL = 'ONE_OPTIONAL',
  ONE_MANDATORY = 'ONE_MANDATORY',
  ONE_OPTIONAL_AND_ONE_MANDATORY = 'ONE_OPTIONAL_AND_ONE_MANDATORY',
}

export interface TilePlayOption {
  optionType: TilePlayOptionType;
  description: string;
  allowedMoveTypes: DefinedMoveType[];
  maxOptionalMoves: number;
  maxMandatoryMoves: number;
  requiresAction: boolean;
}

/**
 * Complete definition of all tile play options available to a receiving player.
 * The receiving player must choose exactly ONE of these options when challenged with a tile.
 */
export const TILE_PLAY_OPTIONS: { [key in TilePlayOptionType]: TilePlayOption } = {
  [TilePlayOptionType.NO_MOVE]: {
    optionType: TilePlayOptionType.NO_MOVE,
    description: 'Do nothing. The tile play is complete.',
    allowedMoveTypes: [],
    maxOptionalMoves: 0,
    maxMandatoryMoves: 0,
    requiresAction: false,
  },
  [TilePlayOptionType.ONE_OPTIONAL]: {
    optionType: TilePlayOptionType.ONE_OPTIONAL,
    description: 'Execute one Optional move (REMOVE, INFLUENCE, or ASSIST)',
    allowedMoveTypes: [
      DefinedMoveType.REMOVE,
      DefinedMoveType.INFLUENCE,
      DefinedMoveType.ASSIST,
    ],
    maxOptionalMoves: 1,
    maxMandatoryMoves: 0,
    requiresAction: true,
  },
  [TilePlayOptionType.ONE_MANDATORY]: {
    optionType: TilePlayOptionType.ONE_MANDATORY,
    description: 'Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE)',
    allowedMoveTypes: [
      DefinedMoveType.ADVANCE,
      DefinedMoveType.WITHDRAW,
      DefinedMoveType.ORGANIZE,
    ],
    maxOptionalMoves: 0,
    maxMandatoryMoves: 1,
    requiresAction: true,
  },
  [TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY]: {
    optionType: TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY,
    description: 'Execute one Optional move AND one Mandatory move in any order',
    allowedMoveTypes: [
      DefinedMoveType.REMOVE,
      DefinedMoveType.INFLUENCE,
      DefinedMoveType.ASSIST,
      DefinedMoveType.ADVANCE,
      DefinedMoveType.WITHDRAW,
      DefinedMoveType.ORGANIZE,
    ],
    maxOptionalMoves: 1,
    maxMandatoryMoves: 1,
    requiresAction: true,
  },
};

/**
 * Helper function to check if a move type is allowed within a tile play option.
 * @param moveType The move type to check.
 * @param optionType The tile play option selected.
 * @returns True if the move type is allowed within that option.
 */
export function isMoveAllowedInTilePlayOption(
  moveType: DefinedMoveType,
  optionType: TilePlayOptionType
): boolean {
  const option = TILE_PLAY_OPTIONS[optionType];
  if (!option) return false;
  return option.allowedMoveTypes.includes(moveType);
}

/**
 * Helper function to determine if a move is Optional or Mandatory.
 * @param moveType The move type to classify.
 * @returns The MoveRequirementType of this move.
 */
export function getMoveRequirement(moveType: DefinedMoveType): MoveRequirementType {
  const move = DEFINED_MOVES[moveType];
  return move ? move.requirement : MoveRequirementType.OPTIONAL;
}

/**
 * TILE REQUIREMENTS - Specific Moves Required by Each Tile
 *
 * Each tile (except the Blank tile) requires specific move(s) to be made by the receiving player.
 *
 * CRITICAL RULES:
 * 1. If a tile's requirements are played correctly by the player, it CANNOT be rejected.
 * 2. A correctly played tile is NOT AFFECTED by challenges.
 * 3. If the board state makes one or both requirements impossible to execute, the tile also
 *    CANNOT be rejected and is NOT AFFECTED by challenges.
 * 4. The BLANK TILE (5-player mode only) requires the player to make NO moves.
 *    - If they make ANY moves with the blank tile, those moves ARE AFFECTED by rejection/challenges.
 * 5. All requirements must be completed for the tile to be unrejectable.
 *    - If only some requirements are met, the tile can be rejected.
 */
export interface TileRequirement {
  tileId: string;
  requiredMoves: DefinedMoveType[];
  description: string;
  canBeRejected: boolean; // false = cannot be rejected if requirements met or impossible
}

/**
 * Complete mapping of all tile IDs to their movement requirements.
 *
 * Tiles are identified by their SVG filenames (01.svg through 24.svg) plus the Blank tile.
 * Each tile specifies the exact moves that MUST be executed by the receiving player.
 */
export const TILE_REQUIREMENTS: { [tileId: string]: TileRequirement } = {
  // Tiles 01-02: Require Remove (O) and Advance (M)
  '01': {
    tileId: '01',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: '(O) Remove and (M) Advance',
    canBeRejected: false,
  },
  '02': {
    tileId: '02',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: '(O) Remove and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 03-04: Require Influence (O) and Advance (M)
  '03': {
    tileId: '03',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: '(O) Influence and (M) Advance',
    canBeRejected: false,
  },
  '04': {
    tileId: '04',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: '(O) Influence and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 05-06: Require only Advance (M)
  '05': {
    tileId: '05',
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: '(M) Advance',
    canBeRejected: false,
  },
  '06': {
    tileId: '06',
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: '(M) Advance',
    canBeRejected: false,
  },

  // Tiles 07-08: Require Assist (O) and Advance (M)
  '07': {
    tileId: '07',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: '(O) Assist and (M) Advance',
    canBeRejected: false,
  },
  '08': {
    tileId: '08',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: '(O) Assist and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 09-10: Require Remove (O) and Organize (M)
  '09': {
    tileId: '09',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: '(O) Remove and (M) Organize',
    canBeRejected: false,
  },
  '10': {
    tileId: '10',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: '(O) Remove and (M) Organize',
    canBeRejected: false,
  },

  // Tile 11: Require only Influence (O)
  '11': {
    tileId: '11',
    requiredMoves: [DefinedMoveType.INFLUENCE],
    description: '(O) Influence',
    canBeRejected: false,
  },

  // Tile 12: Require only Organize (M)
  '12': {
    tileId: '12',
    requiredMoves: [DefinedMoveType.ORGANIZE],
    description: '(M) Organize',
    canBeRejected: false,
  },

  // Tiles 13-14: Require Assist (O) and Organize (M)
  '13': {
    tileId: '13',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: '(O) Assist and (M) Organize',
    canBeRejected: false,
  },
  '14': {
    tileId: '14',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: '(O) Assist and (M) Organize',
    canBeRejected: false,
  },

  // Tiles 15-16: Require only Remove (O)
  '15': {
    tileId: '15',
    requiredMoves: [DefinedMoveType.REMOVE],
    description: '(O) Remove',
    canBeRejected: false,
  },
  '16': {
    tileId: '16',
    requiredMoves: [DefinedMoveType.REMOVE],
    description: '(O) Remove',
    canBeRejected: false,
  },

  // Tiles 17-18: Require Influence (O) and Withdraw (M)
  '17': {
    tileId: '17',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: '(O) Influence and (M) Withdraw',
    canBeRejected: false,
  },
  '18': {
    tileId: '18',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: '(O) Influence and (M) Withdraw',
    canBeRejected: false,
  },

  // Tiles 19-21: Require only Withdraw (M)
  '19': {
    tileId: '19',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },
  '20': {
    tileId: '20',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },
  '21': {
    tileId: '21',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },

  // Tiles 22-24: Require Assist (O) and Withdraw (M)
  '22': {
    tileId: '22',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },
  '23': {
    tileId: '23',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },
  '24': {
    tileId: '24',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },

  // Blank tile (5-player mode only) - wild tile
  'BLANK': {
    tileId: 'BLANK',
    requiredMoves: [],
    description: 'Blank - Wild tile. The player may perform one "O" move and/or one "M" move, or no move at all.',
    canBeRejected: true, // Can be rejected if moves don't match allowed patterns
  },
};

/**
 * Gets the tile requirements for a specific tile ID.
 * @param tileId The tile ID (e.g., '01', '24', 'BLANK').
 * @returns The TileRequirement object, or null if tile not found.
 */
export function getTileRequirements(tileId: string): TileRequirement | null {
  return TILE_REQUIREMENTS[tileId] || null;
}

/**
 * Checks if a tile has specific move requirements.
 * @param tileId The tile ID to check.
 * @returns True if the tile has required moves (non-empty).
 */
export function tileHasRequirements(tileId: string): boolean {
  const requirements = getTileRequirements(tileId);
  return requirements ? requirements.requiredMoves.length > 0 : false;
}

/**
 * Checks if all required moves for a tile have been completed.
 * @param tileId The tile ID being played.
 * @param executedMoves The moves that were actually executed.
 * @returns True if all required moves were executed.
 */
export function areAllTileRequirementsMet(
  tileId: string,
  executedMoves: DefinedMoveType[]
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements || requirements.requiredMoves.length === 0) {
    return true; // No requirements (like Blank tile with no moves)
  }

  // All required moves must be present in executedMoves
  return requirements.requiredMoves.every(requiredMove =>
    executedMoves.includes(requiredMove)
  );
}

/**
 * Determines if a tile play can be rejected based on execution.
 *
 * REJECTION RULES:
 * - If all required moves were executed: tile CANNOT be rejected
 * - If it's impossible to execute requirements (board state): tile CANNOT be rejected
 * - If some moves were not executed (but were possible): tile CAN be rejected
 * - For Blank tile: if NO moves were made: tile CANNOT be rejected
 * - For Blank tile: if ANY moves were made: tile CAN be rejected
 *
 * @param tileId The tile ID being played.
 * @param executedMoves The moves that were executed.
 * @param wasExecutionPossible Whether the requirements were possible to execute.
 * @returns True if the tile can be rejected.
 */
export function canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  wasExecutionPossible: boolean
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements) return true; // Unknown tile, default to rejectable

  // If requirements were impossible to execute, tile cannot be rejected
  if (!wasExecutionPossible) {
    return false;
  }

  // If all requirements were met, tile cannot be rejected
  if (areAllTileRequirementsMet(tileId, executedMoves)) {
    return false;
  }

  // Blank tile can be rejected only if moves were made
  if (tileId === 'BLANK') {
    return executedMoves.length > 0;
  }

  // If some (but not all) requirements were met, tile can be rejected
  return true;
}

export const PLAYER_PERSPECTIVE_ROTATIONS: { [playerCount: number]: { [playerId: number]: number } } = {
  3: { 1: -120, 2: 120, 3: 0 },
  4: { 1: -135, 2: 135, 3: 45, 4: -45 },
  // Recalculated based on the geometric center of each player's actual seat coordinates.
  5: { 1: -71, 2: -140, 3: 145, 4: 75, 5: 0 },
};

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

export const PIECE_TYPES: { [key: string]: GamePieceInfo } = {
  MARK: { name: 'Mark', imageUrl: 'https://montoyahome.com/kred/mark-transparent_bg.png' },
  HEEL: { name: 'Heel', imageUrl: 'https://montoyahome.com/kred/heel-transparent_bg.png' },
  PAWN: { name: 'Pawn', imageUrl: 'https://montoyahome.com/kred/pawn-transparent_bg.png' },
};

export const PIECE_COUNTS_BY_PLAYER_COUNT: {
  [playerCount: number]: { [pieceType: string]: number };
} = {
  3: {
    MARK: 12,
    HEEL: 9,
    PAWN: 3,
  },
  4: {
    MARK: 16,
    HEEL: 12,
    PAWN: 4,
  },
  5: {
    MARK: 20,
    HEEL: 15,
    PAWN: 5,
  },
};


// --- Game Constants ---

export const PLAYER_OPTIONS = [3, 4, 5];

export const BOARD_IMAGE_URLS: { [key: number]: string } = {
  3: 'https://montoyahome.com/kred/3player_board.jpg',
  4: 'https://montoyahome.com/kred/4player_board.jpg',
  5: 'https://montoyahome.com/kred/5player_board.jpg',
};

const TOTAL_TILES = 24;
export const TILE_IMAGE_URLS = Array.from({ length: TOTAL_TILES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `https://montoyahome.com/kred/${num}.svg`;
});


// --- Utility Functions ---

const BOARD_CENTERS: { [playerCount: number]: { left: number; top: number } } = {
  3: { left: 50.44, top: 44.01 },
  4: { left: 49.94, top: 51.56 },
  5: { left: 47.79, top: 46.92 },
};

/**
 * Calculates the rotation of a piece so its top points away from the board center.
 * Pieces in seats, rostrums, and offices are rotated to point outward from the board center.
 * Community pieces and free placement pieces have no rotation (0 degrees).
 * @param position The position of the piece in percentage { top, left }.
 * @param playerCount The number of players in the game.
 * @param locationId Optional location ID to check if it's a community or free placement location.
 * @returns The rotation in degrees.
 */
export function isPositionInCommunityCircle(position: { top: number; left: number }): boolean {
  const communityCenter = { left: 50, top: 50 };
  const communityRadius = 15;
  const dx = position.left - communityCenter.left;
  const dy = position.top - communityCenter.top;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= communityRadius;
}

export function calculatePieceRotation(position: { top: number; left: number }, playerCount: number, locationId?: string): number {
  // Community pieces, free placement, and offices have no rotation
  if (locationId && (locationId.startsWith('community') || locationId === 'free_placement' || locationId.includes('office'))) {
    return 0;
  }

  const boardCenter = BOARD_CENTERS[playerCount] || { left: 50, top: 50 };
  const dx = position.left - boardCenter.left;
  const dy = position.top - boardCenter.top;
  const angleRadians = Math.atan2(dy, dx);
  // Convert radians to degrees and add 90 to orient the top of the piece away from the board center
  return angleRadians * (180 / Math.PI) + 90;
}

/**
 * For a given player count, finds the nearest valid and vacant drop location.
 * @param dropPosition The position where the user tried to drop the piece.
 * @param allPieces The list of all pieces currently on the board.
 * @param playerCount The number of players.
 * @returns The position and ID of the nearest vacant spot, or null if all are occupied or too far away.
 */
export function findNearestVacantLocation(
  dropPosition: { top: number; left: number },
  allPieces: Piece[],
  playerCount: number
): { position: { top: number; left: number }; id: string } | null {
  const validLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!validLocations || validLocations.length === 0) {
    return null;
  }

  // Find the list of locations that have at least one open slot.
  const vacantLocations = validLocations.filter(loc => {
    // Count how many total slots are defined at this exact coordinate.
    const capacityAtCoord = validLocations.filter(otherLoc =>
        Math.abs(otherLoc.position.left - loc.position.left) < 0.01 &&
        Math.abs(otherLoc.position.top - loc.position.top) < 0.01
    ).length;

    // Count how many pieces are already at this exact coordinate.
    const piecesAtCoord = allPieces.filter(piece =>
        Math.abs(piece.position.left - loc.position.left) < 0.01 &&
        Math.abs(piece.position.top - loc.position.top) < 0.01
    ).length;

    return piecesAtCoord < capacityAtCoord;
  });

  if (vacantLocations.length === 0) {
    return null; // No vacant spots available
  }

  // Distance calculation function
  const calculateDistance = (pos1: {left: number, top: number}, pos2: {left: number, top: number}): number => {
    return Math.sqrt(Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2));
  }

  // Find the nearest location using consistent distance thresholds
  let nearestLocation: DropLocation | null = null;
  let minDistance = Infinity;

  for (const loc of vacantLocations) {
    const distance = calculateDistance(dropPosition, loc.position);

    // Determine the maximum distance threshold based on location type
    let maxDistance = 12.0; // Default for regular locations (seats)
    if (loc.id.includes('community')) {
      maxDistance = 9.0; // Community locations are easier to target
    } else if (loc.id.includes('rostrum') || loc.id.includes('office')) {
      maxDistance = 15.0; // Rostrums and offices get a larger drop radius for better UX
    }

    // Check if this location is within its type's threshold and closer than previous nearest
    if (distance < maxDistance && distance < minDistance) {
      minDistance = distance;
      nearestLocation = loc;
    }
  }

  if (nearestLocation) {
    return { position: nearestLocation.position, id: nearestLocation.id };
  }

  return null;
}

/**
 * Given a position, finds the ID of the closest drop location.
 * @param position The position to check.
 * @param playerCount The number of players.
 * @returns The string ID of the location, or null.
 */
export function getLocationIdFromPosition(
  position: { top: number; left: number },
  playerCount: number
): string | null {
  const allLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!allLocations) return null;

  let closestLocationId: string | null = null;
  let minDistance = Infinity;

  const calculateDistance = (pos1: { left: number; top: number }, pos2: { left: number; top: number }): number => {
    return Math.sqrt(Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2));
  };

  for (const loc of allLocations) {
    if (Math.abs(loc.position.left - position.left) < 0.01 && Math.abs(loc.position.top - position.top) < 0.01) {
      return loc.id;
    }
    const distance = calculateDistance(position, loc.position);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocationId = loc.id;
    }
  }

  return minDistance < 5.0 ? closestLocationId : null;
}

/**
 * Formats a location ID string into a human-readable format.
 * @param locationId The location ID (e.g., 'p1_seat4').
 * @returns A formatted string (e.g., "Player 1's seat 4").
 */
export function formatLocationId(locationId: string): string {
    if (!locationId) return "an unknown location";

    const parts = locationId.split('_');
    if (parts.length < 2) return locationId;

    const playerId = parts[0].replace('p', '');
    const locationName = parts.slice(1).join(' ');

    if (locationName === 'office') {
        return `Player ${playerId}'s office`;
    }
    
    const match = locationName.match(/(\D+)(\d+)/);
    if (match) {
        const [, type, num] = match;
        return `Player ${playerId}'s ${type} ${num}`;
    }
    
    return `Player ${playerId}'s ${locationName}`;
}

/**
 * Extracts the player ID from a location ID (e.g., 'p1_seat1' -> 1).
 * @param locationId The location ID to parse.
 * @returns The player ID as a number, or null if not a player-owned location.
 */
export function getPlayerIdFromLocationId(locationId: string): number | null {
  if (!locationId) return null;
  const match = locationId.match(/^p(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if a location is owned by a specific player (seat, rostrum, or office).
 * @param locationId The location ID to check.
 * @param playerId The player ID to verify ownership.
 * @returns True if the location belongs to the player.
 */
export function isLocationOwnedByPlayer(locationId: string, playerId: number): boolean {
  const ownerId = getPlayerIdFromLocationId(locationId);
  return ownerId === playerId;
}

/**
 * Gets the player's rostrum rules.
 * @param playerId The player ID (1-5).
 * @returns The PlayerRostrum object containing rostrum support rules and office location.
 */
export function getPlayerRostrumRules(playerId: number): PlayerRostrum | null {
  return ROSTRUM_SUPPORT_RULES[playerId] || null;
}

/**
 * Finds the rostrum support rule for a specific rostrum ID.
 * @param rostrumId The rostrum ID (e.g., 'p1_rostrum1').
 * @returns The RostrumSupport object, or null if not found.
 */
export function getRostrumSupportRule(rostrumId: string): RostrumSupport | null {
  const playerId = getPlayerIdFromLocationId(rostrumId);
  if (!playerId) return null;

  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return null;

  return playerRules.rostrums.find(r => r.rostrum === rostrumId) || null;
}

/**
 * Counts how many pieces currently occupy a set of seats.
 * @param seatIds The seat IDs to check.
 * @param pieces The current pieces on the board.
 * @returns The number of pieces in the specified seats.
 */
export function countPiecesInSeats(seatIds: string[], pieces: Piece[]): number {
  return pieces.filter(piece =>
    piece.locationId && seatIds.includes(piece.locationId)
  ).length;
}

/**
 * Checks if all supporting seats for a rostrum are full.
 * @param rostrumId The rostrum ID to check.
 * @param pieces The current pieces on the board.
 * @returns True if all 3 supporting seats are occupied.
 */
export function areSupportingSeatsFullForRostrum(rostrumId: string, pieces: Piece[]): boolean {
  const rule = getRostrumSupportRule(rostrumId);
  if (!rule) return false;

  const occupiedCount = countPiecesInSeats(rule.supportingSeats, pieces);
  return occupiedCount === rule.supportingSeats.length; // All 3 seats must be full
}

/**
 * Counts how many pieces occupy a player's rostrums.
 * @param playerId The player ID.
 * @param pieces The current pieces on the board.
 * @returns The number of pieces in the player's rostrums.
 */
export function countPiecesInPlayerRostrums(playerId: number, pieces: Piece[]): number {
  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return 0;

  const rostrumIds = playerRules.rostrums.map(r => r.rostrum);
  return pieces.filter(piece =>
    piece.locationId && rostrumIds.includes(piece.locationId)
  ).length;
}

/**
 * Checks if both of a player's rostrums are filled (at least one piece in each).
 * @param playerId The player ID.
 * @param pieces The current pieces on the board.
 * @returns True if both rostrums contain at least one piece.
 */
export function areBothRostrumsFilledForPlayer(playerId: number, pieces: Piece[]): boolean {
  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return false;

  for (const rostrumRule of playerRules.rostrums) {
    const haspiece = pieces.some(p => p.locationId === rostrumRule.rostrum);
    if (!haspiece) return false; // At least one rostrum is empty
  }

  return true; // Both rostrums have pieces
}

/**
 * Checks if a piece can be moved to a specific location based on game rules.
 *
 * RULES:
 * 1. Pieces can only be moved to rostrums if ALL supporting seats are full
 * 2. Pieces can only be moved to a player's office if BOTH rostrums are filled
 * 3. Opponents cannot move a piece to another player's rostrum or office
 * 4. Opponents cannot move a piece FROM another player's rostrum or office
 * 5. Community spaces are always accessible (no restrictions)
 *
 * @param pieceId The ID of the piece being moved.
 * @param currentLocationId The current location of the piece.
 * @param targetLocationId The target location for the piece.
 * @param movingPlayerId The ID of the player making the move.
 * @param pieces The current pieces on the board.
 * @returns An object with { isAllowed: boolean, reason: string }
 */
export function validatePieceMovement(
  pieceId: string,
  currentLocationId: string | undefined,
  targetLocationId: string,
  movingPlayerId: number,
  pieces: Piece[]
): { isAllowed: boolean; reason: string } {
  // Community locations are always accessible
  if (targetLocationId.includes('community')) {
    return { isAllowed: true, reason: 'Community spaces are always accessible' };
  }

  const targetPlayerId = getPlayerIdFromLocationId(targetLocationId);
  if (!targetPlayerId) {
    return { isAllowed: true, reason: 'Location has no ownership restrictions' };
  }

  const currentPlayerId = currentLocationId ? getPlayerIdFromLocationId(currentLocationId) : null;
  const isOwnPiece = currentPlayerId === movingPlayerId || movingPlayerId === targetPlayerId;

  // --- RULE 3 & 4: Protected Movement - Opponents cannot move between player-owned locations ---
  if (currentPlayerId && currentPlayerId !== movingPlayerId) {
    // Trying to move an opponent's piece FROM their seat, rostrum, or office
    if (currentLocationId?.includes('seat') || currentLocationId?.includes('rostrum') || currentLocationId?.includes('office')) {
      return {
        isAllowed: false,
        reason: `Cannot move opponent's piece from ${formatLocationId(currentLocationId)}`,
      };
    }
  }

  // --- Moving to a ROSTRUM ---
  if (targetLocationId.includes('rostrum')) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's rostrum`,
      };
    }

    // RULE 1: Check if all supporting seats are full
    if (!areSupportingSeatsFullForRostrum(targetLocationId, pieces)) {
      const rule = getRostrumSupportRule(targetLocationId);
      if (rule) {
        const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
        return {
          isAllowed: false,
          reason: `Cannot move to ${formatLocationId(targetLocationId)} - only ${occupied}/3 supporting seats are full`,
        };
      }
    }

    return { isAllowed: true, reason: 'All supporting seats are full' };
  }

  // --- Moving to an OFFICE ---
  if (targetLocationId.includes('office')) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's office`,
      };
    }

    // RULE 2: Check if both rostrums are filled
    if (!areBothRostrumsFilledForPlayer(targetPlayerId, pieces)) {
      return {
        isAllowed: false,
        reason: `Cannot move to office - not both rostrums are filled yet`,
      };
    }

    return { isAllowed: true, reason: 'Both rostrums are filled' };
  }

  // --- Moving to opponent's SEAT ---
  if (targetLocationId.includes('seat') && targetPlayerId !== movingPlayerId) {
    return {
      isAllowed: false,
      reason: `Cannot move a piece to opponent's seat`,
    };
  }

  return { isAllowed: true, reason: 'Move is valid' };
}

/**
 * Checks if two rostrums are adjacent (connected).
 * @param rostrum1 The first rostrum ID.
 * @param rostrum2 The second rostrum ID.
 * @param playerCount The number of players (3, 4, or 5).
 * @returns True if the rostrums are adjacent.
 */
export function areRostrumsAdjacent(
  rostrum1: string,
  rostrum2: string,
  playerCount: number
): boolean {
  const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount];
  if (!adjacencies) return false;

  return adjacencies.some(
    adj =>
      (adj.rostrum1 === rostrum1 && adj.rostrum2 === rostrum2) ||
      (adj.rostrum1 === rostrum2 && adj.rostrum2 === rostrum1)
  );
}

/**
 * Gets the adjacent rostrum for a given rostrum, if one exists.
 * @param rostrumId The rostrum ID to find the adjacent rostrum for.
 * @param playerCount The number of players (3, 4, or 5).
 * @returns The ID of the adjacent rostrum, or null if none exists.
 */
export function getAdjacentRostrum(rostrumId: string, playerCount: number): string | null {
  const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount];
  if (!adjacencies) return null;

  const adjacency = adjacencies.find(
    adj => adj.rostrum1 === rostrumId || adj.rostrum2 === rostrumId
  );

  if (!adjacency) return null;

  return adjacency.rostrum1 === rostrumId ? adjacency.rostrum2 : adjacency.rostrum1;
}

/**
 * Validates if a piece can move between two adjacent rostrums.
 *
 * ADJACENCY MOVEMENT RULES:
 * - Both rostrums must be adjacent
 * - The destination rostrum must have all supporting seats full (or be an opponent's adjacent rostrum)
 * - Only the owner of the source rostrum can initiate the move
 *
 * @param sourceRostrumId The rostrum the piece is moving from.
 * @param targetRostrumId The rostrum the piece is moving to.
 * @param movingPlayerId The ID of the player making the move.
 * @param playerCount The number of players.
 * @param pieces The current pieces on the board.
 * @returns An object with { isAllowed: boolean, reason: string }
 */
export function validateAdjacentRostrumMovement(
  sourceRostrumId: string,
  targetRostrumId: string,
  movingPlayerId: number,
  playerCount: number,
  pieces: Piece[]
): { isAllowed: boolean; reason: string } {
  // Check if rostrums are adjacent
  if (!areRostrumsAdjacent(sourceRostrumId, targetRostrumId, playerCount)) {
    return {
      isAllowed: false,
      reason: `${formatLocationId(sourceRostrumId)} and ${formatLocationId(targetRostrumId)} are not adjacent`,
    };
  }

  const sourcePlayerId = getPlayerIdFromLocationId(sourceRostrumId);
  const targetPlayerId = getPlayerIdFromLocationId(targetRostrumId);

  // Only the owner of the source rostrum can move pieces out of it
  if (sourcePlayerId !== movingPlayerId) {
    return {
      isAllowed: false,
      reason: `Cannot move opponent's piece from ${formatLocationId(sourceRostrumId)}`,
    };
  }

  // The destination rostrum must have all supporting seats full
  if (!areSupportingSeatsFullForRostrum(targetRostrumId, pieces)) {
    const rule = getRostrumSupportRule(targetRostrumId);
    if (rule) {
      const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
      return {
        isAllowed: false,
        reason: `Cannot move to ${formatLocationId(targetRostrumId)} - only ${occupied}/3 supporting seats are full`,
      };
    }
  }

  return { isAllowed: true, reason: 'Adjacent rostrum movement is valid' };
}


/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

/**
 * Creates the initial set of game pieces.
 * Per the rules, games start with 3 Marks pre-placed for each player on seats 1, 3, and 5.
 * @param playerCount The number of players in the game.
 * @returns An array of Piece objects.
 */
export function initializePieces(playerCount: number): Piece[] {
  const initialPieces: Piece[] = [];
  const dropLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!dropLocations) return [];

  const markInfo = PIECE_TYPES.MARK;
  const seatsToPlace = [1, 3, 5];

  for (let playerId = 1; playerId <= playerCount; playerId++) {
    for (const seatNum of seatsToPlace) {
      const seatId = `p${playerId}_seat${seatNum}`;
      const location = dropLocations.find(loc => loc.id === seatId);

      if (location) {
        const position = location.position;
        const newPiece: Piece = {
          id: `initial_p${playerId}_mark_seat${seatNum}`,
          name: markInfo.name,
          imageUrl: markInfo.imageUrl,
          position: position,
          rotation: calculatePieceRotation(position, playerCount, seatId),
          locationId: seatId,
        };
        initialPieces.push(newPiece);
      } else {
        console.warn(`Could not find location for ${seatId}`);
      }
    }
  }

  return initialPieces;
}

/**
 * Creates the initial set of players with shuffled, dealt hands.
 * @param playerCount The number of players in the game.
 * @returns An array of Player objects.
 */
export function initializePlayers(playerCount: number): Player[] {
  const allTiles: Tile[] = TILE_IMAGE_URLS.map((url, index) => ({ id: index + 1, url }));

  if (playerCount === 5) {
    allTiles.push({
      id: 25,
      // A blank SVG that will allow the background color of its container to show through,
      // effectively creating a blank tile.
      url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
    });
  }

  const shuffledTiles = shuffle(allTiles);

  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    hand: [],
    keptTiles: [],
    bureaucracyTiles: [],
  }));

  // Deal all available tiles
  let tileIndex = 0;
  while (tileIndex < shuffledTiles.length) {
    for (let i = 0; i < playerCount && tileIndex < shuffledTiles.length; i++) {
      players[i].hand.push(shuffledTiles[tileIndex]);
      tileIndex++;
    }
  }

  return players;
}

// Default piece positions for campaign start
export const DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT: { [key: number]: { name: string; displayName: string; position: { left: number; top: number } }[] } = {
  3: [
    // Marks
    { name: 'Mark', displayName: 'M1', position: { left: 48.3, top: 29.9 } },
    { name: 'Mark', displayName: 'M2', position: { left: 40.0, top: 35.6 } },
    { name: 'Mark', displayName: 'M3', position: { left: 37.3, top: 43.9 } },
    { name: 'Mark', displayName: 'M4', position: { left: 64.0, top: 48.8 } },
    { name: 'Mark', displayName: 'M5', position: { left: 63.8, top: 39.5 } },
    { name: 'Mark', displayName: 'M6', position: { left: 57.4, top: 32.9 } },
    { name: 'Mark', displayName: 'M7', position: { left: 40.2, top: 53.1 } },
    { name: 'Mark', displayName: 'M8', position: { left: 48.5, top: 58.4 } },
    { name: 'Mark', displayName: 'M9', position: { left: 57.7, top: 56.3 } },
    { name: 'Mark', displayName: 'M10', position: { left: 58.7, top: 45.0 } },
    { name: 'Mark', displayName: 'M11', position: { left: 46.4, top: 46.1 } },
    { name: 'Mark', displayName: 'M12', position: { left: 56.0, top: 46.1 } },
    // Heels
    { name: 'Heel', displayName: 'H1', position: { left: 45.2, top: 38.0 } },
    { name: 'Heel', displayName: 'H2', position: { left: 48.7, top: 38.0 } },
    { name: 'Heel', displayName: 'H3', position: { left: 52.2, top: 38.0 } },
    { name: 'Heel', displayName: 'H4', position: { left: 55.7, top: 38.0 } },
    { name: 'Heel', displayName: 'H5', position: { left: 45.2, top: 42.0 } },
    { name: 'Heel', displayName: 'H6', position: { left: 48.7, top: 42.0 } },
    { name: 'Heel', displayName: 'H7', position: { left: 52.2, top: 42.0 } },
    { name: 'Heel', displayName: 'H8', position: { left: 55.7, top: 42.0 } },
    { name: 'Heel', displayName: 'H9', position: { left: 50.4, top: 46.0 } },
    // Pawns
    { name: 'Pawn', displayName: 'P1', position: { left: 46.9, top: 50.0 } },
    { name: 'Pawn', displayName: 'P2', position: { left: 50.4, top: 50.0 } },
    { name: 'Pawn', displayName: 'P3', position: { left: 53.9, top: 50.0 } },
  ],
  4: [
    // Marks
    { name: 'Mark', displayName: 'M1', position: { left: 42.83, top: 34.48 } },
    { name: 'Mark', displayName: 'M2', position: { left: 67.62, top: 43.57 } },
    { name: 'Mark', displayName: 'M3', position: { left: 34.17, top: 40.50 } },
    { name: 'Mark', displayName: 'M4', position: { left: 31.02, top: 48.79 } },
    { name: 'Mark', displayName: 'M5', position: { left: 61.80, top: 36.60 } },
    { name: 'Mark', displayName: 'M6', position: { left: 52.90, top: 33.50 } },
    { name: 'Mark', displayName: 'M7', position: { left: 57.60, top: 67.80 } },
    { name: 'Mark', displayName: 'M8', position: { left: 65.40, top: 61.70 } },
    { name: 'Mark', displayName: 'M9', position: { left: 69.10, top: 53.50 } },
    { name: 'Mark', displayName: 'M10', position: { left: 32.20, top: 58.00 } },
    { name: 'Mark', displayName: 'M11', position: { left: 38.50, top: 65.50 } },
    { name: 'Mark', displayName: 'M12', position: { left: 47.60, top: 68.50 } },
    { name: 'Mark', displayName: 'M13', position: { left: 44.70, top: 41.60 } },
    { name: 'Mark', displayName: 'M14', position: { left: 48.20, top: 41.60 } },
    { name: 'Mark', displayName: 'M15', position: { left: 51.70, top: 41.60 } },
    { name: 'Mark', displayName: 'M16', position: { left: 55.20, top: 41.60 } },
    // Heels
    { name: 'Heel', displayName: 'H1', position: { left: 44.70, top: 45.60 } },
    { name: 'Heel', displayName: 'H2', position: { left: 48.20, top: 45.60 } },
    { name: 'Heel', displayName: 'H3', position: { left: 51.70, top: 45.60 } },
    { name: 'Heel', displayName: 'H4', position: { left: 55.20, top: 45.60 } },
    { name: 'Heel', displayName: 'H5', position: { left: 44.70, top: 49.60 } },
    { name: 'Heel', displayName: 'H6', position: { left: 48.20, top: 49.60 } },
    { name: 'Heel', displayName: 'H7', position: { left: 51.70, top: 49.60 } },
    { name: 'Heel', displayName: 'H8', position: { left: 55.20, top: 49.60 } },
    { name: 'Heel', displayName: 'H9', position: { left: 44.70, top: 53.60 } },
    { name: 'Heel', displayName: 'H10', position: { left: 48.20, top: 53.60 } },
    { name: 'Heel', displayName: 'H11', position: { left: 51.70, top: 53.60 } },
    { name: 'Heel', displayName: 'H12', position: { left: 55.20, top: 53.60 } },
    // Pawns
    { name: 'Pawn', displayName: 'P1', position: { left: 44.70, top: 57.60 } },
    { name: 'Pawn', displayName: 'P2', position: { left: 48.20, top: 57.60 } },
    { name: 'Pawn', displayName: 'P3', position: { left: 51.70, top: 57.60 } },
    { name: 'Pawn', displayName: 'P4', position: { left: 55.20, top: 57.60 } },
  ],
  5: [
    // Marks
    { name: 'Mark', displayName: 'M1', position: { left: 29.0, top: 44.1 } },
    { name: 'Mark', displayName: 'M2', position: { left: 29.0, top: 51.8 } },
    { name: 'Mark', displayName: 'M3', position: { left: 32.6, top: 58.6 } },
    { name: 'Mark', displayName: 'M4', position: { left: 44.8, top: 29.0 } },
    { name: 'Mark', displayName: 'M5', position: { left: 38.3, top: 32.4 } },
    { name: 'Mark', displayName: 'M6', position: { left: 31.6, top: 37.1 } },
    { name: 'Mark', displayName: 'M7', position: { left: 65.3, top: 38.7 } },
    { name: 'Mark', displayName: 'M8', position: { left: 60.5, top: 32.5 } },
    { name: 'Mark', displayName: 'M9', position: { left: 53.0, top: 29.3 } },
    { name: 'Mark', displayName: 'M10', position: { left: 61.6, top: 60.0 } },
    { name: 'Mark', displayName: 'M11', position: { left: 66.1, top: 53.7 } },
    { name: 'Mark', displayName: 'M12', position: { left: 67.2, top: 46.2 } },
    { name: 'Mark', displayName: 'M13', position: { left: 39.2, top: 63.4 } },
    { name: 'Mark', displayName: 'M14', position: { left: 47.0, top: 65.5 } },
    { name: 'Mark', displayName: 'M15', position: { left: 54.9, top: 64.3 } },
    { name: 'Mark', displayName: 'M16', position: { left: 42.5, top: 36.9 } },
    { name: 'Mark', displayName: 'M17', position: { left: 46.0, top: 36.9 } },
    { name: 'Mark', displayName: 'M18', position: { left: 49.5, top: 36.9 } },
    { name: 'Mark', displayName: 'M19', position: { left: 53.0, top: 36.9 } },
    { name: 'Mark', displayName: 'M20', position: { left: 47.8, top: 40.9 } },
    // Heels
    { name: 'Heel', displayName: 'H1', position: { left: 42.5, top: 44.9 } },
    { name: 'Heel', displayName: 'H2', position: { left: 46.0, top: 44.9 } },
    { name: 'Heel', displayName: 'H3', position: { left: 49.5, top: 44.9 } },
    { name: 'Heel', displayName: 'H4', position: { left: 53.0, top: 44.9 } },
    { name: 'Heel', displayName: 'H5', position: { left: 42.5, top: 48.9 } },
    { name: 'Heel', displayName: 'H6', position: { left: 46.0, top: 48.9 } },
    { name: 'Heel', displayName: 'H7', position: { left: 49.5, top: 48.9 } },
    { name: 'Heel', displayName: 'H8', position: { left: 53.0, top: 48.9 } },
    { name: 'Heel', displayName: 'H9', position: { left: 42.5, top: 52.9 } },
    { name: 'Heel', displayName: 'H10', position: { left: 46.0, top: 52.9 } },
    { name: 'Heel', displayName: 'H11', position: { left: 49.5, top: 52.9 } },
    { name: 'Heel', displayName: 'H12', position: { left: 53.0, top: 52.9 } },
    { name: 'Heel', displayName: 'H13', position: { left: 44.3, top: 56.9 } },
    { name: 'Heel', displayName: 'H14', position: { left: 47.8, top: 56.9 } },
    { name: 'Heel', displayName: 'H15', position: { left: 51.3, top: 56.9 } },
    // Pawns
    { name: 'Pawn', displayName: 'P1', position: { left: 37.9, top: 46.7 } },
    { name: 'Pawn', displayName: 'P2', position: { left: 37.8, top: 50.3 } },
    { name: 'Pawn', displayName: 'P3', position: { left: 57.4, top: 53.4 } },
    { name: 'Pawn', displayName: 'P4', position: { left: 57.8, top: 49.4 } },
    { name: 'Pawn', displayName: 'P5', position: { left: 37.9, top: 54.1 } },
  ],
};

// ============================================================================
// MOVE VALIDATION AND TRACKING FUNCTIONS
// ============================================================================

/**
 * Validates that moves performed match the allowed categories during tile play.
 * During tile play, a player may perform up to 2 moves: max 1 "O" and 1 "M" move.
 * @param movesPerformed Array of tracked moves
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateMovesForTilePlay(movesPerformed: TrackedMove[]): {
  isValid: boolean;
  error?: string;
} {
  if (movesPerformed.length > 2) {
    return { isValid: false, error: 'Maximum 2 moves allowed per tile play' };
  }

  const oMoveCount = movesPerformed.filter((m) => m.category === 'O').length;
  const mMoveCount = movesPerformed.filter((m) => m.category === 'M').length;

  if (oMoveCount > 1) {
    return { isValid: false, error: 'Maximum 1 "O" move allowed' };
  }

  if (mMoveCount > 1) {
    return { isValid: false, error: 'Maximum 1 "M" move allowed' };
  }

  return { isValid: true };
}

/**
 * Checks if all required moves for a tile have been performed.
 * @param tileId The tile ID
 * @param movesPerformed Array of moves performed
 * @returns Object with isMet boolean and which required moves are missing
 */
export function validateTileRequirements(
  tileId: string,
  movesPerformed: TrackedMove[]
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);
  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  const missingMoves = requirements.requiredMoves.filter(
    (required) => !performedMoveTypes.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves: requirements.requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves: missingMoves,
  };
}

/**
 * Creates a snapshot of the current game state for later restoration.
 * @param pieces Current pieces on board
 * @param boardTiles Current board tiles
 * @returns Snapshot of game state
 */
export function createGameStateSnapshot(
  pieces: Piece[],
  boardTiles: BoardTile[]
): PlayedTileState['gameStateSnapshot'] {
  return {
    pieces: pieces.map((p) => ({ ...p })),
    boardTiles: boardTiles.map((t) => ({ ...t })),
  };
}

/**
 * Determines the order of players for challenging, starting clockwise from the tile player.
 * @param tilePlayerId The player who played the tile
 * @param playerCount Total number of players
 * @returns Array of player IDs in challenge order
 */
export function getChallengeOrder(
  tilePlayerId: number,
  playerCount: number
): number[] {
  const challengeOrder: number[] = [];

  // Start from the next player clockwise from the tile player
  for (let i = 1; i < playerCount; i++) {
    const playerId = ((tilePlayerId - 1 + i) % playerCount) + 1;
    // Skip the receiving player (which is the tile player + 1, wrapping around)
    if (playerId !== tilePlayerId) {
      challengeOrder.push(playerId);
    }
  }

  return challengeOrder;
}