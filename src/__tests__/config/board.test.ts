import { describe, it, expect } from 'vitest';
import { DROP_LOCATIONS_BY_PLAYER_COUNT } from '../../config/board';
import { PLAYER_OPTIONS } from '../../config/constants';

describe('DROP_LOCATIONS_BY_PLAYER_COUNT', () => {
  it('should have drop locations for all player counts', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      expect(DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount]).toBeDefined();
      expect(Array.isArray(DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount])).toBe(true);
    });
  });

  it('should have correct number of drop locations for 3 players', () => {
    const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[3];
    expect(locations.length).toBeGreaterThan(0);

    // 3 players: 18 seats (6 per player) + 6 rostrums (2 per player) + 3 offices + 18 community
    const expectedTotal = 18 + 6 + 3 + 18;
    expect(locations.length).toBe(expectedTotal);
  });

  it('should have correct number of drop locations for 4 players', () => {
    const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[4];
    expect(locations.length).toBeGreaterThan(0);

    // 4 players: 24 seats (6 per player) + 8 rostrums (2 per player) + 4 offices + 27 community
    const expectedTotal = 24 + 8 + 4 + 27;
    expect(locations.length).toBe(expectedTotal);
  });

  it('should have correct number of drop locations for 5 players', () => {
    const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[5];
    expect(locations.length).toBeGreaterThan(0);

    // 5 players: 30 seats (6 per player) + 10 rostrums (2 per player) + 5 offices + 40 community
    const expectedTotal = 30 + 10 + 5 + 40;
    expect(locations.length).toBe(expectedTotal);
  });

  it('should have unique IDs for all drop locations', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];
      const ids = locations.map(loc => loc.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  it('should have valid position coordinates (0-100)', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      locations.forEach(loc => {
        expect(loc.position.left).toBeGreaterThanOrEqual(0);
        expect(loc.position.left).toBeLessThanOrEqual(100);
        expect(loc.position.top).toBeGreaterThanOrEqual(0);
        expect(loc.position.top).toBeLessThanOrEqual(100);
      });
    });
  });

  it('should include seat locations for each player', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      // Check that each player has 6 seats
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerSeats = locations.filter(loc =>
          loc.id.startsWith(`p${playerId}_seat`)
        );
        expect(playerSeats.length).toBe(6);
      }
    });
  });

  it('should include rostrum locations for each player', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      // Check that each player has 2 rostrums
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerRostrums = locations.filter(loc =>
          loc.id.startsWith(`p${playerId}_rostrum`)
        );
        expect(playerRostrums.length).toBe(2);
      }
    });
  });

  it('should include office location for each player', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      // Check that each player has 1 office
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerOffice = locations.filter(loc =>
          loc.id === `p${playerId}_office`
        );
        expect(playerOffice.length).toBe(1);
      }
    });
  });

  it('should include community locations', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      const communityLocations = locations.filter(loc =>
        loc.id.includes('community')
      );

      expect(communityLocations.length).toBeGreaterThan(0);
    });
  });

  it('should have properly formatted location IDs', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      locations.forEach(loc => {
        expect(loc.id).toBeTruthy();
        expect(typeof loc.id).toBe('string');
        expect(loc.id.length).toBeGreaterThan(0);
      });
    });
  });
});
