import React from 'react';
import { PIECE_TYPES } from '../../domain/types.js';
import { getPieceIconUrl, getAssetUrl } from '../../utils/assets.js';

export function TurnReplayOverlay({
  animatingPiece,
  animatingTile,
  draggedPiece = null,
  perspectiveRotation = 0
}) {
  const counterRotationStyle = perspectiveRotation
    ? { transform: `rotate(${-perspectiveRotation}deg)` }
    : {};

  const isPawn = animatingPiece?.pieceType === PIECE_TYPES.PAWN;
  const iconSrc = animatingPiece ? getPieceIconUrl(animatingPiece.pieceType, isPawn) : getPieceIconUrl('Mark');

  const isPreGlow = animatingPiece?.phase === 'PRE_GLOW';
  const isWalking = animatingPiece?.phase === 'WALKING';

  return (
    <>
      {isPreGlow && (
        <div
          className="replay-piece-container"
          style={{
            left: animatingPiece.left,
            top: animatingPiece.top,
            transition: 'none'
          }}
        >
          <div className="replay-preglow-ring" style={counterRotationStyle} />
        </div>
      )}

      {isWalking && (
        <div
          className="replay-piece-container"
          style={{
            left: animatingPiece.left,
            top: animatingPiece.top,
            transition: animatingPiece.isMoving
              ? 'left 0.55s cubic-bezier(0.22, 1, 0.36, 1), top 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none'
          }}
        >
          <div className="piece-token-board replay-piece-walking" style={counterRotationStyle}>
            <img
              src={iconSrc}
              alt={animatingPiece.pieceType}
              className={`piece-img-board replay-piece-img-lifted ${isPawn ? 'piece-pawn-img' : ''}`}
            />
          </div>
        </div>
      )}

      {animatingTile && animatingTile.visible && (
        <div
          className="replay-tile-container replay-tile-traveling"
          style={{
            left: animatingTile.left,
            top: animatingTile.top,
            transform: `translate(-50%, -50%) rotate(${animatingTile.rotation}deg)`
          }}
        >
          <img
            src={getAssetUrl('images/tile_back.svg')}
            alt="Tile Traveling Face-Down"
            className="domino-tile-svg"
          />
        </div>
      )}
      {draggedPiece && (
        <div
          className="drag-ghost-piece"
          style={{ left: draggedPiece.left, top: draggedPiece.top }}
        >
          <div className="piece-token-board" style={counterRotationStyle}>
            <img
              src={getPieceIconUrl(draggedPiece.piece.type, draggedPiece.piece.type === PIECE_TYPES.PAWN)}
              alt={draggedPiece.piece.type}
              draggable={false}
              className={`piece-img-board replay-piece-img-lifted ${draggedPiece.piece.type === PIECE_TYPES.PAWN ? 'piece-pawn-img' : ''}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
