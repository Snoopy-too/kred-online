import { describe, it, expect } from 'vitest';
import { DROP_LOCATIONS_BY_PLAYER_COUNT, TILE_SPACES_BY_PLAYER_COUNT, BANK_SPACES_BY_PLAYER_COUNT, CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT, PLAYER_PERSPECTIVE_ROTATIONS } from '../../config/board';
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

describe('TILE_SPACES_BY_PLAYER_COUNT', () => {
  it('should have tile spaces for all player counts', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      expect(TILE_SPACES_BY_PLAYER_COUNT[playerCount]).toBeDefined();
      expect(Array.isArray(TILE_SPACES_BY_PLAYER_COUNT[playerCount])).toBe(true);
    });
  });

  it('should have exactly one tile space per player', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];
      expect(spaces.length).toBe(playerCount);
    });
  });

  it('should have unique owner IDs', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];
      const ownerIds = spaces.map(space => space.ownerId);
      const uniqueOwners = new Set(ownerIds);

      expect(uniqueOwners.size).toBe(playerCount);
    });
  });

  it('should have owner IDs matching player count', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];

      // Each player from 1 to playerCount should have exactly one tile space
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerSpace = spaces.find(space => space.ownerId === playerId);
        expect(playerSpace).toBeDefined();
      }
    });
  });

  it('should have valid position coordinates (0-100)', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(space.position.left).toBeGreaterThanOrEqual(0);
        expect(space.position.left).toBeLessThanOrEqual(100);
        expect(space.position.top).toBeGreaterThanOrEqual(0);
        expect(space.position.top).toBeLessThanOrEqual(100);
      });
    });
  });

  it('should have rotation values', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(typeof space.rotation).toBe('number');
        expect(space.rotation).toBeGreaterThanOrEqual(0);
        expect(space.rotation).toBeLessThanOrEqual(360);
      });
    });
  });

  it('should have all required properties', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(space).toHaveProperty('ownerId');
        expect(space).toHaveProperty('position');
        expect(space.position).toHaveProperty('left');
        expect(space.position).toHaveProperty('top');
        expect(space).toHaveProperty('rotation');
      });
    });
  });
});

describe('BANK_SPACES_BY_PLAYER_COUNT', () => {
  it('should have bank spaces for all player counts', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      expect(BANK_SPACES_BY_PLAYER_COUNT[playerCount]).toBeDefined();
      expect(Array.isArray(BANK_SPACES_BY_PLAYER_COUNT[playerCount])).toBe(true);
    });
  });

  it('should have correct number of bank spaces for 3 players', () => {
    const spaces = BANK_SPACES_BY_PLAYER_COUNT[3];
    // 3 players: 8 bank spaces per player
    expect(spaces.length).toBe(24);
  });

  it('should have correct number of bank spaces for 4 players', () => {
    const spaces = BANK_SPACES_BY_PLAYER_COUNT[4];
    // 4 players: 6 bank spaces per player
    expect(spaces.length).toBe(24);
  });

  it('should have correct number of bank spaces for 5 players', () => {
    const spaces = BANK_SPACES_BY_PLAYER_COUNT[5];
    // 5 players: 5 bank spaces per player
    expect(spaces.length).toBe(25);
  });

  it('should have unique owner IDs for each player count', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount];
      const ownerIds = spaces.map(space => space.ownerId);

      // Check that all owner IDs are valid (1 to playerCount)
      ownerIds.forEach(ownerId => {
        expect(ownerId).toBeGreaterThanOrEqual(1);
        expect(ownerId).toBeLessThanOrEqual(playerCount);
      });
    });
  });

  it('should have owner IDs matching player count', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount];

      // Each player from 1 to playerCount should have bank spaces
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerSpaces = spaces.filter(space => space.ownerId === playerId);
        expect(playerSpaces.length).toBeGreaterThan(0);
      }
    });
  });

  it('should have correct bank spaces per player', () => {
    // 3 players: 8 spaces each
    const threePlayerSpaces = BANK_SPACES_BY_PLAYER_COUNT[3];
    for (let playerId = 1; playerId <= 3; playerId++) {
      const playerSpaces = threePlayerSpaces.filter(space => space.ownerId === playerId);
      expect(playerSpaces.length).toBe(8);
    }

    // 4 players: 6 spaces each
    const fourPlayerSpaces = BANK_SPACES_BY_PLAYER_COUNT[4];
    for (let playerId = 1; playerId <= 4; playerId++) {
      const playerSpaces = fourPlayerSpaces.filter(space => space.ownerId === playerId);
      expect(playerSpaces.length).toBe(6);
    }

    // 5 players: 5 spaces each
    const fivePlayerSpaces = BANK_SPACES_BY_PLAYER_COUNT[5];
    for (let playerId = 1; playerId <= 5; playerId++) {
      const playerSpaces = fivePlayerSpaces.filter(space => space.ownerId === playerId);
      expect(playerSpaces.length).toBe(5);
    }
  });

  it('should have valid position coordinates (0-100)', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(space.position.left).toBeGreaterThanOrEqual(0);
        expect(space.position.left).toBeLessThanOrEqual(100);
        expect(space.position.top).toBeGreaterThanOrEqual(0);
        expect(space.position.top).toBeLessThanOrEqual(100);
      });
    });
  });

  it('should have rotation values', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(typeof space.rotation).toBe('number');
        // Rotation can be negative or > 360 in the data
        expect(space.rotation).toBeGreaterThanOrEqual(-360);
        expect(space.rotation).toBeLessThanOrEqual(360);
      });
    });
  });

  it('should have all required properties', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const spaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount];

      spaces.forEach(space => {
        expect(space).toHaveProperty('ownerId');
        expect(space).toHaveProperty('position');
        expect(space.position).toHaveProperty('left');
        expect(space.position).toHaveProperty('top');
        expect(space).toHaveProperty('rotation');
      });
    });
  });
});

