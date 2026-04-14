import { describe, it, expect } from "vitest";
import { createMockSupabase } from "../helpers/mockSupabase";

describe("sync: incremental action poll (2d)", () => {
  it("a gt(created_at) query returns only newer rows", async () => {
    const supabase = createMockSupabase();

    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "A",
      payload: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });
    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "B",
      payload: {},
      created_at: "2026-01-02T00:00:00.000Z",
    });

    const watermark = "2026-01-01T12:00:00.000Z";
    const { data } = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true })
      .execute();

    expect(data).toHaveLength(1);
    expect(data![0].action_type).toBe("B");
  });

  it("watermark advances on each poll so the same row is never returned twice", async () => {
    const supabase = createMockSupabase();
    let watermark = new Date(0).toISOString();

    await supabase.from("kred_game_actions").insert({
      lobby_id: "L",
      player_id: "p1",
      action_type: "A",
      payload: {},
      created_at: "2026-01-01T00:00:00.000Z",
    });

    const first = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true })
      .execute();
    expect(first.data).toHaveLength(1);
    watermark = first.data![0].created_at;

    const second = await supabase
      .from("kred_game_actions")
      .select("*")
      .eq("lobby_id", "L")
      .gt("created_at", watermark)
      .order("created_at", { ascending: true })
      .execute();
    expect(second.data).toHaveLength(0);
  });
});
