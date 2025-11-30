import {
    DropLocation,
    PlayerRostrum,
    RostrumAdjacency,
    DefinedMoveType,
    DefinedMove,
    MoveRequirementType,
    TilePlayOptionType,
    TilePlayOption,
    TileRequirement,
    TileReceivingSpace,
    BankSpace,
    GamePieceInfo,
    BureaucracyMenuItem
} from './types';

// These are the ONLY valid drop locations for pieces.
const THREE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
    // Player 1 Seats
    { id: 'p1_seat1', position: { left: 48.25, top: 29.91 } },
    { id: 'p1_seat2', position: { left: 43.87, top: 32.62 } },
    { id: 'p1_seat3', position: { left: 39.96, top: 35.65 } },
    { id: 'p1_seat4', position: { left: 38.17, top: 39.19 } },
    { id: 'p1_seat5', position: { left: 37.30, top: 43.94 } },
    { id: 'p1_seat6', position: { left: 37.73, top: 48.54 } },
    // Player 3 Seats
    { id: 'p3_seat1', position: { left: 40.17, top: 53.08 } },
    { id: 'p3_seat2', position: { left: 44.01, top: 56.13 } },
    { id: 'p3_seat3', position: { left: 48.46, top: 58.40 } },
    { id: 'p3_seat4', position: { left: 52.92, top: 58.18 } },
    { id: 'p3_seat5', position: { left: 57.71, top: 56.27 } },
    { id: 'p3_seat6', position: { left: 60.96, top: 53.51 } },
    // Player 2 Seats
    { id: 'p2_seat1', position: { left: 63.98, top: 48.83 } },
    { id: 'p2_seat2', position: { left: 64.61, top: 44.16 } },
    { id: 'p2_seat3', position: { left: 63.76, top: 39.48 } },
    { id: 'p2_seat4', position: { left: 61.83, top: 35.25 } },
    { id: 'p2_seat5', position: { left: 57.39, top: 32.89 } },
    { id: 'p2_seat6', position: { left: 53.51, top: 30.86 } },
    // Rostrums
    { id: 'p1_rostrum1', position: { left: 46.64, top: 22.25 } },
    { id: 'p1_rostrum2', position: { left: 29.84, top: 51.31 } },
    { id: 'p3_rostrum1', position: { left: 35.89, top: 59.51 } },
    { id: 'p3_rostrum2', position: { left: 66.07, top: 58.91 } },
    { id: 'p2_rostrum1', position: { left: 72.20, top: 52.48 } },
    { id: 'p2_rostrum2', position: { left: 54.82, top: 22.39 } },
    // Offices
    { id: 'p1_office', position: { left: 31.95, top: 25.01 } },
    { id: 'p2_office', position: { left: 76.22, top: 36.38 } },
    { id: 'p3_office', position: { left: 44.03, top: 68.87 } },
    // Community (18 spaces with proper spacing - no overlap with seats)
    // Middle row (top: 46.0-47.8%)
    { id: 'community1', position: { left: 53.50, top: 47.80 } },
    { id: 'community2', position: { left: 43.70, top: 47.70 } },
    { id: 'community3', position: { left: 57.00, top: 46.00 } },
    // Top row (top: 38.0%)
    { id: 'community4', position: { left: 45.20, top: 38.00 } },
    { id: 'community5', position: { left: 48.70, top: 38.00 } },
    { id: 'community6', position: { left: 52.20, top: 38.00 } },
    { id: 'community7', position: { left: 55.70, top: 38.00 } },
    // Second row (top: 42.0%)
    { id: 'community8', position: { left: 45.20, top: 42.00 } },
    { id: 'community9', position: { left: 48.70, top: 42.00 } },
    { id: 'community10', position: { left: 52.20, top: 42.00 } },
    { id: 'community11', position: { left: 55.70, top: 42.00 } },
    { id: 'community12', position: { left: 50.40, top: 46.00 } },
    // Bottom row (top: 50.0%)
    { id: 'community13', position: { left: 46.90, top: 50.00 } },
    { id: 'community14', position: { left: 50.40, top: 50.00 } },
    { id: 'community15', position: { left: 53.90, top: 50.00 } },
    // Additional locations
    { id: 'community16', position: { left: 43.78, top: 44.51 } },
    { id: 'community17', position: { left: 42.53, top: 42.85 } },
    { id: 'community18', position: { left: 56.70, top: 49.51 } },
];

