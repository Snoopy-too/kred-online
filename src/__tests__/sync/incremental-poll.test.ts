/**
 * Sync: incremental action poll (Spec 2026-04-09 §2d)
 *
 * Asserts the gt(created_at) watermark pattern returns only NEW rows,
 * and that the watermark advances correctly across polls.
 *
 * Also exercises BoundedActionIdSet — the ring-buffer dedupe structure
 * used by GameStateSynchronizer to cap processedActionIdsRef.
 */

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

describe("BoundedActionIdSet", () => {
  it("retains the last N ids and evicts older ones", async () => {
    // Inline copy of the class for testability — production code lives in
    // GameStateSynchronizer.tsx. We replicate here to assert the contract.
    class BoundedActionIdSet {
      private ring: string[] = [];
      private setView: Set<string> = new Set();
      constructor(private cap: number) {}
      has(id: string) { return this.setView.has(id); }
      add(id: string) {
        if (this.setView.has(id)) return;
        this.ring.push(id);
        this.setView.add(id);
        while (this.ring.length > this.cap) {
          const removed = this.ring.shift()!;
          this.setView.delete(removed);
        }
      }
      size() { return this.setView.size; }
    }

    const s = new BoundedActionIdSet(3);
    s.add("a");
    s.add("b");
    s.add("c");
    expect(s.size()).toBe(3);
    s.add("d");
    expect(s.size()).toBe(3);
    expect(s.has("a")).toBe(false);
    expect(s.has("d")).toBe(true);
    s.add("d"); // duplicate is no-op
    expect(s.size()).toBe(3);
  });
});
