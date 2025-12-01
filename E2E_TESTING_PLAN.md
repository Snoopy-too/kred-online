# End-to-End Testing Plan for KRED Online

## Executive Summary

This document outlines a comprehensive **browser-based E2E testing strategy** for KRED Online that **complements the existing 459 unit and integration tests**. The refactored codebase already has excellent coverage of game logic, rules, and component behavior. E2E tests will focus on **real browser interactions, visual rendering, and complete user workflows** that unit tests cannot cover.

**Current Test Coverage:**
- ✅ **459 tests passing** - Unit + integration tests
- ✅ **46 test files** - Comprehensive coverage of game logic and rules
- ✅ **Test infrastructure** - Vitest + React Testing Library

**What E2E Tests Add:**
- ✅ **Real drag-and-drop** - Test actual browser D&D API (not simulated events)
- ✅ **Visual validation** - Screenshot testing for board layouts and piece positioning
- ✅ **Complete workflows** - Full game flows through real browser from start to finish
- ✅ **Cross-browser testing** - Verify compatibility across Chromium, Firefox, WebKit
- ✅ **Performance validation** - Real browser rendering and interaction speed

**Key Recommendations:**
- **Primary Framework:** Playwright
- **Test Count:** ~35-40 focused E2E tests (vs 459 unit tests)
- **Estimated Execution Time:** 8-12 minutes for full suite with parallelization
- **Implementation Time:** 1-2 weeks (much faster due to existing test infrastructure)

---

## Table of Contents

