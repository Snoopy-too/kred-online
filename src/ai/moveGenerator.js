import { MOVE_TYPES, PIECE_TYPES, TILES } from '../domain/types.js';
import { areRostrumsAdjacent, areSeatsAdjacent, enforceSupportRule } from '../domain/board.js';
import {
  applyMoveToState,
  classifyPlay,
  isCommunityPieceAvailable,
  validateSingleMove
} from '../domain/moves.js';
import { STANDARD_TILE_IDS } from './observation.js';

const SELF_MOVES = [MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE];
const OPP_MOVES = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];
const SELF_MOVE_SET = new Set(SELF_MOVES);

const topologyCache = new Map();

function getTopology(numPlayers) {
  if (topologyCache.has(numPlayers)) return topologyCache.get(numPlayers);

  const seats = [];
  const rostrums = [];
  const domains = [];
  for (let p = 0; p < numPlayers; p++) {
    const d = `p${p + 1}`;
    const pSeats = [];
    for (let s = 1; s <= 6; s++) {
      const k = `${d}_seat${s}`;
      seats.push(k);
      pSeats.push(k);
    }
    const pRostrums = [`${d}_rostrum1`, `${d}_rostrum2`];
    rostrums.push(...pRostrums);
    domains.push({ id: String(p), prefix: d, seats: pSeats, rostrums: pRostrums, office: `${d}_office` });
  }

  const adjSeats = {};
  for (const s1 of seats) {
    adjSeats[s1] = seats.filter((s2) => s1 !== s2 && areSeatsAdjacent(s1, s2, numPlayers));
  }
  const adjRostrums = {};
  for (const r1 of rostrums) {
    adjRostrums[r1] = rostrums.filter((r2) => r1 !== r2 && areRostrumsAdjacent(r1, r2, numPlayers));
  }

  const topo = { domains, adjSeats, adjRostrums };
  topologyCache.set(numPlayers, topo);
  return topo;
}

function cloneBoard(boardState) {
  const copy = {};
  const keys = Object.keys(boardState || {});
  for (let i = 0; i < keys.length; i++) {
    copy[keys[i]] = boardState[keys[i]];
  }
  return copy;
}

function needsSupportCascade(boardState, numPlayers) {
  for (let p = 0; p < numPlayers; p++) {
    const d = `p${p + 1}`;
    if (boardState[`${d}_office`] && !boardState[`${d}_rostrum1`] && !boardState[`${d}_rostrum2`]) {
      return true;
    }
    if (
      boardState[`${d}_rostrum1`] &&
      !boardState[`${d}_seat1`] && !boardState[`${d}_seat2`] && !boardState[`${d}_seat3`]
    ) {
      return true;
    }
    if (
      boardState[`${d}_rostrum2`] &&
      !boardState[`${d}_seat4`] && !boardState[`${d}_seat5`] && !boardState[`${d}_seat6`]
    ) {
      return true;
    }
  }
  return false;
}

function maybeEnforceSupport(boardState, numPlayers) {
  return needsSupportCascade(boardState, numPlayers)
    ? enforceSupportRule(boardState, numPlayers)
    : boardState;
}

function boardSignature(boardState, domains, commKeys) {
  let sig = '';
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    for (let s = 0; s < 6; s++) sig += boardState[d.seats[s]]?.type?.[0] || '_';
    sig += boardState[d.rostrums[0]]?.type?.[0] || '_';
    sig += boardState[d.rostrums[1]]?.type?.[0] || '_';
    sig += boardState[d.office]?.type?.[0] || '_';
  }
  let m = 0;
  let h = 0;
  let p = 0;
  for (let i = 0; i < commKeys.length; i++) {
    const piece = boardState[commKeys[i]];
    if (piece) {
      const t = piece.type;
      if (t === PIECE_TYPES.MARK) m++;
      else if (t === PIECE_TYPES.HEEL) h++;
      else if (t === PIECE_TYPES.PAWN) p++;
    }
  }
  return `${sig}|${m},${h},${p}`;
}

