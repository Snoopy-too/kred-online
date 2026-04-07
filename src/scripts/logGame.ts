// src/scripts/logGame.ts
// Runs a single game and writes every action to a markdown log file.
import { SeededRandom } from '../engine/seededRandom';
import { createInitialState, gameReducer, InvariantViolationError, ActionError } from '../engine/gameStateMachine';
import { randomBot } from '../engine/randomBot';
import { TurnPhase, type KredGameState, type KredAction } from '../engine/types';
import { checkSupportViolations } from '../engine/moveValidation';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const playerCount = parseInt(getArg('players', '3')) as 3 | 4 | 5;
const seed = parseInt(getArg('seed', String(Date.now())));
const outputFile = getArg('out', 'TEST_1_LOG.md');
const MAX_ACTIONS = 2000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAction(action: KredAction, actionIndex: number): string {
  switch (action.type) {
    case 'MAKE_MOVES': {
      const moves = action.moves.map(m =>
        `\`${m.moveType}\` piece \`${m.pieceId}\` from \`${m.fromLocationId}\` → \`${m.toLocationId}\``
      ).join(', ');
      return `**[${actionIndex}] MAKE_MOVES** (P${action.playerId}) — ${moves || '_no moves_'}`;
    }
    case 'SELECT_TILE':
      return `**[${actionIndex}] SELECT_TILE** (P${action.playerId}) → Tile \`${action.tileId}\` played to P${action.receiverPlayerId}`;
    case 'RECEIVER_DECISION':
      return `**[${actionIndex}] RECEIVER_DECISION** (P${action.playerId}) → \`${action.decision}\``;
    case 'BYSTANDER_DECISION':
      return `**[${actionIndex}] BYSTANDER_DECISION** (P${action.playerId}) → \`${action.decision}\``;
    case 'RESOLVE_SUPPORT':
      return `**[${actionIndex}] RESOLVE_SUPPORT** (P${action.playerId}) — move \`${action.pieceId}\` → \`${action.targetLocationId}\``;
    case 'BUREAUCRACY_PURCHASE':
      return `**[${actionIndex}] BUREAUCRACY_PURCHASE** (P${action.playerId}) — item \`${action.menuItemId}\`${action.targetPieceId ? ` piece \`${action.targetPieceId}\`` : ''}${action.targetLocationId ? ` → \`${action.targetLocationId}\`` : ''}`;
    case 'END_BUREAUCRACY_TURN':
      return `**[${actionIndex}] END_BUREAUCRACY_TURN** (P${action.playerId})`;
    default:
      return `**[${actionIndex}] UNKNOWN ACTION**`;
  }
}

function formatPieces(state: KredGameState): string {
  const byLocation: Record<string, string[]> = {};
  for (const p of state.pieces) {
    if (!byLocation[p.locationId]) byLocation[p.locationId] = [];
    byLocation[p.locationId].push(`${p.type[0]}:${p.id}`);
  }
  return Object.entries(byLocation)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([loc, pieces]) => `  - \`${loc}\`: ${pieces.join(', ')}`)
    .join('\n');
}

function formatPlayerState(state: KredGameState): string {
  return state.players.map(p =>
    `  - **P${p.id}** · Cred: ${p.credibility} · Hand: [${p.hand.join(', ')}] · BankDown: [${p.bankFaceDown.join(', ')}] · BankUp: [${p.bankFaceUp.join(', ')}]`
  ).join('\n');
}

function getActivePlayer(state: KredGameState): number | null {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
    case TurnPhase.SELECTING_TILE:
      return state.turn.moverId;
    case TurnPhase.AWAITING_RECEIPT:
      return state.turn.receiverId;
    case TurnPhase.AWAITING_CHALLENGES:
      return state.turn.pendingBystanders[0] ?? null;
    case TurnPhase.BUREAUCRACY:
      return state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex] ?? null;
    case TurnPhase.RESOLVE_SUPPORT: {
      const violations = checkSupportViolations(state.pieces, state.config.playerCount);
      return violations[0]?.playerId ?? null;
    }
    default:
      return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

console.log(`Running single game: ${playerCount} players, seed ${seed}`);

const rng = new SeededRandom(seed);
let state = createInitialState({ playerCount, seed });
const lines: string[] = [];

lines.push(`# KRED Game Log`);
lines.push(`**Players:** ${playerCount} | **Seed:** ${seed}`);
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Initial State');
lines.push('**Board:**');
lines.push(formatPieces(state));
lines.push('**Players:**');
lines.push(formatPlayerState(state));
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Actions');
lines.push('');

let actionCount = 0;
let lastCampaign = state.campaign.number;
let lastPhase = state.turn.phase;
let terminated = false;
let terminationReason = '';
const MAX_RETRIES_PER_TURN = 50; // safety cap if bot is completely stuck

