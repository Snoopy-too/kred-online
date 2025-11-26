import { useState } from "react";
import type { Piece, TrackedMove } from "../types";

/**
 * Move check result interface.
 */
interface MoveCheckResult {
  isMet: boolean;
  requiredMoves: TrackedMove[];
  performedMoves: TrackedMove[];
  missingMoves: TrackedMove[];
  hasExtraMoves: boolean;
  extraMoves: string[];
  moveValidations?: Array<{
    moveType: string;
    isValid: boolean;
    reason: string;
    fromLocationId?: string;
    toLocationId?: string;
  }>;
}

/**
 * Custom hook for tracking piece movements and validating moves.
 *
 * Provides state for:
 * - Piece positions at different stages (turn start, bonus move, correction)
 * - Moved pieces tracking (one move per piece rule)
 * - Last dropped piece position
 * - Move validation results
 *
 * Dependencies: None (can work standalone, but typically used with useGameState)
 *
 * @returns Move tracking state and validation functions
 */
export function useMoveTracking() {
  // Piece snapshots at various stages
  const [piecesAtTurnStart, setPiecesAtTurnStart] = useState<Piece[]>([]);
  const [piecesBeforeBonusMove, setPiecesBeforeBonusMove] = useState<Piece[]>(
    []
  );
  const [piecesAtCorrectionStart, setPiecesAtCorrectionStart] = useState<
    Piece[]
  >([]);

  // Track which pieces have been moved this turn (prevents multi-move)
  const [movedPiecesThisTurn, setMovedPiecesThisTurn] = useState<Set<string>>(
    new Set()
  );

  // Last drop tracking for visual feedback
  const [lastDroppedPosition, setLastDroppedPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [lastDroppedPieceId, setLastDroppedPieceId] = useState<string | null>(
    null
  );

  // Move validation results
  const [showMoveCheckResult, setShowMoveCheckResult] = useState(false);
  const [moveCheckResult, setMoveCheckResult] =
    useState<MoveCheckResult | null>(null);

  /**
   * Take a snapshot of current piece positions.
   * @param pieces - The pieces to snapshot
   */
  const snapshotPiecesForTurn = (pieces: Piece[]) => {
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));
  };

  /**
   * Take a snapshot before bonus move begins.
   * @param pieces - The pieces to snapshot
   */
  const snapshotPiecesForBonusMove = (pieces: Piece[]) => {
    setPiecesBeforeBonusMove(pieces.map((p) => ({ ...p })));
  };

  /**
   * Take a snapshot before correction phase.
   * @param pieces - The pieces to snapshot
   */
  const snapshotPiecesForCorrection = (pieces: Piece[]) => {
    setPiecesAtCorrectionStart(pieces.map((p) => ({ ...p })));
  };

  /**
   * Mark a piece as moved this turn.
   * @param pieceId - The ID of the piece that moved
   */
  const markPieceMoved = (pieceId: string) => {
    setMovedPiecesThisTurn((prev) => new Set(prev).add(pieceId));
  };

  /**
   * Check if a piece has already moved this turn.
   * @param pieceId - The ID of the piece to check
   * @returns True if the piece has moved
   */
  const hasPieceMoved = (pieceId: string): boolean => {
    return movedPiecesThisTurn.has(pieceId);
  };

  /**
   * Clear all moved pieces tracking (start of new turn).
   */
  const clearMovedPieces = () => {
    setMovedPiecesThisTurn(new Set());
  };

  /**
   * Record the position where a piece was dropped.
   * @param position - The drop position
   * @param pieceId - The ID of the dropped piece
   */
  const recordDropPosition = (
    position: { top: number; left: number } | null,
    pieceId: string | null
  ) => {
    setLastDroppedPosition(position);
    setLastDroppedPieceId(pieceId);
  };

  /**
   * Clear the drop position tracking.
   */
  const clearDropPosition = () => {
    setLastDroppedPosition(null);
    setLastDroppedPieceId(null);
  };

  /**
   * Display move validation results.
   * @param result - The validation result to display
   */
  const displayMoveCheckResult = (result: MoveCheckResult) => {
    setMoveCheckResult(result);
    setShowMoveCheckResult(true);
  };

  /**
   * Hide move validation results.
   */
  const hideMoveCheckResult = () => {
    setShowMoveCheckResult(false);
  };

  /**
   * Clear move validation results.
   */
  const clearMoveCheckResult = () => {
    setMoveCheckResult(null);
    setShowMoveCheckResult(false);
  };

  /**
   * Reset all move tracking for a new turn.
   */
  const resetForNewTurn = (currentPieces: Piece[]) => {
    snapshotPiecesForTurn(currentPieces);
    clearMovedPieces();
    clearDropPosition();
    clearMoveCheckResult();
  };

  /**
   * Reset all snapshots and tracking.
   */
  const resetAllTracking = () => {
    setPiecesAtTurnStart([]);
    setPiecesBeforeBonusMove([]);
    setPiecesAtCorrectionStart([]);
    clearMovedPieces();
    clearDropPosition();
    clearMoveCheckResult();
  };

  return {
    // State
    piecesAtTurnStart,
    piecesBeforeBonusMove,
    piecesAtCorrectionStart,
    movedPiecesThisTurn,
    lastDroppedPosition,
    lastDroppedPieceId,
    showMoveCheckResult,
    moveCheckResult,

    // Snapshot actions
    snapshotPiecesForTurn,
    snapshotPiecesForBonusMove,
    snapshotPiecesForCorrection,

    // Move tracking actions
    markPieceMoved,
    hasPieceMoved,
    clearMovedPieces,
    recordDropPosition,
    clearDropPosition,

    // Validation actions
    displayMoveCheckResult,
    hideMoveCheckResult,
    clearMoveCheckResult,

    // Reset actions
    resetForNewTurn,
    resetAllTracking,

    // Direct setters (for backward compatibility)
    setPiecesAtTurnStart,
    setPiecesBeforeBonusMove,
    setPiecesAtCorrectionStart,
    setMovedPiecesThisTurn,
    setLastDroppedPosition,
    setLastDroppedPieceId,
    setShowMoveCheckResult,
    setMoveCheckResult,
  };
}

// Export the MoveCheckResult type for use in other files
export type { MoveCheckResult };
