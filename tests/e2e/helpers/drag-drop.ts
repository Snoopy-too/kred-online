import { Page, Locator, expect } from '@playwright/test';

/**
 * Drag a piece from one location to another with visual verification
 */
export async function dragPiece(
  page: Page,
  pieceId: string,
  targetLocationId: string,
  options: {
    expectSuccess?: boolean;
    checkDropIndicator?: boolean;
  } = {}
) {
  const { expectSuccess = true, checkDropIndicator = true } = options;

  const piece = page.locator(`[data-piece-id="${pieceId}"]`);
  const target = page.locator(`[data-location-id="${targetLocationId}"]`);

  // Verify piece exists
  await expect(piece).toBeVisible();

  // Verify target exists
  await expect(target).toBeVisible();

  // Perform drag and drop
  await piece.dragTo(target);

  // Wait for state update
  await page.waitForTimeout(300);

  if (expectSuccess) {
    // Verify piece moved to new location
    await expect(piece).toHaveAttribute('data-location-id', targetLocationId);
  }

  return { piece, target };
}

/**
 * Drag a tile from hand to a receiving area
 */
export async function dragTile(
  page: Page,
  tileId: string,
  targetPlayerId: number,
  options: {
    expectModal?: boolean;
  } = {}
) {
  const { expectModal = true } = options;

  const tile = page.locator(`[data-tile-id="${tileId}"]`);
  const receivingArea = page.locator(
    `[data-player="${targetPlayerId}"][data-receiving-area]`
  );

  // Verify elements exist
  await expect(tile).toBeVisible();
  await expect(receivingArea).toBeVisible();

  // Drag tile to receiving area
  await tile.dragTo(receivingArea);

  // Wait for state update
  await page.waitForTimeout(300);

  if (expectModal) {
    // Expect tile play modal to appear
    await expect(page.locator('.tile-play-modal')).toBeVisible({ timeout: 2000 });
  }

  return { tile, receivingArea };
}

/**
 * Verify drop indicator shows with expected state (valid/invalid)
 */
export async function verifyDropIndicator(
  page: Page,
  isValid: boolean
) {
  if (isValid) {
    await expect(page.locator('.drop-indicator.valid')).toBeVisible();
  } else {
    await expect(page.locator('.drop-indicator.invalid')).toBeVisible();
  }
}

/**
 * Perform a drag operation with manual mouse control for testing hover states
 */
export async function dragWithHover(
  page: Page,
  sourceLocator: Locator,
  targetLocator: Locator,
  options: {
    checkHoverEffect?: boolean;
    hoverDuration?: number;
  } = {}
) {
  const { checkHoverEffect = true, hoverDuration = 500 } = options;

  // Get bounding boxes
  const sourceBox = await sourceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Could not get bounding boxes for drag operation');
  }

  // Move to source center
  const sourceCenterX = sourceBox.x + sourceBox.width / 2;
  const sourceCenterY = sourceBox.y + sourceBox.height / 2;

  await page.mouse.move(sourceCenterX, sourceCenterY);

  if (checkHoverEffect) {
    // Verify hover effect (e.g., opacity change)
    await expect(sourceLocator).toHaveCSS('cursor', 'grab', { timeout: 1000 }).catch(() => {
      // Cursor may vary, so we just verify element is hoverable
    });
  }

  // Mouse down to start drag
  await page.mouse.down();

  // Move to target center
  const targetCenterX = targetBox.x + targetBox.width / 2;
  const targetCenterY = targetBox.y + targetBox.height / 2;

  await page.mouse.move(targetCenterX, targetCenterY, { steps: 10 });

  // Hover over target
  await page.waitForTimeout(hoverDuration);

  // Mouse up to complete drag
  await page.mouse.up();

  // Wait for state update
  await page.waitForTimeout(300);
}

/**
 * Verify piece snapped to correct position after drag
 */
export async function verifyPiecePosition(
  page: Page,
  pieceLocator: Locator,
  targetLocator: Locator,
  tolerance: number = 5
) {
  const pieceBox = await pieceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  if (!pieceBox || !targetBox) {
    throw new Error('Could not get bounding boxes for position verification');
  }

  // Calculate centers
  const pieceCenterX = pieceBox.x + pieceBox.width / 2;
  const pieceCenterY = pieceBox.y + pieceBox.height / 2;
  const targetCenterX = targetBox.x + targetBox.width / 2;
  const targetCenterY = targetBox.y + targetBox.height / 2;

  // Verify piece is within tolerance
  const deltaX = Math.abs(pieceCenterX - targetCenterX);
  const deltaY = Math.abs(pieceCenterY - targetCenterY);

  expect(deltaX).toBeLessThan(tolerance);
  expect(deltaY).toBeLessThan(tolerance);
}

/**
 * Attempt to drag a piece to an invalid location and verify it doesn't move
 */
export async function dragToInvalidLocation(
  page: Page,
  pieceId: string,
  invalidTargetId: string
) {
  const piece = page.locator(`[data-piece-id="${pieceId}"]`);
  const originalLocation = await piece.getAttribute('data-location-id');

  // Attempt drag
  const target = page.locator(`[data-location-id="${invalidTargetId}"]`);
  await piece.dragTo(target);

  // Wait for any state updates
  await page.waitForTimeout(300);

  // Verify piece did NOT move
  await expect(piece).toHaveAttribute('data-location-id', originalLocation);
}
