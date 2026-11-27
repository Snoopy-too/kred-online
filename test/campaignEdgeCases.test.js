import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame, filterSoloPlayerView } from '../src/game.js';
import { classifyPlay, validateSingleMove } from '../src/domain/moves.js';
import { inferMoveType } from '../src/domain/moveRulesUtils.js';
import { executeBureaucracyActionPayload, getPromotionTargetType, initBureaucracy } from '../src/domain/bureaucracy.js';
import { appendGameLog, expandHistoryPeek } from '../src/domain/gameLog.js';
import { enumerateAffordableBureaucracyOptions } from '../src/ai/bureaucracyDecisions.js';
import {
  logKgnPhase,
  logKgnCampaignPlay,
  logKgnOutcome,
  logKgnSubLine,
  logKgnReward,
  logKgnBureaucracyAction,
  logKgnBureaucracyEnd,
  logKgnResult,
  exportKgnDocument
} from '../src/domain/kgn.js';

function makeLocalClients(game, matchID) {
  const multiplayer = Local();
  const c0 = Client({ game, numPlayers: 3, matchID, playerID: '0', multiplayer });
  const c1 = Client({ game, numPlayers: 3, matchID, playerID: '1', multiplayer });
  const c2 = Client({ game, numPlayers: 3, matchID, playerID: '2', multiplayer });
  c0.start();
  c1.start();
  c2.start();
  return [c0, c1, c2];
}

