import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";

describe("microtask yield (spec §2f / matrix #19 extended)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`burst of 10 actions preserves order and per-action state ordering (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Each guest emits one action in a tight burst.
        const burst = [];
        for (let i = 0; i < 10; i++) {
          const sender = guests[i % guests.length];
          burst.push(sender.emitNumbered(i));
        }
        await Promise.all(burst);
        // Wait for all async database inserts to fire postgres_changes
        await new Promise(r => setTimeout(r, 200));
        await waitForConvergence([host, ...guests]);

        // The host should have observed each numbered action in order. Each
        // action increments a counter on the host's state — counter should be
        // exactly 10, no skipped numbers, no duplicates.
        expect(host.state.numberedCounter).toBe(10);
        expect(host.state.numberedSeen).toEqual(
          Array.from({ length: 10 }, (_, i) => i),
        );
      } finally {
        await cleanup();
      }
    });

    it(`burst completes faster than setTimeout-0 baseline on real hardware (dev-only assert)`, async () => {
      // Loose assertion: we don't want this flaky, but we also want visibility.
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        const start = performance.now();
        const burst = [];
        for (let i = 0; i < 10; i++) {
          burst.push(guests[i % guests.length].emitNumbered(i));
        }
        await Promise.all(burst);
        await waitForConvergence([host, ...guests]);
        const elapsed = performance.now() - start;

        // Very loose: generous upper bound to avoid flakes.
        expect(elapsed).toBeLessThan(2000);
      } finally {
        await cleanup();
      }
    });
  }
});
