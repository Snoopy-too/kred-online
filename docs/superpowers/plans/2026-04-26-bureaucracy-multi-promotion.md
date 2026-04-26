# Bureaucracy Multi-Promotion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow players to click multiple pieces during a single Promotion purchase, paying `price × count` and seeing a live counter + undo button.

**Architecture:** Add a `promotionHistory` stack (array of swap records) to `useBureaucracy`. Each piece click pushes a record; undo pops and reverses. On Done, validate all entries and deduct `price × count`. The UI reads `promotionHistory.length` to drive the counter, cost line, Undo button, and Done gate.

**Tech Stack:** React, TypeScript, Vitest, @testing-library/react

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/types/bureaucracy.ts` |
| Modify | `src/hooks/useBureaucracy.ts` |
| Modify | `src/hooks/useBureaucracyHandlers.ts` |
| Modify | `src/hooks/useAppWrappers.ts` |
| Modify | `src/App.tsx` |
| Modify | `src/components/screens/BureaucracyScreen.tsx` |
| Modify | `src/__tests__/hooks/useBureaucracy.test.ts` |
| Modify | `src/__tests__/game/bureaucracy.test.ts` |

---

### Task 1: Add `PromotionHistoryEntry` type and extend `useBureaucracy` state

**Files:**
- Modify: `src/types/bureaucracy.ts`
- Modify: `src/hooks/useBureaucracy.ts`
- Modify: `src/__tests__/hooks/useBureaucracy.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `src/__tests__/hooks/useBureaucracy.test.ts` inside `describe("Initial State")`:

```ts
it("should initialize promotionHistory as empty array", () => {
  const { result } = renderHook(() => useBureaucracy());
  expect(result.current.promotionHistory).toEqual([]);
});

it("should expose setPromotionHistory", () => {
  const { result } = renderHook(() => useBureaucracy());
  expect(typeof result.current.setPromotionHistory).toBe("function");
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd C:/xampp/htdocs/kred
npx vitest run src/__tests__/hooks/useBureaucracy.test.ts
```

Expected: FAIL — `promotionHistory` is not a property on the hook result.

- [ ] **Step 3: Add `PromotionHistoryEntry` to `src/types/bureaucracy.ts`**

Add after `BureaucracyPlayerState`:

```ts
/**
 * One promotion swap performed during a multi-promotion action.
 * Stored in LIFO order so the last entry can be reversed on undo.
 */
export interface PromotionHistoryEntry {
  promotedPieceId: string;
  promotedPieceOriginalLocationId: string;
  communityPieceId: string;
  communityPieceOriginalLocationId: string;
}
```

- [ ] **Step 4: Add the type export to `src/types/index.ts` (or wherever types are re-exported)**

Check which file re-exports from `types/bureaucracy.ts`:

```bash
grep -rn "PromotionLocationType\|BureaucracyPurchase" src/types/index.ts src/types.ts 2>/dev/null | head -5
```

Add `PromotionHistoryEntry` to that same export line.

- [ ] **Step 5: Add `promotionHistory` state to `src/hooks/useBureaucracy.ts`**

Add the import at the top alongside existing type imports:

```ts
import type { PromotionHistoryEntry } from "../types";
```

Add state inside `useBureaucracy()` alongside the other `useState` declarations:

```ts
const [promotionHistory, setPromotionHistory] = useState<PromotionHistoryEntry[]>([]);
```

- [ ] **Step 6: Reset `promotionHistory` in `resetAction`, `nextBureaucracyPlayer`, and `selectMenuItem`**

In `resetAction` (around line 235):
```ts
const resetAction = () => {
  setShowBureaucracyMenu(true);
  setCurrentBureaucracyPurchase(null);
  setBureaucracyMoves([]);
  setBureaucracyValidationError(null);
  setPromotionHistory([]);  // ADD THIS
};
```

In `nextBureaucracyPlayer` (around line 245):
```ts
const nextBureaucracyPlayer = () => {
  setCurrentBureaucracyPlayerIndex((prev) =>
    prev + 1 < bureaucracyTurnOrder.length ? prev + 1 : 0
  );
  setShowBureaucracyMenu(true);
  setCurrentBureaucracyPurchase(null);
  setBureaucracyMoves([]);
  setBureaucracyValidationError(null);
  setPromotionHistory([]);  // ADD THIS
};
```

In `selectMenuItem` (around line 138), after `setBureaucracyMoves([])`:
```ts
setPromotionHistory([]);  // ADD THIS
```

