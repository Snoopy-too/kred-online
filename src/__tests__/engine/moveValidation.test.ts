// src/__tests__/engine/moveValidation.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import {
  validateMove,
  findLegalMoves,
  checkSupportViolations,
} from '../../engine/moveValidation';
import type { KredPiece, EngineMove } from '../../engine/types';

// Helper: create a minimal 3-player starting board
function makeStartingPieces(): KredPiece[] {
  const pieces: KredPiece[] = [];
  let markCounter = 1;
  // 3 players, Marks at seats 1,3,5
  for (let p = 1; p <= 3; p++) {
    for (const s of [1, 3, 5]) {
      pieces.push({ id: `mark_${markCounter}`, type: 'MARK', locationId: `p${p}_seat${s}` });
      markCounter++;
    }
  }
  // 3 additional marks in community
  for (let i = markCounter; i <= 12; i++) {
    pieces.push({ id: `mark_${i}`, type: 'MARK', locationId: 'community' });
  }
  // 9 heels in community
  for (let i = 1; i <= 9; i++) {
    pieces.push({ id: `heel_${i}`, type: 'HEEL', locationId: 'community' });
  }
  // 3 pawns in community
  for (let i = 1; i <= 3; i++) {
    pieces.push({ id: `pawn_${i}`, type: 'PAWN', locationId: 'community' });
  }
  return pieces;
}

describe('validateMove', () => {
  describe('ADVANCE', () => {
    it('allows Community -> vacant seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10', // in community
        fromLocationId: 'community',
        toLocationId: 'p1_seat2', // vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects Community -> occupied seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p1_seat1', // occupied
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects Community -> opponent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p2_seat2', // opponent
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects Seat -> Rostrum when faction not full', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('allows Seat -> Rostrum when faction is full', () => {
      const pieces = makeStartingPieces();
      // Fill p1 seat2 to complete faction 1
      pieces.push({ id: 'mark_extra', type: 'MARK', locationId: 'p1_seat2' });
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects Seat -> Rostrum when rostrum already occupied', () => {
      const pieces = makeStartingPieces();
      // Fill p1 seat2 to complete faction 1
      pieces.push({ id: 'mark_extra', type: 'MARK', locationId: 'p1_seat2' });
      // Put a piece on the rostrum already
      pieces.push({ id: 'mark_blocker', type: 'MARK', locationId: 'p1_rostrum1' });
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('takes Marks before Heels from community', () => {
      const pieces = makeStartingPieces(); // has marks in community
      const heelMove: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'heel_1',
        fromLocationId: 'community',
        toLocationId: 'p1_seat2',
      };
      // Should reject — marks still in community
      expect(validateMove(heelMove, 1, pieces, 3)).toBe(false);
    });
  });

  describe('REMOVE', () => {
    it('allows removing opponent Mark from seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects removing own Mark', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_1', // p1_seat1 — own domain
        fromLocationId: 'p1_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects removing Heel', () => {
      const pieces: KredPiece[] = [
        { id: 'heel_1', type: 'HEEL', locationId: 'p2_seat1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'heel_1',
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects removing from rostrum', () => {
      const pieces: KredPiece[] = [
        { id: 'mark_1', type: 'MARK', locationId: 'p2_rostrum1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_1',
        fromLocationId: 'p2_rostrum1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('WITHDRAW', () => {
    it('allows Seat -> Community', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects withdrawing opponent piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_4',
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('allows Office -> vacant Rostrum when supporting seat is occupied', () => {
      const pieces: KredPiece[] = [
        { id: 'mark_office', type: 'MARK', locationId: 'p1_office' },
        // At least one supporting seat for rostrum1 must be occupied
        { id: 'mark_seat', type: 'MARK', locationId: 'p1_seat1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_office',
        fromLocationId: 'p1_office',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects Office -> Rostrum when no supporting seat is occupied', () => {
      const pieces: KredPiece[] = [
        { id: 'mark_office', type: 'MARK', locationId: 'p1_office' },
        // No supporting seats occupied
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_office',
        fromLocationId: 'p1_office',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('allows Rostrum -> vacant Seat in same faction', () => {
      const pieces: KredPiece[] = [
        { id: 'mark_rostrum', type: 'MARK', locationId: 'p1_rostrum1' },
        // supporting seats are vacant
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_rostrum',
        fromLocationId: 'p1_rostrum1',
        toLocationId: 'p1_seat1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });
  });

  describe('ORGANIZE', () => {
    it('allows seat -> adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat2', // adjacent, vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects seat -> non-adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat4', // not adjacent
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects organizing opponent piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'p2_seat2',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('INFLUENCE', () => {
    it('allows moving opponent Mark to adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'p2_seat2', // adjacent, vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects influencing own piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat2',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects influencing Pawn across domains', () => {
      const pieces: KredPiece[] = [
        { id: 'pawn_1', type: 'PAWN', locationId: 'p2_seat1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'pawn_1',
        fromLocationId: 'p2_seat1',
        toLocationId: 'p3_seat6', // cross-domain
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('ASSIST', () => {
    it('allows placing Mark in opponent vacant seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ASSIST,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p2_seat2', // opponent vacant seat
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects assisting own domain', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ASSIST,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p1_seat2', // own domain
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });
});

describe('findLegalMoves', () => {
  it('returns at least one ADVANCE for player 1 at game start', () => {
    const pieces = makeStartingPieces();
    const moves = findLegalMoves(DefinedMoveType.ADVANCE, 1, pieces, 3);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(m => m.moveType === DefinedMoveType.ADVANCE)).toBe(true);
  });

  it('returns seat->rostrum ADVANCE options when all seats filled (both factions full)', () => {
    const pieces: KredPiece[] = [];
    for (let s = 1; s <= 6; s++) {
      pieces.push({ id: `mark_${s}`, type: 'MARK', locationId: `p1_seat${s}` });
    }
    const moves = findLegalMoves(DefinedMoveType.ADVANCE, 1, pieces, 3);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.some(m => m.toLocationId === 'p1_rostrum1')).toBe(true);
    expect(moves.some(m => m.toLocationId === 'p1_rostrum2')).toBe(true);
  });

  it('returns REMOVE options for opponent marks in seats', () => {
    const pieces = makeStartingPieces();
    const moves = findLegalMoves(DefinedMoveType.REMOVE, 1, pieces, 3);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(m => {
      const piece = pieces.find(p => p.id === m.pieceId);
      return piece && piece.type === 'MARK' && !m.fromLocationId.startsWith('p1_');
    })).toBe(true);
  });
});

describe('checkSupportViolations', () => {
  it('returns empty for valid board', () => {
    const pieces = makeStartingPieces();
    expect(checkSupportViolations(pieces, 3)).toEqual([]);
  });

  it('detects unsupported rostrum piece', () => {
    const pieces: KredPiece[] = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_rostrum1' },
    ];
    const violations = checkSupportViolations(pieces, 3);
    expect(violations.length).toBe(1);
    expect(violations[0].pieceId).toBe('mark_1');
    expect(violations[0].locationId).toBe('p1_rostrum1');
  });

  it('detects unsupported office piece', () => {
    const pieces: KredPiece[] = [
      { id: 'heel_1', type: 'HEEL', locationId: 'p1_office' },
    ];
    const violations = checkSupportViolations(pieces, 3);
    expect(violations.length).toBe(1);
    expect(violations[0].pieceId).toBe('heel_1');
  });
});
