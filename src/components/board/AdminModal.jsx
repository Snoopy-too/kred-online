import React from 'react';
import { createPortal } from 'react-dom';

let modalPortalRoot = null;

export function setModalPortalRoot(el) {
  modalPortalRoot = el || null;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  headerActions = null,
  maxWidth = '760px',
  height = 'min(760px, 85vh)',
  children
}) {
  if (!isOpen) return null;

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(10, 8, 6, 0.82)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(${maxWidth}, 92vw)`,
          height,
          background: '#1a1410',
          border: '1px solid rgba(200, 155, 60, 0.5)',
          borderRadius: '12px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-color)',
          background: '#261f1a',
          flexShrink: 0
        }}>
          <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '14px' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return modalPortalRoot ? createPortal(modal, modalPortalRoot) : modal;
}
