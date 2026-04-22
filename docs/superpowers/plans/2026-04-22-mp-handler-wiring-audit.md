# Multiplayer Handler Wiring Audit & Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate latent "missing wiring" regressions introduced by the Step 7 Phase 3 rewrite of `App.tsx`, restoring per-viewer multiplayer behavior across every handler factory and screen-level derivation.

**Architecture:** All eight wiring surfaces in current `App.tsx` are diffed against `git show a350780:src/App.tsx` (last known-good pre-rewrite snapshot). Where dependencies were dropped behind `as any` casts, restore them. Where per-viewer state (especially `campaignRole`) was collapsed into single host-side state, restore the per-viewer derivation.

**Tech Stack:** React + TypeScript + Vite + Supabase. Manual smoke-test verification on Netlify (test suite has 580 failures pre-baseline; not used for this work).

**Spec:** `docs/superpowers/specs/2026-04-22-mp-handler-wiring-audit-design.md`

**Branch:** `supabase-multiplayer` — single commit at the very end (per user direction). Do **not** commit between tasks.

---

## File Structure

| File | Responsibility | Change |
|------|---------------|--------|
| `src/App.tsx` | Wires hooks → handlers → context | Modify: restore deps on `create*Handlers` calls; add per-viewer `campaignRole` derivation; pipe through `campaignValue` |
| `src/components/screens/CampaignScreen.tsx` | Renders campaign-phase UI | Modify: read `campaignRole` from handlers context (overrides `usePhase()` value) |
| `src/hooks/useMultiplayerHost.ts` | Host action dispatcher | Modify (only if Task 8 audit finds gaps) |
| `src/components/screens/BureaucracyScreen.tsx` | Renders bureaucracy-phase UI | Modify (only if Task 7 audit finds gaps) |
| `src/components/screens/DraftingScreen.tsx` | Renders draft UI | Modify (only if Task 7 audit finds gaps) |

No new files. No file splits. No test files (test suite is broken baseline; verification is manual smoke test).

---

## Task 1: Restore per-viewer `campaignRole` (Bug A)

**Files:**
- Modify: `src/App.tsx` — add derivation, add to `campaignValue`
- Modify: `src/components/screens/CampaignScreen.tsx:200-261, 265` — consume `campaignRole` from handlers context, drop it from `usePhase()` destructure

- [ ] **Step 1: Read pre-refactor derivation for reference**

Run: `git show a350780:src/App.tsx | sed -n '4243,4300p'`

Expected: ~55 lines starting `// Compute campaignRole dynamically for the viewing player` ending at the `<CampaignScreen ... campaignRole={computedCampaignRole}` prop. This is the exact logic to port.

- [ ] **Step 2: Verify all derivation inputs are in App.tsx scope**

Open `src/App.tsx` and confirm these are already destructured at the top of the component: `gameState`, `currentPlayerIndex`, `playerIndex` (from props), `playedTile`, `tileTransaction`, `challengeOrder`, `currentChallengerIndex`, `takeAdvantageChallengerId`, `bonusMovePlayerId`, `players`, `isMultiplayer`. All are present (see App.tsx:51, 54, 60, 61, 62).

- [ ] **Step 3: Add derivation in App.tsx**

Insert immediately after the `// ─── Derived values ───` comment (App.tsx:241), before `viewingPlayerId`:

