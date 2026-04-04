/**
 * Faction Collapse Rule
 *
 * Manual: "If a piece occupies a Rostrum in any Faction where no Seats are occupied,
 * that piece must immediately be moved down to a Seat of that player's choice in
 * the corresponding faction. Likewise, if a piece occupies any player's Office while
 * neither of their Rostrums are occupied, that piece must also be immediately moved
 * down to a Rostrum of that player's choice."
 */

import type { Piece } from "../types";

export interface CollapseAction {
  pieceId: string;
  fromLocationId: string;
  validDestinations: string[];
}

/**
 * Detects all pieces that must collapse due to unsupported positions.
 * Office collapses listed before rostrum collapses (resolve top-down).
 */
export function detectFactionCollapse(
  pieces: Piece[],
  playerCount: number
): CollapseAction[] {
  const collapses: CollapseAction[] = [];

  for (let playerId = 1; playerId <= playerCount; playerId++) {
    // Check office: needs at least one rostrum occupied
    const officePiece = pieces.find(
      (p) => p.locationId === `p${playerId}_office`
    );
    if (officePiece) {
      const rostrum1Occupied = pieces.some(
        (p) => p.locationId === `p${playerId}_rostrum1`
      );
      const rostrum2Occupied = pieces.some(
        (p) => p.locationId === `p${playerId}_rostrum2`
      );
      if (!rostrum1Occupied && !rostrum2Occupied) {
        const validDestinations: string[] = [];
        validDestinations.push(`p${playerId}_rostrum1`);
        validDestinations.push(`p${playerId}_rostrum2`);
        collapses.push({
          pieceId: officePiece.id,
          fromLocationId: `p${playerId}_office`,
          validDestinations,
        });
      }
    }

    // Check rostrum1: needs at least one of seats 1-3 occupied
    const rostrum1Piece = pieces.find(
      (p) => p.locationId === `p${playerId}_rostrum1`
    );
    if (rostrum1Piece) {
      const faction1HasSeat = [1, 2, 3].some((s) =>
        pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
      );
      if (!faction1HasSeat) {
        const vacantSeats = [1, 2, 3].filter(
          (s) => !pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
        );
        collapses.push({
          pieceId: rostrum1Piece.id,
          fromLocationId: `p${playerId}_rostrum1`,
          validDestinations: vacantSeats.map((s) => `p${playerId}_seat${s}`),
        });
      }
    }

    // Check rostrum2: needs at least one of seats 4-6 occupied
    const rostrum2Piece = pieces.find(
      (p) => p.locationId === `p${playerId}_rostrum2`
    );
    if (rostrum2Piece) {
      const faction2HasSeat = [4, 5, 6].some((s) =>
        pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
      );
      if (!faction2HasSeat) {
        const vacantSeats = [4, 5, 6].filter(
          (s) => !pieces.some((p) => p.locationId === `p${playerId}_seat${s}`)
        );
        collapses.push({
          pieceId: rostrum2Piece.id,
          fromLocationId: `p${playerId}_rostrum2`,
          validDestinations: vacantSeats.map((s) => `p${playerId}_seat${s}`),
        });
      }
    }
  }

  return collapses;
}
