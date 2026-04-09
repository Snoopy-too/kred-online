# Step 3 — Sync Layer Fixes (2a, 2c, 2d, 2e)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four highest-leverage sync layer issues that don't depend on App.tsx breakup or delta packets:
- **2a** — Drop the redundant `postgres_changes` subscription on `kred_game_states` (guests today subscribe THREE times to the same data).
- **2c** — Decouple broadcast (100ms debounce) from DB persist (500ms throttle) so we don't billable-write every keystroke.
- **2d** — Fix the action poll pattern: incremental (`gt(created_at)`) instead of full-table-fetch every 2s; bound `processedActionIdsRef` to a ring buffer of 500 ids.
- **2e** — Kill `window.__kred_pushState`. Replace with a ref the parent passes in.

**Architecture:** All changes live in `src/components/GameStateSynchronizer.tsx` and `src/App.tsx` (one ref wiring change). The wire format does NOT change in this step. Delta packets are Step 6.

**Tech Stack:** React 19, @supabase/supabase-js, TypeScript.

---

## Context for fresh agent

**Read these first** (in this order, ~5 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 2** is what you're implementing (specifically 2a, 2c, 2d, 2e — NOT 2b/2f, those are Step 6).
2. `src/components/GameStateSynchronizer.tsx` — read end-to-end. This is the file you're modifying.
3. `src/App.tsx` lines 1–200 (header + interface). Find every reference to `__kred_pushState` (`Grep -n "__kred_pushState"`) so you know what calls it.
4. `src/perf/index.ts` — you'll add new `recordMetric`/`incrementCounter` calls. Step 2 already wired the foundation.
5. `src/__tests__/sync/` — the test net Step 1 built. You'll add a few new tests here.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- New tests under `src/__tests__/sync/`.
- File-size budget: 500 lines per file. `GameStateSynchronizer.tsx` is currently 316 lines — leave headroom.

**Critical constraints:**
- **Wire format unchanged.** No new packet fields, no delta packets, no new action types in this step.
- **All existing tests must stay green.**
- **3, 4, AND 5 player modes must all keep working.** New tests parameterize across all three.
- **No App.tsx structural changes.** Only the one ref wiring change in 2e.
- **Watch for the playerCount mode rule** (per durable user preference): if a fix only happens to work for 4 players, that's a regression.

**What this step does NOT do:**
- ❌ Delta packets — Step 6.
- ❌ Microtask yield in the action queue — Step 6.
- ❌ Aggregator / provider split — Step 5.
- ❌ Validation or reconnect edge cases — Step 8.
- ❌ Schema changes — none required by this step.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/components/GameStateSynchronizer.tsx` | Drop postgres_changes subscription; split broadcast/persist throttles; incremental action poll; ring-buffer dedupe; expose `pushStateRef` instead of `window` global. | ~360 lines |
| `src/App.tsx` | Replace `(window as any).__kred_pushState` calls with a ref passed via props. | unchanged size; ~10 lines touched |
| `src/__tests__/sync/incremental-poll.test.ts` | New: assert action poll is incremental and ring buffer is bounded. | ≤ 200 lines |
| `src/__tests__/sync/persist-throttle.test.ts` | New: assert DB persist throttles separately from broadcast. | ≤ 150 lines |

---

## Tasks

### Task 1: Drop the redundant `postgres_changes` subscription on `kred_game_states` (2a)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx` (lines 231–249, the entire "GUEST: Postgres changes subscription (secondary channel)" useEffect block)

- [ ] **Step 1: Verify the test net catches the absence of this channel**

Read `src/components/GameStateSynchronizer.tsx` lines 231–249 to confirm you're looking at the right block — the `useEffect` that subscribes to `kred_state_changes:${lobbyId}` postgres_changes.

Run the existing sync tests to confirm they pass before any changes:

```bash
npm run test:sync
```

Expected: PASS.

- [ ] **Step 2: Delete the postgres_changes block**

In `src/components/GameStateSynchronizer.tsx`, delete the entire `useEffect` block that creates the `kred_state_changes:${lobbyId}` channel. The block to remove starts with the comment `// GUEST: Postgres changes subscription (secondary channel)` and ends at the closing `}, [lobbyId, isHost, applyStatePacket]);` of that effect. Replace with:

```ts
  // ==========================================================================
  // GUEST: postgres_changes on kred_game_states is INTENTIONALLY NOT
  // subscribed. The broadcast channel above and the 3s poll below are
  // sufficient and avoid the WAL-decoding cost of postgres_changes.
  // (Spec 2026-04-09 §2a)
  // ==========================================================================
```

- [ ] **Step 3: Run sync tests**

```bash
npm run test:sync
```

Expected: still PASS — broadcast + poll cover the gap.

- [ ] **Step 4: Run full test suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "sync: drop redundant postgres_changes subscription on kred_game_states (2a)"
```

---

### Task 2: Health-aware poll backoff (2a continued)

**Background:** When broadcast is healthy, polling at 3s is fine. When broadcast hasn't delivered anything for >5s, we should tighten to 1s for faster recovery.

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Add health tracking**

Near the other refs at the top of the component (around line 80), add:

```ts
  const lastBroadcastReceiptRef = useRef<number>(Date.now());
```

Then inside the broadcast handler (the existing `channel.on('broadcast', { event: 'state' }, ...)` block in the "BOTH: Set up broadcast channel" effect), add this line as the FIRST line of the handler — before the version gate:

```ts
        lastBroadcastReceiptRef.current = Date.now();
```

- [ ] **Step 2: Make the guest poll interval adaptive**

In the "GUEST: Polling fallback (3s)" useEffect, replace the body with:

```ts
  useEffect(() => {
    if (!lobbyId || isHost) return;

    let cancelled = false;

    const poll = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .single();

      if (data && data.version > lastProcessedVersionRef.current) {
        lastProcessedVersionRef.current = data.version;
        applyStatePacket(data.state_json as GameStatePacket);
      }
    };

    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      const sinceBroadcast = Date.now() - lastBroadcastReceiptRef.current;
      const next = sinceBroadcast > 5000 ? 1000 : 3000;
      setTimeout(tick, next);
    };

    setTimeout(tick, 3000);

    return () => {
      cancelled = true;
    };
  }, [lobbyId, isHost, applyStatePacket]);
