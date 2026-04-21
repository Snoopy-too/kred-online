import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  ChallengeProvider,
  useChallenge,
  useChallengeDispatch,
} from "../../providers/ChallengeProvider";
import { PhaseProvider, usePhaseDispatch } from "../../providers/PhaseProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhaseProvider>
    <ChallengeProvider>{children}</ChallengeProvider>
  </PhaseProvider>
);

describe("ChallengeProvider", () => {
  it("provides default empty state", () => {
    const { result } = renderHook(() => useChallenge(), { wrapper });
    expect(result.current.bystanders).toEqual([]);
    expect(result.current.bystanderIndex).toBe(0);
    expect(result.current.challengeOrder).toEqual([]);
    expect(result.current.currentChallengerIndex).toBe(0);
    expect(result.current.tileRejected).toBe(false);
  });

  it("accepts initial state override", () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <PhaseProvider>
        <ChallengeProvider initial={{ challengeOrder: [2, 3], tileRejected: true }}>
          {children}
        </ChallengeProvider>
      </PhaseProvider>
    );
    const { result } = renderHook(() => useChallenge(), { wrapper: customWrapper });
    expect(result.current.challengeOrder).toEqual([2, 3]);
    expect(result.current.tileRejected).toBe(true);
  });

  it("setters support functional updaters", () => {
    const combined = renderHook(
      () => ({ state: useChallenge(), dispatch: useChallengeDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.setChallengeOrder([1, 2, 3]);
      combined.result.current.dispatch.setCurrentChallengerIndex((n) => n + 2);
    });
    expect(combined.result.current.state.challengeOrder).toEqual([1, 2, 3]);
    expect(combined.result.current.state.currentChallengerIndex).toBe(2);
  });

  it("patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: useChallenge(), dispatch: useChallengeDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.patch({
        challengeOrder: [4, 5],
        tileRejected: true,
      });
    });
    expect(combined.result.current.state.challengeOrder).toEqual([4, 5]);
    expect(combined.result.current.state.tileRejected).toBe(true);
  });

  it("auto-resets challenge state on phase transition to CAMPAIGN", () => {
    const combined = renderHook(
      () => ({
        state: useChallenge(),
        dispatch: useChallengeDispatch(),
        phaseDispatch: usePhaseDispatch(),
      }),
      { wrapper },
    );

    act(() => {
      combined.result.current.dispatch.patch({
        challengeOrder: [2, 3],
        currentChallengerIndex: 1,
        tileRejected: true,
        bystanderIndex: 2,
      });
      combined.result.current.phaseDispatch.setGameState("PENDING_CHALLENGE" as any);
    });

    expect(combined.result.current.state.tileRejected).toBe(true);

    act(() => {
      combined.result.current.phaseDispatch.setGameState("CAMPAIGN");
    });

    expect(combined.result.current.state.challengeOrder).toEqual([]);
    expect(combined.result.current.state.currentChallengerIndex).toBe(0);
    expect(combined.result.current.state.tileRejected).toBe(false);
    expect(combined.result.current.state.bystanderIndex).toBe(0);
  });

  it("useChallenge throws outside provider", () => {
    expect(() => renderHook(() => useChallenge())).toThrow(/useChallenge must be used inside/);
  });

  it("useChallengeDispatch throws outside provider", () => {
    expect(() => renderHook(() => useChallengeDispatch())).toThrow(/useChallengeDispatch must be used inside/);
  });
});