function findCanonicalCommunitySource(boardState, community, stagedMoves = [], excludedPieceId = null) {
  const allCommKeys = Object.keys(boardState).filter((k) => k.startsWith('community_'));
  const commKeys = allCommKeys
    .filter((k) => boardState[k] !== null)
    .sort((a, b) => parseInt(a.slice(10), 10) - parseInt(b.slice(10), 10));

  for (const targetType of [PIECE_TYPES.MARK, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN]) {
    if (!isCommunityPieceAvailable(targetType, boardState, community, stagedMoves)) continue;
    const match = commKeys.find(
      (k) => boardState[k]?.type === targetType && (!excludedPieceId || boardState[k].id !== excludedPieceId)
    );
    if (match) return match;
  }
  if (allCommKeys.length === 0 && ((community?.marks || 0) > 0 || (community?.heels || 0) > 0 || (community?.pawns || 0) > 0)) {
    return 'community';
  }
  return null;
}

function generateCandidateSingleMoves(
  boardState,
  community,
  moverId,
  numPlayers,
  allowedTypes,
  stagedMoves = [],
  excludedPieceId = null
) {
  const mStr = String(moverId);
  const mIdx = parseInt(mStr, 10);
  const { domains, adjSeats, adjRostrums } = getTopology(numPlayers);
  const myDom = domains[mIdx];
  if (!myDom) return [];

  const allowSet = new Set(allowedTypes);
  const needComm = allowSet.has(MOVE_TYPES.ADVANCE) || allowSet.has(MOVE_TYPES.ASSIST);
  const commSource = needComm
    ? findCanonicalCommunitySource(boardState, community, stagedMoves, excludedPieceId)
    : null;

  const candidates = [];
  const tryPush = (type, from, to) => {
    const move = { type, from, to };
    if (validateSingleMove(move, mStr, boardState, community, numPlayers, stagedMoves).valid) {
      candidates.push(move);
    }
  };

  if (allowSet.has(MOVE_TYPES.ADVANCE)) {
    if (commSource) {
      for (const s of myDom.seats) if (!boardState[s]) tryPush(MOVE_TYPES.ADVANCE, commSource, s);
    }
    const f1Full = boardState[myDom.seats[0]] && boardState[myDom.seats[1]] && boardState[myDom.seats[2]];
    const f2Full = boardState[myDom.seats[3]] && boardState[myDom.seats[4]] && boardState[myDom.seats[5]];
    if (f1Full && !boardState[myDom.rostrums[0]]) {
      for (let i = 0; i < 3; i++) tryPush(MOVE_TYPES.ADVANCE, myDom.seats[i], myDom.rostrums[0]);
    }
    if (f2Full && !boardState[myDom.rostrums[1]]) {
      for (let i = 3; i < 6; i++) tryPush(MOVE_TYPES.ADVANCE, myDom.seats[i], myDom.rostrums[1]);
    }
    if (!boardState[myDom.office] && boardState[myDom.rostrums[0]] && boardState[myDom.rostrums[1]]) {
      for (const r of myDom.rostrums) tryPush(MOVE_TYPES.ADVANCE, r, myDom.office);
    }
  }

  if (allowSet.has(MOVE_TYPES.WITHDRAW)) {
    if (boardState[myDom.office]) {
      for (const r of myDom.rostrums) if (!boardState[r]) tryPush(MOVE_TYPES.WITHDRAW, myDom.office, r);
    }
    for (const r of myDom.rostrums) {
      if (boardState[r]) {
        for (const s of myDom.seats) if (!boardState[s]) tryPush(MOVE_TYPES.WITHDRAW, r, s);
      }
    }
    for (const s of myDom.seats) if (boardState[s]) tryPush(MOVE_TYPES.WITHDRAW, s, 'community');
  }

  if (allowSet.has(MOVE_TYPES.ORGANIZE)) {
    for (const s of myDom.seats) {
      if (boardState[s]) {
        for (const toSeat of adjSeats[s]) if (!boardState[toSeat]) tryPush(MOVE_TYPES.ORGANIZE, s, toSeat);
      }
    }
    for (const r of myDom.rostrums) {
      if (boardState[r]) {
        for (const toR of adjRostrums[r]) if (!boardState[toR]) tryPush(MOVE_TYPES.ORGANIZE, r, toR);
      }
    }
  }

  if (allowSet.has(MOVE_TYPES.REMOVE)) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s of dom.seats) {
        if (boardState[s]?.type === PIECE_TYPES.MARK) tryPush(MOVE_TYPES.REMOVE, s, 'community');
      }
    }
  }

  if (allowSet.has(MOVE_TYPES.INFLUENCE)) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s of dom.seats) {
        if (boardState[s] && boardState[s].type !== PIECE_TYPES.PAWN) {
          for (const toSeat of adjSeats[s]) if (!boardState[toSeat]) tryPush(MOVE_TYPES.INFLUENCE, s, toSeat);
        }
      }
      for (const r of dom.rostrums) {
        if (boardState[r] && boardState[r].type !== PIECE_TYPES.PAWN) {
          for (const toR of adjRostrums[r]) if (!boardState[toR]) tryPush(MOVE_TYPES.INFLUENCE, r, toR);
        }
      }
    }
  }

  if (allowSet.has(MOVE_TYPES.ASSIST) && commSource) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s of dom.seats) if (!boardState[s]) tryPush(MOVE_TYPES.ASSIST, commSource, s);
    }
  }

  return candidates;
}

