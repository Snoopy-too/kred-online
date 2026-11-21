import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Client } from 'boardgame.io/dist/esm/react.js';
import { SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from './srcGame.js';
import { KredBoard } from './srcBoard.jsx';
import './styles/base.css';
import './styles/board.css';
import './styles/controls.css';
import './styles/hand.css';
import './styles/zoom.css';
import './index.css';

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

  const [playerNames, setPlayerNames] = useState([]);

  useEffect(() => {
    if (!matchID) return;

    let isMounted = true;
    const fetchMatchPlayers = async () => {
      try {
        const res = await fetch(`/games/${gameName}/${matchID}`);
        if (res.ok && isMounted) {
          const matchMeta = await res.json();
          if (matchMeta && matchMeta.players) {
            const rawPlayers = Array.isArray(matchMeta.players)
              ? matchMeta.players
              : Object.values(matchMeta.players);

            const names = rawPlayers.map((p, idx) => {
              if (String(idx) === String(playerID)) return localPlayerName;
              return (p && p.name) ? p.name : `Player ${idx + 1}`;
            });
            setPlayerNames(names);
          }
        }
      } catch {
        // Silent fallback
      }
    };

    fetchMatchPlayers();
    const pollInterval = setInterval(fetchMatchPlayers, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [matchID, gameName, playerID, localPlayerName]);

  const BoardgameClient = useMemo(() => {
    return Client({
      game: createKredGame(),
      board: LobbyBoardWrapper,
      multiplayer: SocketIO({ server: window.location.origin }),
      debug: false
    });
  }, []);

  return (
    <div className="kred-lobby-wrapper" style={{ width: '100%', height: '100%', minHeight: '100vh' }}>
      <BoardgameClient
        matchID={matchID}
        playerID={playerID}
        credentials={credentials}
        playerNames={playerNames}
        isOnline={false}
      />
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
