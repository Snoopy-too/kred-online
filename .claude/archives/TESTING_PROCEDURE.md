# Lobby → Game Transition - Testing Guide

## ✅ Completed Fixes

### 1. Database Schema
- ✅ Dropped duplicate tables: `kred_game_rooms`, `kred_game_players`, `kred_spectators`
- ✅ Verified `kred_game_state` has correct structure (room_id as PK)
- ✅ Added proper foreign key constraints

### 2. SocketContext Improvements
- ✅ Reads `multiplayerSession` from sessionStorage
- ✅ Includes `playerId` in socket auth
- ✅ Auto-emits `room:rejoin` on connection
- ✅ Auto-requests game state via `kred:request:state`
- ✅ Handles connection/disconnection events
- ✅ Redirects to lobby if no session found

### 3. AppRoot Session Handling
- ✅ Detects multiplayer mode from sessionStorage
- ✅ Wraps with SocketProvider when session exists
- ✅ Falls back to single-player mode otherwise

### 4. Server Handler Fixes
- ✅ Fixed `roomManager` undefined error → created `initializationLocks` Set
- ✅ Fixed null state error in `kred:game:start` → added validation
- ✅ Cleaned up variable naming (state vs initialState)
- ✅ Server restarted successfully

---

## 📋 Manual Testing Procedure

### Test 1: Basic Lobby → Game Flow

**Steps:**
1. Open browser to https://flyingdutchmen.online/lobby
2. Enter name "Player1" and click "Create Room"
3. Copy room code
4. Open second browser (incognito) to /lobby
5. Enter name "Player2", paste code, click "Join Room"
6. Repeat for "Player3" (minimum 3 players)
7. As host, select "KRED" game
8. Click "Start Game"

**Expected Results:**
- ✅ Room created successfully
- ✅ Other players can join
- ✅ Player list updates in real-time
- ✅ Game selection works
- ✅ All players redirect to /KRED/
- ✅ No socket disconnect errors in console
- ✅ Game state loads for all players

**Check Browser Console:**
```
[SOCKET] Multiplayer session loaded: { roomId, playerId, playerIndex }
[SOCKET] Connected: <socket.id>
[SOCKET] Rejoining room: <roomId>
[SOCKET] Requesting game state
[SOCKET] Game state received: { success: true, ... }
```

**Check Server Logs:**
```
[ROOM] Rejoin attempt: { roomId, playerId }
[ROOM] Player <playerId> rejoined room <roomId>
[KRED] State requested for room: <roomId>
[KRED] Socket <socket.id> joined kred:<roomId>
```

### Test 2: Page Refresh (Reconnection)

**Steps:**
1. After game starts, refresh the page (F5)
2. Wait for reconnection

**Expected Results:**
- ✅ Socket reconnects automatically
- ✅ `room:rejoin` emitted automatically  
- ✅ Game state restored
- ✅ Player sees current game phase and tiles

### Test 3: Direct URL Access (No Session)

**Steps:**
1. Open new browser window
2. Navigate directly to https://flyingdutchmen.online/KRED/

**Expected Results:**
- ✅ Redirects to /lobby
- ✅ No errors in console

### Test 4: Disconnect & Reconnect

**Steps:**
1. In game, open DevTools → Network tab
2. Change throttling to "Offline"
3. Wait 2 seconds
4. Change back to "Online"

**Expected Results:**
- ✅ Socket disconnects (connection status shows disconnected)
- ✅ Socket reconnects automatically
- ✅ `room:rejoin` emitted on reconnect
- ✅ Game state re-syncs

---

## 🐛 Debugging Checklist

If game doesn't load after transition:

1. **Check Browser Console:**
   - Look for `[SOCKET]` messages
   - Verify sessionStorage has `multiplayerSession`
   - Check for JavaScript errors

2. **Check Server Logs:**
   ```bash
   pm2 logs fly.on --lines 50
   ```
   - Look for `[ROOM]` and `[KRED]` messages
   - Check for database errors
   - Verify socket joins both rooms

3. **Check Database:**
   ```sql
   -- Verify room exists
   SELECT * FROM game_rooms WHERE id = '<roomId>';
   
   -- Verify players in room
   SELECT * FROM room_players WHERE room_id = '<roomId>';
   
   -- Verify game state
   SELECT * FROM kred_game_state WHERE room_id = '<roomId>';
   ```

4. **Common Issues:**
   - Room code case mismatch (should be lowercase)
   - Session data not saved before redirect
   - Socket not joining `kred:${roomId}` room
   - Game state not initialized (kred:initialize not called)

---

## 🔧 Quick Fixes

### Clear stuck session:
```javascript
// Run in browser console
sessionStorage.removeItem('multiplayerSession');
location.reload();
```

### Check socket rooms (server):
```javascript
// In fly.on.js, add debug endpoint:
app.get('/api/debug/rooms', async (req, res) => {
  const sockets = await io.fetchSockets();
  res.json(sockets.map(s => ({
    id: s.id,
    rooms: Array.from(s.rooms)
  })));
});
```

### Reset database for testing:
```sql
DELETE FROM kred_game_state;
DELETE FROM kred_game_history;
DELETE FROM room_players;
DELETE FROM game_rooms;
```

---

## ✨ Success Criteria

The transition is working correctly when:

1. ✅ Players can create and join rooms in lobby
2. ✅ Host can select game and start
3. ✅ All players redirect to /KRED/ simultaneously
4. ✅ Sockets remain connected (same or reconnect immediately)
5. ✅ Game state loads for all players
6. ✅ Players can see each other's actions in real-time
7. ✅ Page refresh doesn't break the game
8. ✅ No errors in browser console or server logs

---

## 📝 Next Steps After Testing

Once manual tests pass:

1. Write automated integration tests
2. Test with 4 and 5 players
3. Test tile selection and game progression
4. Implement reconnection grace period
5. Add spectator mode
6. Deploy to production

---

**Ready to Test!** Please run through Test 1 and report results.
