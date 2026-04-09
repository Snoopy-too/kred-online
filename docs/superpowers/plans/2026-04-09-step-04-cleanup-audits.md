# Step 4 — Cleanup Audits (4a, 4b, 4f)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sweep three categories of latent correctness bugs before the App.tsx breakup exposes them:
- **4a** — Bounded memory audit: every long-lived `ref`, `Map`, and `Set` in the multiplayer path gets an explicit upper bound or a proof that it's naturally bounded.
- **4b** — Phase-change cleanup matrix: for each game phase, document what must be reset on entry, and enforce it in code.
- **4f** — Subscription stability audit: assert that no subscription's `useEffect` deps contain mutable game state (a classic re-subscribe bug in React multiplayer code).

**Architecture:** Additive. No wire format changes, no provider splits, no new files except tests and one small utility (`BoundedMap`) if needed. The deliverable is a combination of (1) small code fixes where audits find real issues, (2) new tests that assert the invariants, and (3) a short `docs/superpowers/phase-cleanup-matrix.md` table documenting the reset rules so a future provider split in Step 7 can port them mechanically.

**Tech Stack:** React 19, TypeScript, Vitest.

---

## Context for fresh agent

**Read these first** (in this order, ~8 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 4a, 4b, and 4f** are what you're implementing. Skip 4c/4d/4e/4g — those are Step 8 and Step 9.
2. `docs/superpowers/plans/2026-04-09-step-03-sync-layer-fixes.md` — "Handoff notes for next step" section at the bottom. Step 3 introduced several new long-lived refs that this step must audit.
3. `src/App.tsx` — search for `useRef`, `useState<.*Map`, `useState<.*Set`, `useState<.*\[\]`. You are looking for every long-lived collection in the game path. Produce a bullet list as you read.
4. `src/components/GameStateSynchronizer.tsx` — same thing. After Step 3, this file has ~10 long-lived refs.
5. `src/game/phases.ts` (or equivalent) — the phase enum. You need the complete list of phases to build the cleanup matrix.
6. `src/__tests__/sync/` — the test net Steps 1 and 3 built. Your new tests go here.
7. `src/perf/index.ts` — you'll add one small gauge helper (`subscriptions.openCount`) in Task 7. Step 2 exposed `recordMetric`, `incrementCounter`, `useRenderCount`, `usePerfCounter`, `usePerfSeries`. This step adds a tiny `setGauge`/`readGauge` pair on top (≤ 15 lines).

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- New tests under `src/__tests__/sync/`.
- File-size budget: 500 lines per file.

**Critical constraints:**
- **No wire format changes.** This step is read-side audits plus small fixes.
- **No App.tsx structural changes.** Provider breakup is Step 5+.
- **All existing tests must stay green.**
- **3, 4, AND 5 player modes must all keep working.** New tests parameterize across all three.
- **If an audit finds a real bug, fix it in this step.** Don't defer. But keep fixes minimal — no refactors.

**What this step does NOT do:**
- ❌ Validation audit — Step 8 (4c).
- ❌ Reconnect / rejoin edge cases — Step 8 (4d).
- ❌ Error boundaries — Step 8 (4g).
- ❌ UI double-submit guards — Step 9 (4e).
- ❌ Provider migrations — Step 5 / Step 7.

---

## File Structure

| File | Purpose | Size after |
|---|---|---|
| `src/utils/BoundedMap.ts` | Generic insertion-order `Map` with a cap; drops oldest on overflow. Only created if Task 2 finds a Map that needs bounding. | ≤ 60 lines |
| `src/__tests__/sync/memory-bounds.test.ts` | Assert every long-lived ref/Map/Set in the multiplayer path is bounded under a long game. Covers spec matrix items 17 and 18. | ≤ 250 lines |
| `src/__tests__/sync/phase-cleanup.test.ts` | One test per phase transition, asserting stale state from the prior phase is cleared. | ≤ 350 lines |
| `src/__tests__/sync/subscription-stability.test.ts` | Assert subscription open counter stays at exactly `1` per channel for the lifetime of a lobby session, across 50 state changes. | ≤ 150 lines |
| `docs/superpowers/phase-cleanup-matrix.md` | Plain markdown table. One row per phase transition, columns: from-phase, to-phase, state to reset, timers to clear, DB rows to sweep. Single source of truth for Step 7 (provider breakup). | ≤ 200 lines |
| `src/App.tsx` | Small, targeted fixes discovered by the audits (expected ≤ 50 lines touched). If audits find no issues, no change. | unchanged size |
| `src/components/GameStateSynchronizer.tsx` | Small, targeted fixes discovered by the audits (expected ≤ 30 lines touched). | unchanged size |
| `src/perf/index.ts` | Add `subscriptions.openCount` counter. | +5 lines |

---

## Tasks

### Task 1: Inventory every long-lived ref/Map/Set in the multiplayer path (4a)

**Files:**
- Read-only: `src/App.tsx`, `src/components/GameStateSynchronizer.tsx`, any file under `src/hooks/` or `src/context/` touched by gameplay.
- Create: `docs/superpowers/phase-cleanup-matrix.md` (as a working doc — you'll fill in the cleanup columns in Task 4).

- [ ] **Step 1: Grep for long-lived state in App.tsx and the synchronizer**

Run these searches and keep the output in a scratch buffer:

```bash
# Refs and state in the top-level App
# (via the Grep tool, not bash)
Grep -n "useRef" src/App.tsx
Grep -n "useState" src/App.tsx
Grep -n "useRef" src/components/GameStateSynchronizer.tsx
```

- [ ] **Step 2: Build an inventory table**

In a scratch markdown buffer (or at the top of `phase-cleanup-matrix.md` under a heading `## Inventory — long-lived state`), produce a row for every hit with these columns:

| Name | File:line | Type | Lifetime | Max size | Currently bounded? | Resets on phase change? |

**Lifetime** is one of: `mount..unmount`, `phase..phase`, `turn..turn`, `action..action`.

**Max size** must be a concrete formula in terms of `players.length`, `pieces_per_player`, `tile_count`, or a literal number. If you cannot write such a formula, the state is a bug suspect and goes into Task 2.

**Example rows** (the actual set comes from the grep output):

| Name | Location | Type | Lifetime | Max size | Bounded? | Resets on phase? |
|---|---|---|---|---|---|---|
| `processedActionIdsRef` | GameStateSynchronizer.tsx:131 | BoundedActionIdSet | mount..unmount | 500 (ring) | Yes — Step 3 | No — dedupe spans phases |
| `hostVersionRef` | GameStateSynchronizer.tsx:79 | number | mount..unmount | 1 number | Yes | No — monotonic |
| `actionQueueRef` | GameStateSynchronizer.tsx:133 | any[] | mount..unmount | drains to 0 each macrotask | De facto bounded by enqueue rate | No |
| `players` | App.tsx | Player[] | mount..unmount | playerCount (3–5) | Yes — fixed at game start | No — persists |
| `boardTiles` | App.tsx | Tile[] | mount..unmount | tile_count | Yes — fixed deck | No |
| `bystanderIndex` (and any phase-only state) | App.tsx | number | **phase..phase** | 1 | Yes | **Must reset** |

- [ ] **Step 3: Commit the inventory**

```bash
git add docs/superpowers/phase-cleanup-matrix.md
git commit -m "docs: inventory long-lived multiplayer state for audit"
```

---

### Task 2: Audit each inventoried entry; flag unbounded cases

**Files:**
- Read-only: the files identified in Task 1.

- [ ] **Step 1: Mark each inventory row as one of**

- ✅ **Naturally bounded** — formula is a small constant or `O(playerCount)` with playerCount ≤ 5.
- ✅ **Explicitly bounded** — code already caps it (e.g., ring buffer).
- ⚠️ **Unbounded — suspect** — grows with game length or action count.

- [ ] **Step 2: For each ⚠️ entry, decide one of**

- **Fix: add explicit bound** — if the entry is actually at risk under long games (anything tied to `created_at`, `actionId`, `version`, ad-hoc dedupe Sets).
- **Promote to ✅ with comment** — if the entry is bounded but the bound isn't obvious; add a `// bounded by <formula>` comment inline.

The only known pre-existing ⚠️ entries after Step 3 are the ones Step 3's handoff notes call out. Re-check those first; others you find are bonus.

- [ ] **Step 3: Record decisions in `phase-cleanup-matrix.md`**

Under the inventory table, add a `## Audit decisions` section with one bullet per ⚠️ entry and the decision taken.

- [ ] **Step 4: Commit the decisions (no code yet)**

```bash
git add docs/superpowers/phase-cleanup-matrix.md
git commit -m "docs: record memory bounds audit decisions"
```

---

### Task 3: Implement any memory bounds fixes the audit surfaced

**Files:**
- Create (only if Task 2 flagged a Map that needs bounding): `src/utils/BoundedMap.ts`
- Modify: whichever file held the ⚠️ entry.

- [ ] **Step 1: If `BoundedMap` is needed, write it**

```ts
// src/utils/BoundedMap.ts
/**
 * Insertion-ordered Map with a hard cap. On overflow, drops the oldest entry.
 * Intended for per-entity caches where old keys are safe to forget.
 */
export class BoundedMap<K, V> {
  private readonly map = new Map<K, V>();
  constructor(private readonly cap: number) {
    if (cap <= 0) throw new Error("BoundedMap cap must be > 0");
  }

  set(key: K, value: V): this {
    if (this.map.has(key)) {
      // Refresh insertion order so recently-touched keys survive eviction.
      this.map.delete(key);
    } else if (this.map.size >= this.cap) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
    this.map.set(key, value);
    return this;
  }

  get(key: K): V | undefined { return this.map.get(key); }
  has(key: K): boolean { return this.map.has(key); }
  delete(key: K): boolean { return this.map.delete(key); }
  clear(): void { this.map.clear(); }
  get size(): number { return this.map.size; }
  values(): IterableIterator<V> { return this.map.values(); }
  keys(): IterableIterator<K> { return this.map.keys(); }
  entries(): IterableIterator<[K, V]> { return this.map.entries(); }
}
```

- [ ] **Step 2: Write the failing test for `BoundedMap`**

Create `src/__tests__/sync/boundedMap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BoundedMap } from "../../utils/BoundedMap";

describe("BoundedMap", () => {
  it("caps size at the configured limit", () => {
    const m = new BoundedMap<number, number>(3);
    for (let i = 0; i < 10; i++) m.set(i, i * 10);
    expect(m.size).toBe(3);
    expect(m.has(0)).toBe(false); // oldest evicted
    expect(m.has(7)).toBe(true);
    expect(m.has(9)).toBe(true);
  });

  it("refreshes insertion order on re-set so touched keys survive eviction", () => {
    const m = new BoundedMap<string, number>(3);
    m.set("a", 1);
    m.set("b", 2);
    m.set("c", 3);
    m.set("a", 10); // refresh a
    m.set("d", 4);  // evicts b (oldest), not a
    expect(m.has("a")).toBe(true);
    expect(m.has("b")).toBe(false);
  });

  it("throws on non-positive cap", () => {
    expect(() => new BoundedMap(0)).toThrow();
  });
});
```

- [ ] **Step 3: Run the test (expect FAIL if BoundedMap.ts does not exist yet, PASS once it does)**

```bash
npm test -- --run src/__tests__/sync/boundedMap.test.ts
```

Expected: PASS.

- [ ] **Step 4: Apply any code-level fixes the audit flagged**

For each ⚠️ entry in the audit that was decided "fix," apply the fix. Keep diffs minimal. If the fix needs `BoundedMap`, import from `src/utils/BoundedMap`.

- [ ] **Step 5: Run the full suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/BoundedMap.ts src/__tests__/sync/boundedMap.test.ts <any fixed files>
git commit -m "feat: add BoundedMap util and fix unbounded collections found by audit"
```

---

### Task 4: Build the phase-cleanup matrix document (4b)

**Files:**
- Modify: `docs/superpowers/phase-cleanup-matrix.md`

- [ ] **Step 1: Identify all game phases**

Grep the phase enum:

```bash
# via Grep tool
Grep -n "enum.*Phase|GamePhase" src
```

Read the phase enum file and list every phase value. Expected values (verify against code): `LOBBY`, `DRAFTING`, `CAMPAIGN`, `CHALLENGE`, `BUREAUCRACY`, `ROUND_END`, `GAME_OVER` (or whatever the project uses — use the actual values).

- [ ] **Step 2: For each phase-to-phase edge that is reachable in a normal game, build a row**

Under a new heading `## Phase cleanup matrix`, produce a table with these columns:

| From → To | State that must be reset | Timers/intervals to clear | DB rows to sweep | Notes |

**How to populate each row:**
- **State that must be reset:** any state owned by the `fromPhase` that has no meaning in `toPhase`. E.g., `tileRejected` has meaning in CHALLENGE but not CAMPAIGN → reset on CHALLENGE → CAMPAIGN.
- **Timers/intervals:** grep `setTimeout|setInterval` within the handlers for `fromPhase` and confirm cleanup runs before `toPhase`.
- **DB rows:** which `kred_game_actions.action_type` values from `fromPhase` should be swept on entry to `toPhase`? (After Step 3's action poll fix, old rows are harmless but still clutter the table.)
- **Notes:** anything subtle — especially any spot where the current code _does not_ clean up and a real fix is required.

- [ ] **Step 3: For every row whose "State to reset" column is non-empty, either verify the code already resets it or add a fix**

The fix pattern is a `useEffect` keyed on the phase, inside the component that owns the state:

```tsx
useEffect(() => {
  if (phase === GamePhase.CAMPAIGN) {
    // From CHALLENGE → CAMPAIGN: reset challenge state
    setTileRejected(false);
    setBystanderIndex(0);
    setChallengeOrder([]);
  }
  if (phase === GamePhase.BUREAUCRACY) {
    // From CAMPAIGN → BUREAUCRACY: reset any pending tile transaction
    setPlayedTile(null);
    setTileTransaction(null);
    setHasPlayedTileThisTurn(false);
  }
  // ...etc
}, [phase]);
```

If the reset logic already exists and is correct, mark the row ✅. If it is missing or wrong, write the minimal fix and mark the row 🔧.

**Important:** do NOT rewrite the handlers. You are adding or correcting reset effects only.

- [ ] **Step 4: Commit the matrix doc**

```bash
git add docs/superpowers/phase-cleanup-matrix.md
git commit -m "docs: add phase-cleanup rules matrix"
```

- [ ] **Step 5: Commit any code fixes as a separate commit**

```bash
git add src/App.tsx <any files touched>
git commit -m "fix: reset phase-scoped state on phase transitions per cleanup matrix"
```

(Only if 🔧 rows existed.)

---

### Task 5: Write memory-bounds tests (spec matrix items 17, 18)

**Files:**
- Create: `src/__tests__/sync/memory-bounds.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";

describe("memory bounds (spec §4a / matrix #17, #18)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`processedActionIdsRef stays ≤ 500 after 200 actions (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        for (let i = 0; i < 200; i++) {
          const sender = guests[i % guests.length];
          await sender.emitNoop(); // helper that emits a benign action
        }
        await waitForConvergence([host, ...guests]);

        // Spec §4a: processedActionIdsRef is a BoundedActionIdSet with cap 500.
        expect(host.internals.processedActionIdsRef.size).toBeLessThanOrEqual(500);
      } finally {
        await cleanup();
      }
    });

    it(`no provider Map retains stale entities after 200 actions (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        for (let i = 0; i < 200; i++) {
          const sender = guests[i % guests.length];
          await sender.emitNoop();
        }
        await waitForConvergence([host, ...guests]);

        // Any entity-keyed state should be ≤ players * pieces + tile_count.
        // The exact cap is test-file-scoped and comes from the inventory in
        // phase-cleanup-matrix.md. Keep this loose — the point is "does not
        // grow linearly with action count."
        const upperBound = playerCount * 6 + 64; // 6 pieces/player, 64 tiles
        for (const [name, collection] of host.internals.longLivedCollections()) {
          expect(
            collection.size,
            `collection "${name}" has ${collection.size} entries, expected ≤ ${upperBound}`
          ).toBeLessThanOrEqual(upperBound);
        }
      } finally {
        await cleanup();
      }
    });
  }
});
```

**Important:** `host.internals` and `emitNoop()` are helpers on top of Step 1's sync scenario. If they don't exist yet, extend `src/__tests__/sync/helpers/scenario.ts` with the minimum surface this test needs:

```ts
// In helpers/scenario.ts, extend the returned host object with:
internals: {
  processedActionIdsRef: BoundedActionIdSet;
  longLivedCollections(): Iterable<[string, { size: number }]>;
}
```

`emitNoop()` emits a trivial action type (`NOOP` — add it to the action type union if needed, with a handler that is a pure pass-through). The action's only purpose is to drive the queue.

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/__tests__/sync/memory-bounds.test.ts
```

Expected: FAIL until scenario helpers expose `internals`. Extend the helpers, then re-run.

- [ ] **Step 3: Run to confirm pass**

```bash
npm test -- --run src/__tests__/sync/memory-bounds.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/sync/memory-bounds.test.ts src/__tests__/sync/helpers/scenario.ts
git commit -m "test: assert multiplayer state collections are bounded (spec matrix #17, #18)"
```

---

### Task 6: Write phase-cleanup tests

**Files:**
- Create: `src/__tests__/sync/phase-cleanup.test.ts`

- [ ] **Step 1: Write one test per phase transition**

Use the matrix from Task 4 to generate tests. For each row with a non-empty "State to reset" column, write a test that:
1. Drives the game into `fromPhase`.
2. Mutates the relevant state.
3. Forces the phase transition.
4. Asserts the state is clean.

Template:

```ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";
import { GamePhase } from "../../game/phases";

describe("phase cleanup (spec §4b)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`CHALLENGE → CAMPAIGN: tileRejected, bystanderIndex reset (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.advanceToPhase(GamePhase.CHALLENGE);
        await host.setState({ tileRejected: true, bystanderIndex: 2 });
        await host.advanceToPhase(GamePhase.CAMPAIGN);
        await waitForConvergence([host, ...guests]);

        expect(host.state.tileRejected).toBe(false);
        expect(host.state.bystanderIndex).toBe(0);
        for (const g of guests) {
          expect(g.state.tileRejected).toBe(false);
          expect(g.state.bystanderIndex).toBe(0);
        }
      } finally {
        await cleanup();
      }
    });

    it(`CAMPAIGN → BUREAUCRACY: pending tile transaction cleared (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.advanceToPhase(GamePhase.CAMPAIGN);
        await host.setState({
          playedTile: { id: "t1" },
          tileTransaction: { status: "pending" },
          hasPlayedTileThisTurn: true,
        });
        await host.advanceToPhase(GamePhase.BUREAUCRACY);
        await waitForConvergence([host, ...guests]);

        expect(host.state.playedTile).toBeNull();
        expect(host.state.tileTransaction).toBeNull();
        expect(host.state.hasPlayedTileThisTurn).toBe(false);
      } finally {
        await cleanup();
      }
    });

    it(`BUREAUCRACY → next round: bureaucracy state reset (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.advanceToPhase(GamePhase.BUREAUCRACY);
        await host.setState({ currentBureaucracyPlayerIndex: 2 });
        await host.advanceToPhase(GamePhase.CAMPAIGN); // next round
        await waitForConvergence([host, ...guests]);

        expect(host.state.currentBureaucracyPlayerIndex).toBe(0);
      } finally {
        await cleanup();
      }
    });

    // Add one test per row in phase-cleanup-matrix.md.
  }
});
```

**Note:** `advanceToPhase` and `setState` are new scenario helpers. Add the minimum surface to `helpers/scenario.ts`:

```ts
// advanceToPhase: monkey-patch the host provider's phase state to a target value
// setState: merge-patch host state and trigger a sync push
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --run src/__tests__/sync/phase-cleanup.test.ts
```

Expected: FAIL for any row that does not already have a reset effect.

- [ ] **Step 3: Iterate: extend helpers, add reset effects (if Task 4 didn't already), rerun until green**

```bash
npm test -- --run src/__tests__/sync/phase-cleanup.test.ts
```

Expected: PASS across all playerCounts (3, 4, 5).

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/sync/phase-cleanup.test.ts src/__tests__/sync/helpers/scenario.ts
git commit -m "test: phase-change cleanup rules per matrix (spec §4b)"
```

