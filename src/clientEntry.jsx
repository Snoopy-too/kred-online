import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/dist/esm/react.js';
import { SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from './srcGame.js';
import { KredBoard } from './srcBoard.jsx';
import { TableStagingOverlay } from './components/TableStagingOverlay.jsx';
import { setModalPortalRoot } from './components/board/AdminModal.jsx';
import { GameLogger } from '../diagnostics/gameLogger.js';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel.jsx';
import './styles/base.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/hand.css';
import './index.css';

function isUserAdmin(user) {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;
  if (user.is_super_admin === true || user.isSuperAdmin === true) return true;
  if (user.admin_type === 'super' || user.admin_type === 'admin') return true;
  if (typeof user.role === 'string' && ['admin', 'administrator'].includes(user.role.toLowerCase())) return true;
  if (Array.isArray(user.roles) && user.roles.some((r) => ['admin', 'administrator', 'administrators'].includes(String(r).toLowerCase()))) return true;
  if (Array.isArray(user.groups) && user.groups.some((g) => ['admin', 'administrator', 'administrators'].includes(String(g).toLowerCase()))) return true;
  return false;
}

function isBotSeat(playerMeta) {
  return Boolean(playerMeta?.data?.isBot || (playerMeta?.name && playerMeta.name.endsWith('(Bot)')));
}

function GameBoardWrapper(props) {
  const notifiedRef = useRef(false);
  const isOver = Boolean(props.ctx?.gameover || props.G?.winner);

  useEffect(() => {
    if (props.gameLogger && props.G && props.ctx) {
      props.gameLogger.handleStateChange({ G: props.G, ctx: props.ctx });
    }
  }, [props.gameLogger, props.G, props.ctx]);

  useEffect(() => {
    if (isOver && !notifiedRef.current) {
      notifiedRef.current = true;
      if (typeof window.setMatchGameOver === 'function') {
        window.setMatchGameOver(true);
      }
    }
  }, [isOver]);

  return <KredBoard {...props} />;
}

function KredGameClient({ config }) {
  const matchID = config && (config.matchID || config.matchId) ? String(config.matchID || config.matchId) : '';
  const playerID = config && config.playerID !== undefined && config.playerID !== null ? String(config.playerID) : '0';
  const credentials = config && config.credentials ? config.credentials : '';
  const gameName = config && config.gameName ? config.gameName : 'kred';
  const localPlayerName = config && config.playerName ? config.playerName : `Player ${parseInt(playerID, 10) + 1}`;

  const [isAdmin, setIsAdmin] = useState(() => isUserAdmin(window.tfdNavbar?.currentUser));
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const [seats, setSeats] = useState([]);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [matchExpired, setMatchExpired] = useState(false);
  const [isStartingBots, setIsStartingBots] = useState(false);

  useEffect(() => {
    let active = true;
    const syncAdmin = (e) => {
      const user = e?.detail?.user ?? window.tfdNavbar?.currentUser ?? null;
      if (isUserAdmin(user)) setIsAdmin(true);
    };
    window.addEventListener('tfd-auth-change', syncAdmin);

    // Server-authoritative admin check (same check tfd-lobby uses to expose devTools)
    fetch('/api/games')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data.games)) return;
        const kredMeta = data.games.find((g) => g.id === gameName || g.id === 'kred');
        if (kredMeta && Array.isArray(kredMeta.devTools)) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      window.removeEventListener('tfd-auth-change', syncAdmin);
    };
  }, [gameName]);

  const fetchMatchPlayers = useCallback(async () => {
    if (!matchID) return null;
    try {
      const res = await fetch(`/games/${gameName}/${matchID}`);
      if (res.status === 404) {
        setMatchExpired(true);
        return null;
      }
      if (!res.ok) return null;
      const matchMeta = await res.json();
      if (matchMeta && matchMeta.players) {
        const rawPlayers = Array.isArray(matchMeta.players)
          ? matchMeta.players
          : Object.values(matchMeta.players);

        const selfRaw = rawPlayers.find((p, idx) => String(p?.id ?? idx) === String(playerID));
        if (rawPlayers.length < 3 || !selfRaw || !selfRaw.name) {
          setMatchExpired(true);
          return null;
        }

        const parsedSeats = rawPlayers.map((p, idx) => {
          const id = String(p?.id ?? idx);
          const isSelf = id === String(playerID);
          const occupied = Boolean(isSelf || (p && p.name));
          const bot = !isSelf && isBotSeat(p);
          const name = isSelf ? localPlayerName : (p && p.name ? p.name : '');
          return { id, name, occupied, isSelf, isBot: bot };
        });

        setSeats(parsedSeats);
        setMetaLoaded(true);
        return parsedSeats;
      }
    } catch {
      // Silent fallback
    }
    return null;
  }, [matchID, gameName, playerID, localPlayerName]);

  const allSeatsFilled = metaLoaded && seats.length > 0 && seats.every((s) => s.occupied);

  useEffect(() => {
    if (!matchID || allSeatsFilled) return;
    fetchMatchPlayers();
    const pollInterval = setInterval(fetchMatchPlayers, 2000);
    return () => clearInterval(pollInterval);
  }, [matchID, allSeatsFilled, fetchMatchPlayers]);

  const openSeats = useMemo(() => seats.filter((s) => !s.occupied), [seats]);
  const botIds = useMemo(
    () => seats.filter((s) => s.isBot).map((s) => s.id),
    [seats]
  );
  const playerNames = useMemo(
    () => seats.map((s, idx) => (s.name ? s.name.replace(/\s*\(Bot\)$/, '') : `Player ${idx + 1}`)),
    [seats]
  );

  const firstHumanSeat = seats.find((s) => s.occupied && !s.isBot);
  const isHost = Boolean(firstHumanSeat && firstHumanSeat.isSelf);
  const numPlayers = seats.length || 3;

  const gameLogger = useMemo(
    () => (isAdmin ? new GameLogger(matchID || 'kred', numPlayers) : null),
    [isAdmin, matchID, numPlayers]
  );

  const handleToggleCalibration = useCallback(() => {
    setCalibrationMode((prev) => {
      const next = !prev;
      if (window.setCalibrationMode) window.setCalibrationMode(next);
      return next;
    });
  }, []);

  const handleToggleDiagnostics = useCallback(() => {
    setShowDiagnostics((prev) => !prev);
  }, []);

  const handleStartWithBots = async () => {
    if (isStartingBots || !matchID) return;
    setIsStartingBots(true);
    try {
      await fetch(`/api/kred/${encodeURIComponent(matchID)}/start-bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      await fetchMatchPlayers();
    } finally {
      setIsStartingBots(false);
    }
  };

  const kredGame = useMemo(() => createKredGame(), []);

  const BoardgameClient = useMemo(() => {
    return Client({
      game: kredGame,
      board: GameBoardWrapper,
      multiplayer: SocketIO({ server: window.location.origin, socketOpts: { forceNew: true } }),
      debug: false
    });
  }, [kredGame]);

  if (matchExpired) {
    return (
      <div className="kred-game-root" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="turn-builder-card" style={{ maxWidth: '420px', textAlign: 'center', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px', color: 'var(--accent-gold)' }}>Match Ended</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            This match is no longer active on the server. Start a new match from the lobby.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (typeof window.abandonActiveMatch === 'function') window.abandonActiveMatch();
              else if (typeof window.exitToLobby === 'function') window.exitToLobby();
            }}
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  const showWaiting = metaLoaded && !allSeatsFilled;

  return (
    <div className="kred-game-root" ref={setModalPortalRoot}>
      <BoardgameClient
        matchID={matchID}
        playerID={playerID}
        credentials={credentials}
        playerNames={playerNames}
        isOnline={false}
        isAdmin={isAdmin}
        calibrationMode={calibrationMode}
        showDiagnostics={showDiagnostics}
        onToggleCalibration={handleToggleCalibration}
        onToggleDiagnostics={handleToggleDiagnostics}
        gameLogger={gameLogger}
        botIds={botIds}
      />
      {isAdmin && gameLogger && (
        <DiagnosticsPanel
          gameLogger={gameLogger}
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
      {showWaiting && (
        <TableStagingOverlay
          seats={seats}
          openCount={openSeats.length}
          isHost={isHost}
          isStarting={isStartingBots}
          onStartWithBots={handleStartWithBots}
        />
      )}
    </div>
  );
}

let activeRoot = null;

export function unmountKredClient() {
  if (activeRoot) {
    try {
      activeRoot.unmount();
    } catch {
      // Ignored
    }
    activeRoot = null;
  }
}

export function mountKredClient(container, matchConfig) {
  if (!container || typeof container === 'string') {
    container = document.getElementById(container || 'boardMountContainer');
  }
  if (!container) return;

  unmountKredClient();
  container.innerHTML = '';
  activeRoot = createRoot(container);
  activeRoot.render(<KredGameClient config={matchConfig} />);
}

window.GameModules = window.GameModules || {};
window.GameModules['kred'] = {
  mountClient: mountKredClient,
  unmountClient: unmountKredClient
};
window.mountKredClient = mountKredClient;
