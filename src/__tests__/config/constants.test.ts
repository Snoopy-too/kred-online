import { describe, it, expect } from 'vitest';
import { TOTAL_TILES } from '../../config/constants';

describe('Game Constants', () => {
  describe('TOTAL_TILES', () => {
    it('should be 24 tiles', () => {
      expect(TOTAL_TILES).toBe(24);
    });

    it('should be a positive number', () => {
      expect(TOTAL_TILES).toBeGreaterThan(0);
    });
  });
});
