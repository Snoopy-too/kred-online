# AI Playtesting Architecture for KRED

**Date**: 2026-04-06
**Status**: Draft
**Scope**: Two-layer automated playtesting system -- pure rules engine (Layer A) + Supabase integration (Layer B)

---

## Goal

Build a system where random-but-legal bots play complete KRED games to fuzz-test the rules engine and multiplayer sync pipeline. When a game violates an invariant, the system auto-exports a minimal Vitest test case for permanent regression coverage.

---

## Layer A: Rules Engine (Pure, In-Memory)

### The GameStateMachine (Reducer)

A pure function with no side effects:

```typescript
function gameReducer(state: KredGameState, action: KredAction): KredGameState
```

Takes the current game state and a player action, validates it, applies it, checks invariants, and returns the new state. Throws `InvariantViolation` if any game rule is broken.

#### KredGameState

Contains all information about a game in progress:

- **board**: Map of locationId -> piece (using existing format: `p1_seat3`, `p1_rostrum1`, `p1_office`, `community`). Every piece has an id, type (MARK/HEEL/PAWN), and owner context.
- **players**: Array of player objects, each containing:
  - `id`: Player number (1-based)
  - `hand`: Tiles still available to play this Campaign
  - `bankFaceDown`: Tiles in Bank counted for Bureaucracy funding
  - `bankFaceUp`: Tiles in Bank NOT counted for funding (exposed dishonest plays)
  - `credibility`: Integer 0-3 (3 = full)
  - `credibilityAtTurnStart`: Snapshot for zero-cred penalty rules
- **turn**: Current turn state:
  - `phase`: One of MOVING, SELECTING_TILE, AWAITING_RECEIPT, AWAITING_CHALLENGES, RESOLVING_OUTCOME, BUREAUCRACY, GAME_OVER
  - `moverId`: Who is making moves
  - `receiverId`: Who received the tile (set after SELECTING_TILE)
  - `movesExecuted`: Array of TrackedMove (pieceId, type, from, to)
  - `tilePlayedId`: Which tile the Mover placed face-down
  - `pendingBystanders`: Ordered list of player IDs who haven't decided yet (clockwise from receiver)
  - `challengerId`: Who challenged (if any)
- **campaign**: Campaign-level tracking:
  - `number`: Which Campaign this is (1-based)
  - `tilesRemainingTotal`: How many tiles are still in hands across all players
- **bureaucracy**: Bureaucracy-phase tracking:
  - `turnOrder`: Player IDs in descending funding order
  - `currentPlayerIndex`: Who is spending
  - `remainingFunding`: Map of playerId -> remaining kredcoins
- **config**: Static game config:
  - `playerCount`: 3, 4, or 5
  - `seed`: For deterministic tile dealing (reproducibility)
- **history**: Ordered array of every action dispatched (for replay/export)

#### KredAction (Discriminated Union)

Every decision point in the game:

| Action Type | Phase | Who | Payload |
|---|---|---|---|
| `MAKE_MOVES` | MOVING | Mover | `moves`: Array of 1-2 moves, each with `{ moveType, pieceId, fromLocationId, toLocationId }` |
| `SELECT_TILE` | SELECTING_TILE | Mover | `tileId`, `receiverPlayerId` |
| `RECEIVER_DECISION` | AWAITING_RECEIPT | Receiver | `decision`: ACCEPT, ACCEPT_BLIND, or REJECT |
| `BYSTANDER_DECISION` | AWAITING_CHALLENGES | Current bystander | `decision`: CHALLENGE or PASS |
| `RESOLVE_SUPPORT` | Any (auto-triggered) | Affected player | `pieceId`, `targetLocationId` (which seat/rostrum to drop to) |
| `BUREAUCRACY_PURCHASE` | BUREAUCRACY | Current spender | `menuItemId`, `targetPieceId?`, `targetLocationId?` |
| `END_BUREAUCRACY_TURN` | BUREAUCRACY | Current spender | (none) |

#### Reducer Responsibilities

For each action, the reducer:

