import { INITIAL_PIECE_COUNTS, MOVE_TYPES, TILES } from '../domain/types.js';
import { getValidReceivers as getValidReceiversShared } from '../domain/board.js';
import { checkVictory } from '../domain/board.js';
import { validateMoveCombination } from '../domain/moves.js';
import { STANDARD_TILE_IDS } from './observation.js';
import {
  createBeforeScoreContext,
  evaluateDomain,
  generateLegalMovesForBot,
  getTilesMatchingMoves,
  scoreBoardDeltaForMove
} from './evaluator.js';
import { buildGenericCommunityReexecuteFallback } from './pendingDecisions.js';

const DRAFT_MOVE_WEIGHTS = {
  [MOVE_TYPES.ADVANCE]: 10,
  [MOVE_TYPES.ORGANIZE]: 6,
  [MOVE_TYPES.REMOVE]: 6,
  [MOVE_TYPES.INFLUENCE]: 5,
  [MOVE_TYPES.ASSIST]: 2,
  [MOVE_TYPES.WITHDRAW]: 1
};

/**
 * Picks the highest-utility tile from obs.draftPack.
 */
export function decideDraftPick(obs, persona, rng = Math.random) {
  const pack = obs.draftPack || [];
  try {
    const fundingWeight = persona?.draftFundingWeight ?? 1.0;
    const firstBonus = persona?.firstPlayerBonus ?? 12;
    let bestTile = pack[0];
    let bestScore = -Infinity;

    for (const tileId of pack) {
      const tile = TILES[tileId];
      if (!tile) continue;
      const fundingScore = (tile.funding || 0) * fundingWeight * 3;
      const moveScore = (tile.moves || []).reduce((s, m) => s + (DRAFT_MOVE_WEIGHTS[m] || 0), 0);
      const startBonus = tileId === '^0+' ? firstBonus : 0;
      const total = fundingScore + moveScore + startBonus + (rng() - 0.5) * 2;
      if (total > bestScore) {
        bestScore = total;
        bestTile = tileId;
      }
    }
    return { move: 'selectDraftTile', args: [bestTile] };
  } catch {
    return { move: 'selectDraftTile', args: [pack[0]] };
  }
}

function getValidReceivers(obs) {
  return getValidReceiversShared(obs, obs.botId);
}

/**
 * Returns true when an honest candidate includes Remove without a strong tactical reason
 * (immediate win, empty community Marks, support cascade, or disrupting a threatening opponent).
 */
function isHonestRemoveUnjustified(cand, obs, botId) {
  const removeMoves = cand.moves.filter((m) => m.type === MOVE_TYPES.REMOVE);
  if (removeMoves.length === 0) return false;
  if (checkVictory(cand.afterBoard, botId)) return false;
  if ((obs.community?.marks || 0) === 0) return false;

  for (const rm of removeMoves) {
    const match = /^p(\d+)_/.exec(rm.from || '');
    if (!match) continue;
    const domPrefix = `p${match[1]}`;
    const oppId = String(parseInt(match[1], 10) - 1);

    if (evaluateDomain(obs.boardState, oppId) >= 75) return false;
    if (obs.boardState[`${domPrefix}_office`]) return false;

    let oppSeats = 0;
    for (let s = 1; s <= 6; s++) {
      if (obs.boardState[`${domPrefix}_seat${s}`]) oppSeats++;
    }
    if (oppSeats >= 5) return false;

    const upperKeys = [`${domPrefix}_rostrum1`, `${domPrefix}_rostrum2`, `${domPrefix}_office`];
    const upperBefore = upperKeys.filter((k) => obs.boardState[k]).length;
    const upperAfter = upperKeys.filter((k) => cand.afterBoard[k]).length;
    if (upperAfter < upperBefore) return false;
  }

  return true;
}

/**
 * Chooses (moves, tileId, receiverId) for a Campaign turn.
 */
