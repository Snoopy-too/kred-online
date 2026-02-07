# KRED Multiplayer Architecture

## Overview

KRED uses a **server-authoritative multiplayer architecture** with a game-agnostic room system. The codebase is organized as a monorepo with shared packages.

### Architecture Layers
- **shared**: Shared types, game logic, rules, and validation
- **server**: Node.js server with socket.io and MySQL
- **client**: React frontend (existing _KRED app)

## Room System Flow

The multiplayer system allows multiple games on the same server:

1. **Create/Join Room** → Generic room system (in fly.on.js)
2. **Select Game** → Host chooses which game to play (KRED, TFD, future games)
3. **Initialize Game** → Game-specific handlers activate and initialize state
4. **Play Game** → Game-specific socket events handle gameplay
5. **Complete Game** → Return to lobby or end session

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (React)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App.tsx (UI Layer)                                    │ │
│  │  - Renders components based on server state           │ │
│  │  - Emits user actions to server via socket.io         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SocketContext                                         │ │
│  │  - Manages socket.io connection                       │ │
│  │  - Handles session persistence                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  useGameSync Hook                                      │ │
│  │  - Listens for server state updates                   │ │
│  │  - Syncs local React state with server                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▲  │
                            │  │ Socket.io
                            │  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Socket.io Event Handlers                              │ │
│  │  - game:create, game:join, campaign:playTile, etc.    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Room Manager                                          │ │
│  │  - Manages multiple game rooms                        │ │
│  │  - Tracks player sessions                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Game Engine (State Machine)                          │ │
│  │  - Authoritative game state                           │ │
│  │  - Validates all actions                              │ │
│  │  - Dispatches state transitions                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MySQL Database                                        │ │
│  │  - Persists game state                                │ │
│  │  - Stores move history for replay                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▲  │
                            │  │ Import
                            │  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared Package                            │
│  - Types (Player, Piece, Tile, GameState, etc.)            │
│  - Game Logic (move calculation, tile validation)          │
│  - Rules (credibility, movement, tile requirements)        │
│  - Config (constants, board layout, pieces)                │
└─────────────────────────────────────────────────────────────┘
```

## Database Structure

### Generic Room Tables (All Games)
```sql
game_rooms
- id (VARCHAR 12)              # Room code
- status (ENUM: lobby, playing, completed)
- selected_game (VARCHAR 50)   # NULL until game selected
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

### Game-Specific Tables (KRED)
```sql
kred_game_state
- room_id (VARCHAR 12)         # Links to game_rooms
- game_state (JSON)            # Full game state
- created_at, updated_at

kred_game_history
- room_id (VARCHAR 12)
- sequence (INT)
- action_type (VARCHAR 50)
- action_data (JSON)
- created_at
```

## Socket.io Events

### Generic Room Events (fly.on.js)
- `room:create` → Create new room, returns roomId
- `room:join` → Join existing room by code
- `room:player:joined` → Broadcast when new player joins
- `room:select:game` → Host selects which game to play
- `room:game:selected` → Broadcast selected game to all players
- `room:rejoin` → Reconnect to room after disconnect

### KRED-Specific Events

**Client → Server:**
- `kred:initialize` → Create initial game state for room
- `kred:game:start` → Begin game (transition from lobby to gameplay)
- `kred:select:tile` → Select tile during drafting
- `kred:request:state` → Request current game state
- `kred:campaign:play` → Play tile in campaign
- `kred:campaign:discard` → Discard tile
- `kred:campaign:movePiece` → Move a piece
- `kred:campaign:endTurn` → End current turn
- `kred:tile:accept` → Accept played tile
- `kred:tile:reject` → Reject played tile
- `kred:challenge:initiate` → Challenge a tile play
- `kred:bureaucracy:purchase` → Make bureaucracy purchase

**Server → Client:**
- `kred:game:started` → Broadcast when game begins
- `kred:stateUpdate` → Broadcast updated game state
- `kred:phaseChange` → Game phase changed
- `kred:error` → Error message

See [SOCKET_EVENTS.md](SOCKET_EVENTS.md) for complete event reference.

## Socket Rooms

- **Generic lobby:** `room:${roomId}` - All players in a room
- **Game-specific:** `kred:${roomId}` - KRED game instance
  - Players join game-specific room when game is selected
  - Allows game events to only go to players in that game

## File Structure

