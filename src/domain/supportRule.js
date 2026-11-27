import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { findUnsupportedPiece, parseLocation } from './board.js';
import { appendGameLog } from './gameLog.js';
import { logKgnSubLine, formatKgnLoc } from './kgn.js';
import { applyVictoryCheck, resolvePlayToBank, finishPendingPlayOrReward } from './phases/campaignResolution.js';

export function formatSupportSpot(loc) {
  const p = parseLocation(loc);
  if (!p) return loc;
  if (p.type === 'office') return 'Office';
  if (p.type === 'rostrum') return `Rostrum ${p.index}`;
  if (p.type === 'seat') return `Seat ${p.index}`;
  return loc;
}

export function queuePendingSupport(G, options = {}) {
  const unsupported = findUnsupportedPiece(G.boardState, G.numPlayers);
  if (!unsupported) return false;
  G.pendingSupport = {
    ...unsupported,
    phase: options.phase || 'campaign',
    afterResolve: options.afterResolve || null,
    returnToPlayerId: options.returnToPlayerId ?? null,
    tileId: options.tileId || null
  };
  return true;
}

export function handleResolveSupportDrop({ G, playerID, events }, toLoc) {
  const ps = G?.pendingSupport;
  const pId = String(playerID);
  if (!ps || String(ps.ownerId) !== pId) return INVALID_MOVE;
  if (!ps.validDestinations.includes(toLoc)) return INVALID_MOVE;
  if (!G.boardState[ps.from] || G.boardState[toLoc] !== null) return INVALID_MOVE;

  G.boardState[toLoc] = G.boardState[ps.from];
  G.boardState[ps.from] = null;

  appendGameLog(G, `Player ${pId} moved unsupported piece to ${formatSupportSpot(toLoc)}.`, 'info');
  logKgnSubLine(G, `-${formatKgnLoc(ps.from)}>${formatKgnLoc(toLoc)}`);

  const nextUnsupported = findUnsupportedPiece(G.boardState, G.numPlayers);
  if (nextUnsupported) {
    G.pendingSupport = {
      ...nextUnsupported,
      phase: ps.phase,
      afterResolve: ps.afterResolve,
      returnToPlayerId: ps.returnToPlayerId,
      tileId: ps.tileId
    };
    if (String(nextUnsupported.ownerId) !== pId) {
      events.endTurn();
    }
    return;
  }

  G.pendingSupport = null;

  if (ps.afterResolve === 'resolvePlayToBank') {
    resolvePlayToBank(G);
  } else if (ps.afterResolve === 'finishPendingPlayOrReward') {
    finishPendingPlayOrReward(G);
  } else if (ps.afterResolve === 'finishChallengerReward') {
    const receiverId = G.pendingPlay?.receiverId;
    G.pendingPlay = null;
    if (receiverId !== undefined && receiverId !== null) G.nextMoverId = receiverId;
    applyVictoryCheck(G, ps.tileId);
  } else if (ps.afterResolve === 'victoryCheck') {
    applyVictoryCheck(G, ps.tileId);
  }

  if (ps.phase === 'bureaucracy') {
    if (ps.returnToPlayerId === null || String(ps.returnToPlayerId) !== pId) {
      events.endTurn();
    }
  } else {
    events.endTurn();
  }
}
