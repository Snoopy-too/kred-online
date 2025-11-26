/**
 * Custom Hooks Index
 *
 * Central export point for all custom hooks extracted from App.tsx.
 * Organized by functionality and dependencies.
 */

// Standalone hooks (no dependencies)
export { useTestMode } from "./useTestMode";
export { useBoardDisplay } from "./useBoardDisplay";
export { useAlerts } from "./useAlerts";

// Foundation hook
export { useGameState } from "./useGameState";

// Dependent hooks
export { useMoveTracking } from "./useMoveTracking";
export { useTilePlayWorkflow } from "./useTilePlayWorkflow";
export { useBonusMoves } from "./useBonusMoves";
export { useChallengeFlow } from "./useChallengeFlow";
export { useBureaucracy } from "./useBureaucracy";
export { useBureaucracy } from "./useBureaucracy";
