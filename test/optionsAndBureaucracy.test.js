import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { createKredGame } from '../src/srcGame.js';
import { TILES } from '../src/domain/types.js';

function runServerSetup(setupData = {}, numPlayers = 3) {
  const game = createKredGame();
  return game.setup(
    { ctx: { numPlayers }, random: { Shuffle: (arr) => [...arr] } },
    setupData
  );
}

test('game options default to false and work independently via setupData', () => {
  const def = runServerSetup({});
  assert.equal(def.players['0'].hand.length, 0);
  assert.ok(def.draftPacks['0'].length > 0);
  assert.equal(def.expertMode, false);

  const skipOnly = runServerSetup({ skipDraft: true, expertMode: false });
  assert.ok(skipOnly.players['0'].hand.length > 0);
  assert.equal(skipOnly.draftPacks['0'].length, 0);
  assert.equal(skipOnly.expertMode, false);

  const expertOnly = runServerSetup({ skipDraft: false, expertMode: true });
  assert.equal(expertOnly.players['0'].hand.length, 0);
  assert.ok(expertOnly.draftPacks['0'].length > 0);
  assert.equal(expertOnly.expertMode, true);

  const both = runServerSetup({ skipDraft: true, expertMode: true });
  assert.ok(both.players['0'].hand.length > 0);
  assert.equal(both.draftPacks['0'].length, 0);
  assert.equal(both.expertMode, true);
});

test('submitBureaucracyTurn applies batched actions, records replay, and rolls back invalid batches', () => {
  const fundedTiles = Object.keys(TILES).filter((id) => (TILES[id]?.funding || 0) >= 2).slice(0, 6);
  const game = createKredGame(3, true);
  const origSetup = game.setup;
  game.setup = (args, setupData) => {
    const G = origSetup(args, setupData);
    for (const pId of Object.keys(G.players)) {
      G.players[pId].hand = [];
      G.players[pId].bank = pId === '0'
        ? fundedTiles.map((tileId) => ({ tileId, faceDown: true }))
        : [];
    }
    G.players['0'].credibilityNotchesLost = 1;
    return G;
  };

  const client = Client({ game, numPlayers: 3 });
  client.start();
  let state = client.getState();
  assert.equal(state.ctx.phase, 'bureaucracy');
  assert.equal(state.ctx.currentPlayer, '0');
  const startFunding = state.G.players['0'].funding;
  assert.ok(startFunding >= 8, `Expected funding >= 8, got ${startFunding}`);

  // Invalid batch must roll back completely
  client.moves.submitBureaucracyTurn([
    { actionType: 'RESTORE_CRED' },
    { actionType: 'PROMOTE_OFFICE', targetLoc: 'p1_office' }
  ]);
  state = client.getState();
  assert.equal(state.ctx.currentPlayer, '0');
  assert.equal(state.G.players['0'].funding, startFunding);
  assert.equal(state.G.players['0'].credibilityNotchesLost, 1);

  // Valid batch: restore credibility + organize Mark from p1_seat1 to p1_seat2
  client.moves.submitBureaucracyTurn([
    { actionType: 'RESTORE_CRED' },
    { actionType: 'BASIC_ACTION', subAction: { type: 'Organize', from: 'p1_seat1', to: 'p1_seat2' } }
  ]);
  state = client.getState();
  assert.equal(state.G.players['0'].credibilityNotchesLost, 0);
  assert.equal(state.G.boardState['p1_seat1'], null);
  assert.equal(state.G.boardState['p1_seat2']?.type, 'Mark');
  assert.equal(state.G.lastBureaucracyReplay?.playerId, '0');
  assert.equal(state.G.lastBureaucracyReplay?.movesMade?.length, 1);
  assert.notEqual(state.ctx.currentPlayer, '0');
});
