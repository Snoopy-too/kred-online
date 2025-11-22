/**
 * Positioning Utilities
 *
 * Purpose: Coordinate and rotation calculations for game pieces
 * Dependencies: None (pure math functions)
 * Usage: Used to position and rotate pieces on the game board
 *
 * @module utils/positioning
 */

/**
 * BOARD_CENTERS - Center coordinates for each player count's board
 *
 * Structure: Maps player count to { left, top } coordinates in percentage
 * Usage: Used to calculate piece rotation relative to board center
 *
 * @example
 * ```typescript
 * const center = BOARD_CENTERS[3]; // { left: 50.44, top: 44.01 }
 * ```
 */
export const BOARD_CENTERS: {
  [playerCount: number]: { left: number; top: number };
} = {
  3: { left: 50.44, top: 44.01 },
  4: { left: 49.94, top: 51.56 },
  5: { left: 47.97, top: 47.07 },
};

/**
 * Checks if a position is within the community circle
 *
 * The community circle is centered at (50%, 50%) with a radius of 15%.
 * Pieces in this area are considered to be in the community.
 *
 * @param position - The position to check { left, top } in percentage
 * @returns True if position is within the community circle
 *
 * @example
 * ```typescript
 * const inCommunity = isPositionInCommunityCircle({ left: 50, top: 50 });
 * // Returns: true (center of board)
 * ```
 */
export function isPositionInCommunityCircle(position: {
  top: number;
  left: number;
}): boolean {
  const communityCenter = { left: 50, top: 50 };
  const communityRadius = 15;
  const dx = position.left - communityCenter.left;
  const dy = position.top - communityCenter.top;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= communityRadius;
}

/**
 * Calculates the rotation of a piece so its top points away from the board center
 *
 * Pieces in seats, rostrums, and non-special locations are rotated to point
 * outward from the board center. Community pieces, free placement pieces,
 * and office pieces have no rotation (0 degrees).
 *
 * @param position - The position of the piece in percentage { top, left }
 * @param playerCount - The number of players in the game (3, 4, or 5)
 * @param locationId - Optional location ID to check for special locations
 * @returns The rotation in degrees (0-360)
 *
 * @example
 * ```typescript
 * // Community piece - no rotation
 * const rotation1 = calculatePieceRotation(
 *   { left: 50, top: 40 },
 *   3,
 *   "community_1"
 * );
 * // Returns: 0
 *
 * // Seat piece - rotates away from center
 * const rotation2 = calculatePieceRotation(
 *   { left: 50, top: 30 },
 *   3,
 *   "p1_seat1"
 * );
 * // Returns: ~0 (pointing upward, away from center below)
 * ```
 */
export function calculatePieceRotation(
  position: { top: number; left: number },
  playerCount: number,
  locationId?: string
): number {
  // Community pieces, free placement, and offices have no rotation
  if (
    locationId &&
    (locationId.startsWith("community") ||
      locationId === "free_placement" ||
      locationId.includes("office"))
  ) {
    return 0;
  }

  const boardCenter = BOARD_CENTERS[playerCount] || { left: 50, top: 50 };
  const dx = position.left - boardCenter.left;
  const dy = position.top - boardCenter.top;
  const angleRadians = Math.atan2(dy, dx);
  // Convert radians to degrees and add 90 to orient the top of the piece away from the board center
  return angleRadians * (180 / Math.PI) + 90;
}
