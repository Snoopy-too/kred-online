/**
 * Credibility Management
 *
 * This module handles all credibility-related logic including:
 * - Deducting credibility when players are caught lying
 * - Restoring credibility when players expose dishonesty
 * - Handling different credibility loss scenarios
 *
 * Credibility Rules:
 * - Players start with 3 credibility
 * - Minimum credibility is 0 (cannot go negative)
 * - Maximum credibility is 3
 * - Players with 0 credibility cannot challenge
 * - Players with 0 credibility cannot look at tiles received
 */

import type { Player } from '../types';

/**
 * Deducts credibility from a player (minimum 0)
 *
 * @param players - All players in the game
 * @param playerId - The player whose credibility should be deducted
 * @returns Updated players array with credibility deducted
 */
export function deductCredibility(players: Player[], playerId: number): Player[] {
  return players.map(p =>
    p.id === playerId
      ? { ...p, credibility: Math.max(0, p.credibility - 1) }
      : p
  );
}

/**
 * Restores credibility to a player (maximum 3)
 *
 * @param players - All players in the game
 * @param playerId - The player whose credibility should be restored
 * @param amount - Number of credibility points to restore (default: 1)
 * @returns Updated players array with credibility restored
 */
export function restoreCredibility(
  players: Player[],
  playerId: number,
  amount: number = 1
): Player[] {
  return players.map(p =>
    p.id === playerId
      ? { ...p, credibility: Math.min(3, p.credibility + amount) }
      : p
  );
}

/**
 * Credibility loss scenarios that can occur during gameplay
 */
export type CredibilityLossReason =
  | 'tile_rejected_by_receiver'        // Tile player's tile was rejected as dishonest
  | 'tile_failed_challenge'             // Tile player's tile failed a challenge
  | 'unsuccessful_challenge'            // Challenger challenged an honest tile
  | 'did_not_reject_when_challenged';   // Receiver accepted dishonest tile that was challenged

/**
 * Calculates which players should lose credibility based on the rejection reason
 *
 * Credibility Loss Rules:
 * - tile_rejected_by_receiver: Tile player loses 1 credibility
 * - tile_failed_challenge: Tile player loses 1 credibility
 * - unsuccessful_challenge: Challenger loses 1 credibility
 * - did_not_reject_when_challenged: Receiver loses 1 credibility
 *
 * @param reason - The reason for credibility loss
 * @param tilePlayerId - The player who played the tile
 * @param challengerId - The player who challenged (optional)
 * @param receiverId - The player who received the tile (optional)
 * @returns Function that takes players and returns updated players with credibility deducted
 */
export function handleCredibilityLoss(
  reason: CredibilityLossReason,
  tilePlayerId: number,
  challengerId?: number,
  receiverId?: number
): (players: Player[]) => Player[] {
  return (players: Player[]) => {
    switch (reason) {
      case 'tile_rejected_by_receiver':
        // Tile player loses 1 credibility when receiving player rejects their tile
        // (and tile didn't meet requirements perfectly)
        return deductCredibility(players, tilePlayerId);

      case 'tile_failed_challenge':
        // Tile player loses 1 credibility when another player successfully challenges
        // (tile didn't meet requirements perfectly)
        return deductCredibility(players, tilePlayerId);

      case 'unsuccessful_challenge':
        // Challenger loses 1 credibility when they challenge but tile was perfect
        return challengerId ? deductCredibility(players, challengerId) : players;

      case 'did_not_reject_when_challenged':
        // Receiver loses 1 credibility if they don't reject a tile that fails the challenge
        // (was played to them, didn't reject, another player challenged and succeeded)
        return receiverId ? deductCredibility(players, receiverId) : players;

      default:
        return players;
    }
  };
}

/**
 * Checks if a player has any credibility remaining
 *
 * @param player - The player to check
 * @returns true if player has credibility > 0
 */
export function hasCredibility(player: Player): boolean {
  return player.credibility > 0;
}

/**
 * Checks if a player can challenge (must have credibility > 0)
 *
 * @param player - The player to check
 * @returns true if player can challenge
 */
export function canChallenge(player: Player): boolean {
  return hasCredibility(player);
}

/**
 * Checks if a player can look at a received tile (must have credibility > 0)
 *
 * @param player - The player to check
 * @returns true if player can look at tile
 */
export function canLookAtTile(player: Player): boolean {
  return hasCredibility(player);
}
