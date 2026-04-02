# Kred Online: Supabase Multiplayer Migration Design

**Date:** 2026-04-02
**Status:** Approved
**Branch:** `supabase-multiplayer`

## Overview

Migrate Kred Online from Socket.IO + MySQL server-authoritative multiplayer to a **host-authoritative** model using **Supabase** for auth, database, and real-time sync. This eliminates the need for a backend server, enabling deployment as a static site on Netlify.

The architecture follows the proven pattern from the Queensberry & Capital project.

## Architecture

### Host-Authoritative Model

- The **host player's browser** runs all game logic: tile validation, phase transitions, challenge flow, bureaucracy, win conditions.
- **Guest players** submit actions by inserting rows into `kred_game_actions`. The host listens for these via Supabase Realtime.
- **No server required.** The entire app deploys as a static build to Netlify.

### Component Stack

```
index.tsx
  └─ LobbyProvider          (Supabase lobby/PIN/join/rejoin)
       └─ AppProvider        (game state providers)
            └─ GameStateSynchronizer  (broadcast + DB sync engine)
                 └─ App.tsx  (existing game UI, largely unchanged)
```

### Authentication

Supabase anonymous sign-in. No accounts needed — players enter a display name and get an anonymous auth session. Sessions persist across page reloads for reconnection.

## Database Schema

Four tables in a dedicated Supabase project:

### `kred_lobbies`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PK, default gen_random_uuid() | Lobby identifier |
| `pin` | TEXT | UNIQUE, NOT NULL | 6-char join code (excludes 0/O/1/I) |
| `host_id` | UUID | FK to auth.users | Creator's auth ID |
| `player_count` | INT | NOT NULL, CHECK (3-5) | Required players |
| `status` | TEXT | NOT NULL, default 'WAITING' | `WAITING`, `ACTIVE`, `COMPLETED` |
| `created_at` | TIMESTAMPTZ | default now() | |

### `kred_players`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PK, default gen_random_uuid() | |
| `lobby_id` | UUID | FK to kred_lobbies | |
| `user_id` | UUID | NOT NULL | auth.uid() |
| `name` | TEXT | NOT NULL | Display name |
| `player_index` | INT | NOT NULL | 0-4, assigned on join order |
| `is_host` | BOOLEAN | default false | |
| `connection_status` | TEXT | default 'ONLINE' | `ONLINE`, `OFFLINE`, `LEFT` |
| `last_seen` | TIMESTAMPTZ | default now() | |
| `created_at` | TIMESTAMPTZ | default now() | |

### `kred_game_states`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `lobby_id` | UUID | PK, FK to kred_lobbies | One row per lobby (upsert) |
| `phase` | TEXT | NOT NULL | Current game phase |
| `state_json` | JSONB | NOT NULL | Full serialized game state |
| `version` | INT | default 1 | Incremented by host on every push |
| `updated_at` | TIMESTAMPTZ | default now() | |

The `state_json` JSONB blob contains:
- `players` — array with hands, keptTiles, bureaucracyTiles, credibility
- `pieces` — array with id, playerId, type, locationId (seat/podium/office/community/rostrum), position
- `boardTiles` — visual tile placements
- `currentPlayerIndex` — whose turn it is
- `playedTile` — current tile play state machine (null or PlayedTileState)
- `challengeFlow` — receiver acceptance, challenger order, results
- `takeAdvantage` — modal state, selection, purchase
- `bureaucracy` — active flag, current player, completed players
- `hasPlayedTileThisTurn`, `movedPiecesThisTurn`, `bankedTiles`
- `stateVersion`, `lastUpdated`

### `kred_game_actions`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PK, default gen_random_uuid() | |
| `lobby_id` | UUID | FK to kred_lobbies | |
| `player_id` | UUID | NOT NULL | auth.uid() of submitter |
| `action_type` | TEXT | NOT NULL | Action identifier |
| `payload` | JSONB | default '{}' | Action-specific data |
| `created_at` | TIMESTAMPTZ | default now() | |

This table is added to the `supabase_realtime` publication for postgres_changes events.

