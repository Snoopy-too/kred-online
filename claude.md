# Claude Development Notes

## Testing

### Unit & Integration Tests (Vitest)

- **Run tests**: Use `npm test -- --run` to run tests without watch mode
  - The `--run` flag prevents vitest from hanging in watch mode after tests complete
  - Always verify all tests pass before committing changes
- **Test with UI**: `npm run test:ui` for interactive test interface
- **Test with coverage**: `npm run test:coverage` for coverage reports

### E2E Tests (Playwright)

- **Prerequisites**: Start dev server first with `npm run dev`
- **Run E2E tests**: `npm run test:e2e` (headless mode)
- **Interactive mode**: `npm run test:e2e:ui` (Playwright UI)
- **Debug mode**: `npm run test:e2e:debug` (step through tests)
- **Headed mode**: `npm run test:e2e:headed` (visible browser)
- **Timed execution**: `time npm run test:e2e -- --reporter=list --workers=1`

### Current Test Count

- **1,071 unit/integration tests** across 46 test files
- **7 E2E tests** (~12 seconds execution time)
- **Total: 1,078 tests**

## Project Structure

Key directories:

- `src/config/` - Static game configuration (board layouts, piece counts, rules)
- `src/types/` - TypeScript type definitions
- `src/game/` - Core game logic functions
- `src/rules/` - Game rule validation
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/components/` - React components
- `src/__tests__/` - Unit/integration test files (mirrors src structure)
- `tests/e2e/` - End-to-end tests with Playwright
  - `tests/e2e/helpers/` - E2E test utilities (game-setup, drag-drop, assertions)

## Refactoring Status

- **Phase 7**: Complete (hooks extraction)
- **Phase 8**: Planned (handler extraction from App.tsx - see PHASE_8_PLAN.md)

## Important Files

- `game.ts` - Main game logic (being reduced through refactoring)
- `App.tsx` - Main React component (4100+ lines, target for Phase 8)
- `REFACTORING_PROGRESS.md` - Detailed progress tracking
- `REFACTORING_STRATEGY_V2.md` - Overall refactoring plan
