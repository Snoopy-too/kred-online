// test/jev-arena/actionEnumerator.js
// Every legal executor-call for a kred2.0 G, derived from the rules — never
// hardcoded move lists:
// - TILES move requirements (src/domain/types.js)
// - move validators (src/domain/moves.js: validateSingleMove,
//   validateMoveCombination, isMoveTypePossible, classifyPlay)
// - executor guards (src/domain/onlineEngine.js executeOnline*)
// - pending-play actor routing (src/domain/board.js)
// Enumeration is deterministic given G; randomness lives in the runner.

import {
  executeOnlineCampaignTurn,
  executeOnlineAcceptTile,
  executeOnlineRejectTile,
  executeOnlineChallengeTile,
  executeOnlinePassChallenge,
  executeOnlineReexecute,
  executeOnlinePenaltyWithdraw,
  executeOnlineReceiverCredibilityReward,
  executeOnlineReceiverAdvanceReward,
  executeOnlineFreeAdvance,
  executeOnlineChallengerCredibility,
  executeOnlineChallengerBureaucracyAction,
  executeOnlineBureaucracyAction,
  executeOnlineEndBureaucracyTurn,
} from '../../src/domain/onlineEngine.js';
import {
  validateSingleMove,
  validateMoveCombination,
  applyMoveToState,
  classifyPlay,
} from '../../src/domain/moves.js';
import { getOrderedChallengers, getPendingPlayActivePlayer } from '../../src/domain/board.js';
import { TILES, INITIAL_PIECE_COUNTS, BUREAUCRACY_PRICES } from '../../src/domain/types.js';
import { distinctTileCombos, ALL_MOVE_TYPES } from './matrix.js';

const SELF_MOVES = new Set(['Advance', 'Withdraw', 'Organize']);

// Active campaign mover (mirrors campaignPhase turn order + onBegin).
export function getActiveMover(G) {
  if (G.nextMoverId !== undefined && G.nextMoverId !== null) return String(G.nextMoverId);
  for (const pId of Object.keys(G.players || {})) {
    if ((G.players[pId].hand || []).includes('03')) return pId;
  }
  return '0';
}

// Next player clockwise who still holds tiles (mirrors turn order search).
export function nextMoverWithTiles(G, fromId) {
  const np = G.numPlayers || 3;
  let target = String(fromId);
  for (let i = 0; i < np; i++) {
    if ((G.players[target]?.hand || []).length > 0) return target;
    target = String((parseInt(target, 10) + 1) % np);
  }
  return null;
}

const sortedKeys = (boardState) => Object.keys(boardState).sort();

function candidateFroms(boardState) {
  const froms = sortedKeys(boardState).filter(
    (k) => !k.startsWith('community_') || boardState[k] !== null,
  );
  if (!froms.includes('community')) froms.push('community');
  return froms;
}

function candidateTos(boardState) {
  const tos = sortedKeys(boardState).filter((k) => !k.startsWith('community_'));
  if (!tos.includes('community')) tos.push('community');
  return tos;
}

// One concrete legal instance of a required move-type sequence, simulated
// forward on a scratch board. Null when impossible in this state.
function buildConcreteMoves(required, moverId, boardState, community, numPlayers) {
  let simBoard = JSON.parse(JSON.stringify(boardState));
  let simComm = JSON.parse(JSON.stringify(community));
  const moves = [];
  const usedIds = new Set();
  for (const type of required) {
    let chosen = null;
    for (const from of candidateFroms(simBoard)) {
      if (chosen) break;
      const piece = from === 'community' ? null : simBoard[from];
      if (piece?.id && usedIds.has(piece.id)) continue;
      for (const to of candidateTos(simBoard)) {
        if (from === to) continue;
        const cand = { type, from, to };
        if (validateSingleMove(cand, moverId, simBoard, simComm, numPlayers).valid) {
          chosen = cand;
          break;
        }
      }
    }
    if (!chosen) return null;
    moves.push(chosen);
    const piece = simBoard[chosen.from];
    if (piece?.id) usedIds.add(piece.id);
    // Apply on scratch clones (applyMoveToState mutates in place).
    const b = JSON.parse(JSON.stringify(simBoard));
    const c = JSON.parse(JSON.stringify(simComm));
    applyMoveToState(chosen, b, c);
    simBoard = b;
    simComm = c;
  }
  return moves;
}

