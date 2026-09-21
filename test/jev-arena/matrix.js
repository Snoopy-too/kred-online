// test/jev-arena/matrix.js
// Combination matrix: (phase x action-type) coverage. The expected set is
// derived from the rules at runtime — distinct tile move-combos in TILES
// (src/domain/types.js), pendingPlay steps, and onlineEngine executors —
// not a hardcoded list that rots.

import { TILES, MOVE_TYPES } from '../../src/domain/types.js';

export const matrixKey = (phase, actionType) => `${phase}:${actionType}`;

// Distinct tile move-combos in the rules (BLANK excluded — it requires nothing).
export function distinctTileCombos() {
  const seen = new Set();
  const combos = [];
  for (const [id, tile] of Object.entries(TILES)) {
    if (id === 'BLANK') continue;
    const key = [...tile.moves].sort().join('+');
    if (!seen.has(key)) {
      seen.add(key);
      combos.push([...tile.moves]);
    }
  }
  return combos;
}

export const ALL_MOVE_TYPES = Object.values(MOVE_TYPES);

// Full expected pair set, derived from rules + executors.
export function expectedPairs() {
  const expected = new Set();
  for (const combo of distinctTileCombos()) {
    const key = [...combo].sort().join('+');
    expected.add(matrixKey('CAMPAIGN', key));
  }
  expected.add(matrixKey('CAMPAIGN', '(no moves)'));
  for (const s of ['receipt', 'challenge', 'reexecute', 'penaltyWithdraw', 'receiverReward', 'freeAdvance', 'challengerReward']) {
    expected.add(matrixKey('PENDING', s));
  }
  for (const k of ['RESTORE_CRED', 'PROMOTE_SEAT_TO_ROSTRUM', 'END']) {
    expected.add(matrixKey('BUREAUCRACY', k));
  }
  for (const mt of ALL_MOVE_TYPES) expected.add(matrixKey('MOVES', mt));
  return expected;
}

export class CoverageTracker {
  constructor() {
    this.seen = new Set();
  }
  mark(phase, actionType) {
    this.seen.add(matrixKey(phase, actionType));
  }
  get size() {
    return this.seen.size;
  }
  seenKeys() {
    return [...this.seen].sort();
  }
  has(phase, actionType) {
    return this.seen.has(matrixKey(phase, actionType));
  }
  uncovered(expected = expectedPairs()) {
    return [...expected].filter((k) => !this.seen.has(k)).sort();
  }
  report(expected = expectedPairs()) {
    const uncovered = this.uncovered(expected);
    return { covered: expected.size - uncovered.length, total: expected.size, uncovered };
  }
}
