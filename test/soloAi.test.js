import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { createKredGame } from '../src/srcGame.js';
import { TILES } from '../src/domain/types.js';
import {
  STANDARD_TILE_IDS,
  buildBotObservation,
  getBotPersona,
  evaluateDomain,
  evaluateBoardForBot,
  generateLegalMovesForBot,
  getTilesMatchingMoves,
  decideChallenge,
  decideReceipt,
  decideReexecute,
  decideBureaucracyAction
} from '../src/ai/index.js';
import { classifyPlay, validateMoveCombination } from '../src/domain/moves.js';

function makeSeededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runWorkersInPool(batches, sharedOpts) {
  const workers = [];
  const promises = batches.map((matchIndices) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./soloAiWorker.js', import.meta.url), {
        workerData: { matchIndices, ...sharedOpts }
      });
      workers.push(worker);
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`soloAiWorker exited with code ${code}`));
      });
    })
  );
  return Promise.all(promises).catch((err) => {
    workers.forEach((w) => w.terminate().catch(() => {}));
    throw err;
  });
}

describe('Solo AI info hiding, card counting, and heuristics', () => {
  it('buildBotObservation strictly hides opponent hands, draftPacks, face-down banks, and uninspected pending tiles', () => {
    const mockG = {
      numPlayers: 3,
      boardState: { p1_seat1: { id: 'm1', type: 'Mark' } },
      community: { marks: 3, heels: 9, pawns: 3 },
      players: {
        '0': {
          credibilityNotchesLost: 1,
          hand: ['01', '02'],
          bank: [{ tileId: '04', faceDown: true }],
          funding: 1,
          pendingPenaltyWithdraw: false
        },
        '1': {
          credibilityNotchesLost: 0,
          hand: ['05', '06'],
          bank: [{ tileId: '07', faceDown: true }, { tileId: '08', faceDown: false }],
          funding: 5,
          pendingPenaltyWithdraw: false
        },
        '2': {
          credibilityNotchesLost: 3,
          hand: ['09'],
          bank: [{ tileId: '10', faceDown: true }],
          funding: 7,
          pendingPenaltyWithdraw: true
        }
      },
      draftPacks: { '0': ['11'], '1': ['12', '13'], '2': ['14'] },
      draftSelectionsThisRound: { '0': false, '1': true, '2': false },
      pendingPlay: {
        moverId: '0',
        receiverId: '1',
        tileIdPlayed: '24',
        playType: 'Dishonest',
        movesMade: [],
        challengesPassed: [],
        step: 'receipt'
      },
      winner: null
    };
    const mockCtx = { phase: 'campaign', currentPlayer: '1', turn: 4 };

    const obs2 = buildBotObservation(mockG, mockCtx, '2');
    const hiddenViewCheck = JSON.stringify({ ...obs2, unseenTileIds: undefined });
    for (const secret of ['01', '02', '04', '05', '06', '07', '11', '12', '13', '24', 'Dishonest']) {
      assert.ok(!hiddenViewCheck.includes(`"${secret}"`), `Bot 2 observation leaked secret ${secret}`);
    }
    assert.deepEqual(obs2.hand, ['09']);
    assert.deepEqual(obs2.draftPack, ['14']);
    assert.equal(obs2.pendingPlay.tileIdPlayed, null);
    assert.equal(obs2.pendingPlay.playType, null);
    assert.equal(obs2.players['1'].handCount, 2);
    assert.equal(obs2.players['1'].bankCount, 2);
    assert.deepEqual(obs2.players['1'].faceUpBankTiles, ['08']);
    assert.equal(obs2.players['0'].credibilityRemaining, 2);

    assert.equal(obs2.unseenTileIds.length, 21);
    assert.ok(!obs2.unseenTileIds.includes('08'));
    assert.ok(!obs2.unseenTileIds.includes('09'));
    assert.ok(!obs2.unseenTileIds.includes('10'));
    assert.ok(obs2.unseenTileIds.includes('05'));
    assert.ok(obs2.unseenTileIds.includes('07'));

    const obs1 = buildBotObservation(mockG, mockCtx, '1');
    assert.equal(obs1.pendingPlay.tileIdPlayed, '24');

    const zeroCredG = structuredClone(mockG);
    zeroCredG.pendingPlay.receiverId = '2';
    const obs2ZeroCred = buildBotObservation(zeroCredG, mockCtx, '2');
    assert.equal(obs2ZeroCred.pendingPlay.tileIdPlayed, null);

    const challengeG = structuredClone(mockG);
    challengeG.pendingPlay.step = 'challenge';
    const obs2Challenge = buildBotObservation(challengeG, { ...mockCtx, currentPlayer: '2' }, '2');
    assert.equal(obs2Challenge.pendingPlay.tileIdPlayed, null);

    const reexecG = structuredClone(mockG);
    reexecG.pendingPlay.step = 'reexecute';
    const obs2Reexec = buildBotObservation(reexecG, mockCtx, '2');
    assert.equal(obs2Reexec.pendingPlay.tileIdPlayed, '24');
  });

  it('evaluateDomain, card-counting challenge guarantee, honest receipt guard, and own-domain bureaucracy guard hold', () => {
    const base = createKredGame(3, true);
    const G = base.setup({ ctx: { numPlayers: 3 }, random: { Shuffle: (a) => a } });

    assert.equal(evaluateDomain(G.boardState, '0'), 15);
    assert.equal(evaluateBoardForBot(G.boardState, '0', 3, 1.0), 0);

    const winBoard = structuredClone(G.boardState);
    for (let s = 1; s <= 6; s++) winBoard[`p1_seat${s}`] = { id: `m${s}`, type: 'Mark' };
    winBoard.p1_rostrum1 = { id: 'h1', type: 'Heel' };
    winBoard.p1_rostrum2 = { id: 'h2', type: 'Heel' };
    winBoard.p1_office = { id: 'pw1', type: 'Pawn' };
    assert.equal(evaluateDomain(winBoard, '0'), 600);

    const withdrawTiles = STANDARD_TILE_IDS.filter((id) => TILES[id].moves.includes('Withdraw'));
    const obsChallenge = {
      botId: '2',
      phase: 'campaign',
      currentPlayer: '2',
      numPlayers: 3,
      boardState: G.boardState,
      community: G.community,
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 7, bankCount: 0, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 8, bankCount: 0, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 2, credibilityRemaining: 1, handCount: 8, bankCount: 0, funding: 0 }
      },
      unseenTileIds: STANDARD_TILE_IDS.filter((id) => !withdrawTiles.includes(id)),
      pendingPlay: {
        step: 'challenge',
        moverId: '0',
        receiverId: '1',
        movesMade: [{ type: 'Withdraw', from: 'p1_seat1', to: 'community' }],
        backupBoard: G.boardState,
        backupCommunity: G.community
      }
    };
    const chDecision = decideChallenge(obsChallenge, getBotPersona('1'), makeSeededRng(1));
    assert.equal(chDecision.move, 'challengeTile');

    const obsReceipt = {
      botId: '1',
      phase: 'campaign',
      currentPlayer: '1',
      numPlayers: 3,
      boardState: G.boardState,
      community: G.community,
      players: obsChallenge.players,
      unseenTileIds: STANDARD_TILE_IDS,
      pendingPlay: {
        step: 'receipt',
        moverId: '0',
        receiverId: '1',
        tileIdPlayed: '05',
        movesMade: [{ type: 'Advance', from: 'community_1', to: 'p1_seat2' }],
        backupBoard: G.boardState,
        backupCommunity: G.community
      }
    };
    assert.equal(decideReceipt(obsReceipt, getBotPersona('2'), makeSeededRng(2)).move, 'acceptTile');

    const obsBur = {
      botId: '1',
      phase: 'bureaucracy',
      currentPlayer: '1',
      numPlayers: 3,
      boardState: G.boardState,
      community: G.community,
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 20 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 0 }
      }
    };
    const burAction = decideBureaucracyAction(obsBur, getBotPersona('1'), makeSeededRng(3));
    if (burAction.move === 'buyBureaucracyAction' && burAction.args[0].targetLoc) {
      assert.ok(burAction.args[0].targetLoc.startsWith('p2_'));
    }

    const legal = generateLegalMovesForBot(G.boardState, G.community, '0', 3);
    assert.ok(legal.length > 5);
    const matches = getTilesMatchingMoves(
      [{ type: 'Advance', from: 'community_1', to: 'p1_seat2' }],
      STANDARD_TILE_IDS,
      '0',
      G.boardState,
      G.community,
      3
    );
    assert.deepEqual(matches, ['05', '06']);

    // Post-movesMade board check: when Organize fills the sole remaining empty seat,
    // Assist+Organize tiles ('13', '14') classify as Honest because Assist is impossible afterwards
    const nearFullBoard = structuredClone(G.boardState);
    for (let p = 1; p <= 3; p++) {
      for (let s = 1; s <= 6; s++) {
        if (!(p === 3 && s === 6)) nearFullBoard[`p${p}_seat${s}`] = { id: `m_${p}_${s}`, type: 'Mark' };
      }
    }
    const postMatches = getTilesMatchingMoves(
      [{ type: 'Organize', from: 'p1_seat1', to: 'p3_seat6' }],
      ['12', '13', '14'],
      '0',
      nearFullBoard,
      G.community,
      3
    );
    assert.deepEqual(postMatches, ['12', '13', '14']);

    // Empty-community Remove+Advance reexecute check:
    // 1) With 0 Marks in Community, removing the sole opp Mark cannot legally Advance that same piece in the same turn -> [Remove] is Honest
    const emptyCommBoard = {};
    for (let p = 1; p <= 3; p++) {
      emptyCommBoard[`p${p}_office`] = null;
      emptyCommBoard[`p${p}_rostrum1`] = null;
      emptyCommBoard[`p${p}_rostrum2`] = null;
      for (let s = 1; s <= 6; s++) emptyCommBoard[`p${p}_seat${s}`] = null;
    }
    for (let c = 1; c <= 12; c++) emptyCommBoard[`community_${c}`] = null;
    emptyCommBoard.p1_seat1 = { id: 'm_opp', type: 'Mark' };
    const emptyComm = { marks: 0, heels: 0, pawns: 3 };
    const reexecSingle = decideReexecute(
      {
        botId: '1',
        numPlayers: 3,
        boardState: emptyCommBoard,
        community: emptyComm,
        pendingPlay: { reexecuteTileId: '01' }
      },
      getBotPersona('1')
    );
    assert.equal(reexecSingle.move, 'reexecuteHonestly');
    assert.equal(reexecSingle.args[0].length, 1);
    assert.equal(validateMoveCombination(reexecSingle.args[0], '1', emptyCommBoard, emptyComm, 3).valid, true);
    assert.equal(classifyPlay(reexecSingle.args[0], '01', '1', emptyCommBoard, emptyComm, 3), 'Honest');

    // 2) With a second distinct Community Mark available, exhaustive search constructs [Remove, Advance]
    const twoPieceBoard = structuredClone(emptyCommBoard);
    twoPieceBoard.community_2 = { id: 'm_comm', type: 'Mark' };
    const twoPieceComm = { marks: 1, heels: 0, pawns: 3 };
    const reexecPair = decideReexecute(
      {
        botId: '1',
        numPlayers: 3,
        boardState: twoPieceBoard,
        community: twoPieceComm,
        pendingPlay: { reexecuteTileId: '01' }
      },
      getBotPersona('1')
    );
    assert.equal(reexecPair.move, 'reexecuteHonestly');
    assert.equal(reexecPair.args[0].length, 2);
    assert.equal(validateMoveCombination(reexecPair.args[0], '1', twoPieceBoard, twoPieceComm, 3).valid, true);
    assert.equal(classifyPlay(reexecPair.args[0], '01', '1', twoPieceBoard, twoPieceComm, 3), 'Honest');
  });

  it('completes 100 full 3-bot matches (60 drafted + 40 skipDraft) cleanly with zero invalid moves and strict tile conservation', async () => {
    const startMs = Date.now();
    const totalMatches = 100;
    const draftedMatches = 60;
    const maxActionsPerMatch = 1500;
    const workerCount = 4;

    const batches = Array.from({ length: workerCount }, () => []);
    for (let i = 0; i < totalMatches; i++) {
      batches[i % workerCount].push(i);
    }

    const results = await runWorkersInPool(batches, { draftedMatches, maxActionsPerMatch });

    let completed = 0;
    let totalActions = 0;
    let maxActions = 0;
    const winners = { '0': 0, '1': 0, '2': 0, draw: 0 };

    for (const r of results) {
      completed += r.completed;
      totalActions += r.totalActions;
      if (r.maxActions > maxActions) maxActions = r.maxActions;
      for (const k of Object.keys(winners)) winners[k] += r.winners[k] || 0;
    }

    const elapsedMs = Date.now() - startMs;
    console.info(
      `[Solo AI Stress] ${completed} matches (${totalActions} total actions, max=${maxActions}, winners=${JSON.stringify(winners)}) completed in ${elapsedMs}ms`
    );
    assert.equal(completed, totalMatches);
  });
});
