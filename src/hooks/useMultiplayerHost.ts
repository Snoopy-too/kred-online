import React from "react";
import type { Player, Piece } from "../types";
import { TILE_SPACES_BY_PLAYER_COUNT } from "../config";
import { initializeCampaignPieces } from "../game";

interface useMultiplayerHostProps {
  isHost: boolean;
  setActionDispatch?: (dispatch: (action: { type: string; playerId: string; payload: any }) => void) => void;
  players: Player[];
  playerCount: number;
  currentPlayerIndex: number;
  draftRound: number;
  setGameState: (state: string) => void;
  setPieces: (pieces: Piece[]) => void;
  setPiecesAtTurnStart: (pieces: Piece[]) => void;
  setCurrentPlayerIndex: (index: number) => void;
  setHasPlayedTileThisTurn: (hasPlayed: boolean) => void;
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setDraftRound: (round: number) => void;
  handlePlaceTile: (tileId: number, targetSpace: any) => void;
  handlePieceMove: (pieceId: string, position: any, location: string) => void;
  handleResetPiecesCorrection: () => void;
  handleResetTurn: () => void;
  handleEndTurn: () => void;
  handleReceiverAcceptanceDecision: (accepted: boolean) => void;
  handleChallengerDecision: (challenge: boolean) => void;
  handleContinueAfterChallengeReveal: () => void;
  handleBonusMoveComplete: () => void;
  handleCorrectionComplete: () => void;
  setSelectedTilesForAdvantage: (tileIds: string[]) => void;
  handleTakeAdvantageDecline: () => void;
  handleFinishBureaucracyTurn: () => void;
  handleDoneWithBureaucracyAction: () => void;
  handleResetBureaucracyAction: () => void;
  handleBureaucracyPiecePromote: (pieceId: string) => void;
  setTakeAdvantagePurchase: (purchase: any) => void;
  setCurrentBureaucracyPurchase: (purchase: any) => void;
}

