// Auto-generated invariant violation test
// Invariant: supportRule
// Details: p1_rostrum1 is occupied but none of its supporting seats [p1_seat1, p1_seat2, p1_seat3] are occupied
// Seed: 8, Players: 3
import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import type { KredAction } from '../../engine/types';

describe('invariant violation: supportRule (seed 8)', () => {
  it('replays the failing game', () => {
    let state = createInitialState({ playerCount: 3 as const, seed: 8 });
    const actions: KredAction[] = [
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "18",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "14",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_0",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "16",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "09",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "01",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "21",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "13",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "23",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat5",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "17",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "05",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_10",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "10",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "19",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "06",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "22",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "04",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "11",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat5",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "08",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "24",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "12",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "20",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_10",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_rostrum2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "02",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT_BLIND"
  }
];

    for (let i = 0; i < actions.length; i++) {
      try {
        state = gameReducer(state, actions[i]);
      } catch (err) {
        if (i === 74) {
          expect((err as Error).message).toContain('supportRule');
          return;
        }
        throw err;
      }
    }
    expect(true).toBe(true);
  });
});
