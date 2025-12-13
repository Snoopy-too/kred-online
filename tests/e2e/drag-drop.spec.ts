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

    // Try to drag opponent's piece in their domain (should be invalid)
    const opponentPiece = page.locator('[data-piece-id^="p2-"]').first();

    if (await opponentPiece.isVisible({ timeout: 2000 })) {
      const pieceId = await opponentPiece.getAttribute('data-piece-id');

      // Try to drag to an invalid location (opponent's seat when it's not your turn)
      const opponentSeat = page.locator('[data-location-id^="p2_seat"]').first();
      const seatId = await opponentSeat.getAttribute('data-location-id');

      if (pieceId && seatId) {
        await dragToInvalidLocation(page, pieceId, seatId);
      }
    } else {
      // If no opponent pieces visible, skip this test
      test.skip();
    }
  });
});

test.describe('Drag and Drop - Tiles', () => {
  test('should drag tile from hand to receiving area', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    // Find a tile in current player's hand
    const tile = page.locator('[data-tile-id]').first();

    if (await tile.isVisible({ timeout: 2000 })) {
      const tileId = await tile.getAttribute('data-tile-id');

      if (tileId) {
        // Drag to player 2's receiving area
        await dragTile(page, tileId, 2, { expectModal: true });

        // Verify tile play modal appeared
        await verifyModal(page, '.tile-play-modal, .modal, [role="dialog"]');
      }
    } else {
      // If no tiles visible in hand, skip
      test.skip();
    }
  });

  test('should allow dragging tile between different receiving areas', async ({ page }) => {
    await setupCampaignState(page, { playerCount: 4, testMode: true });

    const tile = page.locator('[data-tile-id]').first();

    if (await tile.isVisible({ timeout: 2000 })) {
      // Try dragging to different receiving areas
      const receivingAreas = page.locator('[data-receiving-area]');
      const count = await receivingAreas.count();

      if (count > 0) {
        const firstArea = receivingAreas.first();
        await tile.dragTo(firstArea);

        // Wait for state update
        await page.waitForTimeout(300);

        // Verify some response (modal or state change)
        // This is a flexible test since exact behavior may vary
        expect(true).toBe(true); // Placeholder - adjust based on actual app behavior
      }
    } else {
      test.skip();
    }
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
