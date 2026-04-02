// Server-side game engine with state machine
import type { GameState, Piece, Player } from '@kred/shared';
import {
  areAllTileRequirementsMet,
  getTileRequirements,
  checkPlayerWinCondition,
  getChallengeOrder,
} from '@kred/shared';
import type { GameRoomState, GameAction } from './types';

/**
 * Game action types for the state machine
 */
export type GameActionType =
  // Game setup
  | 'GAME_CREATED'
  | 'PLAYER_JOINED'
  | 'GAME_STARTED'

  // Drafting phase
  | 'DRAFT_TILE_SELECTED'
  | 'DRAFT_ROUND_COMPLETED'
  | 'DRAFTING_COMPLETED'

  // Campaign phase
  | 'TILE_PLAYED'
  | 'PIECE_MOVED'
  | 'TURN_ENDED'
  | 'TILE_ACCEPTED'
  | 'TILE_REJECTED'
  | 'TILE_VIEWED_PRIVATE'

  // Challenge phase
  | 'CHALLENGE_INITIATED'
  | 'CHALLENGE_PASSED'
  | 'CHALLENGE_RESULT'
  | 'TAKE_ADVANTAGE_OFFERED'
  | 'TAKE_ADVANTAGE_DECLINED'
  | 'TAKE_ADVANTAGE_TILES_SELECTED'
  | 'TAKE_ADVANTAGE_PURCHASE_SELECTED'
  | 'TAKE_ADVANTAGE_COMPLETED'
  | 'CORRECTION_STARTED'
  | 'CORRECTION_COMPLETED'
  | 'TILE_FINALIZED'

  // Bureaucracy phase
  | 'BUREAUCRACY_STARTED'
  | 'BUREAUCRACY_PURCHASE'
  | 'BUREAUCRACY_PLAYER_COMPLETED'
  | 'BUREAUCRACY_COMPLETED'

  // Game end
  | 'GAME_WON'
  | 'GAME_ENDED'

  // Connection management
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_RECONNECTED'
  | 'SPECTATOR_JOINED'
  | 'SPECTATOR_LEFT';

/**
 * Action payload for state machine
 */
export interface GameStateAction {
  type: GameActionType;
  playerId?: string;
  data?: any;
  timestamp: Date;
}

/**
 * Game engine class managing server-authoritative game state
 */
export class GameEngine {
  private state: GameRoomState;
  private actionSequence: number = 0;

  constructor(initialState: GameRoomState) {
    this.state = initialState;
  }

  /**
   * Get current game state (immutable)
   */
  getState(): Readonly<GameRoomState> {
    return this.state;
  }

  /**
   * Dispatch an action to update game state
   */
  dispatch(action: GameStateAction): GameRoomState {
    // Record action in history
    const historyAction: GameAction = {
      sequence: ++this.actionSequence,
      type: action.type,
      playerId: action.playerId || null,
      data: action.data,
      timestamp: action.timestamp,
    };

    // Create new state based on action type
    const newState = this.reducer(this.state, action);

    // Add action to history
    newState.moveHistory.push(historyAction);
    newState.lastUpdate = action.timestamp;

    this.state = newState;
    return this.state;
  }

