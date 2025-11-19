/**
 * Bureaucracy phase type definitions
 * Defines types for the bureaucracy game phase where players spend Kredcoin
 */

/**
 * Types of items that can be purchased during bureaucracy
 */
export type BureaucracyItemType = 'MOVE' | 'PROMOTION' | 'CREDIBILITY';

/**
 * Types of moves available during bureaucracy
 */
export type BureaucracyMoveType =
  | 'ADVANCE'
  | 'WITHDRAW'
  | 'ORGANIZE'
  | 'ASSIST'
  | 'REMOVE'
  | 'INFLUENCE';

/**
 * Location types where promotions can occur
 */
export type PromotionLocationType = 'OFFICE' | 'ROSTRUM' | 'SEAT';

/**
 * Represents a menu item in the bureaucracy purchase menu
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
 * Represents a purchase made during bureaucracy phase
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
 * Tracks a player's state during bureaucracy phase
 */
export interface BureaucracyPlayerState {
  playerId: number;
  initialKredcoin: number;
  remainingKredcoin: number;
  turnComplete: boolean;
  purchases: BureaucracyPurchase[];
}
