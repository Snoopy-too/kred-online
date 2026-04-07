// Auto-generated invariant violation test
// Invariant: supportRule
// Details: p3_rostrum1 is occupied but none of its supporting seats [p3_seat1, p3_seat2, p3_seat3] are occupied
// Seed: 12, Players: 3
import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import type { KredAction } from '../../engine/types';

describe('invariant violation: supportRule (seed 12)', () => {
  it('replays the failing game', () => {
    let state = createInitialState({ playerCount: 3 as const, seed: 12 });
    const actions: KredAction[] = [
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "05",
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
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "09",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "REMOVE",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat5",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
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
    "decision": "ACCEPT_BLIND"
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
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "17",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "ASSIST",
        "pieceId": "piece_8",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
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
    "tileId": "23",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_1",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "18",
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT_BLIND"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_0",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p2_seat6"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_8",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_1",
        "fromLocationId": "p2_seat1",
        "toLocationId": "p2_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "03",
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
        "moveType": "ASSIST",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "22",
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
        "moveType": "REMOVE",
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "06",
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
        "moveType": "ASSIST",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_11",
        "fromLocationId": "community",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "07",
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "15",
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
        "moveType": "ASSIST",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_12",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "12",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "REMOVE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat5",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "11",
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "16",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT_BLIND"
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "01",
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
    "tileId": "08",
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
        "moveType": "ASSIST",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
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
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_12",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "19",
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
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "02",
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
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_7",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "13",
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
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat5",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "19",
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
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "14",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "07",
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
        "moveType": "REMOVE",
        "pieceId": "piece_7",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "08",
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
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "23",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "03",
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "04",
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
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "20",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "06",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "12",
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
        "moveType": "ASSIST",
        "pieceId": "piece_7",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "24",
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
    "tileId": "11",
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
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "02",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "REJECT"
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
    "tileId": "09",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "18",
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
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
    "tileId": "21",
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_1",
        "fromLocationId": "p2_rostrum1",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "01",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "17",
    "receiverPlayerId": 2
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
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "15",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "16",
    "receiverPlayerId": 2
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "10",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
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
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "22",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "05",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "05",
    "receiverPlayerId": 2
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat4",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "16",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "ASSIST",
        "pieceId": "piece_8",
        "fromLocationId": "community",
        "toLocationId": "p3_seat5"
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
    "tileId": "01",
    "receiverPlayerId": 2
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
    "tileId": "19",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "14",
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
        "pieceId": "piece_7",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "13",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "06",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "20",
    "receiverPlayerId": 2
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "04",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_7",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "02",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "15",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
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
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "18",
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
        "pieceId": "piece_9",
        "fromLocationId": "p2_seat1",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_0",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "23",
    "receiverPlayerId": 2
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "CHALLENGE"
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_7",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "17",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "24",
    "receiverPlayerId": 2
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
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "08",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_0",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "12",
    "receiverPlayerId": 2
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_0",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "11",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "03",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "09",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "22",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "07",
    "receiverPlayerId": 2
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "CHALLENGE"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "02",
    "receiverPlayerId": 2
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat5",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "07",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p2_rostrum1",
        "toLocationId": "p3_rostrum2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "06",
    "receiverPlayerId": 2
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
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "24",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "17",
    "receiverPlayerId": 2
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
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "05",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "04",
    "receiverPlayerId": 2
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
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "12",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
        "fromLocationId": "p2_seat4",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "19",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "22",
    "receiverPlayerId": 2
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
        "pieceId": "piece_9",
        "fromLocationId": "p2_seat1",
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
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_1",
        "fromLocationId": "p3_rostrum2",
        "toLocationId": "p3_office"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "14",
    "receiverPlayerId": 2
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
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "23",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_rostrum2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "03",
    "receiverPlayerId": 2
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
        "moveType": "ASSIST",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "20",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "13",
    "receiverPlayerId": 2
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
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "10",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "18",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "16",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_office"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "08",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat4",
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
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_0",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "21",
    "receiverPlayerId": 2
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
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "09",
    "receiverPlayerId": 2
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
        "moveType": "REMOVE",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "15",
    "receiverPlayerId": 2
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "06",
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
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "01",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "09",
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
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat1"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "05",
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
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "10",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "14",
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
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "12",
    "receiverPlayerId": 2
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
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "04",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
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
    "tileId": "19",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "03",
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
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "07",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_7",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "08",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "16",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "22",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "18",
    "receiverPlayerId": 2
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
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "13",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "17",
    "receiverPlayerId": 1
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
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "02",
    "receiverPlayerId": 1
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
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "11",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "15",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "21",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "08",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "07",
    "receiverPlayerId": 2
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "20",
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
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat5"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_0",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "23",
    "receiverPlayerId": 2
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
        "moveType": "ADVANCE",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "12",
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
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
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
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p2_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "18",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "11",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
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
        "moveType": "ADVANCE",
        "pieceId": "piece_7",
        "fromLocationId": "community",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "21",
    "receiverPlayerId": 2
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
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "16",
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
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_7",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "09",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "15",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat1",
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
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "22",
    "receiverPlayerId": 2
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
        "moveType": "ASSIST",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "10",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_11",
        "fromLocationId": "community",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "02",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_12",
        "fromLocationId": "community",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "06",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
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
    "playerId": 1,
    "tileId": "17",
    "receiverPlayerId": 3
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 3,
    "decision": "ACCEPT"
  }
];

    for (let i = 0; i < actions.length; i++) {
      try {
        state = gameReducer(state, actions[i]);
      } catch (err) {
        if (i === 482) {
          expect((err as Error).message).toContain('supportRule');
          return;
        }
        throw err;
      }
    }
    expect(true).toBe(true);
  });
});