```typescript
// ─── Per-viewer campaignRole (multiplayer) ──────────────────────────────────
// In single-player, fall back to the global PhaseProvider value (legacy behavior).
// In multiplayer, compute from the viewer's playerIndex so each client sees its
// own role (mover / receiver / challenger / waiting / bonusMover / etc.).
const viewerCampaignRole = React.useMemo<string | null>(() => {
  if (!isMultiplayer || playerIndex === undefined) return campaignRole;
  const myIdx = playerIndex;
  if (gameState === 'CAMPAIGN' || gameState === 'SELECTING_TILE' || gameState === 'TILE_PLAYED') {
    return myIdx === currentPlayerIndex ? 'mover' : 'waiting';
  }
  if (gameState === 'PENDING_ACCEPTANCE') {
    const receiverPlayerId = (tileTransaction as any)?.receiverId ?? (playedTile as any)?.receivingPlayerId ?? null;
    const receiverIdx = receiverPlayerId != null ? players.findIndex(p => p.id === receiverPlayerId) : -1;
    const moverPlayerId = (playedTile as any)?.playerId ?? (tileTransaction as any)?.placerId ?? null;
    const moverIdx = moverPlayerId != null ? players.findIndex(p => p.id === moverPlayerId) : currentPlayerIndex;
    if (myIdx === receiverIdx) return 'receiver';
    if (myIdx === moverIdx) return 'mover';
    return 'waiting';
  }
  if (gameState === 'PENDING_CHALLENGE') {
    const currentChallengerId = challengeOrder[currentChallengerIndex];
    const moverPlayerId = (playedTile as any)?.playerId ?? (tileTransaction as any)?.placerId ?? null;
    const moverIdx = moverPlayerId != null ? players.findIndex(p => p.id === moverPlayerId) : currentPlayerIndex;
    if (currentChallengerId !== undefined && myIdx + 1 === currentChallengerId) return 'challenger';
    if (myIdx === moverIdx) return 'mover';
    return 'waiting';
  }
  if (gameState === 'TAKE_ADVANTAGE') {
    return myIdx + 1 === takeAdvantageChallengerId ? 'takeAdvantageChallenger' : 'waiting';
  }
  if (gameState === 'BONUS_MOVE') {
    return myIdx + 1 === bonusMovePlayerId ? 'bonusMover' : 'waiting';
  }
  if (gameState === 'CORRECTION_REQUIRED') {
    return myIdx === currentPlayerIndex ? 'correcting' : 'waiting';
  }
  return campaignRole;
}, [isMultiplayer, playerIndex, gameState, currentPlayerIndex, tileTransaction, playedTile, players, challengeOrder, currentChallengerIndex, takeAdvantageChallengerId, bonusMovePlayerId, campaignRole]);
```

- [ ] **Step 4: Add `campaignRole: viewerCampaignRole` to `campaignValue`**

In the `const campaignValue = { ... }` block (App.tsx:265-354), add this line near the top of the object, right after `playerCount`:

```typescript
campaignRole: viewerCampaignRole,
```

- [ ] **Step 5: Update CampaignScreen to consume `campaignRole` from handlers context**

In `src/components/screens/CampaignScreen.tsx`:

a. Add `campaignRole?: string | null;` to the `CampaignScreenHandlers` interface (around line 198, after `onTakeAdvantagePiecePromote`).

b. Add `campaignRole: campaignRoleFromHandlers,` to the destructure of `useCampaignHandlers<CampaignScreenHandlers>()` (around line 261).

c. Change line 265 from:

```typescript
const { gameState, currentPlayerIndex, moverPlayerIndex, campaignRole } = usePhase();
```

to:

```typescript
const { gameState, currentPlayerIndex, moverPlayerIndex, campaignRole: phaseCampaignRole } = usePhase();
const campaignRole = campaignRoleFromHandlers ?? phaseCampaignRole;
```

This preserves single-player behavior (handlers context value is `null` → falls back to phase) while letting multiplayer override.

- [ ] **Step 6: Smoke check**

Mentally trace: in 3-player MP with Fidel (host, playerIndex=0) as currentPlayerIndex=0 in CAMPAIGN phase:
- Fidel's screen: `viewerCampaignRole = 'mover'` → `isMover = true` → title shows "Your Turn". ✓
- Player 2 (playerIndex=1) screen: `viewerCampaignRole = 'waiting'` → `isMover = false` → falls through to `${nameByIndex(currentPlayerIndex)}'s Turn` → "Fidel's Turn". ✓
- Player 3 (playerIndex=2) screen: same as Player 2 → "Fidel's Turn". ✓

If anything in the trace fails, debug before moving on.

---

## Task 2: Restore `createPieceMovementHandlers` deps (Bug B)

**Files:**
- Modify: `src/App.tsx:187` — restore 5 missing utility deps

- [ ] **Step 1: Read pre-refactor dep list**

Run: `git show a350780:src/App.tsx | sed -n '855,895p'`

Expected: confirms deps are `calculatePieceRotation`, `validatePieceMovement`, `validateMoveType`, `formatLocationId`, `ALERTS`.

- [ ] **Step 2: Find the imports in pre-refactor**

Run: `git show a350780:src/App.tsx | grep -nE "^import.*calculatePieceRotation|validatePieceMovement|validateMoveType|formatLocationId|ALERTS"`

