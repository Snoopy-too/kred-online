import React, { useState } from "react";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ErrorDisplay from "./components/shared/ErrorDisplay";
import ScreenRouter from "./components/ScreenRouter";
import ModalContainer from "./components/ModalContainer";
import { HandlersProvider } from "./providers/HandlersProvider";

// Hooks
import { useGameState } from "./hooks/useGameState";
import { useAlerts } from "./hooks/useAlerts";
import { useBoardDisplay } from "./hooks/useBoardDisplay";
import { useTestMode } from "./hooks/useTestMode";
import { useBonusMoves } from "./hooks/useBonusMoves";
import { useMoveTracking } from "./hooks/useMoveTracking";
import { useTilePlayWorkflow } from "./hooks/useTilePlayWorkflow";
import { useChallengeFlow } from "./hooks/useChallengeFlow";
import { useChallengeFlowHandlers } from "./hooks/useChallengeFlowHandlers";
import { useBureaucracy } from "./hooks/useBureaucracy";
import { useBureaucracyHandlers } from "./hooks/useBureaucracyHandlers";
import { useMultiplayerHost } from "./hooks/useMultiplayerHost";
import { useAppWrappers } from "./hooks/useAppWrappers";
import { useCampaign, useCampaignDispatch } from "./providers/CampaignProvider";
import { useDiagnostics } from "./diagnostics";

// Handlers & Utils
import { createGameFlowHandlers, createPieceMovementHandlers, createTurnHandlers, createTilePlayHandlers } from "./handlers";
import { BANK_SPACES_BY_PLAYER_COUNT, ALERTS } from "./config";
import { areSeatsAdjacent, validatePieceMovement, validateMoveType } from "./rules";
import { calculateMoves as calculateMovesCore } from "./game";
import { validateMovesForTilePlay, validateSingleMove } from "./game/validation";
import { calculatePieceRotation } from "./utils/positioning";
import { getLocationIdFromPosition } from "./game/locations";
import { formatLocationId } from "./utils/formatting";
import { isLegalMoveSet, getMatchingTileIds } from "./game/tile-matching";
import { initializePlayers, initializeCampaignPieces } from "./game/initialization";
import { getBureaucracyTurnOrder, calculatePlayerKredcoin } from "./game/bureaucracy";

export interface MultiplayerProps {
  isMultiplayer?: boolean;
  isHost?: boolean;
  playerIndex?: number;
  playerCount?: number;
  playerNames?: string[];
  skipDraft?: boolean;
  multiplayerActions?: any;
  getStatePacketRef?: React.MutableRefObject<() => any>;
  applyStatePacketRef?: React.MutableRefObject<(packet: any) => void>;
  pushStateRef?: React.MutableRefObject<(() => void) | null>;
  setActionDispatch?: (dispatch: (action: { type: string; playerId: string; payload: any }) => void) => void;
  onPhaseChange?: (phase: string) => void;
  onLegacyStateChange?: (state: any) => void;
}

