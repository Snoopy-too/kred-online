# KRED Refactoring Progress

Last updated: 2025-11-25

## Current Status

**Active Phase**: Phase 5 Complete - Ready for Phase 6 ✅
**Branch**: `refactoring`
**Tests Passing**: 606 tests (55 integration + 551 unit)
**PR #7**: Phase 5 Game Logic & Rules Extraction - Merged ✅

---

## ✅ Completed

### Phase 1: Test Infrastructure

- [x] Vitest setup with 88 passing tests
- [x] Integration tests (55 tests)
- [x] Unit tests for initial configs (33 tests)

### Phase 2a: Config Extraction - Constants

- [x] `src/config/constants.ts` - PLAYER_OPTIONS, BOARD_IMAGE_URLS, TOTAL_TILES (9 tests)
- [x] `src/config/tiles.ts` - TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES (9 tests)
- [x] `src/config/pieces.ts` - PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT (15 tests)

### Phase 2b: Config Extraction - Board Layout

- [x] `DROP_LOCATIONS_BY_PLAYER_COUNT` - 245 lines, 11 tests
- [x] `TILE_SPACES_BY_PLAYER_COUNT` - 32 lines, 7 tests
- [x] `BANK_SPACES_BY_PLAYER_COUNT` - 101 lines, 10 tests
- [x] `CREDIBILITY_LOCATIONS_BY_PLAYER_COUNT` - 38 lines, 7 tests
- [x] `PLAYER_PERSPECTIVE_ROTATIONS` - 6 lines, 5 tests

**Total extracted to `src/config/board.ts`**: 422 lines, 40 tests

### Phase 2c: Config Extraction - Rules

- [x] `DEFINED_MOVES` - 43 tests
- [x] `TILE_PLAY_OPTIONS` - 31 tests
- [x] `TILE_REQUIREMENTS` - 32 tests
- [x] `ROSTRUM_SUPPORT_RULES` - 23 tests
- [x] `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` - 29 tests

**Total extracted to `src/config/rules.ts`**: 594 lines, 158 tests

### Phase 2d: Config Extraction - Bureaucracy

- [x] `THREE_FOUR_PLAYER_BUREAUCRACY_MENU` - 25 tests
- [x] `FIVE_PLAYER_BUREAUCRACY_MENU` - 26 tests

**Total extracted to `src/config/bureaucracy.ts`**: 178 lines, 51 tests

### Phase 3: Type Extraction - Additional Types ✅ COMPLETE

- [x] `src/types/bureaucracy.ts` - 6 type definitions, 12 tests
  - BureaucracyItemType, BureaucracyMoveType, PromotionLocationType
  - BureaucracyMenuItem, BureaucracyPurchase, BureaucracyPlayerState
- [x] `src/types/challenge.ts` - ChallengeState interface, 7 tests
- [x] `src/types/played-tile.ts` - PlayedTileState interface, 7 tests

**Total extracted in Phase 3**: 3 new type files, 26 tests

### Phase 3b: Utils Extraction - Pure Utility Functions ✅ COMPLETE

- [x] `src/utils/positioning.ts` - 3 exports, 24 tests
  - BOARD_CENTERS constant
  - isPositionInCommunityCircle() function
  - calculatePieceRotation() function
- [x] `src/utils/formatting.ts` - formatLocationId() function, 26 tests
- [x] `src/utils/array.ts` - shuffle() function, 12 tests
- [x] `src/utils/index.ts` - barrel export for all utils

**Total extracted in Phase 3b**: 3 new util files + barrel export, 62 tests

### Phase 4: Game Initialization Logic ✅ COMPLETE

- [x] `src/game/initialization.ts` - 3 initialization functions, 34 tests
  - initializePlayers() - Creates players with shuffled, dealt hands
  - initializePieces() - Sets up Mark pieces at seats 1, 3, 5 for drafting
  - initializeCampaignPieces() - Initializes all pieces for campaign start
- [x] `src/game/index.ts` - barrel export for game module

**Total extracted in Phase 4**: 373 lines, 34 tests

### Phase 5: Game Logic & Rules Extraction ✅ COMPLETE

#### Game Logic (src/game/)
- [x] `src/game/state-snapshots.ts` - 2 functions, 21 tests
  - createGameStateSnapshot() - Deep copy of game state
  - getChallengeOrder() - Challenge order calculation
- [x] `src/game/locations.ts` - 4 functions, 23 tests
  - findNearestVacantLocation() - Find vacant drop locations
  - getLocationIdFromPosition() - Position-to-location mapping
  - getPlayerIdFromLocationId() - Extract player ID from location
  - isLocationOwnedByPlayer() - Check location ownership

#### Rules (src/rules/)
- [x] `src/rules/credibility.ts` - 2 functions, 13 tests
  - deductCredibility() - Reduce player credibility
  - handleCredibilityLoss() - Process credibility loss scenarios
- [x] `src/rules/win-conditions.ts` - 2 functions, 21 tests
  - checkPlayerWinCondition() - Verify player victory
  - checkBureaucracyWinCondition() - Check bureaucracy phase winners
