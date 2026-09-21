// test/jev-arena/arenaRunner.js
// Seeded arena loop over the LIVE kred2.0 onlineEngine executors: per-seat
// jev/random drivers, combination-matrix forcing, and three oracles:
// 1. illegal-move acceptance (a rules-rejected executor call must never
//    broadcast via updateMasterGameState),
// 2. desync (two local states driven with the same option must stay equal),
// 3. stall cap (maxActions ends the game as STALLED, never a hang; a
//    repeat-state detector cuts deterministic loops short).

import { enumerateLegalActions } from './actionEnumerator.js';
import { pickIndexWithJev } from './jevPicker.js';
import { CoverageTracker } from './matrix.js';
import {
  inventIllegalProbe,
  executorBroadcastsIllegal,
  isOptionLegalByRules,
  statesInSync,
  normalizeState,
  spy,
} from './oracles.js';
import { makeInitialG, clone } from './gameSetup.js';
import { SeededRandom } from './seededRandom.js';

const REPEAT_STALL_LIMIT = 25;

function summarizeState(G, playerId) {
  const hands = Object.entries(G.players)
    .map(([id, p]) => `P${id}:${(p.hand || []).length}t,bank${(p.bank || []).length},cred${3 - (p.credibilityNotchesLost || 0)}`)
    .join(' ');
  const step = G.pendingPlay ? `pending:${G.pendingPlay.step}` : Array.isArray(G.bureaucracyTurnOrder) ? 'bureaucracy' : 'campaign';
  const me = G.players[playerId];
  return [
    `KRED ${G.numPlayers}p ${step}.`,
    `You are P${playerId} (hand ${(me?.hand || []).join(',') || '-'}, ${(me?.bank || []).length} banked).`,
    `Table: ${hands}.`,
  ].join(' ');
}

function orderCandidates(options, first, rng) {
  const rest = options.filter((_, i) => i !== first);
  rng.shuffle(rest);
  return [options[first], ...rest];
}

