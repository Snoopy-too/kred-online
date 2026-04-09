# Multiplayer Performance & Hardening — Design

**Date:** 2026-04-09
**Branch:** supabase-multiplayer
**Type:** Preemptive hardening pass (no specific bug — best-practices uplift)

---

## Goal

Optimize the Kred multiplayer game app to improve performance, reduce latency, eliminate latency-caused issues, and apply known best practices for online multiplayer games of this kind. This is preemptive hardening before broader playtest exposure — there are no known user-reported issues today.

## Scope decisions (from brainstorming)

- **Effort level:** Full pass + observability (option D from brainstorming).
- **Targets:** Desktop browsers, decent connections. Mobile is out of scope.
- **Player counts:** 3, 4, AND 5 player modes must continue to work (per durable user preference).
- **Migration constraints:** None raised — schema changes are on the table where useful.
- **Existing test coverage:** Substantial unit/screen/engine coverage exists; multiplayer sync path is currently untested.

## Diagnosis (current architecture observations)

The codebase already implements many of the multiplayer-game skill's core patterns: host-as-source-of-truth, dual-channel sync (broadcast + DB poll fallback), version-gated state, 100ms debounced push, action queue with dedupe, rejoin hydration. These do not need to be redesigned.

Concrete issues identified during exploration:

1. **`App.tsx` is 4,100 lines.** Centralized state ownership prevents effective memoization; every `setState` re-runs the entire component, cascading re-renders through every child.
2. **Full-state packets every push.** ~20 untyped fields broadcast and persisted on every change with no diffing.
3. **Triple guest subscription** to the same data: broadcast channel, `postgres_changes` on `kred_game_states`, and 3-second DB poll. Two of the three are redundant.
4. **Action poll fetches all actions every 2s** (`select *` with no `gt(created_at, …)`) and dedupes via an unbounded in-memory `Set` that grows linearly with game length.
5. **`window.__kred_pushState` global.** Fragile coupling between the synchronizer and the outside world; untestable.
6. **`setTimeout(0)` between every queued action** serializes N actions across N macrotasks.
7. **DB upsert on every push** with no throttling separate from broadcast — every state change persists the entire packet.
8. **No error boundaries** — a single screen throw drops the player from the lobby.

These are the cost centers Section 1's instrumentation will quantify and Sections 2–4 will address.

---

## Design overview

Five sections, ordered by dependency. Section 5 (Tests) lands before Section 3 Phase 2 to protect the riskiest work.

| # | Section | Risk | Dependency |
|---|---|---|---|
| 1 | Observability foundation | Low | None |
| 2 | Sync layer rework | Medium | Section 1 (for measurement) |
| 3 | Render performance / App.tsx breakup | High | Section 5 (for safety net) |
| 4 | Hardening & correctness | Low | None hard; benefits from Section 1 |
| 5 | Test additions (sync mock + matrix) | Lowest | None — lands first in execution |

---

## Section 1 — Observability foundation

**Goal:** make optimization targets visible before touching them. Dev-only, zero cost in production.

### What is instrumented

1. **Sync packet metrics (host-side, every push)**
   - `bytes`: `JSON.stringify(packet).length`
   - `version`: monotonic id
   - `deltaCount`: number of top-level fields that changed since last push
   - `pushReason`: which dependency triggered the push
2. **Apply-latency metrics (guest-side, every applied packet)**
   - `t_apply`: `Date.now() - packet.lastUpdated` (host send → guest apply wall-clock)
   - `channel`: `broadcast` / `postgres_changes` / `poll` / `rejoin`
   - `staleSkipped`: count of packets dropped by version gate
3. **Action queue metrics (host-side)**
   - `queueDepth` over time
   - `processedActionIds.size` (visibility on the unbounded set growing)
   - `actionLatency`: time from `created_at` to host processing
4. **Render counts (per provider / top-level component)**
   - `useRenderCount(name)` hook; visible in dev overlay

### Where the data lives

