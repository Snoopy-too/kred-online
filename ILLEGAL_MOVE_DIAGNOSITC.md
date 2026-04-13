# Why are "Illegal Move" errors occurring?

I've traced the logic covering `isLegalMoveSet`, `validateMovesForTilePlay`, and `determineMoveTypeFromLocations`. Here is exactly why players are erroneously getting the "Illegal Move" pop-up even when doing "exactly what was on the tile."

## 1. The `isLegalMoveSet` Check Breaks the "Blank" Tile 
Right now, `isLegalMoveSet()` loops strictly through `TILE_REQUIREMENTS` and checks if the executed moves map **exactly** to the `requiredMoves` array of a standard tile. 
*   **The Bug:** The Blank tile's requirement is arbitrarily set to `[]` (0 moves). If a player holds a Blank tile and decides to execute a valid wild combination that doesn't exist on standard tiles (e.g., `[REMOVE, WITHDRAW]`, or simply a single `[ASSIST]`), the engine sees the array length doesn't equal `0` (Blank expected) nor match any structured tile. It throws an `Illegal Move` and blocks the player from even opening their hand to select the Blank tile.

## 2. Intent vs Execution Disconnects (Player Mistakes treated as logic errs)
Because the KRED engine evaluates piece movement implicitly via `fromPosition` and `toPosition`, players accidentally perform mismatched move categorizations without realizing it.

*   **"I tried to REMOVE an opponent's piece but it said Illegal Move!"**
    *   **Reality:** The player clicked and dragged a *Pawn*. According to strict game rules, `REMOVE` only works on *Marks* or *Heels*. If they remove a Pawn, the engine parses the move as `null` (ignored). Thus, what the player thought was `[REMOVE, ADVANCE]` actually registers as just `[ADVANCE]`. Because `[ADVANCE]` maps to Tile 05/06, it skips the `Illegal` alert, but their hand doesn't have 05/06, confusing them.
*   **"I had [REMOVE, ADVANCE] but got an Illegal Move!"**
    *   **Reality:** The player mistakenly dragged their *OWN* piece to the community instead of an opponent's. The location parser registers `own_seat -> community` explicitly as a `WITHDRAW`. Their turn is calculated as `[WITHDRAW, ADVANCE]`. Because no single KRED tile possesses a `[WITHDRAW, ADVANCE]` mandate, `isLegalMoveSet` flags it strictly as an **Illegal Move**.
*   **Failed Adjacency Grabs:**
    *   When an `ORGANIZE` or `INFLUENCE` lateral move happens across seats, `areSeatsAdjacentFn` is triggered. If a player places a piece on a seat that isn't strictly mathematically adjacent (e.g. crossing boundaries improperly), the script evaluates it to `null`. Again, the player loses one of their two moves invisibly, mismatching their target tile.

### Recommended Fixes
1.  **Refactor `isLegalMoveSet` in `tile-matching.ts`**: Since `validateMovesForTilePlay` already asserts that the turn has a valid "max 1 M and max 1 O" architecture, `isLegalMoveSet` should allow *any* combination that fits that mold to support the Blank tile. 
2.  **Explicit UI Feedback:** Instead of ignoring invalid movements (like a Pawn remove, or a non-adjacent drop) by returning `null` during `calculateMoves`, the engine should raise a proactive alert at the drop-time, telling the player immediately: _"You can only REMOVE Marks or Heels"_ or _"Seats are not adjacent."_
