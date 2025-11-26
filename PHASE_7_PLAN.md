# Phase 7: React Component Extraction

**Status**: In Progress - Phase 7e Complete ✅
**Date**: November 26, 2025
**Target**: Extract React components from App.tsx to improve organization and maintainability

---

## Current State Analysis

### Files to Refactor

- `App.tsx`: 4,126 lines (reduced from 6,821 after Phase 7e)
- `game.ts`: 975 lines (✅ Phase 6 complete - core logic extracted)

### Completed Phases

- ✅ Phase 1-4: Config, Types, Utils, Initialization (606 tests)
- ✅ Phase 5: Core game logic & rules (147 tests, 872 lines extracted)
- ✅ Phase 6: Validation & move types (149 tests, 847 lines extracted)
- ✅ Phase 7e: CampaignScreen extraction (20 tests, 2,695 lines extracted)
- **Total**: 842 tests passing, game.ts reduced 74.4%, App.tsx reduced 39.5%

### Current Components in App.tsx (5 remaining components)

1. **`PlayerSelectionScreen`** (lines 95-223) - ~130 lines

   - Player count selection (3, 4, 5 players)
   - Test mode toggle
   - Skip draft/campaign checkboxes
   - Game start button

2. **`DraftingScreen`** (lines 225-274) - ~50 lines

   - Current player display
   - Tile selection grid
   - Keep/Discard buttons
   - Progression to next player/campaign

3. **`BureaucracyScreen`** (lines 276-1041) - ~765 lines

   - Kredcoin display
   - Purchase menu (ADVANCE, WITHDRAW, etc.)
   - Promotion UI
   - Turn progression
   - Winner announcements

4. **✅ `CampaignScreen`** - EXTRACTED to `src/components/screens/CampaignScreen.tsx` (~2,425 lines)

   - Board display with pieces
   - Drag-and-drop piece movement
   - Tile play UI
   - Move validation
   - Credibility tracking
   - Turn management
   - All modals (Challenge, Receiver, Take Advantage, etc.)
   - Test mode controls

5. **`App`** (main component) - ~3,200 lines remaining

   - State management (useState hooks)
   - Game initialization
   - Phase transitions
   - Event handlers
   - Game flow logic

6. **`ErrorDisplay`** (lines 7761-7783) - ~23 lines
   - Simple error boundary display

---

## Phase 7 Extraction Strategy

### Overview

Extract components to `src/components/` with proper separation of concerns:

- **Screens**: Top-level game phase components
- **Shared**: Reusable UI components
- **Board**: Board-related components (pieces, tiles, drag-drop)

### Phase 7a: Shared Components - PRIORITY 1

**Module**: `src/components/shared/`

Extract small, reusable components:

- [ ] `ErrorDisplay` - Error boundary UI (~25 lines)
- [ ] Create test file with 3-5 tests

**Estimated**: ~30 lines, 5 tests
**Impact**: Low risk, high value (establishes pattern)

### Phase 7b: Player Selection Screen - PRIORITY 2

**Module**: `src/components/screens/PlayerSelectionScreen.tsx`

Extract player selection UI:

- [ ] `PlayerSelectionScreen` component (~130 lines)
- [ ] Props interface (onStartGame callback)
- [ ] State (player count, test mode, skip options)
- [ ] Event handlers (player count change, checkbox toggles)
- [ ] Create test file with 8-10 tests

**Estimated**: ~150 lines, 10 tests
**Impact**: Low risk (no complex state, simple UI)

### Phase 7c: Drafting Screen - PRIORITY 3

**Module**: `src/components/screens/DraftingScreen.tsx`

Extract drafting phase UI:

- [ ] `DraftingScreen` component (~50 lines)
- [ ] Props interface (players, currentPlayer, tiles, handlers)
- [ ] Tile selection grid
- [ ] Keep/Discard buttons
- [ ] Create test file with 6-8 tests

**Estimated**: ~70 lines, 8 tests
**Impact**: Low risk (simple UI, minimal state)

### Phase 7d: Bureaucracy Screen - PRIORITY 4

**Module**: `src/components/screens/BureaucracyScreen.tsx`

Extract bureaucracy phase UI:

- [ ] `BureaucracyScreen` component (~765 lines)
- [ ] Props interface (complex - players, pieces, handlers)
- [ ] Purchase menu UI
- [ ] Promotion UI
- [ ] Kredcoin display
- [ ] Turn management
- [ ] Create test file with 12-15 tests

**Estimated**: ~800 lines, 15 tests
**Impact**: Medium risk (complex state, multiple handlers)

**Sub-components to consider**:

- `BureaucracyMenu` - Purchase options display
- `PromotionUI` - Piece promotion interface
- `KredcoinDisplay` - Player kredcoin tracker

### Phase 7e: Campaign Screen - PRIORITY 5 ✅ COMPLETE

