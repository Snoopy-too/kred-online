import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  BoardProvider,
  useBoard,
  useBoardDispatch,
} from "../../providers/BoardProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BoardProvider>{children}</BoardProvider>
);

describe("BoardProvider", () => {
  it("provides default empty state", () => {
    const { result } = renderHook(() => useBoard(), { wrapper });
    expect(result.current.boardTiles).toEqual([]);
    expect(result.current.bankedTiles).toEqual([]);
  });

  it("accepts initial state override", () => {
    const mockBoardTiles: any = [{ id: "t1", tile: { id: 1, url: "" } }];
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <BoardProvider initial={{ boardTiles: mockBoardTiles }}>
        {children}
      </BoardProvider>
    );
    const { result } = renderHook(() => useBoard(), { wrapper: customWrapper });
    expect(result.current.boardTiles).toEqual(mockBoardTiles);
    expect(result.current.bankedTiles).toEqual([]);
  });

  it("setBoardTiles(array) and setBoardTiles(fn) both work", () => {
    const combined = renderHook(
      () => ({ state: useBoard(), dispatch: useBoardDispatch() }),
      { wrapper },
    );
    
    const mockTiles1: any = [{ id: "t1" }];
    const mockTiles2: any = [{ id: "t1" }, { id: "t2" }];

    act(() => {
      combined.result.current.dispatch.setBoardTiles(mockTiles1);
    });
    expect(combined.result.current.state.boardTiles).toEqual(mockTiles1);

    act(() => {
      combined.result.current.dispatch.setBoardTiles((prev) => [...prev, { id: "t2" } as any]);
    });
    expect(combined.result.current.state.boardTiles).toEqual(mockTiles2);
  });

  it("dispatch.patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: useBoard(), dispatch: useBoardDispatch() }),
      { wrapper },
    );
    
    const mockBoardTiles: any = [{ id: "t1" }];
    const mockBankedTiles: any = [{ id: "b1" }];

    act(() => {
      combined.result.current.dispatch.patch({
        boardTiles: mockBoardTiles,
        bankedTiles: mockBankedTiles,
      });
    });
    expect(combined.result.current.state.boardTiles).toEqual(mockBoardTiles);
    expect(combined.result.current.state.bankedTiles).toEqual(mockBankedTiles);
  });

  it("dispatch identity is stable across renders", () => {
    const combined = renderHook(
      () => ({ state: useBoard(), dispatch: useBoardDispatch() }),
      { wrapper },
    );
    const firstDispatch = combined.result.current.dispatch;
    act(() => {
      combined.result.current.dispatch.setBankedTiles([]);
    });
    expect(combined.result.current.dispatch).toBe(firstDispatch);
  });

  it("useBoard throws outside the provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useBoard())).toThrow(/useBoard must be used inside/);
    spy.mockRestore();
  });

  it("useBoardDispatch throws outside the provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useBoardDispatch())).toThrow(/useBoardDispatch must be used inside/);
    spy.mockRestore();
  });
});
