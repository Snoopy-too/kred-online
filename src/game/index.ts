// Complex validation logic - move and tile play validation
export { validateTileRequirements } from "./validation";
// Location utilities - position and location ID management
export { isLocationOwnedByPlayer } from "./locations";
// Barrel file for game module
// Core game logic and initialization functions

// Game initialization - player and piece setup
export { initializePlayers, initializePieces, initializeCampaignPieces } from "./initialization";

// State snapshots - game state management and challenge order
export { createGameStateSnapshot, getChallengeOrder } from "./state-snapshots";

// Location utilities - position and location ID management
export { getPlayerIdFromLocationId, findNearestVacantLocation, getLocationIdFromPosition } from "./locations";

// Tile validation - tile requirement checking and validation
export {
	isMoveAllowedInTilePlayOption,
	getMoveRequirement,
	getTileRequirements,
	tileHasRequirements,
	areAllTileRequirementsMet,
	canTileBeRejected
} from "./tile-validation";

// Complex validation logic - move and tile play validation
export { validateMovesForTilePlay, validateTileRequirementsWithImpossibleMoveExceptions, validateSingleMove } from "./validation";

// Bureaucracy system - kredcoin calculation, turn order, and promotions
export {
	getBureaucracyMenu,
	getBureaucracyTurnOrder,
	calculatePlayerKredcoin,
	getAvailablePurchases,
	validatePromotion,
	performPromotion
} from "./bureaucracy";

// Move type utilities - move type determination and validation
export { determineMoveType, validatePurchasedMove } from "./move-types";

// Move calculation - track and calculate player moves
export { calculateMoves } from "./move-calculation";

// Win conditions - check if players have achieved victory
export { checkPlayerWinCondition, checkBureaucracyWinCondition } from "../rules/win-conditions";

// Credibility - credibility deduction and loss handling
export { deductCredibility, handleCredibilityLoss } from "../rules/credibility";
