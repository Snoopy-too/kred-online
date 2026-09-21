// test/jev-arena/arena.test.js
// Arena smoke over the live kred2.0 executors: seeded offline games run the
// full loop with clean oracles; Jev seats degrade to seeded RNG on network
// failure; offline runs are deterministic; the stall cap never hangs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runArenaGame } from './arenaRunner.js';
import { enumerateLegalActions } from './actionEnumerator.js';
import { CoverageTracker, expectedPairs } from './matrix.js';
import { makeInitialG } from './gameSetup.js';

const OUTCOMES = ['WIN', 'DRAW', 'STALEMATE', 'STALLED'];

describe('jev-arena smoke (kred2.0 onlineEngine)', { timeout: 120000 }, () => {
  it('completes seeded offline games with clean oracles', async () => {
    const coverage = new CoverageTracker();
    for (let g = 0; g < 3; g++) {
      const result = await runArenaGame({
        playerCount: 3, seed: 1 + g, seats: ['random', 'random', 'random'],
        offline: true, maxActions: 300, coverage,
      });
      assert.ok(OUTCOMES.includes(result.outcome), `unexpected outcome ${result.outcome}`);
      assert.deepEqual(result.illegalAccepts, []);
      assert.deepEqual(result.desyncs, []);
      assert.ok(result.totalActions > 0);
    }
    const rep = coverage.report(expectedPairs());
    assert.ok(rep.covered > 0);
    assert.ok(Array.isArray(rep.uncovered));
  });

  it('covers 4p and 5p setups with clean oracles', async () => {
    for (const playerCount of [4, 5]) {
      const result = await runArenaGame({ playerCount, seed: 7, offline: true, maxActions: 150 });
      assert.ok(OUTCOMES.includes(result.outcome));
      assert.deepEqual(result.illegalAccepts, []);
      assert.deepEqual(result.desyncs, []);
    }
  });

  it('jev seats fall back on stubbed HTTP without throwing', async () => {
    const result = await runArenaGame({
      playerCount: 3, seed: 1, seats: ['jev', 'random', 'random'], maxActions: 30,
      jev: { fetchImpl: async () => { throw new TypeError('fetch failed (stubbed)'); } },
    });
    assert.ok(result.jevCalls > 0);
    assert.ok(result.fallbacks > 0);
    assert.deepEqual(result.illegalAccepts, []);
    assert.deepEqual(result.desyncs, []);
  });

  it('is deterministic offline: same seed, same result', async () => {
    const run = () => runArenaGame({ playerCount: 3, seed: 42, offline: true, maxActions: 150, seats: ['random', 'random', 'random'] });
    const r1 = await run();
    const r2 = await run();
    assert.equal(r1.outcome, r2.outcome);
    assert.equal(r1.totalActions, r2.totalActions);
    assert.equal(r1.stallReason, r2.stallReason);
    assert.deepEqual(r1.illegalAccepts, []);
    assert.deepEqual(r1.desyncs, []);
  });

  it('enumerator derives options from the rules at game start', () => {
    const G = makeInitialG(3, 1);
    const { phase, options } = enumerateLegalActions(G);
    assert.equal(phase, 'CAMPAIGN');
    assert.ok(options.length > 0);
    for (const o of options) {
      assert.ok(o.label.length > 0);
      assert.ok(o.actionType.length > 0);
    }
  });

  it('caps a stalled game instead of hanging', async () => {
    const result = await runArenaGame({ playerCount: 3, seed: 1, offline: true, maxActions: 2 });
    assert.equal(result.outcome, 'STALLED');
    assert.equal(result.stalled, true);
    assert.equal(result.totalActions, 2);
  });
});
