# Diagnostics Tool — Design

**Date:** 2026-04-16
**Status:** Approved (pending spec review)
**Author:** brainstormed with Claude

## Problem

We are testing KRED online with remote playtesters. When bugs are reported — illegal-move rejections, stuck dialogs, mis-placed pieces — we have no way to reconstruct what the player actually did. The existing `kred_game_actions` table logs only high-level game actions (a tile was played, a piece was moved), not the UI interactions leading up to them (what was clicked, what was dragged, what dialogs appeared, what errors were shown).

We need a diagnostic tool that records every meaningful UI interaction during a game session and lets us review any session after the fact to pinpoint exactly what happened.

## Goals

1. Capture **Tier 2 events** (semantic game events + all UI interactions) for any online game session where diagnostic logging is enabled.
2. Provide a **local PHP-based web UI** (running under XAMPP) to list logged sessions, view a single session's event timeline, filter by player/phase/category, and export a session as JSON.
3. Opt-in per session via a **host toggle** in the lobby setup.
4. **Auto-purge** events older than 7 days to bound Supabase storage cost.
5. The diagnostics tool itself is **not committed** to the repository — it's a local developer tool.

## Non-goals

- Real-time monitoring during a live session (this is post-hoc review).
- Tier 3 capture (raw mousemoves, keystrokes, scroll) — out of scope.
- Editing events or per-event deletion — only full-wipe deletion.
- Authentication on the diagnostics tool — it's local-only, guarded by a localhost-IP check.
- Human-readable plain-text export — JSON only, since the primary consumer is Claude for debugging assistance.
- Adding diagnostic tables to the Supabase realtime publication — write-only from game, read-only from tool.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  KRED Game (React/TS, Vite, hosted on Netlify)                  │
│                                                                 │
│  Lobby host toggles "Enable diagnostic logging"                 │
│  → sets kred_lobbies.diagnostic_enabled = true                  │
│                                                                 │
│  Diagnostic capture layer (new, src/diagnostics/)               │
│  - If lobby.diagnostic_enabled: instrument UI for Tier 2 events │
│  - Host inserts one row into kred_diagnostic_sessions           │
│  - All players batch-insert into kred_diagnostic_events (2s)    │
│  - No-op if diagnostic_enabled is false                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │  Supabase JS client (existing)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL)                                          │
│  - kred_lobbies            (+ diagnostic_enabled column)        │
│  - kred_diagnostic_sessions (new)                               │
│  - kred_diagnostic_events   (new)                               │
│  - kred_diagnostic_meta     (new, key/value for purge state)    │
└─────────────────────────────────────┬───────────────────────────┘
                                      │  REST via service_role key
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  /diagnostics/   (PHP, served by XAMPP, gitignored)             │
│  - index.php    → session list                                  │
│  - session.php  → single-session timeline + client-side filters │
│  - export.php   → JSON download of a session                    │
│  - delete.php   → "Delete all sessions" POST handler            │
│  - lib/purge.php → 7-day auto-purge on page load if >24h        │
│  - config.php   → Supabase URL + service-role key (local only)  │
└─────────────────────────────────────────────────────────────────┘
```

**Key decisions:**

- **Game writes directly to Supabase**, not to the PHP tool. The game runs on Netlify for remote testers; PHP runs on the developer's localhost via XAMPP and is not reachable from the public internet. Reusing the existing Supabase client keeps the write path simple.
- **PHP uses Supabase service-role key** to bypass RLS for reads, deletes, and purges. This key is stored in `config.php` which is inside the gitignored `/diagnostics/` folder.
- **Event batching on the client**: flush every 2 seconds, or on phase change, or on `beforeunload`. Prevents hundreds of individual inserts during drag operations.
- **Purge-on-open, not pg_cron**: first page load each day triggers a `DELETE WHERE occurred_at < now() - '7 days'`. No Supabase-side scheduled jobs required.

## Data Model

### Modify existing `kred_lobbies`

```sql
ALTER TABLE kred_lobbies
  ADD COLUMN diagnostic_enabled BOOLEAN NOT NULL DEFAULT false;
