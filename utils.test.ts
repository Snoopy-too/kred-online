import { describe, it, expect } from 'vitest';
import {
    getPlayerName,
    getPlayerNameSimple,
    getPlayerById,
    formatWinnerNames,
    isPlayerDomain,
    isCommunityLocation
} from './src/utils';
import { Player } from './src/types';

describe('utils', () => {
    const mockPlayers: Player[] = [
        { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 10 },
        { id: 2, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 10 },
    ];

    describe('getPlayerName', () => {
        it('returns player name if player exists', () => {
            expect(getPlayerName(mockPlayers[0], 1)).toBe('Player 1');
        });

        it('returns fallback if player is undefined', () => {
            expect(getPlayerName(undefined, 3)).toBe('Player 3');
        });
    });

    describe('getPlayerNameSimple', () => {
        it('returns player name if player exists', () => {
            expect(getPlayerNameSimple(mockPlayers[0])).toBe('Player');
        });

        it('returns default fallback if player is undefined', () => {
            expect(getPlayerNameSimple(undefined)).toBe('Player');
        });

        it('returns custom fallback if provided', () => {
            expect(getPlayerNameSimple(undefined, 'Unknown')).toBe('Unknown');
        });
    });

    describe('getPlayerById', () => {
        it('returns player if found', () => {
            expect(getPlayerById(mockPlayers, 1)).toEqual(mockPlayers[0]);
        });

        it('returns undefined if not found', () => {
            expect(getPlayerById(mockPlayers, 3)).toBeUndefined();
        });
    });

    describe('isPlayerDomain', () => {
        it('returns true for player domain locations', () => {
            expect(isPlayerDomain('p1_seat1', 1)).toBe(true);
        });

        it('returns false for other player domain locations', () => {
            expect(isPlayerDomain('p2_seat1', 1)).toBe(false);
        });

        it('returns false for community locations', () => {
            expect(isPlayerDomain('community_1', 1)).toBe(false);
        });
    });

    describe('isCommunityLocation', () => {
        it('returns true for community locations', () => {
            expect(isCommunityLocation('community_1')).toBe(true);
        });

        it('returns false for player locations', () => {
            expect(isCommunityLocation('p1_seat1')).toBe(false);
        });
    });
});
