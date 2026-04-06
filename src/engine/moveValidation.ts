// src/engine/moveValidation.ts
import { DefinedMoveType } from '@kred/shared';
import {
  areSeatsAdjacent,
  getAdjacentSeats,
  areRostrumsAdjacent,
  getAdjacentRostrum,
  ROSTRUM_SUPPORT_RULES,
  ROSTRUM_ADJACENCY_BY_PLAYER_COUNT,
} from '@kred/shared';
import type { KredPiece, EngineMove } from './types';

// ============================================================================
// HELPERS
// ============================================================================

function getOwner(locationId: string): number | null {
  const match = locationId.match(/^p(\d+)_/);
  return match ? parseInt(match[1]) : null;
}

function isCommunity(locationId: string): boolean {
  return locationId === 'community' || locationId.startsWith('community');
}

function isSeat(locationId: string): boolean {
  return /^p\d+_seat\d$/.test(locationId);
}

function isRostrum(locationId: string): boolean {
  return /^p\d+_rostrum\d$/.test(locationId);
}

function isOffice(locationId: string): boolean {
  return /^p\d+_office$/.test(locationId);
}

function isVacant(locationId: string, pieces: KredPiece[]): boolean {
  return !pieces.some(p => p.locationId === locationId);
}

function getPiece(pieces: KredPiece[], pieceId: string): KredPiece | undefined {
  return pieces.find(p => p.id === pieceId);
}

function marksInCommunity(pieces: KredPiece[]): boolean {
  return pieces.some(p => p.type === 'MARK' && isCommunity(p.locationId));
}

function heelsInCommunity(pieces: KredPiece[]): boolean {
  return pieces.some(p => p.type === 'HEEL' && isCommunity(p.locationId));
}

/**
 * Checks whether a piece can be taken from community per hierarchy rules:
 * Marks > Heels > Pawns — lower types cannot move if higher types remain
 */
function canTakeFromCommunity(piece: KredPiece, pieces: KredPiece[]): boolean {
  if (piece.type === 'MARK') return true;
  if (piece.type === 'HEEL') return !marksInCommunity(pieces);
  if (piece.type === 'PAWN') return !marksInCommunity(pieces) && !heelsInCommunity(pieces);
  return false;
}

/**
 * Checks whether all 3 supporting seats for a given rostrum are occupied.
 */
function isFactionFull(rostrumId: string, pieces: KredPiece[]): boolean {
  const playerId = getOwner(rostrumId);
  if (!playerId) return false;
  const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
  if (!playerRules) return false;
  const rostrumRule = playerRules.rostrums.find(r => r.rostrum === rostrumId);
  if (!rostrumRule) return false;
  return rostrumRule.supportingSeats.every(seatId =>
    pieces.some(p => p.locationId === seatId)
  );
}

/**
 * Returns the rostrum a seat supports (rostrum1 for seats 1-3, rostrum2 for seats 4-6).
 */
function getRostrumForSeat(seatId: string): string | null {
  const match = seatId.match(/^(p\d+)_seat(\d)$/);
  if (!match) return null;
  const domain = match[1];
  const seatNum = parseInt(match[2]);
  return seatNum <= 3 ? `${domain}_rostrum1` : `${domain}_rostrum2`;
}

/**
 * Returns the supporting seats for a given rostrum.
 */
function getSupportingSeats(rostrumId: string): string[] {
  const playerId = getOwner(rostrumId);
  if (!playerId) return [];
  const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
  if (!playerRules) return [];
  const rostrumRule = playerRules.rostrums.find(r => r.rostrum === rostrumId);
  return rostrumRule ? rostrumRule.supportingSeats : [];
}

// ============================================================================
// PER-MOVE VALIDATORS
// ============================================================================

function validateAdvance(move: EngineMove, playerId: number, pieces: KredPiece[]): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Option A: Community -> own vacant seat (Marks > Heels, no Pawns allowed via ADVANCE)
  if (isCommunity(from) && isSeat(to)) {
    // Must target own domain
    if (getOwner(to) !== playerId) return false;
    // Target must be vacant
    if (!isVacant(to, pieces)) return false;
    // Hierarchy: Marks before Heels, Pawns not allowed for ADVANCE
    if (piece.type === 'PAWN') return false;
    return canTakeFromCommunity(piece, pieces);
  }

  // Option B: Seat -> Rostrum (faction must be full, seat must support this rostrum)
  if (isSeat(from) && isRostrum(to)) {
    // Must be own piece
    if (getOwner(from) !== playerId) return false;
    // Target must be own rostrum
    if (getOwner(to) !== playerId) return false;
    // Seat must support this specific rostrum
    const supportingRostrum = getRostrumForSeat(from);
    if (supportingRostrum !== to) return false;
    // All 3 supporting seats must be occupied
    return isFactionFull(to, pieces);
  }

  // Option C: Rostrum -> Office (both rostrums must be occupied)
  if (isRostrum(from) && isOffice(to)) {
    // Must be own piece
    if (getOwner(from) !== playerId) return false;
    // Must target own office
    if (getOwner(to) !== playerId) return false;
    // Both rostrums must have at least one piece
    const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
    if (!playerRules) return false;
    return playerRules.rostrums.every(r => pieces.some(p => p.locationId === r.rostrum));
  }

  return false;
}

