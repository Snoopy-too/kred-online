/**
 * Positioning Utilities
 * Helper functions for piece rotation and position calculations
 */

/**
 * Board center positions by player count
 * Used for calculating piece rotation angles
 */
const BOARD_CENTERS: { [playerCount: number]: { left: number; top: number } } =
  {
    3: { left: 50.44, top: 44.01 },
    4: { left: 49.94, top: 51.56 },
    5: { left: 47.79, top: 46.92 },
  };

/**
 * Checks if a position is within the community circle.
 * Community pieces typically don't rotate.
 *
 * @param position The position to check
 * @returns True if position is in community area
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
 * Calculates the rotation of a piece so its top points away from the board center.
 * Pieces in seats, rostrums are rotated to point outward from the board center.
 * Community pieces and offices have no rotation (0 degrees).
 *
 * @param position The position of the piece in percentage { top, left }
 * @param playerCount The number of players in the game
 * @param locationId Optional location ID to check if it's a community or office location
 * @returns The rotation in degrees
 */
export function calculatePieceRotation(
  position: { top: number; left: number },
  playerCount: number,
  locationId?: string
): number {
  // Community pieces, free placement, and offices have no rotation
  if (
    locationId &&
    (locationId.startsWith('community') ||
      locationId === 'free_placement' ||
      locationId.includes('office'))
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