Note the source modules.

- [ ] **Step 3: Add imports to current App.tsx**

In `src/App.tsx`, after the existing handler/util imports (around line 33), add the imports identified in Step 2. Likely paths (verify against Step 2 output):

```typescript
import { calculatePieceRotation, validatePieceMovement, validateMoveType } from "./game";
import { formatLocationId } from "./utils";
import { ALERTS } from "./config";
```

If any of these symbols don't exist at the indicated path, search with: `grep -rn "export.*calculatePieceRotation" src/` etc., and use the actual location.

- [ ] **Step 4: Pass deps into `createPieceMovementHandlers`**

In `src/App.tsx:187`, the call currently looks like:

```typescript
const pieceMovementHandlers = React.useMemo(() => createPieceMovementHandlers({ pieces, players, playerCount, currentPlayerIndex, movedPiecesThisTurn, pendingCommunityPieces, piecesAtTurnStart, piecesAtCorrectionStart, piecesBeforeBonusMove, playedTile: playedTile as any, setPieces, setPlayers, setBoardTiles, setGameState, setMovedPiecesThisTurn, setPendingCommunityPieces, setLastDroppedPosition, setLastDroppedPieceId, setPlayedTile, setHasPlayedTileThisTurn, showAlert } as any), [...]);
```

Add `calculatePieceRotation, validatePieceMovement, validateMoveType, formatLocationId, ALERTS` to the object body. Result:

```typescript
const pieceMovementHandlers = React.useMemo(() => createPieceMovementHandlers({ pieces, players, playerCount, currentPlayerIndex, movedPiecesThisTurn, pendingCommunityPieces, piecesAtTurnStart, piecesAtCorrectionStart, piecesBeforeBonusMove, playedTile: playedTile as any, setPieces, setPlayers, setBoardTiles, setGameState, setMovedPiecesThisTurn, setPendingCommunityPieces, setLastDroppedPosition, setLastDroppedPieceId, setPlayedTile, setHasPlayedTileThisTurn, showAlert, calculatePieceRotation, validatePieceMovement, validateMoveType, formatLocationId, ALERTS }), [pieces, players, playerCount, currentPlayerIndex, movedPiecesThisTurn, pendingCommunityPieces, piecesAtTurnStart, piecesAtCorrectionStart, piecesBeforeBonusMove, playedTile, setPieces, setPlayers, setBoardTiles, setGameState, setMovedPiecesThisTurn, setPendingCommunityPieces, setLastDroppedPosition, setLastDroppedPieceId, setPlayedTile, setHasPlayedTileThisTurn, showAlert]);
```

Note: the dep array does **not** need the new utility imports because they're module-level constants (stable refs across renders). Drop the `as any` cast on the call object so future omissions surface as TS errors.

- [ ] **Step 5: TypeScript check**

Run: `npx tsc --noEmit src/App.tsx 2>&1 | grep -E "App\.tsx.*error" | head -20`

Expected: no errors mentioning the `createPieceMovementHandlers` call. If errors appear about other unrelated symbols (vitest, isolatedModules, etc.), ignore — those are pre-existing per spec.

If a TS error specifically about `createPieceMovementHandlers` appears, the dep set is still incomplete or signature-mismatched. Read `src/handlers/pieceMovementHandlers.ts:36-92` (the `PieceMovementDependencies` interface) and reconcile.

---

## Task 3: Restore `createTurnHandlers` deps

**Files:**
- Modify: `src/App.tsx:188` — restore 2 missing utility deps

- [ ] **Step 1: Confirm pre-refactor deps**

Run: `git show a350780:src/App.tsx | awk '/createTurnHandlers\(\{/,/\}\),/'`

Expected: confirms `getLocationIdFromPosition` and `formatLocationId` are present.

- [ ] **Step 2: Confirm current handler still requires them**

Run grep: `Grep` tool with pattern `deps\.(getLocationIdFromPosition|formatLocationId)` in `src/handlers/turnHandlers.ts`.

Expected: 4+ usages in `advanceTurnNormally`'s log-generation path (turnHandlers.ts:125-162).

- [ ] **Step 3: Add `getLocationIdFromPosition` import**

If not already imported by Task 2, add to `src/App.tsx` imports. Find its location with: `grep -rn "export.*getLocationIdFromPosition" src/`.

- [ ] **Step 4: Pass deps into `createTurnHandlers`**

