# Multiplayer Performance & Hardening — Progress Report

**Status:** Steps 1–4 complete | Steps 5–9 pending

**Branch:** `supabase-multiplayer` (Steps 3–4 landed directly on this branch; the `perf-hardening` worktree was used for Steps 1–2)

**Last Updated:** 2026-04-15

---

## Completed Steps

### Step 1: Sync Test Mock + Baseline Tests ✅
**Status:** DONE (25 tests passing)

**Deliverables:**
- `src/__tests__/helpers/mockSupabase.ts` — In-memory Supabase double (271 lines, budget 350)
  - Auth: `signInAnonymously()`, `getSession()`
  - Tables: `insert()`, `select()`, `upsert()`, `update()`, `delete()`
  - Queries: `eq()`, `neq()`, `gt()`, `order()`, `limit()`, `single()`
  - Channels: broadcast and postgres_changes pub/sub
  - Subscribe/unsubscribe lifecycle

- `src/__tests__/helpers/multiplayerScenario.ts` — Scenario builder (177 lines, budget 250)
  - Creates N-player games (3, 4, 5 players)
  - Host and guest client handles with proper routing
  - Action emission for all player types
  - `waitForConvergence()` helper for deterministic state sync

- `src/__tests__/sync/baseline.test.ts` — Baseline tests covering matrix items #1, #2, #3, #6, #8, #9, #10, #11, #16, #19
  - 12 tests covering all 10 baseline matrix items
  - All player counts [3, 4, 5] parameterized
  - Tests pass: 25/25 across 3 test files

**Commits:**
- `test: scaffold mockSupabase skeleton`
- `test: implement mockSupabase table operations`
- `test: implement mockSupabase channel pub/sub`
- `test: add multiplayer scenario builder`
- `test: add baseline sync tests`

**Impact:** Regression net in place. All subsequent steps protected by baseline test matrix.

---

### Step 2: PerfStore + Dev Overlay ✅
**Status:** DONE (27 tests passing, production build tree-shaken)

**Deliverables:**
- `src/perf/index.ts` — Module entry with types and PERF_ENABLED gate (80 lines, budget 80)
  - Single `PERF_ENABLED` constant = `import.meta.env.DEV` (literal, tree-shakeable)
  - Type exports: `MetricKind`, `MetricSample`, `MetricSeries`
  - Public API barrel

- `src/perf/PerfStore.ts` — Pub/sub store with ring buffers (139 lines, budget 200)
  - Ring buffer FIFO with 256-sample cap per metric
  - Pub/sub notification system for real-time updates
  - Counter tracking (monotonic integers)
  - `getSeries()`, `getCounter()`, `listSeriesNames()`, `listCounterNames()`
  - `subscribe()` with unsubscribe return
  - `dump()` for debugging via `window.__kred_perf.dump()`

- `src/perf/hooks.ts` — Writer + reader hooks (116 lines, budget 120)
  - `recordMetric(name, v, tags)` — Records numeric sample, no-op when disabled
  - `incrementCounter(name, by)` — Increments counter, no-op when disabled
  - `useRenderCount(name)` — Tracks render count per component
  - `usePerfSeries(name)` — Subscribe to series, re-render on change
  - `usePerfCounter(name)` — Subscribe to counter, re-render on change

- `src/perf/PerfOverlay.tsx` — Dev-only React component (200 lines, budget 250)
  - Fixed-position bottom-right panel (inline styles)
  - Activation: `?perf=1` URL param OR `Ctrl+Shift+P` keybinding
  - Auto-discovery of all metrics in store
  - Shows last value + running average for series
  - Shows current count for counters
  - Renders nothing when `PERF_ENABLED=false` (production)
  - Exposes `window.__kred_perf = { dump(), clear(), store }`
  - Polls every 500ms for new metrics

- `src/KredApp.tsx` (modified) — Mounted `<PerfOverlay />` as top-level sibling

- `src/components/GameStateSynchronizer.tsx` (modified) — One representative metric
  - Added: `recordMetric("packet.bytes", JSON.stringify(packet).length)`
  - Added: `recordMetric("packet.version", packet.stateVersion)`

**Test Coverage:**
- 3 tests in `src/perf/__tests__/index.test.ts` — module exports
- 14 tests in `src/perf/__tests__/PerfStore.test.ts` — store behavior
- 10 tests in `src/perf/__tests__/hooks.test.tsx` — hook integration
- Total: 27/27 passing

**Production Build:**
- Bundle size: 677.50 kB (minified), 193.27 kB (gzip)
- Perf code: **successfully tree-shaken away** (zero cost)
- Verified: No `PerfOverlay`, `recordMetric`, `incrementCounter`, or `usePerfSeries` in dist/assets/

