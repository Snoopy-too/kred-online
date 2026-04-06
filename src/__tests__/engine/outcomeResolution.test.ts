// src/__tests__/engine/outcomeResolution.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import {
  resolveQuietIsKept,
  resolveWhistleBlown,
  resolveSmokingGun,
  resolveWitchHunt,
  determineHonesty,
} from '../../engine/outcomeResolution';
import { TurnPhase } from '../../engine/types';
import type { KredGameState, KredPiece, EnginePlayer } from '../../engine/types';

function makeState(overrides?: Partial<KredGameState>): KredGameState {
  const players: EnginePlayer[] = [
    { id: 1, hand: ['01', '05'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 2, hand: ['03', '07'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 3, hand: ['09', '11'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
  ];
  const pieces: KredPiece[] = [
    { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
    { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
  ];
  return {
    pieces,
    players,
    turn: {
      phase: TurnPhase.AWAITING_CHALLENGES,
      moverId: 1,
      receiverId: 2,
      movesExecuted: [{ moveType: DefinedMoveType.REMOVE, pieceId: 'mark_2', fromLocationId: 'p2_seat1', toLocationId: 'community' },
                       { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_99', fromLocationId: 'community', toLocationId: 'p1_seat2' }],
      tilePlayedId: '01', // Remove + Advance
      pendingBystanders: [3],
      challengerId: null,
      isBluff: false,
    },
    campaign: { number: 1 },
    bureaucracy: { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} },
    config: { playerCount: 3, seed: 42 },
    history: [],
    piecesBeforeMove: null,
    phaseBeforeSupport: null,
    ...overrides,
  };
}

describe('determineHonesty', () => {
  it('honest when moves match tile requirements', () => {
    const state = makeState();
    expect(determineHonesty(state)).toBe(true);
  });

  it('dishonest when moves do not match tile', () => {
    const state = makeState();
    state.turn.tilePlayedId = '05'; // requires only ADVANCE
    expect(determineHonesty(state)).toBe(false);
  });

  it('BLANK tile is always honest', () => {
    const state = makeState();
    state.turn.tilePlayedId = 'BLANK';
    expect(determineHonesty(state)).toBe(true);
  });
});

describe('resolveQuietIsKept', () => {
  it('moves tile to receiver bankFaceDown', () => {
    const state = makeState();
    const result = resolveQuietIsKept(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceDown).toContain('01');
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.hand).not.toContain('01');
  });

  it('no credibility changes', () => {
    const state = makeState();
    const result = resolveQuietIsKept(state);
    expect(result.players.every(p => p.credibility === 3)).toBe(true);
  });
});

describe('resolveWhistleBlown', () => {
  it('mover loses 1 credibility', () => {
    const state = makeState();
    state.piecesBeforeMove = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
    ];
    const result = resolveWhistleBlown(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(2);
  });

  it('receiver restores up to 2 credibility', () => {
    const state = makeState();
    state.piecesBeforeMove = [...state.pieces];
    state.players[1].credibility = 1;
    state.players[1].credibilityAtTurnStart = 1;
    const result = resolveWhistleBlown(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.credibility).toBe(3);
  });

  it('tile goes face-up in receiver bank (not counted for funding)', () => {
    const state = makeState();
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveWhistleBlown(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceUp).toContain('01');
    expect(receiver.bankFaceDown).not.toContain('01');
  });

  it('pieces are restored to pre-move positions', () => {
    const state = makeState();
    state.piecesBeforeMove = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
      { id: 'mark_99', type: 'MARK', locationId: 'community' },
    ];
    state.pieces = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'community' },
      { id: 'mark_99', type: 'MARK', locationId: 'p1_seat2' },
    ];
    const result = resolveWhistleBlown(state);
    expect(result.piecesBeforeMove).toBeNull();
  });
});

describe('resolveSmokingGun', () => {
  it('mover loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(2);
  });

  it('challenger restores 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    state.players[2].credibility = 2;
    const result = resolveSmokingGun(state);
    const challenger = result.players.find(p => p.id === 3)!;
    expect(challenger.credibility).toBe(3);
  });

  it('receiver loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.credibility).toBe(2);
  });

  it('tile goes face-up in receiver bank', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceUp).toContain('01');
  });
});

describe('resolveWitchHunt', () => {
  it('mover restores 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.players[0].credibility = 2;
    const result = resolveWitchHunt(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(3);
  });

  it('mover does NOT restore if had 0 cred at turn start', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.players[0].credibility = 0;
    state.players[0].credibilityAtTurnStart = 0;
    const result = resolveWitchHunt(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(0);
  });

  it('challenger loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    const result = resolveWitchHunt(state);
    const challenger = result.players.find(p => p.id === 3)!;
    expect(challenger.credibility).toBe(2);
  });

  it('tile goes face-down in receiver bank (counted for funding)', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    const result = resolveWitchHunt(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceDown).toContain('01');
  });
});
