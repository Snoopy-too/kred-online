import { getTileRequirements } from '@kred/shared';
import { findLegalMoves } from './moveValidation';
import type { KredGameState } from './types';

function cloneState(state: KredGameState): KredGameState {
  return JSON.parse(JSON.stringify(state));
}

function getPlayer(state: KredGameState, id: number) {
  return state.players.find(p => p.id === id)!;
}

function clampCredibility(value: number): number {
  return Math.max(0, Math.min(3, value));
}

function removeTileFromHand(state: KredGameState, playerId: number, tileId: string): void {
  const player = getPlayer(state, playerId);
  const idx = player.hand.indexOf(tileId);
  if (idx !== -1) player.hand.splice(idx, 1);
}

export function determineHonesty(state: KredGameState): boolean {
  const tileId = state.turn.tilePlayedId;
  const playerId = state.turn.moverId;
  const piecesBefore = state.piecesBeforeMove || state.pieces;
  const playerCount = state.config.playerCount;

  if (!tileId) return true;
  if (tileId === 'BLANK') return true;

  const req = getTileRequirements(tileId);
  if (!req) return true;

  const executedTypes = state.turn.movesExecuted.map(m => m.moveType);
  const required = [...req.requiredMoves];

  // For each required move, if it's in executed, consumption.
  for (const move of executedTypes) {
    const idx = required.indexOf(move);
    if (idx !== -1) {
      required.splice(idx, 1);
    } else {
      // Extra move that wasn't required? Dishonest.
      return false;
    }
  }

  // Any leftover requirements must be impossible
  for (const remaining of required) {
    const moves = findLegalMoves(remaining, playerId, piecesBefore, playerCount);
    if (moves.length > 0) {
      // Rule 462: "If impossible... forgone... still honest".
      // But here it WAS possible. So dishonest.
      return false;
    }
  }

  return true;
}

export function resolveQuietIsKept(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;

  removeTileFromHand(result, moverId, tileId);
  getPlayer(result, receiverId).bankFaceDown.push(tileId);
  result.piecesBeforeMove = null;

  return result;
}

export function resolveWhistleBlown(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const mover = getPlayer(result, moverId);
  const receiver = getPlayer(result, receiverId);

  mover.credibility = clampCredibility(mover.credibility - 1);
  receiver.credibility = clampCredibility(receiver.credibility + 2);

  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceUp.push(tileId);

  if (result.piecesBeforeMove) {
    result.pieces = result.piecesBeforeMove;
  }
  result.piecesBeforeMove = null;

  return result;
}

export function resolveSmokingGun(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const challengerId = result.turn.challengerId!;
  const mover = getPlayer(result, moverId);
  const receiver = getPlayer(result, receiverId);
  const challenger = getPlayer(result, challengerId);

  mover.credibility = clampCredibility(mover.credibility - 1);
  challenger.credibility = clampCredibility(challenger.credibility + 1);
  receiver.credibility = clampCredibility(receiver.credibility - 1);

  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceUp.push(tileId);

  if (result.piecesBeforeMove) {
    result.pieces = result.piecesBeforeMove;
  }
  result.piecesBeforeMove = null;

  return result;
}

export function resolveWitchHunt(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const challengerId = result.turn.challengerId!;
  const mover = getPlayer(result, moverId);
  const challenger = getPlayer(result, challengerId);
  const receiver = getPlayer(result, receiverId);

  if (mover.credibilityAtTurnStart > 0) {
    mover.credibility = clampCredibility(mover.credibility + 1);
  }

  challenger.credibility = clampCredibility(challenger.credibility - 1);

  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceDown.push(tileId);
  result.piecesBeforeMove = null;

  return result;
}
