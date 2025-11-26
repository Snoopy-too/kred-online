# Phase 7e: CampaignScreen Extraction - Sub-Phase Plan

**Total Component Size**: 2,743 lines (lines 103-2845 in App.tsx)
**Complexity**: HIGH RISK - Largest component with extensive state and UI
**Strategy**: Break into 10 atomic, testable sub-phases

---

## Overview

The CampaignScreen is the core game UI component. To maintain context and avoid getting lost, we'll extract it in logical sections, testing each step before proceeding.

### Component Structure Analysis

1. **Props Interface & State** (lines 103-270) - ~170 lines
2. **Utility Functions & Calculations** (lines 270-400) - ~130 lines
3. **Drag-and-Drop Handlers** (lines 400-650) - ~250 lines
4. **Main Board Render** (lines 650-1100) - ~450 lines
5. **Player Hand UI** (lines 1100-1300) - ~200 lines
6. **Side Panel Controls** (lines 1300-1600) - ~300 lines
7. **Modals: Waiting & Receiver Decision** (lines 1600-1900) - ~300 lines
8. **Modals: Challenge & Take Advantage** (lines 1900-2300) - ~400 lines
9. **Modals: Perfect Tile & Move Check** (lines 2300-2600) - ~300 lines
10. **Piece Tracker & Test Mode** (lines 2600-2845) - ~245 lines

---

## Sub-Phase Breakdown

### **Sub-Phase 7e.1**: Create base component file with props interface

**Goal**: Extract props interface and component shell  
**Lines**: 103-270 (~170 lines)  
**Test Strategy**: Component renders with minimal props  
**Commit**: `refactor(7e.1): create CampaignScreen base with props interface`

**Contents**:

- Full props interface (~100+ props)
- Component declaration
- Empty return statement
- All necessary imports (React, types, config)

**Test File Update**:

- Add 1 test: "renders without crashing with minimal props"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~200 lines with imports
npm run build  # Should succeed
```

---

### **Sub-Phase 7e.2**: Add state hooks and utility functions

**Goal**: Add component state and helper functions  
**Lines**: 270-400 (~130 lines)  
**Test Strategy**: State initialization works correctly  
**Commit**: `refactor(7e.2): add CampaignScreen state and utilities`

**Contents**:

- useState hooks (isDraggingTile, boardMousePosition, draggedPieceInfo, dropIndicator)
- useRef for log container
- calculatePlayerKredcoin utility
- Board rotation calculations
- Tile space calculations (unoccupied spaces)

**Test File Update**:

- Add 2 tests:
  - "initializes state correctly"
  - "calculates Kredcoin from banked tiles"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~330 lines
npm run build
```

---

### **Sub-Phase 7e.3**: Add drag-and-drop handlers

**Goal**: Implement all drag-and-drop event handlers  
**Lines**: 400-650 (~250 lines)  
**Test Strategy**: Handler functions exist and can be called  
**Commit**: `refactor(7e.3): add CampaignScreen drag-and-drop handlers`

**Contents**:

- handleDragOverBoard
- handleDropOnBoard
- handleDropOnTileSpace
- handleDragStartPiece
- handleDragEndPiece
- handleDragStartTile
- handleDragStartBoardTile
- handleDragStartDummyTile
- handleDragEndDummyTile
- handleRotateDummyTile
- handleMouseMoveOnBoard
- handleMouseLeaveBoard

**Test File Update**:

- Add 3 tests:
  - "handles piece drag start"
  - "handles tile drag start"
  - "handles drop on board"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~580 lines
npm run build
```

---

### **Sub-Phase 7e.4**: Render main board with image and overlays

**Goal**: Add board container, image, and grid overlay  
**Lines**: 650-800 (~150 lines)  
**Test Strategy**: Board renders with correct image and overlays  
**Commit**: `refactor(7e.4): add CampaignScreen board container and overlays`

**Contents**:

- Main board container with perspective
- Player turn title
- Board image with rotation
- Grid overlay (conditional)
- Test mode coordinate display

**Test File Update**:

- Existing tests should pass:
  - "renders campaign phase title"
  - "renders game board image"
  - "displays grid overlay toggle"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~730 lines
npm run build
```

