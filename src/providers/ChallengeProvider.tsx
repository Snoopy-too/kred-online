import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { Player } from "../types";
import { usePhase } from "./PhaseProvider";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ChallengeState {
  bystanders: Player[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;
}

export interface ChallengeDispatch {
  setBystanders: (u: Player[] | ((prev: Player[]) => Player[])) => void;
  setBystanderIndex: (u: number | ((prev: number) => number)) => void;
  setChallengeOrder: (u: number[] | ((prev: number[]) => number[])) => void;
  setCurrentChallengerIndex: (u: number | ((prev: number) => number)) => void;
  setTileRejected: (u: boolean | ((prev: boolean) => boolean)) => void;
  /** Atomically update multiple challenge keys. Prefer this over multiple setters. */
  patch: (p: Partial<ChallengeState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
const ChallengeStateContext = createContext<ChallengeState | null>(null);
const ChallengeDispatchContext = createContext<ChallengeDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface ChallengeProviderProps {
  children: ReactNode;
  initial?: Partial<ChallengeState>;
}

const DEFAULT_CHALLENGE_STATE: ChallengeState = {
  bystanders: [],
  bystanderIndex: 0,
  challengeOrder: [],
  currentChallengerIndex: 0,
  tileRejected: false,
};

export function ChallengeProvider({ children, initial }: ChallengeProviderProps) {
  useRenderCount("ChallengeProvider");

  const phase = usePhase();

  const [state, setState] = useState<ChallengeState>({
    ...DEFAULT_CHALLENGE_STATE,
    ...initial,
  });

  // Reset challenge state on transition back to CAMPAIGN (challenge resolved).
  useEffect(() => {
    if (phase.gameState === "CAMPAIGN") {
      setState((prev) => ({
        ...prev,
        bystanderIndex: 0,
        challengeOrder: [],
        currentChallengerIndex: 0,
        tileRejected: false,
      }));
    }
  }, [phase.gameState]);

  const dispatch = useMemo<ChallengeDispatch>(
    () => ({
      setBystanders: (u) =>
        setState((s) => ({ ...s, bystanders: typeof u === "function" ? u(s.bystanders) : u })),
      setBystanderIndex: (u) =>
        setState((s) => ({ ...s, bystanderIndex: typeof u === "function" ? u(s.bystanderIndex) : u })),
      setChallengeOrder: (u) =>
        setState((s) => ({ ...s, challengeOrder: typeof u === "function" ? u(s.challengeOrder) : u })),
      setCurrentChallengerIndex: (u) =>
        setState((s) => ({ ...s, currentChallengerIndex: typeof u === "function" ? u(s.currentChallengerIndex) : u })),
      setTileRejected: (u) =>
        setState((s) => ({ ...s, tileRejected: typeof u === "function" ? u(s.tileRejected) : u })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <ChallengeStateContext.Provider value={state}>
      <ChallengeDispatchContext.Provider value={dispatch}>
        {children}
      </ChallengeDispatchContext.Provider>
    </ChallengeStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useChallenge(): ChallengeState {
  const ctx = useContext(ChallengeStateContext);
  if (!ctx) throw new Error("useChallenge must be used inside <ChallengeProvider>");
  return ctx;
}

export function useChallengeDispatch(): ChallengeDispatch {
  const ctx = useContext(ChallengeDispatchContext);
  if (!ctx) throw new Error("useChallengeDispatch must be used inside <ChallengeProvider>");
  return ctx;
}
