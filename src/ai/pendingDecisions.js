import { BUREAUCRACY_PRICES, MOVE_TYPES, TILES } from '../domain/types.js';
import { checkVictory, enforceSupportRule } from '../domain/board.js';
import {
  classifyPlay,
  isMoveTypePossible,
  validateMoveCombination,
  validateSingleMove
} from '../domain/moves.js';
import {
  evaluateDomain,
  generateLegalMovesForBot,
  getTilesMatchingMoves,
  scoreBoardDeltaForMove
} from './evaluator.js';
import {
  enumerateAffordableBureaucracyOptions,
  scoreBureaucracyOption
} from './bureaucracyDecisions.js';

function getOwnBankedFunding(obs) {
  if (Array.isArray(obs.facedownBankTiles) && obs.facedownBankTiles.length > 0) {
    return obs.facedownBankTiles.reduce((sum, t) => sum + (TILES[t.tileId]?.funding || 0), 0);
  }
  return obs.players?.[obs.botId]?.funding || 0;
}

/**
 * Decides whether the receiving bot accepts or rejects a pending tile.
 * Never rejects an Honest play or when credibility is depleted.
 */
export function decideReceipt(obs, persona, rng = Math.random) {
  try {
    const pp = obs.pendingPlay;
    const myCred = obs.players[obs.botId]?.credibilityRemaining || 0;
    if (!pp?.tileIdPlayed || myCred <= 0) {
      return { move: 'acceptTile', args: [] };
    }

    const boardBefore = pp.backupBoard || obs.boardState;
    const commBefore = pp.backupCommunity || obs.community;
    const playClass = classifyPlay(
      pp.movesMade, pp.tileIdPlayed, pp.moverId, boardBefore, commBefore, obs.numPlayers
    );
    if (playClass === 'Honest') {
      return { move: 'acceptTile', args: [] };
    }

    if (checkVictory(obs.boardState, pp.moverId)) {
      return { move: 'rejectTile', args: [] };
    }

    const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
    const funding = TILES[pp.tileIdPlayed]?.funding || 0;
    const ownFunding = getOwnBankedFunding(obs);
    const fundingNeed = Math.max(0, 1 - ownFunding / prices.PROMOTE_OFFICE);
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    const moverGain = evaluateDomain(obs.boardState, pp.moverId) - evaluateDomain(boardBefore, pp.moverId);
    const unseenMatches = getTilesMatchingMoves(
      pp.movesMade, obs.unseenTileIds, pp.moverId, boardBefore, commBefore, obs.numPlayers
    ).length;

    const greed = persona?.greedWeight ?? 1.0;
    const integrity = persona?.integrityWeight ?? 1.0;
    const obviousLieRisk = unseenMatches === 0 ? 25 : moverGain >= 15 ? 12 : 4;
    const lowFundingBonus = funding > 0 ? fundingNeed * (10 + funding * 1.5) * greed : 0;
    const keepBribeScore =
      funding * 3.5 * greed +
      lowFundingBonus -
      obviousLieRisk * (persona?.paranoiaWeight ?? 1.0);

    // At 0 notches lost (Free Advance reward) or 2 notches lost (very low credibility: +2 restore & 0-cred danger),
    // receivers are significantly more likely to blow the whistle than at 1 notch lost.
    const credWhistleTerm =
      notchesLost >= 2
        ? 48 * integrity + 10
        : notchesLost === 0
          ? 26 * integrity
          : 10 * integrity;
    const whistleBlowScore = credWhistleTerm + Math.max(0, moverGain) * 1.2;

    return whistleBlowScore >= keepBribeScore + (rng() - 0.5) * 4
      ? { move: 'rejectTile', args: [] }
      : { move: 'acceptTile', args: [] };
  } catch {
    return { move: 'acceptTile', args: [] };
  }
}

