// Game room manager
import { GameEngine } from './gameEngine';
import { DatabasePersistence } from './database';
import type { GameRoomState, PlayerConnection, SpectatorConnection } from './types';
import type { GameState } from '@kred/shared';
import type mysql from 'mysql2/promise';

/**
 * Manages multiple game rooms
 */
export class RoomManager {
  private rooms: Map<string, GameEngine> = new Map();
  private playerSessions: Map<string, { roomId: string; playerId: string }> = new Map();
  private db: DatabasePersistence;

  constructor(pool: mysql.Pool) {
    this.db = new DatabasePersistence(pool);
  }

  /**
   * Create a new game room
   */
  async createRoom(playerName: string, playerCount: number): Promise<{ roomId: string; playerId: string; sessionToken: string }> {
    const roomId = this.generateRoomId();
    const playerId = this.generatePlayerId();
    const sessionToken = this.generateSessionToken();

    const initialState: GameRoomState = {
      roomId,
      status: 'waiting',
      playerCount,
      createdAt: new Date(),
      lastUpdate: new Date(),
      gameState: 'PLAYER_SELECTION' as GameState,
      players: [
        {
          id: 0,
          name: playerName,
          hand: [],
          keptTiles: [],
          bureaucracyTiles: [],
          credibility: 3,
        },
      ],
      pieces: [],
      boardTiles: [],
      currentPlayerIndex: 0,
      playedTile: null,
      challengeFlow: {
        receiver: {
          acceptance: null,
          isPrivatelyViewing: false,
        },
        challengers: {
          order: [],
          currentIndex: 0,
          resultMessage: '',
        },
        tileRejected: false,
      },
      takeAdvantage: {
        isActive: false,
        challengerId: null,
        challengerCredibility: 0,
        ui: {
          showInitialModal: false,
          showTileSelection: false,
          showPurchaseMenu: false,
          validationError: null,
        },
        selection: {
          selectedTiles: [],
          totalKredcoin: 0,
        },
        purchase: null,
        snapshot: [],
      },
      bureaucracy: {
        isActive: false,
        currentPlayerIndex: 0,
        playersCompleted: [],
      },
      moveHistory: [],
      connections: [
        {
          playerId,
          playerIndex: 0,
          socketId: '',
          name: playerName,
          connected: true,
          lastSeen: new Date(),
        },
      ],
      spectators: [],
    };

    const engine = new GameEngine(initialState);
    this.rooms.set(roomId, engine);
    this.playerSessions.set(sessionToken, { roomId, playerId });

    // Save to database
    await this.db.saveGameRoom(initialState);
    await this.db.savePlayerConnection(roomId, initialState.connections[0], sessionToken);

    return { roomId, playerId, sessionToken };
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomId: string, playerName: string): Promise<{ playerId: string; playerIndex: number; sessionToken: string } | null> {
    const engine = this.rooms.get(roomId);
    if (!engine) {
      return null;
    }

    const state = engine.getState();
    
    if (state.status !== 'waiting') {
      return null; // Game already started
    }

    if (state.players.length >= state.playerCount) {
      return null; // Room full
    }

    const playerId = this.generatePlayerId();
    const sessionToken = this.generateSessionToken();
    const playerIndex = state.players.length;

    this.playerSessions.set(sessionToken, { roomId, playerId });

    // Save player connection to database
    const connection: PlayerConnection = {
      playerId,
      playerIndex,
      socketId: '',
      name: playerName,
      connected: true,
      lastSeen: new Date(),
    };
    await this.db.savePlayerConnection(roomId, connection, sessionToken);

    return { playerId, playerIndex, sessionToken };
  }

  /**
   * Rejoin a room after disconnection
   */
  async rejoinRoom(roomId: string, sessionToken: string): Promise<{ playerId: string; playerIndex: number } | null> {
    const session = await this.db.getSessionByToken(sessionToken);
    if (!session || session.roomId !== roomId) {
      return null;
    }

    const engine = this.rooms.get(roomId);
    if (!engine) {
      return null;
    }

    const state = engine.getState();
    const connection = state.connections.find((c) => c.playerId === session.playerId);
    
    if (!connection) {
      return null;
    }

    return {
      playerId: session.playerId,
      playerIndex: connection.playerIndex,
    };
  }

  /**
   * Get game engine for a room
   */
  getRoom(roomId: string): GameEngine | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get room state
   */
  getRoomState(roomId: string): GameRoomState | null {
    const engine = this.rooms.get(roomId);
    return engine ? engine.getState() : null;
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
    // Clean up sessions
    for (const [token, session] of this.playerSessions.entries()) {
      if (session.roomId === roomId) {
        this.playerSessions.delete(token);
      }
    }
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(): Array<{ roomId: string; playerCount: number; currentPlayers: number; status: string }> {
    const rooms = [];
    for (const [roomId, engine] of this.rooms.entries()) {
      const state = engine.getState();
      rooms.push({
        roomId,
        playerCount: state.playerCount,
        currentPlayers: state.players.length,
        status: state.status,
      });
    }
    return rooms;
  }

  // Helper methods
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionToken(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}
