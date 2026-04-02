# Supabase Multiplayer Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Socket.IO + MySQL multiplayer with host-authoritative Supabase real-time, enabling static deployment to Netlify.

**Architecture:** Host player's browser runs game logic. Guests submit actions via Supabase `kred_game_actions` table. Host pushes state via Supabase Broadcast channel + DB persistence. Triple-layer receive on guests (broadcast, postgres_changes, 3s polling).

**Tech Stack:** React 19, TypeScript, Vite, Supabase (auth, database, realtime), Tailwind CSS (npm), Vitest

**Spec:** `docs/superpowers/specs/2026-04-02-supabase-multiplayer-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/supabase.ts` | Supabase client singleton with env var init |
| `src/contexts/LobbyContext.tsx` | Lobby CRUD, PIN generation, join/rejoin, player list subscription |
| `src/components/screens/LobbyScreen.tsx` | Create/join game UI |
| `src/components/screens/WaitingRoom.tsx` | PIN display, player list, start game button |
| `src/components/GameStateSynchronizer.tsx` | Dual-channel sync engine (host push, guest receive) |
| `src/hooks/useSupabaseActions.ts` | Guest action emitter (insert to kred_game_actions or local for host) |
| `supabase/schema.sql` | Database tables, RLS policies, realtime config |
| `netlify.toml` | Build + redirect config |
| `.env.local.example` | Template for Supabase env vars |

### Modified Files
| File | Change |
|------|--------|
| `index.tsx` | Mount LobbyProvider wrapping App |
| `index.html` | Remove Tailwind CDN script tag |
| `src/App.tsx` | Remove Socket.IO props, consume LobbyContext + GameStateSynchronizer |
| `vite.config.ts` | Change base to `'/'` |
| `package.json` | Add `@supabase/supabase-js`, `tailwindcss`, `postcss`, `autoprefixer`; remove `socket.io-client` |

### Archived Files (move to `.claude/archives/multiplayer-v1/`)
| File | Reason |
|------|--------|
| `src/contexts/SocketContext.tsx` | Replaced by LobbyContext + Supabase |
| `src/hooks/useMultiplayerSync.ts` | Replaced by GameStateSynchronizer |
| `src/hooks/useMultiplayerActions.ts` | Replaced by useSupabaseActions |
| `src/hooks/useGameSync.ts` | Replaced by useSupabaseActions |
| `src/AppWithMultiplayer.tsx` | Replaced by LobbyProvider routing |
| `src/AppRoot.tsx` | Replaced by LobbyProvider routing |
| `packages/server/` | No backend server needed |
| `server/socketHandlers.cjs` | No backend server needed |

---

## Task 1: Create Branch and Archive Old Multiplayer Code

**Files:**
- Archive: `src/contexts/SocketContext.tsx`, `src/hooks/useMultiplayerSync.ts`, `src/hooks/useMultiplayerActions.ts`, `src/hooks/useGameSync.ts`, `src/AppWithMultiplayer.tsx`, `src/AppRoot.tsx`, `packages/server/`, `server/socketHandlers.cjs`
- Create: `.claude/archives/multiplayer-v1/` (directory)

- [ ] **Step 1: Create branch from main**

```bash
git checkout main
git checkout -b supabase-multiplayer
```

- [ ] **Step 2: Create archive directory and copy old multiplayer files**

```bash
mkdir -p .claude/archives/multiplayer-v1/hooks
mkdir -p .claude/archives/multiplayer-v1/contexts
mkdir -p .claude/archives/multiplayer-v1/server-package
mkdir -p .claude/archives/multiplayer-v1/server-socket

cp src/contexts/SocketContext.tsx .claude/archives/multiplayer-v1/contexts/
cp src/hooks/useMultiplayerSync.ts .claude/archives/multiplayer-v1/hooks/
cp src/hooks/useMultiplayerActions.ts .claude/archives/multiplayer-v1/hooks/
cp src/hooks/useGameSync.ts .claude/archives/multiplayer-v1/hooks/
cp src/AppWithMultiplayer.tsx .claude/archives/multiplayer-v1/
cp src/AppRoot.tsx .claude/archives/multiplayer-v1/
cp server/socketHandlers.cjs .claude/archives/multiplayer-v1/server-socket/
cp -r packages/server/src .claude/archives/multiplayer-v1/server-package/
cp packages/server/package.json .claude/archives/multiplayer-v1/server-package/
cp packages/server/tsconfig.json .claude/archives/multiplayer-v1/server-package/
cp packages/server/schema.sql .claude/archives/multiplayer-v1/server-package/
```

- [ ] **Step 3: Delete the original files**

```bash
rm src/contexts/SocketContext.tsx
rm src/hooks/useMultiplayerSync.ts
rm src/hooks/useMultiplayerActions.ts
rm src/hooks/useGameSync.ts
rm src/AppWithMultiplayer.tsx
rm src/AppRoot.tsx
rm server/socketHandlers.cjs
rm -rf packages/server
```

- [ ] **Step 4: Commit archive**

```bash
git add .claude/archives/multiplayer-v1/
git add -u src/contexts/SocketContext.tsx src/hooks/useMultiplayerSync.ts src/hooks/useMultiplayerActions.ts src/hooks/useGameSync.ts src/AppWithMultiplayer.tsx src/AppRoot.tsx server/socketHandlers.cjs packages/server/
git commit -m "chore: archive Socket.IO multiplayer code to multiplayer-v1

Preserves old server-authoritative code for reference while
preparing for Supabase host-authoritative migration."
```

---

## Task 2: Update Dependencies and Build Config

**Files:**
- Modify: `package.json`, `vite.config.ts`, `index.html`
- Create: `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `.env.local.example`, `netlify.toml`

- [ ] **Step 1: Update package.json — add Supabase, Tailwind; remove socket.io-client**

```bash
npm install @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite
npm uninstall socket.io-client
```

Also remove the `packages/server` workspace from `package.json`. Edit `package.json` workspaces field from:
```json
"workspaces": [
  "packages/shared",
  "packages/server"
]
```
to:
```json
"workspaces": [
  "packages/shared"
]
```

And remove these scripts that reference the server:
- `"dev:server"`
- `"dev:all"`
- `"build:server"`
- `"build:all"` (update to just build shared + client)

Update `build:all` to:
```json
"build:all": "npm run build:shared && npm run build"
```

- [ ] **Step 2: Update vite.config.ts — change base path, add Tailwind plugin**

Replace the full contents of `vite.config.ts` with:
```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

- [ ] **Step 3: Create src/index.css for Tailwind**

