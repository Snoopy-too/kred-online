import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// App.tsx - Main Application Component
// ============================================================================
//
// ARCHITECTURE OVERVIEW:
// ----------------------
// This file serves as the main orchestrator for the KRED game. It has been
// progressively refactored to extract logic into specialized modules:
//
// EXTRACTED MODULES:
// - src/handlers/      - Handler factories (gameFlow, pieceMovement, tilePlay, etc.)
// - src/hooks/         - Custom React hooks for state management
// - src/game/          - Pure game logic functions
// - src/components/    - React UI components
// - src/config/        - Static configuration data
// - src/types/         - TypeScript type definitions
// - src/rules/         - Game rules and validation
// - src/utils/         - General utility functions
//
// HANDLER PATTERN:
// Handlers are created via factory functions that receive dependencies:
//   const handlers = createGameFlowHandlers({ players, pieces, ... });
// This allows for testability and clear dependency documentation.
//
// STATE HOOK PATTERN:
// State is managed through custom hooks (useGameState, useBureaucracy, etc.)
// that encapsulate related state variables and their setters.
//
// HANDLER HOOK PATTERN (NEW):
// Complex handlers are being extracted to hooks like useTakeAdvantageHandlers
// that use useCallback for memoization and clearly define dependencies.
//
// REMAINING IN App.tsx:
// - Hook initialization and composition
// - Handler wiring (connecting handlers to state)
// - Some complex handlers awaiting extraction (bureaucracy, correction)
// - Main render logic (renderGameState)
//
// See PHASE_9_PLAN.md for future refactoring roadmap.
// ============================================================================

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
export interface MultiplayerProps {
  isMultiplayer?: boolean;
  isHost?: boolean;
  playerIndex?: number;
  playerCount?: number;
  playerNames?: string[];

  multiplayerActions?: {
    createGame: (playerName: string, playerCount: number) => Promise<any>;
    joinGame: (roomId: string, playerName: string) => Promise<any>;
    startGame: () => Promise<void>;
    selectDraftTile: (tileId: string) => Promise<void>;
    playTile: (tileId: string, targetPlayerId: number) => Promise<void>;
    movePiece: (pieceId: string, position: { x: number; y: number }, location: string) => Promise<void>;
    endTurn: () => Promise<void>;
    acceptTile: () => Promise<void>;
    rejectTile: () => Promise<void>;
    viewTilePrivate: () => Promise<void>;
    initiateChallenge: () => Promise<void>;
    passChallenge: () => Promise<void>;
    selectAdvantageTiles: (tileIds: string[]) => Promise<void>;
    purchaseAdvantage: (purchase: any) => Promise<void>;
    receiverRewardChoice: (choice: 'credibility' | 'advance') => Promise<void>;
    purchaseBureaucracy: (purchase: any) => Promise<void>;
    joinAsSpectator: (roomId: string, name: string) => Promise<void>;
  };

  // Refs for GameStateSynchronizer to wire into
  getStatePacketRef?: React.MutableRefObject<() => any>;
  applyStatePacketRef?: React.MutableRefObject<(packet: any) => void>;

  // Host: register a dispatch function that processes guest actions
  setActionDispatch?: (dispatch: (action: { type: string; playerId: string; payload: any }) => void) => void;
}

import type {
  Tile,
  Player,
  GameState,
  Piece,
  BoardTile,
  TileReceivingSpace,
  BankSpace,
  TrackedMove,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
  BureaucracyMoveType,
  PlayedTileState,
} from "./types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  PLAYER_OPTIONS,
  BOARD_IMAGE_URLS,
  PIECE_COUNTS_BY_PLAYER_COUNT,
  PIECE_TYPES,
  TILE_SPACES_BY_PLAYER_COUNT,
  BANK_SPACES_BY_PLAYER_COUNT,
  TILE_KREDCOIN_VALUES,
  CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT,
  PLAYER_PERSPECTIVE_ROTATIONS,
  DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT,
} from "./config";

// ============================================================================
// UTILITY IMPORTS - Helper functions

// Import ALERTS from constants
import { ALERTS, TIMEOUTS, DEFAULTS, GAME_LOGS } from "./config";
// ============================================================================
import {
  calculatePieceRotation,
  isPositionInCommunityCircle,
} from "./utils/positioning";

import { formatLocationId } from "./utils/formatting";

// ============================================================================
// GAME LOGIC IMPORTS - Core game logic functions
// ============================================================================
import { calculateMoves as calculateMovesCore } from "./game";

// ============================================================================
// GAME LOGIC IMPORTS - Functions still in game.ts (to be extracted)
// ============================================================================
import {
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
  findNearestVacantLocation,
  getLocationIdFromPosition,
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  createGameStateSnapshot,
  getChallengeOrder,
  getTileRequirements,
  validateSingleMove,
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
  validatePurchasedMove,
  determineMoveType,
} from "./game";

// Movement and credibility validation from rules module
import { 
  validateMoveType, 
  validatePieceMovement,
  handleCredibilityLoss,
  areSeatsAdjacent,
  checkBureaucracyWinCondition
} from "./rules";

// ============================================================================
// HOOKS IMPORTS - Custom React hooks
// ============================================================================
import { useAlerts } from "./hooks/useAlerts";
import { useBoardDisplay } from "./hooks/useBoardDisplay";
import { useTestMode } from "./hooks/useTestMode";
import { useBonusMoves } from "./hooks/useBonusMoves";
import { useMoveTracking } from "./hooks/useMoveTracking";
import { useTilePlayWorkflow } from "./hooks/useTilePlayWorkflow";
import { useChallengeFlow } from "./hooks/useChallengeFlow";
import { useBureaucracy } from "./hooks/useBureaucracy";
import { useGameState } from "./hooks/useGameState";

// ============================================================================
// HANDLERS IMPORTS - Extracted handler factories
// ============================================================================
import {
  createGameFlowHandlers,
  createPieceMovementHandlers,
  createTurnHandlers,
  createTilePlayHandlers,
  createChallengeFlowHandlers,
} from "./handlers";

// ============================================================================
// COMPONENT IMPORTS - Extracted React components
// ============================================================================
import ErrorDisplay from "./components/shared/ErrorDisplay";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import {
  AlertModal,
  PerfectTileModal,
  ChallengeResultMessage,
  FinishTurnConfirmModal,
  BureaucracyTransition,
} from "./components/shared/Modals";
import PlayerSelectionScreen from "./components/screens/PlayerSelectionScreen";
import DraftingScreen from "./components/screens/DraftingScreen";
import CampaignScreen from "./components/screens/CampaignScreen";
import BureaucracyScreen from "./components/screens/BureaucracyScreen";
import {
  getPlayerName,
  getPlayerNameSimple,
  getPlayerById,
  getPieceById,
  formatWinnerNames,
  isPlayerDomain,
  isCommunityLocation,
} from "./utils";

/**
 * App Component - Main Application Entry Point
 *
 * GAME STATE FLOW:
 * ================
 *
 * 1. PLAYER_SELECTION
 *    ↓ (select player count, test mode, skip options)
 *
 * 2. DRAFTING (optional, can be skipped)
 *    ↓ (players draft tiles in snake order)
 *
 * 3. CAMPAIGN
 *    ↓ (player plays tile and makes moves)
 *
 * 4. TILE_PLAYED
 *    ↓ (player ends turn after playing tile)
 *
 * 5. PENDING_ACCEPTANCE
 *    ↓ (receiver decides: accept or reject)
 *
 * 6a. If REJECTED → back to CAMPAIGN (tile player's turn)
 *
 * 6b. If ACCEPTED → PENDING_CHALLENGE
 *     ↓ (other players can challenge in order)
 *
 * 7a. If CHALLENGE FAILS → back to CAMPAIGN (challenger corrects)
 *
 * 7b. If CHALLENGE SUCCEEDS → CORRECTION_REQUIRED
 *     ↓ (tile player must correct moves)
 *     ↓ (Take Advantage feature may trigger for challenger)
 *
 * 8. Back to CAMPAIGN
 *    ↓ (receiver's turn begins)
 *    ↓ (WIN CHECK happens here during Campaign phase)
 *
 * 9. When all tiles played → BUREAUCRACY
 *    ↓ (players spend kredcoin on moves/promotions)
 *    ↓ (WIN CHECK happens after all players finish)
 *
 * 10. If no winner → back to CAMPAIGN (new round)
 *     If winner → GAME OVER (alert shown)
 *
 * COMPONENT STRUCTURE:
 * ====================
 * - State managed via custom hooks (useGameState, useBureaucracy, etc.)
 * - Handlers created via factory functions (createGameFlowHandlers, etc.)
 * - UI delegated to screen components (CampaignScreen, BureaucracyScreen, etc.)
 * - Modals rendered at top level for proper z-index stacking
 */