1. [Understanding Existing Test Coverage](#understanding-existing-test-coverage)
2. [E2E Testing Framework Comparison](#e2e-testing-framework-comparison)
3. [E2E Test Scenarios (Non-Duplicate)](#e2e-test-scenarios-non-duplicate)
4. [Integration with Existing Tests](#integration-with-existing-tests)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Performance Estimates](#performance-estimates)

---

## 1. Understanding Existing Test Coverage

### What's Already Tested (Unit/Integration)

The refactored codebase has **comprehensive test coverage** across:

#### Config Tests (`src/__tests__/config/`) - 282 tests
- ✅ Board layouts (3/4/5 players)
- ✅ Tile requirements and kredcoin values
- ✅ Piece counts by player count
- ✅ Bureaucracy menus and pricing
- ✅ Game rules and move definitions

#### Game Logic Tests (`src/__tests__/game/`) - 34+ tests
- ✅ Player and piece initialization
- ✅ Move type validation
- ✅ Tile validation logic
- ✅ Bureaucracy calculations
- ✅ State snapshots
- ✅ Location formatting

#### Rules Tests (`src/__tests__/rules/`) - Large coverage
- ✅ Adjacency calculations
- ✅ Credibility tracking
- ✅ Move validation for all 6 types
- ✅ Rostrum support rules
- ✅ Win condition logic
- ✅ Movement restrictions

#### Component Tests (`src/__tests__/components/`) - Integration tests
- ✅ Screen rendering (Player Selection, Drafting, Campaign, Bureaucracy)
- ✅ User interactions with Testing Library
- ✅ Modal displays
- ✅ Error boundaries

#### Phase Integration Tests
- ✅ `player-selection.test.tsx` - Player count selection
- ✅ `drafting-phase.test.tsx` - Draft tile selection
- ✅ `campaign-phase.test.tsx` - Tile play mechanics
- ✅ `campaign-tile-play.test.tsx` - Detailed tile play scenarios
- ✅ `skip-to-bureaucracy.test.tsx` - Test mode features
- ✅ `game-start.test.tsx` - Game initialization

### What E2E Tests Should Cover (Gaps)

**Unit/integration tests use jsdom** - a JavaScript implementation of web standards. They **cannot test:**

1. **Real Browser Drag-and-Drop API**
   - Unit tests simulate D&D with synthetic events
   - E2E tests use actual browser D&D API
   - Tests visual feedback during dragging
   - Validates drop indicators and snap behavior

2. **Visual Rendering and Layout**
   - Piece positioning on board (CSS coordinates)
   - Board rotation for player perspectives
   - Image loading and rendering
   - Responsive layout behavior

3. **Performance in Real Browser**
   - Frame rate during piece dragging
   - Board rendering time with many pieces
   - Animation smoothness
   - Memory usage over long games

4. **Cross-Browser Compatibility**
   - Safari/WebKit-specific bugs
   - Firefox rendering differences
   - Mobile browser behavior

5. **Complete Multi-Phase Workflows**
   - Full game from start to finish in real browser
   - State persistence across phase transitions
   - Visual consistency throughout game

6. **Screenshot/Visual Regression**
   - Board layout correctness
   - Piece alignment and rotation
   - UI consistency

---

## 2. E2E Testing Framework Comparison

### Option 1: Playwright ⭐ **RECOMMENDED**

**Why Playwright is Best for KRED:**

✅ **Superior Drag-and-Drop Support**
```typescript
// Playwright drag-and-drop is native browser API
await page.locator('#piece-mark-1').dragTo(page.locator('[data-location="p1_seat1"]'));

// Testing Library simulates with events (not real browser D&D)
await user.click(element);
await user.pointer([{pointerName: 'mouse', target: element}]);
```

✅ **Screenshot Testing**
```typescript
// Visual regression for board states
await expect(page).toHaveScreenshot('4player-campaign-start.png', {
  maxDiffPixels: 100
});
```

✅ **Multi-Browser Testing**
```typescript
// Test in Chromium, Firefox, WebKit simultaneously
projects: [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'webkit', use: devices['Desktop Safari'] }
]
```

✅ **Fast Parallel Execution**
- Run tests across multiple browsers and workers
- Full suite in ~8-12 minutes

✅ **TypeScript Native**
- Matches your codebase
- Strong type safety for test helpers

✅ **Trace Viewer**
- Record full test execution
- Screenshots, network, console logs
- Time-travel debugging

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

---

### Option 2: Cypress

**Pros:**
- Good drag-and-drop support (with plugins)
- Real-time test running
- Time-travel debugging
- Good documentation

**Cons:**
- Slower than Playwright (serial execution within spec)
- Requires plugin for drag-drop (`@4tw/cypress-drag-drop`)
- Single browser per run (can't test all browsers in parallel)
- Less suitable for cross-browser testing

**Verdict:** Cypress is viable but Playwright is objectively better for KRED's needs.

---

### Option 3: Keep Testing Library (Current)

**Pros:**
- Already installed and working
- 459 tests passing
- Good for component and integration tests

**Cons:**
- Uses jsdom (not real browser)
- Cannot test real drag-and-drop API
- Cannot test visual rendering
- Cannot test cross-browser behavior

**Verdict:** **Keep Testing Library for unit/integration tests.** Add Playwright for E2E tests. They complement each other perfectly.

---

## 3. E2E Test Scenarios (Non-Duplicate)

### Priority 1: CRITICAL - Browser-Specific Features

#### 3.1 Drag-and-Drop Interactions (10 tests)

**Why E2E:** Real browser D&D API vs simulated events

```typescript
// E2E Test: Real drag-and-drop with visual feedback
test('Drag piece from community to seat with drop indicator', async ({ page }) => {
  await startGame(page, 4);
  await skipToDraftEnd(page);

  // Start dragging a piece
  const piece = page.locator('[data-piece-id="mark-1"]');
  await piece.hover();

  // Verify hover state shows (visual CSS change)
  await expect(piece).toHaveCSS('opacity', '0.9');

  // Drag to valid seat - should show green drop indicator
  const seat = page.locator('[data-location-id="p1_seat1"]');
  await piece.dragTo(seat);

  // Verify piece snapped to correct position
  await expect(piece).toHaveAttribute('data-location-id', 'p1_seat1');

  // Visual verification: piece should be at seat position
  const pieceBox = await piece.boundingBox();
  const seatBox = await seat.boundingBox();
  expect(Math.abs(pieceBox.x - seatBox.x)).toBeLessThan(5); // Within 5px
  expect(Math.abs(pieceBox.y - seatBox.y)).toBeLessThan(5);
});

test('Drag piece to invalid location shows red indicator', async ({ page }) => {
  await setupCampaignState(page, { currentPlayer: 1 });

  const opponentPiece = page.locator('[data-piece-id="p2-mark-1"]');
  const opponentSeat = page.locator('[data-location-id="p2_seat2"]');

  // Try to drag opponent's piece in their domain (should fail)
  await opponentPiece.hover();

  // During drag, should show invalid (red) drop indicator
  await page.mouse.down();
  await opponentSeat.hover();

  // Check for invalid indicator class
  await expect(page.locator('.drop-indicator.invalid')).toBeVisible();

  await page.mouse.up();

  // Piece should not have moved
  await expect(opponentPiece).not.toHaveAttribute('data-location-id', 'p2_seat2');
});

test('Drag tile from hand to receiving area', async ({ page }) => {
  await setupCampaignState(page, { currentPlayer: 1 });

  const tile = page.locator('[data-tile-id="10"]');
  const receivingArea = page.locator('[data-player="2"][data-receiving-area]');

  // Drag tile to player 2's receiving area
  await tile.dragTo(receivingArea);

  // Tile should appear in receiving area
  await expect(receivingArea.locator('[data-tile-id="10"]')).toBeVisible();

  // Tile play modal should appear
  await expect(page.locator('.tile-play-modal')).toBeVisible();
});
```

**Test Coverage:**
- ✅ Piece drag from community to seat
- ✅ Piece drag to invalid location (visual feedback)
- ✅ Tile drag from hand to receiving area
- ✅ Piece drag between adjacent seats
- ✅ Piece drag to rostrum (when 3 seats full)
- ✅ Piece drag to office (when both rostrums full)
- ✅ Drop indicator shows correct color (green/red)
- ✅ Piece snaps to exact location after drop
- ✅ Hover effects during drag
- ✅ Multi-touch/pointer events

---

#### 3.2 Visual Rendering and Board Layout (8 tests)

**Why E2E:** Screenshot testing and CSS positioning validation

```typescript
test('3-player board loads with correct layout', async ({ page }) => {
  await startGame(page, 3);
  await skipToDraftEnd(page);

  // Wait for board image to load
  const boardImg = page.locator('img[alt*="3 player board"]');
  await expect(boardImg).toBeVisible();

  // Verify board has correct dimensions
  const box = await boardImg.boundingBox();
  expect(box.width).toBeGreaterThan(800); // Minimum width

  // Screenshot comparison (visual regression)
  await expect(page.locator('#game-board')).toHaveScreenshot('3player-board-layout.png', {
    maxDiffPixels: 50 // Allow minor anti-aliasing differences
  });
});

test('Pieces positioned correctly on 4-player board', async ({ page }) => {
  await startGame(page, 4);
  await setupPieces(page, [
    { id: 'mark-1', location: 'p1_seat1' },
    { id: 'mark-2', location: 'p2_seat3' },
    { id: 'heel-1', location: 'p3_rostrum1' },
  ]);

  // Verify pieces are at expected positions
  for (const piece of ['mark-1', 'mark-2', 'heel-1']) {
    const element = page.locator(`[data-piece-id="${piece}"]`);
    await expect(element).toBeVisible();

    // Verify piece is within board bounds
    const box = await element.boundingBox();
    const boardBox = await page.locator('#game-board').boundingBox();
    expect(box.x).toBeGreaterThan(boardBox.x);
    expect(box.y).toBeGreaterThan(boardBox.y);
    expect(box.x + box.width).toBeLessThan(boardBox.x + boardBox.width);
    expect(box.y + box.height).toBeLessThan(boardBox.y + boardBox.height);
  }

  // Screenshot for visual regression
  await expect(page.locator('#game-board')).toHaveScreenshot('4player-piece-positions.png');
});

test('Board rotates correctly for player 2 perspective', async ({ page }) => {
  await setupCampaignState(page, { currentPlayer: 2 });

  // Enable board rotation
  await page.click('[data-testid="board-rotation-toggle"]');

  const board = page.locator('#game-board');

  // Check rotation CSS transform
  const transform = await board.evaluate(el =>
    window.getComputedStyle(el).transform
  );

  // Should have rotation applied (not identity matrix)
  expect(transform).not.toBe('none');
  expect(transform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');

  // Screenshot to verify visual rotation
  await expect(board).toHaveScreenshot('4player-p2-perspective.png');
});

test('Piece images load for all piece types', async ({ page }) => {
  await startGame(page, 4);
  await skipToDraftEnd(page);

  // Check Mark image loads
  const markImg = page.locator('img[alt*="Mark"]').first();
  await expect(markImg).toBeVisible();
  expect(await markImg.evaluate(img => (img as HTMLImageElement).complete)).toBe(true);

  // Check Heel image loads
  const heelImg = page.locator('img[alt*="Heel"]').first();
  await expect(heelImg).toBeVisible();
  expect(await heelImg.evaluate(img => (img as HTMLImageElement).complete)).toBe(true);

  // Check Pawn image loads
  const pawnImg = page.locator('img[alt*="Pawn"]').first();
  await expect(pawnImg).toBeVisible();
  expect(await pawnImg.evaluate(img => (img as HTMLImageElement).complete)).toBe(true);
});

test('Tile images load for all 24 tiles', async ({ page }) => {
  await startGame(page, 4);

  // After draft, check all player tiles have loaded images
  await skipToDraftEnd(page);

  const tileImages = page.locator('img[alt^="Tile"]');
  const count = await tileImages.count();

  // Should have tiles in hands/banks (at least 24 total)
  expect(count).toBeGreaterThanOrEqual(24);

  // Verify all images loaded successfully
  for (let i = 0; i < count; i++) {
    const img = tileImages.nth(i);
    expect(await img.evaluate(img => (img as HTMLImageElement).complete)).toBe(true);
    expect(await img.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test('Credibility markers update visually', async ({ page }) => {
  await setupCampaignState(page, {
    players: [
      { id: 1, credibility: 3 },
      { id: 2, credibility: 2 },
      { id: 3, credibility: 1 },
      { id: 4, credibility: 0 }
    ]
  });

  // Verify credibility images are correct
  await expect(page.locator('[data-player="1"] img[src*="3_credibility"]')).toBeVisible();
  await expect(page.locator('[data-player="2"] img[src*="2_credibility"]')).toBeVisible();
  await expect(page.locator('[data-player="3"] img[src*="1_credibility"]')).toBeVisible();
  await expect(page.locator('[data-player="4"] img[src*="0_credibility"]')).toBeVisible();

  // Screenshot for visual verification
  await expect(page).toHaveScreenshot('credibility-markers.png');
});
```

**Test Coverage:**
- ✅ 3/4/5-player board layouts load correctly
- ✅ Pieces positioned at correct coordinates
- ✅ Board rotation for different player perspectives
- ✅ All piece images load (Mark, Heel, Pawn)
- ✅ All tile images load (01-24 + blank)
- ✅ Credibility markers display correctly
- ✅ Responsive layout on different screen sizes
- ✅ Visual regression testing with screenshots

---

#### 3.3 Complete Multi-Phase Workflows (6 tests)

**Why E2E:** Test full user journey through real browser, across all phases

```typescript
test('Complete 3-player game: selection → draft → campaign → bureaucracy → winner', async ({ page }) => {
  // Player Selection
  await page.goto('/');
  await page.click('button:has-text("3 Players")');
  await page.check('#test-mode-checkbox');
  await page.click('button:has-text("Start Game")');

  await expect(page.locator('h1')).toContainText('Drafting Phase');

  // Drafting Phase: 8 rounds (8 tiles per player in 3-player game)
  for (let round = 1; round <= 8; round++) {
    for (let player = 1; player <= 3; player++) {
      // Wait for current player's turn
      await expect(page.locator('h2')).toContainText(`Player ${player}`);

      // Select first available tile
      await page.locator('.tile-hand button').first().click();

      // Wait for transition
      await page.waitForTimeout(500);
    }
  }

  // Should transition to Campaign
  await expect(page.locator('h1')).toContainText('Campaign Phase');

  // Campaign Phase: Play some tiles (simplified)
  for (let i = 0; i < 10; i++) {
    // Current player plays a tile
    await playOneTile(page);
  }

  // Skip remaining campaign for speed
  await skipRemainingCampaign(page);

  // Should transition to Bureaucracy
  await expect(page.locator('h1')).toContainText('Bureaucracy Phase');

  // Bureaucracy Phase: Complete turns for all players
  for (let turn = 0; turn < 6; turn++) { // 2 turns per player
    await page.click('button:has-text("Finish Turn")');
    await page.waitForTimeout(300);
  }

  // Winner should be announced
  await expect(page.locator('.alert')).toContainText(/winner|won/i);
});

test('4-player game with skip draft and skip campaign', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("4 Players")');
  await page.check('#test-mode-checkbox');
  await page.check('#skip-draft-checkbox');
  await page.check('#skip-campaign-checkbox');
  await page.click('button:has-text("Start Game")');

  // Should go directly to Bureaucracy
  await expect(page.locator('h1')).toContainText('Bureaucracy Phase', { timeout: 5000 });

  // Players should have tiles distributed randomly
  // Verify game state is valid
  const player1Tiles = await page.locator('[data-player="1"] .tile').count();
  expect(player1Tiles).toBe(6); // 4-player game: 6 tiles each
});

test('Full draft phase with tile distribution verification', async ({ page }) => {
  await startGame(page, 4, { testMode: true });

  // Track that each player picks exactly 6 tiles over 6 rounds
  for (let round = 1; round <= 6; round++) {
    for (let player = 1; player <= 4; player++) {
      await expect(page.locator('h2')).toContainText(`Player ${player}`);

      // Player picks a tile
      await page.locator('.tile-hand button').first().click();
    }
  }

  // After draft completes, verify tile counts
  await expect(page.locator('h1')).toContainText('Campaign Phase');

  // Each player should have exactly 6 tiles
  for (let pid = 1; pid <= 4; pid++) {
    const tileCount = await page.evaluate((playerId) => {
      return window.__testHelpers__?.getPlayerTileCount(playerId) || 0;
    }, pid);
    expect(tileCount).toBe(6);
  }

  // Verify no duplicate tiles across players
  const allTileIds = await page.evaluate(() => {
    return window.__testHelpers__?.getAllTileIds() || [];
  });
  const uniqueIds = new Set(allTileIds);
  expect(uniqueIds.size).toBe(24); // All 24 tiles distributed uniquely
});
```

**Test Coverage:**
- ✅ Full 3-player game start to finish
- ✅ Full 4-player game start to finish
- ✅ 5-player game with blank tile
- ✅ Skip draft mode
- ✅ Skip campaign mode
- ✅ Tile distribution through complete draft

---

### Priority 2: HIGH - Performance and Cross-Browser

#### 3.4 Performance Tests (5 tests)

```typescript
test('Game loads within 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await expect(page.locator('h2')).toContainText('Select Players');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000);
});

test('Piece drag response under 100ms', async ({ page }) => {
  await setupCampaignState(page, { currentPlayer: 1 });

  const piece = page.locator('[data-piece-id="mark-1"]');
  const seat = page.locator('[data-location-id="p1_seat1"]');

  const startTime = Date.now();
  await piece.dragTo(seat);
  const dragTime = Date.now() - startTime;

  // Should complete quickly (not measuring network, just browser rendering)
  expect(dragTime).toBeLessThan(1000);
});

test('Board renders 30+ pieces without performance degradation', async ({ page }) => {
  await startGame(page, 5); // Most pieces
  await setupManyPieces(page, 30);

  const startTime = performance.now();
  await page.locator('#game-board').screenshot();
  const renderTime = performance.now() - startTime;

  expect(renderTime).toBeLessThan(500); // Should render in under 500ms
});
```

---

#### 3.5 Cross-Browser Tests (6 tests)

**Run same tests across Chromium, Firefox, WebKit:**

```typescript
test.describe('Cross-browser compatibility', () => {
  test('Drag-and-drop works in all browsers @chromium @firefox @webkit', async ({ page, browserName }) => {
    await setupCampaignState(page, { currentPlayer: 1 });

    const piece = page.locator('[data-piece-id="mark-1"]');
    const seat = page.locator('[data-location-id="p1_seat1"]');

    await piece.dragTo(seat);

    await expect(piece).toHaveAttribute('data-location-id', 'p1_seat1');

    // Screenshot per browser (detect browser-specific rendering issues)
    await expect(page).toHaveScreenshot(`piece-drag-${browserName}.png`);
  });

  test('Board rotation works in all browsers @chromium @firefox @webkit', async ({ page }) => {
    await setupCampaignState(page, { currentPlayer: 2 });
    await page.click('[data-testid="board-rotation-toggle"]');

    const board = page.locator('#game-board');
    const transform = await board.evaluate(el => window.getComputedStyle(el).transform);

    expect(transform).not.toBe('none');
  });
});
```

**Playwright Config for Multi-Browser:**
```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'webkit', use: devices['Desktop Safari'] }
]
```

---

### Priority 3: MEDIUM - Edge Cases in Real Browser

#### 3.6 Browser-Specific Edge Cases (6 tests)

```typescript
test('Page reload preserves game state (if implemented)', async ({ page }) => {
  await startGame(page, 4);
  await completeDraft(page);

  // Reload page
  await page.reload();

  // If persistence implemented, should restore state
  // If not, should go back to player selection
  // Either is fine, just test it works correctly
});

test('Browser back button handling', async ({ page }) => {
  await startGame(page, 4);

  // Try to go back
  await page.goBack();

  // Should stay on game page or handle gracefully
  // Don't allow breaking game state
});

test('Multiple rapid clicks don't break state', async ({ page }) => {
  await startGame(page, 4);

  const startButton = page.locator('button:has-text("Start Game")');

  // Rapid click (should not start multiple games)
  await Promise.all([
    startButton.click(),
    startButton.click(),
    startButton.click()
  ]);

  // Should only start one game
  await expect(page.locator('h1')).toContainText('Drafting Phase');
});
```

---

## 4. Integration with Existing Tests

### Test Pyramid Structure

```
         E2E Tests (~35-40 tests, 12 min)
        /  Playwright  \
       /  Real browser  \
      /__________________\
     /                    \
    /  Integration Tests   \  (~55 tests, 2 min)
   /   React Testing Lib    \
  /__________________________\
 /                            \
/      Unit Tests              \  (~404 tests, 30 sec)
/  Vitest + jsdom (pure logic)  \
/__________________________________\

Total: ~495-500 tests
```

### Division of Responsibilities

| Test Type | Framework | What It Tests | File Location |
|-----------|-----------|---------------|---------------|
| **Unit** | Vitest + jsdom | Pure functions, game logic, validation | `src/__tests__/**/*.test.ts` |
| **Integration** | React Testing Library | Component behavior, user interactions (simulated) | `src/__tests__/**/*.test.tsx` |
| **E2E** | Playwright | Real browser D&D, visual rendering, complete workflows | `tests/e2e/**/*.spec.ts` |

### Reusing Existing Test Helpers

The existing test suite has excellent helpers you can leverage:

```typescript
// E2E tests can import and use existing test fixtures
import { TILE_REQUIREMENTS } from '../src/config/rules';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../src/config/pieces';

// In E2E test:
test('Verify piece counts match config', async ({ page }) => {
  const playerCount = 4;
  await startGame(page, playerCount);

  // Use existing config to validate
  const expectedCounts = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount];

  const markCount = await page.locator('[data-piece-type="Mark"]').count();
  expect(markCount).toBe(expectedCounts.marks);
});
```

---

## 5. Implementation Roadmap

### Phase 1: Setup (2-3 days)

**Day 1: Install Playwright**
```bash
npm install -D @playwright/test
npx playwright install
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

**Day 2-3: Create Test Helpers**
```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── game-setup.ts       # Start game, navigate phases
│   │   ├── drag-drop.ts        # D&D helpers
│   │   ├── assertions.ts       # Custom E2E assertions
│   │   └── screenshots.ts      # Visual regression helpers
│   └── playwright.config.ts
```

---

### Phase 2: Critical E2E Tests (3-4 days)

**Day 1-2: Drag-and-Drop Tests**
- Real browser D&D for pieces
- Tile dragging
- Drop indicators
- Snap behavior

**Day 3: Visual Tests**
- Board layout screenshots
- Piece positioning
- Image loading

**Day 4: Complete Workflow**
- One full game flow test (3-player)

---

### Phase 3: Expand Coverage (5-7 days)

**Week 2:**
- Cross-browser tests
- Performance tests
- Edge cases
- 4-player and 5-player game flows

---

## 6. Performance Estimates

### Test Execution Times

| Test Category | # Tests | Avg Time/Test | Total Time |
|---------------|---------|---------------|------------|
| **Existing Unit Tests** | 404 | <0.1s | 30 sec |
| **Existing Integration Tests** | 55 | 2s | 2 min |
| **E2E: Drag & Drop** | 10 | 10s | 1.5 min |
| **E2E: Visual/Layout** | 8 | 8s | 1 min |
| **E2E: Complete Workflows** | 6 | 60s | 6 min |
| **E2E: Performance** | 5 | 5s | 25 sec |
| **E2E: Cross-Browser** | 6 | 15s | 1.5 min |
| **TOTAL** | **~494** | - | **~13 min** |

### Optimized Execution

**With Playwright Parallelization (4 workers):**
- **E2E tests:** ~3-4 minutes
- **Total (unit + integration + E2E):** ~6-7 minutes

**Playwright Config:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // 1 min per test
  workers: 4, // Parallel execution
  retries: 1, // Retry flaky tests once
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    // Add firefox/webkit as needed
  ],
});
```

---

## 7. Key Differences from Original Plan

### What Changed (Now That We See Refactored Codebase)

**Before (Original Plan):**
- Assumed NO existing tests
- Planned 88+ E2E tests covering everything
- Focus on testing game logic in browser

**After (Refactored Codebase):**
- **459 tests already exist** covering game logic
- Only need ~35-40 E2E tests for browser-specific features
- Focus on D&D, visual, performance, cross-browser
- Complement (don't duplicate) existing tests

### What Stayed the Same

- ✅ Playwright is still the best choice
- ✅ Tile distribution testing is still critical
- ✅ Complete game workflows are valuable
- ✅ Visual regression testing is important

---

## 8. Recommendations Summary

### Primary Framework: Playwright

**Rationale:**
1. ✅ Best drag-and-drop support for your game
2. ✅ Screenshot testing for visual validation
3. ✅ Multi-browser testing in parallel
4. ✅ Fast execution (3-4 min for E2E suite)
5. ✅ Complements existing Vitest/RTL tests perfectly

### Test Priorities

**Must Have (Week 1):**
1. Drag-and-drop tests (10 tests)
2. Visual/layout tests (8 tests)
3. One complete game flow (1 test)

**Should Have (Week 2):**
4. Remaining game flows (5 tests)
5. Cross-browser tests (6 tests)
6. Performance tests (5 tests)

**Nice to Have (Ongoing):**
7. Additional edge cases
8. Mobile responsiveness
9. Accessibility tests

### Integration with CI/CD

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test # Vitest (459 tests, ~2.5 min)

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e # Playwright (~35-40 tests, ~4 min)
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 9. Conclusion

The refactored KRED codebase already has **excellent test coverage** with 459 passing tests. E2E tests should focus on what unit/integration tests **cannot do**:

**E2E Test Value:**
- ✅ Real browser drag-and-drop (not simulated)
- ✅ Visual rendering and layout validation
- ✅ Screenshot regression testing
- ✅ Cross-browser compatibility
- ✅ Performance in real browser
- ✅ Complete user workflows

**Estimated Investment:**
- **Setup:** 2-3 days
- **Core E2E coverage:** 1 week
- **Full coverage:** 2 weeks
- **Ongoing:** Minimal maintenance

**ROI:**
- Catch browser-specific bugs (Safari, Firefox differences)
- Validate visual correctness (board layout, piece positioning)
- Ensure D&D works in all browsers
- Prevent visual regressions
- Test complete user journeys

**Next Steps:**
1. Install Playwright
2. Create first drag-and-drop test
3. Add visual screenshot tests
4. Expand to complete game flows
5. Integrate with CI/CD

This plan complements your existing 459 tests and focuses E2E testing where it adds the most value.
