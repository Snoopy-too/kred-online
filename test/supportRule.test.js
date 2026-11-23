import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { createKredGame } from '../src/srcGame.js';
import { buildBotObservation } from '../src/ai/observation.js';
import { decideAction } from '../src/ai/decisions.js';
import { PIECE_TYPES } from '../src/domain/types.js';

function createCampaignClient(setupMutator) {
  const baseGame = createKredGame(3, true);
  const game = {
    ...baseGame,
    setup: (args, setupData) => {
      const G = baseGame.setup(args, setupData);
      if (setupMutator) setupMutator(G);
      return G;
    }
  };
  const client = Client({ game, numPlayers: 3 });
  client.start();
  return client;
}

function resolveQuietIsKept(client, receiverId, challengerId) {
  client.updatePlayerID(receiverId);
  client.moves.acceptTile();
  client.updatePlayerID(challengerId);
  client.moves.passChallenge();
}

test('Office piece with no rostrum support waits until Quiet is Kept, then lets owner choose Rostrum 1 or 2', () => {
  const client = createCampaignClient((G) => {
    G.nextMoverId = '0';
    G.players['0'].hand = ['19', '02']; // '19' is Withdraw
    G.boardState.p1_office = { id: 'p1_pawn', type: PIECE_TYPES.PAWN };
    G.boardState.p1_rostrum1 = { id: 'p1_heel1', type: PIECE_TYPES.HEEL };
    G.boardState.p1_rostrum2 = null;
    G.boardState.p1_seat1 = { id: 's1', type: PIECE_TYPES.MARK };
    G.boardState.p1_seat2 = null;
    G.boardState.p1_seat3 = null;
    G.boardState.p1_seat4 = { id: 's4', type: PIECE_TYPES.MARK };
  });

  // Player 0 withdraws Rostrum 1 -> Seat 2, leaving Office unsupported
  client.updatePlayerID('0');
  client.moves.submitTurnMovesAndTile({
    tileId: '19',
    receiverId: '1',
    moves: [{ type: 'Withdraw', from: 'p1_rostrum1', to: 'p1_seat2' }]
  });

  // Support drop must NOT trigger before tile resolves
  let state = client.getState();
  assert.equal(state.G.pendingSupport, null);
  assert.equal(state.G.pendingPlay.step, 'receipt');
  assert.equal(state.ctx.currentPlayer, '1');

  // Quiet is Kept -> now Player 0 chooses Rostrum 1 or 2
  resolveQuietIsKept(client, '1', '2');
  state = client.getState();
  assert.equal(state.ctx.currentPlayer, '0');
  assert.ok(state.G.pendingSupport);
  assert.equal(state.G.pendingSupport.ownerId, '0');
  assert.equal(state.G.pendingSupport.from, 'p1_office');
  assert.deepEqual(state.G.pendingSupport.validDestinations, ['p1_rostrum1', 'p1_rostrum2']);

  // Owner chooses Rostrum 2
  client.updatePlayerID('0');
  client.moves.resolveSupportDrop('p1_rostrum2');
  state = client.getState();
  assert.equal(state.G.pendingSupport, null);
  assert.equal(state.G.boardState.p1_office, null);
  assert.equal(state.G.boardState.p1_rostrum2?.id, 'p1_pawn');
  assert.equal(state.ctx.currentPlayer, '1');
});

