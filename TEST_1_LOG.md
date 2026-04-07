# KRED Game Log
**Players:** 3 | **Seed:** 1775498643644
**Generated:** 2026-04-06T18:04:03.646Z

---

## Initial State
**Board:**
  - `community`: M:piece_9, M:piece_10, M:piece_11, H:piece_12, H:piece_13, H:piece_14, H:piece_15, H:piece_16, H:piece_17, H:piece_18, H:piece_19, H:piece_20, P:piece_21, P:piece_22, P:piece_23
  - `p1_seat1`: M:piece_0
  - `p1_seat3`: M:piece_1
  - `p1_seat5`: M:piece_2
  - `p2_seat1`: M:piece_3
  - `p2_seat3`: M:piece_4
  - `p2_seat5`: M:piece_5
  - `p3_seat1`: M:piece_6
  - `p3_seat3`: M:piece_7
  - `p3_seat5`: M:piece_8
**Players:**
  - **P1** · Cred: 3 · Hand: [09, 02, 16, 12, 06, 15, 13, 14] · BankDown: [] · BankUp: []
  - **P2** · Cred: 3 · Hand: [11, 03, 20, 21, 24, 04, 22, 01] · BankDown: [] · BankUp: []
  - **P3** · Cred: 3 · Hand: [18, 23, 17, 07, 08, 10, 05, 19] · BankDown: [] · BankUp: []

---

