/**
 * Game Flow Handlers
 *
 * Purpose: Handles game state transitions - starting games, new games, and tile selection during drafting
 * Dependencies: Game initialization and state management utilities
 *
 * @module handlers/gameFlowHandlers
 */

import type {
  Piece,
  Player,
  GameState,
  Tile,
  BoardTile,
  TrackedMove,
  PlayedTileState,
  BureaucracyPlayerState,
} from "../types";
import type { Dispatch, SetStateAction } from "react";

// ============================================================================
// DEPENDENCY INTERFACE
// ============================================================================

/**
 * Dependencies required by game flow handlers.
 * These are injected by the factory to allow for testability and loose coupling.
 */
export interface GameFlowDependencies {
  // --- Current State Values (Read-only) ---
  playerCount: number;
  players: Player[];
  currentPlayerIndex: number;
  draftRound: number;

  // --- State Setters ---
  setPlayerCount: Dispatch<SetStateAction<number>>;
  setIsTestMode: Dispatch<SetStateAction<boolean>>;
  setPlayers: Dispatch<SetStateAction<Player[]>>;
  setPieces: Dispatch<SetStateAction<Piece[]>>;
  setCurrentPlayerIndex: Dispatch<SetStateAction<number>>;
  setDraftRound: Dispatch<SetStateAction<number>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setGameLog: Dispatch<SetStateAction<string[]>>;

  // Piece tracking state setters
  setPiecesAtTurnStart: Dispatch<SetStateAction<Piece[]>>;
  setMovedPiecesThisTurn: Dispatch<SetStateAction<Set<string>>>;
  setPendingCommunityPieces: Dispatch<SetStateAction<Set<string>>>;

  // Board state setters
  setBoardTiles: Dispatch<SetStateAction<BoardTile[]>>;
  setBankedTiles: Dispatch<SetStateAction<BoardTile[]>>;
  setLastDroppedPosition: Dispatch<
    SetStateAction<{ top: number; left: number } | null>
  >;
  setRevealedTileId: Dispatch<SetStateAction<string | null>>;
  setChallengedTile: Dispatch<SetStateAction<string | null>>;
  setPlacerViewingTileId: Dispatch<SetStateAction<string | null>>;

  // Tile play state setters
  setHasPlayedTileThisTurn: Dispatch<SetStateAction<boolean>>;
  setPlayedTile: Dispatch<SetStateAction<PlayedTileState | null>>;
  setMovesThisTurn: Dispatch<SetStateAction<TrackedMove[]>>;
  setTileTransaction: Dispatch<
    SetStateAction<{
      giverId: number;
      receiverId: number;
      tileId: number;
    } | null>
  >;
  setReceiverAcceptance: Dispatch<SetStateAction<boolean | null>>;

  // Challenge state setters
  setBystanders: Dispatch<SetStateAction<number[]>>;
  setBystanderIndex: Dispatch<SetStateAction<number>>;
  setIsPrivatelyViewing: Dispatch<SetStateAction<boolean>>;
  setShowChallengeRevealModal: Dispatch<SetStateAction<boolean>>;
  setChallengeOrder: Dispatch<SetStateAction<number[]>>;
  setCurrentChallengerIndex: Dispatch<SetStateAction<number>>;
  setTileRejected: Dispatch<SetStateAction<boolean>>;
  setShowMoveCheckResult: Dispatch<SetStateAction<boolean>>;
  setMoveCheckResult: Dispatch<
    SetStateAction<{ valid: boolean; message: string } | null>
  >;
  setGiveReceiverViewingTileId: Dispatch<SetStateAction<string | null>>;
  setTilePlayerMustWithdraw: Dispatch<SetStateAction<boolean>>;

  // Bureaucracy state setters
  setBureaucracyTurnOrder: Dispatch<SetStateAction<number[]>>;
  setBureaucracyStates: Dispatch<SetStateAction<BureaucracyPlayerState[]>>;
  setCurrentBureaucracyPlayerIndex: Dispatch<SetStateAction<number>>;
  setShowBureaucracyMenu: Dispatch<SetStateAction<boolean>>;

  // --- Initialization Functions ---
  initializePlayers: (count: number) => Player[];
  initializeCampaignPieces: (count: number) => Piece[];
  getBureaucracyTurnOrder: (players: Player[]) => number[];
  calculatePlayerKredcoin: (player: Player) => number;

