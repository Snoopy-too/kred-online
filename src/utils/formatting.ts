/**
 * Formatting Utilities
 *
 * Purpose: String formatting and display helpers
 * Dependencies: None (pure string manipulation)
 * Usage: Used to format location IDs and other strings for display
 *
 * @module utils/formatting
 */

/**
 * Formats a location ID string into a human-readable format
 *
 * Converts internal location IDs (like "p1_seat4") into readable strings
 * (like "Player 1's seat 4"). Handles various location types including
 * seats, rostrums, offices, and multi-word locations.
 *
 * @param locationId - The location ID to format (e.g., "p1_seat4")
 * @returns A formatted string (e.g., "Player 1's seat 4")
 *
 * @example
 * ```typescript
 * formatLocationId("p1_seat1");
 * // Returns: "Player 1's seat 1"
 *
 * formatLocationId("p2_office");
 * // Returns: "Player 2's office"
 *
 * formatLocationId("p3_tile_space_2");
 * // Returns: "Player 3's tile space 2"
 *
 * formatLocationId("");
 * // Returns: "an unknown location"
 * ```
 */
export function formatLocationId(locationId: string): string {
  if (!locationId) return "an unknown location";

  const parts = locationId.split("_");
  if (parts.length < 2) return locationId;

  const playerId = parts[0].replace("p", "");
  const locationName = parts.slice(1).join(" ");

  if (locationName === "office") {
    return `Player ${playerId}'s office`;
  }

  const match = locationName.match(/(\D+)(\d+)/);
  if (match) {
    const [, type, num] = match;
    return `Player ${playerId}'s ${type} ${num}`;
  }

  return `Player ${playerId}'s ${locationName}`;
}
