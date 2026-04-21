import { PhaseState } from "./PhaseProvider";
import { RosterState } from "./RosterProvider";
import { CampaignState } from "./CampaignProvider";
import { Player, Piece } from "../types";

/**
 * Selectors are pure functions that derive state from one or more provider states.
 * They help keep components clean and provide a single source of truth for logic.
 */

// ─── Phase Selectors ─────────────────────────────────────────────────────────

export const selectIsMyTurn = (phase: PhaseState, playerIndex?: number): boolean => {
  return phase.currentPlayerIndex === playerIndex;
};

export const selectCurrentPlayer = (roster: RosterState, phase: PhaseState): Player | undefined => {
  return roster.players[phase.currentPlayerIndex];
};

// ─── Roster Selectors ────────────────────────────────────────────────────────

export const selectPlayerById = (roster: RosterState, id: number): Player | undefined => {
  return roster.players.find(p => p.id === id);
};

export const selectPlayerCount = (roster: RosterState): number => {
  return roster.players.length;
};

// ─── Roster Piece Selectors ──────────────────────────────────────────────────

export const selectPiecesAtLocation = (roster: RosterState, locationId: string): Piece[] => {
  return roster.pieces.filter(p => p.locationId === locationId);
};

// ─── Campaign Selectors ──────────────────────────────────────────────────────

export const selectIsMover = (phase: PhaseState, playerIndex?: number): boolean => {
  return phase.campaignRole === 'mover' && phase.currentPlayerIndex === playerIndex;
};

// ─── Multi-Provider Selectors ────────────────────────────────────────────────

/**
 * Derives the viewing player's ID based on lobby seat (multiplayer) or current turn (single-player).
 */
export const selectViewingPlayerId = (
  isMultiplayer: boolean,
  playerIndex: number | undefined,
  roster: RosterState,
  phase: PhaseState
): number => {
  if (isMultiplayer && playerIndex !== undefined) {
    return playerIndex + 1;
  }
  return roster.players[phase.currentPlayerIndex]?.id || 1;
};

/**
 * Checks if the current game state allows piece movement.
 */
export const selectCanMovePieces = (
  phase: PhaseState,
  campaign: CampaignState,
  isMultiplayer: boolean,
  playerIndex: number | undefined
): boolean => {
  // Common states where movement is allowed
  const allowablePhases = ['CAMPAIGN', 'TILE_PLAYED', 'CORRECTION_REQUIRED', 'BONUS_MOVE', 'BUREAUCRACY'];
  if (!allowablePhases.includes(phase.gameState)) return false;

  // In multiplayer, must be the local player's role/turn
  if (isMultiplayer && playerIndex !== undefined) {
    // This logic varies by specific phase, simplified here
    return phase.currentPlayerIndex === playerIndex;
  }

  return true;
};
