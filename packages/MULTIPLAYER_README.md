# KRED Multiplayer Architecture

## Overview

KRED has been refactored into a server-authoritative multiplayer game using socket.io. The codebase is now organized as a monorepo with three packages:

- **shared**: Shared types, game logic, rules, and validation
- **server**: Node.js server with socket.io and MySQL
- **client**: React frontend (existing _KRED app)

## Architecture

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

### 5. Start Development Servers

```bash
# Terminal 1: Start server
npm run dev:server

# Terminal 2: Start client
npm run dev:client
```

The client will be available at `http://localhost:5173`
The server will be available at `http://localhost:4001`

## Testing Multiplayer

### Manual Testing (Multiple Browser Windows)

1. Open browser window #1:
   - Navigate to `http://localhost:5173`
   - Create a new game (3-5 players)
   - Note the Room ID

2. Open browser windows #2-5:
   - Navigate to `http://localhost:5173`
   - Join game using Room ID from window #1
   - Use different player names

3. Start the game from window #1

4. Play through a complete game:
   - Drafting phase: Each player selects tiles in turn
   - Campaign phase: Play tiles, move pieces, accept/reject, challenge
   - Bureaucracy phase: Spend kredcoin on purchases
   - Watch for win conditions

### Automated Testing

```bash
# Run server tests
cd packages/server
npm test

# Run client tests
cd ../..
npm test
```

## Socket.io Events

### Client → Server

- `game:create` - Create new game room
- `game:join` - Join existing room
- `game:rejoin` - Reconnect after disconnection
- `game:start` - Start the game
- `draft:selectTile` - Select tile during drafting
- `campaign:playTile` - Play tile to another player
- `campaign:movePiece` - Move a piece
- `campaign:endTurn` - End current turn
- `tile:accept` - Accept played tile
- `tile:reject` - Reject played tile
- `tile:viewPrivate` - View tile before accepting
- `challenge:initiate` - Challenge a tile play
- `challenge:pass` - Pass on challenge
- `advantage:selectTiles` - Select tiles for Take Advantage
- `advantage:purchase` - Make Take Advantage purchase
- `bureaucracy:purchase` - Make bureaucracy purchase
- `spectator:join` - Join as spectator

### Server → Client

- `game:stateUpdate` - Full or partial state update
- `game:phaseChange` - Game phase changed
- `player:joined` - Player joined room
- `player:disconnected` - Player disconnected
- `player:reconnected` - Player reconnected
- `turn:changed` - Turn changed to next player
- `challenge:started` - Challenge phase started
- `challenge:result` - Challenge result
- `advantage:offered` - Take Advantage offered
- `tile:revealed` - Tile revealed
- `game:ended` - Game finished
- `error:invalidMove` - Move validation failed
- `error:notYourTurn` - Action attempted out of turn
- `error:invalidAction` - Invalid action for current phase

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
│       │   ├── index.ts     # Main entry point
│       │   ├── types.ts     # Server-specific types
│       │   ├── gameEngine.ts    # State machine
│       │   ├── roomManager.ts   # Room management
│       │   └── socketHandlers.ts # Socket.io handlers
│       ├── schema.sql       # Database schema
│       ├── package.json
│       └── tsconfig.json
├── src/                     # Client source (existing)
│   ├── contexts/
│   │   └── SocketContext.tsx
│   ├── hooks/
│   │   └── useGameSync.ts
│   ├── components/
│   ├── game/
│   └── ...
├── App.tsx                  # Main React app
├── package.json             # Client package
└── package-workspace.json   # Workspace configuration
```

## Migration Strategy

Both architectures run in parallel:

- **Single-player (existing)**: `http://localhost:5173/` - Current implementation for testing
- **Multiplayer (new)**: `http://localhost:5173/?multiplayer=true` - New server-authoritative version

## Next Steps

1. ✅ Monorepo structure established
2. ✅ Server-side game engine created
3. ✅ Socket.io event protocol defined
4. ✅ MySQL schema designed
5. ✅ Client socket context created
6. 🔄 Implement remaining game engine handlers
7. 🔄 Refactor client to use socket events
8. 🔄 Implement reconnection logic
9. 🔄 Add spectator mode
10. 🔄 Implement game replay
11. 🔄 Build test infrastructure
12. 🔄 Load testing and optimization

## Known Limitations (Current Phase)

- Game engine handlers are stubs (need full implementation)
- Client still uses local state (needs socket integration)
- No database persistence yet (in-memory only)
- No reconnection timeout handling
- No spectator filtering
- No replay UI

These will be addressed in subsequent implementation phases.
