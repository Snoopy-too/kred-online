/**
 * Bureaucracy Phase Types
 *
 * Purpose: Type definitions for the bureaucracy phase of KRED
 * Dependencies: None (pure type definitions)
 * Usage: Used during bureaucracy phase for purchases and player state management
 *
 * @module types/bureaucracy
 */

/**
 * BureaucracyItemType - The three types of items that can be purchased
 */
export type BureaucracyItemType = "MOVE" | "PROMOTION" | "CREDIBILITY";

/**
 * BureaucracyMoveType - Valid move types during bureaucracy phase
 */
export type BureaucracyMoveType =
  | "ADVANCE"
  | "WITHDRAW"
  | "ORGANIZE"
  | "ASSIST"
  | "REMOVE"
  | "INFLUENCE";

/**
 * PromotionLocationType - Valid locations for piece promotions
 */
export type PromotionLocationType = "OFFICE" | "ROSTRUM" | "SEAT";

/**
 * BureaucracyMenuItem - Represents an item in the bureaucracy menu
 *
 * Structure:
 * - id: Unique identifier for the menu item
 * - type: The category of purchase (move, promotion, or credibility)
 * - moveType: Optional - specific move type if this is a move purchase
 * - promotionLocation: Optional - target location if this is a promotion
 * - price: Cost in kredcoin
 * - description: Human-readable description
 *
 * @example
 * ```typescript
 * const advanceItem: BureaucracyMenuItem = {
 *   id: "advance",
 *   type: "MOVE",
 *   moveType: "ADVANCE",
 *   price: 1,
 *   description: "Advance a Pawn"
 * };
 * ```
 */
export interface BureaucracyMenuItem {
  id: string;
  type: BureaucracyItemType;
  moveType?: BureaucracyMoveType;
  promotionLocation?: PromotionLocationType;
  price: number;
  description: string;
}

/**
 * BureaucracyPurchase - Represents a completed or pending purchase
 *
 * Structure:
 * - playerId: Player making the purchase
 * - item: The menu item being purchased
 * - pieceId: Optional - piece affected by this purchase
 * - fromLocationId: Optional - source location for moves
 * - toLocationId: Optional - destination location for moves
 * - timestamp: When the purchase was made
 * - completed: Whether the purchase has been executed
 *
 * @example
 * ```typescript
 * const purchase: BureaucracyPurchase = {
 *   playerId: 1,
 *   item: advanceItem,
 *   pieceId: "piece_123",
 *   fromLocationId: "community_1",
 *   toLocationId: "seat_p1_1",
 *   timestamp: Date.now(),
 *   completed: false
 * };
 * ```
 */
export interface BureaucracyPurchase {
  playerId: number;
  item: BureaucracyMenuItem;
  pieceId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  timestamp: number;
  completed: boolean;
}

/**
 * BureaucracyPlayerState - Tracks a player's state during bureaucracy phase
 *
 * Structure:
 * - playerId: The player's ID
 * - initialKredcoin: Starting kredcoin for this bureaucracy phase
 * - remainingKredcoin: Kredcoin left after purchases
 * - turnComplete: Whether the player has finished their turn
 * - purchases: List of all purchases made this phase
 *
 * @example
 * ```typescript
 * const playerState: BureaucracyPlayerState = {
 *   playerId: 1,
 *   initialKredcoin: 10,
 *   remainingKredcoin: 7,
 *   turnComplete: false,
 *   purchases: []
 * };
 * ```
 */
export interface BureaucracyPlayerState {
  playerId: number;
  initialKredcoin: number;
  remainingKredcoin: number;
  turnComplete: boolean;
  purchases: BureaucracyPurchase[];
}
