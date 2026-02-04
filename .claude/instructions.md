# KRED Online - Agent Instructions

## Project Overview

KRED Online is a multiplayer digital implementation of the KRED strategic board game. The project supports 3-5 players through three game phases: Player Selection, Drafting, and Campaign with Bureaucracy rounds.

**Primary Objective:** ONLINE MULTIPLAYER KRED. Single-player mode exists only for testing game logic.

## Critical References

### Always Check First
- **Action Plan:** `ACTION_PLAN.md` - Current development status, priority tasks, and next actions
- **Official Game Rules:** https://flyingdutchmen.online/KRED/manual
- **Codebase Assessment:** `CODEBASE_ASSESSMENT.md`
- **Multiplayer Architecture:** `MULTIPLAYER_ARCHITECTURE.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`

### Skills System
Before implementing multiplayer features, consult relevant skills:
- **[skills/multiplayer-game-architecture.md](skills/multiplayer-game-architecture.md)** - Player-specific views, turn management, phase systems, bystander challenges
- **[skills/database-design.md](skills/database-design.md)** - Two-tier schema, JSON vs normalized tables, race condition prevention, query patterns

### Key Documentation
- `README.md` - Getting started, project structure
- `GAME_RULES.md` - Game mechanics reference
- `packages/MULTIPLAYER_README.md` - Multiplayer system architecture
- `packages/TESTING_GUIDE.md` - Testing practices and patterns

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Testing:** Vitest + React Testing Library (1056+ tests)
- **Backend:** Node.js + Socket.IO + MySQL
- **Architecture:** Monorepo with shared packages

## Code Quality Standards

The KRED codebase must be:
- **Secure and stable** - Validate all inputs, handle edge cases
- **Efficient and performant** - Optimize for real-time multiplayer
- **Clean and well-documented** - Clear patterns, meaningful names
- **Human readable** - Straightforward logic over clever tricks

### Critical Rules
- ❌ **NEVER** change game rules or mechanics without explicit permission
- ❌ **NEVER** skip running tests before committing changes
- ✅ **ALWAYS** check `ACTION_PLAN.md` at session start
- ✅ **ALWAYS** update ACTION_PLAN.md as tasks complete
- ✅ **ALWAYS** verify changes don't break existing tests
- ✅ **ALWAYS** add tests for new functionality

## Project Structure

```
_KRED/
├── src/
│   ├── config/         # Static game configuration (board, pieces, tiles, rules)
│   ├── types/          # TypeScript type definitions
│   ├── game/           # Core game logic functions
│   ├── rules/          # Game rule validation
│   ├── hooks/          # Custom React hooks
│   ├── handlers/       # Event handler factories
│   ├── utils/          # Utility functions
│   ├── components/     # React components
│   │   ├── screens/    # Game phase screens
│   │   └── shared/     # Reusable components
│   ├── contexts/       # React contexts (SocketContext)
│   └── __tests__/      # Test files (mirrors src structure)
├── packages/
│   ├── server/         # Game server with Socket.IO handlers
│   │   └── src/
│   │       ├── socketHandlers.ts   # Socket event handlers
│   │       ├── gameEngine.ts       # Server game logic
│   │       ├── roomManager.ts      # Room management
│   │       └── database.ts         # MySQL persistence
│   ├── shared/         # Shared types and game logic
│   │   └── src/
│   │       ├── types/              # Shared TypeScript types
│   │       └── game/               # Shared game logic
│   └── TESTING_GUIDE.md
├── .claude/            # Agent configuration and documentation
├── App.tsx             # Main React component (3400+ lines)
├── AppRoot.tsx         # App wrapper for multiplayer mode
├── game.ts             # Legacy re-exports (being phased out)
└── test-client.html    # Standalone multiplayer test client
```

## Development Workflow

### Running Tests
```bash
npm test -- --run  # Run all tests without watch mode
npm run test:ui    # Run with UI interface
npm run test:coverage  # Generate coverage report
```

**Current Test Count:** 1056+ tests across 46 test files

### Development Server
```bash
npm run dev  # Start Vite dev server on http://localhost:3000
```

### Multiplayer Development
```bash
./start-dev.sh  # Start both client and server
# Client: http://localhost:3000
# Server: http://localhost:3001
```

### Building
```bash
npm run build    # Production build
npm run preview  # Preview production build
```

## Multiplayer Architecture

### Critical Requirements
- **Sockets must NOT disconnect** when transitioning from lobby to game
- **Same socket connection** used for both lobby and game-specific events
- **Automatic reconnection** if socket disconnects (rejoin same room with same playerId)

