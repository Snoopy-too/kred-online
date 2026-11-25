import assert from 'node:assert/strict';
import { parentPort, workerData } from 'node:worker_threads';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from '../src/srcGame.js';
import {
  STANDARD_TILE_IDS,
  createBotMemory,
  updateBotMemory,
  buildBotObservation,
  pickRandomPersonas,
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

function assertTileConservation(G, contextLabel, numPlayers) {
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

  const expectedCount = numPlayers === 5 ? 25 : 24;
  assert.equal(tiles.length, expectedCount, `${contextLabel}: expected ${expectedCount} tiles, got ${tiles.length}`);
  const unique = new Set(tiles);
  assert.equal(unique.size, expectedCount, `${contextLabel}: duplicate or missing tile in ${tiles.join(',')}`);
  for (const tid of STANDARD_TILE_IDS) {
    assert.ok(unique.has(tid), `${contextLabel}: missing standard tile ${tid}`);
  }
  if (numPlayers === 5) {
    assert.ok(unique.has('BLANK'), `${contextLabel}: missing BLANK tile in 5P game`);
  }
}

function runBatch({ matchIndices, draftedMatches, maxActionsPerMatch, playerCounts = [3, 4, 5] }) {
  const origLog = console.log;
  console.log = () => {};
  let totalActions = 0;
  let maxActions = 0;
  const byPlayerCount = {};
  const personaStats = {};
  let draws = 0;

  try {
    for (const matchIdx of matchIndices) {
      const numPlayers = playerCounts[matchIdx % playerCounts.length];
      const skipDraft = matchIdx >= draftedMatches;
      const rng = makeSeededRng(1000 + matchIdx * 37);
      const seatIds = Array.from({ length: numPlayers }, (_, i) => String(i));
      const picked = pickRandomPersonas(numPlayers, rng);
      const personas = {};
      seatIds.forEach((id, idx) => {
        personas[id] = picked[idx];
        const name = picked[idx].name;
        if (!personaStats[name]) personaStats[name] = { games: 0, wins: 0 };
        personaStats[name].games++;
      });

      const game = createKredGame(numPlayers, skipDraft);
      const multiplayer = Local();
      const matchID = `solo-stress-${numPlayers}p-${matchIdx}`;
      const clients = seatIds.map((playerID) => {
        const c = Client({ game, numPlayers, matchID, playerID, multiplayer });
        c.start();
        return c;
      });
      const memories = {};
      for (const id of seatIds) memories[id] = createBotMemory();
      const syncAllMemories = () => {
        for (const id of seatIds) {
          const st = clients[Number(id)].getState();
          if (st?.G && st?.ctx) {
            updateBotMemory(memories[id], st.G, st.ctx, id, personas[id], rng);
          }
        }
      };

      try {
        let actions = 0;
        let state = clients[0].getState();
        assertTileConservation(state.G, `match ${matchIdx} (${numPlayers}P) init`, numPlayers);

        while (!state.ctx.gameover && !state.G.winner && actions < maxActionsPerMatch) {
          let acted = false;
          const order = state.ctx.phase === 'draft'
            ? seatIds
            : [String(state.ctx.currentPlayer)];

          for (const botId of order) {
            const botClient = clients[Number(botId)];
            const botState = botClient.getState();
            if (botState.ctx.gameover || botState.G.winner) break;

            syncAllMemories();
            const obs = buildBotObservation(botState.G, botState.ctx, botId, memories[botId]);
            const action = decideAction(obs, personas[botId], rng);
            if (!action) continue;

            const beforeId = botState._stateID;
            botClient.moves[action.move](...action.args);
            const afterState = botClient.getState();
            syncAllMemories();

            assert.ok(
              afterState._stateID > beforeId,
              `match ${matchIdx} (${numPlayers}P) action #${actions}: INVALID_MOVE for bot ${botId} (${personas[botId].name}) -> ${action.move} ${JSON.stringify(action.args)} in phase=${botState.ctx.phase} step=${botState.G.pendingPlay?.step}`
            );
            assertTileConservation(afterState.G, `match ${matchIdx} (${numPlayers}P) action #${actions} (${action.move})`, numPlayers);
            actions++;
            totalActions++;
            acted = true;
            state = clients[0].getState();
            if (state.ctx.gameover || state.G.winner) break;
          }

          if (!acted) {
            assert.fail(
              `match ${matchIdx} (${numPlayers}P) stalled at action #${actions} phase=${state.ctx.phase} current=${state.ctx.currentPlayer} pending=${state.G.pendingPlay?.step}`
            );
          }
        }

        const finalState = clients[0].getState();
        assert.ok(
          actions < maxActionsPerMatch,
          `match ${matchIdx} (${numPlayers}P) hit action cap (${maxActionsPerMatch}) without winner`
        );
        assert.ok(
          [...seatIds, 'draw'].includes(finalState.G.winner),
          `match ${matchIdx} (${numPlayers}P) invalid winner: ${finalState.G.winner}`
        );
        assert.deepEqual(
          finalState.ctx.gameover,
          { winner: finalState.G.winner },
          `match ${matchIdx} (${numPlayers}P) missing or mismatched ctx.gameover`
        );
        if (actions > maxActions) maxActions = actions;
        const pKey = `${numPlayers}P`;
        if (!byPlayerCount[pKey]) byPlayerCount[pKey] = { matches: 0, maxActions: 0 };
        byPlayerCount[pKey].matches++;
        if (actions > byPlayerCount[pKey].maxActions) byPlayerCount[pKey].maxActions = actions;
        if (finalState.G.winner === 'draw') {
          draws++;
        } else {
          const winnerName = personas[finalState.G.winner]?.name;
          if (winnerName && personaStats[winnerName]) personaStats[winnerName].wins++;
        }
      } finally {
        clients.forEach((c) => c.stop());
      }
    }
  } finally {
    console.log = origLog;
  }

  return { completed: matchIndices.length, totalActions, maxActions, byPlayerCount, personaStats, draws };
}

parentPort.postMessage(runBatch(workerData));
