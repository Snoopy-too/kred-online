/**
 * Adjacency Rules
 * Defines seat and rostrum adjacency rules and helper functions
 */

import { Piece } from '../types';

/**
 * Rostrum support structure
 * Each rostrum is supported by exactly 3 seats
 */
export interface RostrumSupport {
  rostrum: string; // e.g., 'p1_rostrum1'
  supportingSeats: string[]; // e.g., ['p1_seat1', 'p1_seat2', 'p1_seat3']
}

/**
 * Player rostrum configuration
 */
export interface PlayerRostrum {
  playerId: number;
  rostrums: RostrumSupport[];
  office: string; // e.g., 'p1_office'
}

/**
 * Rostrum adjacency pair
 */
export interface RostrumAdjacency {
  rostrum1: string;
  rostrum2: string;
}

/**
 * Comprehensive mapping of rostrums to their supporting seats for all players.
 * The structure is the same regardless of player count (3, 4, or 5 players).
 * - Seats 1-3 support Rostrum 1
 * - Seats 4-6 support Rostrum 2
 */
export const ROSTRUM_SUPPORT_RULES: { [playerId: number]: PlayerRostrum } = {
  1: {
    playerId: 1,
    rostrums: [
      {
        rostrum: 'p1_rostrum1',
        supportingSeats: ['p1_seat1', 'p1_seat2', 'p1_seat3'],
      },
      {
        rostrum: 'p1_rostrum2',
        supportingSeats: ['p1_seat4', 'p1_seat5', 'p1_seat6'],
      },
    ],
    office: 'p1_office',
  },
  2: {
    playerId: 2,
    rostrums: [
      {
        rostrum: 'p2_rostrum1',
        supportingSeats: ['p2_seat1', 'p2_seat2', 'p2_seat3'],
      },
      {
        rostrum: 'p2_rostrum2',
        supportingSeats: ['p2_seat4', 'p2_seat5', 'p2_seat6'],
      },
    ],
    office: 'p2_office',
  },
  3: {
    playerId: 3,
    rostrums: [
      {
        rostrum: 'p3_rostrum1',
        supportingSeats: ['p3_seat1', 'p3_seat2', 'p3_seat3'],
      },
      {
        rostrum: 'p3_rostrum2',
        supportingSeats: ['p3_seat4', 'p3_seat5', 'p3_seat6'],
      },
    ],
    office: 'p3_office',
  },
  4: {
    playerId: 4,
    rostrums: [
      {
        rostrum: 'p4_rostrum1',
        supportingSeats: ['p4_seat1', 'p4_seat2', 'p4_seat3'],
      },
      {
        rostrum: 'p4_rostrum2',
        supportingSeats: ['p4_seat4', 'p4_seat5', 'p4_seat6'],
      },
    ],
    office: 'p4_office',
  },
  5: {
    playerId: 5,
    rostrums: [
      {
        rostrum: 'p5_rostrum1',
        supportingSeats: ['p5_seat1', 'p5_seat2', 'p5_seat3'],
      },
      {
        rostrum: 'p5_rostrum2',
        supportingSeats: ['p5_seat4', 'p5_seat5', 'p5_seat6'],
      },
    ],
    office: 'p5_office',
  },
};

/**
 * Rostrum-to-Rostrum adjacency rules by player count.
 * Certain rostrums are adjacent and allow direct piece movement between them.
 * Adjacency is bidirectional (can move in both directions).
 *
 * 3-Player: p1_r2 <-> p3_r1, p3_r2 <-> p2_r1, p2_r2 <-> p1_r1
 * 4-Player: p1_r2 <-> p4_r1, p4_r2 <-> p3_r1, p3_r2 <-> p2_r1, p2_r2 <-> p1_r1
 * 5-Player: p1_r2 <-> p5_r1, p5_r2 <-> p4_r1, p4_r2 <-> p3_r1, p3_r2 <-> p2_r1, p2_r2 <-> p1_r1
 */