**Module**: `src/components/screens/CampaignScreen.tsx`

**Status**: COMPLETE - Extracted in 11 atomic commits (763b65d → 14fd7aa)

**Completed**:

- ✅ `CampaignScreen` component (~2,425 lines)
- ✅ Props interface (100+ props)
- ✅ State hooks and utilities
- ✅ Drag-and-drop handlers
- ✅ Board rendering with rotation
- ✅ Piece drag-and-drop
- ✅ Tile play UI
- ✅ All modals (Challenge, Receiver, Take Advantage, Perfect Tile, etc.)
- ✅ Test mode controls (Board Rotation, Grid Overlay, Check Move)
- ✅ Move tracking and validation
- ✅ Created test file with 20 tests
- ✅ App.tsx integration complete

**Results**: 2,695 lines extracted, 20 tests, App.tsx reduced from 6,821 → 4,126 lines (39.5% reduction)

**Impact**: HIGH RISK - Successfully completed! All 842 tests passing.

**Sub-components to extract**:

- `BoardCanvas` - Board image and rotation
- `PieceLayer` - Draggable pieces
- `TilePlayZone` - Tile placement areas
- `MoveTracker` - Move history display
- `TurnControls` - End turn, undo buttons

### Phase 7f: Board Components - PRIORITY 6

**Module**: `src/components/board/`

Extract board-related sub-components:

- [ ] `BoardCanvas.tsx` - Board image and rotation (~150 lines)
- [ ] `PieceLayer.tsx` - Draggable pieces (~300 lines)
- [ ] `TilePlayZone.tsx` - Tile placement areas (~200 lines)
- [ ] `MoveTracker.tsx` - Move history (~100 lines)
- [ ] `TurnControls.tsx` - Game controls (~100 lines)
- [ ] Create test files (5-8 tests each)

**Estimated**: ~900 lines, 30 tests
**Impact**: Medium risk (complex interactions)

### Phase 7g: Main App Component Refactor - PRIORITY 7

**Module**: `App.tsx` (cleanup)

After extracting screens, refactor main App:

- [ ] Extract custom hooks to `src/hooks/`
  - `useGameState` - Core game state management
  - `useDragAndDrop` - Drag-and-drop logic
  - `useMoveTracking` - Move validation and tracking
  - `useBureaucracy` - Bureaucracy phase logic
- [ ] Simplify App component to route between screens
- [ ] Clean up event handlers
- [ ] Create test files for hooks (10-15 tests each)

**Estimated**: App.tsx reduced to ~500 lines, hooks ~800 lines, 50 tests
**Impact**: HIGH RISK (core state management)

---

## Detailed Extraction Steps

### For Each Component

1. **Write Tests First**

   - Create test file in `src/__tests__/components/[category]/`
   - Test component rendering
   - Test user interactions
   - Test prop handling
   - Verify: `npm test -- [test-file]`

2. **Extract Component**

   - Create file in `src/components/[category]/`
   - Copy component code
   - Define Props interface
   - Add JSDoc comments
   - Export component

3. **Update Imports**

   - Import component in App.tsx
   - Remove old component definition
   - Fix any type issues
   - Verify: `npm run build`

4. **Test Integration**

   - Run full test suite: `npm test -- --run`
   - Manual smoke test: `npm run dev`
   - Verify all functionality works

5. **Commit**
   - `git add -A`
   - `git commit -m "refactor: extract [ComponentName] to [path]"`
   - `git push origin refactoring`

---

## File Structure (Target)

```
src/
├── components/
│   ├── screens/
│   │   ├── PlayerSelectionScreen.tsx
│   │   ├── DraftingScreen.tsx
│   │   ├── BureaucracyScreen.tsx
│   │   └── CampaignScreen.tsx
│   ├── board/
│   │   ├── BoardCanvas.tsx
│   │   ├── PieceLayer.tsx
│   │   ├── TilePlayZone.tsx
│   │   ├── MoveTracker.tsx
│   │   └── TurnControls.tsx
│   ├── shared/
│   │   └── ErrorDisplay.tsx
│   └── index.ts (barrel export)
├── hooks/
│   ├── useGameState.ts
│   ├── useDragAndDrop.ts
│   ├── useMoveTracking.ts
│   ├── useBureaucracy.ts
│   └── index.ts (barrel export)
└── __tests__/
    ├── components/
    │   ├── screens/
    │   │   ├── PlayerSelectionScreen.test.tsx
    │   │   ├── DraftingScreen.test.tsx
    │   │   ├── BureaucracyScreen.test.tsx
    │   │   └── CampaignScreen.test.tsx
    │   ├── board/
    │   │   ├── BoardCanvas.test.tsx
    │   │   ├── PieceLayer.test.tsx
    │   │   ├── TilePlayZone.test.tsx
    │   │   ├── MoveTracker.test.tsx
    │   │   └── TurnControls.test.tsx
    │   └── shared/
    │       └── ErrorDisplay.test.tsx
    └── hooks/
        ├── useGameState.test.ts
        ├── useDragAndDrop.test.ts
        ├── useMoveTracking.test.ts
        └── useBureaucracy.test.ts
```

