import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { Player, Piece } from "../types";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface RosterState {
  players: Player[];
  pieces: Piece[];
}

export interface RosterDispatch {
  setPlayers: (updater: Player[] | ((prev: Player[]) => Player[])) => void;
  setPieces: (updater: Piece[] | ((prev: Piece[]) => Piece[])) => void;
  /** Atomically update multiple roster keys. Prefer this over multiple setters. */
  patch: (p: Partial<RosterState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
// Two contexts so consumers that only dispatch don't re-render on state changes.
const RosterStateContext = createContext<RosterState | null>(null);
const RosterDispatchContext = createContext<RosterDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface RosterProviderProps {
  children: ReactNode;
  initial?: Partial<RosterState>;
}

const DEFAULT_ROSTER_STATE: RosterState = {
  players: [],
  pieces: [],
};

export function RosterProvider({ children, initial }: RosterProviderProps) {
  useRenderCount("RosterProvider");

  const [state, setState] = useState<RosterState>({
    ...DEFAULT_ROSTER_STATE,
    ...initial,
  });

  const dispatch = useMemo<RosterDispatch>(
    () => ({
      setPlayers: (updater) =>
        setState((s) => ({
          ...s,
          players: typeof updater === "function" ? updater(s.players) : updater,
        })),
      setPieces: (updater) =>
        setState((s) => ({
          ...s,
          pieces: typeof updater === "function" ? updater(s.pieces) : updater,
        })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <RosterStateContext.Provider value={state}>
      <RosterDispatchContext.Provider value={dispatch}>
        {children}
      </RosterDispatchContext.Provider>
    </RosterStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useRoster(): RosterState {
  const ctx = useContext(RosterStateContext);
  if (!ctx) throw new Error("useRoster must be used inside <RosterProvider>");
  return ctx;
}

export function useRosterDispatch(): RosterDispatch {
  const ctx = useContext(RosterDispatchContext);
  if (!ctx) throw new Error("useRosterDispatch must be used inside <RosterProvider>");
  return ctx;
}
