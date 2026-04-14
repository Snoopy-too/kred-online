import { describe, it, expect } from "vitest";
import { createMockSupabase } from "../helpers/mockSupabase";

// NOTE: the production persist throttle lives inside GameStateSynchronizer.tsx
// and uses React refs + setTimeout. Wiring the real synchronizer to the mock
// bus is a Step 7 effort. Until then this file guards two things the throttle
// depends on: (a) mock upserts converge on a single row per lobby, so the
// "trailing throttle → single flush" path remains valid, and (b) a phase
// change writes a new snapshot whose version is strictly greater than the
// previous one — the production forced-flush-on-phase-change assumes this.

describe("sync: persist throttle (2c)", () => {
  it("rapid upserts on the same lobby converge to one row", async () => {
    const supabase = createMockSupabase();

    for (let v = 1; v <= 5; v++) {
      await supabase.from("kred_game_states").upsert({
        lobby_id: "L",
        phase: "CAMPAIGN",
        state_json: { stateVersion: v, gameState: "CAMPAIGN" },
        version: v,
        updated_at: new Date().toISOString(),
      });
    }

    const { data } = await supabase
      .from("kred_game_states")
      .select("*")
      .eq("lobby_id", "L")
      .execute();

    expect(data).toHaveLength(1);
    expect(data![0].version).toBe(5);
  });

  it("phase change persists strictly-increasing versions", async () => {
    const supabase = createMockSupabase();

    await supabase.from("kred_game_states").upsert({
      lobby_id: "L",
      phase: "DRAFTING",
      state_json: { stateVersion: 3, gameState: "DRAFTING" },
      version: 3,
      updated_at: new Date().toISOString(),
    });

    await supabase.from("kred_game_states").upsert({
      lobby_id: "L",
      phase: "CAMPAIGN",
      state_json: { stateVersion: 4, gameState: "CAMPAIGN" },
      version: 4,
      updated_at: new Date().toISOString(),
    });

    const { data } = await supabase
      .from("kred_game_states")
      .select("*")
      .eq("lobby_id", "L")
      .execute();

    expect(data).toHaveLength(1);
    expect(data![0].phase).toBe("CAMPAIGN");
    expect(data![0].version).toBe(4);
  });
});
