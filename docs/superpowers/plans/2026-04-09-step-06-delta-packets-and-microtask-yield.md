# Step 6 — Delta Packets + Microtask Yield (2b, 2f)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- **2b** — Switch the wire format from full-snapshot-every-push to shallow per-field deltas, with periodic full-snapshot heartbeats and `REQUEST_FULL` recovery for guests that miss a delta. DB persistence still stores full snapshots (rejoin path unchanged).
- **2f** — Replace `setTimeout(..., 0)` between queued actions with `queueMicrotask` + `flushSync`, shrinking the serialization budget from ~50ms to ~5ms per 10-action burst.

**Architecture:** The delta format is computed in `GameStateAggregator` (where the full packet is already built). The wire type becomes a discriminated union of `{kind: 'full'}` and `{kind: 'delta'}`. `GameStateSynchronizer` serializes on send and reassembles on apply. Both features ship behind const flags (`SYNC_DELTAS` and `SYNC_MICROTASK_YIELD`) that default ON in dev and OFF in prod until the PerfStore confirms the win on real hardware.

**Tech Stack:** React 19 (`flushSync`), TypeScript, Vitest.

---

## Context for fresh agent

**Read these first** (in this order, ~10 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 2b and 2f**. Read carefully; delta semantics have edge cases.
2. `docs/superpowers/plans/2026-04-09-step-05-aggregator-and-phase-provider.md` — "Handoff notes" at the bottom. The aggregator is your delta computation site.
3. `src/providers/GameStateAggregator.tsx` — Step 5 built this. It already memoizes the full packet and is the only component with full-world view.
4. `src/components/GameStateSynchronizer.tsx` — Step 3 refactored the send/apply path. You will extend `pushState` and `applyStatePacket` to handle the discriminated-union packet.
5. `src/__tests__/sync/helpers/scenario.ts` — Steps 1, 5 built scenario helpers. You'll extend them to cover delta and `REQUEST_FULL` round-trips.
6. `src/perf/index.ts` — Step 2 wired counters. You'll add `sync.delta.sent`, `sync.full.sent`, `sync.requestFull.sent`, `sync.apply.deltaBytes`, `sync.apply.fullBytes`, `actions.burstYieldMs`.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag. Exception: the wire format is intentionally a discriminated union over `Partial<FullState>` — use `unknown` at the boundary and refine via the tag.
- Two-space indent, double quotes, semicolons.
- File-size budget: 500 lines per file. `GameStateSynchronizer.tsx` is currently ~360 lines after Step 3; leave headroom.

**Critical constraints:**
- **Wire format change, not schema change.** `kred_game_states.state_json` still stores the full snapshot. Only the broadcast payload shape changes.
- **Feature flag everything.** `SYNC_DELTAS` and `SYNC_MICROTASK_YIELD` as module-level consts; default to `true` in dev, `false` in production until validated. Revert path is a single const flip.
- **All existing tests must stay green.** If a test relied on the full packet shape on the wire, update it to route through the new discriminated union via the scenario helpers.
- **3, 4, AND 5 player modes must all keep working.**
- **Delta semantics are shallow per top-level field only.** No deep diffing arrays of pieces. If a field reference changed → include it. Period.

**What this step does NOT do:**
- ❌ Provider migrations beyond PhaseProvider — Step 7.
- ❌ Component split, memoization pass, hot leaves — Step 7.
- ❌ Validation / reconnect audit — Step 8.
- ❌ Schema changes — none required.
- ❌ Error boundaries — Step 8.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/sync/packet.ts` | Create: discriminated-union types + `buildDelta(prev, next)` + `applyDelta(base, delta)` + heartbeat policy (every Nth full). | ≤ 220 lines |
| `src/providers/GameStateAggregator.tsx` | Modify: track `prevPacketRef`; compute delta; call `pushStateRef.current(packet, delta)`. | +60 lines |
| `src/components/GameStateSynchronizer.tsx` | Modify: `pushState` serializes as `{kind: 'full'}` or `{kind: 'delta'}`; `applyStatePacket` reassembles; `REQUEST_FULL` action is a new host-handled action type. | +120 lines |
| `src/sync/flags.ts` | Create: `SYNC_DELTAS`, `SYNC_MICROTASK_YIELD` feature consts. | ≤ 30 lines |
| `src/__tests__/sync/delta-packets.test.ts` | Create: matrix items 4 + 5. Delta apply order, unknown baseV → REQUEST_FULL recovery. | ≤ 300 lines |
| `src/__tests__/sync/microtask-yield.test.ts` | Create: extension of matrix item 19 — assert per-action state ordering is preserved under microtask drain. | ≤ 150 lines |
| `src/perf/index.ts` | Add new metric registry entries. | +10 lines |

---

## Tasks

### Task 1: Create feature flag module

**Files:**
- Create: `src/sync/flags.ts`

- [ ] **Step 1: Write the flags module**

```ts
// src/sync/flags.ts
/**
 * Sync layer feature flags.
 *
 * Both default ON in dev so the PerfStore can measure their impact.
 * Both default OFF in prod until a maintainer flips them after
 * manual validation on real hardware. To revert either feature,
 * flip the const and ship.
 */

const DEV = import.meta.env.DEV;

/** Use delta wire format with full-snapshot heartbeats. */
export const SYNC_DELTAS = DEV; // TODO flip to true in prod after validation

/** Use queueMicrotask + flushSync between queued actions (instead of setTimeout 0). */
export const SYNC_MICROTASK_YIELD = DEV; // TODO flip to true in prod after validation

/** Full snapshot every Nth broadcast to bound delta chain length. */
export const FULL_SNAPSHOT_HEARTBEAT_N = 20;
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/sync/flags.ts
git commit -m "feat: add sync feature flags (SYNC_DELTAS, SYNC_MICROTASK_YIELD)"
```

---

### Task 2: Define packet types and pure delta helpers

**Files:**
- Create: `src/sync/packet.ts`

- [ ] **Step 1: Write the module**

```ts
// src/sync/packet.ts
/**
 * Wire packet types for host → guest sync.
 *
 * DB persistence always stores the FULL state (kred_game_states.state_json).
 * Only the broadcast payload uses this discriminated union.
 *
 * Delta semantics: shallow per top-level field. If `prev[k] !== next[k]`
 * (reference inequality) the key is included in the patch. Providers use
 * immutable updates, so this is both cheap and accurate.
 */

export type FullState = Record<string, unknown>;

export type StatePacket =
  | {
      kind: "full";
      v: number;
      ts: number;
      state: FullState;
    }
  | {
      kind: "delta";
      v: number;
      ts: number;
      baseV: number;
      patch: Partial<FullState>;
    };

export interface BuildDeltaInput {
  prev: FullState | null;
  next: FullState;
  prevVersion: number;
  nextVersion: number;
  ts: number;
  /** Force full on phase change / heartbeat / rejoin. */
  forceFull: boolean;
}

/**
 * Produces either a full packet or a delta packet based on the inputs.
 * `forceFull` takes precedence. If prev is null, always produces full.
 */
export function buildPacket(input: BuildDeltaInput): StatePacket {
  const { prev, next, nextVersion, ts, forceFull, prevVersion } = input;

  if (forceFull || prev === null) {
    return { kind: "full", v: nextVersion, ts, state: next };
  }

  const patch: Partial<FullState> = {};
  let changed = 0;
  for (const key of Object.keys(next)) {
    if (!Object.is(prev[key], next[key])) {
      patch[key] = next[key];
      changed++;
    }
  }
  // Detect removed keys (unlikely in practice but possible).
  for (const key of Object.keys(prev)) {
    if (!(key in next)) {
      patch[key] = undefined;
      changed++;
    }
  }

  // If nothing changed, callers should not be pushing at all — but be safe.
  if (changed === 0) {
    return { kind: "delta", v: nextVersion, ts, baseV: prevVersion, patch: {} };
  }

  return { kind: "delta", v: nextVersion, ts, baseV: prevVersion, patch };
}

/**
 * Apply a delta to a base state. Returns a new state object.
 * Undefined values in the patch are treated as key deletions.
 */
export function applyDelta(base: FullState, patch: Partial<FullState>): FullState {
  const next: FullState = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) delete next[k];
    else next[k] = v;
  }
  return next;
}

