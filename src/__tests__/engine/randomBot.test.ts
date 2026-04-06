// src/__tests__/engine/randomBot.test.ts
import { describe, it, expect } from 'vitest';
import { randomBot } from '../../engine/randomBot';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import { TurnPhase } from '../../engine/types';
import { SeededRandom } from '../../engine/seededRandom';

describe('randomBot', () => {
  it('produces MAKE_MOVES action in MOVING phase', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const action = randomBot(state, state.turn.moverId, rng);
    expect(action.type).toBe('MAKE_MOVES');
    expect(action.playerId).toBe(state.turn.moverId);
  });

  it('produced moves are accepted by the reducer', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const action = randomBot(state, state.turn.moverId, rng);
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.SELECTING_TILE);
  });

  it('produces SELECT_TILE in SELECTING_TILE phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    state = gameReducer(state, randomBot(state, state.turn.moverId, rng));
    const action = randomBot(state, state.turn.moverId, rng);
    expect(action.type).toBe('SELECT_TILE');
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_RECEIPT);
  });

  it('produces RECEIVER_DECISION in AWAITING_RECEIPT phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const moverId = state.turn.moverId;
    state = gameReducer(state, randomBot(state, moverId, rng));
    state = gameReducer(state, randomBot(state, moverId, rng));
    const receiverId = state.turn.receiverId!;
    const action = randomBot(state, receiverId, rng);
    expect(action.type).toBe('RECEIVER_DECISION');
  });

  it('produces BYSTANDER_DECISION in AWAITING_CHALLENGES phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 10 });
    const rng = new SeededRandom(10);
    const moverId = state.turn.moverId;
    state = gameReducer(state, randomBot(state, moverId, rng));
    state = gameReducer(state, randomBot(state, moverId, rng));
    const receiverId = state.turn.receiverId!;
    state = gameReducer(state, { type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT' });
    if (state.turn.phase === TurnPhase.AWAITING_CHALLENGES && state.turn.pendingBystanders.length > 0) {
      const bystander = state.turn.pendingBystanders[0];
      const action = randomBot(state, bystander, rng);
      expect(action.type).toBe('BYSTANDER_DECISION');
    }
  });

  it('can drive a complete turn without errors', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(42);
    const startMover = state.turn.moverId;

    let actions = 0;
    while (state.turn.phase !== TurnPhase.GAME_OVER && actions < 20) {
      let activePlayerId: number;
      if (state.turn.phase === TurnPhase.MOVING || state.turn.phase === TurnPhase.SELECTING_TILE) {
        activePlayerId = state.turn.moverId;
      } else if (state.turn.phase === TurnPhase.AWAITING_RECEIPT) {
        activePlayerId = state.turn.receiverId!;
      } else if (state.turn.phase === TurnPhase.AWAITING_CHALLENGES) {
        activePlayerId = state.turn.pendingBystanders[0];
      } else {
        break;
      }
      state = gameReducer(state, randomBot(state, activePlayerId, rng));
      actions++;
      if (state.turn.phase === TurnPhase.MOVING && state.turn.moverId !== startMover) break;
    }

    expect(actions).toBeGreaterThan(3);
  });
});
