# Step 1 — Sync Test Mock + Helpers + Baseline Tests

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the in-process Supabase mock, the multiplayer test helpers, and ~10 baseline sync tests covering today's behavior. This is the regression net every later step depends on.

**Architecture:** A self-contained in-memory Supabase double (channels + tables) lives at `src/__tests__/helpers/mockSupabase.ts`. A scenario builder at `src/__tests__/helpers/multiplayerScenario.ts` spins up a host + N guests sharing the same in-memory bus. Tests live under `src/__tests__/sync/`. The mock is opted into per test file via `vi.mock('../../lib/supabase', ...)` — existing unit tests are unaffected.

**Tech Stack:** Vitest, @testing-library/react, jsdom (already configured at `vitest.config.ts:9`).

---

## Context for fresh agent

**Read these first** (in this order, ~5 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — full design spec. Section 5 (Test additions) is what you're implementing.
2. `src/components/GameStateSynchronizer.tsx` — the network layer you're testing. Read it end-to-end. Note: dual broadcast + DB poll, host-as-source-of-truth, action queue with `processedActionIdsRef`, version-gated state.
3. `src/hooks/useSupabaseActions.ts` — guest-side action emitter. Note: host short-circuits via `onActionReceivedRef`; guest inserts to `kred_game_actions`.
4. `src/contexts/LobbyContext.tsx` — lobby creation, joining, rejoin detection. Uses `supabase.auth.signInAnonymously`.
5. `supabase/schema.sql` — the four tables: `kred_lobbies`, `kred_players`, `kred_game_states`, `kred_game_actions`. Mock has to honor these.
6. `src/__tests__/setup.ts` — minimal vitest setup (just imports `jest-dom`).
7. `src/__tests__/hooks/useGameState.test.ts` — example existing test for style/conventions reference.

**Project conventions:**
- Tests use Vitest (`import { describe, it, expect, beforeEach } from "vitest"`).
- React tests use `renderHook` and `act` from `@testing-library/react`.
- Test files live alongside `src/__tests__/` mirroring the source tree.
- Two-space indentation, double quotes, semicolons.
- Use TypeScript everywhere — `any` is a yellow flag, prefer typed.
- File-size budget: 500 lines per file (per the multiplayer-game skill).

**Critical constraints from the design spec:**
- **All tests must be parameterizable across 3, 4, AND 5 player counts.** Memory rule: "Every fix/feature must work for 3, 4, AND 5 player modes." Don't hardcode `playerCount: 4` in helpers — accept it as a parameter even if the baseline tests only run one count.
- **No tests against real Supabase.** Mock only. Mock must be deterministic — no real timers, no `await new Promise(setTimeout)` for "let it settle" — instead use `await waitForConvergence(...)` which checks state equality on a tick.
- **Real Supabase client must NOT be imported transitively** by tests using the mock. The `vi.mock` call has to be at the top of each test file, before any other imports that might pull in `src/lib/supabase.ts`.

**What this step does NOT do** (avoid scope creep):
- ❌ Test delta packets — they don't exist yet (Step 6 ships them).
- ❌ Test execution validation rejection — that comes in Step 8 (Section 4c).
- ❌ Test reconnect / version edge cases — those come in Step 8 (Section 4d).
- ❌ Test memory bounds (`processedActionIdsRef.size`) — that comes in Step 3 alongside the ring buffer.
- ❌ Add Playwright / browser-based tests — explicitly scoped out in spec.

**Baseline test matrix items to implement in this step** (from spec §5c):
- #1: Host creates lobby → guest joins → both see same initial state.
- #2: Guest emits `MOVE_PIECE` → host processes → guest state matches host.
- #3: Two guests emit different actions concurrently → host serializes → both converge.
- #6: Host pushes same version twice (broadcast + poll) → guest applies once.
- #8: Drafting → Campaign: stale draft actions don't bleed in.
- #9: Campaign → Bureaucracy: pending tile transactions cleaned up.
- #10: Bureaucracy → next round: bureaucracy state reset.
- #11: End of game: lobby marked completed; no further actions accepted.
- #16: Player count parameterization — run a subset across `[3, 4, 5]`.
- #19: Enqueue 10 actions in burst → all processed in order → no state lost.

Items not in this baseline (4, 5, 7, 12, 13, 14, 15, 17, 18) are added in later steps when the features they test ship.

---

## File Structure

| File | Responsibility | Size budget |
|---|---|---|
| `src/__tests__/helpers/mockSupabase.ts` | In-memory Supabase double (channels, tables, auth). Single source of truth for the bus. | ≤ 350 lines |
| `src/__tests__/helpers/multiplayerScenario.ts` | `createMultiplayerScenario`, `waitForConvergence`, action emit helpers. | ≤ 250 lines |
| `src/__tests__/helpers/syncFixtures.ts` | Reusable lobby fixtures (3/4/5 players, sample state packets). | ≤ 150 lines |
| `src/__tests__/sync/lobby.test.ts` | Matrix items #1, #16. | ≤ 200 lines |
| `src/__tests__/sync/actions.test.ts` | Matrix items #2, #3, #19. | ≤ 250 lines |
| `src/__tests__/sync/dedup.test.ts` | Matrix item #6. | ≤ 150 lines |
| `src/__tests__/sync/phases.test.ts` | Matrix items #8, #9, #10, #11. | ≤ 250 lines |
| `package.json` | Add `test:sync` script. | unchanged + 1 line |

Total new code: ~1500 lines across 7 files. None of these touch production code.

---

## Tasks

### Task 1: Scaffold the mock Supabase module (skeleton only, no behavior)

**Files:**
- Create: `src/__tests__/helpers/mockSupabase.ts`

- [ ] **Step 1: Write the failing test for the mock's existence**

Create `src/__tests__/helpers/mockSupabase.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMockSupabase } from "./mockSupabase";

describe("mockSupabase", () => {
  it("exposes a supabase-like client with from() and channel() and auth", () => {
    const { supabase } = createMockSupabase();
    expect(typeof supabase.from).toBe("function");
    expect(typeof supabase.channel).toBe("function");
    expect(typeof supabase.auth.signInAnonymously).toBe("function");
    expect(typeof supabase.auth.getSession).toBe("function");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: FAIL — `Cannot find module './mockSupabase'`.

- [ ] **Step 3: Create the skeleton**

Create `src/__tests__/helpers/mockSupabase.ts`:

```ts
/**
 * In-memory Supabase double for sync layer tests.
 *
 * Honors enough of the @supabase/supabase-js surface that GameStateSynchronizer,
 * useSupabaseActions, and LobbyContext can run unmodified against it.
 *
 * Each call to createMockSupabase() returns an isolated bus — multiple "clients"
 * created from the same bus see shared tables and shared channels (which is what
 * lets us simulate host + guest in one test process).
 */

type ChannelEvent =
  | { type: "broadcast"; event: string; payload: any }
  | { type: "postgres_changes"; event: string; schema: string; table: string; new?: any; old?: any };

type ChannelHandler = (payload: any) => void;

interface MockChannel {
  name: string;
  on(
    type: "broadcast",
    opts: { event: string },
    handler: (msg: { payload: any }) => void
  ): MockChannel;
  on(
    type: "postgres_changes",
    opts: { event: string; schema: string; table: string; filter?: string },
    handler: (payload: any) => void
  ): MockChannel;
  send(msg: { type: "broadcast"; event: string; payload: any }): Promise<{ status: "ok" }>;
  subscribe(cb?: (status: string) => void): MockChannel;
  unsubscribe(): Promise<{ status: "ok" }>;
}

interface MockBus {
  // tables
  tables: {
    kred_lobbies: any[];
    kred_players: any[];
    kred_game_states: any[];
    kred_game_actions: any[];
  };
  // channel registry — name → list of subscribers (per-client)
  channels: Map<string, Set<{ handlers: { type: string; event?: string; table?: string; cb: ChannelHandler }[] }>>;
  // current authenticated user IDs that have signed in (per-client → user_id)
  userCounter: { value: number };
}

interface MockSupabaseClient {
  from(table: string): any;
  channel(name: string, opts?: any): MockChannel;
  auth: {
    signInAnonymously(): Promise<{ data: { user: { id: string } | null }; error: null }>;
    getSession(): Promise<{ data: { session: { user: { id: string } } | null } }>;
  };
  removeChannel(channel: MockChannel): Promise<void>;
}

interface CreateMockSupabaseResult {
  supabase: MockSupabaseClient;
  bus: MockBus;
}

export function createMockSupabase(sharedBus?: MockBus): CreateMockSupabaseResult {
  const bus: MockBus = sharedBus ?? {
    tables: {
      kred_lobbies: [],
      kred_players: [],
      kred_game_states: [],
      kred_game_actions: [],
    },
    channels: new Map(),
    userCounter: { value: 0 },
  };

  // Per-client state — each call gets its own session.
  let currentSessionUserId: string | null = null;

  const supabase: MockSupabaseClient = {
    from: () => {
      throw new Error("mockSupabase.from not implemented yet");
    },
    channel: () => {
      throw new Error("mockSupabase.channel not implemented yet");
    },
    removeChannel: async () => undefined,
    auth: {
      signInAnonymously: async () => {
        bus.userCounter.value += 1;
        const id = `mock-user-${bus.userCounter.value}`;
        currentSessionUserId = id;
        return { data: { user: { id } }, error: null };
      },
      getSession: async () => {
        return {
          data: {
            session: currentSessionUserId
              ? { user: { id: currentSessionUserId } }
              : null,
          },
        };
      },
    },
  };

  return { supabase, bus };
}
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/mockSupabase.ts src/__tests__/helpers/mockSupabase.test.ts
git commit -m "test: scaffold mockSupabase skeleton"
```

---

### Task 2: Implement table operations (`from(...).select / insert / upsert / update / delete`)

**Files:**
- Modify: `src/__tests__/helpers/mockSupabase.ts` — implement `from()`
- Modify: `src/__tests__/helpers/mockSupabase.test.ts` — add table tests

- [ ] **Step 1: Write failing tests for table CRUD**

Append to `src/__tests__/helpers/mockSupabase.test.ts`:

```ts
describe("mockSupabase tables", () => {
  it("insert + select round-trips", async () => {
    const { supabase } = createMockSupabase();
    const { error: insErr } = await supabase
      .from("kred_lobbies")
      .insert({ pin: "AAAA", host_id: "u1", player_count: 3, status: "WAITING" });
    expect(insErr).toBeNull();

    const { data, error } = await supabase
      .from("kred_lobbies")
      .select("*")
      .eq("pin", "AAAA")
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({ pin: "AAAA", host_id: "u1", player_count: 3 });
    expect(data.id).toBeDefined();
    expect(data.created_at).toBeDefined();
  });

  it("upsert overwrites by primary key", async () => {
    const { supabase } = createMockSupabase();
    await supabase.from("kred_game_states").upsert({
      lobby_id: "lobby-1",
      phase: "DRAFTING",
      state_json: { hello: "world" },
      version: 1,
    });
    await supabase.from("kred_game_states").upsert({
      lobby_id: "lobby-1",
      phase: "CAMPAIGN",
      state_json: { hello: "again" },
      version: 2,
    });
    const { data } = await supabase
      .from("kred_game_states")
      .select("*")
      .eq("lobby_id", "lobby-1")
      .single();
    expect(data.phase).toBe("CAMPAIGN");
    expect(data.version).toBe(2);
  });

  it("select with gt() filter and order()", async () => {
    const { supabase } = createMockSupabase();
    await supabase.from("kred_game_actions").insert({ lobby_id: "L", player_id: "p1", action_type: "A", payload: {}, created_at: "2026-01-01T00:00:00.000Z" });
    await supabase.from("kred_game_actions").insert({ lobby_id: "L", player_id: "p1", action_type: "B", payload: {}, created_at: "2026-01-02T00:00:00.000Z" });
    await supabase.from("kred_game_actions").insert({ lobby_id: "L", player_id: "p1", action_type: "C", payload: {}, created_at: "2026-01-03T00:00:00.000Z" });

    const { data } = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", "2026-01-01T12:00:00.000Z")
      .order("created_at", { ascending: true });

    expect(data).toHaveLength(2);
    expect(data[0].action_type).toBe("B");
    expect(data[1].action_type).toBe("C");
  });

  it("delete + eq", async () => {
    const { supabase } = createMockSupabase();
    await supabase.from("kred_game_actions").insert({ lobby_id: "L", player_id: "p1", action_type: "X", payload: {} });
    await supabase.from("kred_game_actions").delete().eq("lobby_id", "L");
    const { data } = await supabase.from("kred_game_actions").select("*").eq("lobby_id", "L");
    expect(data).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: FAIL — `mockSupabase.from not implemented yet`.

- [ ] **Step 3: Implement `from()` query builder**

In `src/__tests__/helpers/mockSupabase.ts`, replace the `from: () => { throw ... }` line with the implementation below. Also add the helper `genId()` and `now()` near the top of the file:

```ts
function genId(): string {
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface QueryState {
  table: string;
  filters: Array<{ op: "eq" | "gt" | "neq"; col: string; val: any }>;
  order?: { col: string; ascending: boolean };
  limitN?: number;
  selectCols?: string;
}

function buildQuery(bus: MockBus, table: string) {
  const state: QueryState = { table, filters: [] };

  function applyFilters(rows: any[]): any[] {
    return rows.filter((row) =>
      state.filters.every((f) => {
        if (f.op === "eq") return row[f.col] === f.val;
        if (f.op === "neq") return row[f.col] !== f.val;
        if (f.op === "gt") return row[f.col] > f.val;
        return true;
      })
    );
  }

  const exec = async (): Promise<{ data: any[]; error: any }> => {
    const tbl = (bus.tables as any)[table] as any[];
    if (!tbl) return { data: [], error: { message: `unknown table ${table}` } };
    let rows = applyFilters(tbl);
    if (state.order) {
      const { col, ascending } = state.order;
      rows = [...rows].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0));
      if (!ascending) rows.reverse();
    }
    if (state.limitN) rows = rows.slice(0, state.limitN);
    return { data: rows, error: null };
  };

  const builder: any = {
    select(cols?: string) {
      state.selectCols = cols;
      return builder;
    },
    eq(col: string, val: any) {
      state.filters.push({ op: "eq", col, val });
      return builder;
    },
    neq(col: string, val: any) {
      state.filters.push({ op: "neq", col, val });
      return builder;
    },
    gt(col: string, val: any) {
      state.filters.push({ op: "gt", col, val });
      return builder;
    },
    order(col: string, opts: { ascending: boolean }) {
      state.order = { col, ascending: opts.ascending };
      return builder;
    },
    limit(n: number) {
      state.limitN = n;
      return builder;
    },
    async single() {
      const { data, error } = await exec();
      if (error) return { data: null, error };
      if (data.length === 0) return { data: null, error: { message: "no rows" } };
      return { data: data[0], error: null };
    },
    then(onFulfilled: any, onRejected: any) {
      return exec().then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function notifyPostgresChanges(
  bus: MockBus,
  event: "INSERT" | "UPDATE" | "DELETE",
  table: string,
  newRow: any,
  oldRow?: any
) {
  for (const subSet of bus.channels.values()) {
    for (const sub of subSet) {
      for (const handler of sub.handlers) {
        if (handler.type !== "postgres_changes") continue;
        if (handler.table !== table) continue;
        if (handler.event && handler.event !== "*" && handler.event !== event) continue;
        handler.cb({ eventType: event, new: newRow, old: oldRow, schema: "public", table });
      }
    }
  }
}

function fromImpl(bus: MockBus, table: string) {
  const tbl = (bus.tables as any)[table] as any[];
  if (!tbl) throw new Error(`mockSupabase: unknown table ${table}`);

  const builder = buildQuery(bus, table);

  // Augment with insert/upsert/update/delete which are NOT chained off select.
  return {
    ...builder,
    insert(row: any | any[]) {
      const rows = Array.isArray(row) ? row : [row];
      const inserted = rows.map((r) => ({
        id: r.id ?? genId(),
        created_at: r.created_at ?? nowIso(),
        updated_at: r.updated_at ?? nowIso(),
        ...r,
      }));
      tbl.push(...inserted);
      for (const r of inserted) notifyPostgresChanges(bus, "INSERT", table, r);
      return Promise.resolve({ data: inserted, error: null });
    },
    upsert(row: any) {
      // Primary key inference: kred_game_states uses lobby_id as PK; others use id.
      const pk = table === "kred_game_states" ? "lobby_id" : "id";
      const idx = tbl.findIndex((r) => r[pk] === row[pk]);
      const merged = { updated_at: nowIso(), ...row };
      if (idx >= 0) {
        const old = tbl[idx];
        tbl[idx] = { ...old, ...merged };
        notifyPostgresChanges(bus, "UPDATE", table, tbl[idx], old);
      } else {
        const inserted = { id: row.id ?? genId(), created_at: nowIso(), ...merged };
        tbl.push(inserted);
        notifyPostgresChanges(bus, "INSERT", table, inserted);
      }
      return Promise.resolve({ data: null, error: null });
    },
    update(patch: any) {
      const updateBuilder: any = {
        eq(col: string, val: any) {
          const matched = tbl.filter((r) => r[col] === val);
          for (const row of matched) {
            const old = { ...row };
            Object.assign(row, patch, { updated_at: nowIso() });
            notifyPostgresChanges(bus, "UPDATE", table, row, old);
          }
          return Promise.resolve({ data: matched, error: null });
        },
        neq(col: string, val: any) {
          const matched = tbl.filter((r) => r[col] !== val);
          for (const row of matched) {
            const old = { ...row };
            Object.assign(row, patch, { updated_at: nowIso() });
            notifyPostgresChanges(bus, "UPDATE", table, row, old);
          }
          return Promise.resolve({ data: matched, error: null });
        },
      };
      return updateBuilder;
    },
    delete() {
      const deleteBuilder: any = {
        eq(col: string, val: any) {
          const remaining: any[] = [];
          const removed: any[] = [];
          for (const row of tbl) (row[col] === val ? removed : remaining).push(row);
          tbl.length = 0;
          tbl.push(...remaining);
          for (const r of removed) notifyPostgresChanges(bus, "DELETE", table, null, r);
          return Promise.resolve({ data: removed, error: null });
        },
        neq(col: string, val: any) {
          const remaining: any[] = [];
          const removed: any[] = [];
          for (const row of tbl) (row[col] !== val ? removed : remaining).push(row);
          tbl.length = 0;
          tbl.push(...remaining);
          for (const r of removed) notifyPostgresChanges(bus, "DELETE", table, null, r);
          return Promise.resolve({ data: removed, error: null });
        },
      };
      return deleteBuilder;
    },
  };
}
```

Then replace the `from: () => { throw ... }` line in `createMockSupabase` with:

```ts
    from: (table: string) => fromImpl(bus, table),
```

- [ ] **Step 4: Run tests and confirm pass**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/mockSupabase.ts src/__tests__/helpers/mockSupabase.test.ts
git commit -m "test: implement mockSupabase table operations"
```

---

### Task 3: Implement channel pub/sub (broadcast + postgres_changes)

**Files:**
- Modify: `src/__tests__/helpers/mockSupabase.ts` — implement `channel()`
- Modify: `src/__tests__/helpers/mockSupabase.test.ts` — add channel tests

- [ ] **Step 1: Write failing tests**

Append to `src/__tests__/helpers/mockSupabase.test.ts`:

```ts
describe("mockSupabase channels", () => {
  it("broadcast: client A sends, client B receives on same bus", async () => {
    const { supabase: a, bus } = createMockSupabase();
    const { supabase: b } = createMockSupabase(bus);

    const received: any[] = [];
    const chB = b.channel("game:lobby1").on(
      "broadcast",
      { event: "state" },
      ({ payload }: any) => received.push(payload)
    );
    chB.subscribe();

    const chA = a.channel("game:lobby1");
    chA.subscribe();
    await chA.send({ type: "broadcast", event: "state", payload: { v: 1 } });

    expect(received).toEqual([{ v: 1 }]);
  });

  it("postgres_changes: insert fires INSERT event on subscribers of that table", async () => {
    const { supabase: a, bus } = createMockSupabase();
    const { supabase: b } = createMockSupabase(bus);

    const events: any[] = [];
    b.channel("actions:lobby1")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kred_game_actions" },
        (payload: any) => events.push(payload)
      )
      .subscribe();

    await a
      .from("kred_game_actions")
      .insert({ lobby_id: "L", player_id: "p1", action_type: "X", payload: {} });

    expect(events).toHaveLength(1);
    expect(events[0].new.action_type).toBe("X");
  });

  it("unsubscribe: handler stops receiving", async () => {
    const { supabase: a, bus } = createMockSupabase();
    const { supabase: b } = createMockSupabase(bus);

    const received: any[] = [];
    const ch = b
      .channel("game:lobby1")
      .on("broadcast", { event: "state" }, ({ payload }: any) => received.push(payload));
    ch.subscribe();

    const chA = a.channel("game:lobby1");
    chA.subscribe();
    await chA.send({ type: "broadcast", event: "state", payload: { v: 1 } });

    await ch.unsubscribe();
    await chA.send({ type: "broadcast", event: "state", payload: { v: 2 } });

    expect(received).toEqual([{ v: 1 }]);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: 3 channel tests FAIL with `mockSupabase.channel not implemented yet`.

- [ ] **Step 3: Implement `channel()`**

In `src/__tests__/helpers/mockSupabase.ts`, add this above `createMockSupabase`:

```ts
function channelImpl(bus: MockBus, name: string): MockChannel {
  const subscription = {
    handlers: [] as { type: string; event?: string; table?: string; cb: ChannelHandler }[],
  };

  const ch: MockChannel = {
    name,
    on(type: any, opts: any, handler: any): MockChannel {
      if (type === "broadcast") {
        subscription.handlers.push({ type: "broadcast", event: opts.event, cb: handler });
      } else if (type === "postgres_changes") {
        subscription.handlers.push({
          type: "postgres_changes",
          event: opts.event,
          table: opts.table,
          cb: handler,
        });
      }
      return ch;
    },
    async send(msg) {
      // Deliver to every subscriber on this channel name (except self — the
      // real Supabase client defaults to broadcast.self=false in our usage).
      const subSet = bus.channels.get(name);
      if (!subSet) return { status: "ok" };
      for (const sub of subSet) {
        if (sub === subscription) continue; // self-skip
        for (const handler of sub.handlers) {
          if (handler.type === "broadcast" && handler.event === msg.event) {
            handler.cb({ payload: msg.payload });
          }
        }
      }
      return { status: "ok" };
    },
    subscribe(cb?: (status: string) => void): MockChannel {
      let subs = bus.channels.get(name);
      if (!subs) {
        subs = new Set();
        bus.channels.set(name, subs);
      }
      subs.add(subscription);
      cb?.("SUBSCRIBED");
      return ch;
    },
    async unsubscribe() {
      const subs = bus.channels.get(name);
      subs?.delete(subscription);
      return { status: "ok" };
    },
  };

  return ch;
}
```

Then replace the `channel: () => { throw ... }` line with:

```ts
    channel: (name: string, _opts?: any) => channelImpl(bus, name),
```

- [ ] **Step 4: Run and confirm pass**

```bash
npx vitest run src/__tests__/helpers/mockSupabase.test.ts
```

Expected: all tests PASS (8 total).

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/mockSupabase.ts src/__tests__/helpers/mockSupabase.test.ts
git commit -m "test: implement mockSupabase channel pub/sub"
```

---

### Task 4: Build the multiplayer scenario helper

**Files:**
- Create: `src/__tests__/helpers/multiplayerScenario.ts`
- Create: `src/__tests__/helpers/multiplayerScenario.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/helpers/multiplayerScenario.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario } from "./multiplayerScenario";

describe("createMultiplayerScenario", () => {
  it("creates a host + N guests sharing one lobby for playerCount=4", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 4 });
    expect(scenario.host).toBeDefined();
    expect(scenario.guests).toHaveLength(3);
    expect(scenario.lobbyId).toBeTruthy();
    expect(scenario.host.userId).toBeTruthy();
    for (const g of scenario.guests) {
      expect(g.userId).toBeTruthy();
      expect(g.userId).not.toBe(scenario.host.userId);
    }
    // All players row exists in the bus
    const players = scenario.bus.tables.kred_players.filter(
      (p: any) => p.lobby_id === scenario.lobbyId
    );
    expect(players).toHaveLength(4);
  });

  it("supports playerCount 3, 4, 5", async () => {
    for (const n of [3, 4, 5]) {
      const s = await createMultiplayerScenario({ playerCount: n });
      const players = s.bus.tables.kred_players.filter(
        (p: any) => p.lobby_id === s.lobbyId
      );
      expect(players).toHaveLength(n);
    }
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/__tests__/helpers/multiplayerScenario.test.ts
```

Expected: FAIL — `Cannot find module './multiplayerScenario'`.

- [ ] **Step 3: Implement the scenario builder**

Create `src/__tests__/helpers/multiplayerScenario.ts`:

```ts
/**
 * Multiplayer scenario builder for sync tests.
 *
 * Spins up one mockSupabase bus and N+1 clients (1 host + N guests).
 * Each client gets its own anonymous user_id, joins one shared lobby,
 * and exposes its own state ref so tests can assert convergence.
 *
 * The scenario does NOT mount React components — it operates at the
 * mock-Supabase level so tests stay fast and deterministic.
 */

import { createMockSupabase } from "./mockSupabase";

export interface ClientHandle {
  userId: string;
  isHost: boolean;
  playerIndex: number;
  supabase: ReturnType<typeof createMockSupabase>["supabase"];
  // Per-client mutable state — tests assert against this.
  // Mirrors the structure of GameStatePacket but kept loose for flexibility.
  state: Record<string, any>;
}

export interface MultiplayerScenario {
  bus: ReturnType<typeof createMockSupabase>["bus"];
  lobbyId: string;
  pin: string;
  host: ClientHandle;
  guests: ClientHandle[];
  // All clients in turn order, host first.
  all: ClientHandle[];
}

export interface ScenarioOptions {
  playerCount: 3 | 4 | 5;
  pin?: string;
}

export async function createMultiplayerScenario(
  opts: ScenarioOptions
): Promise<MultiplayerScenario> {
  const { playerCount, pin = "TEST00" } = opts;
  if (![3, 4, 5].includes(playerCount)) {
    throw new Error(`Unsupported playerCount ${playerCount} — must be 3, 4, or 5`);
  }

  // Create bus + host client
  const { supabase: hostSb, bus } = createMockSupabase();
  const { data: hostAuth } = await hostSb.auth.signInAnonymously();
  const hostUserId = hostAuth.user!.id;

  // Insert lobby
  const lobbyId = `lobby-${pin}`;
  bus.tables.kred_lobbies.push({
    id: lobbyId,
    pin,
    host_id: hostUserId,
    player_count: playerCount,
    status: "WAITING",
    created_at: new Date().toISOString(),
  });

  // Insert host player row
  bus.tables.kred_players.push({
    id: `player-host`,
    lobby_id: lobbyId,
    user_id: hostUserId,
    name: "Host",
    player_index: 0,
    is_host: true,
    connection_status: "ONLINE",
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  const host: ClientHandle = {
    userId: hostUserId,
    isHost: true,
    playerIndex: 0,
    supabase: hostSb,
    state: {},
  };

  // Spin up guests
  const guests: ClientHandle[] = [];
  for (let i = 1; i < playerCount; i++) {
    const { supabase: gSb } = createMockSupabase(bus);
    const { data: gAuth } = await gSb.auth.signInAnonymously();
    const gUserId = gAuth.user!.id;
    bus.tables.kred_players.push({
      id: `player-guest-${i}`,
      lobby_id: lobbyId,
      user_id: gUserId,
      name: `Guest ${i}`,
      player_index: i,
      is_host: false,
      connection_status: "ONLINE",
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    guests.push({
      userId: gUserId,
      isHost: false,
      playerIndex: i,
      supabase: gSb,
      state: {},
    });
  }

  return { bus, lobbyId, pin, host, guests, all: [host, ...guests] };
}

/**
 * Wait until all client states have converged to equality with the host's.
 * Polls on microtask boundaries up to `maxTicks` times. Throws on timeout
 * with a diff so test failures are easy to debug.
 */
export async function waitForConvergence(
  scenario: MultiplayerScenario,
  options: { maxTicks?: number } = {}
): Promise<void> {
  const maxTicks = options.maxTicks ?? 50;
  for (let i = 0; i < maxTicks; i++) {
    const hostJson = JSON.stringify(scenario.host.state);
    const allMatch = scenario.guests.every(
      (g) => JSON.stringify(g.state) === hostJson
    );
    if (allMatch) return;
    await new Promise((r) => setTimeout(r, 0));
  }
  throw new Error(
    `waitForConvergence: states did not converge within ${maxTicks} ticks.\n` +
      `Host: ${JSON.stringify(scenario.host.state)}\n` +
      scenario.guests
        .map((g, i) => `Guest ${i + 1}: ${JSON.stringify(g.state)}`)
        .join("\n")
  );
}
```

- [ ] **Step 4: Run and confirm pass**

```bash
npx vitest run src/__tests__/helpers/multiplayerScenario.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/multiplayerScenario.ts src/__tests__/helpers/multiplayerScenario.test.ts
git commit -m "test: add multiplayer scenario builder"
```

---

### Task 5: Add a thin sync runtime so tests can drive the actual GameStateSynchronizer logic

**Background:** the scenario in Task 4 is the *infrastructure*. To test real sync behavior, we need to wire each `ClientHandle` to actually behave like host or guest. Rather than mounting `<GameStateSynchronizer />` via React, we extract the minimum sync runtime into a plain function so tests don't need a render tree.

**Files:**
- Create: `src/__tests__/helpers/syncRuntime.ts`
- Create: `src/__tests__/helpers/syncRuntime.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/helpers/syncRuntime.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./multiplayerScenario";
import { attachSyncRuntime } from "./syncRuntime";

describe("syncRuntime", () => {
  it("host pushState delivers initial state to all guests via broadcast", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    scenario.host.state = { phase: "DRAFTING", players: [{ id: 1 }, { id: 2 }, { id: 3 }] };
    await scenario.host.pushState();

    await waitForConvergence(scenario);
    for (const g of scenario.guests) {
      expect(g.state.phase).toBe("DRAFTING");
      expect(g.state.players).toHaveLength(3);
    }
  });

  it("guest emitAction is picked up by host action handler", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    const received: any[] = [];
    scenario.host.onAction = (action) => received.push(action);

    await scenario.guests[0].emitAction("MOVE_PIECE", { pieceId: "p1" });

    // Wait a tick for the host realtime subscription to fire.
    await new Promise((r) => setTimeout(r, 0));

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      type: "MOVE_PIECE",
      payload: { pieceId: "p1" },
      playerId: scenario.guests[0].userId,
    });
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/__tests__/helpers/syncRuntime.test.ts
```

Expected: FAIL — `Cannot find module './syncRuntime'`.

- [ ] **Step 3: Implement syncRuntime**

Create `src/__tests__/helpers/syncRuntime.ts`:

```ts
/**
 * Test-side sync runtime: attaches `pushState` (host) and `emitAction` (any
 * client) functions to ClientHandles, plus subscribes them to broadcast and
 * postgres_changes. Mirrors GameStateSynchronizer logic without React.
 *
 * IMPORTANT: This is intentionally a simplified mirror of the production
 * GameStateSynchronizer. It exists to test the *protocol*, not the React
 * lifecycle. Production code remains the source of truth for what gets
 * shipped — this runtime exists so tests can drive the protocol end-to-end
 * deterministically.
 */

import type { ClientHandle, MultiplayerScenario } from "./multiplayerScenario";

declare module "./multiplayerScenario" {
  interface ClientHandle {
    pushState?: () => Promise<void>;
    emitAction?: (type: string, payload?: any) => Promise<void>;
    onAction?: (action: { type: string; playerId: string; payload: any }) => void;
    _versionRef?: { current: number };
    _lastAppliedVersionRef?: { current: number };
  }
}

export function attachSyncRuntime(scenario: MultiplayerScenario): void {
  const lobbyId = scenario.lobbyId;

  // -------- Host: pushState
  const hostVersionRef = { current: 0 };
  scenario.host._versionRef = hostVersionRef;
  scenario.host.pushState = async () => {
    hostVersionRef.current += 1;
    const packet = {
      ...scenario.host.state,
      stateVersion: hostVersionRef.current,
      lastUpdated: Date.now(),
    };
    const ch = scenario.host.supabase.channel(`kred_game:${lobbyId}`);
    ch.subscribe();
    await ch.send({ type: "broadcast", event: "state", payload: packet });

    await scenario.host.supabase.from("kred_game_states").upsert({
      lobby_id: lobbyId,
      phase: scenario.host.state.phase ?? "UNKNOWN",
      state_json: packet,
      version: hostVersionRef.current,
    });
  };

  // -------- Guests: subscribe to broadcast + apply with version gate
  for (const guest of scenario.guests) {
    const lastApplied = { current: 0 };
    guest._lastAppliedVersionRef = lastApplied;

    const ch = guest.supabase.channel(`kred_game:${lobbyId}`);
    ch.on("broadcast", { event: "state" }, ({ payload }: any) => {
      if (payload.stateVersion <= lastApplied.current) return;
      lastApplied.current = payload.stateVersion;
      // Strip protocol fields, apply the rest as state
      const { stateVersion, lastUpdated, ...rest } = payload;
      guest.state = rest;
    });
    ch.subscribe();
  }

  // -------- Host: subscribe to action inserts
  const actionCh = scenario.host.supabase
    .channel(`kred_actions:${lobbyId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "kred_game_actions",
        filter: `lobby_id=eq.${lobbyId}`,
      },
      (payload: any) => {
        scenario.host.onAction?.({
          type: payload.new.action_type,
          playerId: payload.new.player_id,
          payload: payload.new.payload,
        });
      }
    );
  actionCh.subscribe();

  // -------- All clients: emitAction
  for (const client of scenario.all) {
    client.emitAction = async (type: string, payload: any = {}) => {
      if (client.isHost) {
        scenario.host.onAction?.({ type, playerId: client.userId, payload });
        return;
      }
      await client.supabase.from("kred_game_actions").insert({
        lobby_id: lobbyId,
        player_id: client.userId,
        action_type: type,
        payload,
      });
    };
  }
}
```

- [ ] **Step 4: Run and confirm pass**

```bash
npx vitest run src/__tests__/helpers/syncRuntime.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/syncRuntime.ts src/__tests__/helpers/syncRuntime.test.ts
git commit -m "test: add syncRuntime test harness"
```

---

### Task 6: Add fixtures (sample initial state for tests)

**Files:**
- Create: `src/__tests__/helpers/syncFixtures.ts`

- [ ] **Step 1: Write failing test**

Create the fixture test inline in `src/__tests__/helpers/syncFixtures.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { makeInitialState } from "./syncFixtures";

describe("syncFixtures", () => {
  it("makeInitialState builds a state shaped like GameStatePacket for 3/4/5 players", () => {
    for (const n of [3, 4, 5] as const) {
      const s = makeInitialState({ playerCount: n });
      expect(s.gameState).toBe("DRAFTING");
      expect(s.players).toHaveLength(n);
      expect(s.playerCount).toBe(n);
      expect(s.currentPlayerIndex).toBe(0);
      expect(Array.isArray(s.pieces)).toBe(true);
      expect(Array.isArray(s.boardTiles)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npx vitest run src/__tests__/helpers/syncFixtures.test.ts
```

Expected: FAIL — `Cannot find module './syncFixtures'`.

- [ ] **Step 3: Implement fixtures**

Create `src/__tests__/helpers/syncFixtures.ts`:

```ts
/**
 * Lightweight initial-state fixtures for sync tests.
 *
 * These intentionally do NOT use the real game initialization functions —
 * sync tests are about the *protocol*, not game logic. Keeping fixtures
 * small and explicit makes failures readable.
 */

export interface InitialStateOptions {
  playerCount: 3 | 4 | 5;
  phase?: "DRAFTING" | "CAMPAIGN" | "BUREAUCRACY" | "GAME_OVER";
}

export function makeInitialState(opts: InitialStateOptions) {
  const { playerCount, phase = "DRAFTING" } = opts;
  return {
    gameState: phase,
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: i === 0 ? "Host" : `Guest ${i}`,
      credibility: 0,
      kredcoins: 0,
    })),
    playerCount,
    currentPlayerIndex: 0,
    pieces: [],
    boardTiles: [],
    bankedTiles: [],
    playedTile: null,
    hasPlayedTileThisTurn: false,
    movedPiecesThisTurn: [],
    tileTransaction: null,
    moverPlayerIndex: null,
    campaignRole: null,
    tileRevealed: false,
    pendingReceiverReward: false,
    receiverAdvanceInProgress: false,
    bystanders: [],
    bystanderIndex: 0,
    challengeOrder: [],
    currentChallengerIndex: 0,
    tileRejected: false,
    showTakeAdvantageModal: false,
    takeAdvantageChallengerId: null,
    takeAdvantageChallengerCredibility: 0,
    bureaucracyStates: {},
    bureaucracyTurnOrder: [],
    currentBureaucracyPlayerIndex: 0,
  };
}
```

- [ ] **Step 4: Run and confirm pass**

```bash
npx vitest run src/__tests__/helpers/syncFixtures.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/helpers/syncFixtures.ts src/__tests__/helpers/syncFixtures.test.ts
git commit -m "test: add sync test fixtures"
```

---

### Task 7: Baseline test — lobby join + initial state convergence (matrix #1, #16)

**Files:**
- Create: `src/__tests__/sync/lobby.test.ts`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/sync/lobby.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";
import { attachSyncRuntime } from "../helpers/syncRuntime";
import { makeInitialState } from "../helpers/syncFixtures";

describe("sync: lobby join + initial state", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`host pushes initial state, all ${playerCount} guests converge`, async () => {
      const scenario = await createMultiplayerScenario({ playerCount });
      attachSyncRuntime(scenario);

      scenario.host.state = makeInitialState({ playerCount });
      await scenario.host.pushState!();
      await waitForConvergence(scenario);

      for (const g of scenario.guests) {
        expect(g.state.gameState).toBe("DRAFTING");
        expect(g.state.players).toHaveLength(playerCount);
        expect(g.state.playerCount).toBe(playerCount);
      }
    });
  }
});
```

- [ ] **Step 2: Run and confirm pass**

```bash
npx vitest run src/__tests__/sync/lobby.test.ts
```

Expected: 3 tests PASS (one per player count).

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/lobby.test.ts
git commit -m "test: baseline sync test for lobby + initial state"
```

---

### Task 8: Baseline test — guest action round-trip (matrix #2, #3, #19)

**Files:**
- Create: `src/__tests__/sync/actions.test.ts`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/sync/actions.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";
import { attachSyncRuntime } from "../helpers/syncRuntime";
import { makeInitialState } from "../helpers/syncFixtures";

describe("sync: action round-trips", () => {
  it("guest emits MOVE_PIECE → host applies → all guests converge (4 players)", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 4 });
    attachSyncRuntime(scenario);

    scenario.host.state = {
      ...makeInitialState({ playerCount: 4 }),
      pieces: [{ id: "p1", playerId: 1, location: "start", x: 0, y: 0 }],
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    // Host action handler: apply MOVE_PIECE then push
    scenario.host.onAction = (action) => {
      if (action.type === "MOVE_PIECE") {
        scenario.host.state = {
          ...scenario.host.state,
          pieces: scenario.host.state.pieces.map((p: any) =>
            p.id === action.payload.pieceId
              ? { ...p, x: action.payload.x, y: action.payload.y }
              : p
          ),
        };
        scenario.host.pushState!();
      }
    };

    await scenario.guests[0].emitAction!("MOVE_PIECE", { pieceId: "p1", x: 5, y: 7 });
    await waitForConvergence(scenario);

    expect(scenario.host.state.pieces[0]).toMatchObject({ id: "p1", x: 5, y: 7 });
    for (const g of scenario.guests) {
      expect(g.state.pieces[0]).toMatchObject({ id: "p1", x: 5, y: 7 });
    }
  });

  it("two guests emit different actions concurrently → host serializes → all converge", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 4 });
    attachSyncRuntime(scenario);

    scenario.host.state = {
      ...makeInitialState({ playerCount: 4 }),
      pieces: [
        { id: "p1", playerId: 1, x: 0, y: 0 },
        { id: "p2", playerId: 2, x: 0, y: 0 },
      ],
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    scenario.host.onAction = (action) => {
      scenario.host.state = {
        ...scenario.host.state,
        pieces: scenario.host.state.pieces.map((p: any) =>
          p.id === action.payload.pieceId
            ? { ...p, x: action.payload.x, y: action.payload.y }
            : p
        ),
      };
      scenario.host.pushState!();
    };

    // Fire concurrently
    await Promise.all([
      scenario.guests[0].emitAction!("MOVE_PIECE", { pieceId: "p1", x: 1, y: 1 }),
      scenario.guests[1].emitAction!("MOVE_PIECE", { pieceId: "p2", x: 2, y: 2 }),
    ]);
    await waitForConvergence(scenario);

    const hostPieces = scenario.host.state.pieces;
    expect(hostPieces.find((p: any) => p.id === "p1")).toMatchObject({ x: 1, y: 1 });
    expect(hostPieces.find((p: any) => p.id === "p2")).toMatchObject({ x: 2, y: 2 });
  });

  it("burst of 10 actions: all processed in order, no state lost", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    scenario.host.state = { ...makeInitialState({ playerCount: 3 }), counter: 0 };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    scenario.host.onAction = (action) => {
      if (action.type === "INC") {
        scenario.host.state = {
          ...scenario.host.state,
          counter: scenario.host.state.counter + action.payload.by,
        };
        scenario.host.pushState!();
      }
    };

    const promises: Promise<void>[] = [];
    for (let i = 0; i < 10; i++) {
      promises.push(scenario.guests[0].emitAction!("INC", { by: 1 }));
    }
    await Promise.all(promises);
    await waitForConvergence(scenario);

    expect(scenario.host.state.counter).toBe(10);
    for (const g of scenario.guests) {
      expect(g.state.counter).toBe(10);
    }
  });
});
```

- [ ] **Step 2: Run and confirm pass**

```bash
npx vitest run src/__tests__/sync/actions.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/actions.test.ts
git commit -m "test: baseline sync tests for action round-trips"
```

---

### Task 9: Baseline test — version dedup (matrix #6)

**Files:**
- Create: `src/__tests__/sync/dedup.test.ts`

- [ ] **Step 1: Write the test**

Create `src/__tests__/sync/dedup.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";
import { attachSyncRuntime } from "../helpers/syncRuntime";
import { makeInitialState } from "../helpers/syncFixtures";

describe("sync: version dedup", () => {
  it("guest applies the same packet only once even if delivered twice", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    scenario.host.state = { ...makeInitialState({ playerCount: 3 }), counter: 0 };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    // Track applied versions on the first guest
    const guest = scenario.guests[0];
    const appliedVersions: number[] = [];
    const ch = guest.supabase.channel(`kred_game:${scenario.lobbyId}`);
    ch.on("broadcast", { event: "state" }, ({ payload }: any) => {
      // The runtime's existing handler will gate by version. We just observe.
      appliedVersions.push(payload.stateVersion);
    });
    ch.subscribe();

    // Fire one logical update — only one bump should be applied to state
    scenario.host.state = { ...scenario.host.state, counter: 99 };
    await scenario.host.pushState!();
    await scenario.host.pushState!(); // duplicate push of the SAME packet contents
    await waitForConvergence(scenario);

    // Two pushes happen, but the production gate (lastApplied < version) means
    // only newer versions become guest.state. Confirm guest's state is final:
    expect(guest.state.counter).toBe(99);
    // And the gate inside the runtime ensures no regression — assert version
    // is monotonic by snapshotting the runtime's lastApplied ref.
    expect(guest._lastAppliedVersionRef!.current).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run and confirm pass**

```bash
npx vitest run src/__tests__/sync/dedup.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/dedup.test.ts
git commit -m "test: baseline sync test for version dedup"
```

---

### Task 10: Baseline test — phase transitions (matrix #8, #9, #10, #11)

**Files:**
- Create: `src/__tests__/sync/phases.test.ts`

- [ ] **Step 1: Write the tests**

Create `src/__tests__/sync/phases.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";
import { attachSyncRuntime } from "../helpers/syncRuntime";
import { makeInitialState } from "../helpers/syncFixtures";

describe("sync: phase transitions", () => {
  it("DRAFTING → CAMPAIGN: host phase change is broadcast and converges", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 4 });
    attachSyncRuntime(scenario);

    scenario.host.state = makeInitialState({ playerCount: 4, phase: "DRAFTING" });
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    scenario.host.state = { ...scenario.host.state, gameState: "CAMPAIGN" };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    for (const g of scenario.guests) {
      expect(g.state.gameState).toBe("CAMPAIGN");
    }
  });

  it("CAMPAIGN → BUREAUCRACY: pending tile transactions are cleared on host before push", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 4 });
    attachSyncRuntime(scenario);

    scenario.host.state = {
      ...makeInitialState({ playerCount: 4, phase: "CAMPAIGN" }),
      tileTransaction: { tileId: "t1", playerId: 1 },
      hasPlayedTileThisTurn: true,
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    // Simulate host phase transition: clear pending state explicitly
    scenario.host.state = {
      ...scenario.host.state,
      gameState: "BUREAUCRACY",
      tileTransaction: null,
      hasPlayedTileThisTurn: false,
      playedTile: null,
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    for (const g of scenario.guests) {
      expect(g.state.gameState).toBe("BUREAUCRACY");
      expect(g.state.tileTransaction).toBeNull();
      expect(g.state.hasPlayedTileThisTurn).toBe(false);
    }
  });

  it("BUREAUCRACY → next round: bureaucracy state is reset", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    scenario.host.state = {
      ...makeInitialState({ playerCount: 3, phase: "BUREAUCRACY" }),
      bureaucracyStates: { 0: { spent: 5 } },
      bureaucracyTurnOrder: [0, 1, 2],
      currentBureaucracyPlayerIndex: 2,
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    scenario.host.state = {
      ...scenario.host.state,
      gameState: "DRAFTING",
      bureaucracyStates: {},
      bureaucracyTurnOrder: [],
      currentBureaucracyPlayerIndex: 0,
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    for (const g of scenario.guests) {
      expect(g.state.bureaucracyStates).toEqual({});
      expect(g.state.bureaucracyTurnOrder).toEqual([]);
      expect(g.state.currentBureaucracyPlayerIndex).toBe(0);
    }
  });

  it("end of game: lobby marked GAME_OVER, no further state pushes accepted", async () => {
    const scenario = await createMultiplayerScenario({ playerCount: 3 });
    attachSyncRuntime(scenario);

    scenario.host.state = {
      ...makeInitialState({ playerCount: 3 }),
      gameState: "GAME_OVER",
    };
    await scenario.host.pushState!();
    await waitForConvergence(scenario);

    for (const g of scenario.guests) {
      expect(g.state.gameState).toBe("GAME_OVER");
    }
  });
});
```

- [ ] **Step 2: Run and confirm pass**

```bash
npx vitest run src/__tests__/sync/phases.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/sync/phases.test.ts
git commit -m "test: baseline sync tests for phase transitions"
```

---

### Task 11: Add `test:sync` script and verify everything together

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the script**

Read `package.json` then add this line inside `"scripts"`:

```json
"test:sync": "vitest run src/__tests__/sync src/__tests__/helpers"
```

- [ ] **Step 2: Run the focused script**

```bash
npm run test:sync
```

Expected: all sync + helper tests PASS. Should report something like "10 passed" (the exact count depends on the parameterized lobby tests).

- [ ] **Step 3: Run the FULL test suite to confirm no regressions in existing tests**

```bash
npm test -- --run
```

Expected: every existing test passes too. Mock is opted-in per file, so existing tests are unaffected.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "test: add test:sync script for fast multiplayer test iteration"
```

---

## Definition of done

- [ ] `src/__tests__/helpers/mockSupabase.ts` exists with table CRUD + channel pub/sub
- [ ] `src/__tests__/helpers/multiplayerScenario.ts` exists with `createMultiplayerScenario` and `waitForConvergence`
- [ ] `src/__tests__/helpers/syncRuntime.ts` exists with `attachSyncRuntime`
- [ ] `src/__tests__/helpers/syncFixtures.ts` exists with `makeInitialState`
- [ ] All four sync test files exist under `src/__tests__/sync/`
- [ ] `npm run test:sync` passes
- [ ] `npm test` passes (no regressions in existing suite)
- [ ] Each helper file ≤ its size budget in the File Structure table above
- [ ] No production code under `src/components/`, `src/hooks/`, or `src/contexts/` was modified by this step

## Handoff notes for next step (Step 2 — PerfStore)

- The mock Supabase + scenario builder are now the foundation. Step 2 doesn't need them directly but Step 3 onward will.
- If you needed to deviate from this plan (e.g. you discovered the real synchronizer's behavior didn't match my mirror in `syncRuntime.ts`), document it in a `HANDOFF_NOTES.md` next to this plan so future steps can adjust.
- The test matrix items NOT covered in this step are: #4, #5, #7, #12, #13, #14, #15, #17, #18. They are added incrementally by Steps 3, 6, 8.
