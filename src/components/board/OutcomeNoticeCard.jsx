import React from 'react';

const OUTCOME_META = {
  reject: { heading: 'Whistle Blown!', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.5)' },
  challengeSuccess: { heading: 'Smoking Gun!', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.5)' },
  challengeFailed: { heading: 'Witch Hunt!', color: '#facc15', bg: 'rgba(250, 204, 21, 0.14)', border: 'rgba(250, 204, 21, 0.5)' },
  quiet: { heading: 'Quiet is Kept!', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.14)', border: 'rgba(74, 222, 128, 0.5)' }
};

export function isSupportedOutcomeNotice(notice) {
  return Boolean(notice && OUTCOME_META[notice.type]);
}

export function OutcomeNoticeCard({ notice, getPlayerLabel, waitingLabel = null, onDismiss = null }) {
  if (!isSupportedOutcomeNotice(notice)) return null;
  const meta = OUTCOME_META[notice.type];
  const label = (id) => (getPlayerLabel ? getPlayerLabel(id) : `Player ${parseInt(id, 10) + 1}`);

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '8px',
        padding: '14px 12px',
        borderRadius: '8px',
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        cursor: onDismiss ? 'pointer' : 'default'
      }}
      title={onDismiss ? 'Click to continue' : undefined}
    >
      <div style={{
        fontSize: '24px',
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
      {waitingLabel && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {waitingLabel}
        </div>
      )}
      {onDismiss && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Click to continue
        </div>
      )}
    </div>
  );
}
