// src/engine/randomBot.ts
import { getTileRequirements, DefinedMoveType } from '@kred/shared';
import {
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
} from '../config/bureaucracy';
import { findLegalMoves } from './moveValidation';
import { determineHonesty } from './outcomeResolution';
import { SeededRandom } from './seededRandom';
import {
  TurnPhase,
  type KredGameState,
  type KredAction,
  type KredPiece,
  type EngineMove,
  type ResolveSupport,
} from './types';
import { checkSupportViolations } from './moveValidation';

/**
 * Given the current game state and which player the bot is acting as,
 * returns a valid KredAction for the current phase.
 */
export function randomBot(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
      return botMakeMoves(state, playerId, rng);
    case TurnPhase.SELECTING_TILE:
      return botSelectTile(state, playerId, rng);
    case TurnPhase.AWAITING_RECEIPT:
      return botReceiverDecision(state, playerId, rng);
    case TurnPhase.AWAITING_CHALLENGES:
      return botBystanderDecision(state, playerId, rng);
    case TurnPhase.BUREAUCRACY:
      return botBureaucracy(state, playerId, rng);
    case TurnPhase.RESOLVE_SUPPORT:
      return botResolveSupport(state, playerId, rng);
    default:
      throw new Error(`randomBot: unexpected phase ${state.turn.phase}`);
  }
}

// ============================================================================
// PHASE HANDLERS
// ============================================================================

function botMakeMoves(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;
  const { playerCount } = state.config;

  // Decide honest (70%) or bluff (30%)
  const isHonest = rng.next() < 0.7;

  // Pick a tile from hand to base moves on
  const tileId = rng.pick(player.hand);
  const req = getTileRequirements(tileId);
  const requiredMoves = req?.requiredMoves ?? [];

  if (isHonest && requiredMoves.length > 0) {
    // Try to find honest moves for the tile's requirements
    const moves = buildHonestMoves(playerId, requiredMoves, state.pieces, playerCount, rng);
    if (moves !== null) {
      return { type: 'MAKE_MOVES', playerId, moves };
    }
  }

  // Bluff or fallback: pick 1-3 legal moves we can find
  const moveCount = rng.weightedChoice([
    { value: 1, weight: 20 },
    { value: 2, weight: 50 },
    { value: 3, weight: 30 },
  ]);
  const fallbackMoves = buildAnyLegalMoves(playerId, state.pieces, playerCount, rng, moveCount);
  return { type: 'MAKE_MOVES', playerId, moves: fallbackMoves };
}

/**
 * Tries to build a sequence of legal moves that satisfy the tile's required move types.
 * Returns null if it cannot find moves for all required types.
 */
function buildHonestMoves(
  playerId: number,
  requiredMoveTypes: DefinedMoveType[],
  pieces: KredPiece[],
  playerCount: number,
  rng: SeededRandom
): EngineMove[] | null {
  const moves: EngineMove[] = [];
  // Work with a mutable clone of pieces so we can simulate moves sequentially
  let simulatedPieces = pieces.map(p => ({ ...p }));

  for (const moveType of requiredMoveTypes) {
    const legal = findLegalMoves(moveType, playerId, simulatedPieces, playerCount);
    if (legal.length === 0) return null;

    // Filter to pieces not already used in this turn (separate-pieces rule)
    const usedPieceIds = new Set(moves.map(m => m.pieceId));
    const available = legal.filter(m => !usedPieceIds.has(m.pieceId));
    if (available.length === 0) return null;
    const chosen = rng.pick(available);

    moves.push(chosen);
    // Apply the move to the simulated pieces so subsequent moves see the updated board
    simulatedPieces = simulatedPieces.map(p =>
      p.id === chosen.pieceId ? { ...p, locationId: chosen.toLocationId } : p
    );
  }

  return moves;
}

/**
 * Builds up to `count` legal moves of any type, without repeating piece IDs.
 */
