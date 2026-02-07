# KRED Multiplayer Testing Guide

## Overview

This guide explains how to test the KRED multiplayer implementation both manually and automatically.

## Prerequisites

- MySQL database running
- Node.js installed
- Multiple browser windows or devices for multiplayer testing

## Setup

```bash
# Run the setup script
./setup-multiplayer.sh

# Or manually:
npm install --workspaces
npm run build:shared
mysql -u root -p -e "CREATE DATABASE kred_multiplayer;"
mysql -u root -p kred_multiplayer < packages/server/schema.sql
cp packages/server/.env.example packages/server/.env
# Edit .env with credentials
```

## Manual Testing

### Method 1: Using test-client.html (Recommended for Quick Testing)

1. Start only the server:
```bash
cd packages/server
npm run dev
```

2. Open `test-client.html` in 3-5 browser windows:
```bash
# On Linux
for i in {1..4}; do xdg-open file://$(pwd)/test-client.html & done

# On Mac
for i in {1..4}; do open file://$(pwd)/test-client.html; done

# Or manually open in different browsers
```

3. In window #1:
   - Enter player name: "Player 1"
   - Set player count: 3
   - Click "Create Game"
   - Note the Room ID displayed

4. In windows #2-3:
   - Enter player names: "Player 2", "Player 3"
   - Enter the Room ID from window #1
   - Click "Join Game"

5. In window #1:
   - Click "Start Game"

6. Test actions:
   - Use action buttons to test different game events
   - Watch event log for state updates
   - Verify all windows receive updates

### Method 2: Using Full React Client

1. Start both servers:
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client

# Or use the startup script
./start-dev.sh
```

2. Open http://localhost:5173 in 3-5 browser windows/tabs

3. Navigate through the game flow:
   - Player selection
   - Drafting phase
   - Campaign phase
   - Challenge system
   - Bureaucracy phase

### Method 3: Multi-Device Testing (Same Network)

1. Find your local IP address:
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output: 192.168.1.100
```

2. Start servers:
```bash
./start-dev.sh
```

3. On other devices, open:
   - `http://192.168.1.100:5173` (client)
   - Update `packages/server/.env`: `CLIENT_URL=http://192.168.1.100:5173`

4. Each device plays as a different player

## Test Scenarios

### Scenario 1: Basic Game Flow

**Objective:** Complete a full 3-player game

**Steps:**
1. Create game with 3 players
2. All players join
3. Start game
4. Complete drafting phase (each player selects 6 tiles)
5. Play first campaign round:
   - Player 1 plays tile to Player 2
   - Player 1 moves pieces
   - Player 1 ends turn
   - Player 2 accepts/rejects tile
   - If rejected: Player 1 corrects moves
6. Continue until all tiles played
7. Bureaucracy phase: Each player makes purchases
8. Check for win condition

**Expected Results:**
- All players see same game state
- Turn order is enforced
- Phase transitions work correctly
- Win detection triggers

### Scenario 2: Challenge System

**Objective:** Test challenge flow

**Steps:**
1. Player 1 plays imperfect tile to Player 2
2. Player 2 accepts (credibility > 0)
3. Player 3 initiates challenge
4. Validate tile is imperfect
5. Player 3 wins challenge, gains credibility
6. Player 1 & 2 lose credibility
7. Player 3 offered "Take Advantage"
8. Player 3 selects tiles, makes purchase
9. Player 1 corrects moves

**Expected Results:**
- Challenge validation works correctly
- Credibility updates propagate
- Take Advantage modal appears
- Selected tiles become face-up in bank
- Correction requires valid moves

### Scenario 3: Disconnection & Reconnection

**Objective:** Test session recovery

**Steps:**
1. Start 4-player game
2. Player 2 closes browser during campaign phase
3. Wait 10 seconds
4. Player 2 reopens browser
5. Client auto-rejoins using session token
6. Player 2 sees current game state

**Expected Results:**
- Other players see "Player 2 disconnected" message
- Player 2 successfully reconnects
- Game state fully restored
- Player 2 can continue playing

### Scenario 4: Spectator Mode

**Objective:** Test spectator view

**Steps:**
1. Start 3-player game
2. Progress to campaign phase
3. Open new browser window
4. Join as spectator
5. Spectator sees:
   - Current board state
   - Player credibility
   - Current phase
   - Piece positions
6. Spectator does NOT see:
   - Player hands
   - Face-down tiles in banks

**Expected Results:**
- Spectator receives filtered state
- Real-time updates as game progresses
- Cannot interact with game
- Multiple spectators can join

### Scenario 5: Simultaneous Actions

**Objective:** Test server validation prevents race conditions

**Steps:**
1. Start 3-player game
2. During Player 1's turn:
   - Player 2 tries to play tile (should fail)
   - Player 1 plays tile successfully
3. During acceptance phase:
   - Player 1 tries to accept own tile (should fail)
   - Player 2 accepts tile
4. During challenge phase:
   - Player 2 tries to challenge (should fail - they accepted)
   - Player 3 challenges successfully

