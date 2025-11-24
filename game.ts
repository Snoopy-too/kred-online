// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces (marks, heels, pawns)
  Piece,
  GamePieceInfo,

  // Tile types - game tiles and tile spaces
  Tile,
  BoardTile,
  TileReceivingSpace,

  // Player types - player data structures
  Player,

  // Game state types - phases and locations
  GameState,
  DropLocation,
  BankSpace,

  // Move tracking types - move validation and tracking
  TrackedMove,
  DefinedMove,

  // Bureaucracy types - bureaucracy phase data structures
  BureaucracyItemType,
  BureaucracyMoveType,
  PromotionLocationType,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,

  // Challenge types - challenge system data structures
  ChallengeState,

  // Played tile types - tile play tracking
  PlayedTileState,
} from "./src/types";

// Enum/value imports that are used at runtime (not just for typing)
import { DefinedMoveType, MoveRequirementType } from "./src/types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  // Basic constants - player counts, tile counts, board images
  TOTAL_TILES,
  PLAYER_OPTIONS,
  BOARD_IMAGE_URLS,

  // Tile configuration - images and kredcoin values
  TILE_IMAGE_URLS,
  TILE_KREDCOIN_VALUES,

  // Piece configuration - types and counts by player count
  PIECE_TYPES,
  PIECE_COUNTS_BY_PLAYER_COUNT,

  // Board layout - drop locations by player count
  DROP_LOCATIONS_BY_PLAYER_COUNT,

  // Game rules - move definitions, tile requirements, rostrum rules
  DEFINED_MOVES,
  TilePlayOptionType,
  TilePlayOption,
  TILE_PLAY_OPTIONS,
  TileRequirement,
  TILE_REQUIREMENTS,
  RostrumSupport,
  PlayerRostrum,
  ROSTRUM_SUPPORT_RULES,
  RostrumAdjacency,
  ROSTRUM_ADJACENCY_BY_PLAYER_COUNT,

  // Bureaucracy configuration - menus for different player counts
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
} from "./src/config";

// ============================================================================
// UTILITY IMPORTS - Helper functions for positioning, formatting, etc.
// ============================================================================
import {
  // Positioning utilities - coordinate and rotation calculations
  BOARD_CENTERS,
  isPositionInCommunityCircle,
  calculatePieceRotation,
} from "./src/utils/positioning";

import {
  // Formatting utilities - display string formatting
  formatLocationId,
} from "./src/utils/formatting";

import {
  // Array utilities - array manipulation helpers
  shuffle,
} from "./src/utils/array";

// ============================================================================
// GAME LOGIC IMPORTS - Core game functions
// ============================================================================
import {
  // Initialization functions - player and piece setup
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,

  // State snapshot functions - game state management and challenge order
  createGameStateSnapshot,
  getChallengeOrder,

  // Location utilities - position and location ID management
  findNearestVacantLocation,
  getLocationIdFromPosition,
  getPlayerIdFromLocationId,
  isLocationOwnedByPlayer,
} from "./src/game";

// ============================================================================
// RULES IMPORTS - Game rules enforcement
// ============================================================================
import {
  // Credibility system - credibility loss and deduction
  deductCredibility,
  handleCredibilityLoss,

  // Win conditions - game victory checking
  checkPlayerWinCondition,
  checkBureaucracyWinCondition,

  // Adjacency rules - seat and player positioning logic
  getNextPlayerClockwise,
  getPrevPlayerClockwise,
  areSeatsAdjacent,
  getAdjacentSeats,
  canMoveFromCommunity,

  // Rostrum rules - support requirements and adjacency
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  countPiecesInPlayerRostrums,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement,
} from "./src/rules";

// Re-export game functions for backwards compatibility
export {
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
  createGameStateSnapshot,
  getChallengeOrder,
  findNearestVacantLocation,
  getLocationIdFromPosition,
  getPlayerIdFromLocationId,
  isLocationOwnedByPlayer,
  deductCredibility,
  handleCredibilityLoss,
  checkPlayerWinCondition,
  checkBureaucracyWinCondition,
  getNextPlayerClockwise,
  getPrevPlayerClockwise,
  areSeatsAdjacent,
  getAdjacentSeats,
  canMoveFromCommunity,
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  countPiecesInPlayerRostrums,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement,
};

// --- Type Definitions ---
// (Tile types moved to src/types/tile.ts)
// (Player type moved to src/types/player.ts)
// (GameState, DropLocation, BankSpace moved to src/types/game.ts)
// (Move types moved to src/types/move.ts)




// These are the ONLY valid drop locations for pieces.
const THREE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: "p1_seat1", position: { left: 48.25, top: 29.91 } },
  { id: "p1_seat2", position: { left: 43.87, top: 32.62 } },
  { id: "p1_seat3", position: { left: 39.96, top: 35.65 } },
  { id: "p1_seat4", position: { left: 38.17, top: 39.19 } },
  { id: "p1_seat5", position: { left: 37.3, top: 43.94 } },
  { id: "p1_seat6", position: { left: 37.73, top: 48.54 } },
  // Player 3 Seats
  { id: "p3_seat1", position: { left: 40.17, top: 53.08 } },
  { id: "p3_seat2", position: { left: 44.01, top: 56.13 } },
  { id: "p3_seat3", position: { left: 48.46, top: 58.4 } },
  { id: "p3_seat4", position: { left: 52.92, top: 58.18 } },
  { id: "p3_seat5", position: { left: 57.71, top: 56.27 } },
  { id: "p3_seat6", position: { left: 60.96, top: 53.51 } },
  // Player 2 Seats
  { id: "p2_seat1", position: { left: 63.98, top: 48.83 } },
  { id: "p2_seat2", position: { left: 64.61, top: 44.16 } },
  { id: "p2_seat3", position: { left: 63.76, top: 39.48 } },
  { id: "p2_seat4", position: { left: 61.83, top: 35.25 } },
  { id: "p2_seat5", position: { left: 57.39, top: 32.89 } },
  { id: "p2_seat6", position: { left: 53.51, top: 30.86 } },
  // Rostrums
  { id: "p1_rostrum1", position: { left: 46.64, top: 22.25 } },
  { id: "p1_rostrum2", position: { left: 29.84, top: 51.31 } },
  { id: "p3_rostrum1", position: { left: 35.89, top: 59.51 } },
  { id: "p3_rostrum2", position: { left: 66.07, top: 58.91 } },
  { id: "p2_rostrum1", position: { left: 72.2, top: 52.48 } },
  { id: "p2_rostrum2", position: { left: 54.82, top: 22.39 } },
  // Offices
  { id: "p1_office", position: { left: 31.95, top: 25.01 } },
  { id: "p2_office", position: { left: 76.22, top: 36.38 } },
  { id: "p3_office", position: { left: 44.03, top: 68.87 } },
  // Community (18 spaces with proper spacing - no overlap with seats)
  // Middle row (top: 46.0-47.8%)
  { id: "community1", position: { left: 53.5, top: 47.8 } },
  { id: "community2", position: { left: 43.7, top: 47.7 } },
  { id: "community3", position: { left: 57.0, top: 46.0 } },
  // Top row (top: 38.0%)
  { id: "community4", position: { left: 45.2, top: 38.0 } },
  { id: "community5", position: { left: 48.7, top: 38.0 } },
  { id: "community6", position: { left: 52.2, top: 38.0 } },
  { id: "community7", position: { left: 55.7, top: 38.0 } },
  // Second row (top: 42.0%)
  { id: "community8", position: { left: 45.2, top: 42.0 } },
  { id: "community9", position: { left: 48.7, top: 42.0 } },
  { id: "community10", position: { left: 52.2, top: 42.0 } },
  { id: "community11", position: { left: 55.7, top: 42.0 } },
  { id: "community12", position: { left: 50.4, top: 46.0 } },
  // Bottom row (top: 50.0%)
  { id: "community13", position: { left: 46.9, top: 50.0 } },
  { id: "community14", position: { left: 50.4, top: 50.0 } },
  { id: "community15", position: { left: 53.9, top: 50.0 } },
  // Additional locations
  { id: "community16", position: { left: 43.78, top: 44.51 } },
  { id: "community17", position: { left: 42.53, top: 42.85 } },
  { id: "community18", position: { left: 56.7, top: 49.51 } },
];

