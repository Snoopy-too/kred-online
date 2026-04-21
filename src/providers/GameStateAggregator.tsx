// src/providers/GameStateAggregator.tsx
import { useEffect, useMemo, useRef, MutableRefObject } from "react";
import { usePhase } from "./PhaseProvider";
import { useRoster } from "./RosterProvider";
import GameStateSynchronizer from "../components/GameStateSynchronizer";
import {
  buildPacket,
  shouldSendFull,
  FullState,
  StatePacket,
} from "../sync/packet";
import { SYNC_DELTAS, FULL_SNAPSHOT_HEARTBEAT_N } from "../sync/flags";
import { incrementCounter, recordMetric } from "../perf";

/**
 * Props that come from state slices NOT YET migrated to providers.
 * Each one will be removed as its provider is introduced in Step 7.
 */
export interface AggregatorLegacyProps {
  // Roster / Pieces (migrated)
  playerCount: number;

  // Board
  boardTiles: any[];
  bankedTiles: any[];

  // Campaign
  playedTile: any | null;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: string[];
  tileTransaction: any | null;
  tileRevealed: boolean;
  pendingReceiverReward: boolean;
  receiverAdvanceInProgress: boolean;

  // Challenge flow
  bystanders: number[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;
  showChallengeRevealModal: boolean;
  challengedTile: { id: number; url: string } | null;

  // Take advantage
  showTakeAdvantageModal: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;

  // Bonus Move
  bonusMovePlayerId: number | null;
  showBonusMoveModal: boolean;
  piecesBeforeBonusMove: any[];

  // Pending Actions
  challengeResultMessage: string;
  challengeResultMessagePlayerId: number | null;
  pendingChallengerReward: any | null;

  // Server Alerts
  serverAlert: any | null;

  // Bureaucracy
  bureaucracyStates: any;
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
}

interface GameStateAggregatorProps extends AggregatorLegacyProps {
  applyStatePacket: (packet: FullState) => void;
  onActionReceived?: MutableRefObject<((action: { type: string; playerId: string; payload: any }) => void) | undefined>;
  onRejoinComplete?: () => void;
  pushStateRef?: MutableRefObject<(() => void) | null>;
  synchronizerSendRef?: MutableRefObject<((packet: StatePacket) => void) | null>;
}

export function GameStateAggregator(props: GameStateAggregatorProps) {
  const phase = usePhase();
  const roster = useRoster();

  // Re-map props to avoid 'props.' prefix in useMemo dependencies
  const {
    playerCount,
    boardTiles, bankedTiles,
    playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, tileTransaction, tileRevealed, pendingReceiverReward, receiverAdvanceInProgress,
    bystanders, bystanderIndex, challengeOrder, currentChallengerIndex, tileRejected, showChallengeRevealModal, challengedTile,
    showTakeAdvantageModal, takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
    challengeResultMessage, challengeResultMessagePlayerId, pendingChallengerReward,
    serverAlert,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex
  } = props;

  const fullState: FullState = useMemo(
    () => ({
      // Phase-owned
      gameState: phase.gameState,
      currentPlayerIndex: phase.currentPlayerIndex,
      moverPlayerIndex: phase.moverPlayerIndex,
      campaignRole: phase.campaignRole,

      // Roster-owned
      players: roster.players,
      pieces: roster.pieces,

      // Legacy prop-owned
      playerCount,
      boardTiles,
      bankedTiles,
      playedTile,
      hasPlayedTileThisTurn,
      movedPiecesThisTurn,
      tileTransaction,
      tileRevealed,
      pendingReceiverReward,
      receiverAdvanceInProgress,
      bystanders,
      bystanderIndex,
      challengeOrder,
      currentChallengerIndex,
      tileRejected,
      showChallengeRevealModal,
      challengedTile,
      showTakeAdvantageModal,
      takeAdvantageChallengerId,
      takeAdvantageChallengerCredibility,
      bonusMovePlayerId,
      showBonusMoveModal,
      piecesBeforeBonusMove,
      challengeResultMessage,
      challengeResultMessagePlayerId,
      pendingChallengerReward,
      serverAlert,
      bureaucracyStates,
      bureaucracyTurnOrder,
      currentBureaucracyPlayerIndex,
    }),
    [
      phase.gameState, phase.currentPlayerIndex, phase.moverPlayerIndex, phase.campaignRole,
      roster.players, roster.pieces,
      playerCount,
      boardTiles, bankedTiles,
      playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, tileTransaction, tileRevealed, pendingReceiverReward, receiverAdvanceInProgress,
      bystanders, bystanderIndex, challengeOrder, currentChallengerIndex, tileRejected, showChallengeRevealModal, challengedTile,
      showTakeAdvantageModal, takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
      bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
      challengeResultMessage, challengeResultMessagePlayerId, pendingChallengerReward,
      serverAlert,
      bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex
    ]
  );

  const prevFullRef = useRef<FullState | null>(null);
  const versionRef = useRef(0);
  const pushCountRef = useRef(0);
  const lastPhaseRef = useRef<string | null>(null);

  // Imperative packet producer exposed to the synchronizer.
  // Called on a debounce from inside the synchronizer (same 100ms as today).
  useEffect(() => {
    if (!props.pushStateRef) return;
    props.pushStateRef.current = () => {
      const prev = prevFullRef.current;
      const phaseChanged = lastPhaseRef.current !== phase.gameState;
      const rejoin = false; // rejoin hydration uses a dedicated path, not this function
      const nextV = versionRef.current + 1;

      let packet: StatePacket;
      if (SYNC_DELTAS) {
        const forceFull = shouldSendFull(
          pushCountRef.current,
          FULL_SNAPSHOT_HEARTBEAT_N,
          phaseChanged,
          rejoin,
        );
        packet = buildPacket({
          prev,
          next: fullState,
          prevVersion: versionRef.current,
          nextVersion: nextV,
          ts: Date.now(),
          forceFull,
        });
      } else {
        packet = { kind: "full", v: nextV, ts: Date.now(), state: fullState };
      }

      // Perf accounting
      if (packet.kind === "full") {
        incrementCounter("sync.full.sent");
      } else {
        incrementCounter("sync.delta.sent");
        recordMetric("sync.delta.patchKeys", Object.keys(packet.patch).length);
      }

      // Hand to the synchronizer's internal send function
      props.synchronizerSendRef?.current?.(packet);

      // Record for next diff
      prevFullRef.current = fullState;
      versionRef.current = nextV;
      pushCountRef.current += 1;
      lastPhaseRef.current = phase.gameState;
    };
  }, [fullState, phase.gameState, props.pushStateRef, props.synchronizerSendRef]);

  useEffect(() => {
    // Delegate to synchronizer's debounced pushState via pushStateRef.
    if (props.pushStateRef?.current) {
      props.pushStateRef.current();
    }
  }, [fullState, props.pushStateRef]);

  return (
    <GameStateSynchronizer
      applyStatePacket={props.applyStatePacket}
      onActionReceived={props.onActionReceived}
      onRejoinComplete={props.onRejoinComplete}
      pushStateRef={props.pushStateRef}
      synchronizerSendRef={props.synchronizerSendRef}
    />
  );
}
