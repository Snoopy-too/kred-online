// Database persistence layer for game state
import mysql from 'mysql2/promise';
import type { GameRoomState, PlayerConnection } from './types';

export class DatabasePersistence {
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.pool = pool;
  }

  /**
   * Save complete game room state to database
   */
  async saveGameRoom(state: GameRoomState): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update or insert game room
      await connection.execute(
        `INSERT INTO game_rooms (id, status, player_count, current_phase, created_at, last_update)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         current_phase = VALUES(current_phase),
         last_update = VALUES(last_update)`,
        [
          state.roomId,
          state.status,
          state.playerCount,
          state.gameState,
          state.createdAt,
          state.lastUpdate,
        ]
      );

      // Update or insert game state (JSON blobs)
      await connection.execute(
        `INSERT INTO game_state (room_id, pieces, board_tiles, played_tile, challenge_state, 
         take_advantage_state, bureaucracy_state, player_hands, player_kept_tiles, 
         player_bureaucracy_tiles, current_player_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         pieces = VALUES(pieces),
         board_tiles = VALUES(board_tiles),
         played_tile = VALUES(played_tile),
         challenge_state = VALUES(challenge_state),
         take_advantage_state = VALUES(take_advantage_state),
         bureaucracy_state = VALUES(bureaucracy_state),
         player_hands = VALUES(player_hands),
         player_kept_tiles = VALUES(player_kept_tiles),
         player_bureaucracy_tiles = VALUES(player_bureaucracy_tiles),
         current_player_index = VALUES(current_player_index)`,
        [
          state.roomId,
          JSON.stringify(state.pieces),
          JSON.stringify(state.boardTiles),
          JSON.stringify(state.playedTile),
          JSON.stringify(state.challengeFlow),
          JSON.stringify(state.takeAdvantage),
          JSON.stringify(state.bureaucracy),
          JSON.stringify(state.players.map((p) => p.hand)),
          JSON.stringify(state.players.map((p) => p.keptTiles)),
          JSON.stringify(state.players.map((p) => p.bureaucracyTiles)),
          state.currentPlayerIndex,
        ]
      );

      // Update players
      for (const player of state.players) {
        await connection.execute(
          `UPDATE game_players
           SET credibility = ?
           WHERE room_id = ? AND player_index = ?`,
          [player.credibility, state.roomId, player.id]
        );
      }

      // Update player connections
      for (const conn of state.connections) {
        await connection.execute(
          `UPDATE game_players
           SET connected = ?, last_seen = ?
           WHERE room_id = ? AND player_id = ?`,
          [conn.connected, conn.lastSeen, state.roomId, conn.playerId]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Save game action to history
   */
  async saveGameAction(roomId: string, sequence: number, type: string, playerId: string | null, data: any): Promise<void> {
    await this.pool.execute(
      `INSERT INTO game_history (room_id, sequence, action_type, player_id, action_data)
       VALUES (?, ?, ?, ?, ?)`,
      [roomId, sequence, type, playerId, JSON.stringify(data)]
    );
  }

  /**
   * Load game room state from database
   */
  async loadGameRoom(roomId: string): Promise<GameRoomState | null> {
    const connection = await this.pool.getConnection();
    try {
      // Load room metadata
      const [roomRows] = await connection.execute<any[]>(
        'SELECT * FROM game_rooms WHERE id = ?',
        [roomId]
      );

      if (roomRows.length === 0) {
        return null;
      }

      const room = roomRows[0];

      // Load game state
      const [stateRows] = await connection.execute<any[]>(
        'SELECT * FROM game_state WHERE room_id = ?',
        [roomId]
      );

      if (stateRows.length === 0) {
        return null;
      }

      const gameState = stateRows[0];

      // Load players
      const [playerRows] = await connection.execute<any[]>(
        'SELECT * FROM game_players WHERE room_id = ? ORDER BY player_index',
        [roomId]
      );

      const playerHands = JSON.parse(gameState.player_hands);
      const playerKeptTiles = JSON.parse(gameState.player_kept_tiles);
      const playerBureaucracyTiles = JSON.parse(gameState.player_bureaucracy_tiles);

      const players = playerRows.map((p: any, index: number) => ({
        id: p.player_index,
        name: p.name,
        hand: playerHands[index] || [],
        keptTiles: playerKeptTiles[index] || [],
        bureaucracyTiles: playerBureaucracyTiles[index] || [],
        credibility: p.credibility,
      }));

      const connections: PlayerConnection[] = playerRows.map((p: any) => ({
        playerId: p.player_id,
        playerIndex: p.player_index,
        socketId: '', // Will be updated on reconnection
        name: p.name,
        connected: p.connected === 1,
        lastSeen: new Date(p.last_seen),
      }));

      // Load move history
      const [historyRows] = await connection.execute<any[]>(
        'SELECT * FROM game_history WHERE room_id = ? ORDER BY sequence',
        [roomId]
      );

      const moveHistory = historyRows.map((h: any) => ({
        sequence: h.sequence,
        type: h.action_type,
        playerId: h.player_id,
        data: JSON.parse(h.action_data),
        timestamp: new Date(h.timestamp),
      }));

      const state: GameRoomState = {
        roomId: room.id,
        status: room.status,
        playerCount: room.player_count,
        createdAt: new Date(room.created_at),
        lastUpdate: new Date(room.last_update),
        gameState: room.current_phase,
        players,
        pieces: JSON.parse(gameState.pieces),
        boardTiles: JSON.parse(gameState.board_tiles),
        currentPlayerIndex: gameState.current_player_index,
        playedTile: JSON.parse(gameState.played_tile),
        challengeFlow: JSON.parse(gameState.challenge_state),
        takeAdvantage: JSON.parse(gameState.take_advantage_state),
        bureaucracy: JSON.parse(gameState.bureaucracy_state),
        moveHistory,
        connections,
        spectators: [],
      };

      return state;
    } finally {
      connection.release();
    }
  }

  /**
   * Save player connection
   */
  async savePlayerConnection(roomId: string, connection: PlayerConnection, sessionToken: string): Promise<void> {
    await this.pool.execute(
      `INSERT INTO game_players (room_id, player_id, player_index, name, connected, session_token)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       connected = VALUES(connected)`,
      [roomId, connection.playerId, connection.playerIndex, connection.name, connection.connected, sessionToken]
    );
  }

  /**
   * Get session by token
   */
  async getSessionByToken(sessionToken: string): Promise<{ roomId: string; playerId: string; playerIndex: number } | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT room_id, player_id, player_index FROM game_players WHERE session_token = ?',
      [sessionToken]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      roomId: row.room_id,
      playerId: row.player_id,
      playerIndex: row.player_index,
    };
  }

  /**
   * Get game replay data
   */
  async getGameReplay(roomId: string): Promise<any> {
    const [roomRows] = await this.pool.execute<any[]>(
      'SELECT * FROM game_rooms WHERE id = ?',
      [roomId]
    );

    if (roomRows.length === 0) {
      return null;
    }

    const [playerRows] = await this.pool.execute<any[]>(
      'SELECT player_index, name FROM game_players WHERE room_id = ?',
      [roomId]
    );

    const [historyRows] = await this.pool.execute<any[]>(
      'SELECT * FROM game_history WHERE room_id = ? ORDER BY sequence',
      [roomId]
    );

    return {
      roomId,
      players: playerRows.map((p: any) => ({ id: p.player_index, name: p.name })),
      history: historyRows.map((h: any) => ({
        sequence: h.sequence,
        type: h.action_type,
        playerId: h.player_id,
        data: JSON.parse(h.action_data),
        timestamp: h.timestamp,
      })),
      status: roomRows[0].status,
      createdAt: roomRows[0].created_at,
    };
  }

  /**
   * Clean up old finished games
   */
  async cleanupOldGames(daysOld: number = 7): Promise<number> {
    const [result] = await this.pool.execute<any>(
      `DELETE FROM game_rooms 
       WHERE status = 'finished' 
       AND finished_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );

    return result.affectedRows || 0;
  }
}