- A single in-memory `PerfStore` (plain pub/sub, no library) with capped per-series ring buffers.
- A dev-only overlay gated behind `?perf=1` URL flag or `Ctrl+Shift+P` keybinding, rendered into a corner div.
- `window.__kred_perf.dump()` for ad-hoc JSON dumps.

### Constraints

- **Zero cost when disabled.** Single `PERF_ENABLED` const defaulting to `import.meta.env.DEV`. In production builds the calls tree-shake to no-ops.
- **No external library.** Self-contained in `src/perf/`, ~150 lines total.
- **Read-side only.** No behavioral changes; instrumentation does not alter sync semantics.
- **Provider-level render counts only** — not per-leaf. Leaves get profiled in Section 3.

### Out of scope

- Persistence, alerts, thresholds, regression-fail tooling.
- Telemetry / external analytics.

---

## Section 2 — Sync layer rework

**Goal:** correct, lean, non-redundant network path. Highest value-per-line section.

### 2a. Drop redundant guest channels

Today every guest runs three subscriptions to the same data (broadcast + `postgres_changes` + 3s poll).

**Change:** keep broadcast as primary + DB poll as fallback. Drop `postgres_changes` on `kred_game_states` entirely.

- Broadcast covers the fast path (~50ms).
- Poll covers the fallback path (3s).
- `postgres_changes` is the slowest (~200–500ms) and most expensive on the Supabase side (per-row WAL decoding).
- Health detection: track last successful broadcast receipt timestamp. If >5s since the last broadcast, tighten poll interval from 3s → 1s until broadcast resumes.

### 2b. Delta packets instead of full snapshots

**New wire format:**

```ts
type StatePacket =
  | { kind: 'full',  v: number, ts: number, state: FullState }
  | { kind: 'delta', v: number, ts: number, baseV: number, patch: Partial<FullState> }
```

- **Full snapshot** sent on: rejoin hydration, phase transitions, every Nth push (heartbeat, e.g. every 20th), and whenever a guest's `baseV` is unknown.
- **Delta** is shallow per top-level field: if a field's reference changed, include it; otherwise omit. Cheap because providers already use immutable updates.
- Guest applies delta on top of current state. If `baseV` ≠ guest's last applied version, guest emits a `REQUEST_FULL` action and host responds with a fresh full snapshot.
- DB persistence (`state_json`) **always** holds a full snapshot — only the wire format changes. Rejoin and poll fallback remain simple.

**Rationale for shallow vs deep diff:** deep diffing arrays of pieces is expensive on host; shallow per-field is the 90% solution at 10% the complexity. PerfStore tells us if we need to go deeper.

### 2c. Decouple broadcast from DB persistence

Today every state change triggers both within the same 100ms debounce.

**Change:** two independent throttles:
- **Broadcast:** 100ms debounce (unchanged — fast feel).
- **DB persist:** 500ms trailing throttle, with forced flush on phase change, every Nth state, and on host unmount.

Players don't need every keystroke-level state persisted; rejoin needs "recent enough."

### 2d. Fix action poll pattern

**Today:**
```ts
const { data } = await supabase
  .from('kred_game_actions')
  .select('*')
  .eq('lobby_id', lobbyId)
  .order('created_at', { ascending: true });
```

Fetches every action ever for the lobby on every poll; dedupe set grows unbounded.

**Change:**
```ts
const lastSeenActionAtRef = useRef<string>(new Date(0).toISOString());
const { data } = await supabase
  .from('kred_game_actions')
  .select('*')
  .eq('lobby_id', lobbyId)
  .gt('created_at', lastSeenActionAtRef.current)
  .order('created_at', { ascending: true });
if (data?.length) {
  lastSeenActionAtRef.current = data[data.length - 1].created_at;
  for (const a of data) enqueueAction(a);
}
```

- Incremental query — only new actions.
- `processedActionIdsRef` becomes a bounded ring buffer (last 500 ids), enough for broadcast/poll race dedupe.
- Realtime path and poll path agree on the same watermark.

**Optional follow-up:** delete-after-applied sweep on the host. Once an action is processed and a DB persist has happened, it is safe to delete. Drops `kred_game_actions` row count to near zero in steady state.

