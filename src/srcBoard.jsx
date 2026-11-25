import React, { useState, useEffect, useRef, useMemo } from 'react';
import { expandBoardSnapshot } from './domain/gameLog.js';
import { INITIAL_PIECE_COUNTS } from './domain/types.js';
import { computeHotspots } from './components/ComputeHotspots.js';
import { TurnBuilder } from './components/TurnBuilder.jsx';
import { BureaucracyPanel } from './components/BureaucracyPanel.jsx';
import { PendingPlayModal } from './components/PendingPlayModal.jsx';
import { BoardCalibrationToolbar } from './components/board/BoardCalibrationToolbar.jsx';
import { SvgBoardCanvas } from './components/board/SvgBoardCanvas.jsx';
import { HandsPanel } from './components/board/HandsPanel.jsx';
import { GameLogPanel } from './components/board/GameLogPanel.jsx';
import { MatchStatsCard } from './components/board/MatchStatsCard.jsx';
import { SupportDropCard } from './components/board/SupportDropCard.jsx';
import { OutcomeNoticeCard, isSupportedOutcomeNotice } from './components/board/OutcomeNoticeCard.jsx';
import { useCalibrationHandlers } from './components/board/useCalibrationHandlers.js';
import { getPerspectiveRotation } from './components/board/perspectiveUtils.js';
import { StateSaveLoadModal } from './components/board/StateSaveLoadModal.jsx';
import { getPendingPlayActivePlayer } from './domain/board.js';
import { useBureaucracyBoard } from './components/board/useBureaucracyBoard.js';
import { DraftPhaseCard } from './components/board/DraftPhaseCard.jsx';
import { executeOnlineDraftTileSelect } from './domain/phases/draftPhase.js';
import { BoardHeaderControls } from './components/board/BoardHeaderControls.jsx';
import { getBoardImageUrl } from './utils/assets.js';
import {
  executeOnlineReexecute,
  executeOnlinePenaltyWithdraw,
  executeOnlineFreeAdvance
} from './domain/onlineEngine.js';
import { useBoardScale } from './hooks/useBoardScale.js';
import { useStagedMoves } from './hooks/useStagedMoves.js';
import { useTurnReplayAnimation } from './components/board/useTurnReplayAnimation.js';