export function decideCampaignMove(obs, persona, rng = Math.random) {
  const hand = obs.hand || [];
  const validReceivers = getValidReceivers(obs);
  const fallback = {
    move: 'submitTurnMovesAndTile',
    args: [{ tileId: hand[0], receiverId: validReceivers[0], moves: [] }]
  };

  try {
    if (hand.length === 0 || validReceivers.length === 0) return fallback;

    const botId = obs.botId;
    const aggression = persona?.aggressionWeight ?? 1.0;
    const bluffThreshold = persona?.bluffThreshold ?? 0.58;
    const bribeGenerosity = persona?.bribeGenerosity ?? 1.0;
    const myNotches = obs.players[botId]?.credibilityNotchesLost || 0;

    const candidates = generateLegalMovesForBot(obs.boardState, obs.community, botId, obs.numPlayers);
    const beforeCtx = createBeforeScoreContext(obs.boardState, botId, obs.numPlayers, aggression);
    const handByTypesKey = new Map();
    const unseenSet = new Set(obs.unseenTileIds);

    for (const cand of candidates) {
      const delta = scoreBoardDeltaForMove(beforeCtx, cand.afterBoard, botId, obs.numPlayers, aggression);
      cand.score = delta.total;
      cand.ownDelta = delta.ownDelta;

      const needsPerCandCheck = cand.moves.length < 2;
      let honestInHand = !needsPerCandCheck ? handByTypesKey.get(cand.typesKey) : null;
      if (!honestInHand) {
        honestInHand = new Set(
          getTilesMatchingMoves(cand.moves, hand, botId, obs.boardState, obs.community, obs.numPlayers)
        );
        if (!needsPerCandCheck) handByTypesKey.set(cand.typesKey, honestInHand);
      }
      cand.honestInHand = honestInHand;
    }

    const tilesWithHonestPlay = new Set();
    for (const cand of candidates) {
      for (const tid of cand.honestInHand) tilesWithHonestPlay.add(tid);
    }
    if (tilesWithHonestPlay.size === 0) {
      for (const tid of hand) {
        const fbMoves = buildGenericCommunityReexecuteFallback(obs, tid, candidates);
        if (fbMoves.length > 0) {
          return {
            move: 'submitTurnMovesAndTile',
            args: [{ tileId: tid, receiverId: validReceivers[0], moves: fbMoves }]
          };
        }
      }
    }

    const sortedCands = [...candidates].sort((a, b) => b.score - a.score);
    const pool = new Set(sortedCands.slice(0, 10));
    const zeroMove = candidates.find((c) => c.moves.length === 0);
    if (zeroMove) pool.add(zeroMove);

    for (const tileId of hand) {
      const bestHonest = sortedCands.find((c) => c.honestInHand.has(tileId));
      if (bestHonest) pool.add(bestHonest);
    }

    const deckMetaByTypesKey = new Map();
    for (const cand of pool) {
      const needsPerCandCheck = cand.moves.length < 2;
      let deckMeta = !needsPerCandCheck ? deckMetaByTypesKey.get(cand.typesKey) : null;
      if (!deckMeta) {
        const deckHonest = getTilesMatchingMoves(
          cand.moves, STANDARD_TILE_IDS, botId, obs.boardState, obs.community, obs.numPlayers
        );
        deckMeta = {
          unseenMatches: deckHonest.filter((id) => unseenSet.has(id)).length,
          deckMatches: deckHonest.length
        };
        if (!needsPerCandCheck) deckMetaByTypesKey.set(cand.typesKey, deckMeta);
      }
      cand.meta = { honestInHand: cand.honestInHand, ...deckMeta };
    }

    const hasChallengers = (recId) =>
      Object.keys(obs.players).some(
        (id) => id !== botId && id !== recId && (obs.players[id].credibilityRemaining || 0) > 0
      );

    let emptySeatCount = 0;
    for (const k of Object.keys(obs.boardState)) {
      if (k.includes('_seat') && obs.boardState[k] === null) emptySeatCount++;
    }

    const oppReceivers = validReceivers.filter((id) => id !== botId);
    const minOppBank = oppReceivers.length > 0
      ? Math.min(...oppReceivers.map((id) => obs.players[id]?.bankCount || 0))
      : 0;

    let bestChoice = null;
    let bestUtility = -Infinity;

    for (const cand of pool) {
      const meta = cand.meta;
      const unjustifiedRemove = isHonestRemoveUnjustified(cand, obs, botId);
      for (const tileId of hand) {
        const isHonest = meta.honestInHand.has(tileId);
        const funding = TILES[tileId]?.funding || 0;
        const tileMoves = TILES[tileId]?.moves || [];
        const needsEmptySeatSoon =
          emptySeatCount <= 9 &&
          tileMoves.length === 2 &&
          (tileMoves.includes(MOVE_TYPES.ASSIST) ||
            tileMoves.includes(MOVE_TYPES.ORGANIZE) ||
            tileMoves.includes(MOVE_TYPES.INFLUENCE));

        for (const receiverId of validReceivers) {
          const isSelf = receiverId === botId;
          const recCred = obs.players[receiverId]?.credibilityRemaining || 0;
          const recScore = evaluateDomain(obs.boardState, receiverId);
          const bankDiff = isSelf ? 0 : (obs.players[receiverId]?.bankCount || 0) - minOppBank;
          const bankTerm = -bankDiff * 5.5;
          let utility;

          if (isHonest) {
            const fundingTerm = isSelf ? funding * 2.2 : -funding * 1.3;
            const targetTerm = isSelf ? 0 : -recScore * 0.15;
            const urgencyTerm = needsEmptySeatSoon ? (emptySeatCount <= 5 ? 24 : 14) : 0;
            const removePenalty = unjustifiedRemove ? (cand.moves.length === 1 ? 18 : 14) : 0;
            utility = cand.score + fundingTerm + targetTerm + bankTerm + urgencyTerm - removePenalty;
          } else {
            const bluffPenalty = bluffThreshold * 58;
            const credRisk = myNotches >= 3 ? 38 : myNotches === 2 ? 42 : myNotches === 1 ? 18 : 10;
            let plausibilityPenalty = 0;
            if (!tilesWithHonestPlay.has(tileId)) {
              plausibilityPenalty = recCred > 0 ? 700 : 400;
            } else if (meta.deckMatches === 0) {
              plausibilityPenalty = 110;
            } else if (meta.unseenMatches === 0 && (recCred > 0 || hasChallengers(receiverId))) {
              plausibilityPenalty = 95;
            }
            const weakBribePenalty = !isSelf && recCred > 0 && funding < 5 ? 26 : 0;
            const bribeTerm = isSelf
              ? funding * 2.0
              : recCred > 0
                ? funding * 2.0 * bribeGenerosity - weakBribePenalty
                : -funding * 1.5;
            utility =
              cand.score * 0.9 + bribeTerm + bankTerm - bluffPenalty - credRisk - plausibilityPenalty -
              (isSelf ? 0 : recScore * 0.12);
          }

          utility += (rng() - 0.5) * 3;
          if (utility > bestUtility) {
            bestUtility = utility;
            bestChoice = { tileId, receiverId, moves: cand.moves };
          }
        }
      }
    }

    if (
      bestChoice &&
      validateMoveCombination(bestChoice.moves, botId, obs.boardState, obs.community, obs.numPlayers).valid
    ) {
      return { move: 'submitTurnMovesAndTile', args: [bestChoice] };
    }
    return fallback;
  } catch {
    return fallback;
  }
}
