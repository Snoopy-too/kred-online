# Rostrum Relaxation & Partial-Impossibility Honesty — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two rule changes for KRED: (1) rostrum → adjacent rostrum is always legal regardless of destination supporting-seat fill (with cascade-to-seat when the destination section is fully empty), and (2) a tile is "honest in whole" when the player executes every required move that the board made possible (partial impossibility is forgiven).

**Architecture:** Two independent validation-layer changes, landing on branch `supabase-multiplayer`. The codebase has **two parallel validation stacks** — both must be updated:
- **Engine layer** (`src/engine/moveValidation.ts`, `src/engine/outcomeResolution.ts`) — used by the AI bot, playtester, and gameStateMachine. Already has per-move possibility logic; updates here make the engine honor Rule 1.
- **Shared-rules layer** (`packages/shared/src/rules/*.ts`, `packages/shared/src/game/tile-validation.ts` and the `src/` mirror copies) — used by UI drag-drop handlers and tile-validation tests.

**Tech Stack:** TypeScript, Vitest, React, Vite. Workspace package `@kred/shared`.

**Spec reference:** `docs/superpowers/specs/2026-04-18-rostrum-relaxation-and-partial-honesty-design.md`

**Branch workflow:** Single branch `supabase-multiplayer`. No PRs. After each commit, push to GitHub so Netlify deploys for online verification.

---

## Pre-flight checklist

- [ ] **P1: Confirm clean working tree & correct branch**

  Run: `git status && git branch --show-current`
  Expected: Clean tree; branch is `supabase-multiplayer`.

- [ ] **P2: Confirm baseline tests pass before changes**

  Run: `npm test -- --run`
  Expected: All tests pass. If any fail pre-change, stop and investigate — do not start modifying until baseline is green.

- [ ] **P3: Verify `src/rules/*` and `packages/shared/src/rules/*` sync status**

  Run: `diff -q src/rules/rostrum.ts packages/shared/src/rules/rostrum.ts; diff -q src/rules/movement.ts packages/shared/src/rules/movement.ts; diff -q src/rules/move-validation.ts packages/shared/src/rules/move-validation.ts; diff -q src/game/tile-validation.ts packages/shared/src/game/tile-validation.ts`
  Expected: Either "Files ... differ" (known drift) or identical. Note which pairs differ so you know to update both copies. Both trees are active: the UI code imports from `@kred/shared` (→ `packages/shared/src/`), but `src/rules/*` files are also imported internally in tests and legacy call sites.

---

## File Structure

### Files that will be modified

| File | Responsibility after change |
|---|---|
| `packages/shared/src/rules/rostrum.ts` | `validateAdjacentRostrumMovement` no longer requires destination support seats full |
| `src/rules/rostrum.ts` | Mirror of above |
| `packages/shared/src/rules/movement.ts` | `validatePieceMovement` skips seat-full check for rostrum→adjacent-rostrum; accepts rostrum → adjacent-supporting-seat when section empty. `validateMoveType` classifies cascade |
| `src/rules/movement.ts` | Mirror of above |
| `packages/shared/src/rules/move-validation.ts` | `validateOrganizeMove` / `validateInfluenceMove` accept rostrum → adjacent-supporting-seat cascade. Add exported `isMoveTypePossible` helper |
| `src/rules/move-validation.ts` | Mirror of above |
| `packages/shared/src/game/tile-validation.ts` | `canTileBeRejected` signature changes to take `possibleRequiredMoves: DefinedMoveType[]` |
| `src/game/tile-validation.ts` | Mirror of above |
| `src/engine/moveValidation.ts` | `validateOrganize`, `validateInfluence` drop `isRostrumSupportedForPlacement` check for rostrum→rostrum path; `findLegalMoves` emits cascade-to-seat moves for ORGANIZE and INFLUENCE when destination section is empty |
| `src/__tests__/rules/rostrum.test.ts` | Expanded Rule 1 coverage across 3/4/5-player modes |
| `src/__tests__/rules/movement.test.ts` | New cascade classification tests |
| `src/__tests__/rules/move-validation-specific.test.ts` (or add new `move-validation-isPossible.test.ts`) | Tests for new `isMoveTypePossible` helper + cascade in Organize/Influence |
| `src/__tests__/game/tile-validation.test.ts` | Update to new `canTileBeRejected` signature; add partial-impossibility cases |
| `src/__tests__/engine/moveValidation.test.ts` | Cascade coverage in engine `findLegalMoves` and `validateOrganize`/`validateInfluence` |
| `src/__tests__/engine/outcomeResolution.test.ts` | Partial-impossibility integration case |
| `MANUAL.md` | Rule text update for both changes |
| `.claude/GAME_RULES.md` | Same |
| `TILE_MOVES_REFERENCE.md` | Footnote the partial-impossibility clause |

### Files NOT modified

- `packages/shared/src/config/rules.ts` and `src/config/rules.ts` — tile requirements, adjacency, and support data stay the same.
- `src/handlers/pieceMovementHandlers.ts` — already delegates legality to `validatePieceMovement`, so no change needed once that validator is updated.
- `src/engine/randomBot.ts` — already samples from `findLegalMoves`, so it picks up the new cascade moves automatically once `findLegalMoves` emits them.

---

## Task Sequence Overview

Four commits, each green on `npm test`:

1. **Commit A — Rule 1 engine layer**: relax engine `validateOrganize`/`validateInfluence` and expand `findLegalMoves` to include cascade destinations; tests first.
2. **Commit B — Rule 1 shared-rules layer**: relax `validateAdjacentRostrumMovement`, `validatePieceMovement`, `validateOrganizeMove`, `validateInfluenceMove`, add `isMoveTypePossible`, update `validateMoveType`; tests first.
3. **Commit C — Rule 2**: change `canTileBeRejected` signature and implementation; update tests.
4. **Commit D — Documentation**: update `MANUAL.md`, `.claude/GAME_RULES.md`, `TILE_MOVES_REFERENCE.md`; push.

Each commit is pushed to `supabase-multiplayer` so Netlify builds each stage independently.

---

## Task 1: Engine — Rule 1 unit tests (write failing tests first)

**Files:**
- Modify: `src/__tests__/engine/moveValidation.test.ts`

The engine path is used by bots, playtester, and `determineHonesty`. These tests must fail pre-implementation, then pass after Task 2.

- [ ] **Step 1.1: Add Rule 1 test cases for `validateOrganize` (engine)**

Open `src/__tests__/engine/moveValidation.test.ts`. Locate the existing `describe('validateOrganize')` block (or the per-move-type section for ORGANIZE). Inside that describe, add:

```ts
describe('Rule 1: rostrum → adjacent rostrum with relaxed support', () => {
  it.each([3, 4, 5])('allows own rostrum → adjacent rostrum when destination section has 2 of 3 seats filled (playerCount=%i)', (playerCount) => {
    // p1_rostrum2 is adjacent to p(playerCount)_rostrum1 in the 3/4/5-player config.
    const adjPlayer = playerCount; // last player in chain owns rostrum1 adjacent to p1.rostrum2
    const pieces: KredPiece[] = [
      { id: 'piece-own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
      // Two of three supporting seats filled on destination
      { id: 's1', type: 'MARK', ownerId: adjPlayer, locationId: `p${adjPlayer}_seat1` },
      { id: 's2', type: 'MARK', ownerId: adjPlayer, locationId: `p${adjPlayer}_seat2` },
      // Another supporting seat filled in p1.rostrum2's section so moving doesn't leave office unsupported (no office piece here anyway)
    ];
    const move: EngineMove = {
      moveType: DefinedMoveType.ORGANIZE,
      pieceId: 'piece-own',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_rostrum1`,
    };
    expect(validateMove(move, 1, pieces, playerCount)).toBe(true);
  });

  it.each([3, 4, 5])('allows own rostrum → adjacent rostrum when destination section has 0 seats filled, cascading to a supporting seat (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'piece-own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
      // No pieces in p{adjPlayer}_seat1..3
    ];
    const cascadeMove: EngineMove = {
      moveType: DefinedMoveType.ORGANIZE,
      pieceId: 'piece-own',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_seat2`,
    };
    expect(validateMove(cascadeMove, 1, pieces, playerCount)).toBe(true);
  });

  it.each([3, 4, 5])('rejects rostrum → non-supporting seat of adjacent rostrum (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'piece-own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
    ];
    // seat4..6 are supporting seats for p{adjPlayer}_rostrum2, not the adjacent rostrum1
    const badMove: EngineMove = {
      moveType: DefinedMoveType.ORGANIZE,
      pieceId: 'piece-own',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_seat4`,
    };
    expect(validateMove(badMove, 1, pieces, playerCount)).toBe(false);
  });

  it.each([3, 4, 5])('rejects cascade when destination supporting seat is already occupied (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'piece-own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
      { id: 'blocker', type: 'MARK', ownerId: adjPlayer, locationId: `p${adjPlayer}_seat2` },
    ];
    const move: EngineMove = {
      moveType: DefinedMoveType.ORGANIZE,
      pieceId: 'piece-own',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_seat2`,
    };
    expect(validateMove(move, 1, pieces, playerCount)).toBe(false);
  });

  it.each([3, 4, 5])('rejects rostrum → seat when destination section has ≥1 seat filled (cascade only when section empty) (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'piece-own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
      { id: 's1', type: 'MARK', ownerId: adjPlayer, locationId: `p${adjPlayer}_seat1` },
    ];
    const move: EngineMove = {
      moveType: DefinedMoveType.ORGANIZE,
      pieceId: 'piece-own',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_seat2`,
    };
    expect(validateMove(move, 1, pieces, playerCount)).toBe(false);
  });
});
```

- [ ] **Step 1.2: Add symmetric test cases for `validateInfluence` (engine)**

Add inside the `validateInfluence` describe block:

```ts
describe('Rule 1: influence rostrum → adjacent rostrum with relaxed support', () => {
  it.each([3, 4, 5])('allows influencing opponent piece rostrum → adjacent rostrum when destination section has 0 seats filled, cascading to a supporting seat (playerCount=%i)', (playerCount) => {
    // Player 2 moves opponent-owned piece from p1_rostrum2 → p{adjPlayer}_seat2
    // But influence requires source owner != moving player. Adjacent chain: p1.rostrum2 <-> p(playerCount).rostrum1
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'opp-piece', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
    ];
    const move: EngineMove = {
      moveType: DefinedMoveType.INFLUENCE,
      pieceId: 'opp-piece',
      fromLocationId: 'p1_rostrum2',
      toLocationId: `p${adjPlayer}_seat2`,
    };
    expect(validateMove(move, 2, pieces, playerCount)).toBe(true);
  });
});
```

- [ ] **Step 1.3: Add `findLegalMoves` emission tests**

Locate the existing `describe('findLegalMoves')` section and add:

```ts
describe('Rule 1: findLegalMoves emits cascade moves', () => {
  it.each([3, 4, 5])('ORGANIZE includes rostrum → adjacent empty-section supporting seats (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'own', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
    ];
    const moves = findLegalMoves(DefinedMoveType.ORGANIZE, 1, pieces, playerCount);
    const cascadeTargets = moves
      .filter(m => m.fromLocationId === 'p1_rostrum2')
      .map(m => m.toLocationId);
    expect(cascadeTargets).toEqual(
      expect.arrayContaining([
        `p${adjPlayer}_seat1`,
        `p${adjPlayer}_seat2`,
        `p${adjPlayer}_seat3`,
      ])
    );
  });

  it.each([3, 4, 5])('INFLUENCE includes opponent rostrum → adjacent empty-section supporting seats (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: KredPiece[] = [
      { id: 'opp', type: 'MARK', ownerId: 1, locationId: 'p1_rostrum2' },
    ];
    const moves = findLegalMoves(DefinedMoveType.INFLUENCE, 2, pieces, playerCount);
    const cascadeTargets = moves
      .filter(m => m.fromLocationId === 'p1_rostrum2')
      .map(m => m.toLocationId);
    expect(cascadeTargets).toEqual(
      expect.arrayContaining([
        `p${adjPlayer}_seat1`,
        `p${adjPlayer}_seat2`,
        `p${adjPlayer}_seat3`,
      ])
    );
  });
});
```

- [ ] **Step 1.4: Run the new tests and verify they fail**

Run: `npm test -- --run src/__tests__/engine/moveValidation.test.ts`
Expected: New tests fail because the engine still enforces `isRostrumSupportedForPlacement`.

---

## Task 2: Engine — Rule 1 implementation

**Files:**
- Modify: `src/engine/moveValidation.ts`

- [ ] **Step 2.1: Relax `validateOrganize` rostrum→rostrum path and add cascade case**

In `src/engine/moveValidation.ts`, replace the `validateOrganize` function's rostrum-to-rostrum block and add a rostrum-to-seat case. Find the block starting at `// Rostrum -> adjacent rostrum (own rostrum to adjacent opponent rostrum)` (around line 278) and replace the entire `if (isRostrum(from) && isRostrum(to)) { ... }` block with:

```ts
  // Rule 1: Rostrum -> adjacent rostrum (no supporting-seat requirement)
  if (isRostrum(from) && isRostrum(to)) {
    if (!areRostrumsAdjacent(from, to, playerCount)) return false;
    if (!isVacant(to, pieces)) return false;

    // One Pawn per player for Rostrums
    if (piece.type === 'PAWN') {
      const targetOwner = getOwner(to);
      const fromOwner = getOwner(from);
      if (targetOwner !== null && targetOwner !== fromOwner) {
        const hasPawn = pieces.some(p => p.type === 'PAWN' && p.locationId.startsWith(`p${targetOwner}_`));
        if (hasPawn) return false;
      }
    }

    // Cannot move from rostrum if it would leave own office unsupported
    if (wouldLeaveOfficeUnsupported(from, pieces)) return false;

    // Rule 1: Support-for-placement check removed. Destination rostrum may have 0–3
    // supporting seats filled. When 0 filled, callers should emit a cascade move
    // (rostrum -> supporting seat) instead; see the Rostrum -> seat case below.
    return true;
  }

  // Rule 1 cascade: Rostrum -> supporting seat of adjacent rostrum when that
  // rostrum's supporting section is fully empty. Classified as ORGANIZE because
  // the geometric move is still rostrum-to-adjacent-rostrum; the landing seat is
  // the mover's declared final position.
  if (isRostrum(from) && isSeat(to)) {
    const adjRostrum = getAdjacentRostrum(from, playerCount);
    if (!adjRostrum) return false;
    const supportingSeats = getSupportingSeats(adjRostrum);
    if (!supportingSeats.includes(to)) return false;
    // Section must be fully empty for cascade
    const anySupportFilled = supportingSeats.some(s => pieces.some(p => p.locationId === s));
    if (anySupportFilled) return false;
    // Target seat must be vacant (implied by fully empty, but guard anyway)
    if (!isVacant(to, pieces)) return false;
    // One Pawn per domain restriction for cascade entering opponent domain
    if (piece.type === 'PAWN') {
      const targetOwner = getOwner(to);
      const fromOwner = getOwner(from);
      if (targetOwner !== null && targetOwner !== fromOwner) {
        const hasPawn = pieces.some(p => p.type === 'PAWN' && p.locationId.startsWith(`p${targetOwner}_`));
        if (hasPawn) return false;
      }
    }
    if (wouldLeaveOfficeUnsupported(from, pieces)) return false;
    return true;
  }
```

- [ ] **Step 2.2: Relax `validateInfluence` rostrum→rostrum path and add cascade case**

In the same file, locate `validateInfluence` and replace its `if (isRostrum(from) && isRostrum(to)) { ... }` block (around line 360) with:

```ts
  // Rule 1: Rostrum -> adjacent rostrum (no supporting-seat requirement)
  if (isRostrum(from) && isRostrum(to)) {
    if (piece.type === 'PAWN') return false;
    if (!areRostrumsAdjacent(from, to, playerCount)) return false;
    if (!isVacant(to, pieces)) return false;
    if (wouldLeaveOfficeUnsupported(from, pieces)) return false;
    // Rule 1: Support-for-placement check removed.
    return true;
  }

  // Rule 1 cascade: Rostrum -> supporting seat of adjacent rostrum when empty.
  if (isRostrum(from) && isSeat(to)) {
    if (piece.type === 'PAWN') return false;
    const adjRostrum = getAdjacentRostrum(from, playerCount);
    if (!adjRostrum) return false;
    const supportingSeats = getSupportingSeats(adjRostrum);
    if (!supportingSeats.includes(to)) return false;
    const anySupportFilled = supportingSeats.some(s => pieces.some(p => p.locationId === s));
    if (anySupportFilled) return false;
    if (!isVacant(to, pieces)) return false;
    if (wouldLeaveOfficeUnsupported(from, pieces)) return false;
    return true;
  }
```