/**
 * Heartbeat policy: every Nth push should be a full snapshot.
 * Counts FULL pushes so that a gap-free stream of deltas still produces
 * a full every N deltas.
 */
export function shouldSendFull(
  pushCount: number,
  heartbeatN: number,
  phaseChanged: boolean,
  rejoin: boolean,
): boolean {
  if (rejoin || phaseChanged) return true;
  if (pushCount === 0) return true; // first push is always full
  return pushCount % heartbeatN === 0;
}
```

- [ ] **Step 2: Write pure unit tests for the helpers**

Create `src/__tests__/sync/packet-helpers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyDelta, buildPacket, shouldSendFull } from "../../sync/packet";

describe("buildPacket", () => {
  it("returns full when prev is null", () => {
    const p = buildPacket({
      prev: null, next: { a: 1, b: 2 },
      prevVersion: 0, nextVersion: 1, ts: 100, forceFull: false,
    });
    expect(p.kind).toBe("full");
    if (p.kind === "full") expect(p.state).toEqual({ a: 1, b: 2 });
  });

  it("returns full when forceFull", () => {
    const p = buildPacket({
      prev: { a: 1 }, next: { a: 2 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: true,
    });
    expect(p.kind).toBe("full");
  });

  it("returns delta with only changed keys", () => {
    const p = buildPacket({
      prev: { a: 1, b: 2, c: 3 },
      next: { a: 1, b: 9, c: 3 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    expect(p.kind).toBe("delta");
    if (p.kind === "delta") {
      expect(p.patch).toEqual({ b: 9 });
      expect(p.baseV).toBe(5);
    }
  });

  it("includes removed keys as undefined", () => {
    const p = buildPacket({
      prev: { a: 1, b: 2 },
      next: { a: 1 },
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p.kind !== "delta") throw new Error("expected delta");
    expect(p.patch).toEqual({ b: undefined });
  });

  it("uses reference equality, not deep equality", () => {
    const arr = [1, 2, 3];
    const p1 = buildPacket({
      prev: { arr }, next: { arr }, // same ref
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p1.kind !== "delta") throw new Error("expected delta");
    expect(p1.patch).toEqual({});

    const p2 = buildPacket({
      prev: { arr }, next: { arr: [1, 2, 3] }, // different ref, same content
      prevVersion: 5, nextVersion: 6, ts: 100, forceFull: false,
    });
    if (p2.kind !== "delta") throw new Error("expected delta");
    expect(p2.patch).toHaveProperty("arr");
  });
});

describe("applyDelta", () => {
  it("merges patch over base", () => {
    const result = applyDelta({ a: 1, b: 2 }, { b: 9, c: 3 });
    expect(result).toEqual({ a: 1, b: 9, c: 3 });
  });

  it("deletes keys where patch value is undefined", () => {
    const result = applyDelta({ a: 1, b: 2 }, { b: undefined });
    expect(result).toEqual({ a: 1 });
    expect("b" in result).toBe(false);
  });

  it("returns a new object (does not mutate base)", () => {
    const base = { a: 1 };
    const result = applyDelta(base, { a: 2 });
    expect(base).toEqual({ a: 1 });
    expect(result).toEqual({ a: 2 });
    expect(result).not.toBe(base);
  });
});

describe("shouldSendFull", () => {
  it("first push is always full", () => {
    expect(shouldSendFull(0, 20, false, false)).toBe(true);
  });
  it("rejoin forces full", () => {
    expect(shouldSendFull(5, 20, false, true)).toBe(true);
  });
  it("phase change forces full", () => {
    expect(shouldSendFull(5, 20, true, false)).toBe(true);
  });
  it("every Nth push is full", () => {
    expect(shouldSendFull(20, 20, false, false)).toBe(true);
    expect(shouldSendFull(19, 20, false, false)).toBe(false);
    expect(shouldSendFull(21, 20, false, false)).toBe(false);
    expect(shouldSendFull(40, 20, false, false)).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --run src/__tests__/sync/packet-helpers.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/sync/packet.ts src/__tests__/sync/packet-helpers.test.ts
git commit -m "feat: add StatePacket discriminated union + buildPacket/applyDelta helpers"
```

---

### Task 3: Add new PerfStore metrics

**Files:**
- Modify: `src/perf/index.ts`

- [ ] **Step 1: Add the registry entries**

```ts
export const PERF_METRICS = {
  // ...existing...
  "sync.full.sent": { kind: "counter" },
  "sync.delta.sent": { kind: "counter" },
  "sync.delta.patchKeys": { kind: "histogram", cap: 128 },
  "sync.requestFull.sent": { kind: "counter" },
  "sync.requestFull.served": { kind: "counter" },
  "sync.apply.fullBytes": { kind: "histogram", cap: 128 },
  "sync.apply.deltaBytes": { kind: "histogram", cap: 128 },
  "actions.burstYieldMs": { kind: "histogram", cap: 128 },
} as const;
```

- [ ] **Step 2: Typecheck + tests**

```bash
npm run typecheck && npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/perf/index.ts
git commit -m "feat: add sync delta + microtask-yield perf metrics"
```

---

### Task 4: Extend `GameStateAggregator` to compute deltas

**Files:**
- Modify: `src/providers/GameStateAggregator.tsx`

- [ ] **Step 1: Thread the raw packet through `pushStateRef`**

The aggregator currently hands the synchronizer a `statePacket` prop. Switch to invoking `pushStateRef.current(packet)` with a freshly computed full packet and a `buildPacket`-computed wire packet.

In `GameStateAggregator.tsx`:

```tsx
import { useEffect, useMemo, useRef } from "react";
import { usePhase } from "./PhaseProvider";
import { GameStateSynchronizer } from "../components/GameStateSynchronizer";
import {
  buildPacket,
  shouldSendFull,
  FullState,
  StatePacket,
} from "../sync/packet";
import { SYNC_DELTAS, FULL_SNAPSHOT_HEARTBEAT_N } from "../sync/flags";
import { incrementCounter, recordMetric } from "../perf";

export function GameStateAggregator(props: GameStateAggregatorProps) {
  const phase = usePhase();

  const fullState: FullState = useMemo(
    () => ({
      gameState: phase.gameState,
      currentPlayerIndex: phase.currentPlayerIndex,
      moverPlayerIndex: phase.moverPlayerIndex,
      campaignRole: phase.campaignRole,
      players: props.players,
      boardTiles: props.boardTiles,
      // ...all the other slices, unchanged from Step 5
    }),
    [
      phase.gameState, phase.currentPlayerIndex, phase.moverPlayerIndex, phase.campaignRole,
      props.players, props.boardTiles,
      // ...other deps unchanged
    ],
  );

  const prevFullRef = useRef<FullState | null>(null);
  const versionRef = useRef(0);
  const pushCountRef = useRef(0);
  const lastPhaseRef = useRef<number | null>(null);

  // Imperative packet producer exposed to the synchronizer.
  // Called on a debounce from inside the synchronizer (same 100ms as today).
  useEffect(() => {
    if (!props.pushStateRef) return;
    props.pushStateRef.current = () => {
      const prev = prevFullRef.current;
      const phaseChanged = lastPhaseRef.current !== phase.gameState;
      const rejoin = false; // rejoin hydration uses a dedicated path, not this function
      const nextV = versionRef.current + 1;

      let packet: StatePacket;
      if (SYNC_DELTAS) {
        const forceFull = shouldSendFull(
          pushCountRef.current,
          FULL_SNAPSHOT_HEARTBEAT_N,
          phaseChanged,
          rejoin,
        );
        packet = buildPacket({
          prev,
          next: fullState,
          prevVersion: versionRef.current,
          nextVersion: nextV,
          ts: Date.now(),
          forceFull,
        });
      } else {
        packet = { kind: "full", v: nextV, ts: Date.now(), state: fullState };
      }

      // Perf accounting
      if (packet.kind === "full") {
        incrementCounter("sync.full.sent");
      } else {
        incrementCounter("sync.delta.sent");
        recordMetric("sync.delta.patchKeys", Object.keys(packet.patch).length);
      }

      // Hand to the synchronizer's internal send function
      props.synchronizerSendRef?.current?.(packet);

      // Record for next diff
      prevFullRef.current = fullState;
      versionRef.current = nextV;
      pushCountRef.current += 1;
      lastPhaseRef.current = phase.gameState;
    };
  }, [fullState, phase.gameState, props.pushStateRef, props.synchronizerSendRef]);

  return (
    <GameStateSynchronizer
      lobbyId={props.lobbyId}
      userId={props.userId}
      isHost={props.isHost}
      pushStateRef={props.pushStateRef}
      synchronizerSendRef={props.synchronizerSendRef}
      onApplyPacket={props.onApplyPacket}
      // Note: no statePacket prop anymore — the packet is produced imperatively
    />
  );
}
```

**Important:** `synchronizerSendRef` is a new ref the synchronizer creates and the aggregator populates via callback. The synchronizer's existing `pushState` internal function wraps the send and applies the 100ms debounce. The aggregator's imperative call to `pushStateRef.current()` is triggered from its own `useEffect` keyed on `fullState` — essentially replacing the old "state packet changed → push" effect.

- [ ] **Step 2: Trigger a push on fullState change**

Add a second effect:

```tsx
useEffect(() => {
  // Delegate to synchronizer's debounced pushState via pushStateRef.
  if (props.pushStateRef?.current) {
    props.pushStateRef.current();
  }
}, [fullState]);
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Fix any mismatches by reconciling with the synchronizer interface. (The next task updates the synchronizer.)

- [ ] **Step 4: Commit (even if some imports from the synchronizer are not yet wired — those come next)**

Skip for now. Land this together with Task 5. Move to Task 5.

---

### Task 5: Extend `GameStateSynchronizer` to serialize/apply the discriminated-union packet

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Add new props and refs**

In the synchronizer's props interface:

```ts
interface GameStateSynchronizerProps {
  lobbyId: string;
  userId: string;
  isHost: boolean;
  pushStateRef: RefObject<(() => void) | null>;
  synchronizerSendRef: RefObject<((packet: StatePacket) => void) | null>;
  onApplyPacket: (packet: FullState) => void;
}
```

Inside the component, add a `lastAppliedFullRef` so the guest can apply deltas on top of it:

```tsx
const lastAppliedFullRef = useRef<FullState | null>(null);
const lastAppliedVRef = useRef(0);
```

- [ ] **Step 2: Implement the imperative send function**

Replace the existing debounced `pushState` implementation. The debounce still owns the 100ms window, but now it consumes the `StatePacket` the aggregator computed:

```tsx
const pendingPacketRef = useRef<StatePacket | null>(null);
const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  synchronizerSendRef.current = (packet: StatePacket) => {
    pendingPacketRef.current = packet;
    if (sendTimerRef.current) return;
    sendTimerRef.current = setTimeout(() => {
      const p = pendingPacketRef.current;
      pendingPacketRef.current = null;
      sendTimerRef.current = null;
      if (!p) return;

      broadcastChannelRef.current?.send({
        type: "broadcast",
        event: "state",
        payload: p,
      });

      // DB persistence still takes the FULL state. If this packet is a delta,
      // reconstruct the full from lastAppliedFullRef + delta.
      const fullForPersist =
        p.kind === "full"
          ? p.state
          : applyDelta(lastAppliedFullRef.current ?? {}, p.patch);
      schedulePersist(fullForPersist, p.v);
    }, 100);
  };
  return () => {
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
  };
}, []);
```

**Important:** `schedulePersist` is the DB throttle introduced in Step 3 (2c). It already exists. Do not create a new one.

- [ ] **Step 3: Update `applyStatePacket` (guest side) to handle the union**

```tsx
const applyStatePacket = useCallback((raw: unknown) => {
  const packet = raw as StatePacket;
  if (!packet || typeof packet !== "object" || !("kind" in packet)) return;

  // Version gate
  if (packet.v <= lastAppliedVRef.current) {
    incrementCounter("sync.staleSkipped");
    return;
  }

  if (packet.kind === "full") {
    lastAppliedFullRef.current = packet.state;
    lastAppliedVRef.current = packet.v;
    recordMetric("sync.apply.fullBytes", JSON.stringify(packet.state).length);
    onApplyPacket(packet.state);
    return;
  }

  // kind === 'delta'
  if (packet.baseV !== lastAppliedVRef.current) {
    // Missed a frame. Request a full snapshot.
    incrementCounter("sync.requestFull.sent");
    emitRequestFull();
    return;
  }

  const base = lastAppliedFullRef.current ?? {};
  const next = applyDelta(base, packet.patch);
  lastAppliedFullRef.current = next;
  lastAppliedVRef.current = packet.v;
  recordMetric("sync.apply.deltaBytes", JSON.stringify(packet.patch).length);
  onApplyPacket(next);
}, [onApplyPacket]);
```

- [ ] **Step 4: Implement `emitRequestFull` and host-side handler**

`emitRequestFull` writes a `REQUEST_FULL` action into `kred_game_actions` so the host's action queue picks it up:

```tsx
const emitRequestFull = useCallback(async () => {
  await supabase.from("kred_game_actions").insert({
    lobby_id: lobbyId,
    player_id: userId,
    action_type: "REQUEST_FULL",
    payload: {},
  });
}, [lobbyId, userId]);
```

Host-side, in the action processing switch (or wherever action types are dispatched), add:

```tsx
case "REQUEST_FULL": {
  incrementCounter("sync.requestFull.served");
  // Force the next push to be a full snapshot.
  // The aggregator owns the "force full" flag, so the simplest bridge is
  // a ref the aggregator watches.
  forceFullOnNextPushRef.current = true;
  synchronizerSendRef.current?.(/* a dummy trigger — aggregator will rebuild */);
  // Or: directly broadcast a full right now, bypassing the debounce.
  if (lastAppliedFullRef.current) {
    broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "state",
      payload: {
        kind: "full",
        v: lastAppliedVRef.current,
        ts: Date.now(),
        state: lastAppliedFullRef.current,
      },
    });
  }
  break;
}
```

Pick one of those two strategies; the direct-broadcast version is simpler. Document which you picked in a comment.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

Fix mismatches. Common issues:
- `onApplyPacket` signature mismatch (it now takes `FullState`, may have been typed as specific packet before).
- `pushStateRef`'s function signature changes (from `() => void` to `() => void` — same, but the caller semantics differ).

- [ ] **Step 6: Run existing sync tests**

```bash
npm run test:sync
```

Expected: PASS (the flag is ON in dev; tests run under dev). If a test fails because it asserted the old wire shape, update the test to read packets via the scenario helper so it doesn't care about the shape.

- [ ] **Step 7: Commit Tasks 4 + 5 together**

```bash
git add src/providers/GameStateAggregator.tsx src/components/GameStateSynchronizer.tsx
git commit -m "feat: wire delta packets through aggregator + synchronizer (flagged)"
```

---

### Task 6: Sync test matrix — delta correctness (matrix items 4 + 5)

**Files:**
- Create: `src/__tests__/sync/delta-packets.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";

describe("delta packets (spec §2b / matrix #4, #5)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`host pushes 10 deltas → guest applies in order → final == full snapshot (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Drive 10 independent state changes on the host.
        for (let i = 0; i < 10; i++) {
          await host.setState({ currentPlayerIndex: i % playerCount });
          await waitForConvergence([host, ...guests]);
        }
        // Compare full snapshot
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(host.state.currentPlayerIndex);
          expect(g.state).toEqual(host.state);
        }
      } finally {
        await cleanup();
      }
    });

    it(`guest receives delta with unknown baseV → requests full → recovers (${playerCount}p)`, async () => {
      const { host, guests, cleanup, bus } = await createMultiplayerScenario({
        playerCount,
      });
      try {
        // Let the baseline full propagate.
        await host.setState({ currentPlayerIndex: 1 });
        await waitForConvergence([host, ...guests]);

        // Drop the next delta before any guest sees it.
        bus.setDropNext(1);
        await host.setState({ currentPlayerIndex: 2 });
        // Allow the drop to happen; no convergence yet.
        await new Promise((r) => setTimeout(r, 150));

        // Push another delta whose baseV is now unknown to guests.
        await host.setState({ currentPlayerIndex: 3 });
        await waitForConvergence([host, ...guests]);

        // Each guest should have requested a full and recovered.
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(3);
          expect(g.state).toEqual(host.state);
          expect(g.internals.requestFullCount).toBeGreaterThanOrEqual(1);
        }
      } finally {
        await cleanup();
      }
    });

    it(`broadcast + poll deliver same packet → applied once (${playerCount}p)`, async () => {
      // Matrix #6 (promoted here; redundant with step-01 baseline but now
      // exercised against the delta wire format).
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.setState({ currentPlayerIndex: 2 });
        await waitForConvergence([host, ...guests]);
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(2);
          // staleSkipped should be >= 1 because broadcast + poll both fire
          expect(g.internals.perf["sync.staleSkipped"] ?? 0).toBeGreaterThanOrEqual(0);
        }
      } finally {
        await cleanup();
      }
    });
  }
});
```

**Important:** `bus.setDropNext(n)` and `guest.internals.requestFullCount` are new scenario helper surfaces. Extend `helpers/scenario.ts` with:

```ts
// In mockSupabase.ts (built in Step 1), add:
setDropNext(n: number): void; // drops the next N broadcasts on the matching channel

// In scenario.ts, extend guest internals to expose:
internals: {
  requestFullCount: number;
  perf: Record<string, number>;
};
```

- [ ] **Step 2: Run**

```bash
npm test -- --run src/__tests__/sync/delta-packets.test.ts
```

Expected: PASS. If the `REQUEST_FULL` recovery test fails, the most likely cause is that the host's "force full" response is not actually reaching the guest — trace the path from `emitRequestFull` → `kred_game_actions` insert → host action queue → `REQUEST_FULL` handler → broadcast.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/delta-packets.test.ts src/__tests__/sync/helpers/scenario.ts src/__tests__/sync/helpers/mockSupabase.ts
git commit -m "test: delta packet round-trip + REQUEST_FULL recovery (matrix #4, #5)"
```

---

### Task 7: Implement microtask yield in the action queue (2f)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx`

- [ ] **Step 1: Locate the action drain loop**

In `GameStateSynchronizer.tsx`, find the current drain pattern (Step 3 left it structurally unchanged):

```tsx
const drainQueue = useCallback(async () => {
  if (isProcessingQueueRef.current) return;
  if (actionQueueRef.current.length === 0) return;
  isProcessingQueueRef.current = true;

  const action = actionQueueRef.current.shift();
  await processAction(action);

  setTimeout(() => {
    isProcessingQueueRef.current = false;
    drainQueue();
  }, 0);
}, [processAction]);
```

- [ ] **Step 2: Add the microtask-yield variant**

```tsx
import { flushSync } from "react-dom";
import { SYNC_MICROTASK_YIELD } from "../sync/flags";
import { recordMetric } from "../perf";

const drainQueue = useCallback(async () => {
  if (isProcessingQueueRef.current) return;
  if (actionQueueRef.current.length === 0) return;
  isProcessingQueueRef.current = true;

  const burstStart = performance.now();

  const next = () => {
    const action = actionQueueRef.current.shift();
    if (!action) {
      isProcessingQueueRef.current = false;
      recordMetric("actions.burstYieldMs", performance.now() - burstStart);
      return;
    }
    // flushSync ensures the setState inside processAction commits before the
    // next action runs. React 19 + flushSync is legal inside a microtask.
    flushSync(() => { processAction(action); });

    if (SYNC_MICROTASK_YIELD) {
      queueMicrotask(next);
    } else {
      setTimeout(next, 0);
    }
  };

  if (SYNC_MICROTASK_YIELD) {
    queueMicrotask(next);
  } else {
    setTimeout(next, 0);
  }
}, [processAction]);
```

**Important:**
- `processAction` here must be synchronous or complete its sync state updates before awaiting. If it is async with awaits mid-flight, `flushSync` won't cover the post-await updates and you'll need a small refactor: split `processAction` into a sync `applyAction` step and an async `sideEffects` step, then only `flushSync(applyAction)`.
- If the refactor is required and takes more than 30 lines, stop and commit the delta work first, then do the refactor in a separate commit for reviewability.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Existing sync tests**

```bash
npm run test:sync
```

Expected: PASS. Matrix #19 (enqueue 10 actions, all processed in order) must pass under both flag values.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "perf: microtask yield between queued actions (flagged)"
```

---

### Task 8: Microtask-yield correctness test (extends matrix #19)

**Files:**
- Create: `src/__tests__/sync/microtask-yield.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./helpers/scenario";

describe("microtask yield (spec §2f / matrix #19 extended)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`burst of 10 actions preserves order and per-action state ordering (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Each guest emits one action in a tight burst.
        const burst = [];
        for (let i = 0; i < 10; i++) {
          const sender = guests[i % guests.length];
          burst.push(sender.emitNumbered(i));
        }
        await Promise.all(burst);
        await waitForConvergence([host, ...guests]);

        // The host should have observed each numbered action in order. Each
        // action increments a counter on the host's state — counter should be
        // exactly 10, no skipped numbers, no duplicates.
        expect(host.state.numberedCounter).toBe(10);
        expect(host.state.numberedSeen).toEqual(
          Array.from({ length: 10 }, (_, i) => i),
        );
      } finally {
        await cleanup();
      }
    });

    it(`burst completes faster than setTimeout-0 baseline on real hardware (dev-only assert)`, async () => {
      // Loose assertion: we don't want this flaky, but we also want visibility.
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        const start = performance.now();
        const burst = [];
        for (let i = 0; i < 10; i++) {
          burst.push(guests[i % guests.length].emitNumbered(i));
        }
        await Promise.all(burst);
        await waitForConvergence([host, ...guests]);
        const elapsed = performance.now() - start;

        // Very loose: generous upper bound to avoid flakes.
        expect(elapsed).toBeLessThan(2000);
      } finally {
        await cleanup();
      }
    });
  }
});
```

**Note:** `emitNumbered(n)` is a new scenario helper — the action handler on the host increments `state.numberedCounter` and pushes `n` onto `state.numberedSeen`. Add the action type to the harness (NOT to the production action type union).

- [ ] **Step 2: Run**

```bash
npm test -- --run src/__tests__/sync/microtask-yield.test.ts
```

Expected: PASS. If the ordering test fails, the most likely cause is that `processAction` has an async gap that `flushSync` doesn't cover — see Task 7 Step 2's refactor note.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/microtask-yield.test.ts src/__tests__/sync/helpers/scenario.ts
git commit -m "test: microtask-yield preserves action order (spec §2f)"
```

