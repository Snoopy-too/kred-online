/**
 * Piece Movement Handlers
 *
 * Purpose: Handles piece movement, resets, and board tile movement during gameplay
 * Dependencies: Game validation functions, positioning utilities, state management
 *
 * @module handlers/pieceMovementHandlers
 */

import type {
  Piece,
  Player,
  GameState,
  BoardTile,
  PlayedTileState,
} from "../types";
import type { Dispatch, SetStateAction } from "react";
import { getPieceById } from "../../utils";

// ============================================================================
// DEPENDENCY INTERFACE
// ============================================================================

/**
 * Alert function type for showing messages to users
 */
type ShowAlertFn = (
  title: string,
  message: string,
  type: "info" | "warning" | "error"
) => void;

/**
 * Dependencies required by piece movement handlers.
 */
export interface PieceMovementDependencies {
  // --- Current State Values (Read-only) ---
  pieces: Piece[];
  players: Player[];
  playerCount: number;
  currentPlayerIndex: number;
  movedPiecesThisTurn: Set<string>;
  pendingCommunityPieces: Set<string>;
  piecesAtTurnStart: Piece[];
  piecesAtCorrectionStart: Piece[];
  piecesBeforeBonusMove: Piece[];
  playedTile: PlayedTileState | null;

  // --- State Setters ---
  setPieces: Dispatch<SetStateAction<Piece[]>>;
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  setBoardTiles: Dispatch<SetStateAction<BoardTile[]>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setMovedPiecesThisTurn: Dispatch<SetStateAction<Set<string>>>;
  setPendingCommunityPieces: Dispatch<SetStateAction<Set<string>>>;
  setLastDroppedPosition: Dispatch<
    SetStateAction<{ top: number; left: number } | null>
  >;
  setLastDroppedPieceId: Dispatch<SetStateAction<string | null>>;
  setPlayedTile: Dispatch<SetStateAction<PlayedTileState | null>>;
  setHasPlayedTileThisTurn: Dispatch<SetStateAction<boolean>>;

  // --- Utility Functions ---
  showAlert: ShowAlertFn;
  calculatePieceRotation: (
    position: { top: number; left: number },
    playerCount: number,
    locationId?: string
  ) => number;
  validatePieceMovement: (
    pieceId: string,
    fromLocationId: string | undefined,
    toLocationId: string,
    currentPlayerId: number,
    pieces: Piece[]
  ) => { isAllowed: boolean; reason: string };
  validateMoveType: (
    fromLocationId: string,
    toLocationId: string,
    currentPlayerId: number,
    movingPiece: Piece,
    pieces: Piece[],
    playerCount: number
  ) => string;
  formatLocationId: (locationId: string) => string;

  // --- Alert Messages ---
  ALERTS: {
    PIECE_ALREADY_MOVED: { title: string; message: string };
    CANNOT_MOVE_PIECE: { title: string; message: string };
  };
}

// ============================================================================
// HANDLER TYPES
// ============================================================================