while (state.turn.phase !== TurnPhase.GAME_OVER && actionCount < MAX_ACTIONS) {
  // Log campaign/phase transitions
  if (state.campaign.number !== lastCampaign) {
    lines.push(`### 🗳️ Campaign ${state.campaign.number} Begins`);
    lines.push('');
    lastCampaign = state.campaign.number;
  }
  if (state.turn.phase !== lastPhase) {
    lines.push(`> **Phase:** \`${lastPhase}\` → \`${state.turn.phase}\``);
    lines.push('');
    lastPhase = state.turn.phase;
  }

  const activePlayerId = getActivePlayer(state);
  if (activePlayerId === null) {
    terminationReason = 'No active player found — deadlock.';
    terminated = true;
    break;
  }

  // Retry loop: engine is the guardrail; bot retries on rejection
  let accepted = false;
  for (let attempt = 0; attempt < MAX_RETRIES_PER_TURN; attempt++) {
    const action = randomBot(state, activePlayerId, rng);

    try {
      state = gameReducer(state, action);
      lines.push(formatAction(action, actionCount + 1));
      accepted = true;
      break;
    } catch (err) {
      if (err instanceof InvariantViolationError) {
        lines.push(formatAction(action, actionCount + 1));
        lines.push(`> ❌ **INVARIANT VIOLATION** \`${err.invariantName}\`: ${err.details}`);
        terminationReason = `Invariant violation: ${err.invariantName} — ${err.details}`;
        terminated = true;
        break;
      }
      // ActionError from engine — bot retries (engine is the guardrail)
      if (err instanceof Error && state.turn.phase === TurnPhase.BUREAUCRACY) {
        // Bureaucracy fallback: end turn
        lines.push(`> ⚠️ **Bureaucracy fallback** (attempt ${attempt + 1}): ${err.message}`);
        try {
          state = gameReducer(state, { type: 'END_BUREAUCRACY_TURN', playerId: activePlayerId });
          accepted = true;
        } catch { /* give up on bureaucracy */ }
        break;
      }
      // All other phases: log retry as warning, bot will try a different move
      if (attempt === 0) {
        // Only log the first rejection to avoid noise
        lines.push(`> ⚠️ **Engine rejected move** (P${activePlayerId}, retrying...): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  if (terminated) break;

  if (!accepted) {
    terminationReason = `Bot could not find a legal move after ${MAX_RETRIES_PER_TURN} attempts (P${activePlayerId}, Phase: ${state.turn.phase}).`;
    terminated = true;
    break;
  }

  actionCount++;
}

// ─── Outcome ────────────────────────────────────────────────────────────────

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Outcome');

if (state.turn.phase === TurnPhase.GAME_OVER) {
  const winners: number[] = [];
  for (let p = 1; p <= playerCount; p++) {
    const office = state.pieces.find(pc => pc.locationId === `p${p}_office`);
    const r1 = state.pieces.find(pc => pc.locationId === `p${p}_rostrum1`);
    const r2 = state.pieces.find(pc => pc.locationId === `p${p}_rostrum2`);
    const allSeats = Array.from({ length: 6 }, (_, i) => `p${p}_seat${i + 1}`);
    const seatsOk = allSeats.every(s => state.pieces.some(pc => pc.locationId === s));
    if (office?.type === 'PAWN' && r1 && r1.type !== 'MARK' && r2 && r2.type !== 'MARK' && seatsOk) {
      winners.push(p);
    }
  }
  if (winners.length > 1) {
    lines.push(`🤝 **DRAW** — Players ${winners.map(w => `P${w}`).join(', ')} all meet the win condition.`);
  } else if (winners.length === 1) {
    lines.push(`🏆 **WINNER: P${winners[0]}** wins in Campaign ${state.campaign.number} after ${actionCount} actions!`);
  } else {
    lines.push(`🎮 **GAME OVER** — ${actionCount} actions, Campaign ${state.campaign.number}.`);
  }
} else if (!terminated && actionCount >= MAX_ACTIONS) {
  lines.push(`⏱️ **STALEMATE** — Reached ${MAX_ACTIONS} action limit without a winner.`);
} else if (terminated) {
  lines.push(`💥 **TERMINATED** — ${terminationReason}`);
}

lines.push('');
lines.push(`**Total actions:** ${actionCount} | **Campaigns:** ${state.campaign.number}`);
lines.push('');
lines.push('## Final Board State');
lines.push('**Pieces:**');
lines.push(formatPieces(state));
lines.push('');
lines.push('**Players:**');
lines.push(formatPlayerState(state));

// ─── Write ───────────────────────────────────────────────────────────────────

const outPath = path.resolve(process.cwd(), outputFile);
fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log(`\nLog written to: ${outPath}`);
console.log(`Total actions: ${actionCount}`);
