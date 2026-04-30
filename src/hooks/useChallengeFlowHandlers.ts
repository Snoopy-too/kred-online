import React from "react";
import type { 
  Player, 
  Piece, 
  BoardTile, 
  Tile, 
  PlayedTileState, 
  TrackedMove, 
  GameState,
  BureaucracyMenuItem,
  BureaucracyPurchase
} from "../types";
import { 
  calculateMoves as calculateMovesCore,
  validateTileRequirementsWithImpossibleMoveExceptions,
  validateMovesForTilePlay,
  validateSingleMove,
  getChallengeOrder,
  performPromotion,
  getBureaucracyTurnOrder,
  calculatePlayerKredcoin
} from "../game";
import { 
  handleCredibilityLoss, 
  areSeatsAdjacent, 
  checkBureaucracyWinCondition 
} from "../rules";
import { 
  getPlayerById, 
  getPlayerName, 
  getPlayerNameSimple, 
  getPieceById, 
  formatLocationId, 
  formatWinnerNames 
} from "../utils";
import { DEFAULTS, BANK_SPACES_BY_PLAYER_COUNT, TILE_KREDCOIN_VALUES, TIMEOUTS, ALERTS } from "../config";

interface useChallengeFlowHandlersProps {
  players: Player[];
  pieces: Piece[];
  playerCount: number;
  gameState: GameState;
  playedTile: PlayedTileState | null;
  bankedTiles: (BoardTile & { faceUp: boolean })[];
  challengeOrder: number[];
  currentChallengerIndex: number;
  receiverAcceptance: boolean | null;
  tileRejected: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;
  selectedTilesForAdvantage: Tile[];
  totalKredcoinForAdvantage: number;
  takeAdvantagePurchase: BureaucracyPurchase | null;
  takeAdvantagePiecesSnapshot: Piece[];
  piecesAtCorrectionStart: Piece[];
  bonusMoveWasCompleted: boolean;
  piecesBeforeBonusMove: Piece[];
  tilePlayerMustWithdraw: boolean;
  credibilityAtTurnStart: Record<number, number>;
  pendingChallengerReward: any;
  currentPlayerIndex: number;
  
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setPieces: (pieces: Piece[]) => void;
  setBankedTiles: (tiles: (BoardTile & { faceUp: boolean })[] | ((prev: (BoardTile & { faceUp: boolean })[]) => (BoardTile & { faceUp: boolean })[])) => void;
  setGameState: (state: GameState) => void;
  setPlayedTile: (tile: PlayedTileState | null | ((prev: PlayedTileState | null) => PlayedTileState | null)) => void;
  setMovesThisTurn: (moves: TrackedMove[]) => void;
  setHasPlayedTileThisTurn: (has: boolean) => void;
  setReceiverAcceptance: (acc: boolean | null) => void;
  setChallengeOrder: (order: number[]) => void;
  setCurrentChallengerIndex: (index: number) => void;
  setTileRejected: (rejected: boolean) => void;
  setChallengedTile: (tile: Tile | null) => void;
  setShowChallengeRevealModal: (show: boolean) => void;
  setChallengeResultMessage: (msg: string) => void;
  setChallengeResultMessagePlayerId: (id: number | null) => void;
  setShowPerfectTileModal: (show: boolean) => void;
  setTilePlayerMustWithdraw: (must: boolean) => void;
  setPiecesAtCorrectionStart: (pieces: Piece[]) => void;
  setMovedPiecesThisTurn: (pieces: Set<string>) => void;
  setPendingCommunityPieces: (pieces: Set<string>) => void;
  setPendingChallengerReward: (reward: any) => void;
  setBonusMovePlayerId: (id: number | null) => void;
  setShowBonusMoveModal: (show: boolean) => void;
  setPiecesBeforeBonusMove: (pieces: Piece[]) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setPiecesAtTurnStart: (pieces: Piece[]) => void;
  setCredibilityAtTurnStart: (cb: (prev: Record<number, number>) => Record<number, number>) => void;
  setShowTakeAdvantageModal: (show: boolean) => void;
  setTakeAdvantageChallengerId: (id: number | null) => void;
  setTakeAdvantageChallengerCredibility: (cred: number) => void;
  setShowTakeAdvantageTileSelection: (show: boolean) => void;
  setSelectedTilesForAdvantage: (tiles: Tile[]) => void;
  setTotalKredcoinForAdvantage: (total: number) => void;
  setShowTakeAdvantageMenu: (show: boolean) => void;
  setTakeAdvantagePurchase: (purchase: BureaucracyPurchase | null) => void;
  setTakeAdvantagePiecesSnapshot: (pieces: Piece[]) => void;
  setTakeAdvantageValidationError: (err: string | null) => void;
  setMoveCheckResult: (result: any) => void;
  setShowMoveCheckResult: (show: boolean) => void;
  setBoardTiles: (tiles: BoardTile[] | ((prev: BoardTile[]) => BoardTile[])) => void;
  setBureaucracyTurnOrder: (order: number[]) => void;
  setBureaucracyStates: (states: any[]) => void;
  setCurrentBureaucracyPlayerIndex: (index: number) => void;
  setShowBureaucracyMenu: (show: boolean) => void;
  setShowBureaucracyTransition: (show: boolean) => void;
  setGiveReceiverViewingTileId: (id: number | null) => void;

  showAlert: (title: string, message: string, type?: "error" | "warning" | "info") => void;
  addGameLog: (log: string) => void;
  setGameLog: (cb: (prev: string[]) => string[]) => void;
  advanceTurnNormally: () => void;
  pendingChallengerRewardRef: React.MutableRefObject<any>;
}

