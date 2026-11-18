import { INITIAL_PIECE_COUNTS, MOVE_TYPES, TILES } from '../domain/types.js';
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
      const startBonus = tileId === '03' ? firstBonus : 0;
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
  const tilesPerPlayer =
    (INITIAL_PIECE_COUNTS[obs.numPlayers] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
  const oppReceivers = Object.keys(obs.players).filter(
    (id) => id !== obs.botId && (obs.players[id].bankCount || 0) < tilesPerPlayer
  );
  if (oppReceivers.length > 0) return oppReceivers;
  if ((obs.players[obs.botId]?.bankCount || 0) < tilesPerPlayer) return [obs.botId];
  return [];
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

    let bestChoice = null;
    let bestUtility = -Infinity;

    for (const cand of pool) {
      const meta = cand.meta;
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
          let utility;

          if (isHonest) {
            const fundingTerm = isSelf ? funding * 2.2 : -funding * 1.3;
            const targetTerm = isSelf ? 0 : -recScore * 0.15;
            const urgencyTerm = needsEmptySeatSoon ? (emptySeatCount <= 5 ? 24 : 14) : 0;
            utility = cand.score + fundingTerm + targetTerm + urgencyTerm;
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
              cand.score * 0.9 + bribeTerm - bluffPenalty - credRisk - plausibilityPenalty -
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