- [x] `src/rules/adjacency.ts` - 5 functions, 16 tests
  - getNextPlayerClockwise() - Next player in turn order
  - getPrevPlayerClockwise() - Previous player in turn order
  - areSeatsAdjacent() - Check seat adjacency
  - getAdjacentSeats() - Get adjacent seat IDs
  - canMoveFromCommunity() - Community hierarchy rules
- [x] `src/rules/rostrum.ts` - 9 functions, 27 tests
  - getPlayerRostrumRules() - Get rostrum configuration
  - getRostrumSupportRule() - Get support seat requirements
  - countPiecesInSeats() - Count pieces in seats
  - areSupportingSeatsFullForRostrum() - Check rostrum accessibility
  - countPiecesInPlayerRostrums() - Count pieces in both rostrums
  - areBothRostrumsFilledForPlayer() - Check office accessibility
  - areRostrumsAdjacent() - Check rostrum adjacency
  - getAdjacentRostrum() - Get connected rostrum
  - validateAdjacentRostrumMovement() - Validate rostrum-to-rostrum moves
- [x] `src/rules/movement.ts` - 2 functions, 26 tests
  - validatePieceMovement() - Validate piece movement rules
  - validateMoveType() - Determine move type (ADVANCE, ASSIST, etc.)
- [x] `src/rules/index.ts` - barrel export for rules module

**Total extracted in Phase 5**: 872 lines, 147 tests (26 functions across 7 modules)

---

## 🚧 Next Steps

### Phase 6: React Hooks & Components (Next)

Extract to `src/hooks/` and `src/components/`:

- [ ] Custom React hooks (useGameState, useDragAndDrop, etc.)
- [ ] Screen components (PlayerSelection, Drafting, Campaign, Bureaucracy)

---

## File Structure (Current)

```
kred-online/
├── src/
│   ├── __tests__/
│   │   ├── config/
│   │   │   ├── constants.test.ts (9 tests)
│   │   │   ├── tiles.test.ts (9 tests)
│   │   │   ├── pieces.test.ts (15 tests)
│   │   │   ├── board.test.ts (40 tests)
│   │   │   ├── rules.test.ts (158 tests)
│   │   │   └── bureaucracy.test.ts (51 tests)
│   │   ├── game/
│   │   │   ├── initialization.test.ts (34 tests)
│   │   │   ├── state-snapshots.test.ts (21 tests)
│   │   │   └── locations.test.ts (23 tests)
│   │   ├── rules/
│   │   │   ├── credibility.test.ts (13 tests)
│   │   │   ├── win-conditions.test.ts (21 tests)
│   │   │   ├── adjacency.test.ts (16 tests)
│   │   │   ├── rostrum.test.ts (27 tests)
│   │   │   └── movement.test.ts (26 tests)
│   │   ├── types/
│   │   │   ├── bureaucracy.test.ts (12 tests)
│   │   │   ├── challenge.test.ts (7 tests)
│   │   │   └── played-tile.test.ts (7 tests)
│   │   ├── utils/
│   │   │   ├── positioning.test.ts (24 tests)
│   │   │   ├── formatting.test.ts (26 tests)
│   │   │   └── array.test.ts (12 tests)
│   │   └── *.test.tsx (55 integration tests)
│   ├── config/
│   │   ├── constants.ts (PLAYER_OPTIONS, BOARD_IMAGE_URLS, TOTAL_TILES)
│   │   ├── tiles.ts (TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES)
│   │   ├── pieces.ts (PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT)
│   │   ├── board.ts (5 board layout configs)
│   │   ├── rules.ts (5 rule configs: DEFINED_MOVES, TILE_PLAY_OPTIONS, etc.)
│   │   └── bureaucracy.ts (2 bureaucracy menus)
│   ├── game/
│   │   ├── index.ts (barrel export)
│   │   ├── initialization.ts (3 functions)
│   │   ├── state-snapshots.ts (2 functions)
│   │   └── locations.ts (4 functions)
│   ├── rules/
│   │   ├── index.ts (barrel export)
│   │   ├── credibility.ts (2 functions)
│   │   ├── win-conditions.ts (2 functions)
│   │   ├── adjacency.ts (5 functions)
│   │   ├── rostrum.ts (9 functions)
│   │   └── movement.ts (2 functions)
│   └── types/
│       ├── index.ts (barrel export)
│       ├── game.ts (GameState, DropLocation, BankSpace)
│       ├── move.ts (Move types)
│       ├── piece.ts (Piece types)
│       ├── player.ts (Player types)
│       ├── tile.ts (Tile types)
│       ├── bureaucracy.ts (6 bureaucracy types)
│       ├── challenge.ts (ChallengeState)
│       └── played-tile.ts (PlayedTileState)
│   └── utils/
│       ├── index.ts (barrel export)
│       ├── positioning.ts (rotation, community circle)
│       ├── formatting.ts (formatLocationId)
│       └── array.ts (shuffle)
├── game.ts (main file - being refactored, now ~1,933 lines)
└── REFACTORING_STRATEGY_V2.md (detailed strategy)
```