function buildAnyLegalMoves(
  playerId: number,
  pieces: KredPiece[],
  playerCount: number,
  rng: SeededRandom,
  count: number
): EngineMove[] {
  const moves: EngineMove[] = [];
  let simulatedPieces = pieces.map(p => ({ ...p }));

  for (let i = 0; i < count; i++) {
    const usedPieceIds = new Set(moves.map(m => m.pieceId));

    // Gather all legal moves across all types
    let allLegal: EngineMove[] = [];
    const moveTypes = [
      { type: DefinedMoveType.ADVANCE, weight: 100 },
      { type: DefinedMoveType.ORGANIZE, weight: 60 },
      { type: DefinedMoveType.ASSIST, weight: 40 },
      { type: DefinedMoveType.INFLUENCE, weight: 40 },
      { type: DefinedMoveType.REMOVE, weight: 30 },
      { type: DefinedMoveType.WITHDRAW, weight: 10 },
    ];

    for (const { type, weight } of moveTypes) {
      const legal = findLegalMoves(type, playerId, simulatedPieces, playerCount);
      const filtered = legal.filter(m => !usedPieceIds.has(m.pieceId));
      for (const m of filtered) {
        // Double weight if it moves TO the player's own domain
        const isToMyDomain = m.toLocationId.startsWith(`p${playerId}_`);
        const finalWeight = isToMyDomain ? weight * 2 : weight;
        
        // Add to pool multiple times to simulate weighted pick
        for (let w = 0; w < finalWeight; w++) {
          allLegal.push(m);
        }
      }
    }

    if (allLegal.length === 0) break;
    const chosen = rng.pick(allLegal);
    moves.push(chosen);
    simulatedPieces = simulatedPieces.map(p =>
      p.id === chosen.pieceId ? { ...p, locationId: chosen.toLocationId } : p
    );
  }

  return moves;
}

function botSelectTile(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;
  const tileId = rng.pick(player.hand);

  // Pick a random opponent who has tiles in hand
  const opponents = state.players.filter(
    p => p.id !== playerId && p.hand.length > 0
  );
  // Fallback to any opponent if all hands are empty (shouldn't happen, but be safe)
  const pool = opponents.length > 0
    ? opponents
    : state.players.filter(p => p.id !== playerId);
  const receiver = rng.pick(pool);

  return {
    type: 'SELECT_TILE',
    playerId,
    tileId,
    receiverPlayerId: receiver.id,
  };
}

function botReceiverDecision(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Zero cred: must ACCEPT_BLIND
  if (player.credibility === 0) {
    return { type: 'RECEIVER_DECISION', playerId, decision: 'ACCEPT_BLIND' };
  }

  const isHonest = determineHonesty(state);

  let decision: 'ACCEPT' | 'ACCEPT_BLIND' | 'REJECT';
  if (isHonest) {
    // Honest tile: ACCEPT 80%, ACCEPT_BLIND 20%
    decision = rng.weightedChoice([
      { value: 'ACCEPT' as const, weight: 80 },
      { value: 'ACCEPT_BLIND' as const, weight: 20 },
    ]);
  } else {
    // Dishonest tile: ACCEPT 60%, REJECT 20%, ACCEPT_BLIND 20%
    decision = rng.weightedChoice([
      { value: 'ACCEPT' as const, weight: 60 },
      { value: 'REJECT' as const, weight: 20 },
      { value: 'ACCEPT_BLIND' as const, weight: 20 },
    ]);
  }

  return { type: 'RECEIVER_DECISION', playerId, decision };
}

function botBystanderDecision(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Zero cred: must PASS
  if (player.credibility === 0) {
    return { type: 'BYSTANDER_DECISION', playerId, decision: 'PASS' };
  }

  // PASS 80%, CHALLENGE 20%
  const decision = rng.weightedChoice([
    { value: 'PASS' as const, weight: 80 },
    { value: 'CHALLENGE' as const, weight: 20 },
  ]);

  return { type: 'BYSTANDER_DECISION', playerId, decision };
}

