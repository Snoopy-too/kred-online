import { INVALID_MOVE } from 'boardgame.io/core';
import { TurnSubmissionSchema, INITIAL_PIECE_COUNTS, TILES, BUREAUCRACY_PRICES } from '../types.js';
import { enforceSupportRule, checkVictory, getNextPlayer, getOrderedChallengers } from '../board.js';
import { validateMoveCombination, applyMoveToState, classifyPlay, validateSingleMove } from '../moves.js';
import { handleLoadSaveState } from '../sharedMoves.js';
import { executeBureaucracyActionPayload, selectBestBankTilesToPay } from '../bureaucracy.js';

export function finishPendingPlayOrReward(G) {
  const challengerId = G.pendingPlay?.successfulChallengerId;
  const receiverId = G.pendingPlay?.receiverId || G.nextMoverId;
  const tileId = G.pendingPlay?.reexecuteTileId || G.pendingPlay?.tileIdPlayed;

  if (tileId && tileId !== 'BLANK') {
    const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
    if (winners.length > 1) G.winner = 'draw';
    else if (winners.length === 1) G.winner = winners[0];
  }

  if (challengerId && G.players[challengerId]) {
    const hasFacedownTiles = (G.players[challengerId].bank || []).some(t => t.faceDown);
    if (hasFacedownTiles) {
      G.pendingPlay.step = 'challengerReward';
      return;
    } else {
      if (G.players[challengerId].credibilityNotchesLost > 0) {
        G.players[challengerId].credibilityNotchesLost--;
      }
    }
  }

  G.pendingPlay = null;
  if (receiverId !== undefined && receiverId !== null) {
    G.nextMoverId = receiverId;
  }
}