```
_KRED/
├── packages/
│   ├── shared/              # Shared code
│   │   ├── src/
│   │   │   ├── types/       # TypeScript types
│   │   │   ├── game/        # Game logic
│   │   │   ├── rules/       # Validation rules
│   │   │   ├── config/      # Configuration
│   │   │   └── utils/       # Utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── server/              # Server package
│       ├── src/
│       │   ├── index.ts           # Main entry point
│       │   ├── types.ts           # Server-specific types
│       │   ├── gameEngine.ts      # State machine
│       │   ├── roomManager.ts     # Room management
│       │   └── socketHandlers.ts  # Socket.io handlers
│       ├── schema.sql       # Database schema
│       ├── package.json
│       └── tsconfig.json
├── src/                     # Client source
│   ├── contexts/
│   │   └── SocketContext.tsx
│   ├── hooks/
│   │   ├── useGameSync.ts
│   │   └── useMultiplayerActions.ts
│   ├── components/
│   ├── game/
│   └── ...
├── server/                  # Legacy server (current)
│   └── socketHandlers.cjs   # Current active handlers
└── package.json
```

## Code Organization

```
fly.on.js
├── Generic room handlers (room:create, room:join, room:select:game)
├── require('./_KRED/server/socketHandlers.cjs')  # Current
└── setupKREDHandlers(io, socket, db)

_KRED/server/socketHandlers.cjs  # Current implementation
└── Handles all kred:* events

_KRED/packages/server/  # New architecture (migration target)
└── TypeScript implementation with proper types
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd /var/www/fly.on/_KRED

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Build Shared Package

```bash
npm run build:shared
```

### 3. Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE kred_multiplayer;"

# Import schema
mysql -u root -p kred_multiplayer < packages/server/schema.sql
```

### 4. Configure Environment

```bash
# Copy example env file
cp packages/server/.env.example packages/server/.env

# Edit .env with your database credentials
nano packages/server/.env
```

### 5. Start Development

**Current Setup (using fly.on.js):**
```bash
# From main fly.on directory
npm start
```

**New Package Setup (when migrated):**
```bash
# Terminal 1: Start server
npm run dev:server

# Terminal 2: Start client
npm run dev:client
```

## Testing Multiplayer

### Manual Testing (Multiple Browser Windows)

1. **Browser #1:**
   - Navigate to lobby
   - Create a new game (3-5 players)
   - Note the Room ID

2. **Browsers #2-5:**
   - Navigate to lobby
   - Join game using Room ID
   - Use different player names

3. **Start the game from Browser #1**

4. **Play through:**
   - Drafting phase: Each player selects tiles
   - Campaign phase: Play tiles, move pieces, challenges
   - Bureaucracy phase: Spend kredcoin
   - Watch for win conditions

## Adding New Games

To add a new game (e.g., Chess):

### 1. Create Database Tables
```sql
chess_game_state (room_id, board_state, current_player, ...)
chess_game_moves (room_id, move_number, move_data, ...)
```

### 2. Create Handler Module
`Chess/server/socketHandlers.js`
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

### 3. Register in fly.on.js
```javascript
const setupChessHandlers = require('./Chess/server/socketHandlers');
io.on('connection', (socket) => {
  setupChessHandlers(io, socket, db);
});
```

### 4. Update Game Selection UI
```tsx
<button onClick={() => selectGame('Chess')}>Chess</button>
```

## Client-Side Flow

1. User lands on `/KRED/?multiplayer=true` or lobby page
2. Shows lobby/room selection UI
3. User creates/joins room using `room:*` events
4. Host sees game selection buttons
5. Host selects KRED → emits `room:select:game`
6. Server broadcasts `room:game:selected` to all players
7. Client emits `kred:initialize` to set up game state
8. Host clicks "Start KRED" → emits `kred:game:start`
9. Server broadcasts `kred:game:started`
10. All clients switch to game UI

## Migration Status

**Current State:**
- ✅ Generic room system in fly.on.js
- ✅ KRED handlers in `_KRED/server/socketHandlers.cjs`
- ✅ Client socket integration (SocketContext, useGameSync)
- ✅ Database schema designed
- 🔄 Migration to `packages/server` (TypeScript) in progress

**Both architectures run in parallel:**
- **Production:** Uses fly.on.js + `_KRED/server/socketHandlers.cjs`
- **Development:** TypeScript version in `packages/server/` (target architecture)

## Key Principles

1. **Separation of Concerns**: Room management separate from game logic
2. **Modularity**: Each game is self-contained in its own module
3. **Scalability**: Easy to add new games without touching core room code
4. **Reusability**: Room system works for any turn-based or real-time game
5. **Database Organization**: Generic tables + game-specific tables linked by room_id

## Future Enhancements

- Spectator mode (database tables already exist)
- Reconnection logic with session tokens
- Room listings (browse available rooms)
- Private rooms with passwords
- Game history/replays
- Chat system (per-room chat)
- Multiple concurrent games in same room