## Actions

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, ADVANCE] do not match any existing tile.
**[1] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_9` from `community` → `p2_seat2`, `ASSIST` piece `piece_10` from `community` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[2] SELECT_TILE** (P2) → Tile `20` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[3] RECEIVER_DECISION** (P1) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[4] MAKE_MOVES** (P1) — `REMOVE` piece `piece_7` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[5] SELECT_TILE** (P1) → Tile `12` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[6] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[7] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, REMOVE, ORGANIZE] do not match any existing tile.
**[8] MAKE_MOVES** (P3) — `ASSIST` piece `piece_7` from `community` → `p1_seat4`, `ADVANCE` piece `piece_9` from `community` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[9] SELECT_TILE** (P3) → Tile `19` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[10] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[11] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[12] MAKE_MOVES** (P1) — `REMOVE` piece `piece_9` from `p3_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[13] SELECT_TILE** (P1) → Tile `15` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[14] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[15] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, ADVANCE] do not match any existing tile.
**[16] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_6` from `p3_seat1` → `p3_seat2`, `ADVANCE` piece `piece_9` from `community` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[17] SELECT_TILE** (P2) → Tile `01` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[18] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[19] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[20] MAKE_MOVES** (P1) — `REMOVE` piece `piece_8` from `p3_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[21] SELECT_TILE** (P1) → Tile `06` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[22] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[23] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[24] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_3` from `p2_seat1` → `p2_seat2`, `WITHDRAW` piece `piece_6` from `p3_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[25] SELECT_TILE** (P3) → Tile `23` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[26] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[27] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[28] MAKE_MOVES** (P1) — `REMOVE` piece `piece_3` from `p2_seat2` → `community`, `ORGANIZE` piece `piece_1` from `p1_seat3` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[29] SELECT_TILE** (P1) → Tile `09` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[30] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[31] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[32] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_5` from `p2_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[33] SELECT_TILE** (P2) → Tile `04` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[34] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[35] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_3` from `community` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[36] SELECT_TILE** (P3) → Tile `10` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[37] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[38] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[39] MAKE_MOVES** (P1) — `ASSIST` piece `piece_6` from `community` → `p2_seat1`, `ORGANIZE` piece `piece_7` from `p1_seat4` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[40] SELECT_TILE** (P1) → Tile `14` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[41] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[42] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[43] MAKE_MOVES** (P2) — `ASSIST` piece `piece_8` from `community` → `p3_seat5`, `WITHDRAW` piece `piece_5` from `p2_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[44] SELECT_TILE** (P2) → Tile `03` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[45] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[46] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[47] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_4` from `p2_seat3` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[48] SELECT_TILE** (P1) → Tile `13` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[49] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[50] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[51] MAKE_MOVES** (P3) — `ASSIST` piece `piece_5` from `community` → `p1_seat4`, `ADVANCE` piece `piece_10` from `community` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[52] SELECT_TILE** (P3) → Tile `08` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[53] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[54] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[55] MAKE_MOVES** (P1) — `REMOVE` piece `piece_9` from `p2_seat6` → `community`, `ADVANCE` piece `piece_0` from `p1_seat1` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[56] SELECT_TILE** (P1) → Tile `16` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[57] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[58] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[59] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_9` from `community` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[60] SELECT_TILE** (P3) → Tile `05` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[61] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[62] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[63] MAKE_MOVES** (P2) — `ASSIST` piece `piece_11` from `community` → `p1_seat6`, `WITHDRAW` piece `piece_6` from `p2_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[64] SELECT_TILE** (P2) → Tile `11` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[65] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[66] MAKE_MOVES** (P3) — `ASSIST` piece `piece_11` from `community` → `p2_seat2`, `ADVANCE` piece `piece_12` from `community` → `p3_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[67] SELECT_TILE** (P3) → Tile `07` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[68] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[69] MAKE_MOVES** (P1) — `ASSIST` piece `piece_13` from `community` → `p2_seat5`, `ORGANIZE` piece `piece_0` from `p1_rostrum1` → `p2_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[70] SELECT_TILE** (P1) → Tile `02` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[71] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[72] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_6` from `p2_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[73] SELECT_TILE** (P2) → Tile `21` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[74] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[75] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[76] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_4` from `p2_seat4` → `p2_seat5`, `WITHDRAW` piece `piece_9` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[77] SELECT_TILE** (P3) → Tile `18` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[78] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[79] MAKE_MOVES** (P2) — `ASSIST` piece `piece_6` from `community` → `p3_seat3`, `WITHDRAW` piece `piece_11` from `p2_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[80] SELECT_TILE** (P2) → Tile `24` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[81] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[82] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, ADVANCE] do not match any existing tile.
**[83] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_0` from `p1_rostrum1` → `p2_rostrum2`, `WITHDRAW` piece `piece_6` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[84] SELECT_TILE** (P3) → Tile `17` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[85] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[86] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_6` from `community` → `p2_seat3`, `INFLUENCE` piece `piece_10` from `p3_seat2` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[87] SELECT_TILE** (P2) → Tile `22` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[88] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[89] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `BUREAUCRACY`

**[90] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_9` → `p3_seat4`
**[91] BUREAUCRACY_PURCHASE** (P3) — item `move_organize` piece `piece_3` → `p2_seat1`
**[92] BUREAUCRACY_PURCHASE** (P3) — item `move_assist` piece `piece_11` → `p2_seat2`
**[93] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_10`
**[94] END_BUREAUCRACY_TURN** (P3)
**[95] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_5`
**[96] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_13` → `p1_seat1`
**[97] END_BUREAUCRACY_TURN** (P1)
**[98] BUREAUCRACY_PURCHASE** (P2) — item `move_advance` piece `piece_14` → `p2_seat6`
**[99] BUREAUCRACY_PURCHASE** (P2) — item `promote_seat` piece `piece_3`
**[100] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[101] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 2 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[102] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_15` from `community` → `p1_seat6`, `INFLUENCE` piece `piece_0` from `p2_rostrum2` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[103] SELECT_TILE** (P1) → Tile `03` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[104] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[105] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[106] MAKE_MOVES** (P2) — `REMOVE` piece `piece_7` from `p1_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[107] SELECT_TILE** (P2) → Tile `05` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[108] RECEIVER_DECISION** (P1) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[109] MAKE_MOVES** (P1) — `REMOVE` piece `piece_8` from `p3_seat5` → `community`, `ORGANIZE` piece `piece_0` from `p1_rostrum1` → `p2_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[110] SELECT_TILE** (P1) → Tile `19` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[111] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[112] MAKE_MOVES** (P2) — `REMOVE` piece `piece_9` from `p3_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[113] SELECT_TILE** (P2) → Tile `17` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[114] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[115] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[116] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_1` from `p1_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[117] SELECT_TILE** (P1) → Tile `07` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[118] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[119] MAKE_MOVES** (P2) — `REMOVE` piece `piece_7` from `p1_seat3` → `community`, `ORGANIZE` piece `piece_4` from `p2_seat5` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[120] SELECT_TILE** (P2) → Tile `15` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[121] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[122] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[123] MAKE_MOVES** (P3) — `ASSIST` piece `piece_1` from `community` → `p2_seat5`, `WITHDRAW` piece `piece_10` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[124] SELECT_TILE** (P3) → Tile `04` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[125] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[126] MAKE_MOVES** (P1) — `ASSIST` piece `piece_7` from `community` → `p3_seat5`, `WITHDRAW` piece `piece_5` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[127] SELECT_TILE** (P1) → Tile `08` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[128] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[129] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_12` from `p3_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[130] SELECT_TILE** (P3) → Tile `16` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[131] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[132] MAKE_MOVES** (P1) — `REMOVE` piece `piece_1` from `p2_seat5` → `community`, `ORGANIZE` piece `piece_13` from `p1_seat1` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[133] SELECT_TILE** (P1) → Tile `10` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[134] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[135] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p1_seat5` → `community`, `ORGANIZE` piece `piece_0` from `p2_rostrum2` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[136] SELECT_TILE** (P2) → Tile `14` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[137] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[138] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST, ASSIST, ADVANCE] do not match any existing tile.
**[139] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_14` from `p2_seat6` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[140] SELECT_TILE** (P3) → Tile `06` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[141] RECEIVER_DECISION** (P1) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[142] MAKE_MOVES** (P1) — `ASSIST` piece `piece_1` from `community` → `p3_seat4`, `WITHDRAW` piece `piece_15` from `p1_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[143] SELECT_TILE** (P1) → Tile `23` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[144] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[145] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p1_seat5` → `community`, `ADVANCE` piece `piece_3` from `p2_seat1` → `p2_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[146] SELECT_TILE** (P2) → Tile `09` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[147] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[148] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_3` from `p2_rostrum1` → `p3_rostrum2`, `ADVANCE` piece `piece_2` from `community` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[149] SELECT_TILE** (P1) → Tile `01` played to P2
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, INFLUENCE, REMOVE] do not match any existing tile.
**[150] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_3` from `p3_rostrum2` → `p2_rostrum1`, `WITHDRAW` piece `piece_6` from `p2_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[151] SELECT_TILE** (P2) → Tile `18` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[152] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[153] MAKE_MOVES** (P3) — `ASSIST` piece `piece_6` from `community` → `p2_seat1`, `ORGANIZE` piece `piece_1` from `p3_seat4` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[154] SELECT_TILE** (P3) → Tile `11` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[155] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ASSIST, INFLUENCE] do not match any existing tile.
**[156] MAKE_MOVES** (P1) — `ORGANIZE` piece `piece_13` from `p1_seat2` → `p1_seat1`, `ASSIST` piece `piece_7` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[157] SELECT_TILE** (P1) → Tile `20` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[158] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_1` from `p3_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[159] SELECT_TILE** (P3) → Tile `24` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[160] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[161] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p1_seat5` → `community`, `ADVANCE` piece `piece_1` from `community` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[162] SELECT_TILE** (P2) → Tile `02` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[163] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ADVANCE, ADVANCE, ADVANCE] do not match any existing tile.
**[164] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_13` from `p1_seat1` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[165] SELECT_TILE** (P3) → Tile `12` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[166] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ADVANCE, REMOVE, INFLUENCE] do not match any existing tile.
**[167] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_2` from `community` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[168] SELECT_TILE** (P3) → Tile `21` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[169] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[170] MAKE_MOVES** (P3) — `ASSIST` piece `piece_8` from `community` → `p1_seat5`, `ORGANIZE` piece `piece_2` from `p3_seat3` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[171] SELECT_TILE** (P3) → Tile `13` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[172] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[173] MAKE_MOVES** (P3) — `ASSIST` piece `piece_9` from `community` → `p1_seat3`, `WITHDRAW` piece `piece_2` from `p3_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[174] SELECT_TILE** (P3) → Tile `22` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[175] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `BUREAUCRACY`

**[176] BUREAUCRACY_PURCHASE** (P2) — item `promote_seat` piece `piece_7`
**[177] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[178] END_BUREAUCRACY_TURN** (P2)
**[179] BUREAUCRACY_PURCHASE** (P1) — item `move_assist` piece `piece_2` → `p3_seat5`
**[180] BUREAUCRACY_PURCHASE** (P1) — item `move_organize` piece `piece_13` → `p1_seat1`
**[181] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_13`
**[182] END_BUREAUCRACY_TURN** (P1)
**[183] BUREAUCRACY_PURCHASE** (P3) — item `move_influence` piece `piece_9` → `p1_seat2`
**[184] END_BUREAUCRACY_TURN** (P3)
### 🗳️ Campaign 3 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[185] MAKE_MOVES** (P2) — `ASSIST` piece `piece_10` from `community` → `p3_seat1`, `WITHDRAW` piece `piece_14` from `p2_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[186] SELECT_TILE** (P2) → Tile `22` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[187] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ADVANCE] do not match any existing tile.
**[188] MAKE_MOVES** (P1) — `ORGANIZE` piece `piece_8` from `p1_seat5` → `p1_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[189] SELECT_TILE** (P1) → Tile `11` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[190] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[191] MAKE_MOVES** (P2) — `ASSIST` piece `piece_12` from `community` → `p3_seat6`, `WITHDRAW` piece `piece_6` from `p2_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[192] SELECT_TILE** (P2) → Tile `01` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[193] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST, INFLUENCE] do not match any existing tile.
**[194] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_10` from `p3_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[195] SELECT_TILE** (P3) → Tile `08` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[196] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[197] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ADVANCE] do not match any existing tile.
**[198] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_3` from `p2_rostrum1` → `p3_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[199] SELECT_TILE** (P1) → Tile `06` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[200] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[201] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_8` from `p1_seat6` → `p1_seat5`, `ADVANCE` piece `piece_6` from `community` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[202] SELECT_TILE** (P2) → Tile `19` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[203] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[204] MAKE_MOVES** (P3) — `REMOVE` piece `piece_1` from `p2_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[205] SELECT_TILE** (P3) → Tile `02` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[206] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[207] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_2` from `p3_seat5` → `p3_seat4`, `ADVANCE` piece `piece_1` from `community` → `p2_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[208] SELECT_TILE** (P2) → Tile `23` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[209] RECEIVER_DECISION** (P1) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[210] MAKE_MOVES** (P1) — `ORGANIZE` piece `piece_13` from `p1_seat1` → `p2_seat6`, `ASSIST` piece `piece_1` from `community` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[211] SELECT_TILE** (P1) → Tile `12` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[212] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_2` from `p3_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[213] SELECT_TILE** (P3) → Tile `18` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[214] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[215] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_12` from `p3_seat6` → `p3_seat5`, `ADVANCE` piece `piece_2` from `community` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[216] SELECT_TILE** (P2) → Tile `24` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[217] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[218] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_8` from `p1_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[219] SELECT_TILE** (P1) → Tile `17` played to P2
> **Phase:** `SELECTING_TILE` → `MOVING`

**[220] MAKE_MOVES** (P2) — `ASSIST` piece `piece_6` from `community` → `p1_seat3`, `ADVANCE` piece `piece_8` from `community` → `p2_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[221] SELECT_TILE** (P2) → Tile `03` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[222] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST] do not match any existing tile.
**[223] MAKE_MOVES** (P3) — `REMOVE` piece `piece_9` from `p1_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[224] SELECT_TILE** (P3) → Tile `15` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[225] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [REMOVE, INFLUENCE, INFLUENCE] do not match any existing tile.
**[226] MAKE_MOVES** (P2) — `ASSIST` piece `piece_6` from `community` → `p3_seat1`, `ADVANCE` piece `piece_8` from `community` → `p2_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[227] SELECT_TILE** (P2) → Tile `07` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[228] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[229] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_9` from `community` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[230] SELECT_TILE** (P1) → Tile `04` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[231] MAKE_MOVES** (P3) — `ASSIST` piece `piece_10` from `community` → `p1_seat6`, `ORGANIZE` piece `piece_3` from `p3_rostrum2` → `p2_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[232] SELECT_TILE** (P3) → Tile `14` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[233] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[234] MAKE_MOVES** (P2) — `REMOVE` piece `piece_1` from `p3_seat4` → `community`, `ORGANIZE` piece `piece_13` from `p2_seat6` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[235] SELECT_TILE** (P2) → Tile `10` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[236] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[237] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_6` from `p3_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[238] SELECT_TILE** (P3) → Tile `20` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[239] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ASSIST, ADVANCE, REMOVE] do not match any existing tile.
**[240] MAKE_MOVES** (P1) — `REMOVE` piece `piece_2` from `p2_seat5` → `community`, `ORGANIZE` piece `piece_5` from `p1_seat4` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[241] SELECT_TILE** (P1) → Tile `16` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[242] MAKE_MOVES** (P1) — `ASSIST` piece `piece_1` from `community` → `p3_seat4`, `ORGANIZE` piece `piece_5` from `p1_seat3` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[243] SELECT_TILE** (P1) → Tile `13` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ASSIST, ORGANIZE, ASSIST] do not match any existing tile.
**[244] MAKE_MOVES** (P1) — `ASSIST` piece `piece_2` from `community` → `p3_seat1`, `ADVANCE` piece `piece_6` from `community` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[245] SELECT_TILE** (P1) → Tile `21` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[246] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_14` from `community` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[247] SELECT_TILE** (P1) → Tile `05` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[248] MAKE_MOVES** (P1) — `REMOVE` piece `piece_11` from `p2_seat2` → `community`, `ORGANIZE` piece `piece_13` from `p1_seat1` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[249] SELECT_TILE** (P1) → Tile `09` played to P3
> **Phase:** `SELECTING_TILE` → `BUREAUCRACY`

**[250] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_10`
**[251] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_14` → `p1_rostrum2`
**[252] BUREAUCRACY_PURCHASE** (P1) — item `move_remove` piece `piece_1` → `community`
**[253] END_BUREAUCRACY_TURN** (P1)
**[254] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_1` → `p3_seat3`
**[255] BUREAUCRACY_PURCHASE** (P3) — item `move_influence` piece `piece_9` → `p1_seat1`
**[256] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[257] END_BUREAUCRACY_TURN** (P3)
**[258] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[259] BUREAUCRACY_PURCHASE** (P2) — item `move_advance` piece `piece_3` → `p2_office`
**[260] BUREAUCRACY_PURCHASE** (P2) — item `move_organize` piece `piece_8` → `p2_seat2`
**[261] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[262] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 4 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[263] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_1` from `p3_seat3` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[264] SELECT_TILE** (P3) → Tile `21` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[265] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[266] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[267] MAKE_MOVES** (P1) — `ASSIST` piece `piece_11` from `community` → `p3_seat2`, `WITHDRAW` piece `piece_9` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[268] SELECT_TILE** (P1) → Tile `23` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[269] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[270] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[271] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_14` from `p1_rostrum2` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[272] SELECT_TILE** (P2) → Tile `02` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[273] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[274] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [REMOVE, REMOVE, INFLUENCE] do not match any existing tile.
**[275] MAKE_MOVES** (P1) — `ASSIST` piece `piece_9` from `community` → `p2_seat1`, `WITHDRAW` piece `piece_6` from `p1_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[276] SELECT_TILE** (P1) → Tile `08` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[277] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[278] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST] do not match any existing tile.
**[279] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_5` from `p1_seat4` → `p1_seat5`, `ADVANCE` piece `piece_6` from `community` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[280] SELECT_TILE** (P3) → Tile `04` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[281] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[282] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[283] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_12` from `p3_seat5` → `p3_seat6`, `WITHDRAW` piece `piece_9` from `p2_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[284] SELECT_TILE** (P2) → Tile `18` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[285] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[286] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[287] MAKE_MOVES** (P3) — `REMOVE` piece `piece_4` from `p2_seat4` → `community`, `ORGANIZE` piece `piece_12` from `p3_seat6` → `p2_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[288] SELECT_TILE** (P3) → Tile `01` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[289] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[290] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[291] MAKE_MOVES** (P1) — `ASSIST` piece `piece_4` from `community` → `p2_seat4`, `WITHDRAW` piece `piece_5` from `p1_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[292] SELECT_TILE** (P1) → Tile `22` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[293] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[294] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[295] MAKE_MOVES** (P3) — `REMOVE` piece `piece_4` from `p2_seat4` → `community`, `ORGANIZE` piece `piece_1` from `p3_seat4` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[296] SELECT_TILE** (P3) → Tile `12` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[297] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[298] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_14` from `p3_rostrum1` → `p1_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[299] SELECT_TILE** (P2) → Tile `06` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[300] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[301] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_9` from `community` → `p3_seat5`, `ASSIST` piece `piece_5` from `community` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[302] SELECT_TILE** (P3) → Tile `16` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[303] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[304] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[305] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_10` from `p1_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[306] SELECT_TILE** (P1) → Tile `20` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[307] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[308] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_2` from `p3_seat1` → `p1_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[309] SELECT_TILE** (P3) → Tile `13` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[310] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[311] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[312] MAKE_MOVES** (P2) — `ASSIST` piece `piece_15` from `community` → `p1_seat1`, `ORGANIZE` piece `piece_12` from `p2_seat1` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[313] SELECT_TILE** (P2) → Tile `14` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[314] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[315] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_9` from `p3_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[316] SELECT_TILE** (P3) → Tile `19` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[317] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[318] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[319] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_12` from `p3_seat6` → `p3_seat5`, `WITHDRAW` piece `piece_3` from `p2_office` → `p2_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[320] SELECT_TILE** (P2) → Tile `15` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[321] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE] do not match any existing tile.
**[322] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_14` from `p3_rostrum1` → `p1_rostrum2`, `ASSIST` piece `piece_9` from `community` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[323] SELECT_TILE** (P3) → Tile `05` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[324] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[325] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[326] MAKE_MOVES** (P1) — `REMOVE` piece `piece_8` from `p2_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[327] SELECT_TILE** (P1) → Tile `24` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[328] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[329] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_8` from `community` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[330] SELECT_TILE** (P3) → Tile `09` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[331] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[332] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_5` from `p1_seat4` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[333] SELECT_TILE** (P2) → Tile `11` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[334] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[335] MAKE_MOVES** (P1) — `ASSIST` piece `piece_8` from `community` → `p2_seat1`, `ADVANCE` piece `piece_16` from `community` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[336] SELECT_TILE** (P1) → Tile `07` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[337] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[338] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_16` from `p1_seat3` → `p1_seat2`, `ADVANCE` piece `piece_17` from `community` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[339] SELECT_TILE** (P3) → Tile `10` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[340] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[341] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_12` from `p3_seat5` → `p3_seat6`, `WITHDRAW` piece `piece_13` from `p2_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[342] SELECT_TILE** (P2) → Tile `17` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[343] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[344] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_7` from `p2_seat3` → `p2_seat2`, `ADVANCE` piece `piece_17` from `community` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[345] SELECT_TILE** (P3) → Tile `03` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[346] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[347] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `BUREAUCRACY`

**[348] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[349] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[350] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_17` → `p3_rostrum2`
**[351] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_1`
**[352] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_12`
**[353] BUREAUCRACY_PURCHASE** (P3) — item `move_organize` piece `piece_12` → `p3_seat5`
**[354] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_6`
**[355] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_11`
**[356] END_BUREAUCRACY_TURN** (P3)
**[357] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_16`
**[358] END_BUREAUCRACY_TURN** (P1)
**[359] BUREAUCRACY_PURCHASE** (P2) — item `move_assist` piece `piece_18` → `p1_seat4`
**[360] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 5 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ASSIST, ADVANCE, INFLUENCE] do not match any existing tile.
**[361] MAKE_MOVES** (P2) — `ASSIST` piece `piece_19` from `community` → `p3_seat6`, `ORGANIZE` piece `piece_9` from `p2_seat5` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[362] SELECT_TILE** (P2) → Tile `19` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[363] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[364] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_11` from `p3_seat2` → `p3_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[365] SELECT_TILE** (P3) → Tile `07` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[366] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[367] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, INFLUENCE, ADVANCE] do not match any existing tile.
**[368] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_4` from `p2_seat4` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[369] SELECT_TILE** (P2) → Tile `04` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[370] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[371] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[372] MAKE_MOVES** (P3) — `ASSIST` piece `piece_19` from `community` → `p1_seat2`, `ADVANCE` piece `piece_20` from `community` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[373] SELECT_TILE** (P3) → Tile `24` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[374] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[375] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[376] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_15` from `p1_seat1` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[377] SELECT_TILE** (P1) → Tile `11` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[378] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[379] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE, ORGANIZE] do not match any existing tile.
**[380] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p1_seat6` → `community`, `ORGANIZE` piece `piece_4` from `p2_seat3` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[381] SELECT_TILE** (P2) → Tile `12` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[382] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[383] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_4` from `p2_seat3` → `p2_seat4`, `WITHDRAW` piece `piece_6` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[384] SELECT_TILE** (P3) → Tile `20` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[385] RECEIVER_DECISION** (P1) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[386] MAKE_MOVES** (P1) — `REMOVE` piece `piece_8` from `p2_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[387] SELECT_TILE** (P1) → Tile `05` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[388] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[389] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_11` from `p3_seat1` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[390] SELECT_TILE** (P3) → Tile `17` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[391] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[392] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[393] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p1_seat6` → `community`, `ORGANIZE` piece `piece_4` from `p2_seat3` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[394] SELECT_TILE** (P2) → Tile `10` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[395] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[396] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[397] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_2` from `community` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[398] SELECT_TILE** (P3) → Tile `14` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[399] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[400] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_18` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[401] SELECT_TILE** (P1) → Tile `02` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[402] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[403] MAKE_MOVES** (P2) — `REMOVE` piece `piece_2` from `p3_seat2` → `community`, `ORGANIZE` piece `piece_7` from `p2_seat2` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[404] SELECT_TILE** (P2) → Tile `23` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[405] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[406] MAKE_MOVES** (P3) — `REMOVE` piece `piece_4` from `p2_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[407] SELECT_TILE** (P3) → Tile `18` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[408] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [WITHDRAW, ADVANCE, ADVANCE] do not match any existing tile.
**[409] MAKE_MOVES** (P2) — `ASSIST` piece `piece_18` from `community` → `p1_seat4`, `ORGANIZE` piece `piece_9` from `p2_seat5` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[410] SELECT_TILE** (P2) → Tile `09` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[411] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[412] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[413] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_6` from `p3_seat3` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[414] SELECT_TILE** (P3) → Tile `08` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[415] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[416] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_5` from `p1_seat5` → `p1_seat6`, `ADVANCE` piece `piece_3` from `p2_rostrum1` → `p2_office`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[417] SELECT_TILE** (P2) → Tile `13` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[418] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[419] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE] do not match any existing tile.
**[420] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_6` from `p3_rostrum1` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[421] SELECT_TILE** (P3) → Tile `22` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[422] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[423] MAKE_MOVES** (P1) — `REMOVE` piece `piece_9` from `p2_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[424] SELECT_TILE** (P1) → Tile `21` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[425] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[426] MAKE_MOVES** (P3) — `REMOVE` piece `piece_8` from `p2_seat1` → `community`, `ORGANIZE` piece `piece_17` from `p3_rostrum2` → `p2_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[427] SELECT_TILE** (P3) → Tile `06` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[428] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[429] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_8` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[430] SELECT_TILE** (P2) → Tile `03` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[431] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[432] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[433] MAKE_MOVES** (P1) — `REMOVE` piece `piece_8` from `p2_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[434] SELECT_TILE** (P1) → Tile `01` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[435] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST] do not match any existing tile.
**[436] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_1` from `p3_seat4` → `p3_rostrum2`, `ASSIST` piece `piece_8` from `community` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[437] SELECT_TILE** (P3) → Tile `15` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[438] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[439] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_15` from `p1_rostrum1` → `p1_office`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[440] SELECT_TILE** (P1) → Tile `16` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[441] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `BUREAUCRACY`

