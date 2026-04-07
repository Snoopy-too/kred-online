// src/engine/gameRunner.ts
import { SeededRandom } from './seededRandom';
import { createInitialState, gameReducer, InvariantViolationError } from './gameStateMachine';
import { randomBot } from './randomBot';
import { TurnPhase, type KredGameState, type GameResult, type InvariantViolation } from './types';
import { checkSupportViolations } from './moveValidation';

const MAX_ACTIONS = 2000;

export function runGame(config: { playerCount: 3 | 4 | 5; seed?: number; verbose?: boolean }): GameResult {
  const seed = config.seed ?? Date.now();
  const rng = new SeededRandom(seed);
  let state = createInitialState({ playerCount: config.playerCount, seed });
  const violations: InvariantViolation[] = [];
  let actionCount = 0;

  if (config.verbose) {
    console.log(`Starting game with ${config.playerCount} players, seed ${seed}`);
  }

  let lastPhase = state.turn.phase;

  while (state.turn.phase !== TurnPhase.GAME_OVER && actionCount < MAX_ACTIONS) {
    if (config.verbose && state.turn.phase !== lastPhase) {
      console.log(`Phase change: ${lastPhase} -> ${state.turn.phase} (Action ${actionCount}, Campaign ${state.campaign.number})`);
      lastPhase = state.turn.phase;
    }

    const activePlayerId = getActivePlayer(state);
    if (activePlayerId === null) break;

    // Retry loop: engine is the guardrail; bot retries on rejection
    let accepted = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const action = randomBot(state, activePlayerId, rng);
      const stateBefore = state;
      try {
        state = gameReducer(state, action);
        accepted = true;
        break;
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
          if (config.verbose) console.error(`Invariant Violation at ${actionCount}:`, err.message);
          // Fatal — stop the game
          actionCount = MAX_ACTIONS;
          break;
        }
        if (err instanceof Error && state.turn.phase === TurnPhase.BUREAUCRACY) {
          if (config.verbose) console.warn(`Bureaucracy action error at ${actionCount}:`, err.message);
          try {
            state = gameReducer(state, { type: 'END_BUREAUCRACY_TURN', playerId: activePlayerId });
            accepted = true;
          } catch { /* give up */ }
          break;
        }
        // Engine rejected the action — bot will retry with a different move
        if (config.verbose) console.warn(`Engine rejected action (attempt ${attempt + 1}, Phase: ${state.turn.phase}, P${activePlayerId}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (!accepted) break; // bot stuck — treat as stalemate
    actionCount++;
  }

  if (config.verbose && actionCount >= MAX_ACTIONS) {
    console.log(`MAX_ACTIONS reached (${MAX_ACTIONS})`);
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
    case TurnPhase.RESOLVE_SUPPORT: {
      const violations = checkSupportViolations(state.pieces, state.config.playerCount);
      return violations[0]?.playerId ?? null;
    }
    default:
      return null;
  }
}

function isWinner(state: KredGameState, playerId: number): boolean {
  // Rule 61: The blank tile cannot be used to achieve a winning setup.
  if (state.turn.tilePlayedId === 'BLANK') return false;

  const allSeats = Array.from({ length: 6 }, (_, i) => `p${playerId}_seat${i + 1}`);
  if (!allSeats.every(s => state.pieces.some(p => p.locationId === s))) return false;

  const r1 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum1`);
  const r2 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum2`);
  // Must be HEEL or PAWN
  if (!r1 || r1.type === 'MARK' || !r2 || r2.type === 'MARK') return false;

  const office = state.pieces.find(p => p.locationId === `p${playerId}_office`);
  return !!office && office.type === 'PAWN';
}
