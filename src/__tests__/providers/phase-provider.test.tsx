// src/__tests__/providers/phase-provider.test.tsx
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  PhaseProvider,
  usePhase,
  usePhaseDispatch,
} from "../../providers/PhaseProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhaseProvider>{children}</PhaseProvider>
);

describe("PhaseProvider", () => {
  it("provides default state", () => {
    const { result } = renderHook(() => usePhase(), { wrapper });
    expect(result.current.gameState).toBe('PLAYER_SELECTION');
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.campaignRole).toBeNull();
  });

  it("accepts initial state override", () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <PhaseProvider initial={{ gameState: 'DRAFTING', currentPlayerIndex: 2 }}>
        {children}
      </PhaseProvider>
    );
    const { result } = renderHook(() => usePhase(), { wrapper: customWrapper });
    expect(result.current.gameState).toBe('DRAFTING');
    expect(result.current.currentPlayerIndex).toBe(2);
  });

  it("dispatch.patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: usePhase(), dispatch: usePhaseDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.patch({
        gameState: 'CAMPAIGN',
        currentPlayerIndex: 1,
        moverPlayerIndex: 1,
        campaignRole: "mover",
      });
    });
    expect(combined.result.current.state.gameState).toBe('CAMPAIGN');
    expect(combined.result.current.state.currentPlayerIndex).toBe(1);
    expect(combined.result.current.state.campaignRole).toBe("mover");
  });

  it("dispatch identity is stable across renders", () => {
    const combined = renderHook(
      () => ({ state: usePhase(), dispatch: usePhaseDispatch() }),
      { wrapper },
    );
    const firstDispatch = combined.result.current.dispatch;
    act(() => {
      combined.result.current.dispatch.setCurrentPlayerIndex(2);
    });
    expect(combined.result.current.dispatch).toBe(firstDispatch);
  });

  it("usePhase throws outside the provider", () => {
    // Suppress console.error for this test as React will log the boundary error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => usePhase())).toThrow(/usePhase must be used inside/);
    spy.mockRestore();
  });

  it("usePhaseDispatch throws outside the provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => usePhaseDispatch())).toThrow(/usePhaseDispatch must be used inside/);
    spy.mockRestore();
  });
});
