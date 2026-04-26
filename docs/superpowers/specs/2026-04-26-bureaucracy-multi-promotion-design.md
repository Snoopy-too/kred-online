# Bureaucracy Multi-Promotion Design

**Date:** 2026-04-26
**Branch:** supabase-multiplayer

## Overview

When a player purchases a Promotion action in the Bureaucracy phase, they can now promote multiple pieces in a single purchase — one click per piece — up to however many they can afford. Each promotion costs `item.price` kredcoin; the total deducted on Done is `item.price × count`.

## State

Add one new state to `useBureaucracy.ts`:

```ts
const [promotionHistory, setPromotionHistory] = useState<Array<{
  promotedPieceId: string;
  promotedPieceOriginalLocationId: string;
  communityPieceId: string;
  communityPieceOriginalLocationId: string;
}>>([]);
```

Reset `promotionHistory` to `[]` in `resetAction`, `nextBureaucracyPlayer`, and `selectMenuItem` — the same places `bureaucracyMoves` is cleared.

Expose `promotionHistory` and `setPromotionHistory` from `useBureaucracy` and thread them into `useBureaucracyHandlers` alongside existing state.

## Handler Changes (`useBureaucracyHandlers.ts`)

### `handleBureaucracyPiecePromote`

- **Cap check:** Before performing the promotion, compute `maxPromotions = floor(playerState.remainingKredcoin / item.price)`. If `promotionHistory.length >= maxPromotions`, ignore the click silently.
- **On success:** After `performPromotion` returns `result.pieces`, push an entry onto `promotionHistory` recording the two piece IDs and their original locations (needed for undo).
- Existing `setPieces(result.pieces)` call is unchanged.

### New `handleUndoLastPromotion`

- Pop the last entry from `promotionHistory`.
- Restore both pieces to their original positions/locations using current `pieces` state.
- Call `setPieces` with the corrected pieces array.

### `handleDoneWithBureaucracyAction` — PROMOTION branch

- Replace the `piecesMovedToCommunity.length > 1` rejection with acceptance of any count ≥ 1.
- Run `validatePromotion` on each promoted piece by iterating `promotionHistory` (using snapshot pieces for the "before" state).
- If all valid: deduct `item.price × promotionHistory.length` from `remainingKredcoin` and remove the equivalent tile count from `player.bureaucracyTiles`.
- If any invalid: revert to snapshot as before.

### `handleResetBureaucracyAction`

- Clear `promotionHistory` (set to `[]`) in addition to existing behaviour.

## UI Changes (`BureaucracyScreen.tsx`)

In the "Action in Progress" panel, when `isPromotionPurchase`, show a promotion status sub-section:

- **Counter:** `"{X} promoted · {Y} more affordable"` where `X = promotionHistory.length`, `Y = floor(remainingKredcoin / item.price) - X`.
- **Running cost:** `"₭-{item.price × X} will be deducted"` (hidden when X = 0).
- **Undo button:** Visible only when `X > 0`. Calls `onUndoLastPromotion`. Sits alongside Reset and Done.
- **Done button:** Disabled (grayed, `!isMyTurn || X === 0`) until at least one promotion has been made.

Piece click behaviour on the board is unchanged — clicking a promotable piece immediately swaps it, the counter updates.

## Validation Summary

| Condition | Result |
|---|---|
| `promotionHistory.length === 0` on Done | Done button disabled — unreachable |
| Any promotion invalid (wrong location/type) | Revert to snapshot, show error |
| All promotions valid | Deduct `price × count`, return to menu |
| Click while at max affordable | Silently ignored |

## Files Touched

- `src/hooks/useBureaucracy.ts` — new `promotionHistory` state + reset wiring
- `src/hooks/useBureaucracyHandlers.ts` — cap check, history push, undo handler, updated Done logic, reset clear
- `src/components/screens/BureaucracyScreen.tsx` — counter, running cost, Undo button, Done disabled state
- `src/providers/HandlersProvider.tsx` — expose `onUndoLastPromotion` alongside existing promotion handler (if needed)

## Out of Scope

- Multiplayer sync: promotion swaps are already synced via piece state; no additional sync needed.
- Undo of individual (non-last) promotions: LIFO only.
- Changing the price structure of promotion menu items.
