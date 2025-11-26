import React, { useState, useEffect, useRef } from "react";

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
  BankSpace,
  TrackedMove,
} from "./src/types";

// Types still in game.ts (to be extracted in Phase 3)
import type {
  PlayedTileState,
  BureaucracyMenuItem,
  BureaucracyPurchase,
  BureaucracyPlayerState,
  BureaucracyMoveType,
} from "./game";

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
} from "./src/config";

// ============================================================================
// UTILITY IMPORTS - Helper functions
// ============================================================================
import {
  calculatePieceRotation,
  isPositionInCommunityCircle,
} from "./src/utils/positioning";

import { formatLocationId } from "./src/utils/formatting";

// ============================================================================
// GAME LOGIC IMPORTS - Functions still in game.ts (to be extracted)
// ============================================================================
import {
  initializePlayers,
  initializePieces,
  initializeCampaignPieces,
  findNearestVacantLocation,
  getLocationIdFromPosition,
  DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT,
  validateMovesForTilePlay,
  validateTileRequirements,
  validateTileRequirementsWithImpossibleMoveExceptions,
  createGameStateSnapshot,
  getChallengeOrder,
  getTileRequirements,
  validateSingleMove,
  areSeatsAdjacent,
  handleCredibilityLoss,
  calculatePlayerKredcoin,
  getBureaucracyTurnOrder,
  getBureaucracyMenu,
  getAvailablePurchases,
  validatePromotion,
  performPromotion,
  validatePurchasedMove,
  determineMoveType,
  validateMoveType,
  checkBureaucracyWinCondition,
  validatePieceMovement,
} from "./game";

// ============================================================================
// HOOKS IMPORTS - Custom React hooks
// ============================================================================
import {
  useAlerts,
  useBoardDisplay,
  useTestMode,
  useBonusMoves,
  useMoveTracking,
  useTilePlayWorkflow,
  useChallengeFlow,
  useBureaucracy,
  useGameState,
} from "./src/hooks";

// ============================================================================
// COMPONENT IMPORTS - Extracted React components
// ============================================================================
import ErrorDisplay from "./src/components/shared/ErrorDisplay";
import PlayerSelectionScreen from "./src/components/screens/PlayerSelectionScreen";
import DraftingScreen from "./src/components/screens/DraftingScreen";
import BureaucracyScreen from "./src/components/screens/BureaucracyScreen";

import { ALERTS, TIMEOUTS, DEFAULTS } from "./constants";
import {
  getPlayerName,
  getPlayerNameSimple,
  getPlayerById,
  formatWinnerNames,
  isPlayerDomain,
  isCommunityLocation,
} from "./utils";
import CampaignScreen from "./src/components/screens/CampaignScreen";

// --- Helper Components ---

/**
 * The main application component.
 *
 * GAME STATE FLOW:

/**
 * The main application component.
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
 */
