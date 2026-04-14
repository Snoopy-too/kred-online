import { describe, it, expect, beforeEach } from "vitest";
import { createMockSupabase } from "./mockSupabase";

describe("mockSupabase", () => {
  describe("Auth", () => {
    it("should return current session", async () => {
      const supabase = createMockSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeDefined();
      expect(session?.user).toBeDefined();
    });
  });

  describe("Table Operations", () => {
    beforeEach(() => {
      // Each test gets a fresh mock
    });

    it("should insert a row", async () => {
      const supabase = createMockSupabase();
      const { data, error } = await supabase
        .from("kred_lobbies")
        .insert({ pin: "ABC123", host_id: "user1", player_count: 3, status: "WAITING" });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.pin).toBe("ABC123");
      expect(data.player_count).toBe(3);
    });

    it("should select rows", async () => {
      const supabase = createMockSupabase();

      await supabase
        .from("kred_lobbies")
        .insert({ pin: "ABC123", host_id: "user1", player_count: 3, status: "WAITING" });

      const { data, error } = await supabase
        .from("kred_lobbies")
        .select("*")
        .execute();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].pin).toBe("ABC123");
    });

    it("should filter with eq", async () => {
      const supabase = createMockSupabase();

      await supabase.from("kred_lobbies").insert({ pin: "ABC123", host_id: "user1", player_count: 3, status: "WAITING" });
      await supabase.from("kred_lobbies").insert({ pin: "XYZ789", host_id: "user2", player_count: 4, status: "ACTIVE" });

      const { data, error } = await supabase
        .from("kred_lobbies")
        .select("*")
        .eq("pin", "ABC123")
        .execute();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].pin).toBe("ABC123");
    });

    it("should filter with neq", async () => {
      const supabase = createMockSupabase();

      await supabase.from("kred_lobbies").insert({ pin: "ABC123", host_id: "user1", player_count: 3, status: "WAITING" });
      await supabase.from("kred_lobbies").insert({ pin: "XYZ789", host_id: "user2", player_count: 4, status: "ACTIVE" });

      const { data, error } = await supabase
        .from("kred_lobbies")
        .select("*")
        .neq("status", "WAITING")
        .execute();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].status).toBe("ACTIVE");
    });

    it("should order results", async () => {
      const supabase = createMockSupabase();

      await supabase.from("kred_game_actions").insert({ lobby_id: "lobby1", player_id: "p1", action_type: "MOVE_PIECE", payload: { x: 1 }, created_at: "2026-01-01T00:00:02Z" });
      await supabase.from("kred_game_actions").insert({ lobby_id: "lobby1", player_id: "p2", action_type: "END_TURN", payload: {}, created_at: "2026-01-01T00:00:01Z" });

      const { data } = await supabase
        .from("kred_game_actions")
        .select("*")
        .order("created_at", { ascending: true })
        .execute();

      expect(data![0].created_at).toBe("2026-01-01T00:00:01Z");
      expect(data![1].created_at).toBe("2026-01-01T00:00:02Z");
    });

    it("should upsert rows", async () => {
      const supabase = createMockSupabase();

      const lobbyId = "lobby-1";

      // First upsert (insert)
      await supabase.from("kred_game_states").upsert({
        lobby_id: lobbyId,
        phase: "DRAFTING",
        state_json: { currentPlayerIndex: 0 },
        version: 1,
        updated_at: new Date().toISOString(),
      });

      let { data: states } = await supabase
        .from("kred_game_states")
        .select("*")
        .execute();
      expect(states).toHaveLength(1);

      // Second upsert (update)
      await supabase.from("kred_game_states").upsert({
        lobby_id: lobbyId,
        phase: "CAMPAIGN",
        state_json: { currentPlayerIndex: 1 },
        version: 2,
        updated_at: new Date().toISOString(),
      });

      ({ data: states } = await supabase
        .from("kred_game_states")
        .select("*")
        .execute());
      expect(states).toHaveLength(1);
      expect(states![0].phase).toBe("CAMPAIGN");
      expect(states![0].version).toBe(2);
    });
  });
});