function validateWithdraw(move: EngineMove, playerId: number, pieces: KredPiece[]): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Must be own piece
  if (getOwner(from) !== playerId) return false;

  // Option A: Seat -> Community
  if (isSeat(from) && isCommunity(to)) {
    return true;
  }

  // Option B: Rostrum -> vacant seat in same domain
  if (isRostrum(from) && isSeat(to)) {
    if (getOwner(to) !== playerId) return false;
    // Target seat must be a supporting seat of this rostrum
    const supportingSeats = getSupportingSeats(from);
    if (!supportingSeats.includes(to)) return false;
    return isVacant(to, pieces);
  }

  // Option C: Office -> vacant rostrum in own domain
  if (isOffice(from) && isRostrum(to)) {
    if (getOwner(to) !== playerId) return false;
    return isVacant(to, pieces);
  }

  return false;
}

function validateOrganize(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Must be own piece
  if (getOwner(from) !== playerId) return false;

  // Seat -> adjacent seat (may cross domains)
  if (isSeat(from) && isSeat(to)) {
    if (!areSeatsAdjacent(from, to, playerCount)) return false;
    return isVacant(to, pieces);
  }

  // Rostrum -> adjacent rostrum (own rostrum to adjacent opponent rostrum)
  if (isRostrum(from) && isRostrum(to)) {
    if (!areRostrumsAdjacent(from, to, playerCount)) return false;
    return isVacant(to, pieces);
  }

  return false;
}

function validateRemove(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Must go to community
  if (!isCommunity(to)) return false;

  // Must come from a seat (not rostrum/office)
  if (!isSeat(from)) return false;

  // Must be opponent's seat
  const seatOwner = getOwner(from);
  if (seatOwner === null || seatOwner === playerId) return false;
  if (seatOwner < 1 || seatOwner > playerCount) return false;

  // Only Marks can be removed (not Heels, not Pawns per test expectations)
  return piece.type === 'MARK';
}

function validateInfluence(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Must be opponent's piece
  const fromOwner = getOwner(from);
  if (fromOwner === null || fromOwner === playerId) return false;

  // Seat -> adjacent seat
  if (isSeat(from) && isSeat(to)) {
    if (!areSeatsAdjacent(from, to, playerCount)) return false;
    // Pawns cannot cross domains
    if (piece.type === 'PAWN' && getOwner(from) !== getOwner(to)) return false;
    return isVacant(to, pieces);
  }

  // Rostrum -> adjacent rostrum (no Pawns)
  if (isRostrum(from) && isRostrum(to)) {
    if (piece.type === 'PAWN') return false;
    if (!areRostrumsAdjacent(from, to, playerCount)) return false;
    return isVacant(to, pieces);
  }

  return false;
}

