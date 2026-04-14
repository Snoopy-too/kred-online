import { describe, it, expect } from "vitest";
import { createMultiplayerScenario, waitForConvergence } from "./multiplayerScenario";

describe("multiplayerScenario", () => {
  it("should create scenario with host and guests", async () => {
    const { host, guests } = await createMultiplayerScenario({ playerCount: 3 });

    expect(host).toBeDefined();
    expect(guests).toHaveLength(2);
    expect(host.playerIndex).toBe(0);
    expect(host.isHost).toBe(true);
    expect(guests[0].playerIndex).toBe(1);
    expect(guests[0].isHost).toBe(false);
    expect(guests[1].playerIndex).toBe(2);
  });

  it("should create scenario with 4 or 5 players", async () => {
    const scenario4 = await createMultiplayerScenario({ playerCount: 4 });
    expect(scenario4.guests).toHaveLength(3);

    const scenario5 = await createMultiplayerScenario({ playerCount: 5 });
    expect(scenario5.guests).toHaveLength(4);
  });

  it("should manually sync state across clients", async () => {
    const { host, guests } = await createMultiplayerScenario({ playerCount: 3 });

    // Simulate state change on host
    host.state = { version: 1, data: "test" };

    // Manually distribute state to guests (simulating broadcast delivery)
    guests.forEach(guest => {
      guest.receiveState(host.state);
    });

    // Guests should have the same state
    expect(guests[0].state.version).toBe(1);
    expect(guests[1].state.version).toBe(1);
    expect(guests[0].state.data).toBe("test");
  });
});