export interface PieceMovementHandlers {
  handlePieceMove: (
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ) => void;
  handleResetTurn: () => void;
  handleResetPiecesCorrection: () => void;
  handleResetBonusMove: () => void;
  handleBoardTileMove: (
    boardTileId: string,
    newPosition: { top: number; left: number }
  ) => void;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates piece movement handlers with injected dependencies.
 *
 * @param deps - Dependencies required by the handlers
 * @returns Object containing all piece movement handler functions
 */
export function createPieceMovementHandlers(
  deps: PieceMovementDependencies
): PieceMovementHandlers {
  // ============================================================================
  // handlePieceMove - Move a piece to a new position
  // ============================================================================
  const handlePieceMove = (
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ): void => {
    // Check if this piece has already been moved this turn
    if (
      deps.movedPiecesThisTurn.has(pieceId) ||
      deps.pendingCommunityPieces.has(pieceId)
    ) {
      deps.showAlert(
        deps.ALERTS.PIECE_ALREADY_MOVED.title,
        deps.ALERTS.PIECE_ALREADY_MOVED.message,
        "warning"
      );
      return;
    }

    const movingPiece = getPieceById(deps.pieces, pieceId);
    if (!movingPiece) return;

    // Check if player is trying to move opponent's piece within opponent's domain
    if (locationId) {
      const currentPlayer = deps.players[deps.currentPlayerIndex];
      if (!currentPlayer) return;

      const validation = deps.validatePieceMovement(
        pieceId,
        movingPiece.locationId,
        locationId,
        currentPlayer.id,
        deps.pieces
      );
      if (!validation.isAllowed) {
        deps.showAlert("Invalid Move", validation.reason, "error");
        return;
      }
    }

    // Check community movement restrictions before allowing the move
    if (
      movingPiece &&
      movingPiece.locationId?.includes("community") &&
      locationId &&
      !locationId.includes("community")
    ) {
      const pieceName = movingPiece.name.toLowerCase();

      // Marks can always move from community
      if (pieceName !== "mark") {
        // Check if Marks are in community (excluding pending pieces)
        const marksInCommunity = deps.pieces.some(
          (p) =>
            p.locationId?.includes("community") &&
            p.name.toLowerCase() === "mark" &&
            !deps.pendingCommunityPieces.has(p.id)
        );

        if (marksInCommunity) {
          deps.showAlert(
            deps.ALERTS.CANNOT_MOVE_PIECE.title,
            deps.ALERTS.CANNOT_MOVE_PIECE.message,
            "warning"
          );
          return;
        }

        // If moving a Pawn, check if Heels are in community
        if (pieceName === "pawn") {
          const heelsInCommunity = deps.pieces.some(
            (p) =>
              p.locationId?.includes("community") &&
              p.name.toLowerCase() === "heel" &&
              !deps.pendingCommunityPieces.has(p.id)
          );
          if (heelsInCommunity) {
            deps.showAlert(
              deps.ALERTS.CANNOT_MOVE_PIECE.title,
              deps.ALERTS.CANNOT_MOVE_PIECE.message,
              "warning"
            );
            return;
          }
        }
      }
    }

    // Check if the move would result in an illegal (UNKNOWN) move type
    if (locationId && movingPiece.locationId) {
      const currentPlayer = deps.players[deps.currentPlayerIndex];
      if (currentPlayer) {
        const moveType = deps.validateMoveType(
          movingPiece.locationId,
          locationId,
          currentPlayer.id,
          movingPiece,
          deps.pieces,
          deps.playerCount
        );

        if (moveType === "UNKNOWN") {
          deps.showAlert(
            "Illegal Move",
            `Cannot move from ${deps.formatLocationId(
              movingPiece.locationId
            )} to ${deps.formatLocationId(
              locationId
            )}. This move violates game rules.`,
            "error"
          );
          return;
        }
      }
    }

    deps.setLastDroppedPosition(newPosition);
    deps.setLastDroppedPieceId(pieceId);
    const newRotation = deps.calculatePieceRotation(
      newPosition,
      deps.playerCount,
      locationId
    );

    // Update the piece position and location
    deps.setPieces((prevPieces) =>
      prevPieces.map((p) =>
        p.id === pieceId
          ? {
              ...p,
              position: newPosition,
              rotation: newRotation,
              ...(locationId !== undefined && { locationId }),
            }
          : p
      )
    );

    // Track that this piece has been moved this turn
    deps.setMovedPiecesThisTurn((prev) => new Set(prev).add(pieceId));

    // If piece is moved to community, mark it as "pending"
    if (locationId && locationId.includes("community")) {
      deps.setPendingCommunityPieces((prev) => new Set(prev).add(pieceId));
    }
  };

  // ============================================================================
  // handleResetTurn - Reset all pieces to turn start state
  // ============================================================================
  const handleResetTurn = (): void => {
    // Restore pieces to turn start state
    deps.setPieces(deps.piecesAtTurnStart.map((p) => ({ ...p })));

    // If a tile was played, return it to player's hand and remove from board
    if (deps.playedTile) {
      const tileId = parseInt(deps.playedTile.tileId);
      const tile = {
        id: tileId,
        url: `./images/${deps.playedTile.tileId}.svg`,
      };

      // Add tile back to player's hand
      deps.setPlayers((prev) =>
        prev.map((p) =>
          p.id === deps.playedTile!.playerId
            ? { ...p, keptTiles: [...p.keptTiles, tile] }
            : p
        )
      );

      // Remove tile from board
      deps.setBoardTiles((prev) =>
        prev.filter(
          (bt) =>
            !(
              bt.placerId === deps.playedTile!.playerId &&
              bt.ownerId === deps.playedTile!.receivingPlayerId
            )
        )
      );

      // Clear the played tile state
      deps.setPlayedTile(null);
      deps.setGameState("CAMPAIGN");
      deps.setHasPlayedTileThisTurn(false);
    }

    // Clear tracking sets
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    deps.setLastDroppedPosition(null);
    deps.setLastDroppedPieceId(null);
  };

  // ============================================================================
  // handleResetPiecesCorrection - Reset pieces during correction phase
  // ============================================================================
  const handleResetPiecesCorrection = (): void => {
    // Reset pieces to correction start state while keeping tile in play
    if (deps.piecesAtCorrectionStart.length > 0) {
      deps.setPieces(deps.piecesAtCorrectionStart.map((p) => ({ ...p })));
    }

    // Clear movement tracking for fresh correction attempt
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    deps.setLastDroppedPosition(null);
    deps.setLastDroppedPieceId(null);
  };

  // ============================================================================
  // handleResetBonusMove - Reset pieces to state before bonus move
  // ============================================================================
  const handleResetBonusMove = (): void => {
    // Reset pieces to state before bonus move started
    deps.setPieces(deps.piecesBeforeBonusMove.map((p) => ({ ...p })));

    // Clear tracking sets
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    deps.setLastDroppedPosition(null);
    deps.setLastDroppedPieceId(null);
  };

  // ============================================================================
  // handleBoardTileMove - Move a board tile to a new position
  // ============================================================================
  const handleBoardTileMove = (
    boardTileId: string,
    newPosition: { top: number; left: number }
  ): void => {
    deps.setLastDroppedPosition(newPosition);
    deps.setBoardTiles((prevBoardTiles) =>
      prevBoardTiles.map((bt) =>
        bt.id === boardTileId ? { ...bt, position: newPosition } : bt
      )
    );
  };

  return {
    handlePieceMove,
    handleResetTurn,
    handleResetPiecesCorrection,
    handleResetBonusMove,
    handleBoardTileMove,
  };
}
