// --- Game Piece Type Definitions ---

export interface GamePieceInfo {
  name: string;
  imageUrl: string;
}

// Represents a piece instance on the game board
export interface Piece {
  id: string;
  name: string;
  imageUrl: string;
  position: { top: number; left: number }; // in percentage
  rotation: number;
  locationId?: string; // ID of the drop location where this piece is placed
}
