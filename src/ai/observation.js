import { TILES } from '../domain/types.js';
import { getPendingPlayActivePlayer } from '../domain/board.js';

export const STANDARD_TILE_IDS = Object.freeze(
  Object.keys(TILES).filter((id) => id !== 'BLANK').sort()
);

/**
 * Computes tile IDs from the 24 standard tiles ('01'..'24') not visible
 * in botId's own hand, botId's own bank, or any player's face-up bank tiles.
 */
export function computeUnseenTileIds(ownHand = [], ownBank = [], allFaceUpBankTiles = []) {
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
export function buildBotObservation(G, ctx, botId) {
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
    unseenTileIds: computeUnseenTileIds(ownHand, ownBank, allFaceUpTiles),
    pendingPlay: sanitizePendingPlay(G?.pendingPlay, G, pId, me)
  };
}
