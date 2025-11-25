/**
 * Rostrum Rules - Rostrum support, adjacency, and movement validation
 *
 * Purpose: Functions for rostrum support rules, seat requirements, and adjacency
 * Dependencies: Types (Piece), Config (ROSTRUM_SUPPORT_RULES, ROSTRUM_ADJACENCY_BY_PLAYER_COUNT)
 * Usage: Used for rostrum movement validation and office access requirements
 *
 * @module rules/rostrum
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces
  Piece,

  // Rostrum types - support rules
  PlayerRostrum,
  RostrumSupport,
} from "../types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  // Rostrum rules - support requirements
  ROSTRUM_SUPPORT_RULES,

  // Rostrum adjacency - connected rostrums by player count
  ROSTRUM_ADJACENCY_BY_PLAYER_COUNT,
} from "../config";

// ============================================================================
// GAME LOGIC IMPORTS - Core game functions
// ============================================================================
import {
  // Location utilities - player ID extraction
  getPlayerIdFromLocationId,
} from "../game";

// ============================================================================
// UTILITY IMPORTS - Helper functions
// ============================================================================
import {
  // Location formatting - human-readable location names
  formatLocationId,
} from "../utils";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Gets the rostrum rules for a specific player
 *
 * Returns configuration defining:
 * - Which rostrums the player owns
 * - Supporting seat requirements for each rostrum
 *
 * @param playerId - The player ID (1-5)
 * @returns PlayerRostrum object with rostrum rules, or null if not found
 *
 * @example
 * ```typescript
 * const rules = getPlayerRostrumRules(1);
 * console.log(rules.rostrums); // [{ rostrum: 'p1_rostrum1', supportingSeats: [...] }, ...]
 * ```
 */
export function getPlayerRostrumRules(playerId: number): PlayerRostrum | null {
  return ROSTRUM_SUPPORT_RULES[playerId] || null;
}

/**
 * Finds the rostrum support rule for a specific rostrum ID
 *
 * Returns the configuration for a single rostrum including:
 * - The rostrum location ID
 * - The 3 seats that must be filled to access it
 *
 * @param rostrumId - The rostrum ID (e.g., 'p1_rostrum1')
 * @returns RostrumSupport object, or null if not found
 *
 * @example
 * ```typescript
 * const rule = getRostrumSupportRule("p1_rostrum1");
 * console.log(rule.supportingSeats); // ["p1_seat1", "p1_seat2", "p1_seat3"]
 * ```
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
 * Counts how many pieces currently occupy a set of seats
 *
 * Used to verify if rostrum support requirements are met.
 *
 * @param seatIds - The seat IDs to check
 * @param pieces - The current pieces on the board
 * @returns The number of pieces in the specified seats
 *
 * @example
 * ```typescript
 * const count = countPiecesInSeats(["p1_seat1", "p1_seat2", "p1_seat3"], pieces);
 * console.log(count); // 2 (if 2 of 3 seats are occupied)
 * ```
 */
export function countPiecesInSeats(seatIds: string[], pieces: Piece[]): number {
  return pieces.filter(
    (piece) => piece.locationId && seatIds.includes(piece.locationId)
  ).length;
}

/**
 * Checks if all supporting seats for a rostrum are full
 *
 * A rostrum requires all 3 of its supporting seats to be occupied
 * before pieces can be placed in it.
 *
 * @param rostrumId - The rostrum ID to check
 * @param pieces - The current pieces on the board
 * @returns true if all 3 supporting seats are occupied
 *
 * @example
 * ```typescript
 * if (areSupportingSeatsFullForRostrum("p1_rostrum1", pieces)) {
 *   console.log("Rostrum is accessible");
 * }
 * ```
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
 * Counts how many pieces occupy a player's rostrums
 *
 * Each player has 2 rostrums. This counts pieces in both.
 *
 * @param playerId - The player ID
 * @param pieces - The current pieces on the board
 * @returns The number of pieces in the player's rostrums
 *
 * @example
 * ```typescript
 * const count = countPiecesInPlayerRostrums(1, pieces);
 * console.log(count); // 2 (if both rostrums have 1 piece each)
 * ```
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
 * Checks if both of a player's rostrums are filled (at least one piece in each)
 *
 * This is a requirement for accessing the player's office.
 * Each rostrum must have at least 1 piece.
 *
 * @param playerId - The player ID
 * @param pieces - The current pieces on the board
 * @returns true if both rostrums contain at least one piece
 *
 * @example
 * ```typescript
 * if (areBothRostrumsFilledForPlayer(1, pieces)) {
 *   console.log("Office is now accessible");
 * }
 * ```
 */