**[442] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_9` → `p1_seat1`
**[443] BUREAUCRACY_PURCHASE** (P1) — item `move_influence` piece `piece_4` → `p2_seat3`
**[444] END_BUREAUCRACY_TURN** (P1)
**[445] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_11` → `p3_rostrum1`
**[446] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_11` → `p3_office`
**[447] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[448] END_BUREAUCRACY_TURN** (P3)
**[449] BUREAUCRACY_PURCHASE** (P2) — item `move_advance` piece `piece_0` → `p2_office`
**[450] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 6 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[451] MAKE_MOVES** (P1) — `REMOVE` piece `piece_2` from `p3_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[452] SELECT_TILE** (P1) → Tile `22` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[453] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[454] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_18` from `p1_seat4` → `p1_seat5`, `WITHDRAW` piece `piece_4` from `p2_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[455] SELECT_TILE** (P2) → Tile `06` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[456] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[457] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_2` from `community` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[458] SELECT_TILE** (P3) → Tile `05` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[459] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE, INFLUENCE] do not match any existing tile.
**[460] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_4` from `p2_seat3` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[461] SELECT_TILE** (P2) → Tile `18` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[462] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[463] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[464] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_6` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[465] SELECT_TILE** (P3) → Tile `09` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[466] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE, INFLUENCE] do not match any existing tile.
**[467] MAKE_MOVES** (P2) — `ASSIST` piece `piece_6` from `community` → `p1_seat5`, `ORGANIZE` piece `piece_8` from `p2_seat5` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[468] SELECT_TILE** (P2) → Tile `07` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[469] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[470] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[471] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_20` from `p3_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[472] SELECT_TILE** (P3) → Tile `16` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[473] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW] do not match any existing tile.
**[474] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_2` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[475] SELECT_TILE** (P2) → Tile `08` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[476] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[477] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[478] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_4` from `p2_seat4` → `p2_seat3`, `ADVANCE` piece `piece_9` from `p1_seat1` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[479] SELECT_TILE** (P1) → Tile `03` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[480] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[481] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_2` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[482] SELECT_TILE** (P3) → Tile `01` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[483] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[484] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_19` from `p1_seat2` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[485] SELECT_TILE** (P2) → Tile `17` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[486] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[487] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[488] MAKE_MOVES** (P3) — `REMOVE` piece `piece_8` from `p2_seat6` → `community`, `ORGANIZE` piece `piece_12` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[489] SELECT_TILE** (P3) → Tile `19` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[490] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ASSIST, ORGANIZE, ORGANIZE] do not match any existing tile.
**[491] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_2` from `community` → `p2_seat5`, `INFLUENCE` piece `piece_19` from `p1_seat1` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[492] SELECT_TILE** (P2) → Tile `02` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[493] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[494] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW] do not match any existing tile.
**[495] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_6` from `p1_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[496] SELECT_TILE** (P1) → Tile `15` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[497] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[498] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_19` from `p1_seat2` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[499] SELECT_TILE** (P2) → Tile `11` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[500] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[501] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[502] MAKE_MOVES** (P1) — `ASSIST` piece `piece_6` from `community` → `p2_seat4`, `WITHDRAW` piece `piece_18` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[503] SELECT_TILE** (P1) → Tile `14` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[504] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[505] MAKE_MOVES** (P3) — `REMOVE` piece `piece_2` from `p2_seat5` → `community`, `ORGANIZE` piece `piece_12` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[506] SELECT_TILE** (P3) → Tile `23` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[507] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[508] MAKE_MOVES** (P1) — `ASSIST` piece `piece_2` from `community` → `p2_seat5`, `WITHDRAW` piece `piece_19` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[509] SELECT_TILE** (P1) → Tile `20` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[510] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[511] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_9` from `p1_rostrum1` → `p2_rostrum2`, `ADVANCE` piece `piece_18` from `community` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[512] SELECT_TILE** (P3) → Tile `04` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[513] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[514] MAKE_MOVES** (P1) — `ASSIST` piece `piece_19` from `community` → `p3_seat5`, `WITHDRAW` piece `piece_15` from `p1_office` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[515] SELECT_TILE** (P1) → Tile `24` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[516] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, REMOVE, INFLUENCE] do not match any existing tile.
**[517] MAKE_MOVES** (P3) — `REMOVE` piece `piece_2` from `p2_seat5` → `community`, `ORGANIZE` piece `piece_18` from `p3_seat3` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[518] SELECT_TILE** (P3) → Tile `12` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[519] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[520] MAKE_MOVES** (P3) — `REMOVE` piece `piece_8` from `p2_seat6` → `community`, `ORGANIZE` piece `piece_18` from `p3_seat2` → `p3_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[521] SELECT_TILE** (P3) → Tile `10` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[522] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[523] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_12` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[524] SELECT_TILE** (P3) → Tile `13` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[525] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[526] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_11` from `p3_office` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[527] SELECT_TILE** (P3) → Tile `21` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[528] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `BUREAUCRACY`

**[529] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_2` → `p3_seat2`
**[530] BUREAUCRACY_PURCHASE** (P3) — item `move_organize` piece `piece_12` → `p3_seat4`
**[531] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_11` → `p3_office`
**[532] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_2`
**[533] END_BUREAUCRACY_TURN** (P3)
**[534] END_BUREAUCRACY_TURN** (P2)
**[535] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_8` → `p1_seat4`
**[536] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_15` → `p1_office`
**[537] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_8`
**[538] END_BUREAUCRACY_TURN** (P1)
### 🗳️ Campaign 7 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE, INFLUENCE] do not match any existing tile.
**[539] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_8` from `p1_seat4` → `p1_seat5`, `WITHDRAW` piece `piece_2` from `p3_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[540] SELECT_TILE** (P3) → Tile `14` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[541] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[542] MAKE_MOVES** (P2) — `ASSIST` piece `piece_2` from `community` → `p1_seat2`, `ADVANCE` piece `piece_9` from `p2_rostrum2` → `p2_office`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[543] SELECT_TILE** (P2) → Tile `10` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[544] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[545] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[546] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_7` from `p2_seat2` → `p2_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[547] SELECT_TILE** (P1) → Tile `11` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[548] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[549] MAKE_MOVES** (P3) — `REMOVE` piece `piece_4` from `p2_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[550] SELECT_TILE** (P3) → Tile `18` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[551] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[552] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_18` from `p3_seat1` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[553] SELECT_TILE** (P1) → Tile `23` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[554] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[555] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_12` from `p3_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[556] SELECT_TILE** (P3) → Tile `17` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[557] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[558] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_4` from `community` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[559] SELECT_TILE** (P1) → Tile `02` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[560] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[561] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_19` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[562] SELECT_TILE** (P3) → Tile `24` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[563] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[564] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_0` from `p2_office` → `p2_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[565] SELECT_TILE** (P2) → Tile `19` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[566] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[567] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE] do not match any existing tile.
**[568] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_5` from `p1_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[569] SELECT_TILE** (P1) → Tile `04` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[570] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[571] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_17` from `p2_rostrum1` → `p2_office`, `INFLUENCE` piece `piece_19` from `p3_seat4` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[572] SELECT_TILE** (P2) → Tile `15` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[573] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[574] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[575] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_2` from `p1_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[576] SELECT_TILE** (P1) → Tile `08` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[577] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[578] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_19` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[579] SELECT_TILE** (P3) → Tile `06` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[580] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[581] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_15` from `p1_office` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[582] SELECT_TILE** (P1) → Tile `13` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[583] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE] do not match any existing tile.
**[584] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_19` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[585] SELECT_TILE** (P3) → Tile `07` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[586] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[587] MAKE_MOVES** (P2) — `REMOVE` piece `piece_4` from `p1_seat4` → `community`, `ORGANIZE` piece `piece_7` from `p2_seat1` → `p2_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[588] SELECT_TILE** (P2) → Tile `16` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[589] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[590] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_18` from `p3_seat2` → `p3_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[591] SELECT_TILE** (P3) → Tile `03` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[592] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE, REMOVE] do not match any existing tile.
**[593] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_14` from `p1_rostrum2` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[594] SELECT_TILE** (P2) → Tile `09` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[595] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[596] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[597] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_19` from `p3_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[598] SELECT_TILE** (P3) → Tile `20` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[599] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[600] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_7` from `p2_seat1` → `p2_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[601] SELECT_TILE** (P2) → Tile `22` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[602] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[603] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[604] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_7` from `p2_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[605] SELECT_TILE** (P2) → Tile `21` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[606] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[607] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ADVANCE] do not match any existing tile.
**[608] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_14` from `p3_rostrum1` → `p1_rostrum2`, `ADVANCE` piece `piece_7` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[609] SELECT_TILE** (P2) → Tile `01` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[610] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[611] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ADVANCE, INFLUENCE] do not match any existing tile.
**[612] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_7` from `community` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[613] SELECT_TILE** (P2) → Tile `05` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[614] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[615] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[616] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_7` from `p2_seat5` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[617] SELECT_TILE** (P2) → Tile `12` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[618] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[619] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `BUREAUCRACY`

