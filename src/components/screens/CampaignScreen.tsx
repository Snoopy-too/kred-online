/**
 * CampaignScreen Component - Main game board and tile play UI
 *
 * Purpose: Renders the campaign phase of the game including:
 * - Game board with pieces and tiles
 * - Drag-and-drop piece movement
 * - Tile play mechanics
 * - Turn management and controls
 * - Game log and player information
 *
 * @module components/screens/CampaignScreen
 */

import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// TYPE IMPORTS - TypeScript interfaces and type definitions
// ============================================================================
import type {
  Tile,
  Player,
  GameState,
  Piece,
  BoardTile,
  TileReceivingSpace,
  TrackedMove,
  BureaucracyMenuItem,
  BureaucracyPurchase,
} from "../../types";

// ============================================================================
// CONFIGURATION IMPORTS - Static game configuration data
// ============================================================================
import {
  BOARD_IMAGE_URLS,
  TILE_SPACES_BY_PLAYER_COUNT,
  TILE_KREDCOIN_VALUES,
  CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT,
  PLAYER_PERSPECTIVE_ROTATIONS,
} from "../../config";

// ============================================================================
// UTILITY IMPORTS - Helper functions
// ============================================================================
import { calculatePieceRotation } from "../../utils/positioning";
import { findNearestVacantLocation, calculateMoves, validateTileRequirementsWithImpossibleMoveExceptions } from "../../game";
import { validatePieceMovement, areSeatsAdjacent } from "../../rules";
import {
  getBureaucracyMenu,
  getAvailablePurchases,
} from "../../game/bureaucracy";
import { getPlayerById, getPieceById } from "../../utils";
import LanguageModal from "../shared/LanguageModal";

// ============================================================================
// PROVIDER IMPORTS - State now lives in the provider tree
// ============================================================================
import { usePhase } from "../../providers/PhaseProvider";
import { useRoster } from "../../providers/RosterProvider";
import { useBoard } from "../../providers/BoardProvider";
import { useCampaign } from "../../providers/CampaignProvider";
import { useChallenge } from "../../providers/ChallengeProvider";
import { useCampaignHandlers } from "../../providers/HandlersProvider";

// ============================================================================
// CONSTANTS & THEMES
// ============================================================================

