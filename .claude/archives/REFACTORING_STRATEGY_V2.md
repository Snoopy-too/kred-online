# Refactoring Strategy V2: KRED Online

**Status**: Phase 7 Complete, Phase 8 Ready
**Date**: November 27, 2025
**Tests**: 1,056 passing

---

## Overview

This document tracks the incremental, test-driven refactoring of the KRED online game. The strategy prioritizes safety through atomic commits, comprehensive testing, and thorough verification at each step.

### End Goal

Transform App.tsx from a monolithic 4,109-line file into a thin orchestration layer (~500 lines) similar to how game.ts became a clean 228-line re-export hub.

| File    | Start | Current | Target | Role          |
| ------- | ----- | ------- | ------ | ------------- |
| game.ts | 3,803 | 228 ✅  | 228    | Re-export hub |
| App.tsx | 6,821 | 4,109   | ~500   | Thin shell    |

---

## Completed Phases

### Phase 1: Test Infrastructure ✅

- Vitest setup with React Testing Library
- Initial smoke tests and integration tests
- **Result**: 88 tests passing

### Phase 2: Config Extraction ✅

Extracted static configuration from game.ts to `src/config/`:

| File           | Contents                                            | Tests |
| -------------- | --------------------------------------------------- | ----- |
| constants.ts   | PLAYER_OPTIONS, BOARD_IMAGE_URLS, TOTAL_TILES       | 9     |
| tiles.ts       | TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES               | 9     |
| pieces.ts      | PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT           | 15    |
| board.ts       | DROP_LOCATIONS, TILE_SPACES, BANK_SPACES, etc.      | 40    |
| rules.ts       | DEFINED_MOVES, TILE_PLAY_OPTIONS, TILE_REQUIREMENTS | 158   |
| bureaucracy.ts | Bureaucracy menus by player count                   | 51    |

**Result**: 1,194 lines extracted, 282 tests

### Phase 3: Type Extraction ✅

Extracted TypeScript interfaces to `src/types/`:

- Core types: game.ts, player.ts, piece.ts, tile.ts, move.ts
- Additional: bureaucracy.ts, challenge.ts, played-tile.ts

**Result**: 26 tests for type validation

### Phase 3b: Utils Extraction ✅

Created `src/utils/` with pure utility functions:

| File           | Functions                                           | Tests |
| -------------- | --------------------------------------------------- | ----- |
| positioning.ts | calculatePieceRotation, isPositionInCommunityCircle | 24    |
| formatting.ts  | formatLocationId                                    | 26    |
| array.ts       | shuffle                                             | 12    |

**Result**: 62 tests

### Phase 4: Game Initialization ✅

Extracted initialization logic to `src/game/initialization.ts`:

- initializePlayers()
- initializePieces()
- initializeCampaignPieces()

**Result**: 34 tests

### Phase 5: Game Logic & Rules ✅

Created `src/game/` and `src/rules/` modules:

**Game modules**:

- state-snapshots.ts (21 tests)
- locations.ts (23 tests)

**Rules modules**:

- credibility.ts (13 tests)
- win-conditions.ts (21 tests)
- adjacency.ts (16 tests)
- rostrum.ts (27 tests)
- movement.ts (26 tests)

**Result**: 872 lines, 147 tests

### Phase 6: Validation & Move Types ✅

Completed game logic extraction:

| File               | Functions                  | Tests |
| ------------------ | -------------------------- | ----- |
| tile-validation.ts | 6 validation functions     | 43    |
| validation.ts      | 4 comprehensive validators | 32    |
| bureaucracy.ts     | 6 bureaucracy functions    | 38    |
| move-types.ts      | 2 move type functions      | 26    |

**Result**: 847 lines, 149 tests, game.ts reduced 74%

### Phase 7: React Components & Hooks ✅

The largest phase - restructured the React layer.

#### Phase 7a-7d: Screen Components

Extracted to `src/components/screens/`:

- PlayerSelectionScreen.tsx
- DraftingScreen.tsx
- BureaucracyScreen.tsx
- ErrorDisplay.tsx (to shared/)

