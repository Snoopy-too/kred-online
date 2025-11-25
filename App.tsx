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
// COMPONENT IMPORTS - Extracted React components
// ============================================================================
import ErrorDisplay from "./src/components/shared/ErrorDisplay";

import { ALERTS, TIMEOUTS, DEFAULTS } from "./constants";
import {
  getPlayerName,
  getPlayerNameSimple,
  getPlayerById,
  formatWinnerNames,
  isPlayerDomain,
  isCommunityLocation,
} from "./utils";

// --- Helper Components ---

const PlayerSelectionScreen: React.FC<{
  onStartGame: (
    playerCount: number,
    isTestMode: boolean,
    skipDraft: boolean,
    skipCampaign: boolean
  ) => void;
}> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isTestMode, setIsTestMode] = useState(true);
  const [skipDraft, setSkipDraft] = useState(false);
  const [skipCampaign, setSkipCampaign] = useState(false);

  // Auto-uncheck skipCampaign when skipDraft is unchecked
  React.useEffect(() => {
    if (!skipDraft && skipCampaign) {
      setSkipCampaign(false);
    }
  }, [skipDraft, skipCampaign]);

  return (
    <main className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="text-center mb-12">
        <img
          src="./images/logo.png"
          alt="Kred Logo"
          className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
          style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))" }}
        />
        <p className="text-xl text-sky-900 mt-2 italic">
          You can't trust anyone!
        </p>
      </div>

      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
          Select Players
        </h2>
        <p className="text-slate-600 mt-2 max-w-md">
          Choose 3, 4, or 5 players to begin.
        </p>
      </div>
      <div className="flex space-x-4 my-10">
        {PLAYER_OPTIONS.map((count) => (
          <button
            key={count}
            onClick={() => setPlayerCount(count)}
            className={`w-24 h-24 sm:w-32 sm:h-32 text-2xl font-bold rounded-lg transition-all duration-200 ease-in-out border-2 ${
              playerCount === count
                ? "bg-indigo-600 border-indigo-400 scale-110 shadow-lg text-white"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
            aria-pressed={playerCount === count}
          >
            {count} Players
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 my-6">
        <div className="flex items-center">
          <input
            id="test-mode-checkbox"
            type="checkbox"
            checked={isTestMode}
            onChange={(e) => setIsTestMode(e.target.checked)}
            className="h-5 w-5 rounded bg-white border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="test-mode-checkbox"
            className="ml-3 text-slate-600 cursor-pointer"
          >
            Test Mode (Single user plays for everyone)
          </label>
        </div>
        {isTestMode && (
          <>
            <div className="flex items-center ml-6">
              <input
                id="skip-draft-checkbox"
                type="checkbox"
                checked={skipDraft}
                onChange={(e) => setSkipDraft(e.target.checked)}
                className="h-5 w-5 rounded bg-white border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <label
                htmlFor="skip-draft-checkbox"
                className="ml-3 text-slate-600 cursor-pointer"
              >
                Skip Draft Phase (Random tile distribution)
              </label>
            </div>
            <div className="flex items-center ml-6">
              <input
                id="skip-campaign-checkbox"
                type="checkbox"
                checked={skipCampaign}
                disabled={!skipDraft}
                onChange={(e) => setSkipCampaign(e.target.checked)}
                className={`h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 ${
                  !skipDraft
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-white cursor-pointer"
                }`}
              />
              <label
                htmlFor="skip-campaign-checkbox"
                className={`ml-3 ${
                  !skipDraft
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-600 cursor-pointer"
                }`}
              >
                Skip Campaign Phase (Go directly to Bureaucracy)
              </label>
            </div>
          </>
        )}
      </div>
      <button
        onClick={() =>
          onStartGame(playerCount, isTestMode, skipDraft, skipCampaign)
        }
        className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-500 transition-colors shadow-md hover:shadow-lg"
      >
        Start Game
      </button>
    </main>
  );
};

const DraftingScreen: React.FC<{
  players: Player[];
  currentPlayerIndex: number;
  draftRound: number;
  onSelectTile: (tile: Tile) => void;
}> = ({ players, currentPlayerIndex, draftRound, onSelectTile }) => {
  const currentPlayer = players[currentPlayerIndex];
  const handSize = players[0].keptTiles.length + players[0].hand.length;

  return (
    <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Drafting Phase
        </h1>
        <p className="text-xl text-slate-300 mt-2">
          {`Round ${draftRound} of ${handSize}`}
        </p>
        <h2 className="text-3xl text-slate-100 mt-4">
          {`Player ${currentPlayer.id}'s Turn`}
        </h2>
        <p className="text-slate-400">Select one tile to keep.</p>
      </div>

      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-center mb-4">
          Your Hand ({currentPlayer.hand.length} tiles)
        </h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {currentPlayer.hand.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onSelectTile(tile)}
              className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 rounded-lg group"
              aria-label={`Select tile ${tile.id}`}
            >
              <div className="bg-stone-100 w-16 h-32 sm:w-20 sm:h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 group-hover:border-cyan-400 transition-colors flex items-center justify-center">
                <img
                  src={tile.url}
                  alt={`Tile ${tile.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

const BureaucracyScreen: React.FC<{
  players: Player[];
  pieces: Piece[];
  boardTiles: BoardTile[];
  playerCount: number;
  currentBureaucracyPlayerIndex: number;
  bureaucracyStates: BureaucracyPlayerState[];
  currentPurchase: BureaucracyPurchase | null;
  showPurchaseMenu: boolean;
  validationError: string | null;
  turnOrder: number[];
  boardRotationEnabled: boolean;
  setBoardRotationEnabled: (enabled: boolean) => void;
  onSelectMenuItem: (item: BureaucracyMenuItem) => void;
  onDoneWithAction: () => void;
  onFinishTurn: () => void;
  onPieceMove: (
    pieceId: string,
    newPosition: { top: number; left: number },
    locationId?: string
  ) => void;
  onPiecePromote: (pieceId: string) => void;
  onClearValidationError: () => void;
  onResetAction: () => void;
  onCheckMove: () => void;
  showMoveCheckResult: boolean;
  moveCheckResult: { isValid: boolean; reason: string } | null;
  onCloseMoveCheckResult: () => void;
  isTestMode: boolean;
  BOARD_IMAGE_URLS: { [key: number]: string };
  credibilityRotationAdjustments: { [playerId: number]: number };
}> = ({
  players,
  pieces,
  boardTiles,
  playerCount,
  currentBureaucracyPlayerIndex,
  bureaucracyStates,
  currentPurchase,
  showPurchaseMenu,
  validationError,
  turnOrder,
  boardRotationEnabled,
  setBoardRotationEnabled,
  onSelectMenuItem,
  onDoneWithAction,
  onFinishTurn,
  onPieceMove,
  onPiecePromote,
  onClearValidationError,
  onResetAction,
  onCheckMove,
  showMoveCheckResult,
  moveCheckResult,
  onCloseMoveCheckResult,
  isTestMode,
  BOARD_IMAGE_URLS,
  credibilityRotationAdjustments,
}) => {
  const currentPlayerId = turnOrder[currentBureaucracyPlayerIndex];
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const playerState = bureaucracyStates.find(
    (s) => s.playerId === currentPlayerId
  );
  const menu = getBureaucracyMenu(playerCount);
  const affordableItems = playerState
    ? getAvailablePurchases(menu, playerState.remainingKredcoin)
    : [];
  const isPromotionPurchase = currentPurchase?.item.type === "PROMOTION";
  const boardRotation = boardRotationEnabled
    ? PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0
    : 0;

  // Drag and drop state
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

  // Drag handlers
  const handleDragStartPiece = (
    e: React.DragEvent<HTMLDivElement>,
    pieceId: string
  ) => {
    e.dataTransfer.setData("pieceId", pieceId);
    e.dataTransfer.effectAllowed = "move";
    const piece = pieces.find((p) => p.id === pieceId);
    if (piece) {
      setDraggedPieceInfo({
        name: piece.name,
        imageUrl: piece.imageUrl,
        pieceId: piece.id,
        locationId: piece.locationId,
      });
    }
  };

  const handleDragEndPiece = () => {
    setDraggedPieceInfo(null);
    setDropIndicator(null);
  };

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

  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicator(null);
    const pieceId = e.dataTransfer.getData("pieceId");

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

  const handleMouseLeaveBoard = () => {
    setDropIndicator(null);
  };

  let indicatorSizeClass = "";
  if (dropIndicator) {
    if (dropIndicator.name === "Heel")
      indicatorSizeClass = "w-14 h-14 sm:w-16 sm:h-16";
    else if (dropIndicator.name === "Pawn")
      indicatorSizeClass = "w-16 h-16 sm:w-20 sm:h-20";
    else indicatorSizeClass = "w-10 h-10 sm:w-14 sm:h-14"; // Mark
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 font-sans text-slate-100">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
          Bureaucracy Phase
        </h1>
        <p className="text-2xl text-slate-200 mt-2">
          Player {currentPlayerId}'s Turn
        </p>
        <div className="mt-2 text-lg">
          <span className="text-yellow-400 font-bold">
            Kredcoin: ₭-{playerState?.remainingKredcoin || 0}
          </span>
        </div>
      </div>

      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              Invalid Action
            </h2>
            <div className="flex justify-center">
              <button
                onClick={onResetAction}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors"
              >
                Reset Pieces
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Board and Menu Side by Side */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Game Board */}
        <div className="relative w-full lg:w-2/3 aspect-square bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-500"
            style={{ transform: `rotate(${boardRotation}deg)` }}
            onDragOver={handleDragOverBoard}
            onDrop={handleDropOnBoard}
            onMouseLeave={handleMouseLeaveBoard}
          >
            <img
              src={BOARD_IMAGE_URLS[playerCount]}
              alt={`${playerCount}-player board`}
              className="absolute inset-0 w-full h-full object-contain"
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

            {/* Render pieces */}
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
              const finalScale = baseScale * scaleMultiplier;

              // For pieces in community locations, apply inverse board rotation to counteract the board's perspective rotation
              // Check both position AND locationId to avoid false positives for seats near the community
              const isInCommunity =
                piece.locationId?.startsWith("community") || false;
              const communityCounterRotation = isInCommunity
                ? -boardRotation
                : 0;

              const isDraggable = !showPurchaseMenu && !isPromotionPurchase;

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
                      onPiecePromote(piece.id);
                    }
                  }}
                  className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out ${
                    isPromotionPurchase
                      ? "cursor-pointer hover:scale-110"
                      : isDraggable
                      ? "cursor-grab"
                      : "cursor-not-allowed"
                  }`}
                  style={{
                    position: "absolute",
                    top: `${piece.position.top}%`,
                    left: `${piece.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${
                      piece.rotation + communityCounterRotation
                    }deg) scale(${finalScale})`,
                  }}
                  aria-hidden="true"
                />
              );
            })}

            {/* Render board tiles */}
            {boardTiles.map((boardTile) => (
              <div
                key={boardTile.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${boardTile.position.left}%`,
                  top: `${boardTile.position.top}%`,
                  transform: `translate(-50%, -50%) rotate(${
                    boardTile.rotation - boardRotation
                  }deg)`,
                  width: "3%",
                  height: "6%",
                }}
              >
                <img
                  src={boardTile.tile.url}
                  alt={`Tile ${boardTile.tile.id}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            ))}

            {/* Credibility display */}
            {(() => {
              const credibilityLocations =
                CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount] || [];
              return credibilityLocations.map((location) => {
                const player = players.find((p) => p.id === location.ownerId);
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
          </div>
        </div>

        {/* Right Side Panel: Purchase Menu and Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* Actions Menu */}
          {showPurchaseMenu && (
            <div className="bg-gray-800/90 rounded-lg shadow-2xl border-2 border-yellow-600/50 p-6">
              <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">
                Actions
              </h2>
              <div className="space-y-3">
                {/* Move items in two rows of three */}
                {menu.some((item) => item.type === "MOVE") && (
                  <>
                    {/* First row: Assist, Remove, Influence */}
                    <div className="grid grid-cols-3 gap-2">
                      {menu
                        .filter(
                          (item) =>
                            item.type === "MOVE" &&
                            ["ASSIST", "REMOVE", "INFLUENCE"].includes(
                              item.moveType || ""
                            )
                        )
                        .map((item) => {
                          const canAfford = affordableItems.some(
                            (ai) => ai.id === item.id
                          );
                          return (
                            <button
                              key={item.id}
                              onClick={() =>
                                canAfford && onSelectMenuItem(item)
                              }
                              disabled={!canAfford}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                canAfford
                                  ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                  : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                              }`}
                            >
                              <div className="text-center">
                                <span className="font-bold text-sm block mb-1">
                                  {item.moveType}
                                </span>
                                <span
                                  className={`text-base font-bold ${
                                    canAfford
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
                            ["ADVANCE", "WITHDRAW", "ORGANIZE"].includes(
                              item.moveType || ""
                            )
                        )
                        .map((item) => {
                          const canAfford = affordableItems.some(
                            (ai) => ai.id === item.id
                          );
                          return (
                            <button
                              key={item.id}
                              onClick={() =>
                                canAfford && onSelectMenuItem(item)
                              }
                              disabled={!canAfford}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                canAfford
                                  ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                  : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                              }`}
                            >
                              <div className="text-center">
                                <span className="font-bold text-sm block mb-1">
                                  {item.moveType}
                                </span>
                                <span
                                  className={`text-base font-bold ${
                                    canAfford
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
                {/* Non-move items (Promotion, Credibility) remain full width */}
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
                    const isEnabled = canAfford && !isCredibilityAtMax;
                    return (
                      <button
                        key={item.id}
                        onClick={() => isEnabled && onSelectMenuItem(item)}
                        disabled={!isEnabled}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isEnabled
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
                            className={`text-xl font-bold ${
                              isEnabled ? "text-yellow-400" : "text-gray-600"
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
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={onFinishTurn}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  Finish Turn
                </button>
              </div>
            </div>
          )}

          {/* Action in Progress */}
          {!showPurchaseMenu && currentPurchase && (
            <div className="bg-blue-900/90 rounded-lg shadow-2xl border-2 border-blue-500 p-6">
              <h2 className="text-2xl font-bold text-center mb-4 text-blue-300">
                Perform Your Action
              </h2>
              <p className="text-center text-lg mb-6">
                {currentPurchase.item.type === "PROMOTION" && (
                  <>
                    Promote a{" "}
                    {currentPurchase.item.promotionLocation === "OFFICE"
                      ? "piece in your Office"
                      : currentPurchase.item.promotionLocation === "ROSTRUM"
                      ? "piece in one of your Rostrums"
                      : "piece in one of your Seats"}
                  </>
                )}
                {currentPurchase.item.type === "MOVE" && (
                  <>Perform a {currentPurchase.item.moveType} move</>
                )}
                {currentPurchase.item.type === "CREDIBILITY" && (
                  <>Your credibility has been restored</>
                )}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onResetAction}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  Reset
                </button>
                <button
                  onClick={onDoneWithAction}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Turn Progress */}
          <div className="bg-gray-800/70 rounded-lg p-4">
            <h3 className="text-lg font-bold text-center mb-3 text-yellow-400">
              Turn Order
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {turnOrder.map((playerId, index) => {
                const pState = bureaucracyStates.find(
                  (s) => s.playerId === playerId
                );
                const isCurrentPlayer = index === currentBureaucracyPlayerIndex;
                const isComplete = pState?.turnComplete;

                return (
                  <div
                    key={playerId}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      isCurrentPlayer
                        ? "bg-yellow-600 border-yellow-400 text-white font-bold"
                        : isComplete
                        ? "bg-green-800 border-green-600 text-green-200"
                        : "bg-gray-700 border-gray-500 text-gray-300"
                    }`}
                  >
                    Player {playerId} {isComplete && "✓"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Board Rotation Toggle */}
          <div className="bg-gray-800/70 rounded-lg p-3">
            <label className="flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                checked={boardRotationEnabled}
                onChange={(e) => setBoardRotationEnabled(e.target.checked)}
                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
              />
              <span className="ml-3 text-slate-200">
                Board Rotation {boardRotationEnabled ? "(ON)" : "(OFF)"}
              </span>
            </label>
          </div>

          {/* Check Move Button (Test Mode Only) */}
          {isTestMode &&
            !showPurchaseMenu &&
            currentPurchase &&
            currentPurchase.item.type === "MOVE" && (
              <div className="bg-gray-700 rounded-lg p-4">
                <button
                  onClick={onCheckMove}
                  className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-lg"
                >
                  ✓ Check Move
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  Validate if the move matches your selected action type.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Move Check Result Modal */}
      {showMoveCheckResult && moveCheckResult && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-xl text-center shadow-2xl max-w-lg w-full">
            <div className="mb-8">
              {moveCheckResult.isValid ? (
                <div className="text-center">
                  <div className="text-9xl text-green-500 font-bold mb-4">
                    ✓
                  </div>
                  <h2 className="text-4xl font-bold text-green-400 mb-2">
                    Valid Move!
                  </h2>
                  <p className="text-lg text-green-300">
                    The move matches the selected action type.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-9xl text-red-500 font-bold mb-4">✕</div>
                  <h2 className="text-4xl font-bold text-red-400 mb-2">
                    Invalid Move
                  </h2>
                  <p className="text-lg text-red-300">
                    {moveCheckResult.reason}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onCloseMoveCheckResult}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

const CampaignScreen: React.FC<{
  gameState: GameState;
  playerCount: number;
  players: Player[];
  pieces: Piece[];
  boardTiles: BoardTile[];
  bankedTiles: (BoardTile & { faceUp: boolean })[];
  currentPlayerId: number;
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
  hasPlayedTileThisTurn: boolean;
  revealedTileId: string | null;
  tileTransaction: {
    placerId: number;
    receiverId: number;
    boardTileId: string;
    tile: Tile;
  } | null;
  isPrivatelyViewing: boolean;
  bystanders: Player[];
  bystanderIndex: number;
  showChallengeRevealModal: boolean;
  challengedTile: Tile | null;
  placerViewingTileId: string | null;
  giveReceiverViewingTileId: string | null;
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
  onPlacerViewTile: (tileId: string) => void;
  onSetGiveReceiverViewingTileId: (tileId: string | null) => void;
  playedTile?: {
    tileId: string;
    playerId: number;
    receivingPlayerId: number;
    movesPerformed: TrackedMove[];
    originalPieces: Piece[];
    originalBoardTiles: BoardTile[];
  } | null;
  receiverAcceptance?: boolean | null;
  onReceiverAcceptanceDecision?: (accepted: boolean) => void;
  onChallengerDecision?: (challenge: boolean) => void;
  onCorrectionComplete?: () => void;
  tileRejected?: boolean;
  showMoveCheckResult?: boolean;
  moveCheckResult?: {
    isMet: boolean;
    requiredMoves: TrackedMove[];
    performedMoves: TrackedMove[];
    missingMoves: TrackedMove[];
    moveValidations?: Array<{
      moveType: string;
      isValid: boolean;
      reason: string;
      fromLocationId?: string;
      toLocationId?: string;
    }>;
  } | null;
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
  showPerfectTileModal: boolean;
  setShowPerfectTileModal: (show: boolean) => void;
  showBonusMoveModal: boolean;
  bonusMovePlayerId: number | null;
  onBonusMoveComplete: () => void;
  movedPiecesThisTurn: Set<string>;
  onResetTurn: () => void;
  onResetPiecesCorrection: () => void;
  onResetBonusMove: () => void;
  showTakeAdvantageModal: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;
  showTakeAdvantageTileSelection: boolean;
  selectedTilesForAdvantage: Tile[];
  totalKredcoinForAdvantage: number;
  showTakeAdvantageMenu: boolean;
  takeAdvantagePurchase: BureaucracyPurchase | null;
  takeAdvantageValidationError: string | null;
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
}> = ({
  gameState,
  playerCount,
  players,
  pieces,
  boardTiles,
  bankedTiles,
  currentPlayerId,
  lastDroppedPosition,
  lastDroppedPieceId,
  isTestMode,
  dummyTile,
  setDummyTile,
  boardRotationEnabled,
  setBoardRotationEnabled,
  showGridOverlay,
  setShowGridOverlay,
  hasPlayedTileThisTurn,
  revealedTileId,
  tileTransaction,
  isPrivatelyViewing,
  bystanders,
  bystanderIndex,
  showChallengeRevealModal,
  challengedTile,
  placerViewingTileId,
  giveReceiverViewingTileId,
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
  onPlacerViewTile,
  onSetGiveReceiverViewingTileId,
  playedTile,
  receiverAcceptance,
  onReceiverAcceptanceDecision,
  onChallengerDecision,
  onCorrectionComplete,
  tileRejected,
  showMoveCheckResult,
  moveCheckResult,
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
  showPerfectTileModal,
  setShowPerfectTileModal,
  showBonusMoveModal,
  bonusMovePlayerId,
  onBonusMoveComplete,
  movedPiecesThisTurn,
  onResetTurn,
  onResetPiecesCorrection,
  onResetBonusMove,
  showTakeAdvantageModal,
  takeAdvantageChallengerId,
  takeAdvantageChallengerCredibility,
  showTakeAdvantageTileSelection,
  selectedTilesForAdvantage,
  totalKredcoinForAdvantage,
  showTakeAdvantageMenu,
  takeAdvantagePurchase,
  takeAdvantageValidationError,
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
}) => {
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
  const boardRotation = boardRotationEnabled
    ? PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0
    : 0;

  const tileSpaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
  const occupiedOwnerIds = new Set(boardTiles.map((bt) => bt.ownerId));
  const unoccupiedSpaces = tileSpaces.filter(
    (space) => !occupiedOwnerIds.has(space.ownerId)
  );

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [gameLog]);

  // Calculate Kredcoin for a player (only face-down tiles in bank count)
  const calculatePlayerKredcoin = (playerId: number): number => {
    const playerBankedTiles = bankedTiles.filter(
      (bt) => bt.ownerId === playerId && !bt.faceUp
    );
    return playerBankedTiles.reduce((total, bankedTile) => {
      const tileValue = TILE_KREDCOIN_VALUES[bankedTile.tile.id] || 0;
      return total + tileValue;
    }, 0);
  };

  const handleMouseMoveOnBoard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTestMode) return;
    const boardRect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setBoardMousePosition({ x: clampedX, y: clampedY });
  };

  const handleMouseLeaveBoard = () => {
    if (isTestMode) {
      setBoardMousePosition(null);
    }
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

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

  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicator(null);
    const boardTileId = e.dataTransfer.getData("boardTileId");
    const pieceId = e.dataTransfer.getData("pieceId");
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
      const currentPlayer = players.find((p) => p.id === currentPlayerId);
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

  const handleDragStartPiece = (
    e: React.DragEvent<HTMLImageElement>,
    pieceId: string
  ) => {
    e.dataTransfer.setData("pieceId", pieceId);
    e.dataTransfer.effectAllowed = "move";
    const piece = pieces.find((p) => p.id === pieceId);
    if (piece) {
      setDraggedPieceInfo({
        name: piece.name,
        imageUrl: piece.imageUrl,
        pieceId: piece.id,
        locationId: piece.locationId,
      });
    }
  };

  const handleDragEndPiece = () => {
    setDraggedPieceInfo(null);
    setDropIndicator(null);
  };

  const handleDragStartTile = (
    e: React.DragEvent<HTMLDivElement>,
    tileId: number
  ) => {
    e.dataTransfer.setData("tileId", tileId.toString());
    e.dataTransfer.effectAllowed = "move";
    setIsDraggingTile(true);
  };

  const handleDragStartBoardTile = (
    e: React.DragEvent<HTMLDivElement>,
    boardTileId: string
  ) => {
    e.dataTransfer.setData("boardTileId", boardTileId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartDummyTile = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("dummyTile", "true");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEndDummyTile = () => {
    setDropIndicator(null);
  };

  const handleRotateDummyTile = (degrees: number) => {
    if (dummyTile) {
      setDummyTile({
        ...dummyTile,
        rotation: (dummyTile.rotation + degrees) % 360,
      });
    }
  };

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  // Check if it's the current player's turn for a decision (accept/reject or challenge)
  // In test mode, always show decision dialogs so player can control all players
  // NEW WORKFLOW: Uses playedTile for PENDING_ACCEPTANCE
  // OLD WORKFLOW: Uses tileTransaction for PENDING_CHALLENGE
  const isMyTurnForDecision =
    isTestMode ||
    (gameState === "PENDING_ACCEPTANCE" &&
      playedTile &&
      currentPlayerId === playedTile.receivingPlayerId) ||
    (gameState === "PENDING_ACCEPTANCE" &&
      !playedTile &&
      currentPlayerId === tileTransaction?.receiverId) ||
    (gameState === "PENDING_CHALLENGE" &&
      bystanders[bystanderIndex]?.id === currentPlayerId);

  const showWaitingOverlay =
    (gameState === "PENDING_ACCEPTANCE" || gameState === "PENDING_CHALLENGE") &&
    !isMyTurnForDecision;

  let waitingMessage = "";
  let waitingPlayerId = undefined;
  if (showWaitingOverlay) {
    if (gameState === "PENDING_ACCEPTANCE") {
      waitingPlayerId =
        playedTile?.receivingPlayerId || tileTransaction?.receiverId;
      waitingMessage = `Waiting for Player ${waitingPlayerId} to respond...`;
    } else if (gameState === "PENDING_CHALLENGE") {
      waitingPlayerId = bystanders[bystanderIndex]?.id;
      waitingMessage = `Waiting for Player ${waitingPlayerId} to respond...`;
    }
  }

  let indicatorSizeClass = "";
  if (dropIndicator) {
    if (dropIndicator.name === "Heel")
      indicatorSizeClass = "w-14 h-14 sm:w-16 sm:h-16";
    else if (dropIndicator.name === "Pawn")
      indicatorSizeClass = "w-16 h-16 sm:w-20 sm:h-20";
    else indicatorSizeClass = "w-10 h-10 sm:w-14 sm:h-14"; // Mark
  }
  const indicatorScaleStyle = dropIndicator ? { transform: "scale(0.84)" } : {};

  return (
    <main className="min-h-screen w-full bg-[#808080] flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-start lg:gap-8">
        {/* Main Content (Board, Hand, etc.) */}
        <div
          className="flex-1 flex flex-col items-center min-w-0"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 100%",
          }}
        >
          <div className="w-full max-w-5xl text-center mb-4 relative z-50">
            <div className="inline-block bg-gray-800/80 backdrop-blur-sm border border-cyan-700/50 shadow-lg rounded-xl px-6 py-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan-300 tracking-wide">
                Player {currentPlayerId}'s Turn
              </h2>
            </div>
          </div>
          <div
            className="w-full max-w-5xl aspect-[1/1] transition-transform duration-1000 ease-in-out hover:scale-105 relative"
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
            }}
          >
            <img
              src={BOARD_IMAGE_URLS[playerCount]}
              alt={`A ${playerCount}-player game board`}
              className="w-full h-full object-contain relative z-0"
            />
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

            {unoccupiedSpaces.map((space) => (
              <div
                key={`space-${space.ownerId}`}
                onDrop={(e) => handleDropOnTileSpace(e, space)}
                onDragOver={handleDragOver}
                className={`absolute w-12 h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-center transition-all duration-300
                  ${
                    isDraggingTile
                      ? "border-cyan-400 bg-cyan-500/20 scale-105 border-solid"
                      : "border-cyan-400/50"
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
                  className={`font-semibold text-xs leading-tight ${
                    isDraggingTile ? "text-cyan-200" : "text-cyan-400/70"
                  }`}
                >
                  <div>Drop Tile</div> <div>For P{space.ownerId}</div>
                </div>
              </div>
            ))}

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

              // NEW RULE: Giver and receiver can toggle to see the tile face-up by clicking
              const isGiverOrReceiver =
                isPlacer ||
                (isPlayedTile &&
                  currentPlayerId === playedTile.receivingPlayerId);
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

              // CORRECTION_REQUIRED: Show tile face-up for placer to see requirements
              const showCorrectionView =
                isPlayedTile && gameState === "CORRECTION_REQUIRED" && isPlacer;

              const isRevealed =
                isPubliclyRevealed ||
                showReceiverPrivateView ||
                showPlacerPrivateView ||
                showGiverReceiverView ||
                showCorrectionView;

              // During tile play workflow, show white back unless it's being viewed by giver/receiver
              const shouldShowWhiteBack =
                isTilePlayedButNotYetAccepted && !showGiverReceiverView;

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
                  className={`absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 ${
                    !isRevealed && !shouldShowWhiteBack
                      ? ""
                      : "bg-stone-100 p-1"
                  }`}
                  style={{
                    top: `${boardTile.position.top}%`,
                    left: `${boardTile.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${
                      boardTile.rotation || 0
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
                    // Show gray back for old workflow tiles
                    <div className="w-full h-full bg-gray-700 rounded-lg border-2 border-white shadow-inner"></div>
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

            {/* Banked tiles */}
            {bankedTiles.map((bankedTile) => (
              <div
                key={bankedTile.id}
                className="absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 bg-stone-100 p-1"
                style={{
                  top: `${bankedTile.position.top}%`,
                  left: `${bankedTile.position.left}%`,
                  transform: `translate(-50%, -50%) rotate(${
                    bankedTile.rotation || 0
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

            {/* Credibility display */}
            {(() => {
              const credibilityLocations =
                CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount] || [];
              return credibilityLocations.map((location) => {
                const player = players.find((p) => p.id === location.ownerId);
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
              const finalScale = baseScale * scaleMultiplier;

              // For pieces in community locations, apply inverse board rotation to counteract the board's perspective rotation
              // Check both position AND locationId to avoid false positives for seats near the community
              const isInCommunity =
                piece.locationId?.startsWith("community") || false;
              const communityCounterRotation = isInCommunity
                ? -boardRotation
                : 0;

              // Check if this piece has been moved this turn
              const hasMoved = movedPiecesThisTurn.has(piece.id);

              return (
                <img
                  key={piece.id}
                  src={piece.imageUrl}
                  alt={piece.name}
                  draggable="true"
                  onDragStart={(e) => handleDragStartPiece(e, piece.id)}
                  onDragEnd={handleDragEndPiece}
                  className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out ${
                    hasMoved
                      ? "ring-4 ring-amber-400 ring-opacity-70 rounded-full"
                      : ""
                  }`}
                  style={{
                    position: "absolute",
                    top: `${piece.position.top}%`,
                    left: `${piece.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${
                      piece.rotation + communityCounterRotation
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
          </div>

          <div className="w-full max-w-5xl mt-8 relative z-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-200">
                Player {currentPlayerId}'s Hand
              </h2>
              <div className="flex gap-2">
                {(gameState === "TILE_PLAYED" ||
                  movedPiecesThisTurn.size > 0) &&
                  gameState !== "CORRECTION_REQUIRED" &&
                  !showBonusMoveModal && (
                    <button
                      onClick={onResetTurn}
                      className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-md whitespace-nowrap"
                    >
                      Reset Turn
                    </button>
                  )}
                {gameState === "CORRECTION_REQUIRED" && playedTile && (
                  <button
                    onClick={onResetPiecesCorrection}
                    className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-md whitespace-nowrap"
                  >
                    Reset Pieces
                  </button>
                )}
                <button
                  onClick={onEndTurn}
                  disabled={
                    (gameState !== "CAMPAIGN" &&
                      gameState !== "TILE_PLAYED" &&
                      gameState !== "CORRECTION_REQUIRED") ||
                    (gameState === "CAMPAIGN" && !hasPlayedTileThisTurn)
                  }
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  End Turn
                </button>
              </div>
            </div>
            <p
              className={`text-center mb-4 ${
                gameState === "CORRECTION_REQUIRED"
                  ? "text-yellow-400 font-semibold"
                  : hasPlayedTileThisTurn
                  ? "text-slate-400"
                  : "text-white"
              }`}
            >
              {gameState === "CORRECTION_REQUIRED"
                ? "Your tile was rejected. The tile requirements are shown above. Move your pieces to fulfill them, then click End Turn."
                : hasPlayedTileThisTurn
                ? "You have played a tile this turn."
                : "Drag a tile to another player's receiving area on the board."}
            </p>
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700 min-h-[8rem]">
              {currentPlayer?.keptTiles.map((tile) => (
                <div
                  key={tile.id}
                  draggable={!hasPlayedTileThisTurn}
                  onDragStart={(e) => handleDragStartTile(e, tile.id)}
                  onDragEnd={() => setIsDraggingTile(false)}
                  className={`bg-stone-100 w-12 h-24 p-1 rounded-md shadow-md border border-gray-300 transition-transform hover:scale-105 ${
                    hasPlayedTileThisTurn || gameState !== "CAMPAIGN"
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-grab"
                  }`}
                >
                  <img
                    src={tile.url}
                    alt={`Tile ${tile.id}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {isTestMode && (
            <div className="w-full max-w-5xl mt-4">
              <h3 className="text-xl font-bold text-center text-slate-300 mb-2">
                Other Players (Test Mode)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players
                  .filter((p) => p.id !== currentPlayerId)
                  .map((player) => (
                    <details
                      key={player.id}
                      className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 cursor-pointer"
                    >
                      <summary className="font-semibold text-lg text-slate-100">
                        Player {player.id}'s Tiles ({player.keptTiles.length})
                      </summary>
                      <div className="mt-4">
                        <h4 className="font-semibold text-md text-slate-300">
                          Playable Hand:
                        </h4>
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          {player.keptTiles.map((tile) => (
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
                          ))}
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
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Supply & Log */}
        <div className="w-full lg:w-72 lg:flex-shrink-0 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-8 flex flex-col gap-8">
            {/* New Game Button */}
            <button
              onClick={onNewGame}
              className="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-md"
            >
              New Game
            </button>

            {/* Game Log */}
            <div>
              <button
                onClick={() => setIsGameLogExpanded(!isGameLogExpanded)}
                className="w-full text-left mb-4 flex items-center justify-between"
              >
                <h2 className="text-2xl font-bold text-slate-200">Game Log</h2>
                <span className="text-slate-400 text-xl">
                  {isGameLogExpanded ? "▼" : "▶"}
                </span>
              </button>
              {isGameLogExpanded && (
                <div
                  ref={logContainerRef}
                  className="h-64 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto text-sm"
                >
                  {gameLog.length === 0 ? (
                    <p className="text-slate-400 text-center italic m-auto">
                      No actions logged yet.
                    </p>
                  ) : (
                    [...gameLog].reverse().map((entry, index) => (
                      <p
                        key={gameLog.length - 1 - index}
                        className={`text-slate-300 mb-2 ${
                          entry.startsWith("---")
                            ? "font-bold text-cyan-300 mt-2 border-b border-gray-600 pb-2"
                            : ""
                        }`}
                      >
                        {entry}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bonus Move Notification */}
            {showBonusMoveModal && bonusMovePlayerId !== null && (
              <div className="mt-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-2xl border-2 border-green-400 animate-pulse">
                <h2 className="text-3xl font-extrabold text-white mb-3 text-center">
                  🎉 BONUS MOVE!
                </h2>
                <p className="text-green-100 mb-3 text-center font-semibold">
                  Player {bonusMovePlayerId}, you already had 3 Credibility!
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

            {/* Test Mode Controls */}
            {isTestMode && (
              <div className="mt-8 space-y-4">
                {/* Board Rotation Toggle */}
                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardRotationEnabled}
                      onChange={(e) =>
                        setBoardRotationEnabled(e.target.checked)
                      }
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
                    When ON, the board rotates to show each player's
                    perspective. When OFF, the board stays fixed.
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
                    When ON, displays a 2% grid overlay on the board to help
                    with tile placement. When OFF, the grid is hidden.
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

            {/* Credibility Rotation Adjuster (Test Mode Only) */}
            {isTestMode && (
              <div className="mt-8 bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() =>
                    setIsCredibilityAdjusterExpanded(
                      !isCredibilityAdjusterExpanded
                    )
                  }
                  className="w-full text-left flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-bold text-slate-200">
                    Credibility Rotation Adjuster
                  </h3>
                  <span className="text-slate-400 text-xl">
                    {isCredibilityAdjusterExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {isCredibilityAdjusterExpanded && (
                  <div className="space-y-4">
                    {Array.from({ length: playerCount }, (_, i) => i + 1).map(
                      (playerId) => {
                        const credibilityLocations =
                          CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount] ||
                          [];
                        const baseRotation =
                          credibilityLocations.find(
                            (loc) => loc.ownerId === playerId
                          )?.rotation || 0;
                        const adjustment =
                          credibilityRotationAdjustments[playerId] || 0;
                        const finalRotation = baseRotation + adjustment;

                        return (
                          <div
                            key={`cred-adj-${playerId}`}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-slate-200 font-semibold">
                                Player {playerId}
                              </span>
                              <span className="text-xs text-slate-400">
                                Base:{" "}
                                <span className="text-cyan-400">
                                  {baseRotation.toFixed(1)}°
                                </span>{" "}
                                | Adjustment:{" "}
                                <span className="text-yellow-400">
                                  {adjustment > 0 ? "+" : ""}
                                  {adjustment}°
                                </span>{" "}
                                | Final:{" "}
                                <span className="text-green-400">
                                  {finalRotation.toFixed(1)}°
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  setCredibilityRotationAdjustments((prev) => ({
                                    ...prev,
                                    [playerId]: (prev[playerId] || 0) - 15,
                                  }))
                                }
                                className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-500 transition-colors"
                              >
                                -15°
                              </button>
                              <button
                                onClick={() =>
                                  setCredibilityRotationAdjustments((prev) => ({
                                    ...prev,
                                    [playerId]: (prev[playerId] || 0) - 1,
                                  }))
                                }
                                className="px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-500 transition-colors"
                              >
                                -1°
                              </button>
                              <button
                                onClick={() =>
                                  setCredibilityRotationAdjustments((prev) => ({
                                    ...prev,
                                    [playerId]: 0,
                                  }))
                                }
                                className="px-2 py-1 bg-gray-600 text-white text-xs font-semibold rounded hover:bg-gray-500 transition-colors"
                              >
                                Reset
                              </button>
                              <button
                                onClick={() =>
                                  setCredibilityRotationAdjustments((prev) => ({
                                    ...prev,
                                    [playerId]: (prev[playerId] || 0) + 1,
                                  }))
                                }
                                className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-500 transition-colors"
                              >
                                +1°
                              </button>
                              <button
                                onClick={() =>
                                  setCredibilityRotationAdjustments((prev) => ({
                                    ...prev,
                                    [playerId]: (prev[playerId] || 0) + 15,
                                  }))
                                }
                                className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-500 transition-colors"
                              >
                                +15°
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Credibility Rules Info */}
            {isTestMode && (
              <div className="mt-8 bg-gray-700 rounded-lg p-4">
                <button
                  onClick={() =>
                    setIsCredibilityRulesExpanded(!isCredibilityRulesExpanded)
                  }
                  className="w-full text-left flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-bold text-slate-200">
                    Credibility System Rules
                  </h3>
                  <span className="text-slate-400 text-xl">
                    {isCredibilityRulesExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {isCredibilityRulesExpanded && (
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="bg-gray-800 rounded p-2 border-l-4 border-red-500">
                      <p className="font-semibold text-red-400 mb-1">
                        Lose 1 Credibility if:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>
                          You play a tile that doesn't perfectly meet
                          requirements AND receiving player rejects it
                        </li>
                        <li>
                          You play a tile that doesn't perfectly meet
                          requirements AND another player successfully
                          challenges it
                        </li>
                        <li>
                          You unsuccessfully challenge another player's move
                          (they played perfectly)
                        </li>
                        <li>
                          Another player successfully challenges on a tile that
                          you accepted
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded p-2 border-l-4 border-blue-500">
                      <p className="font-semibold text-blue-400 mb-1">
                        Game Rules:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>All players start with 3 Credibility</li>
                        <li>Credibility is shown on the board (0-3)</li>
                        <li>
                          Perfect plays cannot be rejected - receiver must
                          accept
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded p-2 border-l-4 border-green-500">
                      <p className="font-semibold text-green-400 mb-1">
                        Gain Credibility:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>
                          If you reject a tile that was not played perfectly,
                          gain up to 2 credibility points (max 3 total)
                        </li>
                        <li>
                          If you already have 3 credibility when rejecting, the
                          game pauses and you may take an "Advance" move, then
                          click Continue to resume
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 rounded p-2 border-l-4 border-yellow-500">
                      <p className="font-semibold text-yellow-400 mb-1">
                        When Credibility = 0:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>
                          You do not get the option to challenge any moves
                        </li>
                        <li>You are UNABLE to view tiles played to you</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Kredcoin Tracker (Test Mode Only) */}
            {isTestMode && (
              <div className="mt-8 bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">
                  ₭- Kredcoin Tracker
                </h3>
                <p className="text-xs text-slate-400 mb-4 text-center italic">
                  Hidden in normal play • Only face-down banked tiles count
                </p>
                <div className="space-y-3">
                  {players.map((player) => {
                    const kredcoin = calculatePlayerKredcoin(player.id);
                    const playerBankedTiles = bankedTiles.filter(
                      (bt) => bt.ownerId === player.id
                    );
                    const faceDownCount = playerBankedTiles.filter(
                      (bt) => !bt.faceUp
                    ).length;
                    const faceUpCount = playerBankedTiles.filter(
                      (bt) => bt.faceUp
                    ).length;

                    return (
                      <div
                        key={`kredcoin-${player.id}`}
                        className="bg-gray-800 rounded-lg p-3 border border-amber-600/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-200 font-semibold">
                            Player {player.id}
                          </span>
                          <span className="text-2xl font-bold text-amber-400">
                            ₭- {kredcoin}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between">
                          <span>Face-down: {faceDownCount}</span>
                          <span className="text-red-400">
                            Face-up (excluded): {faceUpCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create Dummy Tile Button (Test Mode Only) */}
            {isTestMode && !dummyTile && (
              <div className="mt-8">
                <button
                  onClick={() =>
                    setDummyTile({
                      position: { top: 50, left: 50 },
                      rotation: 0,
                    })
                  }
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
                >
                  + Create Dummy Tile
                </button>
              </div>
            )}

            {isTestMode && dummyTile && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">
                  Dummy Tile Tracker
                </h2>
                <div className="bg-gray-800/50 rounded-lg border border-indigo-600 p-4 text-sm">
                  <div className="font-mono border-b border-gray-600 pb-4 mb-4">
                    <div className="font-semibold text-indigo-300 mb-3">
                      Dummy Tile Position & Rotation
                    </div>
                    <div className="text-slate-300 mb-2">
                      <span className="font-semibold">Position:</span> Left:{" "}
                      <span className="text-cyan-400">
                        {dummyTile.position.left.toFixed(2)}%
                      </span>{" "}
                      | Top:{" "}
                      <span className="text-cyan-400">
                        {dummyTile.position.top.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-slate-300 mb-4">
                      <span className="font-semibold">Rotation:</span>{" "}
                      <span className="text-cyan-400">
                        {dummyTile.rotation.toFixed(1)}°
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRotateDummyTile(1)}
                        className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded hover:bg-indigo-400 transition-colors"
                      >
                        +1°
                      </button>
                      <button
                        onClick={() => handleRotateDummyTile(-1)}
                        className="px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded hover:bg-indigo-400 transition-colors"
                      >
                        -1°
                      </button>
                      <button
                        onClick={() => handleRotateDummyTile(15)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-500 transition-colors"
                      >
                        +15°
                      </button>
                      <button
                        onClick={() => handleRotateDummyTile(-15)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-500 transition-colors"
                      >
                        -15°
                      </button>
                      <button
                        onClick={() => setDummyTile(null)}
                        className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-500 transition-colors"
                      >
                        Delete Tile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isTestMode && (
              <div className="mt-8">
                <button
                  onClick={() =>
                    setIsPieceTrackerExpanded(!isPieceTrackerExpanded)
                  }
                  className="w-full text-left mb-4 flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-slate-200">
                    Piece Tracker
                  </h2>
                  <span className="text-slate-400 text-xl">
                    {isPieceTrackerExpanded ? "▼" : "▶"}
                  </span>
                </button>
                {isPieceTrackerExpanded && (
                  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 max-h-96 overflow-y-auto text-xs">
                    {pieces.length === 0 ? (
                      <p className="text-slate-400 text-center italic">
                        No pieces on board
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pieces.map((piece) => (
                          <div
                            key={piece.id}
                            className={`font-mono border-b border-gray-600 pb-1 ${
                              piece.id === lastDroppedPieceId
                                ? "text-yellow-300"
                                : "text-slate-300"
                            }`}
                          >
                            <div
                              className={`font-semibold ${
                                piece.id === lastDroppedPieceId
                                  ? "text-yellow-400"
                                  : "text-cyan-300"
                              }`}
                            >
                              {piece.displayName || piece.name}
                            </div>
                            <div
                              className={
                                piece.id === lastDroppedPieceId
                                  ? "text-yellow-200"
                                  : "text-slate-400"
                              }
                            >
                              Left: {piece.position.left.toFixed(2)}% | Top:{" "}
                              {piece.position.top.toFixed(2)}%
                            </div>
                            <div
                              className={
                                piece.id === lastDroppedPieceId
                                  ? "text-yellow-200"
                                  : "text-slate-400"
                              }
                            >
                              Rotation: {piece.rotation.toFixed(1)}° | Location:{" "}
                              {piece.locationId || "unknown"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
              The placed tile has been revealed to all players.
            </p>
            <div className="bg-stone-100 w-20 h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 mx-auto mb-6">
              <img
                src={challengedTile.url}
                alt={`Tile ${challengedTile.id}`}
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={onContinueAfterChallenge}
              className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-500 transition-colors shadow-md hover:shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Receiver Decision Modal (when not privately viewing) */}
      {isMyTurnForDecision &&
        gameState === "PENDING_ACCEPTANCE" &&
        !isPrivatelyViewing &&
        !showBonusMoveModal &&
        receiverAcceptance === null && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40 p-4">
            <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full pointer-events-auto">
              <h2 className="text-3xl font-bold text-cyan-300 mb-2">
                Your Decision
              </h2>
              {(() => {
                const currentPlayer = players.find(
                  (p) => p.id === currentPlayerId
                );
                const hasZeroCredibility =
                  (currentPlayer?.credibility ?? 3) === 0;
                if (hasZeroCredibility) {
                  return (
                    <p className="text-red-400 font-semibold mb-4">
                      ⚠️ You have 0 Credibility - You must accept this tile!
                    </p>
                  );
                }
                return (
                  <p className="text-slate-300 mb-6">{`Player ${
                    playedTile?.playerId || tileTransaction?.placerId
                  } has played a tile to you. You can either accept or reject it.`}</p>
                );
              })()}
              {(() => {
                const currentPlayer = players.find(
                  (p) => p.id === currentPlayerId
                );
                const hasZeroCredibility =
                  (currentPlayer?.credibility ?? 3) === 0;
                if (hasZeroCredibility) {
                  return (
                    <p className="text-red-400 text-sm mb-4 font-semibold">
                      You may not view tiles
                    </p>
                  );
                }
                return (
                  <p className="text-slate-400 text-sm mb-4">
                    Click on the tile to view it
                  </p>
                );
              })()}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {(() => {
                  const currentPlayer = players.find(
                    (p) => p.id === currentPlayerId
                  );
                  const hasZeroCredibility =
                    (currentPlayer?.credibility ?? 3) === 0;
                  return (
                    <button
                      onClick={() =>
                        playedTile
                          ? onReceiverAcceptanceDecision(false)
                          : onReceiverDecision("reject")
                      }
                      disabled={hasZeroCredibility}
                      className={`px-6 py-2 font-semibold rounded-lg transition-colors shadow-md w-full sm:w-auto ${
                        hasZeroCredibility
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                          : "bg-red-700 text-white hover:bg-red-600"
                      }`}
                    >
                      Reject Tile
                    </button>
                  );
                })()}
                <button
                  onClick={() =>
                    playedTile
                      ? onReceiverAcceptanceDecision(true)
                      : onReceiverDecision("accept")
                  }
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md w-full sm:w-auto"
                >
                  Accept Tile
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Bystander Challenge Modal */}
      {isMyTurnForDecision && gameState === "PENDING_CHALLENGE" && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">
              Challenge or Pass?
            </h2>
            {(() => {
              const currentPlayer = players.find(
                (p) => p.id === currentPlayerId
              );
              const hasZeroCredibility =
                (currentPlayer?.credibility ?? 3) === 0;
              if (hasZeroCredibility) {
                return (
                  <p className="text-red-400 font-semibold mb-4">
                    ⚠️ You have 0 Credibility - You can only Pass!
                  </p>
                );
              }
              return (
                <p className="text-slate-300 mb-6">{`Player ${
                  playedTile?.receivingPlayerId || tileTransaction?.receiverId
                } accepted the tile from Player ${
                  playedTile?.playerId || tileTransaction?.placerId
                }.`}</p>
              );
            })()}
            <div className="flex justify-center items-center gap-4">
              {(() => {
                const currentPlayer = players.find(
                  (p) => p.id === currentPlayerId
                );
                const hasZeroCredibility =
                  (currentPlayer?.credibility ?? 3) === 0;
                return (
                  <button
                    onClick={() =>
                      playedTile
                        ? onChallengerDecision(true)
                        : onBystanderDecision("challenge")
                    }
                    disabled={hasZeroCredibility}
                    className={`px-6 py-2 font-semibold rounded-lg transition-colors shadow-md ${
                      hasZeroCredibility
                        ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                        : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                  >
                    Challenge
                  </button>
                );
              })()}
              <button
                onClick={() =>
                  playedTile
                    ? onChallengerDecision(false)
                    : onBystanderDecision("pass")
                }
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md"
              >
                Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Advantage Initial Choice Modal */}
      {showTakeAdvantageModal && takeAdvantageChallengerId !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-8 max-w-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-green-400 mb-6 text-center">
              Challenge Successful! 🎯
            </h2>

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
      {showTakeAdvantageTileSelection && takeAdvantageChallengerId !== null && (
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
                      className={`relative bg-stone-100 w-full aspect-[1/2] p-2 rounded-md shadow-md border-4 transition-all transform hover:scale-105 ${
                        isSelected
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
                        className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${
                          isSelected
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
            {players.find((p) => p.id === takeAdvantageChallengerId)
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
                className={`px-8 py-3 font-bold rounded-lg transition-all transform shadow-lg ${
                  selectedTilesForAdvantage.length === 0
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
      {showTakeAdvantageMenu && takeAdvantageChallengerId !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto">
          <div className="w-full max-w-7xl my-8 px-4">
            <div className="bg-gray-900 rounded-lg shadow-2xl border-2 border-yellow-600 p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  Take Advantage
                </h2>
                <p className="text-xl text-slate-200">
                  Player {takeAdvantageChallengerId}'s Reward
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
                        const finalScale = baseScale * scaleMultiplier;

                        const isInCommunity =
                          piece.locationId?.startsWith("community") || false;
                        const rotationMap =
                          PLAYER_PERSPECTIVE_ROTATIONS[playerCount];
                        const boardRotation =
                          rotationMap?.[takeAdvantageChallengerId] || 0;
                        const communityCounterRotation = isInCommunity
                          ? -boardRotation
                          : 0;

                        const isPromotionPurchase =
                          takeAdvantagePurchase?.item.type === "PROMOTION";
                        const isDraggable =
                          !isPromotionPurchase &&
                          takeAdvantagePurchase?.item.type === "MOVE";

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
                            className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out ${
                              isPromotionPurchase
                                ? "cursor-pointer hover:scale-110"
                                : isDraggable
                                ? "cursor-grab active:cursor-grabbing"
                                : "cursor-default"
                            }`}
                            style={{
                              position: "absolute",
                              top: `${piece.position.top}%`,
                              left: `${piece.position.left}%`,
                              transform: `translate(-50%, -50%) rotate(${
                                piece.rotation + communityCounterRotation
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
                                            className={`p-2 rounded-lg border-2 transition-all ${
                                              canAfford
                                                ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                                : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                            }`}
                                          >
                                            <div className="text-center">
                                              <span className="font-bold text-sm block mb-1">
                                                {item.moveType}
                                              </span>
                                              <span
                                                className={`text-base font-bold ${
                                                  canAfford
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
                                            className={`p-2 rounded-lg border-2 transition-all ${
                                              canAfford
                                                ? "bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer"
                                                : "bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                            }`}
                                          >
                                            <div className="text-center">
                                              <span className="font-bold text-sm block mb-1">
                                                {item.moveType}
                                              </span>
                                              <span
                                                className={`text-base font-bold ${
                                                  canAfford
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
                                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                        isEnabled
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
                                          className={`text-xl font-bold ${
                                            isEnabled
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

      {showWaitingOverlay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-xl text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 animate-pulse">
              {waitingMessage}
            </h2>
          </div>
        </div>
      )}

      {/* Move Check Result Modal */}
      {showMoveCheckResult && moveCheckResult && (
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
                            className={`p-3 rounded border-l-4 ${
                              validation.isValid
                                ? "bg-green-900/30 border-green-500"
                                : "bg-red-900/30 border-red-500"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-lg font-bold ${
                                  validation.isValid
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {validation.isValid ? "✓" : "✕"}
                              </span>
                              <span
                                className={`font-semibold ${
                                  validation.isValid
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
              className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors text-white ${
                !moveCheckResult.isMet
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
    </main>
  );
};

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
  const [hasPlayedTileThisTurn, setHasPlayedTileThisTurn] = useState(false);
  const [revealedTileId, setRevealedTileId] = useState<string | null>(null);

  // State for new acceptance/challenge flow
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

  // State for Game Log
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [piecesAtTurnStart, setPiecesAtTurnStart] = useState<Piece[]>([]);

  // State for collapsible test mode modules
  const [isGameLogExpanded, setIsGameLogExpanded] = useState(true);
  const [isCredibilityAdjusterExpanded, setIsCredibilityAdjusterExpanded] =
    useState(false);
  const [isCredibilityRulesExpanded, setIsCredibilityRulesExpanded] =
    useState(false);
  const [isPieceTrackerExpanded, setIsPieceTrackerExpanded] = useState(false);

  // State for new tile play workflow
  const [playedTile, setPlayedTile] = useState<{
    tileId: string;
    playerId: number;
    receivingPlayerId: number;
    movesPerformed: TrackedMove[];
    originalPieces: Piece[];
    originalBoardTiles: BoardTile[];
  } | null>(null);
  const [movesThisTurn, setMovesThisTurn] = useState<TrackedMove[]>([]);
  const [receiverAcceptance, setReceiverAcceptance] = useState<boolean | null>(
    null
  ); // null = awaiting decision, true = accepted, false = rejected
  const [challengeOrder, setChallengeOrder] = useState<number[]>([]);
  const [currentChallengerIndex, setCurrentChallengerIndex] = useState(0);
  const [tileRejected, setTileRejected] = useState(false);
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
  const [challengeResultMessage, setChallengeResultMessage] = useState<
    string | null
  >(null);
  const [tilePlayerMustWithdraw, setTilePlayerMustWithdraw] = useState(false);

  // State for Take Advantage (challenge reward)
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

  // State for custom alert modals
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

  // Helper function to show styled alert modals
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

  // State for tracking moved pieces this turn (one move per piece restriction)
  const [movedPiecesThisTurn, setMovedPiecesThisTurn] = useState<Set<string>>(
    new Set()
  );

  // Bureaucracy Phase State
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

  // State for tracking pieces moved to community that are "pending" until acceptance/challenge resolved
  const [pendingCommunityPieces, setPendingCommunityPieces] = useState<
    Set<string>
  >(new Set());

  // State for phase transition message
  const [showBureaucracyTransition, setShowBureaucracyTransition] =
    useState(false);

  // State for finish turn confirmation
  const [showFinishTurnConfirm, setShowFinishTurnConfirm] = useState<{
    isOpen: boolean;
    remainingKredcoin: number;
  }>({
    isOpen: false,
    remainingKredcoin: 0,
  });

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

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

  const addGameLog = (message: string) => {
    setGameLog((prev) => [...prev, message]);
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