const FOUR_PLAYER_DROP_LOCATIONS: DropLocation[] = [
    // Player 1 Seats
    { id: 'p1_seat1', position: { left: 42.83, top: 34.48 } },
    { id: 'p1_seat2', position: { left: 38.61, top: 37.35 } },
    { id: 'p1_seat3', position: { left: 34.17, top: 40.50 } },
    { id: 'p1_seat4', position: { left: 32.71, top: 44.47 } },
    { id: 'p1_seat5', position: { left: 31.02, top: 48.79 } },
    { id: 'p1_seat6', position: { left: 31.35, top: 53.40 } },
    // Player 2 Seats
    { id: 'p2_seat1', position: { left: 67.62, top: 43.57 } },
    { id: 'p2_seat2', position: { left: 65.14, top: 40.54 } },
    { id: 'p2_seat3', position: { left: 61.43, top: 37.35 } },
    { id: 'p2_seat4', position: { left: 57.09, top: 35.33 } },
    { id: 'p2_seat5', position: { left: 52.92, top: 33.52 } },
    { id: 'p2_seat6', position: { left: 47.56, top: 33.52 } },
    // Player 3 Seats
    { id: 'p3_seat1', position: { left: 57.95, top: 67.50 } },
    { id: 'p3_seat2', position: { left: 61.73, top: 64.99 } },
    { id: 'p3_seat3', position: { left: 65.40, top: 61.70 } },
    { id: 'p3_seat4', position: { left: 67.52, top: 58.18 } },
    { id: 'p3_seat5', position: { left: 68.34, top: 53.61 } },
    { id: 'p3_seat6', position: { left: 68.88, top: 48.94 } },
    // Player 4 Seats
    { id: 'p4_seat1', position: { left: 32.20, top: 57.97 } },
    { id: 'p4_seat2', position: { left: 35.09, top: 62.22 } },
    { id: 'p4_seat3', position: { left: 39.21, top: 64.77 } },
    { id: 'p4_seat4', position: { left: 43.03, top: 67.22 } },
    { id: 'p4_seat5', position: { left: 46.92, top: 68.21 } },
    { id: 'p4_seat6', position: { left: 52.66, top: 69.13 } },
    // Rostrums
    { id: 'p1_rostrum1', position: { left: 40.31, top: 27.68 } },
    { id: 'p1_rostrum2', position: { left: 23.87, top: 55.00 } },
    { id: 'p2_rostrum1', position: { left: 74.82, top: 42.08 } },
    { id: 'p2_rostrum2', position: { left: 46.43, top: 26.51 } },
    { id: 'p3_rostrum1', position: { left: 60.03, top: 74.66 } },
    { id: 'p3_rostrum2', position: { left: 76.36, top: 47.34 } },
    { id: 'p4_rostrum1', position: { left: 25.18, top: 59.71 } },
    { id: 'p4_rostrum2', position: { left: 54.14, top: 75.72 } },
    // Offices
    { id: 'p1_office', position: { left: 18.18, top: 44.34 } },
    { id: 'p2_office', position: { left: 55.99, top: 19.63 } },
    { id: 'p3_office', position: { left: 82.55, top: 55.08 } },
    { id: 'p4_office', position: { left: 44.43, top: 79.79 } },
    // Community (27 spaces in a grid)
    { id: 'community1', position: { left: 44.70, top: 41.60 } },
    { id: 'community2', position: { left: 48.20, top: 41.60 } },
    { id: 'community3', position: { left: 51.70, top: 41.60 } },
    { id: 'community4', position: { left: 55.20, top: 41.60 } },
    { id: 'community5', position: { left: 44.70, top: 45.60 } },
    { id: 'community6', position: { left: 48.20, top: 45.60 } },
    { id: 'community7', position: { left: 51.70, top: 45.60 } },
    { id: 'community8', position: { left: 55.20, top: 45.60 } },
    { id: 'community9', position: { left: 44.70, top: 49.60 } },
    { id: 'community10', position: { left: 48.20, top: 49.60 } },
    { id: 'community11', position: { left: 51.70, top: 49.60 } },
    { id: 'community12', position: { left: 55.20, top: 49.60 } },
    { id: 'community13', position: { left: 44.70, top: 53.60 } },
    { id: 'community14', position: { left: 48.20, top: 53.60 } },
    { id: 'community15', position: { left: 51.70, top: 53.60 } },
    { id: 'community16', position: { left: 55.20, top: 53.60 } },
    { id: 'community17', position: { left: 44.70, top: 57.60 } },
    { id: 'community18', position: { left: 48.20, top: 57.60 } },
    { id: 'community19', position: { left: 51.70, top: 57.60 } },
    { id: 'community20', position: { left: 55.20, top: 57.60 } },
    { id: 'community21', position: { left: 59.10, top: 45.25 } },
    { id: 'community22', position: { left: 59.10, top: 49.84 } },
    { id: 'community23', position: { left: 59.10, top: 54.43 } },
    { id: 'community24', position: { left: 59.10, top: 58.14 } },
    { id: 'community25', position: { left: 40.14, top: 46.03 } },
    { id: 'community26', position: { left: 40.14, top: 50.62 } },
    { id: 'community27', position: { left: 40.14, top: 54.13 } },
];

