import React, { useState, useEffect } from 'react';
import { getActiveChallenger } from '../domain/board.js';
import {
  executeOnlineAcceptTile,
  executeOnlineRejectTile,
  executeOnlineChallengeTile,
  executeOnlinePassChallenge
} from '../domain/onlineEngine.js';

export function PendingPlayModal({
  G, playerID, moves, getPlayerLabel, peekPendingTile = false, onTogglePeekTile,
  isOnline = false, updateMasterGameState = null
}) {
  const myPlayer = (G && G.players && G.players[playerID]) || {};
  const isZeroCredibility = (myPlayer.credibilityNotchesLost || 0) >= 3;

  const [visibleNotice, setVisibleNotice] = useState(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (G?.lastOutcomeNotice) {
      setVisibleNotice(G.lastOutcomeNotice);
      setIsFading(false);
      const fadeTimer = setTimeout(() => setIsFading(true), 4500);
      const removeTimer = setTimeout(() => setVisibleNotice(null), 5000);
      return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
    } else {
      setVisibleNotice(null);
      setIsFading(false);
    }
  }, [G?.lastOutcomeNotice]);

  if (!G || (!G.pendingPlay && !visibleNotice)) return null;

  const isReceiver = G.pendingPlay && String(playerID) === String(G.pendingPlay.receiverId);
  const activeChallenger = G.pendingPlay ? getActiveChallenger(G) : null;
  const isChallenger = G.pendingPlay && String(playerID) === String(activeChallenger);

  return (
    <div className="pending-play-modal">
      {/* Challenge / Resolution Outcome Modal Notice */}
      {visibleNotice && (
        <div className="outcome-notice-banner" style={{ marginBottom: G.pendingPlay ? '16px' : '0', padding: '12px', borderRadius: '8px', background: visibleNotice.type === 'challengeSuccess' || visibleNotice.type === 'reject' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', border: visibleNotice.type === 'challengeSuccess' || visibleNotice.type === 'reject' ? '1px solid #ef4444' : '1px solid #22c55e', transition: 'opacity 0.5s ease', opacity: isFading ? 0 : 1 }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: visibleNotice.type === 'challengeSuccess' || visibleNotice.type === 'reject' ? '#f87171' : '#4ade80' }}>
            {visibleNotice.title}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc' }}>
            {visibleNotice.text}
          </p>
        </div>
      )}

      {G.pendingPlay && (
        <>
          <h3>
            <span className="modal-icon">⚖️</span> Pending Play Action
          </h3>
          <p>
            Mover <strong>{getPlayerLabel(G.pendingPlay.moverId)}</strong> played face-down to <strong>{getPlayerLabel(G.pendingPlay.receiverId)}</strong>
          </p>

          {/* Receiver Step */}
          {G.pendingPlay.step === 'receipt' && (
            isReceiver ? (
              <div className="receipt-actions">
                {isZeroCredibility && (
                  <div className="zero-credibility-notice" style={{ background: 'rgba(245, 158, 11, 0.18)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                    <p style={{ color: '#fbbf24', fontWeight: 800, margin: '0 0 4px 0', fontSize: '13px' }}>
                      ⚠️ Zero Credibility Rule Notice
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#f8fafc', lineHeight: 1.4 }}>
                      You have 0 credibility remaining (all 3 notches lost). According to KRED rules, players with 0 credibility cannot inspect face-down tiles passed to them, nor challenge plays. This tile is accepted directly.
                    </p>
                  </div>
                )}
                {G.pendingPlay.playType === 'Honest' || isZeroCredibility ? (
                  <>
                    {!isZeroCredibility && <p>You received a tile face-down at your <strong>Drop Tile</strong> spot! This tile was played <strong>honestly</strong>.</p>}
                    <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {!isZeroCredibility && (
                        <button
                          className="btn btn-secondary"
                          onClick={onTogglePeekTile}
                          style={{ background: '#26201b', color: '#38bdf8', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          👁️ {peekPendingTile ? 'Hide Tile (Flip Face-Down)' : 'Peek / Flip Tile Privately'}
                        </button>
                      )}
                      <button
                        className="btn btn-success"
                        onClick={() => isOnline ? executeOnlineAcceptTile(G, playerID, updateMasterGameState) : moves?.acceptTile()}
                      >
                        Accept (Place Face-Down in Bank)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>You received a tile face-down at your <strong>Drop Tile</strong> spot! Do you accept or expose?</p>
                    <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={onTogglePeekTile}
                        style={{ background: '#26201b', color: '#38bdf8', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        👁️ {peekPendingTile ? 'Hide Tile (Flip Face-Down)' : 'Peek / Flip Tile Privately'}
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => isOnline ? executeOnlineAcceptTile(G, playerID, updateMasterGameState) : moves?.acceptTile()}
                      >
                        Accept (Place Face-Down in Bank)
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => isOnline ? executeOnlineRejectTile(G, playerID, updateMasterGameState) : moves?.rejectTile()}
                      >
                        Expose / Whistle Blower (Place Face-Up in Bank)
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="receipt-actions">
                <p className="text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                  {G.pendingPlay.playType === 'Honest'
                    ? <>Waiting for <strong>{getPlayerLabel(G.pendingPlay.receiverId)}</strong> to Accept the face-down tile...</>
                    : <>Waiting for <strong>{getPlayerLabel(G.pendingPlay.receiverId)}</strong> to Accept or Expose the face-down tile...</>
                  }
                </p>
              </div>
            )
          )}

          {/* Bystander Challenge Step */}
          {G.pendingPlay.step === 'challenge' && (
            isChallenger ? (
              <div className="challenge-actions">
                <p>Tile accepted face-down. As a bystander, do you want to challenge the play?</p>
                <div className="btn-group" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-warning"
                    onClick={() => isOnline ? executeOnlineChallengeTile(G, playerID, updateMasterGameState) : moves?.challengeTile()}
                  >
                    Challenge Play
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => isOnline ? executeOnlinePassChallenge(G, playerID, updateMasterGameState) : moves?.passChallenge()}
                  >
                    Pass Challenge
                  </button>
                </div>
              </div>
            ) : (
              <div className="challenge-actions">
                <p className="text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                  Waiting for <strong>{activeChallenger !== null ? getPlayerLabel(activeChallenger) : 'challenger'}</strong> to Challenge or Pass...
                </p>
              </div>
            )
          )}

          {/* Re-execute Step for non-movers */}
          {G.pendingPlay.step === 'reexecute' && (
            <div className="reexecute-actions">
              <p className="text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                <strong>{getPlayerLabel(G.pendingPlay.moverId)}</strong>'s dishonest play was exposed! Waiting for them to re-execute honest moves...
              </p>
            </div>
          )}

          {/* Penalty Withdraw Step for non-movers */}
          {G.pendingPlay.step === 'penaltyWithdraw' && (
            <div className="penalty-actions">
              <p className="text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                Waiting for <strong>{getPlayerLabel(G.pendingPlay.moverId)}</strong> to execute penalty Withdraw...
              </p>
            </div>
          )}

          {/* Free Advance Step for non-receivers */}
          {G.pendingPlay.step === 'freeAdvance' && (
            <div className="free-advance-actions">
              <p className="text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                Waiting for <strong>{getPlayerLabel(G.pendingPlay.receiverId)}</strong> to execute free Advance...
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
