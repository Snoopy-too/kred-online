# ACTION_PLAN.md

This file has been moved to _KRED/docs/agents/ACTION_PLAN.md.

Please refer to the new location for the latest version and updates.
- All game rules implemented correctly per manual
- Multiplayer infrastructure 60% complete

### What Needs Work ⚠️
- Server game engine handlers (stub implementations)
- Client multiplayer integration
- Reconnection logic
- Spectator mode
- Replay system
- Production deployment

---

## 🚀 Development Phases (Prioritized)

### **PHASE 1: Critical Fixes & Code Quality** (4-6 hours)
**Status:** ✅ COMPLETE  
**Priority:** HIGH - Must complete before multiplayer work

#### Tasks:
1. **Fix type safety gaps**
   - [x] Change `any[]` to `TrackedMove[]` in `packages/server/src/socketHandlers.ts`
   - [x] Fix import from legacy `../../game` to proper module paths in `src/config/bureaucracy.ts`
   - [x] Add missing `displayName` property to Piece type in `src/types/piece.ts`

2. **Remove debug code**
   - [x] Remove/wrap console.log statements in `src/game/validation.ts`
   - [x] Ensure debug logs only in development mode

3. **Fix server TODOs**
   - [x] `packages/server/src/socketHandlers.ts:283` - Map playerId correctly
   - [x] `packages/server/src/socketHandlers.ts:323` - Implement piece movement validation

**Verification:** ✅ No TypeScript errors, 474/481 tests passing (7 pre-existing failures in DraftingScreen tests)

---

### **PHASE 2: Complete Multiplayer MVP** (20-30 hours)
**Status:** 🚀 ACTIVE - Lobby → Game Transition Issue
**Priority:** HIGH - Core deliverable

**Current Blocker:** Socket connection lost when redirecting from lobby.html to React app

#### 2B. Fix Lobby → Game Transition (IMMEDIATE PRIORITY)

**Problem Statement:**
- Lobby (lobby.html) works perfectly - room creation, joining, player lists all functional
- Game selection and initialization succeeds
- When `kred:game:start` redirects to `/KRED/`, socket connection breaks
- React app doesn't properly rejoin the game room

**Investigation Checklist:**
- [ ] Check if socket survives page redirect or if new socket is created
- [ ] Verify sessionStorage data (roomId, playerId, playerIndex) transfers correctly
- [ ] Confirm SocketContext reads sessionStorage on initialization
- [ ] Test if room:rejoin event is emitted by React app
- [ ] Verify socket joins both `room:${roomId}` and `kred:${roomId}` rooms

**Implementation Tasks:**
- [ ] Update SocketContext.tsx to read sessionStorage on mount
- [ ] Add playerId to socket auth: `io({ auth: { playerId } })`
- [ ] Emit `room:rejoin` event on socket connection in React app
- [ ] Handle reconnection if socket disconnects
- [ ] Test full flow: lobby → game selection → game start → game play

**Files to Modify:**
- `src/contexts/SocketContext.tsx` - Socket initialization and room rejoining
- `src/AppRoot.tsx` - Read multiplayerSession from sessionStorage
- `src/hooks/useGameSync.ts` - Ensure proper event handlers
- `public/lobby.html` - Verify sessionStorage is set before redirect

**Testing:**
1. Create room in lobby
2. Have second player join
3. Select KRED as game
4. Click "Start Game"
5. Verify both players see KRED React app
6. Verify socket events work (player actions sync)
7. Refresh page, verify reconnection works

#### 2A. Server Game Engine (8-12 hours)
**File:** `packages/server/src/gameEngine.ts`

- [x] Import shared game logic from `@kred/shared` package
- [x] Implement `handleTilePlayed` - Validate tile and store in state
- [x] Implement `handlePieceMoved` - Apply piece movement with validation
- [x] Implement `handleChallengeInitiated` - Execute challenge logic
- [x] Implement `handleTakeAdvantageOffered` - Handle Take Advantage purchases
- [x] Implement `handleBureaucracyPurchase` - Process kredcoin spending
- [x] Add win condition checks after each significant action
- [x] Fix shared package build errors (displayName, missing types, undefined checks)
- [x] Build `@kred/shared` package successfully