export async function runArenaGame(config) {
  const { playerCount, seed } = config;
  const maxActions = config.maxActions ?? 500;
  const forceCoverage = config.forceCoverage ?? true;
  const offline = config.offline ?? false;
  const seats = config.seats ?? Array.from({ length: playerCount }, () => 'random');
  const coverage = config.coverage ?? new CoverageTracker();

  const rng = new SeededRandom(seed);
  const rngFn = () => rng.next();
  let G = makeInitialG(playerCount, seed);

  const illegalAccepts = [];
  const desyncs = [];
  let actionCount = 0;
  let jevCalls = 0;
  let jevHits = 0;
  let fallbacks = 0;
  let engineRejections = 0;
  let bureaucracies = 0;
  let sawBureaucracy = false;
  let lastFingerprint = null;
  let repeatCount = 0;
  const seenPrints = new Map();
  let stallReason = null;

  while (!G.winner && actionCount < maxActions) {
    const { phase, playerId, options } = enumerateLegalActions(G);
    if (options.length === 0) {
      // Name the dead end: reexecute-family steps with no honest construction
      // are rules-level stalemates (even the bgio path has no legal move).
      stallReason = phase === 'PENDING' && G.pendingPlay ? `no-options:${G.pendingPlay.step}` : `no-options:${phase}`;
      break;
    }
    // Live-engine gap: the online turn guard pins nextMoverId exactly, but no
    // executor skips an empty-hand mover (the bgio turn order does). When the
    // pinned mover holds no tiles, no executor call can ever broadcast — the
    // online game softlocks here. Name it instead of burning the cap.
    if (phase === 'CAMPAIGN' && G.nextMoverId !== null && G.nextMoverId !== undefined
        && String(G.nextMoverId) !== String(playerId)) {
      stallReason = `empty-hand-mover:${G.nextMoverId}`;
      break;
    }

    // Oracle 1: a rules-rejected call must never broadcast.
    const probe = inventIllegalProbe(G);
    if (executorBroadcastsIllegal(G, probe)) {
      illegalAccepts.push({ actionIndex: actionCount, executor: probe.executorName, reason: probe.reason });
      break;
    }

    // Coverage forcing: prefer currently-uncovered pairs; marked after
    // apply, so this cannot loop.
    const uncovered = forceCoverage ? options.filter((o) => !coverage.has(o.matrixPhase, o.actionType)) : [];
    const pool = uncovered.length > 0 ? uncovered : options;
    let first = Math.floor(rng.next() * pool.length);
    const driver = seats[parseInt(playerId, 10)] ?? 'random';
    if (driver === 'jev' && !offline) {
      jevCalls++;
      const input = `${summarizeState(G, playerId)}\nCandidates:\n${pool.map((o, i) => `${i}. ${o.label}`).join('\n')}`;
      const instructions =
        `You are player ${playerId} in the board game KRED. ` +
        `Pick the numbered action that best helps win the game for the current seat. ` +
        `Prefer advancing your own pieces toward seat, rostrum, then office, and prefer keeping credibility.`;
      try {
        const pick = await pickIndexWithJev(input, pool.map((o) => o.label), instructions, rngFn, config.jev);
        if (pick.source === 'jev') jevHits++;
        else fallbacks++;
        first = pick.index;
      } catch {
        fallbacks++;
      }
    }
    if (first < 0 || first >= pool.length) first = 0;

    const stateBefore = G;
    let accepted = null;
    for (const candidate of orderCandidates(pool, first, rng)) {
      if (!isOptionLegalByRules(stateBefore, candidate)) {
        engineRejections++;
        if (config.verbose) console.warn(`Arena skipped rules-illegal [${candidate.matrixPhase}] ${candidate.label}`);
        continue;
      }
      const sA = spy();
      const sB = spy();
      candidate.executor(clone(stateBefore), candidate.playerID, ...JSON.parse(JSON.stringify(candidate.args)), sA.fn);
      if (sA.calls.length === 0) {
        engineRejections++;
        if (config.verbose) console.warn(`Arena rejected [${candidate.matrixPhase}] ${candidate.label}`);
        continue;
      }
      candidate.executor(clone(stateBefore), candidate.playerID, ...JSON.parse(JSON.stringify(candidate.args)), sB.fn);
      // Oracle 2: twin local states must agree.
      if (sB.calls.length === 0 || !statesInSync(sA.calls[sA.calls.length - 1][0], sB.calls[sB.calls.length - 1][0])) {
        desyncs.push({ actionIndex: actionCount, executor: candidate.executorName, label: candidate.label });
        break;
      }
      accepted = { candidate, nextG: sA.calls[sA.calls.length - 1][0] };
      break;
    }
    if (desyncs.length > 0) break;
    if (!accepted) {
      // Whole pool fell through — try the options forcing excluded.
      const rest = options.filter((o) => !pool.includes(o));
      if (rest.length > 0) {
        for (const candidate of rest) {
          if (!isOptionLegalByRules(stateBefore, candidate)) {
            engineRejections++;
            continue;
          }
          const s = spy();
          candidate.executor(clone(stateBefore), candidate.playerID, ...JSON.parse(JSON.stringify(candidate.args)), s.fn);
          if (s.calls.length === 0) {
            engineRejections++;
            continue;
          }
          accepted = { candidate, nextG: s.calls[s.calls.length - 1][0] };
          break;
        }
      }
    }
    if (!accepted) {
      stallReason = 'all-options-rejected';
      break;
    }

    coverage.mark(accepted.candidate.matrixPhase, accepted.candidate.actionType);
    for (const t of accepted.candidate.moveTypes || []) coverage.mark('MOVES', t);
    G = accepted.nextG;
    actionCount++;

    if (Array.isArray(G.bureaucracyTurnOrder)) {
      if (!sawBureaucracy) {
        sawBureaucracy = true;
        bureaucracies++;
      }
    } else {
      sawBureaucracy = false;
    }

    // Repeat-state detector: deterministic loops (e.g. bureaucracy actions
    // cycling one actor, alternating fingerprints) end as STALLED instead of
    // burning the full cap.
    const fp = normalizeState({ b: G.boardState, p: G.pendingPlay, n: G.nextMoverId, h: Object.fromEntries(Object.entries(G.players).map(([id, p]) => [id, p.hand])) });
    const seen = (seenPrints.get(fp) ?? 0) + 1;
    seenPrints.set(fp, seen);
    if (seenPrints.size > 400) seenPrints.clear();
    if (seen >= REPEAT_STALL_LIMIT) {
      stallReason = 'repeat-state';
      break;
    }
    if (fp === lastFingerprint) {
      repeatCount++;
      if (repeatCount >= REPEAT_STALL_LIMIT) {
        stallReason = 'repeat-state';
        break;
      }
    } else {
      lastFingerprint = fp;
      repeatCount = 0;
    }
  }

  const stalled = !G.winner && (actionCount >= maxActions || stallReason !== null);
  let outcome;
  const winnerIds = [];
  if (G.winner) {
    if (G.winner === 'draw') outcome = 'DRAW';
    else {
      outcome = 'WIN';
      winnerIds.push(G.winner);
    }
  } else if (stalled) {
    outcome = 'STALLED';
  } else {
    outcome = 'STALEMATE';
  }

  return {
    outcome, winnerIds, illegalAccepts, desyncs,
    stalled, stallReason, totalActions: actionCount, bureaucracies,
    jevCalls, jevHits, fallbacks, engineRejections, seed, playerCount,
  };
}
