# Refactoring Strategy V2: Incremental, Test-Driven, Safe

**Status**: FRESH START - Previous branch deleted
**Philosophy**: Slow, incremental, verified, committed at each step
**Date**: November 21, 2025

---

## Core Principles

### 1. **Test First, Refactor Second**

- Write tests for existing functionality BEFORE touching code
- Every refactor must pass existing tests
- No refactor is complete until tests pass

### 2. **Move, Don't Copy**

- Extract → Delete from source → Fix imports → Verify → Commit
- NEVER have code in two places simultaneously
- Each commit should build and run successfully

### 3. **Atomic Changes**

- One file/function/type at a time
- Each change is independently reviewable
- Can roll back any single step without affecting others

### 4. **Verify Everything**

- `npm run build` must pass
- `npm run dev` must load successfully
- Manual smoke test: Can you start a game?
- Automated tests must pass

### 5. **Commit Frequently**

- Every successful refactor = one commit
- Commit message format: `refactor: move [thing] to [destination]`
- Never batch unrelated changes

---

## Hybrid Architecture: Traditional React + Game-Specific

Combines standard React best practices with game-specific organization.

```
src/
├── types/              # TypeScript interfaces/types (game-specific)
│   ├── index.ts        # Re-exports all types
│   ├── game.ts         # Game state, phases
│   ├── player.ts       # Player data structures
│   ├── piece.ts        # Game pieces (Mark, Heel, Pawn)
│   ├── tile.ts         # Tiles and board tiles
│   ├── move.ts         # Move types and tracking
│   └── ui.ts           # UI-specific types
│
├── config/             # Static configuration data (game-specific)
│   ├── index.ts        # Re-exports all config
│   ├── constants.ts    # Game constants (player counts, etc.) ✅ EXISTS
│   ├── pieces.ts       # Piece definitions and counts ✅ EXISTS
│   ├── tiles.ts        # Tile images and values ✅ EXISTS
│   ├── board.ts        # Board layouts by player count
│   └── rules.ts        # Rule definitions (moves, requirements)
│
├── game/               # Core game logic (pure functions, game-specific)
│   ├── index.ts        # Re-exports all game logic
│   ├── initialization.ts   # Game setup functions
│   ├── validation.ts       # Move validation logic
│   ├── state-updates.ts    # State mutation functions
│   └── calculations.ts     # Derived state calculations
│
├── rules/              # Game rules enforcement (game-specific)
│   ├── index.ts        # Re-exports all rules
│   ├── adjacency.ts    # Seat/rostrum adjacency
│   ├── movement.ts     # Piece movement rules
│   ├── credibility.ts  # Credibility system
│   └── win-conditions.ts   # Win checking
│
├── components/         # React components (traditional React)
│   ├── screens/        # Full-screen game phases (page-level)
│   │   ├── PlayerSelectionScreen.tsx
│   │   ├── DraftingScreen.tsx
│   │   ├── CampaignScreen.tsx
│   │   └── BureaucracyScreen.tsx
│   ├── board/          # Board-related components
│   │   ├── GameBoard.tsx
│   │   ├── Piece.tsx
│   │   └── DropIndicator.tsx
│   └── shared/         # Reusable UI components
│       ├── Modal.tsx
│       └── Button.tsx
│
├── hooks/              # Custom React hooks (traditional React)
│   ├── index.ts
│   ├── useGameState.ts     # Central state management
│   ├── useDragAndDrop.ts   # Drag-drop logic
│   ├── useRotation.ts      # Board rotation logic
│   └── useSocket.ts        # Socket.IO client hook (future)
│
├── contexts/           # React Context providers (traditional React)
│   ├── index.ts
│   └── GameContext.tsx     # Global game state context
│
├── services/           # External services/API (traditional React)
│   ├── index.ts
│   └── socket.ts           # Socket.IO client configuration (future)
│
├── utils/              # Helper utilities (shared)
│   ├── index.ts        # Re-exports all utils
│   ├── positioning.ts  # Coordinate/rotation math
│   ├── formatting.ts   # Display formatting
│   └── array.ts        # Array helpers (shuffle, etc.)
│
├── assets/             # Static assets (traditional React)
│   ├── images/         # Game images (currently in /public/images)
│   └── fonts/          # Custom fonts (if needed)
│
└── __tests__/          # Test files mirror src structure
    ├── config/         # ✅ EXISTS (33 tests)
    ├── types/
    ├── game/
    ├── rules/
    ├── components/
    ├── hooks/
    └── integration/    # ✅ EXISTS (55 tests)

**Folder Creation Strategy**:
- ✅ Created immediately: config/, types/, game/, rules/, utils/
- ⏳ Created as needed: components/, hooks/, contexts/, services/, assets/
- Game-specific folders: types/, config/, game/, rules/
- Traditional React folders: components/, hooks/, contexts/, services/
- Shared folders: utils/, assets/, __tests__/

**Current Progress** (as of merge):
- ✅ Phase 0: Test infrastructure complete (88 tests passing)
- ✅ Phase 2: Partially complete (constants, tiles, pieces extracted)
- ⏳ Phase 2: Continue with board.ts, rules.ts, bureaucracy.ts
```

