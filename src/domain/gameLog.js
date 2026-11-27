const PIECE_SHORT = { Mark: 'M', Heel: 'H', Pawn: 'P' };
const PIECE_LONG = { M: 'Mark', H: 'Heel', P: 'Pawn' };

export function captureBoardSnapshot(boardState) {
  if (!boardState) return null;
  const snap = {};
  for (const k of Object.keys(boardState)) {
    const p = boardState[k];
    if (p && p.type) snap[k] = PIECE_SHORT[p.type] || p.type;
  }
  return snap;
}

export function expandBoardSnapshot(snap, templateBoard) {
  if (!snap) return null;
  const out = {};
  if (templateBoard) {
    for (const k of Object.keys(templateBoard)) out[k] = null;
  }
  for (const k of Object.keys(snap)) {
    const type = PIECE_LONG[snap[k]] || snap[k];
    out[k] = { id: `snap_${k}`, type };
  }
  return out;
}

export function captureTileSnapshot(G) {
  if (!G?.players) return null;
  const players = {};
  for (const id of Object.keys(G.players)) {
    const p = G.players[id] || {};
    players[id] = {
      hand: Array.isArray(p.hand) ? [...p.hand] : [],
      bank: Array.isArray(p.bank) ? p.bank.map((b) => ({ tileId: b.tileId, faceDown: Boolean(b.faceDown) })) : [],
      cred: p.credibilityNotchesLost || 0
    };
  }
  const pp = G.pendingPlay;
  const drop = pp && (pp.step === 'receipt' || pp.step === 'challenge')
    ? { receiverId: String(pp.receiverId), step: pp.step }
    : null;
  return { players, drop };
}

export function expandHistoryPeek(G, historyId) {
  if (historyId === null || historyId === undefined) {
    return { active: false, hasTiles: false, boardState: null, G };
  }
  const entry = (G?.history || []).find((e) => e.id === historyId);
  if (!entry) return { active: false, hasTiles: false, boardState: null, G };
  const boardState = entry.snap ? expandBoardSnapshot(entry.snap, G?.boardState) : null;
  if (!entry.tiles) {
    return { active: Boolean(boardState), hasTiles: false, boardState, G };
  }
  const players = { ...(G?.players || {}) };
  for (const id of Object.keys(entry.tiles.players || {})) {
    const tp = entry.tiles.players[id];
    players[id] = {
      ...(players[id] || {}),
      hand: tp.hand || [],
      bank: tp.bank || [],
      credibilityNotchesLost: tp.cred ?? players[id]?.credibilityNotchesLost ?? 0
    };
  }
  const pendingPlay = entry.tiles.drop
    ? { step: entry.tiles.drop.step, receiverId: entry.tiles.drop.receiverId }
    : null;
  return { active: true, hasTiles: true, boardState, G: { ...G, players, pendingPlay } };
}

/**
 * Appends a deterministic, serializable public event to G.history.
 * Uses `Player <id>` placeholders so clients resolve display names on render.
 */
export function appendGameLog(G, text, tone = 'info') {
  if (!G || !text) return;
  if (!Array.isArray(G.history)) G.history = [];
  const nextId = G.history.length > 0 ? (G.history[G.history.length - 1].id || G.history.length) + 1 : 1;
  const snap = captureBoardSnapshot(G.boardState);
  const tiles = captureTileSnapshot(G);
  const entry = { id: nextId, text, tone };
  if (snap) entry.snap = snap;
  if (tiles) entry.tiles = tiles;
  G.history.push(entry);
  if (G.history.length > 150) {
    G.history.splice(0, G.history.length - 150);
  }
}

function ownerFromLoc(loc) {
  if (typeof loc !== 'string') return null;
  const m = loc.match(/^p(\d+)_/);
  return m ? String(parseInt(m[1], 10) - 1) : null;
}

export function formatMovePastClause(move) {
  if (!move || !move.type) return '';
  switch (move.type) {
    case 'Advance': return 'Advanced';
    case 'Withdraw': return 'Withdrew';
    case 'Organize': return 'Organized';
    case 'Assist': {
      const target = ownerFromLoc(move.to);
      return target !== null ? `Assisted Player ${target}` : 'Assisted';
    }
    case 'Remove': {
      const target = ownerFromLoc(move.from);
      return target !== null ? `Removed Player ${target}` : 'Removed';
    }
    case 'Influence': {
      const target = ownerFromLoc(move.from) ?? ownerFromLoc(move.to);
      return target !== null ? `Influenced Player ${target}` : 'Influenced';
    }
    default:
      return move.type;
  }
}

export function formatMoveInfinitive(move) {
  if (!move || !move.type) return 'move a piece';
  switch (move.type) {
    case 'Advance': return 'Advance';
    case 'Withdraw': return 'Withdraw';
    case 'Organize': return 'Organize';
    case 'Assist': {
      const target = ownerFromLoc(move.to);
      return target !== null ? `Assist Player ${target}` : 'Assist';
    }
    case 'Remove': {
      const target = ownerFromLoc(move.from);
      return target !== null ? `Remove Player ${target}` : 'Remove';
    }
    case 'Influence': {
      const target = ownerFromLoc(move.from) ?? ownerFromLoc(move.to);
      return target !== null ? `Influence Player ${target}` : 'Influence';
    }
    default:
      return move.type;
  }
}

export function formatTurnMovesLog(moverId, moveActions = []) {
  const clauses = (moveActions || []).map(formatMovePastClause).filter(Boolean);
  if (clauses.length === 0) return '';
  return `Player ${moverId} ${clauses.join(' and ')}.`;
}

export function createEmptyPlayerStats() {
  return {
    whistlesBlown: 0,
    challengesMade: 0,
    tilesPlayedToSelf: 0,
    bureaucracyFunding: []
  };
}

export function recordPlayerStat(G, playerID, key, delta = 1) {
  if (!G || playerID === undefined || playerID === null) return;
  if (!G.matchStats) G.matchStats = {};
  const id = String(playerID);
  if (!G.matchStats[id]) G.matchStats[id] = createEmptyPlayerStats();
  G.matchStats[id][key] = (G.matchStats[id][key] || 0) + delta;
}

export function recordBureaucracyFunding(G) {
  if (!G || !G.players) return;
  if (!G.matchStats) G.matchStats = {};
  for (const pId of Object.keys(G.players)) {
    if (!G.matchStats[pId]) G.matchStats[pId] = createEmptyPlayerStats();
    G.matchStats[pId].bureaucracyFunding.push(G.players[pId]?.funding || 0);
  }
}
