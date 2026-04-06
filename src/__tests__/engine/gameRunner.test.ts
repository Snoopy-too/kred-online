// src/__tests__/engine/gameRunner.test.ts
import { describe, it, expect } from 'vitest';
import { runGame } from '../../engine/gameRunner';

describe('runGame', () => {
  it('completes a 3-player game without crashing', () => {
    const result = runGame({ playerCount: 3, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.config.playerCount).toBe(3);
    expect(result.config.seed).toBe(42);
  });

  it('is deterministic with same seed', () => {
    const r1 = runGame({ playerCount: 3, seed: 42 });
    const r2 = runGame({ playerCount: 3, seed: 42 });
    expect(r1.outcome).toBe(r2.outcome);
    expect(r1.actions.length).toBe(r2.actions.length);
    expect(r1.stats.campaignCount).toBe(r2.stats.campaignCount);
  });

  it('produces different results with different seeds', () => {
    const r1 = runGame({ playerCount: 3, seed: 1 });
    const r2 = runGame({ playerCount: 3, seed: 2 });
    const differ = r1.actions.length !== r2.actions.length
      || r1.stats.campaignCount !== r2.stats.campaignCount
      || r1.outcome !== r2.outcome;
    expect(differ).toBe(true);
  });

  it('completes a 4-player game', () => {
    const result = runGame({ playerCount: 4, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
  });

  it('completes a 5-player game', () => {
    const result = runGame({ playerCount: 5, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
  });

  it('captures violations without crashing', () => {
    for (let seed = 0; seed < 5; seed++) {
      const result = runGame({ playerCount: 3, seed });
      expect(Array.isArray(result.violations)).toBe(true);
    }
  });
});
