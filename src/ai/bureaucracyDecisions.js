import { BUREAUCRACY_PRICES, MOVE_TYPES, PIECE_TYPES, TILES } from '../domain/types.js';
import { checkVictory } from '../domain/board.js';
import { validateSingleMove } from '../domain/moves.js';
import { selectBestBankTilesToPay } from '../domain/bureaucracy.js';
import {
  evaluateDomain,
  generateLegalMovesForBot,
  scoreBoardDeltaForMove
} from './evaluator.js';

const BASIC_MOVE_SET = new Set([MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE]);
const EXTRA_MOVE_SET = new Set([MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE]);

function countOwnPieces(boardState, domainPrefix, pieceType) {
  let count = 0;
  for (const k of Object.keys(boardState || {})) {
    if (k.startsWith(`${domainPrefix}_`) && boardState[k]?.type === pieceType) count++;
  }
  return count;
}

function findCommunitySwapKey(boardState, higherType) {
  return Object.keys(boardState || {}).find(
    (k) => k.startsWith('community_') && boardState[k]?.type === higherType
  );
}

/**
 * Enumerates all verified-legal, affordable bureaucracy payloads for either
 * normal Bureaucracy funding ('funding') or Challenger reward ('bankTiles').
 */
export function enumerateAffordableBureaucracyOptions(obs, paymentMode = 'funding') {
  const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
  const botId = obs.botId;
  const me = obs.players[botId] || {};
  const domainPrefix = `p${parseInt(botId, 10) + 1}`;
  const hasPawn = countOwnPieces(obs.boardState, domainPrefix, PIECE_TYPES.PAWN) > 0;
  const options = [];

  const getPayment = (cost) => {
    if (cost <= 0) return null;
    if (paymentMode === 'bankTiles') {
      const tiles = selectBestBankTilesToPay(obs.facedownBankTiles || [], cost);
      if (!tiles || tiles.length === 0) return null;
      const paidFunding = tiles.reduce((s, t) => s + (TILES[t.tileId]?.funding || 0), 0);
      return { cost, paidFunding };
    }
    return (me.funding || 0) >= cost ? { cost, paidFunding: cost } : null;
  };

  if (paymentMode === 'funding' && (me.credibilityNotchesLost || 0) > 0) {
    const pay = getPayment(prices.RESTORE_CRED);
    if (pay) {
      options.push({
        payload: { actionType: 'RESTORE_CRED', targetLoc: undefined, subAction: undefined },
        afterBoard: obs.boardState,
        meta: { kind: 'RESTORE_CRED', ...pay }
      });
    }
  }

  const promoSpecs = [
    { actionType: 'PROMOTE_SEAT', locs: [1, 2, 3, 4, 5, 6].map((i) => `${domainPrefix}_seat${i}`) },
    { actionType: 'PROMOTE_ROSTRUM', locs: [1, 2].map((i) => `${domainPrefix}_rostrum${i}`) },
    { actionType: 'PROMOTE_OFFICE', locs: [`${domainPrefix}_office`] }
  ];

  for (const spec of promoSpecs) {
    const pay = getPayment(prices[spec.actionType]);
    if (!pay) continue;
    for (const loc of spec.locs) {
      const piece = obs.boardState[loc];
      if (!piece) continue;
      let higherType = null;
      if (piece.type === PIECE_TYPES.MARK && (obs.community?.heels || 0) > 0) {
        higherType = PIECE_TYPES.HEEL;
      } else if (piece.type === PIECE_TYPES.HEEL && (obs.community?.pawns || 0) > 0 && !hasPawn) {
        higherType = PIECE_TYPES.PAWN;
      }
      if (!higherType) continue;

      const commKey = findCommunitySwapKey(obs.boardState, higherType);
      if (!commKey) continue;

      const afterBoard = { ...obs.boardState, [loc]: obs.boardState[commKey], [commKey]: piece };
      options.push({
        payload: { actionType: spec.actionType, targetLoc: loc, subAction: undefined },
        afterBoard,
        meta: { kind: spec.actionType, fromType: piece.type, toType: higherType, loc, ...pay }
      });
    }
  }

  const basicPay = getPayment(prices.BASIC_ACTION);
  const extraPay = getPayment(prices.EXTRA_ACTION);
  if (basicPay || extraPay) {
    const singleCandidates = generateLegalMovesForBot(
      obs.boardState, obs.community, botId, obs.numPlayers, { maxMoves: 1 }
    ).filter((c) => c.moves.length === 1);

    for (const cand of singleCandidates) {
      const m = cand.moves[0];
      const isBasic = BASIC_MOVE_SET.has(m.type);
      const isExtra = EXTRA_MOVE_SET.has(m.type);
      if ((isBasic && !basicPay) || (isExtra && !extraPay)) continue;
      if (!validateSingleMove(m, botId, obs.boardState, obs.community, obs.numPlayers).valid) continue;

      options.push({
        payload: {
          actionType: isBasic ? 'BASIC_ACTION' : 'EXTRA_ACTION',
          targetLoc: undefined,
          subAction: m
        },
        afterBoard: cand.afterBoard,
        meta: {
          kind: isBasic ? 'BASIC_ACTION' : 'EXTRA_ACTION',
          moveType: m.type,
          ...(isBasic ? basicPay : extraPay)
        }
      });
    }
  }

  return options;
}