  /**
   * Main reducer function - handles all state transitions
   */
  private reducer(state: GameRoomState, action: GameStateAction): GameRoomState {
    switch (action.type) {
      case 'GAME_CREATED':
        return this.handleGameCreated(state, action);

      case 'PLAYER_JOINED':
        return this.handlePlayerJoined(state, action);

      case 'GAME_STARTED':
        return this.handleGameStarted(state, action);

      case 'DRAFT_TILE_SELECTED':
        return this.handleDraftTileSelected(state, action);

      case 'DRAFTING_COMPLETED':
        return this.handleDraftingCompleted(state, action);

      case 'TILE_PLAYED':
        return this.handleTilePlayed(state, action);

      case 'PIECE_MOVED':
        return this.handlePieceMoved(state, action);

      case 'TURN_ENDED':
        return this.handleTurnEnded(state, action);

      case 'TILE_ACCEPTED':
        return this.handleTileAccepted(state, action);

      case 'TILE_REJECTED':
        return this.handleTileRejected(state, action);

      case 'CHALLENGE_INITIATED':
        return this.handleChallengeInitiated(state, action);

      case 'CHALLENGE_PASSED':
        return this.handleChallengePassed(state, action);

      case 'TAKE_ADVANTAGE_OFFERED':
        return this.handleTakeAdvantageOffered(state, action);

      case 'TAKE_ADVANTAGE_COMPLETED':
        return this.handleTakeAdvantageCompleted(state, action);

      case 'CORRECTION_COMPLETED':
        return this.handleCorrectionCompleted(state, action);

      case 'TILE_FINALIZED':
        return this.handleTileFinalized(state, action);

      case 'BUREAUCRACY_STARTED':
        return this.handleBureaucracyStarted(state, action);

      case 'BUREAUCRACY_PURCHASE':
        return this.handleBureaucracyPurchase(state, action);

      case 'BUREAUCRACY_COMPLETED':
        return this.handleBureaucracyCompleted(state, action);

      case 'PLAYER_DISCONNECTED':
        return this.handlePlayerDisconnected(state, action);

      case 'PLAYER_RECONNECTED':
        return this.handlePlayerReconnected(state, action);

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return state;
    }
  }

  // Handler implementations (to be filled in next)
  private handleGameCreated(state: GameRoomState, action: GameStateAction): GameRoomState {
    return { ...state };
  }

  private handlePlayerJoined(state: GameRoomState, action: GameStateAction): GameRoomState {
    return { ...state };
  }

