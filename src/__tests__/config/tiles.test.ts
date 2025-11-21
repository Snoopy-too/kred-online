import { describe, it, expect } from 'vitest';
import { TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES } from '../../config/tiles';
import { TOTAL_TILES } from '../../config/constants';

describe('Tile Configuration', () => {
  describe('TILE_IMAGE_URLS', () => {
    it('should have exactly 24 tile URLs', () => {
      expect(TILE_IMAGE_URLS).toHaveLength(TOTAL_TILES);
    });

    it('should generate URLs in format ./images/NN.svg', () => {
      TILE_IMAGE_URLS.forEach((url, index) => {
        const expectedNum = String(index + 1).padStart(2, '0');
        expect(url).toBe(`./images/${expectedNum}.svg`);
      });
    });

    it('should start with 01.svg and end with 24.svg', () => {
      expect(TILE_IMAGE_URLS[0]).toBe('./images/01.svg');
      expect(TILE_IMAGE_URLS[23]).toBe('./images/24.svg');
    });

    it('should have no duplicate URLs', () => {
      const uniqueUrls = new Set(TILE_IMAGE_URLS);
      expect(uniqueUrls.size).toBe(TILE_IMAGE_URLS.length);
    });
  });

  describe('TILE_KREDCOIN_VALUES', () => {
    it('should have kredcoin values for all 24 tiles', () => {
      for (let i = 1; i <= TOTAL_TILES; i++) {
        expect(TILE_KREDCOIN_VALUES[i]).toBeDefined();
      }
    });

    it('should have tile 3 with value 0 (starting tile)', () => {
      expect(TILE_KREDCOIN_VALUES[3]).toBe(0);
    });

    it('should have all non-negative kredcoin values', () => {
      Object.values(TILE_KREDCOIN_VALUES).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have specific known values', () => {
      expect(TILE_KREDCOIN_VALUES[1]).toBe(1);
      expect(TILE_KREDCOIN_VALUES[24]).toBe(9);
      expect(TILE_KREDCOIN_VALUES[10]).toBe(2);
    });

    it('should have kredcoin values that are numbers', () => {
      Object.values(TILE_KREDCOIN_VALUES).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });
  });
});
