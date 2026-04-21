/**
 * Multiplayer scenario builder for testing host/guest sync paths.
 * Sets up an in-process game with N players using the mock Supabase.
 */

import { createMockSupabase, type MockSupabase } from "./mockSupabase";
import { buildPacket, applyDelta, StatePacket, FullState } from "../../sync/packet";

// ============================================================================
// Types
// ============================================================================

export interface ClientHandle {
  playerIndex: number;
  isHost: boolean;
  userId: string;
  lobbyId: string;
  supabase: MockSupabase;
  state: any;
  internals: {
    requestFullCount: number;
    perf: Record<string, number>;
    version: number;
  };
  broadcastState(): void;
  receiveState(state: any): void;
  emitAction(type: string, payload: any): Promise<void>;
  emitNumbered(n: number): Promise<void>;
  setState(partial: any): Promise<void>;
  onStateReceived?: (state: any) => void;
}

export interface MultiplayerScenario {
  host: ClientHandle;
  guests: ClientHandle[];
  lobbyId: string;
  supabase: MockSupabase;
  cleanup: () => Promise<void>;
  bus: {
    setDropNext(n: number): void;
  };
}

// ============================================================================
// Scenario Builder
// ============================================================================

export async function createMultiplayerScenario(options: {
  playerCount: 3 | 4 | 5;
}): Promise<MultiplayerScenario> {
  const { playerCount } = options;
  const supabase = createMockSupabase();

  // Get or create session user
  const { data: { session } } = await supabase.auth.getSession();
  const hostUserId = session?.user?.id || "";

  // Create lobby
  const { data: lobby } = await supabase.from("kred_lobbies").insert({
    pin: "TEST001",
    host_id: hostUserId,
    player_count: playerCount,
    status: "ACTIVE",
  });

  const lobbyId = lobby.id;

  // Insert host player
  const { data: hostPlayer } = await supabase.from("kred_players").insert({
    lobby_id: lobbyId,
    user_id: hostUserId,
    name: "Host",
    player_index: 0,
    is_host: true,
    connection_status: "ONLINE",
  });

  const channel = supabase.channel(`kred_game:${lobbyId}`);
  
  let hostVersion = 0;
  let forceFullNext = false;
  let hostPrevState: any = null;

  // Setup host action listener for REQUEST_FULL and numbered actions
  supabase.channel(`kred_actions:${lobbyId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kred_game_actions', filter: `lobby_id=eq.${lobbyId}` }, (payload) => {
      const action = payload.new as any;
      if (action.action_type === 'REQUEST_FULL') {
        forceFullNext = true;
        host.broadcastState(); // Immediately broadcast full as per spec
      } else if (action.action_type === 'NUMBERED') {
        host.setState({
          numberedCounter: (host.state.numberedCounter || 0) + 1,
          numberedSeen: [...(host.state.numberedSeen || []), action.payload.n]
        });
      }
    }).subscribe();

  // Create client handle for host
  const host: ClientHandle = {
    playerIndex: 0,
    isHost: true,
    userId: hostUserId,
    lobbyId,
    supabase,
    state: { version: 0 },
    internals: { requestFullCount: 0, perf: {}, version: 0 },
    broadcastState() {
      hostVersion++;
      this.state.version = hostVersion;
      this.internals.version = hostVersion;
      
      const packet = buildPacket({
        prev: hostPrevState,
        next: this.state,
        prevVersion: hostVersion - 1,
        nextVersion: hostVersion,
        ts: Date.now(),
        forceFull: forceFullNext
      });
      
      forceFullNext = false;
      hostPrevState = JSON.parse(JSON.stringify(this.state)); // clone
      
      channel.send({
        type: "broadcast",
        event: "state",
        payload: packet,
      });
    },
    receiveState(state: any) {
      this.state = state;
      this.onStateReceived?.(state);
    },
    async emitAction(type: string, payload: any) {
      await supabase.from("kred_game_actions").insert({
        lobby_id: lobbyId,
        player_id: hostUserId,
        action_type: type,
        payload,
      });
    },
    async emitNumbered(n: number) {
      await this.emitAction("NUMBERED", { n });
    },
    async setState(partial: any) {
      this.state = { ...this.state, ...partial };
      this.broadcastState();
    }
  };

  // Create guest players and handles
  const guests: ClientHandle[] = [];
  for (let i = 1; i < playerCount; i++) {
    // Get a new anonymous user for this guest
    const { data: { user: guestUser } } = await supabase.auth.signInAnonymously();
    const guestUserId = guestUser?.id || "";

    const { data: guestPlayer } = await supabase.from("kred_players").insert({
      lobby_id: lobbyId,
      user_id: guestUserId,
      name: `Guest ${i}`,
      player_index: i,
      is_host: false,
      connection_status: "ONLINE",
    });

    const guestHandle: ClientHandle = {
      playerIndex: i,
      isHost: false,
      userId: guestUserId,
      lobbyId,
      supabase,
      state: { version: 0 },
      internals: { requestFullCount: 0, perf: {}, version: 0 },
      broadcastState() {
        // Guests don't broadcast; they only receive from host
      },
      receiveState(state: any) {
        this.state = state;
        this.internals.version = state.version;
        this.onStateReceived?.(state);
      },
      async emitAction(type: string, payload: any) {
        await supabase.from("kred_game_actions").insert({
          lobby_id: lobbyId,
          player_id: guestUserId,
          action_type: type,
          payload,
        });
      },
      async emitNumbered(n: number) {
        await this.emitAction("NUMBERED", { n });
      },
      async setState(partial: any) {
        throw new Error("Guests cannot setState");
      }
    };

    // Guest listener to mock GameStateSynchronizer logic
    channel.on('broadcast', { event: 'state' }, async (p: any) => {
      // In mockSupabase, if payload has a payload property, it passes payload.payload directly.
      // So p might already be the StatePacket, or it might be wrapped.
      const packet = (p.kind ? p : p.payload) as StatePacket;
      if (!packet || typeof packet !== "object" || !("kind" in packet)) return;

      if (packet.v <= guestHandle.internals.version) {
        guestHandle.internals.perf["sync.staleSkipped"] = (guestHandle.internals.perf["sync.staleSkipped"] || 0) + 1;
        return;
      }

      if (packet.kind === "full") {
        guestHandle.state = packet.state;
        guestHandle.internals.version = packet.v;
      } else {
        if (packet.baseV !== guestHandle.internals.version) {
          guestHandle.internals.requestFullCount++;
          await supabase.from("kred_game_actions").insert({
            lobby_id: lobbyId,
            player_id: guestUserId,
            action_type: "REQUEST_FULL",
            payload: {},
          });
          return;
        }
        guestHandle.state = applyDelta(guestHandle.state, packet.patch);
        guestHandle.internals.version = packet.v;
      }
    });

    guests.push(guestHandle);
  }
  
  // Baseline initial broadcast to initialize all guests
  host.broadcastState();
  await new Promise(r => setTimeout(r, 10)); // let broadcasts settle

  return {
    host,
    guests,
    lobbyId,
    supabase,
    cleanup: async () => {},
    bus: {
      setDropNext(n: number) {
        channel.setDropNext(n);
      }
    }
  };
}

// ============================================================================
// Convergence Helper
// ============================================================================

/**
 * Waits for all clients to converge on the same state.
 * Used in tests to simulate network propagation and settle state.
 */
export async function waitForConvergence(
  clients: ClientHandle[],
  timeout = 1000,
  pollInterval = 10
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // Check if all clients have the same state version
    const versions = clients.map(c => c.internals.version);
    const allSame = versions.every(v => v === versions[0] && v === clients[0].state.version);

    if (allSame && versions[0] > 0) {
      return; // Converged
    }

    if (Date.now() - startTime >= timeout - 50) {
      console.log("Almost timeout. versions:", versions, "clients[0].state.version:", clients[0].state.version);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  // Timeout — log the state for debugging
  console.warn("waitForConvergence timeout. Client states:", clients.map(c => c.state));
  }