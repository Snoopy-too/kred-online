/**
 * Credibility System - Game credibility mechanics
 *
 * Purpose: Handles credibility loss and deduction based on tile play outcomes
 * Dependencies: Types module for Player interface
 * Usage: Used during campaign phase for challenges and tile rejections
 *
 * @module rules/credibility
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Player types - player data structures
  Player,
} from "../types";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Deducts credibility from a player (minimum 0)
 *
 * Creates a new players array with the specified player's credibility reduced by 1.
 * Credibility never goes below 0.
 *
 * @param players - Current array of players
 * @param playerId - ID of the player to deduct credibility from
 * @returns New players array with updated credibility
 *
 * @example
 * ```typescript
 * const updatedPlayers = deductCredibility(gameState.players, 2);
 * ```
 */
export function deductCredibility(
  players: Player[],
  playerId: number
): Player[] {
  return players.map((p) =>
    p.id === playerId
      ? { ...p, credibility: Math.max(0, p.credibility - 1) }
      : p
  );
}

/**
 * Calculates which players should lose credibility based on the rejection reason
 *
 * Returns a function that takes players and returns updated players with credibility deducted.
 * This allows for composable credibility updates based on different game scenarios.
 *
 * Credibility loss scenarios:
 * - `tile_rejected_by_receiver`: Tile player loses 1 credibility
 * - `tile_failed_challenge`: Tile player loses 1 credibility (successful challenge)
 * - `unsuccessful_challenge`: Challenger loses 1 credibility (tile was perfect)
 * - `did_not_reject_when_challenged`: Receiver loses 1 credibility
 *
 * @param reason - Why credibility should be lost
 * @param tilePlayerId - ID of the player who played the tile
 * @param challengerId - Optional ID of the challenging player
 * @param receiverId - Optional ID of the receiving player
 * @returns Function that updates players array with credibility deductions
 *
 * @example
 * ```typescript
 * // Tile was rejected by receiver
 * const updateFn = handleCredibilityLoss("tile_rejected_by_receiver", 1);
 * const updatedPlayers = updateFn(gameState.players);
 *
 * // Unsuccessful challenge
 * const updateFn = handleCredibilityLoss("unsuccessful_challenge", 1, 3);
 * const updatedPlayers = updateFn(gameState.players);
 * ```
 */
export function handleCredibilityLoss(
  reason:
    | "tile_rejected_by_receiver"
    | "tile_failed_challenge"
    | "unsuccessful_challenge"
    | "did_not_reject_when_challenged",
  tilePlayerId: number,
  challengerId?: number,
  receiverId?: number
): (players: Player[]) => Player[] {
  return (players: Player[]) => {
    switch (reason) {
      case "tile_rejected_by_receiver":
        // Tile player loses 1 credibility when receiving player rejects their tile
        // (and tile didn't meet requirements perfectly)
        return deductCredibility(players, tilePlayerId);

      case "tile_failed_challenge":
        // Tile player loses 1 credibility when another player successfully challenges
        // (tile didn't meet requirements perfectly)
        return deductCredibility(players, tilePlayerId);

      case "unsuccessful_challenge":
        // Challenger loses 1 credibility when they challenge but tile was perfect
        return challengerId
          ? deductCredibility(players, challengerId)
          : players;

      case "did_not_reject_when_challenged":
        // Receiver loses 1 credibility if they don't reject a tile that fails the challenge
        // (was played to them, didn't reject, another player challenged and succeeded)
        return receiverId ? deductCredibility(players, receiverId) : players;

      default:
        return players;
    }
  };
}