  private handleGameStarted(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      status: 'in_progress',
      gameState: 'DRAFTING',
    };
  }

  private handleDraftTileSelected(state: GameRoomState, action: GameStateAction): GameRoomState {
    return { ...state };
  }

  private handleDraftingCompleted(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      gameState: 'CAMPAIGN',
      currentPlayerIndex: 0,
    };
  }

  private handleTilePlayed(state: GameRoomState, action: GameStateAction): GameRoomState {
    const { playedTile } = action.data;

    // Store the tile play and transition to move execution state
    return {
      ...state,
      gameState: 'TILE_PLAYED',
      playedTile: {
        ...playedTile,
        beforePieceSnapshot: [...state.pieces], // Snapshot for potential correction
      },
    };
  }

  private handlePieceMoved(state: GameRoomState, action: GameStateAction): GameRoomState {
    // Update pieces with the new positions from client
    // Full validation will happen when tile is revealed
    return {
      ...state,
      pieces: action.data.pieces || state.pieces,
    };
  }

  private handleTurnEnded(state: GameRoomState, action: GameStateAction): GameRoomState {
    if (!state.playedTile) {
      return state; // No tile played, can't end turn
    }

    // Get receiver's credibility to determine if they can view the tile
    const receiver = state.players[state.playedTile.receivingPlayerId];
    const canViewTile = receiver && receiver.credibility > 0;

    // Setup challenge flow for this tile play
    const challengeOrder = getChallengeOrder(
      state.players.length,
      state.playedTile.receivingPlayerId
    );

    return {
      ...state,
      gameState: canViewTile ? 'PENDING_ACCEPTANCE' : 'PENDING_CHALLENGE',
      challengeFlow: {
        receiver: {
          acceptance: canViewTile ? null : true, // Auto-accept if no credibility
          isPrivatelyViewing: false,
        },
        challengers: {
          order: challengeOrder,
          currentIndex: 0,
          resultMessage: '',
        },
        tileRejected: false,
      },
    };
  }

  private handleTileAccepted(state: GameRoomState, action: GameStateAction): GameRoomState {
    // Receiver accepted the tile, move to challenge phase
    return {
      ...state,
      gameState: 'PENDING_CHALLENGE',
      challengeFlow: {
        ...state.challengeFlow,
        receiver: {
          ...state.challengeFlow.receiver,
          acceptance: true,
        },
      },
    };
  }

  private handleTileRejected(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      gameState: 'CORRECTION_REQUIRED',
      challengeFlow: {
        ...state.challengeFlow,
        receiver: {
          ...state.challengeFlow.receiver,
          acceptance: false,
        },
        tileRejected: true,
      },
    };
  }

  private handleChallengeInitiated(state: GameRoomState, action: GameStateAction): GameRoomState {
    if (!state.playedTile) {
      return state;
    }

    // Check if the tile play was honest
    const tileRequirements = getTileRequirements(state.playedTile.tileId);
    const executedMoveTypes = state.playedTile.movesPerformed.map((m: any) => m.moveType);
    const wasHonest = areAllTileRequirementsMet(state.playedTile.tileId, executedMoveTypes);

    const mover = state.players[state.playedTile.playerId];
    const receiver = state.players[state.playedTile.receivingPlayerId];
    const challengerIndex = state.challengeFlow.challengers.order[state.challengeFlow.challengers.currentIndex];
    const challenger = state.players[challengerIndex];

    if (!mover || !receiver || !challenger) {
      return state;
    }

    // Create updated players array based on challenge outcome
    const updatedPlayers = state.players.map((p, idx) => {
      if (wasHonest) {
        // Honest play revealed
        if (idx === state.playedTile!.playerId && p.credibility < 3) {
          // Mover restores 1 credibility
          return { ...p, credibility: p.credibility + 1 };
        }
        if (idx === challengerIndex && p.credibility > 0) {
          // Challenger loses 1 credibility
          return { ...p, credibility: p.credibility - 1 };
        }
      } else {
        // Dishonest play revealed
        if (idx === state.playedTile!.playerId && p.credibility > 0) {
          // Mover loses 1 credibility
          return { ...p, credibility: p.credibility - 1 };
        }
        if (idx === challengerIndex && p.credibility < 3) {
          // Challenger can restore 1 credibility OR take advantage
          // Take advantage will be offered in separate action
          return p; // Don't restore yet, wait for choice
        }
        if (idx === state.playedTile!.receivingPlayerId && p.credibility > 0) {
          // Receiver loses 1 credibility
          return { ...p, credibility: p.credibility - 1 };
        }
      }
      return p;
    });

    if (!wasHonest) {
      // Offer Take Advantage to challenger
      return {
        ...state,
        players: updatedPlayers,
        gameState: 'TAKE_ADVANTAGE_OFFERED',
        challengeFlow: {
          ...state.challengeFlow,
          challengers: {
            ...state.challengeFlow.challengers,
            resultMessage: 'Challenge successful! Dishonest play revealed.',
          },
        },
      };
    } else {
      // Honest play, proceed to finalize
      return {
        ...state,
        players: updatedPlayers,
        gameState: 'CAMPAIGN',
        challengeFlow: {
          ...state.challengeFlow,
          challengers: {
            ...state.challengeFlow.challengers,
            resultMessage: 'Challenge failed. Play was honest.',
          },
        },
      };
    }
  }

  private handleChallengePassed(state: GameRoomState, action: GameStateAction): GameRoomState {
    const newIndex = state.challengeFlow.challengers.currentIndex + 1;

    if (newIndex >= state.challengeFlow.challengers.order.length) {
      // No more challengers - finalize tile
      return {
        ...state,
        gameState: 'CAMPAIGN',
      };
    }

    return {
      ...state,
      challengeFlow: {
        ...state.challengeFlow,
        challengers: {
          ...state.challengeFlow.challengers,
          currentIndex: newIndex,
        },
      },
    };
  }

  private handleTakeAdvantageOffered(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      takeAdvantage: {
        ...state.takeAdvantage,
        isActive: true,
        challengerId: action.data.challengerId,
        challengerCredibility: action.data.credibility,
        ui: {
          ...state.takeAdvantage.ui,
          showInitialModal: true,
        },
      },
    };
  }

  private handleTakeAdvantageCompleted(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      gameState: 'CORRECTION_REQUIRED',
      takeAdvantage: {
        ...state.takeAdvantage,
        isActive: false,
        ui: {
          showInitialModal: false,
          showTileSelection: false,
          showPurchaseMenu: false,
          validationError: null,
        },
      },
    };
  }

  private handleCorrectionCompleted(state: GameRoomState, action: GameStateAction): GameRoomState {
    // Check for win condition after correction
    const winner = state.players.find(p => checkPlayerWinCondition(p.id, state.pieces));

    if (winner) {
      return {
        ...state,
        gameState: 'GAME_WON',
        status: 'finished',
      };
    }

    return {
      ...state,
      gameState: 'CAMPAIGN',
    };
  }

  private handleTileFinalized(state: GameRoomState, action: GameStateAction): GameRoomState {
    // Check for win condition after tile finalized
    const winner = state.players.find(p => checkPlayerWinCondition(p.id, state.pieces));

    if (winner) {
      return {
        ...state,
        gameState: 'GAME_WON',
        status: 'finished',
        playedTile: null,
      };
    }

    return {
      ...state,
      playedTile: null,
      currentPlayerIndex: action.data.nextPlayerIndex,
    };
  }

  private handleBureaucracyStarted(state: GameRoomState, action: GameStateAction): GameRoomState {
    return {
      ...state,
      gameState: 'BUREAUCRACY',
      bureaucracy: {
        isActive: true,
        currentPlayerIndex: 0,
        playersCompleted: [],
      },
    };
  }

  private handleBureaucracyPurchase(state: GameRoomState, action: GameStateAction): GameRoomState {
    const { playerId, purchase } = action.data;

    // Find player by ID
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return state;
    }

    const player = state.players[playerIndex];

    // Apply the purchase (piece promotion, move execution, credibility restoration)
    // This will be expanded based on purchase type in full implementation
    const updatedPlayers = state.players.map((p, idx) => {
      if (idx === playerIndex) {
        // Deduct kredcoin for this purchase
        // Update player state based on purchase type
        return {
          ...p,
          // Purchase logic will be implemented with full bureaucracy system
        };
      }
      return p;
    });

    return {
      ...state,
      players: updatedPlayers,
    };
  }

  private handleBureaucracyCompleted(state: GameRoomState, action: GameStateAction): GameRoomState {
    // Check for win conditions after bureaucracy
    const winner = state.players.find(p => checkPlayerWinCondition(p.id, state.pieces));

    if (winner) {
      return {
        ...state,
        gameState: 'GAME_WON',
        status: 'finished',
        bureaucracy: {
          isActive: false,
          currentPlayerIndex: 0,
          playersCompleted: [],
        },
      };
    }

    return {
      ...state,
      gameState: 'CAMPAIGN',
      bureaucracy: {
        isActive: false,
        currentPlayerIndex: 0,
        playersCompleted: [],
      },
      currentPlayerIndex: 0,
    };
  }

  private handlePlayerDisconnected(state: GameRoomState, action: GameStateAction): GameRoomState {
    const connections = state.connections.map((conn) =>
      conn.playerId === action.playerId
        ? { ...conn, connected: false, lastSeen: action.timestamp }
        : conn
    );
    return { ...state, connections };
  }

  private handlePlayerReconnected(state: GameRoomState, action: GameStateAction): GameRoomState {
    const connections = state.connections.map((conn) =>
      conn.playerId === action.playerId
        ? { ...conn, connected: true, lastSeen: action.timestamp }
        : conn
    );
    return { ...state, connections };
  }

  /**
   * Validate if an action is legal in the current state
   */
  canDispatch(action: GameStateAction): { valid: boolean; reason?: string } {
    // Implement validation logic
    switch (action.type) {
      case 'TILE_ACCEPTED':
      case 'TILE_REJECTED':
        if (this.state.gameState !== 'PENDING_ACCEPTANCE') {
          return { valid: false, reason: 'Not in acceptance phase' };
        }
        break;

      case 'CHALLENGE_INITIATED':
      case 'CHALLENGE_PASSED':
        if (this.state.gameState !== 'PENDING_CHALLENGE') {
          return { valid: false, reason: 'Not in challenge phase' };
        }
        break;

      // Add more validation rules
    }

    return { valid: true };
  }
}
