# Claude Development Notes

## Testing

- **Run tests**: Use `npm test -- --run` to run tests without watch mode
  - The `--run` flag prevents vitest from hanging in watch mode after tests complete
  - Always verify all tests pass before committing changes

## Current Test Count

- **1056 tests** across 46 test files (as of Phase 7g completion)

## Project Structure

Key directories:

- `src/config/` - Static game configuration (board layouts, piece counts, rules)
- `src/types/` - TypeScript type definitions
- `src/game/` - Core game logic functions
- `src/rules/` - Game rule validation
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/components/` - React components
- `src/__tests__/` - Test files (mirrors src structure)

## Refactoring Status

- **Phase 7**: Complete (hooks extraction)
- **Phase 8**: Planned (handler extraction from App.tsx - see PHASE_8_PLAN.md)

## Important Files

- `game.ts` - Main game logic (being reduced through refactoring)
- `App.tsx` - Main React component (4100+ lines, target for Phase 8)
- `REFACTORING_PROGRESS.md` - Detailed progress tracking
- `REFACTORING_STRATEGY_V2.md` - Overall refactoring plan
