// src/__tests__/engine/types.test.ts
import { describe, it, expect } from 'vitest';
import {
  TurnPhase,
  type KredPiece,
  type EnginePlayer,
  type KredGameState,
  type MakeMoves,
  type SelectTile,
  type ReceiverDecision,
  type BystanderDecision,
  type ResolveSupport,
  type BureaucracyPurchase,
  type EndBureaucracyTurn,
  type KredAction,
  type GameResult,
  type InvariantViolation,
  type InvariantResult,
} from '../../engine/types';

describe('engine types', () => {
  it('TurnPhase enum has all phases', () => {
    expect(TurnPhase.MOVING).toBe('MOVING');
    expect(TurnPhase.SELECTING_TILE).toBe('SELECTING_TILE');
    expect(TurnPhase.AWAITING_RECEIPT).toBe('AWAITING_RECEIPT');
    expect(TurnPhase.AWAITING_CHALLENGES).toBe('AWAITING_CHALLENGES');
    expect(TurnPhase.RESOLVING_OUTCOME).toBe('RESOLVING_OUTCOME');
    expect(TurnPhase.RESOLVE_SUPPORT).toBe('RESOLVE_SUPPORT');
    expect(TurnPhase.BUREAUCRACY).toBe('BUREAUCRACY');
    expect(TurnPhase.GAME_OVER).toBe('GAME_OVER');
  });

  it('KredPiece can be constructed', () => {
    const piece: KredPiece = {
      id: 'campaign_mark_1',
      type: 'MARK',
      locationId: 'p1_seat1',
    };
    expect(piece.id).toBe('campaign_mark_1');
    expect(piece.type).toBe('MARK');
    expect(piece.locationId).toBe('p1_seat1');
  });

  it('EnginePlayer can be constructed', () => {
    const player: EnginePlayer = {
      id: 1,
      hand: ['01', '05', '12'],
      bankFaceDown: [],
      bankFaceUp: [],
      credibility: 3,
      credibilityAtTurnStart: 3,
    };
    expect(player.hand).toHaveLength(3);
    expect(player.credibility).toBe(3);
  });

  it('KredAction discriminated union works via type field', () => {
    const action: KredAction = {
      type: 'MAKE_MOVES',
      playerId: 1,
      moves: [],
    };
    expect(action.type).toBe('MAKE_MOVES');

    const selectTile: KredAction = {
      type: 'SELECT_TILE',
      playerId: 1,
      tileId: '05',
      receiverPlayerId: 2,
    };
    expect(selectTile.type).toBe('SELECT_TILE');
  });

  it('InvariantResult can be constructed', () => {
    const pass: InvariantResult = { passed: true, name: 'test' };
    expect(pass.passed).toBe(true);

    const fail: InvariantResult = { passed: false, name: 'test', details: 'broke' };
    expect(fail.details).toBe('broke');
  });
});