const App: React.FC<MultiplayerProps> = (props) => {
  const { isMultiplayer = false, isHost = false, playerIndex, multiplayerActions, setActionDispatch, playerNames, onPhaseChange, onLegacyStateChange, applyStatePacketRef, pushStateRef, playerCount: multiplayerPlayerCount, skipDraft: multiplayerSkipDraft = false } = props;

  // ─── Core State ─────────────────────────────────────────────────────────────
  const { gameState, players, pieces, boardTiles, bankedTiles, playerCount, currentPlayerIndex, moverPlayerIndex, campaignRole, draftRound, isTestMode, setGameState, setPlayers, setPieces, setBoardTiles, setBankedTiles, setPlayerCount, setCurrentPlayerIndex, setMoverPlayerIndex, setCampaignRole, setDraftRound, setIsTestMode } = useGameState();
  const { alertModal, challengeResultMessage, tilePlayerMustWithdraw, placerViewingTileId, challengeResultMessagePlayerId, showAlert: originalShowAlert, closeAlert, clearChallengeResult, setAlertModal, setChallengeResultMessage, setChallengeResultMessagePlayerId, setTilePlayerMustWithdraw, setPlacerViewingTileId } = useAlerts();
  const { boardRotationEnabled, showGridOverlay, dummyTile, setBoardRotationEnabled, setShowGridOverlay, setDummyTile } = useBoardDisplay();
  const { gameLog, isGameLogExpanded, isCredibilityAdjusterExpanded, isCredibilityRulesExpanded, isPieceTrackerExpanded, credibilityRotationAdjustments, addGameLog, setGameLog, setIsGameLogExpanded, setIsCredibilityAdjusterExpanded, setIsCredibilityRulesExpanded, setIsPieceTrackerExpanded, setCredibilityRotationAdjustments } = useTestMode();
  const { showBonusMoveModal, bonusMovePlayerId, bonusMoveWasCompleted, showPerfectTileModal, setShowBonusMoveModal, setBonusMovePlayerId, setBonusMoveWasCompleted, setShowPerfectTileModal } = useBonusMoves();
  const { piecesAtTurnStart, piecesBeforeBonusMove, piecesAtCorrectionStart, movedPiecesThisTurn, lastDroppedPosition, lastDroppedPieceId, showMoveCheckResult, moveCheckResult, setPiecesAtTurnStart, setPiecesBeforeBonusMove, setPiecesAtCorrectionStart, setMovedPiecesThisTurn, setLastDroppedPosition, setLastDroppedPieceId, setShowMoveCheckResult, setMoveCheckResult } = useMoveTracking();
  const { playedTile, movesThisTurn, hasPlayedTileThisTurn, revealedTileId, tileTransaction, receiverAcceptance, challengeOrder, currentChallengerIndex, tileRejected, setPlayedTile, setMovesThisTurn, setHasPlayedTileThisTurn, setRevealedTileId, setTileTransaction, setReceiverAcceptance, setChallengeOrder, setCurrentChallengerIndex, setTileRejected } = useTilePlayWorkflow();
  const { bystanders, bystanderIndex, isPrivatelyViewing, showChallengeRevealModal, challengedTile, showTakeAdvantageModal, takeAdvantageChallengerId, takeAdvantageChallengerCredibility, showTakeAdvantageTileSelection, selectedTilesForAdvantage, totalKredcoinForAdvantage, showTakeAdvantageMenu, takeAdvantagePurchase, takeAdvantagePiecesSnapshot, takeAdvantageValidationError, setBystanders, setBystanderIndex, setIsPrivatelyViewing, setShowChallengeRevealModal, setChallengedTile, setShowTakeAdvantageModal, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, setShowTakeAdvantageTileSelection, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage, setShowTakeAdvantageMenu, setTakeAdvantagePurchase, setTakeAdvantagePiecesSnapshot, setTakeAdvantageValidationError } = useChallengeFlow();
  const { bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, currentBureaucracyPurchase, showBureaucracyMenu, bureaucracyValidationError, bureaucracySnapshot, bureaucracyMoves, showBureaucracyMoveCheckResult, bureaucracyMoveCheckResult, pendingCommunityPieces, showBureaucracyTransition, setBureaucracyStates, setBureaucracyTurnOrder, setCurrentBureaucracyPlayerIndex, setCurrentBureaucracyPurchase, setShowBureaucracyMenu, setBureaucracyValidationError, setBureaucracyMoves, setBureaucracySnapshot, setShowBureaucracyMoveCheckResult, setBureaucracyMoveCheckResult, setPendingCommunityPieces, setShowBureaucracyTransition } = useBureaucracy();

  const [matchingTileIds, setMatchingTileIds] = useState<string[]>([]);
  const [showFinishTurnConfirm, setShowFinishTurnConfirm] = useState({ isOpen: false, remainingKredcoin: 0 });
  const [credibilityAtTurnStart, setCredibilityAtTurnStart] = useState<Record<number, number>>({});
  const { tileRevealed, pendingReceiverReward, receiverAdvanceInProgress, giveReceiverViewingTileId } = useCampaign();
  const { setTileRevealed, setPendingReceiverReward, setReceiverAdvanceInProgress, setGiveReceiverViewingTileId } = useCampaignDispatch();
  const logDiag = useDiagnostics();

  // ─── Multiplayer sync: phase → parent ───────────────────────────────────────
  React.useEffect(() => {
    if (onPhaseChange) onPhaseChange(gameState);
  }, [gameState, onPhaseChange]);

  // ─── Multiplayer sync: legacy state → GameStateAggregator, apply packet ─────
  React.useEffect(() => {
    if (!onLegacyStateChange) return;

    onLegacyStateChange({
      gameState, players, pieces, boardTiles, bankedTiles,
      currentPlayerIndex, playerCount, playedTile, hasPlayedTileThisTurn,
      movedPiecesThisTurn: Array.from(movedPiecesThisTurn),
      pendingCommunityPieces: Array.from(pendingCommunityPieces),
      tileTransaction, moverPlayerIndex, campaignRole,
      tileRevealed, pendingReceiverReward, receiverAdvanceInProgress,
      bystanders, bystanderIndex, challengeOrder, currentChallengerIndex,
      tileRejected, showChallengeRevealModal, challengedTile,
      showTakeAdvantageModal, takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
      bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex,
      challengeResultMessage, challengeResultMessagePlayerId,
      pendingChallengerReward: null,
      bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
      serverAlert: null,
      stateVersion: 0, lastUpdated: Date.now(),
    });

    if (applyStatePacketRef) {
      applyStatePacketRef.current = (packet: any) => {
        setGameState(packet.gameState);
        setPlayers(packet.players);
        setPieces(packet.pieces);
        setBoardTiles(packet.boardTiles);
        setBankedTiles(packet.bankedTiles);
        setCurrentPlayerIndex(packet.currentPlayerIndex);
        setPlayerCount(packet.playerCount);
        setPlayedTile(packet.playedTile);
        setHasPlayedTileThisTurn(packet.hasPlayedTileThisTurn);
        setMovedPiecesThisTurn(new Set(packet.movedPiecesThisTurn || []));
        if (Array.isArray(packet.pendingCommunityPieces)) {
          setPendingCommunityPieces(new Set(packet.pendingCommunityPieces));
        } else {
          setPendingCommunityPieces(new Set());
        }
        setTileTransaction(packet.tileTransaction);
        setMoverPlayerIndex(packet.moverPlayerIndex);
        setCampaignRole(packet.campaignRole);
        setTileRevealed(packet.tileRevealed);
        setPendingReceiverReward(packet.pendingReceiverReward);
        setReceiverAdvanceInProgress(packet.receiverAdvanceInProgress);
        setBystanders(packet.bystanders);
        setBystanderIndex(packet.bystanderIndex);
        setChallengeOrder(packet.challengeOrder);
        setCurrentChallengerIndex(packet.currentChallengerIndex);
        setTileRejected(packet.tileRejected);
        setShowChallengeRevealModal(!!packet.showChallengeRevealModal);
        setChallengedTile(packet.challengedTile ?? null);
        setShowTakeAdvantageModal(packet.showTakeAdvantageModal);
        setTakeAdvantageChallengerId(packet.takeAdvantageChallengerId);
        setTakeAdvantageChallengerCredibility(packet.takeAdvantageChallengerCredibility);
        setBureaucracyStates(packet.bureaucracyStates ?? []);
        setBureaucracyTurnOrder(packet.bureaucracyTurnOrder ?? []);
        setCurrentBureaucracyPlayerIndex(packet.currentBureaucracyPlayerIndex ?? 0);
        setChallengeResultMessage(packet.challengeResultMessage ?? "");
        setChallengeResultMessagePlayerId(packet.challengeResultMessagePlayerId);
        setBonusMovePlayerId(packet.bonusMovePlayerId);
        setShowBonusMoveModal(packet.showBonusMoveModal);
        if (packet.piecesBeforeBonusMove) {
          setPiecesBeforeBonusMove(packet.piecesBeforeBonusMove);
        }
        logDiag({
          category: 'system',
          event_type: 'STATE_SYNC_APPLIED',
          payload: {
            gameState: packet.gameState,
            piecesCount: packet.pieces?.length ?? 0,
            movedPiecesThisTurn: packet.movedPiecesThisTurn ?? [],
            pendingCommunityPieces: packet.pendingCommunityPieces ?? [],
            currentPlayerIndex: packet.currentPlayerIndex,
            hasPlayedTileThisTurn: packet.hasPlayedTileThisTurn,
          },
        });
      };
    }
  }, [
    onLegacyStateChange, applyStatePacketRef, gameState, players, pieces, boardTiles, bankedTiles,
    currentPlayerIndex, playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, pendingCommunityPieces,
    tileTransaction, moverPlayerIndex, campaignRole, tileRevealed,
    pendingReceiverReward, receiverAdvanceInProgress, bystanders, bystanderIndex,
    challengeOrder, currentChallengerIndex, tileRejected,
    showChallengeRevealModal, challengedTile, showTakeAdvantageModal,
    takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex,
    challengeResultMessage, challengeResultMessagePlayerId,
    bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
  ]);

  // ─── Multiplayer sync: host pushes state on change ──────────────────────────
  React.useEffect(() => {
    if (!isHost || !isMultiplayer) return;
    pushStateRef?.current?.();
  }, [
    isHost, isMultiplayer, pushStateRef, gameState, players, pieces, boardTiles, bankedTiles,
    currentPlayerIndex, playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, pendingCommunityPieces,
    tileTransaction, moverPlayerIndex, campaignRole, tileRevealed,
    pendingReceiverReward, receiverAdvanceInProgress, bystanders, bystanderIndex,
    challengeOrder, currentChallengerIndex, tileRejected,
    showChallengeRevealModal, challengedTile, showTakeAdvantageModal,
    takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex,
    challengeResultMessage, challengeResultMessagePlayerId,
    bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
  ]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const showAlert = React.useCallback((title: string, message: string, type: "error" | "warning" | "info" = "info", targetId?: number | null) => {
    originalShowAlert(title, message, type, targetId !== undefined ? targetId : (players[currentPlayerIndex]?.id || null));
  }, [players, currentPlayerIndex, originalShowAlert]);

  const gameFlowHandlers = React.useMemo(() => createGameFlowHandlers({
    playerCount, players, currentPlayerIndex, draftRound,
    setPlayerCount, setIsTestMode, setPlayers, setPieces, setCurrentPlayerIndex, setDraftRound, setGameState, setGameLog,
    playerNames,
    setPiecesAtTurnStart, setMovedPiecesThisTurn, setPendingCommunityPieces,
    setBoardTiles, setBankedTiles, setLastDroppedPosition, setRevealedTileId,
    setHasPlayedTileThisTurn, setPlayedTile, setMovesThisTurn, setTileTransaction, setReceiverAcceptance,
    setChallengedTile, setPlacerViewingTileId, setBystanders, setBystanderIndex, setIsPrivatelyViewing,
    setShowChallengeRevealModal, setChallengeOrder, setCurrentChallengerIndex, setTileRejected,
    setShowMoveCheckResult, setMoveCheckResult, setGiveReceiverViewingTileId, setTilePlayerMustWithdraw,
    setBureaucracyTurnOrder, setBureaucracyStates, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu,
    initializePlayers, initializeCampaignPieces, getBureaucracyTurnOrder, calculatePlayerKredcoin,
    BANK_SPACES_BY_PLAYER_COUNT,
    setCampaignRole, setMoverPlayerIndex, setCredibilityAtTurnStart,
    pieces, boardTiles, bankedTiles, isTestMode,
  } as any), [playerCount, players, currentPlayerIndex, draftRound, playerNames, pieces, boardTiles, bankedTiles, isTestMode, setPlayerCount, setIsTestMode, setPlayers, setPieces, setCurrentPlayerIndex, setDraftRound, setGameState, setGameLog, setPiecesAtTurnStart, setMovedPiecesThisTurn, setPendingCommunityPieces, setBoardTiles, setBankedTiles, setLastDroppedPosition, setRevealedTileId, setHasPlayedTileThisTurn, setPlayedTile, setMovesThisTurn, setTileTransaction, setReceiverAcceptance, setChallengedTile, setPlacerViewingTileId, setBystanders, setBystanderIndex, setIsPrivatelyViewing, setShowChallengeRevealModal, setChallengeOrder, setCurrentChallengerIndex, setTileRejected, setShowMoveCheckResult, setMoveCheckResult, setGiveReceiverViewingTileId, setTilePlayerMustWithdraw, setBureaucracyTurnOrder, setBureaucracyStates, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setCampaignRole, setMoverPlayerIndex, setCredibilityAtTurnStart]);
  const pieceMovementHandlers = React.useMemo(() => createPieceMovementHandlers({ pieces, players, playerCount, currentPlayerIndex, movedPiecesThisTurn, pendingCommunityPieces, piecesAtTurnStart, piecesAtCorrectionStart, piecesBeforeBonusMove, playedTile: playedTile as any, setPieces, setPlayers, setBoardTiles, setGameState, setMovedPiecesThisTurn, setPendingCommunityPieces, setLastDroppedPosition, setLastDroppedPieceId, setPlayedTile, setHasPlayedTileThisTurn, showAlert, validatePieceMovement, validateMoveType, calculatePieceRotation, formatLocationId, logDiag, ALERTS } as any), [pieces, players, playerCount, currentPlayerIndex, movedPiecesThisTurn, pendingCommunityPieces, piecesAtTurnStart, piecesAtCorrectionStart, piecesBeforeBonusMove, playedTile, setPieces, setPlayers, setBoardTiles, setGameState, setMovedPiecesThisTurn, setPendingCommunityPieces, setLastDroppedPosition, setLastDroppedPieceId, setPlayedTile, setHasPlayedTileThisTurn, showAlert, validatePieceMovement, validateMoveType, calculatePieceRotation, formatLocationId, logDiag, ALERTS]);
  const turnHandlers = React.useMemo(() => createTurnHandlers({ players, pieces, playerCount, currentPlayerIndex, setCurrentPlayerIndex, setGameState, setGameLog, setPiecesAtTurnStart, setHasPlayedTileThisTurn, setRevealedTileId, setTileTransaction, setBystanders, setBystanderIndex, setIsPrivatelyViewing, setChallengedTile, setPlacerViewingTileId, setMovedPiecesThisTurn, setPendingCommunityPieces, getLocationIdFromPosition, formatLocationId } as any), [players, pieces, playerCount, currentPlayerIndex, setCurrentPlayerIndex, setGameState, setGameLog, setPiecesAtTurnStart, setHasPlayedTileThisTurn, setRevealedTileId, setTileTransaction, setBystanders, setBystanderIndex, setIsPrivatelyViewing, setChallengedTile, setPlacerViewingTileId, setMovedPiecesThisTurn, setPendingCommunityPieces, getLocationIdFromPosition, formatLocationId]);
  const tilePlayHandlers = React.useMemo(() => createTilePlayHandlers({ gameState, players, playerCount, currentPlayerIndex, hasPlayedTileThisTurn, piecesAtTurnStart, pieces, boardTiles, bankSpacesByPlayerCount: BANK_SPACES_BY_PLAYER_COUNT, setPlayers, setBoardTiles, setPlayedTile, setGameState, setMovesThisTurn, setHasPlayedTileThisTurn, setMovedPiecesThisTurn, setPendingCommunityPieces, setBonusMoveWasCompleted, setPiecesAtCorrectionStart, setPiecesBeforeBonusMove, setRevealedTileId, setIsPrivatelyViewing, setPlacerViewingTileId, setReceiverAcceptance, setCurrentPlayerIndex, showAlert, calculateMoves: (orig: any, curr: any, pid: any) => calculateMovesCore(orig, curr, pid, playerCount, areSeatsAdjacent) } as any), [gameState, players, playerCount, currentPlayerIndex, hasPlayedTileThisTurn, piecesAtTurnStart, pieces, boardTiles, setPlayers, setBoardTiles, setPlayedTile, setGameState, setMovesThisTurn, setHasPlayedTileThisTurn, setMovedPiecesThisTurn, setPendingCommunityPieces, setBonusMoveWasCompleted, setPiecesAtCorrectionStart, setPiecesBeforeBonusMove, setRevealedTileId, setIsPrivatelyViewing, setPlacerViewingTileId, setReceiverAcceptance, setCurrentPlayerIndex, showAlert]);

  const challengeFlowHandlers = useChallengeFlowHandlers({ players, pieces, playerCount, gameState, playedTile, bankedTiles, challengeOrder, currentChallengerIndex, receiverAcceptance, tileRejected, takeAdvantageChallengerId, takeAdvantageChallengerCredibility, selectedTilesForAdvantage, totalKredcoinForAdvantage, takeAdvantagePurchase, takeAdvantagePiecesSnapshot, piecesAtCorrectionStart, bonusMoveWasCompleted, piecesBeforeBonusMove, tilePlayerMustWithdraw, credibilityAtTurnStart, pendingChallengerReward: null, currentPlayerIndex, setPlayers, setPieces, setBankedTiles, setGameState, setPlayedTile, setMovesThisTurn, setHasPlayedTileThisTurn, setReceiverAcceptance, setChallengeOrder, setCurrentChallengerIndex, setTileRejected, setChallengedTile, setShowChallengeRevealModal, setChallengeResultMessage, setChallengeResultMessagePlayerId, setShowPerfectTileModal, setTilePlayerMustWithdraw, setPiecesAtCorrectionStart, setMovedPiecesThisTurn, setPendingCommunityPieces, setPendingChallengerReward: () => { }, setBonusMovePlayerId, setShowBonusMoveModal, setPiecesBeforeBonusMove, setCurrentPlayerIndex, setPiecesAtTurnStart, setCredibilityAtTurnStart, setShowTakeAdvantageModal, setTakeAdvantageChallengerId, setTakeAdvantageChallengerCredibility, setShowTakeAdvantageTileSelection, setSelectedTilesForAdvantage, setTotalKredcoinForAdvantage, setShowTakeAdvantageMenu, setTakeAdvantagePurchase, setTakeAdvantagePiecesSnapshot, setTakeAdvantageValidationError, setMoveCheckResult, setShowMoveCheckResult, setBoardTiles, setBureaucracyTurnOrder, setBureaucracyStates, setCurrentBureaucracyPlayerIndex, setShowBureaucracyMenu, setShowBureaucracyTransition, setGiveReceiverViewingTileId, showAlert, addGameLog, setGameLog, advanceTurnNormally: turnHandlers.advanceTurnNormally, pendingChallengerRewardRef: { current: null } as any } as any);
  const bureaucracyHandlers = useBureaucracyHandlers({
    players, pieces, playerCount, boardTiles, bankedTiles,
    bureaucracyStates, bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex, currentBureaucracyPurchase,
    bureaucracySnapshot, bureaucracyMoves,
    setPlayers, setPieces, setBoardTiles, setGameState,
    setBureaucracyStates, setCurrentBureaucracyPlayerIndex,
    setCurrentBureaucracyPurchase, setShowBureaucracyMenu,
    setBureaucracyValidationError, setBureaucracyMoves,
    setBureaucracySnapshot, setBureaucracyMoveCheckResult,
    setShowBureaucracyMoveCheckResult, setShowFinishTurnConfirm,
    setCurrentPlayerIndex, setBankedTiles, setBureaucracyTurnOrder,
    setPiecesAtTurnStart, setCredibilityAtTurnStart, setHasPlayedTileThisTurn,
    calculateMoves: (orig: any, curr: any, pid: any) => calculateMovesCore(orig, curr, pid, playerCount, areSeatsAdjacent),
    validateSingleMove, calculatePieceRotation
  } as any);


  // ─── Turn Advancement ───────────────────────────────────────────────────────
  const handleEndTurn = React.useCallback(() => {
    if (gameState === "CORRECTION_REQUIRED" && playedTile) { challengeFlowHandlers.handleCorrectionComplete(); return; }
    if (gameState === "CAMPAIGN" && !playedTile && !hasPlayedTileThisTurn) {
      const calculated = calculateMovesCore(piecesAtTurnStart, pieces, players[currentPlayerIndex].id, playerCount, areSeatsAdjacent);
      if (!validateMovesForTilePlay(calculated).isValid || !isLegalMoveSet(calculated)) { showAlert("Invalid Moves", "Please check your moves.", "error"); return; }
      setMatchingTileIds(getMatchingTileIds(calculated, players[currentPlayerIndex].keptTiles)); setGameState("SELECTING_TILE"); return;
    }
    if (playedTile && gameState === "TILE_PLAYED") {
      setPlayedTile(prev => prev ? { ...prev, movesPerformed: calculateMovesCore(prev.originalPieces, pieces, prev.playerId, playerCount, areSeatsAdjacent) } : null);
      setReceiverAcceptance(null); setGameState("PENDING_ACCEPTANCE"); return;
    }
    setPiecesAtTurnStart(pieces.map(p => ({ ...p })));
    turnHandlers.advanceTurnNormally();
  }, [gameState, playedTile, hasPlayedTileThisTurn, players, currentPlayerIndex, piecesAtTurnStart, pieces, playerCount, challengeFlowHandlers, showAlert, setGameState, setPlayedTile, setReceiverAcceptance, turnHandlers]);

  const handlePlaceTileWithValidation = React.useCallback((tileId: number, targetSpace: any) => {
    if (gameState === "CAMPAIGN" && !hasPlayedTileThisTurn) {
      const calculated = calculateMovesCore(piecesAtTurnStart, pieces, players[currentPlayerIndex]?.id, playerCount, areSeatsAdjacent);
      if (!validateMovesForTilePlay(calculated).isValid || !isLegalMoveSet(calculated)) {
        showAlert("Invalid Moves", "Please check your moves before playing your tile.", "error");
        return false;
      }
    }
    return true;
  }, [gameState, hasPlayedTileThisTurn, piecesAtTurnStart, pieces, players, currentPlayerIndex, playerCount, showAlert]);

  const wrappers = useAppWrappers({ isMultiplayer, multiplayerActions, pieceMovementHandlers, bureaucracyHandlers, handlePlaceTile: tilePlayHandlers.handlePlaceTile, handleEndTurn, handleReceiverAcceptanceDecision: challengeFlowHandlers.handleReceiverAcceptanceDecision, handleResetPiecesCorrection: pieceMovementHandlers.handleResetPiecesCorrection, handleResetTurn: pieceMovementHandlers.handleResetTurn, handleChallengerDecision: challengeFlowHandlers.handleChallengerDecision, handleContinueAfterChallengeReveal: challengeFlowHandlers.handleContinueAfterChallengeReveal, handleBonusMoveComplete: challengeFlowHandlers.handleBonusMoveComplete, handleCorrectionComplete: challengeFlowHandlers.handleCorrectionComplete, showAlert, validatePlayTile: handlePlaceTileWithValidation, bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, playerCount, setShowFinishTurnConfirm } as any);

  // ─── Draft pick wrapper: dispatch via multiplayerActions in MP mode ─────────
  const draftPickPendingRef = React.useRef(false);
  const wrappedSelectTile = React.useCallback(async (tile: any) => {
    if (isMultiplayer && multiplayerActions) {
      if (draftPickPendingRef.current) return;
      draftPickPendingRef.current = true;
      try {
        await multiplayerActions.selectDraftTile(tile.id);
      } catch (error) {
        console.error('[MULTIPLAYER] Tile selection failed:', error);
      }
      setTimeout(() => { draftPickPendingRef.current = false; }, 500);
    } else {
      gameFlowHandlers.handleSelectTile(tile);
    }
  }, [isMultiplayer, multiplayerActions, gameFlowHandlers]);

  // ─── Auto-start multiplayer game (host only, lobby already picked count) ────
  const hasAutoStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (isMultiplayer && isHost && !hasAutoStartedRef.current && multiplayerPlayerCount && multiplayerPlayerCount > 0 && players.length === 0) {
      hasAutoStartedRef.current = true;
      console.log('[APP] Auto-starting multiplayer game with', multiplayerPlayerCount, 'players', multiplayerSkipDraft ? '(skip draft)' : '');
      gameFlowHandlers.handleStartGame(multiplayerPlayerCount, false, multiplayerSkipDraft, false);
    }
  }, [isMultiplayer, isHost, multiplayerPlayerCount, players.length, gameFlowHandlers, multiplayerSkipDraft]);

  useMultiplayerHost({ isHost, setActionDispatch, players, playerCount, currentPlayerIndex, draftRound, gameState, setGameState, setPieces, setPiecesAtTurnStart, setCurrentPlayerIndex, setHasPlayedTileThisTurn, setPlayers, setDraftRound, handlePlaceTile: tilePlayHandlers.handlePlaceTile, handlePieceMove: pieceMovementHandlers.handlePieceMove, handleBureaucracyPieceMove: bureaucracyHandlers.handleBureaucracyPieceMove, handleSelectBureaucracyMenuItem: bureaucracyHandlers.handleSelectBureaucracyMenuItem, handleResetPiecesCorrection: pieceMovementHandlers.handleResetPiecesCorrection, handleResetTurn: pieceMovementHandlers.handleResetTurn, handleEndTurn, handleReceiverAcceptanceDecision: challengeFlowHandlers.handleReceiverAcceptanceDecision, handleChallengerDecision: challengeFlowHandlers.handleChallengerDecision, handleContinueAfterChallengeReveal: challengeFlowHandlers.handleContinueAfterChallengeReveal, handleBonusMoveComplete: challengeFlowHandlers.handleBonusMoveComplete, handleCorrectionComplete: challengeFlowHandlers.handleCorrectionComplete, setSelectedTilesForAdvantage, handleTakeAdvantageDecline: challengeFlowHandlers.handleTakeAdvantageDecline, handleFinishBureaucracyTurn: bureaucracyHandlers.handleFinishBureaucracyTurn, completeBureaucracyTurn: bureaucracyHandlers.completeBureaucracyTurn, handleDoneWithBureaucracyAction: bureaucracyHandlers.handleDoneWithBureaucracyAction, handleResetBureaucracyAction: bureaucracyHandlers.handleResetBureaucracyAction, setTakeAdvantagePurchase, setCurrentBureaucracyPurchase } as any);

  // ─── Derived values ─────────────────────────────────────────────────────────

  // ─── Per-viewer campaignRole (multiplayer) ──────────────────────────────────
  // In single-player, fall back to the global PhaseProvider value (legacy behavior).
  // In multiplayer, compute from the viewer's playerIndex so each client sees its
  // own role (mover / receiver / challenger / waiting / bonusMover / etc.).
  const viewerCampaignRole = React.useMemo<string | null>(() => {
    if (!isMultiplayer || playerIndex === undefined) return campaignRole;
    const myIdx = playerIndex;
    if (gameState === 'CAMPAIGN' || gameState === 'SELECTING_TILE' || gameState === 'TILE_PLAYED') {
      return myIdx === currentPlayerIndex ? 'mover' : 'waiting';
    }
    if (gameState === 'PENDING_ACCEPTANCE') {
      const receiverPlayerId = (tileTransaction as any)?.receiverId ?? (playedTile as any)?.receivingPlayerId ?? null;
      const receiverIdx = receiverPlayerId != null ? players.findIndex(p => p.id === receiverPlayerId) : -1;
      const moverPlayerId = (playedTile as any)?.playerId ?? (tileTransaction as any)?.placerId ?? null;
      const moverIdx = moverPlayerId != null ? players.findIndex(p => p.id === moverPlayerId) : currentPlayerIndex;
      if (myIdx === receiverIdx) return 'receiver';
      if (myIdx === moverIdx) return 'mover';
      return 'waiting';
    }
    if (gameState === 'PENDING_CHALLENGE') {
      const currentChallengerId = challengeOrder[currentChallengerIndex];
      const moverPlayerId = (playedTile as any)?.playerId ?? (tileTransaction as any)?.placerId ?? null;
      const moverIdx = moverPlayerId != null ? players.findIndex(p => p.id === moverPlayerId) : currentPlayerIndex;
      if (currentChallengerId !== undefined && myIdx + 1 === currentChallengerId) return 'challenger';
      if (myIdx === moverIdx) return 'mover';
      return 'waiting';
    }
    if (gameState === 'TAKE_ADVANTAGE') {
      return myIdx + 1 === takeAdvantageChallengerId ? 'takeAdvantageChallenger' : 'waiting';
    }
    if (gameState === 'BONUS_MOVE') {
      return myIdx + 1 === bonusMovePlayerId ? 'bonusMover' : 'waiting';
    }
    if (gameState === 'CORRECTION_REQUIRED') {
      return myIdx === currentPlayerIndex ? 'correcting' : 'waiting';
    }
    return campaignRole;
  }, [isMultiplayer, playerIndex, gameState, currentPlayerIndex, tileTransaction, playedTile, players, challengeOrder, currentChallengerIndex, takeAdvantageChallengerId, bonusMovePlayerId, campaignRole]);

  const viewingPlayerId = isMultiplayer && playerIndex !== undefined
    ? playerIndex + 1
    : (players[currentPlayerIndex]?.id || 1);

  // ─── HandlersContext payloads ───────────────────────────────────────────────

  const commonValue = {
    isMultiplayer,
    isHost,
    playerIndex,
    playerNames,
    playerCount,
    isTestMode,
    viewingPlayerId,
  };

  const draftingValue = {
    onSelectTile: wrappedSelectTile,
    playerIndex,
    isMultiplayer,
    playerNames,
  };

  const campaignValue = {
    campaignRole: viewerCampaignRole,
    playerCount,
    currentPlayerId: viewingPlayerId,
    playerIndex,
    isMultiplayer,
    lastDroppedPosition,
    lastDroppedPieceId,
    isTestMode,
    dummyTile,
    setDummyTile,
    boardRotationEnabled,
    setBoardRotationEnabled,
    showGridOverlay,
    setShowGridOverlay,
    matchingTileIds,
    gameLog,
    onNewGame: gameFlowHandlers.handleNewGame,
    onPieceMove: wrappers.wrappedPieceMove,
    onBoardTileMove: pieceMovementHandlers.handleBoardTileMove,
    onEndTurn: wrappers.wrappedEndTurn,
    onPlaceTile: wrappers.wrappedPlaceTile,
    onRevealTile: tilePlayHandlers.handleRevealTile,
    onReceiverDecision: challengeFlowHandlers.handleReceiverAcceptanceDecision,
    onBystanderDecision: (challengeFlowHandlers as any).handleBystanderDecision,
    onTogglePrivateView: (challengeFlowHandlers as any).handleTogglePrivateView,
    onContinueAfterChallenge: playedTile
      ? wrappers.wrappedContinueAfterChallengeReveal
      : (challengeFlowHandlers as any).handleContinueAfterChallenge,
    challengeRevealCanContinue:
      !isMultiplayer ||
      (playedTile != null && challengeOrder[currentChallengerIndex] === (playerIndex! + 1)),
    onPlacerViewTile: (challengeFlowHandlers as any).handlePlacerViewTile,
    onSetGiveReceiverViewingTileId: setGiveReceiverViewingTileId,
    onReceiverRewardChoice: (wrappers as any).handleReceiverRewardChoiceLocal,
    receiverAcceptance,
    onReceiverAcceptanceDecision: wrappers.wrappedReceiverDecision,
    onChallengerDecision: wrappers.wrappedChallengerDecision,
    onCorrectionComplete: wrappers.wrappedCorrectionComplete,
    showMoveCheckResult,
    moveCheckResult,
    onCloseMoveCheckResult: () => setShowMoveCheckResult(false),
    onCheckMove: challengeFlowHandlers.handleCheckMove,
    credibilityRotationAdjustments,
    setCredibilityRotationAdjustments,
    isGameLogExpanded,
    setIsGameLogExpanded,
    isCredibilityAdjusterExpanded,
    setIsCredibilityAdjusterExpanded,
    isCredibilityRulesExpanded,
    setIsCredibilityRulesExpanded,
    isPieceTrackerExpanded,
    setIsPieceTrackerExpanded,
    showPerfectTileModal,
    setShowPerfectTileModal,
    showBonusMoveModal,
    bonusMovePlayerId,
    onBonusMoveComplete: wrappers.wrappedBonusMoveComplete,
    onResetTurn: wrappers.wrappedResetTurn,
    onResetPiecesCorrection: wrappers.wrappedResetPiecesCorrection,
    onResetBonusMove: pieceMovementHandlers.handleResetBonusMove,
    showTakeAdvantageModal,
    takeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    showTakeAdvantageTileSelection,
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    showTakeAdvantageMenu,
    takeAdvantagePurchase,
    takeAdvantageValidationError,
    challengeResultMessagePlayerId,
    onTakeAdvantageDecline: () => {
      if (isMultiplayer && multiplayerActions) {
        multiplayerActions.declineAdvantage().catch((err: any) => {
          console.error("[MULTIPLAYER] declineAdvantage failed:", err);
        });
      } else {
        challengeFlowHandlers.handleTakeAdvantageDecline();
      }
    },
    onTakeAdvantageYes: challengeFlowHandlers.handleTakeAdvantageYes,
    onRecoverCredibility: challengeFlowHandlers.handleRecoverCredibility,
    onPurchaseMove: challengeFlowHandlers.handlePurchaseMove,
    onToggleTileSelection: challengeFlowHandlers.handleToggleTileSelection,
    onConfirmTileSelection: challengeFlowHandlers.handleConfirmTileSelection,
    onCancelTileSelection: challengeFlowHandlers.handleCancelTileSelection,
    onSelectTakeAdvantageAction: challengeFlowHandlers.handleSelectTakeAdvantageAction,
    onResetTakeAdvantageAction: challengeFlowHandlers.handleResetTakeAdvantageAction,
    onDoneTakeAdvantageAction: challengeFlowHandlers.handleDoneTakeAdvantageAction,
    onTakeAdvantagePiecePromote: challengeFlowHandlers.handleTakeAdvantagePiecePromote,
  };

  const bureaucracyValue = {
    currentPurchase: currentBureaucracyPurchase,
    showPurchaseMenu: showBureaucracyMenu,
    validationError: bureaucracyValidationError,
    boardRotationEnabled,
    setBoardRotationEnabled,
    onSelectMenuItem: (wrappers as any).wrappedBureaucracySelectMenuItem,
    onDoneWithAction: (wrappers as any).wrappedBureaucracyDoneWithAction,
    onFinishTurn: (wrappers as any).wrappedBureaucracyFinishTurn,
    onPieceMove: (wrappers as any).wrappedBureaucracyPieceMove,
    onPiecePromote: (wrappers as any).wrappedBureaucracyPiecePromote,
    onClearValidationError: () => setBureaucracyValidationError(null),
    onResetAction: (wrappers as any).wrappedBureaucracyResetAction,
    onCheckMove: bureaucracyHandlers.handleCheckBureaucracyMove,
    showMoveCheckResult: showBureaucracyMoveCheckResult,
    moveCheckResult: bureaucracyMoveCheckResult,
    onCloseMoveCheckResult: bureaucracyHandlers.handleCloseBureaucracyMoveCheckResult,
    isTestMode,
    credibilityRotationAdjustments,
  };

  return (
    <div className="App">
      <HandlersProvider
        common={commonValue}
        drafting={draftingValue}
        campaign={campaignValue}
        bureaucracy={bureaucracyValue}
      >
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <ScreenRouter />
        </ErrorBoundary>
        <ModalContainer
          alertModal={alertModal}
          closeAlert={closeAlert}
          showPerfectTileModal={showPerfectTileModal}
          handlePerfectTileContinue={(challengeFlowHandlers as any).handlePerfectTileContinue}
          challengeResultMessage={challengeResultMessage}
          challengeResultMessagePlayerId={challengeResultMessagePlayerId}
          viewingPlayerId={viewingPlayerId}
          clearChallengeResult={clearChallengeResult}
          showFinishTurnConfirm={showFinishTurnConfirm}
          handleCancelFinishTurn={bureaucracyHandlers.handleCancelFinishTurn}
          handleConfirmFinishTurn={wrappers.wrappedBureaucracyConfirmFinishTurn}
          showBureaucracyTransition={showBureaucracyTransition}
          isMultiplayer={isMultiplayer}
          playerIndex={playerIndex}
          playedTile={playedTile}
          tileTransaction={tileTransaction}
        />
      </HandlersProvider>
    </div>
  );
};

export default App;
