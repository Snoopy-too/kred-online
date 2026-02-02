# Tile Selection Test Procedure

## Expected Flow

### Initial State
- All 3 players start with 8 tiles in `hand`
- `keptTiles` = []
- `pendingTiles` = []

### After Player 0 Selects Tile ID 10
**Player 0:**
- `hand` = [] (empty until receives from Player 2)
- `keptTiles` = [tile 10]
- `pendingTiles` = [7 tiles from Player 2] (waiting)

**Player 1:**
- `hand` = [original 8 tiles]
- `keptTiles` = []
- `pendingTiles` = [7 tiles from Player 0]

**Player 2:**
- `hand` = [original 8 tiles]
- `keptTiles` = []
- `pendingTiles` = []

### After Player 1 Selects
**Player 1:**
- `hand` = [] (empty until receives from Player 0)
- `keptTiles` = [tile X]
- `pendingTiles` = [7 tiles from Player 0] (now has 2 packets)

**Player 2:**
- `pendingTiles` = [7 tiles from Player 1]

### After Player 2 Selects
**All players now have:**
- `hand` = [] (empty)
- `keptTiles` = [1 tile each]
- `pendingTiles` = [1 packet each]

### After Player 0 Selects Again
**Player 0:**
- Receives tiles from `pendingTiles[0]` → `hand` = [7 tiles from Player 2]
- Can now select again

## Debug Checklist

1. ✅ Is `playerIndex` being sent from client?
   - Check: `[MULTIPLAYER ACTIONS] Selecting tile:` log should show playerIndex

2. ✅ Is server receiving correct playerIndex?
   - Check: `[KRED] Tile selection: room=XXX, player=N, tile=XX`

3. ✅ Is server updating player state?
   - Check: `[KRED] Player N kept tile XX. Remaining: 7, Kept: 1`

4. ✅ Is server saving to database?
   - Check database: `keptTiles` should not be empty

5. ✅ Is server broadcasting?
   - Check: `[KRED] 📤 Broadcasting state update`
   - Check: `[KRED] 📦 Players being broadcast` should show keptSize: 1

6. ✅ Are clients receiving broadcast?
   - Check: `[MULTIPLAYER] 📥 Received state update`
   - Check: `[MULTIPLAYER] 👥 Player hands` should show keptSize

## Test Commands

### Check Database
```bash
mysql -u josh -p'O2.Pu1(Chi3)' KRED -e "
SELECT 
  room_id,
  JSON_EXTRACT(game_state, '$.players[0].name') as p0_name,
  JSON_LENGTH(game_state, '$.players[0].hand') as p0_hand,
  JSON_LENGTH(game_state, '$.players[0].keptTiles') as p0_kept,
  JSON_LENGTH(game_state, '$.players[1].keptTiles') as p1_kept,
  JSON_LENGTH(game_state, '$.players[2].keptTiles') as p2_kept
FROM kred_game_state 
ORDER BY room_id DESC LIMIT 1;
"
```

### Watch Server Logs Live
```bash
pm2 logs fly.on --lines 0
```

### Clear Database for Fresh Test
```bash
mysql -u josh -p'O2.Pu1(Chi3)' KRED -e "DELETE FROM kred_game_state; DELETE FROM room_players; DELETE FROM game_rooms;"
```
