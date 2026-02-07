/**
 * Utility Functions
 * Pure helper functions that can be used across the application
 */

import type { Player, Piece } from "./src/types";

/**
 * Gets a player's display name with fallback
 *
 * @param player - Player object (can be undefined)
 * @param playerId - Player ID for fallback
 * @returns Player's name or "Player {id}" if not found
 *
 * @example
 * getPlayerName(player, 1) // "Alice" or "Player 1"
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
 *
 * @example
 * getPlayerNameSimple(player) // "Alice" or "Player"
 * getPlayerNameSimple(player, "Unknown") // "Alice" or "Unknown"
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
 * @param playerId - Player ID to find
 * @returns Player object or undefined if not found
 *
 * @example
 * const player = getPlayerById(players, 3)
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
 * @param pieceId - Piece ID to find
 * @returns Piece object or undefined if not found
 *
 * @example
 * const piece = getPieceById(pieces, "mark_p1_1")
 */
export function getPieceById(
  pieces: Piece[],
  pieceId: string
): Piece | undefined {
  return pieces.find((p) => p.id === pieceId);
}

/**
 * Formats an array of winner IDs into winner names
 *
 * @param winners - Array of winning player IDs
 * @param players - Array of all players
 * @returns Comma-separated string of winner names
 *
 * @example
 * formatWinnerNames([1, 3], players) // "Alice, Charlie" or "Player 1, Player 3"
 */
export function formatWinnerNames(
  winners: number[],
  players: Player[]
): string {
  return winners
    .map((id) => getPlayerName(getPlayerById(players, id), id))
    .join(", ");
}

/**
 * Checks if a location ID belongs to a specific player's domain
 *
 * @param locationId - Location ID to check (e.g., "p1_seat3")
 * @param playerId - Player ID to check against
 * @returns true if location belongs to player's domain
 *
 * @example
 * isPlayerDomain("p1_seat3", 1) // true
 * isPlayerDomain("p2_office", 1) // false
 * isPlayerDomain("community_1", 1) // false
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
 *
 * @example
 * isCommunityLocation("community_1") // true
 * isCommunityLocation("p1_seat3") // false
 */
export function isCommunityLocation(locationId: string | undefined): boolean {
  if (!locationId) return false;
  return locationId.includes("community");
}
