import { DefinedMoveType, MoveRequirementType, DefinedMove } from '../types/move';

/**
 * TILE PLAY OPTION TYPES
 *
 * Defines the four possible response options when a player receives a played tile.
 */
export enum TilePlayOptionType {
  NO_MOVE = "NO_MOVE",
  ONE_OPTIONAL = "ONE_OPTIONAL",
  ONE_MANDATORY = "ONE_MANDATORY",
  ONE_OPTIONAL_AND_ONE_MANDATORY = "ONE_OPTIONAL_AND_ONE_MANDATORY",
}

/**
 * TILE PLAY OPTION INTERFACE
 *
 * Defines the structure of a tile play option, specifying:
 * - What types of moves are allowed
 * - How many of each type can be performed
 * - Whether the option requires action or is passive
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

/**
 * TILE PLAY OPTIONS - What a Player Can Do When Challenged
 *
 * When a player plays a tile to another player, the receiving player initially has ONE of
 * these four options available to them, pending any rejection challenges.
 *
 * The receiving player selects ONE option from:
 *
 * a. NO MOVE - Do nothing. The tile play is complete.
 *
 * b. ONE "O" MOVE - Execute one Optional move (REMOVE, INFLUENCE, or ASSIST).
 *    Examples: Remove opponent's piece, move opponent's piece via adjacency, or assist opponent.
 *
 * c. ONE "M" MOVE - Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE).
 *    Examples: Move piece up the hierarchy, move piece down, or move to adjacent location.
 *
 * d. ONE "O" MOVE AND ONE "M" MOVE - Execute both an Optional and a Mandatory move in any order.
 *    Examples: Remove opponent's piece AND advance your own, or any other valid combination.
 *
 * Note: The options above may be modified by rejection challenges or tile-specific requirements.
 */
