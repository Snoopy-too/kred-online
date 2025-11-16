# Kred Game - Production Refactoring & Deployment Plan

## Project Overview

**Current State:**

- Tile-based strategy game
- 8,023 lines across 2 files (App.tsx: 4,526 lines, game.ts: 3,497 lines)
- Functional game logic with complex state management
- Local multiplayer only
- No server infrastructure

**Target State:**

- Professional, maintainable codebase with proper separation of concerns
- Rails 8 backend wrapper for multiplayer functionality
- Action Cable WebSocket integration for real-time gameplay
- PostgreSQL + ActiveRecord for user/game state persistence
- Kamal deployment to Hetzner servers
- Fully testable architecture (unit, integration, e2e)

---

## Repository Structure

### Phase 1: Initialize Documentation & Context System

```
/
├── claude.md                          # This file - project initialization & context
├── docs/                              # Living documentation
│   ├── architecture/
│   │   ├── game-logic.md             # Core game mechanics documentation
│   │   ├── api-design.md             # Rails API endpoints
│   │   ├── websocket-protocol.md     # Action Cable message format
│   │   └── database-schema.md        # PostgreSQL schema & relationships
│   ├── development/
│   │   ├── setup-guide.md            # Local dev environment setup
│   │   ├── testing-strategy.md       # Test philosophy & patterns
│   │   └── deployment-guide.md       # Kamal deployment procedures
│   ├── game-rules/
│   │   ├── overview.md               # High-level game concept
│   │   ├── tile-definitions.md       # All 24 tiles + blank tile
│   │   ├── piece-movements.md        # Legal moves & adjacency rules
│   │   └── win-conditions.md         # Victory requirements
│   └── archives/                      # Completed refactoring iterations
│       ├── 2025-01-15-initial-split.md
│       ├── 2025-01-16-rails-integration.md
│       └── README.md                  # Archive index
├── frontend/                          # React/TypeScript game client
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/                           # Rails 8 API
│   ├── app/
│   ├── config/
│   ├── db/
│   ├── Gemfile
│   └── README.md
├── config/
│   └── deploy.yml                    # Kamal deployment config
└── README.md                         # Project README
```

---

## Frontend Architecture (React/TypeScript)

### Directory Structure