---

## Testing Setup (Phase 0)

### Prerequisites

Before ANY refactoring, set up testing infrastructure:

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Add to package.json scripts:
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}

# Create vitest.config.ts
```

### Test Categories

1. **Unit Tests** - Pure functions in `game/`, `rules/`, `utils/`
2. **Integration Tests** - Multiple functions working together
3. **Component Tests** - React components render correctly
4. **Smoke Tests** - App loads, basic user flows work

### Initial Test Suite (Before Refactoring)

Create these tests FIRST to ensure current behavior is preserved:

```typescript
// src/__tests__/game/initialization.test.ts
describe('initializePlayers', () => {
  it('creates correct number of players', () => { ... })
  it('deals correct hand size per player', () => { ... })
  it('shuffles deck properly', () => { ... })
})

// src/__tests__/rules/movement.test.ts
describe('validateMoveType', () => {
  it('identifies ADVANCE from community to seat', () => { ... })
  it('identifies WITHDRAW from seat to community', () => { ... })
  // ... test all 10 move rules
})

// src/__tests__/smoke.test.ts
describe('App smoke tests', () => {
  it('renders player selection screen', () => { ... })
  it('can select 3 players', () => { ... })
  it('can start drafting phase', () => { ... })
})
```

**Checkpoint**: All tests pass before proceeding to refactoring.

---

## Refactoring Process (Step-by-Step)

### Each refactor follows this workflow:

```
1. Identify target (single type/function/component)
2. Write/verify tests for target exist
3. Create new file in appropriate directory
4. Copy code to new file
5. Add exports to new file
6. Delete code from old file
7. Add import to old file (if needed)
8. Run `npm run build`
9. Run `npm run test`
10. Run `npm run dev` and manually test
11. If all pass → `git add . && git commit -m "refactor: move X to Y"`
12. If any fail → `git reset --hard` and retry
13. Move to next target
```

### Never skip steps. Never batch steps.

---

## Refactoring Order (Phase-by-Phase)

### Phase 1: Extract Types (No Behavior Change)

**Goal**: All interfaces/types in `src/types/`

1. Create `src/types/index.ts` (empty barrel file)
2. Create `src/types/piece.ts`
   - Move `Piece` interface → test → commit
   - Move `GamePieceInfo` interface → test → commit
3. Create `src/types/tile.ts`
   - Move `Tile` interface → test → commit
   - Move `BoardTile` interface → test → commit
   - Move `TileReceivingSpace` interface → test → commit
4. Create `src/types/player.ts`
   - Move `Player` interface → test → commit
5. Create `src/types/game.ts`
   - Move `GameState` type → test → commit
   - Move `DropLocation` interface → test → commit
6. Create `src/types/move.ts`
   - Move `TrackedMove` interface → test → commit
   - Move `DefinedMoveType` enum → test → commit
   - Move all move-related types → test → commit
7. Create `src/types/ui.ts`
   - Move UI-specific types → test → commit

**Checkpoint**: ~7-15 commits, all tests passing, types fully extracted

### Phase 2: Extract Constants (No Behavior Change)

**Goal**: All static data in `src/config/`

**Status**:
- ✅ `src/config/constants.ts` - DONE (TOTAL_TILES, PLAYER_OPTIONS, BOARD_IMAGE_URLS)
- ✅ `src/config/pieces.ts` - DONE (PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT)
- ✅ `src/config/tiles.ts` - DONE (TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES)
- ⏳ `src/config/board.ts` - NEXT
- ⏳ `src/config/rules.ts` - NEXT

**Remaining Work**:

4. Create `src/config/board.ts` with tests
   - Move `DROP_LOCATIONS_BY_PLAYER_COUNT` → test → commit
   - Move `TILE_SPACES_BY_PLAYER_COUNT` → test → commit
   - Move `BANK_SPACES_BY_PLAYER_COUNT` → test → commit
   - Move `CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT` → test → commit
   - Move `PLAYER_PERSPECTIVE_ROTATIONS` → test → commit
5. Create `src/config/rules.ts` with tests
   - Move `DEFINED_MOVES` → test → commit
   - Move `TILE_PLAY_OPTIONS` → test → commit
   - Move `TILE_REQUIREMENTS` → test → commit
   - Move `ROSTRUM_SUPPORT_RULES` → test → commit
   - Move `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` → test → commit
6. Create `src/config/bureaucracy.ts` with tests
   - Move `THREE_FOUR_PLAYER_BUREAUCRACY_MENU` → test → commit
   - Move `FIVE_PLAYER_BUREAUCRACY_MENU` → test → commit

**Checkpoint**: ~15-20 commits total, all tests passing, config fully extracted

### Phase 3: Extract Pure Utility Functions

**Goal**: All helper functions in `src/utils/`

1. Create `src/utils/positioning.ts`
   - Move `calculatePieceRotation()` → test → commit
   - Move `isPositionInCommunityCircle()` → test → commit
   - Move `BOARD_CENTERS` → test → commit
2. Create `src/utils/formatting.ts`
   - Move `formatLocationId()` → test → commit
3. Create `src/utils/array.ts`
   - Move `shuffle()` → test → commit

**Checkpoint**: ~5-8 commits, all tests passing

### Phase 4: Extract Game Initialization Logic

**Goal**: Setup functions in `src/game/initialization.ts`

1. Move `initializePlayers()` → test → commit
2. Move `initializePieces()` → test → commit
3. Move `initializeCampaignPieces()` → test → commit

**Checkpoint**: ~3 commits, all tests passing

### Phase 5: Extract Rules & Validation

**Goal**: All rule logic in `src/rules/`

1. Create `src/rules/adjacency.ts`
   - Move `areSeatsAdjacent()` → test → commit
   - Move `areRostrumsAdjacent()` → test → commit
   - Move adjacency helper functions → test → commit
2. Create `src/rules/movement.ts`
   - Move `validateMoveType()` → test → commit
   - Move `validatePieceMovement()` → test → commit
3. Create `src/rules/credibility.ts`
   - Move credibility functions → test → commit
4. Create `src/rules/win-conditions.ts`
   - Move `checkPlayerWinCondition()` → test → commit
   - Move `checkBureaucracyWinCondition()` → test → commit

**Checkpoint**: ~10-15 commits, all tests passing

### Phase 6: Extract React Hooks

**Goal**: Reusable hooks in `src/hooks/`

1. Create `src/hooks/useGameState.ts`
   - Extract state management → test → commit
2. Create `src/hooks/useDragAndDrop.ts`
   - Extract drag-drop logic → test → commit
3. Create `src/hooks/useRotation.ts`
   - Extract board rotation logic → test → commit

**Checkpoint**: ~3-5 commits, all tests passing

### Phase 6b: React Contexts (When Needed)

**Goal**: Global state providers in `src/contexts/`

**Note**: Create only when needed for global state management or when socket integration begins.

1. Create `src/contexts/GameContext.tsx` (optional, if needed)
   - Wrap game state in context → test → commit

**Checkpoint**: ~1-2 commits, all tests passing

### Phase 6c: Services Layer (Future - Socket Integration)

**Goal**: External services in `src/services/`

**Note**: This will be created when implementing multiplayer socket functionality.

1. Create `src/services/socket.ts`
   - Socket.IO client configuration
   - Connection management
   - Event handlers
2. Create `src/hooks/useSocket.ts`
   - Custom hook for socket connection
   - State management for connection status
   - Message handlers

**Checkpoint**: Created when socket implementation begins

### Phase 7: Extract Components

**Goal**: Screen components in `src/components/screens/`

1. Move `PlayerSelectionScreen` → test → commit
2. Move `DraftingScreen` → test → commit
3. Move `BureaucracyScreen` → test → commit
4. Move `CampaignScreen` → test → commit

**Checkpoint**: ~4 commits, all tests passing

---

## Success Metrics

After completing all phases:

- ✅ `game.ts` < 500 lines (originally 3,610)
- ✅ `App.tsx` < 1,000 lines (originally 5,913)
- ✅ 100% test coverage on `src/game/`, `src/rules/`, `src/utils/`
- ✅ All tests passing
- ✅ App loads and plays correctly
- ✅ ~50-80 commits (one per refactor step)
- ✅ Clean git history that can be reviewed/audited

---

## Example Single Refactor Cycle

**Target**: Move `calculatePieceRotation()` to `src/utils/positioning.ts`

### Step 1: Verify tests exist

```typescript
// src/__tests__/utils/positioning.test.ts
describe("calculatePieceRotation", () => {
  it("returns 0 for community pieces", () => {
    const result = calculatePieceRotation(
      { top: 50, left: 50 },
      3,
      "community1"
    );
    expect(result).toBe(0);
  });

  it("calculates correct angle for player seats", () => {
    // ... more tests
  });
});
```

### Step 2: Create new file

```typescript
// src/utils/positioning.ts
export const BOARD_CENTERS: {
  [playerCount: number]: { left: number; top: number };
} = {
  3: { left: 50.44, top: 44.01 },
  4: { left: 49.94, top: 51.56 },
  5: { left: 47.97, top: 47.07 },
};

