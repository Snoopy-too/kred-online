import React, { useState, useEffect, useRef } from 'react';
import type {
  Player,
  Piece,
  BoardTile,
  Tile,
  TrackedMove,
  GameState,
  TileReceivingSpace,
  BureaucracyPurchase,
  BureaucracyMenuItem,
} from '../../game/types';
import {
  PLAYER_PERSPECTIVE_ROTATIONS,
  TILE_SPACES_BY_PLAYER_COUNT,
  TILE_KREDCOIN_VALUES,
  CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT,
  DROP_LOCATIONS_BY_PLAYER_COUNT,
  PIECE_TYPES,
} from '../../game/config';
import {
  calculatePieceRotation,
  isPositionInCommunityCircle,
  getLocationIdFromPosition,
  findNearestVacantLocation,
  formatLocationId,
} from '../../game/utils';
// Note: These functions and constants are still in game.ts - will need to be extracted later
import {
  BOARD_CENTERS,
  validatePieceMovement,
  isLocationOccupied,
} from '../../../game';

interface CampaignScreenProps {
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
  dummyTile: { position: { top: number; left: number }; rotation: number } | null;
  setDummyTile: (tile: { position: { top: number; left: number }; rotation: number } | null) => void;
  boardRotationEnabled: boolean;
  setBoardRotationEnabled: (enabled: boolean) => void;
  showGridOverlay: boolean;
  setShowGridOverlay: (show: boolean) => void;
  hasPlayedTileThisTurn: boolean;
  revealedTileId: string | null;
  tileTransaction: { placerId: number; receiverId: number; boardTileId: string; tile: Tile } | null;
  isPrivatelyViewing: boolean;
  bystanders: Player[];
  bystanderIndex: number;
  showChallengeRevealModal: boolean;
  challengedTile: Tile | null;
  placerViewingTileId: string | null;
  giveReceiverViewingTileId: string | null;
  gameLog: string[];
  onNewGame: () => void;
  onPieceMove: (pieceId: string, newPosition: { top: number; left: number }, locationId?: string) => void;
  onBoardTileMove: (boardTileId: string, newPosition: { top: number; left: number }) => void;
  onEndTurn: () => void;
  onPlaceTile: (tileId: number, targetSpace: TileReceivingSpace) => void;
  onRevealTile: (tileId: string | null) => void;
  onReceiverDecision: (decision: 'accept' | 'reject') => void;
  onBystanderDecision: (decision: 'challenge' | 'pass') => void;
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
  setCredibilityRotationAdjustments: (adjustments: { [playerId: number]: number }) => void;
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
}

