# Diagnostics Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local PHP-based diagnostic viewer under `/diagnostics/` that reads Tier 2 UI event logs captured from online KRED games, with opt-in-per-session host toggle, 7-day auto-purge, and JSON export.

**Architecture:** Three pieces. (1) Supabase schema additions — three new tables (`kred_diagnostic_sessions`, `kred_diagnostic_events`, `kred_diagnostic_meta`) plus a `diagnostic_enabled` column on `kred_lobbies`. (2) Game-side TypeScript capture layer under `src/diagnostics/` that's a silent no-op unless the lobby opted in; instrumentation happens via wrapping existing shared primitives (action dispatcher, modal, drag handlers), not scattered per-component calls. (3) PHP tool at `/diagnostics/` served by XAMPP that reads from Supabase with the service-role key, shows a session list, drills into a timeline with client-side filters, and offers JSON export + delete-all.

**Tech Stack:** React 19 + TypeScript + Vitest (game side), Supabase/PostgreSQL (storage), PHP 8 + vanilla JS + HTML (tool), XAMPP (local PHP runtime).

**Reference spec:** `docs/superpowers/specs/2026-04-16-diagnostics-tool-design.md`

---

## File Structure Overview

**Created:**
```
supabase/migrations/2026-04-16-diagnostics.sql   (new migration, applied manually)
src/diagnostics/
├── events.ts                                     (event type union + helpers)
├── DiagnosticsClient.ts                          (buffer + flush + sequence counter)
├── DiagnosticsContext.tsx                        (React context wiring client to lobby)
├── useDiagnostics.ts                             (hook for components)
├── wrap.ts                                       (action-dispatcher wrapper)
└── index.ts                                      (barrel export)

src/__tests__/diagnostics/
├── DiagnosticsClient.test.ts
├── events.test.ts
└── wrap.test.ts

/diagnostics/                                     (gitignored — local only)
├── index.php
├── session.php
├── export.php
├── delete.php
├── config.php                                    (created locally; not committed)
├── lib/
│   ├── supabase.php
│   ├── purge.php
│   ├── guard.php
│   └── render.php
└── assets/
    ├── styles.css
    └── app.js

docs/diagnostics-setup.md                         (setup instructions, committed)
```

**Modified:**
- `.gitignore` — add `/diagnostics/`
- `supabase/schema.sql` — append the new tables so fresh setups include them
- `src/contexts/LobbyContext.tsx` — thread `diagnosticEnabled` through `createLobby`
- `src/components/screens/LobbyScreen.tsx` — add host checkbox
- `src/hooks/useSupabaseActions.ts` — emit diagnostic events on every action
- `src/components/shared/Modals.tsx` — log dialog open/close/OK/cancel
- `src/App.tsx` or `src/KredApp.tsx` — mount `DiagnosticsProvider` + log phase changes
- `package.json` — no change expected

---

## Task 1: Database migration SQL

**Files:**
- Create: `supabase/migrations/2026-04-16-diagnostics.sql`
- Modify: `supabase/schema.sql` (append so `schema.sql` stays authoritative)

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/2026-04-16-diagnostics.sql` with exactly this content:

```sql
-- 2026-04-16: Diagnostics tool — add diagnostic_enabled to lobbies, create three new tables.

ALTER TABLE kred_lobbies
  ADD COLUMN IF NOT EXISTS diagnostic_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS kred_diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  pin TEXT NOT NULL,
  player_count INT NOT NULL,
  host_name TEXT NOT NULL,
  player_names JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  last_phase TEXT,
  event_count INT NOT NULL DEFAULT 0,
  UNIQUE(lobby_id)
);

CREATE INDEX IF NOT EXISTS idx_kred_diag_sessions_started_at
  ON kred_diagnostic_sessions(started_at DESC);

CREATE TABLE IF NOT EXISTS kred_diagnostic_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES kred_diagnostic_sessions(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  player_index INT,
  player_name TEXT,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  phase TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  sequence_num INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kred_diag_events_session
  ON kred_diagnostic_events(session_id, sequence_num);
CREATE INDEX IF NOT EXISTS idx_kred_diag_events_occurred
  ON kred_diagnostic_events(occurred_at);

CREATE TABLE IF NOT EXISTS kred_diagnostic_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kred_diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_diagnostic_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players insert diagnostic sessions"
  ON kred_diagnostic_sessions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_players p
                      WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                      AND p.user_id = auth.uid()));

CREATE POLICY "Players update diagnostic sessions"
  ON kred_diagnostic_sessions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

CREATE POLICY "Players read diagnostic sessions for own lobby"
  ON kred_diagnostic_sessions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM kred_players p
                 WHERE p.lobby_id = kred_diagnostic_sessions.lobby_id
                 AND p.user_id = auth.uid()));

CREATE POLICY "Players insert diagnostic events"
  ON kred_diagnostic_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_diagnostic_sessions s
                      JOIN kred_players p ON p.lobby_id = s.lobby_id
                      WHERE s.id = kred_diagnostic_events.session_id
                      AND p.user_id = auth.uid()));
```

Note: SELECT policy on `kred_diagnostic_sessions` is needed so non-host clients can look up the session row after the host creates it. SELECT is NOT granted on `kred_diagnostic_events` or `kred_diagnostic_meta` — only PHP (service-role) reads those.

- [ ] **Step 2: Append the same DDL to `supabase/schema.sql`**

Append the migration content to the end of `supabase/schema.sql` so a fresh project setup via `schema.sql` includes diagnostics tables. Keep the existing file as-is; just append a `-- ============================================================================` section header `DIAGNOSTICS` followed by the same ALTER/CREATE/POLICY statements (without `IF NOT EXISTS` since `schema.sql` is applied to empty DBs).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/2026-04-16-diagnostics.sql supabase/schema.sql
git commit -m "feat(db): add diagnostics schema (lobbies.diagnostic_enabled + 3 new tables)"
```

- [ ] **Step 4: Apply the migration to the live Supabase project**

Open Supabase dashboard → SQL Editor → paste the contents of `supabase/migrations/2026-04-16-diagnostics.sql` → Run. Expected: "Success. No rows returned." Verify in Table Editor that `kred_diagnostic_sessions`, `kred_diagnostic_events`, `kred_diagnostic_meta` appear and that `kred_lobbies` now has a `diagnostic_enabled` column.

---

## Task 2: Gitignore the diagnostics folder

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `/diagnostics/` entry**

Append this block to the end of `.gitignore`:

```
# Local diagnostics tool (PHP, contains service-role key)
/diagnostics/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore(git): ignore /diagnostics/ local tool folder"
```

---

## Task 3: Setup documentation

**Files:**
- Create: `docs/diagnostics-setup.md`

- [ ] **Step 1: Create the setup doc**

Create `docs/diagnostics-setup.md` with this content:

```markdown
# Diagnostics Tool — Local Setup

The diagnostics tool is a local-only PHP web UI that reads verbose event logs
from Supabase for debugging online KRED sessions. Because it uses the Supabase
service-role key, the entire `/diagnostics/` folder is gitignored and must be
set up on each machine that runs it.

## Prerequisites

- XAMPP running locally (serves PHP at `http://localhost/kred/`).
- Access to the KRED Supabase project dashboard.
- Diagnostics SQL migration already applied (see
  `supabase/migrations/2026-04-16-diagnostics.sql`).

## Setup

1. Create the folder structure under the project root:

   ```
   diagnostics/
   ├── index.php
   ├── session.php
   ├── export.php
   ├── delete.php
   ├── config.php
   ├── lib/
   │   ├── supabase.php
   │   ├── purge.php
   │   ├── guard.php
   │   └── render.php
   └── assets/
       ├── styles.css
       └── app.js
   ```

   The PHP/JS/CSS files are created by the implementation tasks. This step is
   only about `config.php`, which you must create by hand.

2. Create `/diagnostics/config.php` with:

   ```php
   <?php
   return [
       'SUPABASE_URL' => 'https://<project-ref>.supabase.co',
       'SERVICE_ROLE_KEY' => '<paste the service_role key here>',
   ];
   ```

3. Find the service-role key: Supabase dashboard → Project Settings → API →
   "Project API keys" → `service_role` (secret). This key bypasses Row Level
   Security. Never commit it. Never paste it in a public channel.

4. Open `http://localhost/kred/diagnostics/` — you should see the sessions list.
   If you see "403 — Diagnostics tool is local-only", you're not hitting it from
   `127.0.0.1`.

## Enabling logging in a game

In the lobby create screen, tick **"Enable diagnostic logging for this session"**
before clicking Create Game. All players in that lobby will log events. Other
players see a small "⚙ Diagnostics on" indicator.

## Retention

Events older than 7 days are deleted automatically the first time the tool's
index page is opened in any 24-hour window. You can also wipe everything with
the "Delete all logs" button.
```

- [ ] **Step 2: Commit**

```bash
git add docs/diagnostics-setup.md
git commit -m "docs: add diagnostics tool setup guide"
```

---

## Task 4: Diagnostic event types

**Files:**
- Create: `src/diagnostics/events.ts`
- Test: `src/__tests__/diagnostics/events.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/diagnostics/events.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildEvent, EVENT_CATEGORIES, DiagnosticEventInput } from '../../diagnostics/events';

