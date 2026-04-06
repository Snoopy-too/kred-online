import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../../engine/seededRandom';

describe('SeededRandom', () => {
  it('produces deterministic sequences from the same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(99);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRandom(123);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt(min, max) returns integers in [min, max]', () => {
    const rng = new SeededRandom(7);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('shuffle() returns all elements in different order deterministically', () => {
    const rng1 = new SeededRandom(55);
    const rng2 = new SeededRandom(55);
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];
    rng1.shuffle(arr1);
    rng2.shuffle(arr2);
    expect(arr1).toEqual(arr2);
    expect(arr1.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('pick() returns a random element from an array', () => {
    const rng = new SeededRandom(10);
    const items = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it('weightedChoice() respects weights', () => {
    const rng = new SeededRandom(42);
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) {
      const choice = rng.weightedChoice([
        { value: 'a' as const, weight: 99 },
        { value: 'b' as const, weight: 1 },
      ]);
      counts[choice]++;
    }
    expect(counts.a).toBeGreaterThan(900);
  });
});