  // --- Configuration ---
  BANK_SPACES_BY_PLAYER_COUNT: Record<
    number,
    {
      ownerId: number;
      position: { left: number; top: number };
      rotation: number;
    }[]
  >;
}

// ============================================================================
// HANDLER TYPES
// ============================================================================

export interface GameFlowHandlers {
  handleStartGame: (
    count: number,
    testMode: boolean,
    skipDraft: boolean,
    skipCampaign: boolean
  ) => void;
  handleNewGame: () => void;
  handleSelectTile: (selectedTile: Tile) => void;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates game flow handlers with injected dependencies.
 *
 * @param deps - Dependencies required by the handlers
 * @returns Object containing all game flow handler functions
 */
export function createGameFlowHandlers(
  deps: GameFlowDependencies
): GameFlowHandlers {
  // ============================================================================
  // handleStartGame - Initialize and start a new game
  // ============================================================================
  const handleStartGame = (
    count: number,
    testMode: boolean,
    skipDraft: boolean,
    skipCampaign: boolean
  ): void => {
    deps.setPlayerCount(count);
    deps.setIsTestMode(testMode);
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());

    const initialPlayers = deps.initializePlayers(count);

    if (skipDraft && skipCampaign) {
      // Skip both phases - distribute tiles randomly and move to bureaucracy
      const allTiles: Tile[] = [];
      for (let i = 1; i <= 24; i++) {
        allTiles.push({
          id: i,
          url: `./images/${String(i).padStart(2, "0")}.svg`,
        });
      }

      // Add blank tile for 5-player mode
      if (count === 5) {
        allTiles.push({
          id: 25,
          url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
        });
      }

      // Shuffle tiles
      const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);

      // Calculate tiles per player for bank
      const bankSpaces = deps.BANK_SPACES_BY_PLAYER_COUNT[count] || [];
      const tilesPerPlayer = bankSpaces.length / count;

      // Distribute tiles to each player's bureaucracy tiles
      const playersWithTiles = initialPlayers.map((player, index) => {
        const startIdx = index * tilesPerPlayer;
        const playerTiles = shuffledTiles.slice(
          startIdx,
          startIdx + tilesPerPlayer
        );
        return {
          ...player,
          hand: [],
          keptTiles: [],
          bureaucracyTiles: playerTiles,
        };
      });

      deps.setPlayers(playersWithTiles);

      // Initialize campaign pieces
      const campaignPieces = deps.initializeCampaignPieces(count);
      deps.setPieces(campaignPieces);

      // Initialize Bureaucracy phase
      const turnOrder = deps.getBureaucracyTurnOrder(playersWithTiles);
      const initialStates: BureaucracyPlayerState[] = playersWithTiles.map(
        (p) => ({
          playerId: p.id,
          initialKredcoin: deps.calculatePlayerKredcoin(p),
          remainingKredcoin: deps.calculatePlayerKredcoin(p),
          turnComplete: false,
          purchases: [],
        })
      );

      deps.setBureaucracyTurnOrder(turnOrder);
      deps.setBureaucracyStates(initialStates);
      deps.setCurrentBureaucracyPlayerIndex(0);
      deps.setShowBureaucracyMenu(true);
      deps.setGameState("BUREAUCRACY");
      deps.setCurrentPlayerIndex(0);
    } else if (skipDraft) {
      // Skip draft phase only - distribute tiles randomly to hand
      const allTiles: Tile[] = [];
      for (let i = 1; i <= 24; i++) {
        allTiles.push({
          id: i,
          url: `./images/${String(i).padStart(2, "0")}.svg`,
        });
      }

      // Add blank tile for 5-player mode
      if (count === 5) {
        allTiles.push({
          id: 25,
          url: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg'/%3e`,
        });
      }

      // Shuffle tiles
      const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5);

      // Determine hand size based on player count
      const handSize = count === 3 ? 8 : count === 4 ? 6 : 5; // 3p=8, 4p=6, 5p=5

      // Distribute tiles to each player's hand
      const playersWithTiles = initialPlayers.map((player, index) => {
        const startIdx = index * handSize;
        const playerTiles = shuffledTiles.slice(startIdx, startIdx + handSize);
        return {
          ...player,
          hand: playerTiles,
          keptTiles: playerTiles,
          bureaucracyTiles: [],
        };
      });

      deps.setPlayers(playersWithTiles);

      // Initialize campaign pieces and start campaign
      const campaignPieces = deps.initializeCampaignPieces(count);
      deps.setPieces(campaignPieces);
      deps.setPiecesAtTurnStart(campaignPieces.map((p) => ({ ...p })));

