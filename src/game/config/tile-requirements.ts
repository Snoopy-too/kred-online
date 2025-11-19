/**
 * Tile Requirements
 * Complete mapping of all tile IDs to their movement requirements
 */

import { TileRequirement, DefinedMoveType } from '../types';

/**
 * Complete mapping of all tile IDs to their movement requirements.
 *
 * Tiles are identified by their SVG filenames (01.svg through 24.svg) plus the Blank tile.
 * Each tile specifies the exact moves that MUST be executed by the receiving player.
 */
export const TILE_REQUIREMENTS: { [tileId: string]: TileRequirement } = {
  // Tiles 01-02: Require Remove (O) and Advance (M)
  '01': {
    tileId: '01',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: '(O) Remove and (M) Advance',
    canBeRejected: false,
  },
  '02': {
    tileId: '02',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
    description: '(O) Remove and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 03-04: Require Influence (O) and Advance (M)
  '03': {
    tileId: '03',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: '(O) Influence and (M) Advance',
    canBeRejected: false,
  },
  '04': {
    tileId: '04',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
    description: '(O) Influence and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 05-06: Require only Advance (M)
  '05': {
    tileId: '05',
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: '(M) Advance',
    canBeRejected: false,
  },
  '06': {
    tileId: '06',
    requiredMoves: [DefinedMoveType.ADVANCE],
    description: '(M) Advance',
    canBeRejected: false,
  },

  // Tiles 07-08: Require Assist (O) and Advance (M)
  '07': {
    tileId: '07',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: '(O) Assist and (M) Advance',
    canBeRejected: false,
  },
  '08': {
    tileId: '08',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
    description: '(O) Assist and (M) Advance',
    canBeRejected: false,
  },

  // Tiles 09-10: Require Remove (O) and Organize (M)
  '09': {
    tileId: '09',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: '(O) Remove and (M) Organize',
    canBeRejected: false,
  },
  '10': {
    tileId: '10',
    requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
    description: '(O) Remove and (M) Organize',
    canBeRejected: false,
  },

  // Tile 11: Require only Influence (O)
  '11': {
    tileId: '11',
    requiredMoves: [DefinedMoveType.INFLUENCE],
    description: '(O) Influence',
    canBeRejected: false,
  },

  // Tile 12: Require only Organize (M)
  '12': {
    tileId: '12',
    requiredMoves: [DefinedMoveType.ORGANIZE],
    description: '(M) Organize',
    canBeRejected: false,
  },

  // Tiles 13-14: Require Assist (O) and Organize (M)
  '13': {
    tileId: '13',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: '(O) Assist and (M) Organize',
    canBeRejected: false,
  },
  '14': {
    tileId: '14',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
    description: '(O) Assist and (M) Organize',
    canBeRejected: false,
  },

  // Tiles 15-16: Require only Remove (O)
  '15': {
    tileId: '15',
    requiredMoves: [DefinedMoveType.REMOVE],
    description: '(O) Remove',
    canBeRejected: false,
  },
  '16': {
    tileId: '16',
    requiredMoves: [DefinedMoveType.REMOVE],
    description: '(O) Remove',
    canBeRejected: false,
  },

  // Tiles 17-18: Require Influence (O) and Withdraw (M)
  '17': {
    tileId: '17',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: '(O) Influence and (M) Withdraw',
    canBeRejected: false,
  },
  '18': {
    tileId: '18',
    requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
    description: '(O) Influence and (M) Withdraw',
    canBeRejected: false,
  },

  // Tiles 19-21: Require only Withdraw (M)
  '19': {
    tileId: '19',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },
  '20': {
    tileId: '20',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },
  '21': {
    tileId: '21',
    requiredMoves: [DefinedMoveType.WITHDRAW],
    description: '(M) Withdraw',
    canBeRejected: false,
  },

  // Tiles 22-24: Require Assist (O) and Withdraw (M)
  '22': {
    tileId: '22',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },
  '23': {
    tileId: '23',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },
  '24': {
    tileId: '24',
    requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
    description: '(O) Assist and (M) Withdraw',
    canBeRejected: false,
  },

  // Blank tile (5-player mode only) - wild tile
  BLANK: {
    tileId: 'BLANK',
    requiredMoves: [],
    description:
      'Blank - Wild tile. The player may perform one "O" move and/or one "M" move, or no move at all.',
    canBeRejected: true, // Can be rejected if moves don't match allowed patterns
  },
};

/**
 * Gets the tile requirements for a specific tile ID.
 * @param tileId The tile ID (e.g., '01', '24', 'BLANK').
 * @returns The TileRequirement object, or null if tile not found.
 */
export function getTileRequirements(tileId: string): TileRequirement | null {
  return TILE_REQUIREMENTS[tileId] || null;
}

/**
 * Checks if a tile has specific move requirements.
 * @param tileId The tile ID to check.
 * @returns True if the tile has required moves (non-empty).
 */
export function tileHasRequirements(tileId: string): boolean {
  const requirements = getTileRequirements(tileId);
  return requirements ? requirements.requiredMoves.length > 0 : false;
}
