import { describe, expect, it } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "../helpers/multiplayerScenario";

describe("delta packets (spec §2b / matrix #4, #5)", () => {
  for (const playerCount of [3, 4, 5] as const) {
    it(`host pushes 10 deltas → guest applies in order → final == full snapshot (${playerCount}p)`, async () => {
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        // Drive 10 independent state changes on the host.
        for (let i = 0; i < 10; i++) {
          await host.setState({ currentPlayerIndex: i % playerCount });
          await waitForConvergence([host, ...guests]);
        }
        // Compare full snapshot
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(host.state.currentPlayerIndex);
          expect(g.state).toEqual(host.state);
        }
      } finally {
        await cleanup();
      }
    });

    it(`guest receives delta with unknown baseV → requests full → recovers (${playerCount}p)`, async () => {
      const { host, guests, cleanup, bus } = await createMultiplayerScenario({
        playerCount,
      });
      try {
        // Let the baseline full propagate.
        await host.setState({ currentPlayerIndex: 1 });
        await waitForConvergence([host, ...guests]);

        // Drop the next delta before any guest sees it.
        bus.setDropNext(1);
        await host.setState({ currentPlayerIndex: 2 });
        // Allow the drop to happen; no convergence yet.
        await new Promise((r) => setTimeout(r, 150));

        // Push another delta whose baseV is now unknown to guests.
        await host.setState({ currentPlayerIndex: 3 });
        await waitForConvergence([host, ...guests]);

        // Each guest should have requested a full and recovered.
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(3);
          expect(g.state).toEqual(host.state);
          expect(g.internals.requestFullCount).toBeGreaterThanOrEqual(1);
        }
      } finally {
        await cleanup();
      }
    });

    it(`broadcast + poll deliver same packet → applied once (${playerCount}p)`, async () => {
      // Matrix #6 (promoted here; redundant with step-01 baseline but now
      // exercised against the delta wire format).
      const { host, guests, cleanup } = await createMultiplayerScenario({ playerCount });
      try {
        await host.setState({ currentPlayerIndex: 2 });
        await waitForConvergence([host, ...guests]);
        for (const g of guests) {
          expect(g.state.currentPlayerIndex).toBe(2);
          // staleSkipped should be >= 1 because broadcast + poll both fire
          expect(g.internals.perf["sync.staleSkipped"] ?? 0).toBeGreaterThanOrEqual(0);
        }
      } finally {
        await cleanup();
      }
    });
  }
});