---

### **Sub-Phase 7e.5**: Add board pieces and tiles rendering

**Goal**: Render pieces, board tiles, banked tiles, credibility  
**Lines**: 800-1100 (~300 lines)  
**Test Strategy**: Pieces and tiles render on board  
**Commit**: `refactor(7e.5): add CampaignScreen board pieces and tiles`

**Contents**:

- Drop indicator rendering
- Tile receiving spaces (unoccupied)
- Board tiles (with face-up/down logic)
- Banked tiles
- Credibility displays
- Pieces (with rotation and highlighting)
- Dummy tile (test mode)

**Test File Update**:

- Existing tests should pass:
  - "renders pieces on board"
  - "renders tile receiving spaces"
  - "displays credibility for all players"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~1030 lines
npm run build
```

---

### **Sub-Phase 7e.6**: Add player hand UI

**Goal**: Render player hand with tiles and action buttons  
**Lines**: 1100-1300 (~200 lines)  
**Test Strategy**: Hand displays tiles and buttons work  
**Commit**: `refactor(7e.6): add CampaignScreen player hand UI`

**Contents**:

- Player hand header with buttons (Reset Turn, End Turn)
- Hand tile display (draggable tiles)
- Status message (correction required, tile played, etc.)
- Test mode: Other players' tiles section

**Test File Update**:

- Existing tests should pass:
  - "displays player hand with tiles"
  - "renders end turn button"
  - "shows undo button when tile is played"
  - "calls onEndTurn when end turn button clicked"
  - "calls onResetTurn when undo button clicked"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~1230 lines
npm run build
```

---

### **Sub-Phase 7e.7**: Add side panel (log, bonus move, test controls)

**Goal**: Add right column with game log and controls  
**Lines**: 1300-1600 (~300 lines)  
**Test Strategy**: Side panel components render  
**Commit**: `refactor(7e.7): add CampaignScreen side panel controls`

**Contents**:

- New Game button
- Game Log (expandable)
- Bonus Move notification modal
- Test Mode controls:
  - Board rotation toggle
  - Grid overlay toggle
  - Check Move button
- Credibility rotation adjuster (test mode)

**Test File Update**:

- Existing tests should pass:
  - "displays bonus move modal when shown"
  - "displays game log toggle button"
  - "renders board rotation toggle in test mode"
  - "renders grid overlay toggle in test mode"
  - "shows check move button in test mode when tile played"
  - "calls onSetBoardRotationEnabled when toggle clicked"
  - "calls onSetShowGridOverlay when toggle clicked"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~1530 lines
npm run build
```

---

### **Sub-Phase 7e.8**: Add waiting overlay and receiver decision modal

**Goal**: Implement waiting state and receiver modals  
**Lines**: 1600-1900 (~300 lines)  
**Test Strategy**: Modals display with correct content  
**Commit**: `refactor(7e.8): add CampaignScreen waiting and receiver modals`

**Contents**:

- Waiting overlay (while other player decides)
- Receiver decision modal:
  - Accept/Reject buttons
  - Private view toggle
  - Tile display logic

**Test File Update**:

- Existing tests should pass:
  - "displays tile transaction modal with accept/reject"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~1830 lines
npm run build
```

---

### **Sub-Phase 7e.9**: Add challenge and take advantage modals

**Goal**: Implement bystander challenge and take advantage flow  
**Lines**: 1900-2300 (~400 lines)  
**Test Strategy**: Complex modal flows render correctly  
**Commit**: `refactor(7e.9): add CampaignScreen challenge and take advantage modals`

**Contents**:

