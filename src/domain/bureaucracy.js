import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { TILES, PIECE_TYPES, BUREAUCRACY_PRICES } from './types.js';
import { checkVictory, enforceSupportRule } from './board.js';
import { applyMoveToState, validateSingleMove } from './moves.js';
import { handleLoadSaveState } from './sharedMoves.js';

export function selectBestBankTilesToPay(facedownBankTiles, cost) {
  if (!facedownBankTiles || facedownBankTiles.length === 0 || cost <= 0) return [];

  let bestSubset = null;
  let bestFundingSum = Infinity;
  let bestTileCount = Infinity;

  const n = facedownBankTiles.length;
  const numSubsets = 1 << n; // 2^n

  for (let i = 1; i < numSubsets; i++) {
    const subset = [];
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if ((i & (1 << j)) !== 0) {
        subset.push(facedownBankTiles[j]);
        sum += (TILES[facedownBankTiles[j].tileId]?.funding || 0);
      }
    }

    if (sum >= cost) {
      const isBetter =
        sum < bestFundingSum ||
        (sum === bestFundingSum && subset.length < bestTileCount);

      if (isBetter) {
        bestFundingSum = sum;
        bestTileCount = subset.length;
        bestSubset = subset;
      }
    }
  }

  return bestSubset || [];
}

function promoteSwapInState(G, targetLoc, targetType, higherType) {
  const commKey = Object.keys(G.boardState).find(
    k => k.startsWith('community_') && G.boardState[k]?.type === higherType
  );
  if (!commKey) return false;

  const targetPiece = G.boardState[targetLoc];
  const commPiece = G.boardState[commKey];

  G.boardState[targetLoc] = commPiece;
  G.boardState[commKey] = targetPiece;

  if (targetType === PIECE_TYPES.MARK && higherType === PIECE_TYPES.HEEL) {
    G.community.marks = (G.community.marks || 0) + 1;
    G.community.heels = Math.max(0, (G.community.heels || 0) - 1);
  } else if (targetType === PIECE_TYPES.HEEL && higherType === PIECE_TYPES.PAWN) {
    G.community.heels = (G.community.heels || 0) + 1;
    G.community.pawns = Math.max(0, (G.community.pawns || 0) - 1);
  }

  return true;
}

export function initBureaucracy(G) {
  if (!G || !G.players) return;

  Object.keys(G.players).forEach(pId => {
    const funding = G.players[pId].bank ? G.players[pId].bank.reduce((sum, item) => {
      if (item.faceDown) {
        return sum + (TILES[item.tileId]?.funding || 0);
      }
      return sum;
    }, 0) : 0;
    G.players[pId].funding = funding;
  });

  const order = Object.keys(G.players).sort((a, b) => {
    if (G.players[b].funding !== G.players[a].funding) {
      return G.players[b].funding - G.players[a].funding;
    }
    const pawnA = Object.keys(G.boardState).some(k => k.startsWith(`p${parseInt(a, 10) + 1}_`) && G.boardState[k]?.type === 'Pawn');
    const pawnB = Object.keys(G.boardState).some(k => k.startsWith(`p${parseInt(b, 10) + 1}_`) && G.boardState[k]?.type === 'Pawn');
    if (pawnA !== pawnB) return pawnB ? 1 : -1;

    const countHeels = (id) => Object.keys(G.boardState)
      .filter(k => k.startsWith(`p${parseInt(id, 10) + 1}_`) && G.boardState[k]?.type === 'Heel').length;
    if (countHeels(b) !== countHeels(a)) return countHeels(b) - countHeels(a);

    const countMarks = (id) => Object.keys(G.boardState)
      .filter(k => k.startsWith(`p${parseInt(id, 10) + 1}_`) && G.boardState[k]?.type === 'Mark').length;
    if (countMarks(b) !== countMarks(a)) return countMarks(b) - countMarks(a);

    return G.players[a].credibilityNotchesLost - G.players[b].credibilityNotchesLost;
  });

  G.bureaucracyTurnOrder = order;
  G.bureaucracyTurnIndex = 0;
}

export function cleanupBureaucracy(G) {
  if (!G || !G.players) return;
  // Return bank tiles to hands for next campaign
  Object.keys(G.players).forEach(pId => {
    if (G.players[pId].bank) {
      G.players[pId].hand = G.players[pId].bank.map(b => b.tileId);
      G.players[pId].bank = [];
    }
  });

  Object.keys(G.players).forEach(pId => {
    if (checkVictory(G.boardState, pId)) {
      G.winner = pId;
    }
  });
}

export function applyChallengerBureaucracyAction(G, pId, { actionType, targetLoc, subAction }) {
  const player = G.players[pId];
  const facedownTiles = (player?.bank || []).filter(t => t.faceDown);

  const prices = BUREAUCRACY_PRICES[G.numPlayers] || BUREAUCRACY_PRICES[3];
  let cost = 0;
  if (actionType === 'RESTORE_CRED') cost = prices.RESTORE_CRED;
  else if (actionType === 'PROMOTE_SEAT') cost = prices.PROMOTE_SEAT;
  else if (actionType === 'PROMOTE_ROSTRUM') cost = prices.PROMOTE_ROSTRUM;
  else if (actionType === 'PROMOTE_OFFICE') cost = prices.PROMOTE_OFFICE;
  else if (actionType === 'BASIC_ACTION') cost = prices.BASIC_ACTION;
  else if (actionType === 'EXTRA_ACTION') cost = prices.EXTRA_ACTION;

  const tilesToPay = selectBestBankTilesToPay(facedownTiles, cost);
  if (tilesToPay.length === 0) return false;

  const success = executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction });
  if (!success) return false;

  tilesToPay.forEach(t => {
    t.faceDown = false;
  });
  return true;
}

