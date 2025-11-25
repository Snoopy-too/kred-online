/**
 * Movement Validation - Piece movement rules and move type determination
 *
 * Purpose: Functions for validating piece movements and determining move types
 * Dependencies: Types (Piece), Rostrum rules, Location utilities, Adjacency rules
 * Usage: Used during drag-and-drop and tile play to validate legal moves
 *
 * @module rules/movement
 */

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  // Piece types - game pieces
  Piece,
} from "../types";

// ============================================================================
// GAME LOGIC IMPORTS - Core game functions
// ============================================================================
import {
  // Location utilities - player ID extraction
  getPlayerIdFromLocationId,
} from "../game";

// ============================================================================
// RULES IMPORTS - Game rules enforcement
// ============================================================================
import {
  // Rostrum rules - support requirements
  getRostrumSupportRule,
  countPiecesInSeats,
  areSupportingSeatsFullForRostrum,
  areBothRostrumsFilledForPlayer,

  // Adjacency rules - seat positioning
  areSeatsAdjacent,
} from "../rules";

// ============================================================================
// UTILITY IMPORTS - Helper functions
// ============================================================================
import {
  // Location formatting - human-readable location names
  formatLocationId,
} from "../utils";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Checks if a piece can be moved to a specific location based on game rules
 *
 * RULES:
 * 1. Pieces can only be moved to rostrums if ALL supporting seats are full
 * 2. Pieces can only be moved to a player's office if BOTH rostrums are filled
 * 3. Opponents cannot move a piece to another player's rostrum or office
 * 4. Opponents cannot move a piece FROM another player's rostrum or office
 * 5. Community spaces are always accessible (no restrictions)
 * 6. Players may NOT move pieces between hierarchy levels within a domain
 * 7. Players may NOT move pieces laterally between their own rostrums
 *
 * @param pieceId - The ID of the piece being moved
 * @param currentLocationId - The current location of the piece
 * @param targetLocationId - The target location for the piece
 * @param movingPlayerId - The ID of the player making the move
 * @param pieces - The current pieces on the board
 * @returns An object with { isAllowed: boolean, reason: string }
 *
 * @example
 * ```typescript
 * const validation = validatePieceMovement(
 *   "piece1",
 *   "community",
 *   "p1_rostrum1",
 *   1,
 *   pieces
 * );
 * if (!validation.isAllowed) {
 *   console.log(validation.reason);
 * }
 * ```
 */
export function validatePieceMovement(
  pieceId: string,
  currentLocationId: string | undefined,
  targetLocationId: string,
  movingPlayerId: number,
  pieces: Piece[]
): { isAllowed: boolean; reason: string } {
  // Community locations are always accessible
  if (targetLocationId.includes("community")) {
    return {
      isAllowed: true,
      reason: "Community spaces are always accessible",
    };
  }

  const targetPlayerId = getPlayerIdFromLocationId(targetLocationId);
  if (!targetPlayerId) {
    return {
      isAllowed: true,
      reason: "Location has no ownership restrictions",
    };
  }

  const currentPlayerId = currentLocationId
    ? getPlayerIdFromLocationId(currentLocationId)
    : null;
  const isOwnPiece =
    currentPlayerId === movingPlayerId || movingPlayerId === targetPlayerId;

  // --- RULE: Players may NOT move pieces between hierarchy levels within a domain ---
  // For OPPONENT domains: Block seat ↔ rostrum, rostrum ↔ office, seat ↔ office
  // For OWN domain: Block rostrum1 ↔ rostrum2 (lateral rostrum movement)
  if (currentPlayerId && targetPlayerId && currentPlayerId === targetPlayerId) {
    const sourceIsSeat = currentLocationId?.includes("seat");
    const sourceIsRostrum = currentLocationId?.includes("rostrum");
    const sourceIsOffice = currentLocationId?.includes("office");
    const targetIsSeat = targetLocationId.includes("seat");
    const targetIsRostrum = targetLocationId.includes("rostrum");
    const targetIsOffice = targetLocationId.includes("office");

    // RULE 1: Block opponent hierarchy movements (vertical hierarchy changes)
    if (currentPlayerId !== movingPlayerId) {
      const crossingHierarchy =
        (sourceIsSeat && (targetIsRostrum || targetIsOffice)) ||
        (sourceIsRostrum && (targetIsSeat || targetIsOffice)) ||
        (sourceIsOffice && (targetIsSeat || targetIsRostrum));

      if (crossingHierarchy) {
        return {
          isAllowed: false,
          reason: `Cannot move opponent's piece between hierarchy levels (from ${formatLocationId(
            currentLocationId
          )} to ${formatLocationId(targetLocationId)})`,
        };
      }
    }

    // RULE 2: Block own rostrum-to-rostrum movements (lateral at same level)
    if (
      currentPlayerId === movingPlayerId &&
      sourceIsRostrum &&
      targetIsRostrum
    ) {
      // Check if moving between rostrum1 and rostrum2
      if (currentLocationId !== targetLocationId) {
        return {
          isAllowed: false,
          reason: `Cannot move piece between your own rostrums (from ${formatLocationId(
            currentLocationId
          )} to ${formatLocationId(targetLocationId)})`,
        };
      }
    }
  }

  // --- Moving to a ROSTRUM ---
  if (targetLocationId.includes("rostrum")) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's rostrum`,
      };
    }

    // RULE 1: Check if all supporting seats are full
    if (!areSupportingSeatsFullForRostrum(targetLocationId, pieces)) {
      const rule = getRostrumSupportRule(targetLocationId);
      if (rule) {
        const occupied = countPiecesInSeats(rule.supportingSeats, pieces);
        return {
          isAllowed: false,
          reason: `Cannot move to ${formatLocationId(
            targetLocationId
          )} - only ${occupied}/3 supporting seats are full`,
        };
      }
    }

    return { isAllowed: true, reason: "All supporting seats are full" };
  }

  // --- Moving to an OFFICE ---
  if (targetLocationId.includes("office")) {
    if (targetPlayerId !== movingPlayerId) {
      return {
        isAllowed: false,
        reason: `Cannot move a piece to opponent's office`,
      };
    }

    // RULE 2: Check if both rostrums are filled
    if (!areBothRostrumsFilledForPlayer(targetPlayerId, pieces)) {
      return {
        isAllowed: false,
        reason: `Cannot move to office - not both rostrums are filled yet`,
      };
    }

    return { isAllowed: true, reason: "Both rostrums are filled" };
  }

  // All other moves are valid
  return { isAllowed: true, reason: "Move is valid" };
}