export function useMultiplayerHost({
  isHost,
  setActionDispatch,
  players,
  playerCount,
  currentPlayerIndex,
  draftRound,
  setGameState,
  setPieces,
  setPiecesAtTurnStart,
  setCurrentPlayerIndex,
  setHasPlayedTileThisTurn,
  setPlayers,
  setDraftRound,
  handlePlaceTile,
  handlePieceMove,
  handleResetPiecesCorrection,
  handleResetTurn,
  handleEndTurn,
  handleReceiverAcceptanceDecision,
  handleChallengerDecision,
  handleContinueAfterChallengeReveal,
  handleBonusMoveComplete,
  handleCorrectionComplete,
  setSelectedTilesForAdvantage,
  handleTakeAdvantageDecline,
  handleFinishBureaucracyTurn,
  handleDoneWithBureaucracyAction,
  handleResetBureaucracyAction,
  handleBureaucracyPiecePromote,
  setTakeAdvantagePurchase,
  setCurrentBureaucracyPurchase,
}: useMultiplayerHostProps) {
  React.useLayoutEffect(() => {
    if (!setActionDispatch || !isHost) return;

    setActionDispatch((action) => {
      switch (action.type) {
        case 'SELECT_DRAFT_TILE': {
          const { tileId, playerIndex: selectingPlayerIndex } = action.payload;
          if (typeof selectingPlayerIndex !== 'number') break;

          // Find the tile in the selecting player's hand
          const selectingPlayer = players[selectingPlayerIndex];
          if (!selectingPlayer) break;

          // Guard: only allow 1 pick per round (player's hand must equal the max hand size)
          const maxHandSize = Math.max(...players.map(p => p.hand.length));
          if (selectingPlayer.hand.length < maxHandSize) break;

          const tile = selectingPlayer.hand.find((t: any) => String(t.id) === String(tileId));
          if (!tile) break;

          // Move tile from hand to keptTiles for the selecting player
          const updatedPlayers = players.map((p, i) => {
            if (i === selectingPlayerIndex) {
              return {
                ...p,
                keptTiles: [...p.keptTiles, tile],
                hand: p.hand.filter((t: any) => t.id !== tile.id),
              };
            }
            return p;
          });

          // Check if ALL players have selected this round
          // After each pick, that player's hand is 1 less. When all hands are equal, everyone has picked.
          const handSizes = updatedPlayers.map(p => p.hand.length);
          const allSelected = handSizes.every(s => s === handSizes[0]);

          if (allSelected) {
            const totalTilesPerPlayer = Math.floor((playerCount === 5 ? 25 : 24) / playerCount);

            if (handSizes[0] === 0) {
              // Drafting complete — move to Campaign
              setGameState('CAMPAIGN');
              const initialPieces = initializeCampaignPieces(playerCount);
              setPieces(initialPieces);
              setPiecesAtTurnStart(initialPieces);

              // Player with tile 03 goes first
              const startingIdx = updatedPlayers.findIndex(
                p => p.keptTiles?.some((t: any) => t.id === 3)
              );
              setCurrentPlayerIndex(startingIdx !== -1 ? startingIdx : 0);
              setHasPlayedTileThisTurn(false);
              setPlayers(updatedPlayers);
            } else {
              // Rotate hands to the left for next round
              const handsToPass = updatedPlayers.map(p => p.hand);
              const rotated = updatedPlayers.map((p, i) => ({
                ...p,
                hand: handsToPass[(i - 1 + playerCount) % playerCount],
              }));
              setPlayers(rotated);
              setDraftRound(draftRound + 1);
            }
          } else {
            // Not all players have picked yet — just update state
            setPlayers(updatedPlayers);
          }
          break;
        }
        case 'PLAY_TILE': {
          const { tileId, targetPlayerId } = action.payload;
          const spaces = TILE_SPACES_BY_PLAYER_COUNT[playerCount] || [];
          const matchedSpace = spaces.find(s => s.ownerId === targetPlayerId);
          if (matchedSpace) {
            handlePlaceTile(Number(tileId), matchedSpace);
          } else {
            handlePlaceTile(Number(tileId), { ownerId: targetPlayerId, position: { left: 0, top: 0 }, rotation: 0 });
          }
          break;
        }
        case 'MOVE_PIECE': {
          const { pieceId, position, location } = action.payload;
          handlePieceMove(pieceId, position, location);
          break;
        }
        case 'END_TURN':
          handleEndTurn();
          break;
        case 'RECEIVER_DECISION':
          handleReceiverAcceptanceDecision(action.payload.accepted);
          break;
        case 'RESET_PIECES_CORRECTION':
          handleResetPiecesCorrection();
          break;
        case 'VIEW_TILE_PRIVATE':
          // Guest viewing tile privately — no host action needed
          break;
        case 'RESET_TURN':
          handleResetTurn();
          break;
        case 'CHALLENGER_DECISION':
          handleChallengerDecision(action.payload.challenge);
          break;
        case 'CONTINUE_AFTER_CHALLENGE_REVEAL':
          handleContinueAfterChallengeReveal();
          break;
        case 'COMPLETE_BONUS_MOVE':
          handleBonusMoveComplete();
          break;
        case 'COMPLETE_CORRECTION':
          handleCorrectionComplete();
          break;
        case 'ADVANTAGE_SELECT_TILES':
          // Guest selected tiles for take advantage
          setSelectedTilesForAdvantage(action.payload.tileIds);
          break;
        case 'ADVANTAGE_PURCHASE':
          setTakeAdvantagePurchase(action.payload.purchase);
          break;
        case 'ADVANTAGE_DECLINE':
          handleTakeAdvantageDecline();
          break;
        case 'RECEIVER_REWARD':
          // Process on host side directly
          break;
        case 'BUREAUCRACY_PURCHASE':
          setCurrentBureaucracyPurchase(action.payload.purchase);
          break;
        case 'BUREAUCRACY_DONE':
          handleDoneWithBureaucracyAction();
          break;
        case 'BUREAUCRACY_RESET':
          handleResetBureaucracyAction();
          break;
        case 'BUREAUCRACY_PROMOTE':
          handleBureaucracyPiecePromote(action.payload.pieceId);
          break;
        case 'BUREAUCRACY_COMPLETE':
          handleFinishBureaucracyTurn();
          break;
        default:
          console.warn('[HOST] Unknown action type:', action.type);
      }
    });
  }, [
    isHost,
    setActionDispatch,
    players,
    playerCount,
    draftRound,
    setGameState,
    setPieces,
    setPiecesAtTurnStart,
    setCurrentPlayerIndex,
    setHasPlayedTileThisTurn,
    setPlayers,
    setDraftRound,
    handlePlaceTile,
    handlePieceMove,
    handleResetPiecesCorrection,
    handleResetTurn,
    handleEndTurn,
    handleReceiverAcceptanceDecision,
    handleChallengerDecision,
    handleContinueAfterChallengeReveal,
    handleBonusMoveComplete,
    handleCorrectionComplete,
    setSelectedTilesForAdvantage,
    handleTakeAdvantageDecline,
    handleFinishBureaucracyTurn,
    handleDoneWithBureaucracyAction,
    handleResetBureaucracyAction,
    handleBureaucracyPiecePromote,
    setTakeAdvantagePurchase,
    setCurrentBureaucracyPurchase,
  ]);
}