function isBorderLocation(loc, domains, myIdx) {
  const myDom = domains[myIdx];
  const opp1 = domains[(myIdx + 1) % domains.length];
  const opp2 = domains[(myIdx - 1 + domains.length) % domains.length];
  return (
    loc === `${opp1.prefix}_seat1` ||
    loc === `${opp2.prefix}_seat6` ||
    loc === `${opp1.prefix}_rostrum1` ||
    loc === `${opp2.prefix}_rostrum2` ||
    loc === `${myDom.prefix}_seat1` ||
    loc === `${myDom.prefix}_seat6` ||
    loc === `${myDom.prefix}_rostrum1` ||
    loc === `${myDom.prefix}_rostrum2`
  );
}

/**
 * Generates distinct legal 0-, 1-, and 2-move sequences for moverId,
 * deduplicated by move-type signature and post-cascade board state.
 */
export function generateLegalMovesForBot(
  boardState,
  community,
  moverId,
  numPlayers = 3,
  options = {}
) {
  const { maxMoves = 2, allowedTypes = null, exhaustive = false } = options;
  const mStr = String(moverId);
  const mIdx = parseInt(mStr, 10);
  const { domains } = getTopology(numPlayers);
  const commKeys = Object.keys(boardState).filter((k) => k.startsWith('community_'));
  const allTypes = allowedTypes && allowedTypes.length > 0 ? allowedTypes : [...SELF_MOVES, ...OPP_MOVES];
  const allowedSet = new Set(allTypes);
  const hasCommPlayable = Boolean(findCanonicalCommunitySource(boardState, community));

  const baseAfter = maybeEnforceSupport(cloneBoard(boardState), numPlayers);
  const results = [
    { moves: [], afterBoard: baseAfter, afterCommunity: { ...community }, typesKey: '' }
  ];

  const seenPost = new Set();
  const seenPre = new Set();
  const oneMoves = generateCandidateSingleMoves(boardState, community, mStr, numPlayers, allTypes);
  const intermediate = [];

  for (const m1 of oneMoves) {
    const b1 = cloneBoard(boardState);
    const c1 = { ...community };
    applyMoveToState(m1, b1, c1);
    const after1 = maybeEnforceSupport(b1, numPlayers);
    const postKey1 = `${m1.type}|${boardSignature(after1, domains, commKeys)}`;
    if (!seenPost.has(postKey1)) {
      seenPost.add(postKey1);
      results.push({ moves: [m1], afterBoard: after1, afterCommunity: c1, typesKey: m1.type });
    }
    if (maxMoves >= 2) {
      const isSelf = SELF_MOVE_SET.has(m1.type);
      const oppInteracts =
        exhaustive ||
        m1.type === MOVE_TYPES.ASSIST ||
        (m1.type === MOVE_TYPES.REMOVE && !hasCommPlayable) ||
        isBorderLocation(m1.from, domains, mIdx) ||
        isBorderLocation(m1.to, domains, mIdx);
      if (isSelf || oppInteracts) {
        intermediate.push({ m1, b1, c1, piece1Id: boardState[m1.from]?.id || null });
      }
    }
  }

  if (maxMoves < 2) return results;

  for (const item of intermediate) {
    const { m1, b1, c1, piece1Id } = item;
    const altBase = SELF_MOVE_SET.has(m1.type) ? OPP_MOVES : SELF_MOVES;
    const altTypes = allowedTypes ? altBase.filter((t) => allowedSet.has(t)) : altBase;
    if (altTypes.length === 0) continue;

    const twoCandidates = generateCandidateSingleMoves(
      b1, c1, mStr, numPlayers, altTypes, [m1], piece1Id
    );

    for (const m2 of twoCandidates) {
      const piece2Id = b1[m2.from]?.id || null;
      if (piece1Id && piece2Id && piece1Id === piece2Id) continue;
      const normTo1 = m1.to.startsWith('community_') ? 'community' : m1.to;
      const normFrom2 = m2.from.startsWith('community_') ? 'community' : m2.from;
      if (normTo1 !== 'community' && normTo1 === normFrom2) continue;
      if (m1.from === m2.from && m1.from !== 'community') continue;

      const typesKey = m1.type <= m2.type ? `${m1.type}+${m2.type}` : `${m2.type}+${m1.type}`;
      const b2 = cloneBoard(b1);
      const c2 = { ...c1 };
      applyMoveToState(m2, b2, c2);

      const preKey = `${typesKey}|${boardSignature(b2, domains, commKeys)}`;
      if (seenPre.has(preKey)) continue;

      const after2 = maybeEnforceSupport(b2, numPlayers);
      const postKey = `${typesKey}|${boardSignature(after2, domains, commKeys)}`;
      if (seenPost.has(postKey)) {
        seenPre.add(preKey);
        continue;
      }

      seenPre.add(preKey);
      seenPost.add(postKey);
      results.push({ moves: [m1, m2], afterBoard: after2, afterCommunity: c2, typesKey });
    }
  }

  return results;
}

