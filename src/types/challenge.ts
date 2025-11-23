/**
 * Challenge System Types
 *
 * Purpose: Type definitions for the challenge system in KRED
 * Dependencies: None (pure type definitions)
 * Usage: Used during campaign phase when players challenge tile plays
 *
 * @module types/challenge
 */

/**
 * ChallengeState - Represents the state of a challenge to a tile play
 *
 * Structure:
 * - status: Current state of the challenge (PENDING, CHALLENGED, or RESOLVED)
 * - challengedByPlayerId: Optional - ID of player who issued the challenge
 * - acceptedByReceivingPlayer: Whether the receiving player accepted the challenge
 *
 * Challenge Flow:
 * 1. PENDING - Initial state when tile is played, no challenge yet
 * 2. CHALLENGED - Another player has challenged the tile play
 * 3. RESOLVED - Challenge has been resolved (accepted or rejected)
 *
 * @example
 * ```typescript
 * // Initial state
 * const pending: ChallengeState = {
 *   status: "PENDING",
 *   acceptedByReceivingPlayer: false
 * };
 *
 * // Challenge issued
 * const challenged: ChallengeState = {
 *   status: "CHALLENGED",
 *   challengedByPlayerId: 2,
 *   acceptedByReceivingPlayer: false
 * };
 *
 * // Challenge resolved
 * const resolved: ChallengeState = {
 *   status: "RESOLVED",
 *   challengedByPlayerId: 2,
 *   acceptedByReceivingPlayer: true
 * };
 * ```
 */
export interface ChallengeState {
  status: "PENDING" | "CHALLENGED" | "RESOLVED";
  challengedByPlayerId?: number;
  acceptedByReceivingPlayer: boolean;
}
