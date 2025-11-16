/**
 * Move Definitions
 * Defines all possible move types and tile play options
 */

import {
  DefinedMoveType,
  MoveRequirementType,
  DefinedMove,
  TilePlayOptionType,
  TilePlayOption,
} from '../types';

/**
 * Complete definition of all Defined Moves available in the game.
 * These moves are triggered by playing tiles during the game.
 */
export const DEFINED_MOVES: { [key in DefinedMoveType]: DefinedMove } = {
  [DefinedMoveType.REMOVE]: {
    type: DefinedMoveType.REMOVE,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description:
      "(O) Remove – Take a Mark or a Heel from a seat in an opponent's domain and return it to the community.",
    options: [
      "a. Take a Mark or Heel from an opponent's seat",
      'b. Return the piece to the community',
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: true,
  },
  [DefinedMoveType.ADVANCE]: {
    type: DefinedMoveType.ADVANCE,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description: "(M) Advance – Player's choice of ONE of the following",
    options: [
      'a. Take a piece from the community and add it to an open seat in their domain',
      'b. Take a piece from a seat in their domain and place it into the open Rostrum that that seat supports',
      'c. Take a piece from a Rostrum in their domain and place it into the office in their domain',
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.INFLUENCE]: {
    type: DefinedMoveType.INFLUENCE,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description:
      "INFLUENCE – A player may move another player's piece from a seat to an adjacent seat (even if that seat is in another player's domain), OR from an opponent's rostrum to an adjacent rostrum in another player's domain.",
    options: [
      "a. Move another player's piece from a seat to an adjacent seat",
      "b. Move another player's piece from a rostrum to an adjacent rostrum in another player's domain",
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: false,
  },
  [DefinedMoveType.ASSIST]: {
    type: DefinedMoveType.ASSIST,
    category: 'O',
    requirement: MoveRequirementType.OPTIONAL,
    description:
      "(O) Assist – A player may add a piece from the community to an opponent's vacant seat.",
    options: [
      "a. Take a piece from the community and add it to an opponent's vacant seat",
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: true,
  },
  [DefinedMoveType.WITHDRAW]: {
    type: DefinedMoveType.WITHDRAW,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description:
      '(M) Withdraw – A player MUST do one of the following UNLESS they have 0 pieces in their domain',
    options: [
      'a. Move a piece from an office to a vacant rostrum in their domain',
      'b. Move a piece from a rostrum in their domain to a vacant seat in their domain',
      'c. Move a piece from a seat in their domain to the community',
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.ORGANIZE]: {
    type: DefinedMoveType.ORGANIZE,
    category: 'M',
    requirement: MoveRequirementType.MANDATORY,
    description: '(M) Organize – A player must do one of the following',
    options: [
      "a. Move a piece from a seat in their domain to an adjacent seat, even if it ends up in an opponent's domain",
      "b. Move a piece from a rostrum in their domain to an adjacent rostrum in an opponent's domain",
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: true,
    affectsCommunity: false,
  },
};

/**
 * Complete definition of all tile play options available to a receiving player.
 * The receiving player must choose exactly ONE of these options when challenged with a tile.
 */
export const TILE_PLAY_OPTIONS: {
  [key in TilePlayOptionType]: TilePlayOption;
} = {
  [TilePlayOptionType.NO_MOVE]: {
    optionType: TilePlayOptionType.NO_MOVE,
    description: 'Do nothing. The tile play is complete.',
    allowedMoveTypes: [],
    maxOptionalMoves: 0,
    maxMandatoryMoves: 0,
    requiresAction: false,
  },
  [TilePlayOptionType.ONE_OPTIONAL]: {
    optionType: TilePlayOptionType.ONE_OPTIONAL,
    description: 'Execute one Optional move (REMOVE, INFLUENCE, or ASSIST)',
    allowedMoveTypes: [
      DefinedMoveType.REMOVE,
      DefinedMoveType.INFLUENCE,
      DefinedMoveType.ASSIST,
    ],
    maxOptionalMoves: 1,
    maxMandatoryMoves: 0,
    requiresAction: true,
  },
  [TilePlayOptionType.ONE_MANDATORY]: {
    optionType: TilePlayOptionType.ONE_MANDATORY,
    description: 'Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE)',
    allowedMoveTypes: [
      DefinedMoveType.ADVANCE,
      DefinedMoveType.WITHDRAW,
      DefinedMoveType.ORGANIZE,
    ],
    maxOptionalMoves: 0,
    maxMandatoryMoves: 1,
    requiresAction: true,
  },
  [TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY]: {
    optionType: TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY,
    description:
      'Execute one Optional move AND one Mandatory move in any order',
    allowedMoveTypes: [
      DefinedMoveType.REMOVE,
      DefinedMoveType.INFLUENCE,
      DefinedMoveType.ASSIST,
      DefinedMoveType.ADVANCE,
      DefinedMoveType.WITHDRAW,
      DefinedMoveType.ORGANIZE,
    ],
    maxOptionalMoves: 1,
    maxMandatoryMoves: 1,
    requiresAction: true,
  },
};

/**
 * Helper function to check if a move type is allowed within a tile play option.
 * @param moveType The move type to check.
 * @param optionType The tile play option selected.
 * @returns True if the move type is allowed within that option.
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
 * Helper function to determine if a move is Optional or Mandatory.
 * @param moveType The move type to classify.
 * @returns The MoveRequirementType of this move.
 */
export function getMoveRequirement(
  moveType: DefinedMoveType
): MoveRequirementType {
  const move = DEFINED_MOVES[moveType];
  return move ? move.requirement : MoveRequirementType.OPTIONAL;
}