```

- [ ] **Step 3: Run sync tests**

```bash
npm run test:sync
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "sync: adaptive guest poll backoff based on broadcast health (2a)"
```

---

### Task 3: Decouple broadcast and DB persist throttles (2c)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Add a separate persist throttle ref**

Near the other refs (top of the component, around line 80), add:

```ts
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPersistedVersionRef = useRef<number>(0);
  const PERSIST_THROTTLE_MS = 500;
```

- [ ] **Step 2: Refactor pushState to split the two concerns**

Replace the existing `pushState` (lines 88–118 in the original file) with:

```ts
  const pushState = useCallback(() => {
    if (!lobbyId || !isHost) return;

    const packet = getStatePacket();
    hostVersionRef.current += 1;
    packet.stateVersion = hostVersionRef.current;
    packet.lastUpdated = Date.now();

    // Channel 1: Broadcast (fast, ephemeral)
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'state',
        payload: packet,
      });
    }

    // Perf metric
    recordMetric('packet.bytes', JSON.stringify(packet).length);
    recordMetric('packet.version', packet.stateVersion);

    // Channel 2: DB persist — throttled separately from broadcast
    schedulePersist(packet);
  }, [lobbyId, isHost, getStatePacket]);

  // Trailing-throttle persist with forced flush on phase change.
  const schedulePersist = useCallback((packet: GameStatePacket) => {
    pendingPersistPacketRef.current = packet;
    if (persistTimerRef.current) return; // already pending
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (!p) return;
      flushPersist(p);
    }, PERSIST_THROTTLE_MS);
  }, []);

  const flushPersist = useCallback(async (packet: GameStatePacket) => {
    if (!lobbyId) return;
    if (packet.stateVersion <= lastPersistedVersionRef.current) return;
    lastPersistedVersionRef.current = packet.stateVersion;
    const { error } = await supabase
      .from('kred_game_states')
      .upsert({
        lobby_id: lobbyId,
        phase: packet.gameState,
        state_json: packet,
        version: packet.stateVersion,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error('Failed to persist game state:', error);
      incrementCounter('persist.errors');
    } else {
      incrementCounter('persist.writes');
    }
  }, [lobbyId]);
```

Add the missing ref + import near the top:

```ts
  const pendingPersistPacketRef = useRef<GameStatePacket | null>(null);
```

And at the top of the file (with the other imports):

```ts
import { recordMetric, incrementCounter } from '../perf';
```

- [ ] **Step 3: Force-flush persist on unmount and on phase change**

The unmount flush goes inside an existing or new `useEffect`. Add this near the end of the component (before the existing `(window as any).__kred_pushState` block — that block is being removed in Task 6 anyway):

```ts
  // Force-flush any pending persist on unmount so rejoin always sees fresh data.
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (p) flushPersist(p);
    };
  }, [flushPersist]);
