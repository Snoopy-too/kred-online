# Database Design & Management Skill

## Overview
Patterns for designing and managing MySQL databases for multiplayer games, using a two-tier approach with generic lobby tables and game-specific state tables.

---

## Two-Tier Database Architecture

### Generic Tables (Shared Across All Games)

**Purpose:** Lobby, room management, player roster

```sql
-- game_rooms: Room metadata and status
CREATE TABLE game_rooms (
  id VARCHAR(12) PRIMARY KEY,
  host_player_id VARCHAR(16) NOT NULL,
  selected_game VARCHAR(50),
  status ENUM('waiting', 'playing', 'completed') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- room_players: Player roster for all rooms
CREATE TABLE room_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  player_id VARCHAR(16) NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  player_index INT NOT NULL,
  is_host TINYINT(1) DEFAULT 0,
  connected TINYINT(1) DEFAULT 1,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id),
  INDEX idx_player_id (player_id)
);
```

**When to use:**
- Creating/joining rooms
- Managing player list
- Checking game selection
- Tracking connection status

### Game-Specific Tables

**Purpose:** Game state, history, player actions

```sql
-- kred_game_state: Current game state as JSON
CREATE TABLE kred_game_state (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) UNIQUE NOT NULL,
  game_state JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id)
);

-- kred_game_history: Action log for replay/debugging
CREATE TABLE kred_game_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  player_id VARCHAR(16),
  action_data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id),
  INDEX idx_timestamp (timestamp)
);
```

**When to use:**
- Storing complex game state (players, pieces, tiles, etc.)
- Logging game actions for replay
- Debugging game flow
- Persistent state across server restarts

---

## JSON vs Normalized Tables

### Use JSON For:

**Complex, nested state that changes frequently:**

```javascript
// Game state example
{
  "players": [
    {
      "id": 1,
      "name": "Alice",
      "hand": [{"id": 5, "url": "..."}, {"id": 12, "url": "..."}],
      "keptTiles": [...],
      "credibility": 3,
      "bureaucracyTiles": [...],
      "playedTile": null
    }
  ],
  "pieces": [
    {"id": "P1_1", "type": "PAWN", "position": "A1", "playerId": 1},
    {"id": "P1_2", "type": "KNIGHT", "position": "B2", "playerId": 1}
  ],
  "boardTiles": [...],
  "phase": "CAMPAIGN",
  "currentPlayerIndex": 0,
  "playerCount": 3
}
```

**Advantages:**
- ✅ Easy to serialize entire game state
- ✅ Flexible schema (can add fields without migration)
- ✅ Atomic updates (one query updates everything)
- ✅ Perfect for real-time games with complex state

**Pattern:**
```javascript
// SERVER - Update entire game state
await db.query(
  `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
  [JSON.stringify(state), roomId]
);

