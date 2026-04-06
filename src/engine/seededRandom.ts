/**
 * Mulberry32 PRNG — simple, fast, deterministic.
 * Same seed always produces the same sequence.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Fisher-Yates shuffle (in-place, deterministic) */
  shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /** Pick a random element from a non-empty array */
  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  /** Weighted random choice. Weights are relative (don't need to sum to 1). */
  weightedChoice<T>(options: { value: T; weight: number }[]): T {
    const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
    let roll = this.next() * totalWeight;
    for (const option of options) {
      roll -= option.weight;
      if (roll <= 0) return option.value;
    }
    return options[options.length - 1].value;
  }
}
