import React, { useState, useEffect } from 'react';
import { MOVE_TYPES, INITIAL_PIECE_COUNTS } from './domain/types.js';
import { computeHotspots } from './components/ComputeHotspots.js';
import { TurnBuilder } from './components/TurnBuilder.jsx';
import { BureaucracyPanel } from './components/BureaucracyPanel.jsx';
import { PendingPlayModal } from './components/PendingPlayModal.jsx';
import { BoardCalibrationToolbar } from './components/board/BoardCalibrationToolbar.jsx';
import { SvgBoardCanvas } from './components/board/SvgBoardCanvas.jsx';
import { BoardZoomControls } from './components/board/BoardZoomControls.jsx';
import { PlayerHandDrawer } from './components/board/PlayerHandDrawer.jsx';
import { OpponentHandSummary } from './components/board/OpponentHandSummary.jsx';
import { useCalibrationHandlers } from './components/board/useCalibrationHandlers.js';
import { getPerspectiveRotation } from './components/board/perspectiveUtils.js';
import { getValidDestinations, inferMoveType } from './domain/moveRulesUtils.js';
import { applyMoveToState, isCommunityPieceAvailable } from './domain/moves.js';
import { StateSaveLoadModal } from './components/board/StateSaveLoadModal.jsx';
import { getPendingPlayActivePlayer } from './domain/board.js';
import { useBureaucracyBoard } from './components/board/useBureaucracyBoard.js';
import { DraftPhaseCard } from './components/board/DraftPhaseCard.jsx';
import { executeOnlineDraftTileSelect } from './domain/phases/draftPhase.js';
import { BoardHeaderControls } from './components/board/BoardHeaderControls.jsx';
import {
  executeOnlineCampaignTurn,
  executeOnlineReexecute,
  executeOnlinePenaltyWithdraw,
  executeOnlineFreeAdvance
} from './domain/onlineEngine.js';

