export { areAllTileRequirementsMet, getTileRequirements } from './game/tile-validation';
// Barrel file for all shared exports

export * from './types';

// Config
export * from './config';

// Game logic
export {
  initializePlayers,
  initializePieces
} from './game/initialization';
export { getChallengeOrder } from './game/state-snapshots';
export { validateTileRequirements, validateTileRequirementsWithImpossibleMoveExceptions } from './game/validation';

// Rules
export {
  deductCredibility,
  handleCredibilityLoss
} from './rules/credibility';
export { checkPlayerWinCondition } from './rules/win-conditions';
export { getNextPlayerClockwise, getPrevPlayerClockwise } from './rules/adjacency';
export {
  getPlayerRostrumRules,
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  areBothRostrumsFilledForPlayer,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  validateAdjacentRostrumMovement
} from './rules/rostrum';
export { validatePieceMovement } from './rules/movement';
export { validateAdvanceMove, validateWithdrawMove } from './rules/move-validation';

// Utilities
export { shuffle } from './utils/array';
export { calculatePieceRotation } from './utils/positioning';
export { formatLocationId } from './utils/formatting';
export { getPieceById, getPiecesAtLocation, isLocationOccupied } from './utils/pieces';