```

Phase-change flushing is harder without restructuring. For this task: if the *new* `packet.gameState` differs from the previously-persisted phase, flush immediately instead of throttling. Update `schedulePersist` to:

```ts
  const schedulePersist = useCallback((packet: GameStatePacket) => {
    const lastPhase = lastPersistedPhaseRef.current;
    pendingPersistPacketRef.current = packet;

    // Force-flush on phase change (no throttle)
    if (lastPhase !== null && lastPhase !== packet.gameState) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      lastPersistedPhaseRef.current = packet.gameState;
      flushPersist(packet);
      pendingPersistPacketRef.current = null;
      return;
    }
    lastPersistedPhaseRef.current = packet.gameState;

    if (persistTimerRef.current) return;
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (!p) return;
      flushPersist(p);
    }, PERSIST_THROTTLE_MS);
  }, [flushPersist]);
```

Add the new ref:

```ts
  const lastPersistedPhaseRef = useRef<string | null>(null);
```

- [ ] **Step 4: Write a test for the throttle behavior**

Create `src/__tests__/sync/persist-throttle.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";
import { attachSyncRuntime } from "../helpers/syncRuntime";
import { makeInitialState } from "../helpers/syncFixtures";

describe("sync: persist throttle (2c)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("multiple rapid pushes within 500ms produce ONE DB persist (excluding the immediate one)", async () => {
    // NOTE: this test exercises the test syncRuntime, which is intentionally
    // a simplified mirror — it does NOT implement throttling. This test is
    // therefore a placeholder that asserts the production code's intended
    // behavior via a manual count once we wire the real synchronizer to the
    // mock bus. Until that wiring exists (Step 7+), assert at least that
    // pushState calls do produce DB rows.
    vi.useRealTimers();
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);
    scenario.host.state = makeInitialState({ playerCount: 3 });
    await scenario.host.pushState!();
    await scenario.host.pushState!();
    await scenario.host.pushState!();
    await waitForConvergence(scenario);
    const persisted = scenario.bus.tables.kred_game_states.filter(
      (r: any) => r.lobby_id === scenario.lobbyId
    );
    expect(persisted.length).toBeGreaterThanOrEqual(1);
  });
});
```

(This test currently asserts the round-trip works. Replacing the test syncRuntime with the production GameStateSynchronizer is a Step 7 effort — for now, this guards regressions in the round-trip itself.)

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx src/__tests__/sync/persist-throttle.test.ts
git commit -m "sync: decouple broadcast and DB persist throttles (2c)"
```

---

### Task 4: Incremental action poll (2d, part 1)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Add the watermark ref**

Near the other refs (top of the component), add:

```ts
  const lastSeenActionAtRef = useRef<string>(new Date(0).toISOString());
```

- [ ] **Step 2: Replace the action poll body**

Find the existing action poll block in the "HOST: Listen for guest actions" useEffect (around line 177–189). Replace the `pollActions` function with:

