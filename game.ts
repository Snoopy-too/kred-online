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

  // Tile validation functions - tile requirement checking and validation
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
  getTileRequirements,
  tileHasRequirements,
  areAllTileRequirementsMet,
  canTileBeRejected,

  // Complex validation functions - move and tile play validation
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateSingleMove,

  // Bureaucracy system - kredcoin calculation, turn order, and promotions
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
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

  // Movement validation - piece movement rules and move type determination
  validatePieceMovement,
  validateMoveType,

  // Move validation - specific move type validators
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
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
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
  getTileRequirements,
  tileHasRequirements,
  areAllTileRequirementsMet,
  canTileBeRejected,
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
  validatePieceMovement,
  validateMoveType,
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateSingleMove,
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
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

// Tile validation functions (isMoveAllowedInTilePlayOption, getMoveRequirement,
// getTileRequirements, tileHasRequirements, areAllTileRequirementsMet, canTileBeRejected)
// moved to src/game/tile-validation.ts

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
// (Movement validation functions moved to src/rules/movement.ts)
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
// BUREAUCRACY PHASE FUNCTIONS
// ============================================================================
// Re-exported from src/game/bureaucracy.ts
// - calculatePlayerKredcoin
// - getBureaucracyTurnOrder
// - getBureaucracyMenu
// - getAvailablePurchases
// - validatePromotion
// - performPromotion

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
