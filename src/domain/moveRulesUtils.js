import { MOVE_TYPES, TILES } from './types.js';
import { validateSingleMove, validateMoveCombination } from './moves.js';

// ponytail: helper to compute remaining allowed move types for a specific tile & turn sequence
export function getRemainingAllowedMoveTypes(tileId = '', stagedMoves = [], requireHonestTile = false) {
  let allowed = Object.values(MOVE_TYPES);

  // 1. If strict honest tile matching is required (e.g. re-executing an exposed lie)
  if (requireHonestTile && tileId && TILES[tileId] && !TILES[tileId].isWild) {
    const tile = TILES[tileId];
    if (stagedMoves.length >= tile.moves.length) return [];

    const remaining = [...tile.moves];
    for (const m of stagedMoves) {
      const idx = remaining.indexOf(m.type);
      if (idx !== -1) {
        remaining.splice(idx, 1);
      }
    }
    allowed = remaining;
  }

  // 2. 2-Move Category Rule: Must alternate between Self Move (Withdraw/Advance/Organize) and Opponent Move (Assist/Remove/Influence)
  if (stagedMoves.length === 1) {
    const selfMoves = [MOVE_TYPES.WITHDRAW, MOVE_TYPES.ADVANCE, MOVE_TYPES.ORGANIZE];
    const otherMoves = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];

    const move1Type = stagedMoves[0].type;
    const isMove1Self = selfMoves.includes(move1Type);

    const requiredCategory = isMove1Self ? otherMoves : selfMoves;
    allowed = allowed.filter(type => requiredCategory.includes(type));
  } else if (stagedMoves.length >= 2) {
    return [];
  }

  return allowed;
}

// ponytail: direct helper to find all legal target spots for a clicked piece
export function getValidDestinations(
  fromLoc,
  moverId,
  boardState,
  community,
  numPlayers,
  stagedMoves = [],
  selectedTileId = '',
  requireHonestTile = false
) {
  if (!fromLoc) return [];

  // Guardrail: A piece may only move ONCE per turn!
  if (stagedMoves.length === 1) {
    const movedPieceId = stagedMoves[0].pieceId;
    const pieceAtFrom = boardState[fromLoc];
    if (movedPieceId && pieceAtFrom && pieceAtFrom.id === movedPieceId) {
      return [];
    }
    if (stagedMoves[0].to === fromLoc) {
      return [];
    }
  }
  
  if (stagedMoves.length >= 2) return [];
  if (requireHonestTile && selectedTileId && TILES[selectedTileId] && !TILES[selectedTileId].isWild) {
    if (stagedMoves.length >= TILES[selectedTileId].moves.length) {
      return [];
    }
  }

  const validTargets = [];
  const candidateKeys = Object.keys(boardState);

  const allowedMoveTypes = getRemainingAllowedMoveTypes(selectedTileId, stagedMoves, requireHonestTile);

  if (allowedMoveTypes.length === 0) return [];

  // Candidates on board (exclude specific occupied community spots from direct candidate list)
  const candidates = candidateKeys.filter(k => !k.startsWith('community_'));
  if (!candidates.includes('community')) candidates.push('community');

  for (const toLoc of candidates) {
    if (fromLoc === toLoc) continue;

    for (const type of allowedMoveTypes) {
      const moveCandidate = { type, from: fromLoc, to: toLoc };

      let testVal = false;
      if (stagedMoves.length === 0) {
        const val = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers, stagedMoves);
        testVal = val.valid;
      } else if (stagedMoves.length === 1) {
        // boardState is already the transient state after move 1 was applied optimistically.
        // Validate move 2 directly against it — do NOT re-simulate via validateMoveCombination
        // (that would double-apply move 1 and corrupt the board model).
        const val = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers, stagedMoves);
        if (val.valid) {
          // Enforce separate-piece rule manually
          const from1 = stagedMoves[0].from;
          const to1   = stagedMoves[0].to;
          const normTo1   = to1.startsWith('community_')       ? 'community' : to1;
          const normFrom2 = moveCandidate.from.startsWith('community_') ? 'community' : moveCandidate.from;
          const sameSource = from1 === moveCandidate.from && from1 !== 'community';
          const chained    = normTo1 !== 'community' && normTo1 === normFrom2;
          testVal = !sameSource && !chained;
        }
      }

      if (testVal) {
        if (toLoc === 'community' || toLoc.startsWith('community_')) {
          // ponytail: sort community keys numerically so community destination indicator targets lowest empty spot
          const emptyCommSpots = candidateKeys
            .filter(k => k.startsWith('community_') && boardState[k] === null)
            .sort((a, b) => parseInt(a.replace('community_', ''), 10) - parseInt(b.replace('community_', ''), 10));
          if (emptyCommSpots.length > 0) {
            const repSpot = emptyCommSpots[0];
            if (!validTargets.includes(repSpot)) validTargets.push(repSpot);
          }
        } else {
          // Domain seat / rostrum / office target (must be empty unless occupied piece moves)
          if (!validTargets.includes(toLoc)) validTargets.push(toLoc);
        }
        break;
      }
    }
  }

  return validTargets;
}

// ponytail: infer move type for a valid (from -> to) pair
export function inferMoveType(
  fromLoc,
  toLoc,
  moverId,
  boardState,
  community,
  numPlayers,
  stagedMoves = [],
  selectedTileId = '',
  requireHonestTile = false
) {
  const normFrom = fromLoc.startsWith('community_') ? 'community' : fromLoc;
  const normTo = toLoc.startsWith('community_') ? 'community' : toLoc;

  const allowedMoveTypes = getRemainingAllowedMoveTypes(selectedTileId, stagedMoves, requireHonestTile);

  for (const type of allowedMoveTypes) {
    const moveCandidate = { type, from: normFrom, to: normTo };
    let isValid = false;

    if (stagedMoves.length === 0) {
      isValid = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers).valid;
    } else {
      // boardState is already transient (move 1 applied); validate move 2 directly
      isValid = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers).valid;
    }

    if (isValid) return type;
  }

  // Fallback for community target key mapping
  if (toLoc.startsWith('community_') || toLoc === 'community') {
    const commMoveCandidate = { type: MOVE_TYPES.WITHDRAW, from: normFrom, to: 'community' };
    if (validateSingleMove(commMoveCandidate, moverId, boardState, community, numPlayers).valid) {
      return MOVE_TYPES.WITHDRAW;
    }
    return MOVE_TYPES.REMOVE;
  }

  return MOVE_TYPES.ADVANCE;
}