describe('diagnostics events', () => {
  it('exposes all expected categories', () => {
    expect(EVENT_CATEGORIES).toEqual([
      'lobby', 'phase', 'click', 'dialog', 'selection',
      'drag', 'move', 'challenge', 'bureaucracy', 'system', 'error',
    ]);
  });

  it('buildEvent fills defaults and preserves caller fields', () => {
    const input: DiagnosticEventInput = {
      category: 'click',
      event_type: 'BUTTON_CLICK',
      payload: { label: 'OK' },
    };
    const ev = buildEvent(input, {
      sessionId: 's-1',
      playerIndex: 2,
      playerName: 'Bob',
      phase: 'Campaign',
      sequenceNum: 42,
    });
    expect(ev.session_id).toBe('s-1');
    expect(ev.player_index).toBe(2);
    expect(ev.player_name).toBe('Bob');
    expect(ev.phase).toBe('Campaign');
    expect(ev.category).toBe('click');
    expect(ev.event_type).toBe('BUTTON_CLICK');
    expect(ev.payload).toEqual({ label: 'OK' });
    expect(ev.sequence_num).toBe(42);
    expect(typeof ev.occurred_at).toBe('string');
    expect(new Date(ev.occurred_at).getTime()).toBeGreaterThan(0);
  });

  it('buildEvent allows null player for system events', () => {
    const ev = buildEvent(
      { category: 'system', event_type: 'RECONNECT_ATTEMPT' },
      { sessionId: 's-1', playerIndex: null, playerName: null, phase: null, sequenceNum: 1 },
    );
    expect(ev.player_index).toBeNull();
    expect(ev.player_name).toBeNull();
    expect(ev.payload).toEqual({});
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- --run src/__tests__/diagnostics/events.test.ts
```
Expected: FAIL with "Cannot find module '../../diagnostics/events'".

- [ ] **Step 3: Implement `events.ts`**

Create `src/diagnostics/events.ts`:

```typescript
export const EVENT_CATEGORIES = [
  'lobby', 'phase', 'click', 'dialog', 'selection',
  'drag', 'move', 'challenge', 'bureaucracy', 'system', 'error',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export interface DiagnosticEventInput {
  category: EventCategory;
  event_type: string;
  payload?: Record<string, unknown>;
}

export interface DiagnosticEventContext {
  sessionId: string;
  playerIndex: number | null;
  playerName: string | null;
  phase: string | null;
  sequenceNum: number;
}

export interface DiagnosticEventRow {
  session_id: string;
  occurred_at: string;
  player_index: number | null;
  player_name: string | null;
  category: EventCategory;
  event_type: string;
  phase: string | null;
  payload: Record<string, unknown>;
  sequence_num: number;
}

export function buildEvent(
  input: DiagnosticEventInput,
  ctx: DiagnosticEventContext,
): DiagnosticEventRow {
  return {
    session_id: ctx.sessionId,
    occurred_at: new Date().toISOString(),
    player_index: ctx.playerIndex,
    player_name: ctx.playerName,
    category: input.category,
    event_type: input.event_type,
    phase: ctx.phase,
    payload: input.payload ?? {},
    sequence_num: ctx.sequenceNum,
  };
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- --run src/__tests__/diagnostics/events.test.ts
```
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/diagnostics/events.ts src/__tests__/diagnostics/events.test.ts
git commit -m "feat(diagnostics): add event type definitions and row builder"
```

---

## Task 5: DiagnosticsClient — no-op mode, buffering, sequence counter

**Files:**
- Create: `src/diagnostics/DiagnosticsClient.ts`
- Test: `src/__tests__/diagnostics/DiagnosticsClient.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/diagnostics/DiagnosticsClient.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiagnosticsClient, SupabaseLike } from '../../diagnostics/DiagnosticsClient';

function makeMockSupabase(): SupabaseLike & { calls: any[] } {
  const calls: any[] = [];
  return {
    calls,
    from(table: string) {
      return {
        insert: async (rows: any) => {
          calls.push({ op: 'insert', table, rows });
          return { data: null, error: null };
        },
        update: (patch: any) => ({
          eq: async (_col: string, _val: any) => {
            calls.push({ op: 'update', table, patch });
            return { data: null, error: null };
          },
        }),
        select: (_cols: string) => ({
          eq: (_col: string, _val: any) => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      };
    },
  };
}

describe('DiagnosticsClient (no-op mode)', () => {
  it('log() silently discards events when not enabled', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    c.log({ category: 'click', event_type: 'BUTTON_CLICK' });
    c.log({ category: 'click', event_type: 'BUTTON_CLICK' });
    await c.flush();
    expect(sb.calls.length).toBe(0);
  });
});

describe('DiagnosticsClient (enabled — sequence counter)', () => {
  it('assigns monotonic sequence numbers', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    c.enable({
      sessionId: 's-1', playerIndex: 1, playerName: 'Alice',
      isHost: false, getPhase: () => 'Drafting',
    });
    c.log({ category: 'click', event_type: 'A' });
    c.log({ category: 'click', event_type: 'B' });
    c.log({ category: 'click', event_type: 'C' });
    await c.flush();
    const insertCall = sb.calls.find(x => x.op === 'insert' && x.table === 'kred_diagnostic_events');
    expect(insertCall.rows).toHaveLength(3);
    expect(insertCall.rows.map((r: any) => r.sequence_num)).toEqual([1, 2, 3]);
    expect(insertCall.rows.map((r: any) => r.event_type)).toEqual(['A', 'B', 'C']);
  });
});

describe('DiagnosticsClient (buffering)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('auto-flushes every 2 seconds', async () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb, flushIntervalMs: 2000 });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    c.log({ category: 'click', event_type: 'X' });
    expect(sb.calls.length).toBe(0);
    await vi.advanceTimersByTimeAsync(2000);
    const ins = sb.calls.filter(x => x.op === 'insert' && x.table === 'kred_diagnostic_events');
    expect(ins).toHaveLength(1);
    expect(ins[0].rows).toHaveLength(1);
  });

  it('drops oldest half when buffer exceeds cap', () => {
    const sb = makeMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb, bufferCap: 4 });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    for (let i = 0; i < 6; i++) c.log({ category: 'click', event_type: `e${i}` });
    const buf = c._debugBuffer();
    expect(buf).toHaveLength(3); // cap=4, then logged e4,e5 → size 6 → trim to 3 (ceil(4/2))
    expect(buf[0].event_type).toBe('e3');
    expect(buf[2].event_type).toBe('e5');
  });
});

describe('DiagnosticsClient (error isolation)', () => {
  it('failed flush re-buffers events and does not throw', async () => {
    let shouldFail = true;
    const failingSb: SupabaseLike = {
      from() {
        return {
          insert: async () => (shouldFail ? { data: null, error: new Error('net') } : { data: null, error: null }),
          update: () => ({ eq: async () => ({ data: null, error: null }) }),
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        };
      },
    };
    const c = new DiagnosticsClient({ supabase: failingSb });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    c.log({ category: 'click', event_type: 'X' });
    await expect(c.flush()).resolves.toBeUndefined();
    expect(c._debugBuffer()).toHaveLength(1);
    shouldFail = false;
    await c.flush();
    expect(c._debugBuffer()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npm test -- --run src/__tests__/diagnostics/DiagnosticsClient.test.ts
```
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `DiagnosticsClient.ts`**

Create `src/diagnostics/DiagnosticsClient.ts`:

```typescript
import { buildEvent, DiagnosticEventInput, DiagnosticEventRow } from './events';

export interface SupabaseLike {
  from(table: string): {
    insert: (rows: any) => Promise<{ data: any; error: any }>;
    update: (patch: any) => { eq: (col: string, val: any) => Promise<{ data: any; error: any }> };
    select: (cols: string) => {
      eq: (col: string, val: any) => { maybeSingle: () => Promise<{ data: any; error: any }> };
    };
  };
}

export interface EnableConfig {
  sessionId: string;
  playerIndex: number;
  playerName: string;
  isHost: boolean;
  getPhase: () => string | null;
}

export interface ClientOptions {
  supabase: SupabaseLike;
  flushIntervalMs?: number;
  bufferCap?: number;
}

const DEFAULT_FLUSH_MS = 2000;
const DEFAULT_BUFFER_CAP = 10_000;

export class DiagnosticsClient {
  private supabase: SupabaseLike;
  private enabled = false;
  private config: EnableConfig | null = null;
  private buffer: DiagnosticEventRow[] = [];
  private sequence = 0;
  private flushIntervalMs: number;
  private bufferCap: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(opts: ClientOptions) {
    this.supabase = opts.supabase;
    this.flushIntervalMs = opts.flushIntervalMs ?? DEFAULT_FLUSH_MS;
    this.bufferCap = opts.bufferCap ?? DEFAULT_BUFFER_CAP;
  }

  enable(cfg: EnableConfig): void {
    this.enabled = true;
    this.config = cfg;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = setInterval(() => { void this.flush(); }, this.flushIntervalMs);
  }

  disable(): void {
    this.enabled = false;
    this.config = null;
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
  }

  log(input: DiagnosticEventInput): void {
    if (!this.enabled || !this.config) return;
    this.sequence += 1;
    const row = buildEvent(input, {
      sessionId: this.config.sessionId,
      playerIndex: this.config.playerIndex,
      playerName: this.config.playerName,
      phase: this.config.getPhase(),
      sequenceNum: this.sequence,
    });
    this.buffer.push(row);
    if (this.buffer.length > this.bufferCap) {
      const dropCount = Math.ceil(this.bufferCap / 2);
      this.buffer.splice(0, dropCount);
      console.warn(`[diagnostics] buffer exceeded ${this.bufferCap}, dropped ${dropCount} oldest events`);
    }
  }

  async flush(): Promise<void> {
    if (!this.enabled || this.buffer.length === 0) return;
    const toSend = this.buffer.splice(0, this.buffer.length);
    try {
      const { error } = await this.supabase.from('kred_diagnostic_events').insert(toSend);
      if (error) {
        this.buffer.unshift(...toSend);
        console.warn('[diagnostics] flush failed, events requeued', error);
        return;
      }
      if (this.config?.isHost) {
        const cnt = toSend.length;
        await this.supabase.from('kred_diagnostic_sessions')
          .update({ event_count_delta: cnt })
          .eq('id', this.config.sessionId);
      }
    } catch (err) {
      this.buffer.unshift(...toSend);
      console.warn('[diagnostics] flush threw', err);
    }
  }

  _debugBuffer(): DiagnosticEventRow[] {
    return this.buffer.slice();
  }
}
```

Note on `event_count_delta`: Supabase doesn't have atomic increment via the JS client without RPC, so in Task 6 we'll replace this with a simple RPC or skip the event_count entirely. For now the client test doesn't care about the update shape. We will refine in Task 6.

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test -- --run src/__tests__/diagnostics/DiagnosticsClient.test.ts
```
Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add src/diagnostics/DiagnosticsClient.ts src/__tests__/diagnostics/DiagnosticsClient.test.ts
git commit -m "feat(diagnostics): add DiagnosticsClient with buffering and sequence counter"
```

---

## Task 6: Session initialization + event_count via DB RPC

**Files:**
- Modify: `src/diagnostics/DiagnosticsClient.ts`
- Modify: `supabase/migrations/2026-04-16-diagnostics.sql`
- Modify: `supabase/schema.sql`
- Modify: `src/__tests__/diagnostics/DiagnosticsClient.test.ts`

Goal: replace the placeholder `event_count_delta` shape from Task 5 with a real `increment_diag_event_count` RPC, and add `createOrAttachSession` methods so hosts create a session row and non-hosts attach to it.

- [ ] **Step 1: Add an RPC to the migration**

Append to `supabase/migrations/2026-04-16-diagnostics.sql`:

```sql
CREATE OR REPLACE FUNCTION increment_diag_event_count(p_session_id UUID, p_delta INT)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE kred_diagnostic_sessions
  SET event_count = event_count + p_delta
  WHERE id = p_session_id;
$$;

GRANT EXECUTE ON FUNCTION increment_diag_event_count(UUID, INT) TO authenticated;
```

Apply manually to the live DB via Supabase SQL Editor. Append the same block to `supabase/schema.sql`.

- [ ] **Step 2: Write failing tests for `createOrAttachSession` and RPC-based event_count**

Replace the `error isolation` test's `failingSb` with a richer mock that supports `rpc`. Add to the bottom of `DiagnosticsClient.test.ts`:

```typescript
function makeRichMockSupabase() {
  const sessions: any[] = [];
  const rpcCalls: any[] = [];
  return {
    sessions,
    rpcCalls,
    from(table: string) {
      return {
        insert: async (rows: any) => {
          if (table === 'kred_diagnostic_sessions') {
            const row = { id: 'generated-id', ...rows };
            sessions.push(row);
            return { data: row, error: null, select: () => ({ single: async () => ({ data: row, error: null }) }) };
          }
          return { data: null, error: null };
        },
        select: (_cols: string) => ({
          eq: (_col: string, val: any) => ({
            maybeSingle: async () => {
              const row = sessions.find(s => s.lobby_id === val);
              return { data: row ?? null, error: null };
            },
          }),
        }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
      };
    },
    rpc: async (name: string, args: any) => {
      rpcCalls.push({ name, args });
      return { data: null, error: null };
    },
  } as any;
}

describe('DiagnosticsClient (session lifecycle)', () => {
  it('host creates a session row on createOrAttachSession', async () => {
    const sb = makeRichMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    const sessionId = await c.createOrAttachSession({
      isHost: true,
      lobbyId: 'lobby-1',
      pin: '4827',
      playerCount: 4,
      hostName: 'Fred',
      playerNames: ['Fred', 'Alice', 'Bob', 'Carol'],
    });
    expect(sessionId).toBeTruthy();
    expect(sb.sessions).toHaveLength(1);
    expect(sb.sessions[0].lobby_id).toBe('lobby-1');
    expect(sb.sessions[0].host_name).toBe('Fred');
  });

  it('non-host attaches to existing session by lobby_id', async () => {
    const sb = makeRichMockSupabase();
    sb.sessions.push({ id: 'existing-id', lobby_id: 'lobby-2' });
    const c = new DiagnosticsClient({ supabase: sb });
    const sessionId = await c.createOrAttachSession({
      isHost: false,
      lobbyId: 'lobby-2',
      pin: '1234',
      playerCount: 3,
      hostName: 'X',
      playerNames: ['X', 'Y', 'Z'],
    });
    expect(sessionId).toBe('existing-id');
    expect(sb.sessions).toHaveLength(1);
  });

  it('host flushes call rpc increment_diag_event_count', async () => {
    const sb = makeRichMockSupabase();
    const c = new DiagnosticsClient({ supabase: sb });
    c.enable({ sessionId: 's-1', playerIndex: 0, playerName: 'H', isHost: true, getPhase: () => null });
    c.log({ category: 'click', event_type: 'X' });
    c.log({ category: 'click', event_type: 'Y' });
    await c.flush();
    expect(sb.rpcCalls).toEqual([{ name: 'increment_diag_event_count', args: { p_session_id: 's-1', p_delta: 2 } }]);
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm test -- --run src/__tests__/diagnostics/DiagnosticsClient.test.ts
```
Expected: the 3 new tests fail (method missing / wrong shape).

- [ ] **Step 4: Implement `createOrAttachSession` and switch to RPC**

Edit `src/diagnostics/DiagnosticsClient.ts`:

1. Extend `SupabaseLike` to include `rpc`:

```typescript
export interface SupabaseLike {
  from(table: string): {
    insert: (rows: any) => Promise<{ data: any; error: any }> & {
      select?: (cols: string) => { single: () => Promise<{ data: any; error: any }> };
    };
    update: (patch: any) => { eq: (col: string, val: any) => Promise<{ data: any; error: any }> };
    select: (cols: string) => {
      eq: (col: string, val: any) => { maybeSingle: () => Promise<{ data: any; error: any }> };
    };
  };
  rpc(name: string, args: Record<string, unknown>): Promise<{ data: any; error: any }>;
}
```

2. Add:

```typescript
export interface CreateOrAttachInput {
  isHost: boolean;
  lobbyId: string;
  pin: string;
  playerCount: number;
  hostName: string;
  playerNames: string[];
}

// ... inside class DiagnosticsClient:
async createOrAttachSession(input: CreateOrAttachInput): Promise<string | null> {
  if (input.isHost) {
    const insertResult: any = await this.supabase.from('kred_diagnostic_sessions').insert({
      lobby_id: input.lobbyId,
      pin: input.pin,
      player_count: input.playerCount,
      host_name: input.hostName,
      player_names: input.playerNames,
    });
    const row = insertResult.data ?? (insertResult.select
      ? (await insertResult.select('id').single()).data
      : null);
    return row?.id ?? null;
  }
  const { data } = await this.supabase
    .from('kred_diagnostic_sessions')
    .select('id')
    .eq('lobby_id', input.lobbyId)
    .maybeSingle();
  return data?.id ?? null;
}
```

3. Replace the `event_count_delta` hack inside `flush()` with:

```typescript
if (this.config?.isHost) {
  await this.supabase.rpc('increment_diag_event_count', {
    p_session_id: this.config.sessionId,
    p_delta: toSend.length,
  });
}
```

4. Update older tests that used `makeMockSupabase` — the older mock doesn't have `rpc`. Add a stub `rpc: async () => ({ data: null, error: null })` to that mock so it satisfies the interface.

- [ ] **Step 5: Run tests to confirm all pass**

```bash
npm test -- --run src/__tests__/diagnostics/DiagnosticsClient.test.ts
```
Expected: all tests (original 5 + 3 new) pass.

- [ ] **Step 6: Commit**

```bash
git add src/diagnostics src/__tests__/diagnostics/DiagnosticsClient.test.ts supabase/
git commit -m "feat(diagnostics): add session create/attach and RPC-based event count"
```

---

## Task 7: DiagnosticsContext + useDiagnostics hook

**Files:**
- Create: `src/diagnostics/DiagnosticsContext.tsx`
- Create: `src/diagnostics/useDiagnostics.ts`
- Create: `src/diagnostics/index.ts`

- [ ] **Step 1: Implement the context + hook (no React-specific tests yet — these are wiring files)**

Create `src/diagnostics/DiagnosticsContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DiagnosticsClient } from './DiagnosticsClient';
import { DiagnosticEventInput } from './events';

interface DiagnosticsContextValue {
  log: (ev: DiagnosticEventInput) => void;
  enabled: boolean;
}

const DiagnosticsContext = createContext<DiagnosticsContextValue>({
  log: () => {},
  enabled: false,
});

export interface DiagnosticsProviderProps {
  children: React.ReactNode;
  lobbyId: string | null;
  isHost: boolean;
  playerIndex: number | null;
  playerName: string | null;
  pin: string | null;
  playerCount: number | null;
  playerNames: string[];
  hostName: string | null;
  diagnosticEnabled: boolean;
  currentPhase: string | null;
}

export function DiagnosticsProvider(props: DiagnosticsProviderProps) {
  const clientRef = useRef<DiagnosticsClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = new DiagnosticsClient({ supabase: supabase as any });
  }
  const phaseRef = useRef(props.currentPhase);
  phaseRef.current = props.currentPhase;

  useEffect(() => {
    const client = clientRef.current!;
    if (!props.diagnosticEnabled || !props.lobbyId || props.playerIndex === null || !props.playerName) {
      client.disable();
      return;
    }
    let cancelled = false;
    (async () => {
      const sessionId = await client.createOrAttachSession({
        isHost: props.isHost,
        lobbyId: props.lobbyId!,
        pin: props.pin ?? '',
        playerCount: props.playerCount ?? 0,
        hostName: props.hostName ?? '',
        playerNames: props.playerNames,
      });
      if (cancelled || !sessionId) return;
      client.enable({
        sessionId,
        playerIndex: props.playerIndex!,
        playerName: props.playerName!,
        isHost: props.isHost,
        getPhase: () => phaseRef.current,
      });
    })();
    const flushOnUnload = () => { void client.flush(); };
    window.addEventListener('beforeunload', flushOnUnload);
    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', flushOnUnload);
      void client.flush();
      client.disable();
    };
  }, [props.diagnosticEnabled, props.lobbyId, props.isHost, props.playerIndex]);

  // Flush on phase change
  useEffect(() => {
    const client = clientRef.current!;
    void client.flush();
  }, [props.currentPhase]);

  const value = useMemo<DiagnosticsContextValue>(() => ({
    log: (ev) => clientRef.current?.log(ev),
    enabled: props.diagnosticEnabled,
  }), [props.diagnosticEnabled]);

  return <DiagnosticsContext.Provider value={value}>{props.children}</DiagnosticsContext.Provider>;
}

export function useDiagnosticsContext() {
  return useContext(DiagnosticsContext);
}
```

Create `src/diagnostics/useDiagnostics.ts`:

```typescript
import { useCallback } from 'react';
import { useDiagnosticsContext } from './DiagnosticsContext';
import { DiagnosticEventInput } from './events';

/**
 * Hook for emitting diagnostic events. Returns a stable callback that is a
 * silent no-op when logging is disabled.
 */
export function useDiagnostics() {
  const { log } = useDiagnosticsContext();
  return useCallback((ev: DiagnosticEventInput) => log(ev), [log]);
}
```

Create `src/diagnostics/index.ts`:

```typescript
export { DiagnosticsProvider } from './DiagnosticsContext';
export { useDiagnostics } from './useDiagnostics';
export type { DiagnosticEventInput, EventCategory } from './events';
```

- [ ] **Step 2: Run the existing test suite to make sure nothing broke**

```bash
npm test -- --run src/__tests__/diagnostics
```
Expected: all diagnostics tests still pass.

- [ ] **Step 3: Typecheck the whole project**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/diagnostics/DiagnosticsContext.tsx src/diagnostics/useDiagnostics.ts src/diagnostics/index.ts
git commit -m "feat(diagnostics): add DiagnosticsProvider and useDiagnostics hook"
```

---

## Task 8: Plumb `diagnosticEnabled` through LobbyContext and createLobby

**Files:**
- Modify: `src/contexts/LobbyContext.tsx`

- [ ] **Step 1: Update the context type and state**

In `src/contexts/LobbyContext.tsx`:

1. Add to `LobbyContextType`:
```typescript
diagnosticEnabled: boolean;
```

2. Change `createLobby` signature to accept a 4th argument `diagnosticEnabled = false`:
```typescript
createLobby: (hostName: string, playerCount: number, skipDraft?: boolean, diagnosticEnabled?: boolean) => Promise<void>;
```

3. Add a `useState`:
```typescript
const [diagnosticEnabled, setDiagnosticEnabled] = useState(false);
```

4. Inside `createLobby`, pass it to the insert and store it:
```typescript
const createLobby = useCallback(async (hostName: string, playerCount: number, skipDraftOption = false, diagEnabled = false) => {
  setSkipDraft(skipDraftOption);
  setDiagnosticEnabled(diagEnabled);
  const uid = await ensureAuth();
  const pin = generatePin();

  await supabase
    .from('kred_players')
    .update({ connection_status: 'LEFT' })
    .eq('user_id', uid)
    .neq('connection_status', 'LEFT');

  const { data: lobby, error: lobbyError } = await supabase
    .from('kred_lobbies')
    .insert({ pin, host_id: uid, player_count: playerCount, status: 'WAITING', diagnostic_enabled: diagEnabled })
    .select('id')
    .single();
  // ... rest unchanged
}, [ensureAuth]);
```

5. Inside `joinLobby`, also fetch `diagnostic_enabled` and set state:
```typescript
const { data: lobby, error: lobbyError } = await supabase
  .from('kred_lobbies')
  .select('id, status, player_count, diagnostic_enabled')
  .eq('pin', pin.toUpperCase())
  .single();
// ... after success:
setDiagnosticEnabled(!!lobby.diagnostic_enabled);
```

6. Inside `rejoinGame`, also fetch and set:
```typescript
const { data: lobby } = await supabase
  .from('kred_lobbies')
  .select('id, pin, status, player_count, diagnostic_enabled')
  .eq('id', rejoinAvailable.lobbyId)
  .single();
// ... after success:
setDiagnosticEnabled(!!lobby.diagnostic_enabled);
```

7. Inside `leaveLobby`, reset:
```typescript
setDiagnosticEnabled(false);
```

8. Add `diagnosticEnabled` to the `value` object at the bottom:
```typescript
const value: LobbyContextType = {
  lobbyId, lobbyPin, isHost, userId, playerIndex, playerCount,
  lobbyStatus, lobbyPlayers, isRejoining, rejoinAvailable, skipDraft, diagnosticEnabled,
  createLobby, joinLobby, startGame, rejoinGame, dismissRejoin, leaveLobby,
};
```

- [ ] **Step 2: Run the full test suite to check for regressions**

```bash
npm test -- --run
```
Expected: all tests still pass. If a lobby test was asserting on the lobby insert shape, it will need to allow `diagnostic_enabled` in the payload — fix inline.

- [ ] **Step 3: Typecheck**

```bash
npm run build
```
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/LobbyContext.tsx
git commit -m "feat(lobby): thread diagnosticEnabled through createLobby/joinLobby/rejoinGame"
```

---

## Task 9: Host UI checkbox in LobbyScreen

**Files:**
- Modify: `src/components/screens/LobbyScreen.tsx`

- [ ] **Step 1: Add state and checkbox, pass through to createLobby**

In `src/components/screens/LobbyScreen.tsx`:

1. Add state:
```typescript
const [diagnosticEnabled, setDiagnosticEnabled] = useState(false);
```

2. Update `handleCreate` to pass it:
```typescript
await createLobby(hostName.trim(), selectedPlayerCount, skipDraftOption, diagnosticEnabled);
```

3. Add a new `<label>` block directly BELOW the existing `Skip Draft` checkbox block (which ends around line 158). Insert:

```tsx
<label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition-colors">
  <input
    type="checkbox"
    checked={diagnosticEnabled}
    onChange={(e) => setDiagnosticEnabled(e.target.checked)}
    className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
  />
  <span className="text-sm text-slate-600">
    <span className="font-semibold text-violet-700">Enable Diagnostic Logging</span>
    <span className="text-slate-400 ml-1">(records detailed UI events for this session — for debugging)</span>
  </span>
</label>
```

- [ ] **Step 2: Run the dev server and smoke-test the lobby screen**

```bash
npm run dev
```
Open `http://localhost:3000`, click "Create Game", verify the new checkbox appears below Skip Draft, toggles, and does not disable the Create button.

- [ ] **Step 3: Run tests for regressions**

```bash
npm test -- --run
```
Expected: pass. If `player-selection.test.tsx` or any lobby test fails, inspect and update to match new UI.

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/LobbyScreen.tsx
git commit -m "feat(lobby): add 'Enable Diagnostic Logging' host checkbox"
```

---

## Task 10: Mount DiagnosticsProvider and a "diagnostics on" indicator

**Files:**
- Modify: `src/KredApp.tsx` (or wherever `LobbyProvider`'s children render — verify during this task)

- [ ] **Step 1: Locate the provider mount point**

Open `src/KredApp.tsx` and find where `<LobbyProvider>` wraps the app. The new `<DiagnosticsProvider>` must go INSIDE `<LobbyProvider>` and wrap the children that render the game (so `useLobby()` works for its props).

- [ ] **Step 2: Introduce a thin bridge component**

Add this inside `KredApp.tsx` (or a new `src/diagnostics/DiagnosticsBridge.tsx` if the file is too crowded):

```tsx
import { useLobby } from './contexts/LobbyContext';
import { DiagnosticsProvider } from './diagnostics';

function DiagnosticsBridge({ children, currentPhase }: { children: React.ReactNode; currentPhase: string | null }) {
  const lobby = useLobby();
  const self = lobby.lobbyPlayers.find(p => p.playerIndex === lobby.playerIndex) ?? null;
  const host = lobby.lobbyPlayers.find(p => p.isHost) ?? null;
  return (
    <DiagnosticsProvider
      lobbyId={lobby.lobbyId}
      isHost={lobby.isHost}
      playerIndex={lobby.playerIndex}
      playerName={self?.name ?? null}
      pin={lobby.lobbyPin}
      playerCount={lobby.playerCount}
      playerNames={lobby.lobbyPlayers.map(p => p.name)}
      hostName={host?.name ?? null}
      diagnosticEnabled={lobby.diagnosticEnabled}
      currentPhase={currentPhase}
    >
      {children}
    </DiagnosticsProvider>
  );
}
```

Wrap whatever currently sits under `<LobbyProvider>` with `<DiagnosticsBridge currentPhase={...}>`. You will need to thread `currentPhase` from the game state. If there isn't an obvious single source of truth for the current phase at this level, pass `null` for now — Task 13 adds the wiring.

- [ ] **Step 3: Add a "⚙ Diagnostics on" indicator for non-host players in the lobby**

In `LobbyScreen.tsx` (inside the rejoin-banner/error area or at the top of each form), render:

```tsx
{!isHost /* from useLobby */ && lobby.diagnosticEnabled && (
  <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded px-2 py-1 mb-2">
    ⚙ Diagnostics on
  </div>
)}
```

(Take `lobby.diagnosticEnabled` from the same `useLobby()` call you already have.)

- [ ] **Step 4: Build and smoke-test**

```bash
npm run build
```
Expected: success. Then `npm run dev`, create a lobby with diagnostics ON, open the dev tools Network tab, and watch for `kred_diagnostic_sessions` and `kred_diagnostic_events` inserts when interacting.

- [ ] **Step 5: Commit**

```bash
git add src/KredApp.tsx src/components/screens/LobbyScreen.tsx
git commit -m "feat(diagnostics): mount DiagnosticsProvider and show host-opt-in indicator"
```

---

## Task 11: Auto-instrument the action dispatcher

**Files:**
- Modify: `src/hooks/useSupabaseActions.ts`

Every game move already flows through `emitAction`. Wrapping that gives us `move` category coverage "for free".

- [ ] **Step 1: Inject a diagnostic log call into emitAction**

Edit `src/hooks/useSupabaseActions.ts`. At the top:

```typescript
import { useDiagnostics } from '../diagnostics';
```

Inside `useSupabaseActions`:

```typescript
const logDiag = useDiagnostics();
```

Inside `emitAction`, right before returning/inserting, add:

```typescript
logDiag({
  category: 'move',
  event_type: actionType,
  payload: { ...payload, via: isHost ? 'host-local' : 'db-insert' },
});
```

The full updated `emitAction`:

```typescript
const emitAction = useCallback(async (actionType: string, payload: any = {}) => {
  if (!lobbyId || !userId) return;

  logDiag({
    category: 'move',
    event_type: actionType,
    payload: { ...payload, via: isHost ? 'host-local' : 'db-insert' },
  });

  if (isHost) {
    onActionReceivedRef.current?.({ type: actionType, playerId: userId, payload });
    return;
  }

  const { error } = await supabase
    .from('kred_game_actions')
    .insert({
      lobby_id: lobbyId,
      player_id: userId,
      action_type: actionType,
      payload,
    });

  if (error) {
    console.error(`Failed to emit action ${actionType}:`, error);
    logDiag({ category: 'error', event_type: 'EMIT_ACTION_FAILED', payload: { actionType, message: error.message } });
  }
}, [lobbyId, userId, isHost, logDiag]);
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test -- --run
```
Expected: pass. If any test wraps or mocks `useSupabaseActions`, ensure the mock doesn't need to know about diagnostics (it shouldn't — `useDiagnostics()` returns a no-op by default outside `DiagnosticsProvider`).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSupabaseActions.ts
git commit -m "feat(diagnostics): auto-log every emitAction as a move-category event"
```

---

## Task 12: Auto-instrument the AlertModal

**Files:**
- Modify: `src/components/shared/Modals.tsx`

- [ ] **Step 1: Log open/close/OK in AlertModal**

Edit `src/components/shared/Modals.tsx`. At the top, add:

```typescript
import { useDiagnostics } from '../../diagnostics';
import { useEffect } from 'react';
```

(React may already be imported — don't duplicate.)

Inside `AlertModal`, before the `if (!isOpen) return null;` line, add:

```typescript
const logDiag = useDiagnostics();
useEffect(() => {
  if (isOpen) {
    logDiag({ category: 'dialog', event_type: 'DIALOG_OPENED', payload: { dialog_type: 'Alert', title, modal_type: type } });
  }
}, [isOpen, title, type, logDiag]);
```

Wrap the `onClose` in the button's onClick:

```tsx
<button
  onClick={() => {
    logDiag({ category: 'dialog', event_type: 'DIALOG_OK', payload: { dialog_type: 'Alert', title } });
    onClose();
  }}
  className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
>
  OK
</button>
```

Repeat the same pattern — `useDiagnostics()` + useEffect for open + onClose/button wrappers — for every other modal defined in this file (PerfectTileModal, any Confirm modal, etc.). Use `dialog_type` = the modal's component name, `event_type` = `DIALOG_OPENED` / `DIALOG_OK` / `DIALOG_CANCEL` / `DIALOG_DISMISSED` as appropriate.

- [ ] **Step 2: Build and run tests**

```bash
npm run build && npm test -- --run
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Modals.tsx
git commit -m "feat(diagnostics): log dialog open/OK/cancel from shared modals"
```

---

## Task 13: Log phase transitions and thread currentPhase into DiagnosticsBridge

**Files:**
- Modify: `src/KredApp.tsx` (wherever the phase state lives)
- Possibly: `src/diagnostics/DiagnosticsBridge.tsx` if you extracted it

- [ ] **Step 1: Find the phase state**

In `KredApp.tsx` (or `App.tsx`), search for the game-phase source. It's likely a state variable like `gamePhase` or `phase` driven by `useGameState` / the engine. Identify the single source of truth.

- [ ] **Step 2: Log a PHASE_CHANGE and pass currentPhase into the bridge**

Replace the `currentPhase={null}` placeholder from Task 10 with the real phase variable. Add a `useEffect` that logs every change:

```tsx
import { useEffect, useRef } from 'react';
import { useDiagnostics } from './diagnostics';

function PhaseLogger({ currentPhase }: { currentPhase: string | null }) {
  const logDiag = useDiagnostics();
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentPhase !== prevRef.current) {
      logDiag({
        category: 'phase',
        event_type: 'PHASE_CHANGE',
        payload: { from: prevRef.current, to: currentPhase },
      });
      prevRef.current = currentPhase;
    }
  }, [currentPhase, logDiag]);
  return null;
}
```

Mount `<PhaseLogger currentPhase={gamePhase} />` inside `<DiagnosticsBridge>` alongside the existing children.

- [ ] **Step 3: Build, test, smoke-test**

```bash
npm run build && npm test -- --run
```
Then `npm run dev`, enable diagnostics on a lobby, start a game, step through phases, verify `PHASE_CHANGE` rows appear in the `kred_diagnostic_events` table.

- [ ] **Step 4: Commit**

```bash
git add src/KredApp.tsx
git commit -m "feat(diagnostics): log PHASE_CHANGE and wire currentPhase into bridge"
```

---

## Task 14: Explicit event hooks — tile selections, drags, challenges, bureaucracy

**Files:**
- Modify: the specific component files where each interaction lives

Task 11 covers every action that passes through `emitAction`, so `TILE_PLAYED`, `PIECE_MOVED`, `END_TURN`, `RECEIVER_DECISION`, `CHALLENGER_DECISION`, `COMPLETE_BONUS_MOVE`, and `COMPLETE_CORRECTION` are already logged. This task covers pre-action UI events that don't fire an action.

- [ ] **Step 1: Tile selection (pre-play hover / click)**

Search for tile click handlers in `src/components/`. For each component that handles a "player clicked on a tile in their hand" moment (before `playTile` fires), add:

```typescript
const logDiag = useDiagnostics();
// ... inside the click handler:
logDiag({
  category: 'selection',
  event_type: 'TILE_SELECTED',
  payload: { tileId, kredcoin /* if available */ },
});
```

- [ ] **Step 2: Piece drag lifecycle**

Search for `onDragStart` / `onDrop` / `onDragEnd` in the codebase. Add inside `onDragStart`:

```typescript
logDiag({ category: 'drag', event_type: 'DRAG_START', payload: { pieceId, from } });
```

Inside `onDrop`:

```typescript
logDiag({ category: 'drag', event_type: 'DRAG_DROP', payload: { pieceId, from, to } });
```

Inside `onDragEnd` (if the drop didn't complete):

```typescript
logDiag({ category: 'drag', event_type: 'DRAG_CANCELLED', payload: { pieceId } });
```

Inside `onDragOver` (throttle to once per 200ms per target using a simple ref-based throttle):

```typescript
const lastHoverRef = useRef<{ target: string; t: number }>({ target: '', t: 0 });
// ...
const now = Date.now();
if (lastHoverRef.current.target !== targetId || now - lastHoverRef.current.t > 200) {
  lastHoverRef.current = { target: targetId, t: now };
  logDiag({ category: 'drag', event_type: isValid ? 'DRAG_OVER_VALID' : 'DRAG_OVER_INVALID', payload: { pieceId, target: targetId } });
}
```

- [ ] **Step 3: Illegal-move rejection**

Find the rejection path (search the codebase for an error message containing "illegal" or the existing `ILLEGAL_MOVE_DIAGNOSITC.md` — it points to where this happens). Add at the point of rejection:

```typescript
logDiag({
  category: 'move',
  event_type: 'ILLEGAL_MOVE_REJECTED',
  payload: { rule, reason, attemptedFrom, attemptedTo, pieceId },
});
```

- [ ] **Step 4: Bureaucracy menu open/purchase**

In `BureaucracyScreen.tsx`, for menu-open handlers add `BUREAU_MENU_OPENED`, for purchase confirmations add `BUREAU_PURCHASE` with `{ item, cost }`, and for skip/close add `BUREAU_SKIPPED`.

- [ ] **Step 5: Build, test, smoke-test**

```bash
npm run build && npm test -- --run && npm run dev
```
Play one full game end-to-end with diagnostics on. Open a session in the (yet-to-be-built) PHP tool OR query the Supabase dashboard directly: `SELECT category, event_type, count(*) FROM kred_diagnostic_events GROUP BY 1,2 ORDER BY 1,2;` — expect a healthy spread of categories.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat(diagnostics): add selection/drag/illegal-move/bureaucracy event logging"
```

---

## Task 15: Error boundary and window.onerror wiring

**Files:**
- Modify: `src/components/shared/ErrorBoundary.tsx`
- Modify: `src/KredApp.tsx` (global `window.onerror` listener)

- [ ] **Step 1: Log CLIENT_ERROR from the React error boundary**

In `ErrorBoundary.tsx`, inside `componentDidCatch`, add (via a small wrapper since class components can't use hooks — expose it via a static registered callback):

Option A (simplest): export a module-level `reportDiagnosticError` function that the DiagnosticsBridge registers a handler for at mount.

Create `src/diagnostics/errorSink.ts`:

```typescript
type Handler = (err: { message: string; stack?: string; source?: string }) => void;
let currentHandler: Handler = () => {};
export function setErrorHandler(h: Handler) { currentHandler = h; }
export function reportDiagnosticError(err: { message: string; stack?: string; source?: string }) {
  currentHandler(err);
}
```

In `DiagnosticsBridge`, after mounting the client:

```typescript
import { setErrorHandler } from '../diagnostics/errorSink';
// ... useEffect:
setErrorHandler(({ message, stack, source }) => {
  // use a ref to the logDiag function so we capture the latest one
  logRef.current({ category: 'error', event_type: 'CLIENT_ERROR', payload: { message, stack, source } });
});
```

In `ErrorBoundary.tsx`:

```typescript
import { reportDiagnosticError } from '../../diagnostics/errorSink';

componentDidCatch(error: Error, info: React.ErrorInfo) {
  reportDiagnosticError({ message: error.message, stack: error.stack, source: 'ErrorBoundary' });
  // ... existing behavior
}
```

- [ ] **Step 2: Hook window.onerror**

In `KredApp.tsx` near the top-level effect:

```typescript
useEffect(() => {
  const onErr = (msg: string | Event, src?: string, _ln?: number, _col?: number, err?: Error) => {
    reportDiagnosticError({ message: typeof msg === 'string' ? msg : 'event', stack: err?.stack, source: src });
    return false;
  };
  const onRej = (ev: PromiseRejectionEvent) => {
    reportDiagnosticError({ message: String(ev.reason?.message ?? ev.reason), stack: ev.reason?.stack, source: 'unhandledrejection' });
  };
  window.addEventListener('error', onErr as any);
  window.addEventListener('unhandledrejection', onRej);
  return () => {
    window.removeEventListener('error', onErr as any);
    window.removeEventListener('unhandledrejection', onRej);
  };
}, []);
```

- [ ] **Step 3: Build, test, commit**

```bash
npm run build && npm test -- --run
git add src/
git commit -m "feat(diagnostics): pipe React errors and window.onerror into diagnostic log"
```

---

## Task 16: /diagnostics/ skeleton — folders, guard, render helpers

**Files:**
- Create: `/diagnostics/lib/guard.php`
- Create: `/diagnostics/lib/render.php`
- Create: `/diagnostics/assets/styles.css`
- Create: `/diagnostics/assets/app.js` (empty skeleton)
- Create: `/diagnostics/config.php` (local only, hand-edited)

These files are in the gitignored folder — they won't be committed.

- [ ] **Step 1: Create the folder**

```bash
mkdir -p C:/xampp/htdocs/kred/diagnostics/lib C:/xampp/htdocs/kred/diagnostics/assets
```

- [ ] **Step 2: Create `guard.php`**

Create `/diagnostics/lib/guard.php`:

```php
<?php
// Localhost-only guardrail. Reject any request not from 127.0.0.1 or ::1.
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($ip, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Diagnostics tool is local-only. Your IP: {$ip}");
}
```

- [ ] **Step 3: Create `render.php`**

Create `/diagnostics/lib/render.php`:

```php
<?php
function diag_html_header(string $title): void {
    ?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($title) ?> — KRED Diagnostics</title>
  <link rel="stylesheet" href="/kred/diagnostics/assets/styles.css">
</head>
<body>
  <header class="diag-header">
    <h1>KRED Diagnostics</h1>
    <nav><a href="/kred/diagnostics/index.php">Sessions</a></nav>
  </header>
  <main>
<?php
}

function diag_html_footer(): void {
    ?>
  </main>
  <script src="/kred/diagnostics/assets/app.js" defer></script>
</body>
</html>
<?php
}

function diag_escape($v): string {
    if (is_array($v) || is_object($v)) return htmlspecialchars(json_encode($v, JSON_UNESCAPED_SLASHES), ENT_QUOTES);
    return htmlspecialchars((string)$v, ENT_QUOTES);
}
```

- [ ] **Step 4: Create `styles.css` and empty `app.js`**

`/diagnostics/assets/styles.css`:

```css
* { box-sizing: border-box; }
body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f6f7f9; color: #1a1c20; margin: 0; }
.diag-header { background: #1a2332; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
.diag-header h1 { margin: 0; font-size: 18px; font-weight: 600; }
.diag-header a { color: #8fb4ff; margin-left: 12px; text-decoration: none; }
main { max-width: 1200px; margin: 24px auto; padding: 0 20px; }
table.diag-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
table.diag-table th, table.diag-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eef0f3; vertical-align: top; }
table.diag-table th { background: #f0f2f5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
table.diag-table tr:hover td { background: #f9fafb; }
.diag-btn { display: inline-block; padding: 4px 10px; background: #2b6cb0; color: #fff; border-radius: 4px; text-decoration: none; font-size: 12px; border: 0; cursor: pointer; }
.diag-btn.danger { background: #c53030; }
.diag-btn.ghost { background: #718096; }
.diag-filters { display: flex; gap: 12px; margin: 12px 0; align-items: center; flex-wrap: wrap; }
.diag-filters select, .diag-filters input { padding: 4px 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 13px; }
.diag-payload { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #2d3748; white-space: pre-wrap; word-break: break-all; max-width: 400px; }
.diag-empty { padding: 40px; text-align: center; color: #718096; }
.diag-meta { background: #fff; border-radius: 6px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
```

`/diagnostics/assets/app.js`:

```javascript
// Placeholder — filled in by Task 20.
```

- [ ] **Step 5: No commit needed** (folder is gitignored)

---

## Task 17: Supabase REST wrapper for PHP

**Files:**
- Create: `/diagnostics/lib/supabase.php`

- [ ] **Step 1: Create the wrapper**

`/diagnostics/lib/supabase.php`:

```php
<?php
function diag_config(): array {
    static $cfg = null;
    if ($cfg === null) {
        $path = __DIR__ . '/../config.php';
        if (!file_exists($path)) {
            http_response_code(500);
            exit('Missing /diagnostics/config.php — see docs/diagnostics-setup.md');
        }
        $cfg = require $path;
    }
    return $cfg;
}

function diag_supabase_request(string $method, string $path, ?array $body = null, array $extraHeaders = []): array {
    $cfg = diag_config();
    $url = rtrim($cfg['SUPABASE_URL'], '/') . '/rest/v1' . $path;
    $headers = array_merge([
        'apikey: ' . $cfg['SERVICE_ROLE_KEY'],
        'Authorization: Bearer ' . $cfg['SERVICE_ROLE_KEY'],
        'Content-Type: application/json',
        'Prefer: return=representation',
    ], $extraHeaders);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new RuntimeException("Supabase request failed: $err");
    }
    $decoded = json_decode($raw ?: 'null', true);
    if ($code >= 400) {
        throw new RuntimeException("Supabase $code: " . ($raw ?: '(empty)'));
    }
    return is_array($decoded) ? $decoded : [];
}

function diag_list_sessions(): array {
    return diag_supabase_request('GET', '/kred_diagnostic_sessions?select=*&order=started_at.desc');
}

function diag_get_session(string $id): ?array {
    $rows = diag_supabase_request('GET', '/kred_diagnostic_sessions?id=eq.' . urlencode($id) . '&select=*');
    return $rows[0] ?? null;
}

function diag_list_events(string $sessionId): array {
    return diag_supabase_request(
        'GET',
        '/kred_diagnostic_events?session_id=eq.' . urlencode($sessionId) . '&select=*&order=sequence_num.asc,received_at.asc'
    );
}

function diag_delete_events_before(string $iso): int {
    $rows = diag_supabase_request('DELETE', '/kred_diagnostic_events?occurred_at=lt.' . urlencode($iso));
    return count($rows);
}

function diag_delete_sessions_before(string $iso): int {
    $rows = diag_supabase_request('DELETE', '/kred_diagnostic_sessions?started_at=lt.' . urlencode($iso));
    return count($rows);
}

function diag_delete_all(): void {
    // Delete events first (explicit, even though CASCADE would cover it)
    diag_supabase_request('DELETE', '/kred_diagnostic_events?id=gte.1');
    diag_supabase_request('DELETE', '/kred_diagnostic_sessions?id=neq.00000000-0000-0000-0000-000000000000');
}

function diag_meta_get(string $key): ?array {
    $rows = diag_supabase_request('GET', '/kred_diagnostic_meta?key=eq.' . urlencode($key) . '&select=*');
    return $rows[0] ?? null;
}

function diag_meta_set(string $key, array $value): void {
    diag_supabase_request(
        'POST',
        '/kred_diagnostic_meta',
        [['key' => $key, 'value' => $value, 'updated_at' => gmdate('c')]],
        ['Prefer: resolution=merge-duplicates']
    );
}
```

- [ ] **Step 2: No test** — this is a thin HTTP wrapper exercised end-to-end by the pages in Tasks 19-23. Move on.

---

## Task 18: Purge-on-open

**Files:**
- Create: `/diagnostics/lib/purge.php`

- [ ] **Step 1: Implement the purge**

`/diagnostics/lib/purge.php`:

```php
<?php
require_once __DIR__ . '/supabase.php';

function diag_maybe_purge(): array {
    $now = time();
    $lastRow = diag_meta_get('last_purge_at');
    $last = null;
    if ($lastRow && isset($lastRow['value']['at'])) {
        $last = strtotime($lastRow['value']['at']);
    }
    $stale = $last === null || ($now - $last) > 86400; // 24h
    if (!$stale) {
        return ['ran' => false];
    }
    $cutoff = gmdate('c', $now - 7 * 86400);
    $deletedEvents = 0;
    $deletedSessions = 0;
    try {
        $deletedEvents = diag_delete_events_before($cutoff);
        $deletedSessions = diag_delete_sessions_before($cutoff);
    } catch (Throwable $e) {
        error_log('[diagnostics] purge failed: ' . $e->getMessage());
        return ['ran' => false, 'error' => $e->getMessage()];
    }
    diag_meta_set('last_purge_at', ['at' => gmdate('c', $now)]);
    return ['ran' => true, 'events' => $deletedEvents, 'sessions' => $deletedSessions, 'cutoff' => $cutoff];
}
```

---

## Task 19: Sessions list page

**Files:**
- Create: `/diagnostics/index.php`

- [ ] **Step 1: Build the page**

`/diagnostics/index.php`:

```php
<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';
require_once __DIR__ . '/lib/purge.php';
require_once __DIR__ . '/lib/render.php';

$purgeResult = diag_maybe_purge();
$sessions = diag_list_sessions();

diag_html_header('Sessions');
?>
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
  <div>
    <strong><?= count($sessions) ?></strong> sessions (last 7 days)
    <?php if (!empty($purgeResult['ran'])): ?>
      <span style="color:#718096;font-size:12px;margin-left:12px;">
        Purged <?= (int)$purgeResult['events'] ?> events, <?= (int)$purgeResult['sessions'] ?> sessions older than 7 days
      </span>
    <?php endif; ?>
  </div>
  <form method="post" action="/kred/diagnostics/delete.php" onsubmit="return confirm('Delete ALL diagnostic sessions and events? This cannot be undone.');" style="margin:0;">
    <button type="submit" class="diag-btn danger">Delete all logs</button>
  </form>
</div>

<?php if (count($sessions) === 0): ?>
  <div class="diag-empty">
    No sessions recorded in the last 7 days.<br>
    <small>Enable diagnostic logging in the lobby setup to start capturing events.</small>
  </div>
<?php else: ?>
<table class="diag-table">
  <thead>
    <tr>
      <th>Started</th>
      <th>PIN</th>
      <th>Players</th>
      <th>Host</th>
      <th>Last Phase</th>
      <th>Events</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($sessions as $s): ?>
      <tr>
        <td><?= diag_escape($s['started_at']) ?></td>
        <td><code><?= diag_escape($s['pin']) ?></code></td>
        <td><?= diag_escape($s['player_count']) ?></td>
        <td><?= diag_escape($s['host_name']) ?></td>
        <td><?= diag_escape($s['last_phase'] ?? '—') ?></td>
        <td><?= diag_escape($s['event_count']) ?></td>
        <td>
          <a class="diag-btn" href="/kred/diagnostics/session.php?id=<?= urlencode($s['id']) ?>">View</a>
          <a class="diag-btn ghost" href="/kred/diagnostics/export.php?id=<?= urlencode($s['id']) ?>">JSON</a>
        </td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php endif; ?>
<?php diag_html_footer(); ?>
```

- [ ] **Step 2: Manual test**

Open `http://localhost/kred/diagnostics/index.php`. Expected: either the "No sessions" empty state OR a table of sessions. If you hit "Missing /diagnostics/config.php", create it per `docs/diagnostics-setup.md`.

---

## Task 20: Session timeline + client-side filters

**Files:**
- Create: `/diagnostics/session.php`
- Modify: `/diagnostics/assets/app.js`

- [ ] **Step 1: Build `session.php`**

`/diagnostics/session.php`:

```php
<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';
require_once __DIR__ . '/lib/render.php';

$id = $_GET['id'] ?? '';
if ($id === '') { http_response_code(400); exit('Missing id'); }

$session = diag_get_session($id);
if ($session === null) { http_response_code(404); exit('Session not found'); }

$events = diag_list_events($id);

diag_html_header('Session ' . $session['pin']);
?>
<a href="/kred/diagnostics/index.php" class="diag-btn ghost">&larr; Back to sessions</a>

<div class="diag-meta">
  <h2 style="margin:0 0 8px 0;">Session <code><?= diag_escape($session['pin']) ?></code></h2>
  <div>Started: <?= diag_escape($session['started_at']) ?></div>
  <div>Ended: <?= diag_escape($session['ended_at'] ?? '(in progress or host disconnected)') ?></div>
  <div>Last phase: <?= diag_escape($session['last_phase'] ?? '—') ?></div>
  <div>Players (<?= diag_escape($session['player_count']) ?>): <?= diag_escape($session['player_names']) ?></div>
  <div>Host: <?= diag_escape($session['host_name']) ?></div>
  <div style="margin-top:8px;">
    <a class="diag-btn" href="/kred/diagnostics/export.php?id=<?= urlencode($id) ?>">Export JSON</a>
  </div>
  <div style="color:#718096;font-size:12px;margin-top:8px;">
    Ordering: <code>sequence_num</code> is per-client monotonic; cross-player order uses <code>received_at</code> as tiebreaker.
    Client clocks may skew.
  </div>
</div>

<div class="diag-filters">
  <label>Player: <select id="filter-player"><option value="">All</option></select></label>
  <label>Phase: <select id="filter-phase"><option value="">All</option></select></label>
  <label>Category: <select id="filter-category"><option value="">All</option></select></label>
  <label>Search: <input type="text" id="filter-search" placeholder="event_type or payload..."></label>
  <span id="filter-count"></span>
</div>

<table class="diag-table" id="events-table">
  <thead>
    <tr>
      <th>Time</th>
      <th>Seq</th>
      <th>Player</th>
      <th>Phase</th>
      <th>Category</th>
      <th>Event</th>
      <th>Payload</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($events as $e):
      $occurred = isset($e['occurred_at']) ? substr($e['occurred_at'], 11, 12) : '';
    ?>
      <tr
        data-player="<?= diag_escape($e['player_name'] ?? '') ?>"
        data-phase="<?= diag_escape($e['phase'] ?? '') ?>"
        data-category="<?= diag_escape($e['category']) ?>"
        data-search="<?= diag_escape(strtolower($e['event_type'] . ' ' . json_encode($e['payload']))) ?>">
        <td><?= diag_escape($occurred) ?></td>
        <td><?= diag_escape($e['sequence_num']) ?></td>
        <td><?= diag_escape($e['player_name'] ?? '—') ?></td>
        <td><?= diag_escape($e['phase'] ?? '—') ?></td>
        <td><?= diag_escape($e['category']) ?></td>
        <td><?= diag_escape($e['event_type']) ?></td>
        <td class="diag-payload"><?= diag_escape(json_encode($e['payload'], JSON_UNESCAPED_SLASHES)) ?></td>
      </tr>
    <?php endforeach; ?>
  </tbody>
</table>
<?php diag_html_footer(); ?>
```

- [ ] **Step 2: Build client-side filter JS**

Replace `/diagnostics/assets/app.js` with:

```javascript
(function() {
  const table = document.getElementById('events-table');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const pSel = document.getElementById('filter-player');
  const phSel = document.getElementById('filter-phase');
  const cSel = document.getElementById('filter-category');
  const sIn = document.getElementById('filter-search');
  const countEl = document.getElementById('filter-count');

  // Populate dropdowns from row data
  const uniq = (attr) => [...new Set(rows.map(r => r.dataset[attr]).filter(Boolean))].sort();
  for (const v of uniq('player')) pSel.add(new Option(v, v));
  for (const v of uniq('phase')) phSel.add(new Option(v, v));
  for (const v of uniq('category')) cSel.add(new Option(v, v));

  function applyFilters() {
    const p = pSel.value, ph = phSel.value, c = cSel.value;
    const s = sIn.value.trim().toLowerCase();
    let shown = 0;
    for (const r of rows) {
      const ok =
        (!p || r.dataset.player === p) &&
        (!ph || r.dataset.phase === ph) &&
        (!c || r.dataset.category === c) &&
        (!s || r.dataset.search.indexOf(s) !== -1);
      r.style.display = ok ? '' : 'none';
      if (ok) shown++;
    }
    countEl.textContent = `Showing ${shown} / ${rows.length}`;
  }
  [pSel, phSel, cSel].forEach(el => el.addEventListener('change', applyFilters));
  sIn.addEventListener('input', applyFilters);
  applyFilters();

  // Click a payload cell to expand it
  table.querySelectorAll('.diag-payload').forEach(td => {
    td.title = 'Click to toggle wrap';
    td.style.cursor = 'pointer';
    td.addEventListener('click', () => td.classList.toggle('expanded'));
  });
})();
```

- [ ] **Step 3: Manual test**

Open a session. Verify filters populate from data and narrow the list. Click a payload cell (wrap toggle). Test with ~0 events, ~5 events, ~500 events.

---

## Task 21: Export endpoint

**Files:**
- Create: `/diagnostics/export.php`

- [ ] **Step 1: Build the export**

`/diagnostics/export.php`:

```php
<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';

$id = $_GET['id'] ?? '';
if ($id === '') { http_response_code(400); exit('Missing id'); }

$session = diag_get_session($id);
if ($session === null) { http_response_code(404); exit('Session not found'); }

$events = diag_list_events($id);

$payload = [
    'exported_at' => gmdate('c'),
    'ordering_note' => 'sequence_num is per-client monotonic. Cross-player order uses received_at as tiebreaker. Clocks may skew between players.',
    'session' => $session,
    'events' => $events,
];

$pin = preg_replace('/[^A-Z0-9]/', '', strtoupper($session['pin']));
$date = gmdate('Ymd', strtotime($session['started_at']));
$filename = "kred-diag-{$pin}-{$date}.json";

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
```

- [ ] **Step 2: Manual test**

Click "JSON" on a session row. Expected: a file downloads named `kred-diag-<pin>-<date>.json` containing session + events.

---

## Task 22: Delete-all endpoint

**Files:**
- Create: `/diagnostics/delete.php`

- [ ] **Step 1: Build the handler**

`/diagnostics/delete.php`:

```php
<?php
require_once __DIR__ . '/lib/guard.php';
require_once __DIR__ . '/lib/supabase.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('POST required');
}

try {
    diag_delete_all();
} catch (Throwable $e) {
    http_response_code(500);
    exit('Delete failed: ' . htmlspecialchars($e->getMessage()));
}

header('Location: /kred/diagnostics/index.php');
```

- [ ] **Step 2: Manual test**

From the session list, click "Delete all logs", confirm. Expected: redirect back to an empty list.

---

## Task 23: End-to-end manual verification

No code change — a manual verification pass.

- [ ] **Step 1: Run the migration**

Verify via Supabase dashboard that all four DDL objects (`diagnostic_enabled` column, 3 tables, 1 RPC) exist.

- [ ] **Step 2: Play a game in each player mode (3, 4, and 5)**

Per the standing rule ("All player modes must be supported"), do this three times:

1. Create a lobby with diagnostics **enabled** and player count 3. Invite 2 others (or open 2 incognito windows). Play through drafting, 1 campaign round, and reach bureaucracy. Trigger at least one illegal move and accept one AlertModal OK.
2. Repeat with player count 4.
3. Repeat with player count 5.

After each run, open `http://localhost/kred/diagnostics/` and verify:
- The session appears in the list with the correct PIN, player count, host name.
- The timeline shows events across all expected categories (`lobby`, `phase`, `click`, `dialog`, `selection`, `drag`, `move`, `bureaucracy`).
- At least one `DIALOG_OK` event is present.
- At least one `ILLEGAL_MOVE_REJECTED` event is present (from the forced illegal move).
- `PHASE_CHANGE` events appear at phase transitions.
- Events from ALL players are present (filter by each player in turn).

- [ ] **Step 3: Export and purge checks**

- Click "JSON" on one session. Open the file and sanity-check structure.
- Manually insert a `kred_diagnostic_sessions` row with `started_at = now() - interval '8 days'` and an event with `occurred_at = now() - interval '8 days'` via the Supabase dashboard. Reload the diagnostics index page. The purge should run and delete both rows (note the purge summary at the top of the page).
- Click "Delete all logs" and confirm. Reload. Expected: empty state.

- [ ] **Step 4: Verify a session with diagnostics DISABLED writes nothing**

Create a lobby with the checkbox OFF. Play for a minute. Confirm via Supabase that no new rows appeared in `kred_diagnostic_sessions` or `kred_diagnostic_events`.

- [ ] **Step 5: Commit a completion note (optional)**

If any small fixes emerged during verification, commit them. Otherwise nothing to commit for this task.

---

## Self-review checklist (already run; issues fixed inline)

- Every spec section maps to at least one task: schema (Task 1, 6), game capture (Tasks 4-7, 11-15), lobby plumbing (Tasks 8-10), PHP tool (Tasks 16-22), purge (Task 18), export (Task 21), delete (Task 22), setup doc (Task 3), gitignore (Task 2), player-mode rule (Task 23).
- No placeholders — every step contains concrete code or concrete commands.
- Type consistency — `DiagnosticsClient`, `SupabaseLike`, `EnableConfig`, `CreateOrAttachInput`, `DiagnosticEventInput`, `DiagnosticEventRow`, `EventCategory` are defined in Task 4/5/6 and used consistently in Tasks 7, 11, and beyond.
- The `event_count_delta` placeholder shape from Task 5 is explicitly replaced with a real RPC in Task 6, with test assertions for the RPC call.
