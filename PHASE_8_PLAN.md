# Phase 8: Handler Function Extraction

**Status**: Not Started
**Date**: November 27, 2025
**Goal**: Extract ~50 handler functions from App.tsx into organized modules
**Target**: App.tsx reduced from 4,109 → ~1,500 lines

---

## Overview

Phase 8 extracts the remaining handler functions from App.tsx into logical modules. These handlers orchestrate game logic by calling functions from `src/game/` and `src/rules/` and updating state via hooks.

---

## Handler Inventory (50 functions, ~2,600 lines)

### Category 1: Game Flow Handlers (~175 lines)

| Function           | Line | Description                                   |
| ------------------ | ---- | --------------------------------------------- |
| `handleStartGame`  | 355  | Initialize game with player count and options |
| `handleNewGame`    | 496  | Reset all state for new game                  |
| `handleSelectTile` | 530  | Handle tile selection during drafting         |

**Target Module**: `src/handlers/gameFlowHandlers.ts`

### Category 2: Piece Movement Handlers (~225 lines)

| Function                      | Line | Description                         |
| ----------------------------- | ---- | ----------------------------------- |
| `handlePieceMove`             | 586  | Move piece on board during campaign |
| `handleResetTurn`             | 737  | Reset pieces to turn start          |
| `handleResetPiecesCorrection` | 781  | Reset for correction phase          |
| `handleResetBonusMove`        | 796  | Reset bonus move state              |
| `handleBoardTileMove`         | 809  | Move board tile position            |

**Target Module**: `src/handlers/pieceMovementHandlers.ts`

### Category 3: Turn & Logging Handlers (~175 lines)

| Function                  | Line | Description                      |
| ------------------------- | ---- | -------------------------------- |
| `generateTurnLog`         | 821  | Generate turn action log entries |
| `addCredibilityLossLog`   | 890  | Log credibility loss events      |
| `handleCredibilityGain`   | 914  | Process credibility gain         |
| `handleBonusMoveComplete` | 952  | Complete bonus move flow         |
| `advanceTurnNormally`     | 979  | Advance to next player's turn    |

**Target Module**: `src/handlers/turnHandlers.ts`

### Category 4: Tile Play Handlers (~500 lines)

| Function                  | Line | Description                          |
| ------------------------- | ---- | ------------------------------------ |
| `handleEndTurn`           | 1017 | End turn logic and state transitions |
| `handlePlaceTile`         | 1106 | Place tile to receiving space        |
| `handleRevealTile`        | 1239 | Reveal tile to players               |
| `handleTogglePrivateView` | 1243 | Toggle private view mode             |
| `handlePlacerViewTile`    | 1245 | Placer views played tile             |
| `finalizeTilePlay`        | 1651 | Finalize tile placement              |
| `calculateMoves`          | 2251 | Calculate moves from piece positions |
| `handleCheckMove`         | 2440 | Validate moves against tile          |
| `resolveTransaction`      | 2533 | Resolve tile transaction             |

**Target Module**: `src/handlers/tilePlayHandlers.ts`

### Category 5: Challenge Flow Handlers (~400 lines)

| Function                           | Line | Description                 |
| ---------------------------------- | ---- | --------------------------- |
| `handleReceiverAcceptanceDecision` | 1254 | Receiver accept/reject tile |
| `handlePerfectTileContinue`        | 1423 | Continue after perfect tile |
| `handleChallengerDecision`         | 1452 | Challenger challenge/pass   |
| `handleCorrectionComplete`         | 1915 | Complete correction phase   |
| `handleReceiverDecision`           | 2553 | Legacy receiver decision    |
| `handleBystanderDecision`          | 2606 | Legacy bystander decision   |
| `handleContinueAfterChallenge`     | 2628 | Continue after challenge    |
| `transitionToCorrectionPhase`      | 3099 | Transition to correction    |

**Target Module**: `src/handlers/challengeHandlers.ts`

### Category 6: Bureaucracy Handlers (~400 lines)

| Function                                | Line | Description               |
| --------------------------------------- | ---- | ------------------------- |
| `handleSelectBureaucracyMenuItem`       | 2638 | Select menu item          |
| `handleDoneWithBureaucracyAction`       | 2676 | Complete action           |
| `completeBureaucracyTurn`               | 2854 | Complete bureaucracy turn |
| `handleFinishBureaucracyTurn`           | 2916 | Finish turn               |
| `handleConfirmFinishTurn`               | 2939 | Confirm finish            |
| `handleCancelFinishTurn`                | 2944 | Cancel finish             |
| `handleClearBureaucracyValidationError` | 2948 | Clear validation error    |
| `handleResetBureaucracyAction`          | 2952 | Reset action              |
| `handleCheckBureaucracyMove`            | 2964 | Check bureaucracy move    |
| `handleCloseBureaucracyMoveCheckResult` | 3045 | Close result modal        |
| `handleBureaucracyPieceMove`            | 3049 | Move piece in bureaucracy |
| `handleBureaucracyPiecePromote`         | 3701 | Promote piece             |

**Target Module**: `src/handlers/bureaucracyHandlers.ts`

### Category 7: Take Advantage Handlers (~350 lines)

