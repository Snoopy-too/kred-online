import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../../utils/assets.js';
import { getOrderedChallengers } from '../../domain/board.js';
import { DEFAULT_PERSPECTIVE_OFFSETS, getPerspectiveRotation } from './perspectiveUtils.js';
import { AdminModal } from './AdminModal.jsx';

const STATUS_ICONS = {
  waiting: { cls: 'bi-hourglass-split', color: '#f59e0b', label: 'Waiting' },
  check: { cls: 'bi-check-lg', color: '#22c55e', label: 'Accepted' },
  alert: { cls: 'bi-exclamation-lg', color: '#f59e0b', label: 'Rejected / Challenged' },
  fail: { cls: 'bi-x-lg', color: '#ef4444', label: 'Failed' },
  win: { cls: 'bi-circle-fill', color: '#22c55e', label: 'Succeeded', size: '10px' }
};

function StatusIcon({ status, spin = false }) {
  const icon = STATUS_ICONS[status];
  if (!icon) return null;
  return (
    <i
      className={`bi ${icon.cls}${spin ? ' kred-hourglass-spin' : ''}`}
      aria-label={icon.label}
      title={icon.label}
      style={{
        color: icon.color,
        fontSize: icon.size || '14px',
        marginLeft: '6px',
        verticalAlign: 'middle',
        lineHeight: 1
      }}
    />
  );
}

function buildTurnBadges({ currentPhase, G, ctx, getPlayerLabel }) {
  if (currentPhase === 'draft') return [];

  if (G?.pendingSupport) {
    return [
      { key: 'support-owner', role: 'Support', name: getPlayerLabel(G.pendingSupport.ownerId), playerId: G.pendingSupport.ownerId, status: 'waiting' }
    ];
  }

  if (currentPhase === 'bureaucracy') {
    return [
      { key: 'bureaucracy-actor', role: 'Active', name: getPlayerLabel(ctx?.currentPlayer), playerId: ctx?.currentPlayer, status: 'waiting' }
    ];
  }

  const pp = G?.pendingPlay;
  if (pp) {
    const moverName = getPlayerLabel(pp.moverId);
    const receiverName = getPlayerLabel(pp.receiverId);
    const passed = (pp.challengesPassed || []).map(String);

    // Challenge succeeded (reexecute / penaltyWithdraw / challengerReward)
    if (pp.successfulChallengerId !== undefined && pp.successfulChallengerId !== null) {
      return [
        { key: 'mover', role: 'Mover', name: moverName, status: 'fail' },
        { key: 'receiver', role: 'Receiver', name: receiverName, status: 'fail' },
        ...passed.map((id) => ({
          key: `challenger-pass-${id}`,
          role: 'Challenger',
          name: getPlayerLabel(id),
          status: 'check'
        })),
        {
          key: `challenger-win-${pp.successfulChallengerId}`,
          role: 'Challenger',
          name: getPlayerLabel(pp.successfulChallengerId),
          status: 'win'
        }
      ];
    }

    // Receiver rejected (whistleblown)
    if (pp.whistleblownByReceiver) {
      return [
        { key: 'mover', role: 'Mover', name: moverName, status: 'check' },
        { key: 'receiver', role: 'Receiver', name: receiverName, status: 'alert' }
      ];
    }

    // Receipt step: mover passed tile, waiting on receiver
    if (pp.step === 'receipt') {
      return [
        { key: 'mover', role: 'Mover', name: moverName, status: 'check' },
        { key: 'receiver', role: 'Receiver', name: receiverName, playerId: pp.receiverId, status: 'waiting' }
      ];
    }

    // Challenge step: mover & receiver accepted, polling challengers in order
    if (pp.step === 'challenge') {
      const eligible = getOrderedChallengers(G);
      const activeChallenger = eligible.find((id) => !passed.includes(String(id)));
      const badges = [
        { key: 'mover', role: 'Mover', name: moverName, status: 'check' },
        { key: 'receiver', role: 'Receiver', name: receiverName, status: 'check' },
        ...passed.map((id) => ({
          key: `challenger-pass-${id}`,
          role: 'Challenger',
          name: getPlayerLabel(id),
          status: 'check'
        }))
      ];
      if (activeChallenger !== undefined) {
        badges.push({
          key: `challenger-wait-${activeChallenger}`,
          role: 'Challenger',
          name: getPlayerLabel(activeChallenger),
          playerId: activeChallenger,
          status: 'waiting'
        });
      }
      return badges;
    }
  }

  // Unsuccessful challenge outcome just resolved
  const outcome = G?.lastOutcomeNotice;
  if (outcome && outcome.type === 'challengeFailed') {
    return [
      { key: 'outcome-mover', role: 'Mover', name: getPlayerLabel(outcome.moverId), status: 'win' },
      { key: 'outcome-receiver', role: 'Receiver', name: getPlayerLabel(outcome.receiverId), status: 'check' },
      { key: 'outcome-challenger', role: 'Challenger', name: getPlayerLabel(outcome.challengerId), status: 'fail' }
    ];
  }

  // Start of a campaign turn: waiting on mover
  return [
    { key: 'mover', role: 'Mover', name: getPlayerLabel(ctx?.currentPlayer), playerId: ctx?.currentPlayer, status: 'waiting' }
  ];
}

