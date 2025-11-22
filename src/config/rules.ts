import { DefinedMoveType, MoveRequirementType, DefinedMove } from '../types/move';

/**
 * DEFINED MOVES - Action Types Available to Players
 *
 * This comprehensive mapping defines all six core move types in KRED,
 * categorized into Optional (O) and Mandatory (M) moves.
 *
 * Optional moves (REMOVE, INFLUENCE, ASSIST):
 * - Players can choose whether to execute these
 * - Typically target opponent domains
 *
 * Mandatory moves (ADVANCE, WITHDRAW, ORGANIZE):
 * - Players must execute these when required
 * - Typically target own domain (except ORGANIZE which can target both)
 *
 * Each move specifies:
 * - type: The DefinedMoveType enum value
 * - category: 'M' (Mandatory/My domain) or 'O' (Optional/Opponent domain)
 * - requirement: Whether the move is MANDATORY or OPTIONAL
 * - description: Human-readable explanation
 * - options: List of specific actions allowed
 * - canTargetOwnDomain: Whether pieces in player's own domain can be moved
 * - canTargetOpponentDomain: Whether opponent's pieces can be moved
 * - affectsCommunity: Whether the move involves community spaces
 */
export const DEFINED_MOVES: { [key in DefinedMoveType]: DefinedMove } = {
  [DefinedMoveType.REMOVE]: {
    type: DefinedMoveType.REMOVE,
    category: "O",
    requirement: MoveRequirementType.OPTIONAL,
    description:
      "(O) Remove – Take a Mark or a Heel from a seat in an opponent's domain and return it to the community.",
    options: [
      "a. Take a Mark or Heel from an opponent's seat",
      "b. Return the piece to the community",
    ],
    canTargetOwnDomain: false,
    canTargetOpponentDomain: true,
    affectsCommunity: true,
  },
  [DefinedMoveType.ADVANCE]: {
    type: DefinedMoveType.ADVANCE,
    category: "M",
    requirement: MoveRequirementType.MANDATORY,
    description: "(M) Advance – Player's choice of ONE of the following",
    options: [
      "a. Take a piece from the community and add it to an open seat in their domain",
      "b. Take a piece from a seat in their domain and place it into the open Rostrum that that seat supports",
      "c. Take a piece from a Rostrum in their domain and place it into the office in their domain",
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.INFLUENCE]: {
    type: DefinedMoveType.INFLUENCE,
    category: "O",
    requirement: MoveRequirementType.OPTIONAL,
    description:
      "(O) Influence – A player may move another player's piece from a seat to an adjacent seat (even if that seat is in another player's domain), OR from an opponent's rostrum to an adjacent rostrum in another player's domain.",
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
    category: "O",
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
    category: "M",
    requirement: MoveRequirementType.MANDATORY,
    description:
      "(M) Withdraw – A player MUST do one of the following UNLESS they have 0 pieces in their domain",
    options: [
      "a. Move a piece from an office to a vacant rostrum in their domain",
      "b. Move a piece from a rostrum in their domain to a vacant seat in their domain",
      "c. Move a piece from a seat in their domain to the community",
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: false,
    affectsCommunity: true,
  },
  [DefinedMoveType.ORGANIZE]: {
    type: DefinedMoveType.ORGANIZE,
    category: "M",
    requirement: MoveRequirementType.MANDATORY,
    description: "(M) Organize – A player must do one of the following",
    options: [
      "a. Move a piece from a seat in their domain to an adjacent seat, even if it ends up in an opponent's domain",
      "b. Move a piece from a rostrum in their domain to an adjacent rostrum in an opponent's domain",
    ],
    canTargetOwnDomain: true,
    canTargetOpponentDomain: true,
    affectsCommunity: false,
  },
};
