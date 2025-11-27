/**
 * Bureaucracy Module
 *
 * Handles all Bureaucracy phase logic including:
 * - Kredcoin calculation from bureaucracy tiles
 * - Turn order determination
 * - Menu management and affordability checks
 * - Piece promotion validation and execution
 */

import type { Player, Piece, BureaucracyMenuItem } from "../types";
import type { PromotionLocationType } from "../types/bureaucracy";
import {
  TILE_KREDCOIN_VALUES,
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
} from "../config";
import { getPieceById } from "../../utils";

/**
 * Calculates the total Kredcoin value for a player based on their bureaucracy tiles
 */
export function calculatePlayerKredcoin(player: Player): number {
  return player.bureaucracyTiles.reduce((total, tile) => {
    return total + (TILE_KREDCOIN_VALUES[tile.id] || 0);
  }, 0);
}

/**
 * Determines the turn order for Bureaucracy phase based on Kredcoin amounts
 * Returns player IDs sorted by Kredcoin (descending)
 */
export function getBureaucracyTurnOrder(players: Player[]): number[] {
  const playerKredcoin = players.map((p) => ({
    id: p.id,
    kredcoin: calculatePlayerKredcoin(p),
  }));

  // Sort by kredcoin descending, then by player id ascending (for tie-breaking)
  playerKredcoin.sort((a, b) => {
    if (b.kredcoin !== a.kredcoin) {
      return b.kredcoin - a.kredcoin;
    }
    return a.id - b.id;
  });

  return playerKredcoin.map((pk) => pk.id);
}

/**
 * Gets the Bureaucracy menu for a specific player count
 */
export function getBureaucracyMenu(playerCount: number): BureaucracyMenuItem[] {
  if (playerCount === 5) {
    return FIVE_PLAYER_BUREAUCRACY_MENU;
  }
  return THREE_FOUR_PLAYER_BUREAUCRACY_MENU;
}

/**
 * Filters menu items that the player can afford
 */
export function getAvailablePurchases(
  menu: BureaucracyMenuItem[],
  remainingKredcoin: number
): BureaucracyMenuItem[] {
  return menu.filter((item) => item.price <= remainingKredcoin);
}

/**
 * Validates that a promotion was performed correctly
 */
export function validatePromotion(
  pieces: Piece[],
  pieceId: string,
  expectedLocationType: PromotionLocationType,
  playerId: number,
  beforePieces: Piece[]
): { isValid: boolean; reason: string } {
  const pieceBefore = getPieceById(beforePieces, pieceId);
  const pieceAfter = getPieceById(pieces, pieceId);

  if (!pieceBefore) {
    return { isValid: false, reason: "Original piece not found" };
  }

  if (!pieceAfter) {
    return { isValid: false, reason: "Piece not found after promotion" };
  }

  // Check if piece was originally in the correct player's domain and location type
  if (!pieceBefore.locationId) {
    return { isValid: false, reason: "Piece was not in a valid location" };
  }

  const locationPattern = new RegExp(
    `^p${playerId}_(office|rostrum\\d+|seat\\d+)$`
  );
  const match = pieceBefore.locationId.match(locationPattern);

  if (!match) {
    return {
      isValid: false,
      reason: `Piece must be in Player ${playerId}'s domain`,
    };
  }

  const actualLocationType = match[1];

  if (expectedLocationType === "OFFICE" && actualLocationType !== "office") {
    return {
      isValid: false,
      reason: "Piece must be in the Office for this promotion",
    };
  }

  if (
    expectedLocationType === "ROSTRUM" &&
    !actualLocationType.startsWith("rostrum")
  ) {
    return {
      isValid: false,
      reason: "Piece must be in a Rostrum for this promotion",
    };
  }

  if (
    expectedLocationType === "SEAT" &&
    !actualLocationType.startsWith("seat")
  ) {
    return {
      isValid: false,
      reason: "Piece must be in a Seat for this promotion",
    };
  }

  // Check that the piece type was valid (Mark or Heel only)
  if (pieceBefore.name !== "Mark" && pieceBefore.name !== "Heel") {
    return { isValid: false, reason: "Only Marks and Heels can be promoted" };
  }

  // Check that piece is now in community
  if (
    !pieceAfter.locationId ||
    !pieceAfter.locationId.startsWith("community")
  ) {
    return { isValid: false, reason: "Promoted piece must move to community" };
  }

  // Check that a higher-tier piece now occupies the original location
  const targetPieceType = pieceBefore.name === "Mark" ? "Heel" : "Pawn";
  const newPieceInLocation = pieces.find(
    (p) => p.locationId === pieceBefore.locationId && p.name === targetPieceType
  );

  if (!newPieceInLocation) {
    return {
      isValid: false,
      reason: `A ${targetPieceType} from the community must now occupy the promoted piece's location`,
    };
  }

  return { isValid: true, reason: "Valid promotion" };
}

/**
 * Performs a promotion by swapping with a piece from the community
 * Returns updated pieces array with the swap performed
 */
export function performPromotion(
  pieces: Piece[],
  pieceId: string
): {
  pieces: Piece[];
  success: boolean;
  reason?: string;
} {
  const pieceToPromote = getPieceById(pieces, pieceId);

  if (!pieceToPromote) {
    return { pieces, success: false, reason: "Piece not found" };
  }

  // Determine what piece type we need from community
  let targetPieceType: string;
  if (pieceToPromote.name === "Mark") {
    targetPieceType = "Heel";
  } else if (pieceToPromote.name === "Heel") {
    targetPieceType = "Pawn";
  } else {
    return {
      pieces,
      success: false,
      reason: "Pawns cannot be promoted further",
    };
  }

  // Find a piece of target type in the community
  const communityPiece = pieces.find(
    (p) =>
      p.name === targetPieceType &&
      p.locationId &&
      p.locationId.startsWith("community")
  );

  if (!communityPiece) {
    return {
      pieces,
      success: false,
      reason: `No ${targetPieceType} available in community for promotion`,
    };
  }

  // Store the locations before swap
  const promotedPieceLocation = pieceToPromote.locationId;
  const communityPieceLocation = communityPiece.locationId;

  // Perform the swap
  const updatedPieces = pieces.map((piece) => {
    if (piece.id === pieceId) {
      // Move promoted piece to community with demoted type
      return {
        ...piece,
        locationId: communityPieceLocation,
        position: communityPiece.position,
        rotation: communityPiece.rotation,
      };
    } else if (piece.id === communityPiece.id) {
      // Move community piece to the promoted location
      return {
        ...piece,
        locationId: promotedPieceLocation,
        position: pieceToPromote.position,
        rotation: pieceToPromote.rotation,
      };
    }
    return piece;
  });

  return { pieces: updatedPieces, success: true };
}
