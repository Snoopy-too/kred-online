# Multiplayer Game Architecture Skill

## Overview
Patterns for implementing player-specific views, turn management, and phase systems in real-time multiplayer games.

---

## Player Identity: Viewing vs Acting

### Critical Distinction

**In single-player/testing mode:**
- `currentPlayerId` = the player whose turn it is (active player)
- Only one player exists, so viewer = actor

**In multiplayer mode:**
- `currentPlayerId` = the player VIEWING the screen (fixed per client)
- `currentPlayerIndex` = whose turn it is (changes during game)
- Viewer ≠ actor most of the time

### Implementation Pattern

```typescript
// App.tsx or main component
const currentPlayerId = isMultiplayer
  ? playerIndex + 1  // Fixed: who is viewing (1-based)
  : players[currentPlayerIndex]?.id;  // Dynamic: whose turn it is

// Use currentPlayerId for rendering player-specific UI
const isMyTurn = isMultiplayer
  ? playerIndex === currentPlayerIndex
  : true;  // Always your turn in testing mode

// Use for showing/hiding player-specific modals
const shouldShowModal = isMultiplayer
  ? currentPlayerId === targetPlayerId
  : true;  // Always show in testing mode
```

### Example: Receiver Decision Modal

```typescript
// WRONG - Shows modal to everyone
const shouldShowModal = phase === 'RECEIVER_DECISION';

// CORRECT - Shows only to receiver
const shouldShowModal = 
  phase === 'RECEIVER_DECISION' && 
  currentPlayerId === receiverPlayerId;

// Or with test mode support
const isMyTurnForDecision = (isTestMode && !isMultiplayer) || 
  (currentPlayerId === receiverPlayerId);
```

---

## Player-Specific UI Rendering

### Modal/Alert Visibility

**Pattern: Only show to specific player**

```typescript
// Receiver accept/reject modal
{isReceiverDecisionPhase && currentPlayerId === receiverPlayerId && (
  <Modal>
    <h3>Player {placerPlayerId} sent you a tile</h3>
    <button onClick={() => acceptTile()}>Accept</button>
    <button onClick={() => rejectTile()}>Reject</button>
  </Modal>
)}

// Challenger decision modal
{isChallengerDecisionPhase && currentPlayerId === challengerPlayerId && (
  <Modal>
    <h3>Do you want to challenge?</h3>
    <button onClick={() => makeChallenge(true)}>Challenge</button>
    <button onClick={() => makeChallenge(false)}>Pass</button>
  </Modal>
)}

// All other players see waiting message
{isReceiverDecisionPhase && currentPlayerId !== receiverPlayerId && (
  <div className="waiting-message">
    Waiting for Player {receiverPlayerId} to decide...
  </div>
)}
```

### Action Button Visibility

**Pattern: Only enable for current player**

```typescript
// Tile play button
<button
  onClick={() => playTile(tileId, receiverId)}
  disabled={!isMyTurn || isMultiplayer && playerIndex !== currentPlayerIndex}
>
  Play Tile
</button>

// Or with computed property
const canPlayTile = isTestMode 
  ? true 
  : isMyTurn && playerIndex === currentPlayerIndex;

<button onClick={() => playTile(tileId, receiverId)} disabled={!canPlayTile}>
  Play Tile
</button>
```

### Hand/Tiles Visibility

**Pattern: Show all players' tiles but indicate which are yours**

