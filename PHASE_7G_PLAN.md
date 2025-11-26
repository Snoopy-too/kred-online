# Phase 7g: Extract Custom Hooks

**Status**: 🚧 In Progress  
**Goal**: Extract 59 useState calls from App.tsx into logical custom hooks  
**Target**: Reduce App.tsx from 4,126 lines to <1,000 lines  
**Risk**: HIGH - Core state management refactor

## Overview

App.tsx currently has **59 useState calls** managing all game state. This phase extracts these into 9 logical custom hooks for better organization, reusability, and maintainability.

## Current State Analysis

**App.tsx Stats**:

- Lines: 4,126 (down from 6,821 original)
- useState calls: 59
- Functions/handlers: ~40
- Already extracted: 5 screen components ✅

**State Categories** (by related functionality):

1. **Core Game State** (9 variables):

   - gameState, players, pieces, boardTiles, bankedTiles
   - playerCount, currentPlayerIndex, draftRound, isTestMode

2. **Tile Play Workflow** (8 variables):

   - playedTile, movesThisTurn, hasPlayedTileThisTurn, revealedTileId
   - tileTransaction, receiverAcceptance, tileRejected
   - dummyTile (drag preview)

3. **Challenge Flow** (11 variables):

   - challengedTile, bystanders, bystanderIndex, isPrivatelyViewing
   - showChallengeRevealModal, challengeOrder, currentChallengerIndex
   - showTakeAdvantageModal, takeAdvantageChallengerId
   - selectedTilesForAdvantage, totalKredcoinForAdvantage, showTakeAdvantageMenu

4. **Bureaucracy Phase** (9 variables):

   - bureaucracyStates, bureaucracyTurnOrder, showBureaucracyMenu
   - bureaucracyValidationError, bureaucracyMoves, bureaucracySnapshot
   - bureaucracyMoveCheckResult, pendingCommunityPieces, showFinishTurnConfirm

5. **Move Tracking** (7 variables):

   - piecesAtTurnStart, piecesBeforeBonusMove, piecesAtCorrectionStart
   - movedPiecesThisTurn, moveCheckResult, showMoveCheckResult
   - lastDroppedPosition, lastDroppedPieceId

6. **Bonus Moves** (4 variables):

   - showBonusMoveModal, bonusMovePlayerId, bonusMoveWasCompleted
   - showPerfectTileModal

7. **Test Mode** (6 variables):

   - isGameLogExpanded, isCredibilityAdjusterExpanded, isCredibilityRulesExpanded
   - isPieceTrackerExpanded, gameLog, credibilityRotationAdjustments

8. **Board Display** (2 variables):

   - boardRotationEnabled, showGridOverlay

9. **Alerts/Modals** (3 variables):
   - alertModal, challengeResultMessage, tilePlayerMustWithdraw
   - placerViewingTileId, giveReceiverViewingTileId

## Proposed Hook Structure

### 1. `useGameState.ts` (~200 lines, 15 tests)

**Purpose**: Core game state and initialization  
**State**: gameState, players, pieces, boardTiles, bankedTiles, playerCount, currentPlayerIndex, draftRound, isTestMode  
**Functions**: initializeGame, updateGameState, setCurrentPlayer, nextTurn  
**Dependencies**: None (foundation hook)

### 2. `useTilePlayWorkflow.ts` (~150 lines, 12 tests)

**Purpose**: Tile placement and acceptance workflow  
**State**: playedTile, movesThisTurn, hasPlayedTileThisTurn, revealedTileId, tileTransaction, receiverAcceptance, tileRejected  
**Functions**: startTilePlay, recordMove, finalizeTilePlay, resetTilePlay  
**Dependencies**: useGameState (players, pieces)

### 3. `useChallengeFlow.ts` (~180 lines, 15 tests)

**Purpose**: Challenge and advantage mechanics  
**State**: challengedTile, bystanders, bystanderIndex, isPrivatelyViewing, showChallengeRevealModal, challengeOrder, currentChallengerIndex, showTakeAdvantageModal, takeAdvantageChallengerId, selectedTilesForAdvantage, totalKredcoinForAdvantage, showTakeAdvantageMenu  
**Functions**: initiateChallengeRound, processChallengeResponse, calculateAdvantage  
**Dependencies**: useGameState (players)

### 4. `useBureaucracy.ts` (~200 lines, 18 tests)

**Purpose**: Bureaucracy phase state and validation  
**State**: bureaucracyStates, bureaucracyTurnOrder, showBureaucracyMenu, bureaucracyValidationError, bureaucracyMoves, bureaucracySnapshot, bureaucracyMoveCheckResult, pendingCommunityPieces, showFinishTurnConfirm  
**Functions**: startBureaucracyPhase, recordBureaucracyMove, validateBureaucracy, finishBureaucracyTurn  
**Dependencies**: useGameState (players, pieces), useMoveTracking

### 5. `useMoveTracking.ts` (~120 lines, 10 tests)

**Purpose**: Track piece movements and validation  
**State**: piecesAtTurnStart, piecesBeforeBonusMove, piecesAtCorrectionStart, movedPiecesThisTurn, moveCheckResult, showMoveCheckResult, lastDroppedPosition, lastDroppedPieceId  
**Functions**: snapshotPieces, trackMove, validateMoves, compareMoveSets  
**Dependencies**: useGameState (pieces)