- [ ] **Step 2.3: Expand `findLegalMoves` ORGANIZE emission**

Locate the `case DefinedMoveType.ORGANIZE:` block (around line 581). Replace the `// Own rostrums -> adjacent rostrums` sub-block:

```ts
      // Own rostrums -> adjacent rostrums (Rule 1: no support check) + cascade to seats
      const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
      if (playerRules) {
        for (const rostrumRule of playerRules.rostrums) {
          const rostrumPiece = pieces.find(p => p.locationId === rostrumRule.rostrum);
          if (rostrumPiece && !wouldLeaveOfficeUnsupported(rostrumRule.rostrum, pieces)) {
            const adjRostrum = getAdjacentRostrum(rostrumRule.rostrum, playerCount);
            if (adjRostrum) {
              const adjSupporting = getSupportingSeats(adjRostrum);
              const adjSectionEmpty = adjSupporting.every(s => !pieces.some(p => p.locationId === s));
              if (adjSectionEmpty) {
                // Cascade: emit one move per supporting seat
                for (const seatId of adjSupporting) {
                  moves.push({
                    moveType,
                    pieceId: rostrumPiece.id,
                    fromLocationId: rostrumRule.rostrum,
                    toLocationId: seatId,
                  });
                }
              } else if (isVacant(adjRostrum, pieces)) {
                // Normal rostrum landing
                moves.push({
                  moveType,
                  pieceId: rostrumPiece.id,
                  fromLocationId: rostrumRule.rostrum,
                  toLocationId: adjRostrum,
                });
              }
            }
          }
        }
      }
```

- [ ] **Step 2.4: Expand `findLegalMoves` INFLUENCE emission**

Locate the `case DefinedMoveType.INFLUENCE:` block (around line 640). Replace the `// Opponent pieces in rostrums -> adjacent rostrums` sub-block:

```ts
      // Opponent pieces in rostrums -> adjacent rostrums (Rule 1: no support check) + cascade
      for (const piece of pieces) {
        if (!isRostrum(piece.locationId)) continue;
        if (piece.type === 'PAWN') continue;
        const owner = getOwner(piece.locationId);
        if (owner === null || owner === playerId) continue;
        if (wouldLeaveOfficeUnsupported(piece.locationId, pieces)) continue;
        const adjRostrum = getAdjacentRostrum(piece.locationId, playerCount);
        if (!adjRostrum) continue;
        const adjSupporting = getSupportingSeats(adjRostrum);
        const adjSectionEmpty = adjSupporting.every(s => !pieces.some(p => p.locationId === s));
        if (adjSectionEmpty) {
          for (const seatId of adjSupporting) {
            moves.push({
              moveType,
              pieceId: piece.id,
              fromLocationId: piece.locationId,
              toLocationId: seatId,
            });
          }
        } else if (isVacant(adjRostrum, pieces)) {
          moves.push({
            moveType,
            pieceId: piece.id,
            fromLocationId: piece.locationId,
            toLocationId: adjRostrum,
          });
        }
      }
```

- [ ] **Step 2.5: Run the engine tests, verify new tests pass**

Run: `npm test -- --run src/__tests__/engine/moveValidation.test.ts`
Expected: All new Rule 1 tests pass. No regressions.

- [ ] **Step 2.6: Run full suite**

Run: `npm test -- --run`
Expected: All tests pass. Bot tests, outcome-resolution tests, and invariant tests should still pass because the changes widen legality, not narrow it, and invariants only check post-move state.

- [ ] **Step 2.7: Commit**

```bash
git add src/engine/moveValidation.ts src/__tests__/engine/moveValidation.test.ts
git commit -m "$(cat <<'EOF'
feat(rule1): engine allows rostrum->adj-rostrum regardless of support; cascades to seat when empty

validateOrganize and validateInfluence no longer require destination rostrum's
supporting seats to be filled. When the destination section is fully empty, the
move cascades to a supporting seat declared by the mover. findLegalMoves emits
both the normal and cascade destinations.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2.8: Push**

Run: `git push origin supabase-multiplayer`

---

## Task 3: Shared rules — Rule 1 tests (write failing tests first)

**Files:**
- Modify: `src/__tests__/rules/rostrum.test.ts`
- Modify: `src/__tests__/rules/movement.test.ts`

- [ ] **Step 3.1: Open `src/__tests__/rules/rostrum.test.ts` and add cases inside the existing `validateAdjacentRostrumMovement` describe**

```ts
describe('Rule 1: relaxed support for adjacent rostrum movement', () => {
  it.each([3, 4, 5])('allows rostrum → adjacent rostrum with 0 supporting seats filled (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_rostrum2', playerId: 1 } as unknown as Piece,
    ];
    const result = validateAdjacentRostrumMovement(
      'p1_rostrum2',
      `p${adjPlayer}_rostrum1`,
      1,
      playerCount,
      pieces,
    );
    expect(result.isAllowed).toBe(true);
  });

  it.each([3, 4, 5])('allows rostrum → adjacent rostrum with 1 of 3 supporting seats filled (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_rostrum2', playerId: 1 } as unknown as Piece,
      { id: 's1', name: 'Mark', locationId: `p${adjPlayer}_seat1`, playerId: adjPlayer } as unknown as Piece,
    ];
    const result = validateAdjacentRostrumMovement(
      'p1_rostrum2',
      `p${adjPlayer}_rostrum1`,
      1,
      playerCount,
      pieces,
    );
    expect(result.isAllowed).toBe(true);
  });
});
```

(The existing `it('allows adjacent rostrum movement when all supporting seats are full', ...)` test should continue passing as a regression.)

- [ ] **Step 3.2: Add cases inside `src/__tests__/rules/movement.test.ts` under the existing `validatePieceMovement` describe**

```ts
describe('Rule 1: rostrum → rostrum and cascade', () => {
  it.each([3, 4, 5])('allows own rostrum → adjacent rostrum with 2 of 3 support seats filled (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_rostrum2', playerId: 1 } as unknown as Piece,
      { id: 's1', name: 'Mark', locationId: `p${adjPlayer}_seat1`, playerId: adjPlayer } as unknown as Piece,
      { id: 's2', name: 'Mark', locationId: `p${adjPlayer}_seat2`, playerId: adjPlayer } as unknown as Piece,
    ];
    const result = validatePieceMovement(
      'own',
      'p1_rostrum2',
      `p${adjPlayer}_rostrum1`,
      1,
      pieces,
    );
    expect(result.isAllowed).toBe(true);
  });

  it.each([3, 4, 5])('allows rostrum → adjacent supporting seat when destination section is fully empty (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_rostrum2', playerId: 1 } as unknown as Piece,
    ];
    const result = validatePieceMovement(
      'own',
      'p1_rostrum2',
      `p${adjPlayer}_seat2`,
      1,
      pieces,
    );
    expect(result.isAllowed).toBe(true);
  });

  it.each([3, 4, 5])('rejects cascade when destination section is not fully empty (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_rostrum2', playerId: 1 } as unknown as Piece,
      { id: 's1', name: 'Mark', locationId: `p${adjPlayer}_seat1`, playerId: adjPlayer } as unknown as Piece,
    ];
    const result = validatePieceMovement(
      'own',
      'p1_rostrum2',
      `p${adjPlayer}_seat2`,
      1,
      pieces,
    );
    expect(result.isAllowed).toBe(false);
  });

  it('Advance (seat → own rostrum) still requires all 3 supporting seats full', () => {
    const pieces: Piece[] = [
      { id: 'own', name: 'Mark', locationId: 'p1_seat1', playerId: 1 } as unknown as Piece,
      // Only 1 of 3 seats filled
    ];
    const result = validatePieceMovement('own', 'p1_seat1', 'p1_rostrum1', 1, pieces);
    expect(result.isAllowed).toBe(false);
    expect(result.reason).toMatch(/supporting seats/);
  });
});

