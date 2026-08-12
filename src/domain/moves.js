import { MOVE_TYPES, PIECE_TYPES, TILES } from './types.js';
import { parseLocation, areSeatsAdjacent, areRostrumsAdjacent } from './board.js';

// Helper to check if a community piece is available based on depletion hierarchy (Marks -> Heels -> Pawns)
export function isCommunityPieceAvailable(pieceType, boardState, community, stagedMoves = []) {
  let hasMarks = false;
  let hasHeels = false;

  const movedPieceId = (stagedMoves && stagedMoves.length > 0) ? stagedMoves[0]?.pieceId : null;

  if (boardState) {
    Object.keys(boardState).forEach(k => {
      if (k.startsWith('community_') && boardState[k]) {
        const piece = boardState[k];
        if (movedPieceId && piece.id === movedPieceId) {
          return; // Off-limits piece moved in Move 1 does not count towards available pool!
        }
        if (piece.type === PIECE_TYPES.MARK) hasMarks = true;
        if (piece.type === PIECE_TYPES.HEEL) hasHeels = true;
      }
    });
  } else if (community) {
    if (community.marks > 0) hasMarks = true;
    if (community.heels > 0) hasHeels = true;
  }

  if (pieceType === PIECE_TYPES.HEEL && hasMarks) {
    return false; // Heels locked while Marks remain
  }

  if (pieceType === PIECE_TYPES.PAWN && (hasMarks || hasHeels)) {
    return false; // Pawns locked while Marks or Heels remain
  }

  return true;
}

