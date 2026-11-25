import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { TurnSubmissionSchema, MOVE_TYPES } from '../types.js';
import { getOrderedChallengers, getValidReceivers } from '../board.js';
import { validateMoveCombination, applyMoveToState, classifyPlay, validateSingleMove, isMoveTypePossible } from '../moves.js';
import { handleLoadSaveState } from '../sharedMoves.js';
import { applyChallengerBureaucracyAction } from '../bureaucracy.js';
import { applyVictoryCheck, resolvePlayToBank, findNextPlayerWithTiles, finishPendingPlayOrReward } from './campaignResolution.js';
import { queuePendingSupport, handleResolveSupportDrop } from '../supportRule.js';
import { appendGameLog, recordPlayerStat, formatTurnMovesLog } from '../gameLog.js';
import {
  logKgnPhase,
  logKgnCampaignPlay,
  logKgnOutcome,
  logKgnSubLine,
  formatKgnPlayer,
  formatKgnMove,
  formatKgnMoves
} from '../kgn.js';

export { finishPendingPlayOrReward };

export function createCampaignPhase() {
  return {
    onBegin: ({ G }) => {
      if (!G || !G.players) return;
      G.lastOutcomeNotice = null;
      appendGameLog(G, 'CAMPAIGN', 'phase');
      logKgnPhase(G, 'campaign');
      if (G.nextMoverId === undefined || G.nextMoverId === null) {
        let startP = '0';
        Object.keys(G.players).forEach(pId => {
          if (G.players[pId].hand && G.players[pId].hand.includes('^0+')) startP = pId;
        });
        G.nextMoverId = startP;
      }
    },

    turn: {
      order: {
        first: ({ G }) => {
          if (!G || !G.players) return 0;
          if (G.nextMoverId !== undefined && G.nextMoverId !== null) {
            return findNextPlayerWithTiles(G, G.nextMoverId);
          }
          let startP = '0';
          Object.keys(G.players).forEach(pId => {
            if (G.players[pId].hand && G.players[pId].hand.includes('^0+')) startP = pId;
          });
          return findNextPlayerWithTiles(G, startP);
        },
        next: ({ G, ctx }) => {
          if (G && G.pendingSupport) {
            return parseInt(G.pendingSupport.ownerId, 10);
          }
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
            if (G.pendingPlay.step === 'receiverReward' || G.pendingPlay.step === 'freeAdvance') {
              return parseInt(G.pendingPlay.receiverId, 10);
            }
            if (G.pendingPlay.step === 'challengerReward') {
              return parseInt(G.pendingPlay.successfulChallengerId, 10);
            }
            if (G.pendingPlay.nextMoverId !== undefined) {
              return parseInt(G.pendingPlay.nextMoverId, 10);
            }
          }
          const targetId = G && G.nextMoverId !== undefined && G.nextMoverId !== null
            ? String(G.nextMoverId)
            : String(ctx.currentPlayer);
          return findNextPlayerWithTiles(G, targetId);
        }
      }
    },

    moves: {
      loadSaveState: handleLoadSaveState,
      resolveSupportDrop: handleResolveSupportDrop,
      submitTurnMovesAndTile: ({ G, ctx, playerID, events }, payload) => {
        if (G.pendingSupport) return INVALID_MOVE;
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
        const validReceivers = getValidReceivers(G, moverId);
        if (!validReceivers.includes(receiverId)) {
          console.warn(`[submitTurnMovesAndTile] Receiver ${receiverId} is not a valid receiver:`, validReceivers);
          return INVALID_MOVE;
        }

        const val = validateMoveCombination(moveActions, moverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) {
          console.warn('[submitTurnMovesAndTile] Move combination validation failed:', val.reason);
          return INVALID_MOVE;
        }

        const backupBoard = JSON.parse(JSON.stringify(G.boardState));
        const backupCommunity = JSON.parse(JSON.stringify(G.community));

        moveActions.forEach(m => applyMoveToState(m, G.boardState, G.community));

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
        if (receiverId === moverId) {
          recordPlayerStat(G, moverId, 'tilesPlayedToSelf');
        }
        const movesLog = formatTurnMovesLog(moverId, moveActions);
        if (movesLog) appendGameLog(G, movesLog, 'info');
        appendGameLog(G, `Player ${moverId} played a tile to Player ${receiverId}.`, 'play');
        logKgnCampaignPlay(G, moverId, receiverId, moveActions);

        if (G.players[receiverId].credibilityNotchesLost >= 3) {
          if (getOrderedChallengers(G).length === 0) {
            resolvePlayToBank(G);
            queuePendingSupport(G, { phase: 'campaign', afterResolve: 'victoryCheck', tileId });
          } else {
            G.pendingPlay.step = 'challenge';
          }
        }

        events.endTurn();
      },

      acceptTile: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'receipt' || G.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }

        const eligibleChallengers = getOrderedChallengers(G);
        const tileId = G.pendingPlay.tileIdPlayed;
        appendGameLog(G, `Player ${pId} accepted Player ${G.pendingPlay.moverId}'s tile.`, 'info');

        if (eligibleChallengers.length === 0) {
          resolvePlayToBank(G);
          queuePendingSupport(G, { phase: 'campaign', afterResolve: 'victoryCheck', tileId });
        } else {
          G.pendingPlay.step = 'challenge';
        }

        events.endTurn();
      },

      rejectTile: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'receipt' || G.pendingPlay.receiverId !== pId) {
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

          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });

          G.pendingPlay.whistleblownByReceiver = true;
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
          recordPlayerStat(G, receiverId, 'whistlesBlown');
          appendGameLog(G, `Whistle Blown! Player ${receiverId} exposed Player ${moverId}.`, 'alert');
          logKgnOutcome(G, 'B', { tileId: tileIdPlayed });
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

          applyVictoryCheck(G, tileIdPlayed);
        }

        events.endTurn();
      },

      challengeTile: {
        client: false,
        move: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'challenge') return INVALID_MOVE;
        if (G.players[pId].credibilityNotchesLost >= 3) return INVALID_MOVE;

        const eligibleChallengers = getOrderedChallengers(G);
        const remaining = eligibleChallengers.filter(
          id => !G.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;

        const challengerId = pId;
        recordPlayerStat(G, challengerId, 'challengesMade');
        const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity, moverStartCredNotches } = G.pendingPlay;

        G.nextMoverId = receiverId;

        if (playType === 'Dishonest' || playType === 'Illegal') {
          G.boardState = backupBoard;
          G.community = backupCommunity;

          const isSelfPlay = String(receiverId) === String(moverId);
          const receiverHadNoWhistle = !isSelfPlay && (G.players[receiverId]?.credibilityNotchesLost || 0) >= 3;
          if (G.players[moverId].credibilityNotchesLost < 3) {
            G.players[moverId].credibilityNotchesLost++;
          } else {
            G.players[moverId].pendingPenaltyWithdraw = true;
          }

          G.pendingPlay.successfulChallengerId = challengerId;

          if (!isSelfPlay && G.players[receiverId].credibilityNotchesLost < 3) {
            G.players[receiverId].credibilityNotchesLost++;
          }

          G.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: receiverHadNoWhistle });

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
          appendGameLog(G, `Smoking Gun! Player ${challengerId} exposed Player ${moverId}.`, 'alert');
          logKgnOutcome(G, 'G', { challengerId, tileId: tileIdPlayed });
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
          appendGameLog(G, `Witch Hunt! Player ${challengerId} challenged an honest play.`, 'warn');
          logKgnOutcome(G, 'W', { challengerId, tileId: tileIdPlayed });

          if (!queuePendingSupport(G, { phase: 'campaign', afterResolve: 'victoryCheck', tileId: tileIdPlayed })) {
            applyVictoryCheck(G, tileIdPlayed);
          }
        }

        events.endTurn();
        }
      },

      passChallenge: {
        client: false,
        move: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'challenge') return INVALID_MOVE;

        const eligibleChallengers = getOrderedChallengers(G);
        const remaining = eligibleChallengers.filter(
          id => !G.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;

        const tileId = G.pendingPlay.tileIdPlayed;
        G.pendingPlay.challengesPassed.push(pId);
        appendGameLog(G, `Player ${pId} passed on challenging.`, 'info');

        if (G.pendingPlay.challengesPassed.length >= eligibleChallengers.length) {
          resolvePlayToBank(G);
          queuePendingSupport(G, { phase: 'campaign', afterResolve: 'victoryCheck', tileId });
        }

        events.endTurn();
        }
      },

      reexecuteHonestly: ({ G, ctx, playerID, events }, payload) => {
        const moverId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'reexecute' || G.pendingPlay.moverId !== moverId) return INVALID_MOVE;

        const moveActions = payload;
        const tileId = G.pendingPlay.reexecuteTileId;

        const val = validateMoveCombination(moveActions, moverId, G.boardState, G.community, G.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        
        const playType = classifyPlay(moveActions, tileId, moverId, G.boardState, G.community, G.numPlayers);
        if (playType !== 'Honest') return INVALID_MOVE;

        moveActions.forEach(m => applyMoveToState(m, G.boardState, G.community));
        const reexecLog = formatTurnMovesLog(moverId, moveActions);
        appendGameLog(G, reexecLog || `Player ${moverId} re-executed honestly.`, 'info');
        logKgnSubLine(G, `Re: ${formatKgnMoves(moveActions)}`);

        if (G.players[moverId].pendingPenaltyWithdraw) {
          G.pendingPlay.step = 'penaltyWithdraw';
          queuePendingSupport(G, { phase: 'campaign' });
        } else if (G.pendingPlay.whistleblownByReceiver) {
          G.pendingPlay.step = 'receiverReward';
          queuePendingSupport(G, { phase: 'campaign' });
        } else if (!queuePendingSupport(G, { phase: 'campaign', afterResolve: 'finishPendingPlayOrReward' })) {
          finishPendingPlayOrReward(G);
        }
        events.endTurn();
      },

      executePenaltyWithdraw: ({ G, ctx, playerID, events }, moveAction) => {
        const moverId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'penaltyWithdraw' || G.pendingPlay.moverId !== moverId) return INVALID_MOVE;

        if (moveAction) {
          if (moveAction.type !== MOVE_TYPES.WITHDRAW) return INVALID_MOVE;
          const val = validateSingleMove(moveAction, moverId, G.boardState, G.community, G.numPlayers);
          if (!val.valid) return INVALID_MOVE;
          applyMoveToState(moveAction, G.boardState, G.community);
        } else if (isMoveTypePossible(MOVE_TYPES.WITHDRAW, moverId, G.boardState, G.community, G.numPlayers)) {
          return INVALID_MOVE;
        }

        G.players[moverId].pendingPenaltyWithdraw = false;
        logKgnSubLine(G, `PenW(${formatKgnPlayer(moverId)}): ${moveAction ? formatKgnMove(moveAction) : 'Pass'}`);

        if (G.pendingPlay.whistleblownByReceiver) {
          G.pendingPlay.step = 'receiverReward';
          queuePendingSupport(G, { phase: 'campaign' });
        } else if (!queuePendingSupport(G, { phase: 'campaign', afterResolve: 'finishPendingPlayOrReward' })) {
          finishPendingPlayOrReward(G);
        }
        events.endTurn();
      },

      claimReceiverCredibilityReward: ({ G, ctx, playerID, events }) => {
        const receiverId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'receiverReward' || G.pendingPlay.receiverId !== receiverId) {
          return INVALID_MOVE;
        }
        if (G.players[receiverId].credibilityNotchesLost > 0) {
          G.players[receiverId].credibilityNotchesLost = Math.max(0, G.players[receiverId].credibilityNotchesLost - 2);
        }
        logKgnSubLine(G, `Rew(${formatKgnPlayer(receiverId)}): +2C`);
        finishPendingPlayOrReward(G);
        events.endTurn();
      },

      chooseReceiverAdvanceReward: ({ G, ctx, playerID, events }) => {
        const receiverId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'receiverReward' || G.pendingPlay.receiverId !== receiverId) {
          return INVALID_MOVE;
        }
        G.pendingPlay.step = 'freeAdvance';
        events.endTurn();
      },

      executeFreeAdvance: ({ G, ctx, playerID, events }, moveAction) => {
        const receiverId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'freeAdvance' || G.pendingPlay.receiverId !== receiverId) return INVALID_MOVE;

        if (moveAction) {
          if (moveAction.type !== MOVE_TYPES.ADVANCE) return INVALID_MOVE;
          const val = validateSingleMove(moveAction, receiverId, G.boardState, G.community, G.numPlayers);
          if (!val.valid) return INVALID_MOVE;
          applyMoveToState(moveAction, G.boardState, G.community);
        } else if (isMoveTypePossible(MOVE_TYPES.ADVANCE, receiverId, G.boardState, G.community, G.numPlayers)) {
          return INVALID_MOVE;
        }
        logKgnSubLine(G, `Rew(${formatKgnPlayer(receiverId)}): FreeA ${moveAction ? formatKgnMove(moveAction) : 'Pass'}`);

        if (!queuePendingSupport(G, { phase: 'campaign', afterResolve: 'finishPendingPlayOrReward' })) {
          finishPendingPlayOrReward(G);
        }
        events.endTurn();
      },

      claimChallengerCredibility: ({ G, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'challengerReward' || String(G.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        if (G.players[pId].credibilityNotchesLost > 0) {
          G.players[pId].credibilityNotchesLost--;
        }
        logKgnSubLine(G, `Rew(${formatKgnPlayer(pId)}): +1C`);
        const receiverId = G.pendingPlay.receiverId;
        G.pendingPlay = null;
        if (receiverId !== undefined && receiverId !== null) G.nextMoverId = receiverId;
        events.endTurn();
      },

      buyChallengerBureaucracyAction: ({ G, ctx, playerID, events }, payload) => {
        const pId = String(playerID);
        if (G.pendingSupport || !G.pendingPlay || G.pendingPlay.step !== 'challengerReward' || String(G.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        const success = applyChallengerBureaucracyAction(G, pId, payload);
        if (!success) return INVALID_MOVE;

        const tileId = G.pendingPlay.reexecuteTileId || G.pendingPlay.tileIdPlayed;
        if (!queuePendingSupport(G, { phase: 'campaign', afterResolve: 'finishChallengerReward', tileId })) {
          const receiverId = G.pendingPlay.receiverId;
          G.pendingPlay = null;
          if (receiverId !== undefined && receiverId !== null) G.nextMoverId = receiverId;
          applyVictoryCheck(G, tileId);
        }
        events.endTurn();
      }
    },

    next: 'bureaucracy',
    endIf: ({ G }) => {
      if (!G || !G.players) return false;
      return Object.values(G.players).every(p => p && p.hand && p.hand.length === 0) && !G.pendingPlay && !G.pendingSupport;
    }
  };
}
