// --- Move Type Definitions ---

export enum DefinedMoveType {
  REMOVE = 'REMOVE',
  ADVANCE = 'ADVANCE',
  INFLUENCE = 'INFLUENCE',
  ASSIST = 'ASSIST',
  WITHDRAW = 'WITHDRAW',
  ORGANIZE = 'ORGANIZE',
}

export enum MoveRequirementType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
}

export interface DefinedMove {
  type: DefinedMoveType;
  category: 'M' | 'O'; // 'M' = My domain, 'O' = Opponent domain
  requirement: MoveRequirementType;
  description: string;
  options: string[];
  canTargetOwnDomain: boolean;
  canTargetOpponentDomain: boolean;
  affectsCommunity: boolean;
}

// Move tracking for undo/replay functionality
export interface TrackedMove {
  moveType: DefinedMoveType;
  category: 'M' | 'O'; // M = My domain, O = Opponent domain
  pieceId: string;
  fromPosition: { top: number; left: number };
  fromLocationId?: string;
  toPosition: { top: number; left: number };
  toLocationId?: string;
  timestamp: number;
}