export function useChallengeFlowHandlers({
  players,
  pieces,
  playerCount,
  gameState,
  playedTile,
  bankedTiles,
  challengeOrder,
  currentChallengerIndex,
  receiverAcceptance,
  tileRejected,
  takeAdvantageChallengerId,
  takeAdvantageChallengerCredibility,
  selectedTilesForAdvantage,
  totalKredcoinForAdvantage,
  takeAdvantagePurchase,
  takeAdvantagePiecesSnapshot,
  piecesAtCorrectionStart,
  bonusMoveWasCompleted,
  piecesBeforeBonusMove,
  tilePlayerMustWithdraw,
  credibilityAtTurnStart,
  pendingChallengerReward,
  currentPlayerIndex,
  setPlayers,
  setPieces,
  setBankedTiles,
  setGameState,
  setPlayedTile,
  setMovesThisTurn,
  setHasPlayedTileThisTurn,
  setReceiverAcceptance,
  setChallengeOrder,
  setCurrentChallengerIndex,
  setTileRejected,
  setChallengedTile,
  setShowChallengeRevealModal,
  setChallengeResultMessage,
  setChallengeResultMessagePlayerId,
  setShowPerfectTileModal,
  setTilePlayerMustWithdraw,
  setPiecesAtCorrectionStart,
  setMovedPiecesThisTurn,
  setPendingCommunityPieces,
  setPendingChallengerReward,
  setBonusMovePlayerId,
  setShowBonusMoveModal,
  setPiecesBeforeBonusMove,
  setCurrentPlayerIndex,
  setPiecesAtTurnStart,
  setCredibilityAtTurnStart,
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
  setMoveCheckResult,
  setShowMoveCheckResult,
  setBoardTiles,
  setBureaucracyTurnOrder,
  setBureaucracyStates,
  setCurrentBureaucracyPlayerIndex,
  setShowBureaucracyMenu,
  setShowBureaucracyTransition,
  setGiveReceiverViewingTileId,
  showAlert,
  addGameLog,
  setGameLog,
  advanceTurnNormally,
  pendingChallengerRewardRef,
}: useChallengeFlowHandlersProps) {

  const calculateMoves = React.useCallback((
    originalPieces: Piece[],
    currentPieces: Piece[],
    tilePlayerId: number
  ): TrackedMove[] => {
    return calculateMovesCore(
      originalPieces,
      currentPieces,
      tilePlayerId,
      playerCount,
      areSeatsAdjacent
    );
  }, [playerCount]);

  const cleanupTakeAdvantageModalState = React.useCallback(() => {
    setShowTakeAdvantageModal(false);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);
  }, [setShowTakeAdvantageModal, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility]);

  const resetChallengeState = React.useCallback(() => {
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setReceiverAcceptance(null);
    setTileRejected(false);
  }, [setChallengeOrder, setCurrentChallengerIndex, setReceiverAcceptance, setTileRejected]);

  const handleCredibilityGain = React.useCallback((
    playerId: number,
    amount: number,
    currentPlayers?: Player[]
  ): { newPlayers: Player[]; hadMaxCredibility: boolean } => {
    const playersToUse = currentPlayers || players;
    const player = playersToUse.find((p) => p.id === playerId);
    if (!player) return { newPlayers: playersToUse, hadMaxCredibility: false };

    const currentCredibility =
      player.credibility ?? DEFAULTS.INITIAL_CREDIBILITY;
    const hadMaxCredibility = currentCredibility >= DEFAULTS.MAX_CREDIBILITY;

    if (hadMaxCredibility) {
      // Player already has max credibility, don't add more
      return { newPlayers: playersToUse, hadMaxCredibility: true };
    }

    const newCredibility = Math.min(
      DEFAULTS.MAX_CREDIBILITY,
      currentCredibility + amount
    );
    const actualGain = newCredibility - currentCredibility;

    const newPlayers = playersToUse.map((p) =>
      p.id === playerId ? { ...p, credibility: newCredibility } : p
    );

    if (actualGain > 0) {
      const playerName = getPlayerName(player, playerId);
      addGameLog(
        `${playerName} gained ${actualGain} credibility: Correctly rejected imperfect tile`
      );
    }

    return { newPlayers, hadMaxCredibility: false };
  }, [players, addGameLog]);

  const handleBonusMoveComplete = React.useCallback(() => {
    if (!playedTile) return;

    // Log the bonus move
    const bonusMovePlayerIdLocal = (pendingChallengerRewardRef.current?.challengerId) || null;
    const player = getPlayerById(players, bonusMovePlayerIdLocal);
    const playerName = getPlayerName(player, bonusMovePlayerIdLocal);
    addGameLog(
      `${playerName} took a bonus Advance move (already had 3 credibility)`
    );

    // Close the modal and mark that bonus move was completed
    setShowBonusMoveModal(false);
    setBonusMovePlayerId(null);
    // setBonusMoveWasCompleted(true); // Moved to App level or managed here

    // Since correction happened BEFORE the bonus move in this new flow,
    // we now transition directly to the receiver's turn
    if (playedTile) {
      const receiverIndex = players.findIndex((p) => p.id === playedTile.receivingPlayerId);
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
        setGameState("CAMPAIGN");
        setMovesThisTurn([]);
        setHasPlayedTileThisTurn(false);
        setPlayedTile(null);
        setTileRejected(false);
        resetChallengeState();

        // Clear piece movement tracking from previous turn
        setMovedPiecesThisTurn(new Set());
        setPendingCommunityPieces(new Set());
        
        // Set piece state snapshot for the start of this new turn
        setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));
        
        // Snapshot credibility at turn start for the new mover
        const newMoverId = playedTile.receivingPlayerId;
        const newMover = getPlayerById(players, newMoverId);
        if (newMover !== undefined && newMover !== null) {
          setCredibilityAtTurnStart(prev => ({
            ...prev,
            [newMoverId]: newMover.credibility,
          }));
        }
      }
    }
  }, [playedTile, players, addGameLog, setShowBonusMoveModal, setBonusMovePlayerId, setGameState, setMovesThisTurn, setHasPlayedTileThisTurn, setPlayedTile, setTileRejected, resetChallengeState, setMovedPiecesThisTurn, setPendingCommunityPieces, setPiecesAtTurnStart, pieces, setCredibilityAtTurnStart, setCurrentPlayerIndex, pendingChallengerRewardRef]);

  const transitionToCorrectionPhase = React.useCallback((updatedOriginalPieces?: Piece[]) => {
    if (!playedTile) return;

    const tilePlayer = getPlayerById(players, playedTile.playerId);
    // Use credibility at turn start for penalty rules (manual: 0 cred at turn start → forced Withdraw)
    const playerHadZeroCredibilityAtTurnStart =
      tilePlayer && (credibilityAtTurnStart[tilePlayer.id] ?? tilePlayer.credibility) === 0;

    // Determine if tile player must withdraw (0 credibility penalty)
    if (playerHadZeroCredibilityAtTurnStart) {
      setTilePlayerMustWithdraw(true);
    } else {
      setTilePlayerMustWithdraw(false);
    }

    // Switch to correction phase
    const playerIndex = players.findIndex((p) => p.id === playedTile.playerId);
    if (playerIndex !== -1) {
      setCurrentPlayerIndex(playerIndex);
      setGameState("CORRECTION_REQUIRED");
      setMovesThisTurn([]);
      setTileRejected(true);

      // Restore original pieces (using updated pieces if provided, which includes Take Advantage changes)
      const revertedPieces = updatedOriginalPieces
        ? updatedOriginalPieces.map((p) => ({ ...p }))
        : playedTile.originalPieces.map((p) => ({ ...p }));
      setPieces(revertedPieces);
      setPiecesAtCorrectionStart(revertedPieces);

      // Update playedTile if we have updated pieces
      if (updatedOriginalPieces) {
        setPlayedTile({
          ...playedTile,
          originalPieces: updatedOriginalPieces.map((p) => ({ ...p })),
        });
      }

      // Clear piece movement tracking
      setMovedPiecesThisTurn(new Set());
      setPendingCommunityPieces(new Set());
    }
  }, [playedTile, players, credibilityAtTurnStart, setCurrentPlayerIndex, setGameState, setMovesThisTurn, setTileRejected, setPieces, setPiecesAtCorrectionStart, setPlayedTile, setMovedPiecesThisTurn, setPendingCommunityPieces, setTilePlayerMustWithdraw]);

  const finalizeTilePlay = React.useCallback((
    wasChallenged: boolean,
    challengerId: number | null
  ) => {
    if (!playedTile) return;

    // Log the standing moves (the actual piece movements that were validated)
    if (!tileRejected && playedTile.originalPieces) {
      const calculatedMoves = calculateMoves(
        playedTile.originalPieces,
        pieces,
        playedTile.playerId
      );

      // Log each standing move
      for (const move of calculatedMoves) {
        const fromLoc = move.fromLocationId
          ? formatLocationId(move.fromLocationId)
          : "supply";
        const toLoc = move.toLocationId
          ? formatLocationId(move.toLocationId)
          : "supply";

        // Get the piece name from the current pieces
        const movedPiece = getPieceById(pieces, move.pieceId);
        const pieceName = movedPiece?.name || "piece";

        addGameLog(
          `Standing Move: Player ${playedTile.playerId} moves ${pieceName} from ${fromLoc} to ${toLoc}`
        );
      }
    }

    // Determine if tile was rejected (face up) or accepted (face down)
    const tileWasRejected = tileRejected;
    const faceUpInBank = tileWasRejected;

    // Get bank spaces for the receiving player
    const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const playerBankSpaces = bankSpaces.filter(
      (bs) => bs.ownerId === playedTile.receivingPlayerId
    );

    // Find the next available bank space (accounting for already banked tiles)
    const usedBankIndices = new Set(
      bankedTiles
        .filter((bt) => bt.ownerId === playedTile.receivingPlayerId)
        .map((bt) =>
          playerBankSpaces.findIndex(
            (bs) =>
              bs.position.left === bt.position.left &&
              bs.position.top === bt.position.top
          )
        )
    );

    let nextBankIndex = -1; // Start with invalid index
    for (let i = 0; i < playerBankSpaces.length; i++) {
      if (!usedBankIndices.has(i)) {
        nextBankIndex = i;
        break;
      }
    }

    // Create the banked tile - only if there's space in the bank
    if (nextBankIndex >= 0 && nextBankIndex < playerBankSpaces.length) {
      const bankSpace = playerBankSpaces[nextBankIndex];
      const newBankedTile: BoardTile & { faceUp: boolean } = {
        id: `bank_${playedTile.receivingPlayerId
          }_${nextBankIndex}_${Date.now()}`,
        tile: {
          id: parseInt(playedTile.tileId),
          url: `./images/${playedTile.tileId}.svg`,
        },
        position: bankSpace.position,
        rotation: bankSpace.rotation,
        placerId: playedTile.playerId,
        ownerId: playedTile.receivingPlayerId,
        faceUp: faceUpInBank,
      };

      setBankedTiles((prev: any) => [...prev, newBankedTile]);
    }

    // Only face-down tiles (not rejected) count toward Bureaucracy funding per the manual.
    // Face-up (rejected) tiles are tracked in bankedTiles for display but NOT added to bureaucracyTiles.
    const tile = {
      id: parseInt(playedTile.tileId),
      url: `./images/${playedTile.tileId}.svg`,
    };

    // Calculate the updated players array directly from current state
    let updatedPlayers = tileWasRejected
      ? players // face-up tile: do not add to bureaucracyTiles
      : players.map((p) =>
          p.id === playedTile.receivingPlayerId
            ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tile] }
            : p
        );

    // Apply credibility loss for unsuccessful challenge
    if (wasChallenged && challengerId !== null) {
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === challengerId
          ? { ...p, credibility: Math.max(0, p.credibility - 1) }
          : p
      );
    }

    // Check if all players have filled their banks (trigger Bureaucracy phase)
    const allBankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const tilesPerPlayer = allBankSpaces.length / playerCount;

    const allBanksFull =
      updatedPlayers.length > 0 &&
      updatedPlayers.every((p) => p.bureaucracyTiles.length >= tilesPerPlayer);

    // Update the players state
    setPlayers(updatedPlayers);

    // Remove from board tiles
    setBoardTiles((prev) =>
      prev.filter(
        (bt) =>
          !(
            bt.tile.id.toString().padStart(2, "0") === playedTile.tileId &&
            bt.placerId === playedTile.playerId &&
            bt.ownerId === playedTile.receivingPlayerId
          )
      )
    );

    if (allBanksFull) {
      // Show "Bureaucracy!" transition message for 3 seconds before starting bureaucracy phase
      setShowBureaucracyTransition(true);

      setTimeout(() => {
        // Initialize Bureaucracy phase
        const turnOrder = getBureaucracyTurnOrder(updatedPlayers, pieces);
        const initialStates = updatedPlayers.map(
          (p) => ({
            playerId: p.id,
            initialKredcoin: calculatePlayerKredcoin(p),
            remainingKredcoin: calculatePlayerKredcoin(p),
            turnComplete: false,
            purchases: [],
          })
        );

        setBureaucracyTurnOrder(turnOrder);
        setBureaucracyStates(initialStates);
        setCurrentBureaucracyPlayerIndex(0);
        setShowBureaucracyMenu(true);
        setGameState("BUREAUCRACY");

        // Reset tile play state
        setPlayedTile(null);
        setMovesThisTurn([]);
        setReceiverAcceptance(null);
        setChallengeOrder([]);
        setCurrentChallengerIndex(0);
        setTileRejected(false);
        setHasPlayedTileThisTurn(false);
        setGiveReceiverViewingTileId(null);

        // Hide transition message
        setShowBureaucracyTransition(false);
      }, 3000);

      return; // Don't continue with campaign reset
    }

    // Reset challenge state FIRST before setting turn
    resetChallengeState();

    // Next player is the receiving player
    const receiverIndex = updatedPlayers.findIndex(
      (p) => p.id === playedTile.receivingPlayerId
    );
    if (receiverIndex !== -1) {
      setCurrentPlayerIndex(receiverIndex);
    }

    // Reset remaining tile play state
    setPlayedTile(null);
    setMovesThisTurn([]);
    setGameState("CAMPAIGN");
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);
    // setBonusMoveWasCompleted(false); // Managed at App level
    setPiecesAtCorrectionStart([]);
    setTilePlayerMustWithdraw(false);

    // Win condition check
    const winners = checkBureaucracyWinCondition(updatedPlayers, pieces);
    if (winners.length > 0) {
      if (winners.length === 1) {
        const winnerName = getPlayerName(
          getPlayerById(updatedPlayers, winners[0]),
          winners[0]
        );
        alert(`${winnerName} has won the game during the Campaign phase!`);
      } else {
        const winnerNames = formatWinnerNames(winners, updatedPlayers);
        alert(`The game is a draw! Winners: ${winnerNames}`);
      }
      return;
    }

    // Set piece state snapshot for the start of this new turn
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    // Snapshot credibility at turn start for the new mover
    const newMoverId = playedTile.receivingPlayerId;
    const newMover = getPlayerById(updatedPlayers, newMoverId);
    if (newMover !== undefined && newMover !== null) {
      setCredibilityAtTurnStart(prev => ({
        ...prev,
        [newMoverId]: newMover.credibility,
      }));
    }

    // Clear piece movement tracking for new turn
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());
  }, [playedTile, tileRejected, calculateMoves, pieces, addGameLog, playerCount, bankedTiles, setBankedTiles, players, setPlayers, setBoardTiles, setShowBureaucracyTransition, setBureaucracyTurnOrder, setBureaucracyStates, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setGameState, setPlayedTile, setMovesThisTurn, setReceiverAcceptance, setChallengeOrder, setCurrentChallengerIndex, setTileRejected, setHasPlayedTileThisTurn, setGiveReceiverViewingTileId, resetChallengeState, setCurrentPlayerIndex, setPiecesAtCorrectionStart, setTilePlayerMustWithdraw, setPiecesAtTurnStart, setCredibilityAtTurnStart, setMovedPiecesThisTurn, setPendingCommunityPieces]);

  const resolveChallengeAfterReveal = React.useCallback(() => {
    if (!playedTile) return;
    {
      const calculatedMoves = calculateMoves(
        playedTile.originalPieces,
        pieces,
        playedTile.playerId
      );
      const tileRequirements =
        validateTileRequirementsWithImpossibleMoveExceptions(
          playedTile.tileId,
          calculatedMoves,
          playedTile.playerId,
          playedTile.originalPieces,
          pieces,
          players,
          playerCount
        );

      const requiredMoveTypes = tileRequirements.requiredMoves;
      const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
      const extraMoves: string[] = [];

      for (const moveType of performedMoveTypes) {
        if (!requiredMoveTypes.includes(moveType)) {
          extraMoves.push(moveType);
        }
      }

      const uniqueExtraMoves = [...new Set(extraMoves)];
      const isTilePerfect =
        tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (isTilePerfect) {
        const challengerId = challengeOrder[currentChallengerIndex];
        const challengerName = getPlayerName(
          getPlayerById(players, challengerId),
          challengerId
        );
        const challengedPlayerName = getPlayerNameSimple(
          getPlayerById(players, playedTile.playerId)
        );
        
        setChallengeResultMessage(
          `Challenge Failed: ${challengerName} challenged, but ${challengedPlayerName} played the tile honestly.`
        );
        setChallengeResultMessagePlayerId(null);

        addGameLog(
          `${challengerName} lost 1 credibility: Unsuccessful challenge - tile was played honestly`
        );

        finalizeTilePlay(true, challengerId);

        setTimeout(() => {
          setChallengeResultMessage("");
          setChallengeResultMessagePlayerId(null);
        }, 5000);
      } else {
        const challengedPlayerName = getPlayerNameSimple(
          getPlayerById(players, playedTile.playerId)
        );
        setChallengeResultMessage(
          `Challenge Successful: ${challengedPlayerName} must now move as per the tile requirements.`
        );
        setChallengeResultMessagePlayerId(null);

        const challengerId = challengeOrder[currentChallengerIndex];

        let updatedPlayers = handleCredibilityLoss(
          "tile_failed_challenge",
          playedTile.playerId
        )(players);

        if (receiverAcceptance === true) {
          updatedPlayers = handleCredibilityLoss(
            "did_not_reject_when_challenged",
            playedTile.playerId,
            undefined,
            playedTile.receivingPlayerId
          )(updatedPlayers);
        }

        setPlayers(updatedPlayers);

        addGameLog(
          `Player ${playedTile.playerId} lost 1 credibility: Challenge succeeded - tile did not meet requirements`
        );

        if (receiverAcceptance === true) {
          addGameLog(
            `Player ${playedTile.receivingPlayerId} lost 1 credibility: Accepted a tile that was successfully challenged`
          );
        }

        const challenger = getPlayerById(updatedPlayers, challengerId);
        const challengerName = challenger
          ? getPlayerName(challenger, challengerId)
          : "Player";

        if (challenger) {
          const hasTiles =
            challenger.bureaucracyTiles &&
            challenger.bureaucracyTiles.length > 0;

          if (hasTiles) {
            // Challenger chooses: restore 1 credibility OR use funding for a Bureaucracy action.
            // The gain is deferred to the Take Advantage modal (Recover Credibility button).
            const reward = {
              challengerId,
              rewardType: 'TAKE_ADVANTAGE' as const,
              credibility: challenger.credibility,
              receiverId: playedTile.receivingPlayerId
            };
            setPendingChallengerReward(reward);
            pendingChallengerRewardRef.current = reward;

            transitionToCorrectionPhase();

            setTimeout(() => {
              setChallengeResultMessage("");
              setChallengeResultMessagePlayerId(null);
            }, TIMEOUTS.CHALLENGE_MESSAGE_DISMISS);

            return;
          } else {
            // No tiles to spend — challenger can only restore credibility, apply it directly.
            const credibilityResult = handleCredibilityGain(challengerId, 1, updatedPlayers);
            setPlayers(credibilityResult.newPlayers);
            addGameLog(
              `${challengerName} restored 1 credibility for successful challenge (now ${credibilityResult.newPlayers.find(p => p.id === challengerId)?.credibility ?? 0})`
            );
            setTakeAdvantageChallengerId(null);
            setTakeAdvantageChallengerCredibility(0);
            transitionToCorrectionPhase();

            setTimeout(() => {
              setChallengeResultMessage("");
              setChallengeResultMessagePlayerId(null);
            }, 5000);
            return;
          }
        }

        transitionToCorrectionPhase();

        setTimeout(() => {
          setChallengeResultMessage("");
          setChallengeResultMessagePlayerId(null);
        }, 5000);
      }
    }
  }, [playedTile, calculateMoves, pieces, players, playerCount, challengeOrder, currentChallengerIndex, setChallengeResultMessage, setChallengeResultMessagePlayerId, addGameLog, finalizeTilePlay, receiverAcceptance, handleCredibilityGain, setPlayers, setPendingChallengerReward, transitionToCorrectionPhase, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, pendingChallengerRewardRef]);

  const handleContinueAfterChallengeReveal = React.useCallback(() => {
    setShowChallengeRevealModal(false);
    setChallengedTile(null);
    resolveChallengeAfterReveal();
  }, [setShowChallengeRevealModal, setChallengedTile, resolveChallengeAfterReveal]);

  const handleReceiverAcceptanceDecision = React.useCallback((accepted: boolean) => {
    if (!playedTile) return;

    if (!accepted) {
      const calculatedMoves = calculateMoves(
        playedTile.originalPieces,
        pieces,
        playedTile.playerId
      );
      const tileRequirements =
        validateTileRequirementsWithImpossibleMoveExceptions(
          playedTile.tileId,
          calculatedMoves,
          playedTile.playerId,
          playedTile.originalPieces,
          pieces,
          players,
          playerCount
        );

      const requiredMoveTypes = tileRequirements.requiredMoves;
      const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
      const extraMoves: string[] = [];
      for (const moveType of performedMoveTypes) {
        if (!requiredMoveTypes.includes(moveType)) {
          extraMoves.push(moveType);
        }
      }
      const uniqueExtraMoves = [...new Set(extraMoves)];

      const isTilePerfect =
        tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (isTilePerfect) {
        setShowPerfectTileModal(true);
        return;
      }

      setReceiverAcceptance(false);
      setTileRejected(true);

      const tilePlayer = getPlayerById(players, playedTile.playerId);
      const playerHadZeroCredibilityAtTurnStart =
        tilePlayer && (credibilityAtTurnStart[tilePlayer.id] ?? tilePlayer.credibility) === 0;
      const movesMeetRequirements =
        tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (playerHadZeroCredibilityAtTurnStart && !movesMeetRequirements) {
        setTilePlayerMustWithdraw(true);
      } else {
        setTilePlayerMustWithdraw(false);
      }

      const revertedPieces = playedTile.originalPieces.map((p) => ({ ...p }));
      setPieces(revertedPieces);
      setPiecesAtCorrectionStart(revertedPieces);

      setMovedPiecesThisTurn(new Set());
      setPendingCommunityPieces(new Set());

      setPlayers((prev) =>
        handleCredibilityLoss(
          "tile_rejected_by_receiver",
          playedTile.playerId
        )(prev)
      );
      addGameLog(
        `Player ${playedTile.playerId} lost 1 credibility: Tile was rejected by Player ${playedTile.receivingPlayerId}`
      );

      const credibilityResult = handleCredibilityGain(
        playedTile.receivingPlayerId,
        2
      );

      setPlayers(credibilityResult.newPlayers);

      if (credibilityResult.hadMaxCredibility) {
        const reward = {
          challengerId: playedTile.receivingPlayerId,
          rewardType: 'BONUS_MOVE' as const,
          credibility: credibilityResult.newPlayers.find(p => p.id === playedTile.receivingPlayerId)?.credibility ?? 3,
          receiverId: playedTile.receivingPlayerId,
        };
        setPendingChallengerReward(reward);
        pendingChallengerRewardRef.current = reward;
        setPiecesBeforeBonusMove(revertedPieces);
      }

      const exposedPlayerName = getPlayerNameSimple(
        getPlayerById(players, playedTile.playerId)
      );
      setChallengeResultMessage(
        `Whistle Blown: ${exposedPlayerName} must now move as per the tile requirements.`
      );
      setChallengeResultMessagePlayerId(null);
      setTimeout(() => {
        setChallengeResultMessage("");
        setChallengeResultMessagePlayerId(null);
      }, 5000);

      const playerIndex = players.findIndex(
        (p) => p.id === playedTile.playerId
      );
      if (playerIndex !== -1) {
        setCurrentPlayerIndex(playerIndex);
        setGameState("CORRECTION_REQUIRED");
        setMovesThisTurn([]);
      }
    } else {
      setReceiverAcceptance(true);

      const order = getChallengeOrder(
        playedTile.playerId,
        playerCount,
        playedTile.receivingPlayerId
      );
      setChallengeOrder(order);

      if (order.length > 0) {
        const firstChallengerIndex = players.findIndex(
          (p) => p.id === order[0]
        );
        setCurrentPlayerIndex(firstChallengerIndex);
        setCurrentChallengerIndex(0);
        setGameState("PENDING_CHALLENGE");
      } else {
        finalizeTilePlay(false, null);
      }
    }
  }, [playedTile, calculateMoves, pieces, players, playerCount, setShowPerfectTileModal, setReceiverAcceptance, setTileRejected, credibilityAtTurnStart, setTilePlayerMustWithdraw, setPieces, setPiecesAtCorrectionStart, setMovedPiecesThisTurn, setPendingCommunityPieces, setPlayers, addGameLog, handleCredibilityGain, setPendingChallengerReward, setPiecesBeforeBonusMove, setChallengeResultMessage, setChallengeResultMessagePlayerId, setCurrentPlayerIndex, setGameState, setMovesThisTurn, setChallengeOrder, setCurrentChallengerIndex, finalizeTilePlay, pendingChallengerRewardRef]);

  const handlePerfectTileContinue = React.useCallback(() => {
    if (!playedTile) return;

    setShowPerfectTileModal(false);
    setReceiverAcceptance(true);

    const order = getChallengeOrder(
      playedTile.playerId,
      playerCount,
      playedTile.receivingPlayerId
    );
    setChallengeOrder(order);

    if (order.length > 0) {
      const firstChallengerIndex = players.findIndex((p) => p.id === order[0]);
      setCurrentPlayerIndex(firstChallengerIndex);
      setCurrentChallengerIndex(0);
      setGameState("PENDING_CHALLENGE");
    } else {
      finalizeTilePlay(false, null);
    }
  }, [playedTile, setShowPerfectTileModal, setReceiverAcceptance, playerCount, setChallengeOrder, players, setCurrentPlayerIndex, setCurrentChallengerIndex, setGameState, finalizeTilePlay]);

  const handleChallengerPass = React.useCallback(() => {
    if (!playedTile) return;
    const nextChallengerIndex = currentChallengerIndex + 1;
    if (nextChallengerIndex >= challengeOrder.length) {
      finalizeTilePlay(false, null);
    } else {
      const nextChallengerId = challengeOrder[nextChallengerIndex];
      const nextPlayerIndex = players.findIndex((p) => p.id === nextChallengerId);
      setCurrentChallengerIndex(nextChallengerIndex);
      setCurrentPlayerIndex(nextPlayerIndex);
    }
  }, [playedTile, currentChallengerIndex, challengeOrder, finalizeTilePlay, players, setCurrentChallengerIndex, setCurrentPlayerIndex]);

  const handleChallengerDecision = React.useCallback((challenge: boolean) => {
    if (!playedTile) return;

    if (challenge) {
      const tileId = parseInt(playedTile.tileId);
      setChallengedTile({
        id: tileId,
        url: `./images/${playedTile.tileId}.svg`,
      });
      setShowChallengeRevealModal(true);
      return;
    }

    handleChallengerPass();
  }, [playedTile, setChallengedTile, setShowChallengeRevealModal, handleChallengerPass]);

  const handleCorrectionComplete = React.useCallback(() => {
    if (!playedTile) return;

    let piecesForCalculation = pieces;
    let baselinePieces = playedTile.originalPieces;

    if (piecesAtCorrectionStart.length > 0) {
      baselinePieces = piecesAtCorrectionStart;
    }
    else if (bonusMoveWasCompleted) {
      piecesForCalculation = piecesBeforeBonusMove;
    }

    const calculatedMoves = calculateMoves(
      baselinePieces,
      piecesForCalculation,
      playedTile.playerId
    );

    const movesValidation = validateMovesForTilePlay(calculatedMoves);
    if (!movesValidation.isValid) {
      showAlert(
        "Invalid Moves",
        movesValidation.error || "Invalid move combination",
        "error"
      );
      return;
    }

    const tileRequirements =
      validateTileRequirementsWithImpossibleMoveExceptions(
        playedTile.tileId,
        calculatedMoves,
        playedTile.playerId,
        baselinePieces,
        piecesForCalculation,
        players,
        playerCount
      );

    if (!tileRequirements.isMet) {
      showAlert(
        "Incomplete Moves",
        `Still missing ${tileRequirements.missingMoves.join(", ")} move(s)`,
        "error"
      );
      return;
    }

    const requiredMoveTypes = tileRequirements.requiredMoves;
    const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
    const extraMoves: string[] = [];

    for (const moveType of performedMoveTypes) {
      if (!requiredMoveTypes.includes(moveType)) {
        extraMoves.push(moveType);
      }
    }

    const uniqueExtraMoves = [...new Set(extraMoves)];

    let allowedExtraMoves = uniqueExtraMoves;
    if (tilePlayerMustWithdraw) {
      allowedExtraMoves = uniqueExtraMoves.filter((m) => m !== "WITHDRAW");
    }

    if (allowedExtraMoves.length > 0) {
      showAlert(
        "Extra Moves Not Allowed",
        `You made extra moves that weren't required: ${allowedExtraMoves.join(
          ", "
        )}. Remove these moves and try again.`,
        "error"
      );
      return;
    }

    if (tilePlayerMustWithdraw) {
      const withdrawMoves = calculatedMoves.filter(
        (m) => m.moveType === "WITHDRAW"
      );
      const requiredWithdrawCount = requiredMoveTypes.filter(
        (m) => m === "WITHDRAW"
      ).length;

      const tilePlayer = getPlayerById(players, playedTile.playerId);
      const playerDomainEmpty =
        tilePlayer &&
        pieces.every((p) => {
          if (!p.locationId) return true;
          const locationPrefix = `p${tilePlayer.id}_`;
          return !p.locationId.startsWith(locationPrefix);
        });

      if (!playerDomainEmpty) {
        if (withdrawMoves.length <= requiredWithdrawCount) {
          showAlert(
            "Mandatory WITHDRAW Required",
            "You must perform an ADDITIONAL WITHDRAW move beyond the tile requirements. Add another WITHDRAW move to proceed.",
            "error"
          );
          return;
        }
      }
    }

    for (const move of calculatedMoves) {
      const fromLoc = move.fromLocationId
        ? formatLocationId(move.fromLocationId)
        : "supply";
      const toLoc = move.toLocationId
        ? formatLocationId(move.toLocationId)
        : "supply";
      const movedPiece = getPieceById(pieces, move.pieceId);
      const pieceName = movedPiece?.name || "piece";

      addGameLog(
        `Standing Move: Player ${playedTile.playerId} moves ${pieceName} from ${fromLoc} to ${toLoc}`
      );
    }

    const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const playerBankSpaces = bankSpaces.filter(
      (bs) => bs.ownerId === playedTile.receivingPlayerId
    );

    const usedBankIndices = new Set(
      bankedTiles
        .filter((bt) => bt.ownerId === playedTile.receivingPlayerId)
        .map((bt) =>
          playerBankSpaces.findIndex(
            (bs) =>
              bs.position.left === bt.position.left &&
              bs.position.top === bt.position.top
          )
        )
    );

    let nextBankIndex = 0;
    for (let i = 0; i < playerBankSpaces.length; i++) {
      if (!usedBankIndices.has(i)) {
        nextBankIndex = i;
        break;
      }
    }

    if (nextBankIndex < playerBankSpaces.length) {
      const bankSpace = playerBankSpaces[nextBankIndex];
      const newBankedTile: BoardTile & { faceUp: boolean } = {
        id: `bank_${playedTile.receivingPlayerId
          }_${nextBankIndex}_${Date.now()}`,
        tile: {
          id: parseInt(playedTile.tileId),
          url: `./images/${playedTile.tileId}.svg`,
        },
        position: bankSpace.position,
        rotation: bankSpace.rotation,
        placerId: playedTile.playerId,
        ownerId: playedTile.receivingPlayerId,
        faceUp: true,
      };

      setBankedTiles((prev: any) => [...prev, newBankedTile]);
    }

    setBoardTiles((prev) =>
      prev.filter(
        (bt) =>
          !(
            bt.tile.id.toString().padStart(2, "0") ===
            playedTile.tileId &&
            bt.placerId === playedTile.playerId &&
            bt.ownerId === playedTile.receivingPlayerId
          )
      )
    );

    resetChallengeState();

    const updatedPlayers = players.slice();
    const receiverIndex = updatedPlayers.findIndex(
      (p) => p.id === playedTile.receivingPlayerId
    );

    const pendingReward = pendingChallengerRewardRef.current;
    if (pendingReward) {
      const { challengerId, rewardType, credibility } = pendingReward;
      
      if (rewardType === 'BONUS_MOVE') {
        setGameState("BONUS_MOVE");
        setBonusMovePlayerId(challengerId);
        setShowBonusMoveModal(true);
        setPiecesBeforeBonusMove(pieces.map(p => ({ ...p })));
      } else {
        setGameState("TAKE_ADVANTAGE");
        setTakeAdvantageChallengerId(challengerId);
        setTakeAdvantageChallengerCredibility(credibility);
        setShowTakeAdvantageModal(true);
      }
      
      setPendingChallengerReward(null);
      pendingChallengerRewardRef.current = null;
      setPlayers(updatedPlayers);
      return;
    }

    if (receiverIndex !== -1) {
      setCurrentPlayerIndex(receiverIndex);
    }

    setPlayers(updatedPlayers);

    const allBankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const tilesPerPlayer = allBankSpaces.length / playerCount;
    const allBanksFull =
      updatedPlayers.length > 0 &&
      updatedPlayers.every((p) => p.bureaucracyTiles.length >= tilesPerPlayer);

    if (allBanksFull) {
      setShowBureaucracyTransition(true);

      setTimeout(() => {
        const turnOrder = getBureaucracyTurnOrder(updatedPlayers, pieces);
        const initialStates = updatedPlayers.map(
          (p) => ({
            playerId: p.id,
            initialKredcoin: calculatePlayerKredcoin(p),
            remainingKredcoin: calculatePlayerKredcoin(p),
            turnComplete: false,
            purchases: [],
          })
        );

        setBureaucracyTurnOrder(turnOrder);
        setBureaucracyStates(initialStates);
        setCurrentBureaucracyPlayerIndex(0);
        setShowBureaucracyMenu(true);
        setGameState("BUREAUCRACY");

        setPlayedTile(null);
        setMovesThisTurn([]);
        setReceiverAcceptance(null);
        setChallengeOrder([]);
        setCurrentChallengerIndex(0);
        setTileRejected(false);
        setHasPlayedTileThisTurn(false);
        setGiveReceiverViewingTileId(null);

        setShowBureaucracyTransition(false);
      }, 3000);

      return;
    }

    const winners = checkBureaucracyWinCondition(updatedPlayers, pieces);
    if (winners.length > 0) {
      if (winners.length === 1) {
        const winnerName = getPlayerName(
          getPlayerById(updatedPlayers, winners[0]),
          winners[0]
        );
        alert(`${winnerName} has won the game during the Campaign phase!`);
      } else {
        const winnerNames = formatWinnerNames(winners, updatedPlayers);
        alert(`The game is a draw! Winners: ${winnerNames}`);
      }
      return;
    }

    setPlayedTile(null);
    setMovesThisTurn([]);
    setGameState("CAMPAIGN");
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    const newMoverId = playedTile.receivingPlayerId;
    const newMover = getPlayerById(updatedPlayers, newMoverId);
    if (newMover !== undefined && newMover !== null) {
      setCredibilityAtTurnStart(prev => ({
        ...prev,
        [newMoverId]: newMover.credibility,
      }));
    }

    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());
  }, [playedTile, pieces, piecesAtCorrectionStart, bonusMoveWasCompleted, piecesBeforeBonusMove, calculateMoves, players, playerCount, tilePlayerMustWithdraw, showAlert, addGameLog, bankedTiles, setBankedTiles, setBoardTiles, resetChallengeState, pendingChallengerRewardRef, setGameState, setBonusMovePlayerId, setShowBonusMoveModal, setPiecesBeforeBonusMove, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, setShowTakeAdvantageModal, setPendingChallengerReward, setPlayers, setCurrentPlayerIndex, setShowBureaucracyTransition, setBureaucracyTurnOrder, setBureaucracyStates, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setPlayedTile, setMovesThisTurn, setReceiverAcceptance, setChallengeOrder, setCurrentChallengerIndex, setTileRejected, setHasPlayedTileThisTurn, setGiveReceiverViewingTileId, setPiecesAtTurnStart, setCredibilityAtTurnStart, setMovedPiecesThisTurn, setPendingCommunityPieces]);

  const handleCheckMove = React.useCallback(() => {
    if (!playedTile) return;

    let piecesForCalculation = pieces;
    let baselinePieces = playedTile.originalPieces;

    if (
      gameState === "CORRECTION_REQUIRED" &&
      piecesAtCorrectionStart.length > 0
    ) {
      baselinePieces = piecesAtCorrectionStart;
    }
    else if (bonusMoveWasCompleted) {
      piecesForCalculation = piecesBeforeBonusMove;
    }

    const calculatedMoves = calculateMoves(
      baselinePieces,
      piecesForCalculation,
      playedTile.playerId
    );

    const tileRequirements =
      validateTileRequirementsWithImpossibleMoveExceptions(
        playedTile.tileId,
        calculatedMoves,
        playedTile.playerId,
        baselinePieces,
        piecesForCalculation,
        players,
        playerCount
      );

    const moveValidations = calculatedMoves.map((move, index) => {
      let piecesForValidation = playedTile.originalPieces.map((p) => ({
        ...p,
      }));
      for (let i = 0; i < index; i++) {
        const prevMove = calculatedMoves[i];
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
        playedTile.playerId,
        piecesForValidation,
        playerCount
      );
      return {
        moveType: move.moveType,
        isValid: validation.isValid,
        reason: validation.reason,
        fromLocationId: move.fromLocationId,
        toLocationId: move.toLocationId,
      };
    });

    const requiredMoveTypes = tileRequirements.requiredMoves;
    const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
    const extraMoves: string[] = [];

    for (const moveType of performedMoveTypes) {
      if (!requiredMoveTypes.includes(moveType)) {
        extraMoves.push(moveType);
      }
    }

    const uniqueExtraMoves = [...new Set(extraMoves)];

    setMoveCheckResult({
      ...tileRequirements,
      hasExtraMoves: uniqueExtraMoves.length > 0,
      extraMoves: uniqueExtraMoves,
      moveValidations,
    });
    setShowMoveCheckResult(true);
  }, [playedTile, pieces, gameState, piecesAtCorrectionStart, bonusMoveWasCompleted, piecesBeforeBonusMove, calculateMoves, players, playerCount, validateSingleMove, setMoveCheckResult, setShowMoveCheckResult]);

  const handleTakeAdvantageDecline = React.useCallback(() => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    setGameLog((prev) => [
      ...prev,
      `${challengerName} declined the Take Advantage reward`,
    ]);

    cleanupTakeAdvantageModalState();

    if (playedTile) {
      const receiverIndex = players.findIndex((p) => p.id === playedTile.receivingPlayerId);
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
        setGameState("CAMPAIGN");
        setHasPlayedTileThisTurn(false);
        setPlayedTile(null);
        setTileRejected(false);
        resetChallengeState();

        setMovedPiecesThisTurn(new Set());
        setPendingCommunityPieces(new Set());
        
        setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));
        
        const newMoverId = playedTile.receivingPlayerId;
        const newMover = getPlayerById(players, newMoverId);
        if (newMover !== undefined && newMover !== null) {
          setCredibilityAtTurnStart(prev => ({
            ...prev,
            [newMoverId]: newMover.credibility,
          }));
        }
      }
    }
  }, [players, takeAdvantageChallengerId, setGameLog, cleanupTakeAdvantageModalState, playedTile, setCurrentPlayerIndex, setGameState, setHasPlayedTileThisTurn, setPlayedTile, setTileRejected, resetChallengeState, setMovedPiecesThisTurn, setPendingCommunityPieces, setPiecesAtTurnStart, pieces, setCredibilityAtTurnStart]);

  const handleTakeAdvantageYes = React.useCallback(() => {
    const challenger = getPlayerById(players, takeAdvantageChallengerId!);

    if (!challenger) {
      console.error("Challenger not found");
      handleTakeAdvantageDecline();
      return;
    }

    if (challenger.bureaucracyTiles.length === 0) {
      setTakeAdvantageValidationError("You have no tiles in your bank");
      setTimeout(() => {
        handleTakeAdvantageDecline();
      }, 2000);
      return;
    }

    setShowTakeAdvantageModal(false);
    setShowTakeAdvantageTileSelection(true);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
  }, [players, takeAdvantageChallengerId, handleTakeAdvantageDecline, setTakeAdvantageValidationError, setShowTakeAdvantageModal, setShowTakeAdvantageTileSelection, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage]);

  const handleRecoverCredibility = React.useCallback(() => {
    if (takeAdvantageChallengerId === null) return;

    setPlayers((prev: Player[]) =>
      prev.map((p) =>
        p.id === takeAdvantageChallengerId
          ? { ...p, credibility: Math.min(p.credibility + 1, 3) }
          : p
      )
    );

    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    setGameLog((prev) => [
      ...prev,
      `${challengerName} recovered 1 credibility (successful challenge reward)`,
    ]);

    cleanupTakeAdvantageModalState();

    if (playedTile) {
      const receiverIndex = players.findIndex((p) => p.id === playedTile.receivingPlayerId);
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
        setGameState("CAMPAIGN");
        setHasPlayedTileThisTurn(false);
        setPlayedTile(null);
        setTileRejected(false);
        resetChallengeState();

        setMovedPiecesThisTurn(new Set());
        setPendingCommunityPieces(new Set());
        
        setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));
        
        const newMoverId = playedTile.receivingPlayerId;
        const newMover = getPlayerById(players, newMoverId);
        if (newMover !== undefined && newMover !== null) {
          setCredibilityAtTurnStart(prev => ({
            ...prev,
            [newMoverId]: newMover.credibility,
          }));
        }
      }
    }
  }, [takeAdvantageChallengerId, setPlayers, players, setGameLog, cleanupTakeAdvantageModalState, playedTile, setCurrentPlayerIndex, setGameState, setHasPlayedTileThisTurn, setPlayedTile, setTileRejected, resetChallengeState, setMovedPiecesThisTurn, setPendingCommunityPieces, setPiecesAtTurnStart, pieces, setCredibilityAtTurnStart]);

  const handlePurchaseMove = React.useCallback(() => {
    const challenger = getPlayerById(players, takeAdvantageChallengerId!);

    if (!challenger) {
      console.error("Challenger not found");
      handleTakeAdvantageDecline();
      return;
    }

    if (challenger.bureaucracyTiles.length === 0) {
      setTakeAdvantageValidationError("You have no tiles in your bank");
      setTimeout(() => {
        handleTakeAdvantageDecline();
      }, 2000);
      return;
    }

    setShowTakeAdvantageModal(false);
    setShowTakeAdvantageTileSelection(true);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
  }, [players, takeAdvantageChallengerId, handleTakeAdvantageDecline, setTakeAdvantageValidationError, setShowTakeAdvantageModal, setShowTakeAdvantageTileSelection, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage]);

  const handleToggleTileSelection = React.useCallback((tile: Tile) => {
    const isCurrentlySelected = selectedTilesForAdvantage.some(
      (t) => t.id === tile.id
    );

    let newSelection: Tile[];
    if (isCurrentlySelected) {
      newSelection = selectedTilesForAdvantage.filter((t) => t.id !== tile.id);
    } else {
      newSelection = [...selectedTilesForAdvantage, tile];
    }

    setSelectedTilesForAdvantage(newSelection);

    const newTotal = newSelection.reduce((sum, t) => {
      return sum + (TILE_KREDCOIN_VALUES[t.id] || 0);
    }, 0);
    setTotalKredcoinForAdvantage(newTotal);
  }, [selectedTilesForAdvantage, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage]);

  const handleConfirmTileSelection = React.useCallback(() => {
    if (selectedTilesForAdvantage.length === 0) {
      setTakeAdvantageValidationError("Please select at least one tile");
      return;
    }

    if (totalKredcoinForAdvantage === 0) {
      setTakeAdvantageValidationError("Selected tiles have no kredcoin value");
      return;
    }

    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    const tileIds = selectedTilesForAdvantage.map((t) => t.id).join(", ");
    setGameLog((prev) => [
      ...prev,
      `${challengerName} selected tiles [${tileIds}] for Take Advantage (₭-${totalKredcoinForAdvantage})`,
    ]);

    setTakeAdvantagePiecesSnapshot(pieces.map((p) => ({ ...p })));

    setShowTakeAdvantageTileSelection(false);
    setShowTakeAdvantageMenu(true);
  }, [selectedTilesForAdvantage, totalKredcoinForAdvantage, players, takeAdvantageChallengerId, setGameLog, pieces, setTakeAdvantageValidationError, setTakeAdvantagePiecesSnapshot, setShowTakeAdvantageTileSelection, setShowTakeAdvantageMenu]);

  const handleCancelTileSelection = React.useCallback(() => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    setGameLog((prev) => [
      ...prev,
      `${challengerName} cancelled Take Advantage`,
    ]);

    setShowTakeAdvantageTileSelection(false);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);

    transitionToCorrectionPhase();
  }, [players, takeAdvantageChallengerId, setGameLog, setShowTakeAdvantageTileSelection, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, transitionToCorrectionPhase]);

  const handleCompleteTakeAdvantage = React.useCallback((purchase: BureaucracyPurchase) => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );

    if (takeAdvantageChallengerId !== null) {
      const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
      const playerBankSpaces = bankSpaces.filter(
        (bs) => bs.ownerId === takeAdvantageChallengerId
      );

      const usedBankIndices = new Set(
        bankedTiles
          .filter((bt) => bt.ownerId === takeAdvantageChallengerId)
          .map((bt) =>
            playerBankSpaces.findIndex(
              (bs) =>
                bs.position.left === bt.position.left &&
                bs.position.top === bt.position.top
            )
          )
      );

      const newBankedTiles: (BoardTile & { faceUp: boolean })[] = [];
      let bankIndex = 0;

      for (const tile of selectedTilesForAdvantage) {
        while (
          bankIndex < playerBankSpaces.length &&
          usedBankIndices.has(bankIndex)
        ) {
          bankIndex++;
        }

        if (bankIndex < playerBankSpaces.length) {
          const bankSpace = playerBankSpaces[bankIndex];
          const newBankedTile: BoardTile & { faceUp: boolean } = {
            id: `bank_${takeAdvantageChallengerId}_${bankIndex}_${Date.now()}_${tile.id
              }`,
            tile: tile,
            position: bankSpace.position,
            rotation: bankSpace.rotation,
            placerId: takeAdvantageChallengerId,
            ownerId: takeAdvantageChallengerId,
            faceUp: true,
          };

          newBankedTiles.push(newBankedTile);
          usedBankIndices.add(bankIndex);
          bankIndex++;
        }
      }

      setBankedTiles((prev: any) => [...prev, ...newBankedTiles]);
    }

    setPlayers((prev: Player[]) =>
      prev.map((p) => {
        if (p.id === takeAdvantageChallengerId) {
          const tilesToRemove = selectedTilesForAdvantage.map((t) => t.id);
          return {
            ...p,
            bureaucracyTiles: p.bureaucracyTiles.filter(
              (t) => !tilesToRemove.includes(t.id)
            ),
          };
        }
        return p;
      })
    );

    const actionName =
      purchase.item.type === "PROMOTION"
        ? `Promotion (${purchase.item.promotionLocation})`
        : purchase.item.type === "CREDIBILITY"
          ? "Credibility Restoration"
          : purchase.item.moveType;

    const tileIds = selectedTilesForAdvantage.map((t) => t.id).join(", ");
    setGameLog((prev) => [
      ...prev,
      `${challengerName} completed Take Advantage: ${actionName} (₭-${purchase.item.price}) using tiles [${tileIds}]`,
    ]);

    setShowTakeAdvantageMenu(false);
    setTakeAdvantagePurchase(null);
    setSelectedTilesForAdvantage([]);
    setTotalKredcoinForAdvantage(0);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);
    setTakeAdvantagePiecesSnapshot([]);
    setTakeAdvantageValidationError(null);
    setMovesThisTurn([]);
    setMovedPiecesThisTurn(new Set());

    if (playedTile) {
      const receiverIndex = players.findIndex((p) => p.id === playedTile.receivingPlayerId);
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
        setGameState("CAMPAIGN");
        setHasPlayedTileThisTurn(false);
        setPlayedTile(null);
        setTileRejected(false);
        resetChallengeState();

        setMovedPiecesThisTurn(new Set());
        setPendingCommunityPieces(new Set());
        
        setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));
        
        const newMoverId = playedTile.receivingPlayerId;
        const newMover = getPlayerById(players, newMoverId);
        if (newMover !== undefined && newMover !== null) {
          setCredibilityAtTurnStart(prev => ({
            ...prev,
            [newMoverId]: newMover.credibility,
          }));
        }
      }
    }
  }, [players, takeAdvantageChallengerId, playerCount, bankedTiles, setBankedTiles, selectedTilesForAdvantage, setPlayers, setGameLog, setShowTakeAdvantageMenu, setTakeAdvantagePurchase, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, setTakeAdvantagePiecesSnapshot, setTakeAdvantageValidationError, setMovesThisTurn, setMovedPiecesThisTurn, playedTile, setCurrentPlayerIndex, setGameState, setHasPlayedTileThisTurn, setPlayedTile, setTileRejected, resetChallengeState, setPendingCommunityPieces, setPiecesAtTurnStart, pieces, setCredibilityAtTurnStart]);

  const validateTakeAdvantageAction = React.useCallback((
    purchase: BureaucracyPurchase
  ): { isValid: boolean; error?: string } => {
    const item = purchase.item;

    if (item.type === "CREDIBILITY") {
      return { isValid: true };
    }

    if (item.type === "PROMOTION") {
      const piecesMovedToCommunity = takeAdvantagePiecesSnapshot.filter(
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
        pieces,
        promotedPieceId,
        item.promotionLocation!,
        takeAdvantageChallengerId!,
        takeAdvantagePiecesSnapshot
      );

      if (!validation.isValid) {
        return { isValid: false, error: validation.reason };
      }

      return { isValid: true };
    }

    if (item.type === "MOVE") {
      const requiredMoveType = item.moveType!;

      const calculatedMoves = calculateMoves(
        takeAdvantagePiecesSnapshot,
        pieces,
        takeAdvantageChallengerId!
      );

      if (calculatedMoves.length === 0) {
        return { isValid: false, error: "You must perform a move" };
      }

      let allMovesValid = true;
      for (let i = 0; i < calculatedMoves.length; i++) {
        const move = calculatedMoves[i];

        let piecesForValidation = takeAdvantagePiecesSnapshot.map((p) => ({
          ...p,
        }));
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
          takeAdvantageChallengerId!,
          piecesForValidation,
          playerCount
        );
        if (!validation.isValid) {
          allMovesValid = false;
          return {
            isValid: false,
            error: `${move.moveType} move validation failed: ${validation.reason}`,
          };
        }
      }

      if (!allMovesValid) {
        return { isValid: false, error: "Move validation failed" };
      }

      const hasMatchingMove = calculatedMoves.some(
        (m) => m.moveType === requiredMoveType
      );

      if (!hasMatchingMove) {
        const performedTypes = calculatedMoves
          .map((m) => m.moveType)
          .join(", ");
        return {
          isValid: false,
          error: `Expected a ${requiredMoveType} move, but you performed: ${performedTypes}`,
        };
      }

      return { isValid: true };
    }

    return { isValid: false, error: "Unknown action type" };
  }, [takeAdvantagePiecesSnapshot, pieces, takeAdvantageChallengerId, calculateMoves, validateSingleMove, playerCount]);

  const handleSelectTakeAdvantageAction = React.useCallback((item: BureaucracyMenuItem) => {
    if (totalKredcoinForAdvantage < item.price) {
      setTakeAdvantageValidationError(ALERTS.INSUFFICIENT_KREDCOIN.message);
      setTimeout(
        () => setTakeAdvantageValidationError(null),
        TIMEOUTS.VALIDATION_ERROR_SHORT
      );
      return;
    }

    const purchase: BureaucracyPurchase = {
      playerId: takeAdvantageChallengerId!,
      item,
      timestamp: Date.now(),
      completed: false,
    };

    setTakeAdvantagePurchase(purchase);

    if (item.type === "CREDIBILITY") {
      setPlayers((prev: Player[]) =>
        prev.map((p) =>
          p.id === takeAdvantageChallengerId
            ? { ...p, credibility: Math.min(p.credibility + 1, 3) }
            : p
        )
      );

      const challengerName = getPlayerName(
        getPlayerById(players, takeAdvantageChallengerId!),
        takeAdvantageChallengerId!
      );
      setGameLog((prev) => [
        ...prev,
        `${challengerName} restored credibility using Take Advantage`,
      ]);

      setTimeout(() => {
        handleCompleteTakeAdvantage(purchase);
      }, 1500);
    }
  }, [totalKredcoinForAdvantage, takeAdvantageChallengerId, setTakeAdvantagePurchase, setTakeAdvantageValidationError, setPlayers, players, setGameLog, handleCompleteTakeAdvantage]);

  const handleResetTakeAdvantageAction = React.useCallback(() => {
    if (takeAdvantagePiecesSnapshot.length > 0) {
      setPieces(takeAdvantagePiecesSnapshot.map((p) => ({ ...p })));
      setMovesThisTurn([]);
      setMovedPiecesThisTurn(new Set());

      const challengerName = getPlayerName(
        getPlayerById(players, takeAdvantageChallengerId!),
        takeAdvantageChallengerId!
      );
      setGameLog((prev) => [
        ...prev,
        `${challengerName} reset their Take Advantage action`,
      ]);
    }

    setTakeAdvantagePurchase(null);
  }, [takeAdvantagePiecesSnapshot, setPieces, setMovesThisTurn, setMovedPiecesThisTurn, players, takeAdvantageChallengerId, setGameLog, setTakeAdvantagePurchase]);

  const handleDoneTakeAdvantageAction = React.useCallback(() => {
    if (!takeAdvantagePurchase) return;

    const purchase = takeAdvantagePurchase;
    const validation = validateTakeAdvantageAction(purchase);

    if (!validation.isValid) {
      setTakeAdvantageValidationError(
        validation.error || "Invalid action. Please try again or reset."
      );
      setTimeout(() => setTakeAdvantageValidationError(null), 4000);
      return;
    }

    handleCompleteTakeAdvantage(purchase);
  }, [takeAdvantagePurchase, validateTakeAdvantageAction, setTakeAdvantageValidationError, handleCompleteTakeAdvantage]);

  const handleTakeAdvantagePiecePromote = React.useCallback((pieceId: string) => {
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
  }, [takeAdvantagePurchase, pieces, setTakeAdvantageValidationError, setPieces]);

  return {
    handleReceiverAcceptanceDecision,
    handlePerfectTileContinue,
    handleChallengerDecision,
    handleChallengerPass,
    resolveChallengeAfterReveal,
    handleContinueAfterChallengeReveal,
    handleCorrectionComplete,
    handleCheckMove,
    handleTakeAdvantageDecline,
    handleTakeAdvantageYes,
    handleRecoverCredibility,
    handlePurchaseMove,
    handleToggleTileSelection,
    handleConfirmTileSelection,
    handleCancelTileSelection,
    handleSelectTakeAdvantageAction,
    handleResetTakeAdvantageAction,
    handleDoneTakeAdvantageAction,
    handleTakeAdvantagePiecePromote,
    handleBonusMoveComplete,
    transitionToCorrectionPhase,
    finalizeTilePlay,
  };
}
