import React from "react";
import type { 
  Player, 
  Piece, 
  BoardTile, 
  BureaucracyMenuItem, 
  BureaucracyPurchase, 
  BureaucracyPlayerState, 
  TrackedMove, 
  GameState 
} from "../types";
import { 
  getAvailablePurchases, 
  getBureaucracyMenu, 
  validatePromotion, 
  createGameStateSnapshot,
  performPromotion,
  determineMoveType,
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder
} from "../game";
import { TILE_KREDCOIN_VALUES } from "../config";
import { checkBureaucracyWinCondition } from "../rules";
import { getPlayerName, formatWinnerNames, getPieceById } from "../utils";

interface useBureaucracyHandlersProps {
  players: Player[];
  pieces: Piece[];
  playerCount: number;
  boardTiles: BoardTile[];
  bureaucracyStates: BureaucracyPlayerState[];
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
  currentBureaucracyPurchase: BureaucracyPurchase | null;
  bureaucracySnapshot: any;
  bureaucracyMoves: TrackedMove[];
  setPlayers: (players: Player[]) => void;
  setPieces: (pieces: Piece[]) => void;
  setBoardTiles: (tiles: BoardTile[]) => void;
  setGameState: (state: GameState) => void;
  setBureaucracyStates: (states: BureaucracyPlayerState[]) => void;
  setCurrentBureaucracyPlayerIndex: (index: number) => void;
  setCurrentBureaucracyPurchase: (purchase: BureaucracyPurchase | null) => void;
  setShowBureaucracyMenu: (show: boolean) => void;
  setBureaucracyValidationError: (error: string | null) => void;
  setBureaucracyMoves: (moves: TrackedMove[]) => void;
  setBureaucracySnapshot: (snapshot: any) => void;
  setBureaucracyMoveCheckResult: (result: any) => void;
  setShowBureaucracyMoveCheckResult: (show: boolean) => void;
  setShowFinishTurnConfirm: (state: { isOpen: boolean; remainingKredcoin: number }) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setBankedTiles: (tiles: any[]) => void;
  setBureaucracyTurnOrder: (order: number[]) => void;
  calculateMoves: (original: Piece[], current: Piece[], playerId: number) => TrackedMove[];
  validateSingleMove: (move: TrackedMove, playerId: number, pieces: Piece[], playerCount: number) => { isValid: boolean; reason?: string };
  calculatePieceRotation: (position: any, playerCount: number, locationId?: string) => number;
}

