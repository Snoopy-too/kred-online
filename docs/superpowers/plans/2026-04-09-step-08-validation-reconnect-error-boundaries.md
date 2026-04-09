# Step 8 — Validation, Reconnect, Error Boundaries (4c, 4d, 4g)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- **4c** — Two-layer action validation: every action type runs a receipt check on arrival and an execution check against *latest* state at process time. Failed validations log to PerfStore, never throw.
- **4d** — Harden reconnect/rejoin edge cases: host reconnect version resume, guest delta gap recovery, simultaneous rejoin races, DB persist retry with backoff.
- **4g** — Top-level and per-screen error boundaries. A single screen throw no longer drops the player from the lobby.

**Architecture:** Validation is an additive layer: a new `src/validation/` directory with one file per action-type group, each exporting a pure `validate<ActionType>(action, state)` function. Handlers in `src/handlers/` call validators at both points. Reconnect fixes live inside `GameStateSynchronizer` and the lobby bootstrap code. Error boundaries are two new components in `src/components/errors/`.

**Tech Stack:** React 19, TypeScript, Vitest.

---

## Context for fresh agent

**Read these first** (in this order, ~10 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Sections 4c, 4d, 4g**. Section 4c lists specific concerns per action type; Section 4d lists the five reconnect scenarios.
2. `docs/superpowers/plans/2026-04-09-step-07-provider-migrations-and-breakup.md` — "Handoff notes" at the bottom. Provider tree shape dictates where error boundaries go and how reconnect dispatches updates.
3. `src/handlers/*.ts` — the five handler files (gameFlowHandlers, pieceMovementHandlers, tilePlayHandlers, challengeFlowHandlers, turnHandlers). Each file's action switch is where validators get wired in.
4. `src/components/GameStateSynchronizer.tsx` — the rejoin hydrate path and the `schedulePersist` retry need hardening.
5. `src/KredApp.tsx` — where the top-level error boundary mounts.
6. `src/providers/GameStateAggregator.tsx` — the guest-side apply path where host reconnect version resume lives.
7. `src/perf/index.ts` — you'll add validation + persist-retry counters.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- Validators live in `src/validation/<actionGroup>.ts`, pure functions, no React imports.
- File-size budget: 500 lines per file.

**Critical constraints:**
- **Validation failures never throw, never toast.** They log to PerfStore and return a "rejected" result. The action just doesn't apply.
- **No action protocol changes.** Same action types, same payloads. Validators are a read-only check.
- **No schema changes.** All reconnect fixes work against the existing `kred_game_states` and `kred_game_actions` shapes.
- **Sync tests must stay green. Delta packets must stay healthy.**
- **3, 4, AND 5 player modes must all keep working.**

**What this step does NOT do:**
- ❌ Server-side validation (RLS only, per spec 4 out of scope).
- ❌ Action protocol redesign.
- ❌ UI double-submit guards — Step 9 (4e).
- ❌ New game features or logic changes.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/validation/types.ts` | Create: `ValidationResult` type. | ≤ 40 lines |
| `src/validation/pieceMovement.ts` | Create: `validateMovePiece`. | ≤ 180 lines |
| `src/validation/tilePlay.ts` | Create: `validatePlayTile`. | ≤ 180 lines |
| `src/validation/turnFlow.ts` | Create: `validateEndTurn`, `validateAdvancePhase`. | ≤ 140 lines |
| `src/validation/challengeFlow.ts` | Create: `validateTakeAdvantage`, `validateChallenge`, `validateBystanderResponse`. | ≤ 180 lines |
| `src/validation/bureaucracy.ts` | Create: `validateBureaucracyPurchase`. | ≤ 140 lines |
| `src/validation/index.ts` | Barrel re-export + `validateAction(action, state)` dispatcher. | ≤ 80 lines |
| `src/handlers/*.ts` | Modify: wire validators at receipt + execution. | +~20 lines each |
| `src/components/GameStateSynchronizer.tsx` | Modify: rejoin hydrate version resume, DB persist retry, simultaneous rejoin guard. | +60 lines |
| `src/components/errors/ErrorBoundary.tsx` | Create: generic reusable class component. | ≤ 120 lines |
| `src/components/errors/TopLevelErrorBoundary.tsx` | Create: mounts at `KredApp` root; auto-rejoin flow on catch. | ≤ 120 lines |
| `src/components/errors/ScreenErrorBoundary.tsx` | Create: per-screen wrapper with retry button. | ≤ 100 lines |
| `src/KredApp.tsx` | Modify: wrap tree in `TopLevelErrorBoundary`. | +10 lines |
| `src/components/ScreenRouter.tsx` | Modify: wrap each screen in `ScreenErrorBoundary`. | +20 lines |
| `src/__tests__/validation/*.test.ts` | Create: unit tests per validator file. | ≤ 250 lines each |
| `src/__tests__/sync/reconnect.test.ts` | Create: matrix items 7, 12, 13, 14, 15. | ≤ 400 lines |
| `src/__tests__/components/error-boundary.test.tsx` | Create: component tests for both boundaries. | ≤ 200 lines |
| `src/perf/index.ts` | Add validation + persist retry metrics. | +15 lines |

---

## Tasks

### Task 1: Define `ValidationResult` and the dispatcher shape

**Files:**
- Create: `src/validation/types.ts`
- Create: `src/validation/index.ts`

- [ ] **Step 1: Write `types.ts`**

```ts
// src/validation/types.ts
export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string; actionType: string };

export function ok(): ValidationResult { return { ok: true }; }

export function reject(actionType: string, reason: string): ValidationResult {
  return { ok: false, reason, actionType };
}
```

- [ ] **Step 2: Write `index.ts` with a dispatcher stub (empty cases for now)**

```ts
// src/validation/index.ts
import { ValidationResult, ok, reject } from "./types";
import { GameAction } from "../game/actions"; // or wherever the union lives
import { FullState } from "../sync/packet";

export * from "./types";

/**
 * Runs execution-time validation against the latest state.
 * Handlers MUST call this before mutating state.
 * Returns {ok:true} if the action is still valid, {ok:false, reason} otherwise.
 * Never throws.
 */
export function validateAction(
  action: GameAction,
  state: FullState,
): ValidationResult {
  try {
    switch (action.type) {
      // Cases added as each validator lands:
      // case "MOVE_PIECE": return validateMovePiece(action, state);
      // case "PLAY_TILE": return validatePlayTile(action, state);
      // case "END_TURN": return validateEndTurn(action, state);
      // ...etc
      default:
        return ok();
    }
  } catch (err) {
    return reject(action.type, `validator threw: ${(err as Error).message}`);
  }
}
```

- [ ] **Step 3: Add PerfStore counters**

In `src/perf/index.ts`:

```ts
"validation.accepted": { kind: "counter" },
"validation.rejected": { kind: "counter" },
"validation.rejected.reasons": { kind: "histogramString", cap: 64 },
```

`histogramString` is a small extension — if the existing PerfStore doesn't support string histograms, use a plain counter keyed per reason string (`validation.rejected.<reason>`) up to a cap of 32 unique reasons. Pick whichever is cheaper to implement — these are observability, not correctness.

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck
git add src/validation/types.ts src/validation/index.ts src/perf/index.ts
git commit -m "feat: validation infrastructure + PerfStore counters"
```

---

### Task 2: Write `validateMovePiece` + its test

**Files:**
- Create: `src/validation/pieceMovement.ts`
- Create: `src/__tests__/validation/pieceMovement.test.ts`

- [ ] **Step 1: Write the validator**

```ts
// src/validation/pieceMovement.ts
import { FullState } from "../sync/packet";
import { ValidationResult, ok, reject } from "./types";

interface MovePieceAction {
  type: "MOVE_PIECE";
  playerId: string;
  pieceId: string;
  fromTileId: string;
  toTileId: string;
}

export function validateMovePiece(
  action: MovePieceAction,
  state: FullState,
): ValidationResult {
  const players = state.players as any[] | undefined;
  const pieces = state.pieces as any[] | undefined;
  const boardTiles = state.boardTiles as any[] | undefined;

  if (!players || !pieces || !boardTiles) {
    return reject("MOVE_PIECE", "missing players/pieces/boardTiles in state");
  }

  const player = players.find((p) => p.id === action.playerId);
  if (!player) return reject("MOVE_PIECE", `unknown player ${action.playerId}`);

  const piece = pieces.find((p) => p.id === action.pieceId);
  if (!piece) return reject("MOVE_PIECE", `piece ${action.pieceId} does not exist`);

  if (piece.ownerId !== action.playerId) {
    return reject("MOVE_PIECE", `piece ${action.pieceId} is not owned by ${action.playerId}`);
  }
  if (piece.tileId !== action.fromTileId) {
    return reject("MOVE_PIECE", `piece ${action.pieceId} is not at ${action.fromTileId} (actually at ${piece.tileId})`);
  }

  const fromTile = boardTiles.find((t) => t.id === action.fromTileId);
  const toTile = boardTiles.find((t) => t.id === action.toTileId);
  if (!fromTile) return reject("MOVE_PIECE", `unknown source tile ${action.fromTileId}`);
  if (!toTile) return reject("MOVE_PIECE", `unknown destination tile ${action.toTileId}`);

  // Phase check: movement only legal in CAMPAIGN phase
  if (state.gameState !== /* GameState.CAMPAIGN */ 3) {
    return reject("MOVE_PIECE", `not in CAMPAIGN phase (currently ${state.gameState})`);
  }

  // Turn check: the current mover must match the acting player
  if (state.moverPlayerIndex !== players.findIndex((p) => p.id === action.playerId)) {
    return reject("MOVE_PIECE", `not ${action.playerId}'s turn`);
  }

  return ok();
}
```

**Important:** replace `/* GameState.CAMPAIGN */ 3` with the actual enum value after importing `GameState`. The example uses a placeholder only because the enum's numeric value is project-specific.

- [ ] **Step 2: Write the test**

```ts
// src/__tests__/validation/pieceMovement.test.ts
import { describe, expect, it } from "vitest";
import { validateMovePiece } from "../../validation/pieceMovement";
import { GameState } from "../../game/types";

