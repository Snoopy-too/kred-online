// test/jev-arena/oracles.js
// Three oracles for the kred2.0 arena:
// 1. illegal-move acceptance — a rules-rejected executor call must never
//    broadcast (spy sees zero updateMasterGameState calls).
// 2. desync — two local states driven with the same option must stay equal
//    (normalized for engine-generated fallback piece ids).
// 3. stall cap lives in the runner (maxActions -> STALLED, never a hang).
// Independent of the enumerator: validator + guard checks are re-derived
// here from src/domain/moves.js and the onlineEngine guards.

import {
  executeOnlineCampaignTurn,
  executeOnlineAcceptTile,
  executeOnlineBureaucracyAction,
  executeOnlineEndBureaucracyTurn,
} from '../../src/domain/onlineEngine.js';
import { validateMoveCombination } from '../../src/domain/moves.js';
import { getPendingPlayActivePlayer } from '../../src/domain/board.js';
import { TurnSubmissionSchema, INITIAL_PIECE_COUNTS } from '../../src/domain/types.js';
import { getActiveMover } from './actionEnumerator.js';

export const spy = () => {
  const calls = [];
  return { calls, fn: (g, phase) => calls.push([g, phase]) };
};

// A call the rules reject in the current G — must never broadcast.
export function inventIllegalProbe(G) {
  if (G.pendingPlay) {
    const active = getPendingPlayActivePlayer(G);
    const wrongActor = Object.keys(G.players).find((p) => p !== String(active)) ?? '99';
    return {
      executor: executeOnlineAcceptTile, executorName: 'executeOnlineAcceptTile',
      playerID: wrongActor, args: [], reason: `accept-by-non-actor:${wrongActor}`,
    };
  }
  if (Array.isArray(G.bureaucracyTurnOrder)) {
    const current = String(G.bureaucracyTurnOrder[G.bureaucracyTurnIndex || 0]);
    const wrongActor = Object.keys(G.players).find((p) => p !== current) ?? '99';
    return {
      executor: executeOnlineEndBureaucracyTurn, executorName: 'executeOnlineEndBureaucracyTurn',
      playerID: wrongActor, args: [], reason: `end-turn-by-non-actor:${wrongActor}`,
    };
  }
  const mover = getActiveMover(G);
  const wrongMover = Object.keys(G.players).find((p) => p !== mover) ?? '99';
  const hand = G.players[wrongMover]?.hand || [];
  return {
    executor: executeOnlineCampaignTurn, executorName: 'executeOnlineCampaignTurn',
    playerID: wrongMover,
    args: [{ tileId: hand[0] ?? 'T1', receiverId: mover, moves: [] }],
    reason: `campaign-turn-by-wrong-mover:${wrongMover}`,
  };
}

// True when the executor broadcast a rules-illegal call (oracle FAIL).
export function executorBroadcastsIllegal(G, probe) {
  const s = spy();
  probe.executor(JSON.parse(JSON.stringify(G)), probe.playerID, ...probe.args, s.fn);
  return s.calls.length > 0;
}

// Rules-side legality of an enumerated option against stateBefore: executor
// guards + move validators, not "did it broadcast".
export function isOptionLegalByRules(G, option) {
  const np = G.numPlayers || 3;
  if (option.executorName === 'executeOnlineCampaignTurn') {
    const [payload] = option.args;
    if (!TurnSubmissionSchema.safeParse(payload).success) return false;
    if (String(G.nextMoverId ?? getActiveMover(G)) !== String(option.playerID)) return false;
    if (!(G.players[option.playerID]?.hand || []).includes(payload.tileId)) return false;
    const tilesPerPlayer = (INITIAL_PIECE_COUNTS[np] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
    if ((G.players[payload.receiverId]?.bank || []).length >= tilesPerPlayer) return false;
    if (payload.receiverId === option.playerID) {
      const hasOpponentTarget = Object.keys(G.players).some(
        (p) => p !== option.playerID && (G.players[p].bank || []).length < tilesPerPlayer,
      );
      if (hasOpponentTarget) return false;
    }
    return validateMoveCombination(payload.moves, option.playerID, G.boardState, G.community, np).valid;
  }
  if (G.pendingPlay) {
    const active = getPendingPlayActivePlayer(G);
    if (active !== null && active !== undefined) {
      return String(active) === String(option.playerID);
    }
    // No active challenger but step is still challenge: the live
    // passChallenge executor accepts any actor and resolves the play.
    return G.pendingPlay.step === 'challenge'
      && option.executorName === 'executeOnlinePassChallenge';
  }
  if (Array.isArray(G.bureaucracyTurnOrder)) {
    if (option.executorName === 'executeOnlineBureaucracyAction') return true; // phase guard only; ownership checked post-apply
    const current = String(G.bureaucracyTurnOrder[G.bureaucracyTurnIndex || 0]);
    return current === String(option.playerID);
  }
  return false;
}

// Engine-generated fallback piece ids (Date.now/Math.random in
// applyMoveToState) are nondeterministic by construction — normalize them so
// the desync oracle compares game meaning, not id entropy.
export function normalizeState(G) {
  return JSON.stringify(G).replace(/"(m|h)_\d+_[0-9.]+"/g, '"$1_generated"');
}

export function statesInSync(A, B) {
  return normalizeState(A) === normalizeState(B);
}

// Ownership probe for the bureaucracy guard: promoting another player's
// piece must never broadcast and never mutate.
export function bureaucracyOwnershipHolds(G, actor) {
  const otherPrefix = Object.keys(G.players)
    .map((p) => `p${parseInt(p, 10) + 1}_`)
    .find((prefix) => prefix !== `p${parseInt(actor, 10) + 1}_`);
  const victim = Object.keys(G.boardState).find((k) => k.startsWith(otherPrefix) && G.boardState[k]);
  if (!victim) return true; // nothing to steal — guard vacuously holds
  const before = JSON.stringify(G.boardState);
  const s = spy();
  const g = JSON.parse(JSON.stringify(G));
  if (!Array.isArray(g.bureaucracyTurnOrder)) g.bureaucracyTurnOrder = [actor];
  executeOnlineBureaucracyAction(g, actor,
    { actionType: 'PROMOTE_SEAT_TO_ROSTRUM', fromLoc: victim, toLoc: `${victim}_x` }, s.fn);
  return s.calls.length === 0 && JSON.stringify(G.boardState) === before;
}
