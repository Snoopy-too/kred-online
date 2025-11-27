import { useCallback } from "react";
import type {
  Player,
  Tile,
  Piece,
  TrackedMove,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../types";
import { TILE_KREDCOIN_VALUES, BANK_SPACES_BY_PLAYER_COUNT } from "../config";
import {
  validateSingleMove,
  validatePromotion,
  performPromotion,
} from "../../game";
import { calculateMoves } from "../game/move-calculation";
import { ALERTS, TIMEOUTS } from "../../constants";
import { getPlayerName } from "../../utils";

/**
 * Dependencies required by the Take Advantage handlers
 */
export interface TakeAdvantageHandlerDependencies {
  // State from useChallengeFlow
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;
  selectedTilesForAdvantage: Tile[];
  totalKredcoinForAdvantage: number;
  takeAdvantagePurchase: BureaucracyPurchase | null;
  takeAdvantagePiecesSnapshot: Piece[];

  // State setters from useChallengeFlow
  setShowTakeAdvantageModal: (show: boolean) => void;
  setTakeAdvantageChallengerId: (id: number | null) => void;
  setTakeAdvantageChallengerCredibility: (cred: number) => void;
  setShowTakeAdvantageTileSelection: (show: boolean) => void;
  setSelectedTilesForAdvantage: (
    tiles: Tile[] | ((prev: Tile[]) => Tile[])
  ) => void;
  setTotalKredcoinForAdvantage: (total: number) => void;
  setShowTakeAdvantageMenu: (show: boolean) => void;
  setTakeAdvantagePurchase: (purchase: BureaucracyPurchase | null) => void;
  setTakeAdvantagePiecesSnapshot: (pieces: Piece[]) => void;
  setTakeAdvantageValidationError: (error: string | null) => void;

  // State from other hooks/App
  players: Player[];
  pieces: Piece[];
  playerCount: number;

  // State setters from App
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setPieces: (pieces: Piece[] | ((prev: Piece[]) => Piece[])) => void;
  setMovesThisTurn: (moves: TrackedMove[]) => void;
  setMovedPiecesThisTurn: (
    set: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setGameLog: (log: string[] | ((prev: string[]) => string[])) => void;
  setBankedTiles: (tiles: any[] | ((prev: any[]) => any[])) => void;

  // Functions
  transitionToCorrectionPhase: (updatedPieces?: Piece[]) => void;
}

/**
 * Validate that a Take Advantage action was performed correctly
 */
export function validateTakeAdvantageAction(
  purchase: BureaucracyPurchase,
  snapshotPieces: Piece[],
  currentPieces: Piece[],
  challengerId: number,
  playerCount: number
): { isValid: boolean; error?: string } {
  const item = purchase.item;

  // CREDIBILITY: Always valid (auto-applied)
  if (item.type === "CREDIBILITY") {
    return { isValid: true };
  }

  // PROMOTION: Check if a piece was swapped to community
  if (item.type === "PROMOTION") {
    const piecesMovedToCommunity = snapshotPieces.filter((originalPiece) => {
      const currentPiece = currentPieces.find((p) => p.id === originalPiece.id);
      return (
        currentPiece &&
        originalPiece.locationId &&
        !originalPiece.locationId.startsWith("community") &&
        currentPiece.locationId &&
        currentPiece.locationId.startsWith("community")
      );
    });

    if (piecesMovedToCommunity.length === 0) {
      return {
        isValid: false,
        error:
          "No promotion was performed. Please click a piece to promote it.",
      };
    }

    if (piecesMovedToCommunity.length > 1) {
      return {
        isValid: false,
        error: "Only one promotion can be performed per purchase.",
      };
    }

    const promotedPieceId = piecesMovedToCommunity[0].id;
    const validation = validatePromotion(
      currentPieces,
      promotedPieceId,
      item.promotionLocation!,
      challengerId,
      snapshotPieces
    );

    if (!validation.isValid) {
      return { isValid: false, error: validation.reason };
    }

    return { isValid: true };
  }

  // MOVE: Check if the performed move matches the selected move type
  if (item.type === "MOVE") {
    const requiredMoveType = item.moveType!;

    // Import areSeatsAdjacent from rules
    const { areSeatsAdjacent } = require("../rules/adjacency");

    const calculatedMoves = calculateMoves(
      snapshotPieces,
      currentPieces,
      challengerId,
      playerCount,
      areSeatsAdjacent
    );

    if (calculatedMoves.length === 0) {
      return { isValid: false, error: "You must perform a move" };
    }

    // Validate each move with proper piece state
    for (let i = 0; i < calculatedMoves.length; i++) {
      const move = calculatedMoves[i];

      // Build piece state after all previous moves but before this move
      let piecesForValidation = snapshotPieces.map((p) => ({ ...p }));
      for (let j = 0; j < i; j++) {
        const prevMove = calculatedMoves[j];
        piecesForValidation = piecesForValidation.map((p) =>
          p.id === prevMove.pieceId
            ? {
                ...p,
                locationId: prevMove.toLocationId,
                position: prevMove.toPosition,
              }
            : p
        );
      }

      const validation = validateSingleMove(
        move,
        challengerId,
        piecesForValidation,
        playerCount
      );
      if (!validation.isValid) {
        return {
          isValid: false,
          error: `${move.moveType} move validation failed: ${validation.reason}`,
        };
      }
    }

    // Check if at least one move matches the expected type
    const hasMatchingMove = calculatedMoves.some(
      (m) => m.moveType === requiredMoveType
    );

    if (!hasMatchingMove) {
      const performedTypes = calculatedMoves.map((m) => m.moveType).join(", ");
      return {
        isValid: false,
        error: `Expected a ${requiredMoveType} move, but you performed: ${performedTypes}`,
      };
    }

    return { isValid: true };
  }

  return { isValid: false, error: "Unknown action type" };
}

/**
 * Custom hook for Take Advantage handler functions.
 *
 * This hook provides all the handler logic for the Take Advantage feature
 * that appears after a successful challenge. It handles:
 * - Declining/accepting the advantage
 * - Tile selection for kredcoin
 * - Action selection (credibility recovery, moves, promotions)
 * - Action validation and completion
 *
 * @param deps - Dependencies required by the handlers
 * @returns Object containing all Take Advantage handlers
 */
export function useTakeAdvantageHandlers(
  deps: TakeAdvantageHandlerDependencies
) {
  const {
    takeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    takeAdvantagePurchase,
    takeAdvantagePiecesSnapshot,
    setShowTakeAdvantageModal,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    setShowTakeAdvantageTileSelection,
    setSelectedTilesForAdvantage,
    setTotalKredcoinForAdvantage,
    setShowTakeAdvantageMenu,
    setTakeAdvantagePurchase,
    setTakeAdvantagePiecesSnapshot,
    setTakeAdvantageValidationError,
    players,
    pieces,
    playerCount,
    setPlayers,
    setPieces,
    setMovesThisTurn,
    setMovedPiecesThisTurn,
    setGameLog,
    setBankedTiles,
    transitionToCorrectionPhase,
  } = deps;

  /**
   * Handler: User chose "No Thanks" (credibility = 3)
   * Decline the Take Advantage offer and continue to correction phase
   */
  const handleTakeAdvantageDecline = useCallback(() => {
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);
    const challengerName = challenger
      ? getPlayerName(challenger, takeAdvantageChallengerId!)
      : "Player";
    setGameLog((prev) => [
      ...prev,
      `${challengerName} declined the Take Advantage reward`,
    ]);

    // Clean up modal state
    setShowTakeAdvantageModal(false);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);

    // Continue to correction phase
    transitionToCorrectionPhase();
  }, [
    players,
    takeAdvantageChallengerId,
    setGameLog,
    setShowTakeAdvantageModal,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    transitionToCorrectionPhase,
  ]);

  /**
   * Handler: User chose "Yes" (credibility = 3)
   * Show tile selection screen
   */
  const handleTakeAdvantageYes = useCallback(() => {
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);

    if (!challenger) {
      console.error("Challenger not found");
      handleTakeAdvantageDecline();
      return;
    }

    // Check if player has any tiles
    if (challenger.bureaucracyTiles.length === 0) {
      setTakeAdvantageValidationError("You have no tiles in your bank");
      setTimeout(() => {
        handleTakeAdvantageDecline();
      }, 2000);
      return;
    }

    // Hide initial modal, show tile selection
    setShowTakeAdvantageModal(false);
    setShowTakeAdvantageTileSelection(true);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
  }, [
    players,
    takeAdvantageChallengerId,
    handleTakeAdvantageDecline,
    setTakeAdvantageValidationError,
    setShowTakeAdvantageModal,
    setShowTakeAdvantageTileSelection,
    setSelectedTilesForAdvantage,
    setTotalKredcoinForAdvantage,
  ]);

  /**
   * Handler: User chose "Recover Credibility" (credibility < 3)
   * Add 1 credibility and continue
   */
  const handleRecoverCredibility = useCallback(() => {
    if (takeAdvantageChallengerId === null) return;

    // Add 1 credibility (max 3)
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === takeAdvantageChallengerId
          ? { ...p, credibility: Math.min(p.credibility + 1, 3) }
          : p
      )
    );

    // Log the recovery
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);
    const challengerName = challenger
      ? getPlayerName(challenger, takeAdvantageChallengerId!)
      : "Player";
    setGameLog((prev) => [
      ...prev,
      `${challengerName} recovered 1 credibility (successful challenge reward)`,
    ]);

    // Clean up modal state
    setShowTakeAdvantageModal(false);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);

    // Continue to correction phase
    transitionToCorrectionPhase();
  }, [
    takeAdvantageChallengerId,
    players,
    setPlayers,
    setGameLog,
    setShowTakeAdvantageModal,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    transitionToCorrectionPhase,
  ]);

  /**
   * Handler: User chose "Purchase Move" (credibility < 3)
   * Show tile selection screen
   */
  const handlePurchaseMove = useCallback(() => {
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);

    if (!challenger) {
      console.error("Challenger not found");
      handleTakeAdvantageDecline();
      return;
    }

    // Check if player has any tiles
    if (challenger.bureaucracyTiles.length === 0) {
      setTakeAdvantageValidationError("You have no tiles in your bank");
      setTimeout(() => {
        handleTakeAdvantageDecline();
      }, 2000);
      return;
    }

    // Hide initial modal, show tile selection
    setShowTakeAdvantageModal(false);
    setShowTakeAdvantageTileSelection(true);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
  }, [
    players,
    takeAdvantageChallengerId,
    handleTakeAdvantageDecline,
    setTakeAdvantageValidationError,
    setShowTakeAdvantageModal,
    setShowTakeAdvantageTileSelection,
    setSelectedTilesForAdvantage,
    setTotalKredcoinForAdvantage,
  ]);

  /**
   * Handler: Toggle tile selection (add or remove from selected array)
   */
  const handleToggleTileSelection = useCallback(
    (tile: Tile) => {
      const isCurrentlySelected = selectedTilesForAdvantage.some(
        (t) => t.id === tile.id
      );

      let newSelection: Tile[];
      if (isCurrentlySelected) {
        newSelection = selectedTilesForAdvantage.filter(
          (t) => t.id !== tile.id
        );
      } else {
        newSelection = [...selectedTilesForAdvantage, tile];
      }

      setSelectedTilesForAdvantage(newSelection);

      const newTotal = newSelection.reduce((sum, t) => {
        return sum + (TILE_KREDCOIN_VALUES[t.id] || 0);
      }, 0);
      setTotalKredcoinForAdvantage(newTotal);
    },
    [
      selectedTilesForAdvantage,
      setSelectedTilesForAdvantage,
      setTotalKredcoinForAdvantage,
    ]
  );

  /**
   * Handler: Confirm tile selection and show action menu
   */
  const handleConfirmTileSelection = useCallback(() => {
    if (selectedTilesForAdvantage.length === 0) {
      setTakeAdvantageValidationError("Please select at least one tile");
      return;
    }

    if (totalKredcoinForAdvantage === 0) {
      setTakeAdvantageValidationError("Selected tiles have no kredcoin value");
      return;
    }

    // Log tile selection
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);
    const challengerName = challenger
      ? getPlayerName(challenger, takeAdvantageChallengerId!)
      : "Player";
    const tileIds = selectedTilesForAdvantage.map((t) => t.id).join(", ");
    setGameLog((prev) => [
      ...prev,
      `${challengerName} selected tiles [${tileIds}] for Take Advantage (₭-${totalKredcoinForAdvantage})`,
    ]);

    // Take snapshot of current pieces (for reset functionality)
    setTakeAdvantagePiecesSnapshot(pieces.map((p) => ({ ...p })));

    // Hide tile selection, show action menu
    setShowTakeAdvantageTileSelection(false);
    setShowTakeAdvantageMenu(true);
  }, [
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    players,
    takeAdvantageChallengerId,
    pieces,
    setTakeAdvantageValidationError,
    setGameLog,
    setTakeAdvantagePiecesSnapshot,
    setShowTakeAdvantageTileSelection,
    setShowTakeAdvantageMenu,
  ]);

  /**
   * Handler: Cancel tile selection
   */
  const handleCancelTileSelection = useCallback(() => {
    const challenger = players.find((p) => p.id === takeAdvantageChallengerId);
    const challengerName = challenger
      ? getPlayerName(challenger, takeAdvantageChallengerId!)
      : "Player";
    setGameLog((prev) => [
      ...prev,
      `${challengerName} cancelled Take Advantage`,
    ]);

    // Clean up state
    setShowTakeAdvantageTileSelection(false);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);

    // Continue to correction phase
    transitionToCorrectionPhase();
  }, [
    players,
    takeAdvantageChallengerId,
    setGameLog,
    setShowTakeAdvantageTileSelection,
    setSelectedTilesForAdvantage,
    setTotalKredcoinForAdvantage,
    setTakeAdvantageChallengerId,
    setTakeAdvantageChallengerCredibility,
    transitionToCorrectionPhase,
  ]);

  /**
   * Handler: User selects an action from the Take Advantage menu
   */
  const handleSelectTakeAdvantageAction = useCallback(
    (item: BureaucracyMenuItem) => {
      // Validate affordability
      if (totalKredcoinForAdvantage < item.price) {
        setTakeAdvantageValidationError(ALERTS.INSUFFICIENT_KREDCOIN.message);
        setTimeout(
          () => setTakeAdvantageValidationError(null),
          TIMEOUTS.VALIDATION_ERROR_SHORT
        );
        return;
      }

      // Create purchase object
      const purchase: BureaucracyPurchase = {
        playerId: takeAdvantageChallengerId!,
        item,
        timestamp: Date.now(),
        completed: false,
      };

      setTakeAdvantagePurchase(purchase);

      // For CREDIBILITY type, apply immediately and complete
      if (item.type === "CREDIBILITY") {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === takeAdvantageChallengerId
              ? { ...p, credibility: Math.min(p.credibility + 1, 3) }
              : p
          )
        );

        const challenger = players.find(
          (p) => p.id === takeAdvantageChallengerId
        );
        const challengerName = challenger
          ? getPlayerName(challenger, takeAdvantageChallengerId!)
          : "Player";
        setGameLog((prev) => [
          ...prev,
          `${challengerName} restored credibility using Take Advantage`,
        ]);

        // Defer completion to allow state updates
        setTimeout(() => {
          // The completion will be handled by handleCompleteTakeAdvantage
        }, 1500);
      }
      // For MOVE and PROMOTION, user needs to perform action on board
    },
    [
      totalKredcoinForAdvantage,
      takeAdvantageChallengerId,
      players,
      setTakeAdvantageValidationError,
      setTakeAdvantagePurchase,
      setPlayers,
      setGameLog,
    ]
  );

  /**
   * Handler: Reset Take Advantage action (restore pieces snapshot)
   */
  const handleResetTakeAdvantageAction = useCallback(() => {
    if (takeAdvantagePiecesSnapshot.length > 0) {
      setPieces(takeAdvantagePiecesSnapshot.map((p) => ({ ...p })));
      setMovesThisTurn([]);
      setMovedPiecesThisTurn(new Set());

      const challenger = players.find(
        (p) => p.id === takeAdvantageChallengerId
      );
      const challengerName = challenger
        ? getPlayerName(challenger, takeAdvantageChallengerId!)
        : "Player";
      setGameLog((prev) => [
        ...prev,
        `${challengerName} reset their Take Advantage action`,
      ]);
    }

    // Clear purchase
    setTakeAdvantagePurchase(null);
  }, [
    takeAdvantagePiecesSnapshot,
    takeAdvantageChallengerId,
    players,
    setPieces,
    setMovesThisTurn,
    setMovedPiecesThisTurn,
    setGameLog,
    setTakeAdvantagePurchase,
  ]);

  /**
   * Handler: Piece promotion during Take Advantage
   */
  const handleTakeAdvantagePiecePromote = useCallback(
    (pieceId: string) => {
      if (
        !takeAdvantagePurchase ||
        takeAdvantagePurchase.item.type !== "PROMOTION"
      ) {
        return;
      }

      const result = performPromotion(pieces, pieceId);

      if (!result.success) {
        setTakeAdvantageValidationError(result.reason || "Promotion failed");
        setTimeout(() => setTakeAdvantageValidationError(null), 3000);
        return;
      }

      setPieces(result.pieces);
    },
    [takeAdvantagePurchase, pieces, setPieces, setTakeAdvantageValidationError]
  );

  return {
    handleTakeAdvantageDecline,
    handleTakeAdvantageYes,
    handleRecoverCredibility,
    handlePurchaseMove,
    handleToggleTileSelection,
    handleConfirmTileSelection,
    handleCancelTileSelection,
    handleSelectTakeAdvantageAction,
    handleResetTakeAdvantageAction,
    handleTakeAdvantagePiecePromote,
    // Export the validation function for use by handleDoneTakeAdvantageAction
    validateTakeAdvantageAction: (purchase: BureaucracyPurchase) =>
      validateTakeAdvantageAction(
        purchase,
        takeAdvantagePiecesSnapshot,
        pieces,
        takeAdvantageChallengerId!,
        playerCount
      ),
  };
}
