/**
 * Move-related type definitions
 * Defines move types, move tracking, and tile play options
 */

/**
 * Enumeration of all defined move types in the game
 */
export enum DefinedMoveType {
  REMOVE = 'REMOVE',
  ADVANCE = 'ADVANCE',
  INFLUENCE = 'INFLUENCE',
  ASSIST = 'ASSIST',
  WITHDRAW = 'WITHDRAW',
  ORGANIZE = 'ORGANIZE',
}

/**
 * Move requirement type - whether a move is mandatory or optional
 */
export enum MoveRequirementType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
}

/**
 * Defines a move type with its rules and constraints
 */
export interface DefinedMove {
  type: DefinedMoveType;
  category: 'M' | 'O'; // 'M' = My domain, 'O' = Opponent domain
  requirement: MoveRequirementType;
  description: string;
  options: string[];
  canTargetOwnDomain: boolean;
  canTargetOpponentDomain: boolean;
  affectsCommunity: boolean;
}

/**
 * Tracks a move made during gameplay for undo/replay functionality
 */
export interface TrackedMove {
  moveType: DefinedMoveType;
  category: 'M' | 'O'; // M = My domain, O = Opponent domain
  pieceId: string;
  fromPosition: { top: number; left: number };
  fromLocationId?: string;
  toPosition: { top: number; left: number };
  toLocationId?: string;
  timestamp: number;
}

/**
 * Tile play option types
 */
export enum TilePlayOptionType {
  NO_MOVE = 'NO_MOVE',
  ONE_OPTIONAL = 'ONE_OPTIONAL',
  ONE_MANDATORY = 'ONE_MANDATORY',
  ONE_OPTIONAL_AND_ONE_MANDATORY = 'ONE_OPTIONAL_AND_ONE_MANDATORY',
}

/**
 * Defines a tile play option with its requirements
 */
export interface TilePlayOption {
  optionType: TilePlayOptionType;
  description: string;
  allowedMoveTypes: DefinedMoveType[];
  maxOptionalMoves: number;
  maxMandatoryMoves: number;
  requiresAction: boolean;
}

/**
 * Defines tile requirements for a specific tile
 */
export interface TileRequirement {
  tileId: string;
  requiredMoves: DefinedMoveType[];
  description: string;
  canBeRejected: boolean; // false = cannot be rejected if requirements met or impossible
}
