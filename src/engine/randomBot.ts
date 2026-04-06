// src/engine/randomBot.ts
import { getTileRequirements, DefinedMoveType } from '@kred/shared';
import { findLegalMoves } from './moveValidation';
import { determineHonesty } from './outcomeResolution';
import { SeededRandom } from './seededRandom';
import {
  TurnPhase,
  type KredGameState,
  type KredAction,
  type KredPiece,
  type EngineMove,
} from './types';

/**
 * Given the current game state and which player the bot is acting as,
 * returns a valid KredAction for the current phase.
 */
export function randomBot(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
      return botMakeMoves(state, playerId, rng);
    case TurnPhase.SELECTING_TILE:
      return botSelectTile(state, playerId, rng);
    case TurnPhase.AWAITING_RECEIPT:
      return botReceiverDecision(state, playerId, rng);
    case TurnPhase.AWAITING_CHALLENGES:
      return botBystanderDecision(state, playerId, rng);
    case TurnPhase.BUREAUCRACY:
      return botBureaucracy(state, playerId);
    default:
      throw new Error(`randomBot: unexpected phase ${state.turn.phase}`);
  }
}

// ============================================================================
// PHASE HANDLERS
// ============================================================================

function botMakeMoves(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;
  const { playerCount } = state.config;

  // Decide honest (70%) or bluff (30%)
  const isHonest = rng.next() < 0.7;

  // Pick a tile from hand to base moves on
  const tileId = rng.pick(player.hand);
  const req = getTileRequirements(tileId);
  const requiredMoves = req?.requiredMoves ?? [];

  if (isHonest && requiredMoves.length > 0) {
    // Try to find honest moves for the tile's requirements
    const moves = buildHonestMoves(playerId, requiredMoves, state.pieces, playerCount, rng);
    if (moves !== null) {
      return { type: 'MAKE_MOVES', playerId, moves };
    }
  }

  // Bluff or fallback: pick any 1 legal move we can find
  const fallbackMoves = buildAnyLegalMoves(playerId, state.pieces, playerCount, rng, 1);
  return { type: 'MAKE_MOVES', playerId, moves: fallbackMoves };
}

/**
 * Tries to build a sequence of legal moves that satisfy the tile's required move types.
 * Returns null if it cannot find moves for all required types.
 */
function buildHonestMoves(
  playerId: number,
  requiredMoveTypes: DefinedMoveType[],
  pieces: KredPiece[],
  playerCount: number,
  rng: SeededRandom
): EngineMove[] | null {
  const moves: EngineMove[] = [];
  // Work with a mutable clone of pieces so we can simulate moves sequentially
  let simulatedPieces = pieces.map(p => ({ ...p }));

  for (const moveType of requiredMoveTypes) {
    const legal = findLegalMoves(moveType, playerId, simulatedPieces, playerCount);
    if (legal.length === 0) return null;

    // Filter to pieces not already used in this turn (separate-pieces rule)
    const usedPieceIds = new Set(moves.map(m => m.pieceId));
    const available = legal.filter(m => !usedPieceIds.has(m.pieceId));
    const chosen = available.length > 0 ? rng.pick(available) : rng.pick(legal);

    moves.push(chosen);
    // Apply the move to the simulated pieces so subsequent moves see the updated board
    simulatedPieces = simulatedPieces.map(p =>
      p.id === chosen.pieceId ? { ...p, locationId: chosen.toLocationId } : p
    );
  }

  return moves;
}

/**
 * Builds up to `count` legal moves of any type, without repeating piece IDs.
 */
function buildAnyLegalMoves(
  playerId: number,
  pieces: KredPiece[],
  playerCount: number,
  rng: SeededRandom,
  count: number
): EngineMove[] {
  const allTypes = [
    DefinedMoveType.ADVANCE,
    DefinedMoveType.WITHDRAW,
    DefinedMoveType.ORGANIZE,
    DefinedMoveType.REMOVE,
    DefinedMoveType.INFLUENCE,
    DefinedMoveType.ASSIST,
  ];

  const moves: EngineMove[] = [];
  let simulatedPieces = pieces.map(p => ({ ...p }));

  for (let i = 0; i < count; i++) {
    const usedPieceIds = new Set(moves.map(m => m.pieceId));

    // Gather all legal moves across all types
    let allLegal: EngineMove[] = [];
    for (const mt of allTypes) {
      const legal = findLegalMoves(mt, playerId, simulatedPieces, playerCount);
      allLegal = allLegal.concat(legal.filter(m => !usedPieceIds.has(m.pieceId)));
    }

    if (allLegal.length === 0) break;
    const chosen = rng.pick(allLegal);
    moves.push(chosen);
    simulatedPieces = simulatedPieces.map(p =>
      p.id === chosen.pieceId ? { ...p, locationId: chosen.toLocationId } : p
    );
  }

  return moves;
}

function botSelectTile(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;
  const tileId = rng.pick(player.hand);

  // Pick a random opponent who has tiles in hand
  const opponents = state.players.filter(
    p => p.id !== playerId && p.hand.length > 0
  );
  // Fallback to any opponent if all hands are empty (shouldn't happen, but be safe)
  const pool = opponents.length > 0
    ? opponents
    : state.players.filter(p => p.id !== playerId);
  const receiver = rng.pick(pool);

  return {
    type: 'SELECT_TILE',
    playerId,
    tileId,
    receiverPlayerId: receiver.id,
  };
}

function botReceiverDecision(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Zero cred: must ACCEPT_BLIND
  if (player.credibility === 0) {
    return { type: 'RECEIVER_DECISION', playerId, decision: 'ACCEPT_BLIND' };
  }

  const isHonest = determineHonesty(state);

  let decision: 'ACCEPT' | 'ACCEPT_BLIND' | 'REJECT';
  if (isHonest) {
    // Honest tile: ACCEPT 80%, ACCEPT_BLIND 20%
    decision = rng.weightedChoice([
      { value: 'ACCEPT' as const, weight: 80 },
      { value: 'ACCEPT_BLIND' as const, weight: 20 },
    ]);
  } else {
    // Dishonest tile: ACCEPT 60%, REJECT 20%, ACCEPT_BLIND 20%
    decision = rng.weightedChoice([
      { value: 'ACCEPT' as const, weight: 60 },
      { value: 'REJECT' as const, weight: 20 },
      { value: 'ACCEPT_BLIND' as const, weight: 20 },
    ]);
  }

  return { type: 'RECEIVER_DECISION', playerId, decision };
}

function botBystanderDecision(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Zero cred: must PASS
  if (player.credibility === 0) {
    return { type: 'BYSTANDER_DECISION', playerId, decision: 'PASS' };
  }

  // PASS 80%, CHALLENGE 20%
  const decision = rng.weightedChoice([
    { value: 'PASS' as const, weight: 80 },
    { value: 'CHALLENGE' as const, weight: 20 },
  ]);

  return { type: 'BYSTANDER_DECISION', playerId, decision };
}

function botBureaucracy(
  state: KredGameState,
  playerId: number
): KredAction {
  // Simplified: always end turn immediately
  return { type: 'END_BUREAUCRACY_TURN', playerId };
}
