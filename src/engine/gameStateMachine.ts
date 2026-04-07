// src/engine/gameStateMachine.ts
import {
  DefinedMoveType,
  TILE_KREDCOIN_VALUES,
  getNextPlayerClockwise,
  getTileRequirements,
} from '@kred/shared';
import {
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU,
} from '../config/bureaucracy';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../config/pieces';
import { SeededRandom } from './seededRandom';
import {
  validateMove,
  checkSupportViolations,
  isValidTileCombination,
} from './moveValidation';
import { TILE_REQUIREMENTS } from '../config/rules';
import {
  determineHonesty,
  resolveQuietIsKept,
  resolveWhistleBlown,
  resolveSmokingGun,
  resolveWitchHunt,
} from './outcomeResolution';
import { runAllInvariants } from './invariants';
import {
  TurnPhase,
  type KredGameState,
  type KredPiece,
  type EnginePlayer,
  type EngineMove,
  type KredAction,
  type MakeMoves,
  type SelectTile,
  type ReceiverDecision,
  type BystanderDecision,
  type ResolveSupport,
  type BureaucracyPurchase,
  type EndBureaucracyTurn,
  type InvariantResult,
} from './types';

// ============================================================================
// ERROR TYPES
// ============================================================================

export class InvariantViolationError extends Error {
  constructor(
    public readonly invariantName: string,
    public readonly details: string,
  ) {
    super(`Invariant violation [${invariantName}]: ${details}`);
    this.name = 'InvariantViolationError';
  }
}

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionError';
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function cloneState(state: KredGameState): KredGameState {
  return JSON.parse(JSON.stringify(state));
}

function getPlayer(state: KredGameState, id: number): EnginePlayer {
  const p = state.players.find(p => p.id === id);
  if (!p) throw new ActionError(`Player ${id} not found`);
  return p;
}

/** All tile IDs in the game (01..24), padded to 2 digits */
function buildTileDeck(playerCount: 3 | 4 | 5): string[] {
  const tiles: string[] = [];
  for (let i = 1; i <= 24; i++) {
    tiles.push(i.toString().padStart(2, '0'));
  }
  if (playerCount === 5) {
    tiles.push('BLANK');
  }
  return tiles;
}

/** Seat numbers that start occupied for a given player count */
function startingSeats(playerCount: 3 | 4 | 5): number[] {
  if (playerCount === 4) return [2, 4, 6];
  // 3 and 5 player: seats 1, 3, 5
  return [1, 3, 5];
}

/** Hand size by player count */
function handSize(playerCount: 3 | 4 | 5): number {
  if (playerCount === 3) return 8;
  if (playerCount === 4) return 6;
  return 5; // 5-player: 25 tiles / 5 = 5
}

// ============================================================================
// CREATE INITIAL STATE
// ============================================================================