export function calculatePieceRotation(
  position: { top: number; left: number },
  playerCount: number,
  locationId?: string
): number {
  if (
    locationId &&
    (locationId.startsWith("community") ||
      locationId === "free_placement" ||
      locationId.includes("office"))
  ) {
    return 0;
  }

  const boardCenter = BOARD_CENTERS[playerCount] || { left: 50, top: 50 };
  const dx = position.left - boardCenter.left;
  const dy = position.top - boardCenter.top;
  const angleRadians = Math.atan2(dy, dx);
  return angleRadians * (180 / Math.PI) + 90;
}
```

### Step 3: Create barrel export

```typescript
// src/utils/index.ts
export * from "./positioning";
```

### Step 4: Delete from game.ts

```diff
- export const BOARD_CENTERS: { [playerCount: number]: { left: number; top: number } } = {
-   3: { left: 50.44, top: 44.01 },
-   4: { left: 49.94, top: 51.56 },
-   5: { left: 47.97, top: 47.07 },
- };
-
- export function calculatePieceRotation(
-   position: { top: number; left: number },
-   playerCount: number,
-   locationId?: string
- ): number {
-   // ... implementation
- }
```

### Step 5: Add import to files that use it

```typescript
// game.ts (or any file using the function)
import { calculatePieceRotation, BOARD_CENTERS } from "./src/utils";
```

### Step 6: Verify

```bash
npm run build          # Must pass
npm run test           # Must pass
npm run dev            # Must load without errors
# Manual test: Can pieces be placed? Do they rotate correctly?
```

### Step 7: Commit

```bash
git add .
git commit -m "refactor: move calculatePieceRotation to src/utils/positioning"
```

### Step 8: Repeat for next target

---

## Recovery Strategy

### If tests fail after refactor:

```bash
# Immediately revert
git reset --hard HEAD

