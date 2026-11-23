import { useState, useMemo, useEffect } from 'react';
import { PIECE_TYPES, BUREAUCRACY_PRICES, MOVE_TYPES, TILES } from '../../domain/types.js';
import { getValidDestinations, inferMoveType } from '../../domain/moveRulesUtils.js';
import { executeOnlineBureaucracyAction, executeOnlineChallengerBureaucracyAction } from '../../domain/onlineEngine.js';

const BASIC_MOVE_TYPES = [MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE];
const EXTRA_MOVE_TYPES = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];

export function useBureaucracyBoard({ G, ctx, playerID, moves, numPlayers, isOnline = false, updateMasterGameState = null }) {
  const [moveFromLoc, setMoveFromLoc] = useState('');

  useEffect(() => {
    setMoveFromLoc('');
  }, [ctx?.phase, ctx?.currentPlayer, G?.pendingPlay?.step]);

  const pId = String(playerID);
  const isChallengerReward = G?.pendingPlay?.step === 'challengerReward' && String(G?.pendingPlay?.successfulChallengerId) === pId;
  const isMyTurn = (ctx && String(ctx.currentPlayer) === pId) || isChallengerReward;
  const domainKey = `p${parseInt(pId, 10) + 1}`;
  const myPlayer = (G && G.players && G.players[pId]) || {};

  const facedownFunding = useMemo(() => {
    if (!myPlayer.bank) return 0;
    return myPlayer.bank.reduce((sum, item) => item.faceDown ? sum + (TILES[item.tileId]?.funding || 0) : sum, 0);
  }, [myPlayer.bank]);

  const funding = isChallengerReward ? facedownFunding : (myPlayer.funding || 0);
  const prices = BUREAUCRACY_PRICES[numPlayers] || BUREAUCRACY_PRICES[3];

  const playerHasPawn = useMemo(() => {
    if (!G || !G.boardState) return false;
    return Object.keys(G.boardState).some(k => k.startsWith(`${domainKey}_`) && G.boardState[k]?.type === PIECE_TYPES.PAWN);
  }, [G?.boardState, domainKey]);

  // Auto-detect promotion eligibility for the currently selected piece
  const selectedPromotion = useMemo(() => {
    if (!isMyTurn || !moveFromLoc || !G?.boardState) return null;
    if (!moveFromLoc.startsWith(`${domainKey}_`)) return null;
    const piece = G.boardState[moveFromLoc];
    if (!piece) return null;

    let actionType = null;
    let price = 0;
    if (moveFromLoc.includes('_seat')) {
      actionType = 'PROMOTE_SEAT';
      price = prices.PROMOTE_SEAT;
    } else if (moveFromLoc.includes('_rostrum')) {
      actionType = 'PROMOTE_ROSTRUM';
      price = prices.PROMOTE_ROSTRUM;
    } else if (moveFromLoc.endsWith('_office')) {
      actionType = 'PROMOTE_OFFICE';
      price = prices.PROMOTE_OFFICE;
    } else {
      return null;
    }

    const canUpgradeType =
      (piece.type === PIECE_TYPES.MARK && (G.community?.heels || 0) > 0) ||
      (piece.type === PIECE_TYPES.HEEL && (G.community?.pawns || 0) > 0 && !playerHasPawn);

    return {
      actionType,
      price,
      canAfford: funding >= price,
      canUpgradeType,
      canPromote: canUpgradeType && funding >= price
    };
  }, [isMyTurn, moveFromLoc, G?.boardState, G?.community, domainKey, prices, funding, playerHasPawn]);

  // Auto-detect all legal & affordable move destinations for the selected piece
  const moveValidDestinations = useMemo(() => {
    if (!isMyTurn || !moveFromLoc || !G?.boardState) return [];
    const piece = G.boardState[moveFromLoc];
    if (!piece && !moveFromLoc.startsWith('community_')) return [];

    const allTargets = getValidDestinations(moveFromLoc, pId, G.boardState, G.community, numPlayers, [], '');
    return allTargets.filter((toLoc) => {
      const inferred = inferMoveType(moveFromLoc, toLoc, pId, G.boardState, G.community, numPlayers, [], '');
      if (BASIC_MOVE_TYPES.includes(inferred)) return funding >= prices.BASIC_ACTION;
      if (EXTRA_MOVE_TYPES.includes(inferred)) return funding >= prices.EXTRA_ACTION;
      return false;
    });
  }, [isMyTurn, moveFromLoc, G?.boardState, G?.community, pId, numPlayers, funding, prices]);

  // Auto-detect which move price tier(s) to highlight for the selected piece
  const highlightedMoveTiers = useMemo(() => {
    const tiers = new Set();
    if (!isMyTurn || !moveFromLoc || !G?.boardState) return tiers;

    if (moveFromLoc.startsWith(`${domainKey}_`)) {
      tiers.add('BASIC_ACTION');
    } else if (/^p\d+_/.test(moveFromLoc)) {
      tiers.add('EXTRA_ACTION');
    } else if (moveFromLoc.startsWith('community_')) {
      tiers.add('BASIC_ACTION');
      tiers.add('EXTRA_ACTION');
    }
    return tiers;
  }, [isMyTurn, moveFromLoc, G?.boardState, domainKey]);

  const resetBureaucracySelection = () => {
    setMoveFromLoc('');
  };

  const dispatchBureaucracy = (payload) => {
    if (isChallengerReward) {
      if (isOnline) executeOnlineChallengerBureaucracyAction(G, playerID, payload, updateMasterGameState);
      else moves?.buyChallengerBureaucracyAction(payload);
    } else {
      if (isOnline) executeOnlineBureaucracyAction(G, playerID, payload, updateMasterGameState);
      else moves?.buyBureaucracyAction(payload);
    }
    resetBureaucracySelection();
  };

  const handlePromoteSelected = () => {
    if (!selectedPromotion?.canPromote || !moveFromLoc) return;
    dispatchBureaucracy({
      actionType: selectedPromotion.actionType,
      targetLoc: moveFromLoc
    });
  };

  const handleBureaucracySpotClick = (locKey) => {
    if (!isMyTurn || !G?.boardState) return;

    if (moveFromLoc === locKey) {
      setMoveFromLoc('');
      return;
    }

    const piece = G.boardState[locKey];
    if (piece) {
      setMoveFromLoc(locKey);
    } else {
      setMoveFromLoc('');
    }
  };

  const handleBureaucracyDestinationClick = (toLoc) => {
    if (!isMyTurn || !moveFromLoc || !moveValidDestinations.includes(toLoc)) return;

    const inferred = inferMoveType(moveFromLoc, toLoc, pId, G.boardState, G.community, numPlayers, [], '');
    const isBasic = BASIC_MOVE_TYPES.includes(inferred);
    const isExtra = EXTRA_MOVE_TYPES.includes(inferred);
    if (!isBasic && !isExtra) return;

    const actionType = isBasic ? 'BASIC_ACTION' : 'EXTRA_ACTION';
    const normTo = toLoc.startsWith('community_') ? 'community' : toLoc;

    dispatchBureaucracy({
      actionType,
      subAction: {
        type: inferred,
        from: moveFromLoc,
        to: normTo
      }
    });
  };

  return {
    moveFromLoc,
    moveValidDestinations,
    validPromotionSpots: [],
    selectedPromotion,
    highlightedMoveTiers,
    handlePromoteSelected,
    resetBureaucracySelection,
    handleBureaucracySpotClick,
    handleBureaucracyDestinationClick
  };
}