```
frontend/
├── src/
│   ├── components/                   # React components
│   │   ├── game/
│   │   │   ├── Board/
│   │   │   │   ├── Board.tsx         # Main game board container
│   │   │   │   ├── BoardBackground.tsx
│   │   │   │   ├── BoardPiece.tsx    # Draggable game pieces
│   │   │   │   ├── BoardTile.tsx     # Placed tiles on board
│   │   │   │   └── DropZone.tsx      # Valid drop locations
│   │   │   ├── Player/
│   │   │   │   ├── PlayerHand.tsx    # Tile hand display
│   │   │   │   ├── PlayerDomain.tsx  # Seats/Rostrums/Office
│   │   │   │   ├── PlayerStats.tsx   # Kredcoin, Credibility
│   │   │   │   └── PlayerPerspective.tsx  # Camera rotation handler
│   │   │   ├── Phases/
│   │   │   │   ├── DraftingPhase.tsx
│   │   │   │   ├── CampaignPhase.tsx
│   │   │   │   ├── BureaucracyPhase.tsx
│   │   │   │   └── PhaseIndicator.tsx
│   │   │   ├── Actions/
│   │   │   │   ├── TilePlayOptions.tsx
│   │   │   │   ├── MoveValidator.tsx
│   │   │   │   ├── ChallengeInterface.tsx
│   │   │   │   └── BureaucracyMenu.tsx
│   │   │   └── UI/
│   │   │       ├── GameStatus.tsx
│   │   │       ├── AlertDialog.tsx
│   │   │       ├── TurnIndicator.tsx
│   │   │       └── WinConditionDisplay.tsx
│   │   ├── lobby/
│   │   │   ├── GameLobby.tsx         # Pre-game room
│   │   │   ├── PlayerList.tsx
│   │   │   ├── GameSettings.tsx
│   │   │   └── RoomCode.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── game/                         # Core game logic (pure TypeScript)
│   │   ├── types/
│   │   │   ├── index.ts              # Re-export all types
│   │   │   ├── board.ts              # Board, Tile, Piece interfaces
│   │   │   ├── player.ts             # Player, GameState types
│   │   │   ├── moves.ts              # TrackedMove, PlayedTileState
│   │   │   └── bureaucracy.ts        # Bureaucracy phase types
│   │   ├── config/
│   │   │   ├── constants.ts          # PLAYER_OPTIONS, PIECE_TYPES
│   │   │   ├── board-layouts/
│   │   │   │   ├── three-player.ts   # 3P drop locations
│   │   │   │   ├── four-player.ts    # 4P drop locations
│   │   │   │   └── five-player.ts    # 5P drop locations
│   │   │   ├── tiles.ts              # TILE_REQUIREMENTS definitions
│   │   │   ├── moves.ts              # DEFINED_MOVES, TILE_PLAY_OPTIONS
│   │   │   └── adjacency.ts          # SEAT_ADJACENCY mappings
│   │   ├── rules/
│   │   │   ├── move-validation.ts    # validateMove, validateTileRequirements
│   │   │   ├── win-conditions.ts     # checkBureaucracyWinCondition
│   │   │   ├── adjacency.ts          # areSeatsAdjacent, getRostrumSupportingSeats
│   │   │   ├── credibility.ts        # handleCredibilityLoss
│   │   │   └── challenge.ts          # getChallengeOrder, challenge resolution
│   │   ├── state/
│   │   │   ├── initialization.ts     # initializePlayers, initializePieces
│   │   │   ├── snapshot.ts           # createGameStateSnapshot
│   │   │   └── calculations.ts       # calculatePieceRotation, calculatePlayerKredcoin
│   │   ├── phases/
│   │   │   ├── drafting.ts           # Draft phase logic
│   │   │   ├── campaign.ts           # Campaign phase logic
│   │   │   └── bureaucracy.ts        # Bureaucracy phase logic
│   │   └── utils/
│   │       ├── location.ts           # formatLocationId, getLocationIdFromPosition
│   │       ├── positioning.ts        # findNearestVacantLocation
│   │       └── turn-order.ts         # getTileReceivingOrder, getBureaucracyTurnOrder
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios/fetch wrapper
│   │   │   ├── games.ts              # Game CRUD endpoints
│   │   │   ├── moves.ts              # Move submission endpoints
│   │   │   └── auth.ts               # Authentication (future)
│   │   ├── websocket/
│   │   │   ├── connection.ts         # Action Cable connection
│   │   │   ├── game-channel.ts       # Game room channel
│   │   │   └── message-handlers.ts   # Inbound message routing
│   │   └── storage/
│   │       └── local-game.ts         # LocalStorage for offline mode
│   │
│   ├── hooks/
│   │   ├── useGame.ts                # Main game state hook
│   │   ├── useWebSocket.ts           # WebSocket connection hook
│   │   ├── useDragAndDrop.ts         # Piece dragging logic
│   │   ├── usePlayerPerspective.ts   # Camera/rotation handling
│   │   └── useGameValidation.ts      # Client-side validation
│   │
│   ├── context/
│   │   ├── GameContext.tsx           # Global game state
│   │   └── WebSocketContext.tsx      # WebSocket provider
│   │
│   ├── utils/
│   │   ├── test-helpers.ts           # Testing utilities
│   │   └── dev-tools.ts              # Development debugging tools
│   │
│   ├── App.tsx                       # Root component (~150 lines)
│   ├── main.tsx                      # Entry point
│   └── vite.config.ts                # Vite configuration
│
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── boards/                   # Board background images
│   │   ├── tiles/                    # Tile SVGs (01.svg - 24.svg, blank.svg)
│   │   └── pieces/                   # Piece images (heel, mark, pawn)
│   └── index.html
│
└── tests/
    ├── unit/                         # Jest unit tests
    │   ├── game/
    │   │   ├── rules/
    │   │   ├── state/
    │   │   └── utils/
    │   └── components/
    ├── integration/                  # Component integration tests
    └── e2e/                          # Playwright end-to-end tests
```

### Key Design Principles

