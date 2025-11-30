import { describe, it, expect } from 'vitest';
import { initializePlayers, initializePieces, PIECE_COUNTS_BY_PLAYER_COUNT } from './game';

describe('game logic', () => {
    describe('initializePlayers', () => {
        it('initializes correct number of players', () => {
            const players = initializePlayers(4);
            expect(players).toHaveLength(4);
            expect(players[0].id).toBe(1);
        });
    });

    describe('initializePieces', () => {
        it('initializes pieces for 4 players', () => {
            const pieces = initializePieces(4);
            // Check if pieces are created. Exact count depends on PIECE_COUNTS_BY_PLAYER_COUNT
            expect(pieces.length).toBeGreaterThan(0);
        });
    });
});