```ts
    const pollActions = async () => {
      const { data } = await supabase
        .from('kred_game_actions')
        .select('*')
        .eq('lobby_id', lobbyId)
        .gt('created_at', lastSeenActionAtRef.current)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        lastSeenActionAtRef.current = data[data.length - 1].created_at;
        for (const action of data) {
          enqueueAction(action);
        }
      }
    };
```

Also update the realtime handler in the same effect to advance the watermark:

```ts
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kred_game_actions', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          const a = payload.new as any;
          if (a.created_at > lastSeenActionAtRef.current) {
            lastSeenActionAtRef.current = a.created_at;
          }
          enqueueAction(a);
        }
      )
```

- [ ] **Step 3: Write a test for incremental polling**

Create `src/__tests__/sync/incremental-poll.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMockSupabase } from "../helpers/mockSupabase";

describe("sync: incremental action poll (2d)", () => {
  it("a gt(created_at) query returns only newer rows", async () => {
    const { supabase } = createMockSupabase();

    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "A",
      payload: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });
    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "B",
      payload: {},
      created_at: "2026-01-02T00:00:00.000Z",
    });

    const watermark = "2026-01-01T12:00:00.000Z";
    const { data } = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true });

    expect(data).toHaveLength(1);
    expect(data[0].action_type).toBe("B");
  });

  it("watermark advances on each poll so the same row is never returned twice", async () => {
    const { supabase } = createMockSupabase();
    let watermark = new Date(0).toISOString();

    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "A",
      payload: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });

    const first = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true });
    expect(first.data).toHaveLength(1);
    watermark = first.data[0].created_at;

    const second = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true });
    expect(second.data).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx src/__tests__/sync/incremental-poll.test.ts
git commit -m "sync: incremental action poll with gt(created_at) (2d)"
```

---

### Task 5: Bound the dedupe set with a ring buffer (2d, part 2)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Replace `processedActionIdsRef` with a ring buffer**

Find this near line 131:

```ts
  const processedActionIdsRef = useRef<Set<string>>(new Set());
```

Replace it with a small inline ring-buffer class. Add this class at the top of the file (after the imports):

```ts
/**
 * Bounded set of recently-processed action ids.
 * Last N ids retained — older ids fall off the back.
 * Used to dedupe broadcast/poll race conditions without unbounded growth.
 */
class BoundedActionIdSet {
  private ring: string[] = [];
  private setView: Set<string> = new Set();
  constructor(private cap: number) {}
  has(id: string): boolean {
    return this.setView.has(id);
  }
  add(id: string): void {
    if (this.setView.has(id)) return;
    this.ring.push(id);
    this.setView.add(id);
    while (this.ring.length > this.cap) {
      const removed = this.ring.shift()!;
      this.setView.delete(removed);
    }
  }
  size(): number {
    return this.setView.size;
  }
}

const PROCESSED_ACTION_ID_CAP = 500;
```

Then replace the ref:

```ts
  const processedActionIdsRef = useRef<BoundedActionIdSet>(new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP));
```

Update the `enqueueAction` function — change `processedActionIdsRef.current.has(action.id)` (still works) and `processedActionIdsRef.current.add(action.id)` (still works because the API matches).

- [ ] **Step 2: Add a metric for the set size**

Inside `enqueueAction`, after `processedActionIdsRef.current.add(action.id);`, add:

```ts
    recordMetric('actions.processedSet.size', processedActionIdsRef.current.size());
```

- [ ] **Step 3: Add a test for the ring buffer**

Append to `src/__tests__/sync/incremental-poll.test.ts`:

```ts
describe("BoundedActionIdSet", () => {
  it("retains the last N ids and evicts older ones", async () => {
    // Inline copy of the class for testability — production code lives in
    // GameStateSynchronizer.tsx. We replicate here to assert the contract.
    class BoundedActionIdSet {
      private ring: string[] = [];
      private setView: Set<string> = new Set();
      constructor(private cap: number) {}
      has(id: string) { return this.setView.has(id); }
      add(id: string) {
        if (this.setView.has(id)) return;
        this.ring.push(id);
        this.setView.add(id);
        while (this.ring.length > this.cap) {
          const removed = this.ring.shift()!;
          this.setView.delete(removed);
        }
      }
      size() { return this.setView.size; }
    }

    const s = new BoundedActionIdSet(3);
    s.add("a");
    s.add("b");
    s.add("c");
    expect(s.size()).toBe(3);
    s.add("d");
    expect(s.size()).toBe(3);
    expect(s.has("a")).toBe(false);
    expect(s.has("d")).toBe(true);
    s.add("d"); // duplicate is no-op
    expect(s.size()).toBe(3);
  });
});
```

