# Build Fix Plan - Screen Component Import Issues

## Current Status
After extracting all 4 screen components (PlayerSelectionScreen, DraftingScreen, CampaignScreen, BureaucracyScreen), the build fails due to function signature mismatches and missing constants.

## Root Cause
The extracted components were copying code that used helper functions inline, but those functions have different signatures in the extracted `src/game/utils/` modules vs the monolithic `game.ts` file.

---

## Phase 1: Identify All Build Errors (5 min)

### Task 1.1: Run build and capture all errors
```bash
npm run build 2>&1 | tee build-errors.txt
```

### Task 1.2: Categorize errors
- Function signature mismatches
- Missing exports from game.ts
- Missing constant mappings
- Type errors

---

## Phase 2: Fix Function Signature Issues (20 min)

### Task 2.1: Fix `calculatePieceRotation` signature mismatch
**Error**: Line 333-334 in CampaignScreen.tsx
```typescript
// Current (wrong):
const rotation = calculatePieceRotation(finalPosition.left, finalPosition.top, BOARD_CENTERS[playerCount]);

// Should be (from src/game/utils/positioning.ts):
const rotation = calculatePieceRotation(finalPosition, playerCount);
```

**Files to fix**:
- src/components/screens/CampaignScreen.tsx (multiple locations)
- src/components/screens/BureaucracyScreen.tsx (if used)

### Task 2.2: Fix `isPositionInCommunityCircle` signature mismatch
**Error**: Expects position object, not individual coordinates
```typescript
// Current (wrong):
isPositionInCommunityCircle(piece.position.left, piece.position.top, BOARD_CENTERS[playerCount])

// Should be:
isPositionInCommunityCircle(piece.position)
```

### Task 2.3: Fix `getLocationIdFromPosition` signature mismatch
**Error**: Extra parameters
```typescript
// Current (wrong):
getLocationIdFromPosition(left, top, playerCount)

// Should be (from src/game/utils/location.ts):
getLocationIdFromPosition({left, top}, playerCount)
```

### Task 2.4: Fix `findNearestVacantLocation` signature mismatch
**Error**: Missing pieces parameter
```typescript
// Check src/game/utils/location.ts for actual signature
// Update all calls to match
```

---

## Phase 3: Export Missing Functions from game.ts (5 min)

### Task 3.1: Export `isLocationOccupied`
**File**: game.ts
```typescript
// Find the function and add 'export' keyword
export function isLocationOccupied(locationId: string, pieces: Piece[]): boolean {
  // ...
}
```

### Task 3.2: Export other missing functions
- `getBureaucracyMenu` ✅ (already used in import)
- `getAvailablePurchases` ✅ (already used in import)
- `validatePieceMovement` ✅ (already used in import)

---

## Phase 4: Create Missing Constant Mappings (10 min)

### Task 4.1: Create PIECE_IMAGES constant in game config
**File**: src/game/config/pieces.ts

Add after PIECE_TYPES:
```typescript
/**
 * Piece image URLs mapped by type
 * Convenience mapping for components
 */
export const PIECE_IMAGES: { [key: string]: string } = {
  MARK: PIECE_TYPES.MARK.imageUrl,
  HEEL: PIECE_TYPES.HEEL.imageUrl,
  PAWN: PIECE_TYPES.PAWN.imageUrl,
};
```

### Task 4.2: Update CampaignScreen to use PIECE_IMAGES
**File**: src/components/screens/CampaignScreen.tsx
```typescript
// Update import:
import {
  // ...
  PIECE_TYPES,  // Remove this
} from '../../game/config';

// Add to imports:
import { PIECE_IMAGES } from '../../game/config/pieces';

// Or create inline:
const PIECE_IMAGES = {
  MARK: PIECE_TYPES.MARK.imageUrl,
  HEEL: PIECE_TYPES.HEEL.imageUrl,
  PAWN: PIECE_TYPES.PAWN.imageUrl,
};
```

### Task 4.3: Export BOARD_CENTERS from positioning.ts
**File**: src/game/utils/positioning.ts
```typescript
// Change from:
const BOARD_CENTERS: { ... } = { ... };

// To:
export const BOARD_CENTERS: { ... } = { ... };
```

Then update CampaignScreen to import from utils instead of game.ts:
```typescript
import { calculatePieceRotation, BOARD_CENTERS } from '../../game/utils/positioning';
```

---

## Phase 5: Fix Remaining Type Errors (10 min)

### Task 5.1: Fix TileReceivingSpace missing rotation property
**Error**: Line 686 in CampaignScreen.tsx
```typescript
// Add rotation property:
const targetSpace: TileReceivingSpace = {
  ownerId: currentPlayerId === 1 ? 2 : 1,
  position: { left: 50, top: 50 },
  rotation: 0,  // Add this
};
```

### Task 5.2: Fix any remaining type mismatches
- Review build output
- Fix one by one

---

## Phase 6: Verify Build Success (5 min)

### Task 6.1: Run build
```bash
npm run build
```

### Task 6.2: If errors remain, repeat relevant phases

### Task 6.3: Run dev server and smoke test
```bash
npm run dev
```
- Test player selection
- Test draft phase
- Test campaign phase
- Test bureaucracy phase

---

## Phase 7: Commit and Document (5 min)

### Task 7.1: Commit all fixes
```bash
git add -A
git commit -m "Fix: Resolve all build errors after component extraction"
```

### Task 7.2: Update REFACTORING_PROGRESS.md
- Mark Phase 1 as 90-95% complete
- Document what was fixed

---

## Estimated Total Time: 60 minutes

## Success Criteria
- ✅ `npm run build` succeeds with no errors
- ✅ `npm run dev` starts without errors
- ✅ Game is playable through all phases
- ✅ No TypeScript errors in IDE
- ✅ All changes committed to production branch

---

## Notes
- Some functions may have been intentionally changed when extracting
- Check extracted module signatures vs original game.ts
- Prefer using extracted modules over game.ts when possible
- Document any intentional signature changes
