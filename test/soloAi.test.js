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
  decideCampaignMove,
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

  it('bot strategy heuristics avoid Mark in Office, avoid unjustified honest Remove, favor fewer-tile receivers, tune receipt/challenge by funding & credibility, and prioritize early Pawn in Bureaucracy', () => {
    const base = createKredGame(3, true);
    const G = base.setup({ ctx: { numPlayers: 3 }, random: { Shuffle: (a) => a } });

    // 1) Mover avoids putting a Mark into the Office when another Advance exists
    const officeMarkBoard = structuredClone(G.boardState);
    officeMarkBoard.p1_rostrum1 = { id: 'm_r1', type: 'Mark' };
    officeMarkBoard.p1_rostrum2 = { id: 'm_r2', type: 'Mark' };
    officeMarkBoard.p1_office = null;
    const obsMarkOffice = {
      botId: '0',
      phase: 'campaign',
      currentPlayer: '0',
      numPlayers: 3,
      boardState: officeMarkBoard,
      community: G.community,
      hand: ['05'],
      unseenTileIds: STANDARD_TILE_IDS.filter((id) => id !== '05'),
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 1, bankCount: 2, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 2, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 2, funding: 0 }
      }
    };
    const markOfficeChoice = decideCampaignMove(obsMarkOffice, getBotPersona('0'), () => 0.5);
    assert.ok(
      !markOfficeChoice.args[0].moves.some((m) => m.to === 'p1_office'),
      `Mover should not advance a Mark into Office, got ${JSON.stringify(markOfficeChoice.args[0].moves)}`
    );

    // 2) Mover prefers giving tile to receiver with fewer banked tiles
    const obsBankSpread = {
      ...obsMarkOffice,
      boardState: G.boardState,
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 4, bankCount: 2, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 3, bankCount: 4, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 6, bankCount: 1, funding: 0 }
      }
    };
    const spreadChoice = decideCampaignMove(obsBankSpread, getBotPersona('0'), () => 0.5);
    assert.equal(spreadChoice.args[0].receiverId, '2');

    // 3) Mover avoids honest Remove without a good reason, but plays it when it triggers a support cascade
    const obsWeakRemove = {
      ...obsBankSpread,
      hand: ['15', '05'],
      unseenTileIds: STANDARD_TILE_IDS.filter((id) => id !== '15' && id !== '05')
    };
    const weakRemoveChoice = decideCampaignMove(obsWeakRemove, getBotPersona('2'), () => 0.5);
    assert.equal(weakRemoveChoice.args[0].tileId, '05');

    const cascadeBoard = structuredClone(G.boardState);
    cascadeBoard.p2_seat1 = { id: 'm_only', type: 'Mark' };
    cascadeBoard.p2_seat2 = null;
    cascadeBoard.p2_seat3 = null;
    cascadeBoard.p2_seat4 = { id: 'm_s4', type: 'Mark' };
    cascadeBoard.p2_seat5 = { id: 'm_s5', type: 'Mark' };
    cascadeBoard.p2_seat6 = { id: 'm_s6', type: 'Mark' };
    cascadeBoard.p2_rostrum1 = { id: 'h_sup1', type: 'Heel' };
    cascadeBoard.p2_rostrum2 = { id: 'h_sup2', type: 'Heel' };
    cascadeBoard.p2_office = { id: 'pw_sup', type: 'Pawn' };
    const obsCascadeRemove = {
      ...obsWeakRemove,
      boardState: cascadeBoard
    };
    const cascadeChoice = decideCampaignMove(obsCascadeRemove, getBotPersona('2'), () => 0.5);
    assert.ok(
      cascadeChoice.args[0].moves.some((m) => m.type === 'Remove' && m.from === 'p2_seat1'),
      `Expected Remove on sole supporting Mark p2_seat1, got ${JSON.stringify(cascadeChoice.args[0])}`
    );

    // 4) Receiver: low funding -> more likely to accept dishonest move, unless 0 or 2 notches lost
    const beforeBoard = structuredClone(G.boardState);
    const afterBoard = structuredClone(G.boardState);
    afterBoard.p1_seat2 = { id: 'm_adv', type: 'Mark' }; // mover gained +5
    const makeReceiptObs = (notchesLost, facedownBankTiles) => ({
      botId: '1',
      phase: 'campaign',
      currentPlayer: '1',
      numPlayers: 3,
      boardState: afterBoard,
      community: G.community,
      facedownBankTiles,
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 5, bankCount: 2, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: notchesLost, credibilityRemaining: 3 - notchesLost, handCount: 5, bankCount: facedownBankTiles.length, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 5, bankCount: 2, funding: 0 }
      },
      unseenTileIds: STANDARD_TILE_IDS.filter((id) => id !== '08'),
      pendingPlay: {
        step: 'receipt',
        moverId: '0',
        receiverId: '1',
        tileIdPlayed: '08', // Assist+Advance (funding 5) played dishonestly as single Advance
        movesMade: [{ type: 'Advance', from: 'community_1', to: 'p1_seat2' }],
        backupBoard: beforeBoard,
        backupCommunity: G.community
      }
    });
    const zeroPersona = getBotPersona('0');
    assert.equal(decideReceipt(makeReceiptObs(1, []), zeroPersona, () => 0.5).move, 'acceptTile');
    assert.equal(
      decideReceipt(makeReceiptObs(1, [{ tileId: '24', faceDown: true }, { tileId: '23', faceDown: true }]), zeroPersona, () => 0.5).move,
      'rejectTile'
    );
    assert.equal(decideReceipt(makeReceiptObs(2, []), zeroPersona, () => 0.5).move, 'rejectTile');
    assert.equal(decideReceipt(makeReceiptObs(0, [{ tileId: '20', faceDown: true }]), zeroPersona, () => 0.5).move, 'rejectTile');

    // 5) Challenger with plenty of funding or credibility is more likely to challenge
    const makeChallObs = (notchesLost, facedownBankTiles) => ({
      botId: '2',
      phase: 'campaign',
      currentPlayer: '2',
      numPlayers: 3,
      boardState: afterBoard,
      community: G.community,
      facedownBankTiles,
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 5, bankCount: 2, funding: 0 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, handCount: 5, bankCount: 2, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: notchesLost, credibilityRemaining: 3 - notchesLost, handCount: 5, bankCount: facedownBankTiles.length, funding: 0 }
      },
      unseenTileIds: STANDARD_TILE_IDS,
      pendingPlay: {
        step: 'challenge',
        moverId: '0',
        receiverId: '1',
        movesMade: [{ type: 'Advance', from: 'community_1', to: 'p1_seat2' }],
        backupBoard: beforeBoard,
        backupCommunity: G.community
      }
    });
    assert.equal(decideChallenge(makeChallObs(1, []), zeroPersona, () => 0.5).move, 'passChallenge');
    assert.equal(
      decideChallenge(makeChallObs(0, [{ tileId: '24', faceDown: true }, { tileId: '23', faceDown: true }]), zeroPersona, () => 0.5).move,
      'challengeTile'
    );

    // 6) Bureaucracy prioritizes getting a Pawn sooner (even on a Seat when Office is empty)
    const burBoard = structuredClone(G.boardState);
    burBoard.p1_seat1 = { id: 'h_s1', type: 'Heel' };
    burBoard.p1_seat2 = { id: 'm_s2', type: 'Mark' };
    burBoard.p1_office = null;
    const obsEarlyPawn = {
      botId: '0',
      phase: 'bureaucracy',
      currentPlayer: '0',
      numPlayers: 3,
      boardState: burBoard,
      community: { marks: 3, heels: 8, pawns: 3 },
      players: {
        '0': { id: '0', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 6 },
        '1': { id: '1', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 0 },
        '2': { id: '2', credibilityNotchesLost: 0, credibilityRemaining: 3, funding: 0 }
      }
    };
    const earlyPawnAction = decideBureaucracyAction(obsEarlyPawn, zeroPersona, () => 0.5);
    assert.equal(earlyPawnAction.move, 'buyBureaucracyAction');
    assert.equal(earlyPawnAction.args[0].actionType, 'PROMOTE_SEAT');
    assert.equal(earlyPawnAction.args[0].targetLoc, 'p1_seat1');
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
