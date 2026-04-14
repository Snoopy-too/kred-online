import { useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';
import { recordMetric, incrementCounter } from '../perf';

const PERSIST_THROTTLE_MS = 500;

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

  // Bonus Move
  bonusMovePlayerId: number | null;
  showBonusMoveModal: boolean;
  piecesBeforeBonusMove: any[];

  // Pending Actions
  challengeResultMessage: string;
  challengeResultMessagePlayerId: number | null;
  pendingChallengerReward: any | null;

  // Server Alerts
  serverAlert: {
    id: number;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
    playerId: number | null;
  } | null;

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

  /** Host: ref to handler for guest actions from kred_game_actions table */
  onActionReceived?: MutableRefObject<((action: { type: string; playerId: string; payload: any }) => void) | undefined>;

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
  const lastBroadcastReceiptRef = useRef<number>(Date.now());
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPersistPacketRef = useRef<GameStatePacket | null>(null);
  const lastPersistedVersionRef = useRef<number>(0);
  const lastPersistedPhaseRef = useRef<string | null>(null);
  const lastSeenActionAtRef = useRef<string>(new Date(0).toISOString());

  // ==========================================================================
  // HOST: Push state to guests
  // ==========================================================================

  const flushPersist = useCallback(async (packet: GameStatePacket) => {
    if (!lobbyId) return;
    if (packet.stateVersion <= lastPersistedVersionRef.current) return;
    lastPersistedVersionRef.current = packet.stateVersion;
    const { error } = await supabase
      .from('kred_game_states')
      .upsert({
        lobby_id: lobbyId,
        phase: packet.gameState,
        state_json: packet,
        version: packet.stateVersion,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error('Failed to persist game state:', error);
      incrementCounter('persist.errors');
    } else {
      incrementCounter('persist.writes');
    }
  }, [lobbyId]);

  // Trailing-throttle persist with forced flush on phase change.
  const schedulePersist = useCallback((packet: GameStatePacket) => {
    const lastPhase = lastPersistedPhaseRef.current;
    pendingPersistPacketRef.current = packet;

    if (lastPhase !== null && lastPhase !== packet.gameState) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      lastPersistedPhaseRef.current = packet.gameState;
      pendingPersistPacketRef.current = null;
      flushPersist(packet);
      return;
    }
    lastPersistedPhaseRef.current = packet.gameState;

    if (persistTimerRef.current) return;
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (!p) return;
      flushPersist(p);
    }, PERSIST_THROTTLE_MS);
  }, [flushPersist]);

  const pushState = useCallback(() => {
    if (!lobbyId || !isHost) return;

    const packet = getStatePacket();
    hostVersionRef.current += 1;
    packet.stateVersion = hostVersionRef.current;
    packet.lastUpdated = Date.now();

    recordMetric("packet.bytes", JSON.stringify(packet).length);
    recordMetric("packet.version", packet.stateVersion);

    // Channel 1: Broadcast (fast, ephemeral)
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'state',
        payload: packet,
      });
    }

    // Channel 2: DB persist — throttled separately from broadcast
    schedulePersist(packet);
  }, [lobbyId, isHost, getStatePacket, schedulePersist]);

  // Debounced push — call this whenever state changes
  const debouncedPush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(pushState, 100);
  }, [pushState]);

  // ==========================================================================
  // HOST: Listen for guest actions (realtime + polling fallback)
  // ==========================================================================

  // Persistent set of ALL processed action IDs — survives effect re-runs
  const processedActionIdsRef = useRef<Set<string>>(new Set());
  // Queue for sequential processing — ensures React state commits between actions
  const actionQueueRef = useRef<any[]>([]);
  const isProcessingQueueRef = useRef(false);

  // Process queued actions one at a time, yielding between each so React can
  // commit state updates (e.g., setPieces from MOVE_PIECE) before the next
  // action (e.g., END_TURN) reads that state via the dispatch ref.
  const drainQueue = useCallback(() => {
    if (isProcessingQueueRef.current || actionQueueRef.current.length === 0) return;
    isProcessingQueueRef.current = true;

    const action = actionQueueRef.current.shift()!;
    onActionReceived?.current?.({
      type: action.action_type,
      playerId: action.player_id,
      payload: action.payload,
    });

    // Yield to let React commit state updates, then process next action
    setTimeout(() => {
      isProcessingQueueRef.current = false;
      drainQueue();
    }, 0);
  }, [onActionReceived]);

  const enqueueAction = useCallback((action: any) => {
    if (processedActionIdsRef.current.has(action.id)) return;
    processedActionIdsRef.current.add(action.id);
    actionQueueRef.current.push(action);
    drainQueue();
  }, [drainQueue]);

  useEffect(() => {
    if (!lobbyId || !isHost || !onActionReceived) return;

    // Realtime channel
    const channel = supabase
      .channel(`kred_actions:${lobbyId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kred_game_actions', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
          const a = payload.new as any;
          if (a.created_at > lastSeenActionAtRef.current) {
            lastSeenActionAtRef.current = a.created_at;
          }
          enqueueAction(a);
        }
      )
      .subscribe();

    // Polling fallback — incremental since last seen created_at
    const pollActions = async () => {
      const { data } = await supabase
        .from('kred_game_actions')
        .select('*')
        .eq('lobby_id', lobbyId)
        .gt('created_at', lastSeenActionAtRef.current)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        lastSeenActionAtRef.current = data[data.length - 1].created_at;
        for (const action of data) {
          enqueueAction(action);
        }
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') pollActions();
    };
    const handleOnline = () => pollActions();
    const handleFocus = () => pollActions();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(pollActions, 2000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [lobbyId, isHost, onActionReceived, enqueueAction]);

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
        lastBroadcastReceiptRef.current = Date.now();
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
  // GUEST: postgres_changes on kred_game_states is INTENTIONALLY NOT
  // subscribed. The broadcast channel above and the poll below are
  // sufficient and avoid the WAL-decoding cost of postgres_changes.
  // (Spec 2026-04-09 §2a)
  // ==========================================================================

  // ==========================================================================
  // GUEST: Polling fallback (3s)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

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

    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      const sinceBroadcast = Date.now() - lastBroadcastReceiptRef.current;
      const next = sinceBroadcast > 5000 ? 1000 : 3000;
      timer = setTimeout(tick, next);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') poll();
    };
    const handleOnline = () => poll();
    const handleFocus = () => poll();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    timer = setTimeout(tick, 3000);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
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
  // HOST: Force-flush any pending persist on unmount so rejoin sees fresh data.
  // ==========================================================================

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (p) flushPersist(p);
    };
  }, [flushPersist]);

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
