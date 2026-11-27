import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { TILES, PIECE_TYPES, BUREAUCRACY_PRICES } from './types.js';
import { checkVictory } from './board.js';
import { applyMoveToState, validateSingleMove } from './moves.js';
import { handleLoadSaveState } from './sharedMoves.js';
import { queuePendingSupport, handleResolveSupportDrop } from './supportRule.js';
import { appendGameLog, recordBureaucracyFunding, formatMoveInfinitive } from './gameLog.js';
import {
  logKgnPhase,
  logKgnBureaucracyAction,
  logKgnBureaucracyEnd,
  logKgnReward,
  logKgnResult,
  formatKgnBureaucracyAction
} from './kgn.js';

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

const COMMUNITY_COUNT_KEY = {
  [PIECE_TYPES.MARK]: 'marks',
  [PIECE_TYPES.HEEL]: 'heels',
  [PIECE_TYPES.PAWN]: 'pawns'
};

export function getPromotionTargetType(pieceType, community, playerHasPawn) {
  if (pieceType === PIECE_TYPES.MARK) {
    if ((community?.heels || 0) > 0) return PIECE_TYPES.HEEL;
    if ((community?.pawns || 0) > 0 && !playerHasPawn) return PIECE_TYPES.PAWN;
  } else if (pieceType === PIECE_TYPES.HEEL) {
    if ((community?.pawns || 0) > 0 && !playerHasPawn) return PIECE_TYPES.PAWN;
  }
  return null;
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

  const returnKey = COMMUNITY_COUNT_KEY[targetType];
  const takeKey = COMMUNITY_COUNT_KEY[higherType];
  if (returnKey) G.community[returnKey] = (G.community[returnKey] || 0) + 1;
  if (takeKey) G.community[takeKey] = Math.max(0, (G.community[takeKey] || 0) - 1);

  return true;
}

export function getBureaucracyActionCost(prices, actionType) {
  if (!prices) return 0;
  return prices[actionType] || 0;
}

function logBureaucracyAction(G, pId, { actionType, targetLoc, subAction, cost, preBoard }) {
  logKgnBureaucracyAction(G, pId, {
    actionType,
    targetLoc,
    pieceType: G.boardState[targetLoc]?.type,
    subAction,
    boardBefore: preBoard,
    boardAfter: G.boardState
  });
  if (actionType === 'RESTORE_CRED') {
    appendGameLog(G, `Player ${pId} spent K${cost} to restore credibility.`, 'info');
  } else if (actionType === 'PROMOTE_SEAT' || actionType === 'PROMOTE_ROSTRUM' || actionType === 'PROMOTE_OFFICE') {
    const pieceType = G.boardState[targetLoc]?.type || 'piece';
    const spotWord = actionType === 'PROMOTE_SEAT' ? 'seat' : actionType === 'PROMOTE_ROSTRUM' ? 'rostrum' : 'office';
    appendGameLog(G, `Player ${pId} spent K${cost} to Promote to ${pieceType} in ${spotWord}.`, 'info');
  } else if (subAction) {
    appendGameLog(G, `Player ${pId} spent K${cost} to ${formatMoveInfinitive(subAction)}.`, 'info');
  }
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
    G.players[pId].bureaucracyInitialFunding = funding;
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
  G.lastBureaucracyReplay = null;
}

export function cleanupBureaucracy(G) {
  if (!G || !G.players) return;
  // Bureaucracy-scoped turn state dies here: the phase guard in
  // executeOnlineBureaucracyAction/EndBureaucracyTurn keys off these markers,
  // so a stale order must never survive into the next campaign.
  delete G.bureaucracyTurnOrder;
  delete G.bureaucracyTurnIndex;
  delete G.lastBureaucracyReplay;
  G.lastOutcomeNotice = null;
  // Return bank tiles to hands for next campaign
  Object.keys(G.players).forEach(pId => {
    delete G.players[pId].bureaucracyInitialFunding;
    if (G.players[pId].bank) {
      G.players[pId].hand = G.players[pId].bank.map(b => b.tileId);
      G.players[pId].bank = [];
    }
  });

  const prevWinner = G.winner;
  const winners = Object.keys(G.players).filter(pId => checkVictory(G.boardState, pId));
  if (winners.length > 1) G.winner = 'draw';
  else if (winners.length === 1) G.winner = winners[0];
  if (G.winner && G.winner !== prevWinner) logKgnResult(G);
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

  const preBoard = { ...G.boardState };
  const success = executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction });
  if (!success) return false;

  tilesToPay.forEach(t => {
    t.faceDown = false;
  });

  const actionStr = formatKgnBureaucracyAction({
    actionType,
    targetLoc,
    pieceType: G.boardState[targetLoc]?.type,
    subAction,
    boardBefore: preBoard,
    boardAfter: G.boardState
  });
  logKgnReward(G, actionStr);
  if (actionType === 'RESTORE_CRED') {
    appendGameLog(G, `Player ${pId} spent K${cost} to restore credibility.`, 'info');
  } else if (actionType === 'PROMOTE_SEAT' || actionType === 'PROMOTE_ROSTRUM' || actionType === 'PROMOTE_OFFICE') {
    const pieceType = G.boardState[targetLoc]?.type || 'piece';
    const spotWord = actionType === 'PROMOTE_SEAT' ? 'seat' : actionType === 'PROMOTE_ROSTRUM' ? 'rostrum' : 'office';
    appendGameLog(G, `Player ${pId} spent K${cost} to Promote to ${pieceType} in ${spotWord}.`, 'info');
  } else if (subAction) {
    appendGameLog(G, `Player ${pId} spent K${cost} to ${formatMoveInfinitive(subAction)}.`, 'info');
  }
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

    const higherType = getPromotionTargetType(piece.type, G.community, playerHasPawn);
    if (!higherType) return false;
    return promoteSwapInState(G, targetLoc, piece.type, higherType);
  }

  if (actionType === 'BASIC_ACTION' || actionType === 'EXTRA_ACTION') {
    if (!subAction || !subAction.type || !subAction.from || !subAction.to) return false;
    const isBasic = actionType === 'BASIC_ACTION';
    const allowedTypes = isBasic ? ['Advance', 'Withdraw', 'Organize'] : ['Assist', 'Remove', 'Influence'];
    if (!allowedTypes.includes(subAction.type)) return false;

    const val = validateSingleMove(subAction, pId, G.boardState, G.community, G.numPlayers);
    if (!val.valid) return false;

    applyMoveToState(subAction, G.boardState, G.community);
    return true;
  }

  return false;
}

