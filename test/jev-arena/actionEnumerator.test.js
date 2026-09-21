// test/jev-arena/actionEnumerator.test.js
// Enumerator derives options from validators + executor guards.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { enumerateLegalActions, getActiveMover, nextMoverWithTiles } from './actionEnumerator.js';
import { makeInitialG } from './gameSetup.js';

describe('action enumerator (derived from rules)', () => {
  it('enumerates campaign turns for the active mover at game start', () => {
    const G = makeInitialG(3, 1);
    const { phase, playerId, options } = enumerateLegalActions(G);
    assert.equal(phase, 'CAMPAIGN');
    assert.equal(playerId, getActiveMover(G));
    assert.ok(options.length > 0);
    for (const o of options) {
      assert.equal(o.executorName, 'executeOnlineCampaignTurn');
      assert.ok(o.label.startsWith('CAMPAIGN '));
      assert.ok(o.actionType.length > 0);
    }
  });

  it('offers self-play only when every opponent bank is full', () => {
    const G = makeInitialG(3, 1);
    const mover = getActiveMover(G);
    for (const p of Object.keys(G.players)) {
      if (p !== mover) G.players[p].bank = Array.from({ length: 8 }, (_, i) => ({ tileId: `0${i + 1}`, faceDown: true }));
    }
    const { options } = enumerateLegalActions(G);
    assert.ok(options.length > 0);
    assert.ok(options.every((o) => o.args[0].receiverId === mover));
  });

  it('receipt offers accept, and reject only for non-honest plays', () => {
    const G = makeInitialG(3, 1);
    G.pendingPlay = { moverId: '0', receiverId: '1', tileIdPlayed: '05', playType: 'Dishonest', step: 'receipt', challengesPassed: [] };
    const dishonest = enumerateLegalActions(G);
    assert.deepEqual(dishonest.options.map((o) => o.executorName).sort(),
      ['executeOnlineAcceptTile', 'executeOnlineRejectTile']);
    G.pendingPlay.playType = 'Honest';
    const honest = enumerateLegalActions(G);
    assert.deepEqual(honest.options.map((o) => o.executorName), ['executeOnlineAcceptTile']);
  });

  it('challenge with no eligible challengers offers the resolving pass', () => {
    const G = makeInitialG(3, 1);
    for (const p of Object.keys(G.players)) G.players[p].credibilityNotchesLost = 3;
    G.pendingPlay = { moverId: '0', receiverId: '1', tileIdPlayed: '05', playType: 'Dishonest', step: 'challenge', challengesPassed: [] };
    const { playerId, options } = enumerateLegalActions(G);
    assert.equal(playerId, '1');
    assert.equal(options.length, 1);
    assert.equal(options[0].executorName, 'executeOnlinePassChallenge');
  });

  it('bureaucracy offers restore/promote/end for the current actor', () => {
    const G = makeInitialG(3, 1);
    G.bureaucracyTurnOrder = ['1', '2', '0'];
    G.bureaucracyTurnIndex = 0;
    const { phase, playerId, options } = enumerateLegalActions(G);
    assert.equal(phase, 'BUREAUCRACY');
    assert.equal(playerId, '1');
    const names = options.map((o) => o.actionType);
    assert.ok(names.includes('RESTORE_CRED'));
    assert.ok(names.includes('END'));
  });

  it('nextMoverWithTiles skips empty-hand players, null when all empty', () => {
    const G = makeInitialG(3, 1);
    G.players['0'].hand = [];
    assert.equal(nextMoverWithTiles(G, '0'), '1');
    for (const p of Object.keys(G.players)) G.players[p].hand = [];
    assert.equal(nextMoverWithTiles(G, '0'), null);
  });
});
