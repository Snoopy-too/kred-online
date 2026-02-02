// Barrel file for rules module
// Game rules enforcement and validation logic


// Credibility system - credibility loss and deduction
export { deductCredibility, handleCredibilityLoss } from "./credibility";

// Win conditions - game victory checking
export { checkPlayerWinCondition } from "./win-conditions";

// Adjacency rules - seat and player positioning logic
export {
	getNextPlayerClockwise,
	getPrevPlayerClockwise
} from "./adjacency";

// Rostrum rules - support requirements and adjacency
export {
	getPlayerRostrumRules,
	getRostrumSupportRule,
	countPiecesInSeats,
	areSupportingSeatsFullForRostrum,
	areBothRostrumsFilledForPlayer,
	areRostrumsAdjacent,
	getAdjacentRostrum,
	validateAdjacentRostrumMovement
} from "./rostrum";
export { ROSTRUM_SUPPORT_RULES, ROSTRUM_ADJACENCY_BY_PLAYER_COUNT } from "../config/rules";

// Movement validation - piece movement rules and move type determination
export {
	validatePieceMovement
} from "./movement";

// Move validation - specific move type validators (ADVANCE, WITHDRAW, etc.)
export {
	validateAdvanceMove
} from "./move-validation";