describe('Rule 1: validateMoveType classifies cascade', () => {
  const makePiece = (id: string, locationId: string, playerId: number): Piece =>
    ({ id, name: 'Mark', locationId, playerId } as unknown as Piece);

  it.each([3, 4, 5])('classifies own rostrum → adjacent empty-section seat as ORGANIZE (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const piece = makePiece('own', 'p1_rostrum2', 1);
    const pieces = [piece];
    expect(
      validateMoveType('p1_rostrum2', `p${adjPlayer}_seat2`, 1, piece, pieces, playerCount)
    ).toBe('ORGANIZE');
  });

  it.each([3, 4, 5])('classifies opponent rostrum → adjacent empty-section seat as INFLUENCE (playerCount=%i)', (playerCount) => {
    const adjPlayer = playerCount;
    const piece = makePiece('opp', 'p1_rostrum2', 1);
    const pieces = [piece];
    expect(
      validateMoveType('p1_rostrum2', `p${adjPlayer}_seat2`, 2, piece, pieces, playerCount)
    ).toBe('INFLUENCE');
  });

  it('returns UNKNOWN for rostrum → non-adjacent seat', () => {
    const piece = makePiece('own', 'p1_rostrum2', 1);
    // p1_seat1 is not a supporting seat of an adjacent rostrum
    expect(validateMoveType('p1_rostrum2', 'p1_seat1', 1, piece, [piece], 3)).toBe('UNKNOWN');
  });
});
```

- [ ] **Step 3.3: Run the new tests, verify they fail**

Run: `npm test -- --run src/__tests__/rules/rostrum.test.ts src/__tests__/rules/movement.test.ts`
Expected: The new Rule 1 cases fail; old regression tests still pass.

---

## Task 4: Shared rules — Rule 1 implementation

**Files:**
- Modify: `packages/shared/src/rules/rostrum.ts`
- Modify: `src/rules/rostrum.ts`
- Modify: `packages/shared/src/rules/movement.ts`
- Modify: `src/rules/movement.ts`
- Modify: `packages/shared/src/rules/move-validation.ts`
- Modify: `src/rules/move-validation.ts`

Every change below must be applied to **both copies** (shared package + `src/` mirror).

- [ ] **Step 4.1: Relax `validateAdjacentRostrumMovement`**

In `packages/shared/src/rules/rostrum.ts` (and `src/rules/rostrum.ts`), locate `validateAdjacentRostrumMovement` (around line 308). Remove the supporting-seats-full check. Replace:

```ts
  // The destination rostrum must have all supporting seats full
  if (!areSupportingSeatsFullForRostrum(targetRostrumId, pieces)) {
    const rule = getRostrumSupportRule(targetRostrumId);
    if (rule) {
      const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
      return {
        isAllowed: false,
        reason: `Cannot move to ${formatLocationId(
          targetRostrumId
        )} - only ${occupied}/3 supporting seats are full`,
      };
    }
  }

  return { isAllowed: true, reason: "Adjacent rostrum movement is valid" };
```

with:

```ts
  // Rule 1: Adjacent rostrum movement is always allowed regardless of support.
  // When the destination rostrum's supporting section is fully empty, callers
  // emit a cascade move to one of the supporting seats (see validatePieceMovement).
  return { isAllowed: true, reason: "Adjacent rostrum movement is valid" };
```

Also update the JSDoc comment above the function so it no longer says the destination must have all supporting seats full. Replace the "ADJACENCY MOVEMENT RULES" paragraph with:

```ts
 * ADJACENCY MOVEMENT RULES (Rule 1, 2026-04-18):
 * - Both rostrums must be adjacent
 * - Only the owner of the source rostrum can initiate the move
 * - Destination rostrum may have any number of supporting seats filled (0–3)
 * - When destination section is fully empty, mover must cascade to a supporting seat;
 *   that cascade is validated via validatePieceMovement (rostrum → seat path).
```

Mirror the same edit in `src/rules/rostrum.ts`.

- [ ] **Step 4.2: Relax `validatePieceMovement` rostrum destination and add cascade path**

In `packages/shared/src/rules/movement.ts` (and `src/rules/movement.ts`), locate the `// --- Moving to a ROSTRUM ---` block (around line 167). Replace the entire block from `// --- Moving to a ROSTRUM ---` through its closing `}` with:

```ts
  // --- Moving to a ROSTRUM ---
  if (targetLocationId.includes("rostrum")) {
    if (targetPlayerId !== movingPlayerId) {
      // Rule 1 exception: rostrum → adjacent opponent rostrum is allowed for Organize/Influence.
      // We detect this by (a) source is a rostrum, (b) source and target are adjacent.
      // Player-count agnostic: look up adjacency in whichever mode matches.
      const sourceIsRostrum = !!currentLocationId && currentLocationId.includes("rostrum");
      let adjacent = false;
      if (sourceIsRostrum && currentLocationId) {
        for (const pc of [3, 4, 5]) {
          const adjs = (require("../config") as typeof import("../config")).ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[pc];
          if (!adjs) continue;
          if (
            adjs.some(
              (a) =>
                (a.rostrum1 === currentLocationId && a.rostrum2 === targetLocationId) ||
                (a.rostrum2 === currentLocationId && a.rostrum1 === targetLocationId)
            )
          ) {
            adjacent = true;
            break;
          }
        }
      }
      if (!adjacent) {
        return {
          isAllowed: false,
          reason: `Cannot move a piece to opponent's rostrum`,
        };
      }
      // Rule 1: no seat-full check when moving from adjacent rostrum.
      return { isAllowed: true, reason: "Rule 1: adjacent rostrum movement" };
    }

    // Own rostrum path
    const sourceIsRostrum = !!currentLocationId && currentLocationId.includes("rostrum");
    if (sourceIsRostrum) {
      // Rule 1: rostrum → own rostrum (if adjacency config somehow connects them — not in current configs,
      // but keep the branch resilient). No seat-full check.
      return { isAllowed: true, reason: "Rule 1: rostrum-to-rostrum movement" };
    }

    // Seat → own rostrum or community → own rostrum: support check still applies.
    if (!areSupportingSeatsFullForRostrum(targetLocationId, pieces)) {
      const rule = getRostrumSupportRule(targetLocationId);
      if (rule) {
        const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
        return {
          isAllowed: false,
          reason: `Cannot move to ${formatLocationId(
            targetLocationId
          )} - only ${occupied}/3 supporting seats are full`,
        };
      }
    }

    return { isAllowed: true, reason: "All supporting seats are full" };
  }
```

**Note:** use a proper ESM import instead of `require` — at the top of `movement.ts`, ensure `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` is imported:

```ts
import { ROSTRUM_ADJACENCY_BY_PLAYER_COUNT } from "../config/rules";
```

Then replace the `require(...)` call with `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[pc]`. Final adjacent-check loop:

```ts
if (sourceIsRostrum && currentLocationId) {
  for (const pc of [3, 4, 5]) {
    const adjs = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[pc];
    if (!adjs) continue;
    if (
      adjs.some(
        (a) =>
          (a.rostrum1 === currentLocationId && a.rostrum2 === targetLocationId) ||
          (a.rostrum2 === currentLocationId && a.rostrum1 === targetLocationId)
      )
    ) {
      adjacent = true;
      break;
    }
  }
}
```

- [ ] **Step 4.3: Add cascade acceptance to `validatePieceMovement`**

In the same function, the existing flow reaches `// All other moves are valid` at the bottom with `return { isAllowed: true, reason: "Move is valid" };`. We need to **tighten** that for rostrum → seat: only accept when the destination seat is a supporting seat of an adjacent rostrum AND that rostrum's section is fully empty.

Just **before** the final `return { isAllowed: true, reason: "Move is valid" };`, add:

```ts
  // Rule 1 cascade: rostrum → adjacent supporting seat when section empty.
  if (
    currentLocationId &&
    currentLocationId.includes("rostrum") &&
    targetLocationId.includes("seat")
  ) {
    // Find which adjacent rostrum (if any) has this seat as a supporting seat.
    for (const pc of [3, 4, 5]) {
      const adjs = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[pc];
      if (!adjs) continue;
      const adj = adjs.find(
        (a) => a.rostrum1 === currentLocationId || a.rostrum2 === currentLocationId
      );
      if (!adj) continue;
      const adjRostrum = adj.rostrum1 === currentLocationId ? adj.rostrum2 : adj.rostrum1;
      const supportRule = getRostrumSupportRule(adjRostrum);
      if (!supportRule) continue;
      if (!supportRule.supportingSeats.includes(targetLocationId)) continue;
      const anyFilled = supportRule.supportingSeats.some((s) =>
        pieces.some((p) => p.locationId === s)
      );
      if (anyFilled) {
        return {
          isAllowed: false,
          reason: `Cascade to supporting seat only allowed when section is fully empty`,
        };
      }
      const seatOccupied = pieces.some((p) => p.locationId === targetLocationId);
      if (seatOccupied) {
        return {
          isAllowed: false,
          reason: `Destination seat is occupied`,
        };
      }
      return { isAllowed: true, reason: "Rule 1 cascade to supporting seat" };
    }
    // If we reach here, source is a rostrum but target is not a supporting seat of its adjacent rostrum.
    return {
      isAllowed: false,
      reason: `Rostrum piece may only move to an adjacent rostrum or a supporting seat of that rostrum`,
    };
  }
```

- [ ] **Step 4.4: Update `validateMoveType` to classify cascade**

Still in `movement.ts`, locate `validateMoveType` (around line 252). Between Rule 8 (Rostrum → Rostrum) and Rule 9 (Office → Rostrum), insert a new rule:

```ts
  // Rule 1 cascade: Rostrum → adjacent supporting seat (empty section) = ORGANIZE or INFLUENCE
  else if (isRostrum(fromLocationId) && isSeat(toLocationId)) {
    // Confirm destination seat is a supporting seat of an adjacent rostrum
    for (const pc of [3, 4, 5]) {
      const adjs = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[pc];
      if (!adjs) continue;
      const adj = adjs.find(
        (a) => a.rostrum1 === fromLocationId || a.rostrum2 === fromLocationId
      );
      if (!adj) continue;
      const adjRostrum = adj.rostrum1 === fromLocationId ? adj.rostrum2 : adj.rostrum1;
      const supportRule = getRostrumSupportRule(adjRostrum);
      if (!supportRule) continue;
      if (!supportRule.supportingSeats.includes(toLocationId)) continue;
      const anyFilled = supportRule.supportingSeats.some((s) =>
        allPieces.some((p) => p.locationId === s)
      );
      if (anyFilled) return "UNKNOWN";
      const fromPlayer = getPlayerFromLocation(fromLocationId);
      return fromPlayer === movingPlayerId ? "ORGANIZE" : "INFLUENCE";
    }
    return "UNKNOWN";
  }
```

Ensure `getRostrumSupportRule` is imported at the top of `movement.ts`:

```ts
import { getRostrumSupportRule } from "./rostrum";
```

(It may already be imported — verify.)

- [ ] **Step 4.5: Relax per-move validators for ORGANIZE and INFLUENCE (shared move-validation.ts)**

In `packages/shared/src/rules/move-validation.ts` (and `src/rules/move-validation.ts`):

Locate `validateOrganizeMove` (around line 374). Replace Case 2 (rostrum-to-rostrum) block with relaxed version, and add Case 3 (cascade):

```ts
  // Case 2: Rostrum to adjacent rostrum (Rule 1: no support check)
  if (
    fromLocationId?.includes("_rostrum") &&
    toLocationId?.includes("_rostrum")
  ) {
    if (!fromLocationId?.includes(`p${playerId}_rostrum`)) return false;
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    return adjacencies.some(
      (adj) =>
        (adj.rostrum1 === fromLocationId && adj.rostrum2 === toLocationId) ||
        (adj.rostrum2 === fromLocationId && adj.rostrum1 === toLocationId)
    );
  }

  // Case 3 (Rule 1): Rostrum → adjacent supporting seat when that section is empty
  if (
    fromLocationId?.includes("_rostrum") &&
    toLocationId?.includes("_seat")
  ) {
    if (!fromLocationId?.includes(`p${playerId}_rostrum`)) return false;
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    const adj = adjacencies.find(
      (a) => a.rostrum1 === fromLocationId || a.rostrum2 === fromLocationId
    );
    if (!adj) return false;
    const adjRostrum = adj.rostrum1 === fromLocationId ? adj.rostrum2 : adj.rostrum1;
    // Look up supporting seats via the per-player rules in config
    // Seats 1-3 support rostrum1; 4-6 support rostrum2
    const rostrumMatch = adjRostrum.match(/^(p\d+)_rostrum(\d)$/);
    if (!rostrumMatch) return false;
    const domain = rostrumMatch[1];
    const rostNum = parseInt(rostrumMatch[2]);
    const supportingSeats = rostNum === 1
      ? [`${domain}_seat1`, `${domain}_seat2`, `${domain}_seat3`]
      : [`${domain}_seat4`, `${domain}_seat5`, `${domain}_seat6`];
    if (!supportingSeats.includes(toLocationId)) return false;
    const anyFilled = supportingSeats.some((s) =>
      pieces.some((p) => p.locationId === s)
    );
    if (anyFilled) return false;
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;
    return true;
  }
```

Locate `validateInfluenceMove` (around line 259). Replace Case 2 (rostrum-to-rostrum) and add cascade case:

```ts
  // Case 2: Rostrum to adjacent rostrum (Rule 1: no support check)
  if (
    fromLocationId.includes("_rostrum") &&
    toLocationId.includes("_rostrum")
  ) {
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_rostrum/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false;
    const fromRostMatch = fromLocationId.match(/p\d+_rostrum(\d)/);
    const toRostMatch = toLocationId.match(/p\d+_rostrum(\d)/);
    if (!fromRostMatch || !toRostMatch) return false;
    // Accept adjacency via config (same as Organize)
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    return adjacencies.some(
      (adj) =>
        (adj.rostrum1 === fromLocationId && adj.rostrum2 === toLocationId) ||
        (adj.rostrum2 === fromLocationId && adj.rostrum1 === toLocationId)
    );
  }

  // Case 3 (Rule 1): Rostrum → adjacent supporting seat when that section is empty
  if (
    fromLocationId.includes("_rostrum") &&
    toLocationId.includes("_seat")
  ) {
    const fromPlayerMatch = fromLocationId.match(/p(\d+)_rostrum/);
    if (!fromPlayerMatch) return false;
    const fromPlayerId = parseInt(fromPlayerMatch[1]);
    if (fromPlayerId === playerId) return false;
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    const adj = adjacencies.find(
      (a) => a.rostrum1 === fromLocationId || a.rostrum2 === fromLocationId
    );
    if (!adj) return false;
    const adjRostrum = adj.rostrum1 === fromLocationId ? adj.rostrum2 : adj.rostrum1;
    const rostrumMatch = adjRostrum.match(/^(p\d+)_rostrum(\d)$/);
    if (!rostrumMatch) return false;
    const domain = rostrumMatch[1];
    const rostNum = parseInt(rostrumMatch[2]);
    const supportingSeats = rostNum === 1
      ? [`${domain}_seat1`, `${domain}_seat2`, `${domain}_seat3`]
      : [`${domain}_seat4`, `${domain}_seat5`, `${domain}_seat6`];
    if (!supportingSeats.includes(toLocationId)) return false;
    const anyFilled = supportingSeats.some((s) =>
      pieces.some((p) => p.locationId === s)
    );
    if (anyFilled) return false;
    const targetOccupied = pieces.some((p) => p.locationId === toLocationId);
    if (targetOccupied) return false;
    return true;
  }
```

Mirror both edits in `src/rules/move-validation.ts`.

- [ ] **Step 4.6: Add `isMoveTypePossible` export to shared move-validation.ts**

At the bottom of `packages/shared/src/rules/move-validation.ts` (and its `src/` mirror), add:

```ts
/**
 * Checks whether a given move type is currently possible for the acting player
 * given the board state. Used by Rule 2 to determine which required moves are
 * forgiven as impossible when evaluating tile honesty.
 *
 * Semantics per move type (all board-state predicates — no player-intent checks):
 * - REMOVE: exists ≥ 1 Mark in a seat owned by another player.
 * - ASSIST: community has ≥ 1 piece AND ≥ 1 opponent has a vacant seat.
 * - INFLUENCE: ≥ 1 non-own piece has a legal Influence destination (seat→adjacent seat,
 *   or rostrum→adjacent rostrum per Rule 1 — always geometrically possible if non-own
 *   piece exists at some rostrum).
 * - ADVANCE: ≥ 1 of {community→own vacant seat; own-seat→own supported rostrum;
 *   own-rostrum→own office} is possible.
 * - WITHDRAW: actingPlayer has ≥ 1 piece in their domain AND ≥ 1 legal destination.
 * - ORGANIZE: ≥ 1 own piece has a legal adjacent destination (seat→adjacent seat,
 *   or rostrum→adjacent rostrum — always geometrically possible if own piece at rostrum).
 */
export function isMoveTypePossible(
  moveType: DefinedMoveType,
  actingPlayerId: number,
  pieces: Piece[],
  playerCount: number
): boolean {
  switch (moveType) {
    case DefinedMoveType.REMOVE:
      return pieces.some((p) => {
        if (!p.locationId) return false;
        if (!p.locationId.includes("_seat")) return false;
        if (p.name.toLowerCase() !== "mark") return false;
        const m = p.locationId.match(/p(\d+)_seat/);
        if (!m) return false;
        const seatOwner = parseInt(m[1]);
        return seatOwner !== actingPlayerId && seatOwner >= 1 && seatOwner <= playerCount;
      });

    case DefinedMoveType.ASSIST: {
      const communityPiece = pieces.some((p) => p.locationId && p.locationId.includes("community") && p.name.toLowerCase() !== "pawn");
      if (!communityPiece) return false;
      for (let p = 1; p <= playerCount; p++) {
        if (p === actingPlayerId) continue;
        for (let s = 1; s <= 6; s++) {
          const seat = `p${p}_seat${s}`;
          if (!pieces.some((pc) => pc.locationId === seat)) return true;
        }
      }
      return false;
    }

    case DefinedMoveType.INFLUENCE: {
      // Any non-own piece in a seat with an adjacent vacant seat, OR in a rostrum (always possible under Rule 1)
      for (const p of pieces) {
        if (!p.locationId) continue;
        const ownerMatch = p.locationId.match(/p(\d+)_/);
        if (!ownerMatch) continue;
        const owner = parseInt(ownerMatch[1]);
        if (owner === actingPlayerId) continue;
        if (p.locationId.includes("_rostrum")) {
          if (p.name.toLowerCase() === "pawn") continue;
          return true;
        }
      }
      // Fallback: seat-to-seat legal destinations
      // (Kept simple — if no rostrum candidate, check via existing validateInfluenceMove by iterating adjacent seats)
      for (const p of pieces) {
        if (!p.locationId || !p.locationId.includes("_seat")) continue;
        if (p.name.toLowerCase() === "pawn") continue;
        const ownerMatch = p.locationId.match(/p(\d+)_seat/);
        if (!ownerMatch) continue;
        const owner = parseInt(ownerMatch[1]);
        if (owner === actingPlayerId) continue;
        // If any adjacent seat is vacant, it's possible.
        const adjs = getAdjacentSeats(p.locationId, playerCount);
        if (adjs.some((adjSeat) => !pieces.some((q) => q.locationId === adjSeat))) return true;
      }
      return false;
    }

    case DefinedMoveType.ADVANCE: {
      // Community → own vacant seat
      const commPiece = pieces.find((p) => p.locationId && p.locationId.includes("community") && p.name.toLowerCase() !== "pawn");
      if (commPiece) {
        for (let s = 1; s <= 6; s++) {
          const seat = `p${actingPlayerId}_seat${s}`;
          if (!pieces.some((p) => p.locationId === seat)) return true;
        }
      }
      // Seat → own supported rostrum (requires full 3 seats)
      for (const rostNum of [1, 2]) {
        const seats = rostNum === 1
          ? [`p${actingPlayerId}_seat1`, `p${actingPlayerId}_seat2`, `p${actingPlayerId}_seat3`]
          : [`p${actingPlayerId}_seat4`, `p${actingPlayerId}_seat5`, `p${actingPlayerId}_seat6`];
        const allFilled = seats.every((s) => pieces.some((p) => p.locationId === s));
        const rost = `p${actingPlayerId}_rostrum${rostNum}`;
        const rostVacant = !pieces.some((p) => p.locationId === rost);
        if (allFilled && rostVacant) return true;
      }
      // Rostrum → own office (both rostrums filled, office vacant)
      const r1Filled = pieces.some((p) => p.locationId === `p${actingPlayerId}_rostrum1`);
      const r2Filled = pieces.some((p) => p.locationId === `p${actingPlayerId}_rostrum2`);
      const officeVacant = !pieces.some((p) => p.locationId === `p${actingPlayerId}_office`);
      if (r1Filled && r2Filled && officeVacant) return true;
      return false;
    }

    case DefinedMoveType.WITHDRAW: {
      // Any own piece in domain has a legal withdraw destination
      // Seat → community is always possible if piece exists in seat
      for (let s = 1; s <= 6; s++) {
        if (pieces.some((p) => p.locationId === `p${actingPlayerId}_seat${s}`)) return true;
      }
      // Rostrum → own vacant supporting seat
      for (const rostNum of [1, 2]) {
        const rost = `p${actingPlayerId}_rostrum${rostNum}`;
        if (!pieces.some((p) => p.locationId === rost)) continue;
        const seats = rostNum === 1
          ? [`p${actingPlayerId}_seat1`, `p${actingPlayerId}_seat2`, `p${actingPlayerId}_seat3`]
          : [`p${actingPlayerId}_seat4`, `p${actingPlayerId}_seat5`, `p${actingPlayerId}_seat6`];
        if (seats.some((s) => !pieces.some((p) => p.locationId === s))) return true;
      }
      // Office → vacant rostrum
      if (pieces.some((p) => p.locationId === `p${actingPlayerId}_office`)) {
        if (!pieces.some((p) => p.locationId === `p${actingPlayerId}_rostrum1`)) return true;
        if (!pieces.some((p) => p.locationId === `p${actingPlayerId}_rostrum2`)) return true;
      }
      return false;
    }

    case DefinedMoveType.ORGANIZE: {
      // Any own rostrum piece → geometric move always legal under Rule 1
      for (const rostNum of [1, 2]) {
        if (pieces.some((p) => p.locationId === `p${actingPlayerId}_rostrum${rostNum}`)) return true;
      }
      // Own seat piece → adjacent vacant seat
      for (let s = 1; s <= 6; s++) {
        const seat = `p${actingPlayerId}_seat${s}`;
        if (!pieces.some((p) => p.locationId === seat)) continue;
        const adjs = getAdjacentSeats(seat, playerCount);
        if (adjs.some((adjSeat) => !pieces.some((q) => q.locationId === adjSeat))) return true;
      }
      return false;
    }

    default:
      return false;
  }
}
```

Add imports at the top of the file:

```ts
import { getAdjacentSeats } from "./adjacency";
import { DefinedMoveType } from "../types/move";
```

(Check if already imported — `DefinedMoveType` likely is via the existing validators; `getAdjacentSeats` is.)

Mirror in `src/rules/move-validation.ts`.

- [ ] **Step 4.7: Add `isMoveTypePossible` tests**