**[620] BUREAUCRACY_PURCHASE** (P1) — item `move_influence` piece `piece_14` → `p1_rostrum2`
**[621] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_14` → `p1_office`
**[622] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_4`
**[623] BUREAUCRACY_PURCHASE** (P1) — item `credibility`
**[624] END_BUREAUCRACY_TURN** (P1)
**[625] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_18`
**[626] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_19` → `p3_seat2`
**[627] BUREAUCRACY_PURCHASE** (P3) — item `move_influence` piece `piece_2` → `p1_seat1`
**[628] END_BUREAUCRACY_TURN** (P3)
**[629] BUREAUCRACY_PURCHASE** (P2) — item `move_organize` piece `piece_6` → `p2_seat5`
**[630] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[631] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[632] BUREAUCRACY_PURCHASE** (P2) — item `move_organize` piece `piece_6` → `p2_seat4`
**[633] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 8 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[634] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_6` from `p2_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[635] SELECT_TILE** (P2) → Tile `07` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[636] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[637] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, WITHDRAW, ADVANCE] do not match any existing tile.
**[638] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_11` from `p3_office` → `p3_rostrum1`, `INFLUENCE` piece `piece_2` from `p1_seat1` → `p1_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[639] SELECT_TILE** (P3) → Tile `11` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[640] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[641] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW] do not match any existing tile.
**[642] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_6` from `p2_seat4` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[643] SELECT_TILE** (P2) → Tile `14` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[644] BYSTANDER_DECISION** (P1) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[645] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_11` from `p3_office` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[646] SELECT_TILE** (P3) → Tile `23` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[647] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[648] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_6` from `p2_seat3` → `p2_seat2`, `WITHDRAW` piece `piece_5` from `p1_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[649] SELECT_TILE** (P1) → Tile `15` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[650] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_5` from `community` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[651] SELECT_TILE** (P3) → Tile `21` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[652] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [WITHDRAW, ORGANIZE] do not match any existing tile.
**[653] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_1` from `p3_rostrum2` → `p2_rostrum1`, `WITHDRAW` piece `piece_4` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[654] SELECT_TILE** (P1) → Tile `06` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE] do not match any existing tile.
**[655] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_2` from `p1_seat1` → `p1_seat2`, `ADVANCE` piece `piece_4` from `community` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[656] SELECT_TILE** (P3) → Tile `01` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[657] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[658] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_2` from `p1_seat2` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[659] SELECT_TILE** (P2) → Tile `20` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[660] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE] do not match any existing tile.
**[661] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_11` from `p3_rostrum1` → `p1_rostrum2`, `WITHDRAW` piece `piece_2` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[662] SELECT_TILE** (P1) → Tile `12` played to P2
> **Phase:** `SELECTING_TILE` → `MOVING`

**[663] MAKE_MOVES** (P2) — `ASSIST` piece `piece_2` from `community` → `p1_seat4`, `WITHDRAW` piece `piece_0` from `p2_rostrum2` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[664] SELECT_TILE** (P2) → Tile `04` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[665] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[666] MAKE_MOVES** (P3) — `REMOVE` piece `piece_0` from `p2_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[667] SELECT_TILE** (P3) → Tile `05` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[668] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[669] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_2` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[670] SELECT_TILE** (P1) → Tile `18` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[671] MAKE_MOVES** (P3) — `ASSIST` piece `piece_0` from `community` → `p2_seat4`, `ADVANCE` piece `piece_19` from `p3_seat2` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[672] SELECT_TILE** (P3) → Tile `13` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[673] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE, ADVANCE] do not match any existing tile.
**[674] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_15` from `p1_rostrum1` → `p2_rostrum2`, `ADVANCE` piece `piece_2` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[675] SELECT_TILE** (P2) → Tile `03` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[676] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [WITHDRAW, ADVANCE] do not match any existing tile.
**[677] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_5` from `p3_seat3` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[678] SELECT_TILE** (P3) → Tile `09` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[679] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE, INFLUENCE] do not match any existing tile.
**[680] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_2` from `p2_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[681] SELECT_TILE** (P2) → Tile `24` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[682] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[683] MAKE_MOVES** (P3) — `REMOVE` piece `piece_0` from `p2_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[684] SELECT_TILE** (P3) → Tile `08` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[685] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[686] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_4` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[687] SELECT_TILE** (P1) → Tile `10` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[688] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_4` from `p3_seat3` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[689] SELECT_TILE** (P3) → Tile `16` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[690] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ADVANCE] do not match any existing tile.
**[691] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_14` from `p1_office` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[692] SELECT_TILE** (P1) → Tile `17` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ASSIST] do not match any existing tile.
**[693] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_0` from `community` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[694] SELECT_TILE** (P3) → Tile `02` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[695] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE] do not match any existing tile.
**[696] MAKE_MOVES** (P1) — `ASSIST` piece `piece_2` from `community` → `p2_seat4`, `WITHDRAW` piece `piece_11` from `p1_rostrum2` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[697] SELECT_TILE** (P1) → Tile `22` played to P2
> **Phase:** `SELECTING_TILE` → `MOVING`

