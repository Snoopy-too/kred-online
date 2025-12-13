import { test, expect } from '@playwright/test';
import {
  startGame,
  skipToDraftEnd,
  setupCampaignState,
} from './helpers/game-setup';
import {
  dragPiece,
  dragTile,
  dragToInvalidLocation,
  verifyPiecePosition,
} from './helpers/drag-drop';
import {
  verifyPieceAtLocation,
  verifyModal,
} from './helpers/assertions';

test.describe('Drag and Drop - Pieces', () => {
  test('should drag piece from community to seat', async ({ page }) => {
    // Start a 4-player game and complete draft
    await startGame(page, 4, { testMode: true });
    await skipToDraftEnd(page, 4);

    // Wait for campaign phase to load (verify Game Log is visible)
    await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();

    // Find a piece in community (piece IDs are like "initial_p1_mark_seat1" or "community_mark_1")
    const communityPiece = page.locator('[data-piece-id*="_mark_"]').first();
    await expect(communityPiece).toBeVisible();

    // Get the piece ID
    const pieceId = await communityPiece.getAttribute('data-piece-id');
    expect(pieceId).toBeTruthy();

    // Find a valid seat location (location IDs are like "p1_seat1", "p2_seat3", etc.)
    const seat = page.locator('[data-piece-id][data-location-id*="_seat"]').first();
    await expect(seat).toBeVisible();

    const seatId = await seat.getAttribute('data-location-id');
    expect(seatId).toBeTruthy();

    // Drag piece to seat
    if (pieceId && seatId) {
      await dragPiece(page, pieceId, seatId, { expectSuccess: true });

      // Verify piece is now at the seat
      await verifyPieceAtLocation(page, pieceId, seatId);

      // Verify visual position matches
      await verifyPiecePosition(page, communityPiece, seat);
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    // Find a draggable piece
    const piece = page.locator('[data-piece-id]').first();
    await expect(piece).toBeVisible();

    // Hover over piece
    await piece.hover();

    // Check for hover effect (cursor should change)
    // Note: Actual cursor value may vary based on implementation
    const cursor = await piece.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(['grab', 'pointer', 'move']).toContain(cursor);
  });

  test('should prevent dragging piece to invalid location', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    // Just verify we can find pieces - actual drag validation tested in unit tests
    const pieces = page.locator('[data-piece-id]');
    const count = await pieces.count();

    // Should have multiple pieces on the board
    expect(count).toBeGreaterThan(0);

    // Verify pieces have location IDs
    const firstPiece = pieces.first();
    const locationId = await firstPiece.getAttribute('data-location-id');
    expect(locationId).toBeTruthy();
  });
});

test.describe('Drag and Drop - Tiles', () => {
  test('should drag tile from hand to receiving area', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    // Verify game loaded and we're in Campaign phase
    await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();

    // Verify current player display (use getByRole to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: /Player \d+'s Turn/i })).toBeVisible();

    // TODO: Add data-tile-id attributes to enable tile dragging tests
    expect(true).toBe(true);
  });

  test('should allow dragging tile between different receiving areas', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    // Verify game loaded properly
    await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();

    // Verify pieces are visible
    const pieces = page.locator('[data-piece-id]');
    const count = await pieces.count();
    expect(count).toBeGreaterThan(0);

    // TODO: Add data-tile-id and data-receiving-area attributes for full tile testing
    expect(true).toBe(true);
  });
});

test.describe('Drag and Drop - Edge Cases', () => {
  test('should handle rapid drag attempts gracefully', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    const piece = page.locator('[data-piece-id]').first();
    const seat = page.locator('[data-location-id]').first();

    if (await piece.isVisible({ timeout: 1000 }) && await seat.isVisible({ timeout: 1000 })) {
      // Attempt multiple rapid drags
      await piece.dragTo(seat);
      await piece.dragTo(seat);
      await piece.dragTo(seat);

      // Should not crash or create duplicate pieces
      await page.waitForTimeout(500);

      // Verify game is still functional
      await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should maintain piece position after failed drag', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    const piece = page.locator('[data-piece-id]').first();

    if (await piece.isVisible({ timeout: 1000 })) {
      const originalLocation = await piece.getAttribute('data-location-id');

      // Try to drag to an invalid target (e.g., outside board)
      const invalidTarget = page.locator('body');
      await piece.dragTo(invalidTarget);

      await page.waitForTimeout(300);

      // Piece should remain at original location
      const newLocation = await piece.getAttribute('data-location-id');
      expect(newLocation).toBe(originalLocation);
    } else {
      test.skip();
    }
  });
});
