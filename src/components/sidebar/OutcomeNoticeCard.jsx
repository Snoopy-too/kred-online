import React from 'react';
import { getTileImageUrl } from '../../utils/assets.js';
import { formatSupportSpot } from '../../domain/supportRule.js';

const OUTCOME_META = {
  reject: { heading: 'Whistle Blown!', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.5)', showTile: true },
  challengeSuccess: { heading: 'Smoking Gun!', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.5)', showTile: true },
  challengeFailed: { heading: 'Witch Hunt!', color: '#facc15', bg: 'rgba(250, 204, 21, 0.14)', border: 'rgba(250, 204, 21, 0.5)', showTile: true },
  quiet: { heading: 'Quiet is Kept!', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.14)', border: 'rgba(74, 222, 128, 0.5)', showTile: false }
};

export function isSupportedOutcomeNotice(notice) {
  return Boolean(notice && OUTCOME_META[notice.type]);
}

export function OutcomeNoticeCard({ notice, getPlayerLabel, waitingLabel = null, onDismiss = null, pendingSupport = null, playerID = null, expertMode = false }) {
  if (!isSupportedOutcomeNotice(notice)) return null;
  const meta = OUTCOME_META[notice.type];
  const label = (id) => (getPlayerLabel ? getPlayerLabel(id) : `Player ${parseInt(id, 10) + 1}`);
  const hideTile =
    notice.type === 'challengeFailed' &&
    playerID != null &&
    notice.moverId != null &&
    String(playerID) === String(notice.moverId);
  const showTile = Boolean(meta.showTile && !hideTile && notice.tileIdPlayed && notice.tileIdPlayed !== 'HIDDEN');
  const isSupportOwnerMe = Boolean(pendingSupport && String(pendingSupport.ownerId) === String(playerID));
  const supportFromLabel = pendingSupport ? formatSupportSpot(pendingSupport.from) : '';
  const supportIsOffice = Boolean(pendingSupport?.from?.endsWith('_office'));

  let detail = '';
  if (notice.type === 'reject') {
    detail = `${label(notice.receiverId)} exposed ${label(notice.moverId)}'s dishonest play.`;
  } else if (notice.type === 'challengeSuccess') {
    detail = `${label(notice.challengerId)} exposed ${label(notice.moverId)}'s dishonest play.`;
  } else if (notice.type === 'challengeFailed') {
    detail = `${label(notice.challengerId)} challenged an honest play.`;
  } else if (notice.type === 'quiet') {
    detail = `${label(notice.receiverId)} banked ${label(notice.moverId)}'s tile.`;
  }

  return (
    <div
      onClick={onDismiss || undefined}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: showTile ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: showTile ? 'left' : 'center',
        gap: showTile ? '14px' : '8px',
        padding: '12px',
        borderRadius: '8px',
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        cursor: onDismiss ? 'pointer' : 'default'
      }}
      title={onDismiss ? 'Click to continue' : undefined}
    >
      {showTile && (
        <img
          src={getTileImageUrl(notice.tileIdPlayed)}
          alt={notice.tileIdPlayed === '___' ? 'Blank Tile' : `Tile ${notice.tileIdPlayed}`}
          title={notice.tileIdPlayed === '___' ? 'Blank Tile' : `Tile ${notice.tileIdPlayed}`}
          style={{
            width: '50px',
            height: 'auto',
            aspectRatio: '2.5 / 5',
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55))'
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <div style={{
          fontSize: showTile ? '20px' : '24px',
          fontWeight: 900,
          letterSpacing: '0.6px',
          color: meta.color,
          lineHeight: 1.15,
          textTransform: 'uppercase'
        }}>
          {meta.heading}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5ece3', lineHeight: 1.35 }}>
          {detail}
        </div>
        {isSupportOwnerMe && (
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', lineHeight: 1.35, marginTop: '2px' }}>
            Your piece in <strong>{supportFromLabel}</strong> has no piece in{' '}
            {supportIsOffice ? 'either rostrum' : 'any supporting seat'} to support it. Click {expertMode ? 'an open' : 'a highlighted'} {supportIsOffice ? 'rostrum' : 'seat'} on the board.
          </div>
        )}
        {waitingLabel && (
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
            {waitingLabel}
          </div>
        )}
        {onDismiss && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Click to continue
          </div>
        )}
      </div>
    </div>
  );
}