**[698] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_8` from `p1_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[699] SELECT_TILE** (P1) → Tile `19` played to P3
> **Phase:** `SELECTING_TILE` → `BUREAUCRACY`

**[700] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_4` → `p3_rostrum2`
**[701] BUREAUCRACY_PURCHASE** (P3) — item `move_advance` piece `piece_19` → `p3_office`
**[702] BUREAUCRACY_PURCHASE** (P3) — item `move_influence` piece `piece_2` → `p2_seat5`
**[703] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[704] END_BUREAUCRACY_TURN** (P3)
**[705] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_8` → `p1_seat1`
**[706] END_BUREAUCRACY_TURN** (P1)
**[707] BUREAUCRACY_PURCHASE** (P2) — item `move_advance` piece `piece_15` → `p2_office`
**[708] BUREAUCRACY_PURCHASE** (P2) — item `promote_seat` piece `piece_6`
**[709] BUREAUCRACY_PURCHASE** (P2) — item `credibility`
**[710] END_BUREAUCRACY_TURN** (P2)
### 🗳️ Campaign 9 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Invalid move: ORGANIZE piece piece_18 from p3_seat1 to p1_seat6
**[711] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_2` from `p2_seat5` → `p2_seat4`, `WITHDRAW` piece `piece_19` from `p3_office` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[712] SELECT_TILE** (P3) → Tile `07` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[713] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[714] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[715] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_14` from `p1_rostrum1` → `p2_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[716] SELECT_TILE** (P2) → Tile `11` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[717] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[718] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[719] MAKE_MOVES** (P1) — `REMOVE` piece `piece_0` from `p3_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[720] SELECT_TILE** (P1) → Tile `23` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[721] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[722] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[723] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_8` from `p1_seat1` → `p1_seat2`, `WITHDRAW` piece `piece_5` from `p3_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[724] SELECT_TILE** (P3) → Tile `18` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[725] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[726] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[727] MAKE_MOVES** (P2) — `ASSIST` piece `piece_5` from `community` → `p1_seat6`, `ORGANIZE` piece `piece_14` from `p2_rostrum2` → `p1_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[728] SELECT_TILE** (P2) → Tile `22` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[729] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[730] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_2` from `p2_seat4` → `p2_seat5`, `WITHDRAW` piece `piece_19` from `p3_rostrum1` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[731] SELECT_TILE** (P3) → Tile `06` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[732] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[733] BYSTANDER_DECISION** (P1) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, REMOVE, INFLUENCE] do not match any existing tile.
**[734] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_7` from `p2_seat6` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[735] SELECT_TILE** (P2) → Tile `01` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[736] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW] do not match any existing tile.
**[737] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_11` from `p1_seat4` → `community`, `INFLUENCE` piece `piece_2` from `p2_seat5` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[738] SELECT_TILE** (P1) → Tile `16` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[739] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[740] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_2` from `p2_seat4` → `p2_seat3`, `WITHDRAW` piece `piece_20` from `p3_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[741] SELECT_TILE** (P3) → Tile `03` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[742] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[743] MAKE_MOVES** (P2) — `REMOVE` piece `piece_0` from `p3_seat5` → `community`, `ORGANIZE` piece `piece_2` from `p2_seat4` → `p2_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[744] SELECT_TILE** (P2) → Tile `12` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[745] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[746] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_16` from `p1_seat3` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[747] SELECT_TILE** (P1) → Tile `20` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[748] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ADVANCE] do not match any existing tile.
**[749] MAKE_MOVES** (P2) — `ADVANCE` piece `piece_0` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[750] SELECT_TILE** (P2) → Tile `13` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[751] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ASSIST] do not match any existing tile.
**[752] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_11` from `community` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[753] SELECT_TILE** (P1) → Tile `02` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[754] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[755] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_2` from `p2_seat5` → `p2_seat6`, `ADVANCE` piece `piece_11` from `community` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[756] SELECT_TILE** (P3) → Tile `15` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[757] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[758] MAKE_MOVES** (P2) — `ORGANIZE` piece `piece_0` from `p2_seat3` → `p2_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[759] SELECT_TILE** (P2) → Tile `09` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[760] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_5` from `p1_seat6` → `p1_seat5`, `ADVANCE` piece `piece_11` from `p3_seat2` → `p3_rostrum1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[761] SELECT_TILE** (P3) → Tile `17` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[762] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[763] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_7` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[764] SELECT_TILE** (P1) → Tile `08` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[765] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[766] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_5` from `p1_seat5` → `p1_seat4`, `ADVANCE` piece `piece_11` from `p3_rostrum1` → `p3_office`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[767] SELECT_TILE** (P3) → Tile `24` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[768] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[769] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_7` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[770] SELECT_TILE** (P1) → Tile `05` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[771] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[772] MAKE_MOVES** (P3) — `REMOVE` piece `piece_0` from `p2_seat4` → `community`, `ORGANIZE` piece `piece_19` from `p3_seat3` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[773] SELECT_TILE** (P3) → Tile `14` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[774] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[775] MAKE_MOVES** (P1) — `ASSIST` piece `piece_0` from `community` → `p3_seat5`, `ORGANIZE` piece `piece_8` from `p1_seat2` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[776] SELECT_TILE** (P1) → Tile `21` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[777] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE, ORGANIZE] do not match any existing tile.
**[778] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_18` from `p3_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[779] SELECT_TILE** (P3) → Tile `10` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[780] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[781] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_20` from `p3_seat6` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[782] SELECT_TILE** (P3) → Tile `04` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[783] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[784] MAKE_MOVES** (P3) — `WITHDRAW` piece `piece_19` from `p3_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[785] SELECT_TILE** (P3) → Tile `19` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[786] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `BUREAUCRACY`