const FIVE_PLAYER_DROP_LOCATIONS: DropLocation[] = [
    // Player 1 Seats (pushed 2% outward from center for better spacing)
    { id: 'p1_seat1', position: { left: 29.48, top: 44.06 } },
    { id: 'p1_seat2', position: { left: 29.40, top: 47.67 } },
    { id: 'p1_seat3', position: { left: 29.52, top: 51.79 } },
    { id: 'p1_seat4', position: { left: 31.25, top: 54.83 } },
    { id: 'p1_seat5', position: { left: 33.33, top: 58.19 } },
    { id: 'p1_seat6', position: { left: 36.33, top: 60.69 } },
    // Player 2 Seats
    { id: 'p2_seat1', position: { left: 45.22, top: 29.89 } },
    { id: 'p2_seat2', position: { left: 41.42, top: 30.76 } },
    { id: 'p2_seat3', position: { left: 38.06, top: 32.07 } },
    { id: 'p2_seat4', position: { left: 34.60, top: 34.12 } },
    { id: 'p2_seat5', position: { left: 32.85, top: 37.70 } },
    { id: 'p2_seat6', position: { left: 29.56, top: 40.64 } },
    // Player 3 Seats
    { id: 'p3_seat1', position: { left: 64.67, top: 39.10 } },
    { id: 'p3_seat2', position: { left: 62.59, top: 35.96 } },
    { id: 'p3_seat3', position: { left: 59.41, top: 32.49 } },
    { id: 'p3_seat4', position: { left: 56.34, top: 31.20 } },
    { id: 'p3_seat5', position: { left: 52.80, top: 29.57 } },
    { id: 'p3_seat6', position: { left: 49.06, top: 29.24 } },
    // Player 4 Seats
    { id: 'p4_seat1', position: { left: 60.93, top: 59.49 } },
    { id: 'p4_seat2', position: { left: 63.28, top: 56.67 } },
    { id: 'p4_seat3', position: { left: 65.38, top: 53.53 } },
    { id: 'p4_seat4', position: { left: 66.52, top: 50.17 } },
    { id: 'p4_seat5', position: { left: 66.52, top: 46.05 } },
    { id: 'p4_seat6', position: { left: 65.71, top: 42.47 } },
    // Player 5 Seats
    { id: 'p5_seat1', position: { left: 39.34, top: 62.96 } },
    { id: 'p5_seat2', position: { left: 42.93, top: 64.04 } },
    { id: 'p5_seat3', position: { left: 46.75, top: 65.24 } },
    { id: 'p5_seat4', position: { left: 50.80, top: 65.35 } },
    { id: 'p5_seat5', position: { left: 54.96, top: 63.72 } },
    { id: 'p5_seat6', position: { left: 58.31, top: 61.88 } },
    // Rostrums
    { id: 'p1_rostrum1', position: { left: 24.89, top: 45.32 } },
    { id: 'p1_rostrum2', position: { left: 31.85, top: 62.83 } },
    { id: 'p2_rostrum1', position: { left: 42.56, top: 26.12 } },
    { id: 'p2_rostrum2', position: { left: 27.08, top: 37.39 } },
    { id: 'p3_rostrum1', position: { left: 67.86, top: 35.44 } },
    { id: 'p3_rostrum2', position: { left: 51.37, top: 25.22 } },
    { id: 'p4_rostrum1', position: { left: 65.36, top: 61.27 } },
    { id: 'p4_rostrum2', position: { left: 70.77, top: 43.30 } },
    { id: 'p5_rostrum1', position: { left: 39.17, top: 67.54 } },
    { id: 'p5_rostrum2', position: { left: 58.79, top: 66.69 } },
    // Offices
    { id: 'p1_office', position: { left: 15.70, top: 44.75 } },
    { id: 'p2_office', position: { left: 39.45, top: 17.10 } },
    { id: 'p3_office', position: { left: 75.18, top: 29.31 } },
    { id: 'p4_office', position: { left: 72.89, top: 65.24 } },
    { id: 'p5_office', position: { left: 36.22, top: 74.70 } },
    // Community (40 spaces in organized grid - shifted southwest for better centering)
    // Row 1 (top: 39.40)
    { id: 'community1', position: { left: 36.50, top: 39.40 } },
    { id: 'community2', position: { left: 40.00, top: 39.40 } },
    { id: 'community3', position: { left: 43.50, top: 39.40 } },
    { id: 'community4', position: { left: 47.00, top: 39.40 } },
    { id: 'community5', position: { left: 50.50, top: 39.40 } },
    { id: 'community6', position: { left: 54.00, top: 39.40 } },
    { id: 'community7', position: { left: 57.50, top: 39.40 } },
    // Row 2 (top: 43.40)
    { id: 'community8', position: { left: 38.25, top: 43.40 } },
    { id: 'community9', position: { left: 41.75, top: 43.40 } },
    { id: 'community10', position: { left: 45.25, top: 43.40 } },
    { id: 'community11', position: { left: 48.75, top: 43.40 } },
    { id: 'community12', position: { left: 52.25, top: 43.40 } },
    { id: 'community13', position: { left: 55.75, top: 43.40 } },
    // Row 3 (top: 47.40)
    { id: 'community14', position: { left: 36.50, top: 47.40 } },
    { id: 'community15', position: { left: 40.00, top: 47.40 } },
    { id: 'community16', position: { left: 43.50, top: 47.40 } },
    { id: 'community17', position: { left: 47.00, top: 47.40 } },
    { id: 'community18', position: { left: 50.50, top: 47.40 } },
    { id: 'community19', position: { left: 54.00, top: 47.40 } },
    { id: 'community20', position: { left: 57.50, top: 47.40 } },
    // Row 4 (top: 51.40)
    { id: 'community21', position: { left: 38.25, top: 51.40 } },
    { id: 'community22', position: { left: 41.75, top: 51.40 } },
    { id: 'community23', position: { left: 45.25, top: 51.40 } },
    { id: 'community24', position: { left: 48.75, top: 51.40 } },
    { id: 'community25', position: { left: 52.25, top: 51.40 } },
    { id: 'community26', position: { left: 55.75, top: 51.40 } },
    // Row 5 (top: 55.40)
    { id: 'community27', position: { left: 36.50, top: 55.40 } },
    { id: 'community28', position: { left: 40.00, top: 55.40 } },
    { id: 'community29', position: { left: 43.50, top: 55.40 } },
    { id: 'community30', position: { left: 47.00, top: 55.40 } },
    { id: 'community31', position: { left: 50.50, top: 55.40 } },
    { id: 'community32', position: { left: 54.00, top: 55.40 } },
    { id: 'community33', position: { left: 57.50, top: 55.40 } },
    // Row 6 (top: 59.40)
    { id: 'community34', position: { left: 38.25, top: 59.40 } },
    { id: 'community35', position: { left: 41.75, top: 59.40 } },
    { id: 'community36', position: { left: 45.25, top: 59.40 } },
    { id: 'community37', position: { left: 48.75, top: 59.40 } },
    { id: 'community38', position: { left: 52.25, top: 59.40 } },
    { id: 'community39', position: { left: 55.75, top: 59.40 } },
    // Extra space (centered at bottom)
    { id: 'community40', position: { left: 47.00, top: 62.90 } },
];

export const DROP_LOCATIONS_BY_PLAYER_COUNT: { [playerCount: number]: DropLocation[] } = {
    3: THREE_PLAYER_DROP_LOCATIONS,
    4: FOUR_PLAYER_DROP_LOCATIONS,
    5: FIVE_PLAYER_DROP_LOCATIONS,
};

/**
 * Comprehensive mapping of rostrums to their supporting seats for all player counts.
 * The structure is the same regardless of player count (3, 4, or 5 players).
 */
export const ROSTRUM_SUPPORT_RULES: { [playerId: number]: PlayerRostrum } = {
    1: {
        playerId: 1,
        rostrums: [
            { rostrum: 'p1_rostrum1', supportingSeats: ['p1_seat1', 'p1_seat2', 'p1_seat3'] },
            { rostrum: 'p1_rostrum2', supportingSeats: ['p1_seat4', 'p1_seat5', 'p1_seat6'] },
        ],
        office: 'p1_office',
    },
    2: {
        playerId: 2,
        rostrums: [
            { rostrum: 'p2_rostrum1', supportingSeats: ['p2_seat1', 'p2_seat2', 'p2_seat3'] },
            { rostrum: 'p2_rostrum2', supportingSeats: ['p2_seat4', 'p2_seat5', 'p2_seat6'] },
        ],
        office: 'p2_office',
    },
    3: {
        playerId: 3,
        rostrums: [
            { rostrum: 'p3_rostrum1', supportingSeats: ['p3_seat1', 'p3_seat2', 'p3_seat3'] },
            { rostrum: 'p3_rostrum2', supportingSeats: ['p3_seat4', 'p3_seat5', 'p3_seat6'] },
        ],
        office: 'p3_office',
    },
    4: {
        playerId: 4,
        rostrums: [
            { rostrum: 'p4_rostrum1', supportingSeats: ['p4_seat1', 'p4_seat2', 'p4_seat3'] },
            { rostrum: 'p4_rostrum2', supportingSeats: ['p4_seat4', 'p4_seat5', 'p4_seat6'] },
        ],
        office: 'p4_office',
    },
    5: {
        playerId: 5,
        rostrums: [
            { rostrum: 'p5_rostrum1', supportingSeats: ['p5_seat1', 'p5_seat2', 'p5_seat3'] },
            { rostrum: 'p5_rostrum2', supportingSeats: ['p5_seat4', 'p5_seat5', 'p5_seat6'] },
        ],
        office: 'p5_office',
    },
};

