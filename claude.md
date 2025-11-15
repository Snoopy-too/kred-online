# Kred Game - Claude AI Context Document

## Project Overview

**Kred** is a tile-based strategy game of honesty, deception, and political maneuvering for 3-5 players. Players compete to build influence through strategic tile placement, piece movement, and calculated bluffing across a shared board.

**Current Status**: Working prototype with 8,023 lines of code across 2 main files, undergoing production refactoring.

**Tech Stack**:
- Frontend: React 19, TypeScript, Vite
- Backend (planned): Rails 8, PostgreSQL, Action Cable
- Deployment (planned): Kamal to Hetzner servers

---

## Current Architecture

### Monolithic Structure (Pre-refactoring)

The game currently exists in two main files:

1. **App.tsx** (4,526 lines) - All React components and UI logic
2. **game.ts** (3,497 lines) - All game rules, state management, and validation

**Why Refactor?**
- Difficult to maintain and test
- Poor separation of concerns
- Hard for new developers to understand
- Impossible to scale or deploy as multiplayer

---

## Game Mechanics Summary

### Core Concepts

- **Players**: 3-5 players compete simultaneously
- **Pieces**: Each player controls Heels (leaders), Marks (supporters), and Pawns (workers)
- **Tiles**: 24 unique tiles with special abilities, plus blank tiles
- **Board**: Shared hexagonal/grid board with seats, rostrums, offices, and community areas
- **Kredcoin**: Virtual currency for purchasing political advantages
- **Credibility**: Players start with 7 credibility; lose it through dishonest moves or challenges

### Game Phases

1. **Player Selection**: Choose number of players (3-5)
2. **Drafting Phase**: Players draft tiles for their hand
3. **Campaign Phase**: Players take turns playing tiles on opponents and moving pieces
4. **Bureaucracy Phase**: Players use Kredcoin to buy seats, rostrums, and offices

### Win Conditions

A player wins by achieving **all three** of the following:
- Control a Rostrum (elevated political position)
- Control an Office (administrative power)
- Have at least one piece in an opponent's domain (infiltration)

### Tile System

- Each tile (numbered 01-24) has specific requirements and effects
- Tiles can:
  - Force piece movements
  - Remove pieces from play
  - Grant Kredcoin
  - Manipulate board state
  - Provide strategic advantages

### Challenge Mechanics

- Players can challenge tile plays they believe are dishonest
- Challenger loses 1 credibility if wrong
- Challenged player loses 1 credibility if dishonest
- Losing all credibility results in elimination

---

## Refactoring Plan (5 Phases)

See [PRODUCTION_PLAN.md](PRDOUCTION_PLAN.md) for comprehensive details.

### Phase 1: Split Monolithic Files (Current)

**Goal**: Break App.tsx and game.ts into modular, testable files

**Target Structure**:
```
frontend/src/
├── components/     # React UI components (~30 files)
├── game/           # Pure game logic (~20 files)
├── hooks/          # React state hooks
├── context/        # Global state providers
└── services/       # API/WebSocket clients (future)
```

**Success Criteria**:
- No file exceeds 500 lines
- Game plays identically to original
- All game logic has unit tests
- Clear separation of concerns

### Phase 2: Rails Backend Skeleton

Create Rails 8 API with:
- PostgreSQL database schema
- REST API endpoints
- Action Cable for WebSockets
- Game state persistence

### Phase 3: Frontend-Backend Integration

Connect React to Rails:
- WebSocket real-time sync
- Move submission via API
- Multi-player support
- State persistence

### Phase 4: Testing Suite

Achieve >80% test coverage:
- Jest for game logic
- React Testing Library for components
- RSpec for Rails backend
- Playwright for e2e tests

### Phase 5: Production Deployment

Deploy to Hetzner using Kamal:
- Docker containerization
- SSL with Let's Encrypt
- PostgreSQL + Redis
- Monitoring and backups

---

## Current Branch Strategy

- `main`: Latest working version (local multiplayer only)
- `production`: Refactoring branch (current work)
- Feature branches: Created off `production` for specific refactoring tasks

---

## Key Files & Locations

### Main Game Files (Pre-refactoring)
- [App.tsx](App.tsx) - All React components (4,526 lines)
- [game.ts](game.ts) - All game logic (3,497 lines)
- [package.json](package.json) - Dependencies and scripts
- [vite.config.ts](vite.config.ts) - Vite build configuration