At `src/App.tsx:188`, append `, getLocationIdFromPosition, formatLocationId` to the object body. Drop the `as any` cast. The dep array does not need updating (utilities are module-level).

- [ ] **Step 5: TypeScript check on the call**

Run: `npx tsc --noEmit 2>&1 | grep -A2 "createTurnHandlers"` and confirm no errors specific to this call.

---

## Task 4: Fix `createTilePlayHandlers` `calculateMoves` signature

**Files:**
- Modify: `src/App.tsx:189` — wrap `calculateMoves` to match pre-refactor signature

- [ ] **Step 1: Confirm pre-refactor wrapper**

Run: `git show a350780:src/App.tsx | awk '/createTilePlayHandlers\(\{/,/\}\),/' | grep -A2 calculateMoves`

Expected:

```
calculateMoves: (original: Piece[], current: Piece[], playerId: number) =>
  calculateMovesCore(original, current, playerId, playerCount, areSeatsAdjacent),
```

- [ ] **Step 2: Compare with current and confirm signature mismatch matters**

Read `src/handlers/tilePlayHandlers.ts` and grep for `calculateMoves(` to confirm it's invoked with the 3-arg signature `(orig, cur, pid)`. If the handler invokes with all 5 args, no fix is needed — close the task.

- [ ] **Step 3: Add the wrapper at the call site**

In `src/App.tsx:189`, change `calculateMoves: calculateMovesCore` to:

```typescript
calculateMoves: (original: any, current: any, playerId: number) =>
  calculateMovesCore(original, current, playerId, playerCount, areSeatsAdjacent),
```