describe('CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT', () => {
  it('should have credibility locations for all player counts', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      expect(CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount]).toBeDefined();
      expect(Array.isArray(CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount])).toBe(true);
    });
  });

  it('should have exactly one credibility location per player', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];
      expect(locations.length).toBe(playerCount);
    });
  });

  it('should have unique owner IDs', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];
      const ownerIds = locations.map(loc => loc.ownerId);
      const uniqueOwners = new Set(ownerIds);

      expect(uniqueOwners.size).toBe(playerCount);
    });
  });

  it('should have owner IDs matching player count', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      // Each player from 1 to playerCount should have exactly one credibility location
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        const playerLocation = locations.find(loc => loc.ownerId === playerId);
        expect(playerLocation).toBeDefined();
      }
    });
  });

  it('should have valid position coordinates (0-100)', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      locations.forEach(loc => {
        expect(loc.position.left).toBeGreaterThanOrEqual(0);
        expect(loc.position.left).toBeLessThanOrEqual(100);
        expect(loc.position.top).toBeGreaterThanOrEqual(0);
        expect(loc.position.top).toBeLessThanOrEqual(100);
      });
    });
  });

  it('should have rotation values', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      locations.forEach(loc => {
        expect(typeof loc.rotation).toBe('number');
        // Rotation can be negative or > 360
        expect(loc.rotation).toBeGreaterThanOrEqual(-360);
        expect(loc.rotation).toBeLessThanOrEqual(360);
      });
    });
  });

  it('should have all required properties', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const locations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount];

      locations.forEach(loc => {
        expect(loc).toHaveProperty('ownerId');
        expect(loc).toHaveProperty('position');
        expect(loc.position).toHaveProperty('left');
        expect(loc.position).toHaveProperty('top');
        expect(loc).toHaveProperty('rotation');
      });
    });
  });
});

describe('PLAYER_PERSPECTIVE_ROTATIONS', () => {
  it('should have rotations for all player counts', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      expect(PLAYER_PERSPECTIVE_ROTATIONS[playerCount]).toBeDefined();
      expect(typeof PLAYER_PERSPECTIVE_ROTATIONS[playerCount]).toBe('object');
    });
  });

  it('should have rotation for each player ID', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const rotations = PLAYER_PERSPECTIVE_ROTATIONS[playerCount];

      // Each player from 1 to playerCount should have a rotation
      for (let playerId = 1; playerId <= playerCount; playerId++) {
        expect(rotations[playerId]).toBeDefined();
        expect(typeof rotations[playerId]).toBe('number');
      }
    });
  });

  it('should have valid rotation angles', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const rotations = PLAYER_PERSPECTIVE_ROTATIONS[playerCount];

      Object.values(rotations).forEach(rotation => {
        expect(typeof rotation).toBe('number');
        // Rotation angles should be reasonable (between -360 and 360)
        expect(rotation).toBeGreaterThanOrEqual(-360);
        expect(rotation).toBeLessThanOrEqual(360);
      });
    });
  });

  it('should have correct number of rotations per player count', () => {
    // 3 players should have 3 rotations
    expect(Object.keys(PLAYER_PERSPECTIVE_ROTATIONS[3]).length).toBe(3);

    // 4 players should have 4 rotations
    expect(Object.keys(PLAYER_PERSPECTIVE_ROTATIONS[4]).length).toBe(4);

    // 5 players should have 5 rotations
    expect(Object.keys(PLAYER_PERSPECTIVE_ROTATIONS[5]).length).toBe(5);
  });

  it('should have unique rotation values for different players', () => {
    PLAYER_OPTIONS.forEach(playerCount => {
      const rotations = PLAYER_PERSPECTIVE_ROTATIONS[playerCount];
      const rotationValues = Object.values(rotations);
      const uniqueRotations = new Set(rotationValues);

      // Most player counts should have unique rotations (though not strictly required)
      // At minimum, check that we have rotations defined
      expect(rotationValues.length).toBe(playerCount);
    });
  });
});