**[787] BUREAUCRACY_PURCHASE** (P1) — item `credibility`
**[788] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_19` → `p1_seat2`
**[789] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_20` → `p1_seat5`
**[790] END_BUREAUCRACY_TURN** (P1)
**[791] BUREAUCRACY_PURCHASE** (P2) — item `move_influence` piece `piece_20` → `p1_seat6`
**[792] BUREAUCRACY_PURCHASE** (P2) — item `move_organize` piece `piece_2` → `p2_seat5`
**[793] END_BUREAUCRACY_TURN** (P2)
**[794] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[795] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_0`
**[796] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[797] END_BUREAUCRACY_TURN** (P3)
### 🗳️ Campaign 10 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW, ADVANCE] do not match any existing tile.
**[798] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_2` from `p2_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[799] SELECT_TILE** (P2) → Tile `19` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[800] RECEIVER_DECISION** (P1) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[801] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[802] MAKE_MOVES** (P1) — `ORGANIZE` piece `piece_20` from `p1_seat6` → `p1_seat5`, `ASSIST` piece `piece_2` from `community` → `p2_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[803] SELECT_TILE** (P1) → Tile `24` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[804] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ADVANCE, WITHDRAW] do not match any existing tile.
**[805] MAKE_MOVES** (P3) — `ADVANCE` piece `piece_2` from `community` → `p3_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[806] SELECT_TILE** (P3) → Tile `21` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[807] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[808] MAKE_MOVES** (P1) — `ORGANIZE` piece `piece_20` from `p1_seat6` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[809] SELECT_TILE** (P1) → Tile `12` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[810] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[811] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[812] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_20` from `p1_seat5` → `p1_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[813] SELECT_TILE** (P2) → Tile `15` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[814] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE] do not match any existing tile.
**[815] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_5` from `p1_seat4` → `p1_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[816] SELECT_TILE** (P3) → Tile `02` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[817] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE] do not match any existing tile.
**[818] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_0` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[819] SELECT_TILE** (P2) → Tile `07` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[820] RECEIVER_DECISION** (P3) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE] do not match any existing tile.
**[821] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_0` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[822] SELECT_TILE** (P3) → Tile `08` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[823] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[824] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_0` from `p3_seat4` → `p3_seat5`, `WITHDRAW` piece `piece_5` from `p1_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[825] SELECT_TILE** (P1) → Tile `11` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[826] RECEIVER_DECISION** (P2) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[827] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [ADVANCE, ORGANIZE, INFLUENCE] do not match any existing tile.
**[828] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_20` from `p1_seat6` → `p1_seat5`, `ADVANCE` piece `piece_5` from `community` → `p2_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[829] SELECT_TILE** (P2) → Tile `18` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[830] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [INFLUENCE, ORGANIZE, ORGANIZE] do not match any existing tile.
**[831] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_8` from `p1_seat3` → `p1_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[832] SELECT_TILE** (P3) → Tile `09` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[833] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

**[834] MAKE_MOVES** (P2) — `WITHDRAW` piece `piece_6` from `p2_seat2` → `community`, `INFLUENCE` piece `piece_0` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[835] SELECT_TILE** (P2) → Tile `03` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[836] BYSTANDER_DECISION** (P3) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[837] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_2` from `p3_seat6` → `p3_seat5`, `WITHDRAW` piece `piece_7` from `p1_seat1` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[838] SELECT_TILE** (P1) → Tile `14` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[839] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[840] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[841] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_0` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[842] SELECT_TILE** (P3) → Tile `22` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[843] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[844] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_0` from `p3_seat4` → `p3_seat5`, `WITHDRAW` piece `piece_20` from `p1_seat5` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[845] SELECT_TILE** (P1) → Tile `13` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[846] RECEIVER_DECISION** (P3) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[847] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P3, retrying...): Illegal play: Moves [ORGANIZE, INFLUENCE, INFLUENCE] do not match any existing tile.
**[848] MAKE_MOVES** (P3) — `INFLUENCE` piece `piece_8` from `p1_seat4` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[849] SELECT_TILE** (P3) → Tile `23` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[850] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE, INFLUENCE] do not match any existing tile.
**[851] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_0` from `p3_seat4` → `p3_seat5`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[852] SELECT_TILE** (P2) → Tile `06` played to P3
> **Phase:** `SELECTING_TILE` → `MOVING`

**[853] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_0` from `p3_seat5` → `p3_seat4`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[854] SELECT_TILE** (P3) → Tile `16` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[855] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[856] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_0` from `p3_seat4` → `p3_seat5`, `WITHDRAW` piece `piece_8` from `p1_seat4` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[857] SELECT_TILE** (P1) → Tile `01` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[858] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[859] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_0` from `p3_seat4` → `p3_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[860] SELECT_TILE** (P3) → Tile `05` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[861] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE] do not match any existing tile.
**[862] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_0` from `p3_seat3` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[863] SELECT_TILE** (P2) → Tile `20` played to P1
> **Phase:** `SELECTING_TILE` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, ORGANIZE] do not match any existing tile.
**[864] MAKE_MOVES** (P1) — `INFLUENCE` piece `piece_0` from `p3_seat2` → `p3_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[865] SELECT_TILE** (P1) → Tile `04` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[866] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[867] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_14` from `p1_rostrum1` → `p1_seat3`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[868] SELECT_TILE** (P1) → Tile `10` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_CHALLENGES`

**[869] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[870] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_7` from `p1_seat1` → `p1_rostrum1`, `INFLUENCE` piece `piece_0` from `p3_seat1` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[871] SELECT_TILE** (P1) → Tile `17` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[872] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `BUREAUCRACY`

