/**
 * Piece Utility Functions
 * Helper functions for working with game pieces
 */

import type { Piece } from "../types";

/**
 * Finds a piece by ID in the pieces array
 *
 * @param pieces - Array of all pieces
 * @param pieceId - Piece ID to find
 * @returns Piece object or undefined if not found
 */
export function getPieceById(
  pieces: Piece[],
  pieceId: string
): Piece | undefined {
  return pieces.find((p) => p.id === pieceId);
}

/**
 * Finds all pieces at a specific location
 *
 * @param pieces - Array of all pieces
 * @param locationId - Location ID to search
 * @returns Array of pieces at that location
 */
export function getPiecesAtLocation(
  pieces: Piece[],
  locationId: string
): Piece[] {
  return pieces.filter((p) => p.locationId === locationId);
}

/**
 * Checks if a location has any piece
 *
 * @param pieces - Array of all pieces
 * @param locationId - Location ID to check
 * @returns True if location is occupied
 */
export function isLocationOccupied(
  pieces: Piece[],
  locationId: string
): boolean {
  return pieces.some((p) => p.locationId === locationId);
}
