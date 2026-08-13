import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_PIECE_COUNTS } from './domain/types.js';
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
import { StateSaveLoadModal } from './components/board/StateSaveLoadModal.jsx';
import { getPendingPlayActivePlayer } from './domain/board.js';
import { useBureaucracyBoard } from './components/board/useBureaucracyBoard.js';
import { DraftPhaseCard } from './components/board/DraftPhaseCard.jsx';
import { executeOnlineDraftTileSelect } from './domain/phases/draftPhase.js';
import { BoardHeaderControls } from './components/board/BoardHeaderControls.jsx';
import { useOnlineGame } from './context/OnlineGameContext.jsx';
import {
  executeOnlineReexecute,
  executeOnlinePenaltyWithdraw,
  executeOnlineFreeAdvance
} from './domain/onlineEngine.js';
import { useBoardScale } from './hooks/useBoardScale.js';
import { useStagedMoves } from './hooks/useStagedMoves.js';

export function KredBoard({ G: rawG, ctx: rawCtx, moves, playerID, calibrationMode: propCalibrationMode, isOnline: propIsOnline = false, playerNames: propPlayerNames = [], dbMasterState: propDbMasterState = null, updateMasterGameState: propUpdateMasterGameState = null }) {
  const onlineCtx = useOnlineGame();
  const isOnline = onlineCtx.isOnline || propIsOnline;
  const dbMasterState = onlineCtx.dbMasterState || propDbMasterState;
  const updateMasterGameState = onlineCtx.updateMasterGameState || propUpdateMasterGameState;
  const playerNames = (onlineCtx.playerNames && onlineCtx.playerNames.length > 0) ? onlineCtx.playerNames : propPlayerNames;

  const G = (isOnline && dbMasterState) ? (dbMasterState.G || dbMasterState) : rawG;
  const ctx = (isOnline && dbMasterState) ? (dbMasterState.ctx || rawCtx) : rawCtx;

  const { zoomLevel, setZoomLevel, autoScale } = useBoardScale();
  const [autoDraftTileId, setAutoDraftTileId] = useState(null);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);

  const numPlayers = (ctx && ctx.numPlayers) || (G && G.numPlayers) || 3;
  const currentPhase = ctx?.phase || 'draft';
  const tilesPerPlayer = INITIAL_PIECE_COUNTS[numPlayers]?.TILES_PER_PLAYER || 8;

  const staged = useStagedMoves({
    G, ctx, playerID, moves, isOnline, updateMasterGameState, numPlayers, tilesPerPlayer, currentPhase
  });

  const bureaucracyBoard = useBureaucracyBoard({ G, ctx, playerID, moves, numPlayers, isOnline, updateMasterGameState });

  useEffect(() => {
    if (G && ctx && typeof window.onKredStateUpdate === 'function') {
      window.onKredStateUpdate({ G, ctx });
    }
  }, [G, ctx]);

  const baseHotspots = computeHotspots(numPlayers);
  const calibration = useCalibrationHandlers(numPlayers, propCalibrationMode, baseHotspots);

  const activeHotspots = {};
  for (const k in baseHotspots) {
    const base = baseHotspots[k];
    const cal = calibration.calibratedPositions[k] || {};
    const merged = { ...base, ...cal };
    let rotVal = merged.rot !== undefined ? Math.round((merged.rot + 360) % 360) : 0;
    let scaleVal = merged.scale !== undefined ? parseFloat(merged.scale.toFixed(2)) : 1.0;
    merged.rot = rotVal;
    merged.scale = scaleVal;
    merged.transform = `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`;
    activeHotspots[k] = merged;
  }

  const perspectiveRotation = getPerspectiveRotation(numPlayers, playerID);
  const isMyTurn = ctx && String(ctx.currentPlayer) === String(playerID);
  const myPlayer = (G && G.players && G.players[playerID]) || {};
  const hasDraftedThisRound = G?.draftSelectionsThisRound && G.draftSelectionsThisRound[playerID];

  const autoDraftingTileRef = useRef(null);
  const latestGRef = useRef(G);
  const latestUpdateRef = useRef(updateMasterGameState);
  const latestMovesRef = useRef(moves);

  useEffect(() => {
    latestGRef.current = G;
    latestUpdateRef.current = updateMasterGameState;
    latestMovesRef.current = moves;
  }, [G, updateMasterGameState, moves]);

  useEffect(() => {
    if (currentPhase === 'draft' && !hasDraftedThisRound) {
      const pack = G?.draftPacks?.[playerID] || [];
      if (pack.length === 1) {
        const autoTileId = pack[0];
        if (autoDraftingTileRef.current === autoTileId) return;
        autoDraftingTileRef.current = autoTileId;
        setAutoDraftTileId(autoTileId);

        const timer = setTimeout(() => {
          if (isOnline) {
            executeOnlineDraftTileSelect(latestGRef.current, playerID, autoTileId, latestUpdateRef.current);
          } else if (latestMovesRef.current?.selectDraftTile) {
            latestMovesRef.current.selectDraftTile(autoTileId);
          }
          setAutoDraftTileId(null);
          autoDraftingTileRef.current = null;
        }, 900);

        return () => {};
      }
    }
    autoDraftingTileRef.current = null;
    setAutoDraftTileId(null);
  }, [currentPhase, hasDraftedThisRound, G?.draftPacks?.[playerID]?.length, playerID, isOnline]);

  if (!G || !G.players || !ctx) {
    return <div className="kred-container">Loading game state...</div>;
  }

  const boardImageMap = { 3: '/images/KREDonline_3P.png', 4: '/images/4player_board.png', 5: '/images/KREDonline_5P.png' };
  const activeBoardImage = boardImageMap[numPlayers] || boardImageMap[3];
  const getPlayerLabel = (pIdx) => {
    if (pIdx === undefined || pIdx === null) return '';
    const idx = parseInt(pIdx, 10);
    if (Array.isArray(playerNames) && playerNames[idx]) return playerNames[idx];
    if (G?.playerNames && G.playerNames[idx]) return G.playerNames[idx];
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
        calibrationMode={calibration.calibrationMode}
        selectedCalibrateKeys={calibration.selectedCalibrateKeys}
        setSelectedCalibrateKeys={calibration.setSelectedCalibrateKeys}
        activeHotspots={activeHotspots}
        setCalibratedPositions={calibration.setCalibratedPositions}
        numPlayers={numPlayers}
        tilesPerPlayer={tilesPerPlayer}
        playerID={playerID}
        perspectiveOffsets={calibration.perspectiveOffsets}
        handleNudgePerspective={calibration.handleNudgePerspective}
        handleRotatePerspective={calibration.handleRotatePerspective}
        handleResetPerspectiveOffset={calibration.handleResetPerspectiveOffset}
        handleSaveDraft={calibration.handleSaveDraft}
        handleResetDraft={calibration.handleResetDraft}
        handleCopyCoordinates={calibration.handleCopyCoordinates}
        handleImportJson={calibration.handleImportJson}
        handleRotateSelectedSpots={calibration.handleRotateSelectedSpots}
        handleSetExactAngle={calibration.handleSetExactAngle}
        handleScaleSelectedSpots={calibration.handleScaleSelectedSpots}
        handleSetExactScale={calibration.handleSetExactScale}
        angleInput={calibration.angleInput}
        setAngleInput={calibration.setAngleInput}
        scaleInput={calibration.scaleInput}
        setScaleInput={calibration.setScaleInput}
        draftSavedMsg={calibration.draftSavedMsg}
        copiedJson={calibration.copiedJson}
        showSpotLabels={calibration.showSpotLabels}
        setShowSpotLabels={calibration.setShowSpotLabels}
        handleNudgeSelectedSpotsPixels={calibration.handleNudgeSelectedSpotsPixels}
        handleRotateSelectedSpotsAroundCenter={calibration.handleRotateSelectedSpotsAroundCenter}
      />

      <div className="kred-layout" style={{ zoom: zoomLevel }}>
        <div className="domains-section">
          <BoardZoomControls zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} style={{ zoom: 1 / zoomLevel }} />
          <div className="board-canvas-card">
            <SvgBoardCanvas
              activeBoardImage={activeBoardImage}
              numPlayers={numPlayers}
              activeHotspots={activeHotspots}
              calibrationMode={calibration.calibrationMode}
              selectedCalibrateKeys={calibration.selectedCalibrateKeys}
              setSelectedCalibrateKeys={calibration.setSelectedCalibrateKeys}
              handleBoardMouseMove={calibration.handleBoardMouseMove}
              handleBoardMouseUp={calibration.handleBoardMouseUp}
              handleBoardMouseDown={calibration.handleBoardMouseDown}
              handleRotateSelectedSpots={calibration.handleRotateSelectedSpots}
              G={G}
              showSpotLabels={calibration.showSpotLabels}
              perspectiveRotation={perspectiveRotation}
              playerID={playerID}
              perspectiveOffsets={calibration.perspectiveOffsets}
              selectedReceiverId={staged.selectedReceiverId}
              selectedTileId={staged.selectedTileId}
              onSelectReceiver={staged.handleSelectReceiver}
              canSelfPlay={staged.canSelfPlay}
              validDestinations={(currentPhase === 'bureaucracy' || (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))) ? bureaucracyBoard.moveValidDestinations : staged.validDestinations}
              selectedPieceLoc={(currentPhase === 'bureaucracy' || (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))) ? bureaucracyBoard.moveFromLoc : staged.selectedPieceLoc}
              stagedMoves={staged.stagedMoves}
              onPieceClick={(currentPhase === 'bureaucracy' || (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))) ? bureaucracyBoard.handleBureaucracySpotClick : staged.handlePieceClick}
              onDestinationClick={(currentPhase === 'bureaucracy' || (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))) ? bureaucracyBoard.handleBureaucracyDestinationClick : staged.handleDestinationClick}
              transientBoardState={staged.transientBoardState}
              zoomLevel={zoomLevel * autoScale}
              peekPendingTile={staged.peekPendingTile}
              onTogglePeekTile={staged.handleTogglePeekTile}
              validPromotionSpots={(currentPhase === 'bureaucracy' || (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))) ? bureaucracyBoard.validPromotionSpots : []}
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
              {(G?.pendingPlay || G?.lastOutcomeNotice) && !showTurnBuilderForPending && (
                <PendingPlayModal
                  G={G}
                  playerID={playerID}
                  moves={moves}
                  getPlayerLabel={getPlayerLabel}
                  peekPendingTile={staged.peekPendingTile}
                  onTogglePeekTile={staged.handleTogglePeekTile}
                  isOnline={isOnline}
                  updateMasterGameState={updateMasterGameState}
                />
              )}

              {G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId) && (
                <BureaucracyPanel
                  myPlayer={myPlayer}
                  isMyTurn={true}
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
              )}

              <OpponentHandSummary G={G} playerID={playerID} numPlayers={numPlayers} getPlayerLabel={getPlayerLabel} />

              {(!G?.pendingPlay || showTurnBuilderForPending) && (
                <PlayerHandDrawer
                  myPlayer={myPlayer}
                  selectedTileId={staged.selectedTileId}
                  onSelectTile={staged.handleSelectTile}
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
                  selectedTileId={isReexecutingMe ? G.pendingPlay.reexecuteTileId : staged.selectedTileId}
                  selectedReceiverId={isReexecutingMe ? G.pendingPlay.receiverId : staged.selectedReceiverId}
                  stagedMoves={staged.stagedMoves}
                  handleResetTurn={staged.handleResetTurn}
                  handleSubmitTurn={
                    isReexecutingMe
                      ? () => isOnline ? executeOnlineReexecute(G, playerID, staged.stagedMoves, updateMasterGameState) : moves?.reexecuteHonestly(staged.stagedMoves)
                      : isPenaltyWithdrawMe
                      ? () => isOnline ? executeOnlinePenaltyWithdraw(G, playerID, staged.stagedMoves[0], updateMasterGameState) : moves?.executePenaltyWithdraw(staged.stagedMoves[0])
                      : isFreeAdvanceMe
                      ? () => isOnline ? executeOnlineFreeAdvance(G, playerID, staged.stagedMoves[0], updateMasterGameState) : moves?.executeFreeAdvance(staged.stagedMoves[0])
                      : staged.handleSubmitTurn
                  }
                  isMyTurn={showTurnBuilderForPending || isMyTurn}
                  getPlayerLabel={getPlayerLabel}
                  isReexecuting={isReexecutingMe}
                  isPenaltyWithdraw={isPenaltyWithdrawMe}
                  isFreeAdvance={isFreeAdvanceMe}
                  playerID={playerID}
                  boardState={staged.transientBoardState || G.boardState}
                  community={staged.transientCommunity || G.community}
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
        onResetTransientState={staged.handleResetTurn}
      />
    </div>
  );
}