const baseState = {
  gameState: GameState.CAMPAIGN,
  moverPlayerIndex: 0,
  players: [
    { id: "p1" },
    { id: "p2" },
  ],
  pieces: [
    { id: "piece-a", ownerId: "p1", tileId: "t1" },
  ],
  boardTiles: [
    { id: "t1" }, { id: "t2" },
  ],
};

const validAction = {
  type: "MOVE_PIECE" as const,
  playerId: "p1",
  pieceId: "piece-a",
  fromTileId: "t1",
  toTileId: "t2",
};

describe("validateMovePiece", () => {
  it("accepts a legal move", () => {
    expect(validateMovePiece(validAction, baseState).ok).toBe(true);
  });

  it("rejects if piece does not exist", () => {
    const r = validateMovePiece({ ...validAction, pieceId: "ghost" }, baseState);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/piece ghost does not exist/);
  });

  it("rejects if piece is not owned by the claimed player", () => {
    const state = { ...baseState, pieces: [{ id: "piece-a", ownerId: "p2", tileId: "t1" }] };
    const r = validateMovePiece(validAction, state);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not owned by p1/);
  });

  it("rejects if piece is not at the claimed source tile", () => {
    const state = { ...baseState, pieces: [{ id: "piece-a", ownerId: "p1", tileId: "t2" }] };
    const r = validateMovePiece(validAction, state);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not at t1/);
  });

  it("rejects if destination tile is unknown", () => {
    const r = validateMovePiece({ ...validAction, toTileId: "tX" }, baseState);
    expect(r.ok).toBe(false);
  });

  it("rejects when not in CAMPAIGN phase", () => {
    const state = { ...baseState, gameState: GameState.BUREAUCRACY };
    const r = validateMovePiece(validAction, state);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not in CAMPAIGN phase/);
  });

  it("rejects when it is not the player's turn", () => {
    const state = { ...baseState, moverPlayerIndex: 1 };
    const r = validateMovePiece(validAction, state);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/not p1's turn/);
  });
});
```

- [ ] **Step 3: Run**

```bash
npm test -- --run src/__tests__/validation/pieceMovement.test.ts
```

Expected: PASS.

- [ ] **Step 4: Wire into the dispatcher**

In `src/validation/index.ts`:

```ts
import { validateMovePiece } from "./pieceMovement";
// ...in the switch:
case "MOVE_PIECE": return validateMovePiece(action, state);
```

- [ ] **Step 5: Commit**

```bash
git add src/validation/pieceMovement.ts src/__tests__/validation/pieceMovement.test.ts src/validation/index.ts
git commit -m "feat: validateMovePiece + unit tests"
```

---

### Task 3: Write validators for the remaining action groups

Apply the Task 2 template to four more files:

- [ ] **Step 1: `validatePlayTile`**

Create `src/validation/tilePlay.ts`. Checks:
- Player owns the tile.
- Tile target is legal (use `src/game/` pure functions if they exist — import, don't duplicate).
- `hasPlayedTileThisTurn` is false.
- Game state is CAMPAIGN.
- It is the mover's turn.

Write `src/__tests__/validation/tilePlay.test.ts` with accept/reject coverage for each check.

Wire into dispatcher. Commit:

```bash
git commit -m "feat: validatePlayTile + unit tests"
```

- [ ] **Step 2: `validateEndTurn` and `validateAdvancePhase`**

Create `src/validation/turnFlow.ts`. Checks for `END_TURN`:
- It is the claimed player's turn.
- Required per-turn actions are complete (or we're in a valid sub-phase).

Checks for `ADVANCE_PHASE`:
- Current phase allows advancement.
- All "done-IDs" are present (per multiplayer-game skill done-IDs pattern).

Tests + wire + commit:

```bash
git commit -m "feat: validateEndTurn + validateAdvancePhase"
```

- [ ] **Step 3: `validateTakeAdvantage`, `validateChallenge`, `validateBystanderResponse`**

Create `src/validation/challengeFlow.ts`. Checks:
- Game state is CHALLENGE or the intended sub-phase.
- Claimed challenger is in `challengeOrder` and is the current one.
- For bystander responses, claimed bystander is actually in the `bystanders` list.

Tests + wire + commit:

```bash
git commit -m "feat: validateChallenge family + unit tests"
```

- [ ] **Step 4: `validateBureaucracyPurchase`**

Create `src/validation/bureaucracy.ts`. Checks:
- Game state is BUREAUCRACY.
- `currentBureaucracyPlayerIndex` matches the acting player.
- Funds sufficient.
- Item still available.

Tests + wire + commit:

```bash
git commit -m "feat: validateBureaucracyPurchase + unit tests"
```

---

### Task 4: Wire validators into handlers

**Files:**
- Modify: `src/handlers/pieceMovementHandlers.ts`
- Modify: `src/handlers/tilePlayHandlers.ts`
- Modify: `src/handlers/turnHandlers.ts`
- Modify: `src/handlers/challengeFlowHandlers.ts`
- Modify: `src/handlers/gameFlowHandlers.ts` (if it dispatches bureaucracy actions)

- [ ] **Step 1: At each handler entry point, call `validateAction`**

Template:

```ts
import { validateAction } from "../validation";
import { incrementCounter } from "../perf";