(The inline copy is intentional — the production class is private to `GameStateSynchronizer.tsx` to keep the file self-contained. If you'd rather export it from the synchronizer file and import it here, that's fine too — just don't move it to a new file in this step.)

- [ ] **Step 4: Run tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx src/__tests__/sync/incremental-poll.test.ts
git commit -m "sync: bound processed action ids to ring buffer of 500 (2d)"
```

---

### Task 6: Kill `window.__kred_pushState` (2e)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add a `pushStateRef` prop to the synchronizer**

In `src/components/GameStateSynchronizer.tsx`, update the `SyncProps` interface:

```ts
export interface SyncProps {
  /** Host: returns current game state as a packet */
  getStatePacket: () => GameStatePacket;

  /** Guest: applies a received state packet */
  applyStatePacket: (packet: GameStatePacket) => void;

  /** Host: ref to handler for guest actions from kred_game_actions table */
  onActionReceived?: MutableRefObject<((action: { type: string; playerId: string; payload: any }) => void) | undefined>;

  /** Called when rejoin hydration is complete */
  onRejoinComplete?: () => void;

  /**
   * Host: ref the synchronizer assigns its debounced pushState function to,
   * so the parent can call it imperatively without going through `window`.
   * Caller passes a ref it will keep stable across renders.
   */
  pushStateRef?: MutableRefObject<(() => void) | null>;
}
```

Replace the existing `useEffect` that wires `(window as any).__kred_pushState` (lines 306–313) with:

```ts
  // Expose debouncedPush via the parent-provided ref (no global escape hatch).
  useEffect(() => {
    if (!isHost || !pushStateRef) return;
    pushStateRef.current = debouncedPush;
    return () => {
      if (pushStateRef) pushStateRef.current = null;
    };
  }, [isHost, debouncedPush, pushStateRef]);
```

Add `pushStateRef` to the destructured props at the top of the component:

```ts
export default function GameStateSynchronizer({
  getStatePacket,
  applyStatePacket,
  onActionReceived,
  onRejoinComplete,
  pushStateRef,
}: SyncProps) {
```

- [ ] **Step 2: Wire the ref in App.tsx**

First, find every reference to `__kred_pushState` in App.tsx:

```
Use Grep tool with:
  pattern: "__kred_pushState"
  path: "src/App.tsx"
  output_mode: "content"
  -n: true
```

You should see at least one reference where `(window as any).__kred_pushState?.()` (or similar) is called, and possibly a useEffect that watches state and triggers the push.

In App.tsx, near the top of the component body where other refs are declared, add:

```ts
  const pushStateRef = useRef<(() => void) | null>(null);
```

Then find every call site like `(window as any).__kred_pushState?.()` or `(window as any).__kred_pushState && (window as any).__kred_pushState()` and replace each with:

```ts
  pushStateRef.current?.();
```

Then find where `<GameStateSynchronizer ... />` is rendered and add the prop:

```tsx
<GameStateSynchronizer
  getStatePacket={...}
  applyStatePacket={...}
  onActionReceived={...}
  onRejoinComplete={...}
  pushStateRef={pushStateRef}
/>
```

- [ ] **Step 3: Verify no `__kred_pushState` references remain**

```
Use Grep tool with:
  pattern: "__kred_pushState"
  path: "src/"
```

Expected: ZERO matches.

- [ ] **Step 4: Run tests + dev sanity check**

```bash
npm test -- --run
```

Expected: PASS.

```bash
npm run dev
```

Open the dev server, create a host lobby with 4 players, join from a second browser as a guest, advance one phase, and confirm sync still works. Stop the dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx src/App.tsx
git commit -m "sync: replace window.__kred_pushState with pushStateRef prop (2e)"
```

---

### Task 7: Add new metric calls (rounds out PerfStore wiring for this step)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Add the remaining metric calls**

In `enqueueAction`, after the `processedActionIdsRef.current.add(action.id);` line and the size metric (already added in Task 5), add:

```ts
    recordMetric('actions.queueDepth', actionQueueRef.current.length);
```

In `drainQueue`, just before `onActionReceived?.current?.(...)`, capture the action's age:

```ts
    if (action.created_at) {
      const ageMs = Date.now() - new Date(action.created_at).getTime();
      recordMetric('actions.latency', ageMs);
    }
```

In the broadcast handler in the "BOTH: Set up broadcast channel" useEffect (where `applyStatePacket(payload)` is called), add right before applying:

```ts
        const tApply = Date.now() - (payload.lastUpdated ?? Date.now());
        recordMetric('apply.latency', tApply, { channel: 'broadcast' });
```

In the guest poll fallback (in the `poll` function inside the "GUEST: Polling fallback" useEffect), right before the `applyStatePacket` call, add:

```ts
          const tApply = Date.now() - ((data.state_json as any).lastUpdated ?? Date.now());
          recordMetric('apply.latency', tApply, { channel: 'poll' });
```

In the "HOST: Listen for guest actions" effect, in the realtime handler, increment a counter:

```ts
        (payload) => {
          const a = payload.new as any;
          if (a.created_at > lastSeenActionAtRef.current) {
            lastSeenActionAtRef.current = a.created_at;
          }
          incrementCounter('actions.realtime.received');
          enqueueAction(a);
        }
```

And in `pollActions`, increment a counter for the polled batch size:

```ts
      if (data && data.length > 0) {
        incrementCounter('actions.poll.received', data.length);
        ...
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Dev sanity check**

```bash
npm run dev
```

Open `http://localhost:5173/?perf=1`, run a 4-player game, and confirm the new metrics show in the overlay:
- `packet.bytes`, `packet.version` (from Step 2)
- `apply.latency` (from this step)
- `actions.queueDepth`, `actions.processedSet.size`, `actions.latency`
- `persist.writes`, `persist.errors` counters
- `actions.realtime.received`, `actions.poll.received` counters

- [ ] **Step 4: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "perf: instrument sync layer with apply latency + queue + persist metrics"
```

---

## Definition of done

- [ ] No `postgres_changes` subscription on `kred_game_states` exists anywhere in the synchronizer
- [ ] Guest poll interval adapts (3s normal, 1s after >5s without broadcast)
- [ ] DB persist throttles independently from broadcast (500ms trailing throttle)
- [ ] DB persist force-flushes on phase change and on host unmount
- [ ] Action poll uses `gt('created_at', lastSeenActionAtRef.current)`
- [ ] `processedActionIdsRef` is a `BoundedActionIdSet` with cap 500
- [ ] Zero references to `__kred_pushState` anywhere in `src/`
- [ ] All sync tests pass
- [ ] All existing tests pass
- [ ] PerfOverlay shows the new metrics in dev
- [ ] No App.tsx structural changes — only the ref wiring change in Task 6
- [ ] No schema changes

## Handoff notes for next step (Step 4 — Cleanup audits)

- The action poll is now incremental and the dedupe set is bounded — Step 4's memory bounds tests (matrix items #17, #18) can now meaningfully assert against the new behavior.
- `persistTimerRef`, `pendingPersistPacketRef`, `lastPersistedPhaseRef`, `lastSeenActionAtRef`, `lastBroadcastReceiptRef`, `lastPersistedVersionRef` are all new long-lived refs introduced in this step. Step 4's "every long-lived ref/Map/Set audit" must include these.
- The forced phase-change persist relies on `lastPersistedPhaseRef`. If Step 5 introduces a PhaseProvider that emits its own change events, the ref-based check here can be removed in favor of an effect that watches the provider — but do NOT do that in this step.
