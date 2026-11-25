import { PIECE_TYPES } from '../domain/types.js';
import { checkVictory } from '../domain/board.js';
import { generateLegalMovesForBot, getTilesMatchingMoves } from './moveGenerator.js';

export { generateLegalMovesForBot, getTilesMatchingMoves };

/**
 * Evaluates a single player's domain strength (0..100+, with +500 on checkVictory).
 */
export function evaluateDomain(boardState, playerId) {
  if (!boardState) return 0;
  const pId = String(playerId);
  const d = `p${parseInt(pId, 10) + 1}`;
  let score = 0;

  for (let s = 1; s <= 6; s++) {
    const piece = boardState[`${d}_seat${s}`];
    if (piece) {
      score += 5;
      if (piece.type === PIECE_TYPES.HEEL) score += 1;
    }
  }

  for (let r = 1; r <= 2; r++) {
    const piece = boardState[`${d}_rostrum${r}`];
    if (piece) {
      score += 12;
      if (piece.type === PIECE_TYPES.HEEL) score += 8;
    }
  }

  const office = boardState[`${d}_office`];
  if (office) {
    score += office.type === PIECE_TYPES.PAWN ? 30 : 10;
  }

  if (checkVictory(boardState, pId)) {
    score += 500;
  }

  return score;
}

/**
 * Strategic positional helper rewarding Office progression, 6-seat completion,
 * and freeing Marks blocking Seat Heels when community Heels are depleted.
 */
export function evaluateProgressionBonus(boardState, playerId) {
  if (!boardState) return 0;
  const d = `p${parseInt(playerId, 10) + 1}`;
  const office = boardState[`${d}_office`];
  let bonus = 0;
  let occupiedSeats = 0;
  let pawnInSeat = false;
  let pawnInRostrum = false;

  for (let s = 1; s <= 6; s++) {
    const piece = boardState[`${d}_seat${s}`];
    if (piece) {
      occupiedSeats++;
      if (piece.type === PIECE_TYPES.PAWN) pawnInSeat = true;
    }
  }
  for (let r = 1; r <= 2; r++) {
    if (boardState[`${d}_rostrum${r}`]?.type === PIECE_TYPES.PAWN) pawnInRostrum = true;
  }

  if (occupiedSeats >= 5) bonus += (occupiedSeats - 4) * 3;
  if (occupiedSeats === 6) bonus += 6;

  if (office?.type === PIECE_TYPES.PAWN) {
    bonus += 26;
  } else if (office?.type === PIECE_TYPES.MARK) {
    // Avoid putting a Mark in the Office: it blocks the Office and needs two promotions (or Withdraw) to fix.
    bonus -= 22;
  } else if (pawnInRostrum) {
    bonus += office === null ? 16 : -4;
  } else if (pawnInSeat) {
    bonus += office === null ? 8 : -4;
  } else if (office?.type === PIECE_TYPES.HEEL) {
    bonus += 16;
  }

  const hasCommHeel = Object.keys(boardState).some(
    (k) => k.startsWith('community_') && boardState[k]?.type === PIECE_TYPES.HEEL
  );
  if (!hasCommHeel) {
    const f1SeatHeel = [1, 2, 3].some((s) => boardState[`${d}_seat${s}`]?.type === PIECE_TYPES.HEEL);
    const f2SeatHeel = [4, 5, 6].some((s) => boardState[`${d}_seat${s}`]?.type === PIECE_TYPES.HEEL);
    if (f1SeatHeel && boardState[`${d}_rostrum1`]?.type === PIECE_TYPES.MARK) bonus -= 8;
    if (f2SeatHeel && boardState[`${d}_rostrum2`]?.type === PIECE_TYPES.MARK) bonus -= 8;
  }

  return bonus;
}

/**
 * Evaluates boardState from botId's perspective: own domain minus weighted opponent domains.
 */
export function evaluateBoardForBot(boardState, botId, numPlayers = 3, aggressionWeight = 1.0) {
  const bId = String(botId);
  const ownScore = evaluateDomain(boardState, bId);
  const oppCount = Math.max(1, numPlayers - 1);
  let oppTotal = 0;
  let oppWinPenalty = 0;

  for (let p = 0; p < numPlayers; p++) {
    const pStr = String(p);
    if (pStr === bId) continue;
    oppTotal += evaluateDomain(boardState, pStr);
    if (checkVictory(boardState, pStr)) oppWinPenalty += 500;
  }

  return ownScore - (oppTotal * (aggressionWeight / oppCount)) - oppWinPenalty;
}

/**
 * Precomputes baseline domain & progression scores for beforeBoard so scoring
 * hundreds of candidate afterBoards avoids redundant baseline evaluation.
 */
export function createBeforeScoreContext(beforeBoard, botId, numPlayers = 3, aggression = 1.0) {
  const bId = String(botId);
  const ownBefore = evaluateDomain(beforeBoard, bId) + evaluateProgressionBonus(beforeBoard, bId);
  const oppBefore = [];
  for (let p = 0; p < numPlayers; p++) {
    const pStr = String(p);
    if (pStr === bId) continue;
    const prevOpp = evaluateDomain(beforeBoard, pStr);
    const threatWeight = prevOpp >= 86 ? 0.70 * aggression : 0.18 * aggression;
    oppBefore.push({ id: pStr, prevOpp, threatWeight });
  }
  return { bId, ownBefore, oppBefore };
}

/**
 * Goal-directed play-scoring helper: prioritizes own board progression and
 * scales opponent-disruption weight dynamically by opponent win threat.
 */
export function scoreBoardDeltaForMove(beforeOrCtx, afterBoard, botId, numPlayers = 3, aggression = 1.0) {
  const ctx = beforeOrCtx && beforeOrCtx.oppBefore
    ? beforeOrCtx
    : createBeforeScoreContext(beforeOrCtx, botId, numPlayers, aggression);
  const bId = ctx.bId;
  const ownAfter = evaluateDomain(afterBoard, bId) + evaluateProgressionBonus(afterBoard, bId);
  const ownDelta = ownAfter - ctx.ownBefore;

  let oppDamage = 0;
  let oppWinPenalty = 0;
  for (let i = 0; i < ctx.oppBefore.length; i++) {
    const opp = ctx.oppBefore[i];
    const nextOpp = evaluateDomain(afterBoard, opp.id);
    oppDamage += (opp.prevOpp - nextOpp) * opp.threatWeight;
    if (checkVictory(afterBoard, opp.id)) oppWinPenalty += 1000;
  }

  const winBonus = checkVictory(afterBoard, bId) ? 500 : 0;
  return { ownDelta, oppDamage, total: ownDelta * 1.9 + oppDamage + winBonus - oppWinPenalty };
}
