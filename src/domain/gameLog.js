/**
 * Appends a deterministic, serializable public event to G.history.
 * Uses `Player <id>` placeholders so clients resolve display names on render.
 */
export function appendGameLog(G, text, tone = 'info') {
  if (!G || !text) return;
  if (!Array.isArray(G.history)) G.history = [];
  const nextId = G.history.length > 0 ? (G.history[G.history.length - 1].id || G.history.length) + 1 : 1;
  G.history.push({ id: nextId, text, tone });
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
