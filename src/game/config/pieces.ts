/**
 * Piece Configuration
 * Defines piece types and counts for different player configurations
 */

import { GamePieceInfo } from '../types';

/**
 * Piece type definitions with image URLs
 */
export const PIECE_TYPES: { [key: string]: GamePieceInfo } = {
  MARK: { name: 'Mark', imageUrl: './images/mark-transparent_bg.png' },
  HEEL: { name: 'Heel', imageUrl: './images/heel-transparent_bg.png' },
  PAWN: { name: 'Pawn', imageUrl: './images/pawn-transparent_bg.png' },
};

/**
 * Number of each piece type by player count
 */
export const PIECE_COUNTS_BY_PLAYER_COUNT: {
  [playerCount: number]: { [pieceType: string]: number };
} = {
  3: {
    MARK: 12,
    HEEL: 9,
    PAWN: 3,
  },
  4: {
    MARK: 14,
    HEEL: 13,
    PAWN: 4,
  },
  5: {
    MARK: 18,
    HEEL: 17,
    PAWN: 5,
  },
};
