import React from 'react';
import { PIECE_TYPES } from '../../domain/types.js';

export function TurnReplayOverlay({
  animatingPiece,
  perspectiveRotation = 0,
  replayNoticeText = ''
}) {
  const counterRotationStyle = perspectiveRotation
    ? { transform: `rotate(${-perspectiveRotation}deg)` }
    : {};

  let iconSrc = '/images/mark-transparent_bg.png';
  let isPawn = false;
  if (animatingPiece) {
    if (animatingPiece.pieceType === PIECE_TYPES.HEEL) {
      iconSrc = '/images/heel-transparent_bg.png';
    } else if (animatingPiece.pieceType === PIECE_TYPES.PAWN) {
      iconSrc = '/images/pawn-transparent_bg.png';
      isPawn = true;
    }
  }

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

      {animatingPiece && (
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
    </>
  );
}
