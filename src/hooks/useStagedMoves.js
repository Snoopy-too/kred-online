import { useState, useEffect } from 'react';
import { MOVE_TYPES } from '../domain/types.js';
import { getValidDestinations, inferMoveType } from '../domain/moveRulesUtils.js';
import { applyMoveToState, isCommunityPieceAvailable } from '../domain/moves.js';
import { getPendingPlayActivePlayer } from '../domain/board.js';
import { executeOnlineCampaignTurn } from '../domain/onlineEngine.js';

export function useStagedMoves({ G, ctx, playerID, moves, isOnline, updateMasterGameState, numPlayers, tilesPerPlayer, currentPhase }) {
  const [selectedTileId, setSelectedTileId] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [stagedMoves, setStagedMoves] = useState([]);
  const [transientBoardState, setTransientBoardState] = useState(null);
  const [transientCommunity, setTransientCommunity] = useState(null);
  const [selectedPieceLoc, setSelectedPieceLoc] = useState('');
  const [validDestinations, setValidDestinations] = useState([]);
  const [peekPendingTile, setPeekPendingTile] = useState(false);

  const isMyTurn = ctx && String(ctx.currentPlayer) === String(playerID);

  const handleTogglePeekTile = () => {
    setPeekPendingTile(prev => !prev);
  };

  // Sync transient board state and clear staged selections when turn or pending step changes
  useEffect(() => {
    setSelectedTileId('');
    setSelectedReceiverId('');
    setStagedMoves([]);
    setSelectedPieceLoc('');
    setValidDestinations([]);
    setPeekPendingTile(false);
    if (G && G.boardState) {
      setTransientBoardState(JSON.parse(JSON.stringify(G.boardState)));
    }
    if (G && G.community) {
      setTransientCommunity(JSON.parse(JSON.stringify(G.community)));
    }
  }, [G?.boardState, G?.community, G?.pendingPlay?.step, G?.pendingPlay, ctx?.currentPlayer]);

  // Reset local transient state whenever boardState, phase, or currentPlayer updates externally
  useEffect(() => {
    setTransientBoardState(null);
    setTransientCommunity(null);
    setSelectedTileId('');
    setSelectedReceiverId('');
    setStagedMoves([]);
    setSelectedPieceLoc('');
    setValidDestinations([]);
  }, [G?.boardState, G?.pendingPlay, ctx?.phase, ctx?.currentPlayer]);

  // Self-play rule: allowed ONLY if all opponents have full banks
  const canSelfPlay = G && G.players
    ? !Object.keys(G.players).some(p => String(p) !== String(playerID) && (G.players[p].bank || []).length < tilesPerPlayer)
    : false;

  const handleSelectTile = (tileId) => {
    if (!isMyTurn || currentPhase !== 'campaign') return;
    if (selectedTileId === tileId) {
      setSelectedTileId('');
    } else {
      setSelectedTileId(tileId);
    }
  };

  const handleSelectReceiver = (receiverId) => {
    if (!isMyTurn || currentPhase !== 'campaign' || !selectedTileId) return;
    const receiverBankLength = (G?.players?.[receiverId]?.bank || []).length;
    if (receiverBankLength >= tilesPerPlayer) return;
    if (String(receiverId) === String(playerID) && !canSelfPlay) return;
    if (selectedReceiverId === String(receiverId)) {
      setSelectedReceiverId('');
    } else {
      setSelectedReceiverId(String(receiverId));
    }
  };

  const handleResetTurn = () => {
    setSelectedTileId('');
    setSelectedReceiverId('');
    setStagedMoves([]);
    setSelectedPieceLoc('');
    setValidDestinations([]);
    if (G && G.boardState) {
      setTransientBoardState(JSON.parse(JSON.stringify(G.boardState)));
    }
    if (G && G.community) {
      setTransientCommunity(JSON.parse(JSON.stringify(G.community)));
    }
  };

  const handlePieceClick = (locKey) => {
    if (currentPhase !== 'campaign') return;

    if (G?.pendingPlay) {
      const activeP = getPendingPlayActivePlayer(G);
      if (activeP !== playerID) return;

      const step = G.pendingPlay.step;
      const currentBoard = transientBoardState || G.boardState;
      const piece = currentBoard[locKey];

      if (selectedPieceLoc === locKey) {
        setSelectedPieceLoc('');
        setValidDestinations([]);
        return;
      }

      if (!piece && !locKey.startsWith('community')) {
        setSelectedPieceLoc('');
        setValidDestinations([]);
        return;
      }

      const currentComm = transientCommunity || G.community;

      if (step === 'reexecute') {
        const tileId = G.pendingPlay.reexecuteTileId;
        const validTargets = getValidDestinations(
          locKey,
          playerID,
          currentBoard,
          currentComm,
          numPlayers,
          stagedMoves,
          tileId,
          true
        );
        setSelectedPieceLoc(locKey);
        setValidDestinations(validTargets);
        return;
      }

      if (step === 'penaltyWithdraw') {
        if (stagedMoves.length >= 1) return;
        const allTargets = getValidDestinations(locKey, playerID, currentBoard, currentComm, numPlayers, [], '');
        const withdrawTargets = allTargets.filter(toLoc => {
          const inferred = inferMoveType(locKey, toLoc, playerID, currentBoard, currentComm, numPlayers, [], '');
          return inferred === MOVE_TYPES.WITHDRAW;
        });
        setSelectedPieceLoc(locKey);
        setValidDestinations(withdrawTargets);
        return;
      }

      if (step === 'freeAdvance') {
        if (stagedMoves.length >= 1) return;
        const allTargets = getValidDestinations(locKey, playerID, currentBoard, currentComm, numPlayers, [], '');
        const advanceTargets = allTargets.filter(toLoc => {
          const inferred = inferMoveType(locKey, toLoc, playerID, currentBoard, currentComm, numPlayers, [], '');
          return inferred === MOVE_TYPES.ADVANCE;
        });
        setSelectedPieceLoc(locKey);
        setValidDestinations(advanceTargets);
        return;
      }

      return;
    }

    if (!isMyTurn) return;
    if (!selectedTileId) return;
    if (stagedMoves.length === 1 && stagedMoves[0].to === locKey) return;

    const currentBoard = transientBoardState || G.boardState;
    const piece = currentBoard[locKey];

    if (stagedMoves.length === 1 && piece && stagedMoves[0]?.pieceId && piece.id === stagedMoves[0].pieceId) return;
    if (stagedMoves.length === 1 && stagedMoves[0].to === locKey) return;

    if (selectedPieceLoc === locKey) {
      setSelectedPieceLoc('');
      setValidDestinations([]);
      return;
    }

    if (piece) {
      const currentComm = transientCommunity || G.community;
      if (locKey.startsWith('community_') && !isCommunityPieceAvailable(piece.type, currentBoard, currentComm, stagedMoves)) {
        return;
      }

      const validTargets = getValidDestinations(
        locKey,
        playerID,
        currentBoard,
        currentComm,
        numPlayers,
        stagedMoves,
        selectedTileId
      );
      setSelectedPieceLoc(locKey);
      setValidDestinations(validTargets);
    } else {
      setSelectedPieceLoc('');
      setValidDestinations([]);
    }
  };

  const handleDestinationClick = (toLoc) => {
    if (!selectedPieceLoc || !validDestinations.includes(toLoc)) return;

    const currentBoard = JSON.parse(JSON.stringify(transientBoardState || G.boardState));
    const currentComm = JSON.parse(JSON.stringify(transientCommunity || G.community));

    const isReexecuting = G?.pendingPlay?.step === 'reexecute';
    const tileContext = G?.pendingPlay ? (G.pendingPlay.reexecuteTileId || '') : selectedTileId;

    const inferredType = inferMoveType(
      selectedPieceLoc,
      toLoc,
      playerID,
      currentBoard,
      currentComm,
      numPlayers,
      stagedMoves,
      tileContext,
      isReexecuting
    );

    const normTo = toLoc.startsWith('community_') ? 'community' : toLoc;
    const pieceObj = currentBoard[selectedPieceLoc];

    const newMove = {
      type: inferredType,
      from: selectedPieceLoc,
      to: normTo,
      pieceId: pieceObj ? pieceObj.id : undefined
    };

    applyMoveToState(newMove, currentBoard, currentComm);

    setTransientBoardState(currentBoard);
    setTransientCommunity(currentComm);
    setStagedMoves([...stagedMoves, newMove]);

    setSelectedPieceLoc('');
    setValidDestinations([]);
  };

  const handleSubmitTurn = () => {
    if (!selectedTileId || !selectedReceiverId) return;

    if (isOnline) {
      executeOnlineCampaignTurn(
        G,
        playerID,
        { tileId: selectedTileId, receiverId: selectedReceiverId, moves: stagedMoves },
        updateMasterGameState
      );
    } else if (moves?.submitTurnMovesAndTile) {
      moves.submitTurnMovesAndTile({
        tileId: selectedTileId,
        receiverId: selectedReceiverId,
        moves: stagedMoves
      });
    }

    handleResetTurn();
  };

  return {
    selectedTileId,
    setSelectedTileId,
    selectedReceiverId,
    setSelectedReceiverId,
    stagedMoves,
    setStagedMoves,
    transientBoardState,
    transientCommunity,
    selectedPieceLoc,
    validDestinations,
    peekPendingTile,
    handleTogglePeekTile,
    canSelfPlay,
    handleSelectTile,
    handleSelectReceiver,
    handleResetTurn,
    handlePieceClick,
    handleDestinationClick,
    handleSubmitTurn
  };
}
