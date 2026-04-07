import { DefinedMoveType, TILE_KREDCOIN_VALUES, ROSTRUM_SUPPORT_RULES } from '@kred/shared';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../config/pieces';
import { type KredGameState, type InvariantResult, TurnPhase } from './types';

/**
 * Collect all tile IDs across all players (hand, bankFaceDown, bankFaceUp)
 * and the in-transit tile (tilePlayedId), then sum their TILE_KREDCOIN_VALUES.
 * Expected total: 100 (sum of all 24 tiles).
 */
export function checkFundingChecksum(state: KredGameState): InvariantResult {
  const name = 'fundingChecksum';
  const allTileIds: string[] = [];

  for (const player of state.players) {
    allTileIds.push(...player.hand);
    allTileIds.push(...player.bankFaceDown);
    allTileIds.push(...player.bankFaceUp);
  }

  if (state.turn.tilePlayedId) {
    allTileIds.push(state.turn.tilePlayedId);
  }

  const total = allTileIds.reduce((sum, tileId) => {
    const key = parseInt(tileId, 10);
    return sum + (TILE_KREDCOIN_VALUES[key] ?? 0);
  }, 0);

  if (total !== 100) {
    return {
      passed: false,
      name,
      details: `Expected tile value sum of 100, got ${total} (${allTileIds.length} tiles accounted for)`,
    };
  }

  return { passed: true, name };
}

/**
 * Total piece count must match PIECE_COUNTS_BY_PLAYER_COUNT[playerCount].
 */
export function checkPieceConservation(state: KredGameState): InvariantResult {
  const name = 'pieceConservation';
  const counts = PIECE_COUNTS_BY_PLAYER_COUNT[state.config.playerCount];
  if (!counts) {
    return { passed: false, name, details: `Unknown player count: ${state.config.playerCount}` };
  }

  const expected = (counts.MARK ?? 0) + (counts.HEEL ?? 0) + (counts.PAWN ?? 0);
  const actual = state.pieces.length;

  if (actual !== expected) {
    return {
      passed: false,
      name,
      details: `Expected ${expected} pieces for ${state.config.playerCount}p, got ${actual}`,
    };
  }

  return { passed: true, name };
}

/**
 * For each player, if a rostrum is occupied, at least one of its supporting seats must be occupied.
 * Also, if the office is occupied, at least one rostrum must be occupied.
 */
export function checkSupportRule(state: KredGameState): InvariantResult {
  const name = 'supportRule';
  const occupiedLocations = new Set(state.pieces.map(p => p.locationId));

  for (let playerId = 1; playerId <= state.config.playerCount; playerId++) {
    const playerRules = ROSTRUM_SUPPORT_RULES[playerId];
    if (!playerRules) continue;

    // Check each rostrum: if it's occupied, at least one supporting seat must be occupied
    for (const rostrumSupport of playerRules.rostrums) {
      const rostrumOccupied = occupiedLocations.has(rostrumSupport.rostrum);
      if (rostrumOccupied) {
        const hasSupport = rostrumSupport.supportingSeats.some(seat => occupiedLocations.has(seat));
        if (!hasSupport) {
          return {
            passed: false,
            name,
            details: `${rostrumSupport.rostrum} is occupied but none of its supporting seats [${rostrumSupport.supportingSeats.join(', ')}] are occupied`,
          };
        }
      }
    }

    // Check office: if it's occupied, at least one rostrum must be occupied
    const officeOccupied = occupiedLocations.has(playerRules.office);
    if (officeOccupied) {
      const hasRostrumSupport = playerRules.rostrums.some(r => occupiedLocations.has(r.rostrum));
      if (!hasRostrumSupport) {
        return {
          passed: false,
          name,
          details: `${playerRules.office} is occupied but no rostrums are occupied`,
        };
      }
    }
  }

  return { passed: true, name };
}

/**
 * Count pawns in each player's domain (locationId starts with "pN_").
 * Each player may have at most 1 pawn in their domain.
 */
export function checkOnePawnPerPlayer(state: KredGameState): InvariantResult {
  const name = 'onePawnPerPlayer';

  for (let playerId = 1; playerId <= state.config.playerCount; playerId++) {
    const prefix = `p${playerId}_`;
    const pawnsInDomain = state.pieces.filter(
      p => p.type === 'PAWN' && p.locationId.startsWith(prefix)
    );
    if (pawnsInDomain.length > 1) {
      return {
        passed: false,
        name,
        details: `Player ${playerId} has ${pawnsInDomain.length} pawns in their domain (max 1)`,
      };
    }
  }

  return { passed: true, name };
}

/**
 * All players must have credibility in the range [0, 3].
 */
export function checkCredibilityBounds(state: KredGameState): InvariantResult {
  const name = 'credibilityBounds';

  for (const player of state.players) {
    if (!Number.isInteger(player.credibility) || player.credibility < 0 || player.credibility > 3) {
      return {
        passed: false,
        name,
        details: `Player ${player.id} has invalid credibility: ${player.credibility} (must be integer 0-3)`,
      };
    }
  }

  return { passed: true, name };
}