const App: React.FC<MultiplayerProps> = ({
  isMultiplayer = false,
  isHost = false,
  playerIndex,
  playerCount: multiplayerPlayerCount,
  playerNames,
  multiplayerActions,
  getStatePacketRef,
  applyStatePacketRef,
  setActionDispatch,
}) => {
  
  // ============================================================================
  // CUSTOM HOOKS - State management extracted to dedicated hooks
  // See src/hooks/ for implementations
  // ============================================================================

  // Core game state (useGameState hook)
  const {
    gameState,
    players,
    pieces,
    boardTiles,
    bankedTiles,
    playerCount,
    currentPlayerIndex,
    draftRound,
    isTestMode,
    setGameState,
    setPlayers,
    setPieces,
    setBoardTiles,
    setBankedTiles,
    setPlayerCount,
    setCurrentPlayerIndex,
    setDraftRound,
    setIsTestMode,
  } = useGameState();

  const {
    alertModal,
    challengeResultMessage,
    tilePlayerMustWithdraw,
    placerViewingTileId,
    giveReceiverViewingTileId,
    showAlert,
    closeAlert,
    setAlertModal,
    setChallengeResultMessage,
    setTilePlayerMustWithdraw,
    setPlacerViewingTileId,
    setGiveReceiverViewingTileId,
  } = useAlerts();

  const {
    boardRotationEnabled,
    showGridOverlay,
    dummyTile,
    setBoardRotationEnabled,
    setShowGridOverlay,
    setDummyTile,
  } = useBoardDisplay();

  const {
    gameLog,
    isGameLogExpanded,
    isCredibilityAdjusterExpanded,
    isCredibilityRulesExpanded,
    isPieceTrackerExpanded,
    credibilityRotationAdjustments,
    addGameLog,
    setGameLog,
    setIsGameLogExpanded,
    setIsCredibilityAdjusterExpanded,
    setIsCredibilityRulesExpanded,
    setIsPieceTrackerExpanded,
    setCredibilityRotationAdjustments,
  } = useTestMode();

  const {
    showBonusMoveModal,
    bonusMovePlayerId,
    bonusMoveWasCompleted,
    showPerfectTileModal,
    setShowBonusMoveModal,
    setBonusMovePlayerId,
    setBonusMoveWasCompleted,
    setShowPerfectTileModal,
  } = useBonusMoves();

  const {
    piecesAtTurnStart,
    piecesBeforeBonusMove,
    piecesAtCorrectionStart,
    movedPiecesThisTurn,
    lastDroppedPosition,
    lastDroppedPieceId,
    showMoveCheckResult,
    moveCheckResult,
    setPiecesAtTurnStart,
    setPiecesBeforeBonusMove,
    setPiecesAtCorrectionStart,
    setMovedPiecesThisTurn,
    setLastDroppedPosition,
    setLastDroppedPieceId,
    setShowMoveCheckResult,
    setMoveCheckResult,
  } = useMoveTracking();

  const {
    playedTile,
    movesThisTurn,
    hasPlayedTileThisTurn,
    revealedTileId,
    tileTransaction,
    receiverAcceptance,
    challengeOrder,
    currentChallengerIndex,
    tileRejected,
    setPlayedTile,
    setMovesThisTurn,
    setHasPlayedTileThisTurn,
    setRevealedTileId,
    setTileTransaction,
    setReceiverAcceptance,
    setChallengeOrder,
    setCurrentChallengerIndex,
    setTileRejected,
  } = useTilePlayWorkflow();

  const {
    bystanders,
    bystanderIndex,
    isPrivatelyViewing,
    showChallengeRevealModal,
    challengedTile,
    showTakeAdvantageModal,
    takeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    showTakeAdvantageTileSelection,
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    showTakeAdvantageMenu,
    takeAdvantagePurchase,
    takeAdvantagePiecesSnapshot,
    takeAdvantageValidationError,
    setBystanders,
    setBystanderIndex,
    setIsPrivatelyViewing,
    setShowChallengeRevealModal,
    setChallengedTile,
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
  } = useChallengeFlow();

  // Bureaucracy Phase State (from useBureaucracy hook)
  const {
    bureaucracyStates,
    bureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    currentBureaucracyPurchase,
    showBureaucracyMenu,
    bureaucracyValidationError,
    bureaucracyMoves,
    bureaucracySnapshot,
    showBureaucracyMoveCheckResult,
    bureaucracyMoveCheckResult,
    pendingCommunityPieces,
    showBureaucracyTransition,
    setBureaucracyStates,
    setBureaucracyTurnOrder,
    setCurrentBureaucracyPlayerIndex,
    setCurrentBureaucracyPurchase,
    setShowBureaucracyMenu,
    setBureaucracyValidationError,
    setBureaucracyMoves,
    setBureaucracySnapshot,
    setShowBureaucracyMoveCheckResult,
    setBureaucracyMoveCheckResult,
    setPendingCommunityPieces,
    setShowBureaucracyTransition,
  } = useBureaucracy();

  // State for finish turn confirmation
  const [showFinishTurnConfirm, setShowFinishTurnConfirm] = useState<{
    isOpen: boolean;
    remainingKredcoin: number;
  }>({
    isOpen: false,
    remainingKredcoin: 0,
  });

  // ============================================================================
  // MULTIPLAYER STATE
  // ============================================================================
  const [campaignRole, setCampaignRole] = useState<string | null>(null);
  const [tileRevealed, setTileRevealed] = useState<boolean>(false);
  const [pendingReceiverReward, setPendingReceiverReward] = useState<boolean>(false);
  const [receiverAdvanceInProgress, setReceiverAdvanceInProgress] = useState<boolean>(false);
  const [moverPlayerIndex, setMoverPlayerIndex] = useState<number | null>(null);

  // Wire up GameStateSynchronizer refs for host state push
  useEffect(() => {
    if (!getStatePacketRef || !applyStatePacketRef) return;

    getStatePacketRef.current = () => ({
      gameState,
      players,
      pieces,
      boardTiles,
      bankedTiles,
      currentPlayerIndex,
      playerCount,
      playedTile,
      hasPlayedTileThisTurn,
      movedPiecesThisTurn: Array.from(movedPiecesThisTurn),
      tileTransaction,
      moverPlayerIndex,
      campaignRole,
      tileRevealed,
      pendingReceiverReward,
      receiverAdvanceInProgress,
      bystanders,
      bystanderIndex,
      challengeOrder,
      currentChallengerIndex,
      tileRejected,
      showTakeAdvantageModal,
      takeAdvantageChallengerId,
      takeAdvantageChallengerCredibility,
      bureaucracyStates,
      bureaucracyTurnOrder,
      currentBureaucracyPlayerIndex,
      stateVersion: 0,
      lastUpdated: Date.now(),
    });

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
      setMovedPiecesThisTurn(new Set(packet.movedPiecesThisTurn));
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
      setShowTakeAdvantageModal(packet.showTakeAdvantageModal);
      setTakeAdvantageChallengerId(packet.takeAdvantageChallengerId);
      setTakeAdvantageChallengerCredibility(packet.takeAdvantageChallengerCredibility);
      setBureaucracyStates(packet.bureaucracyStates);
      setBureaucracyTurnOrder(packet.bureaucracyTurnOrder);
      setCurrentBureaucracyPlayerIndex(packet.currentBureaucracyPlayerIndex);
    };
  });

  // Trigger state push whenever game state changes (host only)
  useEffect(() => {
    if (!isHost || !isMultiplayer) return;
    const push = (window as any).__kred_pushState;
    if (push) push();
  }, [
    isHost, isMultiplayer, gameState, players, pieces, boardTiles, bankedTiles,
    currentPlayerIndex, playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn,
    tileTransaction, moverPlayerIndex, campaignRole, tileRevealed,
    pendingReceiverReward, receiverAdvanceInProgress, bystanders, bystanderIndex,
    challengeOrder, currentChallengerIndex, tileRejected, showTakeAdvantageModal,
    takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex,
  ]);

  // Initialize campaign pieces when phase transitions to CAMPAIGN in multiplayer
  React.useEffect(() => {
    if (isMultiplayer && gameState === 'CAMPAIGN' && pieces.length === 0 && players.length > 0) {
      const campaignPieces = initializeCampaignPieces(players.length);
      setPieces(campaignPieces);
      setPiecesAtTurnStart(campaignPieces);
    }
  }, [isMultiplayer, gameState, pieces.length, players.length, setPieces, setPiecesAtTurnStart]);

  // ============================================================================
  // HANDLER FACTORIES - Created via factory pattern for testability
  // See src/handlers/ for implementations
  // ============================================================================
  const gameFlowHandlers = React.useMemo(
    () =>
      createGameFlowHandlers({
        // Current state values
        playerCount,
        players,
        currentPlayerIndex,
        draftRound,

        // State setters from useGameState
        setPlayerCount,
        setIsTestMode,
        setPlayers,
        setPieces,
        setCurrentPlayerIndex,
        setDraftRound,
        setGameState,
        setGameLog,

        // State setters from useMoveTracking
        setPiecesAtTurnStart,
        setMovedPiecesThisTurn,
        setPendingCommunityPieces,

        // State setters from useBoardDisplay
        setBoardTiles,
        setBankedTiles,
        setLastDroppedPosition,
        setRevealedTileId,

        // State setters from useTilePlayWorkflow
        setHasPlayedTileThisTurn,
        setPlayedTile,
        setMovesThisTurn,
        setTileTransaction,
        setReceiverAcceptance,

        // State setters from useChallengeFlow
        setChallengedTile,
        setPlacerViewingTileId,
        setBystanders,
        setBystanderIndex,
        setIsPrivatelyViewing,
        setShowChallengeRevealModal,
        setChallengeOrder,
        setCurrentChallengerIndex,
        setTileRejected,
        setShowMoveCheckResult,
        setMoveCheckResult,
        setGiveReceiverViewingTileId,
        setTilePlayerMustWithdraw,

        // State setters from useBureaucracy
        setBureaucracyTurnOrder,
        setBureaucracyStates,
        setCurrentBureaucracyPlayerIndex,
        setShowBureaucracyMenu,

        // Initialization functions
        initializePlayers,
        initializeCampaignPieces,
        getBureaucracyTurnOrder,
        calculatePlayerKredcoin,

        // Configuration
        BANK_SPACES_BY_PLAYER_COUNT,
      }),
    [
      playerCount,
      players,
      currentPlayerIndex,
      draftRound,
      setPlayerCount,
      setIsTestMode,
      setPlayers,
      setPieces,
      setCurrentPlayerIndex,
      setDraftRound,
      setGameState,
      setGameLog,
      setPiecesAtTurnStart,
      setMovedPiecesThisTurn,
      setPendingCommunityPieces,
      setBoardTiles,
      setBankedTiles,
      setLastDroppedPosition,
      setRevealedTileId,
      setHasPlayedTileThisTurn,
      setPlayedTile,
      setMovesThisTurn,
      setTileTransaction,
      setReceiverAcceptance,
      setChallengedTile,
      setPlacerViewingTileId,
      setBystanders,
      setBystanderIndex,
      setIsPrivatelyViewing,
      setShowChallengeRevealModal,
      setChallengeOrder,
      setCurrentChallengerIndex,
      setTileRejected,
      setShowMoveCheckResult,
      setMoveCheckResult,
      setGiveReceiverViewingTileId,
      setTilePlayerMustWithdraw,
      setBureaucracyTurnOrder,
      setBureaucracyStates,
      setCurrentBureaucracyPlayerIndex,
      setShowBureaucracyMenu,
    ]
  );

  // Destructure handlers for convenience
  const { handleStartGame, handleNewGame, handleSelectTile: originalHandleSelectTile } = gameFlowHandlers;

  // Auto-start game in multiplayer mode (lobby already handled player selection)
  const hasAutoStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (isMultiplayer && !hasAutoStartedRef.current && multiplayerPlayerCount && multiplayerPlayerCount > 0 && players.length === 0) {
      hasAutoStartedRef.current = true;
      console.log('[APP] Auto-starting multiplayer game with', multiplayerPlayerCount, 'players');
      handleStartGame(multiplayerPlayerCount, false, false, false);
    }
  }, [isMultiplayer, multiplayerPlayerCount, players.length, handleStartGame]);


  // Wrap tile selection for multiplayer coordination
  const draftPickPendingRef = React.useRef(false);
  const handleSelectTile = React.useCallback(async (tile: any) => {
    if (isMultiplayer && multiplayerActions) {
      // Prevent rapid double-clicks before state syncs back
      if (draftPickPendingRef.current) return;
      draftPickPendingRef.current = true;
      try {
        await multiplayerActions.selectDraftTile(tile.id);
      } catch (error) {
        console.error('[MULTIPLAYER] Tile selection failed:', error);
      }
      // Reset after a short delay to allow state sync
      setTimeout(() => { draftPickPendingRef.current = false; }, 500);
    } else {
      // Single-player mode - use local handler
      originalHandleSelectTile(tile);
    }
  }, [isMultiplayer, multiplayerActions, originalHandleSelectTile]);

  // ============================================================================
  // PIECE MOVEMENT HANDLERS
  // ============================================================================
  const pieceMovementHandlers = React.useMemo(
    () =>
      createPieceMovementHandlers({
        // Current state values
        pieces,
        players,
        playerCount,
        currentPlayerIndex,
        movedPiecesThisTurn,
        pendingCommunityPieces,
        piecesAtTurnStart,
        piecesAtCorrectionStart,
        piecesBeforeBonusMove,
        playedTile,

        // State setters
        setPieces,
        setPlayers,
        setBoardTiles,
        setGameState,
        setMovedPiecesThisTurn,
        setPendingCommunityPieces,
        setLastDroppedPosition,
        setLastDroppedPieceId,
        setPlayedTile,
        setHasPlayedTileThisTurn,

        // Utility functions
        showAlert,
        calculatePieceRotation,
        validatePieceMovement,
        validateMoveType,
        formatLocationId,

        // Alert messages
        ALERTS,
      }),
    [
      pieces,
      players,
      playerCount,
      currentPlayerIndex,
      movedPiecesThisTurn,
      pendingCommunityPieces,
      piecesAtTurnStart,
      piecesAtCorrectionStart,
      piecesBeforeBonusMove,
      playedTile,
      setPieces,
      setPlayers,
      setBoardTiles,
      setGameState,
      setMovedPiecesThisTurn,
      setPendingCommunityPieces,
      setLastDroppedPosition,
      setLastDroppedPieceId,
      setPlayedTile,
      setHasPlayedTileThisTurn,
      showAlert,
    ]
  );

  // Destructure piece movement handlers
  const {
    handlePieceMove,
    handleResetTurn,
    handleResetPiecesCorrection,
    handleResetBonusMove,
    handleBoardTileMove,
  } = pieceMovementHandlers;

  // ============================================================================
  // TURN HANDLERS
  // ============================================================================
  const turnHandlers = React.useMemo(
    () =>
      createTurnHandlers({
        // Current state values
        players,
        pieces,
        playerCount,
        currentPlayerIndex,

        // State setters
        setCurrentPlayerIndex,
        setGameState,
        setGameLog,
        setPiecesAtTurnStart,
        setHasPlayedTileThisTurn,
        setRevealedTileId,
        setTileTransaction,
        setBystanders,
        setBystanderIndex,
        setIsPrivatelyViewing,
        setChallengedTile,
        setPlacerViewingTileId,
        setMovedPiecesThisTurn,
        setPendingCommunityPieces,

        // Utility functions
        getLocationIdFromPosition,
        formatLocationId,
      }),
    [
      players,
      pieces,
      playerCount,
      currentPlayerIndex,
      setCurrentPlayerIndex,
      setGameState,
      setGameLog,
      setPiecesAtTurnStart,
      setHasPlayedTileThisTurn,
      setRevealedTileId,
      setTileTransaction,
      setBystanders,
      setBystanderIndex,
      setIsPrivatelyViewing,
      setChallengedTile,
      setPlacerViewingTileId,
      setMovedPiecesThisTurn,
      setPendingCommunityPieces,
    ]
  );

  // Destructure turn handlers
  const { generateTurnLog, advanceTurnNormally } = turnHandlers;

  // ============================================================================
  // TILE PLAY HANDLERS
  // ============================================================================
  const tilePlayHandlers = React.useMemo(
    () =>
      createTilePlayHandlers({
        // Current state values
        players,
        playerCount,
        currentPlayerIndex,
        hasPlayedTileThisTurn,
        piecesAtTurnStart,
        boardTiles,
        bankSpacesByPlayerCount: BANK_SPACES_BY_PLAYER_COUNT,

        // State setters
        setPlayers,
        setBoardTiles,
        setPlayedTile,
        setGameState,
        setMovesThisTurn,
        setHasPlayedTileThisTurn,
        setMovedPiecesThisTurn,
        setPendingCommunityPieces,
        setBonusMoveWasCompleted,
        setPiecesAtCorrectionStart,
        setPiecesBeforeBonusMove,
        setRevealedTileId,
        setIsPrivatelyViewing,
        setPlacerViewingTileId,

        // Utility functions
        showAlert,
      }),
    [
      players,
      playerCount,
      currentPlayerIndex,
      hasPlayedTileThisTurn,
      piecesAtTurnStart,
      boardTiles,
      setPlayers,
      setBoardTiles,
      setPlayedTile,
      setGameState,
      setMovesThisTurn,
      setHasPlayedTileThisTurn,
      setMovedPiecesThisTurn,
      setPendingCommunityPieces,
      setBonusMoveWasCompleted,
      setPiecesAtCorrectionStart,
      setPiecesBeforeBonusMove,
      setRevealedTileId,
      setIsPrivatelyViewing,
      setPlacerViewingTileId,
      showAlert,
    ]
  );

  // Destructure tile play handlers
  const {
    handlePlaceTile,
    handleRevealTile,
    handleTogglePrivateView,
    handlePlacerViewTile,
  } = tilePlayHandlers;

  // ============================================================================
  // CHALLENGE FLOW HANDLERS (Legacy bystander/receiver flow)
  // ============================================================================
  const challengeFlowHandlers = React.useMemo(
    () =>
      createChallengeFlowHandlers({
        // Current state values
        players,
        playerCount,
        tileTransaction,
        bystanders,
        bystanderIndex,

        // State setters
        setPlayers,
        setBoardTiles,
        setGameState,
        setChallengedTile,
        setShowChallengeRevealModal,
        setBystanderIndex,
        setCurrentPlayerIndex,
        setBystanders,
        setIsPrivatelyViewing,

        // Helper functions
        advanceTurnNormally,
      }),
    [
      players,
      playerCount,
      tileTransaction,
      bystanders,
      bystanderIndex,
      setPlayers,
      setBoardTiles,
      setGameState,
      setChallengedTile,
      setShowChallengeRevealModal,
      setBystanderIndex,
      setCurrentPlayerIndex,
      setBystanders,
      setIsPrivatelyViewing,
      advanceTurnNormally,
    ]
  );

  // Destructure challenge flow handlers
  const {
    handleBystanderDecision,
    handleContinueAfterChallenge,
    handleReceiverDecision,
    resolveTransaction,
  } = challengeFlowHandlers;

  const addCredibilityLossLog = (
    playerId: number,
    reason: string,
    currentPlayers?: Player[]
  ) => {
    const playersToUse = currentPlayers || players;
    const player = getPlayerById(playersToUse, playerId);
    const playerName = getPlayerName(player, playerId);
    addGameLog(`${playerName} lost 1 credibility: ${reason}`);
  };

  /**
   * Take Advantage Flow
   *
   * Manual reference: "The Challenger may either restore 1 notch on their
   * Credibility token or use funding to perform one Bureaucracy action."
   *
   * This flow implements the "use funding" option. The challenger selects
   * tiles from the dishonest mover's bank, converts them to kredcoin,
   * and performs one Bureaucracy menu action.
   */

  /**
   * Helper: Reset Take Advantage modal state
   * Used after declining, completing, or canceling Take Advantage
   */
  const cleanupTakeAdvantageModalState = () => {
    setShowTakeAdvantageModal(false);
    setTakeAdvantageChallengerId(null);
    setTakeAdvantageChallengerCredibility(0);
  };

  /**
   * Helper: Reset challenge state
   * Used after a tile play is finalized or ended
   */
  const resetChallengeState = () => {
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setReceiverAcceptance(null);
    setTileRejected(false);
  };

  /**
   * Handles credibility gain for a player
   *
   * Credibility Rules:
   * - Default/Starting credibility: 3
   * - Range: 0 (minimum) to 3 (maximum)
   * - Cannot gain above 3 (MAX_CREDIBILITY)
   *
   * @param playerId - Player who gains credibility
   * @param amount - Amount to gain (typically 1 or 2)
   * @param currentPlayers - Optional player array to use instead of state (for chaining updates)
   * @returns Object with newPlayers array and hadMaxCredibility flag
   */
  const handleCredibilityGain = (
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
  };

  const handleBonusMoveComplete = () => {
    if (!playedTile) return;

    // Log the bonus move
    const player = getPlayerById(players, bonusMovePlayerId);
    const playerName = getPlayerName(player, bonusMovePlayerId);
    addGameLog(
      `${playerName} took a bonus Advance move (already had 3 credibility)`
    );

    // Close the modal and mark that bonus move was completed
    setShowBonusMoveModal(false);
    setBonusMovePlayerId(null);
    setBonusMoveWasCompleted(true);

    // Capture the current pieces state as baseline for correction phase (after bonus move)
    setPiecesAtCorrectionStart(pieces.map((p) => ({ ...p })));

    // Now switch back to tile player for correction
    const playerIndex = players.findIndex((p) => p.id === playedTile.playerId);
    if (playerIndex !== -1) {
      setCurrentPlayerIndex(playerIndex);
      setGameState("CORRECTION_REQUIRED");
      setMovesThisTurn([]);
    }
  };

  const handleEndTurn = () => {
    // NEW WORKFLOW: Handle correction of rejected/challenged tile
    if (gameState === "CORRECTION_REQUIRED" && playedTile) {
      // Use handleCorrectionComplete which calculates moves from actual piece positions
      handleCorrectionComplete();
      return;
    }

    // NEW WORKFLOW: If a tile has been played, move to acceptance phase
    if (playedTile && gameState === "TILE_PLAYED") {
      // Calculate moves from piece positions
      const calculatedMoves = calculateMoves(
        playedTile.originalPieces,
        pieces,
        playedTile.playerId
      );

      // Validate moves performed (max 2 moves: 1 O and 1 M)
      const movesValidation = validateMovesForTilePlay(calculatedMoves);
      if (!movesValidation.isValid) {
        showAlert(
          "Invalid Moves",
          movesValidation.error || "Invalid move combination",
          "error"
        );
        return;
      }

      // Store moves and move to acceptance phase
      setPlayedTile((prev) =>
        prev ? { ...prev, movesPerformed: calculatedMoves } : null
      );
      setReceiverAcceptance(null); // Reset for acceptance decision
      setGameState("PENDING_ACCEPTANCE");

      // Switch to receiving player
      const receiverIndex = players.findIndex(
        (p) => p.id === playedTile.receivingPlayerId
      );
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
      }
      return;
    }

    // OLD WORKFLOW: Normal end turn (if not in tile play)
    // Log actions for the turn that just ended.
    const turnEnderId = players[currentPlayerIndex].id;
    const transactionToLog =
      tileTransaction && tileTransaction.placerId === turnEnderId
        ? tileTransaction
        : null;

    const turnLogs = generateTurnLog(
      turnEnderId,
      piecesAtTurnStart,
      pieces,
      playerCount,
      transactionToLog
    );

    if (turnLogs.length > 0) {
      const logHeader = `--- Turn Actions by Player ${turnEnderId} ---`;
      setGameLog((prev) => [...prev, logHeader, ...turnLogs]);
    }

    // Set piece state for the start of the next turn.
    // IMPORTANT: Use deep copy (.map with spread) not reference to avoid mutations affecting baseline
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    if (hasPlayedTileThisTurn && tileTransaction) {
      const receiverIndex = players.findIndex(
        (p) => p.id === tileTransaction.receiverId
      );
      if (receiverIndex !== -1) {
        setGameState("PENDING_ACCEPTANCE");
        setCurrentPlayerIndex(receiverIndex);
        setHasPlayedTileThisTurn(false);
        setRevealedTileId(null);
        setIsPrivatelyViewing(false);
        setPlacerViewingTileId(null);
      } else {
        advanceTurnNormally();
      }
    } else {
      advanceTurnNormally();
    }
  };

  // NEW WORKFLOW HANDLERS

  /**
   * Handle receiving player's acceptance or rejection of the played tile
   */
  const handleReceiverAcceptanceDecision = (accepted: boolean) => {
    if (!playedTile) return;

    if (!accepted) {
      // Check if tile is perfect using same logic as Check Move
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

      // Check for extra moves
      const requiredMoveTypes = tileRequirements.requiredMoves;
      const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
      const extraMoves: string[] = [];
      for (const moveType of performedMoveTypes) {
        if (!requiredMoveTypes.includes(moveType)) {
          extraMoves.push(moveType);
        }
      }
      const uniqueExtraMoves = [...new Set(extraMoves)];

      // Tile is perfect if requirements are met and no extra moves
      const isTilePerfect =
        tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (isTilePerfect) {
        // Cannot reject - show perfect tile modal
        setShowPerfectTileModal(true);
        return;
      }

      // REJECTION: Reverse moves and prompt player to fulfill tile requirements
      setReceiverAcceptance(false);
      setTileRejected(true);

      // Check if tile player has 0 credibility - if so, they MUST perform a WITHDRAW during correction
      const tilePlayer = getPlayerById(players, playedTile.playerId);
      const playerHasZeroCredibility =
        tilePlayer && tilePlayer.credibility === 0;
      const movesMeetRequirements =
        tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (playerHasZeroCredibility && !movesMeetRequirements) {
        setTilePlayerMustWithdraw(true);
      } else {
        setTilePlayerMustWithdraw(false);
      }

      // Restore original pieces (remove any moves made)
      const revertedPieces = playedTile.originalPieces.map((p) => ({ ...p }));
      setPieces(revertedPieces);
      // Capture the reverted pieces as the baseline for correction move calculations
      setPiecesAtCorrectionStart(revertedPieces);
      // Keep the board tile visible in the receiving space (don't restore full board state)
      // The BoardTile will remain showing the white back

      // Clear piece movement tracking - fresh start for correction
      setMovedPiecesThisTurn(new Set());
      setPendingCommunityPieces(new Set());

      // Add tile to receiving player's bureaucracy tiles for tracking
      const receivingPlayer = players.find(
        (p) => p.id === playedTile.receivingPlayerId
      );
      if (receivingPlayer) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === receivingPlayer.id
              ? {
                ...p,
                bureaucracyTiles: [
                  ...p.bureaucracyTiles,
                  {
                    id: parseInt(playedTile.tileId),
                    url: `./images/${playedTile.tileId}.svg`,
                  },
                ],
              }
              : p
          )
        );
      }

      // Tile player loses 1 credibility when tile is rejected by receiver
      setPlayers((prev) =>
        handleCredibilityLoss(
          "tile_rejected_by_receiver",
          playedTile.playerId
        )(prev)
      );
      addCredibilityLossLog(
        playedTile.playerId,
        "Tile was rejected by Player " + playedTile.receivingPlayerId
      );

      // Receiver gains up to 2 credibility for correctly rejecting
      const credibilityResult = handleCredibilityGain(
        playedTile.receivingPlayerId,
        2
      );

      if (credibilityResult.hadMaxCredibility) {
        // Player had 3 credibility, show bonus move modal
        setBonusMovePlayerId(playedTile.receivingPlayerId);
        setShowBonusMoveModal(true);

        // Capture the reverted piece state for bonus move reset
        // Use playedTile.originalPieces because setPieces is async and pieces hasn't updated yet
        setPiecesBeforeBonusMove(revertedPieces);

        // Don't switch to tile player yet - wait for bonus move to complete
      } else {
        // Update players with credibility gain
        setPlayers(credibilityResult.newPlayers);

        // Switch back to tile player for correction
        const playerIndex = players.findIndex(
          (p) => p.id === playedTile.playerId
        );
        if (playerIndex !== -1) {
          setCurrentPlayerIndex(playerIndex);
          setGameState("CORRECTION_REQUIRED");
          setMovesThisTurn([]);
        }
      }
    } else {
      // ACCEPTANCE: Move to challenge phase
      setReceiverAcceptance(true);

      // Determine challenge order (clockwise from tile player, excluding giver and receiver)
      const tilePlayerIndex = players.findIndex(
        (p) => p.id === playedTile.playerId
      );
      const order = getChallengeOrder(
        playedTile.playerId,
        playerCount,
        playedTile.receivingPlayerId
      );
      setChallengeOrder(order);

      // If there are challengers, move to first challenger
      if (order.length > 0) {
        const firstChallengerIndex = players.findIndex(
          (p) => p.id === order[0]
        );
        setCurrentPlayerIndex(firstChallengerIndex);
        setCurrentChallengerIndex(0);
        setGameState("PENDING_CHALLENGE");
      } else {
        // No challengers, finalize the play
        finalizeTilePlay(false, null);
      }
    }
  };

  /**
   * Handle perfect tile modal - proceed to challenge phase
   */
  const handlePerfectTileContinue = () => {
    if (!playedTile) return;

    setShowPerfectTileModal(false);
    setReceiverAcceptance(true);

    // Determine challenge order (clockwise from tile player, excluding giver and receiver)
    const order = getChallengeOrder(
      playedTile.playerId,
      playerCount,
      playedTile.receivingPlayerId
    );
    setChallengeOrder(order);

    // If there are challengers, move to first challenger
    if (order.length > 0) {
      const firstChallengerIndex = players.findIndex((p) => p.id === order[0]);
      setCurrentPlayerIndex(firstChallengerIndex);
      setCurrentChallengerIndex(0);
      setGameState("PENDING_CHALLENGE");
    } else {
      // No challengers, finalize the play
      finalizeTilePlay(false, null);
    }
  };

  // ============================================================================
  // MULTIPLAYER CAMPAIGN ACTION WRAPPERS
  // ============================================================================
  
  // Wrap piece movement for multiplayer
  const wrappedPieceMove = React.useCallback(async (pieceId: string, newPosition: any, locationId: string) => {
    // Call local handler first to update UI optimistically
    const result = pieceMovementHandlers.handlePieceMove(pieceId, newPosition, locationId);
    
    // Then sync to server in multiplayer
    if (isMultiplayer && multiplayerActions && result.success) {
      try {
        await multiplayerActions.movePiece(pieceId, newPosition, locationId);
      } catch (error) {
        console.error('[MULTIPLAYER] Piece movement sync failed:', error);
      }
    }
    
    return result;
  }, [isMultiplayer, multiplayerActions, pieceMovementHandlers]);
  
  // Wrap tile placement for multiplayer
  const wrappedPlaceTile = React.useCallback(async (tileId: number, targetSpace: { ownerId: number; position: any; rotation: number }) => {
    const tileIdStr = tileId.toString();
    const targetPlayerId = targetSpace.ownerId;
    
    if (isMultiplayer && multiplayerActions) {
      console.log('[MULTIPLAYER] Playing tile via server:', tileIdStr, 'to player', targetPlayerId);
      try {
        await multiplayerActions.playTile(tileIdStr, targetPlayerId);
      } catch (error) {
        console.error('[MULTIPLAYER] Tile play failed:', error);
        alert(`Failed to play tile: ${error.message}`);
      }
    } else {
      // Single-player mode
      handlePlaceTile(tileId, targetSpace);
    }
  }, [isMultiplayer, multiplayerActions, handlePlaceTile]);
  
  // Wrap turn ending for multiplayer
  const wrappedEndTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      console.log('[MULTIPLAYER] Ending turn via server');
      try {
        await multiplayerActions.endTurn();
      } catch (error) {
        console.error('[MULTIPLAYER] End turn failed:', error);
        showAlert('Invalid Correction', error.message, 'error');
      }
    } else {
      // Single-player mode
      handleEndTurn();
    }
  }, [isMultiplayer, multiplayerActions, handleEndTurn, gameState, playedTile, pieces, players, playerCount]);
  
  // Wrap receiver decision for multiplayer
  const wrappedReceiverDecision = React.useCallback(async (accepted: boolean) => {
    if (isMultiplayer && multiplayerActions) {
      console.log('[MULTIPLAYER] Receiver decision via server:', accepted ? 'ACCEPT' : 'REJECT');
      try {
        if (accepted) {
          await multiplayerActions.acceptTile();
        } else {
          await multiplayerActions.rejectTile();
        }
      } catch (error) {
        console.error('[MULTIPLAYER] Receiver decision failed:', error);
        alert(`Failed to process decision: ${error.message}`);
      }
    } else {
      // Single-player mode
      handleReceiverAcceptanceDecision(accepted);
    }
  }, [isMultiplayer, multiplayerActions, handleReceiverAcceptanceDecision]);

  /**
   * Handle receiver reward choice after exposing a dishonest play
   * Per manual: Receiver restores up to 2 credibility notches OR gets a free Advance
   */
  const handleReceiverRewardChoice = React.useCallback(async (choice: 'credibility' | 'advance') => {
    if (isMultiplayer && multiplayerActions) {
      console.log('[MULTIPLAYER] Receiver reward choice:', choice);
      try {
        await multiplayerActions.receiverRewardChoice(choice);
      } catch (error: any) {
        console.error('[MULTIPLAYER] Receiver reward choice failed:', error);
        alert(`Failed to process reward choice: ${error.message}`);
      }
    }
  }, [isMultiplayer, multiplayerActions]);

  /**
   * Handle challenger's decision (challenge or pass)
   */
  const handleChallengerDecision = (challenge: boolean) => {
    if (!playedTile) return;

    if (challenge) {
      // CHALLENGED: Use exact same logic as Check Move to verify if tile player met requirements perfectly
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

      // Check if there are extra moves beyond what's required
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
        // Challenge is INVALID - player played perfectly
        const challengerId = challengeOrder[currentChallengerIndex];
        const challengerName = getPlayerName(
          getPlayerById(players, challengerId),
          challengerId
        );
        const challengedPlayerName = getPlayerNameSimple(
          getPlayerById(players, playedTile.playerId)
        );
        setChallengeResultMessage(
          `Challenge Failed: ${challengedPlayerName} played the tile perfectly.`
        );

        // Challenger loses 1 credibility for unsuccessful challenge (applied in finalizeTilePlay)
        addCredibilityLossLog(
          challengerId,
          "Unsuccessful challenge - tile was played perfectly"
        );

        // A challenge was made (even though unsuccessful), so no more challenges allowed
        // Finalize the tile play immediately (credibility loss applied there)
        finalizeTilePlay(true, challengerId);

        // Schedule auto-dismiss of challenge message after 5 seconds
        setTimeout(() => {
          setChallengeResultMessage("");
        }, 5000);
      } else {
        // Challenge is VALID - player did NOT meet requirements perfectly
        const challengedPlayerName = getPlayerNameSimple(
          getPlayerById(players, playedTile.playerId)
        );
        setChallengeResultMessage(
          `Challenge Successful: ${challengedPlayerName} must now move as per the tile requirements.`
        );

        // NEW: Offer Take Advantage reward to successful challenger
        const challengerId = challengeOrder[currentChallengerIndex];

        // IMPORTANT: Apply all credibility changes synchronously to avoid React state batching issues
        // React batches setState calls, so we must calculate all changes BEFORE calling setPlayers
        // Otherwise, later calls would read stale state and overwrite earlier changes
        //
        // Credibility Changes on Successful Challenge:
        //   1. Tile player loses 1 credibility (failed challenge)
        //   2. Receiver loses 1 credibility (if they accepted a bad tile)
        //   3. Challenger gains up to 2 credibility (successful challenge)
        //
        // By chaining: players → updatedPlayers → finalPlayers
        // We ensure each change builds on the previous one
        let finalPlayers: Player[] = [];

        // Step 1: Calculate all credibility changes synchronously (chain them together)
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

        const credibilityResult = handleCredibilityGain(
          challengerId,
          2,
          updatedPlayers
        );
        finalPlayers = credibilityResult.newPlayers;

        // Step 2: Apply the final result in one setState call
        setPlayers(finalPlayers);

        // Add logs after state update
        addCredibilityLossLog(
          playedTile.playerId,
          "Challenge succeeded - tile did not meet requirements"
        );

        if (receiverAcceptance === true) {
          addCredibilityLossLog(
            playedTile.receivingPlayerId,
            "Accepted a tile that was successfully challenged"
          );
        }

        const challenger = getPlayerById(finalPlayers, challengerId);
        const challengerName = challenger
          ? getPlayerName(challenger, challengerId)
          : "Player";
        addGameLog(
          `${challengerName} gained credibility for successful challenge (now ${challenger?.credibility ?? 0
          })`
        );

        if (challenger) {
          // Check if challenger has tiles (only offer Take Advantage if they have tiles)
          const hasTiles =
            challenger.bureaucracyTiles &&
            challenger.bureaucracyTiles.length > 0;

          // Store challenger context with UPDATED credibility
          setTakeAdvantageChallengerId(challengerId);
          setTakeAdvantageChallengerCredibility(challenger.credibility);

          // Only show modal if they have tiles, otherwise skip to correction
          if (hasTiles) {
            setShowTakeAdvantageModal(true);

            // Store the challenge result message to show after modal closes
            setTimeout(() => {
              setChallengeResultMessage("");
            }, TIMEOUTS.CHALLENGE_MESSAGE_DISMISS);

            // DON'T transition to CORRECTION_REQUIRED yet
            // Wait for user's choice in the modal
            return; // Exit early
          } else {
            // No tiles, skip Take Advantage and go straight to correction
            addGameLog(
              `${challengerName} has no tiles for Take Advantage - skipping reward`
            );
            setTakeAdvantageChallengerId(null);
            setTakeAdvantageChallengerCredibility(0);
            transitionToCorrectionPhase();

            setTimeout(() => {
              setChallengeResultMessage("");
            }, 5000);
            return;
          }
        }

        // If no challenger found (shouldn't happen), continue as normal
        transitionToCorrectionPhase();

        // Schedule auto-dismiss of challenge message after 5 seconds
        setTimeout(() => {
          setChallengeResultMessage("");
        }, 5000);
      }
    } else {
      // PASS: Move to next challenger or finalize
      const nextChallengerIndex = currentChallengerIndex + 1;

      if (nextChallengerIndex >= challengeOrder.length) {
        // No more challengers, finalize
        finalizeTilePlay(false, null);
      } else {
        // Move to next challenger
        const nextChallengerId = challengeOrder[nextChallengerIndex];
        const nextChallengerIndex_PlayerIndex = players.findIndex(
          (p) => p.id === nextChallengerId
        );
        setCurrentChallengerIndex(nextChallengerIndex);
        setCurrentPlayerIndex(nextChallengerIndex_PlayerIndex);
      }
    }
  };

  // Wrap challenger decision for multiplayer
  const wrappedChallengerDecision = React.useCallback(async (challenge: boolean) => {
    if (!playedTile) return;

    if (isMultiplayer && multiplayerActions) {
      if (challenge) {
        await multiplayerActions.initiateChallenge();
      } else {
        await multiplayerActions.passChallenge();
      }
    } else {
      handleChallengerDecision(challenge);
    }
  }, [isMultiplayer, multiplayerActions, playedTile, handleChallengerDecision]);

  /**
   * Finalize tile play - determine who keeps the tile and next player
   */
  const finalizeTilePlay = (
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

    console.log("[finalizeTilePlay] Bank check:", {
      receiverId: playedTile.receivingPlayerId,
      nextBankIndex,
      playerBankSpacesLength: playerBankSpaces.length,
      usedBankIndices: Array.from(usedBankIndices),
      bankedTilesForPlayer: bankedTiles.filter(
        (bt) => bt.ownerId === playedTile.receivingPlayerId
      ).length,
    });

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

      setBankedTiles((prev) => [...prev, newBankedTile]);
    }

    // Receiving player keeps the tile in their bureaucracy (always, even if bank display is full)
    const tile = {
      id: parseInt(playedTile.tileId),
      url: `./images/${playedTile.tileId}.svg`,
    };

    // Calculate the updated players array directly from current state
    let updatedPlayers = players.map((p) =>
      p.id === playedTile.receivingPlayerId
        ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tile] }
        : p
    );

    // Apply credibility loss for unsuccessful challenge
    // If wasChallenged=true and challengerId is set, the challenge was unsuccessful
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

    // Ensure we have valid player data before checking
    const allBanksFull =
      updatedPlayers.length > 0 &&
      updatedPlayers.every((p) => p.bureaucracyTiles.length >= tilesPerPlayer);

    // Debug logging
    console.log("[finalizeTilePlay] Bureaucracy check:", {
      wasChallenged,
      challengerId,
      updatedPlayersCount: updatedPlayers.length,
      tilesPerPlayer,
      playerTileCounts: updatedPlayers
        .map((p) => `P${p.id}:${p.bureaucracyTiles.length}`)
        .join(", "),
      allBanksFull,
    });

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
        const initialStates: BureaucracyPlayerState[] = updatedPlayers.map(
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
    // Use the players state to find the correct index
    setPlayers((prev) => {
      const receiverIndex = prev.findIndex(
        (p) => p.id === playedTile.receivingPlayerId
      );
      console.log("[finalizeTilePlay] Setting turn to receiver:", {
        receivingPlayerId: playedTile.receivingPlayerId,
        receiverIndex,
        wasChallenged,
        challengerId,
      });
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
      }
      return prev; // Don't modify players, just use the callback to access latest state
    });

    // Reset remaining tile play state
    setPlayedTile(null);
    setMovesThisTurn([]);
    setGameState("CAMPAIGN");
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);
    setBonusMoveWasCompleted(false);
    setPiecesAtCorrectionStart([]);
    setTilePlayerMustWithdraw(false);

    // CRITICAL: Check for win condition when receiver starts their turn
    // This is the ONLY place in Campaign phase where win is checked
    // Ensures complete tile play workflow finishes before checking:
    //   1. Tile played and moves made
    //   2. Acceptance/rejection by receiver
    //   3. Challenge phase (if accepted)
    //   4. Take Advantage (if challenger succeeds)
    //   5. Correction (if needed)
    // THEN check for win before receiver's turn begins
    const winners = checkBureaucracyWinCondition(players, pieces);
    if (winners.length > 0) {
      if (winners.length === 1) {
        const winnerName = getPlayerName(
          getPlayerById(players, winners[0]),
          winners[0]
        );
        alert(`${winnerName} has won the game during the Campaign phase!`);
      } else {
        const winnerNames = formatWinnerNames(winners, players);
        alert(`The game is a draw! Winners: ${winnerNames}`);
      }
      return;
    }

    // Set piece state snapshot for the start of this new turn
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    // Clear piece movement tracking for new turn
    setMovedPiecesThisTurn(new Set());
    // Clear pending community pieces
    setPendingCommunityPieces(new Set());
  };

  /**
   * Handle tile player correcting their moves (after rejection or challenge)
   */
  const handleCorrectionComplete = () => {
    if (!playedTile) return;

    // Determine the baseline pieces for move calculation
    let piecesForCalculation = pieces;
    let baselinePieces = playedTile.originalPieces;

    // If correction baseline was captured, use it
    if (piecesAtCorrectionStart.length > 0) {
      baselinePieces = piecesAtCorrectionStart;
    }
    // If a bonus move was completed, use the pieces before the bonus move to avoid counting bonus moves as extra moves
    else if (bonusMoveWasCompleted) {
      piecesForCalculation = piecesBeforeBonusMove;
    }

    // Use the same calculation logic as Check Move button
    const calculatedMoves = calculateMoves(
      baselinePieces,
      piecesForCalculation,
      playedTile.playerId
    );

    // Validate moves performed (max 2 moves: 1 O and 1 M)
    const movesValidation = validateMovesForTilePlay(calculatedMoves);
    if (!movesValidation.isValid) {
      showAlert(
        "Invalid Moves",
        movesValidation.error || "Invalid move combination",
        "error"
      );
      return;
    }

    // Validate that tile player has now met the requirements
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

    console.log("=== handleCorrectionComplete DEBUG ===");
    console.log("Tile ID:", playedTile.tileId);
    console.log("Tile Player ID:", playedTile.playerId);
    console.log("Number of original pieces:", playedTile.originalPieces.length);
    console.log("Number of current pieces:", pieces.length);
    console.log("Sample original piece:", playedTile.originalPieces[0]);
    console.log("Sample current piece:", pieces[0]);
    console.log("Calculated moves:", calculatedMoves);
    console.log("Tile requirements:", tileRequirements);
    console.log("======================================");

    if (!tileRequirements.isMet) {
      showAlert(
        "Incomplete Moves",
        `Still missing ${tileRequirements.missingMoves.join(", ")} move(s)`,
        "error"
      );
      return;
    }

    // Check for extra moves in correction phase - NOT ALLOWED during correction
    // EXCEPTION: If tile player must perform penalty WITHDRAW, allow one extra WITHDRAW
    const requiredMoveTypes = tileRequirements.requiredMoves;
    const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
    const extraMoves: string[] = [];

    for (const moveType of performedMoveTypes) {
      if (!requiredMoveTypes.includes(moveType)) {
        extraMoves.push(moveType);
      }
    }

    const uniqueExtraMoves = [...new Set(extraMoves)];

    // If tile player must perform penalty WITHDRAW, allow exactly one extra WITHDRAW
    let allowedExtraMoves = uniqueExtraMoves;
    if (tilePlayerMustWithdraw) {
      // Remove WITHDRAW from extra moves list if it's the penalty WITHDRAW
      allowedExtraMoves = uniqueExtraMoves.filter((m) => m !== "WITHDRAW");
    }

    // During correction phase, reject if there are any extra moves (after accounting for penalty WITHDRAW)
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

    // If tile player has 0 credibility and must perform a WITHDRAW, check that they did
    // The WITHDRAW must be IN ADDITION to the required moves (not replacing a required move)
    // EXCEPTION: If the player's domain is empty, skip the WITHDRAW requirement
    if (tilePlayerMustWithdraw) {
      const withdrawMoves = calculatedMoves.filter(
        (m) => m.moveType === "WITHDRAW"
      );

      // Count how many WITHDRAW moves are in the required moves
      const requiredWithdrawCount = requiredMoveTypes.filter(
        (m) => m === "WITHDRAW"
      ).length;

      // Check if player's domain is empty (no pieces in seats, rostrums, or offices)
      const tilePlayer = getPlayerById(players, playedTile.playerId);
      const playerDomainEmpty =
        tilePlayer &&
        pieces.every((p) => {
          if (!p.locationId) return true; // piece not in domain
          const locationPrefix = `p${tilePlayer.id}_`;
          return !p.locationId.startsWith(locationPrefix);
        });

      // If domain is not empty, require the additional WITHDRAW move
      if (!playerDomainEmpty) {
        // Check if there's at least one MORE WITHDRAW move than required
        if (withdrawMoves.length <= requiredWithdrawCount) {
          showAlert(
            "Mandatory WITHDRAW Required",
            "You must perform an ADDITIONAL WITHDRAW move beyond the tile requirements. Add another WITHDRAW move to proceed.",
            "error"
          );
          return;
        }
      }
      // If domain is empty, they're exempt from the WITHDRAW requirement (can't withdraw from an empty domain)
    }

    // Create updated tile with corrected moves
    const updatedPlayedTile = {
      ...playedTile,
      movesPerformed: calculatedMoves,
    };

    // Log the standing moves (corrected moves that are now final)
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

    // Get bank spaces for the receiving player
    const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const playerBankSpaces = bankSpaces.filter(
      (bs) => bs.ownerId === updatedPlayedTile.receivingPlayerId
    );

    // Find the next available bank space (accounting for already banked tiles)
    const usedBankIndices = new Set(
      bankedTiles
        .filter((bt) => bt.ownerId === updatedPlayedTile.receivingPlayerId)
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

    // Create the banked tile (face-up because it was rejected)
    if (nextBankIndex < playerBankSpaces.length) {
      const bankSpace = playerBankSpaces[nextBankIndex];
      const newBankedTile: BoardTile & { faceUp: boolean } = {
        id: `bank_${updatedPlayedTile.receivingPlayerId
          }_${nextBankIndex}_${Date.now()}`,
        tile: {
          id: parseInt(updatedPlayedTile.tileId),
          url: `./images/${updatedPlayedTile.tileId}.svg`,
        },
        position: bankSpace.position,
        rotation: bankSpace.rotation,
        placerId: updatedPlayedTile.playerId,
        ownerId: updatedPlayedTile.receivingPlayerId,
        faceUp: true, // Always face-up for rejected tiles
      };

      setBankedTiles((prev) => [...prev, newBankedTile]);
    }

    // Remove from board tiles
    setBoardTiles((prev) =>
      prev.filter(
        (bt) =>
          !(
            bt.tile.id.toString().padStart(2, "0") ===
            updatedPlayedTile.tileId &&
            bt.placerId === updatedPlayedTile.playerId &&
            bt.ownerId === updatedPlayedTile.receivingPlayerId
          )
      )
    );

    // Receiving player gets the tile in their bureaucracy
    const tile = {
      id: parseInt(updatedPlayedTile.tileId),
      url: `./images/${updatedPlayedTile.tileId}.svg`,
    };

    // Reset challenge state FIRST before setting turn
    resetChallengeState();

    // Update players and set turn to receiver using latest state
    // Calculate the updated players array directly from current state
    const updatedPlayers = players.map((p) =>
      p.id === updatedPlayedTile.receivingPlayerId
        ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tile] }
        : p
    );

    // Move to receiving player for their turn
    const receiverIndex = updatedPlayers.findIndex(
      (p) => p.id === updatedPlayedTile.receivingPlayerId
    );
    if (receiverIndex !== -1) {
      setCurrentPlayerIndex(receiverIndex);
    }

    // Update the players state
    setPlayers(updatedPlayers);

    // Check if all players have filled their banks (trigger Bureaucracy phase)
    const allBankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const tilesPerPlayer = allBankSpaces.length / playerCount;
    const allBanksFull =
      updatedPlayers.length > 0 &&
      updatedPlayers.every((p) => p.bureaucracyTiles.length >= tilesPerPlayer);

    if (allBanksFull) {
      // Show "Bureaucracy!" transition message for 3 seconds before starting bureaucracy phase
      setShowBureaucracyTransition(true);

      setTimeout(() => {
        // Initialize Bureaucracy phase
        const turnOrder = getBureaucracyTurnOrder(updatedPlayers, pieces);
        const initialStates: BureaucracyPlayerState[] = updatedPlayers.map(
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

    // Check for immediate win condition after correction
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
      // Set game to a finished state or allow restart
      return;
    }

    // Reset remaining state
    setPlayedTile(null);
    setMovesThisTurn([]);
    setGameState("CAMPAIGN");
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);

    // Set piece state snapshot for the start of this new turn
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    // Clear piece movement tracking for new turn
    setMovedPiecesThisTurn(new Set());
    // Clear pending community pieces
    setPendingCommunityPieces(new Set());
  };

  /**
   * Helper function to calculate moves by comparing current pieces to original pieces
   * Wrapper around the extracted calculateMovesCore function
   */
  const calculateMoves = (
    originalPieces: Piece[],
    currentPieces: Piece[],
    tilePlayerId: number
  ): TrackedMove[] => {
    console.log("calculateMoves called with:", {
      originalPiecesCount: originalPieces.length,
      currentPiecesCount: currentPieces.length,
      tilePlayerId,
    });

    return calculateMovesCore(
      originalPieces,
      currentPieces,
      tilePlayerId,
      playerCount,
      areSeatsAdjacent
    );
  };

  const handleCheckMove = () => {
    if (!playedTile) return;

    // Determine the baseline pieces for move calculation
    let piecesForCalculation = pieces;
    let baselinePieces = playedTile.originalPieces;

    // If in correction phase, use the pieces captured at correction start as both baseline and current
    if (
      gameState === "CORRECTION_REQUIRED" &&
      piecesAtCorrectionStart.length > 0
    ) {
      baselinePieces = piecesAtCorrectionStart;
    }
    // If a bonus move was completed, use the pieces before the bonus move to avoid counting bonus moves as extra moves
    else if (bonusMoveWasCompleted) {
      piecesForCalculation = piecesBeforeBonusMove;
    }

    const calculatedMoves = calculateMoves(
      baselinePieces,
      piecesForCalculation,
      playedTile.playerId
    );

    // Validate the calculated moves
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
      // Build piece state after all previous moves
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

    // Check if there are extra moves beyond what's required
    const requiredMoveTypes = tileRequirements.requiredMoves;
    const performedMoveTypes = calculatedMoves.map((m) => m.moveType);
    const extraMoves: string[] = [];

    for (const moveType of performedMoveTypes) {
      if (!requiredMoveTypes.includes(moveType)) {
        extraMoves.push(moveType);
      }
    }

    // Remove duplicates from extraMoves
    const uniqueExtraMoves = [...new Set(extraMoves)];

    setMoveCheckResult({
      ...tileRequirements,
      hasExtraMoves: uniqueExtraMoves.length > 0,
      extraMoves: uniqueExtraMoves,
      moveValidations,
    });
    setShowMoveCheckResult(true);
  };

  // ============================================================================
  // BUREAUCRACY PHASE HANDLERS
  // ============================================================================

  const handleSelectBureaucracyMenuItem = (item: BureaucracyMenuItem) => {
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
  };

  const handleDoneWithBureaucracyAction = () => {
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
          currentPlayerId
        );

        // Validate each move with proper piece state (same as Campaign)
        // We need to validate using the piece state BEFORE the move, not after
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
  };

  const completeBureaucracyTurn = () => {
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];

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
  };

  const handleFinishBureaucracyTurn = () => {
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
  };

  const handleConfirmFinishTurn = () => {
    setShowFinishTurnConfirm({ isOpen: false, remainingKredcoin: 0 });
    completeBureaucracyTurn();
  };

  const handleCancelFinishTurn = () => {
    setShowFinishTurnConfirm({ isOpen: false, remainingKredcoin: 0 });
  };

  const handleClearBureaucracyValidationError = () => {
    setBureaucracyValidationError(null);
  };

  const handleResetBureaucracyAction = () => {
    // Reset to snapshot if available
    if (bureaucracySnapshot) {
      setPieces(bureaucracySnapshot.pieces);
      setBoardTiles(bureaucracySnapshot.boardTiles);
    }
    // Clear moves
    setBureaucracyMoves([]);
    // Clear validation error
    setBureaucracyValidationError(null);
  };

  const handleCheckBureaucracyMove = () => {
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
      let piecesForValidation = bureaucracySnapshot.pieces.map((p) => ({
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
  };

  const handleCloseBureaucracyMoveCheckResult = () => {
    setShowBureaucracyMoveCheckResult(false);
  };

  const handleBureaucracyPieceMove = (
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
  };

  /**
   * Transitions the game to CORRECTION_REQUIRED phase after challenge success
   * and Take Advantage flow completes (or is declined)
   * @param updatedOriginalPieces - Optional updated pieces to use as baseline (includes Take Advantage changes)
   */
  const transitionToCorrectionPhase = (updatedOriginalPieces?: Piece[]) => {
    if (!playedTile) return;

    const tilePlayer = getPlayerById(players, playedTile.playerId);
    const playerHasZeroCredibility = tilePlayer && tilePlayer.credibility === 0;

    // Determine if tile player must withdraw (0 credibility penalty)
    if (playerHasZeroCredibility) {
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
  };

  /**
   * Handler: User chose "No Thanks" (credibility = 3)
   * Decline the Take Advantage offer and continue to correction phase
   */
  const handleTakeAdvantageDecline = () => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    setGameLog((prev) => [
      ...prev,
      `${challengerName} declined the Take Advantage reward`,
    ]);

    // Clean up modal state
    cleanupTakeAdvantageModalState();

    // Continue to correction phase
    transitionToCorrectionPhase();
  };

  /**
   * Handler: User chose "Yes" (credibility = 3)
   * Show tile selection screen
   */
  const handleTakeAdvantageYes = () => {
    const challenger = getPlayerById(players, takeAdvantageChallengerId!);

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
  };

  /**
   * Handler: User chose "Recover Credibility" (credibility < 3)
   * Add 1 credibility and continue
   */
  const handleRecoverCredibility = () => {
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
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
    setGameLog((prev) => [
      ...prev,
      `${challengerName} recovered 1 credibility (successful challenge reward)`,
    ]);

    // Clean up modal state
    cleanupTakeAdvantageModalState();

    // Continue to correction phase
    transitionToCorrectionPhase();
  };

  /**
   * Handler: User chose "Purchase Move" (credibility < 3)
   * Show tile selection screen
   */
  const handlePurchaseMove = () => {
    const challenger = getPlayerById(players, takeAdvantageChallengerId!);

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
  };

  /**
   * Handler: Toggle tile selection (add or remove from selected array)
   */
  const handleToggleTileSelection = (tile: Tile) => {
    const isCurrentlySelected = selectedTilesForAdvantage.some(
      (t) => t.id === tile.id
    );

    let newSelection: Tile[];
    if (isCurrentlySelected) {
      // Remove from selection
      newSelection = selectedTilesForAdvantage.filter((t) => t.id !== tile.id);
    } else {
      // Add to selection
      newSelection = [...selectedTilesForAdvantage, tile];
    }

    // Update selected tiles
    setSelectedTilesForAdvantage(newSelection);

    // Calculate new total kredcoin
    const newTotal = newSelection.reduce((sum, t) => {
      return sum + (TILE_KREDCOIN_VALUES[t.id] || 0);
    }, 0);
    setTotalKredcoinForAdvantage(newTotal);
  };

  /**
   * Handler: Confirm tile selection and show action menu
   */
  const handleConfirmTileSelection = () => {
    if (selectedTilesForAdvantage.length === 0) {
      setTakeAdvantageValidationError("Please select at least one tile");
      return;
    }

    if (totalKredcoinForAdvantage === 0) {
      setTakeAdvantageValidationError("Selected tiles have no kredcoin value");
      return;
    }

    // Log tile selection
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
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
  };

  /**
   * Handler: Cancel tile selection
   */
  const handleCancelTileSelection = () => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );
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
  };

  /**
   * Handler: User selects an action from the Take Advantage menu
   */
  const handleSelectTakeAdvantageAction = (item: BureaucracyMenuItem) => {
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

      const challengerName = getPlayerName(
        getPlayerById(players, takeAdvantageChallengerId!),
        takeAdvantageChallengerId!
      );
      setGameLog((prev) => [
        ...prev,
        `${challengerName} restored credibility using Take Advantage`,
      ]);

      // Complete immediately
      setTimeout(() => {
        handleCompleteTakeAdvantage(purchase);
      }, 1500);
    }

    // For MOVE and PROMOTION, user needs to perform action on board
    // (board interaction handlers will track moves/promotions)
  };

  /**
   * Handler: Reset Take Advantage action (restore pieces snapshot)
   */
  const handleResetTakeAdvantageAction = () => {
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

    // Clear purchase
    setTakeAdvantagePurchase(null);
  };

  /**
   * Handler: User clicks "Done" after performing Take Advantage action
   */
  const handleDoneTakeAdvantageAction = () => {
    if (!takeAdvantagePurchase) return;

    const purchase = takeAdvantagePurchase;

    // Validate action was performed correctly
    const validation = validateTakeAdvantageAction(purchase);

    if (!validation.isValid) {
      setTakeAdvantageValidationError(
        validation.error || "Invalid action. Please try again or reset."
      );
      setTimeout(() => setTakeAdvantageValidationError(null), 4000);
      return;
    }

    // Action is valid, complete the purchase
    handleCompleteTakeAdvantage(purchase);
  };

  /**
   * Validates that the Take Advantage action was performed correctly
   */
  const validateTakeAdvantageAction = (
    purchase: BureaucracyPurchase
  ): { isValid: boolean; error?: string } => {
    const item = purchase.item;

    // CREDIBILITY: Always valid (auto-applied)
    if (item.type === "CREDIBILITY") {
      return { isValid: true };
    }

    // PROMOTION: Check if a piece was swapped to community (same as Bureaucracy)
    if (item.type === "PROMOTION") {
      // Find pieces that moved to community
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

    // MOVE: Check if the performed move matches the selected move type (same validation as Bureaucracy)
    if (item.type === "MOVE") {
      const requiredMoveType = item.moveType!;

      // Calculate moves using the same logic as Bureaucracy
      const calculatedMoves = calculateMoves(
        takeAdvantagePiecesSnapshot,
        pieces,
        takeAdvantageChallengerId!
      );

      if (calculatedMoves.length === 0) {
        return { isValid: false, error: "You must perform a move" };
      }

      // Validate each move with proper piece state (same as Bureaucracy)
      let allMovesValid = true;
      for (let i = 0; i < calculatedMoves.length; i++) {
        const move = calculatedMoves[i];

        // Build piece state after all previous moves but before this move
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

      // Check if at least one move matches the expected type
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
  };

  /**
   * Completes the Take Advantage purchase and cleans up state
   */
  const handleCompleteTakeAdvantage = (purchase: BureaucracyPurchase) => {
    const challengerName = getPlayerName(
      getPlayerById(players, takeAdvantageChallengerId!),
      takeAdvantageChallengerId!
    );

    // Place used tiles face-up in player's bank spaces
    if (takeAdvantageChallengerId !== null) {
      const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
      const playerBankSpaces = bankSpaces.filter(
        (bs) => bs.ownerId === takeAdvantageChallengerId
      );

      // Find which bank indices are already used
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

      // Add each selected tile to bankedTiles as face-up
      const newBankedTiles: (BoardTile & { faceUp: boolean })[] = [];
      let bankIndex = 0;

      for (const tile of selectedTilesForAdvantage) {
        // Find next available bank space
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
            faceUp: true, // Face-up tiles don't count toward kredcoin
          };

          newBankedTiles.push(newBankedTile);
          usedBankIndices.add(bankIndex);
          bankIndex++;
        }
      }

      setBankedTiles((prev) => [...prev, ...newBankedTiles]);
    }

    // Deduct selected tiles from player's bank
    setPlayers((prev) =>
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

    // Log the completed action
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

    // Clean up all Take Advantage state
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

    // Continue to correction phase, passing current pieces to preserve Take Advantage changes
    // Take Advantage transactions occur within the Campaign phase, so promotions
    // and moves must be preserved as part of the ongoing game state
    transitionToCorrectionPhase(pieces.map((p) => ({ ...p })));
  };

  /**
   * Handler: Piece promotion during Take Advantage
   */
  const handleTakeAdvantagePiecePromote = (pieceId: string) => {
    if (
      !takeAdvantagePurchase ||
      takeAdvantagePurchase.item.type !== "PROMOTION"
    ) {
      return;
    }

    // Perform the promotion (swap with community)
    const result = performPromotion(pieces, pieceId);

    if (!result.success) {
      setTakeAdvantageValidationError(result.reason || "Promotion failed");
      setTimeout(() => setTakeAdvantageValidationError(null), 3000);
      return;
    }

    setPieces(result.pieces);
  };

  const handleBureaucracyPiecePromote = (pieceId: string) => {
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
  };

  // ============================================================================
  // HOST: Register action dispatch for processing guest actions
  // ============================================================================
  useEffect(() => {
    if (!setActionDispatch || !isHost) return;

    setActionDispatch((action) => {
      switch (action.type) {
        case 'SELECT_DRAFT_TILE': {
          const { tileId, playerIndex: selectingPlayerIndex } = action.payload;
          if (typeof selectingPlayerIndex !== 'number') break;

          // Find the tile in the selecting player's hand
          const selectingPlayer = players[selectingPlayerIndex];
          if (!selectingPlayer) break;

          // Guard: only allow 1 pick per round (player's hand must equal the max hand size)
          const maxHandSize = Math.max(...players.map(p => p.hand.length));
          if (selectingPlayer.hand.length < maxHandSize) break;

          const tile = selectingPlayer.hand.find((t: any) => String(t.id) === String(tileId));
          if (!tile) break;

          // Move tile from hand to keptTiles for the selecting player
          const updatedPlayers = players.map((p, i) => {
            if (i === selectingPlayerIndex) {
              return {
                ...p,
                keptTiles: [...p.keptTiles, tile],
                hand: p.hand.filter((t: any) => t.id !== tile.id),
              };
            }
            return p;
          });

          // Check if ALL players have selected this round
          // After each pick, that player's hand is 1 less. When all hands are equal, everyone has picked.
          const handSizes = updatedPlayers.map(p => p.hand.length);
          const allSelected = handSizes.every(s => s === handSizes[0]);

          if (allSelected) {
            const totalTilesPerPlayer = Math.floor((playerCount === 5 ? 25 : 24) / playerCount);

            if (handSizes[0] === 0) {
              // Drafting complete — move to Campaign
              setGameState('CAMPAIGN');
              const initialPieces = initializeCampaignPieces(playerCount);
              setPieces(initialPieces);
              setPiecesAtTurnStart(initialPieces);

              // Player with tile 03 goes first
              const startingIdx = updatedPlayers.findIndex(
                p => p.keptTiles?.some((t: any) => t.id === 3)
              );
              setCurrentPlayerIndex(startingIdx !== -1 ? startingIdx : 0);
              setHasPlayedTileThisTurn(false);
              setPlayers(updatedPlayers);
            } else {
              // Rotate hands to the left for next round
              const handsToPass = updatedPlayers.map(p => p.hand);
              const rotated = updatedPlayers.map((p, i) => ({
                ...p,
                hand: handsToPass[(i - 1 + playerCount) % playerCount],
              }));
              setPlayers(rotated);
              setDraftRound(draftRound + 1);
            }
          } else {
            // Not all players have picked yet — just update state
            setPlayers(updatedPlayers);
          }
          break;
        }
        case 'PLAY_TILE': {
          const { tileId, targetPlayerId } = action.payload;
          const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
          const matchedSpace = spaces.find(s => s.ownerId === targetPlayerId);
          if (matchedSpace) {
            handlePlaceTile(Number(tileId), matchedSpace);
          } else {
            handlePlaceTile(Number(tileId), { ownerId: targetPlayerId, position: { left: 0, top: 0 }, rotation: 0 });
          }
          break;
        }
        case 'MOVE_PIECE': {
          const { pieceId, position, location } = action.payload;
          pieceMovementHandlers.handlePieceMove(pieceId, position, location);
          break;
        }
        case 'END_TURN':
          handleEndTurn();
          break;
        case 'RECEIVER_DECISION':
          handleReceiverAcceptanceDecision(action.payload.accepted);
          break;
        case 'VIEW_TILE_PRIVATE':
          // Guest viewing tile privately — no host action needed
          break;
        case 'CHALLENGER_DECISION':
          handleChallengerDecision(action.payload.challenge);
          break;
        case 'COMPLETE_BONUS_MOVE':
          handleBonusMoveComplete();
          break;
        case 'COMPLETE_CORRECTION':
          handleCorrectionComplete();
          break;
        case 'ADVANTAGE_SELECT_TILES':
          // Guest selected tiles for take advantage
          setSelectedTilesForAdvantage(action.payload.tileIds);
          break;
        case 'ADVANTAGE_PURCHASE':
          // Guest confirmed a take advantage purchase
          break;
        case 'RECEIVER_REWARD':
          // Process on host side directly
          break;
        case 'BUREAUCRACY_PURCHASE':
          // Guest made a bureaucracy purchase
          break;
        case 'BUREAUCRACY_COMPLETE':
          handleFinishBureaucracyTurn();
          break;
        default:
          console.warn('[HOST] Unknown action type:', action.type);
      }
    });
  });

  const renderGameState = () => {
    // Multiplayer: Check gameState and render appropriate screen
    if (isMultiplayer) {
      // Wait for all required props to be defined and valid
      const isValidPlayers = Array.isArray(players) && players.length > 0 && players.every(p => p && typeof p === 'object');
      const isValidPlayerIndex = typeof playerIndex === 'number' && playerIndex >= 0 && playerIndex < players.length;
      const isValidCurrentPlayerIndex = typeof currentPlayerIndex === 'number' && currentPlayerIndex >= 0 && currentPlayerIndex < players.length;

      if (!isValidPlayers || !isValidPlayerIndex || !isValidCurrentPlayerIndex) {
        const loadingMessage = !isValidPlayers 
          ? 'Loading players...' 
          : !isValidPlayerIndex 
          ? 'Syncing player index...' 
          : 'Syncing current player...';
        
        return (
          <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                {loadingMessage}
              </h1>
              <p className="text-slate-400 mt-2">Syncing game state from server...</p>
            </div>
          </main>
        );
      }

      // Route based on gameState for multiplayer
      if (gameState === 'DRAFTING') {
        return (
          <DraftingScreen
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            draftRound={draftRound}
            onSelectTile={handleSelectTile}
            playerIndex={playerIndex}
            isMultiplayer={isMultiplayer}
            playerNames={playerNames}
          />
        );
      }
      
      // For other phases, fall through to normal switch below
    }
    
    // Single player or multiplayer non-drafting phases: use normal flow
    switch (gameState) {
      case "PLAYER_SELECTION":
        return (
          <PlayerSelectionScreen
            onStartGame={(count, testMode, skipDraft, skipCampaign) =>
              handleStartGame(count, testMode, skipDraft, skipCampaign)
            }
          />
        );
      case "DRAFTING":
        // In multiplayer, wait for player data to load before rendering
        if (isMultiplayer && players.length === 0) {
          return (
            <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
                  Loading Game...
                </h1>
                <p className="text-slate-400">Retrieving game state from server...</p>
              </div>
            </main>
          );
        }
        return (
          <DraftingScreen
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            draftRound={draftRound}
            onSelectTile={handleSelectTile}
            playerIndex={playerIndex}
            isMultiplayer={isMultiplayer}
            playerNames={playerNames}
          />
        );
      case "BUREAUCRACY":
        return (
          <BureaucracyScreen
            players={players}
            pieces={pieces}
            boardTiles={boardTiles}
            playerCount={playerCount}
            currentBureaucracyPlayerIndex={currentBureaucracyPlayerIndex}
            bureaucracyStates={bureaucracyStates}
            currentPurchase={currentBureaucracyPurchase}
            showPurchaseMenu={showBureaucracyMenu}
            validationError={bureaucracyValidationError}
            turnOrder={bureaucracyTurnOrder}
            boardRotationEnabled={boardRotationEnabled}
            setBoardRotationEnabled={setBoardRotationEnabled}
            onSelectMenuItem={handleSelectBureaucracyMenuItem}
            onDoneWithAction={handleDoneWithBureaucracyAction}
            onFinishTurn={handleFinishBureaucracyTurn}
            onPieceMove={handleBureaucracyPieceMove}
            onPiecePromote={handleBureaucracyPiecePromote}
            onClearValidationError={handleClearValidationError}
            onResetAction={handleResetBureaucracyAction}
            onCheckMove={handleCheckBureaucracyMove}
            showMoveCheckResult={showBureaucracyMoveCheckResult}
            moveCheckResult={bureaucracyMoveCheckResult}
            onCloseMoveCheckResult={handleCloseBureaucracyMoveCheckResult}
            isTestMode={isTestMode}
            BOARD_IMAGE_URLS={BOARD_IMAGE_URLS}
            credibilityRotationAdjustments={credibilityRotationAdjustments}
          />
        );
      case "CAMPAIGN":
      case "TILE_PLAYED":
      case "PENDING_ACCEPTANCE":
      case "PENDING_CHALLENGE":
      case "CORRECTION_REQUIRED":
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || players.length === 0) {
          // Wait for state to be set up properly
          console.log(
            "currentPlayer not found. currentPlayerIndex:",
            currentPlayerIndex,
            "players.length:",
            players.length
          );
          return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-slate-300">
              Loading campaign... (currentPlayer issue)
            </div>
          );
        }
        
        // In multiplayer, currentPlayerId should be the VIEWING player, not the active turn player
        const viewingPlayerId = isMultiplayer && playerIndex !== undefined
          ? playerIndex + 1
          : currentPlayer.id;

        // Compute campaignRole dynamically for the viewing player
        let computedCampaignRole = campaignRole;
        if (isMultiplayer && playerIndex !== undefined) {
          const myIdx = playerIndex;
          if (gameState === 'CAMPAIGN' || gameState === 'TILE_PLAYED') {
            computedCampaignRole = myIdx === currentPlayerIndex ? 'mover' : 'waiting';
          } else if (gameState === 'PENDING_ACCEPTANCE') {
            const receiverIdx = tileTransaction?.receiverId != null
              ? players.findIndex(p => p.id === tileTransaction.receiverId)
              : -1;
            if (myIdx === receiverIdx) {
              computedCampaignRole = 'receiver';
            } else if (myIdx === currentPlayerIndex) {
              computedCampaignRole = 'mover';
            } else {
              computedCampaignRole = 'waiting';
            }
          } else if (gameState === 'PENDING_CHALLENGE') {
            const currentBystander = bystanders[bystanderIndex];
            if (myIdx + 1 === currentBystander) {
              computedCampaignRole = 'challenger';
            } else if (myIdx === currentPlayerIndex) {
              computedCampaignRole = 'mover';
            } else {
              computedCampaignRole = 'waiting';
            }
          } else if (gameState === 'CORRECTION_REQUIRED') {
            computedCampaignRole = myIdx === currentPlayerIndex ? 'correcting' : 'waiting';
          }
        }

        return (
          <CampaignScreen
            gameState={gameState}
            playerCount={playerCount}
            players={players}
            pieces={pieces}
            boardTiles={boardTiles}
            bankedTiles={bankedTiles}
            currentPlayerId={viewingPlayerId}
            currentPlayerIndex={currentPlayerIndex}
            playerIndex={playerIndex}
            isMultiplayer={isMultiplayer}
            campaignRole={computedCampaignRole}
            moverPlayerIndex={moverPlayerIndex}
            lastDroppedPosition={lastDroppedPosition}
            lastDroppedPieceId={lastDroppedPieceId}
            isTestMode={isTestMode}
            dummyTile={dummyTile}
            setDummyTile={setDummyTile}
            hasPlayedTileThisTurn={hasPlayedTileThisTurn}
            revealedTileId={revealedTileId}
            tileTransaction={tileTransaction}
            isPrivatelyViewing={isPrivatelyViewing}
            bystanders={bystanders}
            bystanderIndex={bystanderIndex}
            showChallengeRevealModal={showChallengeRevealModal}
            challengedTile={challengedTile}
            placerViewingTileId={placerViewingTileId}
            giveReceiverViewingTileId={giveReceiverViewingTileId}
            gameLog={gameLog}
            boardRotationEnabled={boardRotationEnabled}
            setBoardRotationEnabled={setBoardRotationEnabled}
            showGridOverlay={showGridOverlay}
            setShowGridOverlay={setShowGridOverlay}
            onNewGame={handleNewGame}
            onPieceMove={wrappedPieceMove}
            onBoardTileMove={handleBoardTileMove}
            onEndTurn={wrappedEndTurn}
            onPlaceTile={wrappedPlaceTile}
            onRevealTile={handleRevealTile}
            onReceiverDecision={handleReceiverDecision}
            onBystanderDecision={handleBystanderDecision}
            onTogglePrivateView={handleTogglePrivateView}
            onContinueAfterChallenge={handleContinueAfterChallenge}
            onPlacerViewTile={handlePlacerViewTile}
            onSetGiveReceiverViewingTileId={setGiveReceiverViewingTileId}
            tileRevealed={tileRevealed}
            pendingReceiverReward={pendingReceiverReward}
            receiverAdvanceInProgress={receiverAdvanceInProgress}
            onReceiverRewardChoice={handleReceiverRewardChoice}
            playedTile={playedTile}
            receiverAcceptance={receiverAcceptance}
            onReceiverAcceptanceDecision={wrappedReceiverDecision}
            onChallengerDecision={wrappedChallengerDecision}
            onCorrectionComplete={handleCorrectionComplete}
            tileRejected={tileRejected}
            showMoveCheckResult={showMoveCheckResult}
            moveCheckResult={moveCheckResult}
            onCloseMoveCheckResult={() => setShowMoveCheckResult(false)}
            onCheckMove={handleCheckMove}
            credibilityRotationAdjustments={credibilityRotationAdjustments}
            setCredibilityRotationAdjustments={
              setCredibilityRotationAdjustments
            }
            isGameLogExpanded={isGameLogExpanded}
            setIsGameLogExpanded={setIsGameLogExpanded}
            isCredibilityAdjusterExpanded={isCredibilityAdjusterExpanded}
            setIsCredibilityAdjusterExpanded={setIsCredibilityAdjusterExpanded}
            isCredibilityRulesExpanded={isCredibilityRulesExpanded}
            setIsCredibilityRulesExpanded={setIsCredibilityRulesExpanded}
            isPieceTrackerExpanded={isPieceTrackerExpanded}
            setIsPieceTrackerExpanded={setIsPieceTrackerExpanded}
            showPerfectTileModal={showPerfectTileModal}
            setShowPerfectTileModal={setShowPerfectTileModal}
            showBonusMoveModal={showBonusMoveModal}
            bonusMovePlayerId={bonusMovePlayerId}
            onBonusMoveComplete={handleBonusMoveComplete}
            movedPiecesThisTurn={movedPiecesThisTurn}
            onResetTurn={handleResetTurn}
            onResetPiecesCorrection={handleResetPiecesCorrection}
            onResetBonusMove={handleResetBonusMove}
            showTakeAdvantageModal={showTakeAdvantageModal}
            takeAdvantageChallengerId={takeAdvantageChallengerId}
            takeAdvantageChallengerCredibility={
              takeAdvantageChallengerCredibility
            }
            showTakeAdvantageTileSelection={showTakeAdvantageTileSelection}
            selectedTilesForAdvantage={selectedTilesForAdvantage}
            totalKredcoinForAdvantage={totalKredcoinForAdvantage}
            showTakeAdvantageMenu={showTakeAdvantageMenu}
            takeAdvantagePurchase={takeAdvantagePurchase}
            takeAdvantageValidationError={takeAdvantageValidationError}
            onTakeAdvantageDecline={handleTakeAdvantageDecline}
            onTakeAdvantageYes={handleTakeAdvantageYes}
            onRecoverCredibility={handleRecoverCredibility}
            onPurchaseMove={handlePurchaseMove}
            onToggleTileSelection={handleToggleTileSelection}
            onConfirmTileSelection={handleConfirmTileSelection}
            onCancelTileSelection={handleCancelTileSelection}
            onSelectTakeAdvantageAction={handleSelectTakeAdvantageAction}
            onResetTakeAdvantageAction={handleResetTakeAdvantageAction}
            onDoneTakeAdvantageAction={handleDoneTakeAdvantageAction}
            onTakeAdvantagePiecePromote={handleTakeAdvantagePiecePromote}
          />
        );
      // Multiplayer-only: PLAYER_SELECTION should never be reached
      default:
        // Unknown game state - show error instead of invalid DraftingScreen
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem'
          }}>
            <h2>Unknown game state: {gameState}</h2>
            <button
              onClick={handleNewGame}
              style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                fontSize: '1.2em',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Start New Game
            </button>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <ErrorBoundary fallback={<ErrorDisplay />}>
        {renderGameState()}
      </ErrorBoundary>

      {/* Perfect Tile Modal */}
      <PerfectTileModal
        isOpen={showPerfectTileModal}
        onContinue={handlePerfectTileContinue}
      />

      {/* Challenge Result Message - displays for 5 seconds */}
      <ChallengeResultMessage message={challengeResultMessage} />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={closeAlert}
      />

      {/* Finish Turn Confirmation Modal */}
      <FinishTurnConfirmModal
        isOpen={showFinishTurnConfirm.isOpen}
        remainingKredcoin={showFinishTurnConfirm.remainingKredcoin}
        onCancel={handleCancelFinishTurn}
        onConfirm={handleConfirmFinishTurn}
      />

      {/* Bureaucracy Phase Transition Message */}
      <BureaucracyTransition isVisible={showBureaucracyTransition} />
    </div>
  );
};

export default App;
