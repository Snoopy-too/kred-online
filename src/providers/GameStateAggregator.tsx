// src/providers/GameStateAggregator.tsx
import { useMemo, useRef, useEffect, MutableRefObject } from "react";
import { usePhase } from "./PhaseProvider";
import GameStateSynchronizer, { GameStatePacket } from "../components/GameStateSynchronizer";

/**
 * Props that come from state slices NOT YET migrated to providers.
 * Each one will be removed as its provider is introduced in Step 7.
 */
export interface AggregatorLegacyProps {
  // Roster / Pieces
  players: any[];
  pieces: any[];
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
  applyStatePacket: (packet: GameStatePacket) => void;
  onActionReceived?: MutableRefObject<((action: { type: string; playerId: string; payload: any }) => void) | undefined>;
  onRejoinComplete?: () => void;
  pushStateRef?: MutableRefObject<(() => void) | null>;
}

export function GameStateAggregator(props: GameStateAggregatorProps) {
  const phase = usePhase();

  // Re-map props to avoid 'props.' prefix in useMemo dependencies
  const {
    players, pieces, playerCount,
    boardTiles, bankedTiles,
    playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, tileTransaction, tileRevealed, pendingReceiverReward, receiverAdvanceInProgress,
    bystanders, bystanderIndex, challengeOrder, currentChallengerIndex, tileRejected, showChallengeRevealModal, challengedTile,
    showTakeAdvantageModal, takeAdvantageChallengerId, takeAdvantageChallengerCredibility,
    bonusMovePlayerId, showBonusMoveModal, piecesBeforeBonusMove,
    challengeResultMessage, challengeResultMessagePlayerId, pendingChallengerReward,
    serverAlert,
    bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex
  } = props;

  const packet = useMemo<GameStatePacket>(
    () => ({
      // Phase-owned
      gameState: phase.gameState,
      currentPlayerIndex: phase.currentPlayerIndex,
      moverPlayerIndex: phase.moverPlayerIndex,
      campaignRole: phase.campaignRole,

      // Legacy prop-owned
      players,
      pieces,
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

      // Versioning (handled by Synchronizer, but typed in Packet)
      stateVersion: 0,
      lastUpdated: 0,
    }),
    [
      phase.gameState, phase.currentPlayerIndex, phase.moverPlayerIndex, phase.campaignRole,
      players, pieces, playerCount,
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

  // Sync expects a STABLE function that returns the LATEST packet.
  const packetRef = useRef(packet);
  useEffect(() => {
    packetRef.current = packet;
  }, [packet]);

  const getStatePacket = useRef(() => packetRef.current);

  return (
    <GameStateSynchronizer
      getStatePacket={getStatePacket.current}
      applyStatePacket={props.applyStatePacket}
      onActionReceived={props.onActionReceived}
      onRejoinComplete={props.onRejoinComplete}
      pushStateRef={props.pushStateRef}
    />
  );
}
