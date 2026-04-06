// src/engine/outcomeResolution.ts
import { getTileRequirements } from '@kred/shared';
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
  if (!tileId) return true;
  if (tileId === 'BLANK') return true;

  const req = getTileRequirements(tileId);
  if (!req) return true;

  const executedTypes = state.turn.movesExecuted.map(m => m.moveType);
  const required = req.requiredMoves;

  if (required.length !== executedTypes.length) return false;

  const executedCopy = [...executedTypes];
  for (const reqMove of required) {
    const idx = executedCopy.indexOf(reqMove);
    if (idx === -1) return false;
    executedCopy.splice(idx, 1);
  }
  return executedCopy.length === 0;
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
