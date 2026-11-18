import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame, filterSoloPlayerView } from '../src/srcGame.js';
import { classifyPlay } from '../src/domain/moves.js';

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
        G.players['0'].hand = ['03', '04'];
        G.players['1'].credibilityNotchesLost = 3;
        G.players['2'].credibilityNotchesLost = 3;
        G.nextMoverId = '0';
        return G;
      }
    };
    const clients = makeLocalClients(customGame, 'zero-cred-all');
    try {
      clients[0].moves.submitTurnMovesAndTile({
        tileId: '03',
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
          tileIdPlayed: '05',
          reexecuteTileId: '05',
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
          tileIdPlayed: '05',
          reexecuteTileId: '05',
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
        G.players['0'].bank = [{ tileId: '24', faceDown: true }];
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
        '0': { hand: ['01'], bank: [{ tileId: '02', faceDown: true }], credibilityNotchesLost: 0 },
        '1': { hand: ['03', '04'], bank: [{ tileId: '05', faceDown: true }, { tileId: '06', faceDown: false }], credibilityNotchesLost: 0 },
        '2': { hand: ['07'], bank: [], credibilityNotchesLost: 3 }
      },
      draftPacks: { '0': ['08'], '1': ['09', '10'], '2': ['11'] },
      pendingPlay: {
        moverId: '1',
        receiverId: '2',
        tileIdPlayed: '12',
        playType: 'Dishonest',
        step: 'receipt'
      }
    };
    const v0 = filterSoloPlayerView(raw, '0');
    assert.deepEqual(v0.players['0'].hand, ['01']);
    assert.deepEqual(v0.players['1'].hand, ['HIDDEN', 'HIDDEN']);
    assert.equal(v0.players['1'].bank[0].tileId, 'HIDDEN');
    assert.equal(v0.players['1'].bank[1].tileId, '06');
    assert.deepEqual(v0.draftPacks['1'], ['HIDDEN', 'HIDDEN']);
    assert.equal(v0.pendingPlay.tileIdPlayed, 'HIDDEN');
    assert.equal(v0.pendingPlay.playType, 'HIDDEN');

    // Original G unchanged
    assert.deepEqual(raw.players['1'].hand, ['03', '04']);
    assert.equal(raw.pendingPlay.tileIdPlayed, '12');

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
    assert.equal(classifyPlay(assistOnly, '13', '1', boardState, community, 3), 'Honest');
    assert.equal(classifyPlay([], '13', '1', boardState, community, 3), 'Dishonest');
    assert.equal(classifyPlay([{ type: 'Withdraw', from: 'p2_seat1', to: 'community' }], '13', '1', boardState, community, 3), 'Dishonest');
  });
});
