import { Page, expect, Locator } from '@playwright/test';

/**
 * Verify all images on the page have loaded successfully
 */
export async function verifyAllImagesLoaded(page: Page) {
  const images = page.locator('img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);

    // Verify image is complete
    const isComplete = await img.evaluate((el) => (el as HTMLImageElement).complete);
    expect(isComplete).toBe(true);

    // Verify image has natural width (loaded successfully)
    const naturalWidth = await img.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth
    );
    expect(naturalWidth).toBeGreaterThan(0);
  }
}

/**
 * Verify specific piece type images are loaded
 */
export async function verifyPieceImagesLoaded(
  page: Page,
  pieceType: 'Mark' | 'Heel' | 'Pawn'
) {
  const pieceImages = page.locator(`img[alt*="${pieceType}"]`);
  const count = await pieceImages.count();

  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = pieceImages.nth(i);
    await expect(img).toBeVisible();

    const isComplete = await img.evaluate((el) => (el as HTMLImageElement).complete);
    expect(isComplete).toBe(true);
  }
}

/**
 * Verify tile count for a specific player
 */
export async function verifyPlayerTileCount(
  page: Page,
  playerId: number,
  expectedCount: number
) {
  const tiles = page.locator(`[data-player="${playerId}"] [data-tile-id]`);
  const count = await tiles.count();

  expect(count).toBe(expectedCount);
}

/**
 * Verify piece is at expected location on board
 */
export async function verifyPieceAtLocation(
  page: Page,
  pieceId: string,
  locationId: string
) {
  const piece = page.locator(`[data-piece-id="${pieceId}"]`);
  await expect(piece).toBeVisible();
  await expect(piece).toHaveAttribute('data-location-id', locationId);
}

/**
 * Verify piece is within board boundaries
 */
export async function verifyPieceWithinBoard(
  page: Page,
  pieceLocator: Locator
) {
  const pieceBox = await pieceLocator.boundingBox();
  const boardBox = await page.locator('#game-board').boundingBox();

  if (!pieceBox || !boardBox) {
    throw new Error('Could not get bounding boxes');
  }

  // Verify piece is fully within board bounds
  expect(pieceBox.x).toBeGreaterThanOrEqual(boardBox.x);
  expect(pieceBox.y).toBeGreaterThanOrEqual(boardBox.y);
  expect(pieceBox.x + pieceBox.width).toBeLessThanOrEqual(
    boardBox.x + boardBox.width
  );
  expect(pieceBox.y + pieceBox.height).toBeLessThanOrEqual(
    boardBox.y + boardBox.height
  );
}

/**
 * Verify credibility marker is displayed correctly for a player
 */
export async function verifyCredibilityMarker(
  page: Page,
  playerId: number,
  expectedCredibility: number
) {
  const credibilityMarker = page.locator(
    `[data-player="${playerId}"] img[src*="${expectedCredibility}_credibility"]`
  );

  await expect(credibilityMarker).toBeVisible();
}

/**
 * Verify current game phase
 */
export async function verifyGamePhase(
  page: Page,
  expectedPhase: 'Player Selection' | 'Drafting Phase' | 'Campaign Phase' | 'Bureaucracy Phase'
) {
  const heading = page.locator('h1, h2');
  await expect(heading).toContainText(expectedPhase);
}

/**
 * Verify current player turn
 */
export async function verifyCurrentPlayer(page: Page, playerId: number) {
  const playerIndicator = page.locator('h2');
  await expect(playerIndicator).toContainText(`Player ${playerId}`);
}

/**
 * Verify board image loaded for specific player count
 */
export async function verifyBoardImage(
  page: Page,
  playerCount: 3 | 4 | 5
) {
  const boardImg = page.locator(`img[alt*="${playerCount} player board"]`);
  await expect(boardImg).toBeVisible();

  // Verify image loaded
  const isComplete = await boardImg.evaluate(
    (el) => (el as HTMLImageElement).complete
  );
  expect(isComplete).toBe(true);

  // Verify image has minimum dimensions
  const box = await boardImg.boundingBox();
  expect(box).toBeTruthy();
  if (box) {
    expect(box.width).toBeGreaterThan(800);
    expect(box.height).toBeGreaterThan(600);
  }
}

/**
 * Verify all tiles are unique (no duplicates)
 */
export async function verifyUniqueTiles(page: Page) {
  const allTileIds = await page.evaluate(() => {
    const tiles = document.querySelectorAll('[data-tile-id]');
    return Array.from(tiles).map((tile) => tile.getAttribute('data-tile-id'));
  });

  const uniqueIds = new Set(allTileIds);

  // Number of unique IDs should equal total number of tiles
  expect(uniqueIds.size).toBe(allTileIds.length);
}

/**
 * Verify element has specific CSS transform (for rotation testing)
 */
export async function verifyTransform(
  page: Page,
  locator: Locator,
  shouldHaveTransform: boolean = true
) {
  const transform = await locator.evaluate((el) =>
    window.getComputedStyle(el).transform
  );

  if (shouldHaveTransform) {
    expect(transform).not.toBe('none');
    expect(transform).not.toBe('matrix(1, 0, 0, 1, 0, 0)'); // Identity matrix
  } else {
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  }
}

/**
 * Verify page load time
 */
export async function verifyLoadTime(startTime: number, maxTime: number) {
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(maxTime);
}

/**
 * Verify modal is visible with expected content
 */
export async function verifyModal(
  page: Page,
  modalSelector: string,
  expectedContent?: string
) {
  const modal = page.locator(modalSelector);
  await expect(modal).toBeVisible({ timeout: 3000 });

  if (expectedContent) {
    await expect(modal).toContainText(expectedContent);
  }
}

/**
 * Verify game winner is announced
 */
export async function verifyWinner(page: Page) {
  const winnerAlert = page.locator('.alert, .winner-announcement, [role="alert"]');
  await expect(winnerAlert).toContainText(/winner|won/i, { timeout: 5000 });
}
