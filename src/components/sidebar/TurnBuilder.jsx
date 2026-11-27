import React, { useState } from 'react';
import { TILES, MOVE_TYPES } from '../../domain/types.js';
import { classifyPlay, isMoveTypePossible } from '../../domain/moves.js';
import { ConfirmModal } from '../modals/ConfirmModal.jsx';
import { getTileImageUrl } from '../../utils/assets.js';

export function TurnBuilder({
  selectedTileId,
  selectedReceiverId,
  stagedMoves = [],
  handleResetTurn,
  handleSubmitTurn,
  isMyTurn,
  getPlayerLabel,
  isReexecuting = false,
  isSmokingGun = false,
  isPenaltyWithdraw = false,
  isFreeAdvance = false,
  playerID = '0',
  boardState = null,
  community = null,
  numPlayers = 3,
  expertMode = false
}) {
  const [showNoMovesModal, setShowNoMovesModal] = useState(false);

  if (!isMyTurn) return null;

  const isTileSelected = Boolean(selectedTileId);
  const isReceiverSelected = Boolean(selectedReceiverId);

  let titleText = 'Your Turn';
  let canFinish = isTileSelected && isReceiverSelected;
  let finishButtonLabel = 'Finish Turn';

  if (isReexecuting) {
    titleText = isSmokingGun ? 'Smoking Gun!' : 'Whistle Blown!';
    const isHonest = selectedTileId ? classifyPlay(stagedMoves, selectedTileId, playerID, boardState, community, numPlayers) === 'Honest' : false;
    canFinish = isHonest;
    finishButtonLabel = 'Finish Turn';
  } else if (isPenaltyWithdraw) {
    titleText = 'Penalty Withdraw Action';
    const hasLegalWithdraw = !boardState || isMoveTypePossible(MOVE_TYPES.WITHDRAW, playerID, boardState, community, numPlayers);
    canFinish = stagedMoves.length === 1 && stagedMoves[0].type === 'Withdraw' || (!hasLegalWithdraw && stagedMoves.length === 0);
    finishButtonLabel = canFinish ? (stagedMoves.length === 1 ? 'Submit Penalty Withdraw' : 'Skip (No Legal Withdraw)') : 'Withdraw Move Required';
  } else if (isFreeAdvance) {
    titleText = 'Free Advance Bonus Action';
    const hasLegalAdvance = !boardState || isMoveTypePossible(MOVE_TYPES.ADVANCE, playerID, boardState, community, numPlayers);
    canFinish = stagedMoves.length === 1 && stagedMoves[0].type === 'Advance' || (!hasLegalAdvance && stagedMoves.length === 0);
    finishButtonLabel = canFinish ? (stagedMoves.length === 1 ? 'Submit Free Advance' : 'Skip (No Legal Advance)') : 'Advance Move Required';
  }

  const handleFinishClick = () => {
    if (!canFinish) return;
    if (!isReexecuting && !isPenaltyWithdraw && !isFreeAdvance && stagedMoves.length === 0) {
      setShowNoMovesModal(true);
      return;
    }
    handleSubmitTurn();
  };

  const tileData = selectedTileId ? TILES[selectedTileId] : null;

  const actionsRow = (
    <div className="turn-actions-row">
      {(!expertMode || isReexecuting) && (isTileSelected || isReceiverSelected || stagedMoves.length > 0) && (
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
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {isReexecuting ? (
        <div className="reexecute-tile-banner" style={{ flex: 1, margin: 0, alignItems: 'center', padding: '10px' }}>
          {tileData && (
            <img
              src={getTileImageUrl(selectedTileId)}
              alt={selectedTileId === '___' ? '' : `Tile ${selectedTileId}`}
              style={{ width: '53px', height: 'auto', aspectRatio: '2.5 / 5', objectFit: 'contain', flexShrink: 0 }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.15 }}>
              {titleText}
            </div>
            {tileData && (
              <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.3 }}>
                Required:{' '}
                <span style={{ color: '#f87171', fontWeight: 600 }}>
                  {tileData.moves?.length ? tileData.moves.join(', ') : tileData.name}
                </span>
              </div>
            )}
            {actionsRow}
          </div>
        </div>
      ) : (
        <>
          <div className="turn-card-header">
            <h3>{titleText}</h3>
          </div>
          <ul style={{ margin: '6px 0 12px 18px', padding: 0, fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.4 }}>
            {isPenaltyWithdraw ? (
              <li>Click a piece on the board to Withdraw.</li>
            ) : isFreeAdvance ? (
              <li>Click a piece on the board to Advance.</li>
            ) : (
              <>
                <li>Move one or two pieces.</li>
                <li>Select a tile from your hand and a player to give it to.</li>
              </>
            )}
          </ul>
          {actionsRow}
        </>
      )}

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
