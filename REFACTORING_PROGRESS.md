# KRED Refactoring Progress

Last updated: 2025-11-22

## Current Status

**Active Phase**: Phase 3b - Utils Extraction ✅ COMPLETE
**Branch**: `refactoring`
**Tests Passing**: 425 tests (55 integration + 370 unit)

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

---

## 🚧 Next Steps

### Phase 4: Game Initialization Logic (Next)

Extract to `src/game/`:

- [ ] initializePlayers() - Creates players with dealt hands
- [ ] initializePieces() - Sets up pieces for drafting phase
- [ ] initializeCampaignPieces() - Initializes pieces for campaign

### Phase 5: Game Logic Extraction (Planned)

Extract to `src/game/`:

- [ ] Core game functions
- [ ] Validation logic
- [ ] State management

### Phase 5: Rules Engine (Planned)

Extract to `src/rules/`:

- [ ] Move validation
- [ ] Tile placement rules
- [ ] Rostrum support logic

---

## File Structure (Current)

```
kred-online/
├── src/
│   ├── __tests__/
│   │   └── config/
│   │       ├── constants.test.ts (9 tests)
│   │       ├── tiles.test.ts (9 tests)
│   │       ├── pieces.test.ts (15 tests)
│   │       ├── board.test.ts (40 tests)
│   │       ├── rules.test.ts (158 tests)
│   │       └── bureaucracy.test.ts (51 tests)
│   ├── config/
│   │   ├── constants.ts (PLAYER_OPTIONS, BOARD_IMAGE_URLS, TOTAL_TILES)
│   │   ├── tiles.ts (TILE_IMAGE_URLS, TILE_KREDCOIN_VALUES)
│   │   ├── pieces.ts (PIECE_TYPES, PIECE_COUNTS_BY_PLAYER_COUNT)
│   │   ├── board.ts (5 board layout configs)
│   │   ├── rules.ts (5 rule configs: DEFINED_MOVES, TILE_PLAY_OPTIONS, etc.)
│   │   └── bureaucracy.ts (2 bureaucracy menus)
│   └── types/
│       ├── index.ts (barrel export)
│       ├── game.ts (GameState, DropLocation, BankSpace)
│       ├── move.ts (Move types)
│       ├── piece.ts (Piece types)
│       ├── player.ts (Player types)
│       ├── tile.ts (Tile types)
│       ├── bureaucracy.ts (6 bureaucracy types) ✨ NEW
│       ├── challenge.ts (ChallengeState) ✨ NEW
│       └── played-tile.ts (PlayedTileState) ✨ NEW
│   └── utils/
│       ├── index.ts (barrel export) ✨ NEW
│       ├── positioning.ts (rotation, community circle) ✨ NEW
│       ├── formatting.ts (formatLocationId) ✨ NEW
│       └── array.ts (shuffle) ✨ NEW
├── game.ts (main file - being refactored, now ~3,087 lines)
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

### Overall Progress
- **Total lines extracted from game.ts**: ~1,336 lines
- **Lines remaining in game.ts**: ~3,087 lines (down from ~3,803 = 18.8% reduction)
- **Total tests passing**: 425 tests (55 integration + 370 unit)
- **Total commits**: 22 refactoring commits (14 config + 3 types + 5 utils)
- **All tests passing**: ✅ 425/425

---

## Progress Summary

**Phase 3b Complete!** 🎉

Successfully completed utility function extraction from game.ts:

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

**Next Phase**: Game initialization logic - extracting game setup functions (initializePlayers, initializePieces, initializeCampaignPieces) to `src/game/`.

---

## Notes

- Following test-first approach: write tests → extract → verify → commit
- Each extraction is atomic and independently committed
- Backwards compatibility maintained via re-exports in game.ts
- All changes pushed to feature branch
