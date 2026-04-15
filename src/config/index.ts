// Barrel file for all configuration exports
// Centralized export point for all game configuration constants

// Basic game constants (player counts, tile counts, image URLs)
export { ALERTS, TIMEOUTS, DEFAULTS, GAME_LOGS, TOTAL_TILES, PLAYER_OPTIONS, BOARD_IMAGE_URLS } from "./constants";

// Tile-specific configuration (images, kredcoin values)
export { TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES } from "./tiles";

// Piece-specific configuration (types, counts by player count)
export { PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT, DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT } from "./pieces";

// Board layout configuration (drop locations, spaces, rotations)
export { DROP_LOCATIONS_BY_PLAYER_COUNT, TILE_SPACES_BY_PLAYER_COUNT, BANK_SPACES_BY_PLAYER_COUNT, CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT, PLAYER_PERSPECTIVE_ROTATIONS } from "./board";

// Game rules configuration (moves, tile requirements, rostrum rules)
export { TilePlayOptionType, TILE_PLAY_OPTIONS, TILE_REQUIREMENTS, DEFINED_MOVES, WIN_CONDITIONS, ADJACENCY_RULES, ROSTRUM_RULES, ROSTRUM_SUPPORT_RULES, ROSTRUM_ADJACENCY_BY_PLAYER_COUNT, MOVEMENT_RULES, MOVE_VALIDATION_RULES } from "./rules";
export type { TilePlayOption } from "./rules";

// Bureaucracy phase configuration (menus for different player counts)
export { THREE_FOUR_PLAYER_BUREAUCRACY_MENU, FIVE_PLAYER_BUREAUCRACY_MENU } from "./bureaucracy";
