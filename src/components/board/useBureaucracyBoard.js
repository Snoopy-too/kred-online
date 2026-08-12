import { useState, useMemo } from 'react';
import { PIECE_TYPES, BUREAUCRACY_PRICES, MOVE_TYPES } from '../../domain/types.js';
import { getValidDestinations, inferMoveType } from '../../domain/moveRulesUtils.js';

export function useBureaucracyBoard({ G, ctx, playerID, moves, numPlayers }) {
  const [selectedShopItem, setSelectedShopItem] = useState(null); // 'PROMOTE_SEAT' | 'PROMOTE_ROSTRUM' | 'PROMOTE_OFFICE' | 'MOVE_ACTION' | null
  const [selectedActionType, setSelectedActionType] = useState(MOVE_TYPES.ADVANCE);
  const [moveFromLoc, setMoveFromLoc] = useState('');
  const [moveValidDestinations, setMoveValidDestinations] = useState([]);

  const isMyTurn = ctx && String(ctx.currentPlayer) === String(playerID);
  const pId = String(playerID);
  const domainKey = `p${parseInt(pId, 10) + 1}`;
  const myPlayer = (G && G.players && G.players[pId]) || {};
  const funding = myPlayer.funding || 0;
  const prices = BUREAUCRACY_PRICES[numPlayers] || BUREAUCRACY_PRICES[3];

  const playerHasPawn = useMemo(() => {
    if (!G || !G.boardState) return false;
    return Object.keys(G.boardState).some(k => k.startsWith(`${domainKey}_`) && G.boardState[k]?.type === PIECE_TYPES.PAWN);
  }, [G?.boardState, domainKey]);

  // Calculate valid promotion target spots on board given selected shop item
  const validPromotionSpots = useMemo(() => {
    if (!isMyTurn || !G || !G.boardState) return [];

    let targetPrefixes = [];
    let price = 0;
    if (selectedShopItem === 'PROMOTE_SEAT') {
      targetPrefixes = [1, 2, 3, 4, 5, 6].map(s => `${domainKey}_seat${s}`);
      price = prices.PROMOTE_SEAT;
    } else if (selectedShopItem === 'PROMOTE_ROSTRUM') {
      targetPrefixes = [`${domainKey}_rostrum1`, `${domainKey}_rostrum2`];
      price = prices.PROMOTE_ROSTRUM;
    } else if (selectedShopItem === 'PROMOTE_OFFICE') {
      targetPrefixes = [`${domainKey}_office`];
      price = prices.PROMOTE_OFFICE;
    } else {
      return [];
    }

    if (funding < price) return [];

    return targetPrefixes.filter(locKey => {
      const piece = G.boardState[locKey];
      if (!piece) return false;
      if (piece.type === PIECE_TYPES.MARK && G.community.heels > 0) return true;
      if (piece.type === PIECE_TYPES.HEEL && G.community.pawns > 0 && !playerHasPawn) return true;
      return false;
    });
  }, [selectedShopItem, isMyTurn, G?.boardState, G?.community, domainKey, funding, prices, playerHasPawn]);

  // Clear selections
  const resetBureaucracySelection = () => {
    setSelectedShopItem(null);
    setMoveFromLoc('');
    setMoveValidDestinations([]);
  };

  // Select shop item
  const handleSelectShopItem = (item) => {
    if (selectedShopItem === item) {
      resetBureaucracySelection();
    } else {
      setSelectedShopItem(item);
      setMoveFromLoc('');
      setMoveValidDestinations([]);
    }
  };

  // Handle board spot click in Bureaucracy mode
  const handleBureaucracySpotClick = (locKey) => {
    if (!isMyTurn || !selectedShopItem) return;

    // Promotion targeting
    if (['PROMOTE_SEAT', 'PROMOTE_ROSTRUM', 'PROMOTE_OFFICE'].includes(selectedShopItem)) {
      if (validPromotionSpots.includes(locKey)) {
        moves.buyBureaucracyAction({
          actionType: selectedShopItem,
          targetLoc: locKey
        });
        resetBureaucracySelection();
      }
      return;
    }

    // Move Action targeting
    if (selectedShopItem === 'MOVE_ACTION') {
      if (!moveFromLoc) {
        // Pick "From" piece
        const piece = G.boardState[locKey];
        if (piece || locKey.startsWith('community_')) {
          const allTargets = getValidDestinations(locKey, pId, G.boardState, G.community, numPlayers, [], '');
          // Filter targets for selectedActionType
          const matchingTargets = allTargets.filter(toLoc => {
            const inferred = inferMoveType(locKey, toLoc, pId, G.boardState, G.community, numPlayers, [], '');
            return inferred === selectedActionType;
          });

          if (matchingTargets.length > 0) {
            setMoveFromLoc(locKey);
            setMoveValidDestinations(matchingTargets);
          }
        }
      } else {
        // Deselect or switch from piece if clicked again
        if (moveFromLoc === locKey) {
          setMoveFromLoc('');
          setMoveValidDestinations([]);
        } else if (G.boardState[locKey]) {
          // Switch to new piece
          const allTargets = getValidDestinations(locKey, pId, G.boardState, G.community, numPlayers, [], '');
          const matchingTargets = allTargets.filter(toLoc => {
            const inferred = inferMoveType(locKey, toLoc, pId, G.boardState, G.community, numPlayers, [], '');
            return inferred === selectedActionType;
          });
          if (matchingTargets.length > 0) {
            setMoveFromLoc(locKey);
            setMoveValidDestinations(matchingTargets);
          } else {
            setMoveFromLoc('');
            setMoveValidDestinations([]);
          }
        }
      }
    }
  };

  // Handle destination click for move action
  const handleBureaucracyDestinationClick = (toLoc) => {
    if (selectedShopItem !== 'MOVE_ACTION' || !moveFromLoc || !moveValidDestinations.includes(toLoc)) return;

    const isBasic = ['Advance', 'Withdraw', 'Organize'].includes(selectedActionType);
    const actionType = isBasic ? 'BASIC_ACTION' : 'EXTRA_ACTION';
    const normTo = toLoc.startsWith('community_') ? 'community' : toLoc;

    moves.buyBureaucracyAction({
      actionType,
      subAction: {
        type: selectedActionType,
        from: moveFromLoc,
        to: normTo
      }
    });

    resetBureaucracySelection();
  };

  return {
    selectedShopItem,
    selectedActionType,
    setSelectedActionType,
    moveFromLoc,
    moveValidDestinations,
    validPromotionSpots,
    handleSelectShopItem,
    resetBureaucracySelection,
    handleBureaucracySpotClick,
    handleBureaucracyDestinationClick
  };
}