- [ ] **Step 7: Expose from the return object**

In the `return { ... }` at the bottom of `useBureaucracy`, add alongside `bureaucracyMoves`:

```ts
promotionHistory,
setPromotionHistory,
```

- [ ] **Step 8: Run tests**

```bash
npx vitest run src/__tests__/hooks/useBureaucracy.test.ts
```

Expected: all tests PASS (including the two new ones).

- [ ] **Step 9: Commit**

```bash
git add src/types/bureaucracy.ts src/hooks/useBureaucracy.ts src/__tests__/hooks/useBureaucracy.test.ts
git commit -m "feat: add promotionHistory state for multi-promotion tracking"
```

---

### Task 2: Update `useBureaucracyHandlers` interface and prop threading

**Files:**
- Modify: `src/hooks/useBureaucracyHandlers.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `promotionHistory` and `setPromotionHistory` to the props interface**

In `src/hooks/useBureaucracyHandlers.ts`, find `interface useBureaucracyHandlersProps` and add two fields alongside `bureaucracyMoves`:

```ts
promotionHistory: PromotionHistoryEntry[];
setPromotionHistory: (history: PromotionHistoryEntry[]) => void;
```

Add the import at the top:

```ts
import type { PromotionHistoryEntry } from "../types";
```

- [ ] **Step 2: Destructure the new props in `useBureaucracyHandlers`**

In the function signature destructure block, add alongside `bureaucracyMoves`:

```ts
promotionHistory,
setPromotionHistory,
```

- [ ] **Step 3: Thread the new values from `App.tsx`**

In `App.tsx`, find the `useBureaucracy()` destructure (line ~70). Add `promotionHistory, setPromotionHistory` to it:

```ts
const { ..., promotionHistory, setPromotionHistory } = useBureaucracy();
```

Find the `useBureaucracyHandlers({ ... })` call (line ~219). Add the two new props:

```ts
promotionHistory,
setPromotionHistory,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to the new props.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBureaucracyHandlers.ts src/App.tsx
git commit -m "feat: thread promotionHistory into useBureaucracyHandlers"
```

---

### Task 3: Update `handleBureaucracyPiecePromote` with cap check and history push

**Files:**
- Modify: `src/hooks/useBureaucracyHandlers.ts`
- Modify: `src/__tests__/game/bureaucracy.test.ts`

- [ ] **Step 1: Write a test verifying two sequential `performPromotion` calls work**

Add to `src/__tests__/game/bureaucracy.test.ts` inside `describe("performPromotion")`:

```ts
it("should handle two sequential promotions correctly", () => {
  const pieces = [
    createPiece("mark1", "Mark", "p1_seat1"),
    createPiece("mark2", "Mark", "p1_seat2"),
    createPiece("heel1", "Heel", "community_1"),
    createPiece("heel2", "Heel", "community_2"),
  ];

  // First promotion
  const result1 = performPromotion(pieces, "mark1");
  expect(result1.success).toBe(true);
  const mark1After = result1.pieces.find(p => p.id === "mark1");
  expect(mark1After?.locationId).toMatch(/^community/);

  // Second promotion on updated pieces
  const result2 = performPromotion(result1.pieces, "mark2");
  expect(result2.success).toBe(true);
  const mark2After = result2.pieces.find(p => p.id === "mark2");
  expect(mark2After?.locationId).toMatch(/^community/);
});
```

- [ ] **Step 2: Run test**

```bash
npx vitest run src/__tests__/game/bureaucracy.test.ts
```

Expected: PASS (game logic already handles this correctly).

- [ ] **Step 3: Replace `handleBureaucracyPiecePromote` in `useBureaucracyHandlers.ts`**

Find the existing `handleBureaucracyPiecePromote` (around line 593) and replace it entirely:

```ts
const handleBureaucracyPiecePromote = React.useCallback((pieceId: string) => {
  if (
    !currentBureaucracyPurchase ||
    currentBureaucracyPurchase.item.type !== "PROMOTION"
  ) {
    return;
  }

  // Cap: don't allow more promotions than the player can afford
  const currentPlayerId = bureaucracyTurnOrder[currentBureaucracyPlayerIndex];
  const playerState = bureaucracyStates.find(s => s.playerId === currentPlayerId);
  if (!playerState) return;

  const maxPromotions = Math.floor(
    playerState.remainingKredcoin / currentBureaucracyPurchase.item.price
  );
  if (promotionHistory.length >= maxPromotions) return;

  const result = performPromotion(pieces, pieceId);

  if (!result.success) {
    setBureaucracyValidationError(result.reason || "Promotion failed");
    return;
  }

  // Record which two pieces swapped so we can undo if needed
  const pieceToPromote = pieces.find(p => p.id === pieceId);
  const communityPieceBefore = pieces.find(
    p => p.id !== pieceId &&
      result.pieces.find(rp => rp.id === p.id)?.locationId === pieceToPromote?.locationId
  );

  if (pieceToPromote && communityPieceBefore) {
    setPromotionHistory([
      ...promotionHistory,
      {
        promotedPieceId: pieceId,
        promotedPieceOriginalLocationId: pieceToPromote.locationId!,
        communityPieceId: communityPieceBefore.id,
        communityPieceOriginalLocationId: communityPieceBefore.locationId!,
      },
    ]);
  }

  setPieces(result.pieces);
}, [
  currentBureaucracyPurchase,
  bureaucracyTurnOrder,
  currentBureaucracyPlayerIndex,
  bureaucracyStates,
  promotionHistory,
  setPromotionHistory,
  pieces,
  setBureaucracyValidationError,
  setPieces,
]);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBureaucracyHandlers.ts src/__tests__/game/bureaucracy.test.ts
git commit -m "feat: allow multiple promotions per purchase with cap check"
```

---

### Task 4: Add `handleUndoLastPromotion`

**Files:**
- Modify: `src/hooks/useBureaucracyHandlers.ts`

- [ ] **Step 1: Add the handler after `handleBureaucracyPiecePromote`**

```ts
const handleUndoLastPromotion = React.useCallback(() => {
  if (promotionHistory.length === 0) return;

  const last = promotionHistory[promotionHistory.length - 1];

  // Restore both pieces to their pre-swap positions
  const promotedPiece = pieces.find(p => p.id === last.promotedPieceId);
  const communityPiece = pieces.find(p => p.id === last.communityPieceId);

  if (!promotedPiece || !communityPiece) return;

  const restoredPieces = pieces.map(p => {
    if (p.id === last.promotedPieceId) {
      return {
        ...p,
        locationId: last.promotedPieceOriginalLocationId,
        position: communityPiece.position,
        rotation: communityPiece.rotation,
      };
    }
    if (p.id === last.communityPieceId) {
      return {
        ...p,
        locationId: last.communityPieceOriginalLocationId,
        position: promotedPiece.position,
        rotation: promotedPiece.rotation,
      };
    }
    return p;
  });

  setPieces(restoredPieces);
  setPromotionHistory(promotionHistory.slice(0, -1));
}, [promotionHistory, setPromotionHistory, pieces, setPieces]);
```

- [ ] **Step 2: Add `handleUndoLastPromotion` to the return object**

In the `return { ... }` at the bottom of `useBureaucracyHandlers`, add:

```ts
handleUndoLastPromotion,
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useBureaucracyHandlers.ts
git commit -m "feat: add undo-last-promotion handler"
```

---

### Task 5: Update `handleDoneWithBureaucracyAction` for multi-promotion

**Files:**
- Modify: `src/hooks/useBureaucracyHandlers.ts`

The PROMOTION branch of `handleDoneWithBureaucracyAction` currently:
1. Diffs pieces against snapshot to find `piecesMovedToCommunity`
2. Rejects if `length > 1`
3. Validates the single promoted piece
4. Deducts `item.price`

Replace the entire PROMOTION branch (starting at `} else if (currentBureaucracyPurchase.item.type === "PROMOTION") {`).

- [ ] **Step 1: Replace the PROMOTION branch**

Find the block (around line 154–196 in `useBureaucracyHandlers.ts`) and replace it:

```ts
} else if (currentBureaucracyPurchase.item.type === "PROMOTION") {
  const snapshot = bureaucracySnapshot;
  if (!snapshot) {
    validationMessage = "No snapshot available for validation";
  } else if (promotionHistory.length === 0) {
    validationMessage =
      "No promotion was performed. Please click a piece to promote it.";
  } else {
    // Validate every promotion in the history
    let allValid = true;
    for (const entry of promotionHistory) {
      const validation = validatePromotion(
        pieces,
        entry.promotedPieceId,
        currentBureaucracyPurchase.item.promotionLocation!,
        currentPlayerId,
        snapshot.pieces
      );
      if (!validation.isValid) {
        allValid = false;
        validationMessage = validation.reason;
        break;
      }
    }
    if (allValid) isValid = true;
  }
```

- [ ] **Step 2: Compute `finalPrice` before the state updates**

Just before the `setBureaucracyStates(updatedStates)` call (after the `isValid` check passes), add:

```ts
const finalPrice =
  currentBureaucracyPurchase.item.type === "PROMOTION"
    ? currentBureaucracyPurchase.item.price * promotionHistory.length
    : currentBureaucracyPurchase.item.price;
```

- [ ] **Step 3: Use `finalPrice` in the kredcoin deduction**

Find where `remainingKredcoin` is reduced (around line 273):

```ts
remainingKredcoin:
  s.remainingKredcoin - currentBureaucracyPurchase.item.price,
```

Change to:

```ts
remainingKredcoin: s.remainingKredcoin - finalPrice,
```

- [ ] **Step 4: Use `finalPrice` in the tile deduction**

Find the tile removal loop (around line 296):

```ts
let remainingPrice = currentBureaucracyPurchase.item.price;
```

Change to:

```ts
let remainingPrice = finalPrice;
```

- [ ] **Step 5: Add `promotionHistory` to the `useCallback` dependency array of `handleDoneWithBureaucracyAction`**

Find the deps array at the end of `handleDoneWithBureaucracyAction` and add `promotionHistory`.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useBureaucracyHandlers.ts
git commit -m "feat: validate and price multi-promotion on Done"
```

---

### Task 6: Clear `promotionHistory` on Reset

**Files:**
- Modify: `src/hooks/useBureaucracyHandlers.ts`

- [ ] **Step 1: Update `handleResetBureaucracyAction`**

Find `handleResetBureaucracyAction` (around line 445) and add the clear:

```ts
const handleResetBureaucracyAction = React.useCallback(() => {
  if (bureaucracySnapshot) {
    setPieces(bureaucracySnapshot.pieces);
    setBoardTiles(bureaucracySnapshot.boardTiles);
  }
  setBureaucracyMoves([]);
  setBureaucracyValidationError(null);
  setPromotionHistory([]);  // ADD THIS
}, [bureaucracySnapshot, setPieces, setBoardTiles, setBureaucracyMoves, setBureaucracyValidationError, setPromotionHistory]);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useBureaucracyHandlers.ts
git commit -m "feat: clear promotionHistory on bureaucracy action reset"
```

---

### Task 7: Wire undo handler through `useAppWrappers` and `App.tsx`

**Files:**
- Modify: `src/hooks/useAppWrappers.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `wrappedBureaucracyUndoLastPromotion` to `useAppWrappers.ts`**

Find the block of bureaucracy wrappers (around line 76, next to `wrappedBureaucracyPiecePromote`). Add a new wrapper after it:

```ts
const wrappedBureaucracyUndoLastPromotion = React.useCallback(async () => {
  bureaucracyHandlers.handleUndoLastPromotion();
  // Undo is a local-only operation; no multiplayer sync needed
  // (the host tracks its own promotionHistory independently)
}, [bureaucracyHandlers]);
```

- [ ] **Step 2: Add it to the return object of `useAppWrappers`**

Find the `return { ... }` in `useAppWrappers` (around line 321) and add:

```ts
wrappedBureaucracyUndoLastPromotion,
```

- [ ] **Step 3: Add `onUndoLastPromotion` and `promotionHistory` to `bureaucracyValue` in `App.tsx`**

Find the `bureaucracyValue` object (around line 454) and add:

```ts
onUndoLastPromotion: (wrappers as any).wrappedBureaucracyUndoLastPromotion,
promotionHistory,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAppWrappers.ts src/App.tsx
git commit -m "feat: wire undo-last-promotion into app wrappers and bureaucracy context"
```

---

### Task 8: Update `BureaucracyScreen.tsx` UI

**Files:**
- Modify: `src/components/screens/BureaucracyScreen.tsx`

- [ ] **Step 1: Add new fields to the `BureaucracyScreenHandlers` interface**

Find the interface at the top of the file and add:

```ts
onUndoLastPromotion: () => void;
promotionHistory: Array<{
  promotedPieceId: string;
  promotedPieceOriginalLocationId: string;
  communityPieceId: string;
  communityPieceOriginalLocationId: string;
}>;
```

- [ ] **Step 2: Destructure the new values from `useBureaucracyScreenHandlers`**

Add to the destructure block (around line 47):

```ts
onUndoLastPromotion,
promotionHistory,
```

- [ ] **Step 3: Derive display values**

Just below the `isPromotionPurchase` line (around line 87), add:

```ts
const promotionCount = promotionHistory.length;
const maxPromotions = isPromotionPurchase && currentPurchase && playerState
  ? Math.floor(playerState.remainingKredcoin / currentPurchase.item.price)
  : 0;
const promotionsRemaining = maxPromotions - promotionCount;
const promotionCost = isPromotionPurchase && currentPurchase
  ? currentPurchase.item.price * promotionCount
  : 0;
```

Note: `playerState` is already computed on line 80–82 as the state for `currentPlayerId`. Use that same variable.

- [ ] **Step 4: Replace the "Action in Progress" panel content**

Find the "Action in Progress" panel (around line 642, `{!showPurchaseMenu && currentPurchase && (`). Replace the `<p>` description and button group with:

```tsx
{!showPurchaseMenu && currentPurchase && (
  <div className="bg-blue-900/90 rounded-lg shadow-2xl border-2 border-blue-500 p-6">
    <h2 className="text-2xl font-bold text-center mb-4 text-blue-300">
      Perform Your Action
    </h2>
    <p className="text-center text-lg mb-4">
      {currentPurchase.item.type === "PROMOTION" && (
        <>
          Promote a{" "}
          {currentPurchase.item.promotionLocation === "OFFICE"
            ? "piece in your Office"
            : currentPurchase.item.promotionLocation === "ROSTRUM"
              ? "piece in one of your Rostrums"
              : "piece in one of your Seats"}
        </>
      )}
      {currentPurchase.item.type === "MOVE" && (
        <>Perform a {currentPurchase.item.moveType} move</>
      )}
      {currentPurchase.item.type === "CREDIBILITY" && (
        <>Your credibility has been restored</>
      )}
    </p>

    {/* Promotion counter — only shown during promotion actions */}
    {isPromotionPurchase && (
      <div className="mb-4 text-center space-y-1">
        <p className="text-blue-200 font-semibold">
          {promotionCount} promoted · {promotionsRemaining} more affordable
        </p>
        {promotionCount > 0 && (
          <p className="text-yellow-300 text-sm">
            ₭-{promotionCost} will be deducted
          </p>
        )}
      </div>
    )}

    <div className="flex justify-center gap-3">
      <button
        onClick={() => isMyTurn && onResetAction()}
        disabled={!isMyTurn}
        className={`px-6 py-3 text-white font-bold rounded-lg transition-colors shadow-lg ${
          isMyTurn ? "bg-amber-600 hover:bg-amber-500" : "bg-gray-600 cursor-not-allowed opacity-50"
        }`}
      >
        Reset
      </button>
      {isPromotionPurchase && promotionCount > 0 && (
        <button
          onClick={() => isMyTurn && onUndoLastPromotion()}
          disabled={!isMyTurn}
          className={`px-6 py-3 text-white font-bold rounded-lg transition-colors shadow-lg ${
            isMyTurn ? "bg-orange-600 hover:bg-orange-500" : "bg-gray-600 cursor-not-allowed opacity-50"
          }`}
        >
          Undo
        </button>
      )}
      <button
        onClick={() => isMyTurn && onDoneWithAction()}
        disabled={!isMyTurn || (isPromotionPurchase && promotionCount === 0)}
        className={`px-8 py-3 text-white font-bold rounded-lg transition-colors shadow-lg ${
          isMyTurn && (!isPromotionPurchase || promotionCount > 0)
            ? "bg-blue-600 hover:bg-blue-500"
            : "bg-gray-600 cursor-not-allowed opacity-50"
        }`}
      >
        Done
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/screens/BureaucracyScreen.tsx
git commit -m "feat: show promotion counter, cost, and Undo button in Bureaucracy UI"
```

---

## Manual Verification Checklist

After all tasks are committed, verify in the browser:

1. Buy "Promote in seat" — counter shows "0 promoted · N more affordable", Done is grayed.
2. Click an eligible piece — counter updates to "1 promoted · (N-1) more affordable", cost line appears, Undo and Done appear active.
3. Click Undo — counter goes back to 0, piece returns to original position, Done grays again.
4. Click two pieces — counter shows 2, cost = 2 × price, Done active.
5. Click Done — kredcoin deducted by 2 × price, return to menu, kredcoin display updates.
6. Click Reset at any point — all pieces revert, counter resets to 0.
7. If player has exactly 1 promotion worth of kredcoin left: after 1 click, clicking another piece does nothing.
8. Repeat for "Promote in rostrum" and "Promote in office" — same behaviour.