export function createInitialState(config: {
  playerCount: 3 | 4 | 5;
  seed: number;
}): KredGameState {
  const { playerCount, seed } = config;
  const rng = new SeededRandom(seed);

  // 1. Build pieces
  const counts = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount];
  const pieces: KredPiece[] = [];
  let pieceIdx = 0;

  // Place starting Marks at seats
  const seats = startingSeats(playerCount);
  for (let p = 1; p <= playerCount; p++) {
    for (const s of seats) {
      pieces.push({
        id: `piece_${pieceIdx++}`,
        type: 'MARK',
        locationId: `p${p}_seat${s}`,
      });
    }
  }

  // Remaining pieces in community
  const marksInSeats = playerCount * 3;
  const remainingMarks = counts.MARK - marksInSeats;
  for (let i = 0; i < remainingMarks; i++) {
    pieces.push({ id: `piece_${pieceIdx++}`, type: 'MARK', locationId: 'community' });
  }
  for (let i = 0; i < counts.HEEL; i++) {
    pieces.push({ id: `piece_${pieceIdx++}`, type: 'HEEL', locationId: 'community' });
  }
  for (let i = 0; i < counts.PAWN; i++) {
    pieces.push({ id: `piece_${pieceIdx++}`, type: 'PAWN', locationId: 'community' });
  }

  // 2. Build and shuffle tile deck
  const tiles = buildTileDeck(playerCount);
  rng.shuffle(tiles);

  // 3. Create players and deal tiles
  const hSize = handSize(playerCount);
  const players: EnginePlayer[] = [];
  for (let p = 1; p <= playerCount; p++) {
    const hand = tiles.splice(0, hSize);
    players.push({
      id: p,
      hand,
      bankFaceDown: [],
      bankFaceUp: [],
      credibility: 3,
      credibilityAtTurnStart: 3,
    });
  }

  // 4. Find first mover (player with tile '03')
  const firstMover = players.find(p => p.hand.includes('03'));
  if (!firstMover) throw new Error('No player has tile 03 — tile distribution error');

  return {
    pieces,
    players,
    turn: {
      phase: TurnPhase.MOVING,
      moverId: firstMover.id,
      receiverId: null,
      movesExecuted: [],
      tilePlayedId: null,
      pendingBystanders: [],
      challengerId: null,
      isBluff: false,
    },
    campaign: { number: 1 },
    bureaucracy: {
      turnOrder: [],
      currentPlayerIndex: 0,
      remainingFunding: {},
    },
    config: { playerCount, seed },
    history: [],
    piecesBeforeMove: null,
    phaseBeforeSupport: null,
  };
}

// ============================================================================
// GAME REDUCER
// ============================================================================

