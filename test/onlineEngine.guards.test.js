import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  executeOnlineCampaignTurn,
  executeOnlineBureaucracyAction,
  executeOnlineEndBureaucracyTurn,
} from '../src/domain/onlineEngine.js';

// Ported from Apr Exp 2 (branch-de-escalante): server-side identity/turn
// validation, adapted to kred2.0 where moves are validated in onlineEngine
// (no socket server exists on this branch).

const players = () => ({
  0: { hand: ['T1'], bank: [], credibilityNotchesLost: 0, funding: 5 },
  1: { hand: ['T2'], bank: [], credibilityNotchesLost: 0, funding: 5 },
  2: { hand: ['T3'], bank: [], credibilityNotchesLost: 0, funding: 5 },
});

const campaignG = (mover) => ({
  players: players(),
  boardState: {},
  community: {},
  numPlayers: 3,
  nextMoverId: mover,
});

const spy = () => {
  const calls = [];
  return { calls, fn: (g, phase) => calls.push([g, phase]) };
};

describe('campaign turn guard', () => {
  it('refuses a turn submitted by the wrong mover', () => {
    const s = spy();
    executeOnlineCampaignTurn(campaignG('0'), '1',
      { tileId: 'T1', receiverId: '1', moves: [] }, s.fn);
    assert.equal(s.calls.length, 0);
  });

  it('accepts a turn from the current mover', () => {
    const s = spy();
    executeOnlineCampaignTurn(campaignG('0'), '0',
      { tileId: 'T1', receiverId: '1', moves: [] }, s.fn);
    assert.equal(s.calls.length, 1);
  });

  it('allows the opening turn when nextMoverId is unset', () => {
    const g = campaignG(undefined);
    delete g.nextMoverId;
    const s = spy();
    executeOnlineCampaignTurn(g, '0',
      { tileId: 'T1', receiverId: '1', moves: [] }, s.fn);
    assert.equal(s.calls.length, 1);
  });
});

describe('bureaucracy guards', () => {
  const openG = () => ({
    players: players(),
    boardState: {},
    numPlayers: 3,
    bureaucracyTurnOrder: ['1', '2', '0'],
    bureaucracyTurnIndex: 0,
  });

  it('refuses bureaucracy actions outside bureaucracy', () => {
    const s = spy();
    const g = { players: players(), boardState: {}, numPlayers: 3 };
    executeOnlineBureaucracyAction(g, '1', { actionType: 'RESTORE_CRED' }, s.fn);
    assert.equal(s.calls.length, 0);
  });

  it('allows promoting your own piece, refuses another player\u2019s', () => {
    const s = spy();
    const g = openG();
    // Player '1' owns p2_* pieces (1-based prefix). Own piece: accepted.
    // (Board position after enforceSupportRule is game physics, not asserted.)
    g.boardState = { p2_seat1: { type: 'Seat' } };
    executeOnlineBureaucracyAction(g, '1',
      { actionType: 'PROMOTE_SEAT_TO_ROSTRUM', fromLoc: 'p2_seat1', toLoc: 'p2_rostrum1' }, s.fn);
    assert.equal(s.calls.length, 1);
    // …but player 0's piece is refused outright: no move, no broadcast.
    const s2 = spy();
    const g2 = openG();
    g2.boardState = { p1_seat1: { type: 'Seat' } };
    executeOnlineBureaucracyAction(g2, '1',
      { actionType: 'PROMOTE_SEAT_TO_ROSTRUM', fromLoc: 'p1_seat1', toLoc: 'p1_rostrum1' }, s2.fn);
    assert.equal(s2.calls.length, 0);
    assert.notEqual(g2.boardState.p1_seat1, null);
  });

  it('allows current-actor bureaucracy action', () => {
    const s = spy();
    const g = openG();
    executeOnlineBureaucracyAction(g, '1', { actionType: 'RESTORE_CRED' }, s.fn);
    assert.equal(s.calls.length, 1);
  });

  it('refuses end-turn from the wrong bureaucracy actor', () => {
    const s = spy();
    executeOnlineEndBureaucracyTurn(openG(), '2', s.fn);
    assert.equal(s.calls.length, 0);
  });

  it('accepts end-turn from the current actor', () => {
    const s = spy();
    executeOnlineEndBureaucracyTurn(openG(), '1', s.fn);
    assert.equal(s.calls.length, 1);
  });
});