/**
 * Validates if a piece movement is legal and returns the move type
 *
 * Determines the type of move being made based on source and destination locations.
 * Returns 'UNKNOWN' if the move is illegal.
 *
 * Move types:
 * - ADVANCE: Moving up hierarchy in own domain (community→seat, seat→rostrum, rostrum→office)
 * - ASSIST: Moving to opponent's domain from community
 * - WITHDRAW: Moving down hierarchy (office→rostrum, rostrum→seat, seat→community)
 * - ORGANIZE: Moving laterally in own domain (seat↔seat, rostrum↔rostrum)
 * - INFLUENCE: Moving laterally in opponent's domain (seat↔seat, rostrum↔rostrum)
 * - UNKNOWN: Illegal move
 *
 * @param fromLocationId - The source location ID
 * @param toLocationId - The destination location ID
 * @param movingPlayerId - The ID of the player making the move
 * @param currentPiece - The piece being moved
 * @param allPieces - All pieces on the board
 * @param playerCount - The number of players (3, 4, or 5)
 * @returns The move type string or 'UNKNOWN' if illegal
 *
 * @example
 * ```typescript
 * const moveType = validateMoveType(
 *   "community",
 *   "p1_seat1",
 *   1,
 *   piece,
 *   allPieces,
 *   3
 * );
 * console.log(moveType); // "ADVANCE"
 * ```
 */
export function validateMoveType(
  fromLocationId: string | undefined,
  toLocationId: string | undefined,
  movingPlayerId: number,
  currentPiece: Piece,
  allPieces: Piece[],
  playerCount: number
): string {
  if (!fromLocationId || !toLocationId) return "UNKNOWN";

  const isCommunity = (loc?: string) => loc?.includes("community");
  const isSeat = (loc?: string) => loc?.includes("_seat");
  const isRostrum = (loc?: string) => loc?.includes("_rostrum");
  const isOffice = (loc?: string) => loc?.includes("_office");
  const getPlayerFromLocation = (loc?: string): number | null => {
    const match = loc?.match(/p(\d+)_/);
    return match ? parseInt(match[1]) : null;
  };

  // Rule 1: Community → Seat/Rostrum/Office = ADVANCE or ASSIST
  if (
    isCommunity(fromLocationId) &&
    (isSeat(toLocationId) || isRostrum(toLocationId) || isOffice(toLocationId))
  ) {
    const ownerPlayer = getPlayerFromLocation(toLocationId);
    return ownerPlayer === movingPlayerId ? "ADVANCE" : "ASSIST";
  }
  // Rule 2: Seat → Community = WITHDRAW
  else if (isSeat(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 3: Seat → Seat = ORGANIZE or INFLUENCE (only if adjacent)
  else if (isSeat(fromLocationId) && isSeat(toLocationId)) {
    if (areSeatsAdjacent(fromLocationId, toLocationId, playerCount)) {
      const fromPlayer = getPlayerFromLocation(fromLocationId);
      return fromPlayer === movingPlayerId ? "ORGANIZE" : "INFLUENCE";
    }
    return "UNKNOWN"; // Non-adjacent seat moves are illegal
  }
  // Rule 4: Seat → Rostrum = ADVANCE
  else if (isSeat(fromLocationId) && isRostrum(toLocationId)) {
    return "ADVANCE";
  }
  // Rule 5: Rostrum → Seat = WITHDRAW
  else if (isRostrum(fromLocationId) && isSeat(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 6: Rostrum → Office = ADVANCE
  else if (isRostrum(fromLocationId) && isOffice(toLocationId)) {
    return "ADVANCE";
  }
  // Rule 7: Rostrum → Community = WITHDRAW
  else if (isRostrum(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 8: Rostrum → Rostrum = ORGANIZE or INFLUENCE
  else if (isRostrum(fromLocationId) && isRostrum(toLocationId)) {
    const fromPlayer = getPlayerFromLocation(fromLocationId);
    return fromPlayer === movingPlayerId ? "ORGANIZE" : "INFLUENCE";
  }
  // Rule 9: Office → Rostrum = WITHDRAW
  else if (isOffice(fromLocationId) && isRostrum(toLocationId)) {
    return "WITHDRAW";
  }
  // Rule 10: Office → Community = WITHDRAW
  else if (isOffice(fromLocationId) && isCommunity(toLocationId)) {
    return "WITHDRAW";
  }

  // All other moves are illegal
  return "UNKNOWN";
}