export function useBureaucracyHandlers({
  players,
  pieces,
  playerCount,
  boardTiles,
  bureaucracyStates,
  bureaucracyTurnOrder,
  currentBureaucracyPlayerIndex,
  currentBureaucracyPurchase,
  bureaucracySnapshot,
  bureaucracyMoves,
  setPlayers,
  setPieces,
  setBoardTiles,
  setGameState,
  setBureaucracyStates,
  setCurrentBureaucracyPlayerIndex,
  setCurrentBureaucracyPurchase,
  setShowBureaucracyMenu,
  setBureaucracyValidationError,
  setBureaucracyMoves,
  setBureaucracySnapshot,
  setBureaucracyMoveCheckResult,
  setShowBureaucracyMoveCheckResult,
  setShowFinishTurnConfirm,
  setCurrentPlayerIndex,
  setBankedTiles,
  setBureaucracyTurnOrder,
  calculateMoves,
  validateSingleMove,
  calculatePieceRotation,
}: useBureaucracyHandlersProps) {

  const handleSelectBureaucracyMenuItem = React.useCallback((item: BureaucracyMenuItem) => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(
      (s) => s.playerId === currentPlayerId
    );

    if (!playerState || playerState.remainingKredcoin < item.price) {
      setBureaucracyValidationError("Insufficient Kredcoin for this purchase");
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
  }, [bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, pieces, boardTiles, players, setBureaucracyValidationError, setCurrentBureaucracyPurchase, setShowBureaucracyMenu, setBureaucracyMoves, setBureaucracySnapshot, setPlayers]);

  const handleDoneWithBureaucracyAction = React.useCallback(() => {
    if (!currentBureaucracyPurchase) return;

    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
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
      // Find which piece was swapped to community (should now be in community)
      const snapshot = bureaucracySnapshot;
      if (!snapshot) {
        validationMessage = "No snapshot available for validation";
      } else {
        // Find pieces that moved to community
        const piecesMovedToCommunity = snapshot.pieces.filter(
          (originalPiece: Piece) => {
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
          currentPlayerId
        );

        // Validate each move with proper piece state (same as Campaign)
        // We need to validate using the piece state BEFORE the move, not after
        let allMovesValid = true;
        for (let i = 0; i < calculatedMoves.length; i++) {
          const move = calculatedMoves[i];

          // Build piece state after all previous moves but before this move
          let piecesForValidation = snapshot.pieces.map((p: Piece) => ({ ...p }));
          for (let j = 0; j < i; j++) {
            const prevMove = calculatedMoves[j];
            piecesForValidation = piecesForValidation.map((p: Piece) =>
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
  }, [currentBureaucracyPurchase, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, pieces, bureaucracySnapshot, playerCount, calculateMoves, validateSingleMove, setPieces, setBoardTiles, setBureaucracyValidationError, setShowBureaucracyMenu, setCurrentBureaucracyPurchase, setBureaucracyMoves, setBureaucracyStates, players, setPlayers]);

  const completeBureaucracyTurn = React.useCallback(() => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];

    // Clear any leftover validation error so it doesn't bleed into the next
    // player's turn (host can accumulate errors while replaying guest actions).
    setBureaucracyValidationError(null);

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
          const winnerName = getPlayerName(
            players.find(p => p.id === winners[0]),
            winners[0]
          );
          alert(`${winnerName} has won the game!`);
        } else {
          alert(`The game is a draw! Winners: ${winners.join(", ")}`);
        }
        // Could add a game over state here
        return;
      }

      // No winner - transition back to campaign for next round
      // Bureaucracy tiles become the hand (keptTiles) for the next campaign phase
      const updatedPlayers = players.map((p) => ({
        ...p,
        hand: [],
        keptTiles: [...p.bureaucracyTiles],
        bureaucracyTiles: [],
      }));

      setPlayers(updatedPlayers);

      // Clear bank spaces for the new round
      setBankedTiles([]);

      // Player with tile 03 goes first in the new campaign round
      const startingTileId = 3;
      const startingPlayerIndex = updatedPlayers.findIndex(
        (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
      );
      if (startingPlayerIndex !== -1) {
        setCurrentPlayerIndex(startingPlayerIndex);
      } else {
        setCurrentPlayerIndex(0);
      }

      setGameState("CAMPAIGN");
      setBureaucracyStates([]);
      setBureaucracyTurnOrder([]);
      setCurrentBureaucracyPlayerIndex(0);
      setShowBureaucracyMenu(true);
    } else {
      setCurrentBureaucracyPlayerIndex(nextIndex);
      setShowBureaucracyMenu(true);
    }
  }, [bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, players, pieces, setBureaucracyStates, setPlayers, setBankedTiles, setCurrentPlayerIndex, setGameState, setBureaucracyTurnOrder, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setBureaucracyValidationError]);

  const handleFinishBureaucracyTurn = React.useCallback(() => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(
      (s) => s.playerId === currentPlayerId
    );
    const menu = getBureaucracyMenu(playerCount);
    const affordableItems = playerState
      ? getAvailablePurchases(menu, playerState.remainingKredcoin)
      : [];

    // Confirm if they still have kredcoin
    if (affordableItems.length > 0) {
      setShowFinishTurnConfirm({
        isOpen: true,
        remainingKredcoin: playerState?.remainingKredcoin || 0,
      });
      return;
    }

    // No confirmation needed, complete turn directly
    completeBureaucracyTurn();
  }, [bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, playerCount, setShowFinishTurnConfirm, completeBureaucracyTurn]);

  const handleConfirmFinishTurn = React.useCallback(() => {
    setShowFinishTurnConfirm({ isOpen: false, remainingKredcoin: 0 });
    completeBureaucracyTurn();
  }, [setShowFinishTurnConfirm, completeBureaucracyTurn]);

  const handleCancelFinishTurn = React.useCallback(() => {
    setShowFinishTurnConfirm({ isOpen: false, remainingKredcoin: 0 });
  }, [setShowFinishTurnConfirm]);

  const handleClearBureaucracyValidationError = React.useCallback(() => {
    setBureaucracyValidationError(null);
  }, [setBureaucracyValidationError]);

  const handleResetBureaucracyAction = React.useCallback(() => {
    // Reset to snapshot if available
    if (bureaucracySnapshot) {
      setPieces(bureaucracySnapshot.pieces);
      setBoardTiles(bureaucracySnapshot.boardTiles);
    }
    // Clear moves
    setBureaucracyMoves([]);
    // Clear validation error
    setBureaucracyValidationError(null);
  }, [bureaucracySnapshot, setPieces, setBoardTiles, setBureaucracyMoves, setBureaucracyValidationError]);

  const handleCheckBureaucracyMove = React.useCallback(() => {
    if (
      !currentBureaucracyPurchase ||
      currentBureaucracyPurchase.item.type !== "MOVE"
    )
      return;
    if (!bureaucracySnapshot) return;

    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const moveType = currentBureaucracyPurchase.item.moveType!;

    // Use the same calculateMoves logic as Campaign phase
    const calculatedMoves = calculateMoves(
      bureaucracySnapshot.pieces,
      pieces,
      currentPlayerId
    );

    // Validate each move with proper piece state (same as Campaign)
    let allMovesValid = true;
    let failureReason = "";

    for (let i = 0; i < calculatedMoves.length; i++) {
      const move = calculatedMoves[i];

      // Build piece state after all previous moves but before this move
      let piecesForValidation = bureaucracySnapshot.pieces.map((p: Piece) => ({
        ...p,
      }));
      for (let j = 0; j < i; j++) {
        const prevMove = calculatedMoves[j];
        piecesForValidation = piecesForValidation.map((p: Piece) =>
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
        failureReason = `${move.moveType} move validation failed: ${validation.reason}`;
        break;
      }
    }

    if (allMovesValid) {
      // Check that at least one move matches the purchased type
      const hasMatchingMove = calculatedMoves.some(
        (m) => m.moveType === moveType
      );
      if (!hasMatchingMove) {
        setBureaucracyMoveCheckResult({
          isValid: false,
          reason: `Expected a ${moveType} move, but none was found`,
        });
      } else {
        setBureaucracyMoveCheckResult({
          isValid: true,
          reason: "Move is valid!",
        });
      }
    } else {
      setBureaucracyMoveCheckResult({
        isValid: false,
        reason: failureReason,
      });
    }

    setShowBureaucracyMoveCheckResult(true);
  }, [currentBureaucracyPurchase, bureaucracySnapshot, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, calculateMoves, pieces, validateSingleMove, playerCount, setBureaucracyMoveCheckResult, setShowBureaucracyMoveCheckResult]);

  const handleCloseBureaucracyMoveCheckResult = React.useCallback(() => {
    setShowBureaucracyMoveCheckResult(false);
  }, [setShowBureaucracyMoveCheckResult]);

  const handleBureaucracyPieceMove = React.useCallback((
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ) => {
    // Track the move
    const piece = getPieceById(pieces, pieceId);
    if (!piece) return;

    // Determine the move type based on from/to locations
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const moveType = determineMoveType(
      piece.locationId,
      locationId,
      currentPlayerId
    );

    // Skip tracking if we can't determine the move type
    if (!moveType) {
      console.warn("Could not determine move type for bureaucracy move");
      return;
    }

    const move: TrackedMove = {
      moveType,
      category: "M",
      pieceId,
      fromPosition: piece.position,
      fromLocationId: piece.locationId,
      toPosition: newPosition,
      toLocationId: locationId,
      timestamp: Date.now(),
    };

    setBureaucracyMoves([...bureaucracyMoves, move]);

    // Update piece position and rotation
    const newRotation = calculatePieceRotation(
      newPosition,
      playerCount,
      locationId
    );
    setPieces(
      pieces.map((p) =>
        p.id === pieceId
          ? { ...p, position: newPosition, rotation: newRotation, locationId }
          : p
      )
    );
  }, [pieces, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyMoves, setBureaucracyMoves, calculatePieceRotation, playerCount, setPieces]);

  const handleBureaucracyPiecePromote = React.useCallback((pieceId: string) => {
    if (
      !currentBureaucracyPurchase ||
      currentBureaucracyPurchase.item.type !== "PROMOTION"
    ) {
      return;
    }

    // Perform the promotion (swap with community)
    const result = performPromotion(pieces, pieceId);

    if (!result.success) {
      setBureaucracyValidationError(result.reason || "Promotion failed");
      return;
    }

    setPieces(result.pieces);
  }, [currentBureaucracyPurchase, pieces, setBureaucracyValidationError, setPieces]);

  return {
    handleSelectBureaucracyMenuItem,
    handleDoneWithBureaucracyAction,
    completeBureaucracyTurn,
    handleFinishBureaucracyTurn,
    handleConfirmFinishTurn,
    handleCancelFinishTurn,
    handleClearBureaucracyValidationError,
    handleResetBureaucracyAction,
    handleCheckBureaucracyMove,
    handleCloseBureaucracyMoveCheckResult,
    handleBureaucracyPieceMove,
    handleBureaucracyPiecePromote,
  };
}