### RLS Policies

- **kred_lobbies:** Authenticated users can read (by PIN). Only host can update status.
- **kred_players:** Authenticated users can read players in their lobby. Users can insert/update only their own records.
- **kred_game_states:** Authenticated users can read. Only host can insert/update.
- **kred_game_actions:** Authenticated users can read actions in their lobby. Users can only insert their own actions.

## State Synchronization

### Dual-Channel Push (Host → Guests)

On every state change (debounced 100ms):

1. **Broadcast channel** (`kred_game:${lobbyId}`) — Low-latency (~50ms). Ephemeral, no persistence. Primary delivery channel.
2. **Database upsert** to `kred_game_states` — Persistent. Used for reconnection recovery and as fallback.

### Triple-Layer Receive (Guests)

1. **Broadcast listener** — Primary. Real-time state from host.
2. **Postgres changes subscription** on `kred_game_states` — Secondary. Fires on DB update.
3. **Polling fallback** — Every 3 seconds, fetch latest from DB. Safety net.

### Version-Based Deduplication

Every state packet carries an incrementing `version` number. Guests track `lastProcessedVersion` and skip packets with version <= last processed. Prevents triple-application from the three receive channels.

### Guest Action Flow

1. Guest performs action → insert row into `kred_game_actions`
2. Host has postgres_changes subscription on `kred_game_actions` filtered by `lobby_id`
3. Host receives action, validates, updates local game state
4. State change triggers dual-channel push to all guests
5. When acting player IS the host, action processes locally (no DB round-trip)

## Game Phase → Action Type Mapping

### DRAFTING

| Action Type | Submitter | Payload |
|-------------|-----------|---------|
| `SELECT_DRAFT_TILE` | Current player | `{ tileId }` |

### CAMPAIGN

| Action Type | Submitter | Payload |
|-------------|-----------|---------|
| `PLAY_TILE` | Mover | `{ tileId, targetPlayerId }` |
| `MOVE_PIECE` | Mover | `{ pieceId, locationId, position }` |
| `END_TURN` | Mover | `{}` |
| `RECEIVER_DECISION` | Receiver | `{ accepted: boolean }` |
| `RECEIVER_REWARD` | Receiver | `{ choice: 'credibility' \| 'advance' }` |
| `CHALLENGER_DECISION` | Challenger | `{ challenge: boolean }` |
| `COMPLETE_BONUS_MOVE` | Active player | `{}` |
| `COMPLETE_CORRECTION` | Active player | `{}` |
| `ADVANTAGE_SELECT_TILES` | Challenger | `{ tileIds[] }` |
| `ADVANTAGE_PURCHASE` | Challenger | `{ purchase }` |

### BUREAUCRACY

| Action Type | Submitter | Payload |
|-------------|-----------|---------|
| `BUREAUCRACY_PURCHASE` | Current player | `{ purchase }` |
| `BUREAUCRACY_COMPLETE` | Current player | `{}` |

Phase transitions are always host-driven. The host detects completion conditions and advances the phase locally.

## Lobby & Reconnection

### Lobby Flow

1. **Create:** Host enters name, selects player count (3/4/5) → anonymous sign-in → insert lobby → show WaitingRoom with 6-char PIN
2. **Join:** Guest enters PIN + name → anonymous sign-in → look up lobby by PIN → insert player row → enter WaitingRoom
3. **Start:** Host clicks Start when all players joined → update lobby status to `ACTIVE` → mount GameStateSynchronizer → begin DRAFTING phase

