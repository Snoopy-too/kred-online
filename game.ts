

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

export type GameState = 'PLAYER_SELECTION' | 'DRAFTING' | 'CAMPAIGN' | 'PENDING_ACCEPTANCE' | 'PENDING_CHALLENGE';

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
  { id: 'p1_office', position: { left: 29.84, top: 32.62 } },
  { id: 'p2_office', position: { left: 71.03, top: 32.18 } },
  { id: 'p3_office', position: { left: 50.88, top: 67.97 } },
  // Community (spread out to avoid overlap)
  { id: 'community1', position: { left: 50.00, top: 35.00 } },
  { id: 'community2', position: { left: 35.00, top: 50.00 } },
  { id: 'community3', position: { left: 50.00, top: 50.00 } },
  { id: 'community4', position: { left: 65.00, top: 50.00 } },
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
    { id: 'p2_seat1', position: { left: 69.26, top: 44.88 } },
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
    { id: 'p1_office', position: { left: 24.94, top: 38.95 } },
    { id: 'p2_office', position: { left: 62.98, top: 27.89 } },
    { id: 'p3_office', position: { left: 74.89, top: 63.39 } },
    { id: 'p4_office', position: { left: 38.38, top: 74.98 } },
    // Community (spread out to avoid overlap)
    { id: 'community1', position: { left: 50.00, top: 35.00 } },
    { id: 'community2', position: { left: 30.00, top: 45.00 } },
    { id: 'community3', position: { left: 70.00, top: 45.00 } },
    { id: 'community4', position: { left: 40.00, top: 60.00 } },
    { id: 'community5', position: { left: 50.00, top: 60.00 } },
    { id: 'community6', position: { left: 60.00, top: 60.00 } },
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
    { id: 'p1_office', position: { left: 19.35, top: 51.67 } },
    { id: 'p2_office', position: { left: 34.75, top: 23.43 } },
    { id: 'p3_office', position: { left: 67.74, top: 27.25 } },
    { id: 'p4_office', position: { left: 73.19, top: 58.82 } },
    { id: 'p5_office', position: { left: 43.93, top: 73.60 } },
    // Community (spread out to avoid overlap)
    { id: 'community1', position: { left: 50.00, top: 30.00 } },
    { id: 'community2', position: { left: 25.00, top: 45.00 } },
    { id: 'community3', position: { left: 75.00, top: 45.00 } },
    { id: 'community4', position: { left: 35.00, top: 65.00 } },
    { id: 'community5', position: { left: 50.00, top: 65.00 } },
    { id: 'community6', position: { left: 65.00, top: 65.00 } },
    { id: 'community7', position: { left: 50.00, top: 50.00 } },
];

export const DROP_LOCATIONS_BY_PLAYER_COUNT: { [playerCount: number]: DropLocation[] } = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};

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
    { ownerId: 1, position: { left: 17.74, top: 19.92 }, rotation: -225 },
    { ownerId: 2, position: { left: 81.30, top: 18.75 }, rotation: -135 },
    { ownerId: 3, position: { left: 82.58, top: 82.31 }, rotation: -45 },
    { ownerId: 4, position: { left: 18.80, top: 83.38 }, rotation: 45 },
];

const FIVE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
    { ownerId: 1, position: { left: 10.51, top: 63.82 }, rotation: -315 },
    { ownerId: 2, position: { left: 19.97, top: 16.84 }, rotation: -240 },
    { ownerId: 3, position: { left: 68.34, top: 10.99 }, rotation: -165 },
    { ownerId: 4, position: { left: 88.64, top: 55.31 }, rotation: -90 },
    { ownerId: 5, position: { left: 52.18, top: 88.27 }, rotation: -30 },
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
 * Calculates the rotation of a piece so its bottom faces the board center.
 * Community pieces have no rotation (0 degrees).
 * @param position The position of the piece in percentage { top, left }.
 * @param playerCount The number of players in the game.
 * @param locationId Optional location ID to check if it's a community location.
 * @returns The rotation in degrees.
 */
