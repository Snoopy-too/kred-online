import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLobby } from './contexts/LobbyContext';
import LobbyScreen from './components/screens/LobbyScreen';
import WaitingRoom from './components/screens/WaitingRoom';
import { GameStatePacket } from './components/GameStateSynchronizer';
import type { StatePacket } from './sync/packet';
import { GameStateAggregator } from './providers/GameStateAggregator';
import { useSupabaseActions } from './hooks/useSupabaseActions';
import App from './App';
import { PerfOverlay } from './perf';
import { DiagnosticsProvider, useDiagnostics } from './diagnostics';

import { GameProviders } from './providers/GameProviders';

type ActionPayload = { type: string; playerId: string; payload: any };

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

function KredAppInner() {
  const {
    lobbyId, lobbyPin, lobbyStatus, isHost, playerIndex, playerCount,
    lobbyPlayers, skipDraft, skipCampaign, diagnosticEnabled,
  } = useLobby();
  const actions = useSupabaseActions();

  const [gameReady, setGameReady] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [legacyState, setLegacyState] = useState<any>(null);

  // Refs for GameStateSynchronizer ↔ App.tsx wiring
  const applyStatePacketRef = useRef<(packet: GameStatePacket) => void>(() => { });
  const pushStateRef = useRef<(() => void) | null>(null);
  const synchronizerSendRef = useRef<((packet: StatePacket) => void) | null>(null);

  // Host action dispatcher — App.tsx registers its dispatch function here
  const actionDispatchRef = useRef<(action: ActionPayload) => void>();

  const setActionDispatch = useCallback((dispatch: (action: ActionPayload) => void) => {
    actionDispatchRef.current = dispatch;
  }, []);

  const handleRejoinComplete = useCallback(() => {
    setGameReady(true);
  }, []);

  const handlePhaseChange = useCallback((phase: string) => {
    setCurrentPhase(phase);
  }, []);

  // Wire host's local emitAction to the App.tsx action dispatch
  useEffect(() => {
    if (isHost) {
      actions.setActionHandler((action) => {
        actionDispatchRef.current?.(action);
      });
    }
  }, [isHost, actions.setActionHandler]);

  const self = lobbyPlayers.find(p => p.playerIndex === playerIndex) ?? null;
  const host = lobbyPlayers.find(p => p.isHost) ?? null;

  return (
    <DiagnosticsProvider
      lobbyId={lobbyId}
      isHost={isHost}
      playerIndex={playerIndex}
      playerName={self?.name ?? null}
      pin={lobbyPin}
      playerCount={playerCount}
      playerNames={lobbyPlayers.map(p => p.name)}
      hostName={host?.name ?? null}
      diagnosticEnabled={diagnosticEnabled}
      currentPhase={currentPhase}
    >
      <PhaseLogger currentPhase={currentPhase} />

      {/* No lobby yet — show lobby screen */}
      {!lobbyId && <LobbyScreen />}

      {/* Lobby exists but game hasn't started — show waiting room */}
      {lobbyStatus === 'WAITING' && <WaitingRoom />}

      {/* Game is active */}
      {lobbyId && lobbyStatus !== 'WAITING' && (
        <GameProviders>
          {legacyState && (
            <GameStateAggregator
              {...legacyState}
              applyStatePacket={applyStatePacketRef.current}
              onActionReceived={isHost ? actionDispatchRef : undefined}
              onRejoinComplete={handleRejoinComplete}
              pushStateRef={pushStateRef}
              synchronizerSendRef={synchronizerSendRef}
            />
          )}
          <App
            isMultiplayer={true}
            isHost={isHost}
            playerIndex={playerIndex ?? 0}
            playerCount={playerCount ?? 3}
            playerNames={lobbyPlayers.map(p => p.name)}
            skipDraft={isHost ? skipDraft : false}
            skipCampaign={isHost ? skipCampaign : false}
            multiplayerActions={{
              createGame: async () => { },
              joinGame: async () => { },
              startGame: async () => { },
              selectDraftTile: actions.selectDraftTile,
              playTile: actions.playTile,
              movePiece: actions.movePiece,
              endTurn: actions.endTurn,
              acceptTile: actions.acceptTile,
              rejectTile: actions.rejectTile,
              viewTilePrivate: actions.viewTilePrivate,
              initiateChallenge: actions.initiateChallenge,
              passChallenge: actions.passChallenge,
              continueAfterChallengeReveal: actions.continueAfterChallengeReveal,
              completeBonusMove: actions.completeBonusMove,
              completeCorrection: actions.completeCorrection,
              selectAdvantageTiles: actions.selectAdvantageTiles,
              purchaseAdvantage: actions.purchaseAdvantage,
              declineAdvantage: actions.declineAdvantage,
              advantageYes: actions.advantageYes,
              advantageRecover: actions.advantageRecover,
              advantagePurchaseMove: actions.advantagePurchaseMove,
              advantageConfirmTiles: actions.advantageConfirmTiles,
              advantageCancelTiles: actions.advantageCancelTiles,
              advantageSelectAction: actions.advantageSelectAction,
              advantageResetAction: actions.advantageResetAction,
              advantageDoneAction: actions.advantageDoneAction,
              advantagePromote: actions.advantagePromote,
              receiverRewardChoice: actions.receiverRewardChoice,
              purchaseBureaucracy: actions.purchaseBureaucracy,
              purchaseBureaucracyDone: actions.purchaseBureaucracyDone,
              purchaseBureaucracyReset: actions.purchaseBureaucracyReset,
              promoteBureaucracyPiece: actions.promoteBureaucracyPiece,
              bureaucracyComplete: actions.bureaucracyComplete,
              resetTurn: actions.resetTurn,
              resetPiecesCorrection: actions.resetPiecesCorrection,
              joinAsSpectator: async () => { },
            }}
            onLegacyStateChange={setLegacyState}
            applyStatePacketRef={applyStatePacketRef}
            pushStateRef={pushStateRef}
            setActionDispatch={isHost ? setActionDispatch : undefined}
            onPhaseChange={handlePhaseChange}
            hydrated={gameReady}
          />
        </GameProviders>
      )}

      <PerfOverlay />
    </DiagnosticsProvider>
  );
}

export default function KredApp() {
  return <KredAppInner />;
}
