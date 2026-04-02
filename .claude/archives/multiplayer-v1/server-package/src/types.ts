// Server-side multiplayer types
import type { GameState, Player, Piece, Tile, PlayedTileState } from '@kred/shared';

/**
 * Game room status
 */
export type RoomStatus = 'waiting' | 'in_progress' | 'finished';

/**
 * Player connection state
 */
export interface PlayerConnection {
  playerId: string;
  playerIndex: number;
  socketId: string;
  name: string;
  connected: boolean;
  lastSeen: Date;
}

/**
 * Challenge flow state (consolidated from 17+ variables)
 */
export interface ChallengeFlowState {
  receiver: {
    acceptance: boolean | null;
    isPrivatelyViewing: boolean;
  };
  challengers: {
    order: number[];
    currentIndex: number;
    resultMessage: string;
  };
  tileRejected: boolean;
}

/**
 * Take Advantage state (consolidated from 10 variables)
 */
export interface TakeAdvantageState {
  isActive: boolean;
  challengerId: number | null;
  challengerCredibility: number;
  ui: {
    showInitialModal: boolean;
    showTileSelection: boolean;
    showPurchaseMenu: boolean;
    validationError: string | null;
  };
  selection: {
    selectedTiles: Tile[];
    totalKredcoin: number;
  };
  purchase: any | null; // BureaucracyPurchase type
  snapshot: Piece[];
}

/**
 * Complete game room state (server-authoritative)
 */
export interface GameRoomState {
  // Room metadata
  roomId: string;
  status: RoomStatus;
  playerCount: number;
  createdAt: Date;
  lastUpdate: Date;

  // Game state (from existing types)
  gameState: GameState;
  players: Player[];
  pieces: Piece[];
  boardTiles: any[]; // BoardTile type
  currentPlayerIndex: number;

  // Current tile play
  playedTile: PlayedTileState | null;

  // Challenge flow
  challengeFlow: ChallengeFlowState;

  // Take Advantage flow
  takeAdvantage: TakeAdvantageState;

  // Bureaucracy state
  bureaucracy: {
    isActive: boolean;
    currentPlayerIndex: number;
    playersCompleted: number[];
  };

  // Move history for replay
  moveHistory: GameAction[];

  // Player connections
  connections: PlayerConnection[];

  // Spectators
  spectators: SpectatorConnection[];
}

/**
 * Spectator connection
 */
export interface SpectatorConnection {
  socketId: string;
  name: string;
  joinedAt: Date;
}

/**
 * Game action for history/replay
 */
export interface GameAction {
  sequence: number;
  type: string;
  playerId: string | null;
  data: any;
  timestamp: Date;
}

/**
 * Socket.io event payload types
 */
export namespace SocketEvents {
  // Game management
  export interface CreateGame {
    playerName: string;
    playerCount: number;
  }

  export interface JoinGame {
    roomId: string;
    playerName: string;
  }

  export interface RejoinGame {
    roomId: string;
    sessionToken: string;
  }

  // Drafting
  export interface SelectTile {
    tileId: string;
  }

  // Campaign
  export interface PlayTile {
    tileId: string;
    targetPlayerId: number;
  }

  export interface MovePiece {
    pieceId: string;
    position: { x: number; y: number };
    location: string;
  }

  export interface EndTurn { }

  // Tile acceptance
  export interface AcceptTile { }

  export interface RejectTile { }

  export interface ViewTilePrivate { }

  // Challenge
  export interface InitiateChallenge { }

  export interface PassChallenge { }

  // Take Advantage
  export interface SelectAdvantageTiles {
    tileIds: string[];
  }

  export interface PurchaseAdvantage {
    purchase: any; // BureaucracyPurchase
  }

  // Bureaucracy
  export interface BureaucracyPurchase {
    purchase: any;
  }

  // Spectator
  export interface SpectatorJoin {
    roomId: string;
    name: string;
  }

  // Server broadcasts
  export interface StateUpdate {
    gameState: Partial<GameRoomState>;
  }

  export interface PhaseChange {
    newPhase: GameState;
    currentPlayer: number;
  }

  export interface PlayerJoined {
    playerId: string;
    playerIndex: number;
    playerName: string;
  }

  export interface PlayerDisconnected {
    playerId: string;
    playerIndex: number;
  }

  export interface TurnChanged {
    currentPlayerIndex: number;
    playerName: string;
  }

  export interface ChallengeStarted {
    challengerIndex: number;
  }

  export interface ChallengeResult {
    success: boolean;
    challengerIndex: number;
    message: string;
  }

  export interface AdvantageOffered {
    challengerId: number;
    options: string[];
  }

  export interface TileRevealed {
    tileId: string;
    playerId: number;
  }

  export interface GameEnded {
    winnerId: number;
    winnerName: string;
  }

  export interface Error {
    code: string;
    message: string;
  }
}
