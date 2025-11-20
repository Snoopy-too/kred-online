import React, { useState } from 'react';
import type {
  Player,
  Piece,
  BoardTile,
  BureaucracyPlayerState,
  BureaucracyPurchase,
  BureaucracyMenuItem,
} from '../../game/types';
import {
  getBureaucracyMenu,
  getAvailablePurchases,
} from '../../game/config/bureaucracy';
import { PLAYER_PERSPECTIVE_ROTATIONS } from '../../game/config';
import { CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT } from '../../game/config/board-config';
import { calculatePieceRotation, findNearestVacantLocation } from '../../game/utils';

// Note: These functions are still in game.ts - will need to be extracted later
import {
  validatePieceMovement,
} from '../../game';

interface BureaucracyScreenProps {
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
}

export const BureaucracyScreen: React.FC<BureaucracyScreenProps> = ({
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
  const playerState = bureaucracyStates.find((s) => s.playerId === currentPlayerId);
  const menu = getBureaucracyMenu(playerCount);
  const affordableItems = playerState
    ? getAvailablePurchases(menu, playerState.remainingKredcoin)
    : [];
  const isPromotionPurchase = currentPurchase?.item.type === 'PROMOTION';
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
  const handleDragStartPiece = (e: React.DragEvent<HTMLDivElement>, pieceId: string) => {
    e.dataTransfer.setData('pieceId', pieceId);
    e.dataTransfer.effectAllowed = 'move';
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
      const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
      const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
      left = rotatedX + centerX;
      top = rotatedY + centerY;
    }

    const snappedLocation = findNearestVacantLocation({ top, left }, pieces, playerCount);

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
    const pieceId = e.dataTransfer.getData('pieceId');

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
      const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
      const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
      left = rotatedX + centerX;
      top = rotatedY + centerY;
    }

    // Regular piece placement with snapping
    const snappedLocation = findNearestVacantLocation({ top, left }, pieces, playerCount);

    if (snappedLocation && pieceId) {
      onPieceMove(pieceId, snappedLocation.position, snappedLocation.id);
    }
  };

  const handleMouseLeaveBoard = () => {
    setDropIndicator(null);
  };

  let indicatorSizeClass = '';
  if (dropIndicator) {
    if (dropIndicator.name === 'Heel') indicatorSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';
    else if (dropIndicator.name === 'Pawn') indicatorSizeClass = 'w-16 h-16 sm:w-20 sm:h-20';
    else indicatorSizeClass = 'w-10 h-10 sm:w-14 sm:h-14'; // Mark
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4 font-sans text-slate-100">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
          Bureaucracy Phase
        </h1>
        <p className="text-2xl text-slate-200 mt-2">Player {currentPlayerId}'s Turn</p>
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
            <h2 className="text-2xl font-bold text-white mb-6">Invalid Action</h2>
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
                    width: '80px',
                    height: '80px',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor:
                      dropIndicator.isValid === false
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(34, 197, 94, 0.3)',
                    boxShadow:
                      dropIndicator.isValid === false
                        ? '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2)'
                        : '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)',
                    border:
                      dropIndicator.isValid === false
                        ? '2px solid rgba(239, 68, 68, 0.6)'
                        : '2px solid rgba(34, 197, 94, 0.6)',
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
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))',
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
              let pieceSizeClass = 'w-10 h-10 sm:w-14 sm:h-14'; // Mark
              if (piece.name === 'Heel') pieceSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';
              if (piece.name === 'Pawn') pieceSizeClass = 'w-16 h-16 sm:w-20 sm:h-20';

              // Apply size reduction for different player counts
              const scaleMultiplier = playerCount === 3 ? 0.85 : playerCount === 5 ? 0.9 : 1;
              const baseScale = 0.798;
              const finalScale = baseScale * scaleMultiplier;

              // For pieces in community locations, apply inverse board rotation to counteract the board's perspective rotation
              // Check both position AND locationId to avoid false positives for seats near the community
              const isInCommunity = piece.locationId?.startsWith('community') || false;
              const communityCounterRotation = isInCommunity ? -boardRotation : 0;

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
                      ? 'cursor-pointer hover:scale-110'
                      : isDraggable
                      ? 'cursor-grab'
                      : 'cursor-not-allowed'
                  }`}
                  style={{
                    position: 'absolute',
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
                  width: '3%',
                  height: '6%',
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
                const adjustment = credibilityRotationAdjustments[location.ownerId] || 0;
                const finalRotation = (location.rotation || 0) + adjustment;
                const credibilityImage = `./images/${credibilityValue}_credibility.svg`;

                return (
                  <div
                    key={`credibility_${location.ownerId}_${credibilityValue}`}
                    className="absolute rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                    style={{
                      width: '5.283rem',
                      height: '5.283rem',
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
              <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400">Actions</h2>
              <div className="space-y-3">
                {/* Move items in two rows of three */}
                {menu.some((item) => item.type === 'MOVE') && (
                  <>
                    {/* First row: Assist, Remove, Influence */}
                    <div className="grid grid-cols-3 gap-2">
                      {menu
                        .filter(
                          (item) =>
                            item.type === 'MOVE' &&
                            ['ASSIST', 'REMOVE', 'INFLUENCE'].includes(item.moveType || '')
                        )
                        .map((item) => {
                          const canAfford = affordableItems.some((ai) => ai.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => canAfford && onSelectMenuItem(item)}
                              disabled={!canAfford}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                canAfford
                                  ? 'bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer'
                                  : 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="text-center">
                                <span className="font-bold text-sm block mb-1">
                                  {item.moveType}
                                </span>
                                <span
                                  className={`text-base font-bold ${
                                    canAfford ? 'text-yellow-400' : 'text-gray-600'
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
                            item.type === 'MOVE' &&
                            ['ADVANCE', 'WITHDRAW', 'ORGANIZE'].includes(item.moveType || '')
                        )
                        .map((item) => {
                          const canAfford = affordableItems.some((ai) => ai.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => canAfford && onSelectMenuItem(item)}
                              disabled={!canAfford}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                canAfford
                                  ? 'bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer'
                                  : 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="text-center">
                                <span className="font-bold text-sm block mb-1">
                                  {item.moveType}
                                </span>
                                <span
                                  className={`text-base font-bold ${
                                    canAfford ? 'text-yellow-400' : 'text-gray-600'
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
                  .filter((item) => item.type !== 'MOVE')
                  .map((item) => {
                    const canAfford = affordableItems.some((ai) => ai.id === item.id);
                    const isCredibilityAtMax =
                      item.type === 'CREDIBILITY' && currentPlayer && currentPlayer.credibility >= 3;
                    const isEnabled = canAfford && !isCredibilityAtMax;
                    return (
                      <button
                        key={item.id}
                        onClick={() => isEnabled && onSelectMenuItem(item)}
                        disabled={!isEnabled}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isEnabled
                            ? 'bg-gray-700 border-yellow-500/50 hover:border-yellow-400 hover:bg-gray-600 cursor-pointer'
                            : 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">
                            {item.type === 'PROMOTION' &&
                              `Promote ${item.promotionLocation}`}
                            {item.type === 'CREDIBILITY' && 'Restore Credibility'}
                          </span>
                          <span
                            className={`text-xl font-bold ${
                              isEnabled ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          >
                            ₭-{item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-300">{item.description}</p>
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
                {currentPurchase.item.type === 'PROMOTION' && (
                  <>
                    Promote a{' '}
                    {currentPurchase.item.promotionLocation === 'OFFICE'
                      ? 'piece in your Office'
                      : currentPurchase.item.promotionLocation === 'ROSTRUM'
                      ? 'piece in one of your Rostrums'
                      : 'piece in one of your Seats'}
                  </>
                )}
                {currentPurchase.item.type === 'MOVE' && (
                  <>Perform a {currentPurchase.item.moveType} move</>
                )}
                {currentPurchase.item.type === 'CREDIBILITY' && <>Your credibility has been restored</>}
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
            <h3 className="text-lg font-bold text-center mb-3 text-yellow-400">Turn Order</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {turnOrder.map((playerId, index) => {
                const pState = bureaucracyStates.find((s) => s.playerId === playerId);
                const isCurrentPlayer = index === currentBureaucracyPlayerIndex;
                const isComplete = pState?.turnComplete;

                return (
                  <div
                    key={playerId}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      isCurrentPlayer
                        ? 'bg-yellow-600 border-yellow-400 text-white font-bold'
                        : isComplete
                        ? 'bg-green-800 border-green-600 text-green-200'
                        : 'bg-gray-700 border-gray-500 text-gray-300'
                    }`}
                  >
                    Player {playerId} {isComplete && '✓'}
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
                Board Rotation {boardRotationEnabled ? '(ON)' : '(OFF)'}
              </span>
            </label>
          </div>

          {/* Check Move Button (Test Mode Only) */}
          {isTestMode &&
            !showPurchaseMenu &&
            currentPurchase &&
            currentPurchase.item.type === 'MOVE' && (
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
                  <div className="text-9xl text-green-500 font-bold mb-4">✓</div>
                  <h2 className="text-4xl font-bold text-green-400 mb-2">Valid Move!</h2>
                  <p className="text-lg text-green-300">
                    The move matches the selected action type.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-9xl text-red-500 font-bold mb-4">✕</div>
                  <h2 className="text-4xl font-bold text-red-400 mb-2">Invalid Move</h2>
                  <p className="text-lg text-red-300">{moveCheckResult.reason}</p>
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