export function scoreBureaucracyOption(obs, option, persona, rng = Math.random) {
  const botId = obs.botId;
  const aggression = persona?.aggressionWeight ?? 1.0;
  const integrity = persona?.integrityWeight ?? 1.0;
  const notchesLost = obs.players[botId]?.credibilityNotchesLost || 0;
  const domainPrefix = `p${parseInt(botId, 10) + 1}`;
  const heelCount = countOwnPieces(obs.boardState, domainPrefix, PIECE_TYPES.HEEL);
  const { meta, afterBoard } = option;

  if (meta.kind === 'RESTORE_CRED') {
    const base = notchesLost >= 3 ? 40 : notchesLost === 2 ? 22 * integrity : 9 * integrity - 6;
    return base + (rng() - 0.5) * 2;
  }

  const delta = scoreBoardDeltaForMove(obs.boardState, afterBoard, botId, obs.numPlayers, aggression);
  if (checkVictory(afterBoard, botId)) return 1500 + delta.total;

  let score = delta.total * 1.4 - meta.paidFunding * 0.4;

  if (meta.kind.startsWith('PROMOTE_')) {
    if (meta.toType === PIECE_TYPES.PAWN && meta.kind !== 'PROMOTE_OFFICE') {
      return -100;
    }
    if (meta.kind === 'PROMOTE_OFFICE') score += meta.fromType === PIECE_TYPES.HEEL ? 35 : 22;
    if (meta.kind === 'PROMOTE_ROSTRUM' && meta.fromType === PIECE_TYPES.MARK) score += 20;
    if (meta.kind === 'PROMOTE_SEAT' && meta.fromType === PIECE_TYPES.MARK && heelCount < 3) score += 10;
  } else if (meta.kind === 'BASIC_ACTION') {
    if (delta.ownDelta <= 0) return -50;
    score += 10;
  } else if (meta.kind === 'EXTRA_ACTION') {
    const maxOppScore = Object.keys(obs.players)
      .filter((id) => id !== botId)
      .reduce((mx, id) => Math.max(mx, evaluateDomain(obs.boardState, id)), 0);
    if (maxOppScore < 86 && delta.ownDelta <= 0) return -40;
    score += maxOppScore >= 86 ? 6 : -14;
  }

  return score + (rng() - 0.5) * 1.5;
}

/**
 * Decides the next Bureaucracy purchase or ends the bot's Bureaucracy turn.
 */
export function decideBureaucracyAction(obs, persona, rng = Math.random) {
  try {
    const options = enumerateAffordableBureaucracyOptions(obs, 'funding');
    if (options.length === 0) return { move: 'endBureaucracyTurn', args: [] };

    let best = null;
    let bestScore = 0;
    for (const opt of options) {
      const sc = scoreBureaucracyOption(obs, opt, persona, rng);
      if (sc > bestScore) {
        bestScore = sc;
        best = opt;
      }
    }

    if (best) {
      return { move: 'buyBureaucracyAction', args: [best.payload] };
    }
    return { move: 'endBureaucracyTurn', args: [] };
  } catch {
    return { move: 'endBureaucracyTurn', args: [] };
  }
}