---

## Estimated Metrics

### Phase 7 Progress

**Completed**:

- ✅ Phase 7e: CampaignScreen extracted (2,695 lines, 20 tests, 11 commits)

**Remaining**:

- Phase 7a: ErrorDisplay (~30 lines, 5 tests)
- Phase 7b: PlayerSelectionScreen (~150 lines, 10 tests)
- Phase 7c: DraftingScreen (~70 lines, 8 tests)
- Phase 7d: BureaucracyScreen (~800 lines, 15 tests)
- Phase 7f: Board components (~900 lines, 30 tests)
- Phase 7g: App refactor + hooks (~800 lines, 50 tests)

### Phase 7 Target (Complete)

- **Components to extract**: 6 more components + hooks
- **Lines to extract from App.tsx**: ~2,750 more lines
- **App.tsx target**: ~500-1,000 lines (routing + high-level state)
- **Tests to add**: ~118 more tests
- **Total tests target**: ~960 tests
- **Commits remaining**: 6-10 commits

### Overall Project After Phase 7 Complete

- **Total lines extracted**: ~12,500 lines (game.ts + App.tsx)
- **App.tsx reduction**: 6,821 → ~500-1,000 lines (target 85-92% reduction)
- **App.tsx current**: 6,821 → 4,126 lines (39.5% reduction so far)
- **game.ts reduction**: 3,803 → 975 lines (74.4% reduction) ✅
- **Total test count target**: ~960 tests
- **Total test count current**: 842 tests
- **Module organization**: Near-complete separation of concerns

---

## Risk Assessment

### Low Risk (Do First)

- ✅ ErrorDisplay (simple, isolated)
- ✅ PlayerSelectionScreen (minimal state)
- ✅ DraftingScreen (simple UI)

### Medium Risk (Do Carefully)

- ⚠️ BureaucracyScreen (complex state, multiple handlers)
- ⚠️ Board components (complex interactions)

### High Risk (Do Last, Test Thoroughly)

- ✅ CampaignScreen (COMPLETE - most complex, central to game)
- 🚨 Custom hooks (core state management - NOT STARTED)

---

## Success Criteria

- [x] Phase 7e complete: CampaignScreen extracted (2,695 lines)
- [x] All 842 tests pass after Phase 7e
- [ ] All remaining components extracted
- [ ] Total 960+ tests passing
- [ ] `npm run build` succeeds
- [ ] `npm run dev` loads successfully
- [ ] Manual smoke test: Can complete full game flow
- [ ] App.tsx reduced to <1,000 lines
- [ ] All components have proper TypeScript types
- [ ] All components have JSDoc comments
- [ ] Barrel exports configured for easy imports

---

## Phase 7e Completion Summary

**Extracted**: `src/components/screens/CampaignScreen.tsx` (2,425 lines)

**Achievements**:

- ✅ Largest component successfully extracted (2,695 lines from App.tsx)
- ✅ 11 atomic commits with full test verification
- ✅ All 842 tests passing (100% pass rate maintained)
- ✅ Build succeeds (334.27 kB)
- ✅ Fixed 13 test failures during extraction
- ✅ All modals, test controls, and features working
- ✅ App.tsx reduced by 39.5%

**Sub-phases completed**:

1. Props interface and component shell (7e.1)
2. State hooks and utilities (7e.2)
3. Drag-and-drop handlers (7e.3)
4. Board container and overlays (7e.4)
5. Board pieces and tiles (7e.5)
6. Player hand UI (7e.6)
7. Side panel controls (7e.7)
8. All modals and test controls (7e.8-7e.10)
9. App.tsx integration (7e.11)

**Next**: Phase 7f or Phase 7b/7c/7d (smaller screens)

---

## Notes

- **Test-First Approach**: Write component tests before extraction
- **Incremental**: One component at a time, verify after each
- **Backwards Compatible**: Old imports work via re-exports initially
- **Clean Imports**: Remove re-exports after confirming stability
- **Component Testing**: Use @testing-library/react for UI tests
- **Hook Testing**: Use @testing-library/react-hooks for hook tests

---

## Next Steps After Phase 7

1. **Phase 8**: Performance optimization

   - Memoization (useMemo, useCallback)
   - Code splitting
   - Lazy loading

2. **Phase 9**: Documentation

   - Component storybook
   - API documentation
   - Developer guide

3. **Phase 10**: Final cleanup
   - Remove any remaining tech debt
   - Final test coverage audit
   - Performance profiling