export function KredBoard({ G: rawG, ctx: rawCtx, moves, playerID, calibrationMode: propCalibrationMode, isOnline = false, playerNames = [], dbMasterState = null, updateMasterGameState = null }) {
  const G = (isOnline && dbMasterState && dbMasterState.G) ? dbMasterState.G : rawG;
  const ctx = (isOnline && dbMasterState && dbMasterState.ctx) ? dbMasterState.ctx : rawCtx;
  // Move builder & interactive state
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [autoScale, setAutoScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // 1200px is the reference width for the layout.
      // Cap max scale at 1.4 to prevent huge UI elements on ultra-wide screens.
      const calculatedScale = Math.min(1.4, width / 1200);
      setAutoScale(calculatedScale);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedTileId, setSelectedTileId] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [stagedMoves, setStagedMoves] = useState([]);
  const [transientBoardState, setTransientBoardState] = useState(null);
  const [transientCommunity, setTransientCommunity] = useState(null);
  const [selectedPieceLoc, setSelectedPieceLoc] = useState('');
  const [validDestinations, setValidDestinations] = useState([]);
  const [peekPendingTile, setPeekPendingTile] = useState(false);
  const [autoDraftTileId, setAutoDraftTileId] = useState(null);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);

  const handleTogglePeekTile = () => {
    setPeekPendingTile(prev => !prev);
  };

  // Legacy compatibility states
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [selectedBureaucracyTarget, setSelectedBureaucracyTarget] = useState('');
  const [bureaucracySubActionType, setBureaucracySubActionType] = useState(MOVE_TYPES.ADVANCE);

  const numPlayers = (ctx && ctx.numPlayers) || (G && G.numPlayers) || 3;
  const bureaucracyBoard = useBureaucracyBoard({ G, ctx, playerID, moves, numPlayers });

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

  // Broadcast game state to App level for perspective tab indicators
  useEffect(() => {
    if (G && ctx && typeof window.onKredStateUpdate === 'function') {
      window.onKredStateUpdate({ G, ctx });
    }
  }, [G, ctx]);


  // Hotspots computation
  const baseHotspots = computeHotspots(numPlayers);

  // Calibration handlers & state hook
  const {
    calibrationMode,
    showSpotLabels,
    setShowSpotLabels,
    calibratedPositions,
    setCalibratedPositions,
    selectedCalibrateKeys,
    setSelectedCalibrateKeys,
    angleInput,
    setAngleInput,
    scaleInput,
    setScaleInput,
    perspectiveOffsets,
    handleNudgePerspective,
    handleRotatePerspective,
    handleResetPerspectiveOffset,
    copiedJson,
    draftSavedMsg,
    handleSaveDraft,
    handleResetDraft,
    handleCopyCoordinates,
    handleImportJson,
    handleRotateSelectedSpots,
    handleSetExactAngle,
    handleScaleSelectedSpots,
    handleSetExactScale,
    handleBoardMouseDown,
    handleBoardMouseMove,
    handleBoardMouseUp,
    handleNudgeSelectedSpotsPixels,
    handleRotateSelectedSpotsAroundCenter
  } = useCalibrationHandlers(numPlayers, propCalibrationMode, baseHotspots);

  const tilesPerPlayer = INITIAL_PIECE_COUNTS[numPlayers]?.TILES_PER_PLAYER || 8;

  const activeHotspots = {};
  for (const k in baseHotspots) {
    const base = baseHotspots[k];
    const cal = calibratedPositions[k] || {};
    const merged = { ...base, ...cal };
    let rotVal = merged.rot !== undefined ? Math.round((merged.rot + 360) % 360) : 0;
    let scaleVal = merged.scale !== undefined ? parseFloat(merged.scale.toFixed(2)) : 1.0;
    merged.rot = rotVal;
    merged.scale = scaleVal;
    merged.transform = `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`;
    activeHotspots[k] = merged;
  }

  // ponytail: preserve player perspective rotation in calibration mode to prevent board rotation jumps
  const perspectiveRotation = getPerspectiveRotation(numPlayers, playerID);

  const isMyTurn = ctx && String(ctx.currentPlayer) === String(playerID);
  const myPlayer = (G && G.players && G.players[playerID]) || {};
  const currentPhase = ctx?.phase || 'draft';
  const hasDraftedThisRound = G?.draftSelectionsThisRound && G.draftSelectionsThisRound[playerID];

  // Auto-float and select final tile if only 1 tile remains in draft pack
  useEffect(() => {
    if (currentPhase === 'draft' && !hasDraftedThisRound) {
      const pack = G?.draftPacks?.[playerID] || [];
      if (pack.length === 1) {
        const autoTileId = pack[0];
        setAutoDraftTileId(autoTileId);
        const timer = setTimeout(() => {
          if (isOnline) {
            executeOnlineDraftTileSelect(G, playerID, autoTileId, updateMasterGameState);
          } else if (moves?.selectDraftTile) {
            moves.selectDraftTile(autoTileId);
          }
          setAutoDraftTileId(null);
        }, 900);
        return () => clearTimeout(timer);
      }
    }
    setAutoDraftTileId(null);
  }, [currentPhase, hasDraftedThisRound, G?.draftPacks?.[playerID], playerID, isOnline, G, updateMasterGameState, moves]);

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

  // Tile & Receiver Selection Handlers
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
    if (receiverBankLength >= tilesPerPlayer) return; // Cannot play to a player whose bank is full!
    if (String(receiverId) === String(playerID) && !canSelfPlay) return;
    if (selectedReceiverId === String(receiverId)) {
      setSelectedReceiverId('');
    } else {
      setSelectedReceiverId(String(receiverId));
    }
  };

  // Reset Turn Handler - restores staged selections and board state
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

  // Click Piece Handler -> Calculate legal green throbbing destination circles
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
    if (!selectedTileId || !selectedReceiverId) return; // Must pick tile & drop zone first
    if (stagedMoves.length === 1 && stagedMoves[0].to === locKey) {
      return; // A piece may only move ONCE per turn
    }

    const currentBoard = transientBoardState || G.boardState;
    const piece = currentBoard[locKey];

    if (stagedMoves.length === 1 && piece && stagedMoves[0]?.pieceId && piece.id === stagedMoves[0].pieceId) {
      return; // A piece may only move ONCE per turn
    }
    if (stagedMoves.length === 1 && stagedMoves[0].to === locKey) {
      return; // A piece may only move ONCE per turn
    }

    if (selectedPieceLoc === locKey) {
      setSelectedPieceLoc('');
      setValidDestinations([]);
      return;
    }

    if (piece) {
      const currentComm = transientCommunity || G.community;
      if (locKey.startsWith('community_') && !isCommunityPieceAvailable(piece.type, currentBoard, currentComm, stagedMoves)) {
        return; // Locked until lower-tier community pieces are depleted
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

  // Click Pulsing Green Circle Handler -> Execute board move
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

  // Finish Turn Handler -> Submit to boardgame.io / Supabase Master State
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


  if (!G || !G.players || !ctx) {
    return <div className="kred-container">Loading game state...</div>;
  }

  const boardImageMap = {
    3: '/images/KREDonline_3P.png',
    4: '/images/4player_board.png',
    5: '/images/KREDonline_5P.png'
  };
  const activeBoardImage = boardImageMap[numPlayers] || boardImageMap[3];
  const getPlayerLabel = (pIdx) => {
    if (pIdx === undefined || pIdx === null) return '';
    const idx = parseInt(pIdx, 10);
    if (Array.isArray(playerNames) && playerNames[idx]) {
      return playerNames[idx];
    }
    if (G?.playerNames && G.playerNames[idx]) {
      return G.playerNames[idx];
    }
    return `Player ${idx + 1}`;
  };
  const activePendingPlayer = getPendingPlayActivePlayer(G);
  const isPendingActiveMe = G?.pendingPlay && String(activePendingPlayer) === String(playerID);
  const pendingStep = G?.pendingPlay?.step;

  const isReexecutingMe = isPendingActiveMe && pendingStep === 'reexecute';
  const isPenaltyWithdrawMe = isPendingActiveMe && pendingStep === 'penaltyWithdraw';
  const isFreeAdvanceMe = isPendingActiveMe && pendingStep === 'freeAdvance';

  const showTurnBuilderForPending = isReexecutingMe || isPenaltyWithdrawMe || isFreeAdvanceMe;

  return (
    <div className="kred-container" style={{ zoom: autoScale }}>
      <BoardHeaderControls
        currentPhase={currentPhase}
        ctx={ctx}
        playerID={playerID}
        getPlayerLabel={getPlayerLabel}
        isOnline={isOnline}
        setShowSaveLoadModal={setShowSaveLoadModal}
      />

      {G.winner && (
        <div className="winner-banner">
          🎉 {getPlayerLabel(G.winner).toUpperCase()} HAS WON THE GAME! 🎉
        </div>
      )}

      <BoardCalibrationToolbar
        calibrationMode={calibrationMode}
        selectedCalibrateKeys={selectedCalibrateKeys}
        setSelectedCalibrateKeys={setSelectedCalibrateKeys}
        activeHotspots={activeHotspots}
        setCalibratedPositions={setCalibratedPositions}
        numPlayers={numPlayers}
        tilesPerPlayer={tilesPerPlayer}
        playerID={playerID}
        perspectiveOffsets={perspectiveOffsets}
        handleNudgePerspective={handleNudgePerspective}
        handleRotatePerspective={handleRotatePerspective}
        handleResetPerspectiveOffset={handleResetPerspectiveOffset}
        handleSaveDraft={handleSaveDraft}
        handleResetDraft={handleResetDraft}
        handleCopyCoordinates={handleCopyCoordinates}
        handleImportJson={handleImportJson}
        handleRotateSelectedSpots={handleRotateSelectedSpots}
        handleSetExactAngle={handleSetExactAngle}
        handleScaleSelectedSpots={handleScaleSelectedSpots}
        handleSetExactScale={handleSetExactScale}
        angleInput={angleInput}
        setAngleInput={setAngleInput}
        scaleInput={scaleInput}
        setScaleInput={setScaleInput}
        draftSavedMsg={draftSavedMsg}
        copiedJson={copiedJson}
        showSpotLabels={showSpotLabels}
        setShowSpotLabels={setShowSpotLabels}
        handleNudgeSelectedSpotsPixels={handleNudgeSelectedSpotsPixels}
        handleRotateSelectedSpotsAroundCenter={handleRotateSelectedSpotsAroundCenter}
      />

      <div className="kred-layout" style={{ zoom: zoomLevel }}>
        <div className="domains-section">
          <BoardZoomControls
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            style={{ zoom: 1 / zoomLevel }}
          />
          <div className="board-canvas-card">
            <SvgBoardCanvas
              activeBoardImage={activeBoardImage}
              numPlayers={numPlayers}
              activeHotspots={activeHotspots}
              calibrationMode={calibrationMode}
              selectedCalibrateKeys={selectedCalibrateKeys}
              setSelectedCalibrateKeys={setSelectedCalibrateKeys}
              handleBoardMouseMove={handleBoardMouseMove}
              handleBoardMouseUp={handleBoardMouseUp}
              handleBoardMouseDown={handleBoardMouseDown}
              handleRotateSelectedSpots={handleRotateSelectedSpots}
              G={G}
              showSpotLabels={showSpotLabels}
              perspectiveRotation={perspectiveRotation}
              playerID={playerID}
              perspectiveOffsets={perspectiveOffsets}
              selectedReceiverId={selectedReceiverId}
              selectedTileId={selectedTileId}
              onSelectReceiver={handleSelectReceiver}
              canSelfPlay={canSelfPlay}
              validDestinations={currentPhase === 'bureaucracy' ? bureaucracyBoard.moveValidDestinations : validDestinations}
              selectedPieceLoc={currentPhase === 'bureaucracy' ? bureaucracyBoard.moveFromLoc : selectedPieceLoc}
              stagedMoves={stagedMoves}
              onPieceClick={currentPhase === 'bureaucracy' ? bureaucracyBoard.handleBureaucracySpotClick : handlePieceClick}
              onDestinationClick={currentPhase === 'bureaucracy' ? bureaucracyBoard.handleBureaucracyDestinationClick : handleDestinationClick}
              transientBoardState={transientBoardState}
              zoomLevel={zoomLevel * autoScale}
              peekPendingTile={peekPendingTile}
              onTogglePeekTile={handleTogglePeekTile}
              validPromotionSpots={currentPhase === 'bureaucracy' ? bureaucracyBoard.validPromotionSpots : []}
              getPlayerLabel={getPlayerLabel}
            />
          </div>
        </div>

        <div className="controls-sidebar">
          {currentPhase === 'bureaucracy' ? (
            <BureaucracyPanel
              myPlayer={myPlayer}
              isMyTurn={isMyTurn}
              moves={moves}
              numPlayers={numPlayers}
              getPlayerLabel={getPlayerLabel}
              ctx={ctx}
              selectedShopItem={bureaucracyBoard.selectedShopItem}
              handleSelectShopItem={bureaucracyBoard.handleSelectShopItem}
              selectedActionType={bureaucracyBoard.selectedActionType}
              setSelectedActionType={bureaucracyBoard.setSelectedActionType}
              moveFromLoc={bureaucracyBoard.moveFromLoc}
              validPromotionSpots={bureaucracyBoard.validPromotionSpots}
              G={G}
              playerID={playerID}
              isOnline={isOnline}
              updateMasterGameState={updateMasterGameState}
            />
          ) : (
            <>
              {/* Top of Sidebar: Pending Play modal for status/receipt/challenge */}
              {G?.pendingPlay && !showTurnBuilderForPending && (
                <PendingPlayModal
                  G={G}
                  playerID={playerID}
                  moves={moves}
                  getPlayerLabel={getPlayerLabel}
                  peekPendingTile={peekPendingTile}
                  onTogglePeekTile={handleTogglePeekTile}
                  isOnline={isOnline}
                  updateMasterGameState={updateMasterGameState}
                />
              )}

              {/* Opponent Hand Summary Module */}
              <OpponentHandSummary
                G={G}
                playerID={playerID}
                numPlayers={numPlayers}
                getPlayerLabel={getPlayerLabel}
              />

              {/* Player Hand Drawer */}
              {(!G?.pendingPlay || showTurnBuilderForPending) && (
                <PlayerHandDrawer
                  myPlayer={myPlayer}
                  selectedTileId={selectedTileId}
                  onSelectTile={handleSelectTile}
                  disabled={!isMyTurn || currentPhase !== 'campaign' || Boolean(G?.pendingPlay)}
                />
              )}

              {currentPhase === 'draft' && (
                <DraftPhaseCard
                  G={G}
                  playerID={playerID}
                  moves={moves}
                  hasDraftedThisRound={hasDraftedThisRound}
                  autoDraftTileId={autoDraftTileId}
                  isOnline={isOnline}
                  updateMasterGameState={updateMasterGameState}
                />
              )}

              {currentPhase === 'campaign' && (!G?.pendingPlay || showTurnBuilderForPending) && (
                <TurnBuilder
                  selectedTileId={isReexecutingMe ? G.pendingPlay.reexecuteTileId : selectedTileId}
                  selectedReceiverId={isReexecutingMe ? G.pendingPlay.receiverId : selectedReceiverId}
                  stagedMoves={stagedMoves}
                  handleResetTurn={handleResetTurn}
                  handleSubmitTurn={
                    isReexecutingMe
                      ? () => isOnline ? executeOnlineReexecute(G, playerID, stagedMoves, updateMasterGameState) : moves?.reexecuteHonestly(stagedMoves)
                      : isPenaltyWithdrawMe
                      ? () => isOnline ? executeOnlinePenaltyWithdraw(G, playerID, stagedMoves[0], updateMasterGameState) : moves?.executePenaltyWithdraw(stagedMoves[0])
                      : isFreeAdvanceMe
                      ? () => isOnline ? executeOnlineFreeAdvance(G, playerID, stagedMoves[0], updateMasterGameState) : moves?.executeFreeAdvance(stagedMoves[0])
                      : handleSubmitTurn
                  }
                  isMyTurn={showTurnBuilderForPending || isMyTurn}
                  getPlayerLabel={getPlayerLabel}
                  isReexecuting={isReexecutingMe}
                  isPenaltyWithdraw={isPenaltyWithdrawMe}
                  isFreeAdvance={isFreeAdvanceMe}
                  playerID={playerID}
                  boardState={transientBoardState || G.boardState}
                  community={transientCommunity || G.community}
                  numPlayers={numPlayers}
                />
              )}
            </>
          )}
        </div>
      </div>

      <StateSaveLoadModal
        G={G}
        ctx={ctx}
        moves={moves}
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        onResetTransientState={handleResetTurn}
      />
    </div>
  );
}