export function createBureaucracyPhase() {
  return {
    onBegin: ({ G }) => {
      initBureaucracy(G);
      recordBureaucracyFunding(G);
      appendGameLog(G, 'BUREAUCRACY', 'phase');
      logKgnPhase(G, 'bureaucracy');
    },

    turn: {
      order: {
        first: ({ G }) => (G && G.bureaucracyTurnOrder && G.bureaucracyTurnOrder.length > 0) ? parseInt(G.bureaucracyTurnOrder[0], 10) : 0,
        next: ({ G }) => {
          if (G && G.pendingSupport) return parseInt(G.pendingSupport.ownerId, 10);
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
      resolveSupportDrop: handleResolveSupportDrop,
      buyBureaucracyAction: ({ G, ctx, playerID, events }, { actionType, targetLoc, subAction }) => {
        if (G.pendingSupport) return INVALID_MOVE;
        const pId = String(playerID);
        const prices = BUREAUCRACY_PRICES[G.numPlayers] || BUREAUCRACY_PRICES[3];
        const player = G.players[pId];

        const cost = getBureaucracyActionCost(prices, actionType);
        if (cost === 0 || player.funding < cost) return INVALID_MOVE;

        const preBoard = JSON.parse(JSON.stringify(G.boardState));
        const success = executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction });
        if (!success) return INVALID_MOVE;

        player.funding -= cost;
        logBureaucracyAction(G, pId, { actionType, targetLoc, subAction, cost, preBoard });
        if (subAction) {
          G.lastBureaucracyReplay = {
            seq: (G.lastBureaucracyReplay?.seq || 0) + 1,
            playerId: pId,
            movesMade: [subAction],
            backupBoard: preBoard
          };
        }

        if (queuePendingSupport(G, { phase: 'bureaucracy', returnToPlayerId: pId })) {
          if (String(G.pendingSupport.ownerId) !== pId) {
            events.endTurn();
          }
        }
      },

      submitBureaucracyTurn: ({ G, playerID, events }, actions = []) => {
        if (G.pendingSupport || !Array.isArray(actions)) return INVALID_MOVE;
        const pId = String(playerID);
        const prices = BUREAUCRACY_PRICES[G.numPlayers] || BUREAUCRACY_PRICES[3];
        const player = G.players[pId];
        if (!player) return INVALID_MOVE;

        const preTurnBoard = JSON.parse(JSON.stringify(G.boardState));
        const preTurnCommunity = JSON.parse(JSON.stringify(G.community));
        const preTurnFunding = player.funding;
        const preTurnCred = player.credibilityNotchesLost;
        const appliedLogs = [];
        const movesMade = [];

        for (const act of actions) {
          const { actionType, targetLoc, subAction } = act || {};
          const cost = getBureaucracyActionCost(prices, actionType);
          const preBoard = JSON.parse(JSON.stringify(G.boardState));
          if (cost === 0 || player.funding < cost || !executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction })) {
            G.boardState = preTurnBoard;
            G.community = preTurnCommunity;
            player.funding = preTurnFunding;
            player.credibilityNotchesLost = preTurnCred;
            return INVALID_MOVE;
          }
          player.funding -= cost;
          appliedLogs.push({ actionType, targetLoc, subAction, cost, preBoard });
          if (subAction) movesMade.push(subAction);
        }

        for (const item of appliedLogs) {
          logBureaucracyAction(G, pId, item);
        }

        if (movesMade.length > 0) {
          G.lastBureaucracyReplay = {
            seq: (G.lastBureaucracyReplay?.seq || 0) + 1,
            playerId: pId,
            movesMade,
            backupBoard: preTurnBoard
          };
        }

        appendGameLog(G, `Player ${pId} ended their Bureaucracy turn.`, 'info');
        logKgnBureaucracyEnd(G, pId);
        G.bureaucracyTurnIndex = (G.bureaucracyTurnIndex || 0) + 1;
        queuePendingSupport(G, { phase: 'bureaucracy', returnToPlayerId: null });
        events.endTurn();
      },

      endBureaucracyTurn: ({ G, playerID, events }) => {
        if (G?.pendingSupport) return INVALID_MOVE;
        if (G) {
          if (playerID !== undefined && playerID !== null) {
            appendGameLog(G, `Player ${playerID} ended their Bureaucracy turn.`, 'info');
            logKgnBureaucracyEnd(G, playerID);
          }
          G.bureaucracyTurnIndex = (G.bureaucracyTurnIndex || 0) + 1;
        }
        events.endTurn();
      }
    },

    endIf: ({ G }) => {
      if (!G || G.pendingSupport || G.bureaucracyTurnIndex === undefined || !G.bureaucracyTurnOrder) return false;
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