export function calculatePieceRotation(position: { top: number; left: number }, playerCount: number, locationId?: string): number {
  // Community pieces have no rotation
  if (locationId && locationId.startsWith('community')) {
    return 0;
  }

  const boardCenter = BOARD_CENTERS[playerCount] || { left: 50, top: 50 };
  const dx = position.left - boardCenter.left;
  const dy = position.top - boardCenter.top;
  const angleRadians = Math.atan2(dy, dx);
  // Convert radians to degrees and add 90 to align the 'top' of the image away from the center
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
  
  // From the available locations, find the one closest to the drop point.
  const calculateDistance = (pos1: {left: number, top: number}, pos2: {left: number, top: number}): number => {
    return Math.sqrt(Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2));
  }

  // First, check for a community location nearby (prioritize community)
  let communityLocation: DropLocation | null = null;
  let minCommunityDistance = Infinity;

  for (const loc of vacantLocations) {
    if (loc.id.includes('community')) {
      const distance = calculateDistance(dropPosition, loc.position);
      if (distance < minCommunityDistance) {
        minCommunityDistance = distance;
        communityLocation = loc;
      }
    }
  }

  // If we found a nearby community location (within 9.0), return it
  if (communityLocation && minCommunityDistance < 9.0) {
    return { position: communityLocation.position, id: communityLocation.id };
  }

  // Otherwise, find the nearest non-community location
  let nearestLocation: DropLocation | null = null;
  let minDistance = Infinity;

  for (const loc of vacantLocations) {
    if (!loc.id.includes('community')) {
      const distance = calculateDistance(dropPosition, loc.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = loc;
      }
    }
  }

  if (nearestLocation) {
    const isRostrum = nearestLocation.id.includes('rostrum');
    // Rostrums get a larger drop radius to make them less fickle.
    const maxDistance = isRostrum ? 9.0 : 6.0;
    if (minDistance < maxDistance) {
      return { position: nearestLocation.position, id: nearestLocation.id };
    }
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

  return minDistance < 1.0 ? closestLocationId : null;
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
    { name: 'Mark', displayName: 'M1', position: { left: 42.8, top: 34.5 } },
    { name: 'Mark', displayName: 'M2', position: { left: 34.9, top: 40.2 } },
    { name: 'Mark', displayName: 'M3', position: { left: 31.7, top: 48.6 } },
    { name: 'Mark', displayName: 'M4', position: { left: 68.0, top: 44.0 } },
    { name: 'Mark', displayName: 'M5', position: { left: 61.8, top: 36.6 } },
    { name: 'Mark', displayName: 'M6', position: { left: 52.9, top: 33.5 } },
    { name: 'Mark', displayName: 'M7', position: { left: 57.6, top: 67.8 } },
    { name: 'Mark', displayName: 'M8', position: { left: 65.4, top: 61.7 } },
    { name: 'Mark', displayName: 'M9', position: { left: 69.1, top: 53.5 } },
    { name: 'Mark', displayName: 'M10', position: { left: 32.2, top: 58.0 } },
    { name: 'Mark', displayName: 'M11', position: { left: 38.5, top: 65.5 } },
    { name: 'Mark', displayName: 'M12', position: { left: 47.6, top: 68.5 } },
    { name: 'Mark', displayName: 'M13', position: { left: 44.7, top: 41.6 } },
    { name: 'Mark', displayName: 'M14', position: { left: 48.2, top: 41.6 } },
    { name: 'Mark', displayName: 'M15', position: { left: 51.7, top: 41.6 } },
    { name: 'Mark', displayName: 'M16', position: { left: 55.2, top: 41.6 } },
    // Heels
    { name: 'Heel', displayName: 'H1', position: { left: 44.7, top: 45.6 } },
    { name: 'Heel', displayName: 'H2', position: { left: 48.2, top: 45.6 } },
    { name: 'Heel', displayName: 'H3', position: { left: 51.7, top: 45.6 } },
    { name: 'Heel', displayName: 'H4', position: { left: 55.2, top: 45.6 } },
    { name: 'Heel', displayName: 'H5', position: { left: 44.7, top: 49.6 } },
    { name: 'Heel', displayName: 'H6', position: { left: 48.2, top: 49.6 } },
    { name: 'Heel', displayName: 'H7', position: { left: 51.7, top: 49.6 } },
    { name: 'Heel', displayName: 'H8', position: { left: 55.2, top: 49.6 } },
    { name: 'Heel', displayName: 'H9', position: { left: 44.7, top: 53.6 } },
    { name: 'Heel', displayName: 'H10', position: { left: 48.2, top: 53.6 } },
    { name: 'Heel', displayName: 'H11', position: { left: 51.7, top: 53.6 } },
    { name: 'Heel', displayName: 'H12', position: { left: 55.2, top: 53.6 } },
    // Pawns
    { name: 'Pawn', displayName: 'P1', position: { left: 44.7, top: 57.6 } },
    { name: 'Pawn', displayName: 'P2', position: { left: 48.2, top: 57.6 } },
    { name: 'Pawn', displayName: 'P3', position: { left: 51.7, top: 57.6 } },
    { name: 'Pawn', displayName: 'P4', position: { left: 55.2, top: 57.6 } },
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