### 2e. Kill `window.__kred_pushState`

Today GameStateSynchronizer attaches `pushState` to `window`; App.tsx calls it imperatively.

**Change:** synchronizer exposes `pushState` via a ref the parent passes in. Cleaner version (synchronizer subscribes to provider context) falls out of Section 3 for free. Section 2 ships the ref version as a tactical fix.

### 2f. Action queue serialization

**Today:**
```ts
setTimeout(() => { isProcessingQueueRef.current = false; drainQueue(); }, 0);
```

Each action takes a full macrotask. 10 queued actions ≈ 40–160ms wall-clock for React commits between them.

**Change:** use `flushSync` + `queueMicrotask` (React 19). Microtasks run before the next render frame, so:
- Each action's setState commits before the next runs (correctness preserved).
- We don't lose a full macrotask between actions (~5ms instead of ~50ms for 10 actions).
- Gated behind a const, default off, flipped on after PerfStore confirms the win. If `flushSync` causes problems with concurrent features, fallback to today's `setTimeout(_, 0)` — no regression.

### Out of scope for Section 2

- No `state_json` column shape change — wire format only.
- No action protocol redesign — same types, same payloads, same RLS.
- No App.tsx restructuring — that is Section 3.

### Risk & rollout for Section 2

| Item | Independently shippable | Risk |
|---|---|---|
| 2a (drop postgres_changes) | Yes | Low |
| 2b (delta packets) | Behind `SYNC_DELTAS` flag | Medium — ride on Section 5 sync tests |
| 2c (decouple persist) | Yes | Low |
| 2d (action poll fix) | Yes | Low |
| 2e (kill window global) | Yes | Low |
| 2f (microtask yield) | Behind feature const | Low |

---

## Section 3 — Render performance & App.tsx breakup

**Goal:** stop cascade re-renders, make memoization possible, reduce App.tsx from a 4,100-line monolith to a thin orchestrator. Highest-risk section; rolled out incrementally; protected by Section 5 tests landing first.

### 3a. Diagnosis

`App.tsx` size is the cause, not the symptom. Centralized state ownership means:
- Every `setState` re-runs the entire 4,100-line function.
- Every child receives fresh prop references → re-renders too.
- `useMemo` / `useCallback` deps change every render → memoization is a no-op.
- `getStatePacket` closes over the current render's state → must be rebuilt every render.
- React DevTools profiling is unusable because everything is "App."

The fix is to decentralize state ownership.

### 3b. Provider split

Following the multiplayer-game skill's pattern. Each provider owns one slice; consumers read selectively via custom hooks.

| Provider | Owns |
|---|---|
| LobbyProvider | lobbyId, userId, isHost, playerIndex, lobbyPlayers (already exists — keep as is) |
| PhaseProvider | gameState, currentPlayerIndex, moverPlayerIndex, campaignRole |
| RosterProvider | players, pieces |
| BoardProvider | boardTiles, bankedTiles |
| CampaignProvider | playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, tileTransaction, tileRevealed, pendingReceiverReward, receiverAdvanceInProgress |
| ChallengeProvider | bystanders, bystanderIndex, challengeOrder, currentChallengerIndex, tileRejected, takeAdvantage* |
| BureaucracyProvider | bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex |

Each provider:
- Holds its own `useState`s (moved out of `App.tsx`).
- Exposes a typed context with state + setters + small derived values.
- Provides custom hooks (`useRoster()`, `usePhase()`, …).
- Uses **separate state and dispatch contexts** when warranted, so consumers that only call setters do not re-render on state changes.

A top-level `GameStateAggregator` reads from all providers and rebuilds the sync packet on change. The aggregator is the *only* component that needs the whole world. It dovetails with Section 2b: it can directly compute "which slices changed" for delta packet construction.

### 3c. Component split

Once state ownership moves out, `App.tsx` becomes "wire providers + render the current screen." Screen components already exist under `src/components/screens` — they consume providers via hooks instead of receiving props from App.tsx.

