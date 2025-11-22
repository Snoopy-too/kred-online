/**
 * Array Utilities
 *
 * Purpose: Array manipulation helpers
 * Dependencies: None (pure array functions)
 * Usage: Used for shuffling arrays and other array operations
 *
 * @module utils/array
 */

/**
 * Shuffles an array in place using the Fisher-Yates algorithm
 *
 * Randomly reorders the elements of an array. The original array
 * is modified (shuffled in place) and also returned.
 *
 * Algorithm: Fisher-Yates shuffle
 * - Iterates from the end of the array to the beginning
 * - For each position, swaps with a random position before it
 * - Ensures uniform random distribution of permutations
 *
 * @param array - The array to shuffle (will be modified)
 * @returns The same array, shuffled
 *
 * @example
 * ```typescript
 * const deck = [1, 2, 3, 4, 5];
 * shuffle(deck);
 * // deck is now shuffled, e.g., [3, 1, 5, 2, 4]
 *
 * // If you need to keep the original:
 * const original = [1, 2, 3, 4, 5];
 * const shuffled = shuffle([...original]);
 * ```
 */
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
