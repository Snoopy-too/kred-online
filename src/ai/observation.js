import { TILES } from '../domain/types.js';
import { getPendingPlayActivePlayer } from '../domain/board.js';

export const STANDARD_TILE_IDS = Object.freeze(
  Object.keys(TILES).filter((id) => id !== '___').sort()
);

/**
 * Creates a per-bot tile memory container (strictly derived from legal observations).
 */
export function createBotMemory() {
  return {
    lastPhase: null,
    knownBanked: {}, // { [tileId]: ownerId } remembered as banked this campaign
    knownHands: {},  // { [tileId]: ownerId } carried over from previous campaign's banks
    seenEvents: new Set()
  };
}

/**
 * Updates per-bot memory from legally visible state (own passed tiles, publicly
 * revealed honest/challenged tiles, and face-up bank tiles). Recall probability
 * is governed by persona.memoryRecall (0..1) and rolled once per distinct event.
 */
export function updateBotMemory(memory, G, ctx, botId, persona = null, rng = Math.random) {
  if (!memory || !G) return memory;
  const pId = String(botId);
  const phase = ctx?.phase || null;
  const recall = persona?.memoryRecall ?? 0.8;

  const remember = (eventKey, targetMap, tileId, ownerId) => {
    if (!tileId || tileId === 'HIDDEN' || tileId === '___') return;
    if (ownerId === undefined || ownerId === null) return;
    if (memory.seenEvents.has(eventKey)) return;
    memory.seenEvents.add(eventKey);
    if (recall > 0 && (recall >= 1 || rng() <= recall)) {
      targetMap[tileId] = String(ownerId);
    }
  };

  if (phase === 'draft' && memory.lastPhase !== 'draft') {
    memory.knownBanked = {};
    memory.knownHands = {};
    memory.seenEvents.clear();
  } else if (memory.lastPhase === 'bureaucracy' && phase === 'campaign') {
    const nextHands = {};
    for (const [tileId, ownerId] of Object.entries(memory.knownBanked)) {
      if (ownerId !== pId && recall > 0 && (recall >= 1 || rng() <= recall)) {
        nextHands[tileId] = ownerId;
      }
    }
    memory.knownHands = nextHands;
    memory.knownBanked = {};
    memory.seenEvents.clear();
  }
  memory.lastPhase = phase;

  const pp = G.pendingPlay;
  if (pp && String(pp.moverId) === pId && pp.tileIdPlayed && pp.tileIdPlayed !== 'HIDDEN') {
    const recId = String(pp.receiverId);
    if (recId !== pId) {
      const bankLen = G.players?.[recId]?.bank?.length ?? 0;
      remember(`pass:${pp.tileIdPlayed}:${recId}:${bankLen}`, memory.knownBanked, pp.tileIdPlayed, recId);
      delete memory.knownHands[pp.tileIdPlayed];
    }
  }

  const notice = G.lastOutcomeNotice;
  if (
    notice &&
    (notice.type === 'challengeFailed' || notice.type === 'challengeSuccess') &&
    notice.tileIdPlayed &&
    notice.tileIdPlayed !== 'HIDDEN'
  ) {
    const recId = String(notice.receiverId);
    if (recId !== pId) {
      const bankLen = G.players?.[recId]?.bank?.length ?? 0;
      remember(
        `reveal:${notice.type}:${notice.tileIdPlayed}:${notice.moverId}:${recId}:${bankLen}`,
        memory.knownBanked,
        notice.tileIdPlayed,
        recId
      );
      delete memory.knownHands[notice.tileIdPlayed];
    }
  }

  Object.keys(G.players || {}).forEach((id) => {
    const p = G.players[id] || {};
    const bank = Array.isArray(p.bank) ? p.bank : [];
    if (id === pId) {
      for (const tid of p.hand || []) {
        delete memory.knownHands[tid];
        delete memory.knownBanked[tid];
      }
      for (const item of bank) {
        if (item?.tileId) {
          delete memory.knownHands[item.tileId];
          delete memory.knownBanked[item.tileId];
        }
      }
      return;
    }

    for (const item of bank) {
      if (!item.faceDown && item.tileId && item.tileId !== 'HIDDEN') {
        remember(`faceup:${item.tileId}:${id}`, memory.knownBanked, item.tileId, id);
        delete memory.knownHands[item.tileId];
      }
    }

    if (Array.isArray(p.hand) && p.hand.length === 0) {
      for (const [tid, owner] of Object.entries(memory.knownHands)) {
        if (owner === id) delete memory.knownHands[tid];
      }
    }
  });

  return memory;
}

/**
 * Computes tile IDs from the 24 standard tiles ('-1+'..'+9-') not visible
 * in botId's own hand, botId's own bank, any player's face-up bank tiles,
 * or remembered face-down banked tiles from the current campaign.
 */
export function computeUnseenTileIds(
  ownHand = [],
  ownBank = [],
  allFaceUpBankTiles = [],
  knownBankedTileIds = []
) {
  const seen = new Set();
  for (const id of ownHand) {
    if (id && id !== 'HIDDEN') seen.add(id);
  }
  for (const item of ownBank) {
    if (item?.tileId && item.tileId !== 'HIDDEN') seen.add(item.tileId);
  }
  for (const id of allFaceUpBankTiles) {
    if (id && id !== 'HIDDEN') seen.add(id);
  }
  for (const id of knownBankedTileIds) {
    if (id && id !== 'HIDDEN') seen.add(id);
  }
  return STANDARD_TILE_IDS.filter((id) => !seen.has(id));
}

