# Socket.IO Event Reference

**Last Updated:** 2026-02-02

## Event Naming Convention

All KRED-specific events MUST use the `kred:` prefix.

## Active Events

### Client → Server (Client Emits)

| Event | Data | Callback Response | Handler Location | Status |
|-------|------|-------------------|------------------|--------|
| `kred:game:start` | `{ roomId }` | `{ success, playerCount, initialGameState }` | socketHandlers.cjs:323 | ✅ Active |
| `kred:select:tile` | `{ roomId, playerIndex, tileId }` | `{ success, phase }` | socketHandlers.cjs:133 | ✅ Active |
| `kred:request:state` | `{ roomId }` | `{ success, playerCount, initialGameState }` | socketHandlers.cjs:385 | ✅ Active |
| `kred:initialize` | `{ roomId, playerId }` | `{ success, initialState/state }` | socketHandlers.cjs:68 | ✅ Active |
| `room:rejoin` | `{ roomId, playerId }` | none | fly.on.js:251 | ✅ Active (generic) |

### Server → Client (Server Broadcasts)

| Event | Data | Trigger | Emitter Location | Status |
|-------|------|---------|------------------|--------|
| `kred:game:started` | `{ playerCount, initialGameState }` | Game start | socketHandlers.cjs:372 | ✅ Active |
| `kred:stateUpdate` | `{ gameState: {...} }` | Any state change | socketHandlers.cjs:248 | ✅ Active |

### Client Listeners

| Event | Handler | Location | Status |
|-------|---------|----------|--------|
| `kred:game:started` | Load initial game state | SocketContext.tsx:63 | ✅ Active |
| `kred:stateUpdate` | Update game state | useMultiplayerSync.ts:148 | ✅ Active |

## Removed/Deprecated Events

### Removed from Client
- ❌ `game:phaseChange` - Not emitted by server (use `kred:stateUpdate`)
- ❌ `player:joined`, `player:disconnected`, `player:reconnected` - Not implemented
- ❌ `error:invalidMove`, `error:notYourTurn`, `error:invalidAction` - Not implemented

### Not Yet Implemented (Server Handlers Exist)

These handlers exist on server but are not yet called by client:

| Event | Purpose | Handler Location | Implementation Status |
|-------|---------|------------------|----------------------|
| `kred:campaign:play` | Play tile in campaign | socketHandlers.cjs:432 | ⏳ TODO: Wire up client |
| `kred:campaign:discard` | Discard tile | socketHandlers.cjs:476 | ⏳ TODO: Wire up client |
| `kred:campaign:get_tiles` | Get player tiles | socketHandlers.cjs:523 | ⏳ TODO: Wire up client |
| `kred:campaign:flip_tile` | Flip discarded tile | socketHandlers.cjs:574 | ⏳ TODO: Wire up client |
| `kred:campaign:next_turn` | Advance turn | socketHandlers.cjs:620 | ⏳ TODO: Wire up client |
| `kred:bureaucracy:start` | Start bureaucracy | socketHandlers.cjs:660 | ⏳ TODO: Wire up client |
| `kred:bureaucracy:purchase` | Purchase in bureaucracy | socketHandlers.cjs:698 | ⏳ TODO: Wire up client |
| `kred:set_token` | Update game token | socketHandlers.cjs:746 | ⏳ TODO: Wire up client |
| `kred:set_position` | Update piece position | socketHandlers.cjs:783 | ⏳ TODO: Wire up client |

### Deprecated Server Handlers

These handlers should be removed:

| Event | Reason | Location |
|-------|--------|----------|
| `kred:state:update` | Replaced by `kred:stateUpdate` broadcast | socketHandlers.cjs:270 |
| `kred:action` | Generic action system not used | socketHandlers.cjs:294 |

## Event Flow

### Game Start Flow
1. Client: `kred:game:start` → Server
2. Server: Deals tiles, saves state
3. Server: `kred:game:started` → All clients
4. Clients: Receive initial state, load game

### Tile Selection Flow
1. Client: `kred:select:tile` → Server
2. Server: Updates player state, passes tiles
3. Server: `kred:stateUpdate` → All clients
4. Clients: Update UI with new hands

### Reconnect Flow
1. Client: Connects, reads sessionStorage
2. Client: `room:rejoin` → Server
3. Client: `kred:request:state` → Server
4. Server: Returns current game state
5. Client: Dispatches `kred:initialState` window event
6. Client: State syncs, game resumes

## Development Guidelines

1. **Always use `kred:` prefix** for KRED-specific events
2. **Include validation** in server handlers (roomId, playerIndex, etc.)
3. **Use callbacks** for request/response pattern
4. **Broadcast to room** using `io.in(\`kred:${roomId}\`).emit()`
5. **Wrap state updates** in `{ gameState: {...} }` structure
6. **Add comprehensive logging** for debugging
7. **Document new events** in this file immediately