### Documentation
- [PRDOUCTION_PLAN.md](PRDOUCTION_PLAN.md) - Comprehensive refactoring plan
- [claude.md](claude.md) - This file (AI context)
- [README.md](README.md) - Project overview

### Assets
- `dev_images/` - Game board backgrounds, tile images, piece graphics

---

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Strategy

**Current**: Manual testing in browser
**Future**: Automated unit, integration, and e2e tests

---

## Important Context for AI Assistants

### When Working on This Project

1. **Preserve Game Logic**: The game works correctly. Any refactoring MUST maintain identical behavior.

2. **Test After Every Change**: Always verify the game still plays correctly after extracting code.

3. **Pure Functions First**: Extract pure functions (no side effects) before stateful components.

4. **Incremental Changes**: Small, testable changes are better than large rewrites.

5. **File Size Targets**:
   - Components: 50-200 lines
   - Game logic: 100-300 lines
   - Config files: 200-500 lines (data-heavy is OK)

6. **Naming Conventions**:
   - Components: PascalCase (e.g., `BoardPiece.tsx`)
   - Utilities: camelCase (e.g., `validateMove.ts`)
   - Constants: UPPER_SNAKE_CASE (e.g., `TILE_REQUIREMENTS`)

### Key Game Logic Concepts to Understand

**Location IDs**: Format like `p1_seat1`, `p2_rostrum1`, `community1`
- Format: `{playerPrefix}_{locationType}{number}`
- Used throughout for piece positioning

**Piece IDs**: Format like `p1_heel_1`, `p3_mark_2`
- Format: `{playerPrefix}_{pieceType}_{index}`
- Each player has multiple heels, marks, and pawns

**Tile Requirements**: Each tile specifies:
- Which pieces can be moved
- Where they can move from/to
- How many moves are required
- Special conditions or effects

**Adjacency Rules**: Complex logic for determining which seats/rostrums are adjacent
- Different layouts for 3, 4, and 5 players
- Critical for move validation

### Common Pitfalls to Avoid

1. **Don't Break Move Validation**: The most complex part of the game
2. **Preserve Player Rotation**: Camera/perspective rotation must work correctly
3. **Maintain Bureaucracy Logic**: Win condition checking is subtle
4. **Keep Challenge System Intact**: Credibility management is fragile
5. **Don't Lose Tile Requirements**: 24 tiles × multiple options = lots of data

---

## Questions to Ask the User

Before making significant changes:

1. **Scope**: "Should I extract just types, or also start on configuration files?"
2. **Testing**: "Do you want me to write tests as I extract, or after?"
3. **Breaking Changes**: "This change will require updating 15 files. Proceed?"
4. **Architecture**: "I see two ways to structure this. Which do you prefer?"

---

## Project Goals

### Immediate (Phase 1)
- Clean, maintainable codebase
- Testable game logic
- Developer-friendly structure

### Short-term (Phases 2-3)
- Online multiplayer support
- Game state persistence
- Room-based matchmaking

### Long-term (Phases 4-5)
- Production deployment
- User accounts
- Match history and statistics
- Ranked play

---

## Current Phase Status

**Phase 1: Split Monolithic Files** ✅ IN PROGRESS

**Next Steps**:
1. Create frontend directory structure
2. Extract types from game.ts
3. Extract configuration constants
4. Extract board layouts
5. Continue systematic extraction...

**Branch**: `production`
**Last Updated**: 2025-01-15

---

## Notes for Future Work

### After Phase 1 Completion
- Document extracted module boundaries
- Archive refactoring decisions
- Update this document with new structure

### Technical Debt to Address
- TypeScript strict mode compliance
- Accessibility improvements
- Mobile responsiveness
- Performance optimization

### Features to Consider
- AI opponents
- Replay system
- Spectator mode
- In-game chat
- Tutorial mode

---

## Contact & Resources

- **Repository**: [Add GitHub URL]
- **Documentation**: `/docs` directory
- **Production Plan**: [PRDOUCTION_PLAN.md](PRDOUCTION_PLAN.md)
- **Issues**: Track in GitHub Issues

---

**Last Updated**: 2025-01-15
**Phase**: 1 (Split Monolithic Files)
**Status**: In Progress
**Branch**: production
