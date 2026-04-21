import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  RosterProvider,
  useRoster,
  useRosterDispatch,
} from "../../providers/RosterProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RosterProvider>{children}</RosterProvider>
);

describe("RosterProvider", () => {
  it("provides default empty state", () => {
    const { result } = renderHook(() => useRoster(), { wrapper });
    expect(result.current.players).toEqual([]);
    expect(result.current.pieces).toEqual([]);
  });

  it("accepts initial state override", () => {
    const mockPlayers: any = [{ id: "p1", name: "Player 1" }];
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <RosterProvider initial={{ players: mockPlayers }}>
        {children}
      </RosterProvider>
    );
    const { result } = renderHook(() => useRoster(), { wrapper: customWrapper });
    expect(result.current.players).toEqual(mockPlayers);
    expect(result.current.pieces).toEqual([]);
  });

  it("setPlayers(array) and setPlayers(fn) both work", () => {
    const combined = renderHook(
      () => ({ state: useRoster(), dispatch: useRosterDispatch() }),
      { wrapper },
    );
    
    const mockPlayers1: any = [{ id: "p1" }];
    const mockPlayers2: any = [{ id: "p1" }, { id: "p2" }];

    act(() => {
      combined.result.current.dispatch.setPlayers(mockPlayers1);
    });
    expect(combined.result.current.state.players).toEqual(mockPlayers1);

    act(() => {
      combined.result.current.dispatch.setPlayers((prev) => [...prev, { id: "p2" } as any]);
    });
    expect(combined.result.current.state.players).toEqual(mockPlayers2);
  });

  it("dispatch.patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: useRoster(), dispatch: useRosterDispatch() }),
      { wrapper },
    );
    
    const mockPlayers: any = [{ id: "p1" }];
    const mockPieces: any = [{ id: "piece1" }];

    act(() => {
      combined.result.current.dispatch.patch({
        players: mockPlayers,
        pieces: mockPieces,
      });
    });
    expect(combined.result.current.state.players).toEqual(mockPlayers);
    expect(combined.result.current.state.pieces).toEqual(mockPieces);
  });

  it("dispatch identity is stable across renders", () => {
    const combined = renderHook(
      () => ({ state: useRoster(), dispatch: useRosterDispatch() }),
      { wrapper },
    );
    const firstDispatch = combined.result.current.dispatch;
    act(() => {
      combined.result.current.dispatch.setPieces([]);
    });
    expect(combined.result.current.dispatch).toBe(firstDispatch);
  });

  it("useRoster throws outside the provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRoster())).toThrow(/useRoster must be used inside/);
    spy.mockRestore();
  });

  it("useRosterDispatch throws outside the provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRosterDispatch())).toThrow(/useRosterDispatch must be used inside/);
    spy.mockRestore();
  });
});
