---
title: Bureaucracy Action Feasibility Graying
date: 2026-04-26
status: approved
---

## Overview

Gray out Bureaucracy action buttons that are impossible to execute given the current board/piece state, in addition to the existing affordability check.

## Scope

- New exported function `canExecuteAction` in `src/game/bureaucracy.ts`
- Update `BureaucracyScreen.tsx` to use it for all action buttons
- Remove the now-redundant `isCredibilityAtMax` inline variable from the component

## Function Signature

```typescript
export function canExecuteAction(
  item: BureaucracyMenuItem,
  pieces: Piece[],
  currentPlayer: Player,
  playerCount: number
): boolean
```

Located in `src/game/bureaucracy.ts`. Uses existing helpers from `src/rules/adjacency.ts` (`canMoveFromCommunity`, `getAdjacentSeats`) and the `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` config.

## Feasibility Rules Per Action Type

### CREDIBILITY
Feasible when `currentPlayer.credibility < 3`. Replaces the existing `isCredibilityAtMax` check in the component.

### MOVE: ADVANCE
Feasible when **any** of:
- A community piece passes `canMoveFromCommunity` AND any own seat (`p{id}_seat1–6`) is vacant
- Own seats 1, 2, 3 are all occupied AND own rostrum1 is vacant
- Own seats 4, 5, 6 are all occupied AND own rostrum2 is vacant
- Own rostrum1 occupied AND own rostrum2 occupied AND own office vacant

### MOVE: WITHDRAW
Feasible when **any** of:
- Any own seat has a piece (seat→community always works)
- Own rostrum1 occupied AND any of own seats 1–3 vacant
- Own rostrum2 occupied AND any of own seats 4–6 vacant
- Own office occupied AND (own rostrum1 vacant OR own rostrum2 vacant)

### MOVE: REMOVE
Feasible when any Mark exists in any opponent seat (location matches `p{N}_seat*` where N ≠ playerId).

### MOVE: INFLUENCE
Feasible when **any** of:
- An opponent non-Pawn piece is in a seat that has at least one adjacent vacant seat (via `getAdjacentSeats`)
- An opponent non-Pawn piece is in a rostrum, and that rostrum's adjacent rostrum (per `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT`) is vacant

### MOVE: ASSIST
Feasible when an eligible community piece exists (`canMoveFromCommunity` passes for at least one community piece) AND at least one opponent seat is vacant.

### MOVE: ORGANIZE
Feasible when **any** of:
- Any piece in the player's own seat location has at least one adjacent vacant seat (via `getAdjacentSeats`)
- Any piece in the player's own rostrum location has a vacant adjacent cross-player rostrum (per `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT`)

### PROMOTION: OFFICE
Feasible when:
- (Own office has a Mark AND community has any Heel) OR (Own office has a Heel AND community has any Pawn)

### PROMOTION: ROSTRUM
Feasible when:
- (Any own rostrum has a Mark AND community has any Heel) OR (Any own rostrum has a Heel AND community has any Pawn)

### PROMOTION: SEAT
Feasible when:
- (Any own seat has a Mark AND community has any Heel) OR (Any own seat has a Heel AND community has any Pawn)

Note: `canMoveFromCommunity` hierarchy restrictions do **not** apply to promotions (the swap is not a standard piece movement).

## Component Changes

In `BureaucracyScreen.tsx`:

1. Import `canExecuteAction` from `../../game`
2. For every action button (both MOVE grid blocks and the PROMOTION/CREDIBILITY block), replace:
   ```ts
   const isEnabled = canAfford && !isCredibilityAtMax && isMyTurn;
   ```
   with:
   ```ts
   const isEnabled = canAfford && canExecuteAction(item, pieces, currentPlayer, playerCount) && isMyTurn;
   ```
3. Remove the `isCredibilityAtMax` variable entirely.

## Player Context

`currentPlayer` passed to `canExecuteAction` is the active turn player (not the viewer). `pieces` comes from `useRoster()`, already available in the component.

## Player Count Coverage

Must work for 3, 4, and 5 player modes. The `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` config and `getAdjacentSeats` already handle all three counts.

## Out of Scope

- No tooltip explaining *why* an action is grayed out
- No changes to move validation logic
- No new files