```typescript
{players.map((player, index) => {
  const isOwnHand = isMultiplayer 
    ? playerIndex === index 
    : currentPlayerIndex === index;
  
  return (
    <div key={player.id} className={isOwnHand ? 'own-hand' : 'other-hand'}>
      <h4>
        {isOwnHand ? 'Your Tiles' : `Player ${player.id}'s Tiles`}
        ({player.keptTiles.length})
      </h4>
      
      {/* Show tiles */}
      <div className="tiles">
        {player.keptTiles.map(tile => (
          <TileComponent
            key={tile.id}
            tile={tile}
            clickable={isOwnHand && isMyTurn}
            onClick={isOwnHand ? () => selectTile(tile.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
})}
```

---

## Turn Management

### Turn Order vs Current Player

```typescript
// Game state
interface GameState {
  players: Player[];           // All players in turn order
  currentPlayerIndex: number;  // Whose turn it is (0-based)
  playerCount: number;         // Total players (3-5)
}

// Client state (multiplayer)
interface ClientState {
  playerIndex: number;         // Which player THIS client is (0-based)
  playerId: number;           // This client's player ID (1-based)
}

// Derived state
const currentPlayer = players[currentPlayerIndex];
const isMyTurn = playerIndex === currentPlayerIndex;
const nextPlayerIndex = (currentPlayerIndex + 1) % playerCount;
```

### Advancing Turns

**Pattern: Server calculates, broadcasts to all**

```typescript
// SERVER - After action completes
socket.on('kred:campaign:challengerDecision', async (data, callback) => {
  const { roomId, challenge } = data;
  
  // Process challenge/pass logic
  // ...
  
  // Advance turn to the RECEIVER (not next player after placer)
  state.currentPlayerIndex = receiverIndex;
  
  // Broadcast to all players
  io.to(`kred:${roomId}`).emit('kred:turn_update', {
    currentPlayerIndex: state.currentPlayerIndex,
    currentPlayerId: state.players[state.currentPlayerIndex].id
  });
  
  callback({ success: true });
});

// CLIENT - Update from broadcast
socket.on('kred:turn_update', (data) => {
  setCurrentPlayerIndex(data.currentPlayerIndex);
  // UI automatically updates based on isMyTurn
});
```

### Special Turn Cases

**Skip to specific player (not sequential):**

```typescript
// After tile accepted and all bystanders pass/challenge
// Turn goes to RECEIVER, not next player in order

// WRONG
state.currentPlayerIndex = (placerIndex + 1) % playerCount;

// CORRECT
state.currentPlayerIndex = receiverIndex;
```

**Maintain turn order during phases:**

```typescript
// Campaign phase - turns cycle through players
// Bureaucracy phase - simultaneous (all players act)

if (phase === 'CAMPAIGN') {
  // Sequential turns
  const isMyTurn = playerIndex === currentPlayerIndex;
} else if (phase === 'BUREAUCRACY') {
  // All players can act
  const isMyTurn = true;
}
```

---

## Phase Management

### Phase Transitions

```typescript
type GamePhase = 
  | 'PLAYER_SELECTION'  // Lobby, joining
  | 'DRAFTING'          // Pick tiles (optional)
  | 'CAMPAIGN'          // Main gameplay
  | 'BUREAUCRACY'       // Between campaigns
  | 'GAME_OVER';        // Final scores

// Server manages phase transitions
const transitionPhase = async (roomId, newPhase) => {
  state.phase = newPhase;
  
  // Perform phase-specific initialization
  if (newPhase === 'CAMPAIGN') {
    initializeCampaignPieces(state);
  } else if (newPhase === 'BUREAUCRACY') {
    calculateBureaucracyTokens(state);
  }
  
  // Save and broadcast
  await db.query(
    `UPDATE kred_game_state SET game_state = ? WHERE room_id = ?`,
    [JSON.stringify(state), roomId]
  );
  
  io.to(`kred:${roomId}`).emit('kred:phase_change', {
    phase: newPhase,
    gameState: state
  });
};
```

### Phase-Specific UI

```typescript
// Main component renders different screens per phase
const renderGameScreen = () => {
  switch (gameState) {
    case 'DRAFTING':
      return <DraftingScreen {...props} />;
    
    case 'CAMPAIGN':
      return <CampaignScreen {...props} />;
    
    case 'BUREAUCRACY':
      return <BureaucracyScreen {...props} />;
    
    case 'GAME_OVER':
      return <GameOverScreen {...props} />;
    
    default:
      return <LoadingScreen />;
  }
};
```

### Sub-Phases within Main Phase

```typescript
// Campaign phase has sub-phases for tile transactions
type CampaignSubPhase = 
  | 'PLAYING'              // Active player selecting tile/receiver
  | 'RECEIVER_DECISION'    // Receiver accepts/rejects
  | 'CHALLENGER_DECISION'  // Bystander challenges/passes
  | 'BONUS_MOVE'           // After challenge, bonus movement
  | 'CORRECTION';          // After rejection, correction movement

// Track sub-phase separately from main phase
interface GameState {
  phase: GamePhase;
  campaignSubPhase?: CampaignSubPhase;
  receiverPlayerId?: number;
  challengerPlayerId?: number;
  bystanderIndex?: number;
  bystanders?: number[];
}

// Show different UI based on sub-phase
{gameState === 'CAMPAIGN' && (
  <>
    {campaignSubPhase === 'PLAYING' && <TilePlayUI />}
    {campaignSubPhase === 'RECEIVER_DECISION' && <ReceiverDecisionUI />}
    {campaignSubPhase === 'CHALLENGER_DECISION' && <ChallengerDecisionUI />}
    {campaignSubPhase === 'BONUS_MOVE' && <BonusMoveUI />}
    {campaignSubPhase === 'CORRECTION' && <CorrectionUI />}
  </>
)}
```

---

## Bystander/Challenge System

### Calculating Bystanders

**Pattern: Filter out active participants, sort by turn order**

```typescript
// SERVER - After receiver accepts tile
socket.on('kred:campaign:receiverDecision', async (data, callback) => {
  const { roomId, accepted } = data;
  
  if (accepted) {
    // Calculate who can challenge (not placer, not receiver)
    const bystanders = state.players
      .map((p, idx) => idx)  // Get indices
      .filter(idx => idx !== placerIndex && idx !== receiverIndex);
    
    // Sort by turn order starting after placer (clockwise)
    const sortedBystanders = [...bystanders].sort((a, b) => {
      const aDistance = (a - placerIndex + playerCount) % playerCount;
      const bDistance = (b - placerIndex + playerCount) % playerCount;
      return aDistance - bDistance;
    });
    
    state.bystanders = sortedBystanders;
    state.bystanderIndex = 0;
    state.currentPlayerIndex = sortedBystanders[0];
    state.campaignSubPhase = 'CHALLENGER_DECISION';
    
    // Broadcast
    io.to(`kred:${roomId}`).emit('kred:campaign:update', {
      campaignSubPhase: 'CHALLENGER_DECISION',
      currentPlayerIndex: state.currentPlayerIndex,
      bystanders: state.bystanders,
      bystanderIndex: state.bystanderIndex
    });
  }
});
```

### Advancing Through Bystanders

```typescript
// SERVER - After challenger passes
socket.on('kred:campaign:challengerDecision', async (data, callback) => {
  const { roomId, challenge } = data;
  
  if (!challenge) {
    // Advance to next bystander
    state.bystanderIndex++;
    
    if (state.bystanderIndex < state.bystanders.length) {
      // More bystanders remain
      state.currentPlayerIndex = state.bystanders[state.bystanderIndex];
      
      io.to(`kred:${roomId}`).emit('kred:campaign:update', {
        currentPlayerIndex: state.currentPlayerIndex,
        bystanderIndex: state.bystanderIndex
      });
    } else {
      // All passed, return to normal play
      state.currentPlayerIndex = receiverIndex;
      state.campaignSubPhase = 'PLAYING';
      state.bystanders = undefined;
      state.bystanderIndex = undefined;
      
      io.to(`kred:${roomId}`).emit('kred:campaign:update', {
        campaignSubPhase: 'PLAYING',
        currentPlayerIndex: state.currentPlayerIndex,
        bystanders: undefined,
        bystanderIndex: undefined
      });
    }
  }
});
```

### Client Display of Bystanders

```typescript
// Show who can still challenge
{campaignSubPhase === 'CHALLENGER_DECISION' && bystanders && (
  <div className="bystander-info">
    <p>Bystanders can challenge:</p>
    <ul>
      {bystanders.map((bystanderIdx, i) => (
        <li key={bystanderIdx}>
          Player {players[bystanderIdx].id}
          {i === bystanderIndex && ' ← Current'}
          {i < bystanderIndex && ' ✓ Passed'}
        </li>
      ))}
    </ul>
  </div>
)}
```

---

## State that's Shared vs Player-Private

### Shared State (Broadcast to All)

```typescript
// All players see the same:
- players: Player[]              // All player data
- pieces: Piece[]                // Board state
- boardTiles: Tile[]             // Played tiles
- currentPlayerIndex: number     // Whose turn
- phase: GamePhase              // Current phase
- campaignSubPhase: string      // Sub-phase
```

### Player-Private State (Not Shared)

```typescript
// Each player knows only their own:
- playerIndex: number           // Which player am I (from session)
- playerId: number              // My player ID
- socket: Socket                // My connection

// Note: In KRED, tiles are visible to all players
// In other games, you might have:
- hand: Tile[]                  // Hidden from other players
- secrets: Secret[]             // Player-only information
```

### Handling Private Data

**If game needs private data:**

```typescript
// SERVER - Send different data to each player
socket.on('kred:request:state', async (data, callback) => {
  const { roomId, playerId } = data;
  
  const [gameState] = await db.query(
    `SELECT game_state FROM kred_game_state WHERE room_id = ?`,
    [roomId]
  );
  
  const state = JSON.parse(gameState[0].game_state);
  
  // Remove private data from other players
  const sanitizedPlayers = state.players.map((player, idx) => {
    if (player.id === playerId) {
      // This player - include everything
      return player;
    } else {
      // Other players - hide private data
      return {
        ...player,
        hand: [],  // Don't show their hand
        secrets: undefined
      };
    }
  });
  
  callback({ 
    success: true, 
    state: { ...state, players: sanitizedPlayers }
  });
});
```

---

## Waiting States & Progress Indicators

### Waiting for Other Players

```typescript
// Show who we're waiting for
const getWaitingMessage = () => {
  if (campaignSubPhase === 'RECEIVER_DECISION') {
    return `Waiting for Player ${receiverPlayerId} to accept/reject...`;
  }
  
  if (campaignSubPhase === 'CHALLENGER_DECISION') {
    const challengerId = players[currentPlayerIndex]?.id;
    return `Waiting for Player ${challengerId} to challenge/pass...`;
  }
  
  if (!isMyTurn) {
    const currentPlayer = players[currentPlayerIndex];
    return `Waiting for Player ${currentPlayer.id}'s turn...`;
  }
  
  return null;
};

// Display waiting overlay
{!isMyTurn && (
  <div className="waiting-overlay">
    <div className="spinner" />
    <p>{getWaitingMessage()}</p>
  </div>
)}
```

### Active Player Indicator

```typescript
// Highlight whose turn it is
{players.map((player, idx) => (
  <div 
    key={player.id}
    className={`player-card ${idx === currentPlayerIndex ? 'active' : ''}`}
  >
    <h3>Player {player.id}</h3>
    {idx === currentPlayerIndex && <span className="turn-indicator">⭐ Current Turn</span>}
    {playerIndex === idx && <span className="you-indicator">👤 You</span>}
  </div>
))}
```

---

## State Synchronization Patterns

### Initial State on Game Load

```typescript
// CLIENT - On mount, request full state
useEffect(() => {
  if (!socket || !roomId) return;
  
  socket.emit('kred:request:state', { roomId, playerId }, (response) => {
    if (response.success && response.state) {
      // Restore ALL state from server
      setPlayers(response.state.players);
      setPieces(response.state.pieces);
      setBoardTiles(response.state.boardTiles);
      setGameState(response.state.phase);
      setCurrentPlayerIndex(response.state.currentPlayerIndex);
      setCampaignSubPhase(response.state.campaignSubPhase);
      setBystanders(response.state.bystanders);
      setBystanderIndex(response.state.bystanderIndex);
    }
  });
}, [socket, roomId, playerId]);
```

### Incremental Updates During Game

```typescript
// CLIENT - Listen for specific updates
socket.on('kred:campaign:update', (data) => {
  // Only update what changed
  if (data.players) setPlayers(data.players);
  if (data.boardTiles) setBoardTiles(data.boardTiles);
  if (data.currentPlayerIndex !== undefined) setCurrentPlayerIndex(data.currentPlayerIndex);
  if (data.campaignSubPhase) setCampaignSubPhase(data.campaignSubPhase);
  if (data.bystanders !== undefined) setBystanders(data.bystanders);
  if (data.bystanderIndex !== undefined) setBystanderIndex(data.bystanderIndex);
});

// Or full state replacement
socket.on('kred:campaign:update', (data) => {
  // Replace entire state (simpler but less efficient)
  setGameState(data);
});
```

---

## Testing Multiplayer Behavior

### Multi-Window Testing

```javascript
// Open 3 browser windows side-by-side
// Window 1: Player 1 (host)
// Window 2: Player 2
// Window 3: Player 3

// Test scenarios:
// 1. Player 1 plays tile to Player 2
//    - Player 1: Should see action happen
//    - Player 2: Should see accept/reject modal
//    - Player 3: Should see "Waiting for Player 2..."

// 2. Player 2 accepts
//    - All players: Should see tile in Player 2's area
//    - Player 3: Should see challenge/pass modal
//    - Players 1 & 2: Should see "Waiting for Player 3..."

// 3. Player 3 passes
//    - All players: Should see turn advance to Player 2
//    - Player 2: Can now play a tile
//    - Players 1 & 3: See "Waiting for Player 2..."
```

### Automated Multi-Client Tests

```typescript
describe('Multiplayer Turn Flow', () => {
  let server, client1, client2, client3;
  
  beforeEach(async () => {
    server = await startTestServer();
    [client1, client2, client3] = await Promise.all([
      createTestClient('Player1'),
      createTestClient('Player2'),
      createTestClient('Player3')
    ]);
    
    // All join same room
    await Promise.all([
      client1.joinRoom('test'),
      client2.joinRoom('test'),
      client3.joinRoom('test')
    ]);
    
    // Start game
    await client1.startGame('test', { draftTiles: false });
  });
  
  it('should show receiver decision only to receiver', async () => {
    // Player 1 plays tile to Player 2
    await client1.playTile({ tileId: 5, receiverId: 2 });
    
    // Wait for all clients to receive update
    await Promise.all([
      client1.waitFor('kred:campaign:update'),
      client2.waitFor('kred:campaign:update'),
      client3.waitFor('kred:campaign:update')
    ]);
    
    // Check each client's state
    const state1 = client1.getGameState();
    const state2 = client2.getGameState();
    const state3 = client3.getGameState();
    
    // All should see same phase
    expect(state1.campaignSubPhase).toBe('RECEIVER_DECISION');
    expect(state2.campaignSubPhase).toBe('RECEIVER_DECISION');
    expect(state3.campaignSubPhase).toBe('RECEIVER_DECISION');
    
    // But UI should only show modal to Player 2
    // (This would be tested in component tests)
  });
});
```

---

## Common Patterns Summary

### ✅ Do This

```typescript
// Use playerIndex for "who am I"
const isMe = playerIndex === targetPlayerIndex;

// Use currentPlayerIndex for "whose turn"
const isMyTurn = playerIndex === currentPlayerIndex;

// Show modals only to specific player
{currentPlayerId === targetPlayerId && <Modal />}

// Wait for server broadcast before updating
socket.emit('action', data);
socket.on('action:result', (result) => {
  setState(result);
});

// Calculate turn order server-side
const nextPlayer = (current + 1) % playerCount;
```

### ❌ Don't Do This

```typescript
// Don't confuse viewer with actor
const currentPlayerId = players[currentPlayerIndex].id;  // WRONG in multiplayer

// Don't show everything to everyone
{isReceiverDecisionPhase && <Modal />}  // Shows to all players!

// Don't update client state optimistically
socket.emit('action', data);
setLocalState(newState);  // Out of sync if server rejects

// Don't calculate turn order client-side
const nextPlayer = myPlayerIndex + 1;  // Each client calculates differently!
```

---

## Quick Reference

**Player Identity:**
- `playerIndex` = which player THIS client is (0-based)
- `playerId` = this client's player ID (1-based)
- `currentPlayerIndex` = whose turn it is
- `currentPlayerId` in multiplayer = `playerIndex + 1` (viewing player)
- `currentPlayerId` in single-player = `players[currentPlayerIndex].id` (active player)

**Visibility:**
- Modals: Only show to specific player (`currentPlayerId === targetId`)
- Actions: Only enable for current turn (`isMyTurn`)
- Hands: Show all but highlight/enable own (`isOwnHand`)

**Turn Management:**
- Server calculates next player
- Server broadcasts to all clients
- Clients update from broadcast
- Special cases: turn can jump to specific player (not sequential)

**Phases:**
- Main phases: PLAYER_SELECTION → DRAFTING → CAMPAIGN → BUREAUCRACY → GAME_OVER
- Sub-phases: Track within main phase for complex flows
- Server manages transitions and broadcasts

**Bystanders:**
- Calculate server-side after receiver accepts
- Filter out active participants
- Sort by turn order (clockwise)
- Advance through list as each passes/challenges

**Testing:**
- Always test with multiple clients
- Verify player-specific views
- Check waiting messages
- Ensure state stays synchronized
