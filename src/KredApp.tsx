import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLobby } from './contexts/LobbyContext';
import LobbyScreen from './components/screens/LobbyScreen';
import WaitingRoom from './components/screens/WaitingRoom';
import GameStateSynchronizer, { GameStatePacket } from './components/GameStateSynchronizer';
import { useSupabaseActions } from './hooks/useSupabaseActions';
import App from './App';
import { PerfOverlay } from './perf';
import { DiagnosticsProvider, useDiagnostics } from './diagnostics';

function PhaseLogger({ currentPhase }: { currentPhase: string | null }) {
  const logDiag = useDiagnostics();
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentPhase !== prevRef.current) {
      logDiag({
        category: 'phase',
        event_type: 'PHASE_CHANGE',
        payload: { from: prevRef.current, to: currentPhase },
      });
      prevRef.current = currentPhase;
    }
  }, [currentPhase, logDiag]);
  return null;
}

type ActionPayload = { type: string; playerId: string; payload: any };

export default function KredApp() {
  const lobby = useLobby();
  const { lobbyId, lobbyStatus, isHost, playerIndex, playerCount, lobbyPlayers, skipDraft } = lobby;
  const actions = useSupabaseActions();
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  const [gameReady, setGameReady] = useState(false);

  // Refs for GameStateSynchronizer ↔ App.tsx wiring
  const getStatePacketRef = useRef<() => GameStatePacket>(() => ({} as GameStatePacket));
  const applyStatePacketRef = useRef<(packet: GameStatePacket) => void>(() => {});
  const pushStateRef = useRef<(() => void) | null>(null);

  // Host action dispatcher — App.tsx registers its dispatch function here
  const actionDispatchRef = useRef<(action: ActionPayload) => void>();

  const setActionDispatch = useCallback((dispatch: (action: ActionPayload) => void) => {
    actionDispatchRef.current = dispatch;
  }, []);

  const handleRejoinComplete = useCallback(() => {
    setGameReady(true);
  }, []);

  // Wire host's local emitAction to the App.tsx action dispatch
  useEffect(() => {
    if (isHost) {
      actions.setActionHandler((action) => {
        actionDispatchRef.current?.(action);
      });
    }
  }, [isHost, actions.setActionHandler]);

  const selfPlayer = lobbyPlayers.find(p => p.playerIndex === playerIndex) ?? null;
  const hostPlayer = lobbyPlayers.find(p => p.isHost) ?? null;

  return (
    <DiagnosticsProvider
      lobbyId={lobbyId}
      isHost={isHost}
      playerIndex={playerIndex}
      playerName={selfPlayer?.name ?? null}
      pin={lobby.lobbyPin}
      playerCount={playerCount}
      playerNames={lobbyPlayers.map(p => p.name)}
      hostName={hostPlayer?.name ?? null}
      diagnosticEnabled={lobby.diagnosticEnabled}
      currentPhase={currentPhase}
    >
      {/* No lobby yet — show lobby screen */}
      {!lobbyId && <LobbyScreen />}

      {/* Lobby exists but game hasn't started — show waiting room */}
      {lobbyStatus === 'WAITING' && <WaitingRoom />}

      {/* Game is active */}
      {lobbyId && lobbyStatus !== 'WAITING' && (
        <>
          <GameStateSynchronizer
            getStatePacket={() => getStatePacketRef.current()}
            applyStatePacket={(packet) => applyStatePacketRef.current(packet)}
            onActionReceived={isHost ? actionDispatchRef : undefined}
            onRejoinComplete={handleRejoinComplete}
            pushStateRef={pushStateRef}
          />
          <App
            isMultiplayer={true}
            isHost={isHost}
            playerIndex={playerIndex ?? 0}
            playerCount={playerCount ?? 3}
            playerNames={lobbyPlayers.map(p => p.name)}
            skipDraft={isHost ? skipDraft : false}
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
              completeBonusMove: actions.completeBonusMove,
              completeCorrection: actions.completeCorrection,
              selectAdvantageTiles: actions.selectAdvantageTiles,
              purchaseAdvantage: actions.purchaseAdvantage,
              receiverRewardChoice: actions.receiverRewardChoice,
              purchaseBureaucracy: actions.purchaseBureaucracy,
              joinAsSpectator: async () => {},
            }}
            getStatePacketRef={getStatePacketRef}
            applyStatePacketRef={applyStatePacketRef}
            pushStateRef={pushStateRef}
            setActionDispatch={isHost ? setActionDispatch : undefined}
            onPhaseChange={setCurrentPhase}
          />
          <PhaseLogger currentPhase={currentPhase} />
        </>
      )}

      <PerfOverlay />
    </DiagnosticsProvider>
  );
}