---

## Key Metrics

### Phase 2 (Config Extraction)

- **Lines extracted from game.ts**: ~1,194 lines (422 board + 594 rules + 178 bureaucracy)
- **Test coverage added**: 249 new unit tests (40 board + 158 rules + 51 bureaucracy)
- **Config files created**: 6 files (constants, tiles, pieces, board, rules, bureaucracy)

### Phase 3 (Type Extraction)

- **Lines extracted from game.ts**: ~56 lines (bureaucracy + challenge + played-tile types)
- **Test coverage added**: 26 new unit tests (12 bureaucracy + 7 challenge + 7 played-tile)
- **Type files created**: 3 files (bureaucracy, challenge, played-tile)

### Phase 3b (Utils Extraction)

- **Lines extracted from game.ts**: ~86 lines (positioning + formatting + array utilities)
- **Test coverage added**: 62 new unit tests (24 positioning + 26 formatting + 12 array)
- **Util files created**: 4 files (positioning, formatting, array, index)

### Phase 4 (Game Initialization)

- **Lines extracted from game.ts**: ~246 lines (initializePlayers + initializePieces + initializeCampaignPieces)
- **Test coverage added**: 34 new unit tests
- **Game files created**: 2 files (initialization, index)

### Phase 5 (Game Logic & Rules)

- **Lines extracted from game.ts**: ~872 lines (state-snapshots + locations + 5 rules modules)
- **Test coverage added**: 147 new unit tests (21 + 23 + 13 + 21 + 16 + 27 + 26)
- **Game files created**: 2 files (state-snapshots, locations)
- **Rules files created**: 6 files (credibility, win-conditions, adjacency, rostrum, movement, index)
- **Functions extracted**: 26 functions across 7 modules

### Overall Progress

- **Total lines extracted from game.ts**: ~2,454 lines (1,194 config + 56 types + 86 utils + 246 init + 872 logic/rules)
- **Lines remaining in game.ts**: ~1,933 lines (down from ~3,803 = 49.2% reduction)
- **Total tests passing**: 606 tests (55 integration + 551 unit)
- **Total commits**: 32 refactoring commits (14 config + 3 types + 5 utils + 2 game init + 8 logic/rules)
- **All tests passing**: ✅ 606/606

---

## Progress Summary

**Phase 5 Complete!** 🎉

Successfully completed game logic and rules extraction from game.ts:

### Phase 2 (Config Extraction) ✅

- ✅ Basic constants (tiles, pieces, player options)
- ✅ Board layouts for 3, 4, and 5 players
- ✅ Game rules (defined moves, tile requirements, rostrum rules)
- ✅ Bureaucracy menus for different player counts

### Phase 3 (Type Extraction) ✅

- ✅ Bureaucracy types (6 type definitions)
- ✅ Challenge types (ChallengeState)
- ✅ Played tile types (PlayedTileState)

### Phase 3b (Utils Extraction) ✅

- ✅ Positioning utilities (BOARD_CENTERS, calculatePieceRotation, isPositionInCommunityCircle)
- ✅ Formatting utilities (formatLocationId)
- ✅ Array utilities (shuffle)

### Phase 4 (Game Initialization) ✅

- ✅ initializePlayers() - Creates players with shuffled, dealt hands
- ✅ initializePieces() - Sets up Mark pieces at seats 1, 3, 5 for drafting
- ✅ initializeCampaignPieces() - Initializes all pieces for campaign start

### Phase 5 (Game Logic & Rules) ✅

- ✅ Game state snapshots - Deep copy and challenge order
- ✅ Location utilities - Finding, mapping, and checking locations
- ✅ Credibility system - Deduction and loss handling
- ✅ Win conditions - Campaign and bureaucracy victory checks
- ✅ Adjacency rules - Seat adjacency and community hierarchy
- ✅ Rostrum logic - Support rules, accessibility, and movement validation
- ✅ Movement validation - Piece movement rules and move type determination

**Next Phase**: React hooks and component extraction to improve code organization and reusability.

---

## Notes

- Following test-first approach: write tests → extract → verify → commit
- Each extraction is atomic and independently committed
- Backwards compatibility maintained via re-exports in game.ts
- All changes pushed to feature branch

### Recent Merges

- **PR #4**: Phase 2c & 2d - Rules & Bureaucracy Config (209 tests) ✅ Merged
- **PR #5**: Phase 3 - Type & Utility Extraction (88 tests) ✅ Merged
- **PR #6**: Phase 4 - Game Initialization (34 tests) ✅ Merged
- **PR #7**: Phase 5 - Game Logic & Rules (147 tests) ✅ Merged
- **PR #6**: Phase 4 - Game Initialization (34 tests) ✅ Merged
- Each extraction is atomic and independently committed
- NO backwards compatibility re-exports (single import path per symbol)
- All changes pushed to feature branch

### Recent Merges

- **PR #4**: Phase 2c & 2d - Rules & Bureaucracy Config (209 tests) ✅ Merged
- **PR #5**: Phase 3 - Type & Utility Extraction (88 tests) ✅ Merged
