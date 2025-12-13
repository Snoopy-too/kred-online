# KRED Online

A digital implementation of the KRED board game built with React and TypeScript.

## About

KRED is a strategic board game featuring:

- **3-5 player support** with dynamic board layouts
- **Three game phases**: Player Selection → Drafting → Campaign → Bureaucracy
- **Strategic piece movement** with Marks, Heels, and Pawns
- **Tile-based gameplay** with kredcoin economy
- **Challenge system** with credibility mechanics

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Vitest** - Unit/integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3003/KRED/](http://localhost:3003/KRED/)

### Testing

#### Unit & Integration Tests

Run all unit/integration tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests without watch mode (useful for CI):

```bash
npm test -- --run
```

**Current test count: 1,071 tests** across 46 test files

#### End-to-End (E2E) Tests

E2E tests use Playwright to test real browser interactions, drag-and-drop, and complete user workflows.

**Prerequisites:**
- Start the dev server first: `npm run dev`

Run E2E tests:

```bash
npm run test:e2e              # Run all E2E tests (headless)
npm run test:e2e:ui           # Run with Playwright UI (interactive)
npm run test:e2e:debug        # Run in debug mode (step through)
npm run test:e2e:headed       # Run with visible browser
```

Run E2E tests with timing and verbosity:

```bash
time npm run test:e2e -- --reporter=list --workers=1
```

**Current E2E test count: 7 tests** (~12 seconds execution time)

Run all tests (unit + integration + E2E):

```bash
npm run test:all
```

**See [docs/E2E_TESTING_PLAN.md](docs/E2E_TESTING_PLAN.md) for detailed E2E testing strategy.**

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

The project follows a modular architecture with clear separation of concerns:

```
src/
├── config/          # Game configuration and constants
│   ├── constants.ts    # Player options, board images
│   ├── tiles.ts        # Tile images and kredcoin values
│   ├── pieces.ts       # Piece types and counts
│   ├── board.ts        # Board layouts for 3/4/5 players
│   ├── rules.ts        # Game rules and move definitions
│   └── bureaucracy.ts  # Bureaucracy phase menus
├── types/           # TypeScript type definitions
│   ├── game.ts         # Core game state types
│   ├── move.ts         # Move and action types
│   ├── piece.ts        # Piece types
│   ├── player.ts       # Player types
│   ├── tile.ts         # Tile types
│   ├── bureaucracy.ts  # Bureaucracy types
│   ├── challenge.ts    # Challenge state types
│   └── played-tile.ts  # Played tile tracking
├── game/            # Game logic functions
│   ├── initialization.ts   # Player & piece setup
│   ├── move-calculation.ts # Move validation & calculation
│   ├── move-types.ts       # Move type handlers
│   ├── bureaucracy.ts      # Bureaucracy phase logic
│   └── state-management.ts # Game state operations
├── rules/           # Game rule validation
│   ├── adjacency.ts        # Adjacency calculations
│   ├── credibility.ts      # Credibility system
│   ├── move-validation.ts  # Move legality checks
│   ├── rostrum-support.ts  # Rostrum support rules
│   └── win-conditions.ts   # Victory validation
├── hooks/           # Custom React hooks
│   ├── useCredibilitySystem.ts
│   ├── useDraftingPhase.ts
│   ├── useBureaucracyPhase.ts
│   └── useCampaignPhase.ts
├── utils/           # Pure utility functions
│   ├── array.ts        # Array operations (shuffle)
│   ├── formatting.ts   # Location ID formatting
│   └── positioning.ts  # Piece rotation & positioning
├── components/      # React components
│   ├── screens/        # Main game screens
│   └── shared/         # Reusable components
└── __tests__/       # Comprehensive test suite (1,071 tests)
    ├── config/         # Config module tests (282 tests)
    ├── types/          # Type validation tests (26 tests)
    ├── utils/          # Utility function tests (62 tests)
    ├── game/           # Game logic tests (159 tests)
    ├── rules/          # Rules validation tests (263 tests)
    ├── hooks/          # Hooks tests (122 tests)
    └── components/     # Component tests (157 tests)

tests/
└── e2e/             # End-to-end tests (7 tests)
    ├── helpers/        # E2E test utilities
    │   ├── game-setup.ts      # Game navigation helpers
    │   ├── drag-drop.ts       # Drag-and-drop helpers
    │   └── assertions.ts      # Custom E2E assertions
    └── drag-drop.spec.ts      # Drag-and-drop test suite
```

See [REFACTORING_STRATEGY_V2.md](REFACTORING_STRATEGY_V2.md) for detailed architecture documentation.

## Current Status

### Test Coverage
- ✅ **1,071 unit/integration tests passing**
  - 282 config tests
  - 263 rules validation tests
  - 159 game logic tests
  - 157 component tests
  - 122 hooks tests
  - 62 utility tests
  - 26 type tests
- ✅ **7 E2E tests passing** (~12 seconds)
- ✅ **Total: 1,078 tests** across the entire codebase

### Refactoring Progress
- ✅ **Phase 1-7**: Complete (hooks extraction, rules, game logic)
- ✅ **76.9% reduction** in App.tsx (from 4,262 to 984 lines)
- ✅ **Modular architecture** with clear separation of concerns
- 🚀 **Next**: Phase 8 - Handler extraction from App.tsx

See [REFACTORING_PROGRESS.md](REFACTORING_PROGRESS.md) for detailed progress tracking.

## Development Workflow

This project follows a test-driven, incremental refactoring approach:

1. **Write tests first** for existing functionality
2. **Extract modules atomically** - one function/type/config at a time
3. **No backwards compatibility** - update all imports immediately
4. **Verify everything**: build + tests + dev server after each change
5. **Commit frequently** with clear, descriptive messages

### Key Development Notes

From [CLAUDE.md](CLAUDE.md):

- Always run tests with `npm test -- --run` (prevents watch mode hanging)
- Current test count: **1,071 tests** across 46 test files
- Project structure: configs → types → game logic → rules → hooks → components
- E2E tests require dev server running: `npm run dev` before `npm run test:e2e`

### Refactoring Phases

Track the ongoing refactoring in [REFACTORING_PROGRESS.md](REFACTORING_PROGRESS.md):

- **Phase 1**: Test infrastructure ✅
- **Phase 2**: Config extraction (6 modules, 282 tests) ✅
- **Phase 3**: Type extraction (3 modules, 26 tests) ✅
- **Phase 4**: Game initialization (1 module, 34 tests) ✅
- **Phase 5**: Game logic extraction (4 modules, 159 tests) ✅
- **Phase 6**: Rules extraction (5 modules, 263 tests) ✅
- **Phase 7**: Hooks extraction (4 modules, 122 tests) ✅
- **Phase 8**: Handler extraction (in planning)

See [REFACTORING_STRATEGY_V2.md](REFACTORING_STRATEGY_V2.md) for the complete refactoring strategy.

## Game Features

### Player Selection

- Choose 3, 4, or 5 players
- Test mode for debugging
- Options to skip phases (draft/campaign)

### Drafting Phase

- Players draft tiles from a shared pool
- Keep/discard mechanics
- Strategic hand building
- Tile count varies by player count (3p: 8 tiles, 4p: 6 tiles, 5p: 4 tiles + blank)

### Campaign Phase

- Play tiles for other players
- Move pieces (Marks, Heels, Pawns) on the board
- Drag-and-drop piece movement
- Challenge system with credibility
- Win conditions based on piece positions

### Bureaucracy Phase

- Purchase moves, promotions, and credibility
- Strategic resource management
- Additional win conditions
- Kredcoin economy

## Testing Strategy

### Unit & Integration Tests (Vitest)
- **Pure function testing** - Config, types, utils, game logic, rules
- **Component testing** - React Testing Library for UI components
- **Hook testing** - Custom hook behavior validation
- **Integration testing** - Multi-phase game flows
- **Fast execution** - ~2.5 minutes for all 1,071 tests

### E2E Tests (Playwright)
- **Real browser testing** - Chromium, Firefox, WebKit support
- **Drag-and-drop validation** - Real browser D&D API (not simulated)
- **Visual testing** - Screenshot regression capabilities
- **Complete workflows** - Full game flows from start to finish
- **Fast execution** - ~12 seconds for 7 tests
- **See [docs/E2E_TESTING_PLAN.md](docs/E2E_TESTING_PLAN.md)** for comprehensive strategy

### Test Pyramid
```
       E2E Tests (7 tests, 12 sec)
      /  Real browser workflows  \
     /___________________________\
    /                             \
   /  Integration Tests (157)      \
  /   Component + Hook testing      \
 /_________________________________\
/                                   \
/  Unit Tests (914)                  \
/   Pure logic, configs, rules       \
/___________________________________\

Total: 1,078 tests
```

## Future Development

- [ ] Complete Phase 8: Extract handlers from App.tsx
- [ ] Add more E2E tests (visual regression, performance)
- [ ] Multiplayer support via Socket.IO
- [ ] Game state persistence
- [ ] Player profiles and statistics
- [ ] Mobile responsive design improvements
- [ ] Sound effects and animations
- [ ] Performance optimizations

## Contributing

This is currently a private project undergoing systematic refactoring. Progress is tracked in `REFACTORING_PROGRESS.md`. All changes follow the strategy outlined in `REFACTORING_STRATEGY_V2.md`.

## License

Private - All rights reserved