const App: React.FC = () => {
  // ============================================================================
  // CUSTOM HOOKS - Extract state management into hooks
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

  const handleStartGame = (
    count: number,
    testMode: boolean,
    skipDraft: boolean,
    skipCampaign: boolean
  ) => {
    setPlayerCount(count);
    setIsTestMode(testMode);
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    const initialPlayers = initializePlayers(count);

    if (skipDraft && skipCampaign) {
      // Skip both phases - distribute tiles randomly and move to bureaucracy tiles
      const allTiles: Tile[] = [];
      for (let i = 1; i <= 24; i++) {
        allTiles.push({
          id: i,
          url: `./images/${String(i).padStart(2, "0")}.svg`,
        });
      }

      // Add blank tile for 5-player mode
      if (count === 5) {
        allTiles.push({
          id: 25,
          url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
        });
      }

      // Shuffle tiles
      const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);

      // Calculate tiles per player for bank
      const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[count] || [];
      const tilesPerPlayer = bankSpaces.length / count;

      // Distribute tiles to each player's bureaucracy tiles
      const playersWithTiles = initialPlayers.map((player, index) => {
        const startIdx = index * tilesPerPlayer;
        const playerTiles = shuffledTiles.slice(
          startIdx,
          startIdx + tilesPerPlayer
        );
        return {
          ...player,
          hand: [],
          keptTiles: [],
          bureaucracyTiles: playerTiles,
        };
      });

      setPlayers(playersWithTiles);

      // Initialize campaign pieces
      const campaignPieces = initializeCampaignPieces(count);
      setPieces(campaignPieces);

      // Initialize Bureaucracy phase
      const turnOrder = getBureaucracyTurnOrder(playersWithTiles);
      const initialStates: BureaucracyPlayerState[] = playersWithTiles.map(
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
      setCurrentPlayerIndex(0);
    } else if (skipDraft) {
      // Skip draft phase only - distribute tiles randomly to hand
      const allTiles: Tile[] = [];
      for (let i = 1; i <= 24; i++) {
        allTiles.push({
          id: i,
          url: `./images/${String(i).padStart(2, "0")}.svg`,
        });
      }

      // Add blank tile for 5-player mode
      if (count === 5) {
        allTiles.push({
          id: 25,
          url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
        });
      }

      // Shuffle tiles
      const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);

      // Determine hand size based on player count
      const handSize = count === 3 ? 8 : count === 4 ? 6 : 5; // 3p=8, 4p=6, 5p=5

      // Distribute tiles to each player's hand
      const playersWithTiles = initialPlayers.map((player, index) => {
        const startIdx = index * handSize;
        const playerTiles = shuffledTiles.slice(startIdx, startIdx + handSize);
        return {
          ...player,
          hand: playerTiles,
          keptTiles: playerTiles,
          bureaucracyTiles: [],
        };
      });

      setPlayers(playersWithTiles);

      // Initialize campaign pieces and start campaign
      const campaignPieces = initializeCampaignPieces(count);
      setPieces(campaignPieces);
      setPiecesAtTurnStart(campaignPieces.map((p) => ({ ...p })));

      // Player with tile 03 goes first
      const startingTileId = 3;
      const startingPlayerIndex = playersWithTiles.findIndex(
        (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
      );
      if (startingPlayerIndex !== -1) {
        setCurrentPlayerIndex(startingPlayerIndex);
      } else {
        setCurrentPlayerIndex(0);
      }

      setGameState("CAMPAIGN");
    } else {
      // Normal game flow - start with drafting
      setPlayers(initialPlayers);
      setGameState("DRAFTING");
      setCurrentPlayerIndex(0);
      setDraftRound(1);
    }
  };

  const handleNewGame = () => {
    setGameState("PLAYER_SELECTION");
    setPlayers([]);
    setPlayerCount(0);
    setPieces([]);
    setLastDroppedPosition(null);
    setBoardTiles([]);
    setBankedTiles([]);
    setHasPlayedTileThisTurn(false);
    setRevealedTileId(null);
    setTileTransaction(null);
    setBystanders([]);
    setBystanderIndex(0);
    setIsPrivatelyViewing(false);
    setShowChallengeRevealModal(false);
    setChallengedTile(null);
    setPlacerViewingTileId(null);
    setGameLog([]);
    setPiecesAtTurnStart([]);
    // Reset new tile play workflow states
    setPlayedTile(null);
    setMovesThisTurn([]);
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
    setShowMoveCheckResult(false);
    setMoveCheckResult(null);
    setGiveReceiverViewingTileId(null);
    setTilePlayerMustWithdraw(false);
  };

  const handleSelectTile = (selectedTile: Tile) => {
    const updatedPlayers = players.map((player, index) => {
      if (index === currentPlayerIndex) {
        return {
          ...player,
          keptTiles: [...player.keptTiles, selectedTile],
          hand: player.hand.filter((tile) => tile.id !== selectedTile.id),
        };
      }
      return player;
    });

    const nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex >= playerCount) {
      const handsToPass = updatedPlayers.map((p) => p.hand);
      const playersWithPassedHands = updatedPlayers.map((p, i) => {
        const passingPlayerIndex = (i - 1 + playerCount) % playerCount;
        return { ...p, hand: handsToPass[passingPlayerIndex] };
      });

      if (playersWithPassedHands[0].hand.length === 0) {
        setGameState("CAMPAIGN");

        // Initialize pieces for campaign: Marks at seats 1,3,5 + Heels/Pawns in community
        const initialPieces = initializeCampaignPieces(playerCount);
        setPieces(initialPieces);
        setPiecesAtTurnStart(initialPieces);

        // Player with tile 03.svg goes first in Campaign
        const startingTileId = 3;
        const startingPlayerIndex = playersWithPassedHands.findIndex(
          (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
        );
        console.log(
          "startingPlayerIndex:",
          startingPlayerIndex,
          "playersWithPassedHands:",
          playersWithPassedHands
        );

        setCurrentPlayerIndex(
          startingPlayerIndex !== -1 ? startingPlayerIndex : 0
        );
        setHasPlayedTileThisTurn(false);
        setPlayers(playersWithPassedHands);
      } else {
        setPlayers(playersWithPassedHands);
        setDraftRound(draftRound + 1);
        setCurrentPlayerIndex(0);
      }
    } else {
      setPlayers(updatedPlayers);
      setCurrentPlayerIndex(nextPlayerIndex);
    }
  };

  const handlePieceMove = (
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ) => {
    // Check if this piece has already been moved this turn
    // This includes pieces that have been moved to community (pending community pieces)
    if (
      movedPiecesThisTurn.has(pieceId) ||
      pendingCommunityPieces.has(pieceId)
    ) {
      showAlert(
        ALERTS.PIECE_ALREADY_MOVED.title,
        ALERTS.PIECE_ALREADY_MOVED.message,
        "warning"
      );
      return;
    }

    const movingPiece = pieces.find((p) => p.id === pieceId);
    if (!movingPiece) return;

    // Check if player is trying to move opponent's piece within opponent's domain
    if (locationId) {
      const currentPlayer = players[currentPlayerIndex];
      if (!currentPlayer) return;

      const validation = validatePieceMovement(
        pieceId,
        movingPiece.locationId,
        locationId,
        currentPlayer.id,
        pieces
      );
      if (!validation.isAllowed) {
        showAlert("Invalid Move", validation.reason, "error");
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
      // Piece is moving FROM community, check restrictions
      const pieceName = movingPiece.name.toLowerCase();

      // Marks can always move from community
      if (pieceName !== "mark") {
        // Check if Marks are in community (excluding pending pieces)
        const marksInCommunity = pieces.some(
          (p) =>
            p.locationId?.includes("community") &&
            p.name.toLowerCase() === "mark" &&
            !pendingCommunityPieces.has(p.id)
        );

        // If Marks in community, Heels and Pawns cannot move
        if (marksInCommunity) {
          showAlert(
            ALERTS.CANNOT_MOVE_PIECE.title,
            ALERTS.CANNOT_MOVE_PIECE.message,
            "warning"
          );
          return;
        }

        // If moving a Pawn, check if Heels are in community (excluding pending pieces)
        if (pieceName === "pawn") {
          const heelsInCommunity = pieces.some(
            (p) =>
              p.locationId?.includes("community") &&
              p.name.toLowerCase() === "heel" &&
              !pendingCommunityPieces.has(p.id)
          );
          // Pawns cannot move if Heels in community
          if (heelsInCommunity) {
            showAlert(
              ALERTS.CANNOT_MOVE_PIECE.title,
              ALERTS.CANNOT_MOVE_PIECE.message,
              "warning"
            );
            return;
          }
        }
      }
    }

    // Check if the move would result in an illegal (UNKNOWN) move type
    if (locationId && movingPiece.locationId) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer) {
        const moveType = validateMoveType(
          movingPiece.locationId,
          locationId,
          currentPlayer.id,
          movingPiece,
          pieces,
          playerCount
        );

        if (moveType === "UNKNOWN") {
          showAlert(
            "Illegal Move",
            `Cannot move from ${formatLocationId(
              movingPiece.locationId
            )} to ${formatLocationId(
              locationId
            )}. This move violates game rules.`,
            "error"
          );
          return;
        }
      }
    }

    setLastDroppedPosition(newPosition);
    setLastDroppedPieceId(pieceId);
    const newRotation = calculatePieceRotation(
      newPosition,
      playerCount,
      locationId
    );

    // Simply update the piece position and location
    // Move validation will be calculated when Check Move is clicked
    setPieces((prevPieces) =>
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
    setMovedPiecesThisTurn((prev) => new Set(prev).add(pieceId));

    // If piece is moved to community, mark it as "pending" until acceptance/challenge resolved
    if (locationId && locationId.includes("community")) {
      setPendingCommunityPieces((prev) => new Set(prev).add(pieceId));
    }
  };

  const handleResetTurn = () => {
    // Restore pieces to turn start state
    setPieces(piecesAtTurnStart.map((p) => ({ ...p })));

    // If a tile was played, return it to player's hand and remove from board
    if (playedTile) {
      const tileId = parseInt(playedTile.tileId);
      const tile = { id: tileId, url: `./images/${playedTile.tileId}.svg` };

      // Add tile back to player's hand
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playedTile.playerId
            ? { ...p, keptTiles: [...p.keptTiles, tile] }
            : p
        )
      );

      // Remove tile from board
      setBoardTiles((prev) =>
        prev.filter(
          (bt) =>
            !(
              bt.placerId === playedTile.playerId &&
              bt.ownerId === playedTile.receivingPlayerId
            )
        )
      );

      // Clear the played tile state
      setPlayedTile(null);
      setGameState("CAMPAIGN");
      setHasPlayedTileThisTurn(false);
    }

    // Clear tracking sets
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    setLastDroppedPosition(null);
    setLastDroppedPieceId(null);
  };

  const handleResetPiecesCorrection = () => {
    // Reset pieces to correction start state while keeping tile in play
    if (piecesAtCorrectionStart.length > 0) {
      setPieces(piecesAtCorrectionStart.map((p) => ({ ...p })));
    }

    // Clear movement tracking for fresh correction attempt
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    setLastDroppedPosition(null);
    setLastDroppedPieceId(null);
  };

  const handleResetBonusMove = () => {
    // Reset pieces to state before bonus move started
    setPieces(piecesBeforeBonusMove.map((p) => ({ ...p })));

    // Clear tracking sets
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    // Clear any last dropped state
    setLastDroppedPosition(null);
    setLastDroppedPieceId(null);
  };

  const handleBoardTileMove = (
    boardTileId: string,
    newPosition: { top: number; left: number }
  ) => {
    setLastDroppedPosition(newPosition);
    setBoardTiles((prevBoardTiles) =>
      prevBoardTiles.map((bt) =>
        bt.id === boardTileId ? { ...bt, position: newPosition } : bt
      )
    );
  };

  const generateTurnLog = (
    turnPlayerId: number,
    piecesBefore: Piece[],
    piecesAfter: Piece[],
    countOfPlayers: number,
    tileTransactionAtTurnEnd: typeof tileTransaction
  ): string[] => {
    const logs: string[] = [];

    const piecesBeforeMap = new Map(piecesBefore.map((p) => [p.id, p]));
    const piecesAfterMap = new Map(piecesAfter.map((p) => [p.id, p]));

    if (
      tileTransactionAtTurnEnd &&
      tileTransactionAtTurnEnd.placerId === turnPlayerId
    ) {
      logs.push(
        `Played a tile for Player ${tileTransactionAtTurnEnd.receiverId}.`
      );
    }

    for (const [id, oldPiece] of piecesBeforeMap.entries()) {
      const newPiece = piecesAfterMap.get(id);
      if (newPiece) {
        if (
          Math.abs(oldPiece.position.left - newPiece.position.left) > 0.01 ||
          Math.abs(oldPiece.position.top - newPiece.position.top) > 0.01
        ) {
          const oldLocId = getLocationIdFromPosition(
            oldPiece.position,
            countOfPlayers
          );
          const newLocId = getLocationIdFromPosition(
            newPiece.position,
            countOfPlayers
          );
          const oldLocStr = oldLocId
            ? formatLocationId(oldLocId)
            : "a location";
          const newLocStr = newLocId
            ? formatLocationId(newLocId)
            : "another location";
          logs.push(
            `Moved a ${oldPiece.name} from ${oldLocStr} to ${newLocStr}.`
          );
        }
      } else {
        const oldLocId = getLocationIdFromPosition(
          oldPiece.position,
          countOfPlayers
        );
        const oldLocStr = oldLocId ? formatLocationId(oldLocId) : "a location";
        logs.push(`Returned a ${oldPiece.name} to supply from ${oldLocStr}.`);
      }
    }

    for (const [id, newPiece] of piecesAfterMap.entries()) {
      if (!piecesBeforeMap.has(id)) {
        const newLocId = getLocationIdFromPosition(
          newPiece.position,
          countOfPlayers
        );
        const newLocStr = newLocId ? formatLocationId(newLocId) : "a location";
        logs.push(`Added a ${newPiece.name} from supply to ${newLocStr}.`);
      }
    }
    return logs;
  };

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
    const player = players.find((p) => p.id === bonusMovePlayerId);
    const playerName = player?.name || `Player ${bonusMovePlayerId}`;
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

  const advanceTurnNormally = (startingPlayerId?: number) => {
    if (playerCount === 0) {
      console.error("Cannot advance turn: playerCount is 0.");
      return;
    }

    const fromPlayerId = startingPlayerId ?? players[currentPlayerIndex]?.id;

    if (!fromPlayerId) {
      console.error("Cannot advance turn: current player not found.");
      return;
    }

    const fromPlayerIndex = players.findIndex((p) => p.id === fromPlayerId);
    // If player not found, fromPlayerIndex will be -1.
    // (-1 + 1) % playerCount will be 0, which is a safe default.
    const nextPlayerIndex = (fromPlayerIndex + 1) % playerCount;

    setCurrentPlayerIndex(nextPlayerIndex);
    setHasPlayedTileThisTurn(false);
    setRevealedTileId(null);
    setGameState("CAMPAIGN");
    setTileTransaction(null);
    setBystanders([]);
    setBystanderIndex(0);
    setIsPrivatelyViewing(false);
    setChallengedTile(null);
    setPlacerViewingTileId(null);

    // Set piece state snapshot for the start of this new turn
    setPiecesAtTurnStart(pieces.map((p) => ({ ...p })));

    // Clear piece movement tracking for new turn
    setMovedPiecesThisTurn(new Set());
    // Clear pending community pieces (acceptance/challenge phase is complete)
    setPendingCommunityPieces(new Set());
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

  const handlePlaceTile = (tileId: number, targetSpace: TileReceivingSpace) => {
    if (hasPlayedTileThisTurn) return;
    const currentPlayer = players[currentPlayerIndex];
    const tileToPlace = currentPlayer.keptTiles.find((t) => t.id === tileId);

    if (
      !tileToPlace ||
      boardTiles.some((bt) => bt.ownerId === targetSpace.ownerId)
    )
      return;

    if (currentPlayer.id === targetSpace.ownerId) {
      const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);
      const allOthersAreOutOfTiles = otherPlayers.every(
        (p) => p.keptTiles.length === 0
      );
      if (!allOthersAreOutOfTiles) {
        showAlert(
          ALERTS.CANNOT_PLAY_FOR_YOURSELF.title,
          ALERTS.CANNOT_PLAY_FOR_YOURSELF.message,
          "warning"
        );
        return;
      }
    }

    // Check if target player's bank is full
    const allBankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const tilesPerPlayer = allBankSpaces.length / playerCount;
    const targetPlayer = players.find((p) => p.id === targetSpace.ownerId);

    if (
      targetPlayer &&
      targetPlayer.bureaucracyTiles.length >= tilesPerPlayer
    ) {
      showAlert(
        "Bank Full",
        `Player ${targetSpace.ownerId}'s bank is full. You cannot play a tile to them. Choose a different player.`,
        "warning"
      );
      return;
    }

    // NEW VALIDATION: Campaign phase tile rules
    const totalTilesPlayed = players.reduce(
      (sum, p) => sum + p.bureaucracyTiles.length,
      0
    );
    const totalTiles = allBankSpaces.length; // 24 for 3/4p, 25 for 5p
    const isLastTile = totalTilesPlayed === totalTiles - 1;

    if (isLastTile) {
      // Final tile: Can ONLY be played to the player with one remaining bank space
      if (
        !targetPlayer ||
        targetPlayer.bureaucracyTiles.length !== tilesPerPlayer - 1
      ) {
        const eligiblePlayer = players.find(
          (p) => p.bureaucracyTiles.length === tilesPerPlayer - 1
        );
        showAlert(
          "Invalid Final Tile Placement",
          eligiblePlayer
            ? `This is the final tile of the campaign phase. It can only be played to Player ${eligiblePlayer.id}, who has one remaining bank space.`
            : "This is the final tile of the campaign phase, but no player has exactly one remaining bank space.",
          "warning"
        );
        return;
      }
    } else {
      // Non-final tiles: MUST be played to a player who has at least 1 tile in their hand
      if (!targetPlayer || targetPlayer.keptTiles.length === 0) {
        showAlert(
          "Invalid Tile Placement",
          `You must play to a player who has at least 1 tile in their hand. Player ${targetSpace.ownerId} has no tiles left.`,
          "warning"
        );
        return;
      }
    }

    // Initialize the tile play state (NEW WORKFLOW)
    const tileIdStr = tileId.toString().padStart(2, "0");
    const boardTileId = `boardtile_${Date.now()}`;

    // Create a BoardTile to display in the receiving space (face-down/white back)
    const newBoardTile: BoardTile = {
      id: boardTileId,
      tile: tileToPlace,
      position: targetSpace.position,
      rotation: targetSpace.rotation,
      placerId: currentPlayer.id,
      ownerId: targetSpace.ownerId,
    };

    setPlayedTile({
      tileId: tileIdStr,
      playerId: currentPlayer.id,
      receivingPlayerId: targetSpace.ownerId,
      movesPerformed: [],
      originalPieces: piecesAtTurnStart.map((p) => ({ ...p })),
      originalBoardTiles: boardTiles.map((t) => ({ ...t })),
    });

    // Add the board tile to display in the receiving space
    setBoardTiles((prev) => [...prev, newBoardTile]);

    // Remove tile from player's hand (will be added back if rejected)
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayer.id
          ? { ...p, keptTiles: p.keptTiles.filter((t) => t.id !== tileId) }
          : p
      )
    );

    // Set game state to allow moves (tile not yet visible to others)
    setGameState("TILE_PLAYED");
    setMovesThisTurn([]);
    setHasPlayedTileThisTurn(true);

    // Clear piece movement tracking for this tile play
    // NOTE: playedTile.originalPieces captures piecesAtTurnStart (beginning of turn)
    // This allows moves to be detected whether they happen before or after tile placement
    setMovedPiecesThisTurn(new Set());
    setPendingCommunityPieces(new Set());

    // Clear any stale correction/bonus move state from previous tile plays
    setBonusMoveWasCompleted(false);
    setPiecesAtCorrectionStart([]);
    setPiecesBeforeBonusMove([]);
  };

  const handleRevealTile = (tileId: string | null) => {
    setRevealedTileId(tileId);
  };

  const handleTogglePrivateView = () => setIsPrivatelyViewing((prev) => !prev);

  const handlePlacerViewTile = (tileId: string) => {
    setPlacerViewingTileId((prevId) => (prevId === tileId ? null : tileId));
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
      const tilePlayer = players.find((p) => p.id === playedTile.playerId);
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
        const challengerName =
          players.find((p) => p.id === challengerId)?.name || "Player";
        const challengedPlayerName =
          players.find((p) => p.id === playedTile.playerId)?.name || "Player";
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
        const challengedPlayerName =
          players.find((p) => p.id === playedTile.playerId)?.name || "Player";
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

        const challenger = finalPlayers.find((p) => p.id === challengerId);
        const challengerName = challenger?.name || "Player";
        addGameLog(
          `${challengerName} gained credibility for successful challenge (now ${
            challenger?.credibility ?? 0
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
        const movedPiece = pieces.find((p) => p.id === move.pieceId);
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
        id: `bank_${
          playedTile.receivingPlayerId
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
        const turnOrder = getBureaucracyTurnOrder(updatedPlayers);
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
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setReceiverAcceptance(null);
    setTileRejected(false);

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
      const tilePlayer = players.find((p) => p.id === playedTile.playerId);
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
      const movedPiece = pieces.find((p) => p.id === move.pieceId);
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
        id: `bank_${
          updatedPlayedTile.receivingPlayerId
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
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setReceiverAcceptance(null);
    setTileRejected(false);

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
        const turnOrder = getBureaucracyTurnOrder(updatedPlayers);
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
   */
  const calculateMoves = (
    originalPieces: Piece[],
    currentPieces: Piece[],
    tilePlayerId: number
  ): TrackedMove[] => {
    const calculatedMoves: TrackedMove[] = [];

    console.log("calculateMoves called with:", {
      originalPiecesCount: originalPieces.length,
      currentPiecesCount: currentPieces.length,
      tilePlayerId,
    });

    for (const currentPiece of currentPieces) {
      const initialPiece = originalPieces.find((p) => p.id === currentPiece.id);
      if (!initialPiece) {
        console.log("No initial piece found for:", currentPiece.id);
        continue;
      }

      const initialLocId = initialPiece.locationId;
      const finalLocId = currentPiece.locationId;

      console.log(`Piece ${currentPiece.id}: ${initialLocId} → ${finalLocId}`);

      // Skip if piece didn't move
      if (initialLocId === finalLocId) continue;

      // Determine if this move should be counted
      let shouldCountMove = false;

      // Rule 1: Community → Seat/Rostrum/Office = COUNT
      if (
        initialLocId?.includes("community") &&
        (finalLocId?.includes("_seat") ||
          finalLocId?.includes("_rostrum") ||
          finalLocId?.includes("_office"))
      ) {
        shouldCountMove = true;
      }
      // Rule 2: Seat → Community = COUNT (only if started in seat)
      else if (
        initialLocId?.includes("_seat") &&
        finalLocId?.includes("community")
      ) {
        shouldCountMove = true;
      }
      // Rule 3: Seat → Seat = COUNT (intermediate moves don't matter)
      else if (
        initialLocId?.includes("_seat") &&
        finalLocId?.includes("_seat")
      ) {
        shouldCountMove = true;
      }
      // Rule 4: Seat → Rostrum = COUNT
      else if (
        initialLocId?.includes("_seat") &&
        finalLocId?.includes("_rostrum")
      ) {
        shouldCountMove = true;
      }
      // Rule 5: Rostrum → Seat/Office = COUNT
      else if (
        initialLocId?.includes("_rostrum") &&
        (finalLocId?.includes("_seat") || finalLocId?.includes("_office"))
      ) {
        shouldCountMove = true;
      }
      // Rule 6: Office → Rostrum = COUNT
      else if (
        initialLocId?.includes("_office") &&
        finalLocId?.includes("_rostrum")
      ) {
        shouldCountMove = true;
      }
      // Rule 7: Rostrum → Community = COUNT (WITHDRAW)
      else if (
        initialLocId?.includes("_rostrum") &&
        finalLocId?.includes("community")
      ) {
        shouldCountMove = true;
      }
      // Rule 8: Rostrum → Rostrum = COUNT (ORGANIZE)
      else if (
        initialLocId?.includes("_rostrum") &&
        finalLocId?.includes("_rostrum")
      ) {
        shouldCountMove = true;
      }
      // Rule 9: Office → Community = COUNT (shouldn't happen but count if it does)
      else if (
        initialLocId?.includes("_office") &&
        finalLocId?.includes("community")
      ) {
        shouldCountMove = true;
      }

      if (!shouldCountMove) continue;

      // Determine move type
      let moveType = "UNKNOWN";
      const isCommunity = (loc?: string) => loc?.includes("community");
      const isSeat = (loc?: string) => loc?.includes("_seat");
      const isRostrum = (loc?: string) => loc?.includes("_rostrum");
      const isOffice = (loc?: string) => loc?.includes("_office");
      const getPlayerFromLocation = (loc?: string): number | null => {
        const match = loc?.match(/p(\d+)_/);
        return match ? parseInt(match[1]) : null;
      };

      if (isCommunity(initialLocId) && isSeat(finalLocId)) {
        const ownerPlayer = getPlayerFromLocation(finalLocId);
        moveType = ownerPlayer === tilePlayerId ? "ADVANCE" : "ASSIST";
      } else if (isSeat(initialLocId) && isRostrum(finalLocId)) {
        moveType = "ADVANCE";
      } else if (isRostrum(initialLocId) && isOffice(finalLocId)) {
        moveType = "ADVANCE";
      } else if (isRostrum(initialLocId) && isSeat(finalLocId)) {
        moveType = "WITHDRAW";
      } else if (isOffice(initialLocId) && isRostrum(finalLocId)) {
        moveType = "WITHDRAW";
      } else if (isSeat(initialLocId) && isCommunity(finalLocId)) {
        // Determine if this is REMOVE or WITHDRAW based on piece ownership
        const fromPlayer = getPlayerFromLocation(initialLocId);
        if (fromPlayer === tilePlayerId) {
          moveType = "WITHDRAW";
        } else {
          // Check if the piece is a Mark or Heel (REMOVE only for these pieces)
          const movingPiece = currentPieces.find(
            (p) => p.id === currentPiece.id
          );
          if (movingPiece) {
            const pieceName = movingPiece.name.toLowerCase();
            moveType =
              pieceName === "mark" || pieceName === "heel"
                ? "REMOVE"
                : "UNKNOWN";
          } else {
            moveType = "UNKNOWN";
          }
        }
      } else if (isSeat(initialLocId) && isSeat(finalLocId)) {
        const fromPlayer = getPlayerFromLocation(initialLocId);
        // Check if seats are adjacent using the helper function from game.ts
        if (
          initialLocId &&
          finalLocId &&
          areSeatsAdjacent(initialLocId, finalLocId, playerCount)
        ) {
          if (fromPlayer === tilePlayerId) {
            moveType = "ORGANIZE";
          } else {
            moveType = "INFLUENCE";
          }
        } else {
          // Non-adjacent seats - not a valid move type
          moveType = "UNKNOWN";
        }
      } else if (isRostrum(initialLocId) && isRostrum(finalLocId)) {
        const fromPlayer = getPlayerFromLocation(initialLocId);
        moveType = fromPlayer === tilePlayerId ? "ORGANIZE" : "INFLUENCE";
      }

      // Determine category
      let category: "M" | "O" = "M";
      if (
        moveType === "REMOVE" ||
        moveType === "INFLUENCE" ||
        moveType === "ASSIST"
      ) {
        category = "O";
      }

      // Create tracked move
      calculatedMoves.push({
        moveType,
        category,
        pieceId: currentPiece.id,
        fromPosition: initialPiece.position,
        fromLocationId: initialLocId,
        toPosition: currentPiece.position,
        toLocationId: finalLocId,
        timestamp: Date.now(),
      });
    }

    return calculatedMoves;
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

  const resolveTransaction = (wasChallenged: boolean) => {
    if (!tileTransaction) return;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === tileTransaction.receiverId) {
          return {
            ...p,
            bureaucracyTiles: [...p.bureaucracyTiles, tileTransaction.tile],
          };
        }
        return p;
      })
    );
    setBoardTiles((prev) =>
      prev.filter((bt) => bt.id !== tileTransaction.boardTileId)
    );
    advanceTurnNormally(tileTransaction.placerId);
  };

  const handleReceiverDecision = (decision: "accept" | "reject") => {
    if (!tileTransaction) return;
    setIsPrivatelyViewing(false);

    if (decision === "reject") {
      const placer = players.find((p) => p.id === tileTransaction.placerId);
      if (placer) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === placer.id
              ? { ...p, keptTiles: [...p.keptTiles, tileTransaction.tile] }
              : p
          )
        );
      }
      setBoardTiles((prev) =>
        prev.filter((bt) => bt.id !== tileTransaction.boardTileId)
      );
      advanceTurnNormally(tileTransaction.placerId);
    } else {
      // 'accept'
      setGameState("PENDING_CHALLENGE");

      const bystanderPlayers = players.filter(
        (p) =>
          p.id !== tileTransaction.placerId &&
          p.id !== tileTransaction.receiverId
      );
      const placerIndex = players.findIndex(
        (p) => p.id === tileTransaction.placerId
      );

      const sortedBystanders = bystanderPlayers.sort((a, b) => {
        const indexA = players.findIndex((p) => p.id === a.id);
        const indexB = players.findIndex((p) => p.id === b.id);
        const relativeA = (indexA - placerIndex + playerCount) % playerCount;
        const relativeB = (indexB - placerIndex + playerCount) % playerCount;
        return relativeA - relativeB;
      });

      if (sortedBystanders.length > 0) {
        setBystanders(sortedBystanders);
        setBystanderIndex(0);
        const firstBystanderIndex = players.findIndex(
          (p) => p.id === sortedBystanders[0].id
        );
        setCurrentPlayerIndex(firstBystanderIndex);
      } else {
        resolveTransaction(false);
      }
    }
  };

  const handleBystanderDecision = (decision: "challenge" | "pass") => {
    if (decision === "challenge") {
      if (tileTransaction) {
        setChallengedTile(tileTransaction.tile);
        setShowChallengeRevealModal(true);
      }
    } else {
      // 'pass'
      const nextBystanderIndex = bystanderIndex + 1;
      if (nextBystanderIndex >= bystanders.length) {
        resolveTransaction(false);
      } else {
        setBystanderIndex(nextBystanderIndex);
        const nextBystander = bystanders[nextBystanderIndex];
        const nextBystanderPlayerIndex = players.findIndex(
          (p) => p.id === nextBystander.id
        );
        setCurrentPlayerIndex(nextBystanderPlayerIndex);
      }
    }
  };

  const handleContinueAfterChallenge = () => {
    setShowChallengeRevealModal(false);
    resolveTransaction(true);
    setChallengedTile(null);
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
            const currentPiece = pieces.find((p) => p.id === originalPiece.id);
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
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    // Determine the move type based on from/to locations
    const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
    const moveType = determineMoveType(
      piece.locationId,
      locationId,
      currentPlayerId
    );

    const move: TrackedMove = {
      moveType: moveType || 0,
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

    const tilePlayer = players.find((p) => p.id === playedTile.playerId);
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
    const challengerName =
      players.find((p) => p.id === takeAdvantageChallengerId)?.name || "Player";
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
  };

  /**
   * Handler: User chose "Yes" (credibility = 3)
   * Show tile selection screen
   */
  const handleTakeAdvantageYes = () => {
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
    const challengerName =
      players.find((p) => p.id === takeAdvantageChallengerId)?.name || "Player";
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
  };

  /**
   * Handler: User chose "Purchase Move" (credibility < 3)
   * Show tile selection screen
   */
  const handlePurchaseMove = () => {
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
    const challengerName =
      players.find((p) => p.id === takeAdvantageChallengerId)?.name || "Player";
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
    const challengerName =
      players.find((p) => p.id === takeAdvantageChallengerId)?.name || "Player";
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

      const challengerName =
        players.find((p) => p.id === takeAdvantageChallengerId)?.name ||
        "Player";
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

      const challengerName =
        players.find((p) => p.id === takeAdvantageChallengerId)?.name ||
        "Player";
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
          const currentPiece = pieces.find((p) => p.id === originalPiece.id);
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
    const challengerName =
      players.find((p) => p.id === takeAdvantageChallengerId)?.name || "Player";

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
            id: `bank_${takeAdvantageChallengerId}_${bankIndex}_${Date.now()}_${
              tile.id
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

  const renderGameState = () => {
    console.log(
      "renderGameState called with gameState:",
      gameState,
      "playerCount:",
      playerCount,
      "players:",
      players.length,
      "currentPlayerIndex:",
      currentPlayerIndex
    );
    switch (gameState) {
      case "DRAFTING":
        return (
          <DraftingScreen
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            draftRound={draftRound}
            onSelectTile={handleSelectTile}
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
            onClearValidationError={handleClearBureaucracyValidationError}
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
        return (
          <CampaignScreen
            gameState={gameState}
            playerCount={playerCount}
            players={players}
            pieces={pieces}
            boardTiles={boardTiles}
            bankedTiles={bankedTiles}
            currentPlayerId={currentPlayer.id}
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
            onPieceMove={handlePieceMove}
            onBoardTileMove={handleBoardTileMove}
            onEndTurn={handleEndTurn}
            onPlaceTile={handlePlaceTile}
            onRevealTile={handleRevealTile}
            onReceiverDecision={handleReceiverDecision}
            onBystanderDecision={handleBystanderDecision}
            onTogglePrivateView={handleTogglePrivateView}
            onContinueAfterChallenge={handleContinueAfterChallenge}
            onPlacerViewTile={handlePlacerViewTile}
            onSetGiveReceiverViewingTileId={setGiveReceiverViewingTileId}
            playedTile={playedTile}
            receiverAcceptance={receiverAcceptance}
            onReceiverAcceptanceDecision={handleReceiverAcceptanceDecision}
            onChallengerDecision={handleChallengerDecision}
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
      case "PLAYER_SELECTION":
      default:
        return <PlayerSelectionScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="App">
      <ErrorBoundary fallback={<ErrorDisplay />}>
        {renderGameState()}
      </ErrorBoundary>

      {/* Custom Alert Modal */}
      {showPerfectTileModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-green-500 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="mb-4">
              <div className="text-6xl text-green-400 mb-2">✓</div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-green-400">
              Perfect Tile Play
            </h2>
            <p className="text-slate-300 mb-6 text-lg">
              The tile requirements have been fulfilled perfectly. You cannot
              reject this tile. Other players may now challenge the play.
            </p>
            <button
              onClick={handlePerfectTileContinue}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Challenge Result Message - displays for 5 seconds */}
      {challengeResultMessage && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4"
          aria-live="polite"
          role="status"
        >
          <div
            className={`rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 ${
              challengeResultMessage.includes("Failed")
                ? "bg-green-900 border-green-500 text-green-300"
                : "bg-orange-900 border-orange-500 text-orange-300"
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">
              {challengeResultMessage.includes("Failed")
                ? "✓ Challenge Failed"
                : "⚠️ Challenge Successful"}
            </h2>
            <p className="text-lg">{challengeResultMessage}</p>
          </div>
        </div>
      )}

      {alertModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-gray-800 border-2 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8"
            style={{
              borderColor:
                alertModal.type === "error"
                  ? "#ef5350"
                  : alertModal.type === "warning"
                  ? "#ffa726"
                  : "#29b6f6",
            }}
          >
            <div className="mb-4">
              {alertModal.type === "error" && (
                <div className="text-6xl font-bold text-red-400 mb-2">✕</div>
              )}
              {alertModal.type === "warning" && (
                <div className="text-6xl text-yellow-400 mb-2">⚠️</div>
              )}
              {alertModal.type === "info" && (
                <div className="text-6xl text-blue-400 mb-2">ℹ️</div>
              )}
            </div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{
                color:
                  alertModal.type === "error"
                    ? "#ef5350"
                    : alertModal.type === "warning"
                    ? "#ffa726"
                    : "#29b6f6",
              }}
            >
              {alertModal.title}
            </h2>
            <p className="text-slate-300 mb-6 text-lg">{alertModal.message}</p>
            <button
              onClick={closeAlert}
              className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Finish Turn Confirmation Modal */}
      {showFinishTurnConfirm.isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="mb-4">
              <div className="text-6xl text-yellow-400 mb-2">⚠️</div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-yellow-400">
              Finish Turn?
            </h2>
            <p className="text-slate-300 mb-6 text-lg">
              Are you sure you want to finish? You still have{" "}
              <span className="text-yellow-400 font-bold">
                ₭-{showFinishTurnConfirm.remainingKredcoin}
              </span>{" "}
              left.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCancelFinishTurn}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFinishTurn}
                className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-md"
              >
                Yes, Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bureaucracy Phase Transition Message */}
      {showBureaucracyTransition && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] transition-opacity duration-500"
          aria-live="polite"
          role="status"
        >
          <div className="text-center animate-pulse">
            <h1
              className="text-8xl sm:text-9xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] mb-4"
              style={{
                textShadow:
                  "0 0 20px rgba(250,204,21,0.5), 0 0 40px rgba(250,204,21,0.3)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              BUREAUCRACY!
            </h1>
            <p className="text-2xl text-yellow-200 font-semibold">
              Prepare for the bureaucracy phase...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default App;