```

### New: `kred_diagnostic_sessions`

One row per logged lobby. Session-level metadata, denormalized so the diagnostics tool can render the list without joining to `kred_players` or `auth.users`.

```sql
CREATE TABLE kred_diagnostic_sessions (
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

CREATE INDEX idx_kred_diag_sessions_started_at
  ON kred_diagnostic_sessions(started_at DESC);
```

Only the host inserts the session row (on lobby creation) and updates `last_phase`, `ended_at`, and `event_count`. This avoids race conditions from multiple clients attempting the same insert.

### New: `kred_diagnostic_events`

One row per captured event.

```sql
CREATE TABLE kred_diagnostic_events (
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

CREATE INDEX idx_kred_diag_events_session
  ON kred_diagnostic_events(session_id, sequence_num);
CREATE INDEX idx_kred_diag_events_occurred
  ON kred_diagnostic_events(occurred_at);
```

**Clock handling.** `occurred_at` is from the client (player's machine) so cross-player clocks can skew. `sequence_num` is a per-client monotonic counter that gives reliable intra-client ordering. For cross-client ordering, the tool uses `received_at` (server insert timestamp) as a tiebreaker. The export file includes a note so the reader understands what they're looking at.

`player_index` is nullable because some events are system events (phase transitions announced server-side, purge events) that don't belong to a specific player.

### New: `kred_diagnostic_meta`

Tiny key/value table for purge state and any future metadata.

```sql
CREATE TABLE kred_diagnostic_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

First (and currently only) key: `last_purge_at` → `{"at": "2026-04-16T03:14:00Z"}`.

### RLS policies

```sql
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

CREATE POLICY "Players insert diagnostic events"
  ON kred_diagnostic_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM kred_diagnostic_sessions s
                      JOIN kred_players p ON p.lobby_id = s.lobby_id
                      WHERE s.id = kred_diagnostic_events.session_id
                      AND p.user_id = auth.uid()));
```

No SELECT/DELETE/UPDATE policies for authenticated users on these tables. The PHP tool uses the service-role key, which bypasses RLS.

## Game-side Capture Layer

### New module: `src/diagnostics/`

```
src/diagnostics/
├── DiagnosticsClient.ts
├── events.ts
├── useDiagnostics.ts
└── index.ts
```

### `DiagnosticsClient` responsibilities

- **Initialization.** Called once when a lobby loads. Checks `lobby.diagnostic_enabled`; if false, becomes a silent no-op. If true and the caller is the host, inserts a row into `kred_diagnostic_sessions` and caches the `session_id`. If true and the caller is not the host, looks up the session row by `lobby_id` and caches the `session_id`.
- **Buffering.** `log(event)` appends to an in-memory array. Never blocks the UI.
- **Flushing.** Every 2 seconds, or on phase change, or on `window.beforeunload`: single batched insert into `kred_diagnostic_events`. Host also increments `event_count` on the session row.
- **Sequence counter.** Monotonic per-client integer incremented on every `log()`, written to `sequence_num`.
- **Backpressure.** If a flush fails (network, rate limit), events stay in the buffer and are retried on the next tick. Buffer capped at 10,000 events — if exceeded, drop the oldest half with a console warning. This is a safety net, not an expected path.
- **Isolation.** Capture code must never throw into game code. All async writes are wrapped; errors log to console only.

### Event categories (Tier 2)

| Category | Example event types | Source |
|---|---|---|
| `lobby` | `LOBBY_CREATED`, `PLAYER_JOINED`, `PLAYER_LEFT`, `PLAYER_RECONNECTED`, `DIAG_ENABLED` | Lobby setup, Supabase presence |
| `phase` | `PHASE_CHANGE` (`{from, to}`) | Central phase transition point |
| `click` | `BUTTON_CLICK` (`{label, context}`), `MENU_OPENED`, `MENU_CLOSED` | Shared button/menu primitives |
| `dialog` | `DIALOG_OPENED`, `DIALOG_OK`, `DIALOG_CANCEL`, `DIALOG_DISMISSED` (`{dialog_type, context}`) | Shared dialog component |
| `selection` | `TILE_SELECTED`, `TILE_DESELECTED`, `PIECE_SELECTED`, `LOCATION_HOVERED` (throttled 200ms) | Board + hand components |
| `drag` | `DRAG_START`, `DRAG_OVER_VALID`, `DRAG_OVER_INVALID`, `DRAG_CANCELLED`, `DRAG_DROP` (`{from, to, item}`) | Drag handlers |
| `move` | `TILE_PLAYED`, `TILE_KEPT`, `TILE_DISCARDED`, `TILE_RETURNED`, `PIECE_MOVED`, `ILLEGAL_MOVE_REJECTED` (`{rule, reason}`) | Game action handlers |
| `challenge` | `CHALLENGE_STARTED`, `CHALLENGE_ACCEPTED`, `CHALLENGE_DECLINED`, `CHALLENGE_RESOLVED` | Challenge system |
| `bureaucracy` | `BUREAU_MENU_OPENED`, `BUREAU_PURCHASE`, `BUREAU_SKIPPED` | Bureaucracy components |
| `system` | `STATE_SYNC`, `RECONNECT_ATTEMPT`, `CLOCK_DRIFT` | Supabase client wrappers |
| `error` | `CLIENT_ERROR` (`{message, stack}`) | `window.onerror`, React error boundary |

### Integration strategy

Instrumentation is added by **wrapping shared primitives**, not by peppering `log()` calls throughout the codebase:

1. Wrap the 2–3 common **button and dialog primitives** once — every button/dialog in the app is then auto-logged.
2. Wrap the **central action dispatcher** (already the single entry point for `kred_game_actions`) — every game move is logged.
3. Wrap the **drag handler layer** once.
4. Use the explicit `useDiagnostics` hook only for cases the above miss (e.g., hovers, phase-specific menu opens without a shared wrapper).

Expected footprint: ~10 files touched for instrumentation, not ~50.

### Explicit non-captures (Tier 3, out of scope)

- Raw `mousemove` events
- Keystrokes inside input fields (privacy)
- Scroll position, resize, focus changes

### Player-mode compatibility

Per the standing rule, this must work identically for **3, 4, and 5 player modes**. All instrumentation points are shared code paths already used by all modes; no mode-specific branches are introduced.

## Lobby UI Change

The lobby setup screen (visible to the host only) gains a single checkbox:

```
[ ] Enable diagnostic logging for this session
    (Records detailed UI events to help debug reported issues. Only for this session.)
```

Default unchecked. The value is written to `kred_lobbies.diagnostic_enabled` on lobby creation. Non-host players see a small indicator in the lobby ("⚙ Diagnostics on") for transparency.

## PHP Tool

### Folder layout

```
/diagnostics/                        (sibling to src/)
├── index.php                        # session list
├── session.php                      # single-session timeline
├── export.php                       # JSON download
├── delete.php                       # "Delete all sessions" POST
├── lib/
│   ├── supabase.php                 # curl → PostgREST wrapper
│   ├── purge.php                    # 7-day purge-on-open
│   └── render.php                   # shared HTML header/footer
├── assets/
│   ├── styles.css
│   └── app.js                       # client-side filter logic
└── config.php                       # SUPABASE_URL + SERVICE_ROLE_KEY (local only)
```

The entire `/diagnostics/` folder is gitignored via the project root `.gitignore`. Because the folder is not committed, there is no in-folder example config. Setup instructions live in a committed `docs/diagnostics-setup.md` which includes the full `config.php` template inline, along with instructions for locating the service-role key in the Supabase dashboard.

### Pages

- **`index.php`** — lists sessions ordered `started_at DESC`. Single query on `kred_diagnostic_sessions`. Runs purge check on load: if `kred_diagnostic_meta.last_purge_at` is >24h old, delete `kred_diagnostic_events` and `kred_diagnostic_sessions` rows older than 7 days, then update the timestamp. Silent on success. Displays a "Delete all logs" button that POSTs to `delete.php` after a browser `confirm()`.
- **`session.php?session=<uuid>`** — shows session metadata in the header, then the full event list ordered by `(sequence_num ASC, received_at ASC)`. Filters (player / phase / category) are client-side JS — filters operate on already-loaded rows. Search box filters on `event_type` and payload JSON substring. Safety pagination kicks in only if a session has >500 events.
- **`export.php?session=<uuid>`** — streams a JSON file download containing the session row plus all events (raw rows, no reformatting). Filename: `kred-diag-<pin>-<YYYYMMDD>.json`. Optimized for pasting into Claude as a debugging artifact.
- **`delete.php`** — POST handler that `TRUNCATE kred_diagnostic_events, kred_diagnostic_sessions CASCADE` and redirects to `index.php`.

### Localhost guardrail

Every PHP page begins with:

```php
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit('Diagnostics tool is local-only.');
}
```

This is not security (the service-role key is the real concern); it's a guardrail in case the folder is accidentally exposed.

## Configuration

`/diagnostics/config.php` (not committed):

```php
<?php
return [
    'SUPABASE_URL' => 'https://<project>.supabase.co',
    'SERVICE_ROLE_KEY' => '<secret>',
];
```

`docs/diagnostics-setup.md` (committed, created as part of this work) explains how to create this file on a fresh checkout, where to find the service-role key in the Supabase dashboard, and warns not to commit it.

## Risks and Mitigations

- **Supabase storage cost spike if diagnostic_enabled stays on accidentally.** Mitigated by 7-day auto-purge and per-session opt-in default-off.
- **Service-role key leaks.** Mitigated by gitignoring `/diagnostics/`, the localhost IP guardrail, and a setup doc that flags this explicitly.
- **Event capture impacts game performance.** Mitigated by batched async writes, throttling of high-frequency events (hovers, drag-overs), and a no-op fast path when `diagnostic_enabled` is false.
- **Host disconnects mid-game** — session row's `ended_at` never gets set. Acceptable: the tool shows "Ended: (in progress or host disconnected)" and the session is still viewable. No functional impact.
- **Clock skew between players.** Documented in the tool and in exports; intra-player ordering uses `sequence_num`, cross-player ordering uses `received_at`.

## Open Questions

None at time of approval.

## Approved by

User approval 2026-04-16 across all four design sections (architecture, schema, capture layer, PHP tool).