function describeMoves(moves) {
  return moves.map((m) => `${m.type} ${m.from}->${m.to}`).join(' | ');
}

function campaignOptions(G, moverId) {
  const np = G.numPlayers || 3;
  const tilesPerPlayer = (INITIAL_PIECE_COUNTS[np] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
  const hand = G.players[moverId]?.hand || [];
  const options = [];
  if (hand.length === 0) return options;

  let receivers = Object.keys(G.players).filter(
    (p) => p !== moverId && (G.players[p].bank || []).length < tilesPerPlayer,
  );
  // No opponent has bank space: the live executor allows self-play exactly
  // then (and refuses it otherwise), so enumerate self as the receiver.
  if (receivers.length === 0) receivers = [moverId];

  // Move-sequence pool: one concrete instance per distinct tile combo in the
  // rules, plus single-type probes, plus the empty (pass-through) turn.
  const seqPool = [];
  for (const combo of distinctTileCombos()) {
    const moves = buildConcreteMoves(combo, moverId, G.boardState, G.community, np);
    if (moves && validateMoveCombination(moves, moverId, G.boardState, G.community, np).valid) {
      seqPool.push(moves);
    }
  }
  for (const mt of ALL_MOVE_TYPES) {
    const moves = buildConcreteMoves([mt], moverId, G.boardState, G.community, np);
    if (moves && validateMoveCombination(moves, moverId, G.boardState, G.community, np).valid) {
      seqPool.push(moves);
    }
  }
  seqPool.push([]); // moves: [] is validator-legal (pass-through turn)

  const seen = new Set();
  for (const tileId of hand) {
    for (const receiverId of receivers) {
      for (const moves of seqPool) {
        if (options.length >= 150) return options;
        const key = `${tileId}->${receiverId}:[${moves.map((m) => m.type).sort().join('+')}]`;
        if (seen.has(key)) continue;
        seen.add(key);
        const payload = { tileId, receiverId, moves: JSON.parse(JSON.stringify(moves)) };
        const types = moves.map((m) => m.type).sort();
        options.push({
          executor: executeOnlineCampaignTurn,
          executorName: 'executeOnlineCampaignTurn',
          playerID: moverId,
          args: [payload],
          matrixPhase: 'CAMPAIGN',
          actionType: types.length > 0 ? types.join('+') : '(no moves)',
          moveTypes: types,
          label: `CAMPAIGN T${tileId} -> P${receiverId} [${types.join('+') || 'no moves'}: ${describeMoves(moves)}]`,
        });
      }
    }
  }
  return options;
}

function pendingOptions(G) {
  const pp = G.pendingPlay;
  const actor = getPendingPlayActivePlayer(G);
  // A null actor with step=challenge means no eligible challengers remain;
  // the challenge branch below offers the resolving pass. Any other null
  // actor is genuinely stuck.
  if ((actor === null || actor === undefined) && pp.step !== 'challenge') {
    return { phase: 'PENDING', playerId: null, options: [] };
  }
  const pId = actor === null || actor === undefined ? null : String(actor);
  const opt = (executor, executorName, args, actionType, label) => ({
    executor, executorName, playerID: pId, args, matrixPhase: 'PENDING', actionType, moveTypes: [], label,
  });

  switch (pp.step) {
    case 'receipt': {
      const options = [opt(executeOnlineAcceptTile, 'executeOnlineAcceptTile', [], 'receipt', `RECEIPT ACCEPT by P${pId}`)];
      if (pp.playType !== 'Honest') {
        options.push(opt(executeOnlineRejectTile, 'executeOnlineRejectTile', [], 'receipt', `RECEIPT REJECT by P${pId}`));
      }
      return { phase: 'PENDING', playerId: pId, options };
    }
    case 'challenge': {
      // No eligible challengers left but step is still challenge: the live
      // passChallenge executor accepts any actor here and resolves the play,
      // so offer the receiver's pass rather than deadlocking.
      if (pId === null) {
        const fallback = String(pp.receiverId);
        return {
          phase: 'PENDING', playerId: fallback,
          options: [{
            executor: executeOnlinePassChallenge, executorName: 'executeOnlinePassChallenge',
            playerID: fallback, args: [], matrixPhase: 'PENDING',
            actionType: 'challenge', moveTypes: [],
            label: `CHALLENGE PASS by P${fallback} (no eligible challengers)`,
          }],
        };
      }
      const me = G.players[pId];
      const options = [opt(executeOnlinePassChallenge, 'executeOnlinePassChallenge', [], 'challenge', `CHALLENGE PASS by P${pId}`)];
      if (me && me.credibilityNotchesLost < 3) {
        options.unshift(opt(executeOnlineChallengeTile, 'executeOnlineChallengeTile', [], 'challenge', `CHALLENGE by P${pId}`));
      }
      return { phase: 'PENDING', playerId: pId, options };
    }
    case 'reexecute': {
      const np = G.numPlayers || 3;
      const tileId = pp.reexecuteTileId || pp.tileIdPlayed;
      const options = [];
      for (const combo of distinctTileCombos()) {
        if (options.length >= 8) break;
        const moves = buildConcreteMoves(combo, pp.moverId, G.boardState, G.community, np);
        if (!moves) continue;
        if (classifyPlay(moves, tileId, pp.moverId, G.boardState, G.community, np) !== 'Honest') continue;
        options.push(opt(executeOnlineReexecute, 'executeOnlineReexecute', [JSON.parse(JSON.stringify(moves))], 'reexecute', `REEXECUTE [${moves.map((m) => m.type).join('+')}]`));
      }
      return { phase: 'PENDING', playerId: pId, options };
    }
    case 'penaltyWithdraw': {
      const np = G.numPlayers || 3;
      const options = [];
      for (const from of candidateFroms(G.boardState)) {
        if (options.length >= 6) break;
        for (const to of candidateTos(G.boardState)) {
          if (from === to) continue;
          const cand = { type: 'Withdraw', from, to };
          if (validateSingleMove(cand, pp.moverId, G.boardState, G.community, np).valid) {
            options.push(opt(executeOnlinePenaltyWithdraw, 'executeOnlinePenaltyWithdraw', [cand], 'penaltyWithdraw', `PENALTY-WITHDRAW ${from}->${to}`));
            break;
          }
        }
      }
      options.push(opt(executeOnlinePenaltyWithdraw, 'executeOnlinePenaltyWithdraw', [undefined], 'penaltyWithdraw', 'PENALTY-WITHDRAW (no-op)'));
      return { phase: 'PENDING', playerId: pId, options };
    }
    case 'receiverReward': {
      return {
        phase: 'PENDING', playerId: pId,
        options: [
          opt(executeOnlineReceiverCredibilityReward, 'executeOnlineReceiverCredibilityReward', [], 'receiverReward', `REWARD cred by P${pId}`),
          opt(executeOnlineReceiverAdvanceReward, 'executeOnlineReceiverAdvanceReward', [], 'receiverReward', `REWARD advance by P${pId}`),
        ],
      };
    }
    case 'freeAdvance': {
      const np = G.numPlayers || 3;
      const options = [];
      for (const from of candidateFroms(G.boardState)) {
        if (options.length >= 6) break;
        for (const to of candidateTos(G.boardState)) {
          if (from === to) continue;
          const cand = { type: 'Advance', from, to };
          if (validateSingleMove(cand, pId, G.boardState, G.community, np).valid) {
            options.push(opt(executeOnlineFreeAdvance, 'executeOnlineFreeAdvance', [cand], 'freeAdvance', `FREE-ADVANCE ${from}->${to}`));
            break;
          }
        }
      }
      options.push(opt(executeOnlineFreeAdvance, 'executeOnlineFreeAdvance', [undefined], 'freeAdvance', 'FREE-ADVANCE (no-op)'));
      return { phase: 'PENDING', playerId: pId, options };
    }
    case 'challengerReward': {
      const np = G.numPlayers || 3;
      const prices = BUREAUCRACY_PRICES[np] || BUREAUCRACY_PRICES[3];
      const me = G.players[pId];
      const facedown = (me?.bank || []).filter((t) => t.faceDown);
      const funding = facedown.reduce((s, t) => s + (TILES[t.tileId]?.funding || 0), 0);
      const options = [opt(executeOnlineChallengerCredibility, 'executeOnlineChallengerCredibility', [], 'challengerReward', `CHALLENGER cred by P${pId}`)];
      if (me && me.credibilityNotchesLost > 0 && funding >= prices.RESTORE_CRED) {
        options.push(opt(executeOnlineChallengerBureaucracyAction, 'executeOnlineChallengerBureaucracyAction', [{ actionType: 'RESTORE_CRED' }], 'challengerReward', 'CHALLENGER buy RESTORE_CRED'));
      }
      for (const loc of sortedKeys(G.boardState)) {
        if (options.length >= 6 || loc.startsWith('community_')) continue;
        const piece = G.boardState[loc];
        if (!piece || !loc.startsWith(`p${parseInt(pId, 10) + 1}_`)) continue;
        for (const actionType of ['PROMOTE_SEAT', 'PROMOTE_ROSTRUM']) {
          if (funding >= (prices[actionType] || Infinity)) {
            options.push(opt(executeOnlineChallengerBureaucracyAction, 'executeOnlineChallengerBureaucracyAction', [{ actionType, targetLoc: loc }], 'challengerReward', `CHALLENGER buy ${actionType} @${loc}`));
            break;
          }
        }
        if (options.length >= 6) break;
      }
      return { phase: 'PENDING', playerId: pId, options };
    }
    default:
      return { phase: 'PENDING', playerId: pId, options: [] };
  }
}

function bureaucracyOptions(G) {
  const order = G.bureaucracyTurnOrder;
  const actor = String(order[G.bureaucracyTurnIndex || 0]);
  const prefix = `p${parseInt(actor, 10) + 1}_`;
  const opt = (executor, executorName, args, actionType, label) => ({
    executor, executorName, playerID: actor, args, matrixPhase: 'BUREAUCRACY', actionType, moveTypes: [], label,
  });
  const options = [opt(executeOnlineBureaucracyAction, 'executeOnlineBureaucracyAction', [{ actionType: 'RESTORE_CRED' }], 'RESTORE_CRED', `BUREAUCRACY RESTORE_CRED by P${actor}`)];
  for (const from of sortedKeys(G.boardState)) {
    if (options.length >= 5 || !from.startsWith(prefix) || from.includes('office')) continue;
    if (!G.boardState[from]) continue;
    for (const to of sortedKeys(G.boardState)) {
      if (!to.startsWith(prefix) || !to.includes('rostrum') || G.boardState[to] !== null) continue;
      options.push(opt(executeOnlineBureaucracyAction, 'executeOnlineBureaucracyAction', [{ actionType: 'PROMOTE_SEAT_TO_ROSTRUM', fromLoc: from, toLoc: to }], 'PROMOTE_SEAT_TO_ROSTRUM', `BUREAUCRACY promote ${from}->${to}`));
      break;
    }
  }
  options.push(opt(executeOnlineEndBureaucracyTurn, 'executeOnlineEndBureaucracyTurn', [], 'END', `BUREAUCRACY end turn by P${actor}`));
  return { phase: 'BUREAUCRACY', playerId: actor, options };
}

// Every legal executor-call for the current G. Empty options = stuck.
export function enumerateLegalActions(G) {
  if (G.winner) return { phase: 'GAME_OVER', playerId: null, options: [] };
  if (G.pendingPlay) return pendingOptions(G);
  if (Array.isArray(G.bureaucracyTurnOrder)) return bureaucracyOptions(G);
  const mover = nextMoverWithTiles(G, getActiveMover(G));
  if (!mover) return { phase: 'CAMPAIGN', playerId: null, options: [] };
  return { phase: 'CAMPAIGN', playerId: mover, options: campaignOptions(G, mover) };
}

export { SELF_MOVES };
