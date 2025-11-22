/**
 * Array Utilities Tests
 *
 * Tests for array manipulation utilities
 */

import { describe, it, expect } from "vitest";
import { shuffle } from "../../utils/array";

describe("Array Utilities", () => {
  describe("shuffle", () => {
    it("should return an array of the same length", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...original]);
      expect(shuffled).toHaveLength(original.length);
    });

    it("should contain all original elements", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...original]);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it("should shuffle array in place (modifies original)", () => {
      const array = [1, 2, 3, 4, 5];
      const result = shuffle(array);
      expect(result).toBe(array); // Same reference
    });

    it("should handle empty array", () => {
      const array: number[] = [];
      const shuffled = shuffle(array);
      expect(shuffled).toEqual([]);
    });

    it("should handle single-element array", () => {
      const array = [42];
      const shuffled = shuffle(array);
      expect(shuffled).toEqual([42]);
    });

    it("should handle two-element array", () => {
      const array = [1, 2];
      const shuffled = shuffle(array);
      expect(shuffled).toHaveLength(2);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
    });

    it("should shuffle string arrays", () => {
      const original = ["a", "b", "c", "d"];
      const shuffled = shuffle([...original]);
      expect(shuffled).toHaveLength(4);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it("should shuffle object arrays", () => {
      const original = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const copy = original.map((obj) => ({ ...obj }));
      const shuffled = shuffle(copy);
      expect(shuffled).toHaveLength(3);
      const ids = shuffled.map((obj) => obj.id).sort();
      expect(ids).toEqual([1, 2, 3]);
    });

    it("should produce different orderings over multiple shuffles", () => {
      // Statistical test - shuffling should produce different results
      const original = [1, 2, 3, 4, 5, 6, 7, 8];
      let differentOrderFound = false;

      // Try up to 100 times to get a different ordering
      for (let i = 0; i < 100; i++) {
        const shuffled = shuffle([...original]);
        if (JSON.stringify(shuffled) !== JSON.stringify(original)) {
          differentOrderFound = true;
          break;
        }
      }

      expect(differentOrderFound).toBe(true);
    });

    it("should shuffle large arrays", () => {
      const original = Array.from({ length: 100 }, (_, i) => i);
      const shuffled = shuffle([...original]);
      expect(shuffled).toHaveLength(100);
      expect(shuffled.sort((a, b) => a - b)).toEqual(original);
    });

    it("should handle arrays with duplicate values", () => {
      const original = [1, 2, 2, 3, 3, 3];
      const shuffled = shuffle([...original]);
      expect(shuffled).toHaveLength(6);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it("should work with typed arrays", () => {
      type TestType = { value: number };
      const original: TestType[] = [{ value: 1 }, { value: 2 }, { value: 3 }];
      const copy = original.map((obj) => ({ ...obj }));
      const shuffled = shuffle<TestType>(copy);
      expect(shuffled).toHaveLength(3);
      const values = shuffled.map((obj) => obj.value).sort();
      expect(values).toEqual([1, 2, 3]);
    });
  });
});
