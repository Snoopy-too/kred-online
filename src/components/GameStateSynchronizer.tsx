import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';

// ============================================================================
// Types
// ============================================================================

export interface GameStatePacket {
  // Core game state
  gameState: string;
  players: any[];
  pieces: any[];
  boardTiles: any[];
  bankedTiles: any[];
  currentPlayerIndex: number;
  playerCount: number;

  // Campaign state
  playedTile: any | null;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: string[];
  tileTransaction: any | null;
  moverPlayerIndex: number | null;
  campaignRole: string | null;
  tileRevealed: boolean;
  pendingReceiverReward: boolean;
  receiverAdvanceInProgress: boolean;

  // Challenge flow
  bystanders: number[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;

  // Take advantage
  showTakeAdvantageModal: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;

  // Bureaucracy
  bureaucracyStates: any;
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;

  // Versioning
  stateVersion: number;
  lastUpdated: number;
}

export interface SyncProps {
  /** Host: returns current game state as a packet */
  getStatePacket: () => GameStatePacket;

  /** Guest: applies a received state packet */
  applyStatePacket: (packet: GameStatePacket) => void;

  /** Host: handler for guest actions from kred_game_actions table */
  onActionReceived?: (action: { type: string; playerId: string; payload: any }) => void;

  /** Called when rejoin hydration is complete */
  onRejoinComplete?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function GameStateSynchronizer({
  getStatePacket,
  applyStatePacket,
  onActionReceived,
  onRejoinComplete,
}: SyncProps) {
  const { lobbyId, isHost, isRejoining } = useLobby();

  const hostVersionRef = useRef(0);
  const lastProcessedVersionRef = useRef(0);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ==========================================================================
  // HOST: Push state to guests
  // ==========================================================================

  const pushState = useCallback(() => {
    if (!lobbyId || !isHost) return;

    const packet = getStatePacket();
    hostVersionRef.current += 1;
    packet.stateVersion = hostVersionRef.current;
    packet.lastUpdated = Date.now();

    // Channel 1: Broadcast (fast, ephemeral)
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'state',
        payload: packet,
      });
    }

    // Channel 2: DB upsert (persistent, for rejoin)
    supabase
      .from('kred_game_states')
      .upsert({
        lobby_id: lobbyId,
        phase: packet.gameState,
        state_json: packet,
        version: hostVersionRef.current,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Failed to persist game state:', error);
      });
  }, [lobbyId, isHost, getStatePacket]);

  // Debounced push — call this whenever state changes
  const debouncedPush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(pushState, 100);
  }, [pushState]);

  // ==========================================================================
  // HOST: Listen for guest actions (realtime + polling fallback)
  // ==========================================================================

  const lastProcessedActionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lobbyId || !isHost || !onActionReceived) return;

    const processAction = (action: any) => {
      // Skip already-processed actions
      if (action.id === lastProcessedActionIdRef.current) return;
      lastProcessedActionIdRef.current = action.id;
      onActionReceived({
        type: action.action_type,
        playerId: action.player_id,
        payload: action.payload,
      });
    };

    // Realtime channel
    const channel = supabase
      .channel(`kred_actions:${lobbyId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kred_game_actions', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => { processAction(payload.new); }
      )
      .subscribe();

    // Polling fallback — pick up any actions missed by realtime
    const processedIds = new Set<string>();
    const pollActions = async () => {
      const { data } = await supabase
        .from('kred_game_actions')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true });

      if (data) {
        for (const action of data) {
          if (!processedIds.has(action.id)) {
            processedIds.add(action.id);
            processAction(action);
          }
        }
      }
    };
    const interval = setInterval(pollActions, 2000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [lobbyId, isHost, onActionReceived]);

  // ==========================================================================
  // BOTH: Set up broadcast channel
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase.channel(`kred_game:${lobbyId}`, {
      config: { broadcast: { self: false } },
    });

    if (!isHost) {
      // GUEST: listen for host broadcasts
      channel.on('broadcast', { event: 'state' }, ({ payload }: { payload: GameStatePacket }) => {
        if (payload.stateVersion <= lastProcessedVersionRef.current) return;
        lastProcessedVersionRef.current = payload.stateVersion;
        applyStatePacket(payload);
      });
    }

    channel.subscribe();
    broadcastChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
      broadcastChannelRef.current = null;
    };
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // GUEST: Postgres changes subscription (secondary channel)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

    const channel = supabase
      .channel(`kred_state_changes:${lobbyId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kred_game_states', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          const row = payload.new as any;
          const packet = row.state_json as GameStatePacket;
          if (packet.stateVersion <= lastProcessedVersionRef.current) return;
          lastProcessedVersionRef.current = packet.stateVersion;
          applyStatePacket(packet);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // GUEST: Polling fallback (3s)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

    const poll = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .single();

      if (data && data.version > lastProcessedVersionRef.current) {
        lastProcessedVersionRef.current = data.version;
        applyStatePacket(data.state_json as GameStatePacket);
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [lobbyId, isHost, applyStatePacket]);

  // ==========================================================================
  // REJOIN: Hydrate from DB snapshot
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || !isRejoining) return;

    const hydrate = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .single();

      if (data) {
        const packet = data.state_json as GameStatePacket;
        lastProcessedVersionRef.current = data.version;
        hostVersionRef.current = data.version;
        applyStatePacket(packet);
      }

      onRejoinComplete?.();
    };

    hydrate();
  }, [lobbyId, isRejoining, applyStatePacket, onRejoinComplete]);

  // ==========================================================================
  // Expose debouncedPush for host to call on state changes
  // ==========================================================================

  useEffect(() => {
    if (isHost) {
      (window as any).__kred_pushState = debouncedPush;
    }
    return () => {
      if (isHost) delete (window as any).__kred_pushState;
    };
  }, [isHost, debouncedPush]);

  return null;
}