---

### Task 7: Subscription stability audit (4f)

**Files:**
- Modify: `src/perf/index.ts` (add counter)
- Modify: `src/components/GameStateSynchronizer.tsx` (increment counter on subscribe, decrement on unsubscribe)
- Create: `src/__tests__/sync/subscription-stability.test.ts`

- [ ] **Step 1: Add a tiny `setGauge`/`readGauge` pair + the `subscriptions.openCount` metric**

Step 2's PerfStore exposes counters and series but not gauges. Add a minimal gauge helper in `src/perf/index.ts` (≤ 15 lines) alongside the existing exports:

```ts
// src/perf/index.ts — additions
const gauges: Record<string, number> = Object.create(null);

export function setGauge(name: string, updater: number | ((current: number) => number)): void {
  if (!PERF_ENABLED) return;
  const current = gauges[name] ?? 0;
  gauges[name] = typeof updater === "function" ? updater(current) : updater;
}

export function readGauge(name: string): number {
  return gauges[name] ?? 0;
}
```

No registry entry is needed — gauges are sparse by construction.

- [ ] **Step 2: Wire the counter in GameStateSynchronizer**

At every `supabase.channel(...).subscribe(...)` call site:

```ts
import { setGauge } from "../perf";

const channel = supabase.channel(`game:${lobbyId}`)
  .on("broadcast", ...)
  .subscribe((status) => {
    if (status === "SUBSCRIBED") setGauge("subscriptions.openCount", (current) => current + 1);
  });

// And in the cleanup returned from useEffect:
return () => {
  supabase.removeChannel(channel);
  setGauge("subscriptions.openCount", (current) => Math.max(0, current - 1));
};
```