describe('campaign edge cases & solo playerView hardening', () => {
  it('resolves 0-cred receiver play directly when no eligible challengers exist', () => {
    const base = createKredGame(3, true);
    const customGame = {
      ...base,
      setup: (arg) => {
        const G = base.setup(arg);
        G.players['0'].hand = ['^0+', '^1+'];
        G.players['1'].credibilityNotchesLost = 3;
        G.players['2'].credibilityNotchesLost = 3;
        G.nextMoverId = '0';
        return G;
      }
    };
    const clients = makeLocalClients(customGame, 'zero-cred-all');
    try {
      clients[0].moves.submitTurnMovesAndTile({
        tileId: '^0+',
        receiverId: '1',
        moves: []
      });
      const state = clients[0].getState();
      assert.equal(state.G.pendingPlay, null);
      assert.equal(state.G.players['1'].bank.length, 1);
      assert.equal(state.G.players['1'].bank[0].faceDown, true);
      assert.equal(state.ctx.currentPlayer, '1');
    } finally {
      clients.forEach(c => c.stop());
    }
  });

  it('allows no-op penaltyWithdraw only when mover has zero legal withdraws', () => {
    const base = createKredGame(3, true);
    const customGame = {
      ...base,
      setup: (arg) => {
        const G = base.setup(arg);
        Object.keys(G.boardState).forEach((k) => {
          if (k.startsWith('p1_')) G.boardState[k] = null;
        });
        G.players['0'].credibilityNotchesLost = 3;
        G.players['0'].pendingPenaltyWithdraw = true;
        G.nextMoverId = '0';
        G.pendingPlay = {
          moverId: '0',
          receiverId: '1',
          tileIdPlayed: '_2+',
          reexecuteTileId: '_2+',
          movesMade: [],
          playType: 'Dishonest',
          whistleblownByReceiver: false,
          successfulChallengerId: '2',
          step: 'penaltyWithdraw',
          challengesPassed: []
        };
        return G;
      }
    };
    const clients = makeLocalClients(customGame, 'noop-withdraw');
    try {
      assert.equal(clients[0].getState().ctx.currentPlayer, '0');
      clients[0].moves.executePenaltyWithdraw(null);
      const state = clients[0].getState();
      assert.equal(state.G.pendingPlay, null);
      assert.equal(state.G.players['0'].pendingPenaltyWithdraw, false);
    } finally {
      clients.forEach(c => c.stop());
    }
  });

  it('rejects null penaltyWithdraw when a legal withdraw exists', () => {
    const base = createKredGame(3, true);
    const customGame = {
      ...base,
      setup: (arg) => {
        const G = base.setup(arg);
        G.players['0'].credibilityNotchesLost = 3;
        G.players['0'].pendingPenaltyWithdraw = true;
        G.nextMoverId = '0';
        G.pendingPlay = {
          moverId: '0',
          receiverId: '1',
          tileIdPlayed: '_2+',
          reexecuteTileId: '_2+',
          movesMade: [],
          playType: 'Dishonest',
          whistleblownByReceiver: false,
          step: 'penaltyWithdraw',
          challengesPassed: []
        };
        return G;
      }
    };
    const clients = makeLocalClients(customGame, 'reject-noop-withdraw');
    try {
      clients[0].moves.executePenaltyWithdraw(null);
      const state = clients[0].getState();
      assert.equal(state.G.pendingPlay?.step, 'penaltyWithdraw');
      assert.equal(state.G.players['0'].pendingPenaltyWithdraw, true);
    } finally {
      clients.forEach(c => c.stop());
    }
  });

  it('ends game cleanly with ctx.gameover when victory is achieved in bureaucracy onEnd', () => {
    const base = createKredGame(3, true);
    const customGame = {
      ...base,
      setup: (arg) => {
        const G = base.setup(arg);
        G.players['0'].hand = [];
        G.players['1'].hand = [];
        G.players['2'].hand = [];
        G.players['0'].bank = [{ tileId: '+9-', faceDown: true }];
        for (let s = 1; s <= 6; s++) {
          G.boardState[`p1_seat${s}`] = { id: `m_${s}`, type: 'Mark' };
        }
        G.boardState.p1_rostrum1 = { id: 'h_1', type: 'Heel' };
        G.boardState.p1_rostrum2 = { id: 'h_2', type: 'Heel' };
        G.boardState.p1_office = { id: 'p_1', type: 'Pawn' };
        return G;
      }
    };
    const clients = makeLocalClients(customGame, 'bureaucracy-win');
    try {
      assert.equal(clients[0].getState().ctx.phase, 'bureaucracy');
      clients[0].moves.endBureaucracyTurn();
      clients[1].moves.endBureaucracyTurn();
      clients[2].moves.endBureaucracyTurn();
      const finalState = clients[0].getState();
      assert.equal(finalState.G.winner, '0');
      assert.deepEqual(finalState.ctx.gameover, { winner: '0' });
    } finally {
      clients.forEach(c => c.stop());
    }
  });

  it('filterSoloPlayerView hides opponent hands, packs, and face-down bank tiles without mutating G', () => {
    const raw = {
      players: {
        '0': { hand: ['-1+'], bank: [{ tileId: '-2+', faceDown: true }], credibilityNotchesLost: 0 },
        '1': { hand: ['^0+', '^1+'], bank: [{ tileId: '_2+', faceDown: true }, { tileId: '_3+', faceDown: false }], credibilityNotchesLost: 0 },
        '2': { hand: ['+4+'], bank: [], credibilityNotchesLost: 3 }
      },
      draftPacks: { '0': ['+5+'], '1': ['-1^', '-2^'], '2': ['^4_'] },
      pendingPlay: {
        moverId: '1',
        receiverId: '2',
        tileIdPlayed: '_5^',
        playType: 'Dishonest',
        step: 'receipt'
      }
    };
    const v0 = filterSoloPlayerView(raw, '0');
    assert.deepEqual(v0.players['0'].hand, ['-1+']);
    assert.deepEqual(v0.players['1'].hand, ['HIDDEN', 'HIDDEN']);
    assert.equal(v0.players['1'].bank[0].tileId, 'HIDDEN');
    assert.equal(v0.players['1'].bank[1].tileId, '_3+');
    assert.deepEqual(v0.draftPacks['1'], ['HIDDEN', 'HIDDEN']);
    assert.equal(v0.pendingPlay.tileIdPlayed, 'HIDDEN');
    assert.equal(v0.pendingPlay.playType, 'HIDDEN');

    // Original G unchanged
    assert.deepEqual(raw.players['1'].hand, ['^0+', '^1+']);
    assert.equal(raw.pendingPlay.tileIdPlayed, '_5^');

    // 0-cred receiver cannot inspect pending tile
    const v2 = filterSoloPlayerView(raw, '2');
    assert.equal(v2.pendingPlay.tileIdPlayed, 'HIDDEN');
  });

  it('classifyPlay treats 1-move subset as Honest when that move eliminates the sole target for the 2nd move', () => {
    const boardState = {};
    for (let p = 1; p <= 3; p++) {
      boardState[`p${p}_office`] = null;
      boardState[`p${p}_rostrum1`] = { id: `r1_${p}`, type: 'Mark' };
      boardState[`p${p}_rostrum2`] = { id: `r2_${p}`, type: 'Mark' };
      for (let s = 1; s <= 6; s++) {
        boardState[`p${p}_seat${s}`] = (p === 3 && s === 6)
          ? null
          : { id: `m_${p}_${s}`, type: 'Mark' };
      }
    }
    boardState.community_1 = { id: 'cm_1', type: 'Mark' };
    const community = { marks: 1, heels: 3, pawns: 3 };

    const assistOnly = [{ type: 'Assist', from: 'community_1', to: 'p3_seat6' }];
    assert.equal(classifyPlay(assistOnly, '+5^', '1', boardState, community, 3), 'Honest');
    assert.equal(classifyPlay([], '+5^', '1', boardState, community, 3), 'Dishonest');
    assert.equal(classifyPlay([{ type: 'Withdraw', from: 'p2_seat1', to: 'community' }], '+5^', '1', boardState, community, 3), 'Dishonest');
  });

  it('allows Advance to gain a Pawn from community only when no Marks or Heels remain (and respects Max 1 Pawn)', () => {
    const board = { p1_seat1: null, p1_office: null, community_1: { id: 'cp1', type: 'Pawn' }, community_2: { id: 'ch1', type: 'Heel' } };
    // Heel still in community -> Pawn blocked
    assert.equal(validateSingleMove({ type: 'Advance', from: 'community_1', to: 'p1_seat1' }, '0', board, { marks: 0, heels: 1, pawns: 1 }, 3).valid, false);
    // Remove Heel (no Marks or Heels left) -> Pawn allowed
    board.community_2 = null;
    assert.equal(validateSingleMove({ type: 'Advance', from: 'community_1', to: 'p1_seat1' }, '0', board, { marks: 0, heels: 0, pawns: 1 }, 3).valid, true);
    // Already owns a Pawn -> blocked by Max 1 Pawn rule
    board.p1_office = { id: 'existing_pawn', type: 'Pawn' };
    assert.equal(validateSingleMove({ type: 'Advance', from: 'community_1', to: 'p1_seat1' }, '0', board, { marks: 0, heels: 0, pawns: 1 }, 3).valid, false);
  });

  it('initBureaucracy records bureaucracyInitialFunding for all players', () => {
    const G = {
      boardState: {},
      players: {
        '0': { bank: [{ tileId: '-1+', faceDown: true }, { tileId: '-2+', faceDown: false }], credibilityNotchesLost: 0 },
        '1': { bank: [{ tileId: '^4-', faceDown: true }], credibilityNotchesLost: 0 }
      }
    };
    initBureaucracy(G);
    assert.equal(G.players['0'].bureaucracyInitialFunding, G.players['0'].funding);
    assert.equal(G.players['1'].bureaucracyInitialFunding, G.players['1'].funding);
    assert.ok(G.players['1'].bureaucracyInitialFunding > 0);
  });

  it('records and exports concise inline KGN with community piece codes, outcomes, and bureaucracy turns', () => {
    const G = {
      numPlayers: 3,
      boardState: {
        p1_seat1: { id: 'm1', type: 'Mark' },
        p2_seat1: { id: 'h1', type: 'Heel' }
      },
      players: {
        '0': { funding: 18, bureaucracyInitialFunding: 18 },
        '1': { funding: 12, bureaucracyInitialFunding: 12 },
        '2': { funding: 6, bureaucracyInitialFunding: 6 }
      },
      history: []
    };
    logKgnPhase(G, 'campaign');
    logKgnCampaignPlay(G, '0', '1', [{ type: 'Advance', from: 'community_1', to: 'p1_seat1' }]);
    logKgnOutcome(G, 'Q');
    logKgnCampaignPlay(G, '1', '2', [{ type: 'Advance', from: 'community_2', to: 'p2_seat1' }]);
    logKgnOutcome(G, 'B', { receiverId: '2', tileId: '+9-' });
    logKgnSubLine(G, 'Bs1>c');
    logKgnReward(G, '2');
    logKgnCampaignPlay(G, '2', '0', [{ type: 'Remove', from: 'p1_seat1', to: 'community' }]);
    logKgnOutcome(G, 'W', { challengerId: '1', tileId: '-3_' });
    logKgnPhase(G, 'bureaucracy');
    logKgnBureaucracyAction(G, '0', { actionType: 'PROMOTE_SEAT', targetLoc: 'p1_seat1', pieceType: 'Heel' });
    logKgnBureaucracyEnd(G, '0');
    G.winner = '0';
    logKgnResult(G);

    const doc = exportKgnDocument(G, (id) => ['Josh', 'Vance', 'Thorne'][parseInt(id, 10)]);
    assert.ok(doc.includes('[Format "KGN 1.0"]'));
    assert.ok(doc.includes('[A "Josh"]'));
    assert.ok(doc.includes('[Result "A"]'));
    assert.ok(doc.includes('1.A m>As1 @B'));
    assert.ok(doc.includes('2.B h>Bs1 @C [+9-] !C+2 Bs1>c'));
    assert.ok(doc.includes('3.C As1>c @A [-3_] ?B'));
    assert.ok(doc.includes('b1.A(18) As1>h # A'));
  });

  it('promotes a Mark directly to a Pawn for a single promotion cost when no Heels remain in community', () => {
    // When Heels exist in community, Mark promotes to Heel (not Pawn)
    assert.equal(getPromotionTargetType('Mark', { marks: 0, heels: 1, pawns: 1 }, false), 'Heel');
    // When no Heels remain, Mark promotes directly to Pawn (respecting Max 1 Pawn and community Pawns)
    assert.equal(getPromotionTargetType('Mark', { marks: 0, heels: 0, pawns: 1 }, false), 'Pawn');
    assert.equal(getPromotionTargetType('Mark', { marks: 0, heels: 0, pawns: 1 }, true), null);
    assert.equal(getPromotionTargetType('Mark', { marks: 0, heels: 0, pawns: 0 }, false), null);

    // Executing PROMOTE_SEAT / PROMOTE_ROSTRUM / PROMOTE_OFFICE swaps Mark with community Pawn and updates counts
    for (const [actionType, loc] of [['PROMOTE_SEAT', 'p1_seat1'], ['PROMOTE_ROSTRUM', 'p1_rostrum1'], ['PROMOTE_OFFICE', 'p1_office']]) {
      const G = {
        numPlayers: 3,
        players: { '0': { funding: 18 } },
        community: { marks: 2, heels: 0, pawns: 1 },
        boardState: {
          [loc]: { id: 'm1', type: 'Mark' },
          community_1: { id: 'cp1', type: 'Pawn' }
        }
      };
      assert.equal(executeBureaucracyActionPayload(G, '0', { actionType, targetLoc: loc }), true);
      assert.equal(G.boardState[loc].type, 'Pawn');
      assert.equal(G.boardState.community_1.type, 'Mark');
      assert.deepEqual(G.community, { marks: 3, heels: 0, pawns: 0 });
    }

    // AI enumerator includes direct Mark -> Pawn promotion at single seat promotion price
    const opts = enumerateAffordableBureaucracyOptions({
      botId: '0',
      numPlayers: 3,
      players: { '0': { funding: 6, credibilityNotchesLost: 0 } },
      community: { marks: 0, heels: 0, pawns: 1 },
      boardState: {
        p1_seat1: { id: 'm1', type: 'Mark' },
        community_1: { id: 'cp1', type: 'Pawn' }
      }
    }, 'funding');
    const promo = opts.find(o => o.payload.actionType === 'PROMOTE_SEAT' && o.payload.targetLoc === 'p1_seat1');
    assert.ok(promo);
    assert.equal(promo.meta.fromType, 'Mark');
    assert.equal(promo.meta.toType, 'Pawn');
    assert.equal(promo.meta.cost, 6);
  });

  it('game log snapshots capture hands, banks, and drop zones and respect filterSoloPlayerView', () => {
    const G = {
      boardState: { p1_seat1: { id: 'm1', type: 'Mark' } },
      players: {
        '0': { hand: ['+9-', '-1+'], bank: [{ tileId: '^1+', faceDown: true }], credibilityNotchesLost: 1 },
        '1': { hand: ['_8-'], bank: [{ tileId: '+5+', faceDown: true }, { tileId: '-3_', faceDown: false }], credibilityNotchesLost: 0 }
      },
      pendingPlay: { step: 'receipt', moverId: '0', receiverId: '1', tileIdPlayed: '+6^' },
      history: []
    };
    appendGameLog(G, 'Player 0 played a tile to Player 1.', 'play');

    // Mutate live state afterwards and verify peek restores the snapshot
    G.players['0'].hand = [];
    G.players['1'].bank = [];
    G.pendingPlay = null;

    const filtered = filterSoloPlayerView(G, '0');
    const peek = expandHistoryPeek(filtered, 1);
    assert.equal(peek.active, true);
    assert.equal(peek.hasTiles, true);
    assert.deepEqual(peek.G.players['0'].hand, ['+9-', '-1+']);
    assert.deepEqual(peek.G.players['1'].hand, ['HIDDEN']);
    assert.deepEqual(peek.G.players['1'].bank, [
      { tileId: 'HIDDEN', faceDown: true },
      { tileId: '-3_', faceDown: false }
    ]);
    assert.deepEqual(peek.G.pendingPlay, { step: 'receipt', receiverId: '1' });
  });

  it('inferMoveType respects stagedMoves when a Withdraw returns a Mark before a Heel Assist', () => {
    const boardAfterWithdraw = {
      p1_seat1: null,
      p2_seat2: null,
      community_1: { id: 'm_withdrawn', type: 'Mark' },
      community_2: { id: 'h_avail', type: 'Heel' }
    };
    const staged = [{ type: 'Withdraw', from: 'p1_seat1', to: 'community_1', pieceId: 'm_withdrawn' }];
    const inferred = inferMoveType('community_2', 'p2_seat2', '0', boardAfterWithdraw, { marks: 1, heels: 1, pawns: 0 }, 3, staged, '+8-', true);
    assert.equal(inferred, 'Assist');
  });
});