// SERVER - Retrieve and parse
const [rows] = await db.query(
  `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
  [roomId]
);
const state = JSON.parse(rows[0].game_state);
```

### Use Normalized Tables For:

**Simple, searchable data that's queried frequently:**

```sql
-- Good: Player roster (needs filtering, joining)
SELECT player_name, player_index 
FROM room_players 
WHERE room_id = ? AND connected = 1
ORDER BY player_index;

-- Good: Action history (needs time-based queries)
SELECT action_type, player_id, timestamp
FROM kred_game_history
WHERE room_id = ? AND timestamp > ?
ORDER BY timestamp DESC
LIMIT 10;
```

**Advantages:**
- ✅ Efficient queries and indexes
- ✅ Can filter, join, aggregate
- ✅ Better for analytics
- ✅ Database constraints enforce integrity

---

## Schema Validation Before Queries

### Critical Rule: Always Verify Schema First

**Problem:** Querying non-existent columns causes crashes

```javascript
// ❌ WRONG - Assumes socket_id column exists
const [players] = await db.query(
  `SELECT socket_id FROM room_players WHERE room_id = ?`,
  [roomId]
);
// ERROR: Unknown column 'socket_id' in 'SELECT'
```

**Solution:** Check schema before writing queries

```bash
# Check what columns actually exist
sudo mysql -u root -e "USE KRED; DESCRIBE room_players;"

# Output shows actual columns:
# id, room_id, player_id, player_name, player_index, is_host, connected, joined_at
```

**Correct query:**
```javascript
// ✅ CORRECT - Only query existing columns
const [players] = await db.query(
  `SELECT player_id, player_name, player_index 
   FROM room_players 
   WHERE room_id = ? AND connected = 1`,
  [roomId]
);
```

### Common Schema Mistakes

```javascript
// ❌ Querying columns that don't exist
SELECT socket_id FROM room_players     // No socket_id column
SELECT session_id FROM game_rooms      // No session_id column
SELECT game_data FROM kred_game_state  // Column is game_state, not game_data

// ✅ Query actual columns
SELECT player_id FROM room_players
SELECT selected_game FROM game_rooms
SELECT game_state FROM kred_game_state
```

---

## Race Condition Prevention

### Initialization Locks

**Problem:** Multiple clients might initialize same game simultaneously

```javascript
// ❌ WRONG - No protection against duplicate initialization
socket.on('kred:initialize', async (data, callback) => {
  const { roomId } = data;
  
  // Check if exists
  const [existing] = await db.query(
    `SELECT * FROM kred_game_state WHERE room_id = ?`,
    [roomId]
  );
  
  if (existing.length === 0) {
    // Race condition! Two clients might both reach here
    await db.query(
      `INSERT INTO kred_game_state (room_id, game_state) VALUES (?, ?)`,
      [roomId, JSON.stringify(initialState)]
    );
  }
});
```

**Solution:** Use in-memory locks

```javascript
// ✅ CORRECT - Lock prevents duplicate initialization
const initializationLocks = new Set();

socket.on('kred:initialize', async (data, callback) => {
  const { roomId } = data;
  
  // Check lock first
  if (initializationLocks.has(roomId)) {
    console.log(`[KRED] Initialization already in progress for ${roomId}`);
    return callback({ success: false, error: 'Initialization in progress' });
  }
  
  // Acquire lock
  initializationLocks.add(roomId);
  
  try {
    // Check database
    const [existing] = await db.query(
      `SELECT * FROM kred_game_state WHERE room_id = ?`,
      [roomId]
    );
    
    if (existing.length === 0) {
      // Safe to initialize - we have the lock
      await db.query(
        `INSERT INTO kred_game_state (room_id, game_state) VALUES (?, ?)`,
        [roomId, JSON.stringify(initialState)]
      );
      console.log(`[KRED] Initialized game state for ${roomId}`);
    }
    
    callback({ success: true });
  } finally {
    // Always release lock
    initializationLocks.delete(roomId);
  }
});
```

### Database Constraints

**Use UNIQUE constraints to prevent duplicates:**

```sql
CREATE TABLE kred_game_state (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) UNIQUE NOT NULL,  -- UNIQUE prevents duplicates
  game_state JSON NOT NULL,
  -- ...
);
```

**Use transactions for atomic operations:**

```javascript
// Update multiple tables atomically
const connection = await db.getConnection();
await connection.beginTransaction();

try {
  // Update room status
  await connection.query(
    `UPDATE game_rooms SET status = 'playing' WHERE id = ?`,
    [roomId]
  );
  
  // Update game state
  await connection.query(
    `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
    [JSON.stringify(state), roomId]
  );
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

---

## Query Patterns

### Reading Game State

```javascript
// Get current game state
const [gameState] = await db.query(
  `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
  [roomId]
);

if (gameState.length === 0) {
  return callback({ success: false, error: 'Game not found' });
}

