import { useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';
import { recordMetric, incrementCounter, setGauge } from '../perf';

const PERSIST_THROTTLE_MS = 500;
const PROCESSED_ACTION_ID_CAP = 500;

/**
 * Bounded set of recently-processed action ids.
 * Last N ids retained — older ids fall off the back.
 * Used to dedupe broadcast/poll race conditions without unbounded growth.
 */
export class BoundedActionIdSet {
  private ring: string[] = [];
  private setView: Set<string> = new Set();
  constructor(private cap: number) {}
  has(id: string): boolean {
    return this.setView.has(id);
  }
  add(id: string): void {
    if (this.setView.has(id)) return;
    this.ring.push(id);
    this.setView.add(id);
    while (this.ring.length > this.cap) {
      const removed = this.ring.shift()!;
      this.setView.delete(removed);
    }
  }
  size(): number {
    return this.setView.size;
  }
}

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

  /**
   * Host: ref the synchronizer assigns its debounced pushState function to,
   * so the parent can call it imperatively without going through `window`.
   * Caller passes a ref it will keep stable across renders.
   */
  pushStateRef?: MutableRefObject<(() => void) | null>;
}

// ============================================================================
// Component
// ============================================================================

export default function GameStateSynchronizer({
  getStatePacket,
  applyStatePacket,
  onActionReceived,
  onRejoinComplete,
  pushStateRef,
}: SyncProps) {
  const { lobbyId, isHost, isRejoining } = useLobby();

  // Stable refs for props that change identity every render (KredApp passes
  // inline arrows that forward to its own refs). Storing them here keeps the
  // subscribe/poll effects out of re-subscribe loops driven by parent renders.
  // (Spec 2026-04-09 §4f — subscription stability audit.)
  const applyStatePacketRef = useRef(applyStatePacket);
  const getStatePacketRef = useRef(getStatePacket);
  const onRejoinCompleteRef = useRef(onRejoinComplete);
  useEffect(() => { applyStatePacketRef.current = applyStatePacket; }, [applyStatePacket]);
  useEffect(() => { getStatePacketRef.current = getStatePacket; }, [getStatePacket]);
  useEffect(() => { onRejoinCompleteRef.current = onRejoinComplete; }, [onRejoinComplete]);

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

    // Force-flush on phase change (no throttle)
    if (lastPhase !== null && lastPhase !== packet.gameState) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      lastPersistedPhaseRef.current = packet.gameState;
      flushPersist(packet);
      pendingPersistPacketRef.current = null;
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

    const packet = getStatePacketRef.current();
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

    // Perf metric
    recordMetric('packet.bytes', JSON.stringify(packet).length);
    recordMetric('packet.version', packet.stateVersion);

    // Channel 2: DB persist — throttled separately from broadcast
    schedulePersist(packet);
  }, [lobbyId, isHost, schedulePersist]);

  // Debounced push — call this whenever state changes
  const debouncedPush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(pushState, 100);
  }, [pushState]);

  // ==========================================================================
  // HOST: Listen for guest actions (realtime + polling fallback)
  // ==========================================================================

  // Persistent set of ALL processed action IDs — survives effect re-runs
  const processedActionIdsRef = useRef<BoundedActionIdSet>(new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP));
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
    if (action.created_at) {
      const ageMs = Date.now() - new Date(action.created_at).getTime();
      recordMetric('actions.latency', ageMs);
    }
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
    recordMetric('actions.processedSet.size', processedActionIdsRef.current.size());
    actionQueueRef.current.push(action);
    recordMetric('actions.queueDepth', actionQueueRef.current.length);
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
          incrementCounter('actions.realtime.received');
          enqueueAction(a);
        }
      )
      .subscribe();
    setGauge('subscriptions.openCount', (c) => c + 1);

    // Polling fallback — pick up any actions missed by realtime
    const pollActions = async () => {
      const { data } = await supabase
        .from('kred_game_actions')
        .select('*')
        .eq('lobby_id', lobbyId)
        .gt('created_at', lastSeenActionAtRef.current)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        incrementCounter('actions.poll.received', data.length);
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
      setGauge('subscriptions.openCount', (c) => Math.max(0, c - 1));
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
        const tApply = Date.now() - (payload.lastUpdated ?? Date.now());
        recordMetric('apply.latency', tApply, { channel: 'broadcast' });
        applyStatePacketRef.current(payload);
      });
    }

    channel.subscribe();
    broadcastChannelRef.current = channel;
    setGauge('subscriptions.openCount', (c) => c + 1);

    return () => {
      channel.unsubscribe();
      setGauge('subscriptions.openCount', (c) => Math.max(0, c - 1));
      broadcastChannelRef.current = null;
    };
  }, [lobbyId, isHost]);

  // ==========================================================================
  // GUEST: postgres_changes on kred_game_states is INTENTIONALLY NOT
  // subscribed. The broadcast channel above and the 3s poll below are
  // sufficient and avoid the WAL-decoding cost of postgres_changes.
  // (Spec 2026-04-09 §2a)
  // ==========================================================================

  // ==========================================================================
  // GUEST: Polling fallback (3s)
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId || isHost) return;

    let cancelled = false;

    const poll = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .single();

      if (data && data.version > lastProcessedVersionRef.current) {
        lastProcessedVersionRef.current = data.version;
        const tApply = Date.now() - ((data.state_json as any).lastUpdated ?? Date.now());
        recordMetric('apply.latency', tApply, { channel: 'poll' });
        applyStatePacketRef.current(data.state_json as GameStatePacket);
      }
    };

    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      const sinceBroadcast = Date.now() - lastBroadcastReceiptRef.current;
      const next = sinceBroadcast > 5000 ? 1000 : 3000;
      setTimeout(tick, next);
    };

    setTimeout(tick, 3000);

    return () => {
      cancelled = true;
    };
  }, [lobbyId, isHost]);

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
        applyStatePacketRef.current(packet);
      }

      onRejoinCompleteRef.current?.();
    };

    hydrate();
  }, [lobbyId, isRejoining]);

  // Force-flush any pending persist on unmount so rejoin always sees fresh data.
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
  // Expose debouncedPush via the parent-provided ref (no global escape hatch).
  // ==========================================================================

  useEffect(() => {
    if (!isHost || !pushStateRef) return;
    pushStateRef.current = debouncedPush;
    return () => {
      if (pushStateRef) pushStateRef.current = null;
    };
  }, [isHost, debouncedPush, pushStateRef]);

  return null;
}
