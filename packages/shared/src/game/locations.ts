/**
 * Location Utilities - Position and location ID management
 *
 * Purpose: Functions for finding, mapping, and validating board locations
 * Dependencies: Types (Piece), Config (DROP_LOCATIONS_BY_PLAYER_COUNT)
 * Usage: Used for drag-and-drop, piece placement, and location ownership checks
 *
 * @module game/locations
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces
  Piece,

  // Game state types - drop locations
  DropLocation,
} from "../types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  // Board layout - drop locations by player count
  DROP_LOCATIONS_BY_PLAYER_COUNT,
} from "../config";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Finds the nearest vacant drop location for a given position
 *
 * Takes into account:
 * - Location capacity (multiple pieces can occupy same coordinate)
 * - Distance thresholds (different for community, seats, rostrums, offices)
 * - Current piece occupancy
 *
 * Distance thresholds:
 * - Community: 9.0 (easier to target)
 * - Seats: 12.0 (default)
 * - Rostrums/Offices: 15.0 (larger radius for better UX)
 *
 * @param dropPosition - The position where piece was dropped
 * @param allPieces - All current pieces on the board
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Location with position and ID, or null if no valid location found
 *
 * @example
 * ```typescript
 * const nearestLoc = findNearestVacantLocation(
 *   { top: 30, left: 48 },
 *   gameState.pieces,
 *   3
 * );
 * if (nearestLoc) {
 *   piece.position = nearestLoc.position;
 *   piece.locationId = nearestLoc.id;
 * }
 * ```
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
  const vacantLocations = validLocations.filter((loc) => {
    // Count how many total slots are defined at this exact coordinate.
    const capacityAtCoord = validLocations.filter(
      (otherLoc) =>
        Math.abs(otherLoc.position.left - loc.position.left) < 0.01 &&
        Math.abs(otherLoc.position.top - loc.position.top) < 0.01
    ).length;

    // Count how many pieces are already at this exact coordinate.
    const piecesAtCoord = allPieces.filter(
      (piece) =>
        Math.abs(piece.position.left - loc.position.left) < 0.01 &&
        Math.abs(piece.position.top - loc.position.top) < 0.01
    ).length;

    return piecesAtCoord < capacityAtCoord;
  });

  if (vacantLocations.length === 0) {
    return null; // No vacant spots available
  }

  // Distance calculation function
  const calculateDistance = (
    pos1: { left: number; top: number },
    pos2: { left: number; top: number }
  ): number => {
    return Math.sqrt(
      Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2)
    );
  };

  // Find the nearest location using consistent distance thresholds
  let nearestLocation: DropLocation | null = null;
  let minDistance = Infinity;

  for (const loc of vacantLocations) {
    const distance = calculateDistance(dropPosition, loc.position);

    // Determine the maximum distance threshold based on location type
    let maxDistance = 12.0; // Default for regular locations (seats)
    if (loc.id.includes("community")) {
      maxDistance = 9.0; // Community locations are easier to target
    } else if (loc.id.includes("rostrum") || loc.id.includes("office")) {
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
 * Given a position, finds the ID of the closest drop location
 *
 * Returns exact match if position is within 0.01 units of a location.
 * Otherwise returns closest location within 5.0 units, or null.
 *
 * @param position - The position to check
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Location ID string, or null if no close location found
 *
 * @example
 * ```typescript
 * const locationId = getLocationIdFromPosition(
 *   { top: 29.91, left: 48.25 },
 *   3
 * );
 * console.log(locationId); // "p1_seat1"
 * ```
 */
export function getLocationIdFromPosition(
  position: { top: number; left: number },
  playerCount: number
): string | null {
  const allLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
  if (!allLocations) return null;

  let closestLocationId: string | null = null;
  let minDistance = Infinity;

  const calculateDistance = (
    pos1: { left: number; top: number },
    pos2: { left: number; top: number }
  ): number => {
    return Math.sqrt(
      Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2)
    );
  };

  for (const loc of allLocations) {
    if (
      Math.abs(loc.position.left - position.left) < 0.01 &&
      Math.abs(loc.position.top - position.top) < 0.01
    ) {
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
 * Extracts the player ID from a location ID string
 *
 * Location IDs follow the pattern: p{playerId}_{type}{number}
 * Examples: p1_seat1, p2_rostrum2, p3_office
 *
 * @param locationId - The location ID to parse (e.g., 'p1_seat1')
 * @returns Player ID as a number (1-5), or null if not a player-owned location
 *
 * @example
 * ```typescript
 * getPlayerIdFromLocationId("p1_seat1");  // Returns: 1
 * getPlayerIdFromLocationId("p3_office"); // Returns: 3
 * getPlayerIdFromLocationId("community1"); // Returns: null
 * ```
 */
export function getPlayerIdFromLocationId(locationId: string): number | null {
  if (!locationId) return null;
  const match = locationId.match(/^p(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if a location is owned by a specific player
 *
 * Player-owned locations: seats, rostrums, and offices
 * Non-owned locations: community spaces, free_placement
 *
 * @param locationId - The location ID to check
 * @param playerId - The player ID to verify ownership (1-5)
 * @returns true if the location belongs to the player, false otherwise
 *
 * @example
 * ```typescript
 * isLocationOwnedByPlayer("p1_seat3", 1);  // Returns: true
 * isLocationOwnedByPlayer("p1_seat3", 2);  // Returns: false
 * isLocationOwnedByPlayer("community1", 1); // Returns: false
 * ```
 */
export function isLocationOwnedByPlayer(
  locationId: string,
  playerId: number
): boolean {
  const ownerId = getPlayerIdFromLocationId(locationId);
  return ownerId === playerId;
}