export function BoardHeaderControls({
  currentPhase,
  G,
  ctx,
  moves = null,
  playerID,
  getPlayerLabel,
  boardZoom = 1,
  setBoardZoom = null,
  onResetBoardView = null,
  isAdmin = false,
  calibrationMode = false,
  onToggleCalibration = null,
  calibration = null,
  activeHotspots = null,
  numPlayers = 3,
  tilesPerPlayer = 8,
  setShowSaveLoadModal,
  onResetTransientState = null
}) {
  const [showManual, setShowManual] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const lobbyToolbar =
    typeof window !== 'undefined' &&
    window.tfdMatchToolbar &&
    typeof window.tfdMatchToolbar.configure === 'function'
      ? window.tfdMatchToolbar
      : null;

  const zoomRef = React.useRef(boardZoom);
  zoomRef.current = boardZoom;
  const latestStateRef = React.useRef({ G, ctx });
  latestStateRef.current = { G, ctx };
  const callbacksRef = React.useRef({});
  callbacksRef.current = {
    onToggleCalibration,
    setBoardZoom,
    onResetBoardView,
    setShowSaveLoadModal,
    onResetTransientState,
    moves
  };

  const hasZoom = Boolean(setBoardZoom);
  const hasCal = Boolean(onToggleCalibration);
  const hasSaveLoad = Boolean(moves && typeof moves.loadSaveState === 'function');

  const formatKredSpotLabel = (locKey) => {
    if (locKey.startsWith('community_')) return `COM${locKey.replace('community_', '')}`;
    const [p, typePart = ''] = locKey.split('_');
    const pNum = p.match(/^p(\d+)$/i)?.[1] || p;
    const map = { office: 'OF', rostrum1: 'R1', rostrum2: 'R2', dropTile: 'DR', cred: 'CR' };
    const tLabel = map[typePart] || (typePart.startsWith('seat') ? typePart.replace('seat', 'S') : typePart.startsWith('bank') ? typePart.replace('bank', 'BA') : typePart);
    return `P${pNum} ${tLabel}`;
  };

  const buildArrangeConfig = () => {
    if (!isAdmin || !hasCal || !calibration) return null;
    const pIdx = parseInt(playerID || 0, 10);
    const activeOff = calibration.perspectiveOffsets?.[pIdx] || DEFAULT_PERSPECTIVE_OFFSETS[numPlayers]?.[pIdx] || { x: 0, y: 0 };
    return {
      active: Boolean(calibrationMode),
      title: `Arrange Components (${numPlayers}P)`,
      onToggle: () => callbacksRef.current.onToggleCalibration?.(),
      spots: activeHotspots || {},
      selectedKeys: calibration.selectedCalibrateKeys || [],
      onSelect: calibration.setSelectedCalibrateKeys,
      formatLabel: formatKredSpotLabel,
      groups: [
        ...Array.from({ length: numPlayers }, (_, i) => ({
          label: `P${i + 1} Bank`,
          keys: Array.from({ length: tilesPerPlayer }, (_, j) => `p${i + 1}_bank${j + 1}`)
        })),
        { label: 'Drop Tiles', keys: Array.from({ length: numPlayers }, (_, i) => `p${i + 1}_dropTile`) },
        { label: 'Cred Tokens', keys: Array.from({ length: numPlayers }, (_, i) => `p${i + 1}_cred`) }
      ],
      toggles: [
        { label: calibration.showSpotLabels ? '🏷 Hide Labels' : '🏷 Show Labels', onClick: () => calibration.setShowSpotLabels((v) => !v) },
        { label: calibration.showTileFaces ? '🎴 Tile Art: ON' : '📐 Tile Art: OFF', onClick: () => calibration.setShowTileFaces((v) => !v) }
      ],
      onSaveDraft: calibration.handleSaveDraft,
      onResetDraft: calibration.handleResetDraft,
      onCopyJson: calibration.handleCopyCoordinates,
      onImportJson: calibration.handleImportJson,
      statusMsg: calibration.draftSavedMsg,
      copied: calibration.copiedJson,
      onNudge: (dx, dy) => calibration.handleNudgeSelectedSpotsPixels?.(dx, dy, getPerspectiveRotation(numPlayers, playerID) + (activeOff.r || 0)),
      onRotate: calibration.handleRotateSelectedSpots,
      onSetAngle: (v) => { calibration.setAngleInput(v); calibration.handleSetExactAngle(v); },
      onScale: calibration.handleScaleSelectedSpots,
      onSetScale: (v) => { calibration.setScaleInput(v); calibration.handleSetExactScale(v); },
      angleInput: calibration.angleInput,
      scaleInput: calibration.scaleInput,
      onGroupRotate: calibration.handleRotateSelectedSpotsAroundCenter,
      view: {
        label: `Board View (P${pIdx + 1})`,
        metrics: `X=${activeOff.x}%, Y=${activeOff.y}%, Rot=${activeOff.r ?? 0}°`,
        onNudge: (dx, dy) => calibration.handleNudgePerspective?.(playerID, dx, dy),
        onRotate: (deg) => calibration.handleRotatePerspective?.(playerID, deg),
        onReset: () => calibration.handleResetPerspectiveOffset?.(playerID)
      }
    };
  };

  useEffect(() => {
    if (!lobbyToolbar) return;
    lobbyToolbar.configure({
      logo: {
        src: getAssetUrl('images/logo.png'),
        alt: 'KRED',
        invert: true
      },
      manual: {
        label: 'Manual',
        url: 'https://theflyingdutchmen.games/KRED/manual?standalone=1',
        modal: true,
        title: 'KRED Manual'
      },
      zoom: hasZoom
        ? {
            min: 0.5,
            max: 2,
            step: 0.01,
            value: zoomRef.current,
            onChange: (val) => callbacksRef.current.setBoardZoom?.(val),
            onReset: () => {
              if (callbacksRef.current.onResetBoardView) callbacksRef.current.onResetBoardView();
              else callbacksRef.current.setBoardZoom?.(1);
            }
          }
        : null,
      saveLoad: isAdmin && hasSaveLoad
        ? {
            storageKey: 'kred',
            getState: () => {
              const { G: curG, ctx: curCtx } = latestStateRef.current;
              return {
                numPlayers: curG?.numPlayers || curCtx?.numPlayers || 3,
                phase: curCtx?.phase || 'campaign',
                currentPlayer: curCtx?.currentPlayer || '0',
                turn: curCtx?.turn || 1,
                G: curG
              };
            },
            loadState: (snap) => {
              callbacksRef.current.onResetTransientState?.();
              callbacksRef.current.moves?.loadSaveState?.(snap);
            }
          }
        : null,
      arrange: buildArrangeConfig(),
      devTools: [],
      forceDevTools: isAdmin
    });
  }, [lobbyToolbar, isAdmin, calibrationMode, hasZoom, hasCal, hasSaveLoad]);

  useEffect(() => {
    if (!lobbyToolbar || typeof lobbyToolbar.updateArrange !== 'function' || !calibrationMode) return;
    lobbyToolbar.updateArrange(buildArrangeConfig());
  }, [
    lobbyToolbar, calibrationMode, numPlayers, playerID,
    calibration?.selectedCalibrateKeys, calibration?.calibratedPositions, calibration?.perspectiveOffsets,
    calibration?.showSpotLabels, calibration?.showTileFaces, calibration?.draftSavedMsg,
    calibration?.copiedJson, calibration?.angleInput, calibration?.scaleInput
  ]);

  useEffect(() => {
    if (lobbyToolbar && typeof lobbyToolbar.updateZoom === 'function') {
      lobbyToolbar.updateZoom(boardZoom);
    }
  }, [lobbyToolbar, boardZoom]);

  const menuItemStyle = {
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textDecoration: 'none'
  };

  const turnBadges = buildTurnBadges({ currentPhase, G, ctx, getPlayerLabel });

  return (
    <header className="kred-header">
      {!lobbyToolbar && (
      <div className="logo-brand">
        <img src={getAssetUrl('images/logo.png')} alt="KRED" className="logo-img" />
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="status-badge"
          style={{
            color: 'var(--accent-gold)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Open KRED Manual"
        >
          <i className="bi bi-book" /> Manual
        </button>
        {isAdmin && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`status-badge ${calibrationMode ? 'btn-danger' : ''}`}
              style={{
                cursor: 'pointer',
                color: calibrationMode ? '#fff' : 'var(--accent-gold)',
                background: calibrationMode ? 'var(--accent-red)' : 'var(--bg-card)',
                borderColor: calibrationMode ? 'var(--accent-red)' : 'rgba(200, 155, 60, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 700
              }}
              onClick={() => setShowAdminMenu((v) => !v)}
              title="Admin Tools"
            >
              <i className="bi bi-gear" /> Admin {showAdminMenu ? '▴' : '▾'}
            </button>

            {showAdminMenu && (
              <>
                <div
                  onClick={() => setShowAdminMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    minWidth: '175px',
                    background: '#261f1a',
                    border: '1px solid rgba(200, 155, 60, 0.45)',
                    borderRadius: '8px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75)',
                    zIndex: 200,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {onToggleCalibration && (
                    <button
                      type="button"
                      style={{ ...menuItemStyle, color: calibrationMode ? '#f87171' : 'var(--text-main)' }}
                      onClick={() => { setShowAdminMenu(false); onToggleCalibration(); }}
                    >
                      <span>{calibrationMode ? 'Exit Arrange' : 'Arrange Components'}</span>
                      <i className="bi bi-crosshair" />
                    </button>
                  )}
                  <button
                    type="button"
                    style={menuItemStyle}
                    onClick={() => { setShowAdminMenu(false); setShowSaveLoadModal(true); }}
                  >
                    <span>Save / Load State</span>
                    <i className="bi bi-floppy" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {setBoardZoom && (
          <div
            className="status-badge"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Zoom board"
          >
            <i className="bi bi-zoom-in" style={{ color: 'var(--accent-gold)' }} />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={boardZoom}
              onChange={(e) => setBoardZoom(parseFloat(e.target.value))}
              aria-label="Board Zoom"
              style={{ width: '80px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
            />
            <span
              onClick={() => (onResetBoardView ? onResetBoardView() : setBoardZoom(1))}
              title="Click to reset zoom & position"
              style={{ minWidth: '38px', textAlign: 'right', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
            >
              {Math.round(boardZoom * 100)}%
            </span>
          </div>
        )}
      </div>
      )}

      {!(G?.winner || ctx?.gameover) && (
      <div className="header-controls">
        <div
          className="status-badge phase-badge"
          style={{
            background: 'rgba(200, 155, 60, 0.22)',
            borderColor: 'var(--accent-gold)',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            letterSpacing: '0.6px'
          }}
        >
          {currentPhase.toUpperCase()}
        </div>

        {turnBadges.map((b) => (
          <div key={b.key} className="status-badge turn-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span>{b.role}: <strong>{b.name}</strong></span>
            <StatusIcon
              status={b.status}
              spin={b.status === 'waiting' && b.playerId !== undefined && String(b.playerId) === String(playerID)}
            />
          </div>
        ))}
      </div>
      )}
      <AdminModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        title="KRED Manual"
        maxWidth="960px"
        height="min(820px, 88vh)"
        headerActions={
          <a
            href="https://theflyingdutchmen.games/KRED/manual?standalone=1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}
            title="Open in new tab"
          >
            <i className="bi bi-box-arrow-up-right" /> New Tab
          </a>
        }
      >
        <iframe
          src="https://theflyingdutchmen.games/KRED/manual?standalone=1"
          title="KRED Manual"
          style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
        />
      </AdminModal>
    </header>
  );
}
