/**
 * Handlers Module
 *
 * Purpose: Barrel file for all handler exports
 * Usage: import { createGameFlowHandlers, createPieceMovementHandlers, createTurnHandlers } from './src/handlers';
 *
 * @module handlers
 */

export {
  createGameFlowHandlers,
  type GameFlowDependencies,
  type GameFlowHandlers,
} from "./gameFlowHandlers";

export {
  createPieceMovementHandlers,
  type PieceMovementDependencies,
  type PieceMovementHandlers,
} from "./pieceMovementHandlers";

export {
  createTurnHandlers,
  type TurnHandlerDependencies,
  type TurnHandlers,
} from "./turnHandlers";
