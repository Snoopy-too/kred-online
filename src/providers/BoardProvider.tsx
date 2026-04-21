import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { Tile, BoardTile } from "../types";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface BoardState {
  boardTiles: BoardTile[];
  bankedTiles: (BoardTile & { faceUp: boolean })[];
}

export interface BoardDispatch {
  setBoardTiles: (updater: BoardTile[] | ((prev: BoardTile[]) => BoardTile[])) => void;
  setBankedTiles: (updater: (BoardTile & { faceUp: boolean })[] | ((prev: (BoardTile & { faceUp: boolean })[]) => (BoardTile & { faceUp: boolean })[])) => void;
  /** Atomically update multiple board keys. Prefer this over multiple setters. */
  patch: (p: Partial<BoardState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
// Two contexts so consumers that only dispatch don't re-render on state changes.
const BoardStateContext = createContext<BoardState | null>(null);
const BoardDispatchContext = createContext<BoardDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface BoardProviderProps {
  children: ReactNode;
  initial?: Partial<BoardState>;
}

const DEFAULT_BOARD_STATE: BoardState = {
  boardTiles: [],
  bankedTiles: [],
};

export function BoardProvider({ children, initial }: BoardProviderProps) {
  useRenderCount("BoardProvider");

  const [state, setState] = useState<BoardState>({
    ...DEFAULT_BOARD_STATE,
    ...initial,
  });

  const dispatch = useMemo<BoardDispatch>(
    () => ({
      setBoardTiles: (updater) =>
        setState((s) => ({
          ...s,
          boardTiles: typeof updater === "function" ? updater(s.boardTiles) : updater,
        })),
      setBankedTiles: (updater) =>
        setState((s) => ({
          ...s,
          bankedTiles: typeof updater === "function" ? updater(s.bankedTiles) : updater,
        })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <BoardStateContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useBoard(): BoardState {
  const ctx = useContext(BoardStateContext);
  if (!ctx) throw new Error("useBoard must be used inside <BoardProvider>");
  return ctx;
}

export function useBoardDispatch(): BoardDispatch {
  const ctx = useContext(BoardDispatchContext);
  if (!ctx) throw new Error("useBoardDispatch must be used inside <BoardProvider>");
  return ctx;
}
