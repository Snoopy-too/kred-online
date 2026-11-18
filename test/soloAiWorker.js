import assert from 'node:assert/strict';
import { parentPort, workerData } from 'node:worker_threads';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from '../src/srcGame.js';
import {
  STANDARD_TILE_IDS,
  buildBotObservation,
  getBotPersona,
  decideAction
} from '../src/ai/index.js';

function makeSeededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function assertTileConservation(G, contextLabel) {
  const tiles = [];
  for (const id of Object.keys(G.players || {})) {
    const p = G.players[id];
    tiles.push(...(p.hand || []));
    for (const b of p.bank || []) tiles.push(b.tileId);
  }
  for (const id of Object.keys(G.draftPacks || {})) {
    tiles.push(...(G.draftPacks[id] || []));
  }
  if (G.pendingPlay && (G.pendingPlay.step === 'receipt' || G.pendingPlay.step === 'challenge')) {
    tiles.push(G.pendingPlay.tileIdPlayed);
  }

  assert.equal(tiles.length, 24, `${contextLabel}: expected 24 tiles, got ${tiles.length}`);
  const unique = new Set(tiles);
  assert.equal(unique.size, 24, `${contextLabel}: duplicate or missing tile in ${tiles.join(',')}`);
  for (const tid of STANDARD_TILE_IDS) {
    assert.ok(unique.has(tid), `${contextLabel}: missing standard tile ${tid}`);
  }
}

function runBatch({ matchIndices, draftedMatches, maxActionsPerMatch }) {
  const personas = {
    '0': getBotPersona('0'),
    '1': getBotPersona('1'),
    '2': getBotPersona('2')
  };
  const origLog = console.log;
  console.log = () => {};
  let totalActions = 0;
  let maxActions = 0;
  const winners = { '0': 0, '1': 0, '2': 0, draw: 0 };

  try {
    for (const matchIdx of matchIndices) {
      const skipDraft = matchIdx >= draftedMatches;
      const rng = makeSeededRng(1000 + matchIdx * 37);
      const game = createKredGame(3, skipDraft);
      const multiplayer = Local();
      const matchID = `solo-stress-${matchIdx}`;
      const clients = ['0', '1', '2'].map((playerID) => {
        const c = Client({ game, numPlayers: 3, matchID, playerID, multiplayer });
        c.start();
        return c;
      });

      try {
        let actions = 0;
        let state = clients[0].getState();
        assertTileConservation(state.G, `match ${matchIdx} init`);

        while (!state.ctx.gameover && !state.G.winner && actions < maxActionsPerMatch) {
          let acted = false;
          const order = state.ctx.phase === 'draft'
            ? ['0', '1', '2']
            : [String(state.ctx.currentPlayer)];

          for (const botId of order) {
            const botClient = clients[Number(botId)];
            const botState = botClient.getState();
            if (botState.ctx.gameover || botState.G.winner) break;

            const obs = buildBotObservation(botState.G, botState.ctx, botId);
            const action = decideAction(obs, personas[botId], rng);
            if (!action) continue;

            const beforeId = botState._stateID;
            botClient.moves[action.move](...action.args);
            const afterState = botClient.getState();

            assert.ok(
              afterState._stateID > beforeId,
              `match ${matchIdx} action #${actions}: INVALID_MOVE for bot ${botId} -> ${action.move} ${JSON.stringify(action.args)} in phase=${botState.ctx.phase} step=${botState.G.pendingPlay?.step}`
            );
            assertTileConservation(afterState.G, `match ${matchIdx} action #${actions} (${action.move})`);
            actions++;
            totalActions++;
            acted = true;
            state = clients[0].getState();
            if (state.ctx.gameover || state.G.winner) break;
          }

          if (!acted) {
            assert.fail(
              `match ${matchIdx} stalled at action #${actions} phase=${state.ctx.phase} current=${state.ctx.currentPlayer} pending=${state.G.pendingPlay?.step}`
            );
          }
        }

        const finalState = clients[0].getState();
        assert.ok(
          actions < maxActionsPerMatch,
          `match ${matchIdx} hit action cap (${maxActionsPerMatch}) without winner`
        );
        assert.ok(
          ['0', '1', '2', 'draw'].includes(finalState.G.winner),
          `match ${matchIdx} invalid winner: ${finalState.G.winner}`
        );
        assert.deepEqual(
          finalState.ctx.gameover,
          { winner: finalState.G.winner },
          `match ${matchIdx} missing or mismatched ctx.gameover`
        );
        if (actions > maxActions) maxActions = actions;
        winners[finalState.G.winner] = (winners[finalState.G.winner] || 0) + 1;
      } finally {
        clients.forEach((c) => c.stop());
      }
    }
  } finally {
    console.log = origLog;
  }

  return { completed: matchIndices.length, totalActions, maxActions, winners };
}

parentPort.postMessage(runBatch(workerData));
