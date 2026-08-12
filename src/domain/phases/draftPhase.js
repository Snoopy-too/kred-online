import { INVALID_MOVE } from 'boardgame.io/core';
import { getClockwiseOrder } from '../board.js';
import { handleLoadSaveState } from '../sharedMoves.js';

export function createDraftPhase() {
  const handleSkipDraft = ({ G, events }) => {
    const np = G.numPlayers || 3;
    const order = getClockwiseOrder(np);

    order.forEach(pId => {
      const pack = G.draftPacks ? G.draftPacks[pId] || [] : [];
      G.players[pId].hand = [...(G.players[pId].hand || []), ...pack];
      if (G.draftPacks) G.draftPacks[pId] = [];
    });

    G.draftSelectionsThisRound = {};
    if (events && events.setPhase) {
      events.setPhase('campaign');
    }
  };

  return {
    start: true,
    moves: {
      skipDraftPhase: handleSkipDraft,
      loadSaveState: handleLoadSaveState
    },
    turn: {
      activePlayers: { all: 'drafting' },
      stages: {
        drafting: {
          moves: {
            skipDraftPhase: handleSkipDraft,
            loadSaveState: handleLoadSaveState,
            selectDraftTile: ({ G, ctx, playerID, events }, tileId) => {
              const pId = String(playerID);
              const pack = G.draftPacks ? G.draftPacks[pId] : null;

              if (!pack || !pack.includes(tileId)) {
                console.log('[selectDraftTile] INVALID: player', pId, 'tileId', tileId, 'pack', pack);
                return INVALID_MOVE;
              }

              G.players[pId].hand.push(tileId);
              G.draftPacks[pId] = pack.filter(t => t !== tileId);
              G.draftSelectionsThisRound[pId] = true;

              console.log('[selectDraftTile] Player', pId, 'picked', tileId);

              // Check if all players selected a tile this round
              const allSelected = Object.keys(G.players).every(id => G.draftSelectionsThisRound[id]);
              if (allSelected) {
                // Pass packs clockwise
                const order = getClockwiseOrder(G.numPlayers);
                const newPacks = {};
                for (let i = 0; i < order.length; i++) {
                  const currentP = order[i];
                  const nextP = order[(i + 1) % order.length];
                  newPacks[nextP] = G.draftPacks[currentP];
                }
                G.draftPacks = newPacks;
                G.draftSelectionsThisRound = {};

                // Only reset stages if there are more tiles to draft
                const hasMoreTiles = Object.values(G.draftPacks).some(pack => pack && pack.length > 0);
                if (hasMoreTiles) {
                  events.setActivePlayers({ all: 'drafting' });
                }
              } else {
                events.endStage();
              }
            }
          }
        }
      }
    },
    next: 'campaign',
    endIf: ({ G }) => {
      if (!G || !G.draftPacks) return false;
      return Object.values(G.draftPacks).every(pack => Array.isArray(pack) && pack.length === 0);
    }
  };
}
