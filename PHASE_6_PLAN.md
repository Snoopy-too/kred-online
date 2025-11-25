# Phase 6: Game Logic Extraction - Tile Validation & Bureaucracy

**Status**: In Progress - 4 of 5 sub-phases complete ✅
**Date**: November 25, 2025
**Target**: Extract remaining game logic functions from game.ts before component extraction

---

## Current State Analysis

### Files Status

- `game.ts`: 1,104 lines (down from 1,822 at start of Phase 6, 39.4% reduction so far)
- `App.tsx`: 7,782 lines (will be Phase 7)

### Completed Phases

- ✅ Phase 1-4: Config, Types, Utils, Initialization (606 tests)
- ✅ Phase 5: Core game logic & rules (state-snapshots, locations, credibility, win-conditions, adjacency, rostrum, movement)
- ✅ Phase 6a: Tile validation (6 functions, 43 tests) - commit af23ab1
- ✅ Phase 6b: Move validation (6 functions, 36 tests) - commit a594ad9
- ✅ Phase 6c: Complex validation (4 functions, 32 tests) - commit 9570fe6
- ✅ Phase 6d: Bureaucracy system (6 functions, 38 tests) - commit aba05bf
- 🔄 Phase 6e: Move type utilities (2 functions) - IN PROGRESS

### Progress Summary

**Phase 6 Extraction Progress:**

- ✅ **Phase 6a**: Tile validation (6 functions, 43 tests, ~150 lines)
- ✅ **Phase 6b**: Move validation (6 functions, 36 tests, ~280 lines)
- ✅ **Phase 6c**: Complex validation (4 functions, 32 tests, ~220 lines)
- ✅ **Phase 6d**: Bureaucracy system (6 functions, 38 tests, ~230 lines)
- 🔄 **Phase 6e**: Move type utilities (2 functions remaining)

**Total extracted so far**: 22 functions, 149 tests, 718 lines removed (39.4% reduction)
**Current game.ts**: 1,104 lines
**Target after Phase 6e**: ~1,050-1,070 lines

---

## Phase 6 Extraction Status

### ✅ Phase 6a: Tile Validation (6 functions) - COMPLETE

**Module**: `src/game/tile-validation.ts`
**Commit**: af23ab1
**Tests**: 43 tests passing
**Lines extracted**: ~150 lines

Functions extracted:

- ✅ `getTileRequirements()` - Get tile requirements by tile ID
- ✅ `tileHasRequirements()` - Check if tile has requirements
- ✅ `isMoveAllowedInTilePlayOption()` - Check if move type allowed in tile play option
- ✅ `getMoveRequirement()` - Get move requirement from tile requirements
- ✅ `areAllTileRequirementsMet()` - Validate all tile requirements met
- ✅ `canTileBeRejected()` - Check if tile can be rejected

### ✅ Phase 6b: Move Validation - Specific Move Types (6 functions) - COMPLETE

**Module**: `src/rules/move-validation-specific.ts`
**Commit**: a594ad9
**Tests**: 36 tests passing
**Lines extracted**: ~280 lines

Functions extracted:

- ✅ `validateAdvanceMove()` - Validate ADVANCE move (community → seat/rostrum/office)
- ✅ `validateWithdrawMove()` - Validate WITHDRAW move (domain → community)
- ✅ `validateRemoveMove()` - Validate REMOVE move (community → removed)
- ✅ `validateInfluenceMove()` - Validate INFLUENCE move (seat → rostrum)
- ✅ `validateAssistMove()` - Validate ASSIST move (rostrum → office)
- ✅ `validateOrganizeMove()` - Validate ORGANIZE move (seat → adjacent seat)

### ✅ Phase 6c: Complex Validation Logic (4 functions) - COMPLETE

**Module**: `src/game/validation.ts`
**Commit**: 9570fe6
**Tests**: 32 tests passing
**Lines extracted**: ~220 lines

Functions extracted:

- ✅ `validateMovesForTilePlay()` - Validate max 2 moves, 1 per category (O/M)
- ✅ `validateTileRequirements()` - Basic tile requirement checking
- ✅ `validateTileRequirementsWithImpossibleMoveExceptions()` - Handles impossible move scenarios (WITHDRAW when empty, ASSIST when seats full)
- ✅ `validateSingleMove()` - Dispatcher to specific move validators

### ✅ Phase 6d: Bureaucracy System (6 functions) - COMPLETE

**Module**: `src/game/bureaucracy.ts`
**Commit**: aba05bf
**Tests**: 38 tests passing
**Lines extracted**: ~230 lines

Functions extracted:

- ✅ `calculatePlayerKredcoin()` - Sum kredcoin values from bureaucracy tiles
- ✅ `getBureaucracyTurnOrder()` - Sort players by kredcoin (descending), ID (ascending for ties)
- ✅ `getBureaucracyMenu()` - Return appropriate menu for 3-4 vs 5 players
- ✅ `getAvailablePurchases()` - Filter menu items by affordability
- ✅ `validatePromotion()` - Validate piece promotion (Mark→Heel, Heel→Pawn) with location checks
- ✅ `performPromotion()` - Execute promotion by swapping with community piece

### 🔄 Phase 6e: Move Type Utilities (2 functions) - IN PROGRESS

**Module**: `src/game/move-types.ts` (to be created)
**Tests**: 15-20 tests (to be written)
**Lines to extract**: ~150 lines

