import React, { useState, useEffect } from 'react';
import { executeOnlineDraftTileSelect, executeOnlineSkipDraft } from '../../domain/phases/draftPhase.js';
import { getTileImageUrl } from '../../utils/assets.js';

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

  const hasSkippedDraft = Boolean(G?.draftSkippedPlayers?.[String(playerID)]);
  const myPackKey = (G?.draftPacks?.[playerID] || []).join(',');
  useEffect(() => {
    setIsSubmitting(false);
    setSelectedTileId(null);
  }, [hasDraftedThisRound, hasSkippedDraft, myPackKey]);

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
    if (isSubmitting || hasSkippedDraft) return;
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
    <div className={`turn-builder-card ${isSubmitting ? 'draft-modal-submitting' : ''}`} style={{ position: 'relative' }}>
      {isSubmitting && (
        <div className="draft-submitting-overlay">
          <div className="draft-spinner"></div>
          <div className="draft-submitting-text">
            <strong>Submitting selection...</strong>
            <span>Processing your draft tile pick</span>
          </div>
        </div>
      )}

      <div className={isSubmitting ? 'draft-card-disabled-content' : ''}>
        <div className="turn-card-header">
          <h3>Draft</h3>
        </div>

        <ul style={{ margin: '6px 0 12px 18px', padding: 0, fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.4 }}>
          <li>Choose 1 tile to keep.</li>
          <li>Others are passed left.</li>
        </ul>

        {hasSkippedDraft ? (
          <div className="draft-confirmed-box">
            <h3>⚡ Skip Draft Active</h3>
            <p>You will automatically receive a random tile from each pack passed to you.</p>
          </div>
        ) : hasDraftedThisRound ? (
          <div className="draft-confirmed-box">
            <h3>✓ Tile Selection Confirmed</h3>
            <p>Waiting for other players to complete their draft pick...</p>
          </div>
        ) : (
          <div className="cards-grid" style={{ marginBottom: '12px' }}>
            {(G.draftPacks?.[playerID] || []).map((tileId, idx) => {
              const isAutoFloating = tileId === autoDraftTileId;
              const isSelectedForSubmission = tileId === selectedTileId && isSubmitting;
              return (
                <div
                  key={`${tileId}-${idx}`}
                  className={`tile-card ${isAutoFloating ? 'auto-float-to-hand' : ''} ${isSelectedForSubmission ? 'tile-card-submitting' : ''}`}
                  onClick={() => handleSelectTile(tileId)}
                  style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                >
                  <img
                    src={getTileImageUrl(tileId)}
                    alt={tileId === '___' ? '' : `Tile ${tileId}`}
                    className="tile-svg"
                  />
                </div>
              );
            })}
          </div>
        )}

        {!hasSkippedDraft && (
          <div className="turn-actions-row">
            <button
              className="btn btn-primary finish-turn-btn active-finish"
              onClick={handleSkip}
              disabled={isSubmitting}
              title="Automatically receive a random tile from each pack passed to you"
            >
              Skip Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
