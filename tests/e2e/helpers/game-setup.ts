import { Page, expect } from '@playwright/test';

/**
 * Start a new game with the specified number of players
 */
export async function startGame(
  page: Page,
  playerCount: 3 | 4 | 5,
  options: {
    testMode?: boolean;
    skipDraft?: boolean;
    skipCampaign?: boolean;
  } = {}
) {
  const { testMode = true, skipDraft = false, skipCampaign = false } = options;

  // Navigate to the app
  await page.goto('/');

  // Wait for player selection screen
  await expect(page.locator('h2')).toContainText('Select Players', { timeout: 10000 });

  // Select player count
  await page.click(`button:has-text("${playerCount} Players")`);

  // Enable test mode if requested
  if (testMode) {
    await page.check('#test-mode-checkbox');
  }

  // Enable skip draft if requested
  if (skipDraft) {
    await page.check('#skip-draft-checkbox');
  }

  // Enable skip campaign if requested
  if (skipCampaign) {
    await page.check('#skip-campaign-checkbox');
  }

  // Start the game
  await page.click('button:has-text("Start Game")');

  // Wait for game to start
  if (!skipDraft) {
    await expect(page.locator('h1')).toContainText('Drafting Phase', { timeout: 5000 });
  } else if (!skipCampaign) {
    await expect(page.locator('h1')).toContainText('Campaign Phase', { timeout: 5000 });
  } else {
    await expect(page.locator('h1')).toContainText('Bureaucracy Phase', { timeout: 5000 });
  }
}

/**
 * Skip through the entire drafting phase by auto-selecting tiles
 */
export async function completeDraft(page: Page, playerCount: 3 | 4 | 5) {
  // Number of rounds based on player count
  // 3 players: 8 tiles each = 8 rounds
  // 4 players: 6 tiles each = 6 rounds
  // 5 players: 4 tiles each = 4 rounds (+ 1 blank)
  const rounds = playerCount === 3 ? 8 : playerCount === 4 ? 6 : 4;

  for (let round = 1; round <= rounds; round++) {
    for (let player = 1; player <= playerCount; player++) {
      // Wait for current player's turn
      await expect(page.locator('h2')).toContainText(`Player ${player}`, { timeout: 5000 });

      // Select first available tile
      await page.locator('.tile-hand button').first().click();

      // Small delay for state update
      await page.waitForTimeout(200);
    }
  }

  // Wait for transition to Campaign phase
  await expect(page.locator('h1')).toContainText('Campaign Phase', { timeout: 5000 });
}

/**
 * Skip to the end of drafting phase quickly (alias for completeDraft)
 */
export async function skipToDraftEnd(page: Page, playerCount: 3 | 4 | 5 = 4) {
  await completeDraft(page, playerCount);
}

/**
 * Skip remaining campaign phase (if test mode "Skip to Bureaucracy" is available)
 */
export async function skipRemainingCampaign(page: Page) {
  // Look for test mode skip button
  const skipButton = page.locator('button:has-text("Skip to Bureaucracy")');

  if (await skipButton.isVisible()) {
    await skipButton.click();
    await expect(page.locator('h1')).toContainText('Bureaucracy Phase', { timeout: 5000 });
  } else {
    throw new Error('Skip to Bureaucracy button not found. Is test mode enabled?');
  }
}

/**
 * Play one tile in campaign phase (simplified - plays first available tile to first valid target)
 */
export async function playOneTile(page: Page) {
  // This is a simplified version - in real tests you'd specify which tile and target
  const tile = page.locator('[data-tile-id]').first();
  const receivingArea = page.locator('[data-receiving-area]').first();

  await tile.dragTo(receivingArea);

  // Wait for tile play modal or state update
  await page.waitForTimeout(500);

  // If modal appears, confirm the play
  const confirmButton = page.locator('button:has-text("Confirm")');
  if (await confirmButton.isVisible({ timeout: 1000 })) {
    await confirmButton.click();
  }
}

/**
 * Setup a specific campaign state for testing
 */
export async function setupCampaignState(
  page: Page,
  options: {
    playerCount?: 3 | 4 | 5;
    currentPlayer?: number;
    testMode?: boolean;
  } = {}
) {
  const { playerCount = 4, currentPlayer = 1, testMode = true } = options;

  // Start game and skip draft
  await startGame(page, playerCount, { testMode, skipDraft: true });

  // Campaign phase should now be active
  await expect(page.locator('h1')).toContainText('Campaign Phase');

  // If current player is not player 1, we'd need to advance turns
  // For now, this is a basic implementation
  if (currentPlayer !== 1) {
    // TODO: Add logic to advance to specific player's turn
    console.warn('Advancing to specific player turn not yet implemented');
  }
}

/**
 * Setup pieces on the board at specific locations
 */
export async function setupPieces(
  page: Page,
  pieces: Array<{ id: string; location: string }>
) {
  // This would use test mode helpers to place pieces
  // For now, this is a placeholder
  for (const piece of pieces) {
    await page.evaluate(
      ({ pieceId, location }) => {
        // Use window.__testHelpers__ if available
        if (window.__testHelpers__?.placePiece) {
          window.__testHelpers__.placePiece(pieceId, location);
        }
      },
      { pieceId: piece.id, location: piece.location }
    );
  }

  // Wait for re-render
  await page.waitForTimeout(300);
}

/**
 * Setup many pieces on the board for performance testing
 */
export async function setupManyPieces(page: Page, count: number) {
  // Generate dummy piece placements
  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      id: `piece-${i}`,
      location: `seat-${i % 12}`, // Cycle through seats
    });
  }

  await setupPieces(page, pieces);
}

// Type augmentation for window test helpers
declare global {
  interface Window {
    __testHelpers__?: {
      placePiece?: (pieceId: string, location: string) => void;
      getPlayerTileCount?: (playerId: number) => number;
      getAllTileIds?: () => number[];
    };
  }
}
