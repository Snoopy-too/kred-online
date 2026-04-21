// src/providers/GameProviders.tsx
import { ReactNode } from "react";
import { PhaseProvider, PhaseState } from "./PhaseProvider";
import { RosterProvider, RosterState } from "./RosterProvider";
import { BoardProvider, BoardState } from "./BoardProvider";
import { CampaignProvider, CampaignState } from "./CampaignProvider";
import { ChallengeProvider, ChallengeState } from "./ChallengeProvider";

interface GameProvidersProps {
  children: ReactNode;
  initial?: {
    phase?: Partial<PhaseState>;
    roster?: Partial<RosterState>;
    board?: Partial<BoardState>;
    campaign?: Partial<CampaignState>;
    challenge?: Partial<ChallengeState>;
  };
}

/**
 * Composition root for all game providers.
 *
 * Today: only PhaseProvider. Step 7 will add Roster, Board, Campaign,
 * Challenge, and Bureaucracy providers here.
 */
export function GameProviders({ children, initial }: GameProvidersProps) {
  return (
    <PhaseProvider initial={initial?.phase}>
      <RosterProvider initial={initial?.roster}>
        <BoardProvider initial={initial?.board}>
          <CampaignProvider initial={initial?.campaign}>
            <ChallengeProvider initial={initial?.challenge}>
              {children}
            </ChallengeProvider>
          </CampaignProvider>
        </BoardProvider>
      </RosterProvider>
    </PhaseProvider>
  );
}
