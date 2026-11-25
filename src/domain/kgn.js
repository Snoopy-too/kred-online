import { parseLocation } from './board.js';

const MOVE_CODE = {
  Advance: 'A',
  Withdraw: 'W',
  Organize: 'O',
  Assist: 'S',
  Remove: 'R',
  Influence: 'I'
};

const PIECE_CODE = {
  Mark: 'M',
  Heel: 'H',
  Pawn: 'P'
};

export function formatKgnPlayer(playerId) {
  return `P${parseInt(playerId, 10) + 1}`;
}

export function formatKgnLoc(loc) {
  if (!loc) return '?';
  const p = parseLocation(loc);
  if (!p) return String(loc);
  if (p.type === 'community') return 'C';
  if (p.type === 'office') return `${p.domainNum}O`;
  if (p.type === 'rostrum') return `${p.domainNum}R${p.index}`;
  if (p.type === 'seat') return `${p.domainNum}S${p.index}`;
  return String(loc);
}

export function formatKgnMove(move) {
  if (!move || !move.type) return '';
  const code = MOVE_CODE[move.type] || move.type;
  return `${code} ${formatKgnLoc(move.from)}>${formatKgnLoc(move.to)}`;
}

export function formatKgnMoves(moves = []) {
  const parts = (moves || []).map(formatKgnMove).filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Pass';
}

export function formatKgnBureaucracyAction({ actionType, targetLoc, pieceType, subAction, cost }) {
  const costTag = cost ? ` (K${cost})` : '';
  if (actionType === 'RESTORE_CRED') return `+C${costTag}`;
  if (actionType === 'PROMOTE_SEAT' || actionType === 'PROMOTE_ROSTRUM' || actionType === 'PROMOTE_OFFICE') {
    const pCode = PIECE_CODE[pieceType] || pieceType || '?';
    return `Prom ${formatKgnLoc(targetLoc)}>${pCode}${costTag}`;
  }
  if (subAction) return `${formatKgnMove(subAction)}${costTag}`;
  return `${actionType}${costTag}`;
}

function pushKgnLine(G, text, tone = 'info', meta = null) {
  if (!G || !text) return null;
  if (!Array.isArray(G.kgnLines)) G.kgnLines = [];
  const nextId = G.kgnLines.length > 0 ? (G.kgnLines[G.kgnLines.length - 1].id || G.kgnLines.length) + 1 : 1;
  const entry = meta ? { id: nextId, text, tone, ...meta } : { id: nextId, text, tone };
  G.kgnLines.push(entry);
  return entry;
}

export function logKgnPhase(G, phase) {
  if (!G) return;
  if (phase === 'campaign') {
    G.kgnCampaignCount = (G.kgnCampaignCount || 0) + 1;
    pushKgnLine(G, `; === CAMPAIGN ${G.kgnCampaignCount} ===`, 'phase');
  } else if (phase === 'bureaucracy') {
    G.kgnBureaucracyCount = (G.kgnBureaucracyCount || 0) + 1;
    G.kgnBureaucracyTurnNum = 0;
    pushKgnLine(G, `; === BUREAUCRACY ${G.kgnBureaucracyCount} ===`, 'phase');
  }
}

export function logKgnCampaignPlay(G, moverId, receiverId, moves = []) {
  if (!G) return;
  G.kgnTurnCount = (G.kgnTurnCount || 0) + 1;
  const text = `${G.kgnTurnCount}. ${formatKgnPlayer(moverId)}: ${formatKgnMoves(moves)} -> ${formatKgnPlayer(receiverId)}`;
  pushKgnLine(G, text, 'play', { kgnKind: 'turn' });
}