const FOUR_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats
  { id: "p1_seat1", position: { left: 42.83, top: 34.48 } },
  { id: "p1_seat2", position: { left: 38.61, top: 37.35 } },
  { id: "p1_seat3", position: { left: 34.17, top: 40.5 } },
  { id: "p1_seat4", position: { left: 32.71, top: 44.47 } },
  { id: "p1_seat5", position: { left: 31.02, top: 48.79 } },
  { id: "p1_seat6", position: { left: 31.35, top: 53.4 } },
  // Player 2 Seats
  { id: "p2_seat1", position: { left: 67.62, top: 43.57 } },
  { id: "p2_seat2", position: { left: 65.14, top: 40.54 } },
  { id: "p2_seat3", position: { left: 61.43, top: 37.35 } },
  { id: "p2_seat4", position: { left: 57.09, top: 35.33 } },
  { id: "p2_seat5", position: { left: 52.92, top: 33.52 } },
  { id: "p2_seat6", position: { left: 47.56, top: 33.52 } },
  // Player 3 Seats
  { id: "p3_seat1", position: { left: 57.95, top: 67.5 } },
  { id: "p3_seat2", position: { left: 61.73, top: 64.99 } },
  { id: "p3_seat3", position: { left: 65.4, top: 61.7 } },
  { id: "p3_seat4", position: { left: 67.52, top: 58.18 } },
  { id: "p3_seat5", position: { left: 68.34, top: 53.61 } },
  { id: "p3_seat6", position: { left: 68.88, top: 48.94 } },
  // Player 4 Seats
  { id: "p4_seat1", position: { left: 32.2, top: 57.97 } },
  { id: "p4_seat2", position: { left: 35.09, top: 62.22 } },
  { id: "p4_seat3", position: { left: 39.21, top: 64.77 } },
  { id: "p4_seat4", position: { left: 43.03, top: 67.22 } },
  { id: "p4_seat5", position: { left: 46.92, top: 68.21 } },
  { id: "p4_seat6", position: { left: 52.66, top: 69.13 } },
  // Rostrums
  { id: "p1_rostrum1", position: { left: 40.31, top: 27.68 } },
  { id: "p1_rostrum2", position: { left: 23.87, top: 55.0 } },
  { id: "p2_rostrum1", position: { left: 74.82, top: 42.08 } },
  { id: "p2_rostrum2", position: { left: 46.43, top: 26.51 } },
  { id: "p3_rostrum1", position: { left: 60.03, top: 74.66 } },
  { id: "p3_rostrum2", position: { left: 76.36, top: 47.34 } },
  { id: "p4_rostrum1", position: { left: 25.18, top: 59.71 } },
  { id: "p4_rostrum2", position: { left: 54.14, top: 75.72 } },
  // Offices
  { id: "p1_office", position: { left: 18.18, top: 44.34 } },
  { id: "p2_office", position: { left: 55.99, top: 19.63 } },
  { id: "p3_office", position: { left: 82.55, top: 55.08 } },
  { id: "p4_office", position: { left: 44.43, top: 79.79 } },
  // Community (27 spaces in a grid)
  { id: "community1", position: { left: 44.7, top: 41.6 } },
  { id: "community2", position: { left: 48.2, top: 41.6 } },
  { id: "community3", position: { left: 51.7, top: 41.6 } },
  { id: "community4", position: { left: 55.2, top: 41.6 } },
  { id: "community5", position: { left: 44.7, top: 45.6 } },
  { id: "community6", position: { left: 48.2, top: 45.6 } },
  { id: "community7", position: { left: 51.7, top: 45.6 } },
  { id: "community8", position: { left: 55.2, top: 45.6 } },
  { id: "community9", position: { left: 44.7, top: 49.6 } },
  { id: "community10", position: { left: 48.2, top: 49.6 } },
  { id: "community11", position: { left: 51.7, top: 49.6 } },
  { id: "community12", position: { left: 55.2, top: 49.6 } },
  { id: "community13", position: { left: 44.7, top: 53.6 } },
  { id: "community14", position: { left: 48.2, top: 53.6 } },
  { id: "community15", position: { left: 51.7, top: 53.6 } },
  { id: "community16", position: { left: 55.2, top: 53.6 } },
  { id: "community17", position: { left: 44.7, top: 57.6 } },
  { id: "community18", position: { left: 48.2, top: 57.6 } },
  { id: "community19", position: { left: 51.7, top: 57.6 } },
  { id: "community20", position: { left: 55.2, top: 57.6 } },
  { id: "community21", position: { left: 59.1, top: 45.25 } },
  { id: "community22", position: { left: 59.1, top: 49.84 } },
  { id: "community23", position: { left: 59.1, top: 54.43 } },
  { id: "community24", position: { left: 59.1, top: 58.14 } },
  { id: "community25", position: { left: 40.14, top: 46.03 } },
  { id: "community26", position: { left: 40.14, top: 50.62 } },
  { id: "community27", position: { left: 40.14, top: 54.13 } },
];

const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
  // Player 1 Seats (pushed 2% outward from center for better spacing)
  { id: "p1_seat1", position: { left: 29.48, top: 44.06 } },
  { id: "p1_seat2", position: { left: 29.4, top: 47.67 } },
  { id: "p1_seat3", position: { left: 29.52, top: 51.79 } },
  { id: "p1_seat4", position: { left: 31.25, top: 54.83 } },
  { id: "p1_seat5", position: { left: 33.33, top: 58.19 } },
  { id: "p1_seat6", position: { left: 36.33, top: 60.69 } },
  // Player 2 Seats
  { id: "p2_seat1", position: { left: 45.22, top: 29.89 } },
  { id: "p2_seat2", position: { left: 41.42, top: 30.76 } },
  { id: "p2_seat3", position: { left: 38.06, top: 32.07 } },
  { id: "p2_seat4", position: { left: 34.6, top: 34.12 } },
  { id: "p2_seat5", position: { left: 32.85, top: 37.7 } },
  { id: "p2_seat6", position: { left: 29.56, top: 40.64 } },
  // Player 3 Seats
  { id: "p3_seat1", position: { left: 64.67, top: 39.1 } },
  { id: "p3_seat2", position: { left: 62.59, top: 35.96 } },
  { id: "p3_seat3", position: { left: 59.41, top: 32.49 } },
  { id: "p3_seat4", position: { left: 56.34, top: 31.2 } },
  { id: "p3_seat5", position: { left: 52.8, top: 29.57 } },
  { id: "p3_seat6", position: { left: 49.06, top: 29.24 } },
  // Player 4 Seats
  { id: "p4_seat1", position: { left: 60.93, top: 59.49 } },
  { id: "p4_seat2", position: { left: 63.28, top: 56.67 } },
  { id: "p4_seat3", position: { left: 65.38, top: 53.53 } },
  { id: "p4_seat4", position: { left: 66.52, top: 50.17 } },
  { id: "p4_seat5", position: { left: 66.52, top: 46.05 } },
  { id: "p4_seat6", position: { left: 65.71, top: 42.47 } },
  // Player 5 Seats
  { id: "p5_seat1", position: { left: 39.34, top: 62.96 } },
  { id: "p5_seat2", position: { left: 42.93, top: 64.04 } },
  { id: "p5_seat3", position: { left: 46.75, top: 65.24 } },
  { id: "p5_seat4", position: { left: 50.8, top: 65.35 } },
  { id: "p5_seat5", position: { left: 54.96, top: 63.72 } },
  { id: "p5_seat6", position: { left: 58.31, top: 61.88 } },
  // Rostrums
  { id: "p1_rostrum1", position: { left: 24.89, top: 45.32 } },
  { id: "p1_rostrum2", position: { left: 31.85, top: 62.83 } },
  { id: "p2_rostrum1", position: { left: 42.56, top: 26.12 } },
  { id: "p2_rostrum2", position: { left: 27.08, top: 37.39 } },
  { id: "p3_rostrum1", position: { left: 67.86, top: 35.44 } },
  { id: "p3_rostrum2", position: { left: 51.37, top: 25.22 } },
  { id: "p4_rostrum1", position: { left: 65.36, top: 61.27 } },
  { id: "p4_rostrum2", position: { left: 70.77, top: 43.3 } },
  { id: "p5_rostrum1", position: { left: 39.17, top: 67.54 } },
  { id: "p5_rostrum2", position: { left: 58.79, top: 66.69 } },
  // Offices
  { id: "p1_office", position: { left: 15.7, top: 44.75 } },
  { id: "p2_office", position: { left: 39.45, top: 17.1 } },
  { id: "p3_office", position: { left: 75.18, top: 29.31 } },
  { id: "p4_office", position: { left: 72.89, top: 65.24 } },
  { id: "p5_office", position: { left: 36.22, top: 74.7 } },
  // Community (40 spaces in organized grid - shifted southwest for better centering)
  // Row 1 (top: 39.40)
  { id: "community1", position: { left: 36.5, top: 39.4 } },
  { id: "community2", position: { left: 40.0, top: 39.4 } },
  { id: "community3", position: { left: 43.5, top: 39.4 } },
  { id: "community4", position: { left: 47.0, top: 39.4 } },
  { id: "community5", position: { left: 50.5, top: 39.4 } },
  { id: "community6", position: { left: 54.0, top: 39.4 } },
  { id: "community7", position: { left: 57.5, top: 39.4 } },
  // Row 2 (top: 43.40)
  { id: "community8", position: { left: 38.25, top: 43.4 } },
  { id: "community9", position: { left: 41.75, top: 43.4 } },
  { id: "community10", position: { left: 45.25, top: 43.4 } },
  { id: "community11", position: { left: 48.75, top: 43.4 } },
  { id: "community12", position: { left: 52.25, top: 43.4 } },
  { id: "community13", position: { left: 55.75, top: 43.4 } },
  // Row 3 (top: 47.40)
  { id: "community14", position: { left: 36.5, top: 47.4 } },
  { id: "community15", position: { left: 40.0, top: 47.4 } },
  { id: "community16", position: { left: 43.5, top: 47.4 } },
  { id: "community17", position: { left: 47.0, top: 47.4 } },
  { id: "community18", position: { left: 50.5, top: 47.4 } },
  { id: "community19", position: { left: 54.0, top: 47.4 } },
  { id: "community20", position: { left: 57.5, top: 47.4 } },
  // Row 4 (top: 51.40)
  { id: "community21", position: { left: 38.25, top: 51.4 } },
  { id: "community22", position: { left: 41.75, top: 51.4 } },
  { id: "community23", position: { left: 45.25, top: 51.4 } },
  { id: "community24", position: { left: 48.75, top: 51.4 } },
  { id: "community25", position: { left: 52.25, top: 51.4 } },
  { id: "community26", position: { left: 55.75, top: 51.4 } },
  // Row 5 (top: 55.40)
  { id: "community27", position: { left: 36.5, top: 55.4 } },
  { id: "community28", position: { left: 40.0, top: 55.4 } },
  { id: "community29", position: { left: 43.5, top: 55.4 } },
  { id: "community30", position: { left: 47.0, top: 55.4 } },
  { id: "community31", position: { left: 50.5, top: 55.4 } },
  { id: "community32", position: { left: 54.0, top: 55.4 } },
  { id: "community33", position: { left: 57.5, top: 55.4 } },
  // Row 6 (top: 59.40)
  { id: "community34", position: { left: 38.25, top: 59.4 } },
  { id: "community35", position: { left: 41.75, top: 59.4 } },
  { id: "community36", position: { left: 45.25, top: 59.4 } },
  { id: "community37", position: { left: 48.75, top: 59.4 } },
  { id: "community38", position: { left: 52.25, top: 59.4 } },
  { id: "community39", position: { left: 55.75, top: 59.4 } },
  // Extra space (centered at bottom)
  { id: "community40", position: { left: 47.0, top: 62.9 } },
];