1. **Pure Game Logic**: All game rules in `/game` are pure functions with no React dependencies
2. **Framework Agnostic Core**: Game logic can be tested independently and potentially ported
3. **Smart/Dumb Components**: Components receive props, game logic lives in hooks/context
4. **Single Responsibility**: Each module has ONE clear purpose
5. **Dependency Injection**: Pass dependencies explicitly for easier testing

### File Size Targets

- Components: 50-200 lines
- Game logic modules: 100-300 lines
- Configuration files: 200-500 lines (data-heavy is acceptable)
- Hooks: 50-150 lines
- Test files: 100-400 lines (comprehensive tests can be longer)

---

## Backend Architecture (Rails 8)

### Directory Structure

```
backend/
├── app/
│   ├── channels/
│   │   ├── application_cable/
│   │   │   ├── channel.rb
│   │   │   └── connection.rb
│   │   └── game_channel.rb           # Real-time game updates
│   │
│   ├── controllers/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── games_controller.rb      # CRUD for games
│   │   │       ├── moves_controller.rb      # Submit/validate moves
│   │   │       ├── players_controller.rb    # Player management
│   │   │       └── lobbies_controller.rb    # Pre-game lobbies
│   │   └── health_controller.rb             # Health check endpoint
│   │
│   ├── models/
│   │   ├── game.rb                   # Game instance
│   │   ├── player.rb                 # Player in a game
│   │   ├── move.rb                   # Move history
│   │   ├── tile.rb                   # Tile state
│   │   └── game_state.rb             # Serialized game state (JSONB)
│   │
│   ├── services/
│   │   ├── games/
│   │   │   ├── creator.rb            # Create new game
│   │   │   ├── state_manager.rb      # Sync game state
│   │   │   └── finalizer.rb          # End game, calculate results
│   │   ├── moves/
│   │   │   ├── validator.rb          # Server-side move validation
│   │   │   ├── executor.rb           # Apply move to game state
│   │   │   └── broadcaster.rb        # Broadcast move to players
│   │   └── lobbies/
│   │       ├── match_maker.rb        # Find/create lobbies
│   │       └── room_code_generator.rb
│   │
│   ├── jobs/
│   │   ├── cleanup_abandoned_games_job.rb
│   │   └── prune_old_games_job.rb
│   │
│   └── serializers/
│       ├── game_serializer.rb
│       ├── player_serializer.rb
│       └── move_serializer.rb
│
├── config/
│   ├── routes.rb                     # API routes
│   ├── cable.yml                     # Action Cable config
│   ├── database.yml                  # PostgreSQL config
│   └── deploy.yml                    # Kamal deployment
│
├── db/
│   ├── migrate/
│   │   ├── 20250115_create_games.rb
│   │   ├── 20250115_create_players.rb
│   │   ├── 20250115_create_moves.rb
│   │   └── 20250115_create_game_states.rb
│   ├── seeds.rb
│   └── schema.rb
│
├── spec/                             # RSpec tests
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── channels/
│   └── integration/
│
├── Gemfile
├── Gemfile.lock
├── Rakefile
└── README.md
```

### Database Schema (PostgreSQL)

```ruby
# db/schema.rb

create_table :games do |t|
  t.string :room_code, null: false, index: { unique: true }
  t.integer :player_count, null: false
  t.string :status, null: false, default: 'waiting'  # waiting, in_progress, completed, abandoned
  t.string :current_phase, default: 'player_selection'  # player_selection, drafting, campaign, bureaucracy
  t.integer :current_player_turn
  t.datetime :started_at
  t.datetime :completed_at
  t.integer :winner_id
  t.jsonb :settings, default: {}  # test_mode, skip_draft, skip_campaign
  t.timestamps
end

create_table :players do |t|
  t.references :game, null: false, foreign_key: true
  t.integer :player_number, null: false  # 1-5
  t.string :session_id  # For anonymous players
  t.integer :credibility, default: 7
  t.jsonb :hand, default: []  # Array of tile IDs
  t.jsonb :kept_tiles, default: []
  t.jsonb :bureaucracy_tiles, default: []
  t.boolean :connected, default: true
  t.datetime :last_action_at
  t.timestamps

  t.index [:game_id, :player_number], unique: true
end

create_table :moves do |t|
  t.references :game, null: false, foreign_key: true
  t.references :player, null: false, foreign_key: true
  t.integer :turn_number, null: false
  t.string :phase, null: false  # campaign, bureaucracy
  t.string :move_type, null: false  # ADVANCE, REMOVE, etc.
  t.string :piece_id
  t.string :from_location_id
  t.string :to_location_id
  t.jsonb :metadata, default: {}  # Additional move context
  t.boolean :validated, default: false
  t.boolean :challenged, default: false
  t.integer :challenged_by_player_id
  t.timestamps

  t.index [:game_id, :turn_number]
end

create_table :game_states do |t|
  t.references :game, null: false, foreign_key: true
  t.integer :turn_number, null: false
  t.jsonb :pieces, default: []  # All piece positions
  t.jsonb :board_tiles, default: []  # Placed tiles on board
  t.string :snapshot_reason  # 'tile_played', 'bureaucracy_start', 'challenge_resolution'
  t.timestamps

  t.index [:game_id, :turn_number]
end
```

