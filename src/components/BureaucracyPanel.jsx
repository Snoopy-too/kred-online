import React from 'react';
import { BUREAUCRACY_PRICES, TILES } from '../domain/types.js';
import {
  executeOnlineBureaucracyAction,
  executeOnlineEndBureaucracyTurn
} from '../domain/onlineEngine.js';

function KPrice({ amount, highlighted = false }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '2px',
      fontWeight: 700,
      color: highlighted ? '#facc15' : 'var(--accent-gold)'
    }}>
      <span className="k-strike" style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>K</span>
      <span>{amount}</span>
    </span>
  );
}

export function BureaucracyPanel({
  myPlayer,
  isMyTurn,
  moves,
  numPlayers,
  selectedPromotion = null,
  highlightedMoveTiers = new Set(),
  handlePromoteSelected = null,
  G,
  playerID,
  isOnline = false,
  updateMasterGameState = null
}) {
  const pId = String(playerID);
  const isChallengerReward = G?.pendingPlay?.step === 'challengerReward' && String(G?.pendingPlay?.successfulChallengerId) === pId;
  const prices = BUREAUCRACY_PRICES[numPlayers] || BUREAUCRACY_PRICES[3];

  const facedownFunding = (myPlayer.bank || []).reduce((sum, item) => item.faceDown ? sum + (TILES[item.tileId]?.funding || 0) : sum, 0);
  const funding = isChallengerReward ? facedownFunding : (myPlayer.funding || 0);
  const credibilityNotchesLost = myPlayer.credibilityNotchesLost || 0;
  const currentCred = Math.max(0, 3 - credibilityNotchesLost);

  const rowStyle = (highlighted = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '5px 8px',
    margin: '0 -8px',
    borderRadius: '6px',
    fontSize: '13px',
    color: highlighted ? '#ffffff' : 'var(--text-main)',
    background: highlighted ? 'rgba(200, 155, 60, 0.22)' : 'transparent',
    transition: 'background 0.15s ease',
    lineHeight: 1.35
  });

  const sectionHeadingStyle = {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--accent-gold)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    margin: '12px 0 4px'
  };

  const actionBtnStyle = {
    fontSize: '12px',
    padding: '4px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  return (
    <div className="turn-builder-card">
      <div className="turn-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>{isChallengerReward ? 'Challenge Reward' : 'Bureaucracy'}</h3>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '5px', fontSize: '15px', fontWeight: 700, color: 'var(--accent-gold)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Funding</span>
          <span className="k-strike" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>K</span>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>{funding}</span>
        </span>
      </div>

      {(() => {
        const canAct = Boolean(isMyTurn || isChallengerReward);
        return (
        <div>
          <p style={{ margin: '2px 0 8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            {!canAct
              ? 'Waiting for your Bureaucracy turn...'
              : isChallengerReward
              ? 'Select a piece on the board to spend your face-down tile funding on 1 action.'
              : 'Click or drag any piece on the board to promote or move it.'}
          </p>

          {!isChallengerReward && (
            <>
              <div style={{ ...sectionHeadingStyle, marginTop: '4px' }}>Restore Credibility</div>
              <div style={rowStyle(false)}>
                <span>
                  <KPrice amount={prices.RESTORE_CRED} /> to restore 1 notch{' '}
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({currentCred}/3)</span>
                </span>
                <button
                  className="btn btn-primary"
                  style={actionBtnStyle}
                  disabled={!canAct || funding < prices.RESTORE_CRED || credibilityNotchesLost === 0}
                  onClick={() => {
                    if (isOnline) executeOnlineBureaucracyAction(G, playerID, { actionType: 'RESTORE_CRED', shopCost: prices.RESTORE_CRED }, updateMasterGameState);
                    else moves?.buyBureaucracyAction({ actionType: 'RESTORE_CRED' });
                  }}
                >
                  Restore
                </button>
              </div>
            </>
          )}

          <div style={sectionHeadingStyle}>
            Select a Piece to Promote{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)', fontSize: '11px' }}>
              (Mark → Heel, Heel → Pawn)
            </span>
          </div>
          {[
            { key: 'PROMOTE_SEAT', label: 'Seat', price: prices.PROMOTE_SEAT },
            { key: 'PROMOTE_ROSTRUM', label: 'Rostrum', price: prices.PROMOTE_ROSTRUM },
            { key: 'PROMOTE_OFFICE', label: 'Office', price: prices.PROMOTE_OFFICE }
          ].map((item) => {
            const isHighlighted = canAct && selectedPromotion?.actionType === item.key;
            return (
              <div key={item.key} style={rowStyle(isHighlighted)}>
                <span><KPrice amount={item.price} highlighted={isHighlighted} /> — {item.label}</span>
                {isHighlighted && (
                  <button
                    className="btn btn-primary"
                    style={actionBtnStyle}
                    disabled={!selectedPromotion.canPromote}
                    onClick={handlePromoteSelected}
                    title={
                      !selectedPromotion.canAfford
                        ? 'Insufficient funding'
                        : !selectedPromotion.canUpgradeType
                        ? 'Piece cannot be promoted further or none left in Community'
                        : `Promote this ${item.label} piece`
                    }
                  >
                    Promote
                  </button>
                )}
              </div>
            );
          })}

          <div style={sectionHeadingStyle}>Select a Piece to Move</div>
          {[
            { key: 'BASIC_ACTION', label: 'to Advance, Withdraw or Organize', price: prices.BASIC_ACTION },
            { key: 'EXTRA_ACTION', label: 'to Assist, Remove or Influence', price: prices.EXTRA_ACTION }
          ].map((item) => {
            const isHighlighted = canAct && highlightedMoveTiers?.has?.(item.key);
            return (
              <div key={item.key} style={rowStyle(isHighlighted)}>
                <span><KPrice amount={item.price} highlighted={isHighlighted} /> {item.label}</span>
              </div>
            );
          })}

          {!isChallengerReward && (
            <div className="turn-actions-row" style={{ marginTop: '14px' }}>
              <button
                className={`btn btn-primary finish-turn-btn ${canAct ? 'active-finish' : ''}`}
                disabled={!canAct}
                onClick={() => isOnline ? executeOnlineEndBureaucracyTurn(G, playerID, updateMasterGameState) : moves?.endBureaucracyTurn()}
              >
                Finish Turn
              </button>
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
}