const state = JSON.parse(gameState[0].game_state);
```

### Updating Game State

```javascript
// Update entire state (most common)
await db.query(
  `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
  [JSON.stringify(state), roomId]
);

// Or use INSERT ... ON DUPLICATE KEY UPDATE
await db.query(
  `INSERT INTO kred_game_state (room_id, game_state) 
   VALUES (?, ?) 
   ON DUPLICATE KEY UPDATE game_state = VALUES(game_state)`,
  [roomId, JSON.stringify(state)]
);
```

### Logging Actions

```javascript
// Log action to history table
await db.query(
  `INSERT INTO kred_game_history 
   (room_id, action_type, player_id, action_data) 
   VALUES (?, ?, ?, ?)`,
  [roomId, 'TILE_PLAYED', playerId, JSON.stringify({ tileId, receiverId })]
);
```

### Getting Player List

```javascript
// Get all players in room
const [players] = await db.query(
  `SELECT player_id, player_name, player_index, is_host, connected
   FROM room_players 
   WHERE room_id = ?
   ORDER BY player_index`,
  [roomId]
);

// Get only connected players
const [connectedPlayers] = await db.query(
  `SELECT player_id, player_name, player_index
   FROM room_players 
   WHERE room_id = ? AND connected = 1
   ORDER BY player_index`,
  [roomId]
);

// Count players
const [count] = await db.query(
  `SELECT COUNT(*) as player_count 
   FROM room_players 
   WHERE room_id = ?`,
  [roomId]
);
const playerCount = count[0].player_count;
```

### Room Management

```javascript
// Update room status
await db.query(
  `UPDATE game_rooms SET status = ? WHERE id = ?`,
  ['playing', roomId]
);

// Check if room exists and get details
const [room] = await db.query(
  `SELECT id, host_player_id, selected_game, status 
   FROM game_rooms 
   WHERE id = ?`,
  [roomId]
);

if (room.length === 0) {
  return callback({ success: false, error: 'Room not found' });
}
```

---

## Connection Status Tracking

### On Player Join

```javascript
socket.on('room:join', async (data, callback) => {
  const { roomId, playerName } = data;
  const playerId = generatePlayerId();
  
  // Check if player was previously in this room (rejoin)
  const [existing] = await db.query(
    `SELECT player_index FROM room_players 
     WHERE room_id = ? AND player_id = ?`,
    [roomId, playerId]
  );
  
  if (existing.length > 0) {
    // Rejoin - update connected status
    await db.query(
      `UPDATE room_players SET connected = 1 WHERE player_id = ?`,
      [playerId]
    );
  } else {
    // New join - insert player
    const [players] = await db.query(
      `SELECT COUNT(*) as count FROM room_players WHERE room_id = ?`,
      [roomId]
    );
    const playerIndex = players[0].count;
    
    await db.query(
      `INSERT INTO room_players 
       (room_id, player_id, player_name, player_index, is_host, connected) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [roomId, playerId, playerName, playerIndex, playerIndex === 0]
    );
  }
});
```

### On Player Disconnect

```javascript
socket.on('disconnect', async () => {
  const { roomId, playerId } = socket;
  
  if (roomId && playerId) {
    // Mark as disconnected (don't delete - they might rejoin)
    await db.query(
      `UPDATE room_players SET connected = 0 WHERE player_id = ?`,
      [playerId]
    );
    
    console.log(`[ROOM] Player ${playerId} disconnected from ${roomId}`);
  }
});
```

---

## Database Migration Patterns

### Adding New Tables

```sql
-- Check if table exists before creating
CREATE TABLE IF NOT EXISTS kred_game_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(12) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  player_id VARCHAR(16),
  action_data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
);
```

### Adding New Columns

```sql
-- Add column only if it doesn't exist
ALTER TABLE room_players 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Or check first
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'room_players' 
  AND COLUMN_NAME = 'last_seen';
```

### Updating Existing Data

```sql
-- Update in batches for large tables
UPDATE kred_game_state 
SET game_state = JSON_SET(game_state, '$.version', '2.0')
WHERE JSON_EXTRACT(game_state, '$.version') IS NULL
LIMIT 1000;
```

---

## Indexing Strategy

### Critical Indexes

```sql
-- room_id is queried constantly
CREATE INDEX idx_room_id ON room_players(room_id);
CREATE INDEX idx_room_id ON kred_game_state(room_id);
CREATE INDEX idx_room_id ON kred_game_history(room_id);

-- player_id for lookups
CREATE INDEX idx_player_id ON room_players(player_id);

-- Timestamp for history queries
CREATE INDEX idx_timestamp ON kred_game_history(timestamp);

-- Composite indexes for common queries
CREATE INDEX idx_room_connected ON room_players(room_id, connected);
```

### Check Index Usage

```sql
-- See query execution plan
EXPLAIN SELECT * FROM room_players WHERE room_id = 'abc123';

-- Should show:
-- type: ref (good)
-- key: idx_room_id (using index)
-- rows: small number

-- Bad signs:
-- type: ALL (full table scan)
-- key: NULL (no index used)
-- rows: large number
```

---

## Backup & Recovery

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="KRED"

# Dump database
sudo mysqldump -u root ${DB_NAME} > ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# Compress
gzip ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# Keep only last 7 days
find ${BACKUP_DIR} -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "Backup complete: ${DB_NAME}_${DATE}.sql.gz"
```

### Point-in-Time Recovery

```bash
# Restore from specific backup
gunzip /var/backups/mysql/KRED_20260204_120000.sql.gz
sudo mysql -u root KRED < /var/backups/mysql/KRED_20260204_120000.sql
```

### Exporting Game State