test('Cascading drop after Witch Hunt: Office -> unsupported Rostrum 1 -> owner chooses Seat 1, 2, or 3', () => {
  const client = createCampaignClient((G) => {
    G.nextMoverId = '0';
    G.players['0'].hand = ['19', '02']; // '19' is honest Withdraw
    G.boardState.p1_office = { id: 'p1_pawn', type: PIECE_TYPES.PAWN };
    G.boardState.p1_rostrum1 = null;
    G.boardState.p1_rostrum2 = { id: 'p1_heel2', type: PIECE_TYPES.HEEL };
    G.boardState.p1_seat1 = null;
    G.boardState.p1_seat2 = null;
    G.boardState.p1_seat3 = null;
    G.boardState.p1_seat4 = null;
    G.boardState.p1_seat5 = { id: 's5', type: PIECE_TYPES.MARK };
    G.boardState.p1_seat6 = null;
  });

  client.updatePlayerID('0');
  client.moves.submitTurnMovesAndTile({
    tileId: '19',
    receiverId: '1',
    moves: [{ type: 'Withdraw', from: 'p1_rostrum2', to: 'p1_seat4' }]
  });

  // Receiver accepts, Player 2 challenges an honest play -> Witch Hunt!
  client.updatePlayerID('1');
  client.moves.acceptTile();
  client.updatePlayerID('2');
  client.moves.challengeTile();

  // Now Player 0 picks Rostrum 1 (whose seats 1-3 are empty -> cascades!)
  client.updatePlayerID('0');
  client.moves.resolveSupportDrop('p1_rostrum1');
  let state = client.getState();
  assert.ok(state.G.pendingSupport);
  assert.equal(state.G.pendingSupport.from, 'p1_rostrum1');
  assert.deepEqual(state.G.pendingSupport.validDestinations, ['p1_seat1', 'p1_seat2', 'p1_seat3']);

  // Owner chooses Seat 3
  client.moves.resolveSupportDrop('p1_seat3');
  state = client.getState();
  assert.equal(state.G.pendingSupport, null);
  assert.equal(state.G.boardState.p1_rostrum1, null);
  assert.equal(state.G.boardState.p1_seat3?.id, 'p1_pawn');
  assert.equal(state.ctx.currentPlayer, '1');
});

test('Opponent owns unsupported Rostrum piece and chooses seat after Quiet is Kept', () => {
  const client = createCampaignClient((G) => {
    G.nextMoverId = '0';
    G.players['0'].hand = ['15', '02']; // '15' is Remove
    G.boardState.p2_rostrum1 = { id: 'p2_heel', type: PIECE_TYPES.HEEL };
    G.boardState.p2_seat1 = { id: 'p2_m1', type: PIECE_TYPES.MARK };
    G.boardState.p2_seat2 = null;
    G.boardState.p2_seat3 = null;
  });

  // Player 0 Removes Player 1's last supporting seat Mark
  client.updatePlayerID('0');
  client.moves.submitTurnMovesAndTile({
    tileId: '15',
    receiverId: '2',
    moves: [{ type: 'Remove', from: 'p2_seat1', to: 'community' }]
  });

  // Not triggered yet during receipt/challenge
  assert.equal(client.getState().G.pendingSupport, null);

  // Quiet is Kept (receiver 2 accepts, challenger 1 passes)
  resolveQuietIsKept(client, '2', '1');

  let state = client.getState();
  assert.ok(state.G.pendingSupport);
  assert.equal(state.G.pendingSupport.ownerId, '1');
  assert.equal(state.ctx.currentPlayer, '1');
  assert.deepEqual(state.G.pendingSupport.validDestinations, ['p2_seat1', 'p2_seat2', 'p2_seat3']);

  // Player 1 (owner) chooses Seat 2
  client.updatePlayerID('1');
  client.moves.resolveSupportDrop('p2_seat2');

  state = client.getState();
  assert.equal(state.G.pendingSupport, null);
  assert.equal(state.G.boardState.p2_rostrum1, null);
  assert.equal(state.G.boardState.p2_seat2?.id, 'p2_heel');
  assert.equal(state.ctx.currentPlayer, '2');
});

test('AI prefers supported Rostrum over unsupported Rostrum when dropping from Office', () => {
  const client = createCampaignClient((G) => {
    G.nextMoverId = '0';
    G.players['0'].hand = ['19', '02'];
    G.boardState.p1_office = { id: 'p1_pawn', type: PIECE_TYPES.PAWN };
    G.boardState.p1_rostrum1 = null;
    G.boardState.p1_rostrum2 = { id: 'p1_heel2', type: PIECE_TYPES.HEEL };
    G.boardState.p1_seat1 = null;
    G.boardState.p1_seat2 = null;
    G.boardState.p1_seat3 = null;
    G.boardState.p1_seat4 = { id: 's4', type: PIECE_TYPES.MARK };
    G.boardState.p1_seat5 = null;
    G.boardState.p1_seat6 = null;
  });

  client.updatePlayerID('0');
  client.moves.submitTurnMovesAndTile({
    tileId: '19',
    receiverId: '1',
    moves: [{ type: 'Withdraw', from: 'p1_rostrum2', to: 'p1_seat5' }]
  });
  resolveQuietIsKept(client, '1', '2');

  const state = client.getState();
  const obs = buildBotObservation(state.G, state.ctx, '0');
  const decision = decideAction(obs, {});
  assert.equal(decision.move, 'resolveSupportDrop');
  assert.equal(decision.args[0], 'p1_rostrum2');
});