export function createCampaignPhase() {
  return {
    onBegin: ({ G }) => {
      if (!G || !G.players) return;
      if (G.nextMoverId === undefined || G.nextMoverId === null) {
        let startP = '0';
        Object.keys(G.players).forEach(pId => {
          if (G.players[pId].hand && G.players[pId].hand.includes('03')) startP = pId;
        });
        G.nextMoverId = startP;
      }
    },

    turn: {
      order: {
        first: ({ G }) => {
          if (!G || !G.players) return 0;
          if (G.nextMoverId !== undefined && G.nextMoverId !== null) {
            return parseInt(G.nextMoverId, 10);
          }
          let startP = '0';
          Object.keys(G.players).forEach(pId => {
            if (G.players[pId].hand && G.players[pId].hand.includes('03')) startP = pId;
          });
          return parseInt(startP, 10);
        },
        next: ({ G, ctx }) => {
          if (G && G.pendingPlay) {
            if (G.pendingPlay.step === 'receipt') {
              return parseInt(G.pendingPlay.receiverId, 10);
            }
            if (G.pendingPlay.step === 'challenge') {
              const eligibleChallengers = getOrderedChallengers(G);
              const remaining = eligibleChallengers.filter(
                id => !G.pendingPlay.challengesPassed.includes(id)
              );
              if (remaining.length > 0) {
                return parseInt(remaining[0], 10);
              }
              return parseInt(G.pendingPlay.receiverId, 10);
            }
            if (G.pendingPlay.step === 'reexecute' || G.pendingPlay.step === 'penaltyWithdraw') {
              return parseInt(G.pendingPlay.moverId, 10);
            }
            if (G.pendingPlay.step === 'freeAdvance') {
              return parseInt(G.pendingPlay.receiverId, 10);
            }
            if (G.pendingPlay.step === 'challengerReward') {
              return parseInt(G.pendingPlay.successfulChallengerId, 10);
            }
            if (G.pendingPlay.nextMoverId !== undefined) {
              return parseInt(G.pendingPlay.nextMoverId, 10);
            }
          }
          const np = G ? G.numPlayers : 3;
          let targetId = G && G.nextMoverId !== undefined && G.nextMoverId !== null
            ? String(G.nextMoverId)
            : String(ctx.currentPlayer);

          let searchCount = 0;
          while (G && G.players && G.players[targetId] && G.players[targetId].hand.length === 0 && searchCount < np) {
            targetId = getNextPlayer(targetId, np);
            searchCount++;
          }
          return parseInt(targetId, 10);
        }
      }
    },

    moves: {
      loadSaveState: handleLoadSaveState,
      submitTurnMovesAndTile: ({ G, ctx, playerID, events }, payload) => {
        const parsed = TurnSubmissionSchema.safeParse(payload);
        if (!parsed.success) {
          console.warn('[submitTurnMovesAndTile] Invalid payload schema:', parsed.error);
          return INVALID_MOVE;
        }

        const moverId = String(playerID);
        const { tileId, receiverId, moves: moveActions } = parsed.data;

        if (!G.players[moverId] || !G.players[moverId].hand.includes(tileId)) {
          console.warn(`[submitTurnMovesAndTile] Tile ${tileId} not in player ${moverId} hand:`, G.players[moverId]?.hand);
          return INVALID_MOVE;
        }
        const tilesPerPlayer = (INITIAL_PIECE_COUNTS[G.numPlayers] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
        const receiverBank = G.players[receiverId]?.bank || [];
        if (receiverBank.length >= tilesPerPlayer) {
          console.warn(`[submitTurnMovesAndTile] Receiver ${receiverId} bank is already full (${receiverBank.length}/${tilesPerPlayer}).`);
          return INVALID_MOVE;
        }

        if (receiverId === moverId) {
          // Rule: self-play allowed ONLY if all opponents have full banks
          const hasValidOpponentTarget = Object.keys(G.players).some(
            p => p !== moverId && (G.players[p].bank || []).length < tilesPerPlayer
          );
          if (hasValidOpponentTarget) {
            console.warn('[submitTurnMovesAndTile] Self-play disallowed because valid opponents with empty bank slots exist.');
            return INVALID_MOVE;
          }
        }

        const val = validateMoveCombination(moveActions, moverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) {
          console.warn('[submitTurnMovesAndTile] Move combination validation failed:', val.reason);
          return INVALID_MOVE;
        }

        const backupBoard = JSON.parse(JSON.stringify(G.boardState));
        const backupCommunity = JSON.parse(JSON.stringify(G.community));

        moveActions.forEach(m => applyMoveToState(m, G.boardState, G.community));
        G.boardState = enforceSupportRule(G.boardState, G.numPlayers);

        const playType = classifyPlay(moveActions, tileId, moverId, backupBoard, backupCommunity, G.numPlayers);
        G.players[moverId].hand = G.players[moverId].hand.filter(t => t !== tileId);

        G.nextMoverId = receiverId;

        G.pendingPlay = {
          moverId,
          receiverId,
          tileIdPlayed: tileId,
          movesMade: moveActions,
          playType,
          backupBoard,
          backupCommunity,
          moverStartCredNotches: G.players[moverId].credibilityNotchesLost,
          step: 'receipt',
          challengesPassed: []
        };

        G.lastOutcomeNotice = null;

        if (G.players[receiverId].credibilityNotchesLost >= 3 || tileId === 'BLANK') {
          G.pendingPlay.step = 'challenge';
        }

        events.endTurn();
      },

      acceptTile: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'receipt' || G.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }

        const eligibleChallengers = getOrderedChallengers(G);

        if (eligibleChallengers.length === 0) {
          const { receiverId, tileIdPlayed } = G.pendingPlay;
          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
          G.nextMoverId = receiverId;
          G.pendingPlay = null;

          if (tileIdPlayed !== 'BLANK') {
            const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
            if (winners.length > 1) G.winner = 'draw';
            else if (winners.length === 1) G.winner = winners[0];
          }
        } else {
          G.pendingPlay.step = 'challenge';
        }

        events.endTurn();
      },

      rejectTile: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'receipt' || G.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }
        if (G.pendingPlay.playType === 'Honest') {
          return INVALID_MOVE;
        }

        const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity } = G.pendingPlay;

        G.nextMoverId = receiverId;

        if (playType === 'Dishonest' || playType === 'Illegal') {
          G.boardState = backupBoard;
          G.community = backupCommunity;

          if (G.players[moverId].credibilityNotchesLost < 3) {
            G.players[moverId].credibilityNotchesLost++;
          } else {
            G.players[moverId].pendingPenaltyWithdraw = true;
          }

          let receiverGotFreeAdvance = false;
          if (G.players[receiverId].credibilityNotchesLost === 0) {
            receiverGotFreeAdvance = true;
          } else {
            G.players[receiverId].credibilityNotchesLost = Math.max(0, G.players[receiverId].credibilityNotchesLost - 2);
          }

          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });

          G.pendingPlay.receiverFreeAdvance = receiverGotFreeAdvance;
          G.pendingPlay.reexecuteTileId = tileIdPlayed;
          G.pendingPlay.nextMoverId = receiverId;
          G.pendingPlay.step = 'reexecute';
          G.lastOutcomeNotice = {
            title: '🚨 Whistle Blown! (Play Rejected)',
            type: 'reject',
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Player ${receiverId} exposed Player ${moverId}'s dishonest play with Tile ${tileIdPlayed}! Board moves were reset.`
          };
        } else {
          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
          G.pendingPlay = null;
          G.lastOutcomeNotice = {
            title: '✅ Play Accepted',
            type: 'honest',
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Receiver Player ${receiverId} inspected Player ${moverId}'s play and it was HONEST!`
          };

          if (tileIdPlayed !== 'BLANK') {
            const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
            if (winners.length > 1) G.winner = 'draw';
            else if (winners.length === 1) G.winner = winners[0];
          }
        }

        events.endTurn();
      },

      challengeTile: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'challenge') return INVALID_MOVE;
        if (G.players[pId].credibilityNotchesLost >= 3) return INVALID_MOVE;

        const eligibleChallengers = getOrderedChallengers(G);
        const remaining = eligibleChallengers.filter(
          id => !G.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;

        const challengerId = pId;
        const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity, moverStartCredNotches } = G.pendingPlay;

        G.nextMoverId = receiverId;

        if (playType === 'Dishonest' || playType === 'Illegal') {
          G.boardState = backupBoard;
          G.community = backupCommunity;

          if (G.players[moverId].credibilityNotchesLost < 3) {
            G.players[moverId].credibilityNotchesLost++;
          } else {
            G.players[moverId].pendingPenaltyWithdraw = true;
          }

          G.pendingPlay.successfulChallengerId = challengerId;

          if (G.players[receiverId].credibilityNotchesLost < 3) {
            G.players[receiverId].credibilityNotchesLost++;
          }

          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });

          G.pendingPlay.reexecuteTileId = tileIdPlayed;
          G.pendingPlay.nextMoverId = receiverId;
          G.pendingPlay.step = 'reexecute';
          G.lastOutcomeNotice = {
            title: '🔥 Challenge Succeeded! (Smoking Gun)',
            type: 'challengeSuccess',
            challengerId,
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Challenger Player ${challengerId} exposed Player ${moverId}'s dishonest play! Player ${moverId} lost 1 credibility notch and board moves were reset.`
          };
        } else {
          if (moverStartCredNotches < 3 && G.players[moverId].credibilityNotchesLost > 0) {
            G.players[moverId].credibilityNotchesLost--;
          }
          if (G.players[challengerId].credibilityNotchesLost < 3) {
            G.players[challengerId].credibilityNotchesLost++;
          }
          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });

          G.pendingPlay = null;
          G.lastOutcomeNotice = {
            title: '❌ Challenge Failed! (Witch Hunt)',
            type: 'challengeFailed',
            challengerId,
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Player ${challengerId} challenged Player ${moverId}, but the play with Tile ${tileIdPlayed} was HONEST! Player ${challengerId} lost 1 credibility notch.`
          };

          if (tileIdPlayed !== 'BLANK') {
            const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
            if (winners.length > 1) G.winner = 'draw';
            else if (winners.length === 1) G.winner = winners[0];
          }
        }

        events.endTurn();
      },

      passChallenge: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'challenge') return INVALID_MOVE;

        const eligibleChallengers = getOrderedChallengers(G);
        const remaining = eligibleChallengers.filter(
          id => !G.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;

        G.pendingPlay.challengesPassed.push(pId);

        if (G.pendingPlay.challengesPassed.length >= eligibleChallengers.length) {
          const { receiverId, tileIdPlayed } = G.pendingPlay;
          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });

          G.nextMoverId = receiverId;
          G.pendingPlay = null;

          if (tileIdPlayed !== 'BLANK') {
            const winners = Object.keys(G.players).filter(p => checkVictory(G.boardState, p));
            if (winners.length > 1) G.winner = 'draw';
            else if (winners.length === 1) G.winner = winners[0];
          }
        }

        events.endTurn();
      },

      reexecuteHonestly: ({ G, ctx, playerID, events }, payload) => {
        const moverId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'reexecute' || G.pendingPlay.moverId !== moverId) return INVALID_MOVE;

        const moveActions = payload;
        const tileId = G.pendingPlay.reexecuteTileId;

        const val = validateMoveCombination(moveActions, moverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        
        const playType = classifyPlay(moveActions, tileId, moverId, G.boardState, G.community, G.numPlayers);
        if (playType !== 'Honest') return INVALID_MOVE;

        moveActions.forEach(m => applyMoveToState(m, G.boardState, G.community));
        G.boardState = enforceSupportRule(G.boardState, G.numPlayers);

        if (G.players[moverId].pendingPenaltyWithdraw) {
          G.pendingPlay.step = 'penaltyWithdraw';
        } else if (G.pendingPlay.receiverFreeAdvance) {
          G.pendingPlay.step = 'freeAdvance';
        } else {
          finishPendingPlayOrReward(G);
        }
        events.endTurn();
      },

      executePenaltyWithdraw: ({ G, ctx, playerID, events }, moveAction) => {
        const moverId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'penaltyWithdraw' || G.pendingPlay.moverId !== moverId) return INVALID_MOVE;

        if (moveAction.type !== 'Withdraw') return INVALID_MOVE;
        
        const val = validateSingleMove(moveAction, moverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) return INVALID_MOVE;

        applyMoveToState(moveAction, G.boardState, G.community);
        G.boardState = enforceSupportRule(G.boardState, G.numPlayers);
        G.players[moverId].pendingPenaltyWithdraw = false;

        if (G.pendingPlay.receiverFreeAdvance) {
          G.pendingPlay.step = 'freeAdvance';
        } else {
          finishPendingPlayOrReward(G);
        }
        events.endTurn();
      },

      executeFreeAdvance: ({ G, ctx, playerID, events }, moveAction) => {
        const receiverId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'freeAdvance' || G.pendingPlay.receiverId !== receiverId) return INVALID_MOVE;

        if (moveAction.type !== 'Advance') return INVALID_MOVE;
        
        const val = validateSingleMove(moveAction, receiverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) return INVALID_MOVE;

        applyMoveToState(moveAction, G.boardState, G.community);
        G.boardState = enforceSupportRule(G.boardState, G.numPlayers);

        finishPendingPlayOrReward(G);
        events.endTurn();
      },

      claimChallengerCredibility: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'challengerReward' || String(G.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        if (G.players[pId].credibilityNotchesLost > 0) {
          G.players[pId].credibilityNotchesLost--;
        }
        const receiverId = G.pendingPlay.receiverId;
        G.pendingPlay = null;
        if (receiverId !== undefined && receiverId !== null) G.nextMoverId = receiverId;
        events.endTurn();
      },

      buyChallengerBureaucracyAction: ({ G, ctx, playerID, events }, { actionType, targetLoc, subAction }) => {
        const pId = String(playerID);
        if (!G.pendingPlay || G.pendingPlay.step !== 'challengerReward' || String(G.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
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
        if (tilesToPay.length === 0) return INVALID_MOVE;

        const success = executeBureaucracyActionPayload(G, pId, { actionType, targetLoc, subAction });
        if (!success) return INVALID_MOVE;

        tilesToPay.forEach(t => {
          t.faceDown = false;
        });

        const receiverId = G.pendingPlay.receiverId;
        G.pendingPlay = null;
        if (receiverId !== undefined && receiverId !== null) G.nextMoverId = receiverId;
        events.endTurn();
      }
    },

    next: 'bureaucracy',
    endIf: ({ G }) => {
      if (!G || !G.players) return false;
      return Object.values(G.players).every(p => p && p.hand && p.hand.length === 0) && !G.pendingPlay;
    }
  };
}
