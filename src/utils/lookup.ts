/**
 * Lookup Utilities - Helper functions for finding entities by ID
 */

import type { Player, Piece } from '../types';

/**
 * Gets a player's display name with player ID fallback
 *
 * @param player - Player object (can be undefined)
 * @param playerId - Player ID for fallback display
 * @returns Player's name or "Player {id}"
 */
export function getPlayerName(
  player: Player | undefined,
  playerId: number
): string {
  return player?.name || `Player ${playerId}`;
}

/**
 * Gets a player's display name with simple fallback
 *
 * @param player - Player object (can be undefined)
 * @param fallback - Fallback string (default: "Player")
 * @returns Player's name or fallback
 */
export function getPlayerNameSimple(
  player: Player | undefined,
  fallback: string = "Player"
): string {
  return player?.name || fallback;
}

/**
 * Finds a player by ID in the players array
 *
 * @param players - Array of all players
 * @param playerId - The ID of the player to find
 * @returns The player object or undefined if not found
 */
export function getPlayerById(
  players: Player[],
  playerId: number
): Player | undefined {
  return players.find((p) => p.id === playerId);
}

/**
 * Finds a piece by ID in the pieces array
 *
 * @param pieces - Array of all pieces
 * @param pieceId - The ID of the piece to find
 * @returns The piece object or undefined if not found
 */
export function getPieceById(
  pieces: Piece[],
  pieceId: string
): Piece | undefined {
  return pieces.find((p) => p.id === pieceId);
}

/**
 * Checks if a location ID is in a player's domain
 *
 * @param locationId - Location ID to check
 * @param playerId - Player ID
 * @returns true if location is in player's domain
 */
export function isPlayerDomain(
  locationId: string | undefined,
  playerId: number
): boolean {
  if (!locationId) return false;
  return locationId.startsWith(`p${playerId}_`);
}

/**
 * Checks if a location ID is in the community area
 *
 * @param locationId - Location ID to check
 * @returns true if location is in community
 */
export function isCommunityLocation(locationId: string | undefined): boolean {
  if (!locationId) return false;
  return locationId.includes("community");
}