### API Endpoints

```ruby
# config/routes.rb

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Games
      post   '/games',           to: 'games#create'          # Create new game
      get    '/games/:room_code', to: 'games#show'           # Get game state
      patch  '/games/:room_code', to: 'games#update'         # Update game settings
      delete '/games/:room_code', to: 'games#destroy'        # Abandon game

      # Players
      post   '/games/:room_code/join', to: 'players#join'    # Join game as player
      delete '/games/:room_code/leave', to: 'players#leave'  # Leave game

      # Moves
      post   '/games/:room_code/moves', to: 'moves#create'   # Submit move
      get    '/games/:room_code/moves', to: 'moves#index'    # Get move history
      post   '/games/:room_code/challenge', to: 'moves#challenge'  # Challenge move
      post   '/games/:room_code/accept', to: 'moves#accept'  # Accept tile

      # Lobbies (future)
      get    '/lobbies/active', to: 'lobbies#index'          # List open lobbies
      post   '/lobbies/quick_match', to: 'lobbies#quick_match'  # Quick play
    end
  end

  # Health check
  get '/health', to: 'health#show'

  # WebSocket
  mount ActionCable.server => '/cable'
end
```

### Action Cable WebSocket Protocol

```ruby
# app/channels/game_channel.rb

class GameChannel < ApplicationCable::Channel
  def subscribed
    game = Game.find_by(room_code: params[:room_code])
    return reject unless game

    stream_for game
    broadcast_player_joined
  end

  def unsubscribed
    broadcast_player_left
  end

  # Client → Server messages
  def move(data)
    # { type: 'move', piece_id: 'p1_heel_1', from: 'community1', to: 'p1_seat1' }
    handle_move(data)
  end

  def play_tile(data)
    # { type: 'play_tile', tile_id: '01', target_player_id: 2, option: 'A' }
    handle_tile_play(data)
  end

  def challenge(data)
    # { type: 'challenge', challenger_id: 3 }
    handle_challenge(data)
  end

  def accept_tile(data)
    # { type: 'accept' }
    handle_acceptance(data)
  end
end

# Server → Client messages (broadcasted):
# - player_joined: { type: 'player_joined', player: { id: 2, ... } }
# - player_left: { type: 'player_left', player_id: 2 }
# - game_started: { type: 'game_started', game_state: { ... } }
# - move_made: { type: 'move_made', move: { ... }, updated_state: { ... } }
# - tile_played: { type: 'tile_played', tile_id: '01', player_id: 2, ... }
# - tile_accepted: { type: 'tile_accepted', ... }
# - challenge_initiated: { type: 'challenge_initiated', challenger_id: 3 }
# - challenge_resolved: { type: 'challenge_resolved', result: 'upheld/rejected', ... }
# - phase_changed: { type: 'phase_changed', new_phase: 'bureaucracy', ... }
# - game_ended: { type: 'game_ended', winner_id: 1, final_state: { ... } }
```

---

## Refactoring Strategy

### Phase 1: Split Monolithic Files (Week 1)

**Goal**: Break App.tsx and game.ts into logical modules without changing functionality.

**Approach**:

