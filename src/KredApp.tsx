import React, { useState, useCallback, useRef } from 'react';
import { useLobby } from './contexts/LobbyContext';
import LobbyScreen from './components/screens/LobbyScreen';
import WaitingRoom from './components/screens/WaitingRoom';
import GameStateSynchronizer, { GameStatePacket } from './components/GameStateSynchronizer';
import { useSupabaseActions } from './hooks/useSupabaseActions';
import App from './App';

type ActionPayload = { type: string; playerId: string; payload: any };

export default function KredApp() {
  const { lobbyId, lobbyStatus, isHost, playerIndex, playerCount, lobbyPlayers } = useLobby();
  const actions = useSupabaseActions();

  const [gameReady, setGameReady] = useState(false);

  // Refs for GameStateSynchronizer ↔ App.tsx wiring
  const getStatePacketRef = useRef<() => GameStatePacket>(() => ({} as GameStatePacket));
  const applyStatePacketRef = useRef<(packet: GameStatePacket) => void>(() => {});

  // Host action dispatcher — App.tsx registers its dispatch function here
  const actionDispatchRef = useRef<(action: ActionPayload) => void>();

  const setActionDispatch = useCallback((dispatch: (action: ActionPayload) => void) => {
    actionDispatchRef.current = dispatch;
  }, []);

  const handleRejoinComplete = useCallback(() => {
    setGameReady(true);
  }, []);

  // No lobby yet — show lobby screen
  if (!lobbyId) {
    return <LobbyScreen />;
  }

  // Lobby exists but game hasn't started — show waiting room
  if (lobbyStatus === 'WAITING') {
    return <WaitingRoom />;
  }

  // Game is active
  return (
    <>
      <GameStateSynchronizer
        getStatePacket={() => getStatePacketRef.current()}
        applyStatePacket={(packet) => applyStatePacketRef.current(packet)}
        onActionReceived={isHost ? (action) => {
          actionDispatchRef.current?.(action);
        } : undefined}
        onRejoinComplete={handleRejoinComplete}
      />
      <App
        isMultiplayer={true}
        isHost={isHost}
        playerIndex={playerIndex ?? 0}
        playerCount={playerCount ?? 3}
        playerNames={lobbyPlayers.map(p => p.name)}
        multiplayerActions={{
          createGame: async () => {},
          joinGame: async () => {},
          startGame: async () => {},
          selectDraftTile: actions.selectDraftTile,
          playTile: actions.playTile,
          movePiece: actions.movePiece,
          endTurn: actions.endTurn,
          acceptTile: actions.acceptTile,
          rejectTile: actions.rejectTile,
          viewTilePrivate: actions.viewTilePrivate,
          initiateChallenge: actions.initiateChallenge,
          passChallenge: actions.passChallenge,
          selectAdvantageTiles: actions.selectAdvantageTiles,
          purchaseAdvantage: actions.purchaseAdvantage,
          receiverRewardChoice: actions.receiverRewardChoice,
          purchaseBureaucracy: actions.purchaseBureaucracy,
          joinAsSpectator: async () => {},
        }}
        getStatePacketRef={getStatePacketRef}
        applyStatePacketRef={applyStatePacketRef}
        setActionDispatch={isHost ? setActionDispatch : undefined}
      />
    </>
  );
}