export const DROP_LOCATIONS_BY_PLAYER_COUNT: {
  [playerCount: number]: DropLocation[];
} = {
  3: THREE_PLAYER_DROP_LOCATIONS,
  4: FOUR_PLAYER_DROP_LOCATIONS,
  5: FIVE_PLAYER_DROP_LOCATIONS,
};

/**
 * BASE GAME RULES - Piece Movement Restrictions
 *
 * 1. ROSTRUM OCCUPATION:
 *    - A piece can only be moved to a rostrum if ALL 3 supporting seats are full
 *    - If all 3 supporting seats become vacant, the piece must be moved to a supporting seat
 *
 * 2. OFFICE OCCUPATION:
 *    - A piece can only be moved to a player's office if BOTH of that player's rostrums are filled
 *    - Once in an office, a piece can only be moved by that office's owner
 *
 * 3. PROTECTED MOVEMENT:
 *    - Opponents CANNOT move a piece from a player's seats into that player's rostrums
 *    - Opponents CANNOT move a piece from a player's rostrums or offices (pieces in these are protected)
 *    - Only the owner of a piece can move it from their own rostrums or offices
 *
 * 4. ADJACENCY MOVEMENT:
 *    - Pieces can be moved directly between adjacent rostrums
 *    - Movement must still respect the supporting seat requirements of the destination rostrum
 *    - Only the owner can initiate moves from their own rostrums
 *
 * 5. COMMUNITY SPACES:
 *    - Any player can move any piece to community spaces (unless otherwise blocked by other rules)
 */

/**
 * DEFINED MOVES - Action Types Available to Players
 *
 * These moves are triggered by playing tiles and define the specific actions a player can take.
 * Each move has specific restrictions based on whose turn it is and game state.
 *
 * Legend:
 *   (M) = Mandatory Action - Must be performed (with limited choices in some cases)
 *   (O) = Optional Action - Can choose to perform or not
 *
 * =====================================================================
 * (O) REMOVE - Take a piece from opponent's domain, return to community
 * =====================================================================
 * Description: Remove a Mark or Heel from a seat in an opponent's domain and return it to the community.
 *
 * Restrictions:
 *   - Can only target opponent's seats (not rostrums or offices)
 *   - Piece is returned to community spaces
 *   - Only the seat must be vacant for placement
 *
 * =====================================================================
 * (M) ADVANCE - Player's choice of ONE of three options
 * =====================================================================
 * Description: Move a piece in the player's own domain, with three possible routes:
 *
 * Option A: Take a piece from community → add to open seat in own domain
 *   - Seat must be vacant
 *   - Piece comes from community spaces
 *
 * Option B: Take a piece from own seat → place in supporting Rostrum
 *   - All 3 supporting seats must be full
 *   - Piece moves from seat to its supporting rostrum
 *
 * Option C: Take a piece from own Rostrum → place in own Office
 *   - Both rostrums must be filled
 *   - Piece moves from rostrum to office
 *   - Only owner can perform this
 *
 * =====================================================================
 * (O) INFLUENCE - Move opponent's piece to adjacent location
 * =====================================================================
 * Description: Move another player's piece along the adjacency chain:
 *
 * Option A: From seat to adjacent seat
 *   - Adjacent seats can be in any player's domain
 *   - Destination seat must be vacant
 *
 * Option B: From opponent's Rostrum to adjacent Rostrum
 *   - Destination rostrum must be owned by opponent (per adjacency rules)
 *   - All supporting seats of destination must be full
 *   - Piece ownership doesn't change
 *
 * =====================================================================
 * (O) ASSIST - Add piece from community to opponent's vacant seat
 * =====================================================================
 * Description: Help an opponent by placing a piece from community into their vacant seat.
 *
 * Restrictions:
 *   - Target seat must be vacant
 *   - Target seat must be in opponent's domain
 *   - Piece comes from community
 *
 * =====================================================================
 * (M) WITHDRAW - Must move piece OUT of domain (or skip if domain is empty)
 * =====================================================================
 * Description: Mandatory action to move a piece out, moving pieces DOWN the hierarchy:
 *
 * One of three options (UNLESS player has 0 pieces in their domain):
 *
 * Option A: From own Office → to vacant Rostrum in own domain
 *   - Only owner can initiate
 *   - Destination rostrum must be vacant
 *
 * Option B: From own Rostrum → to vacant Seat in own domain
 *   - Only owner can initiate
 *   - Destination seat must be vacant
 *   - Does NOT require supporting seats to be full (moving down is always allowed)
 *
 * Option C: From own Seat → to Community
 *   - Only owner can initiate
 *   - Seat can be any in the domain
 *   - Returns piece to community spaces
 *
 * =====================================================================
 * (M) ORGANIZE - Must move piece to adjacent location
 * =====================================================================
 * Description: Mandatory action to move a piece to an adjacent location:
 *
 * Option A: From own Seat → to adjacent Seat
 *   - Adjacent seat can be in any player's domain
 *   - Destination seat must be vacant
 *
 * Option B: From own Rostrum → to adjacent Rostrum
 *   - Adjacent rostrum is in an opponent's domain
 *   - All supporting seats of destination must be full
 */
// (DefinedMoveType, MoveRequirementType, DefinedMove moved to src/types/move.ts)

// (DEFINED_MOVES moved to src/config/rules.ts)

/**
 * TILE PLAY OPTIONS - What a Player Can Do When Challenged
 *
 * When a player plays a tile to another player, the receiving player initially has ONE of
 * these four options available to them, pending any rejection challenges.
 *
 * The receiving player selects ONE option from below:
 *
 * a. NO MOVE - Do nothing. The tile play is complete.
 *
 * b. ONE "O" MOVE - Execute one Optional move (REMOVE, INFLUENCE, or ASSIST).
 *    Examples: Remove opponent's piece, move opponent's piece via adjacency, or assist opponent.
 *
 * c. ONE "M" MOVE - Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE).
 *    Examples: Move piece up the hierarchy, move piece down, or move to adjacent location.
 *
 * d. ONE "O" MOVE AND ONE "M" MOVE - Execute one Optional move AND one Mandatory move.
 *    Examples: Remove + Organize, Influence + Advance, Assist + Withdraw, etc.
 *
 * Note: After executing their chosen option(s), the receiving player is then eligible to
 * reject or challenge the tile play (mechanisms to be implemented later).
 */
// (TilePlayOptionType, TilePlayOption, TILE_PLAY_OPTIONS moved to src/config/rules.ts)

/**
 * Helper function to check if a move type is allowed within a tile play option.
 * @param moveType The move type to check.
 * @param optionType The tile play option selected.
 * @returns True if the move type is allowed within that option.
 */
export function isMoveAllowedInTilePlayOption(
  moveType: DefinedMoveType,
  optionType: TilePlayOptionType
): boolean {
  const option = TILE_PLAY_OPTIONS[optionType];
  if (!option) return false;
  return option.allowedMoveTypes.includes(moveType);
}

/**
 * Helper function to determine if a move is Optional or Mandatory.
 * @param moveType The move type to classify.
 * @returns The MoveRequirementType of this move.
 */
export function getMoveRequirement(
  moveType: DefinedMoveType
): MoveRequirementType {
  const move = DEFINED_MOVES[moveType];
  return move ? move.requirement : MoveRequirementType.OPTIONAL;
}

/**
 * TILE REQUIREMENTS - Specific Moves Required by Each Tile
 *
 * Each tile (except the Blank tile) requires specific move(s) to be made by the receiving player.
 *
 * CRITICAL RULES:
 * 1. If a tile's requirements are played correctly by the player, it CANNOT be rejected.
 * 2. A correctly played tile is NOT AFFECTED by challenges.
 * 3. If the board state makes one or both requirements impossible to execute, the tile also
 *    CANNOT be rejected and is NOT AFFECTED by challenges.
 * 4. The BLANK TILE (5-player mode only) requires the player to make NO moves.
 *    - If they make ANY moves with the blank tile, those moves ARE AFFECTED by rejection/challenges.
 * 5. All requirements must be completed for the tile to be unrejectable.
 *    - If only some requirements are met, the tile can be rejected.
 */
// (TileRequirement, TILE_REQUIREMENTS moved to src/config/rules.ts)

/**
 * Gets the tile requirements for a specific tile ID.
 * @param tileId The tile ID (e.g., '01', '24', 'BLANK').
 * @returns The TileRequirement object, or null if tile not found.
 */
export function getTileRequirements(tileId: string): TileRequirement | null {
  return TILE_REQUIREMENTS[tileId] || null;
}

/**
 * Checks if a tile has specific move requirements.
 * @param tileId The tile ID to check.
 * @returns True if the tile has required moves (non-empty).
 */
export function tileHasRequirements(tileId: string): boolean {
  const requirements = getTileRequirements(tileId);
  return requirements ? requirements.requiredMoves.length > 0 : false;
}

/**
 * Checks if all required moves for a tile have been completed.
 * @param tileId The tile ID being played.
 * @param executedMoves The moves that were actually executed.
 * @returns True if all required moves were executed.
 */
export function areAllTileRequirementsMet(
  tileId: string,
  executedMoves: DefinedMoveType[]
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements || requirements.requiredMoves.length === 0) {
    return true; // No requirements (like Blank tile with no moves)
  }

  // All required moves must be present in executedMoves
  return requirements.requiredMoves.every((requiredMove) =>
    executedMoves.includes(requiredMove)
  );
}

/**
 * Determines if a tile play can be rejected based on execution.
 *
 * REJECTION RULES:
 * - If all required moves were executed: tile CANNOT be rejected
 * - If it's impossible to execute requirements (board state): tile CANNOT be rejected
 * - If some moves were not executed (but were possible): tile CAN be rejected
 * - For Blank tile: if NO moves were made: tile CANNOT be rejected
 * - For Blank tile: if ANY moves were made: tile CAN be rejected
 *
 * @param tileId The tile ID being played.
 * @param executedMoves The moves that were executed.
 * @param wasExecutionPossible Whether the requirements were possible to execute.
 * @returns True if the tile can be rejected.
 */