**[873] BUREAUCRACY_PURCHASE** (P1) — item `promote_seat` piece `piece_19`
**[874] BUREAUCRACY_PURCHASE** (P1) — item `move_advance` piece `piece_7` → `p1_rostrum1`
**[875] BUREAUCRACY_PURCHASE** (P1) — item `credibility`
**[876] BUREAUCRACY_PURCHASE** (P1) — item `credibility`
**[877] END_BUREAUCRACY_TURN** (P1)
**[878] BUREAUCRACY_PURCHASE** (P2) — item `promote_rostrum` piece `piece_1`
**[879] END_BUREAUCRACY_TURN** (P2)
**[880] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[881] BUREAUCRACY_PURCHASE** (P3) — item `credibility`
**[882] BUREAUCRACY_PURCHASE** (P3) — item `promote_seat` piece `piece_2`
**[883] END_BUREAUCRACY_TURN** (P3)
### 🗳️ Campaign 11 Begins

> **Phase:** `BUREAUCRACY` → `MOVING`

**[884] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_19` from `p1_seat2` → `community`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[885] SELECT_TILE** (P1) → Tile `22` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[886] RECEIVER_DECISION** (P2) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[887] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [INFLUENCE, INFLUENCE] do not match any existing tile.
**[888] MAKE_MOVES** (P2) — `INFLUENCE` piece `piece_0` from `p3_seat1` → `p3_seat2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[889] SELECT_TILE** (P2) → Tile `05` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[890] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[891] BYSTANDER_DECISION** (P3) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