export function handleMovePiece(action: MovePieceAction, state: FullState, dispatch: ...) {
  const result = validateAction(action, state);
  if (!result.ok) {
    incrementCounter("validation.rejected");
    incrementCounter(`validation.rejected.${action.type}.${result.reason}`);
    console.warn(`[validation] ${action.type} rejected: ${result.reason}`);
    return; // DO NOT mutate
  }
  incrementCounter("validation.accepted");
  // ...existing mutation code
}
```

- [ ] **Step 2: Apply to every action-processing function across the five handler files**

Use a `Grep -n "case.*MOVE_PIECE|case.*PLAY_TILE|case.*END_TURN|case.*ADVANCE_PHASE|case.*TAKE_ADVANTAGE|case.*CHALLENGE|case.*BYSTANDER|case.*BUREAUCRACY_PURCHASE" src/handlers` to find them.

- [ ] **Step 3: Run the full suite**

```bash
npm test -- --run
```

Expected: PASS. **If something is now rejected that was previously accepted, that is a real bug — diagnose it.** Common causes:
- The validator is checking a state field the action doesn't need (e.g., turn check on a spectator action).
- The validator's phase enum value is wrong (see Task 2's placeholder warning).
- The handler is called during a phase the validator doesn't whitelist.

Fix by loosening the validator — validators must err on the side of accepting when in doubt. The goal is catching true bugs, not adding new failure modes.

- [ ] **Step 4: Commit**

```bash
git add src/handlers
git commit -m "feat: wire two-layer validation into all handlers"
```

---

### Task 5: Sync-level validation test (matrix item 7)

**Files:**
- Modify or create: `src/__tests__/sync/validation-rejection.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";