1. Create new directory structure
2. Extract pure functions first (easiest, no dependencies)
3. Extract type definitions
4. Extract configuration/constants
5. Move components one at a time
6. Test after each major extraction

**Order of Extraction**:

From `game.ts` (3,497 lines → ~20 files):

1. `types/` - All interfaces and type definitions (300 lines)
2. `config/constants.ts` - Player options, piece types (100 lines)
3. `config/board-layouts/` - Drop locations by player count (800 lines)
4. `config/tiles.ts` - TILE_REQUIREMENTS (300 lines)
5. `config/moves.ts` - DEFINED_MOVES, TILE_PLAY_OPTIONS (400 lines)
6. `config/adjacency.ts` - SEAT_ADJACENCY (200 lines)
7. `rules/adjacency.ts` - Adjacent seat/rostrum logic (200 lines)
8. `rules/move-validation.ts` - Move validation functions (500 lines)
9. `rules/win-conditions.ts` - Win checking logic (100 lines)
10. `rules/credibility.ts` - Credibility mechanics (100 lines)
11. `rules/challenge.ts` - Challenge resolution (200 lines)
12. `state/initialization.ts` - Game setup (300 lines)
13. `state/calculations.ts` - Derived state calculations (150 lines)
14. `state/snapshot.ts` - State snapshot creation (100 lines)
15. `phases/` - Phase-specific logic (400 lines)
16. `utils/` - Helper functions (200 lines)

From `App.tsx` (4,526 lines → ~30 components):

1. Extract all UI components into `components/shared/`
2. Extract phase-specific components into `components/game/Phases/`
3. Extract board components into `components/game/Board/`
4. Extract player components into `components/game/Player/`
5. Create hooks for state management
6. Create context providers
7. Final App.tsx becomes ~150 lines (just composition)

**Testing During Extraction**:

- Run game in browser after each major extraction
- Verify all features still work (draft, campaign, bureaucracy, challenges)
- Add unit tests for extracted pure functions
- Keep original files as backup until fully tested

**Success Criteria**:

- ✅ Game plays identically to original
- ✅ No file exceeds 500 lines
- ✅ All game logic has unit tests
- ✅ Components are in logical groups
- ✅ Clear separation of concerns

### Phase 2: Rails Backend Skeleton (Week 2)

**Goal**: Create Rails 8 app with basic API structure and database schema.

**Steps**:

1. Initialize Rails 8 app: `rails new backend --api --database=postgresql`
2. Set up database schema (games, players, moves, game_states)
3. Create models with validations and associations
4. Build API controllers with basic CRUD
5. Set up Action Cable for WebSocket support
6. Create health check endpoint
7. Write RSpec tests for models and controllers

**Deliverables**:

- ✅ Rails app boots successfully
- ✅ Database migrations run cleanly
- ✅ API returns JSON responses
- ✅ WebSocket connection works
- ✅ All tests passing

### Phase 3: Frontend-Backend Integration (Week 3)

**Goal**: Connect React frontend to Rails backend via REST API and WebSockets.

**Steps**:

1. Create API client service in frontend
2. Implement WebSocket connection hook
3. Replace local state with API calls
4. Synchronize game state via WebSockets
5. Handle reconnection logic
6. Add loading states and error handling
7. Test multiplayer across different browsers

**Deliverables**:

- ✅ Games created via API
- ✅ Players can join via room code
- ✅ Real-time move synchronization
- ✅ Game state persists in database
- ✅ Graceful handling of disconnects

### Phase 4: Testing Suite (Week 4)

**Goal**: Achieve >80% test coverage across frontend and backend.

**Frontend Tests**:

- Jest unit tests for all game logic functions
- React Testing Library for component tests
- Playwright for end-to-end game flow

**Backend Tests**:

- RSpec model tests (validations, associations)
- Controller tests (request/response)
- Channel tests (WebSocket messages)
- Integration tests (full game flow)

**Critical Test Cases**:

- Win condition detection
- Challenge mechanics
- Move validation
- Phase transitions
- Credibility loss
- Bureaucracy purchases

### Phase 5: Production Deployment (Week 5)

**Goal**: Deploy to Hetzner using Kamal with SSL, monitoring, and backups.

**Steps**:

