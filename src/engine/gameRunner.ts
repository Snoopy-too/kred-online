// src/engine/gameRunner.ts
import { SeededRandom } from './seededRandom';
import { createInitialState, gameReducer, InvariantViolationError } from './gameStateMachine';
import { randomBot } from './randomBot';
import { TurnPhase, type KredGameState, type GameResult, type InvariantViolation } from './types';

const MAX_ACTIONS = 500;

export function runGame(config: { playerCount: 3 | 4 | 5; seed?: number }): GameResult {
  const seed = config.seed ?? Date.now();
  const rng = new SeededRandom(seed);
  let state = createInitialState({ playerCount: config.playerCount, seed });
  const violations: InvariantViolation[] = [];
  let actionCount = 0;

  while (state.turn.phase !== TurnPhase.GAME_OVER && actionCount < MAX_ACTIONS) {
    const activePlayerId = getActivePlayer(state);
    if (activePlayerId === null) break;

    const action = randomBot(state, activePlayerId, rng);
    const stateBefore = state;
    try {
      state = gameReducer(state, action);
    } catch (err) {
      if (err instanceof InvariantViolationError) {
        violations.push({
          invariantName: err.invariantName,
          details: err.details,
          stateBefore,
          stateAfter: state,
          triggeringAction: action,
          actionIndex: actionCount,
        });
        break;
      }
      // ActionError — try fallback for bureaucracy, otherwise break
      if (state.turn.phase === TurnPhase.BUREAUCRACY) {
        try {
          state = gameReducer(state, { type: 'END_BUREAUCRACY_TURN', playerId: activePlayerId });
        } catch { break; }
      } else {
        break;
      }
    }
    actionCount++;
  }

  let outcome: 'WIN' | 'DRAW' | 'STALEMATE';
  const winnerIds: number[] = [];

  if (state.turn.phase === TurnPhase.GAME_OVER) {
    for (let p = 1; p <= config.playerCount; p++) {
      if (isWinner(state, p)) winnerIds.push(p);
    }
    outcome = winnerIds.length > 1 ? 'DRAW' : 'WIN';
  } else {
    outcome = 'STALEMATE';
  }

  return {
    outcome, winnerIds,
    actions: state.history, violations,
    stats: { campaignCount: state.campaign.number, totalActions: actionCount, finalPieces: state.pieces },
    config: { playerCount: config.playerCount, seed },
  };
}

function getActivePlayer(state: KredGameState): number | null {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
    case TurnPhase.SELECTING_TILE:
      return state.turn.moverId;
    case TurnPhase.AWAITING_RECEIPT:
      return state.turn.receiverId;
    case TurnPhase.AWAITING_CHALLENGES:
      return state.turn.pendingBystanders[0] ?? null;
    case TurnPhase.BUREAUCRACY:
      return state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex] ?? null;
    case TurnPhase.RESOLVE_SUPPORT:
      return state.turn.moverId;
    default:
      return null;
  }
}

function isWinner(state: KredGameState, playerId: number): boolean {
  const allSeats = Array.from({ length: 6 }, (_, i) => `p${playerId}_seat${i + 1}`);
  if (!allSeats.every(s => state.pieces.some(p => p.locationId === s))) return false;
  const r1 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum1`);
  const r2 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum2`);
  if (!r1 || r1.type !== 'HEEL' || !r2 || r2.type !== 'HEEL') return false;
  const office = state.pieces.find(p => p.locationId === `p${playerId}_office`);
  return !!office && office.type === 'PAWN';
}