describe("execution validation rejects stale actions (spec §4c / matrix #7)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`action referencing a piece that no longer exists is rejected (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Guest 1 emits a move for a piece that doesn't exist.
        await guests[0].emitRaw({
          type: "MOVE_PIECE",
          playerId: guests[0].playerId,
          pieceId: "ghost-piece",
          fromTileId: "t1",
          toTileId: "t2",
        });
        await waitForConvergence([host, ...guests]);

        // Host state is unchanged; validation counter incremented.
        expect(host.internals.perf["validation.rejected"] ?? 0).toBeGreaterThanOrEqual(1);
        // No throw, no state corruption.
        expect(host.state).toEqual(guests[0].state);
      } finally {
        await cleanup();
      }
    });
  }
});
```

`emitRaw` is a new scenario helper that lets tests inject arbitrary action payloads (bypassing any typed emit helpers). Add it to `helpers/scenario.ts`.

- [ ] **Step 2: Run + commit**

```bash
npm test -- --run src/__tests__/sync/validation-rejection.test.ts
git add src/__tests__/sync/validation-rejection.test.ts src/__tests__/sync/helpers/scenario.ts
git commit -m "test: execution validation rejects stale actions (matrix #7)"
```

---

### Task 6: Harden rejoin — host version resume (spec 4d bullet 1)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Locate the current rejoin path**

Grep:

```bash
Grep -n "rejoin|hydrateFromDb|fetchStateFromDB" src/components/GameStateSynchronizer.tsx
```

- [ ] **Step 2: Make host version resume explicit**

When the host rejoins and hydrates from DB:

```tsx
// Before: versionRef was set implicitly by whatever path fired first
// After: explicit host hydrate
if (isHost) {
  const { data } = await supabase
    .from("kred_game_states")
    .select("version, state_json")
    .eq("lobby_id", lobbyId)
    .single();
  if (data) {
    hostVersionRef.current = data.version ?? 0;
    lastAppliedFullRef.current = data.state_json;
    lastAppliedVRef.current = data.version ?? 0;
    console.info(`[rejoin] host resumed at v${hostVersionRef.current}`);
  }
  hasHydratedRef.current = true;
}
```

Do the symmetric thing for guests (but guests only read state, not version write).

- [ ] **Step 3: Add `hasHydratedRef` guard**

```tsx
const hasHydratedRef = useRef(false);
// Before any rehydrate path:
if (hasHydratedRef.current) return;
```

This covers spec 4d bullet 4 (two guests rejoin simultaneously — guard hydrate behind a single-fire ref).

- [ ] **Step 4: Typecheck + sync tests**

```bash
npm run typecheck && npm run test:sync
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -m "fix: explicit host version resume on rejoin; single-fire hydrate guard"
```

---

### Task 7: DB persist retry with backoff (spec 4d bullet 5)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`
- Modify: `src/perf/index.ts`