#### Phase 7e: CampaignScreen (11 commits)

Extracted the largest component (2,695 lines):

- Component: CampaignScreen.tsx (2,425 lines)
- Tests: 20 component tests
- Sub-phases: Props, state, handlers, board, UI, modals

#### Phase 7g: Custom Hooks (9 hooks)

Created `src/hooks/` with 9 custom hooks:

| Hook                | Lines | State Vars | Purpose         |
| ------------------- | ----- | ---------- | --------------- |
| useAlerts           | 74    | 5          | Alert modals    |
| useBoardDisplay     | 55    | 3          | Board rotation  |
| useTestMode         | 92    | 6          | Test mode, logs |
| useGameState        | 273   | 9          | Core state      |
| useBonusMoves       | 100   | 4          | Bonus moves     |
| useMoveTracking     | 195   | 8          | Move tracking   |
| useTilePlayWorkflow | 242   | 8          | Tile workflow   |
| useChallengeFlow    | 287   | 15         | Challenge flow  |
| useBureaucracy      | 386   | 12         | Bureaucracy     |

**Hook Tests**: 214 tests across 9 test files

**Phase 7 Result**:

- App.tsx: 6,821 → 4,109 lines (40% reduction)
- Hooks: 1,785 lines managing 59 state variables
- Tests: 862 → 1,056 (194 new tests)

---

## Current State

### Codebase Metrics

| File    | Lines | Reduction      |
| ------- | ----- | -------------- |
| game.ts | 975   | 74% from 3,803 |
| App.tsx | 4,109 | 40% from 6,821 |

### Test Coverage

- **Total Tests**: 1,056
- **Unit Tests**: ~1,000
- **Integration Tests**: 55
- **All Passing**: ✅

### Module Structure

```
src/
├── config/        # Static configuration (6 files)
├── types/         # TypeScript interfaces (9 files)
├── utils/         # Pure utilities (4 files)
├── game/          # Game logic (8 files)
├── rules/         # Game rules (6 files)
├── hooks/         # React hooks (10 files)
├── handlers/      # Handler factories (Phase 8) [planned]
├── components/
│   ├── board/     # Board sub-components (Phase 9) [planned]
│   ├── screens/   # Screen components (4 files)
│   └── shared/    # Shared components (1 file)
└── __tests__/     # Test files (46 files)
```

---

## Remaining Phases

### Phase 8: Handler Extraction

**Status**: Ready to Start
**Goal**: Extract ~50 handler functions from App.tsx into organized modules
**Effort**: High (complex interdependencies)
**Benefit**: App.tsx reduced from 4,109 → ~1,500 lines

See **PHASE_8_PLAN.md** for detailed execution plan.

Handler categories (7 modules):

1. `gameFlowHandlers.ts` - Start game, new game, select tile
2. `pieceMovementHandlers.ts` - Piece moves, resets
3. `turnHandlers.ts` - Turn logging, advancement
4. `tilePlayHandlers.ts` - Tile placement, validation
5. `challengeHandlers.ts` - Challenge flow
6. `bureaucracyHandlers.ts` - Bureaucracy phase
7. `takeAdvantageHandlers.ts` - Take advantage flow

**Architecture**: Factory pattern for dependency injection

```typescript
const handlers = createGameFlowHandlers({ state, setters, helpers });
handlers.handleStartGame(3, false, false, false);
```

### Phase 9: Board Component Extraction

**Status**: Planned
**Goal**: Break down CampaignScreen.tsx (2,425 lines) into focused components
**Effort**: Medium
**Benefit**: CampaignScreen reduced to ~500 lines, reusable board components

Target components for `src/components/board/`:

- `GameBoard.tsx` - Main board container
- `BoardPieces.tsx` - Piece rendering layer
- `BoardTiles.tsx` - Tile spaces and placements
- `DropZones.tsx` - Valid drop locations
- `PieceToken.tsx` - Individual piece component
- `TileCard.tsx` - Individual tile component
- `BoardOverlays.tsx` - Modals and overlays

