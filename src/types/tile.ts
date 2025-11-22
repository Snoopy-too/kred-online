// --- Tile Type Definitions ---

export interface Tile {
  id: number;
  url: string;
}

// Represents a tile instance on the game board
export interface BoardTile {
  id: string;
  tile: Tile;
  position: { top: number; left: number };
  rotation: number;
  placerId: number;
  ownerId: number; // Who owns the slot.
}

export interface TileReceivingSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}
