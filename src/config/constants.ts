// Basic game constants
// --- Imported from root constants.ts ---
export const TIMEOUTS = {
  CHALLENGE_MESSAGE_DISMISS: 5000,
  BUREAUCRACY_TRANSITION: 3000,
  VALIDATION_ERROR_SHORT: 3000,
  VALIDATION_ERROR_LONG: 4000,
} as const;

export const ALERTS = {
  PIECE_ALREADY_MOVED: {
    title: 'Piece Already Moved',
    message: 'Pieces may only be moved once per turn! If you want to move this piece somewhere else, click the Reset Turn button.',
  },
  INVALID_MOVE: {
    title: 'Invalid Move',
  },
  CANNOT_MOVE_PIECE: {
    title: 'Cannot Move This Piece',
    message: 'To move a Pawn, Heels need to be gone. To move Heels, Marks need to be gone.',
  },
  ILLEGAL_MOVE: {
    title: 'Illegal Move',
  },
  INVALID_MOVES: {
    title: 'Invalid Moves',
  },
  CANNOT_PLAY_FOR_YOURSELF: {
    title: 'Cannot Play for Yourself',
    message: 'You cannot play a tile for yourself until all other players have run out of tiles.',
  },
  BANK_FULL: {
    title: 'Bank Full',
  },
  INVALID_FINAL_TILE: {
    title: 'Invalid Final Tile Placement',
  },
  INVALID_TILE_PLACEMENT: {
    title: 'Invalid Tile Placement',
  },
  INCOMPLETE_MOVES: {
    title: 'Incomplete Moves',
  },
  EXTRA_MOVES_NOT_ALLOWED: {
    title: 'Extra Moves Not Allowed',
  },
  MANDATORY_WITHDRAW: {
    title: 'Mandatory WITHDRAW Required',
    message: 'You must perform an ADDITIONAL WITHDRAW move beyond the tile requirements. Add another WITHDRAW move to proceed.',
  },
  INSUFFICIENT_KREDCOIN: {
    message: 'Insufficient Kredcoin for this purchase',
  },
  NO_TILES_IN_BANK: {
    message: 'You have no tiles in your bank',
  },
  INVALID_ACTION: {
    message: 'Invalid action. Please try again or reset.',
  },
  PROMOTION_FAILED: {
    message: 'Promotion failed',
  },
} as const;

export const DEFAULTS = {
  INITIAL_CREDIBILITY: 3,
  MAX_CREDIBILITY: 3,
  MIN_CREDIBILITY: 0,
} as const;

export const GAME_LOGS = {
  NO_TILES_FOR_TAKE_ADVANTAGE: (playerName: string) =>
    `${playerName} has no tiles for Take Advantage - skipping reward`,
  TAKE_ADVANTAGE_SKIPPED_NO_TILES: (playerName: string) =>
    `${playerName} has no tiles for Take Advantage - skipping reward`,
} as const;

export const TOTAL_TILES = 24;

export const PLAYER_OPTIONS = [3, 4, 5];

export const BOARD_IMAGE_URLS: { [key: number]: string } = {
  3: './images/3player_board.jpg',
  4: './images/4player_board.jpg',
  5: './images/5player_board.jpg',
};
