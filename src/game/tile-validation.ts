/**
 * Tile Validation Module - Tile requirement checking and validation
 *
 * Purpose: Validates tile requirements and determines if tiles can be rejected
 * Dependencies: TILE_REQUIREMENTS, TILE_PLAY_OPTIONS, DEFINED_MOVES from config
 *
 * @module game/tile-validation
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type { TileRequirement } from "../config/rules";

// Runtime imports (enums/values used at runtime, not just for typing)
import { DefinedMoveType, MoveRequirementType } from "../types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  // Tile requirements configuration
  TILE_REQUIREMENTS,

  // Tile play options configuration
  TilePlayOptionType,
  TILE_PLAY_OPTIONS,

  // Move definitions
  DEFINED_MOVES,
} from "../config";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Checks if a move type is allowed in a specific tile play option
 *
 * @param moveType - The move type to check
 * @param optionType - The tile play option type
 * @returns True if the move type is allowed in the option
 *
 * @example
 * ```ts
 * isMoveAllowedInTilePlayOption(DefinedMoveType.WITHDRAW, TilePlayOptionType.ONE_OPTIONAL)
 * // Returns: true (WITHDRAW is allowed in ONE_OPTIONAL)
 * ```
 */
export function isMoveAllowedInTilePlayOption(
  moveType: DefinedMoveType,
  optionType: TilePlayOptionType
): boolean {
  const option = TILE_PLAY_OPTIONS[optionType];
  if (!option) return false;
  return option.allowedMoveTypes.includes(moveType);
}

/**
 * Determines if a move is Optional or Mandatory
 *
 * @param moveType - The move type to classify
 * @returns The MoveRequirementType of this move
 *
 * @example
 * ```ts
 * getMoveRequirement(DefinedMoveType.ADVANCE)
 * // Returns: MoveRequirementType.MANDATORY
 * ```
 */
export function getMoveRequirement(
  moveType: DefinedMoveType
): MoveRequirementType {
  const move = DEFINED_MOVES[moveType];
  return move ? move.requirement : MoveRequirementType.OPTIONAL;
}

/**
 * Gets the tile requirements for a specific tile ID
 *
 * @param tileId - The tile ID (e.g., '01', '24', 'BLANK')
 * @returns The TileRequirement object, or null if tile not found
 *
 * @example
 * ```ts
 * getTileRequirements('01')
 * // Returns: { requiredMoves: [DefinedMoveType.ADVANCE] }
 * ```
 */
export function getTileRequirements(tileId: string): TileRequirement | null {
  return TILE_REQUIREMENTS[tileId] || null;
}

/**
 * Checks if a tile has specific move requirements
 *
 * @param tileId - The tile ID to check
 * @returns True if the tile has required moves (non-empty)
 *
 * @example
 * ```ts
 * tileHasRequirements('01') // Returns: true
 * tileHasRequirements('BLANK') // Returns: false
 * ```
 */
export function tileHasRequirements(tileId: string): boolean {
  const requirements = getTileRequirements(tileId);
  return requirements ? requirements.requiredMoves.length > 0 : false;
}

/**
 * Checks if all required moves for a tile have been completed
 *
 * @param tileId - The tile ID being played
 * @param executedMoves - The moves that were actually executed
 * @returns True if all required moves were executed
 *
 * @example
 * ```ts
 * areAllTileRequirementsMet('01', [DefinedMoveType.ADVANCE])
 * // Returns: true (all requirements met)
 * ```
 */
export function areAllTileRequirementsMet(
  tileId: string,
  executedMoves: DefinedMoveType[]
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements || requirements.requiredMoves.length === 0) {
    return true; // No requirements (like Blank tile with no moves)
  }

  // All required moves must be present in executedMoves
  return requirements.requiredMoves.every((requiredMove) =>
    executedMoves.includes(requiredMove)
  );
}

/**
 * Determines if a tile play can be rejected based on execution
 *
 * REJECTION RULES:
 * - If all required moves were executed: tile CANNOT be rejected
 * - If it's impossible to execute requirements (board state): tile CANNOT be rejected
 * - If some moves were not executed (but were possible): tile CAN be rejected
 * - For Blank tile: if NO moves were made: tile CANNOT be rejected
 * - For Blank tile: if ANY moves were made: tile CAN be rejected
 *
 * @param tileId - The tile ID being played
 * @param executedMoves - The moves that were executed
 * @param wasExecutionPossible - Whether the requirements were possible to execute
 * @returns True if the tile can be rejected
 *
 * @example
 * ```ts
 * canTileBeRejected('01', [DefinedMoveType.ADVANCE], true)
 * // Returns: false (all requirements met and execution was possible)
 * ```
 */
export function canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  wasExecutionPossible: boolean
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements) return true; // Unknown tile, default to rejectable

  // If requirements were impossible to execute, tile cannot be rejected
  if (!wasExecutionPossible) {
    return false;
  }

  // Blank tile can be rejected only if moves were made
  // (must check this before areAllTileRequirementsMet since BLANK has no requirements)
  if (tileId === "BLANK") {
    return executedMoves.length > 0;
  }

  // If all requirements were met, tile cannot be rejected
  if (areAllTileRequirementsMet(tileId, executedMoves)) {
    return false;
  }

  // If some (but not all) requirements were met, tile can be rejected
  return true;
}
