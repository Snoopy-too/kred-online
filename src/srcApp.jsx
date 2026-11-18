import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/dist/esm/react.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from './srcGame.js';
import { KredBoard } from './srcBoard.jsx';
import { isPlayerActionRequired } from './domain/board.js';
import { createSoloController } from './ai/index.js';
import { LandingScreen } from './components/lobby/LandingScreen.jsx';
import { LobbyView } from './components/lobby/LobbyView.jsx';
import { useSupabaseGameSync } from './hooks/useSupabaseGameSync.js';
import { OnlineGameContext } from './context/OnlineGameContext.jsx';
import { supabase, ensureAnonymousAuth } from './lib/supabaseClient.js';
import { GameLogger } from '../diagnostics/gameLogger.js';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel.jsx';
import './styles/base.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/hand.css';
import './styles/zoom.css';
import './index.css';

export function KredApp() {
  const [gameMode, setGameMode] = useState(null); // null | 'solo' | 'local' | 'online_lobby' | 'online_playing'
  const [botStatus, setBotStatus] = useState(null);
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

  const isSolo = gameMode === 'solo';
  const matchID = onlineContext.lobbyId || `${isSolo ? 'solo' : 'local'}-match-${selectedNumPlayers}p-${gameKey}`;

  const soloMultiplayer = useMemo(() => {
    if (!isSolo) return undefined;
    return Local();
  }, [isSolo, gameKey]);

  const kredGame = useMemo(() => {
    if (!selectedNumPlayers) return null;
    return createKredGame(selectedNumPlayers, skipDraft, { hideOpponentHands: isSolo });
  }, [selectedNumPlayers, skipDraft, isSolo, gameKey]);

  // Create boardgame.io Client with factory-bound game engine
  const KredClient = useMemo(() => {
    if (!selectedNumPlayers || !kredGame) return null;
    return Client({
      game: kredGame,
      board: KredBoard,
      numPlayers: selectedNumPlayers,
      multiplayer: soloMultiplayer,
      debug: false
    });
  }, [kredGame, selectedNumPlayers, soloMultiplayer]);

  const gameLogger = useMemo(() => {
    return new GameLogger(matchID, selectedNumPlayers);
  }, [matchID, selectedNumPlayers]);

  useEffect(() => {
    if (!isSolo || !kredGame || !soloMultiplayer) {
      setBotStatus(null);
      return undefined;
    }
    const controller = createSoloController({
      game: kredGame,
      matchID,
      multiplayer: soloMultiplayer,
      onStatusChange: setBotStatus
    });
    return () => {
      controller.stop();
    };
  }, [isSolo, kredGame, matchID, soloMultiplayer]);

  const handleStartSoloGame = () => {
    setSelectedNumPlayers(3);
    setActivePerspective('0');
    setBotStatus(null);
    setOnlineContext({
      lobbyId: null,
      playerIndex: 0,
      userId: null,
      playerNames: ['You', 'Baron Vance', 'Inspector Vale']
    });
    setGameKey(Date.now());
    setGameMode('solo');
  };


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
    setBotStatus(null);
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
    return (
      <LandingScreen
        skipDraft={skipDraft}
        setSkipDraft={setSkipDraft}
        onStartSoloGame={handleStartSoloGame}
        onStartLocalGame={handleStartLocalGame}
        onEnterOnlineLobby={() => setGameMode('online_lobby')}
        onQuickRejoinOnline={handleQuickRejoinOnline}
      />
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
            key={`${gameMode}-${selectedNumPlayers}-${gameKey}`}
            playerID={activePerspective}
            isOnline={isOnline}
            isSolo={isSolo}
            botStatus={botStatus}
            playerNames={effectivePlayerNames}
            dbMasterState={dbMasterState}
            updateMasterGameState={updateMasterGameState}
            onStateChange={(state) => {
              if (state) {
                setCurrentGameState(state);
                gameLogger.handleStateChange(state);
                if (onlineContext.lobbyId && !isSolo && state.G) {
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
              : isSolo
                ? `🤖 Solo Mode (3P • vs. 2 AI)`
                : onlineContext.lobbyId
                  ? `🎮 Local Test (${selectedNumPlayers}P • Supabase Live)`
                  : `🎮 Local Test (${selectedNumPlayers}P • Local Memory)`}
          </span>
        </div>

        {/* Perspective selector is ONLY shown in Local Pass & Play; in Online and Solo play, seat is fixed */}
        {!isOnline && !isSolo ? (
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
            {isSolo
              ? '👤 Playing as: You (Seat 1 vs. Baron Vance & Inspector Vale)'
              : `👤 Playing as: ${effectivePlayerNames[onlineContext.playerIndex] || `Player ${onlineContext.playerIndex + 1}`} (Seat ${onlineContext.playerIndex + 1})`}
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
