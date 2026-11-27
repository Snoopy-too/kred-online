import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { createKredGame } from '../src/game.js';
import { createSoloController, buildBotObservation, getBotPersona, pickRandomPersonas, findPersonaByName, decideAction } from '../src/ai/index.js';

function waitUntil(predicate, timeoutMs = 4000, onTimeoutInfo = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (predicate()) return resolve();
      if (Date.now() - start > timeoutMs) {
        const extra = typeof onTimeoutInfo === 'function' ? ` (${onTimeoutInfo()})` : '';
        return reject(new Error(`Timed out waiting for soloController condition${extra}`));
      }
      setTimeout(check, 10);
    };
    check();
  });
}

describe('soloController integration with hideOpponentHands', () => {
  it('completes a full human-simulated solo match (Draft -> Campaign -> Bureaucracy -> GameOver) via createSoloController', async () => {
    const game = createKredGame(3, false, { hideOpponentHands: true });
    const multiplayer = Local();
    const matchID = 'solo-controller-e2e';
    const statuses = [];
    const errors = [];

    const humanClient = Client({
      game,
      numPlayers: 3,
      matchID,
      playerID: '0',
      multiplayer
    });

    const humanPersona = getBotPersona('0');
    let humanMoves = 0;
    let lastKey = '';
    let finished = false;
    let resolveDone;
    const donePromise = new Promise((res) => { resolveDone = res; });

    const maybePlayHuman = () => {
      const s = humanClient.getState();
      if (!s || !s.G || !s.ctx) return;
      if (s.G.winner || s.ctx.gameover) {
        if (!finished) {
          finished = true;
          resolveDone();
        }
        return;
      }

      assert.ok(
        (s.G.players['1']?.hand || []).every((t) => t === 'HIDDEN'),
        'Human client should never see Bot 1 hand tiles'
      );
      assert.ok(
        (s.G.players['2']?.hand || []).every((t) => t === 'HIDDEN'),
        'Human client should never see Bot 2 hand tiles'
      );

      const obs = buildBotObservation(s.G, s.ctx, '0');
      const action = decideAction(obs, humanPersona);
      if (action) {
        const key = `${s.ctx.phase}:${s.ctx.turn}:${s._stateID}:${s.G.draftPacks?.['0']?.length || 0}`;
        if (key !== lastKey) {
          lastKey = key;
          setTimeout(() => {
            if (!finished) {
              humanClient.moves[action.move](...(action.args || []));
              humanMoves++;
            }
          }, 0);
        }
      }
    };

    const unsubHuman = humanClient.subscribe(maybePlayHuman);
    humanClient.start();

    const controller = createSoloController({
      game,
      matchID,
      multiplayer,
      delayOverrideMs: 0,
      onStatusChange: (s) => { if (s) statuses.push(s); },
      onBotError: (err, botId) => errors.push({ err, botId })
    });

    try {
      await Promise.race([
        donePromise,
        new Promise((_, reject) =>
          setTimeout(() => {
            const s = humanClient.getState();
            reject(new Error(`Timed out: phase=${s?.ctx?.phase} turn=${s?.ctx?.turn} cur=${s?.ctx?.currentPlayer} step=${s?.G?.pendingPlay?.step} humanMoves=${humanMoves}`));
          }, 60000)
        )
      ]);

      const finalState = humanClient.getState();
      assert.deepEqual(errors, []);
      assert.ok(['0', '1', '2', 'draw'].includes(finalState.G.winner));
      assert.deepEqual(finalState.ctx.gameover, { winner: finalState.G.winner });
      assert.ok(humanMoves > 0);
      assert.ok(statuses.length > 0);
    } finally {
      unsubHuman();
      controller.stop();
      humanClient.stop();
    }
  });

  it('cleans up timers and stops cleanly mid-draft without errors', async () => {
    const game = createKredGame(3, false, { hideOpponentHands: true });
    const multiplayer = Local();
    const matchID = 'solo-controller-stop';
    const humanClient = Client({ game, numPlayers: 3, matchID, playerID: '0', multiplayer });
    humanClient.start();

    let statusCount = 0;
    const controller = createSoloController({
      game,
      matchID,
      multiplayer,
      delayOverrideMs: 500,
      onStatusChange: (s) => { if (s) statusCount++; }
    });

    await waitUntil(() => statusCount > 0, 1000);
    controller.stop();
    const stateBefore = humanClient.getState()._stateID;
    await new Promise((r) => setTimeout(r, 60));
    assert.equal(humanClient.getState()._stateID, stateBefore);
    humanClient.stop();
  });

  it('pickRandomPersonas selects distinct personas and varies across matches', () => {
    const seenPairs = new Set();
    for (let seed = 1; seed <= 25; seed++) {
      let s = seed;
      const rng = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
      const picked = pickRandomPersonas(4, rng);
      assert.equal(picked.length, 4);
      assert.equal(new Set(picked.map((p) => p.id)).size, 4);
      seenPairs.add(picked.slice(0, 2).map((p) => p.id).join(','));
    }
    assert.ok(seenPairs.size > 1, 'Expected random persona selection to vary across games');
    assert.equal(findPersonaByName('Thorne (Bot)')?.id, '3');
    assert.equal(findPersonaByName('Mire')?.id, '4');
  });
});
