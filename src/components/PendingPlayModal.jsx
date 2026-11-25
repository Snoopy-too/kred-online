import React, { useState, useEffect } from 'react';
import { getActiveChallenger, getPendingPlayActivePlayer } from '../domain/board.js';
import { TILES } from '../domain/types.js';
import { getTileImageUrl } from '../utils/assets.js';
import { OutcomeNoticeCard, isSupportedOutcomeNotice } from './board/OutcomeNoticeCard.jsx';
import {
  executeOnlineAcceptTile,
  executeOnlineRejectTile,
  executeOnlineChallengeTile,
  executeOnlinePassChallenge,
  executeOnlineChallengerCredibility,
  executeOnlineReceiverCredibilityReward,
  executeOnlineReceiverAdvanceReward
} from '../domain/onlineEngine.js';

export function PendingPlayModal({
  G, playerID, moves, peekPendingTile = false, onTogglePeekTile,
  isOnline = false, updateMasterGameState = null,
  onReplayPieceMoves = null, isReplaying = false,
  getPlayerLabel = null
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

  const replayBtn = hasPieceMoves && onReplayPieceMoves && (
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
              <button
                className="btn btn-primary"
                onClick={() => handleAction(() => isOnline ? executeOnlineAcceptTile(G, playerID, updateMasterGameState) : moves?.acceptTile())}
              >
                Accept
              </button>
              {pp.playType !== 'Honest' && !isZeroCredibility && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleAction(() => isOnline ? executeOnlineRejectTile(G, playerID, updateMasterGameState) : moves?.rejectTile())}
                >
                  Expose
                </button>
              )}
            </div>
          </>
        ) : pp.step === 'challenge' && isChallenger ? (
          <>
            <div className="turn-card-header">
              <h3>Challenge?</h3>
            </div>
            <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {replayBtn}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-warning"
                  style={{ flex: 1 }}
                  onClick={() => handleAction(() => isOnline ? executeOnlineChallengeTile(G, playerID, updateMasterGameState) : moves?.challengeTile())}
                >
                  Challenge
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleAction(() => isOnline ? executeOnlinePassChallenge(G, playerID, updateMasterGameState) : moves?.passChallenge())}
                >
                  Pass
                </button>
              </div>
            </div>
          </>
        ) : pp.step === 'receiverReward' && isReceiver ? (
          <>
            <div className="turn-card-header">
              <h3>Choose Reward</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button
                className="btn btn-success"
                disabled={isFullCredibility}
                onClick={() => handleAction(() => isOnline ? executeOnlineReceiverCredibilityReward(G, playerID, updateMasterGameState) : moves?.claimReceiverCredibilityReward())}
                style={{ opacity: isFullCredibility ? 0.5 : 1, cursor: isFullCredibility ? 'not-allowed' : 'pointer' }}
              >
                Restore Credibility {isFullCredibility ? '(Max)' : '(+2)'}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleAction(() => isOnline ? executeOnlineReceiverAdvanceReward(G, playerID, updateMasterGameState) : moves?.chooseReceiverAdvanceReward())}
              >
                Take Free Advance
              </button>
            </div>
          </>
        ) : pp.step === 'challengerReward' && isRewardChallenger ? (
          <>
            <div className="turn-card-header">
              <h3>Choose Reward</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button
                className={isFullCredibility ? 'btn btn-secondary' : 'btn btn-success'}
                onClick={() => handleAction(() => isOnline ? executeOnlineChallengerCredibility(G, playerID, updateMasterGameState) : moves?.claimChallengerCredibility())}
              >
                {isFullCredibility ? 'Continue (Skip Reward)' : 'Restore Credibility (+1)'}
              </button>
              {(() => {
                const facedownTiles = (myPlayer.bank || []).filter((item) => item.faceDown);
                if (facedownTiles.length === 0) return null;
                const facedownFunding = facedownTiles.reduce((sum, item) => sum + (TILES[item.tileId]?.funding || 0), 0);
                return (
                  <div className="reexecute-tile-banner challenger-reward-banner" style={{ margin: '2px 0 0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      {facedownTiles.map((item, idx) => {
                        const tileFunding = TILES[item.tileId]?.funding || 0;
                        return (
                          <img
                            key={`${item.tileId}-${idx}`}
                            src={getTileImageUrl(item.tileId)}
                            alt={item.tileId === '___' ? '' : `Tile ${item.tileId}`}
                            title={`Tile ${item.tileId} (K${tileFunding})`}
                            style={{ width: '53px', height: 'auto', aspectRatio: '2.5 / 5', objectFit: 'contain', flexShrink: 0 }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px', flex: 1 }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        Or spend your face-down bank tile{facedownTiles.length === 1 ? '' : 's'} on 1 Bureaucracy action below.
                      </span>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '14px' }}>
                        Available Funding: K{facedownFunding}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        ) : isSupportedOutcomeNotice(G?.lastOutcomeNotice) ? (
          <OutcomeNoticeCard
            notice={G.lastOutcomeNotice}
            getPlayerLabel={getPlayerLabel}
            waitingLabel={(() => {
              const activeId = getPendingPlayActivePlayer(G);
              const name = activeId !== null && getPlayerLabel ? getPlayerLabel(activeId) : null;
              return name ? `Waiting for ${name}...` : 'Waiting...';
            })()}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <div>
              {(() => {
                const activeId = getPendingPlayActivePlayer(G);
                const name = activeId !== null && getPlayerLabel ? getPlayerLabel(activeId) : null;
                return name ? `Waiting for ${name}...` : 'Waiting...';
              })()}
            </div>
            {(pp.step === 'receipt' || pp.step === 'challenge') && replayBtn}
          </div>
        )}
      </div>
    </div>
  );
}
