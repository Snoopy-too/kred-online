/**
 * Turn Handlers
 *
 * Purpose: Handles turn management - advancing to next player, logging turn actions
 * Dependencies: Game state, player management, move tracking
 *
 * @module handlers/turnHandlers
 */

import type { Piece, Player, GameState } from "../types";
import type { Dispatch, SetStateAction } from "react";

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

/**
 * Tile transaction type for tracking tile plays
 */
interface TileTransaction {
  placerId: number;
  receiverId: number;
  tileId: number;
  tile: { id: number; url: string };
  boardTileId: string;
}

// ============================================================================
// DEPENDENCY INTERFACE
// ============================================================================

/**
 * Dependencies required by turn handlers.
 */
export interface TurnHandlerDependencies {
  // --- Current State Values (Read-only) ---
  players: Player[];
  pieces: Piece[];
  playerCount: number;
  currentPlayerIndex: number;

  // --- State Setters ---
  setCurrentPlayerIndex: Dispatch<SetStateAction<number>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setGameLog: Dispatch<SetStateAction<string[]>>;
  setPiecesAtTurnStart: Dispatch<SetStateAction<Piece[]>>;
  setHasPlayedTileThisTurn: Dispatch<SetStateAction<boolean>>;
  setRevealedTileId: Dispatch<SetStateAction<string | null>>;
  setTileTransaction: Dispatch<SetStateAction<TileTransaction | null>>;
  setBystanders: Dispatch<SetStateAction<number[]>>;
  setBystanderIndex: Dispatch<SetStateAction<number>>;
  setIsPrivatelyViewing: Dispatch<SetStateAction<boolean>>;
  setChallengedTile: Dispatch<SetStateAction<string | null>>;
  setPlacerViewingTileId: Dispatch<SetStateAction<string | null>>;
  setMovedPiecesThisTurn: Dispatch<SetStateAction<Set<string>>>;
  setPendingCommunityPieces: Dispatch<SetStateAction<Set<string>>>;

  // --- Utility Functions ---
  getLocationIdFromPosition: (
    position: { top: number; left: number },
    playerCount: number
  ) => string | null;
  formatLocationId: (locationId: string) => string;
}

// ============================================================================
// HANDLER TYPES
// ============================================================================

export interface TurnHandlers {
  generateTurnLog: (
    turnPlayerId: number,
    piecesBefore: Piece[],
    piecesAfter: Piece[],
    countOfPlayers: number,
    tileTransactionAtTurnEnd: TileTransaction | null
  ) => string[];
  advanceTurnNormally: (startingPlayerId?: number) => void;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates turn handlers with injected dependencies.
 *
 * @param deps - Dependencies required by the handlers
 * @returns Object containing all turn handler functions
 */
export function createTurnHandlers(
  deps: TurnHandlerDependencies
): TurnHandlers {
  // ============================================================================
  // generateTurnLog - Generate log entries for actions taken during a turn
  // ============================================================================
  const generateTurnLog = (
    turnPlayerId: number,
    piecesBefore: Piece[],
    piecesAfter: Piece[],
    countOfPlayers: number,
    tileTransactionAtTurnEnd: TileTransaction | null
  ): string[] => {
    const logs: string[] = [];

    const piecesBeforeMap = new Map(piecesBefore.map((p) => [p.id, p]));
    const piecesAfterMap = new Map(piecesAfter.map((p) => [p.id, p]));

    if (
      tileTransactionAtTurnEnd &&
      tileTransactionAtTurnEnd.placerId === turnPlayerId
    ) {
      logs.push(
        `Played a tile for Player ${tileTransactionAtTurnEnd.receiverId}.`
      );
    }

    for (const [id, oldPiece] of piecesBeforeMap.entries()) {
      const newPiece = piecesAfterMap.get(id);
      if (newPiece) {
        if (
          Math.abs(oldPiece.position.left - newPiece.position.left) > 0.01 ||
          Math.abs(oldPiece.position.top - newPiece.position.top) > 0.01
        ) {
          const oldLocId = deps.getLocationIdFromPosition(
            oldPiece.position,
            countOfPlayers
          );
          const newLocId = deps.getLocationIdFromPosition(
            newPiece.position,
            countOfPlayers
          );
          const oldLocStr = oldLocId
            ? deps.formatLocationId(oldLocId)
            : "a location";
          const newLocStr = newLocId
            ? deps.formatLocationId(newLocId)
            : "another location";
          logs.push(
            `Moved a ${oldPiece.name} from ${oldLocStr} to ${newLocStr}.`
          );
        }
      } else {
        const oldLocId = deps.getLocationIdFromPosition(
          oldPiece.position,
          countOfPlayers
        );
        const oldLocStr = oldLocId
          ? deps.formatLocationId(oldLocId)
          : "a location";
        logs.push(`Returned a ${oldPiece.name} to supply from ${oldLocStr}.`);
      }
    }

    for (const [id, newPiece] of piecesAfterMap.entries()) {
      if (!piecesBeforeMap.has(id)) {
        const newLocId = deps.getLocationIdFromPosition(
          newPiece.position,
          countOfPlayers
        );
        const newLocStr = newLocId
          ? deps.formatLocationId(newLocId)
          : "a location";
        logs.push(`Added a ${newPiece.name} from supply to ${newLocStr}.`);
      }
    }
    return logs;
  };

  // ============================================================================
  // advanceTurnNormally - Move to the next player's turn
  // ============================================================================
  const advanceTurnNormally = (startingPlayerId?: number): void => {
    if (deps.playerCount === 0) {
      console.error("Cannot advance turn: playerCount is 0.");
      return;
    }

    const fromPlayerId =
      startingPlayerId ?? deps.players[deps.currentPlayerIndex]?.id;

    if (!fromPlayerId) {
      console.error("Cannot advance turn: current player not found.");
      return;
    }

    const fromPlayerIndex = deps.players.findIndex(
      (p) => p.id === fromPlayerId
    );
    const nextPlayerIndex = (fromPlayerIndex + 1) % deps.playerCount;

    deps.setCurrentPlayerIndex(nextPlayerIndex);
    deps.setHasPlayedTileThisTurn(false);
    deps.setRevealedTileId(null);
    deps.setGameState("CAMPAIGN");
    deps.setTileTransaction(null);
    deps.setBystanders([]);
    deps.setBystanderIndex(0);
    deps.setIsPrivatelyViewing(false);
    deps.setChallengedTile(null);
    deps.setPlacerViewingTileId(null);

    // Set piece state snapshot for the start of this new turn
    deps.setPiecesAtTurnStart(deps.pieces.map((p) => ({ ...p })));

    // Clear piece movement tracking for new turn
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());
  };

  return {
    generateTurnLog,
    advanceTurnNormally,
  };
}