| Function                          | Line | Description                |
| --------------------------------- | ---- | -------------------------- |
| `handleTakeAdvantageDecline`      | 3145 | Decline take advantage     |
| `handleTakeAdvantageYes`          | 3166 | Accept take advantage      |
| `handleRecoverCredibility`        | 3195 | Recover credibility option |
| `handlePurchaseMove`              | 3228 | Purchase move option       |
| `handleToggleTileSelection`       | 3256 | Toggle tile selection      |
| `handleConfirmTileSelection`      | 3283 | Confirm tile selection     |
| `handleCancelTileSelection`       | 3314 | Cancel tile selection      |
| `handleSelectTakeAdvantageAction` | 3336 | Select TA action           |
| `handleResetTakeAdvantageAction`  | 3388 | Reset TA action            |
| `handleDoneTakeAdvantageAction`   | 3410 | Done with TA action        |
| `validateTakeAdvantageAction`     | 3433 | Validate TA action         |
| `handleCompleteTakeAdvantage`     | 3570 | Complete take advantage    |
| `handleTakeAdvantagePiecePromote` | 3681 | Promote piece in TA        |

**Target Module**: `src/handlers/takeAdvantageHandlers.ts`

---

## Architecture Decision: Handler Factory Pattern

Since handlers need access to multiple hooks' state and setters, we'll use a **factory pattern**:

```typescript
// src/handlers/gameFlowHandlers.ts
export interface GameFlowDependencies {
  // State from hooks
  players: Player[];
  playerCount: number;
  // Setters from hooks
  setPlayers: (players: Player[]) => void;
  setGameState: (state: GameState) => void;
  // Helper functions
  showAlert: (title: string, message: string, type: string) => void;
}

export function createGameFlowHandlers(deps: GameFlowDependencies) {
  return {
    handleStartGame: (
      count: number,
      testMode: boolean,
      skipDraft: boolean,
      skipCampaign: boolean
    ) => {
      // Implementation using deps
    },
    handleNewGame: () => {
      // Implementation using deps
    },
    handleSelectTile: (selectedTile: Tile) => {
      // Implementation using deps
    },
  };
}
```

**Usage in App.tsx**:

```typescript
const gameFlowHandlers = createGameFlowHandlers({
  players, playerCount, setPlayers, setGameState, showAlert, ...
});

// Use handlers
gameFlowHandlers.handleStartGame(3, false, false, false);
```

---

## Execution Plan

### Phase 8.1: Game Flow Handlers

1. Create `src/handlers/gameFlowHandlers.ts`
2. Define dependencies interface
3. Extract 3 handlers
4. Update App.tsx to use factory
5. Add tests
6. Verify all 1,056 tests pass
7. Commit

### Phase 8.2: Piece Movement Handlers

1. Create `src/handlers/pieceMovementHandlers.ts`
2. Extract 5 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.3: Turn & Logging Handlers

1. Create `src/handlers/turnHandlers.ts`
2. Extract 5 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.4: Tile Play Handlers

1. Create `src/handlers/tilePlayHandlers.ts`
2. Extract 9 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.5: Challenge Flow Handlers

1. Create `src/handlers/challengeHandlers.ts`
2. Extract 8 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.6: Bureaucracy Handlers

1. Create `src/handlers/bureaucracyHandlers.ts`
2. Extract 12 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.7: Take Advantage Handlers

1. Create `src/handlers/takeAdvantageHandlers.ts`
2. Extract 13 handlers
3. Update App.tsx
4. Add tests
5. Commit

### Phase 8.8: Final Cleanup

1. Create `src/handlers/index.ts` barrel export
2. Review and optimize App.tsx
3. Final test verification
4. Update documentation
5. Commit

---

## File Structure (Target)

```
src/
├── handlers/
│   ├── index.ts
│   ├── gameFlowHandlers.ts
│   ├── pieceMovementHandlers.ts
│   ├── turnHandlers.ts
│   ├── tilePlayHandlers.ts
│   ├── challengeHandlers.ts
│   ├── bureaucracyHandlers.ts
│   └── takeAdvantageHandlers.ts
└── __tests__/
    └── handlers/
        ├── gameFlowHandlers.test.ts
        ├── pieceMovementHandlers.test.ts
        ├── turnHandlers.test.ts
        ├── tilePlayHandlers.test.ts
        ├── challengeHandlers.test.ts
        ├── bureaucracyHandlers.test.ts
        └── takeAdvantageHandlers.test.ts
```

---

## Expected Outcomes

| Metric          | Before      | After        |
| --------------- | ----------- | ------------ |
| App.tsx         | 4,109 lines | ~1,500 lines |
| Handler modules | 0           | 7 files      |
| Handler tests   | 0           | ~50-70 tests |
| Total tests     | 1,056       | ~1,120       |

---

## Risk Assessment

| Risk                      | Level  | Mitigation                       |
| ------------------------- | ------ | -------------------------------- |
| Complex interdependencies | High   | Factory pattern isolates deps    |
| State synchronization     | Medium | Keep setters as callbacks        |
| Testing difficulty        | Medium | Mock dependencies in tests       |
| Breaking existing tests   | Low    | Atomic commits, verify each step |

---

## Success Criteria

- [ ] All 7 handler modules created
- [ ] App.tsx < 2,000 lines
- [ ] All existing 1,056 tests pass
- [ ] New handler tests pass
- [ ] Game functionality unchanged
- [ ] Build succeeds
- [ ] Manual smoke test passes

---

## Notes

- Handlers are orchestration logic, not business logic
- Business logic stays in `src/game/` and `src/rules/`
- Handlers call business logic and update state
- Factory pattern allows testing handlers in isolation
- Consider using React Context in future for global handlers