export function executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction }) {
  const prices = BUREAUCRACY_PRICES[G.numPlayers] || BUREAUCRACY_PRICES[3];
  const player = G.players[pId];
  if (!player) return false;

  const playerHasPawn = Object.keys(G.boardState).some(k => k.startsWith(`p${parseInt(pId, 10) + 1}_`) && G.boardState[k]?.type === PIECE_TYPES.PAWN);

  if (actionType === 'RESTORE_CRED') {
    if (player.credibilityNotchesLost === 0) return false;
    player.credibilityNotchesLost--;
    return true;
  }

  if (actionType === 'PROMOTE_SEAT' || actionType === 'PROMOTE_ROSTRUM' || actionType === 'PROMOTE_OFFICE') {
    const piece = G.boardState[targetLoc];
    if (!piece) return false;

    if (piece.type === PIECE_TYPES.MARK && G.community.heels > 0) {
      return promoteSwapInState(G, targetLoc, PIECE_TYPES.MARK, PIECE_TYPES.HEEL);
    } else if (piece.type === PIECE_TYPES.HEEL && G.community.pawns > 0) {
      if (playerHasPawn) return false;
      return promoteSwapInState(G, targetLoc, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN);
    }
    return false;
  }

  if (actionType === 'BASIC_ACTION' || actionType === 'EXTRA_ACTION') {
    if (!subAction || !subAction.type || !subAction.from || !subAction.to) return false;
    const isBasic = actionType === 'BASIC_ACTION';
    const allowedTypes = isBasic ? ['Advance', 'Withdraw', 'Organize'] : ['Assist', 'Remove', 'Influence'];
    if (!allowedTypes.includes(subAction.type)) return false;

    const val = validateSingleMove(subAction, pId, G.boardState, G.community, G.numPlayers);
    if (!val.valid) return false;

    applyMoveToState(subAction, G.boardState, G.community);
    G.boardState = enforceSupportRule(G.boardState, G.numPlayers);
    return true;
  }

  return false;
}

export function createBureaucracyPhase() {
  return {
    onBegin: ({ G }) => {
      initBureaucracy(G);
    },

    turn: {
      order: {
        first: ({ G }) => (G && G.bureaucracyTurnOrder && G.bureaucracyTurnOrder.length > 0) ? parseInt(G.bureaucracyTurnOrder[0], 10) : 0,
        next: ({ G }) => {
          if (!G || !G.bureaucracyTurnOrder || G.bureaucracyTurnIndex === undefined) return undefined;
          if (G.bureaucracyTurnIndex < G.bureaucracyTurnOrder.length) {
            return parseInt(G.bureaucracyTurnOrder[G.bureaucracyTurnIndex], 10);
          }
          return undefined;
        }
      }
    },

    moves: {
      loadSaveState: handleLoadSaveState,
      buyBureaucracyAction: ({ G, ctx, playerID }, { actionType, targetLoc, subAction }) => {
        const pId = String(playerID);
        const prices = BUREAUCRACY_PRICES[G.numPlayers] || BUREAUCRACY_PRICES[3];
        const player = G.players[pId];

        let cost = 0;
        if (actionType === 'RESTORE_CRED') cost = prices.RESTORE_CRED;
        else if (actionType === 'PROMOTE_SEAT') cost = prices.PROMOTE_SEAT;
        else if (actionType === 'PROMOTE_ROSTRUM') cost = prices.PROMOTE_ROSTRUM;
        else if (actionType === 'PROMOTE_OFFICE') cost = prices.PROMOTE_OFFICE;
        else if (actionType === 'BASIC_ACTION') cost = prices.BASIC_ACTION;
        else if (actionType === 'EXTRA_ACTION') cost = prices.EXTRA_ACTION;

        if (cost === 0 || player.funding < cost) return INVALID_MOVE;

        const success = executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction });
        if (!success) return INVALID_MOVE;

        player.funding -= cost;
      },

      endBureaucracyTurn: ({ G, events }) => {
        if (G) {
          G.bureaucracyTurnIndex = (G.bureaucracyTurnIndex || 0) + 1;
        }
        events.endTurn();
      }
    },

    endIf: ({ G }) => {
      if (!G || G.bureaucracyTurnIndex === undefined || !G.bureaucracyTurnOrder) return false;
      return G.bureaucracyTurnIndex >= G.bureaucracyTurnOrder.length;
    },

    next: ({ G }) => {
      // Check victory — if someone won, don't transition
      if (G && G.winner) return undefined;
      return 'campaign';
    },
    onEnd: ({ G }) => {
      cleanupBureaucracy(G);
    }
  };
}