export function canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  wasExecutionPossible: boolean
): boolean {
  const requirements = getTileRequirements(tileId);
  if (!requirements) return true; // Unknown tile, default to rejectable

  // If requirements were impossible to execute, tile cannot be rejected
  if (!wasExecutionPossible) {
    return false;
  }

  // If all requirements were met, tile cannot be rejected
  if (areAllTileRequirementsMet(tileId, executedMoves)) {
    return false;
  }

  // Blank tile can be rejected only if moves were made
  if (tileId === "BLANK") {
    return executedMoves.length > 0;
  }

  // If some (but not all) requirements were met, tile can be rejected
  return true;
}

export const PLAYER_PERSPECTIVE_ROTATIONS: {
  [playerCount: number]: { [playerId: number]: number };
} = {
  3: { 1: -120, 2: 120, 3: 0 },
  4: { 1: -135, 2: 135, 3: 45, 4: -45 },
  // Recalculated based on the geometric center of each player's actual seat coordinates.
  5: { 1: -71, 2: -140, 3: 145, 4: 75, 5: 0 },
};

const THREE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 15.3, top: 44.76 }, rotation: 168.0 },
  { ownerId: 2, position: { left: 75.42, top: 15.71 }, rotation: 288.0 },
  { ownerId: 3, position: { left: 68.51, top: 75.24 }, rotation: 48.0 },
];

const FOUR_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 10.57, top: 52.44 }, rotation: 157.0 },
  { ownerId: 2, position: { left: 48.91, top: 13.18 }, rotation: 247.0 },
  { ownerId: 3, position: { left: 89.11, top: 48.14 }, rotation: 337.0 },
  { ownerId: 4, position: { left: 52.34, top: 88.09 }, rotation: 67.0 },
];

const FIVE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
  { ownerId: 1, position: { left: 14.64, top: 72.07 }, rotation: 93.0 },
  { ownerId: 2, position: { left: 11.93, top: 25.49 }, rotation: 165.0 },
  { ownerId: 3, position: { left: 58.59, top: 8.5 }, rotation: 237.0 },
  { ownerId: 4, position: { left: 89.53, top: 44.43 }, rotation: 309.0 },
  { ownerId: 5, position: { left: 63.07, top: 83.98 }, rotation: 21.0 },
];

export const TILE_SPACES_BY_PLAYER_COUNT: {
  [key: number]: TileReceivingSpace[];
} = {
  3: THREE_PLAYER_TILE_SPACES,
  4: FOUR_PLAYER_TILE_SPACES,
  5: FIVE_PLAYER_TILE_SPACES,
};

// Bank spaces for storing received tiles
const THREE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 42.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 37.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 32.61, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 28.11, top: 16.04 }, rotation: 181.0 },
  { ownerId: 1, position: { left: 21.61, top: 22.54 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 27.04 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 31.54 }, rotation: 90.0 },
  { ownerId: 1, position: { left: 21.61, top: 36.04 }, rotation: 90.0 },
  // Player 2
  { ownerId: 2, position: { left: 79.7, top: 50.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 82.2, top: 46.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 84.2, top: 42.48 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 87.2, top: 38.98 }, rotation: 300.0 },
  { ownerId: 2, position: { left: 84.12, top: 30.24 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 80.12, top: 27.74 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 76.12, top: 25.24 }, rotation: 211.0 },
  { ownerId: 2, position: { left: 72.62, top: 23.24 }, rotation: 211.0 },
  // Player 3
  { ownerId: 3, position: { left: 30.7, top: 65.75 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 33.2, top: 70.25 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 35.2, top: 74.25 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 37.2, top: 77.75 }, rotation: 60.0 },
  { ownerId: 3, position: { left: 46.07, top: 80.82 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 50.07, top: 77.82 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 54.04, top: 75.88 }, rotation: 330.0 },
  { ownerId: 3, position: { left: 58.04, top: 73.38 }, rotation: 330.0 },
];

const FOUR_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 31.76, top: 21.38 }, rotation: 141.0 },
  { ownerId: 1, position: { left: 27.93, top: 24.3 }, rotation: 141.0 },
  { ownerId: 1, position: { left: 24.22, top: 27.45 }, rotation: 141.0 },
  { ownerId: 1, position: { left: 20.72, top: 29.95 }, rotation: 141.0 },
  { ownerId: 1, position: { left: 17.22, top: 32.45 }, rotation: 141.0 },
  { ownerId: 1, position: { left: 13.72, top: 35.45 }, rotation: 141.0 },
  // Player 2
  { ownerId: 2, position: { left: 81.72, top: 33.79 }, rotation: 231.0 },
  { ownerId: 2, position: { left: 78.18, top: 30.18 }, rotation: 231.0 },
  { ownerId: 2, position: { left: 75.68, top: 26.68 }, rotation: 231.0 },
  { ownerId: 2, position: { left: 72.68, top: 23.68 }, rotation: 231.0 },
  { ownerId: 2, position: { left: 69.68, top: 20.18 }, rotation: 231.0 },
  { ownerId: 2, position: { left: 67.18, top: 16.68 }, rotation: 231.0 },
  // Player 3
  { ownerId: 3, position: { left: 68.39, top: 80.76 }, rotation: 321.0 },
  { ownerId: 3, position: { left: 72.26, top: 77.63 }, rotation: 321.0 },
  { ownerId: 3, position: { left: 76.07, top: 74.79 }, rotation: 321.0 },
  { ownerId: 3, position: { left: 79.01, top: 72.17 }, rotation: 321.0 },
  { ownerId: 3, position: { left: 82.95, top: 69.64 }, rotation: 321.0 },
  { ownerId: 3, position: { left: 86.51, top: 66.77 }, rotation: 321.0 },
  // Player 4
  { ownerId: 4, position: { left: 18.8, top: 67.97 }, rotation: 52.0 },
  { ownerId: 4, position: { left: 21.64, top: 71.57 }, rotation: 51.0 },
  { ownerId: 4, position: { left: 24.53, top: 75.11 }, rotation: 51.0 },
  { ownerId: 4, position: { left: 27.47, top: 78.52 }, rotation: 51.0 },
  { ownerId: 4, position: { left: 30.24, top: 81.93 }, rotation: 51.0 },
  { ownerId: 4, position: { left: 33.2, top: 85.06 }, rotation: 51.0 },
];

const FIVE_PLAYER_BANK_SPACES: BankSpace[] = [
  // Player 1
  { ownerId: 1, position: { left: 7.86, top: 51.17 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 10.86, top: 54.17 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 12.86, top: 56.67 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 15.86, top: 59.67 }, rotation: 49.0 },
  { ownerId: 1, position: { left: 18.86, top: 62.67 }, rotation: 49.0 },
  // Player 2
  { ownerId: 2, position: { left: 31.05, top: 12.46 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 29.05, top: 16.46 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 27.03, top: 19.24 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 24.97, top: 22.75 }, rotation: 119.0 },
  { ownerId: 2, position: { left: 22.97, top: 25.75 }, rotation: 119.0 },
  // Player 3
  { ownerId: 3, position: { left: 77.86, top: 21.19 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 73.59, top: 20.51 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 69.64, top: 19.93 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 65.68, top: 18.85 }, rotation: 193.0 },
  { ownerId: 3, position: { left: 61.84, top: 18.05 }, rotation: 193.0 },
  // Player 4
  { ownerId: 4, position: { left: 82.82, top: 65.82 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 82.34, top: 62.01 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 82.11, top: 58.21 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 81.61, top: 54.79 }, rotation: 265.0 },
  { ownerId: 4, position: { left: 81.32, top: 51.07 }, rotation: 265.0 },
  // Player 5
  { ownerId: 5, position: { left: 39.82, top: 84.18 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 43.2, top: 82.71 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 47.14, top: 81.15 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 50.47, top: 79.99 }, rotation: 335.0 },
  { ownerId: 5, position: { left: 54.43, top: 78.31 }, rotation: 335.0 },
];

export const BANK_SPACES_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
  3: THREE_PLAYER_BANK_SPACES,
  4: FOUR_PLAYER_BANK_SPACES,
  5: FIVE_PLAYER_BANK_SPACES,
};

// Credibility locations - one per player to display credibility currency
const THREE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  // Player 1: 21.18/15.35, rotation: -35.0°
  { ownerId: 1, position: { left: 21.18, top: 15.35 }, rotation: -35.0 },
  // Player 2: 90.30/33.16, rotation: 75.0°
  { ownerId: 2, position: { left: 90.3, top: 33.16 }, rotation: 75.0 },
  // Player 3: 40.45/83.68, rotation: 200.0°
  { ownerId: 3, position: { left: 40.45, top: 83.68 }, rotation: 200.0 },
];

const FOUR_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  // Player 1: 15.97/20.64, rotation: -34.0°
  { ownerId: 1, position: { left: 15.97, top: 20.64 }, rotation: -34.0 },
  // Player 2: 82.95/18.65, rotation: 51.0°
  { ownerId: 2, position: { left: 82.95, top: 18.65 }, rotation: 51.0 },
  // Player 3: 84.62/82.16, rotation: 136.0°
  { ownerId: 3, position: { left: 84.62, top: 82.16 }, rotation: 136.0 },
  // Player 4: 17.53/83.04, rotation: -129.0°
  { ownerId: 4, position: { left: 17.53, top: 83.04 }, rotation: -129.0 },
];

const FIVE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
  // Player 1: 8.11/63.80, rotation: 224.0°
  { ownerId: 1, position: { left: 8.11, top: 63.8 }, rotation: 224.0 },
  // Player 2: 18.06/16.34, rotation: -45.0°
  { ownerId: 2, position: { left: 18.06, top: 16.34 }, rotation: -45.0 },
  // Player 3: 69.62/11.07, rotation: 15.0°
  { ownerId: 3, position: { left: 69.62, top: 11.07 }, rotation: 15.0 },
  // Player 4: 91.28/55.40, rotation: 74.0°
  { ownerId: 4, position: { left: 91.28, top: 55.4 }, rotation: 74.0 },
  // Player 5: 52.95/88.41, rotation: 164.0°
  { ownerId: 5, position: { left: 52.95, top: 88.41 }, rotation: 164.0 },
];

