/**
 * Game Module - Central Re-export Hub
 *
 * This file serves as the main entry point for game logic, re-exporting functions
 * from their organized module locations for backwards compatibility.
 *
 * Architecture:
 * - Types:   src/types/     - TypeScript interfaces and type definitions
 * - Config:  src/config/    - Static game configuration (boards, rules, pieces)
 * - Utils:   src/utils/     - Helper functions (positioning, formatting, arrays)
 * - Game:    src/game/      - Core game logic (initialization, validation, state)
 * - Rules:   src/rules/     - Game rules enforcement (movement, credibility, wins)
 *
 * @module game
 */

// =============================================================================
// TYPE IMPORTS
// =============================================================================

import type {
  Piece,
  GamePieceInfo,
  Tile,
  BoardTile,
  TileReceivingSpace,
  Player,
  GameState,
  DropLocation,
  BankSpace,
  TrackedMove,
  DefinedMove,
  BureaucracyItemType,
  BureaucracyMoveType,
  PromotionLocationType,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
  ChallengeState,
  PlayedTileState,
} from "./src/types";

import { DefinedMoveType, MoveRequirementType } from "./src/types";

// =============================================================================
// CONFIGURATION IMPORTS
// =============================================================================

import {
  TOTAL_TILES,
  PLAYER_OPTIONS,
  BOARD_IMAGE_URLS,
  TILE_IMAGE_URLS,
  TILE_KREDCOIN_VALUES,
  PIECE_TYPES,
  PIECE_COUNTS_BY_PLAYER_COUNT,
  DROP_LOCATIONS_BY_PLAYER_COUNT,
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
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
} from "./src/config";

// =============================================================================
// UTILITY IMPORTS
// =============================================================================

import { BOARD_CENTERS, isPositionInCommunityCircle, calculatePieceRotation } from "./src/utils/positioning";
import { formatLocationId } from "./src/utils/formatting";
import { shuffle } from "./src/utils/array";

// =============================================================================
// GAME LOGIC IMPORTS
// =============================================================================

import {
  // Initialization
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
  // State management
  createGameStateSnapshot,
  getChallengeOrder,
  // Location utilities
  findNearestVacantLocation,
  getLocationIdFromPosition,
  getPlayerIdFromLocationId,
  isLocationOwnedByPlayer,
  // Tile validation
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
  getTileRequirements,
  tileHasRequirements,
  areAllTileRequirementsMet,
  canTileBeRejected,
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateSingleMove,
  // Bureaucracy
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
  // Move types
  determineMoveType,
  validatePurchasedMove,
} from "./src/game";

// =============================================================================
// RULES IMPORTS
// =============================================================================

import {
  // Credibility
  deductCredibility,
  handleCredibilityLoss,
  // Win conditions
  checkPlayerWinCondition,
  checkBureaucracyWinCondition,
  // Adjacency
  getNextPlayerClockwise,
  getPrevPlayerClockwise,
  areSeatsAdjacent,
  getAdjacentSeats,
  canMoveFromCommunity,
  // Rostrum rules
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  countPiecesInPlayerRostrums,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement,
  // Movement validation
  validatePieceMovement,
  validateMoveType,
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
} from "./src/rules";

// =============================================================================
// RE-EXPORTS (Backwards Compatibility)
// =============================================================================

export {
  // Initialization
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
  // State management
  createGameStateSnapshot,
  getChallengeOrder,
  // Location utilities
  findNearestVacantLocation,
  getLocationIdFromPosition,
  getPlayerIdFromLocationId,
  isLocationOwnedByPlayer,
  // Tile validation
  isMoveAllowedInTilePlayOption,
  getMoveRequirement,
  getTileRequirements,
  tileHasRequirements,
  areAllTileRequirementsMet,
  canTileBeRejected,
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateSingleMove,
  // Credibility
  deductCredibility,
  handleCredibilityLoss,
  // Win conditions
  checkPlayerWinCondition,
  checkBureaucracyWinCondition,
  // Adjacency
  getNextPlayerClockwise,
  getPrevPlayerClockwise,
  areSeatsAdjacent,
  getAdjacentSeats,
  canMoveFromCommunity,
  // Rostrum rules
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  countPiecesInPlayerRostrums,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement,
  // Movement validation
  validatePieceMovement,
  validateMoveType,
  validateAdvanceMove,
  validateWithdrawMove,
  validateRemoveMove,
  validateInfluenceMove,
  validateAssistMove,
  validateOrganizeMove,
  // Bureaucracy
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
  // Move types
  determineMoveType,
  validatePurchasedMove,
};
