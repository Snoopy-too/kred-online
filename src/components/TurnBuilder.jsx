import React, { useState } from 'react';
import { TILES } from '../domain/types.js';
import { classifyPlay } from '../domain/moves.js';
import { ConfirmModal } from './board/ConfirmModal.jsx';

export function TurnBuilder({
  selectedTileId,
  selectedReceiverId,
  stagedMoves = [],
  handleResetTurn,
  handleSubmitTurn,
  isMyTurn,
  getPlayerLabel,
  isReexecuting = false,
  isPenaltyWithdraw = false,
  isFreeAdvance = false,
  playerID = '0',
  boardState = null,
  community = null,
  numPlayers = 3
}) {
  const [showNoMovesModal, setShowNoMovesModal] = useState(false);

  if (!isMyTurn) return null;

  const isTileSelected = Boolean(selectedTileId);
  const isReceiverSelected = Boolean(selectedReceiverId);

  let titleText = 'Your Turn';
  let canFinish = isTileSelected && isReceiverSelected;
  let finishButtonLabel = 'Finish Turn';

  if (isReexecuting) {
    titleText = 'Re-Executing Turn (Whistleblown!)';
    const isHonest = selectedTileId ? classifyPlay(stagedMoves, selectedTileId, playerID, boardState, community, numPlayers) === 'Honest' : false;
    canFinish = isHonest;
    finishButtonLabel = isHonest ? 'Submit Honest Moves' : 'Honest Moves Required';
  } else if (isPenaltyWithdraw) {
    titleText = 'Penalty Withdraw Action';
    canFinish = stagedMoves.length === 1 && stagedMoves[0].type === 'Withdraw';
    finishButtonLabel = canFinish ? 'Submit Penalty Withdraw' : 'Withdraw Move Required';
  } else if (isFreeAdvance) {
    titleText = 'Free Advance Bonus Action';
    canFinish = stagedMoves.length === 1 && stagedMoves[0].type === 'Advance';
    finishButtonLabel = canFinish ? 'Submit Free Advance' : 'Advance Move Required';
  }

  const handleFinishClick = () => {
    if (!isReexecuting && !isPenaltyWithdraw && !isFreeAdvance && stagedMoves.length === 0) {
      setShowNoMovesModal(true);
      return;
    }
    handleSubmitTurn();
  };

  const tileData = selectedTileId ? TILES[selectedTileId] : null;

  return (
    <div className="turn-builder-card">
      <div className="turn-card-header">
        <h3>{titleText}</h3>
        {isReexecuting && (
          <span className="badge badge-danger" style={{ fontSize: '11px' }}>
            Lying Caught
          </span>
        )}
      </div>

      {/* Tile Info Banner for Re-Execution */}
      {isReexecuting && tileData && (
        <div className="reexecute-tile-banner">
          <img src={`/images/${selectedTileId}.svg`} alt={selectedTileId === 'BLANK' ? '' : `Tile ${selectedTileId}`} className="tile-banner-svg" />
          <div className="tile-banner-info">
            <span className="tile-banner-title">Required Tile: {tileData.name} ({selectedTileId})</span>
            <span className="tile-banner-desc">Allowed Moves: {tileData.moves.join(', ')}</span>
          </div>
        </div>
      )}

      <div className="turn-steps-container">
        {!isPenaltyWithdraw && !isFreeAdvance && (
          <div className={`step-item ${isTileSelected ? 'completed' : 'active'}`}>
            <span className="step-num">1</span>
            <span className="step-label">
              {isTileSelected ? 'Tile Selected' : 'Select a tile from your hand'}
            </span>
          </div>
        )}

        <div className={`step-item ${stagedMoves.length > 0 ? 'completed' : 'active'}`}>
          <span className="step-num">{isPenaltyWithdraw || isFreeAdvance ? 1 : 2}</span>
          <span className="step-label">
            {stagedMoves.length > 0
              ? `Moves Staged: ${stagedMoves.length} / ${isPenaltyWithdraw || isFreeAdvance ? 1 : 2}`
              : isPenaltyWithdraw
              ? 'Click a piece on board to Withdraw'
              : isFreeAdvance
              ? 'Click a piece on board to Advance'
              : 'Click a piece on board to stage move'}
          </span>
        </div>

        {!isPenaltyWithdraw && !isFreeAdvance && (
          <div className={`step-item ${!isTileSelected ? 'disabled' : isReceiverSelected ? 'completed' : 'active'}`}>
            <span className="step-num">3</span>
            <span className="step-label">
              {isReceiverSelected ? `Tile Played to ${getPlayerLabel(selectedReceiverId)}` : 'Select a player to play your tile to'}
            </span>
          </div>
        )}
      </div>

      {stagedMoves.length > 0 && (
        <div className="staged-moves-summary">
          {stagedMoves.map((m, idx) => (
            <div key={idx} className="staged-move-badge">
              Move {idx + 1}: {m.type} [{m.from} → {m.to}]
            </div>
          ))}
        </div>
      )}

      <div className="turn-actions-row">
        {(isTileSelected || isReceiverSelected || stagedMoves.length > 0) && (
          <button
            className="btn btn-secondary reset-turn-btn"
            onClick={handleResetTurn}
            title="Reset staged moves"
          >
            ↺ Reset
          </button>
        )}

        <button
          className={`btn btn-primary finish-turn-btn ${canFinish ? 'active-finish' : 'disabled-finish'}`}
          onClick={handleFinishClick}
          disabled={!canFinish}
        >
          {finishButtonLabel}
        </button>
      </div>

      <ConfirmModal
        isOpen={showNoMovesModal}
        title="No Moves Staged"
        message="Are you sure you are finished with your turn? You have not moved any pieces!"
        confirmText="Finish Turn Anyway"
        cancelText="Cancel"
        icon="⚠️"
        variant="warning"
        onConfirm={() => {
          setShowNoMovesModal(false);
          handleSubmitTurn();
        }}
        onCancel={() => setShowNoMovesModal(false)}
      />
    </div>
  );
}