Target structure:

```
KredApp.tsx
└── LobbyProvider
    └── (in-lobby?) GameProviders (Phase, Roster, Board, Campaign, Challenge, Bureaucracy)
        ├── GameStateSynchronizer  (reads providers, owns network)
        ├── PerfOverlay            (Section 1, dev-only)
        └── ScreenRouter           (picks screen by phase)
            ├── DraftingScreen
            ├── CampaignScreen
            ├── BureaucracyScreen
            └── ...
```

Final `App.tsx` size: ~200–400 lines. Anything larger gets split further.

### 3d. Memoization, now possible

- **Selectors:** `usePlayer(id)` returns a stable reference unless that player changed (shallow compare on top of provider).
- **Stable handlers:** factories in `src/handlers/` keyed via `useMemo` on narrower deps.
- **`React.memo` on screens** and heavy children.
- **Compare-before-set in `applyStatePacket`:** for each slice, only `setState` if the incoming reference structurally differs. Skip otherwise.

### 3e. Render-hot leaves

After the broader split, target a few specific spots:
1. **Board grid** — `React.memo` keyed on `boardTiles` + `pieces`. Container queries for sizing.
2. **Player panel** — `React.memo` keyed per player so only changed players re-render.
3. **Animation timers** — audit `useEffect` cleanup; ensure animations don't spam state setters faster than render budget.

### 3f. Phased rollout

Do not do the breakup as one PR.

1. **Land Section 5 first.** Sync test net before touching App.tsx.
2. **Phase 1 — Aggregator skeleton.** Empty `GameProviders` shell + `PhaseProvider` only. Migrate `gameState` and `currentPlayerIndex`. ~300-line diff. Proves the pattern.
3. **Phase 2 — Migrate one provider per PR.** Roster → Board → Campaign → Challenge → Bureaucracy. Each PR is independently reviewable and revertable. Tests must stay green at each step.
4. **Phase 3 — Component split.** Screens stop receiving props from App.tsx; consume providers directly.
5. **Phase 4 — Memoization pass.** PerfStore identifies which screens benefit.
6. **Phase 5 — Hot leaves.** Board grid, player panel, etc. Profiler-driven.

**At any phase the engagement can stop and ship.** The provider pattern pays dividends without requiring "completion."

### Out of scope for Section 3

- No state management library (Redux, Zustand, Jotai). React context + custom hooks are sufficient at this scale.
- No handler rewrites — factories stay; they just receive narrower deps.
- No `src/game/` changes — pure functions, already well-factored.
- No wire protocol changes — that is Section 2.

### Risk register

| Risk | Mitigation |
|---|---|
| App.tsx breakup introduces subtle state desync | Sync tests (Section 5) land first; provider migrations done one at a time |
| Memoization breaks because of unstable deps | Section 1 render counts make this immediately visible |
| Context value reference instability undoes the win | Separate state/dispatch contexts; stable setter refs via `useMemo` |
| Massive merge conflict | Each phase is a small PR; finish or pause cleanly between phases |
| 3/4/5-player modes regress | Existing tests cover this; integration tests (Section 5) parameterize across all three counts |

---

## Section 4 — Hardening & correctness

**Goal:** sweep latent correctness bugs and resource leaks. Each item is independent and additive.

### 4a. Bounded memory audit

Systematic audit of every long-lived ref/Map/Set in the multiplayer path:
- `processedActionIdsRef` → ring buffer (already covered by 2d).
- `lastSeenActionAtRef` → single string, acceptable.
- Timer/interval refs → confirm cleanup on unmount.
- Entity-keyed Maps in providers → confirm dead entities are not retained after phase transitions.

**Acceptance test:** play one hour via the existing playtest script; assert `processedActionIdsRef.size <= 500` and no provider Map exceeds `players.length * pieces_per_player + tile_count`.

### 4b. Cleanup on phase change

