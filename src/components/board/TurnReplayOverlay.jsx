import React from 'react';
import { PIECE_TYPES } from '../../domain/types.js';
import { getPieceIconUrl, getAssetUrl } from '../../utils/assets.js';

export function TurnReplayOverlay({
  animatingPiece,
  animatingTile,
  perspectiveRotation = 0,
  replayNoticeText = ''
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
      {replayNoticeText && (
        <div
          className="replay-notice-banner"
          style={counterRotationStyle}
        >
          {replayNoticeText}
        </div>
      )}

      {/* Phase 1: 750ms Attention-getting pre-glow ring over static piece at start spot */}
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

      {/* Phase 2: Piece takes its walk across the board without any glow */}
      {isWalking && (
        <div
          className="replay-piece-container"
          style={{
            left: animatingPiece.left,
            top: animatingPiece.top,
            transition: animatingPiece.isMoving
              ? 'left 0.85s cubic-bezier(0.35, 1.15, 0.6, 1), top 0.85s cubic-bezier(0.35, 1.15, 0.6, 1)'
              : 'none'
          }}
        >
          <div className="piece-token-board replay-piece-walking" style={counterRotationStyle}>
            <img
              src={iconSrc}
              alt={animatingPiece.pieceType}
              className={`piece-img-board ${isPawn ? 'piece-pawn-img' : ''}`}
            />
          </div>
        </div>
      )}

      {/* Phase 3: Tile traveling outside the board from Mover to Receiver */}
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
    </>
  );
}
