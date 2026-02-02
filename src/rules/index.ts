// Rostrum utilities
export { getPlayerRostrumRules, countPiecesInPlayerRostrums, areRostrumsAdjacent, getAdjacentRostrum, validateAdjacentRostrumMovement } from "./rostrum";
// Adjacency utilities
export { getPrevPlayerClockwise, getAdjacentSeats, canMoveFromCommunity } from "./adjacency";
// Win conditions - player win checking
export { checkPlayerWinCondition } from "./win-conditions";
// Barrel file for rules module
// Game rules enforcement and validation logic

// Credibility system - credibility loss and deduction
export { deductCredibility, handleCredibilityLoss } from "./credibility";

// Win conditions - game victory checking
export { checkWinCondition, checkBureaucracyWinCondition } from "./win-conditions";

// Adjacency rules - seat and player positioning logic
export { getNextPlayerClockwise, areSeatsAdjacent } from "./adjacency";

// Rostrum rules - support requirements and adjacency
export { getRostrumSupportRule, countPiecesInSeats, areSupportingSeatsFullForRostrum, areBothRostrumsFilledForPlayer, ROSTRUM_SUPPORT_RULES, ROSTRUM_ADJACENCY_BY_PLAYER_COUNT } from "./rostrum";

// Movement validation - piece movement rules and move type determination
export { validatePieceMovement, validateMoveType } from "./movement";

// Move validation - specific move type validators (ADVANCE, WITHDRAW, etc.)
export { validateAdvanceMove, validateWithdrawMove, validateRemoveMove, validateInfluenceMove, validateAssistMove, validateOrganizeMove } from "./move-validation";
