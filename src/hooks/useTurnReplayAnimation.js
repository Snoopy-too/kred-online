import { useState, useEffect, useRef } from 'react';
import { applyMoveToState } from '../domain/moves.js';

function getSpotCoords(spotKey, activeHotspots) {
  if (!spotKey) return { left: '50%', top: '50%' };
  if (activeHotspots[spotKey]) return activeHotspots[spotKey];
  if (spotKey.startsWith('community') && activeHotspots['community_target']) {
    return activeHotspots['community_target'];
  }
  return { left: '50%', top: '50%' };
}

export function useTurnReplayAnimation(G, activeHotspots, getPlayerLabel, playerID = null) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [overrideBoardState, setOverrideBoardState] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const [animatingTile, setAnimatingTile] = useState(null);

  const lastReplayedPlayKeyRef = useRef(null);
  const lastBureaucracySeqRef = useRef(null);
  const animationTimersRef = useRef([]);

  const clearTimers = () => {
    animationTimersRef.current.forEach((t) => (typeof t === 'function' ? t() : clearTimeout(t)));
    animationTimersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const finishReplay = () => {
    setAnimatingTile(null);
    setAnimatingPiece(null);
    setOverrideBoardState(null);
    setIsReplaying(false);
  };

  const runTileTravelAnimation = (pendingPlay) => {
    const moverDomainNum = parseInt(pendingPlay.moverId, 10) + 1;
    const receiverDomainNum = parseInt(String(pendingPlay.receiverId), 10) + 1;

    const startCoords = getSpotCoords(`p${moverDomainNum}_dropTile`, activeHotspots);
    const endCoords = getSpotCoords(`p${receiverDomainNum}_dropTile`, activeHotspots);

    const parsePct = (val) => (typeof val === 'number' ? val : parseFloat(String(val).replace('%', '')) || 50);
    const p0 = { x: parsePct(startCoords.left), y: parsePct(startCoords.top) };
    const p2 = { x: parsePct(endCoords.left), y: parsePct(endCoords.top) };

    const pMid = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };
    const dirX = pMid.x - 50;
    const dirY = pMid.y - 50;
    const dist = Math.hypot(dirX, dirY) || 1;
    const pushDist = Math.max(20, dist * 0.65);
    const p1 = {
      x: pMid.x + (dirX / dist) * pushDist,
      y: pMid.y + (dirY / dist) * pushDist
    };

    const duration = 650;
    const startTime = performance.now();
    let animFrameId = null;

    const animateStep = (now) => {
      const rawT = Math.min(1, (now - startTime) / duration);
      const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

      const curX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const curY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

      const tangentX = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
      const tangentY = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
      const angleDeg = Math.atan2(tangentY, tangentX) * (180 / Math.PI);

      setAnimatingTile({
        left: `${curX}%`,
        top: `${curY}%`,
        rotation: angleDeg + 90,
        tileId: pendingPlay.tileIdPlayed,
        visible: true
      });

      if (rawT < 1) {
        animFrameId = requestAnimationFrame(animateStep);
      } else {
        const tDone = setTimeout(finishReplay, 120);
        animationTimersRef.current.push(tDone);
      }
    };

    animFrameId = requestAnimationFrame(animateStep);
    animationTimersRef.current.push(() => cancelAnimationFrame(animFrameId));
  };

  const runPieceMoveSequence = (pendingPlay, includeTileTravel) => {
    const { movesMade, backupBoard } = pendingPlay;
    const initialBoard = backupBoard
      ? JSON.parse(JSON.stringify(backupBoard))
      : JSON.parse(JSON.stringify(G.boardState || {}));

    setIsReplaying(true);
    setOverrideBoardState(initialBoard);
    setAnimatingTile(null);

    const totalMoves = movesMade.length;
    let currentBoard = JSON.parse(JSON.stringify(initialBoard));

    const runMoveStep = (moveIndex) => {
      const move = movesMade[moveIndex];
      if (!move) {
        finishReplay();
        return;
      }

      const fromSpot = move.from;
      const toSpot = move.to;

      let pieceObj = currentBoard[fromSpot];
      if (!pieceObj && fromSpot?.startsWith('community')) {
        pieceObj = Object.values(currentBoard).find((p) => p && p.id === move.pieceId) || { type: 'Mark' };
      }

      const pieceType = pieceObj?.type || 'Mark';
      const startCoords = getSpotCoords(fromSpot, activeHotspots);
      const endCoords = getSpotCoords(toSpot, activeHotspots);

      // Brief highlight on origin spot
      setOverrideBoardState(currentBoard);
      setAnimatingPiece({
        pieceType,
        left: startCoords.left,
        top: startCoords.top,
        phase: 'PRE_GLOW',
        isMoving: false
      });

      const tGlow = setTimeout(() => {
        const boardDuringMove = JSON.parse(JSON.stringify(currentBoard));
        if (fromSpot && boardDuringMove[fromSpot]) {
          boardDuringMove[fromSpot] = null;
        }
        setOverrideBoardState(boardDuringMove);

        setAnimatingPiece({
          pieceType,
          left: startCoords.left,
          top: startCoords.top,
          phase: 'WALKING',
          isMoving: false
        });

        let raf2 = null;
        const raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => {
            setAnimatingPiece({
              pieceType,
              left: endCoords.left,
              top: endCoords.top,
              phase: 'WALKING',
              isMoving: true
            });
          });
        });
        animationTimersRef.current.push(() => {
          cancelAnimationFrame(raf1);
          if (raf2) cancelAnimationFrame(raf2);
        });
      }, 180);
      animationTimersRef.current.push(tGlow);

      const tLand = setTimeout(() => {
        const nextBoard = JSON.parse(JSON.stringify(currentBoard));
        applyMoveToState(move, nextBoard, G?.community || {});
        currentBoard = nextBoard;

        setOverrideBoardState(currentBoard);
        setAnimatingPiece(null);

        if (moveIndex + 1 < totalMoves) {
          const tNext = setTimeout(() => runMoveStep(moveIndex + 1), 180);
          animationTimersRef.current.push(tNext);
        } else if (includeTileTravel) {
          const tTile = setTimeout(() => runTileTravelAnimation(pendingPlay), 150);
          animationTimersRef.current.push(tTile);
        } else {
          const tDone = setTimeout(finishReplay, 120);
          animationTimersRef.current.push(tDone);
        }
      }, 780);
      animationTimersRef.current.push(tLand);
    };

    runMoveStep(0);
  };

  useEffect(() => {
    const pendingPlay = G?.pendingPlay;
    if (!pendingPlay || !pendingPlay.movesMade || pendingPlay.movesMade.length === 0) {
      return;
    }

    // Only auto-replay once per unique play (never repeat when step changes receipt -> challenge -> reexecute)
    const playKey = `${pendingPlay.moverId}_${pendingPlay.receiverId}_${JSON.stringify(pendingPlay.movesMade)}`;
    if (lastReplayedPlayKeyRef.current === playKey) {
      return;
    }
    lastReplayedPlayKeyRef.current = playKey;

    // Only auto-animate on initial play steps, and skip piece-walk replay for the mover who just moved them
    if (pendingPlay.step !== 'receipt' && pendingPlay.step !== 'challenge') {
      return;
    }
    if (pendingPlay.alreadyAnimatedLive) {
      return;
    }
    if (playerID !== null && String(pendingPlay.moverId) === String(playerID)) {
      return;
    }

    clearTimers();
    runPieceMoveSequence(pendingPlay, true);
  }, [G?.pendingPlay, playerID]);

  useEffect(() => {
    const bReplay = G?.lastBureaucracyReplay;
    if (!bReplay || !bReplay.movesMade || bReplay.movesMade.length === 0) {
      return;
    }
    if (lastBureaucracySeqRef.current === bReplay.seq) {
      return;
    }
    lastBureaucracySeqRef.current = bReplay.seq;
    if (playerID !== null && String(bReplay.playerId) === String(playerID)) {
      return;
    }
    clearTimers();
    runPieceMoveSequence(bReplay, false);
  }, [G?.lastBureaucracyReplay?.seq, playerID]);

  const triggerPieceWalkReplay = () => {
    const pendingPlay = G?.pendingPlay;
    if (pendingPlay && pendingPlay.movesMade && pendingPlay.movesMade.length > 0) {
      clearTimers();
      runPieceMoveSequence(pendingPlay, false);
      return;
    }
    const bReplay = G?.lastBureaucracyReplay;
    if (bReplay && bReplay.movesMade && bReplay.movesMade.length > 0) {
      clearTimers();
      runPieceMoveSequence(bReplay, false);
    }
  };

  return {
    isReplaying,
    overrideBoardState,
    animatingPiece,
    animatingTile,
    replayNoticeText: '',
    triggerPieceWalkReplay
  };
}
