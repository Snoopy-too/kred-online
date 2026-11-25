import React from 'react';

export function TableStagingOverlay({
  seats,
  openCount,
  isHost,
  isStarting,
  onStartWithBots
}) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(12, 9, 7, 0.84)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(36, 28, 24, 0.96)',
        border: '1px solid rgba(200, 155, 60, 0.45)',
        borderRadius: '14px',
        padding: '28px 32px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        color: '#f5ece3'
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#c89b3c', textAlign: 'center' }}>
          Table Ready ({seats.length} Players)
        </h2>
        <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#b5a495', textAlign: 'center' }}>
          Open seats are held by AI bots until real players join. Start anytime to lock in the table.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {seats.map((seat) => (
              <div
                key={seat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: seat.occupied ? 'rgba(45, 122, 93, 0.16)' : 'rgba(200, 155, 60, 0.08)',
                  border: `1px solid ${seat.occupied ? 'rgba(45, 122, 93, 0.45)' : 'rgba(200, 155, 60, 0.28)'}`
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {seat.occupied
                    ? `${seat.name}${seat.isSelf ? ' (You)' : ''}`
                    : `Seat ${Number(seat.id) + 1} (Random Bot)`}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: seat.occupied ? 'rgba(45, 122, 93, 0.35)' : 'rgba(200, 155, 60, 0.22)',
                  color: seat.occupied ? '#9ae6c5' : '#e5c06b'
                }}>
                  {seat.occupied ? (seat.isBot ? 'AI Bot' : 'Player') : 'AI Bot · Open Seat'}
                </span>
              </div>
          ))}
        </div>

        {isHost ? (
          <button
            type="button"
            disabled={isStarting}
            onClick={onStartWithBots}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '8px',
              border: 'none',
              background: isStarting ? '#6b5a35' : '#c89b3c',
              color: '#120e0c',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isStarting ? 'wait' : 'pointer'
            }}
          >
            {isStarting
              ? 'Starting Match...'
              : `Start Game with ${openCount} ${openCount === 1 ? 'Bot' : 'Bots'}`}
          </button>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#b5a495', textAlign: 'center' }}>
            Waiting for the host to start or for more players to join...
          </p>
        )}
      </div>
    </div>
  );
}
