// src/engine/types.ts
import { DefinedMoveType } from '@kred/shared';

// ============================================================================
// PIECE (simplified — no position/rotation, just id + type + location)
// ============================================================================

export type PieceType = 'MARK' | 'HEEL' | 'PAWN';

export interface KredPiece {
  id: string;
  type: PieceType;
  locationId: string; // e.g. 'p1_seat3', 'community_mark_1', 'p2_rostrum1'
}

// ============================================================================
// PLAYER (engine-only — no UI tiles, just string IDs)
// ============================================================================

export interface EnginePlayer {
  id: number; // 1-based
  hand: string[]; // tile IDs in hand (e.g. ['01', '05', '12'])
  bankFaceDown: string[]; // tile IDs counted for Bureaucracy
  bankFaceUp: string[]; // tile IDs NOT counted (exposed dishonest plays)
  credibility: number; // 0-3
  credibilityAtTurnStart: number; // snapshot for zero-cred penalty rules
}

// ============================================================================
// TURN PHASE
// ============================================================================

export enum TurnPhase {
  MOVING = 'MOVING',
  SELECTING_TILE = 'SELECTING_TILE',
  AWAITING_RECEIPT = 'AWAITING_RECEIPT',
  AWAITING_CHALLENGES = 'AWAITING_CHALLENGES',
  RESOLVING_OUTCOME = 'RESOLVING_OUTCOME',
  RESOLVE_SUPPORT = 'RESOLVE_SUPPORT',
  BUREAUCRACY = 'BUREAUCRACY',
  GAME_OVER = 'GAME_OVER',
}

// ============================================================================
// ENGINE MOVE (simplified TrackedMove — no positions, just IDs)
// ============================================================================

export interface EngineMove {
  moveType: DefinedMoveType;
  pieceId: string;
  fromLocationId: string;
  toLocationId: string;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface KredGameState {
  pieces: KredPiece[];
  players: EnginePlayer[];

  turn: {
    phase: TurnPhase;
    moverId: number;
    receiverId: number | null;
    movesExecuted: EngineMove[];
    tilePlayedId: string | null; // tile the Mover placed face-down
    pendingBystanders: number[]; // player IDs who haven't decided yet
    challengerId: number | null;
    // Bluff tracking: what moves did the mover intend? (for bot coordination)
    isBluff: boolean;
  };

  campaign: {
    number: number; // which Campaign (1-based)
  };

  bureaucracy: {
    turnOrder: number[];
    currentPlayerIndex: number;
    remainingFunding: Record<number, number>; // playerId -> remaining kredcoins
  };

  config: {
    playerCount: 3 | 4 | 5;
    seed: number;
  };

  history: KredAction[];

  // Pre-move snapshot for undoing dishonest plays
  piecesBeforeMove: KredPiece[] | null;

  // Phase to return to after RESOLVE_SUPPORT
  phaseBeforeSupport: TurnPhase | null;
}

// ============================================================================
// ACTIONS (discriminated union)
// ============================================================================

export interface MakeMoves {
  type: 'MAKE_MOVES';
  playerId: number;
  moves: EngineMove[];
}

export interface SelectTile {
  type: 'SELECT_TILE';
  playerId: number;
  tileId: string;
  receiverPlayerId: number;
}

export interface ReceiverDecision {
  type: 'RECEIVER_DECISION';
  playerId: number;
  decision: 'ACCEPT' | 'ACCEPT_BLIND' | 'REJECT';
}

export interface BystanderDecision {
  type: 'BYSTANDER_DECISION';
  playerId: number;
  decision: 'CHALLENGE' | 'PASS';
}

export interface ResolveSupport {
  type: 'RESOLVE_SUPPORT';
  playerId: number;
  pieceId: string;
  targetLocationId: string;
}

export interface BureaucracyPurchase {
  type: 'BUREAUCRACY_PURCHASE';
  playerId: number;
  menuItemId: string;
  targetPieceId?: string;
  targetLocationId?: string;
}

export interface EndBureaucracyTurn {
  type: 'END_BUREAUCRACY_TURN';
  playerId: number;
}

export type KredAction =
  | MakeMoves
  | SelectTile
  | ReceiverDecision
  | BystanderDecision
  | ResolveSupport
  | BureaucracyPurchase
  | EndBureaucracyTurn;

// ============================================================================
// RESULTS
// ============================================================================

export interface InvariantResult {
  passed: boolean;
  name: string;
  details?: string;
}

export interface InvariantViolation {
  invariantName: string;
  details: string;
  stateBefore: KredGameState;
  stateAfter: KredGameState;
  triggeringAction: KredAction;
  actionIndex: number;
}

export interface GameResult {
  outcome: 'WIN' | 'DRAW' | 'STALEMATE';
  winnerIds: number[]; // single for WIN, multiple for DRAW, empty for STALEMATE
  actions: KredAction[];
  violations: InvariantViolation[];
  stats: {
    campaignCount: number;
    totalActions: number;
    finalPieces: KredPiece[];
  };
  config: {
    playerCount: 3 | 4 | 5;
    seed: number;
  };
}
