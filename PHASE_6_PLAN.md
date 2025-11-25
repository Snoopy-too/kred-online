# Phase 6: Game Logic Extraction - Tile Validation & Bureaucracy

**Status**: Planning
**Date**: November 25, 2025
**Target**: Extract remaining game logic functions from game.ts before component extraction

---

## Current State Analysis

### Files to Refactor

- `game.ts`: 1,933 lines (down from 3,803, 49.2% reduction so far)
- `App.tsx`: 7,782 lines (will be Phase 7)

### Completed Phases

- ✅ Phase 1-4: Config, Types, Utils, Initialization (606 tests)
- ✅ Phase 5: Core game logic & rules (state-snapshots, locations, credibility, win-conditions, adjacency, rostrum, movement)

### Remaining Functions in game.ts (24 functions)

#### Tile Validation Logic (6 functions)

1. `isMoveAllowedInTilePlayOption()` - Check if move type allowed in tile play option
2. `getMoveRequirement()` - Get move requirement from tile requirements
3. `getTileRequirements()` - Get tile requirements by tile ID
4. `tileHasRequirements()` - Check if tile has requirements
5. `areAllTileRequirementsMet()` - Validate all tile requirements met
6. `canTileBeRejected()` - Check if tile can be rejected

#### Move Validation Logic (9 functions)

7. `validateMovesForTilePlay()` - Validate moves for tile play
8. `validateTileRequirements()` - Validate tile requirements
9. `validateTileRequirementsWithImpossibleMoveExceptions()` - Extended tile requirement validation
10. `validateAdvanceMove()` - Validate ADVANCE move
11. `validateWithdrawMove()` - Validate WITHDRAW move
12. `validateRemoveMove()` - Validate REMOVE move
13. `validateInfluenceMove()` - Validate INFLUENCE move
14. `validateAssistMove()` - Validate ASSIST move
15. `validateOrganizeMove()` - Validate ORGANIZE move
16. `validateSingleMove()` - Validate single move

#### Bureaucracy Logic (6 functions)

17. `calculatePlayerKredcoin()` - Calculate player kredcoin
18. `getBureaucracyTurnOrder()` - Get turn order for bureaucracy phase
19. `getBureaucracyMenu()` - Get bureaucracy menu by player count
20. `getAvailablePurchases()` - Get available purchases for player
21. `validatePromotion()` - Validate promotion move
22. `performPromotion()` - Execute promotion

#### Move Type Logic (2 functions)

23. `determineMoveType()` - Determine move type from source/destination
24. `validatePurchasedMove()` - Validate purchased move in bureaucracy

---

## Phase 6 Extraction Plan

### Phase 6a: Tile Validation (6 functions) - PRIORITY 1

**Module**: `src/game/tile-validation.ts`

Extract tile requirement checking and validation:

- [ ] `getTileRequirements()`
- [ ] `tileHasRequirements()`
- [ ] `isMoveAllowedInTilePlayOption()`
- [ ] `getMoveRequirement()`
- [ ] `areAllTileRequirementsMet()`
- [ ] `canTileBeRejected()`

**Estimated**: ~150 lines, 20-25 tests

### Phase 6b: Move Validation - Specific Move Types (6 functions) - PRIORITY 2

**Module**: `src/rules/move-validation.ts` (extend existing)

Extract specific move type validators:

- [ ] `validateAdvanceMove()`
- [ ] `validateWithdrawMove()`
- [ ] `validateRemoveMove()`
- [ ] `validateInfluenceMove()`
- [ ] `validateAssistMove()`
- [ ] `validateOrganizeMove()`

**Estimated**: ~300 lines, 30-35 tests

### Phase 6c: Complex Validation Logic (3 functions) - PRIORITY 3

**Module**: `src/game/validation.ts`

Extract complex validation functions:

- [ ] `validateMovesForTilePlay()`
- [ ] `validateTileRequirements()`
- [ ] `validateTileRequirementsWithImpossibleMoveExceptions()`
- [ ] `validateSingleMove()`

**Estimated**: ~200 lines, 25-30 tests

### Phase 6d: Bureaucracy System (6 functions) - PRIORITY 4

**Module**: `src/game/bureaucracy.ts`

Extract bureaucracy phase logic:

- [ ] `calculatePlayerKredcoin()`
- [ ] `getBureaucracyTurnOrder()`
- [ ] `getBureaucracyMenu()`
- [ ] `getAvailablePurchases()`
- [ ] `validatePromotion()`
- [ ] `performPromotion()`

**Estimated**: ~250 lines, 30-35 tests

### Phase 6e: Move Type Utilities (2 functions) - PRIORITY 5

**Module**: `src/game/move-types.ts`

Extract move type determination:

- [ ] `determineMoveType()`
- [ ] `validatePurchasedMove()`

**Estimated**: ~150 lines, 15-20 tests

---

## Extraction Order (Step-by-Step)

### Session 1: Tile Validation (Phase 6a)

1. Create `src/__tests__/game/tile-validation.test.ts`
2. Write tests for all 6 functions
3. Create `src/game/tile-validation.ts`
4. Extract `getTileRequirements()` → verify → commit
5. Extract `tileHasRequirements()` → verify → commit
6. Extract `isMoveAllowedInTilePlayOption()` → verify → commit
7. Extract `getMoveRequirement()` → verify → commit
8. Extract `areAllTileRequirementsMet()` → verify → commit
9. Extract `canTileBeRejected()` → verify → commit
10. Update `src/game/index.ts` barrel export