export const ROSTRUM_ADJACENCY_BY_PLAYER_COUNT: { [playerCount: number]: RostrumAdjacency[] } = {
    3: [
        { rostrum1: 'p1_rostrum2', rostrum2: 'p3_rostrum1' },
        { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
        { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
    ],
    4: [
        { rostrum1: 'p1_rostrum2', rostrum2: 'p4_rostrum1' },
        { rostrum1: 'p4_rostrum2', rostrum2: 'p3_rostrum1' },
        { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
        { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
    ],
    5: [
        { rostrum1: 'p1_rostrum2', rostrum2: 'p5_rostrum1' },
        { rostrum1: 'p5_rostrum2', rostrum2: 'p4_rostrum1' },
        { rostrum1: 'p4_rostrum2', rostrum2: 'p3_rostrum1' },
        { rostrum1: 'p3_rostrum2', rostrum2: 'p2_rostrum1' },
        { rostrum1: 'p2_rostrum2', rostrum2: 'p1_rostrum1' },
    ],
};


/**
 * DEFINED MOVES
 *
 * (M) moves affect pieces originating in the player's own domain
 * (O) moves affect pieces originating in an opponent's domain
 */
export const DEFINED_MOVES: { [key in DefinedMoveType]: DefinedMove } = {
    [DefinedMoveType.REMOVE]: {
        type: DefinedMoveType.REMOVE,
        category: 'O',
        requirement: MoveRequirementType.OPTIONAL,
        description: '(O) Remove – Take a Mark or a Heel from a seat in an opponent\'s domain and return it to the community.',
        options: [
            'a. Take a Mark or Heel from an opponent\'s seat',
            'b. Return the piece to the community',
        ],
        canTargetOwnDomain: false,
        canTargetOpponentDomain: true,
        affectsCommunity: true,
    },
    [DefinedMoveType.ADVANCE]: {
        type: DefinedMoveType.ADVANCE,
        category: 'M',
        requirement: MoveRequirementType.MANDATORY,
        description: '(M) Advance – Player\'s choice of ONE of the following',
        options: [
            'a. Take a piece from the community and add it to an open seat in their domain',
            'b. Take a piece from a seat in their domain and place it into the open Rostrum that that seat supports',
            'c. Take a piece from a Rostrum in their domain and place it into the office in their domain',
        ],
        canTargetOwnDomain: true,
        canTargetOpponentDomain: false,
        affectsCommunity: true,
    },
    [DefinedMoveType.INFLUENCE]: {
        type: DefinedMoveType.INFLUENCE,
        category: 'O',
        requirement: MoveRequirementType.OPTIONAL,
        description: '(O) Influence – A player may move another player\'s piece from a seat to an adjacent seat (even if that seat is in another player\'s domain), OR from an opponent\'s rostrum to an adjacent rostrum in another player\'s domain.',
        options: [
            'a. Move another player\'s piece from a seat to an adjacent seat',
            'b. Move another player\'s piece from a rostrum to an adjacent rostrum in another player\'s domain',
        ],
        canTargetOwnDomain: false,
        canTargetOpponentDomain: true,
        affectsCommunity: false,
    },
    [DefinedMoveType.ASSIST]: {
        type: DefinedMoveType.ASSIST,
        category: 'O',
        requirement: MoveRequirementType.OPTIONAL,
        description: '(O) Assist – A player may add a piece from the community to an opponent\'s vacant seat.',
        options: [
            'a. Take a piece from the community and add it to an opponent\'s vacant seat',
        ],
        canTargetOwnDomain: false,
        canTargetOpponentDomain: true,
        affectsCommunity: true,
    },
    [DefinedMoveType.WITHDRAW]: {
        type: DefinedMoveType.WITHDRAW,
        category: 'M',
        requirement: MoveRequirementType.MANDATORY,
        description: '(M) Withdraw – A player MUST do one of the following UNLESS they have 0 pieces in their domain',
        options: [
            'a. Move a piece from an office to a vacant rostrum in their domain',
            'b. Move a piece from a rostrum in their domain to a vacant seat in their domain',
            'c. Move a piece from a seat in their domain to the community',
        ],
        canTargetOwnDomain: true,
        canTargetOpponentDomain: false,
        affectsCommunity: true,
    },
    [DefinedMoveType.ORGANIZE]: {
        type: DefinedMoveType.ORGANIZE,
        category: 'M',
        requirement: MoveRequirementType.MANDATORY,
        description: '(M) Organize – A player must do one of the following',
        options: [
            'a. Move a piece from a seat in their domain to an adjacent seat, even if it ends up in an opponent\'s domain',
            'b. Move a piece from a rostrum in their domain to an adjacent rostrum in an opponent\'s domain',
        ],
        canTargetOwnDomain: true,
        canTargetOpponentDomain: true,
        affectsCommunity: false,
    },
};

/**
 * Complete definition of all tile play options available to a receiving player.
 * The receiving player must choose exactly ONE of these options when challenged with a tile.
 */
export const TILE_PLAY_OPTIONS: { [key in TilePlayOptionType]: TilePlayOption } = {
    [TilePlayOptionType.NO_MOVE]: {
        optionType: TilePlayOptionType.NO_MOVE,
        description: 'Do nothing. The tile play is complete.',
        allowedMoveTypes: [],
        maxOptionalMoves: 0,
        maxMandatoryMoves: 0,
        requiresAction: false,
    },
    [TilePlayOptionType.ONE_OPTIONAL]: {
        optionType: TilePlayOptionType.ONE_OPTIONAL,
        description: 'Execute one Optional move (REMOVE, INFLUENCE, or ASSIST)',
        allowedMoveTypes: [
            DefinedMoveType.REMOVE,
            DefinedMoveType.INFLUENCE,
            DefinedMoveType.ASSIST,
        ],
        maxOptionalMoves: 1,
        maxMandatoryMoves: 0,
        requiresAction: true,
    },
    [TilePlayOptionType.ONE_MANDATORY]: {
        optionType: TilePlayOptionType.ONE_MANDATORY,
        description: 'Execute one Mandatory move (ADVANCE, WITHDRAW, or ORGANIZE)',
        allowedMoveTypes: [
            DefinedMoveType.ADVANCE,
            DefinedMoveType.WITHDRAW,
            DefinedMoveType.ORGANIZE,
        ],
        maxOptionalMoves: 0,
        maxMandatoryMoves: 1,
        requiresAction: true,
    },
    [TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY]: {
        optionType: TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY,
        description: 'Execute one Optional move AND one Mandatory move in any order',
        allowedMoveTypes: [
            DefinedMoveType.REMOVE,
            DefinedMoveType.INFLUENCE,
            DefinedMoveType.ASSIST,
            DefinedMoveType.ADVANCE,
            DefinedMoveType.WITHDRAW,
            DefinedMoveType.ORGANIZE,
        ],
        maxOptionalMoves: 1,
        maxMandatoryMoves: 1,
        requiresAction: true,
    },
};

/**
 * Complete mapping of all tile IDs to their movement requirements.
 *
 * Tiles are identified by their SVG filenames (01.svg through 24.svg) plus the Blank tile.
 * Each tile specifies the exact moves that MUST be executed by the receiving player.
 */
export const TILE_REQUIREMENTS: { [tileId: string]: TileRequirement } = {
    // Tiles 01-02: Require Remove (O) and Advance (M)
    '01': {
        tileId: '01',
        requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
        description: '(O) Remove and (M) Advance',
        canBeRejected: false,
    },
    '02': {
        tileId: '02',
        requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ADVANCE],
        description: '(O) Remove and (M) Advance',
        canBeRejected: false,
    },

    // Tiles 03-04: Require Influence (O) and Advance (M)
    '03': {
        tileId: '03',
        requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
        description: '(O) Influence and (M) Advance',
        canBeRejected: false,
    },
    '04': {
        tileId: '04',
        requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.ADVANCE],
        description: '(O) Influence and (M) Advance',
        canBeRejected: false,
    },

    // Tiles 05-06: Require only Advance (M)
    '05': {
        tileId: '05',
        requiredMoves: [DefinedMoveType.ADVANCE],
        description: '(M) Advance',
        canBeRejected: false,
    },
    '06': {
        tileId: '06',
        requiredMoves: [DefinedMoveType.ADVANCE],
        description: '(M) Advance',
        canBeRejected: false,
    },

    // Tiles 07-08: Require Assist (O) and Advance (M)
    '07': {
        tileId: '07',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
        description: '(O) Assist and (M) Advance',
        canBeRejected: false,
    },
    '08': {
        tileId: '08',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ADVANCE],
        description: '(O) Assist and (M) Advance',
        canBeRejected: false,
    },

    // Tiles 09-10: Require Remove (O) and Organize (M)
    '09': {
        tileId: '09',
        requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
        description: '(O) Remove and (M) Organize',
        canBeRejected: false,
    },
    '10': {
        tileId: '10',
        requiredMoves: [DefinedMoveType.REMOVE, DefinedMoveType.ORGANIZE],
        description: '(O) Remove and (M) Organize',
        canBeRejected: false,
    },

    // Tile 11: Require only Influence (O)
    '11': {
        tileId: '11',
        requiredMoves: [DefinedMoveType.INFLUENCE],
        description: '(O) Influence',
        canBeRejected: false,
    },

    // Tile 12: Require only Organize (M)
    '12': {
        tileId: '12',
        requiredMoves: [DefinedMoveType.ORGANIZE],
        description: '(M) Organize',
        canBeRejected: false,
    },

    // Tiles 13-14: Require Assist (O) and Organize (M)
    '13': {
        tileId: '13',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
        description: '(O) Assist and (M) Organize',
        canBeRejected: false,
    },
    '14': {
        tileId: '14',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.ORGANIZE],
        description: '(O) Assist and (M) Organize',
        canBeRejected: false,
    },

    // Tiles 15-16: Require only Remove (O)
    '15': {
        tileId: '15',
        requiredMoves: [DefinedMoveType.REMOVE],
        description: '(O) Remove',
        canBeRejected: false,
    },
    '16': {
        tileId: '16',
        requiredMoves: [DefinedMoveType.REMOVE],
        description: '(O) Remove',
        canBeRejected: false,
    },

    // Tiles 17-18: Require Influence (O) and Withdraw (M)
    '17': {
        tileId: '17',
        requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
        description: '(O) Influence and (M) Withdraw',
        canBeRejected: false,
    },
    '18': {
        tileId: '18',
        requiredMoves: [DefinedMoveType.INFLUENCE, DefinedMoveType.WITHDRAW],
        description: '(O) Influence and (M) Withdraw',
        canBeRejected: false,
    },

    // Tiles 19-21: Require only Withdraw (M)
    '19': {
        tileId: '19',
        requiredMoves: [DefinedMoveType.WITHDRAW],
        description: '(M) Withdraw',
        canBeRejected: false,
    },
    '20': {
        tileId: '20',
        requiredMoves: [DefinedMoveType.WITHDRAW],
        description: '(M) Withdraw',
        canBeRejected: false,
    },
    '21': {
        tileId: '21',
        requiredMoves: [DefinedMoveType.WITHDRAW],
        description: '(M) Withdraw',
        canBeRejected: false,
    },

    // Tiles 22-24: Require Assist (O) and Withdraw (M)
    '22': {
        tileId: '22',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
        description: '(O) Assist and (M) Withdraw',
        canBeRejected: false,
    },
    '23': {
        tileId: '23',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
        description: '(O) Assist and (M) Withdraw',
        canBeRejected: false,
    },
    '24': {
        tileId: '24',
        requiredMoves: [DefinedMoveType.ASSIST, DefinedMoveType.WITHDRAW],
        description: '(O) Assist and (M) Withdraw',
        canBeRejected: false,
    },

    // Blank tile (5-player mode only) - wild tile
    'BLANK': {
        tileId: 'BLANK',
        requiredMoves: [],
        description: 'Blank - Wild tile. The player may perform one "O" move and/or one "M" move, or no move at all.',
        canBeRejected: true, // Can be rejected if moves don't match allowed patterns
    },
};


