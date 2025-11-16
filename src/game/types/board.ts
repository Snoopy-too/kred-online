/**
 * Board-related type definitions
 * Defines the structure of the game board, pieces, and locations
 */

import { Tile } from './player';

/**
 * Represents a drop location on the game board where pieces can be placed
 */
export interface DropLocation {
  id: string;
  position: { left: number; top: number };
}

/**
 * Represents a space where tiles can be received/placed
 */
export interface TileReceivingSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}

/**
 * Represents a bank space for storing played tiles
 */
export interface BankSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}

/**
 * Information about a type of game piece
 */
export interface GamePieceInfo {
  name: string;
  imageUrl: string;
}

/**
 * Represents a piece instance on the game board
 */
export interface Piece {
  id: string;
  name: string;
  imageUrl: string;
  position: { top: number; left: number }; // in percentage
  rotation: number;
  locationId?: string; // ID of the drop location where this piece is placed
}

/**
 * Represents a tile instance placed on the game board
 */
export interface BoardTile {
  id: string;
  tile: Tile;
  position: { top: number; left: number };
  rotation: number;
  placerId: number;
  ownerId: number; // Who owns the slot
}
