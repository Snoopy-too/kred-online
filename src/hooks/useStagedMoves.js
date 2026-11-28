import { useState, useEffect } from 'react';
import { MOVE_TYPES } from '../domain/types.js';
import { getValidDestinations, inferMoveType } from '../domain/moveRulesUtils.js';
import { applyMoveToState, classifyPlay, isCommunityPieceAvailable } from '../domain/moves.js';
import { getPendingPlayActivePlayer, getValidReceivers } from '../domain/board.js';

export function useStagedMoves({ G, ctx, playerID, moves, numPlayers, currentPhase, expertMode = false }) {
  const [selectedTileId, setSelectedTileId] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [stagedMoves, setStagedMoves] = useState([]);
  const [transientBoardState, setTransientBoardState] = useState(null);
  const [transientCommunity, setTransientCommunity] = useState(null);
  const [selectedPieceLoc, setSelectedPieceLoc] = useState('');
  const [validDestinations, setValidDestinations] = useState([]);
  const [peekPendingTile, setPeekPendingTile] = useState(false);

  const isMyTurn = ctx && String(ctx.currentPlayer) === String(playerID);
  const isExpertLive = Boolean(expertMode && currentPhase === 'campaign' && !G?.pendingPlay && !G?.pendingSupport);
  const myLiveTurn = isExpertLive && G?.liveTurn && String(G.liveTurn.moverId) === String(playerID) ? G.liveTurn : null;
  const activeStagedMoves = isExpertLive ? (myLiveTurn?.moves || []) : stagedMoves;
  const activeReceiverId = isExpertLive ? '' : selectedReceiverId;
  const activeTileId = selectedTileId;

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

  // Valid receivers per rule: must have a tile to continue with unless it's the last tile of the campaign
  const validReceivers = getValidReceivers(G, playerID);
  const canSelfPlay = validReceivers.includes(String(playerID));

  const handleSelectTile = (tileId) => {
    if (!isMyTurn || currentPhase !== 'campaign') return;
    if (expertMode && activeReceiverId) return;
    if (selectedTileId === tileId) {
      setSelectedTileId('');
    } else {
      setSelectedTileId(tileId);
    }
  };

  const handleSelectReceiver = (receiverId) => {
    if (!isMyTurn || currentPhase !== 'campaign' || !activeTileId) return;
    if (!validReceivers.includes(String(receiverId))) return;
    if (isExpertLive) {
      if (activeReceiverId) return;
      moves?.commitExpertTileDrop?.({ tileId: activeTileId, receiverId: String(receiverId) });
      setSelectedTileId('');
      return;
    }
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
      if (String(activeP) !== String(playerID)) return;

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
        setSelectedPieceLoc(validTargets.length > 0 ? locKey : '');
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
        setSelectedPieceLoc(withdrawTargets.length > 0 ? locKey : '');
        setValidDestinations(withdrawTargets);
        return;
      }

      if (step === 'freeAdvance' || step === 'receiverReward') {
        if (stagedMoves.length >= 1) return;
        const allTargets = getValidDestinations(locKey, playerID, currentBoard, currentComm, numPlayers, [], '');
        const advanceTargets = allTargets.filter(toLoc => {
          const inferred = inferMoveType(locKey, toLoc, playerID, currentBoard, currentComm, numPlayers, [], '');
          return inferred === MOVE_TYPES.ADVANCE;
        });
        setSelectedPieceLoc(advanceTargets.length > 0 ? locKey : '');
        setValidDestinations(advanceTargets);
        return;
      }

      return;
    }

    if (!isMyTurn) return;
    if (activeStagedMoves.length === 1 && activeStagedMoves[0].to === locKey) return;

    const currentBoard = (isExpertLive ? G.boardState : transientBoardState) || G.boardState;
    const piece = currentBoard[locKey];

    if (activeStagedMoves.length === 1 && piece && activeStagedMoves[0]?.pieceId && piece.id === activeStagedMoves[0].pieceId) return;
    if (activeStagedMoves.length === 1 && activeStagedMoves[0].to === locKey) return;

    if (selectedPieceLoc === locKey) {
      setSelectedPieceLoc('');
      setValidDestinations([]);
      return;
    }

    if (piece) {
      const currentComm = (isExpertLive ? G.community : transientCommunity) || G.community;
      if (locKey.startsWith('community_') && !isCommunityPieceAvailable(piece.type, currentBoard, currentComm, activeStagedMoves)) {
        return;
      }

      const validTargets = getValidDestinations(
        locKey,
        playerID,
        currentBoard,
        currentComm,
        numPlayers,
        activeStagedMoves,
        activeTileId
      );
      setSelectedPieceLoc(locKey);
      setValidDestinations(validTargets);
    } else {
      setSelectedPieceLoc('');
      setValidDestinations([]);
    }
  };

  const handleDestinationClick = (toLoc) => {
    const isCommValid = toLoc.startsWith('community_') && validDestinations.some(d => d === 'community' || d.startsWith('community_'));
    if (!selectedPieceLoc || (!validDestinations.includes(toLoc) && !isCommValid)) return;

    const currentBoard = JSON.parse(JSON.stringify((isExpertLive ? G.boardState : transientBoardState) || G.boardState));
    const currentComm = JSON.parse(JSON.stringify((isExpertLive ? G.community : transientCommunity) || G.community));

    const isReexecuting = G?.pendingPlay?.step === 'reexecute';
    const tileContext = G?.pendingPlay ? (G.pendingPlay.reexecuteTileId || '') : activeTileId;

    const inferredType = inferMoveType(
      selectedPieceLoc,
      toLoc,
      playerID,
      currentBoard,
      currentComm,
      numPlayers,
      activeStagedMoves,
      tileContext,
      isReexecuting
    );

    const pieceObj = currentBoard[selectedPieceLoc];

    const newMove = {
      type: inferredType,
      from: selectedPieceLoc,
      to: toLoc,
      pieceId: pieceObj ? pieceObj.id : undefined
    };

    if (isExpertLive) {
      moves?.commitExpertMove?.(newMove);
      setSelectedPieceLoc('');
      setValidDestinations([]);
      return;
    }

    const isFreeAdvanceStep = G?.pendingPlay?.step === 'freeAdvance' || G?.pendingPlay?.step === 'receiverReward';
    if (expertMode && isFreeAdvanceStep) {
      moves?.executeFreeAdvance?.(newMove);
      handleResetTurn();
      return;
    }

    if (isReexecuting) {
      const nextMoves = [...stagedMoves, newMove];
      if (classifyPlay(nextMoves, tileContext, playerID, G.boardState, G.community, numPlayers) === 'Honest') {
        moves?.reexecuteHonestly?.(nextMoves);
        handleResetTurn();
        return;
      }
    }

    applyMoveToState(newMove, currentBoard, currentComm);

    setTransientBoardState(currentBoard);
    setTransientCommunity(currentComm);
    setStagedMoves([...stagedMoves, newMove]);

    setSelectedPieceLoc('');
    setValidDestinations([]);
  };

  const handleSubmitTurn = () => {
    if (!activeTileId || !activeReceiverId) return;

    if (moves?.submitTurnMovesAndTile) {
      moves.submitTurnMovesAndTile({
        tileId: activeTileId,
        receiverId: activeReceiverId,
        moves: activeStagedMoves
      });
    }

    handleResetTurn();
  };

  return {
    selectedTileId: activeTileId,
    setSelectedTileId,
    selectedReceiverId: activeReceiverId,
    setSelectedReceiverId,
    stagedMoves: activeStagedMoves,
    setStagedMoves,
    transientBoardState: isExpertLive ? null : transientBoardState,
    transientCommunity,
    selectedPieceLoc,
    validDestinations,
    peekPendingTile,
    handleTogglePeekTile,
    canSelfPlay,
    validReceivers,
    handleSelectTile,
    handleSelectReceiver,
    handleResetTurn,
    handlePieceClick,
    handleDestinationClick,
    handleSubmitTurn
  };
}
