
// --- Type Definitions ---

export interface Tile {
    id: number;
    url: string;
}

export interface Player {
    id: number;
    hand: Tile[];
    keptTiles: Tile[];
    bureaucracyTiles: Tile[];
    credibility: number;
}

export type GameState = 'PLAYER_SELECTION' | 'DRAFTING' | 'CAMPAIGN' | 'TILE_PLAYED' | 'PENDING_ACCEPTANCE' | 'PENDING_CHALLENGE' | 'CORRECTION_REQUIRED' | 'BUREAUCRACY';

// --- Game Piece Definitions ---

export interface GamePieceInfo {
    name: string;
    imageUrl: string;
}

// Represents a piece instance on the game board
export interface Piece {
    id: string;
    name: string;
    imageUrl: string;
    position: { top: number; left: number }; // in percentage
    rotation: number;
    locationId?: string; // ID of the drop location where this piece is placed
}

// Represents a tile instance on the game board
export interface BoardTile {
    id: string;
    tile: Tile;
    position: { top: number; left: number };
    rotation: number;
    placerId: number;
    ownerId: number; // Who owns the slot.
}

export interface DropLocation {
    id: string;
    position: { left: number; top: number };
}

export interface TileReceivingSpace {
    ownerId: number;
    position: { left: number; top: number };
    rotation: number;
    // occupiedBy?: string; // tileId
}

export interface BankSpace {
    ownerId: number;
    position: { left: number; top: number };
    rotation: number;
}

// Move tracking for undo/replay functionality
export enum DefinedMoveType {
    REMOVE = 'REMOVE',
    ADVANCE = 'ADVANCE',
    INFLUENCE = 'INFLUENCE',
    ASSIST = 'ASSIST',
    WITHDRAW = 'WITHDRAW',
    ORGANIZE = 'ORGANIZE',
}

export interface TrackedMove {
    moveType: DefinedMoveType;
    category: 'M' | 'O'; // M = My domain, O = Opponent domain
    pieceId: string;
    fromPosition: { top: number; left: number };
    fromLocationId?: string;
    toPosition: { top: number; left: number };
    toLocationId?: string;
    timestamp: number;
}

// Represents a tile that has been played but not yet fully resolved
export interface PlayedTileState {
    tileId: string;
    playerId: number; // Player who played the tile
    receivingPlayerId: number; // Player who received the tile
    playedAt: number; // Timestamp when played
    movesPerformed: TrackedMove[]; // Moves made by the player during play
    gameStateSnapshot: {
        pieces: Piece[];
        boardTiles: BoardTile[];
    };
}

// Challenge information
export interface ChallengeState {
    status: 'PENDING' | 'CHALLENGED' | 'RESOLVED';
    challengedByPlayerId?: number;
    acceptedByReceivingPlayer: boolean;
}

// Bureaucracy Phase Types
export type BureaucracyItemType = 'MOVE' | 'PROMOTION' | 'CREDIBILITY';
export type BureaucracyMoveType = 'ADVANCE' | 'WITHDRAW' | 'ORGANIZE' | 'ASSIST' | 'REMOVE' | 'INFLUENCE';
export type PromotionLocationType = 'OFFICE' | 'ROSTRUM' | 'SEAT';

export interface BureaucracyMenuItem {
    id: string;
    type: BureaucracyItemType;
    moveType?: BureaucracyMoveType;
    promotionLocation?: PromotionLocationType;
    price: number;
    description: string;
}

export interface BureaucracyPurchase {
    playerId: number;
    item: BureaucracyMenuItem;
    pieceId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    timestamp: number;
    completed: boolean;
}

export interface BureaucracyPlayerState {
    playerId: number;
    initialKredcoin: number;
    remainingKredcoin: number;
    turnComplete: boolean;
    purchases: BureaucracyPurchase[];
}

export interface RostrumSupport {
    rostrum: string; // e.g., 'p1_rostrum1'
    supportingSeats: string[]; // e.g., ['p1_seat1', 'p1_seat2', 'p1_seat3']
}

export interface PlayerRostrum {
    playerId: number;
    rostrums: RostrumSupport[];
    office: string; // e.g., 'p1_office'
}

export interface RostrumAdjacency {
    rostrum1: string;
    rostrum2: string;
}

export enum MoveRequirementType {
    MANDATORY = 'MANDATORY',
    OPTIONAL = 'OPTIONAL',
}

export interface DefinedMove {
    type: DefinedMoveType;
    category: 'M' | 'O'; // 'M' = My domain, 'O' = Opponent domain
    requirement: MoveRequirementType;
    description: string;
    options: string[];
    canTargetOwnDomain: boolean;
    canTargetOpponentDomain: boolean;
    affectsCommunity: boolean;
}

export enum TilePlayOptionType {
    NO_MOVE = 'NO_MOVE',
    ONE_OPTIONAL = 'ONE_OPTIONAL',
    ONE_MANDATORY = 'ONE_MANDATORY',
    ONE_OPTIONAL_AND_ONE_MANDATORY = 'ONE_OPTIONAL_AND_ONE_MANDATORY',
}

export interface TilePlayOption {
    optionType: TilePlayOptionType;
    description: string;
    allowedMoveTypes: DefinedMoveType[];
    maxOptionalMoves: number;
    maxMandatoryMoves: number;
    requiresAction: boolean;
}

export interface TileRequirement {
    tileId: string;
    requiredMoves: DefinedMoveType[];
    description: string;
    canBeRejected: boolean; // false = cannot be rejected if requirements met or impossible
}