### 6. `useBonusMoves.ts` (~100 lines, 8 tests)

**Purpose**: Bonus move mechanics  
**State**: showBonusMoveModal, bonusMovePlayerId, bonusMoveWasCompleted, showPerfectTileModal  
**Functions**: initiateBonusMove, completeBonusMove, cancelBonusMove  
**Dependencies**: useGameState (players), useMoveTracking

### 7. `useTestMode.ts` (~80 lines, 5 tests)

**Purpose**: Test mode features and debugging  
**State**: isGameLogExpanded, isCredibilityAdjusterExpanded, isCredibilityRulesExpanded, isPieceTrackerExpanded, gameLog, credibilityRotationAdjustments  
**Functions**: addLogEntry, toggleSection, adjustCredibility  
**Dependencies**: None (standalone)

### 8. `useBoardDisplay.ts` (~60 lines, 5 tests)

**Purpose**: Board rendering controls  
**State**: boardRotationEnabled, showGridOverlay, dummyTile  
**Functions**: toggleRotation, toggleGrid, setDummyPreview  
**Dependencies**: None (display-only)

### 9. `useAlerts.ts` (~60 lines, 5 tests)

**Purpose**: Modal and alert management  
**State**: alertModal, challengeResultMessage, tilePlayerMustWithdraw, placerViewingTileId, giveReceiverViewingTileId  
**Functions**: showAlert, closeAlert, showMessage, clearMessage  
**Dependencies**: None (UI-only)

## Execution Plan

### Phase A: Setup & Core State ✅

- [x] Create PHASE_7G_PLAN.md
- [ ] Create `src/hooks/` directory
- [ ] Create `src/hooks/index.ts` for exports

### Phase B: Foundation Hooks (no dependencies)

**Order**: Extract hooks with no dependencies first

- [ ] B1: useTestMode (standalone)
- [ ] B2: useBoardDisplay (standalone)
- [ ] B3: useAlerts (standalone)
- [ ] B4: useGameState (foundation for others)

### Phase C: Dependent Hooks

**Order**: Extract hooks that depend on foundation

- [ ] C1: useMoveTracking (depends on useGameState)
- [ ] C2: useTilePlayWorkflow (depends on useGameState)
- [ ] C3: useBonusMoves (depends on useGameState, useMoveTracking)
- [ ] C4: useChallengeFlow (depends on useGameState)
- [ ] C5: useBureaucracy (depends on useGameState, useMoveTracking)

### Phase D: Integration

- [ ] D1: Update App.tsx to import all hooks
- [ ] D2: Replace useState calls with hook usage
- [ ] D3: Update handler functions to use hook setters
- [ ] D4: Remove unused state variables

### Phase E: Testing & Validation

- [ ] E1: Run npm test (verify 842 tests pass)
- [ ] E2: Run npm run build (verify production build)
- [ ] E3: Manual testing of all game phases
- [ ] E4: Fix any breaking changes

### Phase F: Documentation

- [ ] F1: Update REFACTORING_PROGRESS.md
- [ ] F2: Update PHASE_7_PLAN.md
- [ ] F3: Create hook documentation (JSDoc)
- [ ] F4: Git commit and push

## Risk Assessment

### HIGH RISK Areas:

1. **State Dependencies**: Many state variables reference each other
2. **Event Handlers**: 40+ handlers that modify state
3. **Complex Workflows**: Tile play, challenge, bureaucracy flows are tightly coupled
4. **Type Safety**: Must maintain TypeScript types across hooks

### Mitigation Strategies:

1. **Incremental Approach**: Extract one hook at a time, test after each
2. **Keep Tests Running**: Run `npm test` after each hook extraction
3. **Preserve Function Signatures**: Don't change handler APIs
4. **Type Exports**: Export all types from hooks
5. **Rollback Plan**: Each hook is a separate commit for easy revert

## Expected Outcomes

### Before:

- App.tsx: 4,126 lines
- 59 useState calls in one file
- Complex state management
- Hard to test individual features

### After:

- App.tsx: ~1,000 lines (75% reduction!)
- 9 focused custom hooks
- Clear separation of concerns
- Reusable hooks for future components
- Better testability

### Test Impact:

- Current: 842 tests passing
- New: +88 hook-specific tests
- Total: ~930 tests
- Coverage: Should increase with isolated hook tests

## Success Criteria

- [ ] All 59 useState calls moved to custom hooks
- [ ] App.tsx reduced to <1,200 lines (stretch: <1,000)
- [ ] All 842+ tests passing
- [ ] Build succeeds with no errors
- [ ] No TypeScript errors
- [ ] All game phases working correctly
- [ ] Hooks have JSDoc documentation
- [ ] Progress documented

## Timeline Estimate

- Phase A (Setup): 15 minutes
- Phase B (Foundation): 2 hours
- Phase C (Dependent): 4 hours
- Phase D (Integration): 1.5 hours
- Phase E (Testing): 1 hour
- Phase F (Documentation): 30 minutes

**Total**: ~9 hours of focused work

## Notes

- This is the FINAL major refactoring for Phase 7
- After this, App.tsx should be a simple orchestration layer
- Hooks can be reused if we add more screen components
- Consider moving hooks to npm package in future
