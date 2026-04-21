import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import type { PlayedTileState, TileTransaction } from "../hooks/useTilePlayWorkflow";
import type { TrackedMove } from "../types/move";
import { usePhase } from "./PhaseProvider";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CampaignState {
  playedTile: PlayedTileState | null;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: Set<string>;
  tileTransaction: TileTransaction | null;
  tileRevealed: boolean;
  pendingReceiverReward: boolean;
  receiverAdvanceInProgress: boolean;
  revealedTileId: string | null;
  giveReceiverViewingTileId: string | null;
  receiverAcceptance: boolean | null;
  showPerfectTileModal: boolean;
  showBonusMoveModal: boolean;
  bonusMovePlayerId: number | null;
  movesThisTurn: TrackedMove[];
}

export interface CampaignDispatch {
  setPlayedTile: (updater: PlayedTileState | null | ((prev: PlayedTileState | null) => PlayedTileState | null)) => void;
  setHasPlayedTileThisTurn: (v: boolean | ((prev: boolean) => boolean)) => void;
  setMovedPiecesThisTurn: (v: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setTileTransaction: (v: TileTransaction | null | ((prev: TileTransaction | null) => TileTransaction | null)) => void;
  setTileRevealed: (v: boolean | ((prev: boolean) => boolean)) => void;
  setPendingReceiverReward: (v: boolean | ((prev: boolean) => boolean)) => void;
  setReceiverAdvanceInProgress: (v: boolean | ((prev: boolean) => boolean)) => void;
  setRevealedTileId: (v: string | null | ((prev: string | null) => string | null)) => void;
  setGiveReceiverViewingTileId: (v: string | null | ((prev: string | null) => string | null)) => void;
  setReceiverAcceptance: (v: boolean | null | ((prev: boolean | null) => boolean | null)) => void;
  setShowPerfectTileModal: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowBonusMoveModal: (v: boolean | ((prev: boolean) => boolean)) => void;
  setBonusMovePlayerId: (v: number | null | ((prev: number | null) => number | null)) => void;
  setMovesThisTurn: (v: TrackedMove[] | ((prev: TrackedMove[]) => TrackedMove[])) => void;
  /** Atomically update multiple campaign keys. Prefer this over multiple setters. */
  patch: (p: Partial<CampaignState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
const CampaignStateContext = createContext<CampaignState | null>(null);
const CampaignDispatchContext = createContext<CampaignDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface CampaignProviderProps {
  children: ReactNode;
  initial?: Partial<CampaignState>;
}

const DEFAULT_CAMPAIGN_STATE: CampaignState = {
  playedTile: null,
  hasPlayedTileThisTurn: false,
  movedPiecesThisTurn: new Set(),
  tileTransaction: null,
  tileRevealed: false,
  pendingReceiverReward: false,
  receiverAdvanceInProgress: false,
  revealedTileId: null,
  giveReceiverViewingTileId: null,
  receiverAcceptance: null,
  showPerfectTileModal: false,
  showBonusMoveModal: false,
  bonusMovePlayerId: null,
  movesThisTurn: [],
};

export function CampaignProvider({ children, initial }: CampaignProviderProps) {
  useRenderCount("CampaignProvider");

  const phase = usePhase();

  const [state, setState] = useState<CampaignState>({
    ...DEFAULT_CAMPAIGN_STATE,
    ...initial,
  });

  // Auto-reset transient campaign state when entering the CAMPAIGN phase
  useEffect(() => {
    if (phase.gameState === "CAMPAIGN") {
      setState((prev) => ({
        ...prev,
        playedTile: null,
        hasPlayedTileThisTurn: false,
        movedPiecesThisTurn: new Set(),
        tileTransaction: null,
        tileRevealed: false,
        pendingReceiverReward: false,
        receiverAdvanceInProgress: false,
        revealedTileId: null,
        giveReceiverViewingTileId: null,
        receiverAcceptance: null,
        showPerfectTileModal: false,
        showBonusMoveModal: false,
        bonusMovePlayerId: null,
        movesThisTurn: [],
      }));
    }
  }, [phase.gameState]);

  const dispatch = useMemo<CampaignDispatch>(
    () => ({
      setPlayedTile: (updater) =>
        setState((s) => ({
          ...s,
          playedTile: typeof updater === "function" ? updater(s.playedTile) : updater,
        })),
      setHasPlayedTileThisTurn: (updater) =>
        setState((s) => ({
          ...s,
          hasPlayedTileThisTurn: typeof updater === "function" ? updater(s.hasPlayedTileThisTurn) : updater,
        })),
      setMovedPiecesThisTurn: (updater) =>
        setState((s) => ({
          ...s,
          movedPiecesThisTurn: typeof updater === "function" ? updater(s.movedPiecesThisTurn) : updater,
        })),
      setTileTransaction: (updater) =>
        setState((s) => ({
          ...s,
          tileTransaction: typeof updater === "function" ? updater(s.tileTransaction) : updater,
        })),
      setTileRevealed: (updater) =>
        setState((s) => ({
          ...s,
          tileRevealed: typeof updater === "function" ? updater(s.tileRevealed) : updater,
        })),
      setPendingReceiverReward: (updater) =>
        setState((s) => ({
          ...s,
          pendingReceiverReward: typeof updater === "function" ? updater(s.pendingReceiverReward) : updater,
        })),
      setReceiverAdvanceInProgress: (updater) =>
        setState((s) => ({
          ...s,
          receiverAdvanceInProgress: typeof updater === "function" ? updater(s.receiverAdvanceInProgress) : updater,
        })),
      setRevealedTileId: (updater) =>
        setState((s) => ({
          ...s,
          revealedTileId: typeof updater === "function" ? updater(s.revealedTileId) : updater,
        })),
      setGiveReceiverViewingTileId: (updater) =>
        setState((s) => ({
          ...s,
          giveReceiverViewingTileId: typeof updater === "function" ? updater(s.giveReceiverViewingTileId) : updater,
        })),
      setReceiverAcceptance: (updater) =>
        setState((s) => ({
          ...s,
          receiverAcceptance: typeof updater === "function" ? updater(s.receiverAcceptance) : updater,
        })),
      setShowPerfectTileModal: (updater) =>
        setState((s) => ({
          ...s,
          showPerfectTileModal: typeof updater === "function" ? updater(s.showPerfectTileModal) : updater,
        })),
      setShowBonusMoveModal: (updater) =>
        setState((s) => ({
          ...s,
          showBonusMoveModal: typeof updater === "function" ? updater(s.showBonusMoveModal) : updater,
        })),
      setBonusMovePlayerId: (updater) =>
        setState((s) => ({
          ...s,
          bonusMovePlayerId: typeof updater === "function" ? updater(s.bonusMovePlayerId) : updater,
        })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <CampaignStateContext.Provider value={state}>
      <CampaignDispatchContext.Provider value={dispatch}>
        {children}
      </CampaignDispatchContext.Provider>
    </CampaignStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function useCampaign(): CampaignState {
  const ctx = useContext(CampaignStateContext);
  if (!ctx) throw new Error("useCampaign must be used inside <CampaignProvider>");
  return ctx;
}

export function useCampaignDispatch(): CampaignDispatch {
  const ctx = useContext(CampaignDispatchContext);
  if (!ctx) throw new Error("useCampaignDispatch must be used inside <CampaignProvider>");
  return ctx;
}