- [ ] **Step 1: Add the `persist.retries` counter**

```ts
"persist.retries": { kind: "counter" },
"persist.giveUp": { kind: "counter" },
```

- [ ] **Step 2: Wrap the existing `schedulePersist` in a retry shell**

```tsx
async function persistWithRetry(payload: any, attempt = 0): Promise<void> {
  const backoffMs = [100, 500, 2000];
  try {
    const { error } = await supabase
      .from("kred_game_states")
      .upsert({ lobby_id: lobbyId, ... });
    if (error) throw error;
  } catch (err) {
    if (attempt >= backoffMs.length) {
      incrementCounter("persist.giveUp");
      console.error("[persist] gave up after retries", err);
      return;
    }
    incrementCounter("persist.retries");
    await new Promise((r) => setTimeout(r, backoffMs[attempt]));
    return persistWithRetry(payload, attempt + 1);
  }
}
```

The existing throttle/debounce path calls `persistWithRetry` instead of the direct upsert.

- [ ] **Step 3: Sync tests + smoke + commit**

```bash
npm run test:sync
git commit -m "fix: DB persist retries with 100/500/2000ms backoff"
```

---

### Task 8: Reconnect test matrix (matrix items 12, 13, 14, 15)

**Files:**
- Create: `src/__tests__/sync/reconnect.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, expect, it } from "vitest";
import {
  createMultiplayerScenario,
  waitForConvergence,
} from "./helpers/scenario";

describe("reconnect + rejoin (spec §4d / matrix #12, #13, #14, #15)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`guest disconnects mid-campaign → reconnects → hydrates → matches host (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Drive to CAMPAIGN with some state
        await host.advanceToPhase("CAMPAIGN");
        await host.setState({ currentPlayerIndex: 2 });
        await waitForConvergence([host, ...guests]);

        // Guest 0 disconnects
        await guests[0].disconnect();

        // Host does more work
        await host.setState({ currentPlayerIndex: 3 % playerCount });
        await waitForConvergence([host, ...guests.slice(1)]);

        // Guest 0 reconnects
        const rejoined = await guests[0].reconnect();
        await waitForConvergence([host, rejoined]);

        expect(rejoined.state).toEqual(host.state);
      } finally {
        await cleanup();
      }
    });

    it(`host crashes → restarts → version counter resumes from DB (${playerCount}p)`, async () => {
      const { host, guests, cleanup, restartHost } = await createMultiplayerScenario({ playerCount });
      try {
        await host.setState({ currentPlayerIndex: 1 });
        await waitForConvergence([host, ...guests]);

        // "Crash" and restart
        const newHost = await restartHost();
        await waitForConvergence([newHost, ...guests]);

        // New host's version ref should be at least the previous version;
        // guests should not reject post-rejoin pushes as stale.
        await newHost.setState({ currentPlayerIndex: 2 });
        await waitForConvergence([newHost, ...guests]);
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(2);
        }
      } finally {
        await cleanup();
      }
    });

    it(`guest rejoins after a delta gap → requests full → recovers (${playerCount}p)`, async () => {
      // Matrix #14 — same shape as Step 6's delta unknown-baseV test,
      // but specifically in the "guest was offline during the gap" flavor.
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.setState({ currentPlayerIndex: 1 });
        await waitForConvergence([host, ...guests]);

        await guests[0].disconnect();
        // Host pushes several deltas while guest is offline
        for (let i = 2; i < 6; i++) {
          await host.setState({ currentPlayerIndex: i % playerCount });
          await waitForConvergence([host, ...guests.slice(1)]);
        }

        const rejoined = await guests[0].reconnect();
        await waitForConvergence([host, rejoined]);
        expect(rejoined.state).toEqual(host.state);
      } finally {
        await cleanup();
      }
    });

    it(`guest joins as spectator → receives full state → gets subsequent updates (${playerCount}p)`, async () => {
      const { host, guests, cleanup, addSpectator } = await createMultiplayerScenario({ playerCount });
      try {
        await host.setState({ currentPlayerIndex: 1 });
        await waitForConvergence([host, ...guests]);

        const spectator = await addSpectator();
        await waitForConvergence([host, ...guests, spectator]);
        expect(spectator.state).toEqual(host.state);

        await host.setState({ currentPlayerIndex: 2 });
        await waitForConvergence([host, ...guests, spectator]);
        expect(spectator.state.currentPlayerIndex).toBe(2);
      } finally {
        await cleanup();
      }
    });
  }
});
```

**Note:** `disconnect`, `reconnect`, `restartHost`, `addSpectator` are new scenario helper surfaces. Implement them in `helpers/scenario.ts`:

- `disconnect()` — unsubscribes the guest's channels and stops the poll interval. Leaves the user_id in `kred_players`.
- `reconnect()` — re-mounts the guest harness, triggering the same rejoin path production code uses.
- `restartHost()` — tears down the current host harness and mounts a new one with the same `lobbyId`. Returns the new host proxy.
- `addSpectator()` — mounts a new guest harness with a different user_id. The production code path for spectator vs player is the same — spectators just aren't in the done-IDs checks.

- [ ] **Step 2: Run. Expect several failures initially.**

```bash
npm test -- --run src/__tests__/sync/reconnect.test.ts
```

Every failure is a real edge case from the spec. Fix one at a time:
- Matrix #12: guest hydrate path not idempotent → audit `hasHydratedRef` placement.
- Matrix #13: host version not resuming → Task 6 should have fixed this; re-check.
- Matrix #14: delta gap on reconnect → `REQUEST_FULL` path must fire on reconnect too; ensure `lastAppliedVRef` resets to 0 on reconnect so the first incoming delta is detected as gap.
- Matrix #15: spectator not receiving initial full state → the host's "on guest subscribe" hook should send a full snapshot; if production code doesn't already do this, add it.

- [ ] **Step 3: Re-run until green**

```bash
npm test -- --run src/__tests__/sync/reconnect.test.ts
```

Expected: PASS for all player counts.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/sync/reconnect.test.ts src/__tests__/sync/helpers/scenario.ts src/components/GameStateSynchronizer.tsx
git commit -m "test+fix: reconnect + rejoin edge cases (matrix #12, #13, #14, #15)"
```