export function validateSingleMove(move, moverId, boardState, community, numPlayers, stagedMoves = []) {
  const { type, from, to } = move;
  const pFrom = parseLocation(from);
  const pTo = parseLocation(to);

  if (!pFrom || !pTo) return { valid: false, reason: 'Invalid location identifier' };

  switch (type) {
    case MOVE_TYPES.ADVANCE: {
      // Must be in Mover's own domain or from Community to Mover's domain
      if (pTo.playerId !== String(moverId)) {
        return { valid: false, reason: 'Advance must target your own domain' };
      }

      // Option 1: Community -> Seat
      if (pFrom.type === 'community' && pTo.type === 'seat') {
        if (boardState[to] !== null) return { valid: false, reason: 'Seat is occupied' };
        let pieceType = PIECE_TYPES.MARK;
        if (typeof from === 'string' && from.startsWith('community_')) {
          const piece = boardState[from];
          if (!piece) return { valid: false, reason: 'No piece at selected community spot' };
          pieceType = piece.type;
          if (piece.type !== PIECE_TYPES.MARK && piece.type !== PIECE_TYPES.HEEL) {
            return { valid: false, reason: 'Only Marks and Heels can be placed in Seats' };
          }
        } else {
          if (community && community.marks === 0 && community.heels === 0) {
            return { valid: false, reason: 'No Marks or Heels available in Community' };
          }
          pieceType = community?.marks > 0 ? PIECE_TYPES.MARK : PIECE_TYPES.HEEL;
        }
        if (!isCommunityPieceAvailable(pieceType, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${pieceType}s cannot be taken from Community until lower tier pieces are depleted` };
        }
        return { valid: true };
      }

      // Option 2: Seat -> Rostrum
      if (pFrom.type === 'seat' && pTo.type === 'rostrum') {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: 'Must move piece from your own seat' };
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: 'No piece at source seat' };
        if (boardState[to] !== null) return { valid: false, reason: 'Destination rostrum is occupied' };

        // Faction alignment: Seats 1, 2, 3 -> Rostrum 1; Seats 4, 5, 6 -> Rostrum 2
        const isFaction1Seat = [1, 2, 3].includes(pFrom.index);
        const isFaction2Seat = [4, 5, 6].includes(pFrom.index);

        if (pTo.index === 1 && !isFaction1Seat) {
          return { valid: false, reason: 'Seats 4, 5, and 6 cannot advance to Rostrum 1' };
        }
        if (pTo.index === 2 && !isFaction2Seat) {
          return { valid: false, reason: 'Seats 1, 2, and 3 cannot advance to Rostrum 2' };
        }

        // Faction prerequisite: All 3 seats of that faction must be occupied
        const factionSeats = isFaction1Seat
          ? [`p${pFrom.domainNum}_seat1`, `p${pFrom.domainNum}_seat2`, `p${pFrom.domainNum}_seat3`]
          : [`p${pFrom.domainNum}_seat4`, `p${pFrom.domainNum}_seat5`, `p${pFrom.domainNum}_seat6`];

        if (factionSeats.some(s => boardState[s] === null)) {
          return { valid: false, reason: 'All 3 seats of faction must be occupied to Advance to Rostrum' };
        }
        return { valid: true };
      }

      // Option 3: Rostrum -> Office
      if (pFrom.type === 'rostrum' && pTo.type === 'office') {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: 'Must move piece from your own rostrum' };
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: 'No piece at source rostrum' };
        if (boardState[to] !== null) return { valid: false, reason: 'Office is occupied' };

        // Prerequisite: Both Rostrums must be occupied
        const r1 = `p${pFrom.domainNum}_rostrum1`;
        const r2 = `p${pFrom.domainNum}_rostrum2`;
        if (boardState[r1] === null || boardState[r2] === null) {
          return { valid: false, reason: 'Both rostrums must be occupied to Advance to Office' };
        }
        return { valid: true };
      }

      return { valid: false, reason: 'Invalid Advance pathway' };
    }

    case MOVE_TYPES.WITHDRAW: {
      if (pFrom.playerId !== String(moverId) && pFrom.type !== 'community') {
        return { valid: false, reason: 'Withdraw must originate from your own domain' };
      }

      // Option 1: Office -> Rostrum
      if (pFrom.type === 'office' && pTo.type === 'rostrum') {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: 'Withdraw must originate from your own domain' };
        if (pTo.domainNum !== pFrom.domainNum) return { valid: false, reason: 'Withdraw must target your own domain' };
        if (!boardState[from]) return { valid: false, reason: 'Office is empty' };
        if (boardState[to] !== null) return { valid: false, reason: 'Target rostrum is occupied' };
        return { valid: true };
      }

      // Option 2: Rostrum -> Seat (same faction)
      if (pFrom.type === 'rostrum' && pTo.type === 'seat') {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: 'Withdraw must originate from your own domain' };
        if (pTo.domainNum !== pFrom.domainNum) return { valid: false, reason: 'Withdraw must target a seat in your own domain' };
        if (!boardState[from]) return { valid: false, reason: 'Rostrum is empty' };
        if (boardState[to] !== null) return { valid: false, reason: 'Target seat is occupied' };
        const inFaction1 = pFrom.index === 1 && [1, 2, 3].includes(pTo.index);
        const inFaction2 = pFrom.index === 2 && [4, 5, 6].includes(pTo.index);
        if (!inFaction1 && !inFaction2) {
          return { valid: false, reason: 'Seat must be within the same faction' };
        }
        return { valid: true };
      }

      // Option 3: Seat -> Community
      if (pFrom.type === 'seat' && pTo.type === 'community') {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: 'Withdraw must originate from your own domain' };
        if (!boardState[from]) return { valid: false, reason: 'Seat is empty' };
        return { valid: true };
      }

      return { valid: false, reason: 'Invalid Withdraw pathway' };
    }

    case MOVE_TYPES.ORGANIZE: {
      if (pFrom.playerId !== String(moverId)) {
        return { valid: false, reason: 'Organize must originate from your own piece' };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: 'No piece at source location' };

      // Option 1: Seat -> Adjacent Seat
      if (pFrom.type === 'seat' && pTo.type === 'seat') {
        if (!areSeatsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: 'Target seat is not adjacent' };
        }
        if (boardState[to] !== null) return { valid: false, reason: 'Target seat is occupied' };
        return { valid: true };
      }

      // Option 2: Rostrum -> Adjacent Rostrum
      if (pFrom.type === 'rostrum' && pTo.type === 'rostrum') {
        if (!areRostrumsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: 'Target rostrum is not adjacent' };
        }
        if (boardState[to] !== null) return { valid: false, reason: 'Target rostrum is occupied' };
        return { valid: true };
      }

      return { valid: false, reason: 'Invalid Organize pathway' };
    }

    case MOVE_TYPES.REMOVE: {
      if (pFrom.playerId === String(moverId)) {
        return { valid: false, reason: 'Cannot Remove pieces from your own domain' };
      }
      if (pFrom.type !== 'seat' || pTo.type !== 'community') {
        return { valid: false, reason: 'Remove must target an opponent seat and send piece to Community' };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: 'Target seat is empty' };
      if (piece.type !== PIECE_TYPES.MARK) {
        return { valid: false, reason: 'Can only Remove Marks (not Heels or Pawns)' };
      }
      return { valid: true };
    }

    case MOVE_TYPES.INFLUENCE: {
      if (pFrom.playerId === String(moverId)) {
        return { valid: false, reason: 'Influence must target an opponent piece' };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: 'Target location is empty' };
      if (piece.type === PIECE_TYPES.PAWN) {
        return { valid: false, reason: 'Pawns cannot be Influenced' };
      }

      // Option 1: Seat -> Adjacent Seat
      if (pFrom.type === 'seat' && pTo.type === 'seat') {
        if (!areSeatsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: 'Target seat is not adjacent' };
        }
        if (boardState[to] !== null) return { valid: false, reason: 'Target seat is occupied' };
        return { valid: true };
      }

      // Option 2: Rostrum -> Adjacent Rostrum
      if (pFrom.type === 'rostrum' && pTo.type === 'rostrum') {
        if (!areRostrumsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: 'Target rostrum is not adjacent' };
        }
        if (boardState[to] !== null) return { valid: false, reason: 'Target rostrum is occupied' };
        return { valid: true };
      }

      return { valid: false, reason: 'Invalid Influence pathway' };
    }

    case MOVE_TYPES.ASSIST: {
      if (pFrom.type !== 'community' || pTo.type !== 'seat') {
        return { valid: false, reason: 'Assist must place piece from Community into a seat' };
      }
      if (pTo.playerId === String(moverId)) {
        return { valid: false, reason: 'Cannot Assist yourself -- must target opponent domain' };
      }
      if (boardState[to] !== null) return { valid: false, reason: 'Target seat is occupied' };
      if (typeof from === 'string' && from.startsWith('community_')) {
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: 'No piece at selected community spot' };
        if (piece.type !== PIECE_TYPES.MARK && piece.type !== PIECE_TYPES.HEEL) {
          return { valid: false, reason: 'Only Marks and Heels can be placed in Seats' };
        }
        if (!isCommunityPieceAvailable(piece.type, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${piece.type}s cannot be taken from Community until lower tier pieces are depleted` };
        }
      } else {
        if (community && community.marks === 0 && community.heels === 0) {
          return { valid: false, reason: 'No Marks or Heels available in Community' };
        }
        const pType = community?.marks > 0 ? PIECE_TYPES.MARK : PIECE_TYPES.HEEL;
        if (!isCommunityPieceAvailable(pType, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${pType}s cannot be taken from Community until lower tier pieces are depleted` };
        }
      }
      return { valid: true };
    }

    default:
      return { valid: false, reason: 'Unknown move type' };
  }
}

// Check 2-Move Turn Rule: must affect separate pieces
export function validateMoveCombination(moves, moverId, boardState, community, numPlayers) {
  if (!Array.isArray(moves)) return { valid: false, reason: 'Moves must be an array' };
  if (moves.length > 2) return { valid: false, reason: 'Cannot make more than 2 moves' };

  if (moves.length === 0) return { valid: true };

  // Validate first move
  const v1 = validateSingleMove(moves[0], moverId, boardState, community, numPlayers);
  if (!v1.valid) return v1;

  if (moves.length === 1) return { valid: true };

  // Simulate board after move 1 to validate move 2
  const tempBoard = JSON.parse(JSON.stringify(boardState));
  const tempCommunity = { ...community };
  applyMoveToState(moves[0], tempBoard, tempCommunity);

  const v2 = validateSingleMove(moves[1], moverId, tempBoard, tempCommunity, numPlayers, [moves[0]]);
  if (!v2.valid) return v2;

  // Separate piece check: The two moves cannot target the same piece!
  const piece1 = boardState[moves[0].from];
  const piece1Id = piece1 ? piece1.id : null;
  const piece2 = tempBoard[moves[1].from];
  const piece2Id = piece2 ? piece2.id : null;

  if (piece1Id && piece2Id && piece1Id === piece2Id) {
    return { valid: false, reason: 'A piece may only move ONCE during a player\'s turn' };
  }

  const from1 = moves[0].from;
  const to1 = moves[0].to;
  const from2 = moves[1].from;
  const to2 = moves[1].to;

  const normTo1 = (typeof to1 === 'string' && to1.startsWith('community_')) ? 'community' : to1;
  const normFrom2 = (typeof from2 === 'string' && from2.startsWith('community_')) ? 'community' : from2;

  if (normTo1 !== 'community' && normTo1 === normFrom2) {
    return { valid: false, reason: 'Two moves in a turn must affect separate pieces' };
  }
  if (from1 === from2 && from1 !== 'community') {
    return { valid: false, reason: 'Two moves in a turn must affect separate pieces' };
  }

  // Combination Category Rule: A 2-move turn must combine 1 Self Move (Withdraw/Advance/Organize) and 1 Opponent Move (Assist/Remove/Influence)
  const selfMoves = [MOVE_TYPES.WITHDRAW, MOVE_TYPES.ADVANCE, MOVE_TYPES.ORGANIZE];
  const move1Self = selfMoves.includes(moves[0].type);
  const move2Self = selfMoves.includes(moves[1].type);

  if (move1Self === move2Self) {
    return {
      valid: false,
      reason: 'A 2-move turn must combine 1 Self Move (Withdraw/Advance/Organize) and 1 Opponent Move (Assist/Remove/Influence)'
    };
  }

  return { valid: true };
}

export function applyMoveToState(move, boardState, community) {
  const { type, from, to } = move;

  let pieceToMove = null;
  const isFromComm = from === 'community' || from.startsWith('community_');
  const isToComm = to === 'community' || to.startsWith('community_');

  if (isFromComm) {
    if (from !== 'community' && boardState[from]) {
      pieceToMove = boardState[from];
      boardState[from] = null;
    } else {
      // ponytail: sort community keys numerically for deterministic piece retrieval
      const commKeys = Object.keys(boardState)
        .filter(k => k.startsWith('community_'))
        .sort((a, b) => parseInt(a.replace('community_', ''), 10) - parseInt(b.replace('community_', ''), 10));

      let commKey = commKeys.find(k => boardState[k]?.type === PIECE_TYPES.MARK);
      if (!commKey) commKey = commKeys.find(k => boardState[k]?.type === PIECE_TYPES.HEEL);
      if (!commKey) commKey = commKeys.find(k => boardState[k] !== null);

      if (commKey) {
        pieceToMove = boardState[commKey];
        boardState[commKey] = null;
      } else {
        // Fallback
        if (community && community.marks > 0) {
          community.marks--;
          pieceToMove = { id: `m_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.MARK };
        } else if (community && community.heels > 0) {
          community.heels--;
          pieceToMove = { id: `h_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.HEEL };
        }
      }
    }
  } else {
    pieceToMove = boardState[from];
    boardState[from] = null;
  }

  if (isToComm) {
    if (to !== 'community' && to.startsWith('community_')) {
      boardState[to] = pieceToMove;
    } else {
      // ponytail: sort community keys numerically to place returning pieces in lowest empty spot
      const commKeys = Object.keys(boardState)
        .filter(k => k.startsWith('community_'))
        .sort((a, b) => parseInt(a.replace('community_', ''), 10) - parseInt(b.replace('community_', ''), 10));

      const emptyCommKey = commKeys.find(k => boardState[k] === null);
      if (emptyCommKey) {
        boardState[emptyCommKey] = pieceToMove;
      }
    }
  } else {
    boardState[to] = pieceToMove;
  }
}

// Helper to check if a specific move type is legally possible on the board for a player
export function isMoveTypePossible(moveType, moverId, boardState, community, numPlayers) {
  if (!boardState) return true;

  const candidateKeys = Object.keys(boardState);
  const fromCandidates = candidateKeys.filter(k => !k.startsWith('community_') || boardState[k] !== null);
  if (!fromCandidates.includes('community')) fromCandidates.push('community');

  const toCandidates = candidateKeys.filter(k => !k.startsWith('community_'));
  if (!toCandidates.includes('community')) toCandidates.push('community');

  for (const fromLoc of fromCandidates) {
    for (const toLoc of toCandidates) {
      if (fromLoc === toLoc) continue;
      const moveCandidate = { type: moveType, from: fromLoc, to: toLoc };
      const val = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers);
      if (val.valid) return true;
    }
  }

  return false;
}

// Classify play as Honest, Dishonest, or Illegal
export function classifyPlay(movesMade, tileIdPlayed, moverId = '0', boardState = null, community = null, numPlayers = 3) {
  const moveTypesMade = (movesMade || []).map(m => m.type).sort();
  const playedTile = TILES[tileIdPlayed];

  if (!playedTile) return 'Dishonest';

  // Wild blank tile in 5-player mode is always honest
  if (playedTile.isWild) return 'Honest';

  const playedTileMoveTypes = [...playedTile.moves].sort();
  const isMatchWithPlayedTile =
    moveTypesMade.length === playedTileMoveTypes.length &&
    moveTypesMade.every((val, idx) => val === playedTileMoveTypes[idx]);

  if (isMatchWithPlayedTile) return 'Honest';

  // If boardState is provided, check if all unperformed required moves were IMPOSSIBLE to perform
  if (boardState) {
    const unperformedMoves = [...playedTile.moves];
    for (const m of movesMade || []) {
      const idx = unperformedMoves.indexOf(m.type);
      if (idx !== -1) unperformedMoves.splice(idx, 1);
    }

    const tempBoard = JSON.parse(JSON.stringify(boardState));
    const tempComm = community ? JSON.parse(JSON.stringify(community)) : null;

    const allUnperformedImpossible = unperformedMoves.every(reqType => {
      return !isMoveTypePossible(reqType, moverId, tempBoard, tempComm, numPlayers);
    });

    if (allUnperformedImpossible) {
      return 'Honest';
    }
  }

  return 'Dishonest';
}
