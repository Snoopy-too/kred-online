import { z } from 'zod';

export const PIECE_TYPES = {
  MARK: 'Mark',
  HEEL: 'Heel',
  PAWN: 'Pawn'
};

export const MOVE_TYPES = {
  ADVANCE: 'Advance',
  WITHDRAW: 'Withdraw',
  ORGANIZE: 'Organize',
  REMOVE: 'Remove',
  INFLUENCE: 'Influence',
  ASSIST: 'Assist'
};

export const TILES = {
  '-1+': { id: '-1+', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 1 },
  '-2+': { id: '-2+', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 2 },
  '^0+': { id: '^0+', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 0 },
  '^1+': { id: '^1+', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 1 },
  '_2+': { id: '_2+', moves: [MOVE_TYPES.ADVANCE], funding: 2 },
  '_3+': { id: '_3+', moves: [MOVE_TYPES.ADVANCE], funding: 3 },
  '+4+': { id: '+4+', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 4 },
  '+5+': { id: '+5+', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 5 },
  '-1^': { id: '-1^', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 1 },
  '-2^': { id: '-2^', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 2 },
  '^4_': { id: '^4_', moves: [MOVE_TYPES.INFLUENCE], funding: 4 },
  '_5^': { id: '_5^', moves: [MOVE_TYPES.ORGANIZE], funding: 5 },
  '+5^': { id: '+5^', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 5 },
  '+6^': { id: '+6^', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 6 },
  '-3_': { id: '-3_', moves: [MOVE_TYPES.REMOVE], funding: 3 },
  '-4_': { id: '-4_', moves: [MOVE_TYPES.REMOVE], funding: 4 },
  '^3-': { id: '^3-', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 3 },
  '^4-': { id: '^4-', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 4 },
  '_6-': { id: '_6-', moves: [MOVE_TYPES.WITHDRAW], funding: 6 },
  '_7-': { id: '_7-', moves: [MOVE_TYPES.WITHDRAW], funding: 7 },
  '_8-': { id: '_8-', moves: [MOVE_TYPES.WITHDRAW], funding: 8 },
  '+7-': { id: '+7-', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 7 },
  '+8-': { id: '+8-', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 8 },
  '+9-': { id: '+9-', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 9 },
  '___': { id: '___', moves: [], funding: 0, isWild: true }
};

export const INITIAL_PIECE_COUNTS = {
  3: { MARKS: 12, HEELS: 9, PAWNS: 3, TILES_PER_PLAYER: 8, HAS_BLANK: false },
  4: { MARKS: 15, HEELS: 13, PAWNS: 4, TILES_PER_PLAYER: 6, HAS_BLANK: false },
  5: { MARKS: 18, HEELS: 17, PAWNS: 5, TILES_PER_PLAYER: 5, HAS_BLANK: true }
};

export const BUREAUCRACY_PRICES = {
  3: { PROMOTE_OFFICE: 18, EXTRA_ACTION: 15, PROMOTE_ROSTRUM: 12, BASIC_ACTION: 9, PROMOTE_SEAT: 6, RESTORE_CRED: 3 },
  4: { PROMOTE_OFFICE: 12, EXTRA_ACTION: 10, PROMOTE_ROSTRUM: 8, BASIC_ACTION: 6, PROMOTE_SEAT: 4, RESTORE_CRED: 2 },
  5: { PROMOTE_OFFICE: 6, EXTRA_ACTION: 5, PROMOTE_ROSTRUM: 4, BASIC_ACTION: 3, PROMOTE_SEAT: 2, RESTORE_CRED: 1 }
};

// Zod Validation Schemas
export const MoveActionSchema = z.object({
  type: z.enum([
    MOVE_TYPES.ADVANCE,
    MOVE_TYPES.WITHDRAW,
    MOVE_TYPES.ORGANIZE,
    MOVE_TYPES.REMOVE,
    MOVE_TYPES.INFLUENCE,
    MOVE_TYPES.ASSIST
  ]),
  from: z.string(),
  to: z.string(),
  pieceId: z.string().optional()
});

export const TurnSubmissionSchema = z.object({
  tileId: z.string(),
  receiverId: z.string(),
  moves: z.array(MoveActionSchema).max(2)
});
