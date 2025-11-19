/**
 * Location Utilities
 * Helper functions for working with board locations and positions
 */

import { DropLocation, Piece } from '../types';
import { DROP_LOCATIONS_BY_PLAYER_COUNT } from '../config/board-layouts';

/**
 * Formats a location ID string into a human-readable format.
 * @param locationId The location ID (e.g., 'p1_seat4').
 * @returns A formatted string (e.g., "Player 1's seat 4").
 */
export function formatLocationId(locationId: string): string {
  if (!locationId) return 'an unknown location';

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
 * Gets the location ID from a board position by finding the nearest matching location.
 * @param position The position on the board (percentage-based).
 * @param playerCount The number of players.
 * @returns The string ID of the location, or null if no close match found.
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
    // Exact match (within tolerance)
    if (
      Math.abs(loc.position.left - position.left) < 0.01 &&
      Math.abs(loc.position.top - position.top) < 0.01
    ) {
      return loc.id;
    }

    // Track closest location
    const distance = calculateDistance(position, loc.position);
    if (distance < minDistance) {
      minDistance = distance;
      closestLocationId = loc.id;
    }
  }

  // Only return if within reasonable distance threshold
  return minDistance < 5.0 ? closestLocationId : null;
}

/**
 * Finds the nearest vacant location to a given position.
 * Used for piece placement when exact position doesn't have available slots.
 *
 * @param dropPosition The position where user tried to drop
 * @param allPieces Current pieces on board
 * @param playerCount Number of players
 * @returns Nearest vacant location or null
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

  // Find locations that have at least one open slot
  const vacantLocations = validLocations.filter((loc) => {
    // Count how many total slots are defined at this exact coordinate
    const capacityAtCoord = validLocations.filter(
      (otherLoc) =>
        Math.abs(otherLoc.position.left - loc.position.left) < 0.01 &&
        Math.abs(otherLoc.position.top - loc.position.top) < 0.01
    ).length;

    // Count how many pieces are already at this exact coordinate
    const piecesAtCoord = allPieces.filter(
      (piece) =>
        piece.position &&
        Math.abs(piece.position.left - loc.position.left) < 0.01 &&
        Math.abs(piece.position.top - loc.position.top) < 0.01
    ).length;

    // Slot is vacant if pieces < capacity
    return piecesAtCoord < capacityAtCoord;
  });

  if (vacantLocations.length === 0) {
    return null;
  }

  // Find the closest vacant location
  let closestLocation: DropLocation | null = null;
  let minDistance = Infinity;

  for (const loc of vacantLocations) {
    const dx = loc.position.left - dropPosition.left;
    const dy = loc.position.top - dropPosition.top;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = loc;
    }
  }

  if (!closestLocation) {
    return null;
  }

  return {
    position: closestLocation.position,
    id: closestLocation.id,
  };
}

/**
 * Checks if a location is owned by a specific player.
 * @param locationId The location ID to check.
 * @param playerId The player ID to verify ownership.
 * @returns True if the location belongs to the player.
 */
export function isLocationOwnedByPlayer(
  locationId: string,
  playerId: number
): boolean {
  if (!locationId) return false;
  const match = locationId.match(/^p(\d+)_/);
  if (!match) return false;
  return parseInt(match[1], 10) === playerId;
}
