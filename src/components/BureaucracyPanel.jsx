import React from 'react';
import { MOVE_TYPES, BUREAUCRACY_PRICES } from '../domain/types.js';

export function BureaucracyPanel({
  myPlayer,
  isMyTurn,
  moves,
  numPlayers,
  getPlayerLabel,
  ctx,
  selectedShopItem,
  handleSelectShopItem,
  selectedActionType,
  setSelectedActionType,
  moveFromLoc,
  validPromotionSpots
}) {
  const prices = BUREAUCRACY_PRICES[numPlayers] || BUREAUCRACY_PRICES[3];
  const funding = myPlayer.funding || 0;
  const credibilityNotchesLost = myPlayer.credibilityNotchesLost || 0;

  const basicActions = [MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE];
  const extraActions = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];

  const isBasicSelected = basicActions.includes(selectedActionType);
  const selectedMovePrice = isBasicSelected ? prices.BASIC_ACTION : prices.EXTRA_ACTION;

  return (
    <div className="control-card bureaucracy-bazaar-card">
      <div className="bazaar-header">
        <div className="bazaar-title-group">
          <span className="bazaar-icon">🏛️</span>
          <div>
            <h2 className="bazaar-title">Bureaucracy Phase</h2>
            <p className="bazaar-subtitle">Spend your campaign funding on upgrades & actions</p>
          </div>
        </div>

        <div className="bazaar-funding-badge">
          <span className="coin-icon">🪙</span>
          <div className="funding-amount-group">
            <span className="funding-label">Funding Total</span>
            <span className="funding-val">{funding} <small><span className="k-strike">K</span>redcoin</small></span>
          </div>
        </div>
      </div>

      {isMyTurn ? (
        <div className="bazaar-body">
          {/* Active Guidance Banner when an item is selected */}
          {selectedShopItem && (
            <div className="bazaar-instruction-banner">
              <div className="instruction-content">
                <span className="pulse-dot"></span>
                <span>
                  {['PROMOTE_SEAT', 'PROMOTE_ROSTRUM', 'PROMOTE_OFFICE'].includes(selectedShopItem) && (
                    validPromotionSpots.length > 0
                      ? `🎯 Click a glowing piece on your board to promote it (${validPromotionSpots.length} available)`
                      : `⚠️ No eligible pieces or insufficient funding to promote right now`
                  )}
                  {selectedShopItem === 'MOVE_ACTION' && (
                    !moveFromLoc
                      ? `🎯 Click a piece on the board to perform a ${selectedActionType} move`
                      : `🟢 Click a green throbbing circle on the board as destination`
                  )}
                </span>
              </div>
              <button
                className="btn-cancel-selection"
                onClick={() => handleSelectShopItem(selectedShopItem)}
                title="Cancel active selection"
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Section 1: Restore Credibility */}
          <div className="bazaar-section">
            <h3 className="section-title">
              <span>Credibility Restoration</span>
            </h3>
            <div className="store-grid single-col">
              <div className={`store-item-card ${credibilityNotchesLost === 0 ? 'disabled' : ''}`}>
                <div className="item-info">
                  <span className="item-name">Restore 1 Credibility</span>
                  <span className="item-desc">
                    {credibilityNotchesLost > 0
                      ? `Repair 1 lost credibility notch (Currently ${credibilityNotchesLost} lost)`
                      : `Credibility at maximum (3/3)`}
                  </span>
                </div>
                <button
                  className="btn btn-purchase"
                  disabled={funding < prices.RESTORE_CRED || credibilityNotchesLost === 0}
                  onClick={() => moves.buyBureaucracyAction({ actionType: 'RESTORE_CRED' })}
                >
                  <span className="price-tag"><span className="k-strike">K</span> {prices.RESTORE_CRED}</span>
                  <span>Restore</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Piece Promotions */}
          <div className="bazaar-section">
            <h3 className="section-title">
              <span>Piece Promotions</span>
            </h3>
            <div className="store-grid">
              {/* Promote Seat */}
              <div className={`store-item-card ${selectedShopItem === 'PROMOTE_SEAT' ? 'active-store-selection' : ''}`}>
                <div className="item-info">
                  <span className="item-name">Promote Seat Piece</span>
                  <span className="item-desc">Upgrade Mark ➔ Heel or Heel ➔ Pawn in Seat</span>
                </div>
                <button
                  className={`btn ${selectedShopItem === 'PROMOTE_SEAT' ? 'btn-active-select' : 'btn-purchase'}`}
                  disabled={funding < prices.PROMOTE_SEAT}
                  onClick={() => handleSelectShopItem('PROMOTE_SEAT')}
                >
                  {selectedShopItem === 'PROMOTE_SEAT' ? (
                    <span>Selecting...</span>
                  ) : (
                    <>
                      <span className="price-tag"><span className="k-strike">K</span> {prices.PROMOTE_SEAT}</span>
                      <span>Select Target</span>
                    </>
                  )}
                </button>
              </div>

              {/* Promote Rostrum */}
              <div className={`store-item-card ${selectedShopItem === 'PROMOTE_ROSTRUM' ? 'active-store-selection' : ''}`}>
                <div className="item-info">
                  <span className="item-name">Promote Rostrum Piece</span>
                  <span className="item-desc">Upgrade Mark ➔ Heel or Heel ➔ Pawn in Rostrum</span>
                </div>
                <button
                  className={`btn ${selectedShopItem === 'PROMOTE_ROSTRUM' ? 'btn-active-select' : 'btn-purchase'}`}
                  disabled={funding < prices.PROMOTE_ROSTRUM}
                  onClick={() => handleSelectShopItem('PROMOTE_ROSTRUM')}
                >
                  {selectedShopItem === 'PROMOTE_ROSTRUM' ? (
                    <span>Selecting...</span>
                  ) : (
                    <>
                      <span className="price-tag"><span className="k-strike">K</span> {prices.PROMOTE_ROSTRUM}</span>
                      <span>Select Target</span>
                    </>
                  )}
                </button>
              </div>

              {/* Promote Office */}
              <div className={`store-item-card ${selectedShopItem === 'PROMOTE_OFFICE' ? 'active-store-selection' : ''}`}>
                <div className="item-info">
                  <span className="item-name">Promote Office Piece</span>
                  <span className="item-desc">Upgrade Mark ➔ Heel or Heel ➔ Pawn in Office</span>
                </div>
                <button
                  className={`btn ${selectedShopItem === 'PROMOTE_OFFICE' ? 'btn-active-select' : 'btn-purchase'}`}
                  disabled={funding < prices.PROMOTE_OFFICE}
                  onClick={() => handleSelectShopItem('PROMOTE_OFFICE')}
                >
                  {selectedShopItem === 'PROMOTE_OFFICE' ? (
                    <span>Selecting...</span>
                  ) : (
                    <>
                      <span className="price-tag"><span className="k-strike">K</span> {prices.PROMOTE_OFFICE}</span>
                      <span>Select Target</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Purchase Move Actions */}
          <div className="bazaar-section">
            <h3 className="section-title">
              <span>Purchase Board Moves</span>
            </h3>

            <div className="move-action-bazaar-box">
              <div className="move-type-selector">
                <span className="label">Select Action:</span>
                <select
                  className="bazaar-select"
                  value={selectedActionType}
                  onChange={(e) => {
                    setSelectedActionType(e.target.value);
                    if (selectedShopItem === 'MOVE_ACTION') {
                      handleSelectShopItem('MOVE_ACTION'); // reset target on type change
                    }
                  }}
                >
                  <optgroup label="Basic Actions (9 Kredcoin)">
                    {basicActions.map(mt => (
                      <option key={mt} value={mt}>{mt}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Extra Actions (15 Kredcoin)">
                    {extraActions.map(mt => (
                      <option key={mt} value={mt}>{mt}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className={`store-item-card move-purchase-card ${selectedShopItem === 'MOVE_ACTION' ? 'active-store-selection' : ''}`}>
                <div className="item-info">
                  <span className="item-name">
                    {selectedActionType} Move
                  </span>
                  <span className="item-desc">
                    {isBasicSelected
                      ? 'Basic Move Action: Select piece on board to move'
                      : 'Extra Move Action: Select piece on board to move'}
                  </span>
                </div>
                <button
                  className={`btn ${selectedShopItem === 'MOVE_ACTION' ? 'btn-active-select' : 'btn-purchase'}`}
                  disabled={funding < selectedMovePrice}
                  onClick={() => handleSelectShopItem('MOVE_ACTION')}
                >
                  {selectedShopItem === 'MOVE_ACTION' ? (
                    <span>Moving...</span>
                  ) : (
                    <>
                      <span className="price-tag"><span className="k-strike">K</span> {selectedMovePrice}</span>
                      <span>Target on Board</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: End Bureaucracy Turn */}
          <div className="bazaar-footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              className="btn btn-end-bureaucracy"
              onClick={() => moves.endBureaucracyTurn()}
            >
              Finish & End Bureaucracy Turn
            </button>
          </div>
        </div>
      ) : (
        <div className="bazaar-waiting-box">
          <div className="spinner-icon">⏳</div>
          <p>Waiting for <strong>{getPlayerLabel(ctx.currentPlayer)}</strong> to complete their Bureaucracy turn...</p>
        </div>
      )}
    </div>
  );
}