      // Player with tile 03 goes first
      const startingTileId = 3;
      const startingPlayerIndex = playersWithTiles.findIndex(
        (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
      );
      if (startingPlayerIndex !== -1) {
        deps.setCurrentPlayerIndex(startingPlayerIndex);
      } else {
        deps.setCurrentPlayerIndex(0);
      }

      deps.setGameState("CAMPAIGN");
    } else {
      // Normal game flow - start with drafting
      deps.setPlayers(initialPlayers);
      deps.setGameState("DRAFTING");
      deps.setCurrentPlayerIndex(0);
      deps.setDraftRound(1);
    }
  };

  // ============================================================================
  // handleNewGame - Reset all state and return to player selection
  // ============================================================================
  const handleNewGame = (): void => {
    deps.setGameState("PLAYER_SELECTION");
    deps.setPlayers([]);
    deps.setPlayerCount(0);
    deps.setPieces([]);
    deps.setLastDroppedPosition(null);
    deps.setBoardTiles([]);
    deps.setBankedTiles([]);
    deps.setHasPlayedTileThisTurn(false);
    deps.setRevealedTileId(null);
    deps.setTileTransaction(null);
    deps.setBystanders([]);
    deps.setBystanderIndex(0);
    deps.setIsPrivatelyViewing(false);
    deps.setShowChallengeRevealModal(false);
    deps.setChallengedTile(null);
    deps.setPlacerViewingTileId(null);
    deps.setGameLog([]);
    deps.setPiecesAtTurnStart([]);
    // Reset new tile play workflow states
    deps.setPlayedTile(null);
    deps.setMovesThisTurn([]);
    deps.setMovedPiecesThisTurn(new Set());
    deps.setPendingCommunityPieces(new Set());
    deps.setReceiverAcceptance(null);
    deps.setChallengeOrder([]);
    deps.setCurrentChallengerIndex(0);
    deps.setTileRejected(false);
    deps.setShowMoveCheckResult(false);
    deps.setMoveCheckResult(null);
    deps.setGiveReceiverViewingTileId(null);
    deps.setTilePlayerMustWithdraw(false);
  };

  // ============================================================================
  // handleSelectTile - Handle tile selection during drafting phase
  // ============================================================================
  const handleSelectTile = (selectedTile: Tile): void => {
    const updatedPlayers = deps.players.map((player, index) => {
      if (index === deps.currentPlayerIndex) {
        return {
          ...player,
          keptTiles: [...player.keptTiles, selectedTile],
          hand: player.hand.filter((tile) => tile.id !== selectedTile.id),
        };
      }
      return player;
    });

    const nextPlayerIndex = deps.currentPlayerIndex + 1;
    if (nextPlayerIndex >= deps.playerCount) {
      const handsToPass = updatedPlayers.map((p) => p.hand);
      const playersWithPassedHands = updatedPlayers.map((p, i) => {
        const passingPlayerIndex =
          (i - 1 + deps.playerCount) % deps.playerCount;
        return { ...p, hand: handsToPass[passingPlayerIndex] };
      });

      if (playersWithPassedHands[0].hand.length === 0) {
        deps.setGameState("CAMPAIGN");

        // Initialize pieces for campaign: Marks at seats 1,3,5 + Heels/Pawns in community
        const initialPieces = deps.initializeCampaignPieces(deps.playerCount);
        deps.setPieces(initialPieces);
        deps.setPiecesAtTurnStart(initialPieces);

        // Player with tile 03.svg goes first in Campaign
        const startingTileId = 3;
        const startingPlayerIndex = playersWithPassedHands.findIndex(
          (p) => p.keptTiles && p.keptTiles.some((t) => t.id === startingTileId)
        );

        deps.setCurrentPlayerIndex(
          startingPlayerIndex !== -1 ? startingPlayerIndex : 0
        );
        deps.setHasPlayedTileThisTurn(false);
        deps.setPlayers(playersWithPassedHands);
      } else {
        deps.setPlayers(playersWithPassedHands);
        deps.setDraftRound(deps.draftRound + 1);
        deps.setCurrentPlayerIndex(0);
      }
    } else {
      deps.setPlayers(updatedPlayers);
      deps.setCurrentPlayerIndex(nextPlayerIndex);
    }
  };

  return {
    handleStartGame,
    handleNewGame,
    handleSelectTile,
  };
}
