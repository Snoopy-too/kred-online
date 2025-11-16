# Kred - Strategic Tile-Based Political Game

A strategic game of honesty, deception, and political maneuvering for 3-5 players. Compete to build influence through tile-based gameplay, strategic piece movement, and calculated bluffing. As long as you don't get caught, anything goes!

## Game Overview

**Players**: 3-5 players compete simultaneously

**Objective**: Be the first to achieve all three win conditions:
- Control a Rostrum (elevated political position)
- Control an Office (administrative power)
- Have at least one piece in an opponent's domain

**Mechanics**:
- Draft tiles with special abilities
- Play tiles on opponents to force their moves
- Move your pieces strategically (Heels, Marks, Pawns)
- Use Kredcoin to purchase political positions
- Challenge dishonest plays to penalize opponents

## Quick Start

### Prerequisites
- Node.js (v18 or higher)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game will be available at `http://localhost:5173`

## Current Status

**Version**: 0.0.0 (Development)

**Current State**: Working prototype with local multiplayer

**In Progress**: Production refactoring (Phase 1)
- Splitting monolithic codebase into modular structure
- Preparing for backend integration
- See [PRDOUCTION_PLAN.md](PRDOUCTION_PLAN.md) for details

## Game Phases

1. **Player Selection** - Choose 3-5 players
2. **Drafting Phase** - Players draft tiles for their hand
3. **Campaign Phase** - Play tiles and move pieces
4. **Bureaucracy Phase** - Purchase seats, rostrums, and offices with Kredcoin

## Project Structure

```
kred-online/
├── App.tsx                     # Main React application (4,526 lines)
├── game.ts                     # Core game logic (3,497 lines)
├── dev_images/                 # Game assets (boards, tiles, pieces)
├── PRDOUCTION_PLAN.md         # Comprehensive refactoring roadmap
├── claude.md                   # AI context document
└── package.json                # Dependencies
```

**Note**: Currently undergoing refactoring to split into modular architecture. See production plan for target structure.

## Roadmap

- [x] Working game prototype
- [ ] **Phase 1**: Split monolithic files into modules (In Progress)
- [ ] **Phase 2**: Rails 8 backend with PostgreSQL
- [ ] **Phase 3**: Frontend-backend integration via WebSockets
- [ ] **Phase 4**: Comprehensive testing suite
- [ ] **Phase 5**: Production deployment to Hetzner with Kamal

## Documentation

- [Production Plan](PRDOUCTION_PLAN.md) - Detailed refactoring and deployment strategy
- [Claude Context](claude.md) - Project context for AI assistants
- [Game Rules](PRDOUCTION_PLAN.md#game-mechanics-summary) - Complete game mechanics

## Tech Stack

**Current**:
- React 19.1.0
- TypeScript 5.8.2
- Vite 6.2.0

**Planned**:
- Rails 8 (API backend)
- PostgreSQL (database)
- Action Cable (WebSockets)
- Solid Cache (caching)
- Solid Queue (background jobs)
- Kamal (deployment)

## Development

```bash
# Run development server with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Production build
npm run build
```

## Contributing

This project is currently in active refactoring. Please see [PRDOUCTION_PLAN.md](PRDOUCTION_PLAN.md) before contributing.

## Branch Strategy

- `main` - Stable working version
- `production` - Active refactoring branch
- `claude/merge-to-main-*` - Feature branches

## License

[Add License Information]

---

**Current Phase**: Phase 1 - Modularization
**Last Updated**: 2025-01-15
