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
  const [replayNoticeText, setReplayNoticeText] = useState('');

  const lastReplayedPlayKeyRef = useRef(null);
  const animationTimersRef = useRef([]);

  const clearTimers = () => {
    animationTimersRef.current.forEach(t => clearTimeout(t));
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

    const runMoveStep = (moveIndex) => {
      const move = movesMade[moveIndex];
      if (!move) {
        setIsReplaying(false);
        setOverrideBoardState(null);
        setAnimatingPiece(null);
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

      // Hide piece from static board during sliding animation
      const boardDuringMove = JSON.parse(JSON.stringify(currentBoard));
      if (fromSpot && boardDuringMove[fromSpot]) {
        boardDuringMove[fromSpot] = null;
      }
      setOverrideBoardState(boardDuringMove);

      setReplayNoticeText(`👀 Watch ${moverName}'s move ${moveIndex + 1} of ${totalMoves}...`);

      // Phase A (0ms - 750ms): 750ms attention-getting pre-glow at start spot
      setAnimatingPiece({
        pieceType,
        left: startCoords.left,
        top: startCoords.top,
        isPreGlow: true,
        isMoving: false
      });

      // Phase B (at 750ms): Pre-glow completes -> start walking transition to target coords
      const t1 = setTimeout(() => {
        setReplayNoticeText(`🚶 ${moverName} move ${moveIndex + 1} of ${totalMoves}`);
        setAnimatingPiece({
          pieceType,
          left: endCoords.left,
          top: endCoords.top,
          isPreGlow: false,
          isMoving: true
        });
      }, 750);
      animationTimersRef.current.push(t1);

      // Phase C (at 750ms + 900ms = 1650ms): Move animation lands at target spot
      const t2 = setTimeout(() => {
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
          // Replay finished
          const tFinish = setTimeout(() => {
            setIsReplaying(false);
            setOverrideBoardState(null);
            setAnimatingPiece(null);
            setReplayNoticeText('');
          }, 400);
          animationTimersRef.current.push(tFinish);
        }
      }, 1650);
      animationTimersRef.current.push(t2);
    };

    runMoveStep(0);
  }, [G?.pendingPlay, activeHotspots, getPlayerLabel]);

  return {
    isReplaying,
    overrideBoardState,
    animatingPiece,
    replayNoticeText
  };
}