### Flow
1. **Access `/lobby` endpoint** → Socket connection established in `lobby.html`
2. **Create/Join Room** → Generic room handlers in `fly.on.js` (room:create, room:join)
3. **Select Game** → Host chooses KRED via `room:select:game` event
   - Updates DB: `game_rooms.selected_game = 'KRED'`, `status = 'playing'`
   - Adds all sockets to game-specific room: `kred:${roomId}`
   - Emits `room:game:selected` to all players
4. **Initialize Game** → `kred:initialize` event triggers KRED setup
   - Creates initial game state in `kred_game_state` table
   - Game-specific handlers in `_KRED/server/socketHandlers.cjs` activate
5. **Start Game** → `kred:game:start` event begins gameplay
   - **Redirects to `/KRED/` route** (React app)
   - **Socket connection persists** - same socket handles game events
6. **Play Game** → KRED-specific events (kred:action, kred:state:update)
7. **Complete Game** → Return to lobby or end session

### Current Transition Issue
The transition from lobby.html to the KRED React app is breaking. Investigation needed:
- Does socket connection persist when redirecting from `/lobby` to `/KRED/`?
- Is React app properly rejoining the socket rooms?
- Are multiplayer session data (roomId, playerId) being passed correctly?

### Database Tables
- **Generic (fly.on DB):**
  - `game_rooms` - Room metadata (id, status, selected_game, host_player_id)
  - `room_players` - Player connections (room_id, player_id, player_name, player_index, is_host, connected)
- **KRED-specific:**
  - `kred_game_state` - Current game state JSON
  - `kred_game_history` - Action history for replay

### Socket Events

**Generic Room Events (fly.on.js):**
- `room:create` - Create new room, get roomId and playerId
- `room:join` - Join existing room by code
- `room:rejoin` - Reconnect to room after disconnect
- `room:select:game` - Host selects which game to play (KRED/TFD)
- `room:game:selected` - Broadcast game selection to all players
- `room:player:joined` - Broadcast when new player joins
- `room:players:update` - Send updated player list
- `room:get:players` - Get current players in room

**KRED Game Events (_KRED/server/socketHandlers.cjs):**
- `kred:initialize` - Create initial game state for room
- `kred:game:start` - Begin game (triggers redirect to /KRED/)
- `kred:game:started` - Broadcast game started to all players
- `kred:state:update` - Broadcast updated game state
- `kred:action` - Player performs action (tile play, piece movement)
- `kred:select:tile` - Player selects tile in drafting
- `kred:play:tile` - Player plays tile in campaign
- `kred:move:piece` - Player moves piece
- `kred:challenge:initiate` - Player initiates challenge

See `MULTIPLAYER_ARCHITECTURE.md` for full details.

## Current Development Status

**Completed:**
- ✅ Core game logic implementation (all rules working)
- ✅ Comprehensive test suite (1056+ tests)
- ✅ Modular architecture refactoring
- ✅ React hooks extraction
- ✅ Shared package with game logic
- ✅ Server infrastructure (60% complete)

**In Progress:**
- 🚀 Phase 2B: Client multiplayer integration
- 🚀 Lobby → Game transition (socket persistence issue)
- 🚀 React app socket reconnection
- 🚀 Real-time state synchronization

**Planned:**
- ⏳ Phase 2C: Multiplayer testing
- ⏳ Phase 2D: Reconnection logic
- ⏳ Phase 3: Spectator mode & replay system
- ⏳ Production deployment

Check `ACTION_PLAN.md` for current phase and priority tasks.

## Current Known Issues

### Lobby → Game Transition Problem

**Symptoms:**
- Lobby works perfectly (room creation, joining, player list updates)
- Game selection and initialization works
- Transition from `lobby.html` to `/KRED/` React app fails or loses connection

**Investigation Needed:**
1. **Socket Persistence:**
   - Does Socket.IO connection survive page redirect?
   - Current: `lobby.html` creates socket → redirects to `/KRED/` → new socket?
   - Need: Same socket connection throughout

2. **Session Data Transfer:**
   - `sessionStorage.multiplayerSession` contains: roomId, playerId, playerIndex
   - Does React app read this sessionStorage?
   - Does SocketContext use this data to rejoin rooms?

3. **React App Socket Setup:**
   - `SocketContext.tsx` creates new socket with `io()`
   - Should this socket include auth: `{ playerId }`?
   - Should it emit `room:rejoin` automatically?
   - Should it join both `room:${roomId}` and `kred:${roomId}` rooms?

4. **Room Rejoining Flow:**
   - Server has `room:rejoin` handler that rejoins socket to rooms
   - Does React app call this on mount?
   - Does it pass correct roomId and playerId?

**Potential Solutions:**
- Option A: Keep socket alive during redirect (using same domain)
- Option B: React app creates new socket but immediately rejoins rooms
- Option C: Use query params to pass roomId/playerId to React app

