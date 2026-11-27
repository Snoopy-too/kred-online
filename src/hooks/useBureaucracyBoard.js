import { useState, useMemo, useEffect } from 'react';
import { PIECE_TYPES, BUREAUCRACY_PRICES, MOVE_TYPES, TILES } from '../domain/types.js';
import { getPromotionTargetType, getBureaucracyActionCost, executeBureaucracyActionPayload } from '../domain/bureaucracy.js';
import { getValidDestinations, inferMoveType } from '../domain/moveRulesUtils.js';

const BASIC_MOVE_TYPES = [MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE];
const EXTRA_MOVE_TYPES = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];

export function useBureaucracyBoard({ G, ctx, playerID, moves, numPlayers, expertMode = false }) {
  const [moveFromLoc, setMoveFromLoc] = useState('');
  const [stagedActions, setStagedActions] = useState([]);
  const [transientBoardState, setTransientBoardState] = useState(null);
  const [transientCommunity, setTransientCommunity] = useState(null);
  const [transientFunding, setTransientFunding] = useState(null);
  const [transientCredNotchesLost, setTransientCredNotchesLost] = useState(null);

  const resetStagedState = () => {
    setMoveFromLoc('');
    setStagedActions([]);
    setTransientBoardState(null);
    setTransientCommunity(null);
    setTransientFunding(null);
    setTransientCredNotchesLost(null);
  };

  useEffect(() => {
    resetStagedState();
  }, [ctx?.phase, ctx?.currentPlayer, G?.pendingPlay?.step, G?.boardState]);

  const pId = String(playerID);
  const isChallengerReward = G?.pendingPlay?.step === 'challengerReward' && String(G?.pendingPlay?.successfulChallengerId) === pId;
  const isMyTurn = (ctx && String(ctx.currentPlayer) === pId) || isChallengerReward;
  const isStagedMode = !expertMode && !isChallengerReward && ctx?.phase === 'bureaucracy';
  const domainKey = `p${parseInt(pId, 10) + 1}`;
  const myPlayer = (G && G.players && G.players[pId]) || {};

  const effectiveBoardState = (isStagedMode && transientBoardState) || G?.boardState;
  const effectiveCommunity = (isStagedMode && transientCommunity) || G?.community;

  const facedownFunding = useMemo(() => {
    if (!myPlayer.bank) return 0;
    return myPlayer.bank.reduce((sum, item) => item.faceDown ? sum + (TILES[item.tileId]?.funding || 0) : sum, 0);
  }, [myPlayer.bank]);

  const baseFunding = isChallengerReward ? facedownFunding : (myPlayer.funding || 0);
  const funding = (isStagedMode && transientFunding !== null) ? transientFunding : baseFunding;
  const effectiveCredNotchesLost = (isStagedMode && transientCredNotchesLost !== null) ? transientCredNotchesLost : (myPlayer.credibilityNotchesLost || 0);
  const prices = BUREAUCRACY_PRICES[numPlayers] || BUREAUCRACY_PRICES[3];

  const playerHasPawn = useMemo(() => {
    if (!effectiveBoardState) return false;
    return Object.keys(effectiveBoardState).some(k => k.startsWith(`${domainKey}_`) && effectiveBoardState[k]?.type === PIECE_TYPES.PAWN);
  }, [effectiveBoardState, domainKey]);

  // Auto-detect promotion eligibility for the currently selected piece
  const selectedPromotion = useMemo(() => {
    if (!isMyTurn || !moveFromLoc || !effectiveBoardState) return null;
    if (!moveFromLoc.startsWith(`${domainKey}_`)) return null;
    const piece = effectiveBoardState[moveFromLoc];
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

    const targetType = getPromotionTargetType(piece.type, effectiveCommunity, playerHasPawn);
    const canUpgradeType = Boolean(targetType);

    return {
      actionType,
      price,
      targetType,
      canAfford: funding >= price,
      canUpgradeType,
      canPromote: canUpgradeType && funding >= price
    };
  }, [isMyTurn, moveFromLoc, effectiveBoardState, effectiveCommunity, domainKey, prices, funding, playerHasPawn]);

  // Auto-detect all legal & affordable move destinations for the selected piece
  const moveValidDestinations = useMemo(() => {
    if (!isMyTurn || !moveFromLoc || !effectiveBoardState) return [];
    const piece = effectiveBoardState[moveFromLoc];
    if (!piece && !moveFromLoc.startsWith('community_')) return [];

    const allTargets = getValidDestinations(moveFromLoc, pId, effectiveBoardState, effectiveCommunity, numPlayers, [], '');
    return allTargets.filter((toLoc) => {
      const inferred = inferMoveType(moveFromLoc, toLoc, pId, effectiveBoardState, effectiveCommunity, numPlayers, [], '');
      if (BASIC_MOVE_TYPES.includes(inferred)) return funding >= prices.BASIC_ACTION;
      if (EXTRA_MOVE_TYPES.includes(inferred)) return funding >= prices.EXTRA_ACTION;
      return false;
    });
  }, [isMyTurn, moveFromLoc, effectiveBoardState, effectiveCommunity, pId, numPlayers, funding, prices]);

  // Auto-detect which move price tier(s) to highlight for the selected piece
  const highlightedMoveTiers = useMemo(() => {
    const tiers = new Set();
    if (!isMyTurn || !moveFromLoc || !effectiveBoardState) return tiers;

    if (moveFromLoc.startsWith(`${domainKey}_`)) {
      tiers.add('BASIC_ACTION');
    } else if (/^p\d+_/.test(moveFromLoc)) {
      tiers.add('EXTRA_ACTION');
    } else if (moveFromLoc.startsWith('community_')) {
      tiers.add('BASIC_ACTION');
      tiers.add('EXTRA_ACTION');
    }
    return tiers;
  }, [isMyTurn, moveFromLoc, effectiveBoardState, domainKey]);

  const resetBureaucracySelection = () => {
    setMoveFromLoc('');
  };

  const dispatchBureaucracy = (payload) => {
    if (isStagedMode) {
      const cost = getBureaucracyActionCost(prices, payload.actionType);
      if (cost <= 0 || funding < cost) return;
      const simG = {
        numPlayers,
        boardState: JSON.parse(JSON.stringify(effectiveBoardState || {})),
        community: JSON.parse(JSON.stringify(effectiveCommunity || {})),
        players: {
          [pId]: { ...myPlayer, credibilityNotchesLost: effectiveCredNotchesLost }
        }
      };
      if (!executeBureaucracyActionPayload(simG, pId, payload)) return;
      setTransientBoardState(simG.boardState);
      setTransientCommunity(simG.community);
      setTransientFunding(funding - cost);
      setTransientCredNotchesLost(simG.players[pId].credibilityNotchesLost);
      setStagedActions((prev) => [...prev, payload]);
      resetBureaucracySelection();
      return;
    }

    if (isChallengerReward) {
      moves?.buyChallengerBureaucracyAction(payload);
    } else {
      moves?.buyBureaucracyAction(payload);
    }
    resetBureaucracySelection();
  };

  const canRestoreCred = Boolean(
    ctx?.phase === 'bureaucracy' &&
    !isChallengerReward &&
    isMyTurn &&
    effectiveCredNotchesLost > 0 &&
    funding >= prices.RESTORE_CRED
  );

  const handleRestoreCred = () => {
    if (!canRestoreCred) return;
    dispatchBureaucracy({ actionType: 'RESTORE_CRED', shopCost: prices.RESTORE_CRED });
  };

  const handlePromoteSelected = () => {
    if (!selectedPromotion?.canPromote || !moveFromLoc) return;
    dispatchBureaucracy({
      actionType: selectedPromotion.actionType,
      targetLoc: moveFromLoc
    });
  };

  const handleBureaucracySpotClick = (locKey) => {
    if (!isMyTurn || !effectiveBoardState) return;

    if (moveFromLoc === locKey) {
      setMoveFromLoc('');
      return;
    }

    const piece = effectiveBoardState[locKey];
    if (piece) {
      setMoveFromLoc(locKey);
    } else {
      setMoveFromLoc('');
    }
  };

  const handleBureaucracyDestinationClick = (toLoc) => {
    const isCommValid = toLoc.startsWith('community_') && moveValidDestinations.some(d => d === 'community' || d.startsWith('community_'));
    if (!isMyTurn || !moveFromLoc || (!moveValidDestinations.includes(toLoc) && !isCommValid)) return;

    const inferred = inferMoveType(moveFromLoc, toLoc, pId, effectiveBoardState, effectiveCommunity, numPlayers, [], '');
    const isBasic = BASIC_MOVE_TYPES.includes(inferred);
    const isExtra = EXTRA_MOVE_TYPES.includes(inferred);
    if (!isBasic && !isExtra) return;

    const actionType = isBasic ? 'BASIC_ACTION' : 'EXTRA_ACTION';
    const pieceObj = effectiveBoardState?.[moveFromLoc];

    dispatchBureaucracy({
      actionType,
      subAction: {
        type: inferred,
        from: moveFromLoc,
        to: toLoc,
        pieceId: pieceObj?.id
      }
    });
  };

  const handleFinishBureaucracyTurn = () => {
    if (!isMyTurn || isChallengerReward) return;
    if (isStagedMode && moves?.submitBureaucracyTurn) {
      moves.submitBureaucracyTurn(stagedActions);
      resetStagedState();
    } else {
      moves?.endBureaucracyTurn();
    }
  };

  const stagedMoves = useMemo(() => {
    return stagedActions
      .map((a) => {
        if (a.subAction) return a.subAction;
        if (a.targetLoc) return { type: 'Promote', to: a.targetLoc };
        return null;
      })
      .filter(Boolean);
  }, [stagedActions]);

  return {
    moveFromLoc,
    moveValidDestinations,
    validPromotionSpots: [],
    selectedPromotion,
    highlightedMoveTiers,
    handlePromoteSelected,
    canRestoreCred,
    handleRestoreCred,
    resetBureaucracySelection,
    handleResetBureaucracyTurn: resetStagedState,
    handleFinishBureaucracyTurn,
    handleBureaucracySpotClick,
    handleBureaucracyDestinationClick,
    stagedActions,
    stagedMoves,
    transientBoardState: isStagedMode ? transientBoardState : null,
    effectiveFunding: funding,
    effectiveCredNotchesLost
  };
}
