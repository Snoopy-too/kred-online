import React from "react";
import type { Piece } from "../types";

interface AppWrappersProps {
  isMultiplayer: boolean;
  multiplayerActions: any;
  pieceMovementHandlers: any;
  bureaucracyHandlers: any;
  handlePlaceTile: (tileId: number, targetSpace: any) => void;
  handleEndTurn: () => void;
  handleReceiverAcceptanceDecision: (accepted: boolean) => void;
  handleResetPiecesCorrection: () => void;
  handleResetTurn: () => void;
  handleChallengerDecision: (challenge: boolean) => void;
  handleContinueAfterChallengeReveal: () => void;
  handleBonusMoveComplete: () => void;
  handleCorrectionComplete: () => void;
  showAlert: (title: string, message: string, type?: "error" | "warning" | "info") => void;
  validatePlayTile?: (tileId: number, targetSpace: any) => boolean;
}

export function useAppWrappers({
  isMultiplayer,
  multiplayerActions,
  pieceMovementHandlers,
  bureaucracyHandlers,
  handlePlaceTile,
  handleEndTurn,
  handleReceiverAcceptanceDecision,
  handleResetPiecesCorrection,
  handleResetTurn,
  handleChallengerDecision,
  handleContinueAfterChallengeReveal,
  handleBonusMoveComplete,
  handleCorrectionComplete,
  showAlert,
  validatePlayTile,
}: AppWrappersProps) {

  // Wrap piece movement for multiplayer
  const wrappedPieceMove = React.useCallback(async (pieceId: string, newPosition: any, locationId: string) => {
    const result = pieceMovementHandlers.handlePieceMove(pieceId, newPosition, locationId);
    if (isMultiplayer && multiplayerActions && result.success) {
      try {
        await multiplayerActions.movePiece(pieceId, newPosition, locationId);
      } catch (error) {
        console.error('[MULTIPLAYER] Piece movement sync failed:', error);
      }
    }
    return result;
  }, [isMultiplayer, multiplayerActions, pieceMovementHandlers]);

  // Wrap bureaucracy piece movement for multiplayer
  const wrappedBureaucracyPieceMove = React.useCallback(async (pieceId: string, newPosition: any, locationId: string) => {
    bureaucracyHandlers.handleBureaucracyPieceMove(pieceId, newPosition, locationId);
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.movePiece(pieceId, newPosition, locationId);
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy piece movement sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap bureaucracy piece promotion for multiplayer
  const wrappedBureaucracyPiecePromote = React.useCallback(async (pieceId: string) => {
    bureaucracyHandlers.handleBureaucracyPiecePromote(pieceId);
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.promoteBureaucracyPiece?.(pieceId);
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy piece promote sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap bureaucracy menu item selection
  const wrappedBureaucracySelectMenuItem = React.useCallback(async (item: any) => {
    bureaucracyHandlers.handleSelectBureaucracyMenuItem(item);
    if (isMultiplayer && multiplayerActions) {
      try {
        // We need to send the purchase object to the host
        // But handleSelectBureaucracyMenuItem doesn't return it.
        // We can just send the item and let the host create its own purchase object.
        // Wait, multiplayerActions.purchaseBureaucracy expects a purchase object.
        // Let's just send a minimal purchase object.
        await multiplayerActions.purchaseBureaucracy({ item });
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy purchase sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap bureaucracy done with action
  const wrappedBureaucracyDoneWithAction = React.useCallback(async () => {
    bureaucracyHandlers.handleDoneWithBureaucracyAction();
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.purchaseBureaucracyDone?.();
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy done sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap bureaucracy reset action
  const wrappedBureaucracyResetAction = React.useCallback(async () => {
    bureaucracyHandlers.handleResetBureaucracyAction();
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.purchaseBureaucracyReset?.();
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy reset sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap bureaucracy finish turn
  const wrappedBureaucracyFinishTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.bureaucracyComplete();
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy complete sync failed:', error);
      }
    } else {
      bureaucracyHandlers.handleFinishBureaucracyTurn();
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers]);

  // Wrap tile placement for multiplayer
  const wrappedPlaceTile = React.useCallback(async (tileId: number, targetSpace: { ownerId: number; position: any; rotation: number }) => {
    if (validatePlayTile && !validatePlayTile(tileId, targetSpace)) {
      return;
    }

    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.playTile(tileId.toString(), targetSpace.ownerId);
      } catch (error: any) {
        console.error('[MULTIPLAYER] Tile play failed:', error);
        alert(`Failed to play tile: ${error.message}`);
      }
    } else {
      handlePlaceTile(tileId, targetSpace);
    }
  }, [isMultiplayer, multiplayerActions, handlePlaceTile, validatePlayTile]);

  // Wrap turn ending for multiplayer
  const wrappedEndTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.endTurn();
      } catch (error: any) {
        console.error('[MULTIPLAYER] End turn failed:', error);
        showAlert('Invalid Correction', error.message, 'error');
      }
    } else {
      handleEndTurn();
    }
  }, [isMultiplayer, multiplayerActions, handleEndTurn, showAlert]);

  // Wrap receiver decision for multiplayer
  const wrappedReceiverDecision = React.useCallback(async (accepted: boolean) => {
    if (isMultiplayer && multiplayerActions) {
      try {
        if (accepted) {
          await multiplayerActions.acceptTile();
        } else {
          await multiplayerActions.rejectTile();
        }
      } catch (error: any) {
        console.error('[MULTIPLAYER] Receiver decision failed:', error);
        alert(`Failed to process decision: ${error.message}`);
      }
    } else {
      handleReceiverAcceptanceDecision(accepted);
    }
  }, [isMultiplayer, multiplayerActions, handleReceiverAcceptanceDecision]);

  // Wrap reset pieces correction for multiplayer
  const wrappedResetPiecesCorrection = React.useCallback(async () => {
    handleResetPiecesCorrection();
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.resetPiecesCorrection();
      } catch (error) {
        console.error('[MULTIPLAYER] Reset pieces correction sync failed:', error);
      }
    }
  }, [isMultiplayer, multiplayerActions, handleResetPiecesCorrection]);

  // Wrap reset turn for multiplayer — guest must NOT run locally (piecesAtTurnStart is empty)
  const wrappedResetTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.resetTurn();
      } catch (error: any) {
        console.error('[MULTIPLAYER] Reset turn failed:', error);
      }
    } else {
      handleResetTurn();
    }
  }, [isMultiplayer, multiplayerActions, handleResetTurn]);

  const handleReceiverRewardChoiceLocal = React.useCallback(async (choice: 'credibility' | 'advance') => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.receiverRewardChoice(choice);
      } catch (error: any) {
        console.error('[MULTIPLAYER] Receiver reward choice failed:', error);
        alert(`Failed to process reward choice: ${error.message}`);
      }
    }
  }, [isMultiplayer, multiplayerActions]);

  const wrappedChallengerDecision = React.useCallback(async (challenge: boolean) => {
    if (isMultiplayer && multiplayerActions) {
      if (challenge) {
        await multiplayerActions.initiateChallenge();
      } else {
        await multiplayerActions.passChallenge();
      }
    } else {
      handleChallengerDecision(challenge);
    }
  }, [isMultiplayer, multiplayerActions, handleChallengerDecision]);

  const wrappedContinueAfterChallengeReveal = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.continueAfterChallengeReveal();
      } catch (error: any) {
        console.error('[MULTIPLAYER] Continue-after-challenge-reveal failed:', error);
      }
    } else {
      handleContinueAfterChallengeReveal();
    }
  }, [isMultiplayer, multiplayerActions, handleContinueAfterChallengeReveal]);

  const wrappedBonusMoveComplete = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.completeBonusMove();
      } catch (error: any) {
        console.error('[MULTIPLAYER] Complete bonus move failed:', error);
      }
    } else {
      handleBonusMoveComplete();
    }
  }, [isMultiplayer, multiplayerActions, handleBonusMoveComplete]);

  const wrappedCorrectionComplete = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      try {
        await multiplayerActions.completeCorrection();
      } catch (error: any) {
        console.error('[MULTIPLAYER] Complete correction failed:', error);
      }
    } else {
      handleCorrectionComplete();
    }
  }, [isMultiplayer, multiplayerActions, handleCorrectionComplete]);

  return {
    wrappedPieceMove,
    wrappedPlaceTile,
    wrappedEndTurn,
    wrappedReceiverDecision,
    wrappedResetPiecesCorrection,
    handleReceiverRewardChoiceLocal,
    wrappedChallengerDecision,
    wrappedContinueAfterChallengeReveal,
    wrappedBonusMoveComplete,
    wrappedCorrectionComplete,
    wrappedResetTurn,
    wrappedBureaucracyPieceMove,
    wrappedBureaucracyPiecePromote,
    wrappedBureaucracySelectMenuItem,
    wrappedBureaucracyDoneWithAction,
    wrappedBureaucracyResetAction,
    wrappedBureaucracyFinishTurn,
  };
}