const PLAYER_COLORS: Record<number, { border: string; bg: string; text: string; draggingBorder: string; draggingBg: string; indicator: string; ring: string }> = {
  1: { 
    border: "border-amber-400/30", 
    bg: "bg-amber-500/5", 
    text: "text-amber-400/60",
    draggingBorder: "border-amber-400",
    draggingBg: "bg-amber-500/20",
    indicator: "text-amber-300",
    ring: "ring-amber-400/40"
  },
  2: { 
    border: "border-fuchsia-400/30", 
    bg: "bg-fuchsia-500/5", 
    text: "text-fuchsia-400/60",
    draggingBorder: "border-fuchsia-400",
    draggingBg: "bg-fuchsia-500/20",
    indicator: "text-fuchsia-300",
    ring: "ring-fuchsia-400/40"
  },
  3: { 
    border: "border-cyan-400/30", 
    bg: "bg-cyan-500/5", 
    text: "text-cyan-400/60",
    draggingBorder: "border-cyan-400",
    draggingBg: "bg-cyan-500/20",
    indicator: "text-cyan-300",
    ring: "ring-cyan-400/40"
  },
  4: { 
    border: "border-orange-400/30", 
    bg: "bg-orange-500/5", 
    text: "text-orange-400/60",
    draggingBorder: "border-orange-400",
    draggingBg: "bg-orange-500/20",
    indicator: "text-orange-300",
    ring: "ring-orange-400/40"
  },
  5: { 
    border: "border-emerald-400/30", 
    bg: "bg-emerald-500/5", 
    text: "text-emerald-400/60",
    draggingBorder: "border-emerald-400",
    draggingBg: "bg-emerald-500/20",
    indicator: "text-emerald-300",
    ring: "ring-emerald-400/40"
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface CampaignScreenHandlers {
  playerCount: number;
  currentPlayerId: number;
  playerIndex?: number; // Index of the player viewing this screen (multiplayer)
  isMultiplayer?: boolean; // Whether this is a multiplayer game
  lastDroppedPosition: { top: number; left: number } | null;
  lastDroppedPieceId: string | null;
  isTestMode: boolean;
  dummyTile: {
    position: { top: number; left: number };
    rotation: number;
  } | null;
  setDummyTile: (
    tile: { position: { top: number; left: number }; rotation: number } | null
  ) => void;
  boardRotationEnabled: boolean;
  setBoardRotationEnabled: (enabled: boolean) => void;
  showGridOverlay: boolean;
  setShowGridOverlay: (show: boolean) => void;
  matchingTileIds?: string[];
  gameLog: string[];
  onNewGame: () => void;
  onPieceMove: (
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ) => void;
  onBoardTileMove: (
    boardTileId: string,
    newPosition: { top: number; left: number }
  ) => void;
  onEndTurn: () => void;
  onPlaceTile: (tileId: number, targetSpace: TileReceivingSpace) => void;
  onRevealTile: (tileId: string | null) => void;
  onReceiverDecision: (decision: "accept" | "reject") => void;
  onBystanderDecision: (decision: "challenge" | "pass") => void;
  onTogglePrivateView: () => void;
  onContinueAfterChallenge: () => void;
  /** True when the local player is allowed to dismiss the challenge-reveal modal.
   *  Single-player → always true. Multiplayer → only the challenger.
   */
  challengeRevealCanContinue?: boolean;
  onPlacerViewTile: (tileId: string) => void;
  onSetGiveReceiverViewingTileId: (tileId: string | null) => void;
  onReceiverAcceptanceDecision?: (accepted: boolean) => void;
  onChallengerDecision?: (challenge: boolean) => void;
  onCorrectionComplete?: () => void;
  onReceiverRewardChoice?: (choice: 'credibility' | 'advance') => void;
  onCloseMoveCheckResult?: () => void;
  onCheckMove?: () => void;
  credibilityRotationAdjustments: { [playerId: number]: number };
  setCredibilityRotationAdjustments: (adjustments: {
    [playerId: number]: number;
  }) => void;
  isGameLogExpanded: boolean;
  setIsGameLogExpanded: (expanded: boolean) => void;
  isCredibilityAdjusterExpanded: boolean;
  setIsCredibilityAdjusterExpanded: (expanded: boolean) => void;
  isCredibilityRulesExpanded: boolean;
  setIsCredibilityRulesExpanded: (expanded: boolean) => void;
  isPieceTrackerExpanded: boolean;
  setIsPieceTrackerExpanded: (expanded: boolean) => void;
  onBonusMoveComplete: () => void;
  onResetTurn: () => void;
  onResetPiecesCorrection: () => void;
  onResetBonusMove: () => void;
  onTakeAdvantageDecline: () => void;
  onTakeAdvantageYes: () => void;
  onRecoverCredibility: () => void;
  onPurchaseMove: () => void;
  onToggleTileSelection: (tile: Tile) => void;
  onConfirmTileSelection: () => void;
  onCancelTileSelection: () => void;
  onSelectTakeAdvantageAction: (item: BureaucracyMenuItem) => void;
  onResetTakeAdvantageAction: () => void;
  onDoneTakeAdvantageAction: () => void;
  onTakeAdvantagePiecePromote: (pieceId: string) => void;
  campaignRole?: string | null;
}

const CampaignScreen: React.FC = () => {
  const {
    playerCount,
    currentPlayerId,
    playerIndex,
    isMultiplayer = false,
    lastDroppedPosition,
    lastDroppedPieceId,
    isTestMode,
    dummyTile,
    setDummyTile,
    boardRotationEnabled,
    setBoardRotationEnabled,
    showGridOverlay,
    setShowGridOverlay,
    matchingTileIds = [],
    gameLog,
    onNewGame,
    onPieceMove,
    onBoardTileMove,
    onEndTurn,
    onPlaceTile,
    onRevealTile,
    onReceiverDecision,
    onBystanderDecision,
    onTogglePrivateView,
    onContinueAfterChallenge,
    challengeRevealCanContinue = true,
    onPlacerViewTile,
    onSetGiveReceiverViewingTileId,
    onReceiverAcceptanceDecision,
    onChallengerDecision,
    onCorrectionComplete,
    onReceiverRewardChoice,
    onCloseMoveCheckResult,
    onCheckMove,
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
    onBonusMoveComplete,
    onResetTurn,
    onResetPiecesCorrection,
    onResetBonusMove,
    onTakeAdvantageDecline,
    onTakeAdvantageYes,
    onRecoverCredibility,
    onPurchaseMove,
    onToggleTileSelection,
    onConfirmTileSelection,
    onCancelTileSelection,
    onSelectTakeAdvantageAction,
    onResetTakeAdvantageAction,
    onDoneTakeAdvantageAction,
    onTakeAdvantagePiecePromote,
    campaignRole: campaignRoleFromHandlers,
  } = useCampaignHandlers<CampaignScreenHandlers>();
  // ============================================================================
  // PROVIDER HOOKS — migrated state now lives in the provider tree
  // ============================================================================
  const { gameState, currentPlayerIndex, moverPlayerIndex, campaignRole: phaseCampaignRole } = usePhase();
  const campaignRole = campaignRoleFromHandlers ?? phaseCampaignRole;
  const { players, pieces } = useRoster();
  const { boardTiles, bankedTiles } = useBoard();
  const campaign = useCampaign();
  const {
    hasPlayedTileThisTurn,
    movedPiecesThisTurn,
    tileTransaction,
    tileRevealed,
    pendingReceiverReward,
    receiverAdvanceInProgress,
    revealedTileId,
    giveReceiverViewingTileId,
    receiverAcceptance,
    showPerfectTileModal,
    showBonusMoveModal,
    bonusMovePlayerId,
  } = campaign;
  // Cast: runtime value carries extra fields (piecesAfterMoves, tile) not declared
  // on the canonical PlayedTileState. Flagged in HANDOFF_2026-04-21 for Step 8 cleanup.
  const playedTile = campaign.playedTile as any;
  const challenge = useChallenge();
  const {
    bystanders,
    bystanderIndex,
    tileRejected,
    isPrivatelyViewing,
    showChallengeRevealModal,
    challengedTile,
    placerViewingTileId,
    showMoveCheckResult,
    moveCheckResult,
    showTakeAdvantageModal,
    takeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    showTakeAdvantageTileSelection,
    selectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    showTakeAdvantageMenu,
    takeAdvantagePurchase,
    takeAdvantageValidationError,
  } = challenge;


  // ============================================================================
  // STATE HOOKS
  // ============================================================================

  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isDraggingTile, setIsDraggingTile] = useState(false);
  const [boardMousePosition, setBoardMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draggedPieceInfo, setDraggedPieceInfo] = useState<{
    name: string;
    imageUrl: string;
    pieceId: string;
    locationId?: string;
  } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    position: { top: number; left: number };
    rotation: number;
    name: string;
    imageUrl: string;
    isValid?: boolean;
  } | null>(null);

  // ============================================================================
  // DERIVED STATE & CALCULATIONS
  // ============================================================================
  // In multiplayer, each player's board is rotated to their perspective (stationary)
  // In test mode, board rotates with current player turn
  const boardRotation = boardRotationEnabled
    ? (isMultiplayer && playerIndex !== undefined
      ? PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[playerIndex + 1] ?? 0
      : PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0)
    : 0;

  const tileSpaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
  const occupiedOwnerIds = new Set(boardTiles.map((bt) => bt.ownerId));
  const unoccupiedSpaces = tileSpaces.filter(
    (space) => !occupiedOwnerIds.has(space.ownerId)
  );

  const logContainerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [gameLog]);

  useEffect(() => {
    const updateZoom = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Calculate scale to fit 960px height and 1100px width min boundaries
      if (vh > 0 && vw > 0) {
        setZoomScale(Math.min(1, vh / 960, vw / 1100));
      } else {
        setZoomScale(1);
      }
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Calculate Kredcoin for a player (only face-down tiles in bank count)
   */
  const calculatePlayerKredcoin = (playerId: number): number => {
    const playerBankedTiles = bankedTiles.filter(
      (bt) => bt.ownerId === playerId && !bt.faceUp
    );
    return playerBankedTiles.reduce((total, bankedTile) => {
      const tileValue = TILE_KREDCOIN_VALUES[bankedTile.tile.id] || 0;
      return total + tileValue;
    }, 0);
  };

  /**
   * Track mouse position on board (test mode only)
   */
  const handleMouseMoveOnBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTestMode) return;
    const boardRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setBoardMousePosition({ x: clampedX, y: clampedY });
  };

  /**
   * Clear mouse position when leaving board
   */
  const handleMouseLeaveBoard = () => {
    if (isTestMode) {
      setBoardMousePosition(null);
    }
    setDropIndicator(null);
  };

  /**
   * Basic drag over handler
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /**
   * Handle drag over board with snap indicator
   */
  const handleDragOverBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedPieceInfo) {
      if (dropIndicator) setDropIndicator(null);
      return;
    }

    const boardRect = e.currentTarget.getBoundingClientRect();
    const rawLeft = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const rawTop = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    let left = rawLeft;
    let top = rawTop;
    if (boardRotation !== 0) {
      const angleRad = -boardRotation * (Math.PI / 180);
      const centerX = 50;
      const centerY = 50;
      const translatedX = rawLeft - centerX;
      const translatedY = rawTop - centerY;
      const rotatedX =
        translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
      const rotatedY =
        translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
      left = rotatedX + centerX;
      top = rotatedY + centerY;
    }

    const snappedLocation = findNearestVacantLocation(
      { top, left },
      pieces,
      playerCount
    );

    if (snappedLocation) {
      const newRotation = calculatePieceRotation(
        snappedLocation.position,
        playerCount,
        snappedLocation.id
      );

      // Validate if the move is allowed
      const validation = validatePieceMovement(
        draggedPieceInfo.pieceId,
        draggedPieceInfo.locationId,
        snappedLocation.id,
        currentPlayerId,
        pieces
      );

      if (
        !dropIndicator ||
        dropIndicator.position.top !== snappedLocation.position.top ||
        dropIndicator.position.left !== snappedLocation.position.left
      ) {
        setDropIndicator({
          position: snappedLocation.position,
          rotation: newRotation,
          name: draggedPieceInfo.name,
          imageUrl: draggedPieceInfo.imageUrl,
          isValid: validation.isAllowed,
        });
      }
    } else {
      if (dropIndicator) setDropIndicator(null);
    }
  };

  /**
   * Handle drop on board (pieces, tiles, dummy tile)
   */
  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicator(null);
    const boardTileId = e.dataTransfer.getData("boardTileId");
    const pieceId = e.dataTransfer.getData("pieceId") || draggedPieceInfo?.pieceId;
    const tileIdStr = e.dataTransfer.getData("tileId");
    const isDummyTile = e.dataTransfer.getData("dummyTile");

    const boardRect = e.currentTarget.getBoundingClientRect();
    const rawLeft = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const rawTop = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    let left = rawLeft;
    let top = rawTop;
    if (boardRotation !== 0) {
      const angleRad = -boardRotation * (Math.PI / 180);
      const centerX = 50;
      const centerY = 50;
      const translatedX = rawLeft - centerX;
      const translatedY = rawTop - centerY;
      const rotatedX =
        translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
      const rotatedY =
        translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
      left = rotatedX + centerX;
      top = rotatedY + centerY;
    }

    // Handle dummy tile drops
    if (isDummyTile && dummyTile) {
      setDummyTile({
        position: { top, left },
        rotation: dummyTile.rotation,
      });
      return;
    }

    if (boardTileId && isTestMode) {
      onBoardTileMove(boardTileId, { top, left });
      return;
    }

    // Free placement mode: allow tiles to be placed anywhere without snapping
    if (tileIdStr && !hasPlayedTileThisTurn) {
      const currentPlayer = getPlayerById(players, currentPlayerId);
      if (currentPlayer) {
        const freeTileSpace: TileReceivingSpace = {
          ownerId: currentPlayerId,
          position: { left, top },
          rotation: 0,
        };
        onPlaceTile(parseInt(tileIdStr, 10), freeTileSpace);
        return;
      }
    }

    // Regular piece placement with snapping
    const snappedLocation = findNearestVacantLocation(
      { top, left },
      pieces,
      playerCount
    );

    if (snappedLocation && pieceId) {
      onPieceMove(pieceId, snappedLocation.position, snappedLocation.id);
    }
  };

  /**
   * Handle drop on designated tile space
   */
  const handleDropOnTileSpace = (
    e: React.DragEvent<HTMLDivElement>,
    space?: TileReceivingSpace
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const tileIdStr = e.dataTransfer.getData("tileId");
    if (tileIdStr && !hasPlayedTileThisTurn && space) {
      // Normal mode: drop on fixed tile space
      onPlaceTile(parseInt(tileIdStr, 10), space);
    }
  };

  /**
   * Handle starting to drag a piece
   */
  const handleDragStartPiece = (
    e: React.DragEvent<HTMLImageElement>,
    pieceId: string
  ) => {
    e.dataTransfer.setData("pieceId", pieceId);
    e.dataTransfer.effectAllowed = "move";
    const piece = getPieceById(pieces, pieceId);
    if (piece) {
      setDraggedPieceInfo({
        name: piece.name,
        imageUrl: piece.imageUrl,
        pieceId: piece.id,
        locationId: piece.locationId,
      });
    }
  };

  /**
   * Handle ending piece drag
   */
  const handleDragEndPiece = () => {
    setDraggedPieceInfo(null);
    setDropIndicator(null);
  };

  /**
   * Handle starting to drag a tile from hand
   */
  const handleDragStartTile = (
    e: React.DragEvent<HTMLDivElement>,
    tileId: number
  ) => {
    e.dataTransfer.setData("tileId", tileId.toString());
    e.dataTransfer.effectAllowed = "move";
    setIsDraggingTile(true);
  };

  /**
   * Handle starting to drag a board tile (test mode)
   */
  const handleDragStartBoardTile = (
    e: React.DragEvent<HTMLDivElement>,
    boardTileId: string
  ) => {
    e.dataTransfer.setData("boardTileId", boardTileId);
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Handle starting to drag dummy tile (test mode)
   */
  const handleDragStartDummyTile = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("dummyTile", "true");
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Handle ending dummy tile drag
   */
  const handleDragEndDummyTile = () => {
    setDropIndicator(null);
  };

  /**
   * Rotate dummy tile (test mode)
   */
  const handleRotateDummyTile = (degrees: number) => {
    if (dummyTile) {
      setDummyTile({
        ...dummyTile,
        rotation: (dummyTile.rotation + degrees) % 360,
      });
    }
  };

  // ============================================================================
  // COMPUTED VALUES FOR RENDERING
  // ============================================================================
  const currentPlayer = getPlayerById(players, currentPlayerId);

  // Helper to get player name by ID
  const nameById = (id: number | undefined | null): string => {
    if (id === undefined || id === null) return 'Unknown';
    const p = players.find(pl => pl.id === id);
    return p?.name || `Player ${id}`;
  };
  // Helper to get player name by index
  const nameByIndex = (idx: number | undefined | null): string => {
    if (idx === undefined || idx === null) return 'Unknown';
    return players[idx]?.name || `Player ${idx + 1}`;
  };

  // In multiplayer, determine which player's hand to show (viewer's hand)
  // playerIndex is 0-based, player.id is 1-based, so we find by id
  const viewingPlayer = isMultiplayer && playerIndex !== undefined
    ? players.find(p => p.id === playerIndex + 1) || currentPlayer
    : currentPlayer;

  // Debug logging for multiplayer hand visibility
  console.log('[CAMPAIGN] Hand visibility:', {
    isMultiplayer,
    playerIndex,
    lookingForPlayerId: playerIndex !== undefined ? playerIndex + 1 : 'N/A',
    currentPlayerId,
    viewingPlayerId: viewingPlayer?.id,
    viewingPlayerName: viewingPlayer?.name,
    viewingPlayerHandSize: viewingPlayer?.hand?.length || 0,
    allPlayers: players.map(p => ({ id: p.id, name: p.name, handSize: p.hand?.length || 0 }))
  });

  // Check if it's the viewing player's turn to act
  // In test mode (single-player), allow controlling all players
  // In multiplayer, use the server-assigned campaignRole for precise control
  const isMyTurn = playerIndex !== undefined && playerIndex === currentPlayerIndex;
  
  // Use campaignRole from server to determine what this player can do
  const isMover = campaignRole === 'mover';
  const isReceiver = campaignRole === 'receiver';
  const isChallenger = (campaignRole === 'challenger' || campaignRole === 'takeAdvantageChallenger');
  const isBonusMover = campaignRole === 'bonusMover';
  const isCorrecting = campaignRole === 'correcting';
  const isFreeAdvancer = campaignRole === 'freeAdvance';
  const isWaiting = campaignRole === 'waiting' || campaignRole === 'bystander';

  // Check if it's the current player's turn for a decision (accept/reject or challenge)
  const isMyTurnForDecision =
    (isReceiver && gameState === "PENDING_ACCEPTANCE") ||
    (isChallenger && gameState === "PENDING_CHALLENGE");

  // Check if the mover's moves match the played tile (for receiver decision UI)
  const movesMatchTile = React.useMemo(() => {
    if (!playedTile?.originalPieces || !playedTile?.tileId) {
      console.log('[MOVESMATCH] Early return false - originalPieces:', !!playedTile?.originalPieces, 'tileId:', playedTile?.tileId);
      return false;
    }
    try {
      const origPieces = playedTile.originalPieces;
      const afterPieces = playedTile.piecesAfterMoves || pieces;
      console.log('[MOVESMATCH] tileId:', playedTile.tileId, 'playerId:', playedTile.playerId);
      console.log('[MOVESMATCH] originalPieces count:', origPieces.length, 'afterPieces count:', afterPieces.length);
      console.log('[MOVESMATCH] piecesAfterMoves exists:', !!playedTile.piecesAfterMoves, 'using fallback pieces:', !playedTile.piecesAfterMoves);
      const calculatedMoves = calculateMoves(
        origPieces,
        afterPieces,
        playedTile.playerId,
        playerCount,
        areSeatsAdjacent
      );
      console.log('[MOVESMATCH] calculatedMoves:', calculatedMoves.map(m => ({ type: m.moveType, from: m.fromLocationId, to: m.toLocationId, piece: m.pieceId })));
      const result = validateTileRequirementsWithImpossibleMoveExceptions(
        playedTile.tileId,
        calculatedMoves,
        playedTile.playerId,
        origPieces,
        afterPieces,
        players,
        playerCount
      );
      console.log('[MOVESMATCH] result:', JSON.stringify(result));
      return result.isMet;
    } catch (e) {
      console.error('[MOVESMATCH] Error:', e);
      return false;
    }
  }, [playedTile, pieces, players, playerCount]);

  const showWaitingOverlay =
    isWaiting &&
    (gameState === "PENDING_ACCEPTANCE" || 
     gameState === "PENDING_CHALLENGE" || 
     gameState === "TAKE_ADVANTAGE" ||
     gameState === "BONUS_MOVE");

  let waitingMessage = "";
  let waitingPlayerId = undefined;
  if (showWaitingOverlay) {
    if (gameState === "PENDING_ACCEPTANCE") {
      waitingPlayerId =
        playedTile?.receivingPlayerId || tileTransaction?.receiverId;
      waitingMessage = `Waiting for ${nameById(waitingPlayerId)} to respond...`;
    } else if (gameState === "PENDING_CHALLENGE") {
      waitingPlayerId = bystanders[bystanderIndex]?.id;
      waitingMessage = `Waiting for ${nameById(waitingPlayerId)} to respond...`;
    } else if (gameState === "TAKE_ADVANTAGE") {
      // Find who the challenger is
      waitingPlayerId = takeAdvantageChallengerId;
      waitingMessage = `Waiting for ${nameById(waitingPlayerId)} to choose a reward...`;
    } else if (gameState === "BONUS_MOVE") {
      waitingPlayerId = bonusMovePlayerId;
      waitingMessage = `Waiting for ${nameById(waitingPlayerId)} to complete bonus move...`;
    }
  }
  
  // Role banner
  const getRoleBanner = (): { text: string; color: string } | null => {
    switch (campaignRole) {
      case 'mover': {
        const receiverName = nameById(playedTile?.receivingPlayerId || tileTransaction?.receiverId);
        if (gameState === 'PENDING_ACCEPTANCE') {
          return { text: `Waiting for ${receiverName} to respond...`, color: 'bg-yellow-600' };
        }
        if (gameState === 'PENDING_CHALLENGE') {
          return { text: `Waiting for challenger to respond...`, color: 'bg-yellow-600' };
        }
        return hasPlayedTileThisTurn
          ? { text: `Tile played — click 'End Turn' to finalize.`, color: 'bg-yellow-600' }
          : { text: 'Move pieces and pass a tile.', color: 'bg-green-700' };
      }
      case 'receiver':
        return { text: 'You received a tile — Accept or Blow Whistle?', color: 'bg-blue-700' };
      case 'challenger':
        return { text: 'Your turn to Challenge or Pass', color: 'bg-orange-700' };
      case 'correcting':
        return { text: 'Make the correct play as shown on the tile', color: 'bg-red-700' };
      case 'freeAdvance':
        return { text: 'Make your free Advance move!', color: 'bg-green-700' };
      case 'bystander':
      case 'waiting':
      default:
        if (gameState === 'PENDING_ACCEPTANCE') {
          const receiverName = nameById(playedTile?.receivingPlayerId || tileTransaction?.receiverId);
          return { text: `Waiting for ${receiverName} to respond...`, color: 'bg-yellow-600' };
        }
        if (gameState === 'PENDING_CHALLENGE') {
          const challengerName = bystanders[bystanderIndex]?.id ? nameById(bystanders[bystanderIndex].id) : 'challenger';
          return { text: `Waiting for ${challengerName} to respond...`, color: 'bg-yellow-600' };
        }
        if (gameState === 'CAMPAIGN') {
          const moverIdx = moverPlayerIndex ?? currentPlayerIndex;
          const moverName = nameByIndex(moverIdx);
          return { text: `${moverName} is moving pieces...`, color: 'bg-gray-800' };
        }
        if (gameState === 'CORRECTION_REQUIRED' && receiverAdvanceInProgress) {
          return { text: `Waiting for ${nameByIndex(currentPlayerIndex)} to make free Advance...`, color: 'bg-gray-800' };
        }
        return { text: 'Waiting...', color: 'bg-gray-800' };
    }
  };
  const roleBanner = getRoleBanner();

  let indicatorSizeClass = "";
  if (dropIndicator) {
    if (dropIndicator.name === "Heel")
      indicatorSizeClass = "w-14 h-14 sm:w-16 sm:h-16";
    else if (dropIndicator.name === "Pawn")
      indicatorSizeClass = "w-16 h-16 sm:w-20 sm:h-20";
    else indicatorSizeClass = "w-10 h-10 sm:w-14 sm:h-14"; // Mark
  }
  const indicatorScaleStyle = dropIndicator ? { transform: "scale(0.84)" } : {};

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <main id="campaign-screen" className="min-h-screen w-full bg-[#808080] flex flex-col items-center justify-start pt-2 pr-2 sm:pt-3 sm:pr-3 lg:pt-4 lg:pr-4 font-sans">
      <div id="campaign-layout-container" className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-start lg:gap-8" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}>
        {/* Main Content (Board, Hand, etc.) */}
        <div
          id="campaign-main-content"
          className="flex-1 flex flex-col items-start min-w-0 overflow-visible"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 100%",
            marginLeft: playerCount === 3 ? "-75px" : playerCount === 4 ? "-50px" : "-40px",
            marginTop: playerCount === 3 ? "-75px" : playerCount === 4 ? "-50px" : "-40px",
          }}
        >
          {/* Game Board */}
          <div
            id="campaign-game-board"
            className="w-full max-w-5xl aspect-[1/1] transition-transform duration-700 ease-in-out relative"
            onDragOver={handleDragOverBoard}
            onDrop={handleDropOnBoard}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onRevealTile(null);
              }
            }}
            onMouseMove={handleMouseMoveOnBoard}
            onMouseLeave={handleMouseLeaveBoard}
            style={{
              transform: `rotate(${boardRotation}deg)`,
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              transition: isMultiplayer ? "none" : "transform 0.7s ease-in-out",
            }}
          >
            {/* Board Image */}
            <img
              src={BOARD_IMAGE_URLS[playerCount]}
              alt={`A ${playerCount}-player game board`}
              className="w-full h-full object-contain relative z-0"
              style={playerCount === 4 ? { transform: "translateY(2.5%)" } : undefined}
            />

            {/* Grid Overlay */}
            {showGridOverlay && (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: "2% 2%",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 text-white/50 text-[8px] sm:text-xs pointer-events-none z-20"
                  aria-hidden="true"
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`x-${i}`}
                      className="absolute"
                      style={{
                        left: `${(i + 1) * 10}%`,
                        top: "0.5%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      {(i + 1) * 10}
                    </div>
                  ))}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`y-${i}`}
                      className="absolute"
                      style={{
                        top: `${(i + 1) * 10}%`,
                        left: "0.5%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {(i + 1) * 10}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Test Mode Coordinates */}
            {isTestMode && boardMousePosition && (
              <div
                className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs p-2 rounded-md pointer-events-none shadow-lg backdrop-blur-sm z-10"
                style={{
                  transform: `rotate(${-boardRotation}deg) translateZ(0)`,
                }}
                aria-hidden="true"
              >
                <p className="font-mono">
                  X: {boardMousePosition.x.toFixed(2)}%
                </p>
                <p className="font-mono">
                  Y: {boardMousePosition.y.toFixed(2)}%
                </p>
              </div>
            )}

            {/* Drop Indicator */}
            {dropIndicator && (
              <>
                {/* Soft glow indicator showing snap location - green for valid, red for invalid */}
                <div
                  className="absolute pointer-events-none transition-all duration-100 ease-in-out rounded-full"
                  style={{
                    top: `${dropIndicator.position.top}%`,
                    left: `${dropIndicator.position.left}%`,
                    width: "80px",
                    height: "80px",
                    transform: "translate(-50%, -50%)",
                    backgroundColor:
                      dropIndicator.isValid === false
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(34, 197, 94, 0.3)",
                    boxShadow:
                      dropIndicator.isValid === false
                        ? "0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2)"
                        : "0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)",
                    border:
                      dropIndicator.isValid === false
                        ? "2px solid rgba(239, 68, 68, 0.6)"
                        : "2px solid rgba(34, 197, 94, 0.6)",
                  }}
                  aria-hidden="true"
                />
                {/* Drop indicator piece preview */}
                <div
                  className={`${indicatorSizeClass} absolute pointer-events-none transition-all duration-100 ease-in-out`}
                  style={{
                    top: `${dropIndicator.position.top}%`,
                    left: `${dropIndicator.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${dropIndicator.rotation}deg) scale(0.798)`,
                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))",
                    opacity: 0.7,
                  }}
                  aria-hidden="true"
                >
                  <img
                    src={dropIndicator.imageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              </>
            )}

            {/* Tile Receiving Spaces */}
            {unoccupiedSpaces.map((space) => {
              const colors = PLAYER_COLORS[space.ownerId] || PLAYER_COLORS[1];
              const playerName = nameById(space.ownerId);
              
              return (
                <div
                  key={`space-${space.ownerId}`}
                  onDrop={(e) => handleDropOnTileSpace(e, space)}
                  onDragOver={handleDragOver}
                  className={`absolute w-12 h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-center transition-all duration-300
                    ${isDraggingTile
                      ? `${colors.draggingBorder} ${colors.draggingBg} scale-105 border-solid shadow-lg`
                      : `${colors.border} ${colors.bg}`
                    }`}
                  style={{
                    top: `${space.position.top}%`,
                    left: `${space.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${space.rotation}deg)`,
                  }}
                >
                  <div
                    style={{
                      transform: `rotate(${-space.rotation - boardRotation}deg)`,
                    }}
                    className={`font-bold text-[10px] leading-tight transition-colors duration-300 ${
                      isDraggingTile ? colors.indicator : colors.text
                    }`}
                  >
                    <div className="uppercase tracking-tighter opacity-60 leading-none scale-90 mb-0.5">Pass to</div>
                    <div className="text-[13px] font-black uppercase leading-tight truncate px-1" title={playerName}>{playerName}</div>
                  </div>
                </div>
              );
            })}

            {/* Board Tiles */}
            {boardTiles.map((boardTile) => {
              const isPlacer = boardTile.placerId === currentPlayerId;
              const isTransactionalTile =
                boardTile.id === tileTransaction?.boardTileId;
              const isReceiver =
                currentPlayerId === tileTransaction?.receiverId;
              const isPubliclyRevealed = revealedTileId === boardTile.id;

              // NEW WORKFLOW: Check if this tile is being played (in TILE_PLAYED or PENDING_ACCEPTANCE state)
              const isPlayedTile =
                playedTile &&
                boardTile.tile.id.toString().padStart(2, "0") ===
                playedTile.tileId &&
                boardTile.placerId === playedTile.playerId &&
                boardTile.ownerId === playedTile.receivingPlayerId;
              const isTilePlayedButNotYetAccepted =
                isPlayedTile &&
                (gameState === "TILE_PLAYED" ||
                  gameState === "PENDING_ACCEPTANCE" ||
                  gameState === "CORRECTION_REQUIRED");

              // Receiver's private view logic (during PENDING_ACCEPTANCE)
              const showReceiverPrivateView =
                isPrivatelyViewing && isTransactionalTile && isReceiver;

              // Placer's private view logic (during CAMPAIGN, before ending turn)
              const canPlacerClickToView =
                isPlacer && isTransactionalTile && gameState === "CAMPAIGN";
              const showPlacerPrivateView =
                placerViewingTileId === boardTile.id;

              // Only receiver can view the tile (if they have credibility)
              // Only receiver or placer can view the tile
              const isGiverOrReceiver =
                isPlayedTile && (currentPlayerId === playedTile.receivingPlayerId || isPlacer);
              const currentPlayer = players.find(
                (p) => p.id === currentPlayerId
              );
              const currentPlayerCredibility = currentPlayer?.credibility ?? 3;
              // Players with 0 credibility cannot view received tiles
              const receiverCanViewTile = currentPlayerCredibility > 0;
              const canGiverReceiverToggleView =
                isTilePlayedButNotYetAccepted &&
                isGiverOrReceiver &&
                (isPlacer || receiverCanViewTile);
              const showGiverReceiverView =
                canGiverReceiverToggleView &&
                giveReceiverViewingTileId === boardTile.id;

              // CORRECTION_REQUIRED: Automatically show tile face-up for placer to see requirements
              const showCorrectionView =
                isPlayedTile && gameState === "CORRECTION_REQUIRED" && isPlacer;

              // Tile is publicly revealed after expose or successful challenge
              const showExposedView =
                isPlayedTile && tileRevealed && boardTile.tile?.url;

              const isRevealed =
                isPubliclyRevealed ||
                showReceiverPrivateView ||
                showPlacerPrivateView ||
                showGiverReceiverView ||
                showCorrectionView ||
                showExposedView;

              // During tile play workflow, show white back unless it's being viewed
              // Don't show white back if the tile has been exposed/challenged or is in correction mode
              const shouldShowWhiteBack =
                isTilePlayedButNotYetAccepted && !showGiverReceiverView && !showExposedView && !showCorrectionView;

              const handleTileClick = () => {
                if (canPlacerClickToView) {
                  onPlacerViewTile(boardTile.id);
                } else if (canGiverReceiverToggleView) {
                  onSetGiveReceiverViewingTileId(
                    giveReceiverViewingTileId === boardTile.id
                      ? null
                      : boardTile.id
                  );
                }
              };

              const isTileClickable =
                canPlacerClickToView || canGiverReceiverToggleView;

              return (
                <div
                  key={boardTile.id}
                  draggable={
                    isTestMode && !isTransactionalTile && !isPlayedTile
                  }
                  onDragStart={
                    isTestMode && !isTransactionalTile && !isPlayedTile
                      ? (e) => handleDragStartBoardTile(e, boardTile.id)
                      : undefined
                  }
                  onClick={isTileClickable ? handleTileClick : undefined}
                  className={`absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 bg-stone-100 p-1 border-2 ${
                    PLAYER_COLORS[boardTile.ownerId]?.border || "border-gray-200"
                  } ${isPlayedTile ? "ring-2 " + (PLAYER_COLORS[boardTile.ownerId]?.ring || "") : ""}`}
                  style={{
                    top: `${boardTile.position.top}%`,
                    left: `${boardTile.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${boardTile.rotation || 0
                      }deg)`,
                    cursor: isTileClickable ? "pointer" : "default",
                  }}
                  aria-label={
                    isTileClickable
                      ? "Click to toggle tile visibility"
                      : "A placed, face-down tile"
                  }
                >
                  {shouldShowWhiteBack ? (
                    // Show white back for tile in play
                    <div className="w-full h-full bg-white rounded-lg border-2 border-gray-400 shadow-inner"></div>
                  ) : !isRevealed ? (
                    // Show white back for face-down tiles
                    <div className="w-full h-full bg-white rounded-lg border-2 border-gray-300 shadow-inner"></div>
                  ) : (
                    // Show tile face for revealed tiles
                    <img
                      src={boardTile.tile.url}
                      alt={`Tile ${boardTile.tile.id}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              );
            })}

            {/* Banked Tiles */}
            {bankedTiles.map((bankedTile) => (
              <div
                key={bankedTile.id}
                className={`absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 bg-stone-100 p-1 border-2 ${
                  PLAYER_COLORS[bankedTile.ownerId]?.border || "border-gray-200"
                }`}
                style={{
                  top: `${bankedTile.position.top}%`,
                  left: `${bankedTile.position.left}%`,
                  transform: `translate(-50%, -50%) rotate(${bankedTile.rotation || 0
                    }deg)`,
                }}
              >
                {bankedTile.faceUp ? (
                  // Rejected tile - face up
                  <img
                    src={bankedTile.tile.url}
                    alt={`Banked Tile ${bankedTile.tile.id}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // Accepted tile - face down (white back)
                  <div className="w-full h-full bg-white rounded-lg border-2 border-white shadow-inner"></div>
                )}
              </div>
            ))}

            {/* Credibility Display */}
            {(() => {
              const credibilityLocations =
                CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount] || [];
              return credibilityLocations.map((location) => {
                const player = getPlayerById(players, location.ownerId);
                const credibilityValue = player?.credibility ?? 3;
                const adjustment =
                  credibilityRotationAdjustments[location.ownerId] || 0;
                const finalRotation = (location.rotation || 0) + adjustment;
                const credibilityImage = `./images/${credibilityValue}_credibility.svg`;

                return (
                  <div
                    key={`credibility_${location.ownerId}_${credibilityValue}`}
                    className="absolute rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                    style={{
                      width: "5.283rem",
                      height: "5.283rem",
                      top: `${location.position.top}%`,
                      left: `${location.position.left}%`,
                      transform: `translate(-50%, -50%) rotate(${finalRotation}deg)`,
                    }}
                  >
                    <img
                      src={credibilityImage}
                      alt={`Credibility for Player ${location.ownerId}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
              });
            })()}

            {/* Pieces */}
            {pieces.map((piece) => {
              let pieceSizeClass = "w-10 h-10 sm:w-14 sm:h-14"; // Mark
              if (piece.name === "Heel")
                pieceSizeClass = "w-14 h-14 sm:w-16 sm:h-16";
              if (piece.name === "Pawn")
                pieceSizeClass = "w-16 h-16 sm:w-20 sm:h-20";

              // Apply size reduction for different player counts
              const scaleMultiplier =
                playerCount === 3 ? 0.85 : playerCount === 5 ? 0.9 : 1;
              const baseScale = 0.798;
              
              // Scale down pieces in community for 3 and 4 player modes to avoid overlap
              const isInCommunity = piece.locationId?.startsWith("community") || false;
              const communityScale = (playerCount === 3 || playerCount === 4) && isInCommunity ? 0.8 : 1;
              
              const finalScale = baseScale * scaleMultiplier * communityScale;

              // For pieces in community locations, apply inverse board rotation to counteract the board's perspective rotation
              // Check both position AND locationId to avoid false positives for seats near the community

              // Prevent moving Heels until Marks are gone, and Pawns until Heels/Marks are gone.
              // Pieces returned to the community during the current turn are "pending" and
              // don't count until the turn is fully resolved.
              let isRestrictedCommunityPiece = false;
              if (isInCommunity) {
                const markCount = pieces.filter((p) => p.locationId?.startsWith("community") && p.name === "Mark" && !movedPiecesThisTurn.has(p.id)).length;
                const heelCount = pieces.filter((p) => p.locationId?.startsWith("community") && p.name === "Heel" && !movedPiecesThisTurn.has(p.id)).length;
                if (piece.name === "Heel" && markCount > 0) isRestrictedCommunityPiece = true;
                if (piece.name === "Pawn" && (markCount > 0 || heelCount > 0)) isRestrictedCommunityPiece = true;
              }
              
              const communityCounterRotation = isInCommunity
                ? -boardRotation
                : 0;

              // Check if this piece has been moved this turn
              const hasMoved = movedPiecesThisTurn.has(piece.id);

              // Only allow dragging pieces for:
              // - Mover during CAMPAIGN phase (before tile played)
              // - Correcting player during CORRECTION_REQUIRED
              // - Receiver making their free Advance move
              const canDragPiece = 
                !isRestrictedCommunityPiece &&
                ((isMover && gameState === 'CAMPAIGN' && !hasPlayedTileThisTurn) || 
                (isCorrecting && gameState === 'CORRECTION_REQUIRED') ||
                (isFreeAdvancer && gameState === 'CORRECTION_REQUIRED') ||
                (isBonusMover && gameState === 'BONUS_MOVE') ||
                (isChallenger && gameState === 'TAKE_ADVANTAGE'));

              return (
                <img
                  key={piece.id}
                  src={piece.imageUrl}
                  alt={piece.name}
                  draggable={canDragPiece}
                  onDragStart={(e) => handleDragStartPiece(e, piece.id)}
                  onDragEnd={handleDragEndPiece}
                  className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out ${hasMoved
                      ? "ring-4 ring-amber-400 ring-opacity-70 rounded-full"
                      : ""
                    } ${isRestrictedCommunityPiece ? "opacity-40 grayscale" : ""}`}
                  style={{
                    position: "absolute",
                    top: `${piece.position.top}%`,
                    left: `${piece.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${piece.rotation + communityCounterRotation
                      }deg) scale(${finalScale})`,
                    cursor: "grab",
                    filter: hasMoved
                      ? "brightness(1.2) drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))"
                      : undefined,
                  }}
                  aria-hidden="true"
                />
              );
            })}

            {/* Dummy Tile (Test Mode) */}
            {isTestMode && dummyTile && (
              <div
                draggable
                onDragStart={handleDragStartDummyTile}
                onDragEnd={handleDragEndDummyTile}
                className="absolute w-12 h-24 rounded-lg shadow-xl bg-indigo-500/30 border-2 border-indigo-400 border-dashed"
                style={{
                  top: `${dummyTile.position.top}%`,
                  left: `${dummyTile.position.left}%`,
                  transform: `translate(-50%, -50%) rotate(${dummyTile.rotation}deg)`,
                  cursor: "grab",
                }}
                aria-label="Dummy tile"
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs pointer-events-none">
                  D
                </div>
              </div>
            )}

            {/* More content will be added in next sub-phases */}
          </div>

          {/* Test Mode: Other Players */}
          {isTestMode && (
            <div id="campaign-test-other-players" className="w-full max-w-5xl mt-4">
              <h3 className="text-xl font-bold text-center text-slate-300 mb-2">
                Other Players (Test Mode)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players
                  .filter((p) => p.id !== currentPlayerId)
                  .map((player) => {
                    // In multiplayer, hide opponent hands (show only your own tiles)
                    const isOwnHand = !isMultiplayer || (playerIndex !== undefined && player.id === playerIndex + 1);
                    const showTiles = isTestMode || isOwnHand;

                    return (
                      <details
                        key={player.id}
                        className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 cursor-pointer"
                      >
                        <summary className="font-semibold text-lg text-slate-100">
                          {isOwnHand ? `Your Tiles (${player.keptTiles.length})` : `${nameById(player.id)}'s Tiles (${player.keptTiles.length})`}
                        </summary>
                        <div className="mt-4">
                          <h4 className="font-semibold text-md text-slate-300">
                            Playable Hand:
                          </h4>
                          <div className="flex flex-wrap justify-center gap-2 pt-2">
                            {showTiles ? (
                              player.keptTiles.map((tile) => (
                                <div
                                  key={tile.id}
                                  className="bg-stone-100 w-12 h-24 p-1 rounded-md shadow-md border border-gray-300"
                                >
                                  <img
                                    src={tile.url}
                                    alt={`Tile ${tile.id}`}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ))
                            ) : (
                              player.keptTiles.map((tile) => (
                                <div
                                  key={tile.id}
                                  className="bg-gradient-to-br from-purple-900 to-indigo-900 w-12 h-24 p-1 rounded-md shadow-md border-2 border-purple-700"
                                  title="Hidden opponent tile"
                                >
                                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                                    ?
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-semibold text-md text-slate-300">
                            Bureaucracy Tiles ({player.bureaucracyTiles.length}):
                          </h4>
                          <div className="flex flex-wrap justify-center gap-2 pt-2">
                            {player.bureaucracyTiles.map((tile) => (
                              <div
                                key={`buro-${tile.id}`}
                                className="bg-gray-700 w-12 h-24 p-1 rounded-md shadow-inner border-2 border-yellow-400"
                              ></div>
                            ))}
                          </div>
                        </div>
                      </details>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Test Mode Controls */}
          {isTestMode && (
            <div id="campaign-test-controls" className="mt-8 space-y-4">
              {/* Board Rotation Toggle */}
              <div className="bg-gray-700 rounded-lg p-4 mt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={boardRotationEnabled}
                    onChange={(e) => setBoardRotationEnabled(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500"
                  />
                  <span className="text-slate-200 font-semibold">
                    Board Rotation
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {boardRotationEnabled ? "(ON)" : "(OFF)"}
                  </span>
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  When ON, the board rotates to show each player's perspective.
                  When OFF, the board stays fixed.
                </p>
              </div>

              {/* Grid Overlay Toggle */}
              <div className="bg-gray-700 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGridOverlay}
                    onChange={(e) => setShowGridOverlay(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500"
                  />
                  <span className="text-slate-200 font-semibold">
                    Grid Overlay
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {showGridOverlay ? "(ON)" : "(OFF)"}
                  </span>
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  When ON, displays a 2% grid overlay on the board to help with
                  tile placement. When OFF, the grid is hidden.
                </p>
              </div>

              {/* Language Selector Button */}
              <div className="bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() => setLanguageModalOpen(true)}
                  className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Change Language
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Select your preferred language
                </p>
              </div>

              {/* Check Move Button */}
              {playedTile &&
                (gameState === "TILE_PLAYED" ||
                  gameState === "CORRECTION_REQUIRED") && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <button
                      onClick={() => onCheckMove?.()}
                      className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-lg"
                    >
                      ✓ Check Move
                    </button>
                    <p className="text-xs text-slate-400 mt-2">
                      {gameState === "CORRECTION_REQUIRED"
                        ? "Validate if corrections satisfy the tile requirements."
                        : "Validate if the moves satisfy the tile requirements."}
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right Column: Supply & Log */}
        <div id="campaign-right-column" className="w-full lg:w-72 lg:flex-shrink-0 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-8 flex flex-col gap-8">
            {/* Info Section */}
            <div id="campaign-info" className="w-full bg-gray-800/80 backdrop-blur-sm border border-cyan-700/50 shadow-lg rounded-xl px-6 py-3 text-center">
              <h2 className="text-xl font-bold text-cyan-300 tracking-wide">
                {isMover ? "Your Turn"
                  : isReceiver ? "Tile Received"
                  : isChallenger ? "Challenge?"
                  : isCorrecting ? "Make Correction"
                  : isFreeAdvancer ? "Free Advance"
                  : (gameState === 'PENDING_ACCEPTANCE' || gameState === 'PENDING_CHALLENGE')
                    ? `${nameById(playedTile?.playerId || tileTransaction?.placerId)}'s Turn`
                    : `${nameByIndex(currentPlayerIndex)}'s Turn`}
              </h2>
              {roleBanner && (
                <p className={`mt-2 text-sm font-semibold rounded-md py-1 px-3 ${roleBanner.color} text-white`}>
                  {roleBanner.text}
                </p>
              )}
            </div>

            {/* Receiver Decision (Accept / Blow Whistle) — inline under "Your Turn" box */}
            {isMyTurnForDecision &&
              gameState === "PENDING_ACCEPTANCE" &&
              !isPrivatelyViewing &&
              !showBonusMoveModal &&
              receiverAcceptance === null && (() => {
                const currentPlayer = players.find((p) => p.id === currentPlayerId);
                const hasZeroCredibility = (currentPlayer?.credibility ?? 3) === 0;
                const tileUrl = playedTile?.tile?.url || tileTransaction?.tile?.url;
                const canReject = !hasZeroCredibility && !movesMatchTile;
                return (
                  <div className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-xl p-4 text-center shadow-lg">
                    <h2 className="text-xl font-bold text-cyan-300 mb-2">Your Decision</h2>
                    {hasZeroCredibility ? (
                      <p className="text-red-400 text-sm font-semibold mb-3">
                        ⚠️ You have 0 Credibility - You must accept this tile!
                      </p>
                    ) : (
                      <p className="text-slate-300 text-sm mb-3">
                        {`${nameById(playedTile?.playerId || tileTransaction?.placerId)} has played a tile to you.`}
                      </p>
                    )}
                    {hasZeroCredibility ? (
                      <div className="mb-3">
                        <div className="w-20 h-20 mx-auto bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-500">
                          <span className="text-gray-400 text-xs text-center">Hidden<br/>(0 Credibility)</span>
                        </div>
                        <p className="text-red-400 text-xs mt-1 font-semibold">You may not view tiles</p>
                      </div>
                    ) : tileUrl ? (
                      <div className="mb-3">
                        <img
                          src={tileUrl}
                          alt="Played tile"
                          className="w-24 h-24 mx-auto rounded-lg border-2 border-cyan-400 shadow-lg"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-2">
                      {canReject && (
                        <button
                          onClick={() =>
                            playedTile
                              ? onReceiverAcceptanceDecision(false)
                              : onReceiverDecision("reject")
                          }
                          className="w-full px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md"
                        >
                          Blow Whistle
                        </button>
                      )}
                      <button
                        onClick={() =>
                          playedTile
                            ? onReceiverAcceptanceDecision(true)
                            : onReceiverDecision("accept")
                        }
                        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md"
                      >
                        Accept Tile
                      </button>
                    </div>
                  </div>
                );
              })()}

            {/* Challenger Decision (Challenge / Pass) — inline under "Your Turn" box */}
            {isMyTurnForDecision &&
              gameState === "PENDING_CHALLENGE" &&
              !showTakeAdvantageModal &&
              !showBonusMoveModal && (() => {
                const currentPlayer = players.find((p) => p.id === currentPlayerId);
                const hasZeroCredibility = (currentPlayer?.credibility ?? 3) === 0;
                return (
                  <div className="w-full bg-gray-800/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-xl p-4 text-center shadow-lg">
                    <h2 className="text-xl font-bold text-cyan-300 mb-2">Challenge or Pass?</h2>
                    {hasZeroCredibility ? (
                      <p className="text-red-400 text-sm font-semibold mb-3">
                        ⚠️ You have 0 Credibility - You can only Pass!
                      </p>
                    ) : (
                      <p className="text-slate-300 text-sm mb-3">
                        {`${nameById(playedTile?.receivingPlayerId || tileTransaction?.receiverId)} accepted the tile from ${nameById(playedTile?.playerId || tileTransaction?.placerId)}.`}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          playedTile
                            ? onChallengerDecision(true)
                            : onBystanderDecision("challenge")
                        }
                        disabled={hasZeroCredibility}
                        className={`w-full px-4 py-2 font-semibold rounded-lg transition-colors shadow-md ${
                          hasZeroCredibility
                            ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                            : "bg-red-700 text-white hover:bg-red-600"
                        }`}
                      >
                        Challenge
                      </button>
                      <button
                        onClick={() =>
                          playedTile
                            ? onChallengerDecision(false)
                            : onBystanderDecision("pass")
                        }
                        className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md"
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                );
              })()}

            {/* Action Buttons (only for mover / correcting player / free advance receiver) */}
            {(isMover || isCorrecting || isFreeAdvancer) && (
            <div id="campaign-action-buttons" className="flex flex-col gap-2">
              {(gameState === "TILE_PLAYED" ||
                movedPiecesThisTurn.size > 0) &&
                gameState !== "CORRECTION_REQUIRED" &&
                gameState !== "PENDING_ACCEPTANCE" &&
                gameState !== "PENDING_CHALLENGE" &&
                !showBonusMoveModal && (
                  <button
                    onClick={onResetTurn}
                    className="w-full px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-md"
                  >
                    Reset Turn
                  </button>
                )}
              {gameState === "CORRECTION_REQUIRED" && playedTile && (
                <button
                  onClick={onResetPiecesCorrection}
                  className="w-full px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-md"
                >
                  Reset Pieces
                </button>
              )}
              <button
                onClick={onEndTurn}
                disabled={
                  (gameState !== "CAMPAIGN" &&
                    gameState !== "TILE_PLAYED" &&
                    gameState !== "CORRECTION_REQUIRED")
                }
                className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isFreeAdvancer ? 'Complete Advance' : gameState === "CAMPAIGN" && !hasPlayedTileThisTurn ? 'Done Moving' : 'End Turn'}
              </button>
            </div>
            )}

            {/* Player Hand (keptTiles are the playable tiles from drafting) */}
            <div id="campaign-player-hand">
              {gameState === "SELECTING_TILE" && isMyTurn && (
                <div className="text-center text-sm text-green-300 font-semibold mb-1">
                  Select a tile to play — drag it to a player's space
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700 min-h-[8rem]">
                {(viewingPlayer?.keptTiles ?? []).map((tile) => {
                  const tileKey = tile.id === 0 ? "BLANK" : tile.id.toString().padStart(2, "0");
                  const isHonestMatch = matchingTileIds.includes(tileKey);
                  const canDragTile = gameState === "SELECTING_TILE" && isMyTurn;
                  return (
                    <div
                      key={tile.id}
                      draggable={canDragTile}
                      onDragStart={(e) => handleDragStartTile(e, tile.id)}
                      onDragEnd={() => setIsDraggingTile(false)}
                      className={`bg-stone-100 w-12 h-24 p-1 rounded-md shadow-md transition-transform hover:scale-105 flex-shrink-0 ${
                        canDragTile
                          ? "cursor-grab"
                          : "cursor-not-allowed opacity-60"
                      } border border-gray-300`}
                    >
                      <img
                        src={tile.url}
                        alt={`Tile ${tile.id}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Players' Tile Counts — face-down tile icons show how many tiles each opponent holds */}
            {(() => {
              const others = players.filter(p => p.id !== viewingPlayer?.id);
              if (others.length === 0) return null;
              return (
                <div id="campaign-other-players-tiles" className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 shadow-md">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Other Players' Tiles
                  </h3>
                  <div className="flex flex-col gap-2">
                    {others.map(p => {
                      const count = p.keptTiles?.length ?? 0;
                      const colors = PLAYER_COLORS[p.id] || PLAYER_COLORS[1];
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${colors.indicator} truncate flex-shrink min-w-0`}>
                            {p.name || `Player ${p.id}`}
                          </span>
                          <div className="flex flex-row gap-0.5 flex-wrap justify-end">
                            {count === 0 ? (
                              <span className="text-xs text-slate-500 italic">none</span>
                            ) : (
                              Array.from({ length: count }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-6 bg-white rounded-sm border border-gray-400 shadow-sm"
                                  title={`Tile ${i + 1}`}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Bonus Move Notification */}
            {(gameState === "BONUS_MOVE" || (showBonusMoveModal && bonusMovePlayerId !== null)) && (!isMultiplayer || bonusMovePlayerId === currentPlayerId) && (
              <div className="mt-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-2xl border-2 border-green-400 animate-pulse">
                <h2 className="text-3xl font-extrabold text-white mb-3 text-center">
                  🎉 BONUS MOVE!
                </h2>
                <p className="text-green-100 mb-3 text-center font-semibold">
                  {nameById(bonusMovePlayerId)}, you already had 3 Credibility!
                </p>
                <div className="bg-green-800/50 rounded-lg p-4 mb-4">
                  <p className="text-green-100 text-sm mb-2">
                    You correctly rejected an imperfect tile. Take a bonus{" "}
                    <span className="text-yellow-300 font-bold">ADVANCE</span>{" "}
                    move:
                  </p>
                  <ul className="text-green-200 text-xs space-y-1 list-disc list-inside">
                    <li>From Community to Seat</li>
                    <li>From Seat to Rostrum</li>
                    <li>From Rostrum to Office</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={onResetBonusMove}
                    className="w-full px-6 py-2 bg-amber-600 text-white font-semibold text-base rounded-lg hover:bg-amber-500 transition-colors shadow-md"
                  >
                    Reset Piece
                  </button>
                  <button
                    onClick={onBonusMoveComplete}
                    className="w-full px-6 py-3 bg-white text-green-700 font-bold text-lg rounded-lg hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    ✓ Continue Game
                  </button>
                </div>
              </div>
            )}

            {/* Test mode controls and modals will be added in next sub-phases */}
          </div>
        </div>
      </div>

      {/* --- Overlays --- */}
      {showChallengeRevealModal && challengedTile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-red-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
            <h2 className="text-4xl font-extrabold text-red-500 mb-2">
              CHALLENGED!
            </h2>
            <p className="text-slate-300 mb-4">
              The placed tile is revealed to all players as evidence.
            </p>
            <div className="bg-stone-100 w-20 h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 mx-auto mb-6">
              <img
                src={challengedTile.url}
                alt={`Tile ${challengedTile.id}`}
                className="w-full h-full object-contain"
              />
            </div>
            {challengeRevealCanContinue ? (
              <button
                onClick={onContinueAfterChallenge}
                className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-500 transition-colors shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Waiting for challenger to continue…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Receiver Reward Choice Modal (after exposing a dishonest play) */}
      {pendingReceiverReward && onReceiverRewardChoice && 
        currentPlayerId === (playedTile?.receivingPlayerId || tileTransaction?.receiverId) && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-green-400 mb-4 text-center">
              Whistle Blown!
            </h2>
            <p className="text-slate-200 text-lg mb-2 text-center leading-relaxed">
              You blew the whistle on a dishonest play. Choose your reward:
            </p>
            {(() => {
              const receiver = players.find(p => p.id === currentPlayerId);
              const currentCred = receiver?.credibility ?? 0;
              const maxRestore = Math.min(2, 3 - currentCred);
              return (
                <>
                  {currentCred < 3 && (
                    <p className="text-slate-400 text-sm mb-6 text-center italic">
                      Credibility restore: {currentCred} → {currentCred + maxRestore} (up to 2 notches, max 3)
                    </p>
                  )}
                  {currentCred >= 3 && (
                    <p className="text-slate-400 text-sm mb-6 text-center italic">
                      Your credibility is already full. Choose a free Advance!
                    </p>
                  )}
                </>
              );
            })()}
            <div className="flex gap-4 justify-center">
              {(() => {
                const receiver = players.find(p => p.id === currentPlayerId);
                const currentCred = receiver?.credibility ?? 0;
                if (currentCred >= 3) return null;
                return (
                  <button
                    onClick={() => onReceiverRewardChoice('credibility')}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Restore Credibility
                  </button>
                );
              })()}
              <button
                onClick={() => onReceiverRewardChoice('advance')}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Free Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Advantage Initial Choice Modal */}
      {showTakeAdvantageModal && takeAdvantageChallengerId !== null && (!isMultiplayer || takeAdvantageChallengerId === currentPlayerId) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-8 max-w-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-green-400 mb-6 text-center">
              Challenge Successful! 🎯
            </h2>

            {/* Show current funding */}
            {(() => {
              const challengerPlayer = players.find(p => p.id === takeAdvantageChallengerId);
              const tileCount = challengerPlayer?.bureaucracyTiles?.length || 0;
              return (
                <div className="bg-gray-700/50 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Your Credibility:</span>
                    <span className="text-green-400 font-bold text-xl">{takeAdvantageChallengerCredibility}/3</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-300">Banked Tiles:</span>
                    <span className="text-yellow-400 font-bold text-xl">{tileCount}</span>
                  </div>
                </div>
              );
            })()}

            {/* Credibility = 3 Message */}
            {takeAdvantageChallengerCredibility === 3 ? (
              <>
                <p className="text-slate-200 text-lg mb-4 text-center leading-relaxed">
                  You have full credibility. Would you like to use one of the
                  tiles in your bank to purchase an action?
                </p>
                <p className="text-slate-400 text-sm mb-8 text-center italic">
                  Click Yes to view your funding. You can cancel if you change
                  your mind.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onTakeAdvantageYes}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Yes
                  </button>
                  <button
                    onClick={onTakeAdvantageDecline}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    No Thanks
                  </button>
                </div>
              </>
            ) : (
              /* Credibility < 3 Message */
              <>
                <p className="text-slate-200 text-lg mb-8 text-center leading-relaxed">
                  Would you like to recover 1 notch to your credibility or use a
                  banked tile to purchase a move?
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onRecoverCredibility}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Recover Credibility
                  </button>
                  <button
                    onClick={onPurchaseMove}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Purchase Move
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Take Advantage Tile Selection Screen */}
      {showTakeAdvantageTileSelection && takeAdvantageChallengerId !== null && (!isMultiplayer || takeAdvantageChallengerId === currentPlayerId) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 max-w-4xl w-full my-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
              Select Tiles from Your Bank
            </h2>
            <p className="text-slate-300 text-center mb-2">
              Choose one or more tiles to use for purchasing an action.
            </p>
            <p className="text-slate-400 text-center text-sm mb-6">
              Click tiles to select/deselect. Selected tiles will be removed
              from your bank after purchase.
            </p>

            {/* Current Selection Summary */}
            <div className="bg-gray-700/50 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-semibold">
                  Selected: {selectedTilesForAdvantage.length} tile(s)
                </span>
                <span className="text-yellow-400 text-2xl font-bold">
                  Total: ₭-{totalKredcoinForAdvantage}
                </span>
              </div>
            </div>

            {/* Tile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {players
                .find((p) => p.id === takeAdvantageChallengerId)
                ?.bureaucracyTiles.map((tile) => {
                  const isSelected = selectedTilesForAdvantage.some(
                    (t) => t.id === tile.id
                  );
                  const tileValue = TILE_KREDCOIN_VALUES[tile.id] || 0;

                  return (
                    <button
                      key={tile.id}
                      onClick={() => onToggleTileSelection(tile)}
                      className={`relative bg-stone-100 w-full aspect-[1/2] p-2 rounded-md shadow-md border-4 transition-all transform hover:scale-105 ${isSelected
                          ? "border-yellow-400 ring-4 ring-yellow-400/50 scale-105"
                          : "border-gray-300 hover:border-yellow-300"
                        }`}
                    >
                      <img
                        src={tile.url}
                        alt={`Tile ${tile.id}`}
                        className="w-full h-full object-contain"
                      />
                      {/* Kredcoin Value Badge */}
                      <div
                        className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${isSelected
                            ? "bg-yellow-400 text-gray-900"
                            : "bg-gray-700 text-yellow-400"
                          }`}
                      >
                        ₭-{tileValue}
                      </div>
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* No tiles message */}
            {getPlayerById(players, takeAdvantageChallengerId!)
              ?.bureaucracyTiles.length === 0 && (
                <p className="text-red-400 text-center text-lg mb-6">
                  You have no tiles in your bank. Cannot purchase an action.
                </p>
              )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onConfirmTileSelection}
                disabled={selectedTilesForAdvantage.length === 0}
                className={`px-8 py-3 font-bold rounded-lg transition-all transform shadow-lg ${selectedTilesForAdvantage.length === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white hover:scale-105"
                  }`}
              >
                Continue with {selectedTilesForAdvantage.length} tile(s) (₭-
                {totalKredcoinForAdvantage})
              </button>
              <button
                onClick={onCancelTileSelection}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Advantage Action Menu */}
      {showTakeAdvantageMenu && takeAdvantageChallengerId !== null && (!isMultiplayer || takeAdvantageChallengerId === currentPlayerId) && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto">
          <div className="w-full max-w-7xl my-8 px-4">
            <div className="bg-gray-900 rounded-lg shadow-2xl border-2 border-yellow-600 p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  Take Advantage
                </h2>
                <p className="text-xl text-slate-200">
                  {nameById(takeAdvantageChallengerId)}'s Reward
                </p>
                <div className="mt-2 text-lg">
                  <span className="text-yellow-400 font-bold">
                    Available Kredcoin: ₭-{totalKredcoinForAdvantage}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  You can make ONE purchase with your selected tiles
                </p>
              </div>

              {/* Validation Error Display */}
              {takeAdvantageValidationError && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-200 text-center font-semibold">
                    {takeAdvantageValidationError}
                  </p>
                </div>
              )}

              {/* Main Content: Board and Menu Side by Side */}
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                {/* Board Section */}
                <div className="w-full lg:w-2/3">
                  <div className="relative aspect-square bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
                    <div
                      className="absolute inset-0 w-full h-full transition-transform duration-500"
                      style={{
                        transform: `rotate(${(() => {
                          const rotationMap =
                            PLAYER_PERSPECTIVE_ROTATIONS[playerCount];
                          return rotationMap?.[takeAdvantageChallengerId] || 0;
                        })()}deg)`,
                      }}
                      onDragOver={handleDragOverBoard}
                      onDrop={handleDropOnBoard}
                      onMouseLeave={handleMouseLeaveBoard}
                    >
                      <img
                        src={BOARD_IMAGE_URLS[playerCount]}
                        alt={`${playerCount}-player board`}
                        className="absolute inset-0 w-full h-full object-contain"
                        style={playerCount === 4 ? { transform: "translateY(2.5%)" } : undefined}
                        draggable={false}
                      />

                      {/* Drop indicator */}
                      {dropIndicator && (
                        <>
                          {/* Soft glow indicator showing snap location - green for valid, red for invalid */}
                          <div
                            className="absolute pointer-events-none transition-all duration-100 ease-in-out rounded-full"
                            style={{
                              top: `${dropIndicator.position.top}%`,
                              left: `${dropIndicator.position.left}%`,
                              width: "80px",
                              height: "80px",
                              transform: "translate(-50%, -50%)",
                              backgroundColor:
                                dropIndicator.isValid === false
                                  ? "rgba(239, 68, 68, 0.3)"
                                  : "rgba(34, 197, 94, 0.3)",
                              boxShadow:
                                dropIndicator.isValid === false
                                  ? "0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2)"
                                  : "0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)",
                              border:
                                dropIndicator.isValid === false
                                  ? "2px solid rgba(239, 68, 68, 0.6)"
                                  : "2px solid rgba(34, 197, 94, 0.6)",
                            }}
                            aria-hidden="true"
                          />
                          {/* Drop indicator piece preview */}
                          <div
                            className="absolute pointer-events-none transition-all duration-100 ease-in-out"
                            style={{
                              top: `${dropIndicator.position.top}%`,
                              left: `${dropIndicator.position.left}%`,
                              width:
                                dropIndicator.name === "Pawn"
                                  ? "80px"
                                  : dropIndicator.name === "Heel"
                                    ? "64px"
                                    : "56px",
                              height:
                                dropIndicator.name === "Pawn"
                                  ? "80px"
                                  : dropIndicator.name === "Heel"
                                    ? "64px"
                                    : "56px",
                              transform: `translate(-50%, -50%) rotate(${dropIndicator.rotation}deg) scale(0.798)`,
                              filter:
                                "drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))",
                              opacity: 0.7,
                            }}
                            aria-hidden="true"
                          >
                            <img
                              src={dropIndicator.imageUrl}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </>
                      )}

                      {/* Render pieces */}
                      {pieces.map((piece) => {
                        let pieceSizeClass = "w-10 h-10 sm:w-14 sm:h-14";
                        if (piece.name === "Heel")
                          pieceSizeClass = "w-14 h-14 sm:w-16 sm:h-16";
                        if (piece.name === "Pawn")
                          pieceSizeClass = "w-16 h-16 sm:w-20 sm:h-20";

                        const scaleMultiplier =
                          playerCount === 3
                            ? 0.85
                            : playerCount === 5
                              ? 0.9
                              : 1;
                        const baseScale = 0.798;

                        const isInCommunity = piece.locationId?.startsWith("community") || false;
                        const communityScale = (playerCount === 3 || playerCount === 4) && isInCommunity ? 0.8 : 1;
                        
                        const finalScale = baseScale * scaleMultiplier * communityScale;

                        const rotationMap =
                          PLAYER_PERSPECTIVE_ROTATIONS[playerCount];
                        const boardRotation =
                          rotationMap?.[takeAdvantageChallengerId] || 0;
                        const communityCounterRotation = isInCommunity
                          ? -boardRotation
                          : 0;

                        const isPromotionPurchase =
                          takeAdvantagePurchase?.item.type === "PROMOTION";
                        
                        let isDraggable = false;
                        if (gameState === "TAKE_ADVANTAGE") {
                          isDraggable = !isPromotionPurchase && takeAdvantagePurchase?.item.type === "MOVE" &&
                            (!isMultiplayer || takeAdvantageChallengerId === viewingPlayer?.id);
                        } else if (gameState === "BONUS_MOVE") {
                          isDraggable = (!isMultiplayer || bonusMovePlayerId === viewingPlayer?.id);
                        } else if (gameState === "CORRECTION_REQUIRED") {
                          isDraggable = (!isMultiplayer || playedTile?.playerId === viewingPlayer?.id);
                        } else if (gameState === "CAMPAIGN") {
                          isDraggable = (!isMultiplayer || playerIndex === currentPlayerIndex);
                        }

                        return (
                          <img
                            key={piece.id}
                            src={piece.imageUrl}
                            alt={piece.name}
                            draggable={isDraggable}
                            onDragStart={(e) => {
                              if (isDraggable) {
                                handleDragStartPiece(e, piece.id);
                              }
                            }}
                            onDragEnd={handleDragEndPiece}
                            onClick={() => {
                              if (isPromotionPurchase) {
                                onTakeAdvantagePiecePromote(piece.id);
                              }
                            }}
                            className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out ${isPromotionPurchase
                                ? "cursor-pointer hover:scale-110"
                                : isDraggable
                                  ? "cursor-grab active:cursor-grabbing"
                                  : "cursor-default"
                              }`}
                            style={{
                              position: "absolute",
                              top: `${piece.position.top}%`,
                              left: `${piece.position.left}%`,
                              transform: `translate(-50%, -50%) rotate(${piece.rotation + communityCounterRotation
                                }deg) scale(${finalScale})`,
                            }}
                            aria-hidden="true"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Menu Section */}
                <div className="w-full lg:w-1/3">
                  {!takeAdvantagePurchase ? (
                    /* Actions Menu */
                    <div className="bg-gray-800/90 rounded-lg shadow-2xl border-2 border-yellow-600/50 p-6">
                      <h3 className="text-2xl font-bold text-center mb-4 text-yellow-400">
                        Actions
                      </h3>
                      <div className="space-y-3">
                        {(() => {
                          const menu = getBureaucracyMenu(playerCount);
                          const affordableItems = getAvailablePurchases(
                            menu,
                            totalKredcoinForAdvantage
                          );
                          const currentPlayer = players.find(
                            (p) => p.id === takeAdvantageChallengerId
                          );

                          return (
                            <>
                              {/* Move items in two rows of three */}
                              {menu.some((item) => item.type === "MOVE") && (
                                <>
                                  {/* First row: Assist, Remove, Influence */}
                                  <div className="grid grid-cols-3 gap-2">
                                    {menu
                                      .filter(
                                        (item) =>
                                          item.type === "MOVE" &&
                                          [
                                            "ASSIST",
                                            "REMOVE",
                                            "INFLUENCE",
                                          ].includes(item.moveType || "")
                                      )
                                      .map((item) => {
                                        const canAfford = affordableItems.some(
                                          (ai) => ai.id === item.id
                                        );
                                        return (
                                          <button
                                            key={item.id}
                                            onClick={() =>
                                              canAfford &&
                                              onSelectTakeAdvantageAction(item)
                                            }
                                            disabled={!canAfford}
                                            className={`p-2 rounded-lg border-2 transition-all ${canAfford
                                                ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                                : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                              }`}
                                          >
                                            <div className="text-center">
                                              <span className="font-bold text-sm block mb-1">
                                                {item.moveType}
                                              </span>
                                              <span
                                                className={`text-base font-bold ${canAfford
                                                    ? "text-yellow-400"
                                                    : "text-gray-600"
                                                  }`}
                                              >
                                                ₭-{item.price}
                                              </span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                  </div>

                                  {/* Second row: Advance, Withdraw, Organize */}
                                  <div className="grid grid-cols-3 gap-2">
                                    {menu
                                      .filter(
                                        (item) =>
                                          item.type === "MOVE" &&
                                          [
                                            "ADVANCE",
                                            "WITHDRAW",
                                            "ORGANIZE",
                                          ].includes(item.moveType || "")
                                      )
                                      .map((item) => {
                                        const canAfford = affordableItems.some(
                                          (ai) => ai.id === item.id
                                        );
                                        return (
                                          <button
                                            key={item.id}
                                            onClick={() =>
                                              canAfford &&
                                              onSelectTakeAdvantageAction(item)
                                            }
                                            disabled={!canAfford}
                                            className={`p-2 rounded-lg border-2 transition-all ${canAfford
                                                ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                                : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                              }`}
                                          >
                                            <div className="text-center">
                                              <span className="font-bold text-sm block mb-1">
                                                {item.moveType}
                                              </span>
                                              <span
                                                className={`text-base font-bold ${canAfford
                                                    ? "text-yellow-400"
                                                    : "text-gray-600"
                                                  }`}
                                              >
                                                ₭-{item.price}
                                              </span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                  </div>
                                </>
                              )}

                              {/* Non-move items (Promotion, Credibility) */}
                              {menu
                                .filter((item) => item.type !== "MOVE")
                                .map((item) => {
                                  const canAfford = affordableItems.some(
                                    (ai) => ai.id === item.id
                                  );
                                  const isCredibilityAtMax =
                                    item.type === "CREDIBILITY" &&
                                    currentPlayer &&
                                    currentPlayer.credibility >= 3;
                                  const isEnabled =
                                    canAfford && !isCredibilityAtMax;

                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() =>
                                        isEnabled &&
                                        onSelectTakeAdvantageAction(item)
                                      }
                                      disabled={!isEnabled}
                                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isEnabled
                                          ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                          : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                        }`}
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-lg">
                                          {item.type === "PROMOTION" &&
                                            `Promote ${item.promotionLocation}`}
                                          {item.type === "CREDIBILITY" &&
                                            "Restore Credibility"}
                                        </span>
                                        <span
                                          className={`text-xl font-bold ${isEnabled
                                              ? "text-yellow-400"
                                              : "text-gray-600"
                                            }`}
                                        >
                                          ₭-{item.price}
                                        </span>
                                      </div>
                                      {item.description && (
                                        <p className="text-sm text-gray-300">
                                          {item.description}
                                        </p>
                                      )}
                                    </button>
                                  );
                                })}
                            </>
                          );
                        })()}
                      </div>

                      {/* Cancel Button */}
                      <div className="mt-6">
                        <button
                          onClick={onCancelTileSelection}
                          className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Execution Panel */
                    <div className="bg-blue-900/90 rounded-lg shadow-2xl border-2 border-blue-500 p-6">
                      <h3 className="text-2xl font-bold text-center mb-4 text-blue-300">
                        Perform Your Action
                      </h3>
                      <p className="text-center text-lg mb-6">
                        {takeAdvantagePurchase.item.type === "PROMOTION" && (
                          <>
                            Promote a piece in the{" "}
                            <span className="font-bold text-yellow-400">
                              {takeAdvantagePurchase.item.promotionLocation}
                            </span>
                          </>
                        )}
                        {takeAdvantagePurchase.item.type === "MOVE" && (
                          <>
                            Perform a{" "}
                            <span className="font-bold text-yellow-400">
                              {takeAdvantagePurchase.item.moveType}
                            </span>{" "}
                            move
                          </>
                        )}
                        {takeAdvantagePurchase.item.type === "CREDIBILITY" && (
                          <>Your credibility has been restored</>
                        )}
                      </p>

                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={onResetTakeAdvantageAction}
                          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={onDoneTakeAdvantageAction}
                          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Move Check Result Modal */}
      {showMoveCheckResult && isMyTurn && moveCheckResult && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-xl text-center shadow-2xl max-w-lg w-full">
            <div className="mb-8">
              {!moveCheckResult.isMet ? (
                <div className="text-center">
                  <div className="text-9xl text-red-500 font-bold mb-4">✕</div>
                  <h2 className="text-4xl font-bold text-red-400 mb-2">
                    Requirements Not Met
                  </h2>
                  <p className="text-lg text-red-300">
                    The moves do not satisfy the tile requirements.
                  </p>
                </div>
              ) : moveCheckResult.hasExtraMoves ? (
                <div className="text-center">
                  <div className="text-9xl text-yellow-400 font-bold mb-4">
                    ⚠️
                  </div>
                  <h2 className="text-4xl font-bold text-yellow-300 mb-2">
                    Requirements Met
                  </h2>
                  <p className="text-lg text-yellow-200">
                    But extra non-required moves were performed.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-9xl text-green-500 font-bold mb-4">
                    ✓
                  </div>
                  <h2 className="text-4xl font-bold text-green-400 mb-2">
                    Requirements Met!
                  </h2>
                  <p className="text-lg text-green-300">
                    All tile requirements have been satisfied.
                  </p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="bg-gray-700/50 rounded-lg p-6 mb-6 text-left space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                  Required Moves:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {moveCheckResult.requiredMoves.length > 0 ? (
                    moveCheckResult.requiredMoves.map((move, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded"
                      >
                        {move}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">
                      No specific moves required
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                  Moves Performed:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {moveCheckResult.performedMoves.length > 0 ? (
                    moveCheckResult.performedMoves.map((move, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded"
                      >
                        {move}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">
                      No moves performed
                    </span>
                  )}
                </div>
              </div>

              {moveCheckResult.missingMoves.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Missing Moves:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {moveCheckResult.missingMoves.map((move, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {moveCheckResult.hasExtraMoves &&
                moveCheckResult.extraMoves.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                      Extra Moves (Not Required):
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {moveCheckResult.extraMoves.map((move, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded"
                        >
                          {move}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Individual Move Validations - Only show if there are issues or multiple moves */}
              {moveCheckResult.moveValidations &&
                moveCheckResult.moveValidations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                      Move Details:
                    </h3>
                    <div className="space-y-2">
                      {moveCheckResult.moveValidations.map(
                        (validation, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded border-l-4 ${validation.isValid
                                ? "bg-green-900/30 border-green-500"
                                : "bg-red-900/30 border-red-500"
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-lg font-bold ${validation.isValid
                                    ? "text-green-400"
                                    : "text-red-400"
                                  }`}
                              >
                                {validation.isValid ? "✓" : "✕"}
                              </span>
                              <span
                                className={`font-semibold ${validation.isValid
                                    ? "text-green-300"
                                    : "text-white"
                                  }`}
                              >
                                {validation.moveType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 ml-7">
                              {validation.fromLocationId && (
                                <>
                                  FROM:{" "}
                                  <span className="text-cyan-400">
                                    {validation.fromLocationId}
                                  </span>
                                  {validation.toLocationId && (
                                    <>
                                      {" → TO: "}
                                      <span className="text-cyan-400">
                                        {validation.toLocationId}
                                      </span>
                                    </>
                                  )}
                                </>
                              )}
                            </p>
                            {!validation.isValid && (
                              <p className="text-xs text-red-300 ml-7 mt-1">
                                {validation.reason}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onCloseMoveCheckResult?.()}
              className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors text-white ${!moveCheckResult.isMet
                  ? "bg-red-600 hover:bg-red-500"
                  : moveCheckResult.hasExtraMoves
                    ? "bg-yellow-600 hover:bg-yellow-500"
                    : "bg-green-600 hover:bg-green-500"
                }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      <LanguageModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </main>
  );
};

export default CampaignScreen;