**Files to Review:**
- `_KRED/src/contexts/SocketContext.tsx` - Socket initialization
- `_KRED/src/AppRoot.tsx` - Entry point, multiplayer detection
- `_KRED/src/hooks/useGameSync.ts` - Server state synchronization
- `public/lobby.html` - Lobby socket setup and redirect logic

## Communication Guidelines

### Required Approach
- ✅ State facts and actions taken
- ✅ Report what was done and what's next
- ✅ Provide testing instructions and what to report
- ✅ Ask for clarification when unclear
- ✅ Be direct and concise
- ✅ Point out errors or issues

### Forbidden Patterns
- ❌ Positive exclamations ("Perfect!", "Excellent!", "Great!")
- ❌ Affirmations ("You're right!", "Good point!")
- ❌ Unnecessary pleasantries

### Example - Correct
"Phase 2A complete. Game engine handlers implemented. Tests: 1,049/1,056 passing. Starting Phase 2B client integration."

### Example - Wrong
"Perfect! Excellent work on completing Phase 2A! Great job!"

## Common Tasks

### Adding a New Feature
1. Check `ACTION_PLAN.md` to see if it's already planned
2. Verify it doesn't change game rules (requires permission)
3. Review relevant tests in `src/__tests__/` directory
4. Implement feature following modular architecture
5. Add comprehensive tests
6. Run full test suite with `npm test -- --run`
7. Update ACTION_PLAN.md with progress

### Fixing a Bug
1. Locate relevant test file or create new test reproducing bug
2. Implement fix in appropriate module
3. Verify all tests pass
4. Check for similar issues in related code
5. Update ACTION_PLAN.md if bug was blocking a phase

### Refactoring Code
1. Ensure comprehensive test coverage exists
2. Make incremental changes
3. Run tests after each change
4. Maintain backward compatibility unless explicitly changing API
5. Update documentation if module APIs change

## File Import Patterns

### Correct
```typescript
import { BOARD_IMAGES } from '@/config';
import { GameState } from '@/types/game';
import { validateMove } from '@/rules/movement';
import { useGameState } from '@/hooks/useGameState';
```

### Avoid
```typescript
import { something } from '../../game';  // Legacy, being phased out
```

## Testing Patterns

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestGameState } from './setup';
```

### Game Logic Tests
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup test state
  });

  it('should handle specific scenario', () => {
    // Arrange
    const gameState = createTestGameState({ /* config */ });
    
    // Act
    const result = gameFunction(gameState, params);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Server Tests
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';

describe('Socket Event Handler', () => {
  let io: Server, serverSocket, clientSocket;
  
  beforeEach((done) => {
    // Setup server and client
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should handle event correctly', (done) => {
    clientSocket.emit('event:name', data);
    serverSocket.on('event:name', (receivedData) => {
      expect(receivedData).toEqual(expected);
      done();
    });
  });
});
```

## Type Safety

- Use explicit types, avoid `any`
- Define interfaces in `src/types/`
- Export shared types from `@kred/shared` package
- Use type guards for runtime validation
- Server state in `packages/server/src/types.ts`
- Client state in `src/types/game.ts`

## Common Pitfalls to Avoid

1. **Don't modify game rules** without permission
2. **Don't skip tests** - always run full suite
3. **Don't use console.log** in production code (use proper logging)
4. **Don't mix client/server logic** - keep separation clean
5. **Don't forget to update ACTION_PLAN.md** when completing tasks
6. **Don't use old socket events** (kred:* deprecated, use game:*)
7. **Don't bypass validation** - always validate on server

## Game Rules Reference

Key mechanics to preserve:
- **Player Selection:** Order determines piece counts
- **Drafting:** Tile selection with kredcoin allocation
- **Campaign:** Tile play, piece movement, challenges
- **Bureaucracy:** Kredcoin spending for advantages
- **Win Conditions:** 5 tiles accepted OR highest credibility when deck runs out

For detailed rules, see: https://flyingdutchmen.online/KRED/manual

## Getting Help

When unclear about:
- **Game Rules:** Check official manual, ask for clarification
- **Architecture:** Review `MULTIPLAYER_ARCHITECTURE.md`
- **Current Status:** Check `ACTION_PLAN.md`
- **Implementation:** See `IMPLEMENTATION_STATUS.md`
- **Testing:** See `packages/TESTING_GUIDE.md`
- **Code Quality:** Review `CODEBASE_ASSESSMENT.md`

## Version Control

- Create descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic
- Run tests before committing
- Update ACTION_PLAN.md in the same commit as feature completion

---

**Remember:** The goal is bulletproof online multiplayer KRED. Every change should move toward that goal while maintaining code quality and test coverage.