> ⚠️ **Engine rejected move** (P1, retrying...): Illegal play: Moves [ORGANIZE, WITHDRAW] do not match any existing tile.
**[892] MAKE_MOVES** (P1) — `WITHDRAW` piece `piece_7` from `p1_rostrum1` → `p1_seat1`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[893] SELECT_TILE** (P1) → Tile `03` played to P3
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[894] RECEIVER_DECISION** (P3) → `ACCEPT_BLIND`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[895] BYSTANDER_DECISION** (P2) → `CHALLENGE`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[896] MAKE_MOVES** (P3) — `ORGANIZE` piece `piece_0` from `p3_seat1` → `p1_seat6`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[897] SELECT_TILE** (P3) → Tile `24` played to P1
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[898] RECEIVER_DECISION** (P1) → `ACCEPT`
> **Phase:** `AWAITING_RECEIPT` → `AWAITING_CHALLENGES`

**[899] BYSTANDER_DECISION** (P2) → `PASS`
> **Phase:** `AWAITING_CHALLENGES` → `MOVING`

**[900] MAKE_MOVES** (P1) — `ADVANCE` piece `piece_20` from `p1_seat5` → `p1_rostrum2`
> **Phase:** `MOVING` → `SELECTING_TILE`

**[901] SELECT_TILE** (P1) → Tile `20` played to P2
> **Phase:** `SELECTING_TILE` → `AWAITING_RECEIPT`

**[902] RECEIVER_DECISION** (P2) → `REJECT`
> **Phase:** `AWAITING_RECEIPT` → `MOVING`

> ⚠️ **Engine rejected move** (P2, retrying...): Illegal play: Moves [] do not match any existing tile.

---

## Outcome
💥 **TERMINATED** — Bot could not find a legal move after 50 attempts (P2, Phase: MOVING).

**Total actions:** 902 | **Campaigns:** 11

## Final Board State
**Pieces:**
  - `community`: P:piece_6, P:piece_10, P:piece_12, P:piece_13, P:piece_16, P:piece_18, P:piece_19, P:piece_21, P:piece_22, P:piece_23
  - `p1_rostrum1`: H:piece_7
  - `p1_seat3`: H:piece_14
  - `p1_seat4`: H:piece_8
  - `p1_seat5`: H:piece_20
  - `p1_seat6`: H:piece_0
  - `p2_office`: H:piece_3, M:piece_9, H:piece_15, H:piece_17
  - `p2_rostrum1`: P:piece_1
  - `p2_seat3`: H:piece_5
  - `p3_office`: H:piece_11
  - `p3_rostrum2`: H:piece_4
  - `p3_seat6`: P:piece_2

**Players:**
  - **P1** · Cred: 0 · Hand: [19, 21, 08, 16] · BankDown: [24] · BankUp: [05]
  - **P2** · Cred: 3 · Hand: [12, 02, 11, 09, 23, 17] · BankDown: [22] · BankUp: [20]
  - **P3** · Cred: 1 · Hand: [15, 18, 06, 04, 10, 07, 14, 13, 01] · BankDown: [] · BankUp: [03]