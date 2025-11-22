// Barrel file for all configuration exports
// Centralized export point for all game configuration constants

// Basic game constants (player counts, tile counts, image URLs)
export * from './constants';

// Tile-specific configuration (images, kredcoin values)
export * from './tiles';

// Piece-specific configuration (types, counts by player count)
export * from './pieces';

// Board layout configuration (drop locations, spaces, rotations)
export * from './board';

// Game rules configuration (moves, tile requirements, rostrum rules)
export * from './rules';

// Bureaucracy phase configuration (menus for different player counts)
export * from './bureaucracy';
