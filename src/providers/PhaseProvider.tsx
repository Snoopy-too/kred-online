// src/providers/PhaseProvider.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { GameState } from "../types/game";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface PhaseState {
  gameState: GameState;
  currentPlayerIndex: number;
  moverPlayerIndex: number;
  campaignRole: string | null;
}

export interface PhaseDispatch {
  setGameState: (gs: GameState) => void;
  setCurrentPlayerIndex: (i: number) => void;
  setMoverPlayerIndex: (i: number) => void;
  setCampaignRole: (r: string | null) => void;
  /** Atomically update multiple phase keys. Prefer this over multiple setters. */
  patch: (p: Partial<PhaseState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
// Two contexts so consumers that only dispatch don't re-render on state changes.
const PhaseStateContext = createContext<PhaseState | null>(null);
const PhaseDispatchContext = createContext<PhaseDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface PhaseProviderProps {
  children: ReactNode;
  initial?: Partial<PhaseState>;
}

const DEFAULT_PHASE_STATE: PhaseState = {
  gameState: 'PLAYER_SELECTION',
  currentPlayerIndex: 0,
  moverPlayerIndex: 0,
  campaignRole: null,
};

export function PhaseProvider({ children, initial }: PhaseProviderProps) {
  const [state, setState] = useState<PhaseState>({
    ...DEFAULT_PHASE_STATE,
    ...initial,
  });

  const dispatch = useMemo<PhaseDispatch>(
    () => ({
      setGameState: (gs) => setState((s) => ({ ...s, gameState: gs })),
      setCurrentPlayerIndex: (i) => setState((s) => ({ ...s, currentPlayerIndex: i })),
      setMoverPlayerIndex: (i) => setState((s) => ({ ...s, moverPlayerIndex: i })),
      setCampaignRole: (r) => setState((s) => ({ ...s, campaignRole: r })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <PhaseStateContext.Provider value={state}>
      <PhaseDispatchContext.Provider value={dispatch}>
        {children}
      </PhaseDispatchContext.Provider>
    </PhaseStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function usePhase(): PhaseState {
  const ctx = useContext(PhaseStateContext);
  if (!ctx) throw new Error("usePhase must be used inside <PhaseProvider>");
  return ctx;
}

export function usePhaseDispatch(): PhaseDispatch {
  const ctx = useContext(PhaseDispatchContext);
  if (!ctx) throw new Error("usePhaseDispatch must be used inside <PhaseProvider>");
  return ctx;
}
