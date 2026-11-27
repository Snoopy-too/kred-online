import { parseLocation } from './board.js';

const PIECE_CODE = {
  Mark: 'm',
  Heel: 'h',
  Pawn: 'p'
};

export function formatKgnPlayer(playerId) {
  const idx = parseInt(playerId, 10);
  return Number.isInteger(idx) && idx >= 0 && idx < 26 ? String.fromCharCode(65 + idx) : String(playerId);
}

export function formatKgnLoc(loc) {
  if (!loc) return '?';
  const p = parseLocation(loc);
  if (!p) return String(loc);
  if (p.type === 'community') return 'c';
  const owner = formatKgnPlayer(p.playerId);
  if (p.type === 'office') return `${owner}o`;
  if (p.type === 'rostrum') return `${owner}r${p.index}`;
  if (p.type === 'seat') return `${owner}s${p.index}`;
  return String(loc);
}

export function formatKgnMove(move, boardBefore = null, boardAfter = null) {
  if (!move || !move.from || !move.to) return '';
  let fromStr = formatKgnLoc(move.from);
  if (fromStr === 'c') {
    const pieceType = boardBefore?.[move.from]?.type || boardAfter?.[move.to]?.type || move.pieceType;
    if (PIECE_CODE[pieceType]) fromStr = PIECE_CODE[pieceType];
  }
  return `${fromStr}>${formatKgnLoc(move.to)}`;
}

export function formatKgnMoves(moves = [], boardBefore = null, boardAfter = null) {
  const parts = (moves || []).map((m) => formatKgnMove(m, boardBefore, boardAfter)).filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'pass';
}

export function formatKgnBureaucracyAction({ actionType, targetLoc, pieceType, subAction, boardBefore = null, boardAfter = null }) {
  if (actionType === 'RESTORE_CRED') return '+1';
  if (actionType === 'PROMOTE_SEAT' || actionType === 'PROMOTE_ROSTRUM' || actionType === 'PROMOTE_OFFICE') {
    const pCode = PIECE_CODE[pieceType] || pieceType || '?';
    return `${formatKgnLoc(targetLoc)}>${pCode}`;
  }
  if (subAction) return formatKgnMove(subAction, boardBefore, boardAfter);
  return String(actionType || '');
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
  } else if (phase === 'bureaucracy') {
    G.kgnBureaucracyCount = (G.kgnBureaucracyCount || 0) + 1;
    G.kgnBureaucracyTurnNum = 0;
  }
}

export function logKgnCampaignPlay(G, moverId, receiverId, moves = [], boardBefore = null) {
  if (!G) return;
  G.kgnTurnCount = (G.kgnTurnCount || 0) + 1;
  const text = `${G.kgnTurnCount}.${formatKgnPlayer(moverId)} ${formatKgnMoves(moves, boardBefore, G.boardState)} @${formatKgnPlayer(receiverId)}`;
  pushKgnLine(G, text, 'play', { kgnKind: 'turn', kgnReceiver: String(receiverId), kgnResolved: false });
}

export function logKgnOutcome(G, code, { challengerId = null, receiverId = null, tileId = null } = {}) {
  if (!G) return;
  const tone = code === 'Q' ? 'accept' : code === 'W' ? 'warn' : 'alert';

  let entry = null;
  if (Array.isArray(G.kgnLines)) {
    for (let i = G.kgnLines.length - 1; i >= 0; i--) {
      if (G.kgnLines[i].kgnKind === 'turn' && !G.kgnLines[i].kgnResolved) {
        entry = G.kgnLines[i];
        break;
      }
    }
  }

  let suffix = '';
  if (code !== 'Q') {
    const tilePart = tileId ? `[${tileId}]` : '';
    const mark = code === 'W' ? '?' : '!';
    const actorId = code === 'B' ? (receiverId ?? entry?.kgnReceiver) : challengerId;
    const actorPart = actorId !== null && actorId !== undefined ? `${mark}${formatKgnPlayer(actorId)}` : mark;
    suffix = [tilePart, actorPart].filter(Boolean).join(' ');
  }

  if (entry) {
    if (suffix) entry.text = `${entry.text} ${suffix}`;
    entry.tone = tone;
    entry.kgnResolved = true;
    return;
  }
  if (suffix) pushKgnLine(G, suffix, tone);
}

export function logKgnSubLine(G, text, tone = 'info') {
  if (!G || !text) return;
  if (Array.isArray(G.kgnLines) && G.kgnLines.length > 0) {
    const last = G.kgnLines[G.kgnLines.length - 1];
    if (last.kgnKind === 'turn' || last.kgnKind === 'bureaucracy') {
      last.text = `${last.text} ${text}`;
      return;
    }
  }
  pushKgnLine(G, text, tone);
}

export function logKgnReward(G, reward) {
  if (!G || !reward) return;
  const token = reward.startsWith('+') ? reward : `+${reward}`;
  if (Array.isArray(G.kgnLines) && G.kgnLines.length > 0) {
    const last = G.kgnLines[G.kgnLines.length - 1];
    if (last.kgnKind === 'turn' && /![A-Z](?=\s|$)/.test(last.text)) {
      last.text = last.text.replace(/(![A-Z])(?=\s|$)/, `$1${token}`);
      return;
    }
  }
  logKgnSubLine(G, token);
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
  return pushKgnLine(G, `b${G.kgnBureaucracyTurnNum}.${pTag}(${initFund})`, 'info', {
    kgnKind: 'bureaucracy',
    kgnPlayer: String(playerId),
    kgnEnded: false
  });
}

export function logKgnBureaucracyAction(G, playerId, actionInfo) {
  if (!G) return;
  const entry = findOrStartBureaucracyLine(G, playerId);
  const token = formatKgnBureaucracyAction(actionInfo);
  if (token) entry.text = `${entry.text} ${token}`;
}

export function logKgnBureaucracyEnd(G, playerId) {
  if (!G) return;
  const entry = findOrStartBureaucracyLine(G, playerId);
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
