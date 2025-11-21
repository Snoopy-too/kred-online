import { useState } from "react";
import {
  Player,
  GameState,
  Piece,
  BoardTile,
  Tile,
  TrackedMove,
  BureaucracyPlayerState,
  BureaucracyPurchase,
} from "../game/types";

/**
 * Custom hook for managing core game state
 * Consolidates all game state variables from App.tsx
 */
export function useGameState() {
  // Core game state
  const [gameState, setGameState] = useState<GameState>("PLAYER_SELECTION");
  const [players, setPlayers] = useState<Player[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [boardTiles, setBoardTiles] = useState<BoardTile[]>([]);
  const [bankedTiles, setBankedTiles] = useState<
    (BoardTile & { faceUp: boolean })[]
  >([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [draftRound, setDraftRound] = useState(1);
  const [isTestMode, setIsTestMode] = useState(false);

  // Board UI state
  const [dummyTile, setDummyTile] = useState<{
    position: { top: number; left: number };
    rotation: number;
  } | null>(null);
  const [boardRotationEnabled, setBoardRotationEnabled] = useState(true);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [credibilityRotationAdjustments, setCredibilityRotationAdjustments] =
    useState<{ [playerId: number]: number }>({});
  const [lastDroppedPosition, setLastDroppedPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [lastDroppedPieceId, setLastDroppedPieceId] = useState<string | null>(
    null
  );

  // Turn state
  const [hasPlayedTileThisTurn, setHasPlayedTileThisTurn] = useState(false);
  const [revealedTileId, setRevealedTileId] = useState<string | null>(null);
  const [movedPiecesThisTurn, setMovedPiecesThisTurn] = useState<Set<string>>(
    new Set()
  );
  const [movesThisTurn, setMovesThisTurn] = useState<TrackedMove[]>([]);
  const [piecesAtTurnStart, setPiecesAtTurnStart] = useState<Piece[]>([]);

  // Tile transaction state (acceptance/challenge flow)
  const [tileTransaction, setTileTransaction] = useState<{
    placerId: number;
    receiverId: number;
    boardTileId: string;
    tile: Tile;
  } | null>(null);
  const [bystanders, setBystanders] = useState<Player[]>([]);
  const [bystanderIndex, setBystanderIndex] = useState(0);
  const [isPrivatelyViewing, setIsPrivatelyViewing] = useState(false);
  const [showChallengeRevealModal, setShowChallengeRevealModal] =
    useState(false);
  const [challengedTile, setChallengedTile] = useState<Tile | null>(null);
  const [placerViewingTileId, setPlacerViewingTileId] = useState<string | null>(
    null
  );
  const [giveReceiverViewingTileId, setGiveReceiverViewingTileId] = useState<
    string | null
  >(null);

  // Tile play workflow state
  const [playedTile, setPlayedTile] = useState<{
    tileId: string;
    playerId: number;
    receivingPlayerId: number;
    movesPerformed: TrackedMove[];
    originalPieces: Piece[];
    originalBoardTiles: BoardTile[];
  } | null>(null);
  const [receiverAcceptance, setReceiverAcceptance] = useState<boolean | null>(
    null
  );
  const [challengeOrder, setChallengeOrder] = useState<number[]>([]);
  const [currentChallengerIndex, setCurrentChallengerIndex] = useState(0);
  const [tileRejected, setTileRejected] = useState(false);
  const [challengeResultMessage, setChallengeResultMessage] = useState<
    string | null
  >(null);
  const [tilePlayerMustWithdraw, setTilePlayerMustWithdraw] = useState(false);
  const [pendingCommunityPieces, setPendingCommunityPieces] = useState<
    Set<string>
  >(new Set());

  // Bonus move state
  const [showBonusMoveModal, setShowBonusMoveModal] = useState(false);
  const [bonusMovePlayerId, setBonusMovePlayerId] = useState<number | null>(
    null
  );
  const [bonusMoveWasCompleted, setBonusMoveWasCompleted] = useState(false);
  const [piecesBeforeBonusMove, setPiecesBeforeBonusMove] = useState<Piece[]>(
    []
  );
  const [piecesAtCorrectionStart, setPiecesAtCorrectionStart] = useState<
    Piece[]
  >([]);

  // Move validation state
  const [showMoveCheckResult, setShowMoveCheckResult] = useState(false);
  const [moveCheckResult, setMoveCheckResult] = useState<{
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
  } | null>(null);
  const [showPerfectTileModal, setShowPerfectTileModal] = useState(false);

  // Take Advantage (challenge reward) state
  const [showTakeAdvantageModal, setShowTakeAdvantageModal] = useState(false);
  const [takeAdvantageChallengerId, setTakeAdvantageChallengerId] = useState<
    number | null
  >(null);
  const [
    takeAdvantageChallengerCredibility,
    setTakeAdvantageChallengerCredibility,
  ] = useState<number>(0);
  const [showTakeAdvantageTileSelection, setShowTakeAdvantageTileSelection] =
    useState(false);
  const [selectedTilesForAdvantage, setSelectedTilesForAdvantage] = useState<
    Tile[]
  >([]);
  const [totalKredcoinForAdvantage, setTotalKredcoinForAdvantage] = useState(0);
  const [showTakeAdvantageMenu, setShowTakeAdvantageMenu] = useState(false);
  const [takeAdvantagePurchase, setTakeAdvantagePurchase] =
    useState<BureaucracyPurchase | null>(null);
  const [takeAdvantagePiecesSnapshot, setTakeAdvantagePiecesSnapshot] =
    useState<Piece[]>([]);
  const [takeAdvantageValidationError, setTakeAdvantageValidationError] =
    useState<string | null>(null);

  // Bureaucracy phase state
  const [bureaucracyStates, setBureaucracyStates] = useState<
    BureaucracyPlayerState[]
  >([]);
  const [bureaucracyTurnOrder, setBureaucracyTurnOrder] = useState<number[]>(
    []
  );
  const [currentBureaucracyPlayerIndex, setCurrentBureaucracyPlayerIndex] =
    useState(0);
  const [currentBureaucracyPurchase, setCurrentBureaucracyPurchase] =
    useState<BureaucracyPurchase | null>(null);
  const [showBureaucracyMenu, setShowBureaucracyMenu] = useState(true);
  const [bureaucracyValidationError, setBureaucracyValidationError] = useState<
    string | null
  >(null);
  const [bureaucracyMoves, setBureaucracyMoves] = useState<TrackedMove[]>([]);
  const [bureaucracySnapshot, setBureaucracySnapshot] = useState<{
    pieces: Piece[];
    boardTiles: BoardTile[];
  } | null>(null);
  const [showBureaucracyMoveCheckResult, setShowBureaucracyMoveCheckResult] =
    useState(false);
  const [bureaucracyMoveCheckResult, setBureaucracyMoveCheckResult] = useState<{
    isValid: boolean;
    reason: string;
  } | null>(null);
  const [showBureaucracyTransition, setShowBureaucracyTransition] =
    useState(false);

  // Game log state
  const [gameLog, setGameLog] = useState<string[]>([]);

  // UI expansion state
  const [isGameLogExpanded, setIsGameLogExpanded] = useState(true);
  const [isCredibilityAdjusterExpanded, setIsCredibilityAdjusterExpanded] =
    useState(false);
  const [isCredibilityRulesExpanded, setIsCredibilityRulesExpanded] =
    useState(false);
  const [isPieceTrackerExpanded, setIsPieceTrackerExpanded] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Helper function to show alerts
  const showAlert = (
    title: string,
    message: string,
    type: "error" | "warning" | "info" = "info"
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Return all state and setters
  return {
    // Core game state
    gameState,
    setGameState,
    players,
    setPlayers,
    pieces,
    setPieces,
    boardTiles,
    setBoardTiles,
    bankedTiles,
    setBankedTiles,
    playerCount,
    setPlayerCount,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    draftRound,
    setDraftRound,
    isTestMode,
    setIsTestMode,

    // Board UI state
    dummyTile,
    setDummyTile,
    boardRotationEnabled,
    setBoardRotationEnabled,
    showGridOverlay,
    setShowGridOverlay,
    credibilityRotationAdjustments,
    setCredibilityRotationAdjustments,
    lastDroppedPosition,
    setLastDroppedPosition,
    lastDroppedPieceId,
    setLastDroppedPieceId,

    // Turn state
    hasPlayedTileThisTurn,
    setHasPlayedTileThisTurn,
    revealedTileId,
    setRevealedTileId,
    movedPiecesThisTurn,
    setMovedPiecesThisTurn,
    movesThisTurn,
    setMovesThisTurn,
    piecesAtTurnStart,
    setPiecesAtTurnStart,

    // Tile transaction state
    tileTransaction,
    setTileTransaction,
    bystanders,
    setBystanders,
    bystanderIndex,
    setBystanderIndex,
    isPrivatelyViewing,
    setIsPrivatelyViewing,
    showChallengeRevealModal,
    setShowChallengeRevealModal,
    challengedTile,
    setChallengedTile,
    placerViewingTileId,
    setPlacerViewingTileId,
    giveReceiverViewingTileId,
    setGiveReceiverViewingTileId,

    // Tile play workflow state
    playedTile,
    setPlayedTile,
    receiverAcceptance,
    setReceiverAcceptance,
    challengeOrder,
    setChallengeOrder,
    currentChallengerIndex,
    setCurrentChallengerIndex,
    tileRejected,
    setTileRejected,
    challengeResultMessage,
    setChallengeResultMessage,
    tilePlayerMustWithdraw,
    setTilePlayerMustWithdraw,
    pendingCommunityPieces,
    setPendingCommunityPieces,

    // Bonus move state
    showBonusMoveModal,
    setShowBonusMoveModal,
    bonusMovePlayerId,
    setBonusMovePlayerId,
    bonusMoveWasCompleted,
    setBonusMoveWasCompleted,
    piecesBeforeBonusMove,
    setPiecesBeforeBonusMove,
    piecesAtCorrectionStart,
    setPiecesAtCorrectionStart,

    // Move validation state
    showMoveCheckResult,
    setShowMoveCheckResult,
    moveCheckResult,
    setMoveCheckResult,
    showPerfectTileModal,
    setShowPerfectTileModal,

    // Take Advantage state
    showTakeAdvantageModal,
    setShowTakeAdvantageModal,
    takeAdvantageChallengerId,
    setTakeAdvantageChallengerId,
    takeAdvantageChallengerCredibility,
    setTakeAdvantageChallengerCredibility,
    showTakeAdvantageTileSelection,
    setShowTakeAdvantageTileSelection,
    selectedTilesForAdvantage,
    setSelectedTilesForAdvantage,
    totalKredcoinForAdvantage,
    setTotalKredcoinForAdvantage,
    showTakeAdvantageMenu,
    setShowTakeAdvantageMenu,
    takeAdvantagePurchase,
    setTakeAdvantagePurchase,
    takeAdvantagePiecesSnapshot,
    setTakeAdvantagePiecesSnapshot,
    takeAdvantageValidationError,
    setTakeAdvantageValidationError,

    // Bureaucracy phase state
    bureaucracyStates,
    setBureaucracyStates,
    bureaucracyTurnOrder,
    setBureaucracyTurnOrder,
    currentBureaucracyPlayerIndex,
    setCurrentBureaucracyPlayerIndex,
    currentBureaucracyPurchase,
    setCurrentBureaucracyPurchase,
    showBureaucracyMenu,
    setShowBureaucracyMenu,
    bureaucracyValidationError,
    setBureaucracyValidationError,
    bureaucracyMoves,
    setBureaucracyMoves,
    bureaucracySnapshot,
    setBureaucracySnapshot,
    showBureaucracyMoveCheckResult,
    setShowBureaucracyMoveCheckResult,
    bureaucracyMoveCheckResult,
    setBureaucracyMoveCheckResult,
    showBureaucracyTransition,
    setShowBureaucracyTransition,

    // Game log state
    gameLog,
    setGameLog,

    // UI expansion state
    isGameLogExpanded,
    setIsGameLogExpanded,
    isCredibilityAdjusterExpanded,
    setIsCredibilityAdjusterExpanded,
    isCredibilityRulesExpanded,
    setIsCredibilityRulesExpanded,
    isPieceTrackerExpanded,
    setIsPieceTrackerExpanded,

    // Alert modal state
    alertModal,
    setAlertModal,
    showAlert,
  };
}