**Commits:**
- `perf: add module entry with PERF_ENABLED gate`
- `perf: implement PerfStore with ring buffers and pub/sub`
- `perf: add writer + reader hooks for metrics`
- `perf: add dev-only PerfOverlay component`
- `perf: mount PerfOverlay in KredApp`
- `perf: instrument host pushState with packet bytes + version metrics`

**Impact:** Observability layer ready. Steps 3, 5, 6, 7 will add more metric calls as features ship.

---

### Step 3: Sync Layer Fixes ✅
**Status:** DONE (54 sync tests passing end of Step 4 run)

**Deliverables (all on `supabase-multiplayer`):**
- **2a** — Dropped the redundant `postgres_changes` subscription on `kred_game_states`; guests now rely on broadcast + adaptive poll only.
- **2a** — Adaptive guest poll backoff based on broadcast health.
- **2c** — Decoupled broadcast (100 ms debounce) from DB persist (500 ms throttle) with forced flush on phase change.
- **2d** — Incremental action poll via `gt(created_at)` watermark.
- **2d** — `processedActionIdsRef` bounded to a 500-item ring buffer (`BoundedActionIdSet`).
- **2e** — Removed `window.__kred_pushState`; replaced with `pushStateRef` prop wired from `KredApp`.
- Instrumentation: `recordMetric('apply.latency', …)`, `persist.writes/errors`, `actions.queueDepth`, `actions.processedSet.size`, `packet.bytes`, `packet.version`.

**Commits (supabase-multiplayer):** `2fc547d`, `c630019`, `b73f754`, `e0d3fab`, `d5da043`, `47019e6`, `24360c6`.

---

### Step 4: Cleanup Audits ✅
**Status:** DONE (54/54 sync tests passing; pre-existing UI/screen failures unrelated to Step 4 remain)

**Deliverables:**
- `docs/superpowers/phase-cleanup-matrix.md` — Full inventory of long-lived refs/state across `GameStateSynchronizer.tsx`, `App.tsx`, hooks, and contexts; every row ✅ bounded (natural, ring, or single-slot). Phase-transition table covers every reachable transition in a normal game with the reset keys each one owns.
- `src/__tests__/sync/memory-bounds.test.ts` (10 tests) — Asserts `BoundedActionIdSet(500)` plateaus at the cap under 200 and 600 actions, parameterized across 3/4/5 players. Exports `BoundedActionIdSet` from `GameStateSynchronizer.tsx` so production + test share the same class.
- `src/__tests__/sync/phase-cleanup.test.ts` (18 tests) — Exercises the real hook reset functions (`useTilePlayWorkflow.resetForNewTurn`/`completeTilePlay`, `useChallengeFlow.closeTakeAdvantage`/`closeChallengeReveal`, `useBureaucracy.startBureaucracyPhase`) for every matrix row with a non-empty "state to reset" column. Parameterized across 3/4/5 players.
- `src/__tests__/sync/subscription-stability.test.ts` (8 tests) — Asserts `subscriptions.openCount` gauge is stable across 50+ state changes and never drifts on subscribe/cleanup ping-pong. Parameterized across 3/4/5 players.
- `src/perf/hooks.ts` — Added `setGauge(name, updater)` + `readGauge(name)` on top of the existing counter/series API (13 lines). Re-exported from `src/perf/index.ts`.
- `src/components/GameStateSynchronizer.tsx` — Wired `setGauge('subscriptions.openCount', c => c ± 1)` into every subscribe + cleanup path (broadcast channel + actions realtime channel).

**Real bug fixed in §4f audit:** `KredApp.tsx` passes `applyStatePacket`, `getStatePacket`, and `onRejoinComplete` to `GameStateSynchronizer` as inline arrow functions. Those callbacks were previously in the subscribe/poll/rejoin `useEffect` dep arrays, so every `KredApp` render torn down and reopened the Supabase broadcast channel — a re-subscribe storm proportional to parent render frequency. Fix: capture each callback in a ref (`applyStatePacketRef`, `getStatePacketRef`, `onRejoinCompleteRef`) updated in its own tiny effect, and drop the callbacks from the subscribe effects' dep arrays. The subscribe effects now depend on `[lobbyId, isHost]` only. The `subscription-stability` tests guard against regression.

**Task 3 (`BoundedMap`) skipped:** the §4a audit found every long-lived collection naturally or explicitly bounded, so the plan's "only if needed" gate applied — no generic `BoundedMap` utility was added.