/**
 * Decides whether an eligible third-party challenger challenges or passes.
 * Guarantees a challenge whenever 0 unseen tiles can produce movesMade honestly.
 */
export function decideChallenge(obs, persona, rng = Math.random) {
  try {
    const pp = obs.pendingPlay;
    if (!pp) return { move: 'passChallenge', args: [] };

    const boardBefore = pp.backupBoard || obs.boardState;
    const commBefore = pp.backupCommunity || obs.community;
    const matchingUnseen = getTilesMatchingMoves(
      pp.movesMade || [], obs.unseenTileIds, pp.moverId, boardBefore, commBefore, obs.numPlayers
    );
    const remainingCopies = matchingUnseen.length;

    if (remainingCopies === 0) {
      return { move: 'challengeTile', args: [] };
    }

    const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
    const ownFunding = getOwnBankedFunding(obs);
    const moverGain = evaluateDomain(obs.boardState, pp.moverId) - evaluateDomain(boardBefore, pp.moverId);
    const moverAfter = evaluateDomain(obs.boardState, pp.moverId);
    const moverWinning = checkVictory(obs.boardState, pp.moverId);
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;

    const rarityPts = Math.min(52, (1 / remainingCopies) * 55);
    const gainPts = Math.max(0, moverGain) * 1.0;
    const winPts = moverWinning ? 90 : moverAfter >= 75 ? 20 : 0;
    const credPts = notchesLost === 0 ? 8 : notchesLost === 1 ? -8 : -42;
    const fundingPts = Math.min(14, (ownFunding / prices.PROMOTE_OFFICE) * 14);
    const bribeSuspicion = (obs.players[pp.receiverId]?.credibilityRemaining || 0) === 0 ? 10 : 0;
    const suspicion =
      rarityPts + gainPts + winPts + credPts + fundingPts + bribeSuspicion + (rng() - 0.5) * 14;

    const rawThresh = persona?.challengeThreshold ?? 52;
    const threshold = rawThresh <= 1 ? rawThresh * 100 : rawThresh;

    return suspicion >= threshold
      ? { move: 'challengeTile', args: [] }
      : { move: 'passChallenge', args: [] };
  } catch {
    return { move: 'passChallenge', args: [] };
  }
}

export function buildGenericCommunityReexecuteFallback(obs, tileId, existingCandidates) {
  const mStr = obs.botId;
  const reqMoves = TILES[tileId]?.moves || [];
  const commMoves = [];
  const myDom = `p${parseInt(mStr, 10) + 1}`;

  if (reqMoves.includes(MOVE_TYPES.ADVANCE)) {
    for (let s = 1; s <= 6; s++) {
      const m = { type: MOVE_TYPES.ADVANCE, from: 'community', to: `${myDom}_seat${s}` };
      if (validateSingleMove(m, mStr, obs.boardState, obs.community, obs.numPlayers).valid) {
        commMoves.push(m);
      }
    }
  }
  if (reqMoves.includes(MOVE_TYPES.ASSIST)) {
    for (let p = 0; p < obs.numPlayers; p++) {
      if (String(p) === mStr) continue;
      for (let s = 1; s <= 6; s++) {
        const m = { type: MOVE_TYPES.ASSIST, from: 'community', to: `p${p + 1}_seat${s}` };
        if (validateSingleMove(m, mStr, obs.boardState, obs.community, obs.numPlayers).valid) {
          commMoves.push(m);
        }
      }
    }
  }

  const singleMoves = existingCandidates.filter((c) => c.moves.length === 1).map((c) => c.moves[0]);
  const pool = [...commMoves, ...singleMoves];

  for (const cm of commMoves) {
    if (classifyPlay([cm], tileId, mStr, obs.boardState, obs.community, obs.numPlayers) === 'Honest') {
      return [cm];
    }
    for (const mOther of pool) {
      for (const seq of [[cm, mOther], [mOther, cm]]) {
        if (
          validateMoveCombination(seq, mStr, obs.boardState, obs.community, obs.numPlayers).valid &&
          classifyPlay(seq, tileId, mStr, obs.boardState, obs.community, obs.numPlayers) === 'Honest'
        ) {
          return seq;
        }
      }
    }
  }
  return [];
}

