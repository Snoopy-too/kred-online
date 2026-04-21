import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { Player, Tile, BureaucracyPurchase, TrackedMove } from "../types";
import { usePhase } from "./PhaseProvider";
import { useRenderCount } from "../perf";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MoveCheckResult {
  isMet: boolean;
  requiredMoves: TrackedMove[];
  performedMoves: TrackedMove[];
  missingMoves: TrackedMove[];
  moveValidations?: Array<{
    moveType: string;
    isValid: boolean;
    reason: string;
    fromLocationId?: string;
    toLocationId?: string;
  }>;
}

export interface ChallengeState {
  bystanders: Player[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;
  isPrivatelyViewing: boolean;
  showChallengeRevealModal: boolean;
  challengedTile: Tile | null;
  placerViewingTileId: string | null;
  showMoveCheckResult: boolean;
  moveCheckResult: MoveCheckResult | null;
  showTakeAdvantageModal: boolean;
  takeAdvantageChallengerId: number | null;
  takeAdvantageChallengerCredibility: number;
  showTakeAdvantageTileSelection: boolean;
  selectedTilesForAdvantage: Tile[];
  totalKredcoinForAdvantage: number;
  showTakeAdvantageMenu: boolean;
  takeAdvantagePurchase: BureaucracyPurchase | null;
  takeAdvantageValidationError: string | null;
  challengeResultMessagePlayerId: number | null;
}

export interface ChallengeDispatch {
  setBystanders: (u: Player[] | ((prev: Player[]) => Player[])) => void;
  setBystanderIndex: (u: number | ((prev: number) => number)) => void;
  setChallengeOrder: (u: number[] | ((prev: number[]) => number[])) => void;
  setCurrentChallengerIndex: (u: number | ((prev: number) => number)) => void;
  setTileRejected: (u: boolean | ((prev: boolean) => boolean)) => void;
  setIsPrivatelyViewing: (u: boolean | ((prev: boolean) => boolean)) => void;
  setShowChallengeRevealModal: (u: boolean | ((prev: boolean) => boolean)) => void;
  setChallengedTile: (u: Tile | null | ((prev: Tile | null) => Tile | null)) => void;
  setPlacerViewingTileId: (u: string | null | ((prev: string | null) => string | null)) => void;
  setShowMoveCheckResult: (u: boolean | ((prev: boolean) => boolean)) => void;
  setMoveCheckResult: (u: MoveCheckResult | null | ((prev: MoveCheckResult | null) => MoveCheckResult | null)) => void;
  setShowTakeAdvantageModal: (u: boolean | ((prev: boolean) => boolean)) => void;
  setTakeAdvantageChallengerId: (u: number | null | ((prev: number | null) => number | null)) => void;
  setTakeAdvantageChallengerCredibility: (u: number | ((prev: number) => number)) => void;
  setShowTakeAdvantageTileSelection: (u: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedTilesForAdvantage: (u: Tile[] | ((prev: Tile[]) => Tile[])) => void;
  setTotalKredcoinForAdvantage: (u: number | ((prev: number) => number)) => void;
  setShowTakeAdvantageMenu: (u: boolean | ((prev: boolean) => boolean)) => void;
  setTakeAdvantagePurchase: (u: BureaucracyPurchase | null | ((prev: BureaucracyPurchase | null) => BureaucracyPurchase | null)) => void;
  setTakeAdvantageValidationError: (u: string | null | ((prev: string | null) => string | null)) => void;
  setChallengeResultMessagePlayerId: (u: number | null | ((prev: number | null) => number | null)) => void;
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
  isPrivatelyViewing: false,
  showChallengeRevealModal: false,
  challengedTile: null,
  placerViewingTileId: null,
  showMoveCheckResult: false,
  moveCheckResult: null,
  showTakeAdvantageModal: false,
  takeAdvantageChallengerId: null,
  takeAdvantageChallengerCredibility: 0,
  showTakeAdvantageTileSelection: false,
  selectedTilesForAdvantage: [],
  totalKredcoinForAdvantage: 0,
  showTakeAdvantageMenu: false,
  takeAdvantagePurchase: null,
  takeAdvantageValidationError: null,
  challengeResultMessagePlayerId: null,
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
        isPrivatelyViewing: false,
        showChallengeRevealModal: false,
        challengedTile: null,
        placerViewingTileId: null,
        showMoveCheckResult: false,
        moveCheckResult: null,
        showTakeAdvantageModal: false,
        takeAdvantageChallengerId: null,
        takeAdvantageChallengerCredibility: 0,
        showTakeAdvantageTileSelection: false,
        selectedTilesForAdvantage: [],
        totalKredcoinForAdvantage: 0,
        showTakeAdvantageMenu: false,
        takeAdvantagePurchase: null,
        takeAdvantageValidationError: null,
        challengeResultMessagePlayerId: null,
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
      setIsPrivatelyViewing: (u) =>
        setState((s) => ({ ...s, isPrivatelyViewing: typeof u === "function" ? u(s.isPrivatelyViewing) : u })),
      setShowChallengeRevealModal: (u) =>
        setState((s) => ({ ...s, showChallengeRevealModal: typeof u === "function" ? u(s.showChallengeRevealModal) : u })),
      setChallengedTile: (u) =>
        setState((s) => ({ ...s, challengedTile: typeof u === "function" ? u(s.challengedTile) : u })),
      setPlacerViewingTileId: (u) =>
        setState((s) => ({ ...s, placerViewingTileId: typeof u === "function" ? u(s.placerViewingTileId) : u })),
      setShowMoveCheckResult: (u) =>
        setState((s) => ({ ...s, showMoveCheckResult: typeof u === "function" ? u(s.showMoveCheckResult) : u })),
      setMoveCheckResult: (u) =>
        setState((s) => ({ ...s, moveCheckResult: typeof u === "function" ? u(s.moveCheckResult) : u })),
      setShowTakeAdvantageModal: (u) =>
        setState((s) => ({ ...s, showTakeAdvantageModal: typeof u === "function" ? u(s.showTakeAdvantageModal) : u })),
      setTakeAdvantageChallengerId: (u) =>
        setState((s) => ({ ...s, takeAdvantageChallengerId: typeof u === "function" ? u(s.takeAdvantageChallengerId) : u })),
      setTakeAdvantageChallengerCredibility: (u) =>
        setState((s) => ({ ...s, takeAdvantageChallengerCredibility: typeof u === "function" ? u(s.takeAdvantageChallengerCredibility) : u })),
      setShowTakeAdvantageTileSelection: (u) =>
        setState((s) => ({ ...s, showTakeAdvantageTileSelection: typeof u === "function" ? u(s.showTakeAdvantageTileSelection) : u })),
      setSelectedTilesForAdvantage: (u) =>
        setState((s) => ({ ...s, selectedTilesForAdvantage: typeof u === "function" ? u(s.selectedTilesForAdvantage) : u })),
      setTotalKredcoinForAdvantage: (u) =>
        setState((s) => ({ ...s, totalKredcoinForAdvantage: typeof u === "function" ? u(s.totalKredcoinForAdvantage) : u })),
      setShowTakeAdvantageMenu: (u) =>
        setState((s) => ({ ...s, showTakeAdvantageMenu: typeof u === "function" ? u(s.showTakeAdvantageMenu) : u })),
      setTakeAdvantagePurchase: (u) =>
        setState((s) => ({ ...s, takeAdvantagePurchase: typeof u === "function" ? u(s.takeAdvantagePurchase) : u })),
      setTakeAdvantageValidationError: (u) =>
        setState((s) => ({ ...s, takeAdvantageValidationError: typeof u === "function" ? u(s.takeAdvantageValidationError) : u })),
      setChallengeResultMessagePlayerId: (u) =>
        setState((s) => ({ ...s, challengeResultMessagePlayerId: typeof u === "function" ? u(s.challengeResultMessagePlayerId) : u })),
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