**Status:** ✅ COMPLETE

**Dependencies:** Phase 1 complete, `@kred/shared` package built

#### 2B. Client Integration (6-8 hours)
**Files:** `src/App.tsx`, `src/AppRoot.tsx`, `src/AppWithMultiplayer.tsx`

**Current Status:** App.tsx has legacy multiplayer support via `useMultiplayerSync` hook that uses old socket events (`kred:*`). Need to migrate to new server architecture with `game:*` events.

**Implementation Plan:**
1. **Update socket event names** in existing multiplayer hooks to match Phase 2A server:
   - `kred:state:update` → `game:stateUpdate`
   - `kred:select:tile` → `draft:selectTile`
   - Add new event handlers for `game:phaseChange`, `player:joined`, etc.

2. **Wire up AppRoot.tsx** to use SocketContext and new architecture:
   - Simplify multiplayer detection (URL param or localStorage)
   - Use `useGameSync` and `useMultiplayerActions` hooks (already created)
   - Pass proper props to App.tsx

3. **Modify App.tsx** to use new multiplayer actions:
   - Replace direct socket.emit calls with `multiplayerActions` methods
   - Add connection status UI component
   - Conditional rendering based on `isMultiplayer` flag

4. **Hide opponent hands** when in multiplayer:
   - Only show current player's tiles
   - Show tile counts for other players
   - Display "Hidden" placeholder for opponent hands

**Testing approach:**
- Test single-player mode still works (no regression)
- Test multiplayer mode with test-client.html
- Verify state syncs across multiple browser windows

**Dependencies:** Phase 2A complete

- [ ] Update useMultiplayerSync to use new event names
- [ ] Wire AppRoot.tsx with SocketContext
- [ ] Add multiplayerActions to App.tsx props interface
- [ ] Replace socket.emit calls with multiplayerActions methods
- [ ] Add connection status UI
- [ ] Hide opponent hands in multiplayer mode
- [ ] Test single-player (no regression)
- [ ] Test multiplayer with multiple windows

#### 2C. Multiplayer Testing (4-6 hours)

- [ ] Test 3-player game through complete Campaign phase
- [ ] Test tile rejection scenarios
- [ ] Test challenge system (accept, reject, challenge outcomes)
- [ ] Test bureaucracy with multiple players
- [ ] Test edge cases: disconnections, illegal moves
- [ ] Document and fix all bugs found
- [ ] Create test checklist for future regression testing

**Dependencies:** 2B complete

#### 2D. Reconnection System (4-6 hours)
**Files:** `packages/server/src/socketHandlers.ts`, `src/contexts/SocketContext.tsx`

- [ ] Implement auto-rejoin on disconnect with 60-second grace period
- [ ] Add "Reconnecting..." UI indicator
- [ ] Implement timeout handling (forfeit after grace period)
- [ ] State restoration - Full game state sync on reconnect
- [ ] Test with simulated network failures

**Dependencies:** 2C complete

**Phase 2 Deliverable:** Fully functional multiplayer game for 3-5 players

---

### **PHASE 3: Enhanced Features** (16-24 hours)
**Status:** After MVP  
**Priority:** MEDIUM

#### 3A. Spectator Mode (6-8 hours)
- [ ] Create SpectatorView component with read-only board
- [ ] Implement filtered state (hide hands, show public info)
- [ ] Add live updates with real-time move feed
- [ ] Implement join spectator flow via socket events
- [ ] Test multiple spectators on one game

#### 3B. Replay System (8-12 hours)
- [ ] Create ReplayViewer component with timeline
- [ ] Implement playback controls (play, pause, step, speed)
- [ ] Add action filtering (by player or action type)
- [ ] Implement jump to phase feature
- [ ] Load replay data from `/api/replay/:roomId`

