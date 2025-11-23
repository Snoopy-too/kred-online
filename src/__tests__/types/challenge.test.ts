/**
 * Challenge Types Tests
 *
 * Tests for challenge system type definitions
 */

import { describe, it, expect } from "vitest";
import type { ChallengeState } from "../../types/challenge";

describe("Challenge Types", () => {
  describe("ChallengeState", () => {
    it("should create a pending challenge state", () => {
      const challenge: ChallengeState = {
        status: "PENDING",
        acceptedByReceivingPlayer: false,
      };

      expect(challenge.status).toBe("PENDING");
      expect(challenge.challengedByPlayerId).toBeUndefined();
      expect(challenge.acceptedByReceivingPlayer).toBe(false);
    });

    it("should create a challenged state with player ID", () => {
      const challenge: ChallengeState = {
        status: "CHALLENGED",
        challengedByPlayerId: 2,
        acceptedByReceivingPlayer: false,
      };

      expect(challenge.status).toBe("CHALLENGED");
      expect(challenge.challengedByPlayerId).toBe(2);
      expect(challenge.acceptedByReceivingPlayer).toBe(false);
    });

    it("should create a resolved challenge state", () => {
      const challenge: ChallengeState = {
        status: "RESOLVED",
        challengedByPlayerId: 3,
        acceptedByReceivingPlayer: true,
      };

      expect(challenge.status).toBe("RESOLVED");
      expect(challenge.challengedByPlayerId).toBe(3);
      expect(challenge.acceptedByReceivingPlayer).toBe(true);
    });

    it("should allow all valid status values", () => {
      const validStatuses: Array<ChallengeState["status"]> = [
        "PENDING",
        "CHALLENGED",
        "RESOLVED",
      ];

      expect(validStatuses).toHaveLength(3);
    });

    it("should handle challenge accepted by receiving player", () => {
      const challenge: ChallengeState = {
        status: "RESOLVED",
        challengedByPlayerId: 1,
        acceptedByReceivingPlayer: true,
      };

      expect(challenge.acceptedByReceivingPlayer).toBe(true);
    });

    it("should handle challenge rejected by receiving player", () => {
      const challenge: ChallengeState = {
        status: "RESOLVED",
        challengedByPlayerId: 1,
        acceptedByReceivingPlayer: false,
      };

      expect(challenge.acceptedByReceivingPlayer).toBe(false);
    });

    it("should allow optional challengedByPlayerId", () => {
      const challenge: ChallengeState = {
        status: "PENDING",
        acceptedByReceivingPlayer: false,
      };

      expect(challenge.challengedByPlayerId).toBeUndefined();
    });
  });
});