# Debug: What broke?
# - Missing import?
# - Circular dependency?
# - Type mismatch?

# Fix issue, retry refactor
```

### If app doesn't load:

```bash
# Revert
git reset --hard HEAD

# Check console errors
# Usually: missing export or wrong import path

# Fix, retry
```

### If unsure about safety:

```bash
# Create backup branch
git checkout -b backup-before-refactor

# Do refactor on main
# If it works, delete backup
# If it breaks, switch back to backup
```

---

## Key Differences from Previous Attempt

| Previous Approach           | New Approach                            |
| --------------------------- | --------------------------------------- |
| Extract 37 files at once    | Extract 1 file at a time                |
| Code duplicated in 2 places | Code deleted immediately after move     |
| No tests                    | Tests written first                     |
| Batch commits               | Commit after each change                |
| "Build passing" = success   | Build + tests + manual verify = success |
| ~20 large commits           | ~50-80 atomic commits                   |
| Can't identify what broke   | Each commit is independently testable   |

---

## Timeline Estimate

- **Phase 0 (Testing setup)**: 2-4 hours
- **Phase 1 (Types)**: 1-2 hours (7-15 commits)
- **Phase 2 (Config)**: 2-3 hours (15-20 commits)
- **Phase 3 (Utils)**: 1 hour (5-8 commits)
- **Phase 4 (Init)**: 30 min (3 commits)
- **Phase 5 (Rules)**: 2-3 hours (10-15 commits)
- **Phase 6 (Hooks)**: 1-2 hours (2-5 commits)
- **Phase 7 (Components)**: 2-3 hours (4 commits)

**Total**: 12-20 hours of careful, methodical work
**Result**: Bulletproof, tested, reviewable refactoring

---

## Getting Started

1. **Commit current state**

   ```bash
   git add .
   git commit -m "checkpoint: before refactoring v2"
   git checkout -b refactor-v2
   ```

2. **Install test dependencies**

   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
   ```

