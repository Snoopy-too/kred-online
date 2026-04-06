// src/__tests__/engine/invariants.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import {
  checkFundingChecksum,
  checkPieceConservation,
  checkSupportRule,
  checkOnePawnPerPlayer,
  checkCredibilityBounds,
  checkSeparatePiecesPerTurn,
  checkRemoveRestrictions,
  checkCommunityPiecePriority,
  runAllInvariants,
} from '../../engine/invariants';
import { TurnPhase } from '../../engine/types';
import type { KredGameState, KredPiece, EnginePlayer, EngineMove } from '../../engine/types';

function make3PlayerState(overrides?: Partial<KredGameState>): KredGameState {
  const allTileIds = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));
  const players: EnginePlayer[] = [
    { id: 1, hand: allTileIds.slice(0, 8), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 2, hand: allTileIds.slice(8, 16), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 3, hand: allTileIds.slice(16, 24), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
  ];

  const pieces: KredPiece[] = [];
  let mc = 1;
  for (let p = 1; p <= 3; p++) {
    for (const s of [1, 3, 5]) {
      pieces.push({ id: `mark_${mc}`, type: 'MARK', locationId: `p${p}_seat${s}` });
      mc++;
    }
  }
  for (let i = mc; i <= 12; i++) pieces.push({ id: `mark_${i}`, type: 'MARK', locationId: 'community' });
  for (let i = 1; i <= 9; i++) pieces.push({ id: `heel_${i}`, type: 'HEEL', locationId: 'community' });
  for (let i = 1; i <= 3; i++) pieces.push({ id: `pawn_${i}`, type: 'PAWN', locationId: 'community' });

  return {
    pieces, players,
    turn: { phase: TurnPhase.MOVING, moverId: 1, receiverId: null, movesExecuted: [],
            tilePlayedId: null, pendingBystanders: [], challengerId: null, isBluff: false },
    campaign: { number: 1 },
    bureaucracy: { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} },
    config: { playerCount: 3, seed: 42 },
    history: [], piecesBeforeMove: null, phaseBeforeSupport: null,
    ...overrides,
  };
}

describe('checkFundingChecksum', () => {
  it('passes when all tiles accounted for', () => {
    const state = make3PlayerState();
    expect(checkFundingChecksum(state).passed).toBe(true);
  });

  it('fails when a tile is missing', () => {
    const state = make3PlayerState();
    state.players[0].hand.pop();
    expect(checkFundingChecksum(state).passed).toBe(false);
  });
});

describe('checkPieceConservation', () => {
  it('passes with correct piece count', () => {
    const state = make3PlayerState();
    expect(checkPieceConservation(state).passed).toBe(true);
  });

  it('fails when a piece is duplicated', () => {
    const state = make3PlayerState();
    state.pieces.push({ id: 'extra', type: 'MARK', locationId: 'community' });
    expect(checkPieceConservation(state).passed).toBe(false);
  });
});

describe('checkSupportRule', () => {
  it('passes for starting board', () => {
    const state = make3PlayerState();
    expect(checkSupportRule(state).passed).toBe(true);
  });

  it('fails for unsupported rostrum', () => {
    const state2 = make3PlayerState();
    state2.pieces = state2.pieces.filter(p => !['p1_seat1', 'p1_seat3'].includes(p.locationId));
    state2.pieces.push({ id: 'rogue', type: 'MARK', locationId: 'p1_rostrum1' });
    expect(checkSupportRule(state2).passed).toBe(false);
  });
});

describe('checkOnePawnPerPlayer', () => {
  it('passes when no player has more than 1 pawn', () => {
    const state = make3PlayerState();
    expect(checkOnePawnPerPlayer(state).passed).toBe(true);
  });

  it('fails when a player has 2 pawns', () => {
    const state = make3PlayerState();
    state.pieces.push({ id: 'pawn_extra', type: 'PAWN', locationId: 'p1_seat2' });
    state.pieces.push({ id: 'pawn_extra2', type: 'PAWN', locationId: 'p1_seat4' });
    expect(checkOnePawnPerPlayer(state).passed).toBe(false);
  });
});

describe('checkCredibilityBounds', () => {
  it('passes for valid credibility', () => {
    const state = make3PlayerState();
    expect(checkCredibilityBounds(state).passed).toBe(true);
  });

  it('fails for negative credibility', () => {
    const state = make3PlayerState();
    state.players[0].credibility = -1;
    expect(checkCredibilityBounds(state).passed).toBe(false);
  });

  it('fails for credibility > 3', () => {
    const state = make3PlayerState();
    state.players[0].credibility = 4;
    expect(checkCredibilityBounds(state).passed).toBe(false);
  });
});

describe('checkSeparatePiecesPerTurn', () => {
  it('passes when moves target different pieces', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.REMOVE, pieceId: 'mark_4', fromLocationId: 'p2_seat1', toLocationId: 'community' },
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_10', fromLocationId: 'community', toLocationId: 'p1_seat2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(true);
  });

  it('fails when same piece moved twice', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.INFLUENCE, pieceId: 'mark_4', fromLocationId: 'p2_seat1', toLocationId: 'p1_seat6' },
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_4', fromLocationId: 'p1_seat6', toLocationId: 'p1_rostrum2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(false);
  });

  it('passes for single move', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_10', fromLocationId: 'community', toLocationId: 'p1_seat2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(true);
  });
});

describe('runAllInvariants', () => {
  it('all pass for valid starting state', () => {
    const state = make3PlayerState();
    const results = runAllInvariants(state);
    expect(results.every(r => r.passed)).toBe(true);
  });
});
