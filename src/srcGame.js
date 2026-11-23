import { TILES, INITIAL_PIECE_COUNTS, PIECE_TYPES } from './domain/types.js';
import { createDraftPhase } from './domain/phases/draftPhase.js';
import { createCampaignPhase } from './domain/phases/campaignPhase.js';
import { createBureaucracyPhase } from './domain/bureaucracy.js';
import { createEmptyPlayerStats } from './domain/gameLog.js';

export function filterSoloPlayerView(G, playerID) {
  if (!G || playerID === null || playerID === undefined) return G;
  const pId = String(playerID);
  const nextG = JSON.parse(JSON.stringify(G));

  if (nextG.players) {
    Object.keys(nextG.players).forEach((id) => {
      if (id !== pId) {
        const p = nextG.players[id];
        if (Array.isArray(p.hand)) p.hand = p.hand.map(() => 'HIDDEN');
        if (Array.isArray(p.bank)) {
          p.bank = p.bank.map((item) => (item.faceDown ? { ...item, tileId: 'HIDDEN' } : item));
        }
      }
    });
  }

  if (nextG.draftPacks) {
    Object.keys(nextG.draftPacks).forEach((id) => {
      if (id !== pId && Array.isArray(nextG.draftPacks[id])) {
        nextG.draftPacks[id] = nextG.draftPacks[id].map(() => 'HIDDEN');
      }
    });
  }

  if (nextG.pendingPlay && (nextG.pendingPlay.step === 'receipt' || nextG.pendingPlay.step === 'challenge')) {
    const pp = nextG.pendingPlay;
    const isMover = String(pp.moverId) === pId;
    const isInspectingReceiver =
      pp.step === 'receipt' &&
      String(pp.receiverId) === pId &&
      (G.players?.[pId]?.credibilityNotchesLost || 0) < 3;
    if (!isMover && !isInspectingReceiver) {
      pp.tileIdPlayed = 'HIDDEN';
      pp.playType = 'HIDDEN';
    }
  }

  return nextG;
}

/**
 * Factory: creates a KredGame config bound to numPlayers.
 * boardgame.io 0.50 local Client does NOT support setupData,
 * so we inject numPlayers via a closure at Client-creation time.
 */
export function createKredGame(numPlayers, skipDraft = false, options = {}) {
  const { hideOpponentHands = false } = options;
  return {
    name: 'kred',
    minPlayers: 3,
    maxPlayers: 5,

    setup: ({ ctx, random }, setupData) => {
      // Use the factory-injected numPlayers (ctx.numPlayers defaults to 2 in local mode)
      const np = numPlayers || ctx.numPlayers || 3;
      const effectiveSkipDraft = Boolean(skipDraft || setupData?.skipDraft || setupData?.mode === 'quick');
      console.log('[KredGame Setup] numPlayers:', np, 'skipDraft:', effectiveSkipDraft, 'ctx.numPlayers:', ctx.numPlayers);

      const config = INITIAL_PIECE_COUNTS[np] || INITIAL_PIECE_COUNTS[3];

      // Initial Board State
      const boardState = {};
      for (let p = 0; p < np; p++) {
        const domainKey = `p${p + 1}`;
        boardState[`${domainKey}_office`] = null;
        boardState[`${domainKey}_rostrum1`] = null;
        boardState[`${domainKey}_rostrum2`] = null;

        // Seats 1, 3, 5 get Marks; 2, 4, 6 start vacant
        for (let s = 1; s <= 6; s++) {
          if (s % 2 !== 0) {
            boardState[`${domainKey}_seat${s}`] = { id: `init_m_${domainKey}_s${s}`, type: PIECE_TYPES.MARK };
          } else {
            boardState[`${domainKey}_seat${s}`] = null;
          }
        }
      }

      // Community Pool initial count & boardState placement
      const commMarksCount = config.MARKS - (np * 3);
      const commHeelsCount = config.HEELS;
      const commPawnsCount = config.PAWNS;
      const totalCommSpots = commMarksCount + commHeelsCount + commPawnsCount + 5; // +5 extra spots

      let cIdx = 1;
      for (let i = 0; i < commMarksCount; i++) {
        boardState[`community_${cIdx}`] = { id: `comm_mark_${cIdx}`, type: PIECE_TYPES.MARK };
        cIdx++;
      }
      for (let i = 0; i < commHeelsCount; i++) {
        boardState[`community_${cIdx}`] = { id: `comm_heel_${cIdx}`, type: PIECE_TYPES.HEEL };
        cIdx++;
      }
      for (let i = 0; i < commPawnsCount; i++) {
        boardState[`community_${cIdx}`] = { id: `comm_pawn_${cIdx}`, type: PIECE_TYPES.PAWN };
        cIdx++;
      }
      for (; cIdx <= totalCommSpots; cIdx++) {
        boardState[`community_${cIdx}`] = null;
      }

      const community = {
        marks: commMarksCount,
        heels: commHeelsCount,
        pawns: commPawnsCount
      };

      // Prepare Tile Deck
      const tileIds = Object.keys(TILES).filter(id => id !== 'BLANK' || config.HAS_BLANK);
      const shuffledDeck = random.Shuffle(tileIds);

      // Deal tiles into draft packs or directly to hands if skipDraft is true
      const draftPacks = {};
      const players = {};
      for (let p = 0; p < np; p++) {
        const pId = String(p);
        const dealtTiles = shuffledDeck.slice(p * config.TILES_PER_PLAYER, (p + 1) * config.TILES_PER_PLAYER);

        if (effectiveSkipDraft) {
          draftPacks[pId] = [];
          players[pId] = {
            credibilityNotchesLost: 0,
            hand: dealtTiles,
            bank: [],
            draftSelections: dealtTiles,
            funding: 0,
            pendingPenaltyWithdraw: false
          };
        } else {
          draftPacks[pId] = dealtTiles;
          players[pId] = {
            credibilityNotchesLost: 0,
            hand: [],
            bank: [],
            draftSelections: [],
            funding: 0,
            pendingPenaltyWithdraw: false
          };
        }
      }

      const matchStats = {};
      for (let p = 0; p < np; p++) {
        matchStats[String(p)] = createEmptyPlayerStats();
      }

      return {
        numPlayers: np,
        boardState,
        community,
        players,
        draftPacks,
        draftSelectionsThisRound: {},
        draftSkippedPlayers: {},
        pendingPlay: null,
        pendingSupport: null,
        nextMoverId: null,
        winner: null,
        history: effectiveSkipDraft ? [] : [{ id: 1, text: 'DRAFT', tone: 'phase' }],
        matchStats
      };
    },

    playerView: ({ G, playerID }) => {
      return hideOpponentHands ? filterSoloPlayerView(G, playerID) : G;
    },

    endIf: ({ G }) => {
      if (G && G.winner) {
        return { winner: G.winner };
      }
      return undefined;
    },

    phases: {
      draft: createDraftPhase(),
      campaign: createCampaignPhase(),
      bureaucracy: createBureaucracyPhase()
    }
  };
}

// Default export for backward compat (3-player)
export const KredGame = createKredGame(3);