Functions to extract:

- [ ] `determineMoveType()` - Determine move type from source/destination locations
- [ ] `validatePurchasedMove()` - Validate purchased move in bureaucracy phase

**Estimated**: ~150 lines, 15-20 tests

---

## Next Steps: Phase 6e (Final Sub-Phase)

### Step 1: Find the Functions in game.ts

```bash
grep -n "export function determineMoveType\|export function validatePurchasedMove" game.ts
```

### Step 2: Create Test File

Create `src/__tests__/game/move-types.test.ts` with tests for:

- `determineMoveType()` - Test all move type determinations from location patterns
- `validatePurchasedMove()` - Test bureaucracy move purchase validation

### Step 3: Create Module

Create `src/game/move-types.ts` and extract both functions

### Step 4: Update Barrel Export

Add to `src/game/index.ts`:

```typescript
// Move type utilities - move type determination and validation
export * from "./move-types";
```

### Step 5: Integrate into game.ts

1. Import from `src/game`:
   ```typescript
   determineMoveType,
   validatePurchasedMove,
   ```
2. Add to export block
3. Delete old implementations
4. Comment section: "Re-exported from src/game/move-types.ts"

### Step 6: Verify and Commit

```bash
npm test -- --run
npm run build
git add -A
git commit -m "refactor: extract move type utilities (2 functions, ~15-20 tests)"
git push origin refactoring
```

---

## Expected Outcomes After Phase 6 Completion

### Metrics

- **game.ts size**: ~1,050-1,070 lines (from 1,822 at start, 41-42% reduction)
- **Total functions extracted**: 24 functions across 5 modules
- **New tests**: ~160-170 tests (total ~770-780 tests)
- **Total commits**: 5 atomic commits (one per sub-phase)

### File Structure After Phase 6

```
src/
├── game/
│   ├── index.ts (barrel export)
│   ├── initialization.ts (existing - Phase 4)
│   ├── state-snapshots.ts (existing - Phase 5)
│   ├── locations.ts (existing - Phase 5)
│   ├── tile-validation.ts (NEW - Phase 6a, 6 functions)
│   ├── validation.ts (NEW - Phase 6c, 4 functions)
│   ├── bureaucracy.ts (NEW - Phase 6d, 6 functions)
│   └── move-types.ts (NEW - Phase 6e, 2 functions)
├── rules/
│   ├── index.ts (barrel export)
│   ├── credibility.ts (existing - Phase 5)
│   ├── win-conditions.ts (existing - Phase 5)
│   ├── adjacency.ts (existing - Phase 5)
│   ├── rostrum.ts (existing - Phase 5)
│   ├── movement.ts (existing - Phase 5)
│   └── move-validation-specific.ts (NEW - Phase 6b, 6 validators)
```

---

## Success Criteria for Phase 6

Each extraction must pass:

- [x] Phase 6a: All tests pass (649 total after 6a)
- [x] Phase 6b: All tests pass (685 total after 6b)
- [x] Phase 6c: All tests pass (717 total after 6c)
- [x] Phase 6d: All tests pass (755 total after 6d)
- [ ] Phase 6e: All tests pass (~770-780 expected)
- [ ] Build succeeds (`npm run build`)
- [ ] Dev server loads (`npm run dev`)
- [ ] Functions deleted from game.ts
- [ ] Imports updated in consuming files
- [ ] Re-exports added to game.ts for backwards compatibility
- [ ] Each sub-phase committed with clear message
- [ ] Final game.ts: ~1,050-1,070 lines

---

## Risk Mitigation

### Potential Issues

1. **Circular dependencies**: move-types may depend on movement validation

   - Solution: Use type-only imports where possible, ensure proper module boundaries

2. **Complex interdependencies**: Functions may call each other

   - Solution: Extract together or ensure proper imports, check all call sites

3. **Test coverage gaps**: Some functions may lack tests
   - Solution: Write tests first before extraction (TDD approach)

### Rollback Strategy

- Each commit is atomic and can be reverted independently
- Current backup point: commit aba05bf (Phase 6d complete)
- Can cherry-pick specific commits if needed

---

## After Phase 6: What's Next?

### Phase 7: React Component Extraction

Once game.ts is reduced to ~1,050 lines of core state management:

1. Extract screen components from App.tsx
2. Create custom hooks for state management
3. Extract UI components to `src/components/`

**Target**: Reduce App.tsx from 7,782 lines to <1,000 lines

### Phase 8: State Management Refinement

1. Consider Context API for global state
2. Extract complex state logic to reducers
3. Optimize re-renders and performance

---

## Getting Started with Phase 6e

To begin Phase 6e (Move Type Utilities):

```bash
# Ensure we're on refactoring branch with clean state
git checkout refactoring
git status

# Find the functions in game.ts
grep -n "export function determineMoveType\|export function validatePurchasedMove" game.ts

# Create test file first
touch src/__tests__/game/move-types.test.ts

# Create module file
touch src/game/move-types.ts

# Run tests in watch mode
npm test -- --watch move-types
```

Then follow the extraction steps above.

---

_Plan updated: November 25, 2025_
_Status: 4 of 5 sub-phases complete (80% done)_
_Remaining: Phase 6e (2 functions, ~150 lines)_
_Estimated time to complete Phase 6: 30-60 minutes_