/**
 * Picks the highest-scoring legal Honest move combination for reexecuteTileId.
 */
export function decideReexecute(obs, persona) {
  try {
    const tileId = obs.pendingPlay?.reexecuteTileId || obs.pendingPlay?.tileIdPlayed;
    const reqMoves = TILES[tileId]?.moves || [];
    const filterHonest = (cands) =>
      cands.filter(
        (c) =>
          validateMoveCombination(c.moves, obs.botId, obs.boardState, obs.community, obs.numPlayers).valid &&
          classifyPlay(c.moves, tileId, obs.botId, obs.boardState, obs.community, obs.numPlayers) === 'Honest'
      );

    let candidates = generateLegalMovesForBot(obs.boardState, obs.community, obs.botId, obs.numPlayers, {
      maxMoves: Math.max(1, reqMoves.length),
      allowedTypes: reqMoves.length > 0 ? reqMoves : null
    });
    let honest = filterHonest(candidates);
    if (honest.length === 0 && reqMoves.length >= 2) {
      candidates = generateLegalMovesForBot(obs.boardState, obs.community, obs.botId, obs.numPlayers, {
        maxMoves: reqMoves.length,
        allowedTypes: reqMoves,
        exhaustive: true
      });
      honest = filterHonest(candidates);
    }
    if (honest.length === 0) {
      return {
        move: 'reexecuteHonestly',
        args: [buildGenericCommunityReexecuteFallback(obs, tileId, candidates)]
      };
    }

    const aggression = persona?.aggressionWeight ?? 1.0;
    let best = honest[0];
    let bestScore = -Infinity;
    for (const c of honest) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c;
      }
    }
    return { move: 'reexecuteHonestly', args: [best.moves] };
  } catch {
    return { move: 'reexecuteHonestly', args: [[]] };
  }
}

/**
 * Picks the least damaging legal Withdraw move, or null only if none exists.
 */
export function decidePenaltyWithdraw(obs, persona) {
  try {
    const withdraws = generateLegalMovesForBot(
      obs.boardState, obs.community, obs.botId, obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.WITHDRAW] }
    ).filter(
      (c) =>
        c.moves.length === 1 &&
        c.moves[0].type === MOVE_TYPES.WITHDRAW &&
        validateSingleMove(c.moves[0], obs.botId, obs.boardState, obs.community, obs.numPlayers).valid
    );
    if (withdraws.length === 0) return { move: 'executePenaltyWithdraw', args: [null] };

    const aggression = persona?.aggressionWeight ?? 1.0;
    let best = withdraws[0];
    let bestScore = -Infinity;
    for (const c of withdraws) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c;
      }
    }
    return { move: 'executePenaltyWithdraw', args: [best.moves[0]] };
  } catch {
    return { move: 'executePenaltyWithdraw', args: [null] };
  }
}

/**
 * Chooses receiver whistle-blower reward: restore up to 2 credibility or Free Advance.
 */
export function decideReceiverReward(obs, persona) {
  try {
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    if (notchesLost === 0) return { move: 'chooseReceiverAdvanceReward', args: [] };

    const advances = generateLegalMovesForBot(
      obs.boardState, obs.community, obs.botId, obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.ADVANCE] }
    ).filter((c) => c.moves.length === 1 && c.moves[0].type === MOVE_TYPES.ADVANCE);

    if (advances.some((a) => checkVictory(a.afterBoard, obs.botId))) {
      return { move: 'chooseReceiverAdvanceReward', args: [] };
    }
    if (advances.length === 0 || notchesLost >= 2 || (persona?.integrityWeight ?? 1.0) >= 1.3) {
      return { move: 'claimReceiverCredibilityReward', args: [] };
    }
    return { move: 'chooseReceiverAdvanceReward', args: [] };
  } catch {
    return { move: 'claimReceiverCredibilityReward', args: [] };
  }
}