- Bystander Challenge modal (Accept/Challenge)
- Take Advantage modal:
  - Initial choice (give tile vs purchase)
  - Tile selection UI
  - Purchase menu (6 bureaucracy moves)
  - Confirmation buttons

**Test File Update**:

- Existing tests should pass:
  - "displays take advantage modal"
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~2230 lines
npm run build
```

---

### **Sub-Phase 7e.10**: Add final modals and piece tracker

**Goal**: Complete component with remaining UI elements  
**Lines**: 2300-2845 (~545 lines)  
**Test Strategy**: All tests pass, component complete  
**Commit**: `refactor(7e.10): complete CampaignScreen with final modals`

**Contents**:

- Perfect Tile modal
- Move Check Result modal (test mode)
- Piece Tracker (expandable panel)
- Credibility rules explanation
- Closing tags and final JSX

**Test File Update**:

- All existing tests should pass (20 total):
  - "displays perfect tile modal when shown"
  - Test mode features
  - All 20 original tests
- Run: `npm test CampaignScreen.test.tsx`

**Verification**:

```bash
wc -l src/components/screens/CampaignScreen.tsx  # ~2800 lines
npm run build
npm test  # All 842 tests should pass (822 + 20 new)
```

---

### **Sub-Phase 7e.11**: Update App.tsx to use extracted component

**Goal**: Remove old component and import new one  
**Test Strategy**: Full app still works with extracted component  
**Commit**: `refactor(7e.11): integrate extracted CampaignScreen into App`

**Changes**:

1. Add import: `import CampaignScreen from "./src/components/screens/CampaignScreen";`
2. Remove lines 103-2845 (old component definition)
3. App.tsx should use `<CampaignScreen />` with props

**Verification**:

```bash
wc -l App.tsx  # Should be ~4077 lines (6820 - 2743)
npm run build  # Should succeed
npm test  # All 842 tests should pass
git add -A
git commit -m "refactor(7e.11): integrate extracted CampaignScreen into App"
git push origin refactoring
```

---

## Safety Measures

### After Each Sub-Phase:

1. ✅ Run build: `npm run build`
2. ✅ Run tests: `npm test CampaignScreen.test.tsx`
3. ✅ Verify line count
4. ✅ Commit with descriptive message
5. ✅ Confirm build succeeds after commit

### Rollback Plan:

If any sub-phase fails:

```bash
git reset --hard HEAD~1  # Undo last commit
# Fix issues, then retry sub-phase
```

### Context Management:

- Each sub-phase is ~150-400 lines (manageable)
- Tests provide immediate feedback
- Incremental commits allow easy rollback
- Clear boundaries between sections

---

## Progress Tracking

**Sub-Phase Checklist**:

- [ ] 7e.1: Base component with props interface
- [ ] 7e.2: State hooks and utilities
- [ ] 7e.3: Drag-and-drop handlers
- [ ] 7e.4: Board container and overlays
- [ ] 7e.5: Board pieces and tiles
- [ ] 7e.6: Player hand UI
- [ ] 7e.7: Side panel controls
- [ ] 7e.8: Waiting and receiver modals
- [ ] 7e.9: Challenge and take advantage modals
- [ ] 7e.10: Final modals and piece tracker
- [ ] 7e.11: Update App.tsx integration

**Total Commits**: 11 atomic commits
**Estimated Time**: 45-60 minutes (4-5 min per sub-phase)
**Risk Mitigation**: Test-driven, incremental, reversible

---

## Success Criteria

Phase 7e complete when:

- ✅ All 11 sub-phases committed
- ✅ CampaignScreen.tsx exists (~2,800 lines)
- ✅ App.tsx reduced to ~4,077 lines
- ✅ All 842 tests passing (822 + 20 new)
- ✅ Build succeeds
- ✅ All changes pushed to GitHub
- ✅ No broken imports or dependencies

**Next Phase**: 7f - Extract board components