function sanitizePendingPlay(pp, G, pId, me) {
  if (!pp) return null;
  const moverId = String(pp.moverId);
  const receiverId = String(pp.receiverId);
  const isMover = pId === moverId;
  const isInspectingReceiver =
    pp.step === 'receipt' &&
    pId === receiverId &&
    (me?.credibilityNotchesLost || 0) < 3;
  const isFaceUpInReceiverBank = (G.players?.[receiverId]?.bank || []).some(
    (b) => !b.faceDown && b.tileId === pp.tileIdPlayed
  );
  const canSeeTile =
    isMover || isInspectingReceiver || pp.step === 'reexecute' || isFaceUpInReceiverBank;

  const visibleTileId =
    canSeeTile && pp.tileIdPlayed && pp.tileIdPlayed !== 'HIDDEN'
      ? pp.tileIdPlayed
      : null;

  return {
    step: pp.step,
    moverId,
    receiverId,
    movesMade: (pp.movesMade || []).map((m) => ({ ...m })),
    challengesPassed: (pp.challengesPassed || []).map(String),
    successfulChallengerId:
      pp.successfulChallengerId !== undefined && pp.successfulChallengerId !== null
        ? String(pp.successfulChallengerId)
        : null,
    whistleblownByReceiver: Boolean(pp.whistleblownByReceiver),
    reexecuteTileId: pp.reexecuteTileId || null,
    activePlayer: getPendingPlayActivePlayer(G),
    tileIdPlayed: visibleTileId,
    playType: visibleTileId && pp.playType && pp.playType !== 'HIDDEN' ? pp.playType : null,
    backupBoard: pp.backupBoard ? JSON.parse(JSON.stringify(pp.backupBoard)) : null,
    backupCommunity: pp.backupCommunity ? { ...pp.backupCommunity } : null
  };
}

/**
 * Builds a strict information-hiding observation snapshot for botId.
 * Never exposes opponents' hands, draftPacks, face-down bank tile IDs,
 * or uninspected pending tile IDs.
 */
export function buildBotObservation(G, ctx, botId, memory = null) {
  const pId = String(botId);
  const players = {};
  const allFaceUpTiles = [];

  Object.keys(G?.players || {}).forEach((id) => {
    const p = G.players[id] || {};
    const notchesLost = p.credibilityNotchesLost || 0;
    const bank = Array.isArray(p.bank) ? p.bank : [];
    const faceUpBankTiles = bank
      .filter((item) => !item.faceDown && item.tileId && item.tileId !== 'HIDDEN')
      .map((item) => item.tileId);

    allFaceUpTiles.push(...faceUpBankTiles);

    players[id] = {
      id,
      credibilityNotchesLost: notchesLost,
      credibilityRemaining: Math.max(0, 3 - notchesLost),
      handCount: Array.isArray(p.hand) ? p.hand.length : 0,
      bankCount: bank.length,
      funding: p.funding || 0,
      faceUpBankTiles,
      pendingPenaltyWithdraw: Boolean(p.pendingPenaltyWithdraw)
    };
  });

  const me = G?.players?.[pId] || {};
  const ownHand = Array.isArray(me.hand) ? [...me.hand] : [];
  const ownBank = Array.isArray(me.bank)
    ? me.bank.map((item) => ({ tileId: item.tileId, faceDown: Boolean(item.faceDown) }))
    : [];
  const facedownBankTiles = ownBank
    .filter((item) => item.faceDown)
    .map((item) => ({ tileId: item.tileId, faceDown: true }));
  const draftPack = Array.isArray(G?.draftPacks?.[pId]) ? [...G.draftPacks[pId]] : [];

  return {
    botId: pId,
    phase: ctx?.phase || null,
    currentPlayer:
      ctx?.currentPlayer !== undefined && ctx?.currentPlayer !== null
        ? String(ctx.currentPlayer)
        : null,
    turn: ctx?.turn ?? 0,
    numPlayers: G?.numPlayers || 3,
    boardState: G?.boardState ? JSON.parse(JSON.stringify(G.boardState)) : {},
    community: G?.community ? { ...G.community } : { marks: 0, heels: 0, pawns: 0 },
    winner: G?.winner || null,
    players,
    hand: ownHand,
    draftPack,
    hasDraftedThisRound: Boolean(G?.draftSelectionsThisRound?.[pId]),
    bank: ownBank,
    facedownBankTiles,
    unseenTileIds: computeUnseenTileIds(
      ownHand,
      ownBank,
      allFaceUpTiles,
      memory?.knownBanked ? Object.keys(memory.knownBanked) : []
    ),
    memory: memory
      ? { knownBanked: { ...memory.knownBanked }, knownHands: { ...memory.knownHands } }
      : { knownBanked: {}, knownHands: {} },
    pendingPlay: sanitizePendingPlay(G?.pendingPlay, G, pId, me),
    pendingSupport: G?.pendingSupport
      ? { ...G.pendingSupport, validDestinations: [...(G.pendingSupport.validDestinations || [])] }
      : null
  };
}
