# KRED Manual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the KRED app with the physical board game manual so that all rules, move validations, win conditions, credibility mechanics, and Bureaucracy logic exactly match the published rulebook.

**Architecture:** Each fix is isolated to a small set of files in `src/rules/`, `src/game/`, or `src/config/`. Most changes are surgical edits to existing validators and config constants. One new module (`src/rules/faction-collapse.ts`) is needed for the cascade mechanic. TDD: write/update tests first, then fix code.

**Tech Stack:** TypeScript, React, Vitest (test runner at `npx vitest run`)

**Manual Reference:** `c:\FidelsStuff\Docs\Apps\kred-online\KRED_Manual_27x19.pdf`

---

## Phase 1 — Critical Rule Fixes (move validators & piece counts)

These are bugs where the app allows moves the manual forbids, or forbids moves the manual allows. They affect core gameplay correctness.

---

### Task 1: REMOVE must only target Marks (not Heels)

The manual says: *"Remove one Mark... Pawns and Heels may never be Removed to the Community."*
The app currently allows removing Marks **and** Heels (line 229).

**Files:**
- Modify: `src/rules/move-validation.ts:224-229`
- Test: `src/__tests__/rules/move-validation-specific.test.ts`

- [ ] **Step 1: Write failing test — REMOVE a Heel should be rejected**

```typescript
it("should reject REMOVE of a Heel from opponent seat", () => {
  const heelPiece: Piece = {
    id: "h1", name: "Heel", displayName: "H1",
    locationId: "p2_seat3", position: { left: 50, top: 50 }, rotation: 0,
  };
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.REMOVE, category: "O",
    fromLocationId: "p2_seat3", toLocationId: "community1",
  };
  const result = validateRemoveMove(move, 1, [heelPiece], 3);
  expect(result).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "REMOVE of a Heel"`
Expected: FAIL — currently returns `true`

- [ ] **Step 3: Fix the validator — only allow Marks**

In `src/rules/move-validation.ts`, change line 229:

```typescript
// BEFORE:
  return pieceName === "mark" || pieceName === "heel";

// AFTER:
  return pieceName === "mark";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "REMOVE"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rules/move-validation.ts src/__tests__/rules/move-validation-specific.test.ts
git commit -m "fix: REMOVE only targets Marks per manual rules"
```

---

### Task 2: Fix 4-player Mark count (14 → 15)

The manual says 15 Marks for 4-player. The app has 14.

**Files:**
- Modify: `src/config/pieces.ts:18`
- Modify: `src/config/pieces.ts:73-89` (add 15th Mark default position)
- Test: `src/__tests__/game/initialization.test.ts`

- [ ] **Step 1: Write/update failing test — 4P should have 15 Marks**

```typescript
it("should create 15 Marks for a 4-player game", () => {
  expect(PIECE_COUNTS_BY_PLAYER_COUNT[4].MARK).toBe(15);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/game/initialization.test.ts -t "15 Marks"`
Expected: FAIL — currently 14

- [ ] **Step 3: Fix the count and add 15th Mark position**

In `src/config/pieces.ts`, line 18, change:

```typescript
// BEFORE:
    MARK: 14,

// AFTER:
    MARK: 15,
```

Then in the 4-player default positions array (~line 73-89), add a 15th Mark entry with a community position that doesn't overlap existing entries. Pick a position near the other community marks:

```typescript
    { name: "Mark", displayName: "M15", position: { left: 48.2, top: 41.6 } },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/game/initialization.test.ts`
Expected: PASS

- [ ] **Step 5: Verify total piece count is now 32 (15+13+4)**

```typescript
it("should have 32 total pieces for 4-player game", () => {
  const counts = PIECE_COUNTS_BY_PLAYER_COUNT[4];
  expect(counts.MARK + counts.HEEL + counts.PAWN).toBe(32);
});
```

- [ ] **Step 6: Commit**

```bash
git add src/config/pieces.ts src/__tests__/game/initialization.test.ts
git commit -m "fix: 4-player game uses 15 Marks per manual (was 14)"
```

---

### Task 3: ADVANCE to Office must work from either Rostrum

The manual says: *"advance a piece from a Rostrum to the Office."* The app only allows from Rostrum1.

**Files:**
- Modify: `src/rules/move-validation.ts:96-107`
- Test: `src/__tests__/rules/move-validation-specific.test.ts`

- [ ] **Step 1: Write failing test — ADVANCE from Rostrum2 to Office**

```typescript
it("should allow ADVANCE from rostrum2 to office when both rostrums occupied", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "h2", name: "Heel", displayName: "H2", locationId: "p1_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h2", moveType: DefinedMoveType.ADVANCE, category: "M",
    fromLocationId: "p1_rostrum2", toLocationId: "p1_office",
  };
  expect(validateAdvanceMove(move, 1, pieces)).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "rostrum2 to office"`
Expected: FAIL — currently only rostrum1 is accepted

- [ ] **Step 3: Add Rostrum2-to-Office path**

In `src/rules/move-validation.ts`, after the existing Option D block (line 105), add a new Option E before the final `return false`:

```typescript
  // Option E: Rostrum2 to office (if both rostrums occupied)
  if (
    toLocationId === `p${playerId}_office` &&
    fromLocationId === `p${playerId}_rostrum2`
  ) {
    const rostrum1Occupied = pieces.some(
      (p) => p.locationId === `p${playerId}_rostrum1`
    );
    return rostrum1Occupied;
  }
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rules/move-validation.ts src/__tests__/rules/move-validation-specific.test.ts
git commit -m "fix: ADVANCE to Office allowed from either Rostrum per manual"
```

---

### Task 4: Fix WITHDRAW Rostrum2 seat destinations (3,4,5 → 4,5,6)

Rostrum2 corresponds to Faction 2 (seats 4-6). The app maps it to seats 3,4,5.

**Files:**
- Modify: `src/rules/move-validation.ts:155-166`
- Test: `src/__tests__/rules/move-validation-specific.test.ts`

- [ ] **Step 1: Write failing test — WITHDRAW from Rostrum2 to Seat6 should be valid**