1. Configure Kamal deployment
2. Set up Docker images
3. Configure PostgreSQL on Hetzner
4. Configure Solid Cache and Solid Queue (Rails 8)
5. Configure SSL with Let's Encrypt
6. Set up monitoring (error tracking, performance)
7. Configure automated backups
8. Test deployment process
9. Document rollback procedures

---

## Kamal Deployment Configuration

### Infrastructure Setup

**Hetzner Server Requirements**:

- CPX31 or CCX23 (4 vCPU, 8GB RAM minimum)
- Ubuntu 24.04 LTS
- PostgreSQL 16
- Docker installed

### Kamal Configuration

```yaml
# config/deploy.yml

service: kred-game

image: your-registry/kred-game

servers:
  web:
    - your-hetzner-server-ip

registry:
  server: registry.your-domain.com
  username: registry-user
  password:
    - KAMAL_REGISTRY_PASSWORD

env:
  clear:
    RAILS_ENV: production
  secret:
    - POSTGRES_PASSWORD
    - SECRET_KEY_BASE

traefik:
  options:
    publish:
      - "443:443"
    volume:
      - "/letsencrypt:/letsencrypt"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    certificatesResolvers.letsencrypt.acme.email: "your-email@example.com"
    certificatesResolvers.letsencrypt.acme.storage: "/letsencrypt/acme.json"
    certificatesResolvers.letsencrypt.acme.httpchallenge: true
    certificatesResolvers.letsencrypt.acme.httpchallenge.entrypoint: web

accessories:
  db:
    image: postgres:16-alpine
    host: your-hetzner-server-ip
    port: 5432
    env:
      clear:
        POSTGRES_DB: kred_production
      secret:
        - POSTGRES_PASSWORD
    directories:
      - data:/var/lib/postgresql/data
```

### Deployment Commands

```bash
# Initial setup
kamal setup

# Deploy updates
kamal deploy

# Check status
kamal app logs
kamal app exec 'bin/rails console'

# Rollback
kamal rollback

# Access Rails console
kamal app exec -i 'bin/rails console'

# Database migrations
kamal app exec 'bin/rails db:migrate'
```

### Frontend Build & Deployment

```yaml
# Frontend served via Rails as static assets
# Build process in Dockerfile:

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ruby:3.3-alpine
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist /app/public
COPY backend/Gemfile* ./
RUN bundle install
COPY backend/ ./
CMD ["bin/rails", "server", "-b", "0.0.0.0"]
```

---

## Testing Strategy

### Unit Tests (Jest - Frontend)

```typescript
// frontend/tests/unit/game/rules/move-validation.test.ts

import { validateMove, DefinedMoveType } from "@/game/rules/move-validation";
import { createMockGameState } from "@/utils/test-helpers";

describe("Move Validation", () => {
  describe("ADVANCE move", () => {
    it("validates community → seat move", () => {
      const gameState = createMockGameState({ playerCount: 4 });
      const result = validateMove({
        moveType: DefinedMoveType.ADVANCE,
        fromLocation: "community1",
        toLocation: "p1_seat1",
        playerId: 1,
        gameState,
      });

      expect(result.valid).toBe(true);
    });

    it("rejects move to occupied seat", () => {
      const gameState = createMockGameState({
        playerCount: 4,
        occupiedSeats: ["p1_seat1"],
      });
      const result = validateMove({
        moveType: DefinedMoveType.ADVANCE,
        fromLocation: "community1",
        toLocation: "p1_seat1",
        playerId: 1,
        gameState,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("occupied");
    });
  });
});
```

### Integration Tests (RSpec - Backend)

```ruby
# backend/spec/services/moves/validator_spec.rb

RSpec.describe Moves::Validator do
  let(:game) { create(:game, :in_progress, player_count: 4) }
  let(:player) { game.players.first }

  describe '#validate_move' do
    context 'with valid ADVANCE move' do
      let(:move_params) do
        {
          move_type: 'ADVANCE',
          piece_id: 'p1_heel_1',
          from_location_id: 'community1',
          to_location_id: 'p1_seat1'
        }
      end

      it 'returns success' do
        result = described_class.new(game, player).validate_move(move_params)
        expect(result).to be_success
      end
    end

    context 'with invalid move to occupied seat' do
      before do
        game.current_state.pieces << { id: 'p1_mark_1', location_id: 'p1_seat1' }
      end

      let(:move_params) do
        {
          move_type: 'ADVANCE',
          from_location_id: 'community1',
          to_location_id: 'p1_seat1'
        }
      end

      it 'returns failure with error message' do
        result = described_class.new(game, player).validate_move(move_params)
        expect(result).to be_failure
        expect(result.error).to include('occupied')
      end
    end
  end
end
```