export function areBothRostrumsFilledForPlayer(
  playerId: number,
  pieces: Piece[]
): boolean {
  const playerRules = getPlayerRostrumRules(playerId);
  if (!playerRules) return false;

  for (const rostrumRule of playerRules.rostrums) {
    const haspiece = pieces.some((p) => p.locationId === rostrumRule.rostrum);
    if (!haspiece) return false; // At least one rostrum is empty
  }

  return true; // Both rostrums have pieces
}

/**
 * Checks if two rostrums are adjacent (connected)
 *
 * Rostrum adjacency varies by player count:
 * - 3 players: Rostrums connect in a specific pattern (p1↔p3, p3↔p2, p2↔p1)
 * - 4 players: Sequential connections (p1↔p2, p2↔p3, p3↔p4, p4↔p1)
 * - 5 players: Sequential connections (p1↔p2, p2↔p3, p3↔p4, p4↔p5, p5↔p1)
 *
 * @param rostrum1 - The first rostrum ID
 * @param rostrum2 - The second rostrum ID
 * @param playerCount - The number of players (3, 4, or 5)
 * @returns true if the rostrums are adjacent
 *
 * @example
 * ```typescript
 * if (areRostrumsAdjacent("p1_rostrum2", "p3_rostrum1", 3)) {
 *   console.log("These rostrums are connected");
 * }
 * ```
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
 * Gets the adjacent rostrum for a given rostrum, if one exists
 *
 * Each rostrum has one adjacent rostrum connection.
 * Returns the connected rostrum ID.
 *
 * @param rostrumId - The rostrum ID to find the adjacent rostrum for
 * @param playerCount - The number of players (3, 4, or 5)
 * @returns The ID of the adjacent rostrum, or null if none exists
 *
 * @example
 * ```typescript
 * const adjacent = getAdjacentRostrum("p1_rostrum2", 3);
 * console.log(adjacent); // "p3_rostrum1"
 * ```
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
 * Validates if a piece can move between two adjacent rostrums
 *
 * ADJACENCY MOVEMENT RULES:
 * - Both rostrums must be adjacent
 * - The destination rostrum must have all supporting seats full
 * - Only the owner of the source rostrum can initiate the move
 *
 * @param sourceRostrumId - The rostrum the piece is moving from
 * @param targetRostrumId - The rostrum the piece is moving to
 * @param movingPlayerId - The ID of the player making the move
 * @param playerCount - The number of players
 * @param pieces - The current pieces on the board
 * @returns An object with { isAllowed: boolean, reason: string }
 *
 * @example
 * ```typescript
 * const validation = validateAdjacentRostrumMovement(
 *   "p1_rostrum2",
 *   "p3_rostrum1",
 *   1,
 *   3,
 *   pieces
 * );
 * if (!validation.isAllowed) {
 *   console.log(validation.reason);
 * }
 * ```
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
      reason: `${formatLocationId(sourceRostrumId)} and ${formatLocationId(
        targetRostrumId
      )} are not adjacent`,
    };
  }

  const sourcePlayerId = getPlayerIdFromLocationId(sourceRostrumId);
  const targetPlayerId = getPlayerIdFromLocationId(targetRostrumId);

  // Only the owner of the source rostrum can move pieces out of it
  if (sourcePlayerId !== movingPlayerId) {
    return {
      isAllowed: false,
      reason: `Cannot move opponent's piece from ${formatLocationId(
        sourceRostrumId
      )}`,
    };
  }

  // The destination rostrum must have all supporting seats full
  if (!areSupportingSeatsFullForRostrum(targetRostrumId, pieces)) {
    const rule = getRostrumSupportRule(targetRostrumId);
    if (rule) {
      const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
      return {
        isAllowed: false,
        reason: `Cannot move to ${formatLocationId(
          targetRostrumId
        )} - only ${occupied}/3 supporting seats are full`,
      };
    }
  }

  return { isAllowed: true, reason: "Adjacent rostrum movement is valid" };
}
