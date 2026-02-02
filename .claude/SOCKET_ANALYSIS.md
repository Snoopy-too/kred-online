# Socket.IO Architecture Analysis

**Date:** Feb 2, 2026  
**Scope:** Lobby → KRED Game Transition  
**Status:** Critical Issues Identified

---

## Current Flow Analysis

### 1. Lobby Phase (`lobby.html`)

**What Works:**
```
1. User accesses /lobby
2. Socket connects: socket = io()
3. User creates/joins room
4. Session stored: { roomId, playerId, playerIndex }
5. Socket joins: room:${roomId}
6. Host selects KRED game
7. Server adds sockets to: kred:${roomId}
8. kred:initialize creates game state
9. kred:game:start triggers redirect
10. window.location.href = '/KRED/'
```

**Lobby Socket Events:**
- ✅ room:create
- ✅ room:join  
- ✅ room:rejoin
- ✅ room:select:game
- ✅ room:player:joined
- ✅ kred:initialize
- ✅ kred:game:start

### 2. KRED React App (`AppRoot.tsx` → `SocketContext.tsx`)

**What Happens:**
```
1. Browser navigates to /KRED/
2. NEW socket created: io()
3. NO session data read from sessionStorage
4. NO room:rejoin emitted
5. Socket NOT in room:${roomId} or kred:${roomId}
6. Game state NOT loaded
```

**Current SocketContext:**
```tsx
const socket = io(); // No auth, no playerId, no reconnection logic
```

---

## Critical Issues Identified

### Issue #1: Socket Disconnect on Navigation

**Problem:** Page navigation causes browser to disconnect the lobby socket and create a new socket in React app.

**Impact:** New socket is NOT in any rooms, has no player identity, and receives no game events.

**Evidence:**
- lobby.html: `socket = io()` (Socket A)
- Navigate to /KRED/
- SocketContext.tsx: `socket = io()` (Socket B - different instance)

### Issue #2: No Session Recovery

**Problem:** React app doesn't read sessionStorage or attempt to rejoin rooms.

**Impact:** Even if socket reconnects, it doesn't know which room to join.

**Current State:**
```tsx
// SocketContext.tsx - NO session handling
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);
  // Missing: Read sessionStorage
  // Missing: Emit room:rejoin
  // Missing: Request game state
```

### Issue #3: Missing playerId in Socket Auth

**Problem:** Server can't identify player without playerId in socket auth.

**Impact:** Server handlers can't map socket to player in database.

**Lobby Does:**
```javascript
const playerId = sessionStorage.getItem('playerId');
const socket = io({ auth: { playerId } });
```

**React App Does:**
```typescript
const socket = io(); // NO auth!
```

### Issue #4: Database Schema Mismatch

**Problem:** Two different database schemas exist:

**Generic Tables (fly.on.js):**
- `game_rooms` (id, status, selected_game, host_player_id)
- `room_players` (room_id, player_id, player_name, player_index)

**KRED Tables (old schema):**
- `kred_game_rooms` (separate room IDs!)
- `kred_game_players` (separate player tracking!)
- `kred_game_state` (room_id, player_id, game_state) ← Wrong PK!

**Impact:** KRED handlers query wrong tables or miss data.

**Evidence:**
```javascript
// fly.on.js creates room in:
INSERT INTO game_rooms (id, status, ...) 

// KRED handlers query from:
SELECT * FROM kred_game_state WHERE room_id = ? 
// But kred_game_state has PK (room_id, player_id) - should be just room_id!
```

### Issue #5: State Storage Inconsistency

**Problem:** `kred_game_state` table has wrong primary key.

**Current Schema:**
```sql
PRIMARY KEY (room_id, player_id)  -- WRONG: One state per player?
```

**Should Be:**
```sql
PRIMARY KEY (room_id)  -- ONE game state per room
```

**Impact:** Multiple partial states, no single source of truth.

---

## Database Schema Issues

### Problem: Old KRED Tables Still Referenced

**Tables that should NOT exist:**
- `kred_game_rooms` - Duplicate of `game_rooms`
- `kred_game_players` - Duplicate of `room_players`

**Tables that SHOULD exist:**
- `kred_game_state` (fixed PK)
- `kred_game_history` (action log)

### Recommended Schema Fix:

```sql
-- Drop duplicate tables
DROP TABLE IF EXISTS kred_game_rooms;
DROP TABLE IF EXISTS kred_game_players;
DROP TABLE IF EXISTS kred_spectators;

-- Fix kred_game_state primary key
ALTER TABLE kred_game_state DROP PRIMARY KEY;
ALTER TABLE kred_game_state ADD PRIMARY KEY (room_id);
ALTER TABLE kred_game_state DROP COLUMN player_id;

-- Ensure proper foreign key
ALTER TABLE kred_game_state 
  ADD CONSTRAINT fk_kred_state_room 
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE;
```

---

## Socket Room Management Issues

### Problem: Room Membership Not Persisted

When socket disconnects and reconnects, it doesn't know which rooms to rejoin.

**Current Server Logic:**
```javascript
socket.on('room:rejoin', async (data) => {
  const { roomId, playerId } = data;
  socket.join(`room:${roomId}`);
  
  // Check if game selected
  if (rooms[0].selected_game) {
    const game = rooms[0].selected_game.toLowerCase();
    socket.join(`${game}:${roomId}`);
  }
});
```

**Good:** Server can add socket to both rooms.  
**Problem:** Client never calls this from React app!

---

## Required Fixes - Priority Order

### 1. Fix Database Schema (5 min)
- Drop duplicate KRED tables
- Fix `kred_game_state` primary key
- Verify all handlers use `game_rooms` and `room_players`

### 2. Update SocketContext (15 min)
- Read sessionStorage on mount
- Add playerId to socket auth
- Auto-emit room:rejoin
- Handle connection/disconnection
- Request current game state

### 3. Update AppRoot (10 min)
- Detect multiplayer mode from sessionStorage
- Pass session data to socket context
- Handle missing session (redirect to lobby)

### 4. Update Server Handlers (10 min)
- Add kred:request:state handler
- Return full game state including:
  - players array
  - phase
  - pieces
  - current player
  - all tile states

### 5. Test Transition Flow (30 min)
- Create room → join → select game → start
- Verify socket persistence
- Verify state synchronization
- Test disconnect/reconnect
- Test page refresh

---

## Questions for User

1. **Database:** Can I drop the old `kred_game_rooms`, `kred_game_players`, `kred_spectators` tables? They appear to be unused duplicates.

2. **Session Storage:** Should the React app redirect back to /lobby if no multiplayer session exists?

3. **Socket Persistence:** Would you prefer:
   - Option A: Keep socket alive during navigation (same domain, should work)
   - Option B: New socket but immediate rejoin (cleaner, more reliable)

4. **Game State:** Should `kred:request:state` be called automatically on React app mount, or only when needed?

5. **Error Handling:** If room doesn't exist or player not found during rejoin, redirect to lobby or show error?

---

## Next Steps

Once you answer the questions above, I'll:

1. Execute database schema fixes
2. Implement SocketContext improvements  
3. Update AppRoot session handling
4. Add server-side state request handler
5. Write integration tests
6. Test full flow end-to-end

This analysis is now documented in `.claude/SOCKET_ANALYSIS.md` for reference.