Do this for **every** `supabase.channel` in `GameStateSynchronizer.tsx` (broadcast channel + any remaining action realtime channel after Step 3's changes).

- [ ] **Step 3: Write the failing test**

```ts
// src/__tests__/sync/subscription-stability.test.ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";
import { readGauge } from "../../perf";

describe("subscription stability (spec §4f)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`open counter stays exactly at baseline across 50 state changes (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await waitForConvergence([host, ...guests]);

        const baselineOpen = readGauge("subscriptions.openCount");
        // Baseline = 1 broadcast per host + 1 broadcast per guest + 1 actions realtime per host
        // Exact number doesn't matter; the invariant is "stable under state changes."

        for (let i = 0; i < 50; i++) {
          const sender = guests[i % guests.length];
          await sender.emitNoop();
        }
        await waitForConvergence([host, ...guests]);

        const afterOpen = readGauge("subscriptions.openCount");
        expect(afterOpen).toBe(baselineOpen);
      } finally {
        await cleanup();
      }
    });
  }
});
```

- [ ] **Step 4: Run test**

```bash
npm test -- --run src/__tests__/sync/subscription-stability.test.ts
```

Expected: PASS if every subscription in the synchronizer uses stable deps (`[lobbyId, isHost]` only). If this FAILS, you have found a real bug — one of the subscribe `useEffect`s has mutable game state in its dep array. Fix by:
1. Removing the mutable state from the deps.
2. Moving any access to that state through a `useRef` updated by a separate `useEffect`.
3. Using functional `setState` updaters inside the subscribe handler instead of closing over state values.

Re-run until green.

- [ ] **Step 5: Commit**

```bash
git add src/perf/index.ts src/components/GameStateSynchronizer.tsx src/__tests__/sync/subscription-stability.test.ts
git commit -m "test: assert subscription open count is stable across state changes (spec §4f)"
```

---

### Task 8: Final sanity pass + commit matrix doc updates

**Files:**
- Modify: `docs/superpowers/phase-cleanup-matrix.md` (mark all rows ✅ or 🔧-resolved)

- [ ] **Step 1: Run the full test suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 2: Dev smoke test (3, 4, 5 players)**

```bash
npm run dev
```

For each player count (3, 4, 5):
1. Create a lobby and start a game.
2. Walk through drafting → campaign → bureaucracy → round end.
3. Confirm no console errors.
4. Open the Perf Overlay (`?perf=1`) and confirm `subscriptions.openCount` matches expected baseline throughout.

- [ ] **Step 3: Mark the matrix doc as resolved**

In `docs/superpowers/phase-cleanup-matrix.md`, any rows still marked 🔧 that have now been fixed → flip to ✅. Rows that are intentionally deferred to Step 7 (because a provider migration will solve them cleanly) → mark ⏭️ with a `# deferred to step-07` inline note.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/phase-cleanup-matrix.md
git commit -m "docs: finalize phase cleanup matrix statuses"
```

---

## Definition of done

- [ ] Inventory of every long-lived ref/Map/Set exists in `phase-cleanup-matrix.md`, with a max-size formula for each.
- [ ] Every ⚠️ unbounded entry is either fixed or explicitly documented as bounded with a comment.
- [ ] `BoundedMap` utility exists (only if needed) with its own test.
- [ ] Phase cleanup matrix is complete: every phase transition has a row, rows with reset rules are enforced in code.
- [ ] `memory-bounds.test.ts` asserts `processedActionIdsRef.size <= 500` and no provider collection grows linearly with action count. Passes for 3, 4, 5 players.
- [ ] `phase-cleanup.test.ts` covers every row in the matrix. Passes for 3, 4, 5 players.
- [ ] `subscription-stability.test.ts` asserts `subscriptions.openCount` is stable across 50 state changes. Passes for 3, 4, 5 players.
- [ ] `subscriptions.openCount` PerfStore gauge is wired.
- [ ] All existing tests pass.
- [ ] No wire format changes.
- [ ] No App.tsx structural changes (only targeted reset-effect additions if the audit found gaps).

## Handoff notes for next step (Step 5 — Aggregator + PhaseProvider)

- `phase-cleanup-matrix.md` is the single source of truth for "what resets when." When PhaseProvider is introduced in Step 5, the reset effects that currently live in App.tsx should move into the provider. The matrix tells you exactly which keys to move.
- `subscriptions.openCount` gauge will remain valid across the Step 5 changes — if Step 5 accidentally introduces a re-subscribe bug, this test will catch it.
- Any ⏭️-marked rows in the matrix are your bill of materials — Step 5 (or Step 7) must clear them before the engagement ends.
