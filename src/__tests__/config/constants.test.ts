import { describe, it, expect } from 'vitest';
import { TOTAL_TILES, PLAYER_OPTIONS, BOARD_IMAGE_URLS } from '../../config/constants';

describe('Game Constants', () => {
  describe('TOTAL_TILES', () => {
    it('should be 24 tiles', () => {
      expect(TOTAL_TILES).toBe(24);
    });

    it('should be a positive number', () => {
      expect(TOTAL_TILES).toBeGreaterThan(0);
    });
  });

  describe('PLAYER_OPTIONS', () => {
    it('should have exactly 3 player count options', () => {
      expect(PLAYER_OPTIONS).toHaveLength(3);
    });

    it('should support 3, 4, and 5 players', () => {
      expect(PLAYER_OPTIONS).toEqual([3, 4, 5]);
    });

    it('should have player counts in ascending order', () => {
      const sorted = [...PLAYER_OPTIONS].sort((a, b) => a - b);
      expect(PLAYER_OPTIONS).toEqual(sorted);
    });
  });

  describe('BOARD_IMAGE_URLS', () => {
    it('should have board images for 3, 4, and 5 players', () => {
      expect(BOARD_IMAGE_URLS[3]).toBeDefined();
      expect(BOARD_IMAGE_URLS[4]).toBeDefined();
      expect(BOARD_IMAGE_URLS[5]).toBeDefined();
    });

    it('should have correct image paths format', () => {
      expect(BOARD_IMAGE_URLS[3]).toBe('./images/3player_board.jpg');
      expect(BOARD_IMAGE_URLS[4]).toBe('./images/4player_board.jpg');
      expect(BOARD_IMAGE_URLS[5]).toBe('./images/5player_board.jpg');
    });

    it('should have URLs for all player options', () => {
      PLAYER_OPTIONS.forEach(playerCount => {
        expect(BOARD_IMAGE_URLS[playerCount]).toBeDefined();
        expect(BOARD_IMAGE_URLS[playerCount]).toContain(`${playerCount}player_board`);
      });
    });

    it('should have valid image file extensions', () => {
      Object.values(BOARD_IMAGE_URLS).forEach(url => {
        expect(url).toMatch(/\.(jpg|png)$/i);
      });
    });
  });
});