export function KredBoard({ G: rawG, ctx: rawCtx, moves, playerID, calibrationMode: propCalibrationMode, isOnline = false, isSolo = false, isAdmin = false, showDiagnostics = false, onToggleDiagnostics = null, onToggleCalibration = null, botIds = [], botStatus = null, playerNames = [], dbMasterState = null, updateMasterGameState = null }) {
  const G = (isOnline && dbMasterState) ? (dbMasterState.G || dbMasterState) : rawG;
  const ctx = (isOnline && dbMasterState) ? (dbMasterState.ctx || rawCtx) : rawCtx;

  const { zoomLevel, autoScale } = useBoardScale();
  const [boardZoom, setBoardZoom] = useState(1);
  const [boardPan, setBoardPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef(null);
  const [autoDraftTileId, setAutoDraftTileId] = useState(null);
  const [dismissedOutcomeKey, setDismissedOutcomeKey] = useState('');
  const [peekingHistoryId, setPeekingHistoryId] = useState(null);
  const peekingBoardState = useMemo(() => {
    const entry = peekingHistoryId !== null ? (G?.history || []).find((e) => e.id === peekingHistoryId) : null;
    return entry?.snap ? expandBoardSnapshot(entry.snap, G?.boardState) : null;
  }, [peekingHistoryId, G?.history, G?.boardState]);

  const outcomeNotice = isSupportedOutcomeNotice(G?.lastOutcomeNotice) ? G.lastOutcomeNotice : null;
  const outcomeNoticeKey = outcomeNotice
    ? `${outcomeNotice.type}:${outcomeNotice.moverId}:${outcomeNotice.receiverId}:${outcomeNotice.tileIdPlayed}:${outcomeNotice.challengerId ?? ''}`
    : '';

  useEffect(() => {
    if (!outcomeNoticeKey) {
      setDismissedOutcomeKey('');
      return undefined;
    }
    const timer = setTimeout(() => {
      setDismissedOutcomeKey(outcomeNoticeKey);
    }, 4000);
    return () => clearTimeout(timer);
  }, [outcomeNoticeKey]);

  useEffect(() => {
    const handleMove = (e) => {
      const start = panStartRef.current;
      if (!start) return;
      const scale = (zoomLevel * autoScale) || 1;
      setBoardPan({
        x: start.originX + (e.clientX - start.clientX) / scale,
        y: start.originY + (e.clientY - start.clientY) / scale
      });
    };
    const handleUp = () => {
      if (!panStartRef.current) return;
      panStartRef.current = null;
      setIsPanning(false);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [zoomLevel, autoScale]);

  const handleBoardPanStart = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (calibration.calibrationMode) return;
    if (e.target.closest?.('.board-hotspot, .domino-tile-container, .large-community-target')) return;
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      originX: boardPan.x,
      originY: boardPan.y
    };
    setIsPanning(true);
  };

  const handleResetBoardView = () => {
    setBoardZoom(1);
    setBoardPan({ x: 0, y: 0 });
  };
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);

  const numPlayers = (ctx && ctx.numPlayers) || (G && G.numPlayers) || 3;
  const currentPhase = ctx?.phase || 'draft';
  const tilesPerPlayer = INITIAL_PIECE_COUNTS[numPlayers]?.TILES_PER_PLAYER || 8;

  const getPlayerLabel = (pIdx) => {
    if (pIdx === undefined || pIdx === null) return '';
    const idx = parseInt(pIdx, 10);
    if (Array.isArray(playerNames) && playerNames[idx]) return playerNames[idx];
    if (G?.playerNames && G.playerNames[idx]) return G.playerNames[idx];
    return `Player ${idx + 1}`;
  };

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
  const allSpotKeys = new Set([...Object.keys(baseHotspots || {}), ...Object.keys(calibration.calibratedPositions || {})]);
  for (const k of allSpotKeys) {
    const base = baseHotspots?.[k] || {};
    const cal = calibration.calibratedPositions[k] || {};
    const merged = { ...base, ...cal };
    let rotVal = merged.rot !== undefined ? Math.round((merged.rot + 360) % 360) : 0;
    let scaleVal = merged.scale !== undefined ? parseFloat(Number(merged.scale).toFixed(2)) : 1.0;
    merged.rot = rotVal;
    merged.scale = scaleVal;
    merged.transform = `translate(-50%, -50%) rotate(${rotVal}deg) scale(${scaleVal})`;
    activeHotspots[k] = merged;
  }

  const replayAnimation = useTurnReplayAnimation(G, activeHotspots, getPlayerLabel, playerID);

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
    return (
      <div className="kred-container">
        <div className="kred-loading-screen" style={{ minHeight: '60vh' }}>
          <div className="kred-spinner" />
          <span>Loading game state...</span>
        </div>
      </div>
    );
  }

  const activeBoardImage = getBoardImageUrl(numPlayers);

  const isSupportPending = Boolean(G?.pendingSupport);
  const isSupportOwnerMe = isSupportPending && String(G.pendingSupport.ownerId) === String(playerID);
  const isBureaucracyInteraction = !isSupportPending && (
    currentPhase === 'bureaucracy' ||
    (G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId))
  );
  const noop = () => {};

  const activePendingPlayer = getPendingPlayActivePlayer(G);
  const isPendingActiveMe = G?.pendingPlay && String(activePendingPlayer) === String(playerID);
  const pendingStep = G?.pendingPlay?.step;

  const isReexecutingMe = isPendingActiveMe && pendingStep === 'reexecute';
  const isPenaltyWithdrawMe = isPendingActiveMe && pendingStep === 'penaltyWithdraw';
  const isFreeAdvanceMe = isPendingActiveMe && pendingStep === 'freeAdvance';
  const showTurnBuilderForPending = isReexecutingMe || isPenaltyWithdrawMe || isFreeAdvanceMe;

  return (
    <div className="kred-container">
      <BoardHeaderControls
        currentPhase={currentPhase}
        G={G}
        ctx={ctx}
        moves={moves}
        playerID={playerID}
        getPlayerLabel={getPlayerLabel}
        boardZoom={boardZoom}
        setBoardZoom={setBoardZoom}
        onResetBoardView={handleResetBoardView}
        isAdmin={isAdmin}
        calibrationMode={calibration.calibrationMode}
        showDiagnostics={showDiagnostics}
        onToggleDiagnostics={onToggleDiagnostics}
        onToggleCalibration={onToggleCalibration}
        setShowSaveLoadModal={setShowSaveLoadModal}
        onResetTransientState={staged.handleResetTurn}
      />

      {G.winner && (
        <div className="winner-banner">
          🎉 {G.winner === 'draw' ? 'MATCH ENDED IN A DRAW!' : `${getPlayerLabel(G.winner).toUpperCase()} HAS WON THE GAME!`} 🎉
        </div>
      )}

      <BoardCalibrationToolbar
        calibrationMode={calibration.calibrationMode}
        onClose={onToggleCalibration}
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
        showTileFaces={calibration.showTileFaces}
        setShowTileFaces={calibration.setShowTileFaces}
        handleNudgeSelectedSpotsPixels={calibration.handleNudgeSelectedSpotsPixels}
        handleRotateSelectedSpotsAroundCenter={calibration.handleRotateSelectedSpotsAroundCenter}
      />

      <div className="kred-layout">
        <div
          className="domains-section"
          onPointerDown={handleBoardPanStart}
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            paddingBottom: boardZoom > 1 ? `${((boardZoom - 1) * 46).toFixed(2)}rem` : '24px'
          }}
        >
          <div
            className="board-canvas-card"
            style={{
              transform: `translate(${boardPan.x}px, ${boardPan.y}px) scale(${boardZoom})`,
              transformOrigin: 'top center'
            }}
          >
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
              showTileFaces={calibration.showTileFaces}
              perspectiveRotation={perspectiveRotation}
              playerID={playerID}
              perspectiveOffsets={calibration.perspectiveOffsets}
              selectedReceiverId={staged.selectedReceiverId}
              selectedTileId={staged.selectedTileId}
              onSelectReceiver={staged.handleSelectReceiver}
              validReceivers={staged.validReceivers}
              validDestinations={peekingBoardState ? [] : isSupportPending ? (isSupportOwnerMe ? G.pendingSupport.validDestinations : []) : isBureaucracyInteraction ? bureaucracyBoard.moveValidDestinations : staged.validDestinations}
              selectedPieceLoc={peekingBoardState ? '' : isSupportPending ? (isSupportOwnerMe ? G.pendingSupport.from : '') : isBureaucracyInteraction ? bureaucracyBoard.moveFromLoc : staged.selectedPieceLoc}
              stagedMoves={peekingBoardState || isSupportPending ? [] : staged.stagedMoves}
              onPieceClick={peekingBoardState || isSupportPending ? noop : isBureaucracyInteraction ? bureaucracyBoard.handleBureaucracySpotClick : staged.handlePieceClick}
              onDestinationClick={peekingBoardState ? noop : isSupportPending ? (isSupportOwnerMe ? (toLoc) => moves?.resolveSupportDrop?.(toLoc) : noop) : isBureaucracyInteraction ? bureaucracyBoard.handleBureaucracyDestinationClick : staged.handleDestinationClick}
              transientBoardState={peekingBoardState || (isSupportPending ? null : staged.transientBoardState)}
              zoomLevel={zoomLevel * autoScale * boardZoom}
              peekPendingTile={staged.peekPendingTile}
              onTogglePeekTile={staged.handleTogglePeekTile}
              validPromotionSpots={isBureaucracyInteraction ? bureaucracyBoard.validPromotionSpots : []}
              getPlayerLabel={getPlayerLabel}
              replayAnimation={replayAnimation}
            />
          </div>
        </div>

        <div className="controls-sidebar">
          {G?.winner || ctx?.gameover ? (
            <>
              <MatchStatsCard G={G} getPlayerLabel={getPlayerLabel} />
              <GameLogPanel G={G} getPlayerLabel={getPlayerLabel} defaultOpen={true} selectedHistoryId={peekingHistoryId} onSelectHistoryEntry={(e) => setPeekingHistoryId(e ? e.id : null)} />
            </>
          ) : (
            <>
              {/* Unified Action Section — always at the top of the sidebar */}
          {isSupportPending && !(currentPhase === 'campaign' && (outcomeNotice?.type === 'quiet' || outcomeNotice?.type === 'challengeFailed')) && (
            <SupportDropCard G={G} playerID={playerID} getPlayerLabel={getPlayerLabel} />
          )}

          {!isSupportPending && currentPhase === 'draft' && (
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

          {!isSupportPending && currentPhase === 'bureaucracy' && (
            <BureaucracyPanel
              myPlayer={myPlayer}
              isMyTurn={isMyTurn}
              moves={moves}
              numPlayers={numPlayers}
              selectedPromotion={bureaucracyBoard.selectedPromotion}
              highlightedMoveTiers={bureaucracyBoard.highlightedMoveTiers}
              handlePromoteSelected={bureaucracyBoard.handlePromoteSelected}
              G={G}
              playerID={playerID}
              isOnline={isOnline}
              updateMasterGameState={updateMasterGameState}
            />
          )}

          {currentPhase === 'campaign' && (!isSupportPending || outcomeNotice?.type === 'quiet' || outcomeNotice?.type === 'challengeFailed') && (
            <>
              <div className="turn-builder-card campaign-action-panel">
                {outcomeNotice && (isSupportPending || outcomeNoticeKey !== dismissedOutcomeKey) ? (
                  <OutcomeNoticeCard
                    notice={outcomeNotice}
                    getPlayerLabel={getPlayerLabel}
                    pendingSupport={isSupportPending ? G.pendingSupport : null}
                    playerID={playerID}
                    onDismiss={!isSupportPending && (isMyTurn || isPendingActiveMe) ? () => setDismissedOutcomeKey(outcomeNoticeKey) : null}
                    waitingLabel={
                      isSupportPending
                        ? (!isSupportOwnerMe ? `Waiting for ${getPlayerLabel(G.pendingSupport.ownerId)} to move an unsupported piece...` : null)
                        : (!(isMyTurn || isPendingActiveMe) ? `Waiting for ${getPlayerLabel(G?.pendingPlay ? activePendingPlayer : ctx?.currentPlayer)}...` : null)
                    }
                  />
                ) : G?.pendingPlay && !showTurnBuilderForPending ? (
                  <PendingPlayModal
                    G={G}
                    playerID={playerID}
                    moves={moves}
                    peekPendingTile={staged.peekPendingTile}
                    onTogglePeekTile={staged.handleTogglePeekTile}
                    isOnline={isOnline}
                    updateMasterGameState={updateMasterGameState}
                    onReplayPieceMoves={replayAnimation.triggerPieceWalkReplay}
                    isReplaying={replayAnimation.isReplaying}
                    getPlayerLabel={getPlayerLabel}
                  />
                ) : (isMyTurn || showTurnBuilderForPending) ? (
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
                ) : outcomeNotice ? (
                  <OutcomeNoticeCard
                    notice={outcomeNotice}
                    getPlayerLabel={getPlayerLabel}
                    waitingLabel={`Waiting for ${getPlayerLabel(ctx?.currentPlayer)}...`}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Waiting for {getPlayerLabel(ctx?.currentPlayer)}...
                  </div>
                )}
              </div>

              {G?.pendingPlay?.step === 'challengerReward' && String(playerID) === String(G?.pendingPlay?.successfulChallengerId) && (
                <BureaucracyPanel
                  myPlayer={myPlayer}
                  isMyTurn={true}
                  moves={moves}
                  numPlayers={numPlayers}
                  selectedPromotion={bureaucracyBoard.selectedPromotion}
                  highlightedMoveTiers={bureaucracyBoard.highlightedMoveTiers}
                  handlePromoteSelected={bureaucracyBoard.handlePromoteSelected}
                  G={G}
                  playerID={playerID}
                  isOnline={isOnline}
                  updateMasterGameState={updateMasterGameState}
                />
              )}
            </>
          )}

          {/* Consolidated Player & Opponent Hands — always visible */}
          <HandsPanel
            G={G}
            myPlayer={myPlayer}
            playerID={playerID}
            currentPhase={currentPhase}
            selectedTileId={staged.selectedTileId}
            onSelectTile={staged.handleSelectTile}
            disabled={!isMyTurn || currentPhase !== 'campaign' || Boolean(G?.pendingPlay) || isSupportPending}
            getPlayerLabel={getPlayerLabel}
            isSolo={isSolo}
            botIds={botIds}
          />

          <GameLogPanel G={G} getPlayerLabel={getPlayerLabel} selectedHistoryId={peekingHistoryId} onSelectHistoryEntry={(e) => setPeekingHistoryId(e ? e.id : null)} />
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
