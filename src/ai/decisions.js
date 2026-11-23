import { decideDraftPick, decideCampaignMove } from './campaignDecisions.js';
import {
  decideReceipt,
  decideChallenge,
  decideReexecute,
  decidePenaltyWithdraw,
  decideReceiverReward,
  decideFreeAdvance,
  decideChallengerReward,
  decideSupportDrop
} from './pendingDecisions.js';
import { decideBureaucracyAction } from './bureaucracyDecisions.js';

export {
  decideDraftPick,
  decideCampaignMove,
  decideReceipt,
  decideChallenge,
  decideReexecute,
  decidePenaltyWithdraw,
  decideReceiverReward,
  decideFreeAdvance,
  decideChallengerReward,
  decideSupportDrop,
  decideBureaucracyAction
};

/**
 * Top-level AI action router. Given a sanitized bot observation and persona,
 * returns { move, args } for any active bot state, or null if no action is required.
 */
export function decideAction(obs, persona, rng = Math.random) {
  if (!obs || obs.winner) return null;

  // Outside simultaneous draft, boardgame.io only allows ctx.currentPlayer to move.
  if (obs.phase !== 'draft' && obs.currentPlayer !== null && obs.currentPlayer !== obs.botId) {
    return null;
  }

  if (obs.pendingSupport) {
    if (String(obs.pendingSupport.ownerId) !== obs.botId) return null;
    return decideSupportDrop(obs);
  }

  if (obs.pendingPlay) {
    const pp = obs.pendingPlay;
    if (pp.activePlayer !== null && String(pp.activePlayer) !== obs.botId) {
      return null;
    }
    switch (pp.step) {
      case 'receipt':
        return decideReceipt(obs, persona, rng);
      case 'challenge':
        return decideChallenge(obs, persona, rng);
      case 'reexecute':
        return decideReexecute(obs, persona);
      case 'penaltyWithdraw':
        return decidePenaltyWithdraw(obs, persona);
      case 'receiverReward':
        return decideReceiverReward(obs, persona);
      case 'freeAdvance':
        return decideFreeAdvance(obs, persona);
      case 'challengerReward':
        return decideChallengerReward(obs, persona, rng);
      default:
        return null;
    }
  }

  if (obs.phase === 'draft') {
    if (!obs.hasDraftedThisRound && (obs.draftPack?.length || 0) > 0) {
      return decideDraftPick(obs, persona, rng);
    }
    return null;
  }

  if (obs.phase === 'campaign') {
    if (obs.currentPlayer === obs.botId && (obs.hand?.length || 0) > 0) {
      return decideCampaignMove(obs, persona, rng);
    }
    return null;
  }

  if (obs.phase === 'bureaucracy') {
    if (obs.currentPlayer === obs.botId) {
      return decideBureaucracyAction(obs, persona, rng);
    }
    return null;
  }

  return null;
}
