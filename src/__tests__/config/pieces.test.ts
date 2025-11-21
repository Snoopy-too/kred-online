import { describe, it, expect } from 'vitest';
import { PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT } from '../../config/pieces';
import { PLAYER_OPTIONS } from '../../config/constants';

describe('Piece Configuration', () => {
  describe('PIECE_TYPES', () => {
    it('should have exactly 3 piece types', () => {
      const pieceTypes = Object.keys(PIECE_TYPES);
      expect(pieceTypes).toHaveLength(3);
    });

    it('should have MARK, HEEL, and PAWN', () => {
      expect(PIECE_TYPES.MARK).toBeDefined();
      expect(PIECE_TYPES.HEEL).toBeDefined();
      expect(PIECE_TYPES.PAWN).toBeDefined();
    });

    it('should have correct piece names', () => {
      expect(PIECE_TYPES.MARK.name).toBe('Mark');
      expect(PIECE_TYPES.HEEL.name).toBe('Heel');
      expect(PIECE_TYPES.PAWN.name).toBe('Pawn');
    });

    it('should have valid image URLs for all pieces', () => {
      Object.values(PIECE_TYPES).forEach(piece => {
        expect(piece.imageUrl).toBeDefined();
        expect(piece.imageUrl).toContain('./images/');
        expect(piece.imageUrl).toMatch(/\.(png|svg)$/i);
      });
    });

    it('should have transparent background images', () => {
      expect(PIECE_TYPES.MARK.imageUrl).toContain('transparent_bg');
      expect(PIECE_TYPES.HEEL.imageUrl).toContain('transparent_bg');
      expect(PIECE_TYPES.PAWN.imageUrl).toContain('transparent_bg');
    });
  });

  describe('PIECE_COUNTS_BY_PLAYER_COUNT', () => {
    it('should have piece counts for all player options', () => {
      PLAYER_OPTIONS.forEach(playerCount => {
        expect(PIECE_COUNTS_BY_PLAYER_COUNT[playerCount]).toBeDefined();
      });
    });

    it('should have counts for all piece types per player count', () => {
      PLAYER_OPTIONS.forEach(playerCount => {
        const counts = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount];
        expect(counts.MARK).toBeDefined();
        expect(counts.HEEL).toBeDefined();
        expect(counts.PAWN).toBeDefined();
      });
    });

    it('should have correct piece counts for 3 players', () => {
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[3].MARK).toBe(12);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[3].HEEL).toBe(9);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[3].PAWN).toBe(3);
    });

    it('should have correct piece counts for 4 players', () => {
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[4].MARK).toBe(14);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[4].HEEL).toBe(13);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[4].PAWN).toBe(4);
    });

    it('should have correct piece counts for 5 players', () => {
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[5].MARK).toBe(18);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[5].HEEL).toBe(17);
      expect(PIECE_COUNTS_BY_PLAYER_COUNT[5].PAWN).toBe(5);
    });

    it('should have total pieces equal to 24 for 3 players', () => {
      const counts = PIECE_COUNTS_BY_PLAYER_COUNT[3];
      const total = counts.MARK + counts.HEEL + counts.PAWN;
      expect(total).toBe(24);
    });

    it('should have total pieces equal to 31 for 4 players', () => {
      const counts = PIECE_COUNTS_BY_PLAYER_COUNT[4];
      const total = counts.MARK + counts.HEEL + counts.PAWN;
      expect(total).toBe(31);
    });

    it('should have total pieces equal to 40 for 5 players', () => {
      const counts = PIECE_COUNTS_BY_PLAYER_COUNT[5];
      const total = counts.MARK + counts.HEEL + counts.PAWN;
      expect(total).toBe(40);
    });

    it('should have increasing piece counts as player count increases', () => {
      const total3 = Object.values(PIECE_COUNTS_BY_PLAYER_COUNT[3]).reduce((a, b) => a + b, 0);
      const total4 = Object.values(PIECE_COUNTS_BY_PLAYER_COUNT[4]).reduce((a, b) => a + b, 0);
      const total5 = Object.values(PIECE_COUNTS_BY_PLAYER_COUNT[5]).reduce((a, b) => a + b, 0);

      expect(total4).toBeGreaterThan(total3);
      expect(total5).toBeGreaterThan(total4);
    });

    it('should have all positive piece counts', () => {
      PLAYER_OPTIONS.forEach(playerCount => {
        const counts = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount];
        Object.values(counts).forEach(count => {
          expect(count).toBeGreaterThan(0);
        });
      });
    });
  });
});
