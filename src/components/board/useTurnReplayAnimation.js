import { useState, useEffect, useRef } from 'react';
import { applyMoveToState } from '../../domain/moves.js';

function getSpotCoords(spotKey, activeHotspots) {
  if (!spotKey) return { left: '50%', top: '50%' };
  if (activeHotspots[spotKey]) return activeHotspots[spotKey];
  if (spotKey === 'community' && activeHotspots['community_target']) {
    return activeHotspots['community_target'];
  }
  if (spotKey.startsWith('community') && activeHotspots['community_target']) {
    return activeHotspots['community_target'];
  }
  return { left: '50%', top: '50%' };
}

export function useTurnReplayAnimation(G, activeHotspots, getPlayerLabel) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [overrideBoardState, setOverrideBoardState] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const [animatingTile, setAnimatingTile] = useState(null);
  const [replayNoticeText, setReplayNoticeText] = useState('');

  const lastReplayedPlayKeyRef = useRef(null);
  const animationTimersRef = useRef([]);

  const clearTimers = () => {
    animationTimersRef.current.forEach(t => typeof t === 'function' ? t() : clearTimeout(t));
    animationTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    const pendingPlay = G?.pendingPlay;
    if (!pendingPlay || !pendingPlay.movesMade || pendingPlay.movesMade.length === 0) {
      return;
    }

    const { moverId, tileIdPlayed, movesMade, backupBoard } = pendingPlay;
    const playKey = `${moverId}_${tileIdPlayed}_${movesMade.length}_${pendingPlay.step}_${JSON.stringify(movesMade)}`;

    if (lastReplayedPlayKeyRef.current === playKey) {
      return;
    }

    lastReplayedPlayKeyRef.current = playKey;
    clearTimers();

    const moverName = getPlayerLabel ? getPlayerLabel(moverId) : `Player ${parseInt(moverId, 10) + 1}`;
    const initialBoard = backupBoard ? JSON.parse(JSON.stringify(backupBoard)) : JSON.parse(JSON.stringify(G.boardState || {}));

    setIsReplaying(true);
    setOverrideBoardState(initialBoard);

    const totalMoves = movesMade.length;
    let currentBoard = JSON.parse(JSON.stringify(initialBoard));

    const runTileTravelAnimation = () => {
      const moverDomainNum = parseInt(moverId, 10) + 1;
      const receiverId = String(pendingPlay.receiverId);
      const receiverDomainNum = parseInt(receiverId, 10) + 1;
      const receiverName = getPlayerLabel ? getPlayerLabel(receiverId) : `Player ${receiverDomainNum}`;

      setReplayNoticeText(`🎴 ${moverName} playing tile to ${receiverName}...`);

      const startSpotKey = `p${moverDomainNum}_dropTile`;
      const endSpotKey = `p${receiverDomainNum}_dropTile`;

      const startCoords = getSpotCoords(startSpotKey, activeHotspots);
      const endCoords = getSpotCoords(endSpotKey, activeHotspots);

      const parsePct = (val) => typeof val === 'number' ? val : parseFloat(String(val).replace('%', '')) || 50;

      const p0 = { x: parsePct(startCoords.left), y: parsePct(startCoords.top) };
      const p2 = { x: parsePct(endCoords.left), y: parsePct(endCoords.top) };

      // Calculate control point P1 pushed OUTWARD away from center (50, 50)
      const pMid = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };
      let dirX = pMid.x - 50;
      let dirY = pMid.y - 50;
      const dist = Math.hypot(dirX, dirY) || 1;
      // Push control point outward so curve travels just outside the playing board perimeter
      const pushDist = Math.max(24, dist * 0.75);
      const p1 = {
        x: pMid.x + (dirX / dist) * pushDist,
        y: pMid.y + (dirY / dist) * pushDist
      };

      const duration = 1100; // 1.1s travel duration
      const startTime = performance.now();

      let animFrameId = null;

      const animateStep = (now) => {
        const elapsed = now - startTime;
        const rawT = Math.min(1, elapsed / duration);
        // Smooth ease-in-out curve
        const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

        // Quadratic Bezier interpolation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const curX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const curY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

        // Calculate tangent angle for smooth rotation along path
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
          // Tile lands at receiver drop spot
          const tFinish = setTimeout(() => {
            setAnimatingTile(null);
            setIsReplaying(false);
            setOverrideBoardState(null);
            setAnimatingPiece(null);
            setReplayNoticeText('');
          }, 350);
          animationTimersRef.current.push(tFinish);
        }
      };

      animFrameId = requestAnimationFrame(animateStep);
      animationTimersRef.current.push(() => cancelAnimationFrame(animFrameId));
    };

    const runMoveStep = (moveIndex) => {
      const move = movesMade[moveIndex];
      if (!move) {
        setIsReplaying(false);
        setOverrideBoardState(null);
        setAnimatingPiece(null);
        setAnimatingTile(null);
        setReplayNoticeText('');
        return;
      }

      const fromSpot = move.from;
      const toSpot = move.to;

      // Find piece object from starting board state
      let pieceObj = currentBoard[fromSpot];
      if (!pieceObj && fromSpot.startsWith('community')) {
        pieceObj = Object.values(currentBoard).find(p => p && p.id === move.pieceId) || { type: 'Mark' };
      }

      const pieceType = pieceObj?.type || 'Mark';
      const startCoords = getSpotCoords(fromSpot, activeHotspots);
      const endCoords = getSpotCoords(toSpot, activeHotspots);

      // Phase 1 (0ms - 750ms): Piece STAYS PUT on board while glowing ring pulses over start spot
      setOverrideBoardState(currentBoard);
      setReplayNoticeText(`👀 Watch ${moverName}'s move ${moveIndex + 1} of ${totalMoves}...`);

      setAnimatingPiece({
        pieceType,
        left: startCoords.left,
        top: startCoords.top,
        phase: 'PRE_GLOW',
        isMoving: false
      });

      // Phase 2 (at 750ms): Glow finishes! Remove piece from start spot and begin walk without glow
      const tGlowFinish = setTimeout(() => {
        // Clear piece from static board at start spot so floating overlay piece takes over
        const boardDuringMove = JSON.parse(JSON.stringify(currentBoard));
        if (fromSpot && boardDuringMove[fromSpot]) {
          boardDuringMove[fromSpot] = null;
        }
        setOverrideBoardState(boardDuringMove);

        setReplayNoticeText(`🚶 ${moverName} move ${moveIndex + 1} of ${totalMoves}`);

        // Set floating piece at start position in WALKING phase (no glow)
        setAnimatingPiece({
          pieceType,
          left: startCoords.left,
          top: startCoords.top,
          phase: 'WALKING',
          isMoving: false
        });

        // 50ms reflow delay -> transition to target coords over 850ms
        const tWalkStart = setTimeout(() => {
          setAnimatingPiece({
            pieceType,
            left: endCoords.left,
            top: endCoords.top,
            phase: 'WALKING',
            isMoving: true
          });
        }, 50);
        animationTimersRef.current.push(tWalkStart);

      }, 750);
      animationTimersRef.current.push(tGlowFinish);

      // Phase 3 (at 750ms + 50ms + 850ms = 1650ms): Move lands at target spot
      const tLand = setTimeout(() => {
        // Apply move to state so piece rests at destination spot
        const nextBoard = JSON.parse(JSON.stringify(currentBoard));
        applyMoveToState(move, nextBoard, G?.community || {});
        currentBoard = nextBoard;

        setOverrideBoardState(currentBoard);
        setAnimatingPiece(null);

        // Check if there is a next move
        if (moveIndex + 1 < totalMoves) {
          setReplayNoticeText(`⏸️ 1 sec pause before move ${moveIndex + 2}...`);
          // 1 second pause as requested
          const tPause = setTimeout(() => {
            runMoveStep(moveIndex + 1);
          }, 1000);
          animationTimersRef.current.push(tPause);
        } else {
          // All piece moves completed!
          // 1 second pause after pieces finish their walks, then animate tile traveling outside board
          setReplayNoticeText(`⏸️ 1 sec pause before tile play...`);
          const tTileDelay = setTimeout(() => {
            runTileTravelAnimation();
          }, 1000);
          animationTimersRef.current.push(tTileDelay);
        }
      }, 1650);
      animationTimersRef.current.push(tLand);
    };

    runMoveStep(0);
  }, [G?.pendingPlay, activeHotspots, getPlayerLabel]);

  return {
    isReplaying,
    overrideBoardState,
    animatingPiece,
    animatingTile,
    replayNoticeText
  };
}