function validateAssist(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;

  const from = move.fromLocationId;
  const to = move.toLocationId;

  // Must come from community
  if (!isCommunity(from)) return false;

  // Must go to a seat
  if (!isSeat(to)) return false;

  // Must target opponent's domain
  const targetOwner = getOwner(to);
  if (targetOwner === null || targetOwner === playerId) return false;
  if (targetOwner < 1 || targetOwner > playerCount) return false;

  // Target must be vacant
  if (!isVacant(to, pieces)) return false;

  // No Pawns allowed
  if (piece.type === 'PAWN') return false;

  // Hierarchy: Marks before Heels
  return canTakeFromCommunity(piece, pieces);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Validates a single EngineMove against current board state.
 */
export function validateMove(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;
  // Confirm piece is actually at the stated fromLocation
  if (piece.locationId !== move.fromLocationId) return false;

  switch (move.moveType) {
    case DefinedMoveType.ADVANCE:
      return validateAdvance(move, playerId, pieces);
    case DefinedMoveType.WITHDRAW:
      return validateWithdraw(move, playerId, pieces);
    case DefinedMoveType.ORGANIZE:
      return validateOrganize(move, playerId, pieces, playerCount);
    case DefinedMoveType.REMOVE:
      return validateRemove(move, playerId, pieces, playerCount);
    case DefinedMoveType.INFLUENCE:
      return validateInfluence(move, playerId, pieces, playerCount);
    case DefinedMoveType.ASSIST:
      return validateAssist(move, playerId, pieces, playerCount);
    default:
      return false;
  }
}

/**
 * Finds all legal moves of a given type for a player.
 * For community placements, picks one representative piece
 * (first Mark, or first Heel if no Marks).
 */
export function findLegalMoves(
  moveType: DefinedMoveType,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number
): EngineMove[] {
  const moves: EngineMove[] = [];

  switch (moveType) {
    case DefinedMoveType.ADVANCE: {
      // Pick community representative piece (Mark > Heel, no Pawns)
      const communityMark = pieces.find(p => p.type === 'MARK' && isCommunity(p.locationId));
      const communityHeel = !communityMark
        ? pieces.find(p => p.type === 'HEEL' && isCommunity(p.locationId))
        : undefined;
      const communityPiece = communityMark || communityHeel;

      // Option A: community -> own vacant seats
      if (communityPiece) {
        for (let s = 1; s <= 6; s++) {
          const seatId = `p${playerId}_seat${s}`;
          if (isVacant(seatId, pieces)) {
            const candidate: EngineMove = {
              moveType,
              pieceId: communityPiece.id,
              fromLocationId: communityPiece.locationId,
              toLocationId: seatId,
            };
            if (validateAdvance(candidate, playerId, pieces)) {
              moves.push(candidate);
            }
          }
        }
      }

      // Option B: seat -> rostrum (when faction full)
      const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
      if (playerRules) {
        for (const rostrumRule of playerRules.rostrums) {
          if (isFactionFull(rostrumRule.rostrum, pieces)) {
            // Any piece in the supporting seats can advance
            for (const seatId of rostrumRule.supportingSeats) {
              const seatPiece = pieces.find(p => p.locationId === seatId);
              if (seatPiece) {
                const candidate: EngineMove = {
                  moveType,
                  pieceId: seatPiece.id,
                  fromLocationId: seatId,
                  toLocationId: rostrumRule.rostrum,
                };
                if (validateAdvance(candidate, playerId, pieces)) {
                  moves.push(candidate);
                }
              }
            }
          }
        }

        // Option C: rostrum -> office (when both rostrums filled)
        const bothFilled = playerRules.rostrums.every(r =>
          pieces.some(p => p.locationId === r.rostrum)
        );
        if (bothFilled) {
          for (const rostrumRule of playerRules.rostrums) {
            const rostrumPiece = pieces.find(p => p.locationId === rostrumRule.rostrum);
            if (rostrumPiece) {
              const candidate: EngineMove = {
                moveType,
                pieceId: rostrumPiece.id,
                fromLocationId: rostrumRule.rostrum,
                toLocationId: playerRules.office,
              };
              if (validateAdvance(candidate, playerId, pieces)) {
                moves.push(candidate);
              }
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.WITHDRAW: {
      const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
      // Seat -> community
      for (let s = 1; s <= 6; s++) {
        const seatId = `p${playerId}_seat${s}`;
        const seatPiece = pieces.find(p => p.locationId === seatId);
        if (seatPiece) {
          moves.push({
            moveType,
            pieceId: seatPiece.id,
            fromLocationId: seatId,
            toLocationId: 'community',
          });
        }
      }
      // Rostrum -> vacant seat
      if (playerRules) {
        for (const rostrumRule of playerRules.rostrums) {
          const rostrumPiece = pieces.find(p => p.locationId === rostrumRule.rostrum);
          if (rostrumPiece) {
            for (const seatId of rostrumRule.supportingSeats) {
              if (isVacant(seatId, pieces)) {
                moves.push({
                  moveType,
                  pieceId: rostrumPiece.id,
                  fromLocationId: rostrumRule.rostrum,
                  toLocationId: seatId,
                });
              }
            }
          }
        }
        // Office -> vacant rostrum
        const officePiece = pieces.find(p => p.locationId === playerRules.office);
        if (officePiece) {
          for (const rostrumRule of playerRules.rostrums) {
            if (isVacant(rostrumRule.rostrum, pieces)) {
              moves.push({
                moveType,
                pieceId: officePiece.id,
                fromLocationId: playerRules.office,
                toLocationId: rostrumRule.rostrum,
              });
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.ORGANIZE: {
      // Own seats -> adjacent vacant seats
      for (let s = 1; s <= 6; s++) {
        const seatId = `p${playerId}_seat${s}`;
        const seatPiece = pieces.find(p => p.locationId === seatId);
        if (seatPiece) {
          for (const adjSeat of getAdjacentSeats(seatId, playerCount)) {
            if (isVacant(adjSeat, pieces)) {
              moves.push({
                moveType,
                pieceId: seatPiece.id,
                fromLocationId: seatId,
                toLocationId: adjSeat,
              });
            }
          }
        }
      }
      // Own rostrums -> adjacent rostrums
      const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
      if (playerRules) {
        for (const rostrumRule of playerRules.rostrums) {
          const rostrumPiece = pieces.find(p => p.locationId === rostrumRule.rostrum);
          if (rostrumPiece) {
            const adjRostrum = getAdjacentRostrum(rostrumRule.rostrum, playerCount);
            if (adjRostrum && isVacant(adjRostrum, pieces)) {
              moves.push({
                moveType,
                pieceId: rostrumPiece.id,
                fromLocationId: rostrumRule.rostrum,
                toLocationId: adjRostrum,
              });
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.REMOVE: {
      // Opponent Marks in seats
      for (const piece of pieces) {
        if (piece.type !== 'MARK') continue;
        if (!isSeat(piece.locationId)) continue;
        const owner = getOwner(piece.locationId);
        if (owner === null || owner === playerId) continue;
        if (owner < 1 || owner > playerCount) continue;
        moves.push({
          moveType,
          pieceId: piece.id,
          fromLocationId: piece.locationId,
          toLocationId: 'community',
        });
      }
      break;
    }

    case DefinedMoveType.INFLUENCE: {
      // Opponent pieces in seats -> adjacent vacant seats
      for (const piece of pieces) {
        if (!isSeat(piece.locationId)) continue;
        const owner = getOwner(piece.locationId);
        if (owner === null || owner === playerId) continue;
        for (const adjSeat of getAdjacentSeats(piece.locationId, playerCount)) {
          if (!isVacant(adjSeat, pieces)) continue;
          // Pawns can't cross domains
          if (piece.type === 'PAWN' && getOwner(adjSeat) !== owner) continue;
          moves.push({
            moveType,
            pieceId: piece.id,
            fromLocationId: piece.locationId,
            toLocationId: adjSeat,
          });
        }
      }
      // Opponent pieces in rostrums -> adjacent rostrums (no Pawns)
      for (const piece of pieces) {
        if (!isRostrum(piece.locationId)) continue;
        if (piece.type === 'PAWN') continue;
        const owner = getOwner(piece.locationId);
        if (owner === null || owner === playerId) continue;
        const adjRostrum = getAdjacentRostrum(piece.locationId, playerCount);
        if (adjRostrum && isVacant(adjRostrum, pieces)) {
          moves.push({
            moveType,
            pieceId: piece.id,
            fromLocationId: piece.locationId,
            toLocationId: adjRostrum,
          });
        }
      }
      break;
    }

    case DefinedMoveType.ASSIST: {
      // Community piece -> opponent vacant seats
      const communityMark = pieces.find(p => p.type === 'MARK' && isCommunity(p.locationId));
      const communityHeel = !communityMark
        ? pieces.find(p => p.type === 'HEEL' && isCommunity(p.locationId))
        : undefined;
      const communityPiece = communityMark || communityHeel;

      if (communityPiece) {
        for (let p = 1; p <= playerCount; p++) {
          if (p === playerId) continue;
          for (let s = 1; s <= 6; s++) {
            const seatId = `p${p}_seat${s}`;
            if (isVacant(seatId, pieces)) {
              moves.push({
                moveType,
                pieceId: communityPiece.id,
                fromLocationId: communityPiece.locationId,
                toLocationId: seatId,
              });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

// ============================================================================
// SUPPORT VIOLATIONS
// ============================================================================

export interface SupportViolation {
  pieceId: string;
  locationId: string;
  playerId: number;
  type: 'ROSTRUM' | 'OFFICE';
}

/**
 * Finds all pieces in rostrums or offices that have lost their support.
 * - Rostrum piece is unsupported if none of its 3 supporting seats are occupied.
 * - Office piece is unsupported if neither of the player's rostrums are occupied.
 */
export function checkSupportViolations(
  pieces: KredPiece[],
  playerCount: number
): SupportViolation[] {
  const violations: SupportViolation[] = [];

  for (const piece of pieces) {
    const loc = piece.locationId;

    if (isRostrum(loc)) {
      const playerId = getOwner(loc);
      if (!playerId) continue;
      const supportingSeats = getSupportingSeats(loc);
      const hasSupport = supportingSeats.some(seatId =>
        pieces.some(p => p.locationId === seatId)
      );
      if (!hasSupport) {
        violations.push({ pieceId: piece.id, locationId: loc, playerId, type: 'ROSTRUM' });
      }
    } else if (isOffice(loc)) {
      const playerId = getOwner(loc);
      if (!playerId) continue;
      const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
      if (!playerRules) continue;
      const hasSupport = playerRules.rostrums.some(r =>
        pieces.some(p => p.locationId === r.rostrum)
      );
      if (!hasSupport) {
        violations.push({ pieceId: piece.id, locationId: loc, playerId, type: 'OFFICE' });
      }
    }
  }

  return violations;
}
