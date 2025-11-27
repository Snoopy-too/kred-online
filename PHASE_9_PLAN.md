# Phase 9: Future Refactoring Plan

## Current Status (as of Phase 8 completion)

### App.tsx Metrics

- **Starting size**: ~4,100 lines
- **Current size**: 3,341 lines
- **Reduction**: ~759 lines (18.5%)

### Extracted Modules Summary

| Module                                    | Lines  | Purpose                                   |
| ----------------------------------------- | ------ | ----------------------------------------- |
| `src/handlers/gameFlowHandlers.ts`        | 381    | Game start, new game, tile selection      |
| `src/handlers/pieceMovementHandlers.ts`   | 380    | Piece movement, board tile handling       |
| `src/handlers/tilePlayHandlers.ts`        | 263    | Tile placement, reveal, transaction       |
| `src/handlers/turnHandlers.ts`            | 215    | Turn log generation, turn advancement     |
| `src/handlers/challengeFlowHandlers.ts`   | 207    | Bystander/receiver challenge flow         |
| `src/components/shared/Modals.tsx`        | 247    | AlertModal, PerfectTileModal, etc.        |
| `src/components/shared/ErrorBoundary.tsx` | 46     | React error boundary                      |
| `src/game/move-calculation.ts`            | 230    | calculateMoves and helpers                |
| `src/hooks/useTakeAdvantage.ts`           | ~600   | Take Advantage handler hook (new pattern) |
| **Total Extracted**                       | ~2,570 |                                           |

---

## Phase 9: Handler Hooks Strategy

### Pattern Established: `useTakeAdvantageHandlers`

We've created a new pattern where **handler hooks** encapsulate:

1. Handler function implementations
2. Dependencies clearly defined in an interface
3. `useCallback` for memoization
4. Helper functions (like validation) that can be pure

This differs from state hooks (like `useChallengeFlow`) which only manage state.

### Benefits of Handler Hooks

1. **Clear dependency documentation** - All required state/setters listed in interface
2. **Testable in isolation** - Can mock dependencies and test handlers
3. **Gradual migration** - Can introduce handlers one at a time
4. **Separation of concerns** - State hooks for state, handler hooks for logic

---

## Remaining Extraction Candidates

### High Priority (Large, Complex)

#### 1. Bureaucracy Phase Handlers (~240 lines in App.tsx)

```
handleSelectBureaucracyMenuItem
handleDoneWithBureaucracyAction
handleFinishBureaucracyTurn
handleCheckBureaucracyMove
handleBureaucracyPieceMove
handleBureaucracyPiecePromote
handleResetBureaucracyAction
```

**Strategy**: Create `useBureaucracyHandlers` hook following same pattern as `useTakeAdvantageHandlers`

**Dependencies needed**:

- From `useBureaucracy`: bureaucracyStates, currentBureaucracyPurchase, etc.
- From `useGameState`: pieces, players, playerCount
- Game logic functions: validateSingleMove, validatePromotion, etc.

#### 2. handleCheckMove (~95 lines)

Move check validation for campaign phase

**Strategy**: Could be extracted to `useMoveCheckHandlers` or added to existing handlers

#### 3. handleChallengerDecision (~160 lines)

Complex challenger flow with Take Advantage initiation

**Strategy**: Could be part of `useChallengeHandlers` (different from challengeFlowHandlers which handles bystander/receiver)

#### 4. handleCorrectionComplete (~55 lines)

Correction phase completion logic

**Strategy**: Add to `useTilePlayHandlers` or create `useCorrectionHandlers`

### Medium Priority (Moderate Complexity)

#### 5. Credential/Bonus Move Handlers (~100 lines total)

```
handleCredibilityGain
handleBonusMoveComplete
handleEndTurn
```

#### 6. transitionToCorrectionPhase (~50 lines)

State transition helper - used by multiple handlers

**Strategy**: This could be a shared utility passed to multiple handler hooks

### Lower Priority (Simpler Extractions)

#### 7. Small Modal Handlers

