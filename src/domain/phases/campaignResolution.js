import { checkVictory, getNextPlayer, findUnsupportedPiece } from '../board.js';
import { appendGameLog } from '../gameLog.js';
import { logKgnOutcome, logKgnResult, logKgnReward } from '../kgn.js';

export function applyVictoryCheck(G, tileId) {
  if (!G || !G.players || tileId === '___') return;
  const prevWinner = G.winner;
  const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
  if (winners.length > 1) G.winner = 'draw';
  else if (winners.length === 1) G.winner = winners[0];
  if (G.winner && G.winner !== prevWinner) {
    appendGameLog(G, G.winner === 'draw' ? 'Match ended in a draw.' : `Player ${G.winner} won the game!`, 'win');
    logKgnResult(G);
  }
}

export function resolvePlayToBank(G) {
  if (!G || !G.pendingPlay) return;
  const { moverId, receiverId, tileIdPlayed } = G.pendingPlay;
  G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
  G.nextMoverId = receiverId;
  G.pendingPlay = null;
  G.lastOutcomeNotice = {
    title: 'Quiet is Kept!',
    type: 'quiet',
    moverId,
    receiverId,
    tileIdPlayed,
    text: `Player ${receiverId} banked Player ${moverId}'s tile.`
  };
  appendGameLog(G, 'Quiet is Kept!', 'accept');
  logKgnOutcome(G, 'Q');
  if (!findUnsupportedPiece(G.boardState, G.numPlayers)) {
    applyVictoryCheck(G, tileIdPlayed);
  }
}

export function finishPendingPlayOrReward(G) {
  const challengerId = G.pendingPlay?.successfulChallengerId;
  const receiverId = G.pendingPlay?.receiverId || G.nextMoverId;
  const tileId = G.pendingPlay?.reexecuteTileId || G.pendingPlay?.tileIdPlayed;

  applyVictoryCheck(G, tileId);

  if (challengerId && G.players[challengerId]) {
    const hasFacedownTiles = (G.players[challengerId].bank || []).some(t => t.faceDown);
    if (hasFacedownTiles) {
      G.pendingPlay.step = 'challengerReward';
      return;
    } else {
      if (G.players[challengerId].credibilityNotchesLost > 0) {
        G.players[challengerId].credibilityNotchesLost--;
      }
      logKgnReward(G, '1');
    }
  }

  G.pendingPlay = null;
  if (receiverId !== undefined && receiverId !== null) {
    G.nextMoverId = receiverId;
  }
}

export function findNextPlayerWithTiles(G, startId) {
  const np = (G && G.numPlayers) || 3;
  let targetId = String(startId ?? '0');
  let searchCount = 0;
  while (
    G &&
    G.players &&
    G.players[targetId] &&
    (G.players[targetId].hand || []).length === 0 &&
    searchCount < np
  ) {
    targetId = getNextPlayer(targetId, np);
    searchCount++;
  }
  return parseInt(targetId, 10);
}
