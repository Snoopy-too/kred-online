import { useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useLobby } from '../contexts/LobbyContext';
import { recordMetric, incrementCounter, setGauge } from '../perf';
import { SYNC_MICROTASK_YIELD } from '../sync/flags';
import { StatePacket, FullState, applyDelta } from '../sync/packet';

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

export type GameStatePacket = FullState;

export interface SyncProps {
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

  /**
   * Host: ref to the imperative send function that the aggregator calls.
   */
  synchronizerSendRef?: MutableRefObject<((packet: StatePacket) => void) | null>;
}

// ============================================================================
// Component
// ============================================================================

export default function GameStateSynchronizer({
  applyStatePacket,
  onActionReceived,
  onRejoinComplete,
  pushStateRef,
  synchronizerSendRef,
}: SyncProps) {
  const { lobbyId, userId, isHost, isRejoining } = useLobby();

  const applyStatePacketRef = useRef(applyStatePacket);
  const onRejoinCompleteRef = useRef(onRejoinComplete);
  useEffect(() => { applyStatePacketRef.current = applyStatePacket; }, [applyStatePacket]);
  useEffect(() => { onRejoinCompleteRef.current = onRejoinComplete; }, [onRejoinComplete]);

  const lastAppliedFullRef = useRef<FullState | null>(null);
  const lastAppliedVRef = useRef(0);
  
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastBroadcastReceiptRef = useRef<number>(Date.now());
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPersistPacketRef = useRef<{ packet: GameStatePacket; version: number; gameState: string } | null>(null);
  const lastPersistedVersionRef = useRef<number>(0);
  const lastPersistedPhaseRef = useRef<string | null>(null);
  const lastSeenActionAtRef = useRef<string>(new Date(0).toISOString());
  // Host-only: blocks pushes until DB has been checked for existing saved state,
  // so a host reload doesn't overwrite mid-flow state with fresh-mount defaults.
  const hostHydratedRef = useRef<boolean>(false);

  // For host REQUEST_FULL handling
  const forceFullOnNextPushRef = useRef<boolean>(false);

  // ==========================================================================
  // HOST: Push state to guests
  // ==========================================================================

  const flushPersist = useCallback(async (packet: GameStatePacket, version: number, gameState: string) => {
    if (!lobbyId) return;
    if (version <= lastPersistedVersionRef.current) return;
    lastPersistedVersionRef.current = version;
    const { error } = await supabase
      .from('kred_game_states')
      .upsert({
        lobby_id: lobbyId,
        phase: gameState,
        state_json: packet,
        version: version,
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
  const schedulePersist = useCallback((packet: GameStatePacket, version: number) => {
    const gameState = typeof packet.gameState === 'string' ? packet.gameState : '';
    const lastPhase = lastPersistedPhaseRef.current;
    pendingPersistPacketRef.current = { packet, version, gameState };

    // Force-flush on phase change (no throttle)
    if (lastPhase !== null && lastPhase !== gameState) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      lastPersistedPhaseRef.current = gameState;
      flushPersist(packet, version, gameState);
      pendingPersistPacketRef.current = null;
      return;
    }
    lastPersistedPhaseRef.current = gameState;

    if (persistTimerRef.current) return;
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (!p) return;
      flushPersist(p.packet, p.version, p.gameState);
    }, PERSIST_THROTTLE_MS);
  }, [flushPersist]);

  const pendingPacketRef = useRef<StatePacket | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!synchronizerSendRef) return;
    synchronizerSendRef.current = (packet: StatePacket) => {
      if (!lobbyId || !isHost || !hostHydratedRef.current) return;
      
      pendingPacketRef.current = packet;
      if (sendTimerRef.current) return;
      sendTimerRef.current = setTimeout(() => {
        const p = pendingPacketRef.current;
        pendingPacketRef.current = null;
        sendTimerRef.current = null;
        if (!p) return;

        broadcastChannelRef.current?.send({
          type: "broadcast",
          event: "state",
          payload: p,
        });

        // DB persistence still takes the FULL state.
        const fullForPersist =
          p.kind === "full"
            ? p.state
            : applyDelta(lastAppliedFullRef.current ?? {}, p.patch);
            
        // Keep host's reference of the latest state for potential full request responses.
        lastAppliedFullRef.current = fullForPersist;
        lastAppliedVRef.current = p.v;
            
        schedulePersist(fullForPersist, p.v);
      }, 100);
    };
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
    };
  }, [lobbyId, isHost, schedulePersist, synchronizerSendRef]);

  // ==========================================================================
  // GUEST: Request full state when delta base is unknown
  // ==========================================================================

  const emitRequestFull = useCallback(async () => {
    if (!lobbyId || !userId) return;
    await supabase.from("kred_game_actions").insert({
      lobby_id: lobbyId,
      player_id: userId,
      action_type: "REQUEST_FULL",
      payload: {},
    });
  }, [lobbyId, userId]);

  // ==========================================================================
  // HOST: Listen for guest actions (realtime + polling fallback)
  // ==========================================================================

  const processedActionIdsRef = useRef<BoundedActionIdSet>(new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP));
  const actionQueueRef = useRef<any[]>([]);
  const isProcessingQueueRef = useRef(false);

  const processAction = useCallback((action: any) => {
    if (action.created_at) {
      const ageMs = Date.now() - new Date(action.created_at).getTime();
      recordMetric('actions.latency', ageMs);
    }
    
    if (action.action_type === 'REQUEST_FULL') {
      incrementCounter("sync.requestFull.served");
      // Direct broadcast a full right now, bypassing the debounce
      if (lastAppliedFullRef.current) {
        broadcastChannelRef.current?.send({
          type: "broadcast",
          event: "state",
          payload: {
            kind: "full",
            v: lastAppliedVRef.current,
            ts: Date.now(),
            state: lastAppliedFullRef.current,
          },
        });
      }
      return;
    }
    
    onActionReceived?.current?.({
      type: action.action_type,
      playerId: action.player_id,
      payload: action.payload,
    });
  }, [onActionReceived]);

  const drainQueue = useCallback(() => {
    if (isProcessingQueueRef.current) return;
    if (actionQueueRef.current.length === 0) return;
    isProcessingQueueRef.current = true;

    const burstStart = performance.now();

    const next = () => {
      const action = actionQueueRef.current.shift();
      if (!action) {
        isProcessingQueueRef.current = false;
        recordMetric("actions.burstYieldMs", performance.now() - burstStart);
        return;
      }
      
      // flushSync ensures the setState inside processAction commits before the
      // next action runs. React 19 + flushSync is legal inside a microtask.
      flushSync(() => { processAction(action); });

      if (SYNC_MICROTASK_YIELD) {
        queueMicrotask(next);
      } else {
        setTimeout(next, 0);
      }
    };

    if (SYNC_MICROTASK_YIELD) {
      queueMicrotask(next);
    } else {
      setTimeout(next, 0);
    }
  }, [processAction]);

  const enqueueAction = useCallback((action: any) => {
    if (processedActionIdsRef.current.has(action.id)) return;
    processedActionIdsRef.current.add(action.id);
    recordMetric('actions.processedSet.size', processedActionIdsRef.current.size());
    actionQueueRef.current.push(action);
    recordMetric('actions.queueDepth', actionQueueRef.current.length);
    drainQueue();
  }, [drainQueue]);

  useEffect(() => {
    if (!lobbyId || !isHost) return;

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
  }, [lobbyId, isHost, enqueueAction]);

  // ==========================================================================
  // GUEST: Apply Packet logic
  // ==========================================================================

  const applyStatePacketHandler = useCallback((raw: unknown) => {
    const packet = raw as StatePacket;
    if (!packet || typeof packet !== "object" || !("kind" in packet)) return;

    // Version gate
    if (packet.v <= lastAppliedVRef.current) {
      incrementCounter("sync.staleSkipped");
      return;
    }

    if (packet.kind === "full") {
      lastAppliedFullRef.current = packet.state;
      lastAppliedVRef.current = packet.v;
      recordMetric("sync.apply.fullBytes", JSON.stringify(packet.state).length);
      applyStatePacketRef.current(packet.state);
      return;
    }

    // kind === 'delta'
    if (packet.baseV !== lastAppliedVRef.current) {
      // Missed a frame. Request a full snapshot.
      incrementCounter("sync.requestFull.sent");
      emitRequestFull();
      return;
    }

    const base = lastAppliedFullRef.current ?? {};
    const next = applyDelta(base, packet.patch);
    lastAppliedFullRef.current = next;
    lastAppliedVRef.current = packet.v;
    recordMetric("sync.apply.deltaBytes", JSON.stringify(packet.patch).length);
    applyStatePacketRef.current(next);
  }, [emitRequestFull]);


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
      channel.on('broadcast', { event: 'state' }, ({ payload }: { payload: any }) => {
        lastBroadcastReceiptRef.current = Date.now();
        const tApply = Date.now() - (payload.ts ?? Date.now());
        recordMetric('apply.latency', tApply, { channel: 'broadcast' });
        applyStatePacketHandler(payload);
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
  }, [lobbyId, isHost, applyStatePacketHandler]);

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

      if (data && data.version > lastAppliedVRef.current) {
        // synthesize a full packet since the db only has state_json
        const packet: StatePacket = {
          kind: "full",
          v: data.version,
          ts: Date.now(),
          state: data.state_json as any,
        };
        const tApply = Date.now() - ((data.state_json as any).lastUpdated ?? Date.now());
        recordMetric('apply.latency', tApply, { channel: 'poll' });
        applyStatePacketHandler(packet);
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
  }, [lobbyId, isHost, applyStatePacketHandler]);

  // ==========================================================================
  // REJOIN: Hydrate from DB snapshot
  // ==========================================================================

  useEffect(() => {
    if (!lobbyId) return;
    // Guests only hydrate on explicit rejoin. Hosts ALWAYS hydrate on mount so
    // a host reload mid-flow restores saved state instead of clobbering it with
    // fresh-mount defaults. hostHydratedRef gates all host pushes until this
    // check completes.
    if (!isHost && !isRejoining) return;

    const hydrate = async () => {
      const { data } = await supabase
        .from('kred_game_states')
        .select('state_json, version')
        .eq('lobby_id', lobbyId)
        .maybeSingle();

      if (data) {
        const fullState = data.state_json as GameStatePacket;
        const gameStateStr = typeof fullState.gameState === 'string' ? fullState.gameState : '';
        lastPersistedVersionRef.current = data.version;
        lastPersistedPhaseRef.current = gameStateStr;
        
        const packet: StatePacket = {
          kind: "full",
          v: data.version,
          ts: Date.now(),
          state: fullState,
        };

        if (isHost) {
          lastAppliedFullRef.current = fullState;
          lastAppliedVRef.current = data.version;
        }

        applyStatePacketHandler(packet);
      }

      if (isHost) hostHydratedRef.current = true;
      onRejoinCompleteRef.current?.();
    };

    hydrate();
  }, [lobbyId, isHost, isRejoining, applyStatePacketHandler]);

  // Force-flush any pending persist on unmount so rejoin always sees fresh data.
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const p = pendingPersistPacketRef.current;
      pendingPersistPacketRef.current = null;
      if (p) flushPersist(p.packet, p.version, p.gameState);
    };
  }, [flushPersist]);

  // We are not exposing a pushState via pushStateRef anymore, because we are using synchronizerSendRef
  // But we still keep the ref if the parent passed it to satisfy types without modifying KredApp unnecessarily.

  return null;
}