3. **Create vitest.config.ts**

   ```typescript
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: "jsdom",
       setupFiles: "./src/__tests__/setup.ts",
     },
   });
   ```

4. **Write first test** (for existing functionality)

   ```typescript
   // src/__tests__/smoke.test.tsx
   import { render, screen } from "@testing-library/react";
   import App from "../App";

   describe("App smoke test", () => {
     it("renders without crashing", () => {
       render(<App />);
       expect(screen.getByText(/select players/i)).toBeInTheDocument();
     });
   });
   ```

5. **Verify test passes**

   ```bash
   npm test
   ```

6. **Begin Phase 1** (Extract first type)

---

## Questions to Ask Before Each Refactor

1. Do tests exist for this code? → If no, write them first
2. Is this an atomic change? → If no, break it down further
3. Can I revert easily? → If no, commit current state first
4. Do I understand all usages? → If no, search codebase first
5. Will this break imports? → If yes, plan import updates

---

## Success Criteria

A refactor is only complete when:

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Dev server loads (`npm run dev`)
- [ ] Manual smoke test passes (can start game)
- [ ] Code deleted from source file
- [ ] Imports updated in all consuming files
- [ ] Changes committed to git
- [ ] You can explain what moved and why

---

## Final Notes

**This is not a sprint. This is a marathon.**

- Take breaks between phases
- Don't rush
- If unsure, stop and ask
- Better to take 20 hours and succeed than 2 hours and fail
- Every commit should leave the codebase in a working state
- The goal is not speed, it's **correctness and safety**

**Remember**: The previous refactoring failed because it was too ambitious and lacked verification. This time, we go slow, verify everything, and build confidence with each tiny step.

---

_Document created: November 21, 2025_
_Previous attempt: Deleted (too ambitious, untested, unsafe)_
_This attempt: Incremental, tested, safe, verifiable_