```typescript
it("should allow WITHDRAW from rostrum2 to seat6", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.WITHDRAW, category: "M",
    fromLocationId: "p1_rostrum2", toLocationId: "p1_seat6",
  };
  expect(validateWithdrawMove(move, 1, pieces)).toBe(true);
});

it("should reject WITHDRAW from rostrum2 to seat3", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.WITHDRAW, category: "M",
    fromLocationId: "p1_rostrum2", toLocationId: "p1_seat3",
  };
  expect(validateWithdrawMove(move, 1, pieces)).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: seat6 test FAILS (currently rejected), seat3 test FAILS (currently accepted)

- [ ] **Step 3: Fix the seat mapping**

In `src/rules/move-validation.ts`, lines 155-166, change:

```typescript
  if (fromLocationId === `p${playerId}_rostrum2`) {
    // rostrum2 can go to seats 4, 5, or 6
    const validSeats = [
      `p${playerId}_seat4`,
      `p${playerId}_seat5`,
      `p${playerId}_seat6`,
    ];
    if (validSeats.includes(toLocationId)) {
      const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
      return !targetOccupied;
    }
  }
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "WITHDRAW"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rules/move-validation.ts src/__tests__/rules/move-validation-specific.test.ts
git commit -m "fix: WITHDRAW from Rostrum2 targets seats 4,5,6 (was 3,4,5)"
```

---

## Phase 2 — High-Priority Rule Fixes

---

### Task 5: INFLUENCE must block Pawns

The manual says: *"A Pawn may not be Influenced into or out of any Domain."*

**Files:**
- Modify: `src/rules/move-validation.ts:247-295`
- Test: `src/__tests__/rules/move-validation-specific.test.ts`

- [ ] **Step 1: Write failing test — INFLUENCE a Pawn should be rejected**

```typescript
it("should reject INFLUENCE of a Pawn", () => {
  const pawnPiece: Piece = {
    id: "p1", name: "Pawn", displayName: "P1",
    locationId: "p2_seat3", position: { left: 50, top: 50 }, rotation: 0,
  };
  const move: TrackedMove = {
    pieceId: "p1", moveType: DefinedMoveType.INFLUENCE, category: "O",
    fromLocationId: "p2_seat3", toLocationId: "p2_seat4",
  };
  expect(validateInfluenceMove(move, 1, [pawnPiece], 3)).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — Pawns are currently allowed

- [ ] **Step 3: Add Pawn check at the top of validateInfluenceMove**

In `src/rules/move-validation.ts`, after the null checks at line 256, add:

```typescript
  // Pawns may NOT be Influenced (manual: "A Pawn may not be Influenced into or out of any Domain")
  const movingPiece = getPieceById(pieces, move.pieceId);
  if (!movingPiece) return false;
  if (movingPiece.name.toLowerCase() === "pawn") return false;
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "INFLUENCE"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rules/move-validation.ts src/__tests__/rules/move-validation-specific.test.ts
git commit -m "fix: INFLUENCE cannot target Pawns per manual rules"
```

---

### Task 6: ORGANIZE Rostrum moves must use ROSTRUM_ADJACENCY

The app allows moving from your rostrum to ANY vacant rostrum. The manual says rostrums are only connected to specific adjacent rostrums across player boundaries.  Movement between your own two rostrums is NOT allowed.

**Files:**
- Modify: `src/rules/move-validation.ts:357-387` (add `playerCount` param, adjacency check)
- Modify: `src/game/validation.ts:278-282` (pass `playerCount` to `validateOrganizeMove`)
- Test: `src/__tests__/rules/move-validation-specific.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
it("should reject ORGANIZE from own rostrum1 to own rostrum2", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.ORGANIZE, category: "M",
    fromLocationId: "p1_rostrum1", toLocationId: "p1_rostrum2",
  };
  expect(validateOrganizeMove(move, 1, pieces, 3)).toBe(false);
});

it("should allow ORGANIZE from p1_rostrum2 to adjacent p3_rostrum1 (3-player)", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.ORGANIZE, category: "M",
    fromLocationId: "p1_rostrum2", toLocationId: "p3_rostrum1",
  };
  expect(validateOrganizeMove(move, 1, pieces, 3)).toBe(true);
});

it("should reject ORGANIZE from p1_rostrum1 to non-adjacent p3_rostrum1 (3-player)", () => {
  const pieces: Piece[] = [
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const move: TrackedMove = {
    pieceId: "h1", moveType: DefinedMoveType.ORGANIZE, category: "M",
    fromLocationId: "p1_rostrum1", toLocationId: "p3_rostrum1",
  };
  expect(validateOrganizeMove(move, 1, pieces, 3)).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Expected: same-domain rostrum move currently passes (should fail)

- [ ] **Step 3: Update validateOrganizeMove signature and logic**

Add `playerCount` parameter and use `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` for the rostrum case:

```typescript
import { ROSTRUM_ADJACENCY_BY_PLAYER_COUNT } from "../config/rules";

export function validateOrganizeMove(
  move: TrackedMove,
  playerId: number,
  pieces: Piece[],
  playerCount: number = 3
): boolean {
  const fromLocationId = move.fromLocationId;
  const toLocationId = move.toLocationId;

  // Case 1: Seat to adjacent seat (can cross player boundaries)
  if (fromLocationId?.includes("_seat") && toLocationId?.includes("_seat")) {
    if (!fromLocationId?.includes(`p${playerId}_seat`)) return false;
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;
    return areSeatsAdjacent(fromLocationId, toLocationId, playerCount);
  }

  // Case 2: Rostrum to adjacent rostrum (cross-domain only, using adjacency config)
  if (
    fromLocationId?.includes("_rostrum") &&
    toLocationId?.includes("_rostrum")
  ) {
    if (!fromLocationId?.includes(`p${playerId}_rostrum`)) return false;
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;

    // Check rostrum adjacency from config
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    return adjacencies.some(
      (adj) =>
        (adj.rostrum1 === fromLocationId && adj.rostrum2 === toLocationId) ||
        (adj.rostrum2 === fromLocationId && adj.rostrum1 === toLocationId)
    );
  }

  return false;
}
```

- [ ] **Step 4: Update call site in validation.ts**

In `src/game/validation.ts:278-282`, pass `playerCount`:

```typescript
    case DefinedMoveType.ORGANIZE:
      return {
        isValid: validateOrganizeMove(move, playerId, pieces, playerCount),
        reason: "ORGANIZE move validation",
      };
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/rules/move-validation-specific.test.ts -t "ORGANIZE"`
Expected: PASS

- [ ] **Step 6: Also note — ORGANIZE seat-to-seat was missing adjacency check**

The current seat-to-seat ORGANIZE code doesn't call `areSeatsAdjacent`. The fix above adds it. The manual says "move one of your pieces one space to the left or right" — that's adjacent only.

- [ ] **Step 7: Commit**

```bash
git add src/rules/move-validation.ts src/game/validation.ts src/__tests__/rules/move-validation-specific.test.ts
git commit -m "fix: ORGANIZE uses rostrum adjacency config; seats check adjacency"
```

---

### Task 7: Faction Collapse Rule (new module)

The manual says: *"If a piece occupies a Rostrum in any Faction where no Seats are occupied, that piece must immediately be moved down to a Seat of that player's choice in the corresponding faction. Likewise, if a piece occupies any player's Office while neither of their Rostrums are occupied, that piece must also be immediately moved down to a Rostrum of that player's choice."*

This auto-cascade must trigger after any move that removes/withdraws a piece from a seat.

**Files:**
- Create: `src/rules/faction-collapse.ts`
- Test: `src/__tests__/rules/faction-collapse.test.ts`
- Modify: `src/App.tsx` (call collapse check after piece moves resolve)

- [ ] **Step 1: Write tests for faction collapse detection**

Create `src/__tests__/rules/faction-collapse.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { detectFactionCollapse } from "../../rules/faction-collapse";
import type { Piece } from "../../types";

describe("detectFactionCollapse", () => {
  it("should detect collapse when rostrum1 occupied but seats 1-3 all empty", () => {
    const pieces: Piece[] = [
      { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
    ];
    const result = detectFactionCollapse(pieces, 3);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      pieceId: "h1",
      fromLocationId: "p1_rostrum1",
      validDestinations: ["p1_seat1", "p1_seat2", "p1_seat3"],
    });
  });

  it("should NOT detect collapse when at least one seat in faction is occupied", () => {
    const pieces: Piece[] = [
      { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
      { id: "m1", name: "Mark", displayName: "M1", locationId: "p1_seat2", position: { left: 0, top: 0 }, rotation: 0 },
    ];
    const result = detectFactionCollapse(pieces, 3);
    expect(result).toHaveLength(0);
  });

  it("should detect office collapse when both rostrums empty", () => {
    const pieces: Piece[] = [
      { id: "p1", name: "Pawn", displayName: "P1", locationId: "p1_office", position: { left: 0, top: 0 }, rotation: 0 },
    ];
    const result = detectFactionCollapse(pieces, 3);
    expect(result).toHaveLength(1);
    expect(result[0].fromLocationId).toBe("p1_office");
    expect(result[0].validDestinations).toEqual(["p1_rostrum1", "p1_rostrum2"]);
  });

  it("should detect cascading collapse (office → rostrum → seat)", () => {
    // Office occupied, both rostrums empty, all seats empty
    const pieces: Piece[] = [
      { id: "p1", name: "Pawn", displayName: "P1", locationId: "p1_office", position: { left: 0, top: 0 }, rotation: 0 },
    ];
    const result = detectFactionCollapse(pieces, 3);
    // Should detect office collapse first (rostrum destinations)
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].fromLocationId).toBe("p1_office");
  });

  it("should check all players", () => {
    const pieces: Piece[] = [
      { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
      { id: "h2", name: "Heel", displayName: "H2", locationId: "p2_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
    ];
    const result = detectFactionCollapse(pieces, 3);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail (module doesn't exist yet)**

Run: `npx vitest run src/__tests__/rules/faction-collapse.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement faction collapse detection**

Create `src/rules/faction-collapse.ts`:

```typescript
/**
 * Faction Collapse Rule
 *
 * Manual: "If a piece occupies a Rostrum in any Faction where no Seats are occupied,
 * that piece must immediately be moved down to a Seat of that player's choice in
 * the corresponding faction. Likewise, if a piece occupies any player's Office while
 * neither of their Rostrums are occupied, that piece must also be immediately moved
 * down to a Rostrum of that player's choice."
 */

import type { Piece } from "../types";

export interface CollapseAction {
  pieceId: string;
  fromLocationId: string;
  validDestinations: string[];
}

/**
 * Detects all pieces that must collapse due to unsupported positions.
 * Returns an array of required collapse actions. Office collapses are listed
 * before rostrum collapses since they must resolve top-down.
 */
export function detectFactionCollapse(
  pieces: Piece[],
  playerCount: number
): CollapseAction[] {
  const collapses: CollapseAction[] = [];

  for (let playerId = 1; playerId <= playerCount; playerId++) {
    // Check office: needs at least one rostrum occupied
    const officePiece = pieces.find(
      (p) => p.locationId === `p${playerId}_office`
    );
    if (officePiece) {
      const rostrum1Occupied = pieces.some(
        (p) => p.locationId === `p${playerId}_rostrum1`
      );
      const rostrum2Occupied = pieces.some(
        (p) => p.locationId === `p${playerId}_rostrum2`
      );
      if (!rostrum1Occupied && !rostrum2Occupied) {
        const validDestinations: string[] = [];
        if (!rostrum1Occupied) validDestinations.push(`p${playerId}_rostrum1`);
        if (!rostrum2Occupied) validDestinations.push(`p${playerId}_rostrum2`);
        collapses.push({
          pieceId: officePiece.id,
          fromLocationId: `p${playerId}_office`,
          validDestinations,
        });
      }
    }

    // Check rostrum1: needs at least one of seats 1-3 occupied
    const rostrum1Piece = pieces.find(
      (p) => p.locationId === `p${playerId}_rostrum1`
    );
    if (rostrum1Piece) {
      const faction1HasSeat = [1, 2, 3].some((s) =>
        pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
      );
      if (!faction1HasSeat) {
        const vacantSeats = [1, 2, 3].filter(
          (s) =>
            !pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
        );
        collapses.push({
          pieceId: rostrum1Piece.id,
          fromLocationId: `p${playerId}_rostrum1`,
          validDestinations: vacantSeats.map(
            (s) => `p${playerId}_seat${s}`
          ),
        });
      }
    }

    // Check rostrum2: needs at least one of seats 4-6 occupied
    const rostrum2Piece = pieces.find(
      (p) => p.locationId === `p${playerId}_rostrum2`
    );
    if (rostrum2Piece) {
      const faction2HasSeat = [4, 5, 6].some((s) =>
        pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
      );
      if (!faction2HasSeat) {
        const vacantSeats = [4, 5, 6].filter(
          (s) =>
            !pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
        );
        collapses.push({
          pieceId: rostrum2Piece.id,
          fromLocationId: `p${playerId}_rostrum2`,
          validDestinations: vacantSeats.map(
            (s) => `p${playerId}_seat${s}`
          ),
        });
      }
    }
  }

  return collapses;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/rules/faction-collapse.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rules/faction-collapse.ts src/__tests__/rules/faction-collapse.test.ts
git commit -m "feat: add faction collapse detection per manual rules"
```

- [ ] **Step 6: Integrate into App.tsx**

This step requires careful integration. After any move resolves (piece drop handler, correction phase, bureaucracy move), call `detectFactionCollapse(pieces, playerCount)`. If the result is non-empty, present a modal/prompt for the affected player to choose which destination the collapsing piece goes to. If there is only one valid destination, auto-resolve it.

**Note:** The UI integration for this is more complex and may need its own sub-task for the modal component. The detection logic is self-contained and testable independently. Flag this for a follow-up UI task after the core rule fixes are done.

---

## Phase 3 — Medium-Priority Fixes

---

### Task 8: Blank tile cannot achieve a winning setup

The manual says: *"The blank tile cannot be used to achieve a winning setup."*

**Files:**
- Modify: `src/rules/win-conditions.ts`
- Test: `src/__tests__/rules/win-conditions.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
it("should not count a win achieved via blank tile play", () => {
  // Player 1 has winning board state
  const pieces: Piece[] = [
    { id: "p1", name: "Pawn", displayName: "P1", locationId: "p1_office", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "h1", name: "Heel", displayName: "H1", locationId: "p1_rostrum1", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "h2", name: "Heel", displayName: "H2", locationId: "p1_rostrum2", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m1", name: "Mark", displayName: "M1", locationId: "p1_seat1", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m2", name: "Mark", displayName: "M2", locationId: "p1_seat2", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m3", name: "Mark", displayName: "M3", locationId: "p1_seat3", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m4", name: "Mark", displayName: "M4", locationId: "p1_seat4", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m5", name: "Mark", displayName: "M5", locationId: "p1_seat5", position: { left: 0, top: 0 }, rotation: 0 },
    { id: "m6", name: "Mark", displayName: "M6", locationId: "p1_seat6", position: { left: 0, top: 0 }, rotation: 0 },
  ];
  const hasWon = checkPlayerWinCondition(1, pieces, "BLANK");
  expect(hasWon).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — function doesn't accept tile parameter yet

- [ ] **Step 3: Add optional tileId parameter to win check**

In `src/rules/win-conditions.ts`, update `checkPlayerWinCondition`:

```typescript
export function checkPlayerWinCondition(
  playerId: number,
  pieces: Piece[],
  currentTileId?: string
): boolean {
  // Blank tile cannot achieve winning setup (manual rule)
  if (currentTileId === "BLANK") return false;

  // ... rest of existing logic unchanged
```

Update `checkBureaucracyWinCondition` — no tile parameter needed since Bureaucracy wins don't involve tiles.

- [ ] **Step 4: Update call sites in App.tsx**

Where Campaign win checks call `checkPlayerWinCondition`, pass the `playedTile.tileId` as the third argument. Bureaucracy win checks remain unchanged.

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/rules/win-conditions.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/rules/win-conditions.ts src/__tests__/rules/win-conditions.test.ts src/App.tsx
git commit -m "fix: blank tile cannot achieve winning setup per manual"
```

---

### Task 9: Bureaucracy turn order tiebreaker

The manual says ties are broken by: Pawn owner first → most Heels → most Marks → most Credibility. The app just uses player ID.

**Files:**
- Modify: `src/game/bureaucracy.ts:33-48`
- Test: `src/__tests__/game/bureaucracy.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
it("should break kredcoin ties by Pawn ownership, then Heels, then Marks, then Credibility", () => {
  const pieces: Piece[] = [
    // Player 1 has a Pawn in office
    { id: "p1", name: "Pawn", displayName: "P1", locationId: "p1_office", position: { left: 0, top: 0 }, rotation: 0 },
    // Player 2 has no Pawn placed
  ];
  const players: Player[] = [
    { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [{ id: "05", imageUrl: "" }], credibility: 2 },
    { id: 2, hand: [], keptTiles: [], bureaucracyTiles: [{ id: "06", imageUrl: "" }], credibility: 3 },
  ];
  // Both have same kredcoin. Player 1 has Pawn, should go first.
  const order = getBureaucracyTurnOrder(players, pieces);
  expect(order[0]).toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — function doesn't accept `pieces` parameter

- [ ] **Step 3: Update getBureaucracyTurnOrder with manual tiebreaker**

```typescript
export function getBureaucracyTurnOrder(players: Player[], pieces: Piece[]): number[] {
  const playerKredcoin = players.map((p) => ({
    id: p.id,
    kredcoin: calculatePlayerKredcoin(p),
  }));

  playerKredcoin.sort((a, b) => {
    // Primary: kredcoin descending
    if (b.kredcoin !== a.kredcoin) {
      return b.kredcoin - a.kredcoin;
    }

    // Tiebreaker 1: player with a Pawn in their domain goes first
    const aHasPawn = pieces.some(
      (p) => p.name === "Pawn" && p.locationId?.startsWith(`p${a.id}_`)
    );
    const bHasPawn = pieces.some(
      (p) => p.name === "Pawn" && p.locationId?.startsWith(`p${b.id}_`)
    );
    if (aHasPawn && !bHasPawn) return -1;
    if (!aHasPawn && bHasPawn) return 1;

    // Tiebreaker 2: most Heels in domain
    const aHeels = pieces.filter(
      (p) => p.name === "Heel" && p.locationId?.startsWith(`p${a.id}_`)
    ).length;
    const bHeels = pieces.filter(
      (p) => p.name === "Heel" && p.locationId?.startsWith(`p${b.id}_`)
    ).length;
    if (aHeels !== bHeels) return bHeels - aHeels;

    // Tiebreaker 3: most Marks in domain
    const aMarks = pieces.filter(
      (p) => p.name === "Mark" && p.locationId?.startsWith(`p${a.id}_`)
    ).length;
    const bMarks = pieces.filter(
      (p) => p.name === "Mark" && p.locationId?.startsWith(`p${b.id}_`)
    ).length;
    if (aMarks !== bMarks) return bMarks - aMarks;

    // Tiebreaker 4: most Credibility
    const aPlayer = players.find((p) => p.id === a.id);
    const bPlayer = players.find((p) => p.id === b.id);
    const aCred = aPlayer?.credibility ?? 0;
    const bCred = bPlayer?.credibility ?? 0;
    return bCred - aCred;
  });

  return playerKredcoin.map((pk) => pk.id);
}
```

- [ ] **Step 4: Update all call sites to pass `pieces`**

Search for all calls to `getBureaucracyTurnOrder` in `src/App.tsx` and `src/hooks/` and add the `pieces` argument.

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/game/bureaucracy.test.ts`
Expected: PASS (update existing tests that call with old signature)

- [ ] **Step 6: Commit**

```bash
git add src/game/bureaucracy.ts src/__tests__/game/bureaucracy.test.ts src/App.tsx
git commit -m "fix: Bureaucracy tiebreaker uses Pawn/Heels/Marks/Credibility per manual"
```

---

### Task 10: Receiver credibility restoration — up to 2 notches OR free Advance

The manual has nuanced rules for the Receiver who rejects a dishonest play:
- If receiver had 2 notches lost → restore up to 2
- If receiver had 1 notch lost → restore 1
- If receiver had full credibility → free Advance action instead

**Files:**
- Modify: `src/rules/credibility.ts` (add `restoreReceiverCredibility` function)
- Test: `src/__tests__/rules/credibility.test.ts`
- Modify: `src/App.tsx` (use new function in rejection flow)

- [ ] **Step 1: Write tests for receiver restoration**

```typescript
describe("restoreReceiverCredibility", () => {
  it("should restore 2 notches when receiver had 2 notches lost (credibility 1)", () => {
    const players: Player[] = [
      { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 1 },
    ];
    const result = restoreReceiverCredibility(players, 1);
    expect(result.players[0].credibility).toBe(3);
    expect(result.freeAdvance).toBe(false);
  });

  it("should restore 1 notch when receiver had 1 notch lost (credibility 2)", () => {
    const players: Player[] = [
      { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 2 },
    ];
    const result = restoreReceiverCredibility(players, 1);
    expect(result.players[0].credibility).toBe(3);
    expect(result.freeAdvance).toBe(false);
  });

  it("should grant free Advance when receiver already has full credibility", () => {
    const players: Player[] = [
      { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 3 },
    ];
    const result = restoreReceiverCredibility(players, 1);
    expect(result.players[0].credibility).toBe(3);
    expect(result.freeAdvance).toBe(true);
  });

  it("should restore up to 2 notches when at 0 credibility", () => {
    const players: Player[] = [
      { id: 1, hand: [], keptTiles: [], bureaucracyTiles: [], credibility: 0 },
    ];
    const result = restoreReceiverCredibility(players, 1);
    expect(result.players[0].credibility).toBe(2);
    expect(result.freeAdvance).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Expected: FAIL — function doesn't exist yet

- [ ] **Step 3: Implement restoreReceiverCredibility**

Add to `src/rules/credibility.ts`:

```typescript
/**
 * Restores credibility for a Receiver who exposes a dishonest play.
 *
 * Manual rules:
 * - Restore up to 2 notches (max credibility is 3)
 * - If already at full credibility (3), grant a free Advance action instead
 */
export function restoreReceiverCredibility(
  players: Player[],
  receiverId: number
): { players: Player[]; freeAdvance: boolean } {
  const receiver = players.find((p) => p.id === receiverId);
  if (!receiver) return { players, freeAdvance: false };

  if (receiver.credibility >= 3) {
    return { players, freeAdvance: true };
  }

  const newCredibility = Math.min(3, receiver.credibility + 2);
  const updatedPlayers = players.map((p) =>
    p.id === receiverId ? { ...p, credibility: newCredibility } : p
  );

  return { players: updatedPlayers, freeAdvance: false };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/rules/credibility.test.ts`
Expected: PASS

- [ ] **Step 5: Integrate into App.tsx rejection flow**

Replace the current receiver credibility logic in the "WHISTLE BLOWN" (receiver rejects) path with a call to `restoreReceiverCredibility`. If `freeAdvance` is true, trigger the free Advance action UI.

- [ ] **Step 6: Commit**

```bash
git add src/rules/credibility.ts src/__tests__/rules/credibility.test.ts src/App.tsx
git commit -m "fix: Receiver restores up to 2 credibility or gets free Advance per manual"
```

---

### Task 11: Clarify Take Advantage as the manual's Bureaucracy action reward

**RESOLVED:** The "Take Advantage" mechanic IS the manual's "use funding to perform one Bureaucracy action" — it's the digital implementation of how a challenger converts tile funding into a Bureaucracy action. No functional change needed.

**Files:**
- Modify: `src/App.tsx` (Take Advantage comments/documentation only)

- [ ] **Step 1: Update comments in Take Advantage flow**

In the Take Advantage section of `App.tsx` (~lines 2924-3421), update the code comments to explicitly reference the manual rule:

```typescript
/**
 * Take Advantage Flow
 * 
 * Manual reference: "The Challenger may either restore 1 notch on their
 * Credibility token or use funding to perform one Bureaucracy action."
 * 
 * This flow implements the "use funding" option. The challenger selects
 * tiles from the dishonest mover's bank, converts them to kredcoin,
 * and performs one Bureaucracy menu action.
 */
```

- [ ] **Step 2: Verify the challenger choice modal offers both options**

Confirm the UI presents two clear options when a challenge succeeds:
1. "Restore 1 Credibility"
2. "Take Advantage" (use funding for 1 Bureaucracy action)

If only one option is shown, add the missing one.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "docs: clarify Take Advantage implements manual's Bureaucracy action reward"
```

---

### Task 12: Mover with 0 credibility — forced Withdraw on dishonest play

The manual says: *"If they had no Credibility at the start of that turn, they must instead take a Withdraw action."*

The app partially handles this (`App.tsx:2865`) but needs to track **starting-turn** credibility, not current credibility (which may have changed during the turn).

**Files:**
- Modify: `src/App.tsx` (~line 2862-2870)
- Test: Manual testing needed (state-dependent)

- [ ] **Step 1: Track credibility at turn start**

Add a state variable to store each player's credibility at the start of their turn:

```typescript
const [credibilityAtTurnStart, setCredibilityAtTurnStart] = useState<Record<number, number>>({});
```

When a player begins their turn as Mover, snapshot their credibility:

```typescript
setCredibilityAtTurnStart(prev => ({
  ...prev,
  [currentPlayerId]: currentPlayer.credibility
}));
```

- [ ] **Step 2: Use starting credibility for forced Withdraw check**

In `transitionToCorrectionPhase` (~line 2863), replace:

```typescript
// BEFORE:
const playerHasZeroCredibility = tilePlayer && tilePlayer.credibility === 0;

// AFTER:
const playerHadZeroCredibilityAtTurnStart =
  tilePlayer && (credibilityAtTurnStart[tilePlayer.id] ?? tilePlayer.credibility) === 0;
```

- [ ] **Step 3: Also handle — Mover with 0 cred does NOT restore on honest challenge**

The manual says: *"If they had no Credibility at the start of that turn, they do not restore Credibility"* when challenged and shown honest. Find the "WITCH HUNT" path in App.tsx where mover restores 1 credibility, and add the check:

```typescript
if (credibilityAtTurnStart[playedTile.playerId] > 0) {
  // Restore 1 credibility to mover
}
// else: no restoration (had 0 at turn start)
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "fix: track starting-turn credibility for 0-cred penalty rules"
```

---

## Phase 4 — Low-Priority Fixes & Guardrails

---

### Task 13: Face-up tiles excluded from Bureaucracy funding

Verify the app already handles this. The `calculatePlayerKredcoin` function in `src/game/bureaucracy.ts` sums `player.bureaucracyTiles`. Need to confirm face-up tiles (from dishonest plays caught) are NOT added to `bureaucracyTiles`.

**Files:**
- Review: `src/App.tsx` (where tiles are added to bureaucracy pile)
- Review: `src/hooks/useGameState.ts:189-190` (addBankedTile)

- [ ] **Step 1: Trace the tile flow**

When a tile is rejected/challenged and found dishonest, it goes to `bankedTiles` with `faceUp: true` (see `App.tsx:2144`). Check whether `bureaucracyTiles` (which feeds kredcoin calculation) also includes these face-up tiles.

The `bankedTiles` array (used for display) is separate from `player.bureaucracyTiles` (used for kredcoin). Confirm that dishonest tiles are ONLY added to `bankedTiles` with `faceUp: true` and NOT to `player.bureaucracyTiles`.

- [ ] **Step 2: Add a test if not already covered**

```typescript
it("should not include face-up tiles in kredcoin calculation", () => {
  // Verify bureaucracyTiles only contains face-down tiles
});
```

- [ ] **Step 3: Fix if needed, commit**

---

### Task 14: Same-piece-twice guardrail

The manual says: *"they must affect separate pieces."* Two moves in one turn cannot target the same piece.

**Files:**
- Modify: `src/game/validation.ts:36-62` (add to `validateMovesForTilePlay`)
- Test: `src/__tests__/game/validation.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
it("should reject two moves that affect the same piece", () => {
  const moves: TrackedMove[] = [
    { pieceId: "m1", moveType: DefinedMoveType.INFLUENCE, category: "O", fromLocationId: "p2_seat3", toLocationId: "p1_seat6" },
    { pieceId: "m1", moveType: DefinedMoveType.ADVANCE, category: "M", fromLocationId: "p1_seat6", toLocationId: "p1_rostrum2" },
  ];
  const result = validateMovesForTilePlay(moves);
  expect(result.isValid).toBe(false);
  expect(result.error).toContain("separate pieces");
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — no same-piece check exists

- [ ] **Step 3: Add same-piece check**

In `src/game/validation.ts`, inside `validateMovesForTilePlay`, after the existing validations:

```typescript
  // Two moves must affect separate pieces (manual rule)
  if (movesPerformed.length === 2) {
    if (movesPerformed[0].pieceId === movesPerformed[1].pieceId) {
      return {
        isValid: false,
        error: "Two moves in a turn must affect separate pieces",
      };
    }
  }
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/game/validation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/validation.ts src/__tests__/game/validation.test.ts
git commit -m "fix: two moves per turn must affect separate pieces per manual"
```

---

### Task 15: Bureaucracy — remove 2-move cap (if present)

The manual does not cap moves in Bureaucracy — players can buy as many actions as they can afford. Verify if the app enforces a cap and remove it.

**Files:**
- Review: `src/hooks/useBureaucracy.ts` or `src/App.tsx` Bureaucracy handlers

- [ ] **Step 1: Search for Bureaucracy move limits**

Search for any `maxMoves`, `movesRemaining`, or `moveCount` tracking during Bureaucracy that would cap purchases at 2.

- [ ] **Step 2: Remove the cap if found**

The manual says: *"limited only by their available funding and the number of available pieces."*

- [ ] **Step 3: Test and commit**

---

### Task 16: Self-play restriction

The manual says a player can only play a tile to themselves *"if they are the only player left with a tile."*

**Files:**
- Modify: Tile play handler in `src/App.tsx` or `src/handlers/gameFlowHandlers.ts`
- Test: Integration test

- [ ] **Step 1: Find where receiver selection is handled**

- [ ] **Step 2: Add validation**

When the mover selects themselves as receiver, check that no other player has tiles remaining. If others have tiles, block the self-play with an alert.

- [ ] **Step 3: Test and commit**

---

## Phase 5 — Gameplay Flow: Move-Before-Tile with Honest Tile Hints

This is the largest structural change. The mover's turn flow changes from "select tile, make moves, end turn" to "make moves, select tile (with honest hints), select receiver, end turn." Tiles in the mover's hand that match the moves they've made glow/pulsate. Dishonest tile picks remain allowed.

---

### Task 17: Tile-matching hint utility — `getMatchingTiles`

A pure function that takes the mover's performed moves and their hand, and returns which tiles match honestly.

**Files:**
- Create: `src/game/tile-matching.ts`
- Test: `src/__tests__/game/tile-matching.test.ts`

- [ ] **Step 1: Write tests for tile matching**

Create `src/__tests__/game/tile-matching.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getMatchingTileIds } from "../../game/tile-matching";
import { DefinedMoveType } from "../../types/move";
import type { TrackedMove, Tile } from "../../types";

describe("getMatchingTileIds", () => {
  const hand: Tile[] = [
    { id: "01", imageUrl: "" }, // REMOVE + ADVANCE
    { id: "05", imageUrl: "" }, // ADVANCE only
    { id: "15", imageUrl: "" }, // REMOVE only
  ];

  it("should match tile 01 when REMOVE and ADVANCE were performed", () => {
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.REMOVE, category: "O", fromLocationId: "p2_seat1", toLocationId: "community1" },
      { pieceId: "m2", moveType: DefinedMoveType.ADVANCE, category: "M", fromLocationId: "community2", toLocationId: "p1_seat1" },
    ];
    const result = getMatchingTileIds(moves, hand);
    expect(result).toContain("01");
    expect(result).not.toContain("05");
    expect(result).not.toContain("15");
  });

  it("should match tile 05 when only ADVANCE was performed", () => {
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.ADVANCE, category: "M", fromLocationId: "community1", toLocationId: "p1_seat1" },
    ];
    const result = getMatchingTileIds(moves, hand);
    expect(result).toContain("05");
    expect(result).not.toContain("01");
  });

  it("should match BLANK tile for any moves in a 5-player game", () => {
    const handWithBlank: Tile[] = [
      { id: "BLANK", imageUrl: "" },
      { id: "01", imageUrl: "" },
    ];
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.REMOVE, category: "O", fromLocationId: "p2_seat1", toLocationId: "community1" },
    ];
    const result = getMatchingTileIds(moves, handWithBlank);
    expect(result).toContain("BLANK");
  });

  it("should match nothing when no moves were made and hand has no BLANK or no-requirement tiles", () => {
    const moves: TrackedMove[] = [];
    const result = getMatchingTileIds(moves, hand);
    // Tiles with requirements should NOT match zero moves (zero moves means requirements unmet)
    // Only tiles whose requirements are empty would match
    expect(result).toHaveLength(0);
  });

  it("should return empty array when hand is empty", () => {
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.ADVANCE, category: "M", fromLocationId: "community1", toLocationId: "p1_seat1" },
    ];
    const result = getMatchingTileIds(moves, []);
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/game/tile-matching.test.ts`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement tile matching**

Create `src/game/tile-matching.ts`:

```typescript
/**
 * Tile Matching — Determines which tiles in a player's hand honestly
 * match the moves they've performed this turn.
 *
 * Used to show visual hints (glow/pulsate) on honest tile options
 * after the mover has made their moves, before selecting a tile.
 */

import { TILE_REQUIREMENTS } from "../config/rules";
import type { TrackedMove, Tile } from "../types";
import type { DefinedMoveType } from "../types/move";

/**
 * Returns the IDs of tiles in the player's hand whose required moves
 * exactly match the moves performed (order-independent).
 *
 * Match criteria:
 * - The set of performed move types must be a superset of the tile's required moves
 * - No extra moves beyond what the tile requires
 * - BLANK tile matches any legal set of moves (including zero moves)
 *
 * @param movesPerformed - Moves the mover has made this turn
 * @param hand - Tiles currently in the mover's hand
 * @returns Array of tile IDs that honestly match
 */
export function getMatchingTileIds(
  movesPerformed: TrackedMove[],
  hand: Tile[]
): string[] {
  const performedTypes = movesPerformed.map((m) => m.moveType);

  return hand
    .filter((tile) => {
      // BLANK tile matches any legal move set
      if (tile.id === "BLANK") return true;

      const req = TILE_REQUIREMENTS[tile.id];
      if (!req) return false;

      const required: DefinedMoveType[] = req.requiredMoves;

      // Check exact match: same move types, same count
      if (required.length !== performedTypes.length) return false;

      // Every required move type must appear in performed moves
      const performedCopy = [...performedTypes];
      for (const reqMove of required) {
        const idx = performedCopy.indexOf(reqMove);
        if (idx === -1) return false;
        performedCopy.splice(idx, 1);
      }

      // No extra moves should remain
      return performedCopy.length === 0;
    })
    .map((tile) => tile.id);
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/game/tile-matching.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/tile-matching.ts src/__tests__/game/tile-matching.test.ts
git commit -m "feat: add tile-matching utility for honest tile hints"
```

---

### Task 18: Reverse Campaign flow — moves first, then tile selection

Restructure the Campaign turn so the mover:
1. Makes 0-2 moves on the board (no tile selected yet)
2. Sees which tiles in their hand glow (honest matches via `getMatchingTileIds`)
3. Selects any tile from their hand (honest or dishonest — their choice)
4. Selects a receiver
5. Ends turn → tile passes face-down to receiver

This is a significant state machine change.

**Files:**
- Modify: `src/App.tsx` (CAMPAIGN state flow, `handleEndTurn`, tile play handlers)
- Modify: `src/components/screens/CampaignScreen.tsx` (hand panel UI, tile glow effect)
- Modify: `src/hooks/useTilePlayWorkflow.ts` (decouple tile selection from move start)
- Test: Existing campaign integration tests + manual testing

- [ ] **Step 1: Add new game state — `SELECTING_TILE`**

Currently the flow is: `CAMPAIGN` (select tile + move) → `TILE_PLAYED` (end turn) → `PENDING_ACCEPTANCE`.

New flow: `CAMPAIGN` (make moves only) → `SELECTING_TILE` (pick tile from hand + pick receiver) → `PENDING_ACCEPTANCE`.

In the game state type definition, add `"SELECTING_TILE"` as a valid state:

```typescript
// In the gameState type (find where GameState is typed as a union of string literals)
type GameState = "PLAYER_SELECTION" | "DRAFTING" | "CAMPAIGN" | "SELECTING_TILE" | "TILE_PLAYED" | "PENDING_ACCEPTANCE" | "PENDING_CHALLENGE" | "CORRECTION_REQUIRED" | "BUREAUCRACY";
```

- [ ] **Step 2: Modify "End Turn" to transition to SELECTING_TILE**

When the mover clicks "End Turn" (or "Done Moving") during CAMPAIGN state, instead of requiring a tile to already be selected, transition to `SELECTING_TILE`:

```typescript
// In handleEndTurn, when gameState === "CAMPAIGN":
// 1. Snapshot pieces (for challenge revert)
// 2. Calculate moves performed
// 3. Validate moves (max 2, separate pieces, etc.)
// 4. Compute matching tile IDs via getMatchingTileIds
// 5. Transition to SELECTING_TILE state
setGameState("SELECTING_TILE");
```

- [ ] **Step 3: Compute and store matching tile IDs**

Add state to track which tiles match:

```typescript
const [matchingTileIds, setMatchingTileIds] = useState<string[]>([]);
```

When entering `SELECTING_TILE`, compute the matches:

```typescript
import { getMatchingTileIds } from "./game/tile-matching";

const currentPlayer = players[currentPlayerIndex];
const matches = getMatchingTileIds(calculatedMoves, currentPlayer.keptTiles);
setMatchingTileIds(matches);
```

- [ ] **Step 4: Update CampaignScreen hand panel for SELECTING_TILE state**

When `gameState === "SELECTING_TILE"`, the hand panel should:
- Show all tiles in the mover's hand
- Apply a CSS glow/pulsate animation to tiles whose IDs are in `matchingTileIds`
- All tiles remain clickable (dishonest play allowed)
- Clicking a tile opens the receiver selection (which player to pass to)

CSS for the glow effect (add to the tile card component or as inline styles):

```css
@keyframes tileGlow {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(34, 197, 94, 0.6); }
  50% { box-shadow: 0 0 16px 6px rgba(34, 197, 94, 0.9); }
}

.tile-honest-match {
  animation: tileGlow 1.5s ease-in-out infinite;
  border: 2px solid rgb(34, 197, 94);
}
```

- [ ] **Step 5: Add receiver selection after tile pick**

After the mover clicks a tile in `SELECTING_TILE` state, show a receiver selection UI (dropdown or player buttons). Once receiver is selected, create the `playedTile` state and transition to `PENDING_ACCEPTANCE`:

```typescript
// When tile + receiver are selected in SELECTING_TILE:
setPlayedTile({
  tileId: selectedTileId,
  playerId: currentPlayer.id,
  receivingPlayerId: selectedReceiverId,
  movesPerformed: calculatedMoves,
  originalPieces: piecesSnapshot,
  originalBoardTiles: [...boardTiles],
});
setGameState("PENDING_ACCEPTANCE");
```

- [ ] **Step 6: Remove old tile-first flow**

Remove or disable the old flow where tile selection happens BEFORE moves. The CAMPAIGN state should now only show the board + pieces for moving, with the hand panel visible but tiles not selectable until `SELECTING_TILE`.

- [ ] **Step 7: Update multiplayer action emission**

In `src/hooks/useSupabaseActions.ts`, the tile play action needs to be emitted AFTER `SELECTING_TILE` resolves (not at the start of the turn). Ensure the action packet includes the tile ID, receiver ID, and moves performed.

- [ ] **Step 8: Update CampaignScreen rendering for the new state**

In the main `switch(gameState)` render block in `App.tsx` (~line 3727), add `"SELECTING_TILE"` to the CAMPAIGN case group:

```typescript
case "CAMPAIGN":
case "SELECTING_TILE":
case "TILE_PLAYED":
case "PENDING_ACCEPTANCE":
// ...existing render
```

Pass `matchingTileIds` and `gameState` as props to CampaignScreen so it knows when to show the glow effect.

- [ ] **Step 9: Manual test the full flow**

Test all scenarios:
1. Mover makes 0 moves → End Turn → SELECTING_TILE → tiles with no requirements glow → picks any tile → selects receiver
2. Mover makes 1 ADVANCE → End Turn → tiles requiring only ADVANCE glow (e.g., 05, 06) → picks honest tile
3. Mover makes REMOVE + ADVANCE → picks tile 15 (REMOVE only) dishonestly → receiver gets it → challenge flow works
4. Mover makes moves → glowing tiles visible → picks non-glowing tile (dishonest) → flow continues
5. Multiplayer: guest mover's tile selection syncs to host correctly

- [ ] **Step 10: Commit**

```bash
git add src/App.tsx src/components/screens/CampaignScreen.tsx src/hooks/useTilePlayWorkflow.ts src/hooks/useSupabaseActions.ts
git commit -m "feat: reverse Campaign flow to moves-first then tile selection with honest hints"
```

---

### Task 19: Illegal move detection

Since the mover now makes moves before selecting a tile, the system can check whether the performed moves match ANY tile in the game (not just the player's hand). If not, the move combination is "illegal" per the manual.

**Implementation approach:** After the mover finishes moves and before entering `SELECTING_TILE`, run `getMatchingTileIds` against ALL 25 tiles (not just the player's hand). If zero tiles match, the moves are illegal — show a warning and force the mover to undo or redo their moves.

**Files:**
- Modify: `src/App.tsx` (add illegal-move check before SELECTING_TILE transition)
- Modify: `src/game/tile-matching.ts` (add `isLegalMoveSet` function)
- Test: `src/__tests__/game/tile-matching.test.ts`

- [ ] **Step 1: Write test for illegal move detection**

```typescript
import { isLegalMoveSet } from "../../game/tile-matching";

describe("isLegalMoveSet", () => {
  it("should return true for REMOVE + ADVANCE (matches tiles 01, 02)", () => {
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.REMOVE, category: "O", fromLocationId: "p2_seat1", toLocationId: "community1" },
      { pieceId: "m2", moveType: DefinedMoveType.ADVANCE, category: "M", fromLocationId: "community2", toLocationId: "p1_seat1" },
    ];
    expect(isLegalMoveSet(moves)).toBe(true);
  });

  it("should return false for REMOVE + REMOVE (no tile has this combo)", () => {
    const moves: TrackedMove[] = [
      { pieceId: "m1", moveType: DefinedMoveType.REMOVE, category: "O", fromLocationId: "p2_seat1", toLocationId: "community1" },
      { pieceId: "m2", moveType: DefinedMoveType.REMOVE, category: "O", fromLocationId: "p2_seat2", toLocationId: "community2" },
    ];
    expect(isLegalMoveSet(moves)).toBe(false);
  });

  it("should return true for zero moves (legal — could be BLANK or tiles where all requirements are impossible)", () => {
    expect(isLegalMoveSet([])).toBe(true);
  });
});
```

- [ ] **Step 2: Implement isLegalMoveSet**

Add to `src/game/tile-matching.ts`:

```typescript
import { TILE_REQUIREMENTS } from "../config/rules";

/**
 * Checks if a set of moves matches at least one tile in the game.
 * If not, the move combination is "illegal" per the manual.
 * Zero moves are always legal (could be a blank tile or impossible requirements).
 */
export function isLegalMoveSet(movesPerformed: TrackedMove[]): boolean {
  if (movesPerformed.length === 0) return true;

  const performedTypes = movesPerformed.map((m) => m.moveType);

  return Object.values(TILE_REQUIREMENTS).some((req) => {
    const required = req.requiredMoves;
    if (required.length !== performedTypes.length) return false;

    const performedCopy = [...performedTypes];
    for (const reqMove of required) {
      const idx = performedCopy.indexOf(reqMove);
      if (idx === -1) return false;
      performedCopy.splice(idx, 1);
    }
    return performedCopy.length === 0;
  });
}
```

- [ ] **Step 3: Integrate into handleEndTurn**

Before transitioning to `SELECTING_TILE`, check legality:

```typescript
if (!isLegalMoveSet(calculatedMoves)) {
  showAlert(
    "Illegal Move",
    "This combination of moves does not match any tile in the game. Please undo and try different moves.",
    "error"
  );
  return; // Stay in CAMPAIGN state
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/__tests__/game/tile-matching.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/tile-matching.ts src/__tests__/game/tile-matching.test.ts src/App.tsx
git commit -m "feat: block illegal move combinations that match no tile"
```

---

## Execution Order Summary

| Priority | Tasks | Effort Est. |
|----------|-------|-------------|
| **Critical** | 1, 2, 3, 4 | Small fixes — 1-2 hours total |
| **High** | 5, 6, 7 | Medium — 2-3 hours (Task 7 largest) |
| **Medium** | 8, 9, 10, 11, 12 | Medium — 3-4 hours |
| **Low** | 13, 14, 15, 16 | Small — 1-2 hours |
| **Flow Rework** | 17, 18, 19 | Large — 4-6 hours (Task 18 largest, touches state machine + UI + multiplayer) |

**Recommended approach:** Execute Phases 1-4 first (get all rule fixes solid), then tackle Phase 5 (flow rework) as a dedicated effort since it touches the state machine, UI, and multiplayer sync.
