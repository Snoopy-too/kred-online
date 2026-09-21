// test/jev-arena/matrix.test.js
// Combination matrix: expected pairs derive from the rules, tracker reports.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TILES } from '../../src/domain/types.js';
import { expectedPairs, matrixKey, CoverageTracker, distinctTileCombos, ALL_MOVE_TYPES } from './matrix.js';

describe('combination matrix', () => {
  it('distinct combos match unique TILES moves (BLANK excluded)', () => {
    const keys = new Set(distinctTileCombos().map((c) => [...c].sort().join('+')));
    const fromRules = new Set();
    for (const [id, tile] of Object.entries(TILES)) {
      if (id === 'BLANK') continue;
      fromRules.add([...tile.moves].sort().join('+'));
    }
    assert.deepEqual(keys, fromRules);
    assert.ok(!keys.has(''));
  });

  it('ALL_MOVE_TYPES is the MOVE_TYPES enum, not a handwritten list', () => {
    assert.deepEqual([...ALL_MOVE_TYPES].sort(), ['Advance', 'Assist', 'Influence', 'Organize', 'Remove', 'Withdraw']);
  });

  it('expected pairs cover campaigns, pending steps, bureaucracy, and moves', () => {
    const expected = expectedPairs();
    for (const combo of distinctTileCombos()) {
      assert.ok(expected.has(matrixKey('CAMPAIGN', [...combo].sort().join('+'))));
    }
    assert.ok(expected.has(matrixKey('CAMPAIGN', '(no moves)')));
    for (const s of ['receipt', 'challenge', 'reexecute', 'receiverReward', 'challengerReward']) {
      assert.ok(expected.has(matrixKey('PENDING', s)));
    }
    for (const k of ['RESTORE_CRED', 'PROMOTE_SEAT_TO_ROSTRUM', 'END']) {
      assert.ok(expected.has(matrixKey('BUREAUCRACY', k)));
    }
    assert.ok(expected.has(matrixKey('MOVES', 'Advance')));
  });

  it('tracker reports uncovered pairs', () => {
    const t = new CoverageTracker();
    t.mark('CAMPAIGN', 'Advance');
    const rep = t.report();
    assert.ok(rep.covered > 0);
    assert.equal(rep.uncovered.length, rep.total - rep.covered);
    assert.ok(!rep.uncovered.includes(matrixKey('CAMPAIGN', 'Advance')));
  });
});
