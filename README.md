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

The project follows a hybrid architecture combining traditional React patterns with game-specific organization:

```
src/
├── config/          # Game configuration (tiles, pieces, board layouts)
├── types/           # TypeScript type definitions
├── game/            # Core game logic (pure functions)
├── rules/           # Game rules enforcement
├── components/      # React components
├── hooks/           # Custom React hooks
├── contexts/        # React Context providers
├── services/        # External services (future: socket.io)
├── utils/           # Helper utilities
└── __tests__/       # Test files (mirrors src structure)
```

See [REFACTORING_STRATEGY_V2.md](REFACTORING_STRATEGY_V2.md) for detailed architecture documentation.

## Current Status

- ✅ **88 tests passing** (55 integration + 33 unit)
- ✅ **Test infrastructure** complete with vitest
- ✅ **Phase 2 (Config extraction)** partially complete
- ⏳ **Refactoring in progress** - extracting board layouts and rules

## Development Workflow

This project follows a test-driven, incremental refactoring approach:

1. **Write tests first** for existing functionality
2. **Extract one file at a time** with verification
3. **Commit frequently** with atomic changes
4. **Verify everything**: tests + build + dev server

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

- [ ] Multiplayer support via Socket.IO
- [ ] Game state persistence
- [ ] Player profiles and statistics
- [ ] Mobile responsive design
- [ ] Sound effects and animations

## Contributing

This is currently a private project. Refactoring is in progress following the strategy outlined in `REFACTORING_STRATEGY_V2.md`.

## License

Private - All rights reserved
