import { TurnSubmissionSchema, INITIAL_PIECE_COUNTS, TILES, BUREAUCRACY_PRICES } from './types.js';
import { enforceSupportRule, checkVictory, getOrderedChallengers, getNextPlayer } from './board.js';
import { validateMoveCombination, applyMoveToState, classifyPlay } from './moves.js';
import { getClockwiseOrder } from './board.js';
import { initBureaucracy, cleanupBureaucracy, executeBureaucracyActionPayload, selectBestBankTilesToPay } from './bureaucracy.js';

export function isCampaignOver(G) {
  if (!G || !G.players) return false;
  return Object.values(G.players).every(p => p && p.hand && p.hand.length === 0) && !G.pendingPlay;
}

export function advanceCampaignPhaseOnline(nextG, updateMasterGameState) {
  if (isCampaignOver(nextG)) {
    initBureaucracy(nextG);
    updateMasterGameState(nextG, 'bureaucracy');
  } else {
    updateMasterGameState(nextG, 'campaign');
  }
}

export function finishOnlinePendingPlayOrReward(nextG) {
  const challengerId = nextG.pendingPlay?.successfulChallengerId;
  const receiverId = nextG.pendingPlay?.receiverId || nextG.nextMoverId;
  const tileId = nextG.pendingPlay?.reexecuteTileId || nextG.pendingPlay?.tileIdPlayed;

  if (tileId && tileId !== 'BLANK') {
    const winners = Object.keys(nextG.players).filter(p => checkVictory(nextG.boardState, p));
    if (winners.length > 1) nextG.winner = 'draw';
    else if (winners.length === 1) nextG.winner = winners[0];
  }

  if (challengerId && nextG.players[challengerId]) {
    const hasFacedownTiles = (nextG.players[challengerId].bank || []).some(t => t.faceDown);
    if (hasFacedownTiles) {
      nextG.pendingPlay.step = 'challengerReward';
      return;
    } else {
      if (nextG.players[challengerId].credibilityNotchesLost > 0) {
        nextG.players[challengerId].credibilityNotchesLost--;
      }
    }
  }

  nextG.pendingPlay = null;
  if (receiverId !== undefined && receiverId !== null) {
    nextG.nextMoverId = receiverId;
  }
}

