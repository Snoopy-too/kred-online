// src/providers/GameProviders.tsx
import { ReactNode } from "react";
import { PhaseProvider, PhaseState } from "./PhaseProvider";
import { RosterProvider, RosterState } from "./RosterProvider";

interface GameProvidersProps {
  children: ReactNode;
  initial?: {
    phase?: Partial<PhaseState>;
    roster?: Partial<RosterState>;
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
        {children}
      </RosterProvider>
    </PhaseProvider>
  );
}
