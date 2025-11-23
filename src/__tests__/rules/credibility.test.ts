/**
 * Tests for credibility system functions
 *
 * These tests verify:
 * - Credibility deduction mechanics
 * - Credibility loss handling for different scenarios
 */

import { describe, it, expect } from "vitest";
import type { Player } from "../../types";
import { deductCredibility, handleCredibilityLoss } from "../../../game";

describe("deductCredibility", () => {
  it("deducts 1 credibility from the specified player", () => {
    const players: Player[] = [
      {
        id: 1,
        credibility: 5,
        hand: [],
        bureaucracyTiles: [],
        hasWon: false,
      },
      {
        id: 2,
        credibility: 3,
        hand: [],
        bureaucracyTiles: [],
        hasWon: false,
      },
    ];

    const result = deductCredibility(players, 1);

    expect(result[0].credibility).toBe(4);
    expect(result[1].credibility).toBe(3); // unchanged
  });

  it("does not reduce credibility below 0", () => {
    const players: Player[] = [
      {
        id: 1,
        credibility: 0,
        hand: [],
        bureaucracyTiles: [],
        hasWon: false,
      },
    ];

    const result = deductCredibility(players, 1);

    expect(result[0].credibility).toBe(0);
  });

  it("handles player with 1 credibility", () => {
    const players: Player[] = [
      {
        id: 1,
        credibility: 1,
        hand: [],
        bureaucracyTiles: [],
        hasWon: false,
      },
    ];

    const result = deductCredibility(players, 1);

    expect(result[0].credibility).toBe(0);
  });

  it("does not modify other players", () => {
    const players: Player[] = [
      {
        id: 1,
        credibility: 5,
        hand: ["01"],
        bureaucracyTiles: [],
        hasWon: false,
      },
      {
        id: 2,
        credibility: 3,
        hand: ["02"],
        bureaucracyTiles: [],
        hasWon: false,
      },
      {
        id: 3,
        credibility: 4,
        hand: ["03"],
        bureaucracyTiles: [],
        hasWon: false,
      },
    ];

    const result = deductCredibility(players, 2);

    expect(result[0].credibility).toBe(5); // unchanged
    expect(result[0].hand).toEqual(["01"]); // unchanged
    expect(result[1].credibility).toBe(2); // deducted
    expect(result[1].hand).toEqual(["02"]); // unchanged
    expect(result[2].credibility).toBe(4); // unchanged
    expect(result[2].hand).toEqual(["03"]); // unchanged
  });

  it("returns a new array (immutable)", () => {
    const players: Player[] = [
      {
        id: 1,
        credibility: 5,
        hand: [],
        bureaucracyTiles: [],
        hasWon: false,
      },
    ];

    const result = deductCredibility(players, 1);

    expect(result).not.toBe(players);
    expect(result[0]).not.toBe(players[0]);
  });
});

describe("handleCredibilityLoss", () => {
  const createPlayers = (): Player[] => [
    {
      id: 1,
      credibility: 5,
      hand: [],
      bureaucracyTiles: [],
      hasWon: false,
    },
    {
      id: 2,
      credibility: 4,
      hand: [],
      bureaucracyTiles: [],
      hasWon: false,
    },
    {
      id: 3,
      credibility: 3,
      hand: [],
      bureaucracyTiles: [],
      hasWon: false,
    },
  ];

  describe("tile_rejected_by_receiver", () => {
    it("deducts credibility from tile player", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "tile_rejected_by_receiver",
        1 // tile player
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(4); // tile player loses 1
      expect(result[1].credibility).toBe(4); // unchanged
      expect(result[2].credibility).toBe(3); // unchanged
    });
  });

  describe("tile_failed_challenge", () => {
    it("deducts credibility from tile player when challenge succeeds", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "tile_failed_challenge",
        2 // tile player
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(5); // unchanged
      expect(result[1].credibility).toBe(3); // tile player loses 1
      expect(result[2].credibility).toBe(3); // unchanged
    });
  });

  describe("unsuccessful_challenge", () => {
    it("deducts credibility from challenger when challenge fails", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "unsuccessful_challenge",
        1, // tile player
        3 // challenger
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(5); // unchanged
      expect(result[1].credibility).toBe(4); // unchanged
      expect(result[2].credibility).toBe(2); // challenger loses 1
    });

    it("returns unchanged players if no challenger specified", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "unsuccessful_challenge",
        1 // tile player
        // no challenger
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(5); // unchanged
      expect(result[1].credibility).toBe(4); // unchanged
      expect(result[2].credibility).toBe(3); // unchanged
    });
  });

  describe("did_not_reject_when_challenged", () => {
    it("deducts credibility from receiver when they don't reject a failed tile", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "did_not_reject_when_challenged",
        1, // tile player
        undefined, // challenger
        2 // receiver
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(5); // unchanged
      expect(result[1].credibility).toBe(3); // receiver loses 1
      expect(result[2].credibility).toBe(3); // unchanged
    });

    it("returns unchanged players if no receiver specified", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "did_not_reject_when_challenged",
        1 // tile player
        // no challenger, no receiver
      );

      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(5); // unchanged
      expect(result[1].credibility).toBe(4); // unchanged
      expect(result[2].credibility).toBe(3); // unchanged
    });
  });

  describe("complex scenarios", () => {
    it("works when player has 0 credibility", () => {
      const players: Player[] = [
        {
          id: 1,
          credibility: 0,
          hand: [],
          bureaucracyTiles: [],
          hasWon: false,
        },
      ];

      const updatePlayers = handleCredibilityLoss(
        "tile_rejected_by_receiver",
        1
      );
      const result = updatePlayers(players);

      expect(result[0].credibility).toBe(0); // stays at 0
    });

    it("returns a new array (immutable)", () => {
      const players = createPlayers();
      const updatePlayers = handleCredibilityLoss(
        "tile_rejected_by_receiver",
        1
      );

      const result = updatePlayers(players);

      expect(result).not.toBe(players);
      expect(result[0]).not.toBe(players[0]);
    });
  });
});
