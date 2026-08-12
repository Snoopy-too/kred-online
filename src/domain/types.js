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
  '01': { id: '01', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 1 },
  '02': { id: '02', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 2 },
  '03': { id: '03', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 0 },
  '04': { id: '04', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 1 },
  '05': { id: '05', moves: [MOVE_TYPES.ADVANCE], funding: 2 },
  '06': { id: '06', moves: [MOVE_TYPES.ADVANCE], funding: 3 },
  '07': { id: '07', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 4 },
  '08': { id: '08', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 5 },
  '09': { id: '09', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 1 },
  '10': { id: '10', moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 2 },
  '11': { id: '11', moves: [MOVE_TYPES.INFLUENCE], funding: 4 },
  '12': { id: '12', moves: [MOVE_TYPES.ORGANIZE], funding: 5 },
  '13': { id: '13', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 5 },
  '14': { id: '14', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 6 },
  '15': { id: '15', moves: [MOVE_TYPES.REMOVE], funding: 3 },
  '16': { id: '16', moves: [MOVE_TYPES.REMOVE], funding: 4 },
  '17': { id: '17', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 3 },
  '18': { id: '18', moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 4 },
  '19': { id: '19', moves: [MOVE_TYPES.WITHDRAW], funding: 6 },
  '20': { id: '20', moves: [MOVE_TYPES.WITHDRAW], funding: 7 },
  '21': { id: '21', moves: [MOVE_TYPES.WITHDRAW], funding: 8 },
  '22': { id: '22', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 7 },
  '23': { id: '23', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 8 },
  '24': { id: '24', moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 9 },
  'BLANK': { id: 'BLANK', moves: [], funding: 0, isWild: true }
};

export const INITIAL_PIECE_COUNTS = {
  3: { MARKS: 12, HEELS: 9, PAWNS: 3, TILES_PER_PLAYER: 8, HAS_BLANK: false },
  4: { MARKS: 15, HEELS: 13, PAWNS: 4, TILES_PER_PLAYER: 6, HAS_BLANK: false },
  5: { MARKS: 18, HEELS: 17, PAWNS: 5, TILES_PER_PLAYER: 5, HAS_BLANK: true }
};

export const BUREAUCRACY_PRICES = {
  3: { PROMOTE_OFFICE: 18, EXTRA_ACTION: 15, PROMOTE_ROSTRUM: 12, BASIC_ACTION: 9, PROMOTE_SEAT: 6, RESTORE_CRED: 3 },
  4: { PROMOTE_OFFICE: 18, EXTRA_ACTION: 15, PROMOTE_ROSTRUM: 12, BASIC_ACTION: 9, PROMOTE_SEAT: 6, RESTORE_CRED: 3 },
  5: { PROMOTE_OFFICE: 12, EXTRA_ACTION: 10, PROMOTE_ROSTRUM: 8, BASIC_ACTION: 6, PROMOTE_SEAT: 4, RESTORE_CRED: 2 }
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
