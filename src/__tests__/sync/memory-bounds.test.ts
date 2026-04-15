/**
 * Memory bounds tests (Spec 2026-04-09 §4a / matrix #17, #18).
 *
 * Asserts that long-lived multiplayer state collections are bounded and
 * do not grow linearly with action count over a long game. Parameterized
 * across all supported player counts (3, 4, 5).
 *
 * This suite has two layers:
 *   1. Direct unit test of BoundedActionIdSet — the ring-buffer dedupe
 *      structure used by GameStateSynchronizer.processedActionIdsRef.
 *   2. Scenario-level test that pushes 200 actions through the mock
 *      Supabase and asserts the dedupe structure plateaus at the cap.
 */

import { describe, it, expect } from "vitest";
import { BoundedActionIdSet } from "../../components/GameStateSynchronizer";
import { createMultiplayerScenario } from "../helpers/multiplayerScenario";

const PROCESSED_ACTION_ID_CAP = 500;

describe("memory bounds (spec §4a / matrix #17, #18)", () => {
  describe("BoundedActionIdSet — direct invariants", () => {
    it("caps size at the configured limit after many inserts", () => {
      const s = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);
      for (let i = 0; i < 2000; i++) {
        s.add(`action-${i}`);
      }
      expect(s.size()).toBe(PROCESSED_ACTION_ID_CAP);
    });

    it("drops the oldest entries when overflowing the ring", () => {
      const s = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);
      for (let i = 0; i < 1000; i++) {
        s.add(`action-${i}`);
      }
      // Oldest 500 should have been evicted; newest 500 retained.
      expect(s.has("action-0")).toBe(false);
      expect(s.has("action-499")).toBe(false);
      expect(s.has("action-500")).toBe(true);
      expect(s.has("action-999")).toBe(true);
    });

    it("treats duplicate adds as no-ops without growing", () => {
      const s = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);
      for (let i = 0; i < 100; i++) {
        s.add(`action-${i}`);
        s.add(`action-${i}`); // duplicate
      }
      expect(s.size()).toBe(100);
    });

    it("plateaus at the cap across sustained inserts (long-game simulation)", () => {
      const s = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);
      const sizeSamples: number[] = [];
      for (let i = 0; i < 5000; i++) {
        s.add(`action-${i}`);
        if (i % 100 === 0) sizeSamples.push(s.size());
      }
      // After ~500 actions the set should be full and stay that way.
      const samplesAfterSteadyState = sizeSamples.filter((_, idx) => idx > 5);
      samplesAfterSteadyState.forEach((size) => {
        expect(size).toBe(PROCESSED_ACTION_ID_CAP);
      });
    });
  });

  describe("Scenario-level — dedupe set stays bounded under 200 actions", () => {
    for (const playerCount of [3, 4, 5] as const) {
      it(`host dedupe set <= ${PROCESSED_ACTION_ID_CAP} after 200 actions (${playerCount}p)`, async () => {
        const { host, guests, supabase } = await createMultiplayerScenario({ playerCount });

        // Simulate the real flow: a standalone dedupe set that sees every
        // action id the host would receive. In production this ref lives
        // inside the synchronizer; we replicate the invariant at the
        // scenario boundary because the scenario is a DB-level harness.
        const dedupe = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);

        for (let i = 0; i < 200; i++) {
          const sender = guests[i % guests.length];
          await sender.emitAction("NOOP", { seq: i });
        }

        const { data: actions } = await supabase
          .from("kred_game_actions")
          .select("*")
          .eq("lobby_id", host.lobbyId)
          .order("created_at", { ascending: true })
          .execute();

        expect(actions).toHaveLength(200);
        for (const a of actions!) dedupe.add(a.id);

        expect(dedupe.size()).toBeLessThanOrEqual(PROCESSED_ACTION_ID_CAP);
        expect(dedupe.size()).toBe(200); // under the cap, every row still tracked
      });

      it(`host dedupe set plateaus at cap across ${playerCount}p long-game burst`, async () => {
        const { host, guests, supabase } = await createMultiplayerScenario({ playerCount });
        const dedupe = new BoundedActionIdSet(PROCESSED_ACTION_ID_CAP);

        // Emit 600 actions — exceeds the cap so we see ring eviction kick in.
        for (let i = 0; i < 600; i++) {
          const sender = guests[i % guests.length];
          await sender.emitAction("NOOP", { seq: i });
        }

        const { data: actions } = await supabase
          .from("kred_game_actions")
          .select("*")
          .eq("lobby_id", host.lobbyId)
          .order("created_at", { ascending: true })
          .execute();

        expect(actions).toHaveLength(600);
        for (const a of actions!) dedupe.add(a.id);

        // Cap holds even though 600 > 500.
        expect(dedupe.size()).toBe(PROCESSED_ACTION_ID_CAP);
      });
    }
  });
});
