/**
 * Move Validation
 *
 * This module handles all move validation logic including:
 * - Validating individual piece movements
 * - Validating tile play requirements
 * - Checking for impossible moves
 * - Determining move types based on locations
 */

import type { Piece, Player, TrackedMove, TileRequirement } from '../types';
import { DefinedMoveType } from '../types';
import { TILE_REQUIREMENTS } from '../config';
import { areSeatsAdjacent } from './adjacency';

/**
 * Validates if a piece movement is legal and returns the move type.
 * Returns the move type or 'UNKNOWN' if the move is illegal.
 *
 * Movement Rules:
 * 1. Community → Seat/Rostrum/Office = ADVANCE (own) or ASSIST (opponent)
 * 2. Seat → Community = WITHDRAW
 * 3. Seat → Seat (adjacent) = ORGANIZE (own) or INFLUENCE (opponent)
 * 4. Seat → Rostrum = ADVANCE
 * 5. Rostrum → Seat = WITHDRAW
 * 6. Rostrum → Office = ADVANCE
 * 7. Rostrum → Community = WITHDRAW
 * 8. Rostrum → Rostrum = ORGANIZE (own) or INFLUENCE (opponent)
 * 9. Office → Rostrum = WITHDRAW
 * 10. Office → Community = WITHDRAW
 *
 * @param fromLocationId - Starting location ID
 * @param toLocationId - Destination location ID
 * @param movingPlayerId - ID of the player making the move
 * @param currentPiece - The piece being moved
 * @param allPieces - All pieces on the board
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Move type or 'UNKNOWN' if illegal
 */
export function validateMoveType(
  fromLocationId: string | undefined,
  toLocationId: string | undefined,
  movingPlayerId: number,
  currentPiece: Piece,
  allPieces: Piece[],
  playerCount: number
): string {
  if (!fromLocationId || !toLocationId) return 'UNKNOWN';

  const isCommunity = (loc?: string) => loc?.includes('community');
  const isSeat = (loc?: string) => loc?.includes('_seat');
  const isRostrum = (loc?: string) => loc?.includes('_rostrum');
  const isOffice = (loc?: string) => loc?.includes('_office');
  const getPlayerFromLocation = (loc?: string): number | null => {
    const match = loc?.match(/p(\d+)_/);
    return match ? parseInt(match[1]) : null;
  };

  // Rule 1: Community → Seat/Rostrum/Office = ADVANCE or ASSIST
  if (isCommunity(fromLocationId) && (isSeat(toLocationId) || isRostrum(toLocationId) || isOffice(toLocationId))) {
    const ownerPlayer = getPlayerFromLocation(toLocationId);
    return ownerPlayer === movingPlayerId ? 'ADVANCE' : 'ASSIST';
  }
  // Rule 2: Seat → Community = WITHDRAW
  else if (isSeat(fromLocationId) && isCommunity(toLocationId)) {
    return 'WITHDRAW';
  }
  // Rule 3: Seat → Seat = ORGANIZE or INFLUENCE (only if adjacent)
  else if (isSeat(fromLocationId) && isSeat(toLocationId)) {
    if (areSeatsAdjacent(fromLocationId, toLocationId, playerCount)) {
      const fromPlayer = getPlayerFromLocation(fromLocationId);
      return fromPlayer === movingPlayerId ? 'ORGANIZE' : 'INFLUENCE';
    }
    return 'UNKNOWN'; // Non-adjacent seat moves are illegal
  }
  // Rule 4: Seat → Rostrum = ADVANCE
  else if (isSeat(fromLocationId) && isRostrum(toLocationId)) {
    return 'ADVANCE';
  }
  // Rule 5: Rostrum → Seat = WITHDRAW
  else if (isRostrum(fromLocationId) && isSeat(toLocationId)) {
    return 'WITHDRAW';
  }
  // Rule 6: Rostrum → Office = ADVANCE
  else if (isRostrum(fromLocationId) && isOffice(toLocationId)) {
    return 'ADVANCE';
  }
  // Rule 7: Rostrum → Community = WITHDRAW
  else if (isRostrum(fromLocationId) && isCommunity(toLocationId)) {
    return 'WITHDRAW';
  }
  // Rule 8: Rostrum → Rostrum = ORGANIZE or INFLUENCE
  else if (isRostrum(fromLocationId) && isRostrum(toLocationId)) {
    const fromPlayer = getPlayerFromLocation(fromLocationId);
    return fromPlayer === movingPlayerId ? 'ORGANIZE' : 'INFLUENCE';
  }
  // Rule 9: Office → Rostrum = WITHDRAW
  else if (isOffice(fromLocationId) && isRostrum(toLocationId)) {
    return 'WITHDRAW';
  }
  // Rule 10: Office → Community = WITHDRAW
  else if (isOffice(fromLocationId) && isCommunity(toLocationId)) {
    return 'WITHDRAW';
  }

  // All other moves are illegal
  return 'UNKNOWN';
}

