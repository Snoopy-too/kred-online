import React from "react";
import {
  AlertModal,
  PerfectTileModal,
  ChallengeResultMessage,
  FinishTurnConfirmModal,
  BureaucracyTransition,
} from "./shared/Modals";

interface ModalContainerProps {
  alertModal: any;
  closeAlert: () => void;
  showPerfectTileModal: boolean;
  handlePerfectTileContinue: () => void;
  challengeResultMessage: string;
  challengeResultMessagePlayerId: number | null;
  viewingPlayerId: number;
  clearChallengeResult: () => void;
  showFinishTurnConfirm: any;
  handleCancelFinishTurn: () => void;
  handleConfirmFinishTurn: () => void;
  showBureaucracyTransition: boolean;
  isMultiplayer: boolean;
  playerIndex?: number;
  playedTile: any;
  tileTransaction: any;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  alertModal,
  closeAlert,
  showPerfectTileModal,
  handlePerfectTileContinue,
  challengeResultMessage,
  challengeResultMessagePlayerId,
  viewingPlayerId,
  clearChallengeResult,
  showFinishTurnConfirm,
  handleCancelFinishTurn,
  handleConfirmFinishTurn,
  showBureaucracyTransition,
  isMultiplayer,
  playerIndex,
  playedTile,
  tileTransaction,
}) => {
  return (
    <>
      {/* Perfect Tile Modal */}
      <PerfectTileModal
        isOpen={showPerfectTileModal && (!isMultiplayer || playerIndex! + 1 === (playedTile?.receivingPlayerId || tileTransaction?.receiverId))}
        onContinue={handlePerfectTileContinue}
      />

      {/* Challenge Result Message - displays for 5 seconds */}
      <ChallengeResultMessage 
        message={challengeResultMessage} 
        targetPlayerId={challengeResultMessagePlayerId}
        currentPlayerId={viewingPlayerId}
        onClose={clearChallengeResult}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen && (!isMultiplayer || alertModal.targetPlayerId == null || alertModal.targetPlayerId === viewingPlayerId)}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={closeAlert}
      />

      {/* Finish Turn Confirmation Modal */}
      <FinishTurnConfirmModal
        isOpen={showFinishTurnConfirm.isOpen}
        remainingKredcoin={showFinishTurnConfirm.remainingKredcoin}
        onCancel={handleCancelFinishTurn}
        onConfirm={handleConfirmFinishTurn}
      />

      {/* Bureaucracy Phase Transition Message */}
      <BureaucracyTransition isVisible={showBureaucracyTransition} />
    </>
  );
};

export default ModalContainer;