/**
 * Executes the best legal Advance move, or null if no legal Advance exists.
 */
export function decideFreeAdvance(obs, persona) {
  try {
    const advances = generateLegalMovesForBot(
      obs.boardState, obs.community, obs.botId, obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.ADVANCE] }
    ).filter(
      (c) =>
        c.moves.length === 1 &&
        c.moves[0].type === MOVE_TYPES.ADVANCE &&
        validateSingleMove(c.moves[0], obs.botId, obs.boardState, obs.community, obs.numPlayers).valid
    );
    if (advances.length === 0) {
      if (isMoveTypePossible(MOVE_TYPES.ADVANCE, obs.botId, obs.boardState, obs.community, obs.numPlayers)) {
        const myDom = `p${parseInt(obs.botId, 10) + 1}`;
        for (let s = 1; s <= 6; s++) {
          const fallbackAdv = { type: MOVE_TYPES.ADVANCE, from: 'community', to: `${myDom}_seat${s}` };
          if (validateSingleMove(fallbackAdv, obs.botId, obs.boardState, obs.community, obs.numPlayers).valid) {
            return { move: 'executeFreeAdvance', args: [fallbackAdv] };
          }
        }
      }
      return { move: 'executeFreeAdvance', args: [null] };
    }

    const aggression = persona?.aggressionWeight ?? 1.0;
    let best = advances[0];
    let bestScore = -Infinity;
    for (const c of advances) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c;
      }
    }
    return { move: 'executeFreeAdvance', args: [best.moves[0]] };
  } catch {
    return { move: 'executeFreeAdvance', args: [null] };
  }
}

/**
 * Decides whether a successful challenger claims 1 free credibility or spends
 * face-down bank tiles to execute one Bureaucracy action immediately.
 */
export function decideChallengerReward(obs, persona, rng = Math.random) {
  try {
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    const integrity = persona?.integrityWeight ?? 1.0;
    const credScore = notchesLost > 0 ? notchesLost * 16 * integrity : -5;

    const options = enumerateAffordableBureaucracyOptions(obs, 'bankTiles');
    let bestOpt = null;
    let bestScore = Math.max(8, credScore);

    for (const opt of options) {
      const sc = scoreBureaucracyOption(obs, opt, persona, rng) - opt.meta.paidFunding * 0.35;
      if (sc > bestScore) {
        bestScore = sc;
        bestOpt = opt;
      }
    }

    if (bestOpt) {
      return { move: 'buyChallengerBureaucracyAction', args: [bestOpt.payload] };
    }
    return { move: 'claimChallengerCredibility', args: [] };
  } catch {
    return { move: 'claimChallengerCredibility', args: [] };
  }
}

/**
 * Picks the best legal destination when the bot owns an unsupported Office/Rostrum piece.
 * Simulates cascading support so choosing a supported Rostrum beats an unsupported one.
 */
export function decideSupportDrop(obs) {
  const ps = obs.pendingSupport;
  const targets = ps?.validDestinations || [];
  if (!ps || targets.length === 0) return null;

  let bestLoc = targets[0];
  let bestScore = -Infinity;

  for (const toLoc of targets) {
    const simBoard = JSON.parse(JSON.stringify(obs.boardState || {}));
    simBoard[toLoc] = simBoard[ps.from];
    simBoard[ps.from] = null;
    const afterCascade = enforceSupportRule(simBoard, obs.numPlayers || 3);
    const sc = evaluateDomain(afterCascade, obs.botId);
    if (sc > bestScore) {
      bestScore = sc;
      bestLoc = toLoc;
    }
  }

  return { move: 'resolveSupportDrop', args: [bestLoc] };
}