#### 3C. Generic Room Architecture (4-6 hours)
- [ ] Implement room lobby per `docs/MULTIPLAYER_ARCHITECTURE.md`
- [ ] Add game selection (Host chooses KRED, future: TFD)
- [ ] Create generic room database tables
- [ ] Modularize game handlers for future extensibility

**Phase 3 Deliverable:** Enhanced UX with spectator and replay capabilities

---

### **PHASE 4: Production Readiness** (16-24 hours)
**Status:** Before launch  
**Priority:** MEDIUM

#### 4A. Load Testing (6-10 hours)
- [ ] Create automated load tests - 20 concurrent games (80 players)
- [ ] Measure performance benchmarks (response times, memory)
- [ ] Optimize database queries and add indexes
- [ ] Test WebSocket connection limits

#### 4B. Deployment Infrastructure (10-15 hours)
- [ ] Configure NGINX reverse proxy
- [ ] Set up SSL certificates for secure WebSocket
- [ ] Create environment configs (production vs development)
- [ ] Implement database backup strategy
- [ ] Set up monitoring & logging (consider Sentry)
- [ ] Create CI/CD pipeline

**Phase 4 Deliverable:** Production-ready deployment

---

### **PHASE 5: Polish & Optimization** (8-12 hours)
**Status:** Nice-to-have  
**Priority:** LOW

- [ ] Refactor App.tsx (reduce from 3,416 lines)
- [ ] Add animations (piece movements, tile reveals)
- [ ] Add sound effects (moves, challenges)
- [ ] Make mobile responsive
- [ ] Performance optimization (memoization, virtual scrolling)
- [ ] Complete user documentation

---

## 📈 Timeline Summary

| Phase | Time Estimate | Status |
|-------|---------------|--------|
| Phase 1 | 4-6 hours | Ready |
| Phase 2 | 20-30 hours | Pending |
| Phase 3 | 16-24 hours | Pending |
| Phase 4 | 16-24 hours | Pending |
| Phase 5 | 8-12 hours | Pending |
| **TOTAL** | **64-96 hours** | ~30% done |

---

## 🔍 Key References

### Game Rules
- **Official Manual:** https://flyingdutchmen.online/KRED/manual
- **Game Rules Doc:** `GAME_RULES.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`

### Architecture
- **Multiplayer Architecture:** `docs/MULTIPLAYER_ARCHITECTURE.md`
- **Codebase Assessment:** `docs/CODEBASE_ASSESSMENT.md`
- **Testing Guide:** `packages/TESTING_GUIDE.md`

### Key Files
- **Server Engine:** `packages/server/src/gameEngine.ts`
- **Socket Handlers:** `packages/server/src/socketHandlers.ts`
- **Main App:** `src/App.tsx`
- **Socket Context:** `src/contexts/SocketContext.tsx`
- **Game Logic:** `src/game/` (9 modules)
- **Tests:** `src/__tests__/` (1,056 tests)

---

## 🎯 Next Immediate Actions

1. **Start Phase 1** - Fix critical type safety and code quality issues (4-6 hours)
2. **Begin Phase 2A** - Implement server game engine handlers (8-12 hours)
3. **Test frequently** - Run `npm test` after each major change
4. **Report progress** - Update this document as tasks complete

---

## ⚠️ Important Reminders

- **Never modify game rules** without explicit permission
- **Single-player is for testing only** - don't spend time optimizing it
- **Test after every change** - Run test suite to catch regressions
- **Refer to manual** for any rule clarifications
- **Ask for confirmation** when unclear about implementation details
- **Keep code clean** - Follow existing patterns and architecture
- **Document decisions** - Update this plan when priorities change

---

## 📝 Progress Tracking

**Current Phase:** Phase 2A Complete, Phase 2B Starting  
**Current Task:** Integrate client with socket events  
**Last Update:** January 20, 2026 - Phase 2A Complete (Server game engine implemented)  
**Next Milestone:** Complete client integration with multiplayer

---

**Remember:** The goal is online multiplayer KRED. Stay focused on that objective.