### End-to-End Tests (Playwright)

```typescript
// frontend/tests/e2e/full-game.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Full Game Flow", () => {
  test("complete 4-player game with winner", async ({ page, context }) => {
    // Create game
    await page.goto("/");
    await page.click("text=New Game");
    await page.click("text=4 Players");
    await page.click("text=Start Game");

    // Get room code
    const roomCode = await page
      .locator('[data-testid="room-code"]')
      .textContent();

    // Open 3 more browser contexts for other players
    const player2 = await context.newPage();
    const player3 = await context.newPage();
    const player4 = await context.newPage();

    // Join game with other players
    await player2.goto(`/?room=${roomCode}`);
    await player3.goto(`/?room=${roomCode}`);
    await player4.goto(`/?room=${roomCode}`);

    // Wait for all players
    await expect(page.locator("text=4/4 Players")).toBeVisible();

    // Draft phase
    await page.click('[data-testid="tile-01"]');
    await player2.click('[data-testid="tile-02"]');
    // ... continue drafting

    // Campaign phase - play tiles and moves
    await page.click('[data-testid="play-tile-btn"]');
    await page.selectOption('[data-testid="target-player"]', "2");
    await page.click('[data-testid="confirm-play"]');

    // Verify tile received
    await expect(player2.locator("text=Tile Received")).toBeVisible();

    // Player 2 performs required moves
    await player2.dragAndDrop(
      '[data-testid="piece-community1"]',
      '[data-testid="drop-p2-seat1"]'
    );
    await player2.click('[data-testid="confirm-moves"]');

    // Continue playing until win condition
    // ...

    // Verify winner announcement
    await expect(page.locator("text=Player 1 has won the game!")).toBeVisible();
  });
});
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repo
git clone <repo-url>
cd kred-game

# Checkout production branch
git checkout -b production

# Backend setup
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev

# Run tests
npm test                    # Frontend tests
cd ../backend && rspec      # Backend tests
```

### Daily Development

```bash
# Start all services
docker-compose up  # (or separate terminals for Rails + Vite)

# Watch frontend tests
npm run test:watch

# Watch backend tests
bundle exec guard

# Check code quality
npm run lint
rubocop

# Format code
npm run format
rubocop -a
```

### Git Workflow

```bash
# Feature branches off production
git checkout production
git pull origin production
git checkout -b feature/bureaucracy-refactor

# Commit frequently with clear messages
git commit -m "Extract bureaucracy menu logic to separate module"

# Push and create PR
git push -u origin feature/bureaucracy-refactor

# After review and CI passes, merge to production
```

---

## Monitoring & Observability

### Error Tracking

- Sentry for frontend exceptions
- Sentry for Rails exceptions
- Custom error tracking for game rule violations

### Performance Monitoring

- Web Vitals (CLS, FID, LCP)
- API response times
- WebSocket latency
- Database query performance

### Logging

- Structured JSON logs
- Game event audit trail
- Player action logs
- Error logs with context

### Metrics to Track

- Active games
- Players online
- Average game duration
- Win rate by player position
- Challenge success rate
- API endpoint performance
- WebSocket connection stability

---

## Documentation Maintenance

### Architecture Decision Records (ADRs)

Create ADRs in `docs/architecture/decisions/` for major decisions:

```markdown
# ADR 001: Use Action Cable for Real-time Game State

## Status

Accepted

## Context

Need real-time synchronization of game state across multiple players.

## Decision

Use Rails Action Cable with Solid Cache for WebSocket connections.

## Consequences

- Built into Rails 8, minimal setup
- Solid Cache provides persistent storage without Redis
- Solid Queue handles background jobs natively
- Consistent with rest of Rails stack

* WebSocket connection management complexity
* May need horizontal scaling strategy for high traffic
```

