// test/jev-arena/gameSetup.js
// Deterministic campaign-ready G for the arena: mirrors createKredGame's
// setup() in src/srcGame.js with skipDraft=true (tiles dealt straight to
// hands), but with a seeded shuffle instead of boardgame.io's random.
// Draft is out of scope — the arena covers the onlineEngine executors.

import { TILES, INITIAL_PIECE_COUNTS, PIECE_TYPES } from '../../src/domain/types.js';
import { SeededRandom } from './seededRandom.js';

export const clone = (G) => JSON.parse(JSON.stringify(G));

export function makeInitialG(numPlayers, seed) {
  const config = INITIAL_PIECE_COUNTS[numPlayers] || INITIAL_PIECE_COUNTS[3];
  const rng = new SeededRandom(seed);

  const boardState = {};
  for (let p = 0; p < numPlayers; p++) {
    const domainKey = `p${p + 1}`;
    boardState[`${domainKey}_office`] = null;
    boardState[`${domainKey}_rostrum1`] = null;
    boardState[`${domainKey}_rostrum2`] = null;
    for (let s = 1; s <= 6; s++) {
      boardState[`${domainKey}_seat${s}`] = s % 2 !== 0
        ? { id: `init_m_${domainKey}_s${s}`, type: PIECE_TYPES.MARK }
        : null;
    }
  }

  const commMarksCount = config.MARKS - numPlayers * 3;
  const commHeelsCount = config.HEELS;
  const commPawnsCount = config.PAWNS;
  const totalCommSpots = commMarksCount + commHeelsCount + commPawnsCount + 5;
  let cIdx = 1;
  for (let i = 0; i < commMarksCount; i++, cIdx++) {
    boardState[`community_${cIdx}`] = { id: `comm_mark_${cIdx}`, type: PIECE_TYPES.MARK };
  }
  for (let i = 0; i < commHeelsCount; i++, cIdx++) {
    boardState[`community_${cIdx}`] = { id: `comm_heel_${cIdx}`, type: PIECE_TYPES.HEEL };
  }
  for (let i = 0; i < commPawnsCount; i++, cIdx++) {
    boardState[`community_${cIdx}`] = { id: `comm_pawn_${cIdx}`, type: PIECE_TYPES.PAWN };
  }
  for (; cIdx <= totalCommSpots; cIdx++) boardState[`community_${cIdx}`] = null;

  const community = { marks: commMarksCount, heels: commHeelsCount, pawns: commPawnsCount };

  const tileIds = Object.keys(TILES).filter((id) => id !== 'BLANK' || config.HAS_BLANK);
  const shuffledDeck = rng.shuffle([...tileIds]);

  const players = {};
  for (let p = 0; p < numPlayers; p++) {
    const pId = String(p);
    players[pId] = {
      credibilityNotchesLost: 0,
      hand: shuffledDeck.slice(p * config.TILES_PER_PLAYER, (p + 1) * config.TILES_PER_PLAYER),
      bank: [],
      draftSelections: [],
      funding: 0,
      pendingPenaltyWithdraw: false,
    };
  }

  // Campaign opener holds tile 03 (mirrors campaignPhase onBegin).
  let startP = '0';
  for (const pId of Object.keys(players)) {
    if (players[pId].hand.includes('03')) startP = pId;
  }

  return {
    numPlayers,
    boardState,
    community,
    players,
    draftPacks: {},
    draftSelectionsThisRound: {},
    pendingPlay: null,
    nextMoverId: startP,
    winner: null,
    history: [],
  };
}
