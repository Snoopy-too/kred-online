import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  CampaignProvider,
  useCampaign,
  useCampaignDispatch,
} from "../../providers/CampaignProvider";
import { PhaseProvider, usePhaseDispatch } from "../../providers/PhaseProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhaseProvider>
    <CampaignProvider>{children}</CampaignProvider>
  </PhaseProvider>
);

describe("CampaignProvider", () => {
  it("provides default empty state", () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    expect(result.current.playedTile).toBeNull();
    expect(result.current.hasPlayedTileThisTurn).toBe(false);
    expect(result.current.movedPiecesThisTurn).toBeInstanceOf(Set);
    expect(result.current.movedPiecesThisTurn.size).toBe(0);
    expect(result.current.tileTransaction).toBeNull();
    expect(result.current.tileRevealed).toBe(false);
    expect(result.current.pendingReceiverReward).toBe(false);
    expect(result.current.receiverAdvanceInProgress).toBe(false);
  });

  it("accepts initial state override", () => {
    const mockTile: any = { tileId: 1 };
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <PhaseProvider>
        <CampaignProvider initial={{ playedTile: mockTile }}>
          {children}
        </CampaignProvider>
      </PhaseProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper: customWrapper });
    expect(result.current.playedTile).toEqual(mockTile);
  });

  it("dispatch.patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: useCampaign(), dispatch: useCampaignDispatch() }),
      { wrapper },
    );

    const mockTile: any = { tileId: 2 };
    act(() => {
      combined.result.current.dispatch.patch({
        playedTile: mockTile,
        hasPlayedTileThisTurn: true,
      });
    });
    expect(combined.result.current.state.playedTile).toEqual(mockTile);
    expect(combined.result.current.state.hasPlayedTileThisTurn).toBe(true);
  });

  it("auto-resets state when phase transitions to CAMPAIGN", () => {
    const combined = renderHook(
      () => ({
        state: useCampaign(),
        dispatch: useCampaignDispatch(),
        phaseDispatch: usePhaseDispatch(),
      }),
      { wrapper },
    );

    // First, set some transient state
    act(() => {
      combined.result.current.dispatch.patch({
        playedTile: { tileId: "99" } as any,
        hasPlayedTileThisTurn: true,
        tileRevealed: true,
        movedPiecesThisTurn: new Set(["piece_1"]),
      });
      // Move out of CAMPAIGN so we can trigger the transition back
      combined.result.current.phaseDispatch.setGameState("BUREAUCRACY");
    });

    expect(combined.result.current.state.hasPlayedTileThisTurn).toBe(true);

    // Now transition to CAMPAIGN
    act(() => {
      combined.result.current.phaseDispatch.setGameState("CAMPAIGN");
    });

    // Verify it reset
    expect(combined.result.current.state.playedTile).toBeNull();
    expect(combined.result.current.state.hasPlayedTileThisTurn).toBe(false);
    expect(combined.result.current.state.tileRevealed).toBe(false);
    expect(combined.result.current.state.movedPiecesThisTurn.size).toBe(0);
  });
});