For each provider, define a "phase entry reset rules" matrix:
- What state must be reset on entry to phase X?
- Which timers / pending flags must be hard-reset?
- Are there `kred_game_actions` rows from previous phases that should be swept? (2d's optional delete-after-applied makes this nearly automatic.)
- Do animation timers from the previous phase clean up on phase change, not just on unmount?

Deliverable: a small per-provider table of reset rules + the code to enforce them.

### 4c. Two-layer validation audit

Each handler in `src/handlers/` (gameFlowHandlers, pieceMovementHandlers, tilePlayHandlers, challengeFlowHandlers, turnHandlers) must do:
1. **Receipt validation** — types, ranges, required fields when an action arrives.
2. **Execution validation** — re-check against current state at process time, since state may have changed between send and process.

Specific concerns:
- `MOVE_PIECE`: re-check piece exists, belongs to claimed player, is at claimed source, destination still legal at process time.
- `PLAY_TILE`: re-check player still owns tile, target still valid, no concurrent action invalidated the play.
- `END_TURN`: re-check it is actually that player's turn (concurrent end-turn race).
- `BUREAUCRACY_PURCHASE`: re-check funds and item availability.

**Tooling:** add `validateAction(action, currentState): ValidationResult` per action type, called from the handler before mutation. Failed validation logs to PerfStore for visibility (rather than throwing or showing a toast — visibility without disruption).

### 4d. Reconnect / version edge cases

- **Host reconnect with stale version counter.** On host rejoin, hydrate `hostVersionRef` from the DB row's `version`. The current code partially does this for both host and guest indiscriminately — make it explicit.
- **Guest receives delta with unknown `baseV`.** Guest emits `REQUEST_FULL`; host responds with full snapshot.
- **Broadcast + poll deliver same packet.** Version gate handles it; PerfStore confirms `staleSkipped` counter is non-zero in normal play.
- **Two guests rejoin simultaneously.** Guard the rejoin hydrate behind a `hasHydrated` ref so it doesn't race the normal subscribe path.
- **Network drop during host's DB persist.** Add retry with backoff (3 attempts, 100ms / 500ms / 2s) and a PerfStore counter for `dbPersistRetries`.

### 4e. Anti-double-submit & UI guardrails

Audit every action-emitting button across `src/components/screens`:
- Does it have an `isProcessing` guard?
- Are confirmation gates present on destructive/expensive actions?
- Are `disabled` states correct during animation phases (`flipping`, `bellPause`, equivalents in Kred)?

Checklist pass, not a redesign. Easy wins, low risk.

### 4f. Subscription stability audit

Per the multiplayer-game skill: never put mutable state in subscription deps. The current `GameStateSynchronizer` looks correct; verify after Section 3 that no new provider re-subscribes on every state change.

**Acceptance test:** start a game, play through one full phase; assert subscription open counter is exactly `1` for each channel for the lifetime of the lobby session.

### 4g. Error boundaries

Currently no React error boundaries exist. A single screen throw drops the player from the lobby — worst possible UX for a multiplayer game.

- **Top-level error boundary** in `KredApp.tsx`: shows "Something went wrong, rejoining…" and triggers the rejoin flow automatically.
- **Per-screen error boundary**: contains blast radius to one screen, offers "retry" button.

Small, high-value, no architectural cost.

### Out of scope for Section 4

- Server-side validation. RLS already provides table-level guarantees; deeper game-logic validation belongs to the host (correct in this architecture).
- Action protocol changes. Same actions, same payloads, same RLS — just better validation and cleanup around them.
- Monitoring/alerting on top of PerfStore — separate (small) project if desired later.

### Order suggestion for Section 4

4a → 4b → 4f (cleanup) → 4c (validation) → 4d → 4g (resilience). 4e drops in alongside whichever screen Section 3 happens to be touching.

---

## Section 5 — Test additions

**Goal:** build the regression net that protects Section 3's risky breakup, and codify the multiplayer behaviors that aren't currently tested. **Lands before Section 3 Phase 2.**

### 5a. Coverage gap

Currently covered: game logic, engine + invariants, hooks, screens.

**Missing:**
1. Anything that exercises the host↔guest sync path. All current tests are single-process.
2. Action emit → broadcast → apply round-trips.
3. Reconnect/rejoin behavior.
4. 3/4/5-player parameterization at the integration level.

### 5b. Two test layers

**Layer 1 — In-process sync simulation (Vitest).** Mock Supabase with an in-memory bus. Two `useGame` instances in the same test process — one host, one guest — share the bus. No browser, no real Supabase. Fast (<100ms per test).

**What it catches:**
- Action round-trip correctness
- Version gate behavior
- Delta packet apply correctness
- Deduplication
- Phase transition cleanup
- Validation rejections

**What it doesn't catch:** real network timing, real Supabase realtime quirks, browser rendering bugs.

**Layer 2 — End-to-end with two browser contexts (Playwright). SCOPED OUT.** Real Supabase, two contexts, slow, brittle. Not justified for a desktop-only preemptive hardening pass. Can be added later as its own project.

### 5c. Layer 1 test matrix (minimum set)

**Sync correctness:**
1. Host creates lobby → guest joins → both see same initial state.
2. Guest emits `MOVE_PIECE` → host processes → guest state matches host.
3. Two guests emit different actions concurrently → host serializes → both guests converge.
4. Host pushes 10 deltas → guest applies in order → final state matches a full snapshot.
5. Guest receives delta with unknown `baseV` → requests full → recovers.
6. Host pushes same version twice (broadcast + poll) → guest applies once.
7. Action with stale data (e.g., piece no longer exists) → execution validation rejects → state unchanged.

**Phase transitions:**
8. Drafting → Campaign: stale draft actions don't bleed in.
9. Campaign → Bureaucracy: pending tile transactions cleaned up.
10. Bureaucracy → next round: bureaucracy state reset.
11. End of game: lobby marked completed; no further actions accepted.

**Reconnect / rejoin:**
12. Guest disconnects mid-campaign → reconnects → state hydrates from DB → matches host.
13. Host crashes mid-campaign → restarts → version counter resumes from DB → guests don't reject post-rejoin pushes as stale.
14. Guest rejoins after delta gap → requests full → recovers.
15. Guest joins as spectator → receives full state → gets subsequent updates.

**Player count coverage:**
16. Tests 1–15 parameterized over `[3, 4, 5]` players.

**Memory bounds:**
17. Play 200 actions; assert `processedActionIdsRef.size <= 500`.
18. Play 200 actions; assert no provider Map has stale entities.

**Action queue:**
19. Enqueue 10 actions in a burst → all processed in order → no state lost.

### 5d. Mock Supabase contract

Lives at `src/__tests__/helpers/mockSupabase.ts`. Opted into per test file (existing unit tests unaffected).

- `supabase.channel(name).on('broadcast', ...).subscribe()` — delivers `.send()` to other subscribers on the same channel name.
- `supabase.channel(name).on('postgres_changes', { table }, ...)` — fires when in-memory table is mutated.
- `supabase.from(table).insert/upsert/select/update/delete` — operates on in-memory tables.
- Optional latency injection: `mockBus.setLatency(50)`.
- Optional drop rate injection: `mockBus.setDropRate(0.1)` for testing poll-fallback recovery.

### 5e. Test helpers

```ts
const { host, guests } = await createMultiplayerScenario({ playerCount: 4 });
await guests[1].emit('MOVE_PIECE', { pieceId, position, location });
await waitForConvergence([host, ...guests]);
expect(host.state).toMatchSnapshot();
for (const g of guests) expect(g.state).toEqual(host.state);
```

These helpers turn the test matrix from "10 hours of plumbing" into "1 hour of writing assertions."

### 5f. CI integration

- Layer 1 runs in `npm test` with existing Vitest setup. No new infra.
- Add `npm run test:multiplayer` script for fast iteration during Section 3 work.

### Out of scope for Section 5

- Playwright / E2E (Layer 2).
- Load testing (not relevant for 3–5 player desktop game).
- Action payload fuzzing (engine invariant tests already cover much of this).
- Tests against real Supabase (Layer 2's job).

### Rollout

- Lowest risk of any section — pure additions.
- The mock + helpers + baseline tests land **first** in execution order (step 1) so Section 3 has a net before Phase 2.
- The full matrix is built **incrementally**, not as a single batch: each later step adds the matrix entries that cover the behavior it ships. See "Execution order" below for the per-step mapping.

---

## Execution order

This ordering accounts for safety nets and dependency chains. It is **not** the order the design sections appear above.

**Test coverage rule:** sync tests are added incrementally as their target features ship — every step that introduces new behavior also adds the matrix entries that cover it. The matrix in Section 5c is the *target end state*, not a single batch.

1. **Section 5a–5b, 5d–5e** — Sync test mock + helpers + ~10 baseline tests covering today's behavior (matrix items 1, 2, 3, 6, 8, 9, 10, 11, 16, 19). This is the regression net for steps 2–4.
2. **Section 1** — PerfStore + dev overlay. Enables measuring everything that follows.
3. **Section 2a, 2c, 2d, 2e** — Sync layer fixes that don't depend on Section 3. Independently shippable. **Add matrix items 17, 18** when 2d's ring buffer lands.
4. **Section 4a, 4b, 4f** — Cleanup audits. **Add per-provider phase-cleanup matrix entries** (extensions of items 8–10) as 4b ships.
5. **Section 3 Phase 1** — Aggregator skeleton + PhaseProvider migration. Existing baseline tests must stay green.
6. **Section 2b, 2f** — Delta packets + microtask yield. Dovetail with Section 3 Phase 1's aggregator. **Add matrix items 4, 5** with 2b. **Add a microtask-yield correctness test** with 2f (extends item 19 with interleaved-state ordering assertions).
7. **Section 3 Phases 2–5** — Provider migrations, component split, memoization pass, hot leaves. One provider per PR.
8. **Section 4c, 4d, 4g** — Validation audit, reconnect edge cases, error boundaries. **Add matrix items 7, 12, 13, 14, 15** as 4c/4d ship.
9. **Section 4e** — UI guardrails checklist, rides along with whichever screen is being touched.

The engagement can stop after **any** numbered step and the game will be in a better state than today. At every stop point, the test matrix covers everything that has shipped to that point — never less.

## Acceptance criteria (overall)

- PerfStore overlay renders without errors in dev; no measurable cost in production builds.
- Sync mock + helpers exist; baseline 10 tests pass.
- `kred_game_actions` poll fetches incrementally; `processedActionIdsRef.size` is bounded.
- Guest establishes only the broadcast channel + poll fallback (no `postgres_changes` on `kred_game_states`).
- Delta packets on the wire; full snapshot in DB; sync test matrix verifies round-trip equivalence.
- `App.tsx` shrinks to ≤500 lines (or the engagement explicitly stops mid-Section-3 with a documented checkpoint).
- All existing tests pass.
- Sync test matrix passes for 3, 4, AND 5 player counts.
- Top-level + per-screen error boundaries exist; auto-rejoin on top-level catch.
- No new Supabase schema migrations are required (delete-after-applied sweep is optional).

## What this design explicitly does NOT do

- No mobile / touch / responsive optimization.
- No state library introduction.
- No Playwright / E2E layer.
- No server-side game logic (RLS only).
- No telemetry / external analytics.
- No protocol/action redesign.
- No `src/game/` (pure logic) changes.
- No load testing.
- No live-deployment migration (none required).

## Open items deferred to implementation planning

- Exact `PerfStore` API shape (pub/sub vs zustand-style — pick during writing-plans).
- Exact ring buffer size for `processedActionIdsRef` (500 is a starting estimate; PerfStore data may justify changing it).
- Exact heartbeat interval `N` for forcing full snapshots (every 20th push is a starting estimate).
- Whether to ship the optional delete-after-applied sweep (2d) in this engagement or defer.
- Whether per-provider state/dispatch context split is applied uniformly or only where the render-count metrics justify it.

These are tactical choices that should be made when writing the implementation plan, with input from the data the early sections produce.
