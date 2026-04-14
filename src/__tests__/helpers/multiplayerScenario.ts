/**
 * Multiplayer scenario builder for testing host/guest sync paths.
 * Sets up an in-process game with N players using the mock Supabase.
 */

import { createMockSupabase, type MockSupabase } from "./mockSupabase";

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
  broadcastState(): void;
  receiveState(state: any): void;
  emitAction(type: string, payload: any): Promise<void>;
  onStateReceived?: (state: any) => void;
}

export interface MultiplayerScenario {
  host: ClientHandle;
  guests: ClientHandle[];
  lobbyId: string;
  supabase: MockSupabase;
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

  // Create client handle for host
  const host: ClientHandle = {
    playerIndex: 0,
    isHost: true,
    userId: hostUserId,
    lobbyId,
    supabase,
    state: {},
    broadcastState() {
      // In real implementation, would broadcast via supabase.channel
      const channel = supabase.channel(`kred_game:${lobbyId}`);
      channel.send({
        type: "broadcast",
        event: "state",
        payload: this.state,
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
      state: {},
      broadcastState() {
        // Guests don't broadcast; they only receive from host
      },
      receiveState(state: any) {
        this.state = state;
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
    };

    guests.push(guestHandle);
  }

  return {
    host,
    guests,
    lobbyId,
    supabase,
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
    const versions = clients.map(c => c.state?.version || 0);
    const allSame = versions.every(v => v === versions[0]);

    if (allSame && versions[0] > 0) {
      return; // Converged
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  // Timeout — log the state for debugging
  console.warn("waitForConvergence timeout. Client states:", clients.map(c => c.state));
}
