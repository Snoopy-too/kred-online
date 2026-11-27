import React from 'react';

export function ConfirmModal({
  isOpen,
  title = 'Confirmation Required',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon = '⚠️',
  variant = 'warning'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} style={backdropStyle}>
      <div className="modal-content confirm-modal-card" onClick={e => e.stopPropagation()} style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            <span style={{ fontSize: '18px' }}>{icon}</span> {title}
          </h3>
        </div>

        <div style={bodyStyle}>
          <p style={messageStyle}>{message}</p>
        </div>

        <div style={footerStyle}>
          {cancelText && (
            <button className="btn btn-secondary" onClick={onCancel} style={cancelBtnStyle}>
              {cancelText}
            </button>
          )}
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : variant === 'info' ? 'btn-primary' : 'btn-warning'}`}
            onClick={onConfirm}
            style={confirmBtnStyle}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000
};

const modalStyle = {
  background: 'linear-gradient(135deg, rgba(30, 24, 20, 0.98), rgba(45, 30, 24, 0.98))',
  border: '1.5px solid var(--accent-gold, #c89b3c)',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '400px',
  padding: '18px 20px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(200, 155, 60, 0.2)',
  color: '#ffffff'
};

const headerStyle = {
  marginBottom: '12px',
  borderBottom: '1px solid rgba(200, 155, 60, 0.3)',
  paddingBottom: '8px'
};

const titleStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--accent-gold, #c89b3c)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const bodyStyle = {
  marginBottom: '18px'
};

const messageStyle = {
  margin: 0,
  fontSize: '13px',
  lineHeight: '1.5',
  color: 'var(--text-main, #e2e8f0)'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
};

const cancelBtnStyle = {
  padding: '7px 14px',
  fontSize: '12px',
  fontWeight: '600'
};

const confirmBtnStyle = {
  padding: '7px 16px',
  fontSize: '12px',
  fontWeight: '700'
};