function botBureaucracy(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const funding = state.bureaucracy.remainingFunding[playerId] ?? 0;
  const menu = state.config.playerCount === 5
    ? FIVE_PLAYER_BUREAUCRACY_MENU
    : THREE_FOUR_PLAYER_BUREAUCRACY_MENU;

  // Find all affordable items that have valid targets
  const options: Array<{
    action: KredAction;
    weight: number;
  }> = [];

  for (const item of menu) {
    if (item.price > funding) continue;

    if (item.type === 'CREDIBILITY') {
      const player = state.players.find(p => p.id === playerId)!;
      if (player.credibility < 3) {
        options.push({
          action: { type: 'BUREAUCRACY_PURCHASE', playerId, menuItemId: item.id },
          weight: player.credibility === 0 ? 500 : 100, // Desperate for credibility if 0
        });
      }
    } else if (item.type === 'PROMOTION') {
      const promotablePieces = findPromotablePieces(state, playerId, item.promotionLocation!);
      for (const piece of promotablePieces) {
        options.push({
          action: {
            type: 'BUREAUCRACY_PURCHASE',
            playerId,
            menuItemId: item.id,
            targetPieceId: piece.id
          },
          weight: 200, // Very high priority
        });
      }
    } else if (item.type === 'MOVE') {
      const moveType = item.moveType as DefinedMoveType;
      const legalMoves = findLegalMoves(moveType, playerId, state.pieces, state.config.playerCount);
      for (const move of legalMoves) {
        const isToMyDomain = move.toLocationId.startsWith(`p${playerId}_`);
        let weight = 50;
        if (moveType === DefinedMoveType.ADVANCE) weight = 150;
        if (moveType === DefinedMoveType.WITHDRAW) weight = 5;
        if (isToMyDomain) weight *= 2;

        options.push({
          action: {
            type: 'BUREAUCRACY_PURCHASE',
            playerId,
            menuItemId: item.id,
            targetPieceId: move.pieceId,
            targetLocationId: move.toLocationId
          },
          weight,
        });
      }
    }
  }

  // Lower stop chance (10%) to encourage spending
  if (options.length === 0 || rng.next() < 0.1) {
    return { type: 'END_BUREAUCRACY_TURN', playerId };
  }

  const choice = rng.weightedChoice(options.map(o => ({ value: o.action, weight: o.weight })));
  return choice;
}

function botResolveSupport(
  state: KredGameState,
  playerId: number,
  rng: SeededRandom
): KredAction {
  const violations = checkSupportViolations(state.pieces, state.config.playerCount);
  const myViolation = violations.find(v => v.playerId === playerId);

  if (!myViolation) {
    // If no violations for this player, maybe wait for others?
    // Actually, RESOLVE_SUPPORT should only be active for the player who needs to act.
    // For now, return a dummy move if no violation found (should be handled by state machine)
    return { type: 'END_BUREAUCRACY_TURN', playerId } as any; 
  }

  if (myViolation.type === 'OFFICE') {
    // Move from Office to one of the rostrums
    const targetRostrum = rng.next() < 0.5 ? 'rostrum1' : 'rostrum2';
    const action: ResolveSupport = {
      type: 'RESOLVE_SUPPORT',
      playerId,
      pieceId: myViolation.pieceId,
      targetLocationId: `p${playerId}_${targetRostrum}`,
    };
    return action;
  } else {
    // Move from Rostrum to one of the supporting seats
    const isR1 = myViolation.locationId.includes('rostrum1');
    const seats = isR1 ? [1, 2, 3] : [4, 5, 6];
    const targetSeatNum = seats[Math.floor(rng.next() * 3)];
    const action: ResolveSupport = {
      type: 'RESOLVE_SUPPORT',
      playerId,
      pieceId: myViolation.pieceId,
      targetLocationId: `p${playerId}_seat${targetSeatNum}`,
    };
    return action;
  }
}
function findPromotablePieces(
  state: KredGameState,
  playerId: number,
  promotionLocation: string
): KredPiece[] {
  const hasPawn = state.pieces.some(
    p => p.type === 'PAWN' && p.locationId.startsWith(`p${playerId}_`)
  );

  return state.pieces.filter(piece => {
    // Can't promote Pawns
    if (piece.type === 'PAWN') return false;
    // Can't promote Heel to Pawn if player already has one
    if (piece.type === 'HEEL' && hasPawn) return false;

    const loc = piece.locationId;
    const ownerMatch = loc.match(/^p(\d+)_/);
    if (!ownerMatch || parseInt(ownerMatch[1]) !== playerId) return false;

    if (promotionLocation === 'OFFICE') return loc.includes('_office');
    if (promotionLocation === 'ROSTRUM') return loc.includes('_rostrum');
    if (promotionLocation === 'SEAT') return loc.includes('_seat');
    return false;
  });
}