PIN generation uses chars `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (excludes ambiguous 0/O/1/I).

### Reconnection

1. On app mount, `LobbyProvider` checks `supabase.auth.getSession()`
2. If session exists, query for active lobby where player's `connection_status != 'LEFT'` and lobby `status = 'ACTIVE'`
3. If found, show "Active game found — [Rejoin] [Dismiss]"
4. Rejoin: restore lobby state, hydrate game state from `kred_game_states` DB row, seed version counter from snapshot

### Disconnect Handling

- Supabase Presence channel tracks online players
- When a player's browser closes, presence removes them after timeout
- Host updates that player's `connection_status` to `OFFLINE`
- Other players see "(disconnected)" next to the name
- Game continues — no auto-pause for 3-5 player games

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client init with env vars |
| `src/contexts/LobbyContext.tsx` | Lobby creation, PIN, join, rejoin |
| `src/components/screens/LobbyScreen.tsx` | Create/join game UI |
| `src/components/screens/WaitingRoom.tsx` | PIN display, player list, start button |
| `src/components/GameStateSynchronizer.tsx` | Dual-channel sync engine |
| `supabase/schema.sql` | Database schema + RLS policies |
| `netlify.toml` | Deployment configuration |
| `.env.local.example` | Template for local env vars |

### Modified Files

| File | Change |
|------|--------|
| `index.tsx` | Mount LobbyProvider → App instead of AppWithMultiplayer |
| `src/App.tsx` | Remove socket props, consume lobby/sync contexts |
| `vite.config.ts` | Change base from `'/KRED/'` to `'/'` |
| `package.json` | Add `@supabase/supabase-js`, remove `socket.io-client` |
| `index.html` | Replace Tailwind CDN with built CSS |
| `src/hooks/useGameSync.ts` | Rewrite for Supabase |
| `src/hooks/useMultiplayerActions.ts` | Rewrite — insert actions to DB |

### Archive Then Delete

Move to `.claude/archives/multiplayer-v1/` before removing:

| File | Reason |
|------|--------|
| `src/contexts/SocketContext.tsx` | Replaced by Supabase |
| `src/hooks/useMultiplayerSync.ts` | Replaced by GameStateSynchronizer |
| `src/AppWithMultiplayer.tsx` | No longer needed |
| `src/AppRoot.tsx` | Replaced by LobbyProvider routing |
| `packages/server/*` | No backend server |
| `server/socketHandlers.cjs` | No backend server |

### Keep Intact

- `src/App.tsx` game logic (handlers, state management, phase rendering)
- `src/config/*`, `src/game/*`, `src/rules/*`, `src/types/*`, `src/utils/*`
- `src/handlers/*` (challenge flow, game flow, piece movement, tile play, turn handlers)
- `src/hooks/useAlerts.ts`, `useBoardDisplay.ts`, `useBonusMoves.ts`, `useBureaucracy.ts`, `useChallengeFlow.ts`, `useGameState.ts`, `useMoveTracking.ts`, `useTestMode.ts`, `useTilePlayWorkflow.ts`
- `src/components/screens/BureaucracyScreen.tsx`, `CampaignScreen.tsx`, `DraftingScreen.tsx`, `PlayerSelectionScreen.tsx`
- All test files (update as needed)
- `packages/shared/*` (shared game logic)

## Deployment

### Netlify Configuration

```toml
[build]
  command = "npm run build:shared && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables (Netlify Dashboard)

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous public key

### Supabase Project Setup (One-Time)

1. Create project at supabase.com
2. Run `supabase/schema.sql` to create tables + RLS policies
3. Enable Realtime on `kred_game_actions` table
4. Copy project URL and anon key to Netlify env vars and `.env.local`

### Local Development

- `.env.local` with Supabase credentials
- `npm run dev` — Vite at localhost:5173, connects to Supabase cloud
- No local server needed

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Host-authoritative | Proven in Queensberry, no server needed, deploys to static hosting |
| Supabase project | New dedicated project | Clean isolation from Queensberry |
| Player count | Strict (host selects 3/4/5) | Board layout and piece configs are tightly coupled to count |
| Old multiplayer code | Archive then remove | Preserves reference for game logic while cleaning active codebase |
| Base path | Root (`/`) | Netlify gives each site its own subdomain |
| Sync strategy | Dual-channel broadcast + DB | Low latency with persistent fallback, proven pattern |
| Guest actions | DB insert + host subscription | Clean separation, auditable, works with RLS |
| Reconnection | Session-based with DB hydration | Handles browser refresh and temporary disconnects |