```javascript
// Export all active games
socket.on('admin:export:games', async (data, callback) => {
  const [games] = await db.query(`
    SELECT 
      r.id as room_id,
      r.selected_game,
      r.status,
      k.game_state,
      k.updated_at
    FROM game_rooms r
    LEFT JOIN kred_game_state k ON r.id = k.room_id
    WHERE r.status = 'playing'
  `);
  
  callback({ success: true, games });
});
```

---

## Debugging Database Issues

### Check Connection

```javascript
// Test database connection
const testConnection = async () => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('[DB] Connection OK:', rows[0].result);
  } catch (error) {
    console.error('[DB] Connection failed:', error);
  }
};
```

### Inspect Current State

```sql
-- See all active rooms
SELECT r.id, r.selected_game, r.status, COUNT(p.id) as player_count
FROM game_rooms r
LEFT JOIN room_players p ON r.id = p.room_id
GROUP BY r.id
ORDER BY r.created_at DESC;

-- See players in specific room
SELECT player_id, player_name, player_index, is_host, connected
FROM room_players
WHERE room_id = 'abc123'
ORDER BY player_index;

-- Check game state exists
SELECT room_id, 
       JSON_EXTRACT(game_state, '$.phase') as phase,
       JSON_EXTRACT(game_state, '$.playerCount') as player_count,
       updated_at
FROM kred_game_state
WHERE room_id = 'abc123';
```

### Common Issues

**Issue: "Unknown column" error**
```bash
# Solution: Check actual schema
sudo mysql -u root -e "DESCRIBE KRED.table_name;"
```

**Issue: "Duplicate entry" error**
```sql
-- Solution: Check for existing records first
SELECT * FROM kred_game_state WHERE room_id = 'abc123';

-- Or use INSERT ... ON DUPLICATE KEY UPDATE
```

**Issue: Game state not updating**
```javascript
// Solution: Verify JSON is valid and query succeeds
console.log('Saving state:', JSON.stringify(state));
const result = await db.query(
  `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
  [JSON.stringify(state), roomId]
);
console.log('Rows affected:', result[0].affectedRows);
```

---

## Performance Best Practices

### Avoid N+1 Queries

```javascript
// ❌ BAD - Query in loop
for (const playerId of playerIds) {
  const [player] = await db.query(
    `SELECT * FROM room_players WHERE player_id = ?`,
    [playerId]
  );
}

// ✅ GOOD - Single query with IN clause
const [players] = await db.query(
  `SELECT * FROM room_players WHERE player_id IN (?)`,
  [playerIds]
);
```

### Use Connection Pooling

```javascript
// Configure connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'KRED',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Cache Frequently Accessed Data

```javascript
// Cache player counts instead of querying each time
const playerCountCache = new Map();

const getPlayerCount = async (roomId) => {
  if (playerCountCache.has(roomId)) {
    return playerCountCache.get(roomId);
  }
  
  const [count] = await db.query(
    `SELECT COUNT(*) as count FROM room_players WHERE room_id = ?`,
    [roomId]
  );
  
  const playerCount = count[0].count;
  playerCountCache.set(roomId, playerCount);
  
  return playerCount;
};

// Invalidate cache when player joins/leaves
socket.on('room:join', async (data) => {
  // ... insert player ...
  playerCountCache.delete(roomId);  // Clear cache
});
```

---

## Quick Reference

**Generic Tables:**
- `game_rooms` - Room metadata (id, host, selected_game, status)
- `room_players` - Player roster (room_id, player_id, player_name, player_index, connected)

**Game Tables:**
- `kred_game_state` - Current state as JSON (room_id, game_state)
- `kred_game_history` - Action log (room_id, action_type, player_id, action_data)

**JSON vs Normalized:**
- JSON: Complex nested state, flexible schema, atomic updates
- Normalized: Searchable data, efficient queries, database constraints

**Critical Patterns:**
- Always check schema before queries
- Use initialization locks to prevent race conditions
- Mark disconnected players (don't delete)
- Use indexes on frequently queried columns
- Backup database regularly

**Common Queries:**
```javascript
// Get state
SELECT game_state FROM kred_game_state WHERE room_id = ?

// Update state
UPDATE kred_game_state SET game_state = ? WHERE room_id = ?

// Get players
SELECT * FROM room_players WHERE room_id = ? ORDER BY player_index

// Count players
SELECT COUNT(*) as count FROM room_players WHERE room_id = ?

// Update connection
UPDATE room_players SET connected = ? WHERE player_id = ?
```
