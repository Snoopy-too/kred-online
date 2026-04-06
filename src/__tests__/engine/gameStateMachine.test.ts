// src/__tests__/engine/gameStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import { TurnPhase } from '../../engine/types';
import type { KredAction, MakeMoves, SelectTile, ReceiverDecision, BystanderDecision } from '../../engine/types';

describe('createInitialState', () => {
  it('creates valid 3-player starting state', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    expect(state.players).toHaveLength(3);
    expect(state.config.playerCount).toBe(3);
    expect(state.turn.phase).toBe(TurnPhase.MOVING);
    expect(state.pieces).toHaveLength(24);
    expect(state.players.every(p => p.hand.length === 8)).toBe(true);
    expect(state.players.every(p => p.credibility === 3)).toBe(true);
    for (let p = 1; p <= 3; p++) {
      for (const s of [1, 3, 5]) {
        expect(state.pieces.some(pc => pc.locationId === `p${p}_seat${s}` && pc.type === 'MARK')).toBe(true);
      }
    }
  });

  it('creates valid 4-player starting state', () => {
    const state = createInitialState({ playerCount: 4, seed: 42 });
    expect(state.players).toHaveLength(4);
    expect(state.pieces).toHaveLength(32);
    expect(state.players.every(p => p.hand.length === 6)).toBe(true);
  });

  it('creates valid 5-player starting state with blank tile', () => {
    const state = createInitialState({ playerCount: 5, seed: 42 });
    expect(state.players).toHaveLength(5);
    expect(state.pieces).toHaveLength(40);
    expect(state.players.every(p => p.hand.length === 5)).toBe(true);
    const allTiles = state.players.flatMap(p => p.hand);
    expect(allTiles).toContain('BLANK');
  });

  it('is deterministic with same seed', () => {
    const s1 = createInitialState({ playerCount: 3, seed: 42 });
    const s2 = createInitialState({ playerCount: 3, seed: 42 });
    expect(s1.players.map(p => p.hand)).toEqual(s2.players.map(p => p.hand));
  });

  it('first mover is player with tile 03', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const mover = state.players.find(p => p.hand.includes('03'));
    expect(state.turn.moverId).toBe(mover!.id);
  });
});

describe('gameReducer - MAKE_MOVES', () => {
  it('rejects action in wrong phase', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    state.turn.phase = TurnPhase.AWAITING_RECEIPT;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: state.turn.moverId, moves: [],
    };
    expect(() => gameReducer(state, action)).toThrow();
  });

  it('rejects action from wrong player', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const wrongPlayer = state.players.find(p => p.id !== state.turn.moverId)!;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: wrongPlayer.id, moves: [],
    };
    expect(() => gameReducer(state, action)).toThrow();
  });

  it('accepts valid advance and transitions to SELECTING_TILE', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    };
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.SELECTING_TILE);
    expect(newState.turn.movesExecuted).toHaveLength(1);
    expect(newState.pieces.find(p => p.id === communityMark.id)!.locationId).toBe(`p${moverId}_seat2`);
  });
});

describe('gameReducer - SELECT_TILE', () => {
  it('transitions to AWAITING_RECEIPT', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    const tileId = state.players.find(p => p.id === moverId)!.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId, tileId, receiverPlayerId: receiverId,
    });

    expect(state.turn.phase).toBe(TurnPhase.AWAITING_RECEIPT);
    expect(state.turn.receiverId).toBe(receiverId);
    expect(state.turn.tilePlayedId).toBe(tileId);
  });
});

describe('gameReducer - RECEIVER_DECISION', () => {
  function setupToAwaitingReceipt(seed: number = 42) {
    let state = createInitialState({ playerCount: 3, seed });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    const tileId = state.players.find(p => p.id === moverId)!.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId, tileId, receiverPlayerId: receiverId,
    });

    return state;
  }

  it('ACCEPT transitions to AWAITING_CHALLENGES', () => {
    const state = setupToAwaitingReceipt();
    const receiverId = state.turn.receiverId!;
    const newState = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT',
    });
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_CHALLENGES);
    expect(newState.turn.pendingBystanders.length).toBeGreaterThan(0);
  });

  it('ACCEPT_BLIND transitions to AWAITING_CHALLENGES', () => {
    const state = setupToAwaitingReceipt();
    const receiverId = state.turn.receiverId!;
    const newState = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT_BLIND',
    });
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_CHALLENGES);
  });
});

describe('gameReducer - full turn cycle (Quiet is Kept)', () => {
  it('completes a full honest turn with all bystanders passing', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    const moverPlayer = state.players.find(p => p.id === moverId)!;
    const advanceTile = moverPlayer.hand.find(t => t === '05' || t === '06') || moverPlayer.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId, tileId: advanceTile, receiverPlayerId: receiverId,
    });

    state = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT',
    });

    while (state.turn.phase === TurnPhase.AWAITING_CHALLENGES && state.turn.pendingBystanders.length > 0) {
      const bystander = state.turn.pendingBystanders[0];
      state = gameReducer(state, {
        type: 'BYSTANDER_DECISION', playerId: bystander, decision: 'PASS',
      });
    }

    expect(state.turn.phase).toBe(TurnPhase.MOVING);
    expect(state.turn.moverId).toBe(receiverId);
    expect(state.players.find(p => p.id === receiverId)!.bankFaceDown).toContain(advanceTile);
  });
});