export const PLAYER_PERSPECTIVE_ROTATIONS: { [playerCount: number]: { [playerId: number]: number } } = {
    3: { 1: -120, 2: 120, 3: 0 },
    4: { 1: -135, 2: 135, 3: 45, 4: -45 },
    // Recalculated based on the geometric center of each player's actual seat coordinates.
    5: { 1: -71, 2: -140, 3: 145, 4: 75, 5: 0 },
};

const THREE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
    { ownerId: 1, position: { left: 15.30, top: 44.76 }, rotation: 168.0 },
    { ownerId: 2, position: { left: 75.42, top: 15.71 }, rotation: 288.0 },
    { ownerId: 3, position: { left: 68.51, top: 75.24 }, rotation: 48.0 },
];

const FOUR_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
    { ownerId: 1, position: { left: 10.57, top: 52.44 }, rotation: 157.0 },
    { ownerId: 2, position: { left: 48.91, top: 13.18 }, rotation: 247.0 },
    { ownerId: 3, position: { left: 89.11, top: 48.14 }, rotation: 337.0 },
    { ownerId: 4, position: { left: 52.34, top: 88.09 }, rotation: 67.0 },
];

const FIVE_PLAYER_TILE_SPACES: TileReceivingSpace[] = [
    { ownerId: 1, position: { left: 14.64, top: 72.07 }, rotation: 93.0 },
    { ownerId: 2, position: { left: 11.93, top: 25.49 }, rotation: 165.0 },
    { ownerId: 3, position: { left: 58.59, top: 8.50 }, rotation: 237.0 },
    { ownerId: 4, position: { left: 89.53, top: 44.43 }, rotation: 309.0 },
    { ownerId: 5, position: { left: 63.07, top: 83.98 }, rotation: 21.0 },
];