```
handleConfirmFinishTurn
handleCancelFinishTurn
handleClearBureaucracyValidationError
handleCloseBureaucracyMoveCheckResult
```

These are small but would clean up App.tsx

---

## Integration Strategy

### Step 1: Use Handler Hook in App.tsx

Once a handler hook is created (like `useTakeAdvantageHandlers`), integrate it:

```tsx
// In App.tsx
const {
  handleTakeAdvantageDecline,
  handleTakeAdvantageYes,
  handleRecoverCredibility,
  // ... etc
} = useTakeAdvantageHandlers({
  // Pass all required dependencies
  takeAdvantageChallengerId,
  players,
  pieces,
  // ... etc
});
```

### Step 2: Remove Old Handlers

After integration and testing, remove the inline handlers from App.tsx

### Step 3: Repeat for Each Handler Group

---

## Alternative Strategies

### Strategy A: Container Component Pattern

Instead of handler hooks, create container components that handle logic:

```tsx
<TakeAdvantageContainer
  players={players}
  pieces={pieces}
  // ...
  render={({ handleDecline, handleYes }) => (
    <TakeAdvantageModal onDecline={handleDecline} onYes={handleYes} />
  )}
/>
```

**Pros**: More React-idiomatic, easier testing
**Cons**: More restructuring required

### Strategy B: State Machine (XState)

Model game states as a state machine:

```typescript
const gameMachine = createMachine({
  states: {
    PLAYER_SELECTION: {
      /* ... */
    },
    DRAFTING: {
      /* ... */
    },
    CAMPAIGN: {
      states: {
        PLAYING_TILE: {
          /* ... */
        },
        PENDING_CHALLENGE: {
          /* ... */
        },
        TAKE_ADVANTAGE: {
          /* ... */
        },
        CORRECTION: {
          /* ... */
        },
      },
    },
    BUREAUCRACY: {
      /* ... */
    },
  },
});
```

**Pros**: Clear state transitions, guards, easier reasoning
**Cons**: Major refactor, new dependency

### Strategy C: Event-Driven Architecture

Use an event bus or reducer pattern:

```typescript
dispatch({ type: "TAKE_ADVANTAGE_DECLINE", challengerId });
// Handlers become reducers or event listeners
```

**Pros**: Decoupled, predictable
**Cons**: Requires significant restructuring

---

## Recommendations

### Short Term (Immediate)

1. **Integrate `useTakeAdvantageHandlers`** into App.tsx to validate the pattern
2. **Create `useBureaucracyHandlers`** using the same pattern
3. Continue reducing App.tsx incrementally

### Medium Term (Next Sprint)

1. Extract remaining handler groups
2. Consider grouping related hooks into feature modules:
   - `src/features/takeAdvantage/`
   - `src/features/bureaucracy/`
   - `src/features/challenge/`

### Long Term (Future Consideration)

1. Evaluate if XState makes sense for game state management
2. Consider splitting CampaignScreen into smaller components
3. Add comprehensive unit tests for extracted modules

---

## Notes

### Why Some Extractions Are Difficult

1. **Circular state dependencies** - Handlers update state that other handlers read
2. **Cross-cutting concerns** - Game log, pieces, players used everywhere
3. **Callback chains** - Handler A calls Handler B after state update
4. **Transition logic** - Complex if/else determining next game state

### Pre-existing Issues to Address Later

1. `Player` type missing `name` property (uses `getPlayerName` helper instead)
2. Some type exports missing from `game.ts` (BureaucracyMenuItem, etc.)
3. Lint warnings about unused variables in some handlers

---

## Files Reference

### Handler Factories (`src/handlers/`)

- Factory pattern, take dependencies, return handler objects
- Used via `createXxxHandlers()` in App.tsx

### State Hooks (`src/hooks/`)

- React hooks managing related state
- Return state values and setters

### Handler Hooks (`src/hooks/useXxxHandlers.ts`)

- **NEW PATTERN** - React hooks that provide handler functions
- Take dependencies interface, return handler functions
- Use `useCallback` for memoization
