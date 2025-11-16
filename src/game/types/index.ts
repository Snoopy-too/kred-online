/**
 * Game Types - Central Export
 * Re-exports all game-related types for easy importing
 */

// Board types
export type {
  DropLocation,
  TileReceivingSpace,
  BankSpace,
  GamePieceInfo,
  Piece,
  BoardTile,
} from './board';

// Player types
export type { Tile, Player, GameState } from './player';

// Move types
export {
  DefinedMoveType,
  MoveRequirementType,
  TilePlayOptionType,
} from './moves';
export type {
  DefinedMove,
  TrackedMove,
  TilePlayOption,
  TileRequirement,
} from './moves';

// Bureaucracy types
export type {
  BureaucracyItemType,
  BureaucracyMoveType,
  PromotionLocationType,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
} from './bureaucracy';

// Challenge types
export type { PlayedTileState, ChallengeState } from './challenge';