**Commits (supabase-multiplayer):**
- `bd14084` — docs: record memory bounds audit decisions
- `66e0faf` — docs: add phase-cleanup rules matrix
- `efbbba6` — test: assert multiplayer state collections are bounded (spec matrix #17, #18)
- `1d5a8da` — test: phase-change cleanup rules per matrix (spec §4b)
- `9754553` — test: assert subscription open count is stable across state changes (spec §4f)
- `9946d42` — docs: finalize phase cleanup matrix statuses

**Remaining for user (Task 8 Step 2, dev smoke test):**
Run `npm run dev`, create a lobby for each of 3/4/5 players, walk through drafting → campaign → bureaucracy → round end, open the Perf Overlay with `?perf=1`, and confirm `subscriptions.openCount` stays at baseline throughout. (Manual verification — not driveable from the agent.)

---

## Pending Steps

### Step 5: Aggregator + PhaseProvider ⏳
**Status:** PENDING. Source of truth for reset rules is `docs/superpowers/phase-cleanup-matrix.md`. When the `PhaseProvider` lands, the reset effects currently living in hook reset methods should move into the provider; the phase-cleanup tests in `src/__tests__/sync/phase-cleanup.test.ts` should then be re-pointed at the new owner and stay green.

### Step 6: Delta Packets + Microtask Yield ⏳
**Status:** PENDING

### Step 7: Provider Migrations + App.tsx Breakup ⏳
**Status:** PENDING

### Step 8: Validation + Reconnect + Error Boundaries ⏳
**Status:** PENDING. Covers spec §4c, §4d, §4g — explicitly deferred by Step 4.

### Step 9: UI Guardrails ⏳
**Status:** PENDING

**Expected Deliverables:**
- Sweep UI buttons for double-submit, confirmation, disabled-state issues
- Spec section: 4e

---

## Test Baseline

**Overall Test Results:**
- Pre-existing failures: 121 failed, 914 passed (from `npm test -- --run` at worktree setup)
- New tests in Step 1: 25 tests, all passing
- New tests in Step 2: 27 tests, all passing
- **No regressions** in existing test suite

**Sync Test Matrix Coverage:**
All 10 baseline items implemented in Step 1:
1. ✅ Host + guest see same initial state
2. ✅ Guest MOVE_PIECE round-trip
3. ✅ Concurrent actions converge
6. ✅ Same version (broadcast + poll) applied once
8. ✅ Drafting → Campaign stale cleanup
9. ✅ Campaign → Bureaucracy pending cleanup
10. ✅ Bureaucracy → round reset
11. ✅ Game over: no further actions
16. ✅ Player count parameterization [3, 4, 5]
19. ✅ 10-action burst in order

---

## Architecture Snapshot

### Worktree Setup
- Location: `C:\xampp\htdocs\kred\.worktrees\perf-hardening`
- Branch: `perf-hardening` (based on supabase-multiplayer)
- .gitignore: Added `.worktrees` to ignore list

### Code Quality
- **Production code touched:** 491 lines across 4 files
  - `src/perf/` module (new): 455 lines
  - `src/KredApp.tsx` (modified): 1 line (import)
  - `src/components/GameStateSynchronizer.tsx` (modified): 2 lines (metric calls)
- **Test code added:** 299 lines across 3 files
  - `src/__tests__/helpers/`: 245 lines
  - `src/__tests__/sync/`: 42 lines
  - `src/perf/__tests__/`: 299 lines
- **All files:** Within 500-line budget per file

### User Invariants Maintained
- ✅ All player modes (3, 4, 5) supported in all tests
- ✅ No schema changes to `kred_lobbies`, `kred_players`, `kred_game_states`, `kred_game_actions`
- ✅ Host remains source of truth
- ✅ Wire format backward-compatible (delta packets ship in Step 6)
- ✅ Instrumentation dev-only (zero prod cost when disabled)

---

## Next Steps

**For user review:**
1. Verify Step 1 baseline tests capture the right scenarios
2. Verify Step 2 overlay works as expected in dev
3. Proceed with Steps 4 and 9 (cleanup audits and UI guardrails)

**Remaining work:**
- Step 3: Sync layer fixes (Opus 4.6) — depends on Step 1 baseline tests
- Step 5: Aggregator + PhaseProvider (Opus 4.6)
- Step 6: Delta packets + microtask yield (Opus 4.6)
- Step 7: Provider migrations + App.tsx breakup (mixed)
- Step 8: Validation + reconnect + error boundaries (mixed)

---

## Handoff Notes

- **PerfStore API is stable.** Steps 3, 5, 6, 7 will add metric calls in this style: `recordMetric("metric.name", value, { tags })` and `incrementCounter("counter.name", by)`.
- **Baseline sync tests are the regression net.** All changes after Step 1 must keep these tests green.
- **Production builds are clean.** Verified no perf code in dist/assets/. Safe to ship.
