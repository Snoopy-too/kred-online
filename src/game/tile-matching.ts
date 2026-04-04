import { TILE_REQUIREMENTS } from "../config/rules";
import type { TrackedMove } from "../types/move";
import type { DefinedMoveType } from "../types/move";
import type { Tile } from "../types/tile";

/**
 * Converts a numeric tile ID to the string key used in TILE_REQUIREMENTS.
 * 0 → "BLANK", 1 → "01", 2 → "02", etc.
 */
function tileIdToKey(id: number): string {
  return id === 0 ? "BLANK" : id.toString().padStart(2, "0");
}

/**
 * Returns the string keys of tiles in the player's hand whose required moves
 * exactly match the moves performed (order-independent).
 *
 * BLANK tile matches any set of moves (including zero).
 */
export function getMatchingTileIds(
  movesPerformed: TrackedMove[],
  hand: Tile[]
): string[] {
  const performedTypes = movesPerformed.map((m) => m.moveType);

  return hand
    .filter((tile) => {
      const key = tileIdToKey(tile.id);

      // BLANK tile matches any legal move set
      if (key === "BLANK") return true;

      const req = TILE_REQUIREMENTS[key];
      if (!req) return false;

      const required: DefinedMoveType[] = req.requiredMoves;

      // Exact match: same move types, same count
      if (required.length !== performedTypes.length) return false;

      const performedCopy = [...performedTypes];
      for (const reqMove of required) {
        const idx = performedCopy.indexOf(reqMove);
        if (idx === -1) return false;
        performedCopy.splice(idx, 1);
      }

      return performedCopy.length === 0;
    })
    .map((tile) => tileIdToKey(tile.id));
}

/**
 * Checks if a set of moves matches at least one tile in the game.
 * Zero moves are always legal.
 */
export function isLegalMoveSet(movesPerformed: TrackedMove[]): boolean {
  if (movesPerformed.length === 0) return true;

  const performedTypes = movesPerformed.map((m) => m.moveType);

  return Object.values(TILE_REQUIREMENTS).some((req) => {
    const required = req.requiredMoves;
    if (required.length !== performedTypes.length) return false;

    const performedCopy = [...performedTypes];
    for (const reqMove of required) {
      const idx = performedCopy.indexOf(reqMove);
      if (idx === -1) return false;
      performedCopy.splice(idx, 1);
    }
    return performedCopy.length === 0;
  });
}