/**
 * If 2 moves have been executed this turn, they must target different pieceIds.
 */
export function checkSeparatePiecesPerTurn(state: KredGameState): InvariantResult {
  const name = 'separatePiecesPerTurn';
  const moves = state.turn.movesExecuted;

  if (moves.length >= 2) {
    const pieceIds = moves.map(m => m.pieceId);
    const uniquePieceIds = new Set(pieceIds);
    if (uniquePieceIds.size < pieceIds.length) {
      const duplicate = pieceIds.find((id, idx) => pieceIds.indexOf(id) !== idx);
      return {
        passed: false,
        name,
        details: `Piece "${duplicate}" was moved more than once in the same turn`,
      };
    }
  }

  return { passed: true, name };
}

/**
 * REMOVE moves must: target Marks only, from seats only, from opponent domain.
 */
export function checkRemoveRestrictions(state: KredGameState): InvariantResult {
  const name = 'removeRestrictions';
  const moves = state.turn.movesExecuted;
  const moverId = state.turn.moverId;

  for (const move of moves) {
    if (move.moveType !== DefinedMoveType.REMOVE) continue;

    // Must target a Mark
    const piece = state.pieces.find(p => p.id === move.pieceId);
    if (piece && piece.type !== 'MARK') {
      return {
        passed: false,
        name,
        details: `REMOVE move targets piece "${move.pieceId}" of type ${piece.type}, but only Marks can be removed`,
      };
    }

    // Must be from a seat (locationId ends with "_seatN")
    if (!move.fromLocationId.includes('_seat')) {
      return {
        passed: false,
        name,
        details: `REMOVE move must come from a seat, but fromLocationId is "${move.fromLocationId}"`,
      };
    }

    // Must be from opponent domain (not mover's own domain)
    const moverPrefix = `p${moverId}_`;
    if (move.fromLocationId.startsWith(moverPrefix)) {
      return {
        passed: false,
        name,
        details: `REMOVE move targets mover's own domain (player ${moverId}): "${move.fromLocationId}"`,
      };
    }
  }

  return { passed: true, name };
}

/**
 * When taking a piece from the Community (for Advance or Assist):
 * 1. Take a Mark first (if any Marks are in the Community).
 * 2. Only if zero Marks remain in the Community, take a Heel.
 */
export function checkCommunityPiecePriority(state: KredGameState): InvariantResult {
  const name = 'communityPiecePriority';
  const pieces = state.pieces;
  const hasMarksInCommunity = pieces.some(p => p.type === 'MARK' && p.locationId === 'community');

  // Check moves that targeted community this turn
  for (const move of state.turn.movesExecuted) {
    if (move.fromLocationId === 'community') {
      const piece = pieces.find(p => p.id === move.pieceId);
      if (piece && piece.type === 'HEEL' && hasMarksInCommunity) {
        return {
          passed: false,
          name,
          details: `Took HEEL from Community while MARKS were available.`,
        };
      }
    }
  }

  return { passed: true, name };
}

/**
 * The blank tile cannot be used to achieve a winning setup.
 */
export function checkBlankTileCannotWin(state: KredGameState): InvariantResult {
  const name = 'blankTileCannotWin';
  const winners = state.players.filter(p => {
    // Determine if player has winning board setup
    // Office: PAWN, Rostrums: HEEL+, Seats: all occupied
    const office = state.pieces.find(pc => pc.locationId === `p${p.id}_office`);
    if (!office || office.type !== 'PAWN') return false;
    const r1 = state.pieces.find(pc => pc.locationId === `p${p.id}_rostrum1`);
    const r2 = state.pieces.find(pc => pc.locationId === `p${p.id}_rostrum2`);
    if (!r1 || r1.type === 'MARK') return false;
    if (!r2 || r2.type === 'MARK') return false;
    for (let i = 1; i <= 6; i++) {
      if (!state.pieces.some(pc => pc.locationId === `p${p.id}_seat${i}`)) return false;
    }
    return true;
  });

  if (winners.length > 0 && state.turn.tilePlayedId === 'BLANK') {
    return {
      passed: false,
      name,
      details: `Player(s) ${winners.map(w => w.id).join(', ')} achieved winning setup but last tile played was BLANK`,
    };
  }

  return { passed: true, name };
}

export function runAllInvariants(state: KredGameState): InvariantResult[] {
  return [
    checkFundingChecksum(state),
    checkPieceConservation(state),
    checkSupportRule(state),
    checkOnePawnPerPlayer(state),
    checkCredibilityBounds(state),
    checkSeparatePiecesPerTurn(state),
    checkRemoveRestrictions(state),
    checkCommunityPiecePriority(state),
    checkBlankTileCannotWin(state),
  ];
}