### Living Documentation

Keep docs up-to-date:

- Update architecture diagrams after major changes
- Document new API endpoints immediately
- Keep deployment guide current
- Archive old decisions in `/docs/archives/`

---

## Migration Checklist

### Phase 1: Split Files ✅

- [ ] Create new directory structure
- [ ] Extract types from game.ts
- [ ] Extract configuration constants
- [ ] Extract board layouts
- [ ] Extract tile/move definitions
- [ ] Extract adjacency logic
- [ ] Extract rule validation functions
- [ ] Extract state management
- [ ] Extract phase logic
- [ ] Extract utility functions
- [ ] Break up App.tsx into components
- [ ] Create hooks for state management
- [ ] Set up context providers
- [ ] Write unit tests for game logic
- [ ] Verify game plays identically
- [ ] Delete old monolithic files

### Phase 2: Rails Backend ✅

- [ ] Initialize Rails 8 API app
- [ ] Create database schema
- [ ] Build models with validations
- [ ] Create API controllers
- [ ] Set up Action Cable
- [ ] Create service objects
- [ ] Write RSpec tests
- [ ] Set up CI pipeline
- [ ] Verify API responds correctly

### Phase 3: Integration ✅

- [ ] Create frontend API client
- [ ] Implement WebSocket hooks
- [ ] Connect game creation to API
- [ ] Sync game state via WebSocket
- [ ] Handle player joins/leaves
- [ ] Implement move submission
- [ ] Add error handling
- [ ] Test cross-browser multiplayer
- [ ] Verify state persistence

### Phase 4: Testing ✅

- [ ] Write Jest unit tests (>80% coverage)
- [ ] Write React component tests
- [ ] Write RSpec model tests
- [ ] Write RSpec controller tests
- [ ] Write channel integration tests
- [ ] Write Playwright e2e tests
- [ ] Test all game phases
- [ ] Test challenge mechanics
- [ ] Test win conditions
- [ ] Load testing

### Phase 5: Deployment ✅

- [ ] Configure Kamal deploy.yml
- [ ] Set up Hetzner server
- [ ] Install Docker
- [ ] Set up PostgreSQL
- [ ] Configure Solid Cache and Solid Queue
- [ ] Configure SSL certificates
- [ ] Test deployment process
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Document rollback procedure
- [ ] Perform canary deployment
- [ ] Full production deployment

---

## Success Metrics

### Code Quality

- No file exceeds 500 lines
- Test coverage >80%
- Zero critical linting errors
- Type safety throughout (TypeScript strict mode)

### Performance

- Page load <2s
- API response time <200ms (p95)
- WebSocket latency <100ms (p95)
- Game state update <50ms

### Reliability

- 99.5% uptime
- <1% error rate
- Graceful degradation on disconnect
- Zero data loss on crashes

### Developer Experience

- New developer onboarding <1 day
- Clear separation of concerns
- Easy to test locally
- Fast CI/CD pipeline (<10 min)

---

## Future Enhancements

### Post-Launch Features

- User accounts & authentication
- Match history & statistics
- Ranked matchmaking
- Spectator mode
- Replay system
- In-game chat
- Mobile-responsive design
- AI opponents

### Technical Improvements

- GraphQL API (replace REST)
- Server-side rendering (Next.js?)
- Progressive Web App (PWA)
- WebAssembly game engine
- Kubernetes orchestration (scale beyond Kamal)

---

## Conclusion

This refactoring plan transforms a working prototype into a production-ready multiplayer game. The key is **incremental progress** - each phase builds on the previous, with testing at every step.

**Next Steps**:

1. Initialize this document in the repo
2. Create docs directory structure
3. Begin Phase 1: Extract types from game.ts
4. Test continuously
5. Ship often

**Philosophy**:

> "Make it work, make it right, make it fast" - Kent Beck

The game works. Now let's make it right (maintainable, testable, deployable), then make it fast (optimized, scaled).

---

## Contact & Support

- Project Lead: [Your Name]
- Repository: [GitHub URL]
- Documentation: `/docs`
- Issues: [GitHub Issues]

**Let's build something great! 🎮**