/**
 * Filters candidateTileIds to tiles that classify movesMade as 'Honest'.
 * Caches by unique tile move-pattern and short-circuits unmatched moves so
 * classifyPlay only runs on compatible post-move patterns.
 */
export function getTilesMatchingMoves(
  movesMade,
  candidateTileIds = STANDARD_TILE_IDS,
  moverId = '0',
  boardState = null,
  community = null,
  numPlayers = 3
) {
  const mStr = String(moverId);
  const madeTypes = (movesMade || []).map((m) => m.type);
  const patternCache = new Map();
  const matches = [];

  for (const tileId of candidateTileIds) {
    const tile = TILES[tileId];
    if (!tile) continue;
    if (tile.isWild) {
      matches.push(tileId);
      continue;
    }

    const patKey = [...tile.moves].sort().join('+');
    let isHonest = patternCache.get(patKey);
    if (isHonest === undefined) {
      const remaining = [...tile.moves];
      let hasUnmatched = false;
      for (const mt of madeTypes) {
        const idx = remaining.indexOf(mt);
        if (idx !== -1) remaining.splice(idx, 1);
        else {
          hasUnmatched = true;
          break;
        }
      }

      if (hasUnmatched) {
        isHonest = false;
      } else if (remaining.length === 0) {
        isHonest = true;
      } else {
        isHonest =
          classifyPlay(movesMade, tileId, mStr, boardState, community, numPlayers) === 'Honest';
      }
      patternCache.set(patKey, isHonest);
    }

    if (isHonest) matches.push(tileId);
  }

  return matches;
}
