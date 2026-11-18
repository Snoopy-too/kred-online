import { checkVictory, getNextPlayer } from '../board.js';

export function applyVictoryCheck(G, tileId) {
  if (!G || !G.players || tileId === 'BLANK') return;
  const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
  if (winners.length > 1) G.winner = 'draw';
  else if (winners.length === 1) G.winner = winners[0];
}

export function resolvePlayToBank(G) {
  if (!G || !G.pendingPlay) return;
  const { receiverId, tileIdPlayed } = G.pendingPlay;
  G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
  G.nextMoverId = receiverId;
  G.pendingPlay = null;
  applyVictoryCheck(G, tileIdPlayed);
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
