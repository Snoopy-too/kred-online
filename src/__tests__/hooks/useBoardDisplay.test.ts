import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardDisplay } from "../../hooks/useBoardDisplay";

/**
 * Tests for useBoardDisplay hook
 *
 * Covers:
 * - Initial state
 * - Board rotation toggle
 * - Grid overlay toggle
 * - Dummy tile preview (drag operations)
 */

describe("useBoardDisplay", () => {
  describe("Initial State", () => {
    it("should initialize board rotation as enabled", () => {
      const { result } = renderHook(() => useBoardDisplay());

      expect(result.current.boardRotationEnabled).toBe(true);
    });

    it("should initialize grid overlay as hidden", () => {
      const { result } = renderHook(() => useBoardDisplay());

      expect(result.current.showGridOverlay).toBe(false);
    });

    it("should initialize dummy tile as null", () => {
      const { result } = renderHook(() => useBoardDisplay());

      expect(result.current.dummyTile).toBeNull();
    });
  });

  describe("Board Rotation", () => {
    it("should toggle board rotation off", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.toggleBoardRotation();
      });

      expect(result.current.boardRotationEnabled).toBe(false);
    });

    it("should toggle board rotation back on", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.toggleBoardRotation();
      });
      act(() => {
        result.current.toggleBoardRotation();
      });

      expect(result.current.boardRotationEnabled).toBe(true);
    });

    it("should allow direct setBoardRotationEnabled", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setBoardRotationEnabled(false);
      });

      expect(result.current.boardRotationEnabled).toBe(false);
    });
  });

  describe("Grid Overlay", () => {
    it("should toggle grid overlay on", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.toggleGridOverlay();
      });

      expect(result.current.showGridOverlay).toBe(true);
    });

    it("should toggle grid overlay back off", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.toggleGridOverlay();
      });
      act(() => {
        result.current.toggleGridOverlay();
      });

      expect(result.current.showGridOverlay).toBe(false);
    });

    it("should allow direct setShowGridOverlay", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setShowGridOverlay(true);
      });

      expect(result.current.showGridOverlay).toBe(true);
    });
  });

  describe("Dummy Tile Preview", () => {
    it("should set dummy tile preview with position and rotation", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setDummyTilePreview({ top: 100, left: 200 }, 45);
      });

      expect(result.current.dummyTile).toEqual({
        position: { top: 100, left: 200 },
        rotation: 45,
      });
    });

    it("should set dummy tile preview with default rotation", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setDummyTilePreview({ top: 50, left: 75 });
      });

      expect(result.current.dummyTile).toEqual({
        position: { top: 50, left: 75 },
        rotation: 0,
      });
    });

    it("should clear dummy tile preview when position is null", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setDummyTilePreview({ top: 100, left: 200 }, 45);
      });

      act(() => {
        result.current.setDummyTilePreview(null);
      });

      expect(result.current.dummyTile).toBeNull();
    });

    it("should clear dummy tile with clearDummyTile", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setDummyTilePreview({ top: 100, left: 200 }, 45);
      });

      act(() => {
        result.current.clearDummyTile();
      });

      expect(result.current.dummyTile).toBeNull();
    });

    it("should allow direct setDummyTile", () => {
      const { result } = renderHook(() => useBoardDisplay());

      act(() => {
        result.current.setDummyTile({
          position: { top: 300, left: 400 },
          rotation: 90,
        });
      });

      expect(result.current.dummyTile).toEqual({
        position: { top: 300, left: 400 },
        rotation: 90,
      });
    });
  });
});
