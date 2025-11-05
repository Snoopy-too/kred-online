
import React, { useState, useEffect, useRef } from 'react';
import {
  PLAYER_OPTIONS,
  BOARD_IMAGE_URLS,
  initializePlayers,
  initializePieces,
  PIECE_COUNTS_BY_PLAYER_COUNT,
  PIECE_TYPES,
  Tile,
  Player,
  GameState,
  Piece,
  BoardTile,
  calculatePieceRotation,
  findNearestVacantLocation,
  TILE_SPACES_BY_PLAYER_COUNT,
  TileReceivingSpace,
  BANK_SPACES_BY_PLAYER_COUNT,
  BankSpace,
  PLAYER_PERSPECTIVE_ROTATIONS,
  formatLocationId,
  getLocationIdFromPosition,
  DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT,
  isPositionInCommunityCircle,
  TrackedMove,
  PlayedTileState,
  validateMovesForTilePlay,
  validateTileRequirements,
  createGameStateSnapshot,
  getChallengeOrder,
  getTileRequirements,
  validateSingleMove,
  areSeatsAdjacent,
} from './game';

// --- Helper Components ---

const PlayerSelectionScreen: React.FC<{
  onStartGame: (playerCount: number, isTestMode: boolean) => void;
}> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isTestMode, setIsTestMode] = useState(true);

  return (
    <main className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="text-center mb-12">
        <img 
            src="https://montoyahome.com/kred/logo.png" 
            alt="Kred Logo" 
            className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))' }}
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
                ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg text-white'
                : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
            aria-pressed={playerCount === count}
          >
            {count} Players
          </button>
        ))}
      </div>
       <div className="flex items-center my-6">
        <input
          id="test-mode-checkbox"
          type="checkbox"
          checked={isTestMode}
          onChange={(e) => setIsTestMode(e.target.checked)}
          className="h-5 w-5 rounded bg-white border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="test-mode-checkbox" className="ml-3 text-slate-600 cursor-pointer">
          Test Mode (Single user plays for everyone)
        </label>
      </div>
      <button 
        onClick={() => onStartGame(playerCount, isTestMode)}
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
        <h3 className="text-lg font-semibold text-center mb-4">Your Hand ({currentPlayer.hand.length} tiles)</h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {currentPlayer.hand.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onSelectTile(tile)}
              className="transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 rounded-lg group"
              aria-label={`Select tile ${tile.id}`}
            >
              <div className="bg-stone-100 w-16 h-32 sm:w-20 sm:h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 group-hover:border-cyan-400 transition-colors flex items-center justify-center">
                <img src={tile.url} alt={`Tile ${tile.id}`} className="w-full h-full object-contain" />
              </div>
            </button>
          ))}
        </div>
      </div>
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
  dummyTile: { position: { top: number; left: number }; rotation: number } | null;
  setDummyTile: (tile: { position: { top: number; left: number }; rotation: number } | null) => void;
  boardRotationEnabled: boolean;
  setBoardRotationEnabled: (enabled: boolean) => void;
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
  playedTile?: any;
  receiverAcceptance?: boolean | null;
  onReceiverAcceptanceDecision?: (accepted: boolean) => void;
  onChallengerDecision?: (challenge: boolean) => void;
  onCorrectionComplete?: () => void;
  tileRejected?: boolean;
  showMoveCheckResult?: boolean;
  moveCheckResult?: {
    isMet: boolean;
    requiredMoves: any[];
    performedMoves: any[];
    missingMoves: any[];
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
}> = ({ gameState, playerCount, players, pieces, boardTiles, bankedTiles, currentPlayerId, lastDroppedPosition, lastDroppedPieceId, isTestMode, dummyTile, setDummyTile, boardRotationEnabled, setBoardRotationEnabled, hasPlayedTileThisTurn, revealedTileId, tileTransaction, isPrivatelyViewing, bystanders, bystanderIndex, showChallengeRevealModal, challengedTile, placerViewingTileId, giveReceiverViewingTileId, gameLog, onNewGame, onPieceMove, onBoardTileMove, onEndTurn, onPlaceTile, onRevealTile, onReceiverDecision, onBystanderDecision, onTogglePrivateView, onContinueAfterChallenge, onPlacerViewTile, onSetGiveReceiverViewingTileId, playedTile, receiverAcceptance, onReceiverAcceptanceDecision, onChallengerDecision, onCorrectionComplete, tileRejected, showMoveCheckResult, moveCheckResult, onCloseMoveCheckResult, onCheckMove }) => {

  const [isDraggingTile, setIsDraggingTile] = useState(false);
  const [boardMousePosition, setBoardMousePosition] = useState<{x: number, y: number} | null>(null);
  const [draggedPieceInfo, setDraggedPieceInfo] = useState<{ name: string; imageUrl: string } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ position: { top: number; left: number }; rotation: number; name: string; imageUrl: string } | null>(null);
  const boardRotation = boardRotationEnabled ? (PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0) : 0;
  
  const tileSpaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
  const occupiedOwnerIds = new Set(boardTiles.map(bt => bt.ownerId));
  const unoccupiedSpaces = tileSpaces.filter(space => !occupiedOwnerIds.has(space.ownerId));

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameLog]);

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
      if(dropIndicator) setDropIndicator(null);
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
        const newRotation = calculatePieceRotation(snappedLocation.position, playerCount, snappedLocation.id);
        if (!dropIndicator || dropIndicator.position.top !== snappedLocation.position.top || dropIndicator.position.left !== snappedLocation.position.left) {
             setDropIndicator({
                position: snappedLocation.position,
                rotation: newRotation,
                name: draggedPieceInfo.name,
                imageUrl: draggedPieceInfo.imageUrl
            });
        }
    } else {
        if(dropIndicator) setDropIndicator(null);
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
        const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
        const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);
        left = rotatedX + centerX;
        top = rotatedY + centerY;
    }

    // Handle dummy tile drops
    if (isDummyTile && dummyTile) {
        setDummyTile({
            position: { top, left },
            rotation: dummyTile.rotation
        });
        return;
    }

    if (boardTileId && isTestMode) {
        onBoardTileMove(boardTileId, { top, left });
        return;
    }

    // Free placement mode: allow tiles to be placed anywhere without snapping
    if (tileIdStr && !hasPlayedTileThisTurn) {
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (currentPlayer) {
            const freeTileSpace: TileReceivingSpace = {
                ownerId: currentPlayerId,
                position: { left, top },
                rotation: 0
            };
            onPlaceTile(parseInt(tileIdStr, 10), freeTileSpace);
            return;
        }
    }

    // Regular piece placement with snapping
    const snappedLocation = findNearestVacantLocation({ top, left }, pieces, playerCount);

    if (snappedLocation && pieceId) {
        onPieceMove(pieceId, snappedLocation.position, snappedLocation.id);
    }
  };

  const handleDropOnTileSpace = (e: React.DragEvent<HTMLDivElement>, space?: TileReceivingSpace) => {
    e.preventDefault();
    e.stopPropagation();
    const tileIdStr = e.dataTransfer.getData("tileId");
    if (tileIdStr && !hasPlayedTileThisTurn && space) {
        // Normal mode: drop on fixed tile space
        onPlaceTile(parseInt(tileIdStr, 10), space);
    }
  };

  const handleDragStartPiece = (e: React.DragEvent<HTMLImageElement>, pieceId: string) => {
    e.dataTransfer.setData("pieceId", pieceId);
    e.dataTransfer.effectAllowed = 'move';
    const piece = pieces.find(p => p.id === pieceId);
    if (piece) {
        setDraggedPieceInfo({ name: piece.name, imageUrl: piece.imageUrl });
    }
  };

  const handleDragEndPiece = () => {
    setDraggedPieceInfo(null);
    setDropIndicator(null);
  };
  
  const handleDragStartTile = (e: React.DragEvent<HTMLDivElement>, tileId: number) => {
    e.dataTransfer.setData("tileId", tileId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingTile(true);
  };

  const handleDragStartBoardTile = (e: React.DragEvent<HTMLDivElement>, boardTileId: string) => {
    e.dataTransfer.setData("boardTileId", boardTileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartDummyTile = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("dummyTile", "true");
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEndDummyTile = () => {
    setDropIndicator(null);
  };

  const handleRotateDummyTile = (degrees: number) => {
    if (dummyTile) {
      setDummyTile({
        ...dummyTile,
        rotation: (dummyTile.rotation + degrees) % 360
      });
    }
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  // Check if it's the current player's turn for a decision (accept/reject or challenge)
  // In test mode, always show decision dialogs so player can control all players
  // NEW WORKFLOW: Uses playedTile for PENDING_ACCEPTANCE
  // OLD WORKFLOW: Uses tileTransaction for PENDING_CHALLENGE
  const isMyTurnForDecision =
    isTestMode ||
    (gameState === 'PENDING_ACCEPTANCE' && playedTile && currentPlayerId === playedTile.receivingPlayerId) ||
    (gameState === 'PENDING_ACCEPTANCE' && !playedTile && currentPlayerId === tileTransaction?.receiverId) ||
    (gameState === 'PENDING_CHALLENGE' && bystanders[bystanderIndex]?.id === currentPlayerId);

  const showWaitingOverlay =
    (gameState === 'PENDING_ACCEPTANCE' || gameState === 'PENDING_CHALLENGE') && !isMyTurnForDecision;

  let waitingMessage = "";
  let waitingPlayerId = undefined;
  if (showWaitingOverlay) {
    if (gameState === 'PENDING_ACCEPTANCE') {
        waitingPlayerId = playedTile?.receivingPlayerId || tileTransaction?.receiverId;
        waitingMessage = `Waiting for Player ${waitingPlayerId} to respond...`;
    } else if (gameState === 'PENDING_CHALLENGE') {
        waitingPlayerId = bystanders[bystanderIndex]?.id;
        waitingMessage = `Waiting for Player ${waitingPlayerId} to respond...`;
    }
  }
  
  let indicatorSizeClass = '';
  if (dropIndicator) {
      if (dropIndicator.name === 'Heel') indicatorSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';
      else if (dropIndicator.name === 'Pawn') indicatorSizeClass = 'w-16 h-16 sm:w-20 sm:h-20';
      else indicatorSizeClass = 'w-10 h-10 sm:w-14 sm:h-14'; // Mark
  }
  const indicatorScaleStyle = dropIndicator ? { transform: 'scale(0.84)' } : {};

  return (
    <main className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:items-start lg:gap-8">
        
        {/* Main Content (Board, Hand, etc.) */}
        <div className="flex-1 flex flex-col items-center min-w-0">
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
            onClick={(e) => { if (e.target === e.currentTarget) { onRevealTile(null); }}}
            onMouseMove={handleMouseMoveOnBoard}
            onMouseLeave={handleMouseLeaveBoard}
            style={{ transform: `rotate(${boardRotation}deg)` }}
          >
            <img
              src={BOARD_IMAGE_URLS[playerCount]}
              alt={`A ${playerCount}-player game board`}
              className="w-full h-full object-contain drop-shadow-2xl relative z-0"
            />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`, backgroundSize: '2% 2%', pointerEvents: 'none' }} aria-hidden="true" />
            <div className="absolute inset-0 text-white/50 text-[8px] sm:text-xs pointer-events-none z-20" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (<div key={`x-${i}`} className="absolute" style={{ left: `${(i + 1) * 10}%`, top: '0.5%', transform: 'translateX(-50%)' }}>{(i + 1) * 10}</div>))}
                {Array.from({ length: 9 }).map((_, i) => (<div key={`y-${i}`} className="absolute" style={{ top: `${(i + 1) * 10}%`, left: '0.5%', transform: 'translateY(-50%)' }}>{(i + 1) * 10}</div>))}
            </div>

            {isTestMode && boardMousePosition && (
              <div 
                className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs p-2 rounded-md pointer-events-none shadow-lg backdrop-blur-sm z-10"
                style={{ 
                  transform: `rotate(${-boardRotation}deg) translateZ(0)`,
                }}
                aria-hidden="true"
              >
                <p className="font-mono">X: {boardMousePosition.x.toFixed(2)}%</p>
                <p className="font-mono">Y: {boardMousePosition.y.toFixed(2)}%</p>
              </div>
            )}
            
            {dropIndicator && (
              <>
                {/* Soft green glow indicator showing snap location */}
                <div
                  className="absolute pointer-events-none transition-all duration-100 ease-in-out rounded-full"
                  style={{
                    top: `${dropIndicator.position.top}%`,
                    left: `${dropIndicator.position.left}%`,
                    width: '80px',
                    height: '80px',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(34, 197, 94, 0.3)',
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)',
                    border: '2px solid rgba(34, 197, 94, 0.6)',
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
                  <img src={dropIndicator.imageUrl} alt="" className="w-full h-full object-contain" />
                </div>
              </>
            )}

            {unoccupiedSpaces.map(space => (
              <div
                key={`space-${space.ownerId}`}
                onDrop={(e) => handleDropOnTileSpace(e, space)}
                onDragOver={handleDragOver}
                className={`absolute w-12 h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-center transition-all duration-300
                  ${isDraggingTile ? 'border-cyan-400 bg-cyan-500/20 scale-105 border-solid' : 'border-cyan-400/50'}`
                }
                style={{ top: `${space.position.top}%`, left: `${space.position.left}%`, transform: `translate(-50%, -50%) rotate(${space.rotation}deg)` }}
              >
                <div style={{ transform: `rotate(${-space.rotation}deg)` }} className={`font-semibold text-xs leading-tight ${isDraggingTile ? 'text-cyan-200' : 'text-cyan-400/70'}`}>
                  <div>Drop Tile</div> <div>For P{space.ownerId}</div>
                </div>
              </div>
            ))}
            
            {boardTiles.map(boardTile => {
              const isPlacer = boardTile.placerId === currentPlayerId;
              const isTransactionalTile = boardTile.id === tileTransaction?.boardTileId;
              const isReceiver = currentPlayerId === tileTransaction?.receiverId;
              const isPubliclyRevealed = revealedTileId === boardTile.id;

              // NEW WORKFLOW: Check if this tile is being played (in TILE_PLAYED or PENDING_ACCEPTANCE state)
              const isPlayedTile = playedTile && (
                boardTile.tile.id.toString().padStart(2, '0') === playedTile.tileId &&
                boardTile.placerId === playedTile.playerId &&
                boardTile.ownerId === playedTile.receivingPlayerId
              );
              const isTilePlayedButNotYetAccepted = isPlayedTile && (gameState === 'TILE_PLAYED' || gameState === 'PENDING_ACCEPTANCE');

              // Receiver's private view logic (during PENDING_ACCEPTANCE)
              const showReceiverPrivateView = isPrivatelyViewing && isTransactionalTile && isReceiver;

              // Placer's private view logic (during CAMPAIGN, before ending turn)
              const canPlacerClickToView = isPlacer && isTransactionalTile && gameState === 'CAMPAIGN';
              const showPlacerPrivateView = placerViewingTileId === boardTile.id;

              // NEW RULE: Giver and receiver can toggle to see the tile face-up by clicking
              const isGiverOrReceiver = isPlacer || (isPlayedTile && currentPlayerId === playedTile.receivingPlayerId);
              const canGiverReceiverToggleView = isTilePlayedButNotYetAccepted && isGiverOrReceiver;
              const showGiverReceiverView = canGiverReceiverToggleView && giveReceiverViewingTileId === boardTile.id;

              // CORRECTION_REQUIRED: Show tile face-up for placer to see requirements
              const showCorrectionView = isPlayedTile && gameState === 'CORRECTION_REQUIRED' && isPlacer;

              const isRevealed = isPubliclyRevealed || showReceiverPrivateView || showPlacerPrivateView || showGiverReceiverView || showCorrectionView;

              // During tile play workflow, show white back unless it's being viewed by giver/receiver
              const shouldShowWhiteBack = isTilePlayedButNotYetAccepted && !showGiverReceiverView;

              const handleTileClick = () => {
                if (canPlacerClickToView) {
                  onPlacerViewTile(boardTile.id);
                } else if (canGiverReceiverToggleView) {
                  onSetGiveReceiverViewingTileId(giveReceiverViewingTileId === boardTile.id ? null : boardTile.id);
                }
              };

              const isTileClickable = canPlacerClickToView || canGiverReceiverToggleView;

              return (
                <div
                  key={boardTile.id}
                  draggable={isTestMode && !isTransactionalTile}
                  onDragStart={(isTestMode && !isTransactionalTile) ? (e) => handleDragStartBoardTile(e, boardTile.id) : undefined}
                  onClick={isTileClickable ? handleTileClick : undefined}
                  className={`absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 ${!isRevealed && !shouldShowWhiteBack ? '' : 'bg-stone-100 p-1'}` }
                  style={{
                    top: `${boardTile.position.top}%`,
                    left: `${boardTile.position.left}%`,
                    transform: `translate(-50%, -50%) rotate(${boardTile.rotation || 0}deg)`,
                    cursor: isTileClickable ? 'pointer' : 'default'
                  }}
                  aria-label={isTileClickable ? "Click to toggle tile visibility" : "A placed, face-down tile"}
                >
                  {shouldShowWhiteBack ? (
                    // Show white back for tile in play
                    <div className="w-full h-full bg-white rounded-lg border-2 border-gray-400 shadow-inner"></div>
                  ) : !isRevealed ? (
                    // Show gray back for old workflow tiles
                    <div className="w-full h-full bg-gray-700 rounded-lg border-2 border-white shadow-inner"></div>
                  ) : (
                    // Show tile face for revealed tiles
                    <img src={boardTile.tile.url} alt={`Tile ${boardTile.tile.id}`} className="w-full h-full object-contain" />
                  )}
                </div>
              );
            })}

            {/* Banked tiles */}
            {bankedTiles.map(bankedTile => (
              <div
                key={bankedTile.id}
                className="absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 bg-stone-100 p-1"
                style={{
                  top: `${bankedTile.position.top}%`,
                  left: `${bankedTile.position.left}%`,
                  transform: `translate(-50%, -50%) rotate(${bankedTile.rotation || 0}deg)`,
                }}
              >
                {bankedTile.faceUp ? (
                  // Rejected tile - face up
                  <img src={bankedTile.tile.url} alt={`Banked Tile ${bankedTile.tile.id}`} className="w-full h-full object-contain" />
                ) : (
                  // Accepted tile - face down (white back)
                  <div className="w-full h-full bg-white rounded-lg border-2 border-white shadow-inner"></div>
                )}
              </div>
            ))}

            {pieces.map((piece) => {
              let pieceSizeClass = 'w-10 h-10 sm:w-14 sm:h-14'; // Mark
              if (piece.name === 'Heel') pieceSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';
              if (piece.name === 'Pawn') pieceSizeClass = 'w-16 h-16 sm:w-20 sm:h-20';

              // Apply 15% size reduction for 3-player mode
              const scaleMultiplier = playerCount === 3 ? 0.85 : 1;
              const baseScale = 0.798;
              const finalScale = baseScale * scaleMultiplier;

              // For pieces in the community circle, apply inverse board rotation to counteract the board's perspective rotation
              const isInCommunity = isPositionInCommunityCircle(piece.position);
              const communityCounterRotation = isInCommunity ? -boardRotation : 0;

              return (
                <img key={piece.id} src={piece.imageUrl} alt={piece.name} draggable="true" onDragStart={(e) => handleDragStartPiece(e, piece.id)} onDragEnd={handleDragEndPiece} className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out`} style={{ position: 'absolute', top: `${piece.position.top}%`, left: `${piece.position.left}%`, transform: `translate(-50%, -50%) rotate(${piece.rotation + communityCounterRotation}deg) scale(${finalScale})`, cursor: 'grab' }} aria-hidden="true" />
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
                  cursor: 'grab'
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
            <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Player {currentPlayerId}'s Hand</h2>
            <p className={`text-center mb-4 ${gameState === 'CORRECTION_REQUIRED' ? 'text-yellow-400 font-semibold' : 'text-slate-400'}`}>
              {gameState === 'CORRECTION_REQUIRED'
                ? "Your tile was rejected. The tile requirements are shown above. Move your pieces to fulfill them, then click End Turn."
                : hasPlayedTileThisTurn
                ? "You have played a tile this turn."
                : "Drag a tile to another player's receiving area on the board."}
            </p>
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700 min-h-[8rem]">
              {currentPlayer?.keptTiles.map(tile => (
                <div key={tile.id} draggable={!hasPlayedTileThisTurn} onDragStart={(e) => handleDragStartTile(e, tile.id)} onDragEnd={() => setIsDraggingTile(false)} className={`bg-stone-100 w-12 h-24 p-1 rounded-md shadow-md border border-gray-300 transition-transform hover:scale-105 ${hasPlayedTileThisTurn || gameState !== 'CAMPAIGN' ? 'cursor-not-allowed opacity-60' : 'cursor-grab'}`} >
                  <img src={tile.url} alt={`Tile ${tile.id}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {isTestMode && (
            <div className="w-full max-w-5xl mt-4">
              <h3 className="text-xl font-bold text-center text-slate-300 mb-2">Other Players (Test Mode)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.filter(p => p.id !== currentPlayerId).map(player => (
                  <details key={player.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 cursor-pointer">
                    <summary className="font-semibold text-lg text-slate-100">Player {player.id}'s Tiles ({player.keptTiles.length})</summary>
                    <div className="mt-4">
                        <h4 className="font-semibold text-md text-slate-300">Playable Hand:</h4>
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          {player.keptTiles.map(tile => (
                            <div key={tile.id} className="bg-stone-100 w-12 h-24 p-1 rounded-md shadow-md border border-gray-300">
                              <img src={tile.url} alt={`Tile ${tile.id}`} className="w-full h-full object-contain" />
                            </div>
                          ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-md text-slate-300">Bureaucracy Tiles ({player.bureaucracyTiles.length}):</h4>
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          {player.bureaucracyTiles.map(tile => (
                              <div key={`buro-${tile.id}`} className="bg-gray-700 w-12 h-24 p-1 rounded-md shadow-inner border-2 border-yellow-400"></div>
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
            {/* Game Log */}
            <div>
              <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Game Log</h2>
              <div ref={logContainerRef} className="h-64 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto text-sm">
                {gameLog.length === 0 ? (
                  <p className="text-slate-400 text-center italic m-auto">No actions logged yet.</p>
                ) : (
                  gameLog.map((entry, index) => (
                    <p key={index} className={`text-slate-300 mb-2 ${entry.startsWith('---') ? 'font-bold text-cyan-300 mt-2 border-t border-gray-600 pt-2' : ''}`}>
                      {entry}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Test Mode Controls */}
            {isTestMode && (
              <div className="mt-8 space-y-4">
                {/* Board Rotation Toggle */}
                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardRotationEnabled}
                      onChange={(e) => setBoardRotationEnabled(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500"
                    />
                    <span className="text-slate-200 font-semibold">Board Rotation</span>
                    <span className="text-xs text-slate-400 ml-auto">{boardRotationEnabled ? '(ON)' : '(OFF)'}</span>
                  </label>
                  <p className="text-xs text-slate-400 mt-2">When ON, the board rotates to show each player's perspective. When OFF, the board stays fixed.</p>
                </div>

                {/* Check Move Button */}
                {playedTile && (gameState === 'TILE_PLAYED' || gameState === 'CORRECTION_REQUIRED') && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <button
                      onClick={() => onCheckMove?.()}
                      className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors shadow-lg"
                    >
                      ✓ Check Move
                    </button>
                    <p className="text-xs text-slate-400 mt-2">{gameState === 'CORRECTION_REQUIRED' ? 'Validate if corrections satisfy the tile requirements.' : 'Validate if the moves satisfy the tile requirements.'}</p>
                  </div>
                )}
              </div>
            )}

            {/* Create Dummy Tile Button (Test Mode Only) */}
            {isTestMode && !dummyTile && (
              <div className="mt-8">
                <button
                  onClick={() => setDummyTile({ position: { top: 50, left: 50 }, rotation: 0 })}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
                >
                  + Create Dummy Tile
                </button>
              </div>
            )}

            {isTestMode && dummyTile && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Dummy Tile Tracker</h2>
                <div className="bg-gray-800/50 rounded-lg border border-indigo-600 p-4 text-sm">
                  <div className="font-mono border-b border-gray-600 pb-4 mb-4">
                    <div className="font-semibold text-indigo-300 mb-3">Dummy Tile Position & Rotation</div>
                    <div className="text-slate-300 mb-2">
                      <span className="font-semibold">Position:</span> Left: <span className="text-cyan-400">{dummyTile.position.left.toFixed(2)}%</span> | Top: <span className="text-cyan-400">{dummyTile.position.top.toFixed(2)}%</span>
                    </div>
                    <div className="text-slate-300 mb-4">
                      <span className="font-semibold">Rotation:</span> <span className="text-cyan-400">{dummyTile.rotation.toFixed(1)}°</span>
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
                <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Piece Tracker</h2>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 max-h-96 overflow-y-auto text-xs">
                  {pieces.length === 0 ? (
                    <p className="text-slate-400 text-center italic">No pieces on board</p>
                  ) : (
                    <div className="space-y-2">
                      {pieces.map((piece) => (
                        <div key={piece.id} className={`font-mono border-b border-gray-600 pb-1 ${piece.id === lastDroppedPieceId ? 'text-yellow-300' : 'text-slate-300'}`}>
                          <div className={`font-semibold ${piece.id === lastDroppedPieceId ? 'text-yellow-400' : 'text-cyan-300'}`}>{piece.displayName || piece.name}</div>
                          <div className={piece.id === lastDroppedPieceId ? 'text-yellow-200' : 'text-slate-400'}>Left: {piece.position.left.toFixed(2)}% | Top: {piece.position.top.toFixed(2)}%</div>
                          <div className={piece.id === lastDroppedPieceId ? 'text-yellow-200' : 'text-slate-400'}>Rotation: {piece.rotation.toFixed(1)}° | Location: {piece.locationId || 'unknown'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-8">
        <button
          onClick={onEndTurn}
          disabled={(gameState !== 'CAMPAIGN' && gameState !== 'TILE_PLAYED' && gameState !== 'CORRECTION_REQUIRED') || (gameState === 'CAMPAIGN' && !hasPlayedTileThisTurn)}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          End Turn
        </button>
        <button onClick={onNewGame} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-md">
          New Game
        </button>
      </div>

      {/* --- Overlays --- */}
      {showChallengeRevealModal && challengedTile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border-2 border-red-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
                <h2 className="text-4xl font-extrabold text-red-500 mb-2">CHALLENGED!</h2>
                <p className="text-slate-300 mb-4">The placed tile has been revealed to all players.</p>
                <div className="bg-stone-100 w-20 h-40 p-1 rounded-lg shadow-lg border-2 border-gray-300 mx-auto mb-6">
                    <img src={challengedTile.url} alt={`Tile ${challengedTile.id}`} className="w-full h-full object-contain" />
                </div>
                <button onClick={onContinueAfterChallenge} className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-500 transition-colors shadow-md hover:shadow-lg">
                    Continue
                </button>
            </div>
        </div>
      )}

      {/* Receiver Decision Modal (when not privately viewing) */}
      {isMyTurnForDecision && gameState === 'PENDING_ACCEPTANCE' && !isPrivatelyViewing && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40 p-4">
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full pointer-events-auto">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">Your Decision</h2>
            <p className="text-slate-300 mb-6">{`Player ${playedTile?.playerId || tileTransaction?.placerId} has played a tile to you. You can either accept or reject it.`}</p>
            <p className="text-slate-400 text-sm mb-4">Click on the tile to view it</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={() => playedTile ? onReceiverAcceptanceDecision(false) : onReceiverDecision('reject')} className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md w-full sm:w-auto">
                Reject Tile
              </button>
              <button onClick={() => playedTile ? onReceiverAcceptanceDecision(true) : onReceiverDecision('accept')} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md w-full sm:w-auto">
                Accept Tile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bystander Challenge Modal */}
      {isMyTurnForDecision && gameState === 'PENDING_CHALLENGE' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">Challenge or Pass?</h2>
            <p className="text-slate-300 mb-6">{`Player ${playedTile?.receivingPlayerId || tileTransaction?.receiverId} accepted the tile from Player ${playedTile?.playerId || tileTransaction?.placerId}.`}</p>
            <div className="flex justify-center items-center gap-4">
              <button onClick={() => playedTile ? onChallengerDecision(true) : onBystanderDecision('challenge')} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors shadow-md">
                Challenge
              </button>
              <button onClick={() => playedTile ? onChallengerDecision(false) : onBystanderDecision('pass')} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md">
                Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {showWaitingOverlay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
             <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-xl text-center shadow-2xl">
                 <h2 className="text-2xl font-bold text-slate-200 animate-pulse">{waitingMessage}</h2>
             </div>
        </div>
      )}

      {/* Move Check Result Modal */}
      {showMoveCheckResult && moveCheckResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-xl text-center shadow-2xl max-w-lg w-full">
            <div className="mb-8">
              {!moveCheckResult.isMet ? (
                <div className="text-center">
                  <div className="text-9xl text-red-500 font-bold mb-4">✕</div>
                  <h2 className="text-4xl font-bold text-red-400 mb-2">Requirements Not Met</h2>
                  <p className="text-lg text-red-300">The moves do not satisfy the tile requirements.</p>
                </div>
              ) : moveCheckResult.hasExtraMoves ? (
                <div className="text-center">
                  <div className="text-9xl text-yellow-400 font-bold mb-4">⚠️</div>
                  <h2 className="text-4xl font-bold text-yellow-300 mb-2">Requirements Met</h2>
                  <p className="text-lg text-yellow-200">But extra non-required moves were performed.</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-9xl text-green-500 font-bold mb-4">✓</div>
                  <h2 className="text-4xl font-bold text-green-400 mb-2">Requirements Met!</h2>
                  <p className="text-lg text-green-300">All tile requirements have been satisfied.</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="bg-gray-700/50 rounded-lg p-6 mb-6 text-left space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Required Moves:</h3>
                <div className="flex flex-wrap gap-2">
                  {moveCheckResult.requiredMoves.length > 0 ? (
                    moveCheckResult.requiredMoves.map((move, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded">
                        {move}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No specific moves required</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Moves Performed:</h3>
                <div className="flex flex-wrap gap-2">
                  {moveCheckResult.performedMoves.length > 0 ? (
                    moveCheckResult.performedMoves.map((move, index) => (
                      <span key={index} className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded">
                        {move}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No moves performed</span>
                  )}
                </div>
              </div>

              {moveCheckResult.missingMoves.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Missing Moves:</h3>
                  <div className="flex flex-wrap gap-2">
                    {moveCheckResult.missingMoves.map((move, index) => (
                      <span key={index} className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded">
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {moveCheckResult.hasExtraMoves && moveCheckResult.extraMoves.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Extra Moves (Not Required):</h3>
                  <div className="flex flex-wrap gap-2">
                    {moveCheckResult.extraMoves.map((move, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded">
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Move Validations - Only show if there are issues or multiple moves */}
              {moveCheckResult.moveValidations && moveCheckResult.moveValidations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">Move Details:</h3>
                  <div className="space-y-2">
                    {moveCheckResult.moveValidations.map((validation, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border-l-4 ${
                          validation.isValid
                            ? 'bg-green-900/30 border-green-500'
                            : 'bg-red-900/30 border-red-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-lg font-bold ${
                              validation.isValid ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {validation.isValid ? '✓' : '✕'}
                          </span>
                          <span className={`font-semibold ${validation.isValid ? 'text-green-300' : 'text-white'}`}>
                            {validation.moveType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 ml-7">
                          {validation.fromLocationId && (
                            <>
                              FROM: <span className="text-cyan-400">{validation.fromLocationId}</span>
                              {validation.toLocationId && (
                                <>
                                  {' → TO: '}
                                  <span className="text-cyan-400">{validation.toLocationId}</span>
                                </>
                              )}
                            </>
                          )}
                        </p>
                        {!validation.isValid && (
                          <p className="text-xs text-red-300 ml-7 mt-1">{validation.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onCloseMoveCheckResult?.()}
              className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors text-white ${
                !moveCheckResult.isMet
                  ? 'bg-red-600 hover:bg-red-500'
                  : moveCheckResult.hasExtraMoves
                  ? 'bg-yellow-600 hover:bg-yellow-500'
                  : 'bg-green-600 hover:bg-green-500'
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
 */
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('PLAYER_SELECTION');
  const [players, setPlayers] = useState<Player[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [boardTiles, setBoardTiles] = useState<BoardTile[]>([]);
  const [bankedTiles, setBankedTiles] = useState<(BoardTile & { faceUp: boolean })[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [draftRound, setDraftRound] = useState(1);
  const [isTestMode, setIsTestMode] = useState(false);
  const [dummyTile, setDummyTile] = useState<{ position: { top: number; left: number }; rotation: number } | null>(null);
  const [boardRotationEnabled, setBoardRotationEnabled] = useState(true);
  const [lastDroppedPosition, setLastDroppedPosition] = useState<{ top: number; left: number } | null>(null);
  const [lastDroppedPieceId, setLastDroppedPieceId] = useState<string | null>(null);
  const [hasPlayedTileThisTurn, setHasPlayedTileThisTurn] = useState(false);
  const [revealedTileId, setRevealedTileId] = useState<string | null>(null);

  // State for new acceptance/challenge flow
  const [tileTransaction, setTileTransaction] = useState<{ placerId: number; receiverId: number; boardTileId: string; tile: Tile; } | null>(null);
  const [bystanders, setBystanders] = useState<Player[]>([]);
  const [bystanderIndex, setBystanderIndex] = useState(0);
  const [isPrivatelyViewing, setIsPrivatelyViewing] = useState(false);
  const [showChallengeRevealModal, setShowChallengeRevealModal] = useState(false);
  const [challengedTile, setChallengedTile] = useState<Tile | null>(null);
  const [placerViewingTileId, setPlacerViewingTileId] = useState<string | null>(null);
  const [giveReceiverViewingTileId, setGiveReceiverViewingTileId] = useState<string | null>(null);

  // State for Game Log
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [piecesAtTurnStart, setPiecesAtTurnStart] = useState<Piece[]>([]);

  // State for new tile play workflow
  const [playedTile, setPlayedTile] = useState<{
    tileId: string;
    playerId: number;
    receivingPlayerId: number;
    movesPerformed: any[]; // TrackedMove[]
    originalPieces: Piece[];
    originalBoardTiles: BoardTile[];
  } | null>(null);
  const [movesThisTurn, setMovesThisTurn] = useState<any[]>([]); // TrackedMove[]
  const [receiverAcceptance, setReceiverAcceptance] = useState<boolean | null>(null); // null = awaiting decision, true = accepted, false = rejected
  const [challengeOrder, setChallengeOrder] = useState<number[]>([]);
  const [currentChallengerIndex, setCurrentChallengerIndex] = useState(0);
  const [tileRejected, setTileRejected] = useState(false);
  const [showMoveCheckResult, setShowMoveCheckResult] = useState(false);
  const [moveCheckResult, setMoveCheckResult] = useState<{
    isMet: boolean;
    requiredMoves: any[];
    performedMoves: any[];
    missingMoves: any[];
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

  // State for custom alert modals
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Helper function to show styled alert modals
  const showAlert = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleStartGame = (count: number, testMode: boolean) => {
    setPlayerCount(count);
    setPlayers(initializePlayers(count));
    setGameState('DRAFTING');
    setCurrentPlayerIndex(0);
    setDraftRound(1);
    setIsTestMode(testMode);
  };

  const handleNewGame = () => {
    setGameState('PLAYER_SELECTION');
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
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
    setShowMoveCheckResult(false);
    setMoveCheckResult(null);
    setGiveReceiverViewingTileId(null);
  };
  
  const handleSelectTile = (selectedTile: Tile) => {
    const updatedPlayers = players.map((player, index) => {
      if (index === currentPlayerIndex) {
        return {
          ...player,
          keptTiles: [...player.keptTiles, selectedTile],
          hand: player.hand.filter(tile => tile.id !== selectedTile.id),
        };
      }
      return player;
    });

    const nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex >= playerCount) {
      const handsToPass = updatedPlayers.map(p => p.hand);
      const playersWithPassedHands = updatedPlayers.map((p, i) => {
        const passingPlayerIndex = (i - 1 + playerCount) % playerCount;
        return { ...p, hand: handsToPass[passingPlayerIndex] };
      });

      if (playersWithPassedHands[0].hand.length === 0) {
        setGameState('CAMPAIGN');

        // Create pieces from default positions
        const defaultPositions = DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT[playerCount] || [];
        console.log('Creating initial pieces from', defaultPositions.length, 'default positions for', playerCount, 'players');
        const initialPieces: Piece[] = defaultPositions.map((piece, index) => {
          // Find the location ID for this position
          const locationId = getLocationIdFromPosition(piece.position, playerCount) || 'community_default';
          const pieceType = PIECE_TYPES[piece.name.toUpperCase()];
          if (!pieceType) {
            console.error(`Unknown piece type: ${piece.name}`);
          }
          return {
            id: `piece_${index}`,
            name: piece.name,
            displayName: piece.displayName,
            imageUrl: pieceType?.imageUrl || '',
            position: piece.position,
            rotation: calculatePieceRotation(piece.position, playerCount, locationId),
            locationId,
          };
        });

        console.log('Initial pieces created:', initialPieces.length);
        setPieces(initialPieces);
        setPiecesAtTurnStart(initialPieces);

        const startingTileId = 3;
        const startingPlayerIndex = playersWithPassedHands.findIndex(p => p.keptTiles && p.keptTiles.some(t => t.id === startingTileId));
        console.log('startingPlayerIndex:', startingPlayerIndex, 'playersWithPassedHands:', playersWithPassedHands);

        setCurrentPlayerIndex(startingPlayerIndex !== -1 ? startingPlayerIndex : 0);
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
  
  const handlePieceMove = (pieceId: string, newPosition: { top: number; left: number }, locationId?: string) => {
    // Check community movement restrictions before allowing the move
    const movingPiece = pieces.find(p => p.id === pieceId);
    if (movingPiece && movingPiece.locationId?.includes('community') && locationId && !locationId.includes('community')) {
      // Piece is moving FROM community, check restrictions
      const pieceName = movingPiece.name.toLowerCase();

      // Marks can always move from community
      if (pieceName !== 'mark') {
        // Check if Marks are in community
        const marksInCommunity = pieces.some(p =>
          p.locationId?.includes('community') && p.name.toLowerCase() === 'mark'
        );

        // If Marks in community, Heels and Pawns cannot move
        if (marksInCommunity) {
          showAlert(
            'Cannot Move This Piece',
            'To move a Pawn, Heels need to be gone. To move Heels, Marks need to be gone.',
            'warning'
          );
          return;
        }

        // If moving a Pawn, check if Heels are in community
        if (pieceName === 'pawn') {
          const heelsInCommunity = pieces.some(p =>
            p.locationId?.includes('community') && p.name.toLowerCase() === 'heel'
          );
          // Pawns cannot move if Heels in community
          if (heelsInCommunity) {
            showAlert(
              'Cannot Move This Piece',
              'To move a Pawn, Heels need to be gone. To move Heels, Marks need to be gone.',
              'warning'
            );
            return;
          }
        }
      }
    }

    setLastDroppedPosition(newPosition);
    setLastDroppedPieceId(pieceId);
    const newRotation = calculatePieceRotation(newPosition, playerCount, locationId);

    // Simply update the piece position and location
    // Move validation will be calculated when Check Move is clicked
    setPieces(prevPieces => prevPieces.map(p => p.id === pieceId ? { ...p, position: newPosition, rotation: newRotation, ...(locationId !== undefined && { locationId }) } : p));
  };

  const handleBoardTileMove = (boardTileId: string, newPosition: { top: number; left: number }) => {
    setLastDroppedPosition(newPosition);
    setBoardTiles(prevBoardTiles => prevBoardTiles.map(bt => bt.id === boardTileId ? { ...bt, position: newPosition } : bt));
  };

  const generateTurnLog = (
      turnPlayerId: number,
      piecesBefore: Piece[],
      piecesAfter: Piece[],
      countOfPlayers: number,
      tileTransactionAtTurnEnd: typeof tileTransaction
    ): string[] => {
      const logs: string[] = [];

      const piecesBeforeMap = new Map(piecesBefore.map(p => [p.id, p]));
      const piecesAfterMap = new Map(piecesAfter.map(p => [p.id, p]));

      if (tileTransactionAtTurnEnd && tileTransactionAtTurnEnd.placerId === turnPlayerId) {
        logs.push(`Played a tile for Player ${tileTransactionAtTurnEnd.receiverId}.`);
      }

      for (const [id, oldPiece] of piecesBeforeMap.entries()) {
        const newPiece = piecesAfterMap.get(id);
        if (newPiece) {
          if (Math.abs(oldPiece.position.left - newPiece.position.left) > 0.01 || Math.abs(oldPiece.position.top - newPiece.position.top) > 0.01) {
            const oldLocId = getLocationIdFromPosition(oldPiece.position, countOfPlayers);
            const newLocId = getLocationIdFromPosition(newPiece.position, countOfPlayers);
            const oldLocStr = oldLocId ? formatLocationId(oldLocId) : 'a location';
            const newLocStr = newLocId ? formatLocationId(newLocId) : 'another location';
            logs.push(`Moved a ${oldPiece.name} from ${oldLocStr} to ${newLocStr}.`);
          }
        } else {
          const oldLocId = getLocationIdFromPosition(oldPiece.position, countOfPlayers);
          const oldLocStr = oldLocId ? formatLocationId(oldLocId) : 'a location';
          logs.push(`Returned a ${oldPiece.name} to supply from ${oldLocStr}.`);
        }
      }

      for (const [id, newPiece] of piecesAfterMap.entries()) {
        if (!piecesBeforeMap.has(id)) {
          const newLocId = getLocationIdFromPosition(newPiece.position, countOfPlayers);
          const newLocStr = newLocId ? formatLocationId(newLocId) : 'a location';
          logs.push(`Added a ${newPiece.name} from supply to ${newLocStr}.`);
        }
      }
      return logs;
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

    const fromPlayerIndex = players.findIndex(p => p.id === fromPlayerId);
    // If player not found, fromPlayerIndex will be -1.
    // (-1 + 1) % playerCount will be 0, which is a safe default.
    const nextPlayerIndex = (fromPlayerIndex + 1) % playerCount;

    setCurrentPlayerIndex(nextPlayerIndex);
    setHasPlayedTileThisTurn(false);
    setRevealedTileId(null);
    setGameState('CAMPAIGN');
    setTileTransaction(null);
    setBystanders([]);
    setBystanderIndex(0);
    setIsPrivatelyViewing(false);
    setChallengedTile(null);
    setPlacerViewingTileId(null);
  };

  const handleEndTurn = () => {
    // NEW WORKFLOW: Handle correction of rejected/challenged tile
    if (gameState === 'CORRECTION_REQUIRED' && playedTile) {
      // Use handleCorrectionComplete which calculates moves from actual piece positions
      handleCorrectionComplete();
      return;
    }

    // NEW WORKFLOW: If a tile has been played, move to acceptance phase
    if (playedTile && gameState === 'TILE_PLAYED') {
      // Validate moves performed (max 2 moves: 1 O and 1 M)
      const movesValidation = validateMovesForTilePlay(movesThisTurn);
      if (!movesValidation.isValid) {
        showAlert('Invalid Moves', movesValidation.error, 'error');
        return;
      }

      // Store moves and move to acceptance phase
      setPlayedTile(prev => prev ? { ...prev, movesPerformed: movesThisTurn } : null);
      setReceiverAcceptance(null); // Reset for acceptance decision
      setGameState('PENDING_ACCEPTANCE');

      // Switch to receiving player
      const receiverIndex = players.findIndex(p => p.id === playedTile.receivingPlayerId);
      if (receiverIndex !== -1) {
        setCurrentPlayerIndex(receiverIndex);
      }
      return;
    }

    // OLD WORKFLOW: Normal end turn (if not in tile play)
    // Log actions for the turn that just ended.
    const turnEnderId = players[currentPlayerIndex].id;
    const transactionToLog = (tileTransaction && tileTransaction.placerId === turnEnderId) ? tileTransaction : null;

    const turnLogs = generateTurnLog(turnEnderId, piecesAtTurnStart, pieces, playerCount, transactionToLog);

    if (turnLogs.length > 0) {
      const logHeader = `--- Turn Actions by Player ${turnEnderId} ---`;
      setGameLog(prev => [...prev, logHeader, ...turnLogs]);
    }

    // Set piece state for the start of the next turn.
    setPiecesAtTurnStart(pieces);

    if (hasPlayedTileThisTurn && tileTransaction) {
      const receiverIndex = players.findIndex(p => p.id === tileTransaction.receiverId);
      if (receiverIndex !== -1) {
        setGameState('PENDING_ACCEPTANCE');
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
    const tileToPlace = currentPlayer.keptTiles.find(t => t.id === tileId);

    if (!tileToPlace || boardTiles.some(bt => bt.ownerId === targetSpace.ownerId)) return;

    if (currentPlayer.id === targetSpace.ownerId) {
      const otherPlayers = players.filter(p => p.id !== currentPlayer.id);
      const allOthersAreOutOfTiles = otherPlayers.every(p => p.keptTiles.length === 0);
      if (!allOthersAreOutOfTiles) {
        showAlert('Cannot Play for Yourself', 'You cannot play a tile for yourself until all other players have run out of tiles.', 'warning');
        return;
      }
    }

    // Initialize the tile play state (NEW WORKFLOW)
    const tileIdStr = tileId.toString().padStart(2, '0');
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
      originalPieces: pieces.map(p => ({ ...p })),
      originalBoardTiles: boardTiles.map(t => ({ ...t })),
    });

    // Add the board tile to display in the receiving space
    setBoardTiles(prev => [...prev, newBoardTile]);

    // Remove tile from player's hand (will be added back if rejected)
    setPlayers(prev => prev.map(p =>
      p.id === currentPlayer.id
        ? { ...p, keptTiles: p.keptTiles.filter(t => t.id !== tileId) }
        : p
    ));

    // Set game state to allow moves (tile not yet visible to others)
    setGameState('TILE_PLAYED');
    setMovesThisTurn([]);
    setHasPlayedTileThisTurn(true);
  };
  
  const handleRevealTile = (tileId: string | null) => { setRevealedTileId(tileId); };

  const handleTogglePrivateView = () => setIsPrivatelyViewing(prev => !prev);
  
  const handlePlacerViewTile = (tileId: string) => {
    setPlacerViewingTileId(prevId => (prevId === tileId ? null : tileId));
  };

  // NEW WORKFLOW HANDLERS

  /**
   * Handle receiving player's acceptance or rejection of the played tile
   */
  const handleReceiverAcceptanceDecision = (accepted: boolean) => {
    if (!playedTile) return;

    if (!accepted) {
      // Check if tile is perfect using same logic as Check Move
      const calculatedMoves = calculateMoves(playedTile.originalPieces, pieces, playedTile.playerId);
      const tileRequirements = validateTileRequirements(playedTile.tileId, calculatedMoves);

      // Check for extra moves
      const requiredMoveTypes = tileRequirements.requiredMoves;
      const performedMoveTypes = calculatedMoves.map(m => m.moveType);
      const extraMoves: string[] = [];
      for (const moveType of performedMoveTypes) {
        if (!requiredMoveTypes.includes(moveType)) {
          extraMoves.push(moveType);
        }
      }
      const uniqueExtraMoves = [...new Set(extraMoves)];

      // Tile is perfect if requirements are met and no extra moves
      const isTilePerfect = tileRequirements.isMet && uniqueExtraMoves.length === 0;

      if (isTilePerfect) {
        // Cannot reject - show perfect tile modal
        setShowPerfectTileModal(true);
        return;
      }

      // REJECTION: Reverse moves and prompt player to fulfill tile requirements
      setReceiverAcceptance(false);
      setTileRejected(true);

      // Restore original pieces (remove any moves made)
      setPieces(playedTile.originalPieces.map(p => ({ ...p })));
      // Keep the board tile visible in the receiving space (don't restore full board state)
      // The BoardTile will remain showing the white back

      // Add tile to receiving player's bureaucracy tiles for tracking
      const receivingPlayer = players.find(p => p.id === playedTile.receivingPlayerId);
      if (receivingPlayer) {
        setPlayers(prev =>
          prev.map(p =>
            p.id === receivingPlayer.id
              ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, { id: parseInt(playedTile.tileId), url: `https://montoyahome.com/kred/${playedTile.tileId}.svg` }] }
              : p
          )
        );
      }

      // Switch back to tile player for correction
      const playerIndex = players.findIndex(p => p.id === playedTile.playerId);
      if (playerIndex !== -1) {
        setCurrentPlayerIndex(playerIndex);
        setGameState('CORRECTION_REQUIRED');
        setMovesThisTurn([]);
      }
    } else {
      // ACCEPTANCE: Move to challenge phase
      setReceiverAcceptance(true);

      // Determine challenge order (clockwise from tile player, excluding giver and receiver)
      const tilePlayerIndex = players.findIndex(p => p.id === playedTile.playerId);
      const order = getChallengeOrder(playedTile.playerId, playerCount, playedTile.receivingPlayerId);
      setChallengeOrder(order);

      // If there are challengers, move to first challenger
      if (order.length > 0) {
        const firstChallengerIndex = players.findIndex(p => p.id === order[0]);
        setCurrentPlayerIndex(firstChallengerIndex);
        setCurrentChallengerIndex(0);
        setGameState('PENDING_CHALLENGE');
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
    const order = getChallengeOrder(playedTile.playerId, playerCount, playedTile.receivingPlayerId);
    setChallengeOrder(order);

    // If there are challengers, move to first challenger
    if (order.length > 0) {
      const firstChallengerIndex = players.findIndex(p => p.id === order[0]);
      setCurrentPlayerIndex(firstChallengerIndex);
      setCurrentChallengerIndex(0);
      setGameState('PENDING_CHALLENGE');
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
      // CHALLENGED: Verify if tile player met requirements
      const tileRequirements = validateTileRequirements(playedTile.tileId, playedTile.movesPerformed);

      if (!tileRequirements.isMet) {
        // Challenge is valid - player did NOT meet requirements
        // Reverse moves and prompt correction
        setTileRejected(true);

        // Restore original pieces (remove any moves made)
        setPieces(playedTile.originalPieces.map(p => ({ ...p })));
        // Keep the board tile visible in the receiving space (don't restore full board state)
        // The BoardTile will remain showing the white back

        // Switch to tile player for correction
        const playerIndex = players.findIndex(p => p.id === playedTile.playerId);
        if (playerIndex !== -1) {
          setCurrentPlayerIndex(playerIndex);
          setGameState('CORRECTION_REQUIRED');
          setMovesThisTurn([]);
        }
      } else {
        // Challenge is invalid - player DID meet requirements
        // Finalize with moves standing
        finalizeTilePlay(true, challengeOrder[currentChallengerIndex]);
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
        const nextChallengerIndex_PlayerIndex = players.findIndex(p => p.id === nextChallengerId);
        setCurrentChallengerIndex(nextChallengerIndex);
        setCurrentPlayerIndex(nextChallengerIndex_PlayerIndex);
      }
    }
  };

  /**
   * Finalize tile play - determine who keeps the tile and next player
   */
  const finalizeTilePlay = (wasChallenged: boolean, challengerId: number | null) => {
    if (!playedTile) return;

    // Determine if tile was rejected (face up) or accepted (face down)
    const tileWasRejected = tileRejected;
    const faceUpInBank = tileWasRejected;

    // Get bank spaces for the receiving player
    const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const playerBankSpaces = bankSpaces.filter(bs => bs.ownerId === playedTile.receivingPlayerId);

    // Find the next available bank space (accounting for already banked tiles)
    const usedBankIndices = new Set(
      bankedTiles
        .filter(bt => bt.ownerId === playedTile.receivingPlayerId)
        .map(bt => playerBankSpaces.findIndex(bs => bs.position.left === bt.position.left && bs.position.top === bt.position.top))
    );

    let nextBankIndex = 0;
    for (let i = 0; i < playerBankSpaces.length; i++) {
      if (!usedBankIndices.has(i)) {
        nextBankIndex = i;
        break;
      }
    }

    // Create the banked tile
    if (nextBankIndex < playerBankSpaces.length) {
      const bankSpace = playerBankSpaces[nextBankIndex];
      const newBankedTile: BoardTile & { faceUp: boolean } = {
        id: `bank_${playedTile.receivingPlayerId}_${nextBankIndex}_${Date.now()}`,
        tile: { id: parseInt(playedTile.tileId), url: `https://montoyahome.com/kred/${playedTile.tileId}.svg` },
        position: bankSpace.position,
        rotation: bankSpace.rotation,
        placerId: playedTile.playerId,
        ownerId: playedTile.receivingPlayerId,
        faceUp: faceUpInBank,
      };

      setBankedTiles(prev => [...prev, newBankedTile]);
    }

    // Remove from board tiles
    setBoardTiles(prev =>
      prev.filter(bt => !(
        bt.tile.id.toString().padStart(2, '0') === playedTile.tileId &&
        bt.placerId === playedTile.playerId &&
        bt.ownerId === playedTile.receivingPlayerId
      ))
    );

    // Receiving player keeps the tile in their bureaucracy
    const tile = { id: parseInt(playedTile.tileId), url: `https://montoyahome.com/kred/${playedTile.tileId}.svg` };

    setPlayers(prev =>
      prev.map(p =>
        p.id === playedTile.receivingPlayerId
          ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tile] }
          : p
      )
    );

    // Next player is the receiving player
    const receiverIndex = players.findIndex(p => p.id === playedTile.receivingPlayerId);
    if (receiverIndex !== -1) {
      setCurrentPlayerIndex(receiverIndex);
    }

    // Reset all tile play state
    setPlayedTile(null);
    setMovesThisTurn([]);
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
    setGameState('CAMPAIGN');
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);
  };

  /**
   * Handle tile player correcting their moves (after rejection or challenge)
   */
  const handleCorrectionComplete = () => {
    if (!playedTile) return;

    // Use the same calculation logic as Check Move button
    const calculatedMoves = calculateMoves(playedTile.originalPieces, pieces, playedTile.playerId);

    // Validate that tile player has now met the requirements
    const tileRequirements = validateTileRequirements(playedTile.tileId, calculatedMoves);

    console.log('=== handleCorrectionComplete DEBUG ===');
    console.log('Tile ID:', playedTile.tileId);
    console.log('Tile Player ID:', playedTile.playerId);
    console.log('Number of original pieces:', playedTile.originalPieces.length);
    console.log('Number of current pieces:', pieces.length);
    console.log('Sample original piece:', playedTile.originalPieces[0]);
    console.log('Sample current piece:', pieces[0]);
    console.log('Calculated moves:', calculatedMoves);
    console.log('Tile requirements:', tileRequirements);
    console.log('======================================');

    if (!tileRequirements.isMet) {
      showAlert('Incomplete Moves', `Still missing ${tileRequirements.missingMoves.join(', ')} move(s)`, 'error');
      return;
    }

    // Create updated tile with corrected moves
    const updatedPlayedTile = { ...playedTile, movesPerformed: calculatedMoves };

    // Get bank spaces for the receiving player
    const bankSpaces = BANK_SPACES_BY_PLAYER_COUNT[playerCount] || [];
    const playerBankSpaces = bankSpaces.filter(bs => bs.ownerId === updatedPlayedTile.receivingPlayerId);

    // Find the next available bank space (accounting for already banked tiles)
    const usedBankIndices = new Set(
      bankedTiles
        .filter(bt => bt.ownerId === updatedPlayedTile.receivingPlayerId)
        .map(bt => playerBankSpaces.findIndex(bs => bs.position.left === bt.position.left && bs.position.top === bt.position.top))
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
        id: `bank_${updatedPlayedTile.receivingPlayerId}_${nextBankIndex}_${Date.now()}`,
        tile: { id: parseInt(updatedPlayedTile.tileId), url: `https://montoyahome.com/kred/${updatedPlayedTile.tileId}.svg` },
        position: bankSpace.position,
        rotation: bankSpace.rotation,
        placerId: updatedPlayedTile.playerId,
        ownerId: updatedPlayedTile.receivingPlayerId,
        faceUp: true, // Always face-up for rejected tiles
      };

      setBankedTiles(prev => [...prev, newBankedTile]);
    }

    // Remove from board tiles
    setBoardTiles(prev =>
      prev.filter(bt => !(
        bt.tile.id.toString().padStart(2, '0') === updatedPlayedTile.tileId &&
        bt.placerId === updatedPlayedTile.playerId &&
        bt.ownerId === updatedPlayedTile.receivingPlayerId
      ))
    );

    // Receiving player gets the tile in their bureaucracy
    const tile = { id: parseInt(updatedPlayedTile.tileId), url: `https://montoyahome.com/kred/${updatedPlayedTile.tileId}.svg` };
    setPlayers(prev =>
      prev.map(p =>
        p.id === updatedPlayedTile.receivingPlayerId
          ? { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tile] }
          : p
      )
    );

    // Move to receiving player for their turn
    const receiverIndex = players.findIndex(p => p.id === updatedPlayedTile.receivingPlayerId);
    if (receiverIndex !== -1) {
      setCurrentPlayerIndex(receiverIndex);
    }

    // Reset state
    setPlayedTile(null);
    setMovesThisTurn([]);
    setReceiverAcceptance(null);
    setChallengeOrder([]);
    setCurrentChallengerIndex(0);
    setTileRejected(false);
    setGameState('CAMPAIGN');
    setHasPlayedTileThisTurn(false);
    setGiveReceiverViewingTileId(null);
  };

  /**
   * Helper function to calculate moves by comparing current pieces to original pieces
   */
  const calculateMoves = (originalPieces: Piece[], currentPieces: Piece[], tilePlayerId: number): any[] => {
    const calculatedMoves: any[] = [];

    console.log('calculateMoves called with:', {
      originalPiecesCount: originalPieces.length,
      currentPiecesCount: currentPieces.length,
      tilePlayerId
    });

    for (const currentPiece of currentPieces) {
      const initialPiece = originalPieces.find(p => p.id === currentPiece.id);
      if (!initialPiece) {
        console.log('No initial piece found for:', currentPiece.id);
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
      if (initialLocId?.includes('community') &&
          (finalLocId?.includes('_seat') || finalLocId?.includes('_rostrum') || finalLocId?.includes('_office'))) {
        shouldCountMove = true;
      }
      // Rule 2: Seat → Community = COUNT (only if started in seat)
      else if (initialLocId?.includes('_seat') && finalLocId?.includes('community')) {
        shouldCountMove = true;
      }
      // Rule 3: Seat → Seat = COUNT (intermediate moves don't matter)
      else if (initialLocId?.includes('_seat') && finalLocId?.includes('_seat')) {
        shouldCountMove = true;
      }
      // Rule 4: Seat → Rostrum = COUNT
      else if (initialLocId?.includes('_seat') && finalLocId?.includes('_rostrum')) {
        shouldCountMove = true;
      }
      // Rule 5: Rostrum → Seat/Office = COUNT
      else if (initialLocId?.includes('_rostrum') &&
               (finalLocId?.includes('_seat') || finalLocId?.includes('_office'))) {
        shouldCountMove = true;
      }
      // Rule 6: Office → Rostrum = COUNT
      else if (initialLocId?.includes('_office') && finalLocId?.includes('_rostrum')) {
        shouldCountMove = true;
      }
      // Rule 7: Rostrum → Community = COUNT (WITHDRAW)
      else if (initialLocId?.includes('_rostrum') && finalLocId?.includes('community')) {
        shouldCountMove = true;
      }
      // Rule 8: Rostrum → Rostrum = COUNT (ORGANIZE)
      else if (initialLocId?.includes('_rostrum') && finalLocId?.includes('_rostrum')) {
        shouldCountMove = true;
      }
      // Rule 9: Office → Community = COUNT (shouldn't happen but count if it does)
      else if (initialLocId?.includes('_office') && finalLocId?.includes('community')) {
        shouldCountMove = true;
      }

      if (!shouldCountMove) continue;

      // Determine move type
      let moveType = 'UNKNOWN';
      const isCommunity = (loc?: string) => loc?.includes('community');
      const isSeat = (loc?: string) => loc?.includes('_seat');
      const isRostrum = (loc?: string) => loc?.includes('_rostrum');
      const isOffice = (loc?: string) => loc?.includes('_office');
      const getPlayerFromLocation = (loc?: string): number | null => {
        const match = loc?.match(/p(\d+)_/);
        return match ? parseInt(match[1]) : null;
      };

      if (isCommunity(initialLocId) && isSeat(finalLocId)) {
        const ownerPlayer = getPlayerFromLocation(finalLocId);
        moveType = ownerPlayer === tilePlayerId ? 'ADVANCE' : 'ASSIST';
      } else if (isSeat(initialLocId) && isRostrum(finalLocId)) {
        moveType = 'ADVANCE';
      } else if (isRostrum(initialLocId) && isOffice(finalLocId)) {
        moveType = 'ADVANCE';
      } else if (isRostrum(initialLocId) && isSeat(finalLocId)) {
        moveType = 'WITHDRAW';
      } else if (isOffice(initialLocId) && isRostrum(finalLocId)) {
        moveType = 'WITHDRAW';
      } else if (isSeat(initialLocId) && isCommunity(finalLocId)) {
        // Determine if this is REMOVE or WITHDRAW based on piece ownership
        const fromPlayer = getPlayerFromLocation(initialLocId);
        if (fromPlayer === tilePlayerId) {
          moveType = 'WITHDRAW';
        } else {
          // Check if the piece is a Mark or Heel (REMOVE only for these pieces)
          const movingPiece = currentPieces.find(p => p.id === currentPiece.id);
          if (movingPiece) {
            const pieceName = movingPiece.name.toLowerCase();
            moveType = (pieceName === 'mark' || pieceName === 'heel') ? 'REMOVE' : 'UNKNOWN';
          } else {
            moveType = 'UNKNOWN';
          }
        }
      } else if (isSeat(initialLocId) && isSeat(finalLocId)) {
        const fromPlayer = getPlayerFromLocation(initialLocId);
        // Check if seats are adjacent using the helper function from game.ts
        if (initialLocId && finalLocId && areSeatsAdjacent(initialLocId, finalLocId, playerCount)) {
          if (fromPlayer === tilePlayerId) {
            moveType = 'ORGANIZE';
          } else {
            moveType = 'INFLUENCE';
          }
        } else {
          // Non-adjacent seats - not a valid move type
          moveType = 'UNKNOWN';
        }
      } else if (isRostrum(initialLocId) && isRostrum(finalLocId)) {
        const fromPlayer = getPlayerFromLocation(initialLocId);
        moveType = fromPlayer === tilePlayerId ? 'ORGANIZE' : 'INFLUENCE';
      }

      // Determine category
      let category: 'M' | 'O' = 'M';
      if (moveType === 'REMOVE' || moveType === 'INFLUENCE' || moveType === 'ASSIST') {
        category = 'O';
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

    const calculatedMoves = calculateMoves(playedTile.originalPieces, pieces, playedTile.playerId);

    // Validate the calculated moves
    const tileRequirements = validateTileRequirements(playedTile.tileId, calculatedMoves);

    const moveValidations = calculatedMoves.map((move, index) => {
      // Build piece state after all previous moves
      let piecesForValidation = playedTile.originalPieces.map(p => ({ ...p }));
      for (let i = 0; i < index; i++) {
        const prevMove = calculatedMoves[i];
        piecesForValidation = piecesForValidation.map(p =>
          p.id === prevMove.pieceId
            ? { ...p, locationId: prevMove.toLocationId, position: prevMove.toPosition }
            : p
        );
      }

      const validation = validateSingleMove(move, playedTile.playerId, piecesForValidation, playerCount);
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
    const performedMoveTypes = calculatedMoves.map(m => m.moveType);
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

    setPlayers(prev => prev.map(p => {
        if (p.id === tileTransaction.receiverId) {
            return { ...p, bureaucracyTiles: [...p.bureaucracyTiles, tileTransaction.tile] };
        }
        return p;
    }));
    setBoardTiles(prev => prev.filter(bt => bt.id !== tileTransaction.boardTileId));
    advanceTurnNormally(tileTransaction.placerId);
  };
  
  const handleReceiverDecision = (decision: 'accept' | 'reject') => {
      if (!tileTransaction) return;
      setIsPrivatelyViewing(false);

      if (decision === 'reject') {
          const placer = players.find(p => p.id === tileTransaction.placerId);
          if (placer) {
              setPlayers(prev => prev.map(p => p.id === placer.id ? { ...p, keptTiles: [...p.keptTiles, tileTransaction.tile] } : p));
          }
          setBoardTiles(prev => prev.filter(bt => bt.id !== tileTransaction.boardTileId));
          advanceTurnNormally(tileTransaction.placerId);
      } else { // 'accept'
          setGameState('PENDING_CHALLENGE');
          
          const bystanderPlayers = players.filter(p => p.id !== tileTransaction.placerId && p.id !== tileTransaction.receiverId);
          const placerIndex = players.findIndex(p => p.id === tileTransaction.placerId);

          const sortedBystanders = bystanderPlayers.sort((a, b) => {
              const indexA = players.findIndex(p => p.id === a.id);
              const indexB = players.findIndex(p => p.id === b.id);
              const relativeA = (indexA - placerIndex + playerCount) % playerCount;
              const relativeB = (indexB - placerIndex + playerCount) % playerCount;
              return relativeA - relativeB;
          });

          if (sortedBystanders.length > 0) {
              setBystanders(sortedBystanders);
              setBystanderIndex(0);
              const firstBystanderIndex = players.findIndex(p => p.id === sortedBystanders[0].id);
              setCurrentPlayerIndex(firstBystanderIndex);
          } else {
              resolveTransaction(false);
          }
      }
  };

  const handleBystanderDecision = (decision: 'challenge' | 'pass') => {
      if (decision === 'challenge') {
          if (tileTransaction) {
              setChallengedTile(tileTransaction.tile);
              setShowChallengeRevealModal(true);
          }
      } else { // 'pass'
          const nextBystanderIndex = bystanderIndex + 1;
          if (nextBystanderIndex >= bystanders.length) {
              resolveTransaction(false);
          } else {
              setBystanderIndex(nextBystanderIndex);
              const nextBystander = bystanders[nextBystanderIndex];
              const nextBystanderPlayerIndex = players.findIndex(p => p.id === nextBystander.id);
              setCurrentPlayerIndex(nextBystanderPlayerIndex);
          }
      }
  };

  const handleContinueAfterChallenge = () => {
      setShowChallengeRevealModal(false);
      resolveTransaction(true);
      setChallengedTile(null);
  }

  const renderGameState = () => {
    console.log('renderGameState called with gameState:', gameState, 'playerCount:', playerCount, 'players:', players.length, 'currentPlayerIndex:', currentPlayerIndex);
    switch (gameState) {
      case 'DRAFTING':
        return <DraftingScreen players={players} currentPlayerIndex={currentPlayerIndex} draftRound={draftRound} onSelectTile={handleSelectTile} />;
      case 'CAMPAIGN':
      case 'TILE_PLAYED':
      case 'PENDING_ACCEPTANCE':
      case 'PENDING_CHALLENGE':
      case 'CORRECTION_REQUIRED':
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || players.length === 0) {
          // Wait for state to be set up properly
          console.log('currentPlayer not found. currentPlayerIndex:', currentPlayerIndex, 'players.length:', players.length);
          return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-slate-300">Loading campaign... (currentPlayer issue)</div>;
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
          />
        );
      case 'PLAYER_SELECTION':
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 border-green-500 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="mb-4">
              <div className="text-6xl text-green-400 mb-2">✓</div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-green-400">
              Perfect Tile Play
            </h2>
            <p className="text-slate-300 mb-6 text-lg">
              The tile requirements have been fulfilled perfectly. You cannot reject this tile. Other players may now challenge the play.
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

      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8" style={{
            borderColor: alertModal.type === 'error' ? '#ef5350' : alertModal.type === 'warning' ? '#ffa726' : '#29b6f6'
          }}>
            <div className="mb-4">
              {alertModal.type === 'error' && (
                <div className="text-6xl font-bold text-red-400 mb-2">✕</div>
              )}
              {alertModal.type === 'warning' && (
                <div className="text-6xl text-yellow-400 mb-2">⚠️</div>
              )}
              {alertModal.type === 'info' && (
                <div className="text-6xl text-blue-400 mb-2">ℹ️</div>
              )}
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{
              color: alertModal.type === 'error' ? '#ef5350' : alertModal.type === 'warning' ? '#ffa726' : '#29b6f6'
            }}>
              {alertModal.title}
            </h2>
            <p className="text-slate-300 mb-6 text-lg">
              {alertModal.message}
            </p>
            <button
              onClick={closeAlert}
              className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
            >
              OK
            </button>
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

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Error Display Component
const ErrorDisplay: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
    <div className="bg-gray-800 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center">
      <div className="text-6xl text-red-400 mb-4">✕</div>
      <h1 className="text-3xl font-bold text-red-400 mb-4">Error Loading Game</h1>
      <p className="text-slate-300 mb-6">An unexpected error occurred. Please check the browser console for details.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

export default App;