/**
 * Validates that moves performed during a tile play are legal.
 *
 * Rules:
 * - Maximum 2 moves per tile play
 * - Cannot perform 2 moves of the same category (O or M)
 *
 * Move Categories:
 * - O-moves (Own pieces): ADVANCE, WITHDRAW, ORGANIZE
 * - M-moves (Manipulate opponents): ASSIST, REMOVE, INFLUENCE
 *
 * @param movesPerformed - Array of tracked moves
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateMovesForTilePlay(movesPerformed: TrackedMove[]): {
  isValid: boolean;
  error?: string;
} {
  console.log('=== validateMovesForTilePlay ===');
  console.log('Total moves:', movesPerformed.length);
  console.log('Moves:', movesPerformed.map(m => ({ moveType: m.moveType, category: m.category })));

  if (movesPerformed.length > 2) {
    console.log('VALIDATION FAILED: More than 2 moves');
    return { isValid: false, error: 'Maximum 2 moves allowed per tile play' };
  }

  const oMoveCount = movesPerformed.filter((m) => m.category === 'O').length;
  const mMoveCount = movesPerformed.filter((m) => m.category === 'M').length;

  console.log('O-moves count:', oMoveCount);
  console.log('M-moves count:', mMoveCount);

  if (oMoveCount > 1) {
    console.log('VALIDATION FAILED: More than 1 O-move');
    return { isValid: false, error: 'You may NOT perform 2 actions of the same category' };
  }

  if (mMoveCount > 1) {
    console.log('VALIDATION FAILED: More than 1 M-move');
    return { isValid: false, error: 'You may NOT perform 2 actions of the same category' };
  }

  console.log('VALIDATION PASSED');
  return { isValid: true };
}

/**
 * Gets the tile requirements for a specific tile ID.
 *
 * @param tileId - The tile ID to look up
 * @returns The TileRequirement object, or null if tile not found
 */
export function getTileRequirements(tileId: string): TileRequirement | null {
  return TILE_REQUIREMENTS[tileId] || null;
}

/**
 * Checks if a tile has specific move requirements.
 *
 * @param tileId - The tile ID to check
 * @returns True if the tile has required moves (non-empty)
 */
export function tileHasRequirements(tileId: string): boolean {
  const requirements = getTileRequirements(tileId);
  return requirements ? requirements.requiredMoves.length > 0 : false;
}

/**
 * Checks if all required moves for a tile have been performed.
 *
 * @param tileId - The tile ID
 * @param movesPerformed - Array of moves performed
 * @returns Object with validation results
 */
export function validateTileRequirements(
  tileId: string,
  movesPerformed: TrackedMove[]
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);
  const requiredMoves = requirements?.requiredMoves || [];
  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  const missingMoves = requiredMoves.filter(
    (required) => !performedMoveTypes.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves,
  };
}