export const TILE_PLAY_OPTIONS: {
  [key in TilePlayOptionType]: TilePlayOption;
} = {
  [TilePlayOptionType.NO_MOVE]: {
    optionType: TilePlayOptionType.NO_MOVE,
    description: "Do nothing. The tile play is complete.",
    allowedMoveTypes: [],
    maxOptionalMoves: 0,
    maxMandatoryMoves: 0,
    requiresAction: false,
  },
  [TilePlayOptionType.ONE_OPTIONAL]: {
    optionType: TilePlayOptionType.ONE_OPTIONAL,
    description: "Execute one Optional move (REMOVE, INFLUENCE, or ASSIST)",
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
    description: "Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE)",
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
      "Execute one Optional move AND one Mandatory move in any order",
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
 * TILE REQUIREMENT INTERFACE
 *
 * Defines the specific moves required when a tile is played.
 * Each tile (except BLANK) requires specific moves that must be executed
 * by the receiving player for the tile play to be valid and non-rejectable.
 */
export interface TileRequirement {
  tileId: string;
  requiredMoves: DefinedMoveType[];
  description: string;
  canBeRejected: boolean; // false = cannot be rejected if requirements met or impossible
}

/**
 * TILE REQUIREMENTS - Specific Moves Required by Each Tile
 *
 * Complete mapping of all tile IDs to their movement requirements.
 * Tiles are identified by their SVG filenames (01.svg through 24.svg) plus the Blank tile.
 * Each tile specifies the exact moves that MUST be executed by the receiving player.
 *
 * CRITICAL RULES:
 * 1. If a tile's requirements are played correctly by the player, it CANNOT be rejected.
 * 2. A correctly played tile is NOT AFFECTED by challenges.
 * 3. If the board state makes one or both requirements impossible to execute, the tile also
 *    CANNOT be rejected and is NOT AFFECTED by challenges.
 * 4. The BLANK TILE (5-player mode only) requires the player to make NO moves.
 *    - If they make ANY moves with the blank tile, those moves ARE AFFECTED by rejection/challenges.
 * 5. All requirements must be completed for the tile to be unrejectable.
 *    - If only some requirements are met, the tile can be rejected.
 */
export const TILE_REQUIREMENTS: { [tileId: string]: TileRequirement } = {
  // Tiles 01-02: Require Remove (O) and Advance (M)
  "01": {
    tileId: "01",
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: "(O) Remove and (M) Advance",
    canBeRejected: false,
  },
  "02": {
    tileId: "02",
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: "(O) Remove and (M) Advance",
    canBeRejected: false,
  },

  // Tiles 03-04: Require Influence (O) and Advance (M)
  "03": {
    tileId: "03",
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: "(O) Influence and (M) Advance",
    canBeRejected: false,
  },
  "04": {
    tileId: "04",
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: "(O) Influence and (M) Advance",
    canBeRejected: false,
  },

  // Tiles 05-06: Require only Advance (M)
  "05": {
    tileId: "05",
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: "(M) Advance",
    canBeRejected: false,
  },
  "06": {
    tileId: "06",
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: "(M) Advance",
    canBeRejected: false,
  },

  // Tiles 07-08: Require Assist (O) and Advance (M)
  "07": {
    tileId: "07",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: "(O) Assist and (M) Advance",
    canBeRejected: false,
  },
  "08": {
    tileId: "08",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: "(O) Assist and (M) Advance",
    canBeRejected: false,
  },

  // Tiles 09-10: Require Remove (O) and Organize (M)
  "09": {
    tileId: "09",
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: "(O) Remove and (M) Organize",
    canBeRejected: false,
  },
  "10": {
    tileId: "10",
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: "(O) Remove and (M) Organize",
    canBeRejected: false,
  },

  // Tile 11: Require only Influence (O)
  "11": {
    tileId: "11",
    requiredMoves: [DefinedMoveType.INFLUENCE],
    description: "(O) Influence",
    canBeRejected: false,
  },

  // Tile 12: Require only Organize (M)
  "12": {
    tileId: "12",
    requiredMoves: [DefinedMoveType.ORGANIZE],
    description: "(M) Organize",
    canBeRejected: false,
  },

  // Tiles 13-14: Require Assist (O) and Organize (M)
  "13": {
    tileId: "13",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: "(O) Assist and (M) Organize",
    canBeRejected: false,
  },
  "14": {
    tileId: "14",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: "(O) Assist and (M) Organize",
    canBeRejected: false,
  },

  // Tiles 15-16: Require only Remove (O)
  "15": {
    tileId: "15",
    requiredMoves: [DefinedMoveType.REMOVE],
    description: "(O) Remove",
    canBeRejected: false,
  },
  "16": {
    tileId: "16",
    requiredMoves: [DefinedMoveType.REMOVE],
    description: "(O) Remove",
    canBeRejected: false,
  },

  // Tiles 17-18: Require Influence (O) and Withdraw (M)
  "17": {
    tileId: "17",
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: "(O) Influence and (M) Withdraw",
    canBeRejected: false,
  },
  "18": {
    tileId: "18",
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: "(O) Influence and (M) Withdraw",
    canBeRejected: false,
  },

  // Tiles 19-21: Require only Withdraw (M)
  "19": {
    tileId: "19",
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: "(M) Withdraw",
    canBeRejected: false,
  },
  "20": {
    tileId: "20",
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: "(M) Withdraw",
    canBeRejected: false,
  },
  "21": {
    tileId: "21",
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: "(M) Withdraw",
    canBeRejected: false,
  },

  // Tiles 22-24: Require Assist (O) and Withdraw (M)
  "22": {
    tileId: "22",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: "(O) Assist and (M) Withdraw",
    canBeRejected: false,
  },
  "23": {
    tileId: "23",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: "(O) Assist and (M) Withdraw",
    canBeRejected: false,
  },
  "24": {
    tileId: "24",
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: "(O) Assist and (M) Withdraw",
    canBeRejected: false,
  },

  // Blank tile (5-player mode only) - wild tile
  BLANK: {
    tileId: "BLANK",
    requiredMoves: [],
    description:
      'Blank - Wild tile. The player may perform one "O" move and/or one "M" move, or no move at all.',
    canBeRejected: true, // Can be rejected if moves don't match allowed patterns
  },
};

/**
 * ROSTRUM SUPPORT INTERFACE
 *
 * Defines a rostrum and the seats that support it.
 * Each rostrum requires at least one supporting seat to have a piece.
 */
export interface RostrumSupport {
  rostrum: string; // e.g., 'p1_rostrum1'
  supportingSeats: string[]; // e.g., ['p1_seat1', 'p1_seat2', 'p1_seat3']
}

/**
 * PLAYER ROSTRUM INTERFACE
 *
 * Defines all rostrums for a single player, including their supporting seats
 * and the player's office.
 */
export interface PlayerRostrum {
  playerId: number;
  rostrums: RostrumSupport[];
  office: string; // e.g., 'p1_office'
}

/**
 * ROSTRUM SUPPORT RULES - Seat-to-Rostrum Support Structure
 *
 * Each player has two rostrums, each supported by specific seats.
 * If all 3 supporting seats for a rostrum become vacant, any piece at that rostrum
 * must be moved to one of the supporting seats.
 *
 * Support structure (same for all player counts: 3, 4, 5 players):
 * - Seats 1-3 support Rostrum 1
 * - Seats 4-6 support Rostrum 2
 *
 * This comprehensive mapping applies to all player counts (3, 4, or 5 players).
 */
export const ROSTRUM_SUPPORT_RULES: { [playerId: number]: PlayerRostrum } = {
  1: {
    playerId: 1,
    rostrums: [
      {
        rostrum: "p1_rostrum1",
        supportingSeats: ["p1_seat1", "p1_seat2", "p1_seat3"],
      },
      {
        rostrum: "p1_rostrum2",
        supportingSeats: ["p1_seat4", "p1_seat5", "p1_seat6"],
      },
    ],
    office: "p1_office",
  },
  2: {
    playerId: 2,
    rostrums: [
      {
        rostrum: "p2_rostrum1",
        supportingSeats: ["p2_seat1", "p2_seat2", "p2_seat3"],
      },
      {
        rostrum: "p2_rostrum2",
        supportingSeats: ["p2_seat4", "p2_seat5", "p2_seat6"],
      },
    ],
    office: "p2_office",
  },
  3: {
    playerId: 3,
    rostrums: [
      {
        rostrum: "p3_rostrum1",
        supportingSeats: ["p3_seat1", "p3_seat2", "p3_seat3"],
      },
      {
        rostrum: "p3_rostrum2",
        supportingSeats: ["p3_seat4", "p3_seat5", "p3_seat6"],
      },
    ],
    office: "p3_office",
  },
  4: {
    playerId: 4,
    rostrums: [
      {
        rostrum: "p4_rostrum1",
        supportingSeats: ["p4_seat1", "p4_seat2", "p4_seat3"],
      },
      {
        rostrum: "p4_rostrum2",
        supportingSeats: ["p4_seat4", "p4_seat5", "p4_seat6"],
      },
    ],
    office: "p4_office",
  },
  5: {
    playerId: 5,
    rostrums: [
      {
        rostrum: "p5_rostrum1",
        supportingSeats: ["p5_seat1", "p5_seat2", "p5_seat3"],
      },
      {
        rostrum: "p5_rostrum2",
        supportingSeats: ["p5_seat4", "p5_seat5", "p5_seat6"],
      },
    ],
    office: "p5_office",
  },
};

/**
 * ROSTRUM ADJACENCY INTERFACE
 *
 * Defines an adjacency relationship between two rostrums.
 * Adjacency is bidirectional - pieces can move in both directions.
 */
export interface RostrumAdjacency {
  rostrum1: string;
  rostrum2: string;
}

/**
 * ROSTRUM ADJACENCY BY PLAYER COUNT - Rostrum-to-Rostrum Movement
 *
 * Certain rostrums are adjacent and allow direct piece movement between them.
 * Adjacency is bidirectional (can move in both directions).
 *
 * Pattern: Each player's rostrum2 connects to another player's rostrum1,
 * forming a circular chain around the board.
 *
 * 3-Player Mode (3 adjacency pairs):
 *   - p1_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 *
 * 4-Player Mode (4 adjacency pairs):
 *   - p1_rostrum2 <-> p4_rostrum1
 *   - p4_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 *
 * 5-Player Mode (5 adjacency pairs):
 *   - p1_rostrum2 <-> p5_rostrum1
 *   - p5_rostrum2 <-> p4_rostrum1
 *   - p4_rostrum2 <-> p3_rostrum1
 *   - p3_rostrum2 <-> p2_rostrum1
 *   - p2_rostrum2 <-> p1_rostrum1
 */
export const ROSTRUM_ADJACENCY_BY_PLAYER_COUNT: {
  [playerCount: number]: RostrumAdjacency[];
} = {
  3: [
    { rostrum1: "p1_rostrum2", rostrum2: "p3_rostrum1" },
    { rostrum1: "p3_rostrum2", rostrum2: "p2_rostrum1" },
    { rostrum1: "p2_rostrum2", rostrum2: "p1_rostrum1" },
  ],
  4: [
    { rostrum1: "p1_rostrum2", rostrum2: "p4_rostrum1" },
    { rostrum1: "p4_rostrum2", rostrum2: "p3_rostrum1" },
    { rostrum1: "p3_rostrum2", rostrum2: "p2_rostrum1" },
    { rostrum1: "p2_rostrum2", rostrum2: "p1_rostrum1" },
  ],
  5: [
    { rostrum1: "p1_rostrum2", rostrum2: "p5_rostrum1" },
    { rostrum1: "p5_rostrum2", rostrum2: "p4_rostrum1" },
    { rostrum1: "p4_rostrum2", rostrum2: "p3_rostrum1" },
    { rostrum1: "p3_rostrum2", rostrum2: "p2_rostrum1" },
    { rostrum1: "p2_rostrum2", rostrum2: "p1_rostrum1" },
  ],
};