### Phase 10: Final Cleanup

**Status**: Planned
**Goal**: App.tsx becomes a thin shell (~500 lines)
**Effort**: Low

Final App.tsx structure:

```typescript
function App() {
  // Hook initialization (10-15 lines)
  const gameState = useGameState();
  const handlers = useHandlers(gameState);

  // Screen routing (20-30 lines)
  return (
    <ErrorBoundary>
      {gameState.phase === 'PLAYER_SELECTION' && <PlayerSelectionScreen {...} />}
      {gameState.phase === 'DRAFTING' && <DraftingScreen {...} />}
      {gameState.phase === 'CAMPAIGN' && <CampaignScreen {...} />}
      {gameState.phase === 'BUREAUCRACY' && <BureaucracyScreen {...} />}
    </ErrorBoundary>
  );
}
```

---

## Optional Future Phases

### Phase 11: Performance Optimization

**Status**: Optional
**Goal**: Improve rendering performance
**Effort**: Medium

Potential improvements:

- useMemo/useCallback for expensive computations
- React.memo for component memoization
- Code splitting with React.lazy
- Virtual scrolling for large lists

**Recommendation**: Profile first, optimize only proven bottlenecks.

### Phase 12: Documentation & Polish

**Status**: Optional
**Goal**: Improve developer experience
**Effort**: Low-Medium

Potential work:

- Component Storybook
- API documentation
- Architecture decision records
- Contributing guide

**Recommendation**: Do when onboarding new developers.

### Phase 13: Multiplayer (Future Feature)

**Status**: Future
**Goal**: Add real-time multiplayer support
**Effort**: Very High

Required work:

- Socket.IO integration
- Server-side game state
- Turn synchronization
- Reconnection handling

**Recommendation**: Separate project/branch when ready.

---

## Principles Applied

### 1. Test First, Refactor Second

Every extraction had tests before code was moved.

### 2. Move, Don't Copy

Code was deleted from source immediately after extraction.

### 3. Atomic Changes

Each commit was independently testable and reviewable.

### 4. Verify Everything

Build + tests + manual verification at each step.

### 5. Commit Frequently

60+ commits with clear, descriptive messages.

---

## Lessons Learned

1. **Break large extractions into sub-phases**: CampaignScreen needed 11 commits
2. **Custom hooks simplify state**: 59 useState → 9 logical hooks
3. **Tests catch regressions immediately**: Fixed 13 failures during Phase 7e
4. **Atomic commits enable easy debugging**: Can bisect to find issues
5. **Documentation prevents confusion**: Clear plans kept work organized

---

## Success Metrics

### Completed (Phases 1-7)

| Metric            | Target       | Actual                       |
| ----------------- | ------------ | ---------------------------- |
| game.ts reduction | <500 lines   | 228 lines ✅ (94% reduced)   |
| App.tsx reduction | <5,000 lines | 4,109 lines ✅ (40% reduced) |
| Test coverage     | 500+ tests   | 1,056 tests ✅               |
| Build success     | Yes          | Yes ✅                       |
| Game functional   | Yes          | Yes ✅                       |

### Target (Phases 8-10)

| Metric             | Current     | Target     |
| ------------------ | ----------- | ---------- |
| App.tsx            | 4,109 lines | ~500 lines |
| CampaignScreen.tsx | 2,425 lines | ~500 lines |
| Handler modules    | 0           | 7 files    |
| Board components   | 0           | 7 files    |
| Total tests        | 1,056       | ~1,200     |

---

## Conclusion

**Phases 1-7 Complete**: The codebase is now well-organized with:

- game.ts as a clean 228-line re-export hub
- 1,056 comprehensive tests
- Modular architecture (config, types, utils, game, rules, hooks)

**Phases 8-10 Ready**: The path to a fully modular codebase:

- Phase 8: Handler extraction → App.tsx ~1,500 lines
- Phase 9: Board components → CampaignScreen ~500 lines
- Phase 10: Final cleanup → App.tsx ~500 lines

---

_Last Updated: November 27, 2025_
