// --- Game State Type Definitions ---

export type GameState =
  | 'PLAYER_SELECTION'
  | 'DRAFTING'
  | 'CAMPAIGN'
  | 'TILE_PLAYED'
  | 'PENDING_ACCEPTANCE'
  | 'PENDING_CHALLENGE'
  | 'CORRECTION_REQUIRED'
  | 'BUREAUCRACY';

export interface DropLocation {
  id: string;
  position: { left: number; top: number };
}

export interface BankSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}
