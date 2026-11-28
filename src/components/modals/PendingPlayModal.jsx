import React, { useState, useEffect } from 'react';
import { getActiveChallenger, getPendingPlayActivePlayer } from '../../domain/board.js';
import { TILES } from '../../domain/types.js';
import { getTileImageUrl } from '../../utils/assets.js';
import { OutcomeNoticeCard, isSupportedOutcomeNotice } from '../sidebar/OutcomeNoticeCard.jsx';

export function PendingPlayModal({
  G, playerID, moves, peekPendingTile = false, onTogglePeekTile,
  onReplayPieceMoves = null, isReplaying = false,
  getPlayerLabel = null, expertMode = false
}) {
  const myPlayer = (G && G.players && G.players[playerID]) || {};
  const isZeroCredibility = (myPlayer.credibilityNotchesLost || 0) >= 3;
  const isFullCredibility = (myPlayer.credibilityNotchesLost || 0) === 0;

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(false);
  }, [G]);

  const handleAction = (actionFn) => {
    setIsProcessing(true);
    actionFn();
  };

  if (!G || !G.pendingPlay) return null;

  const pp = G.pendingPlay;
  const isReceiver = String(playerID) === String(pp.receiverId);
  const activeChallenger = getActiveChallenger(G);
  const isChallenger = String(playerID) === String(activeChallenger);
  const isRewardChallenger = String(playerID) === String(pp.successfulChallengerId);
  const hasPieceMoves = Boolean(pp.movesMade && pp.movesMade.length > 0);

  const replayBtn = !expertMode && hasPieceMoves && onReplayPieceMoves && (
    <button
      className="btn btn-secondary"
      onClick={onReplayPieceMoves}
      disabled={isReplaying}
      style={{ border: '1px solid rgba(200, 155, 60, 0.45)', color: 'var(--accent-gold)' }}
    >
      {isReplaying ? 'Replaying...' : 'Replay Moves'}
    </button>
  );

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {isProcessing && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0, 0, 0, 0.55)', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', color: '#fff', fontWeight: 'bold'
        }}>
          Updating...
        </div>
      )}

      <div style={{ opacity: isProcessing ? 0.4 : 1, pointerEvents: isProcessing ? 'none' : 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {pp.step === 'receipt' && isReceiver ? (
          <>
            <div className="turn-card-header">
              <h3>Receive Tile</h3>
            </div>
            <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {(!isZeroCredibility || replayBtn) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '8px' }}>
                  {!isZeroCredibility && (
                    <button
                      className="btn btn-secondary"
                      onClick={onTogglePeekTile}
                      style={{ border: '1px solid rgba(200, 155, 60, 0.45)', color: 'var(--accent-gold)' }}
                    >
                      {peekPendingTile ? 'Hide Tile' : 'Peek Tile'}
                    </button>
                  )}
                  {replayBtn}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '8px' }}>
                {pp.playType !== 'Honest' && !isZeroCredibility && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleAction(() => moves?.rejectTile())}
                  >
                    Expose
                  </button>
                )}
                <button
                  className="btn btn-success"
                  onClick={() => handleAction(() => moves?.acceptTile())}
                >
                  Accept
                </button>
              </div>
            </div>
          </>
        ) : pp.step === 'challenge' && isChallenger ? (
          <>
            <div className="turn-card-header">
              <h3>Challenge?</h3>
            </div>
            <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {replayBtn}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => handleAction(() => moves?.challengeTile())}
                >
                  Challenge
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleAction(() => moves?.passChallenge())}
                >
                  Pass
                </button>
              </div>
            </div>
          </>
        ) : pp.step === 'challengerReward' && isRewardChallenger ? (
          (() => {
            const facedownTiles = (myPlayer.bank || []).filter((item) => item.faceDown);
            const tileWord = facedownTiles.length === 1 ? 'tile' : 'tiles';
            return (
              <div className="reexecute-tile-banner challenger-reward-banner" style={{ flex: 1, margin: 0, padding: '10px', flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Choose Reward
                  </span>
                  {isFullCredibility && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => handleAction(() => moves?.claimChallengerCredibility())}
                    >
                      Skip Reward
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {isFullCredibility
                    ? `Spend your face-down bank ${tileWord} on 1 Bureaucracy action below.`
                    : `Click your credibility token to restore +1 credibility, or spend your face-down bank ${tileWord} on 1 Bureaucracy action below.`}
                </span>
                {facedownTiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', alignItems: 'center', overflow: 'hidden' }}>
                    {facedownTiles.map((item, idx) => {
                      const tileFunding = TILES[item.tileId]?.funding || 0;
                      return (
                        <img
                          key={`${item.tileId}-${idx}`}
                          src={getTileImageUrl(item.tileId)}
                          alt={item.tileId === '___' ? '' : `Tile ${item.tileId}`}
                          title={`Tile ${item.tileId} (K${tileFunding})`}
                          style={{ width: '32px', height: 'auto', aspectRatio: '2.5 / 5', objectFit: 'contain', flexShrink: 0 }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()
        ) : isSupportedOutcomeNotice(G?.lastOutcomeNotice) ? (
          <OutcomeNoticeCard
            notice={G.lastOutcomeNotice}
            playerID={playerID}
            getPlayerLabel={getPlayerLabel}
            waitingLabel={(() => {
              const activeId = getPendingPlayActivePlayer(G);
              const name = activeId !== null && getPlayerLabel ? getPlayerLabel(activeId) : null;
              return name ? `Waiting for ${name}...` : 'Waiting...';
            })()}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '17px', fontWeight: 600, textAlign: 'center' }}>
            {(() => {
              const activeId = getPendingPlayActivePlayer(G);
              const name = activeId !== null && getPlayerLabel ? getPlayerLabel(activeId) : null;
              return name ? `Waiting for ${name}...` : 'Waiting...';
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
