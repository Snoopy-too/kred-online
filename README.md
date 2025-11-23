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
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run all tests:
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
├── game/            # Game initialization logic
│   └── initialization.ts  # Player & piece setup functions
├── utils/           # Pure utility functions
│   ├── array.ts        # Array operations (shuffle)
│   ├── formatting.ts   # Location ID formatting
│   └── positioning.ts  # Piece rotation & positioning
├── components/      # React components
└── __tests__/       # Comprehensive test suite
    ├── config/         # Config module tests (282 tests)
    ├── types/          # Type validation tests (26 tests)
    ├── utils/          # Utility function tests (62 tests)
    ├── game/           # Game logic tests (34 tests)
    └── *.test.tsx      # Integration tests (55 tests)
```

See [REFACTORING_STRATEGY_V2.md](REFACTORING_STRATEGY_V2.md) for detailed architecture documentation.

## Current Status

- ✅ **459 tests passing** (55 integration + 404 unit)
- ✅ **Phase 1**: Test infrastructure complete
- ✅ **Phase 2**: Config extraction complete (6 modules, 282 tests)
- ✅ **Phase 3**: Type extraction complete (3 modules, 26 tests)
- ✅ **Phase 4**: Game initialization complete (1 module, 34 tests)
- ✅ **25.3% reduction** in game.ts size (from 3,803 to 2,841 lines)
- 🚀 **Next**: Phase 5 - Game logic extraction

## Development Workflow

This project follows a test-driven, incremental refactoring approach:

1. **Write tests first** for existing functionality
2. **Extract modules atomically** - one function/type/config at a time
3. **No backwards compatibility** - update all imports immediately
4. **Verify everything**: build + tests + dev server after each change
5. **Commit frequently** with clear, descriptive messages

### Refactoring Progress

Track the ongoing refactoring in [REFACTORING_PROGRESS.md](REFACTORING_PROGRESS.md):
- **Phase 2**: Config extraction - 6 modules, 282 tests ✅
- **Phase 3**: Type extraction - 3 modules, 26 tests ✅
- **Phase 4**: Game initialization - 1 module, 34 tests ✅
- **Phase 5**: Game logic extraction - In planning

See [REFACTORING_STRATEGY_V2.md](REFACTORING_STRATEGY_V2.md) for the complete refactoring strategy.

## Game Features

### Player Selection
- Choose 3, 4, or 5 players
- Test mode for debugging
- Options to skip phases

### Drafting Phase
- Players draft tiles from a shared pool
- Keep/discard mechanics
- Strategic hand building

### Campaign Phase
- Play tiles for other players
- Move pieces (Marks, Heels, Pawns) on the board
- Challenge system with credibility
- Win conditions based on piece positions

### Bureaucracy Phase
- Purchase moves, promotions, and credibility
- Strategic resource management
- Additional win conditions

## Future Development

- [ ] Complete Phase 5: Extract remaining game logic functions
- [ ] Multiplayer support via Socket.IO
- [ ] Game state persistence
- [ ] Player profiles and statistics
- [ ] Mobile responsive design
- [ ] Sound effects and animations
- [ ] Performance optimizations

## Contributing

This is currently a private project undergoing systematic refactoring. Progress is tracked in `REFACTORING_PROGRESS.md`. All changes follow the strategy outlined in `REFACTORING_STRATEGY_V2.md`.

## License

Private - All rights reserved
