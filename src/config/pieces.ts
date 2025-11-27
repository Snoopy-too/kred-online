// Piece configuration
import { GamePieceInfo } from "../types";

export const PIECE_TYPES: { [key: string]: GamePieceInfo } = {
  MARK: { name: "Mark", imageUrl: "./images/mark-transparent_bg.png" },
  HEEL: { name: "Heel", imageUrl: "./images/heel-transparent_bg.png" },
  PAWN: { name: "Pawn", imageUrl: "./images/pawn-transparent_bg.png" },
};

export const PIECE_COUNTS_BY_PLAYER_COUNT: {
  [playerCount: number]: { [pieceType: string]: number };
} = {
  3: {
    MARK: 12,
    HEEL: 9,
    PAWN: 3,
  },
  4: {
    MARK: 14,
    HEEL: 13,
    PAWN: 4,
  },
  5: {
    MARK: 18,
    HEEL: 17,
    PAWN: 5,
  },
};

/**
 * Default piece positions for campaign start
 *
 * These positions define where each piece starts on the board at the beginning
 * of the campaign phase. Marks start in seats 1, 3, and 5 for each player.
 * Heels and Pawns start in the community area.
 */
export const DEFAULT_PIECE_POSITIONS_BY_PLAYER_COUNT: {
  [key: number]: {
    name: string;
    displayName: string;
    position: { left: number; top: number };
  }[];
} = {
  3: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 48.3, top: 29.9 } },
    { name: "Mark", displayName: "M2", position: { left: 40.0, top: 35.6 } },
    { name: "Mark", displayName: "M3", position: { left: 37.3, top: 43.9 } },
    { name: "Mark", displayName: "M4", position: { left: 64.0, top: 48.8 } },
    { name: "Mark", displayName: "M5", position: { left: 63.8, top: 39.5 } },
    { name: "Mark", displayName: "M6", position: { left: 57.4, top: 32.9 } },
    { name: "Mark", displayName: "M7", position: { left: 40.2, top: 53.1 } },
    { name: "Mark", displayName: "M8", position: { left: 48.5, top: 58.4 } },
    { name: "Mark", displayName: "M9", position: { left: 57.7, top: 56.3 } },
    { name: "Mark", displayName: "M10", position: { left: 58.7, top: 45.0 } },
    { name: "Mark", displayName: "M11", position: { left: 46.4, top: 46.1 } },
    { name: "Mark", displayName: "M12", position: { left: 56.0, top: 46.1 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 45.2, top: 38.0 } },
    { name: "Heel", displayName: "H2", position: { left: 48.7, top: 38.0 } },
    { name: "Heel", displayName: "H3", position: { left: 52.2, top: 38.0 } },
    { name: "Heel", displayName: "H4", position: { left: 55.7, top: 38.0 } },
    { name: "Heel", displayName: "H5", position: { left: 45.2, top: 42.0 } },
    { name: "Heel", displayName: "H6", position: { left: 48.7, top: 42.0 } },
    { name: "Heel", displayName: "H7", position: { left: 52.2, top: 42.0 } },
    { name: "Heel", displayName: "H8", position: { left: 55.7, top: 42.0 } },
    { name: "Heel", displayName: "H9", position: { left: 50.4, top: 46.0 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 46.9, top: 50.0 } },
    { name: "Pawn", displayName: "P2", position: { left: 50.4, top: 50.0 } },
    { name: "Pawn", displayName: "P3", position: { left: 53.9, top: 50.0 } },
  ],
  4: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M2", position: { left: 41.31, top: 53.91 } },
    { name: "Mark", displayName: "M3", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M4", position: { left: 61.21, top: 50.63 } },
    { name: "Mark", displayName: "M5", position: { left: 58.34, top: 55.42 } },
    { name: "Mark", displayName: "M6", position: { left: 58.74, top: 46.55 } },
    { name: "Mark", displayName: "M7", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M8", position: { left: 41.31, top: 53.91 } },
    { name: "Mark", displayName: "M9", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M10", position: { left: 61.21, top: 50.63 } },
    { name: "Mark", displayName: "M11", position: { left: 58.34, top: 55.42 } },
    { name: "Mark", displayName: "M12", position: { left: 58.74, top: 46.55 } },
    { name: "Mark", displayName: "M13", position: { left: 41.05, top: 47.1 } },
    { name: "Mark", displayName: "M14", position: { left: 41.46, top: 43.27 } },
    { name: "Mark", displayName: "M15", position: { left: 51.7, top: 41.6 } },
    { name: "Mark", displayName: "M16", position: { left: 55.2, top: 41.6 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 41.05, top: 47.1 } },
    { name: "Heel", displayName: "H2", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H3", position: { left: 51.7, top: 45.6 } },
    { name: "Heel", displayName: "H4", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H5", position: { left: 41.05, top: 47.1 } },
    { name: "Heel", displayName: "H6", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H7", position: { left: 51.7, top: 49.6 } },
    { name: "Heel", displayName: "H8", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H9", position: { left: 41.31, top: 53.91 } },
    { name: "Heel", displayName: "H10", position: { left: 58.74, top: 46.55 } },
    { name: "Heel", displayName: "H11", position: { left: 51.7, top: 53.6 } },
    { name: "Heel", displayName: "H12", position: { left: 58.34, top: 55.42 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 61.21, top: 50.63 } },
    { name: "Pawn", displayName: "P2", position: { left: 58.34, top: 55.42 } },
    { name: "Pawn", displayName: "P3", position: { left: 51.7, top: 57.6 } },
    { name: "Pawn", displayName: "P4", position: { left: 58.34, top: 55.42 } },
  ],
  5: [
    // Marks
    { name: "Mark", displayName: "M1", position: { left: 29.0, top: 44.1 } },
    { name: "Mark", displayName: "M2", position: { left: 29.0, top: 51.8 } },
    { name: "Mark", displayName: "M3", position: { left: 32.6, top: 58.6 } },
    { name: "Mark", displayName: "M4", position: { left: 44.8, top: 29.0 } },
    { name: "Mark", displayName: "M5", position: { left: 38.3, top: 32.4 } },
    { name: "Mark", displayName: "M6", position: { left: 31.6, top: 37.1 } },
    { name: "Mark", displayName: "M7", position: { left: 65.3, top: 38.7 } },
    { name: "Mark", displayName: "M8", position: { left: 60.5, top: 32.5 } },
    { name: "Mark", displayName: "M9", position: { left: 53.0, top: 29.3 } },
    { name: "Mark", displayName: "M10", position: { left: 61.6, top: 60.0 } },
    { name: "Mark", displayName: "M11", position: { left: 66.1, top: 53.7 } },
    { name: "Mark", displayName: "M12", position: { left: 67.2, top: 46.2 } },
    { name: "Mark", displayName: "M13", position: { left: 39.2, top: 63.4 } },
    { name: "Mark", displayName: "M14", position: { left: 47.0, top: 65.5 } },
    { name: "Mark", displayName: "M15", position: { left: 54.9, top: 64.3 } },
    { name: "Mark", displayName: "M16", position: { left: 42.5, top: 36.9 } },
    { name: "Mark", displayName: "M17", position: { left: 46.0, top: 36.9 } },
    { name: "Mark", displayName: "M18", position: { left: 49.5, top: 36.9 } },
    { name: "Mark", displayName: "M19", position: { left: 53.0, top: 36.9 } },
    { name: "Mark", displayName: "M20", position: { left: 47.8, top: 40.9 } },
    // Heels
    { name: "Heel", displayName: "H1", position: { left: 42.5, top: 44.9 } },
    { name: "Heel", displayName: "H2", position: { left: 46.0, top: 44.9 } },
    { name: "Heel", displayName: "H3", position: { left: 49.5, top: 44.9 } },
    { name: "Heel", displayName: "H4", position: { left: 53.0, top: 44.9 } },
    { name: "Heel", displayName: "H5", position: { left: 42.5, top: 48.9 } },
    { name: "Heel", displayName: "H6", position: { left: 46.0, top: 48.9 } },
    { name: "Heel", displayName: "H7", position: { left: 49.5, top: 48.9 } },
    { name: "Heel", displayName: "H8", position: { left: 53.0, top: 48.9 } },
    { name: "Heel", displayName: "H9", position: { left: 42.5, top: 52.9 } },
    { name: "Heel", displayName: "H10", position: { left: 46.0, top: 52.9 } },
    { name: "Heel", displayName: "H11", position: { left: 49.5, top: 52.9 } },
    { name: "Heel", displayName: "H12", position: { left: 53.0, top: 52.9 } },
    { name: "Heel", displayName: "H13", position: { left: 44.3, top: 56.9 } },
    { name: "Heel", displayName: "H14", position: { left: 47.8, top: 56.9 } },
    { name: "Heel", displayName: "H15", position: { left: 51.3, top: 56.9 } },
    // Pawns
    { name: "Pawn", displayName: "P1", position: { left: 37.9, top: 46.7 } },
    { name: "Pawn", displayName: "P2", position: { left: 37.8, top: 50.3 } },
    { name: "Pawn", displayName: "P3", position: { left: 57.4, top: 53.4 } },
    { name: "Pawn", displayName: "P4", position: { left: 57.8, top: 49.4 } },
    { name: "Pawn", displayName: "P5", position: { left: 37.9, top: 54.1 } },
  ],
};
