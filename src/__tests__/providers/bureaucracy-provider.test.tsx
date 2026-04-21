import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  BureaucracyProvider,
  useBureaucracyProvider,
  useBureaucracyDispatch,
} from "../../providers/BureaucracyProvider";
import { PhaseProvider, usePhaseDispatch } from "../../providers/PhaseProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhaseProvider>
    <BureaucracyProvider>{children}</BureaucracyProvider>
  </PhaseProvider>
);

describe("BureaucracyProvider", () => {
  it("provides default empty state", () => {
    const { result } = renderHook(() => useBureaucracyProvider(), { wrapper });
    expect(result.current.bureaucracyStates).toEqual([]);
    expect(result.current.bureaucracyTurnOrder).toEqual([]);
    expect(result.current.currentBureaucracyPlayerIndex).toBe(0);
  });

  it("accepts initial state override", () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <PhaseProvider>
        <BureaucracyProvider initial={{ bureaucracyTurnOrder: [2, 1, 3], currentBureaucracyPlayerIndex: 1 }}>
          {children}
        </BureaucracyProvider>
      </PhaseProvider>
    );
    const { result } = renderHook(() => useBureaucracyProvider(), { wrapper: customWrapper });
    expect(result.current.bureaucracyTurnOrder).toEqual([2, 1, 3]);
    expect(result.current.currentBureaucracyPlayerIndex).toBe(1);
  });

  it("setters support functional updaters", () => {
    const combined = renderHook(
      () => ({ state: useBureaucracyProvider(), dispatch: useBureaucracyDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.setBureaucracyTurnOrder([3, 2, 1]);
      combined.result.current.dispatch.setCurrentBureaucracyPlayerIndex((n) => n + 2);
    });
    expect(combined.result.current.state.bureaucracyTurnOrder).toEqual([3, 2, 1]);
    expect(combined.result.current.state.currentBureaucracyPlayerIndex).toBe(2);
  });

  it("patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: useBureaucracyProvider(), dispatch: useBureaucracyDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.patch({
        bureaucracyTurnOrder: [1, 2],
        currentBureaucracyPlayerIndex: 1,
      });
    });
    expect(combined.result.current.state.bureaucracyTurnOrder).toEqual([1, 2]);
    expect(combined.result.current.state.currentBureaucracyPlayerIndex).toBe(1);
  });

  it("auto-resets currentBureaucracyPlayerIndex on phase transition to CAMPAIGN", () => {
    const combined = renderHook(
      () => ({
        state: useBureaucracyProvider(),
        dispatch: useBureaucracyDispatch(),
        phaseDispatch: usePhaseDispatch(),
      }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.setCurrentBureaucracyPlayerIndex(3);
      combined.result.current.phaseDispatch.setGameState("BUREAUCRACY" as any);
    });
    expect(combined.result.current.state.currentBureaucracyPlayerIndex).toBe(3);

    act(() => {
      combined.result.current.phaseDispatch.setGameState("CAMPAIGN");
    });
    expect(combined.result.current.state.currentBureaucracyPlayerIndex).toBe(0);
  });

  it("useBureaucracyProvider throws outside provider", () => {
    expect(() => renderHook(() => useBureaucracyProvider())).toThrow(/useBureaucracyProvider must be used inside/);
  });

  it("useBureaucracyDispatch throws outside provider", () => {
    expect(() => renderHook(() => useBureaucracyDispatch())).toThrow(/useBureaucracyDispatch must be used inside/);
  });
});