In a new file `src/__tests__/rules/move-validation-isPossible.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isMoveTypePossible } from "../../rules/move-validation";
import { DefinedMoveType } from "../../types/move";
import type { Piece } from "../../types";

const makePiece = (id: string, name: string, locationId: string, playerId: number): Piece =>
  ({ id, name, locationId, playerId } as unknown as Piece);

describe("isMoveTypePossible", () => {
  describe("REMOVE", () => {
    it("possible when opponent has Mark in seat", () => {
      const pieces = [makePiece("m", "Mark", "p2_seat1", 2)];
      expect(isMoveTypePossible(DefinedMoveType.REMOVE, 1, pieces, 3)).toBe(true);
    });
    it("impossible when no opponent Marks in seats", () => {
      const pieces = [makePiece("m", "Mark", "community", 0)];
      expect(isMoveTypePossible(DefinedMoveType.REMOVE, 1, pieces, 3)).toBe(false);
    });
  });

  describe("ORGANIZE (Rule 1)", () => {
    it.each([3, 4, 5])("possible when own rostrum has piece even if destination section empty (playerCount=%i)", (pc) => {
      const pieces = [makePiece("own", "Mark", "p1_rostrum2", 1)];
      expect(isMoveTypePossible(DefinedMoveType.ORGANIZE, 1, pieces, pc)).toBe(true);
    });
  });

  describe("INFLUENCE (Rule 1)", () => {
    it.each([3, 4, 5])("possible when opponent has rostrum piece (playerCount=%i)", (pc) => {
      const pieces = [makePiece("opp", "Mark", "p2_rostrum1", 2)];
      expect(isMoveTypePossible(DefinedMoveType.INFLUENCE, 1, pieces, pc)).toBe(true);
    });
  });

  describe("ASSIST", () => {
    it("possible when community piece + opponent has vacant seat", () => {
      const pieces = [makePiece("c", "Mark", "community", 0)];
      expect(isMoveTypePossible(DefinedMoveType.ASSIST, 1, pieces, 3)).toBe(true);
    });
    it("impossible when community is empty", () => {
      expect(isMoveTypePossible(DefinedMoveType.ASSIST, 1, [], 3)).toBe(false);
    });
  });

  describe("ADVANCE", () => {
    it("possible when community has piece + own seat vacant", () => {
      const pieces = [makePiece("c", "Mark", "community", 0)];
      expect(isMoveTypePossible(DefinedMoveType.ADVANCE, 1, pieces, 3)).toBe(true);
    });
    it("impossible when community empty and own domain empty", () => {
      expect(isMoveTypePossible(DefinedMoveType.ADVANCE, 1, [], 3)).toBe(false);
    });
  });

  describe("WITHDRAW", () => {
    it("possible when own seat has piece", () => {
      const pieces = [makePiece("own", "Mark", "p1_seat1", 1)];
      expect(isMoveTypePossible(DefinedMoveType.WITHDRAW, 1, pieces, 3)).toBe(true);
    });
    it("impossible when own domain is empty", () => {
      expect(isMoveTypePossible(DefinedMoveType.WITHDRAW, 1, [], 3)).toBe(false);
    });
  });
});
```

- [ ] **Step 4.8: Run the rules tests**

Run: `npm test -- --run src/__tests__/rules/`
Expected: All new tests pass. Regression tests still pass.

- [ ] **Step 4.9: Run full test suite**

Run: `npm test -- --run`
Expected: All tests pass.

- [ ] **Step 4.10: Commit**

```bash
git add \
  packages/shared/src/rules/rostrum.ts packages/shared/src/rules/movement.ts packages/shared/src/rules/move-validation.ts \
  src/rules/rostrum.ts src/rules/movement.ts src/rules/move-validation.ts \
  src/__tests__/rules/rostrum.test.ts src/__tests__/rules/movement.test.ts \
  src/__tests__/rules/move-validation-isPossible.test.ts
git commit -m "$(cat <<'EOF'
feat(rule1): shared rules allow rostrum->adj-rostrum regardless of support; cascade to seat when empty

Relaxes validateAdjacentRostrumMovement, validatePieceMovement,
validateOrganizeMove, validateInfluenceMove. validateMoveType classifies
the rostrum->adjacent-supporting-seat cascade as ORGANIZE/INFLUENCE.
Adds isMoveTypePossible helper for Rule 2 possibility checks.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4.11: Push**

Run: `git push origin supabase-multiplayer`

---

## Task 5: Rule 2 — Update `canTileBeRejected` signature and tests

**Files:**
- Modify: `packages/shared/src/game/tile-validation.ts`
- Modify: `src/game/tile-validation.ts`
- Modify: `src/__tests__/game/tile-validation.test.ts`

- [ ] **Step 5.1: Update the test file with new signature and partial-impossibility cases**

Open `src/__tests__/game/tile-validation.test.ts`, find the `describe("canTileBeRejected", () => { ... })` block (around line 241), and **replace the entire describe block** with:

```ts
  describe("canTileBeRejected", () => {
    // New signature: canTileBeRejected(tileId, executedMoves, possibleRequiredMoves)

    it("returns false when all requirements are met", () => {
      expect(
        canTileBeRejected(
          "01",
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE]
        )
      ).toBe(false);
    });

    it("returns false when all requirements were impossible", () => {
      expect(canTileBeRejected("01", [], [])).toBe(false);
    });

    it("returns true when a possible required move was skipped", () => {
      expect(
        canTileBeRejected(
          "01",
          [DefinedMoveType.REMOVE],
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE]
        )
      ).toBe(true);
    });

    // Rule 2 partial-impossibility cases
    it("returns false when one required move is impossible and the possible one was executed", () => {
      // Tile 01 (REMOVE + ADVANCE): REMOVE impossible, ADVANCE possible and executed.
      expect(
        canTileBeRejected(
          "01",
          [DefinedMoveType.ADVANCE],
          [DefinedMoveType.ADVANCE]
        )
      ).toBe(false);
    });

    it("returns true when one required move is impossible but the possible one was also skipped", () => {
      // REMOVE impossible, ADVANCE possible, nothing executed.
      expect(
        canTileBeRejected("01", [], [DefinedMoveType.ADVANCE])
      ).toBe(true);
    });

    it("returns false for Tile 13 partial impossibility (Organize impossible, Assist possible and executed)", () => {
      expect(
        canTileBeRejected(
          "13",
          [DefinedMoveType.ASSIST],
          [DefinedMoveType.ASSIST]
        )
      ).toBe(false);
    });

    it("returns true for Tile 13 when possible Assist was skipped", () => {
      expect(
        canTileBeRejected(
          "13",
          [DefinedMoveType.ORGANIZE],
          [DefinedMoveType.ASSIST]
        )
      ).toBe(true);
    });

    it("returns false for BLANK tile when no moves made", () => {
      expect(canTileBeRejected("BLANK", [], [])).toBe(false);
    });

    it("returns true for BLANK tile when moves were made", () => {
      expect(
        canTileBeRejected("BLANK", [DefinedMoveType.ADVANCE], [])
      ).toBe(true);
    });

    it("returns true for unknown tile", () => {
      expect(
        canTileBeRejected("99", [DefinedMoveType.ADVANCE], [])
      ).toBe(true);
    });

    it("returns false when requirements met even with extra moves (extra-move policy lives elsewhere)", () => {
      // Rule 2 contract: tile is honest iff every possible required move executed.
      // Extra moves are a separate concern (handled by determineHonesty in engine).
      expect(
        canTileBeRejected(
          "01",
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE, DefinedMoveType.ORGANIZE],
          [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE]
        )
      ).toBe(false);
    });
  });
```

- [ ] **Step 5.2: Run the test file, confirm failures**

Run: `npm test -- --run src/__tests__/game/tile-validation.test.ts`
Expected: Tests fail (signature mismatch — TypeScript error or runtime mismatch).

- [ ] **Step 5.3: Update `canTileBeRejected` implementation (shared package)**

In `packages/shared/src/game/tile-validation.ts`, replace the entire `canTileBeRejected` function (around lines 155–207) with:

```ts
/**
 * Determines if a tile play can be rejected based on execution and board state.
 *
 * Called when a tile is revealed (by receiver or challenger) to determine if the
 * receiver had grounds to reject the tile. This affects credibility outcomes.
 *
 * REJECTION RULES (revised 2026-04-18, Rule 2):
 * - Let R be the tile's required move set.
 * - Let P ⊆ R be the subset of R that was possible given the board state.
 * - Let E be the moves actually executed.
 * - Tile is NOT rejectable iff every move in P appears in E.
 * - Required moves outside P (impossible on this board) are forgiven.
 * - BLANK tile: rejectable iff E is non-empty.
 *
 * @param tileId - The tile ID being played
 * @param executedMoves - The moves that were executed
 * @param possibleRequiredMoves - The subset of tile's required moves that were possible
 *   given the board state. Compute using isMoveTypePossible against piecesBeforeMove.
 * @returns True if the tile can be rejected
 *
 * @example
 * // Fully honest
 * canTileBeRejected('01', [REMOVE, ADVANCE], [REMOVE, ADVANCE]) // false
 *
 * // Partial impossibility forgiven
 * canTileBeRejected('01', [ADVANCE], [ADVANCE]) // false  (REMOVE was impossible)
 *
 * // Possible move skipped
 * canTileBeRejected('01', [REMOVE], [REMOVE, ADVANCE]) // true
 */
