// Multiplayer game actions using socket.io
import { useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import type { Tile } from '@kred/shared';

/**
 * Hook providing multiplayer game actions
 */
export function useMultiplayerActions() {
  const { socket, connected, roomId, playerId, playerIndex } = useSocket();

  /**
   * Create a new game room
   */
  const createGame = useCallback(
    async (playerName: string, playerCount: number): Promise<any> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'game:create',
          { playerName, playerCount },
          (response: any) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  /**
   * Join an existing game room
   */
  const joinGame = useCallback(
    async (roomId: string, playerName: string): Promise<any> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'game:join',
          { roomId, playerName },
          (response: any) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  /**
   * Start the game
   */
  const startGame = useCallback(async (): Promise<void> => {
    if (!socket || !connected || !roomId) {
      throw new Error('Not connected to server or missing room');
    }

    return new Promise((resolve, reject) => {
      socket.emit('kred:game:start', { roomId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected, roomId]);

  /**
   * Select a tile during drafting
   */
  const selectDraftTile = useCallback(
    async (tileId: string): Promise<void> => {
      if (!socket || !connected) {
        console.error('[MULTIPLAYER ACTIONS] Not connected to server');
        throw new Error('Not connected to server');
      }

      if (!roomId || playerIndex === null || playerIndex === undefined) {
        console.error('[MULTIPLAYER ACTIONS] Missing roomId or playerIndex', { roomId, playerIndex });
        throw new Error('Missing room or player information');
      }

      console.log('[MULTIPLAYER ACTIONS] 🎯 Selecting tile:', { roomId, playerIndex, tileId });
      console.log('[MULTIPLAYER ACTIONS] 📡 About to emit kred:select:tile with data:', JSON.stringify({ roomId, playerIndex, tileId }));

      return new Promise((resolve, reject) => {
        socket.emit(
          'kred:select:tile',
          { roomId, playerIndex, tileId },
          (response: any) => {
            if (response.success) {
              console.log('[MULTIPLAYER ACTIONS] ✅ Tile selected successfully, phase:', response.phase);
              resolve();
            } else {
              console.error('[MULTIPLAYER ACTIONS] ❌ Tile selection failed:', response.error);
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected, roomId, playerIndex]
  );

  /**
   * Play a tile to another player
   */
  const playTile = useCallback(
    async (tileId: string, targetPlayerId: number): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      if (!roomId || playerIndex === null || playerIndex === undefined) {
        throw new Error('Missing room or player information');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'kred:campaign:playTile',
          { roomId, playerIndex, tileId, targetPlayerId },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected, roomId, playerIndex]
  );

  /**
   * Move a piece on the board
   */
  const movePiece = useCallback(
    async (
      pieces: any[],
      movedPiecesThisTurn?: any[]
    ): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      if (!roomId) {
        throw new Error('Missing room information');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'kred:campaign:movePiece',
          { roomId, pieces, movedPiecesThisTurn },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected, roomId]
  );

  /**
   * End current turn
   */
  const endTurn = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    if (!roomId) {
      throw new Error('Missing room information');
    }

    return new Promise((resolve, reject) => {
      socket.emit('kred:campaign:endTurn', { roomId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected, roomId]);

  /**
   * Accept a played tile
   */
  const acceptTile = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    if (!roomId) {
      throw new Error('Missing room information');
    }

    return new Promise((resolve, reject) => {
      socket.emit('kred:campaign:receiverDecision', { roomId, accepted: true }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected, roomId]);

  /**
   * Reject a played tile
   */
  const rejectTile = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    if (!roomId) {
      throw new Error('Missing room information');
    }

    return new Promise((resolve, reject) => {
      socket.emit('kred:campaign:receiverDecision', { roomId, accepted: false }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected, roomId]);

  /**
   * View tile privately before accepting
   */
  const viewTilePrivate = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      socket.emit('tile:viewPrivate', (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected]);

  /**
   * Initiate a challenge
   */
  const initiateChallenge = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      socket.emit('challenge:initiate', (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected]);

  /**
   * Pass on a challenge
   */
  const passChallenge = useCallback(async (): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to server');
    }

    return new Promise((resolve, reject) => {
      socket.emit('challenge:pass', (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, connected]);

  /**
   * Select tiles for Take Advantage
   */
  const selectAdvantageTiles = useCallback(
    async (tileIds: string[]): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'advantage:selectTiles',
          { tileIds },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  /**
   * Make a Take Advantage purchase
   */
  const purchaseAdvantage = useCallback(
    async (purchase: any): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'advantage:purchase',
          { purchase },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  /**
   * Make a bureaucracy purchase
   */
  const purchaseBureaucracy = useCallback(
    async (purchase: any): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'bureaucracy:purchase',
          { purchase },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  /**
   * Join as spectator
   */
  const joinAsSpectator = useCallback(
    async (roomId: string, name: string): Promise<void> => {
      if (!socket || !connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'spectator:join',
          { roomId, name },
          (response: any) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, connected]
  );

  return {
    // Connection state
    connected,
    roomId,
    playerId,

    // Game management actions
    createGame,
    joinGame,
    startGame,

    // Drafting actions
    selectDraftTile,

    // Campaign actions
    playTile,
    movePiece,
    endTurn,

    // Tile acceptance actions
    acceptTile,
    rejectTile,
    viewTilePrivate,

    // Challenge actions
    initiateChallenge,
    passChallenge,

    // Take Advantage actions
    selectAdvantageTiles,
    purchaseAdvantage,

    // Bureaucracy actions
    purchaseBureaucracy,

    // Spectator actions
    joinAsSpectator,
  };
}
