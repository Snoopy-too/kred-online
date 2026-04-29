import React from "react";
import type { Piece } from "../types";
import { getBureaucracyMenu, getAvailablePurchases } from "../game";

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
  bureaucracyStates?: any[];
  bureaucracyTurnOrder?: number[];
  currentBureaucracyPlayerIndex?: number;
  playerCount?: number;
  setShowFinishTurnConfirm?: (state: { isOpen: boolean; remainingKredcoin: number }) => void;
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
  bureaucracyStates,
  bureaucracyTurnOrder,
  currentBureaucracyPlayerIndex,
  playerCount,
  setShowFinishTurnConfirm,
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

  // Wrap bureaucracy undo last promotion
  const wrappedBureaucracyUndoLastPromotion = React.useCallback(async () => {
    bureaucracyHandlers.handleUndoLastPromotion();
    // Undo is a local-only operation; no multiplayer sync needed
    // (the host tracks its own promotionHistory independently)
  }, [bureaucracyHandlers]);

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

  // Wrap bureaucracy finish turn.
  //
  // In multiplayer, the confirmation modal ("you still have Kredcoin — are you
  // sure?") must appear on the ACTIVE player's screen, not the host's. If we
  // just forwarded BUREAUCRACY_COMPLETE to the host, the host would run
  // handleFinishBureaucracyTurn and pop the modal on its own screen, using its
  // view of bureaucracyStates. The active guest would see nothing.
  // So we do the affordability check locally here, show the modal to the
  // clicker, and only emit BUREAUCRACY_COMPLETE after confirmation.
  const wrappedBureaucracyFinishTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      const currentPlayerId = bureaucracyTurnOrder?.[currentBureaucracyPlayerIndex ?? 0];
      const playerState = bureaucracyStates?.find((s: any) => s.playerId === currentPlayerId);
      const menu = getBureaucracyMenu(playerCount ?? 3);
      const affordable = playerState ? getAvailablePurchases(menu, playerState.remainingKredcoin) : [];
      if (affordable.length > 0 && setShowFinishTurnConfirm) {
        setShowFinishTurnConfirm({ isOpen: true, remainingKredcoin: playerState?.remainingKredcoin ?? 0 });
        return;
      }
      try {
        await multiplayerActions.bureaucracyComplete();
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy complete sync failed:', error);
      }
    } else {
      bureaucracyHandlers.handleFinishBureaucracyTurn();
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers, bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex, playerCount, setShowFinishTurnConfirm]);

  // Wrap the "confirm finish turn" click from the modal. In multiplayer, the
  // guest already saw the modal and clicked confirm, so we just dismiss it and
  // emit the action — the host's BUREAUCRACY_COMPLETE handler runs
  // completeBureaucracyTurn unconditionally.
  const wrappedBureaucracyConfirmFinishTurn = React.useCallback(async () => {
    if (isMultiplayer && multiplayerActions) {
      setShowFinishTurnConfirm?.({ isOpen: false, remainingKredcoin: 0 });
      try {
        await multiplayerActions.bureaucracyComplete();
      } catch (error) {
        console.error('[MULTIPLAYER] Bureaucracy complete sync failed:', error);
      }
    } else {
      bureaucracyHandlers.handleConfirmFinishTurn();
    }
  }, [isMultiplayer, multiplayerActions, bureaucracyHandlers, setShowFinishTurnConfirm]);

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
    wrappedBureaucracyUndoLastPromotion,
    wrappedBureaucracySelectMenuItem,
    wrappedBureaucracyDoneWithAction,
    wrappedBureaucracyResetAction,
    wrappedBureaucracyFinishTurn,
    wrappedBureaucracyConfirmFinishTurn,
  };
}
