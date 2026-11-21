import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/dist/esm/react.js';
import { SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from './srcGame.js';
import { KredBoard } from './srcBoard.jsx';
import { createSoloController, getBotPersona } from './ai/index.js';
import { LobbyWaitingOverlay } from './components/LobbyWaitingOverlay.jsx';
import './styles/base.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/hand.css';
import './index.css';

function isBotSeat(playerMeta) {
  return Boolean(playerMeta?.data?.isBot || (playerMeta?.name && playerMeta.name.endsWith('(Bot)')));
}

function loadSavedBotCreds(matchID) {
  if (!matchID) return {};
  try {
    const raw = sessionStorage.getItem(`kred_bots_${matchID}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function LobbyBoardWrapper(props) {
  const notifiedRef = useRef(false);
  const isOver = Boolean(props.ctx?.gameover || props.G?.winner);

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

function KredLobbyClient({ config }) {
  const matchID = config && (config.matchID || config.matchId) ? String(config.matchID || config.matchId) : '';
  const playerID = config && config.playerID !== undefined && config.playerID !== null ? String(config.playerID) : '0';
  const credentials = config && config.credentials ? config.credentials : '';
  const gameName = config && config.gameName ? config.gameName : 'kred';
  const localPlayerName = config && config.playerName ? config.playerName : `Player ${parseInt(playerID, 10) + 1}`;

  const [seats, setSeats] = useState([]);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [isStartingBots, setIsStartingBots] = useState(false);
  const [localBotCreds, setLocalBotCreds] = useState(() => loadSavedBotCreds(matchID));
  const [botStatus, setBotStatus] = useState(null);

  const fetchMatchPlayers = useCallback(async () => {
    if (!matchID) return null;
    try {
      const res = await fetch(`/games/${gameName}/${matchID}`);
      if (!res.ok) return null;
      const matchMeta = await res.json();
      if (matchMeta && matchMeta.players) {
        const rawPlayers = Array.isArray(matchMeta.players)
          ? matchMeta.players
          : Object.values(matchMeta.players);

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
    () => seats.filter((s) => s.isBot || Boolean(localBotCreds[s.id])).map((s) => s.id),
    [seats, localBotCreds]
  );
  const playerNames = useMemo(
    () => seats.map((s, idx) => (s.name ? s.name.replace(/\s*\(Bot\)$/, '') : getBotPersona(idx).name)),
    [seats]
  );

  const firstHumanSeat = seats.find((s) => s.occupied && !s.isBot);
  const isHost = Boolean(firstHumanSeat && firstHumanSeat.isSelf);
  const numPlayers = seats.length || 3;

  const handleStartWithBots = async () => {
    if (isStartingBots || !matchID) return;
    setIsStartingBots(true);
    try {
      const latestSeats = (await fetchMatchPlayers()) || seats;
      const toFill = latestSeats.filter((s) => !s.occupied);
      const creds = { ...localBotCreds };

      for (const seat of toFill) {
        const persona = getBotPersona(seat.id);
        try {
          const res = await fetch(`/games/${gameName}/${matchID}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerID: seat.id,
              playerName: `${persona.name} (Bot)`,
              data: { isBot: true }
            })
          });
          if (res.ok) {
            const joinData = await res.json();
            if (joinData && joinData.playerCredentials) {
              creds[seat.id] = joinData.playerCredentials;
            }
          }
        } catch {
          // If a real player took the seat concurrently, skip it
        }
      }

      if (Object.keys(creds).length > 0) {
        try {
          sessionStorage.setItem(`kred_bots_${matchID}`, JSON.stringify(creds));
        } catch {
          // Ignore storage quota errors
        }
        setLocalBotCreds(creds);
      }
      await fetchMatchPlayers();
    } finally {
      setIsStartingBots(false);
    }
  };

  const kredGame = useMemo(() => createKredGame(), []);

  useEffect(() => {
    const managedBotIds = Object.keys(localBotCreds);
    if (!matchID || managedBotIds.length === 0 || !metaLoaded) {
      setBotStatus(null);
      return undefined;
    }

    const controller = createSoloController({
      game: kredGame,
      matchID,
      numPlayers,
      botIds: managedBotIds,
      credentialsByBot: localBotCreds,
      multiplayer: SocketIO({ server: window.location.origin }),
      onStatusChange: setBotStatus
    });

    return () => {
      controller.stop();
    };
  }, [kredGame, matchID, numPlayers, localBotCreds, metaLoaded]);

  const BoardgameClient = useMemo(() => {
    return Client({
      game: kredGame,
      board: LobbyBoardWrapper,
      multiplayer: SocketIO({ server: window.location.origin }),
      debug: false
    });
  }, [kredGame]);

  const showWaiting = metaLoaded && !allSeatsFilled;

  return (
    <div className="kred-lobby-wrapper" style={{ width: '100%', minHeight: '100%' }}>
      <BoardgameClient
        matchID={matchID}
        playerID={playerID}
        credentials={credentials}
        playerNames={playerNames}
        isOnline={false}
        isLobby={true}
        botIds={botIds}
        botStatus={botStatus}
      />
      {showWaiting && (
        <LobbyWaitingOverlay
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
  activeRoot.render(<KredLobbyClient config={matchConfig} />);
}

window.GameModules = window.GameModules || {};
window.GameModules['kred'] = {
  mountClient: mountKredClient,
  unmountClient: unmountKredClient
};
window.mountKredClient = mountKredClient;
