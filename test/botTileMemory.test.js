import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBotMemory,
  updateBotMemory,
  buildBotObservation,
  decideChallenge,
  getBotPersona
} from '../src/ai/index.js';
import { createKredGame } from '../src/srcGame.js';

function makeEmptyBoard() {
  return createKredGame(3, true).setup({
    ctx: { numPlayers: 3 },
    random: { Shuffle: (arr) => [...arr] }
  }).boardState;
}

function makeBaseG() {
  return {
    numPlayers: 3,
    boardState: makeEmptyBoard(),
    community: { marks: 6, heels: 9, pawns: 3 },
    players: {
      '0': { hand: ['01', '02'], bank: [], credibilityNotchesLost: 0, funding: 0 },
      '1': { hand: ['03', '04'], bank: [], credibilityNotchesLost: 0, funding: 0 },
      '2': { hand: ['05', '06'], bank: [], credibilityNotchesLost: 0, funding: 0 }
    },
    pendingPlay: null,
    lastOutcomeNotice: null
  };
}

describe('Bot tile memory', () => {
  it('remembers tiles the bot passed to opponents and excludes them from unseenTileIds', () => {
    const G = makeBaseG();
    const ctx = { phase: 'campaign', currentPlayer: '1', turn: 1 };
    const mem = createBotMemory();
    const sharpPersona = getBotPersona('2', { memoryRecall: 1.0 });

    // Bot 0 passes tile '24' (Advance + Withdraw) to Player 1
    G.pendingPlay = {
      step: 'receipt',
      moverId: '0',
      receiverId: '1',
      tileIdPlayed: '24',
      movesMade: [],
      challengesPassed: []
    };
    updateBotMemory(mem, G, ctx, '0', sharpPersona, () => 0.5);
    assert.equal(mem.knownBanked['24'], '1');

    // Once banked face-down in Player 1's bank, Bot 0 still excludes '24' from unseenTileIds
    G.pendingPlay = null;
    G.players['1'].bank.push({ tileId: 'HIDDEN', faceDown: true });
    const obs = buildBotObservation(G, ctx, '0', mem);
    assert.ok(!obs.unseenTileIds.includes('24'));
  });

  it('remembers tiles publicly revealed to be honest (challengeFailed) even when banked face-down', () => {
    const G = makeBaseG();
    const ctx = { phase: 'campaign', currentPlayer: '1', turn: 2 };
    const mem = createBotMemory();
    const sharpPersona = getBotPersona('2', { memoryRecall: 1.0 });

    G.players['1'].bank.push({ tileId: 'HIDDEN', faceDown: true });
    G.lastOutcomeNotice = {
      type: 'challengeFailed',
      challengerId: '2',
      moverId: '0',
      receiverId: '1',
      tileIdPlayed: '15'
    };

    updateBotMemory(mem, G, ctx, '2', sharpPersona, () => 0.5);
    assert.equal(mem.knownBanked['15'], '1');

    const obs = buildBotObservation(G, ctx, '2', mem);
    assert.ok(!obs.unseenTileIds.includes('15'));
  });

  it('carries remembered banked tiles into knownHands on bureaucracy -> campaign and filters by mover', () => {
    const G = makeBaseG();
    const mem = createBotMemory();
    const sharpPersona = getBotPersona('2', { memoryRecall: 1.0 });

    // Campaign 1: Tile '05' (unique: Withdraw + Influence? let's use '16' which is Withdraw + Organize)
    // Actually use '03' (unique: no moves / BLANK? No, '03' is Advance). Let's check: '15' is Assist + Influence.
    // Even simpler: put '01' in knownBanked for Player 1 during bureaucracy, then enter campaign 2.
    updateBotMemory(mem, G, { phase: 'bureaucracy', currentPlayer: '0', turn: 10 }, '2', sharpPersona, () => 0.5);
    mem.knownBanked['11'] = '1';

    // Transition to next campaign: banks become hands
    updateBotMemory(mem, G, { phase: 'campaign', currentPlayer: '0', turn: 11 }, '2', sharpPersona, () => 0.5);
    assert.equal(mem.knownHands['11'], '1');
    assert.deepEqual(mem.knownBanked, {});

    // If Player 0 claims a move whose only unseen matching tile is '11', Bot 2 knows Player 1 holds '11' -> guaranteed challenge!
    const beforeBoard = makeEmptyBoard();
    beforeBoard.p1_seat1 = { id: 'm1', type: 'Mark' };
    const afterBoard = structuredClone(beforeBoard);
    afterBoard.p1_seat1 = null;
    afterBoard.p1_rostrum1 = { id: 'm1', type: 'Mark' };

    // Pretend only tile '11' (or a matching tile) is left in unseenTileIds
    const obsMover0 = {
      botId: '2',
      phase: 'campaign',
      currentPlayer: '2',
      numPlayers: 3,
      boardState: afterBoard,
      community: G.community,
      facedownBankTiles: [],
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 0, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 0, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 0, funding: 0 }
      },
      unseenTileIds: ['05'], // '05' is pure Advance
      memory: { knownBanked: {}, knownHands: { '05': '1' } },
      pendingPlay: {
        step: 'challenge',
        moverId: '0',
        receiverId: '1',
        movesMade: [{ type: 'Advance', from: 'p1_seat1', to: 'p1_rostrum1' }],
        backupBoard: beforeBoard,
        backupCommunity: G.community
      }
    };
    assert.equal(decideChallenge(obsMover0, sharpPersona, () => 0.5).move, 'challengeTile');

    // Conversely, if Player 1 (who is remembered to hold '03') makes that Advance, it's NOT a 0-copy auto-challenge
    const obsMover1 = {
      ...obsMover0,
      pendingPlay: {
        ...obsMover0.pendingPlay,
        moverId: '1',
        receiverId: '0'
      },
      players: {
        ...obsMover0.players,
        '2': { id: '2', credibilityNotchesLost: 1, credibilityRemaining: 2, handCount: 4, bankCount: 0, funding: 0 }
      }
    };
    const beforeBoard1 = makeEmptyBoard();
    beforeBoard1.p2_seat1 = { id: 'm2', type: 'Mark' };
    const afterBoard1 = structuredClone(beforeBoard1);
    afterBoard1.p2_seat1 = null;
    afterBoard1.p2_rostrum1 = { id: 'm2', type: 'Mark' };
    obsMover1.boardState = afterBoard1;
    obsMover1.pendingPlay.backupBoard = beforeBoard1;
    obsMover1.pendingPlay.movesMade = [{ type: 'Advance', from: 'p2_seat1', to: 'p2_rostrum1' }];
    // With 1 notch lost and knowing mover 1 holds '03' (-20 bonus), bot passes instead of witch-hunting
    assert.equal(decideChallenge(obsMover1, getBotPersona('0'), () => 0.5).move, 'passChallenge');
  });

  it('respects varying memoryRecall levels across personas', () => {
    const G = makeBaseG();
    const ctx = { phase: 'campaign', currentPlayer: '1', turn: 1 };
    G.lastOutcomeNotice = {
      type: 'challengeFailed',
      challengerId: '2',
      moverId: '0',
      receiverId: '1',
      tileIdPlayed: '15'
    };

    const forgetfulMem = createBotMemory();
    updateBotMemory(forgetfulMem, G, ctx, '2', getBotPersona('1', { memoryRecall: 0 }), () => 0.1);
    assert.equal(forgetfulMem.knownBanked['15'], undefined);

    const midMem = createBotMemory();
    updateBotMemory(midMem, G, ctx, '2', getBotPersona('1', { memoryRecall: 0.45 }), () => 0.6);
    assert.equal(midMem.knownBanked['15'], undefined);

    const midMemHit = createBotMemory();
    updateBotMemory(midMemHit, G, ctx, '2', getBotPersona('1', { memoryRecall: 0.45 }), () => 0.3);
    assert.equal(midMemHit.knownBanked['15'], '1');
  });
});
