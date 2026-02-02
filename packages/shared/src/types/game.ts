// --- Game State Type Definitions ---

export type GameState =
  | 'PLAYER_SELECTION'
  | 'DRAFTING'
  | 'CAMPAIGN'
  | 'TILE_PLAYED'
  | 'PENDING_ACCEPTANCE'
  | 'PENDING_CHALLENGE'
  | 'CORRECTION_REQUIRED'
  | 'BUREAUCRACY'
  | 'TAKE_ADVANTAGE_OFFERED'
  | 'GAME_WON';

export interface DropLocation {
  id: string;
  position: { left: number; top: number };
}

export interface BankSpace {
  ownerId: number;
  position: { left: number; top: number };
  rotation: number;
}
