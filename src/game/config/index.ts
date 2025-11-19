/**
 * Game Configuration - Central Export
 * Re-exports all game configuration constants and definitions
 */

// Basic constants
export {
  PLAYER_OPTIONS,
  TOTAL_TILES,
  BOARD_IMAGE_URLS,
  PLAYER_PERSPECTIVE_ROTATIONS,
} from './constants';

// Piece configuration
export { PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT } from './pieces';

// Tile configuration
export { TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES } from './tiles';

// Board configuration
export {
  TILE_SPACES_BY_PLAYER_COUNT,
  BANK_SPACES_BY_PLAYER_COUNT,
  CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT,
} from './board-config';

// Board layouts
export {
  DROP_LOCATIONS_BY_PLAYER_COUNT,
  THREE_PLAYER_DROP_LOCATIONS,
  FOUR_PLAYER_DROP_LOCATIONS,
  FIVE_PLAYER_DROP_LOCATIONS,
} from './board-layouts';

// Move definitions
export {
  DEFINED_MOVES,
  TILE_PLAY_OPTIONS,
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
} from './moves';

// Tile requirements
export {
  TILE_REQUIREMENTS,
  getTileRequirements,
  tileHasRequirements,
} from './tile-requirements';

// Bureaucracy configuration
export {
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
  getBureaucracyMenuByPlayerCount,
} from './bureaucracy';