export const CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT: {
  [key: number]: BankSpace[];
} = {
  3: THREE_PLAYER_CREDIBILITY_LOCATIONS,
  4: FOUR_PLAYER_CREDIBILITY_LOCATIONS,
  5: FIVE_PLAYER_CREDIBILITY_LOCATIONS,
};

// --- Utility Functions ---
// (Positioning functions moved to src/utils/positioning.ts)
// (Rostrum functions moved to src/rules/rostrum.ts)

/**
 * Checks if a piece can be moved to a specific location based on game rules.
 *
 * RULES:
 * 1. Pieces can only be moved to rostrums if ALL supporting seats are full
 * 2. Pieces can only be moved to a player's office if BOTH rostrums are filled
 * 3. Opponents cannot move a piece to another player's rostrum or office
 * 4. Opponents cannot move a piece FROM another player's rostrum or office
 * 5. Community spaces are always accessible (no restrictions)
 *
 * @param pieceId The ID of the piece being moved.
 * @param currentLocationId The current location of the piece.
 * @param targetLocationId The target location for the piece.
 * @param movingPlayerId The ID of the player making the move.
 * @param pieces The current pieces on the board.
 * @returns An object with { isAllowed: boolean, reason: string }
 */
export function validatePieceMovement(
  pieceId: string,
  currentLocationId: string | undefined,
  targetLocationId: string,
  movingPlayerId: number,
  pieces: Piece[]
): { isAllowed: boolean; reason: string } {
  // Community locations are always accessible
  if (targetLocationId.includes("community")) {
    return {
      isAllowed: true,
      reason: "Community spaces are always accessible",
    };
  }

  const targetPlayerId = getPlayerIdFromLocationId(targetLocationId);
  if (!targetPlayerId) {
    return {
      isAllowed: true,
      reason: "Location has no ownership restrictions",
    };
  }

  const currentPlayerId = currentLocationId
    ? getPlayerIdFromLocationId(currentLocationId)
    : null;
  const isOwnPiece =
    currentPlayerId === movingPlayerId || movingPlayerId === targetPlayerId;

  // --- RULE: Players may NOT move pieces between hierarchy levels within a domain ---
  // For OPPONENT domains: Block seat ↔ rostrum, rostrum ↔ office, seat ↔ office
  // For OWN domain: Block rostrum1 ↔ rostrum2 (lateral rostrum movement)
  if (currentPlayerId && targetPlayerId && currentPlayerId === targetPlayerId) {
    const sourceIsSeat = currentLocationId?.includes("seat");
    const sourceIsRostrum = currentLocationId?.includes("rostrum");
    const sourceIsOffice = currentLocationId?.includes("office");
    const targetIsSeat = targetLocationId.includes("seat");
    const targetIsRostrum = targetLocationId.includes("rostrum");
    const targetIsOffice = targetLocationId.includes("office");

    // RULE 1: Block opponent hierarchy movements (vertical hierarchy changes)
    if (currentPlayerId !== movingPlayerId) {
      const crossingHierarchy =
        (sourceIsSeat && (targetIsRostrum || targetIsOffice)) ||
        (sourceIsRostrum && (targetIsSeat || targetIsOffice)) ||
        (sourceIsOffice && (targetIsSeat || targetIsRostrum));

      if (crossingHierarchy) {
        return {
          isAllowed: false,
          reason: `Cannot move opponent's piece between hierarchy levels (from ${formatLocationId(
            currentLocationId
          )} to ${formatLocationId(targetLocationId)})`,
        };
      }
    }

    // RULE 2: Block own rostrum-to-rostrum movements (lateral at same level)
    if (
      currentPlayerId === movingPlayerId &&
      sourceIsRostrum &&
      targetIsRostrum
    ) {
      // Check if moving between rostrum1 and rostrum2
      if (currentLocationId !== targetLocationId) {
        return {
          isAllowed: false,
          reason: `Cannot move piece between your own rostrums (from ${formatLocationId(
            currentLocationId
          )} to ${formatLocationId(targetLocationId)})`,
        };
      }
    }
  }

  // --- Moving to a ROSTRUM ---
  if (targetLocationId.includes("rostrum")) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's rostrum`,
      };
    }

    // RULE 1: Check if all supporting seats are full
    if (!areSupportingSeatsFullForRostrum(targetLocationId, pieces)) {
      const rule = getRostrumSupportRule(targetLocationId);
      if (rule) {
        const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
        return {
          isAllowed: false,
          reason: `Cannot move to ${formatLocationId(
            targetLocationId
          )} - only ${occupied}/3 supporting seats are full`,
        };
      }
    }

    return { isAllowed: true, reason: "All supporting seats are full" };
  }

  // --- Moving to an OFFICE ---
  if (targetLocationId.includes("office")) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's office`,
      };
    }

    // RULE 2: Check if both rostrums are filled
    if (!areBothRostrumsFilledForPlayer(targetPlayerId, pieces)) {
      return {
        isAllowed: false,
        reason: `Cannot move to office - not both rostrums are filled yet`,
      };
    }

    return { isAllowed: true, reason: "Both rostrums are filled" };
  }

  // All other moves are valid
  return { isAllowed: true, reason: "Move is valid" };
}

/**
 * Validates if a piece movement is legal and returns the move type.
 * Returns the move type or 'UNKNOWN' if the move is illegal.
 */