Create `src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: Update index.html — remove Tailwind CDN, add CSS import**

Replace `index.html` with:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kred</title>
  </head>
  <body class="bg-gray-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create .env.local.example**

Create `.env.local.example`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 6: Create netlify.toml**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build:all"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 7: Commit dependency and config changes**

```bash
git add package.json package-lock.json vite.config.ts index.html src/index.css .env.local.example netlify.toml
git commit -m "chore: update deps and config for Supabase + Netlify

- Add @supabase/supabase-js, tailwindcss
- Remove socket.io-client, server workspace
- Change base path from /KRED/ to /
- Replace Tailwind CDN with npm build
- Add netlify.toml and .env.local.example"
```

---

## Task 3: Supabase Client and Database Schema

**Files:**
- Create: `src/lib/supabase.ts`, `supabase/schema.sql`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Multiplayer features will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
```

- [ ] **Step 2: Create database schema**

Create `supabase/schema.sql`:
```sql
-- Kred Online: Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE kred_lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  player_count INT NOT NULL CHECK (player_count >= 3 AND player_count <= 5),
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  player_index INT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  connection_status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (connection_status IN ('ONLINE', 'OFFLINE', 'LEFT')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_game_states (
  lobby_id UUID PRIMARY KEY REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  state_json JSONB NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kred_game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES kred_lobbies(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_kred_lobbies_pin ON kred_lobbies(pin);
CREATE INDEX idx_kred_lobbies_status ON kred_lobbies(status);
CREATE INDEX idx_kred_players_lobby_id ON kred_players(lobby_id);
CREATE INDEX idx_kred_players_user_id ON kred_players(user_id);
CREATE INDEX idx_kred_game_actions_lobby_id ON kred_game_actions(lobby_id);
CREATE INDEX idx_kred_game_actions_created_at ON kred_game_actions(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE kred_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE kred_game_actions ENABLE ROW LEVEL SECURITY;

-- Lobbies: anyone authenticated can read, anyone can insert, only host can update
CREATE POLICY "Anyone can read lobbies"
  ON kred_lobbies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create a lobby"
  ON kred_lobbies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update lobby"
  ON kred_lobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Players: anyone authenticated can read, users manage own records
CREATE POLICY "Anyone can read players"
  ON kred_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join lobbies"
  ON kred_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player record"
  ON kred_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Game states: anyone can read, host can write
CREATE POLICY "Anyone can read game states"
  ON kred_game_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Host can insert game state"
  ON kred_game_states FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kred_lobbies
      WHERE kred_lobbies.id = lobby_id
      AND kred_lobbies.host_id = auth.uid()
    )
  );

CREATE POLICY "Host can update game state"
  ON kred_game_states FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kred_lobbies
      WHERE kred_lobbies.id = lobby_id
      AND kred_lobbies.host_id = auth.uid()
    )
  );

-- Game actions: anyone can read, users insert own actions
CREATE POLICY "Anyone can read game actions"
  ON kred_game_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own actions"
  ON kred_game_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE kred_game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE kred_players;
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts supabase/schema.sql
git commit -m "feat: add Supabase client and database schema

Four tables: kred_lobbies, kred_players, kred_game_states,
kred_game_actions with RLS policies and realtime config."
```

---

## Task 4: LobbyContext — Core Lobby Logic

**Files:**
- Create: `src/contexts/LobbyContext.tsx`

- [ ] **Step 1: Create LobbyContext with full lobby logic**