**Expected Results:**
- Out-of-turn actions rejected with error
- Only valid player can perform action
- Error messages displayed to user

### Scenario 6: Game Replay

**Objective:** Test replay functionality

**Steps:**
1. Complete a full game
2. GET /api/replay/:roomId
3. Verify response contains:
   - All game actions in sequence
   - Player names
   - Timestamps
4. Use ReplayViewer component (when built):
   - Load replay data
   - Step through actions
   - Verify state reconstructs correctly

**Expected Results:**
- Complete action history recorded
- Actions can be replayed
- State matches original game

## Automated Tests

### Unit Tests

```bash
# Test shared game logic
cd packages/shared
npm test

# Test server logic
cd packages/server
npm test

# Test client hooks/components
cd ../..
npm test
```

### Integration Tests

Create test file: `packages/server/src/__tests__/multiplayer.test.ts`

```typescript
import { io as ioClient } from 'socket.io-client';

describe('Multiplayer Game Flow', () => {
  let clients: any[] = [];
  
  beforeAll(async () => {
    // Start server
    // Create 3 socket.io clients
  });
  
  test('Create and join game', async () => {
    // Client 1 creates game
    // Clients 2-3 join
    // Verify all connected
  });
  
  test('Complete drafting phase', async () => {
    // Each client selects tiles in order
    // Verify phase transitions
  });
  
  test('Challenge flow', async () => {
    // Client 1 plays imperfect tile
    // Client 2 accepts
    // Client 3 challenges
    // Verify credibility updates
  });
});
```

Run tests:
```bash
cd packages/server
npm test
```

### Load Testing

Create load test: `packages/server/src/__tests__/load.test.ts`

```typescript
test('Handle 20 concurrent games', async () => {
  // Create 20 game rooms
  // 4 players each = 80 concurrent connections
  // Simulate full game flow in each
  // Measure: response times, memory usage, CPU
});
```

## Performance Benchmarks

### Target Metrics

- **Connection time:** < 100ms
- **Action response:** < 50ms
- **State update broadcast:** < 100ms
- **Database save:** < 200ms
- **Max concurrent games:** 100+
- **Max concurrent players:** 500+

### Monitoring

```bash
# Watch server logs
npm run dev:server | grep -E "(error|warn|player|game)"

# Monitor database
mysql -u root -p -e "SELECT id, status, player_count, current_phase FROM kred_multiplayer.game_rooms;"

# Check memory usage
top -p $(pgrep -f "node.*server")
```

## Common Issues & Solutions

### Issue: "Cannot connect to server"

**Solution:**
1. Check server is running: `lsof -i :4001`
2. Check firewall allows port 4001
3. Verify CLIENT_URL in .env matches

### Issue: "Room not found" on rejoin

**Solution:**
1. Check session token saved in localStorage
2. Verify database connection
3. Check game_players table has session_token

### Issue: State desync between players

**Solution:**
1. Check all clients receive `game:stateUpdate` events
2. Verify no client-side state mutations
3. Check server logs for errors
4. Clear browser cache and localStorage

### Issue: MySQL connection errors

**Solution:**
1. Verify MySQL is running: `systemctl status mysql`
2. Check credentials in .env
3. Verify database exists: `mysql -e "SHOW DATABASES;"`
4. Check schema imported: `mysql -e "USE kred_multiplayer; SHOW TABLES;"`

## Debugging Tips

### Enable Debug Logging

In `packages/server/src/index.ts`:
```typescript
// Add detailed logging
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
  
  socket.onAny((eventName, ...args) => {
    console.log(`[${socket.id}] ${eventName}:`, args);
  });
});
```

### Browser DevTools

1. Open DevTools → Network → WS (WebSocket)
2. Click socket.io connection
3. View frames to see events in real-time

### Database Inspection

```sql
-- Check active games
SELECT * FROM game_rooms WHERE status = 'in_progress';

-- Check player connections
SELECT r.id, p.name, p.connected, p.last_seen 
FROM game_rooms r 
JOIN game_players p ON r.id = p.room_id;

-- Check game history
SELECT action_type, COUNT(*) as count 
FROM game_history 
GROUP BY action_type 
ORDER BY count DESC;
```

## Next Steps

Once testing is complete:

1. **Fix bugs** found during testing
2. **Optimize** database queries
3. **Add caching** for frequently accessed data
4. **Implement** missing game mechanics
5. **Deploy** to production environment
6. **Monitor** real-world usage

## Reporting Issues

When reporting bugs, include:

1. **Test scenario** that triggered the bug
2. **Expected behavior** vs actual behavior
3. **Browser console** errors
4. **Server logs** from time of error
5. **Database state** if relevant
6. **Steps to reproduce**

Example:
```
Bug: Challenge fails when player has 0 credibility

Steps:
1. Player 1 credibility: 0
2. Player 1 plays imperfect tile
3. Player 2 accepts
4. Player 3 challenges
5. Error: "Cannot read property 'credibility' of undefined"

Expected: Challenge succeeds, Player 1 loses no credibility (already 0)
Actual: Server crashes

Console: [error screenshot]
Logs: [server log excerpt]
```