export const TILE_SPACES_BY_PLAYER_COUNT: { [key: number]: TileReceivingSpace[] } = {
    3: THREE_PLAYER_TILE_SPACES,
    4: FOUR_PLAYER_TILE_SPACES,
    5: FIVE_PLAYER_TILE_SPACES,
};

// Bank spaces for storing received tiles
const THREE_PLAYER_BANK_SPACES: BankSpace[] = [
    // Player 1
    { ownerId: 1, position: { left: 42.11, top: 16.04 }, rotation: 181.00 },
    { ownerId: 1, position: { left: 37.11, top: 16.04 }, rotation: 181.00 },
    { ownerId: 1, position: { left: 32.61, top: 16.04 }, rotation: 181.00 },
    { ownerId: 1, position: { left: 28.11, top: 16.04 }, rotation: 181.00 },
    { ownerId: 1, position: { left: 21.61, top: 22.54 }, rotation: 90.00 },
    { ownerId: 1, position: { left: 21.61, top: 27.04 }, rotation: 90.00 },
    { ownerId: 1, position: { left: 21.61, top: 31.54 }, rotation: 90.00 },
    { ownerId: 1, position: { left: 21.61, top: 36.04 }, rotation: 90.00 },
    // Player 2
    { ownerId: 2, position: { left: 79.70, top: 50.48 }, rotation: 300.00 },
    { ownerId: 2, position: { left: 82.20, top: 46.48 }, rotation: 300.00 },
    { ownerId: 2, position: { left: 84.20, top: 42.48 }, rotation: 300.00 },
    { ownerId: 2, position: { left: 87.20, top: 38.98 }, rotation: 300.00 },
    { ownerId: 2, position: { left: 84.12, top: 30.24 }, rotation: 211.00 },
    { ownerId: 2, position: { left: 80.12, top: 27.74 }, rotation: 211.00 },
    { ownerId: 2, position: { left: 76.12, top: 25.24 }, rotation: 211.00 },
    { ownerId: 2, position: { left: 72.62, top: 23.24 }, rotation: 211.00 },
    // Player 3
    { ownerId: 3, position: { left: 30.70, top: 65.75 }, rotation: 60.00 },
    { ownerId: 3, position: { left: 33.20, top: 70.25 }, rotation: 60.00 },
    { ownerId: 3, position: { left: 35.20, top: 74.25 }, rotation: 60.00 },
    { ownerId: 3, position: { left: 37.20, top: 77.75 }, rotation: 60.00 },
    { ownerId: 3, position: { left: 46.07, top: 80.82 }, rotation: 330.00 },
    { ownerId: 3, position: { left: 50.07, top: 77.82 }, rotation: 330.00 },
    { ownerId: 3, position: { left: 54.04, top: 75.88 }, rotation: 330.00 },
    { ownerId: 3, position: { left: 58.04, top: 73.38 }, rotation: 330.00 },
];

const FOUR_PLAYER_BANK_SPACES: BankSpace[] = [
    // Player 1
    { ownerId: 1, position: { left: 31.76, top: 21.38 }, rotation: 141.00 },
    { ownerId: 1, position: { left: 27.93, top: 24.30 }, rotation: 141.00 },
    { ownerId: 1, position: { left: 24.22, top: 27.45 }, rotation: 141.00 },
    { ownerId: 1, position: { left: 20.72, top: 29.95 }, rotation: 141.00 },
    { ownerId: 1, position: { left: 17.22, top: 32.45 }, rotation: 141.00 },
    { ownerId: 1, position: { left: 13.72, top: 35.45 }, rotation: 141.00 },
    // Player 2
    { ownerId: 2, position: { left: 81.72, top: 33.79 }, rotation: 231.00 },
    { ownerId: 2, position: { left: 78.18, top: 30.18 }, rotation: 231.00 },
    { ownerId: 2, position: { left: 75.68, top: 26.68 }, rotation: 231.00 },
    { ownerId: 2, position: { left: 72.68, top: 23.68 }, rotation: 231.00 },
    { ownerId: 2, position: { left: 69.68, top: 20.18 }, rotation: 231.00 },
    { ownerId: 2, position: { left: 67.18, top: 16.68 }, rotation: 231.00 },
    // Player 3
    { ownerId: 3, position: { left: 68.39, top: 80.76 }, rotation: 321.00 },
    { ownerId: 3, position: { left: 72.26, top: 77.63 }, rotation: 321.00 },
    { ownerId: 3, position: { left: 76.07, top: 74.79 }, rotation: 321.00 },
    { ownerId: 3, position: { left: 79.01, top: 72.17 }, rotation: 321.00 },
    { ownerId: 3, position: { left: 82.95, top: 69.64 }, rotation: 321.00 },
    { ownerId: 3, position: { left: 86.51, top: 66.77 }, rotation: 321.00 },
    // Player 4
    { ownerId: 4, position: { left: 18.80, top: 67.97 }, rotation: 52.00 },
    { ownerId: 4, position: { left: 21.64, top: 71.57 }, rotation: 51.00 },
    { ownerId: 4, position: { left: 24.53, top: 75.11 }, rotation: 51.00 },
    { ownerId: 4, position: { left: 27.47, top: 78.52 }, rotation: 51.00 },
    { ownerId: 4, position: { left: 30.24, top: 81.93 }, rotation: 51.00 },
    { ownerId: 4, position: { left: 33.20, top: 85.06 }, rotation: 51.00 },
];

