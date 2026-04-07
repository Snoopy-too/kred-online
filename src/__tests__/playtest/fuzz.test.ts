// src/__tests__/playtest/fuzz.test.ts
import { describe, it, expect } from 'vitest';
import { runGame } from '../../engine/gameRunner';

describe('fuzz: random bot games', () => {
  it.each([3, 4, 5] as const)('completes 10 random %d-player games without invariant violations', (playerCount) => {
    for (let i = 0; i < 10; i++) {
      const result = runGame({ playerCount, seed: i });
      expect(result.violations).toEqual([]);
    }
  }, 60000);
});