export const ROSTRUM_ADJACENCY_BY_PLAYER_COUNT: {
  [playerCount: number]: RostrumAdjacency[];
} = {
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

// --- Helper Functions ---

/**
 * Gets the next player in clockwise order around the table.
 * 3-player: 1→3→2→1
 * 4-player: 1→2→3→4→1
 * 5-player: 1→2→3→4→5→1
 */
function getNextPlayerClockwise(
  playerId: number,
  playerCount: number
): number {
  if (playerCount === 3) {
    // Special case for 3 players: 1→3→2→1
    return playerId === 1 ? 3 : playerId === 3 ? 2 : 1;
  } else {
    // For 4 and 5 players: sequential
    return (playerId % playerCount) + 1;
  }
}

/**
 * Gets the previous player in clockwise order around the table (counter-clockwise).
 * 3-player: 1←3←2←1 (or 1→2→3→1 backward)
 * 4-player: 1←2←3←4←1
 * 5-player: 1←2←3←4←5←1
 */
function getPrevPlayerClockwise(
  playerId: number,
  playerCount: number
): number {
  if (playerCount === 3) {
    // Special case for 3 players
    return playerId === 1 ? 2 : playerId === 2 ? 3 : 1;
  } else {
    // For 4 and 5 players: sequential
    return playerId === 1 ? playerCount : playerId - 1;
  }
}

/**
 * Extracts the player ID from a location ID.
 * @param locationId Location ID like 'p1_seat3' or 'p2_rostrum1'
 * @returns Player ID or null if invalid
 */
export function getPlayerIdFromLocationId(locationId: string): number | null {
  if (!locationId) return null;
  const match = locationId.match(/^p(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Gets the player's rostrum rules.
 * @param playerId The player ID (1-5).
 * @returns The PlayerRostrum object containing rostrum support rules and office location.
 */
export function getPlayerRostrumRules(
  playerId: number
): PlayerRostrum | null {
  return ROSTRUM_SUPPORT_RULES[playerId] || null;
}

/**
 * Finds the rostrum support rule for a specific rostrum ID.
 * @param rostrumId The rostrum ID (e.g., 'p1_rostrum1').
 * @returns The RostrumSupport object, or null if not found.
 */
export function getRostrumSupportRule(
  rostrumId: string
): RostrumSupport | null {
  const playerId = getPlayerIdFromLocationId(rostrumId);
  if (!playerId) return null;

  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return null;

  return playerRules.rostrums.find((r) => r.rostrum === rostrumId) || null;
}

/**
 * Counts how many pieces currently occupy a set of seats.
 * @param seatIds The seat IDs to check.
 * @param pieces The current pieces on the board.
 * @returns The number of pieces in the specified seats.
 */
export function countPiecesInSeats(
  seatIds: string[],
  pieces: Piece[]
): number {
  return pieces.filter(
    (piece) => piece.locationId && seatIds.includes(piece.locationId)
  ).length;
}

/**
 * Checks if all supporting seats for a rostrum are full.
 * @param rostrumId The rostrum ID to check.
 * @param pieces The current pieces on the board.
 * @returns True if all 3 supporting seats are occupied.
 */
export function areSupportingSeatsFullForRostrum(
  rostrumId: string,
  pieces: Piece[]
): boolean {
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
export function countPiecesInPlayerRostrums(
  playerId: number,
  pieces: Piece[]
): number {
  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return 0;

  const rostrumIds = playerRules.rostrums.map((r) => r.rostrum);
  return pieces.filter(
    (piece) => piece.locationId && rostrumIds.includes(piece.locationId)
  ).length;
}

/**
 * Checks if both of a player's rostrums are filled (at least one piece in each).
 * @param playerId The player ID.
 * @param pieces The current pieces on the board.
 * @returns True if both rostrums contain at least one piece.
 */
export function areBothRostrumsFilledForPlayer(
  playerId: number,
  pieces: Piece[]
): boolean {
  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return false;

  for (const rostrumRule of playerRules.rostrums) {
    const hasPiece = pieces.some((p) => p.locationId === rostrumRule.rostrum);
    if (!hasPiece) return false; // At least one rostrum is empty
  }

  return true; // Both rostrums have pieces
}

/**
 * Checks if two rostrums are adjacent.
 * @param rostrum1 First rostrum ID
 * @param rostrum2 Second rostrum ID
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
    (adj) =>
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
export function getAdjacentRostrum(
  rostrumId: string,
  playerCount: number
): string | null {
  const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount];
  if (!adjacencies) return null;

  const adjacency = adjacencies.find(
    (adj) => adj.rostrum1 === rostrumId || adj.rostrum2 === rostrumId
  );

  if (!adjacency) return null;

  return adjacency.rostrum1 === rostrumId
    ? adjacency.rostrum2
    : adjacency.rostrum1;
}

/**
 * Determines if two seats are adjacent in the seating arrangement.
 * Seats are numbered 1-6 around each player's domain.
 *
 * Adjacent means:
 * - Same player: consecutive seats (1-2, 2-3, 3-4, 4-5, 5-6)
 * - Different players: wraps around table (player X seat6 <-> next player's seat1)
 *
 * @param seatId1 First seat ID (e.g., 'p1_seat1')
 * @param seatId2 Second seat ID (e.g., 'p2_seat6')
 * @param playerCount Total number of players (3, 4, or 5)
 * @returns True if the seats are adjacent
 */
export function areSeatsAdjacent(
  seatId1: string,
  seatId2: string,
  playerCount: number
): boolean {
  // Extract player ID and seat number from location IDs
  const match1 = seatId1.match(/p(\d+)_seat(\d)/);
  const match2 = seatId2.match(/p(\d+)_seat(\d)/);

  if (!match1 || !match2) return false;

  const player1 = parseInt(match1[1]);
  const seat1 = parseInt(match1[2]);
  const player2 = parseInt(match2[1]);
  const seat2 = parseInt(match2[2]);

  // Same player - seats must be consecutive
  if (player1 === player2) {
    return Math.abs(seat1 - seat2) === 1;
  }

  // Different players - check if they're at the boundary (wrapping around the table)
  const nextPlayer = getNextPlayerClockwise(player1, playerCount);
  const prevPlayer = getPrevPlayerClockwise(player1, playerCount);

  // Forward wrap: Player X seat6 is adjacent to next player's seat1
  if (player2 === nextPlayer && seat1 === 6 && seat2 === 1) {
    return true;
  }

  // Forward wrap (reversed): Player X seat1 is adjacent to previous player's seat6
  if (player2 === nextPlayer && seat1 === 1 && seat2 === 6) {
    return true;
  }

  // Backward wrap: Player X seat1 is adjacent to previous player's seat6
  if (player2 === prevPlayer && seat1 === 1 && seat2 === 6) {
    return true;
  }

  // Backward wrap (reversed): Player X seat6 is adjacent to previous player's seat1
  if (player2 === prevPlayer && seat1 === 6 && seat2 === 1) {
    return true;
  }

  return false;
}

/**
 * Gets all adjacent seats to a given seat.
 * Used for validating INFLUENCE and ORGANIZE moves.
 *
 * @param seatId The seat ID (e.g., 'p1_seat3')
 * @param playerCount Total number of players
 * @returns Array of adjacent seat IDs
 */
export function getAdjacentSeats(
  seatId: string,
  playerCount: number
): string[] {
  const match = seatId.match(/p(\d+)_seat(\d)/);
  if (!match) return [];

  const playerId = parseInt(match[1]);
  const seatNum = parseInt(match[2]);

  const adjacent: string[] = [];

  // Same player adjacent seats
  if (seatNum > 1) {
    adjacent.push(`p${playerId}_seat${seatNum - 1}`);
  }
  if (seatNum < 6) {
    adjacent.push(`p${playerId}_seat${seatNum + 1}`);
  }

  // Cross-player adjacency at boundaries
  if (seatNum === 1) {
    const prevPlayer = getPrevPlayerClockwise(playerId, playerCount);
    adjacent.push(`p${prevPlayer}_seat6`);
  }
  if (seatNum === 6) {
    const nextPlayer = getNextPlayerClockwise(playerId, playerCount);
    adjacent.push(`p${nextPlayer}_seat1`);
  }

  return adjacent;
}