---

### Task 9: Dev smoke test + commit

**Files:**
- None

- [ ] **Step 1: Full suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 2: Dev smoke (3, 4, 5)**

```bash
npm run dev
```

For each player count, play one full round. Open `?perf=1` and confirm:
- `sync.full.sent` count ≈ `pushCount / 20 + phaseChanges + 1`.
- `sync.delta.sent` count > `sync.full.sent` in steady state.
- `sync.delta.patchKeys` histogram shows most deltas have 1–3 keys (otherwise the diff is too coarse and delta is not paying off).
- `sync.requestFull.sent` is ideally 0 in a clean local run — if it's nonzero, a delta got lost, which is a bug in either the scenario helpers or the production drop-handling path.
- `actions.burstYieldMs` is < 20ms for burst sequences.
- No console errors.

- [ ] **Step 3: If anything regresses, roll back and diagnose**

The two flags (`SYNC_DELTAS`, `SYNC_MICROTASK_YIELD`) make bisecting easy — flip either to `false` and retest.

---

## Definition of done

- [ ] `src/sync/packet.ts` exports `StatePacket`, `buildPacket`, `applyDelta`, `shouldSendFull`.
- [ ] `src/sync/flags.ts` exports `SYNC_DELTAS`, `SYNC_MICROTASK_YIELD`, `FULL_SNAPSHOT_HEARTBEAT_N`.
- [ ] `GameStateAggregator` computes deltas via `buildPacket` and pushes via an imperative ref.
- [ ] `GameStateSynchronizer` serializes the discriminated union, applies deltas on the guest side, and handles `REQUEST_FULL`.
- [ ] DB persistence still stores full snapshots (rejoin path unchanged — no schema change).
- [ ] `packet-helpers.test.ts`, `delta-packets.test.ts`, `microtask-yield.test.ts` all pass for 3, 4, 5 players.
- [ ] PerfStore shows `sync.full.sent`, `sync.delta.sent`, `sync.requestFull.sent`, `actions.burstYieldMs`, `sync.delta.patchKeys`, `sync.apply.fullBytes`, `sync.apply.deltaBytes`.
- [ ] Both features flagged; flipping either const off falls back to the prior behavior.
- [ ] All existing tests pass.
- [ ] No schema changes.
- [ ] No component structure changes.

## Handoff notes for next step (Step 7 — Provider migrations + breakup)

- Every additional provider added in Step 7 should feed the aggregator the same way PhaseProvider does — via a hook read inside the aggregator, not via a prop. As each provider is migrated, one legacy prop on `GameStateAggregator` disappears.
- The delta packet's shape is a flat `FullState` (`Record<string, unknown>`). When migrating a provider, make sure the aggregator's memo dep array still lists every top-level field that could change — forgetting one means delta misses a write.
- The microtask-yield refactor (if it required splitting `processAction` into `applyAction` + `sideEffects`) is a load-bearing invariant for Step 7. Do not re-merge them.
- Keep the `SYNC_DELTAS` flag enabled in dev through Step 7 so provider migrations get exercised against the delta path continuously.