**Checkpoint**: 6 commits, ~150 lines extracted, 20-25 new tests

### Session 2: Specific Move Validators (Phase 6b)

1. Create `src/__tests__/rules/move-validation.test.ts`
2. Write tests for all 6 validators
3. Create `src/rules/move-validation.ts` (or extend existing)
4. Extract `validateAdvanceMove()` → verify → commit
5. Extract `validateWithdrawMove()` → verify → commit
6. Extract `validateRemoveMove()` → verify → commit
7. Extract `validateInfluenceMove()` → verify → commit
8. Extract `validateAssistMove()` → verify → commit
9. Extract `validateOrganizeMove()` → verify → commit
10. Update `src/rules/index.ts` barrel export

**Checkpoint**: 6 commits, ~300 lines extracted, 30-35 new tests

### Session 3: Complex Validation (Phase 6c)

1. Create `src/__tests__/game/validation.test.ts`
2. Write tests for all 4 functions
3. Create `src/game/validation.ts`
4. Extract `validateMovesForTilePlay()` → verify → commit
5. Extract `validateTileRequirements()` → verify → commit
6. Extract `validateTileRequirementsWithImpossibleMoveExceptions()` → verify → commit
7. Extract `validateSingleMove()` → verify → commit
8. Update `src/game/index.ts` barrel export

**Checkpoint**: 4 commits, ~200 lines extracted, 25-30 new tests

### Session 4: Bureaucracy Logic (Phase 6d)

1. Create `src/__tests__/game/bureaucracy.test.ts`
2. Write tests for all 6 functions
3. Create `src/game/bureaucracy.ts`
4. Extract `calculatePlayerKredcoin()` → verify → commit
5. Extract `getBureaucracyTurnOrder()` → verify → commit
6. Extract `getBureaucracyMenu()` → verify → commit
7. Extract `getAvailablePurchases()` → verify → commit
8. Extract `validatePromotion()` → verify → commit
9. Extract `performPromotion()` → verify → commit
10. Update `src/game/index.ts` barrel export

**Checkpoint**: 6 commits, ~250 lines extracted, 30-35 new tests

### Session 5: Move Type Utils (Phase 6e)

1. Create `src/__tests__/game/move-types.test.ts`
2. Write tests for both functions
3. Create `src/game/move-types.ts`
4. Extract `determineMoveType()` → verify → commit
5. Extract `validatePurchasedMove()` → verify → commit
6. Update `src/game/index.ts` barrel export

**Checkpoint**: 2 commits, ~150 lines extracted, 15-20 tests

---

## Expected Outcomes

### After Phase 6 Completion

- **game.ts size**: ~900-1,000 lines (from 1,933, another ~900 lines removed)
- **Total reduction**: ~75% from original 3,803 lines
- **New tests**: ~120-145 tests (total ~720-750 tests)
- **New modules**: 5 modules (tile-validation, move-validation, validation, bureaucracy, move-types)
- **Total commits**: ~24 atomic commits

### File Structure After Phase 6

```
src/
├── game/
│   ├── index.ts
│   ├── initialization.ts (existing)
│   ├── state-snapshots.ts (existing)
│   ├── locations.ts (existing)
│   ├── tile-validation.ts (NEW - 6 functions)
│   ├── validation.ts (NEW - 4 functions)
│   ├── bureaucracy.ts (NEW - 6 functions)
│   └── move-types.ts (NEW - 2 functions)
├── rules/
│   ├── index.ts
│   ├── credibility.ts (existing)
│   ├── win-conditions.ts (existing)
│   ├── adjacency.ts (existing)
│   ├── rostrum.ts (existing)
│   ├── movement.ts (existing)
│   └── move-validation.ts (NEW - 6 specific validators)
```

---

## Success Criteria

Each extraction must pass:

- [ ] All existing tests pass (606 currently)
- [ ] New tests pass for extracted function
- [ ] Build succeeds (`npm run build`)
- [ ] Dev server loads (`npm run dev`)
- [ ] Function deleted from game.ts
- [ ] Imports updated in consuming files
- [ ] Re-exports added to game.ts for backwards compatibility
- [ ] Committed with clear message

---

## Risk Mitigation

### Potential Issues

1. **Circular dependencies**: tile-validation may depend on move validation

   - Solution: Extract in correct order, use type-only imports where possible

2. **Complex interdependencies**: Functions may call each other

   - Solution: Extract together or ensure proper imports

3. **Test coverage gaps**: Some functions may lack tests
   - Solution: Write tests first before extraction

### Rollback Strategy

- Each commit is atomic and can be reverted independently
- Keep backup branch before starting: `git checkout -b backup-phase-6`

---

## Next Steps After Phase 6

### Phase 7: React Component Extraction

After game.ts is reduced to ~900-1,000 lines of core state management:

1. Extract screen components from App.tsx
2. Create custom hooks for state management
3. Extract UI components to `src/components/`

**Target**: Reduce App.tsx from 7,782 lines to <1,000 lines

---

## Getting Started

To begin Phase 6a (Tile Validation):

```bash
# Ensure we're on refactoring branch with clean state
git checkout refactoring
git status

# Create test file first
touch src/__tests__/game/tile-validation.test.ts

# Create module file
touch src/game/tile-validation.ts

# Run tests in watch mode
npm test -- --watch tile-validation
```

Then follow the extraction steps in Session 1.

---

_Plan created: November 25, 2025_
_Goal: Complete Phase 6 before component extraction_
_Estimated time: 8-12 hours across 5 sessions_