export const CampaignScreen: React.FC<CampaignScreenProps> = ({
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
  const [boardMousePosition, setBoardMousePosition] = useState<{x: number, y: number} | null>(null);
  const [draggedPieceInfo, setDraggedPieceInfo] = useState<{ name: string; imageUrl: string; pieceId: string; locationId?: string } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ position: { top: number; left: number }; rotation: number; name: string; imageUrl: string; isValid?: boolean } | null>(null);
  const boardRotation = boardRotationEnabled ? (PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0) : 0;

  const tileSpaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
  const occupiedOwnerIds = new Set(boardTiles.map(bt => bt.ownerId));
  const unoccupiedSpaces = tileSpaces.filter(space => !occupiedOwnerIds.has(space.ownerId));

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = 0;
    }
  }, [gameLog]);

  // Calculate Kredcoin for a player (only face-down tiles in bank count)
  const calculatePlayerKredcoin = (playerId: number): number => {
    const playerBankedTiles = bankedTiles.filter(bt => bt.ownerId === playerId && !bt.faceUp);
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
    setBoardMousePosition(null);
  };

  const handleDragStartPiece = (e: React.DragEvent<HTMLDivElement>, pieceId: string, pieceName: string, imageUrl: string, locationId?: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('piece-id', pieceId);
    setDraggedPieceInfo({ name: pieceName, imageUrl, pieceId, locationId });
  };

  const handleDragStartBoardTile = (e: React.DragEvent<HTMLDivElement>, boardTileId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('board-tile-id', boardTileId);
    setIsDraggingTile(true);
  };

  const handleDragEndBoardTile = () => {
    setIsDraggingTile(false);
  };

  const handleDragOverBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const boardRect = e.currentTarget.getBoundingClientRect();
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;

    const rawLeft = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const rawTop = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    let left = rawLeft;
    let top = rawTop;

    if (boardRotation !== 0 && draggedPieceInfo) {
      const piece = pieces.find(p => p.id === draggedPieceInfo.pieceId);
      const isInCommunity = piece && isPositionInCommunityCircle(
        piece.position.left,
        piece.position.top,
        BOARD_CENTERS[playerCount]
      );

      if (isInCommunity) {
        const angleRad = -boardRotation * (Math.PI / 180);
        const translatedX = rawLeft - centerX;
        const translatedY = rawTop - centerY;
        const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
        const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
        left = rotatedX + centerX;
        top = rotatedY + centerY;
      }
    }

    if (draggedPieceInfo) {
      const locationId = getLocationIdFromPosition(left, top, playerCount);
      const isValidDrop = locationId !== null && validatePieceMovement(draggedPieceInfo.pieceId, locationId, pieces, playerCount);

      const finalPosition = locationId
        ? (DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount]?.find(loc => loc.id === locationId)?.position ?? { left, top })
        : { left, top };

      const rotation = calculatePieceRotation(finalPosition.left, finalPosition.top, BOARD_CENTERS[playerCount]);

      setDropIndicator({
        position: finalPosition,
        rotation,
        name: draggedPieceInfo.name,
        imageUrl: draggedPieceInfo.imageUrl,
        isValid: isValidDrop
      });
    }
  };

  const handleDragEndPiece = () => {
    setDraggedPieceInfo(null);
    setDropIndicator(null);
  };

  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const boardRect = e.currentTarget.getBoundingClientRect();
    const centerX = boardRect.width / 2;
    const centerY = boardRect.height / 2;

    const rawLeft = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const rawTop = ((e.clientY - boardRect.top) / boardRect.height) * 100;

    let left = rawLeft;
    let top = rawTop;

    const pieceId = e.dataTransfer.getData('piece-id');
    const boardTileId = e.dataTransfer.getData('board-tile-id');

    if (pieceId) {
      if (boardRotation !== 0) {
        const piece = pieces.find(p => p.id === pieceId);
        const isInCommunity = piece && isPositionInCommunityCircle(
          piece.position.left,
          piece.position.top,
          BOARD_CENTERS[playerCount]
        );

        if (isInCommunity) {
          const angleRad = -boardRotation * (Math.PI / 180);
          const translatedX = rawLeft - centerX;
          const translatedY = rawTop - centerY;
          const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
          const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
          left = rotatedX + centerX;
          top = rotatedY + centerY;
        }
      }

      const detectedLocationId = getLocationIdFromPosition(left, top, playerCount);

      if (detectedLocationId && validatePieceMovement(pieceId, detectedLocationId, pieces, playerCount)) {
        const location = BOARD_LOCATIONS_BY_PLAYER_COUNT[playerCount]?.find(loc => loc.id === detectedLocationId);
        if (location) {
          if (isLocationOccupied(detectedLocationId, pieces)) {
            const nearestVacantId = findNearestVacantLocation(detectedLocationId, pieces, playerCount);
            if (nearestVacantId) {
              const vacantLocation = BOARD_LOCATIONS_BY_PLAYER_COUNT[playerCount]?.find(loc => loc.id === nearestVacantId);
              if (vacantLocation) {
                onPieceMove(pieceId, vacantLocation.position, nearestVacantId);
              }
            }
          } else {
            onPieceMove(pieceId, location.position, detectedLocationId);
          }
        }
      }
      setDraggedPieceInfo(null);
      setDropIndicator(null);
    }

    if (boardTileId) {
      onBoardTileMove(boardTileId, { left, top });
      setIsDraggingTile(false);
    }
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPlayerCredibility = currentPlayer?.credibility ?? 0;

  const shouldShowPlaceTileControls = () => {
    if (gameState === 'CAMPAIGN') return !hasPlayedTileThisTurn;
    if (gameState === 'BONUS_MOVE') return bonusMovePlayerId === currentPlayerId;
    return false;
  };

  const currentPlayerKredcoin = calculatePlayerKredcoin(currentPlayerId);

  const backgroundImage = playerCount === 3
    ? './dev_images/background_3p.jpg'
    : playerCount === 4
    ? './dev_images/background_4p.jpg'
    : './dev_images/background_5p.jpg';

  const boardLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount] || [];
  const communityLocations = DROP_LOCATIONS_BY_PLAYER_COUNT[playerCount]?.filter(loc => loc.id.startsWith('community')) || [];
  const credibilityLocations = CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT[playerCount] || [];

  return (
    <main
      className="relative min-h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Game Board */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <div
          className="relative"
          style={{
            width: '90vmin',
            height: '90vmin',
            transform: `rotate(${boardRotation}deg)`,
            transition: 'transform 0.5s ease-in-out',
          }}
          onDragOver={handleDragOverBoard}
          onDrop={handleDropOnBoard}
          onMouseMove={handleMouseMoveOnBoard}
          onMouseLeave={handleMouseLeaveBoard}
        >
          {/* Board Tiles */}
          {boardTiles.map((boardTile) => {
            const rotation = boardRotation !== 0 ? -boardRotation : 0;
            return (
              <div
                key={boardTile.id}
                draggable={isTestMode && gameState === 'CAMPAIGN'}
                onDragStart={(e) => handleDragStartBoardTile(e, boardTile.id)}
                onDragEnd={handleDragEndBoardTile}
                className="absolute cursor-move"
                style={{
                  left: `${boardTile.position.left}%`,
                  top: `${boardTile.position.top}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  width: '6%',
                  height: '12%',
                  opacity: isDraggingTile ? 0.5 : 1,
                }}
              >
                <img
                  src={boardTile.tile.url}
                  alt={`Tile ${boardTile.tile.id}`}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                />
              </div>
            );
          })}

          {/* Pieces */}
          {pieces.map((piece) => {
            const isCurrentPlayerPiece = piece.playerId === currentPlayerId;
            const isDraggable = isTestMode && gameState === 'CAMPAIGN' && isCurrentPlayerPiece;
            const isDropped = piece.id === lastDroppedPieceId;
            const shouldCounterRotate = !isPositionInCommunityCircle(
              piece.position.left,
              piece.position.top,
              BOARD_CENTERS[playerCount]
            );
            const counterRotation = (shouldCounterRotate && boardRotation !== 0) ? -boardRotation : 0;

            return (
              <div
                key={piece.id}
                draggable={isDraggable}
                onDragStart={(e) =>
                  handleDragStartPiece(e, piece.id, piece.name, PIECE_IMAGES[piece.type] || '', piece.locationId)
                }
                onDragEnd={handleDragEndPiece}
                className={`absolute ${isDraggable ? 'cursor-move' : 'cursor-default'}`}
                style={{
                  left: `${piece.position.left}%`,
                  top: `${piece.position.top}%`,
                  transform: `translate(-50%, -50%) rotate(${piece.rotation + counterRotation}deg)`,
                  width: '5%',
                  height: '10%',
                  opacity: isDropped ? 1 : 0.95,
                  transition: isDropped ? 'none' : 'opacity 0.2s',
                }}
              >
                <img
                  src={PIECE_IMAGES[piece.type]}
                  alt={piece.name}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
                />
              </div>
            );
          })}

          {/* Drop Indicator */}
          {dropIndicator && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${dropIndicator.position.left}%`,
                top: `${dropIndicator.position.top}%`,
                transform: `translate(-50%, -50%) rotate(${dropIndicator.rotation}deg)`,
                width: '5%',
                height: '10%',
                opacity: 0.7,
                filter: dropIndicator.isValid
                  ? 'drop-shadow(0 0 10px rgba(0,255,0,0.8))'
                  : 'drop-shadow(0 0 10px rgba(255,0,0,0.8))',
              }}
            >
              <img
                src={dropIndicator.imageUrl}
                alt={dropIndicator.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Grid Overlay */}
          {isTestMode && showGridOverlay && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Location markers */}
              {boardLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="absolute"
                  style={{
                    left: `${loc.position.left}%`,
                    top: `${loc.position.top}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-50" />
                  <div className="text-xs text-white bg-black bg-opacity-50 px-1 rounded whitespace-nowrap">
                    {formatLocationId(loc.id)}
                  </div>
                </div>
              ))}

              {/* Community locations */}
              {communityLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="absolute"
                  style={{
                    left: `${loc.position.left}%`,
                    top: `${loc.position.top}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-50" />
                  <div className="text-xs text-white bg-black bg-opacity-50 px-1 rounded whitespace-nowrap">
                    {formatLocationId(loc.id)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mouse Position Display */}
          {isTestMode && boardMousePosition && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm font-mono">
              x: {boardMousePosition.x.toFixed(2)}%, y: {boardMousePosition.y.toFixed(2)}%
            </div>
          )}

          {/* Dummy Tile */}
          {isTestMode && dummyTile && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${dummyTile.position.left}%`,
                top: `${dummyTile.position.top}%`,
                transform: `translate(-50%, -50%) rotate(${dummyTile.rotation - boardRotation}deg)`,
                width: '6%',
                height: '12%',
                opacity: 0.6,
              }}
            >
              <div className="w-full h-full bg-purple-500 border-2 border-purple-700 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* UI Panels */}
      {/* Player Hand */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 p-4 rounded-lg shadow-2xl border border-gray-700 max-w-4xl">
        <h3 className="text-white text-center mb-2 font-semibold">
          Player {currentPlayerId}'s Hand ({currentPlayer?.hand.length || 0} tiles) - Kredcoin: {currentPlayerKredcoin}
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {(currentPlayer?.hand || []).map((tile) => (
            <div
              key={tile.id}
              className="bg-stone-100 w-12 h-24 p-1 rounded shadow-lg border-2 border-gray-300 flex items-center justify-center"
            >
              <img src={tile.url} alt={`Tile ${tile.id}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-gray-800/90 p-4 rounded-lg shadow-2xl border border-gray-700 space-y-2">
        <div className="text-white font-semibold mb-2">Controls</div>

        {isTestMode && (
          <>
            <button
              onClick={() => setBoardRotationEnabled(!boardRotationEnabled)}
              className={`w-full px-3 py-2 rounded ${
                boardRotationEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white text-sm transition-colors`}
            >
              Board Rotation: {boardRotationEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              className={`w-full px-3 py-2 rounded ${
                showGridOverlay ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white text-sm transition-colors`}
            >
              Grid Overlay: {showGridOverlay ? 'ON' : 'OFF'}
            </button>

            {onCheckMove && (
              <button
                onClick={onCheckMove}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                Check Move Validity
              </button>
            )}

            <button
              onClick={onResetTurn}
              className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
            >
              Reset Turn
            </button>
          </>
        )}

        {shouldShowPlaceTileControls() && (
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-white text-sm mb-2">Place Tile</div>
            {currentPlayer?.hand.map((tile) => (
              <button
                key={tile.id}
                onClick={() => {
                  const targetSpace: TileReceivingSpace = {
                    ownerId: currentPlayerId === 1 ? 2 : 1,
                    position: { left: 50, top: 50 },
                  };
                  onPlaceTile(tile.id, targetSpace);
                }}
                className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors mb-1"
              >
                Place Tile {tile.id}
              </button>
            ))}
          </div>
        )}

        {gameState === 'CAMPAIGN' && hasPlayedTileThisTurn && (
          <button
            onClick={onEndTurn}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            End Turn
          </button>
        )}

        <button
          onClick={onNewGame}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Game Log */}
      <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg shadow-2xl border border-gray-700 w-80">
        <button
          onClick={() => setIsGameLogExpanded(!isGameLogExpanded)}
          className="w-full px-4 py-2 text-white font-semibold text-left hover:bg-gray-700 rounded-t-lg transition-colors"
        >
          Game Log {isGameLogExpanded ? '▼' : '▶'}
        </button>
        {isGameLogExpanded && (
          <div
            ref={logContainerRef}
            className="p-4 max-h-96 overflow-y-auto text-white text-sm space-y-1"
          >
            {gameLog.map((entry, index) => (
              <div key={index} className="border-b border-gray-700 pb-1">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credibility Tracker */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 p-4 rounded-lg shadow-2xl border border-gray-700">
        <h3 className="text-white text-center mb-2 font-semibold">Credibility</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-2">
              <span className="text-white text-sm">P{player.id}:</span>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < player.credibility ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {/* Tile Transaction Modal */}
      {tileTransaction && gameState === 'PENDING_ACCEPTANCE' && !isPrivatelyViewing && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-cyan-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Tile Received
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Player {tileTransaction.placerId} has played a tile to Player {tileTransaction.receiverId}.
            </p>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-stone-100 w-20 h-40 p-2 rounded-lg shadow-lg border-2 border-gray-300">
                <img
                  src={tileTransaction.tile.url}
                  alt={`Tile ${tileTransaction.tile.id}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => onReceiverDecision('accept')}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onReceiverDecision('reject')}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {gameState === 'PENDING_CHALLENGE' && bystanders.length > 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-yellow-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Challenge Opportunity
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Player {bystanders[bystanderIndex]?.id}, do you want to challenge this tile play?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onBystanderDecision('challenge')}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Challenge
              </button>
              <button
                onClick={() => onBystanderDecision('pass')}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Check Result Modal */}
      {showMoveCheckResult && moveCheckResult && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-purple-500 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Move Validation Result
            </h2>
            <div className={`text-center mb-6 text-xl font-semibold ${moveCheckResult.isMet ? 'text-green-400' : 'text-red-400'}`}>
              {moveCheckResult.isMet ? '✓ Valid Moves' : '✗ Invalid Moves'}
            </div>

            <div className="space-y-4 text-white">
              <div>
                <h3 className="font-semibold mb-2">Required Moves:</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {moveCheckResult.requiredMoves.map((move, i) => (
                    <li key={i}>
                      {move.moveType}: {formatLocationId(move.fromLocationId || 'unknown')} → {formatLocationId(move.toLocationId || 'unknown')}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Performed Moves:</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {moveCheckResult.performedMoves.map((move, i) => (
                    <li key={i}>
                      {move.moveType}: {formatLocationId(move.fromLocationId || 'unknown')} → {formatLocationId(move.toLocationId || 'unknown')}
                    </li>
                  ))}
                </ul>
              </div>

              {moveCheckResult.missingMoves.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-400">Missing Moves:</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {moveCheckResult.missingMoves.map((move, i) => (
                      <li key={i}>
                        {move.moveType}: {formatLocationId(move.fromLocationId || 'unknown')} → {formatLocationId(move.toLocationId || 'unknown')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {moveCheckResult.moveValidations && (
                <div>
                  <h3 className="font-semibold mb-2">Move Validations:</h3>
                  <ul className="space-y-2">
                    {moveCheckResult.moveValidations.map((validation, i) => (
                      <li key={i} className={`p-2 rounded ${validation.isValid ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                        <div className="font-semibold">{validation.moveType}</div>
                        <div className="text-sm text-gray-300">{validation.reason}</div>
                        {validation.fromLocationId && validation.toLocationId && (
                          <div className="text-xs text-gray-400">
                            {formatLocationId(validation.fromLocationId)} → {formatLocationId(validation.toLocationId)}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={onCloseMoveCheckResult}
              className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Perfect Tile Modal */}
      {showPerfectTileModal && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-green-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Perfect Tile!
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              You played a perfect tile! All required moves were made correctly.
            </p>
            <button
              onClick={() => setShowPerfectTileModal(false)}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Bonus Move Modal */}
      {showBonusMoveModal && bonusMovePlayerId !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-yellow-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Bonus Move!
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Player {bonusMovePlayerId}, you get a bonus move for playing a perfect tile!
            </p>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Make one additional move, then click Done.
            </p>
            <button
              onClick={onBonusMoveComplete}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Done with Bonus Move
            </button>
          </div>
        </div>
      )}

      {/* Take Advantage Modal */}
      {showTakeAdvantageModal && takeAdvantageChallengerId !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-orange-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Take Advantage?
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Player {takeAdvantageChallengerId}, you successfully challenged! Do you want to take advantage?
            </p>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Current credibility: {takeAdvantageChallengerCredibility}
            </p>
            <div className="flex gap-4">
              <button
                onClick={onTakeAdvantageYes}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Yes
              </button>
              <button
                onClick={onTakeAdvantageDecline}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Advantage Tile Selection Modal */}
      {showTakeAdvantageTileSelection && takeAdvantageChallengerId !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-orange-500 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Select Tiles to Bank
            </h2>
            <p className="text-gray-300 mb-4 text-center">
              Player {takeAdvantageChallengerId}, select tiles from your hand to bank (up to {takeAdvantageChallengerCredibility} credibility worth).
            </p>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Total Kredcoin: {totalKredcoinForAdvantage} / {takeAdvantageChallengerCredibility}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {players.find(p => p.id === takeAdvantageChallengerId)?.hand.map((tile) => {
                const isSelected = selectedTilesForAdvantage.some(t => t.id === tile.id);
                return (
                  <button
                    key={tile.id}
                    onClick={() => onToggleTileSelection(tile)}
                    className={`bg-stone-100 w-16 h-32 p-1 rounded shadow-lg border-2 ${
                      isSelected ? 'border-orange-500 ring-4 ring-orange-300' : 'border-gray-300'
                    } transition-all`}
                  >
                    <img src={tile.url} alt={`Tile ${tile.id}`} className="w-full h-full object-contain" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onConfirmTileSelection}
                disabled={selectedTilesForAdvantage.length === 0 || totalKredcoinForAdvantage > takeAdvantageChallengerCredibility}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Confirm Selection
              </button>
              <button
                onClick={onCancelTileSelection}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Advantage Menu Modal */}
      {showTakeAdvantageMenu && takeAdvantageChallengerId !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-orange-500 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Choose Action
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Player {takeAdvantageChallengerId}, choose an action:
            </p>

            {takeAdvantageValidationError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {takeAdvantageValidationError}
              </div>
            )}

            <div className="space-y-2 mb-6">
              <button
                onClick={onRecoverCredibility}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Recover 1 Credibility
              </button>
              <button
                onClick={onPurchaseMove}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Purchase Move
              </button>
            </div>

            {takeAdvantagePurchase && (
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <p className="text-white text-sm mb-2">Selected: {takeAdvantagePurchase.label}</p>
                <button
                  onClick={onDoneTakeAdvantageAction}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={onResetTakeAdvantageAction}
                  className="w-full mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