/**
 * Validates tile requirements considering impossible moves.
 *
 * If a required move cannot be performed due to external conditions
 * (empty domain, all seats full), that requirement is automatically
 * considered fulfilled.
 *
 * Impossible Move Detection:
 * - WITHDRAW: Impossible if player's domain was empty at turn start
 * - ASSIST: Impossible if all opponent seats are full
 *
 * @param tileId - The tile ID
 * @param movesPerformed - Array of moves performed
 * @param tilePlayerId - ID of the player who played the tile
 * @param piecesAtTurnStart - Pieces at the start of the turn
 * @param currentPieces - Current pieces on the board
 * @param allPlayers - All players in the game
 * @param playerCount - Number of players (3, 4, or 5)
 * @returns Validation results including impossible moves
 */
export function validateTileRequirementsWithImpossibleMoveExceptions(
  tileId: string,
  movesPerformed: TrackedMove[],
  tilePlayerId: number,
  piecesAtTurnStart: Piece[],
  currentPieces: Piece[],
  allPlayers: Player[],
  playerCount: number
): {
  isMet: boolean;
  requiredMoves: DefinedMoveType[];
  performedMoves: DefinedMoveType[];
  missingMoves: DefinedMoveType[];
  impossibleMoves: DefinedMoveType[];
} {
  const requirements = getTileRequirements(tileId);
  const requiredMoves = requirements?.requiredMoves || [];
  const performedMoveTypes = movesPerformed.map((m) => m.moveType);

  // Check which moves are actually impossible
  const impossibleMoves: DefinedMoveType[] = [];

  // Check for WITHDRAW impossibility: domain empty at turn start
  if (requiredMoves.includes(DefinedMoveType.WITHDRAW)) {
    const domainWasEmptyAtTurnStart = piecesAtTurnStart.every(p => {
      if (!p.locationId) return true;
      const locationPrefix = `p${tilePlayerId}_`;
      return !p.locationId.startsWith(locationPrefix);
    });

    if (domainWasEmptyAtTurnStart && !performedMoveTypes.includes(DefinedMoveType.WITHDRAW)) {
      impossibleMoves.push(DefinedMoveType.WITHDRAW);
    }
  }

  // Check for ASSIST impossibility: all opponent seats are full
  if (requiredMoves.includes(DefinedMoveType.ASSIST)) {
    let allOpponentSeatsAreFull = true;

    // Check each opponent's seats
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== tilePlayerId) {
        // Count vacant seats for this opponent
        const opponentSeats = currentPieces.filter(p =>
          p.locationId && p.locationId.includes(`p${otherPlayer.id}_seat`)
        );
        const maxSeats = 6; // Each player has 6 seats

        if (opponentSeats.length < maxSeats) {
          allOpponentSeatsAreFull = false;
          break;
        }
      }
    }

    if (allOpponentSeatsAreFull && !performedMoveTypes.includes(DefinedMoveType.ASSIST)) {
      impossibleMoves.push(DefinedMoveType.ASSIST);
    }
  }

  // Calculate missing moves, excluding impossible ones
  const missingMoves = requiredMoves.filter(
    (required) => !performedMoveTypes.includes(required) && !impossibleMoves.includes(required)
  );

  return {
    isMet: missingMoves.length === 0,
    requiredMoves,
    performedMoves: performedMoveTypes,
    missingMoves,
    impossibleMoves,
  };
}

/**
 * Checks if a move type is valid (not UNKNOWN).
 *
 * @param moveType - The move type to check
 * @returns True if move type is valid
 */
export function isValidMoveType(moveType: string): boolean {
  return moveType !== 'UNKNOWN';
}

/**
 * Gets the category (O or M) for a move type.
 *
 * @param moveType - The move type
 * @returns 'O' for own pieces, 'M' for manipulating opponents, or undefined
 */
export function getMoveCategory(moveType: DefinedMoveType): 'O' | 'M' | undefined {
  const oMoves: DefinedMoveType[] = [
    DefinedMoveType.ADVANCE,
    DefinedMoveType.WITHDRAW,
    DefinedMoveType.ORGANIZE,
  ];

  const mMoves: DefinedMoveType[] = [
    DefinedMoveType.ASSIST,
    DefinedMoveType.REMOVE,
    DefinedMoveType.INFLUENCE,
  ];

  if (oMoves.includes(moveType)) return 'O';
  if (mMoves.includes(moveType)) return 'M';
  return undefined;
}