Create `src/contexts/LobbyContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================================
// Types
// ============================================================================

interface LobbyPlayer {
  id: string;
  name: string;
  playerIndex: number;
  isHost: boolean;
  connectionStatus: string;
}

interface LobbyContextType {
  // State
  lobbyId: string | null;
  lobbyPin: string | null;
  isHost: boolean;
  userId: string | null;
  playerIndex: number | null;
  playerCount: number | null;
  lobbyStatus: string | null;
  lobbyPlayers: LobbyPlayer[];
  isRejoining: boolean;
  rejoinAvailable: { pin: string; name: string; lobbyId: string } | null;

  // Actions
  createLobby: (hostName: string, playerCount: number) => Promise<void>;
  joinLobby: (pin: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  rejoinGame: () => Promise<void>;
  dismissRejoin: () => void;
  leaveLobby: () => Promise<void>;
}

const LobbyContext = createContext<LobbyContextType | null>(null);

// ============================================================================
// PIN Generation
// ============================================================================

const PIN_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generatePin(): string {
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += PIN_CHARS[Math.floor(Math.random() * PIN_CHARS.length)];
  }
  return pin;
}

// ============================================================================
// Provider
// ============================================================================

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyPin, setLobbyPin] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [lobbyStatus, setLobbyStatus] = useState<string | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isRejoining, setIsRejoining] = useState(false);
  const [rejoinAvailable, setRejoinAvailable] = useState<{ pin: string; name: string; lobbyId: string } | null>(null);

  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // --------------------------------------------------------------------------
  // Auth: ensure anonymous session
  // --------------------------------------------------------------------------
  const ensureAuth = useCallback(async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      return session.user.id;
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Auth failed: ${error.message}`);
    const uid = data.user!.id;
    setUserId(uid);
    return uid;
  }, []);

  // --------------------------------------------------------------------------
  // Rejoin detection on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    const checkRejoin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      const { data: playerRows } = await supabase
        .from('kred_players')
        .select('lobby_id, name, is_host, player_index, kred_lobbies!inner(id, pin, status, player_count)')
        .eq('user_id', session.user.id)
        .neq('connection_status', 'LEFT')
        .order('last_seen', { ascending: false })
        .limit(1);

      if (playerRows && playerRows.length > 0) {
        const row = playerRows[0] as any;
        const lobby = row.kred_lobbies;
        if (lobby.status === 'ACTIVE' || lobby.status === 'WAITING') {
          setRejoinAvailable({
            pin: lobby.pin,
            name: row.name,
            lobbyId: lobby.id,
          });
        }
      }
    };
    checkRejoin();
  }, []);

  // --------------------------------------------------------------------------
  // Subscribe to player list changes for current lobby
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!lobbyId) return;

    // Initial fetch
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('kred_players')
        .select('id, name, player_index, is_host, connection_status')
        .eq('lobby_id', lobbyId)
        .neq('connection_status', 'LEFT')
        .order('player_index');

      if (data) {
        setLobbyPlayers(data.map(p => ({
          id: p.id,
          name: p.name,
          playerIndex: p.player_index,
          isHost: p.is_host,
          connectionStatus: p.connection_status,
        })));
      }
    };
    fetchPlayers();

    // Real-time subscription for player joins
    const channel = supabase
      .channel(`lobby_players:${lobbyId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kred_players', filter: `lobby_id=eq.${lobbyId}` },
        () => { fetchPlayers(); }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Polling fallback (3s)
    const interval = setInterval(fetchPlayers, 3000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [lobbyId]);

  // --------------------------------------------------------------------------
  // Subscribe to lobby status changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby_status:${lobbyId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kred_lobbies', filter: `id=eq.${lobbyId}` },
        (payload) => {
          const newStatus = (payload.new as any).status;
          setLobbyStatus(newStatus);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [lobbyId]);

  // --------------------------------------------------------------------------
  // Create lobby
  // --------------------------------------------------------------------------
  const createLobby = useCallback(async (hostName: string, playerCount: number) => {
    const uid = await ensureAuth();
    const pin = generatePin();

    // Mark old player records as LEFT
    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('user_id', uid)
      .neq('connection_status', 'LEFT');

    // Insert lobby
    const { data: lobby, error: lobbyError } = await supabase
      .from('kred_lobbies')
      .insert({ pin, host_id: uid, player_count: playerCount, status: 'WAITING' })
      .select('id')
      .single();

    if (lobbyError) throw new Error(`Failed to create lobby: ${lobbyError.message}`);

    // Insert host as player
    const { error: playerError } = await supabase
      .from('kred_players')
      .insert({
        lobby_id: lobby.id,
        user_id: uid,
        name: hostName,
        player_index: 0,
        is_host: true,
        connection_status: 'ONLINE',
      });

    if (playerError) throw new Error(`Failed to join as host: ${playerError.message}`);

    setLobbyId(lobby.id);
    setLobbyPin(pin);
    setIsHost(true);
    setPlayerIndex(0);
    setPlayerCount(playerCount);
    setLobbyStatus('WAITING');
    setRejoinAvailable(null);
  }, [ensureAuth]);

  // --------------------------------------------------------------------------
  // Join lobby
  // --------------------------------------------------------------------------
  const joinLobby = useCallback(async (pin: string, playerName: string) => {
    const uid = await ensureAuth();

    // Look up lobby by PIN
    const { data: lobby, error: lobbyError } = await supabase
      .from('kred_lobbies')
      .select('id, status, player_count')
      .eq('pin', pin.toUpperCase())
      .single();

    if (lobbyError || !lobby) throw new Error('Lobby not found. Check the PIN and try again.');
    if (lobby.status !== 'WAITING') throw new Error('This game has already started.');

    // Check how many players are already in
    const { data: existingPlayers } = await supabase
      .from('kred_players')
      .select('player_index')
      .eq('lobby_id', lobby.id)
      .neq('connection_status', 'LEFT')
      .order('player_index');

    const currentCount = existingPlayers?.length ?? 0;
    if (currentCount >= lobby.player_count) throw new Error('This lobby is full.');

    // Assign next player index
    const nextIndex = currentCount;

    // Mark old player records as LEFT
    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('user_id', uid)
      .neq('connection_status', 'LEFT');

    // Insert guest player
    const { error: playerError } = await supabase
      .from('kred_players')
      .insert({
        lobby_id: lobby.id,
        user_id: uid,
        name: playerName,
        player_index: nextIndex,
        is_host: false,
        connection_status: 'ONLINE',
      });

    if (playerError) throw new Error(`Failed to join: ${playerError.message}`);

    setLobbyId(lobby.id);
    setLobbyPin(pin.toUpperCase());
    setIsHost(false);
    setPlayerIndex(nextIndex);
    setPlayerCount(lobby.player_count);
    setLobbyStatus('WAITING');
    setRejoinAvailable(null);
  }, [ensureAuth]);

  // --------------------------------------------------------------------------
  // Start game (host only)
  // --------------------------------------------------------------------------
  const startGame = useCallback(async () => {
    if (!lobbyId || !isHost) return;

    const { error } = await supabase
      .from('kred_lobbies')
      .update({ status: 'ACTIVE' })
      .eq('id', lobbyId);

    if (error) throw new Error(`Failed to start game: ${error.message}`);

    setLobbyStatus('ACTIVE');
  }, [lobbyId, isHost]);

  // --------------------------------------------------------------------------
  // Rejoin game
  // --------------------------------------------------------------------------
  const rejoinGame = useCallback(async () => {
    if (!rejoinAvailable || !userId) return;

    setIsRejoining(true);

    // Fetch lobby details
    const { data: lobby } = await supabase
      .from('kred_lobbies')
      .select('id, pin, status, player_count')
      .eq('id', rejoinAvailable.lobbyId)
      .single();

    if (!lobby) {
      setRejoinAvailable(null);
      setIsRejoining(false);
      return;
    }

    // Fetch player record
    const { data: playerRow } = await supabase
      .from('kred_players')
      .select('player_index, is_host')
      .eq('lobby_id', lobby.id)
      .eq('user_id', userId)
      .neq('connection_status', 'LEFT')
      .single();

    if (!playerRow) {
      setRejoinAvailable(null);
      setIsRejoining(false);
      return;
    }

    // Update connection status
    await supabase
      .from('kred_players')
      .update({ connection_status: 'ONLINE', last_seen: new Date().toISOString() })
      .eq('lobby_id', lobby.id)
      .eq('user_id', userId);

    setLobbyId(lobby.id);
    setLobbyPin(lobby.pin);
    setIsHost(playerRow.is_host);
    setPlayerIndex(playerRow.player_index);
    setPlayerCount(lobby.player_count);
    setLobbyStatus(lobby.status);
    setRejoinAvailable(null);
    // isRejoining stays true — GameStateSynchronizer will set it false after hydrating
  }, [rejoinAvailable, userId]);

  // --------------------------------------------------------------------------
  // Dismiss rejoin offer
  // --------------------------------------------------------------------------
  const dismissRejoin = useCallback(() => {
    setRejoinAvailable(null);
  }, []);

  // --------------------------------------------------------------------------
  // Leave lobby
  // --------------------------------------------------------------------------
  const leaveLobby = useCallback(async () => {
    if (!lobbyId || !userId) return;

    await supabase
      .from('kred_players')
      .update({ connection_status: 'LEFT' })
      .eq('lobby_id', lobbyId)
      .eq('user_id', userId);

    setLobbyId(null);
    setLobbyPin(null);
    setIsHost(false);
    setPlayerIndex(null);
    setPlayerCount(null);
    setLobbyStatus(null);
    setLobbyPlayers([]);
    setIsRejoining(false);
  }, [lobbyId, userId]);

  const value: LobbyContextType = {
    lobbyId, lobbyPin, isHost, userId, playerIndex, playerCount,
    lobbyStatus, lobbyPlayers, isRejoining, rejoinAvailable,
    createLobby, joinLobby, startGame, rejoinGame, dismissRejoin, leaveLobby,
  };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
}

export function useLobby(): LobbyContextType {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error('useLobby must be used within LobbyProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit src/contexts/LobbyContext.tsx 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/LobbyContext.tsx
git commit -m "feat: add LobbyContext for Supabase lobby management

PIN generation, create/join/rejoin/leave lobby, real-time
player list subscription with 3s polling fallback."
```

---

## Task 5: LobbyScreen and WaitingRoom UI

**Files:**
- Create: `src/components/screens/LobbyScreen.tsx`, `src/components/screens/WaitingRoom.tsx`

- [ ] **Step 1: Create LobbyScreen**

Create `src/components/screens/LobbyScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';

export default function LobbyScreen() {
  const { createLobby, joinLobby, rejoinAvailable, rejoinGame, dismissRejoin } = useLobby();

  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [hostName, setHostName] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(3);
  const [joinPin, setJoinPin] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!hostName.trim()) { setError('Please enter your name'); return; }
    setError(null);
    setLoading(true);
    try {
      await createLobby(hostName.trim(), selectedPlayerCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!guestName.trim()) { setError('Please enter your name'); return; }
    if (!joinPin.trim()) { setError('Please enter the game PIN'); return; }
    setError(null);
    setLoading(true);
    try {
      await joinLobby(joinPin.trim(), guestName.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="Kred" className="mx-auto h-24 mb-4" />
          <h1 className="text-3xl font-bold text-white">KRED Online</h1>
        </div>

        {/* Rejoin banner */}
        {rejoinAvailable && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-200 text-sm mb-2">
              Active game found (PIN: <span className="font-mono font-bold">{rejoinAvailable.pin}</span>)
            </p>
            <div className="flex gap-2">
              <button onClick={rejoinGame} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                Rejoin Game
              </button>
              <button onClick={dismissRejoin} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Main menu */}
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
            >
              Create Game
            </button>
            <div className="flex items-center gap-4">
              <hr className="flex-1 border-gray-600" />
              <span className="text-gray-400 text-sm">or</span>
              <hr className="flex-1 border-gray-600" />
            </div>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
            >
              Join Game
            </button>
          </div>
        )}

        {/* Create game form */}
        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Number of Players</label>
              <div className="flex gap-2">
                {[3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedPlayerCount(n)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      selectedPlayerCount === n
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {n} Players
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            <button onClick={() => { setMode('menu'); setError(null); }} className="w-full text-gray-400 hover:text-white text-sm py-2">
              Back
            </button>
          </div>
        )}

        {/* Join game form */}
        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Game PIN</label>
              <input
                type="text"
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-center text-2xl tracking-widest"
                placeholder="______"
                maxLength={6}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
            <button onClick={() => { setMode('menu'); setError(null); }} className="w-full text-gray-400 hover:text-white text-sm py-2">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create WaitingRoom**

Create `src/components/screens/WaitingRoom.tsx`:
```typescript
import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';

export default function WaitingRoom() {
  const { lobbyPin, isHost, playerCount, lobbyPlayers, startGame, leaveLobby } = useLobby();

  const allPlayersJoined = lobbyPlayers.length === playerCount;

  const handleStart = async () => {
    try {
      await startGame();
    } catch (err: any) {
      console.error('Failed to start game:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Waiting Room</h2>
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-sm mb-1">Share this PIN with other players</p>
            <p className="text-4xl font-mono font-bold text-green-400 tracking-widest">{lobbyPin}</p>
          </div>
          <p className="text-gray-400 text-sm">
            {lobbyPlayers.length} / {playerCount} players joined
          </p>
        </div>

        {/* Player list */}
        <div className="space-y-2 mb-6">
          {Array.from({ length: playerCount ?? 0 }).map((_, i) => {
            const player = lobbyPlayers.find(p => p.playerIndex === i);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  player ? 'bg-gray-700' : 'bg-gray-700/30 border border-dashed border-gray-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${player ? 'bg-green-500' : 'bg-gray-600'}`} />
                <span className={`${player ? 'text-white' : 'text-gray-500'}`}>
                  {player ? (
                    <>
                      {player.name}
                      {player.isHost && <span className="text-yellow-500 text-xs ml-2">(Host)</span>}
                    </>
                  ) : (
                    'Waiting for player...'
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {isHost && (
            <button
              onClick={handleStart}
              disabled={!allPlayersJoined}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                allPlayersJoined
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allPlayersJoined ? 'Start Game' : `Waiting for ${playerCount! - lobbyPlayers.length} more...`}
            </button>
          )}
          {!isHost && (
            <p className="text-center text-gray-400 text-sm">
              Waiting for the host to start the game...
            </p>
          )}
          <button
            onClick={leaveLobby}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg text-sm transition-colors"
          >
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/screens/LobbyScreen.tsx src/components/screens/WaitingRoom.tsx
git commit -m "feat: add LobbyScreen and WaitingRoom UI components

Create/join game with PIN, player count selection, player
list with real-time updates, host start game button."
```

---

## Task 6: useSupabaseActions — Guest Action Emitter

**Files:**
- Create: `src/hooks/useSupabaseActions.ts`

- [ ] **Step 1: Create the actions hook**

Create `src/hooks/useSupabaseActions.ts`:
```typescript
import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';

type ActionHandler = (action: { type: string; playerId: string; payload: any }) => void;

export function useSupabaseActions() {
  const { lobbyId, userId, isHost } = useLobby();
  const onActionReceivedRef = useRef<ActionHandler | null>(null);

  /**
   * Register a handler for incoming actions (host only).
   * When the host emits an action, it processes locally instead of writing to DB.
   */
  const setActionHandler = useCallback((handler: ActionHandler) => {
    onActionReceivedRef.current = handler;
  }, []);

  /**
   * Emit a game action.
   * - Host: processes locally via onActionReceivedRef
   * - Guest: inserts into kred_game_actions table
   */
  const emitAction = useCallback(async (actionType: string, payload: any = {}) => {
    if (!lobbyId || !userId) return;

    if (isHost) {
      // Host processes locally — no DB round-trip
      onActionReceivedRef.current?.({ type: actionType, playerId: userId, payload });
      return;
    }

    // Guest: insert action into DB for host to pick up
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
    }
  }, [lobbyId, userId, isHost]);

  // -------------------------------------------------------------------------
  // Typed action methods matching the MultiplayerProps interface in App.tsx
  // -------------------------------------------------------------------------

  const selectDraftTile = useCallback(
    (tileId: string) => emitAction('SELECT_DRAFT_TILE', { tileId }),
    [emitAction]
  );

  const playTile = useCallback(
    (tileId: string, targetPlayerId: number) => emitAction('PLAY_TILE', { tileId, targetPlayerId }),
    [emitAction]
  );

  const movePiece = useCallback(
    (pieceId: string, position: { x: number; y: number }, location: string) =>
      emitAction('MOVE_PIECE', { pieceId, position, location }),
    [emitAction]
  );

  const endTurn = useCallback(() => emitAction('END_TURN'), [emitAction]);

  const acceptTile = useCallback(() => emitAction('RECEIVER_DECISION', { accepted: true }), [emitAction]);
  const rejectTile = useCallback(() => emitAction('RECEIVER_DECISION', { accepted: false }), [emitAction]);
  const viewTilePrivate = useCallback(() => emitAction('VIEW_TILE_PRIVATE'), [emitAction]);

  const initiateChallenge = useCallback(() => emitAction('CHALLENGER_DECISION', { challenge: true }), [emitAction]);
  const passChallenge = useCallback(() => emitAction('CHALLENGER_DECISION', { challenge: false }), [emitAction]);

  const completeBonusMove = useCallback(() => emitAction('COMPLETE_BONUS_MOVE'), [emitAction]);
  const completeCorrection = useCallback(() => emitAction('COMPLETE_CORRECTION'), [emitAction]);

  const selectAdvantageTiles = useCallback(
    (tileIds: string[]) => emitAction('ADVANTAGE_SELECT_TILES', { tileIds }),
    [emitAction]
  );

  const purchaseAdvantage = useCallback(
    (purchase: any) => emitAction('ADVANTAGE_PURCHASE', { purchase }),
    [emitAction]
  );

  const receiverRewardChoice = useCallback(
    (choice: 'credibility' | 'advance') => emitAction('RECEIVER_REWARD', { choice }),
    [emitAction]
  );

  const purchaseBureaucracy = useCallback(
    (purchase: any) => emitAction('BUREAUCRACY_PURCHASE', { purchase }),
    [emitAction]
  );

  const bureaucracyComplete = useCallback(() => emitAction('BUREAUCRACY_COMPLETE'), [emitAction]);

  return {
    // Core
    emitAction,
    setActionHandler,

    // Typed actions (matching MultiplayerProps.multiplayerActions)
    selectDraftTile,
    playTile,
    movePiece,
    endTurn,
    acceptTile,
    rejectTile,
    viewTilePrivate,
    initiateChallenge,
    passChallenge,
    completeBonusMove,
    completeCorrection,
    selectAdvantageTiles,
    purchaseAdvantage,
    receiverRewardChoice,
    purchaseBureaucracy,
    bureaucracyComplete,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSupabaseActions.ts
git commit -m "feat: add useSupabaseActions hook for guest action emission

Host processes actions locally, guests insert into
kred_game_actions table for host to subscribe to."
```

---

## Task 7: GameStateSynchronizer — Dual-Channel Sync Engine

**Files:**
- Create: `src/components/GameStateSynchronizer.tsx`

This is the most complex component. It handles:
- Host: collecting game state, broadcasting to guests, persisting to DB
- Guest: receiving broadcasts, subscribing to DB changes, polling fallback
- Host: listening for guest actions from kred_game_actions table
- Rejoin: hydrating state from DB snapshot

- [ ] **Step 1: Create GameStateSynchronizer**

Create `src/components/GameStateSynchronizer.tsx`:
```typescript
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';

// ============================================================================
// Types
// ============================================================================

export interface GameStatePacket {
  // Core game state
  gameState: string;
  players: any[];
  pieces: any[];
  boardTiles: any[];
  bankedTiles: any[];
  currentPlayerIndex: number;
  playerCount: number;

  // Campaign state
  playedTile: any | null;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: string[];
  tileTransaction: any | null;
  moverPlayerIndex: number | null;
  campaignRole: string | null;
  tileRevealed: boolean;
  pendingReceiverReward: boolean;
  receiverAdvanceInProgress: boolean;

  // Challenge flow
  bystanders: number[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;

  // Take advantage
  showTakeAdvantageModal: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;

  // Bureaucracy
  bureaucracyStates: any;
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;

  // Versioning
  stateVersion: number;
  lastUpdated: number;
}

export interface SyncProps {
  // All the state getters needed to build the packet (host)
  getStatePacket: () => GameStatePacket;

  // All the state setters needed to apply a packet (guest)
  applyStatePacket: (packet: GameStatePacket) => void;

  // Action handler for host to process guest actions
  onActionReceived?: (action: { type: string; playerId: string; payload: any }) => void;

  // Called when rejoin hydration is complete
  onRejoinComplete?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function GameStateSynchronizer({ getStatePacket, applyStatePacket, onActionReceived, onRejoinComplete }: SyncProps) {
  const { lobbyId, isHost, isRejoining } = useLobby();

  const hostVersionRef = useRef(0);
  const lastProcessedVersionRef = useRef(0);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ==========================================================================
  // HOST: Push state to guests
  // ==========================================================================

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

    // Channel 2: DB upsert (persistent, for rejoin)
    supabase
      .from('kred_game_states')
      .upsert({
        lobby_id: lobbyId,
        phase: packet.gameState,
        state_json: packet,
        version: hostVersionRef.current,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Failed to persist game state:', error);
      });
  }, [lobbyId, isHost, getStatePacket]);

  // Debounced push — call this whenever state changes
  const debouncedPush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(pushState, 100);
  }, [pushState]);

  // ==========================================================================
  // HOST: Listen for guest actions
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || !isHost || !onActionReceived) return;

    const channel = supabase
      .channel(`kred_actions:${lobbyId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kred_game_actions', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          const action = payload.new as any;
          onActionReceived({
            type: action.action_type,
            playerId: action.player_id,
            payload: action.payload,
          });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [lobbyId, isHost, onActionReceived]);

  // ==========================================================================
  // BOTH: Set up broadcast channel
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase.channel(`kred_game:${lobbyId}`, {
      config: { broadcast: { self: false } },
    });

    if (!isHost) {
      // GUEST: listen for host broadcasts
      channel.on('broadcast', { event: 'state' }, ({ payload }: { payload: GameStatePacket }) => {
        if (payload.stateVersion <= lastProcessedVersionRef.current) return; // dedup
        lastProcessedVersionRef.current = payload.stateVersion;
        applyStatePacket(payload);
      });
    }

    channel.subscribe();
    broadcastChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
      broadcastChannelRef.current = null;
    };
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // GUEST: Postgres changes subscription (secondary)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

    const channel = supabase
      .channel(`kred_state_changes:${lobbyId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kred_game_states', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          const row = payload.new as any;
          const packet = row.state_json as GameStatePacket;
          if (packet.stateVersion <= lastProcessedVersionRef.current) return; // dedup
          lastProcessedVersionRef.current = packet.stateVersion;
          applyStatePacket(packet);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // GUEST: Polling fallback (3s)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

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

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // REJOIN: Hydrate from DB snapshot
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || !isRejoining) return;

    const hydrate = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .single();

      if (data) {
        const packet = data.state_json as GameStatePacket;
        lastProcessedVersionRef.current = data.version;
        hostVersionRef.current = data.version;
        applyStatePacket(packet);
      }

      onRejoinComplete?.();
    };

    hydrate();
  }, [lobbyId, isRejoining, applyStatePacket, onRejoinComplete]);

  // ==========================================================================
  // Expose debouncedPush for host to call on state changes
  // We store it on window for the host's App component to access
  // ==========================================================================

  useEffect(() => {
    if (isHost) {
      (window as any).__kred_pushState = debouncedPush;
    }
    return () => {
      if (isHost) delete (window as any).__kred_pushState;
    };
  }, [isHost, debouncedPush]);

  // Non-rendering component
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GameStateSynchronizer.tsx
git commit -m "feat: add GameStateSynchronizer for dual-channel state sync

Host pushes via broadcast + DB. Guests receive via broadcast,
postgres_changes, and 3s polling fallback. Version-based
deduplication prevents stale state application."
```

---

## Task 8: Update Entry Point and App.tsx Integration

**Files:**
- Modify: `index.tsx`, `src/App.tsx`

- [ ] **Step 1: Update index.tsx to use LobbyProvider routing**

Replace `index.tsx` with:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LobbyProvider } from './src/contexts/LobbyContext';
import KredApp from './src/KredApp';
import './src/config/i18n';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LobbyProvider>
      <KredApp />
    </LobbyProvider>
  </React.StrictMode>
);
```

- [ ] **Step 2: Create KredApp — the lobby/game router**

Create `src/KredApp.tsx`:
```typescript
import React, { useState, useCallback, useRef } from 'react';
import { useLobby } from './contexts/LobbyContext';
import LobbyScreen from './components/screens/LobbyScreen';
import WaitingRoom from './components/screens/WaitingRoom';
import GameStateSynchronizer, { GameStatePacket } from './components/GameStateSynchronizer';
import { useSupabaseActions } from './hooks/useSupabaseActions';
import App from './App';

export default function KredApp() {
  const { lobbyId, lobbyStatus, isHost, playerIndex, playerCount, lobbyPlayers } = useLobby();
  const actions = useSupabaseActions();

  // Track whether game state has been initialized
  const [gameReady, setGameReady] = useState(false);

  // State packet for GameStateSynchronizer (will be wired in App.tsx integration)
  const getStatePacketRef = useRef<() => GameStatePacket>(() => ({} as GameStatePacket));
  const applyStatePacketRef = useRef<(packet: GameStatePacket) => void>(() => {});

  const handleRejoinComplete = useCallback(() => {
    setGameReady(true);
  }, []);

  // No lobby yet — show lobby screen
  if (!lobbyId) {
    return <LobbyScreen />;
  }

  // Lobby exists but game hasn't started — show waiting room
  if (lobbyStatus === 'WAITING') {
    return <WaitingRoom />;
  }

  // Game is active
  return (
    <>
      <GameStateSynchronizer
        getStatePacket={() => getStatePacketRef.current()}
        applyStatePacket={(packet) => applyStatePacketRef.current(packet)}
        onActionReceived={isHost ? actions.setActionHandler && ((action) => {
          // Host processes guest actions here — will be wired in Task 9
        }) : undefined}
        onRejoinComplete={handleRejoinComplete}
      />
      <App
        isMultiplayer={true}
        isHost={isHost}
        playerIndex={playerIndex ?? 0}
        playerCount={playerCount ?? 3}
        playerNames={lobbyPlayers.map(p => p.name)}
        multiplayerActions={{
          createGame: async () => {},
          joinGame: async () => {},
          startGame: async () => {},
          selectDraftTile: actions.selectDraftTile,
          playTile: actions.playTile,
          movePiece: actions.movePiece,
          endTurn: actions.endTurn,
          acceptTile: actions.acceptTile,
          rejectTile: actions.rejectTile,
          viewTilePrivate: actions.viewTilePrivate,
          initiateChallenge: actions.initiateChallenge,
          passChallenge: actions.passChallenge,
          selectAdvantageTiles: actions.selectAdvantageTiles,
          purchaseAdvantage: actions.purchaseAdvantage,
          receiverRewardChoice: actions.receiverRewardChoice,
          purchaseBureaucracy: actions.purchaseBureaucracy,
          joinAsSpectator: async () => {},
        }}
        getStatePacketRef={getStatePacketRef}
        applyStatePacketRef={applyStatePacketRef}
      />
    </>
  );
}
```

- [ ] **Step 3: Update App.tsx — replace Socket.IO props with Supabase props**

In `src/App.tsx`, replace the `MultiplayerProps` interface (lines 49-99) and the component signature (line 287) with:

Replace the old `MultiplayerProps` interface with:
```typescript
export interface MultiplayerProps {
  isMultiplayer?: boolean;
  isHost?: boolean;
  playerIndex?: number;
  playerCount?: number;
  playerNames?: string[];

  multiplayerActions?: {
    createGame: (playerName: string, playerCount: number) => Promise<any>;
    joinGame: (roomId: string, playerName: string) => Promise<any>;
    startGame: () => Promise<void>;
    selectDraftTile: (tileId: string) => Promise<void>;
    playTile: (tileId: string, targetPlayerId: number) => Promise<void>;
    movePiece: (pieceId: string, position: { x: number; y: number }, location: string) => Promise<void>;
    endTurn: () => Promise<void>;
    acceptTile: () => Promise<void>;
    rejectTile: () => Promise<void>;
    viewTilePrivate: () => Promise<void>;
    initiateChallenge: () => Promise<void>;
    passChallenge: () => Promise<void>;
    selectAdvantageTiles: (tileIds: string[]) => Promise<void>;
    purchaseAdvantage: (purchase: any) => Promise<void>;
    receiverRewardChoice: (choice: 'credibility' | 'advance') => Promise<void>;
    purchaseBureaucracy: (purchase: any) => Promise<void>;
    joinAsSpectator: (roomId: string, name: string) => Promise<void>;
  };

  // Refs for GameStateSynchronizer to wire into
  getStatePacketRef?: React.MutableRefObject<() => any>;
  applyStatePacketRef?: React.MutableRefObject<(packet: any) => void>;
}
```

Replace the component signature (around line 287) from:
```typescript
const App: React.FC<MultiplayerProps> = ({
  socket,
  roomId,
  playerId,
  playerIndex,
  playerCount: multiplayerPlayerCount,
  multiplayerActions,
  initialGameState,
  initialPlayers,
  initialPieces,
  initialCurrentPlayerIndex,
}) => {
```
to:
```typescript
const App: React.FC<MultiplayerProps> = ({
  isMultiplayer = false,
  isHost = false,
  playerIndex,
  playerCount: multiplayerPlayerCount,
  playerNames,
  multiplayerActions,
  getStatePacketRef,
  applyStatePacketRef,
}) => {
```

Remove the `import type { Socket } from 'socket.io-client';` line (line 47).

Remove the `import { useMultiplayerSync } from "./hooks/useMultiplayerSync";` line (around line 210).

Remove the `useMultiplayerSync` call block (lines 505-538) and the `livePlayerIndex`/`campaignRole`/`tileRevealed`/etc state declarations that feed into it (lines 493-504). Replace with:

```typescript
  // ============================================================================
  // MULTIPLAYER STATE
  // ============================================================================
  const [campaignRole, setCampaignRole] = useState<string | null>(null);
  const [tileRevealed, setTileRevealed] = useState<boolean>(false);
  const [pendingReceiverReward, setPendingReceiverReward] = useState<boolean>(false);
  const [receiverAdvanceInProgress, setReceiverAdvanceInProgress] = useState<boolean>(false);
  const [moverPlayerIndex, setMoverPlayerIndex] = useState<number | null>(null);

  // Wire up GameStateSynchronizer refs for host state push
  useEffect(() => {
    if (!getStatePacketRef || !applyStatePacketRef) return;

    getStatePacketRef.current = () => ({
      gameState,
      players,
      pieces,
      boardTiles,
      bankedTiles,
      currentPlayerIndex,
      playerCount,
      playedTile,
      hasPlayedTileThisTurn,
      movedPiecesThisTurn: Array.from(movedPiecesThisTurn),
      tileTransaction,
      moverPlayerIndex,
      campaignRole,
      tileRevealed,
      pendingReceiverReward,
      receiverAdvanceInProgress,
      bystanders,
      bystanderIndex,
      challengeOrder,
      currentChallengerIndex,
      tileRejected,
      showTakeAdvantageModal,
      takeAdvantageChallengerId,
      takeAdvantageChallengerCredibility,
      bureaucracyStates,
      bureaucracyTurnOrder,
      currentBureaucracyPlayerIndex,
      stateVersion: 0,
      lastUpdated: Date.now(),
    });

    applyStatePacketRef.current = (packet) => {
      setGameState(packet.gameState as any);
      setPlayers(packet.players);
      setPieces(packet.pieces);
      setBoardTiles(packet.boardTiles);
      setBankedTiles(packet.bankedTiles);
      setCurrentPlayerIndex(packet.currentPlayerIndex);
      setPlayerCount(packet.playerCount);
      setPlayedTile(packet.playedTile);
      setHasPlayedTileThisTurn(packet.hasPlayedTileThisTurn);
      setMovedPiecesThisTurn(new Set(packet.movedPiecesThisTurn));
      setTileTransaction(packet.tileTransaction);
      setMoverPlayerIndex(packet.moverPlayerIndex);
      setCampaignRole(packet.campaignRole);
      setTileRevealed(packet.tileRevealed);
      setPendingReceiverReward(packet.pendingReceiverReward);
      setReceiverAdvanceInProgress(packet.receiverAdvanceInProgress);
      setBystanders(packet.bystanders);
      setBystanderIndex(packet.bystanderIndex);
      setChallengeOrder(packet.challengeOrder);
      setCurrentChallengerIndex(packet.currentChallengerIndex);
      setTileRejected(packet.tileRejected);
      setShowTakeAdvantageModal(packet.showTakeAdvantageModal);
      setTakeAdvantageChallengerId(packet.takeAdvantageChallengerId);
      setTakeAdvantageChallengerCredibility(packet.takeAdvantageChallengerCredibility);
      setBureaucracyStates(packet.bureaucracyStates);
      setBureaucracyTurnOrder(packet.bureaucracyTurnOrder);
      setCurrentBureaucracyPlayerIndex(packet.currentBureaucracyPlayerIndex);
    };
  });

  // Trigger state push whenever game state changes (host only)
  useEffect(() => {
    if (!isHost || !isMultiplayer) return;
    const push = (window as any).__kred_pushState;
    if (push) push();
  }, [
    isHost, isMultiplayer, gameState, players, pieces, boardTiles, bankedTiles,
    currentPlayerIndex, playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn,
    tileTransaction, moverPlayerIndex, campaignRole, tileRevealed,
    pendingReceiverReward, receiverAdvanceInProgress, bystanders, bystanderIndex,
    challengeOrder, currentChallengerIndex, tileRejected, showTakeAdvantageModal,
    takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex,
  ]);
```

Also remove the `socket.emit('kred:campaign:initPieces', ...)` call around line 549 — pieces are now initialized locally and synced via the state packet.

- [ ] **Step 4: Verify the build compiles**

```bash
npm run build 2>&1 | tail -20
```

Fix any TypeScript errors that arise from the Socket.IO removal. Common fixes:
- Remove any remaining `socket?.emit()` calls — search for `socket` references
- Remove any remaining `import { useSocket }` references
- Replace `isMultiplayer` checks that used `!!socket` with the `isMultiplayer` prop

- [ ] **Step 5: Commit**

```bash
git add index.tsx src/KredApp.tsx src/App.tsx
git commit -m "feat: integrate Supabase into entry point and App.tsx

- LobbyProvider wraps entire app
- KredApp routes between lobby/waiting/game screens
- App.tsx uses Supabase actions instead of Socket.IO
- GameStateSynchronizer wired for state push/receive"
```

---

## Task 9: Host Action Processing

**Files:**
- Modify: `src/KredApp.tsx`

The host needs to process guest actions received from `kred_game_actions`. These actions map to the same handlers App.tsx already has — we just need to route them.

- [ ] **Step 1: Update KredApp.tsx to wire action handler**

Update the `onActionReceived` callback in KredApp.tsx. This maps incoming action types to the multiplayerActions that App.tsx exposes. Since App.tsx already handles these actions internally when called via the UI, and the host runs the same game logic, we need to create a dispatch function.

Replace the `onActionReceived` placeholder in KredApp.tsx with:

```typescript
  // Host action dispatcher — processes guest actions
  const actionDispatchRef = useRef<(action: { type: string; playerId: string; payload: any }) => void>();

  // This ref is set by App.tsx via a callback prop
  const setActionDispatch = useCallback((dispatch: (action: { type: string; playerId: string; payload: any }) => void) => {
    actionDispatchRef.current = dispatch;
  }, []);
```

And update the GameStateSynchronizer `onActionReceived` prop:
```typescript
  onActionReceived={isHost ? (action) => {
    actionDispatchRef.current?.(action);
  } : undefined}
```

Pass `setActionDispatch` to App:
```typescript
  <App
    ...
    setActionDispatch={isHost ? setActionDispatch : undefined}
  />
```

- [ ] **Step 2: In App.tsx, register the action dispatch handler**

Add to the `MultiplayerProps` interface:
```typescript
  setActionDispatch?: (dispatch: (action: { type: string; playerId: string; payload: any }) => void) => void;
```

In the App component body, after all handlers are initialized, add:
```typescript
  // Register action dispatch for host to process guest actions
  useEffect(() => {
    if (!setActionDispatch || !isHost) return;

    setActionDispatch((action) => {
      // Map action types to existing handler calls
      // The host runs the same game logic as if the action happened locally
      switch (action.type) {
        case 'SELECT_DRAFT_TILE':
          // Handle draft tile selection for the guest player
          // Find the player by their userId and process the selection
          break;
        case 'PLAY_TILE':
          // Process tile play from guest
          break;
        case 'MOVE_PIECE':
          // Process piece movement from guest
          break;
        case 'END_TURN':
          // Process turn end from guest
          break;
        case 'RECEIVER_DECISION':
          // Process accept/reject from receiver
          break;
        case 'RECEIVER_REWARD':
          // Process receiver reward choice
          break;
        case 'CHALLENGER_DECISION':
          // Process challenge/pass from challenger
          break;
        case 'COMPLETE_BONUS_MOVE':
          // Process bonus move completion
          break;
        case 'COMPLETE_CORRECTION':
          // Process correction completion
          break;
        case 'ADVANTAGE_SELECT_TILES':
          // Process take advantage tile selection
          break;
        case 'ADVANTAGE_PURCHASE':
          // Process take advantage purchase
          break;
        case 'BUREAUCRACY_PURCHASE':
          // Process bureaucracy purchase
          break;
        case 'BUREAUCRACY_COMPLETE':
          // Process bureaucracy completion
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }
    });
  }, [setActionDispatch, isHost]);
```

**IMPORTANT NOTE:** The exact implementation of each case depends on how App.tsx's existing handlers work. Each case should call the same internal handler functions that the local UI calls. This requires reading App.tsx's handler implementations and mapping them. The skeleton above provides the routing structure — the actual handler calls must be filled in by reading each handler in `src/handlers/` and calling them with the action payload data.

- [ ] **Step 3: Commit**

```bash
git add src/KredApp.tsx src/App.tsx
git commit -m "feat: wire host action dispatch for guest actions

Host receives guest actions from kred_game_actions table
and routes them to existing game handler functions."
```

---

## Task 10: Clean Up Remaining Socket.IO References

**Files:**
- Modify: Various files with socket.io references

- [ ] **Step 1: Search for remaining socket.io references**

```bash
grep -r "socket" src/ --include="*.ts" --include="*.tsx" -l
grep -r "socket.io" src/ --include="*.ts" --include="*.tsx" -l
grep -r "useSocket" src/ --include="*.ts" --include="*.tsx" -l
grep -r "SocketContext" src/ --include="*.ts" --include="*.tsx" -l
grep -r "SocketProvider" src/ --include="*.ts" --include="*.tsx" -l
```

- [ ] **Step 2: Remove all remaining socket.io imports and references**

For each file found in Step 1:
- Remove `import type { Socket }` or `import { Socket }`
- Remove `import { useSocket }` or `import { SocketProvider }`
- Remove any `socket?.emit()` calls
- Remove any `socket?.on()` listeners
- Replace `!!socket` checks with `isMultiplayer` prop

- [ ] **Step 3: Remove socket.io-client from dependencies if not already done**

Verify `socket.io-client` is not in `package.json`:
```bash
grep "socket.io" package.json
```

- [ ] **Step 4: Remove empty MultiplayerLobby.tsx**

```bash
rm src/components/screens/MultiplayerLobby.tsx
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add -u
git commit -m "chore: remove all remaining Socket.IO references

Clean up imports, unused socket props, and empty
MultiplayerLobby.tsx placeholder."
```

---

## Task 11: Verify and Fix Tests

**Files:**
- Modify: Test files as needed

- [ ] **Step 1: Run the test suite**

```bash
npm test -- --run 2>&1 | tail -40
```

- [ ] **Step 2: Fix broken imports in test files**

Tests may fail due to:
- Removed `SocketContext` imports
- Changed `MultiplayerProps` interface
- Removed `useMultiplayerSync` / `useMultiplayerActions` / `useGameSync`

For each failing test file:
- Remove socket.io related imports
- Update component props to match new `MultiplayerProps`
- Mock `LobbyContext` where needed using:

```typescript
vi.mock('../../contexts/LobbyContext', () => ({
  useLobby: () => ({
    lobbyId: null,
    isHost: false,
    playerIndex: 0,
    playerCount: 3,
    lobbyStatus: null,
    lobbyPlayers: [],
  }),
}));
```

- [ ] **Step 3: Re-run tests and verify improvement**

```bash
npm test -- --run 2>&1 | tail -40
```

- [ ] **Step 4: Commit fixes**

```bash
git add -u
git commit -m "fix: update tests for Supabase migration

Fix imports and mocks after removing Socket.IO dependencies."
```

---

## Task 12: Final Build Verification and Deployment Prep

**Files:**
- Verify: All files

- [ ] **Step 1: Clean install and build**

```bash
rm -rf node_modules
npm install
npm run build:all 2>&1 | tail -20
```

- [ ] **Step 2: Verify dist output**

```bash
ls -la dist/
ls -la dist/assets/
```

Confirm `index.html` exists and references correct asset paths.

- [ ] **Step 3: Test local preview**

```bash
npx vite preview --port 4000 &
# Wait for server to start
sleep 3
curl -s http://localhost:4000/ | head -20
```

Verify the HTML loads correctly.

- [ ] **Step 4: Verify .gitignore includes .env.local**

```bash
grep ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 5: Run tests one final time**

```bash
npm test -- --run 2>&1 | tail -20
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final build verification for Netlify deployment

All files compile, build succeeds, tests updated."
```

---

## Post-Implementation Checklist

After all tasks are complete:

1. **Supabase project setup** (manual):
   - Create project at supabase.com
   - Run `supabase/schema.sql` in SQL Editor
   - Enable Realtime on `kred_game_actions` and `kred_players` tables
   - Copy URL and anon key

2. **Local testing**:
   - Create `.env.local` from `.env.local.example` with real Supabase credentials
   - Run `npm run dev`
   - Open 3 browser tabs (1 host + 2 guests)
   - Test: create game → share PIN → join → start → play through drafting

3. **Netlify deployment**:
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build:all`
   - Set publish directory: `dist`
   - Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Deploy
