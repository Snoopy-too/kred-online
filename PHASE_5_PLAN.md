# Phase 5: Game Logic & Rules Extraction Plan

**Status**: Ready to begin
**Total Functions to Extract**: 51 functions
**Current game.ts size**: 2,805 lines
**Target**: Extract ~1,500-2,000 lines to modular files

---

## Overview

Phase 5 will extract the remaining game logic and rules from game.ts into:
- **src/rules/** - Rule enforcement (adjacency, movement, credibility, rostrums, win conditions)
- **src/game/** - Game logic (tile validation, locations, bureaucracy, snapshots)

---

## Module Breakdown

### 1. src/rules/adjacency.ts (5 functions)
**Purpose**: Seat and rostrum adjacency logic
**Lines**: ~150-200
**Functions**:
- `areSeatsAdjacent()` - Check if two seats are adjacent
- `getAdjacentSeats()` - Get list of adjacent seats
- `getNextPlayerClockwise()` - Helper for clockwise navigation
- `getPrevPlayerClockwise()` - Helper for counter-clockwise navigation
- `canMoveFromCommunity()` - Validate community piece movement

**Tests to write**: 15-20 tests covering all player counts

---

### 2. src/rules/rostrum.ts (10 functions)
**Purpose**: Rostrum support rules and validation
**Lines**: ~250-300
**Functions**:
- `areRostrumsAdjacent()` - Check rostrum adjacency
- `getAdjacentRostrum()` - Get adjacent rostrum ID
- `validateAdjacentRostrumMovement()` - Validate rostrum-to-rostrum moves
- `getPlayerRostrumRules()` - Get rostrum configuration for player
- `getRostrumSupportRule()` - Get support requirements for rostrum
- `countPiecesInSeats()` - Count pieces in specified seats
- `areSupportingSeatsFullForRostrum()` - Check if rostrum is supported
- `countPiecesInPlayerRostrums()` - Count pieces in player's rostrums
- `areBothRostrumsFilledForPlayer()` - Check if both rostrums are filled

**Tests to write**: 25-30 tests

---

### 3. src/rules/movement.ts (9 functions)
**Purpose**: Piece movement validation
**Lines**: ~400-500
**Functions**:
- `validatePieceMovement()` - Master validation function
- `validateMoveType()` - Determine and validate move type
- `validateAdvanceMove()` - Validate ADVANCE moves
- `validateWithdrawMove()` - Validate WITHDRAW moves
- `validateRemoveMove()` - Validate REMOVE moves
- `validateInfluenceMove()` - Validate INFLUENCE moves
- `validateAssistMove()` - Validate ASSIST moves
- `validateOrganizeMove()` - Validate ORGANIZE moves
- `validateSingleMove()` - Validate individual move

**Tests to write**: 40-50 tests (one per move type per scenario)

---

### 4. src/rules/credibility.ts (2 functions)
**Purpose**: Credibility system logic
**Lines**: ~80-100
**Functions**:
- `deductCredibility()` - Deduct credibility from player
- `handleCredibilityLoss()` - Handle credibility loss effects

**Tests to write**: 10-15 tests

---

### 5. src/rules/win-conditions.ts (2 functions)
**Purpose**: Win condition checking
**Lines**: ~100-120
**Functions**:
- `checkPlayerWinCondition()` - Check campaign phase win
- `checkBureaucracyWinCondition()` - Check bureaucracy phase win

**Tests to write**: 15-20 tests

---

### 6. src/game/tile-validation.ts (8 functions)
**Purpose**: Tile requirement validation
**Lines**: ~350-400
**Functions**:
- `isMoveAllowedInTilePlayOption()` - Check if move matches tile option
- `getMoveRequirement()` - Get requirement for move type
- `getTileRequirements()` - Get all requirements for tile
- `tileHasRequirements()` - Check if tile has requirements
- `areAllTileRequirementsMet()` - Check if all requirements met
- `canTileBeRejected()` - Check if tile can be rejected
- `validateTileRequirements()` - Validate tile requirements
- `validateTileRequirementsWithImpossibleMoveExceptions()` - Validate with exceptions
- `validateMovesForTilePlay()` - Validate all moves for tile

**Tests to write**: 30-40 tests

---

### 7. src/game/locations.ts (4 functions)
**Purpose**: Location utilities and position mapping
**Lines**: ~200-250
**Functions**:
- `findNearestVacantLocation()` - Find nearest vacant drop location
- `getLocationIdFromPosition()` - Get location ID from coordinates
- `getPlayerIdFromLocationId()` - Extract player ID from location
- `isLocationOwnedByPlayer()` - Check if location belongs to player

**Note**: `formatLocationId()` already exists in utils/formatting.ts - remove duplicate!

**Tests to write**: 20-25 tests

---

### 8. src/game/bureaucracy.ts (7 functions)
**Purpose**: Bureaucracy phase logic
**Lines**: ~300-350
**Functions**:
- `calculatePlayerKredcoin()` - Calculate player's kredcoin total
- `getBureaucracyTurnOrder()` - Determine bureaucracy turn order
- `getBureaucracyMenu()` - Get menu for player count
- `getAvailablePurchases()` - Get available purchase options
- `validatePromotion()` - Validate piece promotion
- `performPromotion()` - Execute piece promotion
- `determineMoveType()` - Determine move type for purchase
- `validatePurchasedMove()` - Validate bureaucracy move purchase

**Tests to write**: 25-30 tests

---

### 9. src/game/state-snapshots.ts (2 functions)
**Purpose**: Game state management
**Lines**: ~40-50
**Functions**:
- `createGameStateSnapshot()` - Create snapshot for undo
- `getChallengeOrder()` - Determine challenge order

**Tests to write**: 8-10 tests

---

## Extraction Order (Recommended)

1. **Start with simple modules** (least dependencies):
   - ✅ Phase 5a: `src/game/state-snapshots.ts` (2 functions, ~50 lines)
   - ✅ Phase 5b: `src/rules/credibility.ts` (2 functions, ~100 lines)
   - ✅ Phase 5c: `src/rules/win-conditions.ts` (2 functions, ~120 lines)

2. **Then location utilities**:
   - ✅ Phase 5d: `src/game/locations.ts` (4 functions, ~250 lines)

3. **Then adjacency logic**:
   - ✅ Phase 5e: `src/rules/adjacency.ts` (5 functions, ~200 lines)

4. **Then rostrum logic** (depends on adjacency):
   - ✅ Phase 5f: `src/rules/rostrum.ts` (10 functions, ~300 lines)

5. **Then movement validation** (depends on rostrums):
   - ✅ Phase 5g: `src/rules/movement.ts` (9 functions, ~500 lines)

6. **Then tile validation** (depends on movement):
   - ✅ Phase 5h: `src/game/tile-validation.ts` (8 functions, ~400 lines)

7. **Finally bureaucracy** (depends on movement):
   - ✅ Phase 5i: `src/game/bureaucracy.ts` (7 functions, ~350 lines)

---

## Success Metrics

After Phase 5 completion:
- ✅ All 51 functions extracted from game.ts
- ✅ ~1,500-2,000 lines moved to modular files
- ✅ game.ts reduced to ~800-1,300 lines (only React component logic)
- ✅ ~150-200 new unit tests added
- ✅ All 459+ tests still passing
- ✅ Build succeeds
- ✅ Dev server loads
- ✅ Manual smoke test passes

---

## Estimated Timeline

- Phase 5a-5c (Simple modules): 2-3 hours
- Phase 5d (Locations): 1-2 hours
- Phase 5e (Adjacency): 1-2 hours
- Phase 5f (Rostrums): 2-3 hours
- Phase 5g (Movement): 3-4 hours
- Phase 5h (Tile validation): 2-3 hours
- Phase 5i (Bureaucracy): 2-3 hours

**Total**: 13-20 hours of careful, methodical work

---

## Notes

- Follow the same atomic commit strategy: one function/file at a time
- Write tests BEFORE extracting each function
- Verify build + tests + dev server after each extraction
- Commit after each successful extraction
- NO backwards compatibility - update all imports immediately
- Remove duplicate `formatLocationId()` from game.ts (already in utils)

---

**Ready to begin Phase 5a: Extract state-snapshots.ts**
