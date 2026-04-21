import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import type { BureaucracyPlayerState } from "../types";
import { usePhase } from "./PhaseProvider";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface BureaucracyProviderState {
  bureaucracyStates: BureaucracyPlayerState[];
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
}

export interface BureaucracyDispatch {
  setBureaucracyStates: (u: BureaucracyPlayerState[] | ((prev: BureaucracyPlayerState[]) => BureaucracyPlayerState[])) => void;
  setBureaucracyTurnOrder: (u: number[] | ((prev: number[]) => number[])) => void;
  setCurrentBureaucracyPlayerIndex: (u: number | ((prev: number) => number)) => void;
  /** Atomically update multiple bureaucracy keys. Prefer this over multiple setters. */
  patch: (p: Partial<BureaucracyProviderState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
const BureaucracyStateContext = createContext<BureaucracyProviderState | null>(null);
const BureaucracyDispatchContext = createContext<BureaucracyDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface BureaucracyProviderProps {
  children: ReactNode;
  initial?: Partial<BureaucracyProviderState>;
}

const DEFAULT_BUREAUCRACY_STATE: BureaucracyProviderState = {
  bureaucracyStates: [],
  bureaucracyTurnOrder: [],
  currentBureaucracyPlayerIndex: 0,
};

export function BureaucracyProvider({ children, initial }: BureaucracyProviderProps) {
  useRenderCount("BureaucracyProvider");

  const phase = usePhase();

  const [state, setState] = useState<BureaucracyProviderState>({
    ...DEFAULT_BUREAUCRACY_STATE,
    ...initial,
  });

  // On transition out of BUREAUCRACY (back to CAMPAIGN next round), reset the
  // bureaucracy-player-index cursor. Keep bureaucracyStates/turnOrder as-is so
  // a fresh phase entry rebuilds them from players.
  useEffect(() => {
    if (phase.gameState === "CAMPAIGN") {
      setState((prev) => ({
        ...prev,
        currentBureaucracyPlayerIndex: 0,
      }));
    }
  }, [phase.gameState]);

  const dispatch = useMemo<BureaucracyDispatch>(
    () => ({
      setBureaucracyStates: (u) =>
        setState((s) => ({ ...s, bureaucracyStates: typeof u === "function" ? u(s.bureaucracyStates) : u })),
      setBureaucracyTurnOrder: (u) =>
        setState((s) => ({ ...s, bureaucracyTurnOrder: typeof u === "function" ? u(s.bureaucracyTurnOrder) : u })),
      setCurrentBureaucracyPlayerIndex: (u) =>
        setState((s) => ({ ...s, currentBureaucracyPlayerIndex: typeof u === "function" ? u(s.currentBureaucracyPlayerIndex) : u })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <BureaucracyStateContext.Provider value={state}>
      <BureaucracyDispatchContext.Provider value={dispatch}>
        {children}
      </BureaucracyDispatchContext.Provider>
    </BureaucracyStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useBureaucracyProvider(): BureaucracyProviderState {
  const ctx = useContext(BureaucracyStateContext);
  if (!ctx) throw new Error("useBureaucracyProvider must be used inside <BureaucracyProvider>");
  return ctx;
}

export function useBureaucracyDispatch(): BureaucracyDispatch {
  const ctx = useContext(BureaucracyDispatchContext);
  if (!ctx) throw new Error("useBureaucracyDispatch must be used inside <BureaucracyProvider>");
  return ctx;
}