export function executeOnlineCampaignTurn(effectiveG, playerID, payload, updateMasterGameState) {
  if (!effectiveG || !updateMasterGameState) return;
  const parsed = TurnSubmissionSchema.safeParse(payload);
  if (!parsed.success) return;

  const moverId = String(playerID);
  const { tileId, receiverId, moves: moveActions } = parsed.data;

  if (!effectiveG.players[moverId] || !effectiveG.players[moverId].hand.includes(tileId)) return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const tilesPerPlayer = (INITIAL_PIECE_COUNTS[nextG.numPlayers] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
  const receiverBank = nextG.players[receiverId]?.bank || [];
  if (receiverBank.length >= tilesPerPlayer) return;

  if (receiverId === moverId) {
    const hasValidOpponentTarget = Object.keys(nextG.players).some(
      p => p !== moverId && (nextG.players[p].bank || []).length < tilesPerPlayer
    );
    if (hasValidOpponentTarget) return;
  }

  const val = validateMoveCombination(moveActions, moverId, nextG.boardState, nextG.community, nextG.numPlayers);
  if (!val.valid) return;

  const backupBoard = JSON.parse(JSON.stringify(nextG.boardState));
  const backupCommunity = JSON.parse(JSON.stringify(nextG.community));

  moveActions.forEach(m => applyMoveToState(m, nextG.boardState, nextG.community));
  nextG.boardState = enforceSupportRule(nextG.boardState, nextG.numPlayers);

  const playType = classifyPlay(moveActions, tileId, moverId, backupBoard, backupCommunity, nextG.numPlayers);
  nextG.players[moverId].hand = nextG.players[moverId].hand.filter(t => t !== tileId);
  nextG.nextMoverId = receiverId;

  nextG.pendingPlay = {
    moverId,
    receiverId,
    tileIdPlayed: tileId,
    movesMade: moveActions,
    playType,
    backupBoard,
    backupCommunity,
    moverStartCredNotches: nextG.players[moverId].credibilityNotchesLost,
    step: 'receipt',
    challengesPassed: []
  };

  nextG.lastOutcomeNotice = null;

  if (nextG.players[receiverId].credibilityNotchesLost >= 3 || tileId === 'BLANK') {
    nextG.pendingPlay.step = 'challenge';
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineAcceptTile(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'receipt' || String(effectiveG.pendingPlay.receiverId) !== pId) return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const eligibleChallengers = getOrderedChallengers(nextG);

  if (eligibleChallengers.length === 0) {
    const { receiverId, tileIdPlayed } = nextG.pendingPlay;
    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
    nextG.nextMoverId = receiverId;
    nextG.pendingPlay = null;

    if (tileIdPlayed !== 'BLANK') {
      const winners = Object.keys(nextG.players).filter(p => checkVictory(nextG.boardState, p));
      if (winners.length > 1) nextG.winner = 'draw';
      else if (winners.length === 1) nextG.winner = winners[0];
    }
  } else {
    nextG.pendingPlay.step = 'challenge';
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineRejectTile(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'receipt' || String(effectiveG.pendingPlay.receiverId) !== pId) return;
  if (effectiveG.pendingPlay.playType === 'Honest') return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity } = nextG.pendingPlay;

  nextG.nextMoverId = receiverId;

  if (playType === 'Dishonest' || playType === 'Illegal') {
    nextG.boardState = backupBoard;
    nextG.community = backupCommunity;

    if (nextG.players[moverId].credibilityNotchesLost < 3) {
      nextG.players[moverId].credibilityNotchesLost++;
    } else {
      nextG.players[moverId].pendingPenaltyWithdraw = true;
    }

    let receiverGotFreeAdvance = false;
    if (nextG.players[receiverId].credibilityNotchesLost === 0) {
      receiverGotFreeAdvance = true;
    } else {
      nextG.players[receiverId].credibilityNotchesLost = Math.max(0, nextG.players[receiverId].credibilityNotchesLost - 2);
    }

    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });

    nextG.pendingPlay.receiverFreeAdvance = receiverGotFreeAdvance;
    nextG.pendingPlay.reexecuteTileId = tileIdPlayed;
    nextG.pendingPlay.nextMoverId = receiverId;
    nextG.pendingPlay.step = 'reexecute';
    nextG.lastOutcomeNotice = {
      title: '🚨 Whistle Blown! (Play Rejected)',
      type: 'reject',
      moverId,
      receiverId,
      tileIdPlayed,
      text: `Player ${receiverId} exposed Player ${moverId}'s dishonest play with Tile ${tileIdPlayed}! Board moves were reset.`
    };
  } else {
    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
    nextG.pendingPlay = null;
    nextG.lastOutcomeNotice = {
      title: '✅ Play Accepted',
      type: 'honest',
      moverId,
      receiverId,
      tileIdPlayed,
      text: `Receiver Player ${receiverId} inspected Player ${moverId}'s play and it was HONEST!`
    };

    if (tileIdPlayed !== 'BLANK') {
      const winners = Object.keys(nextG.players).filter(p => checkVictory(nextG.boardState, p));
      if (winners.length > 1) nextG.winner = 'draw';
      else if (winners.length === 1) nextG.winner = winners[0];
    }
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineChallengeTile(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'challenge') return;
  if (effectiveG.players[pId].credibilityNotchesLost >= 3) return;

  const eligibleChallengers = getOrderedChallengers(effectiveG);
  const remaining = eligibleChallengers.filter(
    id => !effectiveG.pendingPlay.challengesPassed.includes(id)
  );
  if (remaining.length === 0 || remaining[0] !== pId) return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const challengerId = pId;
  const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity } = nextG.pendingPlay;

  nextG.nextMoverId = receiverId;

  if (playType === 'Dishonest' || playType === 'Illegal') {
    nextG.boardState = backupBoard;
    nextG.community = backupCommunity;

    if (nextG.players[moverId].credibilityNotchesLost < 3) {
      nextG.players[moverId].credibilityNotchesLost++;
    } else {
      nextG.players[moverId].pendingPenaltyWithdraw = true;
    }

    nextG.pendingPlay.successfulChallengerId = challengerId;

    if (nextG.players[receiverId].credibilityNotchesLost < 3) {
      nextG.players[receiverId].credibilityNotchesLost++;
    }

    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });
    nextG.pendingPlay.reexecuteTileId = tileIdPlayed;
    nextG.pendingPlay.nextMoverId = receiverId;
    nextG.pendingPlay.step = 'reexecute';

    nextG.lastOutcomeNotice = {
      title: '🚨 Successful Challenge!',
      type: 'challengeSuccess',
      moverId,
      challengerId,
      tileIdPlayed,
      text: `Challenger Player ${challengerId} exposed Player ${moverId}'s dishonest play! Board moves were reset.`
    };
  } else {
    if (nextG.players[challengerId].credibilityNotchesLost < 3) {
      nextG.players[challengerId].credibilityNotchesLost++;
    }
    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
    nextG.pendingPlay = null;

    nextG.lastOutcomeNotice = {
      title: '❌ Challenge Failed (Play Was Honest)',
      type: 'challengeFailed',
      moverId,
      challengerId,
      tileIdPlayed,
      text: `Player ${challengerId} challenged Player ${moverId}, but the play was HONEST!`
    };

    if (tileIdPlayed !== 'BLANK') {
      const winners = Object.keys(nextG.players).filter(p => checkVictory(nextG.boardState, p));
      if (winners.length > 1) nextG.winner = 'draw';
      else if (winners.length === 1) nextG.winner = winners[0];
    }
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlinePassChallenge(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'challenge') return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  if (!nextG.pendingPlay.challengesPassed.includes(pId)) {
    nextG.pendingPlay.challengesPassed.push(pId);
  }

  const eligibleChallengers = getOrderedChallengers(nextG);
  const remaining = eligibleChallengers.filter(
    id => !nextG.pendingPlay.challengesPassed.includes(id)
  );

  if (remaining.length === 0) {
    const { receiverId, tileIdPlayed } = nextG.pendingPlay;
    nextG.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
    nextG.nextMoverId = receiverId;
    nextG.pendingPlay = null;

    if (tileIdPlayed !== 'BLANK') {
      const winners = Object.keys(nextG.players).filter(p => checkVictory(nextG.boardState, p));
      if (winners.length > 1) nextG.winner = 'draw';
      else if (winners.length === 1) nextG.winner = winners[0];
    }
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineReexecute(effectiveG, playerID, stagedMoves, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const { moverId } = nextG.pendingPlay;

  stagedMoves.forEach(m => applyMoveToState(m, nextG.boardState, nextG.community));
  nextG.boardState = enforceSupportRule(nextG.boardState, nextG.numPlayers);

  if (nextG.players[moverId].pendingPenaltyWithdraw) {
    nextG.pendingPlay.step = 'penaltyWithdraw';
  } else if (nextG.pendingPlay.receiverFreeAdvance) {
    nextG.pendingPlay.step = 'freeAdvance';
  } else {
    finishOnlinePendingPlayOrReward(nextG);
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlinePenaltyWithdraw(effectiveG, playerID, stagedMove, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const { moverId } = nextG.pendingPlay;

  if (stagedMove) {
    applyMoveToState(stagedMove, nextG.boardState, nextG.community);
    nextG.boardState = enforceSupportRule(nextG.boardState, nextG.numPlayers);
  }

  nextG.players[moverId].pendingPenaltyWithdraw = false;

  if (nextG.pendingPlay.receiverFreeAdvance) {
    nextG.pendingPlay.step = 'freeAdvance';
  } else {
    finishOnlinePendingPlayOrReward(nextG);
  }

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineFreeAdvance(effectiveG, playerID, stagedMove, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const nextG = JSON.parse(JSON.stringify(effectiveG));

  if (stagedMove) {
    applyMoveToState(stagedMove, nextG.boardState, nextG.community);
    nextG.boardState = enforceSupportRule(nextG.boardState, nextG.numPlayers);
  }

  finishOnlinePendingPlayOrReward(nextG);

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineChallengerCredibility(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'challengerReward' || String(effectiveG.pendingPlay.successfulChallengerId) !== pId) return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  if (nextG.players[pId].credibilityNotchesLost > 0) {
    nextG.players[pId].credibilityNotchesLost--;
  }

  const receiverId = nextG.pendingPlay.receiverId;
  nextG.pendingPlay = null;
  if (receiverId !== undefined && receiverId !== null) nextG.nextMoverId = receiverId;

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineChallengerBureaucracyAction(effectiveG, playerID, actionPayload, updateMasterGameState) {
  if (!effectiveG?.pendingPlay || !updateMasterGameState) return;
  const pId = String(playerID);
  if (effectiveG.pendingPlay.step !== 'challengerReward' || String(effectiveG.pendingPlay.successfulChallengerId) !== pId) return;

  const nextG = JSON.parse(JSON.stringify(effectiveG));
  const player = nextG.players[pId];
  if (!player) return;

  const facedownTiles = (player.bank || []).filter(t => t.faceDown);

  const { actionType, targetLoc, subAction } = actionPayload;
  const prices = BUREAUCRACY_PRICES[nextG.numPlayers] || BUREAUCRACY_PRICES[3];
  let cost = 0;
  if (actionType === 'RESTORE_CRED') cost = prices.RESTORE_CRED;
  else if (actionType === 'PROMOTE_SEAT') cost = prices.PROMOTE_SEAT;
  else if (actionType === 'PROMOTE_ROSTRUM') cost = prices.PROMOTE_ROSTRUM;
  else if (actionType === 'PROMOTE_OFFICE') cost = prices.PROMOTE_OFFICE;
  else if (actionType === 'BASIC_ACTION') cost = prices.BASIC_ACTION;
  else if (actionType === 'EXTRA_ACTION') cost = prices.EXTRA_ACTION;

  const tilesToPay = selectBestBankTilesToPay(facedownTiles, cost);
  if (tilesToPay.length === 0) return;

  const success = executeBureaucracyActionPayload(nextG, pId, { actionType, targetLoc, subAction });
  if (!success) return;

  tilesToPay.forEach(t => {
    t.faceDown = false;
  });

  const receiverId = nextG.pendingPlay.receiverId;
  nextG.pendingPlay = null;
  if (receiverId !== undefined && receiverId !== null) nextG.nextMoverId = receiverId;

  advanceCampaignPhaseOnline(nextG, updateMasterGameState);
}

export function executeOnlineBureaucracyAction(effectiveG, playerID, actionPayload, updateMasterGameState) {
  if (!effectiveG || !updateMasterGameState) return;
  const pId = String(playerID);
  const nextG = JSON.parse(JSON.stringify(effectiveG));

  const pData = nextG.players[pId];
  if (!pData) return;

  const { actionType, fromLoc, toLoc, shopCost = 0 } = actionPayload;

  if (shopCost > 0) {
    pData.funding = Math.max(0, (pData.funding || 0) - shopCost);
  }

  if (actionType === 'RESTORE_CRED') {
    pData.credibilityNotchesLost = Math.max(0, (pData.credibilityNotchesLost || 0) - 1);
  } else if (actionType === 'PROMOTE_SEAT_TO_ROSTRUM' && fromLoc && toLoc) {
    const piece = nextG.boardState[fromLoc];
    if (piece) {
      nextG.boardState[toLoc] = piece;
      nextG.boardState[fromLoc] = null;
      nextG.boardState = enforceSupportRule(nextG.boardState, nextG.numPlayers);
    }
  }

  updateMasterGameState(nextG, 'bureaucracy');
}

export function executeOnlineEndBureaucracyTurn(effectiveG, playerID, updateMasterGameState) {
  if (!effectiveG || !updateMasterGameState) return;
  const pId = String(playerID);
  const nextG = JSON.parse(JSON.stringify(effectiveG));

  const np = nextG.numPlayers || 3;
  const nextP = getNextPlayer(pId, np);

  if (nextP === '0') {
    // All players completed bureaucracy -> Return to Campaign phase
    cleanupBureaucracy(nextG);
    updateMasterGameState(nextG, 'campaign');
  } else {
    nextG.nextMoverId = nextP;
    updateMasterGameState(nextG, 'bureaucracy');
  }
}