const FIVE_PLAYER_BANK_SPACES: BankSpace[] = [
    // Player 1
    { ownerId: 1, position: { left: 7.86, top: 51.17 }, rotation: 49.00 },
    { ownerId: 1, position: { left: 10.86, top: 54.17 }, rotation: 49.00 },
    { ownerId: 1, position: { left: 12.86, top: 56.67 }, rotation: 49.00 },
    { ownerId: 1, position: { left: 15.86, top: 59.67 }, rotation: 49.00 },
    { ownerId: 1, position: { left: 18.86, top: 62.67 }, rotation: 49.00 },
    // Player 2
    { ownerId: 2, position: { left: 31.05, top: 12.46 }, rotation: 119.00 },
    { ownerId: 2, position: { left: 29.05, top: 16.46 }, rotation: 119.00 },
    { ownerId: 2, position: { left: 27.03, top: 19.24 }, rotation: 119.00 },
    { ownerId: 2, position: { left: 24.97, top: 22.75 }, rotation: 119.00 },
    { ownerId: 2, position: { left: 22.97, top: 25.75 }, rotation: 119.00 },
    // Player 3
    { ownerId: 3, position: { left: 77.86, top: 21.19 }, rotation: 193.00 },
    { ownerId: 3, position: { left: 73.59, top: 20.51 }, rotation: 193.00 },
    { ownerId: 3, position: { left: 69.64, top: 19.93 }, rotation: 193.00 },
    { ownerId: 3, position: { left: 65.68, top: 18.85 }, rotation: 193.00 },
    { ownerId: 3, position: { left: 61.84, top: 18.05 }, rotation: 193.00 },
    // Player 4
    { ownerId: 4, position: { left: 82.82, top: 65.82 }, rotation: 265.00 },
    { ownerId: 4, position: { left: 82.34, top: 62.01 }, rotation: 265.00 },
    { ownerId: 4, position: { left: 82.11, top: 58.21 }, rotation: 265.00 },
    { ownerId: 4, position: { left: 81.61, top: 54.79 }, rotation: 265.00 },
    { ownerId: 4, position: { left: 81.32, top: 51.07 }, rotation: 265.00 },
    // Player 5
    { ownerId: 5, position: { left: 39.82, top: 84.18 }, rotation: 335.00 },
    { ownerId: 5, position: { left: 43.20, top: 82.71 }, rotation: 335.00 },
    { ownerId: 5, position: { left: 47.14, top: 81.15 }, rotation: 335.00 },
    { ownerId: 5, position: { left: 50.47, top: 79.99 }, rotation: 335.00 },
    { ownerId: 5, position: { left: 54.43, top: 78.31 }, rotation: 335.00 },
];

export const BANK_SPACES_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
    3: THREE_PLAYER_BANK_SPACES,
    4: FOUR_PLAYER_BANK_SPACES,
    5: FIVE_PLAYER_BANK_SPACES,
};

// Credibility locations - one per player to display credibility currency
const THREE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
    // Player 1: 21.18/15.35, rotation: -35.0°
    { ownerId: 1, position: { left: 21.18, top: 15.35 }, rotation: -35.00 },
    // Player 2: 90.30/33.16, rotation: 75.0°
    { ownerId: 2, position: { left: 90.30, top: 33.16 }, rotation: 75.00 },
    // Player 3: 40.45/83.68, rotation: 200.0°
    { ownerId: 3, position: { left: 40.45, top: 83.68 }, rotation: 200.00 },
];

const FOUR_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
    // Player 1: 15.97/20.64, rotation: -34.0°
    { ownerId: 1, position: { left: 15.97, top: 20.64 }, rotation: -34.00 },
    // Player 2: 82.95/18.65, rotation: 51.0°
    { ownerId: 2, position: { left: 82.95, top: 18.65 }, rotation: 51.00 },
    // Player 3: 84.62/82.16, rotation: 136.0°
    { ownerId: 3, position: { left: 84.62, top: 82.16 }, rotation: 136.00 },
    // Player 4: 17.53/83.04, rotation: -129.0°
    { ownerId: 4, position: { left: 17.53, top: 83.04 }, rotation: -129.00 },
];

const FIVE_PLAYER_CREDIBILITY_LOCATIONS: BankSpace[] = [
    // Player 1: 8.11/63.80, rotation: 224.0°
    { ownerId: 1, position: { left: 8.11, top: 63.80 }, rotation: 224.00 },
    // Player 2: 18.06/16.34, rotation: -45.0°
    { ownerId: 2, position: { left: 18.06, top: 16.34 }, rotation: -45.00 },
    // Player 3: 69.62/11.07, rotation: 15.0°
    { ownerId: 3, position: { left: 69.62, top: 11.07 }, rotation: 15.00 },
    // Player 4: 91.28/55.40, rotation: 74.0°
    { ownerId: 4, position: { left: 91.28, top: 55.40 }, rotation: 74.00 },
    // Player 5: 52.95/88.41, rotation: 164.0°
    { ownerId: 5, position: { left: 52.95, top: 88.41 }, rotation: 164.00 },
];

export const CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT: { [key: number]: BankSpace[] } = {
    3: THREE_PLAYER_CREDIBILITY_LOCATIONS,
    4: FOUR_PLAYER_CREDIBILITY_LOCATIONS,
    5: FIVE_PLAYER_CREDIBILITY_LOCATIONS,
};