export function logKgnOutcome(G, code, { challengerId = null, tileId = null } = {}) {
  if (!G) return;
  let suffix = code;
  if ((code === 'W' || code === 'G') && challengerId !== null && challengerId !== undefined) {
    suffix += `(${formatKgnPlayer(challengerId)})`;
  }
  if (code !== 'Q' && tileId) {
    suffix += ` [${tileId}]`;
  }
  const tone = code === 'Q' ? 'accept' : code === 'W' ? 'warn' : 'alert';

  if (Array.isArray(G.kgnLines)) {
    for (let i = G.kgnLines.length - 1; i >= 0; i--) {
      if (G.kgnLines[i].kgnKind === 'turn' && !G.kgnLines[i].text.includes(' | ')) {
        G.kgnLines[i].text = `${G.kgnLines[i].text} | ${suffix}`;
        G.kgnLines[i].tone = tone;
        return;
      }
    }
  }
  pushKgnLine(G, suffix, tone);
}

export function logKgnSubLine(G, text, tone = 'info') {
  pushKgnLine(G, `   ${text}`, tone);
}

function findOrStartBureaucracyLine(G, playerId) {
  const pTag = formatKgnPlayer(playerId);
  if (Array.isArray(G.kgnLines) && G.kgnLines.length > 0) {
    const last = G.kgnLines[G.kgnLines.length - 1];
    if (last.kgnKind === 'bureaucracy' && last.kgnPlayer === String(playerId) && !last.kgnEnded) {
      return last;
    }
  }
  G.kgnBureaucracyTurnNum = (G.kgnBureaucracyTurnNum || 0) + 1;
  const initFund = G.players?.[playerId]?.bureaucracyInitialFunding ?? G.players?.[playerId]?.funding ?? 0;
  return pushKgnLine(G, `B${G.kgnBureaucracyTurnNum}. ${pTag}(K${initFund}):`, 'info', {
    kgnKind: 'bureaucracy',
    kgnPlayer: String(playerId),
    kgnEnded: false
  });
}

export function logKgnBureaucracyAction(G, playerId, actionInfo) {
  if (!G) return;
  const entry = findOrStartBureaucracyLine(G, playerId);
  const token = formatKgnBureaucracyAction(actionInfo);
  const sep = entry.text.endsWith(':') ? ' ' : ', ';
  entry.text = `${entry.text}${sep}${token}`;
}

export function logKgnBureaucracyEnd(G, playerId) {
  if (!G) return;
  const entry = findOrStartBureaucracyLine(G, playerId);
  const sep = entry.text.endsWith(':') ? ' ' : ', ';
  entry.text = `${entry.text}${sep}End`;
  entry.kgnEnded = true;
}

export function logKgnResult(G) {
  if (!G || !G.winner) return;
  const resTag = G.winner === 'draw' ? 'Draw' : formatKgnPlayer(G.winner);
  if (Array.isArray(G.kgnLines) && G.kgnLines.length > 0) {
    const last = G.kgnLines[G.kgnLines.length - 1];
    if (!last.text.includes(' # ')) {
      last.text = `${last.text} # ${resTag}`;
      last.tone = 'win';
      return;
    }
  }
  pushKgnLine(G, `# ${resTag}`, 'win');
}

export function exportKgnDocument(G, getPlayerLabel = null) {
  const playerIds = Object.keys(G?.players || {}).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const dateStr = new Date().toISOString().slice(0, 10);
  const result = G?.winner
    ? (G.winner === 'draw' ? 'Draw' : formatKgnPlayer(G.winner))
    : '*';

  const headers = [
    '[Format "KGN 1.0"]',
    `[Date "${dateStr}"]`,
    `[Players "${playerIds.length || G?.numPlayers || 3}"]`,
    ...playerIds.map((id) => {
      const name = getPlayerLabel ? getPlayerLabel(id) : `Player ${parseInt(id, 10) + 1}`;
      return `[${formatKgnPlayer(id)} "${String(name).replace(/"/g, '\\"')}"]`;
    }),
    `[Result "${result}"]`
  ];

  const body = (Array.isArray(G?.kgnLines) ? G.kgnLines : []).map((entry) => entry.text);
  return `${headers.join('\n')}\n\n${body.join('\n')}\n`;
}
