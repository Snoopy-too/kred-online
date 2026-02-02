# Multiplayer Architecture

## Overview

The multiplayer system uses a **game-agnostic room architecture** where players join a generic room first, select a game together, and then the selected game's handlers activate.

## Flow

1. **Create/Join Room** → Generic room system (top-level in fly.on.js)
2. **Select Game** → Host chooses which game to play (KRED, TFD, future games)
3. **Initialize Game** → Game-specific handlers activate and initialize state
4. **Play Game** → Game-specific socket events handle gameplay
5. **Complete Game** → Return to lobby or end session

## Database Structure

### Generic Room Tables (All Games)
```sql
game_rooms
- id (VARCHAR 12) - Room code
- status (ENUM: lobby, playing, completed)
- selected_game (VARCHAR 50) - NULL until game selected
- host_player_id (VARCHAR 16)
- created_at, updated_at

room_players
- id (INT AUTO_INCREMENT)
- room_id (VARCHAR 12)
- player_id (VARCHAR 16)
- player_name (VARCHAR 100)
- player_index (INT)
- is_host (BOOLEAN)
- connected (BOOLEAN)
- joined_at
```

### Game-Specific Tables (KRED Example)
```sql
kred_game_state
- room_id (VARCHAR 12) - Links to game_rooms
- game_state (JSON) - Full game state
- created_at, updated_at

kred_game_history
- room_id (VARCHAR 12)
- sequence (INT)
- action_type (VARCHAR 50)
- action_data (JSON)
- created_at
```

## Socket Event Structure

### Generic Room Events (fly.on.js)
- `room:create` → Create new room, returns roomId
- `room:join` → Join existing room by code
- `room:player:joined` → Broadcast when new player joins
- `room:select:game` → Host selects which game to play
- `room:game:selected` → Broadcast selected game to all players

### Game-Specific Events (Game Modules)

Each game module exports a `setupHandlers(io, socket, db)` function registered in fly.on.js:

**KRED Events** (_KRED/server/socketHandlers.js)
- `kred:initialize` → Create initial game state for room
- `kred:game:start` → Begin game (transition from lobby to gameplay)
- `kred:action` → Player performs action (tile play, piece movement)
- `kred:state:update` → Broadcast updated game state
- `kred:game:started` → Broadcast when game begins

**TFD Events** (Already implemented in fly.on.js - can be extracted to module)
- `join` → Join TFD game table
- `setWaitingTiles` → Set player tiles
- `getWaitingTiles` → Get player tiles
- etc.

## Code Organization

```
fly.on.js
├── Generic room handlers (room:create, room:join, room:select:game)
├── require('./_KRED/server/socketHandlers')
├── require('./TFD/server/socketHandlers')  [future]
└── setupKREDHandlers(io, socket, db)
    setupTFDHandlers(io, socket, db)

_KRED/server/socketHandlers.js
└── module.exports = function(io, socket, db) {
      socket.on('kred:initialize', ...)
      socket.on('kred:action', ...)
      socket.on('kred:game:start', ...)
    }

_KRED/src/components/screens/MultiplayerLobby.tsx
├── Uses room:* events for creating/joining rooms
├── Shows game selection UI when host
├── Emits kred:initialize when KRED is selected
└── Switches to game UI when kred:game:started fires
```

## Socket Rooms

- Generic lobby: `room:${roomId}` - All players in a room
- Game-specific: `kred:${roomId}` - KRED game instance
  - Players join game-specific room when game is selected
  - Allows game events to only go to players in that game

## Adding New Games

To add a new game (e.g., Chess):

1. **Create database tables**
```sql
chess_game_state (room_id, board_state, current_player, ...)
chess_game_moves (room_id, move_number, move_data, ...)
```

2. **Create handler module** `Chess/server/socketHandlers.js`
```javascript
module.exports = function(io, socket, db) {
  socket.on('chess:initialize', async (data, callback) => {
    // Create initial chess board state
  });
  
  socket.on('chess:move', async (data) => {
    // Validate and execute move
    // Broadcast new state
  });
};
```

3. **Register in fly.on.js**
```javascript
const setupChessHandlers = require('./Chess/server/socketHandlers');
io.on('connection', (socket) => {
  setupChessHandlers(io, socket, db);
  // Other handlers...
});
```

4. **Update game selection UI**
```tsx
<button onClick={() => selectGame('Chess')}>Chess</button>
```

5. **Add game initialization** in lobby when Chess is selected
```javascript
socket.emit('chess:initialize', { roomId }, (response) => {
  // Chess ready to play
});
```

## Client-Side Flow

1. User lands on `/KRED/?multiplayer=true`
2. Shows `MultiplayerLobby` component
3. User creates/joins room using `room:*` events
4. Host sees game selection buttons
5. Host clicks "Select Game" → "KRED"
6. Emits `room:select:game` with game="KRED"
7. Server broadcasts `room:game:selected` to all players
8. Client emits `kred:initialize` to set up game state
9. Host clicks "Start KRED"
10. Emits `kred:game:start`
11. Server broadcasts `kred:game:started`
12. Client calls `onGameStart()` → switches to game UI

## Key Principles

1. **Separation of Concerns**: Room management is separate from game logic
2. **Modularity**: Each game is self-contained in its own module
3. **Scalability**: Easy to add new games without touching core room code
4. **Reusability**: Room system works for any turn-based or real-time game
5. **Database Organization**: Generic tables + game-specific tables linked by room_id

## Testing

Use `/public/test-multiplayer.html` to test socket events:
- Create room
- Join room from another tab/browser
- Select game
- Send game-specific events
- Verify database updates

## Future Enhancements

- Spectator mode (already has `kred_spectators` table)
- Reconnection logic (store session tokens, restore player state)
- Room listings (browse available rooms)
- Private rooms with passwords
- Game history/replays
- Chat system (per-room chat)
- Multiple concurrent games in same room (e.g., tournament mode)
