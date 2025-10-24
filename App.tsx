
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
  PLAYER_PERSPECTIVE_ROTATIONS,
  formatLocationId,
  getLocationIdFromPosition,
  DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT,
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
  currentPlayerId: number;
  lastDroppedPosition: { top: number; left: number } | null;
  lastDroppedPieceId: string | null;
  isTestMode: boolean;
  freePlacementMode: boolean;
  setFreePlacementMode: (mode: boolean) => void;
  hasPlayedTileThisTurn: boolean;
  revealedTileId: string | null;
  tileTransaction: { placerId: number; receiverId: number; boardTileId: string; tile: Tile } | null;
  isPrivatelyViewing: boolean;
  bystanders: Player[];
  bystanderIndex: number;
  showChallengeRevealModal: boolean;
  challengedTile: Tile | null;
  placerViewingTileId: string | null;
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
}> = ({ gameState, playerCount, players, pieces, boardTiles, currentPlayerId, lastDroppedPosition, lastDroppedPieceId, isTestMode, freePlacementMode, setFreePlacementMode, hasPlayedTileThisTurn, revealedTileId, tileTransaction, isPrivatelyViewing, bystanders, bystanderIndex, showChallengeRevealModal, challengedTile, placerViewingTileId, gameLog, onNewGame, onPieceMove, onBoardTileMove, onEndTurn, onPlaceTile, onRevealTile, onReceiverDecision, onBystanderDecision, onTogglePrivateView, onContinueAfterChallenge, onPlacerViewTile }) => {

  const [isDraggingTile, setIsDraggingTile] = useState(false);
  const [boardMousePosition, setBoardMousePosition] = useState<{x: number, y: number} | null>(null);
  const [draggedPieceInfo, setDraggedPieceInfo] = useState<{ name: string; imageUrl: string } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ position: { top: number; left: number }; rotation: number; name: string; imageUrl: string } | null>(null);
  const boardRotation = PLAYER_PERSPECTIVE_ROTATIONS[playerCount]?.[currentPlayerId] ?? 0;
  
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

    // Free placement mode: show indicator at exact drop position with 0 rotation
    if (freePlacementMode) {
        const newRotation = calculatePieceRotation({ top, left }, playerCount, 'free_placement');
        if (!dropIndicator || dropIndicator.position.top !== top || dropIndicator.position.left !== left) {
            setDropIndicator({
                position: { top, left },
                rotation: newRotation,
                name: draggedPieceInfo.name,
                imageUrl: draggedPieceInfo.imageUrl
            });
        }
        return;
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

    if (boardTileId && isTestMode) {
        onBoardTileMove(boardTileId, { top, left });
        return;
    }

    // Free placement mode: allow pieces to be placed anywhere without snapping
    if (freePlacementMode && pieceId) {
        const freeLocationId = 'free_placement';
        onPieceMove(pieceId, { top, left }, freeLocationId);
        return;
    }

    const snappedLocation = findNearestVacantLocation({ top, left }, pieces, playerCount);

    if (snappedLocation && pieceId) {
        onPieceMove(pieceId, snappedLocation.position, snappedLocation.id);
    }
  };

  const handleDropOnTileSpace = (e: React.DragEvent<HTMLDivElement>, space: TileReceivingSpace) => {
    e.preventDefault();
    e.stopPropagation();
    const tileIdStr = e.dataTransfer.getData("tileId");
    if (tileIdStr && !hasPlayedTileThisTurn) {
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

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isMyTurnForDecision = 
    (gameState === 'PENDING_ACCEPTANCE' && currentPlayerId === tileTransaction?.receiverId) ||
    (gameState === 'PENDING_CHALLENGE' && bystanders[bystanderIndex]?.id === currentPlayerId);
  
  const showWaitingOverlay = 
    (gameState === 'PENDING_ACCEPTANCE' || gameState === 'PENDING_CHALLENGE') && !isMyTurnForDecision;

  let waitingMessage = "";
  if (showWaitingOverlay) {
    if (gameState === 'PENDING_ACCEPTANCE') {
        waitingMessage = `Waiting for Player ${tileTransaction?.receiverId} to respond...`;
    } else if (gameState === 'PENDING_CHALLENGE') {
        waitingMessage = `Waiting for Player ${bystanders[bystanderIndex]?.id} to respond...`;
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
          <div className="w-full max-w-5xl text-center mb-4">
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
              className="w-full h-full object-contain drop-shadow-2xl"
            />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`, backgroundSize: '2% 2%', pointerEvents: 'none' }} aria-hidden="true" />
            <div className="absolute inset-0 text-white/20 text-[8px] sm:text-xs pointer-events-none" aria-hidden="true">
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

              // Receiver's private view logic (during PENDING_ACCEPTANCE)
              const showReceiverPrivateView = isPrivatelyViewing && isTransactionalTile && isReceiver;

              // Placer's private view logic (during CAMPAIGN, before ending turn)
              const canPlacerClickToView = isPlacer && isTransactionalTile && gameState === 'CAMPAIGN';
              const showPlacerPrivateView = placerViewingTileId === boardTile.id;

              const isRevealed = isPubliclyRevealed || showReceiverPrivateView || showPlacerPrivateView;

              return (
                <div
                  key={boardTile.id}
                  draggable={isTestMode && !isTransactionalTile}
                  onDragStart={(isTestMode && !isTransactionalTile) ? (e) => handleDragStartBoardTile(e, boardTile.id) : undefined}
                  onClick={canPlacerClickToView ? () => onPlacerViewTile(boardTile.id) : undefined}
                  className={`absolute w-12 h-24 rounded-lg shadow-xl transition-all duration-200 ${!isRevealed ? '' : 'bg-stone-100 p-1'}` }
                  style={{ 
                    top: `${boardTile.position.top}%`, 
                    left: `${boardTile.position.left}%`, 
                    transform: `translate(-50%, -50%) rotate(${boardTile.rotation || 0}deg)`, 
                    cursor: canPlacerClickToView ? 'pointer' : 'default'
                  }}
                  aria-label={canPlacerClickToView ? "Click to view the tile you just played" : "A placed, face-down tile"}
                >
                  {!isRevealed ? (
                     <div className="w-full h-full bg-gray-700 rounded-lg border-2 border-white shadow-inner"></div>
                  ) : (
                    <img src={boardTile.tile.url} alt={`Tile ${boardTile.tile.id}`} className="w-full h-full object-contain" />
                  )}
                </div>
              );
            })}

            {pieces.map((piece) => {
              let pieceSizeClass = 'w-10 h-10 sm:w-14 sm:h-14'; // Mark
              if (piece.name === 'Heel') pieceSizeClass = 'w-14 h-14 sm:w-16 sm:h-16';
              if (piece.name === 'Pawn') pieceSizeClass = 'w-16 h-16 sm:w-20 sm:h-20';

              // Apply 15% size reduction for 3-player mode
              const scaleMultiplier = playerCount === 3 ? 0.85 : 1;
              const baseScale = 0.798;
              const finalScale = baseScale * scaleMultiplier;

              return (
                <img key={piece.id} src={piece.imageUrl} alt={piece.name} draggable="true" onDragStart={(e) => handleDragStartPiece(e, piece.id)} onDragEnd={handleDragEndPiece} className={`${pieceSizeClass} object-contain drop-shadow-lg transition-all duration-100 ease-in-out`} style={{ position: 'absolute', top: `${piece.position.top}%`, left: `${piece.position.left}%`, transform: `translate(-50%, -50%) rotate(${piece.rotation}deg) scale(${finalScale})`, cursor: 'grab' }} aria-hidden="true" />
              );
            })}
          </div>

          <div className="w-full max-w-5xl mt-8">
            <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Player {currentPlayerId}'s Hand</h2>
            <p className="text-center text-slate-400 mb-4">
              {hasPlayedTileThisTurn ? "You have played a tile this turn." : "Drag a tile to another player's receiving area on the board."}
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
                {/* Free Placement Toggle */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freePlacementMode}
                      onChange={(e) => setFreePlacementMode(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500"
                    />
                    <span className="text-slate-200 font-semibold">Free Placement Mode</span>
                    <span className="text-xs text-slate-400 ml-auto">{freePlacementMode ? '(ON)' : '(OFF)'}</span>
                  </label>
                  <p className="text-xs text-slate-400 mt-2">When ON, pieces can be placed anywhere on the board. When OFF, pieces snap to valid locations.</p>
                </div>
              </div>
            )}

            {/* Piece Tracker (Test Mode Only) */}
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
        <button onClick={onEndTurn} disabled={gameState !== 'CAMPAIGN'} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed">
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">Your Decision</h2>
            <p className="text-slate-300 mb-6">{`Player ${tileTransaction?.placerId} has played a tile for you. What will you do?`}</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={onTogglePrivateView} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors shadow-md w-full sm:w-auto">
                Privately View
              </button>
              <button onClick={() => onReceiverDecision('reject')} className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md w-full sm:w-auto">
                Reject Tile
              </button>
              <button onClick={() => onReceiverDecision('accept')} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md w-full sm:w-auto">
                Accept Tile
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Receiver Private View Action Bar */}
      {isMyTurnForDecision && gameState === 'PENDING_ACCEPTANCE' && isPrivatelyViewing && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t-2 border-purple-500 p-4 z-50 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 shadow-lg">
              <p className="text-purple-300 font-semibold text-lg whitespace-nowrap">You are privately viewing the tile.</p>
              <div className="flex items-center flex-wrap justify-center gap-4">
                  <button onClick={onTogglePrivateView} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors shadow-md">
                      Hide Tile
                  </button>
                  <button onClick={() => onReceiverDecision('reject')} className="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md">
                      Reject Tile
                  </button>
                  <button onClick={() => onReceiverDecision('accept')} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md">
                      Accept Tile
                  </button>
              </div>
          </div>
      )}

      {/* Bystander Challenge Modal */}
      {isMyTurnForDecision && gameState === 'PENDING_CHALLENGE' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4" aria-modal="true" role="dialog">
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 sm:p-8 rounded-xl text-center shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-cyan-300 mb-2">Challenge or Pass?</h2>
            <p className="text-slate-300 mb-6">{`Player ${tileTransaction?.receiverId} accepted the tile from Player ${tileTransaction?.placerId}.`}</p>
            <div className="flex justify-center items-center gap-4">
              <button onClick={() => onBystanderDecision('challenge')} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors shadow-md">
                Challenge
              </button>
              <button onClick={() => onBystanderDecision('pass')} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md">
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
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [draftRound, setDraftRound] = useState(1);
  const [isTestMode, setIsTestMode] = useState(false);
  const [freePlacementMode, setFreePlacementMode] = useState(false);
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

  // State for Game Log
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [piecesAtTurnStart, setPiecesAtTurnStart] = useState<Piece[]>([]);
  
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
    setLastDroppedPosition(newPosition);
    setLastDroppedPieceId(pieceId);
    const newRotation = calculatePieceRotation(newPosition, playerCount, locationId);
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
            setHasPlayedTileThisTurn(false); // Reset for the acceptance phase, not a new turn action.
            setRevealedTileId(null);
            setIsPrivatelyViewing(false);
            setPlacerViewingTileId(null);
        } else {
            advanceTurnNormally(); // Fallback if receiver not found.
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
        alert("You cannot play a tile for yourself until all other players have run out of tiles.");
        return;
      }
    }

    const newBoardTile: BoardTile = { id: `boardtile_${Date.now()}`, tile: tileToPlace, position: targetSpace.position, rotation: targetSpace.rotation, placerId: currentPlayer.id, ownerId: targetSpace.ownerId };
    
    setTileTransaction({ placerId: currentPlayer.id, receiverId: targetSpace.ownerId, boardTileId: newBoardTile.id, tile: tileToPlace });
    setBoardTiles(prev => [...prev, newBoardTile]);
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, keptTiles: p.keptTiles.filter(t => t.id !== tileId) } : p ));
    setHasPlayedTileThisTurn(true);
  };
  
  const handleRevealTile = (tileId: string | null) => { setRevealedTileId(tileId); };

  const handleTogglePrivateView = () => setIsPrivatelyViewing(prev => !prev);
  
  const handlePlacerViewTile = (tileId: string) => {
    setPlacerViewingTileId(prevId => (prevId === tileId ? null : tileId));
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
      case 'PENDING_ACCEPTANCE':
      case 'PENDING_CHALLENGE':
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
            currentPlayerId={currentPlayer.id}
            lastDroppedPosition={lastDroppedPosition}
            lastDroppedPieceId={lastDroppedPieceId}
            isTestMode={isTestMode}
            hasPlayedTileThisTurn={hasPlayedTileThisTurn}
            revealedTileId={revealedTileId}
            tileTransaction={tileTransaction}
            isPrivatelyViewing={isPrivatelyViewing}
            bystanders={bystanders}
            bystanderIndex={bystanderIndex}
            showChallengeRevealModal={showChallengeRevealModal}
            challengedTile={challengedTile}
            placerViewingTileId={placerViewingTileId}
            gameLog={gameLog}
            freePlacementMode={freePlacementMode}
            setFreePlacementMode={setFreePlacementMode}
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
          />
        );
      case 'PLAYER_SELECTION':
      default:
        return <PlayerSelectionScreen onStartGame={handleStartGame} />;
    }
  };

  return <div className="App">{renderGameState()}</div>;
};

export default App;