export const PIECE_TYPES: { [key: string]: GamePieceInfo } = {
    MARK: { name: 'Mark', imageUrl: './images/mark-transparent_bg.png' },
    HEEL: { name: 'Heel', imageUrl: './images/heel-transparent_bg.png' },
    PAWN: { name: 'Pawn', imageUrl: './images/pawn-transparent_bg.png' },
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
        MARK: 15,
        HEEL: 13,
        PAWN: 4,
    },
    5: {
        MARK: 18,
        HEEL: 17,
        PAWN: 5,
    },
};


// --- Game Constants ---

export const PLAYER_OPTIONS = [3, 4, 5];

export const BOARD_IMAGE_URLS: { [key: number]: string } = {
    3: './images/3player_board.jpg',
    4: './images/4player_board.jpg',
    5: './images/5player_board.jpg',
};

const TOTAL_TILES = 24;
export const TILE_IMAGE_URLS = Array.from({ length: TOTAL_TILES }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `./images/${num}.svg`;
});

// Kredcoin values for each tile (₭-)
export const TILE_KREDCOIN_VALUES: { [key: number]: number } = {
    1: 1,
    2: 2,
    3: 0,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 1,
    10: 2,
    11: 4,
    12: 5,
    13: 5,
    14: 6,
    15: 3,
    16: 4,
    17: 3,
    18: 4,
    19: 6,
    20: 7,
    21: 8,
    22: 7,
    23: 8,
    24: 9,
    // Blank tile (if needed) = 0
};

// Bureaucracy menu for 3 and 4 player modes
export const THREE_FOUR_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
    {
        id: 'promote_office',
        type: 'PROMOTION',
        promotionLocation: 'OFFICE',
        price: 18,
        description: 'Promote a piece in the Office from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'move_assist',
        type: 'MOVE',
        moveType: 'ASSIST',
        price: 15,
        description: ''
    },
    {
        id: 'move_remove',
        type: 'MOVE',
        moveType: 'REMOVE',
        price: 15,
        description: ''
    },
    {
        id: 'move_influence',
        type: 'MOVE',
        moveType: 'INFLUENCE',
        price: 15,
        description: ''
    },
    {
        id: 'promote_rostrum',
        type: 'PROMOTION',
        promotionLocation: 'ROSTRUM',
        price: 12,
        description: 'Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'move_advance',
        type: 'MOVE',
        moveType: 'ADVANCE',
        price: 9,
        description: ''
    },
    {
        id: 'move_withdraw',
        type: 'MOVE',
        moveType: 'WITHDRAW',
        price: 9,
        description: ''
    },
    {
        id: 'move_organize',
        type: 'MOVE',
        moveType: 'ORGANIZE',
        price: 9,
        description: ''
    },
    {
        id: 'promote_seat',
        type: 'PROMOTION',
        promotionLocation: 'SEAT',
        price: 6,
        description: 'Promote a piece in a Seat from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'credibility',
        type: 'CREDIBILITY',
        price: 3,
        description: 'Restore one notch to your Credibility'
    }
];

// Bureaucracy menu for 5 player mode
export const FIVE_PLAYER_BUREAUCRACY_MENU: BureaucracyMenuItem[] = [
    {
        id: 'promote_office',
        type: 'PROMOTION',
        promotionLocation: 'OFFICE',
        price: 12,
        description: 'Promote a piece in the Office from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'move_assist',
        type: 'MOVE',
        moveType: 'ASSIST',
        price: 10,
        description: ''
    },
    {
        id: 'move_remove',
        type: 'MOVE',
        moveType: 'REMOVE',
        price: 10,
        description: ''
    },
    {
        id: 'move_influence',
        type: 'MOVE',
        moveType: 'INFLUENCE',
        price: 10,
        description: ''
    },
    {
        id: 'promote_rostrum',
        type: 'PROMOTION',
        promotionLocation: 'ROSTRUM',
        price: 8,
        description: 'Promote a piece in a Rostrum from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'move_advance',
        type: 'MOVE',
        moveType: 'ADVANCE',
        price: 6,
        description: ''
    },
    {
        id: 'move_withdraw',
        type: 'MOVE',
        moveType: 'WITHDRAW',
        price: 6,
        description: ''
    },
    {
        id: 'move_organize',
        type: 'MOVE',
        moveType: 'ORGANIZE',
        price: 6,
        description: ''
    },
    {
        id: 'promote_seat',
        type: 'PROMOTION',
        promotionLocation: 'SEAT',
        price: 4,
        description: 'Promote a piece in a Seat from Mark to Heel OR Heel to Pawn'
    },
    {
        id: 'credibility',
        type: 'CREDIBILITY',
        price: 2,
        description: 'Restore one notch to your Credibility'
    }
];


export const BOARD_CENTERS: { [playerCount: number]: { left: number; top: number } } = {
    3: { left: 50.44, top: 44.01 },
    4: { left: 49.94, top: 51.56 },
    5: { left: 47.97, top: 47.07 },
};

// ============================================================================
// TIMEOUT VALUES (in milliseconds)
// ============================================================================

export const TIMEOUTS = {
    /** Auto-dismiss challenge result message */
    CHALLENGE_MESSAGE_DISMISS: 5000,

    /** Bureaucracy transition message display */
    BUREAUCRACY_TRANSITION: 3000,

    /** Validation error message auto-clear */
    VALIDATION_ERROR_SHORT: 3000,

    /** Validation error message auto-clear (longer) */
    VALIDATION_ERROR_LONG: 4000,
} as const;

// ============================================================================
// ALERT MESSAGES
// ============================================================================

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

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
    /** Default credibility value for players */
    INITIAL_CREDIBILITY: 3,

    /** Maximum credibility a player can have */
    MAX_CREDIBILITY: 3,

    /** Minimum credibility (cannot go below 0) */
    MIN_CREDIBILITY: 0,
} as const;

// ============================================================================
// GAME LOG MESSAGES
// ============================================================================

export const GAME_LOGS = {
    NO_TILES_FOR_TAKE_ADVANTAGE: (playerName: string) =>
        `${playerName} has no tiles for Take Advantage - skipping reward`,

    TAKE_ADVANTAGE_SKIPPED_NO_TILES: (playerName: string) =>
        `${playerName} has no tiles for Take Advantage - skipping reward`,
} as const;