(Use `Piece[]` typing if importing `Piece` is already in scope; `any` is acceptable to keep the change minimal and matches the surrounding handlers' relaxed typing.)

Add `playerCount` to the `useMemo` dependency array if not already present (it should be — verify).

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit 2>&1 | grep -A2 "createTilePlayHandlers"` and confirm no errors specific to this call.

---

## Task 5: Audit `useChallengeFlowHandlers` input contract

**Files:**
- Read-only audit; modify only if gaps found.

- [ ] **Step 1: Diff the pre-refactor dep set**

Run: `git show a350780:src/App.tsx | awk '/createChallengeFlowHandlers\(\{/,/\}\),/'`

This dumps the full pre-refactor dep set (~80+ fields). Save the output mentally or to scratch.

- [ ] **Step 2: Compare against current call**

Read `src/App.tsx:191` (the `useChallengeFlowHandlers({...})` call). List every field passed. Compare to Step 1.

- [ ] **Step 3: Compare against the hook's interface**

Open `src/hooks/useChallengeFlowHandlers.ts`. Read the props interface. List every required field.

- [ ] **Step 4: Decide**

- If the current call covers every required field of the hook's interface → audit passes, no fix needed. Move to Task 6.
- If a required field is missing → add it from in-scope state/setters. If the value isn't in scope, locate it (likely in an existing `use*` hook in `src/hooks/`) and destructure it.
- If an old pre-refactor field was dropped intentionally during refactor (the new hook doesn't use it) → no fix needed.

- [ ] **Step 5: Apply fix if needed**

Only modify `src/App.tsx:191` to add the missing field(s) into the call. Do not modify the hook itself.

---

## Task 6: Audit `useBureaucracyHandlers` input contract

**Files:**
- Read-only audit; modify only if gaps found.

- [ ] **Step 1: Find pre-refactor analog**

Run: `git show a350780:src/App.tsx | grep -n -A 50 "Bureaucracy"` and locate the bureaucracy handler creation block (may be inline-defined functions rather than a factory call).

- [ ] **Step 2: Read current hook interface**

Open `src/hooks/useBureaucracyHandlers.ts`. Read its props interface. List every required field.

- [ ] **Step 3: Compare against current call**

Read `src/App.tsx:192` (the `useBureaucracyHandlers({...})` call). Confirm every required hook field is supplied with a real value (not `() => {}` no-ops or empty arrays unless the hook genuinely accepts them).

- [ ] **Step 4: Apply fix if needed**

Only modify `src/App.tsx:192`. Specifically check for these suspicious patterns currently present:
- `bureaucracyMoves: []` → if the hook actually consumes bureaucracy moves, this empty array silently breaks logic. Locate the real source.
- `setBureaucracyMoves: () => {}` → no-op setter. If the hook calls it, real updates are dropped.
- `validateSingleMove: () => ({ isValid: true })` → always-valid stub. If the hook depends on real validation, this passes invalid moves.
- `calculatePieceRotation: () => 0` → always returns 0 rotation. If the hook positions pieces, they will be unrotated.

For each, decide: is the stub safe (the hook never actually uses it), or is it a silent bug to fix? When in doubt, grep the hook for usages of that field and read the call site.

---

## Task 7: Audit per-viewer derivations across screens

**Files:**
- Read-only audit; modify screens only where a real `playerIndex` vs `currentPlayerIndex` mismatch is found.

- [ ] **Step 1: Inventory comparisons in CampaignScreen**

Run Grep with pattern `currentPlayerIndex|playerIndex` in `src/components/screens/CampaignScreen.tsx`, output_mode=content with `-n`.

For each match, classify:
- ✅ Correctly uses `playerIndex` for "is this the viewing player?" checks.
- ✅ Correctly uses `currentPlayerIndex` for "whose turn is it?" or rendering the active player's name.
- ❌ Uses `currentPlayerIndex` where it should use `playerIndex` — these are the per-viewer leaks.

The known-good ones to validate against:
- Line 700: `const isMyTurn = playerIndex !== undefined && playerIndex === currentPlayerIndex;` ✅
- Line 1737: `(!isMultiplayer || bonusMovePlayerId === currentPlayerId)` — uses `currentPlayerId` which is `viewingPlayerId`, ok ✅
- Line 2215: `isDraggable = (!isMultiplayer || playerIndex === currentPlayerIndex);` ✅

- [ ] **Step 2: Repeat for BureaucracyScreen**

Same Grep on `src/components/screens/BureaucracyScreen.tsx`. The handoff explicitly flags `BureaucracyScreen.tsx:253` (`{currentPlayer?.name || \`Player ${currentPlayerId}\`}'s Turn`) — this displays the active player's name to all viewers. In MP, the viewing player should see "Your Turn" when it's their bureaucracy turn. Apply the same pattern as Bug A: derive an `isMyBureaucracyTurn` flag from `playerIndex === bureaucracyTurnOrder[currentBureaucracyPlayerIndex]` (or equivalent — verify against bureaucracy data shape) and conditionally render "Your Turn" vs the player name.

- [ ] **Step 3: Repeat for DraftingScreen**

Same Grep on `src/components/screens/DraftingScreen.tsx`. Verify draft pick gating uses the viewing player's index. Already partially fixed in commit `de20db1` — re-verify.

- [ ] **Step 4: Apply fixes**

For each ❌ found, fix by replacing `currentPlayerIndex` with `playerIndex` (or by adding an `isViewingPlayerActive` derivation and using it). Keep changes minimal — do **not** rename variables or restructure.

- [ ] **Step 5: Document findings**

Even if no fix is needed, write a one-line summary per screen at the bottom of this plan file (under a new `## Audit Findings` section) so the next agent has the audit trail.

---

## Task 8: Audit `useMultiplayerHost` dispatcher coverage

**Files:**
- Read-only audit; modify `src/hooks/useMultiplayerHost.ts` only if a `multiplayerActions` method has no matching dispatcher branch.

- [ ] **Step 1: Inventory all `multiplayerActions` methods**

Run Grep with pattern `multiplayerActions\.\w+` across `src/`, output_mode=content. Collect the unique method names invoked.

- [ ] **Step 2: Inventory all dispatcher branches**

Read `src/hooks/useMultiplayerHost.ts:64-192`. Collect all `case '...'` action types handled.

- [ ] **Step 3: Map methods → action types**

Find the bridge between `multiplayerActions.foo()` and the `'FOO'` action types. This is likely in the multiplayer client / `useSupabaseActions.ts` (file exists per `ls src/hooks/`). Read it and build the mapping.

- [ ] **Step 4: Check coverage**

For every `multiplayerActions` method invoked anywhere in the app, confirm there is a host dispatcher branch handling its emitted action type. Notable suspicious branches in current code:
- `case 'ADVANTAGE_PURCHASE'` is empty (`// Guest confirmed a take advantage purchase`) — if guests can purchase advantages, this is a silent no-op. Check `useChallengeFlowHandlers` for the corresponding handler and route to it.
- `case 'BUREAUCRACY_PURCHASE'` is empty similarly.
- `case 'RECEIVER_REWARD'` is empty (`// Process on host side directly`) — verify "directly" means another path actually handles it.
- `case 'VIEW_TILE_PRIVATE'` is intentionally empty (no-op for host) — leave alone.

- [ ] **Step 5: Wire missing handlers**

For each gap, add the missing handler call inside the `case` block. Add the handler to the hook's props interface and pass it from `src/App.tsx:239` (the `useMultiplayerHost({...})` call).

- [ ] **Step 6: Document findings**

Add a section to the `## Audit Findings` block from Task 7 listing what was wired, what was confirmed-empty-by-design, and what is still suspicious but out of scope.

---

## Task 9: Final typecheck, smoke-test prep, single commit

**Files:**
- All modified files from Tasks 1-8.

- [ ] **Step 1: Per-file typecheck on touched files**

Run: `npx tsc --noEmit 2>&1 | grep -E "(App\.tsx|CampaignScreen\.tsx|BureaucracyScreen\.tsx|DraftingScreen\.tsx|useMultiplayerHost\.ts).*error" | head -30`

Expected: zero errors. If errors appear, they are caused by this work (pre-existing errors are in *other* files per spec). Fix before commit.

- [ ] **Step 2: Run the test suite for regression check**

Run: `npx vitest run --reporter=basic 2>&1 | tail -20`

Expected: failed-files / failed-tests / passed counts at or better than the baseline `64 failed files / 580 failed tests / 2076 passed`. If passed count drops or failed count rises beyond the baseline, this work introduced regressions — investigate before commit.

- [ ] **Step 3: Smoke-test checklist for user**

Print this checklist for the user to run on the next Netlify deploy:

```
3-player game (Fidel + 2 guests):
  [ ] All 3 screens show the correct title: active player sees "Your Turn",
      others see "<active player>'s Turn".
  [ ] Active player can drag a piece on the board; piece moves visibly.
  [ ] Non-active players cannot drag pieces.
  [ ] End-turn button advances to next player.
  [ ] At least one tile play → receiver decision → challenge cycle completes
      without errors.
  [ ] Bureaucracy phase reachable; each player sees "Your Turn" on their turn.

4-player game: repeat above.
5-player game: repeat above.
```

- [ ] **Step 4: Stage all modified files**

Run:

```bash
git add src/App.tsx src/components/screens/CampaignScreen.tsx
```

Plus any other files touched in Tasks 6-8 (only the ones with actual changes).

- [ ] **Step 5: Single commit**

```bash
git commit -m "$(cat <<'EOF'
fix(multiplayer): restore handler wiring and per-viewer derivations

Step 7 Phase 3 rewrite of App.tsx cast every create*Handlers call as any,
which silently dropped utility-function dependencies that the handler
factories still call. Same pattern collapsed per-viewer campaignRole into
a single global value that was never set during gameplay.

Restored:
- Per-viewer campaignRole derivation (Bug A: turn indicator)
- 5 missing deps on createPieceMovementHandlers (Bug B: pieces unmovable)
- 2 missing deps on createTurnHandlers (end-turn log path)
- calculateMoves signature wrapper on createTilePlayHandlers
- [Task 5/6/7/8 fixes — list them]

Verified by manual smoke test of 3-, 4-, 5-player MP games on Netlify.
Test suite baseline (64 failed files / 580 failed tests / 2076 passed)
unchanged.

Spec: docs/superpowers/specs/2026-04-22-mp-handler-wiring-audit-design.md
Plan: docs/superpowers/plans/2026-04-22-mp-handler-wiring-audit.md

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Replace `[Task 5/6/7/8 fixes — list them]` with the actual fixes that were made (or "no further gaps found in surfaces 5-8" if the audits passed clean).

- [ ] **Step 6: Push (only if user asks)**

Per project workflow, do not push automatically. Wait for user direction. Netlify deploys from `supabase-multiplayer` once user pushes.

---

## Audit Findings

(Populated by Tasks 7 and 8.)

- **CampaignScreen per-viewer derivations**: TBD by Task 7
- **BureaucracyScreen per-viewer derivations**: TBD by Task 7
- **DraftingScreen per-viewer derivations**: TBD by Task 7
- **useMultiplayerHost dispatcher coverage**: TBD by Task 8
