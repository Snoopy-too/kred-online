import React, { createContext, useContext, ReactNode } from "react";

/**
 * HandlersProvider
 *
 * Three per-screen contexts + a shared multiplayer/common bag. App.tsx
 * builds the values; ScreenRouter + screens consume via hooks. Lets
 * ScreenRouter render screens without drilling props.
 *
 * Contexts are `any`-typed at the edge so App and the screens stay the
 * source of truth for the actual shape. Each screen's destructure keeps
 * its own Props type intact.
 */

type AnyRecord = Record<string, any>;

const CommonContext = createContext<AnyRecord | null>(null);
const DraftingContext = createContext<AnyRecord | null>(null);
const CampaignContext = createContext<AnyRecord | null>(null);
const BureaucracyContext = createContext<AnyRecord | null>(null);

interface HandlersProviderProps {
  children: ReactNode;
  common: AnyRecord;
  drafting: AnyRecord;
  campaign: AnyRecord;
  bureaucracy: AnyRecord;
}

export function HandlersProvider({
  children,
  common,
  drafting,
  campaign,
  bureaucracy,
}: HandlersProviderProps) {
  return (
    <CommonContext.Provider value={common}>
      <DraftingContext.Provider value={drafting}>
        <CampaignContext.Provider value={campaign}>
          <BureaucracyContext.Provider value={bureaucracy}>
            {children}
          </BureaucracyContext.Provider>
        </CampaignContext.Provider>
      </DraftingContext.Provider>
    </CommonContext.Provider>
  );
}

export function useHandlers<T = AnyRecord>(): T {
  const ctx = useContext(CommonContext);
  if (!ctx) throw new Error("useHandlers must be used inside <HandlersProvider>");
  return ctx as T;
}

export function useDraftingHandlers<T = AnyRecord>(): T {
  const ctx = useContext(DraftingContext);
  if (!ctx) throw new Error("useDraftingHandlers must be used inside <HandlersProvider>");
  return ctx as T;
}

export function useCampaignHandlers<T = AnyRecord>(): T {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaignHandlers must be used inside <HandlersProvider>");
  return ctx as T;
}

export function useBureaucracyScreenHandlers<T = AnyRecord>(): T {
  const ctx = useContext(BureaucracyContext);
  if (!ctx)
    throw new Error("useBureaucracyScreenHandlers must be used inside <HandlersProvider>");
  return ctx as T;
}
