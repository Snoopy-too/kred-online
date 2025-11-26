import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAlerts } from "../../hooks/useAlerts";

/**
 * Tests for useAlerts hook
 *
 * Covers:
 * - Initial state
 * - Alert modal display (showAlert/closeAlert)
 * - Challenge result messages
 * - Tile withdrawal flag
 * - Tile viewing states
 */

describe("useAlerts", () => {
  describe("Initial State", () => {
    it("should initialize alert modal as closed", () => {
      const { result } = renderHook(() => useAlerts());

      expect(result.current.alertModal.isOpen).toBe(false);
      expect(result.current.alertModal.title).toBe("");
      expect(result.current.alertModal.message).toBe("");
      expect(result.current.alertModal.type).toBe("info");
    });

    it("should initialize challenge result message as null", () => {
      const { result } = renderHook(() => useAlerts());

      expect(result.current.challengeResultMessage).toBeNull();
    });

    it("should initialize tile withdrawal flag as false", () => {
      const { result } = renderHook(() => useAlerts());

      expect(result.current.tilePlayerMustWithdraw).toBe(false);
    });

    it("should initialize tile viewing states as null", () => {
      const { result } = renderHook(() => useAlerts());

      expect(result.current.placerViewingTileId).toBeNull();
      expect(result.current.giveReceiverViewingTileId).toBeNull();
    });
  });

  describe("Alert Modal", () => {
    it("should show alert with default info type", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showAlert("Test Title", "Test Message");
      });

      expect(result.current.alertModal.isOpen).toBe(true);
      expect(result.current.alertModal.title).toBe("Test Title");
      expect(result.current.alertModal.message).toBe("Test Message");
      expect(result.current.alertModal.type).toBe("info");
    });

    it("should show alert with error type", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showAlert("Error", "Something went wrong", "error");
      });

      expect(result.current.alertModal.type).toBe("error");
    });

    it("should show alert with warning type", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showAlert("Warning", "Be careful", "warning");
      });

      expect(result.current.alertModal.type).toBe("warning");
    });

    it("should close alert modal", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showAlert("Test", "Message");
      });

      expect(result.current.alertModal.isOpen).toBe(true);

      act(() => {
        result.current.closeAlert();
      });

      expect(result.current.alertModal.isOpen).toBe(false);
      // Should preserve other properties when closing
      expect(result.current.alertModal.title).toBe("Test");
    });

    it("should allow direct setAlertModal for full control", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setAlertModal({
          isOpen: true,
          title: "Custom",
          message: "Direct set",
          type: "warning",
        });
      });

      expect(result.current.alertModal.isOpen).toBe(true);
      expect(result.current.alertModal.title).toBe("Custom");
      expect(result.current.alertModal.type).toBe("warning");
    });
  });

  describe("Challenge Result Messages", () => {
    it("should show challenge result message", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showChallengeResult("Challenge successful!");
      });

      expect(result.current.challengeResultMessage).toBe(
        "Challenge successful!"
      );
    });

    it("should clear challenge result message", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.showChallengeResult("Some result");
      });

      act(() => {
        result.current.clearChallengeResult();
      });

      expect(result.current.challengeResultMessage).toBeNull();
    });

    it("should allow direct setChallengeResultMessage", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setChallengeResultMessage("Direct message");
      });

      expect(result.current.challengeResultMessage).toBe("Direct message");
    });
  });

  describe("Tile Withdrawal Flag", () => {
    it("should set withdrawal required to true", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setWithdrawalRequired(true);
      });

      expect(result.current.tilePlayerMustWithdraw).toBe(true);
    });

    it("should set withdrawal required to false", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setWithdrawalRequired(true);
      });

      act(() => {
        result.current.setWithdrawalRequired(false);
      });

      expect(result.current.tilePlayerMustWithdraw).toBe(false);
    });

    it("should allow direct setTilePlayerMustWithdraw", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setTilePlayerMustWithdraw(true);
      });

      expect(result.current.tilePlayerMustWithdraw).toBe(true);
    });
  });

  describe("Tile Viewing States", () => {
    it("should set placer viewing tile ID", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setPlacerViewingTileId("tile-123");
      });

      expect(result.current.placerViewingTileId).toBe("tile-123");
    });

    it("should set receiver viewing tile ID", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setGiveReceiverViewingTileId("tile-456");
      });

      expect(result.current.giveReceiverViewingTileId).toBe("tile-456");
    });

    it("should clear all viewing tiles", () => {
      const { result } = renderHook(() => useAlerts());

      act(() => {
        result.current.setPlacerViewingTileId("tile-123");
        result.current.setGiveReceiverViewingTileId("tile-456");
      });

      expect(result.current.placerViewingTileId).toBe("tile-123");
      expect(result.current.giveReceiverViewingTileId).toBe("tile-456");

      act(() => {
        result.current.clearViewingTiles();
      });

      expect(result.current.placerViewingTileId).toBeNull();
      expect(result.current.giveReceiverViewingTileId).toBeNull();
    });
  });
});
