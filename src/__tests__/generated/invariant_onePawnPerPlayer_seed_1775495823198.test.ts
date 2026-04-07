// Auto-generated invariant violation test
// Invariant: onePawnPerPlayer
// Details: Player 2 has 2 pawns in their domain (max 1)
// Seed: 1775495823198, Players: 3
import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import type { KredAction } from '../../engine/types';

describe('invariant violation: onePawnPerPlayer (seed 1775495823198)', () => {
  it('replays the failing game', () => {
    let state = createInitialState({ playerCount: 3 as const, seed: 1775495823198 });
    const actions: KredAction[] = [
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_0",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p3_seat4"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
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
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
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
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "24",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
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
    "tileId": "22",
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
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_11",
        "fromLocationId": "community",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "18",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_12",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_13",
        "fromLocationId": "community",
        "toLocationId": "p2_seat6"
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
        "moveType": "REMOVE",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_rostrum1"
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat3",
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
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_7",
        "fromLocationId": "community",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "19",
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
        "moveType": "ASSIST",
        "pieceId": "piece_10",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_12",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
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
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      },
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
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
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
    "tileId": "21",
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
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_13",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_14",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_9",
        "fromLocationId": "p1_rostrum1",
        "toLocationId": "p1_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "11",
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
        "toLocationId": "p1_seat1"
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
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat1"
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_7",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
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
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
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
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "community",
        "toLocationId": "p1_seat6"
      },
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "p2_seat4"
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
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_11",
    "targetLocationId": "p3_seat3"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_7"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_10"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_10"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_11"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_13",
    "targetLocationId": "p1_seat4"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_1"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_rostrum2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_14",
        "fromLocationId": "community",
        "toLocationId": "p1_seat6"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_rostrum2",
        "toLocationId": "p3_rostrum1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_15",
        "fromLocationId": "community",
        "toLocationId": "p3_seat4"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_16",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_rostrum2"
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
    "decision": "CHALLENGE"
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
    "tileId": "16",
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
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_rostrum2"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
      },
      {
        "moveType": "ASSIST",
        "pieceId": "piece_16",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_rostrum2"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "04",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p1_rostrum2"
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
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_15",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "20",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_7",
        "fromLocationId": "p3_rostrum2",
        "toLocationId": "p2_rostrum1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
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
        "moveType": "REMOVE",
        "pieceId": "piece_5",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_9",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
        "moveType": "ASSIST",
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_10",
        "fromLocationId": "p3_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "22",
    "receiverPlayerId": 1
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_15",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_17",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_16",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_rostrum2"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_18",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_17",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "10",
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
        "pieceId": "piece_19",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
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
        "pieceId": "piece_17",
        "fromLocationId": "p1_rostrum1",
        "toLocationId": "p1_office"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_14",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "08",
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
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p1_seat2"
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
    "tileId": "13",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_14",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "05",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ASSIST",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
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
    "playerId": 1,
    "moves": [
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
    "tileId": "03",
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
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat1",
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
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p2_seat6"
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
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_15",
    "targetLocationId": "p2_seat1"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_15",
    "targetLocationId": "p3_seat6"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_rostrum",
    "targetPieceId": "piece_14"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_14",
    "targetLocationId": "p3_office"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_3",
    "targetLocationId": "p2_seat4"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_12"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_20",
        "fromLocationId": "community",
        "toLocationId": "p1_seat5"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p1_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "20",
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
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_0",
        "fromLocationId": "p2_rostrum2",
        "toLocationId": "p1_rostrum1"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_0",
        "fromLocationId": "p1_rostrum1",
        "toLocationId": "p2_rostrum2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_7",
        "fromLocationId": "p2_rostrum1",
        "toLocationId": "p2_office"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "14",
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
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_rostrum1"
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat2",
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
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_12",
        "fromLocationId": "p2_seat5",
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
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_18",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_rostrum1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_15",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p2_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
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
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat3",
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
        "pieceId": "piece_9",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_16",
        "fromLocationId": "p3_rostrum2",
        "toLocationId": "p2_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "10",
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
        "pieceId": "piece_5",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
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
    "tileId": "22",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
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
    "tileId": "04",
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
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "21",
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
        "pieceId": "piece_1",
        "fromLocationId": "community",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p1_seat1",
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
        "pieceId": "piece_8",
        "fromLocationId": "p3_seat6",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
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
    "playerId": 2,
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
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "ASSIST",
        "pieceId": "piece_8",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_0",
        "fromLocationId": "p2_rostrum2",
        "toLocationId": "p2_office"
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
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_8",
        "fromLocationId": "p1_seat2",
        "toLocationId": "community"
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
    "tileId": "09",
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
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_8",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "05",
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
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_14",
        "fromLocationId": "p3_office",
        "toLocationId": "p3_rostrum2"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_13",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_rostrum2"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_9",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_18",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_office"
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
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_16",
        "fromLocationId": "p2_rostrum1",
        "toLocationId": "p2_office"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "06",
    "receiverPlayerId": 1
  },
  {
    "type": "BYSTANDER_DECISION",
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_2",
    "targetLocationId": "p3_seat3"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_3",
    "targetLocationId": "p2_seat5"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_8",
    "targetLocationId": "p2_seat2"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_9",
    "targetLocationId": "p2_seat4"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "promote_office",
    "targetPieceId": "piece_0"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_13",
    "targetLocationId": "p1_seat2"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_13"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "04",
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_18",
        "fromLocationId": "p3_office",
        "toLocationId": "p3_rostrum1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat6"
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
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
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p2_seat5",
        "toLocationId": "community"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
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
    "playerId": 1,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_20",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
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
        "pieceId": "piece_1",
        "fromLocationId": "p3_seat1",
        "toLocationId": "community"
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
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_1",
        "fromLocationId": "community",
        "toLocationId": "p1_seat5"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_8",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_rostrum1"
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
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat3"
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_5",
        "fromLocationId": "p2_rostrum2",
        "toLocationId": "p2_office"
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
        "pieceId": "piece_9",
        "fromLocationId": "p2_seat4",
        "toLocationId": "community"
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
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "07",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p1_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "03",
    "receiverPlayerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_2",
        "fromLocationId": "p1_seat4",
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
        "pieceId": "piece_20",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_2",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "17",
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_rostrum1"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_rostrum1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_14",
        "fromLocationId": "p3_rostrum2",
        "toLocationId": "p3_office"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "10",
    "receiverPlayerId": 3
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_3",
        "fromLocationId": "community",
        "toLocationId": "p1_seat3"
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
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_1",
    "targetLocationId": "p1_seat6"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_2",
    "targetLocationId": "p3_rostrum2"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_2",
    "targetLocationId": "p3_office"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "promote_rostrum",
    "targetPieceId": "piece_6"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_1",
    "targetLocationId": "p1_seat5"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_3",
    "targetLocationId": "p1_seat2"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat2",
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_15",
        "fromLocationId": "p2_seat1",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat3"
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
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
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
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
    "tileId": "17",
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
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
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
    "tileId": "24",
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
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat3"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_20",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
      },
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ASSIST",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_4",
        "fromLocationId": "p1_seat1",
        "toLocationId": "community"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat3"
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
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat3",
        "toLocationId": "p1_seat2"
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
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat2",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_15",
        "fromLocationId": "p2_seat1",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat4"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_20",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "05",
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
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_15",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "01",
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
        "pieceId": "piece_20",
        "fromLocationId": "p1_seat5",
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
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_20",
        "fromLocationId": "community",
        "toLocationId": "p2_seat1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "23",
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p1_seat1",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_15",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_rostrum2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "22",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "p2_seat4"
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
    "tileId": "10",
    "receiverPlayerId": 1
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
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
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "04",
    "receiverPlayerId": 2
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_4",
    "targetLocationId": "p2_seat6"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "promote_office",
    "targetPieceId": "piece_5"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "promote_office",
    "targetPieceId": "piece_17"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_15",
    "targetLocationId": "p3_office"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "promote_seat",
    "targetPieceId": "piece_3"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_2",
        "fromLocationId": "p3_office",
        "toLocationId": "p3_rostrum2"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p1_seat1"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_13",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat6"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_seat5"
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_office"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "17",
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
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_13",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat4"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "p2_seat5"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p2_office",
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
        "pieceId": "piece_9",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_seat2"
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
        "moveType": "REMOVE",
        "pieceId": "piece_9",
        "fromLocationId": "p3_seat2",
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_9",
        "fromLocationId": "community",
        "toLocationId": "p1_seat1"
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
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
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
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_17",
        "fromLocationId": "p1_office",
        "toLocationId": "p1_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "23",
    "receiverPlayerId": 3
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
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_0",
        "fromLocationId": "p2_rostrum2",
        "toLocationId": "p2_office"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat5",
        "toLocationId": "p2_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_rostrum2",
        "toLocationId": "p3_rostrum1"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p1_rostrum2"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_17",
        "fromLocationId": "p1_rostrum1",
        "toLocationId": "p1_office"
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_13",
        "fromLocationId": "p2_seat4",
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat4",
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
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_seat3"
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
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat6",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat4",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "20",
    "receiverPlayerId": 3
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
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_rostrum1"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
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
    "playerId": 2,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "01",
    "receiverPlayerId": 3
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
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
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
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p1_rostrum2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat2",
        "toLocationId": "community"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_rostrum2",
        "toLocationId": "p3_rostrum1"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
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
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
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
    "type": "BYSTANDER_DECISION",
    "playerId": 1,
    "decision": "PASS"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_6",
    "targetLocationId": "p1_rostrum2"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_influence",
    "targetPieceId": "piece_19",
    "targetLocationId": "p3_seat2"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 1
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "promote_rostrum",
    "targetPieceId": "piece_8"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_rostrum2",
        "toLocationId": "p1_office"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
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
    "playerId": 3,
    "decision": "PASS"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 1,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      },
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p2_seat3",
        "toLocationId": "community"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "04",
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
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "REMOVE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat3",
        "toLocationId": "community"
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p1_seat5"
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
        "toLocationId": "p3_seat3"
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
    "decision": "REJECT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p2_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "14",
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "16",
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
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p1_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
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
    "type": "BYSTANDER_DECISION",
    "playerId": 2,
    "decision": "CHALLENGE"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_4",
        "fromLocationId": "community",
        "toLocationId": "p3_seat6"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "09",
    "receiverPlayerId": 3
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "02",
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat5",
        "toLocationId": "community"
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
        "pieceId": "piece_1",
        "fromLocationId": "community",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "p3_seat3"
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
        "pieceId": "piece_1",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p1_seat6"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat4"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 1,
    "tileId": "21",
    "receiverPlayerId": 3
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
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p1_seat5"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
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
    "type": "RECEIVER_DECISION",
    "playerId": 1,
    "decision": "ACCEPT_BLIND"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p1_office",
        "toLocationId": "p1_rostrum2"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_rostrum2",
        "toLocationId": "p3_rostrum1"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 2,
    "tileId": "17",
    "receiverPlayerId": 3
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_6",
        "fromLocationId": "p3_rostrum1",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat3",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_19",
        "fromLocationId": "p3_seat4",
        "toLocationId": "community"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ADVANCE",
        "pieceId": "piece_19",
        "fromLocationId": "community",
        "toLocationId": "p2_seat2"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_11",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat4"
      },
      {
        "moveType": "INFLUENCE",
        "pieceId": "piece_3",
        "fromLocationId": "p3_seat2",
        "toLocationId": "p3_seat3"
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
    "type": "MAKE_MOVES",
    "playerId": 3,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_6",
        "fromLocationId": "p3_seat1",
        "toLocationId": "p3_seat2"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
      }
    ]
  },
  {
    "type": "SELECT_TILE",
    "playerId": 3,
    "tileId": "22",
    "receiverPlayerId": 1
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
        "moveType": "WITHDRAW",
        "pieceId": "piece_1",
        "fromLocationId": "p1_seat6",
        "toLocationId": "community"
      },
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
    "playerId": 1,
    "tileId": "24",
    "receiverPlayerId": 2
  },
  {
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
  },
  {
    "type": "MAKE_MOVES",
    "playerId": 2,
    "moves": [
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_19",
        "fromLocationId": "p2_seat2",
        "toLocationId": "p2_seat3"
      },
      {
        "moveType": "ASSIST",
        "pieceId": "piece_1",
        "fromLocationId": "community",
        "toLocationId": "p3_seat2"
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
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "promote_rostrum",
    "targetPieceId": "piece_8"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_20",
    "targetLocationId": "p2_seat2"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 2,
    "menuItemId": "move_organize",
    "targetPieceId": "piece_19",
    "targetLocationId": "p2_seat4"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 2
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "move_withdraw",
    "targetPieceId": "piece_1",
    "targetLocationId": "community"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 3,
    "menuItemId": "credibility"
  },
  {
    "type": "END_BUREAUCRACY_TURN",
    "playerId": 3
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "credibility"
  },
  {
    "type": "BUREAUCRACY_PURCHASE",
    "playerId": 1,
    "menuItemId": "move_advance",
    "targetPieceId": "piece_1",
    "targetLocationId": "p1_seat3"
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
        "moveType": "INFLUENCE",
        "pieceId": "piece_6",
        "fromLocationId": "p1_seat6",
        "toLocationId": "p3_seat1"
      },
      {
        "moveType": "ORGANIZE",
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat6",
        "toLocationId": "p3_seat5"
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
    "type": "RECEIVER_DECISION",
    "playerId": 2,
    "decision": "ACCEPT_BLIND"
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
        "pieceId": "piece_4",
        "fromLocationId": "p3_seat5",
        "toLocationId": "p3_seat6"
      },
      {
        "moveType": "WITHDRAW",
        "pieceId": "piece_0",
        "fromLocationId": "p2_office",
        "toLocationId": "p2_rostrum2"
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
    "decision": "REJECT"
  }
];

    for (let i = 0; i < actions.length; i++) {
      try {
        state = gameReducer(state, actions[i]);
      } catch (err) {
        if (i === 621) {
          expect((err as Error).message).toContain('onePawnPerPlayer');
          return;
        }
        throw err;
      }
    }
    expect(true).toBe(true);
  });
});
