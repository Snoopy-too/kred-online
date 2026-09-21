// test/jev-arena/oracles.test.js
// Oracle contract: rules-rejected calls never broadcast; twins stay in sync.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  inventIllegalProbe,
  executorBroadcastsIllegal,
  isOptionLegalByRules,
  statesInSync,
  normalizeState,
  bureaucracyOwnershipHolds,
  spy,
} from './oracles.js';
import { enumerateLegalActions } from './actionEnumerator.js';
import { executeOnlineCampaignTurn } from '../../src/domain/onlineEngine.js';
import { makeInitialG, clone } from './gameSetup.js';

describe('illegal-move oracle', () => {
  it('a wrong-mover campaign turn never broadcasts', () => {
    const G = makeInitialG(3, 1);
    const probe = inventIllegalProbe(G);
    assert.equal(probe.executorName, 'executeOnlineCampaignTurn');
    assert.equal(executorBroadcastsIllegal(G, probe), false);
  });

  it('a wrong-actor bureaucracy end-turn never broadcasts', () => {
    const G = makeInitialG(3, 1);
    G.bureaucracyTurnOrder = ['1', '2', '0'];
    const probe = inventIllegalProbe(G);
    assert.equal(probe.executorName, 'executeOnlineEndBureaucracyTurn');
    assert.equal(executorBroadcastsIllegal(G, probe), false);
  });

  it('enumerated campaign options are rules-legal and broadcast on apply', () => {
    const G = makeInitialG(3, 1);
    const { options } = enumerateLegalActions(G);
    assert.ok(options.length > 0);
    assert.ok(isOptionLegalByRules(G, options[0]));
    const s = spy();
    options[0].executor(clone(G), options[0].playerID, ...JSON.parse(JSON.stringify(options[0].args)), s.fn);
    assert.equal(s.calls.length, 1);
  });

  it('over-limit move payloads (3 moves) never broadcast', () => {
    const G = makeInitialG(3, 1);
    const mover = Object.keys(G.players).find((p) => G.players[p].hand.length > 0);
    const receiver = Object.keys(G.players).find((p) => p !== mover);
    G.nextMoverId = mover; // pass the turn guard so the schema cap is what refuses
    const s = spy();
    executeOnlineCampaignTurn(clone(G), mover, {
      tileId: G.players[mover].hand[0],
      receiverId: receiver,
      moves: [
        { type: 'Advance', from: 'community', to: 'p1_seat2' },
        { type: 'Advance', from: 'community', to: 'p1_seat4' },
        { type: 'Advance', from: 'community', to: 'p1_seat6' },
      ],
    }, s.fn);
    assert.equal(s.calls.length, 0);
  });

  it('twin states stay in sync; generated ids normalize away', () => {
    const A = makeInitialG(3, 1);
    const B = clone(A);
    assert.ok(statesInSync(A, B));
    B.boardState.community_1 = { id: `m_${Date.now()}_0.123`, type: 'Mark' };
    assert.ok(statesInSync(A, { ...B, boardState: { ...B.boardState, community_1: A.boardState.community_1 } }));
    assert.match(normalizeState(B), /"m_generated"/);
    B.nextMoverId = '2';
    assert.equal(statesInSync(A, B), false);
  });

  it('promoting another player piece never broadcasts nor mutates', () => {
    const G = makeInitialG(3, 1);
    G.bureaucracyTurnOrder = ['0', '1', '2'];
    assert.equal(bureaucracyOwnershipHolds(G, '0'), true);
  });
});