export function validateMoveType(
  fromLocationId: string | undefined,
  toLocationId: string | undefined,
  movingPlayerId: number,
  currentPiece: Piece,
  allPieces: Piece[],
  playerCount: number
): string {
  if (!fromLocationId || !toLocationId) return "UNKNOWN";

  const isCommunity = (loc?: string) => loc?.includes("community");
  const isSeat = (loc?: string) => loc?.includes("_seat");
  const isRostrum = (loc?: string) => loc?.includes("_rostrum");
  const isOffice = (loc?: string) => loc?.includes("_office");
  const getPlayerFromLocation = (loc?: string): number | null => {
    const match = loc?.match(/p(\d+)_/);
    return match ? parseInt(match[1]) : null;
  };

  // Rule 1: Community → Seat/Rostrum/Office = ADVANCE or ASSIST
  if (
    isCommunity(fromLocationId) &&
    (isSeat(toLocationId) || isRostrum(toLocationId) || isOffice(toLocationId))
  ) {
    const ownerPlayer = getPlayerFromLocation(toLocationId);
    return ownerPlayer === movingPlayerId ? "ADVANCE" : "ASSIST";
  }
  // Rule 2: Seat → Community = WITHDRAW
  else if (isSeat(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 3: Seat → Seat = ORGANIZE or INFLUENCE (only if adjacent)
  else if (isSeat(fromLocationId) && isSeat(toLocationId)) {
    if (areSeatsAdjacent(fromLocationId, toLocationId, playerCount)) {
      const fromPlayer = getPlayerFromLocation(fromLocationId);
      return fromPlayer === movingPlayerId ? "ORGANIZE" : "INFLUENCE";
    }
    return "UNKNOWN"; // Non-adjacent seat moves are illegal
  }
  // Rule 4: Seat → Rostrum = ADVANCE
  else if (isSeat(fromLocationId) && isRostrum(toLocationId)) {
    return "ADVANCE";
  }
  // Rule 5: Rostrum → Seat = WITHDRAW
  else if (isRostrum(fromLocationId) && isSeat(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 6: Rostrum → Office = ADVANCE
  else if (isRostrum(fromLocationId) && isOffice(toLocationId)) {
    return "ADVANCE";
  }
  // Rule 7: Rostrum → Community = WITHDRAW
  else if (isRostrum(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 8: Rostrum → Rostrum = ORGANIZE or INFLUENCE
  else if (isRostrum(fromLocationId) && isRostrum(toLocationId)) {
    const fromPlayer = getPlayerFromLocation(fromLocationId);
    return fromPlayer === movingPlayerId ? "ORGANIZE" : "INFLUENCE";
  }
  // Rule 9: Office → Rostrum = WITHDRAW
  else if (isOffice(fromLocationId) && isRostrum(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 10: Office → Community = WITHDRAW
  else if (isOffice(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }

  // All other moves are illegal
  return "UNKNOWN";
}

// (areRostrumsAdjacent, getAdjacentRostrum, validateAdjacentRostrumMovement moved to src/rules/rostrum.ts)
// (shuffle function moved to src/utils/array.ts)

// Default piece positions for campaign start
export const DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT: {
  [key: number]: {
    name: string;
    displayName: string;
    position: { left: number; top: number };
  }[];
} = {
  3: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 48.3, top: 29.9 } },
    { name: "Mark", displayName: "M2", position: { left: 40.0, top: 35.6 } },
    { name: "Mark", displayName: "M3", position: { left: 37.3, top: 43.9 } },
    { name: "Mark", displayName: "M4", position: { left: 64.0, top: 48.8 } },
    { name: "Mark", displayName: "M5", position: { left: 63.8, top: 39.5 } },
    { name: "Mark", displayName: "M6", position: { left: 57.4, top: 32.9 } },
    { name: "Mark", displayName: "M7", position: { left: 40.2, top: 53.1 } },
    { name: "Mark", displayName: "M8", position: { left: 48.5, top: 58.4 } },
    { name: "Mark", displayName: "M9", position: { left: 57.7, top: 56.3 } },
    { name: "Mark", displayName: "M10", position: { left: 58.7, top: 45.0 } },
    { name: "Mark", displayName: "M11", position: { left: 46.4, top: 46.1 } },
    { name: "Mark", displayName: "M12", position: { left: 56.0, top: 46.1 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 45.2, top: 38.0 } },
    { name: "Heel", displayName: "H2", position: { left: 48.7, top: 38.0 } },
    { name: "Heel", displayName: "H3", position: { left: 52.2, top: 38.0 } },
    { name: "Heel", displayName: "H4", position: { left: 55.7, top: 38.0 } },
    { name: "Heel", displayName: "H5", position: { left: 45.2, top: 42.0 } },
    { name: "Heel", displayName: "H6", position: { left: 48.7, top: 42.0 } },
    { name: "Heel", displayName: "H7", position: { left: 52.2, top: 42.0 } },
    { name: "Heel", displayName: "H8", position: { left: 55.7, top: 42.0 } },
    { name: "Heel", displayName: "H9", position: { left: 50.4, top: 46.0 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 46.9, top: 50.0 } },
    { name: "Pawn", displayName: "P2", position: { left: 50.4, top: 50.0 } },
    { name: "Pawn", displayName: "P3", position: { left: 53.9, top: 50.0 } },
  ],
  4: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M2", position: { left: 41.31, top: 53.91 } },
    { name: "Mark", displayName: "M3", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M4", position: { left: 61.21, top: 50.63 } },
    { name: "Mark", displayName: "M5", position: { left: 58.34, top: 55.42 } },
    { name: "Mark", displayName: "M6", position: { left: 58.74, top: 46.55 } },
    { name: "Mark", displayName: "M7", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M8", position: { left: 41.31, top: 53.91 } },
    { name: "Mark", displayName: "M9", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M10", position: { left: 61.21, top: 50.63 } },
    { name: "Mark", displayName: "M11", position: { left: 58.34, top: 55.42 } },
    { name: "Mark", displayName: "M12", position: { left: 58.74, top: 46.55 } },
    { name: "Mark", displayName: "M13", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M14", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M15", position: { left: 51.7, top: 41.6 } },
    { name: "Mark", displayName: "M16", position: { left: 55.2, top: 41.6 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 41.05, top: 47.1 } },
    { name: "Heel", displayName: "H2", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H3", position: { left: 51.7, top: 45.6 } },
    { name: "Heel", displayName: "H4", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H5", position: { left: 41.05, top: 47.1 } },
    { name: "Heel", displayName: "H6", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H7", position: { left: 51.7, top: 49.6 } },
    { name: "Heel", displayName: "H8", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H9", position: { left: 41.31, top: 53.91 } },
    { name: "Heel", displayName: "H10", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H11", position: { left: 51.7, top: 53.6 } },
    { name: "Heel", displayName: "H12", position: { left: 58.34, top: 55.42 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 61.21, top: 50.63 } },
    { name: "Pawn", displayName: "P2", position: { left: 58.34, top: 55.42 } },
    { name: "Pawn", displayName: "P3", position: { left: 51.7, top: 57.6 } },
    { name: "Pawn", displayName: "P4", position: { left: 58.34, top: 55.42 } },
  ],
  5: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 29.0, top: 44.1 } },
    { name: "Mark", displayName: "M2", position: { left: 29.0, top: 51.8 } },
    { name: "Mark", displayName: "M3", position: { left: 32.6, top: 58.6 } },
    { name: "Mark", displayName: "M4", position: { left: 44.8, top: 29.0 } },
    { name: "Mark", displayName: "M5", position: { left: 38.3, top: 32.4 } },
    { name: "Mark", displayName: "M6", position: { left: 31.6, top: 37.1 } },
    { name: "Mark", displayName: "M7", position: { left: 65.3, top: 38.7 } },
    { name: "Mark", displayName: "M8", position: { left: 60.5, top: 32.5 } },
    { name: "Mark", displayName: "M9", position: { left: 53.0, top: 29.3 } },
    { name: "Mark", displayName: "M10", position: { left: 61.6, top: 60.0 } },
    { name: "Mark", displayName: "M11", position: { left: 66.1, top: 53.7 } },
    { name: "Mark", displayName: "M12", position: { left: 67.2, top: 46.2 } },
    { name: "Mark", displayName: "M13", position: { left: 39.2, top: 63.4 } },
    { name: "Mark", displayName: "M14", position: { left: 47.0, top: 65.5 } },
    { name: "Mark", displayName: "M15", position: { left: 54.9, top: 64.3 } },
    { name: "Mark", displayName: "M16", position: { left: 42.5, top: 36.9 } },
    { name: "Mark", displayName: "M17", position: { left: 46.0, top: 36.9 } },
    { name: "Mark", displayName: "M18", position: { left: 49.5, top: 36.9 } },
    { name: "Mark", displayName: "M19", position: { left: 53.0, top: 36.9 } },
    { name: "Mark", displayName: "M20", position: { left: 47.8, top: 40.9 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 42.5, top: 44.9 } },
    { name: "Heel", displayName: "H2", position: { left: 46.0, top: 44.9 } },
    { name: "Heel", displayName: "H3", position: { left: 49.5, top: 44.9 } },
    { name: "Heel", displayName: "H4", position: { left: 53.0, top: 44.9 } },
    { name: "Heel", displayName: "H5", position: { left: 42.5, top: 48.9 } },
    { name: "Heel", displayName: "H6", position: { left: 46.0, top: 48.9 } },
    { name: "Heel", displayName: "H7", position: { left: 49.5, top: 48.9 } },
    { name: "Heel", displayName: "H8", position: { left: 53.0, top: 48.9 } },
    { name: "Heel", displayName: "H9", position: { left: 42.5, top: 52.9 } },
    { name: "Heel", displayName: "H10", position: { left: 46.0, top: 52.9 } },
    { name: "Heel", displayName: "H11", position: { left: 49.5, top: 52.9 } },
    { name: "Heel", displayName: "H12", position: { left: 53.0, top: 52.9 } },
    { name: "Heel", displayName: "H13", position: { left: 44.3, top: 56.9 } },
    { name: "Heel", displayName: "H14", position: { left: 47.8, top: 56.9 } },
    { name: "Heel", displayName: "H15", position: { left: 51.3, top: 56.9 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 37.9, top: 46.7 } },
    { name: "Pawn", displayName: "P2", position: { left: 37.8, top: 50.3 } },
    { name: "Pawn", displayName: "P3", position: { left: 57.4, top: 53.4 } },
    { name: "Pawn", displayName: "P4", position: { left: 57.8, top: 49.4 } },
    { name: "Pawn", displayName: "P5", position: { left: 37.9, top: 54.1 } },
  ],
};

// ============================================================================
// MOVE VALIDATION AND TRACKING FUNCTIONS
// ============================================================================

/**
 * Validates that moves performed match the allowed categories during tile play.
 * During tile play, a player may perform up to 2 moves with the following restrictions:
 * - Only allowed combinations: One of (Assist, Remove, Influence) + one of (Advance, Withdraw, Organize)
 * - Cannot combine moves within the same group
 * @param movesPerformed Array of tracked moves
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateMovesForTilePlay(movesPerformed: TrackedMove[]): {
  isValid: boolean;
  error?: string;
} {
  console.log("=== validateMovesForTilePlay ===");
  console.log("Total moves:", movesPerformed.length);
  console.log(
    "Moves:",
    movesPerformed.map((m) => ({ moveType: m.moveType, category: m.category }))
  );

  if (movesPerformed.length > 2) {
    console.log("VALIDATION FAILED: More than 2 moves");
    return { isValid: false, error: "Maximum 2 moves allowed per tile play" };
  }

  const oMoveCount = movesPerformed.filter((m) => m.category === "O").length;
  const mMoveCount = movesPerformed.filter((m) => m.category === "M").length;

  console.log("O-moves count:", oMoveCount);
  console.log("M-moves count:", mMoveCount);

  if (oMoveCount > 1) {
    console.log("VALIDATION FAILED: More than 1 O-move");
    return {
      isValid: false,
      error: "You may NOT perform 2 actions of the same category",
    };
  }

  if (mMoveCount > 1) {
    console.log("VALIDATION FAILED: More than 1 M-move");
    return {
      isValid: false,
      error: "You may NOT perform 2 actions of the same category",
    };
  }

  console.log("VALIDATION PASSED");
  return { isValid: true };
}

/**
 * Checks if all required moves for a tile have been performed.
 * @param tileId The tile ID
 * @param movesPerformed Array of moves performed
 * @returns Object with isMet boolean and which required moves are missing
 */
export function validateTileRequirements(
  tileId: string,
  movesPerformed: TrackedMove[]
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);
  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  const missingMoves = requirements.requiredMoves.filter(
    (required) => !performedMoveTypes.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves: requirements.requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves: missingMoves,
  };
}

/**
 * Validates tile requirements considering impossible moves.
 * If a required move cannot be performed due to external conditions (empty domain, all seats full),
 * that requirement is automatically considered fulfilled.
 */
export function validateTileRequirementsWithImpossibleMoveExceptions(
  tileId: string,
  movesPerformed: TrackedMove[],
  tilePlayerId: number,
  piecesAtTurnStart: Piece[],
  currentPieces: Piece[],
  allPlayers: Player[],
  playerCount: number
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
  impossibleMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);
  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  // Check which moves are actually impossible
  const impossibleMoves: DefinedMoveType[] = [];

  // Check for WITHDRAW impossibility: domain empty at turn start
  if (requirements.requiredMoves.includes(DefinedMoveType.WITHDRAW)) {
    const domainWasEmptyAtTurnStart = piecesAtTurnStart.every((p) => {
      if (!p.locationId) return true;
      const locationPrefix = `p${tilePlayerId}_`;
      return !p.locationId.startsWith(locationPrefix);
    });

    if (
      domainWasEmptyAtTurnStart &&
      !performedMoveTypes.includes(DefinedMoveType.WITHDRAW)
    ) {
      impossibleMoves.push(DefinedMoveType.WITHDRAW);
    }
  }

  // Check for ASSIST impossibility: all opponent seats are full
  if (requirements.requiredMoves.includes(DefinedMoveType.ASSIST)) {
    let allOpponentSeatsAreFull = true;

    // Check each opponent's seats
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== tilePlayerId) {
        // Count vacant seats for this opponent
        const opponentSeats = currentPieces.filter(
          (p) =>
            p.locationId && p.locationId.includes(`p${otherPlayer.id}_seat`)
        );
        const maxSeats = 6; // Assuming 6 seats per player

        if (opponentSeats.length < maxSeats) {
          allOpponentSeatsAreFull = false;
          break;
        }
      }
    }

    if (
      allOpponentSeatsAreFull &&
      !performedMoveTypes.includes(DefinedMoveType.ASSIST)
    ) {
      impossibleMoves.push(DefinedMoveType.ASSIST);
    }
  }

  // Calculate missing moves, excluding impossible ones
  const missingMoves = requirements.requiredMoves.filter(
    (required) =>
      !performedMoveTypes.includes(required) &&
      !impossibleMoves.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves: requirements.requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves: missingMoves,
    impossibleMoves: impossibleMoves,
  };
}

/**
 * Validates whether an ADVANCE move is legal.
 * ADVANCE options:
 * a. Take a piece from community TO an open seat in their domain
 * b. Take a piece from a seat (seats 1-3) TO rostrum1 (if ALL of seats 1-3 occupied)
 * c. Take a piece from a seat (seats 4-6) TO rostrum2 (if ALL of seats 4-6 occupied)
 * d. Take a piece from rostrum1 TO office (if BOTH rostrum1 and rostrum2 occupied)
 */
export function validateAdvanceMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Option A: Community to seat
  if (
    fromLocationId?.includes("community") &&
    toLocationId?.includes(`p${playerId}_seat`)
  ) {
    // Check if target seat is vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;

    // Check community movement restrictions
    const movingPiece = pieces.find((p) => p.id === move.pieceId);
    if (!movingPiece) return false;

    return canMoveFromCommunity(movingPiece, pieces);
  }

  // Option B: Seats 1-3 to rostrum1 (if all seats 1-3 occupied)
  if (toLocationId === `p${playerId}_rostrum1`) {
    const seat1 = `p${playerId}_seat1`;
    const seat2 = `p${playerId}_seat2`;
    const seat3 = `p${playerId}_seat3`;

    const allOccupied = [seat1, seat2, seat3].every((seatId) =>
      pieces.some((p) => p.locationId === seatId)
    );

    const validSource = [seat1, seat2, seat3].includes(fromLocationId || "");
    return allOccupied && validSource;
  }

  // Option C: Seats 4-6 to rostrum2 (if all seats 4-6 occupied)
  if (toLocationId === `p${playerId}_rostrum2`) {
    const seat4 = `p${playerId}_seat4`;
    const seat5 = `p${playerId}_seat5`;
    const seat6 = `p${playerId}_seat6`;

    const allOccupied = [seat4, seat5, seat6].every((seatId) =>
      pieces.some((p) => p.locationId === seatId)
    );

    const validSource = [seat4, seat5, seat6].includes(fromLocationId || "");
    return allOccupied && validSource;
  }

  // Option D: Rostrum1 to office (if both rostrums occupied)
  if (
    toLocationId === `p${playerId}_office` &&
    fromLocationId === `p${playerId}_rostrum1`
  ) {
    const rostrum2Occupied = pieces.some(
      (p) => p.locationId === `p${playerId}_rostrum2`
    );
    return rostrum2Occupied;
  }

  return false;
}

/**
 * Validates whether a WITHDRAW move is legal.
 * WITHDRAW options:
 * a. Seat to community
 * b. Rostrum to specific seats in their domain:
 *    - rostrum1 to seats 1-3
 *    - rostrum2 to seats 3-5
 * c. Office to vacant rostrum in their domain
 */
export function validateWithdrawMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  if (!fromLocationId || !toLocationId) return false;

  // Option A: Seat to community
  if (
    fromLocationId?.includes(`p${playerId}_seat`) &&
    toLocationId?.includes("community")
  ) {
    return true;
  }

  // Option B: Rostrum to specific seats
  if (fromLocationId === `p${playerId}_rostrum1`) {
    // rostrum1 can go to seats 1, 2, or 3
    const validSeats = [
      `p${playerId}_seat1`,
      `p${playerId}_seat2`,
      `p${playerId}_seat3`,
    ];
    if (validSeats.includes(toLocationId)) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  if (fromLocationId === `p${playerId}_rostrum2`) {
    // rostrum2 can go to seats 3, 4, or 5
    const validSeats = [
      `p${playerId}_seat3`,
      `p${playerId}_seat4`,
      `p${playerId}_seat5`,
    ];
    if (validSeats.includes(toLocationId)) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  // Option C: Office to vacant rostrum
  if (fromLocationId === `p${playerId}_office`) {
    if (
      toLocationId === `p${playerId}_rostrum1` ||
      toLocationId === `p${playerId}_rostrum2`
    ) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }

  return false;
}

/**
 * Validates whether a REMOVE move is legal.
 * REMOVE: Take an opponent's piece from their seat and return it to community.
 */
export function validateRemoveMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Must move to community
  if (!toLocationId?.includes("community")) return false;

  // Check if from an opponent's seat (not player's own seat)
  if (!fromLocationId?.includes("_seat")) return false;

  // Extract player ID from location (e.g., 'p2_seat1' -> 2)
  const seatPlayerMatch = fromLocationId?.match(/p(\d+)_seat/);
  if (!seatPlayerMatch) return false;

  const seatPlayerId = parseInt(seatPlayerMatch[1]);
  if (
    seatPlayerId === playerId ||
    seatPlayerId < 1 ||
    seatPlayerId > playerCount
  ) {
    return false;
  }

  // Check that the piece being moved is a Mark or Heel
  const movingPiece = pieces.find((p) => p.id === move.pieceId);
  if (!movingPiece) return false;

  const pieceName = movingPiece.name.toLowerCase();
  return pieceName === "mark" || pieceName === "heel";
}

/**
 * Validates whether an INFLUENCE move is legal.
 * INFLUENCE: Move another player's piece from a seat to adjacent seat, or from rostrum to adjacent rostrum.
 */
export function validateInfluenceMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  if (!fromLocationId || !toLocationId) return false;

  // Case 1: Seat to adjacent seat
  if (fromLocationId.includes("_seat") && toLocationId.includes("_seat")) {
    // Must be opponent's piece
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_seat/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false; // Can't INFLUENCE own pieces

    // Seats must be adjacent
    return areSeatsAdjacent(fromLocationId, toLocationId, playerCount);
  }

  // Case 2: Rostrum to adjacent rostrum
  if (
    fromLocationId.includes("_rostrum") &&
    toLocationId.includes("_rostrum")
  ) {
    // Must be opponent's piece
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_rostrum/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false; // Can't INFLUENCE own pieces

    // Extract rostrum numbers from the location IDs
    const fromRostMatch = fromLocationId.match(/p\d+_rostrum(\d)/);
    const toRostMatch = toLocationId.match(/p\d+_rostrum(\d)/);

    if (!fromRostMatch || !toRostMatch) return false;

    const fromRost = parseInt(fromRostMatch[1]);
    const toRost = parseInt(toRostMatch[1]);

    // Rostrums must be adjacent (1 is adjacent to 2, and 2 to 1)
    return Math.abs(fromRost - toRost) === 1;
  }

  return false;
}

/**
 * Validates whether an ASSIST move is legal.
 * ASSIST: Add a piece from community to an opponent's vacant seat.
 */
export function validateAssistMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Must be from community to opponent's seat
  if (!fromLocationId?.includes("community")) return false;
  if (!toLocationId?.includes("_seat")) return false;

  // Extract player ID from target seat (e.g., 'p2_seat1' -> 2)
  const seatPlayerMatch = toLocationId?.match(/p(\d+)_seat/);
  if (!seatPlayerMatch) return false;

  const targetPlayerId = parseInt(seatPlayerMatch[1]);

  // Must be opponent's seat and seat must be vacant
  if (targetPlayerId === playerId) return false;
  if (targetPlayerId < 1 || targetPlayerId > playerCount) return false;

  const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
  if (targetOccupied) return false;

  // Check community movement restrictions
  const movingPiece = pieces.find((p) => p.id === move.pieceId);
  if (!movingPiece) return false;

  return canMoveFromCommunity(movingPiece, pieces);
}

/**
 * Validates whether an ORGANIZE move is legal.
 * ORGANIZE: Move piece from seat to adjacent seat, or from rostrum to adjacent rostrum.
 */
export function validateOrganizeMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[]
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Case 1: Seat to adjacent seat (can cross player boundaries)
  if (fromLocationId?.includes("_seat") && toLocationId?.includes("_seat")) {
    // Must be from player's own seat
    if (!fromLocationId?.includes(`p${playerId}_seat`)) return false;
    // Target seat must be vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    return !targetOccupied;
  }

  // Case 2: Rostrum to adjacent rostrum (can cross player boundaries)
  if (
    fromLocationId?.includes("_rostrum") &&
    toLocationId?.includes("_rostrum")
  ) {
    // Must be from player's own rostrum
    if (!fromLocationId?.includes(`p${playerId}_rostrum`)) return false;
    // Target rostrum must be vacant
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    return !targetOccupied;
  }

  return false;
}

/**
 * Validates a single move based on its type and game state.
 * Returns detailed information about the move's validity.
 */
export function validateSingleMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number
): {
  isValid: boolean;
  reason: string;
} {
  switch (move.moveType) {
    case DefinedMoveType.ADVANCE:
      return {
        isValid: validateAdvanceMove(move, playerId, pieces),
        reason:
          "This ADVANCE move is not available until support seats/rostrums are full",
      };

    case DefinedMoveType.WITHDRAW:
      return {
        isValid: validateWithdrawMove(move, playerId, pieces),
        reason: "WITHDRAW move validation",
      };

    case DefinedMoveType.REMOVE:
      return {
        isValid: validateRemoveMove(move, playerId, pieces, playerCount),
        reason: "REMOVE move validation",
      };

    case DefinedMoveType.INFLUENCE:
      return {
        isValid: validateInfluenceMove(move, playerId, pieces, playerCount),
        reason: "INFLUENCE move validation",
      };

    case DefinedMoveType.ASSIST:
      return {
        isValid: validateAssistMove(move, playerId, pieces, playerCount),
        reason: "ASSIST move validation",
      };

    case DefinedMoveType.ORGANIZE:
      return {
        isValid: validateOrganizeMove(move, playerId, pieces),
        reason: "ORGANIZE move validation",
      };

    default:
      return {
        isValid: false,
        reason: "Unknown move type",
      };
  }
}


// ============================================================================
// BUREAUCRACY PHASE FUNCTIONS
// ============================================================================

/**
 * Calculates the total Kredcoin value for a player based on their bureaucracy tiles
 */
export function calculatePlayerKredcoin(player: Player): number {
  return player.bureaucracyTiles.reduce((total, tile) => {
    return total + (TILE_KREDCOIN_VALUES[tile.id] || 0);
  }, 0);
}

/**
 * Determines the turn order for Bureaucracy phase based on Kredcoin amounts
 * Returns player IDs sorted by Kredcoin (descending)
 */
export function getBureaucracyTurnOrder(players: Player[]): number[] {
  const playerKredcoin = players.map((p) => ({
    id: p.id,
    kredcoin: calculatePlayerKredcoin(p),
  }));

  // Sort by kredcoin descending, then by player id ascending (for tie-breaking)
  playerKredcoin.sort((a, b) => {
    if (b.kredcoin !== a.kredcoin) {
      return b.kredcoin - a.kredcoin;
    }
    return a.id - b.id;
  });

  return playerKredcoin.map((pk) => pk.id);
}

/**
 * Gets the Bureaucracy menu for a specific player count
 */
export function getBureaucracyMenu(playerCount: number): BureaucracyMenuItem[] {
  if (playerCount === 5) {
    return FIVE_PLAYER_BUREAUCRACY_MENU;
  }
  return THREE_FOUR_PLAYER_BUREAUCRACY_MENU;
}

/**
 * Filters menu items that the player can afford
 */
export function getAvailablePurchases(
  menu: BureaucracyMenuItem[],
  remainingKredcoin: number
): BureaucracyMenuItem[] {
  return menu.filter((item) => item.price <= remainingKredcoin);
}

/**
 * Validates that a promotion was performed correctly
 */
export function validatePromotion(
  pieces: Piece[],
  pieceId: string,
  expectedLocationType: PromotionLocationType,
  playerId: number,
  beforePieces: Piece[]
): { isValid: boolean; reason: string } {
  const pieceBefore = beforePieces.find((p) => p.id === pieceId);
  const pieceAfter = pieces.find((p) => p.id === pieceId);

  if (!pieceBefore) {
    return { isValid: false, reason: "Original piece not found" };
  }

  if (!pieceAfter) {
    return { isValid: false, reason: "Piece not found after promotion" };
  }

  // Check if piece was originally in the correct player's domain and location type
  if (!pieceBefore.locationId) {
    return { isValid: false, reason: "Piece was not in a valid location" };
  }

  const locationPattern = new RegExp(
    `^p${playerId}_(office|rostrum\\d+|seat\\d+)$`
  );
  const match = pieceBefore.locationId.match(locationPattern);

  if (!match) {
    return {
      isValid: false,
      reason: `Piece must be in Player ${playerId}'s domain`,
    };
  }

  const actualLocationType = match[1];

  if (expectedLocationType === "OFFICE" && actualLocationType !== "office") {
    return {
      isValid: false,
      reason: "Piece must be in the Office for this promotion",
    };
  }

  if (
    expectedLocationType === "ROSTRUM" &&
    !actualLocationType.startsWith("rostrum")
  ) {
    return {
      isValid: false,
      reason: "Piece must be in a Rostrum for this promotion",
    };
  }

  if (
    expectedLocationType === "SEAT" &&
    !actualLocationType.startsWith("seat")
  ) {
    return {
      isValid: false,
      reason: "Piece must be in a Seat for this promotion",
    };
  }

  // Check that the piece type was valid (Mark or Heel only)
  if (pieceBefore.name !== "Mark" && pieceBefore.name !== "Heel") {
    return { isValid: false, reason: "Only Marks and Heels can be promoted" };
  }

  // Check that piece is now in community
  if (
    !pieceAfter.locationId ||
    !pieceAfter.locationId.startsWith("community")
  ) {
    return { isValid: false, reason: "Promoted piece must move to community" };
  }

  // Check that a higher-tier piece now occupies the original location
  const targetPieceType = pieceBefore.name === "Mark" ? "Heel" : "Pawn";
  const newPieceInLocation = pieces.find(
    (p) => p.locationId === pieceBefore.locationId && p.name === targetPieceType
  );

  if (!newPieceInLocation) {
    return {
      isValid: false,
      reason: `A ${targetPieceType} from the community must now occupy the promoted piece's location`,
    };
  }

  return { isValid: true, reason: "Valid promotion" };
}

/**
 * Performs a promotion by swapping with a piece from the community
 * Returns updated pieces array with the swap performed
 */
export function performPromotion(
  pieces: Piece[],
  pieceId: string
): {
  pieces: Piece[];
  success: boolean;
  reason?: string;
} {
  const pieceToPromote = pieces.find((p) => p.id === pieceId);

  if (!pieceToPromote) {
    return { pieces, success: false, reason: "Piece not found" };
  }

  // Determine what piece type we need from community
  let targetPieceType: string;
  if (pieceToPromote.name === "Mark") {
    targetPieceType = "Heel";
  } else if (pieceToPromote.name === "Heel") {
    targetPieceType = "Pawn";
  } else {
    return {
      pieces,
      success: false,
      reason: "Pawns cannot be promoted further",
    };
  }

  // Find a piece of target type in the community
  const communityPiece = pieces.find(
    (p) =>
      p.name === targetPieceType &&
      p.locationId &&
      p.locationId.startsWith("community")
  );

  if (!communityPiece) {
    return {
      pieces,
      success: false,
      reason: `No ${targetPieceType} available in community for promotion`,
    };
  }

  // Store the locations before swap
  const promotedPieceLocation = pieceToPromote.locationId;
  const communityPieceLocation = communityPiece.locationId;

  // Perform the swap
  const updatedPieces = pieces.map((piece) => {
    if (piece.id === pieceId) {
      // Move promoted piece to community with demoted type
      return {
        ...piece,
        locationId: communityPieceLocation,
        position: communityPiece.position,
        rotation: communityPiece.rotation,
      };
    } else if (piece.id === communityPiece.id) {
      // Move community piece to the promoted location
      return {
        ...piece,
        locationId: promotedPieceLocation,
        position: pieceToPromote.position,
        rotation: pieceToPromote.rotation,
      };
    }
    return piece;
  });

  return { pieces: updatedPieces, success: true };
}

/**
 * Determines the move type based on from/to locations
 */
export function determineMoveType(
  fromLocationId: string | undefined,
  toLocationId: string | undefined,
  playerId: number
): DefinedMoveType | null {
  if (!fromLocationId || !toLocationId) return null;

  // REMOVE: opponent's seat -> community
  if (
    fromLocationId.includes("_seat") &&
    !fromLocationId.includes(`p${playerId}_`) &&
    toLocationId.includes("community")
  ) {
    return DefinedMoveType.REMOVE;
  }

  // INFLUENCE: opponent's rostrum -> own rostrum
  if (
    fromLocationId.includes("_rostrum") &&
    !fromLocationId.includes(`p${playerId}_`) &&
    toLocationId.includes(`p${playerId}_rostrum`)
  ) {
    return DefinedMoveType.INFLUENCE;
  }

  // ASSIST: community -> opponent's seat
  if (
    fromLocationId.includes("community") &&
    toLocationId.includes("_seat") &&
    !toLocationId.includes(`p${playerId}_`)
  ) {
    return DefinedMoveType.ASSIST;
  }

  // ADVANCE has multiple options:
  // A: community -> own seat
  // B: own seat -> own rostrum
  // C: own rostrum1 -> own office
  if (
    (fromLocationId.includes("community") &&
      toLocationId.includes(`p${playerId}_seat`)) ||
    (fromLocationId.includes(`p${playerId}_seat`) &&
      toLocationId.includes(`p${playerId}_rostrum`)) ||
    (fromLocationId === `p${playerId}_rostrum1` &&
      toLocationId === `p${playerId}_office`)
  ) {
    return DefinedMoveType.ADVANCE;
  }

  // WITHDRAW: rostrum -> seat (own)
  if (
    fromLocationId.includes(`p${playerId}_rostrum`) &&
    toLocationId.includes(`p${playerId}_seat`)
  ) {
    return DefinedMoveType.WITHDRAW;
  }

  // ORGANIZE: rostrum -> adjacent rostrum (own), or seat -> adjacent seat (own)
  if (
    (fromLocationId.includes(`p${playerId}_rostrum`) &&
      toLocationId.includes(`p${playerId}_rostrum`)) ||
    (fromLocationId.includes(`p${playerId}_seat`) &&
      toLocationId.includes(`p${playerId}_seat`))
  ) {
    return DefinedMoveType.ORGANIZE;
  }

  return null;
}

/**
 * Validates that purchased moves were performed correctly
 */
export function validatePurchasedMove(
  moveType: BureaucracyMoveType,
  trackedMoves: TrackedMove[],
  playerId: number,
  pieces: Piece[],
  playerCount: number
): { isValid: boolean; reason: string } {
  if (trackedMoves.length === 0) {
    return { isValid: false, reason: "No moves were performed" };
  }

  // Map bureaucracy move types to defined move types
  let expectedMoveType: DefinedMoveType;
  switch (moveType) {
    case "ADVANCE":
      expectedMoveType = DefinedMoveType.ADVANCE;
      break;
    case "WITHDRAW":
      expectedMoveType = DefinedMoveType.WITHDRAW;
      break;
    case "ORGANIZE":
      expectedMoveType = DefinedMoveType.ORGANIZE;
      break;
    case "ASSIST":
      expectedMoveType = DefinedMoveType.ASSIST;
      break;
    case "REMOVE":
      expectedMoveType = DefinedMoveType.REMOVE;
      break;
    case "INFLUENCE":
      expectedMoveType = DefinedMoveType.INFLUENCE;
      break;
    default:
      return { isValid: false, reason: "Unknown move type" };
  }

  // Check if at least one move matches the expected type
  const hasMatchingMove = trackedMoves.some(
    (move) => move.moveType === expectedMoveType
  );

  if (!hasMatchingMove) {
    return {
      isValid: false,
      reason: `Expected a ${moveType} move, but none was found`,
    };
  }

  // Validate each move using the same logic as Campaign mode
  for (const move of trackedMoves) {
    if (move.moveType === expectedMoveType) {
      const validation = validateSingleMove(
        move,
        playerId,
        pieces,
        playerCount
      );
      if (!validation.isValid) {
        return { isValid: false, reason: validation.reason };
      }
    }
  }

  return { isValid: true, reason: "Valid move" };
}
