import { INVALID_MOVE } from 'boardgame.io/core';
import { TILES, PIECE_TYPES, BUREAUCRACY_PRICES } from './types.js';
import { checkVictory, enforceSupportRule } from './board.js';
import { applyMoveToState, validateSingleMove } from './moves.js';
import { handleLoadSaveState } from './sharedMoves.js';

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

export function createBureaucracyPhase() {
  return {
    onBegin: ({ G, ctx }) => {
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
        // ponytail: check if player already has a pawn
        const playerHasPawn = Object.keys(G.boardState).some(k => k.startsWith(`p${parseInt(pId, 10) + 1}_`) && G.boardState[k]?.type === PIECE_TYPES.PAWN);

        if (actionType === 'RESTORE_CRED') {
          if (player.funding < prices.RESTORE_CRED) return INVALID_MOVE;
          if (player.credibilityNotchesLost === 0) return INVALID_MOVE;
          player.funding -= prices.RESTORE_CRED;
          player.credibilityNotchesLost--;
          return;
        }

        if (actionType === 'PROMOTE_SEAT') {
          if (player.funding < prices.PROMOTE_SEAT) return INVALID_MOVE;
          const piece = G.boardState[targetLoc];
          if (!piece) return INVALID_MOVE;

          if (piece.type === PIECE_TYPES.MARK && G.community.heels > 0) {
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.MARK, PIECE_TYPES.HEEL);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_SEAT;
          } else if (piece.type === PIECE_TYPES.HEEL && G.community.pawns > 0) {
            if (playerHasPawn) return INVALID_MOVE;
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_SEAT;
          } else {
            return INVALID_MOVE;
          }
          return;
        }

        if (actionType === 'PROMOTE_ROSTRUM') {
          if (player.funding < prices.PROMOTE_ROSTRUM) return INVALID_MOVE;
          const piece = G.boardState[targetLoc];
          if (!piece) return INVALID_MOVE;

          if (piece.type === PIECE_TYPES.MARK && G.community.heels > 0) {
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.MARK, PIECE_TYPES.HEEL);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_ROSTRUM;
          } else if (piece.type === PIECE_TYPES.HEEL && G.community.pawns > 0) {
            if (playerHasPawn) return INVALID_MOVE;
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_ROSTRUM;
          } else {
            return INVALID_MOVE;
          }
          return;
        }

        if (actionType === 'PROMOTE_OFFICE') {
          if (player.funding < prices.PROMOTE_OFFICE) return INVALID_MOVE;
          const piece = G.boardState[targetLoc];
          if (!piece) return INVALID_MOVE;

          if (piece.type === PIECE_TYPES.MARK && G.community.heels > 0) {
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.MARK, PIECE_TYPES.HEEL);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_OFFICE;
          } else if (piece.type === PIECE_TYPES.HEEL && G.community.pawns > 0) {
            if (playerHasPawn) return INVALID_MOVE;
            const ok = promoteSwapInState(G, targetLoc, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN);
            if (!ok) return INVALID_MOVE;
            player.funding -= prices.PROMOTE_OFFICE;
          } else {
            return INVALID_MOVE;
          }
          return;
        }

        // ponytail: handle basic/extra action generic validation
        if (actionType === 'BASIC_ACTION' || actionType === 'EXTRA_ACTION') {
          const cost = actionType === 'BASIC_ACTION' ? prices.BASIC_ACTION : prices.EXTRA_ACTION;
          if (player.funding < cost) return INVALID_MOVE;
          
          if (!subAction || !subAction.type || !subAction.from || !subAction.to) return INVALID_MOVE;
          
          const isBasic = actionType === 'BASIC_ACTION';
          const allowedTypes = isBasic ? ['Advance', 'Withdraw', 'Organize'] : ['Assist', 'Remove', 'Influence'];
          if (!allowedTypes.includes(subAction.type)) return INVALID_MOVE;
          
          const val = validateSingleMove(subAction, pId, G.boardState, G.community, G.numPlayers);
          if (!val.valid) return INVALID_MOVE;
          
          player.funding -= cost;
          applyMoveToState(subAction, G.boardState, G.community);
          G.boardState = enforceSupportRule(G.boardState, G.numPlayers);
          return;
        }
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
  };
}