export function gameReducer(state: KredGameState, action: KredAction): KredGameState {
  const stateBefore = cloneState(state);
  let newState = cloneState(state);

  switch (action.type) {
    case 'MAKE_MOVES':
      newState = handleMakeMoves(newState, action);
      break;
    case 'SELECT_TILE':
      newState = handleSelectTile(newState, action);
      break;
    case 'RECEIVER_DECISION':
      newState = handleReceiverDecision(newState, action);
      break;
    case 'BYSTANDER_DECISION':
      newState = handleBystanderDecision(newState, action);
      break;
    case 'RESOLVE_SUPPORT':
      newState = handleResolveSupport(newState, action);
      break;
    case 'BUREAUCRACY_PURCHASE':
      newState = handleBureaucracyPurchase(newState, action);
      break;
    case 'END_BUREAUCRACY_TURN':
      newState = handleEndBureaucracyTurn(newState, action);
      break;
    default:
      throw new ActionError(`Unknown action type: ${(action as KredAction).type}`);
  }

  // Append to history
  newState.history = [...newState.history, action];

  // Run invariants — skip during MOVING/SELECTING_TILE phases where tile is in-transit
  // (tile is in hand until SELECT_TILE resolves)
  // Also skip during BUREAUCRACY and GAME_OVER
  if (
    newState.turn.phase !== TurnPhase.BUREAUCRACY &&
    newState.turn.phase !== TurnPhase.GAME_OVER
  ) {
    const results = runAllInvariants(newState);
    const fatalNames = [
      'fundingChecksum',
      'pieceConservation',
      'onePawnPerPlayer',
      'credibilityBounds',
      'separatePiecesPerTurn',
      'removeRestrictions',
    ];
    const fatal = results.find(r => !r.passed && fatalNames.includes(r.name));
    if (fatal) {
      throw new InvariantViolationError(fatal.name, fatal.details || '');
    }

    const supportViolation = results.find(r => !r.passed && r.name === 'supportRule');
    if (supportViolation) {
      // If we are already in RESOLVE_SUPPORT, keep going until it's fixed
      // If not, switch to it
      if (newState.turn.phase !== TurnPhase.RESOLVE_SUPPORT) {
        newState.phaseBeforeSupport = newState.turn.phase;
        newState.turn.phase = TurnPhase.RESOLVE_SUPPORT;
      }
    } else if (newState.turn.phase === TurnPhase.RESOLVE_SUPPORT) {
      // Violations fixed! Return to previous phase
      newState.turn.phase = newState.phaseBeforeSupport ?? TurnPhase.MOVING;
      newState.phaseBeforeSupport = null;
    }
  }

  return newState;
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

function handleMakeMoves(state: KredGameState, action: MakeMoves): KredGameState {
  if (state.turn.phase !== TurnPhase.MOVING) {
    throw new ActionError(`MAKE_MOVES requires phase MOVING, got ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.moverId) {
    throw new ActionError(
      `MAKE_MOVES: player ${action.playerId} is not the mover (${state.turn.moverId})`
    );
  }

  // Snapshot pieces before move (for potential bluff revert)
  state.piecesBeforeMove = cloneState(state).pieces;

  // Update credibility snapshot at turn start
  const mover = getPlayer(state, action.playerId);
  mover.credibilityAtTurnStart = mover.credibility;

  // Validate and apply each move
  const appliedMoves: EngineMove[] = [];
  for (const move of action.moves) {
    if (!validateMove(move, action.playerId, state.pieces, state.config.playerCount)) {
      throw new ActionError(
        `Invalid move: ${move.moveType} piece ${move.pieceId} from ${move.fromLocationId} to ${move.toLocationId}`
      );
    }
    // Apply move
    const piece = state.pieces.find(p => p.id === move.pieceId);
    if (!piece) throw new ActionError(`Piece ${move.pieceId} not found`);
    piece.locationId = move.toLocationId;
    appliedMoves.push(move);
  }

  // Rule 287/477: Illegal move detection
  const executedTypes = appliedMoves.map(m => m.moveType);
  if (!isValidTileCombination(executedTypes, TILE_REQUIREMENTS)) {
    throw new ActionError(
      `Illegal play: Moves [${executedTypes.join(', ')}] do not match any existing tile.`
    );
  }

  state.turn.movesExecuted = appliedMoves;
  state.turn.phase = TurnPhase.SELECTING_TILE;

  return state;
}

function handleSelectTile(state: KredGameState, action: SelectTile): KredGameState {
  if (state.turn.phase !== TurnPhase.SELECTING_TILE) {
    throw new ActionError(`SELECT_TILE requires phase SELECTING_TILE, got ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.moverId) {
    throw new ActionError(
      `SELECT_TILE: player ${action.playerId} is not the mover (${state.turn.moverId})`
    );
  }

  const mover = getPlayer(state, action.playerId);
  if (!mover.hand.includes(action.tileId)) {
    throw new ActionError(
      `SELECT_TILE: tile ${action.tileId} not in player ${action.playerId}'s hand`
    );
  }

  // Validate receiver is a different player
  if (action.receiverPlayerId === action.playerId) {
    throw new ActionError('SELECT_TILE: receiver cannot be the mover');
  }
  const receiver = state.players.find(p => p.id === action.receiverPlayerId);
  if (!receiver) {
    throw new ActionError(`SELECT_TILE: receiver ${action.receiverPlayerId} not found`);
  }

  // Snapshot mover credibility at turn start (should already be set, but ensure)
  mover.credibilityAtTurnStart = mover.credibility;

  // Remove tile from hand (it becomes "in transit" tracked by tilePlayedId)
  const tileIdx = mover.hand.indexOf(action.tileId);
  mover.hand.splice(tileIdx, 1);

  state.turn.tilePlayedId = action.tileId;
  state.turn.receiverId = action.receiverPlayerId;
  state.turn.phase = TurnPhase.AWAITING_RECEIPT;

  // Auto-accept blind if receiver has 0 credibility
  if (receiver.credibility === 0) {
    return autoAcceptBlind(state);
  }

  return state;
}

function autoAcceptBlind(state: KredGameState): KredGameState {
  // Build bystander list (clockwise from mover, excluding mover+receiver, only cred>0)
  state.turn.pendingBystanders = buildBystanderList(state);
  state.turn.phase = TurnPhase.AWAITING_CHALLENGES;

  // If no bystanders, resolve immediately
  if (state.turn.pendingBystanders.length === 0) {
    return resolveQuietIsKeptAndAdvance(state);
  }

  return state;
}

function handleReceiverDecision(state: KredGameState, action: ReceiverDecision): KredGameState {
  if (state.turn.phase !== TurnPhase.AWAITING_RECEIPT) {
    throw new ActionError(`RECEIVER_DECISION requires phase AWAITING_RECEIPT, got ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.receiverId) {
    throw new ActionError(
      `RECEIVER_DECISION: player ${action.playerId} is not the receiver (${state.turn.receiverId})`
    );
  }

  if (action.decision === 'REJECT') {
    // Check honesty
    const honest = determineHonesty(state);
    if (!honest) {
      // Whistle Blown: mover was bluffing, receiver correctly rejected.
      // resolveWhistleBlown calls removeTileFromHand (no-op since tile was already
      // removed from hand in handleSelectTile) then pushes tile to receiver.bankFaceUp.
      state = resolveWhistleBlown(state);
    } else {
      // False rejection: mover was honest, receiver wrongly rejected.
      // Per game rules: pieces are restored, tile goes back to mover's hand,
      // receiver loses 1 credibility.
      // The tile was removed from hand in handleSelectTile, so we must restore it.
      const tileId = state.turn.tilePlayedId!;
      const mover = getPlayer(state, state.turn.moverId);
      mover.hand.push(tileId);
      // Restore pieces to before-move state
      if (state.piecesBeforeMove) {
        state.pieces = state.piecesBeforeMove;
      }
      state.piecesBeforeMove = null;
      const receiver = getPlayer(state, action.playerId);
      receiver.credibility = Math.max(0, receiver.credibility - 1);
    }
    return advanceToNextMover(state);
  }

  // ACCEPT or ACCEPT_BLIND — build bystander list
  state.turn.pendingBystanders = buildBystanderList(state);
  state.turn.phase = TurnPhase.AWAITING_CHALLENGES;

  // If no bystanders, resolve immediately
  if (state.turn.pendingBystanders.length === 0) {
    return resolveQuietIsKeptAndAdvance(state);
  }

  return state;
}

function handleBystanderDecision(state: KredGameState, action: BystanderDecision): KredGameState {
  if (state.turn.phase !== TurnPhase.AWAITING_CHALLENGES) {
    throw new ActionError(`BYSTANDER_DECISION requires phase AWAITING_CHALLENGES, got ${state.turn.phase}`);
  }

  // Remove this player from pending bystanders
  const idx = state.turn.pendingBystanders.indexOf(action.playerId);
  if (idx === -1) {
    throw new ActionError(
      `BYSTANDER_DECISION: player ${action.playerId} is not a pending bystander`
    );
  }
  state.turn.pendingBystanders.splice(idx, 1);

  if (action.decision === 'CHALLENGE') {
    state.turn.challengerId = action.playerId;
    const honest = determineHonesty(state);

    if (honest) {
      // Witch Hunt: challenger was wrong
      state = resolveWitchHunt(state);
    } else {
      // Smoking Gun: challenger was right
      state = resolveSmokingGun(state);
    }

    // After challenge resolution, advance to next mover
    return advanceToNextMover(state);
  }

  // PASS
  if (state.turn.pendingBystanders.length === 0) {
    // All bystanders passed, resolve Quiet is Kept
    return resolveQuietIsKeptAndAdvance(state);
  }

  return state;
}

function handleResolveSupport(state: KredGameState, action: ResolveSupport): KredGameState {
  if (state.turn.phase !== TurnPhase.RESOLVE_SUPPORT) {
    throw new ActionError(`RESOLVE_SUPPORT requires phase RESOLVE_SUPPORT, got ${state.turn.phase}`);
  }

  const piece = state.pieces.find(p => p.id === action.pieceId);
  if (!piece) throw new ActionError(`RESOLVE_SUPPORT: piece ${action.pieceId} not found`);

  piece.locationId = action.targetLocationId;

  // Check if still have violations
  const violations = checkSupportViolations(state.pieces, state.config.playerCount);
  if (violations.length === 0) {
    state.turn.phase = state.phaseBeforeSupport ?? TurnPhase.MOVING;
    state.phaseBeforeSupport = null;
  }

  return state;
}

function handleBureaucracyPurchase(state: KredGameState, action: BureaucracyPurchase): KredGameState {
  if (state.turn.phase !== TurnPhase.BUREAUCRACY) {
    throw new ActionError(`BUREAUCRACY_PURCHASE requires phase BUREAUCRACY, got ${state.turn.phase}`);
  }

  const currentPlayerId = state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex];
  if (action.playerId !== currentPlayerId) {
    throw new ActionError(
      `BUREAUCRACY_PURCHASE: not player ${action.playerId}'s turn (expected ${currentPlayerId})`
    );
  }

  const player = getPlayer(state, action.playerId);
  const funding = state.bureaucracy.remainingFunding[action.playerId] ?? 0;

  // Get menu
  const menu = state.config.playerCount === 5
    ? FIVE_PLAYER_BUREAUCRACY_MENU
    : THREE_FOUR_PLAYER_BUREAUCRACY_MENU;

  const item = menu.find((m: { id: string }) => m.id === action.menuItemId);
  if (!item) throw new ActionError(`BUREAUCRACY_PURCHASE: unknown menu item ${action.menuItemId}`);
  if (funding < item.price) {
    throw new ActionError(
      `BUREAUCRACY_PURCHASE: insufficient funding (${funding} < ${item.price})`
    );
  }

  state.bureaucracy.remainingFunding[action.playerId] = funding - item.price;

  if (item.type === 'CREDIBILITY') {
    player.credibility = Math.min(3, player.credibility + 1);
  } else if (item.type === 'PROMOTION') {
    if (!action.targetPieceId) throw new ActionError('BUREAUCRACY_PURCHASE: PROMOTION requires targetPieceId');
    const piece = state.pieces.find(p => p.id === action.targetPieceId);
    if (!piece) throw new ActionError(`BUREAUCRACY_PURCHASE: piece ${action.targetPieceId} not found`);
    
    const ownerMatch = piece.locationId.match(/^p(\d+)_/);
    const ownerId = ownerMatch ? parseInt(ownerMatch[1]) : null;

    if (piece.type === 'MARK') piece.type = 'HEEL';
    else if (piece.type === 'HEEL') {
      // Only one Pawn per player allowed
      // Check if player ALREADY has a Pawn in their domain
      if (ownerId !== null) {
        const hasPawn = state.pieces.some(
          p => p.type === 'PAWN' && p.locationId.startsWith(`p${ownerId}_`)
        );
        if (hasPawn) throw new ActionError(`BUREAUCRACY_PURCHASE: player ${ownerId} already has a Pawn in their domain`);
      }
      piece.type = 'PAWN';
    }
    else throw new ActionError(`BUREAUCRACY_PURCHASE: Pawn cannot be promoted`);
  } else if (item.type === 'MOVE') {
    if (!action.targetPieceId || !action.targetLocationId) {
      throw new ActionError('BUREAUCRACY_PURCHASE: MOVE requires targetPieceId and targetLocationId');
    }
    const piece = state.pieces.find(p => p.id === action.targetPieceId);
    if (!piece) throw new ActionError(`BUREAUCRACY_PURCHASE: piece ${action.targetPieceId} not found`);
    // Validate the move
    const moveType = item.moveType as DefinedMoveType;
    const move: EngineMove = {
      moveType,
      pieceId: action.targetPieceId,
      fromLocationId: piece.locationId,
      toLocationId: action.targetLocationId,
    };
    if (!validateMove(move, action.playerId, state.pieces, state.config.playerCount)) {
      throw new ActionError(`BUREAUCRACY_PURCHASE: invalid move`);
    }
    piece.locationId = action.targetLocationId;
  }

  return state;
}

function handleEndBureaucracyTurn(state: KredGameState, action: EndBureaucracyTurn): KredGameState {
  if (state.turn.phase !== TurnPhase.BUREAUCRACY) {
    throw new ActionError(`END_BUREAUCRACY_TURN requires phase BUREAUCRACY, got ${state.turn.phase}`);
  }

  const currentPlayerId = state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex];
  if (action.playerId !== currentPlayerId) {
    throw new ActionError(
      `END_BUREAUCRACY_TURN: not player ${action.playerId}'s turn`
    );
  }

  state.bureaucracy.currentPlayerIndex++;

  if (state.bureaucracy.currentPlayerIndex >= state.bureaucracy.turnOrder.length) {
    // All players done with bureaucracy
    // Check win condition
    const winners = state.players
      .map(p => p.id)
      .filter(id => checkWinCondition(state, id));

    if (winners.length > 0) {
      state.turn.phase = TurnPhase.GAME_OVER;
      return state;
    }

    // Start next campaign
    return startNextCampaign(state);
  }

  return state;
}

// ============================================================================
// WIN CONDITION (engine-side, uses piece.type not piece.name)
// ============================================================================

function checkWinCondition(state: KredGameState, playerId: number): boolean {
  // Rule 61: The blank tile cannot be used to achieve a winning setup.
  if (state.turn.tilePlayedId === 'BLANK') return false;

  const officeLocation = `p${playerId}_office`;
  const officePiece = state.pieces.find(p => p.locationId === officeLocation);
  if (!officePiece || officePiece.type !== 'PAWN') return false;

  const rostrum1 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum1`);
  const rostrum2 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum2`);
  // Must be HEEL or PAWN
  if (!rostrum1 || rostrum1.type === 'MARK') return false;
  if (!rostrum2 || rostrum2.type === 'MARK') return false;

  for (let i = 1; i <= 6; i++) {
    if (!state.pieces.some(p => p.locationId === `p${playerId}_seat${i}`)) return false;
  }

  return true;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildBystanderList(state: KredGameState): number[] {
  const { moverId, receiverId } = state.turn;
  const playerCount = state.config.playerCount;
  const bystanders: number[] = [];

  // Clockwise starting from next after mover
  let current = getNextPlayerClockwise(moverId, playerCount);
  const visited = new Set<number>();

  while (!visited.has(current)) {
    visited.add(current);
    if (current !== moverId && current !== receiverId) {
      const player = state.players.find(p => p.id === current);
      if (player && player.credibility > 0) {
        bystanders.push(current);
      }
    }
    current = getNextPlayerClockwise(current, playerCount);
  }

  return bystanders;
}

function resolveQuietIsKeptAndAdvance(state: KredGameState): KredGameState {
  state = resolveQuietIsKept(state);
  return advanceToNextMover(state);
}

function advanceToNextMover(state: KredGameState): KredGameState {
  const playerCount = state.config.playerCount;
  const currentReceiverId = state.turn.receiverId;

  // Receiver becomes next mover (if they have tiles), else find next clockwise with tiles
  let nextMoverId: number | null = null;

  if (currentReceiverId !== null) {
    const receiver = state.players.find(p => p.id === currentReceiverId);
    if (receiver && receiver.hand.length > 0) {
      nextMoverId = currentReceiverId;
    }
  }

  if (nextMoverId === null) {
    // Find next player clockwise from current mover who has tiles
    let candidate = getNextPlayerClockwise(state.turn.moverId, playerCount);
    const visited = new Set<number>();
    while (!visited.has(candidate)) {
      visited.add(candidate);
      const candidatePlayer = state.players.find(p => p.id === candidate);
      if (candidatePlayer && candidatePlayer.hand.length > 0) {
        nextMoverId = candidate;
        break;
      }
      candidate = getNextPlayerClockwise(candidate, playerCount);
    }
  }

  if (nextMoverId === null) {
    // No players have tiles — start Bureaucracy
    return startBureaucracy(state);
  }

  // Reset turn state for next mover
  const nextMover = getPlayer(state, nextMoverId);
  nextMover.credibilityAtTurnStart = nextMover.credibility;

  state.turn = {
    phase: TurnPhase.MOVING,
    moverId: nextMoverId,
    receiverId: null,
    movesExecuted: [],
    tilePlayedId: null,
    pendingBystanders: [],
    challengerId: null,
    isBluff: false,
  };
  state.piecesBeforeMove = null;
  state.phaseBeforeSupport = null;

  // Rule 445: Check win condition before next mover
  const winners = state.players
    .map(p => p.id)
    .filter(id => checkWinCondition(state, id));

  if (winners.length > 0) {
    state.turn.phase = TurnPhase.GAME_OVER;
    return state;
  }

  return state;
}

function startBureaucracy(state: KredGameState): KredGameState {
  // Calculate funding from bankFaceDown tiles
  const fundingByPlayer: { playerId: number; funding: number; player: EnginePlayer }[] = [];

  for (const player of state.players) {
    const funding = player.bankFaceDown.reduce((sum, tileId) => {
      const key = parseInt(tileId, 10);
      return sum + (TILE_KREDCOIN_VALUES[key] ?? 0);
    }, 0);
    fundingByPlayer.push({ playerId: player.id, funding, player });
  }

  // Sort by funding desc, tiebreakers: Pawn in domain > Heels in domain > Marks in domain > credibility
  fundingByPlayer.sort((a, b) => {
    if (b.funding !== a.funding) return b.funding - a.funding;

    // Tiebreaker: pawn count in own domain
    const pawnsA = state.pieces.filter(
      p => p.type === 'PAWN' && p.locationId.startsWith(`p${a.playerId}_`)
    ).length;
    const pawnsB = state.pieces.filter(
      p => p.type === 'PAWN' && p.locationId.startsWith(`p${b.playerId}_`)
    ).length;
    if (pawnsB !== pawnsA) return pawnsB - pawnsA;

    // Tiebreaker: heel count
    const heelsA = state.pieces.filter(
      p => p.type === 'HEEL' && p.locationId.startsWith(`p${a.playerId}_`)
    ).length;
    const heelsB = state.pieces.filter(
      p => p.type === 'HEEL' && p.locationId.startsWith(`p${b.playerId}_`)
    ).length;
    if (heelsB !== heelsA) return heelsB - heelsA;

    // Tiebreaker: mark count
    const marksA = state.pieces.filter(
      p => p.type === 'MARK' && p.locationId.startsWith(`p${a.playerId}_`)
    ).length;
    const marksB = state.pieces.filter(
      p => p.type === 'MARK' && p.locationId.startsWith(`p${b.playerId}_`)
    ).length;
    if (marksB !== marksA) return marksB - marksA;

    // Tiebreaker: credibility
    return b.player.credibility - a.player.credibility;
  });

  const turnOrder = fundingByPlayer.map(f => f.playerId);
  const remainingFunding: Record<number, number> = {};
  for (const { playerId, funding } of fundingByPlayer) {
    remainingFunding[playerId] = funding;
  }

  state.bureaucracy = {
    turnOrder,
    currentPlayerIndex: 0,
    remainingFunding,
  };

  state.turn = {
    phase: TurnPhase.BUREAUCRACY,
    moverId: turnOrder[0],
    receiverId: null,
    movesExecuted: [],
    tilePlayedId: null,
    pendingBystanders: [],
    challengerId: null,
    isBluff: false,
  };

  return state;
}

function startNextCampaign(state: KredGameState): KredGameState {
  // Return all bank tiles to hands
  for (const player of state.players) {
    player.hand.push(...player.bankFaceDown, ...player.bankFaceUp);
    player.bankFaceDown = [];
    player.bankFaceUp = [];
  }

  state.campaign.number++;

  // First mover = player with '03'
  const firstMover = state.players.find(p => p.hand.includes('03'));
  if (!firstMover) throw new Error('No player has tile 03 in next campaign');

  const mover = getPlayer(state, firstMover.id);
  mover.credibilityAtTurnStart = mover.credibility;

  state.bureaucracy = {
    turnOrder: [],
    currentPlayerIndex: 0,
    remainingFunding: {},
  };

  state.turn = {
    phase: TurnPhase.MOVING,
    moverId: firstMover.id,
    receiverId: null,
    movesExecuted: [],
    tilePlayedId: null,
    pendingBystanders: [],
    challengerId: null,
    isBluff: false,
  };
  state.piecesBeforeMove = null;
  state.phaseBeforeSupport = null;

  return state;
}