export function canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  possibleRequiredMoves: DefinedMoveType[]
): boolean {
  // BLANK tile: rejectable iff any moves were made.
  if (tileId === "BLANK") {
    return executedMoves.length > 0;
  }

  const requirements = getTileRequirements(tileId);
  if (!requirements) return true; // Unknown tile, default to rejectable

  // Every possible required move must appear in executedMoves for the tile to be honest.
  for (const required of possibleRequiredMoves) {
    if (!executedMoves.includes(required)) {
      return true; // Rejectable: a possible required move was skipped
  }
  }

  return false; // Not rejectable: honest in whole
}
```

Note: the closing `}` pairing above is a formatting quirk in this markdown; when you write it, make sure the `for` loop's `}` precedes the function's `}`. Double-check indentation after pasting.

Mirror the exact same change in `src/game/tile-validation.ts`.

- [ ] **Step 5.4: Run tile-validation tests**

Run: `npm test -- --run src/__tests__/game/tile-validation.test.ts`
Expected: All tests pass.

- [ ] **Step 5.5: Run full suite, check for signature-change breakage**

Run: `npm test -- --run`
Expected: All tests pass. If any caller of `canTileBeRejected` other than tests exists, it will surface here — update accordingly. Per current grep results, only test files call it directly; the engine's honesty path (`determineHonesty` in `outcomeResolution.ts`) already uses `findLegalMoves` for per-move possibility and needs no signature update.

- [ ] **Step 5.6: Add one integration test for the engine honesty path under Rule 2**

In `src/__tests__/engine/outcomeResolution.test.ts`, add a new test:

```ts
describe('Rule 2: partial impossibility (integration)', () => {
  it.each([3, 4, 5])('tile 01 with REMOVE impossible is honest when ADVANCE was executed (playerCount=%i)', (playerCount) => {
    // Board: no opponent Marks anywhere (so REMOVE is impossible); community has a Mark.
    // Mover plays tile 01, executes only ADVANCE (community → own seat).
    const state = makeTestState({
      playerCount,
      moverId: 1,
      tilePlayedId: '01',
      // Place a piece in community and leave all opponent seats empty of Marks
      pieces: [
        { id: 'c1', type: 'MARK', ownerId: 0, locationId: 'community' },
      ],
      movesExecuted: [{ moveType: DefinedMoveType.ADVANCE, /* ... */ }],
    });
    expect(determineHonesty(state)).toBe(true);
  });
});
```

(Adapt `makeTestState` and piece-payload shapes to whatever helper/factory the existing tests in that file use — search the file for an existing `makeTestState` or similar fixture before writing. If no helper exists, follow the same manual-construction pattern the other tests in this file use.)

Run: `npm test -- --run src/__tests__/engine/outcomeResolution.test.ts`
Expected: New test passes.

- [ ] **Step 5.7: Commit**

```bash
git add \
  packages/shared/src/game/tile-validation.ts \
  src/game/tile-validation.ts \
  src/__tests__/game/tile-validation.test.ts \
  src/__tests__/engine/outcomeResolution.test.ts
git commit -m "$(cat <<'EOF'
feat(rule2): tile honest-in-whole when every possible required move executed

canTileBeRejected now takes possibleRequiredMoves (subset of tile requirements
the board could satisfy) instead of a single wasExecutionPossible flag.
Partial impossibility is forgiven as long as every possible required move was
executed. Integration test covers the engine determineHonesty path.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5.8: Push**

Run: `git push origin supabase-multiplayer`

---

## Task 6: Documentation

**Files:**
- Modify: `MANUAL.md`
- Modify: `.claude/GAME_RULES.md`
- Modify: `TILE_MOVES_REFERENCE.md`

- [ ] **Step 6.1: Update `MANUAL.md`**

Find the section describing rostrum movement / rostrum support. Replace the rule text that says supporting seats must be filled before moving to an adjacent rostrum with:

```markdown
**Moving between adjacent rostrums** *(revised 2026-04-18)*

A piece may move from its rostrum to an adjacent rostrum regardless of how many
of the destination rostrum's supporting seats are filled.

- If any supporting seat in the destination section is filled, the piece lands
  in the rostrum as normal.
- If all three supporting seats in the destination section are empty, the
  moving player must instead place the piece in one of the three supporting
  seats. The move still counts as a single Organize (or Influence) action.

Advance moves (seat → own rostrum) still require all three supporting seats to
be filled.
```

Find the section on tile honesty / exposure, and add:

```markdown
**Partial impossibility and honesty** *(revised 2026-04-18)*

If a tile requires multiple moves and the current board state makes one of them
impossible to execute, executing every remaining possible required move counts
as honest in whole. The receiver cannot expose the tile, and any bystander
challenge fails. A player still must execute every required move the board does
allow — skipping a possible required move remains dishonest.
```

- [ ] **Step 6.2: Update `.claude/GAME_RULES.md`**

Same edits as in `MANUAL.md`, keeping the existing tone and markdown structure of that file.

- [ ] **Step 6.3: Update `TILE_MOVES_REFERENCE.md`**

Under the `## Evaluation Rules` section, append a new point:

```markdown
4. **Partial impossibility (revised 2026-04-18):** If a tile requires multiple moves
   and the board state makes one required move impossible, executing every remaining
   possible required move is sufficient for the tile to be considered honest. The
   receiver cannot expose it; bystander challenges fail. Skipping a possible required
   move remains dishonest.
```

- [ ] **Step 6.4: Commit docs**

```bash
git add MANUAL.md .claude/GAME_RULES.md TILE_MOVES_REFERENCE.md
git commit -m "$(cat <<'EOF'
docs: describe rule 1 (adjacent rostrum relaxation) and rule 2 (partial impossibility honest)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6.5: Push**

Run: `git push origin supabase-multiplayer`

---

## Task 7: Deploy verification

- [ ] **Step 7.1: Wait for Netlify deploy, then open the deployed URL**

Visit the deployed build (Netlify deploys on push to `supabase-multiplayer`). Start three games — one in each of 3/4/5-player mode.

- [ ] **Step 7.2: Manual checks per player-mode game**

For each mode, verify:

1. Drag a rostrum piece toward an adjacent rostrum whose supporting section is fully empty. The UI should highlight the three supporting seats as valid drop targets. Drop on one of them and confirm the piece lands in the seat and the move is recorded as Organize (or Influence, if done by a non-owner).
2. Drag a rostrum piece to an adjacent rostrum whose supporting section has 1 or 2 seats filled. The UI should let you drop on the rostrum itself; piece lands in the rostrum.
3. Play a tile 13 (Assist + Organize) against a receiver whose board can Assist but cannot Organize. After the receiver executes only the Assist, the tile should resolve without an expose prompt. If another player challenges, the challenge should fail.

- [ ] **Step 7.3: Run AI playtest regression**

Run locally: `npm run playtest -- --modes 3,4,5 --games 20`
Expected: No crashes, no invariant violations. Expose rates may shift slightly compared to pre-change baseline — that is expected.

If the `playtest` command doesn't accept those flags (check `src/scripts/playtest.ts`), run it with whatever flags the script defines and note the legal-move counts in the output; they should be strictly ≥ the pre-change counts.

---

## Plan self-review checklist (run before handing off)

- **Spec coverage:** Every spec section — Rule 1 mechanics, Rule 2 mechanics, testing strategy, rollout — maps to at least one task in this plan. ✓
- **Placeholder scan:** No "TBD"/"TODO"/"similar to" phrases. Every code block contains real code.
- **Type consistency:** `isMoveTypePossible` signature identical in both the new shared helper and the engine's existing function (both: `(moveType, playerId, pieces, playerCount) → boolean`). `canTileBeRejected`'s new third parameter is `possibleRequiredMoves: DefinedMoveType[]` everywhere it appears.
- **Player modes:** Every new test uses `it.each([3, 4, 5])` or at minimum asserts the invariant-relevant pieces of each mode.
- **Dual-tree discipline:** Every `src/rules/*` change has a mirror step in `packages/shared/src/rules/*`.

---

## Open follow-ups (out of scope for this plan)

- Consolidating `src/rules/*` and `packages/shared/src/rules/*` into a single source of truth. (Tracked implicitly; not part of this rule change.)
- Extracting `isMoveTypePossible` into a single cross-tree implementation used by both engine and UI. (Currently duplicated because of type differences between `Piece` and `KredPiece`.)