---

### Task 9: Generic `ErrorBoundary` component

**Files:**
- Create: `src/components/errors/ErrorBoundary.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/errors/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { incrementCounter } from "../../perf";

interface ErrorBoundaryProps {
  name: string;
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    incrementCounter(`errors.${this.props.name}`);
    console.error(`[ErrorBoundary:${this.props.name}]`, error, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Add PerfStore counters**

```ts
"errors.top": { kind: "counter" },
"errors.screen": { kind: "counter" },
```

- [ ] **Step 3: Unit test**

Create `src/__tests__/components/error-boundary.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../../components/errors/ErrorBoundary";

function Bomb({ throwIt }: { throwIt: boolean }) {
  if (throwIt) throw new Error("boom");
  return <div>ok</div>;
}

describe("ErrorBoundary", () => {
  it("renders children normally", () => {
    render(
      <ErrorBoundary name="test" fallback={(e) => <div>caught: {e.message}</div>}>
        <Bomb throwIt={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("ok")).toBeTruthy();
  });

  it("renders fallback on throw", () => {
    render(
      <ErrorBoundary name="test" fallback={(e) => <div>caught: {e.message}</div>}>
        <Bomb throwIt={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("caught: boom")).toBeTruthy();
  });

  it("reset clears the error", () => {
    let shouldThrow = true;
    function Controlled() {
      return <Bomb throwIt={shouldThrow} />;
    }
    const { rerender } = render(
      <ErrorBoundary
        name="test"
        fallback={(_, reset) => <button onClick={() => { shouldThrow = false; reset(); }}>retry</button>}
      >
        <Controlled />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText("retry"));
    rerender(
      <ErrorBoundary name="test" fallback={(e) => <div>err: {e.message}</div>}>
        <Controlled />
      </ErrorBoundary>,
    );
    expect(screen.getByText("ok")).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
npm test -- --run src/__tests__/components/error-boundary.test.tsx
git add src/components/errors/ErrorBoundary.tsx src/__tests__/components/error-boundary.test.tsx src/perf/index.ts
git commit -m "feat: generic ErrorBoundary component + tests"
```

---

### Task 10: Top-level error boundary with auto-rejoin

**Files:**
- Create: `src/components/errors/TopLevelErrorBoundary.tsx`
- Modify: `src/KredApp.tsx`

- [ ] **Step 1: Write the top-level boundary**

```tsx
// src/components/errors/TopLevelErrorBoundary.tsx
import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props {
  children: ReactNode;
  onRejoin: () => void;
}

export function TopLevelErrorBoundary({ children, onRejoin }: Props) {
  return (
    <ErrorBoundary
      name="top"
      fallback={(error, reset) => (
        <div className="p-8 text-center">
          <h1 className="text-xl mb-4">Something went wrong</h1>
          <p className="text-sm opacity-70 mb-4">{error.message}</p>
          <button
            className="px-4 py-2 border rounded"
            onClick={() => {
              onRejoin();
              reset();
            }}
          >
            Rejoin game
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

- [ ] **Step 2: Mount it in `KredApp.tsx`**

```tsx
import { TopLevelErrorBoundary } from "./components/errors/TopLevelErrorBoundary";

// Inside KredApp render:
<TopLevelErrorBoundary onRejoin={handleRejoinFlow}>
  <GameProviders>
    {/* ...existing tree */}
  </GameProviders>
</TopLevelErrorBoundary>
```

`handleRejoinFlow` is whatever rejoin trigger already exists in `KredApp.tsx` — if there is no such function, create one that resets local lobby state and re-runs the session check.

- [ ] **Step 3: Typecheck + tests + commit**

```bash
npm run typecheck && npm test -- --run
git commit -m "feat: top-level error boundary with auto-rejoin"
```

---

### Task 11: Per-screen error boundaries

**Files:**
- Create: `src/components/errors/ScreenErrorBoundary.tsx`
- Modify: `src/components/ScreenRouter.tsx`

- [ ] **Step 1: Write the screen boundary**

```tsx
// src/components/errors/ScreenErrorBoundary.tsx
import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface Props {
  screenName: string;
  children: ReactNode;
}

export function ScreenErrorBoundary({ screenName, children }: Props) {
  return (
    <ErrorBoundary
      name={`screen.${screenName}`}
      fallback={(error, reset) => (
        <div className="p-6 border border-red-400 rounded m-4">
          <h2 className="text-lg mb-2">This screen hit an error</h2>
          <p className="text-sm opacity-70 mb-4">{error.message}</p>
          <button className="px-3 py-1 border rounded" onClick={reset}>Retry</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

- [ ] **Step 2: Wrap each screen in `ScreenRouter.tsx`**

```tsx
import { ScreenErrorBoundary } from "./errors/ScreenErrorBoundary";

export function ScreenRouter() {
  const { gameState } = usePhase();
  switch (gameState) {
    case GameState.LOBBY:
      return <ScreenErrorBoundary screenName="lobby"><LobbyScreen /></ScreenErrorBoundary>;
    case GameState.DRAFTING:
      return <ScreenErrorBoundary screenName="drafting"><DraftingScreen /></ScreenErrorBoundary>;
    case GameState.CAMPAIGN:
      return <ScreenErrorBoundary screenName="campaign"><CampaignScreen /></ScreenErrorBoundary>;
    case GameState.BUREAUCRACY:
      return <ScreenErrorBoundary screenName="bureaucracy"><BureaucracyScreen /></ScreenErrorBoundary>;
    default:
      return null;
  }
}
```

- [ ] **Step 3: Typecheck + tests + dev smoke**

```bash
npm run typecheck && npm test -- --run
npm run dev
```

Force-throw from a screen (temporarily add `throw new Error("test")` to one screen's render) to confirm:
- The screen error boundary catches it.
- Other screens still work.
- `errors.screen.<name>` counter increments in the overlay.
- Clicking "Retry" clears the error.

Revert the test throw.

- [ ] **Step 4: Commit**

```bash
git add src/components/errors/ScreenErrorBoundary.tsx src/components/ScreenRouter.tsx
git commit -m "feat: per-screen error boundaries with retry"
```

---

### Task 12: Final suite + 3/4/5 smoke

**Files:**
- None

- [ ] **Step 1: Full suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 2: 3/4/5 dev smoke**

For each player count, play a full game. Confirm:
- Validation counters climb during normal play (`validation.accepted` should be large; `validation.rejected` should be near 0 unless you intentionally introduced bad actions).
- `persist.retries` and `persist.giveUp` are both 0.
- `errors.top` and `errors.screen` are 0.
- Rejoin works: disconnect a guest mid-game (close the browser tab), reopen, rejoin, confirm state matches.
- Host restart works: kill + restart a host browser tab; guests reconnect and state is consistent.

---

## Definition of done

- [ ] `src/validation/` has one file per action group plus `index.ts` dispatcher.
- [ ] Every handler in `src/handlers/` calls `validateAction` before mutating.
- [ ] Validation counters exist in PerfStore.
- [ ] Rejection logs to PerfStore without throwing or toasting.
- [ ] Host version resume on rejoin is explicit; `hasHydratedRef` guards double-hydrate.
- [ ] DB persist retries with 100/500/2000ms backoff; gives up with a counter after three failures.
- [ ] `ErrorBoundary` generic component exists and is tested.
- [ ] `TopLevelErrorBoundary` wraps the in-lobby tree; auto-rejoin flow fires on catch.
- [ ] `ScreenErrorBoundary` wraps each screen inside `ScreenRouter`.
- [ ] Sync matrix items 7, 12, 13, 14, 15 all pass for 3, 4, 5 player counts.
- [ ] All existing tests still pass.
- [ ] No wire format changes.
- [ ] No schema changes.

## Handoff notes for next step (Step 9 — UI Guardrails)

- Error boundaries are in place. Step 9's double-submit guards should raise the bar from "doesn't crash" to "doesn't let the user do something dumb."
- `validation.rejected` counter values from a playthrough of Step 8 can identify screens where actions are getting rejected at execution time — those are the same screens Step 9's audit should prioritize for confirmation gates.
- The `isProcessing` pattern described in Step 9 should pair with the validation rejection response: a button that triggers a rejected action should re-enable itself (not stay stuck).
