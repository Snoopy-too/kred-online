import React from "react";
import type {
  Player,
  Piece,
  BoardTile,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
  TrackedMove,
  GameState,
  PromotionHistoryEntry,
  Tile
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
import { TILE_KREDCOIN_VALUES, BANK_SPACES_BY_PLAYER_COUNT } from "../config";
import { checkBureaucracyWinCondition } from "../rules";
import { getPlayerName, formatWinnerNames, getPieceById } from "../utils";

interface useBureaucracyHandlersProps {
  players: Player[];
  pieces: Piece[];
  playerCount: number;
  boardTiles: BoardTile[];
  bankedTiles: (BoardTile & { faceUp: boolean })[];
  bureaucracyStates: BureaucracyPlayerState[];
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
  currentBureaucracyPurchase: BureaucracyPurchase | null;
  bureaucracySnapshot: any;
  bureaucracyMoves: TrackedMove[];
  promotionHistory: PromotionHistoryEntry[];
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
  setBankedTiles: React.Dispatch<React.SetStateAction<(BoardTile & { faceUp: boolean })[]>>;
  setBureaucracyTurnOrder: (order: number[]) => void;
  setPiecesAtTurnStart: (pieces: Piece[]) => void;
  setCredibilityAtTurnStart: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setHasPlayedTileThisTurn: (value: boolean) => void;
  setPromotionHistory: (history: PromotionHistoryEntry[]) => void;
  calculateMoves: (original: Piece[], current: Piece[], playerId: number) => TrackedMove[];
  validateSingleMove: (move: TrackedMove, playerId: number, pieces: Piece[], playerCount: number) => { isValid: boolean; reason?: string };
  calculatePieceRotation: (position: any, playerCount: number, locationId?: string) => number;
  /** When both draft and campaign were skipped, after each bureaucracy round
   *  redistribute random tile hands and stay in BUREAUCRACY rather than
   *  returning to CAMPAIGN with empty hands. */
  skipDraftAndCampaign?: boolean;
}

export function useBureaucracyHandlers({
  players,
  pieces,
  playerCount,
  boardTiles,
  bankedTiles,
  bureaucracyStates,
  bureaucracyTurnOrder,
  currentBureaucracyPlayerIndex,
  currentBureaucracyPurchase,
  bureaucracySnapshot,
  bureaucracyMoves,
  promotionHistory,
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
  setPiecesAtTurnStart,
  setCredibilityAtTurnStart,
  setHasPlayedTileThisTurn,
  setPromotionHistory,
  calculateMoves,
  validateSingleMove,
  calculatePieceRotation,
  skipDraftAndCampaign = false,
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
      const snapshot = bureaucracySnapshot;
      if (!snapshot) {
        validationMessage = "No snapshot available for validation";
      } else if (promotionHistory.length === 0) {
        validationMessage =
          "No promotion was performed. Please click a piece to promote it.";
      } else {
        // Reconstruct the expected post-promotion pieces by replaying every
        // recorded promotion on top of the snapshot.  This avoids a
        // multiplayer race where a host state-sync can overwrite the guest's
        // local `pieces` back to the pre-promotion state before "Done" runs,
        // causing validation against the stale `pieces` to fail.
        let reconstructedPieces = snapshot.pieces.map((p: Piece) => ({ ...p }));
        let allValid = true;

        for (const entry of promotionHistory) {
          // performPromotion validates piece type, community piece
          // availability, etc. internally before swapping.
          const promotionResult = performPromotion(reconstructedPieces, entry.promotedPieceId);

          if (!promotionResult.success) {
            allValid = false;
            validationMessage = promotionResult.reason || "Promotion failed during replay";
            break;
          }

          // Validate the swap result: checks location type, player
          // ownership, and that the correct higher-tier piece was placed.
          const postValidation = validatePromotion(
            promotionResult.pieces,
            entry.promotedPieceId,
            currentBureaucracyPurchase.item.promotionLocation!,
            currentPlayerId,
            reconstructedPieces
          );

          if (!postValidation.isValid) {
            allValid = false;
            validationMessage = postValidation.reason;
            break;
          }

          // Advance reconstructed state for next iteration
          reconstructedPieces = promotionResult.pieces;
        }

        if (allValid) {
          isValid = true;
          // Ensure `pieces` reflects the reconstructed promoted state
          // in case a state-sync clobbered the guest's local copy.
          setPieces(reconstructedPieces);
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
    const finalPrice =
      currentBureaucracyPurchase.item.type === "PROMOTION"
        ? currentBureaucracyPurchase.item.price * promotionHistory.length
        : currentBureaucracyPurchase.item.price;

    const updatedStates = bureaucracyStates.map((s) => {
      if (s.playerId === currentPlayerId) {
        return {
          ...s,
          remainingKredcoin:
            s.remainingKredcoin - finalPrice,
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
        let remainingPrice = finalPrice;
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
  }, [currentBureaucracyPurchase, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, pieces, bureaucracySnapshot, promotionHistory, playerCount, calculateMoves, validateSingleMove, setPieces, setBoardTiles, setBureaucracyValidationError, setShowBureaucracyMenu, setCurrentBureaucracyPurchase, setBureaucracyMoves, setBureaucracyStates, players, setPlayers]);

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
          const winnerNames = formatWinnerNames(winners, players);
          alert(`The game is a draw! Winners: ${winnerNames}`);
        }
        setGameState("GAME_OVER");
        return;
      }

      // No winner — if both draft and campaign were skipped, redistribute
      // random tile hands and start the next BUREAUCRACY round directly.
      // Without this branch, the standard "tiles came from the bank" code
      // below leaves every player with empty hands (no campaign means no
      // banking happened) and the next bureaucracy round has nothing to spend.
      if (skipDraftAndCampaign) {
        const allTiles: Tile[] = [];
        for (let i = 1; i <= 24; i++) {
          allTiles.push({
            id: i,
            url: `./images/${String(i).padStart(2, "0")}.svg`,
          });
        }
        if (playerCount === 5) {
          allTiles.push({
            id: 25,
            url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
          });
        }
        const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);
        const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
        const tilesPerPlayer = bankSpaces.length / playerCount;

        const redistributed = players.map((p, index) => ({
          ...p,
          hand: [],
          keptTiles: [],
          bureaucracyTiles: shuffledTiles.slice(
            index * tilesPerPlayer,
            index * tilesPerPlayer + tilesPerPlayer,
          ),
        }));

        setPlayers(redistributed);
        setBankedTiles([]);

        const nextTurnOrder = getBureaucracyTurnOrder(redistributed, pieces);
        const nextStates: BureaucracyPlayerState[] = redistributed.map((p) => ({
          playerId: p.id,
          initialKredcoin: calculatePlayerKredcoin(p),
          remainingKredcoin: calculatePlayerKredcoin(p),
          turnComplete: false,
          purchases: [],
        }));
        setBureaucracyTurnOrder(nextTurnOrder);
        setBureaucracyStates(nextStates);
        setCurrentBureaucracyPlayerIndex(0);
        setCurrentPlayerIndex(0);
        setShowBureaucracyMenu(true);
        // gameState stays "BUREAUCRACY"
        return;
      }

      // No winner - transition back to campaign for next round
      // Return ALL tiles (face-up and face-down) from the bank to hands.
      // Face-up tiles come from bankedTiles, unspent face-down tiles come from player.bureaucracyTiles.
      const updatedPlayers = players.map((p) => {
        // Find all face-up tiles in this player's bank
        const faceUpBankedTiles = bankedTiles
          .filter(bt => bt.ownerId === p.id && bt.faceUp)
          .map(bt => bt.tile);
        
        // If the player already has keptTiles (meaning they skipped directly to Bureaucracy),
        // we preserve those keptTiles so they have a full hand for the upcoming Campaign phase.
        // Otherwise, for normal play, we combine banked and unspent bureaucracy tiles.
        const isSkipToBureaucracy = p.keptTiles && p.keptTiles.length > 0;
        
        return {
          ...p,
          hand: [],
          keptTiles: isSkipToBureaucracy ? p.keptTiles : [...faceUpBankedTiles, ...p.bureaucracyTiles],
          bureaucracyTiles: [],
        };
      });

      setPlayers(updatedPlayers);

      // Clear bank spaces for the new round
      setBankedTiles([]);

      // Player with tile 03 goes first in the new campaign round
      const startingTileId = 3;
      const startingPlayerIndex = updatedPlayers.findIndex(
        (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
      );
      
      const actualStartingIndex = startingPlayerIndex !== -1 ? startingPlayerIndex : 0;
      setCurrentPlayerIndex(actualStartingIndex);

      // Reset piece baseline for move validation in next campaign
      setPiecesAtTurnStart(pieces.map(p => ({ ...p })));
      
      // Reset turn-start state
      setHasPlayedTileThisTurn(false);
      
      // Snapshot credibility at turn start for the new mover
      const startingPlayerId = updatedPlayers[actualStartingIndex].id;
      setCredibilityAtTurnStart(prev => ({
        ...prev,
        [startingPlayerId]: updatedPlayers[actualStartingIndex].credibility,
      }));

      setGameState("CAMPAIGN");
      setBureaucracyStates([]);
      setBureaucracyTurnOrder([]);
      setCurrentBureaucracyPlayerIndex(0);
      setShowBureaucracyMenu(true);
    } else {
      setCurrentBureaucracyPlayerIndex(nextIndex);
      setShowBureaucracyMenu(true);
    }
  }, [bureaucracyTurnOrder, currentBureaucracyPlayerIndex, bureaucracyStates, players, pieces, bankedTiles, setBureaucracyStates, setPlayers, setBankedTiles, setCurrentPlayerIndex, setPiecesAtTurnStart, setHasPlayedTileThisTurn, setCredibilityAtTurnStart, setGameState, setBureaucracyTurnOrder, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setBureaucracyValidationError]);

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
    setPromotionHistory([]);
  }, [bureaucracySnapshot, setPieces, setBoardTiles, setBureaucracyMoves, setBureaucracyValidationError, setPromotionHistory]);

  /**
   * Cancel the current purchase entirely and return to the actions menu.
   * Unlike Reset (which keeps the purchase active), Cancel reverts all
   * in-progress changes — including credibility if a CREDIBILITY item
   * was selected — then clears the purchase and re-shows the menu.
   */
  const handleCancelBureaucracyAction = React.useCallback(() => {
    // Revert pieces/board from snapshot
    if (bureaucracySnapshot) {
      setPieces(bureaucracySnapshot.pieces);
      setBoardTiles(bureaucracySnapshot.boardTiles);
    }

    // If this was a CREDIBILITY purchase, revert the immediately-applied
    // credibility bump (handleSelectBureaucracyMenuItem adds +1 on select)
    if (currentBureaucracyPurchase?.item.type === "CREDIBILITY") {
      const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
      setPlayers(
        players.map((p) =>
          p.id === currentPlayerId
            ? { ...p, credibility: Math.max(0, p.credibility - 1) }
            : p
        )
      );
    }

    // Clear all action state and return to menu
    setBureaucracyMoves([]);
    setBureaucracyValidationError(null);
    setPromotionHistory([]);
    setCurrentBureaucracyPurchase(null);
    setShowBureaucracyMenu(true);
  }, [bureaucracySnapshot, currentBureaucracyPurchase, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, players, setPieces, setBoardTiles, setPlayers, setBureaucracyMoves, setBureaucracyValidationError, setPromotionHistory, setCurrentBureaucracyPurchase, setShowBureaucracyMenu]);

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

    // Cap: don't allow more promotions than the player can afford
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const playerState = bureaucracyStates.find(s => s.playerId === currentPlayerId);
    if (!playerState) return;

    const maxPromotions = Math.floor(
      playerState.remainingKredcoin / currentBureaucracyPurchase.item.price
    );
    if (promotionHistory.length >= maxPromotions) return;

    const result = performPromotion(pieces, pieceId);

    if (!result.success) {
      setBureaucracyValidationError(result.reason || "Promotion failed");
      return;
    }

    // Record which two pieces swapped so we can undo if needed
    const pieceToPromote = pieces.find(p => p.id === pieceId);
    const communityPieceBefore = pieces.find(
      p => p.id !== pieceId &&
        result.pieces.find(rp => rp.id === p.id)?.locationId === pieceToPromote?.locationId
    );

    if (pieceToPromote && communityPieceBefore) {
      setPromotionHistory([
        ...promotionHistory,
        {
          promotedPieceId: pieceId,
          promotedPieceOriginalLocationId: pieceToPromote.locationId!,
          communityPieceId: communityPieceBefore.id,
          communityPieceOriginalLocationId: communityPieceBefore.locationId!,
        },
      ]);
    }

    setPieces(result.pieces);
  }, [
    currentBureaucracyPurchase,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    bureaucracyStates,
    promotionHistory,
    setPromotionHistory,
    pieces,
    setBureaucracyValidationError,
    setPieces,
  ]);

  const handleUndoLastPromotion = React.useCallback(() => {
    if (promotionHistory.length === 0) return;

    const last = promotionHistory[promotionHistory.length - 1];

    // Restore both pieces to their pre-swap positions
    const promotedPiece = pieces.find(p => p.id === last.promotedPieceId);
    const communityPiece = pieces.find(p => p.id === last.communityPieceId);

    if (!promotedPiece || !communityPiece) return;

    const restoredPieces = pieces.map(p => {
      if (p.id === last.promotedPieceId) {
        return {
          ...p,
          locationId: last.promotedPieceOriginalLocationId,
          position: communityPiece.position,
          rotation: communityPiece.rotation,
        };
      }
      if (p.id === last.communityPieceId) {
        return {
          ...p,
          locationId: last.communityPieceOriginalLocationId,
          position: promotedPiece.position,
          rotation: promotedPiece.rotation,
        };
      }
      return p;
    });

    setPieces(restoredPieces);
    setPromotionHistory(promotionHistory.slice(0, -1));
  }, [promotionHistory, setPromotionHistory, pieces, setPieces]);

  return {
    handleSelectBureaucracyMenuItem,
    handleDoneWithBureaucracyAction,
    completeBureaucracyTurn,
    handleFinishBureaucracyTurn,
    handleConfirmFinishTurn,
    handleCancelFinishTurn,
    handleClearBureaucracyValidationError,
    handleResetBureaucracyAction,
    handleCancelBureaucracyAction,
    handleCheckBureaucracyMove,
    handleCloseBureaucracyMoveCheckResult,
    handleBureaucracyPieceMove,
    handleBureaucracyPiecePromote,
    handleUndoLastPromotion,
  };
}
