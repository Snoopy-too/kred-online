import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/react';
import { createKredGame } from './srcGame.js';
import { KredBoard } from './srcBoard.jsx';
import { isPlayerActionRequired } from './domain/board.js';
import { LobbyView } from './components/lobby/LobbyView.jsx';
import { useSupabaseGameSync } from './hooks/useSupabaseGameSync.js';
import { OnlineGameContext } from './context/OnlineGameContext.jsx';
import { supabase, ensureAnonymousAuth } from './lib/supabaseClient.js';
import { GameLogger } from '../diagnostics/gameLogger.js';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel.jsx';
import { getAssetUrl } from './utils/assets.js';
import './styles/base.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/hand.css';
import './styles/zoom.css';
import './index.css';

export function KredApp() {
  const [gameMode, setGameMode] = useState(null); // null | 'local' | 'online_lobby' | 'online_playing'
  const [selectedNumPlayers, setSelectedNumPlayers] = useState(3);
  const [activePerspective, setActivePerspective] = useState('0');
  const [gameKey, setGameKey] = useState(Date.now());
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [currentGameState, setCurrentGameState] = useState(null);
  const [skipDraft, setSkipDraft] = useState(false);
  const [showBottomToolbar, setShowBottomToolbar] = useState(false);
  const [pinBottomToolbar, setPinBottomToolbar] = useState(() => {
    return localStorage.getItem('kred_pin_bottom_toolbar') === 'true';
  });

  const togglePinBottomToolbar = () => {
    setPinBottomToolbar(prev => {
      const next = !prev;
      localStorage.setItem('kred_pin_bottom_toolbar', String(next));
      if (next) setShowBottomToolbar(true);
      return next;
    });
  };

  useEffect(() => {
    window.onKredStateUpdate = (state) => {
      if (state && state.G && state.ctx) {
        setCurrentGameState(state);
      }
    };
    return () => {
      delete window.onKredStateUpdate;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (pinBottomToolbar) return;
      const distFromBottom = window.innerHeight - e.clientY;
      const screenCenterX = window.innerWidth / 2;
      const distFromCenterX = Math.abs(e.clientX - screenCenterX);

      if (distFromBottom <= 45 && distFromCenterX <= 120) {
        setShowBottomToolbar(true);
      } else if (distFromBottom > 100) {
        setShowBottomToolbar(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pinBottomToolbar]);




  // Online / Local Supabase Room Context
  const [onlineContext, setOnlineContext] = useState({
    lobbyId: null,
    playerIndex: 0,
    userId: null,
    playerNames: []
  });

  // Supabase DB Realtime Master Sync Hook
  const {
    gameState: dbMasterState,
    updateMasterGameState,
    playerNames: dbPlayerNames
  } = useSupabaseGameSync(onlineContext.lobbyId, onlineContext.userId);

  const effectivePlayerNames = useMemo(() => {
    if (onlineContext.playerNames && onlineContext.playerNames.length > 0) {
      return onlineContext.playerNames;
    }
    if (dbPlayerNames && dbPlayerNames.length > 0) {
      return dbPlayerNames;
    }
    return Array.from({ length: selectedNumPlayers }).map((_, i) => `Player ${i + 1}`);
  }, [onlineContext.playerNames, dbPlayerNames, selectedNumPlayers]);

  // Create boardgame.io Client with factory-bound game engine
  const KredClient = useMemo(() => {
    if (!selectedNumPlayers) return null;
    return Client({
      game: createKredGame(selectedNumPlayers, skipDraft),
      board: KredBoard,
      numPlayers: selectedNumPlayers,
      debug: false
    });
  }, [selectedNumPlayers, skipDraft, gameKey]);

  const matchID = onlineContext.lobbyId || `local-match-${selectedNumPlayers}p-${gameKey}`;
  const gameLogger = useMemo(() => {
    return new GameLogger(matchID, selectedNumPlayers);
  }, [matchID, selectedNumPlayers]);


  // Handlers for Local Test Mode (Auto-creates Supabase Room if Supabase is connected)
  const handleStartLocalGame = async (mode) => {
    setSelectedNumPlayers(mode);
    setActivePerspective('0');
    setGameKey(Date.now());

    const hasSupabase = Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    if (hasSupabase) {
      try {
        const { user } = await ensureAnonymousAuth();
        if (user) {
          const pin = Math.floor(100000 + Math.random() * 900000).toString();
          const { data: lobbyData } = await supabase
            .from('kred_lobbies')
            .insert({
              pin,
              host_id: user.id,
              player_count: mode,
              status: 'ACTIVE'
            })
            .select()
            .single();

          if (lobbyData) {
            const playersToInsert = Array.from({ length: mode }).map((_, i) => ({
              lobby_id: lobbyData.id,
              user_id: user.id,
              name: `Player ${i + 1}`,
              player_index: i,
              is_host: i === 0,
              connection_status: 'ONLINE'
            }));
            await supabase.from('kred_players').insert(playersToInsert);

            setOnlineContext({
              lobbyId: lobbyData.id,
              playerIndex: 0,
              userId: user.id,
              playerNames: playersToInsert.map(p => p.name)
            });
            localStorage.setItem('kred_last_local', JSON.stringify({ lobbyId: lobbyData.id, numPlayers: mode, skipDraft }));
            setGameMode('local');
            return;
          }
        }
      } catch (err) {
        console.warn('Auto-create Supabase lobby warning, defaulting to local memory:', err);
      }
    }

    setOnlineContext({ lobbyId: null, playerIndex: 0, userId: null, playerNames: [] });
    setGameMode('local');
  };

  // Handlers for Online Multiplayer Mode
  const handleStartOnlineGame = ({ lobbyId, numPlayers, playerIndex, userId, playerNames = [], pin }) => {
    setSelectedNumPlayers(numPlayers);
    setOnlineContext({ lobbyId, playerIndex, userId, playerNames });
    setActivePerspective(String(playerIndex));
    setGameMode('online_playing');
    setGameKey(Date.now());
    if (pin) {
      localStorage.setItem('kred_last_online', JSON.stringify({ pin, numPlayers }));
    }
  };

  const handleReturnToMenu = () => {
    setGameMode(null);
    setOnlineContext({ lobbyId: null, playerIndex: 0, userId: null, playerNames: [] });
  };

  const handleQuickRejoinOnline = async (pin) => {
    try {
      const { user } = await ensureAnonymousAuth();
      if (!user) {
        alert('Could not establish user session for Quick Rejoin.');
        return;
      }
      const { data: lobbyData, error: lobbyErr } = await supabase
        .from('kred_lobbies')
        .select('*')
        .eq('pin', String(pin).trim())
        .in('status', ['WAITING', 'ACTIVE'])
        .maybeSingle();

      if (lobbyErr || !lobbyData) {
        alert('The saved room could not be found.');
        return;
      }
      const { data: existingPlayers } = await supabase
        .from('kred_players')
        .select('*')
        .eq('lobby_id', lobbyData.id);

      const myExistingPlayer = existingPlayers?.find(p => p.user_id === user.id);

      if (myExistingPlayer && lobbyData.status === 'ACTIVE') {
        const pNames = existingPlayers.map(p => p.name || `Player ${p.player_index + 1}`);
        handleStartOnlineGame({
          lobbyId: lobbyData.id,
          numPlayers: lobbyData.player_count,
          playerIndex: myExistingPlayer.player_index,
          userId: user.id,
          playerNames: pNames,
          pin: lobbyData.pin
        });
      } else if (lobbyData.status === 'WAITING') {
        // If it's WAITING, just drop them in the lobby view so they can join properly
        setGameMode('online_lobby');
      } else {
        alert('Could not auto-resume. Your browser session may have changed. Please use the Lobby to join.');
        setGameMode('online_lobby');
      }
    } catch (err) {
      console.error('Quick rejoin failed:', err);
      alert('Failed to rejoin: ' + err.message);
    }
  };

  // 1. Online Lobby Selection Screen
  if (gameMode === 'online_lobby') {
    return (
      <LobbyView
        onStartOnlineGame={handleStartOnlineGame}
        onCancel={handleReturnToMenu}
      />
    );
  }

  // 2. Main Landing Screen / Mode Selector
  if (!gameMode) {
    const lastLocal = JSON.parse(localStorage.getItem('kred_last_local') || 'null');
    const lastOnline = JSON.parse(localStorage.getItem('kred_last_online') || 'null');

    return (
      <div className="landing-screen">
        <div className="landing-card">
          <div className="landing-logo">
            <img src={getAssetUrl('images/logo.png')} alt="KRED" className="landing-logo-img" />
            <p className="landing-subtitle">Multiplayer Board Game of Deception & Strategy</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '24px' }}>
            {/* Option A: Local Pass-and-Play / Test Mode */}
            <div style={{ background: '#261f1a', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '8px' }}>🎮 Local Pass & Play / Test Mode</h2>
              <p className="landing-subtitle" style={{ marginBottom: '16px' }}>
                Control all 3, 4, or 5 players on one computer. Test rules and switch player perspectives freely.
              </p>

              <div style={{ background: '#1a1411', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <label style={{ color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={skipDraft}
                    onChange={(e) => setSkipDraft(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                  />
                  <strong>⚡ Skip Draft Phase</strong> (Auto-deal tiles & start in Campaign)
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-primary mode-btn" onClick={() => handleStartLocalGame(3)}>
                  Start 3-Player Test Game {skipDraft ? '(No Draft)' : ''}
                </button>
                <button className="btn btn-primary mode-btn" onClick={() => handleStartLocalGame(4)}>
                  Start 4-Player Test Game {skipDraft ? '(No Draft)' : ''}
                </button>
                <button className="btn btn-primary mode-btn" onClick={() => handleStartLocalGame(5)}>
                  Start 5-Player Test Game {skipDraft ? '(No Draft)' : ''}
                </button>
                {lastLocal && (
                  <button className="btn btn-secondary mode-btn" style={{ marginTop: '12px', border: '1px solid var(--accent-gold)' }} onClick={() => {
                    setSkipDraft(lastLocal.skipDraft || false);
                    handleStartLocalGame(lastLocal.numPlayers);
                  }}>
                    🔄 Resume Last Local Session ({lastLocal.numPlayers}P)
                  </button>
                )}
              </div>
            </div>

            {/* Option B: Online Supabase Multiplayer Mode */}
            <div style={{ background: '#261f1a', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '8px' }}>🌐 Online Supabase Multiplayer</h2>
                <p className="landing-subtitle" style={{ marginBottom: '20px' }}>
                  Play with friends across the internet using 6-digit room PINs powered by Supabase Realtime DB Master State.
                </p>
              </div>
              <button
                className="btn btn-warning"
                style={{ padding: '16px', fontSize: '18px', fontWeight: '800' }}
                onClick={() => setGameMode('online_lobby')}
              >
                Enter Online Lobby & Room PINs →
              </button>
              {lastOnline && (
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--accent-gold)' }}
                  onClick={() => handleQuickRejoinOnline(lastOnline.pin)}
                >
                  🔄 Quick Rejoin PIN: {lastOnline.pin}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Playing Screen (Both Local and Online use identical KredClient engine)
  const isOnline = gameMode === 'online_playing';

  return (
    <div className="app-shell">
      {(() => { window.KRED_CALIBRATION_MODE = calibrationMode; return null; })()}
      <div className="client-wrapper">
        <OnlineGameContext.Provider
          value={{
            isOnline,
            dbMasterState,
            updateMasterGameState,
            playerNames: effectivePlayerNames,
            onlinePlayerIndex: onlineContext.playerIndex
          }}
        >
          <KredClient
            matchID={matchID}
            key={`${selectedNumPlayers}-${gameKey}`}
            playerID={activePerspective}
            isOnline={isOnline}
            playerNames={effectivePlayerNames}
            dbMasterState={dbMasterState}
            updateMasterGameState={updateMasterGameState}
            onStateChange={(state) => {
              if (state) {
                setCurrentGameState(state);
                gameLogger.handleStateChange(state);
                if (onlineContext.lobbyId && state.G) {
                  updateMasterGameState(state.G, state.ctx?.phase);
                }
              }
            }}
          />
        </OnlineGameContext.Provider>
      </div>

      <div
        className={`bottom-toolbar-tab ${(showBottomToolbar || pinBottomToolbar) ? 'hidden' : ''}`}
        onMouseEnter={() => setShowBottomToolbar(true)}
      >
        ▲ Menu & Info
      </div>

      <div
        className={`bottom-toolbar ${(showBottomToolbar || pinBottomToolbar) ? 'visible' : ''}`}
        onMouseEnter={() => setShowBottomToolbar(true)}
        onMouseLeave={() => {
          if (!pinBottomToolbar) setShowBottomToolbar(false);
        }}
      >
        <div className="left-controls">
          <button className="btn btn-secondary" onClick={handleReturnToMenu}>
            ← Main Menu
          </button>
          <span className="mode-tag">
            {isOnline
              ? `🌐 Online Room (${selectedNumPlayers}P)`
              : onlineContext.lobbyId
                ? `🎮 Local Test (${selectedNumPlayers}P • Supabase Live)`
                : `🎮 Local Test (${selectedNumPlayers}P • Local Memory)`}
          </span>
        </div>

        {/* Perspective selector is ONLY shown in Local Test mode; in Online play, seat is fixed */}
        {!isOnline ? (
          <div className="perspective-selector">
            <label>View Perspective:</label>
            <div className="btn-group">
              {Array.from({ length: selectedNumPlayers }).map((_, p) => {
                const pStr = String(p);
                const isActionRequired = isPlayerActionRequired(pStr, currentGameState);
                const pName = effectivePlayerNames[p] || `Player ${p + 1}`;
                return (
                  <button
                    key={pStr}
                    className={`btn ${activePerspective === pStr ? 'btn-primary' : 'btn-secondary'} ${isActionRequired ? 'flashing-green-tab' : ''}`}
                    onClick={() => setActivePerspective(pStr)}
                  >
                    {pName}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <span
            className="mode-tag"
            style={{
              background: 'rgba(200, 155, 60, 0.2)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              fontSize: '14px',
              fontWeight: '700',
              padding: '6px 14px'
            }}
          >
            👤 Playing as: {effectivePlayerNames[onlineContext.playerIndex] || `Player ${onlineContext.playerIndex + 1}`} (Seat {onlineContext.playerIndex + 1})
          </span>
        )}

        {/* Diagnostics, Reset, and Calibrate are hidden in Online mode */}
        {!isOnline && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${pinBottomToolbar ? 'btn-primary' : 'btn-secondary'}`}
              onClick={togglePinBottomToolbar}
              title={pinBottomToolbar ? "Unpin toolbar (Auto-hide on mouse leave)" : "Pin toolbar (Keep always visible in view)"}
            >
              {pinBottomToolbar ? '📌 Pinned' : '📌 Pin Bar'}
            </button>

            <button
              className={`btn ${showDiagnostics ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              🔍 Diagnostics Log
            </button>

            <button
              className="btn btn-warning"
              onClick={() => setGameKey(Date.now())}
            >
              Reset Match
            </button>

            <button
              className={`btn ${calibrationMode ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => {
                const nextMode = !calibrationMode;
                setCalibrationMode(nextMode);
                if (window.setCalibrationMode) window.setCalibrationMode(nextMode);
              }}
            >
              ⚙ {calibrationMode ? 'Exit Calibrate' : 'Calibrate'}
            </button>
          </div>
        )}
      </div>

      {!isOnline && (
        <DiagnosticsPanel
          gameLogger={gameLogger}
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );

}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<KredApp />);
}
