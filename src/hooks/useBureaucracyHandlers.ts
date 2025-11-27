/**
 * Bureaucracy Phase Handlers Hook
 *
 * Provides handler logic for the Bureaucracy phase including:
 * - Menu item selection
 * - Action validation (moves, promotions, credibility)
 * - Turn completion
 *
 * Note: handleBureaucracyPieceMove and handleBureaucracyPiecePromote remain in App.tsx
 * due to complex dependencies on determineMoveType and piece tracking.
 *
 * @module hooks/useBureaucracyHandlers
 */

import { useCallback } from "react";
import type {
  Player,
  Piece,
  BoardTile,
  TrackedMove,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../types";
import type { BureaucracyPlayerState } from "../types/bureaucracy";
import { TILE_KREDCOIN_VALUES } from "../config";
import {
  validateSingleMove,
  validatePromotion,
} from "../../game";
import { calculateMoves } from "../game/move-calculation";
import { getPieceById } from "../../utils";
import { areSeatsAdjacent } from "../rules/adjacency";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Game state snapshot for reverting failed actions
 */
export interface GameStateSnapshot {
  pieces: Piece[];
  boardTiles: BoardTile[];
}

/**
 * Dependencies required by the Bureaucracy handlers
 */
export interface BureaucracyHandlerDependencies {
  // Bureaucracy state
  bureaucracyStates: BureaucracyPlayerState[];
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
  currentBureaucracyPurchase: BureaucracyPurchase | null;
  bureaucracySnapshot: GameStateSnapshot | null;

  // Bureaucracy state setters
  setBureaucracyStates: (
    states:
      | BureaucracyPlayerState[]
      | ((prev: BureaucracyPlayerState[]) => BureaucracyPlayerState[])
  ) => void;
  setCurrentBureaucracyPlayerIndex: (index: number) => void;
  setCurrentBureaucracyPurchase: (purchase: BureaucracyPurchase | null) => void;
  setBureaucracySnapshot: (snapshot: GameStateSnapshot | null) => void;
  setBureaucracyMoves: (moves: TrackedMove[]) => void;
  setShowBureaucracyMenu: (show: boolean) => void;
  setBureaucracyValidationError: (error: string | null) => void;
  setShowBureaucracyMoveCheckResult: (show: boolean) => void;
  setMoveCheckResult: (
    result: { isValid: boolean; message: string } | null
  ) => void;

  // Game state
  players: Player[];
  pieces: Piece[];
  boardTiles: BoardTile[];
  playerCount: number;

  // Game state setters
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setPieces: (pieces: Piece[] | ((prev: Piece[]) => Piece[])) => void;
  setBoardTiles: (
    tiles: BoardTile[] | ((prev: BoardTile[]) => BoardTile[])
  ) => void;
  setGameState: (state: string) => void;
  setCurrentPlayerIndex: (index: number) => void;

  // Helper functions
  createGameStateSnapshot: (
    pieces: Piece[],
    boardTiles: BoardTile[]
  ) => GameStateSnapshot;
  checkBureaucracyWinCondition: (
    players: Player[],
    pieces: Piece[]
  ) => number[];
  initializeCampaignPieces: (playerCount: number) => Piece[];
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook providing Bureaucracy phase handlers
 *
 * @param deps - Dependencies required by the handlers
 * @returns Object containing Bureaucracy handlers
 */
export function useBureaucracyHandlers(deps: BureaucracyHandlerDependencies) {
  const {
    bureaucracyStates,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    currentBureaucracyPurchase,
    bureaucracySnapshot,
    setBureaucracyStates,
    setCurrentBureaucracyPlayerIndex,
    setCurrentBureaucracyPurchase,
    setBureaucracySnapshot,
    setBureaucracyMoves,
    setShowBureaucracyMenu,
    setBureaucracyValidationError,
    setShowBureaucracyMoveCheckResult,
    setMoveCheckResult,
    players,
    pieces,
    boardTiles,
    playerCount,
    setPlayers,
    setPieces,
    setBoardTiles,
    setGameState,
    setCurrentPlayerIndex,
    createGameStateSnapshot,
    checkBureaucracyWinCondition,
    initializeCampaignPieces,
  } = deps;

  /**
   * Handler: Select a menu item to purchase
   */
  const handleSelectBureaucracyMenuItem = useCallback(
    (item: BureaucracyMenuItem) => {
      const currentPlayerId =
        bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
      const playerState = bureaucracyStates.find(
        (s) => s.playerId === currentPlayerId
      );

      if (!playerState || playerState.remainingKredcoin < item.price) {
        setBureaucracyValidationError(
          "Insufficient Kredcoin for this purchase"
        );
        return;
      }

      // Create the purchase
      const purchase: BureaucracyPurchase = {
        playerId: currentPlayerId,
        item,
        timestamp: Date.now(),
        completed: false,
      };

      setCurrentBureaucracyPurchase(purchase);
      setShowBureaucracyMenu(false);
      setBureaucracyMoves([]);

      // Take snapshot of game state before action
      setBureaucracySnapshot(createGameStateSnapshot(pieces, boardTiles));

      // If credibility purchase, apply it immediately
      if (item.type === "CREDIBILITY") {
        setPlayers(
          players.map((p) =>
            p.id === currentPlayerId
              ? { ...p, credibility: Math.min(10, p.credibility + 1) }
              : p
          )
        );
      }
    },
    [
      bureaucracyTurnOrder,
      currentBureaucracyPlayerIndex,
      bureaucracyStates,
      setBureaucracyValidationError,
      setCurrentBureaucracyPurchase,
      setShowBureaucracyMenu,
      setBureaucracyMoves,
      setBureaucracySnapshot,
      createGameStateSnapshot,
      pieces,
      boardTiles,
      setPlayers,
      players,
    ]
  );

  /**
   * Handler: Validate and complete a bureaucracy action
   */
  const handleDoneWithBureaucracyAction = useCallback(() => {
    if (!currentBureaucracyPurchase) return;

    const currentPlayerId =
      bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(
      (s) => s.playerId === currentPlayerId
    );
    if (!playerState) return;

    // Validate the action
    let isValid = false;
    let validationMessage = "";

    if (currentBureaucracyPurchase.item.type === "CREDIBILITY") {
      // Credibility restore is always valid (already applied)
      isValid = true;
    } else if (currentBureaucracyPurchase.item.type === "PROMOTION") {
      // Find which piece was swapped to community
      const snapshot = bureaucracySnapshot;
      if (!snapshot) {
        validationMessage = "No snapshot available for validation";
      } else {
        // Find pieces that moved to community
        const piecesMovedToCommunity = snapshot.pieces.filter(
          (originalPiece) => {
            const currentPiece = getPieceById(pieces, originalPiece.id);
            return (
              currentPiece &&
              originalPiece.locationId &&
              !originalPiece.locationId.startsWith("community") &&
              currentPiece.locationId &&
              currentPiece.locationId.startsWith("community")
            );
          }
        );

        if (piecesMovedToCommunity.length === 0) {
          validationMessage =
            "No promotion was performed. Please click a piece to promote it.";
        } else if (piecesMovedToCommunity.length > 1) {
          validationMessage =
            "Only one promotion can be performed per purchase.";
        } else {
          const promotedPieceId = piecesMovedToCommunity[0].id;
          const validation = validatePromotion(
            pieces,
            promotedPieceId,
            currentBureaucracyPurchase.item.promotionLocation!,
            currentPlayerId,
            snapshot.pieces
          );

          if (!validation.isValid) {
            validationMessage = validation.reason;
          } else {
            isValid = true;
          }
        }
      }
    } else if (currentBureaucracyPurchase.item.type === "MOVE") {
      // Use the same calculateMoves logic as Campaign phase
      const snapshot = bureaucracySnapshot;
      if (!snapshot) {
        validationMessage = "No snapshot available for validation";
      } else {
        const calculatedMoves = calculateMoves(
          snapshot.pieces,
          pieces,
          currentPlayerId,
          playerCount,
          areSeatsAdjacent
        );

        // Validate each move with proper piece state
        let allMovesValid = true;
        for (let i = 0; i < calculatedMoves.length; i++) {
          const move = calculatedMoves[i];

          // Build piece state after all previous moves but before this move
          let piecesForValidation = snapshot.pieces.map((p) => ({ ...p }));
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
            currentPlayerId,
            piecesForValidation,
            playerCount
          );
          if (!validation.isValid) {
            allMovesValid = false;
            validationMessage = `${move.moveType} move validation failed: ${validation.reason}`;
            break;
          }
        }

        if (allMovesValid) {
          // Check that at least one move matches the purchased type
          const expectedMoveType = currentBureaucracyPurchase.item.moveType!;
          const hasMatchingMove = calculatedMoves.some(
            (m) => m.moveType === expectedMoveType
          );

          if (!hasMatchingMove) {
            validationMessage = `Expected a ${expectedMoveType} move, but none was found`;
          } else {
            isValid = true;
          }
        }
      }
    }

    if (!isValid) {
      // Revert to snapshot
      if (bureaucracySnapshot) {
        setPieces(bureaucracySnapshot.pieces);
        setBoardTiles(bureaucracySnapshot.boardTiles);
      }
      setBureaucracyValidationError(validationMessage);
      setShowBureaucracyMenu(true);
      setCurrentBureaucracyPurchase(null);
      setBureaucracyMoves([]);
      return;
    }

    // Purchase successful - deduct kredcoin
    const updatedStates = bureaucracyStates.map((s) => {
      if (s.playerId === currentPlayerId) {
        return {
          ...s,
          remainingKredcoin:
            s.remainingKredcoin - currentBureaucracyPurchase.item.price,
          purchases: [
            ...s.purchases,
            { ...currentBureaucracyPurchase, completed: true },
          ],
        };
      }
      return s;
    });

    setBureaucracyStates(updatedStates);
    setCurrentBureaucracyPurchase(null);
    setShowBureaucracyMenu(true);
    setBureaucracyMoves([]);

    // Deduct tiles from bureaucracyTiles
    const updatedPlayers = players.map((p) => {
      if (p.id === currentPlayerId) {
        let remainingPrice = currentBureaucracyPurchase.item.price;
        const newBureaucracyTiles = [...p.bureaucracyTiles];

        // Remove tiles to cover the price
        while (remainingPrice > 0 && newBureaucracyTiles.length > 0) {
          const tile = newBureaucracyTiles[newBureaucracyTiles.length - 1];
          const tileValue = TILE_KREDCOIN_VALUES[tile.id] || 0;

          newBureaucracyTiles.pop();
          remainingPrice -= tileValue;
        }

        return { ...p, bureaucracyTiles: newBureaucracyTiles };
      }
      return p;
    });

    setPlayers(updatedPlayers);
  }, [
    currentBureaucracyPurchase,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    bureaucracyStates,
    bureaucracySnapshot,
    pieces,
    playerCount,
    setPieces,
    setBoardTiles,
    setBureaucracyValidationError,
    setShowBureaucracyMenu,
    setCurrentBureaucracyPurchase,
    setBureaucracyMoves,
    setBureaucracyStates,
    players,
    setPlayers,
  ]);

  /**
   * Handler: Complete the current player's bureaucracy turn
   */
  const completeBureaucracyTurn = useCallback(() => {
    const currentPlayerId =
      bureaucracyTurnOrder[currentBureaucracyPlayerIndex];

    // Mark turn as complete
    const updatedStates = bureaucracyStates.map((s) =>
      s.playerId === currentPlayerId ? { ...s, turnComplete: true } : s
    );
    setBureaucracyStates(updatedStates);

    // Move to next player
    const nextIndex = currentBureaucracyPlayerIndex + 1;

    if (nextIndex >= bureaucracyTurnOrder.length) {
      // All players have finished - check win condition
      const winners = checkBureaucracyWinCondition(players, pieces);

      if (winners.length > 0) {
        if (winners.length === 1) {
          alert(`Player ${winners[0]} has won the game!`);
        } else {
          alert(`The game is a draw! Winners: ${winners.join(", ")}`);
        }
        return;
      }

      // No winner - transition back to campaign for next round
      setGameState("CAMPAIGN");
      setBureaucracyStates([]);
      setCurrentBureaucracyPlayerIndex(0);

      // Re-initialize campaign pieces
      const newPieces = initializeCampaignPieces(playerCount);
      setPieces(newPieces);

      // Find player with tile 03 for first turn
      const playerWith03 = players.find((p) =>
        p.bureaucracyTiles.some((t) => t.id === 3)
      );
      const startingPlayerIndex = playerWith03
        ? players.findIndex((p) => p.id === playerWith03.id)
        : 0;
      setCurrentPlayerIndex(startingPlayerIndex);
    } else {
      setCurrentBureaucracyPlayerIndex(nextIndex);
    }
  }, [
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    bureaucracyStates,
    setBureaucracyStates,
    checkBureaucracyWinCondition,
    players,
    pieces,
    setGameState,
    setCurrentBureaucracyPlayerIndex,
    initializeCampaignPieces,
    playerCount,
    setPieces,
    setCurrentPlayerIndex,
  ]);

  /**
   * Handler: Finish the current player's bureaucracy turn
   */
  const handleFinishBureaucracyTurn = useCallback(() => {
    completeBureaucracyTurn();
  }, [completeBureaucracyTurn]);

  /**
   * Handler: Check if a move is valid during bureaucracy
   */
  const handleCheckBureaucracyMove = useCallback(() => {
    if (!currentBureaucracyPurchase || !bureaucracySnapshot) {
      setMoveCheckResult({
        isValid: false,
        message: "No active purchase or snapshot",
      });
      setShowBureaucracyMoveCheckResult(true);
      return;
    }

    const currentPlayerId =
      bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const calculatedMoves = calculateMoves(
      bureaucracySnapshot.pieces,
      pieces,
      currentPlayerId,
      playerCount,
      areSeatsAdjacent
    );

    if (calculatedMoves.length === 0) {
      setMoveCheckResult({
        isValid: false,
        message: "No moves detected. Move a piece to perform the action.",
      });
    } else {
      const expectedMoveType = currentBureaucracyPurchase.item.moveType;
      const hasMatchingMove = calculatedMoves.some(
        (m) => m.moveType === expectedMoveType
      );

      if (hasMatchingMove) {
        setMoveCheckResult({
          isValid: true,
          message: `Valid ${expectedMoveType} move detected!`,
        });
      } else {
        setMoveCheckResult({
          isValid: false,
          message: `Expected ${expectedMoveType} but found: ${calculatedMoves.map((m) => m.moveType).join(", ")}`,
        });
      }
    }
    setShowBureaucracyMoveCheckResult(true);
  }, [
    currentBureaucracyPurchase,
    bureaucracySnapshot,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    pieces,
    playerCount,
    setMoveCheckResult,
    setShowBureaucracyMoveCheckResult,
  ]);

  /**
   * Handler: Close the move check result modal
   */
  const handleCloseBureaucracyMoveCheckResult = useCallback(() => {
    setShowBureaucracyMoveCheckResult(false);
  }, [setShowBureaucracyMoveCheckResult]);

  /**
   * Handler: Reset the current bureaucracy action
   */
  const handleResetBureaucracyAction = useCallback(() => {
    if (bureaucracySnapshot) {
      setPieces(bureaucracySnapshot.pieces);
      setBoardTiles(bureaucracySnapshot.boardTiles);
    }
    setBureaucracyMoves([]);
  }, [bureaucracySnapshot, setPieces, setBoardTiles, setBureaucracyMoves]);

  /**
   * Handler: Clear validation error
   */
  const handleClearBureaucracyValidationError = useCallback(() => {
    setBureaucracyValidationError(null);
  }, [setBureaucracyValidationError]);

  return {
    handleSelectBureaucracyMenuItem,
    handleDoneWithBureaucracyAction,
    handleFinishBureaucracyTurn,
    handleCheckBureaucracyMove,
    handleCloseBureaucracyMoveCheckResult,
    handleResetBureaucracyAction,
    handleClearBureaucracyValidationError,
    completeBureaucracyTurn,
  };
}