1. **Validates phase**: Is this action type allowed in the current phase?
2. **Validates actor**: Is this the right player for this action?
3. **Validates legality**: Are the moves legal per game rules? (e.g., Remove only targets Marks in opponent Seats)
4. **Applies state change**: Updates board, credibility, tiles, etc.
5. **Auto-resolves outcomes**: When the last bystander passes (Quiet is Kept) or a challenge is made (Smoking Gun / Witch Hunt), the reducer applies the full outcome resolution:
   - Whistle Blown: Receiver rejects dishonest play -> Mover loses 1 cred, returns pieces, replays honestly; Receiver restores up to 2 cred (or free Advance if full)
   - Smoking Gun: Bystander challenges dishonest play -> Mover loses 1 cred, returns pieces, replays honestly; Challenger restores 1 cred or takes 1 Bureaucracy action; Receiver loses 1 cred
   - Witch Hunt: Bystander challenges honest play -> Mover restores 1 cred (unless had 0 at turn start); Challenger loses 1 cred
   - Quiet is Kept: No challenge -> tile goes face-down to Bank
6. **Auto-transitions phase**: Advances to next phase (e.g., after all bystanders pass -> next Mover's MOVING phase; after last tile played -> BUREAUCRACY)
7. **Auto-triggers support rule**: If any Rostrum/Office is unsupported after the state change, transitions to a RESOLVE_SUPPORT sub-phase for the affected player
8. **Checks invariants**: Runs the full invariant suite on the resulting state
9. **Appends to history**: Adds the action to `state.history`

#### Honesty Checking

When a tile is revealed (by rejection or challenge), the reducer determines honesty by comparing the Mover's `movesExecuted` against the tile's `requiredMoves` from `TILE_REQUIREMENTS`:

- All required move types present in executed moves -> **honest**
- Required move type(s) missing but impossible given board state -> **honest** (impossible moves forgiven)
- Required move type(s) missing and were possible -> **dishonest**
- Blank tile with no moves -> **honest**; blank tile with any moves -> always honest (any legal move is valid)

Uses existing functions: `areAllTileRequirementsMet()`, `canTileBeRejected()` from `packages/shared/src/game/tile-validation.ts`.

### Invariant Checker

Runs after every reducer call. Each check is a pure function `(state: KredGameState) -> InvariantResult`:

| # | Name | Check |
|---|---|---|
| 1 | `fundingChecksum` | Sum of ALL tile funding values (face-up + face-down + in hands) = 100 |
| 2 | `pieceConservation` | Count of all pieces (board + community) = starting count for this player mode |
| 3 | `supportRule` | No piece at a Rostrum with all 3 supporting Seats empty; no piece at Office with both Rostrums empty |
| 4 | `onePawnPerPlayer` | No player has >1 Pawn in their domain |
| 5 | `advancePrerequisites` | Piece at Rostrum implies at least 1 supporting Seat was occupied when it advanced (historical check via action history); piece at Office implies both Rostrums were occupied |
| 6 | `credibilityBounds` | Every player's credibility is integer 0-3 |
| 7 | `communityPiecePriority` | If a Heel was placed from Community this action, no Marks were in Community at that moment |
| 8 | `separatePiecesPerTurn` | If 2 moves were made this turn, they targeted different pieceIds |
| 9 | `removeRestrictions` | Any REMOVE action this turn targeted only a Mark at an opponent's Seat |
| 10 | `blankTileCannotWin` | If game is won and last tile played was BLANK, violation |
| 11 | `faceUpTilesExcluded` | Bureaucracy funding totals only include face-down Bank tiles |

Each invariant returns `{ passed: boolean, name: string, details?: string }`. On failure, the runner captures the full context.

### Random Bot

```typescript
function randomBot(state: KredGameState, playerId: number): KredAction
```

Examines the current phase and the player's role, then picks a random legal action:

**As Mover (MOVING phase)**:
1. Randomly pick a tile from hand (the "intended" tile)
2. Weighted coin flip: 70% honest, 30% bluff
3. If honest: identify the tile's required moves, find random valid targets on the board, return `MAKE_MOVES`
4. If bluffing: pick a different tile's required moves, find random valid targets, return `MAKE_MOVES`
5. If a required move is impossible (no valid targets), skip it (this is legal per the rules)

**As Mover (SELECTING_TILE phase)**:
1. If was honest: select the intended tile
2. If was bluffing: select any tile whose requirements DON'T match the moves made
3. Pick random opponent with tiles remaining as receiver
4. Return `SELECT_TILE`

**As Receiver (AWAITING_RECEIPT phase)**:
- If credibility = 0: must return `ACCEPT_BLIND` (no choice)
- If credibility > 0: weighted random -- 60% ACCEPT, 20% REJECT (only if play is dishonest; if honest, ACCEPT instead), 20% ACCEPT_BLIND
- Note: Receiver CAN see the tile (if they have credibility). Rejecting an honest play is not a legal action -- the Receiver sees it matches and places it face-down. The choice is only whether to expose a mismatch or accept it anyway.

**As Bystander (AWAITING_CHALLENGES phase)**:
- If credibility = 0: must return `PASS` (no choice)
- If credibility > 0: weighted random -- 80% PASS, 20% CHALLENGE

**During Bureaucracy**:
- List affordable items from the menu (3/4-player or 5-player pricing)
- Pick random affordable item, return `BUREAUCRACY_PURCHASE`
- When nothing is affordable or randomly decide to stop, return `END_BUREAUCRACY_TURN`

Decision weights are not strategically tuned. The goal is code path coverage, not competitive play.

### Game Runner

```typescript
function runGame(config: { playerCount: 3 | 4 | 5, seed?: number }): GameResult
```

Orchestrates one complete game:

1. **Initialize**: Create starting state -- place Marks at Seats 1, 3, 5 for each player; remaining pieces to Community; deal tiles to players using seeded RNG; all players at full credibility
2. **Campaign loop**:
   a. Determine current player and their role (Mover/Receiver/Bystander based on phase)
   b. Call `randomBot(state, playerId)` to get an action
   c. Call `gameReducer(state, action)` -- if `InvariantViolation` thrown, capture it and stop
   d. Check for win condition after outcome resolution
   e. If all tiles played, transition to Bureaucracy
3. **Bureaucracy loop**:
   a. Calculate funding, determine turn order
   b. Each player spends via `randomBot` decisions
   c. After all players done, check for win
   d. If no win, start next Campaign (same tiles, not re-dealt)
4. **Safety valve**: If total actions exceed 500, declare stalemate
5. **Return `GameResult`**:
   - `outcome`: WIN (with winnerId), DRAW (with player IDs), STALEMATE
   - `actions`: Full action history
   - `violations`: Array of InvariantViolation (empty if clean game)
   - `stats`: Campaign count, total actions, final board state
   - `config`: playerCount and seed (for reproduction)

### Test Exporter

When a violation occurs, exports a self-contained Vitest file:

```typescript
function exportFailingTest(result: GameResult, violation: InvariantViolation): string
```

Generates a file at `src/__tests__/generated/invariant_{N}_game_{seed}.test.ts` that:

1. Creates the initial state with the same seed
2. Replays every action up to and including the failing one
3. Asserts the failing action should not throw (if it does, the reducer correctly caught it) or asserts the resulting state passes the violated invariant (if it doesn't, the invariant check caught a reducer bug)

The generated test is deterministic -- same seed, same actions, same result every time.

### CLI Harness

Entry point: `src/scripts/playtest.ts`

Run via: `npm run playtest -- --games 500 --players 3`

Options:
- `--games N`: Number of games to run (default: 100)
- `--players 3|4|5`: Player count (default: runs all three)
- `--seed N`: Starting seed (default: timestamp-based, printed for reproduction)
- `--verbose`: Print each action as it happens

Output:
```
KRED Playtest: 500 games, 3 players, seed 1712419200
Game 1: P2 wins (Campaign 4, 87 actions)
Game 2: P1 wins (Campaign 6, 134 actions)
Game 3: FAIL invariant 3 (support rule) at action 52
  -> Exported: src/__tests__/generated/invariant_3_seed_1712419202.test.ts
...
Results: 497 passed, 3 failed, 0 stalemate
Average: 4.2 campaigns/game, 98 actions/game
Tests exported: 3 files
```

### Vitest Safety Net

File: `src/__tests__/playtest/fuzz.test.ts`

```typescript
describe('fuzz: random bot games', () => {
  it.each([3, 4, 5])('completes 10 random %d-player games without invariant violations', (playerCount) => {
    for (let i = 0; i < 10; i++) {
      const result = runGame({ playerCount, seed: i });
      expect(result.violations).toEqual([]);
      expect(result.outcome).not.toBe('STALEMATE');
    }
  });
});
```

Runs 30 games (10 per player mode) as part of `npm run test`. Uses fixed seeds 0-9 so results are deterministic in CI.

---

## Layer B: Supabase Integration Testing

Built after Layer A is stable. Tests the full multiplayer pipeline using the hosted Supabase project.

### Architecture

A Node.js script that creates real Supabase clients and plays through the same game engine over the network.

**Setup** (per test run):
1. Create 3 anonymous Supabase Auth sessions (one per bot)
2. Bot 1 creates a lobby via `kred_lobbies` insert (becomes host)
3. Bots 2-3 join via `kred_players` insert
4. Host bot starts the game

**Host bot**:
1. Holds the authoritative `GameStateMachine` state
2. Subscribes to `kred_game_actions` for guest actions (same channel pattern as `GameStateSynchronizer`)
3. On action received: dispatch to reducer, write updated state to `kred_game_states`, broadcast via Realtime channel `kred_game:{lobbyId}`

**Guest bots**:
1. Subscribe to broadcast channel `kred_game:{lobbyId}`
2. On state received: deserialize, call `randomBot()` if it's their turn, insert action to `kred_game_actions`

**What this validates**:
- RLS policies correctly allow player actions and block unauthorized writes
- Realtime broadcast delivers state packets to all subscribers
- `GameStatePacket` serialization round-trips without data loss
- Action deduplication prevents double-processing
- State version tracking rejects stale updates
- Rejoin recovery: mid-game, kill a guest bot's subscription, recreate it, verify it catches up from `kred_game_states`

**Scope**: Maximum 10 games per run against hosted Supabase. Uses same invariant checks as Layer A.

### Vitest Integration

File: `src/__tests__/playtest/integration.test.ts`

```typescript
describe('integration: Supabase multiplayer', () => {
  it('completes a 3-player game through Supabase', async () => {
    const result = await runSupabaseGame({ playerCount: 3, seed: 42 });
    expect(result.violations).toEqual([]);
    expect(result.outcome).not.toBe('STALEMATE');
  }, 60_000); // 60s timeout for network play
});
```

Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables. Skips gracefully if not set (so `npm run test` still works locally without Supabase credentials).

---

## File Structure

```
src/
  engine/
    types.ts                  -- KredGameState, KredAction, GameResult, InvariantViolation
    gameStateMachine.ts       -- gameReducer(), createInitialState()
    invariants.ts             -- All invariant check functions
    randomBot.ts              -- randomBot()
    gameRunner.ts             -- runGame()
    testExporter.ts           -- exportFailingTest()
    supabaseRunner.ts         -- runSupabaseGame() (Layer B)
  scripts/
    playtest.ts               -- CLI entry point (npm run playtest)
  __tests__/
    engine/
      gameStateMachine.test.ts  -- Unit tests for the reducer
      invariants.test.ts        -- Unit tests for invariant checks
      randomBot.test.ts         -- Bot produces legal actions
    playtest/
      fuzz.test.ts              -- 30-game safety net (Layer A)
      integration.test.ts       -- Supabase integration (Layer B)
    generated/                  -- Auto-exported failing tests (gitignored until reviewed)
```

New `package.json` script:
```json
{
  "playtest": "tsx src/scripts/playtest.ts"
}
```

---

## Reuse of Existing Code

The engine imports heavily from `packages/shared/src/`:

| Existing module | What we reuse |
|---|---|
| `config/rules.ts` | `TILE_REQUIREMENTS`, `DEFINED_MOVES`, `TILE_PLAY_OPTIONS` |
| `config/tiles.ts` | `TILE_KREDCOIN_VALUES` |
| `config/bureaucracy.ts` | `THREE_FOUR_PLAYER_BUREAUCRACY_MENU`, `FIVE_PLAYER_BUREAUCRACY_MENU` |
| `config/constants.ts` | `TOTAL_TILES`, `PLAYER_OPTIONS` |
| `rules/adjacency.ts` | `areSeatsAdjacent()`, `getAdjacentSeats()`, `canMoveFromCommunity()` |
| `game/tile-validation.ts` | `areAllTileRequirementsMet()`, `canTileBeRejected()`, `getTileRequirements()` |
| `types/move.ts` | `DefinedMoveType`, `MoveRequirementType` |
| `types/player.ts` | Player-related types |

The engine does NOT reuse the React handlers (`src/handlers/`). It implements game logic independently to avoid UI coupling. Once the engine is stable, the handlers could optionally be refactored to use the engine internally.

---

## What This Does NOT Cover

- **Strategic bot intelligence**: Bots play randomly, not optimally. This tests rules, not strategy.
- **UI testing**: No browser, no React components. This tests logic only.
- **Tile drafting**: Initial tile assignment is randomized, not the pass-left draft. Drafting is a UI/UX flow, not a rules concern.
- **Handler refactoring**: The existing React handlers remain untouched. The engine is additive.
