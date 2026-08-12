import React, { useState, useEffect } from 'react';
import { executeOnlineDraftTileSelect, executeOnlineSkipDraft } from '../../domain/phases/draftPhase.js';

export function DraftPhaseCard({
  G,
  playerID,
  moves,
  hasDraftedThisRound,
  autoDraftTileId,
  isOnline = false,
  updateMasterGameState = null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState(null);

  useEffect(() => {
    if (hasDraftedThisRound) {
      setIsSubmitting(false);
      setSelectedTileId(null);
    }
  }, [hasDraftedThisRound, G?.draftPacks?.[playerID]]);

  const handleSelectTile = (tileId) => {
    if (isSubmitting || hasDraftedThisRound) return;
    setIsSubmitting(true);
    setSelectedTileId(tileId);

    if (isOnline) {
      executeOnlineDraftTileSelect(G, playerID, tileId, updateMasterGameState);
    } else if (moves?.selectDraftTile) {
      moves.selectDraftTile(tileId);
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 4000);
  };

  const handleSkip = () => {
    if (isSubmitting || hasDraftedThisRound) return;
    setIsSubmitting(true);

    if (isOnline) {
      executeOnlineSkipDraft(G, updateMasterGameState);
    } else if (moves?.skipDraftPhase) {
      moves.skipDraftPhase();
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 4000);
  };

  return (
    <div className={`control-card ${isSubmitting ? 'draft-modal-submitting' : ''}`}>
      {isSubmitting && (
        <div className="draft-submitting-overlay">
          <div className="draft-spinner"></div>
          <div className="draft-submitting-text">
            <strong>Saving selection to database...</strong>
            <span>Processing your draft tile pick</span>
          </div>
        </div>
      )}

      <div className={isSubmitting ? 'draft-card-disabled-content' : ''}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 className="phase-title" style={{ margin: 0 }}>Draft Phase: Choose a Tile</h2>
          {!isOnline && (
            <button
              className="btn btn-warning"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={handleSkip}
              disabled={isSubmitting || hasDraftedThisRound}
              title="Auto-deal remaining tiles to all players & jump to Campaign phase"
            >
              ⚡ Skip Draft
            </button>
          )}
        </div>
        <p className="phase-desc">
          {autoDraftTileId
            ? <span style={{ color: '#22c55e', fontWeight: '700' }}>✨ Final tile auto-floating into your hand...</span>
            : 'Select 1 tile to add to your hand. Remaining tiles will pass clockwise.'
          }
        </p>

        {hasDraftedThisRound ? (
          <div className="draft-confirmed-box">
            <h3>✓ Tile Selection Confirmed</h3>
            <p>Waiting for other players to complete their draft pick...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {(G.draftPacks?.[playerID] || []).map((tileId) => {
              const isAutoFloating = tileId === autoDraftTileId;
              const isSelectedForSubmission = tileId === selectedTileId && isSubmitting;
              return (
                <div
                  key={tileId}
                  className={`tile-card ${isAutoFloating ? 'auto-float-to-hand' : ''} ${isSelectedForSubmission ? 'tile-card-submitting' : ''}`}
                  onClick={() => handleSelectTile(tileId)}
                  style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                >
                  <img
                    src={`/images/${tileId}.svg`}
                    alt={tileId === 'BLANK' ? '' : `Tile ${tileId}`}
                    className="tile-svg"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

